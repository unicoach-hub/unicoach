const jwt = require('jsonwebtoken');
require('dotenv').config();

const { JWT_SECRET } = require('../config/jwt');

/**
 * Middleware to verify JWT token and attach user info to request.
 */
function verifyToken(req, res, next) {
  // Dual-mode security: Inspect HttpOnly cookie first, then Bearer header
  const authHeader = req.headers['authorization'];
  const rawBearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const bearerToken = rawBearer && !['null', 'undefined', 'cookie-session'].includes(rawBearer) ? rawBearer : null;
  // Admin routes use the admin_token cookie; everything else the student 'token' cookie.
  // An explicit Bearer token always wins, so the admin panel never picks up a student's cookie.
  const isAdminRoute = (req.originalUrl || '').startsWith('/api/admin');
  const cookieToken = req.cookies
    ? (isAdminRoute ? (req.cookies.admin_token || req.cookies.token) : req.cookies.token)
    : null;
  const token = bearerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No authorization token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Session expired or invalid token' });
    }
    req.user = user; // contains id and role
    next();
  });
}

/**
 * Middleware to ensure the user has admin role.
 */
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
}

module.exports = { verifyToken, requireAdmin };
