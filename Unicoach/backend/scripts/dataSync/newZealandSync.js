/**
 * Sync New Zealand institutions with official sources.
 *
 *   node scripts/dataSync/newZealandSync.js                    # DRY RUN: fetch + match + report, writes nothing
 *   node scripts/dataSync/newZealandSync.js --apply            # write the creates/updates/deactivations of this run
 *   node scripts/dataSync/newZealandSync.js --revert <report.json>
 *
 * Options: --refresh (ignore the page cache), --max-scrapedo <n> (default 8 per run),
 *          --llm-fees <key> (test only: force the Groq fee fallback for one university, e.g. lincoln).
 *
 * Sources (all official):
 *  - NZQA provider register (nzqa.govt.nz/providers): official/trading name, website, provider type, and whether the
 *    provider is an approved signatory to the Education (Pastoral Care of Tertiary and International Learners) Code of
 *    Practice. NZQA: "An education provider must be an approved signatory to the Code before enrolling international
 *    students." Non-signatories are hidden (isActive:false), as are non-institutions and duplicates. Never deletes.
 *  - NZQA NZQF qualifications register (nzqa.govt.nz/nzqf): current qualifications each provider can award/deliver →
 *    courses + degree levels.
 *  - The 8 universities' own international tuition fee pages (HTML tables, and Victoria's official fee API used by its
 *    cost calculator) → Bachelor's / Master's yearly fee ranges. Converted NZD → USD at today's ECB rate (frankfurter.app).
 *    If a page cannot be parsed, a Groq LLM fallback is used and a value is kept only if its verbatim quote is in the page.
 *
 * Ranking fields (rank, rankingNum, rankingSource) are never touched. Reports and the 7-day page cache go to
 * backend/reports/ (git-ignored), so re-runs do not spend scrape.do credits. scrape.do is used only for sites that block
 * direct requests (AUT, Lincoln, Otago fee pages).
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
const argValue = (flag) => { const i = ARGS.indexOf(flag); return i !== -1 ? ARGS[i + 1] : undefined; };
const MAX_SCRAPEDO = Number(argValue('--max-scrapedo') || 8);
const FORCE_LLM = argValue('--llm-fees') || '';
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');
const CACHE_DIR = path.join(REPORT_DIR, '.cache', 'nz-sync');
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const NZQA = 'https://www.nzqa.govt.nz';
const CODE_PAGE = 'https://www2.nzqa.govt.nz/tertiary/the-code/';
const CODE_RULE_QUOTE = 'An education provider must be an approved signatory to the Code before enrolling international students.';
const SIGNATORY_QUOTE = 'This Education Organisation is a Signatory to the Code of Practice for the Pastoral Care of International Students';
const FX_URL = 'https://api.frankfurter.app/latest?from=NZD&to=USD';
const GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
const { SCRAPE_DO_TOKEN, GROQ_API_KEY } = process.env;
const RUN_ID = `nz-sync-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
const PROVIDER = 'NZQA provider & NZQF registers + official university fee pages';
const counters = { directRequests: 0, scrapeDoRequests: 0, cacheHits: 0, groqCalls: 0 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- registry (DB record ↔ NZQA provider) ----------
// Mapping is curated; every value proposed from it (name, website, signatory status, type) is verified live against
// the NZQA register at run time, and the run fails loudly into the report when a check does not hold.
const NZST_RE = /tourism|travel|aviation|airline|flight|cabin|hospitality|hotel/i;
const REGISTRY = [
  { key: 'auckland', kind: 'university', nzqaId: '700122001', name: 'University of Auckland', city: 'Auckland' },
  { key: 'aut', kind: 'university', nzqaId: '700800001', name: 'Auckland University of Technology', city: 'Auckland', dbNames: ['Auckland University of Technology (AUT)'] },
  { key: 'waikato', kind: 'university', nzqaId: '700277001', name: 'University of Waikato', city: 'Hamilton' },
  { key: 'massey', kind: 'university', nzqaId: '700311001', name: 'Massey University', city: 'Palmerston North' },
  { key: 'vuw', kind: 'university', nzqaId: '700493001', name: 'Victoria University of Wellington', city: 'Wellington' },
  { key: 'canterbury', kind: 'university', nzqaId: '700571001', name: 'University of Canterbury', city: 'Christchurch' },
  { key: 'lincoln', kind: 'university', nzqaId: '700642001', name: 'Lincoln University', city: 'Lincoln' },
  { key: 'otago', kind: 'university', nzqaId: '700726001', name: 'University of Otago', city: 'Dunedin' },
  { key: 'mit', kind: 'itp', nzqaId: '601047001', name: 'Manukau Institute of Technology', dbNames: ['Manukau Institute of Technology (MIT)'] },
  { key: 'unitec', kind: 'itp', nzqaId: '600449001', name: 'Unitec', dbNames: ['Unitec Institute of Technology'] },
  { key: 'northtec', kind: 'itp', nzqaId: '601290001', name: 'NorthTec' },
  { key: 'whitireia-weltec', kind: 'itp', nzqaId: '601420001', name: 'Whitireia & WelTec', dbNames: ['Whitireia Community Polytechnic', 'Wellington Institute of Technology (WelTec)'], keepDbName: 'Whitireia Community Polytechnic' },
  { key: 'otago-polytechnic', kind: 'itp', nzqaId: '601339001', name: 'Otago Polytechnic' },
  { key: 'ara', kind: 'itp', nzqaId: '600627001', name: 'Ara Institute of Canterbury' },
  { key: 'wintec', kind: 'itp', nzqaId: '601915001', name: 'Waikato Institute of Technology', dbNames: ['Waikato Institute of Technology (Wintec)'] },
  { key: 'toi-ohomai', kind: 'itp', nzqaId: '602548001', name: 'Toi Ohomai Institute of Technology' },
  { key: 'sit', kind: 'itp', nzqaId: '601558001', name: 'Southern Institute of Technology' },
  { key: 'tpp', kind: 'itp', nzqaId: '602432001', name: 'Tai Poutini Polytechnic' },
  { key: 'open-polytechnic', kind: 'itp', nzqaId: '602257001', name: 'The Open Polytechnic of New Zealand' },
  { key: 'awanuiarangi', kind: 'wananga', nzqaId: '938680001', name: 'Te Whare Wānanga o Awanuiārangi' },
  { key: 'twoa', kind: 'wananga', nzqaId: '863088001', name: 'Te Wānanga o Aotearoa' },
  { key: 'raukawa', kind: 'wananga', nzqaId: '924137001', name: 'Te Wānanga o Raukawa' },
  { key: 'mds', kind: 'pte', nzqaId: '819241001', name: 'Media Design School', search: 'Media Design' },
  // Yoobee Colleges Limited also trades as Elite School of Beauty and Spa, Cut Above Academy and Healthcare Academy (NZQA);
  // their beauty/hair/nursing qualifications are left out of the Yoobee list, tourism ones go to the NZST record
  { key: 'yoobee', kind: 'pte', nzqaId: '932410001', name: 'Yoobee Colleges', search: 'Yoobee', courseExclude: new RegExp(`${NZST_RE.source}|beauty|skin care|nursing|hairdressing|barbering|make-?up`, 'i') },
  { key: 'nzst', kind: 'pte', nzqaId: '932410001', name: 'New Zealand School of Tourism', search: 'Tourism', brandOf: 'yoobee', website: 'https://www.nzschooloftourism.co.nz', websiteTitle: /New Zealand School of Tourism/i, courseInclude: NZST_RE, minLevel: 3 },
  { key: 'pihms', kind: 'pte', nzqaId: '845715001', name: 'Pacific International Hotel Management School', search: 'Hotel Management', dbNames: ['Pacific International Hotel Management School (PIHMS)'] },
  { key: 'nzcc', kind: 'pte', nzqaId: '839600001', name: 'New Zealand College of Chiropractic', search: 'Chiropractic' },
  { key: 'aut-millennium', kind: 'not-an-institution', dbNames: ['AUT Millennium'], duplicateOf: 'aut', search: 'Millennium', evidenceUrl: 'https://www.autmillennium.org.nz/', evidenceTitle: /Sport & Community Health & Fitness Centre/i },
];
const NZQA_TYPE = { university: 'UNI', itp: 'POLLY', wananga: 'WANA', pte: 'PTE' };
const NZQA_TYPE_LABEL = { UNI: 'University', POLLY: 'Polytechnic', WANA: 'Wananga', PTE: 'Private Training Establishment' };

// ---------------------------------------------------------------- text helpers ----------
const squash = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = (s) => fold(s).toLowerCase().replace(/[^a-z0-9.]+/g, ' ').replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2')
  .replace(/\s+/g, ' ').trim();
const digits = (s) => String(s ?? '').replace(/[^0-9]/g, '');
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
const regDomain = (url) => {
  if (!url) return '';
  const host = String(url).trim().toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '');
  const parts = host.split('.').filter(Boolean);
  return parts.length >= 3 && /^(ac|co|org|govt|net|school|maori|iwi)$/.test(parts[parts.length - 2]) ? parts.slice(-3).join('.') : parts.slice(-2).join('.');
};
const origin = (url) => {
  const u = String(url || '').trim();
  if (!u) return null;
  try { return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).origin.toLowerCase(); } catch (_) { return null; }
};

// Visible page text with a space between elements (so table cells do not run together); memoised on the page object
function textOf(page) {
  if (page._text === undefined) {
    const $ = cheerio.load(String(page.body).replace(/>/g, '> '));
    $('head,script,style,noscript,svg,iframe').remove(); // keep <template>: Lincoln renders its fee tables from one
    page._text = squash($.root().text()); // root, not body: some CMS pages (Lincoln) put content after </body>
    page._norm = norm(page._text);
  }
  return page._text;
}
const inPage = (page, quote) => { textOf(page); return Boolean(quote) && page._norm.includes(norm(quote)); };

// ---------------------------------------------------------------- HTTP with cache + scrape.do fallback ----------
const isBlocked = (status, body) => status === 403 || status === 429 || status === 503
  || /<title>\s*(Just a moment|Attention Required)/i.test(String(body).slice(0, 20000));

async function getPage(url, { scrapeDo = false } = {}) {
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
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-NZ,en;q=0.9' },
        redirect: 'follow',
        signal: AbortSignal.timeout(45000),
      });
      counters.directRequests += 1;
      status = res.status;
      finalUrl = res.url || url;
      body = await res.text();
      break;
    } catch (err) {
      lastError = err.cause?.code || err.message;
      if (attempt < 2) await sleep(2000);
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

async function nzdToUsd() {
  let lastError = '';
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(FX_URL, { headers: { 'User-Agent': BROWSER_UA }, signal: AbortSignal.timeout(30000) });
      const j = await res.json();
      if (j?.rates?.USD) return { base: 'NZD', quote: 'USD', rate: j.rates.USD, date: j.date, source: 'ECB reference rate via api.frankfurter.app', url: FX_URL };
      lastError = 'no NZD→USD rate in response';
    } catch (err) { lastError = err.cause?.code || err.message; }
    await sleep(3000 * attempt);
  }
  throw new Error(`frankfurter.app: ${lastError}`);
}

// ---------------------------------------------------------------- NZQA ----------
async function nzqaSearch({ type = '', name = '', cop = '' }) {
  const url = `${NZQA}/providers/results.do?regionCode=0&typeCode=${type}&category=&copApprovalStatus=${cop}&nameQuery=${encodeURIComponent(name)}`;
  const page = await getPage(url);
  const $ = cheerio.load(page.body);
  const providers = new Map();
  $('tr').each((_, tr) => {
    const href = $(tr).find('a[href*="providerId="]').attr('href');
    if (!href) return;
    const id = href.match(/providerId=(\d+)/)[1];
    const label = squash($(tr).find('td').first().text());
    if (!providers.has(id)) providers.set(id, new Set());
    providers.get(id).add(label);
  });
  const headline = (textOf(page).match(/There (?:are \d+ Education Organisations[^.]*?(?= Name Location)|are no providers found using those search criteria)/) || [])[0] || null;
  return { url, page, providers, none: /There are no providers found/i.test(textOf(page)), headline };
}

async function nzqaProvider(id) {
  const url = `${NZQA}/providers/details.do?providerId=${id}`;
  const page = await getPage(url);
  const text = textOf(page);
  const after = text.slice(text.indexOf('Print this page'));
  return {
    id, url, page,
    notFound: /No provider was found with the given provider ID/i.test(text),
    legalName: squash((after.match(/Organisations >\s*> NZQA - (.+?) (?:Trading as:|Contact Details|Qualifications This)/) || [])[1]) || null,
    tradingAs: squash((after.match(/Trading as: (.+?) Contact Details/) || [])[1]) || null,
    website: (after.match(/Website (\S+)/) || [])[1] || null,
    codeSignatory: text.includes(SIGNATORY_QUOTE),
    category: (after.match(/Provider Category (\d)/) || [])[1] || null,
  };
}

async function nzqfQualifications(id) {
  const url = `${NZQA}/nzqf/search/results.do?org=${id}`;
  const page = await getPage(url);
  const $ = cheerio.load(page.body);
  const quals = [];
  $('tr').each((_, tr) => {
    if (!$(tr).find('a[href*="viewQualification"]').length) return;
    const c = $(tr).find('td').map((__, td) => squash($(td).text())).get();
    if (c.length < 7) return;
    quals.push({ title: c[1], number: c[2], status: c[3], type: c[4], level: Number(c[5]) || null, credits: Number(c[6]) || null });
  });
  const total = Number((textOf(page).match(/(\d+) qualifications found/) || [])[1] || 0);
  return { url, page, total, quals };
}

const cleanQualTitle = (t) => squash(String(t).replace(/\s*\(Level \d+\)\s*$/i, ''));
const isConjoint = (t) => /\//.test(t) || /conjoint/i.test(t);
function qualLevel(q) {
  if (/^Bachelor/i.test(q.type)) return "Bachelor's";
  if (/^Master/i.test(q.type)) return "Master's";
  if (/^Doctor/i.test(q.type)) return /Doctor of Philosophy/i.test(q.title) ? 'PhD' : 'Doctorate';
  if (/Diploma/i.test(q.type)) return 'Diploma';
  if (/Certificate/i.test(q.type)) return 'Certificate';
  return null;
}
const LEVEL_ORDER = ["Bachelor's", "Master's", 'PhD', 'Doctorate', 'Diploma', 'Certificate'];
const COURSE_ORDER = (q) => ({ "Master's": 1, "Bachelor's": 0, PhD: 2, Doctorate: 2, Diploma: 3, Certificate: 4 }[qualLevel(q)] ?? 5);

// Courses + degree levels from the NZQF register: current qualifications only, conjoint combinations skipped
function coursesFromNzqf(entry, quals) {
  const isUni = entry.kind === 'university';
  let list = quals.filter((q) => q.status === 'Current' && !isConjoint(q.title) && qualLevel(q));
  if (isUni) list = list.filter((q) => ["Bachelor's", "Master's", 'PhD', 'Doctorate'].includes(qualLevel(q)));
  else list = list.filter((q) => (q.level || 0) >= (entry.minLevel || 5));
  if (entry.courseInclude) list = list.filter((q) => entry.courseInclude.test(q.title));
  if (entry.courseExclude) list = list.filter((q) => !entry.courseExclude.test(q.title));
  list.sort((a, b) => COURSE_ORDER(a) - COURSE_ORDER(b) || cleanQualTitle(a.title).localeCompare(cleanQualTitle(b.title)));
  const seen = new Set();
  const courses = [];
  for (const q of list) {
    const t = cleanQualTitle(q.title);
    const k = norm(t);
    if (!t || seen.has(k)) continue;
    seen.add(k);
    courses.push(t);
  }
  const levels = new Set(list.map(qualLevel));
  return {
    courses: courses.slice(0, isUni ? 200 : 60),
    totalAvailable: courses.length,
    degreeLevels: LEVEL_ORDER.filter((l) => levels.has(l) && !(l === 'Doctorate' && levels.has('PhD'))),
  };
}

// ---------------------------------------------------------------- fee parsing ----------
const MONEY_RE = /\$\s?(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d{4,6}(?:\.\d+)?)(?:\s*\((?:fee )?for (\d+) (?:points|credits)\))?/g;
const moneyValues = (text) => [...String(text || '').matchAll(MONEY_RE)]
  .map((m) => ({ value: Number(m[1].replace(/,/g, '')), points: m[2] ? Number(m[2]) : null }));
// Specialist programmes priced far outside the normal range: listed in the report, kept out of the range and median
const EXCLUDE_FROM_RANGE = /medicine|surgery|mb ?chb|medical and health sciences|dental|dentistry|oral health|veterinary|optometry|bachelor of aviation$|pre-selection/i;
const SANE_ANNUAL = [10000, 150000];

// 'bachelor' / 'master' for degree rows, 'other' for other qualifications, null for subject/major rows
function qualKind(label) {
  const l = squash(label);
  if (!l) return null;
  if (/conjoint|\/|\band bachelor of\b/i.test(l)) return 'other';
  if (/^bachelor\b/i.test(l) || /^(BA|BSc|BSocSc|BCom) in /i.test(l)) return 'bachelor';
  if (/^(executive )?master\b/i.test(l)) return 'master';
  if (/^(doctor|phd|diploma|graduate|postgraduate|certificate|foundation|pre-?degree|study abroad|english|research|honours|international diploma|pathway|first year)/i.test(l)) return 'other';
  if (/\([A-Z][A-Za-z().]*\)/.test(l)) return 'other';
  return null;
}

// Tables in document order, each tagged with the latest "20xx … fees" heading before it (headings only: footnotes such
// as "*2027 fees are not yet set" must not switch the year)
function tablesWithContext(html) {
  const $ = cheerio.load(html);
  $('script,style,noscript,svg').remove();
  const out = [];
  let year = null;
  let heading = null;
  $.root().find('h1,h2,h3,h4,h5,h6,caption,summary,legend,table').each((_, el) => {
    if (el.tagName === 'table') {
      const rows = $(el).find('tr').map((__, tr) => [$(tr).find('th,td').map((___, c) => squash($(c).text())).get()]).get();
      out.push({ year, heading, rows });
      return;
    }
    if ($(el).closest('table').length) return;
    const t = squash($(el).text());
    if (t.length < 4 || t.length > 160) return;
    const m = t.match(/\b(20[2-3]\d)\b/);
    if (m && /fee|tuition|estimate/i.test(t)) { year = Number(m[1]); heading = t; }
  });
  return out;
}

function feeRow(level, programme, annualValues, { page, quote, label, basis = 'per year (120 points / 1 year full-time)', approx = false }) {
  const values = annualValues.map((v) => Math.round(v * 100) / 100).filter((v) => v >= SANE_ANNUAL[0] && v <= SANE_ANNUAL[1]);
  return {
    level, programme: squash(programme), annualNZD: values, basis, approx,
    url: page.url, quote: squash(quote), verified: inPage(page, quote) && inPage(page, label || programme.split(' – ')[0]),
  };
}

const FEE_SOURCES = {
  auckland: {
    year: 2027,
    async parse(year) {
      const UG = 'https://www.auckland.ac.nz/en/study/fees-and-money-matters/tuition-fees/international-student-fees/undergraduate-international-fees.html';
      const PG = 'https://www.auckland.ac.nz/en/study/fees-and-money-matters/tuition-fees/international-student-fees/postgraduate-international-fees.html';
      const rows = [];
      const ug = await getPage(UG);
      for (const t of tablesWithContext(ug.body)) {
        if (t.year !== year) continue;
        for (const r of t.rows.slice(1)) {
          if (qualKind(r[0]) !== 'bachelor') continue;
          const vals = moneyValues(r[1]);
          if (vals.length) rows.push(feeRow('bachelor', r[0], vals.map((v) => v.value), { page: ug, quote: r.join(' ') }));
        }
      }
      const pg = await getPage(PG);
      for (const t of tablesWithContext(pg.body)) {
        if (t.year !== year) continue;
        const col = t.rows[0].findIndex((h) => /annual tuition fee/i.test(h));
        if (col < 0) continue;
        for (const r of t.rows.slice(1)) {
          if (/graddip/i.test(r[0])) continue; // Graduate Diploma in Teaching, not a Master's
          const vals = moneyValues(r[col]);
          if (vals.length) {
            rows.push(feeRow('master', `Postgraduate (incl. Master's) – ${r[0]}`, vals.map((v) => v.value),
              { page: pg, quote: r.join(' '), label: r[0], basis: 'annual tuition for 120 postgraduate points in the subject (University table)' }));
          }
        }
      }
      return { pages: [ug, pg], rows };
    },
  },
  aut: {
    year: 2026,
    async parse(year) {
      const URL_ = 'https://www.aut.ac.nz/study/fees-and-scholarships/fees-to-study-at-aut/international-student-fees-at-aut';
      const page = await getPage(URL_, { scrapeDo: true });
      const rows = [];
      for (const t of tablesWithContext(page.body)) {
        if (!/international fee/i.test(t.rows[0]?.[2] || '')) continue;
        for (const r of t.rows.slice(1)) {
          const kind = qualKind(r[0]);
          if (kind !== 'bachelor' && kind !== 'master') continue;
          let seg = r[2] || '';
          if (/\b20\d\d fee:/.test(seg)) seg = seg.split(/(?=\b20\d\d fee:)/).find((p) => p.startsWith(`${year} fee:`)) || '';
          // "$49,459.67 (for 120 points) ($48,200 tuition fees + $1,259.67 student services levy)" → tuition part only
          const ms = [...seg.matchAll(/\$([\d,]+(?:\.\d+)?) \(for (\d+) points\) \(\$([\d,]+(?:\.\d+)?) tuition fees/g)];
          if (!ms.length) continue;
          const pts = ms.map((m) => Number(m[2]));
          rows.push(feeRow(kind, r[0], ms.map((m) => Number(m[3].replace(/,/g, '')) * 120 / Number(m[2])), {
            page, quote: ms[0][0], approx: pts.some((p) => p !== 120),
            basis: pts.some((p) => p !== 120) ? 'programme fee pro-rated to 120 points (tuition only, excl. levy)' : 'per 120 points (tuition only, excl. student services levy)',
          }));
        }
      }
      return { pages: [page], rows };
    },
  },
  waikato: {
    year: 2027,
    async parse(year) {
      const page = await getPage('https://www.waikato.ac.nz/int/study/fees-costs/international-tuition-costs/');
      const rows = [];
      for (const t of tablesWithContext(page.body)) {
        const header = t.rows[0] || [];
        const cols = header.map((h, i) => (h.includes(String(year)) ? i : -1)).filter((i) => i >= 0);
        if (!cols.length) continue;
        for (const r of t.rows.slice(1)) {
          const kind = qualKind(r[0]);
          if (kind !== 'bachelor' && kind !== 'master') continue;
          for (const ci of cols) {
            const vals = moneyValues(r[ci]);
            if (!vals.length) continue;
            const pts = Number((header[ci].match(/(\d+) points/) || [])[1]) || 120;
            rows.push(feeRow(kind, r[0], vals.map((v) => v.value * 120 / pts), {
              page, quote: r.join(' '), approx: pts !== 120,
              basis: pts !== 120 ? `${pts}-point programme fee pro-rated to 120 points` : 'one year of full-time study',
            }));
            break;
          }
        }
      }
      return { pages: [page], rows };
    },
  },
  massey: {
    year: 2027,
    async parse(year) {
      const page = await getPage('https://www.massey.ac.nz/study/fees-and-funding/tuition-fees-for-international-students/');
      const rows = [];
      for (const t of tablesWithContext(page.body)) {
        const header = t.rows[0] || [];
        const col = header.findIndex((h) => /estimate of fees/i.test(h));
        if (col < 0 || !header[col].includes(String(year))) continue;
        for (const raw of t.rows.slice(1)) {
          // responsive tables repeat the column header inside each cell ("Qualification Bachelor of …")
          const r = raw.map((c, i) => (header[i] && c.startsWith(`${header[i]} `) ? c.slice(header[i].length + 1) : c));
          const kind = qualKind(r[0]);
          if (kind !== 'bachelor' && kind !== 'master') continue;
          const vals = moneyValues(r[col]);
          if (!vals.length) continue;
          const approx = vals.some((v) => v.points && v.points !== 120);
          rows.push(feeRow(kind, r[0], vals.map((v) => (v.points ? v.value * 120 / v.points : v.value)), {
            page, quote: raw.join(' '), approx,
            basis: approx ? 'fee for the stated credits pro-rated to 120 credits' : '1 year of full-time study (120 credits)',
          }));
        }
      }
      return { pages: [page], rows };
    },
  },
  vuw: {
    year: 2026,
    async parse() {
      const ref = await getPage('https://www.wgtn.ac.nz/international/site-assets/reference-data.js');
      const data = JSON.parse(ref.body.replace(/^\s*referenceData\s*=\s*/, '').replace(/;\s*$/, ''));
      const programmes = (data?.data?.programmes || []).filter((p) => /^(Bachelor|Master) of/.test(squash(p.title)) && !/-/.test(p.code));
      const rows = [];
      const pages = [ref];
      const queue = [...programmes];
      const worker = async () => {
        while (queue.length) {
          const p = queue.shift();
          const url = `https://service-web.wgtn.ac.nz/international/1.1/?params=${encodeURIComponent(JSON.stringify({ service: 'programme', action: 'get', programme: p.code, country: 'IN' }))}`;
          try {
            const page = await getPage(url);
            const prog = JSON.parse(page.body)?.data?.programme;
            if (!prog?.tuitionNZD) continue;
            const quote = `"tuitionNZD":${prog.tuitionNZD},"feeType":"${prog.feeType}"`;
            const kind = qualKind(prog.title);
            let annual = null;
            let basis = null;
            if (/per 120 points/i.test(prog.feeType)) { annual = prog.tuitionNZD; basis = `${prog.feeType} (University fee API)`; }
            else if (/full programme/i.test(prog.feeType)) {
              const yrs = Number((String(prog.courseLength).match(/([\d.]+)\s*years?/i) || [])[1]);
              if (yrs) { annual = prog.tuitionNZD / yrs; basis = `full-programme fee divided by ${yrs} year(s) ("${prog.courseLength}")`; }
            }
            if (!annual || (kind !== 'bachelor' && kind !== 'master')) continue;
            rows.push({
              level: kind, programme: squash(prog.title), annualNZD: [Math.round(annual * 100) / 100], basis, approx: !/per 120 points/i.test(prog.feeType),
              url, quote, verified: page.body.includes(quote),
            });
          } catch (err) { rows.push({ level: null, programme: p.title, error: err.message, annualNZD: [], verified: false }); }
          await sleep(150);
        }
      };
      await Promise.all([worker(), worker(), worker()]);
      return { pages, rows: rows.filter((r) => r.level), errors: rows.filter((r) => r.error).length, note: `${programmes.length} Bachelor/Master programme codes queried (country=IN)` };
    },
  },
  canterbury: {
    year: 2027,
    async parse(year) {
      const base = 'https://www.canterbury.ac.nz/study/getting-started/study-and-living-costs/study-costs/international-tuition-fees/';
      const rows = [];
      const pages = [];
      for (const slug of ['bachelors', 'masters']) {
        const page = await getPage(base + slug);
        pages.push(page);
        const $ = cheerio.load(page.body);
        const re = new RegExp(`${year} (tuition fee estimate|Special Programme Fee): \\$([\\d,]+(?:\\.\\d+)?) (per 120 points|\\((\\d+) points\\))`);
        $('.cmp-accordion__item').each((_, item) => {
          const title = squash($(item).find('.cmp-accordion__title').first().text().replace(/keyboard_arrow_down/g, ''));
          const kind = qualKind(title);
          if (kind !== 'bachelor' && kind !== 'master') return;
          const m = squash($(item).text()).match(re);
          if (!m) return;
          const pts = m[4] ? Number(m[4]) : 120;
          rows.push(feeRow(kind, title, [Number(m[2].replace(/,/g, '')) * 120 / pts], {
            page, quote: m[0], approx: pts !== 120,
            basis: pts !== 120 ? `${m[1]} for ${pts} points pro-rated to 120 points` : 'estimate per 120 points',
          }));
        });
      }
      return { pages, rows };
    },
  },
  lincoln: {
    year: 2027,
    async parse(year) {
      const page = await getPage('https://www.lincoln.ac.nz/study/fees/international-fees/', { scrapeDo: true });
      const rows = [];
      for (const t of tablesWithContext(page.body)) {
        if (t.year !== year) continue;
        const header = t.rows[0] || [];
        const col = header.findIndex((h) => /tuition fee/i.test(h) && !/semester/i.test(h));
        const creditsCol = header.findIndex((h) => /^credits/i.test(h));
        if (col < 0) continue;
        const annualHeader = /annual/i.test(header[col]);
        for (const r of t.rows.slice(1)) {
          const kind = qualKind(r[0]);
          if (kind !== 'bachelor' && kind !== 'master') continue;
          const vals = moneyValues(r[col]);
          if (!vals.length) continue;
          const pts = !annualHeader && creditsCol >= 0 ? Number((String(r[creditsCol]).match(/(\d+)/) || [])[1]) || 120 : 120;
          rows.push(feeRow(kind, r[0], vals.map((v) => v.value * 120 / pts), {
            page, quote: r.join(' '), approx: pts !== 120,
            basis: pts !== 120 ? `programme tuition for ${pts} credits pro-rated to 120 credits` : `${header[col]} (120 credits)`,
          }));
        }
      }
      return { pages: [page], rows };
    },
  },
  otago: {
    year: 2027,
    async parse(year) {
      const rows = [];
      const pages = [];
      for (const div of ['business-school', 'sciences', 'humanities', 'health-sciences']) {
        const page = await getPage(`https://www.otago.ac.nz/study/fees/international-tuition-fees/${div}`, { scrapeDo: true });
        pages.push(page);
        for (const t of tablesWithContext(page.body)) {
          const header = t.rows[0] || [];
          const col = header.findIndex((h) => /annual fees/i.test(h));
          if (col < 0 || !header[col].includes(String(year))) continue;
          let parent = null;
          for (const r of t.rows.slice(1)) {
            const kind = qualKind(r[0]);
            if (kind) parent = { kind, label: r[0] };
            const k = kind || parent?.kind;
            if (k !== 'bachelor' && k !== 'master') continue;
            const vals = moneyValues(r[col]);
            if (!vals.length) continue;
            const programme = kind ? r[0] : `${parent.label} – ${r[0]}`;
            const approx = vals.some((v) => v.points && v.points !== 120);
            rows.push(feeRow(k, programme, vals.map((v) => (v.points ? v.value * 120 / v.points : v.value)), {
              page, quote: r.join(' '), approx,
              basis: approx ? 'fee for the stated points pro-rated to 120 points' : `${header[col]}`,
            }));
          }
        }
      }
      return { pages, rows };
    },
  },
};

