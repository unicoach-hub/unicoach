const mongoose = require('mongoose');
const University = require('../models/University');
const Country = require('../models/Country');
const { buildUniversitySearchFilter, findMatchedCourses, expandCourseSearchTerms } = require('../utils/courseSearchHelper');

function parseEligibilityText(eligibilityStr) {
  let reqGpa = 65;
  let reqIelts = 6.5;
  let reqGre = 0;
  let greReq = false;

  if (!eligibilityStr) return { reqGpa, reqIelts, reqGre, greReq };

  const str = eligibilityStr.toString();

  if (str.toLowerCase().includes('gre required') || str.toLowerCase().includes('gre 3')) {
    greReq = true;
    const greMatch = str.match(/gre\s*(\d{3})/i);
    reqGre = greMatch ? parseInt(greMatch[1], 10) : 310;
  }

  const gpaMatch = str.match(/gpa\s*(\d(?:\.\d+)?)/i) || str.match(/(\d(?:\.\d+)?)\+\s*gpa/i);
  if (gpaMatch) {
    const gpa = parseFloat(gpaMatch[1]);
    if (gpa >= 3.8) reqGpa = 90;
    else if (gpa >= 3.5) reqGpa = 82;
    else if (gpa >= 3.3) reqGpa = 78;
    else if (gpa >= 3.0) reqGpa = 72;
    else if (gpa >= 2.8) reqGpa = 68;
    else if (gpa >= 2.5) reqGpa = 60;
  } else {
    const pctMatch = str.match(/(\d{2})%/);
    if (pctMatch) reqGpa = parseInt(pctMatch[1], 10);
  }

  const ieltsMatch = str.match(/ielts\s*(\d(?:\.\d+)?)/i);
  if (ieltsMatch) {
    reqIelts = parseFloat(ieltsMatch[1]);
  }

  return { reqGpa, reqIelts, reqGre, greReq };
}

function isDisciplineCompatible(uni, streamMajor, searchTerm) {
  if (!uni || !uni.name) return false;
  const name = String(uni.name).toLowerCase();
  const major = String(streamMajor || 'All').toLowerCase();
  const query = String(searchTerm || '').toLowerCase();

  // If university explicitly lists this course, it is verified compatible
  if (Array.isArray(uni.courses) && uni.courses.length > 0) {
    const hasMajor = major !== 'all' && uni.courses.some(c => c.toLowerCase().includes(major) || major.includes(c.toLowerCase()));
    const hasSearch = query && uni.courses.some(c => c.toLowerCase().includes(query) || query.includes(c.toLowerCase()));
    if (hasMajor || hasSearch) return true;
  }

  // Exclude non-academic / trade / vocational / salon / single-purpose training institutes
  if (name.includes('career college') || name.includes('divers institute') || 
      name.includes('beauty') || name.includes('barber') || name.includes('massage') || 
      name.includes('welding') || name.includes('automotive') || name.includes('truck driving') || 
      name.includes('mortuary') || name.includes('funeral') || name.includes('embalming') ||
      name.includes('acupuncture') || name.includes('chiropractic') || 
      name.includes('podiatric') || name.includes('podiatry') || name.includes('gemological') || 
      name.includes('culinary') || name.includes('bible') || name.includes('esthetic') || 
      name.includes('cosmetology') || name.includes('aveda') ||
      name.includes('theological seminary') || name.includes('seminary') || 
      name.includes('dance academy') || name.includes('conservatory of music') || 
      name.includes('conservatory theater') || name.includes('school of music') || 
      name.includes('art academy') || name.includes('academy of art') || 
      name.includes('film institute') || name.includes('wellness') || name.includes('health and wellness')) {
    return false;
  }

  // If major is Tech / STEM / Computer Science / Engineering / Data Science / Business / Management
  const isTechOrBusiness = major.includes('comput') || major.includes('engin') || major.includes('data') || major.includes('tech') || major.includes('ai') || major.includes('business') || major.includes('mba') || major.includes('financ') || major.includes('econom') || major.includes('science');

  if (isTechOrBusiness) {
    // Exclude dedicated Law Schools
    if (name.includes('law school') || name.includes('school of law') || name.includes('college of law')) return false;
    // Exclude dedicated Medical / Health / Pharmacy / Nursing colleges
    if (name.includes('medical university') || name.includes('college of medicine') || name.includes('school of medicine') || name.includes('medical academy') || name.includes('nursing college') || name.includes('college of nursing') || name.includes('pharmacy') || name.includes('optometry') || name.includes('health sciences')) return false;
  }

  // If major is Law: exclude medical / pharmacy
  if (major.includes('law') || major.includes('legal')) {
    if (name.includes('medical') || name.includes('pharmacy') || name.includes('health sciences')) return false;
  }

  // If major is Medical / Nursing: exclude law
  if (major.includes('med') || major.includes('nurs') || major.includes('health')) {
    if (name.includes('law school') || name.includes('school of law')) return false;
  }

  return true;
}

