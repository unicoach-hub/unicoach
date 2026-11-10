const mongoose = require('mongoose');

// One database backup: an off-site upload (services/dbBackup.js) or a download from Admin → Developer.
// Kept for 180 days so the Backups card can show the history.
const backupRunSchema = new mongoose.Schema({
  kind: { type: String, enum: ['offsite', 'download'], required: true },
  trigger: { type: String, default: '' }, // schedule | manual | the admin's email for downloads
  stamp: { type: String, default: '' }, // folder name on Cloudinary
  ok: { type: Boolean, default: false },
  error: { type: String, default: '' },
  bytes: { type: Number },
  parts: { type: Number },
  collections: { type: Number },
  docs: { type: Number },
  removed: [String], // older off-site backups deleted by the retention rule
  durationMs: { type: Number },
  at: { type: Date, default: Date.now },
}, { versionKey: false });

backupRunSchema.index({ at: 1 }, { expireAfterSeconds: 180 * 24 * 3600, name: 'at_ttl' });

module.exports = mongoose.model('BackupRun', backupRunSchema);
