/**
 * Sync Singapore universities with official sources only:
 *   - MOE Singapore: the 6 autonomous universities (AUs), their official one-line descriptions and websites,
 *     and the Tuition Grant bond rule
 *   - data.gov.sg Graduate Employment Survey (GES): official Bachelor's programme names per AU
 *   - each AU's own fee schedule / programme listing pages (fees for international students WITHOUT the
 *     MOE Tuition Grant, Master's/PhD programme names)
 *   - SkillsFuture Singapore (SSG) register of private education institutions (TPGateway): registration,
 *     EduTrust status, website and every permitted degree course with its awarding university
 *
 *   node scripts/dataSync/singaporeSync.js                  # DRY RUN: fetch + match + report, writes nothing
 *   node scripts/dataSync/singaporeSync.js --apply          # write the changes from this run (read the dry-run
 *                                                           # report first; nothing is asked)
 *   node scripts/dataSync/singaporeSync.js --revert <report.json>   # undo an applied run (report of that run)
 *   option: --no-cache   refetch everything (pages are otherwise cached 24h in the OS temp dir, which keeps the
 *                        scrape.do budget low when the dry run is repeated)
 *
 * Needs MONGO_URI in backend/.env. SCRAPE_DO_TOKEN is used only for pages that block direct requests
 * (SMU, SIT, SUSS sites; ~5 requests per uncached run, hard cap MAX_SCRAPE_DO). PDF sources need `pdftotext`
 * (poppler; ships with Git for Windows, `apt install poppler-utils` on Linux); without it those values stay null.
 *
 * Rules: every proposed value comes from one of the sources above; values read from a page are kept only if
 * their verbatim quote is found in that page's text (report → evidence). Anything not verifiable is null.
 * New records get every schema default that would invent data (tuitionFeeUSD 25000, IELTS 6.5, GPA 60,
 * acceptanceRate 66%, rankingNum 500, default course list, ...) explicitly set to the official value or null.
 * Ranking fields (rank, rankingNum, rankingSource) are never touched. Records that are not eligible
 * institutions are hidden with isActive:false, never deleted. --revert deletes only documents that this
 * script itself inserted (matched by _id AND dataSource.createdBySync).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const APPLY = process.argv.includes('--apply');
const NO_CACHE = process.argv.includes('--no-cache');
const SYNC_ID = 'singaporeSync';
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');
const CACHE_DIR = path.join(os.tmpdir(), 'unicoach-datasync-cache', 'singapore');
const CACHE_TTL_MS = 24 * 3600 * 1000;
const MAX_SCRAPE_DO = 12; // per run; the scrape.do plan is shared with other jobs
const MAX_COURSES = 200;
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 UniCoach-DataSync/1.0',
  'Accept-Language': 'en-SG,en;q=0.9',
};

// ---- Official sources ----
const MOE_AU_URL = 'https://www.moe.gov.sg/post-secondary/overview/autonomous-universities';
const MOE_TG_URL = 'https://www.moe.gov.sg/financial-matters/tuition-grant-scheme';
const GES_DATASET = 'd_3c55210de27fcccda2ed0c63fdd2b352';
const GES_API = `https://data.gov.sg/api/action/datastore_search?resource_id=${GES_DATASET}&limit=10000`;
const GES_PAGE = `https://data.gov.sg/datasets/${GES_DATASET}/view`;
const SSG_API = 'https://www.tpgateway.gov.sg/internal/TPportal/trainingpartners/SSGContentInterface/pei/';
const SSG_PAGE = 'https://www.tpgateway.gov.sg/resources/information-for-private-education-institutions-(peis)/pei-listing';
const SSG_FAQ = 'https://www.tpgateway.gov.sg/faq/private-education-institutions';

// Per-AU official pages. Each parser receives the page text (and cheerio for HTML) and returns verifiable data.
const AU_SOURCES = {
  NUS: {
    fees: { url: 'https://www.nus.edu.sg/registrar/docs/default-source/administrative-policies-procedures/ugtuitioncurrent.pdf', pdf: true, parse: (s) => parseNusFees(s) },
    lists: [{ url: 'https://www.nus.edu.sg/registrar/docs/info/administrative-policies-procedures/self-funded-graduate-programmes.pdf', pdf: true, parse: (s) => parseNumberedProgrammeList(s) }],
  },
  NTU: {
    fees: { url: 'https://www.ntu.edu.sg/admissions/undergraduate/fees-and-funding/tuition-fees/accepted-programme-offer-in-2026', parse: (s) => parseNtuFees(s) },
    lists: [
      { url: 'https://www.ntu.edu.sg/media/docs/default-source/graduate-admissions/coursework/fees/courseworknonsubidisedfees.pdf', pdf: true, parse: (s) => parseNtuGraduateList(s) },
      { url: 'https://www.ntu.edu.sg/media/docs/default-source/graduate-admissions/coursework/fees/ay2026-2027coursework-fees.pdf', pdf: true, parse: (s) => levelEvidence(s, [['PhD', /combination of Masters and PhD candidature/]]) },
    ],
  },
  SMU: {
    fees: { url: 'https://admissions.smu.edu.sg/financial-matters/tuition-fees-grant', parse: (s) => parseSmuFees(s) },
    lists: [{ url: 'https://www.smu.edu.sg/education/postgraduates', parse: (s) => parseProgrammeElements(s) }],
  },
  SUTD: {
    fees: { url: 'https://www.sutd.edu.sg/admissions/undergraduate/education-expenses/fees/tuition-fees/', parse: (s) => parseSutdFees(s) },
    lists: [
      { url: 'https://www.sutd.edu.sg/admissions/graduate/', parse: (s) => parseProgrammeElements(s) },
      { url: 'https://www.sutd.edu.sg/admissions/graduate/phd/financing/fees/', parse: (s) => levelEvidence(s, [['PhD', /combination of Masters and PhD candidature/]]) },
    ],
  },
  SIT: {
    fees: { url: 'https://www.singaporetech.edu.sg/sites/default/files/2026-03/SIT_Undergraduate_Tuition%20Fees_AY2026_1.pdf', pdf: true, parse: (s) => parseSitFees(s) },
    lists: [{ url: 'https://www.singaporetech.edu.sg/admissions/postgraduate', parse: (s) => parseProgrammeElements(s) }],
  },
  SUSS: {
    fees: { url: 'https://www.suss.edu.sg/full-time-undergraduate/admissions/tuition-fees', parse: (s) => parseSussFees(s) },
    lists: [{ url: 'https://www.suss.edu.sg/academics/programmes/graduate-programmes/programmes', parse: (s) => parseProgrammeElements(s) }],
  },
};

// Private institutions popular with Indian students, checked against the SSG register by registration number
// (UEN). Each is proposed only if it passes PEI_RULES; the others land in the report's "excluded" list.
const PEI_CANDIDATES = [
  { regNo: '199607747H', query: 'SINGAPORE INSTITUTE OF MANAGEMENT' },
  { regNo: '200704825E', query: 'PSB ACADEMY' },
  { regNo: '199409389H', query: 'KAPLAN HIGHER EDUCATION ACADEMY' },
  { regNo: '200100786K', query: 'JAMES COOK UNIVERSITY' },
  { regNo: '201001793H', query: 'MANAGEMENT DEVELOPMENT INSTITUTE OF SINGAPORE' },
  // Registered as "Curtin Education Centre"; its official site calls itself "Curtin Singapore" (verified at run time)
  { regNo: '200804822R', query: 'CURTIN EDUCATION CENTRE', tradingName: { name: 'Curtin Singapore', url: 'https://www.curtin.edu.sg/' } },
  { regNo: '200606974C', query: 'AMITY GLOBAL INSTITUTE' },
  { regNo: '200516544Z', query: 'S P JAIN SCHOOL OF GLOBAL MANAGEMENT' },
];
const FULL_EDUTRUST = ['EduTrust Star 4-Year award', 'EduTrust 4-Year award'];
const PEI_RULES = 'active SSG registration + active full EduTrust award (4-Year or Star; Provisional is not enough) '
  + '+ at least one Bachelor\'s or Master\'s course that is not in teach-out';

// Schema defaults that would invent data on a record (see models/University.js). Cleared on new records
// and on existing Singapore records whose value is still exactly the default.
const FABRICATING_DEFAULTS = {
  minGpaPercent: 60, minIeltsScore: 6.5, minGreScore: 0, greRequired: false, acceptanceRate: '66%',
  minScore: 'GPA 3.0+', ieltsScore: 'IELTS 6.0+', greExam: 'GRE Waived', workExp: 'Freshers Eligible',
  scholarshipAvailable: true,
};
const DEFAULT_COURSES = ['Computer Science', 'Data Science', 'Business Analytics', 'MBA', 'Software Engineering', 'Finance', 'Mechanical Engineering'];

const stats = { directRequests: 0, scrapeDoRequests: 0, cacheHits: 0 };
const fetchLog = [];

// ---------------------------------------------------------------- helpers
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9.]+/g, ' ').trim();
const money = (n, sym = 'US$') => `${sym}${Math.round(n).toLocaleString('en-US')}`;
const num = (s) => {
  const n = Number(String(s || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};
const regDomain = (url) => {
  const host = String(url || '').toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '');
  const parts = host.split('.').filter(Boolean);
  const multi = parts.length >= 3 && /^(edu|com|org|gov|ac|net)$/.test(parts[parts.length - 2]) && parts[parts.length - 1].length === 2;
  return parts.slice(multi ? -3 : -2).join('.');
};
const normName = (s) => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/\bthe\b/g, ' ')
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const today = new Date();
const parseUsDate = (s) => { // SSG API dates: "7/7/2027 12:00:00 AM"
  const m = String(s || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return m ? new Date(Date.UTC(+m[3], +m[1] - 1, +m[2])) : null;
};
const isoDay = (d) => (d ? d.toISOString().slice(0, 10) : null);

function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

function weightedMedian(items) {
  const s = items.filter((i) => i.value > 0).sort((a, b) => a.value - b.value);
  if (!s.length) return null;
  const total = s.reduce((t, i) => t + (i.weight || 1), 0);
  let acc = 0;
  for (let k = 0; k < s.length; k += 1) {
    acc += s[k].weight || 1;
    if (acc === total / 2 && s[k + 1]) return (s[k].value + s[k + 1].value) / 2;
    if (acc > total / 2 || acc === total) return s[k].value;
  }
  return s[s.length - 1].value;
}

// A value read from a page is accepted only if its quote is really in that page
function makeSource(url, text, via) {
  const normalised = norm(text);
  return { url, text, via, has: (quote) => Boolean(quote) && normalised.includes(norm(quote)) };
}
function quoted(source, quote, extra = {}) {
  if (!source.has(quote)) return null;
  return { url: source.url, quote: String(quote).replace(/\s+/g, ' ').trim(), ...extra };
}

// ---------------------------------------------------------------- fetching (direct first, scrape.do only if blocked)
function looksBlocked(buf, pdf) {
  if (pdf) return buf.subarray(0, 5).toString('latin1') !== '%PDF-';
  const head = buf.subarray(0, 6000).toString('utf8');
  return (buf.length < 6000 && /_Incapsula_|Incapsula incident|cf-browser-verification|captcha/i.test(head))
    || /<title>\s*(Just a moment|Attention Required)/i.test(head);
}

async function fetchSource(url, { pdf = false, post = null } = {}) {
  const key = sha1(url + (post ? JSON.stringify(post) : ''));
  const file = path.join(CACHE_DIR, key);
  if (!NO_CACHE && fs.existsSync(file) && fs.existsSync(`${file}.json`)
    && Date.now() - fs.statSync(file).mtimeMs < CACHE_TTL_MS) {
    stats.cacheHits += 1;
    const meta = JSON.parse(fs.readFileSync(`${file}.json`, 'utf8'));
    fetchLog.push({ url, via: `${meta.via} (cached ${meta.fetchedAt})` });
    return { body: fs.readFileSync(file), via: meta.via };
  }
  let body = null;
  let via = 'direct';
  let why = '';
  try {
    stats.directRequests += 1;
    const res = await fetch(url, {
      method: post ? 'POST' : 'GET',
      headers: post ? { ...BROWSER_HEADERS, 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' } : BROWSER_HEADERS,
      body: post ? new URLSearchParams(post) : undefined,
      signal: AbortSignal.timeout(60000),
    });
    const buf = Buffer.from(await res.arrayBuffer());
    if (res.ok && !looksBlocked(buf, pdf)) body = buf;
    else why = res.ok ? 'bot challenge page' : `HTTP ${res.status}`;
  } catch (err) {
    why = err.name === 'TimeoutError' ? 'timeout' : 'network error';
  }
  if (!body && !post) {
    const token = process.env.SCRAPE_DO_TOKEN;
    if (!token) throw new Error(`${url}: ${why} and SCRAPE_DO_TOKEN is not set`);
    if (stats.scrapeDoRequests >= MAX_SCRAPE_DO) throw new Error(`${url}: ${why}; scrape.do per-run cap (${MAX_SCRAPE_DO}) reached`);
    stats.scrapeDoRequests += 1;
    let res;
    try {
      res = await fetch(`https://api.scrape.do/?token=${encodeURIComponent(token)}&url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(120000) });
    } catch (_) {
      throw new Error(`${url}: ${why}; scrape.do request failed`); // never echo the proxy URL (contains the token)
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (!res.ok || looksBlocked(buf, pdf)) throw new Error(`${url}: ${why}; scrape.do returned HTTP ${res.status}`);
    body = buf;
    via = 'scrape.do';
  }
  if (!body) throw new Error(`${url}: ${why}`);
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(file, body);
  fs.writeFileSync(`${file}.json`, JSON.stringify({ url, via, fetchedAt: new Date().toISOString() }));
  fetchLog.push({ url, via });
  return { body, via };
}

function pdfToText(buf) {
  const tmp = path.join(os.tmpdir(), `unicoach-sg-${process.pid}-${Date.now()}.pdf`);
  fs.writeFileSync(tmp, buf);
  try {
    return execFileSync('pdftotext', ['-raw', '-enc', 'UTF-8', tmp, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (err) {
    throw new Error(err.code === 'ENOENT' ? 'pdftotext is not installed (poppler-utils; included in Git for Windows)' : 'pdftotext could not read the PDF');
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

// Returns { url, text, via, has(), $ (HTML only), raw (PDF text with line breaks) }
async function loadPage(url, { pdf = false } = {}) {
  const { body, via } = await fetchSource(url, { pdf });
  if (pdf) {
    const raw = pdfToText(body);
    return { ...makeSource(url, raw, via), raw };
  }
  const $ = cheerio.load(body.toString('utf8'));
  $('script,style,noscript,svg,template').remove();
  // Block elements and table cells are glued together by .text() ("yearS$13,500"); separate them
  $('td,th,tr,li,p,div,h1,h2,h3,h4,h5,h6,br,section,article,table,dt,dd').after(' ');
  return { ...makeSource(url, $('body').text().replace(/\s+/g, ' '), via), $ };
}

async function fxSgdUsd() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=SGD&to=USD', { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(30000) });
    const j = await res.json();
    if (j?.rates?.USD) return { rate: j.rates.USD, date: j.date, source: 'https://api.frankfurter.app (ECB reference rate)' };
  } catch (_) { /* no fallback rate: USD values stay null rather than guessed */ }
  return { rate: null, date: null, source: 'unavailable' };
}

