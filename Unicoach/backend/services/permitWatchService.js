// backend/services/permitWatchService.js
//
// Watches the Irish Department of Enterprise employment-permit pages and emails when the
// meaningful text or the PDF/doc links on a page change. Used for Irish immigration content.
//
// The watched links, the check interval and the noise filters all live in config/permitWatch.json,
// so links can be added without touching this file.
//
// Run by hand:   node scripts/permitWatch.js --once
// Snapshots:     data/permit-watch/*.json  (so diffs survive a restart)
//
// Politeness: one page at a time, a pause between pages, a descriptive User-Agent, and
// exponential back-off on errors. A failed fetch never counts as a change.

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const cheerio = require('cheerio');
const { sendEmail } = require('../utils/email');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'permitWatch.json');
// PERMIT_WATCH_DATA_DIR points this at a mounted volume when there is one; otherwise snapshots
// fall back to the database, which is what happens on the server.
const STATE_DIR = process.env.PERMIT_WATCH_DATA_DIR || path.join(__dirname, '..', 'data', 'permit-watch');

const DEFAULT_WA_TEMPLATE = 'permit_update_alert';   // UTILITY template, one body variable
const MAX_DIFF_LINES = 40;      // per direction, in the email
const MAX_LINE_CHARS = 300;     // trim very long table rows in the email

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nowIso = () => new Date().toISOString();
const istTime = (d = new Date()) => new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

function loadConfig() {
  const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const pages = (cfg.pages || []).filter((p) => p && p.url && p.enabled !== false);
  if (!pages.length) throw new Error('permitWatch.json has no enabled pages');
  return {
    intervalMinutes: Number(process.env.PERMIT_WATCH_INTERVAL_MINUTES || cfg.intervalMinutes) || 30,
    newsIntervalMinutes: Number(process.env.PERMIT_WATCH_NEWS_MINUTES || cfg.newsIntervalMinutes) || 5,
    tickMinutes: Number(process.env.PERMIT_WATCH_TICK_MINUTES || cfg.tickMinutes) || 5,
    discovery: cfg.discovery || { enabled: false },
    requestTimeoutMs: Number(cfg.requestTimeoutMs) || 30000,
    delayBetweenPagesMs: Number(cfg.delayBetweenPagesMs) || 3000,
    retriesPerPage: Number(cfg.retriesPerPage) || 3,
    failAlertAfterHours: Number(cfg.failAlertAfterHours) || 4,
    failAlertRepeatHours: Number(cfg.failAlertRepeatHours) || 24,
    userAgent: cfg.userAgent || 'UniCoach-PermitWatch/1.0 (+https://www.unicoach.com)',
    stripSelectors: cfg.stripSelectors || [],
    contentSelectors: cfg.contentSelectors || ['main', 'body'],
    ignoreLinePatterns: (cfg.ignoreLinePatterns || []).map((p) => new RegExp(p, 'i')),
    pages,
  };
}

// ---------------------------------------------------------------- recipients

const splitList = (v) => String(v || '').split(/[,;\s]+/).map((x) => x.trim()).filter(Boolean);

/** From the environment. Several addresses / numbers may be listed, comma separated. */
const envEmails = () => splitList(process.env.PERMIT_WATCH_EMAIL_TO || process.env.ALERT_EMAIL_TO);
const envPhones = () => splitList(process.env.PERMIT_WATCH_WHATSAPP_TO || process.env.ALERT_WHATSAPP_TO);

/** Try to open the database, for the recipients saved from the admin Developer section. */
async function connectDb() {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) return mongoose;
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) return null;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    return mongoose;
  } catch (err) {
    console.warn('[PermitWatch] database not reachable:', err.message);
    return null;
  }
}

/**
 * Everyone who should hear about a change: the lists saved in the admin Developer section, plus
 * anything in the environment, de-duplicated. The database is the place to add a teammate; the
 * environment is the fallback so a standalone run still works with no database.
 */
async function recipients() {
  let emails = envEmails();
  let phones = envPhones();
  let enabled = true;

  if (await connectDb()) {
    try {
      const cfg = await require('../models/PermitWatchConfig').get();
      if (cfg) {
        enabled = cfg.enabled !== false;
        emails = [...emails, ...(cfg.emails || [])];
        phones = [...phones, ...(cfg.phones || [])];
      }
    } catch (err) {
      console.warn('[PermitWatch] could not read the saved recipients:', err.message);
    }
  }

  const clean = (list) => [...new Set(list.map((x) => String(x).trim()).filter(Boolean))];
  return { emails: clean(emails), phones: clean(phones), enabled };
}

