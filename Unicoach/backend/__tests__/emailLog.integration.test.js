// The email log: every send is written down, and Resend's webhook tells it what happened next.
jest.setTimeout(120000);

const crypto = require('crypto');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const EmailLog = require('../models/EmailLog');
const Lead = require('../models/Lead');
const { receiveWebhook } = require('../controllers/emailWebhookController');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
  process.env.RESEND_WEBHOOK_SECRET = `whsec_${Buffer.from('a-test-signing-secret').toString('base64')}`;
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });
beforeEach(() => Promise.all([EmailLog.deleteMany({}), Lead.deleteMany({})]));

// a request signed the way Svix (and so Resend) signs it
const signed = (body, { secret = process.env.RESEND_WEBHOOK_SECRET, timestamp, id = 'msg_1' } = {}) => {
  const raw = Buffer.from(JSON.stringify(body));
  const ts = String(timestamp ?? Math.floor(Date.now() / 1000));
  const key = Buffer.from(String(secret).replace(/^whsec_/, ''), 'base64');
  const sig = crypto.createHmac('sha256', key).update(`${id}.${ts}.${raw.toString('utf8')}`).digest('base64');
  const headers = { 'svix-id': id, 'svix-timestamp': ts, 'svix-signature': `v1,${sig}` };
  return { body, rawBody: raw, get: (h) => headers[h.toLowerCase()] };
};

const run = async (req) => {
  const res = { code: 200 };
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  await receiveWebhook(req, res);
  // the handler answers Resend first and finishes the write right after
  await new Promise((r) => setTimeout(r, 120));
  return res;
};

const event = (type, extra = {}) => ({
  type,
  created_at: new Date().toISOString(),
  data: { email_id: 'eml_1', to: ['ravi@example.com'], subject: 'Your UniCoach call', ...extra },
});

const seedLog = () => EmailLog.create({
  to: 'ravi@example.com', recipients: ['ravi@example.com'], subject: 'Your UniCoach call',
  kind: 'counselling', provider: 'resend', providerMessageId: 'eml_1', status: 'sent',
});

test('an unsigned call is turned away and nothing is written', async () => {
  const res = await run({ body: event('email.delivered'), rawBody: Buffer.from('{}'), get: () => undefined });
  expect(res.code).toBe(401);
  expect(await EmailLog.countDocuments({})).toBe(0);
});

test('a call signed with the wrong secret is turned away', async () => {
  const res = await run(signed(event('email.delivered'), { secret: `whsec_${Buffer.from('not-our-secret').toString('base64')}` }));
  expect(res.code).toBe(401);
});

test('an old signature is turned away, even though it is valid', async () => {
  const res = await run(signed(event('email.delivered'), { timestamp: Math.floor(Date.now() / 1000) - 3600 }));
  expect(res.code).toBe(401);
});

test('delivered moves the row on and keeps the event', async () => {
  await seedLog();
  const res = await run(signed(event('email.delivered')));
  expect(res.code).toBe(200);

  const log = await EmailLog.findOne({ providerMessageId: 'eml_1' });
  expect(log.status).toBe('delivered');
  expect(log.events.map((e) => e.type)).toContain('delivered');
});

test('an open after a delivery moves it on, a later delivery does not move it back', async () => {
  await seedLog();
  await run(signed(event('email.delivered')));
  await run(signed(event('email.opened')));
  await run(signed(event('email.delivered')));

  const log = await EmailLog.findOne({ providerMessageId: 'eml_1' });
  expect(log.status).toBe('opened');
  expect(log.events.map((e) => e.type)).toEqual(['delivered', 'opened', 'delivered']);
});

test('a bounce wins over a delivery and tags the lead', async () => {
  await seedLog();
  const lead = await Lead.create({ name: 'Ravi', email: 'ravi@example.com', phone: '9812345678' });
  await run(signed(event('email.delivered')));
  await run(signed(event('email.bounced', { bounce: { message: 'Mailbox does not exist' } })));

  const log = await EmailLog.findOne({ providerMessageId: 'eml_1' });
  expect(log.status).toBe('bounced');
  expect(log.error).toMatch(/Mailbox does not exist/);

  const after = await Lead.findById(lead._id);
  expect(after.tags).toContain('email-bounced');
  expect(after.unsubscribed).toBe(false);
});

test('a spam complaint unsubscribes the lead', async () => {
  await seedLog();
  const lead = await Lead.create({ name: 'Ravi', email: 'ravi@example.com', phone: '9812345679' });
  await run(signed(event('email.complained')));

  const after = await Lead.findById(lead._id);
  expect(after.unsubscribed).toBe(true);
  expect(after.tags).toContain('email-spam-complaint');
  expect(after.activities.at(-1).comment).toMatch(/spam/i);
});

test('an event for an email we never logged still gets a row', async () => {
  await run(signed(event('email.delivered')));
  const log = await EmailLog.findOne({ providerMessageId: 'eml_1' });
  expect(log.to).toBe('ravi@example.com');
  expect(log.status).toBe('delivered');
});

test('one message id is never logged twice', async () => {
  await seedLog();
  await expect(seedLog()).rejects.toThrow();
  expect(await EmailLog.countDocuments({})).toBe(1);
});
