/**
 * Sync Canadian institutions with official sources.
 *
 *   node scripts/dataSync/canadaSync.js                          # DRY RUN: fetch + match + report, writes nothing
 *   node scripts/dataSync/canadaSync.js --apply --expect <dry-run report.json>
 *                                                                # write the creates/updates/deactivations of this run, but only
 *                                                                # if they are exactly the plan of the reviewed dry run (plan.hash)
 *   node scripts/dataSync/canadaSync.js --apply --no-expect      # explicit opt-out of the plan check (unreviewed plan)
 *   node scripts/dataSync/canadaSync.js --revert <report.json>   # undo an APPLIED (or half-applied) run; dry-run reports are refused
 *   --accept-review-notes: --apply is refused while the report has blocking reviewNotes, unless this flag is given
 *                          (e.g. "Bachelor's-only official fees": the shortlist budget filter would use the official
 *                          Bachelor's median as the Master's fee of records without graduateTuitionUSD)
 *
 * Only records whose values change are written (re-runs are idempotent and keep earlier official markers that still
 * hold). dataSource.provider/syncedAt — which make the website show "Official government & university data" on the
 * record AND on the fee of every programme row — are set only when everything the website shows under that label is
 * official: an official fee for every level the record offers (a Bachelor's-only fee is not enough for a record with
 * Master's programmes) and an official course list. Other written records carry sourceNames/checkedAt (+ the official
 * fee data and labelWithheld); see methodNotes and reviewNotes in the report.
 * Reports are named <runId>-<mode>.json (second precision) and are never overwritten by another run.
 * --apply recomputes the plan from the pages/cache and the DB; with --expect it uses the reviewed report's CAD→USD rate and
 * aborts before the first write when any planned record, field or value differs from that report (plan.entries).
 *
 * Options: --refresh (ignore the 7-day page cache), --max-scrapedo <n> (default 6 per run; 0 = never use scrape.do).
 *
 * Sources (all official):
 *  - IRCC "Designated learning institutions list" (canada.ca) and the data file that page loads
 *    (dli-full-list.json): DLI number, province, campuses/cities, public/private, PGWP eligibility (Yes / No /
 *    "Details" = only the programs listed on IRCC's details page) and whether a PUBLIC DLI offers degree-granting
 *    graduate (master's/doctoral) programs that are PAL/TAL-exempt. IRCC: "You need a letter of acceptance (LOA) from a
 *    DLI to apply for a study permit." Records of institutions that are not DLIs, are faculties/campuses of another
 *    record, or duplicate another record are hidden (isActive:false). Never deletes.
 *  - Universities Canada member list (univcan.ca): university status and the official website it links to.
 *  - Ten universities' own international tuition schedules (HTML tables / PDFs, see FEE_SOURCES) → Bachelor's /
 *    Master's yearly fee ranges + medians, CAD → USD at the latest ECB rate (api.frankfurter.app; no fallback rate).
 *    Every kept fee row carries its URL and a verbatim quote that is found in the fetched page/PDF text.
 *  - Official programme lists (UofT School of Graduate Studies, UBC Graduate School, Carleton Graduate Studies +
 *    Carleton's international fee table) → courses for those three, unless a list is longer than COURSE_CAP (it is never
 *    cut alphabetically; then the existing list stays). All other course lists are left unchanged and flagged in the report.
 *  - Context only, NEVER stored as an institution's fee: Statistics Canada table 37-10-0045-01 (provincial averages)
 *    and Universities Canada's "Tuition fees by university" table (StatCan data for arts & humanities programs).
 *
 * Ranking fields (rank, rankingNum, rankingSource) and admission-requirement fields are never touched. Reports and the
 * page cache go to backend/reports/ (git-ignored), so re-runs cost no scrape.do credits. PDF schedules (UofT, McGill)
 * are read with `pdftotext` (xpdf/poppler, ships with Git for Windows); without it those fees stay unchanged.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const ARGS = process.argv.slice(2);
// A flag that takes a value must be followed by one (a missing value is an error, never "flag not given")
function flagValue(flag) {
  const i = ARGS.indexOf(flag);
  if (i === -1) return undefined;
  const v = ARGS[i + 1];
  if (v === undefined || v.startsWith('--')) throw new Error(`${flag} needs a value`);
  return v;
}
function parseCli() {
  const known = new Set(['--apply', '--refresh', '--expect', '--no-expect', '--accept-review-notes', '--revert', '--max-scrapedo']);
  const valued = new Set(['--expect', '--revert', '--max-scrapedo']);
  ARGS.forEach((a, i) => { if (a.startsWith('--') && !known.has(a)) throw new Error(`unknown option ${a}`); if (!a.startsWith('--') && !valued.has(ARGS[i - 1])) throw new Error(`unexpected argument "${a}"`); });
  const cli = {
    apply: ARGS.includes('--apply'), refresh: ARGS.includes('--refresh'), noExpect: ARGS.includes('--no-expect'),
    acceptReviewNotes: ARGS.includes('--accept-review-notes'), expect: flagValue('--expect'), revert: flagValue('--revert'),
  };
  const max = flagValue('--max-scrapedo');
  if (max !== undefined && !/^\d+$/.test(max)) throw new Error('--max-scrapedo needs a whole number');
  cli.maxScrapeDo = max !== undefined ? Number(max) : 6;
  if (cli.revert !== undefined && (cli.apply || cli.expect !== undefined || cli.noExpect)) throw new Error('--revert cannot be combined with --apply/--expect/--no-expect');
  if (cli.expect !== undefined && !cli.apply) throw new Error('--expect is only used together with --apply');
  if (cli.expect !== undefined && cli.noExpect) throw new Error('--expect and --no-expect exclude each other');
  if ((cli.noExpect || cli.acceptReviewNotes) && !cli.apply) throw new Error('--no-expect / --accept-review-notes are only used together with --apply');
  // --apply writes to the live DB: it must reproduce a reviewed dry run, unless the operator explicitly opts out
  if (cli.apply && cli.expect === undefined && !cli.noExpect) throw new Error('--apply needs --expect <reviewed dry-run report.json> (or an explicit --no-expect to write a freshly computed plan that nobody reviewed)');
  return cli;
}
let CLI;
try { CLI = parseCli(); } catch (err) { console.error(`FAILED: ${err.message}`); process.exit(1); }
const APPLY = CLI.apply;
const REFRESH = CLI.refresh;
const MAX_SCRAPEDO = CLI.maxScrapeDo;
const EXPECT = CLI.expect; // reviewed dry-run report whose plan --apply must reproduce exactly
const SYNC_ID = 'canadaSync';
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');
const CACHE_DIR = path.join(REPORT_DIR, '.cache', 'canada');
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const PLAIN_UA = 'UniCoachDataSync/1.0 (official data verification)';
const DLI_PAGE = 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html';
const DLI_JSON = 'https://www.canada.ca/content/dam/ircc/documents/json/dli/dli-full-list.json';
const DLI_JSON_PATH = '/content/dam/ircc/documents/json/dli/dli-full-list.json';
const DLI_RULE_QUOTES = [
  'You need a letter of acceptance (LOA) from a DLI to apply for a study permit.',
  'A DLI is a school approved by a provincial or territorial government to host international students.',
];
const UNIVCAN_MEMBERS = 'https://univcan.ca/about-universities-canada/our-members/';
const UNIVCAN_TUITION = 'https://univcan.ca/about-universities-canada/facts-and-stats/tuition-fees-by-university/';
const STATCAN_TABLE = 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3710004501';
const STATCAN_ZIP = 'https://www150.statcan.gc.ca/n1/tbl/csv/37100045-eng.zip';
const FX_URL = 'https://api.frankfurter.app/latest?from=CAD&to=USD';
const FEE_YEAR = '2026/27';
const COURSE_CAP = 150;
// The website treats a fee as official when dataSource.provider is set AND dataSource.fields contains one of these
// (frontend hasOfficialFee), and shows the "Official government & university data" label whenever provider is set.
// provider/syncedAt are therefore written only when everything shown under that label is official (see the update branch);
// other synced records carry sourceNames/checkedAt instead.
const FEE_FIELDS = ['tuitionFeeUSD', 'graduateTuitionUSD', 'tuition'];
// written but not listed in dataSource.fields (only partly from an official source; see dataSource.derived)
const DERIVED_FIELDS = ['categoryTags'];
// a record "offers graduate programmes" when its degree levels or course names say so
const GRAD_LEVEL = /master|postgrad|ph\.?\s?d|doctor/i;
const GRAD_COURSE = /^(?:master|doctor)\b|\((?:master's|ph\.?d|doctoral)\)/i;
const MIN_LEVEL_ROWS = 3; // a per-level USD figure (tuitionFeeUSD / graduateTuitionUSD) needs at least this many programme rows
// IRCC data file sanity: size last seen (2026-10-04) and the columns this script reads
const LAST_KNOWN_DLI_ROWS = 1425;
const LAST_KNOWN_MEMBERS = 97; // Universities Canada member list size last seen (2026-10-04)
const DLI_COLUMNS = ['Province', 'Institution', 'DLI #', 'City', 'Campus', 'Grad Program', 'PGWP', 'Public/Private'];
const { SCRAPE_DO_TOKEN } = process.env;
const RUN_ID = `canada-sync-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
const PROVIDER = 'IRCC Designated Learning Institutions list + Universities Canada + official institution pages';
const counters = { directRequests: 0, scrapeDoRequests: 0, cacheHits: 0 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- text helpers ----------
const squash = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const apos = (s) => String(s ?? '').replace(/[’‘`´]/g, "'");
const fold = (s) => apos(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = (s) => fold(s).toLowerCase().replace(/[^a-z0-9.]+/g, ' ').replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2')
  .replace(/\s+/g, ' ').trim();
const money = (n) => Math.round(n).toLocaleString('en-US');
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
const hostOf = (url) => String(url || '').trim().toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0];
const hostKey = (url) => hostOf(url).replace(/^www\d*\./, '');
const origin = (url) => {
  const u = String(url || '').trim();
  if (!u) return null;
  try { return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).origin.toLowerCase(); } catch (_) { return null; }
};
// All money amounts in a cell: "$40,000 - $44,000" → [40000, 44000]; "47,608.68" → [47608.68]
const amounts = (s) => [...String(s || '').matchAll(/\$?\s?(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d{4,6}(?:\.\d+)?)(?![\d,])/g)]
  .map((m) => Number(m[1].replace(/,/g, '')));

// Visible page text with a space between elements (so table cells do not run together); memoised on the page object
function textOf(page) {
  if (page._text === undefined) {
    if (page.bodyB64) {
      page._text = squash(pdfText(page, 'layout'));
    } else {
      const $ = cheerio.load(String(page.body).replace(/>/g, '> '));
      $('head,script,style,noscript,svg,iframe').remove();
      page._text = squash($.root().text());
    }
    page._norm = norm(page._text);
  }
  return page._text;
}
const inText = (text, quote) => Boolean(quote) && norm(text).includes(norm(quote));
const inPage = (page, quote) => { textOf(page); return Boolean(quote) && page._norm.includes(norm(quote)); };

// ---------------------------------------------------------------- HTTP with cache + scrape.do fallback ----------
const isBlocked = (status, body) => status === 403 || status === 429 || status === 503
  || /<title>\s*(Just a moment|Attention Required|Access Denied)/i.test(String(body).slice(0, 20000));

async function getPage(url, { scrapeDo = true } = {}) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, `${crypto.createHash('sha1').update(url).digest('hex')}.json`);
  if (!REFRESH && fs.existsSync(file)) {
    const cached = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (cached.fetchedAt && Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS) { counters.cacheHits += 1; return cached; }
  }
  let status = 0;
  let buf = Buffer.alloc(0);
  let contentType = '';
  let finalUrl = url;
  let via = 'direct';
  let lastError = '';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,application/pdf;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-CA,en;q=0.9' },
        redirect: 'follow',
        signal: AbortSignal.timeout(60000),
      });
      counters.directRequests += 1;
      status = res.status;
      finalUrl = res.url || url;
      contentType = res.headers.get('content-type') || '';
      buf = Buffer.from(await res.arrayBuffer());
      break;
    } catch (err) {
      lastError = err.cause?.code || err.name || err.message;
      if (attempt < 2) await sleep(2000);
    }
  }
  const isBinary = () => /pdf|zip|octet-stream/i.test(contentType) || buf.slice(0, 5).toString() === '%PDF-' || buf.slice(0, 2).toString() === 'PK';
  // Some sites (univcan.ca) reject a browser UA without browser client hints but accept a plain tool UA: retry
  // directly once with an honest UA before spending scrape.do credits
  if (status !== 0 && isBlocked(status, isBinary() ? '' : buf.toString('utf8'))) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': PLAIN_UA, Accept: '*/*' }, redirect: 'follow', signal: AbortSignal.timeout(60000) });
      counters.directRequests += 1;
      const b = Buffer.from(await res.arrayBuffer());
      if (!isBlocked(res.status, b.toString('utf8', 0, 20000))) {
        status = res.status; finalUrl = res.url || url; contentType = res.headers.get('content-type') || ''; buf = b; via = 'direct (plain UA)';
      }
    } catch (_) { /* fall through to scrape.do */ }
  }
  if ((status === 0 && lastError) || isBlocked(status, isBinary() ? '' : buf.toString('utf8'))) {
    if (!scrapeDo) throw new Error(`${url} not reachable directly (${status ? `HTTP ${status}` : lastError})`);
    if (!SCRAPE_DO_TOKEN) throw new Error(`${url} blocks direct requests and SCRAPE_DO_TOKEN is missing`);
    if (counters.scrapeDoRequests >= MAX_SCRAPEDO) throw new Error(`${url} blocks direct requests; scrape.do budget for this run (${MAX_SCRAPEDO}) used up`);
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
    if (isBlocked(status, isBinary() ? '' : buf.toString('utf8'))) throw new Error(`${url} still blocked via scrape.do (HTTP ${status})`);
  }
  if (status < 200 || status >= 300) throw new Error(`HTTP ${status || lastError || 'error'} for ${url}`);
  const entry = { url, finalUrl, via, status, contentType, fetchedAt: new Date().toISOString(), ...(isBinary() ? { bodyB64: buf.toString('base64') } : { body: buf.toString('utf8') }) };
  fs.writeFileSync(file, JSON.stringify(entry));
  return entry;
}

// pdftotext output for a cached PDF page entry ('layout' keeps columns, 'raw' keeps content-stream order)
function pdfText(page, mode = 'layout') {
  page._pdf = page._pdf || {};
  if (page._pdf[mode] === undefined) {
    const tmp = path.join(os.tmpdir(), `canada-sync-${crypto.createHash('sha1').update(page.url).digest('hex')}-${process.pid}.pdf`);
    fs.writeFileSync(tmp, Buffer.from(page.bodyB64, 'base64'));
    try {
      page._pdf[mode] = execFileSync('pdftotext', [`-${mode}`, '-enc', 'UTF-8', tmp, '-'], { maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8');
    } catch (err) {
      throw new Error(`pdftotext failed for ${page.url} (${err.code === 'ENOENT' ? 'pdftotext not installed' : err.message})`);
    } finally { fs.rmSync(tmp, { force: true }); }
  }
  return page._pdf[mode];
}

// Tables in document order, each tagged with the latest heading before it and the latest "section" heading
function tablesWithContext(html, sectionRe = /international|domestic|canadian|ontario students|out of province/i) {
  const $ = cheerio.load(html);
  $('script,style,noscript,svg').remove();
  const out = [];
  let heading = null;
  let section = null;
  $.root().find('h1,h2,h3,h4,h5,h6,caption,summary,table').each((_, el) => {
    if (el.tagName === 'table') {
      const rows = $(el).find('tr').map((__, tr) => {
        const cells = [];
        $(tr).find('th,td').each((___, c) => {
          const span = Math.min(10, Number($(c).attr('colspan')) || 1);
          for (let i = 0; i < span; i += 1) cells.push(i === 0 ? squash($(c).text()) : '');
        });
        return [cells];
      }).get();
      out.push({ heading, section, rows });
      return;
    }
    if ($(el).closest('table').length) return;
    const t = squash($(el).text());
    if (!t || t.length > 200) return;
    heading = t;
    if (sectionRe.test(t)) section = t;
  });
  return out;
}

async function cadToUsd() {
  let lastError = '';
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(FX_URL, { headers: { 'User-Agent': BROWSER_UA }, signal: AbortSignal.timeout(30000) });
      const j = await res.json();
      if (j?.rates?.USD) return { base: 'CAD', quote: 'USD', rate: j.rates.USD, date: j.date, source: 'ECB reference rate via api.frankfurter.app', url: FX_URL };
      lastError = 'no CAD→USD rate in response';
    } catch (err) { lastError = err.cause?.code || err.message; }
    await sleep(3000 * attempt);
  }
  throw new Error(`frankfurter.app: ${lastError}`);
}

// Minimal ZIP reader (StatCan CSV download): returns { name: Buffer } for stored/deflated entries
function unzip(buf) {
  const files = {};
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd -= 1;
  if (eocd < 0) throw new Error('not a zip file');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let i = 0; i < count; i += 1) {
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nameLen).toString('utf8');
    const dataStart = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const data = buf.slice(dataStart, dataStart + size);
    files[name] = method === 8 ? zlib.inflateRawSync(data) : data;
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}
const csvRow = (line) => [...line.matchAll(/"((?:[^"]|"")*)"|([^,]+)|(?<=,)(?=,|$)/g)].map((m) => (m[1] !== undefined ? m[1].replace(/""/g, '"') : (m[2] || '')));

