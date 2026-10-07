const mongoose = require('mongoose');
const { createUniCoachModel } = require('../config/db');

/**
 * UniCoach Discount Coupon Schema
 * 
 * In-house promo code engine supporting:
 * - Percentage discount (e.g. 20% off)
 * - Flat rupee discount (e.g. ₹100 off)
 * - Usage caps (e.g. first 10 students only)
 */
const unicoachCouponSchema = new mongoose.Schema({
  mentorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UnicoachMentor', 
    required: true,
    index: true 
  },
  code: { 
    type: String, 
    required: true, 
    uppercase: true, 
    trim: true 
  }, // e.g. "EARLYBIRD" or "SCHOLAR50"
  discountType: { 
    type: String, 
    enum: ['PERCENTAGE', 'FLAT'], 
    default: 'PERCENTAGE' 
  },
  discountValue: { 
    type: Number, 
    required: true, 
    min: 1 
  }, // e.g. 20 (for 20%) or 100 (for ₹100 flat)
  maxUses: { 
    type: Number, 
    default: 0 
  }, // 0 = unlimited
  usedCount: { 
    type: Number, 
    default: 0 
  },
  active: { 
    type: Boolean, 
    default: true 
  },
  expiresAt: { 
    type: Date, 
    default: null 
  }
}, { 
  timestamps: true 
});

// A mentor cannot have two identical active promo codes
unicoachCouponSchema.index({ mentorId: 1, code: 1 }, { unique: true });

module.exports = createUniCoachModel('UnicoachCoupon', unicoachCouponSchema, 'unicoach_coupons');
