// WhatsApp session reminders against an in-memory MongoDB: both sides hear a day before and an
// hour before, nothing is ever sent twice, and a cancelled or far-off session hears nothing.
process.env.UNICOACH_MONGO_URI = ''; // keep UniCoach models on the in-memory test connection
process.env.JWT_SECRET = process.env.JWT_SECRET || '0123456789abcdefghij';
jest.setTimeout(120000);

jest.mock('../services/whatsappSend', () => ({
  sendTemplateMessage: jest.fn(async () => ({ sent: true, waMessageId: 'wamid.TEST' })),
  toWhatsappNumber: jest.requireActual('../services/whatsappSend').toWhatsappNumber,
}));

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const UnicoachMentor = require('../unicoach/models/UnicoachMentor');
const UnicoachService = require('../unicoach/models/UnicoachService');
const UnicoachBooking = require('../unicoach/models/UnicoachBooking');
const { sendDue, whenPhrase } = require('../unicoach/services/sessionReminders');
const { sendTemplateMessage } = require('../services/whatsappSend');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });

let n = 0;
beforeEach(async () => {
  sendTemplateMessage.mockReset();
  sendTemplateMessage.mockResolvedValue({ sent: true, waMessageId: 'wamid.TEST' });
  await Promise.all([UnicoachMentor.deleteMany({}), UnicoachService.deleteMany({}), UnicoachBooking.deleteMany({})]);
});

const HOUR = 3600 * 1000;

const makeBooking = async (startsInMs, over = {}) => {
  n += 1;
  const mentor = await UnicoachMentor.create({
    name: 'Prachi Sharma', handle: `prachi${n}`, email: `p${n}@example.com`, phone: '+919000000001',
  });
  const service = await UnicoachService.create({
    mentorId: mentor._id, title: '30-Min 1:1 Video Call', type: 'ONE_ON_ONE', priceInINR: 1000,
  });
  return UnicoachBooking.create({
    bookingRef: `UM-TEST-${n}`,
    mentorId: mentor._id,
    serviceId: service._id,
    studentName: 'Aman Verma',
    studentEmail: 'aman@example.com',
    studentPhone: '9000000002',
    state: 'CONFIRMED',
    amountInINR: 1000,
    idempotencyKey: `idem-${n}`,
    startUtc: new Date(Date.now() + startsInMs),
    ...over,
  });
};

const sentTo = () => sendTemplateMessage.mock.calls.map((c) => c[0].templateName);

