const mongoose = require('mongoose');

// What Meta tells us about WhatsApp traffic: replies from students and delivery status of what we sent
const whatsappEventSchema = new mongoose.Schema({
  kind: { type: String, enum: ['message', 'status'], required: true, index: true },
  // message: 'in' = from the student, 'out' = sent by us (admin inbox or bulk)
  direction: { type: String, enum: ['in', 'out'], default: 'in' },
  readByAdmin: { type: Boolean, default: false },
  sentBy: { type: String },
  template: { type: String },
  waMessageId: { type: String, index: true },
  phone: { type: String, index: true }, // the student's number (digits, with country code)
  name: { type: String },
  // message: the student's text (or a note like "[image]"); status: sent | delivered | read | failed
  text: { type: String },
  status: { type: String },
  error: { type: String },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  at: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

whatsappEventSchema.index({ kind: 1, at: -1 });
whatsappEventSchema.index({ kind: 1, phone: 1, at: -1 });

module.exports = mongoose.model('WhatsappEvent', whatsappEventSchema);
