const AiCall = require('../models/AiCall');
const Lead = require('../models/Lead');
const Settings = require('../models/Settings');
const { scopedStaffId, canAccessLead, actorName } = require('../utils/leadAccess');
const {
  queueCall, getConfig, isWithinWindow, fetchExecution, recordExecution, CallError,
} = require('../services/bolnaCalls');

const OBJECT_ID = /^[a-f0-9]{24}$/i;
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Staff who only see their own leads only see calls to those leads
async function scopeFilter(req) {
  const staffId = scopedStaffId(req);
  if (!staffId) return {};
  const ids = await Lead.find({ assignedTo: staffId }).distinct('_id');
  return { leadId: { $in: ids } };
}

const sendError = (res, err, what) => {
  if (err instanceof CallError) return res.status(err.status).json({ message: err.message });
  console.error(`[AI calls] ${what}:`, err);
  return res.status(500).json({ message: 'Server error' });
};

/** GET /api/admin/ai-calls?kind=ai|human&direction=&outcome=&status=&q=&from=&to=&page=&limit= */
exports.listCalls = async (req, res) => {
  try {
    const { direction, outcome, status, trigger, kind, q, from, to, leadId } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const filter = { ...(await scopeFilter(req)) };
    if (['inbound', 'outbound'].includes(direction)) filter.direction = direction;
    if (['ai', 'human'].includes(kind)) filter.kind = kind;
    if (typeof outcome === 'string' && outcome) filter.outcome = outcome;
    if (typeof trigger === 'string' && trigger) filter.trigger = trigger;
    if (status === 'answered') filter.durationSec = { $gt: 0 };
    else if (status === 'unanswered') filter.status = { $in: ['no-answer', 'busy', 'failed', 'error', 'canceled', 'stopped', 'balance-low'] };
    else if (status === 'pending') filter.status = { $in: ['scheduled', 'queued', 'rescheduled', 'initiated', 'ringing', 'in-progress'] };
    if (typeof leadId === 'string' && OBJECT_ID.test(leadId)) filter.leadId = leadId;
    if (from || to) {
      filter.createdAt = {};
      if (from && !Number.isNaN(Date.parse(from))) filter.createdAt.$gte = new Date(from);
      if (to && !Number.isNaN(Date.parse(to))) filter.createdAt.$lte = new Date(to);
    }
    if (typeof q === 'string' && q.trim()) {
      const re = new RegExp(escapeRegex(q.trim().slice(0, 60)), 'i');
      filter.$or = [{ name: re }, { phone: re }, { summary: re }];
    }

    const [items, total] = await Promise.all([
      AiCall.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .select('-transcript -extracted').lean(),
      AiCall.countDocuments(filter),
    ]);
    return res.json({ items, total, page, limit });
  } catch (err) {
    return sendError(res, err, 'list');
  }
};