describe('session reminders', () => {
  it('tells mentor and student a day before', async () => {
    await makeBooking(23.5 * HOUR);
    await sendDue();

    expect(sentTo().sort()).toEqual(['mentor_session_reminder', 'student_session_reminder']);
    const toMentor = sendTemplateMessage.mock.calls.find((c) => c[0].templateName === 'mentor_session_reminder')[0];
    expect(toMentor.to).toBe('+919000000001');
    expect(toMentor.values.student_name).toBe('Aman Verma');
    expect(toMentor.values.service_title).toBe('30-Min 1:1 Video Call');
    expect(toMentor.values.session_when).toMatch(/^tomorrow, /);
  });

  it('tells both again an hour before, worded for that moment', async () => {
    await makeBooking(1 * HOUR);
    await sendDue();

    expect(sentTo()).toHaveLength(2);
    expect(sendTemplateMessage.mock.calls[0][0].values.session_when).toMatch(/in about an hour, at /);
  });

  it('never sends the same reminder twice, however often it runs', async () => {
    await makeBooking(23.5 * HOUR);
    await sendDue();
    await sendDue();
    await sendDue();

    expect(sendTemplateMessage).toHaveBeenCalledTimes(2);
  });

  it('two servers ticking at once still send it once', async () => {
    await makeBooking(23.5 * HOUR);
    await Promise.all([sendDue(), sendDue()]);

    expect(sendTemplateMessage).toHaveBeenCalledTimes(2);
  });

  it('sends the hour-before reminder even though the day-before one already went', async () => {
    const b = await makeBooking(23.5 * HOUR);
    await sendDue();
    expect(sendTemplateMessage).toHaveBeenCalledTimes(2);

    // the same booking, now an hour away
    await UnicoachBooking.updateOne({ _id: b._id }, { $set: { startUtc: new Date(Date.now() + HOUR) } });
    sendTemplateMessage.mockClear();
    await sendDue();

    expect(sendTemplateMessage).toHaveBeenCalledTimes(2);
    expect(sendTemplateMessage.mock.calls[0][0].values.session_when).toMatch(/in about an hour/);
  });

  it('stays quiet for a session that is days away', async () => {
    await makeBooking(72 * HOUR);
    await sendDue();
    expect(sendTemplateMessage).not.toHaveBeenCalled();
  });

  it('stays quiet for a cancelled or unpaid session', async () => {
    await makeBooking(23.5 * HOUR, { state: 'CANCELLED' });
    await makeBooking(23.5 * HOUR, { state: 'PAYMENT_PENDING' });
    await sendDue();
    expect(sendTemplateMessage).not.toHaveBeenCalled();
  });

  it('marks the reminder sent so the log shows what went out', async () => {
    const b = await makeBooking(23.5 * HOUR);
    await sendDue();

    const after = await UnicoachBooking.findById(b._id).lean();
    expect(after.reminders.dayBeforeMentor).toBeInstanceOf(Date);
    expect(after.reminders.dayBeforeStudent).toBeInstanceOf(Date);
    expect(after.reminders.hourBeforeMentor).toBeUndefined();
  });

  it('tries again later when the Meta template is still awaiting approval', async () => {
    sendTemplateMessage.mockResolvedValue({ sent: false, skipped: 'template "mentor_session_reminder" is not approved by Meta yet' });
    const b = await makeBooking(23.5 * HOUR);
    await sendDue();

    // nothing is marked as sent, so the next tick picks it up again
    const after = await UnicoachBooking.findById(b._id).lean();
    expect(after.reminders?.dayBeforeMentor).toBeUndefined();
    expect(after.reminders?.dayBeforeStudent).toBeUndefined();

    sendTemplateMessage.mockResolvedValue({ sent: true, waMessageId: 'wamid.TEST' });
    sendTemplateMessage.mockClear();
    await sendDue();
    expect(sendTemplateMessage).toHaveBeenCalledTimes(2);
  });

  it('tries again later when Meta returns an error', async () => {
    sendTemplateMessage.mockResolvedValue({ sent: false, error: 'Meta API error 500' });
    const b = await makeBooking(23.5 * HOUR);
    await sendDue();

    const after = await UnicoachBooking.findById(b._id).lean();
    expect(after.reminders?.dayBeforeMentor).toBeUndefined();
  });

  it('gives up for good on someone who replied STOP', async () => {
    sendTemplateMessage.mockResolvedValue({ sent: false, skipped: 'replied STOP' });
    const b = await makeBooking(23.5 * HOUR);
    await sendDue();

    // a permanent skip stays claimed: retrying every five minutes would achieve nothing
    const after = await UnicoachBooking.findById(b._id).lean();
    expect(after.reminders.dayBeforeMentor).toBeInstanceOf(Date);
  });

  it('still reminds the student when the mentor has no phone number', async () => {
    const b = await makeBooking(23.5 * HOUR);
    await UnicoachMentor.updateOne({ _id: b.mentorId }, { $set: { phone: '' } });
    await sendDue();

    // both are attempted; the sender itself decides a missing number is a skip
    expect(sentTo().sort()).toEqual(['mentor_session_reminder', 'student_session_reminder']);
    const toStudent = sendTemplateMessage.mock.calls.find((c) => c[0].templateName === 'student_session_reminder')[0];
    expect(toStudent.to).toBe('9000000002');
  });
});

describe('whenPhrase', () => {
  const at = new Date('2026-11-21T11:00:00Z'); // 4:30 PM IST

  it('says tomorrow with the day and time for the day-before reminder', () => {
    expect(whenPhrase(at, 'dayBefore')).toContain('tomorrow,');
    expect(whenPhrase(at, 'dayBefore')).toContain('4:30');
  });

  it('says about an hour for the hour-before reminder', () => {
    expect(whenPhrase(at, 'hourBefore')).toBe('in about an hour, at 4:30 pm');
  });
});
