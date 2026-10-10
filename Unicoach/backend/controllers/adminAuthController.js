const User = require('../models/User');
const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const { MODULES } = require('../config/staffPermissions');

const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

// What the admin panel needs to know about a staff member: who they are and what they may do
const staffProfile = (staff) => ({
  _id: staff._id,
  id: staff._id,
  name: staff.name,
  email: staff.email,
  phone: staff.phone,
  avatar: staff.avatar || '',
  role: 'staff',
  roleName: staff.title || 'Staff',
  permissions: staff.permissions || {},
  leadScope: staff.leadScope || 'assigned',
});

// Staff sign in with their email on the same admin login form
async function staffLogin(email, password, res) {
  const staff = await Staff.findOne({ email: email.toLowerCase() });
  if (!staff || !(await bcrypt.compare(password, staff.passwordHash))) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  if (!staff.active) {
    return res.status(403).json({ message: 'Your staff access is switched off. Please contact the admin.' });
  }
  staff.lastLoginAt = new Date();
  await staff.save();

  const token = jwt.sign({ id: staff._id, role: 'staff', tv: staff.tokenVersion || 0 }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('admin_token', token, ADMIN_COOKIE_OPTIONS);
  return res.json({ token, user: staffProfile(staff) });
}

/**
 * POST /api/admin/auth/login
 * Admin Login - expects { username, password }
 */
exports.adminLogin = async (req, res) => {
  try {
    let { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const cleanUsername = username.toString().trim();
    const cleanPassword = password.toString().trim();

    // Case-insensitive lookup by username or email
    const safeRegex = new RegExp(`^${cleanUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const user = await User.findOne({
      $or: [
        { username: { $regex: safeRegex } },
        { email: cleanUsername.toLowerCase() }
      ]
    });
    if (!user || user.role !== 'admin') {
      // Not the owner account: try a staff account with this email
      if (cleanUsername.includes('@')) return staffLogin(cleanUsername, cleanPassword, res);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ message: 'No password set for this account' });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Admin session gets its OWN cookie name so a student login on the same browser can't replace it
    res.cookie('admin_token', token, ADMIN_COOKIE_OPTIONS);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/auth/profile
 * GET Admin Profile info
 */
exports.getAdminProfile = async (req, res) => {
  try {
    if (req.user.role === 'staff') return res.json(staffProfile(req.staff));
    const user = await User.findById(req.user.id).select('-otp -otpExpires -passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    return res.json(user);
  } catch (err) {
    console.error('Fetch profile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/admin/auth/update-profile
 * Update Admin Profile (username, email, password)
 */
exports.updateAdminProfile = async (req, res) => {
  try {
    if (req.user.role === 'staff') return updateStaffPassword(req, res);
    const { username, email, password } = req.body;
    const adminId = req.user.id;

    const user = await User.findById(adminId);
    if (!user) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: adminId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }

    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: adminId } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      user.email = email;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Staff can't change their own password: the owner sets and resets it in Staff & Roles
function updateStaffPassword(req, res) {
  return res.status(403).json({ code: 'NO_PERMISSION', message: 'Only the admin can change staff passwords. Ask the admin for a new one.' });
}

/**
 * GET /api/admin/auth/sections
 * The sections and actions staff can be given (for the access editor)
 */
exports.getSections = (req, res) => res.json(MODULES);

/**
 * GET /api/admin/auth/test
 * Quick test endpoint
 */
exports.testAdminAuth = (req, res) => {
  return res.json({ message: 'Admin authenticated successfully', user: req.user });
};

/**
 * POST /api/admin/auth/logout
 * Clears admin authentication cookie
 */
exports.adminLogout = (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  return res.json({ success: true, message: 'Admin logged out successfully' });
};

