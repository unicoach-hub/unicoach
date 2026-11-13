// The admin action log: the actions worth answering for are recorded with who did them, reads are
// not, and a log that cannot be written never breaks the request.
process.env.JWT_SECRET = process.env.JWT_SECRET || '0123456789abcdefghij';
jest.setTimeout(120000);

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const AdminAudit = require('../models/AdminAudit');
const { adminAudit } = require('../middleware/adminAudit');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });
beforeEach(async () => { await AdminAudit.deleteMany({}); });

// Drives the middleware the way Express would: run it, then finish the response.
const call = async ({ method, path, body = {}, user, staff, status = 200 }) => {
  const listeners = [];
  const req = { method, path, body, user, staff, ip: '1.2.3.4' };
  const res = { statusCode: status, on: (evt, fn) => { if (evt === 'finish') listeners.push(fn); } };
  let passed = false;
  adminAudit(req, res, () => { passed = true; });
  listeners.forEach((fn) => fn());
  await res.auditWrite?.catch(() => {}); // the middleware leaves its write here for us to await
  return { passed };
};

const owner = { id: new mongoose.Types.ObjectId(), role: 'admin', name: 'Sagar', email: 'sagar@visawebs.com' };
const staffUser = { id: new mongoose.Types.ObjectId(), role: 'staff' };
const staffRow = { name: 'Mayur Bansal', email: 'mayur@visawebs.com' };

describe('admin action log', () => {
  it('records a refund with who did it and what it was', async () => {
    const { passed } = await call({ method: 'POST', path: '/unicoach/bookings/abc123/refund', user: owner });
    expect(passed).toBe(true);

    const [entry] = await AdminAudit.find({});
    expect(entry.action).toBe('unicoach.booking.refund');
    expect(entry.targetId).toBe('abc123');
    expect(entry.summary).toBe('Refunded booking abc123');
    expect(entry.actorEmail).toBe('sagar@visawebs.com');
    expect(entry.actorRole).toBe('admin');
    expect(entry.ok).toBe(true);
  });

  it('names the staff member who did it, not just "staff"', async () => {
    await call({ method: 'POST', path: '/unicoach/weekly-payouts/m1/paid', user: staffUser, staff: staffRow });

    const [entry] = await AdminAudit.find({});
    expect(entry.actorName).toBe('Mayur Bansal');
    expect(entry.actorEmail).toBe('mayur@visawebs.com');
    expect(entry.actorRole).toBe('staff');
  });

  it('records deletions of creators, reviews and leads', async () => {
    await call({ method: 'DELETE', path: '/unicoach/mentors/m9', user: owner });
    await call({ method: 'DELETE', path: '/unicoach/reviews/r9', user: owner });
    await call({ method: 'DELETE', path: '/leads/l9', user: owner });

    const actions = (await AdminAudit.find({}).sort({ action: 1 })).map((e) => e.action);
    expect(actions).toEqual(['lead.delete', 'unicoach.mentor.delete', 'unicoach.review.delete']);
  });

  it('says what a status or application change actually did', async () => {
    await call({ method: 'PATCH', path: '/unicoach/mentors/m1/status', body: { active: false }, user: owner });
    await call({ method: 'PATCH', path: '/unicoach/mentors/m2/application', body: { applicationStatus: 'APPROVED' }, user: owner });

    const summaries = (await AdminAudit.find({}).sort({ createdAt: 1 })).map((e) => e.summary);
    expect(summaries).toContain('Suspended mentor m1');
    expect(summaries).toContain('Set mentor m2 application to APPROVED');
  });

  it('records a password change without ever storing the password', async () => {
    await call({ method: 'PUT', path: '/auth/profile', body: { password: 'hunter2hunter2' }, user: owner });

    const [entry] = await AdminAudit.find({});
    expect(entry.summary).toBe('Changed the admin password');
    expect(JSON.stringify(entry)).not.toContain('hunter2');
  });

  it('keeps a failed attempt, marked as failed', async () => {
    await call({ method: 'DELETE', path: '/unicoach/mentors/m1', user: owner, status: 403 });

    const [entry] = await AdminAudit.find({});
    expect(entry.ok).toBe(false);
    expect(entry.statusCode).toBe(403);
  });

  it('ignores reads and anything not worth logging', async () => {
    await call({ method: 'GET', path: '/unicoach/mentors', user: owner });
    await call({ method: 'GET', path: '/leads', user: owner });
    await call({ method: 'POST', path: '/leads/l1/notes', user: owner });

    expect(await AdminAudit.countDocuments({})).toBe(0);
  });

  it('lets the request through even when the log cannot be written', async () => {
    const spy = jest.spyOn(AdminAudit, 'create').mockRejectedValue(new Error('mongo down'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { passed } = await call({ method: 'POST', path: '/unicoach/bookings/b1/refund', user: owner });
    expect(passed).toBe(true);

    spy.mockRestore();
    warn.mockRestore();
  });
});
