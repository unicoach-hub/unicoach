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

// Staff session: the account must still exist, be active, and the token must be from the current
// password (tokenVersion). Loaded on every request so switching someone off takes effect at once.
async function loadStaff(req) {
  if (req.staff !== undefined) return req.staff;
  const Staff = require('../models/Staff');
  const staff = await Staff.findById(req.user.id).lean();
  const valid = staff && staff.active && (staff.tokenVersion || 0) === (req.user.tv || 0);
  req.staff = valid ? staff : null;
  return req.staff;
}

const isOwner = (req) => Boolean(req.user && req.user.role === 'admin');

/**
 * Admin-portal guard. The owner (role 'admin') can do everything. Staff can only do what their
 * own permissions allow for the section + action this request maps to (config/staffPermissions.js).
 */
async function requireAdmin(req, res, next) {
  if (isOwner(req)) return next();
  if (!req.user || req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  try {
    const staff = await loadStaff(req);
    if (!staff) return res.status(401).json({ error: 'Unauthorized', message: 'Your staff access has been switched off or your session has expired' });

    const { resolveRequest, can } = require('../config/staffPermissions');
    const need = await resolveRequest(req);
    const perms = staff.permissions || {};
    if (need?.notFound) return res.status(404).json({ message: 'Not found' });
    const allowed = Boolean(need) && !need.ownerOnly && (
      need.module ? can(perms, need.module, need.action)
        : need.modules ? need.modules.every((m) => can(perms, m, need.action))
          : need.anyOf ? need.anyOf.some((m) => can(perms, m, need.action))
            : false
    );
    if (!allowed) {
      return res.status(403).json({ code: 'NO_PERMISSION', message: "You don't have permission to do this. Ask the admin to update your access." });
    }
    return next();
  } catch (err) {
    console.error('Staff permission check failed:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/**
 * Any signed-in admin-portal account (owner or active staff), e.g. for "my profile".
 */
async function requireAdminSession(req, res, next) {
  if (isOwner(req)) return next();
  if (req.user?.role === 'staff') {
    try {
      if (await loadStaff(req)) return next();
      return res.status(401).json({ error: 'Unauthorized', message: 'Your staff access has been switched off or your session has expired' });
    } catch (err) {
      console.error('Staff session check failed:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  return res.status(403).json({ message: 'Admin access required' });
}

/**
 * Owner only (settings, staff and roles).
 */
function requireOwner(req, res, next) {
  if (isOwner(req)) return next();
  return res.status(403).json({ code: 'NO_PERMISSION', message: 'Only the account owner can do this' });
}

module.exports = { verifyToken, requireAdmin, requireAdminSession, requireOwner, loadStaff };