// ---------------------------------------------------------------- course-name helpers
const SMALL_WORDS = new Set(['of', 'in', 'and', 'with', 'the', 'for', 'a', 'an', 'to', 'on', 'at', 'by', 'or']);
const ACRONYMS = {
  MBA: 'MBA', MSC: 'MSc', BSC: 'BSc', BA: 'BA', IT: 'IT', AI: 'AI', HR: 'HR', UK: 'UK', USA: 'USA', ICT: 'ICT', TESOL: 'TESOL',
  PHD: 'PhD', LLB: 'LLB', LLM: 'LLM', BENG: 'BEng', MENG: 'MEng', BBA: 'BBA', DBA: 'DBA', MA: 'MA', MS: 'MS', MFA: 'MFA',
  BFA: 'BFA', OTHM: 'OTHM', STEM: 'STEM', UX: 'UX', IOT: 'IoT', II: 'II', III: 'III', HRM: 'HRM', IC: 'IC', BIM: 'BIM',
  PSB: 'PSB', SIM: 'SIM', MDIS: 'MDIS', JCU: 'JCU', RMIT: 'RMIT', ACCA: 'ACCA', CIMA: 'CIMA', CPA: 'CPA', ICAEW: 'ICAEW',
  LSBF: 'LSBF', UOW: 'UOW', BSBA: 'BSBA', MSBA: 'MSBA', SCM: 'SCM', VFX: 'VFX', '3D': '3D',
};
function titleCaseIfShouting(s) {
  if (/[a-z]/.test(s)) return s; // already mixed case: keep the register's spelling
  let first = true;
  return s.replace(/[A-Za-z][A-Za-z']*/g, (w) => {
    const out = ACRONYMS[w] || (!first && SMALL_WORDS.has(w.toLowerCase()) ? w.toLowerCase() : w[0] + w.slice(1).toLowerCase());
    first = false;
    return out;
  });
}
const courseKey = (s) => norm(s).replace(/\b(with honours|honours|hons)\b/g, ' ').replace(/\s+/g, ' ').trim();
const stripCjk = (s) => String(s).replace(/[⺀-鿿豈-﫿＀-￯].*$/, '').trim();

