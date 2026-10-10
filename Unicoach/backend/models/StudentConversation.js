const mongoose = require('mongoose');

// One chat thread per student (the "student file"), shared by the student and their counselor.
// assignedTo holds the counselor's Staff id as a string, like Lead.assignedTo.
const studentConversationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  assignedTo: { type: String, default: 'Unassigned', index: true },
  lastMessageAt: { type: Date, default: Date.now, index: true },
  lastMessagePreview: { type: String, default: '' },
  unreadForStaff: { type: Number, default: 0 },
  unreadForStudent: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('StudentConversation', studentConversationSchema);