// ---------------------------------------------------------------- registry (DB record ↔ IRCC DLI) ----------
// Curated mapping; every DLI number/name, Universities Canada membership and website is verified live at run time.
// db: our record names; keep: the record kept when several of ours are one institution (the others are hidden).
const D = (key, dli, dliName, univcan, db, extra = {}) => ({ key, kind: 'dli', dli, dliName, univcan, db: [].concat(db), ...extra });
const NOT_DLI = (key, db, search, extra = {}) => ({ key, kind: 'not-dli', db: [].concat(db), search, ...extra });
const REGINA_DLI = ['O19425660270', 'University of Regina, including Campion College, First Nations University of Canada and Luther College'];
const USASK_DLI = ['O19425660421', 'University of Saskatchewan, including St. Thomas More College'];
const REGISTRY = [
  D('utoronto', 'O19332746152', 'University of Toronto', 'University of Toronto', 'University of Toronto', { fees: 'utoronto', courses: 'utoronto' }),
  D('victoria-uoft', 'O19332746152', 'Victoria College in Victoria University (University of Toronto)', 'Victoria University', 'Victoria University in the University of Toronto', { federatedWith: 'utoronto' }),
  D('usmc', 'O19303916042', "University of St. Michael's College", "University of St. Michael's College", "University of St. Michael's College", { federatedWith: 'utoronto' }),
  D('trinity-uoft', 'O211893245447', 'University of Trinity College', 'University of Trinity College', 'University of Trinity College', { federatedWith: 'utoronto' }),
  D('knox', 'O19859651317', 'Knox College', null, 'Knox College'),
  D('wycliffe', 'O19572552822', 'Wycliffe College', null, 'Wycliffe College'),
  D('regis', 'O19358972972', 'Regis College', null, 'Regis College'),
  D('staugustine', 'O19361100382', "St. Augustine's Seminary of Toronto", null, "St. Augustine's Seminary"),
  D('ubc', 'O19330231062', 'University of British Columbia (UBC)', 'University of British Columbia (The)', 'University of British Columbia', { fees: 'ubc', courses: 'ubc' }),
  D('mcgill', 'O19359011033', 'McGill University', 'McGill University', 'McGill University', { fees: 'mcgill' }),
  D('ualberta', 'O19257171832', 'University of Alberta', 'University of Alberta', 'University of Alberta', {
    campusRecords: [{ db: 'Augustana Faculty, University of Alberta', campus: 'Augustana Campus' }],
  }),
  D('macewan', 'O19092022262', 'MacEwan University', 'MacEwan University', 'MacEwan University'),
  D('lakehead', 'O19396019447', 'Lakehead University', 'Lakehead University', 'Lakehead University'),
  D('inrs', 'O19359011185', 'Institut national de la recherche scientifique', 'Institut national de la recherche scientifique',
    ['Institut national de la recherche scientifique', 'INRS (Institut national de la recherche scientifique)'], { keep: 'Institut national de la recherche scientifique' }),
  D('athabasca', 'O19092373272', 'Athabasca University', 'Athabasca University', 'Athabasca University'),
  D('kpu', 'O19350676872', 'Kwantlen Polytechnic University', 'Kwantlen Polytechnic University', 'Kwantlen Polytechnic University'),
  D('uregina', ...REGINA_DLI, 'University of Regina', 'University of Regina'),
  D('fnuniv', ...REGINA_DLI, 'First Nations University of Canada', 'First Nations University of Canada', { federatedWith: 'uregina' }),
  D('campion', ...REGINA_DLI, 'Campion College', 'Campion College at the University of Regina', { federatedWith: 'uregina' }),
  D('luther', ...REGINA_DLI, 'Luther College', 'Luther College at the University of Regina', { federatedWith: 'uregina' }),
  D('viu', 'O19395299688', 'Vancouver Island University', 'Vancouver Island University', 'Vancouver Island University'),
  D('ontariotech', 'O19315945002', 'Ontario Tech University', 'Ontario Tech University',
    ['Ontario Tech University (UOIT)', 'University of Ontario Institute of Technology', 'University of Ontario Institute of Technology (Ontario Tech)'], { keep: 'Ontario Tech University (UOIT)' }),
  D('stfx', 'O19391556899', 'St. Francis Xavier University', 'St. Francis Xavier University', 'St. Francis Xavier University'),
  D('mru', 'O18761482032', 'Mount Royal University', 'Mount Royal University', 'Mount Royal University'),
  D('brandon', 'O19201298932', 'Brandon University', 'Brandon University', 'Brandon University'),
  D('uqac', 'O19359011122', 'Université du Québec à Chicoutimi', 'Université du Québec à Chicoutimi (UQAC)', 'Université du Québec à Chicoutimi'),
  D('kingsu', 'O18713250142', "The King's University", "King's University (The)", ["The King's University (Edmonton)", "The King's University College"], { keep: "The King's University (Edmonton)" }),
  D('huron', 'O19332573852', 'Huron University College', 'Huron University College', 'Huron University College', { affiliatedWith: 'western' }),
  D('uottawa', 'O19397188593', "Université d'Ottawa/University of Ottawa", 'University of Ottawa', 'University of Ottawa', {
    facultyRecords: [{ db: 'Telfer School of Management', search: ['Telfer'], evidenceUrl: 'https://telfer.uottawa.ca/en/', evidenceRe: /Telfer School of Management[^.]{0,80}(University of Ottawa|uOttawa)|(University of Ottawa|uOttawa)[^.]{0,80}Telfer/i }],
  }),
  D('uleth', 'O18776949622', 'University of Lethbridge', 'University of Lethbridge', 'University of Lethbridge'),
  D('usherbrooke', 'O19359011083', 'Université de Sherbrooke', 'Université de Sherbrooke', 'Université de Sherbrooke'),
  D('tru', 'O19395299610', 'Thompson Rivers University', 'Thompson Rivers University', 'Thompson Rivers University'),
  D('royalroads', 'O19330635812', 'Royal Roads University', 'Royal Roads University', 'Royal Roads University'),
  D('ets', 'O19359201210', 'École de technologie supérieure', 'École de technologie supérieure',
    ['École de technologie supérieure', 'ÉTS (École de technologie supérieure)'], { keep: 'École de technologie supérieure' }),
  D('ufv', 'O19395299642', 'University of the Fraser Valley', 'University of the Fraser Valley', 'University of the Fraser Valley'),
  D('twu', 'O19347055392', 'Trinity Western University', 'Trinity Western University', 'Trinity Western University'),
  D('mta', 'O19273922302', 'Mount Allison University', 'Mount Allison University', 'Mount Allison University'),
  D('cbu', 'O19391556824', 'Cape Breton University', 'Cape Breton University', 'Cape Breton University'),
  D('upei', 'O19220071452', 'University of Prince Edward Island', 'University of Prince Edward Island', 'University of Prince Edward Island'),
  D('unb', 'O19348802512', 'University of New Brunswick', 'University of New Brunswick', 'University of New Brunswick'),
  D('redeemer', 'O19395677559', 'Redeemer University', 'Redeemer University', 'Redeemer University'),
  D('uqo', 'O19359011146', 'Université du Québec en Outaouais Pavillon Alexandre-Taché', 'Université du Québec en Outaouais', 'Université du Québec en Outaouais'),
  D('acadia', 'O19391556792', 'Acadia University', 'Acadia University', 'Acadia University'),
  D('bishops', 'O19359010995', "Bishop's University", "Bishop's University", "Bishop's University"),
  D('rmc', 'O19993856974', 'Royal Military College of Canada', 'Royal Military College of Canada', 'Royal Military College of Canada'),
  D('cue', 'O19073475522', 'Concordia University of Edmonton', 'Concordia University of Edmonton', 'Concordia University of Edmonton'),
  D('nipissing', 'O19395535971', 'Nipissing University', 'Nipissing University', 'Nipissing University'),
  D('ocad', 'O19332928222', 'OCAD University', 'OCAD University', ['OCAD University', 'OCAD University (Ontario College of Art and Design)'], { keep: 'OCAD University' }),
  D('uqtr', 'O19359011172', 'Université du Québec à Trois-Rivières', 'Université du Québec à Trois-Rivières (UQTR)', 'Université du Québec à Trois-Rivières'),
  D('kings-western', 'O19376872842', "King's University College", "King's University College at Western University",
    ["King's University College", "King's University College at Western University"], { keep: "King's University College", affiliatedWith: 'western' }),
  D('ukings', 'O19391556768', "University of King's College", "University of King's College", "University of King's College"),
  D('brock', 'O19394569014', 'Brock University', 'Brock University', 'Brock University'),
  D('uqar', 'O19359011159', 'Université du Québec à Rimouski', 'Université du Québec à Rimouski (UQAR)', 'Université du Québec à Rimouski'),
  D('nwpolytech', 'O19391056654', 'Northwestern Polytechnic', null, 'Northwestern Polytechnic'),
  D('algoma', 'O19395422197', 'Algoma University', 'Algoma University', 'Algoma University'),
  D('waterloo', 'O19305471522', 'University of Waterloo', 'University of Waterloo', 'University of Waterloo', { fees: 'waterloo' }),
  D('sju', 'O19305471522', "St. Jerome's University (University of Waterloo)", "St. Jerome's University", "St. Jerome's University", { federatedWith: 'waterloo' }),
  D('grebel', 'O19305471522', 'Conrad Grebel University College', null, 'Conrad Grebel University College', { federatedWith: 'waterloo' }),
  D('renison', 'O19395281561', 'Renison University College', null, 'Renison University College', { affiliatedWith: 'waterloo' }),
  D('western', 'O19375892122', 'Western University', 'Western University', ['Western University', 'Western University (University of Western Ontario)'], { keep: 'Western University' }),
  D('umontreal', 'O19359011045', 'Université de Montréal', 'Université de Montréal', ['Université de Montréal', 'University of Montreal'], { keep: 'Université de Montréal' }),
  D('ucalgary', 'O18886830282', 'University of Calgary', 'University of Calgary', 'University of Calgary'),
  D('mcmaster', 'O19395535729', 'McMaster University', 'McMaster University', 'McMaster University'),
  D('queens', 'O19376023352', "Queen's University", "Queen's University", "Queen's University", { fees: 'queens' }),
  D('dal', 'O19209939282', 'Dalhousie University', 'Dalhousie University', 'Dalhousie University', { fees: 'dal' }),
  D('usask', ...USASK_DLI, 'University of Saskatchewan', 'University of Saskatchewan', { fees: 'usask' }),
  D('stmc', ...USASK_DLI, 'St. Thomas More College', 'St. Thomas More College', { federatedWith: 'usask' }),
  D('sfu', 'O18781994282', 'Simon Fraser University (SFU)', 'Simon Fraser University', 'Simon Fraser University'),
  D('hec', 'O19359011058', 'École des Hautes Études Commerciales de Montréal (HEC Montréal)', 'HEC Montréal',
    ['HEC Montréal', 'École des hautes études commerciales (HEC Montréal)'], { keep: 'HEC Montréal' }),
  D('uvic', 'O19280533442', 'University of Victoria', 'University of Victoria', 'University of Victoria'),
  D('polymtl', 'O19359011070', 'École Polytechnique de Montréal', 'Polytechnique Montréal', 'Polytechnique Montréal'),
  D('laval', 'O19359011020', 'Université Laval', 'Université Laval', 'Université Laval'),
  D('concordia', 'O19359011007', 'Concordia University', 'Concordia University', 'Concordia University'),
  D('yorku', 'O19361109242', 'York University', 'York University', 'York University', { fees: 'yorku' }),
  D('guelph', 'O19305391192', 'University of Guelph', 'University of Guelph', 'University of Guelph'),
  D('uqam', 'O19359011134', 'Université du Québec à Montréal', 'Université du Québec à Montréal (UQAM)', 'Université du Québec à Montréal'),
  D('laurier', 'O19395164307', 'Wilfrid Laurier University', 'Wilfrid Laurier University',
    ['Wilfrid Laurier University', 'Wilfrid Laurier University (Wilfred Laurier)'], { keep: 'Wilfrid Laurier University' }),
  D('carleton', 'O19332687812', 'Carleton University', 'Carleton University', 'Carleton University', { fees: 'carleton', courses: 'carleton' }),
  D('umanitoba', 'O19091528512', 'University of Manitoba', 'University of Manitoba', 'University of Manitoba'),
  D('mun', 'O19440995346', 'Memorial University of Newfoundland', 'Memorial University of Newfoundland and Labrador', 'Memorial University of Newfoundland'),
  D('smu', 'O19021279692', "Saint Mary's University", "Saint Mary's University", "Saint Mary's University"),
  D('uwinnipeg', 'O19147986012', 'University of Winnipeg', 'University of Winnipeg (The)', 'University of Winnipeg'),
  D('unbc', 'O19283889692', 'University of Northern British Columbia', 'University of Northern British Columbia', 'University of Northern British Columbia (UNBC)'),
  D('ecuad', 'O19361259712', 'Emily Carr University of Art and Design', 'Emily Carr University of Art + Design', 'Emily Carr University of Art + Design'),
  D('trent', 'O19395164223', 'Trent University', 'Trent University', 'Trent University'),
  D('tmu', 'O19395677651', 'Toronto Metropolitan University (TMU)', 'Toronto Metropolitan University',
    ['Toronto Metropolitan University (formerly Ryerson University)', 'Ryerson University (TMU)', 'Toronto Metropolitan University (Ryerson)'],
    { keep: 'Toronto Metropolitan University (formerly Ryerson University)', fees: 'tmu' }),
  D('uwindsor', 'O19358946722', 'University of Windsor', 'University of Windsor', 'University of Windsor'),
  D('laurentian', 'O19304259382', 'Laurentian University', 'Laurentian University', 'Laurentian University'),
  D('capilano', 'O19280078102', 'Capilano University', 'Capilano University', 'Capilano University'),
  D('nscad', 'O19021269652', 'NSCAD University (Nova Scotia College of Art and Design)', 'NSCAD University', 'Nova Scotia College of Art and Design University (NSCAD)'),
  D('umoncton', 'O19391556532', 'Université de Moncton', 'Université de Moncton', 'Université de Moncton'),
  D('enap', 'O19359011197', "École nationale d'administration publique", "École nationale d'administration publique",
    ["ENAP (École nationale d'administration publique)", "Université du Québec, École nationale d'administration publique (ENAP)"], { keep: "ENAP (École nationale d'administration publique)" }),
  D('msvu', 'O19301947442', 'Mount Saint Vincent University', 'Mount Saint Vincent University', 'Mount Saint Vincent University'),
  D('uqat', 'O19359011109', 'Université du Québec en Abitibi-Témiscamingue', 'Université du Québec en Abitibi-Témiscamingue (UQAT)', 'Université du Québec en Abitibi-Témiscamingue'),
  D('teluq', 'O19359201245', 'Télé-université', 'Université TÉLUQ', ['TÉLUQ University', 'Université du Québec, Télé-université du Québec (TÉLUQ)'], { keep: 'TÉLUQ University' }),
  D('ustboniface', 'O19126670302', 'Université de Saint-Boniface', 'Université de Saint-Boniface', 'Université de Saint-Boniface'),
  D('yukonu', 'O19604209351', 'Yukon University', 'Yukon University', 'Yukon University'),
  D('stu', 'O19391556376', 'St. Thomas University', 'St. Thomas University', 'St. Thomas University'),
  D('saintpaul', 'O19395164265', 'Université Saint-Paul/St. Paul University', null, 'Saint-Paul University', { federatedWith: 'uottawa' }),
  D('cmu', 'O19021102272', 'Canadian Mennonite University', 'Canadian Mennonite University', 'Canadian Mennonite University'),
  D('centennial', 'O19394700003', 'Centennial College', null, 'Centennial College'),
  D('fanshawe', 'O19361039982', 'Fanshawe College', null, 'Fanshawe College'),
  D('humber', 'O19376943122', 'Humber College', null, 'Humber College'),
  D('ambrose', 'O18713147522', 'Ambrose University', null, 'Ambrose University'),
  D('sainteanne', 'O19391556726', 'Université Sainte-Anne', 'Université Sainte-Anne', 'Université Sainte-Anne'),
  D('hearst', 'O19395677925', 'Université de Hearst', null, 'Université de Hearst'),
  D('burman', 'O19390898172', 'Burman University', null, 'Burman University'),
  D('ast', 'O19391556837', 'Atlantic School of Theology', null, 'Atlantic School of Theology'),
  D('emmanuel-stchad', 'O122051172047', 'College of Emmanuel and St Chad', null, 'College of Emmanuel and St. Chad'),
  D('lts', 'O213779356297', 'Lutheran Theological Seminary', null, 'Lutheran Theological Seminary Saskatoon'),
  D('standrews-sk', 'O212421811707', "St. Andrew's College", null, "St. Andrew's College Saskatoon"),
  D('horizon', 'O214426376877', 'Horizon College and Seminary Inc.', null, 'Horizon College & Seminary'),
  // Not on the DLI list (searched by name in the institution, campus and city fields of every DLI row)
  NOT_DLI('quest', 'Quest University Canada', ['Quest University']),
  NOT_DLI('brescia', 'Brescia University College', ['Brescia']),
  NOT_DLI('usudbury', 'University of Sudbury', ['University of Sudbury', 'Université de Sudbury'], { univcan: 'University of Sudbury' }),
  NOT_DLI('huntington', 'Huntington University', ['Huntington']),
  NOT_DLI('thorneloe', 'Thorneloe University', ['Thorneloe']),
  NOT_DLI('adc', 'Acadia Divinity College', ['Acadia Divinity']),
  // our record is in St. Catharines, Ontario; IRCC lists only a "Concordia Lutheran Seminary" in Edmonton, Alberta
  NOT_DLI('clts', 'Concordia Lutheran Theological Seminary', ['Concordia Lutheran Theological'], { cityCheck: { city: 'St. Catharines', terms: ['Lutheran', 'Concordia', 'Seminary'] } }),
  // Universities Canada member + DLI, missing from our DB → created
  { key: 'stmu', kind: 'create', dli: 'O19273782872', dliName: "St. Mary's University", univcan: "St. Mary's University", name: "St. Mary's University", city: 'Calgary', db: [] },
];

// ---------------------------------------------------------------- fees ----------
const EXCLUDE_FROM_RANGE = /(?:^|doctor of |veterinary )medicine\b|\bM\.?D\.?\b|MDCM|dentistry|dental (?:medicine|surgery)|\bD\.?M\.?D\b|\bD\.?D\.?S\b|veterinar|\bD\.?V\.?M\b|optometr|pilot|flight/i;
const NOT_A_DEGREE_ROW = /certificate|diploma|continuing education|non-degree|special student|co-?op|part-?time|per course|summer|visiting|exchange|\bESL\b|english language|foundation|qualifying|transitional|bridging|post-?bac/i;
const PROFESSIONAL_DOCTORATE = /juris doctor|\bJ\.?D\b|\blaw\b|civil law|pharm\.?\s?d|doctor of pharmacy|^pharmacy|doctor of|licentiate|\bmedicine\b|\bM\.?D\.?\b|MDCM|dentistry|\bD\.?M\.?D\b/i;
const SANE_ANNUAL = [8000, 160000];

// standard: the rate that applies to every programme not listed separately (shown on its own in the display text)
// stdLabel: how the display text names a standard rate (default: "standard rate for programmes not listed separately")
function feeRow(level, programme, annualCAD, { page, quote, label, text, basis, approx = false, inclFees = false, pdfPage, standard = false, stdLabel }) {
  const values = [].concat(annualCAD).map((v) => Math.round(v * 100) / 100).filter((v) => v >= SANE_ANNUAL[0] && v <= SANE_ANNUAL[1]);
  const where = text !== undefined ? text : textOf(page);
  return {
    level, programme: squash(programme), annualCAD: values, basis, approx, inclFees, ...(standard ? { standard: true, ...(stdLabel ? { stdLabel } : {}) } : {}),
    url: page.url, ...(pdfPage ? { pdfPage } : {}), quote: squash(quote),
    verified: inText(where, quote) && inText(where, label || programme),
  };
}
const headerIndex = (header, re) => header.findIndex((h) => re.test(h));
// rows a parser saw but did not count, with the reason (reported as fees.<key>.notIncluded). extra.standard marks a
// STANDARD rate that covers a whole category of programmes (e.g. all course-based master's): when such a category is not
// counted, the level's figures do not represent it, so no USD figure is proposed for that level (see levelUsd).
// extra.rate = { text, quote, verified } is shown in the display text instead.
const skip = (list, level, programme, reason, url, extra = {}) => list.push({ level, programme: squash(programme), reason, url, ...extra });

