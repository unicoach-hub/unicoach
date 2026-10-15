// WhatsApp campaigns: build the recipient list once, then send in the background at a steady pace.
//
// A small worker runs every few seconds inside the API process. It starts campaigns whose time has
// come, takes the next few queued recipients (each one claimed atomically, so a second server
// instance can never send the same message twice), sends the approved template, and records the
// result. Delivered / read / replied come in later on the webhook and are counted on the report.
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const CampaignRecipient = require('../models/CampaignRecipient');
const Template = require('../models/Template');
const Settings = require('../models/Settings');
const Lead = require('../models/Lead');
const Event = require('../models/Event');
const WhatsappEvent = require('../models/WhatsappEvent');
const { buildAudienceQuery } = require('../utils/leadAudience');
const { sendAndRecord } = require('../controllers/whatsappInboxController');

const TICK_MS = 3000;
const PER_TICK = 20; // ~6–7 messages a second, well under Meta's limit
const STUCK_MS = 2 * 60 * 1000;
// Meta errors that mean "stop everything until someone fixes the account" (bad token, account restricted …)
const FATAL_CODES = new Set([190, 200, 10, 131031, 131042, 368]);

const digits = (v) => String(v || '').replace(/\D/g, '');
const normalisePhone = (v) => {
  const d = digits(v);
  return d.length === 10 ? `91${d}` : d;
};

const helpers = () => require('../controllers/adminMessagingController').helpers;

/** Everyone the campaign goes to, with each {{n}} already filled in */
async function buildRecipients({ target, audience, customRecipients, templateParams, variables }) {
  const { LEAD_FIELDS, eventVariables, resolveTemplateKey } = helpers();
  const fields = `${LEAD_FIELDS} whatsappOptOut`;
  let people = [];
  let vars = { ...(variables || {}) };
  if (target === 'audience') people = await Lead.find(buildAudienceQuery(audience, { forEmail: false })).select(fields).lean();
  else if (target === 'leads') people = await Lead.find({ verified: true }).select(fields).lean();
  else if (target === 'all-leads') people = await Lead.find({}).select(fields).lean();
  else if (typeof target === 'string' && target.startsWith('event:')) {
    const id = target.slice(6);
    if (mongoose.Types.ObjectId.isValid(id)) {
      const ev = await Event.findById(id).select('attendees title eventStart joiningLink').lean();
      people = (ev?.attendees || []).map((a) => ({ name: a.name, email: a.email, phone: a.phone, preferredIntake: a.intake }));
      if (ev) vars = { ...eventVariables(ev), ...vars };
    }
  } else if (target === 'custom' && Array.isArray(customRecipients)) {
    people = customRecipients.filter((r) => r && typeof r === 'object' && r.phone);
  }

  const seen = new Set();
  const rows = [];
  let skipped = 0;
  for (const p of people) {
    const phone = normalisePhone(p.phone);
    if (phone.length < 11 || phone.length > 15 || p.whatsappOptOut || seen.has(phone)) {
      skipped += 1;
      continue;
    }
    seen.add(phone);
    const data = {
      name: p.name || 'Student',
      email: p.email || '',
      phone: p.phone || '',
      dreamCountry: p.dreamCountry || '',
      preferredIntake: p.preferredIntake || '',
      highestEducation: p.highestEducation || '',
      currentCity: p.currentCity || '',
      ...vars,
    };
    rows.push({
      phone,
      name: p.name || '',
      lead: p._id && target !== 'custom' && !String(target).startsWith('event:') ? p._id : undefined,
      params: (templateParams || []).map((k) => String(resolveTemplateKey(k, data) ?? '')),
    });
  }
  return { rows, skipped, vars };
}

