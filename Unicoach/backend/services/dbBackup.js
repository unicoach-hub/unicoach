// Database backups (Admin → Developer → Backups).
//
// A backup is every collection of the main MongoDB database written as JSON lines in MongoDB's
// Extended JSON (so ObjectIds, Dates and numbers come back exactly), then gzipped:
//
//   {"c":"leads","indexes":[...]}            ← one line per collection with its index specs
//   {"c":"leads","d":{"_id":{"$oid":"…"},…}}  ← one line per document
//
// Two ways out:
//  - Download: the owner clicks a button and gets the .jsonl.gz file in the browser.
//  - Off-site, every night (and on demand): the gzip is encrypted with AES-256-GCM using
//    BACKUP_ENCRYPTION_KEY and uploaded to Cloudinary as private raw files (in 8 MB parts, the free
//    plan's raw limit is 10 MB). The last BACKUP_KEEP_DAYS backups are kept. Without the key we
//    never upload: lead data must not leave the server readable.
//
// Restore with scripts/restoreBackup.js. Coolify's own nightly MongoDB backup keeps running too.
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { Readable, Transform } = require('stream');
const { pipeline } = require('stream/promises');
const mongoose = require('mongoose');

const { EJSON } = mongoose.mongo.BSON;
const MAGIC = Buffer.from('UCBK1');
const SALT_LEN = 16;
const IV_LEN = 12;
const TAG_LEN = 16;
const PART_BYTES = 8 * 1024 * 1024;
const FOLDER = 'unicoach-backups';
// Rebuilt from other data or only useful for a few days: not worth backing up
const SKIP_COLLECTIONS = new Set(['apistats', 'visitorevents', 'backupruns']);

const keepDays = () => Math.max(1, Math.min(60, Number(process.env.BACKUP_KEEP_DAYS) || 7));
const encryptionKey = () => {
  const k = String(process.env.BACKUP_ENCRYPTION_KEY || '');
  return k.length >= 24 ? k : '';
};

/* ───────────── dump ───────────── */

/** Every document of every collection as JSON lines. Counts land in `stats`. */
async function* dumpLines(db, stats = {}) {
  const collections = (await db.listCollections({}, { nameOnly: true }).toArray())
    .map((c) => c.name)
    .filter((n) => !n.startsWith('system.') && !SKIP_COLLECTIONS.has(n))
    .sort();
  stats.collections = collections.length;
  stats.docs = 0;
  for (const name of collections) {
    const coll = db.collection(name);
    const indexes = await coll.indexes().catch(() => []);
    yield `${JSON.stringify({ c: name, indexes })}\n`;
    const cursor = coll.find({}, { batchSize: 500 });
    for await (const doc of cursor) {
      stats.docs += 1;
      yield `{"c":${JSON.stringify(name)},"d":${EJSON.stringify(doc, { relaxed: false })}}\n`;
    }
  }
}

/* ───────────── encryption ───────────── */

/** MAGIC | salt | iv | AES-256-GCM ciphertext | tag. The key is scrypt(passphrase, salt). */
function encryptStream(passphrase) {
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv('aes-256-gcm', crypto.scryptSync(passphrase, salt, 32), iv);
  let headerSent = false;
  return new Transform({
    transform(chunk, _enc, done) {
      if (!headerSent) { this.push(Buffer.concat([MAGIC, salt, iv])); headerSent = true; }
      done(null, cipher.update(chunk));
    },
    flush(done) {
      if (!headerSent) this.push(Buffer.concat([MAGIC, salt, iv]));
      this.push(cipher.final());
      this.push(cipher.getAuthTag());
      done();
    },
  });
}

const isEncrypted = (buf) => buf.length > MAGIC.length && buf.subarray(0, MAGIC.length).equals(MAGIC);

/** Encrypted backup → gzip bytes. Throws on a wrong key or a damaged file. */
function decryptBuffer(buf, passphrase) {
  if (!isEncrypted(buf)) throw new Error('Not an encrypted UniCoach backup');
  let o = MAGIC.length;
  const salt = buf.subarray(o, o += SALT_LEN);
  const iv = buf.subarray(o, o += IV_LEN);
  const tag = buf.subarray(buf.length - TAG_LEN);
  const body = buf.subarray(o, buf.length - TAG_LEN);
  const decipher = crypto.createDecipheriv('aes-256-gcm', crypto.scryptSync(passphrase, salt, 32), iv);
  decipher.setAuthTag(tag);
  try {
    return Buffer.concat([decipher.update(body), decipher.final()]);
  } catch {
    throw new Error('Could not decrypt: wrong BACKUP_ENCRYPTION_KEY or a damaged backup');
  }
}