function isSpecificCountry(targetCountry) {
  return Boolean(targetCountry) && typeof targetCountry === 'string' &&
    !['all', 'all destinations', 'all global destinations'].includes(targetCountry.trim().toLowerCase());
}

function matchesCountry(uni, targetCountry, countryMap) {
  const cleanCountry = String(targetCountry).trim().toLowerCase();
  const cId = uni.country ? uni.country.toString() : '';
  const cName = (countryMap[cId] || '').toLowerCase();
  if (!cName) return false;

  if (cleanCountry === 'usa' || cleanCountry.includes('united states') || cleanCountry === 'us' || cleanCountry.includes('america')) {
    return cName.includes('usa') || cName.includes('united states') || cName === 'us';
  }
  if (cleanCountry === 'uk' || cleanCountry.includes('united kingdom') || cleanCountry === 'gb' || cleanCountry.includes('england') || cleanCountry.includes('britain')) {
    return cName.includes('uk') || cName.includes('united kingdom') || cName.includes('england');
  }
  if (cleanCountry === 'uae' || cleanCountry.includes('emirates') || cleanCountry === 'dubai') {
    return cName.includes('uae') || cName.includes('united arab emirates');
  }
  if (cleanCountry === 'nz' || cleanCountry.includes('new zealand')) {
    return cName.includes('new zealand') || cName === 'nz';
  }
  return cName.includes(cleanCountry) || cleanCountry.includes(cName);
}

// The data mixes "Masters", "Master's", "Postgraduate", "Ph.D." etc. Collapse them to three levels.
const DEGREE_LEVELS = {
  bachelors: { label: "Bachelor's", match: ['bachelor', 'undergrad'] },
  masters: { label: "Master's", match: ['master', 'postgrad'] },
  phd: { label: 'PhD / Doctorate', match: ['phd', 'ph.d', 'doctor'] }
};

function getDegreeKeys(uni) {
  const levels = Array.isArray(uni.degreeLevels) && uni.degreeLevels.length > 0
    ? uni.degreeLevels
    : ["Bachelor's", "Master's"]; // same default the results show for records without levels
  const keys = new Set();
  for (const level of levels) {
    const l = String(level).toLowerCase();
    for (const [key, def] of Object.entries(DEGREE_LEVELS)) {
      if (def.match.some(m => l.includes(m))) keys.add(key);
    }
  }
  return keys;
}

// Broad study areas, matched against each university's course list
const STUDY_AREAS = {
  computing: { label: 'Computer Science & IT', pattern: /comput|software|information tech|informatic|cyber|network|web dev|database/i },
  data_ai: { label: 'Data Science & AI', pattern: /data|artificial intelligence|machine learning|analytic|\bai\b/i },
  business: { label: 'Business & Management', pattern: /business|\bmba\b|management|financ|accounting|marketing|econom|commerce/i },
  engineering: { label: 'Engineering', pattern: /engineer|mechatronic|robotic|aerospace|\bmeng\b/i },
  health: { label: 'Medicine & Health', pattern: /medic|nursing|health|pharma|midwif|dentist|clinical|physiother/i },
  law: { label: 'Law', pattern: /\blaw\b|\bllm\b|legal/i },
  science: { label: 'Natural Sciences & Maths', pattern: /biolog|chemi|physics|mathemat|environment|biotech|geolog/i },
  arts: { label: 'Arts, Humanities & Social Sciences', pattern: /psycholog|sociolog|histor|\bmedia\b|communication|design|\barts?\b|politic|international relations|linguist|literature|education/i }
};

function matchesStudyArea(uni, areaKey) {
  const area = STUDY_AREAS[areaKey];
  return Boolean(area) && Array.isArray(uni.courses) && uni.courses.some(c => area.pattern.test(String(c)));
}

const UNIVERSITY_TYPES = {
  public: 'Public',
  private: 'Private',
  technological: 'Technological University'
};

function getTypeKey(uni) {
  const t = String(uni.type || 'PUBLIC').toLowerCase();
  if (t.includes('technolog')) return 'technological';
  if (t.includes('private')) return 'private';
  return 'public';
}

