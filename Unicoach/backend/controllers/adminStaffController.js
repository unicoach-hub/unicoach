const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Staff = require('../models/Staff');
const { sanitizePermissions } = require('../config/staffPermissions');

const MIN_PASSWORD = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isId = (v) => mongoose.Types.ObjectId.isValid(String(v || ''));
// Photo must be an uploaded image URL (Cloudinary https, or a local /uploads path); anything else is dropped
const cleanAvatar = (v) => {
  const url = text(v, 500);
  return /^https:\/\//i.test(url) || /^\/uploads\/[\w.-]+$/.test(url) ? url : '';
};

const publicStaff = (s) => ({
  _id: s._id,
  name: s.name,
  email: s.email,
  phone: s.phone,
  avatar: s.avatar || '',
  title: s.title,
  permissions: s.permissions || {},
  leadScope: s.leadScope,
  active: s.active,
  lastLoginAt: s.lastLoginAt,
  createdAt: s.createdAt,
});

const hasAnyAccess = (permissions) => Object.keys(permissions).length > 0;

exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 }).lean();
    return res.json(staff.map(publicStaff));
  } catch (err) {
    console.error('Error fetching staff:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/admin/staff
 * One step: the person's details, login password and what they can access
 */
exports.createStaff = async (req, res) => {
  try {
    const name = text(req.body.name, 80);
    const email = text(req.body.email, 120).toLowerCase();
    const phone = text(req.body.phone, 30);
    const title = text(req.body.title, 60);
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const permissions = sanitizePermissions(req.body.permissions);

    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'A valid email is required' });
    if (password.length < MIN_PASSWORD) return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD} characters` });
    if (!title) return res.status(400).json({ message: 'Role name is required (e.g. Counselor)' });
    if (!hasAnyAccess(permissions)) return res.status(400).json({ message: 'Tick at least one section they can access' });
    if (await Staff.exists({ email })) return res.status(400).json({ message: 'A staff member with this email already exists' });

    const staff = await Staff.create({
      name,
      email,
      phone,
      avatar: cleanAvatar(req.body.avatar),
      title,
      permissions,
      leadScope: req.body.leadScope === 'all' ? 'all' : 'assigned',
      passwordHash: await bcrypt.hash(password, 10),
      active: req.body.active !== false,
      createdBy: req.user.id,
    });
    return res.status(201).json(publicStaff(staff));
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'A staff member with this email already exists' });
    console.error('Error creating staff:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ message: 'Staff member not found' });
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    const { name, email, phone, avatar, title, permissions, leadScope, active, password } = req.body;
    let signOut = false;

    if (name !== undefined) {
      if (!text(name, 80)) return res.status(400).json({ message: 'Name is required' });
      staff.name = text(name, 80);
    }
    if (email !== undefined) {
      const clean = text(email, 120).toLowerCase();
      if (!EMAIL_RE.test(clean)) return res.status(400).json({ message: 'A valid email is required' });
      if (clean !== staff.email && (await Staff.exists({ email: clean, _id: { $ne: staff._id } }))) {
        return res.status(400).json({ message: 'A staff member with this email already exists' });
      }
      staff.email = clean;
    }
    if (phone !== undefined) staff.phone = text(phone, 30);
    if (avatar !== undefined) staff.avatar = cleanAvatar(avatar);
    if (title !== undefined) {
      if (!text(title, 60)) return res.status(400).json({ message: 'Role name is required (e.g. Counselor)' });
      staff.title = text(title, 60);
    }
    if (permissions !== undefined) {
      const clean = sanitizePermissions(permissions);
      if (!hasAnyAccess(clean)) return res.status(400).json({ message: 'Tick at least one section they can access' });
      staff.permissions = clean;
      staff.markModified('permissions');
    }
    if (leadScope !== undefined) staff.leadScope = leadScope === 'all' ? 'all' : 'assigned';
    if (active !== undefined && Boolean(active) !== staff.active) {
      staff.active = Boolean(active);
      if (!staff.active) signOut = true;
    }
    if (password) {
      if (String(password).length < MIN_PASSWORD) return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD} characters` });
      staff.passwordHash = await bcrypt.hash(String(password), 10);
      signOut = true;
    }
    // A new password or switching the account off ends every open session of that person
    if (signOut) staff.tokenVersion = (staff.tokenVersion || 0) + 1;

    await staff.save();
    return res.json(publicStaff(staff));
  } catch (err) {
    console.error('Error updating staff:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ message: 'Staff member not found' });
    const deleted = await Staff.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Staff member not found' });
    return res.json({ message: 'Staff member removed' });
  } catch (err) {
    console.error('Error deleting staff:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/staff/assignable
 * Active staff for the "Assigned counselor" picker in Leads (id + name only)
 */
exports.getAssignableStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ active: true }).select('name avatar').sort({ name: 1 }).lean();
    return res.json(staff.map((s) => ({ _id: s._id, name: s.name, avatar: s.avatar || '' })));
  } catch (err) {
    console.error('Error fetching assignable staff:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