/* ───────────── write ───────────── */

/** Streams a gzipped (and, with a passphrase, encrypted) backup into `dest`. Returns counts. */
async function writeBackup(db, dest, { passphrase } = {}) {
  const stats = {};
  const stages = [Readable.from(dumpLines(db, stats)), zlib.createGzip({ level: 6 })];
  if (passphrase) stages.push(encryptStream(passphrase));
  await pipeline(...stages, dest);
  return stats;
}

/* ───────────── restore ───────────── */

/** Backup bytes (encrypted or plain .jsonl.gz) → { collection: { indexes, docs[] } } */
function readBackup(buf, passphrase) {
  const gz = isEncrypted(buf) ? decryptBuffer(buf, passphrase) : buf;
  const text = zlib.gunzipSync(gz).toString('utf8');
  const out = {};
  for (const line of text.split('\n')) {
    if (!line) continue;
    const row = JSON.parse(line);
    out[row.c] = out[row.c] || { indexes: [], docs: [] };
    if (row.indexes) out[row.c].indexes = row.indexes;
    if (row.d) out[row.c].docs.push(EJSON.deserialize(row.d, { relaxed: false }));
  }
  return out;
}

/** Writes a read backup into `db`. With drop, each collection is emptied first. */
async function restoreInto(db, data, { drop = false, log = () => {} } = {}) {
  for (const [name, { indexes, docs }] of Object.entries(data)) {
    const coll = db.collection(name);
    if (drop) await coll.deleteMany({});
    for (let i = 0; i < docs.length; i += 500) {
      await coll.insertMany(docs.slice(i, i + 500), { ordered: false });
    }
    for (const ix of indexes || []) {
      if (ix.name === '_id_') continue;
      const { key, v, ns, ...options } = ix;
      await coll.createIndex(key, options).catch((e) => log(`  index ${name}.${ix.name} skipped: ${e.message}`));
    }
    log(`  ${name}: ${docs.length} documents`);
  }
}

/* ───────────── Cloudinary (off-site) ───────────── */

const cloud = () => require('cloudinary').v2;
const RAW = { resource_type: 'raw', type: 'authenticated' };

const uploadPart = (buffer, publicId) => new Promise((resolve, reject) => {
  const up = cloud().uploader.upload_stream({ ...RAW, public_id: publicId, overwrite: true }, (err, res) => (err ? reject(err) : resolve(res)));
  up.end(buffer);
});

/** Off-site backups on Cloudinary, newest first: [{ stamp, parts, bytes, createdAt }] */
async function listOffsite() {
  const resources = [];
  let next;
  do {
    const r = await cloud().api.resources({ ...RAW, prefix: `${FOLDER}/`, max_results: 500, next_cursor: next });
    resources.push(...r.resources);
    next = r.next_cursor;
  } while (next);
  const byStamp = new Map();
  for (const r of resources) {
    const stamp = r.public_id.split('/')[1];
    const b = byStamp.get(stamp) || { stamp, parts: 0, bytes: 0, createdAt: r.created_at };
    b.parts += 1;
    b.bytes += r.bytes || 0;
    byStamp.set(stamp, b);
  }
  return [...byStamp.values()].sort((a, b) => (a.stamp < b.stamp ? 1 : -1));
}

