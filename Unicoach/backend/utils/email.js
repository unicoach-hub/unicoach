// backend/utils/email.js - Email delivery through Resend (verified domain). SMTP only as an explicit opt-in fallback.
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');
require('dotenv').config();

// Transporter Cache by connection key to reuse warm pooled TCP/TLS connections
const transporterCache = new Map();

// In-memory cache for DB Settings to eliminate remote database roundtrip on every email
let cachedDbSettings = null;
let lastDbSettingsFetch = 0;
const DB_SETTINGS_TTL = 30000; // 30 seconds

/**
 * Invalidate cached transporter and settings (call when settings are modified)
 */
function clearTransporterCache() {
  for (const [key, transporter] of transporterCache.entries()) {
    try {
      if (typeof transporter.close === 'function') transporter.close();
    } catch {
      // ignore
    }
  }
  transporterCache.clear();
  cachedDbSettings = null;
  lastDbSettingsFetch = 0;
}

/**
 * Helper to build or reuse a pooled Nodemailer transporter
 */
function getOrCreatePooledTransport({ host, port, user, pass }) {
  const cleanPass = (pass || '').replace(/\s+/g, '');
  const cacheKey = `${host}:${port}:${user}:${cleanPass}`;

  if (transporterCache.has(cacheKey)) {
    return transporterCache.get(cacheKey);
  }

  const isSecure = port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14,
    auth: {
      user,
      pass: cleanPass,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
  });

  transporterCache.set(cacheKey, transporter);
  return transporter;
}

/**
 * Dynamically resolves SMTP Transporter from DB Settings or process.env
 */
async function getTransporter(overrideConfig = null) {
  // 1. Explicit override config passed (e.g. counselor custom App Password)
  if (overrideConfig && overrideConfig.user && overrideConfig.pass) {
    const isGmail = overrideConfig.user.includes('@gmail.com');
    const isResend = overrideConfig.user === 'resend' || (overrideConfig.host && overrideConfig.host.includes('resend'));
    const host = overrideConfig.host || (isResend ? 'smtp.resend.com' : 'smtp.gmail.com');
    const port = parseInt(overrideConfig.port || (isResend ? 465 : (isGmail ? 465 : 587)), 10);
    return getOrCreatePooledTransport({ host, port, user: overrideConfig.user, pass: overrideConfig.pass });
  }

  // 2. Check MongoDB Settings if DB is connected (with in-memory cache)
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const now = Date.now();
      if (!cachedDbSettings || (now - lastDbSettingsFetch > DB_SETTINGS_TTL)) {
        cachedDbSettings = await Settings.findOne();
        lastDbSettingsFetch = now;
      }

      if (cachedDbSettings && cachedDbSettings.smtpUser && cachedDbSettings.smtpPass) {
        const isGmail = cachedDbSettings.smtpUser.includes('@gmail.com');
        const isResend = cachedDbSettings.smtpUser === 'resend' || (cachedDbSettings.smtpHost && cachedDbSettings.smtpHost.includes('resend'));
        const host = cachedDbSettings.smtpHost || (isResend ? 'smtp.resend.com' : 'smtp.gmail.com');
        const port = Number(cachedDbSettings.smtpPort) || (isResend ? 465 : (isGmail ? 465 : 587));
        return getOrCreatePooledTransport({ host, port, user: cachedDbSettings.smtpUser, pass: cachedDbSettings.smtpPass });
      }
    }
  } catch (err) {
    console.warn('[SMTP] Could not read SMTP from Settings DB:', err.message);
  }

  // 3. Fallback to process.env
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isGmail = process.env.SMTP_USER.includes('@gmail.com');
    const isResend = process.env.SMTP_USER === 'resend' || (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('resend'));
    const host = process.env.SMTP_HOST || (isResend ? 'smtp.resend.com' : 'smtp.gmail.com');
    const port = parseInt(process.env.SMTP_PORT || (isResend ? 465 : (isGmail ? 465 : 587)), 10);
    return getOrCreatePooledTransport({ host, port, user: process.env.SMTP_USER, pass: process.env.SMTP_PASS });
  }

  return null;
}

