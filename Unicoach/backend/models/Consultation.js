const mongoose = require('mongoose');

// A 1:1 consultation call with the UniCoach team, booked from /book-consultation or by Nitya on a call.
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
  // Bookings Nitya makes on a call may have no email (bulk lists, people who rang us)
  email: { type: String, required: function () { return this.source !== 'AI call'; }, default: '', trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  notes: { type: String, default: '' },
  amountINR: { type: Number, required: true },
  status: {
    type: String,
    // payment_conflict: money arrived after the hold ran out and someone else had taken the slot (refund it)
    enum: ['payment_pending', 'confirmed', 'completed', 'no_show', 'cancelled', 'payment_conflict'],
    default: 'payment_pending',
  },
  payment: {
    orderId: { type: String, default: '' },
    paymentId: { type: String, default: '' },
    simulated: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  // true while this booking holds its slot. The unique index below allows only one active
  // booking per date + time, so two students can never get the same slot, even at the same instant.
  active: { type: Boolean, default: true },
  counsellor: { type: String, default: '' },
  teamNotes: { type: String, default: '' },
  source: { type: String, default: '' },
  aiCallId: { type: String, default: '', index: true }, // AiCall.executionId when Nitya booked it on a call
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
}, { timestamps: true });

consultationSchema.index({ date: 1, time: 1, status: 1 });
consultationSchema.index({ date: 1, time: 1 }, { unique: true, partialFilterExpression: { active: true }, name: 'one_active_booking_per_slot' });
consultationSchema.index({ startsAt: -1 });

module.exports = mongoose.model('Consultation', consultationSchema);
