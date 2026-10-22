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

/**
 * POST /api/admin/whatsapp/manual-connect  { wabaId, phoneNumberId, token }
 * For a number added by hand in the Meta app (WhatsApp → Production setup) with a permanent
 * System User token from Business Settings. Checks the details with Meta, subscribes our app
 * to the account so the webhook gets events, then saves them.
 */
exports.manualConnect = async (req, res) => {
  const wabaId = String(req.body?.wabaId || '').trim();
  const phoneNumberId = String(req.body?.phoneNumberId || '').trim();
  const token = String(req.body?.token || '').trim();
  if (!/^\d{6,}$/.test(wabaId) || !/^\d{6,}$/.test(phoneNumberId) || token.length < 20) {
    return res.status(400).json({ message: 'Enter the WhatsApp Business Account ID, Phone number ID (both numbers) and the access token.' });
  }
  try {
    // 1. The token can see this number (also gives us the name and number to show)
    const phone = await graph(`/${phoneNumberId}?fields=display_phone_number,verified_name`, { token });
    // 2. Send this account's events (replies, delivery status, template status) to our webhook
    const notes = [];
    try {
      await graph(`/${wabaId}/subscribed_apps`, { method: 'POST', token });
    } catch (e) {
      notes.push(`Webhook subscription: ${e.message}`);
    }

    const settings = await getSettings();
    settings.wabaAccessToken = token;
    settings.wabaAccountId = wabaId;
    settings.wabaPhoneNumberId = phoneNumberId;
    settings.wabaSenderNumber = phone.display_phone_number || '';
    settings.wabaDisplayName = phone.verified_name || '';
    settings.wabaConnectedAt = new Date();
    await settings.save();

    return res.json({ success: true, displayName: settings.wabaDisplayName, phoneNumber: settings.wabaSenderNumber, notes });
  } catch (err) {
    console.error('[WhatsApp] manual connect failed:', err.message);
    return res.status(502).json({ message: `Meta did not accept these details: ${err.message}` });
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
  // Read the raw query string: mongoSanitize strips keys that contain a dot (hub.mode, hub.verify_token…)
  const q = new URLSearchParams((req.originalUrl.split('?')[1]) || '');
  if (q.get('hub.mode') === 'subscribe' && expected && q.get('hub.verify_token') === expected) {
    return res.status(200).send(String(q.get('hub.challenge') || ''));
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
    // Say why a webhook was refused (never the secret itself), so a wrong setup shows up in the logs
    if (!settings?.metaAppSecret) {
      console.warn('[WhatsApp webhook] 401: Meta App Secret is not saved in admin (Settings → Meta WABA)');
      return res.sendStatus(401);
    }
    if (!req.rawBody) {
      console.warn('[WhatsApp webhook] 401: request body was not captured');
      return res.sendStatus(401);
    }
    const expected = `sha256=${crypto.createHmac('sha256', settings.metaAppSecret).update(req.rawBody).digest('hex')}`;
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      console.warn(`[WhatsApp webhook] 401: signature mismatch (${signature ? 'signed' : 'no signature header'}). The App Secret in admin must belong to the same Meta app as the webhook.`);
      return res.sendStatus(401);
    }

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

/**
 * GET /api/admin/whatsapp/overview
 * Live account health from Meta (quality, tier, limits, name status) plus our own last-30-day traffic:
 * messages sent / delivered / read / failed per day (from webhook delivery receipts, the inbox and campaigns).
 */
exports.overview = async (req, res) => {
  try {
    const settings = await getSettings();
    const connected = !!(settings.wabaAccessToken && settings.wabaPhoneNumberId);
    const out = { connected, account: null, metaError: '', traffic: null };

    if (connected) {
      const token = settings.wabaAccessToken;
      try {
        const phone = await graph(`/${settings.wabaPhoneNumberId}?fields=display_phone_number,verified_name,quality_rating,messaging_limit_tier,name_status,status,code_verification_status,platform_type,throughput,is_official_business_account`, { token });
        let waba = {};
        if (settings.wabaAccountId) {
          waba = await graph(`/${settings.wabaAccountId}?fields=name,currency,account_review_status,business_verification_status,timezone_id`, { token }).catch(() => ({}));
        }
        // Meta tiers: TIER_250, TIER_1K, TIER_10K, TIER_100K, TIER_UNLIMITED
        const tier = String(phone.messaging_limit_tier || '');
        const tierLimit = { TIER_50: 50, TIER_250: 250, TIER_1K: 1000, TIER_2K: 2000, TIER_10K: 10000, TIER_100K: 100000 }[tier] ?? (tier === 'TIER_UNLIMITED' ? null : null);
        out.account = {
          phoneNumber: phone.display_phone_number || settings.wabaSenderNumber,
          displayName: phone.verified_name || settings.wabaDisplayName,
          phoneNumberId: settings.wabaPhoneNumberId,
          wabaId: settings.wabaAccountId,
          status: phone.status || '',
          quality: phone.quality_rating || '',
          tier,
          tierLimit,
          nameStatus: phone.name_status || '',
          verification: phone.code_verification_status || '',
          platform: phone.platform_type || '',
          throughput: phone.throughput?.level || '',
          officialBadge: !!phone.is_official_business_account,
          wabaName: waba.name || '',
          currency: waba.currency || '',
          reviewStatus: waba.account_review_status || '',
          businessVerification: waba.business_verification_status || '',
          connectedAt: settings.wabaConnectedAt || null,
        };
      } catch (e) {
        out.metaError = e.message;
      }
    }

    // Our traffic, last 30 days (IST days)
    const since = new Date(Date.now() - 30 * 86400000);
    const tz = 'Asia/Kolkata';
    const day = { $dateToString: { format: '%Y-%m-%d', date: '$at', timezone: tz } };
    const [statusRows, outRows, inRows] = await Promise.all([
      WhatsappEvent.aggregate([
        { $match: { kind: 'status', at: { $gte: since }, waMessageId: { $exists: true, $ne: null } } },
        { $group: { _id: '$waMessageId', statuses: { $addToSet: '$status' }, first: { $min: '$at' } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$first', timezone: tz } },
          sent: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $or: [{ $in: ['delivered', '$statuses'] }, { $in: ['read', '$statuses'] }] }, 1, 0] } },
          read: { $sum: { $cond: [{ $in: ['read', '$statuses'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $in: ['failed', '$statuses'] }, 1, 0] } },
        } },
      ]),
      WhatsappEvent.aggregate([
        { $match: { kind: 'message', direction: 'out', at: { $gte: since } } },
        { $group: { _id: day, n: { $sum: 1 } } },
      ]),
      WhatsappEvent.aggregate([
        { $match: { kind: 'message', direction: 'in', at: { $gte: since } } },
        { $group: { _id: day, n: { $sum: 1 } } },
      ]),
    ]);
    const byDay = {};
    const fmtDay = (d) => d.toLocaleDateString('en-CA', { timeZone: tz });
    for (let i = 29; i >= 0; i -= 1) {
      const k = fmtDay(new Date(Date.now() - i * 86400000));
      byDay[k] = { date: k, sent: 0, delivered: 0, read: 0, failed: 0, replies: 0 };
    }
    for (const r of statusRows) if (byDay[r._id]) Object.assign(byDay[r._id], { sent: r.sent, delivered: r.delivered, read: r.read, failed: r.failed });
    // Messages we sent that have no receipt yet still count as sent
    for (const r of outRows) if (byDay[r._id]) byDay[r._id].sent = Math.max(byDay[r._id].sent, r.n);
    for (const r of inRows) if (byDay[r._id]) byDay[r._id].replies = r.n;
    const days = Object.values(byDay);
    const sum = (k) => days.reduce((n, d) => n + d[k], 0);
    const todayKey = fmtDay(new Date());
    out.traffic = {
      days,
      totals: { sent: sum('sent'), delivered: sum('delivered'), read: sum('read'), failed: sum('failed'), replies: sum('replies') },
      sentToday: byDay[todayKey]?.sent || 0,
    };
    return res.json(out);
  } catch (err) {
    console.error('[WhatsApp] overview failed:', err);
    return res.status(500).json({ message: 'Could not load WhatsApp overview' });
  }
};
