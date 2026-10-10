const mongoose = require('mongoose');

// A task in the admin portal: given by the owner/a manager to a staff member, or a staff member's own to-do.
// assignee/creator are { kind: 'owner' | 'staff', id } so the owner (a User) can hold tasks too.
const personSchema = new mongoose.Schema({
  kind: { type: String, enum: ['owner', 'staff'], required: true },
  id: { type: String, required: true },
  name: { type: String, default: '' },
}, { _id: false });

const staffTaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  assignee: { type: personSchema, required: true },
  createdBy: { type: personSchema, required: true },
  dueAt: { type: Date, index: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo', index: true },
  completedAt: { type: Date },
  // When each person last opened the task (person id → date); anything newer from someone else is "new" for them
  seenBy: { type: Map, of: Date, default: {} },
  comments: [{
    by: { type: personSchema, required: true },
    text: { type: String, required: true, maxlength: 1000 },
    at: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

staffTaskSchema.index({ 'assignee.id': 1, status: 1, dueAt: 1 });

module.exports = mongoose.model('StaffTask', staffTaskSchema);
