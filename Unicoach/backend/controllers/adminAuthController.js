const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

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
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
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
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

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

