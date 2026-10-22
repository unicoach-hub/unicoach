const mongoose = require('mongoose');

// Per-number chatbot state: which flow step is waiting for a button press, and whether a person took over
const whatsappContactSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String },
  needsAgent: { type: Boolean, default: false, index: true },
  needsAgentAt: { type: Date },
  botPausedUntil: { type: Date },
  flow: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatFlow' },
  waitingNode: { type: String },
  lastDefaultAt: { type: Date },
  // Answers collected by Question steps (name, email, dreamCountry, course …), and retries on a bad answer
  attributes: { type: Map, of: String, default: {} },
  waitingAttempts: { type: Number, default: 0 },
  // Admin pressed "Clear chat": the inbox shows only messages after this (history stays for reports)
  clearedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('WhatsappContact', whatsappContactSchema);
