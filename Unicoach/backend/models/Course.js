const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true, trim: true, index: true },
  courseCode: { type: String, trim: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true, index: true },
  universityName: { type: String, required: true, trim: true, index: true },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', index: true },
  countryName: { type: String, required: true, trim: true, index: true },
  city: { type: String, trim: true },
  
  degreeLevel: { 
    type: String, 
    enum: ["Bachelor's", "Master's", "PhD", "Diploma", "Other"], 
    default: "Master's",
    index: true 
  },
  discipline: { type: String, trim: true, index: true }, // e.g. 'Computer Science', 'Business', 'Engineering'
  faculty: { type: String, trim: true },
  duration: { type: String, trim: true }, // e.g. '12 Months Full-Time'
  
  // Financials
  annualFee: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'EUR' },
    inrAmount: { type: Number, default: 0 }
  },
  applicationFee: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'EUR' },
    isWaived: { type: Boolean, default: false }
  },
  initialDeposit: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'EUR' }
  },

  // Admission Criteria
  // No placeholder values: requirements stay empty until taken from the official course page
  minIeltsScore: { type: Number },
  ieltsRequirement: { type: String },
  minToeflScore: { type: Number },
  minPteScore: { type: Number },
  minGpaPercent: { type: Number },
  academicRequirement: { type: String }, // e.g. "First Class Honours (60%+ in relevant UG)"
  greRequired: { type: Boolean, default: false },
  workExpRequirement: { type: String },

  // Intakes & Dates
  intakes: { type: [String], default: [] },
  applicationDeadline: { type: String },

  // Perks & Flags
  scholarships: [{
    name: { type: String },
    discount: { type: String },
    criteria: { type: String }
  }],
  isStem: { type: Boolean, default: false },
  hasInternship: { type: Boolean, default: false },

  // Source & Sync verification
  sourceUrl: { type: String, required: true, unique: true, index: true },
  contentHash: { type: String },
  lastVerifiedAt: { type: Date, default: Date.now },
  syncStatus: { type: String, enum: ['ACTIVE', 'NEEDS_REVIEW', 'ARCHIVED'], default: 'ACTIVE' }
}, { timestamps: true });

courseSchema.index({ university: 1, courseName: 1 });
courseSchema.index({ countryName: 1, degreeLevel: 1, 'annualFee.amount': 1 });

module.exports = mongoose.model('Course', courseSchema);
