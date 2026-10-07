/**
 * Australia — CRICOS "gap" sync: Australian universities registered on CRICOS that are missing from our DB, and DB
 * records whose institution is no longer registered on CRICOS (e.g. the 2026 merger of the University of Adelaide and
 * the University of South Australia into Adelaide University).
 *
 *   node scripts/dataSync/cricosAustraliaGapSync.js                     # DRY RUN: download + match + report, writes nothing
 *   node scripts/dataSync/cricosAustraliaGapSync.js --apply             # write the creates/deactivations of this run
 *   node scripts/dataSync/cricosAustraliaGapSync.js --revert <report.json>
 *
 * Options:
 *   --include-university-colleges     also create the TEQSA "University College" providers (default: report only)
 *   --deactivate-superseded-synced     accepted for compatibility; superseded records are now always deactivated in
 *                                      the same run that creates their successor (no duplicate institution is left)
 *   --refresh                          ignore the 7-day download cache
 *   --max-scrapedo <n>                 scrape.do budget for this run (default 3; used only when a site blocks direct requests)
 *
 * Complements cricosAustraliaSync.js, which updated the 37 matched records on 2026-10-03. Of those this script only
 * changes the superseded University of Adelaide record (isActive:false + dataSource, the previous dataSource kept under
 * dataSource.previous). REVERT ORDER: revert this script's apply report BEFORE running cricosAustraliaSync.js --revert
 * reports/cricos-australia-2026-10-03-12-45.json (that revert removes dataSource from all its records and never touches
 * isActive; if it runs first, this revert falls back to restoring only isActive of records whose dataSource is gone).
 *
 * Reports: reports/australia-gap-sync-<yyyymmddhhmmss of the runId>-<dry-run|apply>.json (never overwritten).
 *
 * Sources (all official):
 *  - CRICOS (Commonwealth Register of Institutions and Courses for Overseas Students), monthly export on data.gov.au:
 *    providers (name, type Government/Private, website, address), courses (level, duration, total tuition fee),
 *    locations. Only providers on CRICOS can enrol students on an Australian student visa.
 *  - TEQSA National Register (teqsa.gov.au) provider pages: provider category ("Australian University" vs
 *    "University College" …), registration status, CRICOS code, website, regulatory decisions ("Cancel CRICOS
 *    Registration <date>").
 *  - The institutions' own home pages (official website after redirects; CRICOS code in the footer when shown).
 *  - The universities' own international fee pages (FEE_PAGES): confirm the fee year CRICOS does not state, and where a
 *    university publishes a complete per-course annual fee list (UNE) its annual fee is used per course.
 *  - ECB AUD→USD reference rate via api.frankfurter.app (no fallback rate: if unavailable, USD fields stay null).
 *
 * Fee method: yearly fee per course = the university's published annual fee where its full list is available, else
 * CRICOS total course tuition ÷ course length in years (registered weeks rounded to the nearest half year, so a 2-year
 * Master's registered at 112 weeks counts as 2 years; a programme also registered as "(N Year Program)" or over a longer
 * duration at the same total uses that length). Providers that teach year-round (Bond: Bachelor's in ~2 calendar
 * years) only get a per-year figure from registrations that state the standard length; otherwise the numeric field is
 * left null and the text shows total course fees. Per level: typical range (10th–90th percentile, min–max under 10
 * programmes) and median; medicine / dentistry / veterinary / optometry / pilot programmes are kept out of both.
 *
 * Never deletes. Ranking fields (rank, rankingNum, rankingSource) and requirement fields are never touched on existing
 * records; new records get explicit nulls instead of the schema's invented defaults. Reports + cache go to
 * backend/reports/ (git-ignored).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const ARGS = process.argv.slice(2);
const APPLY = ARGS.includes('--apply');
const REFRESH = ARGS.includes('--refresh');
const WITH_COLLEGES = ARGS.includes('--include-university-colleges');
const LEGACY_SUPERSEDED_FLAG = ARGS.includes('--deactivate-superseded-synced'); // now the default behaviour
const argValue = (flag) => { const i = ARGS.indexOf(flag); return i !== -1 ? ARGS[i + 1] : undefined; };
const MAX_SCRAPEDO = Number(argValue('--max-scrapedo') ?? 3);
const SYNC_ID = 'cricosAustraliaGapSync';
const RUN_ID = `au-gap-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
const PROVIDER = 'CRICOS + TEQSA National Register';
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');
const CACHE_DIR = path.join(REPORT_DIR, '.cache', 'australia');
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const { SCRAPE_DO_TOKEN } = process.env;
const counters = { directRequests: 0, scrapeDoRequests: 0, cacheHits: 0 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CKAN_PACKAGE = 'https://data.gov.au/data/api/3/action/package_show?id=e5ae7059-bfa8-4fa4-a5c0-c13cf3520193';
const CKAN_DATASET_PAGE = 'https://data.gov.au/data/dataset/e5ae7059-bfa8-4fa4-a5c0-c13cf3520193';
const DATASET = 'https://data.gov.au/data/dataset/e5ae7059-bfa8-4fa4-a5c0-c13cf3520193/resource';
const CSV_FALLBACK = { // used only if the CKAN API does not list the resource (same URLs as cricosAustraliaSync.js)
  'CRICOS Institutions.csv': `${DATASET}/7f6941f3-5327-4db7-b556-5f16d77f63c1/download/cricos-institutions.csv`,
  'CRICOS Courses.csv': `${DATASET}/48cacf69-2082-415e-9595-f17d0c3a4af0/download/cricos-courses.csv`,
  'CRICOS Locations.csv': `${DATASET}/45d29535-1360-4486-8242-3850e61b5524/download/cricos-locations.csv`,
};
const TEQSA = 'https://www.teqsa.gov.au';
const FX_URL = 'https://api.frankfurter.app/latest?from=AUD&to=USD';
const CRICOS_RULE_QUOTE = 'Educational institutions can only enrol and deliver education services to students in Australia on a student visa if they are registered on CRICOS.';
const CREATE_CATEGORIES = ['Australian University', 'Australian University of Specialisation'];
const COLLEGE_CATEGORIES = ['University College'];
const COURSE_CAP = 150;
const OLD_SYNC_REVERT = 'node scripts/dataSync/cricosAustraliaSync.js --revert reports/cricos-australia-2026-10-03-12-45.json';
const STATE_NAME = { NSW: 'New South Wales', VIC: 'Victoria', QLD: 'Queensland', SA: 'South Australia', WA: 'Western Australia', TAS: 'Tasmania', ACT: 'the Australian Capital Territory', NT: 'the Northern Territory' };

// ---------------------------------------------------------------- curated registry (verified at run time) ----------
// Display name and city must appear in the CRICOS / TEQSA record (checked); TEQSA slug must show the same CRICOS code
// (checked). titleRe proves the website's home page belongs to the institution.
const KNOWN = {
  '00003G': { name: 'University of New England', city: 'Armidale', teqsa: 'university-new-england', titleRe: /New England|UNE/i },
  '00017B': { name: 'Bond University', city: 'Gold Coast', teqsa: 'bond-university-limited', titleRe: /Bond University/i }, // CRICOS location "Gold Coast campus" (Robina QLD)
  '01241G': { name: 'Southern Cross University', city: 'Lismore', teqsa: 'southern-cross-university', titleRe: /Southern Cross/i },
  '04249J': { name: 'Adelaide University', city: 'Adelaide', teqsa: 'adelaide-university', titleRe: /Adelaide University/i },
  '02731D': { name: 'Avondale University', city: 'Cooranbong', teqsa: 'avondale-university-limited-formerly-avondale-university-college-limited', titleRe: /Avondale/i },
  '02650E': { name: 'Australian University of Theology', city: 'Sydney', teqsa: 'australian-university-theology-limited', titleRe: /Theology|\bAUT\b|\bACT\b/i },
  '00312F': { name: 'SAE University College', city: 'Byron Bay', teqsa: 'sae-institute-pty-limited', titleRe: /SAE/i },
  '00958A': { name: 'Alphacrucis University College', city: 'Parramatta', teqsa: 'alphacrucis-university-college-ltd', titleRe: /Alphacrucis/i },
  '01328A': { name: 'ACAP University College', city: 'Sydney', teqsa: 'acap-university-college-pty-ltd-formerly-navitas-professional-institute-pty-ltd', titleRe: /ACAP/i }, // CRICOS location "ACAP Sydney Campus"
  '02664K': { name: 'Excelsia University College', city: 'Pennant Hills', teqsa: 'excelsia-university-college', titleRe: /Excelsia/i },
  '02948J': { name: 'Australian University College of Divinity', city: 'Norwest', teqsa: 'australian-university-college-divinity-ltd', titleRe: /Divinity|AUCD/i },
};
// DB records whose institution may no longer be on CRICOS: TEQSA page to check + the CRICOS provider that replaced it
const SUPERSEDED = {
  'University of South Australia': { teqsa: 'university-south-australia', successorCode: '04249J' },
  'University of Adelaide': { teqsa: 'university-adelaide', successorCode: '04249J' },
};

// ---------------------------------------------------------------- text helpers ----------
const squash = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const normName = (s) => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/\(.*?\)/g, ' ')
  .replace(/\bthe\b/g, ' ').replace(/\b(limited|ltd|pty|inc)\b/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const titleCase = (s) => squash(s).toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
const regDomain = (url) => {
  if (!url) return '';
  const host = String(url).trim().toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '');
  const parts = host.split('.').filter(Boolean);
  return parts.length >= 3 && /^(edu|com|org|gov|net|asn)$/.test(parts[parts.length - 2]) ? parts.slice(-3).join('.') : parts.slice(-2).join('.');
};
const origin = (url) => {
  const u = squash(url);
  if (!u) return null;
  try { return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).origin.toLowerCase(); } catch (_) { return null; }
};
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
const parseMoney = (v) => {
  const n = Number(String(v || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};
function textOf(page) {
  if (page._text === undefined) {
    const $ = cheerio.load(String(page.body).replace(/>/g, '> '));
    $('script,style,noscript,svg,iframe').remove();
    page._text = squash($.root().text());
    page._norm = norm(page._text);
  }
  return page._text;
}
const inPage = (page, quote) => { textOf(page); return Boolean(quote) && page._norm.includes(norm(quote)); };

// RFC 4180 CSV → objects keyed by header; each object keeps its verbatim source line in the non-enumerable _raw
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; } else if (ch === '"') quoted = false; else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; } else if (ch === '\n' || ch === '\r') {
      const end = i;
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); field = '';
      if (row.length > 1 || row[0]) { row.raw = text.slice(start, end); rows.push(row); }
      row = [];
      start = i + 1;
    } else field += ch;
  }
  if (field || row.length) { row.push(field); row.raw = text.slice(start); rows.push(row); }
  const header = rows.shift().map((h) => h.replace(/^﻿/, '').trim());
  return rows.map((r) => {
    const o = Object.fromEntries(header.map((h, i) => [h, (r[i] || '').trim()]));
    Object.defineProperty(o, '_raw', { value: r.raw, enumerable: false });
    return o;
  });
}

// ---------------------------------------------------------------- HTTP with cache + scrape.do fallback ----------
const isBlocked = (status, body) => status === 403 || status === 429 || status === 503
  || /<title>\s*(Just a moment|Attention Required)|Your request has been blocked/i.test(String(body).slice(0, 20000));

async function getPage(url, { scrapeDo = false, accept = 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8' } = {}) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, `${crypto.createHash('sha1').update(url).digest('hex')}.json`);
  if (!REFRESH && fs.existsSync(file)) {
    const cached = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS) { counters.cacheHits += 1; return cached; }
  }
  let status = 0;
  let body = '';
  let finalUrl = url;
  let via = 'direct';
  let lastError = '';
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': BROWSER_UA, Accept: accept, 'Accept-Language': 'en-AU,en;q=0.9' },
        redirect: 'follow',
        signal: AbortSignal.timeout(90000),
      });
      counters.directRequests += 1;
      status = res.status;
      finalUrl = res.url || url;
      body = await res.text();
      if (!isBlocked(status, body) || attempt === 3) break;
      await sleep(20000 * attempt); // WAF / rate limit: back off before retrying directly
    } catch (err) {
      lastError = err.cause?.code || err.message;
      if (attempt < 3) await sleep(3000 * attempt);
    }
  }
  if (isBlocked(status, body)) {
    if (!scrapeDo) throw new Error(`${url} blocks direct requests (HTTP ${status})`);
    if (!SCRAPE_DO_TOKEN) throw new Error('SCRAPE_DO_TOKEN missing in .env');
    if (counters.scrapeDoRequests >= MAX_SCRAPEDO) throw new Error(`scrape.do budget for this run (${MAX_SCRAPEDO}) reached before ${url}`);
    counters.scrapeDoRequests += 1;
    try {
      const res = await fetch(`https://api.scrape.do/?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(120000) });
      status = res.status;
      body = await res.text();
    } catch (err) {
      throw new Error(`scrape.do request failed for ${url} (${err.cause?.code || 'network error'})`); // never echo the API URL (token)
    }
    via = 'scrape.do';
    finalUrl = url;
    if (isBlocked(status, body)) throw new Error(`${url} still blocked via scrape.do (HTTP ${status})`);
  }
  if (status < 200 || status >= 300) throw new Error(`HTTP ${status || lastError || 'error'} for ${url}`);
  const entry = { url, finalUrl, via, status, fetchedAt: new Date().toISOString(), body };
  fs.writeFileSync(file, JSON.stringify(entry));
  return entry;
}

async function audToUsd() {
  let lastError = '';
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(FX_URL, { headers: { 'User-Agent': BROWSER_UA }, signal: AbortSignal.timeout(30000) });
      const j = await res.json();
      if (j?.rates?.USD) return { base: 'AUD', quote: 'USD', rate: j.rates.USD, date: j.date, source: 'ECB reference rate via api.frankfurter.app', url: FX_URL };
      lastError = 'no AUD→USD rate in response';
    } catch (err) { lastError = err.cause?.code || err.message; }
    await sleep(3000 * attempt);
  }
  throw new Error(`frankfurter.app: ${lastError}`);
}

// ---------------------------------------------------------------- CRICOS ----------
async function loadCricos() {
  let pkg = null;
  try { pkg = JSON.parse((await getPage(CKAN_PACKAGE, { accept: 'application/json' })).body).result; } catch (_) { /* fallback URLs */ }
  const resource = (name) => {
    const r = (pkg?.resources || []).find((x) => squash(x.name).toLowerCase() === name.toLowerCase());
    return { name, url: r?.url || CSV_FALLBACK[name], lastModified: r?.last_modified || r?.metadata_modified || null };
  };
  const files = { institutions: resource('CRICOS Institutions.csv'), courses: resource('CRICOS Courses.csv'), locations: resource('CRICOS Locations.csv') };
  const pages = {};
  for (const [k, f] of Object.entries(files)) {
    if (!f.url) throw new Error(`CRICOS resource "${f.name}" not found`);
    pages[k] = await getPage(f.url, { accept: 'text/csv,*/*;q=0.8' });
  }
  return {
    datasetModified: pkg?.metadata_modified || null,
    datasetPage: CKAN_DATASET_PAGE,
    files,
    institutions: parseCsv(pages.institutions.body),
    courses: parseCsv(pages.courses.body).filter((c) => (c.Expired || '').toLowerCase() !== 'yes'),
    locations: parseCsv(pages.locations.body),
  };
}

