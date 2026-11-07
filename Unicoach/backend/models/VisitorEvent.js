const mongoose = require('mongoose');

// What one anonymous visitor did on the website: page views (with time on page and scroll depth),
// errors, failed API calls, rage clicks, forms started/abandoned, and conversions.
// Deleted automatically after 90 days.
const visitorEventSchema = new mongoose.Schema({
  _id: { type: String }, // set by the browser, so the "page ended" update finds its page view
  visitorId: { type: String, required: true },
  sessionId: { type: String, default: '' },
  type: { type: String, required: true }, // pv | err | api | rage | fs | fa | cv
  path: { type: String, default: '' },
  title: { type: String, default: '' },
  durationSec: { type: Number },
  scroll: { type: Number }, // deepest scroll, % of the page
  detail: { type: String, default: '' },
  at: { type: Date, default: Date.now },
}, { versionKey: false });

visitorEventSchema.index({ visitorId: 1, at: -1 });
visitorEventSchema.index({ type: 1, at: -1 });
visitorEventSchema.index({ at: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });

module.exports = mongoose.model('VisitorEvent', visitorEventSchema);
