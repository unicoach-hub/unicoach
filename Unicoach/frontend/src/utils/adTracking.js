import { API_BASE_URL } from '../config';

/**
 * Ad tracking for Google Ads and Meta (Facebook/Instagram) Ads.
 *
 * 1. Loads the Meta Pixel and the Google Ads tag when their IDs are set (VITE_META_PIXEL_ID, VITE_GOOGLE_ADS_ID).
 *    GA4 is already loaded in index.html; the Google Ads ID is added to that same gtag.
 * 2. Remembers where a visitor came from (utm_*, gclid, fbclid, landing page, referrer) for 90 days,
 *    first touch and last touch, and attaches it to every lead / signup sent to our API so
 *    Admin → Leads shows which campaign brought each lead.
 * 3. Fires conversions after the API confirms success, so failed submits are never counted:
 *      Lead                 /leads/submit, /leads/book-consultation, /forms/:slug/submit, /bookings/:slug/book
 *      CompleteRegistration /auth/register, /auth/google (new accounts only)
 *      Purchase             paid mentor bookings (/unicoach/.../verify-payment, /payments/verify)
 *    Each event carries an event id that the backend reuses for the Meta Conversions API, so Meta
 *    counts the browser + server copy once.
 */

const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '';
const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID || ''; // AW-XXXXXXXXX
const GOOGLE_ADS_LABELS = {
  lead: import.meta.env.VITE_GOOGLE_ADS_LEAD_LABEL || '',
  signup: import.meta.env.VITE_GOOGLE_ADS_SIGNUP_LABEL || '',
  purchase: import.meta.env.VITE_GOOGLE_ADS_PURCHASE_LABEL || '',
};

const STORAGE_KEY = 'uc_attribution';
const ATTRIBUTION_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const PARAM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid'];

const isBrowser = typeof window !== 'undefined';

// ── Attribution ──────────────────────────────────────────────────────────────

const readStored = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored && Date.now() - (stored.savedAt || 0) < ATTRIBUTION_TTL_MS) return stored;
  } catch {
    // storage blocked or corrupt: start fresh
  }
  return null;
};

const writeStored = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...value, savedAt: Date.now() }));
  } catch {
    // storage blocked (private mode): attribution just isn't remembered across pages
  }
};

const readCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
};

const externalReferrer = () => {
  try {
    if (!document.referrer) return '';
    return new URL(document.referrer).hostname === window.location.hostname ? '' : document.referrer;
  } catch {
    return '';
  }
};

/** Records this visit's campaign parameters. A visit with none of them keeps the earlier touch. */
const captureAttribution = () => {
  const params = new URLSearchParams(window.location.search);
  const touch = {};
  PARAM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) touch[key] = value.slice(0, 300);
  });
  const referrer = externalReferrer();
  if (!Object.keys(touch).length && !referrer) return;

  touch.landingPage = window.location.href.slice(0, 500);
  if (referrer) touch.referrer = referrer.slice(0, 500);
  touch.capturedAt = new Date().toISOString();

  const stored = readStored() || {};
  // fbclid → Meta's _fbc format, kept so it survives even when the pixel cookie is blocked
  const fbc = touch.fbclid ? `fb.1.${Date.now()}.${touch.fbclid}` : stored.fbc;
  writeStored({ firstTouch: stored.firstTouch || touch, lastTouch: touch, ...(fbc ? { fbc } : {}) });
};

/** Attribution payload sent with lead / signup requests. */
export const getAttribution = () => {
  const stored = isBrowser ? readStored() : null;
  return {
    firstTouch: stored?.firstTouch,
    lastTouch: stored?.lastTouch,
    fbp: readCookie('_fbp') || undefined,
    fbc: readCookie('_fbc') || stored?.fbc || undefined,
    pageUrl: window.location.href.slice(0, 500),
  };
};

// ── Tags ─────────────────────────────────────────────────────────────────────

const loadMetaPixel = () => {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
};

const gtag = (...args) => {
  if (typeof window.gtag === 'function') window.gtag(...args);
};

let lastTrackedPath = '';

/** Meta needs a PageView per SPA route change (GA4 tracks history changes on its own). */
export const trackPageView = () => {
  if (!isBrowser || !META_PIXEL_ID || !window.fbq) return;
  const path = window.location.pathname + window.location.search;
  if (path === lastTrackedPath) return;
  if (lastTrackedPath) window.fbq('track', 'PageView'); // the first one is sent by loadMetaPixel
  lastTrackedPath = path;
};

const newEventId = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

const setGoogleUserData = ({ email, phone } = {}) => {
  // Enhanced conversions: gtag hashes these before sending
  const userData = {};
  if (email) userData.email = String(email).trim().toLowerCase();
  if (phone) {
    const digits = String(phone).replace(/[^\d+]/g, '');
    userData.phone_number = digits.startsWith('+') ? digits : `+91${digits.replace(/^0+/, '').slice(-10)}`;
  }
  if (Object.keys(userData).length) gtag('set', 'user_data', userData);
};

const CONVERSIONS = {
  lead: { meta: 'Lead', ga4: 'generate_lead' },
  signup: { meta: 'CompleteRegistration', ga4: 'sign_up' },
  purchase: { meta: 'Purchase', ga4: 'purchase' },
};

