const mongoose = require('mongoose');

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
