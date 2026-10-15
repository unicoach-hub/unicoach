// WhatsApp Business (Meta Cloud API): "Connect with Facebook" (Embedded Signup) and the webhook.
//
// Connect flow: the admin clicks Connect in Settings → Facebook's popup → it hands the page a one-time
// code plus the WhatsApp Business Account id and phone number id. The page posts those here; we swap the
// code for an access token, subscribe our app to the account (so the webhook gets its events),
// register the number for the Cloud API, and save everything in Settings.
const crypto = require('crypto');
const Settings = require('../models/Settings');
const Lead = require('../models/Lead');
const WhatsappEvent = require('../models/WhatsappEvent');

const GRAPH = 'https://graph.facebook.com/v20.0';
const API_PUBLIC_URL = () => (process.env.API_PUBLIC_URL || 'https://api.unicoach.com').replace(/\/+$/, '');
const WEBHOOK_PATH = '/api/webhooks/whatsapp';

const graph = async (path, { method = 'GET', token, body } = {}) => {
  const res = await fetch(`${GRAPH}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.error_user_msg || data?.error?.message || `Meta API error ${res.status}`);
    err.code = data?.error?.code;
    throw err;
  }
  return data;
};

const getSettings = async () => (await Settings.findOne()) || new Settings();

const ensureVerifyToken = async (settings) => {
  if (!settings.wabaWebhookVerifyToken) {
    settings.wabaWebhookVerifyToken = crypto.randomBytes(18).toString('hex');
    await settings.save();
  }
  return settings.wabaWebhookVerifyToken;
};

/** GET /api/admin/whatsapp/status — what the Settings card shows */
exports.getStatus = async (req, res) => {
  try {
    const settings = await getSettings();
    const verifyToken = await ensureVerifyToken(settings);
    return res.json({
      connected: !!(settings.wabaAccessToken && settings.wabaPhoneNumberId),
      displayName: settings.wabaDisplayName || '',
      phoneNumber: settings.wabaSenderNumber || '',
      phoneNumberId: settings.wabaPhoneNumberId || '',
      wabaId: settings.wabaAccountId || '',
      connectedAt: settings.wabaConnectedAt || null,
      // Needed by the Connect button
      appId: settings.metaAppId || '',
      configId: settings.wabaConfigId || '',
      hasAppSecret: !!settings.metaAppSecret,
      // To paste into the Meta app's WhatsApp → Configuration page
      webhookUrl: `${API_PUBLIC_URL()}${WEBHOOK_PATH}`,
      verifyToken,
    });
  } catch (err) {
    console.error('[WhatsApp] status failed:', err);
    return res.status(500).json({ message: 'Could not load WhatsApp status' });
  }
};

/** POST /api/admin/whatsapp/embedded-signup  { code, wabaId, phoneNumberId } */
exports.completeSignup = async (req, res) => {
  const { code, wabaId, phoneNumberId } = req.body || {};
  if (!code || !wabaId || !phoneNumberId) {
    return res.status(400).json({ message: 'Facebook did not return the account details. Please try Connect again and finish every step.' });
  }
  try {
    const settings = await getSettings();
    if (!settings.metaAppId || !settings.metaAppSecret) {
      return res.status(400).json({ message: 'Add the Meta App ID and App Secret in Settings first.' });
    }

    // 1. One-time code → access token for this business
    const tokenData = await graph(`/oauth/access_token?client_id=${encodeURIComponent(settings.metaAppId)}&client_secret=${encodeURIComponent(settings.metaAppSecret)}&code=${encodeURIComponent(code)}`);
    const token = tokenData.access_token;
    if (!token) throw new Error('Meta did not return an access token');

    // 2. Send this account's events (replies, delivery status) to our webhook
    await graph(`/${wabaId}/subscribed_apps`, { method: 'POST', token });

    // 3. Register the number for the Cloud API (already-registered numbers just return an error we can ignore)
    const notes = [];
    try {
      await graph(`/${phoneNumberId}/register`, {
        method: 'POST',
        token,
        body: { messaging_product: 'whatsapp', pin: String(crypto.randomInt(100000, 999999)) },
      });
    } catch (e) {
      notes.push(`Number registration: ${e.message}`);
    }

    // 4. Number and business name to show in Settings
    let phone = {};
    try {
      phone = await graph(`/${phoneNumberId}?fields=display_phone_number,verified_name`, { token });
    } catch (e) {
      notes.push(`Could not read number details: ${e.message}`);
    }

    settings.wabaAccessToken = token;
    settings.wabaAccountId = String(wabaId);
    settings.wabaPhoneNumberId = String(phoneNumberId);
    settings.wabaSenderNumber = phone.display_phone_number || settings.wabaSenderNumber || '';
    settings.wabaDisplayName = phone.verified_name || '';
    settings.wabaConnectedAt = new Date();
    await settings.save();

    return res.json({
      success: true,
      displayName: settings.wabaDisplayName,
      phoneNumber: settings.wabaSenderNumber,
      notes,
    });
  } catch (err) {
    console.error('[WhatsApp] embedded signup failed:', err.message);
    return res.status(502).json({ message: `Could not connect WhatsApp: ${err.message}` });
  }
};

/** POST /api/admin/whatsapp/disconnect — forget the connection (the number stays on the Meta account) */
exports.disconnect = async (req, res) => {
  try {
    const settings = await getSettings();
    settings.wabaAccessToken = '';
    settings.wabaPhoneNumberId = '';
    settings.wabaAccountId = '';
    settings.wabaSenderNumber = '';
    settings.wabaDisplayName = '';
    settings.wabaConnectedAt = undefined;
    await settings.save();
    return res.json({ success: true });
  } catch (err) {
    console.error('[WhatsApp] disconnect failed:', err);
    return res.status(500).json({ message: 'Could not disconnect' });
  }
};

/** GET /api/admin/whatsapp/events?kind=message — latest replies / statuses for the admin */
exports.listEvents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.kind === 'message' || req.query.kind === 'status') filter.kind = req.query.kind;
    const events = await WhatsappEvent.find(filter).sort({ at: -1 }).limit(200).lean();
    return res.json(events);
  } catch (err) {
    console.error('[WhatsApp] events failed:', err);
    return res.status(500).json({ message: 'Could not load WhatsApp activity' });
  }
};

// ─── Webhook (public; Meta calls it) ───

/** GET /api/webhooks/whatsapp — Meta checks the URL once when you save it */
exports.verifyWebhook = async (req, res) => {
  const settings = await Settings.findOne();
  const expected = settings?.wabaWebhookVerifyToken;
  if (req.query['hub.mode'] === 'subscribe' && expected && req.query['hub.verify_token'] === expected) {
    return res.status(200).send(String(req.query['hub.challenge'] || ''));
  }
  return res.sendStatus(403);
};

const STOP_WORDS = /^\s*(stop|unsubscribe|band karo|bandh karo)\s*$/i;
const last10 = (digits) => String(digits || '').replace(/\D/g, '').slice(-10);

const findLeadByPhone = async (phone) => {
  const tail = last10(phone);
  if (tail.length < 10) return null;
  return Lead.findOne({ phone: { $regex: `${tail}$` } }).select('_id name whatsappOptOut activities').sort({ updatedAt: -1 });
};

const messageText = (m) => {
  if (m.type === 'text') return m.text?.body || '';
  if (m.type === 'button') return m.button?.text || '';
  if (m.type === 'interactive') return m.interactive?.button_reply?.title || m.interactive?.list_reply?.title || '[interactive reply]';
  return `[${m.type}]`;
};

/** POST /api/webhooks/whatsapp — replies and delivery status */
exports.receiveWebhook = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    // Only accept calls signed with our Meta App Secret
    const signature = req.get('x-hub-signature-256') || '';
    if (!settings?.metaAppSecret || !req.rawBody) return res.sendStatus(401);
    const expected = `sha256=${crypto.createHmac('sha256', settings.metaAppSecret).update(req.rawBody).digest('hex')}`;
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.sendStatus(401);

    // Answer straight away; Meta retries if we are slow
    res.sendStatus(200);

    for (const entry of req.body?.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};

        // Meta finished reviewing a template (approved / rejected / paused …)
        if (change.field === 'message_template_status_update') {
          const Template = require('../models/Template');
          const known = ['APPROVED', 'PENDING', 'REJECTED', 'PAUSED', 'DISABLED', 'IN_APPEAL', 'PENDING_DELETION'];
          const status = known.includes(value.event) ? value.event : null;
          if (status) {
            const query = value.message_template_id
              ? { $or: [{ metaTemplateId: String(value.message_template_id) }, { wabaTemplateName: value.message_template_name }] }
              : { wabaTemplateName: value.message_template_name };
            await Template.updateMany(query, {
              $set: { metaStatus: status, rejectionReason: status === 'REJECTED' ? (value.reason || value.other_info?.description || '') : '' },
            });
          }
          continue;
        }
        const contacts = value.contacts || [];

        for (const m of value.messages || []) {
          const text = messageText(m);
          const lead = await findLeadByPhone(m.from);
          await WhatsappEvent.create({
            kind: 'message',
            waMessageId: m.id,
            phone: m.from,
            name: contacts.find((c) => c.wa_id === m.from)?.profile?.name || '',
            text,
            lead: lead?._id,
            at: m.timestamp ? new Date(Number(m.timestamp) * 1000) : new Date(),
          });
          if (lead) {
            lead.activities.push({ type: 'whatsapp', comment: `WhatsApp reply: ${text}`.slice(0, 1000), performedBy: 'Student' });
            if (STOP_WORDS.test(text)) lead.whatsappOptOut = true;
            await lead.save();
          }
          // Chatbot: button presses, keywords, default reply. Never for someone who just said STOP.
          if (!STOP_WORDS.test(text)) {
            const replyId = m.interactive?.button_reply?.id || m.interactive?.list_reply?.id || m.button?.payload || '';
            require('../services/chatbotEngine')
              .handleInbound({ phone: m.from, name: contacts.find((c) => c.wa_id === m.from)?.profile?.name || '', text: m.type === 'text' || m.type === 'button' ? text : '', replyId, lead: lead ? { _id: lead._id } : null })
              .catch((e) => console.error('[Chatbot] failed:', e.message));
          }
        }

        for (const s of value.statuses || []) {
          await WhatsappEvent.create({
            kind: 'status',
            waMessageId: s.id,
            phone: s.recipient_id,
            status: s.status,
            error: s.errors?.[0]?.title || s.errors?.[0]?.message || '',
            at: s.timestamp ? new Date(Number(s.timestamp) * 1000) : new Date(),
          });
        }
      }
    }
  } catch (err) {
    console.error('[WhatsApp] webhook failed:', err);
    if (!res.headersSent) res.sendStatus(200);
  }
};
