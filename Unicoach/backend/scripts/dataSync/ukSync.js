/**
 * Sync United Kingdom institutions with official sources.
 *
 *   node scripts/dataSync/ukSync.js                      # DRY RUN: fetch + match + report, writes nothing
 *   node scripts/dataSync/ukSync.js --apply              # write the creates/updates/deactivations of this run
 *   node scripts/dataSync/ukSync.js --revert <report>    # undo an APPLIED run (dry-run reports are refused;
 *                                                        # a partially applied run can be reverted too)
 *
 * Options: --refresh (ignore the 7-day page cache, incl. remembered scrape.do failures), --no-scrapedo,
 *          --max-scrapedo <n> (default 8 per run),
 *          --no-llm (skip the Groq fallback for text fee pages), --fees-only <regex> (debug: run only the fee
 *          parsers of matching institutions, no database access, no report),
 *          --expect <dry-run report> (with --apply: the reviewed dry run; default = the newest uk-sync dry-run report.
 *          --apply recomputes everything with that report's GBP→USD rate and refuses to write when its plan — every
 *          record/field it would write and the value — differs from that report's plan),
 *          --allow-mass-deactivation (with --apply: allow more deactivations than the safety cap).
 *
 * Apply/revert: every run writes its own report (uk-sync-<stamp>[-apply].json, never overwritten). An apply run saves
 * the report with applyStartedAt before its first write and again after every write (insertedId, writtenAt, applyError),
 * so --revert also undoes a run that stopped half-way; it restores only records still carrying the run's runId and
 * hides (isActive:false, never deletes) records created by this script with that runId.
 *
 * Safety: the run aborts when the sponsor register looks wrong (rule sentence missing on the gov.uk page, CSV link
 * not found, unexpected file name, fewer than 600 Student-route rows); --apply refuses more than
 * min(10, 5% of our records) deactivations unless --allow-mass-deactivation is given.
 *
 * Sources (all official):
 *  - Home Office / UKVI "Register of licensed sponsors: students" (gov.uk, CSV updated on working days). Only licensed
 *    student sponsors can enrol international students on the Student route. DB records whose institution is not on
 *    the register are hidden (isActive:false); so are duplicate records of one institution. Nothing is deleted.
 *  - Office for Students Register (England; register-api.officeforstudents.org.uk, the data behind the OfS Register
 *    page): UKPRN, legal/trading names, official website, charity status, degree-awarding powers, university title.
 *  - Discover Uni (OfS / HESA / Jisc course data, discoveruni.gov.uk search API) keyed by UKPRN: full-time,
 *    campus-based undergraduate courses -> courses (plus taught Master's names from official fee tables).
 *  - Each university's own international (overseas) tuition fee page / fee schedule PDF -> Bachelor's / Master's
 *    yearly fee range + headline figure (true median; the general rate when the page names one; the lower end when a
 *    page publishes only a range; the lowest "from" fee for minimum fees), converted GBP -> USD at the latest ECB rate
 *    (api.frankfurter.app). Values read from a page are kept only if their verbatim quote is found in the fetched page
 *    text, and only if the page states the configured fee year (verbatim year quote; fee years older than the current
 *    academic year are not used). Text pages use a Groq LLM fallback; its values are kept only when the quote is in
 *    the page and contains the amount (and, on pages with several fee years, when the amount is for the fee year).
 *
 * Fee labelling on the website: dataSource.fields naming any fee field makes BOTH USD fields show as official
 * (frontend hasOfficialFee), so a level without an official figure must not leave an unverified value in its USD field:
 * such records get no fee fields at all (feesNotProposed in the report). dataSource.provider/syncedAt (the "Official
 * government & university data" label) are written only when a fee field is official; other updated records carry
 * sourceNames/checkedAt. Fields an earlier ukSync run marked official are kept in dataSource.fields while the stored
 * value still equals this run's official value.
 *
 * Ranking fields (rank, rankingNum, rankingSource) and admission-requirement fields are never touched on existing
 * records. New records get every fabricating schema default explicitly set to null/[]. Reports and the page cache go
 * to backend/reports/ (git-ignored), so re-runs do not spend scrape.do credits.
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
const argValue = (flag) => { const i = ARGS.indexOf(flag); return i !== -1 ? ARGS[i + 1] : undefined; };
const APPLY = ARGS.includes('--apply');
const REFRESH = ARGS.includes('--refresh');
const NO_SCRAPEDO = ARGS.includes('--no-scrapedo');
const NO_LLM = ARGS.includes('--no-llm');
const MAX_SCRAPEDO = Number(argValue('--max-scrapedo') ?? 8);
const FEES_ONLY = argValue('--fees-only');
const EXPECT = argValue('--expect');
const ALLOW_MASS_DEACTIVATION = ARGS.includes('--allow-mass-deactivation');
const SYNC_ID = 'ukSync';
const RUN_ID = `uk-sync-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');
const CACHE_DIR = path.join(REPORT_DIR, '.cache', 'uk');
const CACHE_TTL_MS = 7 * 24 * 3600 * 1000;
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const { SCRAPE_DO_TOKEN, GROQ_API_KEY } = process.env;
const GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

const SPONSOR_PAGE = 'https://www.gov.uk/government/publications/register-of-licensed-sponsors-students';
const SPONSOR_CSV_FALLBACK = 'https://assets.publishing.service.gov.uk/media/6abf621bf04a15f5337228ca/SP_-_Student_and_Child_Student_Web_Register_-_2026-10-02.csv';
const SPONSOR_RULE_QUOTE = 'This document lists institutions licensed to sponsor migrant students under the Student and Child Student routes.';
const OFS_PAGE = 'https://www.officeforstudents.org.uk/for-providers/registering-with-the-ofs/the-ofs-register/';
const OFS_API = 'https://register-api.officeforstudents.org.uk/api/Provider';
const DU_HOME = 'https://discoveruni.gov.uk/';
const DU_RESULTS_PAGE = 'https://discoveruni.gov.uk/course-finder/results/';
const DU_API_FALLBACK = 'https://search-api-v2-prod-hxhpghhdg3dqdhft.uksouth-01.azurewebsites.net';
const FX_URL = 'https://api.frankfurter.app/latest?from=GBP&to=USD';
const PROVIDER = 'UKVI register of licensed student sponsors + OfS Register + Discover Uni (OfS/HESA)';
const COURSE_CAP = 150;
const MASTER_COURSE_SHARE = 90;
const FEE_MIN = 5000;
const FEE_MAX = 90000;
// The website treats a fee as official when dataSource.fields contains one of these (frontend hasOfficialFee)
const FEE_FIELDS = ['tuitionFeeUSD', 'graduateTuitionUSD', 'tuition'];
// Sponsor register sanity: Student-route rows last seen 2026-10-02: 758
const STUDENT_ROWS_FLOOR = 600;
// UK academic years start in September: from August on, the current academic year is <this year>/<next year>
const CURRENT_AY_START = new Date().getUTCMonth() >= 7 ? new Date().getUTCFullYear() : new Date().getUTCFullYear() - 1;
const YEAR_NOT_STATED = /not stated/i;

const counters = { directRequests: 0, scrapeDoRequests: 0, cacheHits: 0, groqCalls: 0, groqCacheHits: 0, undiciGlitches: 0 };
const fetchLog = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');

// A known undici bug ("assert(!this.paused)" when a server closes a paused keep-alive socket) is thrown outside any
// promise. The affected request still fails/times out on its own, so the run continues; anything else is fatal.
process.on('uncaughtException', (err) => {
  if (err && err.code === 'ERR_ASSERTION' && /paused/.test(String(err.message))) { counters.undiciGlitches += 1; return; }
  console.error('FAILED:', err && (err.stack || err.message));
  process.exit(1);
});

// ---------------------------------------------------------------------------------------------------------------
// Curated matching hints. Every value proposed from these is checked against the official sources at run time;
// a hint whose check fails is reported and not applied.
// ---------------------------------------------------------------------------------------------------------------
const CURATED = {
  'Birkbeck, University of London': { sponsor: 'Birkbeck College, University of London' },
  // renamed institutions: the official name appears on the sponsor register and the OfS Register under the same UKPRN
  'Bishop Grosseteste University': { ukprn: '10007811', sponsor: 'Lincoln Bishop University', renameTo: 'Lincoln Bishop University' },
  'University of Central Lancashire': { ukprn: '10007141', sponsor: 'University of Lancashire', renameTo: 'University of Lancashire' },
  'Northumbria University': { sponsor: 'University of Northumbria at Newcastle' },
  'Plymouth Marjon University': { sponsor: 'University of St Mark & St John' },
  'Royal Holloway, University of London': { sponsor: 'Royal Holloway and Bedford New College' },
  "Scotland's Rural College": { sponsor: 'SRUC' },
  'Solent University': { sponsor: 'Southampton Solent University', ukprn: '10006022' },
  "St Mary's University, Twickenham": { sponsor: "St Mary's University", sponsorTown: /Twickenham/i },
  'Trinity Laban Conservatoire of Music and Dance': { sponsor: 'Trinity Laban' },
  'Kingston University London': { sponsor: 'Kingston University' },
  // No Discover Uni data for this UKPRN, but its own site advertises on-campus undergraduate degrees (checked at run time)
  'Walbrook Institute': {
    sponsor: 'Walbrook Institute London', ukprn: '10089591',
    ugSite: { url: 'https://www.walbrook.ac.uk/', quote: 'Specialist banking and finance undergraduate degrees, studied on campus in the centre of London.' },
  },
  'Queen Margaret University': { ukprn: '10005337' },
  'Rose Bruford College': { ukprn: '10005523' },
  'University of South Wales': { ukprn: '10007793' },
  'Goldsmiths, University of London': { sponsor: 'Goldsmiths University of London' },
  // Greenwich's UKPRN is now registered by the OfS as "London and South East University Group" (merger with Kent);
  // the sponsor register lists the group with the University of Greenwich International College as a location.
  'University of Greenwich': { ukprn: '10007146', sponsor: 'London and South East University Group', keepWebsite: true, groupNote: 'University of Greenwich is part of the London and South East University Group (OfS Register / Discover Uni); the group holds the student sponsor licence' },
  'University of Kent': { ukprn: '10007150' },
  // part of the University of London (one legal entity and one sponsor licence); not a separate provider
  'School of Advanced Study, University of London': { coveredBy: 'University of London', ukprn: null },
  // duplicates of another DB record (same UKPRN); the record with the official name is kept
  'City University of London': { duplicateOf: "City St George's, University of London" },
  'London School of Economics': { duplicateOf: 'The London School of Economics and Political Science', ukprn: '10004063' },
  'Middlesex University London': { duplicateOf: 'Middlesex University' },
  // postgraduate-only provider (verified on its own site at run time): no Bachelor's level, and tuitionFeeUSD (the
  // site's default fee) holds the official Master's figure instead of a Bachelor's one
  'Cranfield University': { pgOnly: { url: 'https://www.cranfield.ac.uk/about', quote: 'As a specialist postgraduate university' } },
  // Not on the 2 Oct 2026 Student-route register, but the university's own site still describes the Student-visa / CAS
  // process (OfS: Registered). Could be a suspended licence or a lag on either side: no deactivation without a human check.
  // The hold applies whether or not the counter-evidence can be re-read in this run (bucks.ac.uk serves a bot challenge
  // to direct requests; scrape.do is allowed for this one page).
  'Buckinghamshire New University': {
    holdDeactivation: {
      url: 'https://www.bucks.ac.uk/study/international/visas-and-immigration', scrapeDo: true,
      quote: 'Applying for a UK Student visa is an important step in preparing to study at Buckinghamshire New University (BNU)',
    },
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Official international fee sources, keyed by UKPRN. Parsers: 'table' (HTML tables; context = nearest headings),
// 'pdf' (pdftotext -raw text + row regex), 'regex' (row regex over the page text, or over the page source for fee data
// embedded in the page), 'llm' (Groq on the page text; verified quotes only).
// level: default level for generic labels ('Undergraduate', subject bands); 'auto' = decide from the label only.
// year: the fee year. Every source must prove it on the page: `yearRe` (or, when absent, `mustContain`) has to match the
// fetched page text and the matched text has to name that year (kept verbatim as yearQuote). Only a year containing
// "not stated" (e.g. 'current, year not stated on the page') skips this, and says so in the display text.
// ---------------------------------------------------------------------------------------------------------------
const INTL = /international|overseas|non-?eu\b/i;
const FEE_SOURCES = {
  10004063: {
    name: 'The London School of Economics and Political Science', year: '2026/27',
    sources: [{
      url: 'https://info.lse.ac.uk/staff/divisions/Planning-Division/Assets/Documents/Table-of-Fees-2026-27-and-PGR-structure-combined-29July26.pdf',
      linkedFrom: 'https://info.lse.ac.uk/staff/divisions/Planning-Division/Table-of-Fees',
      parser: 'pdf', level: 'auto', mustContain: /2026\/27 Fee Levels/, courseLabels: true,
      // "BSc in Accounting and Finance £9,790 £35,700" / "MSc in Data Science £39,900 £39,900 £19,950 £19,950": Home, Overseas
      rowRegex: /^(?<label>(?:BA|BSc|LLB|MSc|MA|MPA|MPP|LLM|MRes|MBA|MFin|MPH|MPhil|Master of [A-Z][a-z]+) (?:in |of )?[^£\n]+?)\s+(?:\d\s+)?£(?<home>[\d,]+)\s+£(?<amount>[\d,]+)/gm,
      basis: 'Overseas full-time fee for one year of study in 2026/27 (LSE Table of Fees)',
    }],
  },
  10007788: {
    name: 'University of Cambridge', year: '2026/27',
    sources: [{
      url: 'https://www.undergraduate.study.cam.ac.uk/sites/default/files/publications/undergraduate_tuition_fees_2026-27.pdf',
      linkedFrom: 'https://www.undergraduate.study.cam.ac.uk/fees-funding/tuition-fees',
      parser: 'pdf', level: 'bachelor', mustContain: /Undergraduate tuition fees 2026-27/,
      // "Economics 9,790 13,842 29,052": Home (first UG degree), Home (second UG degree), International
      rowRegex: /^(?<label>[A-Z][A-Za-z ,'()&-]+?)(?: \[\d\])?\s+[\d,]+\s+[\d,]+\s+(?<amount>\d{2},\d{3})$/gm,
      basis: 'International University fee per year (fixed for the course); a separate College fee is added (see addOn)',
      addOn: { label: 'College fee', after: /College Name 2026-27/, rowRegex: /^(?<label>[A-Z][A-Za-z’'& ]+?) (?<amount>1\d,\d{3})$/gm },
    }],
  },
  10007822: {
    name: 'Cranfield University', year: '2026/27',
    sources: [{
      url: 'https://www.cranfield.ac.uk/study/taught-degrees/fees-and-funding/taught-tuition-fees-2026',
      parser: 'table', level: 'master', prevMatch: /^Full-time$/i, headerRows: 2, feeCol: 2, labelPrefix: 'MSc ', courseLabels: true,
      mustContain: /Tuition fees for taught courses 2026-2027/i,
      basis: 'MSc full-time Overseas fee 2026/27 (Cranfield taught tuition fees table)',
    }],
  },
  10007158: {
    name: 'University of Southampton', year: '2026/27',
    sources: [{
      url: 'https://www.southampton.ac.uk/courses/fees/postgraduate.page',
      parser: 'table', level: 'master', tables: [0], feeHeader: /International fees/i, labelCols: [1, 0], courseLabels: true,
      mustContain: /You can find 2026 entry tuition fees for all our postgraduate taught courses in the table below/i,
      rowFilter: (c) => /^Full-time$/i.test(c[2] || '') && /^(MSc|MA|LLM|MBA|MRes|MEd|MArch|MFA|MMus|MPH|MPA|MDes)$/i.test(c[1] || ''),
      basis: 'International fee per year, full-time taught Master\'s (Southampton postgraduate tuition fees table)',
    }],
  },
  // The page states 2025/26 fees ("course fees for September 2025/January 2026"): older than the current academic
  // year, so the figures are reported but not used.
  10004351: {
    name: 'Middlesex University', year: '2025/26',
    sources: [
      { url: 'https://www.mdx.ac.uk/international/course-fees-and-costs-for-international-students/', parser: 'table', level: 'auto', feeHeader: /International fees\/year/i, courseLabels: true, yearRe: /The following information covers course fees for September 2025\/January 2026/, basis: 'International fee per year (Middlesex course fees for international students)' },
    ],
  },
  10001282: {
    name: 'Northumbria University', year: '2027/28',
    sources: [
      { url: 'https://www.northumbria.ac.uk/study-at-northumbria/fees-funding/international-fees-funding/international-ug-fees/', parser: 'table', level: 'bachelor', tables: [0], intlPage: true, mustContain: /27\/28 International Undergraduate Tuition Fees/i, basis: 'annual course fee by subject area (international undergraduate fees 27/28)' },
      { url: 'https://www.northumbria.ac.uk/study-at-northumbria/fees-funding/international-fees-funding/international-masters-fees/', parser: 'table', level: 'master', tables: [1, 2, 3, 4], intlPage: true, mustContain: /27\/28 Tuition Fees Information for International Masters Applicants/i, basis: '1-year Master\'s full course fee by subject area (international Master\'s fees 27/28)' },
    ],
  },
  10007849: {
    name: 'Abertay University', year: '2027/28',
    sources: [
      { url: 'https://www.abertay.ac.uk/study-apply/money-fees-and-funding/tuition-fees/', parser: 'table', level: 'bachelor', tables: [3], intlPage: true, mustContain: /Undergraduate Tuition Fees - International Students 2027\/28/i, basis: 'international undergraduate fee per year, 2027/28 entry' },
      { url: 'https://www.abertay.ac.uk/study-apply/money-fees-and-funding/tuition-fees/', parser: 'table', level: 'master', tables: [7], intlPage: true, mustContain: /Postgraduate Tuition Fees - International Students 2027\/28/i, courseLabels: true, basis: 'international postgraduate taught fee per year, 2027/28 entry' },
    ],
  },
  10003863: {
    name: 'Leeds Trinity University', year: '2026/27',
    sources: [
      { url: 'https://www.leedstrinity.ac.uk/international/international-fees-and-funding/tuition-fees/', parser: 'table', level: 'bachelor', tables: [0], intlPage: true, mustContain: /Tuition fees for the 2026-27 academic year/i, basis: 'international undergraduate tuition fee per year' },
      { url: 'https://www.leedstrinity.ac.uk/international/international-fees-and-funding/tuition-fees/', parser: 'table', level: 'master', tables: [1], intlPage: true, courseLabels: true, mustContain: /Tuition fees for the 2026-27 academic year/i, basis: 'international postgraduate tuition fee per year' },
    ],
  },
  10007857: {
    name: 'Bangor University', year: '2026/27',
    sources: [
      { url: 'https://www.bangor.ac.uk/international/fees', parser: 'table', level: 'bachelor', tables: [0], feeHeader: /September 2026 entry/i, yearRe: /Undergraduate September 2026 entry/, intlPage: true, basis: 'international undergraduate fee per year by subject band, September 2026 entry' },
      { url: 'https://www.bangor.ac.uk/international/fees', parser: 'table', level: 'master', tables: [1], feeHeader: /September\s?2026 entry/i, yearRe: /September\s?2026 entry/, intlPage: true, basis: 'international postgraduate taught fee by subject band, September 2026 entry' },
    ],
  },
  10007833: {
    name: 'Wrexham University', year: '2026/27',
    sources: [{ url: 'https://wrexham.ac.uk/international-students/international-fees/', parser: 'table', level: 'auto', tables: [0], feeHeader: /2026\/27 Fee/i, yearRe: /Course 2025\/26 Fee 2026\/27 Fee/, intlPage: true, basis: 'international fee per year 2026/27' }],
  },
  10007161: {
    name: 'Teesside University', year: '2026/27',
    sources: [{ url: 'https://www.tees.ac.uk/sections/international/fees.cfm', parser: 'table', level: 'auto', tables: [0], intlPage: true, mustContain: /Fees for international students 2026-27/i, basis: 'international standard fee per year 2026-27' }],
  },
  10000712: {
    name: 'University College Birmingham', year: '2026/27',
    sources: [{ url: 'https://www.ucb.ac.uk/international/international-tuition-fees/', parser: 'table', level: 'auto', tables: [0, 1], feeHeader: /Fee for 2026\/27/i, yearRe: /Fee for 2026\/27/, intlPage: true, basis: 'international fee per year 2026/27 by fee band' }],
  },
  10006299: {
    name: 'University of Staffordshire', year: '2026/27',
    sources: [
      { url: 'https://www.staffs.ac.uk/student-life/fees-and-finance/postgraduate', parser: 'table', level: 'master', tables: [4], tableMatch: /International students postgraduate taught fees 2026\/27/i, yearRe: /International students postgraduate taught fees 2026\/27/i, intlPage: true, basis: 'international taught postgraduate fee 2026/27' },
      
    ],
  },
  10006427: {
    name: 'University for the Creative Arts', year: '2026/27',
    sources: [
      { url: 'https://www.uca.ac.uk/study-at-uca/fees-finance/undergraduate/', parser: 'table', level: 'bachelor', tableMatch: /2026\/27 International tuition fees/i, yearRe: /2026\/27 International tuition fees/i, intlPage: true, basis: 'international undergraduate tuition fee (Year 1) 2026/27' },
      { url: 'https://www.uca.ac.uk/study-at-uca/fees-finance/postgraduate/', parser: 'table', level: 'master', tableMatch: /2026\/27 International/i, yearRe: /2026\/27 International/i, intlPage: true, basis: 'international postgraduate tuition fee 2026/27' },
    ],
  },
  10005561: {
    name: 'Royal Conservatoire of Scotland', year: '2026/27',
    sources: [{ url: 'https://www.rcs.ac.uk/study/fees-funding/fees/', parser: 'llm', levels: ['bachelor', 'master'], intlPage: false, excludeLabels: /\bMFA\b|Psychology in the Arts/i, yearRe: /Tuition Fees 2026\/27 For new students/ }],
  },
  10000571: {
    name: 'Bath Spa University', year: '2026/27',
    sources: [{ url: 'https://www.bathspa.ac.uk/students/student-finance/tuition-fees/international-fees/', parser: 'llm', levels: ['bachelor', 'master'], intlPage: true, yearRe: /International\/EU fees \(2026\/2027\)/ }],
  },
  10005343: {
    name: "Queen's University Belfast", year: '2027/28',
    sources: [
      { url: 'https://www.qub.ac.uk/Study/international-students/tuition-fees/', parser: 'table', level: 'bachelor', tables: [0], feeCol: 1, plainNumbers: true, intlPage: true, mustContain: /Students first enrolling in 2027\/28/i, basis: 'international undergraduate fee rate per year, 2027/28 entry (GBP column)' },
      { url: 'https://www.qub.ac.uk/Study/international-students/tuition-fees/', parser: 'table', level: 'master', tables: [1, 2], feeCol: 1, plainNumbers: true, intlPage: true, courseLabels: true, yearRe: /Postgraduate Taught Students first enrolling in 2027\/28/, basis: 'international postgraduate taught fee per year, 2027/28 entry (GBP column)' },
    ],
  },
  10007851: { name: 'University of Derby', year: '2026/27', sources: [{ url: 'https://www.derby.ac.uk/study/fees-finance/international/', parser: 'llm', levels: ['bachelor', 'master'], intlPage: true, yearRe: /Course level 2025\/2026 2026\/2027/ }] },
  10007842: { name: 'University of Cumbria', year: '2026/27', sources: [{ url: 'https://www.cumbria.ac.uk/study/international-students/fees-and-finance/', parser: 'table', level: 'auto', feeHeader: /2026\/27/, yearRe: /Our fees for the 2025\/26 and 26\/27 years are set out below/, intlPage: true, basis: 'international fee per year, 2026/27 column' }] },
  // UEL publishes postgraduate fees on individual course pages; this page lists only the MArch and the MBA, which do not
  // represent its Master's programmes, so only the undergraduate rate is taken.
  10007144: {
    name: 'University of East London', year: '2026/27',
    sources: [{
      url: 'https://www.uel.ac.uk/study/fees-funding/international-fees-funding', parser: 'regex', level: 'bachelor',
      rowRegex: /For new full-time international students starting in the 2026-27 academic year: £(?<amount>[\d,]+) per year/g,
      label: () => 'Undergraduate (full-time)', yearRe: /For new full-time international students starting in the 2026-27 academic year/,
      basis: 'international full-time undergraduate fee per year, 2026-27 (no Master\'s figure: "Course fees for new postgraduate students are provided on our individual postgraduate course pages")',
    }],
  },
  10000886: {
    name: 'University of Brighton', year: '2026/27',
    sources: [
      { url: 'https://www.brighton.ac.uk/studying-here/fees-and-finance/undergraduate/international-students/fees/index.aspx', parser: 'llm', levels: ['bachelor'], intlPage: true, yearRe: /Tuition fees for 2026[–-]27 academic year/ },
      { url: 'https://www.brighton.ac.uk/studying-here/fees-and-finance/postgraduate/international-students/fees/index.aspx', parser: 'llm', levels: ['master'], intlPage: true, yearRe: /Fees for courses starting in September 2026 and January 2027/ },
    ],
  },
  10005470: {
    name: 'Richmond, The American International University in London', year: '2026/27',
    sources: [
      { url: 'https://www.richmond.ac.uk/undergraduate-student-tuition-fees-and-funding/', parser: 'llm', levels: ['bachelor'], intlPage: false, excludeLabels: /football|RIASA/i, yearRe: /These are the fees if you are starting your study in September 2026/ },
      { url: 'https://www.richmond.ac.uk/postgraduate-tuition-fees/', parser: 'llm', levels: ['master'], intlPage: true, focus: /International Full Time:/, focusEnd: /Richmond International Academic and Soccer Academy/, yearRe: /Fall 2026 Postgraduate Programmes/ },
    ],
  },
  10039956: {
    name: 'The University of Law', year: '2026/27',
    sources: [{
      url: 'https://www.law.ac.uk/study/undergraduate/course-fees-and-funding/', parser: 'regex', level: 'bachelor',
      from: /International Student On Campus/, to: /Four year Full-time Degree with Foundation Year/,
      rowRegex: /(?<label>Three year Full-time Degree) Non-London: From £(?<amount>[\d,]+)(?:\.\d\d)? London: From £(?<amountB>[\d,]+)(?:\.\d\d)?/g,
      // one entry per campus group; both are minimum ("From") fees
      variants: [{ group: 'amount', label: 'non-London campuses' }, { group: 'amountB', label: 'London campuses' }], lowerBound: true,
      yearRe: /Each of our courses running for the 2026 and 2027 academic year have varying fees/,
      basis: 'international on-campus three-year full-time degree, minimum ("From") fee per year by campus group',
    }],
  },
  10007854: { name: 'Cardiff Metropolitan University', year: '2026/27', sources: [{ url: 'https://www.cardiffmet.ac.uk/international-students/fees-and-finance/', parser: 'llm', levels: ['bachelor', 'master'], intlPage: true, yearRe: /Undergraduate Courses \W*Length \W*Course Fee 2026\/27/ }] },
  // the page states no fee year (the only "2026" on it is the copyright line)
  10005700: {
    name: "Scotland's Rural College", year: 'current, year not stated on the page',
    sources: [
      {
        url: 'https://www.sruc.ac.uk/international/international-students/fees-funding/', parser: 'regex', level: 'bachelor',
        rowRegex: /Full-time HNC, HND, BA, or BSc courses = £(?<amount>[\d,]+) per year/g, label: () => 'Full-time BA or BSc courses',
        basis: 'international higher-education fee per year, full-time BA/BSc (the page gives one rate for HNC, HND, BA and BSc; no fee year stated)',
      },
      {
        url: 'https://www.sruc.ac.uk/international/international-students/fees-funding/', parser: 'regex', level: 'master',
        rowRegex: /MSc \/ MRes \(full-time, taught PG\) = £(?<amount>[\d,]+)/g, label: () => 'MSc / MRes (full-time, taught PG)',
        basis: 'international fee, full-time taught MSc / MRes (no fee year stated)',
      },
    ],
  },
  10000385: {
    name: 'Arts University Bournemouth', year: '2026/27',
    sources: [
      { url: 'https://aub.ac.uk/fees/undergraduate', parser: 'llm', levels: ['bachelor'], intlPage: false, yearRe: /International\/EU Tuition Fee 2026\/27 Applicants/ },
    ],
  },
  // University of Dundee: not configured — dundee.ac.uk blocks direct requests (HTTP 403) and the guessed fee page was a
  // 404 via scrape.do; fees are published per course page only.
  10007774: {
    name: 'University of Oxford', year: '2027/28',
    sources: [{ url: 'https://www.ox.ac.uk/admissions/undergraduate/fees-and-funding/course-fees', linkedFrom: 'https://www.ox.ac.uk/admissions/undergraduate/fees-and-funding', parser: 'table', level: 'bachelor', tables: [0], intlPage: true, rangeBoth: true, scrapeDo: true, mustContain: /Annual course fees payable by student for 2027\/28/i, basis: 'Overseas annual course fee range for 2027/28 entry (clinical medicine excluded; per-course fees are on each course page)' }],
  },
  10007154: {
    name: 'University of Nottingham', year: '2026/27',
    sources: [
      { url: 'https://www.nottingham.ac.uk/fees/tuitionfees/202627/undergraduate.aspx', linkedFrom: 'https://www.nottingham.ac.uk/fees/tuitionfees/202627/index.aspx', parser: 'table', level: 'bachelor', tables: [0], feeHeader: /^International fee/i, labelCols: [1, 2], mustContain: /Undergraduate courses 2026\/27/i, excludeLabels: /industrial year|year in industry|year abroad|international study/i, basis: 'International fee per year by course, undergraduate courses 2026/27 (Nottingham tuition fees table)' },
      { url: 'https://www.nottingham.ac.uk/fees/tuitionfees/202627/postgraduate-taught.aspx', linkedFrom: 'https://www.nottingham.ac.uk/fees/tuitionfees/202627/index.aspx', parser: 'table', level: 'master', tables: [0], feeHeader: /^International fee/i, labelCols: [1, 2], courseLabels: true, excludeLabels: /\(2 ?yr\)|extended research/i, mustContain: /Postgraduate taught courses 2026\/27/i, basis: 'International fee by course, postgraduate taught courses 2026/27 (Nottingham tuition fees table)' },
    ],
  },
  10007850: {
    name: 'University of Bath', year: '2026/27',
    sources: [{
      url: 'https://www.bath.ac.uk/corporate-information/tuition-fees-for-undergraduate-students-who-started-in-2026/', linkedFrom: 'https://www.bath.ac.uk/topics/tuition-fees/',
      parser: 'table', level: 'bachelor', tables: [6, 7, 8], feeCol: 1, rowFilter: (c) => /^Band \d:/.test(c[0] || ''),
      mustContain: /Overseas student tuition fees for the 2026\/27 academic year/i, basis: 'overseas undergraduate annual fee by band, 2026/27 academic year (Bath fee bands)',
    }],
  },
  10007150: {
    name: 'University of Kent', year: '2026/27',
    sources: [
      {
        // the fee tables on these pages are rendered from course data embedded in the page; quotes come from that data
        url: 'https://www.kent.ac.uk/tuition-fees/undergraduate/undergraduate2026-27', linkedFrom: 'https://www.kent.ac.uk/tuition-fees/undergraduate',
        parser: 'regex', source: 'raw', level: 'bachelor', mustContain: /Undergraduate tuition fees 2026\/27/i,
        rowRegex: /"name":"(?<name>[^"]+)","slug":"[^"]*","award":"(?<award>[^"]*)"[^{}]*?"mode_of_study":"(?<mode>[^"]*)"[^{}]*?"type":"(?<type>[^"]*)"[^{}]*?"int_full_time":"&pound;(?<amount>[\d,]+)"/g,
        label: (g) => `${g.award} ${g.name}`, rowFilter: (g) => g.type === 'taught' && !/part-time only/i.test(g.mode) && g.award !== 'MArch',
        // same-fee route variants (year in industry / professional practice, SQA articulation entry points) are left out
        excludeLabels: /year in industry|year in professional practice|year abroad|placement|foundation|\(SQA AD/i,
        basis: 'international full-time fee per year by course, 2026/27 (Kent undergraduate tuition fees 2026/27)',
      },
      {
        url: 'https://www.kent.ac.uk/tuition-fees/postgraduate/postgraduate2026-27', linkedFrom: 'https://www.kent.ac.uk/tuition-fees/postgraduate',
        parser: 'regex', source: 'raw', level: 'master', courseLabels: true, mustContain: /Postgraduate tuition fees 2026\/27/i,
        rowRegex: /"name":"(?<name>[^"]+)","slug":"[^"]*","award":"(?<award>[^"]*)"[^{}]*?"mode_of_study":"(?<mode>[^"]*)"[^{}]*?"type":"(?<type>[^"]*)"[^{}]*?"int_full_time":"&pound;(?<amount>[\d,]+)"/g,
        label: (g) => `${g.award} ${g.name}`, rowFilter: (g) => g.type === 'taught' && /^(MSc|MA|LLM|MBA)$/.test(g.award) && !/part-time only/i.test(g.mode),
        excludeLabels: /integrated master/i,
        basis: 'international full-time fee by taught Master\'s course, 2026/27 (Kent postgraduate tuition fees 2026/27)',
      },
    ],
  },
  10007792: {
    name: 'University of Exeter', year: '2027/28',
    sources: [{
      url: 'https://www.exeter.ac.uk/undergraduate-degrees/fees/', parser: 'table', level: 'bachelor', tables: [0], feeCol: 1,
      mustContain: /The tuition fees for international students starting their course in autumn 2027 are/i,
      basis: 'international undergraduate fee per year by subject area, autumn 2027 entry',
    }],
  },
  10007794: {
    name: 'University of Glasgow', year: '2026/27',
    sources: [{
      url: 'https://www.gla.ac.uk/undergraduate/fees/intlfees/', parser: 'table', level: 'bachelor', prevMatch: /tuition fee rates for 2026\/27 for EU and international students/i, yearRe: /tuition fee rates for 2026\/27 for EU and international students/i, feeCol: 1,
      medicalRe: /Dental Surgery|MBChB|Veterinary Medicine/i,
      basis: 'EU and international undergraduate fee per year by programme group, 2026/27',
    }],
  },
  10004113: {
    name: 'Loughborough University', year: '2026/27',
    sources: [{
      url: 'https://www.lboro.ac.uk/study/undergraduate/fees-funding/fees/', parser: 'regex', level: 'bachelor',
      from: /International undergraduate fees for 2026 entry/, to: /International Foundation Year fees for 2026 entry/,
      rowRegex: /(?<label>Band \w+) courses:\s*£\s?(?<amount>[\d,]+)/g, mustContain: /International tuition fees for 2026 are final/i, yearRe: /International undergraduate fees for 2026 entry/,
      basis: 'international undergraduate fee per year by fee band, 2026 entry',
    }],
  },
  10007163: {
    name: 'University of Warwick', year: '2026/27',
    sources: [{
      url: 'https://warwick.ac.uk/study/undergraduate/fees-and-funding/course-costs/', parser: 'regex', level: 'bachelor',
      from: /If you are an overseas student enrolling in 2026-27/, to: /Overseas Tuition fees for 2027-28/, yearRe: /If you are an overseas student enrolling in 2026-27/,
      rowRegex: /(?<label>Band \d)\s*[–-]\s*£(?<amount>[\d,]+) per year/g,
      basis: 'overseas undergraduate annual tuition fee by band, 2026-27 entry',
    }],
  },
  10007157: {
    name: 'University of Sheffield', year: '2026/27',
    sources: [{
      url: 'https://sheffield.ac.uk/new-students/tuition-fees/undergraduate-overseas', parser: 'regex', level: 'bachelor',
      rowRegex: /For the 2026\/27 academic year, the University of Sheffield will charge new full-time overseas undergraduates, tuition fees between £(?<amount>[\d,]+) and £(?<amount2>[\d,]+)/g,
      label: () => 'Overseas undergraduate fee range 2026/27', yearRe: /For the 2026\/27 academic year, the University of Sheffield will charge new full-time overseas undergraduates/,
      basis: 'published range of overseas undergraduate fees, 2026/27 (Medicine and Dentistry are charged separately and are not included)',
    }],
  },
  10001883: {
    name: 'De Montfort University', year: 'current, year not stated on the page',
    sources: [{
      url: 'https://www.dmu.ac.uk/study/fees-funding/international-tuition-fees.aspx', parser: 'regex', level: 'auto',
      rowRegex: /(?<label>(?:Undergraduate|Postgraduate) fees range for [A-Z][A-Z, ]*?)\s*£(?<amount>[\d,]+)\s*-\s*£(?<amount2>[\d,]+)/g,
      basis: 'international fee ranges by faculty (BAL / TAC / HLS) on the DMU international tuition fees page; the page does not state the fee year',
    }],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------------------------------------------
const squash = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
// Name normalisation for matching register names to our records
const N = (s) => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' and ')
  .replace(/\bst\.?(?= )/g, 'saint').replace(/[’'`]/g, '').replace(/\b(the|limited|ltd|higher education corporation|inc)\b/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ').trim();
const nameVariants = (s) => {
  const n = N(s);
  const out = new Set([n]);
  let m = n.match(/^university of (.+)$/);
  if (m) out.add(`${m[1]} university`);
  m = n.match(/^(.+) university$/);
  if (m) out.add(`university of ${m[1]}`);
  out.add(n.replace(/ university of london$/, ''));
  out.add(n.replace(/ london$/, ''));
  return [...out].filter(Boolean);
};
// Loose text normalisation for verbatim-quote checks (spacing, quotes, dashes and punctuation ignored)
const Q = (s) => String(s ?? '').normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").replace(/[–—]/g, '-').replace(/[^a-z0-9£]+/g, ' ').trim();
const host = (url) => String(url || '').trim().toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '');
const regDomain = (url) => {
  const parts = host(url).split('.').filter(Boolean);
  return parts.length >= 3 && /^(ac|co|org|gov|nhs|ltd|plc)$/.test(parts[parts.length - 2]) ? parts.slice(-3).join('.') : parts.slice(-2).join('.');
};
const origin = (url) => {
  const u = String(url || '').trim();
  if (!u) return null;
  try { return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).origin.toLowerCase(); } catch (_) { return null; }
};
const gbp = (n) => `GBP ${Math.round(n).toLocaleString('en-US')}`;
const usd = (n) => `US$${Math.round(n).toLocaleString('en-US')}`;
const num = (n) => Math.round(n).toLocaleString('en-US');
const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))))];
// true median (mean of the two middle values for an even count)
const trueMedian = (sorted) => (sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2);

// Fee years. '2026/27' → start year 2026. A text "names" the year when it has 2026/27, 2026-27, 2026/2027, 26/27,
// September/autumn/Fall 2026, "2026 entry" or "2026 and 2027 academic year".
const startYear = (year) => { const m = String(year || '').match(/\b(20\d\d)\b/); return m ? Number(m[1]) : null; };
function namesYear(text, year) {
  const y1 = startYear(year);
  if (!y1) return false;
  const y2 = y1 + 1;
  const s1 = String(y1).slice(2);
  const s2 = String(y2).slice(2);
  return new RegExp(`(?<!\\d)(?:${y1}|${s1})\\s*[\\/–-]\\s*(?:${y2}|${s2})(?!\\d)|\\b(?:September|Sept|autumn|Fall)\\s+${y1}\\b|\\b${y1}\\s+(?:entry|and ${y2} academic year)\\b`, 'i').test(String(text));
}
// Academic years a page talks about (2025/26, 2026-2027, Fall/September 2026, Spring/January 2027 → 2026), for
// telling single-year pages from pages that list several fee years
function academicYearsIn(text) {
  const years = new Set();
  for (const m of String(text).matchAll(/(?<!\d)(20\d\d)\s*[/–-]\s*(20\d\d|\d\d)(?!\d)/g)) {
    const a = Number(m[1]);
    const b = Number(m[2].length === 2 ? `${String(a).slice(0, 2)}${m[2]}` : m[2]);
    if (b === a + 1) years.add(a);
  }
  for (const m of String(text).matchAll(/\b(September|Sept|autumn|Autumn|Fall|fall|Spring|spring|January)\s+(20\d\d)\b/g)) {
    years.add(/^(spring|january)$/i.test(m[1]) ? Number(m[2]) - 1 : Number(m[2]));
  }
  return [...years].sort();
}

function htmlText(html) {
  const $ = cheerio.load(String(html));
  $('script,style,noscript,svg,iframe,template').remove();
  $('td,th,li,p,div,br,tr,h1,h2,h3,h4,h5,h6,section,article,span,a,strong,b,em,caption,summary,button,dt,dd').append(' ');
  return { $, title: squash($('title').first().text()), text: squash($.root().text()) };
}

// ---------------------------------------------------------------------------------------------------------------
// HTTP with on-disk cache; scrape.do only for sources that allow it and only when the direct request is blocked
// ---------------------------------------------------------------------------------------------------------------
const isBlocked = (status, text) => status === 403 || status === 429 || status === 503
  || /<title>\s*(Just a moment|Attention Required)/i.test(String(text).slice(0, 20000))
  // bot challenge served with HTTP 200: an empty page whose only content is a packed script (e.g. bucks.ac.uk)
  || (String(text).length < 8000 && /<body>\s*<script[^>]*>\s*eval\(function\(p,a,c,k,e,d\)/i.test(String(text)));

async function fetchCached(url, { method = 'GET', body = null, contentType = null, scrapeDo = false, accept = null } = {}) {
  const key = sha1(`${method} ${url} ${body || ''}`);
  const metaFile = path.join(CACHE_DIR, `${key}.json`);
  const binFile = path.join(CACHE_DIR, `${key}.bin`);
  if (!REFRESH && fs.existsSync(metaFile) && fs.existsSync(binFile)) {
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    if (Date.now() - new Date(meta.fetchedAt).getTime() < CACHE_TTL_MS) {
      counters.cacheHits += 1;
      fetchLog.push({ url, method, via: `cache (${meta.via}, ${meta.fetchedAt})` });
      // a failed scrape.do request is remembered too, so re-runs do not spend credits on the same dead URL
      if (meta.failed) throw new Error(`${meta.error} (cached failure from ${meta.fetchedAt}; --refresh to retry)`);
      return { ...meta, buf: fs.readFileSync(binFile) };
    }
  }
  const rememberFailure = (error) => {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(binFile, Buffer.alloc(0));
    fs.writeFileSync(metaFile, JSON.stringify({ url, method, via: 'scrape.do', failed: true, error, fetchedAt: new Date().toISOString() }, null, 1));
    return new Error(error);
  };
  let status = 0;
  let buf = Buffer.alloc(0);
  let finalUrl = url;
  let ct = '';
  let lastError = '';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const res = await fetch(url, {
        method, body,
        headers: {
          'User-Agent': BROWSER_UA, 'Accept-Language': 'en-GB,en;q=0.9',
          Accept: accept || 'text/html,application/xhtml+xml,application/json,application/pdf,text/csv,*/*;q=0.8',
          ...(contentType ? { 'Content-Type': contentType } : {}),
        },
        redirect: 'follow', signal: AbortSignal.timeout(90000),
      });
      counters.directRequests += 1;
      status = res.status;
      finalUrl = res.url || url;
      ct = res.headers.get('content-type') || '';
      buf = Buffer.from(await res.arrayBuffer());
      break;
    } catch (err) {
      lastError = err.cause?.code || err.name || err.message;
      if (attempt < 2) await sleep(3000);
    }
  }
  let via = 'direct';
  const directStatus = status || lastError;
  if (!status || isBlocked(status, buf.toString('latin1', 0, 20000))) {
    if (!scrapeDo || method !== 'GET') throw new Error(`direct request failed (${directStatus}); scrape.do not enabled for this source`);
    if (NO_SCRAPEDO || !SCRAPE_DO_TOKEN) throw new Error(`direct request blocked (${directStatus}); scrape.do disabled`);
    if (counters.scrapeDoRequests >= MAX_SCRAPEDO) throw new Error(`direct request blocked (${directStatus}); scrape.do cap for this run (${MAX_SCRAPEDO}) reached`);
    counters.scrapeDoRequests += 1;
    try {
      const res = await fetch(`https://api.scrape.do/?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(150000) });
      status = res.status;
      ct = res.headers.get('content-type') || ct;
      buf = Buffer.from(await res.arrayBuffer());
    } catch (err) {
      throw new Error(`scrape.do request failed for ${url} (${err.cause?.code || 'network error'})`); // never echo the API URL (token)
    }
    via = 'scrape.do';
    finalUrl = url;
    if (isBlocked(status, buf.toString('latin1', 0, 20000))) throw rememberFailure(`still blocked via scrape.do (HTTP ${status}) for ${url}`);
    if (status < 200 || status >= 300) throw rememberFailure(`HTTP ${status} via scrape.do for ${url}`);
  }
  if (status < 200 || status >= 300) throw new Error(`HTTP ${status} for ${url}`);
  const meta = { url, method, finalUrl, status, contentType: ct, via, directStatus, fetchedAt: new Date().toISOString() };
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(binFile, buf);
  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 1));
  fetchLog.push({ url, method, via, status });
  return { ...meta, buf };
}

async function gbpToUsd() {
  let lastError = '';
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(FX_URL, { headers: { 'User-Agent': BROWSER_UA }, signal: AbortSignal.timeout(30000) });
      const j = await res.json();
      if (j?.rates?.USD) return { base: 'GBP', quote: 'USD', rate: j.rates.USD, date: j.date, source: 'ECB reference rate via api.frankfurter.app', url: FX_URL };
      lastError = 'no GBP→USD rate in response';
    } catch (err) { lastError = err.cause?.code || err.message; }
    await sleep(3000 * attempt);
  }
  throw new Error(`frankfurter.app: ${lastError}`);
}

// ---------------------------------------------------------------------------------------------------------------
// Official registers
// ---------------------------------------------------------------------------------------------------------------
// CSV → records, keeping each record's raw line (used verbatim as evidence)
function parseCsv(text) {
  const records = [];
  let row = [];
  let field = '';
  let quoted = false;
  let start = 0;
  for (let i = 0; i <= text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 1; } else quoted = false; } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === undefined) {
      row.push(field.replace(/\r$/, ''));
      if (row.some((x) => x.trim())) records.push({ cells: row, raw: text.slice(start, i).replace(/\r$/, '') });
      row = []; field = ''; start = i + 1;
    } else field += c;
  }
  return records;
}

async function loadSponsorRegister() {
  const page = await fetchCached(SPONSOR_PAGE);
  const { text } = htmlText(page.buf.toString('utf8'));
  const html = page.buf.toString('utf8');
  // the Student and Child Student register CSV (not just the first CSV link on the page)
  const csvLinks = [...html.matchAll(/href="(https:\/\/assets\.publishing\.service\.gov\.uk\/[^"]+\.csv)"/gi)].map((m) => m[1]);
  const linked = csvLinks.find((u) => /Student.*Register/i.test(decodeURIComponent(u.split('/').pop()))) || null;
  const csvUrl = linked || SPONSOR_CSV_FALLBACK;
  const lastUpdated = (text.match(/Last updated:?\s*(\d{1,2} [A-Z][a-z]+ \d{4})/) || [])[1] || null;
  const csv = await fetchCached(csvUrl, { accept: 'text/csv,*/*' });
  const records = parseCsv(csv.buf.toString('utf8').replace(/^﻿/, ''));
  const header = records[0].cells.map((h) => squash(h));
  const col = (re) => header.findIndex((h) => re.test(h));
  const ix = { name: col(/sponsor name|organisation name/i), town: col(/town/i), extra: col(/additional/i), type: col(/sponsor type|type/i), status: col(/^status/i), route: col(/route/i), compliance: col(/compliance/i) };
  if (Object.values(ix).some((i) => i < 0)) throw new Error(`sponsor CSV header not recognised: ${header.join(', ')}`);
  const rows = records.slice(1).map((r) => ({
    name: squash(r.cells[ix.name]), town: squash(r.cells[ix.town]), additional: squash(r.cells[ix.extra]), type: squash(r.cells[ix.type]),
    status: squash(r.cells[ix.status]), route: squash(r.cells[ix.route]), compliance: squash(r.cells[ix.compliance]), raw: r.raw,
  })).filter((r) => r.name);
  const out = {
    pageUrl: SPONSOR_PAGE, csvUrl, fileName: decodeURIComponent(csvUrl.split('/').pop()), lastUpdated,
    ruleQuote: SPONSOR_RULE_QUOTE, ruleVerified: Q(text).includes(Q(SPONSOR_RULE_QUOTE)), linkFoundOnPage: Boolean(linked),
    fetchedVia: csv.via, rows, studentRows: rows.filter((r) => /^Student$/i.test(r.route)),
  };
  // Every record without a Student-route row is hidden, so a wrong or truncated register must stop the run
  const problems = [];
  if (!out.ruleVerified) problems.push(`the rule sentence "${SPONSOR_RULE_QUOTE}" is no longer on ${SPONSOR_PAGE}`);
  if (!out.linkFoundOnPage) problems.push(`no "Student … Register" CSV link on ${SPONSOR_PAGE} (found: ${csvLinks.join(', ') || 'none'})`);
  if (!/Student.*Register.*\.csv$/i.test(out.fileName)) problems.push(`unexpected register file name ${out.fileName}`);
  if (out.studentRows.length < STUDENT_ROWS_FLOOR) problems.push(`only ${out.studentRows.length} Student-route rows (expected at least ${STUDENT_ROWS_FLOOR}; ${rows.length} rows in all)`);
  if (problems.length) throw new Error(`sponsor register failed its sanity checks, nothing proposed: ${problems.join('; ')}`);
  return out;
}

async function loadOfs() {
  const r = await fetchCached(OFS_API, { accept: 'application/json' });
  const raw = r.buf.toString('utf8');
  const providers = JSON.parse(raw).map((p) => ({ ...p, Ukprn: squash(p.Ukprn), Website: squash(p.Website) || null }));
  return { url: OFS_API, page: OFS_PAGE, raw, providers, byUkprn: new Map(providers.map((p) => [p.Ukprn, p])) };
}
// Verbatim JSON fragment of an OfS field, e.g. "LegalName":"Kingston University" (checked against the raw response)
const ofsQuote = (ofs, p, field) => {
  const quote = `"${field}":${JSON.stringify(p[field] ?? null)}`;
  return { quote, verified: ofs.raw.includes(quote) };
};

async function discoverUniApi() {
  try {
    const home = await fetchCached(DU_HOME);
    const m = home.buf.toString('utf8').match(/API_V2_SEARCH\s*=\s*"(https:\/\/[^"]+)"/);
    if (m) return `${m[1].replace(/\/$/, '')}/api/v2`;
  } catch (_) { /* fall back */ }
  return `${DU_API_FALLBACK}/api/v2`;
}

const DU_EMPTY_QUERY = { query: '', selectedInstitutions: [], modeFullTime: false, modePartTime: false, locOnCampus: false, locDistanceLearning: false, regionScotland: false, regionWales: false, regionNorthernIreland: false, regionEngland: false };
async function loadDiscoverUniIndex(api) {
  const r = await fetchCached(`${api}/search/?language=en`, { method: 'POST', body: JSON.stringify(DU_EMPTY_QUERY), contentType: 'application/json', accept: 'application/json' });
  const list = JSON.parse(r.buf.toString('utf8'));
  const byUkprn = new Map();
  const names = new Map();
  for (const c of list) {
    const ukprn = String(c.courseId).split('/')[0];
    if (!byUkprn.has(ukprn)) byUkprn.set(ukprn, []);
    byUkprn.get(ukprn).push(c.courseId);
    names.set(ukprn, c.institution);
  }
  return { api, total: list.length, byUkprn, names };
}
async function loadDiscoverUniCourses(du, ukprn) {
  const ids = du.byUkprn.get(String(ukprn)) || [];
  const out = [];
  for (let i = 0; i < ids.length; i += 300) {
    const body = JSON.stringify({ courseIds: ids.slice(i, i + 300) });
    const r = await fetchCached(`${du.api}/search/courses/?language=en`, { method: 'POST', body, contentType: 'application/json', accept: 'application/json' });
    out.push(...JSON.parse(r.buf.toString('utf8')));
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------------------------------------------
// Not a first-degree programme a student applies to directly (foundation years, HNC/HND, top-ups, apprenticeships…)
const UG_EXCLUDE = /\bHN[CD]\b|^F[Dd][A-Za-z]*\b|foundation degree|foundation year|with (?:an? )?(?:integrated )?foundation|integrated foundation|extended degree|top[- ]?up|\bCert ?HE\b|\bDip ?HE\b|^Cert\b|^Dip\b|^Diploma\b|^Certificate\b|apprentice|blended learning|\(online\)|distance learning|^Access\b|pre-?sessional|^(?:International )?Foundation\b|\bfoundation\)/i;
const VARIANT_SUFFIX = /\s*(?:\((?:\d+ ?years?|with (?:a )?placement(?: year)?|sandwich|hons|full[- ]time|accelerated|fast[- ]track)\)|[-–,]?\s*(?:with|including) (?:an? )?(?:optional |integrated |professional |industrial |international |work |a )?(?:placement(?: year)?|sandwich year|year in industry|industrial experience|industry year|year abroad|study abroad(?: year)?|year (?:in|of) (?:industry|employment|professional practice|international study|study abroad|placement)|professional experience|international year|placement and study abroad|year (?:in )?abroad))\s*$/i;
function cleanCourseName(name) {
  let t = squash(name).replace(/\s*\(Hons\)/gi, '').replace(/\s+/g, ' ');
  for (let i = 0; i < 4; i += 1) {
    const next = t.replace(VARIANT_SUFFIX, '').trim();
    if (next === t) break;
    t = next;
  }
  return t.replace(/[\s,;:-]+$/, '');
}
const subjectOf = (t) => t.replace(/^(?:[A-Z][A-Za-z]*\.?(?:\/[A-Z][A-Za-z]*)*)\s+(?=[A-Z(])/, '');
const spread = (list, n) => (list.length <= n ? list : Array.from({ length: n }, (_, i) => list[Math.floor((i * list.length) / n)]));

function buildUgCourses(details) {
  const dropped = { partTime: 0, distance: 0, notFirstDegree: 0, duplicate: 0 };
  const seen = new Set();
  const names = [];
  for (const c of details) {
    if (!/full-time/i.test(c.mode?.en || '')) { dropped.partTime += 1; continue; }
    if (/compulsory/i.test(c.distanceLearning?.en || '')) { dropped.distance += 1; continue; }
    if (UG_EXCLUDE.test(c.name)) { dropped.notFirstDegree += 1; continue; }
    const t = cleanCourseName(c.name);
    const k = Q(t);
    if (!t || t.length < 5 || seen.has(k)) { dropped.duplicate += 1; continue; }
    seen.add(k);
    names.push({ name: t, raw: c.name, courseId: c.courseId });
  }
  names.sort((a, b) => subjectOf(a.name).localeCompare(subjectOf(b.name)) || a.name.localeCompare(b.name));
  return { list: names, dropped, total: details.length };
}

// Master's names from official fee tables first (they are the institution's own taught programme list), then UG
function combineCourses(masters, ug) {
  const seen = new Set();
  const m = [];
  for (const t of masters) { const k = Q(t); if (!seen.has(k)) { seen.add(k); m.push(t); } }
  m.sort((a, b) => subjectOf(a).localeCompare(subjectOf(b)));
  const u = ug.map((x) => x.name).filter((t) => !seen.has(Q(t)));
  const nM = Math.min(m.length, Math.max(MASTER_COURSE_SHARE, COURSE_CAP - u.length));
  const mm = spread(m, nM);
  return [...mm, ...spread(u, COURSE_CAP - mm.length)];
}

// ---------------------------------------------------------------------------------------------------------------
// Fees
// ---------------------------------------------------------------------------------------------------------------
// Medicine / dentistry / veterinary programmes are kept out of the typical range and the median. Word boundaries keep
// e.g. "Biomedical Sciences" or "Medical Physics" in. A source can override this with `medicalRe` (band labels such as
// Glasgow's "Science, Engineering, Nursing and College of Medical, Veterinary and Life Sciences programmes").
const MEDICAL_RE = /\bmedicine\b|clinical\)|pre-clinical|\bMBBS\b|MB ?ChB|\bBM ?BS\b|\bBMBS\b|\bdentist|dental surgery|\bBDS\b|\bveterinary\b|\bBVSc\b|\bBVetMed\b|\bBVMS\b/i;
const MASTER_RE = /\bmasters?\b|master'?s|\bM\.?Sc\b|\bMA\b|\bMBA\b|\bLL\.?M\b|\bMRes\b|\bMEd\b|\bMFA\b|\bMPA\b|\bMPP\b|\bMMus\b|\bMArch\b|\bMDes\b|\bMPH\b|\bMFin\b|postgraduate taught|taught postgraduate|\bPGT\b|^postgraduate\b|\bpostgraduate\s*\[/i;
const BACHELOR_RE = /\bbachelors?\b|bachelor'?s|\bB\.?A\b|\bB\.?Sc\b|\bBEng\b|\bLL\.?B\b|\bBMus\b|\bBBA\b|\bBEd\b|\bBDes\b|^undergraduate\b|undergraduate (?:degree|course|programme)|\bfirst degree\b|\(hons\)|integrated master/i;
const RESEARCH_RE = /\bph\.?d\b|doctor|doctorate|\bDBA\b|research degree|by research|\bMPhil\b|writing[- ]up|continuation|\bMbR\b/i;
const FEE_EXCLUDE_RE = /foundation|pre-?sessional|pre-?masters?|pathway|part[- ]?time|distance|online|placement|sandwich|year abroad|study abroad|exchange|visiting|summer school|module|per credit|deposit|\bPGCE\b|\bPGDE\b|PG ?Dip|PG ?Cert|postgraduate (?:diploma|certificate)|graduate (?:diploma|certificate)|diploma|certificate|\bCert ?HE\b|\bHN[CD]\b|top[- ]?up|english language|extension fee|bench fee|application fee|apprentice|\bCPD\b|short course|executive|accelerated|intensive|two[- ]year|2[- ]year|advanced practice|pre-registration|\bSQE\b|\bBar Course\b|\(2 years?\)|\btotal\b|\b\d+ months?\b|^\s*$/i;

// A general rate: the fee a page gives for a whole level ("All Undergraduate programmes (except …)", "Undergraduate",
// "Postgraduate Masters Degree", "Masters degree (MA/MSc)", "MA/MSc", "Taught postgraduate standard") rather than for a
// named programme or a subject band. When exactly one such amount is listed for a level, it is the headline figure
// (it is what nearly all students of that level pay), otherwise the true median of all listed fees is used.
const DEGREE_ABBR = String.raw`(?:BA|BSc|LLB|BEng|MA|MSc|MRes|LLM|MEd)`;
const GENERAL_RE = new RegExp([
  String.raw`^(?:all|most)\b.*\b(?:programmes|courses|degrees)\b`,
  String.raw`\bgeneral rate\b|\(general\)|\bstandard (?:rate|fee)\b|\bstandard\*?$`,
  String.raw`^(?:full[- ]time )?(?:undergraduate|postgraduate(?: taught)?|taught postgraduate|bachelor'?s|master'?s|postgraduate master'?s)(?: (?:degrees?|programmes?|courses?))?(?: \((?!band)[^)]*\))?\*?$`,
  String.raw`^(?:full[- ]time )?${DEGREE_ABBR}(?:\s*(?:\/|,|or)\s*${DEGREE_ABBR})+$`,
].join('|'), 'i');

const MONEY_RE = /£\s?(\d{1,3}(?:,\d{3})+)(\d)?(?![\d,])|£\s?(\d{4,6})(?![\d,])/g;
function moneyIn(cell, plainNumbers = false) {
  const s = String(cell || '');
  if (plainNumbers) { const p = s.match(/^\s*(\d{1,3}(?:,\d{3})+)\**\s*$/); if (p) return { amount: Number(p[1].replace(/,/g, '')) }; }
  const perYear = s.match(/\(£\s?([\d,]+) per year/i);
  if (perYear) return { amount: Number(perYear[1].replace(/,/g, '')), perYearFromTotal: true };
  if (/\btotal\b/i.test(s)) return null; // whole-programme amount without a per-year figure
  const m = MONEY_RE.exec(s);
  MONEY_RE.lastIndex = 0;
  if (!m) return null;
  return { amount: Number((m[1] || m[3]).replace(/,/g, '')) };
}

function classifyFee(label, defaultLevel) {
  const l = squash(label);
  if (FEE_EXCLUDE_RE.test(l)) return { skip: 'non-standard (foundation/part-time/diploma/placement/2-year/total/other)' };
  if (RESEARCH_RE.test(l)) return { skip: 'research/doctoral' };
  if (/integrated master/i.test(l)) return { level: 'bachelor' };
  const isM = MASTER_RE.test(l);
  const isB = BACHELOR_RE.test(l);
  if (isM && !isB) return { level: 'master' };
  if (isB && !isM) return { level: 'bachelor' };
  if (isM && isB) return { skip: 'mixed bachelor/master label' };
  if (defaultLevel === 'bachelor' || defaultLevel === 'master') return { level: defaultLevel };
  return { skip: 'level unclear' };
}

// Header row with colspans expanded so header positions line up with data cells
function rowCells($, tr) {
  const cells = [];
  $(tr).find('th,td').each((_, c) => {
    const text = squash($(c).text());
    const span = Math.min(12, Number($(c).attr('colspan')) || 1);
    for (let i = 0; i < span; i += 1) cells.push(i === 0 ? text : '');
  });
  return cells;
}

// Tables in document order with the nearest headings/caption before them
function tablesWithContext(html) {
  const $ = cheerio.load(String(html));
  $('script,style,noscript,svg').remove();
  $('br').replaceWith(' ');
  $('td p, td div, td li, th p, th div, th li').append(' '); // keep words apart inside cells, as in the page text
  const out = [];
  const heads = [];
  $.root().find('h1,h2,h3,h4,h5,h6,summary,button,caption,table').each((_, el) => {
    if (el.tagName === 'table') {
      const cap = squash($(el).find('caption').first().text());
      const prev = squash($(el).prevAll('p,h2,h3,h4,h5,strong').first().text()).slice(0, 200);
      const rows = $(el).find('tr').toArray().map((tr) => rowCells($, tr));
      out.push({ index: out.length, heading: heads[heads.length - 1] || '', prev, context: [heads[heads.length - 1], cap, prev].filter(Boolean).join(' | '), wide: heads.slice(-4).join(' › '), rows });
      return;
    }
    if ($(el).closest('table').length) return;
    const t = squash($(el).text());
    if (t.length >= 3 && t.length <= 200) heads.push(t);
  });
  return out;
}

function parseTableSource(html, src) {
  const entries = [];
  const skipped = {};
  const skip = (why) => { skipped[why] = (skipped[why] || 0) + 1; };
  const tables = tablesWithContext(html).filter((t) => (!src.tables || src.tables.includes(t.index))
    && (!src.tableMatch || src.tableMatch.test(`${t.context} ${(t.rows[0] || []).join(' ')}`))
    && (!src.prevMatch || src.prevMatch.test(t.prev)));
  for (const t of tables) {
    const headerRows = src.headerRows ?? 1;
    const header = t.rows.slice(0, headerRows).reduce((acc, r) => r.map((c, i) => squash(`${acc[i] || ''} ${c}`)), []);
    let feeCol = typeof src.feeCol === 'number' ? src.feeCol : -1;
    if (feeCol < 0) {
      const re = src.feeHeader || (src.intlPage ? null : INTL);
      if (re) feeCol = header.findIndex((h, i) => i > 0 && re.test(h) && !/part[- ]?time/i.test(h));
      if (re && feeCol < 0) { skip(`table ${t.index}: no fee column matching ${re}`); continue; }
    }
    let section = null; // "Undergraduate" / "Postgraduate" header rows inside a table
    for (const cells of t.rows.slice(headerRows)) {
      if (!cells.some(Boolean)) continue;
      if (src.rowFilter && !src.rowFilter(cells, header)) { skip('row filter'); continue; }
      const labelCols = src.labelCols || [0];
      let label = squash(labelCols.map((i) => cells[i] || '').join(' '));
      const cand = feeCol >= 0 ? [feeCol] : cells.map((_, i) => i).filter((i) => !labelCols.includes(i));
      let money = null;
      let col = null;
      for (const i of cand) { const m = moneyIn(cells[i], src.plainNumbers); if (m) { money = m; col = i; break; } }
      if (!money) {
        if (/^(under|post)graduate\b/i.test(label) && !cells.slice(1).some((c) => /£\s?\d/.test(c))) section = /^under/i.test(label) ? 'bachelor' : 'master';
        else if (cells.slice(1).every((c) => !c || c === '£')) section = /^under/i.test(label) ? 'bachelor' : /^post/i.test(label) ? 'master' : section;
        continue;
      }
      if (src.labelPrefix) label = `${src.labelPrefix}${label}`;
      if (!label) { skip('no label'); continue; }
      if (src.excludeLabels && src.excludeLabels.test(label)) { skip('excluded by source config'); continue; }
      const cls = classifyFee(label, src.level === 'auto' ? (section || null) : (section || src.level));
      if (cls.skip) { skip(cls.skip); continue; }
      if (money.amount < FEE_MIN || money.amount > FEE_MAX) { skip('implausible yearly amount'); continue; }
      entries.push({ level: cls.level, amount: money.amount, label, quote: cells.filter(Boolean).join(' '), column: header[col] || null, table: t.index, context: t.context.slice(0, 160), perYearFromTotal: money.perYearFromTotal || undefined });
      // "Between £39,620 and £66,580": a published range only — keep both ends (marked approx)
      const range = src.rangeBoth && String(cells[col]).match(/£\s?([\d,]+)\D{1,12}£\s?([\d,]+)/);
      if (range) {
        const hi = Number(range[2].replace(/,/g, ''));
        entries[entries.length - 1].label = `${label} (lower end of published range)`;
        entries[entries.length - 1].approx = true;
        if (hi > money.amount && hi <= FEE_MAX) entries.push({ ...entries[entries.length - 1], amount: hi, label: `${label} (upper end of published range)` });
      }
    }
  }
  return { entries, skipped, tablesUsed: tables.map((t) => t.index) };
}

function pdfToText(buf) {
  const tmp = path.join(os.tmpdir(), `uksync-${sha1(buf.toString('latin1', 0, 4096) + buf.length)}.pdf`);
  fs.writeFileSync(tmp, buf);
  try {
    return execFileSync('pdftotext', ['-raw', '-enc', 'UTF-8', tmp, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } finally { fs.rmSync(tmp, { force: true }); }
}

function parsePdfSource(text, src) {
  const entries = [];
  const skipped = {};
  const skip = (why) => { skipped[why] = (skipped[why] || 0) + 1; };
  const body = src.addOn ? text.split(src.addOn.after)[0] : text;
  for (const m of body.matchAll(src.rowRegex)) {
    const label = squash(m.groups.label.replace(/\s\d$/, ''));
    const amount = Number(m.groups.amount.replace(/,/g, ''));
    const cls = classifyFee(label, src.level === 'auto' ? null : src.level);
    if (cls.skip) { skip(cls.skip); continue; }
    if (amount < FEE_MIN || amount > FEE_MAX) { skip('implausible yearly amount'); continue; }
    entries.push({ level: cls.level, amount, label, quote: squash(m[0]) });
  }
  let addOn = null;
  if (src.addOn) {
    const part = text.split(src.addOn.after)[1] || '';
    const items = [...part.matchAll(src.addOn.rowRegex)].map((m) => ({ label: squash(m.groups.label), amount: Number(m.groups.amount.replace(/,/g, '')), quote: squash(m[0]) }));
    if (items.length) {
      const sorted = items.map((i) => i.amount).sort((a, b) => a - b);
      addOn = { label: src.addOn.label, n: items.length, min: sorted[0], max: sorted[sorted.length - 1], median: trueMedian(sorted), evidence: [items.find((i) => i.amount === sorted[0]), items.find((i) => i.amount === sorted[sorted.length - 1])] };
    }
  }
  return { entries, skipped, addOn };
}

// 'regex' parser: rowRegex over the page text (source 'text', default) or over the raw page source (source 'raw', e.g.
// fee data embedded as JSON in the page). Named groups: label (or label(groups)), amount, optional amount2 (upper end of
// a printed range). Optional from/to regexes cut the section first (e.g. "fees for 2026 entry" … "2027 entry").
// The quote kept as evidence is the whole match, which is verbatim in the fetched page.
function parseRegexSource(source, src) {
  const entries = [];
  const skipped = {};
  const skip = (why) => { skipped[why] = (skipped[why] || 0) + 1; };
  let body = String(source);
  if (src.from) {
    const i = body.search(src.from);
    if (i < 0) return { entries, skipped: { [`section start ${src.from} not found`]: 1 } };
    body = body.slice(i);
  }
  if (src.to) { const j = body.slice(1).search(src.to); if (j >= 0) body = body.slice(0, j + 1); }
  for (const m of body.matchAll(src.rowRegex)) {
    const g = m.groups || {};
    if (src.rowFilter && !src.rowFilter(g)) { skip('row filter'); continue; }
    const label = squash(src.label ? src.label(g) : g.label).replace(/&amp;/g, '&');
    if (!label) { skip('no label'); continue; }
    if (src.excludeLabels && src.excludeLabels.test(label)) { skip('excluded by source config'); continue; }
    const cls = classifyFee(label, src.level === 'auto' ? null : src.level);
    if (cls.skip) { skip(cls.skip); continue; }
    if (src.variants) {
      // several amounts in one match, each for its own group of students (e.g. London / non-London campuses)
      for (const v of src.variants) {
        if (!g[v.group]) continue;
        const amount = Number(String(g[v.group]).replace(/,/g, ''));
        if (amount < FEE_MIN || amount > FEE_MAX) { skip('implausible yearly amount'); continue; }
        entries.push({
          level: cls.level, amount, quote: squash(m[0]), label: `${label} (${v.label})${src.lowerBound ? ', from' : ''}`, short: v.label,
          lowerBound: src.lowerBound || undefined, approx: src.lowerBound || undefined,
        });
      }
      continue;
    }
    const amounts = [g.amount, g.amount2].filter(Boolean).map((a) => Number(String(a).replace(/,/g, '')));
    const isRange = amounts.length === 2;
    amounts.forEach((amount, k) => {
      if (amount < FEE_MIN || amount > FEE_MAX) { skip('implausible yearly amount'); return; }
      entries.push({
        level: cls.level, amount, quote: squash(m[0]),
        label: isRange ? `${label} (${k === 0 ? 'lower' : 'upper'} end of published range)` : label,
        approx: isRange || undefined,
      });
    });
  }
  return { entries, skipped };
}

// Page text for the LLM: headings and table rows kept on their own lines, cut to windows around £ amounts
function llmPageText(html, focus, focusEnd) {
  const $ = cheerio.load(String(html));
  $('script,style,noscript,svg,iframe,header,footer,nav').remove();
  $('h1,h2,h3,h4,h5,h6').each((_, h) => { $(h).prepend('\n## '); $(h).append('\n'); });
  $('td,th').append(' | ');
  $('tr,li,p,br,div').append('\n');
  let text = $.root().text().replace(/[ \t ]+/g, ' ').replace(/\n\s*/g, '\n');
  if (focus) { const i = text.search(focus); if (i > 0) text = text.slice(Math.max(0, i - 200)); }
  if (focusEnd) { const j = text.search(focusEnd); if (j > 0) text = text.slice(0, j); }
  const windows = [];
  for (const m of text.matchAll(/£\s?\d/g)) windows.push([Math.max(0, m.index - 400), Math.min(text.length, m.index + 160)]);
  const merged = [];
  for (const w of windows) {
    if (merged.length && w[0] <= merged[merged.length - 1][1]) merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], w[1]);
    else merged.push([...w]);
  }
  return merged.map(([a, b]) => text.slice(a, b)).join('\n…\n').slice(0, 14000);
}

async function groqJson(prompt) {
  const cacheFile = path.join(CACHE_DIR, `llm-${sha1(prompt)}.json`);
  if (!REFRESH && fs.existsSync(cacheFile)) { counters.groqCacheHits += 1; return JSON.parse(fs.readFileSync(cacheFile, 'utf8')); }
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY missing');
  for (const model of GROQ_MODELS) {
    let res = null;
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      counters.groqCalls += 1;
      res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
        signal: AbortSignal.timeout(120000),
      }).catch(() => null);
      if (!res || res.status !== 429) break;
      const hint = (await res.text()).match(/try again in ([\d.]+)(ms|s)/);
      const wait = hint ? Number(hint[1]) / (hint[2] === 'ms' ? 1000 : 1) : 20;
      await sleep(Math.min(70, wait + 3) * 1000); // tokens-per-minute limit shared with other jobs
    }
    if (!res || !res.ok) continue;
    try {
      const out = { model, data: JSON.parse((await res.json()).choices[0].message.content) };
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      fs.writeFileSync(cacheFile, JSON.stringify(out, null, 1));
      return out;
    } catch (_) { /* try next model */ }
  }
  throw new Error('Groq extraction failed');
}

