const mongoose = require('mongoose');

/**
 * Who did what in the admin panel.
 *
 * Only writes are recorded, and only the ones that matter: money, deletions, approvals, access.
 * Reads are not logged, so this stays small and readable. Request bodies are never stored whole;
 * each entry keeps the route, the target id and a short summary, so no passwords, bank numbers or
 * student PII end up in the log.
 */
const adminAuditSchema = new mongoose.Schema({
  // Who
  actorId: { type: mongoose.Schema.Types.ObjectId, index: true },
  actorName: { type: String, default: '' },
  actorEmail: { type: String, default: '' },
  actorRole: { type: String, enum: ['admin', 'staff'], default: 'admin' },

  // What
  action: { type: String, required: true, index: true }, // e.g. "unicoach.booking.refund"
  method: { type: String, default: '' },
  path: { type: String, default: '' },
  targetId: { type: String, default: '' },
  summary: { type: String, default: '' },

  // How it went
  statusCode: { type: Number },
  ok: { type: Boolean, index: true },

  ip: { type: String, default: '' },
}, { timestamps: true });

// Keep a year of history, then let Mongo clean up on its own
adminAuditSchema.index({ createdAt: -1 });
adminAuditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

module.exports = mongoose.model('AdminAudit', adminAuditSchema);