// Queen's: '^' programmes are "assessed over 3 terms of study, 50% in the summer term, 25% ... fall and winter", so the
// Per Term column is the 25% share and Tuition = Per Term × 4 for the 3 terms (one year)
const QUEENS_ASSESSED_NOTE = 'Fees are assessed over 3 terms of study, 50% in the summer term';
// Smith School of Business tables list the tuition for the WHOLE programme (no per-term column). A programme is counted
// only when (a) its own Smith page states a FULL-TIME format ("full-time program" / "Full-time MBA"), (b) that page does
// not present it as a working-professional format ("While you work": evening/weekend/virtual study while employed —
// generally not a study-permit route for international students), and (c) it is one year long ("12 Month" in the fee
// table itself, or "12 months" on the Smith page). All three are checked live; every other Smith row is listed under
// notIncluded with the reason.
const SMITH_PAGES = {
  MBAQ: 'https://smith.queensu.ca/mba_programs/mba/index.php',
  MBAA: 'https://smith.queensu.ca/mba_programs/amba/index.php',
  MFIN: 'https://smith.queensu.ca/grad_studies/mfin/index.php',
  MMA: 'https://smith.queensu.ca/grad_studies/mma/index.php',
  MMAI: 'https://smith.queensu.ca/grad_studies/mmai/index.php',
  MDPM: 'https://smith.queensu.ca/grad_studies/mdpm/index.php',
  MIB: 'https://smith.queensu.ca/grad_studies/mib/index.php',
};
// [pattern, reason, format]: format = excluded because it is not a full-time on-campus programme (named in the tuition text)
const SMITH_NOT_COUNTED = [
  [/EMBA|Executive/i, 'executive programme (part-time, for working professionals)', true],
  [/Global Online/i, 'online programme', true],
  [/Beijing/i, 'delivered outside Canada', false],
  [/\+\s*Internship|\b(1[3-9]|2\d) Month/i, 'longer than one year; the table gives the whole-programme tuition', false],
];
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
const smithPageCache = {};
async function smithProgramme(url) {
  if (!smithPageCache[url]) {
    smithPageCache[url] = (async () => {
      try {
        const p = await getPage(url, { scrapeDo: false });
        const t = textOf(p);
        // first pattern that matches wins; the quote is cut to whole words when the key phrase survives the cut
        const find = (key, ...res) => {
          for (const re of res) {
            const m = t.match(re);
            if (!m) continue;
            let q = squash(m[0]);
            const cut = q.replace(/^\S+\s+/, '').replace(/\s+\S+$/, '');
            if (key.test(cut)) q = cut;
            return { quote: q, verified: inPage(p, q) };
          }
          return null;
        };
        const ft = /\bfull[- ]time (?:program(?:me)?|MBA)\b/i;
        return {
          url: p.finalUrl || url,
          duration: find(/\b12[- ]months?\b/i, /[^.]{0,60}\b12[- ]months?\b[^.]{0,60}/i),
          fullTime: find(ft, /[^.]{0,60}\bis a full[- ]time program(?:me)?\b[^.]{0,60}/i, /[^.]{0,20}\bThe full[- ]time MBA\b[^.]{0,60}/i, /[^.]{0,60}\bfull[- ]time (?:program(?:me)?|MBA)\b[^.]{0,60}/i),
          working: find(/\bwhile you work\b/i, /[^.]{0,60}\bwhile you work\b[^.]{0,60}/i),
        };
      } catch (err) { return { url, error: err.message }; }
    })();
  }
  return smithPageCache[url];
}

