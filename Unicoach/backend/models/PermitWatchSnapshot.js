// One stored copy of a watched page: its text, its document links and its fingerprint.
// The container's filesystem is read-only, so the snapshots live here instead of on disk, and
// they survive a redeploy. `key` is the page URL, or "_sitemap" for the discovered page list.
const mongoose = require('mongoose');

const permitWatchSnapshotSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true, minimize: false });

module.exports = mongoose.models.PermitWatchSnapshot
  || mongoose.model('PermitWatchSnapshot', permitWatchSnapshotSchema);
