/**
 * CourseFinder Engine & Program Resolver
 * Transforms generic Universities into granular, program-first course listings
 * inspired by CourseFinder.ai (Program Level, Duration, Tuition/yr, App Fee, Avg Scholarship, Initial Deposit).
 */
import { getDataSourceLabel, hasOfficialFee } from './dataSourceLabel';

const COUNTRY_META = {
  uk: { code: 'gb', name: 'United Kingdom', flagUrl: 'https://flagcdn.com/w40/gb.png', flag: '🇬🇧', currency: 'GBP', symbol: '£', rateFromUSD: 0.79, majorCities: ['london', 'birmingham', 'manchester', 'edinburgh', 'glasgow', 'leeds', 'bristol', 'sheffield', 'coventry'] },
  usa: { code: 'us', name: 'United States', flagUrl: 'https://flagcdn.com/w40/us.png', flag: '🇺🇸', currency: 'USD', symbol: '$', rateFromUSD: 1.0, majorCities: ['new york', 'boston', 'los angeles', 'chicago', 'san francisco', 'seattle', 'atlanta', 'philadelphia'] },
  canada: { code: 'ca', name: 'Canada', flagUrl: 'https://flagcdn.com/w40/ca.png', flag: '🇨🇦', currency: 'CAD', symbol: 'C$', rateFromUSD: 1.36, majorCities: ['toronto', 'vancouver', 'montreal', 'ottawa', 'calgary', 'edmonton'] },
  germany: { code: 'de', name: 'Germany', flagUrl: 'https://flagcdn.com/w40/de.png', flag: '🇩🇪', currency: 'EUR', symbol: '€', rateFromUSD: 0.92, majorCities: ['berlin', 'munich', 'frankfurt', 'hamburg', 'stuttgart', 'cologne'] },
  australia: { code: 'au', name: 'Australia', flagUrl: 'https://flagcdn.com/w40/au.png', flag: '🇦🇺', currency: 'AUD', symbol: 'A$', rateFromUSD: 1.52, majorCities: ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide'] },
  ireland: { code: 'ie', name: 'Ireland', flagUrl: 'https://flagcdn.com/w40/ie.png', flag: '🇮🇪', currency: 'EUR', symbol: '€', rateFromUSD: 0.92, majorCities: ['dublin', 'cork', 'galway', 'limerick'] },
  france: { code: 'fr', name: 'France', flagUrl: 'https://flagcdn.com/w40/fr.png', flag: '🇫🇷', currency: 'EUR', symbol: '€', rateFromUSD: 0.92, majorCities: ['paris', 'lyon', 'marseille', 'toulouse', 'nice'] },
  italy: { code: 'it', name: 'Italy', flagUrl: 'https://flagcdn.com/w40/it.png', flag: '🇮🇹', currency: 'EUR', symbol: '€', rateFromUSD: 0.92, majorCities: ['rome', 'milan', 'florence', 'turin', 'bologna'] },
  'new-zealand': { code: 'nz', name: 'New Zealand', flagUrl: 'https://flagcdn.com/w40/nz.png', flag: '🇳🇿', currency: 'NZD', symbol: 'NZ$', rateFromUSD: 1.65, majorCities: ['auckland', 'wellington', 'christchurch'] },
  singapore: { code: 'sg', name: 'Singapore', flagUrl: 'https://flagcdn.com/w40/sg.png', flag: '🇸🇬', currency: 'SGD', symbol: 'S$', rateFromUSD: 1.34, majorCities: ['singapore'] }
};

export const getCountryMeta = (countryCodeOrName = '') => {
  // Some pages pass the populated country document ({ _id, name, code }) straight from the API
  const value = countryCodeOrName && typeof countryCodeOrName === 'object'
    ? (countryCodeOrName.name || countryCodeOrName.code || '')
    : countryCodeOrName;
  const norm = String(value).toLowerCase().trim();
  if (norm.includes('uk') || norm.includes('united kingdom') || norm.includes('england') || norm.includes('scotland')) return COUNTRY_META.uk;
  if (norm.includes('usa') || norm.includes('united states') || norm.includes('america')) return COUNTRY_META.usa;
  if (norm.includes('canada')) return COUNTRY_META.canada;
  if (norm.includes('germany') || norm.includes('deutschland')) return COUNTRY_META.germany;
  if (norm.includes('australia')) return COUNTRY_META.australia;
  if (norm.includes('ireland')) return COUNTRY_META.ireland;
  if (norm.includes('france')) return COUNTRY_META.france;
  if (norm.includes('italy')) return COUNTRY_META.italy;
  if (norm.includes('zealand')) return COUNTRY_META['new-zealand'];
  if (norm.includes('singapore')) return COUNTRY_META.singapore;
  return { code: 'un', name: value || 'International', flagUrl: null, flag: '🌐', currency: 'USD', symbol: '$', rateFromUSD: 1.0, majorCities: [] };
};

/**
 * Generates rich University Badges
 */
export const getUniversityBadges = (uni) => {
  const badges = [];
  const cMeta = getCountryMeta(uni.countryName || uni.country);
  const city = String(uni.city || '').toLowerCase().trim();
  const accRate = typeof uni.acceptanceRate === 'number' ? uni.acceptanceRate : parseInt(String(uni.acceptanceRate || '50').replace(/\D/g, '')) || 50;

  // Only facts we actually hold. (Earlier badges like "Co-op & Built-in Internships", "Scholarship Available",
  // "Faster Offer TAT" and "Uni has own English Test" were shown without any data behind them.)
  const provider = uni.dataSource && uni.dataSource.provider;

  if (provider) {
    badges.push({
      label: getDataSourceLabel(provider),
      type: 'source',
      color: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    });
  }

  // Acceptance rate only when it comes from an official source (other records hold a default value)
  if (provider === 'College Scorecard' && typeof uni.acceptanceRate === 'number') {
    badges.push({ label: `Acceptance rate ${accRate}%`, type: 'rate', color: 'bg-slate-100 text-slate-700' });
  }

  if (uni.type) {
    const t = String(uni.type).toUpperCase();
    badges.push({ label: t.includes('PRIVATE') ? 'Private' : t.includes('TECH') ? 'Technological University' : 'Public', type: 'type', color: 'bg-slate-100 text-slate-700' });
  }

  if (cMeta.majorCities.some(mc => city.includes(mc))) {
    badges.push({ label: 'Major City', type: 'location', color: 'bg-slate-100 text-slate-700' });
  }

  // Ranking only when imported from an official ranking file (other records hold placeholder values)

  return badges;
};

/**
 * Generate course-specific program rows under a university
 */
export const generateUniversityPrograms = (uni, options = {}) => {
  const { searchQuery = '', programLevel = 'all' } = options;
  const cMeta = getCountryMeta(uni.countryName || uni.country);

  // ── PRIORITY 1: REAL GRANULAR COURSES FROM MONGODB COURSE COLLECTION ──
  // Only values the course record actually has are shown; nothing is filled in with guesses.
  if (Array.isArray(uni.detailedCourses) && uni.detailedCourses.length > 0) {
    const qLower = searchQuery.toLowerCase().trim();
    let list = uni.detailedCourses;
    if (qLower) {
      const filtered = list.filter(c => (c.courseName || c.title || '').toLowerCase().includes(qLower));
      if (filtered.length > 0) list = filtered;
    }

    return list.map((c, idx) => {
      const durationText = c.duration || 'Varies by program';
      const durationMonths = parseInt(String(c.duration || '').replace(/\D/g, ''), 10) || null;
      const cur = c.annualFee?.currency || cMeta.currency || 'USD';
      const feeAmt = c.annualFee?.amount || 0;
      const appFeeAmt = c.applicationFee?.amount || 0;
      const appFeeCur = c.applicationFee?.currency || cur;
      const applicationFee = c.applicationFee?.isWaived
        ? 'No Application Fee'
        : appFeeAmt > 0 ? `${appFeeCur} ${appFeeAmt.toLocaleString()}` : null;

      const rawIntakes = Array.isArray(c.intakes)
        ? c.intakes.map(i => typeof i === 'string' ? i : i.term).filter(Boolean)
        : [];
      const cleanIntakes = rawIntakes.filter(x => x.toLowerCase() !== 'open');

      return {
        id: c._id || `${uni._id || uni.name}-real-${idx}`,
        title: c.courseName || c.title,
        degreeLevel: c.degreeLevel || null,
        status: c.status || null,
        intake: cleanIntakes.length ? cleanIntakes.join(' / ') : 'Intakes: check official site',
        intakesList: cleanIntakes,
        intakeYear: null,
        durationMonths,
        durationText,
        tuitionPerYear: feeAmt > 0 ? `${cur} ${feeAmt.toLocaleString()}` : 'See official site',
        tuitionNumber: feeAmt,
        currency: cur,
        inrAmount: c.annualFee?.inrAmount,
        applicationFee,
        avgScholarship: null,
        initialDeposit: null,
        isStem: Boolean(c.isStem),
        minIeltsScore: c.minIeltsScore,
        sourceLabel: 'From the university course page',
        officialUrl: c.courseUrl || c.sourceUrl || uni.website || null,
        isRealData: true
      };
    });
  }

  // ── PRIORITY 2: CHECK IF uni.courses HAS FULL ACCURATE TITLES (LIKE OTHM DIPLOMAS) ──
  const uniCourses = Array.isArray(uni.courses) && uni.courses.length > 0 ? uni.courses : [];
  const isSingapore = String(uni.countryName || uni.country || '').toLowerCase().includes('singapore') || String(uni.name || '').toLowerCase().includes('american center');

  if (isSingapore && uniCourses.length > 0) {
    return uniCourses.map((cName, idx) => {
      const is8Month = idx === 0 || cName.toLowerCase().includes('e-learning');
      const durationText = is8Month ? '8 months' : '12 months';
      const feeAmount = is8Month ? 10800 : 15600;
      return {
        id: `${uni._id || uni.name}-sg-${idx}`,
        title: cName,
        degreeLevel: 'PG',
        status: 'Open',
        intake: 'Mar / May / Jul / Sep / Nov',
        intakesList: ['Mar', 'May', 'Jul', 'Sep', 'Nov'],
        intakeYear: '2026/27',
        durationMonths: is8Month ? 8 : 12,
        durationText,
        tuitionPerYear: `SGD ${feeAmount.toLocaleString()}`,
        tuitionNumber: feeAmount,
        currency: 'SGD',
        applicationFee: 'SGD 109',
        avgScholarship: null,
        initialDeposit: null,
        isStem: false,
        isRealData: true
      };
    });
  }

  // ── PRIORITY 3: COURSE LIST OF THE UNIVERSITY ──
  // One entry per course the university offers. Only real values are shown: the official yearly fee when an
  // official source provided it (see hasOfficialFee), otherwise a clearly marked estimate.
  // Intakes, durations, application fees, scholarships and deposits are NOT invented; students are sent to
  // the official website for them.
  const provider = uni.dataSource && uni.dataSource.provider;
  const hasOfficialData = hasOfficialFee(uni.dataSource);
  const sourceLabel = getDataSourceLabel(provider, { long: true }) || 'Estimate, verify on official site';
  const feeUSD = Number(uni.tuitionFeeUSD) || 0;
  const gradUSD = Number(uni.graduateTuitionUSD) || 0;
  const usd = (n) => `USD ${Math.round(n).toLocaleString()}`;
  let tuitionPerYear = 'See official site';
  if (hasOfficialData && gradUSD && feeUSD && gradUSD !== feeUSD) {
    // Database record: undergraduate in tuitionFeeUSD, Master's in graduateTuitionUSD
    tuitionPerYear = `Master's ${usd(gradUSD)} · Bachelor's ${usd(feeUSD)}`;
  } else if (hasOfficialData && gradUSD) {
    // Shortlist response for a Master's student: tuitionFeeUSD already is the Master's fee
    tuitionPerYear = `${usd(gradUSD)} (Master's)`;
  } else if (feeUSD > 0) {
    tuitionPerYear = hasOfficialData ? usd(feeUSD) : `≈ ${usd(feeUSD)}`;
  }

  const q = searchQuery.toLowerCase().trim();
  // Common short searches → words used in official course names
  const QUERY_SYNONYMS = {
    ai: ['artificial intelligence', 'machine learning', 'computer and information sciences'],
    ml: ['machine learning', 'artificial intelligence'],
    cs: ['computer science', 'computer and information sciences'],
    it: ['information technology', 'information systems'],
    ds: ['data science', 'data analytics'],
    mba: ['business administration', 'master of business'],
    bba: ['business administration'],
  };
  const matchesQuery = (name) => {
    const n = String(name).toLowerCase();
    if (QUERY_SYNONYMS[q] && QUERY_SYNONYMS[q].some((alias) => n.includes(alias))) return true;
    // Short queries (ai, cs, mba) must match a whole word, otherwise "ai" would match "Retail"
    if (q.length <= 3) return new RegExp(`(^|[^a-z0-9])${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`).test(n);
    return n.includes(q) || q.split(/\s+/).every((w) => n.includes(w));
  };
  let subjects = uniCourses;
  if (q && subjects.length) {
    const filtered = subjects.filter(matchesQuery);
    if (filtered.length) subjects = filtered;
  }

  const programs = subjects.slice(0, 60).map((title, idx) => ({
    id: `${uni._id || uni.name}-course-${idx}`,
    title,
    degreeLevel: null,
    status: null,
    intake: 'Intakes: check official site',
    intakesList: [],
    intakeYear: null,
    durationMonths: null,
    durationText: 'Varies by program',
    tuitionPerYear,
    tuitionNumber: feeUSD,
    currency: 'USD',
    applicationFee: null,
    avgScholarship: null,
    initialDeposit: null,
    sourceLabel,
    officialUrl: uni.website || null,
    isRealData: hasOfficialData
  }));

  // Filter by program level if requested (only when the level is known)
  if (programLevel && programLevel !== 'all') {
    const plNorm = programLevel.toLowerCase();
    return programs.filter(p => {
      if (!p.degreeLevel) return true;
      if (plNorm === 'ug' || plNorm.includes('bachelor')) return p.degreeLevel === 'UG';
      if (plNorm === 'pg' || plNorm.includes('master')) return p.degreeLevel === 'PG';
      return true;
    });
  }

  return programs;
};