const slugFor = (url) => url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 120).toLowerCase();
const blobPath = (key) => path.join(STATE_DIR, `${slugFor(key)}.json`);

/**
 * Where snapshots are kept. On a server the container's filesystem is read-only
 * (EACCES on /app/data), so the database is used instead and the snapshots survive a redeploy.
 * On a laptop the folder is writable, so disk wins and a local run never touches the live
 * snapshots. Decided once per process.
 */
let storageMode = null;
async function storage() {
  if (storageMode) return storageMode;
  try {
    await fsp.mkdir(STATE_DIR, { recursive: true });
    await fsp.access(STATE_DIR, fs.constants.W_OK);
    storageMode = 'disk';
  } catch (diskErr) {
    if (await connectDb()) {
      storageMode = 'db';
      console.log(`[PermitWatch] snapshots in the database (disk not writable: ${diskErr.code || diskErr.message})`);
    } else {
      // Without somewhere to remember the last copy every page looks new, so each pass stores a
      // baseline and sends nothing. Noisy false alarms are impossible; alerts simply never fire.
      storageMode = 'none';
      console.error('[PermitWatch] nowhere to store snapshots — no writable folder and no database. No change can be detected.');
    }
  }
  return storageMode;
}

/** One stored object, by key (a page URL, or "_sitemap"). */
async function loadBlob(key) {
  const mode = await storage();
  if (mode === 'none') return null;
  if (mode === 'db') {
    try {
      const row = await require('../models/PermitWatchSnapshot').findOne({ key }).lean();
      return row?.data || null;
    } catch (err) {
      console.warn('[PermitWatch] could not read a snapshot:', err.message);
      return null;
    }
  }
  try {
    return JSON.parse(await fsp.readFile(blobPath(key), 'utf8'));
  } catch {
    return null;
  }
}

async function saveBlob(key, value) {
  const mode = await storage();
  if (mode === 'none') return;
  if (mode === 'db') {
    try {
      await require('../models/PermitWatchSnapshot').updateOne({ key }, { $set: { data: value } }, { upsert: true });
    } catch (err) {
      console.warn('[PermitWatch] could not store a snapshot:', err.message);
    }
    return;
  }
  await fsp.mkdir(STATE_DIR, { recursive: true });
  await fsp.writeFile(blobPath(key), JSON.stringify(value, null, 2));
}

const readState = (url) => loadBlob(url);
const writeState = (url, state) => saveBlob(url, state);

// ---------------------------------------------------------------- discovery

const SITEMAP_KEY = '_sitemap';

/**
 * The Department's own sitemap, filtered down to the employment-permit section, so a page it
 * publishes tomorrow is watched without anyone editing the config. The sitemap is big, so it is
 * cached on disk and only refetched every `refreshHours`.
 */
async function discoverPages(cfg, { force = false, cacheOnly = false } = {}) {
  const d = cfg.discovery || {};
  if (!d.enabled || !d.sitemapUrl) return { pages: [], fresh: [] };

  const cached = await loadBlob(SITEMAP_KEY);

  const stale = !cached?.fetchedAt
    || (Date.now() - new Date(cached.fetchedAt).getTime()) / 3600000 >= (Number(d.refreshHours) || 12);

  if ((cacheOnly || (!force && !stale)) && Array.isArray(cached?.urls)) {
    return { pages: cached.urls.map(toDiscoveredPage), fresh: [] };
  }
  if (cacheOnly) return { pages: [], fresh: [] };

  let xml;
  try {
    xml = await fetchWithRetries(d.sitemapUrl, cfg, 'application/xml,text/xml,*/*');
  } catch (err) {
    console.warn('[PermitWatch] sitemap could not be read:', err.message);
    return { pages: (cached?.urls || []).map(toDiscoveredPage), fresh: [] };
  }

  const include = (d.includePrefixes || []).map((x) => x.toLowerCase());
  const exclude = (d.excludePatterns || []).map((x) => new RegExp(x, 'i'));
  const all = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());

  const urls = [...new Set(all.filter((u) => {
    const low = u.toLowerCase();
    return include.some((pre) => low.startsWith(pre)) && !exclude.some((re) => re.test(low));
  }))].sort().slice(0, Number(d.maxPages) || 40);

  // A URL the sitemap did not have last time is itself news worth an alert.
  const known = new Set(cached?.urls || []);
  const fresh = cached?.urls ? urls.filter((u) => !known.has(u)) : [];

  await saveBlob(SITEMAP_KEY, { fetchedAt: nowIso(), urls });
  console.log(`[PermitWatch] sitemap: ${urls.length} page(s) in the watched section${fresh.length ? `, ${fresh.length} brand new` : ''}`);

  return { pages: urls.map(toDiscoveredPage), fresh };
}

