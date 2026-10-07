/**
 * Sync Irish higher-education institutions with the Irish government's official lists of programmes that are
 * eligible for student immigration permission, plus non-EU tuition from each institution's own fee pages.
 *
 *   node scripts/dataSync/irelandSync.js                    # DRY RUN: download + match + report, writes nothing
 *   node scripts/dataSync/irelandSync.js --apply            # write the creates/updates/deactivations of this run
 *   node scripts/dataSync/irelandSync.js --revert <report.json>
 *
 * Options: --refresh (ignore the download cache), --no-scrapedo, --max-scrapedo <n> (default 6 per run).
 *
 * Sources (all official):
 *  - ILEP: "Interim List of Eligible Programmes" (Excel) and the "TrustEd Ireland Providers eligible programmes
 *    list" (Excel), both linked from Immigration Service Delivery (Dept. of Justice) at irishimmigration.ie.
 *    Students must pick a course from one of the two lists ("eligible programmes will not appear on both lists").
 *    Universities and technological universities are on the TrustEd Ireland list; the rest are on ILEP.
 *  - gov.ie "List of publicly-funded higher education institutions" (institution type Public).
 *  - Each institution's own non-EU fee schedule (HTML table, PDF or text page). Values taken from text pages via
 *    an LLM are kept only when the model's verbatim quote is found in the page text and contains the amount.
 *  - ECB EUR→USD rate (api.frankfurter.app).
 *
 * Never deletes: records that are not real/eligible institutions get isActive:false. Ranking fields are never
 * touched (rankings come from the separate QS import). Reports + download cache go to backend/reports/ (git-ignored).
 * Needs MONGO_URI; GROQ_API_KEY for text fee pages; SCRAPE_DO_TOKEN only for sites that block direct requests.
 * No xlsx/pdf npm packages are needed: the .xlsx (a zip of XML) and the fee PDFs are read with Node's zlib.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const APPLY = process.argv.includes('--apply');
const REFRESH = process.argv.includes('--refresh');
const NO_SCRAPEDO = process.argv.includes('--no-scrapedo');
const MAX_SCRAPEDO = (() => {
  const i = process.argv.indexOf('--max-scrapedo');
  return i !== -1 ? Number(process.argv[i + 1]) || 0 : 6;
})();
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');
const CACHE_DIR = path.join(REPORT_DIR, 'cache', 'ireland');
const CACHE_MAX_AGE_MS = 7 * 24 * 3600 * 1000;
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const ISD_PAGE = 'https://www.irishimmigration.ie/coming-to-study-in-ireland/what-are-my-study-options/a-third-level-course-or-a-language-course/';
// Used only if the links can no longer be found on ISD_PAGE (editions current on 2026-10-03)
const FALLBACK_ILEP_XLSX = 'https://www.irishimmigration.ie/wp-content/uploads/2026/09/Interim-List-of-Eligible-Programmes-updated-22-September-2026.xlsx';
const FALLBACK_TRUSTED_XLSX = 'https://www.trustedireland.ie/sites/default/files/2026-02/trusted-ireland-he-list-of-eligible-programmes.xlsx';
const PUBLIC_HEI_LIST = 'https://www.gov.ie/en/department-of-further-and-higher-education-research-innovation-and-science/publications/list-of-publicly-funded-higher-education-institutions-universities-and-colleges/';
const GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
const FEE_YEAR = '2026/27';
const COURSE_CAP = 150; // per institution: Master's first, then Bachelor's, then diplomas, then doctorates
const MIN_FEE_EUR = 5000; // below this it is a module / part-time / deposit amount, not a yearly full-time fee
const MAX_FEE_EUR = 70000;
const LEVEL_LABEL = { bachelor: "Bachelor's", master: "Master's", phd: 'PhD' };

// ---------------------------------------------------------------------------------------------------------------
// Institutions in scope. providers = provider names in the official lists (several campuses → one record).
// fees = official non-EU fee sources; parser 'table' (HTML table), 'pdfRows' (regex over PDF text), 'text' (LLM +
// verbatim-quote check). websiteCheck = page fetched to prove the domain belongs to the institution.
// ---------------------------------------------------------------------------------------------------------------
const MASTER_RE = /\bmasters?\b|\bM\.?\s?Sc\b|\bM\.?A\.?(?![a-z])|\bMBA\b|\bMBS\b|\bM\.?\s?Eng\b|\bLL\.?\s?M\b|\bM\.?\s?Phil\b|\bMArch\b|\bMMus\b|\bM\.?\s?Ed\b|\bMACC\b|\bMFA\b|\bMPH\b|\bMPharm\b|\bMDes\b|\bMSocSc\b|\bMBus\b|\bMPP\b|\bMPA\b|\bMTh\b|\bMIM\b/i;
const BACHELOR_RE = /\bbachelors?\b|\bB\.?\s?(?:A|Sc|Eng|E|Comm|BS|Bus|Mus|Ed|Arch|Des|Tech|Acc)\b|\bBBA\b|\bBBS\b|\bLL\.?\s?B\b|\(hons?\)|\bhons\b|honours degree|ordinary degree|\bundergraduate\b/i;
const RESEARCH_RE = /research|\bph\.?\s?d\b|doctor|doctoral|doctorate|\bMD\b|\bM\.?Litt\b|by thesis|structured/i;
const EXCLUDE_RE = /\bone (?:term|semester)\b|^one year$|\byear [2-9]\b|pathway|part[- ]?time|\(PT\)|\bPT\b|module|semester|repeat|occasional|visiting|exchange|study abroad|erasmus|certificate|\bcert\b|\baccess\b|foundation|pre-?masters?|bridging|pre-?sessional|english language|online|blended|distance|\bby DE\b|executive|ACCA|levy|deposit|application fee|capitation|bench fee|thesis|continuation|writing[- ]up|scholarship|bursary|after scholarship/i;
const MEDICAL_RE = /medicine|medical degree|\bMB\b|MB ?BCh|dentist|dental (?:science|surgery)|\bBDS\b|veterinary|\bvet\b|graduate entry med/i;
const DIPLOMA_RE = /diploma|\bDip\b|\bH\.?\s?Dip\b|\bPG\s?Dip\b|\bP\.?\s?Dip\b|\bG\.?\s?Dip\b/i;
const PER_PROGRAMME_RE = /per \d+[- ]year programme|total programme fee|for the (?:whole|full|entire) (?:programme|course)/i;

const INSTITUTIONS = [
  {
    key: 'tcd', name: 'Trinity College Dublin', providers: [/^Trinity College Dublin/i], city: 'Dublin',
    website: 'https://www.tcd.ie/', publicListName: 'Trinity College Dublin', group: 'University',
    fees: [
      { url: 'https://www.tcd.ie/courses/undergraduate/fees/', parser: 'table', level: 'bachelor', feeHeader: /non-eu student total fee/i, labelHeader: /course name/i, rowFilter: (cells, h) => cells[h.findIndex((x) => /academic year/i.test(x))] === FEE_YEAR && !/visiting|erasmus/i.test(cells.join(' ')) },
      // Course codes starting PT = taught postgraduate (PR/PM = research)
      { url: 'https://www.tcd.ie/courses/postgraduate/fees/', parser: 'table', level: 'master', feeHeader: /non-eu student fee/i, labelHeader: /course name/i, rowFilter: (cells, h) => cells[h.findIndex((x) => /academic year/i.test(x))] === FEE_YEAR && /^PT/.test(cells[h.findIndex((x) => /course code/i.test(x))] || '') && /full/i.test(cells[h.findIndex((x) => /^mode$/i.test(x))] || '') },
    ],
  },
  {
    key: 'ucd', name: 'University College Dublin', providers: [/^University College Dublin$/i], city: 'Dublin',
    website: 'https://www.ucd.ie/', publicListName: 'University College Dublin', group: 'University',
    // UCD publishes its fee grid in an iframe served from hub.ucd.ie ("These are the Non EU fee rates")
    fees: [
      { url: 'https://hub.ucd.ie/usis/!W_HU_MENU.P_PUBLISH?p_tag=FEESLEVEL&RESD=NONEU&DGLEV=UG&ACYR=2026', parser: 'table', level: 'bachelor', feeHeader: /^euro$/i, plainNumbers: true, labelIndex: 0, mustContain: /These are the Non EU fee rates/i, rowFilter: (cells) => cells.some((c) => /^full time$/i.test(c)) && cells.some((c) => /^(per year|year 1)$/i.test(c)), via: 'https://www.ucd.ie/students/fees/noneucoursefees/internationalnon-euundergraduatefees202627/' },
      { url: 'https://hub.ucd.ie/usis/!W_HU_MENU.P_PUBLISH?p_tag=FEESLEVEL&RESD=NONEU&DGLEV=GT&ACYR=2026', parser: 'table', level: 'master', feeHeader: /^euro$/i, plainNumbers: true, labelIndex: 0, mustContain: /These are the Non EU fee rates/i, rowFilter: (cells) => cells.some((c) => /^full time$/i.test(c)) && cells.some((c) => /^(per year|year 1)$/i.test(c)), via: 'https://www.ucd.ie/students/fees/noneucoursefees/non-eugraduatetaughtfees202627/' },
    ],
  },
  {
    key: 'ucc', name: 'University College Cork', providers: [/^University College Cork/i], city: 'Cork',
    website: 'https://www.ucc.ie/en/', publicListName: 'University College Cork', group: 'University',
    fees: [
      { url: 'https://www.ucc.ie/en/financeoffice/fees/schedules/internationalundergraduatefees202627/', parser: 'table', level: 'bachelor', feeHeader: /non-eu fee \(full time\)/i },
      { url: 'https://www.ucc.ie/en/financeoffice/fees/schedules/postgraduateeuandinternationalfees202627/', parser: 'table', level: 'master', feeHeader: /non-eu fee \(full time\)/i },
    ],
  },
  {
    key: 'galway', name: 'University of Galway', providers: [/^University of Galway$/i], city: 'Galway',
    website: 'https://www.universityofgalway.ie/', publicListName: 'University of Galway', group: 'University',
    fees: [
      { url: 'https://www.universityofgalway.ie/student-fees/how-much/undergraduate-fees/', parser: 'table', level: 'bachelor', feeHeader: /international \(non-eu\)/i, labelHeader: /^course$/i },
      { url: 'https://www.universityofgalway.ie/student-fees/how-much/postgraduate-fees/', parser: 'table', level: 'master', feeHeader: /international \(non-eu\)/i, labelHeader: /^course$/i },
    ],
  },
  {
    key: 'mu', name: 'Maynooth University', providers: [/^Maynooth University$/i], city: 'Maynooth',
    website: 'https://www.maynoothuniversity.ie/', publicListName: 'Maynooth University', group: 'University',
    websiteCheck: 'https://www.maynoothuniversity.ie/student-fees-grants/international',
    fees: [
      // PDFs linked from maynoothuniversity.ie/student-fees-grants/international ("2026.27 International Undergraduate Fees List")
      { url: 'https://www.maynoothuniversity.ie/sites/default/files/assets/document/International%20UG%20Fees%20List%202026.27%2024.04.26%20V2%20CHR.pdf', parser: 'pdfRows', level: 'bachelor', mustContain: /INTERNATIONAL UNDERGRADUATE COURSES TUITION FEE SCHEDULE 2026\/27/i, rowRegex: /\b(?<code>MH\d{3})\s+(?<label>[^€]+?)\s+(?<amount>\d{1,2},\d{3})\b/g },
      { url: 'https://www.maynoothuniversity.ie/sites/default/files/assets/document/2026.27%20Postgraduate%20EU%20%26%20International%20Fees%20List%20%2818.09.26%29%20V.4%20CHR.pdf', parser: 'pdfRows', level: 'master', mustContain: /NON-EU FEE/i, rowRegex: /(?<label>[A-Za-z*][^€]*?)\s+(?<mode>full-time|part-time)\s+(?<code>MH[A-Z0-9]+)\s+[\d,]+\s+\d+\s+[\d,]+\s+(?<amount>\d{1,2},\d{3}|-)/g, rowKeep: (g) => g.mode === 'full-time' },
    ],
  },
  {
    key: 'ul', name: 'University of Limerick', providers: [/^University of Limerick$/i], city: 'Limerick',
    website: 'https://www.ul.ie/', publicListName: 'University of Limerick', group: 'University',
    fees: [
      { url: 'https://www.ul.ie/fees/course-fees/undergraduate-fees/undergraduate-fees-2026-2027', parser: 'table', level: 'bachelor', feeHeader: /non-eu fee/i, tables: [0] }, // table 1 = other/part-time
      { url: 'https://www.ul.ie/fees/course-fees/postgraduate-fees/postgraduate-taught-fees-2026-2027', parser: 'table', level: 'master', feeHeader: /non-eu fee/i, tables: [0] }, // "Postgraduate fees - full-time taught"; table 1 = part-time
    ],
  },
  {
    key: 'dcu', name: 'Dublin City University', providers: [/^Dublin City University$/i], city: 'Dublin',
    website: 'https://www.dcu.ie/', publicListName: 'Dublin City University', group: 'University',
    fees: [
      { url: 'https://www.dcu.ie/fees/undergraduate-fees-2026-2027', parser: 'table', level: 'bachelor', feeHeader: /^non eu fee$/i },
      { url: 'https://www.dcu.ie/fees/postgraduate-fees-2026-27', parser: 'table', level: 'master', feeHeader: /^non eu fee$/i },
    ],
  },
  {
    key: 'tud', name: 'Technological University Dublin', providers: [/^TU Dublin$/i, /^Technological University Dublin/i], city: 'Dublin',
    website: 'https://www.tudublin.ie/', publicListName: 'Technological University Dublin', group: 'Technological University',
    // "Undergraduate Level 8 → 2026 Undergraduate Brochure", "Postgraduate Level 9 → 2026 Postgraduate Brochure" on
    // tudublin.ie/study/international/fees--registration/fees---funding/
    fees: [
      { url: 'https://www.tudublin.ie/media/website/study/international-students/fees-amp-funding/documents/TU-Dublin-International-Undergraduate-Summary-Booklet.pdf', parser: 'pdfRows', level: 'bachelor', mustContain: /International Undergraduate\s+Programmes 2026\/27/i, rowRegex: /\b(?<code>TU\d{3}[A-Z]?)\s+(?<label>(?:(?!\bTU\d{3})[^€])*?)\s*(?<award>B[A-Za-z]*(?: Hons)?|HCert|HDip)\s+(?<nfq>[678])\s+(?:(?!\bTU\d{3})[^€])*?€(?<amount>\d{1,2},\d{3})/g, rowKeep: (g) => g.nfq !== '6' && /^B/i.test(g.award) },
      { url: 'https://www.tudublin.ie/media/website/study/international-students/fees-amp-funding/documents/TU-Dublin-International-Postgraduate-Brochure-2026.pdf', parser: 'pdfRows', level: 'master', mustContain: /International Postgraduate\s+Prospectus 2026\/27/i, rowRegex: /\b(?<code>TU\d{3}[A-Z]?)\s+(?<label>(?:(?!\bTU\d{3})[^€])+?)\s+(?<award>MSc|MA|MBS|MArch|MEng|MMus|MBA|LLM|MPhil|PGDip|HDip)\s+(?:Jan & Sept|Sept|Jan)\s+\d{2}\s+[\d.\-]+\s+(?:(?!\bTU\d{3})[^€\d])+?\s+(?<amount>\d{1,2},\d{3}|TBC)\s+(?:\d\.\d|TBC)/g },
    ],
  },
  {
    key: 'atu', name: 'Atlantic Technological University', providers: [/^Atlantic Technological University/i, /^ATU St Angela/i], city: 'Galway', feeYearLabel: 'Sept 2025 intake onwards; PG confirmed for 2026/27',
    website: 'https://www.atu.ie/', publicListName: 'Atlantic Technological University', group: 'Technological University',
    fees: [
      { url: 'https://www.atu.ie/study/global/international-fee-and-refund-policy', parser: 'text', levels: ['bachelor', 'master'] },
      { url: 'https://www.atu.ie/study/fees-and-funding/fees/full-time-part-time-postgraduate-fees', parser: 'text', levels: ['master'] },
    ],
  },
  {
    key: 'mtu', name: 'Munster Technological University', providers: [/^Munster Technological University/i], city: 'Cork',
    website: 'https://www.mtu.ie/', publicListName: 'Munster Technological University', group: 'Technological University',
    fees: [
      { url: 'https://www.mtu.ie/international/non-eu/fees/', parser: 'table', level: 'mixed', feeHeader: /^fee$/i, mustContain: /2026\/2027/ },
    ],
  },
  {
    key: 'setu', name: 'South East Technological University', providers: [/^South East Technological University/i], city: 'Waterford', feeYearLabel: 'page refers to the 2025/26 fee structure',
    website: 'https://www.setu.ie/', publicListName: 'South East Technological University', group: 'Technological University',
    websiteCheck: 'https://www.setu.ie/current-students/fees-and-grants/fees/global-fees',
    fees: [
      { url: 'https://www.setu.ie/current-students/fees-and-grants/fees/global-fees', parser: 'text', levels: ['bachelor', 'master'], yearNote: 'page states "SETU continues to implement its fee structure for 2025/2026"' },
    ],
  },
  {
    key: 'tus', name: 'Technological University of the Shannon', providers: [/^Technological University of the Shannon/i], city: 'Athlone',
    website: 'https://tus.ie/', publicListName: 'Technological University of the Shannon', group: 'Technological University',
    fees: [
      { url: 'https://tus.ie/global/international-admissions/fees-and-scholarships/', parser: 'table', level: 'mixed', feeHeader: /non-eu fee/i },
    ],
  },
  {
    key: 'dkit', name: 'Dundalk Institute of Technology', providers: [/^Dundalk Institute of Technology$/i], city: 'Dundalk', feeYearLabel: 'indicative',
    website: 'https://www.dkit.ie/', publicListName: 'Dundalk Institute of Technology', group: 'Institute of Technology',
    websiteCheck: 'https://www.dkit.ie/study/international/fees',
    fees: [
      { url: 'https://www.dkit.ie/study/international/fees', parser: 'table', level: 'mixed', feeHeader: /total fee/i, yearNote: 'table headed "Total Fee (indicative)"; academic year not stated in the table' },
    ],
  },
  {
    key: 'griffith', name: 'Griffith College', providers: [/^Griffith College/i], city: 'Dublin', feeYearLabel: 'Sept 2025 intake onwards',
    website: 'https://www.griffith.ie/', group: 'Private college',
    typeEvidence: { url: 'https://www.griffith.ie/help/payments-and-fees', pattern: /As a private third-level institution[^.]*/i, type: 'PRIVATE' },
    description: 'Independent (private) higher-education college with campuses in Dublin, Cork and Limerick; its degree programmes are listed on the TrustEd Ireland eligible programmes list.',
    fees: [
      // Not collected: the fee PDFs linked on griffith.ie/admissions/fees/non-eu-tuition-fees cannot be read reliably
      // without a PDF library (the undergraduate PDF uses embedded Identity-H fonts; in the postgraduate PDF the amounts
      // are laid out apart from their programme names, so amount↔programme cannot be verified mechanically).
    ],
    feesNullReason: 'official non-EU fee PDFs on griffith.ie cannot be read reliably without a PDF library (embedded fonts; amounts laid out apart from programme names)',
  },
  {
    key: 'dbs', name: 'Dublin Business School', providers: [/^Dublin Business School$/i], city: 'Dublin',
    website: 'https://www.dbs.ie/', group: 'Private college',
    typeEvidence: { url: 'https://www.dbs.ie/', pattern: /No\. 1 Independent College in Ireland/i, type: 'PRIVATE', fromTitle: true },
    description: 'Independent (private) higher-education college in Dublin 2; its degree programmes are listed on the TrustEd Ireland eligible programmes list.',
    fees: [
      { url: 'https://www.dbs.ie/docs/default-source/fee-sheets/dbs-fees-international.pdf', parser: 'text', levels: ['bachelor', 'master'], mustContain: /2026\/2027/ },
    ],
  },
  {
    key: 'nci', name: 'National College of Ireland', providers: [/^National College of Ireland$/i], city: 'Dublin',
    website: 'https://www.ncirl.ie/', publicListName: 'National College of Ireland', group: 'College (receives public funding)', typeUnresolved: true,
    description: 'Higher-education college at the IFSC, Dublin; its degree programmes are listed on the TrustEd Ireland eligible programmes list.',
    fees: [
      { url: 'https://www.ncirl.ie/Students/International/Fees-and-Funding/Fees', parser: 'table', level: 'mixed', noHeader: true, mustContain: /International tuition fee/i },
    ],
  },
  {
    key: 'rcsi', name: 'RCSI University of Medicine and Health Sciences', providers: [/^RCSI$/i], city: 'Dublin',
    website: 'https://www.rcsi.com/', publicListName: 'Royal College of Surgeons Ireland', group: 'University of medicine and health sciences', typeUnresolved: true,
    description: 'University of medicine and health sciences on St Stephen\'s Green, Dublin (listed as "RCSI" on the TrustEd Ireland eligible programmes list).',
    fees: [], // fees are published per programme page only; not collected
    feesNullReason: 'RCSI publishes fees per programme page only (no single official non-EU fee schedule); not collected',
  },
  {
    key: 'cct', name: 'CCT College Dublin', providers: [/^CCT College Dublin$/i], city: 'Dublin', feeYearLabel: 'general guideline, year not stated',
    website: 'https://www.cct.ie/', group: 'Private college',
    typeEvidence: { url: 'https://www.cct.ie/course-fees/', pattern: /CCT College Dublin is a private, independent institution/i, type: 'PRIVATE' },
    description: 'Private, independent higher-education college in Dublin 2; its degree programmes are listed on the TrustEd Ireland eligible programmes list.',
    fees: [
      { url: 'https://www.cct.ie/course-fees/', parser: 'text', levels: ['bachelor', 'master'], yearNote: 'page gives a "general guideline" of fees; academic year not stated; "Non EU Offshore" rate used' },
    ],
  },
];