// Official ranking only (imported from a ranking file, see University.rankingSource):
// unranked or unverified universities must not pass a "Top 100" filter
function getRealRank(uni) {
  return uni.rankingSource && uni.rankingNum > 0 ? uni.rankingNum : null;
}

function normalizeCity(city) {
  return String(city || '').trim().toLowerCase();
}

// Fee that matters for the student's target degree: graduate (Master's/PhD) tuition when an official
// source provided it, otherwise the general/undergraduate figure. 0 = unknown (never an assumed price).
const isUndergradTarget = (targetDegree) => /bachelor|undergrad|ug\b|diploma|foundation/i.test(String(targetDegree || ''));
function feeForDegree(uni, targetDegree) {
  if (!isUndergradTarget(targetDegree) && uni.graduateTuitionUSD > 0) return uni.graduateTuitionUSD;
  return Number(uni.tuitionFeeUSD) > 0 ? Number(uni.tuitionFeeUSD) : 0;
}

function parseAdvancedFilters(body = {}) {
  const city = typeof body.city === 'string' ? normalizeCity(body.city) : '';
  const degreeLevel = typeof body.degreeLevel === 'string' && DEGREE_LEVELS[body.degreeLevel] ? body.degreeLevel : '';
  const universityType = typeof body.universityType === 'string' && UNIVERSITY_TYPES[body.universityType] ? body.universityType : '';
  const studyArea = typeof body.studyArea === 'string' && STUDY_AREAS[body.studyArea] ? body.studyArea : '';
  const maxRank = Math.max(0, parseInt(body.maxRank, 10) || 0);
  const maxTuitionUSD = Math.max(0, parseInt(body.maxTuitionUSD, 10) || 0);
  return {
    city, degreeLevel, universityType, studyArea, maxRank, maxTuitionUSD,
    active: Boolean(city || degreeLevel || universityType || studyArea || maxRank || maxTuitionUSD)
  };
}

function matchesAdvancedFilters(uni, f) {
  if (f.city && normalizeCity(uni.city) !== f.city) return false;
  if (f.degreeLevel && !getDegreeKeys(uni).has(f.degreeLevel)) return false;
  if (f.universityType && getTypeKey(uni) !== f.universityType) return false;
  if (f.studyArea && !matchesStudyArea(uni, f.studyArea)) return false;
  if (f.maxRank) {
    const rank = getRealRank(uni);
    if (!rank || rank > f.maxRank) return false;
  }
  if (f.maxTuitionUSD && feeForDegree(uni, f.targetDegree) > f.maxTuitionUSD) return false;
  return true;
}

// High-Performance In-Memory University & Country Cache
let cachedUniversities = null;
let cachedCountryMap = null;
let cachedAllCountries = null;
let lastCacheTime = 0;
let pendingFetchPromise = null;
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 mins

async function getCachedData(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedUniversities && cachedCountryMap && (now - lastCacheTime < CACHE_TTL_MS)) {
    return { universities: cachedUniversities, countryMap: cachedCountryMap, allCountries: cachedAllCountries };
  }

  if (pendingFetchPromise) {
    return pendingFetchPromise;
  }

  pendingFetchPromise = (async () => {
    try {
      console.log('⚡ Loading and warming shortlist in-memory cache from MongoDB...');
      const allCountries = await Country.find({}).select('name code').lean();
      const countryMap = {};
      for (const c of allCountries) {
        countryMap[c._id.toString()] = c.name;
      }

      const universities = await University.find({ isActive: { $ne: false } })
        .select('name city logo website rank rankingNum rankingSource requirementsSource englishRequirement tuition tuitionFeeUSD graduateTuitionUSD dataSource minGpaPercent minIeltsScore minGreScore greRequired acceptanceRate type eligibility country courses degreeLevels description categoryTags')
        .lean();

      // Query Course collection to attach real rich course data (fees, intakes, durations)
      try {
        const Course = require('../models/Course');
        const allCourses = await Course.find({}).lean();
        const coursesByUni = {};
        for (const crs of allCourses) {
          if (crs.university) {
            const uId = crs.university.toString();
            if (!coursesByUni[uId]) coursesByUni[uId] = [];
            coursesByUni[uId].push(crs);
          }
        }
        for (const u of universities) {
          const uId = u._id.toString();
          u.detailedCourses = coursesByUni[uId] || [];
        }
      } catch (courseErr) {
        console.warn('Could not populate detailedCourses:', courseErr.message);
      }

      cachedUniversities = universities;
      cachedCountryMap = countryMap;
      cachedAllCountries = allCountries;
      lastCacheTime = Date.now();
      console.log(`✅ Shortlist in-memory cache ready! ${universities.length} universities cached in RAM.`);
      return { universities, countryMap, allCountries };
    } catch (err) {
      console.error('Error refreshing shortlist cache:', err);
      return {
        universities: cachedUniversities || [],
        countryMap: cachedCountryMap || {},
        allCountries: cachedAllCountries || []
      };
    } finally {
      pendingFetchPromise = null;
    }
  })();

  return pendingFetchPromise;
}