const levelOf = (c) => {
  const l = c['Course Level'] || '';
  if (/^Bachelor/i.test(l)) return "Bachelor's";
  if (/^Masters/i.test(l)) return "Master's";
  if (/^Doctoral/i.test(l)) return 'Doctoral';
  return null;
};
const LEVEL_SORT = { "Master's": 0, "Bachelor's": 1, Doctoral: 2 };

// Courses + degree levels from CRICOS: current (non-expired) Bachelor / Master's / Doctoral courses, Master's first
function coursesFromCricos(list) {
  const degree = list.filter((c) => levelOf(c) && squash(c['Course Name']));
  // within a level, names that start with the level word first ("Doctor of Medicine" / "Juris Doctor" are Master's level)
  const LEAD_RE = { "Master's": /^master\b/i, "Bachelor's": /^bachelor\b/i, Doctoral: /^doctor\b/i };
  const lead = (c) => (LEAD_RE[levelOf(c)].test(squash(c['Course Name'])) ? 0 : 1);
  degree.sort((a, b) => LEVEL_SORT[levelOf(a)] - LEVEL_SORT[levelOf(b)] || lead(a) - lead(b) || squash(a['Course Name']).localeCompare(squash(b['Course Name'])));
  const seen = new Set();
  const courses = [];
  for (const c of degree) {
    const name = squash(c['Course Name']);
    const k = norm(name);
    if (seen.has(k)) continue;
    seen.add(k);
    courses.push(name);
  }
  const levels = new Set(degree.map(levelOf));
  const degreeLevels = [];
  if (levels.has("Bachelor's")) degreeLevels.push("Bachelor's");
  if (levels.has("Master's")) degreeLevels.push("Master's");
  if (levels.has('Doctoral')) degreeLevels.push(degree.some((c) => levelOf(c) === 'Doctoral' && /Doctor of Philosophy/i.test(c['Course Name'])) ? 'PhD' : 'Doctorate');
  return { courses: courses.slice(0, COURSE_CAP), totalAvailable: courses.length, degreeCourseRecords: degree.length, degreeLevels };
}

// ---------------------------------------------------------------- fees ----------
// Specialist programmes priced far outside the normal range: listed, kept out of range and median
const EXCLUDE_FROM_RANGE = /\b(medicine|medical studies|surgery|mbbs|dental|dentistry|oral health|veterinary|optometry|pilot|flight|flying)\b/i;
const SANE_ANNUAL = [8000, 150000];
const round2 = (n) => Math.round(n * 100) / 100;
// CRICOS registers a study year as 52–56 weeks (breaks included; UNE: 2-year Master's = 112 weeks, 1-year Honours = 60,
// 3-year Bachelor's = 159), so the course length in years is the registered duration rounded to the nearest half year.
// Dividing by the raw weeks/52 understated those fees by 5–15%.
const yearsOf = (weeks) => Math.max(0.5, Math.round((weeks / 52) * 2) / 2);
// The same programme registered at several durations for the same total fee ("Bachelor of Commerce" over 108 weeks and
// "Bachelor of Commerce (3 Year Program)" over 156; "(Fast Track)" / "(138 Wk)" variants): markers stripped to pair them
const baseName = (name) => squash(String(name).replace(/\s*-?\s*\((?:\d+\s*Year Program|Fast Track|Accelerated|\d+\s*Wks?)\)/gi, ' '));
const statedYears = (name) => { const m = String(name).match(/\((\d+)\s*Year Program\)/i); return m ? Number(m[1]) : null; };

function feeRows(list) {
  const base = [];
  for (const c of list) {
    const name = squash(c['Course Name']);
    let level = null;
    if (/^Bachelor/i.test(c['Course Level']) && /^bachelor\b/i.test(name)) level = 'bachelor';
    else if (/^Masters Degree \((Coursework|Extended)\)/i.test(c['Course Level']) && /^master\b/i.test(name)) level = 'master';
    if (!level) continue;
    const fee = parseMoney(c['Tuition Fee']);
    const weeks = Number(c['Duration (Weeks)']) || 0;
    if (!fee || weeks < 20) continue;
    base.push({ c, level, name, fee, weeks });
  }
  const keyOf = (r) => `${r.level}|${norm(baseName(r.name))}|${r.fee}`;
  const groups = new Map();
  for (const r of base) {
    const g = groups.get(keyOf(r)) || { weeks: 0, weeksCode: null, years: null, yearsCode: null };
    if (r.weeks > g.weeks) { g.weeks = r.weeks; g.weeksCode = r.c['CRICOS Course Code']; }
    if (statedYears(r.name)) { g.years = statedYears(r.name); g.yearsCode = r.c['CRICOS Course Code']; }
    groups.set(keyOf(r), g);
  }
  return base.map(({ c, level, name, fee, weeks }) => {
    const code = c['CRICOS Course Code'];
    const g = groups.get(keyOf({ level, name, fee }));
    const years = g.years ?? yearsOf(g.weeks);
    let yearsBasis = `${weeks} weeks ≈ ${years} year(s)`;
    if (g.years) yearsBasis = `length stated in the CRICOS course name "(${g.years} Year Program)"${g.yearsCode !== code ? ` of registration ${g.yearsCode} (same programme, same total fee)` : ''}`;
    else if (g.weeks !== weeks) yearsBasis = `${g.weeks}-week registration ${g.weeksCode} of the same programme at the same total fee ≈ ${years} year(s)`;
    const annual = round2(fee / years);
    return {
      level, programme: name, cricosCourseCode: code, courseLevel: c['Course Level'], weeks, years, yearsBasis,
      tuitionFeeTotal: c['Tuition Fee'], total: fee, cricosAnnualAUD: annual, annualAUD: annual, annualSource: 'CRICOS',
      standardBasis: Boolean(g.years),
      excludedKind: EXCLUDE_FROM_RANGE.test(name) ? 'specialist' : (annual < SANE_ANNUAL[0] || annual > SANE_ANNUAL[1] ? 'outlier' : null),
      quote: c._raw, verified: Boolean(c._raw && c._raw.includes(code) && c._raw.includes(c['Tuition Fee'])),
    };
  }).map((r) => ({ ...r, excluded: r.excludedKind === 'specialist' ? 'specialist programme (medicine/dentistry/vet/optometry/pilot)' : (r.excludedKind === 'outlier' ? 'outside AUD 8,000–150,000 per year' : null) }));
}

