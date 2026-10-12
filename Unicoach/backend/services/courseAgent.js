// Course data agent: finds a university's course pages, reads each one in full (Firecrawl renders
// JavaScript sites) and has an LLM pull out the fields we show. Nothing is guessed: a field the page
// doesn't state stays null, and every value comes with the sentence it was taken from.
const { callLLM, cleanJsonResponse } = require('../utils/aiService');

const FIRECRAWL = 'https://api.firecrawl.dev/v1';
const MAX_PAGE_CHARS = 60000;

const firecrawlKey = () => {
  const key = (process.env.FIRECRAWL_API_KEY || '').trim();
  if (!key) throw new Error('FIRECRAWL_API_KEY is not set in backend/.env');
  return key;
};

const firecrawl = async (path, body, timeoutMs = 90000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${FIRECRAWL}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${firecrawlKey()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(`Firecrawl ${path} ${res.status}: ${data.error || 'failed'}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
};

// Paths that are course pages at most universities (one course per URL)
const COURSE_HINT = /(course|programme|program|degree|postgraduate|undergraduate|taught|masters?|msc|ma-|mba|bsc|ba-|meng|llm)/i;
const NOT_COURSE = /(news|event|blog|staff|people|research|contact|apply|fees?-and-funding|scholarship|accommodation|login|search|\.pdf$|#)/i;

/**
 * Course page URLs on the university site. `search` narrows Firecrawl's site map (e.g. "msc computing").
 */
async function discoverCourseUrls(siteUrl, { search = 'postgraduate masters course', limit = 20 } = {}) {
  const origin = new URL(siteUrl).origin;
  const data = await firecrawl('/map', { url: origin, search, limit: 500, includeSubdomains: false });
  const links = (data.links || []).map((l) => (typeof l === 'string' ? l : l.url)).filter(Boolean);
  const seen = new Set();
  return links
    .filter((u) => {
      try {
        const p = new URL(u);
        const segs = p.pathname.split('/').filter(Boolean);
        return segs.length >= 2 && COURSE_HINT.test(p.pathname) && !NOT_COURSE.test(p.pathname);
      } catch {
        return false;
      }
    })
    .filter((u) => {
      const key = u.replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    // Canonical course pages ("/courses/...") first; they carry fees and intakes
    .sort((a, b) => Number(/\/courses?\//i.test(b)) - Number(/\/courses?\//i.test(a)))
    .slice(0, limit);
}

// Images and link targets cost tokens and carry no facts: "![x](u)" goes, "[text](u)" keeps "text"
const compact = (md) => md
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

/** Whole page as markdown (main content only), plus the links on it */
async function readPage(url) {
  const data = await firecrawl('/scrape', { url, formats: ['markdown'], onlyMainContent: true, timeout: 60000 });
  const raw = data.data?.markdown || '';
  const links = [...new Set([...raw.matchAll(/\]\((https?:[^)\s]+)\)/g)].map((m) => m[1]))];
  return { markdown: compact(raw).slice(0, MAX_PAGE_CHARS), links, title: data.data?.metadata?.title || '' };
}

const SYSTEM = `You extract facts about ONE university course from its official web page for international students.
Rules:
- Use ONLY what the page states. Never guess, never use typical values. If the page does not state a field, set it to null.
- Fees: the annual tuition for non-EU / international students. If only a total for the whole course is given, put it in totalFee instead. Keep the page's currency (EUR, GBP, CAD, AUD, USD...). Numbers only, no symbols.
- English: IELTS overall and lowest band, TOEFL iBT, PTE, Duolingo, only if stated on this page.
- For every non-null field add a short exact quote from the page in "evidence" (key = field name, max 160 characters).
- If the page is not a single course (a list, a faculty page, news), return {"isCoursePage": false}.
Reply with JSON only.`;

const SCHEMA = `{
  "isCoursePage": true,
  "courseName": "MSc in Computing (Cybersecurity)",
  "degreeLevel": "Bachelor's | Master's | PhD | Diploma | Other",
  "studyMode": "Full-time | Part-time | Online | null",
  "duration": "1 year full-time | null",
  "intakes": ["September"] ,
  "annualFee": { "amount": 25000, "currency": "EUR" } ,
  "totalFee": { "amount": null, "currency": null },
  "applicationFee": { "amount": null, "currency": null, "isWaived": null },
  "initialDeposit": { "amount": null, "currency": null },
  "ielts": { "overall": 6.5, "minBand": 6.0 },
  "toefl": null, "pte": null, "duolingo": null,
  "academicRequirement": "2.1 honours degree in computing or related | null",
  "greRequired": null,
  "scholarshipAvailable": null,
  "applicationDeadline": null,
  "evidence": { "annualFee": "Non-EU: €25,000", "ielts": "IELTS 6.5 with no less than 6.0 in each band" }
}`;

/** Structured course facts from page markdown */
async function extractCourse(markdown, { url, universityName, country }) {
  const user = `University: ${universityName} (${country})\nPage: ${url}\n\nPage content (markdown):\n"""\n${markdown}\n"""\n\nReturn JSON in this shape:\n${SCHEMA}`;
  let reply;
  for (let attempt = 0; attempt < 3 && !reply; attempt += 1) {
    try {
      reply = await callLLM(
        [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }],
        { jsonMode: true, temperature: 0, maxTokens: 2000, preferredModel: 'openai/gpt-oss-120b' }
      );
    } catch (err) {
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 20000)); // free-tier rate limits reset within a minute
    }
  }
  const { content, modelUsed } = reply;
  const parsed = JSON.parse(cleanJsonResponse(content));
  return { ...parsed, modelUsed };
}

// Values the page didn't back up with a quote are dropped, so nothing unverified gets through
const VERIFIABLE = ['annualFee', 'totalFee', 'applicationFee', 'initialDeposit', 'ielts', 'toefl', 'pte', 'duolingo', 'duration', 'intakes', 'applicationDeadline'];
function keepEvidenced(course, markdown) {
  const text = markdown.toLowerCase().replace(/\s+/g, ' ');
  const out = { ...course, dropped: [] };
  for (const field of VERIFIABLE) {
    const value = course[field];
    const empty = value == null || (typeof value === 'object' && !Array.isArray(value) && Object.values(value).every((v) => v == null)) || (Array.isArray(value) && !value.length);
    if (empty) continue;
    const quote = String(course.evidence?.[field] || '').toLowerCase().replace(/\s+/g, ' ').trim();
    // The quote must really be on the page (first 40 chars is enough to catch invented quotes)
    if (!quote || !text.includes(quote.slice(0, 40))) {
      out[field] = null;
      out.dropped.push(field);
    }
  }
  return out;
}

/**
 * The university-wide English language requirement (IELTS etc.), read once from the page the course
 * pages link to. Returned with its source so it is shown as "university-wide", not course-specific.
 */
async function universityEnglish(links, universityName) {
  const url = links.find((u) => /english[-_]?language|english-requirements|language-requirements|registry\/english/i.test(u));
  if (!url) return null;
  const { markdown } = await readPage(url);
  const prompt = `From this ${universityName} page, give the minimum English requirement for POSTGRADUATE taught programmes. Use only what the page states, null if not stated. Include a short exact quote as "evidence".\nJSON: {"ielts":{"overall":6.5,"minBand":6.0},"toefl":90,"pte":63,"duolingo":null,"evidence":"..."}\n\nPage:\n"""\n${markdown.slice(0, 25000)}\n"""`;
  const { content } = await callLLM([{ role: 'user', content: prompt }], { jsonMode: true, temperature: 0, maxTokens: 600, preferredModel: 'openai/gpt-oss-120b' });
  const parsed = JSON.parse(cleanJsonResponse(content));
  const quote = String(parsed.evidence || '').toLowerCase().replace(/\s+/g, ' ').slice(0, 40);
  if (!quote || !markdown.toLowerCase().replace(/\s+/g, ' ').includes(quote)) return null;
  return { ...parsed, sourceUrl: url };
}

/**
 * Runs the agent for one university. Returns the courses found (nothing is saved here).
 */
async function runForUniversity(university, { search, limit = 5, onProgress = () => {} } = {}) {
  const site = university.website;
  if (!site) throw new Error(`${university.name} has no website in the database`);
  const urls = await discoverCourseUrls(site, { search, limit: limit * 3 });
  onProgress(`Found ${urls.length} possible course pages on ${new URL(site).hostname}`);

  const courses = [];
  const skipped = [];
  let english;
  for (const url of urls) {
    if (courses.length >= limit) break;
    try {
      const { markdown, links } = await readPage(url);
      if (english === undefined) {
        english = await universityEnglish(links, university.name).catch(() => null);
        if (english) onProgress(`English requirement page: ${english.sourceUrl}`);
      }
      if (markdown.length < 400) {
        skipped.push({ url, reason: 'page too short' });
        continue;
      }
      const raw = await extractCourse(markdown, { url, universityName: university.name, country: university.countryName || 'Ireland' });
      if (!raw.isCoursePage || !raw.courseName) {
        skipped.push({ url, reason: 'not a single course page' });
        continue;
      }
      const course = keepEvidenced(raw, markdown);
      // Course page silent on English → use the university-wide rule, marked as such
      if (!course.ielts && english?.ielts) {
        Object.assign(course, { ielts: english.ielts, toefl: course.toefl ?? english.toefl, pte: course.pte ?? english.pte, duolingo: course.duolingo ?? english.duolingo, englishSource: english.sourceUrl });
      }
      courses.push({ ...course, sourceUrl: url, checkedAt: new Date().toISOString() });
      onProgress(`✓ ${course.courseName}`);
    } catch (err) {
      skipped.push({ url, reason: err.message });
      onProgress(`✗ ${url}: ${err.message}`);
    }
  }
  return { university: university.name, website: site, courses, skipped };
}

module.exports = { discoverCourseUrls, readPage, extractCourse, keepEvidenced, runForUniversity };
