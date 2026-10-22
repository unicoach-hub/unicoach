// Paid consultation booking against a real (in-memory) MongoDB, so the "one booking per slot"
// index and concurrent requests behave exactly as in production. Razorpay and email are mocked.
jest.setTimeout(120000);

jest.mock('../unicoach/services/paymentService', () => {
  let n = 0;
  return {
    createRazorpayOrder: jest.fn(async () => { n += 1; return { orderId: `order_${n}`, amount: 50000, currency: 'INR', keyId: 'rzp_test_x' }; }),
    verifyRazorpayPayment: jest.fn(async () => ({ verified: true })),
  };
});
jest.mock('../utils/email', () => ({ sendEmail: jest.fn(async () => ({})) }));

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Consultation = require('../models/Consultation');
const ConsultationAvailability = require('../models/ConsultationAvailability');
const { verifyRazorpayPayment } = require('../unicoach/services/paymentService');
const { sendEmail } = require('../utils/email');
const ctrl = require('../controllers/consultationController');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
  await Consultation.syncIndexes();
  await ConsultationAvailability.syncIndexes();
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
beforeEach(async () => {
  jest.clearAllMocks();
  verifyRazorpayPayment.mockImplementation(async () => ({ verified: true }));
  await Consultation.deleteMany({});
  await ConsultationAvailability.deleteMany({});
});

// ── helpers ─────────────────────────────────────────────────────────────────
const call = async (fn, req = {}) => {
  const res = { code: 200, body: undefined };
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  await fn({ params: {}, query: {}, body: {}, ...req }, res);
  return res;
};
const istDate = (daysAhead) => new Date(Date.now() + daysAhead * 864e5 + 5.5 * 3600e3).toISOString().slice(0, 10);
const D = istDate(3);
const student = (over = {}) => ({ service: 'visa', date: D, time: '13:00', name: 'Asha', email: 'asha@example.com', phone: '9876543210', ...over });
const book = (over) => call(ctrl.create, { body: student(over) });
const pay = (ref, over = {}) => call(ctrl.verify, { params: { ref }, body: { razorpay_payment_id: `pay_${ref}`, razorpay_signature: 'sig', ...over } });
const openSlots = async (date = D) => (await call(ctrl.getConfig)).body.days.find((d) => d.date === date).slots;
const expireHold = (ref) => Consultation.collection.updateOne({ ref }, { $set: { createdAt: new Date(Date.now() - 20 * 60 * 1000) } });

