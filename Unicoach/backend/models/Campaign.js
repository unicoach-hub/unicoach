const mongoose = require('mongoose');

// A WhatsApp broadcast: one approved template to an audience, sent in the background (now or at a set time)
const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  channel: { type: String, enum: ['whatsapp'], default: 'whatsapp' },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  templateName: { type: String }, // Meta template name at the time of sending
  templateLanguage: { type: String },
  templateParams: [{ type: String }], // field for each {{n}}, e.g. ['name', 'dreamCountry']
  target: { type: String }, // audience | leads | all-leads | event:<id> | custom
  audience: { type: mongoose.Schema.Types.Mixed },
  variables: { type: mongoose.Schema.Types.Mixed }, // campaign-wide values (meet_link, event_name …)
  scheduledAt: { type: Date, default: Date.now, index: true },
  status: { type: String, enum: ['scheduled', 'running', 'paused', 'completed', 'cancelled'], default: 'scheduled', index: true },
  total: { type: Number, default: 0 },
  sent: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  skipped: { type: Number, default: 0 },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  lastError: { type: String },
  createdBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
