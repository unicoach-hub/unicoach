const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const UnicoachMentor = require('../models/UnicoachMentor');
const User = require('../../models/User');
require('dotenv').config();

const { JWT_SECRET } = require('../../config/jwt');

/**
 * mentorAuth Middleware
 * 
 * Strict Creator Studio Security:
 * 1. Verifies the user is authenticated (via HttpOnly cookie or Bearer token).
 * 2. If a handle parameter is provided, verifies that the authenticated user
 *    actually owns the requested mentor profile (or is an admin).
 * 3. Prevents unauthorized users from accessing or modifying other mentors'
 *    dashboards, earnings, payouts, bookings, or private messages.
 */
const mentorAuth = async (req, res, next) => {
  try {
    // 1. Extract token from cookie or Authorization header
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const cookieToken = req.cookies ? req.cookies.token : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please log in to access the Creator Studio.'
      });
    }

    // 2. Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Session expired or invalid. Please log in again.'
      });
    }

    req.user = decoded; // { id, role }

    // Fetch user details (for email/phone reconciliation)
    const userDoc = await User.findById(decoded.id).select('name email phone role');
    if (!userDoc) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User account not found.'
      });
    }

    req.currentUser = userDoc;

    // 3. If route has a :handle parameter, verify ownership
    const handle = req.validatedHandle || req.params.handle;
    if (handle) {
      const cleanHandle = handle.replace(/^@/, '').toLowerCase().trim();
      const mentor = await UnicoachMentor.findOne({ handle: cleanHandle });

      if (!mentor) {
        return res.status(404).json({
          error: 'Mentor not found',
          message: `No creator found with handle @${cleanHandle}`
        });
      }

      // Allow admin bypass
      if (decoded.role === 'admin' || userDoc.role === 'admin') {
        req.mentor = mentor;
        return next();
      }

      // Check direct userId ownership
      const userIdStr = userDoc._id.toString();
      if (mentor.userId && mentor.userId.toString() === userIdStr) {
        req.mentor = mentor;
        return next();
      }

      // Auto-link legacy mentor profiles that have NO owner yet, and only by exact email match.
      // Never re-link a profile already owned by another user; phone-only matches grant nothing.
      const emailMatch = mentor.email && userDoc.email
        && mentor.email.trim().toLowerCase() === userDoc.email.trim().toLowerCase();

      if (!mentor.userId && emailMatch) {
        mentor.userId = userDoc._id;
        await mentor.save();
        req.mentor = mentor;
        return next();
      }

      // Access Denied: User is trying to access someone else's creator studio
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access Denied: You do not have permission to manage @${cleanHandle}'s Creator Studio. This dashboard can only be accessed by its verified owner.`
      });
    }

    next();
  } catch (err) {
    console.error('mentorAuth middleware error:', err);
    res.status(500).json({ error: 'Authentication verification failed.' });
  }
};

module.exports = { mentorAuth };
