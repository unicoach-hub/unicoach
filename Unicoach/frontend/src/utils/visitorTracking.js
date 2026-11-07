import { API_BASE_URL } from '../config';
import { getAttribution } from './adTracking';

/**
 * Anonymous visitor analytics for Admin → Developer → Visitors (backend/controllers/visitorController.js).
 *
 * The browser keeps a random visitor id in localStorage and sends small batches with sendBeacon to
 * POST /api/t: page views (time on page, scroll depth), JavaScript errors, failed API calls, rage
 * clicks, forms started and abandoned, and form submissions. It never sends what anyone typed:
 * only the email and name of a form that was actually submitted, so the visit history joins that lead.
 *
 * Visitors who came back 3+ times without filling a form fire a Meta "ReturningVisitor" custom event
 * (and GA4 "returning_no_lead") once per visit, for retargeting audiences in Ads Manager.
 *
 * Runs only on the live site (unicoach.com / unicoach.in), never for bots, headless browsers or the
 * prerender. Open any page with ?uc_notrack=1 to stop tracking this browser (?uc_notrack=0 undoes it).
 */

const STORE = 'uc_visitor';
const NOTRACK = 'uc_notrack';
const SESSION_GAP_MS = 30 * 60 * 1000;
const FLUSH_MS = 10000;
const RETARGET_AFTER_SESSIONS = 3;

const CONVERSION_RX = /\/api\/(leads\/(submit|book-consultation)|consultations|forms\/[^/]+\/submit|bookings\/[^/]+\/book|events\/[^/]+\/register|support-requests|auth\/(register|google)|unicoach\/apply)$/;

const rid = (n = 16) => {
  const a = new Uint8Array(n);
  (window.crypto || window.msCrypto).getRandomValues(a);
  return Array.from(a, (b) => (b % 36).toString(36)).join('');
};

const readStore = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE) || 'null');
  } catch {
    return null;
  }
};
const writeStore = (v) => {
  try {
    localStorage.setItem(STORE, JSON.stringify(v));
  } catch {
    // storage blocked: this page view still counts, the next one starts a new visitor
  }
};

const deviceInfo = () => {
  const ua = navigator.userAgent;
  const tablet = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  const mobile = !tablet && /Mobi|Android|iPhone|iPod/i.test(ua);
  const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) || (tablet && /Macintosh/.test(ua)) ? 'iOS'
    : /Windows/i.test(ua) ? 'Windows' : /Mac OS X/i.test(ua) ? 'macOS' : /CrOS/i.test(ua) ? 'ChromeOS' : /Linux/i.test(ua) ? 'Linux' : 'Other';
  const browser = /Instagram/i.test(ua) ? 'Instagram app' : /FBAN|FBAV/i.test(ua) ? 'Facebook app' : /Edg\//i.test(ua) ? 'Edge'
    : /SamsungBrowser/i.test(ua) ? 'Samsung' : /OPR\//i.test(ua) ? 'Opera' : /Firefox|FxiOS/i.test(ua) ? 'Firefox'
      : /Chrome|CriOS/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : 'Other';
  return { device: tablet ? 'tablet' : mobile ? 'mobile' : 'desktop', os, browser, sw: window.screen?.width, lang: navigator.language };
};

// "instagram / paid · diwali_offer", "google.com", or "direct"
const sourceOf = () => {
  try {
    const t = getAttribution().lastTouch || {};
    if (t.utm_source) return [t.utm_source, t.utm_medium].filter(Boolean).join(' / ') + (t.utm_campaign ? ` · ${t.utm_campaign}` : '');
    if (t.gclid || t.gbraid || t.wbraid) return 'google / ads';
    if (t.fbclid) return 'facebook / instagram';
    if (t.referrer) return new URL(t.referrer).hostname.replace(/^www\./, '');
  } catch {
    // fall through
  }
  return 'direct';
};