const digitsOnly = (s) => String(s).replace(/(\d)[,\s](?=\d{3}(?!\d))/g, '$1');
// The model's fee year must name the configured year (start year 2026 for '2026/27'; "2026" alone is accepted)
const llmYearOk = (given, year) => {
  const g = String(given);
  if (namesYear(g, year)) return true;
  const ys = [...g.matchAll(/\b(20\d\d)\b/g)].map((m) => Number(m[1]));
  return ys.length === 1 && ys[0] === startYear(year) && !/\d\s*[/–-]\s*\d/.test(g);
};
async function parseLlmSource(html, pageText, src, inst, year) {
  if (NO_LLM) throw new Error('LLM fallback disabled (--no-llm)');
  const levels = src.levels.map((l) => (l === 'bachelor' ? "undergraduate bachelor's degrees" : "taught master's degrees")).join(' and ');
  const prompt = `You read an official UK university web page about tuition fees and list the YEARLY TUITION FEE FOR INTERNATIONAL (overseas) FULL-TIME students for ${levels}.
University: ${inst}
Page: ${src.url}
Preferred fee year: ${year} (if the page shows only another year, use that one and say so in "year").

Return ONLY JSON: {"fees":[{"level":"bachelor"|"master","programme":string,"amountGBP":number,"year":string|null,"quote":string}]}
Rules:
- Only amounts the page says apply to international / overseas (non-UK) students${src.intlPage ? ' (this whole page is about international fees)' : ''}. Skip Home/UK/Scottish/RUK/EU-only fees.
- Skip foundation years, pre-sessional English, pre-master's, part-time, online/distance, placement or study-abroad years, PGCE/PGDE, PG diplomas/certificates, PhD/research, deposits, scholarships/discounts, total multi-year amounts.
- One entry per distinct programme or fee band (e.g. "Band 1 (classroom based)").
- amountGBP = the yearly fee as printed (e.g. "£17,310" -> 17310).
- quote = copy EXACTLY a short contiguous snippet (max 25 words) of the page text that contains the amount.
- If nothing qualifies return {"fees":[]}.

PAGE TEXT:
${llmPageText(html, src.focus, src.focusEnd)}`;
  const { model, data } = await groqJson(prompt);
  const pageQ = Q(pageText);
  const entries = [];
  const rejected = [];
  const yearKnown = !YEAR_NOT_STATED.test(year);
  // a page listing several fee years (e.g. 2025/26, 2026/27 and 2027/28 bands): every amount needs its own year
  const pageYears = academicYearsIn(pageText);
  const multiYear = pageYears.length > 1;
  for (const e of (data.fees || [])) {
    const amount = Number(e.amountGBP);
    const quote = squash(e.quote);
    const label = squash(e.programme);
    let why = null;
    if (!src.levels.includes(e.level)) why = 'level not requested';
    else if (!quote || !Number.isFinite(amount)) why = 'missing quote or amount';
    else if (!pageQ.includes(Q(quote))) why = 'quote not found on page';
    else if (!digitsOnly(quote).includes(String(Math.round(amount)))) why = 'amount not in quote';
    else if (amount < FEE_MIN || amount > FEE_MAX) why = 'implausible yearly amount';
    else if (yearKnown && e.year && !llmYearOk(e.year, year)) why = `different fee year (${e.year})`;
    else if (yearKnown && !e.year && multiYear) why = `no fee year given for this amount, and the page lists several fee years (${pageYears.join(', ')})`;
    else if (!src.intlPage && !INTL.test(`${quote} ${label}`)) why = 'quote does not show the amount is for international students';
    else {
      const cls = classifyFee(label || (e.level === 'bachelor' ? 'Undergraduate' : 'Postgraduate taught'), e.level);
      if (cls.skip) why = cls.skip;
      else if (cls.level !== e.level) why = `label suggests ${cls.level}`;
    }
    if (!why && src.excludeLabels && src.excludeLabels.test(label)) why = 'excluded by source config';
    if (why) { rejected.push({ ...e, rejected: why }); continue; }
    const lbl = label || (e.level === 'bachelor' ? "Bachelor's (general rate)" : "Master's (general rate)");
    const llmYear = e.year ? String(e.year) : null;
    entries.push({ level: e.level, amount, label: lbl, quote, llm: model, llmYear, approx: true });
    // a printed range ("£17,796–19,692", "From £17,748 to £21,114") gives both ends, labelled as such
    const r = quote.match(/£\s?([\d,]+)(?:\.\d\d)?\s*(?:–|-|to)\s*£?\s?([\d,]{5,})/);
    if (r && Number(r[1].replace(/,/g, '')) === Math.round(amount)) {
      const hi = Number(r[2].replace(/,/g, ''));
      if (hi > amount && hi <= FEE_MAX) {
        entries[entries.length - 1].label = `${lbl} (lower end of printed range)`;
        entries.push({ level: e.level, amount: hi, label: `${lbl} (upper end of printed range)`, quote, llm: model, llmYear, approx: true });
      }
    }
  }
  return { entries, rejected, model };
}

