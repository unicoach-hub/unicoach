const User = require('../models/User');

/**
 * GET /api/admin/users
 * GET all users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-otp -otpExpires -passwordHash').sort({ createdAt: -1 });
    return res.json(users);
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/users/count
 * GET user count
 */
exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    return res.json(count);
  } catch (err) {
    console.error('Error fetching user count:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete user
 */
exports.deleteUser = async (req, res) => {
  try {
    const targetId = String(req.params.id);
    const currentUserId = req.user && String(req.user.id || req.user._id || '');
    if (currentUserId && targetId === currentUserId) {
      return res.status(400).json({ error: 'You cannot delete your own account.', message: 'You cannot delete your own account.' });
    }

    const target = await User.findById(targetId).select('role');
    if (!target) {
      return res.status(404).json({ error: 'User not found', message: 'User not found' });
    }
    if (target.role === 'admin') {
      return res.status(400).json({ error: 'Admin accounts cannot be deleted from this panel.', message: 'Admin accounts cannot be deleted from this panel.' });
    }

    await User.findByIdAndDelete(targetId);
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