// Groq fallback for a fee page whose layout the parser no longer understands. Kept only with a verified quote.
async function llmFees(uniName, page, year, levels) {
  if (!GROQ_API_KEY) return [];
  // Groq's free tier allows ~8k tokens/min, so send an ~18k-char window starting just before the first fee row
  const full = textOf(page);
  const firstFee = full.search(/(Bachelor|Master) of [^$]{0,200}\$\s?\d/);
  const text = full.slice(Math.max(0, firstFee - 500), Math.max(0, firstFee - 500) + 18000);
  const prompt = `You read an official New Zealand university web page that lists INTERNATIONAL student tuition fees.
University: ${uniName}
Page URL: ${page.url}
Wanted: ${levels.join(' and ')} degree programmes, fee year ${year} (if the page shows only one year, use it).

Return ONLY JSON: {"rows":[{"level":"bachelor"|"master","programme":string,"feeNZD":number,"points":number|null,"year":number|null,"quote":string}]}
Rules: feeNZD is the tuition fee exactly as printed (no conversion, no levies or insurance). points = the number of
points/credits that printed fee covers when the page says so (e.g. "for 180 points"), otherwise null.
quote = a short contiguous snippet (max 25 words) copied EXACTLY from the page text that contains the fee.
Only Bachelor's degrees (level "bachelor") and Master's degrees (level "master"); skip rows without a printed fee. At most 60 rows.

PAGE TEXT:
${text}`;
  for (const model of GROQ_MODELS) {
    let res = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      counters.groqCalls += 1;
      res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
      }).catch(() => null);
      if (!res || res.status !== 429) break;
      const hint = (await res.text()).match(/try again in ([\d.]+)(ms|s)/);
      const wait = hint ? Number(hint[1]) / (hint[2] === 'ms' ? 1000 : 1) : 20;
      await sleep(Math.min(60, wait + 2) * 1000); // rate limit (tokens per minute shared by the org)
    }
    if (!res || !res.ok) continue;
    let data;
    try { data = JSON.parse((await res.json()).choices[0].message.content); } catch (_) { continue; }
    return (data.rows || []).filter((r) => levels.includes(r.level) && Number(r.feeNZD) > 0).map((r) => {
      const fee = Number(r.feeNZD);
      const pts = Number(r.points) || 120;
      const row = feeRow(r.level, String(r.programme || ''), [fee * 120 / pts], {
        page, quote: r.quote, approx: true, basis: `LLM-extracted (${model})${pts !== 120 ? `, ${pts}-point fee pro-rated to 120 points` : ''}`,
      });
      row.verified = row.verified && digits(r.quote).includes(String(Math.floor(fee)));
      row.llm = model;
      return row;
    });
  }
  return [];
}

