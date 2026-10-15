const mongoose = require('mongoose');

// Request counts for the Developer Dashboard, one row per route per minute (kept 30 days).
// key: "GET /api/blogs/:slug" for our API, or "ext:api.openai.com" for calls we make to other services.
const apiStatSchema = new mongoose.Schema({
  minute: { type: Date, required: true },
  key: { type: String, required: true },
  count: { type: Number, default: 0 },
  serverErrors: { type: Number, default: 0 }, // 5xx (or failed outside calls)
  clientErrors: { type: Number, default: 0 }, // 4xx
  totalMs: { type: Number, default: 0 },
  maxMs: { type: Number, default: 0 },
}, { versionKey: false });

apiStatSchema.index({ minute: 1, key: 1 }, { unique: true });
apiStatSchema.index({ minute: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('ApiStat', apiStatSchema);
