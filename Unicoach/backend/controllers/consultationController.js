const crypto = require('crypto');
const mongoose = require('mongoose');
const Consultation = require('../models/Consultation');
const ConsultationAvailability = require('../models/ConsultationAvailability');
const {
  GROUPS, PRICE_INR, DURATION_MIN, SERVICES, SLOT_TIMES, DEFAULT_WEEKLY, BOOK_AHEAD_DAYS, PENDING_HOLD_MIN, istToDate,
} = require('../config/consultations');
const { createRazorpayOrder, verifyRazorpayPayment } = require('../unicoach/services/paymentService');
const { sendEmail } = require('../utils/email');
const escapeHtml = require('../utils/escapeHtml');

const BLOCKING = ['confirmed', 'completed', 'no_show'];

// On startup: give bookings made before the slot lock existed their flag, then make sure the
// one-booking-per-slot index is built (a failure here is logged loudly, not swallowed)
if (typeof Consultation.init === 'function' && mongoose.connection) {
  Promise.resolve()
    .then(() => Consultation.updateMany({ active: { $exists: false } }, [{ $set: { active: { $not: [{ $in: ['$status', ['cancelled', 'payment_conflict']] }] } } }]))
    .then(() => Consultation.init())
    .catch((e) => console.error('❌ [Consultation] Could not build the one-booking-per-slot index:', e.message));
}
const holdCutoff = () => new Date(Date.now() - PENDING_HOLD_MIN * 60 * 1000);
// Slots taken by a paid booking, or held by someone who is paying right now
const takenFilter = (extra = {}) => ({
  ...extra,
  active: { $ne: false },
  $or: [{ status: { $in: BLOCKING } }, { status: 'payment_pending', createdAt: { $gte: holdCutoff() } }],
});
// A payment hold older than PENDING_HOLD_MIN gives its slot back
const releaseExpiredHolds = (match = {}) => Consultation.updateMany(
  { ...match, status: 'payment_pending', active: true, createdAt: { $lt: holdCutoff() } },
  { $set: { active: false } },
);
const isDuplicate = (err) => err && (err.code === 11000 || /E11000/.test(String(err.message)));

const istToday = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
const addDays = (ymd, n) => {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const prettyWhen = (date, time) => istToDate(date, time).toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit',
});

const TIME_RX = /^([01]\d|2[0-3]):[0-5]\d$/;
const cleanTimes = (arr) => [...new Set((Array.isArray(arr) ? arr : []).filter((t) => TIME_RX.test(t)))].sort();

// The team's hours: saved in admin, or the defaults until someone sets them
const loadAvailability = async () => {
  const doc = await ConsultationAvailability.findOne({ key: 'default' }).lean();
  return {
    weekly: doc?.weekly && Object.keys(doc.weekly).length ? doc.weekly : DEFAULT_WEEKLY,
    overrides: doc?.overrides || [],
  };
};
// Start times offered on one IST date: a date override wins over the weekly hours
const slotsForDate = (avail, date) => {
  const o = avail.overrides.find((x) => x.date === date);
  if (o) return o.closed ? [] : cleanTimes(o.slots);
  const dow = new Date(`${date}T12:00:00+05:30`).getUTCDay();
  return cleanTimes(avail.weekly[String(dow)]);
};

/** GET /api/consultations/config: services, price and the open slots for the next weeks */
exports.getConfig = async (req, res) => {
  try {
    const from = istToday();
    const to = addDays(from, BOOK_AHEAD_DAYS);
    const taken = await Consultation.find(takenFilter({ date: { $gte: from, $lte: to } })).select('date time').lean();
    const takenSet = new Set(taken.map((t) => `${t.date} ${t.time}`));
    const avail = await loadAvailability();
    // A slot must start at least an hour from now
    const earliest = Date.now() + 60 * 60 * 1000;

    const days = [];
    for (let i = 0; i <= BOOK_AHEAD_DAYS; i += 1) {
      const date = addDays(from, i);
      const slots = slotsForDate(avail, date).filter((t) => istToDate(date, t).getTime() > earliest && !takenSet.has(`${date} ${t}`));
      days.push({ date, slots });
    }
    return res.json({ price: PRICE_INR, durationMin: DURATION_MIN, groups: GROUPS, services: SERVICES, days });
  } catch (err) {
    console.error('Consultation config error:', err);
    return res.status(500).json({ message: 'Could not load open slots' });
  }
};