// ---------------------------------------------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
const normName = (s) => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/\(.*?\)/g, ' ')
  .replace(/\bthe\b/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const host = (url) => String(url || '').toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '');
const regDomain = (url) => host(url).split('.').slice(-2).join('.');
const normText = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9.]+/g, ' ').trim();
const eur = (n) => `EUR ${Math.round(n).toLocaleString('en-US')}`;
const usd = (n) => `US$${Math.round(n).toLocaleString('en-US')}`;
const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))))];

let scrapeDoUsed = 0;
const fetchLog = [];

function cachePaths(url) {
  const k = sha(url);
  return { body: path.join(CACHE_DIR, `${k}.bin`), meta: path.join(CACHE_DIR, `${k}.json`) };
}

const looksBlocked = (status, text) => status === 403 || status === 503 || status === 429
  || /<title>\s*(Just a moment|Attention Required)/i.test(text.slice(0, 4000));

// Direct request first (official sites, no key). Sites behind a bot wall (Cloudflare) go through scrape.do.
async function fetchRaw(url, { allowScrapeDo = true } = {}) {
  const p = cachePaths(url);
  if (!REFRESH && fs.existsSync(p.meta) && fs.existsSync(p.body)) {
    const meta = JSON.parse(fs.readFileSync(p.meta, 'utf8'));
    if (Date.now() - new Date(meta.fetchedAt).getTime() < CACHE_MAX_AGE_MS) {
      fetchLog.push({ url, via: `cache (${meta.via}, ${meta.fetchedAt})` });
      return { ...meta, buf: fs.readFileSync(p.body), cached: true };
    }
  }
  const save = (meta, buf) => {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(p.body, buf);
    fs.writeFileSync(p.meta, JSON.stringify(meta, null, 2));
    fetchLog.push({ url, via: meta.via, status: meta.status });
    return { ...meta, buf };
  };
  let status = 0;
  let text = '';
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 45000);
    const res = await fetch(url, { headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*', 'Accept-Language': 'en-IE,en;q=0.9' }, redirect: 'follow', signal: ctrl.signal });
    clearTimeout(t);
    status = res.status;
    const buf = Buffer.from(await res.arrayBuffer());
    text = buf.toString('latin1');
    if (res.ok && !looksBlocked(status, text)) {
      return save({ url, finalUrl: res.url, status, contentType: res.headers.get('content-type') || '', via: 'direct', fetchedAt: new Date().toISOString() }, buf);
    }
  } catch (err) {
    status = `error: ${err.message}`;
  }
  if (!allowScrapeDo || NO_SCRAPEDO || !process.env.SCRAPE_DO_TOKEN || scrapeDoUsed >= MAX_SCRAPEDO) {
    throw new Error(`blocked/failed (${status}) and scrape.do not used (${scrapeDoUsed}/${MAX_SCRAPEDO} used)`);
  }
  scrapeDoUsed += 1;
  const res = await fetch(`https://api.scrape.do/?token=${process.env.SCRAPE_DO_TOKEN}&url=${encodeURIComponent(url)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!res.ok || looksBlocked(res.status, buf.toString('latin1'))) throw new Error(`scrape.do HTTP ${res.status}`);
  return save({ url, finalUrl: url, status: res.status, contentType: res.headers.get('content-type') || '', via: 'scrape.do', directStatus: status, fetchedAt: new Date().toISOString() }, buf);
}

// HTML → readable text; block elements get spaces so table cells don't run together
function htmlToText(html) {
  const $ = cheerio.load(html);
  $('script,style,noscript,svg,iframe').remove();
  $('td,th,li,p,div,br,tr,h1,h2,h3,h4,h5,h6,section,article').append(' ');
  return { $, title: $('title').first().text().replace(/\s+/g, ' ').trim(), text: $('body').text().replace(/\s+/g, ' ').trim() };
}

// ---------------------------------------------------------------------------------------------------------------
// .xlsx reader (zip + XML) using only zlib
// ---------------------------------------------------------------------------------------------------------------
function unzip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i -= 1) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('not a zip file');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const files = {};
  for (let n = 0; n < count; n += 1) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('bad zip central directory');
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const data = buf.subarray(start, start + csize);
    files[name] = () => (method === 0 ? data : zlib.inflateRawSync(data));
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}
const xmlDecode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&amp;/g, '&');
function readXlsx(buf) {
  const z = unzip(buf);
  const shared = [];
  if (z['xl/sharedStrings.xml']) {
    const xml = z['xl/sharedStrings.xml']().toString('utf8');
    for (const si of xml.matchAll(/<si>([\s\S]*?)<\/si>/g)) shared.push(xmlDecode([...si[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join('')));
  }
  const wb = z['xl/workbook.xml']().toString('utf8');
  const rels = z['xl/_rels/workbook.xml.rels']().toString('utf8');
  const sheets = [];
  for (const s of wb.matchAll(/<sheet [^>]*?name="([^"]+)"[^>]*?r:id="([^"]+)"/g)) {
    const rel = rels.match(new RegExp(`<Relationship[^>]*Id="${s[2]}"[^>]*>`))[0];
    const target = rel.match(/Target="([^"]+)"/)[1];
    const xml = z[`xl/${target.replace(/^\/?xl\//, '')}`]().toString('utf8');
    const rows = [];
    for (const r of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
      const row = [];
      for (const c of r[1].matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const ref = (c[1].match(/r="([A-Z]+)\d+"/) || [])[1] || 'A';
        const t = (c[1].match(/t="([^"]+)"/) || [])[1];
        const inner = c[2] || '';
        let v = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
        if (t === 's') v = shared[Number(v)];
        else if (t === 'inlineStr') v = xmlDecode([...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join(''));
        else if (v !== undefined) v = xmlDecode(v);
        let col = 0;
        for (const ch of ref) col = col * 26 + (ch.charCodeAt(0) - 64);
        row[col - 1] = v == null ? '' : String(v).replace(/\s+/g, ' ').trim();
      }
      rows.push(Array.from(row, (x) => x || ''));
    }
    sheets.push({ name: xmlDecode(s[1]), rows });
  }
  return sheets;
}

// ---------------------------------------------------------------------------------------------------------------
// Minimal PDF text extraction (Flate streams + Tj/TJ string operators, WinAnsi/cp1252 fonts only). Text drawn
// with embedded Identity-H fonts cannot be decoded this way and is dropped (never guessed).
// ---------------------------------------------------------------------------------------------------------------
const CP1252 = { 0x80: '€', 0x82: '‚', 0x84: '„', 0x85: '…', 0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—', 0x99: '™' };
function decodePdfLiteral(s) {
  let out = '';
  for (let i = 0; i < s.length; i += 1) {
    let ch = s[i];
    if (ch === '\\') {
      const nx = s[i + 1];
      if (/[0-7]/.test(nx)) {
        const oct = s.slice(i + 1, i + 4).match(/^[0-7]{1,3}/)[0];
        i += oct.length;
        const code = parseInt(oct, 8);
        ch = CP1252[code] || (code < 32 ? ' ' : String.fromCharCode(code));
      } else {
        i += 1;
        ch = { n: ' ', r: ' ', t: ' ', b: '', f: '' }[nx] ?? nx;
      }
    } else {
      const code = ch.charCodeAt(0);
      if (CP1252[code]) ch = CP1252[code];
      else if (code < 32) ch = ' ';
    }
    out += ch;
  }
  return out;
}
function pdfToText(buf) {
  const s = buf.toString('latin1');
  const parts = [];
  const re = /stream\r?\n/g;
  let m;
  while ((m = re.exec(s))) {
    const start = m.index + m[0].length;
    const end = s.indexOf('endstream', start);
    if (end < 0) break;
    let data;
    try { data = zlib.inflateSync(buf.subarray(start, end)).toString('latin1'); } catch (_) { continue; }
    if (!/T[Jj]/.test(data)) continue;
    const segs = [];
    for (const t of data.matchAll(/\[((?:[^\]\\]|\\.)*)\]\s*TJ|\(((?:[^)\\]|\\.)*)\)\s*Tj/g)) {
      if (t[1] !== undefined) {
        let str = '';
        for (const x of t[1].matchAll(/\(((?:[^)\\]|\\.)*)\)|(-?\d+(?:\.\d+)?)/g)) {
          if (x[1] !== undefined) str += decodePdfLiteral(x[1]);
          else if (Number(x[2]) < -150) str += ' '; // large negative kerning = word space
        }
        segs.push(str);
      } else segs.push(decodePdfLiteral(t[2]));
    }
    parts.push(segs.join(' '));
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------------------------------------------
// Official programme lists (ILEP + TrustEd Ireland)
// ---------------------------------------------------------------------------------------------------------------
async function findListUrls() {
  try {
    const page = await fetchRaw(ISD_PAGE, { allowScrapeDo: false });
    const html = page.buf.toString('utf8');
    const hrefs = [...html.matchAll(/href="([^"]+\.xlsx)"/gi)].map((x) => x[1]);
    const ilep = hrefs.find((h) => /Interim-List-of-Eligible-Programmes/i.test(h));
    const trusted = hrefs.find((h) => /trusted-?ireland/i.test(h));
    return { ilep: ilep || FALLBACK_ILEP_XLSX, trusted: trusted || FALLBACK_TRUSTED_XLSX, foundOnPage: Boolean(ilep && trusted) };
  } catch (err) {
    return { ilep: FALLBACK_ILEP_XLSX, trusted: FALLBACK_TRUSTED_XLSX, foundOnPage: false, error: err.message };
  }
}

const parseNfq = (v) => {
  const m = String(v || '').match(/^(?:level\s*)?(\d{1,2})\b/i);
  const n = m ? Number(m[1]) : NaN;
  return n >= 1 && n <= 10 ? n : null;
};

async function loadList(url, listName) {
  const file = await fetchRaw(url, { allowScrapeDo: false });
  const sheet = readXlsx(file.buf).find((s) => s.rows.length > 2);
  const headerIdx = sheet.rows.findIndex((r) => /programme ref/i.test(r[0] || ''));
  const edition = sheet.rows.slice(0, Math.max(1, headerIdx)).map((r) => r.filter(Boolean).join(' ')).join(' ').trim();
  const rows = sheet.rows.slice(headerIdx + 1).filter((r) => r[0] && r[2]).map((r) => ({
    list: listName, ref: r[0], programmeType: r[1], provider: r[2].trim(), address: r[3], email: r[4],
    title: r[7], awardingBody: r[8], awardTitle: r[9], duration: r[10], nfqRaw: r[12], nfq: parseNfq(r[12]),
  }));
  return { url, listName, edition, fileName: decodeURIComponent(url.split('/').pop()), fetchedVia: file.via, fetchedAt: file.fetchedAt, rows };
}

const isHigherEdDegree = (r) => /higher education/i.test(r.programmeType) && /major/i.test(r.programmeType)
  && !/non[- ]?major/i.test(r.programmeType) && r.nfq >= 7 && r.nfq <= 10;

// ---------------------------------------------------------------------------------------------------------------
// Programme titles → clean course names
// ---------------------------------------------------------------------------------------------------------------
const DEGREE_WORD = /\b(bachelors?|masters?|doctor|doctorate|diploma|certificate|B\.?A|B\.?Sc|M\.?Sc|M\.?A|MBA|MBS|LL\.?M|LL\.?B|Ph\.?D|M\.?Phil|B\.?Eng|M\.?Eng|BBS|BComm|BBA|BMus|MMus|M\.?Ed|B\.?Ed|MArch|BArch|MRes|MPH|MLitt|MFA|HDip|PgDip|PGDip)\b/i;
const BACH = { arts: 'BA', science: 'BSc', engineering: 'BEng', commerce: 'BComm', laws: 'LLB', music: 'BMus', education: 'BEd' };
const MAST = { science: 'MSc', arts: 'MA', philosophy: 'MPhil', laws: 'LLM', engineering: 'MEng', education: 'MEd', music: 'MMus', 'business administration': 'MBA' };
const ABBR = 'BA|BSc|BEng|BComm|LLB|BMus|BEd|BBS|MSc|MA|MPhil|LLM|MEng|MEd|MMus|MBA|PhD|PgDip|HDip';
// Not a programme a student applies to (exam registrations, access/module/visiting registrations)
const COURSE_EXCLUDE_RE = /qualifying exam|\baccess\b|single module|\bmodule\b|occasional|visiting|exchange|study abroad|erasmus(?! mundus)/i;
// Irish-language versions of programmes (the English title is listed separately)
const IRISH_TITLE_RE = /\b(agus|sa|le|léann|máistreacht|máistir|dioplóma|baitsiléir|innealtóireacht|nuálaíocht|ionstraimíocht|struchtúrtha|eolaíocht|cumarsáid|teicneolaíocht|cuntasaíocht)\b/i;
const ENGLISH_WORD_RE = /\b(of|and|the|with|for|in|studies|science|engineering|management|business|technology|education|law|arts?)\b/i;
const ACRONYMS = { MSC: 'MSc', BSC: 'BSc', MBA: 'MBA', LLM: 'LLM', LLB: 'LLB', BA: 'BA', MA: 'MA', MENG: 'MEng', BENG: 'BEng', MED: 'MEd', BED: 'BEd', BBS: 'BBS', BBA: 'BBA', PHD: 'PhD', HDIP: 'HDip', IT: 'IT', AI: 'AI', HR: 'HR', HRM: 'HRM', UX: 'UX', ICT: 'ICT', EU: 'EU', MPHIL: 'MPhil', MSOCSC: 'MSocSc', BCL: 'BCL', NCI: 'NCI', ACCA: 'ACCA', CPA: 'CPA', STEM: 'STEM', IOT: 'IoT', TESOL: 'TESOL', MLITT: 'MLitt', MPH: 'MPH' };
const SMALL = new Set(['and', 'of', 'in', 'the', 'for', 'with', 'to', 'on', 'at', 'by', 'a', 'an', 'or']);
function fixCase(t) {
  const letters = t.replace(/[^A-Za-z]/g, '');
  if (!letters || letters !== letters.toUpperCase()) return t; // only ALL-CAPS titles are re-cased
  return t.toLowerCase().split(' ').map((w, i) => {
    const bare = w.replace(/[^a-z]/g, '').toUpperCase();
    if (ACRONYMS[bare]) return w.replace(/[a-z]+/i, ACRONYMS[bare]);
    if (i > 0 && SMALL.has(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}
function cleanTitle(t) {
  return fixCase(String(t || '').replace(/\s+/g, ' ').replace(/\s+\|\s+.*$/, '').trim()) // "English | Irish" bilingual titles
    .replace(/(\b[\w&'(),.-]+(?:\s+[\w&'(),.-]+){2,}?)\s+(?:\1\s+)+/g, '$1 ') // "X Y and X Y and X Y and Z" → "X Y and Z"
    .replace(/^(?:[A-Z0-9]*\d[A-Z0-9]*)(?:\s*[-–])?\s+/, '') // leading code with a digit (1AIT1 -, DCE18 -, BMG1, 3U)
    .replace(/^[A-Z]{2,5}\s+(?=(?:Bachelor|Master|Doctor|Higher|Post|Graduate)\b)/, '') // leading letter code (BPC Bachelor …)
    .replace(/\s*[-–(]?\s*\b(?:[A-Z]{2,3}\d{3}[A-Z]?|TU\d{3}[A-Z]?)\b\s*\)?/g, ' ') // CAO / course codes (CK202, TU856, MH101)
    .replace(/\((?:level|nfq)\s*\d+\)|\blevel\s*\d+\b/gi, ' ')
    .replace(/\(\s*[A-Z]{2,4}\d{2,4}[A-Z]?\s*\)/g, ' ')
    .replace(/\b(?:full[- ]?time|part[- ]?time|FT|PT)\b/gi, ' ')
    .replace(/\*/g, ' ')
    .replace(/\(\s*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[\s\-–:,(/]+$/, '')
    .replace(/^[\s\-–:,)/]+/, '')
    .trim();
}
function shortenDegree(t) {
  return t
    .replace(/^(bsc|msc|beng|meng|mba|llm|llb|phd|mphil)(?=\s)/i, (m) => ({ bsc: 'BSc', msc: 'MSc', beng: 'BEng', meng: 'MEng', mba: 'MBA', llm: 'LLM', llb: 'LLB', phd: 'PhD', mphil: 'MPhil' }[m.toLowerCase()]))
    .replace(/^(.+?) \((Master|Bachelor) of\)$/i, (m, subject, deg) => `${deg} of ${subject}`)
    .replace(/^M\.\s?Sc\.?(?=\s|$)/, 'MSc').replace(/^B\.\s?Sc\.?(?=\s|$)/, 'BSc').replace(/^M\.\s?A\.?(?=\s|$)/, 'MA')
    .replace(/^B\.\s?A\.?(?=\s|$)/, 'BA').replace(/^M\.\s?B\.\s?A\.?(?=\s|$)/, 'MBA').replace(/^LL\.\s?M\.?(?=\s|$)/, 'LLM')
    .replace(/^LL\.\s?B\.?(?=\s|$)/, 'LLB').replace(/^M\.\s?Eng\.?(?=\s|$)/, 'MEng').replace(/^M\.\s?Phil\.?(?=\s|$)/, 'MPhil')
    .replace(/^(?:honours\s+)?bachelors?\s+(?:of|in)\s+(arts|science|engineering|commerce|laws|music|education)\b(\s*\((?:honours|hons)\))?(\s*\((?:moderatorship|mod)\))?/i,
      (m, f, h) => `${BACH[f.toLowerCase()]}${h || /^honours/i.test(m) ? ' (Hons)' : ''}`)
    .replace(/^masters?\s+(?:of|in)\s+(science|arts|philosophy|laws|engineering|education|music|business administration)\b/i, (m, f) => MAST[f.toLowerCase()])
    .replace(/^(?:doctor\s+(?:of|in)\s+philosophy|doctorate)\b/i, 'PhD')
    .replace(/^postgraduate diploma\b/i, 'PgDip')
    .replace(/^higher diploma\b/i, 'HDip')
    .replace(new RegExp(`^(${ABBR})( \\((?:Hons|Ord)\\))? \\((?:\\1|BA|BSc|MSc|MA|MBA|Hons|Honours)\\)`), '$1$2')
    .replace(new RegExp(`^(${ABBR})( \\((?:Hons|Ord)\\))?\\s*(?:in\\b|-|–|:)\\s*`), '$1$2 ')
    .replace(new RegExp(`^(${ABBR}) \\(([^()]+)\\)$`), '$1 $2')
    // "Advanced Accounting (M.Sc./P.Grad.Dip.)" → "MSc Advanced Accounting"
    .replace(/^(.+?) \((M\.?\s?Sc|M\.?\s?A|M\.?\s?B\.?\s?A|LL\.?\s?M|M\.?\s?Phil|B\.?\s?A|B\.?\s?Sc|B\.?\s?Eng|LL\.?\s?B)\.?(?:\/[^)]*)?\)$/i, (m, subject, deg) => `${{ msc: 'MSc', ma: 'MA', mba: 'MBA', llm: 'LLM', mphil: 'MPhil', ba: 'BA', bsc: 'BSc', beng: 'BEng', llb: 'LLB' }[deg.replace(/[^a-z]/gi, '').toLowerCase()]} ${subject}`)
    .replace(new RegExp(`^(${ABBR})\\b(.*?)\\s*\\(\\1\\)$`), '$1$2') // "MSc Civil Engineering (MSc)"
    .replace(/\bSchool of\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function programmeKind(r) {
  const both = `${r.title} ${r.awardTitle}`;
  if (r.nfq === 10) return 'phd';
  if (r.nfq === 9) {
    if (/by research|\(research\)|\bresearch\b(?! methods| and)|\bMRes\b/i.test(both)) return 'research';
    return MASTER_RE.test(both) && !/^(post)?graduate (diploma|certificate)/i.test(r.awardTitle) ? 'master' : 'diploma';
  }
  if (r.nfq === 7 || r.nfq === 8) return BACHELOR_RE.test(both) && !/^(higher )?diploma/i.test(r.awardTitle) ? 'bachelor' : 'diploma';
  return 'other';
}
function courseName(r) {
  let t = cleanTitle(r.title);
  const award = cleanTitle(r.awardTitle);
  if (award && t.replace(/[^A-Za-z]/g, '').length <= 5) t = award;
  else if (!DEGREE_WORD.test(t) && award) t = normText(award).includes(normText(t)) ? award : `${award} in ${t}`;
  return shortenDegree(t);
}
// Evenly spaced pick from an alphabetical list, so a cap keeps subjects from A to Z
const spread = (list, n) => (list.length <= n ? list : Array.from({ length: n }, (_, i) => list[Math.floor((i * list.length) / n)]));
function buildCourses(programmes) {
  const groups = { master: [], bachelor: [], diploma: [], research: [], phd: [] };
  const kinds = { master: 0, bachelor: 0, diploma: 0, research: 0, phd: 0 };
  const dropped = { notAProgramme: 0, irishLanguageTitle: 0, duplicate: 0 };
  const seen = new Set();
  for (const r of programmes) {
    const kind = programmeKind(r);
    if (!groups[kind]) continue;
    kinds[kind] += 1;
    const name = courseName(r);
    if (COURSE_EXCLUDE_RE.test(`${r.title} ${name}`)) { dropped.notAProgramme += 1; continue; }
    if ((IRISH_TITLE_RE.test(name) || /[áéíóú]/i.test(name)) && !ENGLISH_WORD_RE.test(name.replace(/^(?:MSc|MA|BA|BSc|PhD|LLM|MEng|BEng)\b/, ''))) { dropped.irishLanguageTitle += 1; continue; }
    const key = normText(name).replace(/[^a-z0-9]/g, '');
    if (!name || name.length < 6 || seen.has(key)) { dropped.duplicate += 1; continue; }
    seen.add(key);
    groups[kind].push(name);
  }
  for (const g of Object.values(groups)) g.sort((a, b) => a.localeCompare(b));
  // Master's first (≤ 90), then Bachelor's; unused room goes to the other, then diplomas, then research/doctorates
  const nMasters = Math.min(groups.master.length, Math.max(90, COURSE_CAP - groups.bachelor.length));
  const masters = spread(groups.master, nMasters);
  const bachelors = spread(groups.bachelor, COURSE_CAP - masters.length);
  const list = [...masters, ...bachelors];
  for (const extra of [groups.diploma, groups.research, groups.phd]) if (list.length < COURSE_CAP) list.push(...spread(extra, COURSE_CAP - list.length));
  const levels = [];
  if (kinds.bachelor) levels.push(LEVEL_LABEL.bachelor);
  if (kinds.master || kinds.research) levels.push(LEVEL_LABEL.master);
  if (kinds.phd) levels.push(LEVEL_LABEL.phd);
  return { courses: list.slice(0, COURSE_CAP), degreeLevels: levels, counts: { programmesByKind: kinds, distinctNames: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])), dropped } };
}

// ---------------------------------------------------------------------------------------------------------------
// Fees
// ---------------------------------------------------------------------------------------------------------------
function parseEuro(v, plainNumbers = false) {
  const s = String(v || '');
  let m = s.match(/€\s?(\d{1,3}(?:,\d{3})+|\d{4,6})(?:\.\d{2})?(?!\d)/);
  if (!m && plainNumbers) m = s.trim().match(/^(\d{1,3}(?:,\d{3})+|\d{4,6})(?:\.\d{2})?$/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

// Header row with colspans expanded so header positions line up with data cells
function rowCells($, tr) {
  const cells = [];
  $(tr).find('th,td').each((_, c) => {
    const text = $(c).text().replace(/\s+/g, ' ').trim();
    const span = Math.min(10, Number($(c).attr('colspan')) || 1);
    for (let i = 0; i < span; i += 1) cells.push(i === 0 ? text : '');
  });
  return cells;
}

function classifyLabel(label, level) {
  if (EXCLUDE_RE.test(label)) return { skip: 'excluded (part-time/module/certificate/other)' };
  if (MEDICAL_RE.test(label)) return { skip: 'medicine/dentistry/veterinary (outlier, excluded from typical range)' };
  if (RESEARCH_RE.test(label)) return { skip: 'research/doctoral' };
  if (level === 'master') return MASTER_RE.test(label) && !/^(?:post)?graduate diploma|^h\.?\s?dip|^higher diploma/i.test(label) ? { level: 'master' } : { skip: 'not a taught master\'s' };
  if (level === 'bachelor') {
    if (MASTER_RE.test(label) && !BACHELOR_RE.test(label)) return { skip: 'master\'s on undergraduate page' };
    if (DIPLOMA_RE.test(label) && !BACHELOR_RE.test(label)) return { skip: 'diploma' };
    return { level: 'bachelor' };
  }
  // mixed pages: decide by the label
  if (MASTER_RE.test(label) || /postgraduate(?!.*diploma)/i.test(label)) return DIPLOMA_RE.test(label) && !MASTER_RE.test(label) ? { skip: 'diploma' } : { level: 'master' };
  if (BACHELOR_RE.test(label)) return DIPLOMA_RE.test(label) ? { skip: 'diploma' } : { level: 'bachelor' };
  return { skip: 'not a bachelor\'s/master\'s row' };
}

function parseTableSource(html, src) {
  const $ = cheerio.load(html);
  const entries = [];
  const skipped = {};
  $('table').each((tableIdx, table) => {
    if (src.tables && !src.tables.includes(tableIdx)) return;
    const trs = $(table).find('tr').toArray();
    let headerIdx = src.noHeader ? -1 : trs.findIndex((tr) => $(tr).find('th').length > 0);
    if (headerIdx === -1 && !src.noHeader) headerIdx = 0;
    const header = headerIdx >= 0 ? rowCells($, trs[headerIdx]) : [];
    const feeCols = src.feeHeader ? header.map((h, i) => (src.feeHeader.test(h) && !/part[- ]?time/i.test(h) ? i : -1)).filter((i) => i >= 0) : [];
    if (src.feeHeader && !feeCols.length) return;
    const labelCol = src.labelIndex !== undefined ? src.labelIndex : src.labelHeader ? header.findIndex((h) => src.labelHeader.test(h)) : -1;
    const euCol = header.findIndex((h) => /\beu\b/i.test(h) && !/non[- ]?eu/i.test(h) && !/part[- ]?time|contribution/i.test(h));
    for (let r = headerIdx + 1; r < trs.length; r += 1) {
      const cells = rowCells($, trs[r]);
      if (!cells.some(Boolean)) continue;
      if (src.rowFilter && !src.rowFilter(cells, header)) continue;
      // first fee cell holding a plausible yearly amount (a cell can start with a module price)
      let amount = null;
      let amountCol = null;
      for (const c of (feeCols.length ? feeCols : cells.map((_, i) => i))) {
        const a = parseEuro(cells[c], src.plainNumbers);
        if (a && a >= MIN_FEE_EUR) { amount = a; amountCol = c; break; }
        if (a && amount === null) { amount = a; amountCol = c; }
      }
      if (!amount) continue;
      if (PER_PROGRAMME_RE.test(cells.join(' '))) { skipped['fee for whole programme, not per year'] = (skipped['fee for whole programme, not per year'] || 0) + 1; continue; }
      const label = labelCol >= 0 ? cells[labelCol] : cells.find((c) => c && !parseEuro(c, true) && !/^[A-Z0-9-]{3,12}$/.test(c));
      if (!label) continue;
      const cls = classifyLabel(label, src.level);
      if (cls.skip) { skipped[cls.skip] = (skipped[cls.skip] || 0) + 1; continue; }
      if (amount < MIN_FEE_EUR || amount > MAX_FEE_EUR) { skipped['implausible amount'] = (skipped['implausible amount'] || 0) + 1; continue; }
      // Same low fee for EU and non-EU = professional/online programme not priced for international students
      if (euCol >= 0 && parseEuro(cells[euCol], src.plainNumbers) === amount && amount < 12000) {
        skipped['same low fee for EU and non-EU (professional/online programme)'] = (skipped['same low fee for EU and non-EU (professional/online programme)'] || 0) + 1;
        continue;
      }
      entries.push({
        level: cls.level, amount, label,
        quote: cells.filter(Boolean).join(' '),
        column: feeCols.length ? header[amountCol] : null,
      });
    }
  });
  return { entries, skipped };
}

function parsePdfRowsSource(text, src) {
  const entries = [];
  const skipped = {};
  for (const m of text.matchAll(src.rowRegex)) {
    const g = m.groups;
    if (src.rowKeep && !src.rowKeep(g)) { skipped['filtered row'] = (skipped['filtered row'] || 0) + 1; continue; }
    const amount = parseEuro(`€${g.amount}`);
    if (!amount) { skipped['no amount (TBC/-)'] = (skipped['no amount (TBC/-)'] || 0) + 1; continue; }
    const label = `${g.label}${g.award ? ` ${g.award}` : ''}`.replace(/\s+/g, ' ').trim();
    const cls = classifyLabel(label, src.level);
    if (cls.skip) { skipped[cls.skip] = (skipped[cls.skip] || 0) + 1; continue; }
    if (amount < MIN_FEE_EUR || amount > MAX_FEE_EUR) { skipped['implausible amount'] = (skipped['implausible amount'] || 0) + 1; continue; }
    entries.push({ level: cls.level, amount, label, quote: m[0].replace(/\s+/g, ' ').trim() });
  }
  return { entries, skipped };
}

// Text pages: Groq extracts {level, amount, quote}; kept only if the quote is in the page and contains the amount
async function groqJson(prompt) {
  const cacheFile = path.join(CACHE_DIR, `llm-${sha(prompt)}.json`);
  if (!REFRESH && fs.existsSync(cacheFile)) return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY missing');
  for (const model of GROQ_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
      });
      if (res.status === 429) { await sleep(20000); continue; }
      if (!res.ok) break;
      const j = await res.json();
      try {
        const out = { model, data: JSON.parse(j.choices[0].message.content) };
        fs.mkdirSync(CACHE_DIR, { recursive: true });
        fs.writeFileSync(cacheFile, JSON.stringify(out, null, 2));
        return out;
      } catch (_) { break; }
    }
  }
  throw new Error('Groq extraction failed');
}

function condense(text, maxChars = 12000) {
  const windows = [];
  for (const m of text.matchAll(/€\s?\d/g)) windows.push([Math.max(0, m.index - 260), Math.min(text.length, m.index + 160)]);
  windows.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const w of windows) {
    if (merged.length && w[0] <= merged[merged.length - 1][1]) merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], w[1]);
    else merged.push([...w]);
  }
  return merged.map(([a, b]) => text.slice(a, b)).join('\n…\n').slice(0, maxChars);
}

const digitsOnly = (s) => String(s).replace(/(\d)[,.\s](?=\d{3}(?!\d))/g, '$1');
function verifyFee(e, pageNorm) {
  const amount = Number(e.amountEUR);
  const quote = String(e.quote || '');
  if (!quote || !Number.isFinite(amount)) return 'missing quote or amount';
  if (!pageNorm.includes(normText(quote))) return 'quote not found on page';
  if (!digitsOnly(quote).includes(String(amount))) return 'amount not in quote';
  if (amount < MIN_FEE_EUR || amount > MAX_FEE_EUR) return 'implausible amount';
  return null;
}

// The model sometimes shortens/joins its quote. Then the amount is looked up in the page itself: the nearest
// degree-level keyword before it must match the model's level, with no other amount, diploma/certificate or excluded
// term in between. The verbatim page snippet becomes the quote.
const LEVEL_KW = /postgraduate|undergraduate|master'?s?|bachelor'?s?|honours degree|ordinary degree|\bM\.?Sc\b|\bMBA\b|diploma|certificate|foundation/ig;
function repairQuote(e, text) {
  const amount = Number(e.amountEUR);
  if (!Number.isFinite(amount)) return null;
  const want = e.level === 'master' ? /^(postgraduate|master|\bM\.?Sc|MBA)/i : /^(undergraduate|bachelor|honours degree|ordinary degree)/i;
  const amountRe = new RegExp(`€\\s?(?:${amount.toLocaleString('en-US')}|${amount})(?![\\d,])`, 'g');
  for (const m of text.matchAll(amountRe)) {
    const from = Math.max(0, m.index - 300);
    const before = text.slice(from, m.index);
    const kws = [...before.matchAll(LEVEL_KW)];
    if (!kws.length) continue;
    const last = kws[kws.length - 1];
    if (!want.test(last[0])) continue;
    const seg = before.slice(last.index + last[0].length).replace(/€\s?[\d,]+\s*(?:-|–|to)\s*$/, '');
    if (/€\s?\d/.test(seg) || EXCLUDE_RE.test(seg) || DIPLOMA_RE.test(seg)) continue;
    const start = text.lastIndexOf(' ', Math.max(0, from + last.index - 40)) + 1;
    const end = text.indexOf(' ', m.index + m[0].length + 12);
    return text.slice(start, end === -1 ? text.length : end).trim();
  }
  return null;
}

async function parseTextSource(text, src, inst) {
  const levels = src.levels.map((l) => (l === 'bachelor' ? 'undergraduate bachelor\'s degrees' : 'taught master\'s degrees')).join(' and ');
  const prompt = `You read the text of an official fee page (or fee PDF) of an Irish higher-education institution and list the YEARLY TUITION FEES FOR NON-EU (international) FULL-TIME students for ${levels}.
Institution: ${inst.name}
Source: ${src.url}

Return ONLY JSON: {"fees":[{"level":"bachelor"|"master","amountEUR":number,"programme":string,"quote":string}]}
Rules:
- level "bachelor" = undergraduate ordinary/honours bachelor's degrees; "master" = taught master's degrees.${src.levels.length === 1 ? ` Only level "${src.levels[0]}" is wanted.` : ''}
- Skip everything else: higher certificates, higher/postgraduate diplomas, foundation, English, PhD/research, part-time, online, modules, deposits, application/registration/levy/AIP fees, scholarships, bursaries, fees after scholarship, EU fees.
- Only amounts that the text says apply to non-EU / international students (a page about international fees counts).
- One entry per distinct amount (e.g. a general rate plus any listed exceptions).
- amountEUR = the yearly tuition number as written (e.g. "€14,500" → 14500).
- quote = copy EXACTLY a short contiguous snippet (max 30 words) of the text that contains the amount and shows what it is for.
- If nothing qualifies return {"fees":[]}.

TEXT:
${condense(text)}`;
  const { model, data } = await groqJson(prompt);
  const pageNorm = normText(text);
  const entries = [];
  const rejected = [];
  for (const e of (data.fees || [])) {
    if (!src.levels.includes(e.level)) { rejected.push({ ...e, rejected: 'level not requested' }); continue; }
    const label = String(e.programme || '');
    if (verifyFee(e, pageNorm) === 'quote not found on page') {
      const repaired = repairQuote(e, text);
      if (repaired) { e.modelQuote = e.quote; e.quote = repaired; e.quoteFromPage = true; }
    }
    const why = verifyFee(e, pageNorm)
      || (EXCLUDE_RE.test(`${label} ${e.quote}`) ? 'excluded (part-time/online/module/certificate/other)' : null)
      || (MEDICAL_RE.test(label) ? 'medicine/dentistry/veterinary' : null)
      || (RESEARCH_RE.test(label) ? 'research/doctoral' : null);
    if (why) rejected.push({ ...e, rejected: why });
    else entries.push({ level: e.level, amount: Number(e.amountEUR), label, quote: e.quote, ...(e.quoteFromPage ? { quoteFromPage: true, modelQuote: e.modelQuote } : {}) });
  }
  return { entries, rejected, model };
}

async function collectFees(inst) {
  const sources = [];
  for (const src of inst.fees) {
    const rec = { url: src.url, parser: src.parser, via: src.via || null, yearNote: src.yearNote || null };
    try {
      const raw = await fetchRaw(src.url);
      rec.fetchedVia = raw.via;
      const isPdf = /pdf/i.test(raw.contentType) || raw.buf.slice(0, 5).toString() === '%PDF-';
      const page = isPdf ? { title: null, text: pdfToText(raw.buf) } : htmlToText(raw.buf.toString('utf8'));
      rec.title = page.title;
      if (src.mustContain && !src.mustContain.test(page.text)) throw new Error(`page no longer contains ${src.mustContain}`);
      if (src.mustContain) rec.pageCheck = (page.text.match(src.mustContain) || [])[0];
      let out;
      if (src.parser === 'table') out = parseTableSource(raw.buf.toString('utf8'), src);
      else if (src.parser === 'pdfRows') out = parsePdfRowsSource(page.text, src);
      else out = await parseTextSource(page.text, src, inst);
      // Every kept quote must be readable in the fetched page text (tables: row text; pdf: matched row)
      const pageNorm = normText(page.text);
      rec.entries = out.entries.filter((e) => pageNorm.includes(normText(e.quote)));
      rec.unverifiable = out.entries.length - rec.entries.length;
      rec.skipped = out.skipped || undefined;
      rec.rejected = out.rejected && out.rejected.length ? out.rejected : undefined;
      rec.model = out.model;
    } catch (err) {
      rec.error = err.message;
      rec.entries = [];
    }
    sources.push(rec);
  }
  const summarize = (level) => {
    const seen = new Set();
    const items = [];
    for (const s of sources) {
      for (const e of s.entries.filter((x) => x.level === level)) {
        const k = `${normText(e.label)}|${e.amount}`;
        if (seen.has(k)) continue;
        seen.add(k);
        items.push({ ...e, url: s.url });
      }
    }
    if (!items.length) return null;
    const sorted = items.map((i) => i.amount).sort((a, b) => a - b);
    let typical = sorted.length >= 10 ? [quantile(sorted, 0.25), quantile(sorted, 0.75)] : [sorted[0], sorted[sorted.length - 1]];
    let typicalIs = sorted.length >= 10 ? 'middle 50% (25th–75th percentile) of listed programmes' : 'min–max of listed amounts';
    if (sorted.length >= 10 && typical[0] === typical[1]) { // most programmes share one fee: show the 10th–90th percentile
      typical = [quantile(sorted, 0.1), quantile(sorted, 0.9)];
      typicalIs = '10th–90th percentile of listed programmes (middle 50% share one fee)';
    }
    const median = sorted[Math.floor((sorted.length - 1) / 2)]; // lower median: with a general rate + one exception, the general rate
    const pick = (amt) => items.find((i) => i.amount === amt);
    const evidence = [...new Set([sorted[0], typical[0], median, typical[1], sorted[sorted.length - 1]])].map(pick)
      .map((i) => ({ url: i.url, amountEUR: i.amount, programme: i.label, quote: i.quote, ...(i.quoteFromPage ? { quoteFromPage: true, modelQuote: i.modelQuote } : {}) }));
    return {
      n: items.length, minEUR: sorted[0], maxEUR: sorted[sorted.length - 1], medianEUR: median,
      typicalEUR: typical, typicalIs,
      evidence,
    };
  };
  return { sources, bachelor: summarize('bachelor'), master: summarize('master') };
}

async function eurToUsd() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD', { headers: { 'User-Agent': BROWSER_UA } });
    const j = await res.json();
    if (j?.rates?.USD) return { rate: j.rates.USD, date: j.date, source: 'https://api.frankfurter.app/latest?from=EUR&to=USD (ECB reference rate)' };
  } catch (_) { /* fall through */ }
  return null;
}

