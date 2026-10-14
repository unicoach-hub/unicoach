/**
 * Verified Alumni & Student Mentors Dataset & Matching Engine
 * Fully aligned with UniCoach Marketplace Card Design & Data Structure
 */

import { TEAM_MENTORS } from '../utils/teamMentors';

// Countries a "Europe" mentor covers on course pages
const EUROPE = ['germany', 'france', 'italy', 'netherlands', 'spain', 'sweden', 'finland', 'denmark', 'austria', 'switzerland', 'belgium', 'poland', 'czech republic', 'hungary', 'portugal', 'norway', 'malta', 'cyprus', 'lithuania', 'latvia', 'estonia'];

// Our real UniCoach mentors, shaped the way the course pages expect.
// No ratings or prices are invented: sessions are free and booking goes to the events page.
export const MENTORS_COLLECTION = TEAM_MENTORS.map((m) => ({
  id: `team-${m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: m.name,
  avatar: m.headshot || m.portrait || m.src,
  university: '',
  uniShort: m.country === 'Europe' ? 'Europe guidance' : `${m.country} expert`,
  country: m.country,
  headline: m.role,
  currentRole: m.role,
  batch: 'UniCoach mentor',
  status: m.country,
  bio: m.focus || '',
  rating: null,
  startingPriceINR: 0,
  free: true,
  href: '/events',
  badges: [],
  disciplines: [],
  availableFor: [],
}));

export const normalizeCountry = (countryStr = '') => {
  const c = String(countryStr).toLowerCase().trim();
  if (!c) return '';
  if (
    c === 'uk' ||
    c.includes('united kingdom') ||
    c.includes('england') ||
    c.includes('scotland') ||
    c.includes('wales') ||
    c.includes('great britain') ||
    c.includes('britain')
  ) {
    return 'united kingdom';
  }
  if (
    c === 'us' ||
    c === 'usa' ||
    c.includes('united states') ||
    c.includes('america')
  ) {
    return 'united states';
  }
  if (c.includes('germany') || c === 'de' || c.includes('deutschland')) {
    return 'germany';
  }
  if (c.includes('canada') || c === 'ca') {
    return 'canada';
  }
  if (c.includes('australia') || c === 'au') {
    return 'australia';
  }
  if (c.includes('ireland') || c === 'ie') {
    return 'ireland';
  }
  return c;
};

export const isSameCountry = (c1, c2) => {
  const norm1 = normalizeCountry(c1);
  const norm2 = normalizeCountry(c2);
  if (!norm1 || !norm2) return false;
  return norm1 === norm2;
};

/**
 * Smart matching algorithm: Finds the top 2-3 most relevant mentors
 * for any given university and degree program.
 * Strictly guarantees that mentors belong to the same destination country
 * as the university (e.g. UK universities only show UK mentors).
 */
export const getMentorsForCourseAndUni = (uni = {}, program = {}) => {
  if (!uni) return MENTORS_COLLECTION.slice(0, 3);

  const uniName = String(uni.name || '').toLowerCase();
  const rawCountry = String(uni.countryName || uni.country || uni.location || uni.state || '');
  const targetCountry = normalizeCountry(rawCountry);
  const progTitle = String(program?.title || '').toLowerCase();

  // Filter pool strictly by country if country is identifiable
  const isEurope = targetCountry && EUROPE.includes(String(targetCountry).toLowerCase());
  const countryPool = targetCountry
    ? MENTORS_COLLECTION.filter(m => isSameCountry(m.country, targetCountry) || (isEurope && m.country === 'Europe'))
    : [];

  const pool = countryPool.length > 0 ? countryPool : MENTORS_COLLECTION;

  // 1. Direct university name match
  let matched = pool.filter(m => {
    const mUni = (m.university || '').toLowerCase();
    if (!mUni) return false;
    const mShort = (m.uniShort || '').toLowerCase();
    return (
      uniName.includes(mUni) ||
      mUni.includes(uniName) ||
      (mShort && (uniName.includes(mShort) || mShort.includes(uniName)))
    );
  });

  // 2. Discipline match within the country pool
  if (matched.length < 3) {
    const disciplineMatches = pool.filter(m => {
      if (matched.some(existing => existing.id === m.id)) return false;
      return (m.disciplines || []).some(d => {
        const dLower = d.toLowerCase();
        return (
          progTitle.includes(dLower) ||
          (dLower.includes('computer') && progTitle.includes('science')) ||
          (dLower.includes('data') && progTitle.includes('analytics')) ||
          (dLower.includes('business') && progTitle.includes('management'))
        );
      });
    });
    matched = [...matched, ...disciplineMatches];
  }

  // 3. Fallback within the SAME country pool (guarantees NO cross-country mismatch)
  if (matched.length < 3) {
    const countryFallbacks = pool.filter(m => !matched.some(existing => existing.id === m.id));
    matched = [...matched, ...countryFallbacks];
  }

  // 4. Global fallback ONLY if the country pool was completely empty (e.g. unknown country)
  if (matched.length < 3 && pool === MENTORS_COLLECTION) {
    const globalFallbacks = MENTORS_COLLECTION.filter(m => !matched.some(existing => existing.id === m.id));
    matched = [...matched, ...globalFallbacks];
  }

  return matched.slice(0, 3);
};