/** POST /api/consultations: hold the slot and open a Razorpay order */
exports.create = async (req, res) => {
  try {
    const { service, date, time, name, email, phone, notes, source } = req.body || {};
    const svc = SERVICES.find((s) => s.key === service);
    if (!svc) return res.status(400).json({ message: 'Please pick a service' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || !TIME_RX.test(String(time))) {
      return res.status(400).json({ message: 'Please pick a day and a time' });
    }
    if (!slotsForDate(await loadAvailability(), date).includes(time)) {
      return res.status(400).json({ message: 'That time is not open. Please pick another slot.' });
    }
    if (!String(name || '').trim() || !/^\S+@\S+\.\S+$/.test(String(email || '')) || String(phone || '').replace(/\D/g, '').length < 10) {
      return res.status(400).json({ message: 'Please add your name, a valid email and phone number' });
    }
    const startsAt = istToDate(date, time);
    if (startsAt.getTime() < Date.now() + 60 * 60 * 1000 || date > addDays(istToday(), BOOK_AHEAD_DAYS)) {
      return res.status(400).json({ message: 'That time is no longer available' });
    }
    const TAKEN = 'Someone just booked this slot. Please pick another time.';
    await releaseExpiredHolds({ date, time });
    if (await Consultation.exists(takenFilter({ date, time }))) {
      return res.status(409).json({ message: TAKEN });
    }

    const ref = `CONS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const free = PRICE_INR === 0;
    // Free calls skip Razorpay and are confirmed as soon as the slot is saved
    const order = free ? null : await createRazorpayOrder({
      amountINR: PRICE_INR,
      bookingRef: ref,
      notes: { type: 'consultation', service: svc.key, slot: `${date} ${time}` },
    });

    let booking;
    try {
      booking = await Consultation.create({
      ref,
      service: svc.key,
      serviceLabel: svc.label,
      date,
      time,
      startsAt,
      durationMin: DURATION_MIN,
      name: String(name).trim().slice(0, 120),
      email: String(email).trim().toLowerCase().slice(0, 160),
      phone: String(phone).trim().slice(0, 30),
      notes: String(notes || '').trim().slice(0, 1500),
      amountINR: PRICE_INR,
      status: free ? 'confirmed' : 'payment_pending',
      payment: free ? {} : { orderId: order.orderId, simulated: Boolean(order.simulated) },
      source: String(source || '').slice(0, 80),
      });
    } catch (e) {
      // Two people pressed pay for the same slot at the same moment: the database lets only one through
      if (isDuplicate(e)) return res.status(409).json({ message: TAKEN });
      throw e;
    }
    if (free) {
      sendConfirmation(booking);
      return res.status(201).json({ ref, free: true });
    }
    return res.status(201).json({
      ref,
      order: { orderId: order.orderId, amount: order.amount, currency: order.currency, keyId: order.keyId },
      prefill: { name, email, contact: phone },
    });
  } catch (err) {
    console.error('Consultation create error:', err);
    return res.status(500).json({ message: err.message || 'Could not start the booking' });
  }
};

const sendConfirmation = (c) => sendEmail({
  to: c.email,
  subject: `Your UniCoach consultation is booked: ${prettyWhen(c.date, c.time)}`,
  html: `<p>Hi ${escapeHtml(c.name)},</p>
<p>Your <b>${escapeHtml(c.serviceLabel)}</b> call with the UniCoach team is confirmed for <b>${prettyWhen(c.date, c.time)} (India time)</b>, ${c.durationMin} minutes.</p>
<p>We will send the call link before the session. Booking reference: <b>${c.ref}</b>.${c.amountINR > 0 ? ` Amount paid: ₹${c.amountINR}.` : ''}</p>
<p>Need to change the time? Just reply to this email.</p>
<p>Team UniCoach</p>`,
  kind: 'transactional',
}).catch((e) => console.error('Consultation email failed:', e.message));

// Mark a held booking as paid. Used by the browser (verify) and the Razorpay webhook (tab closed).
// Returns 'confirmed' | 'already' | 'conflict' | 'not_payable'.
const confirmPaid = async (c, paymentId) => {
  if (['confirmed', 'completed', 'no_show'].includes(c.status)) return 'already';
  if (c.status !== 'payment_pending') return 'not_payable';
  c.payment.paymentId = paymentId;
  c.payment.paidAt = new Date();
  c.status = 'confirmed';
  if (!c.active) {
    // The hold had run out. Take the slot back if it is still free; if not, flag it for a refund.
    c.active = true;
    try {
      await c.save();
    } catch (e) {
      if (!isDuplicate(e)) throw e;
      await Consultation.updateOne({ _id: c._id }, { $set: { status: 'payment_conflict', active: false, 'payment.paymentId': paymentId, 'payment.paidAt': new Date() } });
      console.error(`[Consultation] ${c.ref}: paid after the hold expired and the slot was taken. Refund ${paymentId}.`);
      return 'conflict';
    }
  } else {
    await c.save();
  }
  sendConfirmation(c);
  return 'confirmed';
};

/** POST /api/consultations/:ref/verify: check the payment and confirm the call */
exports.verify = async (req, res) => {
  try {
    const c = await Consultation.findOne({ ref: req.params.ref });
    if (!c) return res.status(404).json({ message: 'Booking not found' });
    if (['confirmed', 'completed', 'no_show'].includes(c.status)) return res.json({ ok: true, ref: c.ref });
    if (c.status !== 'payment_pending') return res.status(400).json({ message: 'This booking can no longer be paid' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (razorpay_order_id && razorpay_order_id !== c.payment.orderId) {
      return res.status(400).json({ message: 'Payment does not match this booking' });
    }
    const v = await verifyRazorpayPayment({
      orderId: c.payment.orderId,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      expectedAmountINR: c.amountINR,
    });
    if (!v.verified) return res.status(400).json({ message: v.error || 'Payment could not be verified' });

    const result = await confirmPaid(c, v.simulated ? `pay_sim_${Date.now()}` : razorpay_payment_id);
    if (result === 'conflict') {
      return res.status(409).json({ message: 'Your payment went through, but this slot was taken while you were paying. We will refund you in full within 2 working days, or call you to pick a new time.' });
    }
    return res.json({ ok: true, ref: c.ref });
  } catch (err) {
    console.error('Consultation verify error:', err);
    return res.status(500).json({ message: 'Could not confirm the payment' });
  }
};

/** Razorpay webhook fallback (student closed the tab after paying). Returns a status string or null. */
exports.confirmFromWebhook = async (payment) => {
  const ref = payment?.notes?.bookingRef;
  const c = await Consultation.findOne(ref && /^CONS-/.test(ref) ? { ref } : { 'payment.orderId': payment?.order_id });
  if (!c) return null;
  if (c.payment.orderId && payment.order_id && c.payment.orderId !== payment.order_id) return 'consultation_order_mismatch';
  if (Number(payment.amount) !== Math.round(c.amountINR * 100)) return 'consultation_amount_mismatch';
  const result = await confirmPaid(c, payment.id);
  return `consultation_${result}`;
};

/** GET /api/admin/consultations: every call plus the numbers for the analytics strip */
exports.adminList = async (req, res) => {
  try {
    const { status, service, from, to, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    else filter.status = { $ne: 'payment_pending' };
    if (service) filter.service = service;
    if (from || to) filter.date = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
    if (q) {
      const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { ref: rx }];
    }
    const [items, all] = await Promise.all([
      Consultation.find(filter).sort({ startsAt: -1 }).limit(1000).lean(),
      Consultation.find({}).select('status service time date amountINR createdAt').lean(),
    ]);

    const paid = all.filter((c) => c.status !== 'payment_pending' && c.status !== 'cancelled');
    const today = istToday();
    const count = (arr, key) => arr.reduce((m, c) => ({ ...m, [c[key]]: (m[c[key]] || 0) + 1 }), {});
    const last30 = [];
    for (let i = 29; i >= 0; i -= 1) {
      const d = addDays(today, -i);
      last30.push({ date: d, calls: paid.filter((c) => c.date === d).length });
    }
    const stats = {
      totalPaid: paid.length,
      revenueINR: paid.reduce((s, c) => s + (c.amountINR || 0), 0),
      upcoming: all.filter((c) => c.status === 'confirmed' && c.date >= today).length,
      today: all.filter((c) => c.status === 'confirmed' && c.date === today).length,
      completed: all.filter((c) => c.status === 'completed').length,
      noShow: all.filter((c) => c.status === 'no_show').length,
      cancelled: all.filter((c) => c.status === 'cancelled').length,
      needsRefund: all.filter((c) => c.status === 'payment_conflict').length,
      abandoned: all.filter((c) => c.status === 'payment_pending' && new Date(c.createdAt) < holdCutoff()).length,
      byService: SERVICES.map((s) => ({ key: s.key, label: s.label, count: paid.filter((c) => c.service === s.key).length })),
      bySlot: [...new Set([...SLOT_TIMES, ...paid.map((c) => c.time)])].sort().map((t) => ({ time: t, count: count(paid, 'time')[t] || 0 })),
      last30,
    };
    return res.json({ items, stats, services: SERVICES });
  } catch (err) {
    console.error('Admin consultations error:', err);
    return res.status(500).json({ message: 'Could not load consultations' });
  }
};

/** PATCH /api/admin/consultations/:id: status, counsellor and team notes */
exports.adminUpdate = async (req, res) => {
  try {
    const update = {};
    const { status, counsellor, teamNotes } = req.body || {};
    if (status) {
      if (!['confirmed', 'completed', 'no_show', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Unknown status' });
      update.status = status;
    }
    if (counsellor !== undefined) update.counsellor = String(counsellor).slice(0, 80);
    if (teamNotes !== undefined) update.teamNotes = String(teamNotes).slice(0, 3000);
    // Cancelling frees the slot; bringing a call back takes the slot again (if nobody else has it)
    if (status) update.active = status !== 'cancelled';
    let c;
    try {
      c = await Consultation.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    } catch (e) {
      if (isDuplicate(e)) return res.status(409).json({ message: 'Another student has booked this slot since. Pick a different time for this call.' });
      throw e;
    }
    if (!c) return res.status(404).json({ message: 'Not found' });
    return res.json(c);
  } catch (err) {
    console.error('Admin consultation update error:', err);
    return res.status(500).json({ message: 'Could not update' });
  }
};

/** GET /api/admin/consultations/availability: weekly hours and date overrides */
exports.adminGetAvailability = async (req, res) => {
  try {
    return res.json({ ...(await loadAvailability()), durationMin: DURATION_MIN });
  } catch (err) {
    console.error('Availability load error:', err);
    return res.status(500).json({ message: 'Could not load availability' });
  }
};

/** PUT /api/admin/consultations/availability: replace weekly hours and date overrides */
exports.adminSaveAvailability = async (req, res) => {
  try {
    const { weekly = {}, overrides = [] } = req.body || {};
    const cleanWeekly = Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((d) => [String(d), cleanTimes(weekly[String(d)])]));
    const seen = new Set();
    const cleanOverrides = (Array.isArray(overrides) ? overrides : [])
      .filter((o) => /^\d{4}-\d{2}-\d{2}$/.test(String(o?.date)) && !seen.has(o.date) && seen.add(o.date))
      .map((o) => ({ date: o.date, closed: Boolean(o.closed), slots: o.closed ? [] : cleanTimes(o.slots) }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 400);
    const doc = await ConsultationAvailability.findOneAndUpdate(
      { key: 'default' },
      { weekly: cleanWeekly, overrides: cleanOverrides },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
    return res.json({ weekly: doc.weekly, overrides: doc.overrides, durationMin: DURATION_MIN });
  } catch (err) {
    console.error('Availability save error:', err);
    return res.status(500).json({ message: 'Could not save availability' });
  }
};
