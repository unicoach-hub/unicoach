const mongoose = require('mongoose');
const { createUniCoachModel } = require('../config/db');

const unicoachMentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  handle: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    index: true 
  }, // e.g. "aarav", accessed via unicoach.in/@aarav or /api/unicoach/@aarav
  headline: { type: String, default: '', trim: true },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  coverImageUrl: { type: String, default: '' },
  
  // Timezone & Buffer Rules (Pillars #2 & #12)
  ianaTimezone: { type: String, default: 'Asia/Kolkata', trim: true }, // e.g. "Europe/Berlin", "America/New_York"
  bufferMinutes: { type: Number, default: 10, min: 0, max: 60 }, // Buffer window after every session
  noticePeriodHours: { type: Number, default: 2, min: 0, max: 168 }, // Minimum notice needed before slot can be booked
  
  // Academic Credentials & Destination (Marketplace Filters)
  phone: { type: String, default: '', trim: true },
  country: { type: String, default: '', trim: true }, // e.g. "Germany", "USA", "UK", "Canada", etc.
  university: { type: String, default: '', trim: true }, // e.g. "Technical University of Munich"
  course: { type: String, default: '', trim: true }, // e.g. "MS in Computer Science"
  graduationYear: { type: String, default: '', trim: true },
  
  // Verification & Trust Badges (Pillars #17 & #18)
  isVerified: { type: Boolean, default: false },
  applicationStatus: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING',
    index: true
  },
  verificationDocUrl: { type: String, default: '' }, // Uploaded student ID or verification link
  rejectionReason: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  badges: [{ type: String }], // e.g. ["Top Mentor", "TUM Alumni", "Ex-DAAD Scholar"]
  verifiedAlumni: {
    university: { type: String, default: '' },
    verifiedEmail: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }
  },
  
  // Financial Safety Hold
  payoutHoldRemainingBookings: { type: Number, default: 3 }, // First 3 bookings held 7 days against scams
  
  // Social Links (set from the mentor dashboard, shown as icons on the public profile)
  socialLinks: {
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' }
  },

  // Saved Default Payout Method
  defaultPayoutDetails: {
    payoutMethod: { type: String, enum: ['UPI', 'BANK_TRANSFER'], default: 'UPI' },
    upiId: { type: String, default: '', trim: true },
    accountHolderName: { type: String, default: '', trim: true },
    accountNumber: { type: String, default: '', trim: true },
    ifscCode: { type: String, default: '', trim: true },
    bankName: { type: String, default: '', trim: true }
  },

  // KYC needed by Razorpay Route to open a linked account that receives the mentor's payouts.
  // Never exposed on public profile endpoints.
  kyc: {
    pan: { type: String, default: '', trim: true, uppercase: true },
    address: {
      street1: { type: String, default: '', trim: true },
      street2: { type: String, default: '', trim: true },
      city: { type: String, default: '', trim: true },
      state: { type: String, default: '', trim: true },
      postalCode: { type: String, default: '', trim: true }
    }
  },

  // Razorpay Route linked account: students' payments are auto-split into this account
  routeAccount: {
    accountId: { type: String, default: '' },
    stakeholderId: { type: String, default: '' },
    productId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'CREATED', 'UNDER_REVIEW', 'NEEDS_CLARIFICATION', 'ACTIVATED', 'SUSPENDED', 'FAILED'],
      default: 'NOT_STARTED'
    },
    lastError: { type: String, default: '' },
    updatedAt: { type: Date, default: null }
  },

  // Public directory ranking & filters, kept in sync by services/mentorStatsService.js
  ratingAvg: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  rankScore: { type: Number }, // Bayesian rating used for "Top rated" ordering; unset until first computed
  startingPriceINR: { type: Number, default: null }, // Lowest active service price; null = no services
  serviceTypes: [{ type: String }],

  active: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

unicoachMentorSchema.index({ isVerified: 1, active: 1, rankScore: -1, reviewCount: -1 });

module.exports = createUniCoachModel('UnicoachMentor', unicoachMentorSchema, 'unicoach_mentors');