let visitor = null;
let queue = [];
let current = null; // the page being viewed: { id, path, start, scroll, forms: Map }
let errorsThisPage = 0;
let rageDone = new Set();
let clicks = [];

const push = (e) => {
  queue.push({ ...e, at: Date.now() });
  if (queue.length >= 30) flush();
};

const flush = () => {
  if (!queue.length || !visitor) return;
  if (current && !current.titled) {
    const pv = queue.find((e) => e.t === 'pv' && e.i === current.id);
    if (pv) pv.ti = document.title;
  }
  const body = JSON.stringify({ v: visitor.id, s: visitor.sid, d: deviceInfo(), src: sourceOf(), lp: visitor.lp, e: queue });
  queue = [];
  const url = `${API_BASE_URL}/t`;
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }))) return;
  } catch {
    // fall back to fetch
  }
  try {
    window.__ucRawFetch?.(url, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' }, credentials: 'omit' }).catch(() => {});
  } catch {
    // never break the page over analytics
  }
};

const formKey = (el) => {
  const form = el.closest('form');
  const name = form && (form.getAttribute('name') || form.id || form.getAttribute('aria-label'));
  if (name) return name.slice(0, 60);
  const heading = (form || el.closest('section, [role="dialog"], main') || document.body).querySelector('h1, h2, h3');
  return (heading?.textContent || 'form').trim().replace(/\s+/g, ' ').slice(0, 60);
};
const filledCount = (key) => {
  const f = current?.forms.get(key);
  if (!f?.form) return f?.fields?.size || 0;
  return Array.from(f.form.elements).filter((x) => x.type !== 'password' && x.type !== 'hidden' && x.type !== 'submit' && x.value && (x.type !== 'checkbox' && x.type !== 'radio' ? true : x.checked)).length;
};

// Time on page is sent in pieces (each time the tab is hidden, and when the page ends); the server adds them up
const sendTime = () => {
  if (!current || !current.start) return;
  const du = Math.round((Date.now() - current.start) / 1000);
  current.start = null;
  if (du > 0) push({ t: 'pe', i: current.id, du, sc: current.scroll });
};

const endPage = () => {
  if (!current) return;
  sendTime();
  current.forms.forEach((f, key) => {
    if (!f.sent) {
      const filled = filledCount(key);
      push({ t: 'fa', p: current.path, x: `${key} (${filled} ${filled === 1 ? 'field' : 'fields'} filled)` });
    }
  });
  current = null;
};

// The page as one row in admin: ad parameters and anything personal or secret are dropped from the query
const DROP_PARAMS = /^(utm_.*|gclid|gbraid|wbraid|fbclid|msclkid|igshid|ref|email|phone|mobile|name|token|code|otp|key|session|uc_notrack)$/i;
const currentPath = () => {
  const params = new URLSearchParams(window.location.search);
  [...params.keys()].forEach((k) => { if (DROP_PARAMS.test(k)) params.delete(k); });
  const q = params.toString();
  return window.location.pathname + (q ? `?${q}` : '');
};

const startPage = () => {
  const path = currentPath();
  if (current && current.path === path) return;
  endPage();
  current = { id: rid(10), path, start: Date.now(), scroll: 0, forms: new Map(), titled: false };
  errorsThisPage = 0;
  rageDone = new Set();
  push({ t: 'pv', i: current.id, p: path });
  const page = current;
  setTimeout(() => {
    const pv = queue.find((e) => e.t === 'pv' && e.i === page.id);
    if (pv) { pv.ti = document.title; page.titled = true; }
  }, 1200);
};

const newVisit = () => {
  const stored = readStore();
  const now = Date.now();
  if (stored?.id && now - (stored.lastAt || 0) < SESSION_GAP_MS) {
    visitor = { ...stored, lastAt: now };
  } else {
    visitor = {
      id: stored?.id || rid(16),
      sid: rid(12),
      sessions: (stored?.sessions || 0) + 1,
      converted: Boolean(stored?.converted),
      lp: window.location.pathname,
      lastAt: now,
      rt: false,
    };
  }
  writeStore(visitor);
};