/** GET /api/admin/ai-calls/stats?days=7 */
exports.getStats = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 90);
    const since = new Date(Date.now() - days * 86400000);
    const match = { ...(await scopeFilter(req)), createdAt: { $gte: since } };

    const [totals] = await AiCall.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          calls: { $sum: 1 },
          answered: { $sum: { $cond: [{ $gt: ['$durationSec', 0] }, 1, 0] } },
          inbound: { $sum: { $cond: [{ $eq: ['$direction', 'inbound'] }, 1, 0] } },
          team: { $sum: { $cond: [{ $eq: ['$kind', 'human'] }, 1, 0] } },
          interested: { $sum: { $cond: [{ $eq: ['$outcome', 'consultation_yes'] }, 1, 0] } },
          callbacks: { $sum: { $cond: [{ $eq: ['$outcome', 'callback'] }, 1, 0] } },
          notInterested: { $sum: { $cond: [{ $in: ['$outcome', ['not_interested', 'do_not_call']] }, 1, 0] } },
          seconds: { $sum: '$durationSec' },
        },
      },
    ]);
    const byDay = await AiCall.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } },
          calls: { $sum: 1 },
          answered: { $sum: { $cond: [{ $gt: ['$durationSec', 0] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const config = await getConfig();
    return res.json({
      days,
      totals: totals || { calls: 0, answered: 0, inbound: 0, team: 0, interested: 0, callbacks: 0, notInterested: 0, seconds: 0 },
      byDay: byDay.map((d) => ({ date: d._id, calls: d.calls, answered: d.answered })),
      setup: {
        apiKey: Boolean(config.apiKey),
        agentId: Boolean(config.agentId),
        webhookSecret: (process.env.BOLNA_WEBHOOK_SECRET || '').length >= 16,
        autoEnabled: config.autoEnabled,
        inWindow: isWithinWindow(new Date(), config),
        windowStartHour: config.windowStartHour,
        windowEndHour: config.windowEndHour,
        riyaNumber: config.fromNumber,
        teamNumber: process.env.VOBIZ_TEAM_NUMBER || '',
      },
    });
  } catch (err) {
    return sendError(res, err, 'stats');
  }
};

/** GET /api/admin/ai-calls/:id  (transcript, recording, extracted fields) */
exports.getCall = async (req, res) => {
  try {
    if (!OBJECT_ID.test(req.params.id)) return res.status(404).json({ message: 'Call not found' });
    const call = await AiCall.findOne({ _id: req.params.id, ...(await scopeFilter(req)) }).lean();
    if (!call) return res.status(404).json({ message: 'Call not found' });
    const lead = call.leadId
      ? await Lead.findById(call.leadId).select('name phone email status dreamCountry course assignedTo').lean()
      : null;
    return res.json({ ...call, lead });
  } catch (err) {
    return sendError(res, err, 'detail');
  }
};

/** POST /api/admin/ai-calls/:id/sync  pulls the latest from Bolna (if a webhook was missed) */
exports.syncCall = async (req, res) => {
  try {
    if (!OBJECT_ID.test(req.params.id)) return res.status(404).json({ message: 'Call not found' });
    const call = await AiCall.findOne({ _id: req.params.id, ...(await scopeFilter(req)) }).lean();
    if (!call) return res.status(404).json({ message: 'Call not found' });
    if (call.kind === 'human') throw new CallError('Team calls update by themselves from Vobiz');
    const execution = await fetchExecution(call.executionId);
    const { call: updated } = await recordExecution({ ...execution, id: call.executionId });
    return res.json(updated);
  } catch (err) {
    return sendError(res, err, 'sync');
  }
};

const readSchedule = (body) => {
  if (!body.scheduledAt) return null;
  const at = new Date(body.scheduledAt);
  if (Number.isNaN(at.getTime())) throw new CallError('Pick a valid date and time');
  if (at.getTime() < Date.now() - 60000) throw new CallError('That time has already passed');
  return at;
};

/**
 * POST /api/admin/ai-calls
 * { leadId } or { phone, name }, plus optional customInstructions and scheduledAt (ISO)
 */
exports.startCall = async (req, res) => {
  try {
    const { leadId, phone, name, customInstructions } = req.body || {};
    const scheduledAt = readSchedule(req.body || {});
    const config = await getConfig();
    if (!scheduledAt && !isWithinWindow(new Date(), config)) {
      throw new CallError(`Calls go out between ${config.windowStartHour}:00 and ${config.windowEndHour}:00 IST. Pick a time to schedule it.`);
    }

    let lead = null;
    if (leadId) {
      if (!OBJECT_ID.test(String(leadId))) throw new CallError('Lead not found', 404);
      lead = await Lead.findById(leadId);
      if (!lead || !canAccessLead(req, lead)) throw new CallError('Lead not found', 404);
      if ((lead.tags || []).includes('do-not-call') && !req.body.overrideDoNotCall) {
        throw new CallError('This student asked not to be called (tag "do-not-call").', 409);
      }
    } else if (!phone) {
      throw new CallError('Enter a phone number or pick a lead');
    }

    const call = await queueCall({
      lead,
      phone,
      name: typeof name === 'string' ? name.slice(0, 80) : '',
      trigger: 'manual',
      customInstructions: typeof customInstructions === 'string' ? customInstructions : '',
      requestedBy: actorName(req, 'Admin'),
      scheduledAt,
      config,
    });
    return res.status(201).json(call);
  } catch (err) {
    return sendError(res, err, 'start');
  }
};

/** POST /api/admin/ai-calls/batch  { leadIds: [], customInstructions, scheduledAt } (max 50) */
exports.startBatch = async (req, res) => {
  try {
    const ids = [...new Set((req.body?.leadIds || []).map(String).filter((id) => OBJECT_ID.test(id)))];
    if (!ids.length) throw new CallError('Select at least one lead');
    if (ids.length > 50) throw new CallError('At most 50 leads per batch');
    const config = await getConfig();
    const scheduledAt = readSchedule(req.body || {}) || (isWithinWindow(new Date(), config) ? null : undefined);
    if (scheduledAt === undefined) {
      throw new CallError(`Calls go out between ${config.windowStartHour}:00 and ${config.windowEndHour}:00 IST. Pick a time to schedule them.`);
    }

    const leads = await Lead.find({ _id: { $in: ids } });
    const results = { queued: 0, skipped: [] };
    const by = actorName(req, 'Admin');
    // One at a time, so Bolna's queue gets them in order and one bad number does not stop the rest
    for (const lead of leads) {
      if (!canAccessLead(req, lead)) { results.skipped.push({ name: lead.name, reason: 'no access' }); continue; }
      if ((lead.tags || []).includes('do-not-call')) { results.skipped.push({ name: lead.name, reason: 'do-not-call' }); continue; }
      try {
        await queueCall({
          lead, trigger: 'batch', customInstructions: req.body.customInstructions || '', requestedBy: by, scheduledAt, config,
        });
        results.queued += 1;
      } catch (err) {
        results.skipped.push({ name: lead.name, reason: err.message });
      }
    }
    return res.json(results);
  } catch (err) {
    return sendError(res, err, 'batch');
  }
};

/** GET /api/admin/ai-calls/settings */
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne().select('aiCall').lean();
    return res.json({
      ...(settings?.aiCall || {}),
      envAgentId: process.env.BOLNA_AGENT_ID || '',
      envFromNumber: process.env.BOLNA_FROM_NUMBER || '',
      autoBlockedByEnv: process.env.BOLNA_AUTO_CALL === 'false',
    });
  } catch (err) {
    return sendError(res, err, 'settings');
  }
};

/** PUT /api/admin/ai-calls/settings  (owner only) */
exports.updateSettings = async (req, res) => {
  try {
    const b = req.body || {};
    const hour = (v, fallback) => (Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 24 ? Number(v) : fallback);
    const start = hour(b.windowStartHour, 9);
    const end = hour(b.windowEndHour, 21);
    if (end - start < 1) throw new CallError('Calling hours must end at least an hour after they start');
    const fromNumber = String(b.fromNumber || '').replace(/\s+/g, '');
    if (fromNumber && !/^\+\d{11,14}$/.test(fromNumber)) throw new CallError('Caller number must look like +918065356711');

    const aiCall = {
      autoEnabled: Boolean(b.autoEnabled),
      agentId: String(b.agentId || '').trim().slice(0, 64),
      fromNumber,
      windowStartHour: start,
      windowEndHour: end,
      dailyAutoLimit: Math.min(Math.max(parseInt(b.dailyAutoLimit, 10) || 100, 1), 2000),
    };
    const settings = (await Settings.findOne()) || new Settings();
    settings.aiCall = aiCall;
    await settings.save();
    return res.json(aiCall);
  } catch (err) {
    return sendError(res, err, 'save settings');
  }
};
