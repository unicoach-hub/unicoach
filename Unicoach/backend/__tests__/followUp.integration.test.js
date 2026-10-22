// Follow-ups: logging an activity on a due follow-up records whether it was done on time (IST days)
jest.setTimeout(120000);

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Lead = require('../models/Lead');
const { addActivity, getAllLeads } = require('../controllers/adminLeadController');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });
beforeEach(() => Lead.deleteMany({}));

const DAY = 864e5;
const makeLead = (dueOffsetDays) => Lead.create({
  name: 'Ravi', email: `r${Math.random()}@x.co`, phone: `98${Math.floor(Math.random() * 1e8)}`,
  ...(dueOffsetDays === null ? {} : { nextFollowUpDate: new Date(Date.now() + dueOffsetDays * DAY) }),
});
const log = async (lead, body = {}) => {
  const res = { code: 200 };
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  await addActivity({ params: { id: String(lead._id) }, body: { type: 'call', comment: 'Called', ...body }, user: { role: 'admin' } }, res);
  return res;
};

test('done on the due day: on time, date cleared', async () => {
  const lead = await makeLead(0);
  await log(lead);
  const after = await Lead.findById(lead._id);
  expect(after.followUpHistory).toHaveLength(1);
  expect(after.followUpHistory[0].onTime).toBe(true);
  expect(after.followUpHistory[0].daysLate).toBe(0);
  expect(after.nextFollowUpDate).toBeUndefined();
});

test('done 4 days after the due date: late by 4', async () => {
  const lead = await makeLead(-4);
  await log(lead, { type: 'whatsapp' });
  const h = (await Lead.findById(lead._id)).followUpHistory[0];
  expect(h.onTime).toBe(false);
  expect(h.daysLate).toBe(4);
  expect(h.via).toBe('whatsapp');
});

test('contact before the due date leaves the follow-up in place', async () => {
  const lead = await makeLead(3);
  await log(lead);
  const after = await Lead.findById(lead._id);
  expect(after.followUpHistory).toHaveLength(0);
  expect(after.nextFollowUpDate).toBeDefined();
});

test('setting the next date while finishing one records the old and schedules the new', async () => {
  const lead = await makeLead(-1);
  const next = new Date(Date.now() + 5 * DAY);
  await log(lead, { nextFollowUpDate: next.toISOString() });
  const after = await Lead.findById(lead._id);
  expect(after.followUpHistory[0].daysLate).toBe(1);
  expect(after.nextFollowUpDate.toISOString()).toBe(next.toISOString());
});

test('no follow-up scheduled: nothing recorded', async () => {
  const lead = await makeLead(null);
  await log(lead);
  expect((await Lead.findById(lead._id)).followUpHistory).toHaveLength(0);
});

test('lead list shows how many calls were logged (call done vs pending)', async () => {
  const called = await makeLead(null);
  const notCalled = await makeLead(null);
  await log(called, { type: 'call' });
  await log(called, { type: 'call' });
  await log(notCalled, { type: 'note' });
  const res = { code: 200 };
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  await getAllLeads({ query: {}, user: { role: 'admin' } }, res);
  const byId = Object.fromEntries(res.body.map((l) => [String(l._id), l]));
  expect(byId[String(called._id)].callCount).toBe(2);
  expect(byId[String(called._id)].lastCallAt).toBeTruthy();
  expect(byId[String(notCalled._id)].callCount).toBe(0);
});
