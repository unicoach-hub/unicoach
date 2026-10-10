const mongoose = require('mongoose');

// A chat message in a student's conversation: plain text, a shared file, or a document request
const studentMessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentConversation', required: true, index: true },
  senderType: { type: String, enum: ['student', 'staff'], required: true },
  senderName: { type: String, default: '' },
  kind: { type: String, enum: ['text', 'file', 'request'], default: 'text' },
  text: { type: String, default: '', maxlength: 4000 },
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentDocument' },
  requestTitles: { type: [String], default: undefined },
}, { timestamps: true });

studentMessageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model('StudentMessage', studentMessageSchema);
