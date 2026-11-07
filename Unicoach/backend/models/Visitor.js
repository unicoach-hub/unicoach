const mongoose = require('mongoose');

// One anonymous website visitor (a random id kept in the browser's localStorage by
// frontend/src/utils/visitorTracking.js). No name, phone, email or IP address is stored
// until the visitor fills a form; then leadId / leadName link the visit history to that lead.
// Deleted automatically 90 days after the last visit (expireAt TTL).
const visitorSchema = new mongoose.Schema({
  _id: { type: String }, // the browser's visitor id
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now, index: true },
  sessions: { type: Number, default: 0 },
  pageviews: { type: Number, default: 0 },
  timeSec: { type: Number, default: 0 },
  lastSessionId: { type: String, default: '' },

  device: { type: String, default: '' }, // mobile | tablet | desktop
  os: { type: String, default: '' },
  browser: { type: String, default: '' },
  screen: { type: Number }, // width in px
  lang: { type: String, default: '' },
  city: { type: String, default: '' }, // approximate, from the IP (the IP itself is never saved)
  region: { type: String, default: '' },
  country: { type: String, default: '' },

  firstSource: { type: String, default: '' }, // "instagram / paid · campaign", "google.com", "direct"
  lastSource: { type: String, default: '' },
  landingPage: { type: String, default: '' },
  lastPage: { type: String, default: '' },

  issues: {
    errors: { type: Number, default: 0 }, // JavaScript errors in the browser
    apiFails: { type: Number, default: 0 }, // our API answered 5xx or the network failed
    rageClicks: { type: Number, default: 0 }, // 3+ fast clicks on the same spot
    formStarts: { type: Number, default: 0 },
    formAbandons: { type: Number, default: 0 }, // typed into a form, left without sending it
  },

  converted: { type: Boolean, default: false, index: true },
  convertedAt: { type: Date },
  conversions: { type: Number, default: 0 },
  lastConversion: { type: String, default: '' }, // e.g. "Lead form", "Consultation call"
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  leadName: { type: String, default: '' },

  expireAt: { type: Date, index: { expires: 0 } },
}, { versionKey: false, minimize: false });

visitorSchema.index({ converted: 1, sessions: -1, lastSeen: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);
