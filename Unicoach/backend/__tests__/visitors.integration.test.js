// Anonymous visitor tracking (POST /api/t) and the owner's Visitors page, against an in-memory MongoDB.
jest.setTimeout(120000);

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Visitor = require('../models/Visitor');
const VisitorEvent = require('../models/VisitorEvent');
const Lead = require('../models/Lead');
const ctrl = require('../controllers/visitorController');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
  await Promise.all([Visitor.syncIndexes(), VisitorEvent.syncIndexes()]);
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
beforeEach(async () => {
  await Promise.all([Visitor.deleteMany({}), VisitorEvent.deleteMany({}), Lead.deleteMany({})]);
});

const CHROME = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
const beacon = async (payload, { ua = CHROME, ip = '49.36.0.1', asText = true } = {}) => {
  const res = { status() { return res; }, end() { return res; } };
  await ctrl.track({ headers: { 'user-agent': ua }, ip, body: asText ? JSON.stringify(payload) : payload }, res);
};
const call = async (fn, req = {}) => {
  const res = { code: 200 };
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  await fn({ params: {}, query: {}, ...req }, res);
  return res;
};
const V = 'visitor_abc12345';
const d = { device: 'mobile', os: 'Android', browser: 'Chrome', sw: 412, lang: 'en-IN' };

test('page views, time on page and a new visit are recorded; the city comes from the IP, which is not stored', async () => {
  await beacon({ v: V, s: 'sess_one_1', d, src: 'instagram / paid · diwali', lp: '/', e: [{ t: 'pv', i: 'pv000001', p: '/', ti: 'Home' }, { t: 'pv', i: 'pv000002', p: '/study-abroad/canada' }] });
  await beacon({ v: V, s: 'sess_one_1', e: [{ t: 'pe', i: 'pv000002', du: 95, sc: 80 }, { t: 'pe', i: 'pv000002', du: 20, sc: 60 }] });

  const v = await Visitor.findById(V).lean();
  expect(v).toMatchObject({ sessions: 1, pageviews: 2, timeSec: 115, device: 'mobile', firstSource: 'instagram / paid · diwali', landingPage: '/', lastPage: '/study-abroad/canada', converted: false });
  expect(v.city).toBe('Mumbai');
  expect(JSON.stringify(v)).not.toContain('49.36.0.1');
  expect(v.expireAt.getTime()).toBeGreaterThan(Date.now() + 80 * 86400e3);

  const pv = await VisitorEvent.findById(`${V}:pv000002`).lean();
  expect(pv).toMatchObject({ durationSec: 115, scroll: 80, path: '/study-abroad/canada' });

  await beacon({ v: V, s: 'sess_two_2', e: [{ t: 'pv', i: 'pv000003', p: '/exams/ielts' }] });
  expect((await Visitor.findById(V).lean()).sessions).toBe(2);
});

test('bots, headless browsers and junk are ignored', async () => {
  await beacon({ v: V, s: 'sess_one_1', e: [{ t: 'pv', i: 'pv000001', p: '/' }] }, { ua: 'Mozilla/5.0 HeadlessChrome/130.0' });
  await beacon({ v: V, s: 'sess_one_1', e: [{ t: 'pv', i: 'pv000001', p: '/' }] }, { ua: 'Googlebot/2.1' });
  await beacon({ v: 'x', e: [{ t: 'pv', p: '/' }] });
  await beacon('not json at all', { asText: false });
  await beacon({ v: V, s: 'sess_one_1', e: [{ t: 'nope', p: '/' }] });
  expect(await Visitor.countDocuments()).toBe(0);
  expect(await VisitorEvent.countDocuments()).toBe(0);
});

test('problems and a form submission: the visitor joins the lead with that email', async () => {
  const lead = await Lead.create({ name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+919876543210', source: 'Check Eligibility Modal' });
  await beacon({ v: V, s: 'sess_one_1', d, e: [
    { t: 'pv', i: 'pv000001', p: '/book-consultation' },
    { t: 'fs', p: '/book-consultation', x: 'Book a call' },
    { t: 'err', p: '/book-consultation', x: 'TypeError: x is undefined' },
    { t: 'rage', p: '/book-consultation', x: 'button: Next' },
    { t: 'api', p: '/book-consultation', x: 'POST /api/consultations → 502' },
    { t: 'cv', p: '/book-consultation', k: '/api/leads/submit', em: 'Rahul@Example.com', nm: 'Rahul' },
  ] });
  const v = await Visitor.findById(V).lean();
  expect(v.issues).toMatchObject({ errors: 1, rageClicks: 1, apiFails: 1, formStarts: 1, formAbandons: 0 });
  expect(v).toMatchObject({ converted: true, conversions: 1, lastConversion: 'Lead form', leadName: 'Rahul Sharma' });
  expect(String(v.leadId)).toBe(String(lead._id));
});

test('admin views: returning-without-form list, summary numbers and one visitor\'s timeline', async () => {
  // came back 3 times, never filled a form
  for (const s of ['sess_aaa_1', 'sess_aaa_2', 'sess_aaa_3']) {
    await beacon({ v: 'visitor_returning1', s, d, src: 'google.com', e: [{ t: 'pv', i: `pv_${s}`, p: '/study-abroad/uk' }] });
  }
  await beacon({ v: 'visitor_returning1', s: 'sess_aaa_3', e: [{ t: 'fa', p: '/study-abroad/uk', x: 'Check eligibility (2 fields filled)' }] });
  // one visit, filled a form
  await beacon({ v: 'visitor_converted1', s: 'sess_bbb_1', d, e: [{ t: 'pv', i: 'pv_b1', p: '/study-abroad/uk' }, { t: 'cv', p: '/study-abroad/uk', k: '/api/consultations', nm: 'Asha' }] });
  // one visit, nothing else
  await beacon({ v: 'visitor_onceonly1', s: 'sess_ccc_1', d, e: [{ t: 'pv', i: 'pv_c1', p: '/' }] });

  const returning = await call(ctrl.list, { query: { view: 'returning' } });
  expect(returning.body.rows.map((r) => r._id)).toEqual(['visitor_returning1']);
  expect(returning.body.rows[0]).toMatchObject({ sessions: 3, issues: expect.objectContaining({ formAbandons: 1 }) });

  const converted = await call(ctrl.list, { query: { view: 'converted' } });
  expect(converted.body.rows).toEqual([expect.objectContaining({ _id: 'visitor_converted1', leadName: 'Asha', lastConversion: 'Counsellor call booked' })]);

  const search = await call(ctrl.list, { query: { view: 'all', q: 'google' } });
  expect(search.body.total).toBe(1);

  const s = await call(ctrl.summary, { query: { days: 30 } });
  expect(s.body.totals).toMatchObject({ visitors: 3, returning: 1, returningNoForm: 1, converted: 1, pageviews: 5, formAbandons: 1 });
  const uk = s.body.pages.find((p) => p.path === '/study-abroad/uk');
  expect(uk).toMatchObject({ views: 4, visitors: 2, converted: 1 });
  expect(s.body.issues).toEqual([expect.objectContaining({ type: 'fa', path: '/study-abroad/uk', count: 1 })]);
  expect(s.body.exits.find((e) => e.path === '/')).toMatchObject({ exits: 1, bounces: 1 });

  const one = await call(ctrl.detail, { params: { id: 'visitor_returning1' } });
  expect(one.body.visitor.sessions).toBe(3);
  expect(one.body.events).toHaveLength(4);
  expect((await call(ctrl.detail, { params: { id: '../etc' } })).code).toBe(404);
});
