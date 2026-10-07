const mongoose = require('mongoose');

const socialPostSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  content: { type: String, required: true },
  mediaUrls: [{ type: String }],
  platforms: [{
    type: String,
    enum: ['instagram', 'facebook', 'youtube', 'linkedin', 'twitter', 'telegram', 'quora']
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'published'
  },
  scheduledAt: { type: Date },
  publishedAt: { type: Date, default: Date.now },
  aiGenerated: { type: Boolean, default: false },
  metrics: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  dispatchResults: [{
    platform: { type: String },
    status: { type: String, enum: ['success', 'simulated', 'failed'] },
    message: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SocialPost', socialPostSchema);