// Background pre-warm (not under Jest: unit tests mock the models and control the cache themselves)
if (process.env.NODE_ENV !== 'test') {
  setTimeout(() => {
    getCachedData().catch(() => {});
  }, 1000);
}

exports.clearShortlistCache = () => {
  cachedUniversities = null;
  cachedCountryMap = null;
  cachedAllCountries = null;
  lastCacheTime = 0;
};

/**
 * POST /api/shortlist
 * Comprehensive University Matching Endpoint with Pagination & Course Search
 */
exports.generateShortlist = async (req, res) => {
  try {
    const {
      gpaPercent = 75,
      ieltsScore = 6.5,
      greScore = 0,
      maxBudgetUSD = 40000,
      targetCountry = 'All',
      streamMajor = 'Computer Science',
      targetDegree = 'Master\'s',
      workExpYears = 1,
      category = 'all',
      search = '',
      page = 1,
      limit = 18
    } = req.body;

    const parsedGpa = parseFloat(gpaPercent) || 75;
    const parsedIelts = parseFloat(ieltsScore) || 6.5;
    const parsedGre = parseInt(greScore, 10) || 0;
    const parsedBudget = parseFloat(maxBudgetUSD) || 40000;
    const parsedWorkExp = parseInt(workExpYears, 10) || 0;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 18));

    // Instant In-Memory Data Pool (Cache Hit: < 2ms)
    const { universities: allCachedUnis, countryMap, allCountries } = await getCachedData();

    // In-Memory Country Filtering
    let filteredUnis = allCachedUnis;

    if (isSpecificCountry(targetCountry)) {
      filteredUnis = filteredUnis.filter(uni => matchesCountry(uni, targetCountry, countryMap));
    }

    // Advanced filters (all optional, each one backed by a real field in the data)
    const advanced = { ...parseAdvancedFilters(req.body), targetDegree };
    if (advanced.active) {
      filteredUnis = filteredUnis.filter(uni => matchesAdvancedFilters(uni, advanced));
    }

    // In-Memory Search Filtering (Courses, Name, City, Country, Tags)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      // Courses now carry official names ("Business Administration, Management and Operations"), so the query
      // is expanded with synonyms (MBA → business administration). Short terms (ai, cs, mba) must match a
      // whole word, otherwise "ai" would match "Retail" or "Maintenance".
      const terms = expandCourseSearchTerms(q).filter((t) => t.length >= 2);
      const termMatchers = terms.map((t) => (t.length <= 3
        ? ((text) => new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(text))
        : ((text) => text.includes(t))));
      const matchesAnyTerm = (text) => termMatchers.some((fn) => fn(text));
      filteredUnis = filteredUnis.filter(uni => {
        const name = (uni.name || '').toLowerCase();
        const city = (uni.city || '').toLowerCase();
        const cId = uni.country ? uni.country.toString() : '';
        const cName = (countryMap[cId] || '').toLowerCase();

        // Names and places match the literal query only (synonyms like "management" would match half the list)
        if (name.includes(q) || city.includes(q) || cName.includes(q)) return true;
        if (Array.isArray(uni.courses) && uni.courses.some(c => matchesAnyTerm(String(c).toLowerCase()))) return true;
        if (Array.isArray(uni.categoryTags) && uni.categoryTags.some(t => matchesAnyTerm(String(t).toLowerCase()))) return true;
        return false;
      });
    }

    const universities = filteredUnis;
    const scored = [];

    // Dynamic Multi-Dimensional Profile Evaluation
    for (let i = 0; i < universities.length; i++) {
      const uni = universities[i];

      // Discipline compatibility check with search override (a chosen study area replaces the profile major)
      if (!isDisciplineCompatible(uni, advanced.studyArea ? 'All' : streamMajor, search)) {
        continue;
      }

      const parsedText = parseEligibilityText(uni.eligibility);
      const uniNameLower = uni.name.toLowerCase();
      let rankNum = uni.rankingNum || (uni.rank ? parseInt(String(uni.rank).replace(/\D/g, '')) || 500 : 500);

      // Known top global universities check
      const isTopTierGlobal = uniNameLower.includes('institute of technology') ||
        uniNameLower.includes('stanford') || uniNameLower.includes('harvard') ||
        uniNameLower.includes('oxford') || uniNameLower.includes('cambridge') ||
        uniNameLower.includes('columbia') || uniNameLower.includes('toronto') ||
        uniNameLower.includes('yale') || uniNameLower.includes('imperial') ||
        uniNameLower.includes('eth zurich') || uniNameLower.includes('singapore') ||
        uniNameLower.includes('melbourne');

      let accRate = typeof uni.acceptanceRate === 'number' ? uni.acceptanceRate :
        (typeof uni.acceptanceRate === 'string' && uni.acceptanceRate.includes('%') ? parseInt(uni.acceptanceRate, 10) : 65);

      if (isTopTierGlobal) {
        rankNum = Math.min(rankNum, 40);
        accRate = Math.min(accRate, 15);
      }

      let reqGpa = Math.max(uni.minGpaPercent || 60, parsedText.reqGpa);
      let reqIelts = Math.max(uni.minIeltsScore || 6.5, parsedText.reqIelts);
      let reqGre = Math.max(uni.minGreScore || 0, parsedText.reqGre);
      let greReq = uni.greRequired || parsedText.greReq;

      // Dynamic adjustment based on global rankings
      if (rankNum <= 50 || accRate <= 15) {
        reqGpa = Math.max(reqGpa, 86);
        reqIelts = Math.max(reqIelts, 7.5);
        if (greReq) reqGre = Math.max(reqGre, 320);
      } else if (rankNum <= 150 || accRate <= 30) {
        reqGpa = Math.max(reqGpa, 78);
        reqIelts = Math.max(reqIelts, 7.0);
        if (greReq) reqGre = Math.max(reqGre, 310);
      } else if (rankNum <= 350 || accRate <= 50) {
        reqGpa = Math.max(reqGpa, 70);
        reqIelts = Math.max(reqIelts, 6.5);
      } else {
        reqGpa = Math.min(reqGpa, 62);
        reqIelts = Math.min(reqIelts, 6.0);
      }

      // Evaluation Scoring Algorithm
      let academicScore = 0;
      if (parsedGpa >= reqGpa + 10) academicScore = 40;
      else if (parsedGpa >= reqGpa + 4) academicScore = 35;
      else if (parsedGpa >= reqGpa) academicScore = 28;
      else if (parsedGpa >= reqGpa - 5) academicScore = 18;
      else academicScore = 8;

      // 2. IELTS Fit (30 pts)
      let ieltsPoints = 0;
      const isWaiverOrNotTaken = (ieltsScore === '0' || ieltsScore === 'Waiver' || !ieltsScore || parsedIelts === 0);
      if (isWaiverOrNotTaken) {
        ieltsPoints = 22; // Neutral baseline credit for MOI / Waiver
      } else if (parsedIelts >= reqIelts + 0.5) {
        ieltsPoints = 30;
      } else if (parsedIelts >= reqIelts) {
        ieltsPoints = 24;
      } else if (parsedIelts >= reqIelts - 0.5) {
        ieltsPoints = 14;
      } else {
        ieltsPoints = 5;
      }

      // 3. Budget Fit (20 pts)
      const feeUSD = feeForDegree(uni, targetDegree);
      let budgetPoints = 0;
      if (!feeUSD) budgetPoints = 12; // fee unknown: neutral, neither rewarded nor penalised
      else if (parsedBudget >= feeUSD) budgetPoints = 20;
      else if (parsedBudget >= feeUSD * 0.85) budgetPoints = 14;
      else if (parsedBudget >= feeUSD * 0.70) budgetPoints = 8;
      else budgetPoints = 2;

      // 4. Work Experience & GRE Fit (10 pts)
      let bonusPoints = 0;
      if (parsedWorkExp >= 2) bonusPoints += 5;
      else if (parsedWorkExp >= 1) bonusPoints += 3;
      else bonusPoints += 2;

      if (!greReq || reqGre === 0) bonusPoints += 5;
      else if (parsedGre >= reqGre) bonusPoints += 5;
      else bonusPoints += 1;

      const totalScore = academicScore + ieltsPoints + budgetPoints + bonusPoints;
      const matchScore = Math.min(99, Math.max(30, totalScore));

      // High-Precision Academic & Financial Categorization
      let category = 'target';
      const isAffordable = !feeUSD || parsedBudget >= feeUSD;

      // 1. Dream / Reach
      // Elite prestige (Top 120 QS), highly competitive admit (<= 25%),
      // or where student's academic profile is below requirement, or tuition is above budget
      if (
        rankNum <= 120 || 
        accRate <= 25 || 
        parsedGpa < reqGpa || 
        (feeUSD > 0 && !isAffordable && feeUSD > parsedBudget * 1.15)
      ) {
        category = 'dream';
      }
      // 2. Safe / Backup
      // High acceptance rate (>= 48%), student's GPA comfortably exceeds requirements (+4%),
      // tuition strictly within budget, ranked > 300, and strong match score
      else if (
        rankNum > 300 &&
        accRate >= 48 &&
        parsedGpa >= reqGpa + 4 &&
        isAffordable &&
        matchScore >= 75
      ) {
        category = 'safe';
      }
      // 3. Target / Ideal Match
      // Solid fit matching requirements well
      else {
        category = 'target';
      }

      const matchedCourses = findMatchedCourses(uni.courses || [], search);
      // What we show as fact: only official values. reqGpa/reqIelts above are estimates for the match score.
      const officialReqs = Boolean(uni.requirementsSource);
      const hasFee = uni.tuitionFeeUSD > 0 || uni.graduateTuitionUSD > 0;

      scored.push({
        _id: uni._id,
        name: uni.name,
        countryName: (uni.country ? countryMap[uni.country.toString()] : null) || (targetCountry !== 'All' ? targetCountry : 'International'),
        city: uni.city || '',
        logo: uni.logo || '',
        website: uni.website || '',
        // Official rank text (e.g. "=24", "601-610") only for rankings imported from an official file
        rank: uni.rankingSource && uni.rankingNum > 0 ? (uni.rank || String(uni.rankingNum)) : null,
        rankingNum: rankNum,
        rankingSource: uni.rankingSource || null,
        tuition: uni.tuition || (hasFee ? `$${feeUSD.toLocaleString()} / yr` : null),
        tuitionFeeUSD: hasFee ? feeUSD : null,
        graduateTuitionUSD: uni.graduateTuitionUSD || null,
        // fields = which values the sync took from the official source (absent for the US/AU syncs, which set fees too)
        dataSource: uni.dataSource ? { provider: uni.dataSource.provider, syncedAt: uni.dataSource.syncedAt, fields: uni.dataSource.fields || null } : null,
        minGpaPercent: officialReqs ? uni.minGpaPercent ?? null : null,
        minIeltsScore: officialReqs ? uni.minIeltsScore ?? null : null,
        minGreScore: officialReqs ? uni.minGreScore ?? null : null,
        greRequired: officialReqs ? uni.greRequired ?? null : null,
        requirementsSource: uni.requirementsSource || null,
        // University-wide minimum English requirement with its official source (independent of requirementsSource)
        englishRequirement: uni.englishRequirement && uni.englishRequirement.sourceUrl ? uni.englishRequirement : null,
        estimatedRequirements: { gpaPercent: reqGpa, ielts: reqIelts },
        // Official only (College Scorecard admission rate); other records hold a schema default
        acceptanceRate: uni.dataSource?.provider === 'College Scorecard' && typeof uni.acceptanceRate === 'number' ? uni.acceptanceRate : null,
        type: uni.type || 'PUBLIC',
        eligibility: officialReqs ? uni.eligibility || null : null,
        courses: Array.isArray(uni.courses) ? uni.courses : [],
        detailedCourses: uni.detailedCourses || [],
        degreeLevels: Array.isArray(uni.degreeLevels) ? uni.degreeLevels : [],
        description: uni.description || '',
        categoryTags: uni.categoryTags || [],
        matchedCourses,
        matchScore,
        categoryTag: category
      });
    }

    // Sort each tier by prestige & match fitness
    const sortList = (list) => {
      return list.sort((a, b) => {
        const aRank = a.rankingNum && a.rankingNum < 1500 ? a.rankingNum : 2500;
        const bRank = b.rankingNum && b.rankingNum < 1500 ? b.rankingNum : 2500;
        
        // Balanced composite: prestige + match score
        const aQuality = (3000 - aRank) * 0.45 + (a.matchScore || 50) * 0.55;
        const bQuality = (3000 - bRank) * 0.45 + (b.matchScore || 50) * 0.55;
        return bQuality - aQuality;
      });
    };

    const sortedDream = sortList(scored.filter(u => u.categoryTag === 'dream'));
    const sortedTarget = sortList(scored.filter(u => u.categoryTag === 'target'));
    const sortedSafe = sortList(scored.filter(u => u.categoryTag === 'safe'));

    // When the user requests a general shortlist (without a narrow search query),
    // deliver a premier curated shortlist (top 20 Safe, 20 Target, 20 Dream = 60 top universities)
    // instead of dumping thousands of raw uncurated records.
    // Filters only narrow the curated list (never widen it), so they keep the 20-per-tier cap
    const isSpecificSearch = search && search.trim().length > 1;
    const tierLimit = isSpecificSearch ? 80 : 20;

    const curatedDream = sortedDream.slice(0, tierLimit);
    const curatedTarget = sortedTarget.slice(0, tierLimit);
    const curatedSafe = sortedSafe.slice(0, tierLimit);

    const safeCount = curatedSafe.length;
    const targetCount = curatedTarget.length;
    const dreamCount = curatedDream.length;
    const totalCount = safeCount + targetCount + dreamCount;

    // Balanced set for 'all' tab: interleaved Target, Dream, Safe
    const allMixed = [];
    const maxLen = Math.max(curatedDream.length, curatedTarget.length, curatedSafe.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < curatedTarget.length) allMixed.push(curatedTarget[i]);
      if (i < curatedDream.length) allMixed.push(curatedDream[i]);
      if (i < curatedSafe.length) allMixed.push(curatedSafe[i]);
    }

    // Filter by active category tab if user switches tabs
    let resultsToPaginate = allMixed;
    const cleanCategory = String(category || 'all').toLowerCase();
    if (cleanCategory === 'safe') {
      resultsToPaginate = curatedSafe;
    } else if (cleanCategory === 'target') {
      resultsToPaginate = curatedTarget;
    } else if (cleanCategory === 'dream') {
      resultsToPaginate = curatedDream;
    }

    // Paginate
    const totalItems = resultsToPaginate.length;
    const totalPages = Math.ceil(totalItems / limitNum);
    const startIdx = (pageNum - 1) * limitNum;
    const paginatedResults = resultsToPaginate.slice(startIdx, startIdx + limitNum);

    return res.json({
      success: true,
      summary: {
        totalEvaluated: totalCount,
        safeCount,
        targetCount,
        dreamCount,
        databasePoolSize: scored.length
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
        hasMore: pageNum < totalPages
      },
      universities: paginatedResults
    });

  } catch (err) {
    console.error('Error in shortlist API:', err);
    return res.status(500).json({ error: 'Shortlist recommendation failed' });
  }
};

