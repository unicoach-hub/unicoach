/**
 * University-wide minimum English requirement (IELTS / TOEFL iBT) for international graduate applicants, taken from
 * each university's own CENTRAL admissions pages, written to University.englishRequirement.
 *
 *   node scripts/dataSync/englishRequirementsSync.js                     # DRY RUN: search + extract + report, writes nothing
 *   node scripts/dataSync/englishRequirementsSync.js --apply <report>    # write the verified values of that reviewed dry run
 *   node scripts/dataSync/englishRequirementsSync.js --revert <applied report>
 *
 * Options (dry run): --countries UK,Ireland,...  --per-country <n> (default per country below)  --names "A;B"
 *                    --max-serp <n> (default 230)  --max-scrapedo <n> (default 300)  --recheck-days <n> (default 90)
 *
 * Accuracy rules (from the pilots):
 *  - pages: SerpAPI (DuckDuckGo engine, honours site:) on the university's own registrable domain; only central pages
 *    (main site, admissions / graduate school / registry / international office). Faculty, department and programme
 *    pages are rejected so one school's rule is never shown as the whole university's.
 *  - the LLM must say whether the page states a university-wide minimum (with a quote); faculty/programme/unclear → nothing.
 *  - every value needs an exact quote found in the page text; quotes listing several scores (band tables) are rejected;
 *    values outside plausible ranges are rejected.
 *  - GPA and deadlines vary by programme and are not extracted here.
 *  - universities whose requirement varies by programme simply get no englishRequirement (the site then says
 *    "check official site"), never a guessed number.
 * Reports go to backend/reports/ (git-ignored).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const ARGS = process.argv.slice(2);
const argValue = (flag) => { const i = ARGS.indexOf(flag); return i !== -1 ? ARGS[i + 1] : undefined; };
const APPLY = argValue('--apply');
const REVERT = argValue('--revert');
const MAX_SERP = Number(argValue('--max-serp') || 230);
const MAX_SCRAPEDO = Number(argValue('--max-scrapedo') || 300);
const RECHECK_DAYS = Number(argValue('--recheck-days') || 90);
const PER_COUNTRY_ARG = argValue('--per-country');
const COUNTRIES_ARG = argValue('--countries');
const NAMES_ARG = argValue('--names');
const { SERPAPI_API_KEY, SCRAPE_DO_TOKEN, GROQ_API_KEY } = process.env;
const REPORT_DIR = path.join(__dirname, '..', '..', 'reports');
const RUN_ID = `english-req-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
const MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const counters = { serp: 0, direct: 0, scrapeDo: 0, groq: 0, groqRetries: 0 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Default selection: the largest universities (by number of official courses) of the main destinations for Indian students
const DEFAULT_PER_COUNTRY = { UK: 60, Ireland: 18, Canada: 40, Australia: 38, 'New Zealand': 25, Germany: 25 };

const regHost = (url) => String(url || '').toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '');
function registrableDomain(host) {
  const parts = host.split('.').filter(Boolean);
  const multiPartSuffix = parts.length >= 3 && /^(ac|edu|co|gov|org|com|net)$/.test(parts[parts.length - 2])
    && parts[parts.length - 1].length === 2;
  return parts.slice(multiPartSuffix ? -3 : -2).join('.');
}

// Subdomains that belong to the central university (not a faculty/department)
const CENTRAL_SUBDOMAIN = /^(www\d?|future|futurestudents|study|studying|admissions?|apply|applications?|international|intl|global|grad|graduate|gradschool|graduateschool|sgs|postgrad|postgraduate|pg|registry|registrar|students?|onprem|courses?|prospective|en|english)$/i;
// Path words that mean the page is about one faculty / department / discipline
const DEPARTMENT_PATH = /(faculty|faculties|department|dept|school-of|\/schools?\/|college-of|physics|chemistry|biolog|mathemat|business|management|law\b|\/law\/|medicine|medical|nursing|engineering|computer-science|economics|arts|music|sport|health-sciences|mba\b|\/programs?\/[a-z]|\/programmes?\/[a-z])/i;

function scorePage(link, rootDomain) {
  const host = regHost(link);
  if (!host.endsWith(rootDomain)) return -100;
  const sub = host === rootDomain ? '' : host.slice(0, -rootDomain.length - 1);
  if (sub && !sub.split('.').every((part) => CENTRAL_SUBDOMAIN.test(part))) return -100;
  const p = link.toLowerCase().replace(/^https?:\/\/[^/]+/, '');
  if (DEPARTMENT_PATH.test(p)) return -100;
  // Pages for other kinds of students (exchange / study abroad / visiting / pathway / undergraduate) never count
  if (/exchange|study-?abroad|inbound|visiting|summer|foundation|pathway|pre-?sessional|undergrad/.test(p)) return -100;
  let score = 1;
  if (/english-?language|language-?requirement|english-?requirement|english-?proficiency|minimum-?english/.test(p)) score += 4;
  if (/grad|postgrad|masters|sgs/.test(host + p)) score += 2;
  if (/international|entry-requirement|admission/.test(p)) score += 1;
  if (/\.pdf($|\?)/.test(p)) score -= 2;
  return score;
}

async function findPages(uni) {
  const rootDomain = registrableDomain(regHost(uni.website));
  if (counters.serp >= MAX_SERP) throw new Error(`SerpAPI budget for this run (${MAX_SERP}) reached`);
  counters.serp += 1;
  const q = `site:${rootDomain} postgraduate admissions English language requirements international students IELTS TOEFL`;
  const j = await (await fetch(`https://serpapi.com/search.json?engine=duckduckgo&q=${encodeURIComponent(q)}&api_key=${SERPAPI_API_KEY}`, { signal: AbortSignal.timeout(60000) })).json();
  if (j.error) throw new Error(`SerpAPI: ${j.error}`);
  const links = (j.organic_results || []).map((r) => r.link);
  const ranked = [...new Set(links)].map((link) => ({ link, score: scorePage(link, rootDomain) })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  return { rootDomain, pages: ranked.slice(0, 3).map((x) => x.link), rejected: links.filter((l) => scorePage(l, rootDomain) <= 0).slice(0, 5) };
}

const pageText = (html) => {
  const $ = cheerio.load(html);
  $('script,style,noscript,svg,header nav,footer').remove();
  return $('body').text().replace(/\s+/g, ' ').trim();
};

// Direct request first (free); scrape.do only when the site blocks us
async function fetchPage(url) {
  try {
    counters.direct += 1;
    const res = await fetch(url, { headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(30000) });
    if (res.ok && /html/i.test(res.headers.get('content-type') || '')) {
      const text = pageText(await res.text());
      if (text.length > 400 && !/just a moment|enable javascript|access denied|captcha/i.test(text.slice(0, 600))) return { text, via: 'direct' };
    }
  } catch (_) { /* fall back to scrape.do */ }
  if (counters.scrapeDo >= MAX_SCRAPEDO) throw new Error(`scrape.do budget for this run (${MAX_SCRAPEDO}) reached`);
  counters.scrapeDo += 1;
  const res = await fetch(`https://api.scrape.do/?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`scrape.do HTTP ${res.status}`); // never echo the API URL (token)
  return { text: pageText(await res.text()), via: 'scrape.do' };
}

async function extract(text, uniName, url) {
  const prompt = `You read an official university web page and extract the UNIVERSITY-WIDE MINIMUM English-language requirement for INTERNATIONAL GRADUATE (Master's) applicants.
University: ${uniName}
Page URL: ${url}

Return ONLY JSON:
{"scope": "university" | "programme" | "unclear", "scopeQuote": string|null,
 "ieltsOverall": number|null, "ieltsMinBand": number|null, "ieltsQuote": string|null,
 "toeflIbt": number|null, "toeflQuote": string|null}

scope: "university" ONLY if the page states the general minimum that applies across the university's graduate/postgraduate
programmes (e.g. "minimum requirements for all postgraduate programmes", "the University's standard requirement").
Use "programme" if the values belong to one faculty, school, department or programme, or if the page says requirements vary
by course. Otherwise "unclear". scopeQuote: the exact snippet that shows the scope.
Rules: use only what the page says; copy each quote EXACTLY as a short contiguous snippet (max 25 words) from the page text;
if a value is not on the page, use null for it and its quote. Overall IELTS band (e.g. 6.5) and the minimum per-band score if
stated (e.g. 6.0); TOEFL iBT total only. If several levels are listed, take the standard/minimum one, not a higher band for
specific programmes. If the page only covers undergraduate or exchange students, return nulls.
Never return a test's maximum possible score (IELTS 9, TOEFL 120) or a table header as the requirement.

PAGE TEXT:
${text.slice(0, 15000)}`;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const model = MODELS[attempt % MODELS.length];
    counters.groq += 1;
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
      signal: AbortSignal.timeout(120000),
    }).catch(() => null);
    if (!res) continue;
    if (res.status === 429) { counters.groqRetries += 1; await sleep(15000 * (attempt + 1)); continue; } // rate limit
    if (!res.ok) continue;
    const j = await res.json();
    try { return { model, data: JSON.parse(j.choices[0].message.content) }; } catch (_) { /* retry */ }
  }
  throw new Error('Groq extraction failed');
}

const SANE_RANGES = { ieltsOverall: [5, 8.5], ieltsMinBand: [4, 8.5], toeflIbt: [60, 118] };
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9.]+/g, ' ').trim();
function verify(data, text) {
  const page = norm(text);
  const pairs = [['ieltsOverall', 'ieltsQuote'], ['ieltsMinBand', 'ieltsQuote'], ['toeflIbt', 'toeflQuote']];
  const out = {};
  const scopeOk = data.scope === 'university' && data.scopeQuote && page.includes(norm(data.scopeQuote));
  out.scope = { value: data.scope || null, quote: data.scopeQuote || null, ok: Boolean(scopeOk) };
  if (!scopeOk) {
    for (const [field] of pairs) out[field] = data[field] == null ? null : { value: data[field], rejected: `page scope "${data.scope}" is not university-wide` };
    return out;
  }
  for (const [field, quoteField] of pairs) {
    const value = data[field];
    const quote = data[quoteField];
    if (value === null || value === undefined || !quote) { out[field] = null; continue; }
    const ok = page.includes(norm(quote)) && norm(quote).includes(norm(String(value)).split(' ')[0].replace(/\.0$/, ''));
    if (!ok) { out[field] = { value, quote, rejected: 'quote not found on page' }; continue; }
    const scores = new Set((String(quote).match(/\b\d{1,3}(?:\.\d)?\b/g) || []).filter((x) => (field === 'toeflIbt' ? Number(x) >= 60 && Number(x) <= 120 : Number(x) >= 4 && Number(x) <= 9)));
    if (scores.size >= 3) { out[field] = { value, quote, rejected: 'quote lists a range of scores (table), not one minimum' }; continue; }
    const range = SANE_RANGES[field];
    if (range && !(Number(value) >= range[0] && Number(value) <= range[1])) { out[field] = { value, quote, rejected: `outside plausible range ${range[0]}-${range[1]}` }; continue; }
    out[field] = { value: Number(value), quote };
  }
  if (out.ieltsMinBand && !out.ieltsMinBand.rejected && out.ieltsOverall && !out.ieltsOverall.rejected && out.ieltsMinBand.value > out.ieltsOverall.value) {
    out.ieltsMinBand = { ...out.ieltsMinBand, rejected: 'minimum band higher than overall' };
  }
  return out;
}

const good = (v) => v && !v.rejected;
const toRecord = (best) => {
  const v = best.verified;
  const rec = { sourceUrl: best.url, quotes: [], checkedAt: best.checkedAt, runId: RUN_ID };
  if (good(v.ieltsOverall)) { rec.ieltsOverall = v.ieltsOverall.value; rec.quotes.push(v.ieltsOverall.quote); }
  if (good(v.ieltsMinBand)) rec.ieltsMinBand = v.ieltsMinBand.value;
  if (good(v.toeflIbt)) { rec.toeflIbt = v.toeflIbt.value; rec.quotes.push(v.toeflIbt.quote); }
  rec.quotes = [...new Set(rec.quotes)];
  return rec.ieltsOverall || rec.toeflIbt ? rec : null;
};

async function selectUniversities(db) {
  const countries = await db.collection('countries').find({}).toArray();
  const byName = new Map(countries.map((c) => [c.name, c._id]));
  const recheckBefore = new Date(Date.now() - RECHECK_DAYS * 864e5);
  if (NAMES_ARG) {
    const names = NAMES_ARG.split(';').map((s) => s.trim()).filter(Boolean);
    return db.collection('universities').find({ name: { $in: names }, isActive: { $ne: false } }).toArray();
  }
  const wanted = COUNTRIES_ARG ? COUNTRIES_ARG.split(',').map((s) => s.trim()) : Object.keys(DEFAULT_PER_COUNTRY);
  const out = [];
  for (const country of wanted) {
    const id = byName.get(country);
    if (!id) { console.warn(`  ! country not found: ${country}`); continue; }
    const limit = Number(PER_COUNTRY_ARG || DEFAULT_PER_COUNTRY[country] || 20);
    const unis = await db.collection('universities').aggregate([
      { $match: { country: id, isActive: { $ne: false }, website: { $type: 'string', $ne: '' },
        $or: [{ 'englishRequirement.checkedAt': { $exists: false } }, { 'englishRequirement.checkedAt': { $lt: recheckBefore } }] } },
      { $addFields: { courseCount: { $size: { $ifNull: ['$courses', []] } } } },
      { $sort: { courseCount: -1, name: 1 } },
      { $limit: limit },
      { $project: { name: 1, website: 1, englishRequirement: 1, courseCount: 1 } },
    ]).toArray();
    unis.forEach((u) => out.push({ ...u, countryName: country }));
  }
  return out;
}

async function dryRun(db) {
  for (const k of ['SERPAPI_API_KEY', 'SCRAPE_DO_TOKEN', 'GROQ_API_KEY']) if (!process.env[k]) throw new Error(`${k} missing in .env`);
  const unis = await selectUniversities(db);
  console.log(`English requirements (DRY RUN, nothing is written): ${unis.length} universities`);
  const results = [];
  const reportFile = path.join(REPORT_DIR, `${RUN_ID}-dry-run.json`);
  const save = () => fs.writeFileSync(reportFile, JSON.stringify({ runId: RUN_ID, mode: 'dry-run', generatedAt: new Date().toISOString(), counters, results }, null, 2));
  for (const uni of unis) {
    const base = { id: String(uni._id), name: uni.name, country: uni.countryName, website: uni.website, previous: uni.englishRequirement || null };
    try {
      const { pages, rejected } = await findPages(uni);
      if (!pages.length) { results.push({ ...base, status: 'no-central-page', rejectedPages: rejected }); console.log(`  – ${uni.name}: no central admissions page`); save(); continue; }
      let best = null;
      for (const url of pages) {
        let fetched;
        try { fetched = await fetchPage(url); } catch (e) { continue; }
        const { model, data } = await extract(fetched.text, uni.name, url);
        const verified = verify(data, fetched.text);
        const found = ['ieltsOverall', 'toeflIbt'].filter((f) => good(verified[f])).length;
        if (!best || found > best.found) best = { url, via: fetched.via, model, verified, found, checkedAt: new Date().toISOString() };
        if (found >= 2) break;
      }
      const proposal = best ? toRecord(best) : null;
      results.push({ ...base, status: proposal ? 'proposed' : 'no-university-wide-value', proposal, evidence: best, otherCandidates: pages.filter((p) => p !== best?.url), rejectedPages: rejected });
      console.log(`  ${proposal ? '✔' : '–'} ${uni.name}: ${proposal ? `IELTS ${proposal.ieltsOverall ?? '—'}${proposal.ieltsMinBand ? ` (${proposal.ieltsMinBand} each)` : ''} · TOEFL ${proposal.toeflIbt ?? '—'} · ${regHost(proposal.sourceUrl)}` : `no university-wide value (${best?.verified?.scope?.value || 'no page read'})`}`);
    } catch (err) {
      results.push({ ...base, status: 'error', error: err.message });
      console.log(`  ✖ ${uni.name}: ${err.message}`);
      if (/budget for this run/.test(err.message)) { save(); break; }
    }
    save();
  }
  save();
  const proposed = results.filter((r) => r.status === 'proposed').length;
  console.log(`\nproposed: ${proposed} · no university-wide value: ${results.filter((r) => r.status === 'no-university-wide-value').length} · no page: ${results.filter((r) => r.status === 'no-central-page').length} · errors: ${results.filter((r) => r.status === 'error').length}`);
  console.log(`requests: ${JSON.stringify(counters)}`);
  console.log(`full report: ${reportFile}`);
}

async function apply(db, reportPath) {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  if (report.mode !== 'dry-run') throw new Error('--apply needs a dry-run report');
  const col = db.collection('universities');
  const applied = { runId: report.runId, mode: 'apply', appliedAt: new Date().toISOString(), fromReport: path.basename(reportPath), writes: [] };
  const appliedFile = path.join(REPORT_DIR, `${report.runId}-apply.json`);
  for (const r of report.results.filter((x) => x.status === 'proposed' && x.proposal)) {
    const current = await col.findOne({ _id: new mongoose.Types.ObjectId(r.id) }, { projection: { englishRequirement: 1, name: 1 } });
    if (!current) continue;
    applied.writes.push({ id: r.id, name: r.name, previous: current.englishRequirement || null, next: r.proposal });
    fs.writeFileSync(appliedFile, JSON.stringify(applied, null, 2)); // saved before each write so a half-run can be reverted
    await col.updateOne({ _id: current._id }, { $set: { englishRequirement: { ...r.proposal, checkedAt: new Date(r.proposal.checkedAt) } } });
  }
  fs.writeFileSync(appliedFile, JSON.stringify(applied, null, 2));
  console.log(`APPLIED: ${applied.writes.length} universities updated (revert: --revert ${appliedFile})`);
}

async function revert(db, reportPath) {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  if (report.mode !== 'apply') throw new Error('--revert needs an apply report');
  const col = db.collection('universities');
  let n = 0;
  for (const w of report.writes) {
    const filter = { _id: new mongoose.Types.ObjectId(w.id), 'englishRequirement.runId': report.runId };
    const update = w.previous ? { $set: { englishRequirement: w.previous } } : { $unset: { englishRequirement: '' } };
    const res = await col.updateOne(filter, update);
    n += res.modifiedCount;
  }
  console.log(`REVERTED: ${n} universities restored`);
}

(async () => {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  if (APPLY) await apply(db, APPLY);
  else if (REVERT) await revert(db, REVERT);
  else await dryRun(db);
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('FAILED:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
