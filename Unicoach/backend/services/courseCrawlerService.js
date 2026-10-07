const cheerio = require('cheerio');
const crypto = require('crypto');
const Course = require('../models/Course');
const University = require('../models/University');
const Country = require('../models/Country');
const { clearShortlistCache } = require('../utils/cache');

// Standard live INR exchange rates
const FX_RATES_TO_INR = {
  EUR: 94.0,
  USD: 87.0,
  GBP: 112.5,
  AUD: 57.0,
  CAD: 63.5,
  NZD: 52.0,
  SGD: 66.0,
  CHF: 98.0,
  INR: 1.0
};

/**
 * Fetch and extract readable clean text from a web page
 */
async function fetchCleanPageText(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 UniCoachBot/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText} for URL: ${url}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove noise elements
  $('script, style, noscript, nav, footer, iframe, svg, header, form, .cookie-banner, .advertisement').remove();

  const title = $('title').text().trim() || $('h1').first().text().trim();
  const metaDesc = $('meta[name="description"]').attr('content') || '';

  // Extract text from main article or body
  let mainContent = $('main').text().trim() || $('article').text().trim() || $('#content').text().trim() || $('body').text().trim();

  // Condense excessive whitespaces
  mainContent = mainContent.replace(/\s+/g, ' ').slice(0, 10000);

  const contentHash = crypto.createHash('sha256').update(mainContent).digest('hex');

  return {
    title,
    metaDesc,
    rawText: mainContent,
    contentHash
  };
}

/**
 * Discover individual course links from a university course catalog / A-Z page
 */
async function discoverCourseUrlsFromCatalog(catalogUrl) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  const response = await fetch(catalogUrl, {
    signal: controller.signal,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Failed to fetch catalog: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const discovered = new Map();

  $('a[href]').each((_, el) => {
    const rawHref = $(el).attr('href');
    const linkText = $(el).text().trim();

    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:')) {
      return;
    }

    try {
      const absoluteUrl = new URL(rawHref, catalogUrl).href;
      const lowerUrl = absoluteUrl.toLowerCase();
      const lowerText = linkText.toLowerCase();

      const parsedUrl = new URL(absoluteUrl);
      const pathname = parsedUrl.pathname.replace(/\/+$/, ''); // Strip trailing slash for comparison
      const segments = pathname.split('/').filter(Boolean);

      // Must have at least 3 path segments (e.g. /courses/postgraduate/courses/accounting-...)
      if (segments.length < 3) {
        return;
      }

      // Check if URL indicates a specific degree/course
      const isCourseLink = (
        lowerUrl.includes('/courses/postgraduate/courses/') ||
        lowerUrl.includes('/courses/undergraduate/courses/') ||
        lowerUrl.includes('/postgraduate/taught/') ||
        lowerUrl.includes('/programmes/') ||
        lowerUrl.includes('/degrees/') ||
        lowerUrl.includes('/course/') ||
        lowerUrl.includes('/program/')
      );

      // Section hubs to strictly ignore
      const isSectionHub = (
        pathname.endsWith('/postgraduate') ||
        pathname.endsWith('/undergraduate') ||
        pathname.endsWith('/courses') ||
        pathname.endsWith('/fees') ||
        pathname.endsWith('/microcredentials') ||
        pathname.endsWith('/short-courses') ||
        pathname.endsWith('/hci-cpd') ||
        pathname.endsWith('/how-to-apply') ||
        pathname.endsWith('/apply') ||
        pathname.endsWith('/contact') ||
        pathname.endsWith('/scholarships') ||
        lowerText.length < 4 ||
        lowerText.includes('view all') ||
        lowerText.includes('read more') ||
        lowerText.includes('apply now')
      );

      if (isCourseLink && !isSectionHub && !discovered.has(absoluteUrl)) {
        discovered.set(absoluteUrl, {
          title: linkText || 'Degree Course',
          url: absoluteUrl
        });
      }
    } catch {
      // Ignore invalid URLs
    }
  });

  return Array.from(discovered.values());
}

/**
 * Call Groq LLM (gpt-oss-120b or qwen3.8-27b) to parse raw course HTML text into structured JSON
 */