/** Create a campaign (status "scheduled"); the worker picks it up at scheduledAt */
async function createCampaign({ name, templateId, target, audience, customRecipients, variables, scheduledAt, createdBy }) {
  const template = await Template.findById(templateId).lean();
  if (!template || template.type !== 'whatsapp') throw Object.assign(new Error('Choose a WhatsApp template'), { status: 400 });
  if (!template.wabaTemplateName || template.metaStatus !== 'APPROVED') {
    throw Object.assign(new Error('Only templates approved by Meta can be sent as a campaign'), { status: 400 });
  }
  const templateParams = template.wabaParameters ? template.wabaParameters.split(',').map((p) => p.trim()).filter(Boolean) : [];
  const { readCampaignVariables } = helpers();
  const { rows, skipped, vars } = await buildRecipients({ target, audience, customRecipients, templateParams, variables: readCampaignVariables(variables) });
  if (!rows.length) throw Object.assign(new Error('Nobody in this audience has a valid WhatsApp number'), { status: 400 });

  // A variable nobody can fill would make Meta reject every message
  const emptyIdx = templateParams.findIndex((_, i) => rows.every((r) => !r.params[i]));
  if (emptyIdx >= 0) {
    throw Object.assign(new Error(`Nothing fills {{${emptyIdx + 1}}} (${templateParams[emptyIdx]}). Add it under Campaign variables.`), { status: 400 });
  }

  const when = scheduledAt ? new Date(scheduledAt) : new Date();
  if (Number.isNaN(when.getTime())) throw Object.assign(new Error('Invalid schedule time'), { status: 400 });

  const campaign = await Campaign.create({
    name: String(name || template.name).slice(0, 120),
    template: template._id,
    templateName: template.wabaTemplateName,
    templateLanguage: template.wabaLanguageCode || 'en_US',
    templateParams,
    target,
    audience,
    variables: vars,
    scheduledAt: when,
    status: 'scheduled',
    total: rows.length,
    skipped,
    createdBy,
  });
  await CampaignRecipient.insertMany(rows.map((r) => ({ ...r, campaign: campaign._id })), { ordered: false });
  return campaign;
}

async function finishIfDone(campaignId) {
  const left = await CampaignRecipient.countDocuments({ campaign: campaignId, status: { $in: ['queued', 'sending'] } });
  if (!left) {
    await Campaign.updateOne({ _id: campaignId, status: 'running' }, { $set: { status: 'completed', finishedAt: new Date() } });
  }
}

async function runCampaign(campaign, settings) {
  const template = await Template.findById(campaign.template).select('headerType headerMediaUrl').lean();
  const { sendComponents } = require('../utils/waTemplate');
  for (let i = 0; i < PER_TICK; i += 1) {
    const r = await CampaignRecipient.findOneAndUpdate(
      { campaign: campaign._id, status: 'queued' },
      { $set: { status: 'sending', updatedAt: new Date() } },
      { new: true, sort: { _id: 1 } },
    );
    if (!r) {
      await finishIfDone(campaign._id);
      return;
    }
    try {
      const event = await sendAndRecord({
        settings,
        phone: r.phone,
        lead: r.lead ? { _id: r.lead } : null,
        sentBy: `Campaign: ${campaign.name}`,
        template: campaign.templateName,
        text: '',
        payload: {
          type: 'template',
          template: {
            name: campaign.templateName,
            language: { code: campaign.templateLanguage || 'en_US' },
            components: sendComponents(template || {}, r.params),
          },
        },
      });
      await CampaignRecipient.updateOne({ _id: r._id }, { $set: { status: 'sent', waMessageId: event.waMessageId, sentAt: new Date() } });
      await Campaign.updateOne({ _id: campaign._id }, { $inc: { sent: 1 } });
    } catch (err) {
      await CampaignRecipient.updateOne({ _id: r._id }, { $set: { status: 'failed', error: String(err.message).slice(0, 300) } });
      await Campaign.updateOne({ _id: campaign._id }, { $inc: { failed: 1 }, $set: { lastError: String(err.message).slice(0, 300) } });
      if (FATAL_CODES.has(Number(err.code))) {
        // Account-level problem: pause instead of failing everyone in the list
        await CampaignRecipient.updateOne({ _id: r._id }, { $set: { status: 'queued', error: '' } });
        await Campaign.updateOne({ _id: campaign._id }, { $inc: { failed: -1 }, $set: { status: 'paused', lastError: `Paused: ${err.message}` } });
        return;
      }
    }
  }
}

