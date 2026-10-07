const mongoose = require('mongoose');

const bookingSlotSchema = new mongoose.Schema({
  bookingEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'BookingEvent', required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentPhone: { type: String, required: true },
  dreamCountry: { type: String, default: '' },
  preferredIntake: { type: String, default: '' },
  bookingDate: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g. "11:30 AM"
  status: { type: String, enum: ['confirmed', 'completed', 'cancelled'], default: 'confirmed' },
  notes: { type: String, default: '' },
  counselor: { type: String, default: '' },
  formSubmission: { type: mongoose.Schema.Types.ObjectId, ref: 'FormSubmission' }
}, { timestamps: true });

bookingSlotSchema.index({ bookingEvent: 1, bookingDate: 1 });

module.exports = mongoose.model('BookingSlot', bookingSlotSchema);