async function extractCourseDataWithAI(pageText, pageUrl, universityContext = {}) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    throw new Error('GROQ_API_KEY is not configured in backend/.env');
  }

  const systemPrompt = `You are UniCoach's expert Academic Scraper & Admission Analyst.
Extract official university course details from the provided webpage text into strict JSON format.

Always follow these rules:
1. Extract the full official degree name (e.g. "MSc in Computer Science - Data Science", "Master of Business Administration (MBA)").
2. degreeLevel must be one of: ["Bachelor's", "Master's", "PhD", "Diploma", "Other"].
3. Extract annual tuition fee for International / Non-EU students if distinct from domestic/EU fee.
4. If currency is not explicitly USD/GBP/CAD/AUD/INR, deduce from the university country (e.g. Ireland/Germany/France = EUR, UK = GBP, USA = USD, Canada = CAD, Australia = AUD).
5. Extract exact English requirement (IELTS overall and minimum band requirements, TOEFL, PTE).
6. Extract application deadlines, intakes (e.g. ["September 2026", "January 2027"]), STEM eligibility (isStem: true/false), internship presence (hasInternship: true/false).
7. If scholarships are mentioned on the page, extract their name and amount/discount.
8. Output ONLY valid JSON matching the schema with NO markdown code fences or conversational text.`;

  const userPrompt = `
University Context:
- Name: ${universityContext.name || 'University'}
- Country: ${universityContext.countryName || 'Europe/Worldwide'}
- Course Webpage URL: ${pageUrl}

Page Text Snippet:
"""
${pageText.slice(0, 3600)}
"""

Extract to this exact JSON schema:
{
  "courseName": "Full degree name",
  "courseCode": "Course code if available, otherwise null",
  "degreeLevel": "Bachelor's" | "Master's" | "PhD" | "Diploma" | "Other",
  "discipline": "e.g. Computer Science, Finance, Mechanical Engineering, Healthcare",
  "faculty": "e.g. School of Computer Science and Statistics",
  "duration": "e.g. 1 Year Full-Time or 2 Years Part-Time",
  "annualFee": {
    "amount": 25000,
    "currency": "EUR"
  },
  "applicationFee": {
    "amount": 55,
    "currency": "EUR",
    "isWaived": false
  },
  "initialDeposit": {
    "amount": 500,
    "currency": "EUR"
  },
  "minIeltsScore": 6.5,
  "ieltsRequirement": "6.5 overall (no individual band below 6.0)",
  "minToeflScore": 88,
  "minPteScore": 63,
  "minGpaPercent": 60,
  "academicRequirement": "Minimum 2.1 Honours degree (60%+) or equivalent in related subject",
  "greRequired": false,
  "workExpRequirement": "Freshers Eligible" | "2+ Years Recommended",
  "intakes": ["September 2026"],
  "applicationDeadline": "30 June 2026",
  "isStem": true,
  "hasInternship": false,
  "scholarships": [
    {
      "name": "Global Excellence Postgraduate Scholarship",
      "discount": "Up to €5,000",
      "criteria": "Academic merit"
    }
  ]
}
`;

  // Try primary model (openai/gpt-oss-120b) and fallback to (qwen/qwen3.8-27b) with auto-retry
  const candidateModels = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
  let rawJson = null;

  for (const model of candidateModels) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });

      if (response.status === 429) {
        // Rate limit hit on this model, wait 2s and try next candidate model
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`Groq ${model} failed with ${response.status}: ${errorBody}`);
        continue;
      }

      const data = await response.json();
      rawJson = data.choices?.[0]?.message?.content;
      if (rawJson) break;
    } catch (err) {
      console.warn(`Error calling model ${model}:`, err.message);
    }
  }

  if (!rawJson) {
    throw new Error('All AI extraction models exhausted or rate-limited. Please retry shortly.');
  }

  const parsed = JSON.parse(rawJson);

  // Calculate INR equivalent for annual tuition fee
  const feeCurrency = (parsed.annualFee?.currency || 'EUR').toUpperCase();
  const feeAmount = Number(parsed.annualFee?.amount) || 0;
  const rate = FX_RATES_TO_INR[feeCurrency] || 90.0;
  const inrAmount = Math.round(feeAmount * rate);

  parsed.annualFee = {
    amount: feeAmount,
    currency: feeCurrency,
    inrAmount
  };

  return parsed;
}

/**
 * Crawl, parse with AI, and upsert a single course into MongoDB
 */
