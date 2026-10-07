const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['instagram', 'facebook', 'youtube', 'linkedin', 'twitter', 'telegram', 'quora']
  },
  accountName: { type: String, required: true },
  handle: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  connected: { type: Boolean, default: true },
  followersCount: { type: Number, default: 0 },
  accessToken: { type: String, default: '' },
  connectedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SocialAccount', socialAccountSchema);
