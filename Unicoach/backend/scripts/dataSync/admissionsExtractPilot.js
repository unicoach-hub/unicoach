/**
 * PILOT: extract the university-wide minimum English-test requirement (IELTS / TOEFL iBT) for international
 * graduate applicants from each university's own CENTRAL admissions pages. Read-only: prints a report, writes nothing.
 *
 * Accuracy rules (learned from the first pilot, where department pages were picked up):
 *  - only central pages (main site, admissions / graduate school / registry / international office) are used;
 *    faculty, department and single-programme pages are rejected, so one school's rule is never shown as the
 *    whole university's;
 *  - the model must also say whether the page states a university-wide minimum, with a quote; anything scoped
 *    to a faculty or programme is dropped;
 *  - GPA and deadlines vary by programme, so they are not extracted at university level.
 *
 *   node scripts/dataSync/admissionsExtractPilot.js
 *
 * Pipeline per university: SerpAPI (find the official admissions page on the university's own domain)
 * → scrape.do (fetch the page) → Groq LLM (extract values WITH an exact quote from the page)
 * → verify every quote really appears in the page text; values whose quote is missing are dropped.
 * Uses ~1 SerpAPI search + 1–2 scrape.do requests per university.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const { SERPAPI_API_KEY, SCRAPE_DO_TOKEN, GROQ_API_KEY } = process.env;
const PILOT = [
  'University of Toronto', 'University of Manchester', 'Trinity College Dublin', 'Technical University of Munich',
  'University of Melbourne', 'Northeastern University', 'University of Leeds', 'University College Dublin',
];
const MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

const regHost = (url) => String(url || '').toLowerCase().replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '');

// manchester.ac.uk → manchester.ac.uk, unimelb.edu.au → unimelb.edu.au, utoronto.ca → utoronto.ca
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
  if (sub && !sub.split('.').every((part) => CENTRAL_SUBDOMAIN.test(part))) return -100; // physics.utoronto.ca etc.
  const p = link.toLowerCase().replace(/^https?:\/\/[^/]+/, '');
  if (DEPARTMENT_PATH.test(p)) return -100;
  let score = 1;
  if (/english-?language|language-?requirement|english-?requirement|english-?proficiency|minimum-?english/.test(p)) score += 4;
  if (/grad|postgrad|masters|sgs/.test(host + p)) score += 2;
  if (/international|entry-requirement|admission/.test(p)) score += 1;
  if (/\.pdf($|\?)/.test(p)) score -= 2;
  if (/undergrad|exchange|inbound|visiting|summer|foundation/.test(p)) score -= 3;
  return score;
}

// Official pages are found with SerpAPI (DuckDuckGo engine), falling back to DuckDuckGo's HTML endpoint via scrape.do.
async function findPages(uni) {
  const host = regHost(uni.website);
  const rootDomain = registrableDomain(host);
  const q = `site:${rootDomain} postgraduate admissions English language requirements international students IELTS TOEFL`;
  let links = [];
  if (SERPAPI_API_KEY) {
    try {
      // SerpAPI's DuckDuckGo engine honours the site: filter; its Google engine was returning off-domain results
      const j = await (await fetch(`https://serpapi.com/search.json?engine=duckduckgo&q=${encodeURIComponent(q)}&api_key=${SERPAPI_API_KEY}`)).json();
      if (!j.error) links = (j.organic_results || []).map((r) => r.link);
    } catch (_) { /* fall through to DuckDuckGo */ }
  }
  if (!links.length) {
    // DuckDuckGo blocks repeated direct queries, so the search page is fetched through scrape.do too
    const ddg = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
    const res = await fetch(`https://api.scrape.do/?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(ddg)}`);
    const html = await res.text();
    links = [...html.matchAll(/class="result__a" href="([^"]+)"/g)].map((m) => {
      const u = m[1].match(/uddg=([^&]+)/);
      return u ? decodeURIComponent(u[1]) : m[1];
    });
    await new Promise((r) => setTimeout(r, 1500)); // be polite between searches
  }
  const ranked = [...new Set(links)]
    .map((link) => ({ link, score: scorePage(link, rootDomain) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return { pages: ranked.slice(0, 3).map((x) => x.link), rejected: links.filter((l) => scorePage(l, rootDomain) <= 0).slice(0, 5) };
}

async function fetchPage(url) {
  const res = await fetch(`https://api.scrape.do/?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error(`scrape.do HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  $('script,style,noscript,svg,header nav,footer').remove();
  return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 24000);
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
Use "programme" if the values belong to one faculty, school, department or programme. Otherwise "unclear".
scopeQuote: the exact snippet that shows the scope.
Rules: use only what the page says; copy each quote EXACTLY as a short contiguous snippet (max 25 words) from the page text;
if a value is not on the page, use null for it and its quote. Overall IELTS band (e.g. 6.5) and the minimum per-band score if
stated (e.g. 6.0); TOEFL iBT total only. If several levels are listed, take the standard/minimum one, not a higher band for
specific programmes. If the page only covers undergraduate or exchange students, return nulls.
Never return a test's maximum possible score (IELTS 9, TOEFL 120) or a table header as the requirement.

PAGE TEXT:
${text}`;
  for (const model of MODELS) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
    });
    if (res.status === 429) { await new Promise((r) => setTimeout(r, 20000)); continue; } // Groq rate limit
    if (!res.ok) continue;
    const j = await res.json();
    try { return { model, data: JSON.parse(j.choices[0].message.content) }; } catch (_) { /* try next */ }
  }
  throw new Error('Groq extraction failed');
}

// Minimum requirements outside these ranges are almost always a misread (max score, table header, other test)
const SANE_RANGES = { ieltsOverall: [5, 8.5], ieltsMinBand: [4, 8.5], toeflIbt: [60, 118] };

// A value is kept only if its quote is really in the page (guards against the model inventing numbers)
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9.]+/g, ' ').trim();
function verify(data, text) {
  const page = norm(text);
  const pairs = [['ieltsOverall', 'ieltsQuote'], ['ieltsMinBand', 'ieltsQuote'], ['toeflIbt', 'toeflQuote']];
  const out = {};
  // University-level values only: a page scoped to one faculty/programme contributes nothing
  const scopeOk = data.scope === 'university' && data.scopeQuote && page.includes(norm(data.scopeQuote));
  if (!scopeOk) {
    for (const [field] of pairs) out[field] = data[field] == null ? null : { value: data[field], rejected: `page scope "${data.scope}" is not university-wide` };
    out.scope = { value: data.scope, quote: data.scopeQuote || null, ok: false };
    return out;
  }
  out.scope = { value: 'university', quote: data.scopeQuote, ok: true };
  for (const [field, quoteField] of pairs) {
    const value = data[field];
    const quote = data[quoteField];
    if (value === null || value === undefined || !quote) { out[field] = null; continue; }
    const ok = page.includes(norm(quote)) && norm(quote).includes(norm(String(value)).split(' ')[0].replace(/\.0$/, ''));
    if (!ok) { out[field] = { value, quote, rejected: 'quote not found on page' }; continue; }
    // A quote listing several scores is a table of bands (e.g. "5.5 6 6.5 7 7.5+"), not one minimum
    const scores = new Set((String(quote).match(/\b\d{1,3}(?:\.\d)?\b/g) || []).filter((x) => (field === 'toeflIbt' ? Number(x) >= 60 && Number(x) <= 120 : Number(x) >= 4 && Number(x) <= 9)));
    if (scores.size >= 3) { out[field] = { value, quote, rejected: 'quote lists a range of scores (table), not one minimum' }; continue; }
    const range = SANE_RANGES[field];
    if (range && !(Number(value) >= range[0] && Number(value) <= range[1])) {
      out[field] = { value, quote, rejected: `outside plausible range ${range[0]}-${range[1]}` };
      continue;
    }
    out[field] = { value, quote };
  }
  return out;
}

(async () => {
  for (const k of ['SERPAPI_API_KEY', 'SCRAPE_DO_TOKEN', 'GROQ_API_KEY']) if (!process.env[k]) throw new Error(`${k} missing in .env`);
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const results = [];
  for (const name of PILOT) {
    const col = mongoose.connection.db.collection('universities');
    const projection = { projection: { name: 1, website: 1, minIeltsScore: 1, minGpaPercent: 1 } };
    const uni = (await col.findOne({ name, isActive: { $ne: false } }, projection)) || (await col.findOne({ name }, projection));
    if (!uni || !uni.website) { results.push({ name, error: 'not in DB or no website' }); continue; }
    try {
      const { pages, rejected } = await findPages(uni);
      if (!pages.length) { results.push({ name, error: 'no central admissions page found', rejectedPages: rejected }); continue; }
      let best = null;
      for (const url of pages) {
        const text = await fetchPage(url);
        const { model, data } = await extract(text, name, url);
        const verified = verify(data, text);
        const found = ['ieltsOverall', 'toeflIbt'].filter((f) => verified[f] && !verified[f].rejected).length;
        if (!best || found > best.found) best = { url, model, verified, found, checkedAt: new Date().toISOString() };
        if (found >= 2) break;
      }
      results.push({ name, ...best, otherCandidates: pages.filter((p) => p !== best.url), rejectedPages: rejected });
      console.log(`✔ ${name}: ${best.found} verified value(s) from ${best.url}`);
    } catch (err) {
      results.push({ name, error: err.message });
      console.log(`✖ ${name}: ${err.message}`);
    }
  }
  await mongoose.disconnect();
  fs.mkdirSync(path.join(__dirname, '..', '..', 'reports'), { recursive: true });
  const out = path.join(__dirname, '..', '..', 'reports', `admissions-pilot-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`);
  fs.writeFileSync(out, JSON.stringify(results, null, 2));
  console.log(`report: ${out}`);
})().catch(async (err) => {
  console.error('FAILED:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
