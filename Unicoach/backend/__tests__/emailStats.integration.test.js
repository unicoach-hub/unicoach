// The Email Hub dashboard numbers: allowance used today and this month, and how much arrived.
jest.setTimeout(120000);

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const EmailLog = require('../models/EmailLog');
const { getEmailStats } = require('../controllers/adminMessagingController');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });
beforeEach(async () => {
  await EmailLog.deleteMany({});
  delete process.env.EMAIL_DAILY_LIMIT;
  delete process.env.EMAIL_MONTHLY_LIMIT;
});

const ask = async (query = {}) => {
  const res = { code: 200 };
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  await getEmailStats({ query }, res);
  return res.body;
};

let n = 0;
const log = (status, at = new Date(), extra = {}) => EmailLog.create({
  to: `s${n}@example.com`, subject: 'Hello', status, at,
  providerMessageId: `eml_${n++}`, ...extra,
});

test('the free plan limits are the default, and today counts what left our hands', async () => {
  await log('delivered');
  await log('sent');
  await log('failed');          // never reached Resend, so it uses no allowance

  const s = await ask();
  expect(s.limits).toEqual({ daily: 100, monthly: 3000 });
  expect(s.today.total).toBe(3);
  expect(s.today.accepted).toBe(2);
  expect(s.today.left).toBe(98);
});

test('a raised limit from the environment is used instead', async () => {
  process.env.EMAIL_DAILY_LIMIT = '0';       // Pro: no daily cap
  process.env.EMAIL_MONTHLY_LIMIT = '50000';
  await log('delivered');

  const s = await ask();
  expect(s.limits).toEqual({ daily: 0, monthly: 50000 });
  expect(s.today.left).toBeNull();
  expect(s.month.left).toBe(49999);
});

test('reached counts delivered, opened and clicked — not the ones still waiting', async () => {
  await log('delivered');
  await log('opened');
  await log('clicked');
  await log('sent');
  await log('bounced');
  await log('complained');

  const s = await ask();
  expect(s.window.reached).toBe(3);
  expect(s.window.waiting).toBe(1);
  expect(s.window.bounced).toBe(1);
  expect(s.window.complained).toBe(1);
});

test('older emails stay out of today but count for the month', async () => {
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
  await log('delivered', threeDaysAgo);
  await log('delivered');

  const s = await ask();
  expect(s.today.total).toBe(1);
  expect(s.month.total).toBeGreaterThanOrEqual(1);
  expect(s.daily.length).toBeGreaterThanOrEqual(1);
});

test('the reasons things failed are counted, biggest first', async () => {
  await log('bounced', new Date(), { error: 'Mailbox does not exist' });
  await log('bounced', new Date(), { error: 'Mailbox does not exist' });
  await log('failed', new Date(), { error: 'Daily limit reached' });

  const s = await ask();
  expect(s.problems[0]).toEqual({ error: 'Mailbox does not exist', n: 2 });
  expect(s.problems).toHaveLength(2);
});

test('it says where the numbers come from', async () => {
  const s = await ask();
  expect(s.note).toMatch(/own log/i);
});

const daysAgo = (d) => new Date(Date.now() - d * 86400000);

test('the open rate is measured against the mail that reached an inbox', async () => {
  await log('delivered');
  await log('delivered');
  await log('opened');
  await log('clicked');
  await log('bounced');       // never reached anyone, so it is not in the denominator
  await log('sent');          // no word yet

  const s = await ask();
  expect(s.opens.tracking).toBe(true);
  expect(s.opens.delivered).toBe(4);
  expect(s.opens.opened).toBe(2);
  expect(s.opens.clicked).toBe(1);
  expect(s.opens.rate).toBe(50);
});

test('mail sent before tracking was switched on is left out of the rate', async () => {
  // ten older ones that could never report an open
  for (let i = 0; i < 10; i += 1) await log('delivered', daysAgo(10));
  // and since tracking started: two delivered, one of them opened
  await log('opened', daysAgo(2));
  await log('delivered', daysAgo(1));

  const s = await ask();
  expect(s.opens.partial).toBe(true);
  expect(s.opens.delivered).toBe(2);
  expect(s.opens.rate).toBe(50);          // not 1 in 12
});

test('with no open ever recorded the card says tracking is off', async () => {
  await log('delivered');
  await log('bounced');

  const s = await ask();
  expect(s.opens.tracking).toBe(false);
  expect(s.opens.opened).toBe(0);
  expect(s.opens.rate).toBe(0);
});

test('the day by day line carries opens too', async () => {
  await log('opened');
  await log('delivered');

  const s = await ask();
  const today = s.daily[s.daily.length - 1];
  expect(today.sent).toBe(2);
  expect(today.reached).toBe(2);
  expect(today.opened).toBe(1);
});
