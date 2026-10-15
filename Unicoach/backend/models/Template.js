const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ['email', 'whatsapp'], required: true },
  subject: { type: String, default: '' }, // For Email type templates
  body: { type: String, required: true },  // Message content with placeholders e.g., {name}
  wabaTemplateName: { type: String, default: '' },
  wabaLanguageCode: { type: String, default: 'en_US' },
  wabaParameters: { type: String, default: '' },
  metaStatus: { type: String, enum: ['APPROVED', 'PENDING', 'REJECTED', 'PAUSED', 'DISABLED', 'IN_APPEAL', 'PENDING_DELETION'], default: 'PENDING' },
  metaCategory: { type: String, enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION'], default: 'UTILITY' },
  rejectionReason: { type: String, default: '' },
  // WhatsApp extras: a header (text or image / video / PDF), a footer line and up to 10 buttons
  headerType: { type: String, enum: ['none', 'text', 'image', 'video', 'document'], default: 'none' },
  headerText: { type: String, default: '' },
  headerMediaUrl: { type: String, default: '' },
  footer: { type: String, default: '' },
  buttons: [{
    _id: false,
    type: { type: String, enum: ['QUICK_REPLY', 'URL', 'PHONE_NUMBER'] },
    text: { type: String },
    url: { type: String },
    phone: { type: String },
  }],
  // Set once the template is sent to Meta for review (WhatsApp only)
  metaTemplateId: { type: String, default: '' },
  metaSubmittedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
