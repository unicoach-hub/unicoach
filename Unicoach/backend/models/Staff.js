const mongoose = require('mongoose');

// Staff account for the admin portal. Kept apart from User so a staff email can't clash with a student
// account and staff never appear in the students list.
// Each staff member carries their own access: permissions { [sectionKey]: { view, create, update, delete } }
// (see config/staffPermissions.js). `title` is just the job label shown in the panel, e.g. "Counselor".
const staffSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  avatar: { type: String, trim: true, default: '' }, // optional photo (uploaded via /api/admin/upload)
  passwordHash: { type: String, required: true },
  title: { type: String, trim: true, maxlength: 60, default: 'Staff' },
  permissions: { type: mongoose.Schema.Types.Mixed, default: {} },
  // 'assigned' = in Leads they only see leads assigned to them
  leadScope: { type: String, enum: ['assigned', 'all'], default: 'assigned' },
  active: { type: Boolean, default: true },
  // Bumped when the password is reset or the account is switched off, so older sessions stop working
  tokenVersion: { type: Number, default: 0 },
  lastLoginAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, minimize: false });

module.exports = mongoose.model('Staff', staffSchema);