const retarget = () => {
  if (visitor.converted || visitor.rt || visitor.sessions < RETARGET_AFTER_SESSIONS) return;
  visitor.rt = true;
  writeStore(visitor);
  const send = () => {
    window.fbq?.('trackCustom', 'ReturningVisitor', { visits: visitor.sessions });
    window.gtag?.('event', 'returning_no_lead', { visits: visitor.sessions });
  };
  setTimeout(send, 4000); // after the pixel / gtag have loaded
};

const markConverted = (path, body, data) => {
  let em = body?.email || body?.studentEmail || body?.data?.Email || body?.data?.email || data?.user?.email || '';
  let nm = body?.name || body?.studentName || body?.data?.Name || body?.data?.name || data?.user?.name || '';
  if (!em && body?.data && typeof body.data === 'object') {
    const hit = Object.entries(body.data).find(([k, v]) => /e-?mail/i.test(k) && typeof v === 'string');
    if (hit) em = hit[1];
  }
  if (!nm && body?.data && typeof body.data === 'object') {
    const hit = Object.entries(body.data).find(([k, v]) => /name/i.test(k) && typeof v === 'string');
    if (hit) nm = hit[1];
  }
  push({ t: 'cv', p: current?.path || window.location.pathname, k: path, em: String(em).slice(0, 160), nm: String(nm).slice(0, 120) });
  current?.forms.forEach((f) => { f.sent = true; });
  visitor.converted = true;
  writeStore(visitor);
  flush();
};

const installFetchWatch = () => {
  const inner = window.fetch;
  window.__ucRawFetch = inner;
  let apiOrigin = '';
  try {
    apiOrigin = new URL(API_BASE_URL, window.location.href).origin;
  } catch {
    // relative API
  }
  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' || input instanceof URL ? String(input) : input?.url;
    let parsed = null;
    try {
      parsed = url ? new URL(url, window.location.href) : null;
    } catch {
      // not a URL we care about
    }
    const ours = parsed && (parsed.origin === apiOrigin || parsed.origin === window.location.origin) && parsed.pathname.startsWith('/api/') && parsed.pathname !== '/api/t';
    if (!ours) return inner(input, init);
    const method = (init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const path = parsed.pathname.replace(/\/+$/, '');
    return inner(input, init).then((res) => {
      // any form on this page that was sent (log in, newsletter, …) is not "abandoned"
      if (res.ok && method === 'POST') current?.forms.forEach((f) => { f.sent = true; });
      if (res.status >= 500) push({ t: 'api', p: current?.path, x: `${method} ${path} → ${res.status}` });
      if (res.ok && method === 'POST' && CONVERSION_RX.test(path)) {
        let body = null;
        try { body = typeof init.body === 'string' ? JSON.parse(init.body) : null; } catch { /* not JSON */ }
        const done = (data) => {
          // Google sign-in counts only when it created an account
          if (path.endsWith('/auth/google') && !data?.isNewAccount) return;
          markConverted(path, body, data);
        };
        res.clone().json().then(done, () => done(null));
      }
      return res;
    }, (err) => {
      if (navigator.onLine !== false) push({ t: 'api', p: current?.path, x: `${method} ${path} → network error` });
      throw err;
    });
  };
};