// "MSc Civil Engineering MSc Civil Engineering with Industrial Practise" → ["MSc Civil Engineering"]
const COURSE_DEGREE = /^(?:MSc|MA|MBA|LLM|MRes|MFA|MProf|MLitt|MEd|MDes|MArch|MMus|MPH|MPA|MPP|MFin|MLaw|Master)\b/;
const splitCourseLabels = (label) => squash(String(label).replace(/[*​]/g, ''))
  .split(/\s+(?=(?:MSc|MA|MBA|LLM|MRes|MFA|MProf|MLitt|MEd|MDes|MArch|MMus|MPH|MPA|MPP|MFin)\b)/)
  .map((t) => squash(t.replace(/\s*\((?:1 year route|full-time)\)\s*$/i, '')))
  .filter((t) => t.length >= 6 && COURSE_DEGREE.test(t) && !/with (?:industrial|advanced) practi[cs]e|with placement|\bcourses\b/i.test(t) && !/^MBA$/i.test(t));

async function collectFees(ukprn, conf) {
  const sources = [];
  for (const src of conf.sources) {
    const rec = { url: src.url, linkedFrom: src.linkedFrom || null, parser: src.parser, basis: src.basis || null };
    try {
      const raw = await fetchCached(src.url, { scrapeDo: Boolean(src.scrapeDo) });
      rec.fetchedVia = raw.via;
      const isPdf = /pdf/i.test(raw.contentType) || raw.buf.slice(0, 5).toString() === '%PDF-';
      const html = isPdf ? null : raw.buf.toString('utf8');
      const page = isPdf ? { title: null, text: squash(pdfToText(raw.buf)) } : htmlText(html);
      const pdfRaw = isPdf ? pdfToText(raw.buf) : null;
      rec.title = page.title;
      if (src.mustContain && !src.mustContain.test(isPdf ? pdfRaw : page.text)) throw new Error(`page no longer contains ${src.mustContain}`);
      // The fee year must be stated on the page (verbatim quote that names the configured year). Fee years older than
      // the current academic year are outdated: reported, not used.
      if (!YEAR_NOT_STATED.test(conf.year)) {
        const yr = src.yearRe || src.mustContain;
        if (!yr) throw new Error(`no fee-year check (yearRe) configured for ${conf.year}`);
        const ym = (isPdf ? pdfRaw : page.text).match(yr);
        if (!ym) throw new Error(`the page does not state the fee year ${conf.year} (${yr} not found)`);
        rec.yearQuote = squash(ym[0]);
        if (!namesYear(rec.yearQuote, conf.year)) throw new Error(`year quote "${rec.yearQuote}" does not name the configured fee year ${conf.year}`);
        if (startYear(conf.year) < CURRENT_AY_START) rec.outdated = `the page states ${conf.year} fees ("${rec.yearQuote}"), older than the current academic year ${CURRENT_AY_START}/${String(CURRENT_AY_START + 1).slice(2)}; not used`;
      } else rec.yearQuote = null;
      if (rec.outdated && src.parser === 'llm') throw new Error(rec.outdated);
      let out;
      const rawSource = src.parser === 'regex' && src.source === 'raw';
      if (src.parser === 'table') out = parseTableSource(html, src);
      else if (src.parser === 'pdf') out = parsePdfSource(pdfRaw, src);
      else if (src.parser === 'regex') out = parseRegexSource(rawSource ? (html || pdfRaw) : page.text, src);
      else out = await parseLlmSource(html, page.text, src, conf.name, conf.year);
      // every kept quote must be readable in the fetched page text (page source for data embedded in the page)
      const pageQ = Q(rawSource ? (html || pdfRaw) : page.text);
      const medicalRe = src.medicalRe || MEDICAL_RE;
      rec.entries = out.entries.filter((e) => pageQ.includes(Q(e.quote))).map((e) => ({
        ...e, url: src.url, medical: medicalRe.test(e.label) || undefined, quoteFrom: rawSource ? 'page source (data embedded in the page)' : undefined,
        basis: src.basis || (e.llm ? `LLM-extracted (${e.llm}), quote verified` : null),
        courseLabel: src.courseLabels && e.level === 'master' ? splitCourseLabels(e.label) : undefined,
      }));
      rec.unverifiable = out.entries.length - rec.entries.length;
      rec.skipped = out.skipped && Object.keys(out.skipped).length ? out.skipped : undefined;
      rec.rejected = out.rejected && out.rejected.length ? out.rejected : undefined;
      rec.tablesUsed = out.tablesUsed;
      rec.model = out.model;
      if (out.addOn) rec.addOn = out.addOn;
      if (rec.outdated) {
        rec.outdatedEntries = { n: rec.entries.length, sample: rec.entries.slice(0, 5).map((e) => ({ level: e.level, amountGBP: e.amount, programme: e.label, quote: e.quote })) };
        rec.entries = [];
        delete rec.addOn;
      }
    } catch (err) {
      rec.error = err.message;
      rec.entries = [];
    }
    sources.push(rec);
  }
  const summarize = (level) => {
    const seen = new Set();
    const items = [];
    const excluded = [];
    for (const s of sources) {
      for (const e of s.entries.filter((x) => x.level === level)) {
        const k = `${Q(e.label)}|${e.amount}`;
        if (seen.has(k)) continue;
        seen.add(k);
        (e.medical ? excluded : items).push(e);
      }
    }
    if (!items.length) return null;
    const sorted = items.map((i) => i.amount).sort((a, b) => a - b);
    let typical = sorted.length >= 10 ? [quantile(sorted, 0.25), quantile(sorted, 0.75)] : [sorted[0], sorted[sorted.length - 1]];
    let typicalIs = sorted.length >= 10 ? 'middle 50% (25th–75th percentile) of listed programmes' : 'min–max of listed amounts';
    if (sorted.length >= 10 && typical[0] === typical[1]) {
      typical = [quantile(sorted, 0.1), quantile(sorted, 0.9)];
      typicalIs = '10th–90th percentile of listed programmes (middle 50% share one fee)';
    }
    const pick = (amt) => items.find((i) => i.amount === amt);
    const median = trueMedian(sorted);
    // Headline figure (→ USD field) and what it is, named in the display text:
    //  - a page that publishes only range(s): the lower end (median of the lower ends for several ranges)
    //  - minimum ("from") fees only: the lowest of them
    //  - exactly one general rate for the level: that rate (what nearly all students of the level pay)
    //  - otherwise the true median of the listed fees (mean of the two middle values for an even count)
    const RANGE_END = /\((?:lower|upper) end of (?:published|printed) range\)$/;
    const rangeOnly = items.every((i) => RANGE_END.test(i.label));
    const lowerBound = items.every((i) => i.lowerBound);
    let headline;
    let basis;
    let basisItems;
    const lows = items.filter((i) => /\(lower end of (?:published|printed) range\)$/.test(i.label)).sort((a, b) => a.amount - b.amount);
    const general = items.filter((i) => GENERAL_RE.test(i.label));
    const generalAmounts = [...new Set(general.map((i) => i.amount))];
    if (rangeOnly && lows.length) {
      headline = trueMedian(lows.map((i) => i.amount));
      basis = new Set(lows.map((i) => i.amount)).size === 1 ? 'lower end of published range' : `median of the lower ends of ${lows.length} published ranges`;
      basisItems = lows;
    } else if (lowerBound) {
      const lo = items.reduce((a, b) => (b.amount < a.amount ? b : a));
      headline = lo.amount;
      basis = `lowest minimum ("from") fee${lo.short ? ` (${lo.short})` : ''}`;
      basisItems = [lo];
    } else if (items.length > 1 && generalAmounts.length === 1) {
      headline = generalAmounts[0];
      basis = 'general rate';
      basisItems = [general[0]];
    } else {
      headline = median;
      basis = items.length === 1 ? 'fee' : items.length === 2 ? 'midpoint of the 2 listed fees' : `median of ${items.length} listed fees`;
      basisItems = (sorted.length % 2 ? [sorted[(sorted.length - 1) / 2]] : [sorted[sorted.length / 2 - 1], sorted[sorted.length / 2]]).map(pick);
    }
    const addOn = sources.find((s) => s.addOn && s.entries.some((e) => e.level === level))?.addOn || null;
    const ev = [...new Set([pick(sorted[0]), pick(typical[0]), ...basisItems, pick(typical[1]), pick(sorted[sorted.length - 1])].filter(Boolean))];
    return {
      n: items.length, minGBP: sorted[0], maxGBP: sorted[sorted.length - 1], medianGBP: median, headlineGBP: headline, headlineBasis: basis,
      headlineFrom: basisItems.map((i) => `${i.label} (£${num(i.amount)})`),
      typicalGBP: typical, typicalIs, approx: items.some((i) => i.approx) || undefined, addOn,
      rangeOnly: rangeOnly || undefined, lowerBound: lowerBound || undefined,
      lowerBoundParts: lowerBound && items.length <= 3 ? items.slice().sort((a, b) => a.amount - b.amount).map((i) => `from ${gbp(i.amount)}${i.short ? ` (${i.short})` : ''}`) : undefined,
      excludedFromRange: excluded.map((e) => `${e.label} (£${num(e.amount)})`),
      evidence: ev.map((i) => ({ url: i.url, amountGBP: i.amount, programme: i.label, quote: i.quote, quoteFrom: i.quoteFrom, llmYear: i.llmYear || undefined, basis: i.basis || undefined })),
    };
  };
  const masterCourses = [...new Set(sources.flatMap((s) => s.entries.flatMap((e) => e.courseLabel || [])))];
  return { year: conf.year, sources, bachelor: summarize('bachelor'), master: summarize('master'), masterCourses };
}

