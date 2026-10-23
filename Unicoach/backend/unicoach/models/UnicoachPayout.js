const mongoose = require('mongoose');
const { createUniCoachModel } = require('../config/db');

const unicoachPayoutSchema = new mongoose.Schema({
  payoutRef: { 
    type: String, 
    unique: true, 
    required: true, 
    index: true 
  }, // e.g. "PO-839210-4A"
  mentorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UnicoachMentor', 
    required: true,
    index: true 
  },
  amountINR: { 
    type: Number, 
    required: true, 
    min: 1,
    // A mentor's own withdrawal request must be at least ₹100; Monday payouts can be any amount
    validate: {
      validator(v) { return this.source === 'WEEKLY' || v >= 100; },
      message: 'Minimum withdrawal amount is ₹100'
    }
  },
  // WEEKLY = Monday bank payout made by admin for completed bookings; REQUEST = mentor asked for it
  source: { type: String, enum: ['REQUEST', 'WEEKLY'], default: 'REQUEST' },
  bookingIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UnicoachBooking' }],
  currency: { 
    type: String, 
    default: 'INR' 
  },
  payoutMethod: { 
    type: String, 
    enum: ['UPI', 'BANK_TRANSFER'], 
    required: true,
    default: 'UPI'
  },
  payoutDetails: {
    upiId: { type: String, default: '', trim: true },
    accountHolderName: { type: String, default: '', trim: true },
    accountNumber: { type: String, default: '', trim: true },
    ifscCode: { type: String, default: '', trim: true },
    bankName: { type: String, default: '', trim: true }
  },
  status: { 
    type: String, 
    enum: ['REQUESTED', 'PROCESSING', 'PAID', 'REJECTED'], 
    default: 'REQUESTED',
    index: true 
  },
  transactionRef: { 
    type: String, 
    default: '', 
    trim: true 
  }, // UTR number / Bank IMPS reference entered by admin
  adminRemarks: { 
    type: String, 
    default: '' 
  },
  requestedAt: { 
    type: Date, 
    default: Date.now 
  },
  processedAt: { 
    type: Date, 
    default: null 
  }
}, { 
  timestamps: true 
});

module.exports = createUniCoachModel('UnicoachPayout', unicoachPayoutSchema, 'unicoach_payouts');
