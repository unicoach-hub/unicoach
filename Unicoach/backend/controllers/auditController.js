const AdminAudit = require('../models/AdminAudit');

/**
 * GET /api/admin/dev/audit
 * Who did what in the admin panel, newest first. Owner only (mounted on the developer routes).
 * Query: ?action=&actor=&limit=&page=
 */
exports.list = async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const page = Math.max(1, Number(req.query.page) || 1);

    const filter = {};
    if (req.query.action) filter.action = String(req.query.action);
    if (req.query.actor) {
      const q = new RegExp(String(req.query.actor).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ actorName: q }, { actorEmail: q }];
    }

    const [entries, total] = await Promise.all([
      AdminAudit.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AdminAudit.countDocuments(filter),
    ]);

    res.json({ entries, total, page, limit });
  } catch (err) {
    console.error('Error reading the admin audit log:', err);
    res.status(500).json({ error: 'Failed to read the admin action log.' });
  }
};
