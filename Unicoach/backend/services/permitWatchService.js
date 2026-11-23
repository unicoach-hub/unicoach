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
const STATE_DIR = path.join(__dirname, '..', 'data', 'permit-watch');

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
    intervalMinutes: Number(process.env.PERMIT_WATCH_INTERVAL_MINUTES || cfg.intervalMinutes) || 20,
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

/** Where the alert goes. Never hardcoded: it has to be in the environment. */
const recipient = () => (process.env.PERMIT_WATCH_EMAIL_TO || process.env.ALERT_EMAIL_TO || '').trim();

/** WhatsApp number for the same alert. Empty = WhatsApp off, email only. */
const waRecipient = () => (process.env.PERMIT_WATCH_WHATSAPP_TO || process.env.ALERT_WHATSAPP_TO || '').trim();

const slugFor = (url) => url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 120).toLowerCase();
const statePath = (url) => path.join(STATE_DIR, `${slugFor(url)}.json`);

async function readState(url) {
  try {
    return JSON.parse(await fsp.readFile(statePath(url), 'utf8'));
  } catch {
    return null;
  }
}

async function writeState(url, state) {
  await fsp.mkdir(STATE_DIR, { recursive: true });
  await fsp.writeFile(statePath(url), JSON.stringify(state, null, 2));
}

// ---------------------------------------------------------------- fetching

/** One GET with a timeout. Throws on a non-2xx response so the retry loop can back off. */
async function fetchOnce(url, cfg) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.requestTimeoutMs);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': cfg.userAgent,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-IE,en;q=0.9',
      },
    });
    if (!res.ok) {
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
async function fetchWithRetries(url, cfg) {
  let lastErr;
  for (let attempt = 1; attempt <= cfg.retriesPerPage; attempt += 1) {
    try {
      return await fetchOnce(url, cfg);
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
async function sendWhatsApp(text, { dryRun = false } = {}) {
  const to = waRecipient();
  if (!to) return false;

  const { normalizePhone } = require('../utils/twilio');
  const phone = normalizePhone(to).replace(/^\+/, '');
  const oneLine = text.replace(/\s*\n\s*/g, ' · ').trim();

  if (dryRun) {
    console.log(`[PermitWatch] (dry run) would WhatsApp ${phone}: ${oneLine.slice(0, 160)}`);
    return false;
  }

  const settings = await wabaSettings();
  if (!settings) return false;

  const templateName = (process.env.PERMIT_WATCH_WA_TEMPLATE || '').trim();
  const payload = templateName
    ? {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
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
      to: phone,
      type: 'text',
      text: { body: text.slice(0, 3500) },
    };

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${settings.wabaPhoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${settings.wabaAccessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error?.message || `Meta API error ${res.status}`);
    console.log(`[PermitWatch] WhatsApp sent to ${phone}`);
    return true;
  } catch (err) {
    const hint = /re-?engag|24 hour|outside|template/i.test(err.message)
      ? ' — outside the 24-hour window; set PERMIT_WATCH_WA_TEMPLATE to an approved template'
      : '';
    console.warn(`[PermitWatch] WhatsApp not sent: ${err.message}${hint}`);
    return false;
  }
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

async function deliver({ subject, html, dryRun }) {
  const to = recipient();
  if (!to) {
    console.warn('[PermitWatch] No ALERT_EMAIL_TO / PERMIT_WATCH_EMAIL_TO set — email not sent:', subject);
    return false;
  }
  if (dryRun) {
    console.log(`[PermitWatch] (dry run) would email ${to}: ${subject}`);
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
    html = await fetchWithRetries(page.url, cfg);
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

/** Checks every enabled page, one at a time with a pause in between. */
async function runOnce({ dryRun = false } = {}) {
  const cfg = loadConfig();
  const results = [];
  for (const [index, page] of cfg.pages.entries()) {
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
  if (!recipient() && !waRecipient()) {
    console.warn('[PermitWatch] not started: both ALERT_EMAIL_TO and ALERT_WHATSAPP_TO are empty');
    return;
  }
  timer = setInterval(tick, cfg.intervalMinutes * 60 * 1000);
  if (timer.unref) timer.unref();
  setTimeout(tick, 60 * 1000).unref?.();
  const targets = [recipient(), waRecipient() && `WhatsApp ${waRecipient()}`].filter(Boolean).join(' + ');
  console.log(`[PermitWatch] watching ${cfg.pages.length} page(s) every ${cfg.intervalMinutes} min → ${targets}`);
}

module.exports = { runOnce, checkPage, startWorker, loadConfig, extract, diffLines, sendWhatsApp };
