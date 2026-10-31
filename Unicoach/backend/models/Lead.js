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
  // WhatsApp chatbot leads and inbound callers may not have given an email yet
  email: { type: String, required: function () { return !['WhatsApp', 'Inbound call'].includes(this.source); }, default: '', index: true },
  phone: { type: String, required: true },
  // Student account this lead became (set by "Start journey"); the journey stage lives on that account
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  // Mentor who referred the student; referral credit is independent of latestSource.
  referralMentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'UnicoachMentor', index: true },
  referralMentorName: { type: String, trim: true },
  referralMentorHandle: { type: String, lowercase: true, trim: true },
  // Same-contact enquiry rows stay separate, but share this id so CRM users can follow the group.
  duplicateGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
  // OTP & Status
  otp: { type: String },
  otpExpires: { type: Date },
  otpPhone: { type: String }, // the phone number the current OTP was sent to
  otpAttempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'interested', 'fifty_fifty', 'not_interested', 'converted', 'closed'], default: 'new', index: true },
  source: { type: String, default: 'check-eligibility' }, // check-eligibility | book-consultation
  assignedTo: { type: String, default: 'Unassigned', index: true },
  // Tags: `tags` are added by the team; `autoTags` are worked out from the lead's activity on every save
  tags: { type: [String], default: [], index: true },
  autoTags: { type: [String], default: [], index: true },
  // Opted out of promotional emails (unsubscribe link)
  unsubscribed: { type: Boolean, default: false, index: true },
  unsubscribedAt: { type: Date },
  // Replied STOP on WhatsApp: no more bulk WhatsApp messages
  whatsappOptOut: { type: Boolean, default: false },
  notes: { type: String },
  // Sheet-style columns the team fills in on All Leads
  college: { type: String },
  course: { type: String },
  phoneCall: { type: String, enum: ['pending', 'done'], default: 'pending' },
  followUp: { type: String, enum: ['', 'interested', 'fifty_fifty'], default: '', index: true },
  nextFollowUpDate: { type: Date },
  // Every follow-up that was due and then done: when it was due, when it happened, and whether
  // it happened on the due day (or earlier). Lets admin see if follow-ups are kept on time.
  followUpHistory: [{
    dueDate: { type: Date },
    doneAt: { type: Date },
    onTime: { type: Boolean },
    daysLate: { type: Number, default: 0 },
    by: { type: String, default: '' },
    via: { type: String, default: '' },
  }],
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
  // Latest call from the Bolna AI agent (Riya); the full result is also logged in `activities`
  aiCall: {
    executionId: { type: String },
    status: { type: String }, // Bolna call status: queued, completed, no-answer, busy, failed, ...
    outcome: { type: String }, // consultation_yes | callback | not_interested | do_not_call | wrong_number | no_conversation
    queuedAt: { type: Date },
    scheduledFor: { type: Date },
    endedAt: { type: Date },
    durationSec: { type: Number },
    recordingUrl: { type: String },
    summary: { type: String },
  },
}, { timestamps: true });

leadSchema.index({ createdAt: -1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ dreamCountry: 1, createdAt: -1 });
leadSchema.index({ verified: 1, status: 1 });
leadSchema.index({ 'attribution.lastTouch.utm_campaign': 1, createdAt: -1 });
leadSchema.index({ 'aiCall.executionId': 1 }, { sparse: true });

leadSchema.pre('save', function (next) {
  this.autoTags = require('../utils/leadTags').deriveAutoTags(this);
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
