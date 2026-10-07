/**
 * PILOT: extract English-test and GPA requirements + application deadline for a few universities from their
 * own official pages. Read-only: prints a report, writes nothing to the database.
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

// Official pages are found with DuckDuckGo's HTML endpoint (no key). SerpAPI is used only if its key works.
async function findPages(uni) {
  const host = regHost(uni.website);
  const rootDomain = registrableDomain(host);
  const q = `site:${rootDomain} international graduate admissions English language requirements IELTS TOEFL`;
  let links = [];
  if (SERPAPI_API_KEY) {
    try {
      const j = await (await fetch(`https://serpapi.com/search.json?engine=google&num=5&q=${encodeURIComponent(q)}&api_key=${SERPAPI_API_KEY}`)).json();
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
  // Prefer graduate/postgraduate pages when the search returns several
  const own = links.filter((l) => regHost(l).endsWith(rootDomain));
  const graduateFirst = [...own.filter((l) => /grad|postgrad|sgs|masters/i.test(l)), ...own.filter((l) => !/grad|postgrad|sgs|masters/i.test(l))];
  return [...new Set(graduateFirst)].slice(0, 3);
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
  const prompt = `You read an official university web page and extract admission requirements for INTERNATIONAL GRADUATE (Master's) applicants.
University: ${uniName}
Page URL: ${url}

Return ONLY JSON:
{"ieltsOverall": number|null, "ieltsQuote": string|null,
 "toeflIbt": number|null, "toeflQuote": string|null,
 "minGpa": string|null, "gpaQuote": string|null,
 "applicationDeadline": string|null, "deadlineQuote": string|null}

Rules: use only what the page says; copy each quote EXACTLY as a short contiguous snippet (max 25 words) from the page text;
if a value is not on the page, use null for it and its quote. Overall IELTS band only (e.g. 6.5), TOEFL iBT total only.
Only the GRADUATE / POSTGRADUATE (Master's) requirement counts. If the page shows undergraduate and graduate values,
take the graduate one. If it only covers undergraduate or exchange students, return null for that value.
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
const SANE_RANGES = { ieltsOverall: [5, 8.5], toeflIbt: [60, 118] };

// A value is kept only if its quote is really in the page (guards against the model inventing numbers)
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9.]+/g, ' ').trim();
function verify(data, text) {
  const page = norm(text);
  const pairs = [['ieltsOverall', 'ieltsQuote'], ['toeflIbt', 'toeflQuote'], ['minGpa', 'gpaQuote'], ['applicationDeadline', 'deadlineQuote']];
  const out = {};
  for (const [field, quoteField] of pairs) {
    const value = data[field];
    const quote = data[quoteField];
    if (value === null || value === undefined || !quote) { out[field] = null; continue; }
    const ok = page.includes(norm(quote)) && norm(quote).includes(norm(String(value)).split(' ')[0]);
    if (!ok) { out[field] = { value, quote, rejected: 'quote not found on page' }; continue; }
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
    const uni = await mongoose.connection.db.collection('universities').findOne({ name }, { projection: { name: 1, website: 1, minIeltsScore: 1, minGpaPercent: 1 } });
    if (!uni || !uni.website) { results.push({ name, error: 'not in DB or no website' }); continue; }
    try {
      const pages = await findPages(uni);
      if (!pages.length) { results.push({ name, error: 'no official page found' }); continue; }
      let best = null;
      for (const url of pages) {
        const text = await fetchPage(url);
        const { model, data } = await extract(text, name, url);
        const verified = verify(data, text);
        const found = Object.values(verified).filter((v) => v && !v.rejected).length;
        if (!best || found > best.found) best = { url, model, verified, found };
        if (found >= 3) break;
      }
      results.push({ name, ourDb: { ielts: uni.minIeltsScore, gpaPercent: uni.minGpaPercent }, ...best });
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