// ---------------------------------------------------------------------------------------------------------------
// Revert
// ---------------------------------------------------------------------------------------------------------------
async function revert(reportFile) {
  const report = JSON.parse(fs.readFileSync(path.resolve(reportFile), 'utf8'));
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('universities');
  let restored = 0;
  for (const c of [...(report.updates || []), ...(report.deactivations || [])]) {
    const set = {};
    const unset = {};
    for (const [k, v] of Object.entries(c.diff)) {
      if (v.from === undefined || (v.from === null && k === 'dataSource')) unset[k] = ''; // field did not exist before
      else set[k] = v.from;
    }
    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id) }, update);
    restored += 1;
  }
  // Records created by the sync are hidden (isActive:false), never deleted
  let hidden = 0;
  for (const c of report.creates || []) {
    const r = await col.updateOne({ _id: new mongoose.Types.ObjectId(c.id), 'dataSource.runId': report.runId }, { $set: { isActive: false } });
    hidden += r.modifiedCount;
  }
  console.log(`REVERTED: ${restored} updated/deactivated records restored, ${hidden} created records hidden (isActive:false) from ${reportFile}`);
  await mongoose.disconnect();
}

// ---------------------------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------------------------
(async () => {
  const revertIdx = process.argv.indexOf('--revert');
  if (revertIdx !== -1) return revert(process.argv[revertIdx + 1]);
  const runId = `ireland-${new Date().toISOString()}`;
  console.log(`ILEP / TrustEd Ireland → Irish institutions (${APPLY ? 'APPLY' : 'DRY RUN, nothing is written'})`);

  // 1. Official programme lists
  const listUrls = await findListUrls();
  const [ilep, trusted] = await Promise.all([loadList(listUrls.ilep, 'ILEP'), loadList(listUrls.trusted, 'TrustEd Ireland')]);
  const allRows = [...ilep.rows, ...trusted.rows];
  const heRows = allRows.filter(isHigherEdDegree);
  console.log(`  ILEP: "${ilep.edition}" (${ilep.fileName}) ${ilep.rows.length} rows`);
  console.log(`  TrustEd Ireland: "${trusted.edition}" (${trusted.fileName}) ${trusted.rows.length} rows`);
  console.log(`  higher-education major awards NFQ 7-10: ${heRows.length}`);

  // 2. gov.ie list of publicly funded institutions (type evidence)
  let publicList = null;
  try {
    const raw = await fetchRaw(PUBLIC_HEI_LIST, { allowScrapeDo: false });
    const page = htmlToText(raw.buf.toString('utf8'));
    publicList = { url: PUBLIC_HEI_LIST, title: page.title, text: page.text, norm: normText(page.text), lastUpdated: (page.text.match(/Last updated on:\s*([0-9]{1,2} [A-Za-z]+ [0-9]{4})/) || [])[1] || null };
  } catch (err) {
    console.log(`  ! public HEI list not available: ${err.message}`);
  }

  const fx = await eurToUsd();
  console.log(`  EUR→USD ${fx ? `${fx.rate} (${fx.date})` : 'UNAVAILABLE — USD fee fields left unchanged'}`);

  // 3. Our database (read-only here)
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const ireland = await db.collection('countries').findOne({ name: 'Ireland' });
  if (!ireland) throw new Error('Country "Ireland" not found');
  const ours = await db.collection('universities').find({ country: ireland._id }).toArray();
  console.log(`  our Ireland records: ${ours.length}`);

  const usedProviders = new Set();
  const updates = [];
  const creates = [];
  const deactivations = [];
  const unchanged = [];
  const table = [];
  const uncertainties = [];
  const nulls = [];
  const matchedDbIds = new Set();
  const listsMeta = [
    { list: 'ILEP', edition: ilep.edition, file: ilep.fileName, url: ilep.url, publishedOn: ISD_PAGE },
    { list: 'TrustEd Ireland', edition: trusted.edition, file: trusted.fileName, url: trusted.url, publishedOn: ISD_PAGE },
  ];
  // Hide (never delete) + stamp where the decision came from; previous values kept for --revert
  const deactivationDiff = (u, reason) => ({
    isActive: { from: u.isActive, to: false },
    dataSource: {
      from: u.dataSource,
      to: { provider: 'ILEP + TrustEd Ireland eligible programmes lists (Irish Immigration Service Delivery)', runId, action: 'deactivated', reason, lists: listsMeta.map((l) => ({ list: l.list, edition: l.edition, file: l.file })), urls: [listUrls.ilep, listUrls.trusted, ISD_PAGE], syncedAt: new Date(), fields: ['isActive'] },
    },
  });

  for (const inst of INSTITUTIONS) {
    process.stdout.write(`  · ${inst.name} … `);
    const provRows = allRows.filter((r) => inst.providers.some((re) => re.test(r.provider)));
    const programmes = provRows.filter(isHigherEdDegree);
    provRows.forEach((r) => usedProviders.add(r.provider));
    const providerNames = [...new Set(programmes.map((r) => r.provider))];
    const providerRefs = [...new Set(programmes.map((r) => r.ref.split('/')[0]))];
    const listNames = [...new Set(programmes.map((r) => r.list))];
    const db0 = ours.find((u) => normName(u.name) === normName(inst.name))
      || ours.find((u) => u.website && regDomain(u.website) === regDomain(inst.website));
    if (db0) matchedDbIds.add(String(db0._id));

    if (!programmes.length) {
      console.log('no NFQ 7-10 degree programmes on either list');
      if (db0 && db0.isActive !== false) {
        const reason = `no NFQ level 7-10 higher-education programme for "${inst.name}" on ILEP (${ilep.edition}) or TrustEd Ireland (${trusted.edition})`;
        deactivations.push({ id: String(db0._id), name: db0.name, reason, diff: deactivationDiff(db0, reason) });
        table.push({ institution: db0.name, action: 'deactivate', website: db0.website, type: db0.type, courses: (db0.courses || []).length, source: reason });
      }
      continue;
    }
    const { courses, degreeLevels, counts } = buildCourses(programmes);

    // City must appear in a register address (Dublin postcodes D01–D24 count as Dublin)
    const addresses = [...new Set(provRows.map((r) => r.address).filter(Boolean))];
    const cityOk = addresses.some((a) => new RegExp(`\\b${inst.city}\\b`, 'i').test(a) || (inst.city === 'Dublin' && /\bD\d{2}\b|\bD\d{2}[A-Z0-9]{4}\b/.test(a)));
    const cityEvidence = addresses.find((a) => new RegExp(`\\b${inst.city}\\b`, 'i').test(a) || (inst.city === 'Dublin' && /\bD\d{2}/.test(a)));

    // Website: the page must load and its title must name the institution
    let websiteEvidence = null;
    try {
      const raw = await fetchRaw(inst.websiteCheck || inst.website);
      const page = htmlToText(raw.buf.toString('utf8'));
      const short = inst.name.split(' ').filter((w) => w.length > 3).slice(0, 2);
      const abbr = inst.name.split(' ').filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join('');
      const ok = normText(page.title).includes(normText(inst.name)) || short.every((w) => normText(page.title).includes(normText(w)))
        || new RegExp(`\\b(${abbr}|${inst.key})\\b`, 'i').test(page.title);
      websiteEvidence = { url: inst.websiteCheck || inst.website, title: page.title, verified: ok, via: raw.via };
    } catch (err) {
      websiteEvidence = { url: inst.websiteCheck || inst.website, error: err.message, verified: false };
    }
    const emailDomains = [...new Set(provRows.map((r) => (String(r.email).match(/@([a-z0-9.-]+)/i) || [])[1]).filter(Boolean).map((d) => d.toLowerCase()))];

    // Type: gov.ie list of publicly funded HEIs, or the institution's own statement
    let type = null;
    let typeEvidence = null;
    if (inst.typeUnresolved) {
      typeEvidence = publicList && inst.publicListName && publicList.norm.includes(normText(inst.publicListName))
        ? { url: PUBLIC_HEI_LIST, section: 'Other institutions that receive public funding', listedAs: inst.publicListName, lastUpdated: publicList.lastUpdated, note: 'receives public funding but is an independent body; Public/Private left for a human to decide' }
        : null;
    } else if (inst.publicListName && publicList && publicList.norm.includes(normText(inst.publicListName))) {
      type = 'PUBLIC';
      const section = inst.group === 'Institute of Technology' ? 'Institutes of technology' : 'Publicly-funded universities';
      typeEvidence = { url: PUBLIC_HEI_LIST, title: publicList.title, section, listedAs: inst.publicListName, lastUpdated: publicList.lastUpdated };
    } else if (inst.typeEvidence) {
      try {
        const raw = await fetchRaw(inst.typeEvidence.url);
        const page = htmlToText(raw.buf.toString('utf8'));
        const hit = (inst.typeEvidence.fromTitle ? page.title : page.text).match(inst.typeEvidence.pattern);
        if (hit) { type = inst.typeEvidence.type; typeEvidence = { url: inst.typeEvidence.url, quote: hit[0].trim() }; }
      } catch (err) {
        typeEvidence = { url: inst.typeEvidence.url, error: err.message };
      }
    }

    // Fees
    const fees = await collectFees(inst);
    const b = fees.bachelor;
    const m = fees.master;
    const toUsd = (x) => (fx && x ? Math.round(x * fx.rate) : null);
    const range = (s) => (s.typicalEUR[0] === s.typicalEUR[1] ? eur(s.typicalEUR[0]) : `${eur(s.typicalEUR[0])}–${Math.round(s.typicalEUR[1]).toLocaleString('en-US')}`);
    const usdRange = (s) => (s.typicalEUR[0] === s.typicalEUR[1] ? usd(toUsd(s.typicalEUR[0])) : `${usd(toUsd(s.typicalEUR[0]))}–${Math.round(toUsd(s.typicalEUR[1])).toLocaleString('en-US')}`);
    const yearNotes = fees.sources.filter((s) => s.yearNote && s.entries.length).map((s) => s.yearNote);
    const parts = [];
    if (m) parts.push(`Master's ${range(m)}${fx ? ` (≈ ${usdRange(m)})` : ''}`);
    if (b) parts.push(`Bachelor's ${range(b)}${fx ? ` (≈ ${usdRange(b)})` : ''}`);
    const approx = (m && m.n > 1) || (b && b.n > 1) ? ', approx. typical range' : '';
    const tuitionText = parts.length
      ? `${parts.join(' · ')} per year (non-EU, ${inst.feeYearLabel || FEE_YEAR}${approx}) — official ${inst.name} fee pages`
      : null;

    const proposed = {
      city: cityOk ? inst.city : undefined,
      website: websiteEvidence.verified ? inst.website : undefined,
      type: type || undefined,
      courses,
      degreeLevels,
    };
    if (fx) {
      if (b) proposed.tuitionFeeUSD = toUsd(b.medianEUR);
      if (m) proposed.graduateTuitionUSD = toUsd(m.medianEUR);
      if (tuitionText) proposed.tuition = tuitionText;
    }

    const fields = Object.keys(proposed).filter((k) => proposed[k] !== undefined);
    const urls = [...new Set([listUrls.ilep, listUrls.trusted, ISD_PAGE, ...(type && typeEvidence ? [typeEvidence.url] : []),
      ...(websiteEvidence.verified ? [websiteEvidence.url] : []), ...fees.sources.filter((s) => s.entries.length).map((s) => s.url)])];
    const dataSource = {
      provider: 'ILEP + TrustEd Ireland eligible programmes lists (Irish Immigration Service Delivery) + official institution fee pages',
      runId,
      lists: listsMeta.filter((l) => listNames.includes(l.list)).map((l) => ({ list: l.list, edition: l.edition, file: l.file })),
      providerNames, providerRefs,
      urls, syncedAt: new Date(), fields,
      ...(fx ? { eurUsd: fx.rate, fxDate: fx.date } : {}),
      ...(b || m ? { feeBasis: 'median (USD fields) and typical range (display) of non-EU full-time yearly tuition on official fee pages; medicine/dentistry/veterinary excluded' } : {}),
    };

    const evidence = {
      programmes: { lists: dataSource.lists, providerNames, providerRefs, degreeProgrammesNfq7to10: programmes.length, byKind: counts },
      city: cityOk ? { value: inst.city, registerAddress: cityEvidence } : { value: null, note: `"${inst.city}" not found in register addresses`, addresses: addresses.slice(0, 5) },
      website: { ...websiteEvidence, registerEmailDomains: emailDomains },
      type: typeEvidence,
      fees: {
        bachelor: b, master: m,
        sources: fees.sources.map((s) => ({ url: s.url, via: s.via, fetchedVia: s.fetchedVia, parser: s.parser, title: s.title, pageCheck: s.pageCheck, yearNote: s.yearNote, kept: s.entries.length, skipped: s.skipped, rejected: s.rejected, model: s.model, error: s.error })),
      },
    };

    // Values we could not verify → explicitly null (for new records) and listed for the reviewer
    const missing = [];
    if (!b) missing.push(`tuitionFeeUSD + Bachelor's part of tuition text: ${inst.feesNullReason || 'no verifiable non-EU bachelor fee on the configured official pages'}`);
    if (!m) missing.push(`graduateTuitionUSD + Master's part of tuition text: ${inst.feesNullReason || 'no verifiable non-EU master\'s fee on the configured official pages'}`);
    if (!type) missing.push(`type: ${inst.typeUnresolved ? 'listed by gov.ie as receiving public funding but independent; not decided automatically' : 'no official statement found'}`);
    if (!cityOk) missing.push('city: not confirmed by register address');
    if (!websiteEvidence.verified) missing.push(`website: not verified (${websiteEvidence.error || websiteEvidence.title})`);
    for (const s of fees.sources) if (s.error) uncertainties.push(`${inst.name}: fee source failed (${s.url}): ${s.error}`);
    for (const note of yearNotes) uncertainties.push(`${inst.name}: fee year — ${note}`);
    if (missing.length) nulls.push({ institution: inst.name, fields: missing });

    const feeCell = (s) => (s ? `${range(s)}${fx ? ` (≈ ${usdRange(s)})` : ''}, median ${eur(s.medianEUR)}${fx ? ` ≈ ${usd(toUsd(s.medianEUR))}` : ''}, n=${s.n}` : null);
    const row = {
      institution: inst.name, action: null, website: inst.website, type: type || (db0 ? db0.type : null), courses: courses.length,
      degreeLevels: degreeLevels.join(', '), bachelorFee: feeCell(b), masterFee: feeCell(m),
      source: `${listNames.join(' + ')} (${providerRefs.join(', ')}); fees: ${fees.sources.filter((s) => s.entries.length).map((s) => host(s.url)).join(', ') || 'none'}`,
    };

    if (db0) {
      // Existing record: only changed fields. TU type ('Technological University') is kept for the site filter.
      if (inst.group === 'Technological University' && /technolog/i.test(String(db0.type))) delete proposed.type;
      // Same official domain already stored (often a deep link) → keep it
      if (proposed.website && db0.website && regDomain(db0.website) === regDomain(inst.website)) delete proposed.website;
      const diff = {};
      for (const [k, v] of Object.entries(proposed)) {
        if (v === undefined) continue;
        if (JSON.stringify(db0[k]) !== JSON.stringify(v)) diff[k] = { from: db0[k], to: v };
      }
      // The schema default 25000 is not a real fee: clear it when no official Bachelor fee was found
      if (!b && db0.tuitionFeeUSD === 25000) diff.tuitionFeeUSD = { from: 25000, to: null };
      row.type = diff.type ? diff.type.to : db0.type;
      if (!Object.keys(diff).length) { unchanged.push(db0.name); row.action = 'unchanged'; table.push(row); console.log('unchanged'); continue; }
      dataSource.fields = Object.keys(diff);
      diff.dataSource = { from: db0.dataSource, to: dataSource };
      if (db0.isActive === false) diff.isActive = { from: false, to: true };
      updates.push({ id: String(db0._id), name: db0.name, matchedBy: normName(db0.name) === normName(inst.name) ? 'name' : 'website domain', diff, evidence });
      row.action = 'update';
      if (!b && !m && (db0.tuitionFeeUSD || db0.graduateTuitionUSD)) uncertainties.push(`${inst.name}: existing fee values (${db0.tuitionFeeUSD}/${db0.graduateTuitionUSD}) kept — not verifiable from official pages in this run`);
    } else {
      // New record: every field that has a fabricating schema default is set explicitly
      const id = new mongoose.Types.ObjectId();
      const doc = {
        _id: String(id), name: inst.name, country: String(ireland._id), city: proposed.city ?? null, website: proposed.website ?? null,
        type: type || null, description: inst.description || null, tuition: proposed.tuition ?? null,
        tuitionFeeUSD: proposed.tuitionFeeUSD ?? null, graduateTuitionUSD: proposed.graduateTuitionUSD ?? null,
        courses, degreeLevels, categoryTags: ['ireland', String(proposed.city || '').toLowerCase(), ...(type ? [type.toLowerCase()] : [])].filter(Boolean),
        minIeltsScore: null, ieltsScore: null, minGpaPercent: null, minScore: null, minGreScore: null, greRequired: null,
        greExam: null, workExp: null, acceptanceRate: null, scholarshipAvailable: null, rankingNum: null,
        isActive: true, dataSource: { ...dataSource, fields: [...fields, 'name', 'description'] },
      };
      creates.push({ id: String(id), name: inst.name, doc, evidence });
      row.action = 'create';
    }
    table.push(row);
    console.log(`${row.action}: ${courses.length} courses, levels [${degreeLevels.join(', ')}], fees B:${b ? b.n : 0} M:${m ? m.n : 0}`);
  }

  // DB records that are not one of the institutions above: deactivate only if they are on neither list
  const providerKeys = new Set(allRows.filter(isHigherEdDegree).map((r) => normName(r.provider)));
  for (const u of ours) {
    if (matchedDbIds.has(String(u._id)) || u.isActive === false) continue;
    if (providerKeys.has(normName(u.name))) {
      uncertainties.push(`${u.name}: eligible provider on the official lists but not configured in this script — no change proposed`);
      continue;
    }
    const reason = `not found as a provider of NFQ 7-10 higher-education programmes on ILEP (${ilep.edition}) or TrustEd Ireland (${trusted.edition})`;
    deactivations.push({ id: String(u._id), name: u.name, reason, diff: deactivationDiff(u, reason) });
    table.push({ institution: u.name, action: 'deactivate', website: u.website, type: u.type, courses: (u.courses || []).length, source: 'not on ILEP / TrustEd Ireland lists' });
  }

  // Other eligible degree providers on the lists that this script does not cover
  const otherProviders = {};
  for (const r of heRows) {
    if (usedProviders.has(r.provider)) continue;
    const k = `${r.provider} (${r.list})`;
    otherProviders[k] = (otherProviders[k] || 0) + 1;
  }
  const notCovered = Object.entries(otherProviders).sort((a, b) => b[1] - a[1]).map(([provider, programmes]) => ({ provider, degreeProgrammesNfq7to10: programmes }));

  uncertainties.push(
    'Fee ranges are the middle 50% (25th–75th percentile; 10th–90th when the middle 50% share one fee; n≥10) or min–max of the non-EU full-time yearly fees listed on each official schedule; USD fields use the median. Excluded: medicine/dentistry/veterinary, part-time/online/module/visiting rows, and rows where a low fee (<EUR 12,000) is identical for EU and non-EU (professional programmes). First-year fees only.',
    'Universities and TUs appear only on the TrustEd Ireland list (not the ILEP Excel). Both lists are linked from irishimmigration.ie as the lists students must choose from.',
    'Technological universities keep type "Technological University" (used by the site filter; outside the schema enum PUBLIC/PRIVATE) although gov.ie lists them as publicly funded.',
    'Existing descriptions, eligibility text, IELTS/GPA/acceptance-rate values of the 13 existing records are NOT verified by this script and are left untouched.',
    'Course lists are programme titles from the official lists, cleaned (codes/modes stripped, degree names shortened, e.g. "Master of Science in X" → "MSc X"), capped at 150 per institution (Master\'s first).',
  );

  const summary = {
    mode: APPLY ? 'APPLY' : 'DRY RUN',
    lists: listsMeta,
    listLinksFoundOnPage: listUrls.foundOnPage,
    fx,
    ourIrelandRecords: ours.length,
    creates: creates.length,
    updates: updates.length,
    deactivations: deactivations.length,
    unchanged: unchanged.length,
    otherEligibleDegreeProvidersNotCovered: notCovered.length,
    scrapeDoRequestsThisRun: scrapeDoUsed,
  };

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const reportPath = path.join(REPORT_DIR, `ireland-sync-${stamp}.json`);
  const report = { runId, summary, table, nulls, uncertainties, creates, updates, deactivations, unchanged, otherEligibleProvidersNotCovered: notCovered, fetchLog };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.table(table.map((r) => ({ institution: r.institution, action: r.action, type: r.type, courses: r.courses, bachelor: r.bachelorFee ? r.bachelorFee.split(', median')[0] : null, master: r.masterFee ? r.masterFee.split(', median')[0] : null })));
  console.log(`full report: ${reportPath}`);

  if (APPLY) {
    const col = db.collection('universities');
    const now = new Date();
    let inserted = 0;
    for (const c of creates) {
      const doc = { ...c.doc, _id: new mongoose.Types.ObjectId(c.id), country: ireland._id, createdAt: now, updatedAt: now };
      try { await col.insertOne(doc); inserted += 1; } catch (err) { console.log(`  ! create skipped for ${c.name}: ${err.message}`); }
    }
    for (const u of updates) {
      const set = {};
      for (const [k, v] of Object.entries(u.diff)) set[k] = v.to;
      await col.updateOne({ _id: new mongoose.Types.ObjectId(u.id) }, { $set: set });
    }
    for (const d of deactivations) {
      await col.updateOne({ _id: new mongoose.Types.ObjectId(d.id) }, { $set: { isActive: false, dataSource: d.diff.dataSource.to } });
    }
    console.log(`APPLIED: ${inserted} created, ${updates.length} updated, ${deactivations.length} deactivated (revert: --revert ${reportPath})`);
  }
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('FAILED:', err.stack || err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