const filterOptionsMemo = new Map();

/**
 * GET /api/shortlist/filter-options?country=Ireland
 * Options for the advanced filters, computed from the universities we actually have,
 * so every option returns results (cities depend on the chosen country).
 */
exports.getFilterOptions = async (req, res) => {
  try {
    const country = typeof req.query.country === 'string' ? req.query.country.trim().slice(0, 60) : 'All';
    const { universities, countryMap } = await getCachedData();

    const memoKey = `${country.toLowerCase()}|${lastCacheTime}`;
    if (filterOptionsMemo.has(memoKey)) return res.json(filterOptionsMemo.get(memoKey));

    const specific = isSpecificCountry(country);
    const pool = specific ? universities.filter(uni => matchesCountry(uni, country, countryMap)) : universities;

    const cityCounts = new Map();
    const degreeCounts = { bachelors: 0, masters: 0, phd: 0 };
    const typeCounts = { public: 0, private: 0, technological: 0 };
    const areaCounts = Object.fromEntries(Object.keys(STUDY_AREAS).map(k => [k, 0]));
    const rankCounts = { 100: 0, 200: 0, 500: 0 };
    const fees = [];

    for (const uni of pool) {
      if (specific) {
        const city = String(uni.city || '').trim();
        const countryName = (countryMap[uni.country ? uni.country.toString() : ''] || '').toLowerCase();
        if (city && city.toLowerCase() !== countryName) {
          const key = normalizeCity(city);
          const entry = cityCounts.get(key) || { name: city, count: 0 };
          entry.count += 1;
          cityCounts.set(key, entry);
        }
      }
      for (const key of getDegreeKeys(uni)) degreeCounts[key] += 1;
      typeCounts[getTypeKey(uni)] += 1;
      for (const key of Object.keys(STUDY_AREAS)) {
        if (matchesStudyArea(uni, key)) areaCounts[key] += 1;
      }
      const rank = getRealRank(uni);
      if (rank) {
        if (rank <= 100) rankCounts[100] += 1;
        if (rank <= 200) rankCounts[200] += 1;
        if (rank <= 500) rankCounts[500] += 1;
      }
      if (Number(uni.tuitionFeeUSD) > 0) fees.push(Number(uni.tuitionFeeUSD)); // known fees only for the budget range
    }

    fees.sort((a, b) => a - b);
    const byCountThenName = (a, b) => b.count - a.count || a.name.localeCompare(b.name);

    // Destinations we actually have universities for (names match the frontend country values)
    const countryCounts = new Map();
    for (const uni of universities) {
      const name = countryMap[uni.country ? uni.country.toString() : ''];
      if (name) countryCounts.set(name, (countryCounts.get(name) || 0) + 1);
    }

    const payload = {
      success: true,
      country: specific ? country : 'All',
      totalUniversities: pool.length,
      countries: [...countryCounts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort(byCountThenName),
      cities: [...cityCounts.values()].sort(byCountThenName),
      degreeLevels: Object.entries(DEGREE_LEVELS)
        .map(([value, def]) => ({ value, label: def.label, count: degreeCounts[value] }))
        .filter(o => o.count > 0),
      universityTypes: Object.entries(UNIVERSITY_TYPES)
        .map(([value, label]) => ({ value, label, count: typeCounts[value] }))
        .filter(o => o.count > 0),
      studyAreas: Object.entries(STUDY_AREAS)
        .map(([value, def]) => ({ value, label: def.label, count: areaCounts[value] }))
        .filter(o => o.count > 0),
      rankings: [100, 200, 500]
        .map(value => ({ value, label: `Top ${value}`, count: rankCounts[value] }))
        .filter(o => o.count > 0),
      tuition: fees.length
        ? { min: fees[0], max: fees[fees.length - 1], median: fees[Math.floor(fees.length / 2)] }
        : null
    };

    if (filterOptionsMemo.size > 50) filterOptionsMemo.clear();
    filterOptionsMemo.set(memoKey, payload);
    return res.json(payload);
  } catch (err) {
    console.error('Error building shortlist filter options:', err);
    return res.status(500).json({ error: 'Could not load filter options' });
  }
};

const PROFILE_TEXT_FIELDS = ['educationLevel', 'streamMajor', 'targetCountry', 'targetDegree', 'ieltsScore', 'intake', 'workExpYears'];

function sanitizeShortlistProfile(body = {}) {
  const profile = {};
  for (const field of PROFILE_TEXT_FIELDS) {
    if (body[field] !== undefined && body[field] !== null) {
      profile[field] = String(body[field]).trim().slice(0, 120);
    }
  }
  const clamp = (value, min, max) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : undefined;
  };
  const gpa = clamp(body.gpaPercent, 0, 100);
  const budget = clamp(body.maxBudgetUSD, 0, 500000);
  const gre = clamp(body.greScore, 0, 340);
  if (gpa !== undefined) profile.gpaPercent = gpa;
  if (budget !== undefined) profile.maxBudgetUSD = budget;
  if (gre !== undefined) profile.greScore = gre;
  return profile;
}