/** A sitemap URL turned into a watchable page, labelled from its last path segment. */
function toDiscoveredPage(url) {
  const slug = url.replace(/\/+$/, '').split('/').pop().replace(/\.html?$/i, '');
  const label = slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || 'Employment permits';
  return { label, url, discovered: true };
}

/** What the admin Developer section has saved, or null when there is no database. */
async function savedConfig() {
  if (!(await connectDb())) return null;
  try {
    return await require('../models/PermitWatchConfig').get();
  } catch (err) {
    console.warn('[PermitWatch] could not read the saved settings:', err.message);
    return null;
  }
}

/** Links added in the admin panel, shaped like the ones from the config file. */
const savedPages = (saved) => (saved?.pages || [])
  .filter((p) => p && p.url && p.enabled !== false)
  .map((p) => ({
    label: p.label || p.url.replace(/^https?:\/\//, '').replace(/\/+$/, ''),
    url: p.url,
    everyMinutes: p.everyMinutes || undefined,
    fromAdmin: true,
  }));

/**
 * Every page being watched: the config file, the links added in the admin panel, and whatever the
 * sitemap turned up. Uses the cached sitemap, so it is cheap enough for the admin screen.
 */
async function watchedPages(cfg = loadConfig(), saved = null) {
  const s = saved || await savedConfig();
  const { pages: discovered } = await discoverPages(cfg, { cacheOnly: true });
  return mergePages([...cfg.pages, ...savedPages(s)], discovered);
}

/**
 * One entry per URL. The first mention wins, so the config file beats an admin link and both beat
 * the sitemap — and the same page added twice is still checked once.
 */
function mergePages(...lists) {
  const seen = new Set();
  const out = [];
  for (const page of lists.flat()) {
    const key = String(page.url || '').replace(/\/+$/, '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(page);
  }
  return out;
}

/** How often this page should be checked: its own setting, else the news or the default gap. */
function gapFor(page, cfg) {
  if (Number(page.everyMinutes) > 0) return Number(page.everyMinutes);
  if (/latest-updates|department-news|news-and-events/i.test(page.url)) return cfg.newsIntervalMinutes;
  return cfg.intervalMinutes;
}

/** A page is due when its own gap has passed since the last check. */
async function isDue(page, cfg, now = Date.now()) {
  const prev = await readState(page.url);
  if (!prev?.lastCheckedAt) return true;
  return now - new Date(prev.lastCheckedAt).getTime() >= gapFor(page, cfg) * 60000 - 15000;
}

// ---------------------------------------------------------------- fetching

/** One GET with a timeout. Throws on a non-2xx response so the retry loop can back off. */
async function fetchOnce(url, cfg, accept, acceptStatus) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.requestTimeoutMs);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': cfg.userAgent,
        Accept: accept || 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-IE,en;q=0.9',
      },
    });
    // A page may declare the codes whose body still counts as content: the Employment Permits
    // portal answers 403 with a real "service unavailable" page, and the day it comes back is news.
    if (!res.ok && !(acceptStatus || []).includes(res.status)) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Retries with exponential back-off. Returns the HTML, or throws the last error. */
async function fetchWithRetries(url, cfg, accept, acceptStatus) {
  let lastErr;
  for (let attempt = 1; attempt <= cfg.retriesPerPage; attempt += 1) {
    try {
      return await fetchOnce(url, cfg, accept, acceptStatus);
    } catch (err) {
      lastErr = err;
      if (attempt < cfg.retriesPerPage) await sleep(2000 * 2 ** (attempt - 1));
    }
  }
  throw lastErr;
}

// ---------------------------------------------------------------- extraction

