// backend/models/UserScholarship.js
const mongoose = require('mongoose');

const userScholarshipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  scholarship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true
  },
  customId: {
    type: String,
    index: true
  },
  applicationStage: {
    type: String,
    enum: ['Shortlisted', 'Essay Drafting', 'Documents Ready', 'Applied', 'Awarded', 'Rejected'],
    default: 'Shortlisted',
    index: true
  },
  studentNotes: {
    type: String,
    default: ''
  },
  deadlineAlertsEnabled: {
    type: Boolean,
    default: true
  },
  matchScore: {
    type: Number,
    default: 85
  },
  matchCategory: {
    type: String,
    enum: ['High Match', 'Target Match', 'Reach / Competitive'],
    default: 'Target Match'
  },
  appliedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Prevent duplicate shortlisting of the same scholarship by a single student
userScholarshipSchema.index({ user: 1, scholarship: 1 }, { unique: true });

module.exports = mongoose.model('UserScholarship', userScholarshipSchema);