let ResendClient = null;
try {
  const { Resend } = require('resend');
  ResendClient = Resend;
} catch (e) {
  // resend module optional
}

/*
 * Delivery policy: every email goes through Resend from the verified domain (RESEND_FROM).
 * SMTP is NOT used unless EMAIL_SMTP_FALLBACK=true is set explicitly; a Resend failure is reported as an error
 * instead of silently switching to a Gmail account.
 */
const DEFAULT_RESEND_FROM = 'UniCoach <bookings@booking.unicoach.com>';
// Addresses the admin UI uses as placeholders; they have no mailbox, so never use them for replies
const PLACEHOLDER_ADDRESSES = new Set(['support@unicoach.in', 'noreply@unicoach.in']);

const smtpFallbackEnabled = () => process.env.EMAIL_SMTP_FALLBACK === 'true';

const extractAddress = (value) => {
  if (!value) return '';
  const str = String(value);
  const match = str.match(/<([^>]+)>/);
  return (match ? match[1] : str).trim().replace(/^"|"$/g, '');
};

const extractDisplayName = (value) => {
  if (!value) return '';
  const str = String(value);
  if (!str.includes('<')) return '';
  return str.split('<')[0].trim().replace(/^"|"$/g, '').trim();
};

const sanitizeDisplayName = (name) => name.replace(/["<>\r\n]/g, '').slice(0, 80);

async function loadDbSettings() {
  if (cachedDbSettings && Date.now() - lastDbSettingsFetch < DB_SETTINGS_TTL) return cachedDbSettings;
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      cachedDbSettings = await Settings.findOne();
      lastDbSettingsFetch = Date.now();
    }
  } catch (_) {}
  return cachedDbSettings;
}

/** Resend client + verified sender, or null when Resend isn't set up */
async function getResendSetup() {
  const settings = await loadDbSettings();
  const key = process.env.RESEND_API_KEY || settings?.resendApiKey;
  const from = process.env.RESEND_FROM || settings?.resendFrom || DEFAULT_RESEND_FROM;
  // Resend rejects senders on a domain it hasn't verified; its shared resend.dev sender always works
  const verified = from.includes('resend.dev') || process.env.RESEND_DOMAIN_VERIFIED === 'true';
  if (!ResendClient || !key || !verified) return null;
  return { client: new ResendClient(key), from };
}

/**
 * The sender is always the verified address. A caller's `from` only contributes its display name
 * (e.g. "Pooja via UniCoach") and becomes the reply-to, so the student's answer reaches that person.
 */
function buildResendIdentity(baseFrom, customFrom, customReplyTo) {
  const address = extractAddress(baseFrom);
  const customName = extractDisplayName(customFrom);
  const baseName = extractDisplayName(baseFrom) || 'UniCoach';
  const displayName = sanitizeDisplayName(customName ? `${customName} via UniCoach` : baseName);

  const customAddress = extractAddress(customFrom);
  const candidates = [
    customReplyTo,
    customAddress && customAddress !== address ? customAddress : '',
    process.env.EMAIL_REPLY_TO,
    process.env.SMTP_USER,
  ];
  const replyTo = candidates.map(extractAddress).find((a) => a && a.includes('@') && !PLACEHOLDER_ADDRESSES.has(a.toLowerCase()));

  return { from: `${displayName} <${address}>`, replyTo };
}

/** Nodemailer-style attachments ({ filename, content, encoding: 'base64', path, contentType }) → Resend */
function toResendAttachments(attachments) {
  if (!Array.isArray(attachments) || attachments.length === 0) return undefined;
  const fs = require('fs');
  return attachments
    .map((att) => {
      if (!att) return null;
      const out = { filename: att.filename || 'attachment' };
      if (att.contentType) out.contentType = att.contentType;
      if (att.content !== undefined && att.content !== null) {
        out.content = Buffer.isBuffer(att.content)
          ? att.content
          : Buffer.from(String(att.content), att.encoding === 'base64' ? 'base64' : 'utf8');
      } else if (typeof att.path === 'string' && /^https?:\/\//i.test(att.path)) {
        out.path = att.path;
      } else if (typeof att.path === 'string' && att.path.startsWith('data:')) {
        out.content = Buffer.from(att.path.split(',')[1] || '', 'base64');
      } else if (typeof att.path === 'string' && fs.existsSync(att.path)) {
        out.content = fs.readFileSync(att.path);
      } else {
        return null;
      }
      return out;
    })
    .filter(Boolean);
}