const FEE_SOURCES = {
  // University of Toronto: Planning & Budget "Tuition Fee Schedules for Publicly-Funded Programs 2026-27", Appendix D
  // (international fees; columns 2025-26 | 2026-27 APPROVAL | 2027-28 INFO). Schedule 1 tables only.
  utoronto: {
    year: '2026-27', name: 'University of Toronto',
    urls: ['https://planningandbudget.utoronto.ca/wp-content/uploads/2026/04/2026-27-Tuition-Fee-Report_FINAL.pdf'],
    async parse() {
      const page = await getPage(this.urls[0]);
      const pages = pdfText(page, 'raw').split('\f');
      const rows = [];
      let d1Starts = 0;
      const masters = new Map();
      pages.forEach((txt, i) => {
        if (/Table D1: International Tuition Fees for Undergraduate Direct-Entry Programs(?! \(continued\))/.test(txt)) d1Starts += 1;
        const table = (txt.match(/Table (D[1-4]): International Tuition Fees/) || [])[1];
        if (d1Starts !== 1 || !table) return;
        for (const line of txt.split('\n')) {
          const m = squash(line).match(/^(?:\d{1,2}[A-D]?\s+)?(.+?)\s+(NA|\$[\d,]+(?:\.\d+)?)\s+(NA|\$[\d,]+(?:\.\d+)?)\s+(NA|\$[\d,]+(?:\.\d+)?)$/);
          if (!m || m[3] === 'NA') continue;
          const label = m[1];
          const fee = amounts(m[3])[0];
          const opts = { page, quote: squash(line), label, text: txt, pdfPage: i + 1, basis: '2026-27 approved annual international tuition (Schedule 1, Appendix D)' };
          if (/Non-Degree|Half Course|Specials|Phasing[- ]out|Extended|3-Year|Spring start|Combined|Dual|Executive|Part-time/i.test(label)) continue;
          if (table === 'D1' && /^Bachelors, (?:.*, )?Entering 2026$/.test(label)) rows.push(feeRow('bachelor', `${label} (direct-entry)`, fee, { ...opts, label }));
          else if (table === 'D2' && /^2025 /.test(label)) rows.push(feeRow('bachelor', `${label.replace(/^2025 /, '')} (upper-year program fee, 2025 cohort)`, fee, { ...opts, label }));
          else if (table === 'D3' && /^Bachelor/.test(label) && !/Entered/.test(label)) rows.push(feeRow('bachelor', `${label} (second-entry)`, fee, { ...opts, label }));
          else if (table === 'D4' && /^Masters? /.test(label)) {
            // one row per programme: the 2026 entry cohort, else the row without a cohort, else the latest cohort
            const base = label.replace(/[,\s-]+Enter(?:ed|ing|ring) 20\d\d$/, '');
            const rank = /Enter(?:ing|ring) 2026/.test(label) ? 3 : !/Enter/.test(label) ? 2 : 1;
            const prev = masters.get(base);
            if (!prev || prev.rank < rank) masters.set(base, { rank, row: feeRow('master', label, fee, { ...opts, label }) });
          }
        }
      });
      rows.push(...[...masters.values()].map((v) => v.row));
      return { pages: [page], rows };
    },
  },
  // UBC (Vancouver): Student Services undergraduate table (first-year full course load) + Academic Calendar master's
  // fees (international fee per instalment × instalments per year, 2026 entry)
  ubc: {
    year: '2026/27', name: 'University of British Columbia',
    urls: ['https://students.ubc.ca/finances/tuition-fees/undergraduate-tuition-fees/', 'https://vancouver.calendar.ubc.ca/fees/tuition-fees/graduate/masters'],
    async parse() {
      const rows = [];
      const notIncluded = [];
      const ug = await getPage(this.urls[0]);
      for (const t of tablesWithContext(ug.body)) {
        if (!/International student tuition amounts/i.test(t.heading || '')) continue;
        const h = t.rows[0] || [];
        const col = headerIndex(h, /full course load tuition/i);
        const loadCol = headerIndex(h, /first-year full course load/i);
        if (col < 0) continue;
        for (const r of t.rows.slice(1)) {
          const fee = amounts(r[col])[0];
          if (!fee || NOT_A_DEGREE_ROW.test(r[0])) continue;
          rows.push(feeRow('bachelor', r[0], fee, { page: ug, quote: r.join(' '), label: r[0], basis: `first-year full course load (${r[loadCol]} credits), students starting 2026` }));
        }
      }
      const pg = await getPage(this.urls[1]);
      for (const t of tablesWithContext(pg.body)) {
        const h = t.rows[0] || [];
        if (!/^Master/.test(h[0] || '')) continue;
        if (/part[- ]?time|executive/i.test(h[0])) { skip(notIncluded, 'master', h[0], 'part-time or executive programme', pg.url, { format: true }); continue; }
        const inst = Number((t.rows.find((r) => /^Instalments per year/i.test(r[0])) || [])[1]);
        const col = headerIndex(h, /^International fee per instalment$/i);
        const row = t.rows.find((r) => /^2026[SW]/.test(r[0]));
        const fee = row && col >= 0 ? amounts(row[col])[0] : null;
        if (!inst || !fee) continue;
        rows.push(feeRow('master', h[0], fee * inst, {
          page: pg, quote: row.join(' '), label: h[0], basis: `international fee per instalment × ${inst} instalments per year (2026 entry)`,
        }));
      }
      // Standard programmes (every master's programme not listed as specialized, incl. thesis-based M.A./M.Sc./M.A.Sc.):
      // one row, full-time Schedule A. Part-time Schedule B is not a full-time yearly fee.
      if (inPage(pg, "Programs not listed under the Specialized Master's Degree Programs should follow rates for standard programs")) {
        for (const t of tablesWithContext(pg.body)) {
          const h = t.rows[0] || [];
          const intl = headerIndex(h, /^International \(per instalment\)/i);
          const instCol = headerIndex(h, /^Instalments per year$/i);
          const r = t.rows.find((x) => /^Full-time \(Schedule A\)$/i.test(x[0] || ''));
          if (!/^Program$/i.test(h[0] || '') || intl < 0 || instCol < 0 || !r) continue;
          const per = amounts(r[intl])[0];
          const inst = Number(r[instCol]);
          if (!per || !inst) continue;
          rows.push(feeRow('master', "Standard master's programs (full-time Schedule A): all programs not listed as specialized, incl. thesis-based M.A./M.Sc./M.A.Sc.", per * inst, {
            page: pg, quote: r.join(' '), label: 'Full-time (Schedule A)', standard: true,
            basis: `standard rate, international fee per instalment × ${inst} instalments per year ("Programs not listed under the Specialized Master's Degree Programs should follow rates for standard programs")`,
          }));
          skip(notIncluded, 'master', 'Part-time (Schedule B)', 'part-time rate, not a full-time yearly fee', pg.url, { format: true });
          break;
        }
      }
      if (!rows.some((r) => r.level === 'master' && r.standard)) skip(notIncluded, 'master', "Standard master's programs (Schedule A)", 'standard-rate table not found on the page; standard programmes are missing from the Master\'s range', pg.url, { standard: true });
      return { pages: [ug, pg], rows, notIncluded };
    },
  },
  // McGill: "Tuition and Fees 2026-27 – International" PDF, one page per undergraduate programme (tuition line only)
  mcgill: {
    year: '2026-27', name: 'McGill University',
    urls: ['https://www.mcgill.ca/student-accounts/files/student-accounts/new_intl_ugrad_degree_students_admitted_2026-27_0.pdf'],
    async parse() {
      const page = await getPage(this.urls[0]);
      const rows = [];
      pdfText(page, 'layout').split('\f').forEach((txt, i) => {
        const lines = txt.split('\n').map(squash);
        const start = lines.findIndex((l) => /Étudiants internationaux de premier cycle$/.test(l));
        const end = lines.findIndex((l) => /^The tuition listed below/.test(l));
        const fee = txt.match(/Droits de scolarité\s+([\d,]+\.\d{2})/);
        if (start < 0 || end <= start || !fee) return;
        const label = squash(lines.slice(start + 1, end).join(' '));
        if (!/Bachelor/.test(label) || PROFESSIONAL_DOCTORATE.test(label)) return;
        rows.push(feeRow('bachelor', label, amounts(fee[1])[0], {
          page, text: txt, pdfPage: i + 1, quote: `Droits de scolarité ${fee[1]}`, label: lines[end - 1],
          basis: 'yearly tuition for international students admitted Fall 2026 (per-credit rate guaranteed for the programme)',
        }));
      });
      return { pages: [page], rows };
    },
  },
  // Queen's: Registrar fee tables, "International Students" section (undergraduate: 30+ units or 2 terms;
  // graduate: 3 terms = one 12-month year; "Various Master Programs" = the standard rate for all other master's).
  // '^' programmes are assessed 50/25/25 over 3 terms (tuition = Per Term × 4). Smith School of Business tables give the
  // whole-programme tuition: counted only for programmes verified as 12 months long (fee table or Smith programme page).
  queens: {
    year: '2026-27', name: "Queen's University",
    urls: ['https://www.queensu.ca/registrar/tuition-fees/undergraduate', 'https://www.queensu.ca/registrar/tuition-fees/graduate'],
    async parse() {
      const rows = [];
      const pages = [];
      const notIncluded = [];
      const smith = new Map(); // one row per Smith programme: the latest intake listed
      for (const [url, level] of [[this.urls[0], 'bachelor'], [this.urls[1], 'master']]) {
        const page = await getPage(url);
        pages.push(page);
        const assessedNote = level === 'master' && inPage(page, QUEENS_ASSESSED_NOTE);
        for (const t of tablesWithContext(page.body)) {
          if (!/^International Students$/i.test(t.section || '')) continue;
          const h = t.rows[0] || [];
          const tuitionCol = headerIndex(h, /^Tuition\*?$/i);
          const perCol = headerIndex(h, /^Per (Unit|Term)$/i);
          const unitsCol = headerIndex(h, /^# Units$/i);
          const termsCol = headerIndex(h, /^# Terms$/i);
          const programFeeCol = headerIndex(h, /^Program Fee$/i);
          if (level === 'master' && /Smith School of Business/i.test(t.heading || '') && tuitionCol >= 0 && programFeeCol >= 0 && perCol < 0) {
            for (const r of t.rows.slice(1)) {
              const fee = amounts(r[tuitionCol])[0];
              if (!fee) continue;
              const m = r[0].match(/^(.*?)\s*-\s*([A-Za-z]{3,4})\.?\s+(20\d\d)$/);
              const base = squash(m ? m[1] : r[0]);
              const when = m ? Number(m[3]) * 100 + (MONTHS[m[2].toLowerCase()] || 0) : 0;
              const prev = smith.get(base);
              if (!prev || prev.when < when) smith.set(base, { when, r, fee, page, tuitionCol });
            }
            continue;
          }
          if (tuitionCol < 0 || perCol < 0 || (unitsCol < 0 && termsCol < 0)) continue;
          for (const r of t.rows.slice(1)) {
            const label = r[0];
            const fee = amounts(r[tuitionCol])[0];
            const per = amounts(r[perCol])[0];
            const units = unitsCol >= 0 ? Number(r[unitsCol]) : null;
            const terms = termsCol >= 0 ? Number(r[termsCol]) : null;
            const isMaster = level === 'master' && /master|\bM\.?\s?(A|Sc|Eng|Ed|PA|PH|BA|IR|Fin)\b/i.test(label);
            if (!fee || !per || NOT_A_DEGREE_ROW.test(label)) {
              if (isMaster) skip(notIncluded, 'master', label, 'part-time / per-unit or non-degree row', url);
              continue;
            }
            let basis = null;
            if (Math.abs(per * (units || terms) - fee) <= Math.max(1, fee * 0.001)) basis = 'tuition column, 3 terms (one 12-month graduate year), 2026-27';
            else if (isMaster && /\^$/.test(label) && terms === 3 && assessedNote && Math.abs(per * 4 - fee) <= Math.max(1, fee * 0.001)) {
              basis = 'tuition column, 3 terms (one 12-month year) assessed 50% summer / 25% fall / 25% winter, so Per Term (25%) × 4 = tuition, 2026-27';
            } else { // table arithmetic must hold
              if (isMaster) skip(notIncluded, 'master', label, `per-term figure × terms (${per} × ${terms}) does not give the tuition column (${fee})`, url);
              continue;
            }
            if (level === 'bachelor') {
              if (PROFESSIONAL_DOCTORATE.test(label) || (units !== null && units < 24) || (terms !== null && terms !== 2)) continue;
              rows.push(feeRow('bachelor', label, fee, { page, quote: r.join(' '), label, basis: `tuition column (${units ? `${units} units` : '2 terms'} = one year), 2026-27` }));
            } else {
              if (!isMaster) continue;
              if (terms !== 3) { skip(notIncluded, 'master', label, terms ? `${terms}-term version (the 3-term version of the programme is counted)` : 'charged per unit (part-time professional)', url, terms ? {} : { format: true }); continue; }
              const standard = /^Various Master Programs$/i.test(label);
              rows.push(feeRow('master', standard ? "Various Master Programs (standard rate for master's programmes not listed separately)" : label, fee, {
                page, quote: r.join(' '), label, standard, basis: standard ? `standard rate, ${basis}` : basis,
              }));
            }
          }
        }
      }
      for (const [base, { r, fee, page, tuitionCol }] of smith) {
        const label = r[0];
        const name = `${label} (Smith School of Business)`;
        const excluded = SMITH_NOT_COUNTED.find(([re]) => re.test(label));
        if (excluded) { skip(notIncluded, 'master', name, excluded[1], page.url, excluded[2] ? { format: true } : {}); continue; }
        const code = (base.match(/\(([A-Z]{2,6})\)/) || base.match(/\b(MIB|MFIN|MBA[A-Z]?)\b/) || [])[1];
        const sp = SMITH_PAGES[code] ? await smithProgramme(SMITH_PAGES[code]) : null;
        if (!sp) { skip(notIncluded, 'master', name, 'no Smith programme page configured to verify a full-time 12-month format', page.url); continue; }
        if (sp.error) { skip(notIncluded, 'master', name, `programme page ${sp.url} not readable (${sp.error})`, page.url); continue; }
        if (sp.working?.verified) {
          skip(notIncluded, 'master', name, `working-professional format: the programme page says "${sp.working.quote}" (study while employed, not a full-time on-campus programme)`, page.url, { format: true, evidence: { url: sp.url, quote: sp.working.quote } });
          continue;
        }
        if (!sp.fullTime?.verified) { skip(notIncluded, 'master', name, `full-time format not stated on the programme page ${sp.url}`, page.url, { format: true }); continue; }
        const duration = /\b12 Month\b/i.test(base) ? { url: page.url, quote: label, verified: inPage(page, label) }
          : sp.duration?.verified ? { url: sp.url, ...sp.duration } : null;
        if (!duration?.verified) { skip(notIncluded, 'master', name, `programme length (12 months) not verified on the fee table or ${sp.url}`, page.url); continue; }
        const row = feeRow('master', `${base} (Smith School of Business)`, fee, {
          page, quote: r.slice(0, tuitionCol + 1).join(' '), label,
          basis: `whole-programme tuition of a full-time 12-month programme = one year (latest intake listed: ${label}); Smith program fee, SAL and ancillary fees not included, 2026-27`,
        });
        row.durationEvidence = duration;
        row.formatEvidence = { url: sp.url, ...sp.fullTime };
        rows.push(row);
      }
      return { pages, rows, notIncluded };
    },
  },
  // Waterloo: "First-year tuition fees", International (visa) students table (estimated tuition + incidental fees for
  // two terms, rounded)
  waterloo: {
    year: '2026-27', name: 'University of Waterloo',
    urls: ['https://uwaterloo.ca/future-students/financing/tuition'],
    async parse() {
      const page = await getPage(this.urls[0]);
      const rows = [];
      for (const t of tablesWithContext(page.body)) {
        if (!/International \(visa\) students/i.test(t.heading || '')) continue;
        const col = headerIndex(t.rows[0] || [], /tuition and incidental fees for two terms/i);
        if (col < 0) continue;
        for (const r of t.rows.slice(1)) {
          const fee = amounts(r[col])[0];
          if (!fee || PROFESSIONAL_DOCTORATE.test(r[0]) || /^pharmacy|optometry/i.test(r[0])) continue;
          rows.push(feeRow('bachelor', r[0], fee, { page, quote: r.slice(0, col + 1).join(' '), label: r[0], approx: true, inclFees: true, basis: 'estimated first-year tuition + incidental fees for two terms (rounded)' }));
        }
      }
      return { pages: [page], rows };
    },
  },
  // USask: admissions "Tuition and costs" (international first-year estimates by college, full course load) +
  // graduate studies standard rate for thesis/project-based master's ("Total per academic year") + master's programmes
  // with special per-term rates (× 3 terms). Per-credit (course-based, MBA) and flat-fee programmes are listed as not included.
  usask: {
    year: '2026-27', name: 'University of Saskatchewan',
    urls: ['https://admissions.usask.ca/money/tuition.php', 'https://grad.usask.ca/funding/tuition.php'],
    async parse() {
      const rows = [];
      const ug = await getPage(this.urls[0]);
      for (const t of tablesWithContext(ug.body)) {
        const col = headerIndex(t.rows[0] || [], /Tuition estimates for international students/i);
        if (col < 0) continue;
        for (const r of t.rows.slice(1)) {
          const fee = amounts(r[col])[0];
          if (!fee || PROFESSIONAL_DOCTORATE.test(r[0]) || /dentist|medicine|veterinar|nursing.*post|certificate/i.test(r[0])) continue;
          rows.push(feeRow('bachelor', r[0], fee, { page: ug, quote: r.join(' '), label: r[0], basis: 'first-year estimate for a full course load, 2026-27' }));
        }
        break; // first table = colleges with direct-entry degrees; the next one lists professional programmes
      }
      const pg = await getPage(this.urls[1]);
      const notIncluded = [];
      let termsPerYear = 0;
      if (inPage(pg, "Thesis and project-based master's programs")) {
        for (const t of tablesWithContext(pg.body)) {
          const col = headerIndex(t.rows[0] || [], /^International students$/i);
          const total = t.rows.find((r) => /^Total per academic year$/i.test(r[0]));
          if (col < 0 || !total || !amounts(total[col]).length) continue;
          // the academic year of this table = its term rows (Sept–Dec, Jan–Apr, May–Aug)
          termsPerYear = t.rows.filter((r) => /^(January|May|September) 1 - /i.test(r[0] || '')).length;
          rows.push(feeRow('master', "Thesis and project-based master's programs (standard rate)", amounts(total[col])[0], {
            page: pg, quote: total.join(' '), label: "Thesis and project-based master's programs", standard: true, stdLabel: 'thesis/project-based standard rate',
            basis: `standard rate, total per academic year (${termsPerYear} terms), 2026-27`,
          }));
          break;
        }
      }
      // Programmes with special rates: per-term rates × the terms of one academic year (from the standard-rate table above);
      // per-credit-unit and flat-fee (whole-programme) rates cannot be turned into a yearly fee from this page → not counted
      if (termsPerYear === 3 && inPage(pg, 'Special tuition rates')) {
        const $ = cheerio.load(pg.body);
        $('table').each((_, tbl) => {
          const head = $(tbl).find('tr').first().find('th,td').map((__, c) => squash($(c).text())).get();
          const intlCol = headerIndex(head, /^International students$/i);
          const assessedCol = headerIndex(head, /^Assessed$/i);
          if (!/^Program$/i.test(head[0] || '') || intlCol < 0 || assessedCol < 0) return;
          $(tbl).find('tr').slice(1).each((__, tr) => {
            const tds = $(tr).find('td');
            const first = tds.eq(0).clone();
            const note = squash(first.find('.text-muted').text());
            first.find('.text-muted').remove();
            const name = squash(first.text());
            if (!/^Master/i.test(name)) return;
            const intl = squash(tds.eq(intlCol).text());
            const assessed = squash(tds.eq(assessedCol).text());
            const fee = /\bCAD\b/.test(intl) ? amounts(intl)[0] : null;
            const why = /not accepting new students/i.test(note) ? 'not accepting new students'
              : /only (?:open|available) to Canadian|International tuition is not applicable/i.test(note) || !fee ? 'not open to international students / no international rate'
                : /in addition to/i.test(note) ? 'charged in addition to another rate (add-on)'
                  : /^Per credit unit$/i.test(assessed) ? 'charged per credit unit; the yearly credit load is not stated on the page'
                    : /^Flat fee$/i.test(assessed) ? 'flat fee for the whole programme; the programme length is not stated on the page'
                      : !/^Per (term|year)$/i.test(assessed) ? `assessed "${assessed}"` : null;
            if (why) { skip(notIncluded, 'master', name, why, pg.url); return; }
            const perTerm = /^Per term$/i.test(assessed);
            rows.push(feeRow('master', name, perTerm ? fee * termsPerYear : fee, {
              page: pg, quote: tds.map((___, c) => squash($(c).text())).get().join(' '), label: name,
              basis: perTerm ? `special rate per term × ${termsPerYear} terms (one academic year, as in the standard-rate table), 2026-27` : 'special rate per year, 2026-27',
            }));
          });
        });
      }
      // Course-based master's (a standard rate for a whole category of programmes) are charged per class and the page
      // states no yearly load, so they cannot be expressed per year: recorded as a standard category NOT counted (the
      // Master's USD figure is then withheld) with the official per-class rate for the display text
      const COURSE_BASED = 'Students in course-based programs pay tuition for each class they take';
      if (inPage(pg, COURSE_BASED)) {
        let rate = null;
        for (const t of tablesWithContext(pg.body)) {
          const col = headerIndex(t.rows[0] || [], /^International students$/i);
          const r = t.rows.find((x) => /^Cost per 3 credit unit graduate class$/i.test(x[0] || ''));
          const fee = col >= 0 && r ? amounts(r[col])[0] : null;
          if (!fee) continue;
          const quote = r.join(' ');
          rate = { text: `CAD ${fee.toLocaleString('en-US', { minimumFractionDigits: 2 })} per 3-credit-unit class`, quote, url: pg.url, verified: inPage(pg, quote) };
          break;
        }
        skip(notIncluded, 'master', "Course-based master's programs at the standard course-based rate", `charged per class ("${COURSE_BASED}"); the page states no yearly course load, so no yearly fee`, pg.url,
          { standard: true, category: "course-based master's", ...(rate?.verified ? { rate } : {}) });
      }
      return { pages: [ug, pg], rows, notIncluded };
    },
  },
  // Carleton: Student Accounts "Fall 2026 and Winter 2027 International Undergraduate Tuition Fees" (first year;
  // compulsory miscellaneous fees and U-Pass included, as the page states)
  carleton: {
    year: '2026-27', name: 'Carleton University',
    urls: ['https://carleton.ca/studentaccounts/tuition-fees/fw-ug/f26w27-ug-international/'],
    async parse() {
      const page = await getPage(this.urls[0]);
      const rows = [];
      for (const t of tablesWithContext(page.body)) {
        const h = t.rows[0] || [];
        if (!/Full-fee International Undergraduate Status/i.test(h[0] || '')) continue;
        const col = headerIndex(h, /^First Year$/i);
        for (const r of t.rows.slice(1)) {
          const fee = amounts(r[col])[0];
          if (!fee || !/^Bachelor/.test(r[0]) || NOT_A_DEGREE_ROW.test(r[0])) continue;
          rows.push(feeRow('bachelor', r[0], fee, { page, quote: r.slice(0, col + 1).join(' '), label: r[0], inclFees: true, basis: 'first year, Fall + Winter combined, incl. compulsory miscellaneous fees and U-Pass' }));
        }
      }
      return { pages: [page], rows };
    },
  },
  // Dalhousie: International Tuition Guarantee 2026-2027 (set tuition per year by faculty, tuition only)
  dal: {
    year: '2026-27', name: 'Dalhousie University',
    urls: ['https://www.dal.ca/admissions/cost-and-payment/tuition/international-tuition-guarantee.html'],
    mustContain: ['You pay a set tuition amount per year', 'Amounts listed are tuition only'],
    async parse() {
      const page = await getPage(this.urls[0]);
      const text = textOf(page);
      const from = text.indexOf('Guaranteed tuition for 2026-2027');
      const seg = from >= 0 ? text.slice(from, from + 1500) : '';
      const rows = [...seg.matchAll(/Faculty of ([A-Z][A-Za-z&' ]+?) \$(\d{2},\d{3})/g)].map((m) => feeRow('bachelor', `Faculty of ${m[1]}`, amounts(m[2])[0], {
        page, quote: m[0], label: `Faculty of ${m[1]}`, basis: 'International Tuition Guarantee, set tuition per year (tuition only), students starting 2026-27',
      }));
      return { pages: [page], rows };
    },
  },
  // TMU: international admissions fee ranges per faculty, full-time undergraduate 2026-2027 (incl. ancillary fees)
  tmu: {
    year: '2026-27', name: 'Toronto Metropolitan University',
    urls: ['https://www.torontomu.ca/international/admissions/paying-for-your-education/tuition-fees/'],
    mustContain: ['Tuition fees include applicable ancillary fees'],
    async parse() {
      const page = await getPage(this.urls[0]);
      const rows = [];
      if (!inPage(page, 'Fee Ranges per Faculty for Full-Time Undergraduate Programs: International Students (2026-2027)')) return { pages: [page], rows };
      for (const t of tablesWithContext(page.body)) {
        const h = t.rows[0] || [];
        if (!/^Faculty$/i.test(h[0] || '') || !/Fee range/i.test(h[1] || '')) continue;
        for (const r of t.rows.slice(1)) {
          const vals = amounts(r[1]);
          if (!vals.length) continue;
          rows.push(feeRow('bachelor', r[0], vals, { page, quote: r.join(' '), label: r[0], inclFees: true, basis: 'faculty fee range, full-time undergraduate, international, 2026-2027, incl. ancillary fees' }));
        }
      }
      return { pages: [page], rows };
    },
  },
  // York: future students "Tuition & Fees", approximate international tuition (30 credits; Engineering 36 credits)
  yorku: {
    year: '2026-27', name: 'York University',
    urls: ['https://futurestudents.yorku.ca/financing-your-degree/tuition-fees'],
    mustContain: ['Fees shown are based on 30 credits'],
    async parse() {
      const page = await getPage(this.urls[0]);
      const rows = [];
      for (const t of tablesWithContext(page.body)) {
        const hi = t.rows.findIndex((r) => r.some((c) => /^International Tuition$/i.test(c)));
        if (hi < 0) continue;
        const hcol = t.rows[hi].findIndex((c) => /^International Tuition$/i.test(c));
        for (const r of t.rows.slice(hi + 1)) {
          const col = hcol + (r.length - t.rows[hi].length); // the sub-header row has no cell for the label column
          const vals = amounts(r[col]);
          if (!vals.length || /^Fees shown/i.test(r[0])) continue;
          rows.push(feeRow('bachelor', r[0], vals, { page, quote: r.join(' '), label: r[0], approx: true, basis: 'approximate tuition, 30 credits (Engineering: 36 credits), 2026-27' }));
        }
      }
      return { pages: [page], rows };
    },
  },
};

// Two clearly separated fee tiers (largest gap between neighbouring programme fees ≥ 40% of the median, with at least a
// quarter of the programmes on each side): the median then depends only on how many rows each tier has (the fees are
// published without enrolment weights), so the display text names both tiers and NO single USD figure is proposed for
// that level (see levelUsd)
// "Bachelor of Commerce (BCom)" → "BCom"; "Bachelor of Bioresource Engineering (Beng(Bioresource))" → "Beng(Bioresource)"
const shortProgramme = (p) => (p.match(/\(([A-Za-z&.]{2,10}(?:\([A-Za-z]{2,14}\))?)\)$/) || [])[1]
  || p.replace(/^(?:Concurrent )?Bachelor of (?:Science )?(?:- )?/i, '').replace(/\s*\([^()]*\)$/, '').split(/,| and /)[0].trim().slice(0, 40);
function splitTiers(used, mids) {
  if (used.length < 6) return null;
  const order = mids.map((v, i) => ({ v, r: used[i] })).sort((a, b) => a.v - b.v);
  let best = null;
  for (let i = 1; i < order.length; i += 1) {
    const gap = order[i].v - order[i - 1].v;
    if (!best || gap > best.gap) best = { gap, i };
  }
  const med = median(mids);
  if (!best || best.gap < 0.4 * med || best.i < order.length / 4 || order.length - best.i < order.length / 4) return null;
  const tier = (part) => ({ programmes: part.length, min: part[0].v, max: part[part.length - 1].v, median: median(part.map((x) => x.v)), names: part.map((x) => shortProgramme(x.r.programme)) });
  return { lower: tier(order.slice(0, best.i)), upper: tier(order.slice(best.i)), medianIn: med < order[best.i].v ? 'lower' : 'upper' };
}

// Range and median are computed from PROGRAMME-SPECIFIC rows only. A standard rate (the rate of every programme not listed
// separately, e.g. UBC Schedule A, Queen's "Various Master Programs", USask thesis/project-based) covers an unknown number of
// programmes and students, so it is neither one "row" of the median nor part of the range: it is reported on its own
// (standardRates, named in the display text), and a level that has one gets no single USD figure (see levelUsd).
function summariseFees(rows, level) {
  const seen = new Set();
  const used = [];
  const standard = [];
  const excluded = [];
  for (const r of rows) {
    if (r.level !== level || !r.verified || !r.annualCAD.length) continue;
    const k = `${norm(r.programme)}|${r.annualCAD.join(',')}`;
    if (seen.has(k)) continue;
    seen.add(k);
    (EXCLUDE_FROM_RANGE.test(r.programme) ? excluded : r.standard ? standard : used).push(r);
  }
  if (!used.length && !standard.length) return null;
  const standardRates = standard.map((r) => ({ programme: r.programme, annualCAD: r.annualCAD[0], ...(r.stdLabel ? { label: r.stdLabel } : {}), url: r.url, quote: r.quote }));
  const excludedFromRange = excluded.map((r) => r.programme);
  if (!used.length) {
    return { programmes: 0, min: null, max: null, median: null, typicalLow: null, typicalHigh: null, approx: standard.some((r) => r.approx), inclFees: standard.some((r) => r.inclFees), excludedFromRange, standardRates, split: null, medianNote: 'no programme-specific rows (standard rate only)', evidence: [] };
  }
  const all = used.flatMap((r) => r.annualCAD);
  const mids = used.map((r) => r.annualCAD.reduce((a, b) => a + b, 0) / r.annualCAD.length);
  return {
    programmes: used.length, min: Math.min(...all), max: Math.max(...all), median: median(mids),
    // typical range = 10th–90th percentile of programme fees (full min–max when fewer than 10 programmes)
    typicalLow: used.length >= 10 ? percentile(mids, 0.1) : Math.min(...all),
    typicalHigh: used.length >= 10 ? percentile(mids, 0.9) : Math.max(...all),
    approx: used.some((r) => r.approx), inclFees: used.some((r) => r.inclFees),
    excludedFromRange,
    standardRates,
    split: splitTiers(used, mids),
    medianNote: `unweighted median of ${used.length} programme-specific rows as listed on the official page(s) (no enrolment weighting is published with the fees${standard.length ? '; standard rates are not counted, see standardRates' : ''})`,
    evidence: [...new Set([Math.min(...all), median(mids), Math.max(...all)])].map((v) => used.find((r) => r.annualCAD.includes(v)) || used.find((r) => Math.abs(r.annualCAD.reduce((a, b) => a + b, 0) / r.annualCAD.length - v) < 1))
      .filter(Boolean).map((r) => ({ programme: r.programme, annualCAD: r.annualCAD, url: r.url, quote: r.quote, ...(r.pdfPage ? { pdfPage: r.pdfPage } : {}) })),
  };
}

// Whether ONE yearly USD figure (the unweighted median) may stand for a level on the website (tuitionFeeUSD /
// graduateTuitionUSD are used for budget filtering and shown as the fee of every programme). One rule for every
// institution: enough programme-specific rows, no two-tier split, and no standard rate (counted or uncounted) covering an
// unknown share of the level's programmes. Otherwise the level is described in the tuition text only.
function levelUsd(s, lvl) {
  if (!s) return { ok: false, reason: `no ${lvl} international fee per year verifiable on the configured official page(s)` };
  const reasons = [];
  let short = null;
  if (s.standardRates?.length) {
    const std = s.standardRates.map((x) => `CAD ${money(x.annualCAD)}`).join(', ');
    reasons.push(`a standard rate (${std}) applies to every ${lvl} programme not listed separately, and the share of programmes/students it covers is not published; neither it nor the median of the ${s.programmes} separately listed programmes${s.median ? ` (CAD ${money(s.median)})` : ''} represents the level`);
    short = short || 'standard rate and programme-specific rates, so no single typical figure';
  }
  if (s.standardNotCounted?.length) {
    const cats = s.standardNotCounted.map((c) => c.category || c.programme).join(', ');
    reasons.push(`${cats} (a standard rate covering a whole category of programmes) cannot be expressed as a yearly fee from the official page, so the counted ${lvl} rows do not represent all programmes`);
  }
  if (s.programmes < MIN_LEVEL_ROWS) {
    reasons.push(`only ${s.programmes} ${lvl} programme-specific row(s) (fewer than ${MIN_LEVEL_ROWS})`);
    short = short || 'too few programmes for a typical figure';
  }
  if (s.split) {
    reasons.push(`${lvl} fees fall into two separate tiers (CAD ${money(s.split.lower.min)}–${money(s.split.lower.max)} for ${s.split.lower.programmes} programmes, CAD ${money(s.split.upper.min)}–${money(s.split.upper.max)} for ${s.split.upper.programmes}); the unweighted median (CAD ${money(s.median)}) only reflects which tier has more rows, and no enrolment weights are published`);
    short = short || 'two fee tiers, so no single typical figure';
  }
  return reasons.length ? { ok: false, reason: reasons.join('; '), ...(short ? { short } : {}) } : { ok: true };
}

// ---------------------------------------------------------------- courses ----------
const COURSE_SOURCES = {
  // UofT School of Graduate Studies programme directory (graduate programme names)
  utoronto: {
    url: 'https://www.sgs.utoronto.ca/programs/',
    async parse() {
      const page = await getPage(this.url);
      const $ = cheerio.load(page.body);
      const names = $('a').map((_, a) => ({ t: squash($(a).text()), h: $(a).attr('href') || '' })).get()
        .filter((x) => /^https:\/\/www\.sgs\.utoronto\.ca\/programs\/[a-z0-9-]+\/?$/.test(x.h) && x.t.length > 2).map((x) => x.t);
      return { page, groups: [{ level: 'graduate', names }], note: 'UofT School of Graduate Studies programme directory (graduate programmes)' };
    },
  },
  // UBC Graduate School "Graduate Degree Programs" list: Master's first, then doctoral. The list is paginated
  // (?page=0..N, N from the "Last page" link); every page is read, otherwise no course list is proposed.
  ubc: {
    url: 'https://www.grad.ubc.ca/prospective-students/graduate-degree-programs',
    async parse() {
      const first = await getPage(this.url);
      const links = (page) => {
        const $ = cheerio.load(page.body);
        return {
          $,
          programmes: $('a').map((_, a) => ({ t: squash($(a).text()), h: $(a).attr('href') || '' })).get().filter((x) => /^\/prospective-students\/graduate-degree-programs\/[a-z0-9-]+$/.test(x.h)),
          next: $('a').filter((_, a) => /^Next page/i.test(squash($(a).text()))).length > 0,
          last: Number((String($('a').filter((_, a) => /^Last page/i.test(squash($(a).text()))).first().attr('href') || '').match(/[?&]page=(\d+)/) || [])[1] || 0),
        };
      };
      const firstLinks = links(first);
      const lastIndex = firstLinks.last;
      if (firstLinks.next && !lastIndex) throw new Error('UBC programme list is paginated but the last page could not be read from the pager');
      if (lastIndex > 30) throw new Error(`UBC programme list pager reports ${lastIndex + 1} pages; refusing (unexpected)`);
      const pages = [first];
      const all = [...firstLinks.programmes];
      for (let i = 1; i <= lastIndex; i += 1) {
        const p = await getPage(`${this.url}?page=${i}`);
        const l = links(p);
        if (!l.programmes.length) throw new Error(`UBC programme list page ${i + 1} has no programme links`);
        if (i === lastIndex && l.next) throw new Error('UBC programme list: the last page still links to a next page');
        pages.push(p);
        all.push(...l.programmes);
      }
      // completeness check: the card titles ("<Subject> <Degree> <Faculty>") must reach the end of the alphabet
      const subjects = all.filter((x) => !/^(Master|Doctor|Graduate Certificate|Graduate Diploma)/.test(x.t)).map((x) => x.t[0]?.toUpperCase()).filter(Boolean);
      const lastLetter = subjects.sort().pop() || '';
      if (lastLetter < 'T') throw new Error(`UBC programme list looks truncated (last programme subject starts with "${lastLetter}")`);
      const names = [...new Set(all.map((x) => x.t))].map((t) => t.replace(/\s*\([A-Za-z.&/ -]{2,14}\)$/, ''));
      // Professional entry-to-practice doctorates (MD, DMD, PharmD, incl. the combined MD/PhD) are on the list but are
      // not graduate research/master's programmes: left out and reported (excludedNames)
      const PROFESSIONAL = /^Doctor of (?:Medicine|Dental Medicine|Pharmacy)\b/;
      return {
        page: first, pages, note: `UBC Graduate School list of graduate degree programs, all ${pages.length} pages (Master's first, then doctoral; professional MD/DMD/PharmD left out)`, pagesRead: pages.length,
        excludedNames: names.filter((n) => PROFESSIONAL.test(n)),
        groups: [{ level: 'master', names: names.filter((n) => /^Master/.test(n)) }, { level: 'doctoral', names: names.filter((n) => /^Doctor/.test(n) && !PROFESSIONAL.test(n)) }],
      };
    },
  },
  // Carleton Graduate Studies master's programmes + Bachelor's degrees from the official international fee table
  carleton: {
    url: 'https://graduate.carleton.ca/programs/',
    async parse(fees) {
      const page = await getPage(this.url);
      const $ = cheerio.load(page.body);
      const masters = $('a').map((_, a) => ({ t: squash($(a).text()), h: $(a).attr('href') || '' })).get()
        .filter((x) => /^https:\/\/graduate\.carleton\.ca\/program\/[a-z0-9-]+-masters-programs\/?$/.test(x.h) && inPage(page, x.t)).map((x) => `${x.t} (Master's)`);
      const bachelors = (fees?.rows || []).filter((r) => r.level === 'bachelor' && r.verified).map((r) => r.programme);
      return {
        page, note: 'Carleton Graduate Studies master\'s programmes + Bachelor\'s degrees listed in Carleton\'s 2026-27 international fee table',
        groups: [{ level: 'master', names: masters, verified: true }, { level: 'bachelor', names: bachelors, verified: true }],
      };
    },
  },
};

// Deduplicated official names, groups in the given order (Master's first). The list is never cut: cutting a sorted list
// keeps only the start of the alphabet (e.g. UBC: every "Master of Science in …" and all doctoral programmes would be
// lost). A list longer than COURSE_CAP is not proposed at all (existing courses unchanged, reported as overCap).
function buildCourses(groups) {
  const seen = new Set();
  const out = [];
  for (const g of groups) {
    for (const n of [...g.names].sort((a, b) => a.localeCompare(b))) {
      const k = norm(n);
      if (!n || seen.has(k)) continue;
      seen.add(k);
      out.push(n);
    }
  }
  if (out.length > COURSE_CAP) return { courses: [], totalAvailable: out.length, overCap: true, officialNames: out };
  return { courses: out, totalAvailable: out.length };
}

// ---------------------------------------------------------------- plan (for --apply --expect) ----------
// Stamps that differ between two runs of the same plan; everything else that would be written is part of the plan
const VOLATILE_KEYS = new Set(['syncedAt', 'checkedAt', 'runId', 'createdAt', 'updatedAt']);
const canon = (v) => {
  if (v === undefined || v === null) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object' && typeof v.toHexString === 'function') return v.toHexString();
  if (Array.isArray(v)) return v.map(canon);
  if (typeof v === 'object') return Object.fromEntries(Object.keys(v).filter((k) => !VOLATILE_KEYS.has(k)).sort().map((k) => [k, canon(v[k])]));
  return v;
};
const sha = (x, n = 64) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, n);
function buildPlan(changes, creates) {
  const entries = [
    ...changes.map((c) => ({ key: `${c.action}:${c.id}`, name: c.name, fields: Object.fromEntries(Object.keys(c.diff).sort().map((k) => [k, sha(canon(c.diff[k].to), 16)])) })),
    ...creates.map((c) => ({ key: `create:${norm(c.doc.name)}|${norm(c.doc.city)}`, name: c.doc.name, fields: Object.fromEntries(Object.keys(c.doc).filter((k) => !VOLATILE_KEYS.has(k)).sort().map((k) => [k, sha(canon(c.doc[k]), 16)])) })),
  ].sort((a, b) => a.key.localeCompare(b.key));
  return { hash: sha(entries), entries, note: 'one entry per record this run would write: field -> hash of the value written (syncedAt/checkedAt/runId/createdAt/updatedAt excluded). --apply --expect <this report> writes only when its own plan is identical.' };
}
function comparePlans(expectedPlan, actualPlan) {
  const exp = new Map(expectedPlan.entries.map((x) => [x.key, x]));
  const act = new Map(actualPlan.entries.map((x) => [x.key, x]));
  const out = [];
  for (const [k, a] of act) {
    const e = exp.get(k);
    if (!e) { out.push(`not in the reviewed plan: ${k} (${a.name})`); continue; }
    const fields = [...new Set([...Object.keys(a.fields), ...Object.keys(e.fields)])].filter((f) => a.fields[f] !== e.fields[f]);
    if (fields.length) out.push(`${k} (${a.name}): ${fields.join(', ')} differ from the reviewed plan`);
  }
  for (const [k, e] of exp) if (!act.has(k)) out.push(`in the reviewed plan but not in this run: ${k} (${e.name})`);
  return out;
}

// ---------------------------------------------------------------- revert ----------
async function revert(reportFile) {
  const report = JSON.parse(fs.readFileSync(path.resolve(reportFile), 'utf8'));
  // An apply run saves applyStartedAt before its first write, so a run that stopped half-way is revertible too
  if (report.summary?.mode !== 'apply' || !(report.appliedAt || report.applyStartedAt)) {
    throw new Error(`${reportFile} is a dry-run report (nothing was written by it); refusing to revert`);
  }
  if (!/^canada-sync-\d{14}$/.test(String(report.runId || ''))) throw new Error(`${reportFile} has no canadaSync runId; refusing to revert`);
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('universities');
  let restored = 0;
  for (const c of report.changes || []) {
    const set = {};
    const unset = {};
    for (const [k, v] of Object.entries(c.diff)) {
      if (v.from === undefined) unset[k] = ''; else set[k] = v.from;
    }
    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    if (!Object.keys(update).length) continue;
    const r = await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id), 'dataSource.runId': report.runId }, update);
    restored += r.modifiedCount;
  }
  // Records created by this sync are hidden (isActive:false), never deleted. Found by runId + createdBySync, so a create
  // whose insertedId never reached the report (run stopped right after the insert) is hidden as well.
  const r = await col.updateMany({ 'dataSource.runId': report.runId, 'dataSource.createdBySync': SYNC_ID, isActive: { $ne: false } }, { $set: { isActive: false } });
  const hidden = r.modifiedCount;
  console.log(`REVERTED: ${restored} records restored, ${hidden} created records hidden (isActive:false) from ${reportFile}`);
  await mongoose.disconnect();
}

