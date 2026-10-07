const mongoose = require('mongoose');
const { createUniCoachModel } = require('../config/db');

/**
 * UniCoach Notification / Broadcast Schema
 * 
 * Used by Admin to broadcast or send direct notifications, alerts,
 * announcements, and policy/payout updates to Creators/Mentors.
 */
const unicoachNotificationSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  message: { 
    type: String, 
    required: true, 
    trim: true 
  },
  category: { 
    type: String, 
    enum: ['ANNOUNCEMENT', 'SYSTEM', 'PAYOUT', 'URGENT', 'GENERAL'], 
    default: 'ANNOUNCEMENT' 
  },
  priority: { 
    type: String, 
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], 
    default: 'NORMAL' 
  },
  targetType: { 
    type: String, 
    enum: ['ALL', 'SPECIFIC'], 
    default: 'ALL',
    index: true
  },
  targetMentorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UnicoachMentor',
    default: null,
    index: true
  },
  targetMentorHandle: { 
    type: String, 
    default: '',
    lowercase: true,
    trim: true,
    index: true
  },
  targetMentorName: { 
    type: String, 
    default: '',
    trim: true
  },
  actionLink: { 
    type: String, 
    default: '',
    trim: true 
  },
  actionText: { 
    type: String, 
    default: '',
    trim: true 
  },
  senderAdmin: { 
    type: String, 
    default: 'UniCoach Admin Team',
    trim: true 
  },
  readBy: [{
    mentorHandle: { type: String, lowercase: true, trim: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'UnicoachMentor' },
    readAt: { type: Date, default: Date.now }
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

module.exports = createUniCoachModel('UnicoachNotification', unicoachNotificationSchema, 'unicoach_notifications');