const htmlToText = (html) => (html ? html.replace(/<[^>]*>/g, '') : '');

/**
 * Sends one email through Resend (see delivery policy above).
 * `smtpConfig` is only honoured when EMAIL_SMTP_FALLBACK=true; otherwise Resend sends it from the verified domain.
 */
async function sendEmail({ to, cc, bcc, subject, html, text, from: customFrom, replyTo: customReplyTo, attachments = [], smtpConfig = null }) {
  const resendSetup = await getResendSetup();

  if (resendSetup) {
    const identity = buildResendIdentity(resendSetup.from, customFrom, customReplyTo);
    const payload = {
      from: identity.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || htmlToText(html),
    };
    if (cc) payload.cc = Array.isArray(cc) ? cc : [cc];
    if (bcc) payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
    if (identity.replyTo) payload.replyTo = identity.replyTo;
    const resendAttachments = toResendAttachments(attachments);
    if (resendAttachments && resendAttachments.length) payload.attachments = resendAttachments;

    const t0 = Date.now();
    let failure;
    try {
      const { data, error } = await resendSetup.client.emails.send(payload);
      if (data && data.id) {
        console.log(`✅ [Resend] Email sent in ${Date.now() - t0}ms: <${data.id}> to ${to}`);
        return { messageId: data.id, service: 'resend', accepted: payload.to };
      }
      failure = error?.message || 'Unknown Resend error';
    } catch (resendErr) {
      failure = resendErr.message;
    }

    console.error(`❌ [Resend] Could not send "${subject}" to ${to}: ${failure}`);
    if (!smtpFallbackEnabled()) {
      throw new Error(`Resend: ${failure}`);
    }
    console.warn('⚠️ [Email] EMAIL_SMTP_FALLBACK=true, retrying through SMTP');
  } else if (!smtpFallbackEnabled()) {
    // Resend is not configured. Production must not silently drop mail.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email is not configured: set RESEND_API_KEY, RESEND_FROM and RESEND_DOMAIN_VERIFIED=true');
    }
    console.log('\n\x1b[33m=== [EMAIL SIMULATOR] Resend not configured, email not sent ===\x1b[0m');
    console.log(`\x1b[36mTo:\x1b[0m ${to}${cc ? ` (cc ${cc})` : ''}`);
    console.log(`\x1b[36mSubject:\x1b[0m ${subject}`);
    console.log('\x1b[33m=== [EMAIL SIMULATOR END] ===\n\x1b[0m');
    return { messageId: 'simulated-id-' + Date.now(), simulated: true };
  }

  // 2. SMTP (only reached when EMAIL_SMTP_FALLBACK=true)
  const isResend = (process.env.SMTP_USER === 'resend') || (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('resend'));
  
  let senderAddress = customFrom || process.env.SMTP_FROM;
  if (isResend && process.env.SMTP_FROM && (!customFrom || customFrom.includes('support@unicoach.in') || customFrom.includes('@gmail.com'))) {
    senderAddress = process.env.SMTP_FROM;
  }
  
  const transporter = await getTransporter(smtpConfig);

  if (!transporter) {

    // Simulator Mode
    const fallbackFrom = senderAddress || `"UniCoach Advisory" <support@unicoach.in>`;
    console.log('\n\x1b[33m=== [EMAIL SIMULATOR (No SMTP Configured)] ===\x1b[0m');
    console.log(`\x1b[36mFrom:\x1b[0m ${fallbackFrom}`);
    console.log(`\x1b[36mTo:\x1b[0m ${to}`);
    if (cc) console.log(`\x1b[36mCc:\x1b[0m ${cc}`);
    console.log(`\x1b[36mSubject:\x1b[0m ${subject}`);
    console.log(`\x1b[36mBody (HTML):\x1b[0m\n${html}`);
    if (attachments && attachments.length > 0) {
      console.log(`\x1b[36mAttachments:\x1b[0m ${attachments.length} attached`);
    }
    console.log('\x1b[33m=== [EMAIL SIMULATOR END] ===\n\x1b[0m');
    return { messageId: 'simulated-id-' + Date.now(), simulated: true };
  }

  try {
    const authUser = transporter.options?.auth?.user || process.env.SMTP_USER;
    const isGmailTransporter = authUser && authUser.includes('@gmail.com');

    let resolvedFrom = senderAddress;
    let resolvedReplyTo = customReplyTo;

    if (isGmailTransporter) {
      let displayName = 'UniCoach Advisory';
      if (customFrom) {
        if (customFrom.includes('"')) {
          const match = customFrom.match(/"([^"]+)"/);
          if (match) displayName = match[1];
        } else if (customFrom.includes('<')) {
          displayName = customFrom.split('<')[0].trim();
        }
      }
      resolvedFrom = `"${displayName}" <${authUser}>`;
      if (!resolvedReplyTo && customFrom && !customFrom.includes(authUser)) {
        resolvedReplyTo = customFrom;
      }
    } else if (!resolvedFrom && authUser) {
      resolvedFrom = `"UniCoach Advisory" <${authUser}>`;
    }

    const mailOptions = {
      from: resolvedFrom,
      to,
      subject,
      text: text || (html ? html.replace(/<[^>]*>/g, '') : ''),
      html,
    };

    if (resolvedReplyTo) mailOptions.replyTo = resolvedReplyTo;
    if (cc) mailOptions.cc = cc;
    if (bcc) mailOptions.bcc = bcc;

    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    const t0 = Date.now();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [SMTP] Live email dispatched in ${Date.now() - t0}ms: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    console.error('❌ [SMTP] Error sending live email:', error.message);
    throw error;
  }
}