/** The page's meaningful text (nav, cookie banners, timestamps and counters removed) plus its document links. */
function extract(html, pageUrl, cfg) {
  const $ = cheerio.load(html);
  const title = ($('title').first().text() || '').replace(/\s+/g, ' ').trim();

  // Document links come from the whole page: a PDF in a sidebar still matters.
  const docLinks = [];
  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim();
    if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) return;
    if (!/\.(pdf|docx?|xlsx?|csv|odt|ods)(\?|#|$)/i.test(href)) return;
    try {
      const abs = new URL(href, pageUrl).toString().split('#')[0];
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      docLinks.push(`${abs}${text ? ` — ${text}` : ''}`);
    } catch {
      /* skip unparseable href */
    }
  });

  cfg.stripSelectors.forEach((sel) => {
    try {
      $(sel).remove();
    } catch {
      /* ignore a selector cheerio won't take */
    }
  });

  let $scope = null;
  for (const sel of cfg.contentSelectors) {
    const found = $(sel).first();
    if (found.length && found.text().trim().length > 200) {
      $scope = found;
      break;
    }
  }
  // A short holding page ("service unavailable") has less text than that floor but is still the page.
  if (!$scope) $scope = $('body');

  // Minified HTML has no newlines of its own, so mark the block boundaries before reading the text,
  // otherwise the whole page collapses into one line and a diff says nothing useful.
  $scope.find('br').replaceWith('\n');
  $scope.find('td, th').each((_, el) => $(el).append(' | '));
  $scope.find('p, li, tr, div, section, article, h1, h2, h3, h4, h5, h6, dt, dd, caption, blockquote, figcaption, details, summary')
    .each((_, el) => {
      $(el).prepend('\n');
      $(el).append('\n');
    });

  const lines = ($scope.text() || '')
    .replace(/ /g, ' ')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 1)
    .filter((l) => !cfg.ignoreLinePatterns.some((re) => re.test(l)));

  const text = lines.join('\n');
  const uniqueLinks = [...new Set(docLinks)].sort();
  const hash = crypto.createHash('sha256').update(`${text}\n--links--\n${uniqueLinks.join('\n')}`).digest('hex');

  return { title, text, lines, docLinks: uniqueLinks, hash };
}

// ---------------------------------------------------------------- diff

/** Longest-common-subsequence line diff, so unchanged text isn't reported as added+removed. */
function diffLines(oldLines = [], newLines = []) {
  const n = oldLines.length;
  const m = newLines.length;
  // Guard against a pathological page: fall back to a set difference.
  if (n * m > 4_000_000) {
    const oldSet = new Set(oldLines);
    const newSet = new Set(newLines);
    return {
      added: newLines.filter((l) => !oldSet.has(l)),
      removed: oldLines.filter((l) => !newSet.has(l)),
    };
  }

  const table = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      table[i][j] = oldLines[i] === newLines[j]
        ? table[i + 1][j + 1] + 1
        : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const added = [];
  const removed = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (oldLines[i] === newLines[j]) {
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      removed.push(oldLines[i]);
      i += 1;
    } else {
      added.push(newLines[j]);
      j += 1;
    }
  }
  while (i < n) removed.push(oldLines[i++]);
  while (j < m) added.push(newLines[j++]);

  return { added, removed };
}

// ---------------------------------------------------------------- email

const trim = (l) => (l.length > MAX_LINE_CHARS ? `${l.slice(0, MAX_LINE_CHARS)}…` : l);

/** A big tappable button, so the page is one click away from the email. */
const openButton = (url, label = 'Open the page') => `<p style="margin:18px 0 0">
    <a href="${esc(url)}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#14837E;color:#fff;font-weight:700;font-size:15px;text-decoration:none">${esc(label)} →</a>
  </p>`;

function block(heading, items, colour) {
  if (!items.length) return '';
  const shown = items.slice(0, MAX_DIFF_LINES);
  const more = items.length - shown.length;
  return `<h3 style="margin:22px 0 8px;font-size:15px;color:${colour}">${esc(heading)} (${items.length})</h3>
  <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.55;color:#16130F">
    ${shown.map((l) => `<li style="margin-bottom:5px">${esc(trim(l))}</li>`).join('')}
  </ul>
  ${more > 0 ? `<p style="margin:6px 0 0;font-size:13px;color:#5B544A">…and ${more} more line(s). Open the page to see everything.</p>` : ''}`;
}

