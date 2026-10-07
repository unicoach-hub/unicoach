const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ['email', 'whatsapp'], required: true },
  subject: { type: String, default: '' }, // For Email type templates
  body: { type: String, required: true },  // Message content with placeholders e.g., {name}
  wabaTemplateName: { type: String, default: '' },
  wabaLanguageCode: { type: String, default: 'en_US' },
  wabaParameters: { type: String, default: '' },
  metaStatus: { type: String, enum: ['APPROVED', 'PENDING', 'REJECTED'], default: 'APPROVED' },
  metaCategory: { type: String, enum: ['MARKETING', 'UTILITY', 'AUTHENTICATION'], default: 'UTILITY' },
  rejectionReason: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
