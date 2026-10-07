/**
 * Sync Dutch higher-education institutions (research universities + larger universities of applied sciences)
 * with official sources.
 *
 *   node scripts/dataSync/netherlandsSync.js                    # DRY RUN: fetch + match + report, writes nothing
 *   node scripts/dataSync/netherlandsSync.js --apply --plan <reviewed dry-run report.json>
 *                                                               # write the changes of this run, but only if they are
 *                                                               # exactly the changes of the reviewed dry run (else abort)
 *   node scripts/dataSync/netherlandsSync.js --revert <report.json>   # undo an APPLIED run (refuses dry-run reports)
 *
 * Options: --refresh (ignore the 7-day page cache), --max-scrapedo <n> (default 6 per run),
 *          --force (apply: write even though this run recorded source errors; revert: allow a report that was not
 *          written by --apply), --no-plan (apply without comparing against a reviewed dry-run report — not recommended).
 *
 * --apply recomputes everything from the (cached, 7 days) sources. With --plan it compares the creates / updates /
 * deactivations it computed (every field value, incl. the ECB rate used) with the reviewed dry-run report and writes
 * nothing if anything differs (re-run the dry run, review the new report, apply with that one). --apply also refuses to
 * write when this run recorded any source error (a transiently failed source must not rewrite stored values).
 *
 * Sources (all official):
 *  - DUO open data (onderwijsdata.duo.nl, CKAN datastore API), all from RIO (Registratie Instellingen en Opleidingen):
 *      · "Overzicht Erkenningen ho" = the CROHO register: every OCW-recognised programme per institution (current and
 *        future records) → institution code (BRIN), accredited Bachelor's/Master's programmes, funding status.
 *      · "Adressen in het hoger onderwijs" (instellingenho): OCW-funded HO institutions with seat (city) and type
 *        (wo = research university, hbo = university of applied sciences) → city, type PUBLIC.
 *      · "HO Opleidingsoverzicht": programmes as offered, incl. language of instruction (VOERTAAL) → English-taught.
 *  - Study in NL (Nuffic, the Dutch government-funded organisation for internationalisation in education):
 *      · Studyfinder API (studyinnl.org/api/programs) — "Independent and up-to-date overview of English-taught
 *        programmes in the Netherlands", supplied by the institutions → English-taught programme names, and per-programme
 *        non-EU ("international") tuition where the institution's own fee page cannot be read.
 *      · research-university / university-of-applied-sciences lists → official English names + websites.
 *  - Each institution's own official fee page / fee PDF, or its per-programme pages (UU, Radboud, NHL Stenden masters) →
 *    non-EU institutional tuition fee per programme / rate group / faculty (programme-weighted where the document allows).
 *  - DUO "Tuition fees" page → EU/EEA statutory fee (mentioned in the tuition text only).
 *  - ECB EUR→USD reference rate via api.frankfurter.app (no fallback rate: if unavailable, USD fields stay null).
 *
 * Every value read from a page is kept only when its verbatim quote is found in the fetched page/PDF text (report →
 * evidence). Ranking fields (rank, rankingNum, rankingSource) and requirement fields are never touched on existing
 * records. Records are never deleted: non-eligible / duplicate records get isActive:false. If the 'Netherlands' country
 * document does not exist it is created by --apply; --revert hides the run's created records (found by
 * dataSource.createdBySync + dataSource.createdRunId — both kept when a later run updates the record — so an interrupted
 * apply is undone too, and so is a create whose record a later run has updated) and REMOVES the country it created unless
 * documents other than those hidden records refer to it. NOTE: the hidden (isActive:false) records then still hold the
 * removed country's id (admin views show them without a country); this is deliberate — an empty 'Netherlands' would
 * otherwise stay listed by the public country endpoint (Country.find(), unfiltered). Revert later runs first (reverse
 * order) when several applied runs touched the same records. PDFs are read with `pdftotext` (poppler; ships with Git for Windows).
 * Reports and the page cache go to backend/reports/ (git-ignored), so re-runs cost no scrape.do credits.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const ARGS = process.argv.slice(2);
const APPLY = ARGS.includes('--apply');
const REFRESH = ARGS.includes('--refresh');
const FORCE = ARGS.includes('--force');
const NO_PLAN = ARGS.includes('--no-plan');
const argValue = (flag) => { const i = ARGS.indexOf(flag); return i !== -1 ? ARGS[i + 1] : undefined; };
const PLAN = argValue('--plan');
const MAX_SCRAPEDO = Number(argValue('--max-scrapedo') ?? 6);
const SYNC_ID = 'netherlandsSync';
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');
const CACHE_DIR = path.join(REPORT_DIR, '.cache', 'netherlands');
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const CKAN = 'https://onderwijsdata.duo.nl/api/3/action';
const SINL = 'https://www.studyinnl.org';
const SINL_WO_LIST = `${SINL}/dutch-education/research-universities`;
const SINL_HBO_LIST = `${SINL}/dutch-education/universities-of-applied-sciences`;
const DUO_FEE_PAGE = 'https://duo.nl/particulier/tuition-fees.jsp';
const DUO_STATUTORY_QUOTE = 'In the 2026-2027 academic year, the statutory tuition fees are €2.694,-.';
const DUO_INSTITUTIONAL_QUOTE = 'If you do not meet all of the criteria for paying the statutory tuition fees, you will be charged the institutional tuition fees.';
const STATUTORY_EUR = 2694;
const FX_URL = 'https://api.frankfurter.app/latest?from=EUR&to=USD';
const { SCRAPE_DO_TOKEN } = process.env;
const RUN_ID = `nl-sync-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
const PROVIDER = 'DUO CROHO/RIO registers + Study in NL (Nuffic) + official institution fee pages';
const COURSE_CAP = 150;
const MIN_PAGE_SHARE = 0.75; // per level: share of official programme pages that must yield a fee before their median is used
const FEE_RANGE = [5000, 60000]; // yearly full-time fee sanity range (EUR)
const counters = { directRequests: 0, scrapeDoRequests: 0, cacheHits: 0 };
const fetchLog = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- text helpers ----------
const squash = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = (s) => fold(s).toLowerCase().replace(/[^a-z0-9.]+/g, ' ').replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2')
  .replace(/\s+/g, ' ').trim();
const digits = (s) => String(s ?? '').replace(/[^0-9]/g, '');
const money = (n) => Math.round(n).toLocaleString('en-US');
const titleCase = (s) => String(s || '').toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
const median = (arr) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const percentile = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))];
};
const hostOf = (url) => String(url || '').trim().toLowerCase().replace(/^https?:\/\//, '').split(/[/?#:]/)[0].replace(/^www\./, '');
const regDomain = (url) => {
  if (!url) return '';
  const parts = hostOf(url).split('.').filter(Boolean);
  return parts.slice(-2).join('.');
};
// programme-name key used to match course names against fee-document names: "Applied Sciences" ~ "Applied Science",
// "&" ~ "and", soft hyphens and " - Voltijd"/" - Fulltime" suffixes ignored
const stripVariantNoise = (s) => String(s ?? '').replace(/­/g, '').replace(/\s*-\s*(Voltijd|Fulltime|Full-time|Deeltijd|Part-time|Duaal|Dual)\s*$/i, '')
  .replace(/\s*\((?:Master|Bachelor)\)\s*$/i, '');
const nameKey = (s) => norm(stripVariantNoise(s).replace(/&/g, ' and ')).split(' ').map((w) => (w.length > 3 ? w.replace(/s$/, '') : w)).join(' ');
const PRE_MASTER = /pre-?\s?master|premaster|schakel/i;
// "€ 19.906" / "€19,906" / "10.528,-" / "18300" → 19906 / 19906 / 10528 / 18300
const parseEur = (s) => {
  const t = String(s ?? '').replace(/[€\s]/g, '').replace(/[.,-]+$/, '');
  if (/^\d{1,3}([.,]\d{3})+$/.test(t)) return Number(t.replace(/[.,]/g, ''));
  if (/^\d{4,6}$/.test(t)) return Number(t);
  return NaN;
};

// ---------------------------------------------------------------- HTTP with cache + scrape.do fallback ----------
const isBlocked = (status, body) => status === 403 || status === 429 || status === 503
  || /<title>\s*(Just a moment|Attention Required|Access Blocked|Toegang geblokkeerd|Security verification)/i.test(String(body).slice(0, 30000));

async function getPage(url, { scrapeDo = false, timeoutMs = 60000, politeMs = 0 } = {}) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, `${crypto.createHash('sha1').update(url).digest('hex')}.json`);
  if (!REFRESH && fs.existsSync(file)) {
    const cached = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS) {
      counters.cacheHits += 1;
      fetchLog.push({ url, via: `cache (${cached.via}, ${cached.fetchedAt})` });
      return cached;
    }
  }
  if (politeMs) await sleep(politeMs); // many small pages from one site (programme pages): be polite
  let status = 0;
  let buf = Buffer.alloc(0);
  let contentType = '';
  let finalUrl = url;
  let via = 'direct';
  let lastError = '';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml,application/json,application/pdf;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-GB,en;q=0.9,nl;q=0.5' },
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
      });
      counters.directRequests += 1;
      status = res.status;
      finalUrl = res.url || url;
      contentType = res.headers.get('content-type') || '';
      buf = Buffer.from(await res.arrayBuffer());
      lastError = '';
      break;
    } catch (err) {
      lastError = err.cause?.code || err.name || err.message;
      if (attempt < 2) await sleep(2000);
    }
  }
  const isBinary = (ct) => /pdf|octet-stream|spreadsheet|zip/i.test(ct);
  // Some WAFs reject Node's TLS client but serve a plain curl request (e.g. nhlstenden.com programme pages): still a direct
  // request with a normal User-Agent, tried before scrape.do credits are spent
  if (lastError || isBlocked(status, isBinary(contentType) ? '' : buf.toString('utf8'))) {
    const tmp = path.join(os.tmpdir(), `nl-sync-${crypto.randomBytes(6).toString('hex')}.bin`);
    try {
      const out = execFileSync('curl', ['-sL', '-A', BROWSER_UA, '-H', 'Accept-Language: en-GB,en;q=0.9', '--max-time', String(Math.ceil(timeoutMs / 1000)), '-o', tmp, '-w', '%{http_code}\t%{content_type}\t%{url_effective}', url], { maxBuffer: 1024 * 1024 }).toString('utf8');
      counters.directRequests += 1;
      const [code, ct, eff] = out.split('\t');
      const body = fs.existsSync(tmp) ? fs.readFileSync(tmp) : Buffer.alloc(0);
      if (Number(code) >= 200 && Number(code) < 300 && !isBlocked(Number(code), isBinary(ct) ? '' : body.toString('utf8'))) {
        status = Number(code); contentType = ct || ''; finalUrl = eff || url; buf = body; lastError = ''; via = 'direct (curl)';
      }
    } catch { /* curl missing or failed → scrape.do below (if allowed) */ } finally { fs.rmSync(tmp, { force: true }); }
  }
  if (lastError || isBlocked(status, isBinary(contentType) ? '' : buf.toString('utf8'))) {
    if (!scrapeDo) throw new Error(`${url} not reachable directly (${lastError || `HTTP ${status}, blocked`})`);
    if (!SCRAPE_DO_TOKEN) throw new Error('SCRAPE_DO_TOKEN missing in .env');
    if (counters.scrapeDoRequests >= MAX_SCRAPEDO) throw new Error(`scrape.do budget for this run (${MAX_SCRAPEDO}) reached before ${url}`);
    counters.scrapeDoRequests += 1;
    try {
      const res = await fetch(`https://api.scrape.do/?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(120000) });
      status = res.status;
      contentType = res.headers.get('content-type') || '';
      buf = Buffer.from(await res.arrayBuffer());
    } catch (err) {
      throw new Error(`scrape.do request failed for ${url} (${err.cause?.code || 'network error'})`); // never echo the API URL (token)
    }
    via = 'scrape.do';
    finalUrl = url;
    if (isBlocked(status, isBinary(contentType) ? '' : buf.toString('utf8'))) throw new Error(`${url} still blocked via scrape.do (HTTP ${status})`);
  }
  if (status < 200 || status >= 300) throw new Error(`HTTP ${status} for ${url}`);
  const binary = isBinary(contentType);
  const entry = { url, finalUrl, via, status, contentType, fetchedAt: new Date().toISOString(), encoding: binary ? 'base64' : 'utf8', body: binary ? buf.toString('base64') : buf.toString('utf8') };
  fs.writeFileSync(file, JSON.stringify(entry));
  fetchLog.push({ url, via, status });
  return entry;
}

// Document = fetched page with its visible text (HTML) or extracted text (PDF, `pdftotext -raw`)
function asDoc(page) {
  if (page._doc) return page._doc;
  let text;
  let lines = [];
  let layoutLines = [];
  let title = '';
  let html = null;
  if (page.encoding === 'base64') {
    const tmp = path.join(os.tmpdir(), `nl-sync-${crypto.randomBytes(6).toString('hex')}.pdf`);
    fs.writeFileSync(tmp, Buffer.from(page.body, 'base64'));
    try {
      const raw = execFileSync('pdftotext', ['-raw', tmp, '-'], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
      lines = raw.split(/\r?\n/).map((l) => l.replace(/\s+$/, ''));
      text = squash(raw);
      // layout mode keeps table columns at their horizontal position (needed for column tables, e.g. Zuyd rate groups)
      layoutLines = execFileSync('pdftotext', ['-layout', tmp, '-'], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8').split(/\r?\n/).map((l) => l.replace(/\s+$/, ''));
    } catch (err) {
      throw new Error(`pdftotext failed for ${page.url} (${err.code === 'ENOENT' ? 'pdftotext not installed' : err.message})`);
    } finally { fs.rmSync(tmp, { force: true }); }
  } else {
    html = String(page.body);
    const $ = cheerio.load(html.replace(/>/g, '> '));
    title = squash($('title').first().text());
    $('head,script,style,noscript,svg,iframe').remove();
    text = squash($.root().text());
  }
  page._doc = { url: page.url, finalUrl: page.finalUrl, via: page.via, title, text, normText: norm(text), lines, layoutLines, html };
  return page._doc;
}
const inDoc = (doc, quote) => Boolean(quote) && doc.normText.includes(norm(quote));

async function getJson(url, opts) {
  const page = await getPage(url, opts);
  return { page, json: JSON.parse(page.body) };
}

async function eurToUsd() {
  let lastError = '';
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(FX_URL, { headers: { 'User-Agent': BROWSER_UA }, signal: AbortSignal.timeout(30000) });
      const j = await res.json();
      if (j?.rates?.USD) return { base: 'EUR', quote: 'USD', rate: j.rates.USD, date: j.date, source: 'ECB reference rate via api.frankfurter.app', url: FX_URL };
      lastError = 'no EUR→USD rate in response';
    } catch (err) { lastError = err.cause?.code || err.message; }
    await sleep(3000 * attempt);
  }
  throw new Error(`frankfurter.app: ${lastError}`);
}

// ---------------------------------------------------------------- DUO open data (CKAN) ----------
async function ckanDataset(id, resourceName, { fields, filters } = {}) {
  const { page: pkgPage, json: pkg } = await getJson(`${CKAN}/package_show?id=${encodeURIComponent(id)}`);
  const ds = pkg.result;
  const res = ds.resources.find((r) => resourceName.test(r.name) && r.datastore_active);
  if (!res) throw new Error(`DUO dataset ${id}: no datastore resource matching ${resourceName}`);
  const records = [];
  let total = null;
  for (let offset = 0; total === null || offset < total; offset += 32000) {
    const params = new URLSearchParams({ resource_id: res.id, limit: '32000', offset: String(offset) });
    if (fields) params.set('fields', fields.join(','));
    if (filters) params.set('filters', JSON.stringify(filters));
    const { json } = await getJson(`${CKAN}/datastore_search?${params.toString()}`, { timeoutMs: 300000 });
    if (!json.success) throw new Error(`DUO datastore_search failed for ${id}`);
    total = json.result.total;
    records.push(...json.result.records);
    if (!json.result.records.length) break;
  }
  if (records.length !== total) throw new Error(`DUO dataset ${id}: read ${records.length} of ${total} records`);
  return {
    id, title: ds.title, modified: ds.metadata_modified, notes: ds.notes, packageUrl: pkgPage.url, packageDoc: { normText: norm(ds.notes || '') },
    resource: { id: res.id, name: res.name, url: res.url, lastModified: res.last_modified }, records,
  };
}

// ---------------------------------------------------------------- Study in NL (Nuffic) ----------
const sinlUrl = (institution) => `${SINL}/api/programs?${new URLSearchParams([['filters[institution][]', institution], ['limit', '500'], ['offset', '0']]).toString()}`;
async function studyInNl(institution) {
  const url = sinlUrl(institution);
  const page = await getPage(url);
  const data = JSON.parse(page.body)?.data;
  if (!data) throw new Error(`Study in NL: unexpected response for ${institution}`);
  if (data.programs.length !== data.totalAmount) throw new Error(`Study in NL: got ${data.programs.length} of ${data.totalAmount} programmes for ${institution}`);
  return { url, page, programs: data.programs };
}

// ---------------------------------------------------------------- institutions in scope ----------
// brin = DUO institution code (instellingscode). rio = RIO 'onderwijsbestuur' name (language of instruction data).
// sinl = institution name in the Study in NL Studyfinder. fees = official sources, in priority order per level.
const EXCLUDE_FROM_MEDIAN = /\bmedicine\b(?!\s+and\b)|geneeskunde|dentistry|tandheelkunde|veterinary|diergeneeskunde|medical cent(?:er|re)|physician/i;
// "Faculty of Medicine (AMC): Bachelor's in Medical Informatics" is not a medicine degree; "Faculty of Dentistry: Bachelor's" is
const isSpecialist = (programme) => {
  const m = String(programme).match(/^([^:]{3,80}): (.+)$/);
  return m ? EXCLUDE_FROM_MEDIAN.test(m[2]) || /dentistry|tandheelkunde/i.test(m[1]) : EXCLUDE_FROM_MEDIAN.test(programme);
};

const pairRows = (doc, segment, level, { labelFilter, labelPrefix = '', extra = {} } = {}) => {
  const rows = [];
  let last = 0;
  for (const m of segment.matchAll(/€\s?(\d{1,3}(?:[.,]\d{3})+)(?:,-)?/g)) {
    const label = squash(segment.slice(last, m.index));
    const quote = squash(segment.slice(last, m.index + m[0].length));
    last = m.index + m[0].length;
    if (!label || label.length > 140 || (labelFilter && !labelFilter.test(label))) continue;
    const lvl = typeof level === 'function' ? level(label) : level;
    if (!lvl) continue;
    rows.push(feeRow(doc, lvl, `${labelPrefix}${label}`, m[1], quote, extra));
  }
  return rows;
};
// Programme-weighted fees: every English-taught course of the institution (ctx.courseItems: English name + RIO/CROHO
// register names) gets the fee of the official rate group that names it; courses with a register name that no exception
// group names get the standard rate (`standard`). Courses known only by a Study in NL marketing name that match no group
// stay unmapped (they could be a renamed exception) and are listed in the report instead of being guessed.
// groups: [{ label, amountStr|null (null = no numeric fee, e.g. a footnote), quote, matches(course) → bool }]
function programmeRows(doc, ctx, level, groups, standard) {
  const rows = [];
  for (const c of ctx.courseItems.filter((x) => x.level === level)) {
    const hits = groups.filter((g) => g.matches(c));
    const amounts = [...new Set(hits.map((h) => h.amountStr))];
    if (amounts.length > 1) { ctx.unmapped.push(`${level} ${c.name}: named in several rate groups (${hits.map((h) => h.label).join(' / ')})`); continue; }
    if (hits.length && !hits[0].amountStr) { ctx.unmapped.push(`${level} ${c.name}: ${hits[0].label}${hits[0].why ? ` — ${hits[0].why}` : ' has no numeric fee in the document'}`); continue; }
    if (hits.length) rows.push(feeRow(doc, level, c.name, hits[0].amountStr, hits[0].quote, { scope: 'programme', rateGroup: hits[0].label, memberQuote: hits[0].memberQuote?.(c) ?? null }));
    else if (standard && c.official) rows.push(feeRow(doc, level, c.name, standard.amountStr, standard.quote, { scope: 'programme', rateGroup: 'standard rate (not named in any exception group)' }));
    else ctx.unmapped.push(`${level} ${c.name}: ${standard ? 'no DUO register name to compare with the exception lists' : 'not named in any rate group'} — left out of range/median`);
  }
  return rows;
}
const courseKeys = (c) => new Set([c.name, ...c.aliases].map(nameKey).filter(Boolean));
// Institution-wide fee tables (VU / UM PDFs, UvA faculty table) also list Dutch-taught programmes (teacher-training,
// Dutch law, notarial law, ...). A row that names a programme is kept only if it is one of the institution's
// English-taught programmes (ctx.courseItems: Study in NL + RIO language ENG), matched on the CROHO code (VU) or on the
// programme name / its "Programme: track" base / its name without a parenthesis. Faculty-wide rows that name no programme
// ("Faculty of Science: Master's (two years)") cannot be checked and stay. Excluded rows stay in the report.
const looseKeys = (names) => new Set(names.filter(Boolean).flatMap((n) => [n, n.split(': ')[0], n.split(': ').slice(1).join(': '), n.split(' - ')[0], n.replace(/\s*\([^)]*\)/g, ' ')])
  .map((n) => nameKey(squash(n))).filter((k) => k.length >= 3));
function markEnglishTaught(rows, ctx) {
  const items = ctx.courseItems.map((c) => ({ c, keys: looseKeys([c.name, ...c.aliases]), codes: new Set(c.codes || []) }));
  for (const r of rows) {
    let t = String(r.programme);
    if (r.faculty && t.startsWith(`${r.faculty}: `)) t = t.slice(r.faculty.length + 2);
    t = squash(t.replace(/^[BM] /, '').replace(/^(?:Bachelor|Master)(?:'s|’s)?\b\s*(?:in\s+)?/i, '').replace(/\s*\*+\s*$/, ''));
    const programmeName = squash(t.replace(/\s*\([^)]*\)/g, ' '));
    if (!programmeName && !r.crohoCode) { r.englishTaught = 'faculty-wide rate (names no programme; not checkable)'; continue; }
    const rowKeys = looseKeys([t, t.replace(/\s*\((?:joint degree|research|\d+ EC)\)/gi, '')]);
    const hit = items.find(({ c, keys, codes }) => c.level === r.level && ((r.crohoCode && codes.has(r.crohoCode)) || [...rowKeys].some((k) => keys.has(k))));
    if (hit) r.englishTaught = `${hit.c.level} ${hit.c.name}${r.crohoCode && hit.codes.has(r.crohoCode) ? ` (CROHO ${r.crohoCode})` : ''}`;
    else { r.englishTaught = false; r.notEnglishTaught = true; }
  }
  return rows;
}
const segmentOf = (text, start, ends, maxLen = 4000) => {
  const i = text.search(start);
  if (i < 0) return null;
  const rest = text.slice(i);
  let end = Math.min(rest.length, maxLen);
  for (const e of ends) {
    const j = rest.slice(1).search(e);
    if (j >= 0 && j + 1 < end) end = j + 1;
  }
  return rest.slice(0, end);
};
function feeRow(doc, level, programme, amountStr, quote, extra = {}) {
  const amountEUR = parseEur(amountStr);
  return {
    level, programme: squash(programme), amountEUR, url: doc.url, quote: squash(quote),
    verified: inDoc(doc, quote) && digits(quote).includes(digits(amountStr)) && amountEUR >= FEE_RANGE[0] && amountEUR <= FEE_RANGE[1],
    ...extra,
  };
}
const must = (doc, re, what) => {
  const m = doc.text.match(re);
  if (!m) throw new Error(`${what}: expected text not found on ${doc.url} (page layout changed?)`);
  return m;
};

const INSTITUTIONS = [
  // ---------------- research universities (wo)
  {
    key: 'uva', kind: 'wo', brin: '21PK', name: 'University of Amsterdam', sinl: 'University of Amsterdam', rio: /^Universiteit van Amsterdam$/,
    website: 'https://www.uva.nl', feeYear: '2026/27',
    fees: [{
      kind: 'page', url: 'https://www.uva.nl/en/education/fees-and-funding/tuition-fees/tuition-fees.html', levels: ['bachelor', 'master'], englishOnly: true,
      parse(doc) {
        must(doc, /Statutory tuition fees 2026-2027/, 'UvA fee year');
        const rows = [];
        const heads = [...doc.text.matchAll(/(Faculty of [A-Z][A-Za-z ]+?(?: \(AMC\))?|Amsterdam Law School|Amsterdam University College \(AUC\)) Institutional tuition fee for second/g)];
        for (const m of doc.text.matchAll(/Institutional fee for non-EEA students /g)) {
          const seg = segmentOf(doc.text.slice(m.index), /Institutional fee for non-EEA students/, [/Institutional tuition fee for second/, /Questions and/, /\* Joint|\* The institutional|\*\* Joint/], 1500);
          const head = heads.filter((h) => h.index < m.index).pop();
          const faculty = head ? head[1] : 'Faculty of Humanities';
          rows.push(...pairRows(doc, seg.replace(/^Institutional fee for non-EEA students /, ''), (l) => (/^(Bachelor|Liberal Arts)/i.test(l) ? 'bachelor' : /^(Master|Tinbergen Institute Master)/i.test(l) ? 'master' : null),
            // faculty-level rows: identical sub-rows of one faculty (Science: Bachelor's / Chemistry / Physics, all 21,800) count once in the median
            { labelFilter: /^(Bachelor|Master|Liberal Arts|Tinbergen)/i, labelPrefix: `${faculty}: `, extra: { faculty } }));
        }
        return rows;
      },
    }],
  },
  {
    key: 'vu', kind: 'wo', brin: '21PL', name: 'Vrije Universiteit Amsterdam', sinl: 'Vrije Universiteit Amsterdam', rio: /Vrije Universiteit$/,
    website: 'https://vu.nl', feeYear: '2026/27',
    fees: [
      { kind: 'pdf', url: 'https://assets-eu-01.kc-usercontent.com:443/ff31ad68-341e-015e-fb52-24df7a00ecea/a274c255-4dc8-4bd8-95d3-7cc801165c09/2026_Instellingscollegeld_Bachelor_EN.pdf', levels: ['bachelor'], englishOnly: true, linkedFrom: 'https://vu.nl/en/education/more-about/tuition-fee-rates-bachelor-s-programmes', parse: (doc) => vuPdf(doc, 'B') },
      { kind: 'pdf', url: 'https://assets-eu-01.kc-usercontent.com:443/ff31ad68-341e-015e-fb52-24df7a00ecea/91cf92fc-fc42-45fe-b1d0-ca70de4db4c9/2026_Instellingscollegeld_Master_EN.pdf', levels: ['master'], englishOnly: true, linkedFrom: 'https://vu.nl/en/education/more-about/tuition-fee-rates-masters', parse: (doc) => vuPdf(doc, 'M') },
    ],
  },
  {
    key: 'leiden', kind: 'wo', brin: '21PB', name: 'Leiden University', sinl: 'Leiden University', rio: /^Universiteit Leiden$/,
    website: 'https://www.universiteitleiden.nl', feeYear: '2027/28',
    feeYearNote: 'Leiden publishes only 2027/28 rates now (bachelor page); master rates are the 2027 values in Study in NL to match',
    fees: [
      {
        kind: 'page', url: 'https://www.universiteitleiden.nl/en/education/admission-and-application/bachelors/tuition-fee', scrapeDo: true, levels: ['bachelor'],
        parse(doc) {
          const seg = segmentOf(doc.text, /not nationals of an EEA country, Suriname or Switzerland Faculty Tariffs academic year 2027-2028/, [/Second Dutch bachelor/], 1500);
          if (!seg) throw new Error('Leiden: non-EEA 2027-2028 tariff table not found');
          const body = seg.replace(/^.*?Faculty Tariffs academic year 2027-2028 /, '');
          return pairRows(doc, body, 'bachelor', { labelFilter: /^Faculty of /, labelPrefix: '' })
            .map((r) => (/Biomedical Sciences - Medicine/.test(r.programme) ? { ...r, programme: 'LUMC: Biomedical Sciences' } : r));
          // LUC (tuition + separate additional fee) and the second amount of the Medicine row (no label) are skipped
        },
      },
      { kind: 'studyinnl', levels: ['master'], years: [2027] },
    ],
  },
  {
    key: 'uu', kind: 'wo', brin: '21PD', name: 'Utrecht University', sinl: 'Utrecht University', rio: /^Universiteit Utrecht$/, website: 'https://www.uu.nl',
    feeYearNote: "uu.nl programme pages show Master's fees for 2026-2027 and Bachelor's fees for 2027-2028 (the year each page publishes now)",
    fees: [
      // official per-programme pages (the "Key facts → Tuition fees" block), one per English-taught programme listed in Study in NL
      { kind: 'programmePages', levels: ['bachelor', 'master'], pages: (ctx) => sinlProgrammePages(ctx, /(^|\.)uu\.nl$/, { resolve: uuEnglishUrl }), parse: uuProgrammeFee },
      { kind: 'studyinnl', levels: ['bachelor', 'master'] }, // used only for a level without any official programme fee
    ],
  },
  {
    key: 'rug', kind: 'wo', brin: '21PC', name: 'University of Groningen', sinl: 'University of Groningen', rio: /^Rijksuniversiteit Groningen$/, website: 'https://www.rug.nl',
    fees: [{ kind: 'studyinnl', levels: ['bachelor', 'master'], corroborate: 'https://www.rug.nl/about-ug/organization/rules-and-regulations/general/ric-2026-2027-eng-def.pdf' }],
  },
  {
    key: 'eur', kind: 'wo', brin: '21PE', name: 'Erasmus University Rotterdam', sinl: 'Erasmus University Rotterdam', rio: /^Erasmus Universiteit Rotterdam$/,
    website: 'https://www.eur.nl', feeYear: '2026/27',
    fees: [{
      kind: 'page', url: 'https://www.eur.nl/en/education/practical-matters/registration/tuition-fee/tuition-fee-2026-2027', levels: ['bachelor', 'master'],
      parse(doc) {
        const rows = [];
        const parts = [
          ['bachelor', segmentOf(doc.text, /Institutional fees bachelor 2026-2027/, [/Institutional fees master 2026-2027/, /Fee & Finances/], 3000)],
          ['master', segmentOf(doc.text, /Institutional fees master 2026-2027/, [/Deviating rates Research Master: /, /Transitional|Requirements:|in 2025-2026, the institutional fee/], 3000)],
        ];
        for (const [level, seg] of parts) {
          if (!seg) throw new Error(`EUR: ${level} fee section not found`);
          let last = 0;
          for (const m of seg.matchAll(/(?:EEA Students and )?Non-EEA Students: €\s?(\d{1,2}\.\d{3})/gi)) {
            const before = seg.slice(last, m.index);
            const quote = squash(seg.slice(last, m.index + m[0].length));
            last = m.index + m[0].length;
            const label = squash(before.replace(/\bEEA Students:\s*€\s?[\d.,]+-?/gi, ' ').replace(/^.*€\s?[\d.,]+[,\-*]*/, '')
              .replace(/Deviating rates|Institutional fees (bachelor|master) 2026-2027\.?/gi, '')).replace(/^[.:,\s]+|[.:,\s]+$/g, '');
            if (!label || /part-?time/i.test(label)) continue;
            // single-programme "deviating rates" (research master, joint European master) are listed but kept out of range/median
            rows.push(feeRow(doc, level, label, m[1], quote, /^(Research master|Joint degree)/i.test(label) ? { deviating: true } : {}));
          }
        }
        return rows;
      },
    }],
  },
  {
    key: 'ru', kind: 'wo', brin: '21PM', name: 'Radboud University', sinl: 'Radboud University', rio: /Radboud Universiteit Nijmegen$/, website: 'https://www.ru.nl',
    feeYearNote: 'ru.nl programme tuition pages publish only 2027-2028 rates now ("The institutional tuition fees are still subject to change")',
    fees: [
      // official per-programme "/tuition" subpages (static HTML), one per English-taught programme listed in Study in NL
      { kind: 'programmePages', levels: ['bachelor', 'master'], pages: (ctx) => sinlProgrammePages(ctx, /(^|\.)ru\.nl$/, { resolve: ruTuitionUrl }), parse: ruProgrammeFee },
      { kind: 'studyinnl', levels: ['bachelor', 'master'], yearMode: 'perProgrammeLatest' }, // fallback only
    ],
  },
  { key: 'tiu', kind: 'wo', brin: '21PN', name: 'Tilburg University', sinl: 'Tilburg University', rio: /^Stichting Katholieke Universiteit Brabant$/, website: 'https://www.tilburguniversity.edu', fees: [{ kind: 'studyinnl', levels: ['bachelor', 'master'] }] },
  {
    key: 'um', kind: 'wo', brin: '21PJ', name: 'Maastricht University', sinl: 'Maastricht University', rio: /^Maastricht University$/, website: 'https://www.maastrichtuniversity.nl', feeYear: '2026/27',
    fees: [{
      kind: 'pdf', url: 'https://www.maastrichtuniversity.nl/file/overzicht-instellingstarieven-bachelors-en-masters-2026-270pdf', levels: ['bachelor', 'master'], englishOnly: true,
      parse(doc) {
        must(doc, /Institutional Tuition Fees Bachelor's programmes Academic year 2026-2027/, 'UM fee year');
        const rows = [];
        let level = null;
        for (const line of doc.lines) {
          if (/Institutional Tuition Fees Bachelor's programmes/i.test(line)) { level = 'bachelor'; continue; }
          if (/Institutional Tuition Fees Master's programmes/i.test(line)) { level = 'master'; continue; }
          if (!level || /^(Name|Academic year)/.test(line)) continue;
          const m = line.match(/^(.+?)\s+(\d{2},\d{3})(?:\s+(?:\d{2},\d{3}|-))?$/);
          if (!m) continue;
          rows.push(feeRow(doc, level, m[1].split('/')[0], m[2], line, { basis: level === 'master' ? 'full-time column' : undefined, scope: 'programme' }));
        }
        return rows;
      },
    }],
  },
  {
    key: 'tud', kind: 'wo', brin: '21PF', name: 'Delft University of Technology', sinl: 'Delft University of Technology', rio: /^Technische Universiteit Delft$/, website: 'https://www.tudelft.nl', feeYear: '2026/27',
    fees: [{
      kind: 'page', url: 'https://www.tudelft.nl/en/education/study-programme-orientation/practical-matters/tuition-fee-finances', levels: ['bachelor', 'master'],
      parse(doc) {
        const m = must(doc, /Institutional rate 2026\/2027 2027\/2028 Institutional rate BSc € ?([\d.]+) MSc € ?([\d.]+)/, 'TU Delft institutional rate');
        return [feeRow(doc, 'bachelor', 'All BSc programmes (institutional rate)', m[1], m[0]), feeRow(doc, 'master', 'All MSc programmes (institutional rate)', m[2], m[0])];
      },
    }],
  },
  {
    key: 'tue', kind: 'wo', brin: '21PG', name: 'Eindhoven University of Technology', sinl: 'Eindhoven University of Technology', rio: /^Technische Universiteit Eindhoven$/, website: 'https://www.tue.nl', feeYear: '2026/27',
    fees: [{
      kind: 'page', url: 'https://www.tue.nl/en/education/become-a-tue-student/tuition-fees-and-other-study-costs/tuition-fee', levels: ['bachelor', 'master'],
      parse(doc) {
        const m = must(doc, /2026-2027 2027-2028 Institutional fee for bachelor.s students € ?([\d,]+) € ?[\d,]+ Institutional fee for master.s students € ?([\d,]+)/, 'TU/e institutional fee');
        return [feeRow(doc, 'bachelor', "Institutional fee for bachelor's students", m[1], m[0]), feeRow(doc, 'master', "Institutional fee for master's students", m[2], m[0])];
      },
    }],
  },
  {
    key: 'ut', kind: 'wo', brin: '21PH', name: 'University of Twente', sinl: 'University of Twente', rio: /^Universiteit Twente$/, website: 'https://www.utwente.nl', feeYear: '2026/27',
    fees: [
      {
        kind: 'page', url: 'https://www.utwente.nl/en/education/bachelor/study-costs/tuition-fees/', levels: ['bachelor'],
        parse(doc) {
          const m = must(doc, /2026-2027 \(Sep-Aug\) 2027-2028 \(Sep-Aug\) Fulltime lower rate bachelor.s € ?([\d,]+) per year € ?[\d,]+ per year Fulltime higher rate bachelor.s € ?([\d,]+) per year/, 'UT bachelor rates');
          return utTierRows(doc, 'bachelor', m);
        },
      },
      {
        kind: 'page', url: 'https://www.utwente.nl/en/education/master/costs-of-studying/tuition-fees/', levels: ['master'],
        parse(doc) {
          const m = must(doc, /2026-2027 \(Sep-Aug\) 2027-2028 \(Sep-Aug\) Fulltime lower rate master.s € ?([\d,]+) per year € ?[\d,]+ per year Fulltime higher rate master.s € ?([\d,]+) per year/, 'UT master rates');
          return utTierRows(doc, 'master', m);
        },
      },
    ],
  },
  {
    key: 'wur', kind: 'wo', brin: '21PI', name: 'Wageningen University & Research', sinl: 'Wageningen University & Research', rio: /^Wageningen University$/, website: 'https://www.wur.nl', feeYear: '2026/27',
    fees: [{
      kind: 'pdf', url: 'https://backend.wur.nl/sites/default/files/2026-05/Summary-Tuition-Fees%20-2026-2027.pdf', levels: ['bachelor', 'master'],
      parse(doc) {
        must(doc, /TUITION FEES 2026-2027 SUMMARY/, 'WUR fee year');
        const b = must(doc, /Institutional Tuition Fee 3 \(non-NL\/EEA\/SME3 students\) (\d{4,6}) You do not fulfil the nationality requirement/, 'WUR bachelor');
        const m = must(doc, /Institutional Tuition Fee 3 \(cohort 2026\) \(non-NL\/EEA\/SME3 students who start their master.s in 2026-2027\) (\d{4,6})/, 'WUR master');
        const w = doc.text.match(/\(non-NL\/EEA\/SME3 students who start with MWT in 2026-2027\) (\d{4,6})/);
        return [
          feeRow(doc, 'bachelor', "All bachelor's programmes (non-NL/EEA/SME)", b[1], b[0]),
          feeRow(doc, 'master', "Full-time master's programmes (non-NL/EEA/SME, cohort 2026)", m[1], m[0]),
          // one joint programme only: widens the range, not the median (all other masters pay the cohort-2026 rate)
          ...(w ? [feeRow(doc, 'master', 'MSc Water Technology (joint degree WU/UT/RUG)', w[1], w[0], { rangeOnly: true })] : []),
        ];
      },
    }],
  },
  // ---------------- universities of applied sciences (hbo)
  {
    key: 'hanze', kind: 'hbo', brin: '25BE', name: 'Hanze University of Applied Sciences', sinl: 'Hanze University of Applied Sciences', rio: /Hanzehogeschool Groningen$/, website: 'https://www.hanze.nl',
    // Hanze's own fee page has no amounts (a Formdesk calculator iframe); its 2026-2027 English programmes brochure states the
    // 2025-2026 non-EU fee only. Study in NL is therefore the only source of the 2026-27 amount → flagged as unverified.
    feeCaveat: "Hanze's own fee pages publish no 2026-27 amount (www.hanze.nl/en/study/studying-at-hanze/calculate-your-tuition-fees is a Formdesk calculator); the amount comes only from Study in NL (fee type 'international'). Hanze's own brochure confirms that type is the non-EU fee (2025-26: 9,302 non-EU; 9,750 for the two European energy masters) but not the 2026-27 figure.",
    fees: [{
      kind: 'studyinnl', levels: ['bachelor', 'master'],
      corroborate: 'https://www.hanze.nl/binaries/_cb_1726654611184/content/assets/hanze/en/studying/986-bama_2565_v2_hve_web.pdf',
      corroborateQuotes: ['year 2025-2026 are set at 2,601 for EU/EEA students and 9,302 for non-EU/EEA students', 'Management and Renewable Energy (9,750 for non-EU/EEA students)'],
    }],
  },
  {
    key: 'fontys', kind: 'hbo', brin: '30GB', name: 'Fontys University of Applied Sciences', sinl: 'Fontys University of Applied Sciences', rio: /^Stichting Fontys$/, website: 'https://www.fontys.nl', feeYear: '2026/27',
    fees: [{
      kind: 'pdf', url: 'https://www.fontys.nl/en/Download-4/Tuition-Fees-Regulations-2026-2027.htm', levels: ['bachelor', 'master'], linkedFrom: 'https://www.fontys.nl/en/Study-at-Fontys/Practical-information/Finance.htm',
      parse: (doc, ctx) => fontysRows(doc, ctx),
    }],
  },
  {
    key: 'saxion', kind: 'hbo', brin: '23AH', name: 'Saxion University of Applied Sciences', sinl: null, rio: /^Stichting Saxion$/, website: 'https://www.saxion.edu', feeYear: '2026/27',
    fees: [{
      kind: 'page', url: 'https://www.saxion.edu/studying-in-the-netherlands/finance-your-studies/total-costs', levels: ['bachelor'],
      parse(doc) {
        const m = must(doc, /Non-EU\/EEA students 2026 - 2027 Description Bachelor \/ Short Degree programme Master programme Exchange programme Tuition fee The costs of the course € ?([\d,]+)/, 'Saxion non-EU 2026-2027 table');
        return [feeRow(doc, 'bachelor', 'Bachelor / Short Degree programme (non-EU/EEA)', m[1], m[0])];
        // Master: "Depends on the study programme" → left null
      },
    }],
  },
  {
    key: 'thuas', kind: 'hbo', brin: '27UM', name: 'The Hague University of Applied Sciences', sinl: 'The Hague University of Applied Sciences', rio: /Hoger Beroepsonderwijs Haaglanden$/, website: 'https://www.thuas.com', feeYear: '2026/27',
    fees: [{
      kind: 'page', url: 'https://www.thuas.com/study-choice/applications-finances-and-moving-here/tuition-fees', levels: ['bachelor', 'master'],
      parse(doc) {
        const b = must(doc, /2025-2026 2026-2027 Statutory tuition fee € ?[\d.]+,- € ?[\d.]+,- Institutional tuition fee € ?[\d.]+,- € ?([\d.]+),-/, 'THUAS institutional fee');
        const m = must(doc, /full-time English-taught master.s programme with us and you are required to pay the institutional tuition fee, you will pay €([\d,]+)/, 'THUAS English-taught master fee');
        return [feeRow(doc, 'bachelor', 'Institutional tuition fee (bachelor)', b[1], b[0]), feeRow(doc, 'master', 'Full-time English-taught master’s programmes', m[1], m[0])];
      },
    }],
  },
  {
    key: 'auas', kind: 'hbo', brin: '28DN', name: 'Amsterdam University of Applied Sciences', sinl: 'Amsterdam University of Applied Sciences', rio: /^Stichting Hogeschool van Amsterdam$/, website: 'https://www.amsterdamuas.com', feeYear: '2026/27',
    fees: [{
      kind: 'page', url: 'https://www.amsterdamuas.com/study/international-admissions/tuition-fees/tuition-fees', levels: ['bachelor', 'master'],
      parse(doc) {
        if (!/Tuition fees 2026-2027/.test(doc.title)) throw new Error('AUAS: page is not the 2026-2027 fee page');
        const g = must(doc, /Institutional tuition fees: €([\d,]+)/, 'AUAS institutional fee');
        const esp = doc.text.match(/For the European School of Physiotherapy \(ESP\) the institutional tuition fee is €([\d,]+)/);
        return [
          feeRow(doc, 'bachelor', 'Institutional tuition fee (all programmes)', g[1], g[0]),
          ...(esp ? [feeRow(doc, 'bachelor', 'European School of Physiotherapy (ESP)', esp[1], esp[0], { rangeOnly: true })] : []),
          feeRow(doc, 'master', 'Institutional tuition fee (all programmes)', g[1], g[0]),
        ];
      },
    }],
  },
  { key: 'rotterdam', kind: 'hbo', brin: '22OJ', name: 'Rotterdam University of Applied Sciences', sinl: 'Rotterdam University of Applied Sciences', rio: /^Stichting Hogeschool Rotterdam$/, website: 'https://www.rotterdamuas.com', fees: [{ kind: 'studyinnl', levels: ['bachelor', 'master'] }] },
  {
    key: 'han', kind: 'hbo', brin: '25KB', name: 'HAN University of Applied Sciences', sinl: 'HAN University of Applied Sciences', rio: /Hogeschool van Arnhem en Nijmegen$/, website: 'https://www.hanuniversity.com', feeYear: '2026/27',
    fees: [{
      kind: 'page', url: 'https://www.hanuniversity.com/en/study-and-living/costs/tuition-fee/', levels: ['bachelor', 'master'],
      parse(doc) {
        const rows = [];
        const parts = [
          ['bachelor', segmentOf(doc.text, /Tuition fees 2026-2027 Bachelor degrees/, [/Go to the DUO website/], 2500)],
          ['master', segmentOf(doc.text, /tuition fees for master degrees in the 2026-2027 academic year/, [/Go to the DUO website/], 2500)],
        ];
        for (const [level, seg] of parts) {
          if (!seg) throw new Error(`HAN: ${level} table not found`);
          const body = seg.slice(seg.indexOf('NON-EU/EEA') + 'NON-EU/EEA'.length);
          for (const m of body.matchAll(/([A-Z][A-Za-z&()'’ ,-]+?)\*? € 2,694 € ([\d,]+)/g)) rows.push(feeRow(doc, level, m[1], m[2], m[0], { scope: 'programme' }));
        }
        return rows;
      },
    }],
  },
  {
    key: 'avans', kind: 'hbo', brin: '07GR', name: 'Avans University of Applied Sciences', sinl: 'Avans University of Applied Sciences', rio: /^Stichting Avans$/, website: 'https://www.avans.nl', feeYear: '2026/27',
    fees: [{
      kind: 'page', url: 'https://www.avans.nl/en/int/studying/practical-information/tuition-fees', levels: ['bachelor', 'master'],
      parse(doc) {
        const m = must(doc, /The following tuition fees apply for the 2026-2027 academic year\. Bachelor.s and master.s degree students .{0,120}?Non-EEA nationality \(institutional tuition fee\) €([\d.,]+)/, 'Avans institutional fee');
        return [feeRow(doc, 'bachelor', "Bachelor's degree students, non-EEA nationality", m[1], m[0]), feeRow(doc, 'master', "Master's degree students, non-EEA nationality", m[1], m[0])];
      },
    }],
  },
  {
    key: 'inholland', kind: 'hbo', brin: '27PZ', name: 'Inholland University of Applied Sciences', sinl: 'Inholland University of Applied Sciences', rio: /^Stichting Hoger Onderwijs Nederland$/, website: 'https://www.inholland.nl', feeYear: '2026/27',
    fees: [{
      kind: 'page', url: 'https://www.inholland.nl/inhollandcom/admissions-and-aid/tuition-fee/', levels: ['bachelor', 'master'],
      parse(doc) {
        const m = must(doc, /Institutional Tuition Fee for Non-EU\/EEA Students 2026.2027 The institutional tuition fee for 2026.2027 is €([\d.,]+)/, 'Inholland institutional fee');
        return [feeRow(doc, 'bachelor', 'Institutional tuition fee (non-EU/EEA)', m[1], m[0]), feeRow(doc, 'master', 'Institutional tuition fee (non-EU/EEA)', m[1], m[0])];
      },
    }],
  },
  {
    key: 'buas', kind: 'hbo', brin: '21UI', name: 'Breda University of Applied Sciences', sinl: 'Breda University of Applied Sciences', rio: /Breda University of Applied Sciences$/, website: 'https://www.buas.nl',
    fees: [{
      kind: 'studyinnl', levels: ['bachelor', 'master'], allowInstitutional: true,
      rule: { url: 'https://www.buas.nl/en/programmes/creative-business/study-costs', scrapeDo: true, quote: 'non-EU students pay the institutional tuition fees' },
    }],
  },
  {
    key: 'nhlstenden', kind: 'hbo', brin: '31FR', name: 'NHL Stenden University of Applied Sciences', sinl: 'NHL Stenden University of Applied Sciences', rio: /NHL Stenden Hogeschool$/, website: 'https://www.nhlstenden.com', feeYear: '2026/27',
    fees: [{
      kind: 'page', url: 'https://www.nhlstenden.com/en/practical-information/tuition-fees/institutional-tuition-fee', scrapeDo: true, levels: ['bachelor', 'master'],
      parse(doc) {
        const m = must(doc, /Fulltime 2026-2027 2027-2028 Bachelor.s € ?([\d,]+) € ?[\d,]+ Associate degree € ?[\d,]+ € ?[\d,]+ Master.s € ?([\d,]+)\*/, 'NHL Stenden institutional fees');
        const ex1 = doc.text.match(/Master full-time International Leisure and Tourism Studies International Hospitality and Service Management € ?([\d,]+)/);
        const ex2 = doc.text.match(/Master full-time Content & Media Strategy € ?([\d,]+)/);
        // Master's: the per-programme pages below give each English-taught master's own fee; these rows are context
        // (they are used only if no programme page can be read)
        return [
          feeRow(doc, 'bachelor', "Bachelor's (full-time)", m[1], m[0]),
          feeRow(doc, 'master', "Master's (full-time, standard)", m[2], m[0]),
          ...(ex1 ? [feeRow(doc, 'master', 'Master International Leisure and Tourism Studies / International Hospitality and Service Management', ex1[1], ex1[0], { rangeOnly: true })] : []),
          ...(ex2 ? [feeRow(doc, 'master', 'Master Content & Media Strategy', ex2[1], ex2[0], { rangeOnly: true })] : []),
        ];
      },
    }, {
      // official "fees & admissions" page of each English-taught full-time master (CROHO/RIO names); the institutional fee
      // page names two exceptions by their former names (ILTS / IHSM), so the programmes' own pages are used instead
      kind: 'programmePages', levels: ['master'],
      pages: () => [
        ['Computer Vision & Data Science', 'https://www.nhlstenden.com/en/courses/computer-vision-data-science-ma/fees-and-admissions'],
        ['Content & Media Strategy', 'https://www.nhlstenden.com/en/courses/content-and-media-strategy-ma/fees-and-admissions'],
        ['International Leisure, Tourism & Events Management', 'https://www.nhlstenden.com/en/courses/international-leisure-tourism-and-events-ma/fees-and-admissions'],
        ['Sustainable Innovation in Hospitality', 'https://www.nhlstenden.com/en/courses/master-sustainable-innovation-in-hospitality/fees-and-admissions'],
      ].map(([programme, url]) => ({ level: 'master', programme, url })),
      parse(doc, pg) {
        const m = doc.text.match(/2026-2027 EU students \/? ?Statutory tuition fees \(per year\) € ?[\d,.]+ NON-EU students \/? ?Institutional tuition fees \(per year\) € ?(\d{1,2}[.,]\d{3})/);
        return m ? feeRow(doc, pg.level, pg.programme, m[1], m[0], { scope: 'programme', year: '2026/27' }) : null;
      },
    }],
  },
  {
    key: 'zuyd', kind: 'hbo', brin: '25JX', name: 'Zuyd University of Applied Sciences', sinl: 'Zuyd University of Applied Sciences', rio: /^Stichting Zuyd Hogeschool$/, website: 'https://www.zuyd.nl', feeYear: '2026/27',
    fees: [{
      kind: 'pdf', url: 'https://www.zuyd.nl/sites/default/files/2026-01/Tuition%20fees%20and%20examination%20fees%202026-2027%20EN%203.0.pdf', levels: ['bachelor', 'master'],
      parse: (doc, ctx) => zuydRows(doc, ctx),
    }],
  },
];

// VU institutional fee PDFs: "60045 M Environment and Resource Management 31.430 34.440" (2nd Dutch degree, NON-EEA)
function vuPdf(doc, letter) {
  must(doc, /INSTITUTIONAL TUITION FEES (BACHELOR|MASTER) PROGRAMMES 2026-2027/i, 'VU fee year');
  if (!/NON-?-?EEA/i.test(doc.text)) throw new Error('VU: NON-EEA column not found');
  const rows = [];
  for (const line of doc.lines) {
    const m = squash(line).match(new RegExp(`^(\\d{5}) ${letter} (.+?) (\\d{1,2}\\.\\d{3}) (\\d{1,2}\\.\\d{3})$`));
    if (!m) continue;
    rows.push(feeRow(doc, letter === 'B' ? 'bachelor' : 'master', `${letter} ${m[2]}`, m[4], squash(line), { crohoCode: m[1], basis: 'NON-EEA column', scope: 'programme' }));
  }
  return rows;
}

// UT: two rate tiers; the page lists the programmes of each tier ("Lower rate programmes" / "Higher rate programmes") →
// one row per listed programme, so the median is weighted by programmes, not by tiers
function utTierRows(doc, level, m) {
  const $ = cheerio.load(doc.html || '');
  const rows = [];
  for (const [heading, amount] of [['Lower rate programmes', m[1]], ['Higher rate programmes', m[2]]]) {
    const h = $('h4,h3,h5,strong').filter((_, e) => squash($(e).text()) === heading).first();
    const items = h.nextAll('ul').first().find('li').map((_, li) => squash($(li).text())).get().filter(Boolean);
    if (!items.length) throw new Error(`UT ${level}: list "${heading}" not found`);
    const listQuote = `${heading} ${items.join(' ')}`;
    const listOk = inDoc(doc, listQuote);
    for (const p of items) {
      const r = feeRow(doc, level, p, amount, m[0], { scope: 'programme', rateGroup: heading, memberQuote: listQuote });
      if (!listOk) r.verified = false;
      rows.push(r);
    }
  }
  return rows;
}

// Fontys Tuition Fees Regulations: "Full-time 10.210 with the exception of the following programmes:" followed by groups
// ("Bachelor (Fontys Academy of the Arts): B ... 13.080", "Master (Fontys Academy of the Arts): M Music M Performing Public
// Space 8.980", ...). In the `pdftotext -raw` text each group's amount follows the group; a group without its own amount
// continues the table cell of the group before it (the Engineering/ICT masters and the second Engineering bachelor column).
function fontysRows(doc, ctx) {
  must(doc, /DO NOT meet the nationality requirement/, 'Fontys institutional fee section');
  const std = must(doc, /Full-time (\d{1,2}\.\d{3}) with the exception of the following programmes:/, 'Fontys full-time standard rate');
  const L = doc.lines.map(squash);
  const start = L.findIndex((l, i) => l === 'with the exception of the following programmes:' && L.slice(Math.max(0, i - 3), i).includes('Full-time'));
  const end = L.findIndex((l, i) => i > start && /^Part-$/.test(l));
  if (start < 0 || end < 0) throw new Error('Fontys: full-time exception block not found (layout changed?)');
  const groups = [];
  let g = null;
  let item = null;
  const pushItem = () => { if (item && g) g.items.push(item); item = null; };
  for (const line of L.slice(start + 1, end)) {
    if (!line) continue;
    const am = line.match(/^(?:(.*?)\s+)?(\d{1,2}\.\d{3}|\[\d\])$/);
    const body = am ? (am[1] || '') : line;
    if (/^(Bachelor|Master)\b/.test(body)) { pushItem(); g = { header: body, items: [], amount: null, lines: [line] }; groups.push(g); }
    else if (g) {
      g.lines.push(line);
      if (/^[BM](?:\s*and\s*AD)?\s+\S/.test(body)) { pushItem(); item = { level: body[0] === 'B' ? 'bachelor' : 'master', text: body.replace(/^[BM](?:\s*and\s*AD)?\s+/, '') }; }
      else if (body) { if (item) item.text += ` ${body}`; else g.header += ` ${body}`; }
    }
    if (am && g) { pushItem(); if (!g.amount) g.amount = am[2]; }
  }
  pushItem();
  if (!groups.length) throw new Error('Fontys: no exception groups parsed');
  groups.forEach((x, i) => {
    x.quote = squash(x.lines.join(' '));
    if (!x.amount && i > 0) { x.amount = groups[i - 1].amount; x.quote = `${groups[i - 1].quote} ${x.quote}`; x.inherited = true; }
    for (const it of x.items) {
      const t = it.text.replace(/\s*\[\d\]\s*/g, ' ').trim();
      const pm = t.match(/^(.*?)\s*\((.+)\)$/);
      const dutch = (pm ? pm[1] : t).replace(/\s+and\s+AD-?\S*$/i, '').trim();
      const english = pm ? pm[2].replace(/([a-z])([A-Z])/g, '$1 $2').trim() : null;
      it.names = [dutch, english].filter(Boolean);
    }
  });
  ctx.feeGroups = groups.map((x) => ({ header: x.header, amount: x.amount, inherited: Boolean(x.inherited), items: x.items.map((it) => `${it.level === 'bachelor' ? 'B' : 'M'} ${it.names.join(' / ')}`) }));
  const defs = groups.map((x) => ({
    label: `${x.header} (${x.amount})`, amountStr: /^\d/.test(x.amount || '') ? x.amount : null, quote: x.quote,
    matches: (c) => { const keys = courseKeys(c); return x.items.some((it) => it.level === c.level && it.names.some((n) => keys.has(nameKey(n)))); },
  }));
  const standard = { amountStr: std[1], quote: std[0] };
  return [...programmeRows(doc, ctx, 'bachelor', defs, standard), ...programmeRows(doc, ctx, 'master', defs, standard)];
}

// Zuyd: "rate groups ... Low 10,210 High 12,280 Top 13,940" + a three-column table (Low | High | Top) that names the
// programmes per degree type; read with `pdftotext -layout` and split at the column positions of the header line
function zuydRows(doc, ctx) {
  const m = must(doc, /rate groups for 2026\W{1,3}2027 are as follows: Low ([\d,]+) High ([\d,]+) Top ([\d,]+)/, 'Zuyd rate groups');
  const L = doc.layoutLines;
  const h = L.findIndex((l) => /^\s*Low\s{2,}High\s{2,}Top\s*$/.test(l));
  if (h < 0) throw new Error('Zuyd: rate-group table header (Low / High / Top) not found in the layout text');
  const names = ['Low', 'High', 'Top'];
  const starts = names.map((n) => L[h].indexOf(n));
  const endRel = L.slice(h + 1).findIndex((l) => /Tuition fees and examination fees of Zuyd/.test(l));
  const cells = Object.fromEntries(names.map((n) => [n, {}]));
  const section = {};
  for (const line of L.slice(h + 1, endRel < 0 ? undefined : h + 1 + endRel)) {
    names.forEach((n, ci) => {
      const part = squash(line.slice(starts[ci], ci + 1 < starts.length ? starts[ci + 1] : undefined));
      if (!part) return;
      if (/^(Associate degree|Bachelor's degree|Master's degree)$/.test(part)) { section[n] = part; return; }
      if (section[n]) (cells[n][section[n]] ||= []).push(part);
    });
  }
  if (!cells.Low["Bachelor's degree"]?.length) throw new Error('Zuyd: rate-group table columns could not be read');
  ctx.feeGroups = names.map((n) => ({ group: n, ...cells[n] }));
  // a course matches a column when one to four consecutive lines of that column/section spell one of its names
  const find = (n, c) => {
    const lines = cells[n][c.level === 'master' ? "Master's degree" : "Bachelor's degree"] || [];
    const cand = new Set([...courseKeys(c)].flatMap((k) => (c.level === 'master' ? [k, nameKey(`Master ${k}`), nameKey(`Master of ${k}`)] : [k])));
    for (let i = 0; i < lines.length; i += 1) {
      for (let j = i; j < Math.min(lines.length, i + 4); j += 1) {
        const joined = lines.slice(i, j + 1).join(' ');
        if (cand.has(nameKey(joined))) return joined;
      }
    }
    return null;
  };
  const defs = names.map((n, i) => ({
    label: `rate group ${n}`, amountStr: m[i + 1], quote: m[0], matches: (c) => Boolean(find(n, c)),
    memberQuote: (c) => `pdftotext -layout, column "${n}", ${c.level === 'master' ? "Master's" : "Bachelor's"} degree: "${find(n, c)}"`,
  }));
  // Section 3 "Institutional tuition fees for non-funded study programmes" (not in the rate-group table; one fee for every
  // student): "b. 13,850 for the Master's in Scientific Illustration." A fee that "covers the full two-year duration" of a
  // programme (FREM) is not a yearly fee → named, but no amount is used for it.
  const nf = segmentOf(doc.text, /The institutional tuition fees for non-funded full-time study programmes are as follows:/, [/Part-time study programmes/], 5000);
  if (!nf) throw new Error('Zuyd: section 3 (non-funded full-time programmes) not found');
  const nfItems = [...nf.matchAll(/\b[a-z]\. (\d{1,2},\d{3}) for the (Master|Bachelor)[’']s in (.+?)(?: study programme)?(?: \((?:abbreviated )?[A-Z]{2,}\))?[;.]/g)]
    .map((x, i, all) => {
      const itemText = nf.slice(x.index, i + 1 < all.length ? all[i + 1].index : undefined);
      const wholeProgramme = /covers the full [a-z-]+ duration/i.test(itemText);
      return { level: x[2] === 'Master' ? 'master' : 'bachelor', name: squash(x[3]), amountStr: wholeProgramme ? null : x[1], quote: squash(x[0]), wholeProgramme };
    });
  if (!nfItems.length) throw new Error('Zuyd: no non-funded full-time programme fee found in section 3');
  ctx.feeGroups.push({ group: 'non-funded (section 3)', items: nfItems.map((x) => `${x.level} ${x.name}: ${x.wholeProgramme ? 'fee for the whole programme, not per year' : x.amountStr}`) });
  for (const x of nfItems) {
    defs.push({
      label: `non-funded programme: ${x.name}`, amountStr: x.amountStr, quote: x.quote,
      why: x.wholeProgramme ? `the fee in section 3 covers the whole programme, not one year ("${x.quote}")` : null,
      matches: (c) => c.level === x.level && courseKeys(c).has(nameKey(x.name)),
    });
  }
  return [...programmeRows(doc, ctx, 'bachelor', defs, null), ...programmeRows(doc, ctx, 'master', defs, null)];
}

// Official programme pages for the English-taught programmes Study in NL lists (its `website` link = the institution's page)
async function sinlProgrammePages(ctx, hostRe, { resolve } = {}) {
  const out = [];
  const seen = new Set();
  for (const p of ctx.sinlEnglish) {
    if (PRE_MASTER.test(p.name)) continue;
    let url = String(p.website || '').trim().replace(/^http:\/\//i, 'https://');
    if (!url || !hostRe.test(hostOf(url)) || url.includes('?')) { ctx.pageSkips.push(`${p.type} ${p.name}: Study in NL link "${url || 'none'}" is not a programme page of ${ctx.entry.website}`); continue; }
    if (resolve) {
      try { url = await resolve(url); } catch (err) { ctx.pageSkips.push(`${p.type} ${p.name}: ${err.message}`); continue; }
    }
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ level: p.type === 'Bachelor' ? 'bachelor' : 'master', programme: squash(p.name), url, sinlId: p.id });
  }
  return out;
}
// Some Study in NL links to uu.nl ("uu.nl/bachelors/economics-and-business-economics") redirect to the Dutch page, which has
// no non-EU fee → use the English page of the same (English) slug instead
async function uuEnglishUrl(url) {
  const page = await getPage(url, { politeMs: 250, timeoutMs: 30000 });
  const final = String(page.finalUrl || url);
  if (/uu\.nl\/(en\/|(bachelors|masters)\/en\/)/.test(final) || !/uu\.nl\/(bachelors|masters)\//.test(final)) return url;
  const m = url.match(/uu\.nl\/(?:en\/)?(bachelors|masters)\/(?:en\/)?([^/?#]+)\/?$/);
  if (!m) return url;
  return `https://www.uu.nl/en/${m[1]}/${m[2]}`;
}
async function ruTuitionUrl(url) {
  const page = await getPage(url, { politeMs: 300, timeoutMs: 30000 });
  const final = String(page.finalUrl || url).split(/[?#]/)[0].replace(/\/$/, '');
  if (!/ru\.nl\/en\/education\/(masters|bachelors)\/[^/]+$/.test(final)) throw new Error(`Study in NL link ${url} leads to ${final}, not a programme page`);
  return `${final}/tuition`;
}
// uu.nl "Key facts → Tuition fees: … More information about fees" block, e.g.
//   Master's  "Non-EU/EEA students (institutional fee) 2026-2027: € 21,342" (some pages without "€")
//   Bachelor's "Institutional fee 2027-2028: € 15,039 (EU/EEA), € 15,100 (non-EU/EEA)"
//   UCU "2027-2028: € 5,750 (EU/EEA), € 21,587 (EU/EEA with a Dutch Ba/Ma degree), € 21,600 (non EU/EEA)"
// The whole block is the quote (it holds both the year and the non-EU amount).
function uuProgrammeFee(doc, pg) {
  const block = doc.text.match(/Tuition fees: (.{0,500}?) More information about fees/);
  if (!block) return null;
  const b = block[1];
  const quote = `Tuition fees: ${b}`;
  let m = b.match(/Non-EU\/EEA students \(institutional fee\),? (\d{4})-(\d{4}):? (?:€ ?)?(\d{1,3}[.,]\d{3})\b/i);
  if (m) return feeRow(doc, pg.level, pg.programme, m[3], quote, { scope: 'programme', year: `${m[1]}/${m[2].slice(2)}` });
  m = b.match(/(?:€ ?)?(\d{1,3}[.,]\d{3}),? \(non[- ]?EU\/EEA\)/i);
  if (!m) return null;
  const years = [...b.slice(0, m.index).matchAll(/(\d{4})-(\d{4})/g)];
  if (!years.length) return null;
  const y = years[years.length - 1];
  return feeRow(doc, pg.level, pg.programme, m[1], quote, { scope: 'programme', year: `${y[1]}/${y[2].slice(2)}` });
}
// ru.nl ".../tuition": "Academic year 2027 - 2028 Statutory tuition fee €2,771.00 Institutional tuition fee EEA €19,330.00*
// Institutional tuition fee non-EEA €25,118.00*"
function ruProgrammeFee(doc, pg) {
  const m = doc.text.match(/Academic year (\d{4}) - (\d{4}) Statutory tuition fee € ?[\d,.]+ Institutional tuition fee EEA € ?[\d,.]+\*? Institutional tuition fee non-EEA € ?(\d{1,3},\d{3})(?:\.\d\d)?\*?/);
  return m ? feeRow(doc, pg.level, pg.programme, m[3], m[0], { scope: 'programme', year: `${m[1]}/${m[2].slice(2)}` }) : null;
}

// ---------------------------------------------------------------- Study in NL fee rows ----------
function sinlFeeRows(entry, sinl, src) {
  const progs = sinl.programs.filter((p) => ['Bachelor', 'Master'].includes(p.type) && p.full_time === 1 && (p.languages || []).some((l) => l.name === 'English') && !PRE_MASTER.test(p.name));
  const pick = (p, year, type) => (p.tuitions || []).find((t) => t.year === year && t.program_form === 'fulltime' && t.period === 'year' && t.tuition_fee_type === type);
  const types = src.allowInstitutional ? ['international', 'institutional'] : ['international'];
  const years = src.years || [2026, 2027];
  const counts = years.map((y) => progs.filter((p) => types.some((t) => pick(p, y, t))).length);
  const year = years[counts.indexOf(Math.max(...counts))];
  const rows = [];
  const seen = new Set();
  for (const p of progs) {
    const level = p.type === 'Bachelor' ? 'bachelor' : 'master';
    if (!src.levels.includes(level)) continue;
    // default: the year with most records (one consistent fee year); 'perProgrammeLatest': each programme's latest year
    const pYear = src.yearMode === 'perProgrammeLatest' ? [...years].reverse().find((y) => types.some((tt) => pick(p, y, tt))) : year;
    if (!pYear) continue;
    const type = types.find((tt) => pick(p, pYear, tt));
    if (!type) continue;
    const t = pick(p, pYear, type);
    const key = `${level}|${norm(p.name)}|${t.amount}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const quote = JSON.stringify(t);
    rows.push({
      level, programme: squash(p.name), amountEUR: Number(t.amount), url: sinl.url, quote,
      verified: sinl.page.body.includes(quote) && sinl.page.body.includes(JSON.stringify(p.name).slice(1, -1)) && t.amount >= FEE_RANGE[0] && t.amount <= FEE_RANGE[1],
      basis: `Study in NL tuition record (${type}, ${pYear}, full-time, per year)`, feeType: type, sinlId: p.id,
      scope: 'programme', year: `${pYear}/${String(pYear + 1).slice(2)}`,
    });
  }
  return { rows, year, yearCounts: Object.fromEntries(years.map((y, i) => [y, counts[i]])), type: types.join('/') };
}

// Per level: official rows win over Study in NL rows; per-programme rows win over faculty/rate-group rows (those stay in
// the report as context). Range = min–max of the rows used (medicine/dentistry/veterinary and single-programme
// "deviating" rates excluded); median over programmes, or over distinct faculty rates for faculty-level tables.
function summariseFees(rows, level) {
  // rows of institution-wide fee tables that name a programme which is not English-taught (markEnglishTaught) are left out
  const notEnglish = rows.filter((r) => r.level === level && r.verified && r.notEnglishTaught);
  const lvl = rows.filter((r) => r.level === level && r.verified && !r.notEnglishTaught);
  if (!lvl.length) return null;
  const official = lvl.filter((r) => r.source === 'official');
  const bySource = official.length ? official : lvl;
  const programmeLevel = bySource.filter((r) => r.scope === 'programme');
  let pool = programmeLevel.length ? programmeLevel : bySource;
  // one fee year per level: per-programme pages may still show an older year on a few pages → those rows are left out
  const yearCount = pool.reduce((a, r) => (r.year ? { ...a, [r.year]: (a[r.year] || 0) + 1 } : a), {});
  const mainYear = Object.entries(yearCount).sort((a, b) => b[1] - a[1] || b[0].localeCompare(a[0]))[0]?.[0];
  const otherYear = mainYear ? pool.filter((r) => r.year && r.year !== mainYear) : [];
  if (otherYear.length) pool = pool.filter((r) => !r.year || r.year === mainYear);
  const used = [];
  const excluded = [];
  const seen = new Set();
  for (const r of pool) {
    const k = r.scope === 'programme' ? `p|${norm(r.programme)}|${r.amountEUR}` : `g|${r.faculty ? norm(r.faculty) : norm(r.programme)}|${r.amountEUR}`;
    if (seen.has(k)) continue;
    seen.add(k);
    (isSpecialist(r.programme) || r.deviating ? excluded : used).push(r);
  }
  if (!used.length) return null;
  const amounts = used.map((r) => r.amountEUR);
  const medianRows = used.filter((r) => !r.rangeOnly);
  const years = used.map((r) => r.year).filter(Boolean);
  const year = years.length ? Object.entries(years.reduce((a, y) => ({ ...a, [y]: (a[y] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1])[0][0] : null;
  const n = used.length;
  return {
    n, basis: programmeLevel.length ? 'programme' : 'group', source: official.length ? 'official' : 'studyinnl', year,
    min: Math.min(...amounts), max: Math.max(...amounts), rangeEUR: [Math.min(...amounts), Math.max(...amounts)],
    medianEUR: median((medianRows.length ? medianRows : used).map((r) => r.amountEUR)),
    medianBasis: `${programmeLevel.length ? `median of ${medianRows.length} programme fee(s)` : `median of ${medianRows.length} distinct faculty/rate-group fee(s)`}${medianRows.length < used.length ? ` (${used.length - medianRows.length} single-programme exception row(s) only widen the range)` : ''}`,
    p10p90EUR: n >= 10 ? [percentile(amounts, 0.1), percentile(amounts, 0.9)] : null,
    rowsNotUsed: lvl.length - pool.length, approxRows: used.filter((r) => r.approx).length,
    ...(otherYear.length ? { leftOutOtherFeeYear: otherYear.map((r) => `${r.programme} (EUR ${money(r.amountEUR)}, ${r.year})`) } : {}),
    excludedFromRange: excluded.map((r) => `${r.programme} (EUR ${money(r.amountEUR)})`),
    ...(notEnglish.length ? { excludedNotEnglishTaught: notEnglish.map((r) => `${r.programme} (EUR ${money(r.amountEUR)})`) } : {}),
  };
}

// ---------------------------------------------------------------- courses ----------
const QUAL_ABBR = {
  'master of science': 'MSc', 'master of arts': 'MA', 'master of laws': 'LLM', 'master of business administration': 'MBA', 'master of education': 'MEd',
  'master of music': 'MMus', 'master of fine arts': 'MFA', 'master of philosophy': 'MPhil', 'master of social work': 'MSW', 'master of architecture': 'MArch',
  'bachelor of science': 'BSc', 'bachelor of arts': 'BA', 'bachelor of laws': 'LLB', 'bachelor of business administration': 'BBA', 'bachelor of engineering': 'BEng',
  'bachelor of education': 'BEd', 'bachelor of music': 'BMus', 'bachelor of fine arts': 'BFA', 'bachelor of social work': 'BSW', 'bachelor of nursing': 'BN',
};
const TOEVOEGING = { OF_SCIENCE: ['BSc', 'MSc'], OF_ARTS: ['BA', 'MA'], OF_LAWS: ['LLB', 'LLM'], OF_BUSINESS_ADMINISTRATION: ['BBA', 'MBA'], OF_EDUCATION: ['BEd', 'MEd'], OF_SOCIAL_WORK: ['BSW', 'MSW'], OF_MUSIC: ['BMus', 'MMus'] };
const DEGREE_PREFIX = /^(?:(?:Double\s+)?(?:Bachelor|Master)(?:'s|’s)?(?:\s+of\s+(?:Science|Arts|Laws|Business Administration|Engineering|Education|Music|Fine Arts|Social Work|Nursing|Philosophy|Architecture))?|B|M|MSc|MA|BSc|BA|LLM|LLB|MBA|BBA)\s+(?:in\s+)?(?=[A-Z(])/;
const cleanCourseName = (s) => {
  // soft hyphens and RIO form suffixes ("Business Process Ana­ly­tics and Change - Voltijd") would create cosmetic duplicates
  let t = squash(stripVariantNoise(squash(s))).replace(/\s*\((?:ENG|EN|English)\)\s*$/i, '').replace(/\s+(?:VT|DT|DU)$/, '');
  const stripped = t.replace(DEGREE_PREFIX, '');
  if (stripped.length >= 3 && !/^Double /.test(t)) t = stripped;
  return squash(t);
};
const courseKey = (level, name) => `${level}|${norm(name.replace(/\(\d+\s*EC(?:TS)?\)/i, '').replace(/&/g, ' and '))}`;
// names a programme is known by (used to find it in fee documents): the name itself, its "Programme - track" base, and the
// RIO/CROHO register names (Dutch + international) of the RIO offering it came from
const aliasesOf = (...names) => names.filter(Boolean).map((n) => squash(stripVariantNoise(squash(n)))).flatMap((n) => [n, n.split(' - ')[0]]).filter((n) => n.length >= 2);

function buildCourses(entry, sinl, rioRows, crohoByUnit) {
  const items = new Map();
  const add = (level, name, abbr, source, aliases = [], codes = []) => {
    if (PRE_MASTER.test(name)) return; // pre-master / bridging programmes are not degree programmes
    const clean = cleanCourseName(name);
    if (!clean || clean.length < 3) return;
    const official = source !== 'Study in NL';
    const k = courseKey(level, clean);
    const merge = (c) => { c.sources.add(source); aliasesOf(name, ...aliases).forEach((a) => c.aliases.add(a)); codes.filter(Boolean).forEach((x) => c.codes.add(x)); if (official) c.official = true; };
    if (items.has(k)) { merge(items.get(k)); return; }
    // RIO adds only programmes Study in NL does not already list (same level, one name starts with the other, or one of the
    // offering's register names is the listed name — e.g. RIO "Hospitality Management" = Study in NL "Hotel Management")
    if (source !== 'Study in NL') {
      const nk = k.split('|')[1];
      const regKeys = new Set(aliases.filter(Boolean).map((a) => courseKey(level, cleanCourseName(a))));
      const dup = [...items.values()].find((c) => c.level === level && (regKeys.has(courseKey(level, c.name)) || (() => { const ck = courseKey(level, c.name).split('|')[1]; return nk.length >= 5 && ck.length >= 5 && (ck.startsWith(nk) || nk.startsWith(ck)); })()));
      if (dup) { merge(dup); return; }
    }
    items.set(k, { level, name: clean, abbr: abbr || (level === 'master' ? 'Master' : 'Bachelor'), sources: new Set([source]), aliases: new Set(aliasesOf(name, ...aliases)), codes: new Set(codes.filter(Boolean)), official });
  };
  for (const p of sinl?.programs || []) {
    if (!['Bachelor', 'Master'].includes(p.type) || p.full_time !== 1 || !(p.languages || []).some((l) => l.name === 'English')) continue;
    add(p.type === 'Bachelor' ? 'bachelor' : 'master', p.name, QUAL_ABBR[String(p.qualification || '').toLowerCase()], 'Study in NL');
  }
  for (const r of rioRows) {
    const level = /-BA$/.test(r.NIVEAU) ? 'bachelor' : 'master';
    const croho = crohoByUnit.get(r.OPLEIDINGSEENHEIDCODE);
    const tv = croho && TOEVOEGING[String(croho.GRAADTOEVOEGING || '').split(',')[0]];
    const english = r.INTERNATIONALE_NAAM || r.EIGENNAAM_ENGELS; // Dutch-only names are left out
    if (english) {
      add(level, english, tv ? tv[level === 'bachelor' ? 0 : 1] : null, 'RIO (DUO) language of instruction: English',
        [r.NAAM_LANG, r.INTERNATIONALE_NAAM, r.EIGENNAAM_ENGELS, croho?.OPLEIDINGSEENHEID_NAAM, croho?.OPLEIDINGSEENHEID_INTERNATIONALE_NAAM], [croho?.ERKENDEOPLEIDINGSCODE]);
    }
  }
  // Instrument/track variants ("Music - Classical music - Cello", ≥3 sharing a base name) collapse into the base programme
  const byBase = new Map();
  for (const [k, c] of items) {
    const base = c.name.split(' - ')[0];
    if (base === c.name) continue;
    const bk = `${c.level}|${base}`;
    if (!byBase.has(bk)) byBase.set(bk, []);
    byBase.get(bk).push(k);
  }
  for (const [bk, keys] of byBase) {
    if (keys.length < 3) continue;
    const first = items.get(keys[0]);
    const sources = new Set(keys.flatMap((k) => [...items.get(k).sources]));
    const aliases = new Set(keys.flatMap((k) => [...items.get(k).aliases]));
    const codes = new Set(keys.flatMap((k) => [...items.get(k).codes]));
    const official = keys.some((k) => items.get(k).official);
    keys.forEach((k) => items.delete(k));
    const k = courseKey(first.level, bk.split('|')[1]);
    if (!items.has(k)) items.set(k, { level: first.level, name: bk.split('|')[1], abbr: first.abbr, sources, aliases, codes, official, variants: keys.length });
    else { const c = items.get(k); sources.forEach((s) => c.sources.add(s)); aliases.forEach((a) => c.aliases.add(a)); codes.forEach((x) => c.codes.add(x)); c.official = c.official || official; }
  }
  const list = [...items.values()].sort((a, b) => (a.level === b.level ? a.name.localeCompare(b.name) : a.level === 'master' ? -1 : 1));
  return {
    items: list.map((c) => ({ level: c.level, name: c.name, aliases: [...c.aliases], codes: [...c.codes], official: Boolean(c.official) })),
    courses: list.slice(0, COURSE_CAP).map((c) => `${c.abbr} ${c.name}`),
    totalAvailable: list.length,
    degreeLevels: ["Bachelor's", "Master's"].filter((l) => list.some((c) => (l === "Bachelor's" ? c.level === 'bachelor' : c.level === 'master'))),
    bySource: { studyInNl: list.filter((c) => c.sources.has('Study in NL')).length, rioEnglish: list.filter((c) => !c.sources.has('Study in NL')).length },
  };
}

// ---------------------------------------------------------------- revert ----------
async function revert(reportFile) {
  const report = JSON.parse(fs.readFileSync(path.resolve(reportFile), 'utf8'));
  if (report.meta?.mode !== 'apply' && !FORCE) throw new Error('this report is from a dry run (nothing was written); pass --force to revert anyway');
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const col = db.collection('universities');
  let restored = 0;
  const restoreFailures = [];
  for (const c of [...(report.updates || []), ...(report.deactivations || [])]) {
    const set = {};
    const unset = {};
    for (const [k, v] of Object.entries(c.diff)) {
      if (v.from === undefined || (v.from === null && k === 'dataSource')) unset[k] = ''; else set[k] = v.from;
    }
    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    // only documents this run actually wrote carry its runId; a failed restore is reported and the revert goes on
    try {
      const r = await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id), 'dataSource.runId': report.runId }, update);
      restored += r.modifiedCount;
    } catch (err) { restoreFailures.push(`${c.name} (${c.id}): ${err.message}`); }
  }
  // Records created by this sync are hidden (isActive:false), never deleted. Selected by createdBySync + createdRunId (not
  // by the report's `inserted` flags), so an interrupted apply whose report lacks those flags is undone too. createdRunId
  // is stamped on creates and carried over by every later update/deactivation (dataSource.runId then names the later run),
  // so a create stays revertible after a later run touched the record. (runId fallback: records without createdRunId.)
  const createdFilter = {
    'dataSource.createdBySync': SYNC_ID,
    $or: [{ 'dataSource.createdRunId': report.runId }, { 'dataSource.createdRunId': { $exists: false }, 'dataSource.runId': report.runId }],
  };
  const hiddenRes = await col.updateMany({ ...createdFilter, isActive: { $ne: false } }, { $set: { isActive: false } });
  const hidden = hiddenRes.modifiedCount;
  // Country: if this run created it, it is removed unless something other than this run's own (now hidden) records refers
  // to it — otherwise an empty "Netherlands" would stay listed by the public country endpoint (Country.find(), unfiltered)
  let countryNote = 'no country was created by this run';
  if (report.country?.action === 'create') {
    const id = new mongoose.Types.ObjectId(report.country.id);
    const countryFilter = { _id: id, 'dataSource.createdBySync': SYNC_ID, 'dataSource.runId': report.runId };
    const ours = await db.collection('countries').findOne(countryFilter);
    if (!ours) countryNote = `country ${report.country.id} not found with createdBySync=${SYNC_ID} and runId=${report.runId} (never inserted, or already removed) — nothing to do`;
    else {
      const refs = {};
      for (const { name } of await db.listCollections().toArray()) {
        if (name === 'countries' || name.startsWith('system.')) continue;
        const q = { country: id };
        if (name === 'universities') q.$nor = [{ ...createdFilter, isActive: false }]; // this run's hidden creates do not count
        const n = await db.collection(name).countDocuments(q);
        if (n) refs[name] = n;
      }
      const ownHidden = await col.countDocuments({ country: id, ...createdFilter, isActive: false });
      if (Object.keys(refs).length) countryNote = `country "${ours.name}" kept: still referenced by documents not created by this run ${JSON.stringify(refs)}`;
      else {
        const r = await db.collection('countries').deleteOne(countryFilter);
        countryNote = r.deletedCount
          ? `country "${ours.name}" removed (created by this run; no other references)${ownHidden ? ` — NOTE: the ${ownHidden} hidden (isActive:false) records created by this run still hold its id ${id} and now reference a removed country` : ''}`
          : 'country not removed (filter no longer matched)';
      }
    }
  }
  console.log(`REVERTED: ${restored} updated/deactivated records restored, ${hidden} created records hidden (isActive:false); ${countryNote}. Report: ${reportFile}`);
  if (restoreFailures.length) console.log(`RESTORE FAILURES (${restoreFailures.length}):\n  ${restoreFailures.join('\n  ')}`);
  await mongoose.disconnect();
}

// ---------------------------------------------------------------- main ----------
(async () => {
  const revertIdx = ARGS.indexOf('--revert');
  if (revertIdx !== -1) return revert(ARGS[revertIdx + 1]);
  console.log(`DUO CROHO/RIO + Study in NL + institution fee pages → Netherlands (${APPLY ? 'APPLY' : 'DRY RUN, nothing is written'})`);
  const syncedAt = new Date();
  const uncertainties = [];
  const errors = [];

  let fx = null;
  try { fx = await eurToUsd(); } catch (err) { uncertainties.push(`FX rate unavailable (${err.message}); USD fee fields left null`); }
  console.log(`  EUR→USD ${fx ? `${fx.rate} (${fx.date})` : 'n/a'}`);

  // 1) DUO registers
  const croho = await ckanDataset('overzicht-erkenningen-ho', /erkenningen/i, {
    fields: ['INSTELLINGSCODE', 'INSTELLINGSNAAM', 'PLAATSNAAM', 'ERKENDEOPLEIDINGSCODE', 'OPLEIDINGSEENHEIDCODE', 'INSTROOM_EINDDATUM', 'OPLEIDINGSEENHEID_NAAM',
      'OPLEIDINGSEENHEID_INTERNATIONALE_NAAM', 'NIVEAU', 'GRAAD', 'GRAADTOEVOEGING', 'VORM', 'BEKOSTIGINGSCODE', 'STATUS'],
    filters: { STATUS: ['ACTUEEL', 'TOEKOMSTIG'] },
  });
  const rio = await ckanDataset('ho_opleidingsoverzicht', /^ho_opleidingsoverzicht$/i, {
    fields: ['ONDERWIJSBESTUUR_NAAM', 'ONDERWIJSAANBIEDER_NAAM', 'SOORT', 'OPLEIDINGSEENHEIDCODE', 'NAAM_LANG', 'INTERNATIONALE_NAAM', 'NIVEAU', 'EIGENNAAM_ENGELS',
      'VORM', 'VOERTAAL', 'AANGEBODEN_OPLEIDING_EINDDATUM', 'EINDDATUM', 'ONDERWIJSLOCATIEPLAATS'],
  });
  const addresses = await ckanDataset('adressen_ho', /instellingen/i);
  const fundedQuote = 'Door OCW bekostigde Nederlandse HO-instellingen die actief zijn op het moment van aanmaak van de adreslevering';
  const fundedQuoteOk = norm(addresses.notes || '').includes(norm(fundedQuote));
  console.log(`  CROHO current/future records: ${croho.records.length}; RIO offerings: ${rio.records.length}; funded HO institutions: ${addresses.records.length}`);
  const crohoByUnit = new Map(croho.records.map((r) => [r.OPLEIDINGSEENHEIDCODE, r]));
  const today = syncedAt.toISOString().slice(0, 10);

  // 2) Study in NL lists + DUO fee page
  const sinlWo = asDoc(await getPage(SINL_WO_LIST));
  const sinlHbo = asDoc(await getPage(SINL_HBO_LIST));
  let duoFee = null;
  try {
    const d = asDoc(await getPage(DUO_FEE_PAGE));
    duoFee = { url: DUO_FEE_PAGE, quote: DUO_STATUTORY_QUOTE, verified: inDoc(d, DUO_STATUTORY_QUOTE), institutionalRule: { quote: DUO_INSTITUTIONAL_QUOTE, verified: inDoc(d, DUO_INSTITUTIONAL_QUOTE) } };
  } catch (err) { uncertainties.push(`DUO statutory fee page not available (${err.message}); EU fee left out of the tuition text`); }
  if (duoFee && !duoFee.verified) uncertainties.push('DUO statutory fee quote not found on the page any more; EU fee left out of the tuition text');

  // 3) DB (read only here)
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const nlCountry = await db.collection('countries').findOne({ $or: [{ name: /^(the )?netherlands$/i }, { code: /^(the-)?netherlands$/i }, { name: /^holland$/i }] });
  const ours = nlCountry ? await db.collection('universities').find({ country: nlCountry._id }).toArray() : [];
  const elsewhere = await db.collection('universities').find({ name: { $in: INSTITUTIONS.map((e) => e.name) }, ...(nlCountry ? { country: { $ne: nlCountry._id } } : {}) })
    .project({ name: 1, country: 1, city: 1 }).toArray();
  for (const u of elsewhere) uncertainties.push(`"${u.name}" exists under another country (${u.country}, ${u.city || 'no city'}); not touched`);
  console.log(`  Netherlands country document: ${nlCountry ? `${nlCountry.name} (${nlCountry._id})` : 'MISSING → proposed create'}; our Netherlands records: ${ours.length}`);
  const countryId = nlCountry ? nlCountry._id : new mongoose.Types.ObjectId();

  // 4) per institution
  const creates = [];
  const updates = [];
  const deactivations = [];
  const table = [];
  const nulls = [];
  const feesReport = {};
  const matchedIds = new Set();
  const multiCampus = [];
  const relatedIds = new Set(); // other records on an institution's domain (schools/colleges): never touched
  const cityName = (raw) => (/^'S-GRAVENHAGE$/i.test(raw) ? 'The Hague' : /^'S-HERTOGENBOSCH$/i.test(raw) ? "'s-Hertogenbosch" : titleCase(String(raw).replace(/ GLD$/i, '')));
  for (const entry of INSTITUTIONS) {
    process.stdout.write(`  · ${entry.name} … `);
    const problems = [];
    // register: funded institution (addresses) + recognised programmes (CROHO)
    const addr = addresses.records.find((a) => a.INSTELLINGSCODE === entry.brin);
    if (!addr) problems.push(`BRIN ${entry.brin} not in DUO list of funded HO institutions`);
    else if (String(addr['SOORT HO']).toLowerCase() !== entry.kind) problems.push(`DUO type is ${addr['SOORT HO']}, expected ${entry.kind}`);
    // CROHO has one row per programme AND form (VOLTIJD/DEELTIJD/DUAAL) and also lists future (TOEKOMSTIG) programmes →
    // programmes are counted as distinct CROHO codes (ERKENDEOPLEIDINGSCODE) with STATUS ACTUEEL and intake still open
    const programmes = croho.records.filter((r) => r.INSTELLINGSCODE === entry.brin && ['WO-BA', 'WO-MA', 'HBO-BA', 'HBO-MA'].includes(r.NIVEAU));
    const intakeOpen = (r) => !(r.INSTROOM_EINDDATUM && String(r.INSTROOM_EINDDATUM).slice(0, 10) < today);
    const currentRows = programmes.filter((r) => r.STATUS === 'ACTUEEL' && intakeOpen(r));
    const codesOf = (rows) => new Set(rows.map((r) => r.ERKENDEOPLEIDINGSCODE).filter(Boolean));
    const currentCodes = codesOf(currentRows);
    const fullTimeCodes = codesOf(currentRows.filter((r) => r.VORM === 'VOLTIJD'));
    const fundedCodes = codesOf(currentRows.filter((r) => r.BEKOSTIGINGSCODE === 'BEKOSTIGD'));
    const futureCodes = [...codesOf(programmes.filter((r) => r.STATUS === 'TOEKOMSTIG'))].filter((c) => !currentCodes.has(c));
    const fullTime = currentRows.filter((r) => r.VORM === 'VOLTIJD').filter((r, i, a) => a.findIndex((x) => x.ERKENDEOPLEIDINGSCODE === r.ERKENDEOPLEIDINGSCODE) === i);
    if (!currentCodes.size) problems.push('no current Bachelor/Master programme in CROHO');

    // English-taught programmes as offered (RIO language of instruction); pre-master/bridging offerings are not degrees
    const rioRows = rio.records.filter((r) => entry.rio.test(r.ONDERWIJSBESTUUR_NAAM || '') && /ENG/.test(r.VOERTAAL || '') && r.VORM === 'VOLTIJD'
      && ['WO-BA', 'WO-MA', 'HBO-BA', 'HBO-MA'].includes(r.NIVEAU) && !(r.AANGEBODEN_OPLEIDING_EINDDATUM && r.AANGEBODEN_OPLEIDING_EINDDATUM.slice(0, 10) < today)
      && !(r.EINDDATUM && r.EINDDATUM.slice(0, 10) < today) && ![r.NAAM_LANG, r.INTERNATIONALE_NAAM, r.EIGENNAAM_ENGELS].some((x) => PRE_MASTER.test(x || '')));
    const preMastersDropped = rio.records.filter((r) => entry.rio.test(r.ONDERWIJSBESTUUR_NAAM || '') && /ENG/.test(r.VOERTAAL || '') && r.VORM === 'VOLTIJD'
      && [r.NAAM_LANG, r.INTERNATIONALE_NAAM, r.EIGENNAAM_ENGELS].some((x) => PRE_MASTER.test(x || ''))).length;

    // City: the seat in the DUO address register — unless no English-taught offering is in the seat city (multi-campus
    // universities of applied sciences whose legal seat is an office): then the city with most English-taught offerings
    const seatCity = addr ? cityName(addr.PLAATSNAAM) : null;
    const engCities = {};
    let engUnknownCity = 0;
    const seenOffer = new Set();
    for (const r of rioRows) {
      const k = `${r.ONDERWIJSLOCATIEPLAATS}|${norm(r.INTERNATIONALE_NAAM || r.EIGENNAAM_ENGELS || r.NAAM_LANG)}`;
      if (seenOffer.has(k)) continue;
      seenOffer.add(k);
      if (!r.ONDERWIJSLOCATIEPLAATS) { engUnknownCity += 1; continue; }
      const c = cityName(r.ONDERWIJSLOCATIEPLAATS);
      engCities[c] = (engCities[c] || 0) + 1;
    }
    const rankedCities = Object.entries(engCities).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    let city = seatCity;
    let cityBasis = 'seat in the DUO address register';
    if (seatCity && rankedCities.length && !engCities[seatCity] && !engUnknownCity && rankedCities[0][1] >= 2 && (rankedCities.length === 1 || rankedCities[0][1] > rankedCities[1][1])) {
      city = rankedCities[0][0];
      cityBasis = `city with the most English-taught full-time offerings in DUO RIO (${rankedCities.map(([c, n]) => `${c} ${n}`).join(', ')}); the legal seat ${seatCity} (DUO address register) offers none`;
    }
    const campusCities = [...new Set(programmes.filter((r) => r.PLAATSNAAM).map((r) => cityName(r.PLAATSNAAM)))].sort();
    if (campusCities.length > 1 || (city && campusCities.length && !campusCities.includes(city)) || city !== seatCity) {
      multiCampus.push(`${entry.name}: city ${city} (${city === seatCity ? 'DUO seat' : `English-taught offerings; DUO seat ${seatCity}`}); programmes registered in ${campusCities.join(', ')} (CROHO)${rankedCities.length ? `; English-taught offerings by city (RIO): ${rankedCities.map(([c, n]) => `${c} ${n}`).join(', ')}` : ''}`);
    }

    // Study in NL: official English name + English-taught programmes
    let sinl = null;
    let sinlFailed = null; // a failed Study in NL fetch must not shrink the course list / create a record with a partial one
    if (entry.sinl) {
      try { sinl = await studyInNl(entry.sinl); } catch (err) { sinlFailed = err.message; problems.push(`Study in NL: ${err.message}`); }
    }
    const sinlInstitution = sinl?.programs?.[0]?.institution || null;
    const nameEvidence = [];
    if (sinlInstitution && sinlInstitution.name === entry.name) nameEvidence.push({ source: 'Study in NL Studyfinder institution record', url: sinl.url, quote: `"name":${JSON.stringify(entry.name)}`, verified: sinl.page.body.includes(`"name":${JSON.stringify(entry.name)}`) });
    for (const doc of [sinlWo, sinlHbo]) if (inDoc(doc, entry.name)) nameEvidence.push({ source: 'Study in NL institution list', url: doc.url, quote: entry.name, verified: true });
    if (!nameEvidence.length) problems.push(`English name "${entry.name}" not confirmed by Study in NL`);

    // Existing records of this institution — matched BEFORE any skip, so a verification failure leaves them untouched
    // (they are marked matched) instead of letting step 5 hide them. Name match (English / DUO legal / Study in NL name) or
    // the exact same website host = same institution; another host on the same domain (a college/school) is only reported.
    const nameMatch = (u) => [entry.name, addr?.INSTELLINGSNAAM, sinlInstitution?.name].filter(Boolean).some((n) => norm(u.name) === norm(n));
    const free = ours.filter((u) => !matchedIds.has(String(u._id)) && !relatedIds.has(String(u._id)));
    const ts = (u) => (u.createdAt ? new Date(u.createdAt).getTime() : (u._id?.getTimestamp?.()?.getTime() ?? 0));
    // same institution by website only when it is the institution's homepage (same host, no deeper path such as uva.nl/abs)
    const isHomepage = (w) => Boolean(w) && hostOf(w) === hostOf(entry.website) && /^\/?((en|nl|english)\/?)?$/i.test(String(w).trim().replace(/^(https?:\/\/)?[^/?#]+/i, '').split(/[?#]/)[0]);
    const existing = free.filter((u) => nameMatch(u) || isHomepage(u.website))
      .sort((a, b) => (Number(norm(b.name) === norm(entry.name)) - Number(norm(a.name) === norm(entry.name)))
        || (Number(b.isActive !== false) - Number(a.isActive !== false)) || (ts(a) - ts(b)));
    for (const u of free.filter((x) => !existing.includes(x) && x.website && regDomain(x.website) === regDomain(entry.website))) {
      relatedIds.add(String(u._id));
      uncertainties.push(`"${u.name}" (${u.website}) uses ${entry.name}'s domain but another name and not its homepage (a college/school of it?) — left unchanged, not treated as a duplicate`);
    }
    existing.forEach((u) => matchedIds.add(String(u._id)));

    // Website: must be the domain listed by DUO, Study in NL (API or list page) — homepage title fetched as extra evidence
    const listed = [addr?.INTERNETADRES, sinlInstitution?.url];
    for (const doc of [sinlWo, sinlHbo]) {
      const page = await getPage(doc.url);
      const $ = cheerio.load(page.body);
      $('main a').each((_, a) => { if (squash($(a).text()) === entry.name) listed.push($(a).attr('href')); });
    }
    const websiteListedBy = listed.filter(Boolean).filter((u) => regDomain(u) === regDomain(entry.website));
    let homepage = null;
    try {
      const h = asDoc(await getPage(`${entry.website}/`, { timeoutMs: 30000 }));
      homepage = { url: entry.website, finalUrl: h.finalUrl, title: h.title };
    } catch (err) { homepage = { url: entry.website, error: err.message }; }
    const websiteOk = websiteListedBy.length > 0;
    if (!websiteOk) problems.push(`website ${entry.website} not listed by DUO/Study in NL (listed: ${listed.filter(Boolean).join(', ')})`);

    const courses = buildCourses(entry, sinl, rioRows, crohoByUnit);
    if (!courses.courses.length) problems.push('no English-taught Bachelor/Master programme found');

    // Fees
    const f = { year: entry.feeYear || null, yearNote: entry.feeYearNote || null, sources: [], rows: [] };
    feesReport[entry.key] = f;
    const sinlEnglish = (sinl?.programs || []).filter((p) => ['Bachelor', 'Master'].includes(p.type) && p.full_time === 1 && (p.languages || []).some((l) => l.name === 'English'));
    const ctx = { entry, courseItems: courses.items, sinlEnglish, unmapped: [], pageSkips: [], feeGroups: null };
    for (const src of entry.fees) {
      const s = { kind: src.kind, url: src.url || null, levels: src.levels, linkedFrom: src.linkedFrom || null };
      f.sources.push(s);
      try {
        if (src.kind === 'studyinnl') {
          if (!sinl) throw new Error('no Study in NL data');
          const r = sinlFeeRows(entry, sinl, src);
          s.url = sinl.url;
          s.year = r.year;
          s.yearMode = src.yearMode || 'year with most records';
          s.yearCounts = r.yearCounts;
          s.feeType = r.type;
          f.rows.push(...r.rows);
          if (src.corroborate) {
            try {
              const cdoc = asDoc(await getPage(src.corroborate));
              const amounts = [...new Set(r.rows.map((x) => x.amountEUR))];
              const found = amounts.filter((a) => [money(a), money(a).replace(/,/g, '.'), String(a)].some((v) => cdoc.text.includes(v)));
              s.corroboration = {
                url: src.corroborate, distinctAmounts: amounts.length, foundInOfficialDocument: found.length, missing: amounts.filter((a) => !found.includes(a)),
                ...(src.corroborateQuotes ? { quotes: src.corroborateQuotes.map((q) => ({ quote: q, verified: inDoc(cdoc, q) })) } : {}),
              };
            } catch (err) { s.corroboration = { url: src.corroborate, error: err.message }; }
          }
          if (src.rule) {
            try {
              const rdoc = asDoc(await getPage(src.rule.url, { scrapeDo: src.rule.scrapeDo }));
              s.rule = { url: src.rule.url, quote: src.rule.quote, verified: inDoc(rdoc, src.rule.quote), via: rdoc.via };
            } catch (err) { s.rule = { url: src.rule.url, error: err.message }; }
            if (!s.rule.verified) { f.rows = f.rows.filter((x) => x.feeType !== 'institutional'); uncertainties.push(`${entry.name}: Study in NL lists only an 'institutional' fee type and the official rule page could not confirm it is the non-EU fee; those rows dropped`); }
          }
        } else if (src.kind === 'programmePages') {
          // one official page per programme (direct fetch only, cached). A page that does not exist (HTTP 404/410) or has
          // no fee block only shrinks the sample (reported); a transient failure (network, timeout, 5xx, blocked) or a
          // sample below MIN_PAGE_SHARE of the level's pages makes that level incomplete → no fee is proposed this run
          const list = await src.pages(ctx);
          s.pages = list.length;
          s.failures = [];
          const rows = [];
          for (const pg of list) {
            try {
              const page = await getPage(pg.url, { politeMs: 250, timeoutMs: 30000 });
              const row = src.parse(asDoc(page), pg);
              if (row) { row.source = 'official'; if (pg.sinlId) row.sinlId = pg.sinlId; rows.push(row); } else s.failures.push({ level: pg.level, programme: `${pg.level} ${pg.programme}`, url: pg.url, error: 'fee text not found on the page', transient: false });
            } catch (err) { s.failures.push({ level: pg.level, programme: `${pg.level} ${pg.programme}`, url: pg.url, error: err.message, transient: !/^HTTP (404|410) /.test(err.message) }); }
          }
          f.rows.push(...rows);
          s.url = list.length ? `${list.length} programme pages (see fees.${entry.key}.rows[].url)` : null;
          s.urls = [...new Set(rows.filter((r) => r.verified).map((r) => r.url))];
          s.rows = rows.length;
          s.verifiedRows = rows.filter((r) => r.verified).length;
          s.coverage = {};
          s.incompleteLevels = [];
          for (const level of src.levels) {
            const pagesL = list.filter((pg) => pg.level === level).length;
            if (!pagesL) continue;
            const okL = rows.filter((r) => r.level === level && r.verified).length;
            const transientL = s.failures.filter((x) => x.level === level && x.transient).length;
            s.coverage[level] = { pages: pagesL, withFee: okL, share: Math.round((okL / pagesL) * 100) / 100, transientFailures: transientL };
            if (transientL || okL / pagesL < MIN_PAGE_SHARE) {
              s.incompleteLevels.push(level);
              errors.push({ key: entry.key, source: s.url, error: `${level}: ${okL} of ${pagesL} official programme pages gave a fee${transientL ? `, ${transientL} failed transiently` : ''} (need ≥ ${MIN_PAGE_SHARE * 100}% and no transient failure) — fees not proposed this run` });
            }
          }
        } else {
          const page = await getPage(src.url, { scrapeDo: Boolean(src.scrapeDo) });
          const doc = asDoc(page);
          s.fetchedVia = page.via;
          const rows = src.parse(doc, ctx);
          for (const r of rows) r.source = 'official';
          f.rows.push(...rows);
          s.rows = rows.length;
          s.verifiedRows = rows.filter((r) => r.verified).length;
        }
      } catch (err) {
        s.error = err.message;
        errors.push({ key: entry.key, source: s.url, error: err.message });
      }
    }
    f.bachelor = summariseFees(f.rows, 'bachelor');
    f.master = summariseFees(f.rows, 'master');
    f.programmeMapping = { unmapped: ctx.unmapped, rateGroups: ctx.feeGroups, pageSkips: ctx.pageSkips };
    if (!f.year) f.year = f.master?.year || f.bachelor?.year || null;
    const feeOrigin = (lvl) => f[lvl]?.source || null;

    const toUsd = (x) => (fx && x ? Math.round(x * fx.rate) : null);
    const range = (s) => (s.rangeEUR[0] === s.rangeEUR[1] ? `EUR ${money(s.rangeEUR[0])}` : `EUR ${money(s.rangeEUR[0])}–${money(s.rangeEUR[1])}`);
    const usdRange = (s) => (s.rangeEUR[0] === s.rangeEUR[1] ? `US$${money(toUsd(s.rangeEUR[0]))}` : `US$${money(toUsd(s.rangeEUR[0]))}–${money(toUsd(s.rangeEUR[1]))}`);
    const lvlYear = (s) => s?.year || f.year;
    const sameYear = !(f.master && f.bachelor) || lvlYear(f.master) === lvlYear(f.bachelor);
    const parts = [];
    if (f.master) parts.push(`Master's ${range(f.master)}${fx ? ` (≈ ${usdRange(f.master)}${sameYear ? '' : `, ${lvlYear(f.master)}`})` : ''}`);
    if (f.bachelor) parts.push(`Bachelor's ${range(f.bachelor)}${fx ? ` (≈ ${usdRange(f.bachelor)}${sameYear ? '' : `, ${lvlYear(f.bachelor)}`})` : ''}`);
    const approx = [f.master, f.bachelor].some((s) => s && (s.n > 1 || s.approxRows)) ? ', approx.' : '';
    const origins = [...new Set([f.master && feeOrigin('master'), f.bachelor && feeOrigin('bachelor')].filter(Boolean))];
    const originText = origins.map((o) => (o === 'official' ? `official ${entry.name} fee pages` : `Study in NL (Nuffic) programme database, fees supplied by the institution${entry.feeCaveat ? ' (amount not published on the institution\'s own pages)' : ''}`)).join(' + ');
    const feeYearText = sameYear ? lvlYear(f.master || f.bachelor) : `Master's ${lvlYear(f.master)}, Bachelor's ${lvlYear(f.bachelor)}`;
    const tuition = parts.length
      ? `${parts.join(' · ')} per year (non-EU institutional fee${sameYear ? `, ${feeYearText}` : ''}${approx}) — ${originText}${duoFee?.verified ? `; EU/EEA statutory fee EUR ${money(STATUTORY_EUR)} (2026/27, DUO)` : ''}`
      : null;

    const proposed = {};
    if (websiteOk && regDomain(entry.website)) proposed.website = entry.website;
    if (city) proposed.city = city;
    if (addr) proposed.type = 'PUBLIC';
    if (courses.courses.length) { proposed.courses = courses.courses; proposed.degreeLevels = courses.degreeLevels; }
    if (fx && tuition) {
      proposed.tuition = tuition;
      if (f.bachelor) proposed.tuitionFeeUSD = toUsd(f.bachelor.medianEUR);
      if (f.master) proposed.graduateTuitionUSD = toUsd(f.master.medianEUR);
    }

    // values left null and why
    const missing = [];
    if (!f.bachelor) missing.push(`tuitionFeeUSD + Bachelor's part of the tuition text: ${f.sources.filter((s) => s.levels.includes('bachelor')).map((s) => s.error || (s.kind === 'studyinnl' ? 'no Study in NL non-EU fee record for a Bachelor programme' : 'no verifiable Bachelor fee row')).join('; ') || "no Bachelor's fee published as a number on the official page (\"depends on the study programme\")"}`);
    if (!f.master) missing.push(`graduateTuitionUSD + Master's part of the tuition text: ${f.sources.filter((s) => s.levels.includes('master')).map((s) => s.error || (s.kind === 'studyinnl' ? 'no Study in NL non-EU fee record for a Master programme' : 'no verifiable Master fee row')).join('; ') || "no Master's fee published as a number on the official page (\"depends on the study programme\")"}`);
    if (!fx && (f.bachelor || f.master)) missing.push('tuition / USD fields: no ECB rate available this run');
    if (!courses.courses.length) missing.push('courses: no English-taught programme found in Study in NL or RIO');
    if (missing.length) nulls.push({ institution: entry.name, fields: missing });
    if (problems.length) errors.push({ key: entry.key, problems });
    if (entry.feeYearNote) uncertainties.push(`${entry.name}: fee year ${feeYearText} — ${entry.feeYearNote}`);
    if (entry.feeCaveat && origins.includes('studyinnl')) uncertainties.push(`${entry.name}: fee unverified on the institution's own site — ${entry.feeCaveat}`);
    for (const s of f.sources) if (s.kind === 'studyinnl' && s.year && s.year !== 2026 && [f.master, f.bachelor].some((x) => x?.source === 'studyinnl')) uncertainties.push(`${entry.name}: Study in NL fee year ${s.year}/${String(s.year + 1).slice(2)} used (records per year: ${JSON.stringify(s.yearCounts)})`);
    for (const s of f.sources) if (s.corroboration && !s.corroboration.error && s.corroboration.missing.length) uncertainties.push(`${entry.name}: ${s.corroboration.missing.length} of ${s.corroboration.distinctAmounts} Study in NL fee amounts not found in the official document ${s.corroboration.url} (${s.corroboration.missing.join(', ')})`);
    for (const s of f.sources) if (s.failures?.length) uncertainties.push(`${entry.name}: ${s.failures.length} of ${s.pages} official programme pages gave no fee (see fees.${entry.key}.sources[].failures); those programmes are left out of the range/median`);
    if (ctx.unmapped.length) uncertainties.push(`${entry.name}: ${ctx.unmapped.length} English-taught programme(s) could not be placed in an official rate group and are left out of the fee range/median: ${ctx.unmapped.join('; ')}`);
    if (ctx.pageSkips.length) uncertainties.push(`${entry.name}: ${ctx.pageSkips.length} Study in NL programme link(s) are not programme pages of the institution (no fee read): ${ctx.pageSkips.slice(0, 8).join('; ')}${ctx.pageSkips.length > 8 ? ' …' : ''}`);

    const evidence = {
      register: addr ? { dataset: addresses.title, datasetModified: addresses.modified, api: `${CKAN}/datastore_search?resource_id=${addresses.resource.id}`, record: { INSTELLINGSCODE: addr.INSTELLINGSCODE, INSTELLINGSNAAM: addr.INSTELLINGSNAAM, 'SOORT HO': addr['SOORT HO'], PLAATSNAAM: addr.PLAATSNAAM, INTERNETADRES: addr.INTERNETADRES }, fundedQuote: { quote: fundedQuote, url: addresses.packageUrl, verified: fundedQuoteOk } } : null,
      croho: { dataset: croho.title, datasetModified: croho.modified, api: `${CKAN}/datastore_search?resource_id=${croho.resource.id}`, currentBachelorMasterProgrammes: currentCodes.size, countedAs: "distinct CROHO codes (ERKENDEOPLEIDINGSCODE), STATUS ACTUEEL, intake open", fullTime: fullTimeCodes.size, funded: fundedCodes.size, futureProgrammes: futureCodes.length, registerRows: programmes.length, campusCities, sample: fullTime.slice(0, 5).map((r) => `${r.ERKENDEOPLEIDINGSCODE} ${r.OPLEIDINGSEENHEID_INTERNATIONALE_NAAM || r.OPLEIDINGSEENHEID_NAAM} (${r.NIVEAU})`) },
      city: { value: city, basis: cityBasis, seatCity, englishTaughtOfferingsByCity: Object.fromEntries(rankedCities), englishTaughtOfferingsWithoutCity: engUnknownCity },
      name: nameEvidence,
      website: { value: entry.website, listedBy: websiteListedBy, homepage },
      courses: { studyInNl: sinl ? { url: sinl.url, englishTaughtBachelorMaster: courses.bySource.studyInNl } : null, rioEnglishTaught: { dataset: rio.title, api: `${CKAN}/datastore_search?resource_id=${rio.resource.id}`, extraProgrammes: courses.bySource.rioEnglish, offeringsMatched: rioRows.length, preMasterOfferingsDropped: preMastersDropped }, total: courses.totalAvailable, cappedAt: COURSE_CAP },
      fees: { year: f.year, bachelor: f.bachelor, master: f.master, sources: f.sources, programmeMapping: f.programmeMapping, fx, statutory: duoFee },
    };
    const row = {
      institution: entry.name, kind: entry.kind === 'wo' ? 'research university' : 'university of applied sciences', brin: entry.brin, action: null, website: proposed.website || null,
      city: proposed.city || null, type: proposed.type || null, courses: courses.courses.length,
      bachelorFee: f.bachelor ? `${range(f.bachelor)}${fx ? ` ≈ ${usdRange(f.bachelor)}` : ''}, median EUR ${money(f.bachelor.medianEUR)}${fx ? ` ≈ US$${money(toUsd(f.bachelor.medianEUR))}` : ''}, n=${f.bachelor.n} (${f.bachelor.basis})` : null,
      masterFee: f.master ? `${range(f.master)}${fx ? ` ≈ ${usdRange(f.master)}` : ''}, median EUR ${money(f.master.medianEUR)}${fx ? ` ≈ US$${money(toUsd(f.master.medianEUR))}` : ''}, n=${f.master.n} (${f.master.basis})` : null,
      feeSource: origins.join('+') || null, feeYear: feeYearText,
    };

    if (problems.some((p) => /not in DUO list|no current Bachelor|not confirmed/.test(p))) {
      row.action = 'skipped (verification failed)';
      row.reason = problems.join('; ');
      row.existingRecordsLeftUnchanged = existing.map((u) => `${u.name} (${u._id})`);
      uncertainties.push(`${entry.name}: not proposed — ${problems.join('; ')}${existing.length ? `; its existing record(s) ${existing.map((u) => `"${u.name}"`).join(', ')} are left unchanged` : ''}`);
      table.push(row);
      console.log(row.action);
      continue;
    }
    const fields = Object.keys(proposed);
    const urls = [...new Set([addresses.packageUrl, croho.packageUrl, sinl?.url, rioRows.length ? rio.packageUrl : null, ...nameEvidence.map((e) => e.url),
      ...(proposed.tuition ? f.sources.filter((s) => !s.error).flatMap((s) => (s.urls ? s.urls : s.url ? [s.url] : [])) : []), ...(proposed.tuition && duoFee?.verified ? [DUO_FEE_PAGE] : [])].filter(Boolean))];
    const dataSource = {
      provider: PROVIDER, urls, syncedAt, fields, runId: RUN_ID, brin: entry.brin,
      registers: { croho: croho.modified, rio: rio.modified, addresses: addresses.modified },
      ...(city !== seatCity ? { seatCity, cityBasis } : {}),
      ...(proposed.tuition ? {
        feeYear: feeYearText, feeOrigin: origins, eurUsd: fx.rate, fxDate: fx.date,
        feeBasis: 'USD fields = median non-EU yearly full-time fee over the institution\'s programmes (or over distinct faculty rates where only faculty rates are published; medicine/dentistry excluded) × ECB EUR→USD; display = min–max',
        ...(entry.feeCaveat && origins.includes('studyinnl') ? { feeCaveat: entry.feeCaveat } : {}),
      } : {}),
    };

    if (!existing.length) {
      const id = new mongoose.Types.ObjectId();
      const kindText = entry.kind === 'wo' ? 'research university (wetenschappelijk onderwijs)' : 'university of applied sciences (hoger beroepsonderwijs)';
      const cityList = rankedCities.map(([c]) => c);
      const where = city === seatCity ? ` in ${city},` : ',';
      const campusText = city === seatCity ? '' : ` Its registered seat is in ${seatCity}; its English-taught programmes are offered in ${cityList.length > 1 ? `${cityList.slice(0, -1).join(', ')} and ${cityList[cityList.length - 1]}` : cityList[0]} (DUO RIO).`;
      const description = `${entry.name} is a Dutch ${kindText}${where} funded by the Dutch Ministry of Education, Culture and Science (OCW).${campusText} Its degree programmes are accredited and registered in the CROHO register of DUO (${currentCodes.size} current Bachelor's/Master's programmes)${sinl ? `; Study in NL lists ${courses.bySource.studyInNl} of its English-taught Bachelor's/Master's programmes` : ''}.`;
      const doc = {
        _id: String(id), name: entry.name, country: String(countryId), city: proposed.city ?? null, website: proposed.website ?? null,
        logo: proposed.website ? `https://www.google.com/s2/favicons?domain=${regDomain(proposed.website)}&sz=128` : null,
        type: proposed.type ?? null, description, eligibility: null,
        categoryTags: ['netherlands', String(proposed.city || '').toLowerCase(), ...(proposed.type ? ['public'] : []), entry.kind === 'wo' ? 'research-university' : 'applied-sciences'].filter(Boolean),
        tuition: proposed.tuition ?? null, tuitionFeeUSD: proposed.tuitionFeeUSD ?? null, graduateTuitionUSD: proposed.graduateTuitionUSD ?? null,
        courses: proposed.courses || [], degreeLevels: proposed.degreeLevels || [],
        // schema defaults would invent these — set explicitly to "unknown"
        minGpaPercent: null, minIeltsScore: null, minGreScore: null, greRequired: null, acceptanceRate: null,
        minScore: null, ieltsScore: null, greExam: null, workExp: null, scholarshipAvailable: null, rankingNum: null,
        isActive: true,
        dataSource: { ...dataSource, fields: ['name', 'description', ...fields], createdBySync: SYNC_ID },
      };
      creates.push({ id: String(id), name: entry.name, key: entry.key, doc, evidence });
      row.action = 'create';
    } else {
      const [keep, ...dups] = existing;
      row.matchedRecord = `${keep.name} (${keep._id})`;
      const diff = {};
      for (const [k, v] of Object.entries(proposed)) {
        if (k === 'website' && keep.website && regDomain(keep.website) === regDomain(v)) continue;
        if (k === 'type' && String(keep.type || '').toUpperCase() === v) continue;
        if (JSON.stringify(keep[k]) !== JSON.stringify(v)) diff[k] = { from: keep[k], to: v };
      }
      if (!f.bachelor && keep.tuitionFeeUSD === 25000) diff.tuitionFeeUSD = { from: 25000, to: null, reason: 'schema default, not an official value' };
      if (keep.isActive === false) diff.isActive = { from: false, to: true };
      // dataSource.fields = every field whose value comes from the official sources of THIS run (changed or not); never the
      // schema-default reset or isActive. Fee fields not recomputed this run (FX/source down) keep their earlier official
      // provenance when their stored values stay untouched; so do name/description from an earlier run of this sync.
      const prev = keep.dataSource || {};
      const prevFields = Array.isArray(prev.fields) ? prev.fields : [];
      const carried = prevFields.filter((k) => !fields.includes(k) && !(k in diff) && keep[k] != null
        && (['tuition', 'tuitionFeeUSD', 'graduateTuitionUSD'].includes(k) || (prev.provider === PROVIDER && ['name', 'description'].includes(k))));
      const carriedFee = carried.filter((k) => ['tuition', 'tuitionFeeUSD', 'graduateTuitionUSD'].includes(k));
      const feeMeta = carriedFee.length && !proposed.tuition ? Object.fromEntries(['feeYear', 'feeOrigin', 'eurUsd', 'fxDate', 'feeBasis', 'feeCaveat'].filter((k) => prev[k] !== undefined).map((k) => [k, prev[k]])) : {};
      const exactFields = [...fields, ...carried];
      const valueChange = Object.keys(diff).length > 0;
      const provenanceStale = prev.provider === PROVIDER && JSON.stringify([...prevFields].sort()) !== JSON.stringify([...exactFields].sort());
      if (valueChange || provenanceStale) {
        diff.dataSource = { from: keep.dataSource, to: { ...dataSource, ...feeMeta, fields: exactFields, ...(carried.length ? { carriedOverFromPreviousSync: carried } : {}) } };
        updates.push({ id: String(keep._id), name: keep.name, key: entry.key, diff, evidence, ...(valueChange ? {} : { note: 'provenance only (dataSource.fields corrected)' }) });
        row.action = valueChange ? 'update' : 'update (provenance only)';
      } else row.action = 'unchanged';
      for (const d of dups) {
        if (d.isActive === false) continue;
        const reason = `duplicate of "${keep.name}" (same DUO institution ${entry.brin}; ${nameMatch(d) ? 'same name' : `same homepage ${d.website}`})`;
        deactivations.push({ id: String(d._id), name: d.name, reason, diff: { isActive: { from: d.isActive, to: false }, dataSource: { from: d.dataSource, to: { provider: PROVIDER, runId: RUN_ID, syncedAt, fields: ['isActive'], reason, urls: [addresses.packageUrl] } } } });
      }
    }
    table.push(row);
    console.log(`${row.action}: ${courses.courses.length} courses; city ${city}; B ${f.bachelor ? `${money(f.bachelor.rangeEUR[0])}–${money(f.bachelor.rangeEUR[1])} med ${money(f.bachelor.medianEUR)} (n=${f.bachelor.n} ${f.bachelor.basis}, ${lvlYear(f.bachelor)})` : 'n/a'}; M ${f.master ? `${money(f.master.rangeEUR[0])}–${money(f.master.rangeEUR[1])} med ${money(f.master.medianEUR)} (n=${f.master.n} ${f.master.basis}, ${lvlYear(f.master)})` : 'n/a'}${problems.length ? `; problems: ${problems.join('; ')}` : ''}`);
  }

  const sinlFeeInst = table.filter((r) => /studyinnl/.test(r.feeSource || '')).map((r) => r.institution);
  if (sinlFeeInst.length) uncertainties.push(`Fees for ${sinlFeeInst.join(', ')} come (fully or for one level) from the Study in NL (Nuffic) programme database — data supplied by the institutions to a government-funded portal, not the institution's own fee page (blocked, per-programme pages only, or a JS calculator). Where an official document could be read it was used to corroborate the amounts (see fees.<key>.sources[].corroboration).`);
  uncertainties.push("degreeLevels lists only Bachelor's/Master's: the CROHO register and Study in NL do not register PhD programmes, so 'PhD' is not added even for research universities.");
  uncertainties.push('Course lists contain English-taught programmes only (Study in NL + RIO language of instruction ENG); Dutch-taught programmes are counted in evidence.croho but not listed. RIO language data is incomplete for some institutions (e.g. TU Delft registers most offerings as NLD).');
  if (multiCampus.length) uncertainties.push(`city = the institution's seat in the DUO address register, except where no English-taught offering is in the seat city (then the city with most English-taught RIO offerings; the seat is kept in dataSource.seatCity). These institutions teach in several cities — the single 'city' field shows one: ${multiCampus.join(' | ')}`);

  // 5) Existing Netherlands records not matched: hide only if the record is not recognisable as ANY Dutch institution
  // (DUO legal names in CROHO or the address register, configured English names, Study in NL institution lists, or a
  // website on the domain of a DUO-registered institution)
  const recognisedNames = new Set([...croho.records.map((r) => norm(r.INSTELLINGSNAAM)), ...addresses.records.map((a) => norm(a.INSTELLINGSNAAM)), ...INSTITUTIONS.map((e) => norm(e.name))]);
  const recognisedDomains = new Set(addresses.records.map((a) => regDomain(a.INTERNETADRES)).filter(Boolean));
  const unverifiedFields = [];
  for (const u of ours) {
    if (matchedIds.has(String(u._id)) || relatedIds.has(String(u._id)) || u.isActive === false) continue;
    const why = recognisedNames.has(norm(u.name)) ? 'name of a DUO-registered institution / configured institution'
      : (String(u.name || '').length >= 6 && (inDoc(sinlWo, u.name) || inDoc(sinlHbo, u.name))) ? 'name listed by Study in NL'
        : (u.website && recognisedDomains.has(regDomain(u.website))) ? `website on ${regDomain(u.website)}, the domain of a DUO-registered institution` : null;
    if (why) { uncertainties.push(`${u.name}: recognised (${why}) but not matched to a configured institution — no change`); continue; }
    const reason = `"${u.name}" matches no DUO-registered institution (CROHO ${croho.modified} / address register), no Study in NL institution and no DUO institution website domain`;
    uncertainties.push(`${u.name}: ${reason} — proposed hidden; check the name manually before applying`);
    deactivations.push({ id: String(u._id), name: u.name, reason, diff: { isActive: { from: u.isActive, to: false }, dataSource: { from: u.dataSource, to: { provider: PROVIDER, runId: RUN_ID, syncedAt, fields: ['isActive'], reason, urls: [croho.packageUrl, addresses.packageUrl] } } } });
  }
  const DEFAULTISH = { minIeltsScore: 6.5, minGpaPercent: 60, ieltsScore: 'IELTS 6.0+', minScore: 'GPA 3.0+', greExam: 'GRE Waived', workExp: 'Freshers Eligible', acceptanceRate: '66%' };
  for (const u of ours.filter((x) => matchedIds.has(String(x._id)))) {
    const fields = Object.entries(DEFAULTISH).filter(([k, v]) => u[k] === v).map(([k]) => k);
    if (fields.length) unverifiedFields.push({ name: u.name, fields, note: 'left unchanged (requirement fields are never touched by this sync)' });
  }

  // 6) Other OCW-funded institutions not created (all are eligible/recognised; leaving them out is a scope choice)
  const configured = new Set(INSTITUTIONS.map((e) => e.brin));
  const candidatesNotCreated = addresses.records.filter((a) => !configured.has(a.INSTELLINGSCODE)).map((a) => {
    // distinct current CROHO codes (one register row per programme and form) — same count as evidence.croho
    const n = new Set(croho.records.filter((r) => r.INSTELLINGSCODE === a.INSTELLINGSCODE && ['WO-BA', 'WO-MA', 'HBO-BA', 'HBO-MA'].includes(r.NIVEAU)
      && r.STATUS === 'ACTUEEL' && !(r.INSTROOM_EINDDATUM && String(r.INSTROOM_EINDDATUM).slice(0, 10) < today)).map((r) => r.ERKENDEOPLEIDINGSCODE)).size;
    const nm = a.INSTELLINGSNAAM;
    let why;
    if (a['SOORT HO'] === 'wo') {
      why = /Open Universiteit/i.test(nm) ? 'distance-learning university (no campus study; not relevant for student-visa applicants) — not created (scope choice)'
        : `small theological/humanistic university (${n} programmes, mainly Dutch-taught) — not created (scope choice)`;
    } else if (/Kunsten|ArtEZ|Codarts|Rietveld|Design Academy/i.test(nm)) why = `arts university of applied sciences (art academy/conservatoire, ${n} programmes) — not created (scope choice)`;
    else if (/Driestar|Viaa|Marnix|IPABO|Iselinge|Kempel|KPZ|Thomas More|Pabo/i.test(nm)) why = `teacher-training college (${n} programmes, mainly Dutch-taught primary/secondary teacher education) — not created (scope choice)`;
    else if (/Van Hall Larenstein|Aeres|HAS green/i.test(nm)) why = `specialised agriculture/life-sciences university of applied sciences (${n} programmes) — not created (scope choice)`;
    else if (/Hotelschool/i.test(nm)) why = `specialised hospitality school (${n} programmes) — not created (scope choice)`;
    else if (n >= 30) why = `general OCW-funded university of applied sciences (${n} programmes) — eligible; left out only by scope choice (not configured in this script yet; can be added with the same pipeline)`;
    else why = `smaller OCW-funded university of applied sciences (${n} programmes) — eligible; not created (scope choice)`;
    return { brin: a.INSTELLINGSCODE, name: nm, type: a['SOORT HO'], city: a.PLAATSNAAM, website: a.INTERNETADRES, crohoBachelorMasterProgrammes: n, eligible: true, reason: why };
  }).sort((a, b) => (a.type === b.type ? b.crohoBachelorMasterProgrammes - a.crohoBachelorMasterProgrammes : a.type === 'wo' ? -1 : 1));

  // 7) Country document
  const createdCities = [...new Set(creates.map((c) => c.doc.city).filter(Boolean))].sort();
  let country = null;
  if (!nlCountry && creates.length) {
    country = {
      action: 'create', id: String(countryId),
      doc: { _id: String(countryId), name: 'Netherlands', code: 'netherlands', cities: createdCities, visaLinks: [], courseLinks: [], dataSource: { provider: PROVIDER, createdBySync: SYNC_ID, runId: RUN_ID, syncedAt, note: 'cities = seats of the institutions created by this sync (DUO address register)' } },
      reason: "no 'Netherlands' document in the countries collection (checked name/code); universities need a country ObjectId",
    };
  } else if (nlCountry) country = { action: 'exists', id: String(nlCountry._id), name: nlCountry.name, code: nlCountry.code };
  const frontendNotes = [
    'Backend lists countries from the DB (Country.find) and filters universities by country code, so a new "Netherlands" country (code "netherlands") appears automatically wherever the country list is loaded from the API.',
    'frontend/src/utils/courseFinderHelper.js COUNTRY_META has no Netherlands entry: getCountryMeta("Netherlands") falls back to { code: "un", flag "🌐", currency USD } — add { code: "nl", name: "Netherlands", flagUrl: "https://flagcdn.com/w40/nl.png", currency: "EUR", symbol: "€", majorCities: [...] } and a /netherlands|holland/ check.',
    'frontend/src/utils/dataSourceLabel.js has no Dutch label: the provider string falls back to "Official government & university data" (acceptable; optionally add /DUO|Nuffic|netherlands/ → "Official Dutch Govt & university data").',
    'frontend/src/components/EligibilityModal.jsx main country list has no Netherlands (it is only under "Other"); shortlistOptions.jsx and CountrySelect.jsx already list Netherlands; there is no /study-abroad/netherlands page.',
  ];

  // 8) Report
  const summary = {
    runId: RUN_ID, mode: APPLY ? 'apply' : 'dry-run', country: country ? country.action : 'none',
    ourNetherlandsRecords: ours.length, creates: creates.length, updates: updates.length, deactivations: deactivations.length,
    unchanged: table.filter((r) => r.action === 'unchanged').length, skipped: table.filter((r) => /skipped/.test(r.action)).length,
    feesFromOfficialPages: table.filter((r) => /official/.test(r.feeSource || '')).length, feesFromStudyInNl: table.filter((r) => /studyinnl/.test(r.feeSource || '')).length,
    candidatesNotCreated: candidatesNotCreated.length, errors: errors.length, fx, requests: counters,
  };
  const methodNotes = [
    'Institutions: BRIN code checked against DUO "Adressen in het hoger onderwijs" (OCW-funded institutions → type PUBLIC, seat city; \'s-Gravenhage shown as The Hague) and current CROHO recognitions (Bachelor/Master). City = DUO seat, unless the seat city has no English-taught RIO offering (Avans: seat Tilburg → Breda; Inholland: seat Rotterdam → city with most English-taught offerings); the seat stays in dataSource.seatCity.',
    'English names: Study in NL (Nuffic) Studyfinder institution record or Study in NL institution lists. Website: must be the domain listed by DUO or Study in NL.',
    `Courses: English-taught full-time Bachelor's/Master's programmes — Study in NL Studyfinder (programme name + qualification) plus RIO offerings with language of instruction ENG; pre-master/bridging offerings (RIO registers them at Bachelor level) are dropped; soft hyphens and " - Voltijd/Fulltime" suffixes removed; Master's first, deduplicated, capped at ${COURSE_CAP}. Dutch-taught programmes are counted in the evidence but not listed.`,
    'Fees: non-EU institutional fee per year for full-time study, from the institution\'s own fee page/PDF or its per-programme pages (UU, Radboud, NHL Stenden masters) where they can be read; otherwise from the Study in NL tuition records ("international" = non-EU fee type; BUas lists only an "institutional" type, kept because its own page states that non-EU students pay the institutional fee). Per level, official rows win over Study in NL rows and per-programme rows over faculty/rate-group rows. Medicine/dentistry rows are listed but excluded from range and median. Display range = min–max of the rows used; USD fields = median × ECB rate.',
    'Programme weighting: where the official document assigns programmes to rate groups (UT tier lists, Fontys exception lists, Zuyd Low/High/Top table), each English-taught programme gets its group\'s fee (matched on its English name and its RIO/CROHO register names); programmes no group names get the standard rate only if they have a register name, otherwise they are left out and listed under fees.<key>.programmeMapping.unmapped. Where only faculty rates are published (UvA, EUR, Leiden bachelor), the median is over distinct faculty rates (identical sub-rows of one faculty count once).',
    'EU/EEA statutory fee 2026/27 (EUR 2,694) from DUO is mentioned in the tuition text only; no field holds it.',
  ];
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, `netherlands-sync-${syncedAt.toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`);
  const report = {
    meta: { script: 'scripts/dataSync/netherlandsSync.js', mode: APPLY ? 'apply' : 'dry-run', generatedAt: syncedAt, fx, scrapeDoRequestsThisRun: counters.scrapeDoRequests, cacheDir: CACHE_DIR, fetched: fetchLog },
    runId: RUN_ID, summary,
    sources: {
      croho: { title: croho.title, modified: croho.modified, package: croho.packageUrl, resource: croho.resource, records: croho.records.length },
      rio: { title: rio.title, modified: rio.modified, package: rio.packageUrl, resource: rio.resource, records: rio.records.length },
      addresses: { title: addresses.title, modified: addresses.modified, package: addresses.packageUrl, resource: addresses.resource, records: addresses.records.length, fundedQuote: { quote: fundedQuote, verified: fundedQuoteOk } },
      studyInNl: { api: `${SINL}/api/programs`, lists: [SINL_WO_LIST, SINL_HBO_LIST] }, statutoryFee: duoFee,
    },
    country, table, nulls, uncertainties, errors, creates, updates, deactivations, unverifiedFields, fees: feesReport, candidatesNotCreated, frontendNotes, methodNotes,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.table(table.map((r) => ({ institution: r.institution, action: r.action, city: r.city, courses: r.courses, src: r.feeSource, year: r.feeYear, bachelor: r.bachelorFee ? r.bachelorFee.split(', median')[0] : null, master: r.masterFee ? r.masterFee.split(', median')[0] : null })));
  console.log(`full report: ${reportPath}`);

  if (APPLY) {
    // Every write is recorded in the report right after it happens (and the report is re-saved), so an interrupted apply
    // still leaves a report --revert can use; --revert additionally finds this run's documents by dataSource.runId.
    // Order: country → creates → deactivations → updates (a duplicate is hidden before its keeper takes over its
    // name/country/city slot of the unique index); a failing write is recorded on its change and the run goes on.
    const now = new Date();
    const save = () => fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    report.applyStartedAt = now;
    save();
    const failMsg = (err) => (err.code === 11000 ? `E11000 duplicate key (unique name/country/city): ${err.message}` : err.message);
    if (country?.action === 'create') {
      try {
        await db.collection('countries').insertOne({ ...country.doc, _id: countryId, createdAt: now, updatedAt: now, __v: 0 });
        country.inserted = true;
        save();
      } catch (err) { country.failed = failMsg(err); save(); throw new Error(`country insert failed (${err.message}); nothing else written`); }
    }
    const col = db.collection('universities');
    const counts = { inserted: 0, deactivated: 0, updated: 0, failed: 0 };
    for (const c of creates) {
      const doc = { ...c.doc, _id: new mongoose.Types.ObjectId(c.id), country: countryId, createdAt: now, updatedAt: now, dataSource: { ...c.doc.dataSource, syncedAt: now } };
      try { await col.insertOne(doc); c.inserted = true; counts.inserted += 1; } catch (err) { c.skipped = err.code === 11000 ? 'a record with the same name/country/city exists' : err.message; counts.failed += 1; }
      save();
    }
    for (const d of deactivations) {
      try {
        const r = await col.updateOne({ _id: new mongoose.Types.ObjectId(d.id) }, { $set: { isActive: false, dataSource: d.diff.dataSource.to, updatedAt: now } });
        d.applied = r.modifiedCount === 1;
        counts.deactivated += r.modifiedCount;
      } catch (err) { d.skipped = failMsg(err); counts.failed += 1; }
      save();
    }
    for (const u of updates) {
      const set = { updatedAt: now };
      for (const [k, v] of Object.entries(u.diff)) set[k] = v.to;
      try {
        const r = await col.updateOne({ _id: new mongoose.Types.ObjectId(u.id) }, { $set: set });
        u.applied = r.modifiedCount === 1;
        counts.updated += r.modifiedCount;
      } catch (err) { u.skipped = failMsg(err); counts.failed += 1; }
      save();
    }
    report.appliedAt = new Date();
    report.applyResult = counts;
    save();
    console.log(`APPLIED: country ${country?.inserted ? 'created' : 'unchanged'}, ${counts.inserted} created, ${counts.updated} updated, ${counts.deactivated} deactivated, ${counts.failed} failed (see the report) (revert: --revert ${reportPath})`);
  }
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('FAILED:', err.stack || err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
