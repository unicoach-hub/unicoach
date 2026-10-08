const mongoose = require('mongoose');
const { createUniCoachModel } = require('../config/db');

const unicoachBookingSchema = new mongoose.Schema({
  bookingRef: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  }, // e.g. "UM-8921820"
  mentorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UnicoachMentor', 
    required: true,
    index: true 
  },
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UnicoachService', 
    required: true 
  },
  slotId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UnicoachSlot',
    default: null 
  },

  // Student Details
  studentName: { type: String, required: true, trim: true },
  studentEmail: { type: String, required: true, lowercase: true, trim: true },
  studentPhone: { type: String, required: true, trim: true },
  studentNotes: { type: String, default: '' },

  // Answers to Creator's Custom Questions
  customAnswers: [{
    questionText: { type: String, required: true },
    answerText: { type: String, default: '' }
  }],

  // Session Timing in UTC
  startUtc: { type: Date, default: null },
  endUtc: { type: Date, default: null },

  // Finite State Machine (FSM) Lifecycle (Pillar #5)
  state: { 
    type: String, 
    required: true,
    enum: [
      'CREATED',
      'PAYMENT_PENDING',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'REFUNDED'
    ],
    default: 'CREATED',
    index: true
  },

  // Idempotency Key (Pillar #3)
  idempotencyKey: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },

  // Financial Breakdown & Coupon Discounts
  originalAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String, default: null },
  amountPaid: { type: Number, default: 0, min: 0 },
  platformCommission: { type: Number, default: 0, min: 0 },
  mentorEarning: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'INR' },

  // Payment Tracking
  payment: {
    orderId: { type: String, default: '' },
    paymentId: { type: String, default: '' },
    signature: { type: String, default: '' },
    capturedAt: { type: Date, default: null }
  },

  // Meeting Details
  meeting: {
    platform: { type: String, enum: ['GOOGLE_MEET', 'ZOOM', 'CUSTOM'], default: 'GOOGLE_MEET' },
    joinUrl: { type: String, default: '' },
    meetingId: { type: String, default: '' },
    password: { type: String, default: '' }
  },

  // Dispute Resolution & "Who Joined the Call?" Proof Engine (Pillar #11)
  joinLogs: [{
    participant: { type: String, required: true }, // Email
    role: { type: String, enum: ['mentor', 'student'], required: true },
    joinedAt: { type: Date, required: true },
    leftAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0 }
  }],

  // Priority DM (Paid Async Q&A)
  priorityDm: {
    questionText: { type: String, default: '' },
    contextText: { type: String, default: '' },
    referenceUrl: { type: String, default: '' },
    answerText: { type: String, default: '' },
    attachmentUrl: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['NONE', 'PENDING', 'ANSWERED', 'EXPIRED'], 
      default: 'NONE',
      index: true 
    },
    deliveryDueUtc: { type: Date, default: null },
    answeredAt: { type: Date, default: null }
  },

  // Instant Digital Asset Delivery (Topmate Digital Goods)
  digitalAssetDelivery: {
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    downloadToken: { type: String, default: '' },
    downloadCount: { type: Number, default: 0 }
  },

  // Razorpay Route settlement: gross payment, gateway fee + GST, and the net amount transferred to the mentor
  settlement: {
    status: {
      type: String,
      enum: [
        'NOT_APPLICABLE',   // free booking / no payment
        'PENDING_CAPTURE',  // paid, waiting for Razorpay capture (fee not known yet)
        'PENDING_ACCOUNT',  // mentor's Route linked account isn't active yet
        'ROUTE_DISABLED',   // Route not switched on for UniCoach yet
        'ON_HOLD',          // transferred to mentor, held until the session/answer is completed
        'RELEASED',         // hold lifted, Razorpay settles to mentor's bank
        'REVERSED',         // pulled back because the student was refunded
        'FAILED'
      ],
      default: 'NOT_APPLICABLE',
      index: true
    },
    grossINR: { type: Number, default: 0 },
    gatewayFeeINR: { type: Number, default: 0 },  // Razorpay fee excluding GST
    gatewayTaxINR: { type: Number, default: 0 },  // GST charged on the Razorpay fee
    mentorNetINR: { type: Number, default: 0 },   // gross - fee - GST, sent to mentor
    linkedAccountId: { type: String, default: '' },
    transferId: { type: String, default: '' },
    onHoldUntil: { type: Date, default: null },
    releasedAt: { type: Date, default: null },
    lastError: { type: String, default: '' }
  },

  refund: {
    refundId: { type: String, default: '' },
    amountINR: { type: Number, default: 0 },
    status: { type: String, default: '' }
  },

  // Cancellation / Refund Metadata
  cancellationReason: { type: String, default: '' },
  refundedAt: { type: Date, default: null }
}, { 
  timestamps: true 
});

// Paid-file downloads look bookings up by their download token
unicoachBookingSchema.index({ 'digitalAssetDelivery.downloadToken': 1 }, { sparse: true });

module.exports = createUniCoachModel('UnicoachBooking', unicoachBookingSchema, 'unicoach_bookings');