function summariseFees(rows, level) {
  const seen = new Set();
  const used = [];
  const excluded = [];
  for (const r of rows) {
    if (r.level !== level || !r.verified) continue;
    const k = `${norm(baseName(r.programme))}|${Math.round(r.annualAUD)}`;
    if (seen.has(k)) continue;
    seen.add(k);
    (r.excluded ? excluded : used).push(r);
  }
  if (!used.length) return null;
  const vals = used.map((r) => r.annualAUD);
  return {
    programmes: used.length, min: Math.min(...vals), max: Math.max(...vals), median: median(vals),
    typicalLow: used.length >= 10 ? percentile(vals, 0.1) : Math.min(...vals),
    typicalHigh: used.length >= 10 ? percentile(vals, 0.9) : Math.max(...vals),
    rangeBasis: used.length >= 10 ? '10th–90th percentile of programme fees' : 'min–max of programme fees (fewer than 10 programmes)',
    fromOfficialList: used.filter((r) => r.annualSource !== 'CRICOS').length,
    excludedFromRange: excluded.filter((r) => r.excludedKind !== 'accelerated').map((r) => `${r.programme} (${r.excluded})`),
    specialistExcluded: excluded.some((r) => r.excludedKind === 'specialist'),
  };
}

// Total course tuition per level (for year-round providers whose registrations give no per-academic-year basis)
function summariseTotals(rows, level) {
  const byProg = new Map();
  for (const r of rows) if (r.level === level && r.verified && r.excludedKind !== 'specialist') byProg.set(`${norm(baseName(r.programme))}|${r.total}`, r.total);
  const vals = [...byProg.values()];
  if (!vals.length) return null;
  return {
    programmes: vals.length, median: median(vals),
    typicalLow: vals.length >= 10 ? percentile(vals, 0.1) : Math.min(...vals),
    typicalHigh: vals.length >= 10 ? percentile(vals, 0.9) : Math.max(...vals),
  };
}

// ---------------------------------------------------------------- official university fee pages ----------
// CRICOS states no fee year. Each university page below publishes international fees for a named year; a parser reads
// the figures with the verbatim text they came from, and they are compared with the CRICOS figure of the same course.
// A match confirms the fee year; a full per-course annual list (UNE) also replaces the CRICOS-derived annual fee.
const FEE_PAGES = {
  '00003G': [{ kind: 'une-table', url: 'https://www.une.edu.au/international/fees-and-scholarships/course-fees-2026' }],
  '00017B': [
    { kind: 'bond-api', url: 'https://bond.edu.au/api/program-fees/447/BN-10001', detailsUrl: 'https://bond.edu.au/api/program-details/447', courseCode: '063059D' },
    { kind: 'bond-api', url: 'https://bond.edu.au/api/program-fees/459/BN-13143', detailsUrl: 'https://bond.edu.au/api/program-details/459', courseCode: '108627A' },
  ],
  '01241G': [{ kind: 'scu-access', url: 'https://www.scu.edu.au/study/international-study/access26/' }],
  '02731D': [{ kind: 'avondale', url: 'https://www.avondale.edu.au/study/fees/', groups: { '057303C': 'Education, Nursing, Science/Maths & Business', '057294K': 'Theology, Arts (non-Music)' } }],
  '04249J': ['bachelor-of-commerce-accounting', 'bachelor-of-information-technology', 'master-of-information-technology-cyber-security']
    .map((slug) => ({ kind: 'adelaide-degree', url: `https://adelaide.edu.au/study/degrees/${slug}/` })),
};
const escRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FEE_PARSERS = {
  // UNE "Course fees - <year>": table "Courses available to International Students in <year>" | Intakes | CRICOS | Fee
  'une-table': (page) => {
    const $ = cheerio.load(page.body);
    const yearQuote = squash($('table th').first().text());
    const year = (yearQuote.match(/International Students in (20\d\d)/i) || [])[1] || null;
    const basisQuote = 'Annual course fees only cover the cost of tuition';
    const items = [];
    $('table tr').each((_, tr) => {
      const cells = $(tr).find('td').map((__, td) => squash($(td).text())).get();
      if (cells.length < 4) return;
      const courseCode = cells[2].toUpperCase();
      const amount = parseMoney(cells[3]);
      if (!/^[0-9]{6}[0-9A-Z]$/.test(courseCode) || !amount) return;
      const quote = cells.join(' ');
      items.push({ year, courseCode, basis: 'annual', amount, label: cells[0], quote, quoteVerified: inPage(page, quote) });
    });
    return { year, yearQuote, yearVerified: Boolean(year) && inPage(page, yearQuote), basisQuote, basisVerified: inPage(page, basisQuote), fullList: true, items };
  },
  // Bond programme fee API: [{ year, international: { semester, total } }]; programme name from program-details
  'bond-api': (page, check, details) => {
    const j = JSON.parse(page.body);
    let label = null;
    try { label = squash(JSON.parse(details.body).programs[0].name).replace(/\s+-\s+BN-\d+$/i, ''); } catch (_) { /* name unchecked */ }
    const items = (j.fees || []).filter((f) => f.international?.total).map((f) => {
      const quote = `"total":${f.international.total}`;
      const yearQuote = `"year":"${f.year}"`;
      return {
        year: String(f.year), courseCode: check.courseCode, basis: 'total', amount: Number(f.international.total), semester: f.international.semester ?? null,
        label, quote, quoteVerified: String(page.body).includes(quote), yearQuote, yearVerified: String(page.body).includes(yearQuote),
        ...(details ? { labelUrl: check.detailsUrl, labelQuote: label ? `"name":"${label}` : null, labelVerified: Boolean(label) && String(details.body).includes(`"name":"${label}`) } : {}),
      };
    });
    return { items };
  },
  // SCU Access26: "In 2026 annual international tuition fees for most courses** at Southern Cross University are set at an accessible $26,000"
  'scu-access': (page) => {
    const m = textOf(page).match(/In (20\d\d) annual international tuition fees for most courses\W{0,3} at Southern Cross University are set at an accessible \$([\d,]+)/i);
    return { items: m ? [{ year: m[1], courseCode: null, basis: 'typical-annual', amount: parseMoney(m[2]), quote: m[0], quoteVerified: inPage(page, m[0]), yearVerified: true }] : [] };
  },
  // Avondale "<year> International Fees" … "<field> Per Unit Cost* $x Per Semester - 4 units (24 credit points) $y"
  avondale: (page, check) => {
    const text = textOf(page);
    const ym = text.match(/(20\d\d) International Fees/);
    if (!ym) return { items: [] };
    // only the block under the "<year> International Fees" heading (the page also lists domestic fees)
    const block = text.slice(ym.index, ym.index + 1500);
    const items = [];
    for (const [courseCode, field] of Object.entries(check.groups)) {
      const m = block.match(new RegExp(`${escRe(field)} Per Unit Cost\\* \\$[\\d,]+ Per Semester - 4 units \\(24 credit points\\) \\$([\\d,]+)`));
      if (m) items.push({ year: ym[1], courseCode, basis: 'semester', amount: parseMoney(m[1]), label: field, quote: `${ym[0]} … ${m[0]}`, quoteVerified: inPage(page, ym[0]) && inPage(page, m[0]), yearQuote: ym[0], yearVerified: inPage(page, ym[0]) });
    }
    return { items };
  },
  // Adelaide University degree page: "CRICOS code 115684M" … "Indicative annual fees … $54,300"; the commencement year
  // the page shows is only in its markup (data-commencement-year="2027")
  'adelaide-degree': (page) => {
    const text = textOf(page);
    const code = text.match(/CRICOS code ([0-9]{6}[0-9A-Z])/);
    const fee = text.match(/Indicative annual fees\b[^$]{0,300}\$\s?([\d,]+)/);
    const ym = String(page.body).match(/data-commencement-year="(20\d\d)"/);
    if (!code || !fee) return { items: [] };
    return { items: [{
      year: ym ? ym[1] : null, courseCode: code[1], basis: 'annual', amount: parseMoney(fee[1]), quote: `${code[0]} … ${squash(fee[0])}`,
      quoteVerified: inPage(page, code[0]) && inPage(page, fee[0]), yearQuote: ym ? ym[0] : null, yearVerified: Boolean(ym), yearFrom: 'page markup (commencement year shown)',
    }] };
  },
};

async function officialFeeChecks(code, rows) {
  const out = { pages: [], errors: [], items: [] };
  for (const check of FEE_PAGES[code] || []) {
    try {
      const page = await getPage(check.url, { scrapeDo: true });
      let details = null;
      if (check.detailsUrl) { try { details = await getPage(check.detailsUrl, { scrapeDo: true }); } catch (_) { /* name check skipped */ } }
      const parsed = FEE_PARSERS[check.kind](page, check, details);
      const { items, ...meta } = parsed;
      out.pages.push({ url: check.url, finalUrl: page.finalUrl, kind: check.kind, ...meta, itemCount: items.length });
      items.forEach((i) => out.items.push({ url: check.url, kind: check.kind, ...i, yearVerified: i.yearVerified ?? meta.yearVerified ?? false, yearQuote: i.yearQuote ?? meta.yearQuote ?? null }));
    } catch (err) { out.errors.push({ url: check.url, error: err.message }); }
  }
  // compare each official figure with the CRICOS figure of the same course (before any replacement)
  const byCode = new Map(rows.map((r) => [r.cricosCourseCode, r]));
  const bachelorMedian = median(rows.filter((r) => r.level === 'bachelor' && !r.excludedKind).map((r) => r.cricosAnnualAUD));
  for (const i of out.items) {
    const r = i.courseCode ? byCode.get(i.courseCode) : null;
    let cricos = null;
    if (i.basis === 'total') cricos = r ? r.total : null;
    else if (i.basis === 'annual') cricos = r ? r.cricosAnnualAUD : null;
    else if (i.basis === 'semester') cricos = r ? r.cricosAnnualAUD / 2 : null;
    else if (i.basis === 'typical-annual') cricos = bachelorMedian;
    i.cricos = cricos == null ? null : round2(cricos);
    if (r) i.cricosProgramme = r.programme;
    if (i.label && r && i.kind === 'bond-api') i.labelOk = norm(i.label) === norm(r.programme);
    i.match = i.cricos != null && Math.abs(i.cricos - i.amount) < 1;
    i.gapPct = i.cricos ? Math.round(((i.amount - i.cricos) / i.cricos) * 1000) / 10 : null;
  }
  const usable = out.items.filter((i) => i.quoteVerified && i.yearVerified && i.year && i.cricos != null && i.labelOk !== false);
  const matchedYears = [...new Set(usable.filter((i) => i.match).map((i) => i.year))];
  out.confirmedYear = matchedYears.length === 1 ? matchedYears[0] : null;
  out.agreement = matchedYears.length ? { year: matchedYears.join('/'), compared: usable.filter((i) => matchedYears.includes(i.year)).length, equal: usable.filter((i) => i.match).length } : null;
  const other = usable.filter((i) => !matchedYears.includes(i.year));
  out.otherYears = [...new Set(other.map((i) => i.year))].map((year) => {
    const gaps = other.filter((i) => i.year === year).map((i) => i.gapPct);
    return { year, compared: gaps.length, medianGapPct: median(gaps) };
  });
  // a complete per-course annual list for a stated year: its fee replaces the CRICOS-derived one (one fee per code only)
  const full = out.pages.find((p) => p.fullList && p.yearVerified && p.basisVerified);
  out.officialAnnual = new Map();
  if (full) {
    const amounts = new Map();
    for (const i of out.items.filter((x) => x.url === full.url && x.quoteVerified)) {
      if (!amounts.has(i.courseCode)) amounts.set(i.courseCode, []);
      amounts.get(i.courseCode).push(i);
    }
    for (const [cc, list] of amounts) if (new Set(list.map((i) => i.amount)).size === 1) out.officialAnnual.set(cc, list[0]);
    out.fullList = { url: full.url, year: full.year, yearQuote: full.yearQuote, basisQuote: full.basisQuote, codes: out.officialAnnual.size };
  }
  return out;
}

