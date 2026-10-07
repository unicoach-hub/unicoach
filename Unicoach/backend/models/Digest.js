const mongoose = require('mongoose');

const digestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['reviews', 'insights', 'news'], default: 'reviews' },
  imageUrl: { type: String }, // Cover image path
  isVideo: { type: Boolean, default: false },
  videoUrl: { type: String, default: '' }, // YouTube embed or MP4 path
  length: { type: String, default: '' }, // e.g. "8:42"
  isSpotlight: { type: Boolean, default: false }, // if true, shows in the horizontal spotlight carousel
  published: { type: Boolean, default: false },
  publishDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Digest', digestSchema);
