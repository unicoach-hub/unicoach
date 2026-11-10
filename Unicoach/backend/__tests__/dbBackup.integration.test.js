// Database backups against an in-memory MongoDB: a backup restores into another database exactly,
// encryption rejects a wrong key or a damaged file, and the off-site run uploads to Cloudinary,
// keeps the newest N backups and alerts the team when it can't run. Cloudinary is mocked.
jest.setTimeout(120000);

const mockUploads = [];
const mockDeleted = [];
let mockExisting = [];
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: (opts, cb) => ({ end: (buf) => { mockUploads.push({ opts, bytes: buf.length, buf: Buffer.from(buf) }); cb(null, { public_id: opts.public_id }); } }),
    },
    api: {
      resources: jest.fn(async ({ prefix }) => ({
        resources: [
          ...mockExisting.map((stamp) => ({ public_id: `unicoach-backups/${stamp}/part-001`, bytes: 100, created_at: stamp })),
          ...mockUploads.map((u) => ({ public_id: u.opts.public_id, bytes: u.bytes, created_at: 'now' })),
        ].filter((r) => r.public_id.startsWith(prefix)),
      })),
      delete_resources_by_prefix: jest.fn(async (prefix) => { mockDeleted.push(prefix); }),
    },
    utils: { private_download_url: jest.fn() },
  },
}));
jest.mock('../utils/cloudinary', () => ({ configureCloudinary: jest.fn(async () => true) }));
const mockAlert = jest.fn();
jest.mock('../utils/teamAlert', () => ({ sendTeamAlert: (...a) => mockAlert(...a) }));

const { Writable } = require('stream');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const backup = require('../services/dbBackup');
const BackupRun = require('../models/BackupRun');

let mongo;
let source;
let target;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(`${mongo.getUri()}source`);
  source = mongoose.connection.db;
  target = (await mongoose.createConnection(`${mongo.getUri()}restored`).asPromise()).db;
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
beforeEach(async () => {
  await source.dropDatabase();
  await target.dropDatabase();
  mockUploads.length = 0;
  mockDeleted.length = 0;
  mockExisting = [];
  mockAlert.mockClear();
  delete process.env.BACKUP_ENCRYPTION_KEY;
});

const KEY = 'a-long-test-passphrase-for-backups-123';
const toBuffer = async (fn) => {
  const chunks = [];
  const sink = new Writable({ write(c, _e, done) { chunks.push(c); done(); } });
  await fn(sink);
  return Buffer.concat(chunks);
};
const seed = async () => {
  const id = new mongoose.Types.ObjectId();
  await source.collection('leads').insertMany([
    { _id: id, name: 'Rahul', email: 'rahul@example.com', createdAt: new Date('2026-11-01T10:00:00Z'), score: 82, tags: ['canada'], nested: { a: { b: 1.5 } } },
    { name: 'Asha', phone: '+919876543210', createdAt: new Date('2026-11-02T10:00:00Z'), owner: id, big: mongoose.mongo.Long.fromString('9007199254740993') },
  ]);
  await source.collection('leads').createIndex({ email: 1 }, { unique: true, sparse: true, name: 'email_unique' });
  await source.collection('users').insertOne({ name: 'Sagar', role: 'admin' });
  await source.collection('apistats').insertOne({ route: '/api/x', count: 5 }); // skipped
  return id;
};

test('an encrypted backup restores into a fresh database exactly, indexes included', async () => {
  const id = await seed();
  const buf = await toBuffer((sink) => backup.writeBackup(source, sink, { passphrase: KEY }));
  expect(backup.isEncrypted(buf)).toBe(true);
  expect(buf.includes(Buffer.from('rahul@example.com'))).toBe(false); // nothing readable inside

  const data = backup.readBackup(buf, KEY);
  expect(Object.keys(data).sort()).toEqual(['leads', 'users']);
  await backup.restoreInto(target, data);

  const restored = await target.collection('leads').find().sort({ createdAt: 1 }).toArray();
  const original = await source.collection('leads').find().sort({ createdAt: 1 }).toArray();
  expect(restored).toEqual(original);
  expect(restored[0]._id.equals(id)).toBe(true);
  expect(restored[0].createdAt).toBeInstanceOf(Date);
  expect(restored[1].owner).toBeInstanceOf(mongoose.Types.ObjectId);
  expect(restored[1].big.toString()).toBe('9007199254740993');
  expect((await target.collection('leads').indexes()).map((i) => i.name)).toContain('email_unique');
  expect(await target.collection('users').countDocuments()).toBe(1);
});