/**
 * Sends one conversion to Meta, Google Ads and GA4.
 * @param {'lead'|'signup'|'purchase'} type
 */
export const trackConversion = (type, { eventId, value, currency = 'INR', user, label } = {}) => {
  const conversion = CONVERSIONS[type];
  if (!isBrowser || !conversion) return;
  const id = eventId || newEventId(type);
  const money = value > 0 ? { value: Number(value), currency } : {};

  if (META_PIXEL_ID && window.fbq) {
    window.fbq('track', conversion.meta, { ...money, ...(label ? { content_name: label } : {}) }, { eventID: id });
  }

  setGoogleUserData(user);
  gtag('event', conversion.ga4, { ...money, ...(label ? { form_name: label } : {}), ...(type === 'purchase' ? { transaction_id: id } : {}) });
  if (GOOGLE_ADS_ID && GOOGLE_ADS_LABELS[type]) {
    gtag('event', 'conversion', { send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LABELS[type]}`, ...money, transaction_id: id });
  }
};

// ── Automatic conversions from API calls ────────────────────────────────────

const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL, window.location.href).origin;
  } catch {
    return '';
  }
})();

// Requests that carry attribution in their JSON body (the backend whitelists the field)
const ATTRIBUTED = [
  { test: /\/api\/leads\/(submit|book-consultation)$/, type: 'lead' },
  { test: /\/api\/bookings\/[^/]+\/book$/, type: 'lead' },
  { test: /\/api\/forms\/[^/]+\/submit$/, type: 'lead' },
  { test: /\/api\/auth\/register$/, type: 'signup' },
  { test: /\/api\/auth\/google$/, type: 'signup' },
];
const PURCHASE = /\/api\/unicoach\/(@[^/]+\/verify-payment|payments\/verify)$/;

const userFromBody = (body) => ({
  email: body?.email || body?.studentEmail || body?.data?.Email || body?.data?.email,
  phone: body?.phone || body?.studentPhone || body?.data?.Phone || body?.data?.phone,
});

const handleResponse = async (match, path, requestBody, eventId, response) => {
  if (!response.ok) return;
  let data;
  try {
    data = await response.clone().json();
  } catch {
    return;
  }

  if (match === 'purchase') {
    const booking = data?.booking;
    if (!booking?.bookingRef || !(booking.amountPaid > 0) || !['CONFIRMED', 'COMPLETED'].includes(booking.state)) return;
    trackConversion('purchase', {
      eventId: `purchase_${booking.bookingRef}`,
      value: booking.amountPaid,
      user: { email: booking.studentEmail },
      label: booking.serviceTitle,
    });
    return;
  }

  if (match.type === 'signup') {
    // Google sign-in is a signup only when it created the account
    if (path.endsWith('/auth/google') && !data?.isNewAccount) return;
    trackConversion('signup', { eventId, user: { email: data?.user?.email, phone: data?.user?.phone } });
    return;
  }

  trackConversion('lead', { eventId, user: userFromBody(requestBody), label: requestBody?.source });
};

/** Wraps window.fetch (after installApiFetch) to tag lead/signup requests and report conversions. */
const installConversionFetch = () => {
  if (window.__unicoachConversionFetchInstalled) return;
  window.__unicoachConversionFetchInstalled = true;
  const innerFetch = window.fetch;

  window.fetch = (input, init = {}) => {
    const method = (init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const url = typeof input === 'string' || input instanceof URL ? String(input) : input?.url;
    if (method !== 'POST' || !url) return innerFetch(input, init);

    let parsed;
    try {
      parsed = new URL(url, window.location.href);
    } catch {
      return innerFetch(input, init);
    }
    if (parsed.origin !== API_ORIGIN && parsed.origin !== window.location.origin) return innerFetch(input, init);

    const path = parsed.pathname.replace(/\/+$/, '');
    if (PURCHASE.test(path)) {
      return innerFetch(input, init).then((res) => {
        handleResponse('purchase', path, null, null, res).catch(() => {});
        return res;
      });
    }

    const match = ATTRIBUTED.find((rule) => rule.test.test(path));
    if (!match || typeof init.body !== 'string') return innerFetch(input, init);

    let body;
    try {
      body = JSON.parse(init.body);
    } catch {
      return innerFetch(input, init);
    }
    const eventId = newEventId(match.type);
    const nextInit = { ...init, body: JSON.stringify({ ...body, attribution: { ...getAttribution(), eventId } }) };

    return innerFetch(input, nextInit).then((res) => {
      handleResponse(match, path, body, eventId, res).catch(() => {});
      return res;
    });
  };
};

export const initAdTracking = () => {
  if (!isBrowser) return;
  try {
    captureAttribution();
  } catch {
    // never block the app on tracking
  }
  if (META_PIXEL_ID) loadMetaPixel();
  if (GOOGLE_ADS_ID) gtag('config', GOOGLE_ADS_ID, { allow_enhanced_conversions: true });
  lastTrackedPath = window.location.pathname + window.location.search;
  installConversionFetch();
};