function changeEmailHtml({ page, title, url, diff, linkDiff }) {
  return `<!doctype html><html><body style="margin:0;background:#F4F4F2;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:640px;margin:24px auto;background:#fff;border:1px solid #DDD8D0;border-radius:12px;padding:26px">
    <p style="margin:0;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#14837E;font-weight:700">Irish employment permits — page changed</p>
    <h1 style="margin:8px 0 4px;font-size:21px;line-height:1.3;color:#16130F">${esc(title || page.label)}</h1>
    <p style="margin:0 0 2px;font-size:14px"><a href="${esc(url)}" style="color:#14837E">${esc(url)}</a></p>
    <p style="margin:0;font-size:13px;color:#5B544A">Checked ${esc(istTime())} IST</p>
    ${block('New or changed PDF / document links', linkDiff.added, '#14837E')}
    ${block('PDF / document links removed', linkDiff.removed, '#D0362E')}
    ${block('Text added', diff.added, '#14837E')}
    ${block('Text removed', diff.removed, '#D0362E')}
    ${openButton(url)}
    <p style="margin:24px 0 0;font-size:12px;color:#8A8278">Watched by permitWatch (backend/config/permitWatch.json). Official source: Department of Enterprise, Tourism and Employment.</p>
  </div></body></html>`;
}

function failureEmailHtml({ page, url, hours, lastError }) {
  return `<!doctype html><html><body style="margin:0;background:#F4F4F2;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:620px;margin:24px auto;background:#fff;border:1px solid #DDD8D0;border-radius:12px;padding:26px">
    <p style="margin:0;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#D0362E;font-weight:700">Page cannot be checked</p>
    <h1 style="margin:8px 0 10px;font-size:20px;color:#16130F">${esc(page.label)}</h1>
    <p style="margin:0 0 10px;font-size:14px"><a href="${esc(url)}" style="color:#14837E">${esc(url)}</a></p>
    <p style="margin:0 0 6px;font-size:14px;color:#16130F">Failing for about ${esc(hours)} hour(s). Last error: <strong>${esc(lastError)}</strong></p>
    <p style="margin:0;font-size:13px;color:#5B544A">This is not a content change — the page may have moved or be blocking us. Check the URL in config/permitWatch.json.</p>
    ${openButton(url, 'Try the page yourself')}
  </div></body></html>`;
}

// ---------------------------------------------------------------- WhatsApp

/**
 * The WhatsApp credentials live in the Settings collection (same place the admin UI writes them),
 * so a standalone run has to open the database first. Email needs no database at all.
 */
async function wabaSettings() {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) return null;
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    } catch (err) {
      console.warn('[PermitWatch] WhatsApp skipped, database not reachable:', err.message);
      return null;
    }
  }
  const s = await require('../models/Settings').findOne().lean();
  if (!s || !s.wabaAccessToken || !s.wabaPhoneNumberId) {
    console.warn('[PermitWatch] WhatsApp skipped: not connected in Settings → WhatsApp Business');
    return null;
  }
  return s;
}

/**
 * One WhatsApp alert through the Meta Cloud API, the same way the admin bulk sender does it.
 *
 * Meta only allows free-form text within 24 hours of the person's last message to the business
 * number. Outside that window a plain text send is rejected, so set PERMIT_WATCH_WA_TEMPLATE to an
 * approved template name (one body variable, no newlines) to have alerts arrive at any time.
 * A WhatsApp failure is logged and never stops the email.
 */
