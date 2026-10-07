const mongoose = require('mongoose');
const { createUniCoachModel } = require('../config/db');

/**
 * Immutable Double-Entry Ledger (Pillar #4)
 * 
 * Every rupee moved in UniCoach must have a corresponding Debit (DR) and Credit (CR).
 * Direct updates like `wallet.balance += 900` are strictly forbidden.
 */
const unicoachLedgerSchema = new mongoose.Schema({
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UnicoachBooking', 
    default: null,
    index: true 
  },
  payoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UnicoachPayout',
    default: null,
    index: true
  },
  mentorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UnicoachMentor', 
    default: null,
    index: true 
  },
  type: { 
    type: String, 
    enum: ['DEBIT', 'CREDIT'], 
    required: true 
  },
  account: { 
    type: String, 
    enum: ['STUDENT', 'ESCROW', 'CREATOR_WALLET', 'PLATFORM_COMMISSION', 'PAYOUT_HOLD', 'BANK_SETTLEMENT', 'GATEWAY_FEE', 'MENTOR_TRANSFER'],
    required: true,
    index: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  currency: { 
    type: String, 
    default: 'INR' 
  },
  description: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  }
}, { 
  timestamps: false // Ledger entries are immutable once written
});

module.exports = createUniCoachModel('UnicoachLedger', unicoachLedgerSchema, 'unicoach_ledgers');
