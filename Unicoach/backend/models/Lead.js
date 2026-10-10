const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  // Step 1
  dreamCountry: { type: String, default: 'Undecided' },
  preferredIntake: { type: String, default: '2026' },
  // Step 2
  highestEducation: { type: String, default: 'Not specified' },
  currentCity: { type: String, default: 'Not specified' },
  // Step 3
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  phone: { type: String, required: true },
  // OTP & Status
  otp: { type: String },
  otpExpires: { type: Date },
  otpPhone: { type: String }, // the phone number the current OTP was sent to
  otpAttempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted', 'closed'], default: 'new', index: true },
  source: { type: String, default: 'check-eligibility' }, // check-eligibility | book-consultation
  assignedTo: { type: String, default: 'Unassigned', index: true },
  // Tags: `tags` are added by the team; `autoTags` are worked out from the lead's activity on every save
  tags: { type: [String], default: [], index: true },
  autoTags: { type: [String], default: [], index: true },
  // Opted out of promotional emails (unsubscribe link)
  unsubscribed: { type: Boolean, default: false, index: true },
  unsubscribedAt: { type: Date },
  notes: { type: String },
  nextFollowUpDate: { type: Date },
  totalInquiries: { type: Number, default: 1 },
  // Form/service of the most recent enquiry (`source` stays the first one), e.g. "Education Loan Enquiry"
  latestSource: { type: String },
  lastInquiryAt: { type: Date, default: Date.now },
  interestedUniversities: [{
    name: { type: String },
    country: { type: String },
    course: { type: String },
    source: { type: String },
    date: { type: Date, default: Date.now }
  }],
  savedUniversities: [{
    name: { type: String },
    countryName: { type: String },
    city: { type: String },
    rank: { type: String },
    tuition: { type: String },
    savedAt: { type: Date, default: Date.now }
  }],
  activities: [{
    type: { type: String, enum: ['call', 'email', 'whatsapp', 'note', 'status_change'], default: 'note' },
    comment: { type: String },
    date: { type: Date, default: Date.now },
    performedBy: { type: String, default: 'Admin' }
  }],
  // Ad campaign that brought this lead (utm_*, gclid, fbclid), sent by the website's adTracking.js
  attribution: {
    firstTouch: { type: mongoose.Schema.Types.Mixed },
    lastTouch: { type: mongoose.Schema.Types.Mixed }
  },
  aiScoring: {
    score: { type: Number, default: 50 },
    category: { type: String, enum: ['Hot', 'Warm', 'Cold'], default: 'Warm' },
    rationale: { type: String },
    suggestedAction: { type: String },
    conversionProbability: { type: String },
    keyStrengths: [{ type: String }],
    riskFactors: [{ type: String }],
    scoredAt: { type: Date }
  },
}, { timestamps: true });

leadSchema.index({ createdAt: -1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ dreamCountry: 1, createdAt: -1 });
leadSchema.index({ verified: 1, status: 1 });
leadSchema.index({ 'attribution.lastTouch.utm_campaign': 1, createdAt: -1 });

leadSchema.pre('save', function (next) {
  this.autoTags = require('../utils/leadTags').deriveAutoTags(this);
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
