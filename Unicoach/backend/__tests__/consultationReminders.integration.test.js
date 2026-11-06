// Counsellor-call reminders and the cancel email, against an in-memory MongoDB. Email is mocked.
jest.setTimeout(120000);

jest.mock('../utils/email', () => ({ sendEmail: jest.fn(async () => ({})) }));
const mockTeamAlert = jest.fn();
jest.mock('../utils/teamAlert', () => ({ sendTeamAlert: (...a) => mockTeamAlert(...a), teamInbox: () => 'team@example.com' }));

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Consultation = require('../models/Consultation');
const { sendEmail } = require('../utils/email');
const { sendDue } = require('../services/consultationReminders');
const ctrl = require('../controllers/consultationController');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
  await Consultation.syncIndexes();
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
beforeEach(async () => {
  jest.clearAllMocks();
  await Consultation.deleteMany({});
});

const H = 3600 * 1000;
let n = 0;
// A confirmed call starting `inH` hours from now, booked `bookedH` hours before it starts
const seed = async (inH, bookedH, over = {}) => {
  n += 1;
  const startsAt = new Date(Date.now() + inH * H);
  const doc = await Consultation.create({
    ref: `CONS-T${n}`, service: 'counselling', serviceLabel: 'Career counselling', date: `2030-01-${String(n).padStart(2, '0')}`, time: '13:00',
    startsAt, name: 'Asha', email: 'asha@example.com', phone: '9876543210', amountINR: 0, status: 'confirmed', ...over,
  });
  await Consultation.collection.updateOne({ _id: doc._id }, { $set: { createdAt: new Date(startsAt.getTime() - bookedH * H) } });
  return doc;
};
const subjects = () => sendEmail.mock.calls.map(([m]) => m.subject);

test('day-before reminder goes once to a call 20 hours away that was booked days ahead', async () => {
  await seed(20, 72);
  expect(await sendDue()).toBe(1);
  expect(subjects()).toEqual([expect.stringMatching(/^Reminder: your UniCoach call is on /)]);
  expect(await sendDue()).toBe(0);
  expect(sendEmail).toHaveBeenCalledTimes(1);
});

test('no "day before" email for a call booked only a few hours ahead', async () => {
  await seed(6, 7);
  expect(await sendDue()).toBe(0);
});

test('an hour before: the student gets one email, and 30 minutes before the team gets the heads-up', async () => {
  await seed(1, 48, { reminders: { dayBefore: new Date() } });
  expect(await sendDue()).toBe(1);
  expect(subjects()).toEqual([expect.stringMatching(/^Your UniCoach call is at .* today$/)]);
  expect(mockTeamAlert).not.toHaveBeenCalled();

  await seed(0.5, 48, { reminders: { dayBefore: new Date(), hourBefore: new Date() }, email: '', source: 'AI call' });
  expect(await sendDue()).toBe(1);
  expect(mockTeamAlert).toHaveBeenCalledWith(expect.objectContaining({ subject: expect.stringContaining('9876543210') }));
});

test('cancelled and past calls get no reminders', async () => {
  await seed(20, 72, { status: 'cancelled', active: false });
  await seed(-1, 72);
  expect(await sendDue()).toBe(0);
});

test('admin cancelling an upcoming call emails the student a cancellation once', async () => {
  const c = await seed(30, 72);
  const res = { status() { return res; }, json(b) { res.body = b; return res; } };
  await ctrl.adminUpdate({ params: { id: String(c._id) }, body: { status: 'cancelled' } }, res);
  expect(res.body.status).toBe('cancelled');
  expect(subjects()).toEqual([expect.stringMatching(/is cancelled$/)]);
  expect(sendEmail.mock.calls[0][0].attachments[0].content).toContain('METHOD:CANCEL');

  await ctrl.adminUpdate({ params: { id: String(c._id) }, body: { status: 'cancelled' } }, res);
  expect(sendEmail).toHaveBeenCalledTimes(1);
});
