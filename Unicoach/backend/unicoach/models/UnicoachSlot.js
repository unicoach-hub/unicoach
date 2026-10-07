const mongoose = require('mongoose');
const { createUniCoachModel } = require('../config/db');

const unicoachSlotSchema = new mongoose.Schema({
  mentorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UnicoachMentor', 
    required: true,
    index: true 
  },
  // Strict ISO-8601 UTC Dates (Pillar #2)
  startUtc: { 
    type: Date, 
    required: true,
    index: true 
  },
  endUtc: { 
    type: Date, 
    required: true 
  },
  
  // Slot Status Lifecycle
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'HELD', 'BOOKED', 'BLOCKED'], 
    default: 'AVAILABLE',
    index: true 
  },
  
  // 10-Minute Cart Hold Data (Pillar #1)
  heldBy: { type: String, default: null }, // Student reservation token or email
  heldUntil: { type: Date, default: null, index: true }, // Auto-expires after 10 mins
  
  // Linked Booking Reference
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UnicoachBooking', 
    default: null 
  },

  // Service Allocation (null / undefined means slot is available for ALL 1:1 services)
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UnicoachService',
    default: null,
    index: true
  },
  serviceTitle: {
    type: String,
    default: 'All 1:1 Services'
  }
}, { 
  timestamps: true 
});

// Hard Database-Level Concurrency Barrier: A mentor can NEVER have two slots starting at the exact same millisecond
unicoachSlotSchema.index({ mentorId: 1, startUtc: 1 }, { unique: true });

module.exports = createUniCoachModel('UnicoachSlot', unicoachSlotSchema, 'unicoach_slots');