// Fee fields for one record. Returns { fields, feeLevels } — fields: tuition text + the USD field of each level that has
// an official figure; feeLevels: the levels those USD figures are for. For a postgraduate-only provider (pgOnly, verified
// on its own site) tuitionFeeUSD — the site's default fee — holds the Master's figure.
function feeProposal(f, fx, instName, { pgOnly = false } = {}) {
  if (!f || !fx || (!f.master && !f.bachelor)) return { fields: {}, feeLevels: [] };
  const range = (s) => {
    if (s.lowerBoundParts) return s.lowerBoundParts.join(' / ');
    const r = s.typicalGBP[0] === s.typicalGBP[1] ? gbp(s.typicalGBP[0]) : `${gbp(s.typicalGBP[0])}–${num(s.typicalGBP[1])}`;
    return s.lowerBound ? `from ${r}` : r;
  };
  const out = {};
  const feeLevels = [];
  const parts = [];
  if (f.master) {
    out.graduateTuitionUSD = Math.round(f.master.headlineGBP * fx.rate);
    feeLevels.push('master');
    parts.push(`Master's ${range(f.master)}`);
  }
  if (f.bachelor) {
    const add = f.bachelor.addOn;
    out.tuitionFeeUSD = Math.round((f.bachelor.headlineGBP + (add ? add.median : 0)) * fx.rate);
    feeLevels.push('bachelor');
    parts.push(`Bachelor's ${range(f.bachelor)}${add ? ` + ${add.label} ${gbp(add.min)}–${num(add.max)}` : ''}`);
  } else if (pgOnly && f.master) out.tuitionFeeUSD = out.graduateTuitionUSD;
  const shown = [f.master, f.bachelor].filter(Boolean);
  const approxNotes = [
    shown.some((s) => s.lowerBound) && 'minimum ("from") fees',
    shown.some((s) => !s.lowerBound && (s.approx || s.n > 1)) && 'typical range, approx.',
  ].filter(Boolean);
  const approx = approxNotes.length ? `; ${approxNotes.join('; ')}` : '';
  const med = [f.master && `Master's ${f.master.headlineBasis} ≈ ${usd(out.graduateTuitionUSD)}`, f.bachelor && `Bachelor's ${f.bachelor.headlineBasis} ≈ ${usd(out.tuitionFeeUSD)}${f.bachelor.addOn ? ' incl. median College fee' : ''}`].filter(Boolean).join(', ');
  let tail = '';
  if (!f.master) tail = " · Master's: no official yearly figure in this sync";
  else if (!f.bachelor) tail = pgOnly ? " · postgraduate-only university (no Bachelor's degrees)" : " · Bachelor's: no official yearly figure in this sync";
  out.tuition = `${parts.join(' · ')} per year (international, ${f.year}${approx}; ${med})${tail} — official ${instName} fee pages`;
  return { fields: out, feeLevels };
}