function classifyLevel(name) {
  if (/^Bachelor/i.test(name)) return "Bachelor's";
  if (/Doctor of Philosophy|\bPhD\b/i.test(name)) return 'PhD';
  if (/^Juris Doctor/i.test(name)) return null; // graduate law degree; not used as level evidence
  if (/^(Doctor|Doctorate)\b/i.test(name)) return 'Doctorate';
  if (/^(Master|Executive Master|M\.Sc\.|MSc\b|M\.A\.|M\.Comp\.|MiM\b|eMSc|EMBA|IMBA|Executive MBA|The Nanyang MBA|Nanyang .*MBA|NTU-Warwick)/i.test(name)) return "Master's";
  return null;
}
const LEVEL_ORDER = ["Bachelor's", "Master's", 'PhD', 'Doctorate'];

// GES degree labels carry survey footnote markers (#, ^, *, trailing digits) and honours sub-rows
function cleanGesDegree(degree) {
  let d = String(degree || '').replace(/�/g, ' ');
  d = d.replace(/\s*-\s*Cum Laude and above.*$/i, '');
  if (!d.trim() || /^Cum Laude/i.test(d.trim()) || /^School of /i.test(d.trim())) return null;
  d = d.replace(/[#^*]+/g, ' ').replace(/([a-z)])\d+\b/g, '$1').replace(/\s+/g, ' ').trim();
  return d || null;
}

function addCourses(target, names, { skipIfContained = false } = {}) {
  for (const raw of names) {
    const name = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!name) continue;
    const key = courseKey(name);
    if (!key || target.keys.has(key)) continue;
    if (skipIfContained && [...target.keys].some((k) => k.includes(key))) continue;
    target.keys.add(key);
    target.list.push(name);
  }
}

// ---------------------------------------------------------------- AU page parsers (all quotes verified by caller)
function parseNusFees(src) {
  const lines = src.raw.split(/\r?\n/).map((l) => l.trim());
  const start = lines.findIndex((l) => /^A\) For new students admitted in AY\d{4}\/\d{4}/.test(l));
  if (start === -1) throw new Error('NUS: "For new students admitted" section not found');
  const cohort = lines[start].match(/AY(\d{4}\/\d{4})/)[1];
  const header = 'students NOT in receipt of MOE Tuition Grant';
  const rows = [];
  let pending = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const l = lines[i];
    if (/^(Special Term Fees|B\) For existing|Page \d+ of)/.test(l)) { if (rows.length) break; else continue; }
    const m = l.match(/^(.*?)\s*((?:[\d,]+\s+){4}[\d,]+)$/);
    if (m && /\d{1,3},\d{3}/.test(m[2])) {
      const label = [...pending, m[1]].join(' ').replace(/\d+(,\d+)*/g, '').replace(/\s+/g, ' ').trim();
      const vals = m[2].trim().split(/\s+/).map(num);
      if (label && vals.length === 5) rows.push({ label, nonSubsidised: vals[4], quote: [...pending, l].join(' ') });
      pending = [];
    } else if (/^[A-Z][A-Za-z ,()&\d-]*$/.test(l) && !/^(S\$|Per annum|Fees payable|College|Singapore|International|Residents|Citizens|Permanent|ASEAN|Tuition|GST|students|receipt|\(Tier|\(Inclusive)/.test(l)) {
      pending.push(l);
    } else pending = [];
  }
  return {
    cohort: `AY${cohort} intake`,
    header,
    items: rows.map((r) => ({ label: r.label, sgd: r.nonSubsidised, weight: 1, quote: r.quote })),
    perYear: true,
    note: 'median of the per-faculty annual fees',
  };
}

function tableRows($, table) {
  return $(table).find('tr').map((_, tr) => [$(tr).find('th,td').map((__, c) => $(c).text().replace(/\s+/g, ' ').trim()).get()]).get();
}

function parseNtuFees(src) {
  const { $ } = src;
  const table = $('table').filter((_, t) => /Non-Subsidised/i.test($(t).text()) && /not receiving tuition grant/i.test($(t).text())).first();
  if (!table.length) throw new Error('NTU: non-subsidised fee table not found');
  const items = [];
  for (const cells of tableRows($, table)) {
    const values = cells.slice(1).map((c) => (/^\$\s?[\d,]+$/.test(c) ? num(c) : null));
    if (values.filter(Boolean).length < 4) continue;
    const nonSub = values.slice(4).filter(Boolean); // after SC, PR, ASEAN IS, All other IS (subsidised)
    for (const v of nonSub) items.push({ label: cells[0], sgd: v, weight: 1, quote: cells.join(' ') });
  }
  const cohort = src.has('Annual tuition fee is fixed at the 2026 rate') ? '2026 intake' : 'current intake';
  return { cohort, header: 'Non-Subsidised Students2(not receiving tuition grant)(inclusive of GST)', items, perYear: true, note: 'median of the non-subsidised annual rates (lab / non-lab / business programmes)' };
}

function parseSmuFees(src) {
  const { $ } = src;
  const tables = $('table').filter((_, t) => /Non-\s?Subsidised/i.test($(t).text()));
  const items = [];
  const bachelorNames = [];
  tables.each((_, t) => {
    if (items.length) return; // first table = annual fees (the next one is per-course Special Term fees)
    for (const cells of tableRows($, t)) {
      if (cells.length < 6 || !/Bachelor of/.test(cells[0])) continue;
      const nonSub = num(cells[cells.length - 1]);
      if (!nonSub || nonSub < 10000) continue;
      const degrees = cells[0].split(/(?=Bachelor of)/).map((d) => d.trim()).filter(Boolean);
      bachelorNames.push(...degrees);
      items.push({ label: degrees.join(', '), sgd: nonSub, weight: degrees.length, quote: cells.join(' ') });
    }
  });
  const cohortQuote = 'AY2026/27 entering freshmen who are not eligible for or choose not to apply for a Tuition Grant are required to pay the non-subsidised fees';
  return { cohort: src.has(cohortQuote) ? 'AY2026/27 intake' : 'current intake', header: 'Annual Non- Subsidised Fees (Inclusive of GST)', extraQuote: cohortQuote, items, perYear: true, bachelorNames, note: 'weighted by the number of degrees each rate applies to' };
}

function parseSutdFees(src) {
  const { $ } = src;
  let found = null;
  $('table').each((_, t) => {
    if (found) return;
    let el = $(t);
    for (let k = 0; k < 6; k += 1) {
      el = el.parent();
      if (!el.length) break;
      const ctx = el.clone().find('table').remove().end().text().replace(/\s+/g, ' ');
      const m = ctx.match(/Tuition fees for new students admitted in AY(\d{4}) are as follows/);
      if (m) { found = { table: t, ay: m[1], quote: m[0] }; break; }
      if (/admitted in AY\d{4}/.test(ctx)) break; // belongs to an existing-students table
    }
  });
  if (!found) throw new Error('SUTD: table for new students not found');
  const row = tableRows($, found.table).find((cells) => /^Per academic year$/i.test(cells[0]));
  if (!row) throw new Error('SUTD: "Per academic year" row not found');
  return { cohort: `AY${found.ay} intake`, header: 'Non-Subsidised Fee (Inclusive of GST)', extraQuote: found.quote, items: [{ label: 'All programmes', sgd: num(row[row.length - 1]), weight: 1, quote: row.join(' ') }], perYear: true, note: 'single rate for all programmes' };
}

