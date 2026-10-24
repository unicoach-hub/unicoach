// Weekly mentor payouts against an in-memory MongoDB: what is ready / upcoming / paid,
// and that one booking can never be paid twice.
process.env.UNICOACH_MONGO_URI = ''; // keep UniCoach models on the in-memory test connection
jest.setTimeout(120000);
jest.mock('../utils/email', () => ({ sendEmail: jest.fn(async () => ({})) }));

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const UnicoachMentor = require('../unicoach/models/UnicoachMentor');
const UnicoachService = require('../unicoach/models/UnicoachService');
const UnicoachBooking = require('../unicoach/models/UnicoachBooking');
const UnicoachPayout = require('../unicoach/models/UnicoachPayout');
const { listWeeklyPayouts, markWeeklyPaid } = require('../unicoach/controllers/weeklyPayoutController');
const { requestPayout } = require('../unicoach/controllers/mentorController');
const { payoutState, nextPayoutDate } = require('../unicoach/services/weeklyPayoutService');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });
beforeEach(async () => {
  await Promise.all([UnicoachMentor.deleteMany({}), UnicoachService.deleteMany({}), UnicoachBooking.deleteMany({}), UnicoachPayout.deleteMany({})]);
});

const H = 3600 * 1000;
const call = async (fn, req = {}) => {
  const res = { code: 200 };
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  await fn({ params: {}, query: {}, body: {}, ...req }, res);
  return res;
};

let n = 0;
const setup = async () => {
  const mentor = await UnicoachMentor.collection.insertOne({
    name: 'Prachi', handle: `prachi${n}`, email: 'prachi@example.com',
    defaultPayoutDetails: { payoutMethod: 'BANK_TRANSFER', accountHolderName: 'Prachi', accountNumber: '123456789012', ifscCode: 'HDFC0001234' },
  });
  const call1 = await UnicoachService.collection.insertOne({ mentorId: mentor.insertedId, title: '1:1 call', type: 'ONE_ON_ONE', priceInINR: 1000 });
  const dm = await UnicoachService.collection.insertOne({ mentorId: mentor.insertedId, title: 'Priority DM', type: 'PRIORITY_DM', priceInINR: 199 });
  return { mentorId: mentor.insertedId, callId: call1.insertedId, dmId: dm.insertedId };
};
const booking = (ids, over = {}) => {
  n += 1;
  return UnicoachBooking.collection.insertOne({
    bookingRef: `UM-${1000 + n}`, idempotencyKey: `key-${n}`, mentorId: ids.mentorId, serviceId: ids.callId, studentName: 'Rahul',
    state: 'CONFIRMED', amountPaid: 1000, payment: { paymentId: `pay_${n}` },
    settlement: { status: 'ROUTE_DISABLED', mentorNetINR: 976.4 },
    weeklyPayout: { payoutId: null, payoutRef: '', paidAt: null },
    createdAt: new Date(), updatedAt: new Date(), ...over,
  });
};

test('call ended 3 days ago is ready; one tomorrow is upcoming; refunded never counts', async () => {
  const ids = await setup();
  await booking(ids, { startUtc: new Date(Date.now() - 72 * H), endUtc: new Date(Date.now() - 71 * H) });
  await booking(ids, { startUtc: new Date(Date.now() + 24 * H), endUtc: new Date(Date.now() + 25 * H) });
  await booking(ids, { state: 'REFUNDED', startUtc: new Date(Date.now() - 72 * H), endUtc: new Date(Date.now() - 71 * H) });
  const r = await call(listWeeklyPayouts);
  const m = r.body.mentors[0];
  expect(m.ready).toHaveLength(1);
  expect(m.upcoming).toHaveLength(1);
  expect(m.readyINR).toBe(976.4);
  expect(r.body.totals.mentorsToPay).toBe(1);
});

test('call that ended only 10 hours ago waits for the 48h complaint window', async () => {
  const ids = await setup();
  await booking(ids, { startUtc: new Date(Date.now() - 11 * H), endUtc: new Date(Date.now() - 10 * H) });
  const m = (await call(listWeeklyPayouts)).body.mentors[0];
  expect(m.ready).toHaveLength(0);
  expect(m.upcoming).toHaveLength(1);
});

test('Priority DM is ready 48h after it is completed, not before', async () => {
  const ids = await setup();
  await booking(ids, { serviceId: ids.dmId, amountPaid: 199, state: 'COMPLETED', updatedAt: new Date(Date.now() - 50 * H), settlement: { status: 'ROUTE_DISABLED', mentorNetINR: 0 } });
  await booking(ids, { serviceId: ids.dmId, amountPaid: 199, state: 'CONFIRMED', settlement: { status: 'ROUTE_DISABLED', mentorNetINR: 0 } });
  const m = (await call(listWeeklyPayouts)).body.mentors[0];
  expect(m.ready).toHaveLength(1);
  expect(m.ready[0].estimated).toBe(true); // real Razorpay fee unknown: estimated at 2.36%
  expect(m.ready[0].netINR).toBe(194.3);
  expect(m.upcoming).toHaveLength(1);
});

