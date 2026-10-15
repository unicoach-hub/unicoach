// Admin API for WhatsApp campaigns (list, create/schedule, report, pause/resume/cancel)
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const CampaignRecipient = require('../models/CampaignRecipient');
const { createCampaign, buildRecipients, campaignStats } = require('../services/whatsappCampaigns');
const Template = require('../models/Template');

const fail = (res, err, fallback) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  console.error(`[Campaigns] ${fallback}:`, err);
  return res.status(500).json({ message: fallback });
};

/** GET /api/admin/campaigns */
exports.list = async (req, res) => {
  try {
    const items = await Campaign.find().sort({ createdAt: -1 }).limit(100).lean();
    return res.json(items);
  } catch (err) {
    return fail(res, err, 'Could not load campaigns');
  }
};

/** POST /api/admin/campaigns/preview — how many people it would go to */
exports.preview = async (req, res) => {
  try {
    const { templateId, target, audience, customRecipients, variables } = req.body || {};
    const template = templateId ? await Template.findById(templateId).lean() : null;
    const templateParams = template?.wabaParameters ? template.wabaParameters.split(',').map((p) => p.trim()).filter(Boolean) : [];
    const { rows, skipped } = await buildRecipients({ target, audience, customRecipients, templateParams, variables });
    return res.json({ count: rows.length, skipped, sample: rows.slice(0, 3).map((r) => ({ name: r.name, phone: r.phone, params: r.params })) });
  } catch (err) {
    return fail(res, err, 'Could not count the audience');
  }
};

/** POST /api/admin/campaigns */
exports.create = async (req, res) => {
  try {
    const campaign = await createCampaign({ ...(req.body || {}), createdBy: req.user?.name || req.user?.email || 'Admin' });
    return res.status(201).json(campaign);
  } catch (err) {
    return fail(res, err, 'Could not create the campaign');
  }
};

/** GET /api/admin/campaigns/:id?page=1&filter=failed */
exports.get = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Not found' });
    const campaign = await Campaign.findById(req.params.id).lean();
    if (!campaign) return res.status(404).json({ message: 'Not found' });
    const stats = await campaignStats(campaign._id);

    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = 50;
    const q = { campaign: campaign._id };
    const filter = req.query.filter;
    if (['queued', 'sent', 'failed', 'skipped'].includes(filter)) q.status = filter === 'queued' ? { $in: ['queued', 'sending'] } : filter;
    const [rows, totalRows] = await Promise.all([
      CampaignRecipient.find(q).sort({ _id: 1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      CampaignRecipient.countDocuments(q),
    ]);
    const recipients = rows.map((r) => ({
      id: r._id,
      name: r.name,
      phone: r.phone,
      status: r.status === 'sent' ? (stats.undelivered.has(r.waMessageId) ? 'failed' : stats.perMessage[r.waMessageId] || 'sent') : r.status,
      error: r.error,
      sentAt: r.sentAt,
    }));
    const { perMessage, undelivered, ...numbers } = stats;
    return res.json({ campaign, stats: numbers, recipients, page, pageSize, totalRows });
  } catch (err) {
    return fail(res, err, 'Could not load the campaign');
  }
};

const setStatus = (from, to) => async (req, res) => {
  try {
    const update = { status: to, ...(to === 'running' ? { lastError: '' } : {}), ...(to === 'cancelled' ? { finishedAt: new Date() } : {}) };
    const c = await Campaign.findOneAndUpdate({ _id: req.params.id, status: { $in: from } }, { $set: update }, { new: true });
    if (!c) return res.status(400).json({ message: `This campaign can't be ${to === 'running' ? 'resumed' : to} now` });
    if (to === 'cancelled') {
      await CampaignRecipient.updateMany({ campaign: c._id, status: 'queued' }, { $set: { status: 'skipped', error: 'Campaign cancelled' } });
    }
    return res.json(c);
  } catch (err) {
    return fail(res, err, 'Could not update the campaign');
  }
};

exports.pause = setStatus(['running', 'scheduled'], 'paused');
exports.resume = setStatus(['paused'], 'running');
exports.cancel = setStatus(['scheduled', 'running', 'paused'], 'cancelled');