/** Downloads every part of one off-site backup and joins them. */
async function downloadOffsite(stamp) {
  const parts = [];
  let next;
  do {
    const r = await cloud().api.resources({ ...RAW, prefix: `${FOLDER}/${stamp}/`, max_results: 500, next_cursor: next });
    parts.push(...r.resources);
    next = r.next_cursor;
  } while (next);
  if (!parts.length) throw new Error(`No backup called ${stamp} on Cloudinary`);
  parts.sort((a, b) => (a.public_id < b.public_id ? -1 : 1));
  const bufs = [];
  for (const p of parts) {
    const url = cloud().utils.private_download_url(p.public_id, '', { ...RAW, attachment: true, expires_at: Math.floor(Date.now() / 1000) + 600 });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download of ${p.public_id} failed: HTTP ${res.status}`);
    bufs.push(Buffer.from(await res.arrayBuffer()));
  }
  return Buffer.concat(bufs);
}

const stampNow = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z'); // 20261110T213000Z

/**
 * Builds an encrypted backup, uploads it to Cloudinary and drops off-site backups beyond keepDays.
 * Records a BackupRun either way and emails the team when it fails. Never throws.
 */
let running = false;
async function runOffsiteBackup({ trigger = 'schedule' } = {}) {
  if (running) return { ok: false, error: 'A backup is already running' };
  running = true;
  try {
    return await runOffsiteBackupNow(trigger);
  } finally {
    running = false;
  }
}

async function runOffsiteBackupNow(trigger) {
  const BackupRun = require('../models/BackupRun');
  const started = Date.now();
  const stamp = stampNow();
  const run = { kind: 'offsite', trigger, stamp, at: new Date() };
  const tmp = path.join(os.tmpdir(), `ucbk-${stamp}-${process.pid}.bin`);
  try {
    const passphrase = encryptionKey();
    if (!passphrase) throw new Error('BACKUP_ENCRYPTION_KEY is not set (24+ characters) in the backend environment');
    const { configureCloudinary } = require('../utils/cloudinary');
    if (!(await configureCloudinary())) throw new Error('Cloudinary is not configured');
    if (mongoose.connection.readyState !== 1) throw new Error('Database is not connected');

    const stats = await writeBackup(mongoose.connection.db, fs.createWriteStream(tmp), { passphrase });
    const buf = fs.readFileSync(tmp);
    let parts = 0;
    for (let o = 0; o < buf.length; o += PART_BYTES) {
      parts += 1;
      await uploadPart(buf.subarray(o, o + PART_BYTES), `${FOLDER}/${stamp}/part-${String(parts).padStart(3, '0')}`);
    }

    // Keep the newest keepDays backups
    const all = await listOffsite();
    const removed = [];
    for (const old of all.slice(keepDays())) {
      await cloud().api.delete_resources_by_prefix(`${FOLDER}/${old.stamp}/`, RAW);
      removed.push(old.stamp);
    }
    Object.assign(run, { ok: true, bytes: buf.length, parts, ...stats, removed, durationMs: Date.now() - started });
    console.log(`[Backup] off-site ${stamp}: ${stats.docs} docs in ${stats.collections} collections, ${(buf.length / 1048576).toFixed(1)} MB, ${parts} part(s)`);
  } catch (err) {
    Object.assign(run, { ok: false, error: String(err.message || err).slice(0, 500), durationMs: Date.now() - started });
    console.error('[Backup] off-site backup failed:', err.message);
    require('../utils/teamAlert').sendTeamAlert({
      subject: 'Database backup FAILED',
      heading: 'Aaj ka database backup nahi bana',
      details: { Kab: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), Error: run.error, Trigger: trigger },
      adminPath: '/developer',
    });
  } finally {
    fs.rmSync(tmp, { force: true });
  }
  await BackupRun.create(run).catch((e) => console.warn('[Backup] could not record the run:', e.message));
  return run;
}

/* ───────────── schedule ───────────── */

let task = null;
/** Every night at 2:30 am India time. Production only; one server at a time (lock). */
function startSchedule() {
  if (task || process.env.NODE_ENV !== 'production' || process.env.DISABLE_DB_BACKUP === 'true') return;
  const cron = require('node-cron');
  const { acquireLock } = require('../unicoach/config/redis');
  task = cron.schedule('30 2 * * *', async () => {
    const owner = `${os.hostname()}:${process.pid}`;
    if (!(await acquireLock('lock:db-backup', owner, 3 * 3600))) return; // another server is on it
    await runOffsiteBackup({ trigger: 'schedule' });
  }, { timezone: 'Asia/Kolkata' });
}

module.exports = {
  dumpLines, writeBackup, readBackup, restoreInto, encryptStream, decryptBuffer, isEncrypted,
  listOffsite, downloadOffsite, runOffsiteBackup, startSchedule, encryptionKey, keepDays, isRunning: () => running, FOLDER, PART_BYTES,
};