async function sendWhatsApp(text, { dryRun = false, phones = null } = {}) {
  const list = phones || (await recipients()).phones;
  if (!list.length) return false;

  const { normalizePhone } = require('../utils/twilio');
  const numbers = [...new Set(list.map((p) => normalizePhone(p).replace(/^\+/, '')))].filter(Boolean);
  const oneLine = text.replace(/\s*\n\s*/g, ' · ').trim();

  if (dryRun) {
    console.log(`[PermitWatch] (dry run) would WhatsApp ${numbers.join(', ')}: ${oneLine.slice(0, 160)}`);
    return false;
  }

  const settings = await wabaSettings();
  if (!settings) return false;

  // An approved template is the only way a WhatsApp alert arrives outside Meta's 24-hour window.
  // DEFAULT_WA_TEMPLATE is the one submitted for this monitor; set the variable to '' to force
  // plain text, or to another name to use a different approved template.
  const templateName = (process.env.PERMIT_WATCH_WA_TEMPLATE ?? DEFAULT_WA_TEMPLATE).trim();
  const payload = templateName
    ? {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      type: 'template',
      template: {
        name: templateName,
        language: { code: process.env.PERMIT_WATCH_WA_TEMPLATE_LANG || 'en' },
        components: [{ type: 'body', parameters: [{ type: 'text', text: oneLine.slice(0, 900) }] }],
      },
    }
    : {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      type: 'text',
      text: { body: text.slice(0, 3500) },
    };

  // While the template is still waiting for Meta's review it does not exist yet, so fall back to
  // plain text rather than sending nothing at all.
  const notApprovedYet = (msg) => /template name does not exist|does not exist|not been approved|no matching template|template_not_found/i.test(String(msg || ''));
  const textPayload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    type: 'text',
    text: { body: text.slice(0, 3500) },
  };

  const post = (body) => fetch(`https://graph.facebook.com/v20.0/${settings.wabaPhoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${settings.wabaAccessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let sentAny = false;
  for (const [i, phone] of numbers.entries()) {
    if (i > 0) await sleep(700);           // stay under Meta's per-second limit
    try {
      let res = await post({ ...payload, to: phone });
      let usedTemplate = Boolean(templateName);
      if (!res.ok && templateName) {
        const why = (await res.clone().json().catch(() => ({})))?.error?.message;
        if (notApprovedYet(why)) {
          console.warn(`[PermitWatch] template "${templateName}" is not approved yet, falling back to plain text`);
          res = await post({ ...textPayload, to: phone });
          usedTemplate = false;
        }
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message || `Meta API error ${res.status}`);
      // Meta accepting the call is NOT delivery. A plain text sent outside the 24-hour window is
      // accepted here and then fails with "Re-engagement message" in the status webhook, so say
      // what actually happened instead of claiming the message arrived.
      if (usedTemplate) {
        console.log(`[PermitWatch] WhatsApp template "${templateName}" accepted for ${phone}`);
      } else {
        console.log(`[PermitWatch] WhatsApp text accepted by Meta for ${phone} — it only reaches them if they messaged the business number in the last 24h; set PERMIT_WATCH_WA_TEMPLATE for alerts that always arrive`);
      }
      sentAny = true;
    } catch (err) {
      const hint = /re-?engag|24 hour|outside|template/i.test(err.message)
        ? ' — outside the 24-hour window; set PERMIT_WATCH_WA_TEMPLATE to an approved template'
        : '';
      console.warn(`[PermitWatch] WhatsApp not sent to ${phone}: ${err.message}${hint}`);
    }
  }
  return sentAny;
}

// ---------------------------------------------------------------- delivery

/** Short WhatsApp version of a change: what changed, a couple of lines of it, and the link. */
function whatsappChangeText({ page, diff, linkDiff }) {
  const parts = [`🇮🇪 *${page.label}* par kuch badla hai`];
  const bits = [];
  if (diff.added.length) bits.push(`+${diff.added.length} line`);
  if (diff.removed.length) bits.push(`-${diff.removed.length} line`);
  if (linkDiff.added.length) bits.push(`+${linkDiff.added.length} PDF/doc`);
  if (linkDiff.removed.length) bits.push(`-${linkDiff.removed.length} PDF/doc`);
  if (bits.length) parts.push(bits.join(', '));

  const sample = [...linkDiff.added.slice(0, 2), ...diff.added.slice(0, 3)]
    .map((l) => `• ${l.length > 140 ? `${l.slice(0, 140)}…` : l}`);
  if (sample.length) parts.push(sample.join('\n'));

  parts.push(page.url);
  parts.push('Pura diff email mein hai.');
  return parts.join('\n');
}

async function deliver({ subject, html, dryRun, emails = null }) {
  const to = emails || (await recipients()).emails;
  if (!to.length) {
    console.warn('[PermitWatch] nobody to email (add addresses in admin → Developer, or ALERT_EMAIL_TO):', subject);
    return false;
  }
  if (dryRun) {
    console.log(`[PermitWatch] (dry run) would email ${to.join(', ')}: ${subject}`);
    return false;
  }
  await sendEmail({ kind: 'updates', to, subject, html });
  return true;
}

// ---------------------------------------------------------------- one page

async function checkPage(page, cfg, { dryRun = false } = {}) {
  const prev = await readState(page.url);
  const isFirstRun = !prev || !prev.hash;

  let html;
  try {
    html = await fetchWithRetries(page.url, cfg, undefined, page.acceptStatus);
  } catch (err) {
    const failingSince = prev?.failingSince || nowIso();
    const hours = Math.round(((Date.now() - new Date(failingSince).getTime()) / 3600000) * 10) / 10;
    const lastError = err.status ? `HTTP ${err.status}` : err.message || 'fetch failed';

    // Only email once a page has been down for a long stretch, and then rarely.
    let failAlertSentAt = prev?.failAlertSentAt || null;
    const dueAgain = !failAlertSentAt
      || (Date.now() - new Date(failAlertSentAt).getTime()) / 3600000 >= cfg.failAlertRepeatHours;
    if (hours >= cfg.failAlertAfterHours && dueAgain) {
      try {
        const sent = await deliver({
          subject: `Permit watch: cannot reach "${page.label}" (${hours}h)`,
          html: failureEmailHtml({ page, url: page.url, hours, lastError }),
          dryRun,
        });
        await sendWhatsApp(
          `⚠️ Permit watch: "${page.label}" ${hours}h se khul nahi raha (${lastError}). Ye content change nahi hai — URL check karo.\n${page.url}`,
          { dryRun },
        );
        if (sent) failAlertSentAt = nowIso();
      } catch (mailErr) {
        console.error('[PermitWatch] failure email could not be sent:', mailErr.message);
      }
    }

    await writeState(page.url, {
      ...(prev || {}),
      url: page.url,
      label: page.label,
      lastCheckedAt: nowIso(),
      lastError,
      failingSince,
      failAlertSentAt,
      consecutiveFailures: (prev?.consecutiveFailures || 0) + 1,
    });

    console.warn(`[PermitWatch] ${page.label}: ${lastError} (failing ${hours}h)`);
    return { url: page.url, label: page.label, status: 'failed', error: lastError };
  }

  const snap = extract(html, page.url, cfg);

  const base = {
    url: page.url,
    label: page.label,
    title: snap.title,
    hash: snap.hash,
    lines: snap.lines,
    docLinks: snap.docLinks,
    lastCheckedAt: nowIso(),
    lastOkAt: nowIso(),
    consecutiveFailures: 0,
    failingSince: null,
    failAlertSentAt: null,
    lastError: null,
  };

  if (isFirstRun) {
    await writeState(page.url, { ...base, baselineAt: nowIso() });
    console.log(`[PermitWatch] ${page.label}: baseline stored (${snap.lines.length} lines, ${snap.docLinks.length} doc links)`);
    return { url: page.url, label: page.label, status: 'baseline' };
  }

  if (prev.hash === snap.hash) {
    await writeState(page.url, { ...prev, ...base, baselineAt: prev.baselineAt, lastChangedAt: prev.lastChangedAt });
    return { url: page.url, label: page.label, status: 'unchanged' };
  }

  const diff = diffLines(prev.lines || [], snap.lines);
  const linkDiff = diffLines(prev.docLinks || [], snap.docLinks);

  let emailed = false;
  try {
    emailed = await deliver({
      subject: `Irish permits changed: ${page.label}`,
      html: changeEmailHtml({ page, title: snap.title, url: page.url, diff, linkDiff }),
      dryRun,
    });
  } catch (mailErr) {
    console.error('[PermitWatch] change email could not be sent:', mailErr.message);
  }

  await sendWhatsApp(whatsappChangeText({ page, diff, linkDiff }), { dryRun });

  // The new snapshot is stored either way, so the next tick diffs against what is live now.
  await writeState(page.url, { ...base, baselineAt: prev.baselineAt, lastChangedAt: nowIso(), lastEmailedAt: emailed ? nowIso() : prev.lastEmailedAt || null });

  console.log(`[PermitWatch] ${page.label}: CHANGED (+${diff.added.length}/-${diff.removed.length} lines, +${linkDiff.added.length}/-${linkDiff.removed.length} docs)${emailed ? ', emailed' : ''}`);
  return { url: page.url, label: page.label, status: 'changed', added: diff.added.length, removed: diff.removed.length, docsAdded: linkDiff.added.length, docsRemoved: linkDiff.removed.length };
}

// ---------------------------------------------------------------- one pass

/**
 * One pass. Every page has its own gap (news pages 5 min, the rest 30), so a pass only fetches the
 * pages that are actually due — that is what keeps a 5-minute tick gentle on the site.
 * `all: true` ignores the gaps and checks everything.
 */
async function runOnce({ dryRun = false, all = false } = {}) {
  const cfg = loadConfig();

  // The admin Developer section can pause the alerts and override the two gaps.
  const saved = await savedConfig();
  if (saved) {
    if (saved.enabled === false) {
      console.log('[PermitWatch] paused in admin → Developer, nothing checked');
      return [];
    }
    if (Number(saved.newsIntervalMinutes) > 0) cfg.newsIntervalMinutes = Number(saved.newsIntervalMinutes);
    if (Number(saved.intervalMinutes) > 0) cfg.intervalMinutes = Number(saved.intervalMinutes);
  }

  const { pages: discovered, fresh } = await discoverPages(cfg);
  const fromAdmin = savedPages(saved);
  const everything = mergePages([...cfg.pages, ...fromAdmin], discovered);

  // A page the Department has just published is news in itself.
  if (fresh.length) {
    const list = fresh.map((u) => `• ${u}`).join('\n');
    try {
      await deliver({
        subject: `Irish permits: ${fresh.length} new page(s) published`,
        html: `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;background:#F4F4F2;margin:0">
        <div style="max-width:620px;margin:24px auto;background:#fff;border:1px solid #DDD8D0;border-radius:12px;padding:26px">
          <p style="margin:0;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#14837E;font-weight:700">New page(s) on the permits section</p>
          <h1 style="margin:8px 0 12px;font-size:20px;color:#16130F">${fresh.length} new page(s) appeared</h1>
          <ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.6">${fresh.map((u) => `<li><a href="${esc(u)}" style="color:#14837E">${esc(u)}</a></li>`).join('')}</ul>
          <p style="margin:20px 0 0;font-size:12px;color:#8A8278">Found in the Department's sitemap. They are now watched like the rest.</p>
        </div></body></html>`,
        dryRun,
      });
      await sendWhatsApp(`🇮🇪 Irish permits par ${fresh.length} naya page aaya hai:\n${list}`, { dryRun });
    } catch (err) {
      console.warn('[PermitWatch] new-page alert could not be sent:', err.message);
    }
  }

  const due = [];
  for (const page of everything) {
    if (all || await isDue(page, cfg)) due.push(page);
  }

  const skipped = everything.length - due.length;
  console.log(`[PermitWatch] ${everything.length} page(s) watched (${cfg.pages.length} from config, ${fromAdmin.length} from admin, ${discovered.length} from sitemap) — checking ${due.length} now, ${skipped} not due yet`);

  const results = [];
  for (const [index, page] of due.entries()) {
    if (index > 0) await sleep(cfg.delayBetweenPagesMs);
    try {
      results.push(await checkPage(page, cfg, { dryRun }));
    } catch (err) {
      console.error(`[PermitWatch] ${page.label}: unexpected error:`, err.message);
      results.push({ url: page.url, label: page.label, status: 'error', error: err.message });
    }
  }
  const count = (s) => results.filter((r) => r.status === s).length;
  console.log(`[PermitWatch] pass done — ${count('changed')} changed, ${count('unchanged')} unchanged, ${count('baseline')} baseline, ${count('failed') + count('error')} failed`);

  // So the admin panel can show when it last ran and when it last saw something
  if (saved && !dryRun) {
    try {
      const update = { lastRunAt: new Date() };
      if (count('changed')) update.lastChangeAt = new Date();
      await require('../models/PermitWatchConfig').updateOne({ key: 'default' }, { $set: update });
    } catch {
      /* not worth failing a pass over */
    }
  }
  return results;
}

// ---------------------------------------------------------------- worker

let timer = null;
let running = false;

async function tick() {
  if (running) return;
  running = true;
  try {
    await runOnce();
  } catch (err) {
    console.error('[PermitWatch] worker error:', err.message);
  } finally {
    running = false;
  }
}

/**
 * Off unless PERMIT_WATCH_ENABLED=true, so deploying this never starts emailing by itself.
 */
function startWorker() {
  if (timer || process.env.PERMIT_WATCH_ENABLED !== 'true') return;
  let cfg;
  try {
    cfg = loadConfig();
  } catch (err) {
    console.error('[PermitWatch] not started:', err.message);
    return;
  }
  // Recipients are looked up on each pass, so a teammate added in the admin panel is picked up
  // without a restart. Nothing is sent while the list is empty.
  recipients().then(({ emails, phones }) => {
    if (!emails.length && !phones.length) {
      console.warn('[PermitWatch] nobody to alert yet — add an email or number in admin → Developer');
    }
  }).catch(() => {});
  timer = setInterval(tick, cfg.tickMinutes * 60 * 1000);
  if (timer.unref) timer.unref();
  setTimeout(tick, 60 * 1000).unref?.();
  console.log(`[PermitWatch] ticking every ${cfg.tickMinutes} min (news pages ${cfg.newsIntervalMinutes} min, rest ${cfg.intervalMinutes} min)`);
}

module.exports = { runOnce, checkPage, startWorker, loadConfig, extract, diffLines, sendWhatsApp, discoverPages, recipients, deliver, storage, openButton, watchedPages, savedConfig };
