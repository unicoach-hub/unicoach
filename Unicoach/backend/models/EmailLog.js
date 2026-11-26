const mongoose = require('mongoose');

// One row per email we send, kept for good.
//
// Resend only keeps its own logs for 30 days, so this is the record that survives: who it went to,
// what it was, and what happened to it afterwards (delivered, opened, bounced, marked as spam).
// The later events arrive on the Resend webhook and are matched by `providerMessageId`.
const eventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  at: { type: Date, default: Date.now },
  info: { type: String, default: '' },
}, { _id: false });

const emailLogSchema = new mongoose.Schema({
  to: { type: String, default: '', lowercase: true, trim: true, index: true },
  recipients: { type: [String], default: [] },
  subject: { type: String, default: '' },
  kind: { type: String, default: '', index: true },   // account | mentors | bookings | automation …
  from: { type: String, default: '' },
  sentBy: { type: String, default: '' },              // "Automation", "Campaign: …", a staff name

  provider: { type: String, enum: ['resend', 'smtp', 'simulated'], default: 'resend' },
  providerMessageId: { type: String, default: '' },

  // Where the email got to. Later events only move it forward, never back.
  status: {
    type: String,
    enum: ['sent', 'delivered', 'opened', 'clicked', 'delayed', 'bounced', 'complained', 'failed'],
    default: 'sent',
    index: true,
  },
  error: { type: String, default: '' },
  events: { type: [eventSchema], default: [] },

  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
  at: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

// A message id is Resend's own, so it must only ever appear once
emailLogSchema.index({ providerMessageId: 1 }, { unique: true, partialFilterExpression: { providerMessageId: { $gt: '' } } });
emailLogSchema.index({ at: -1 });

module.exports = mongoose.models.EmailLog || mongoose.model('EmailLog', emailLogSchema);
