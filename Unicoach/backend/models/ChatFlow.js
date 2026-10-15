const mongoose = require('mongoose');

// A WhatsApp chatbot flow drawn in the admin flow builder (React Flow nodes + edges).
// Node types: start (keywords), text, media, buttons, list, link, contact, handoff.
const chatFlowSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  active: { type: Boolean, default: false, index: true },
  // Runs for a message that matched nothing else (at most once a day per person)
  isDefault: { type: Boolean, default: false },
  keywords: [{ type: String }], // copied from the start node for quick matching (lower-case)
  matchType: { type: String, enum: ['exact', 'contains'], default: 'exact' },
  nodes: { type: Array, default: [] },
  edges: { type: Array, default: [] },
  runs: { type: Number, default: 0 },
  updatedBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('ChatFlow', chatFlowSchema);