/**
 * Sends many independent emails through Resend's batch API (max 100 per request), so bulk campaigns
 * don't hit the per-second rate limit. Returns one result per message, in order: { ok, id?, error? }.
 * Batch sends don't support attachments.
 */
async function sendEmailBatch(messages, { from: customFrom, replyTo: customReplyTo } = {}) {
  const resendSetup = await getResendSetup();
  if (!resendSetup) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email is not configured: set RESEND_API_KEY, RESEND_FROM and RESEND_DOMAIN_VERIFIED=true');
    }
    console.log(`[EMAIL SIMULATOR] Resend not configured, ${messages.length} batch emails not sent`);
    return messages.map(() => ({ ok: true, simulated: true }));
  }

  const identity = buildResendIdentity(resendSetup.from, customFrom, customReplyTo);
  const results = [];
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const payload = chunk.map((m) => {
      const item = { from: identity.from, to: [m.to], subject: m.subject, html: m.html, text: m.text || htmlToText(m.html) };
      if (identity.replyTo) item.replyTo = identity.replyTo;
      return item;
    });
    try {
      const { data, error } = await resendSetup.client.batch.send(payload);
      if (error) throw new Error(error.message);
      const ids = (data && data.data) || [];
      chunk.forEach((_, j) => results.push(ids[j] ? { ok: true, id: ids[j].id } : { ok: false, error: 'No id returned' }));
      console.log(`✅ [Resend] Batch of ${chunk.length} emails accepted`);
    } catch (err) {
      console.error(`❌ [Resend] Batch of ${chunk.length} emails failed: ${err.message}`);
      chunk.forEach(() => results.push({ ok: false, error: `Resend: ${err.message}` }));
    }
    // Stay well under Resend's default rate limit between batch calls
    if (i + 100 < messages.length) await new Promise((r) => setTimeout(r, 600));
  }
  return results;
}

/** True when emails will actually go out through Resend */
async function isResendConfigured() {
  return Boolean(await getResendSetup());
}

module.exports = { sendEmail, sendEmailBatch, isResendConfigured, getTransporter, clearTransporterCache };
