const mongoose = require('mongoose');

const bookingEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subheading: { type: String, default: '' },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  videoUrl: { type: String, default: '' }, // e.g. YouTube embed link
  durationMinutes: { type: Number, default: 30 }, // 15, 30, 45, 60
  workingDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  startTime: { type: String, default: '10:00' }, // "10:00"
  endTime: { type: String, default: '18:00' },   // "18:00"
  pipeline: { type: mongoose.Schema.Types.ObjectId, ref: 'Pipeline' },
  stageName: { type: String, default: '' },
  active: { type: Boolean, default: true },
  bookingCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('BookingEvent', bookingEventSchema);