function summariseFees(rows, level) {
  const seen = new Set();
  const used = [];
  const excluded = [];
  for (const r of rows) {
    if (r.level !== level || !r.verified || !r.annualNZD.length) continue;
    const k = `${norm(r.programme)}|${r.annualNZD.join(',')}`;
    if (seen.has(k)) continue;
    seen.add(k);
    (EXCLUDE_FROM_RANGE.test(r.programme) ? excluded : used).push(r);
  }
  if (used.length < 2) return null;
  const all = used.flatMap((r) => r.annualNZD);
  const mids = used.map((r) => r.annualNZD.reduce((a, b) => a + b, 0) / r.annualNZD.length);
  return {
    programmes: used.length, min: Math.min(...all), max: Math.max(...all), median: median(mids),
    // typical range = 10th–90th percentile of programme fees (full min–max when fewer than 10 programmes)
    typicalLow: used.length >= 10 ? percentile(mids, 0.1) : Math.min(...all),
    typicalHigh: used.length >= 10 ? percentile(mids, 0.9) : Math.max(...all),
    approxRows: used.filter((r) => r.approx).length, excludedFromRange: excluded.map((r) => r.programme),
  };
}

const METHOD_NOTES = [
  'Fee year differs by university: the latest year each page publishes for (almost) all programmes is used — Auckland, Waikato, Massey, Canterbury, Lincoln, Otago: 2027 estimates; AUT and Victoria: 2026 (AUT rows without a year label are taken as the current 2026 fee; Victoria’s fee API states 2026).',
  '"Per year" = the fee for a standard full-time year of 120 points/credits. Fees printed for 180/240-point programmes are pro-rated to 120 points (marked approx), except Otago (page states annual fees) and Victoria "Full Programme" fees (divided by the course length in years from the same API record).',
  'Display range = 10th–90th percentile of programme fees (typical range); full min–max, medians and every source row with its verbatim quote are in fees.<university>. tuitionFeeUSD / graduateTuitionUSD = median Bachelor’s / Master’s fee × ECB NZD→USD rate.',
  'Auckland postgraduate fees are per subject (120 points), not per named Master’s programme. AUT figures are tuition only (the printed totals include the student services levy, which is excluded). Victoria fees come from its official cost-calculator API (service-web.wgtn.ac.nz, queried with country=IN).',
  'Courses = current NZQF qualifications (Bachelor/Master/Doctoral for universities, level 5+ for others; conjoint combinations skipped; capped at 200 / 60).',
];

