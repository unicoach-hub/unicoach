/**
 * Records the admin actions worth answering for later: money, deletions, approvals and access.
 *
 * It runs after verifyToken/requireAdmin, so req.user (and req.staff) are already loaded, and it
 * writes once the response is finished, so the entry carries the real status code. Writing never
 * blocks or fails the request: a log that cannot be written must not stop the work.
 *
 * Only the routes in AUDITED are kept. Everything else, including every read, is ignored.
 */

const AdminAudit = require('../models/AdminAudit');

// [method, path regex, action name, how to describe it]. First match wins.
const AUDITED = [
  // money
  ['POST', /^\/unicoach\/bookings\/([^/]+)\/refund$/, 'unicoach.booking.refund', (m) => `Refunded booking ${m[1]}`],
  ['POST', /^\/unicoach\/bookings\/([^/]+)\/retry-transfer$/, 'unicoach.booking.retryTransfer', (m) => `Retried the mentor transfer for booking ${m[1]}`],
  ['POST', /^\/unicoach\/payouts\/([^/]+)\/process$/, 'unicoach.payout.process', (m, req) => `${String(req.body?.action || '').toUpperCase() === 'REJECT' ? 'Rejected' : 'Approved'} payout ${m[1]}`],
  ['POST', /^\/unicoach\/weekly-payouts\/([^/]+)\/paid$/, 'unicoach.weeklyPayout.paid', (m) => `Marked this week's payout paid for mentor ${m[1]}`],
  ['POST', /^\/unicoach\/mentors\/([^/]+)\/route-account$/, 'unicoach.mentor.routeAccount', (m) => `Set up / refreshed the payout account for mentor ${m[1]}`],

  // creators
  ['DELETE', /^\/unicoach\/mentors\/([^/]+)$/, 'unicoach.mentor.delete', (m) => `Deleted mentor ${m[1]} and everything attached to them`],
  ['PATCH', /^\/unicoach\/mentors\/([^/]+)\/application$/, 'unicoach.mentor.application', (m, req) => `Set mentor ${m[1]} application to ${req.body?.applicationStatus || 'updated'}`],
  ['PATCH', /^\/unicoach\/mentors\/([^/]+)\/status$/, 'unicoach.mentor.status', (m, req) => `${req.body?.active ? 'Reinstated' : 'Suspended'} mentor ${m[1]}`],
  ['PATCH', /^\/unicoach\/mentors\/([^/]+)\/verify$/, 'unicoach.mentor.verify', (m) => `Changed the verified badge for mentor ${m[1]}`],
  ['DELETE', /^\/unicoach\/reviews\/([^/]+)$/, 'unicoach.review.delete', (m) => `Deleted student review ${m[1]}`],

  // access and settings
  ['POST', /^\/staff$/, 'staff.create', (m, req) => `Created staff account ${req.body?.email || ''}`],
  ['PATCH', /^\/staff\/([^/]+)$/, 'staff.update', (m) => `Changed staff account ${m[1]} (permissions or password)`],
  ['DELETE', /^\/staff\/([^/]+)$/, 'staff.delete', (m) => `Removed staff account ${m[1]}`],
  ['PUT', /^\/auth\/profile$/, 'admin.profile.update', (m, req) => (req.body?.password ? 'Changed the admin password' : 'Updated the admin profile')],
  ['POST', /^\/settings-manage/, 'settings.update', () => 'Changed platform settings'],

  // student data
  ['DELETE', /^\/leads\/([^/]+)$/, 'lead.delete', (m) => `Deleted lead ${m[1]}`],
  ['DELETE', /^\/users\/([^/]+)$/, 'user.delete', (m) => `Deleted user account ${m[1]}`],
  ['DELETE', /^\/students\/([^/]+)$/, 'student.delete', (m) => `Deleted student ${m[1]}`],

  // backups
  ['POST', /^\/dev\/backups\/run$/, 'backup.run', () => 'Started an off-site backup by hand'],
  ['GET', /^\/dev\/backups\/download$/, 'backup.download', () => 'Downloaded a database backup'],
];

const match = (req) => {
  // req.path here is relative to the /api/admin mount
  const path = req.path || '';
  for (const [method, re, action, describe] of AUDITED) {
    if (req.method !== method) continue;
    const m = re.exec(path);
    if (m) return { action, targetId: m[1] || '', describe, matched: m };
  }
  return null;
};

const adminAudit = (req, res, next) => {
  const hit = match(req);
  if (!hit) return next();

  // Read what we need now: the body may be consumed or changed by the time the response ends
  let summary = '';
  try {
    summary = String(hit.describe(hit.matched, req) || '').slice(0, 300);
  } catch {
    summary = hit.action;
  }

  res.on('finish', () => {
    const actor = req.staff || req.user || {};
    // kept on res so tests (and anything else) can await the write instead of guessing a delay
    res.auditWrite = AdminAudit.create({
      actorId: req.user?.id,
      actorName: actor.name || '',
      actorEmail: actor.email || '',
      actorRole: req.user?.role === 'staff' ? 'staff' : 'admin',
      action: hit.action,
      method: req.method,
      path: `/api/admin${req.path}`.slice(0, 300),
      targetId: String(hit.targetId || '').slice(0, 100),
      summary,
      statusCode: res.statusCode,
      ok: res.statusCode < 400,
      ip: String(req.ip || '').slice(0, 60),
    }).catch((err) => console.warn('Admin audit write failed:', err.message));
  });

  return next();
};

module.exports = { adminAudit, AUDITED };
