const mongoose = require('mongoose');

const socialCommentSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['instagram', 'facebook', 'youtube', 'linkedin', 'twitter', 'telegram', 'quora']
  },
  postTitle: { type: String, default: 'General Post' },
  authorName: { type: String, required: true },
  authorAvatar: { type: String, default: '' },
  commentText: { type: String, required: true },
  status: {
    type: String,
    enum: ['unread', 'replied', 'archived'],
    default: 'unread'
  },
  replies: [{
    replyText: { type: String, required: true },
    repliedBy: { type: String, default: 'UniCoach Staff' },
    repliedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SocialComment', socialCommentSchema);