test('mark paid records the payout, stamps bookings, and they move to Paid', async () => {
  const ids = await setup();
  await booking(ids, { startUtc: new Date(Date.now() - 80 * H), endUtc: new Date(Date.now() - 79 * H) });
  await booking(ids, { startUtc: new Date(Date.now() - 90 * H), endUtc: new Date(Date.now() - 89 * H) });
  const r = await call(markWeeklyPaid, { params: { mentorId: String(ids.mentorId) }, body: { transactionRef: 'UTR123' } });
  expect(r.code).toBe(201);
  expect(r.body.payout.amountINR).toBe(1952.8);
  expect(r.body.payout.source).toBe('WEEKLY');
  const after = (await call(listWeeklyPayouts)).body;
  expect(after.mentors).toHaveLength(0); // nothing ready or upcoming left
  expect(after.history).toHaveLength(1);
  const b = await UnicoachBooking.findOne({ bookingRef: 'UM-' + (1000 + n) }).lean();
  expect(payoutState(b)).toBe('PAID');
});

test('double click on Paid: only one payout, bookings paid once', async () => {
  const ids = await setup();
  await booking(ids, { startUtc: new Date(Date.now() - 80 * H), endUtc: new Date(Date.now() - 79 * H) });
  const req = { params: { mentorId: String(ids.mentorId) }, body: { transactionRef: 'UTR9' } };
  const [a, b] = await Promise.all([call(markWeeklyPaid, req), call(markWeeklyPaid, req)]);
  expect([a.code, b.code].filter((c) => c === 201)).toHaveLength(1);
  expect(await UnicoachPayout.countDocuments()).toBe(1);
});

test('needs a bank reference, and refuses when nothing is ready', async () => {
  const ids = await setup();
  expect((await call(markWeeklyPaid, { params: { mentorId: String(ids.mentorId) }, body: {} })).code).toBe(400);
  expect((await call(markWeeklyPaid, { params: { mentorId: String(ids.mentorId) }, body: { transactionRef: 'X' } })).code).toBe(400);
});

test('bookings paid through Razorpay Route are left out', async () => {
  const ids = await setup();
  await booking(ids, { startUtc: new Date(Date.now() - 80 * H), endUtc: new Date(Date.now() - 79 * H), settlement: { status: 'RELEASED', mentorNetINR: 976.4 } });
  expect((await call(listWeeklyPayouts)).body.mentors).toHaveLength(0);
});

test('next payout is a Monday', () => {
  expect(nextPayoutDate(new Date('2026-10-23T10:00:00')).getDay()).toBe(1);
  expect(nextPayoutDate(new Date('2026-10-26T10:00:00')).toDateString()).toBe(new Date('2026-11-02T00:00:00').toDateString());
});

test('mentor can request a payout once; admin sees it first; paying clears it', async () => {
  const ids = await setup();
  await booking(ids, { startUtc: new Date(Date.now() - 80 * H), endUtc: new Date(Date.now() - 79 * H) });
  const handle = `prachi${n - 1}`;
  const req = { params: { handle }, validatedHandle: handle, body: { note: 'please pay' } };

  const first = await call(requestPayout, req);
  expect(first.code).toBe(201);
  expect(first.body.payoutRequest.amountINR).toBe(976.4);
  expect((await call(requestPayout, req)).code).toBe(409); // only one open request

  const list = (await call(listWeeklyPayouts)).body;
  expect(list.totals.requests).toBe(1);
  expect(list.mentors[0].request.note).toBe('please pay');

  await call(markWeeklyPaid, { params: { mentorId: String(ids.mentorId) }, body: { transactionRef: 'UTR1' } });
  const m = await UnicoachMentor.findById(ids.mentorId).lean();
  expect(m.payoutRequest.requestedAt).toBeNull();
});

test('payout request needs bank details and something ready', async () => {
  const mentor = await UnicoachMentor.collection.insertOne({ name: 'NoBank', handle: 'nobank', email: 'n@example.com' });
  const req = { params: { handle: 'nobank' }, validatedHandle: 'nobank', body: {} };
  expect((await call(requestPayout, req)).code).toBe(400);
  await UnicoachMentor.collection.updateOne({ _id: mentor.insertedId }, { $set: { defaultPayoutDetails: { upiId: 'nb@upi' } } });
  expect((await call(requestPayout, req)).code).toBe(400); // nothing ready yet
});
