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
  // Set once the template is sent to Meta for review (WhatsApp only)
  metaTemplateId: { type: String, default: '' },
  metaSubmittedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
