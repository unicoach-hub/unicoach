// WhatsApp Inbox for the admin: one conversation per student number, reply from the browser.
// WhatsApp rule: free text only within 24 hours of the student's last message; after that only an
// approved template can start the conversation again.
const Settings = require('../models/Settings');
const Lead = require('../models/Lead');
const WhatsappEvent = require('../models/WhatsappEvent');

const GRAPH = 'https://graph.facebook.com/v20.0';
const WINDOW_MS = 24 * 60 * 60 * 1000;
const STATUS_RANK = { failed: 0, sent: 1, delivered: 2, read: 3 };

const digits = (v) => String(v || '').replace(/\D/g, '');
const normalisePhone = (v) => {
  const d = digits(v);
  return d.length === 10 ? `91${d}` : d;
};

const getConnection = async () => {
  const s = await Settings.findOne();
  if (!s?.wabaAccessToken || !s?.wabaPhoneNumberId) return null;
  return s;
};

const adminName = (req) => req.user?.name || req.staff?.name || (req.user?.role === 'admin' ? 'Admin' : 'Staff');

/** Send one message through the Cloud API and record it; returns the saved event */
const sendAndRecord = async ({ settings, phone, payload, text, template, sentBy, lead }) => {
  const res = await fetch(`${GRAPH}/${settings.wabaPhoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${settings.wabaAccessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: phone, ...payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.error_data?.details || data?.error?.message || `Meta API error ${res.status}`);
    err.code = data?.error?.code;
    throw err;
  }
  return WhatsappEvent.create({
    kind: 'message',
    direction: 'out',
    waMessageId: data.messages?.[0]?.id,
    phone,
    text,
    template,
    sentBy,
    lead: lead?._id,
    readByAdmin: true,
    at: new Date(),
  });
};
exports.sendAndRecord = sendAndRecord;

const findLead = async (phone) => {
  const tail = digits(phone).slice(-10);
  if (tail.length < 10) return null;
  return Lead.findOne({ phone: { $regex: `${tail}$` } }).select('_id name email phone dreamCountry preferredIntake status whatsappOptOut').sort({ updatedAt: -1 }).lean();
};

/** GET /api/admin/whatsapp/conversations?search= */
exports.listConversations = async (req, res) => {
  try {
    const rows = await WhatsappEvent.aggregate([
      { $match: { kind: 'message' } },
      { $sort: { at: -1 } },
      {
        $group: {
          _id: '$phone',
          lastText: { $first: '$text' },
          lastTemplate: { $first: '$template' },
          lastDirection: { $first: '$direction' },
          lastAt: { $first: '$at' },
          name: { $max: '$name' },
          lead: { $max: '$lead' },
          unread: { $sum: { $cond: [{ $and: [{ $eq: ['$direction', 'in'] }, { $ne: ['$readByAdmin', true] }] }, 1, 0] } },
          lastInAt: { $max: { $cond: [{ $eq: ['$direction', 'in'] }, '$at', null] } },
        },
      },
      { $sort: { lastAt: -1 } },
      { $limit: 300 },
    ]);
    const flagged = await require('../models/WhatsappContact').find({ phone: { $in: rows.map((r) => r._id) } }).select('phone needsAgent botPausedUntil clearedAt').lean();
    const contactOf = Object.fromEntries(flagged.map((c) => [c.phone, c]));
    // A cleared chat leaves the list until a new message arrives after the clear
    const cleared = rows.filter((r) => contactOf[r._id]?.clearedAt && new Date(r.lastAt) <= new Date(contactOf[r._id].clearedAt));
    if (cleared.length) {
      const keep = new Set(cleared.map((r) => r._id));
      for (let i = rows.length - 1; i >= 0; i -= 1) if (keep.has(rows[i]._id)) rows.splice(i, 1);
    }
    // Unread counts only messages after the clear
    for (const r of rows) {
      const since = contactOf[r._id]?.clearedAt;
      if (since && r.unread) {
        r.unread = await WhatsappEvent.countDocuments({ kind: 'message', phone: r._id, direction: 'in', readByAdmin: { $ne: true }, at: { $gt: since } });
      }
    }
    const leadIds = rows.map((r) => r.lead).filter(Boolean);
    const leads = await Lead.find({ _id: { $in: leadIds } }).select('name').lean();
    const leadName = Object.fromEntries(leads.map((l) => [String(l._id), l.name]));
    const search = String(req.query.search || '').trim().toLowerCase();
    const out = rows
      .map((r) => ({
        phone: r._id,
        name: (r.lead && leadName[String(r.lead)]) || r.name || '',
        leadId: r.lead || null,
        lastText: r.lastTemplate ? `Template: ${r.lastTemplate}` : r.lastText || '',
        lastDirection: r.lastDirection,
        lastAt: r.lastAt,
        unread: r.unread,
        windowOpen: !!r.lastInAt && Date.now() - new Date(r.lastInAt).getTime() < WINDOW_MS,
        needsAgent: !!contactOf[r._id]?.needsAgent,
        botPaused: !!(contactOf[r._id]?.botPausedUntil && new Date(contactOf[r._id].botPausedUntil) > new Date()),
      }))
      .filter((c) => !search || c.phone.includes(digits(search) || '\u0000') || c.name.toLowerCase().includes(search));
    return res.json(out);
  } catch (err) {
    console.error('[WhatsApp inbox] list failed:', err);
    return res.status(500).json({ message: 'Could not load conversations' });
  }
};

/** GET /api/admin/whatsapp/conversations/:phone — messages with delivery ticks; marks replies read */
exports.getConversation = async (req, res) => {
  try {
    const phone = normalisePhone(req.params.phone);
    const clearedAt = (await require('../models/WhatsappContact').findOne({ phone }).select('clearedAt').lean())?.clearedAt;
    const messages = await WhatsappEvent.find({ kind: 'message', phone, ...(clearedAt ? { at: { $gt: clearedAt } } : {}) }).sort({ at: 1 }).limit(500).lean();
    const outIds = messages.filter((m) => m.direction === 'out' && m.waMessageId).map((m) => m.waMessageId);
    const statuses = await WhatsappEvent.find({ kind: 'status', waMessageId: { $in: outIds } }).select('waMessageId status error').lean();
    const best = {};
    for (const s of statuses) {
      const cur = best[s.waMessageId];
      if (!cur || (STATUS_RANK[s.status] ?? -1) > (STATUS_RANK[cur.status] ?? -1) || s.status === 'failed') best[s.waMessageId] = s;
    }
    await WhatsappEvent.updateMany({ kind: 'message', phone, direction: 'in', readByAdmin: { $ne: true } }, { $set: { readByAdmin: true } });
    // The 24h reply window is Meta's, so use the latest reply even if the chat was cleared
    const lastIn = await WhatsappEvent.findOne({ kind: 'message', phone, direction: 'in' }).sort({ at: -1 }).lean();
    const lead = await findLead(phone);
    const contact = await require('../models/WhatsappContact').findOne({ phone }).lean();
    return res.json({
      phone,
      lead,
      needsAgent: !!contact?.needsAgent,
      botPausedUntil: contact?.botPausedUntil && new Date(contact.botPausedUntil) > new Date() ? contact.botPausedUntil : null,
      name: lead?.name || lastIn?.name || '',
      windowOpen: !!lastIn && Date.now() - new Date(lastIn.at).getTime() < WINDOW_MS,
      windowEndsAt: lastIn ? new Date(new Date(lastIn.at).getTime() + WINDOW_MS) : null,
      messages: messages.map((m) => ({
        id: m._id,
        direction: m.direction,
        text: m.text,
        template: m.template,
        sentBy: m.sentBy,
        at: m.at,
        status: m.direction === 'out' ? (best[m.waMessageId]?.status || 'sent') : undefined,
        error: m.direction === 'out' ? best[m.waMessageId]?.error || '' : undefined,
      })),
    });
  } catch (err) {
    console.error('[WhatsApp inbox] conversation failed:', err);
    return res.status(500).json({ message: 'Could not load the conversation' });
  }
};

/** POST /api/admin/whatsapp/conversations/:phone/send  { text } or { template: { name, language, params[] } } */
exports.sendMessage = async (req, res) => {
  try {
    const settings = await getConnection();
    if (!settings) return res.status(400).json({ message: 'WhatsApp is not connected. Connect it in Settings → WhatsApp Business.' });
    const phone = normalisePhone(req.params.phone);
    if (phone.length < 11) return res.status(400).json({ message: 'Enter the number with country code' });
    const lead = await findLead(phone);
    if (lead?.whatsappOptOut) return res.status(400).json({ message: 'This student replied STOP. WhatsApp messages to them are off.' });

    const { text, template } = req.body || {};
    let event;
    if (template?.name) {
      const params = Array.isArray(template.params) ? template.params.map((p) => String(p ?? '')) : [];
      event = await sendAndRecord({
        settings,
        phone,
        lead,
        sentBy: adminName(req),
        template: template.name,
        text: template.preview || '',
        payload: {
          type: 'template',
          template: {
            name: template.name,
            language: { code: template.language || 'en' },
            components: require('../utils/waTemplate').sendComponents(
              (await require('../models/Template').findOne({ wabaTemplateName: template.name }).select('headerType headerMediaUrl').lean()) || {},
              params,
            ),
          },
        },
      });
    } else {
      const body = String(text || '').trim();
      if (!body) return res.status(400).json({ message: 'Type a message' });
      if (body.length > 4096) return res.status(400).json({ message: 'Message is too long (4096 characters max)' });
      const lastIn = await WhatsappEvent.findOne({ kind: 'message', phone, direction: 'in' }).sort({ at: -1 }).select('at').lean();
      if (!lastIn || Date.now() - new Date(lastIn.at).getTime() >= WINDOW_MS) {
        return res.status(400).json({ code: 'WINDOW_CLOSED', message: 'More than 24 hours since the student last wrote. Send an approved template instead.' });
      }
      event = await sendAndRecord({ settings, phone, lead, sentBy: adminName(req), text: body, payload: { type: 'text', text: { body, preview_url: true } } });
    }

    // A person replied: the bot stays quiet in this chat for a day
    await require('../models/WhatsappContact').updateOne(
      { phone },
      { $set: { needsAgent: false, botPausedUntil: new Date(Date.now() + WINDOW_MS), waitingNode: null } },
      { upsert: true },
    );

    if (lead) {
      await Lead.updateOne({ _id: lead._id }, {
        $push: { activities: { type: 'whatsapp', comment: `WhatsApp sent: ${event.template ? `template ${event.template}` : event.text}`.slice(0, 1000), performedBy: adminName(req), date: new Date() } },
      });
    }
    return res.json({ success: true, message: { id: event._id, direction: 'out', text: event.text, template: event.template, sentBy: event.sentBy, at: event.at, status: 'sent' } });
  } catch (err) {
    console.error('[WhatsApp inbox] send failed:', err.message);
    return res.status(502).json({ message: `Not sent: ${err.message}` });
  }
};

/** GET /api/admin/whatsapp/templates — approved templates from Meta, with their body text */
exports.listTemplates = async (req, res) => {
  try {
    const settings = await getConnection();
    if (!settings?.wabaAccountId) return res.json([]);
    const r = await fetch(`${GRAPH}/${settings.wabaAccountId}/message_templates?fields=name,language,status,category,components&limit=100`, {
      headers: { Authorization: `Bearer ${settings.wabaAccessToken}` },
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ message: data?.error?.message || 'Could not load templates from Meta' });
    const out = (data.data || [])
      .filter((t) => t.status === 'APPROVED')
      .map((t) => {
        const body = (t.components || []).find((c) => c.type === 'BODY')?.text || '';
        const count = new Set((body.match(/\{\{\d+\}\}/g) || [])).size;
        return { name: t.name, language: t.language, category: t.category, body, paramCount: count };
      });
    return res.json(out);
  } catch (err) {
    console.error('[WhatsApp inbox] templates failed:', err);
    return res.status(500).json({ message: 'Could not load templates' });
  }
};

/** POST /api/admin/whatsapp/conversations/:phone/bot  { paused: boolean } — hand the chat back to the bot or take it over */
exports.setBot = async (req, res) => {
  try {
    const phone = normalisePhone(req.params.phone);
    const paused = !!req.body?.paused;
    await require('../models/WhatsappContact').updateOne(
      { phone },
      { $set: { botPausedUntil: paused ? new Date(Date.now() + WINDOW_MS) : null, needsAgent: false, waitingNode: null } },
      { upsert: true },
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('[WhatsApp inbox] bot toggle failed:', err);
    return res.status(500).json({ message: 'Could not update' });
  }
};

/** POST /api/admin/whatsapp/conversations/:phone/clear — start a fresh chat with this number.
 *  Hides earlier messages from the inbox and resets the chatbot for them. Nothing is deleted,
 *  so dashboard numbers stay right; the student's own WhatsApp is not touched. */
exports.clearConversation = async (req, res) => {
  try {
    const phone = normalisePhone(req.params.phone);
    if (!phone) return res.status(400).json({ message: 'Invalid number' });
    await require('../models/WhatsappContact').updateOne(
      { phone },
      {
        $set: { clearedAt: new Date(), needsAgent: false, waitingNode: null, waitingAttempts: 0, attributes: {} },
        $unset: { flow: '', botPausedUntil: '', lastDefaultAt: '', needsAgentAt: '' },
      },
      { upsert: true },
    );
    await WhatsappEvent.updateMany({ kind: 'message', phone, direction: 'in', readByAdmin: { $ne: true } }, { $set: { readByAdmin: true } });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[WhatsApp inbox] clear failed:', err);
    return res.status(500).json({ message: 'Could not clear the chat' });
  }
};
