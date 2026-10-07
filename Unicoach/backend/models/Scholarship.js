// backend/models/Scholarship.js
const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  customId: {
    type: String,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Scholarship title is required'],
    trim: true,
    index: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  universityName: {
    type: String,
    required: true,
    index: true
  },
  country: {
    type: String,
    required: true,
    index: true
  },
  institutionType: {
    type: String,
    default: 'Public'
  },
  fundingType: {
    type: String,
    required: true,
    index: true
  },
  coverageLevel: {
    type: String,
    enum: ['Full', 'Partial', 'Variable'],
    default: 'Variable',
    index: true
  },
  providerType: {
    type: String,
    enum: ['UNIVERSITY', 'GOVERNMENT', 'FOUNDATION', 'EXTERNAL_ORGANIZATION'],
    default: 'UNIVERSITY',
    index: true
  },
  awardCoverage: {
    type: String,
    required: true
  },
  amount: {
    value: { type: Number },
    currency: { type: String, default: 'USD' },
    isPercentage: { type: Boolean, default: false },
    type: { type: String, default: 'FIXED_AMOUNT' },
    isEstimated: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    sourceUrl: { type: String, default: null },
    evidence: { type: String, default: null },
    verifiedAt: { type: String, default: null },
    display: { type: String, required: true },
    annualStipend: { type: Number }
  },
  description: {
    type: String,
    required: true
  },
  eligibility: {
    evaluationType: { type: String, default: 'Competitive Academic Merit' },
    academicRequirementNote: { type: String, default: '' },
    minGpa: { type: Number, default: 0 },
    minPercentage: { type: Number, default: 0 },
    minIelts: { type: mongoose.Schema.Types.Mixed },
    minToefl: { type: mongoose.Schema.Types.Mixed },
    minGre: { type: mongoose.Schema.Types.Mixed },
    degreeLevels: [{
      type: String
    }],
    coursesApplicable: [String],
    genderPreference: {
      type: String,
      default: 'All'
    },
    nationalitiesEligible: [String],
    financialCriteria: {
      isNeedBased: { type: Boolean, default: false },
      maxFamilyIncome: { type: Number, default: null },
      requiresIncomeProof: { type: Boolean, default: false }
    }
  },
  applicationProcess: {
    mode: { type: String, default: 'Online Application' },
    essayRequired: { type: Boolean, default: false },
    essayPrompt: { type: String, default: null },
    lorsRequired: { type: Number, default: 0 },
    applicationPortalUrl: { type: String, required: true }
  },
  deadline: {
    date: { type: Date, default: null, index: true },
    status: { type: String, default: 'NOT_PUBLISHED' },
    deadlineType: { type: String, default: null },
    academicYear: { type: String, default: '2026 - 2027 Academic Year' },
    timezone: { type: String, default: null },
    intakeSeason: { type: String, default: 'Fall' },
    intakeCycle: { type: String, default: '2026 - 2027 Academic Year' },
    displayDeadline: { type: String, required: true },
    deadlinePolicy: { type: String, default: '' },
    sourceUrl: { type: String, default: null },
    evidence: { type: String, default: null }
  },
  urls: {
    informationUrl: { type: String, default: '' },
    applicationUrl: { type: String, default: '' },
    providerUrl: { type: String, default: null },
    sourceUrl: { type: String, default: '' }
  },
  fieldStatus: {
    amount: { type: String, default: 'NOT_VERIFIED' },
    eligibility: { type: String, default: 'NOT_VERIFIED' },
    deadline: { type: String, default: 'NOT_VERIFIED' },
    applicationUrl: { type: String, default: 'VERIFIED' },
    informationUrl: { type: String, default: 'VERIFIED' },
    overall: { type: String, default: 'PARTIALLY_VERIFIED' }
  },
  evidence: [{
    field: { type: String },
    sourceUrl: { type: String },
    quote: { type: String },
    extractedAt: { type: String },
    method: { type: String },
    foundValue: { type: mongoose.Schema.Types.Mixed },
    recordValue: { type: mongoose.Schema.Types.Mixed },
    match: { type: Boolean }
  }],
  verificationStatus: {
    type: String,
    default: 'Independently Audited & Factually Verified'
  },
  verifiedSource: {
    type: String,
    required: true
  },
  verification: {
    type: mongoose.Schema.Types.Mixed
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  viewsCount: { type: Number, default: 0 },
  shortlistCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes for fast elastic queries
scholarshipSchema.index({ country: 1, fundingType: 1, providerType: 1, coverageLevel: 1 });
scholarshipSchema.index({ 'eligibility.degreeLevels': 1, isActive: 1 });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