// ── student ─────────────────────────────────────────────────────────────────
describe('student booking', () => {
  test('default hours are 1 pm, 2 pm and 8 pm, one-hour calls, ₹500', async () => {
    const r = await call(ctrl.getConfig);
    expect(r.body.durationMin).toBe(60);
    expect(r.body.price).toBe(500);
    expect(await openSlots()).toEqual(['13:00', '14:00', '20:00']);
  });

  test('a held slot disappears for everyone else', async () => {
    expect((await book()).code).toBe(201);
    expect(await openSlots()).toEqual(['14:00', '20:00']);
  });

  test('20 students paying for the same slot at the same instant: exactly one gets it', async () => {
    const results = await Promise.all(Array.from({ length: 20 }, (_, i) => book({ email: `s${i}@x.co` })));
    expect(results.filter((r) => r.code === 201)).toHaveLength(1);
    expect(results.filter((r) => r.code === 409)).toHaveLength(19);
    expect(await Consultation.countDocuments({ date: D, time: '13:00', active: true })).toBe(1);
  });

  test('different slots booked at the same time all succeed', async () => {
    const results = await Promise.all(['13:00', '14:00', '20:00'].map((time) => book({ time })));
    expect(results.map((r) => r.code)).toEqual([201, 201, 201]);
    expect(await openSlots()).toEqual([]);
  });

  test('double-clicking pay does not create two bookings', async () => {
    const [a, b] = await Promise.all([book(), book()]);
    expect([a.code, b.code].sort()).toEqual([201, 409]);
  });

  test('an unpaid hold frees the slot after 15 minutes', async () => {
    const first = await book();
    await expireHold(first.body.ref);
    expect(await openSlots()).toContain('13:00');
    expect((await book({ email: 'other@x.co' })).code).toBe(201);
    expect((await Consultation.findOne({ ref: first.body.ref })).active).toBe(false);
  });

  test('paying confirms the call and sends one email; paying twice is harmless', async () => {
    const { body } = await book();
    expect((await pay(body.ref)).body).toEqual({ ok: true, ref: body.ref });
    expect((await pay(body.ref)).body).toEqual({ ok: true, ref: body.ref });
    const c = await Consultation.findOne({ ref: body.ref });
    expect(c.status).toBe('confirmed');
    expect(c.payment.paymentId).toBe(`pay_${body.ref}`);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  test('late payment, slot still free: the call is confirmed', async () => {
    const { body } = await book();
    await expireHold(body.ref);
    await call(ctrl.getConfig); // nothing else happened
    await Consultation.updateOne({ ref: body.ref }, { $set: { active: false } });
    expect((await pay(body.ref)).code).toBe(200);
    const c = await Consultation.findOne({ ref: body.ref });
    expect(c.status).toBe('confirmed');
    expect(c.active).toBe(true);
  });

  test('late payment, slot taken by someone else: flagged for refund, other booking untouched', async () => {
    const first = await book();
    await expireHold(first.body.ref);
    const second = await book({ email: 'b@x.co' });
    expect(second.code).toBe(201);
    const late = await pay(first.body.ref);
    expect(late.code).toBe(409);
    expect(late.body.message).toMatch(/refund/i);
    expect((await Consultation.findOne({ ref: first.body.ref })).status).toBe('payment_conflict');
    expect((await Consultation.findOne({ ref: second.body.ref })).active).toBe(true);
  });

  test('payment for a different order or a failed signature is rejected', async () => {
    const { body } = await book();
    expect((await pay(body.ref, { razorpay_order_id: 'order_someone_else' })).code).toBe(400);
    verifyRazorpayPayment.mockImplementationOnce(async () => ({ verified: false, error: 'Payment signature verification failed.' }));
    expect((await pay(body.ref)).code).toBe(400);
    expect((await Consultation.findOne({ ref: body.ref })).status).toBe('payment_pending');
  });

  test('webhook confirms the call when the student closed the tab after paying', async () => {
    const { body } = await book();
    const c0 = await Consultation.findOne({ ref: body.ref });
    const payment = { id: 'pay_hook', order_id: c0.payment.orderId, amount: 50000, notes: { bookingRef: body.ref } };
    expect(await ctrl.confirmFromWebhook(payment)).toBe('consultation_confirmed');
    expect(await ctrl.confirmFromWebhook(payment)).toBe('consultation_already');
    expect((await Consultation.findOne({ ref: body.ref })).status).toBe('confirmed');
    expect(await ctrl.confirmFromWebhook({ ...payment, amount: 100 })).toBe('consultation_amount_mismatch');
    expect(await ctrl.confirmFromWebhook({ id: 'x', order_id: 'order_unknown', amount: 50000, notes: {} })).toBeNull();
  });

  test.each([
    ['unknown service', { service: 'astrology' }],
    ['bad date', { date: '22-10-2026' }],
    ['hour the team did not open', { time: '10:00' }],
    ['not a time', { time: '1pm' }],
    ['past date', { date: istDate(-2) }],
    ['beyond 3 weeks', { date: istDate(40) }],
    ['missing name', { name: '  ' }],
    ['bad email', { email: 'asha.example.com' }],
    ['short phone', { phone: '12345' }],
  ])('rejects %s', async (_, over) => {
    const r = await book(over);
    expect(r.code).toBe(400);
    expect(await Consultation.countDocuments()).toBe(0);
  });

  test('a slot less than an hour away cannot be booked', async () => {
    const now = new Date(Date.now() + 5.5 * 3600e3);
    const today = now.toISOString().slice(0, 10);
    const soon = `${String(now.getUTCHours()).padStart(2, '0')}:00`;
    await call(ctrl.adminSaveAvailability, { body: { weekly: {}, overrides: [{ date: today, slots: [soon] }] } });
    expect((await book({ date: today, time: soon })).code).toBe(400);
  });
});

// ── admin ───────────────────────────────────────────────────────────────────
describe('admin hours and calls', () => {
  test('weekly hours: students only see what the admin opened', async () => {
    const dow = String(new Date(`${D}T12:00:00+05:30`).getUTCDay());
    await call(ctrl.adminSaveAvailability, { body: { weekly: { [dow]: ['10:00', '18:00'] }, overrides: [] } });
    expect(await openSlots()).toEqual(['10:00', '18:00']);
    expect((await book({ time: '13:00' })).code).toBe(400);
    expect((await book({ time: '18:00' })).code).toBe(201);
  });

  test('closing a date removes every slot that day', async () => {
    await call(ctrl.adminSaveAvailability, { body: { weekly: { 0: ['13:00'], 1: ['13:00'], 2: ['13:00'], 3: ['13:00'], 4: ['13:00'], 5: ['13:00'], 6: ['13:00'] }, overrides: [{ date: D, closed: true }] } });
    expect(await openSlots()).toEqual([]);
    expect(await openSlots(istDate(4))).toEqual(['13:00']);
    expect((await book()).code).toBe(400);
  });

  test('extra hours on one date are bookable that date only', async () => {
    await call(ctrl.adminSaveAvailability, { body: { weekly: {}, overrides: [{ date: D, slots: ['09:00'] }] } });
    expect(await openSlots()).toEqual(['09:00']);
    expect(await openSlots(istDate(4))).toEqual([]);
    expect((await book({ time: '09:00' })).code).toBe(201);
  });

  test('closing an hour that is already booked keeps the paid call', async () => {
    const { body } = await book();
    await pay(body.ref);
    await call(ctrl.adminSaveAvailability, { body: { weekly: {}, overrides: [{ date: D, closed: true }] } });
    expect((await Consultation.findOne({ ref: body.ref })).status).toBe('confirmed');
    expect(await openSlots()).toEqual([]);
  });

  test('cancelling a call frees the slot; bringing it back fails if someone took it', async () => {
    const { body } = await book();
    await pay(body.ref);
    const c = await Consultation.findOne({ ref: body.ref });
    expect((await call(ctrl.adminUpdate, { params: { id: c._id }, body: { status: 'cancelled' } })).body.active).toBe(false);
    expect(await openSlots()).toContain('13:00');
    const other = await book({ email: 'other@x.co' });
    expect(other.code).toBe(201);
    const back = await call(ctrl.adminUpdate, { params: { id: c._id }, body: { status: 'confirmed' } });
    expect(back.code).toBe(409);
    expect((await Consultation.findById(c._id)).status).toBe('cancelled');
  });

  test('bringing back a cancelled call works when the slot is still free', async () => {
    const { body } = await book();
    await pay(body.ref);
    const c = await Consultation.findOne({ ref: body.ref });
    await call(ctrl.adminUpdate, { params: { id: c._id }, body: { status: 'cancelled' } });
    const back = await call(ctrl.adminUpdate, { params: { id: c._id }, body: { status: 'confirmed' } });
    expect(back.code).toBe(200);
    expect(back.body.active).toBe(true);
  });

  test('marking completed / no-show keeps the slot taken', async () => {
    const { body } = await book();
    await pay(body.ref);
    const c = await Consultation.findOne({ ref: body.ref });
    await call(ctrl.adminUpdate, { params: { id: c._id }, body: { status: 'no_show' } });
    expect(await openSlots()).not.toContain('13:00');
  });

  test('unknown status is refused', async () => {
    const { body } = await book();
    const c = await Consultation.findOne({ ref: body.ref });
    expect((await call(ctrl.adminUpdate, { params: { id: c._id }, body: { status: 'deleted' } })).code).toBe(400);
  });

  test('list hides unpaid holds by default and counts the numbers right', async () => {
    const a = await book({ time: '13:00' });
    await pay(a.body.ref);
    const b = await book({ time: '14:00' });
    await pay(b.body.ref);
    await book({ time: '20:00' }); // never paid
    const bc = await Consultation.findOne({ ref: b.body.ref });
    await call(ctrl.adminUpdate, { params: { id: bc._id }, body: { status: 'completed' } });
    const r = await call(ctrl.adminList, { query: {} });
    expect(r.body.items).toHaveLength(2);
    expect(r.body.stats.totalPaid).toBe(2);
    expect(r.body.stats.revenueINR).toBe(1000);
    expect(r.body.stats.completed).toBe(1);
    expect(r.body.stats.upcoming).toBe(1);
  });

  test('saving hours cleans junk and keeps one entry per date', async () => {
    const r = await call(ctrl.adminSaveAvailability, { body: { weekly: { 1: ['20:00', '13:00', '25:00', 'x', '13:00'] }, overrides: [{ date: D, slots: ['09:00'] }, { date: D, closed: true }, { date: 'nope' }] } });
    expect(r.body.weekly['1']).toEqual(['13:00', '20:00']);
    expect(r.body.overrides).toEqual([{ date: D, closed: false, slots: ['09:00'] }]);
    expect(await ConsultationAvailability.countDocuments()).toBe(1);
  });
});