function parseSitFees(src) {
  const lines = src.raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const ROW = /^(.*?)\s*(\d{2,3}) S\$([\d,.]+) S\$([\d,.]+) S\$([\d,.]+) S\$([\d,.]+) \$([\d,.]+)$/;
  const HEADER = /^(Page \d+ of \d+|Cohort Undergraduate Fees|Total|Credits|Subsidised Fees.*|Non-Subsidised|Fees \(Per Credit\)|\(SC, PR, IS\).*|Singapore|Citizens.*|Permanent|Residents.*|International|Students \(IS\)|\(ASEAN\).*|\(Non-ASEAN\).*)$/;
  const items = [];
  let acc = [];
  for (const l of lines) {
    if (HEADER.test(l)) continue;
    if (/Joint Degree Programme$|Overseas Universities Programme$|^SIT Degree Programmes$/.test(l)) { acc = []; continue; }
    const m = l.match(ROW);
    if (m) {
      const name = [...acc, m[1]].join(' ').replace(/\s+/g, ' ').trim();
      if (/^Bachelor/.test(name)) items.push({ label: name, credits: +m[2], perCredit: num(m[7]), quote: `${name} ${l.slice(m[1].length).trim()}` });
      acc = [];
    } else if (/^Bachelor/.test(l)) acc = [l];
    else if (acc.length) acc.push(l);
  }
  const cohortQuote = 'Programme Fees for students admitted in Academic Year 2026';
  return {
    cohort: src.has(cohortQuote) ? 'AY2026 intake' : 'current intake',
    header: 'Non-Subsidised Fees (Per Credit)',
    extraQuote: src.has(cohortQuote) ? cohortQuote : null,
    perCredit: items,
    perYear: false,
    bachelorNames: items.map((i) => i.label),
    note: 'SIT charges per credit; the pages do not state an annual credit load, so no per-year figure is derived',
  };
}

function parseSussFees(src) {
  const { $ } = src;
  const table = $('table').filter((_, t) => /Estimated Total Fees Per Programme/i.test($(t).text())).first();
  if (!table.length) throw new Error('SUSS: programme fee table not found');
  const header = $(table).text().replace(/\s+/g, ' ').match(/Estimated Total Fees Per Programme \(For (\d+) Years\)/);
  if (!header) throw new Error('SUSS: programme length not stated');
  const years = Number(header[1]);
  const items = [];
  for (const cells of tableRows($, table)) {
    if (cells.length < 6) continue;
    const total = num(cells[cells.length - 1]);
    if (!total || total < 10000) continue;
    items.push({ label: cells[0], sgd: total / years, total, weight: 1, quote: cells.join(' ') });
  }
  const ay = (src.text.match(/Full-time Undergraduate Programmes & Courses\W{0,3}Academic Year (\d{4})/) || [])[1];
  return {
    cohort: ay ? `Academic Year ${ay}` : 'current intake', header: header[0], extraQuote: 'Unsubsidised(Not receiving tuition grant; inclusive of prevailing GST)',
    items, perYear: true, derived: `estimated ${years}-year programme total ÷ ${years}`, bachelorNames: items.map((i) => i.label),
    note: `per-year = official estimated ${years}-year total ÷ ${years}`,
  };
}