// ---------------------------------------------------------------- TEQSA ----------
function parseTeqsa(page) {
  const $ = cheerio.load(page.body);
  const f = {};
  $('.fw-bold').each((_, el) => {
    const label = squash($(el).text());
    const det = $(el).nextAll('.provider-detail').first();
    if (!label || !det.length || f[label] !== undefined) return;
    f[label] = { text: squash(det.text()), href: det.find('a[href]').first().attr('href') || null };
  });
  const decisions = $('a[href*="/condition-decision/"]').map((_, a) => squash($(a).text())).get();
  return {
    url: page.url, finalUrl: page.finalUrl, via: page.via,
    providerName: f['Provider name']?.text || null, tradingName: f['Provider trading name']?.text || null,
    providerId: f['Provider ID']?.text || null, status: f.Status?.text || null, category: f.Category?.text || null,
    cricosCode: f['CRICOS Registration Code']?.text || null, website: f.Website?.href || null,
    headOffice: f['Head Office Address']?.text || null, decisions,
    cricosCancelled: decisions.find((d) => /^Cancel CRICOS Registration/i.test(d)) || null,
    page,
  };
}

async function teqsaProvider(slug, { expectCricos = null, searchName = null } = {}) {
  const tried = [];
  const tryUrl = async (url) => {
    tried.push(url);
    const t = parseTeqsa(await getPage(url, { scrapeDo: true }));
    await sleep(1500); // be gentle with the register (it rate-limits bursts)
    return t;
  };
  let t = null;
  if (slug) { try { t = await tryUrl(`${TEQSA}/provider/${slug}`); } catch (err) { t = { error: err.message }; } }
  if ((!t || t.error || (expectCricos && t.cricosCode !== expectCricos)) && searchName) {
    // slug changed: look the provider up in the register search and keep the page that shows the CRICOS code
    try {
      const s = await getPage(`${TEQSA}/national-register/search?search_api_fulltext=${encodeURIComponent(searchName)}`, { scrapeDo: true });
      const $ = cheerio.load(s.body);
      const hrefs = [...new Set($('a[href^="/provider/"]').map((_, a) => $(a).attr('href')).get())].slice(0, 3);
      for (const h of hrefs) {
        const cand = await tryUrl(`${TEQSA}${h}`);
        if (!expectCricos || cand.cricosCode === expectCricos) { t = cand; break; }
      }
    } catch (err) { if (!t) t = { error: err.message }; }
  }
  if (t) t.tried = tried;
  return t;
}

const teqsaEvidence = (t) => {
  if (!t || t.error) return [{ what: 'TEQSA National Register', url: t?.tried?.[0] || null, quote: null, verified: false, error: t?.error || 'not fetched' }];
  const ev = [];
  const q = (what, quote) => ev.push({ what, url: t.finalUrl || t.url, quote, verified: inPage(t.page, quote) });
  if (t.providerName) q('TEQSA provider name', `Provider name ${t.providerName}`);
  if (t.category) q('TEQSA provider category', `Category ${t.category}`);
  if (t.status) q('TEQSA registration status', `Status ${t.status}`);
  if (t.cricosCode) q('CRICOS code on the TEQSA record', `CRICOS Registration Code ${t.cricosCode}`);
  if (t.cricosCancelled) q('TEQSA regulatory decision', t.cricosCancelled);
  return ev;
};

// ---------------------------------------------------------------- website check ----------
async function checkWebsite(listedUrl, titleRe, cricosCode) {
  const listed = origin(listedUrl);
  const out = { listed, proposed: listed };
  if (!listed) return out;
  try {
    const home = await getPage(`${listed}/`, { scrapeDo: true });
    const $ = cheerio.load(home.body);
    out.finalUrl = home.finalUrl;
    out.title = squash($('title').first().text());
    out.titleMatches = titleRe ? titleRe.test(out.title) : null;
    const m = textOf(home).match(new RegExp(`CRICOS[^.]{0,40}?${cricosCode}`, 'i'));
    out.cricosQuote = m ? m[0] : null;
    out.page = home;
    // the confirmed address after redirects (picks up https and a new domain, e.g. unisa.edu.au → adelaide.edu.au)
    if (out.titleMatches && origin(home.finalUrl)) out.proposed = origin(home.finalUrl);
    if (titleRe && !out.titleMatches) out.check = `home page title "${out.title}" does not name the institution; listed website kept`;
  } catch (err) {
    out.check = `not reachable directly (${err.message}); register-listed website kept`;
  }
  return out;
}
const websiteEvidence = (w, what = 'official website (home page after redirects)') => (w?.title ? [{
  what, url: w.listed, quote: `${w.finalUrl} — ${w.title}`, verified: Boolean(w.titleMatches),
  ...(w.cricosQuote ? { footerQuote: w.cricosQuote, footerQuoteVerified: inPage(w.page, w.cricosQuote) } : {}),
}] : [{ what, url: w?.listed || null, quote: null, verified: false, note: w?.check || null }]);

const METHOD_NOTES = [
  'Universe: CRICOS providers whose institution or trading name contains "University" and that have at least one current Bachelor / Master\'s / Doctoral course, not matched to one of our Australian records (by stored CRICOS code, name or website domain).',
  'University status comes from the TEQSA National Register provider category: "Australian University" → created; "University College" → created only with --include-university-colleges; secondary CRICOS registrations of a university we already hold are not created.',
  'A DB record is treated as no longer existing only when its institution is absent from the current CRICOS export AND an official source corroborates it (TEQSA decision "Cancel CRICOS Registration …" and/or its website now redirecting to the successor). Such records are deactivated (isActive:false, never deleted) in the same run that creates their successor, including records synced by cricosAustraliaSync.js (their previous dataSource is kept under dataSource.previous); --apply refuses to create a successor while a record it supersedes would stay active.',
  'Fees: yearly fee per course = the university\'s own published annual fee where it publishes a complete per-course list for a stated year (UNE), else CRICOS "Tuition Fee" (total course tuition) ÷ course length in years = "Duration (Weeks)" rounded to the nearest half year (CRICOS counts a study year as 52–56 weeks incl. breaks; a programme also registered as "(N Year Program)" or over a longer duration at the same total uses that length). Bachelor\'s = Bachelor / Bachelor Honours courses named "Bachelor …"; Master\'s = Masters (Coursework / Extended) courses named "Master …". Medicine, dentistry, veterinary, optometry and pilot programmes are excluded from range and median.',
  'Year-round (accelerated) providers — most Bachelor\'s registered under 130 weeks, e.g. Bond — get a per-academic-year figure only from registrations that state the standard length ("(3 Year Program)": total ÷ 3); their other registrations are left out of the numeric fields (null when none is left) and the text shows total course tuition instead.',
  'Fee year: CRICOS does not state one. It is named only when the university\'s own page for that year shows the same fee for the same course (FEE_PAGES; verbatim quote in fees.<code>.officialCheck); otherwise the text says the fee year is not stated (may be the current or next year).',
  'Range shown = 10th–90th percentile of programme fees (min–max when fewer than 10 programmes); tuitionFeeUSD / graduateTuitionUSD = Bachelor\'s / Master\'s median × ECB AUD→USD rate (no fallback rate).',
  `Courses = current CRICOS Bachelor / Master's / Doctoral course names, deduplicated, Master's first, capped at ${COURSE_CAP}.`,
];

// ---------------------------------------------------------------- revert ----------
async function revert(reportFile) {
  const report = JSON.parse(fs.readFileSync(path.resolve(reportFile), 'utf8'));
  if (report.meta?.script !== SYNC_ID) throw new Error(`${reportFile} is not a ${SYNC_ID} report`);
  if (report.meta?.mode !== 'apply') throw new Error('this report is from a dry run (nothing was written); nothing to revert');
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('universities');
  let restored = 0;
  const isActiveOnly = [];
  const skipped = [];
  for (const c of report.changes || []) {
    if (!c.willApply) continue; // tried even when not marked applied (the runId filter only matches records this run wrote)
    const _id = new mongoose.Types.ObjectId(c.id);
    const set = {};
    const unset = {};
    for (const [k, v] of Object.entries(c.diff)) {
      if (v.from === undefined || v.from === null) unset[k] = '';
      else set[k] = k === 'dataSource' && typeof v.from.syncedAt === 'string' ? { ...v.from, syncedAt: new Date(v.from.syncedAt) } : v.from; // JSON turned the Date into a string
    }
    set.updatedAt = new Date();
    const update = { $set: set };
    if (Object.keys(unset).length) update.$unset = unset;
    let r = await col.updateOne({ _id, 'dataSource.runId': report.meta.runId }, update);
    if (!r.matchedCount && c.applied && c.diff.dataSource?.from?.provider === 'CRICOS') {
      // cricosAustraliaSync.js's revert ran first and removed dataSource: restore isActive only, leave dataSource absent
      const from = c.diff.isActive?.from;
      r = await col.updateOne(
        { _id, isActive: false, dataSource: { $exists: false } },
        from === undefined || from === null ? { $unset: { isActive: '' }, $set: { updatedAt: new Date() } } : { $set: { isActive: from, updatedAt: new Date() } },
      );
      if (r.modifiedCount) isActiveOnly.push(`${c.id} ${c.name}`);
    }
    if (r.modifiedCount) restored += 1;
    else if (c.applied) skipped.push(`${c.id} ${c.name} (no longer carries runId ${report.meta.runId}; changed since — restore by hand from this report's diff)`);
  }
  // Records created by this sync are hidden (isActive:false), never deleted — and only if this sync created them
  let hidden = 0;
  for (const c of report.creates || []) {
    if (!c.id || !c.willApply) continue; // tried even when not marked applied (a crash between insert and report write)
    const r = await col.updateOne(
      { _id: new mongoose.Types.ObjectId(c.id), 'dataSource.createdBySync': SYNC_ID, 'dataSource.runId': report.meta.runId },
      { $set: { isActive: false, updatedAt: new Date() } },
    );
    hidden += r.modifiedCount;
    if (!r.modifiedCount && c.applied) skipped.push(`${c.id} ${c.name} (created record not found with this runId, or already hidden)`);
  }
  console.log(`REVERTED: ${restored} deactivated records restored, ${hidden} created records hidden (isActive:false) from ${reportFile}`);
  isActiveOnly.forEach((s) => console.log(`  isActive only (its dataSource had already been removed by cricosAustraliaSync.js's revert): ${s}`));
  skipped.forEach((s) => console.log(`  SKIPPED: ${s}`));
  await mongoose.disconnect();
}

