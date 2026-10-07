const mongoose = require('mongoose');
const { createUniCoachModel } = require('../config/db');

/**
 * UniCoach Closed-Loop Verified Reviews (Pillar #18)
 * 
 * Reviews can ONLY be submitted for verified, completed bookings.
 * Prevents competitor defamation and fake reviews.
 */
const unicoachReviewSchema = new mongoose.Schema({
  mentorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UnicoachMentor', 
    required: true,
    index: true 
  },
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UnicoachBooking', 
    required: true,
    unique: true 
  },
  studentName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    default: '', 
    trim: true 
  },
  serviceTitle: { 
    type: String, 
    default: '1:1 Mentorship' 
  },
  verifiedPurchase: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

module.exports = createUniCoachModel('UnicoachReview', unicoachReviewSchema, 'unicoach_reviews');
