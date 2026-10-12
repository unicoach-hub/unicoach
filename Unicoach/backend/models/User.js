const mongoose = require('mongoose');
const { STAGE_KEYS, LEGACY_STAGES } = require('../config/studentStages');

// Old stage names stay valid so older records still save; they are shown as their new stage
const ALL_STAGE_KEYS = [...STAGE_KEYS, ...Object.keys(LEGACY_STAGES)];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  passwordHash: { type: String }, // used for email/password and admin login
  authProvider: { type: String, enum: ['local', 'google', 'apple', 'phone'], default: 'local' },
  googleId: { type: String, unique: true, sparse: true },
  appleId: { type: String, unique: true, sparse: true },
  avatar: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // Student Profile parameters
  dreamCountry: { type: String },
  preferredIntake: { type: String },
  highestEducation: { type: String },
  currentCity: { type: String },
  dreamCourse: { type: String },
  targetExam: { type: String },
  targetScore: { type: String },
  // Filled once in the onboarding form after sign-up; reused everywhere else
  percentage: { type: String },
  passoutYear: { type: String },
  profileCompletedAt: { type: Date },
  // Mentor whose referral link the student signed up through
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UnicoachMentor', index: true },
  referredAt: { type: Date },
  // Journey stage (config/studentStages.js), changed by the admin
  journeyStage: { type: String, enum: ALL_STAGE_KEYS, default: 'registered', index: true },
  stageUpdatedAt: { type: Date },
  stageHistory: [{
    stage: { type: String, enum: ALL_STAGE_KEYS },
    at: { type: Date, default: Date.now },
    by: { type: String, default: '' },
    note: { type: String, default: '', maxlength: 500 },
  }],
  // Inputs from the /universities shortlister (step 1), so a returning student goes straight to their matches
  shortlistProfile: {
    educationLevel: { type: String },
    gpaPercent: { type: Number },
    streamMajor: { type: String },
    targetCountry: { type: String },
    targetDegree: { type: String },
    maxBudgetUSD: { type: Number },
    ieltsScore: { type: String },
    greScore: { type: Number },
    intake: { type: String },
    workExpYears: { type: String },
    updatedAt: { type: Date }
  },
  checklistState: {
    type: Array,
    default: [
      { id: 1, text: 'Confirm dream country & courses', done: true },
      { id: 2, text: 'Take diagnostic mock test (IELTS / GRE)', done: false },
      { id: 3, text: 'Upload academic transcripts & SOP draft', done: false },
      { id: 4, text: 'Shortlist 5 target universities', done: false },
      { id: 5, text: 'Initiate university applications', done: false },
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