test('a plain download (.jsonl.gz) restores too, and --drop replaces existing data', async () => {
  await seed();
  const buf = await toBuffer((sink) => backup.writeBackup(source, sink));
  expect(buf.subarray(0, 2).equals(Buffer.from([0x1f, 0x8b]))).toBe(true); // gzip
  await target.collection('leads').insertOne({ name: 'stale' });
  await backup.restoreInto(target, backup.readBackup(buf), { drop: true });
  expect((await target.collection('leads').find().toArray()).map((d) => d.name).sort()).toEqual(['Asha', 'Rahul']);
});

test('a wrong key or a damaged file is refused', async () => {
  await seed();
  const buf = await toBuffer((sink) => backup.writeBackup(source, sink, { passphrase: KEY }));
  expect(() => backup.readBackup(buf, 'wrong-passphrase-wrong-passphrase')).toThrow(/wrong BACKUP_ENCRYPTION_KEY or a damaged/);
  const damaged = Buffer.from(buf);
  damaged[60] ^= 0xff;
  expect(() => backup.readBackup(damaged, KEY)).toThrow(/damaged/);
});

test('off-site run: refuses without a key and emails the team', async () => {
  const run = await backup.runOffsiteBackup({ trigger: 'manual' });
  expect(run).toMatchObject({ ok: false, error: expect.stringContaining('BACKUP_ENCRYPTION_KEY') });
  expect(mockUploads).toHaveLength(0);
  expect(mockAlert).toHaveBeenCalledWith(expect.objectContaining({ subject: 'Database backup FAILED' }));
  expect(await BackupRun.countDocuments({ ok: false })).toBe(1);
});

test('off-site run: uploads private encrypted parts and keeps only the newest 7 backups', async () => {
  await seed();
  process.env.BACKUP_ENCRYPTION_KEY = KEY;
  mockExisting = ['20261101T210000Z', '20261102T210000Z', '20261103T210000Z', '20261104T210000Z', '20261105T210000Z', '20261106T210000Z', '20261107T210000Z', '20261108T210000Z'];

  const run = await backup.runOffsiteBackup({ trigger: 'manual' });
  expect(run).toMatchObject({ ok: true, parts: 1, collections: 2, docs: 3 });
  expect(mockUploads[0].opts).toMatchObject({ resource_type: 'raw', type: 'authenticated', public_id: `unicoach-backups/${run.stamp}/part-001` });

  // the uploaded bytes are a real, restorable backup
  await backup.restoreInto(target, backup.readBackup(mockUploads[0].buf, KEY));
  expect(await target.collection('leads').countDocuments()).toBe(2);

  // 8 old + 1 new = 9 → the 2 oldest go
  expect([...mockDeleted].sort()).toEqual(['unicoach-backups/20261101T210000Z/', 'unicoach-backups/20261102T210000Z/']);
  expect(mockAlert).not.toHaveBeenCalled();
  expect(await BackupRun.findOne({ stamp: run.stamp }).lean()).toMatchObject({ ok: true, removed: expect.arrayContaining(['20261101T210000Z', '20261102T210000Z']) });
});

test('the Download button streams a readable .jsonl.gz of the whole database and logs the run', async () => {
  await seed();
  const express = require('express');
  const request = require('supertest');
  const ctrl = require('../controllers/backupController');
  const app = express();
  app.get('/dl', (req, res, next) => { req.user = { email: 'owner@example.com' }; next(); }, ctrl.download);
  const res = await request(app).get('/dl').buffer(true).parse((r, cb) => { const c = []; r.on('data', (d) => c.push(d)); r.on('end', () => cb(null, Buffer.concat(c))); });
  expect(res.status).toBe(200);
  expect(res.headers['content-disposition']).toMatch(/attachment; filename="unicoach-db-\d{12}\.jsonl\.gz"/);
  const data = backup.readBackup(res.body);
  expect(data.leads.docs).toHaveLength(2);
  await new Promise((r) => setTimeout(r, 200));
  expect(await BackupRun.findOne({ kind: 'download' }).lean()).toMatchObject({ ok: true, trigger: 'owner@example.com', docs: 3 });
});