// NUS "Self-Funded Graduate Programmes" list: numbered items, some historical / renamed / not yet started
function parseNumberedProgrammeList(src) {
  const items = [];
  let cur = null;
  for (const line of src.raw.split(/\r?\n/).map((l) => l.trim())) {
    const m = line.match(/^(\d{1,3})\.\s+(.*)$/);
    if (m) { if (cur) items.push(cur); cur = m[2]; continue; }
    if (!cur || !line || /^\d+$/.test(line) || /^While the list/.test(line)) continue;
    cur += ` ${line}`;
  }
  if (cur) items.push(cur);
  const acadYear = today.getUTCMonth() >= 6 ? today.getUTCFullYear() : today.getUTCFullYear() - 1;
  const asAt = (src.text.match(/\(as at [^)]+\)/) || [null])[0];
  const programmes = [];
  for (const item of items) {
    if (!/^(Master|Executive Master|Doctor|Juris Doctor)/.test(item)) continue; // skips graduate diplomas and joint/double-degree bundles
    if (/intakes prior to|intakes from AY\d{4}\/\d{2} to|only graduated|applicable to intakes from|\(renamed as/i.test(item)) continue;
    const eff = item.match(/with effect(?: from)?(?: Semester \d,)? AY(\d{4})/i);
    if (eff && Number(eff[1]) > acadYear) continue; // not started yet
    let name = item.split(/\s*\((?:with effect|renamed from|self-funded|effective for|intakes)/i)[0];
    name = name.split(/,\s*including/i)[0].trim();
    if ((name.match(/\(/g) || []).length !== (name.match(/\)/g) || []).length) continue;
    if (src.has(name)) programmes.push({ name, level: classifyLevel(name) });
  }
  return { programmes, listDate: asAt };
}

// NTU "Non-subsidised programmes" list (dated): programme lines followed by "Click Here"
function parseNtuGraduateList(src) {
  const lines = src.raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const PROG = /^(M\.Sc\.|M\.A\.|M\.Comp\.|Master|MiM|EMBA|IMBA|eMSc|The Nanyang MBA|Nanyang .*MBA|NTU-Warwick)/;
  const out = [];
  let acc = null;
  const flush = () => { if (acc) out.push(acc.replace(/\s*Click Here\s*$/i, '').trim()); acc = null; };
  for (const l of lines) {
    if (PROG.test(l)) { flush(); acc = l; if (/Click Here$/i.test(l)) flush(); continue; }
    if (!acc) continue;
    if (/^Click Here$/i.test(l) || (!/[a-z]/.test(l) && /^[A-Z ,&()'.-]{6,}$/.test(l))) { flush(); continue; }
    acc += ` ${l}`;
    if (/Click Here$/i.test(l)) flush();
  }
  flush();
  const dated = (src.text.match(/Dated: \d{1,2} [A-Za-z]+ \d{4}/) || [null])[0];
  const programmes = out.map((n) => n.replace(/�/g, '-').replace(/\s+/g, ' ').trim())
    .filter((n) => src.has(n)).map((name) => ({ name, level: classifyLevel(name) }));
  return { programmes, listDate: dated };
}

// Generic: elements whose own text is a programme name (SMU / SIT / SUSS / SUTD listing pages)
function parseProgrammeElements(src) {
  const { $ } = src;
  const seen = new Set();
  const programmes = [];
  $('header,footer,nav').remove();
  $('a,li,td,th,h2,h3,h4,h5,h6,p,span,div,strong').each((_, el) => {
    if ($(el).children().length > 2) return;
    const t = stripCjk($(el).text().replace(/\s+/g, ' ').trim());
    if (t.length < 8 || t.length > 110) return;
    // real programme names only (not nav labels such as "Masters PhD" or "Master by Research")
    if (!/^((Executive )?Master (of|in)|Doctor (of|in)|(MSc|PhD) in|Juris Doctor|Executive MBA)\b/.test(t)) return;
    if (/✔|intake|application|\b20\d\d\b|\+/i.test(t)) return;
    if (seen.has(t) || !src.has(t)) return;
    seen.add(t);
    programmes.push({ name: t, level: classifyLevel(t) });
  });
  return { programmes };
}

function levelEvidence(src, patterns) {
  const evidence = [];
  const flat = src.text.replace(/\s+/g, ' ');
  for (const [level, re] of patterns) {
    const m = flat.match(re);
    if (m && src.has(m[0])) evidence.push({ level, quote: m[0] });
  }
  return { programmes: [], levelQuotes: evidence };
}

// ---------------------------------------------------------------- SSG private-institution register
async function ssgPost(endpoint, form) {
  const { body } = await fetchSource(SSG_API + endpoint, { post: form });
  return JSON.parse(body.toString('utf8'));
}
async function ssgFindPei(query, regNo) {
  const j = await ssgPost('PeiListing', { page: '1', pei_id: '', edutrustType: '', q_pei: query });
  const list = j.list || [];
  return regNo ? list.find((p) => p.reg_no === regNo) || null : list.find((p) => normName(p.pei_name) === normName(query)) || null;
}
async function ssgCourses(peiId) {
  const all = [];
  let page = 1;
  let pages = 1;
  do {
    const j = await ssgPost('courseListing', { page: String(page), pei_id: peiId, courseLvl: '', studyType: '', durationCourse: '', awardBy: '', q_course: '' });
    all.push(...(j.list || []));
    pages = Number(j.pages) || 1;
    page += 1;
  } while (page <= pages && page <= 50);
  return all;
}

function evaluatePei(pei, courses) {
  const regValidTo = parseUsDate(pei.expiry_date);
  const etValidTo = parseUsDate(pei.edu_expiry_date);
  const degree = courses.filter((c) => /^(Bachelor|Masters|Doctor)/i.test(c.level_ref_cd_desc || ''));
  const current = degree.filter((c) => !/teach[\s-]*out|old curriculum/i.test(c.title || ''));
  const reasons = [];
  if (!regValidTo || regValidTo < today) reasons.push(`registration not valid (expiry ${pei.expiry_date || 'n/a'})`);
  if (!FULL_EDUTRUST.includes(pei.award_type) || pei.edu_status_cd_desc !== 'Active' || !etValidTo || etValidTo < today) {
    reasons.push(`no active full EduTrust award (register: "${pei.award_type || 'none'}" ${pei.edu_status_cd_desc || ''})`.trim());
  }
  if (!current.some((c) => /^(Bachelor|Masters)/i.test(c.level_ref_cd_desc))) reasons.push('no current Bachelor\'s or Master\'s course on the register');
  return { eligible: reasons.length === 0, reasons, regValidTo, etValidTo, degreeCourses: current, teachOut: degree.length - current.length };
}

function peiProposal(pei, ev, tradingNameEvidence) {
  const levelsSeen = new Set();
  const byLevel = { Bachelor: [], Masters: [], Doctorate: [] };
  for (const c of ev.degreeCourses) {
    const lvl = /^Bachelor/i.test(c.level_ref_cd_desc) ? 'Bachelor' : /^Masters/i.test(c.level_ref_cd_desc) ? 'Masters' : 'Doctorate';
    const title = titleCaseIfShouting(String(c.title).replace(/\s*\((?:synchronous\s+)?e-?learning\)|\s*\((?:online|part[- ]time|full[- ]time|blended(?: learning)?)\)/gi, '').replace(/\s+/g, ' ').trim());
    byLevel[lvl].push(title);
    if (lvl === 'Bachelor') levelsSeen.add("Bachelor's");
    if (lvl === 'Masters') levelsSeen.add("Master's");
    if (lvl === 'Doctorate') levelsSeen.add(/Doctor of Philosophy|\bPhD\b/i.test(c.title) ? 'PhD' : 'Doctorate');
  }
  if (levelsSeen.has('PhD')) levelsSeen.delete('Doctorate');
  const courses = { list: [], keys: new Set() };
  for (const lvl of ['Bachelor', 'Masters', 'Doctorate']) addCourses(courses, [...byLevel[lvl]].sort());
  // Awarding universities as typed on the register (case variants and the odd typo, e.g. "Brimingham"):
  // merge spellings within 2 edits of each other into the most frequent one
  const counts = new Map();
  for (const c of ev.degreeCourses) {
    const a = titleCaseIfShouting(String(c.course_developer || '').replace(/\s+/g, ' ').trim());
    if (a) counts.set(a, (counts.get(a) || 0) + 1);
  }
  const awardersDedup = [];
  for (const [a] of [...counts.entries()].sort((x, y) => y[1] - x[1])) {
    if (!awardersDedup.some((b) => editDistance(normName(b), normName(a)) <= 2)) awardersDedup.push(a);
  }
  awardersDedup.sort();
  const website = pei.website ? `https://${String(pei.website).trim().replace(/^https?:\/\//i, '').split(/[/?#]/)[0].toLowerCase()}` : null;
  const description = `Private education institution registered with SkillsFuture Singapore (UEN ${pei.reg_no}, registration valid to ${isoDay(ev.regValidTo)}); `
    + `${pei.award_type} (certificate ${pei.edu_cert_no}, valid to ${isoDay(ev.etValidTo)}).`
    + (awardersDedup.length ? ` Degrees are awarded by partner universities: ${awardersDedup.join(', ')}.` : '');
  return {
    name: tradingNameEvidence ? tradingNameEvidence.name : titleCaseIfShouting(pei.pei_name),
    registeredName: pei.pei_name,
    city: 'Singapore',
    website,
    type: 'Private',
    description,
    // explicit nulls: no fee is verified for private institutions (see report → fieldsLeftNull)
    tuition: null,
    tuitionFeeUSD: null,
    graduateTuitionUSD: null,
    courses: courses.list.slice(0, MAX_COURSES),
    coursesTotal: courses.list.length,
    degreeLevels: LEVEL_ORDER.filter((l) => levelsSeen.has(l)),
    awarders: awardersDedup,
  };
}

// ---------------------------------------------------------------- revert
async function revert(reportFile) {
  const report = JSON.parse(fs.readFileSync(path.resolve(reportFile), 'utf8'));
  if (report.meta?.mode !== 'apply' && !process.argv.includes('--force')) {
    throw new Error('this report is from a dry run (nothing was written); pass --force to revert anyway');
  }
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('universities');
  let restored = 0;
  let removed = 0;
  for (const c of report.changes) {
    const _id = new mongoose.Types.ObjectId(c.id);
    if (c.action === 'create') {
      const r = await col.deleteOne({ _id, 'dataSource.createdBySync': SYNC_ID });
      removed += r.deletedCount;
      continue;
    }
    const set = {};
    const unset = {};
    for (const [k, v] of Object.entries(c.diff)) {
      if (v.from === undefined) unset[k] = ''; else set[k] = v.from;
    }
    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    if (Object.keys(update).length) { await col.updateOne({ _id }, update); restored += 1; }
  }
  console.log(`REVERTED: ${restored} records restored, ${removed} records created by ${SYNC_ID} removed (${reportFile})`);
  await mongoose.disconnect();
}

// ---------------------------------------------------------------- main
(async () => {
  const revertIdx = process.argv.indexOf('--revert');
  if (revertIdx !== -1) return revert(process.argv[revertIdx + 1]);

  console.log(`Official sources → Singapore universities (${APPLY ? 'APPLY' : 'DRY RUN, nothing is written'})`);
  const syncedAt = new Date();
  const errors = [];
  const uncertain = [];
  const fx = await fxSgdUsd();
  if (!fx.rate) uncertain.push('SGD→USD rate unavailable: all USD fees left null');
  console.log(`  SGD→USD ${fx.rate ?? 'n/a'} (${fx.date ?? 'n/a'})`);

  // 1. MOE: the autonomous universities
  const moe = await loadPage(MOE_AU_URL);
  const auCountQuote = quoted(moe, 'The 6 autonomous universities provide a wide range of academic, research, work-learn, and student life programmes');
  const aus = [];
  moe.$('a').each((_, a) => {
    const href = moe.$(a).attr('href') || '';
    const m = href.match(/\/autonomous-universities\/([a-z]+)\/?$/);
    if (!m) return;
    const text = moe.$(a).text().replace(/\s+/g, ' ').trim();
    const nm = text.match(/^(.*?) \(([A-Z]+)\)\s*(.*)$/);
    if (!nm || aus.some((u) => u.abbr === nm[2])) return;
    aus.push({ name: nm[1], abbr: nm[2], description: nm[3] || null, moeUrl: new URL(href, MOE_AU_URL).toString() });
  });
  if (aus.length !== 6) uncertain.push(`MOE page listed ${aus.length} autonomous universities (expected 6)`);
  console.log(`  MOE: ${aus.length} autonomous universities (${aus.map((u) => u.abbr).join(', ')})`);
  const tg = await loadPage(MOE_TG_URL);
  const bondQuote = quoted(tg, 'Tuition Grant recipients who are Singapore Permanent Residents or international students must serve a 3-year bond after graduation.');

  // Official website = the AU's own domain as linked from its MOE page
  for (const au of aus) {
    try {
      const page = await loadPage(au.moeUrl);
      let link = null;
      page.$('a').each((_, a) => {
        const t = page.$(a).text().replace(/\s+/g, ' ').trim();
        const h = page.$(a).attr('href') || '';
        if (!link && /^Learn more about .*admission/i.test(t) && /^https?:\/\//.test(h)) link = { text: t, href: h };
      });
      if (link) {
        au.website = `https://www.${regDomain(link.href)}`;
        if (page.has(link.text)) au.websiteEvidence = { url: au.moeUrl, quote: link.text, href: link.href, note: 'official domain = domain of this link on the MOE page' };
        else au.website = null;
      }
      au.descriptionEvidence = au.description && moe.has(au.description) ? { url: MOE_AU_URL, quote: au.description } : null;
      if (!au.descriptionEvidence) au.description = null;
    } catch (err) { errors.push(`MOE page for ${au.abbr}: ${err.message}`); }
  }

  // 2. GES: Bachelor's programme names (latest two survey years)
  const ges = JSON.parse((await fetchSource(GES_API)).body.toString('utf8'));
  const gesRecords = ges.result?.records || [];
  const latestYear = Math.max(...gesRecords.map((r) => Number(r.year) || 0));
  console.log(`  GES: ${gesRecords.length} rows, latest survey year ${latestYear}`);

  // 3. DB (read-only here)
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const sg = await db.collection('countries').findOne({ name: 'Singapore' });
  if (!sg) throw new Error('Country "Singapore" not found');
  const ours = await db.collection('universities').find({ country: sg._id }).toArray();
  console.log(`  our Singapore records: ${ours.length}`);
  const findOurs = (name, website, extraNames = []) => {
    const names = [name, ...extraNames].map(normName);
    const d = website ? regDomain(website) : '';
    return ours.filter((u) => names.includes(normName(u.name)) || (d && u.website && regDomain(u.website) === d));
  };

  const proposals = []; // { kind: 'AU'|'PEI', target: {...fields}, evidence, nulls, notes, matches }
  // ---- AUs
  for (const au of aus) {
    const cfg = AU_SOURCES[au.abbr];
    const evidence = [];
    const nulls = {};
    const notes = [];
    if (au.websiteEvidence) evidence.push({ field: 'website', ...au.websiteEvidence });
    if (au.descriptionEvidence) evidence.push({ field: 'description', ...au.descriptionEvidence });
    evidence.push({ field: 'name', url: MOE_AU_URL, quote: `${au.name} (${au.abbr})` }, { field: 'type', url: MOE_AU_URL, quote: auCountQuote?.quote || 'autonomous university (MOE)' });
    const levels = new Set();
    const courses = { list: [], keys: new Set() };

    // GES Bachelor's degrees
    // newest survey year first; an older-year label already covered by a newer one ("Bachelor of Law" vs
    // "Bachelor of Laws (LLB)") is dropped
    const gesSet = { list: [], keys: new Set() };
    const gesRows = gesRecords.filter((x) => x.university === au.name && Number(x.year) >= latestYear - 1);
    addCourses(gesSet, gesRows.filter((x) => Number(x.year) === latestYear).map((x) => cleanGesDegree(x.degree)));
    addCourses(gesSet, gesRows.filter((x) => Number(x.year) < latestYear).map((x) => cleanGesDegree(x.degree)), { skipIfContained: true });
    const gesNames = gesSet.list;
    if (gesNames.length) {
      levels.add("Bachelor's");
      evidence.push({ field: 'degreeLevels', level: "Bachelor's", url: GES_PAGE, quote: `GES ${latestYear - 1}-${latestYear} (official dataset): ${gesNames.length} distinct bachelor's degrees for ${au.name}, e.g. "${gesNames[0]}"` });
    }

    // Fees
    let fee = null;
    if (cfg?.fees) {
      try {
        const src = await loadPage(cfg.fees.url, { pdf: cfg.fees.pdf });
        fee = cfg.fees.parse(src);
        fee.url = cfg.fees.url;
        fee.via = src.via;
        if (!src.has(fee.header)) throw new Error(`${au.abbr} fee page: column header "${fee.header}" not found`);
        if (fee.extraQuote && !src.has(fee.extraQuote)) throw new Error(`${au.abbr} fee page: "${fee.extraQuote}" not found`);
        const rows = (fee.items || fee.perCredit || []).filter((i) => src.has(i.quote));
        if (fee.items) fee.items = rows; else fee.perCredit = rows;
        if (!rows.length) throw new Error(`${au.abbr}: no verifiable fee rows`);
      } catch (err) {
        errors.push(`${au.abbr} fees: ${err.message}`);
        fee = null;
      }
    }

    // Programme lists (current official names) + level evidence
    const listNames = { ug: [], pg: [] };
    for (const l of cfg?.lists || []) {
      try {
        const src = await loadPage(l.url, { pdf: l.pdf });
        const out = l.parse(src);
        for (const p of out.programmes || []) {
          if (!p.level) { listNames.pg.push(p.name); continue; }
          if (p.level === "Bachelor's") listNames.ug.push(p.name); else listNames.pg.push(p.name);
          if (!levels.has(p.level)) {
            levels.add(p.level);
            evidence.push({ field: 'degreeLevels', level: p.level, url: l.url, quote: p.name });
          }
        }
        for (const q of out.levelQuotes || []) {
          if (!levels.has(q.level)) { levels.add(q.level); evidence.push({ field: 'degreeLevels', level: q.level, url: l.url, quote: q.quote }); }
        }
        if (out.programmes?.length) {
          evidence.push({ field: 'courses', url: l.url, quote: `${out.programmes.length} programme names${out.listDate ? ` ${out.listDate}` : ''}, e.g. "${out.programmes[0].name}"` });
        }
      } catch (err) { errors.push(`${au.abbr} programme list ${l.url}: ${err.message}`); }
    }
    if (levels.has('PhD')) {
      levels.delete('Doctorate');
      for (let k = evidence.length - 1; k >= 0; k -= 1) if (evidence[k].field === 'degreeLevels' && evidence[k].level === 'Doctorate') evidence.splice(k, 1);
    }

    // Courses: current undergraduate list when the fee page has one (SIT), otherwise GES, then extras, then graduate
    const feeBachelors = (fee?.bachelorNames || []).map((n) => n.replace(/\s+/g, ' ').trim());
    if (au.abbr === 'SIT' && feeBachelors.length) {
      addCourses(courses, feeBachelors);
      notes.push('SIT undergraduate names taken from the AY2026 fee schedule (current programmes) instead of GES');
    } else if (au.abbr === 'SMU' && feeBachelors.length) {
      addCourses(courses, feeBachelors);
      addCourses(courses, gesNames, { skipIfContained: true });
    } else {
      addCourses(courses, gesNames);
      addCourses(courses, feeBachelors, { skipIfContained: true });
    }
    if (feeBachelors.length) {
      levels.add("Bachelor's");
      evidence.push({ field: 'courses', url: fee.url, quote: `${feeBachelors.length} undergraduate programme names on the official fee page, e.g. "${feeBachelors[0]}"` });
    }
    addCourses(courses, listNames.ug);
    addCourses(courses, listNames.pg);
    if (courses.list.length > MAX_COURSES) notes.push(`courses capped at ${MAX_COURSES} of ${courses.list.length}`);

    // Fee → headline values + display text
    const target = {
      name: au.name, city: 'Singapore', website: au.website || null, type: 'Public', description: au.description || null,
      courses: courses.list.slice(0, MAX_COURSES), degreeLevels: LEVEL_ORDER.filter((l) => levels.has(l)),
      tuitionFeeUSD: null, graduateTuitionUSD: null, tuition: null,
    };
    if (!target.website) nulls.website = 'MOE page link not found';
    const intl = `international, without MOE Tuition Grant (${bondQuote ? 'with the Grant: lower fee + 3-year Singapore work bond' : 'lower fee with the Grant, plus a service obligation'})`;
    const tail = `Master's: varies by programme — official ${au.abbr} fees, ${fee?.cohort || 'current intake'}`;
    if (fee && fee.perYear && fee.items.length) {
      const sgd = Math.round(weightedMedian(fee.items.map((i) => ({ value: i.sgd, weight: i.weight }))));
      const lo = Math.min(...fee.items.map((i) => i.sgd));
      const hi = Math.max(...fee.items.map((i) => i.sgd));
      const usd = fx.rate ? Math.round(sgd * fx.rate) : null;
      target.tuitionFeeUSD = usd;
      const how = [fee.derived ? (fee.derived.includes('÷') ? fee.derived.replace(/^estimated /, '') : fee.derived) : null,
        lo !== hi ? `range SGD ${Math.round(lo).toLocaleString('en-US')}–${Math.round(hi).toLocaleString('en-US')}` : null].filter(Boolean).join('; ');
      const approx = fee.items.length > 1 || fee.derived ? ', approx.' : '';
      target.tuition = `Bachelor's SGD ${sgd.toLocaleString('en-US')}${usd ? ` (≈ ${money(usd)})` : ''} per year${approx}${how ? ` (${how})` : ''} · ${intl} · ${tail}`;
      notes.push(`tuitionFeeUSD = ${fee.note}`);
      for (const i of fee.items) evidence.push({ field: 'tuitionFeeUSD', url: fee.url, quote: i.quote, value: { label: i.label, sgdPerYear: Math.round(i.sgd), ...(i.total ? { sgdProgrammeTotal: i.total } : {}) } });
      evidence.push({ field: 'tuitionFeeUSD', url: fee.url, quote: fee.header, note: 'column used = fees for students NOT receiving the MOE Tuition Grant' });
      if (fee.extraQuote) evidence.push({ field: 'tuitionFeeUSD', url: fee.url, quote: fee.extraQuote });
      if (fee.derived) uncertain.push(`${au.abbr}: per-year fee derived as ${fee.derived}`);
      if (!usd) nulls.tuitionFeeUSD = 'no SGD→USD rate';
    } else if (fee && fee.perCredit?.length) {
      const pc = fee.perCredit.map((i) => i.perCredit);
      const totals = fee.perCredit.map((i) => i.perCredit * i.credits);
      const medTotal = Math.round(weightedMedian(totals.map((v) => ({ value: v }))));
      target.tuition = `Bachelor's SGD ${Math.min(...pc).toFixed(2)}–${Math.max(...pc).toFixed(2)} per credit (whole programme approx. SGD ${medTotal.toLocaleString('en-US')}${fx.rate ? ` ≈ ${money(medTotal * fx.rate)}` : ''}, median) · ${intl} · ${tail}`;
      notes.push(`whole-programme figure = median of (official per-credit fee × programme credits, ${Math.min(...fee.perCredit.map((i) => i.credits))}–${Math.max(...fee.perCredit.map((i) => i.credits))} credits)`);
      nulls.tuitionFeeUSD = fee.note;
      for (const i of fee.perCredit) evidence.push({ field: 'tuition', url: fee.url, quote: i.quote, value: { label: i.label, credits: i.credits, sgdPerCredit: i.perCredit } });
      evidence.push({ field: 'tuition', url: fee.url, quote: fee.header });
      uncertain.push(`${au.abbr}: tuitionFeeUSD left null — ${fee.note}`);
    } else {
      nulls.tuitionFeeUSD = 'official fee page could not be read/verified in this run';
    }
    if (bondQuote && target.tuition) evidence.push({ field: 'tuition', url: MOE_TG_URL, quote: bondQuote.quote });
    nulls.graduateTuitionUSD = "Master's fees are set per programme on individual programme pages; no single official per-level figure";
    proposals.push({ kind: 'AU', key: au.abbr, target, evidence, nulls, notes, feeVia: fee?.via || null, sources: [MOE_AU_URL, au.moeUrl, GES_PAGE, cfg?.fees?.url, ...(cfg?.lists || []).map((l) => l.url), bondQuote ? MOE_TG_URL : null].filter(Boolean) });
  }

  // ---- Private institutions (SSG register)
  const faq = await loadPage(SSG_FAQ).catch((err) => { errors.push(`SSG FAQ: ${err.message}`); return null; });
  const edutrustRule = faq ? quoted(faq, 'would like to recruit international students on Student\'s Pass, they are required to obtain EduTrust certification') : null;
  const excluded = [];
  const peiQueue = PEI_CANDIDATES.map((c) => ({ ...c, origin: 'candidate' }));
  // Every existing Singapore record that is not an AU is checked against the register too
  for (const u of ours) {
    if (aus.some((a) => normName(a.name) === normName(u.name))) continue;
    if (peiQueue.some((c) => normName(c.query) === normName(u.name))) continue;
    peiQueue.push({ query: String(u.name).toUpperCase(), origin: 'existing record', existingId: String(u._id) });
  }
  for (const cand of peiQueue) {
    const pei = await ssgFindPei(cand.query, cand.regNo);
    if (!pei) {
      excluded.push({ query: cand.query, origin: cand.origin, existingId: cand.existingId || null, reason: 'not found in the SSG register of private education institutions', evidence: { url: SSG_PAGE, search: cand.query } });
      continue;
    }
    const courses = await ssgCourses(pei.pei_id);
    const ev = evaluatePei(pei, courses);
    const register = {
      registeredName: pei.pei_name, regNo: pei.reg_no, registrationValidTo: isoDay(ev.regValidTo), eduTrust: pei.award_type || null,
      eduTrustStatus: pei.edu_status_cd_desc || null, eduTrustCertNo: pei.edu_cert_no || null, eduTrustValidTo: isoDay(ev.etValidTo),
      website: pei.website || null, coursesOnRegister: courses.length, currentDegreeCourses: ev.degreeCourses.length, teachOutDegreeCourses: ev.teachOut,
    };
    if (!ev.eligible) {
      excluded.push({ query: cand.query, origin: cand.origin, existingId: cand.existingId || null, reason: ev.reasons.join('; '), register, evidence: { url: SSG_PAGE, search: cand.query } });
      continue;
    }
    let tradingEvidence = null;
    if (cand.tradingName) {
      try {
        const home = await loadPage(cand.tradingName.url);
        const q = (home.text.match(new RegExp(`[^.]{0,40}${cand.tradingName.name}[^.]{0,40}`)) || [null])[0];
        if (q && home.has(q)) tradingEvidence = { name: cand.tradingName.name, url: cand.tradingName.url, quote: q.trim() };
      } catch (err) { errors.push(`${cand.tradingName.url}: ${err.message}`); }
    }
    const target = peiProposal(pei, ev, tradingEvidence);
    const evidence = [
      { field: 'name', url: SSG_PAGE, quote: `register: ${pei.pei_name} (UEN ${pei.reg_no})` },
      ...(tradingEvidence ? [{ field: 'name', url: tradingEvidence.url, quote: tradingEvidence.quote, note: 'trading name on the official website' }] : []),
      { field: 'website', url: SSG_PAGE, quote: `register website: ${pei.website}` },
      { field: 'type', url: SSG_PAGE, quote: `${pei.award_type} · status ${pei.edu_status_cd_desc} · certificate ${pei.edu_cert_no} valid to ${isoDay(ev.etValidTo)}` },
      { field: 'courses', url: SSG_PAGE, quote: `${ev.degreeCourses.length} current degree-level courses on the register (${ev.teachOut} in teach-out excluded)` },
      ...target.degreeLevels.map((l) => ({ field: 'degreeLevels', level: l, url: SSG_PAGE, quote: `register course level: ${l === "Bachelor's" ? 'Bachelor' : l === "Master's" ? 'Masters' : 'Doctorate'}` })),
    ];
    if (edutrustRule) evidence.push({ field: 'eligibility', url: SSG_FAQ, quote: edutrustRule.quote });
    const nulls = {
      tuitionFeeUSD: 'private institutions publish a total course fee per programme; no single official per-level figure was verified',
      graduateTuitionUSD: 'same as tuitionFeeUSD',
      tuition: 'not verified (see tuitionFeeUSD)',
    };
    const notes = [];
    if (target.coursesTotal > MAX_COURSES) notes.push(`courses capped at ${MAX_COURSES} of ${target.coursesTotal}`);
    proposals.push({ kind: 'PEI', key: pei.reg_no, origin: cand.origin, existingId: cand.existingId || null, register, target, evidence, nulls, notes, sources: [SSG_PAGE, ...(tradingEvidence ? [tradingEvidence.url] : [])] });
  }

  // 4. Changes
  const changes = [];
  const unchanged = [];
  const otherCountrySameName = await db.collection('universities').find({ name: { $in: proposals.map((p) => p.target.name) }, country: { $ne: sg._id } })
    .project({ name: 1, country: 1, city: 1 }).toArray();
  const matchedIds = new Set();
  for (const p of proposals) {
    const t = p.target;
    const extraNames = p.register ? [p.register.registeredName] : [];
    const hits = findOurs(t.name, t.website, extraNames);
    const fieldsSet = ['name', 'city', 'website', 'type', 'description', 'courses', 'degreeLevels', 'tuition', 'tuitionFeeUSD', 'graduateTuitionUSD']
      .filter((k) => t[k] !== null && t[k] !== undefined && !(Array.isArray(t[k]) && !t[k].length));
    const dataSource = {
      provider: p.kind === 'AU' ? `MOE Singapore + data.gov.sg GES + ${t.name} official pages` : 'SkillsFuture Singapore PEI register (TPGateway)',
      urls: [...new Set(p.sources)],
      syncedAt,
      fields: fieldsSet,
      ...(fx.rate ? { sgdUsd: fx.rate, fxDate: fx.date } : {}),
      ...(p.register ? { register: p.register } : {}),
    };
    if (!hits.length) {
      const _id = new mongoose.Types.ObjectId();
      const doc = {
        _id, name: t.name, country: sg._id, city: t.city || 'Singapore', website: t.website, type: t.type, description: t.description,
        tuition: t.tuition, tuitionFeeUSD: t.tuitionFeeUSD, graduateTuitionUSD: t.graduateTuitionUSD,
        courses: t.courses, degreeLevels: t.degreeLevels, categoryTags: [],
        // explicit nulls so no fabricating schema default leaks in (rankingNum comes only from the QS import)
        rankingNum: null, ...Object.fromEntries(Object.keys(FABRICATING_DEFAULTS).map((k) => [k, null])),
        isActive: true,
        dataSource: { ...dataSource, createdBySync: SYNC_ID },
        createdAt: syncedAt, updatedAt: syncedAt, __v: 0,
      };
      const diff = Object.fromEntries(Object.entries(doc).filter(([k]) => !['_id', 'createdAt', 'updatedAt', '__v', 'dataSource', 'country'].includes(k)).map(([k, v]) => [k, { from: null, to: v }]));
      changes.push({ action: 'create', id: String(_id), name: t.name, kind: p.kind, doc, diff, evidence: p.evidence, leftNull: p.nulls, notes: p.notes, register: p.register || null });
      continue;
    }
    // Existing record(s): first one is updated; any further match is a duplicate → hidden
    const [keep, ...dups] = hits;
    matchedIds.add(String(keep._id));
    const diff = {};
    const consider = { ...t };
    delete consider.registeredName; delete consider.coursesTotal; delete consider.awarders;
    if (consider.type && String(keep.type || '').toLowerCase() === consider.type.toLowerCase()) delete consider.type;
    if (consider.name && normName(keep.name) === normName(consider.name)) delete consider.name;
    for (const [k, v] of Object.entries(consider)) {
      if (v === null && (keep[k] === undefined || keep[k] === null)) continue;
      if (v === null && ['tuitionFeeUSD', 'graduateTuitionUSD', 'tuition'].includes(k)) continue; // keep existing value; flagged below
      if (JSON.stringify(keep[k]) !== JSON.stringify(v)) diff[k] = { from: keep[k], to: v };
    }
    // Fabricating defaults still sitting on the record → null
    for (const [k, def] of Object.entries(FABRICATING_DEFAULTS)) {
      if (keep[k] !== undefined && JSON.stringify(keep[k]) === JSON.stringify(def)) diff[k] = { from: keep[k], to: null, reason: 'schema default, not an official value' };
    }
    if (Array.isArray(keep.courses) && JSON.stringify(keep.courses) === JSON.stringify(DEFAULT_COURSES) && !diff.courses) diff.courses = { from: keep.courses, to: [], reason: 'schema default course list' };
    if (keep.isActive === false) diff.isActive = { from: false, to: true };
    const untouched = [];
    if (keep.tuitionFeeUSD != null && t.tuitionFeeUSD == null) untouched.push(`tuitionFeeUSD ${keep.tuitionFeeUSD} kept as is but NOT verified by any official source`);
    if (keep.rankingNum != null) untouched.push(`rankingNum ${keep.rankingNum} not touched (rankings come from the QS import)${keep.rankingNum === 500 ? ' — 500 is the schema default' : ''}`);
    for (const u of untouched) uncertain.push(`${keep.name}: ${u}`);
    if (Object.keys(diff).length) {
      diff.dataSource = { from: keep.dataSource, to: { ...dataSource, fields: Object.keys(diff) } };
      changes.push({ action: 'update', id: String(keep._id), name: keep.name, kind: p.kind, diff, evidence: p.evidence, leftNull: p.nulls, notes: [...p.notes, ...untouched], register: p.register || null });
    } else unchanged.push(keep.name);
    for (const d of dups) {
      matchedIds.add(String(d._id));
      if (d.isActive === false) continue;
      changes.push({ action: 'deactivate', id: String(d._id), name: d.name, kind: p.kind, diff: { isActive: { from: d.isActive, to: false }, dataSource: { from: d.dataSource, to: { ...dataSource, deactivatedReason: `duplicate of ${keep.name} (${keep._id})` } } }, evidence: p.evidence });
    }
  }
  // Existing Singapore records that are neither an AU nor an eligible registered institution → hidden
  for (const ex of excluded.filter((e) => e.existingId && !matchedIds.has(e.existingId))) {
    const u = ours.find((x) => String(x._id) === ex.existingId);
    if (!u || u.isActive === false) continue;
    changes.push({
      action: 'deactivate', id: ex.existingId, name: u.name, kind: 'PEI',
      diff: { isActive: { from: u.isActive, to: false }, dataSource: { from: u.dataSource, to: { provider: 'SkillsFuture Singapore PEI register (TPGateway)', urls: [SSG_PAGE], syncedAt, deactivatedReason: ex.reason } } },
      evidence: [{ field: 'isActive', url: SSG_PAGE, quote: ex.register ? JSON.stringify(ex.register) : `no register entry for "${ex.query}"` }],
    });
  }

  // 5. Report
  const fieldsLeftNull = Object.fromEntries(proposals.map((p) => [p.target.name, p.nulls]));
  const commonNulls = {
    'minIeltsScore, ieltsScore, minGpaPercent, minScore, greExam, workExp, minGreScore, greRequired': 'admission requirements vary by programme and were not verified in this sync → null on new records',
    acceptanceRate: 'not published by an official source → null',
    scholarshipAvailable: 'not verified → null',
    rankingNum: 'never set here (rankings come from the separate official QS import) → null on new records',
  };
  const institutions = proposals.map((p) => {
    const c = changes.find((x) => x.name === p.target.name || (x.action !== 'create' && x.register?.regNo === p.key));
    return {
      name: p.target.name, kind: p.kind, action: c ? c.action : 'unchanged', website: p.target.website, type: p.target.type,
      degreeLevels: p.target.degreeLevels, courses: p.target.courses.length,
      tuitionFeeUSD: p.target.tuitionFeeUSD, tuition: p.target.tuition,
      eduTrust: p.register ? `${p.register.eduTrust} (${p.register.eduTrustCertNo}, to ${p.register.eduTrustValidTo})` : null,
      feeFetchedVia: p.feeVia || null,
    };
  });
  const summary = {
    ourSingaporeRecordsBefore: ours.length,
    creates: changes.filter((c) => c.action === 'create').length,
    updates: changes.filter((c) => c.action === 'update').length,
    deactivations: changes.filter((c) => c.action === 'deactivate').length,
    unchanged: unchanged.length,
    candidatesExcluded: excluded.length,
    sgdUsd: fx.rate, fxDate: fx.date,
    requests: { ...stats },
    errors: errors.length,
  };
  if (otherCountrySameName.length) uncertain.push(`same name exists under another country: ${otherCountrySameName.map((u) => `${u.name} (${u.city})`).join(', ')}`);
  uncertain.push('Bachelor\'s course names for NUS/NTU/SUTD/SUSS come from the Graduate Employment Survey (programmes with graduates in the last two survey years); brand-new programmes are missing and a few discontinued ones may remain');
  uncertain.push('AU Master\'s/PhD names come from official listing pages/PDFs; NUS list covers self-funded programmes only (MOE-subsidised NUS master\'s programmes are listed by faculty, not by name)');
  uncertain.push(`private institutions: eligibility rule = ${PEI_RULES}`);

  const report = {
    meta: {
      script: 'scripts/dataSync/singaporeSync.js', mode: APPLY ? 'apply' : 'dry-run', generatedAt: syncedAt,
      fx, scrapeDoRequestsThisRun: stats.scrapeDoRequests, cacheDir: CACHE_DIR, fetched: fetchLog,
    },
    summary, institutions, excluded, fieldsLeftNull, commonNulls, uncertain, errors, changes,
  };
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, `singapore-sync-${syncedAt.toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(JSON.stringify(summary, null, 2));
  console.table(institutions.map((i) => ({ name: i.name, action: i.action, type: i.type, levels: i.degreeLevels.join('/'), courses: i.courses, usd: i.tuitionFeeUSD })));
  if (excluded.length) console.log('excluded:', excluded.map((e) => `${e.query} — ${e.reason}`).join('\n  '));
  if (errors.length) console.log('errors:', errors.join('\n  '));
  console.log(`full report: ${reportPath}`);

  if (APPLY) {
    const col = db.collection('universities');
    let created = 0; let updated = 0; let hidden = 0;
    for (const c of changes) {
      if (c.action === 'create') {
        try { await col.insertOne(c.doc); created += 1; } catch (err) { console.log(`  skip create ${c.name}: ${err.code === 11000 ? 'already exists' : err.message}`); }
        continue;
      }
      const set = { updatedAt: new Date() };
      const unset = {};
      for (const [k, v] of Object.entries(c.diff)) {
        if (v.to === undefined) unset[k] = ''; else set[k] = v.to;
      }
      await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id) }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) });
      if (c.action === 'update') updated += 1; else hidden += 1;
    }
    console.log(`APPLIED: ${created} created, ${updated} updated, ${hidden} deactivated`);
  }
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('FAILED:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