// ---------------------------------------------------------------- main ----------
(async () => {
  if (CLI.revert !== undefined) return revert(CLI.revert);
  console.log(`IRCC DLI list + Universities Canada + official fee pages → Canadian institutions (${APPLY ? 'APPLY' : 'DRY RUN, nothing is written'})`);
  const uncertainties = [];
  const problems = [];

  // --apply --expect <reviewed dry-run report>: the plan must reproduce that report exactly; its CAD→USD rate (the latest
  // ECB rate when it was reviewed) is reused so that a newer daily rate alone does not change the approved USD values.
  // parseCli() already refused --apply without --expect (unless --no-expect) and --expect without a path.
  let expected = null;
  if (APPLY && EXPECT !== undefined) {
    if (!fs.existsSync(path.resolve(EXPECT))) throw new Error(`--expect: report "${EXPECT}" not found`);
    expected = JSON.parse(fs.readFileSync(path.resolve(EXPECT), 'utf8'));
    if (expected.script !== 'scripts/dataSync/canadaSync.js' || expected.summary?.mode !== 'dry-run') throw new Error(`--expect ${EXPECT}: not a canadaSync dry-run report`);
    if (!/^[0-9a-f]{64}$/.test(String(expected.plan?.hash || '')) || !Array.isArray(expected.plan?.entries)) throw new Error(`--expect ${EXPECT}: report has no plan (made by an older version of this script); run a new dry run and review it`);
    if (expected.summary.fx && !(Number(expected.summary.fx.rate) > 0 && expected.summary.fx.date)) throw new Error(`--expect ${EXPECT}: report has an unusable FX rate`);
  } else if (APPLY) {
    console.warn('  WARNING: --apply --no-expect: the plan is recomputed now and is NOT checked against a reviewed dry run');
  }
  let fx = null;
  if (expected) {
    fx = expected.summary.fx || null; // same object as in the reviewed report (rate + ECB date)
    if (!fx) uncertainties.push(`FX rate unavailable in the reviewed report ${EXPECT}; USD fee fields not proposed`);
  } else {
    try { fx = await cadToUsd(); } catch (err) { uncertainties.push(`FX rate unavailable (${err.message}); USD fee fields not proposed`); }
  }
  console.log(`  CAD→USD ${fx ? `${fx.rate} (${fx.date})${expected ? ` (pinned to ${path.basename(EXPECT)})` : ''}` : 'n/a'}`);

  // 1) IRCC DLI list: rule quotes from the page + the data file the page itself loads
  const dliPage = await getPage(DLI_PAGE, { scrapeDo: false });
  const dliRules = DLI_RULE_QUOTES.map((quote) => ({ url: DLI_PAGE, quote, verified: inPage(dliPage, quote) }));
  if (!String(dliPage.body).includes(DLI_JSON_PATH)) throw new Error(`DLI page no longer loads ${DLI_JSON_PATH}`);
  const dliRaw = await getPage(DLI_JSON, { scrapeDo: false });
  const dliRows = JSON.parse(dliRaw.body).data.map((r) => ({ ...r, Institution: squash(apos(r.Institution)), City: squash(r.City), Campus: squash(r.Campus) }));
  // Sanity checks on the data file: size, the columns read below, and plausible values in the flag columns. A failed flag
  // check switches off only the proposals that depend on that column (type / degreeLevels); the rest of the run continues.
  const minRows = Math.round(LAST_KNOWN_DLI_ROWS * 0.8);
  if (dliRows.length < minRows) throw new Error(`DLI data file has only ${dliRows.length} rows (expected ≥ ${minRows}, last seen ${LAST_KNOWN_DLI_ROWS})`);
  const missingColumns = DLI_COLUMNS.filter((c) => dliRows.some((r) => !(c in r)));
  if (missingColumns.some((c) => ['Province', 'Institution', 'DLI #', 'City', 'Campus'].includes(c))) throw new Error(`DLI data file lacks column(s) ${missingColumns.join(', ')}`);
  const tally = (k) => dliRows.reduce((m, r) => { m[r[k]] = (m[r[k]] || 0) + 1; return m; }, {});
  const gradTally = tally('Grad Program');
  const ppTally = tally('Public/Private');
  const pgwpTally = tally('PGWP');
  const dliChecks = {
    gradProgram: { values: gradTally, ok: Object.keys(gradTally).every((v) => v === 'Yes' || v === 'No') && (gradTally.Yes || 0) >= 50, rule: 'only Yes/No and at least 50 "Yes" rows' },
    publicPrivate: { values: ppTally, ok: Object.keys(ppTally).every((v) => /^(Public|Private) institution$/.test(v)) && (ppTally['Public institution'] || 0) >= 100 && (ppTally['Private institution'] || 0) >= 100, rule: 'only "Public institution"/"Private institution", at least 100 of each' },
    pgwp: { values: pgwpTally, ok: Object.keys(pgwpTally).every((v) => ['Yes', 'No', 'Details'].includes(v)), rule: 'only Yes/No/Details' },
    missingColumns,
  };
  if (!dliChecks.gradProgram.ok) uncertainties.push(`IRCC data file: "Grad Program" column missing or implausible (${JSON.stringify(gradTally)}); degreeLevels NOT proposed in this run`);
  if (!dliChecks.publicPrivate.ok) uncertainties.push(`IRCC data file: "Public/Private" column missing or implausible (${JSON.stringify(ppTally)}); type NOT proposed in this run`);
  if (!dliChecks.pgwp.ok) uncertainties.push(`IRCC data file: "PGWP" column missing or implausible (${JSON.stringify(pgwpTally)}); PGWP values in the report are unreliable`);
  const dliMeta = { page: DLI_PAGE, dataFile: DLI_JSON, rows: dliRows.length, institutions: new Set(dliRows.map((r) => `${r['DLI #']}|${r.Institution}`)).size, fetchedAt: dliRaw.fetchedAt, checks: dliChecks };
  console.log(`  IRCC DLI list: ${dliMeta.rows} campus rows, ${dliMeta.institutions} institutions`);

  // 2) Universities Canada members (name + linked website) and the StatCan-sourced tuition table (context only)
  const ucPage = await getPage(UNIVCAN_MEMBERS);
  const members = [];
  {
    const $ = cheerio.load(ucPage.body);
    let province = null;
    $.root().find('h2, ul.wp-block-list li a').each((_, el) => {
      if (el.tagName === 'h2') { province = squash($(el).text()); return; }
      const name = squash(apos($(el).text()));
      const href = $(el).attr('href') || '';
      if (province && name && /^https?:\/\//.test(href) && !/univcan\.ca/.test(href)) members.push({ name, website: href, province });
    });
  }
  // A markup change would silently yield few or no members: below 80% of the last seen size, membership counts as unverified
  const membersOk = members.length >= Math.round(LAST_KNOWN_MEMBERS * 0.8);
  if (!membersOk) uncertainties.push(`Universities Canada member list: only ${members.length} members parsed (last seen ${LAST_KNOWN_MEMBERS}); membership treated as unverified (no creates, no website changes)`);
  console.log(`  Universities Canada members: ${members.length}`);
  const memberByName = (n) => members.find((m) => norm(m.name) === norm(n));
  let univcanTuition = [];
  try {
    const p = await getPage(UNIVCAN_TUITION);
    const $ = cheerio.load(p.body);
    univcanTuition = $('table tr').map((_, tr) => [$(tr).find('th,td').map((__, c) => squash($(c).text())).get()]).get().slice(1)
      .map((r) => ({ university: apos(r[0]), undergradForeign: r[2], graduateForeign: r[4], province: r[5] }));
  } catch (err) { uncertainties.push(`Universities Canada tuition table (context only) not available: ${err.message}`); }
  let statcan = null;
  try {
    const z = await getPage(STATCAN_ZIP);
    const files = unzip(Buffer.from(z.bodyB64, 'base64'));
    const csv = files['37100045.csv'].toString('utf8').replace(/^﻿/, '').split(/\r?\n/).filter(Boolean).map(csvRow);
    const h = csv[0];
    const iRef = h.indexOf('REF_DATE');
    const latest = csv.slice(1).map((r) => r[iRef]).sort().pop();
    statcan = {
      table: '37-10-0045-01 Canadian and international tuition fees by level of study (current dollars)', url: STATCAN_TABLE, download: STATCAN_ZIP, year: latest,
      note: 'Provincial weighted averages — context only, never stored as an institution fee',
      rows: csv.slice(1).filter((r) => r[iRef] === latest && /^International/.test(r[h.indexOf('Level of study')]))
        .map((r) => ({ geo: r[h.indexOf('GEO')], level: r[h.indexOf('Level of study')], averageCAD: Number(r[h.indexOf('VALUE')]) || null })),
    };
  } catch (err) { uncertainties.push(`StatCan table 37-10-0045-01 (context only) not available: ${err.message}`); }

  // 3) DB (read-only until --apply)
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const canada = await db.collection('countries').findOne({ name: 'Canada' });
  if (!canada) throw new Error('Country "Canada" not found');
  const ours = await db.collection('universities').find({ country: canada._id }).toArray();
  console.log(`  our Canada records: ${ours.length}`);
  const byName = (n) => ours.filter((u) => u.name === n);

  // 4) Verify every registry entry against the DLI list / Universities Canada
  const byKey = Object.fromEntries(REGISTRY.map((e) => [e.key, e]));
  const verified = {};
  const dliSearch = (terms) => dliRows.filter((r) => terms.some((t) => [r.Institution, r.Campus, r.City].some((v) => norm(v).includes(norm(t)))));
  const pgwpDetails = {};
  for (const entry of REGISTRY) {
    const v = { problems: [] };
    verified[entry.key] = v;
    if (entry.kind === 'not-dli') {
      const hits = dliSearch(entry.search);
      const cc = entry.cityCheck;
      const cityHits = cc ? dliRows.filter((r) => norm(r.City).includes(norm(cc.city)) && cc.terms.some((t) => norm(r.Institution).includes(norm(t)))) : [];
      v.absent = !hits.length && !cityHits.length;
      v.searchEvidence = { url: DLI_JSON, searchedFor: entry.search, fields: ['Institution', 'Campus', 'City'], matches: hits.length + cityHits.length,
        ...(cc ? { alsoSearched: `DLIs in ${cc.city} named ${cc.terms.map((t) => `"${t}"`).join(' / ')}` } : {}) };
      if (!v.absent) v.problems.push(`found on the DLI list after all: ${[...new Set([...hits, ...cityHits].map((r) => r.Institution))].join('; ')}`);
      if (entry.univcan) v.member = memberByName(entry.univcan) || null;
      continue;
    }
    const rows = dliRows.filter((r) => r['DLI #'] === entry.dli && norm(r.Institution) === norm(entry.dliName));
    if (!rows.length) { v.problems.push(`DLI ${entry.dli} "${entry.dliName}" not found on the IRCC list`); continue; }
    const flag = (k) => [...new Set(rows.map((r) => r[k]))];
    const pgwp = flag('PGWP');
    const detailsHref = (rows.map((r) => (String(r.HTML).match(/href='([^']+)'/) || [])[1]).find(Boolean) || '').replace('/content/canadasite', '');
    v.dli = {
      number: entry.dli, name: rows[0].Institution, province: rows[0].Province,
      cities: [...new Set(rows.flatMap((r) => r.City.split(/,|\n/).map(squash)).filter(Boolean))],
      campuses: [...new Set(rows.map((r) => r.Campus).filter(Boolean))],
      publicPrivate: flag('Public/Private').join('/'),
      pgwp: pgwp.includes('Yes') ? 'Yes' : pgwp.includes('Details') ? 'Details (only listed programs)' : 'No',
      palExemptGraduatePrograms: flag('Grad Program').includes('Yes') ? 'Yes' : 'No',
      listUrl: DLI_PAGE, dataFile: DLI_JSON,
    };
    if (pgwp.includes('Details') && detailsHref) {
      const url = `https://www.canada.ca${detailsHref}`;
      if (!pgwpDetails[url]) {
        try {
          const p = await getPage(url, { scrapeDo: false });
          const t = textOf(p);
          const s = t.indexOf('You are eligible for a post-graduation work permit');
          const e = t.indexOf('Page details', s);
          pgwpDetails[url] = { url, quote: s >= 0 ? squash(t.slice(s, e > s ? e : s + 600)).slice(0, 600) : null };
        } catch (err) { pgwpDetails[url] = { url, error: err.message }; }
      }
      v.dli.pgwpDetails = pgwpDetails[url];
    }
    v.dliEvidence = { url: DLI_JSON, quote: rows.slice(0, 3).map((r) => [r.Province, r.Institution, r['DLI #'], r.City, r.Campus, r['Public/Private'], `PGWP: ${r.PGWP}`, `Grad Program: ${r['Grad Program']}`].join(' | ')) };
    if (entry.univcan) {
      v.member = memberByName(entry.univcan) || null;
      if (!v.member) v.problems.push(`"${entry.univcan}" not found on the Universities Canada member list`);
    }
  }

  // 5) Fees + courses
  const fees = {};
  for (const [key, src] of Object.entries(FEE_SOURCES)) {
    const f = { institution: src.name, year: src.year, urls: src.urls, rows: [], errors: [] };
    fees[key] = f;
    try {
      const parsed = await src.parse();
      f.rows = parsed.rows;
      f.notIncluded = parsed.notIncluded || [];
      f.evidenceUrls = [...new Set(f.rows.flatMap((r) => [r.durationEvidence, r.formatEvidence]).filter((e) => e?.verified).map((e) => e.url))];
      f.fetchedVia = [...new Set(parsed.pages.map((p) => p.via))];
      for (const q of src.mustContain || []) {
        if (!parsed.pages.some((p) => inPage(p, q))) { f.errors.push(`page no longer says "${q}"`); f.rows = []; }
      }
      f.pageChecks = (src.mustContain || []).map((q) => ({ quote: q, verified: parsed.pages.some((p) => inPage(p, q)) }));
    } catch (err) { f.errors.push(err.message); }
    f.bachelor = summariseFees(f.rows, 'bachelor');
    f.master = summariseFees(f.rows, 'master');
    for (const lvl of ['bachelor', 'master']) {
      if (!f[lvl]) continue;
      f[lvl].notIncluded = (f.notIncluded || []).filter((r) => r.level === lvl).map(({ programme, reason, format }) => ({ programme, reason, ...(format ? { notFullTimeOnCampus: true } : {}) }));
      f[lvl].standardNotCounted = (f.notIncluded || []).filter((r) => r.level === lvl && r.standard).map(({ programme, category, reason, rate }) => ({ programme, category, reason, ...(rate ? { rate } : {}) }));
    }
    const unverifiedRows = f.rows.filter((r) => !r.verified).length;
    if (unverifiedRows) uncertainties.push(`${src.name}: ${unverifiedRows} fee rows dropped (quote not found verbatim in the page text)`);
    const lvlLog = (s) => (s ? `${s.programmes ? `${money(s.min)}–${money(s.max)} (n=${s.programmes})` : 'no programme rows'}${s.standardRates.length ? ` + standard ${s.standardRates.map((x) => money(x.annualCAD)).join('/')}` : ''}` : 'n/a');
    console.log(`  fees ${key}: ${f.rows.filter((r) => r.verified).length}/${f.rows.length} verified rows; Bachelor's ${lvlLog(f.bachelor)}; Master's ${lvlLog(f.master)}${f.errors.length ? `; errors: ${f.errors.join('; ')}` : ''}`);
  }
  const courseLists = {};
  for (const [key, src] of Object.entries(COURSE_SOURCES)) {
    try {
      const parsed = await src.parse(fees[key]);
      // every name must be readable on the official page (groups marked verified were checked by the parser itself)
      const srcPages = [].concat(parsed.pages || parsed.page);
      const groups = parsed.groups.map((g) => ({ ...g, names: g.names.filter((n) => g.verified || srcPages.some((p) => inPage(p, n))) }));
      const built = buildCourses(groups);
      courseLists[key] = { url: src.url, note: parsed.note, ...(parsed.pagesRead ? { pagesRead: parsed.pagesRead } : {}), ...(parsed.excludedNames?.length ? { excludedNames: parsed.excludedNames } : {}), ...built, byLevel: Object.fromEntries(groups.map((g) => [g.level, g.names.length])), sample: (built.officialNames || built.courses).slice(0, 5) };
      if (built.overCap) {
        courseLists[key].notProposed = `the official list has ${built.totalAvailable} programme names, more than the cap of ${COURSE_CAP}; cutting it would keep only the start of the alphabet, so the existing course list is left unchanged (full official list in officialNames)`;
        uncertainties.push(`courses ${key}: ${courseLists[key].notProposed}`);
      }
      console.log(`  courses ${key}: ${built.overCap ? `not proposed (${built.totalAvailable} names > cap ${COURSE_CAP})` : `${built.courses.length} of ${built.totalAvailable}`}`);
    } catch (err) {
      courseLists[key] = { url: src.url, error: err.message };
      uncertainties.push(`courses ${key}: ${err.message}; existing list left unchanged`);
    }
  }

  // 6) Proposals
  const syncedAt = new Date();
  const changes = [];
  const creates = [];
  const institutions = [];
  const nulls = [];
  const matchedIds = new Set();
  const bachelorOnlyFees = []; // institutions whose official fee covers Bachelor's only (see reviewNotes)
  const dliStamp = (v) => ({ ...v.dli, ...(v.member ? { universitiesCanadaMember: true } : {}) });

  const deactivate = (doc, reason, evidence, row) => {
    matchedIds.add(String(doc._id));
    if (doc.isActive === false) return;
    const dataSource = { provider: PROVIDER, urls: [...new Set(evidence.map((e) => e.url).filter(Boolean))], syncedAt, fields: ['isActive'], runId: RUN_ID, action: 'deactivated', reason };
    changes.push({ id: String(doc._id), name: doc.name, action: 'deactivate', reason, diff: { isActive: { from: doc.isActive, to: false }, dataSource: { from: doc.dataSource, to: dataSource } }, evidence });
    institutions.push({ institution: doc.name, decision: 'deactivate', reason: row || reason, website: doc.website, type: doc.type, courses: (doc.courses || []).length, fees: null });
  };
  const ruleEvidence = dliRules.map((r) => ({ what: 'IRCC rule', ...r }));

  for (const entry of REGISTRY) {
    const v = verified[entry.key];
    const docs = entry.db.flatMap(byName);
    docs.forEach((d) => matchedIds.add(String(d._id)));
    const missingDb = entry.db.filter((n) => !byName(n).length);
    if (missingDb.length) uncertainties.push(`registry ${entry.key}: our record(s) ${missingDb.map((n) => `"${n}"`).join(', ')} not found in the DB`);

    // --- not a DLI → hide
    if (entry.kind === 'not-dli') {
      if (!v.absent) {
        problems.push({ key: entry.key, problems: v.problems });
        for (const d of docs) institutions.push({ institution: d.name, decision: 'no change (verification failed)', reason: v.problems.join('; ') });
        continue;
      }
      for (const doc of docs) {
        let extra = null;
        if (entry.key === 'adc') {
          try {
            const p = await getPage('https://acadiadiv.ca/');
            const m = textOf(p).match(/[^.]{0,80}Faculty of Theology[^.]{0,80}Acadia University[^.]{0,40}/i);
            extra = { what: 'own website', url: p.finalUrl, quote: m ? squash(m[0]) : squash(cheerio.load(p.body)('title').text()), verified: Boolean(m) };
          } catch (err) { extra = { what: 'own website', url: 'https://acadiadiv.ca/', quote: err.message, verified: false }; }
        }
        const memberNote = v.member ? ' (it is still on the Universities Canada member list)' : '';
        deactivate(doc, `not on IRCC's designated learning institutions list, so it cannot issue the letter of acceptance needed for a study permit${memberNote}`,
          [{ what: 'IRCC DLI list searched by name (institution, campus and city fields)', ...v.searchEvidence, verified: true }, ...ruleEvidence, ...(extra ? [extra] : []),
            ...(v.member ? [{ what: 'Universities Canada member list', url: UNIVCAN_MEMBERS, quote: v.member.name, verified: inPage(ucPage, v.member.name) }] : [])],
          `not a DLI${memberNote}`);
      }
      continue;
    }
    if (v.problems.length && !v.dli) {
      problems.push({ key: entry.key, problems: v.problems });
      for (const d of docs) institutions.push({ institution: d.name, decision: 'no change (verification failed)', reason: v.problems.join('; ') });
      continue;
    }
    if (v.problems.length) problems.push({ key: entry.key, problems: v.problems });
    const dliEv = { what: 'IRCC DLI list row(s)', url: v.dliEvidence.url, quote: v.dliEvidence.quote, verified: true };

    // --- campus / faculty records of this institution → hide (the institution's own record is kept)
    const parentDoc = docs.find((d) => d.name === (entry.keep || entry.db[0]));
    for (const c of entry.campusRecords || []) {
      for (const doc of byName(c.db)) {
        const campusRows = dliRows.filter((r) => r['DLI #'] === entry.dli && r.Campus === c.campus);
        if (!campusRows.length) { uncertainties.push(`${doc.name}: campus "${c.campus}" not found under DLI ${entry.dli}; no change`); matchedIds.add(String(doc._id)); continue; }
        deactivate(doc, `a campus of ${v.dli.name} (DLI ${entry.dli}, campus "${c.campus}"), which has its own record "${parentDoc?.name}"`, [
          { what: 'IRCC DLI list row', url: DLI_JSON, quote: campusRows.map((r) => [r.Institution, r['DLI #'], r.City, r.Campus].join(' | ')).join(' / '), verified: true }], `campus of ${parentDoc?.name}`);
      }
    }
    for (const c of entry.facultyRecords || []) {
      for (const doc of byName(c.db)) {
        let ev = null;
        try {
          const p = await getPage(c.evidenceUrl);
          const m = textOf(p).match(new RegExp(`[^.]{0,60}(?:${c.evidenceRe.source})[^.]{0,60}`, 'i'));
          ev = { what: 'own website', url: p.finalUrl, quote: m ? squash(m[0]) : null, verified: Boolean(m) };
        } catch (err) { ev = { what: 'own website', url: c.evidenceUrl, quote: err.message, verified: false }; }
        const hits = dliSearch(c.search);
        if (!ev.verified || hits.length) { uncertainties.push(`${doc.name}: faculty relation not verified (${ev.quote || 'no quote'}; DLI hits ${hits.length}); no change`); matchedIds.add(String(doc._id)); continue; }
        deactivate(doc, `a faculty of ${v.dli.name} (not a separate DLI), which has its own record "${parentDoc?.name}"`, [
          ev, { what: 'IRCC DLI list searched by name', url: DLI_JSON, searchedFor: c.search, matches: 0, verified: true }, dliEv], `faculty of ${parentDoc?.name}`);
      }
    }

    // --- several of our records for one institution → keep one, hide the rest
    let keep = docs;
    if (docs.length > 1 && !docs.some((d) => d.name === entry.keep)) {
      uncertainties.push(`${entry.key}: ${docs.length} records but the record to keep ("${entry.keep}") is not among them; no change`);
      for (const d of docs) institutions.push({ institution: d.name, decision: 'no change (keep record not found)' });
      continue;
    }
    if (docs.length > 1) {
      keep = docs.filter((d) => d.name === entry.keep);
      for (const doc of docs.filter((d) => d.name !== entry.keep)) {
        deactivate(doc, `duplicate of our record "${entry.keep}" (same institution: IRCC DLI ${entry.dli} "${v.dli.name}")`, [dliEv,
          { what: 'same website as the kept record', url: doc.website, quote: `${doc.website} / ${keep[0]?.website}`, verified: hostKey(doc.website) === hostKey(keep[0]?.website) }],
        `duplicate of ${entry.keep}`);
      }
    }

    // --- proposed values
    const proposed = {};
    const fieldEvidence = {};
    const target = keep[0] || null; // our record that receives the values (none for a create)
    const ircc = /public/i.test(v.dli.publicPrivate) ? 'PUBLIC' : /private/i.test(v.dli.publicPrivate) ? 'PRIVATE' : null;
    let type = dliChecks.publicPrivate.ok ? ircc : null;
    // Federated / affiliated colleges of a public university: IRCC is not consistent for these (Victoria College, St. Jerome's
    // and Conrad Grebel are listed as public; Trinity, St. Michael's and Renison as private), so "private" does not change type
    const parentKey = entry.federatedWith || entry.affiliatedWith;
    const parentDli = parentKey ? verified[parentKey]?.dli : null;
    let typeHeld = null;
    if (type === 'PRIVATE' && parentDli && /public/i.test(parentDli.publicPrivate)) {
      typeHeld = `IRCC lists "${v.dli.name}" as a private institution, but it is ${entry.federatedWith ? 'a federated' : 'an affiliated'} college of ${parentDli.name} (public on the same list), and IRCC lists other such colleges as public; type not changed (IRCC value kept in the report under dli.publicPrivate)`;
      type = null;
    }
    const f = entry.fees ? fees[entry.fees] : null;
    const feeLevels = [];
    let feeBlocked = null;
    if (f && fx && (f.bachelor || f.master)) {
      const check = { master: levelUsd(f.master, "Master's"), bachelor: levelUsd(f.bachelor, "Bachelor's") };
      const usd = { master: check.master.ok ? Math.round(f.master.median * fx.rate) : null, bachelor: check.bachelor.ok ? Math.round(f.bachelor.median * fx.rate) : null };
      // A level without an official USD figure must not leave an unverified value in that level's USD field: once
      // dataSource.fields names a fee field, the website shows both USD fields as official
      const blocked = [];
      if (!usd.bachelor && !usd.master) blocked.push(`no level has one representative yearly figure (Bachelor's: ${check.bachelor.reason}; Master's: ${check.master.reason})`);
      else {
        if (target && !usd.bachelor && target.tuitionFeeUSD != null) blocked.push(`no official Bachelor's figure (${check.bachelor.reason}), and the unverified tuitionFeeUSD ${target.tuitionFeeUSD} would then be shown as official`);
        if (target && !usd.master && target.graduateTuitionUSD != null) blocked.push(`no official Master's figure (${check.master.reason}), and the unverified graduateTuitionUSD ${target.graduateTuitionUSD} would then be shown as official`);
      }
      if (blocked.length) {
        feeBlocked = blocked.join('; ');
        uncertainties.push(`${f.institution}: official fee rows found but no fee field proposed (${feeBlocked}); existing values left unchanged`);
        nulls.push({ institution: entry.keep || entry.db[0], fields: [`tuition, tuitionFeeUSD, graduateTuitionUSD: not proposed (${feeBlocked}); existing values left unchanged`] });
      } else {
        // Standard rates first and on their own, then the range of the programmes that have their own rate
        const level = (s, lvl, key) => {
          const range = s.programmes ? `CAD ${money(s.typicalLow)}${s.typicalHigh !== s.typicalLow ? `–${money(s.typicalHigh)}` : ''}` : null;
          const std = s.standardRates.map((x) => `CAD ${money(x.annualCAD)} ${x.label || 'standard rate (programmes not listed separately)'}`);
          const head = std.length ? `${std.join('; ')}${range ? `; programmes with their own rate ${range}` : ''}` : range;
          const notes = [];
          if (s.programmes === 1) notes.push(s.evidence[0]?.programme);
          if (s.split) notes.push(`two fee tiers: CAD ${money(s.split.lower.min)}–${money(s.split.lower.max)} for ${s.split.lower.programmes} programmes, CAD ${money(s.split.upper.min)}–${money(s.split.upper.max)} for ${s.split.upper.programmes}: ${s.split.upper.names.slice(0, 6).join(', ')}`);
          for (const c of s.standardNotCounted || []) notes.push(`${c.category || c.programme}: ${c.rate ? c.rate.text : 'charged per class'}, no yearly figure`);
          if ((s.notIncluded || []).some((x) => x.notFullTimeOnCampus)) notes.push('full-time programmes only; part-time, online, executive and while-you-work programmes not counted');
          if (!usd[key] && check[key].short) notes.push(check[key].short);
          return `${lvl} ${head}${notes.filter(Boolean).map((n) => ` (${n})`).join('')}`;
        };
        const parts = [];
        if (f.master) parts.push(level(f.master, "Master's", 'master'));
        if (f.bachelor) parts.push(level(f.bachelor, "Bachelor's", 'bachelor'));
        if (usd.master) { proposed.graduateTuitionUSD = usd.master; feeLevels.push('master'); }
        if (usd.bachelor) { proposed.tuitionFeeUSD = usd.bachelor; feeLevels.push('bachelor'); }
        const notes = [];
        if ([f.master, f.bachelor].some((s) => s && s.programmes >= 10)) notes.push('typical range');
        if ([f.master, f.bachelor].some((s) => s && s.approx)) notes.push('approx.');
        if ([f.master, f.bachelor].some((s) => s && s.inclFees)) notes.push('incl. compulsory fees');
        const usdText = [usd.master && `Master's ≈ US$${money(usd.master)}`, usd.bachelor && `Bachelor's ≈ US$${money(usd.bachelor)}`].filter(Boolean).join(', ');
        const excl = [...(f.master?.excludedFromRange || []), ...(f.bachelor?.excludedFromRange || [])].length ? '; excl. medicine/dentistry/vet' : '';
        // a Master's range without a USD figure explains itself in its own part; with no Master's rows at all say so
        const noMaster = f.master ? '' : " · Master's: no official yearly figure in this sync, see the university's graduate fee pages";
        proposed.tuition = `${parts.join(' · ')} per year (international, ${f.year}${notes.length ? `, ${notes.join(', ')}` : ''}; median${feeLevels.length > 1 ? 's' : ''} ${usdText}${excl})${noMaster} — official ${f.institution} fee pages`;
        fieldEvidence.tuition = { urls: [...f.urls, ...(f.evidenceUrls || [])], year: f.year, fx, feeLevels, bachelor: f.bachelor, master: f.master };
        if (!usd.master) bachelorOnlyFees.push(entry.keep || entry.db[0]);
        const err = f.errors.length ? ` (${f.errors.join('; ')})` : '';
        const missing = [!usd.bachelor && `tuitionFeeUSD (Bachelor's): ${check.bachelor.reason}${err}; the official figures are in the tuition text only`,
          !usd.master && `graduateTuitionUSD (Master's): ${check.master.reason}${err}; ${f.master ? 'the official figures are in the tuition text only; ' : ''}dataSource.feeLevels = ['bachelor']`].filter(Boolean);
        if (missing.length) nulls.push({ institution: entry.keep || entry.db[0], fields: missing });
      }
    } else if (f && fx) {
      nulls.push({ institution: entry.keep || entry.db[0], fields: [`tuition, tuitionFeeUSD, graduateTuitionUSD: no international fee per year verifiable on the configured official page(s)${f.errors.length ? ` (${f.errors.join('; ')})` : ''}; existing values left unchanged`] });
    }
    const cl = entry.courses ? courseLists[entry.courses] : null;
    if (cl && cl.courses?.length) { proposed.courses = cl.courses; fieldEvidence.courses = { url: cl.url, note: `${cl.courses.length} of ${cl.totalAvailable}: ${cl.note}`, byLevel: cl.byLevel, sample: cl.sample }; }
    else if (cl?.overCap) nulls.push({ institution: entry.keep || entry.db[0], fields: [`courses: not proposed (${cl.notProposed})`] });

    const official = v.member && membersOk ? origin(v.member.website) : null;
    const row = {
      institution: entry.keep || entry.db[0] || entry.name, decision: null, dli: entry.dli, province: v.dli.province, pgwp: v.dli.pgwp, gradPrograms: v.dli.palExemptGraduatePrograms,
      type: type || ircc, irccPublicPrivate: v.dli.publicPrivate, univcanMember: Boolean(v.member), website: official || docs[0]?.website || null,
      courses: proposed.courses?.length ?? (keep[0]?.courses || []).length, coursesSource: proposed.courses ? 'official list' : 'unchanged (unverified)',
      fees: proposed.tuition || null, feeLevels: feeLevels.length ? feeLevels : null, feesUSD: proposed.tuitionFeeUSD || proposed.graduateTuitionUSD ? { bachelorMedianUSD: proposed.tuitionFeeUSD ?? null, masterMedianUSD: proposed.graduateTuitionUSD ?? null } : null,
      feeSource: f ? `${f.urls.join(' ; ')}` : null, ...(feeBlocked ? { feesNotProposed: feeBlocked } : {}), ...(typeHeld ? { typeNotChanged: typeHeld } : {}),
    };

    // --- create (Universities Canada member + DLI, missing from our DB)
    if (entry.kind === 'create') {
      if (docs.length || ours.some((u) => norm(u.name) === norm(entry.name))) { row.decision = 'exists (not created)'; institutions.push(row); continue; }
      // A new record is created only when EVERY fact its description states was verified in this run: DLI row found,
      // Universities Canada membership found on the member page, the city among the DLI cities, and no verification problem
      const memberOk = Boolean(v.member) && inPage(ucPage, v.member.name) && membersOk;
      const cityOk = v.dli.cities.some((c) => norm(c) === norm(entry.city));
      if (!memberOk || !cityOk || v.problems.length) {
        const why = [...v.problems, ...(!memberOk ? [`Universities Canada membership not verified in this run${membersOk ? '' : ' (member list parse looks incomplete)'}`] : []), ...(!cityOk ? [`city "${entry.city}" not among the DLI cities (${v.dli.cities.join(', ')})`] : [])];
        row.decision = `not created (${why.join('; ')})`;
        uncertainties.push(`${entry.name}: create skipped — ${why.join('; ')}`);
        institutions.push(row);
        continue;
      }
      let site = null;
      if (official) {
        try {
          const p = await getPage(`${official}/`);
          const title = squash(cheerio.load(p.body)('title').first().text());
          site = { url: official, finalUrl: p.finalUrl, title, verified: /St\.? Mary/i.test(title) };
        } catch (err) { site = { url: official, error: err.message, verified: false }; }
      }
      const website = site?.verified ? official : null;
      const fields = ['name', 'city', ...(type ? ['type'] : []), 'description', ...(website ? ['website', 'logo'] : [])];
      const doc = {
        name: entry.name, country: canada._id, city: entry.city, website,
        logo: website ? `https://www.google.com/s2/favicons?domain=${hostOf(website)}&sz=128` : null,
        type, tuition: null, eligibility: null,
        // built only from facts verified above (membership, DLI number, province, city)
        description: `${entry.name} is a university in ${entry.city}, ${v.dli.province}. It is a member of Universities Canada and a designated learning institution on IRCC's list (DLI ${entry.dli}), so it can enrol international students.`,
        categoryTags: ['canada', norm(entry.city), type ? type.toLowerCase() : null].filter(Boolean),
        // schema defaults would invent these — set explicitly to the official value or "unknown"
        tuitionFeeUSD: null, graduateTuitionUSD: null, minGpaPercent: null, minIeltsScore: null, minGreScore: null, greRequired: null, acceptanceRate: null,
        minScore: null, ieltsScore: null, greExam: null, workExp: null, scholarshipAvailable: null, rankingNum: null,
        courses: [], degreeLevels: [], isActive: true,
        // every stored value is official or empty, so the record carries the provider label
        dataSource: { provider: PROVIDER, urls: [DLI_PAGE, DLI_JSON, UNIVCAN_MEMBERS, ...(website ? [website] : [])], syncedAt, fields, runId: RUN_ID, createdBySync: SYNC_ID, dli: dliStamp(v) },
        createdAt: syncedAt, updatedAt: syncedAt,
      };
      creates.push({ name: entry.name, doc, evidence: [dliEv, { what: 'Universities Canada member list', url: UNIVCAN_MEMBERS, quote: v.member?.name, website: v.member?.website, verified: Boolean(v.member) }, ...(site ? [{ what: 'official website check', url: site.url, quote: site.title ? `${site.finalUrl} — ${site.title}` : site.error, verified: site.verified }] : [])] });
      nulls.push({ institution: entry.name, fields: ['tuition, tuitionFeeUSD, graduateTuitionUSD: no official fee source configured', 'courses, degreeLevels: no machine-readable official programme list configured', 'IELTS/GPA/GRE/work experience/acceptance rate/scholarship/rank: not part of these sources'] });
      row.decision = 'create';
      row.website = website;
      institutions.push(row);
      continue;
    }

    if (!keep.length) { row.decision = 'not in DB'; institutions.push(row); continue; }
    const doc = keep[0];
    const diff = {};
    // field → value the official sources give in THIS run (used to keep earlier official markers that still hold)
    const officialNow = {};
    if (type) {
      officialNow.type = type;
      if (String(doc.type || '').toUpperCase() !== type) diff.type = { from: doc.type, to: type };
    }
    // The "public"/"private" category tag (publicUniversityController filters on categoryTags) follows a type change, so
    // the category filter does not contradict the type; the other tags stay as they are
    if (diff.type) {
      const tags = Array.isArray(doc.categoryTags) ? doc.categoryTags : [];
      const want = type.toLowerCase();
      const other = want === 'public' ? 'private' : 'public';
      if (tags.some((t) => String(t).toLowerCase() === other)) {
        diff.categoryTags = { from: doc.categoryTags, to: [...new Set(tags.map((t) => (String(t).toLowerCase() === other ? want : t)))] };
      }
    }
    if (typeHeld && String(doc.type || '').toUpperCase() !== ircc) uncertainties.push(`${doc.name}: ${typeHeld}`);
    // Official website as linked by Universities Canada (only when the host differs, ignoring www./www2.)
    let siteCheck = null;
    const favicon = (site) => `https://www.google.com/s2/favicons?domain=${hostOf(site)}&sz=128`;
    if (official && hostKey(doc.website) === hostKey(official)) {
      officialNow.website = doc.website;
      if (doc.logo === favicon(doc.website)) officialNow.logo = doc.logo;
    } else if (official) {
      try {
        const p = await getPage(`${official}/`);
        const title = squash(cheerio.load(p.body)('title').first().text());
        const words = norm(entry.univcan).split(' ').filter((w) => w.length > 3 && !/universit|college|the/.test(w));
        siteCheck = { url: official, finalUrl: p.finalUrl, title, verified: !words.length || words.some((w) => norm(title).includes(w)) || hostKey(p.finalUrl) === hostKey(official) };
      } catch (err) { siteCheck = { url: official, error: err.message, verified: false }; }
      if (siteCheck.verified) {
        diff.website = { from: doc.website, to: official };
        if (doc.logo) diff.logo = { from: doc.logo, to: favicon(official) };
      } else uncertainties.push(`${doc.name}: Universities Canada links ${official} but the site check failed (${siteCheck.error || siteCheck.title}); website unchanged`);
    }
    // Public DLIs that are NOT on IRCC's list of public DLIs offering degree-granting master's/doctoral programs
    if (dliChecks.gradProgram.ok && /public/i.test(v.dli.publicPrivate) && v.dli.palExemptGraduatePrograms === 'No' && Array.isArray(doc.degreeLevels)) {
      const kept = doc.degreeLevels.filter((l) => !/master|postgrad|ph\.?\s?d|doctor/i.test(l));
      if (kept.length && kept.length !== doc.degreeLevels.length) {
        diff.degreeLevels = { from: doc.degreeLevels, to: kept };
        fieldEvidence.degreeLevels = { url: DLI_PAGE, note: 'not on IRCC\'s list of "Public DLIs offering PAL/TAL-exempt graduate programs" (degree-granting master\'s and doctorate programs)', dliGradProgramFlag: 'No' };
      } else if (kept.length === doc.degreeLevels.length) officialNow.degreeLevels = doc.degreeLevels;
    }
    for (const [k, val] of Object.entries(proposed)) {
      officialNow[k] = val;
      if (JSON.stringify(doc[k]) !== JSON.stringify(val)) diff[k] = { from: doc[k], to: val };
    }
    if (doc.isActive === false) diff.isActive = { from: false, to: true };
    // Re-runs: fields an earlier run of this script marked official stay in dataSource.fields while this run's official
    // value still equals the stored one; nothing is written when no value changes (no "stamp-only" writes)
    const prevDs = doc.dataSource && /^canada-sync-/.test(String(doc.dataSource.runId || '')) ? doc.dataSource : null;
    const prevFields = Array.isArray(prevDs?.fields) ? prevDs.fields : [];
    const carried = prevFields.filter((k) => !diff[k] && k in officialNow && JSON.stringify(doc[k]) === JSON.stringify(officialNow[k]));
    const notReverified = prevFields.filter((k) => !diff[k] && !carried.includes(k));
    const fieldsChanged = Object.keys(diff);
    row.dbName = doc.name;
    row.type = diff.type ? diff.type.to : doc.type;
    if (!official && docs[0]) row.website = doc.website;
    if (!fieldsChanged.length) {
      row.decision = prevDs ? `no change (matches the official sources; earlier sync ${prevDs.runId} kept)` : 'no change (nothing to update; DLI verification in this report only)';
      if (notReverified.length) uncertainties.push(`${doc.name}: ${notReverified.join(', ')} marked official by ${prevDs.runId} could not be re-verified in this run (no write, markers left as they are)`);
    } else {
      // categoryTags is only adjusted to the official type (its other tags are not from an official source): not in fields
      const fields = [...new Set([...carried, ...fieldsChanged.filter((k) => !DERIVED_FIELDS.includes(k))])];
      const feeFields = fields.filter((k) => FEE_FIELDS.includes(k));
      if (notReverified.length) uncertainties.push(`${doc.name}: ${notReverified.join(', ')} marked official by ${prevDs.runId} could not be re-verified in this run; dropped from dataSource.fields (values unchanged)`);
      const urls = [...new Set([DLI_PAGE, DLI_JSON, ...(v.member ? [UNIVCAN_MEMBERS] : []), ...(fields.includes('courses') ? [fieldEvidence.courses.url] : []), ...(feeFields.length ? [...f.urls, ...(f.evidenceUrls || [])] : [])])];
      // The website labels every record that has dataSource.provider as "Official government & university data" (badge,
      // "updated <syncedAt>") and, when a fee field is in fields, shows the USD fee WITHOUT '≈' and with that label on
      // EVERY programme row (frontend courseFinderHelper.js), and uses tuitionFeeUSD as the fee of Master's applicants when
      // graduateTuitionUSD is missing (shortlistController feeForDegree). provider/syncedAt are therefore set only when
      // all of that is official: an official fee field, a Master's figure when the record offers graduate programmes,
      // and an official course list (or none). Otherwise the official values are stored with sourceNames/checkedAt.
      const final = (k) => (diff[k] ? diff[k].to : doc[k]);
      const finalCourses = Array.isArray(final('courses')) ? final('courses') : [];
      const finalLevels = Array.isArray(final('degreeLevels')) ? final('degreeLevels') : [];
      const offersGraduate = finalLevels.some((l) => GRAD_LEVEL.test(l)) || finalCourses.some((c) => GRAD_COURSE.test(c));
      const labelBlockers = [];
      if (feeFields.length) {
        if (!feeLevels.includes('master') && offersGraduate) labelBlockers.push(`the official USD fee covers Bachelor's only but the record offers graduate programmes (degreeLevels ${JSON.stringify(finalLevels)}), so the website would show the Bachelor's figure as the official fee of Master's programmes`);
        if (finalCourses.length && !fields.includes('courses')) labelBlockers.push(`its ${finalCourses.length} course names are not from an official source, and the website puts the official label (isRealData) on every programme row`);
      }
      const labelled = feeFields.length > 0 && !labelBlockers.length;
      const feeData = feeFields.length ? {
        fx, feeYear: f.year, feeLevels,
        feeBasis: `USD field per level = unweighted median of programme-specific official international yearly fees, only for a level with ≥${MIN_LEVEL_ROWS} programme-specific rows, no two-tier split and no standard rate covering programmes not listed separately; typical range (display) = 10th–90th percentile; medicine/dentistry/vet excluded${feeLevels.includes('master') ? '' : "; tuitionFeeUSD is a Bachelor's figure (no official Master's figure)"}`,
      } : {};
      const derived = diff.categoryTags ? { derived: { categoryTags: `the "${type.toLowerCase()}" tag replaces "${type === 'PUBLIC' ? 'private' : 'public'}" to match type (IRCC Public/Private column); the other tags are unchanged and not verified` } } : {};
      const dataSource = labelled
        ? { provider: PROVIDER, urls, syncedAt, fields, runId: RUN_ID, dli: dliStamp(v), ...feeData, ...derived }
        : {
          sourceNames: PROVIDER, urls, checkedAt: syncedAt, fields, runId: RUN_ID, dli: dliStamp(v), ...feeData, ...derived,
          labelWithheld: feeFields.length
            ? `provider/syncedAt deliberately not set (the website then shows the fee as an estimate): ${labelBlockers.join('; ')}`
            : 'provider/syncedAt deliberately not set: fees and courses of this record are not from an official source, and the website shows the official-data label for any record with a provider',
        };
      diff.dataSource = { from: doc.dataSource, to: dataSource };
      const evidence = [dliEv, ...ruleEvidence];
      if (v.member) evidence.push({ what: 'Universities Canada member list', url: UNIVCAN_MEMBERS, quote: v.member.name, website: v.member.website, verified: inPage(ucPage, v.member.name) });
      if (diff.website) evidence.push({ what: 'official website check', url: siteCheck.url, quote: `${siteCheck.finalUrl} — ${siteCheck.title}`, verified: true });
      if (v.dli.pgwpDetails) evidence.push({ what: 'IRCC PGWP details page', ...v.dli.pgwpDetails, verified: Boolean(v.dli.pgwpDetails.quote) });
      for (const k of ['courses', 'degreeLevels', 'tuition']) if (fieldEvidence[k] && (diff[k] || (k === 'tuition' && (diff.tuitionFeeUSD || diff.graduateTuitionUSD)))) evidence.push({ what: k, ...fieldEvidence[k] });
      if (diff.categoryTags) evidence.push({ what: 'categoryTags', note: derived.derived.categoryTags, from: diff.categoryTags.from, to: diff.categoryTags.to });
      changes.push({
        id: String(doc._id), name: doc.name, action: 'update', diff, evidence, ...(carried.length ? { fieldsKeptFromEarlierSync: carried } : {}),
        labelled, officialFee: feeFields.length > 0, ...(labelBlockers.length ? { labelWithheldBecause: labelBlockers } : {}),
      });
      row.decision = `update (${fieldsChanged.join(', ')})${labelled ? '' : feeFields.length ? ' — official fee stored, no official-data label' : ' — no official-data label'}`;
      if (labelBlockers.length) row.labelWithheld = labelBlockers;
    }
    const city = norm(doc.city);
    if (city && !v.dli.cities.some((c) => norm(c) === city || norm(c).includes(city) || city.includes(norm(c)))) {
      uncertainties.push(`${doc.name}: our city "${doc.city}" is not among the DLI cities (${v.dli.cities.join(', ')}); city left unchanged`);
    }
    institutions.push(row);
  }

  // 7) Flags for the reviewer (nothing is changed for these)
  const hiddenIds = new Set(changes.filter((c) => c.action === 'deactivate').map((c) => c.id));
  const feeKeys = new Set(institutions.filter((i) => i.feeLevels).map((i) => i.dbName || i.institution));
  const courseKeys = new Set(REGISTRY.filter((e) => e.courses && courseLists[e.courses]?.courses?.length).flatMap((e) => e.db));
  const DEFAULTISH = { minIeltsScore: 6.5, minGpaPercent: 60, ieltsScore: 'IELTS 6.0+', minScore: 'GPA 3.0+', greExam: 'GRE Waived', workExp: 'Freshers Eligible', scholarshipAvailable: true };
  const unverifiedFields = ours.filter((u) => !hiddenIds.has(String(u._id))).map((u) => {
    const fields = [];
    if (!feeKeys.has(u.name) && (u.tuitionFeeUSD != null || u.tuition)) fields.push('tuitionFeeUSD/tuition (no official fee source checked; left unchanged)');
    const overCapList = REGISTRY.find((e) => e.courses && e.db.includes(u.name) && courseLists[e.courses]?.overCap);
    if (!courseKeys.has(u.name) && (u.courses || []).length) fields.push(overCapList ? `courses (official list has ${courseLists[overCapList.courses].totalAvailable} names, more than the cap of ${COURSE_CAP}; left unchanged, see courseLists.${overCapList.courses})` : 'courses (no machine-readable official programme list used; left unchanged)');
    fields.push(...Object.entries(DEFAULTISH).filter(([k, val]) => u[k] === val).map(([k]) => `${k} (template-like value)`));
    if (u.acceptanceRate != null) fields.push('acceptanceRate');
    if (u.description && !u.dataSource) fields.push('description');
    return { name: u.name, fields, current: { tuition: u.tuition, tuitionFeeUSD: u.tuitionFeeUSD, coursesCount: (u.courses || []).length, acceptanceRate: u.acceptanceRate, minIeltsScore: u.minIeltsScore } };
  }).filter((x) => x.fields.length);
  const rankingFlags = ours.filter((u) => u.rankingNum != null && !u.rankingSource).map((u) => ({ name: u.name, rankingNum: u.rankingNum, rank: u.rank }));
  // Records of DIFFERENT institutions that point to the same website, where at least one record stays visible
  const entryOf = (u) => REGISTRY.find((e) => e.db.includes(u.name) || (e.campusRecords || []).some((c) => c.db === u.name) || (e.facultyRecords || []).some((c) => c.db === u.name))?.key || u.name;
  const withSite = ours.filter((u) => u.website).map((u) => {
    const wsDiff = changes.find((c) => c.id === String(u._id) && c.diff.website);
    const site = wsDiff ? wsDiff.diff.website.to : u.website;
    let p = '';
    try { p = new URL(/^https?:\/\//i.test(site) ? site : `https://${site}`).pathname.replace(/\/+$/, ''); } catch (_) { /* keep '' */ }
    return { name: u.name, website: site, key: `${hostKey(site)}${p}`, entry: entryOf(u), hidden: hiddenIds.has(String(u._id)) };
  });
  const sharedWebsites = Object.values(withSite.reduce((acc, x) => { (acc[x.key] = acc[x.key] || []).push(x); return acc; }, {}))
    .filter((g) => new Set(g.map((x) => x.entry)).size > 1 && g.some((x) => !x.hidden))
    .map((g) => ({ website: g[0].website, records: g.map((x) => `${x.name}${x.hidden ? ' (hidden by this run)' : ''}`), note: 'different institutions with the same website in our DB; website not changed (no official website source for the visible record)' }));
  for (const g of sharedWebsites) uncertainties.push(`same website ${g.website} on ${g.records.join(' + ')} — check which institution it belongs to`);
  const unmatched = ours.filter((u) => !matchedIds.has(String(u._id))).map((u) => u.name);
  const registryDlis = new Set(REGISTRY.map((e) => e.dli).filter(Boolean));
  const dliInstitutions = [...new Map(dliRows.map((r) => [`${r['DLI #']}|${r.Institution}`, r])).values()];
  const candidatesNotInDb = [
    ...members.filter((m) => !REGISTRY.some((e) => e.univcan && norm(e.univcan) === norm(m.name)))
      .map((m) => {
        const hit = dliInstitutions.find((r) => norm(r.Institution).includes(norm(m.name)) || norm(r.Campus).includes(norm(m.name)));
        return { name: m.name, source: 'Universities Canada member', website: m.website, dli: hit ? `${hit['DLI #']} (${hit.Institution}${hit.Campus ? ` / ${hit.Campus}` : ''})` : 'not found by name on the DLI list', note: 'not created by this script' };
      }),
    ...dliInstitutions.filter((r) => !registryDlis.has(r['DLI #']) && /universit|polytechni/i.test(r.Institution))
      .map((r) => ({ name: r.Institution, source: `IRCC DLI (${r['Public/Private']})`, dli: r['DLI #'], province: r.Province, pgwp: r.PGWP, gradPrograms: r['Grad Program'], note: 'DLI with "university/polytechnic" in its name, not in our DB (not created by this script)' })),
  ];
  const crossCheck = Object.entries(fees).filter(([, f]) => f.bachelor).map(([key, f]) => {
    const entry = REGISTRY.find((e) => e.fees === key);
    const uc = univcanTuition.find((t) => norm(t.university).includes(norm(entry.univcan || f.institution)) || norm(entry.univcan || f.institution).includes(norm(t.university)));
    return { institution: f.institution, officialBachelorMedianCAD: Math.round(f.bachelor.median), univcanStatcanArtsUndergradForeign: uc ? uc.undergradForeign : null, univcanStatcanGraduateForeign: uc ? uc.graduateForeign : null };
  });

  // Points for the reviewer. blocking:true = something the website would show wrongly that this script could not prevent;
  // --apply is refused while such a note exists unless --accept-review-notes is given.
  const reviewNotes = [];
  const updates = changes.filter((c) => c.action === 'update');
  const unlabelledFee = updates.filter((c) => c.officialFee && !c.labelled);
  if (bachelorOnlyFees.length) {
    // Records that offer graduate programmes but get an official Bachelor's figure only: the label is withheld (above), but
    // the shortlist budget filter (backend/controllers/shortlistController.js feeForDegree) uses tuitionFeeUSD as the fee of
    // a Master's/PhD target whenever graduateTuitionUSD is missing, and returns it as that applicant's fee. This script
    // cannot prevent that, so the note is BLOCKING: --apply is refused unless --accept-review-notes is given.
    const gradAffected = unlabelledFee.filter((c) => (c.labelWithheldBecause || []).some((b) => /Bachelor's only/.test(b)));
    reviewNotes.push({
      topic: "Bachelor's-only official fees", blocking: gradAffected.length > 0, institutions: bachelorOnlyFees,
      labelWithheldOn: gradAffected.map((c) => c.name),
      masterBudgetFilterUses: gradAffected.map((c) => {
        const doc = ours.find((u) => String(u._id) === c.id) || {};
        return {
          name: c.name, tuitionFeeUSD: { from: doc.tuitionFeeUSD ?? null, to: c.diff.tuitionFeeUSD ? c.diff.tuitionFeeUSD.to : doc.tuitionFeeUSD ?? null },
          graduateTuitionUSD: doc.graduateTuitionUSD ?? null,
        };
      }),
      note: `graduateTuitionUSD stays unset (no representative official Master's yearly figure in this sync; see nullsAndWhy for the reason per institution); dataSource.feeLevels = ['bachelor'] and the tuition text says so. Records that offer graduate programmes get NO dataSource.provider (labelWithheld), so the website shows their fee as an estimate ('≈ USD …', 'Estimate, verify on official site') instead of calling the Bachelor's figure the official fee of Master's programmes.${gradAffected.length ? ` BLOCKING: the shortlist budget filter (backend/controllers/shortlistController.js feeForDegree) falls back to tuitionFeeUSD for Master's/PhD targets when graduateTuitionUSD is missing, so for the ${gradAffected.length} record(s) in masterBudgetFilterUses the official Bachelor's median would be used (and returned as the fee) for Master's applicants instead of the earlier template value — typically higher than these universities' Master's fees, so they can drop out of budget-filtered Master's shortlists. This script cannot change that: either gate feeForDegree on 'master' in dataSource.feeLevels (or on graduateTuitionUSD) first, or accept it explicitly with --accept-review-notes.` : ''} A frontend gate on 'master' in dataSource.feeLevels would let these records carry the label later.`,
    });
  }
  for (const f of Object.values(fees)) {
    for (const [lvl, s] of [["Bachelor's", f.bachelor], ["Master's", f.master]]) {
      if (!s?.split) continue;
      const tiers = ['lower', 'upper'].map((k) => ({ tier: k, ...s.split[k], medianUSD: fx ? Math.round(s.split[k].median * fx.rate) : null }));
      reviewNotes.push({
        topic: `${f.institution} ${lvl}: two fee tiers — no USD figure proposed`, blocking: false, tiers, unweightedMedianCAD: s.median,
        note: `The fees split into two separate tiers; the unweighted median (CAD ${money(s.median)}) would lie in the ${s.split.medianIn} tier only because that tier has more programme rows (${s.split[s.split.medianIn].programmes} of ${s.programmes}), and no enrolment weights are published. The website would show that one figure as the official fee of every programme and use it for budget filtering, so no USD field is proposed for this level (if the record already holds an unverified USD value, no fee field is proposed at all: see nullsAndWhy). Choosing a representative tier (medians above, in CAD and USD) is a reviewer decision outside this script.`,
      });
    }
  }
  for (const f of Object.values(fees)) {
    for (const [lvl, s] of [["Bachelor's", f.bachelor], ["Master's", f.master]]) {
      if (!s?.standardRates?.length) continue;
      reviewNotes.push({
        topic: `${f.institution} ${lvl}: standard rate + programme-specific rates — no USD figure proposed`, blocking: false,
        standardRates: s.standardRates.map((x) => ({ ...x, annualUSD: fx ? Math.round(x.annualCAD * fx.rate) : null })),
        programmeSpecific: s.programmes ? { programmes: s.programmes, minCAD: s.min, maxCAD: s.max, medianCAD: s.median, medianUSD: fx ? Math.round(s.median * fx.rate) : null } : null,
        note: 'The standard rate applies to every programme not listed separately (typically thesis-based programmes), and no share of programmes or students is published for it. Neither the standard rate nor the median of the separately listed programmes represents the level, so the level is in the tuition text only (both figures shown). Choosing one figure is a reviewer decision outside this script.',
      });
    }
  }
  if (unlabelledFee.length) {
    reviewNotes.push({
      topic: 'Official fee stored without the official-data label', blocking: false,
      records: unlabelledFee.map((c) => ({ name: c.name, coursesCount: (c.diff.courses?.to || ours.find((u) => String(u._id) === c.id)?.courses || []).length, coursesOfficial: c.diff.dataSource.to.fields.includes('courses'), feeLevels: c.diff.dataSource.to.feeLevels, why: c.labelWithheldBecause })),
      note: "These records get the official fee values (dataSource.fields lists them, sourceNames/checkedAt, feeLevels, fx), but NOT dataSource.provider, because the website would otherwise put the official label on values that are not official: unverified template course names on every programme row (courseFinderHelper sourceLabel/isRealData) and/or the Bachelor's figure as the official fee of Master's programmes. The website therefore shows their fee as an estimate. Once the frontend gates the per-programme label on 'courses' in dataSource.fields and the Master's fee on 'master' in dataSource.feeLevels, a re-run can label them.",
    });
  }
  // Safety net: a labelled record must not show anything unofficial under the label (cannot happen by construction)
  const badLabels = updates.filter((c) => c.labelled).filter((c) => {
    const to = c.diff.dataSource.to;
    const doc = ours.find((u) => String(u._id) === c.id) || {};
    const courses = c.diff.courses?.to || doc.courses || [];
    const levels = c.diff.degreeLevels?.to || doc.degreeLevels || [];
    const grad = levels.some((l) => GRAD_LEVEL.test(l)) || courses.some((x) => GRAD_COURSE.test(x));
    return (courses.length && !to.fields.includes('courses')) || (grad && !(to.feeLevels || []).includes('master'));
  });
  if (badLabels.length) {
    reviewNotes.push({ topic: 'Official-data label on unofficial values', blocking: true, records: badLabels.map((c) => c.name), note: "These records would carry dataSource.provider although their course list or Master's fee is not official. Do not apply." });
  }
  reviewNotes.push({
    topic: 'Official-data label', blocking: false,
    note: `dataSource.provider/syncedAt (the website shows "Official government & university data" for any record with a provider, and calls its fee official) are set only on ${updates.filter((c) => c.labelled).length} updated record(s) whose fee covers every level they offer and whose course list is official${creates.length ? `, and on ${creates.length} created record(s) whose every stored value is official or empty` : ''}. ${unlabelledFee.length} record(s) get official fees without the label (see above) and ${updates.filter((c) => !c.officialFee).length} updated record(s) (type/website/degreeLevels only) carry sourceNames/checkedAt; records with nothing to change are not written at all.`,
  });

  // The plan = every record/field this run would write and the value it would write (volatile stamps excluded).
  // --apply --expect compares it entry by entry with the reviewed dry run and writes nothing on any difference.
  const plan = buildPlan(changes, creates);
  let mode = APPLY ? 'apply' : 'dry-run';
  let expectCheck = null;
  if (expected) {
    const differences = comparePlans(expected.plan, plan);
    expectCheck = { report: path.resolve(EXPECT), reviewedRunId: expected.runId, expectedHash: expected.plan.hash, actualHash: plan.hash, match: !differences.length && expected.plan.hash === plan.hash, differences: differences.slice(0, 300) };
    if (!expectCheck.match) mode = 'apply-refused';
  }
  const blockingNotes = reviewNotes.filter((n) => n.blocking);
  const notesRefused = APPLY && blockingNotes.length > 0 && !CLI.acceptReviewNotes;
  if (notesRefused) mode = 'apply-refused';
  const count = (fld) => changes.filter((c) => c.action !== 'deactivate' && c.diff[fld]).length;
  const summary = {
    runId: RUN_ID, mode, planHash: plan.hash, ...(expectCheck ? { expectCheck: { report: expectCheck.report, match: expectCheck.match, differences: expectCheck.differences.length } } : {}), ourCanadaRecords: ours.length,
    creates: creates.length,
    updates: changes.filter((c) => c.action === 'update').length,
    updatesWithOfficialDataLabel: changes.filter((c) => c.action === 'update' && c.labelled).length,
    updatesWithoutLabel: changes.filter((c) => c.action === 'update' && !c.labelled).length,
    updatesWithOfficialFeeWithoutLabel: changes.filter((c) => c.action === 'update' && c.officialFee && !c.labelled).length,
    blockingReviewNotes: blockingNotes.length,
    unchangedRecords: institutions.filter((i) => /^no change \((matches|nothing)/.test(String(i.decision))).length,
    deactivations: changes.filter((c) => c.action === 'deactivate').length,
    fieldsChanged: Object.fromEntries(['type', 'categoryTags', 'website', 'courses', 'degreeLevels', 'tuition', 'tuitionFeeUSD', 'graduateTuitionUSD', 'isActive'].map((fld) => [fld, count(fld)])),
    institutionsWithOfficialFees: Object.values(fees).filter((f) => f.bachelor || f.master).length,
    feeFieldsProposed: institutions.filter((i) => i.feeLevels).map((i) => `${i.dbName || i.institution} (${i.feeLevels.join('+')})`),
    unmatchedDbRecords: unmatched, verificationProblems: problems, dli: dliMeta, universitiesCanadaMembers: members.length, requests: counters, fx,
  };

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  // One file per run and mode (runId has second precision); 'wx' never overwrites an existing report — an apply report is
  // the only record of the previous values that --revert restores
  const reportPath = path.join(REPORT_DIR, `${RUN_ID}-${mode}.json`);
  const report = {
    summary, runId: RUN_ID, generatedAt: syncedAt, script: 'scripts/dataSync/canadaSync.js',
    ...(expectCheck ? { expectCheck } : {}), ...(expected ? { fxPinnedFrom: path.resolve(EXPECT) } : {}),
    sources: {
      dli: { ...dliMeta, rules: dliRules }, universitiesCanada: { url: UNIVCAN_MEMBERS, members: members.length },
      fees: Object.fromEntries(Object.entries(FEE_SOURCES).map(([k, s]) => [k, s.urls])), courses: Object.fromEntries(Object.entries(COURSE_SOURCES).map(([k, s]) => [k, s.url])), fx,
    },
    institutions, creates, changes, fees, courseLists, nullsAndWhy: nulls, unverifiedFields,
    sharedWebsites,
    rankingFlags: { count: rankingFlags.length, note: 'rankingNum present without rankingSource (not from the official QS import); ranking fields are NOT touched by this script', records: rankingFlags },
    candidatesNotInDb, context: { statcanProvincialAverages: statcan, univcanCrossCheck: { url: UNIVCAN_TUITION, note: 'Statistics Canada figures for arts & humanities programs as republished by Universities Canada — cross-check only, not stored', rows: crossCheck } },
    uncertainties,
    reviewNotes,
    methodNotes: [
      `Eligibility = listed on IRCC's designated learning institutions list (the data file dli-full-list.json loaded by the canada.ca page). Records not on the list, campus/faculty records of another record, and duplicates are hidden with isActive:false (never deleted).`,
      `Records are written only when a value changes. dataSource.fields = the fields changed in this run plus fields an earlier canadaSync run marked official whose stored value still equals this run's official value (categoryTags, adjusted only in its public/private tag, is written but described under dataSource.derived instead). dataSource.provider/syncedAt (the website labels any record with a provider as official data, and its fee as official on every programme row) are set only when fields include a fee field AND the record's Master's fee is official whenever it offers graduate programmes AND its course list is official (or empty); other updated records — including ones whose official fee is stored — get sourceNames/checkedAt and labelWithheld. A created record gets provider only because every value it stores is official or empty. The DLI verification of unchanged records is in this report (institutions[]).`,
      `dataSource.dli records the DLI number, IRCC name, province, cities/campuses, public/private, PGWP flag ("Details" = only the programs on IRCC's details page) and whether a public DLI is on IRCC's list of public DLIs offering degree-granting master's/doctoral programs (PAL/TAL-exempt).`,
      `Fee year 2026-27 for all ten sources. "Per year" = the figure the page states for one year (full course load / two terms / 30 units; UBC master's: fee per instalment × instalments per year; Queen's graduate: 3 terms, 50/25/25-assessed programmes Per Term × 4; USask special per-term rates × the 3 terms of the standard-rate table). Standard rates that cover every programme not listed separately (UBC Schedule A, Queen's "Various Master Programs", USask thesis/project-based) are reported on their own and named in the tuition text; they are NOT counted in the range or median. Only full-time programmes are counted: part-time, per-unit, online, executive and Smith "While you work" programmes are listed under fees.<key>.notIncluded (notFullTimeOnCampus) and the tuition text says "full-time programmes only". Smith School of Business programmes count only when their own page states a full-time format, does not say "While you work", and the programme is verified as 12 months long (whole-programme tuition = one year). Waterloo, Carleton and TMU figures include compulsory/incidental fees as published (marked "incl. compulsory fees"); Waterloo and York are rounded/approximate (marked "approx.").`,
      `One rule for every institution and level: display range = 10th–90th percentile of programme-specific fees when ≥10 programmes, else min–max; tuitionFeeUSD / graduateTuitionUSD = unweighted median of programme-specific Bachelor's / Master's fees × ECB CAD→USD rate, set only for a level with ≥${MIN_LEVEL_ROWS} programme-specific rows, NO standard rate (counted or uncounted, e.g. UBC Schedule A, Queen's "Various Master Programs", USask thesis-based and course-based rates — the share of programmes they cover is not published) and fees that do NOT split into two clearly separate tiers; any other level is described in the tuition text only and reviewNotes give the figures for a reviewer decision. Fee fields are proposed only when no unverified value would remain in the other level's USD field (otherwise the record's fee is left unchanged). Medicine/dentistry/veterinary/optometry rows are excluded from range and median; law (JD), pharmacy (PharmD) and other professional doctorates are not counted as Bachelor's.`,
      `Courses: official programme names, deduplicated, Master's first. A list is never cut: when an official list has more than ${COURSE_CAP} names (UBC: all 4 pages read), no course list is proposed and the existing one stays (listed under unverifiedFields; the full official list is in courseLists.<key>.officialNames, professional MD/DMD/PharmD under excludedNames).`,
      `Every run writes its own report <runId>-<mode>.json and never overwrites an existing one. plan.entries lists every record/field the run would write with a hash of the value. --apply requires --expect <reviewed dry-run report> (or an explicit --no-expect): it reuses that report's FX rate and aborts before the first write unless its plan is identical; --apply is also refused while reviewNotes contain a blocking note, unless --accept-review-notes is given (mode "apply-refused"). Blocking: an official-data label on unofficial values (cannot happen by construction), and a Bachelor's-only official tuitionFeeUSD on a record with graduate programmes (the shortlist budget filter uses tuitionFeeUSD as the Master's fee when graduateTuitionUSD is missing).`,
      `Type (PUBLIC/PRIVATE) follows the DLI list's Public/Private column, except that a "private" flag does not change the type of a federated/affiliated college of a public university (IRCC lists such colleges inconsistently); when type changes, a contradicting "public"/"private" category tag is replaced to match. degreeLevels lose Master's/PhD only for PUBLIC DLIs that IRCC does not list as offering degree-granting graduate programs. Both are skipped when the data-file column checks (sources.dli.checks) fail.`,
      `A missing institution is created only when its DLI row, its Universities Canada membership (member list parsed with a plausible size) and its city are verified in the run; its description states only those facts.`,
      `Statistics Canada (37-10-0045-01) provincial averages and the Universities Canada per-university table are context only and never stored.`,
    ],
  };
  report.plan = plan;
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), { flag: 'wx' });
  } catch (err) {
    if (err.code === 'EEXIST') throw new Error(`report ${reportPath} already exists; refusing to overwrite it (nothing was written to the DB)`);
    throw err;
  }

  console.log(JSON.stringify({ ...summary, unmatchedDbRecords: summary.unmatchedDbRecords.length, verificationProblems: summary.verificationProblems.length }, null, 2));
  console.table(institutions.map((i) => ({ institution: String(i.dbName || i.institution).slice(0, 48), decision: String(i.decision).slice(0, 40), type: i.type || '', courses: i.courses ?? '', usd: i.feesUSD ? `${i.feesUSD.bachelorMedianUSD ?? '-'} / ${i.feesUSD.masterMedianUSD ?? '-'}` : '' })));
  console.log(`full report: ${reportPath}`);

  if (mode === 'apply-refused') {
    const why = [];
    if (expectCheck && !expectCheck.match) {
      console.error(`PLAN MISMATCH with ${EXPECT} (${expectCheck.differences.length} difference(s)); nothing was written:`);
      for (const d of expectCheck.differences.slice(0, 40)) console.error(`  - ${d}`);
      why.push(`the plan differs from the reviewed dry run ${EXPECT}`);
    }
    if (notesRefused) {
      console.error(`BLOCKING REVIEW NOTES (${blockingNotes.length}); nothing was written:`);
      for (const n of blockingNotes) console.error(`  - ${n.topic}`);
      why.push(`${blockingNotes.length} blocking review note(s); decide on them and re-run with --accept-review-notes`);
    }
    throw new Error(`--apply refused: ${why.join('; ')}; see ${reportPath}`);
  }
  if (APPLY) {
    // The report is saved BEFORE the first write (applyStartedAt) and after every write, so a run that stops half-way
    // can still be reverted (--revert accepts it; every written record carries dataSource.runId).
    const col = db.collection('universities');
    const save = () => fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    let written = 0;
    report.applyStartedAt = new Date();
    save();
    try {
      for (const c of changes) {
        const set = {};
        for (const [k, val] of Object.entries(c.diff)) set[k] = val.to;
        set.updatedAt = new Date();
        await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id) }, { $set: set });
        c.writtenAt = new Date();
        written += 1;
        save();
      }
      for (const c of creates) {
        const clash = await col.findOne({ name: c.doc.name, country: c.doc.country, city: c.doc.city });
        if (clash) { c.skipped = 'a record with the same name/country/city exists'; save(); continue; }
        const r = await col.insertOne(c.doc);
        c.insertedId = String(r.insertedId);
        save();
      }
      report.appliedAt = new Date();
    } catch (err) {
      report.applyError = `${err.message} (after ${written} of ${changes.length} updates); revert with --revert ${reportPath}`;
      throw err;
    } finally {
      save();
    }
    console.log(`APPLIED: ${written} updated/deactivated, ${creates.filter((c) => c.insertedId).length} created (revert: --revert ${reportPath})`);
  }
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('FAILED:', err.stack || err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
