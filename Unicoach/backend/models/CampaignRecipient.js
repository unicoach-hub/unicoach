const mongoose = require('mongoose');

// One person in a WhatsApp campaign. Delivered / read / replied come from the webhook (WhatsappEvent).
const campaignRecipientSchema = new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
  phone: { type: String, required: true },
  name: { type: String },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  params: [{ type: String }],
  status: { type: String, enum: ['queued', 'sending', 'sent', 'failed', 'skipped'], default: 'queued' },
  waMessageId: { type: String, index: true },
  error: { type: String },
  sentAt: { type: Date },
}, { timestamps: true });

campaignRecipientSchema.index({ campaign: 1, status: 1 });
campaignRecipientSchema.index({ campaign: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('CampaignRecipient', campaignRecipientSchema);
