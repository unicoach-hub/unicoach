const mongoose = require('mongoose');
const { createUniCoachModel } = require('../config/db');

const unicoachServiceSchema = new mongoose.Schema({
  mentorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UnicoachMentor', 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['ONE_ON_ONE', 'SOP_REVIEW', 'PRIORITY_DM', 'DIGITAL_ASSET'],
    default: 'ONE_ON_ONE'
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  durationMinutes: { type: Number, default: 30, min: 10, max: 240 }, // For 1:1 call
  priceInINR: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  
  // For DIGITAL_ASSET & SOP_REVIEW
  digitalAssetKey: { type: String, default: '' }, // Legacy key
  digitalAsset: {
    fileUrl: { type: String, default: '' },       // /uploads/unicoach/files/... or direct URL
    fileName: { type: String, default: '' },      // e.g. "FullStack_Placement_Guide_2025.pdf"
    fileType: { type: String, default: 'PDF' },   // 'PDF', 'ZIP', 'DOCX', 'LINK', 'NOTION', 'OTHER'
    fileSize: { type: String, default: '' },      // e.g. "4.2 MB"
    resourceLink: { type: String, default: '' },  // Direct Google Drive/Notion/Figma link
    previewUrl: { type: String, default: '' }
  },
  maxDeliveryHours: { type: Number, default: 48 }, // SLA for Priority DM / SOP Review
  
  // Custom Booking Questionnaire (Topmate Feature)
  customQuestions: [{
    questionText: { type: String, required: true },
    type: { type: String, enum: ['TEXT', 'TEXTAREA', 'URL'], default: 'TEXT' },
    required: { type: Boolean, default: false }
  }],

  // Multi-Session Package / Bundle (e.g. 3 sessions package)
  bundleCount: { type: Number, default: 1, min: 1, max: 20 },

  active: { type: Boolean, default: true }
}, { 
  timestamps: true 
});

module.exports = createUniCoachModel('UnicoachService', unicoachServiceSchema, 'unicoach_services');
