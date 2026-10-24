const crypto = require('crypto');
const UnicoachMentor = require('../models/UnicoachMentor');
const UnicoachPayout = require('../models/UnicoachPayout');
const UnicoachBooking = require('../models/UnicoachBooking');
const { payableBookings, nextPayoutDate, COMPLAINT_WINDOW_HOURS } = require('../services/weeklyPayoutService');
const { sendPayoutPaid } = require('../services/mentorEmails');

const round2 = (n) => Math.round(Number(n || 0) * 100) / 100;

/** GET /api/unicoach/admin/weekly-payouts: what each mentor is owed this Monday, what's coming, and history */
const listWeeklyPayouts = async (req, res) => {
  try {
    const rows = await payableBookings();
    const mentorIds = [...new Set(rows.map((b) => String(b.mentorId)))];
    const mentors = await UnicoachMentor.find({ _id: { $in: mentorIds } })
      .select('name handle email phone defaultPayoutDetails payoutRequest').lean();
    const mentorOf = Object.fromEntries(mentors.map((m) => [String(m._id), m]));

    const byMentor = {};
    for (const b of rows) {
      const id = String(b.mentorId);
      const m = mentorOf[id];
      if (!m) continue;
      byMentor[id] = byMentor[id] || {
        mentorId: id, name: m.name, handle: m.handle, email: m.email,
        bank: m.defaultPayoutDetails || {},
        request: m.payoutRequest?.requestedAt ? m.payoutRequest : null,
        ready: [], upcoming: [], readyINR: 0, upcomingINR: 0, paidINR: 0,
      };
      const row = {
        _id: b._id, bookingRef: b.bookingRef, service: b.serviceId?.title || '', serviceType: b.serviceId?.type || '',
        studentName: b.studentName, when: b.startUtc || b.createdAt, paidINR: b.amountPaid,
        netINR: b.net.amount, estimated: b.net.estimated,
      };
      if (b.payoutState === 'READY') { byMentor[id].ready.push(row); byMentor[id].readyINR += row.netINR; }
      else if (b.payoutState === 'UPCOMING') { byMentor[id].upcoming.push(row); byMentor[id].upcomingINR += row.netINR; }
      else if (b.payoutState === 'PAID') byMentor[id].paidINR += row.netINR;
    }
    const list = Object.values(byMentor)
      .map((m) => ({ ...m, readyINR: round2(m.readyINR), upcomingINR: round2(m.upcomingINR), paidINR: round2(m.paidINR) }))
      .filter((m) => m.ready.length || m.upcoming.length)
      // Mentors who asked to be paid come first, oldest request first
      .sort((a, b) => (!!b.request - !!a.request)
        || (a.request && b.request ? new Date(a.request.requestedAt) - new Date(b.request.requestedAt) : 0)
        || b.readyINR - a.readyINR);

    const history = await UnicoachPayout.find({ source: 'WEEKLY' })
      .populate('mentorId', 'name handle')
      .sort({ createdAt: -1 }).limit(100).lean();

    return res.json({
      nextPayoutDate: nextPayoutDate(),
      complaintWindowHours: COMPLAINT_WINDOW_HOURS,
      totals: {
        readyINR: round2(list.reduce((t, m) => t + m.readyINR, 0)),
        upcomingINR: round2(list.reduce((t, m) => t + m.upcomingINR, 0)),
        mentorsToPay: list.filter((m) => m.ready.length).length,
        requests: list.filter((m) => m.request).length,
      },
      mentors: list,
      history,
    });
  } catch (err) {
    console.error('[Weekly payouts] list failed:', err);
    return res.status(500).json({ error: 'Could not load payouts' });
  }
};

/** POST /api/unicoach/admin/weekly-payouts/:mentorId/paid  { transactionRef, bookingIds? }
 *  Records the bank transfer the admin just made and marks those bookings paid. */
const markWeeklyPaid = async (req, res) => {
  try {
    const mentor = await UnicoachMentor.findById(req.params.mentorId).select('name handle email defaultPayoutDetails').lean();
    if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });
    const transactionRef = String(req.body?.transactionRef || '').trim().slice(0, 80);
    if (!transactionRef) return res.status(400).json({ error: 'Add the bank reference (UTR) of the transfer.' });

    const wanted = Array.isArray(req.body?.bookingIds) ? req.body.bookingIds.map(String) : null;
    const ready = (await payableBookings({ mentorId: mentor._id }))
      .filter((b) => b.payoutState === 'READY' && (!wanted || wanted.includes(String(b._id))));
    if (!ready.length) return res.status(400).json({ error: 'Nothing is ready to pay for this mentor.' });

    // Claim the bookings first: only ones not yet in a payout are taken, so a double click or two
    // admins at once can never pay the same booking twice
    const mongoose = require('mongoose');
    const payoutId = new mongoose.Types.ObjectId();
    const payoutRef = `PO-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const paidAt = new Date();
    await UnicoachBooking.updateMany(
      { _id: { $in: ready.map((b) => b._id) }, 'weeklyPayout.payoutId': null },
      { $set: { 'weeklyPayout.payoutId': payoutId, 'weeklyPayout.payoutRef': payoutRef, 'weeklyPayout.paidAt': paidAt } },
    );
    const mine = await UnicoachBooking.find({ 'weeklyPayout.payoutId': payoutId }).select('_id').lean();
    const mineIds = new Set(mine.map((x) => String(x._id)));
    const paidNow = ready.filter((b) => mineIds.has(String(b._id)));
    if (!paidNow.length) return res.status(409).json({ error: 'These bookings were already paid in another payout.' });

    const amountINR = round2(paidNow.reduce((t, b) => t + b.net.amount, 0));
    const bank = mentor.defaultPayoutDetails || {};
    const payout = await UnicoachPayout.create({
      _id: payoutId,
      payoutRef,
      mentorId: mentor._id,
      amountINR,
      payoutMethod: bank.payoutMethod === 'UPI' && bank.upiId ? 'UPI' : 'BANK_TRANSFER',
      payoutDetails: {
        upiId: bank.upiId || '', accountHolderName: bank.accountHolderName || '',
        accountNumber: bank.accountNumber || '', ifscCode: bank.ifscCode || '', bankName: bank.bankName || '',
      },
      status: 'PAID',
      transactionRef,
      adminRemarks: String(req.body?.remarks || '').slice(0, 500),
      processedAt: paidAt,
      source: 'WEEKLY',
      bookingIds: paidNow.map((b) => b._id),
    });

    await UnicoachMentor.updateOne({ _id: mentor._id }, { $set: { 'payoutRequest.requestedAt': null, 'payoutRequest.amountINR': 0, 'payoutRequest.note': '' } });
    sendPayoutPaid(mentor, payout, paidNow);
    return res.status(201).json({ payout, bookings: paidNow.length });
  } catch (err) {
    console.error('[Weekly payouts] mark paid failed:', err);
    return res.status(500).json({ error: 'Could not record the payout' });
  }
};

module.exports = { listWeeklyPayouts, markWeeklyPaid };
