const mongoose = require('mongoose');

// When the UniCoach team takes paid consultation calls. One document for the whole site.
// weekly: start times per weekday (0 = Sunday … 6 = Saturday), e.g. { '1': ['13:00', '20:00'] }
// overrides: a specific date with its own start times, or closed for the day
const overrideSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD (IST)
  closed: { type: Boolean, default: false },
  slots: [{ type: String }],
}, { _id: false });

const consultationAvailabilitySchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true },
  weekly: { type: mongoose.Schema.Types.Mixed, default: {} },
  overrides: [overrideSchema],
}, { timestamps: true });

module.exports = mongoose.model('ConsultationAvailability', consultationAvailabilitySchema);