const installListeners = () => {
  ['pushState', 'replaceState'].forEach((fn) => {
    const orig = history[fn];
    history[fn] = function patched(...args) {
      const r = orig.apply(this, args);
      setTimeout(startPage, 0);
      return r;
    };
  });
  window.addEventListener('popstate', () => setTimeout(startPage, 0));

  window.addEventListener('scroll', () => {
    if (!current) return;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? Math.round((window.scrollY / h) * 100) : 100;
    if (pct > current.scroll) current.scroll = Math.min(100, pct);
  }, { passive: true });

  document.addEventListener('input', (e) => {
    const el = e.target;
    if (!current || !el || !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.type === 'search' || el.closest('[data-no-track], header, nav')) return;
    // forms only: inputs inside a <form>, or contact fields (search boxes and filters are not forms)
    const contact = /^(email|tel)$/.test(el.type) || /name|phone|mobile|email|whatsapp/i.test(`${el.name} ${el.id} ${el.placeholder}`);
    if (!el.closest('form') && !contact) return;
    const key = formKey(el);
    let f = current.forms.get(key);
    if (!f) {
      f = { form: el.closest('form'), fields: new Set(), sent: false };
      current.forms.set(key, f);
      push({ t: 'fs', p: current.path, x: key });
    }
    f.fields.add(el.name || el.id || el.placeholder || el.type);
  }, true);

  document.addEventListener('click', (e) => {
    if (!current) return;
    const now = Date.now();
    clicks = clicks.filter((c) => now - c.at < 800);
    clicks.push({ at: now, x: e.clientX, y: e.clientY });
    const near = clicks.filter((c) => Math.abs(c.x - e.clientX) < 30 && Math.abs(c.y - e.clientY) < 30);
    if (near.length >= 3) {
      const el = e.target.closest('button, a, [role="button"], input, label') || e.target;
      const label = `${el.tagName.toLowerCase()}: ${(el.innerText || el.getAttribute('aria-label') || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 60)}`;
      if (!rageDone.has(label)) {
        rageDone.add(label);
        push({ t: 'rage', p: current.path, x: label });
      }
      clicks = [];
    }
  }, true);

  const onError = (msg) => {
    if (!current || errorsThisPage >= 5) return;
    const text = String(msg || '').slice(0, 280);
    if (!text || /^Script error\.?$/i.test(text) || /ResizeObserver loop/i.test(text)) return;
    errorsThisPage += 1;
    push({ t: 'err', p: current.path, x: text });
  };
  window.addEventListener('error', (e) => {
    if (e.target && e.target !== window) return; // a failed image/script load, not a code error
    onError(e.message);
  });
  window.addEventListener('unhandledrejection', (e) => onError(e.reason?.message || String(e.reason || '')));

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // the tab may never come back (closed, phone locked): send the time so far now
      sendTime();
      flush();
    } else if (current) {
      // back after 30+ minutes: that's a new visit
      if (Date.now() - (visitor.lastAt || 0) > SESSION_GAP_MS) {
        current = null;
        newVisit();
        startPage();
        retarget();
        return;
      }
      current.start = Date.now();
    }
    visitor.lastAt = Date.now();
    writeStore(visitor);
  });
  window.addEventListener('pagehide', () => { endPage(); flush(); });
  setInterval(() => {
    // only time spent looking at the page keeps the visit going
    if (visitor && document.visibilityState === 'visible') { visitor.lastAt = Date.now(); writeStore(visitor); }
    flush();
  }, FLUSH_MS);
};

export const initVisitorTracking = () => {
  try {
    if (typeof window === 'undefined') return;
    // VITE_TRACK_VISITORS=true turns it on anywhere (a staging copy, or a local test against a mock API)
    const forced = import.meta.env.VITE_TRACK_VISITORS === 'true';
    if (!forced && (!import.meta.env.PROD || !/(^|\.)unicoach\.(com|in)$/.test(window.location.hostname))) return;
    const flag = new URLSearchParams(window.location.search).get(NOTRACK);
    if (flag === '1') localStorage.setItem(NOTRACK, '1');
    if (flag === '0') localStorage.removeItem(NOTRACK);
    if (localStorage.getItem(NOTRACK) === '1') return;
    if (navigator.webdriver || /bot|crawl|spider|headless|lighthouse|prerender/i.test(navigator.userAgent)) return;

    newVisit();
    installFetchWatch();
    installListeners();
    startPage();
    retarget();
  } catch {
    // analytics must never break the site
  }
};