// ---------------------------------------------------------------------------------------------------------------
// Revert (applied runs only). Restores previous values; records created by this script are hidden, never deleted.
// ---------------------------------------------------------------------------------------------------------------
async function revert(reportFile) {
  if (!reportFile || !fs.existsSync(path.resolve(reportFile))) throw new Error(`--revert: report "${reportFile || ''}" not found`);
  const report = JSON.parse(fs.readFileSync(path.resolve(reportFile), 'utf8'));
  // An apply run saves applyStartedAt before its first write, so a run that stopped half-way is revertible too
  if (report.meta?.mode !== 'apply' || !(report.meta?.appliedAt || report.meta?.applyStartedAt)) throw new Error('this report is from a dry run (nothing was written); refusing to revert');
  if (!/^uk-sync-\d{14}$/.test(String(report.runId || ''))) throw new Error(`${reportFile} has no ukSync runId; refusing to revert`);
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('universities');
  let restored = 0;
  // Only records that still carry this run's runId are restored (a record never written by a stopped run is not touched)
  for (const c of [...(report.updates || []), ...(report.deactivations || [])]) {
    const set = {};
    const unset = {};
    for (const [k, v] of Object.entries(c.diff)) {
      if (v.from === undefined || (v.from === null && k === 'dataSource')) unset[k] = '';
      else set[k] = v.from;
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
  console.log(`REVERTED: ${restored} records restored, ${r.modifiedCount} created records hidden (isActive:false) from ${reportFile}`);
  await mongoose.disconnect();
}

// ---------------------------------------------------------------------------------------------------------------
// Plan: every record/field the run would write and a hash of the value (volatile stamps excluded). --apply compares
// its own plan with the reviewed dry run's plan and writes nothing on any difference.
// ---------------------------------------------------------------------------------------------------------------
const VOLATILE_KEYS = new Set(['syncedAt', 'checkedAt', 'runId', 'createdAt', 'updatedAt', '_id']);
const canon = (v) => {
  if (v === undefined || v === null) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object' && typeof v.toHexString === 'function') return v.toHexString();
  if (Array.isArray(v)) return v.map(canon);
  if (typeof v === 'object') return Object.fromEntries(Object.keys(v).filter((k) => !VOLATILE_KEYS.has(k)).sort().map((k) => [k, canon(v[k])]));
  return v;
};
const sha = (x, n = 64) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, n);
function buildPlan(updates, deactivations, creates) {
  const entries = [
    ...updates.map((c) => ({ key: `update:${c.id}`, name: c.name, fields: Object.fromEntries(Object.keys(c.diff).sort().map((k) => [k, sha(canon(c.diff[k].to), 16)])) })),
    ...deactivations.map((c) => ({ key: `deactivate:${c.id}`, name: c.name, fields: Object.fromEntries(Object.keys(c.diff).sort().map((k) => [k, sha(canon(c.diff[k].to), 16)])) })),
    ...creates.map((c) => ({ key: `create:${N(c.doc.name)}|${N(c.doc.city)}`, name: c.doc.name, fields: Object.fromEntries(Object.keys(c.doc).filter((k) => !VOLATILE_KEYS.has(k)).sort().map((k) => [k, sha(canon(c.doc[k]), 16)])) })),
  ].sort((a, b) => a.key.localeCompare(b.key));
  return { hash: sha(entries), entries, note: 'one entry per record this run would write: field -> hash of the value written (syncedAt/checkedAt/runId/createdAt/updatedAt/_id excluded). --apply writes only when its own plan is identical to the reviewed dry run\'s plan.' };
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
// --apply: the reviewed dry run (--expect <report>, default the newest uk-sync dry-run report in backend/reports)
function loadExpected() {
  let file = EXPECT;
  if (EXPECT === undefined) {
    const cands = fs.existsSync(REPORT_DIR) ? fs.readdirSync(REPORT_DIR).filter((f) => /^uk-sync-[\d-]+\.json$/.test(f)) : [];
    let best = null;
    for (const f of cands) {
      try {
        const meta = JSON.parse(fs.readFileSync(path.join(REPORT_DIR, f), 'utf8')).meta || {};
        if (meta.mode === 'dry-run' && (!best || new Date(meta.generatedAt) > new Date(best.at))) best = { f, at: meta.generatedAt };
      } catch (_) { /* not a report */ }
    }
    if (!best) throw new Error('--apply needs a reviewed dry-run report (none found in backend/reports); run a dry run first, review it, then --apply [--expect <report>]');
    file = path.join(REPORT_DIR, best.f);
  }
  if (!file || !fs.existsSync(path.resolve(file))) throw new Error(`--expect: report "${file || ''}" not found`);
  const expected = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  if (expected.meta?.script !== 'scripts/dataSync/ukSync.js' || expected.meta?.mode !== 'dry-run') throw new Error(`--expect ${file}: not a ukSync dry-run report`);
  if (!/^[0-9a-f]{64}$/.test(String(expected.plan?.hash || '')) || !Array.isArray(expected.plan?.entries)) throw new Error(`--expect ${file}: report has no plan (made by an older version of this script); run a new dry run and review it`);
  if (expected.meta.fx && !(Number(expected.meta.fx.rate) > 0 && expected.meta.fx.date)) throw new Error(`--expect ${file}: report has an unusable FX rate`);
  return { file: path.resolve(file), report: expected };
}

// ---------------------------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------------------------
async function feesOnly(pattern) {
  const re = new RegExp(pattern, 'i');
  for (const [ukprn, conf] of Object.entries(FEE_SOURCES)) {
    if (!re.test(conf.name) && !re.test(ukprn)) continue;
    const f = await collectFees(ukprn, conf);
    console.log(`\n## ${conf.name} (${ukprn}) ${f.year}`);
    for (const s of f.sources) {
      console.log(`  ${s.parser} ${s.url} via=${s.fetchedVia || '-'} kept=${s.entries.length} unverifiable=${s.unverifiable ?? '-'} tables=${JSON.stringify(s.tablesUsed || [])} year=«${s.yearQuote || '-'}»${s.outdated ? ` OUTDATED ${s.outdated}` : ''}${s.error ? ` ERROR ${s.error}` : ''}`);
      if (s.skipped) console.log(`    skipped ${JSON.stringify(s.skipped)}`);
      for (const e of s.entries.slice(0, 40)) console.log(`    [${e.level}] £${num(e.amount)}  ${e.label.slice(0, 70)}  «${e.quote.slice(0, 80)}»`);
      if (s.rejected) for (const r of s.rejected.slice(0, 15)) console.log(`    REJECTED ${r.rejected}: ${r.level} ${r.amountGBP} ${String(r.programme).slice(0, 50)} «${String(r.quote).slice(0, 60)}»`);
      if (s.addOn) console.log(`    addOn ${JSON.stringify(s.addOn).slice(0, 200)}`);
    }
    for (const l of ['bachelor', 'master']) if (f[l]) console.log(`  ${l}: n=${f[l].n} ${num(f[l].typicalGBP[0])}–${num(f[l].typicalGBP[1])} headline ${num(f[l].headlineGBP)} = ${f[l].headlineBasis} (true median ${num(f[l].medianGBP)}; ${f[l].typicalIs})`);
    if (f.masterCourses.length) console.log(`  master course names: ${f.masterCourses.length} e.g. ${f.masterCourses.slice(0, 4).join(' | ')}`);
  }
  console.log(JSON.stringify(counters));
}

(async () => {
  const revertIdx = ARGS.indexOf('--revert');
  if (revertIdx !== -1) return revert(ARGS[revertIdx + 1]);
  if (FEES_ONLY) return feesOnly(FEES_ONLY);
  console.log(`UKVI sponsor register + OfS Register + Discover Uni + university fee pages → UK institutions (${APPLY ? 'APPLY' : 'DRY RUN, nothing is written'})`);
  const syncedAt = new Date();
  const uncertainties = [];
  const nulls = [];
  if (EXPECT !== undefined && !APPLY) throw new Error('--expect is only used together with --apply');
  if (ALLOW_MASS_DEACTIVATION && !APPLY) throw new Error('--allow-mass-deactivation is only used together with --apply');
  // --apply reproduces a reviewed dry run: same FX rate (pinned from that report), and the plan must be identical
  const expected = APPLY ? loadExpected() : null;
  if (expected) console.log(`  reviewed dry run: ${expected.file} (${expected.report.runId})`);

  // 1) Official sources
  const sponsors = await loadSponsorRegister();
  console.log(`  sponsor register: ${sponsors.fileName} (updated ${sponsors.lastUpdated}), ${sponsors.rows.length} rows, ${sponsors.studentRows.length} on the Student route`);
  const ofs = await loadOfs();
  console.log(`  OfS Register: ${ofs.providers.length} providers`);
  const duApi = await discoverUniApi();
  const du = await loadDiscoverUniIndex(duApi);
  console.log(`  Discover Uni: ${du.total} courses from ${du.byUkprn.size} providers`);
  let fx = null;
  if (expected) {
    fx = expected.report.meta.fx || null; // same object as in the reviewed report (rate + ECB date)
    if (!fx) uncertainties.push(`FX rate unavailable in the reviewed report ${expected.file}; USD fee fields not proposed`);
  } else {
    try { fx = await gbpToUsd(); } catch (err) { uncertainties.push(`FX rate unavailable (${err.message}); USD fee fields not proposed`); }
  }
  console.log(`  GBP→USD ${fx ? `${fx.rate} (${fx.date})${expected ? ' (pinned to the reviewed dry run)' : ''}` : 'n/a'}`);

  // Lookup tables
  const sponsorByVariant = new Map();
  for (const r of sponsors.studentRows) for (const v of nameVariants(r.name)) { if (!sponsorByVariant.has(v)) sponsorByVariant.set(v, []); sponsorByVariant.get(v).push(r); }
  const ofsByVariant = new Map();
  for (const p of ofs.providers) {
    const names = [p.LegalName, ...String(p.TradingName || '').split('\n'), ...(Array.isArray(p.SearchNames) ? p.SearchNames : [])].map(squash).filter((x) => x && !/^not applicable$/i.test(x));
    for (const n of names) for (const v of nameVariants(n)) if (!ofsByVariant.has(v) || ofsByVariant.get(v).RegistrationStatus !== 'Registered') ofsByVariant.set(v, p);
  }
  const duByVariant = new Map();
  for (const [ukprn, name] of du.names) for (const v of nameVariants(name.replace(/\s*\(Part of [^)]+\)/i, ''))) duByVariant.set(v, ukprn);

  // 2) DB (read only until --apply)
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const uk = await db.collection('countries').findOne({ name: 'UK' });
  if (!uk) throw new Error('Country "UK" not found');
  const ours = await db.collection('universities').find({ country: uk._id }).toArray();
  console.log(`  our UK records: ${ours.length}`);

  // 3) Match every DB record
  const matched = ours.map((u) => {
    const hint = CURATED[u.name] || {};
    const m = { doc: u, hint, problems: [] };
    // UKPRN: curated → OfS names → Discover Uni names
    if (hint.ukprn !== undefined) m.ukprn = hint.ukprn;
    else {
      const p = nameVariants(u.name).map((v) => ofsByVariant.get(v)).find(Boolean);
      m.ukprn = p ? p.Ukprn : (nameVariants(u.name).map((v) => duByVariant.get(v)).find(Boolean) || null);
    }
    m.ofs = m.ukprn ? ofs.byUkprn.get(m.ukprn) || null : null;
    // Sponsor row: curated name → own name → OfS legal/trading names
    const pickRows = (rows) => (rows || []).filter((r) => !hint.sponsorTown || hint.sponsorTown.test(r.town));
    let rows = [];
    if (hint.sponsor) rows = pickRows(sponsorByVariant.get(N(hint.sponsor)));
    if (!rows.length) rows = pickRows(nameVariants(u.name).map((v) => sponsorByVariant.get(v)).find(Boolean));
    if (!rows.length && m.ofs) {
      const names = [m.ofs.LegalName, ...String(m.ofs.TradingName || '').split('\n')].map(squash).filter(Boolean);
      rows = pickRows(names.flatMap(nameVariants).map((v) => sponsorByVariant.get(v)).find(Boolean));
    }
    m.sponsor = rows[0] || null;
    if (hint.sponsor && (!m.sponsor || N(m.sponsor.name) !== N(hint.sponsor))) m.problems.push(`curated sponsor name "${hint.sponsor}" not found on the register`);
    if (hint.ukprn && !m.ofs && !du.names.has(hint.ukprn)) m.problems.push(`curated UKPRN ${hint.ukprn} not found in OfS Register or Discover Uni`);
    m.nation = m.ofs ? 'England' : null;
    return m;
  });

  // 4) Fees (configured institutions only)
  const feesByUkprn = {};
  for (const [ukprn, conf] of Object.entries(FEE_SOURCES)) {
    feesByUkprn[ukprn] = await collectFees(ukprn, conf);
    const f = feesByUkprn[ukprn];
    const errs = f.sources.filter((s) => s.error).map((s) => s.error);
    console.log(`  fees ${conf.name}: Bachelor's ${f.bachelor ? `${num(f.bachelor.minGBP)}–${num(f.bachelor.maxGBP)} (n=${f.bachelor.n})` : 'n/a'}; Master's ${f.master ? `${num(f.master.minGBP)}–${num(f.master.maxGBP)} (n=${f.master.n})` : 'n/a'}${errs.length ? `; errors: ${errs.join('; ')}` : ''}`);
  }

  // 5) Proposals
  const updates = [];
  const creates = [];
  const deactivations = [];
  const unchanged = [];
  const table = [];
  const unverifiedFields = [];
  const sponsorEvidence = (row) => ({ what: 'UKVI register of licensed student sponsors', url: sponsors.csvUrl, publishedOn: sponsors.pageUrl, registerUpdated: sponsors.lastUpdated, quote: row.raw, verified: true });
  const absentEvidence = (names) => ({ what: 'UKVI register of licensed student sponsors — no Student-route row for this institution', url: sponsors.csvUrl, publishedOn: sponsors.pageUrl, registerUpdated: sponsors.lastUpdated, searchedNames: names, rule: { url: sponsors.pageUrl, quote: SPONSOR_RULE_QUOTE, verified: sponsors.ruleVerified } });
  const ofsEvidence = (p, fields) => fields.map((f) => ({ what: `OfS Register: ${f}`, url: OFS_API, publishedOn: OFS_PAGE, ...ofsQuote(ofs, p, f) }));
  const deactivate = (doc, reason, evidence, fields = ['isActive']) => {
    if (doc.isActive === false) return false;
    const dataSource = { provider: PROVIDER, urls: [...new Set(evidence.map((e) => e.url).filter(Boolean))], syncedAt, fields, runId: RUN_ID, reason };
    deactivations.push({ id: String(doc._id), name: doc.name, reason, diff: { isActive: { from: doc.isActive, to: false }, dataSource: { from: doc.dataSource, to: dataSource } }, evidence });
    table.push({ institution: doc.name, action: 'deactivate', website: doc.website, type: doc.type, courses: (doc.courses || []).length, fees: null, feeSource: null, reason });
    return true;
  };

  const DEFAULTISH = { minIeltsScore: 6.5, minGpaPercent: 60, ieltsScore: 'IELTS 6.0+', minScore: 'GPA 3.0+', greExam: 'GRE Waived', workExp: 'Freshers Eligible', scholarshipAvailable: true, minGreScore: 0, greRequired: false };
  const byName = new Map(ours.map((u) => [u.name, u]));
  const handledIds = new Set();
  const ugCache = new Map();
  const getUg = async (ukprn) => {
    if (!ukprn) return null;
    if (!ugCache.has(ukprn)) ugCache.set(ukprn, du.byUkprn.has(String(ukprn)) ? buildUgCourses(await loadDiscoverUniCourses(du, ukprn)) : null);
    return ugCache.get(ukprn);
  };
  // Bachelor's: first-degree courses on Discover Uni, or (no Discover Uni data) undergraduate degrees verified on the
  // institution's own site; never for a postgraduate-only provider verified on its own site
  const levelsFrom = (ug, p, { pgOnly = false, ugSite = false } = {}) => {
    const levels = [];
    if (!pgOnly && ((ug && ug.list.length) || ugSite)) levels.push("Bachelor's");
    const dap = squash(p?.HighestLevelOfDegreeAwardingPowers);
    if (/^(Taught|Research)/i.test(dap)) levels.push("Master's");
    if (/^Research/i.test(dap)) levels.push('PhD');
    if (/^Bachelor/i.test(dap) && !levels.length) levels.push("Bachelor's");
    return levels;
  };
  const HAS_BACHELOR = /bachelor|undergrad/i;
  // A verbatim quote on an institution's own page (curated hints: pgOnly, ugSite, holdDeactivation)
  const siteChecks = new Map();
  const siteCheck = async (spec) => {
    if (!spec) return null;
    const key = `${spec.url} ${spec.quote}`;
    if (!siteChecks.has(key)) {
      let res;
      try {
        const page = await fetchCached(spec.url, { scrapeDo: Boolean(spec.scrapeDo) });
        const { text } = htmlText(page.buf.toString('utf8'));
        res = { url: spec.url, quote: spec.quote, verified: Q(text).includes(Q(spec.quote)), fetchedVia: page.via };
      } catch (err) { res = { url: spec.url, quote: spec.quote, verified: false, error: err.message }; }
      siteChecks.set(key, res);
    }
    return siteChecks.get(key);
  };
  const heldDeactivations = [];
  const feesNotProposed = [];
  const fieldsKeptFromEarlierSync = [];

  // 5a) duplicates first (so the kept record is known)
  for (const m of matched) {
    if (!m.hint.duplicateOf) continue;
    const keep = byName.get(m.hint.duplicateOf);
    const keepM = matched.find((x) => x.doc === keep);
    handledIds.add(String(m.doc._id));
    if (!keep || !keepM) { uncertainties.push(`${m.doc.name}: curated duplicate target "${m.hint.duplicateOf}" not in DB; no change`); continue; }
    const sameUkprn = m.ukprn && keepM.ukprn && m.ukprn === keepM.ukprn;
    const ev = [];
    if (keepM.ofs) {
      ev.push(...ofsEvidence(keepM.ofs, ['Ukprn', 'LegalName', 'TradingName', 'SearchNames']));
    }
    if (keepM.sponsor) ev.push(sponsorEvidence(keepM.sponsor));
    ev.push({ what: 'our records', note: `"${m.doc.name}" (${m.doc.website}) and "${keep.name}" (${keep.website}) both resolve to UKPRN ${m.ukprn || '?'} / ${keepM.ukprn || '?'}` });
    if (!sameUkprn) { uncertainties.push(`${m.doc.name}: duplicate of "${keep.name}" not confirmed by UKPRN (${m.ukprn} vs ${keepM.ukprn}); no change`); continue; }
    deactivate(m.doc, `duplicate of "${keep.name}" (same provider, UKPRN ${m.ukprn}; official name "${keepM.ofs?.LegalName || keep.name}")`, ev);
    if (m.doc.rankingNum != null) uncertainties.push(`${m.doc.name} (hidden as duplicate) holds rankingNum ${m.doc.rankingNum}; the kept record "${keep.name}" has rankingNum ${keep.rankingNum} — ranking fields are not touched here (QS import)`);
  }

  // 5b) every other record
  for (const m of matched) {
    const doc = m.doc;
    if (handledIds.has(String(doc._id))) continue;
    handledIds.add(String(doc._id));
    if (m.hint.coveredBy) {
      unchanged.push(doc.name);
      uncertainties.push(`${doc.name}: not a separate provider or sponsor — it is part of ${m.hint.coveredBy} (one legal entity / licence). Kept unchanged for review (courses/fees not verified).`);
      table.push({ institution: doc.name, action: 'unchanged (review)', website: doc.website, type: doc.type, courses: (doc.courses || []).length, fees: null, feeSource: null });
      continue;
    }
    // --- not a licensed student sponsor → hide
    if (!m.sponsor) {
      const searched = [...new Set([doc.name, m.hint.sponsor, m.ofs?.LegalName, ...String(m.ofs?.TradingName || '').split('\n')].map(squash).filter((x) => x && !/^not applicable$/i.test(x)))];
      const ev = [absentEvidence(searched)];
      if (m.ofs) ev.push(...ofsEvidence(m.ofs, ['LegalName', 'RegisteredCategory', 'RegistrationStatus']));
      if (m.problems.length) uncertainties.push(`${doc.name}: ${m.problems.join('; ')}`);
      if (m.hint.holdDeactivation) {
        // absence from the register contradicted by the institution's own site: no change until a human has checked
        const counter = await siteCheck(m.hint.holdDeactivation);
        const why = `not on the Student-route register (updated ${sponsors.lastUpdated})${m.ofs ? `, OfS Register: ${m.ofs.RegistrationStatus}` : ''}, but its own site still describes the Student-visa / CAS process (${counter.verified ? 'quote verified in this run' : `quote NOT re-verified in this run: ${counter.error || 'not found on the fetched page'}`}); deactivation held for manual confirmation (suspended licence or a lag on either side?)`;
        heldDeactivations.push({ id: String(doc._id), name: doc.name, isActive: doc.isActive, wouldBe: 'isActive:false (not on the UKVI register of licensed student sponsors)', reason: why, evidence: ev, counterEvidence: { what: "the institution's own international-students page", ...counter } });
        uncertainties.push(`${doc.name}: ${why}. Check the licence (e.g. with UKVI or the university) before hiding it.`);
        unchanged.push(doc.name);
        table.push({ institution: doc.name, action: 'deactivation held (review)', website: doc.website, type: doc.type, courses: (doc.courses || []).length, fees: null, feeSource: null, reason: why });
        continue;
      }
      deactivate(doc,`not on the UKVI register of licensed student sponsors (Student route, register updated ${sponsors.lastUpdated}), so it cannot sponsor international students${m.ofs ? ` (OfS Register: ${m.ofs.RegistrationStatus}, ${squash(m.ofs.RegisteredCategory)})` : ''}`, ev);
      continue;
    }
    if (m.problems.length) uncertainties.push(`${doc.name}: ${m.problems.join('; ')}`);

    // --- proposed values
    const p = m.ofs;
    const ug = await getUg(m.ukprn);
    const fees = m.ukprn ? feesByUkprn[m.ukprn] : null;
    const proposed = {};
    const fieldEvidence = [];
    if (m.hint.renameTo && p && [p.LegalName, ...String(p.TradingName || '').split('\n')].some((n) => N(n) === N(m.hint.renameTo)) && N(m.sponsor.name) === N(m.hint.renameTo)) {
      proposed.name = m.hint.renameTo;
      fieldEvidence.push({ what: 'name (renamed institution)', ...ofsEvidence(p, ['LegalName'])[0] }, sponsorEvidence(m.sponsor));
    } else if (m.hint.renameTo) uncertainties.push(`${doc.name}: rename to "${m.hint.renameTo}" not confirmed by both registers; skipped`);
    const ofsSite = origin(p?.Website);
    if (ofsSite && regDomain(ofsSite) !== regDomain(doc.website) && !m.hint.keepWebsite) {
      // the OfS Register sometimes keeps an older domain that now redirects to the one we already hold: not a change
      let finalUrl = null;
      let answered = true; // an HTTP status (even 403 from bot protection) shows the site exists; no answer at all does not
      try { finalUrl = (await fetchCached(ofsSite)).finalUrl || null; } catch (err) { answered = /\((?:\d{3})\)/.test(err.message); }
      if (finalUrl && regDomain(finalUrl) === regDomain(doc.website)) {
        uncertainties.push(`${doc.name}: OfS Register website ${ofsSite} redirects to ${origin(finalUrl)}, the domain already on our record; website kept`);
      } else if (!answered) {
        uncertainties.push(`${doc.name}: OfS Register website ${ofsSite} did not respond (no HTTP answer); our ${doc.website} kept — check by hand`);
      } else {
        proposed.website = ofsSite;
        fieldEvidence.push({ what: 'website (OfS Register)', ...ofsEvidence(p, ['Website'])[0], resolvesTo: finalUrl || 'not checked (request failed)' });
      }
    }
    const charity = squash(p?.ExemptOrRegisteredCharity);
    const company = /\b(Limited|Ltd|Inc\.?)$/i.test(squash(p?.LegalName));
    if (p && /^not applicable$/i.test(charity) && company && String(doc.type || '').toUpperCase() !== 'PRIVATE') {
      proposed.type = 'PRIVATE';
      fieldEvidence.push({ what: 'type: a company that is not a charity (privately owned provider)', ...ofsEvidence(p, ['LegalName'])[0] }, { what: 'type', ...ofsEvidence(p, ['ExemptOrRegisteredCharity'])[0] });
      if (/private provider/i.test(m.sponsor.type)) fieldEvidence.push({ ...sponsorEvidence(m.sponsor), what: 'sponsor type "Private provider"' });
    }
    const masterNames = fees?.masterCourses || [];
    if ((ug && ug.list.length) || masterNames.length) {
      const courses = combineCourses(masterNames, ug ? ug.list : []);
      proposed.courses = courses;
      fieldEvidence.push({
        what: 'courses', url: DU_RESULTS_PAGE, api: `${du.api}/search/courses/`, ukprn: m.ukprn,
        note: `${ug ? ug.list.length : 0} full-time campus first-degree courses on Discover Uni (of ${ug ? ug.total : 0} listed; dropped ${JSON.stringify(ug ? ug.dropped : {})})${masterNames.length ? ` + ${masterNames.length} taught Master's names from the official fee table` : ''}; ${courses.length} kept (cap ${COURSE_CAP})`,
        sample: (ug ? ug.list.slice(0, 3) : []).map((c) => ({ name: c.name, discoverUniName: c.raw, courseId: c.courseId })),
      });
    }
    // curated site checks (verbatim quote on the institution's own page)
    const pgOnly = m.hint.pgOnly ? await siteCheck(m.hint.pgOnly) : null;
    const ugSite = m.hint.ugSite ? await siteCheck(m.hint.ugSite) : null;
    if (pgOnly && !pgOnly.verified) uncertainties.push(`${doc.name}: postgraduate-only check failed (${pgOnly.error || 'quote not found'} on ${pgOnly.url}); treated as a regular provider`);
    if (ugSite && !ugSite.verified) uncertainties.push(`${doc.name}: undergraduate-degree check failed (${ugSite.error || 'quote not found'} on ${ugSite.url})`);
    const isPgOnly = Boolean(pgOnly?.verified);
    const hasUgSite = Boolean(ugSite?.verified);
    const levels = levelsFrom(ug, p, { pgOnly: isPgOnly, ugSite: hasUgSite });
    const dapLevels = Boolean(p && /^(Taught|Research)/i.test(squash(p.HighestLevelOfDegreeAwardingPowers)));
    // No Discover Uni data for the UKPRN is not evidence that a provider has no undergraduate degrees: an existing
    // Bachelor's level is removed only for a provider verified as postgraduate-only on its own site
    const bachelorUnverifiable = ug === null && !isPgOnly && !hasUgSite && (doc.degreeLevels || []).some((l) => HAS_BACHELOR.test(l));
    let degreeLevelsHeld = null;
    if (dapLevels && levels.length && !bachelorUnverifiable) {
      proposed.degreeLevels = levels;
      fieldEvidence.push({
        what: 'degreeLevels', note: `Bachelor's = first-degree courses on Discover Uni${hasUgSite ? " (none listed for this UKPRN; undergraduate degrees verified on the institution's own site)" : ''}${isPgOnly ? " (none: postgraduate-only provider, verified on its own site)" : ''}; Master's/PhD = OfS degree-awarding powers`,
        ...ofsEvidence(p, ['HighestLevelOfDegreeAwardingPowers'])[0],
        ...(isPgOnly ? { postgraduateOnly: pgOnly } : {}), ...(hasUgSite ? { undergraduateOnOwnSite: ugSite } : {}),
      });
    } else if (dapLevels && levels.length) {
      degreeLevelsHeld = `degreeLevels (${JSON.stringify(doc.degreeLevels)}; not changed: no Discover Uni data for UKPRN ${m.ukprn}, so the absence of undergraduate degrees is not verified and the Bachelor's level is not removed)`;
    }

    // Fees. A level without an official figure must not leave an unverified value in its USD field: once
    // dataSource.fields names any fee field, the website shows both USD fields as official (frontend hasOfficialFee).
    let feeVals = feeProposal(fees, fx, proposed.name || doc.name, { pgOnly: isPgOnly });
    let feeBlocked = null;
    if (feeVals.fields.tuition) {
      const blocked = [];
      if (feeVals.fields.tuitionFeeUSD == null && Number(doc.tuitionFeeUSD) > 0) blocked.push(`no official Bachelor's figure, and the unverified tuitionFeeUSD ${doc.tuitionFeeUSD} would then be shown as official`);
      if (feeVals.fields.graduateTuitionUSD == null && Number(doc.graduateTuitionUSD) > 0) blocked.push(`no official Master's figure, and the unverified graduateTuitionUSD ${doc.graduateTuitionUSD} would then be shown as official`);
      if (blocked.length) {
        feeBlocked = blocked.join('; ');
        feesNotProposed.push({
          name: doc.name, ukprn: m.ukprn, reason: feeBlocked,
          officialFiguresNotWritten: { tuition: feeVals.fields.tuition, tuitionFeeUSD: feeVals.fields.tuitionFeeUSD ?? null, graduateTuitionUSD: feeVals.fields.graduateTuitionUSD ?? null, feeLevels: feeVals.feeLevels },
          keptUnchanged: { tuition: doc.tuition ?? null, tuitionFeeUSD: doc.tuitionFeeUSD ?? null, graduateTuitionUSD: doc.graduateTuitionUSD ?? null },
        });
        uncertainties.push(`${doc.name}: official fee rows found but no fee field proposed (${feeBlocked}); existing values left unchanged (official figures in feesNotProposed)`);
        feeVals = { fields: {}, feeLevels: [] };
      }
    }
    Object.assign(proposed, feeVals.fields);
    if (feeVals.fields.tuition) {
      fieldEvidence.push({
        what: 'tuition', year: fees.year, feeLevels: feeVals.feeLevels, ...(isPgOnly ? { note: "postgraduate-only provider: tuitionFeeUSD (the site's default fee) holds the official Master's figure" } : {}),
        fx, bachelor: fees.bachelor, master: fees.master,
        sources: fees.sources.map((s) => ({ url: s.url, linkedFrom: s.linkedFrom, parser: s.parser, fetchedVia: s.fetchedVia, yearQuote: s.yearQuote, kept: s.entries.length, error: s.error, outdated: s.outdated, skipped: s.skipped, rejected: s.rejected, model: s.model })),
      });
    }
    if (fees) {
      for (const s of fees.sources) {
        if (s.outdated) uncertainties.push(`${doc.name}: fee source ${s.url}: ${s.outdated}`);
        else if (s.error) uncertainties.push(`${doc.name}: fee source failed (${s.url}): ${s.error}`);
      }
    }

    const diff = {};
    for (const [k, v] of Object.entries(proposed)) if (JSON.stringify(doc[k]) !== JSON.stringify(v)) diff[k] = { from: doc[k], to: v };
    if (diff.name && ours.some((o) => o !== doc && o.name === diff.name.to && o.city === doc.city)) {
      uncertainties.push(`${doc.name}: rename to "${diff.name.to}" would clash with the unique index; rename skipped`);
      delete diff.name;
    }
    if (diff.website && doc.logo && host(doc.logo) && String(doc.logo).includes(regDomain(doc.website))) {
      diff.logo = { from: doc.logo, to: String(doc.logo).split(regDomain(doc.website)).join(regDomain(diff.website.to)) };
    }
    if (doc.isActive === false && Object.keys(diff).length) diff.isActive = { from: false, to: true };

    // values we keep but could not verify
    const uv = Object.entries(DEFAULTISH).filter(([k, v]) => doc[k] === v).map(([k]) => k);
    if (!feeVals.fields.tuition) {
      if (doc.tuition) uv.push(`tuition ("${doc.tuition}")`);
      if (doc.tuitionFeeUSD != null) uv.push(`tuitionFeeUSD (${doc.tuitionFeeUSD})`);
      if (doc.graduateTuitionUSD != null) uv.push(`graduateTuitionUSD (${doc.graduateTuitionUSD})`);
    }
    if (!proposed.courses) uv.push(`courses (${(doc.courses || []).length} unverified names)`);
    if (!proposed.degreeLevels) uv.push(degreeLevelsHeld || `degreeLevels (${JSON.stringify(doc.degreeLevels)})`);
    if (doc.acceptanceRate != null) uv.push(`acceptanceRate (${doc.acceptanceRate})`);
    uv.push('description', 'eligibility');
    unverifiedFields.push({ name: doc.name, fields: uv });
    if (!feeVals.fields.tuition) {
      const OLD_YEAR = /older than the current academic year/;
      const outdated = fees ? fees.sources.filter((s) => s.outdated || OLD_YEAR.test(s.error || '')).map((s) => s.outdated || s.error) : [];
      const errors = fees ? fees.sources.filter((s) => s.error && !OLD_YEAR.test(s.error)).map((s) => s.error) : [];
      let why;
      if (feeBlocked) why = `official figures found but not written (${feeBlocked}); existing values left unchanged (see feesNotProposed)`;
      else if (!fees) why = 'no official fee page configured for this institution; existing unverified values left unchanged';
      else if (!fx && (fees.bachelor || fees.master)) why = 'no ECB GBP→USD rate in this run; existing values left unchanged';
      else if (outdated.length) why = `the configured official fee page states an outdated fee year: ${outdated.join('; ')}; existing values left unchanged`;
      else why = `configured official fee pages gave no verifiable international fee${errors.length ? ` (${errors.join('; ')})` : ''}; existing values left unchanged`;
      nulls.push({ institution: doc.name, field: 'tuition/tuitionFeeUSD/graduateTuitionUSD', why });
    } else {
      if (feeVals.fields.graduateTuitionUSD == null) nulls.push({ institution: doc.name, field: 'graduateTuitionUSD', why: `no official Master's yearly figure in this sync; ${doc.graduateTuitionUSD == null ? 'left empty' : `stored value ${doc.graduateTuitionUSD} is not a fee`} (the tuition text says so)` });
      if (feeVals.fields.tuitionFeeUSD == null) nulls.push({ institution: doc.name, field: 'tuitionFeeUSD', why: `no official Bachelor's yearly figure in this sync; ${doc.tuitionFeeUSD == null ? 'left empty' : `stored value ${doc.tuitionFeeUSD} is not a fee`} (the tuition text says so)` });
    }

    const officialName = proposed.name || doc.name;
    const fv = feeVals.fields;
    const row = {
      institution: officialName, dbName: doc.name, action: null, website: proposed.website || doc.website, type: proposed.type || doc.type,
      courses: proposed.courses ? proposed.courses.length : `${(doc.courses || []).length} (unverified)`,
      fees: fv.tuition ? { bachelor: fees.bachelor ? `${gbp(fees.bachelor.typicalGBP[0])}–${num(fees.bachelor.typicalGBP[1])} (≈ ${usd(fees.bachelor.typicalGBP[0] * fx.rate)}–${num(fees.bachelor.typicalGBP[1] * fx.rate)})` : null, master: fees.master ? `${gbp(fees.master.typicalGBP[0])}–${num(fees.master.typicalGBP[1])} (≈ ${usd(fees.master.typicalGBP[0] * fx.rate)}–${num(fees.master.typicalGBP[1] * fx.rate)})` : null, tuitionFeeUSD: fv.tuitionFeeUSD ?? null, graduateTuitionUSD: fv.graduateTuitionUSD ?? null, feeLevels: feeVals.feeLevels } : null,
      feeSource: fv.tuition ? [...new Set(fees.sources.filter((s) => s.entries.length).map((s) => host(s.url)))].join(', ') : null,
      ...(feeBlocked ? { feesNotProposed: feeBlocked } : {}), ...(degreeLevelsHeld ? { degreeLevelsNotChanged: true } : {}),
      ukprn: m.ukprn, sponsor: `${m.sponsor.name} (${m.sponsor.status}${m.sponsor.compliance ? `, ${m.sponsor.compliance}` : ''})`,
    };
    if (m.hint.groupNote) uncertainties.push(`${doc.name}: ${m.hint.groupNote}; record kept`);
    if (m.sponsor.compliance) uncertainties.push(`${doc.name}: sponsor register flags "${m.sponsor.compliance}" (licence still valid)`);

    // dataSource.fields = every field whose stored value (after this write) is this run's official value: the fields
    // changed now plus official values already stored. Fields an earlier ukSync run marked official are thereby kept
    // while still equal to this run's official value; the others are reported as not re-verified.
    const officialKeys = Object.keys(proposed).filter((k) => diff[k] || JSON.stringify(doc[k]) === JSON.stringify(proposed[k]));
    const prevDs = doc.dataSource && /^uk-sync-/.test(String(doc.dataSource.runId || '')) ? doc.dataSource : null;
    const prevFields = Array.isArray(prevDs?.fields) ? prevDs.fields.filter((k) => k !== 'isActive') : [];
    const carried = prevFields.filter((k) => !diff[k] && officialKeys.includes(k));
    const notReverified = prevFields.filter((k) => !officialKeys.includes(k));
    if (!Object.keys(diff).length) {
      unchanged.push(doc.name);
      row.action = prevDs ? `unchanged (matches the official sources; earlier sync ${prevDs.runId} kept)` : 'unchanged';
      if (notReverified.length) uncertainties.push(`${doc.name}: ${notReverified.join(', ')} marked official by ${prevDs.runId} could not be re-verified in this run (no write, markers left as they are)`);
      table.push(row);
      continue;
    }
    if (notReverified.length) uncertainties.push(`${doc.name}: ${notReverified.join(', ')} marked official by ${prevDs.runId} could not be re-verified in this run; dropped from dataSource.fields (values unchanged)`);
    if (carried.length) fieldsKeptFromEarlierSync.push({ name: doc.name, earlierRunId: prevDs.runId, fields: carried });
    const fieldsChanged = Object.keys(diff).filter((k) => k !== 'logo' && k !== 'isActive');
    const fields = officialKeys;
    const feeFields = fields.filter((k) => FEE_FIELDS.includes(k));
    const urls = [...new Set([
      sponsors.csvUrl, p ? OFS_API : null, fields.includes('courses') ? DU_RESULTS_PAGE : null,
      ...(fields.includes('degreeLevels') ? [isPgOnly ? pgOnly.url : null, hasUgSite ? ugSite.url : null] : []),
      ...(feeFields.length ? fees.sources.filter((s) => s.entries.length).map((s) => s.url) : []),
    ].filter(Boolean))];
    const common = {
      urls, fields, runId: RUN_ID, ukprn: m.ukprn || null,
      ...(diff.logo ? { derivedFields: { logo: 'same logo service, re-pointed to the official website domain' } } : {}),
    };
    // The website shows "Official government & university data" for any record with dataSource.provider (badge, source
    // label next to fees, "updated <syncedAt>"): provider/syncedAt only when a fee field is official
    const dataSource = feeFields.length
      ? {
        provider: `${PROVIDER} + official university fee pages`, syncedAt, ...common, fx, feeYear: fees.year, feeLevels: feeVals.feeLevels,
        feeBasis: `headline figure per level (USD fields): the general rate when the page names one, otherwise the true median of the listed fees; the lower end where a page publishes only ranges; the lowest minimum ("from") fee where only minimum fees are published. Typical range (display) of international full-time yearly tuition on official fee pages; medicine/dentistry/veterinary excluded${isPgOnly ? "; postgraduate-only provider: tuitionFeeUSD holds the Master's figure" : ''}`,
      }
      : {
        sourceNames: PROVIDER, checkedAt: syncedAt, ...common,
        labelWithheld: 'provider/syncedAt deliberately not set: no fee field of this record is from an official source, and the website shows the official-data label for any record with a provider',
      };
    diff.dataSource = { from: doc.dataSource, to: dataSource };
    updates.push({ id: String(doc._id), name: doc.name, ukprn: m.ukprn, fieldsChanged, ...(carried.length ? { fieldsKeptFromEarlierSync: carried } : {}), labelled: Boolean(feeFields.length), diff, evidence: [sponsorEvidence(m.sponsor), ...fieldEvidence] });
    row.action = feeFields.length ? 'update' : 'update (no official-data label)';
    table.push(row);
  }

  // 5c) Eligible universities missing from our DB → create (university title on the OfS Register + licensed HEI sponsor
  //     + at least 10 full-time campus first-degree courses on Discover Uni)
  const ourUkprns = new Set(matched.map((m) => m.ukprn).filter(Boolean));
  const ourSponsorNames = new Set(matched.map((m) => m.sponsor && m.sponsor.name).filter(Boolean));
  const candidatesNotInDb = [];
  for (const r of sponsors.studentRows.filter((x) => /Higher Education Institution/i.test(x.type) && !/Overseas/i.test(x.type))) {
    if (ourSponsorNames.has(r.name)) continue;
    const p = nameVariants(r.name).map((v) => ofsByVariant.get(v)).find(Boolean) || null;
    if (p && ourUkprns.has(p.Ukprn)) continue;
    const ukprn = p?.Ukprn || nameVariants(r.name).map((v) => duByVariant.get(v)).find(Boolean) || null;
    const ug = ukprn ? await getUg(ukprn) : null;
    const isUni = p && /^yes$/i.test(squash(p.ProviderHasTheRightToUseUniversity)) && /^Registered$/i.test(squash(p.RegistrationStatus));
    const cand = { sponsorName: r.name, town: r.town, sponsorStatus: r.status, ukprn, ofsLegalName: p?.LegalName || null, universityTitle: p ? squash(p.ProviderHasTheRightToUseUniversity) : 'n/a (not in the OfS Register: Scotland/Wales/NI or not registered)', discoverUniCourses: ug ? ug.list.length : 0 };
    if (!isUni || !ug || ug.list.length < 10) {
      cand.note = !isUni ? 'licensed HEI sponsor without OfS university title (or not on the OfS Register) — not created' : 'fewer than 10 full-time campus first-degree courses on Discover Uni — not created';
      candidatesNotInDb.push(cand);
      continue;
    }
    const trading = String(p.TradingName || '').split('\n').map(squash).find((t) => /university/i.test(t) && !/^not applicable$/i.test(t));
    const name = trading || r.name.replace(/\s+(Limited|Ltd)$/i, '');
    const website = origin(p.Website);
    const addrLines = String(p.ContactAddress || '').split('\n').map(squash).filter(Boolean);
    // sponsor town, or (town "Various") the town line of the OfS contact address: the line before the postcode, skipping a county line
    const pcIdx = addrLines.findIndex((l) => /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(l));
    const COUNTY = /^(?:Greater Manchester|Greater London|(?:(?:East|West|North|South)\s+)?(?:Sussex|Yorkshire|Midlands|Kent|Surrey|Essex|Middlesex|Merseyside|Devon|Cornwall|Cumbria|Norfolk|Suffolk|Tyne and Wear|[A-Za-z]+shire))$/i;
    const addrTown = pcIdx > 0 ? (COUNTY.test(addrLines[pcIdx - 1]) && pcIdx > 1 ? addrLines[pcIdx - 2] : addrLines[pcIdx - 1]) : null;
    const city = !/various/i.test(r.town) ? r.town.replace(/\b([a-z])/g, (c) => c.toUpperCase()) : addrTown;
    if (ours.some((o) => o.name === name)) { cand.note = `a record named "${name}" exists`; candidatesNotInDb.push(cand); continue; }
    const fees = feesByUkprn[ukprn] || null;
    const { fields: feeVals, feeLevels } = feeProposal(fees, fx, name);
    const courses = combineCourses(fees?.masterCourses || [], ug.list);
    const degreeLevels = levelsFrom(ug, p);
    const charity = squash(p.ExemptOrRegisteredCharity);
    const type = /^not applicable$/i.test(charity) && /\b(Limited|Ltd|Inc\.?)$/i.test(squash(p.LegalName)) ? 'PRIVATE' : null;
    const fields = ['name', 'city', 'website', 'courses', 'degreeLevels', 'description', ...(type ? ['type'] : []), ...Object.keys(feeVals)];
    const id = new mongoose.Types.ObjectId();
    const doc = {
      _id: String(id), name, country: String(uk._id), city, website,
      logo: website ? `https://www.google.com/s2/favicons?domain=${host(website)}&sz=128` : null,
      type, description: `${name} is a UK higher-education provider${city ? ` in ${city}` : ''}. It is licensed by the Home Office to sponsor international students (register of licensed student sponsors) and is on the Office for Students Register with the right to use "university" in its title.`,
      eligibility: null, categoryTags: [], rank: null,
      tuition: feeVals.tuition ?? null, tuitionFeeUSD: feeVals.tuitionFeeUSD ?? null, graduateTuitionUSD: feeVals.graduateTuitionUSD ?? null,
      minGpaPercent: null, minIeltsScore: null, minGreScore: null, greRequired: null, acceptanceRate: null,
      minScore: null, ieltsScore: null, greExam: null, workExp: null, scholarshipAvailable: null, rankingNum: null,
      courses, degreeLevels, isActive: true,
      dataSource: { provider: PROVIDER, urls: [sponsors.csvUrl, OFS_API, DU_RESULTS_PAGE, ...(fees ? fees.sources.filter((s) => s.entries.length).map((s) => s.url) : [])], syncedAt, fields, runId: RUN_ID, createdBySync: SYNC_ID, ukprn, ...(feeVals.tuition ? { fx, feeYear: fees.year, feeLevels } : {}) },
    };
    if (!type) nulls.push({ institution: name, field: 'type', why: 'OfS Register shows a charity / public body but no official public-vs-private label; left null' });
    if (!feeVals.tuition) nulls.push({ institution: name, field: 'tuition/tuitionFeeUSD/graduateTuitionUSD', why: 'no official fee page processed for this new record; null instead of a guess' });
    nulls.push({ institution: name, field: 'admission requirements (IELTS/GPA/GRE/workExp), acceptanceRate, scholarshipAvailable, rankingNum, eligibility', why: 'not published in the official sources used; null instead of schema defaults (rankings come from the separate QS import)' });
    creates.push({ id: String(id), name, ukprn, doc, evidence: [sponsorEvidence(r), ...ofsEvidence(p, ['Ukprn', 'LegalName', 'TradingName', 'Website', 'ProviderHasTheRightToUseUniversity', 'HighestLevelOfDegreeAwardingPowers', 'ExemptOrRegisteredCharity']), { what: 'courses', url: DU_RESULTS_PAGE, ukprn, note: `${ug.list.length} full-time campus first-degree courses` }] });
    table.push({ institution: name, action: 'create', website, type, courses: courses.length, fees: feeVals.tuition ? feeVals.tuition : null, feeSource: null, ukprn, sponsor: `${r.name} (${r.status})` });
  }

  // 6) Safety cap on deactivations (a wrong register would hide records in bulk)
  const deactivationCap = Math.min(10, Math.floor(ours.length * 0.05));
  const overCap = deactivations.length > deactivationCap;
  if (overCap) uncertainties.push(`${deactivations.length} deactivations proposed, more than the safety cap of ${deactivationCap} (min(10, 5% of ${ours.length} records)): --apply refuses unless --allow-mass-deactivation is given — check the sponsor register first`);

  // 7) Report
  const bachelorOnlyFees = updates.filter((u) => u.labelled && (u.diff.dataSource.to.feeLevels || []).join() === 'bachelor').map((u) => u.name);
  const reviewNotes = [
    {
      topic: 'Official-data label',
      note: `Only records whose dataSource.fields include a fee field get dataSource.provider/syncedAt (the website shows "Official government & university data" for any record with a provider). ${updates.filter((u) => !u.labelled).length} updated records (courses/degreeLevels/website/type only) carry dataSource.sourceNames/checkedAt instead.`,
    },
    {
      topic: 'Fee fields withheld',
      note: `${feesNotProposed.length} record(s) have official fee figures for one level only while the other level's USD field holds an unverified value; the website would show that value as official, so no fee field is proposed for them (official figures in feesNotProposed).`,
      records: feesNotProposed.map((x) => x.name),
    },
    {
      topic: "Bachelor's-only official fees (outside this script)",
      note: "These records get an official Bachelor's fee and no Master's figure (graduateTuitionUSD stays empty; the tuition text says \"Master's: no official yearly figure\"). backend/controllers/shortlistController.js feeForDegree() and frontend courseFinderHelper fall back to tuitionFeeUSD for Master's applicants, i.e. they show the Bachelor's fee for a Master's search. That fallback has to change in the controller/frontend; this script does not invent a Master's figure.",
      records: bachelorOnlyFees,
    },
  ];
  if (heldDeactivations.length) reviewNotes.push({ topic: 'Deactivations held for a human check', note: 'Absent from the Student-route register, but the institution\'s own site still describes the Student-visa / CAS process. Not hidden by this run.', records: heldDeactivations.map((h) => h.name) });
  uncertainties.push(
    'Courses = Discover Uni (OfS/HESA) full-time, campus-based undergraduate first-degree courses by UKPRN, cleaned (foundation years, HNC/HND, top-ups, apprenticeships, part-time/distance dropped; placement/study-abroad variants merged), capped at 150; plus taught Master\'s names from official fee tables where a fee table lists them. Discover Uni has no postgraduate courses, so for most universities the list is undergraduate only.',
    "degreeLevels are proposed only for providers on the OfS Register (England): Bachelor's from Discover Uni, Master's/PhD from OfS degree-awarding powers (Taught → Master's; Research → Master's + PhD). A provider without Discover Uni data keeps an existing Bachelor's level unless its own site verifies it is postgraduate-only (or verifies undergraduate degrees). Scottish/Welsh/NI records keep their existing degreeLevels (no official machine-readable source used).",
    'type is changed only to PRIVATE for providers the OfS Register shows as companies (Limited/Inc.) that are not charities; other types are left as they are.',
    'Fee ranges: 25th–75th percentile (10th–90th if the middle 50% share one fee; n≥10) or min–max of international full-time yearly fees on each official page. USD fields = headline figure × ECB GBP→USD: the general rate when the page names one rate for the whole level (e.g. "All undergraduate programmes except …"), otherwise the true median (mean of the two middle values for an even count); the lower end where a page publishes only ranges and the lowest "from" fee where only minimum fees are published (both named in the display text). Subject-band pages give band fees, not per-programme fees. Medicine/dentistry/veterinary are excluded from range and median. Every fee source must state its fee year on the page (verbatim yearQuote) unless the display text says the year is not stated; older fee years are not used.',
  );
  const plan = buildPlan(updates, deactivations, creates);
  let mode = APPLY ? 'apply' : 'dry-run';
  let expectCheck = null;
  if (expected) {
    const differences = comparePlans(expected.report.plan, plan);
    expectCheck = { report: expected.file, reviewedRunId: expected.report.runId, expectedHash: expected.report.plan.hash, actualHash: plan.hash, match: !differences.length && expected.report.plan.hash === plan.hash, differences: differences.slice(0, 300) };
    if (!expectCheck.match) mode = 'apply-refused';
  }
  if (APPLY && mode === 'apply' && overCap && !ALLOW_MASS_DEACTIVATION) mode = 'apply-refused';
  const summary = {
    runId: RUN_ID, mode, planHash: plan.hash, ...(expectCheck ? { expectCheck: { report: expectCheck.report, match: expectCheck.match, differences: expectCheck.differences.length } } : {}),
    ourUkRecords: ours.length,
    creates: creates.length, updates: updates.length,
    updatesWithOfficialDataLabel: updates.filter((u) => u.labelled).length, updatesWithoutLabel: updates.filter((u) => !u.labelled).length,
    deactivations: deactivations.length, deactivationCap, deactivationsHeld: heldDeactivations.map((h) => h.name), unchanged: unchanged.length,
    fieldsChanged: Object.fromEntries(['name', 'website', 'logo', 'type', 'courses', 'degreeLevels', 'tuition', 'tuitionFeeUSD', 'graduateTuitionUSD', 'isActive'].map((f) => [f, updates.filter((u) => u.diff[f]).length])),
    feesVerified: updates.filter((u) => u.labelled).map((u) => `${u.name} (${(u.diff.dataSource.to.feeLevels || []).join('+')})`),
    feesNotProposed: feesNotProposed.map((x) => x.name),
    sponsorRegister: { file: sponsors.fileName, updated: sponsors.lastUpdated, csvLinkFoundOnPage: sponsors.linkFoundOnPage, ruleVerified: sponsors.ruleVerified, studentRouteRows: sponsors.studentRows.length, floor: STUDENT_ROWS_FLOOR },
    fx, requests: counters,
  };
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  // One file per run (second precision; '-apply' for apply runs) and never overwritten: an apply report is the only record
  // of the previous values that --revert restores
  const reportPath = path.join(REPORT_DIR, `uk-sync-${syncedAt.toISOString().slice(0, 19).replace(/[:T]/g, '-')}${APPLY ? '-apply' : ''}.json`);
  const report = {
    meta: { script: 'scripts/dataSync/ukSync.js', syncId: SYNC_ID, mode, generatedAt: syncedAt, fx, ...(expected ? { fxPinnedFrom: expected.file } : {}), cacheDir: CACHE_DIR },
    runId: RUN_ID, summary,
    ...(expectCheck ? { expectCheck } : {}),
    sources: {
      sponsorRegister: { page: sponsors.pageUrl, csv: sponsors.csvUrl, updated: sponsors.lastUpdated, rows: sponsors.rows.length, studentRouteRows: sponsors.studentRows.length, rule: { quote: SPONSOR_RULE_QUOTE, verified: sponsors.ruleVerified }, csvLinkFoundOnPage: sponsors.linkFoundOnPage },
      ofsRegister: { page: OFS_PAGE, api: OFS_API, providers: ofs.providers.length },
      discoverUni: { site: DU_RESULTS_PAGE, api: du.api, courses: du.total, providers: du.byUkprn.size },
      fees: Object.fromEntries(Object.entries(FEE_SOURCES).map(([k, c]) => [k, { name: c.name, year: c.year, urls: c.sources.map((s) => s.url) }])),
      siteChecks: [...siteChecks.values()],
    },
    table, creates, updates, deactivations, heldDeactivations, feesNotProposed, fieldsKeptFromEarlierSync, unchanged, nulls, unverifiedFields, candidatesNotInDb, uncertainties, reviewNotes,
    fees: feesByUkprn, fetchLog, plan,
  };
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), { flag: 'wx' });
  } catch (err) {
    if (err.code === 'EEXIST') throw new Error(`report ${reportPath} already exists; refusing to overwrite it (nothing was written to the DB)`);
    throw err;
  }
  console.log(JSON.stringify({ ...summary, feesVerified: summary.feesVerified.length }, null, 2));
  console.table(table.map((r) => ({ institution: String(r.institution).slice(0, 45), action: String(r.action).slice(0, 30), type: r.type, courses: r.courses, bachelor: r.fees?.bachelor || '', master: r.fees?.master || '' })));
  console.log(`full report: ${reportPath}`);

  if (mode === 'apply-refused') {
    if (expectCheck && !expectCheck.match) {
      console.error(`PLAN MISMATCH with ${expected.file} (${expectCheck.differences.length} difference(s)); nothing was written:`);
      for (const d of expectCheck.differences.slice(0, 40)) console.error(`  - ${d}`);
      throw new Error(`--apply refused: the plan differs from the reviewed dry run ${expected.file}; review ${reportPath} (or a new dry run) and apply with --expect <that report>`);
    }
    throw new Error(`--apply refused: ${deactivations.length} deactivations exceed the safety cap of ${deactivationCap}; nothing was written (re-run with --allow-mass-deactivation only after checking the sponsor register)`);
  }
  if (APPLY) {
    // The report is saved BEFORE the first write (applyStartedAt) and after every write, so a run that stops half-way
    // can still be reverted (--revert accepts it; every written record carries dataSource.runId).
    const col = db.collection('universities');
    const save = () => fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    let written = 0;
    report.meta.applyStartedAt = new Date();
    save();
    try {
      for (const u of [...updates, ...deactivations]) {
        const set = { updatedAt: new Date() };
        for (const [k, v] of Object.entries(u.diff)) set[k] = v.to;
        await col.updateOne({ _id: new mongoose.Types.ObjectId(u.id) }, { $set: set });
        u.writtenAt = new Date();
        written += 1;
        save();
      }
      for (const c of creates) {
        const clash = await col.findOne({ name: c.doc.name, country: uk._id, city: c.doc.city });
        if (clash) { c.skipped = 'a record with the same name/country/city exists'; save(); continue; }
        const now = new Date();
        await col.insertOne({ ...c.doc, _id: new mongoose.Types.ObjectId(c.id), country: uk._id, createdAt: now, updatedAt: now });
        c.insertedId = c.id;
        save();
      }
      report.meta.appliedAt = new Date();
    } catch (err) {
      report.meta.applyError = `${err.message} (after ${written} of ${updates.length + deactivations.length} updates/deactivations); revert with --revert ${reportPath}`;
      throw err;
    } finally {
      save();
    }
    console.log(`APPLIED: ${creates.filter((c) => c.insertedId).length} created, ${updates.length} updated, ${deactivations.length} deactivated (revert: --revert ${reportPath})`);
  }
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('FAILED:', err.stack || err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
