// An admin token must stop working once the admin password changes: the owner's tokenVersion is
// bumped on a password change, and every owner guard checks it against the token's `tv`.
process.env.JWT_SECRET = process.env.JWT_SECRET || '0123456789abcdefghij';
jest.setTimeout(120000);

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const { requireAdmin, requireOwner, requireAdminSession } = require('../middleware/auth');
const { JWT_SECRET } = require('../config/jwt');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongo.getUri());
});
afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });
beforeEach(async () => { await User.deleteMany({}); });

const run = async (guard, tokenPayload) => {
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '12h' });
  const req = { user: jwt.verify(token, JWT_SECRET), originalUrl: '/api/admin/leads', method: 'POST' };
  const res = { code: 200 };
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  let passed = false;
  await guard(req, res, () => { passed = true; });
  return { passed, code: res.code };
};

const owner = () => User.create({ name: 'Owner', username: 'owner', role: 'admin', passwordHash: 'x' });

describe('owner admin session', () => {
  it('accepts a token minted from the current password', async () => {
    const user = await owner();
    const r = await run(requireAdmin, { id: String(user._id), role: 'admin', tv: 0 });
    expect(r.passed).toBe(true);
  });

  it('rejects an old token after the password changed', async () => {
    const user = await owner();
    const old = { id: String(user._id), role: 'admin', tv: 0 };

    // what adminAuthController does on a password change
    await User.updateOne({ _id: user._id }, { $inc: { tokenVersion: 1 } });

    const r = await run(requireAdmin, old);
    expect(r.passed).toBe(false);
    expect(r.code).toBe(401);

    // signing in again mints tv: 1, which works
    const fresh = await run(requireAdmin, { id: String(user._id), role: 'admin', tv: 1 });
    expect(fresh.passed).toBe(true);
  });

  it('accepts a token issued before tokenVersion existed, while the account is still on version 0', async () => {
    const user = await owner();
    const r = await run(requireAdmin, { id: String(user._id), role: 'admin' }); // no tv
    expect(r.passed).toBe(true);
  });

  it('rejects a token for an admin account that no longer exists', async () => {
    const r = await run(requireAdmin, { id: String(new mongoose.Types.ObjectId()), role: 'admin', tv: 0 });
    expect(r.passed).toBe(false);
    expect(r.code).toBe(401);
  });

  it('rejects a token whose account was demoted out of the admin role', async () => {
    const user = await User.create({ name: 'Ex', username: 'ex', role: 'user', passwordHash: 'x' });
    const r = await run(requireAdmin, { id: String(user._id), role: 'admin', tv: 0 });
    expect(r.passed).toBe(false);
    expect(r.code).toBe(401);
  });

  it('applies the same check on the owner-only and profile guards', async () => {
    const user = await owner();
    await User.updateOne({ _id: user._id }, { $inc: { tokenVersion: 1 } });
    const stale = { id: String(user._id), role: 'admin', tv: 0 };

    expect((await run(requireOwner, stale)).code).toBe(401);
    expect((await run(requireAdminSession, stale)).code).toBe(401);

    const fresh = { id: String(user._id), role: 'admin', tv: 1 };
    expect((await run(requireOwner, fresh)).passed).toBe(true);
    expect((await run(requireAdminSession, fresh)).passed).toBe(true);
  });
});