let running = false;
async function tick() {
  if (running || mongoose.connection.readyState !== 1) return;
  running = true;
  try {
    const now = new Date();
    // Messages stuck in "sending" (server restarted mid-send): we can't know if Meta got them, so don't resend
    await CampaignRecipient.updateMany(
      { status: 'sending', updatedAt: { $lt: new Date(now - STUCK_MS) } },
      { $set: { status: 'failed', error: 'Interrupted while sending (server restart). Not resent to avoid a duplicate.' } },
    );
    // Start campaigns whose time has come
    await Campaign.updateMany({ status: 'scheduled', scheduledAt: { $lte: now } }, { $set: { status: 'running', startedAt: now } });

    const active = await Campaign.find({ status: 'running' }).sort({ startedAt: 1 }).limit(5).lean();
    if (!active.length) return;
    const settings = await Settings.findOne();
    if (!settings?.wabaAccessToken || !settings?.wabaPhoneNumberId) {
      await Campaign.updateMany({ status: 'running' }, { $set: { status: 'paused', lastError: 'Paused: WhatsApp is not connected' } });
      return;
    }
    for (const c of active) await runCampaign(c, settings);
  } catch (err) {
    console.error('[Campaigns] worker error:', err.message);
  } finally {
    running = false;
  }
}

let timer = null;
function startWorker() {
  if (timer || process.env.DISABLE_CAMPAIGN_WORKER === 'true') return;
  timer = setInterval(tick, TICK_MS);
  if (timer.unref) timer.unref();
}
function stopWorker() {
  if (timer) clearInterval(timer);
  timer = null;
}

const STATUS_RANK = { sent: 1, delivered: 2, read: 3 };

/** Report numbers: delivered / read from the webhook, replied = student wrote back within 3 days */
async function campaignStats(campaignId) {
  const id = new mongoose.Types.ObjectId(String(campaignId));
  const byStatus = await CampaignRecipient.aggregate([{ $match: { campaign: id } }, { $group: { _id: '$status', n: { $sum: 1 } } }]);
  const count = (s) => byStatus.find((b) => b._id === s)?.n || 0;

  const sentRows = await CampaignRecipient.find({ campaign: id, status: 'sent' }).select('waMessageId phone sentAt').lean();
  const ids = sentRows.map((r) => r.waMessageId).filter(Boolean);
  const statuses = ids.length
    ? await WhatsappEvent.find({ kind: 'status', waMessageId: { $in: ids } }).select('waMessageId status').lean()
    : [];
  const best = {};
  const failedOnDelivery = new Set();
  for (const s of statuses) {
    if (s.status === 'failed') failedOnDelivery.add(s.waMessageId);
    if ((STATUS_RANK[s.status] || 0) > (STATUS_RANK[best[s.waMessageId]] || 0)) best[s.waMessageId] = s.status;
  }
  const delivered = Object.values(best).filter((s) => s === 'delivered' || s === 'read').length;
  const read = Object.values(best).filter((s) => s === 'read').length;

  let replied = 0;
  if (sentRows.length) {
    const firstSent = sentRows.reduce((m, r) => (r.sentAt && r.sentAt < m ? r.sentAt : m), new Date());
    const replies = await WhatsappEvent.find({
      kind: 'message', direction: 'in', phone: { $in: sentRows.map((r) => r.phone) }, at: { $gte: firstSent },
    }).select('phone at').lean();
    const sentAt = Object.fromEntries(sentRows.map((r) => [r.phone, r.sentAt]));
    const repliedPhones = new Set(replies.filter((m) => sentAt[m.phone] && m.at >= sentAt[m.phone] && m.at - sentAt[m.phone] < 3 * 86400000).map((m) => m.phone));
    replied = repliedPhones.size;
  }

  return {
    queued: count('queued') + count('sending'),
    sent: count('sent'),
    failed: count('failed') + failedOnDelivery.size,
    delivered,
    read,
    replied,
    perMessage: best,
    undelivered: failedOnDelivery,
  };
}

module.exports = { createCampaign, buildRecipients, startWorker, stopWorker, campaignStats, tick };
