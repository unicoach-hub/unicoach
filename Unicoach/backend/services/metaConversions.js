const crypto = require('crypto');

/**
 * Meta Conversions API: sends Lead / CompleteRegistration / Purchase from the server, so conversions
 * still reach Meta Ads when the browser pixel is blocked (ad blockers, iOS, cookie limits).
 * The website pixel sends the same event with the same event_id, and Meta keeps one copy.
 *
 * Needs META_PIXEL_ID and META_CAPI_ACCESS_TOKEN; without them nothing is sent.
 * Optional META_TEST_EVENT_CODE shows the events under Events Manager → Test events.
 * Never throws and never delays the response (callers do not await it).
 */

const GRAPH_VERSION = 'v21.0';

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const normalizeEmail = (email) => {
  const clean = String(email || '').trim().toLowerCase();
  return clean.includes('@') ? clean : '';
};

// Meta wants digits with country code; numbers here are Indian unless they carry a +code
const normalizePhone = (phone) => {
  const raw = String(phone || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10) return '';
  if (raw.startsWith('+')) return digits;
  return `91${digits.slice(-10)}`;
};

const splitName = (name) => {
  const parts = String(name || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  return { fn: parts[0] || '', ln: parts.length > 1 ? parts[parts.length - 1] : '' };
};

const buildUserData = ({ email, phone, name, externalId }, req, attribution) => {
  const userData = {};
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);
  const { fn, ln } = splitName(name);
  if (cleanEmail) userData.em = [sha256(cleanEmail)];
  if (cleanPhone) userData.ph = [sha256(cleanPhone)];
  if (fn) userData.fn = [sha256(fn)];
  if (ln) userData.ln = [sha256(ln)];
  if (externalId) userData.external_id = [sha256(String(externalId))];

  const fbp = attribution?.fbp || req?.cookies?._fbp;
  const fbc = attribution?.fbc || req?.cookies?._fbc;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  if (req?.ip) userData.client_ip_address = req.ip;
  const userAgent = req?.get?.('user-agent');
  if (userAgent) userData.client_user_agent = userAgent;
  return userData;
};

/**
 * @param {object} options
 * @param {'Lead'|'CompleteRegistration'|'Purchase'|'Schedule'} options.eventName
 * @param {string} [options.eventId]   same id the browser pixel used (for deduplication)
 * @param {object} options.user        { email, phone, name, externalId }
 * @param {import('express').Request} [options.req]
 * @param {object} [options.attribution]  from utils/attribution
 * @param {number} [options.value]
 * @param {string} [options.currency]
 * @param {object} [options.customData]
 */
const sendMetaEvent = ({ eventName, eventId, user = {}, req, attribution, value, currency = 'INR', customData = {} }) => {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const userData = buildUserData(user, req, attribution);
  if (!userData.em && !userData.ph && !userData.fbp && !userData.fbc) return; // nothing Meta can match

  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: attribution?.pageUrl || req?.get?.('referer') || process.env.FRONTEND_URL,
    user_data: userData,
    custom_data: { ...customData, ...(value > 0 ? { value: Number(value), currency } : {}) }
  };
  if (eventId) event.event_id = eventId;

  const payload = { data: [event] };
  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE;

  fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000)
  })
    .then(async (res) => {
      if (!res.ok) console.warn(`[Meta CAPI] ${eventName} rejected (${res.status}):`, (await res.text()).slice(0, 300));
    })
    .catch((err) => console.warn(`[Meta CAPI] ${eventName} failed:`, err.message));
};

module.exports = { sendMetaEvent };