// ---------------------------------------------------------------- main ----------
(async () => {
  const revertIdx = ARGS.indexOf('--revert');
  if (revertIdx !== -1) return revert(ARGS[revertIdx + 1]);
  console.log(`CRICOS gap sync → missing / superseded Australian universities (${APPLY ? 'APPLY' : 'DRY RUN, nothing is written'})`);
  if (LEGACY_SUPERSEDED_FLAG) console.log('  note: --deactivate-superseded-synced is now the default (superseded records are always deactivated with their successor)');
  const syncedAt = new Date();
  const uncertainties = [];

  let fx = null;
  try { fx = await audToUsd(); } catch (err) { uncertainties.push(`FX rate unavailable (${err.message}); USD fields left null`); }

  // 1) CRICOS
  const cricos = await loadCricos();
  const coursesByProvider = new Map();
  for (const c of cricos.courses) {
    const code = c['CRICOS Provider Code'];
    if (!coursesByProvider.has(code)) coursesByProvider.set(code, []);
    coursesByProvider.get(code).push(c);
  }
  const locationsByProvider = new Map();
  for (const l of cricos.locations) {
    const code = l['CRICOS Provider Code'];
    if (!locationsByProvider.has(code)) locationsByProvider.set(code, []);
    locationsByProvider.get(code).push(l);
  }
  const instByCode = new Map(cricos.institutions.map((i) => [i['CRICOS Provider Code'], i]));
  const degreeCount = (code) => (coursesByProvider.get(code) || []).filter(levelOf).length;
  console.log(`  CRICOS (dataset modified ${cricos.datasetModified || 'n/a'}): ${cricos.institutions.length} providers, ${cricos.courses.length} current courses; AUD→USD ${fx ? `${fx.rate} (${fx.date})` : 'n/a'}`);

  // 2) DB (read only)
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const au = await db.collection('countries').findOne({ name: 'Australia' });
  if (!au) throw new Error('Country "Australia" not found');
  const ours = await db.collection('universities').find({ country: au._id }).toArray();
  const active = ours.filter((u) => u.isActive !== false);
  const isOldSynced = (u) => u.dataSource?.provider === 'CRICOS' && u.dataSource?.providerCode && !u.dataSource?.runId;
  console.log(`  our Australia records: ${ours.length} (${active.length} active, ${ours.filter(isOldSynced).length} synced by cricosAustraliaSync.js)`);

  // Which CRICOS provider each DB record is (a domain match counts only for a provider with degree courses: a
  // secondary college on a sub-domain such as usc.adelaide.edu.au is not the university)
  const providerOfDb = (u) => {
    const code = u.dataSource?.providerCode;
    const named = (i) => [i['Institution Name'], i['Trading Name']].some((n) => n && normName(n) === normName(u.name));
    if (code && instByCode.has(code) && degreeCount(code) && (named(instByCode.get(code)) || regDomain(instByCode.get(code).Website) === regDomain(u.website))) return { inst: instByCode.get(code), how: 'stored CRICOS code' };
    const byName = cricos.institutions.filter((i) => named(i) && degreeCount(i['CRICOS Provider Code']));
    const byDomain = cricos.institutions.filter((i) => u.website && regDomain(i.Website) === regDomain(u.website) && degreeCount(i['CRICOS Provider Code']));
    const hits = [...new Set([...byName, ...byDomain])].sort((a, b) => degreeCount(b['CRICOS Provider Code']) - degreeCount(a['CRICOS Provider Code']));
    return hits.length ? { inst: hits[0], how: byName.includes(hits[0]) ? 'name' : 'website domain', also: hits.slice(1).map((i) => i['CRICOS Provider Code']) } : null;
  };
  const dbMatch = new Map(ours.map((u) => [String(u._id), providerOfDb(u)]));
  const matchedCodes = new Set([...dbMatch.values()].filter(Boolean).map((m) => m.inst['CRICOS Provider Code']));

  // 3) CRICOS universities not in our DB
  const uniLike = cricos.institutions.filter((i) => /universit/i.test(`${i['Institution Name']} ${i['Trading Name']}`) && degreeCount(i['CRICOS Provider Code']));
  const candidates = [];
  const secondary = [];
  for (const inst of uniLike) {
    const code = inst['CRICOS Provider Code'];
    if (matchedCodes.has(code)) continue;
    const dbSame = ours.find((u) => [inst['Institution Name'], inst['Trading Name']].some((n) => n && normName(n) === normName(u.name))
      || (inst.Website && u.website && regDomain(inst.Website) === regDomain(u.website)));
    if (dbSame) {
      const main = dbMatch.get(String(dbSame._id));
      secondary.push({
        cricosCode: code, cricosName: inst['Institution Name'], tradingName: inst['Trading Name'] || null, website: inst.Website || null,
        degreeCourses: degreeCount(code), sameAs: dbSame.name, ourRecordProviderCode: main?.inst['CRICOS Provider Code'] || dbSame.dataSource?.providerCode || null,
        locations: (locationsByProvider.get(code) || []).map((l) => `${l['Location Name']} (${l.City} ${l.State})`),
        decision: 'not created: second CRICOS registration of a university we already hold',
        evidence: [{ what: 'CRICOS institution row', url: cricos.files.institutions.url, quote: inst._raw, verified: true }],
      });
      continue;
    }
    candidates.push(inst);
  }

  // 4) Verify candidates on TEQSA + website; build proposals
  const creates = [];
  const notCreated = [];
  const institutions = [];
  const valuesLeftNull = [];
  const fees = {};
  let cricosRule = null;
  for (const inst of candidates) {
    const code = inst['CRICOS Provider Code'];
    const known = KNOWN[code] || {};
    const list = coursesByProvider.get(code) || [];
    const t = await teqsaProvider(known.teqsa, { expectCricos: code, searchName: known.name || inst['Trading Name'] || inst['Institution Name'] });
    if (t && !t.error && !cricosRule && inPage(t.page, CRICOS_RULE_QUOTE)) cricosRule = { url: t.finalUrl || t.url, quote: CRICOS_RULE_QUOTE, verified: true };
    const row = { cricosCode: code, cricosName: inst['Institution Name'], tradingName: inst['Trading Name'] || null, teqsaCategory: t?.category || null, teqsaStatus: t?.status || null, decision: null };
    institutions.push(row);
    const problems = [];
    if (!t || t.error) problems.push(`TEQSA record not available (${t?.error || 'no slug'})`);
    else {
      if (t.cricosCode !== code) problems.push(`TEQSA record shows CRICOS code ${t.cricosCode || 'none'}, expected ${code}`);
      if (!/^Registered/i.test(t.status || '')) problems.push(`TEQSA status "${t.status}"`);
    }
    const name = known.name || squash(inst['Trading Name'] || inst['Institution Name']).replace(/\s*\(.*?\)\s*$/, '').replace(/\s+(Pty )?(Ltd|Limited)$/i, '');
    const nameSources = [inst['Institution Name'], inst['Trading Name'], t?.providerName, t?.tradingName].filter(Boolean);
    const nameOk = nameSources.some((n) => norm(n).includes(norm(name)));
    if (!nameOk) problems.push(`display name "${name}" not found in CRICOS/TEQSA names`);
    const locs = locationsByProvider.get(code) || [];
    const cityRaw = known.city || titleCase(inst['Postal Address City']);
    const cityHit = [inst['Postal Address City'], ...locs.flatMap((l) => [l.City, l['Location Name']])].find((s) => s && norm(s).includes(norm(cityRaw)));
    if (!cityHit) problems.push(`city "${cityRaw}" not found in the CRICOS address/locations`);
    row.name = name;
    row.city = cityRaw;

    const category = t?.category || null;
    const isUniversity = CREATE_CATEGORIES.includes(category);
    const isCollege = COLLEGE_CATEGORIES.includes(category);
    if (problems.length) {
      row.decision = 'not created (verification failed)';
      row.reason = problems.join('; ');
      uncertainties.push(`${inst['Institution Name']} (${code}): not created — ${row.reason}`);
      notCreated.push({ ...row, evidence: teqsaEvidence(t) });
      continue;
    }
    if (!isUniversity && !isCollege) {
      row.decision = 'not created';
      row.reason = `TEQSA category "${category}" is not a university`;
      notCreated.push({ ...row, evidence: teqsaEvidence(t) });
      continue;
    }

    // Website: CRICOS-listed, else TEQSA-listed; confirmed on the home page
    const listedSite = inst.Website || t.website;
    const w = await checkWebsite(listedSite, known.titleRe, code);
    const website = w.proposed;
    if (w.check) uncertainties.push(`${name}: website — ${w.check}`);
    let teqsaSiteRedirect = null;
    if (website && t.website && regDomain(t.website) !== regDomain(website)) {
      // e.g. TEQSA still lists a former domain that now redirects to the confirmed one
      try { const p = await getPage(`${origin(t.website)}/`); teqsaSiteRedirect = { from: t.website, finalUrl: p.finalUrl, title: squash(cheerio.load(p.body)('title').first().text()) }; } catch (err) { teqsaSiteRedirect = { from: t.website, error: err.message }; }
      if (regDomain(teqsaSiteRedirect.finalUrl) !== regDomain(website)) uncertainties.push(`${name}: website ${website} differs from the TEQSA-listed ${t.website}${teqsaSiteRedirect.error ? ` (${teqsaSiteRedirect.error})` : ` (which opens ${teqsaSiteRedirect.finalUrl})`}`);
    }

    // Courses + fees
    const cc = coursesFromCricos(list);
    const rows = feeRows(list);
    // the university's own fee pages: fee year + (complete list only) the published annual fee per course
    const feeCheck = FEE_PAGES[code] ? await officialFeeChecks(code, rows) : null;
    feeCheck?.errors.forEach((e) => uncertainties.push(`${name}: fee page ${e.url} not read (${e.error}); fee year not confirmed from it`));
    for (const r of rows) {
      const off = feeCheck?.officialAnnual.get(r.cricosCourseCode);
      if (!off) continue;
      Object.assign(r, {
        annualAUD: off.amount, annualSource: `official ${feeCheck.fullList.year} fee list`, standardBasis: true,
        official: { url: off.url, year: off.year, quote: off.quote, verified: off.quoteVerified, agreesWithCricos: off.match },
      });
      if (r.excludedKind !== 'specialist') {
        r.excludedKind = r.annualAUD < SANE_ANNUAL[0] || r.annualAUD > SANE_ANNUAL[1] ? 'outlier' : null;
        r.excluded = r.excludedKind ? 'outside AUD 8,000–150,000 per year' : null;
      }
    }
    // Year-round (trimester) providers register a 3-year degree over ~2 calendar years: the per-year figure of such a
    // registration is a per-calendar-year fee, not comparable with an academic-year fee, so only registrations that
    // state the standard length ("(3 Year Program)") or have a published annual fee feed the numeric fields
    const passWeeks = median(rows.filter((r) => r.level === 'bachelor' && /^Bachelor Degree$/i.test(r.courseLevel) && !r.excludedKind).map((r) => r.weeks));
    const accelerated = Boolean(passWeeks && passWeeks < 130);
    if (accelerated) {
      for (const r of rows) {
        if (r.excludedKind || r.standardBasis) continue;
        r.excludedKind = 'accelerated';
        r.excluded = `accelerated year-round registration (${r.weeks} weeks); CRICOS gives no academic-year length for it`;
      }
    }
    const bachelor = summariseFees(rows, 'bachelor');
    const master = summariseFees(rows, 'master');
    const totals = accelerated ? { bachelor: summariseTotals(rows, 'bachelor'), master: summariseTotals(rows, 'master') } : null;
    if (accelerated) uncertainties.push(`${name}: most Bachelor's courses are registered at ${passWeeks} weeks (accelerated, year-round study). Per-year fees use only the ${bachelor ? bachelor.programmes : 0} Bachelor's programme(s) that CRICOS also registers with their standard length ("(N Year Program)": total ÷ N); ${master ? '' : "no Master's registration states a standard length, so graduateTuitionUSD is left null (note: the shortlist then falls back to tuitionFeeUSD for Master's targets) and "}the text shows total course tuition (fees.${code}.rows)`);

    // fee year (CRICOS states none)
    const dsYear = Number((cricos.datasetModified || '').slice(0, 4)) || null;
    const feeYear = feeCheck?.confirmedYear || null;
    const feePagesUsed = feeCheck ? [...new Set(feeCheck.items.filter((i) => i.quoteVerified && i.yearVerified && i.cricos != null).map((i) => i.url))] : [];
    const fromList = (bachelor?.fromOfficialList || 0) + (master?.fromOfficialList || 0);
    const used = (bachelor?.programmes || 0) + (master?.programmes || 0);
    let yearText = dsYear ? `fee year not stated by CRICOS (may be ${dsYear} or ${dsYear + 1})` : 'fee year not stated by CRICOS';
    if (feeYear) yearText = fromList ? `${feeYear} fees` : `${feeYear} fees (match the university's published ${feeYear} international fees)`;
    const later = (feeCheck?.otherYears || []).filter((o) => o.medianGapPct != null && Math.abs(o.medianGapPct) >= 0.5);
    if (later.length) yearText += `; the university's published ${later.map((o) => o.year).join('/')} fees are about ${later.map((o) => `${Math.abs(Math.round(o.medianGapPct))}% ${o.medianGapPct > 0 ? 'higher' : 'lower'}`).join(' / ')}`;
    if (!feeYear) uncertainties.push(`${name}: fee year not confirmed by an official university page (${feeCheck ? `${feeCheck.items.length} figures read, ${later.length ? `its ${later.map((o) => o.year).join('/')} figures differ by a median ${later.map((o) => `${o.medianGapPct}%`).join('/')}` : 'none matched a CRICOS figure'}` : 'no fee page configured'}); text says "${yearText}"`);

    const proposed = {};
    if (cc.courses.length) { proposed.courses = cc.courses; proposed.degreeLevels = cc.degreeLevels; }
    if (fx && master) proposed.graduateTuitionUSD = Math.round(master.median * fx.rate);
    if (fx && bachelor) proposed.tuitionFeeUSD = Math.round(bachelor.median * fx.rate);
    const range = (s) => `AUD ${money(s.typicalLow)}${Math.round(s.typicalHigh) !== Math.round(s.typicalLow) ? `–${money(s.typicalHigh)}` : ''}`;
    const asAt = (cricos.datasetModified || '').slice(0, 10) || 'the dataset date';
    const usd = fx && (master || bachelor) ? `; median ≈ ${[master && `Master's US$${money(proposed.graduateTuitionUSD)}`, bachelor && `Bachelor's US$${money(proposed.tuitionFeeUSD)}`].filter(Boolean).join(', ')}` : '';
    const excl = master?.specialistExcluded || bachelor?.specialistExcluded ? '; excl. medicine/dentistry/vet/pilot' : '';
    const source = `official CRICOS register (data.gov.au, as at ${asAt})${feePagesUsed.length ? ` and ${name}'s fee pages` : ''}`;
    const basisText = fromList
      ? `annual fees from the university's published ${feeCheck.fullList.year} fee list for ${fromList} of ${used} programmes, the rest approx. = CRICOS total course tuition ÷ course length`
      : 'approx. = CRICOS total course tuition ÷ course length in years';
    if (accelerated && (bachelor || totals.bachelor || totals.master)) {
      const perYear = bachelor ? `Bachelor's ${range(bachelor)} per academic year (programmes CRICOS also registers as "(N Year Program)": total course tuition ÷ N)` : null;
      const tot = [totals.master && `Master's ${range(totals.master)}`, totals.bachelor && `Bachelor's ${range(totals.bachelor)}`].filter(Boolean).join(', ');
      proposed.tuition = `${[perYear, tot && `total course tuition ${tot}`].filter(Boolean).join(' · ')} (international students; year-round accelerated study — most Bachelor's are registered at ${passWeeks} weeks, so no per-year figure is given for courses without a standard length; ${yearText}${usd}${excl}) — ${source}`;
    } else if (master || bachelor) {
      const parts = [master && `Master's ${range(master)}`, bachelor && `Bachelor's ${range(bachelor)}`].filter(Boolean);
      const typical = [master, bachelor].some((s) => s && s.programmes >= 10) ? 'typical range, ' : '';
      proposed.tuition = `${parts.join(' · ')} per year (international students; ${typical}${basisText}; ${yearText}${usd}${excl}) — ${source}`;
    }
    const compactCheck = feeCheck ? {
      confirmedYear: feeCheck.confirmedYear, agreement: feeCheck.agreement, otherYears: feeCheck.otherYears, fullList: feeCheck.fullList || null,
      pages: feeCheck.pages, errors: feeCheck.errors,
      items: feeCheck.items.map(({ url, year, courseCode, cricosProgramme, label, basis, amount, cricos, match, gapPct, quote, quoteVerified, yearQuote, yearVerified, yearFrom, labelOk }) => ({ url, year, courseCode, cricosProgramme, label, basis, amount, cricos, match, gapPct, quote, quoteVerified, yearQuote, yearVerified, ...(yearFrom ? { yearFrom } : {}), ...(labelOk !== undefined ? { labelOk } : {}) })),
    } : null;
    fees[code] = { name, bachelor, master, totals, bachelorMedianWeeks: passWeeks, accelerated, feeYear, feeYearText: yearText, officialCheck: compactCheck, rows };

    const type = /^government$/i.test(inst['Institution Type']) ? 'PUBLIC' : (/^private$/i.test(inst['Institution Type']) ? 'PRIVATE' : null);
    const state = squash(inst['Postal Address State']).toUpperCase();
    const kindText = isUniversity ? 'an Australian university' : 'an Australian university college';
    const description = `${name} is ${kindText} based in ${cityRaw}${STATE_NAME[state] ? `, ${STATE_NAME[state]}` : ''}. It is on the TEQSA National Register (category: ${category}) and registered on CRICOS (provider code ${code}), so it can enrol international students on an Australian student visa.`;
    const fields = ['name', 'city', 'type', 'description', ...(website ? ['website'] : []), ...Object.keys(proposed)];
    const urls = [cricos.datasetPage, cricos.files.institutions.url, cricos.files.courses.url, ...(known.city && cityHit !== inst['Postal Address City'] ? [cricos.files.locations.url] : []), t.finalUrl || t.url, ...(website ? [website] : []), ...(proposed.tuition ? feePagesUsed : [])];
    const feeBasis = [
      fromList ? `annual fee per course from the university's published ${feeCheck.fullList.year} fee list (${feeCheck.fullList.url}) where listed, else` : 'per-year fee per course =',
      'CRICOS total course tuition ÷ course length in years (registered weeks rounded to the nearest half year, or the length stated in a "(N Year Program)" registration of the same programme)',
      accelerated ? '; year-round provider: only registrations with a stated standard length or a published annual fee count' : '',
      '; median per level',
    ].filter(Boolean).join(' ').replace(/\s+;/g, ';');
    const _id = new mongoose.Types.ObjectId();
    const doc = {
      _id, name, country: au._id, city: cityRaw, website: website || null,
      logo: website ? `https://www.google.com/s2/favicons?domain=${website.replace(/^https?:\/\//, '')}&sz=128` : null,
      type, description, eligibility: null, categoryTags: [],
      tuition: proposed.tuition ?? null, tuitionFeeUSD: proposed.tuitionFeeUSD ?? null, graduateTuitionUSD: proposed.graduateTuitionUSD ?? null,
      // schema defaults would invent these — set explicitly to "unknown"
      minGpaPercent: null, minIeltsScore: null, minGreScore: null, greRequired: null, acceptanceRate: null,
      minScore: null, ieltsScore: null, greExam: null, workExp: null, scholarshipAvailable: null, rankingNum: null,
      courses: proposed.courses || [], degreeLevels: proposed.degreeLevels || [],
      isActive: true,
      dataSource: {
        provider: proposed.tuition && feePagesUsed.length ? `${PROVIDER} + university fee pages` : PROVIDER,
        urls: [...new Set(urls.filter(Boolean))], syncedAt, fields, runId: RUN_ID, createdBySync: SYNC_ID,
        cricosProviderCode: code, teqsaProviderId: t.providerId, teqsaCategory: category, cricosDatasetModified: cricos.datasetModified,
        derivedFields: { logo: 'favicon service pointed at the official website domain' },
        ...(proposed.tuition ? {
          fx, feeBasis, feeYear, feeLevels: [bachelor && 'bachelor', master && 'master'].filter(Boolean),
          ...(accelerated ? { feeNote: 'year-round accelerated provider; numeric fees on an academic-year basis only' } : {}),
        } : {}),
      },
      createdAt: syncedAt, updatedAt: syncedAt, __v: 0,
    };
    const nulls = [];
    const accelNull = 'year-round accelerated registrations only (no standard length stated, no published annual fee): a per-academic-year fee cannot be derived; total course tuition is in the tuition text';
    if (!doc.tuitionFeeUSD) nulls.push({ field: 'tuitionFeeUSD', why: !fx ? 'FX rate unavailable' : (accelerated && totals?.bachelor ? accelNull : 'no current CRICOS Bachelor course with a tuition fee') });
    if (!doc.graduateTuitionUSD) nulls.push({ field: 'graduateTuitionUSD', why: !fx ? 'FX rate unavailable' : (accelerated && totals?.master ? accelNull : "no current CRICOS Master's (coursework/extended) course with a tuition fee") });
    if (!doc.website) nulls.push({ field: 'website', why: 'no website in CRICOS or TEQSA' });
    nulls.push({ field: 'minGpaPercent, minIeltsScore, minGreScore, greRequired, minScore, ieltsScore, greExam, workExp', why: 'admission requirements are not in CRICOS/TEQSA; set only from the university\'s own page (requirementsSource)' });
    nulls.push({ field: 'acceptanceRate', why: 'no official Australian source publishes per-university acceptance rates' });
    nulls.push({ field: 'scholarshipAvailable', why: 'not in CRICOS/TEQSA' });
    nulls.push({ field: 'rankingNum', why: 'rankings come only from the separate official QS import' });
    nulls.forEach((n) => valuesLeftNull.push({ institution: name, ...n }));

    const evidence = [
      { what: 'CRICOS institution row (name, type, website, address)', url: cricos.files.institutions.url, quote: inst._raw, verified: true },
      ...teqsaEvidence(t),
      ...(known.city && cityHit !== inst['Postal Address City'] ? [{ what: 'city from CRICOS location', url: cricos.files.locations.url, quote: cityHit, verified: true }] : []),
      ...websiteEvidence(w),
      ...(t.website ? [{ what: 'website listed on the TEQSA National Register', url: t.finalUrl || t.url, quote: t.website, verified: String(t.page.body).includes(t.website), agreesWithProposed: regDomain(t.website) === regDomain(website), ...(teqsaSiteRedirect ? { redirectsTo: teqsaSiteRedirect.finalUrl || null, redirectTitle: teqsaSiteRedirect.title || null, ...(teqsaSiteRedirect.error ? { error: teqsaSiteRedirect.error } : {}) } : {}) }] : []),
      { what: 'courses', url: cricos.files.courses.url, note: `${cc.courses.length} of ${cc.totalAvailable} distinct current Bachelor/Master's/Doctoral course names (${cc.degreeCourseRecords} CRICOS course records)`, sample: cc.courses.slice(0, 5) },
      ...(proposed.tuition ? [{ what: 'tuition', url: cricos.files.courses.url, fx, bachelor, master, ...(totals ? { totals } : {}), note: `per-course rows with the verbatim CRICOS line${fromList ? ' (and the official fee-list row)' : ''} are in fees.${code}.rows` }] : []),
      ...(proposed.tuition && feeCheck ? (feeCheck.confirmedYear ? [feeCheck.items.find((i) => i.match && i.year === feeCheck.confirmedYear && i.quoteVerified && i.yearVerified)] : feeCheck.items.filter((i) => i.quoteVerified && i.yearVerified && i.cricos != null).slice(0, 3))
        .filter(Boolean).map((i) => ({
          what: feeCheck.confirmedYear ? `fee year ${feeCheck.confirmedYear}: the university's published fee equals the CRICOS figure` : `the university's ${i.year} fee differs from CRICOS (${i.gapPct}%)`,
          url: i.url, quote: i.quote, verified: i.quoteVerified, yearQuote: i.yearQuote, courseCode: i.courseCode, official: i.amount, basis: i.basis, cricos: i.cricos,
          ...(feeCheck.confirmedYear ? { agreement: feeCheck.agreement } : {}), note: `all compared figures with their quotes: fees.${code}.officialCheck.items`,
        })) : []),
    ];
    const optional = isCollege;
    creates.push({
      id: String(_id), name, action: 'create', cricosCode: code, teqsaCategory: category,
      ...(optional ? { optional: true, gate: '--include-university-colleges' } : {}),
      willApply: !optional || WITH_COLLEGES, doc, evidence, valuesLeftNull: nulls,
    });
    Object.assign(row, {
      decision: optional ? (WITH_COLLEGES ? 'create (university college)' : 'create only with --include-university-colleges') : 'create',
      website, type, courses: cc.courses.length, degreeLevels: cc.degreeLevels,
      feesAUD: { bachelorMedian: bachelor ? Math.round(bachelor.median) : null, masterMedian: master ? Math.round(master.median) : null },
      feesUSD: { bachelorMedian: doc.tuitionFeeUSD, masterMedian: doc.graduateTuitionUSD }, tuition: doc.tuition,
    });
  }

  // 5) DB records whose institution is no longer on CRICOS
  const changes = [];
  const syncedRecordIssues = [];
  const successorCreate = (code) => creates.find((c) => c.cricosCode === code);
  for (const u of active) {
    if (dbMatch.get(String(u._id))) continue;
    const sup = SUPERSEDED[u.name];
    const row = { dbName: u.name, decision: null };
    institutions.push(row);
    const evidence = [{
      what: 'absent from the current CRICOS export', url: cricos.files.institutions.url, quote: null, verified: true,
      note: `no provider named "${u.name}" or with website domain ${regDomain(u.website) || '(none)'} and degree courses among ${cricos.institutions.length} CRICOS providers (dataset modified ${cricos.datasetModified})`,
    }];
    if (cricosRule) evidence.push({ what: 'CRICOS rule (TEQSA)', ...cricosRule });
    if (!sup) {
      row.decision = 'no change (not on CRICOS, no corroborating official source configured)';
      uncertainties.push(`${u.name}: not found on CRICOS by name/website; review manually (no change proposed)`);
      continue;
    }
    const t = await teqsaProvider(sup.teqsa, { searchName: u.name });
    evidence.push(...teqsaEvidence(t));
    const successor = instByCode.get(sup.successorCode);
    const successorW = successorCreate(sup.successorCode);
    let redirect = null;
    if (u.website) {
      try {
        const p = await getPage(`${origin(u.website)}/`);
        redirect = { from: u.website, finalUrl: p.finalUrl, title: squash(cheerio.load(p.body)('title').first().text()), page: p };
      } catch (err) { redirect = { from: u.website, error: err.message }; }
    }
    const succSite = successorW?.doc.website || null;
    const redirectsToSuccessor = Boolean(redirect?.finalUrl && succSite && regDomain(redirect.finalUrl) === regDomain(succSite)
      && successor && norm(redirect.title).includes(norm(successor['Institution Name'])));
    evidence.push({
      what: `its website now opens the successor ${successor ? successor['Institution Name'] : sup.successorCode}`, url: u.website,
      quote: redirect?.title ? `${redirect.finalUrl} — ${redirect.title}` : null, verified: redirectsToSuccessor, ...(redirect?.error ? { error: redirect.error } : {}),
    });
    if (successorW) {
      const sw = successorW.evidence.find((e) => e.footerQuote);
      if (sw) evidence.push({ what: 'successor home page footer', url: sw.url, quote: sw.footerQuote, verified: sw.footerQuoteVerified });
    }
    const corroborated = Boolean((t && !t.error && t.cricosCancelled && !t.cricosCode) || redirectsToSuccessor);
    if (!corroborated) {
      row.decision = 'no change (could not corroborate)';
      uncertainties.push(`${u.name}: absent from CRICOS but neither the TEQSA decision nor a website redirect could be verified; no change proposed`);
      continue;
    }
    const reason = `no longer registered on CRICOS${t?.cricosCancelled ? ` (TEQSA: "${t.cricosCancelled}")` : ''}, so it cannot enrol new international students; superseded by ${successor ? successor['Institution Name'] : sup.successorCode} (CRICOS ${sup.successorCode})${redirectsToSuccessor ? ', to which its website now redirects' : ''}`;
    const oldSynced = isOldSynced(u);
    const successorInDb = [...dbMatch.values()].some((m) => m && m.inst['CRICOS Provider Code'] === sup.successorCode);
    if (!successorInDb && !successorW?.willApply) uncertainties.push(`${u.name}: its successor (CRICOS ${sup.successorCode}) is neither in our DB nor created by this run; deactivating leaves no replacement record`);
    if (oldSynced) {
      const stored = instByCode.get(u.dataSource.providerCode);
      evidence.push({
        what: 'CRICOS code stored by cricosAustraliaSync.js', url: cricos.files.institutions.url, quote: stored ? stored._raw : null, verified: Boolean(stored),
        note: stored ? `${u.dataSource.providerCode} is "${stored['Institution Name']}" with ${degreeCount(u.dataSource.providerCode)} current degree courses — not this university, so the record's "CRICOS" label never covered its fee` : `${u.dataSource.providerCode} is not on CRICOS`,
      });
    }
    // the previous dataSource is kept inside the new one so it survives even if this run's report is lost
    const dataSource = { provider: PROVIDER, urls: [...new Set(evidence.filter((e) => e.what !== 'CRICOS rule (TEQSA)').map((e) => e.url).filter(Boolean))], syncedAt, fields: ['isActive'], runId: RUN_ID, reason, successorCricosCode: sup.successorCode, previous: u.dataSource ?? null };
    const change = {
      id: String(u._id), name: u.name, action: 'deactivate', reason,
      ...(oldSynced ? { syncedBy: 'cricosAustraliaSync.js (2026-10-03)', revertOrder: `revert this run BEFORE "${OLD_SYNC_REVERT}"` } : {}),
      willApply: true, // a superseded record never stays active next to its successor (duplicate institution)
      diff: { isActive: { from: u.isActive ?? null, to: false }, dataSource: { from: u.dataSource ?? null, to: dataSource } },
      evidence,
    };
    changes.push(change);
    row.decision = 'deactivate';
    row.reason = reason;
  }
  for (const c of creates) {
    const replaced = changes.filter((x) => x.diff.dataSource.to.successorCricosCode === c.cricosCode);
    if (replaced.length) { c.supersedes = replaced.map((x) => x.name); c.supersededIds = replaced.map((x) => x.id); }
  }
  // Never publish a successor next to a record it supersedes (duplicate institution): every superseded record must be
  // deactivated by the same run, else the successor is not created
  for (const c of creates.filter((x) => x.willApply)) {
    // predecessors per the SUPERSEDED config that are still active and not matched to a current CRICOS provider
    const predecessors = active.filter((u) => SUPERSEDED[u.name]?.successorCode === c.cricosCode && !dbMatch.get(String(u._id)));
    const stays = predecessors.filter((u) => !changes.some((x) => x.id === String(u._id) && x.willApply));
    if (stays.length) {
      c.willApply = false;
      c.blockedBy = `superseded record(s) ${stays.map((u) => u.name).join(', ')} would stay active (deactivation not corroborated in this run)`;
      uncertainties.push(`${c.name}: not created — ${c.blockedBy}; it would duplicate them`);
      // hold the other predecessors' deactivations too: the merger is applied as one unit or not at all
      changes.filter((x) => x.willApply && x.diff.dataSource.to.successorCricosCode === c.cricosCode).forEach((x) => {
        x.willApply = false;
        x.heldBecause = `successor ${c.name} is not created in this run`;
        const row = institutions.find((i) => i.dbName === x.name);
        if (row) row.decision = 'deactivate held (successor not created this run)';
      });
    }
  }
  const revertNotes = [];
  if (changes.some((c) => c.willApply && c.syncedBy)) {
    revertNotes.push(`REVERT ORDER: this run deactivates ${changes.filter((c) => c.willApply && c.syncedBy).map((c) => `"${c.name}"`).join(', ')}, which cricosAustraliaSync.js updated on 2026-10-03. To undo both, run "node scripts/dataSync/${SYNC_ID}.js --revert <this report>" BEFORE "${OLD_SYNC_REVERT}".`);
    revertNotes.push('Why: that older revert removes dataSource from all its 37 records and never touches isActive. If it runs first, this revert cannot match the record by dataSource.runId; it then restores only isActive on records that are inactive and have no dataSource (the older revert intentionally removed their dataSource) and prints every record it skipped. The previous dataSource is also kept in dataSource.previous of the deactivated record.');
  }

  // 6) Report-only audit of the records synced by cricosAustraliaSync.js
  const oldSynced = ours.filter(isOldSynced);
  for (const u of oldSynced) {
    const code = u.dataSource.providerCode;
    const inst = instByCode.get(code);
    const issues = [];
    if (!inst) issues.push({ issue: `stored CRICOS code ${code} is no longer on CRICOS` });
    else {
      const nameMatches = [inst['Institution Name'], inst['Trading Name']].some((n) => n && normName(n) === normName(u.name));
      if (!degreeCount(code) || (!nameMatches && regDomain(inst.Website) !== regDomain(u.website))) {
        issues.push({
          issue: `wrong CRICOS match: stored code ${code} is "${inst['Institution Name']}" with ${degreeCount(code)} degree courses and website ${inst.Website || '(none)'} (the earlier run matched it by website domain ${regDomain(inst.Website)})`,
          impact: 'dataSource.provider is "CRICOS", so the site labels this record "Official Australian Govt data" and shows its tuitionFeeUSD as an official fee, but no value came from CRICOS',
          values: { tuitionFeeUSD: u.tuitionFeeUSD ?? null, graduateTuitionUSD: u.graduateTuitionUSD ?? null, tuition: u.tuition ?? null, courses: (u.courses || []).length },
          evidence: { url: cricos.files.institutions.url, quote: inst._raw },
        });
      }
    }
    const sup = changes.find((c) => c.id === String(u._id));
    if (sup) issues.push({ issue: `institution superseded: ${sup.reason}`, proposal: sup.willApply ? 'deactivate (this run)' : 'deactivate (not applied by this run)' });
    const otherRegs = secondary.filter((s) => s.sameAs === u.name);
    if (otherRegs.length) issues.push({ issue: `courses of its other CRICOS registration(s) ${otherRegs.map((s) => `${s.cricosCode} "${s.tradingName || s.cricosName}" (${s.degreeCourses} degree courses)`).join(', ')} are not in this record`, severity: 'info' });
    if (inst && inst.Website && u.website && regDomain(inst.Website) !== regDomain(u.website)) issues.push({ issue: `website ${u.website} differs from the CRICOS-listed ${inst.Website}`, severity: 'info' });
    if (issues.length) syncedRecordIssues.push({ id: String(u._id), name: u.name, providerCode: code, issues });
  }
  const levelStyle = oldSynced.filter((u) => (u.degreeLevels || []).some((l) => l === 'Bachelors' || l === 'Masters')).length;
  const generalIssues = [];
  if (levelStyle) generalIssues.push(`${levelStyle} records synced by cricosAustraliaSync.js store degreeLevels as "Bachelors"/"Masters" instead of "Bachelor's"/"Master's" (the form used by the other country syncs and the new records here); not changed.`);
  if (oldSynced.length) generalIssues.push(`cricosAustraliaSync.js wrote dataSource without "fields"/"urls"/"runId"; the site treats provider "CRICOS" as an official fee for every field, which is wrong where no fee came from CRICOS (see syncedRecordIssues). Its medians include medicine/dentistry/vet courses and its course lists are capped at 400 (vs ${COURSE_CAP} here).`);

  // 7) Unverified values on records left active (not changed)
  const DEFAULTISH = { minIeltsScore: 6.5, minGpaPercent: 60, ieltsScore: 'IELTS 6.0+', minScore: 'GPA 3.0+', greExam: 'GRE Waived', workExp: 'Freshers Eligible', scholarshipAvailable: true };
  const deactivating = new Set(changes.filter((c) => c.willApply).map((c) => c.id));
  const unverifiedFields = active.filter((u) => !deactivating.has(String(u._id)) && !u.requirementsSource).map((u) => {
    const f = Object.entries(DEFAULTISH).filter(([k, v]) => u[k] === v).map(([k]) => k);
    if (u.acceptanceRate != null) f.push('acceptanceRate');
    if (u.rankingNum != null && !u.rankingSource) f.push('rankingNum (no rankingSource)');
    return { name: u.name, fields: f };
  }).filter((x) => x.fields.length);

  // 8) Report
  const willCreate = creates.filter((c) => c.willApply);
  const willDeactivate = changes.filter((c) => c.willApply);
  const summary = {
    runId: RUN_ID, mode: APPLY ? 'apply' : 'dry-run', ourAustraliaRecords: ours.length, activeRecords: active.length,
    cricosUniversityProvidersWithDegrees: uniLike.length, notInDb: candidates.length + secondary.length,
    creates: willCreate.length, optionalCreates: creates.filter((c) => c.optional && !c.willApply).length,
    updates: 0, deactivations: willDeactivate.length, heldDeactivations: changes.filter((c) => !c.willApply).length,
    secondaryRegistrations: secondary.length, notCreated: notCreated.length,
    syncedRecordsWithIssues: syncedRecordIssues.filter((s) => s.issues.some((i) => i.severity !== 'info')).length,
    blockedCreates: creates.filter((c) => c.blockedBy).length,
    feeYearConfirmed: Object.fromEntries(Object.entries(fees).filter(([c]) => willCreate.some((x) => x.cricosCode === c)).map(([c, f]) => [f.name, f.feeYear])),
    flags: { includeUniversityColleges: WITH_COLLEGES, deactivateSupersededSynced: 'always (default)' },
    requests: counters, fx,
  };
  const reportBody = (mode, appliedAt = null) => ({
    meta: {
      script: SYNC_ID, runId: RUN_ID, mode, generatedAt: syncedAt, appliedAt, flags: summary.flags,
      sources: { cricos: { datasetPage: cricos.datasetPage, datasetModified: cricos.datasetModified, files: cricos.files }, teqsa: `${TEQSA}/national-register`, fx },
      requests: counters, cacheDir: CACHE_DIR,
    },
    summary, revertNotes, institutions, creates, changes, secondaryRegistrations: secondary, notCreated,
    syncedRecordIssues, generalIssues, unverifiedFields, valuesLeftNull, uncertainties, cricosRule,
    fees, methodNotes: METHOD_NOTES,
  });
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  // one file per run and mode (runId has seconds); never overwrite an existing report (an apply report is the revert key)
  const reportPath = path.join(REPORT_DIR, `australia-gap-sync-${RUN_ID.replace(/^au-gap-/, '')}-${APPLY ? 'apply' : 'dry-run'}.json`);
  try {
    fs.writeFileSync(reportPath, JSON.stringify(reportBody(APPLY ? 'apply' : 'dry-run'), null, 2), { flag: 'wx' });
  } catch (err) {
    if (err.code === 'EEXIST') throw new Error(`${reportPath} already exists; not overwriting it (run again in a second)`);
    throw err;
  }

  console.log(JSON.stringify(summary, null, 2));
  console.table(institutions.map((i) => ({
    institution: i.name || i.dbName, cricos: i.cricosCode || '', teqsa: i.teqsaCategory || '', decision: i.decision,
    website: i.website || '', type: i.type || '', courses: i.courses ?? '', 'USD B/M': i.feesUSD ? `${i.feesUSD.bachelorMedian ?? '-'} / ${i.feesUSD.masterMedian ?? '-'}` : '',
  })));
  secondary.forEach((s) => console.log(`  secondary registration (not created): ${s.cricosCode} ${s.tradingName || s.cricosName} → same as our "${s.sameAs}"`));
  syncedRecordIssues.forEach((s) => s.issues.filter((i) => i.severity !== 'info').forEach((i) => console.log(`  ISSUE in synced record "${s.name}": ${i.issue}`)));
  creates.filter((c) => c.blockedBy).forEach((c) => console.log(`  BLOCKED: "${c.name}" is not created: ${c.blockedBy}`));
  revertNotes.forEach((n) => console.log(`  ${n}`));
  Object.values(fees).filter((f) => f && willCreate.some((c) => c.name === f.name)).forEach((f) => console.log(`  fees ${f.name}: ${f.feeYearText}${f.accelerated ? ' [year-round provider: academic-year basis only]' : ''}`));
  console.log(`full report: ${reportPath}`);

  if (APPLY) {
    const col = db.collection('universities');
    const writeReport = (appliedAt = null) => fs.writeFileSync(reportPath, JSON.stringify(reportBody('apply', appliedAt), null, 2));
    // 1) deactivate superseded records first, so a successor is never published next to an active predecessor
    for (const c of willDeactivate) {
      const set = { updatedAt: new Date() };
      for (const [k, v] of Object.entries(c.diff)) set[k] = v.to;
      const r = await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id), isActive: { $ne: false } }, { $set: set });
      c.applied = r.modifiedCount === 1;
      if (!c.applied) c.skipped = 'record not found or already inactive';
      writeReport();
    }
    // 2) create; a successor only when every record it supersedes is now inactive
    for (const c of willCreate) {
      if (c.supersededIds?.length) {
        const stillActive = await col.find({ _id: { $in: c.supersededIds.map((id) => new mongoose.Types.ObjectId(id)) }, isActive: { $ne: false } }).project({ name: 1 }).toArray();
        if (stillActive.length) { c.skipped = `superseded record(s) still active: ${stillActive.map((x) => x.name).join(', ')}`; writeReport(); continue; }
      }
      const clash = await col.findOne({ $or: [{ name: c.doc.name, country: c.doc.country, city: c.doc.city }, { country: c.doc.country, 'dataSource.cricosProviderCode': c.cricosCode, isActive: { $ne: false } }] });
      if (clash) { c.skipped = `a record already exists (${clash.name})`; writeReport(); continue; }
      await col.insertOne(c.doc);
      c.applied = true;
      writeReport();
    }
    writeReport(new Date());
    console.log(`APPLIED: ${willDeactivate.filter((c) => c.applied).length} deactivated, ${willCreate.filter((c) => c.applied).length} created (revert: --revert ${reportPath})`);
    [...willDeactivate, ...willCreate].filter((c) => c.skipped).forEach((c) => console.log(`  SKIPPED ${c.name}: ${c.skipped}`));
    revertNotes.slice(0, 1).forEach((n) => console.log(`  ${n}`));
  }
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('FAILED:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