// ---------------------------------------------------------------- revert ----------
async function revert(reportFile) {
  const report = JSON.parse(fs.readFileSync(path.resolve(reportFile), 'utf8'));
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('universities');
  let restored = 0;
  for (const c of report.changes) {
    const set = {};
    const unset = {};
    for (const [k, v] of Object.entries(c.diff)) {
      if (v.from === undefined || v.from === null) unset[k] = ''; else set[k] = v.from;
    }
    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    const r = await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id), 'dataSource.runId': report.runId }, update);
    restored += r.modifiedCount;
  }
  // Records created by the sync are hidden (isActive:false), never deleted
  let hidden = 0;
  for (const c of report.creates || []) {
    if (!c.insertedId) continue;
    const r = await col.updateOne({ _id: new mongoose.Types.ObjectId(c.insertedId), 'dataSource.runId': report.runId }, { $set: { isActive: false } });
    hidden += r.modifiedCount;
  }
  console.log(`REVERTED: ${restored} records restored, ${hidden} created records hidden (isActive:false) from ${reportFile}`);
  await mongoose.disconnect();
}

// ---------------------------------------------------------------- main ----------
(async () => {
  const revertIdx = ARGS.indexOf('--revert');
  if (revertIdx !== -1) return revert(ARGS[revertIdx + 1]);
  console.log(`NZQA + university fee pages → New Zealand institutions (${APPLY ? 'APPLY' : 'DRY RUN, nothing is written'})`);
  const uncertainties = [];
  const errors = [];

  let fx = null;
  try { fx = await nzdToUsd(); } catch (err) { uncertainties.push(`FX rate unavailable (${err.message}); USD fields not proposed`); }
  console.log(`  NZD→USD ${fx ? `${fx.rate} (${fx.date})` : 'n/a'}`);

  // 1) Code-of-Practice rule + signatory lists from the NZQA register
  const codePage = await getPage(CODE_PAGE);
  const codeRule = { url: CODE_PAGE, quote: CODE_RULE_QUOTE, verified: inPage(codePage, CODE_RULE_QUOTE) };
  const typeSearch = {};
  for (const type of ['UNI', 'POLLY', 'WANA']) {
    typeSearch[type] = { Y: await nzqaSearch({ type, cop: 'Y' }), N: await nzqaSearch({ type, cop: 'N' }) };
  }

  // 2) DB
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const nz = await db.collection('countries').findOne({ name: 'New Zealand' });
  if (!nz) throw new Error('Country "New Zealand" not found');
  const ours = await db.collection('universities').find({ country: nz._id }).toArray();
  console.log(`  our New Zealand records: ${ours.length}`);

  const findDb = (entry) => ours.filter((u) => (entry.dbNames || []).includes(u.name) || (entry.name && norm(u.name) === norm(entry.name)));
  const byKey = Object.fromEntries(REGISTRY.map((e) => [e.key, e]));
  const matchedIds = new Set();

  // 3) Verify each registry entry against NZQA
  const verified = {};
  for (const entry of REGISTRY) {
    const v = { entry, evidence: [], problems: [] };
    verified[entry.key] = v;
    if (entry.kind === 'not-an-institution') {
      const s = await nzqaSearch({ name: entry.search });
      v.nzqaSearch = { url: s.url, none: s.none, quote: s.headline };
      try {
        const p = await getPage(entry.evidenceUrl);
        const title = squash(cheerio.load(p.body)('title').first().text());
        v.siteTitle = { url: p.finalUrl, title, matches: entry.evidenceTitle.test(title) };
      } catch (err) { v.siteTitle = { url: entry.evidenceUrl, error: err.message }; }
      continue;
    }
    try {
      v.provider = await nzqaProvider(entry.nzqaId);
      if (v.provider.notFound) v.problems.push('NZQA: no provider with this ID');
    } catch (err) { v.problems.push(`NZQA details: ${err.message}`); }
    const type = NZQA_TYPE[entry.kind];
    if (type === 'PTE') {
      const s = await nzqaSearch({ type: 'PTE', name: entry.search, cop: 'Y' });
      v.signatory = s.providers.has(entry.nzqaId);
      v.typeOk = v.signatory; // the search is restricted to PTEs
      v.signatoryEvidence = { url: s.url, quote: s.headline, names: [...(s.providers.get(entry.nzqaId) || [])] };
      v.nameInSearch = [...(s.providers.get(entry.nzqaId) || [])].some((n) => norm(n).includes(norm(entry.name)));
    } else {
      const ys = typeSearch[type].Y;
      const ns = typeSearch[type].N;
      v.signatory = ys.providers.has(entry.nzqaId) ? true : (ns.providers.has(entry.nzqaId) ? false : null);
      v.typeOk = ys.providers.has(entry.nzqaId) || ns.providers.has(entry.nzqaId);
      v.signatoryEvidence = v.signatory
        ? { url: ys.url, quote: ys.headline, names: [...ys.providers.get(entry.nzqaId)] }
        : { url: ns.url, quote: ns.headline, names: [...(ns.providers.get(entry.nzqaId) || [])], notInSignatoryList: ys.url };
      v.nameInSearch = [...(ys.providers.get(entry.nzqaId) || ns.providers.get(entry.nzqaId) || [])].some((n) => norm(n).includes(norm(entry.name)));
    }
    if (v.signatory === null) v.problems.push('provider not found in NZQA type search');
    if (v.provider && !v.provider.notFound && v.provider.codeSignatory !== Boolean(v.signatory) && entry.kind !== 'university') {
      v.problems.push(`details page signatory text (${v.provider.codeSignatory}) disagrees with search filter (${v.signatory})`);
    }
    v.nameVerified = Boolean(v.provider && inPage(v.provider.page, entry.name)) || v.nameInSearch;
    if (!v.nameVerified) v.problems.push(`official name "${entry.name}" not found on NZQA page`);
    if (v.signatory) {
      try { v.nzqf = await nzqfQualifications(entry.nzqaId); } catch (err) { v.problems.push(`NZQF: ${err.message}`); }
      if (v.nzqf && v.nzqf.total && v.nzqf.total !== v.nzqf.quals.length) v.problems.push(`NZQF list parsed ${v.nzqf.quals.length}/${v.nzqf.total}`);
      // Official website: NZQA-listed (or brand override), following redirects to a new domain when reachable
      const listed = origin(entry.website || v.provider?.website);
      v.website = { listed, proposed: listed, nzqaListed: v.provider?.website || null };
      if (listed) {
        try {
          const home = await getPage(`${listed}/`);
          const title = squash(cheerio.load(home.body)('title').first().text());
          v.website.finalUrl = home.finalUrl;
          v.website.title = title;
          if (regDomain(home.finalUrl) !== regDomain(listed)) v.website.proposed = origin(home.finalUrl);
          if (entry.websiteTitle && !entry.websiteTitle.test(title)) { v.problems.push(`brand website title mismatch: ${title}`); v.website.proposed = null; }
        } catch (err) {
          v.website.check = `not reachable directly (${err.message}); NZQA-listed website kept`;
          if (entry.websiteTitle) v.website.proposed = null;
        }
      }
    }
    if (v.problems.length) errors.push({ key: entry.key, problems: v.problems });
  }

  // 4) Fees for the 8 universities
  const fees = {};
  for (const entry of REGISTRY.filter((e) => e.kind === 'university')) {
    const src = FEE_SOURCES[entry.key];
    const f = { year: src.year, rows: [], urls: [], errors: [] };
    fees[entry.key] = f;
    let parsed = null;
    try {
      parsed = await src.parse(src.year);
      f.rows = parsed.rows;
      f.urls = [...new Set(parsed.pages.map((p) => p.url))];
      f.fetchedVia = [...new Set(parsed.pages.map((p) => p.via))];
      if (parsed.note) f.note = parsed.note;
      if (parsed.errors) f.errors.push(`${parsed.errors} programme requests failed`);
    } catch (err) { f.errors.push(err.message); }
    const missing = ['bachelor', 'master'].filter((l) => FORCE_LLM === entry.key || !summariseFees(f.rows, l));
    if (missing.length && parsed?.pages?.length && GROQ_API_KEY) {
      for (const page of parsed.pages.slice(0, 4)) {
        if (page.url.endsWith('.js')) continue;
        const llmRows = await llmFees(entry.name, page, src.year, missing);
        f.rows.push(...llmRows);
        f.usedLlm = true;
      }
    }
    f.bachelor = summariseFees(f.rows, 'bachelor');
    f.master = summariseFees(f.rows, 'master');
    console.log(`  fees ${entry.key}: ${f.rows.filter((r) => r.verified).length}/${f.rows.length} verified rows; Bachelor's ${f.bachelor ? `${money(f.bachelor.min)}–${money(f.bachelor.max)}` : 'n/a'}; Master's ${f.master ? `${money(f.master.min)}–${money(f.master.max)}` : 'n/a'}${f.errors.length ? `; errors: ${f.errors.join('; ')}` : ''}`);
  }

  // 5) Proposals
  const syncedAt = new Date();
  const changes = [];
  const creates = [];
  const institutions = [];
  const evidenceFor = (v) => {
    const ev = [];
    if (v.provider) {
      ev.push({ what: 'NZQA provider record', url: v.provider.url, quote: v.provider.tradingAs ? `Trading as: ${v.provider.tradingAs}` : `NZQA - ${v.provider.legalName}`, verified: inPage(v.provider.page, v.provider.tradingAs || v.provider.legalName || '') });
      if (v.provider.website) ev.push({ what: 'NZQA-listed website', url: v.provider.url, quote: `Website ${v.provider.website}`, verified: inPage(v.provider.page, `Website ${v.provider.website}`) });
      if (v.provider.codeSignatory) ev.push({ what: 'Code of Practice signatory', url: v.provider.url, quote: SIGNATORY_QUOTE, verified: true });
    }
    if (v.signatoryEvidence) ev.push({ what: v.signatory ? 'listed in NZQA search filtered to Code signatories (copApprovalStatus=Y)' : 'listed in NZQA search filtered to NON-signatories (copApprovalStatus=N)', url: v.signatoryEvidence.url, quote: v.signatoryEvidence.quote, names: v.signatoryEvidence.names });
    return ev;
  };

  for (const entry of REGISTRY) {
    const v = verified[entry.key];
    const docs = findDb(entry);
    docs.forEach((d) => matchedIds.add(String(d._id)));
    const row = { key: entry.key, name: entry.name, kind: entry.kind, dbRecords: docs.map((d) => d.name), decision: null };
    institutions.push(row);

    const deactivate = (doc, reason, evidence) => {
      if (doc.isActive === false) return;
      const dataSource = { provider: PROVIDER, urls: [...new Set(evidence.map((e) => e.url).filter(Boolean))], syncedAt, fields: ['isActive'], runId: RUN_ID, reason };
      changes.push({ id: String(doc._id), name: doc.name, action: 'deactivate', reason, diff: { isActive: { from: doc.isActive, to: false }, dataSource: { from: doc.dataSource, to: dataSource } }, evidence });
    };

    // --- not an institution (AUT Millennium)
    if (entry.kind === 'not-an-institution') {
      const autDoc = findDb(byKey[entry.duplicateOf])[0];
      for (const doc of docs) {
        const ev = [
          { what: 'NZQA provider search', url: v.nzqaSearch.url, quote: v.nzqaSearch.quote, verified: v.nzqaSearch.none },
          { what: 'own website', url: v.siteTitle?.url, quote: v.siteTitle?.title || v.siteTitle?.error, verified: Boolean(v.siteTitle?.matches) },
        ];
        if (autDoc && regDomain(autDoc.website) === regDomain(doc.website)) ev.push({ what: `same website as our record "${autDoc.name}"`, url: doc.website, quote: null, verified: true });
        deactivate(doc, `not a tertiary institution (a sport & fitness facility per its own website; no NZQA provider "${entry.search}") and a duplicate of ${autDoc?.name || 'AUT'}`, ev);
      }
      row.decision = 'deactivate';
      row.reason = 'not an institution (sport/fitness facility) + duplicate of AUT';
      continue;
    }

    // --- not approved to enrol international students
    if (v.signatory === false) {
      for (const doc of docs) {
        deactivate(doc, 'not a signatory to the Code of Practice, so it cannot enrol international students (NZQA register)', [
          ...evidenceFor(v), { what: 'NZQA rule', url: codeRule.url, quote: codeRule.quote, verified: codeRule.verified },
        ]);
      }
      row.decision = 'deactivate';
      row.reason = 'not an NZQA Code of Practice signatory (cannot enrol international students)';
      row.website = v.provider?.website || null;
      continue;
    }
    if (v.signatory !== true || !v.nameVerified) {
      row.decision = 'no change (verification failed)';
      row.reason = v.problems.join('; ');
      uncertainties.push(`${entry.name}: verification failed — ${v.problems.join('; ')}`);
      continue;
    }

    // --- duplicates (several DB records for one NZQA provider)
    let keep = docs;
    if (docs.length > 1) {
      keep = docs.filter((d) => d.name === entry.keepDbName);
      for (const doc of docs.filter((d) => d.name !== entry.keepDbName)) {
        let redirect = null;
        try { const p = await getPage(origin(doc.website) + '/'); redirect = { url: doc.website, finalUrl: p.finalUrl, title: squash(cheerio.load(p.body)('title').first().text()) }; } catch (_) { /* optional evidence */ }
        const ev = [...evidenceFor(v)];
        if (redirect) ev.push({ what: 'its website now redirects to the merged institution', url: redirect.url, quote: `${redirect.finalUrl} — ${redirect.title}`, verified: regDomain(redirect.finalUrl) === regDomain(v.website?.proposed) });
        deactivate(doc, `duplicate: same NZQA provider ${entry.nzqaId} as "${entry.keepDbName}" (merged institution "${entry.name}")`, ev);
      }
    }

    // --- proposed values
    const nzqf = v.nzqf ? coursesFromNzqf(entry, v.nzqf.quals) : null;
    const type = entry.kind === 'pte' ? 'PRIVATE' : 'PUBLIC';
    const f = fees[entry.key];
    const proposed = {};
    const fieldEvidence = {};
    if (nzqf && nzqf.courses.length) {
      proposed.courses = nzqf.courses;
      proposed.degreeLevels = nzqf.degreeLevels;
      fieldEvidence.courses = { url: v.nzqf.url, note: `${nzqf.courses.length} of ${nzqf.totalAvailable} current NZQF qualifications (${v.nzqf.total} listed in total)`, sample: nzqf.courses.slice(0, 3), verified: nzqf.courses.slice(0, 20).every((c) => inPage(v.nzqf.page, c)) };
      fieldEvidence.degreeLevels = { url: v.nzqf.url, note: 'from NZQF qualification types (Bachelor Degree / Masters Degree / Doctorate / Diploma / Certificate)' };
    }
    if (f && fx) {
      const parts = [];
      if (f.master) { proposed.graduateTuitionUSD = Math.round(f.master.median * fx.rate); parts.push(`Master's NZD ${money(f.master.typicalLow)}–${money(f.master.typicalHigh)}`); }
      if (f.bachelor) { proposed.tuitionFeeUSD = Math.round(f.bachelor.median * fx.rate); parts.push(`Bachelor's NZD ${money(f.bachelor.typicalLow)}–${money(f.bachelor.typicalHigh)}`); }
      if (parts.length) {
        const excl = [...(f.master?.excludedFromRange || []), ...(f.bachelor?.excludedFromRange || [])].length ? '; excl. medicine/dentistry/vet/optometry/pilot training' : '';
        const usd = [f.master && `Master's ≈ US$${money(proposed.graduateTuitionUSD)}`, f.bachelor && `Bachelor's ≈ US$${money(proposed.tuitionFeeUSD)}`].filter(Boolean).join(', ');
        proposed.tuition = `${parts.join(' · ')} per year (international, ${f.year} estimates, typical range, approx.; medians ${usd}${excl}) — official university fee pages`;
        fieldEvidence.tuition = { urls: f.urls, year: f.year, fx, bachelor: f.bachelor, master: f.master };
      }
    }
    if (f && (!f.bachelor || !f.master)) uncertainties.push(`${entry.name}: ${!f.bachelor ? "Bachelor's" : ''}${!f.bachelor && !f.master ? ' and ' : ''}${!f.master ? "Master's" : ''} fee not verifiable from official pages this run${f.errors.length ? ` (${f.errors.join('; ')})` : ''}; left unchanged`);

    const officialSite = v.website?.proposed || null;
    row.website = officialSite;
    row.type = type;
    row.courses = proposed.courses?.length || 0;
    row.degreeLevels = proposed.degreeLevels || [];
    row.fees = proposed.tuition || null;
    row.feesUSD = proposed.tuitionFeeUSD || proposed.graduateTuitionUSD ? { bachelorMedianUSD: proposed.tuitionFeeUSD ?? null, masterMedianUSD: proposed.graduateTuitionUSD ?? null } : null;
    row.legalName = v.provider?.legalName || null;
    if (v.provider?.legalName === 'New Zealand Institute of Skills and Technology') row.note = 'NZQA still lists it under the legal entity New Zealand Institute of Skills and Technology (Te Pūkenga), trading as below';
    if (entry.brandOf) row.note = `brand of the same NZQA provider as ${byKey[entry.brandOf].name} (${v.provider?.legalName}); courses filtered to its tourism/aviation/hospitality qualifications`;

    // --- create (missing university)
    if (!keep.length) {
      if (entry.kind !== 'university') { row.decision = 'not in DB (not created)'; continue; }
      const fields = ['name', 'city', 'website', 'type', 'description', ...Object.keys(proposed)];
      const doc = {
        name: entry.name, country: nz._id, city: entry.city, website: officialSite,
        logo: officialSite ? `https://www.google.com/s2/favicons?domain=${officialSite.replace(/^https?:\/\//, '')}&sz=128` : null,
        type,
        description: `${entry.name} is a New Zealand university in ${entry.city}. It is listed on the NZQA register and is an approved signatory to the Education (Pastoral Care of Tertiary and International Learners) Code of Practice, so it can enrol international students.`,
        eligibility: null, categoryTags: [],
        tuition: proposed.tuition ?? null, tuitionFeeUSD: proposed.tuitionFeeUSD ?? null, graduateTuitionUSD: proposed.graduateTuitionUSD ?? null,
        // schema defaults would invent these — set explicitly to "unknown"
        minGpaPercent: null, minIeltsScore: null, minGreScore: null, greRequired: null, acceptanceRate: null,
        minScore: null, ieltsScore: null, greExam: null, workExp: null, scholarshipAvailable: null, rankingNum: null,
        courses: proposed.courses || [], degreeLevels: proposed.degreeLevels || [],
        isActive: true,
        dataSource: { provider: PROVIDER, urls: [...new Set([v.provider?.url, v.signatoryEvidence?.url, v.nzqf?.url, ...(f?.urls || [])].filter(Boolean))], syncedAt, fields, runId: RUN_ID, nzqaProviderId: entry.nzqaId, fx, feeYear: f?.year },
        createdAt: syncedAt, updatedAt: syncedAt,
      };
      creates.push({ name: entry.name, doc, evidence: [...evidenceFor(v), { what: 'courses', ...fieldEvidence.courses }, { what: 'tuition', ...fieldEvidence.tuition }] });
      row.decision = 'create';
      continue;
    }

    // --- update kept record
    const doc = keep[0];
    const diff = {};
    const nameOk = norm(doc.name).includes(norm(entry.name));
    if (!nameOk) diff.name = { from: doc.name, to: entry.name };
    if (officialSite && regDomain(doc.website) !== regDomain(officialSite)) diff.website = { from: doc.website, to: officialSite };
    if (diff.website && doc.logo) diff.logo = { from: doc.logo, to: `https://www.google.com/s2/favicons?domain=${officialSite.replace(/^https?:\/\//, '')}&sz=128` };
    if (String(doc.type || '').toUpperCase() !== type) diff.type = { from: doc.type, to: type };
    if (!doc.city && entry.city) diff.city = { from: doc.city, to: entry.city };
    for (const [k, val] of Object.entries(proposed)) {
      if (JSON.stringify(doc[k]) !== JSON.stringify(val)) diff[k] = { from: doc[k], to: val };
    }
    if (diff.name && ours.some((o) => o !== doc && o.name === diff.name.to && o.city === doc.city)) {
      uncertainties.push(`${doc.name}: rename to "${diff.name.to}" would clash with the unique index; rename skipped`);
      delete diff.name;
    }
    row.decision = Object.keys(diff).length ? 'keep + update' : 'keep (no change)';
    row.dbName = doc.name;
    if (Object.keys(diff).length) {
      const dataSource = {
        provider: PROVIDER,
        urls: [...new Set([v.provider?.url, v.signatoryEvidence?.url, diff.courses || diff.degreeLevels ? v.nzqf?.url : null, ...(diff.tuition || diff.tuitionFeeUSD || diff.graduateTuitionUSD ? f?.urls || [] : [])].filter(Boolean))],
        syncedAt, fields: Object.keys(diff), runId: RUN_ID, nzqaProviderId: entry.nzqaId,
        ...(diff.tuition ? { fx, feeYear: f.year } : {}),
      };
      diff.dataSource = { from: doc.dataSource, to: dataSource };
      const ev = evidenceFor(v);
      if (diff.website) ev.push({ what: 'official website check', url: v.website.listed, quote: v.website.title ? `${v.website.finalUrl} — ${v.website.title}` : v.website.check, verified: Boolean(v.website.title) });
      if (fieldEvidence.courses) ev.push({ what: 'courses', ...fieldEvidence.courses });
      if (fieldEvidence.tuition) ev.push({ what: 'tuition', ...fieldEvidence.tuition });
      changes.push({ id: String(doc._id), name: doc.name, action: 'update', diff, evidence: ev });
    }
  }

  // 6) Flags for the reviewer (nothing is changed for these)
  const kindOf = (u) => REGISTRY.find((e) => findDb(e).some((d) => d._id.equals(u._id)))?.kind;
  const fakeRankings = ours.filter((u) => kindOf(u) !== 'university' && (u.rankingNum != null || u.rank))
    .map((u) => ({ name: u.name, rankingNum: u.rankingNum, rank: u.rank, why: 'QS World University Rankings only rank universities; this is not a university' }));
  const DEFAULTISH = { minIeltsScore: 6.5, minGpaPercent: 60, ieltsScore: 'IELTS 6.0+', minScore: 'GPA 3.0+', greExam: 'GRE Waived', workExp: 'Freshers Eligible', scholarshipAvailable: true };
  const deactivatedIds = new Set(changes.filter((c) => c.action === 'deactivate').map((c) => c.id));
  const unverifiedFields = ours.filter((u) => !deactivatedIds.has(String(u._id))).map((u) => {
    const fields = Object.entries(DEFAULTISH).filter(([k, val]) => u[k] === val).map(([k]) => k);
    if (u.acceptanceRate != null) fields.push('acceptanceRate');
    const uniFees = kindOf(u) === 'university';
    if (!uniFees && (u.tuitionFeeUSD != null || u.tuition)) fields.push('tuitionFeeUSD/tuition (template-like values, no official source checked)');
    return { name: u.name, fields, current: { tuition: u.tuition, tuitionFeeUSD: u.tuitionFeeUSD, acceptanceRate: u.acceptanceRate, minIeltsScore: u.minIeltsScore, minGpaPercent: u.minGpaPercent } };
  }).filter((x) => x.fields.length);
  const unmatched = ours.filter((u) => !matchedIds.has(String(u._id))).map((u) => u.name);
  const registryIds = new Set(REGISTRY.map((e) => e.nzqaId).filter(Boolean));
  const LEGACY = new Set(['668369001', '604421001']); // Te Pūkenga national entity + its work-based learning divisions
  const candidatesNotInDb = [...typeSearch.POLLY.Y.providers.entries()].filter(([id]) => !registryIds.has(id) && !LEGACY.has(id))
    .map(([id, names]) => ({ nzqaProviderId: id, names: [...names].slice(0, 3), url: `${NZQA}/providers/details.do?providerId=${id}`, note: 'Code-signatory polytechnic on NZQA, not in our DB (not created by this script)' }));

  const count = (f) => changes.filter((c) => c.diff[f]).length;
  const summary = {
    runId: RUN_ID, mode: APPLY ? 'apply' : 'dry-run', ourNewZealandRecords: ours.length,
    creates: creates.length, updates: changes.filter((c) => c.action === 'update').length,
    deactivations: changes.filter((c) => c.action === 'deactivate').length,
    unchanged: institutions.filter((i) => i.decision === 'keep (no change)').length,
    fieldsChanged: Object.fromEntries(['name', 'website', 'type', 'courses', 'degreeLevels', 'tuition', 'tuitionFeeUSD', 'graduateTuitionUSD', 'isActive'].map((f) => [f, count(f)])),
    unmatchedDbRecords: unmatched, verificationProblems: errors, requests: counters, fx,
  };

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, `newzealand-sync-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`);
  const feeReport = Object.fromEntries(Object.entries(fees).map(([k, f]) => [k, { ...f, rows: f.rows.map((r) => ({ ...r })) }]));
  const report = {
    summary, runId: RUN_ID, generatedAt: syncedAt, codeOfPracticeRule: codeRule, institutions,
    creates, changes, fees: feeReport, fakeRankings, unverifiedFields, candidatesNotInDb, uncertainties, methodNotes: METHOD_NOTES,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(JSON.stringify({ ...summary, requests: counters }, null, 2));
  console.table(institutions.map((i) => ({ institution: i.dbName || i.dbRecords[0] || i.name, decision: i.decision, website: i.website || '', type: i.type || '', courses: i.courses ?? '', usd: i.feesUSD ? `${i.feesUSD.bachelorMedianUSD ?? '-'} / ${i.feesUSD.masterMedianUSD ?? '-'}` : '' })));
  console.log(`full report: ${reportPath}`);

  if (APPLY) {
    const col = db.collection('universities');
    let written = 0;
    for (const c of changes) {
      const set = {};
      for (const [k, val] of Object.entries(c.diff)) set[k] = val.to;
      set.updatedAt = new Date();
      await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id) }, { $set: set });
      written += 1;
    }
    for (const c of creates) {
      const clash = await col.findOne({ name: c.doc.name, country: c.doc.country, city: c.doc.city });
      if (clash) { c.skipped = 'a record with the same name/country/city exists'; continue; }
      const r = await col.insertOne(c.doc);
      c.insertedId = String(r.insertedId);
    }
    report.appliedAt = new Date();
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`APPLIED: ${written} updated/deactivated, ${creates.filter((c) => c.insertedId).length} created (revert: --revert ${reportPath})`);
  }
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('FAILED:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