/** GET /api/shortlist/profile - the signed-in student's saved shortlist inputs (or null) */
exports.getMyShortlistProfile = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('shortlistProfile').lean();
    const profile = user && user.shortlistProfile && user.shortlistProfile.updatedAt ? user.shortlistProfile : null;
    return res.json({ success: true, profile });
  } catch (err) {
    console.error('Error loading shortlist profile:', err);
    return res.status(500).json({ error: 'Could not load your profile' });
  }
};

/** PUT /api/shortlist/profile - save the step-1 inputs; also keeps the student's dream country/course in sync */
exports.saveMyShortlistProfile = async (req, res) => {
  try {
    const User = require('../models/User');
    const profile = sanitizeShortlistProfile(req.body);
    if (!profile.streamMajor || !profile.targetCountry) {
      return res.status(400).json({ error: 'Field of study and target destination are required' });
    }
    profile.updatedAt = new Date();

    const update = {
      shortlistProfile: profile,
      dreamCourse: profile.streamMajor,
      dreamCountry: profile.targetCountry
    };
    if (profile.educationLevel) update.highestEducation = profile.educationLevel;
    if (profile.intake) update.preferredIntake = profile.intake;

    const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true }).select('shortlistProfile').lean();
    if (!user) return res.status(404).json({ error: 'Account not found' });
    return res.json({ success: true, profile: user.shortlistProfile });
  } catch (err) {
    console.error('Error saving shortlist profile:', err);
    return res.status(500).json({ error: 'Could not save your profile' });
  }
};
