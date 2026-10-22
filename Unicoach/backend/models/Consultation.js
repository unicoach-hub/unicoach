const mongoose = require('mongoose');

// A paid 1:1 consultation call with the UniCoach team, booked from /book-consultation.
// date + time are India time (IST); startsAt is the same moment as a real Date for sorting.
const consultationSchema = new mongoose.Schema({
  ref: { type: String, required: true, unique: true },
  service: { type: String, required: true },
  serviceLabel: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD (IST)
  time: { type: String, required: true }, // HH:mm (IST)
  startsAt: { type: Date, required: true },
  durationMin: { type: Number, default: 30 },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  notes: { type: String, default: '' },
  amountINR: { type: Number, required: true },
  status: {
    type: String,
    enum: ['payment_pending', 'confirmed', 'completed', 'no_show', 'cancelled'],
    default: 'payment_pending',
  },
  payment: {
    orderId: { type: String, default: '' },
    paymentId: { type: String, default: '' },
    simulated: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  counsellor: { type: String, default: '' },
  teamNotes: { type: String, default: '' },
  source: { type: String, default: '' },
}, { timestamps: true });

consultationSchema.index({ date: 1, time: 1, status: 1 });
consultationSchema.index({ startsAt: -1 });

module.exports = mongoose.model('Consultation', consultationSchema);
