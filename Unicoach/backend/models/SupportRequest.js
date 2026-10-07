const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: 'General Inquiry',
      trim: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['New', 'Email sent', 'Call scheduled', 'Replied on social media', 'Replied', 'Closed', 'Custom'],
      default: 'New',
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    notes: [
      {
        note: { type: String, required: true },
        date: { type: Date, default: Date.now },
        author: { type: String, default: 'Admin' },
      },
    ],
    aiDraftReply: {
      type: String,
      default: '',
    },
    replies: [
      {
        subject: String,
        content: String,
        sentAt: { type: Date, default: Date.now },
        sender: { type: String, default: 'UniCoach Counselor' },
        method: { type: String, enum: ['email', 'whatsapp', 'manual'], default: 'email' },
      },
    ],
    customStatusText: {
      type: String,
      default: '',
    },
    scheduledDate: {
      type: Date,
    },
    // Event registrations (category 'Event Registration') made on the site, so the team can filter/export by event
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      index: true,
    },
    eventTitle: {
      type: String,
      trim: true,
    },
    eventStart: {
      type: Date,
    },
    intake: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and filtering
supportRequestSchema.index({ status: 1, createdAt: -1 });
supportRequestSchema.index({ category: 1 });
supportRequestSchema.index({ email: 1 });
supportRequestSchema.index({ name: 'text', message: 'text' });

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
