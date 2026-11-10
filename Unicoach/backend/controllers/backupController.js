// Admin → Developer → Backups (owner only). See services/dbBackup.js.
const mongoose = require('mongoose');
const BackupRun = require('../models/BackupRun');
const backup = require('../services/dbBackup');

/** GET /api/admin/dev/backups: setup, recent runs and the backups on Cloudinary */
exports.status = async (req, res) => {
  try {
    const runs = await BackupRun.find().sort({ at: -1 }).limit(20).lean();
    let offsite = null;
    let offsiteError = '';
    const { configureCloudinary } = require('../utils/cloudinary');
    const cloudinaryReady = await configureCloudinary().catch(() => false);
    if (cloudinaryReady) {
      offsite = await backup.listOffsite().catch((e) => { offsiteError = e.message || String(e); return null; });
    }
    return res.json({
      setup: {
        encryptionKey: Boolean(backup.encryptionKey()),
        cloudinary: Boolean(cloudinaryReady),
        keepDays: backup.keepDays(),
        schedule: 'Every night at 2:30 am (India time)',
        scheduleOn: process.env.NODE_ENV === 'production' && process.env.DISABLE_DB_BACKUP !== 'true',
      },
      running: backup.isRunning(),
      runs,
      offsite,
      offsiteError,
    });
  } catch (err) {
    console.error('[Backup] status failed:', err);
    return res.status(500).json({ message: 'Could not load backups' });
  }
};

/** POST /api/admin/dev/backups/run: start an off-site backup now (answers straight away) */
exports.runNow = async (req, res) => {
  if (backup.isRunning()) return res.status(409).json({ message: 'A backup is already running' });
  if (!backup.encryptionKey()) return res.status(400).json({ message: 'Set BACKUP_ENCRYPTION_KEY in the backend environment first' });
  backup.runOffsiteBackup({ trigger: `manual: ${req.user?.email || 'owner'}` });
  return res.status(202).json({ started: true });
};

/** GET /api/admin/dev/backups/download: the whole database as a .jsonl.gz file */
exports.download = async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Database is not connected' });
  const started = Date.now();
  const name = `unicoach-db-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}.jsonl.gz`;
  res.setHeader('Content-Type', 'application/gzip');
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
  res.setHeader('Cache-Control', 'no-store');
  let bytes = 0;
  const counter = new (require('stream').Transform)({
    transform(chunk, _e, done) { bytes += chunk.length; done(null, chunk); },
  });
  const run = { kind: 'download', trigger: req.user?.email || 'owner', at: new Date() };
  try {
    const { pipeline } = require('stream/promises');
    const { Readable } = require('stream');
    const zlib = require('zlib');
    const stats = {};
    await pipeline(Readable.from(backup.dumpLines(mongoose.connection.db, stats)), zlib.createGzip({ level: 6 }), counter, res);
    Object.assign(run, { ok: true, bytes, ...stats, durationMs: Date.now() - started });
  } catch (err) {
    Object.assign(run, { ok: false, error: String(err.message || err).slice(0, 500), durationMs: Date.now() - started });
    console.error('[Backup] download failed:', err.message);
    if (!res.headersSent) res.status(500).json({ message: 'Backup failed' });
    else res.destroy(err);
  }
  BackupRun.create(run).catch(() => {});
};