async function syncSingleCourseFromUrl(courseUrl, universityId) {
  // Validate university
  const university = await University.findById(universityId).populate('country');
  if (!university) {
    throw new Error(`University with ID ${universityId} not found`);
  }

  const countryName = university.country?.name || 'Worldwide';

  // 1. Fetch & Clean HTML
  const { rawText, contentHash } = await fetchCleanPageText(courseUrl);

  // 2. Extract Structured Data via Groq AI
  const extracted = await extractCourseDataWithAI(rawText, courseUrl, {
    name: university.name,
    countryName: countryName,
    city: university.city
  });

  // Intelligent Fee Fallback if page fee was 0 (e.g. university links to centralized fee schedule)
  let finalFeeAmount = Number(extracted.annualFee?.amount) || 0;
  let finalCurrency = (extracted.annualFee?.currency || 'EUR').toUpperCase();

  if (finalFeeAmount <= 0 && university.tuitionFeeUSD && university.tuitionFeeUSD > 0) {
    const baseUSD = university.tuitionFeeUSD;
    if (finalCurrency === 'EUR') finalFeeAmount = Math.round(baseUSD * (87 / 94));
    else if (finalCurrency === 'GBP') finalFeeAmount = Math.round(baseUSD * (87 / 112.5));
    else if (finalCurrency === 'CAD') finalFeeAmount = Math.round(baseUSD * (87 / 63.5));
    else if (finalCurrency === 'AUD') finalFeeAmount = Math.round(baseUSD * (87 / 57.0));
    else finalFeeAmount = baseUSD;
  }

  const finalRate = FX_RATES_TO_INR[finalCurrency] || 90.0;
  const finalInrAmount = Math.round(finalFeeAmount * finalRate);

  const annualFeePayload = {
    amount: finalFeeAmount,
    currency: finalCurrency,
    inrAmount: finalInrAmount
  };

  // 3. Upsert into Course Collection
  const updatePayload = {
    courseName: extracted.courseName || 'Postgraduate Degree',
    courseCode: extracted.courseCode || undefined,
    university: university._id,
    universityName: university.name,
    country: university.country?._id || university.country,
    countryName: countryName,
    city: university.city || '',
    degreeLevel: extracted.degreeLevel || "Master's",
    discipline: extracted.discipline || 'General',
    faculty: extracted.faculty || '',
    duration: extracted.duration || '1 Year',
    annualFee: annualFeePayload,
    applicationFee: extracted.applicationFee,
    initialDeposit: extracted.initialDeposit,
    minIeltsScore: extracted.minIeltsScore || 6.5,
    ieltsRequirement: extracted.ieltsRequirement || '6.5 (min 6.0 in each component)',
    minToeflScore: extracted.minToeflScore || 88,
    minPteScore: extracted.minPteScore || 63,
    minGpaPercent: extracted.minGpaPercent || 60,
    academicRequirement: extracted.academicRequirement || '',
    greRequired: Boolean(extracted.greRequired),
    workExpRequirement: extracted.workExpRequirement || 'Freshers Eligible',
    intakes: Array.isArray(extracted.intakes) && extracted.intakes.length > 0 ? extracted.intakes : ['September 2026'],
    applicationDeadline: extracted.applicationDeadline || 'Rolling Admission',
    isStem: Boolean(extracted.isStem),
    hasInternship: Boolean(extracted.hasInternship),
    scholarships: Array.isArray(extracted.scholarships) ? extracted.scholarships : [],
    sourceUrl: courseUrl,
    contentHash: contentHash,
    lastVerifiedAt: new Date(),
    syncStatus: 'ACTIVE'
  };

  const courseDoc = await Course.findOneAndUpdate(
    { sourceUrl: courseUrl },
    { $set: updatePayload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // 4. Update Parent University courses array & min criteria if beneficial
  if (courseDoc.courseName) {
    await University.findByIdAndUpdate(university._id, {
      $addToSet: { courses: courseDoc.courseName }
    });
  }

  // 5. Invalidate Shortlist & Search Cache so changes immediately show
  clearShortlistCache();

  return courseDoc;
}

/**
 * Discover courses from catalog and sync up to batchLimit items
 */
async function syncCoursesFromCatalog(catalogUrl, universityId, batchLimit = 5) {
  const discovered = await discoverCourseUrlsFromCatalog(catalogUrl);
  const targets = discovered.slice(0, batchLimit);

  const results = {
    totalDiscovered: discovered.length,
    attempted: targets.length,
    successful: [],
    failed: []
  };

  for (const item of targets) {
    try {
      const courseDoc = await syncSingleCourseFromUrl(item.url, universityId);
      results.successful.push({
        id: courseDoc._id,
        courseName: courseDoc.courseName,
        annualFee: courseDoc.annualFee,
        sourceUrl: item.url
      });
      // Short 1-second pause to be a polite crawler
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`Failed to sync course from ${item.url}:`, err.message);
      results.failed.push({
        url: item.url,
        error: err.message
      });
    }
  }

  return results;
}

module.exports = {
  fetchCleanPageText,
  discoverCourseUrlsFromCatalog,
  extractCourseDataWithAI,
  syncSingleCourseFromUrl,
  syncCoursesFromCatalog
};
