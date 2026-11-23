// Who gets the Irish employment-permit alerts, and how often the pages are checked.
// One document. Edited from the admin Developer section, so adding a teammate needs no deploy.
// The environment (ALERT_EMAIL_TO / ALERT_WHATSAPP_TO) stays as a fallback for a standalone run.
const mongoose = require('mongoose');

const permitWatchConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true },

  // Everyone who should hear about a change
  emails: { type: [String], default: [] },
  phones: { type: [String], default: [] },

  // false pauses the alerts without removing anybody
  enabled: { type: Boolean, default: true },

  // Minutes between checks. Empty falls back to config/permitWatch.json
  newsIntervalMinutes: { type: Number, default: null },
  intervalMinutes: { type: Number, default: null },

  lastRunAt: { type: Date },
  lastChangeAt: { type: Date },
  updatedBy: { type: String, default: '' },
}, { timestamps: true });

const EMPTY = { key: 'default', emails: [], phones: [], enabled: true, newsIntervalMinutes: null, intervalMinutes: null };

/**
 * The single document, or sensible defaults when nobody has saved anything yet.
 * Reading never writes: the document appears the first time the list is saved.
 */
permitWatchConfigSchema.statics.get = async function get() {
  return (await this.findOne({ key: 'default' }).lean()) || { ...EMPTY };
};

module.exports = mongoose.models.PermitWatchConfig || mongoose.model('PermitWatchConfig', permitWatchConfigSchema);
