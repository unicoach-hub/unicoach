/**
 * CENTRALIZED UNIVERSITIES MODULE INDEX
 * Standardized Sanitizer & Normalizer for 500+ Universities across 9 Countries
 */

import { UNIVERSITIES_USA } from './usa.js';
import { UNIVERSITIES_UK } from './uk.js';
import { UNIVERSITIES_AUSTRALIA } from './australia.js';
import { UNIVERSITIES_CANADA } from './canada.js';
import { UNIVERSITIES_GERMANY } from './germany.js';
import { UNIVERSITIES_IRELAND } from './ireland.js';
import { UNIVERSITIES_ITALY } from './italy.js';
import { UNIVERSITIES_FRANCE } from './france.js';
import { UNIVERSITIES_NEW_ZEALAND } from './newZealand.js';
import { UNIVERSITIES_SINGAPORE } from './singapore.js';

export { UNIVERSITIES_USA } from './usa.js';
export { UNIVERSITIES_UK } from './uk.js';
export { UNIVERSITIES_AUSTRALIA } from './australia.js';
export { UNIVERSITIES_CANADA } from './canada.js';
export { UNIVERSITIES_GERMANY } from './germany.js';
export { UNIVERSITIES_IRELAND } from './ireland.js';
export { UNIVERSITIES_ITALY } from './italy.js';
export { UNIVERSITIES_FRANCE } from './france.js';
export { UNIVERSITIES_NEW_ZEALAND } from './newZealand.js';
export { UNIVERSITIES_SINGAPORE } from './singapore.js';

import { getUniversityInitials, generateInitialsSvg } from '../../components/logoResolver.js';

/** Master University Sanitizer & Normalizer */
export const normalizeUniversity = (u) => {
  if (!u) return null;
  const name = u.name || 'University';
  const countryName = u.countryName || (u.country ? u.country.toUpperCase() : 'Global');
  const country = (u.country || countryName).toLowerCase().replace(/\s+/g, '-');
  const city = u.city || 'Central City';
  const rankingNum = u.rankingNum || (u.rank ? parseInt(String(u.rank).replace(/\D/g, '')) || 200 : 200);
  const rank = u.rank || `Rank ${rankingNum} QS Rankings`;
  const tuitionFeeUSD = u.tuitionFeeUSD || 25000;
  const tuition = u.tuition || `₹${Math.round((tuitionFeeUSD * 85) / 100000)} Lakh INR/yr ($${tuitionFeeUSD.toLocaleString()})`;
  const minIeltsScore = u.minIeltsScore || 6.5;
  const minGpaPercent = u.minGpaPercent || 65;
  const eligibility = u.eligibility || `GPA ${(minGpaPercent / 20).toFixed(1)}+ (${minGpaPercent}%), IELTS ${minIeltsScore}+`;
  const courses = Array.isArray(u.courses) && u.courses.length > 0
    ? u.courses
    : ['Computer Science', 'Data Science', 'Business Administration', 'MBA', 'Software Engineering', 'Finance', 'Artificial Intelligence'];
  const degreeLevels = Array.isArray(u.degreeLevels) && u.degreeLevels.length > 0
    ? u.degreeLevels
    : ["Bachelor's", "Master's", "PhD"];
  const acceptanceRate = u.acceptanceRate || 55;

  const initials = getUniversityInitials(name);
  const fallbackLogo = generateInitialsSvg(name);

  // Fix clearbit / placeholder broken image domains
  const isBrokenLogo = u.logo && (
    u.logo.includes('clearbit.com') ||
    u.logo.includes('via.placeholder') ||
    u.logo.includes('ui-avatars.com')
  );

  return {
    ...u,
    _id: u._id || `uni-${name.toLowerCase().replace(/\W+/g, '-')}`,
    name,
    countryName,
    country,
    city,
    state: u.state || city,
    location: u.location || `${city}, ${countryName}`,
    rank,
    rankingNum,
    tuition,
    tuitionFeeUSD,
    minGpaPercent,
    minIeltsScore,
    eligibility,
    courses,
    degreeLevels,
    acceptanceRate,
    logo: (!u.logo || isBrokenLogo) ? fallbackLogo : u.logo,
    fallbackLogo,
    initials,
    website: u.website || `https://${name.toLowerCase().replace(/\W+/g, '')}.edu`
  };
};

// Normalized Arrays
export const NORMALIZED_USA = UNIVERSITIES_USA.map(normalizeUniversity);
export const NORMALIZED_UK = UNIVERSITIES_UK.map(normalizeUniversity);
export const NORMALIZED_AUSTRALIA = UNIVERSITIES_AUSTRALIA.map(normalizeUniversity);
export const NORMALIZED_CANADA = UNIVERSITIES_CANADA.map(normalizeUniversity);
export const NORMALIZED_GERMANY = UNIVERSITIES_GERMANY.map(normalizeUniversity);
export const NORMALIZED_IRELAND = UNIVERSITIES_IRELAND.map(normalizeUniversity);
export const NORMALIZED_ITALY = UNIVERSITIES_ITALY.map(normalizeUniversity);
export const NORMALIZED_FRANCE = UNIVERSITIES_FRANCE.map(normalizeUniversity);
export const NORMALIZED_NEW_ZEALAND = UNIVERSITIES_NEW_ZEALAND.map(normalizeUniversity);
export const NORMALIZED_SINGAPORE = UNIVERSITIES_SINGAPORE.map(normalizeUniversity);

// Structured Object by Country
export const UNIVERSITIES_BY_COUNTRY = {
  usa: NORMALIZED_USA,
  uk: NORMALIZED_UK,
  australia: NORMALIZED_AUSTRALIA,
  canada: NORMALIZED_CANADA,
  germany: NORMALIZED_GERMANY,
  ireland: NORMALIZED_IRELAND,
  italy: NORMALIZED_ITALY,
  france: NORMALIZED_FRANCE,
  'new-zealand': NORMALIZED_NEW_ZEALAND,
  singapore: NORMALIZED_SINGAPORE
};

// Combined Master Normalized List
export const ALL_UNIVERSITIES = [
  ...NORMALIZED_USA,
  ...NORMALIZED_UK,
  ...NORMALIZED_AUSTRALIA,
  ...NORMALIZED_CANADA,
  ...NORMALIZED_GERMANY,
  ...NORMALIZED_IRELAND,
  ...NORMALIZED_ITALY,
  ...NORMALIZED_FRANCE,
  ...NORMALIZED_NEW_ZEALAND,
  ...NORMALIZED_SINGAPORE
];

/** Helpers */
export const getByCountry = (country) => {
  if (!country) return ALL_UNIVERSITIES;
  const slug = country.toLowerCase().replace(/\s+/g, '-');
  return UNIVERSITIES_BY_COUNTRY[slug] || ALL_UNIVERSITIES.filter(u => u.country === slug || u.countryName.toLowerCase() === slug);
};

export const getByCity = (country, city) => {
  const countryUnis = getByCountry(country);
  if (!city) return countryUnis;
  const cityLower = city.toLowerCase();
  return countryUnis.filter(u => u.city.toLowerCase() === cityLower);
};

export const getByCourse = (course) => {
  if (!course) return ALL_UNIVERSITIES;
  const courseLower = course.toLowerCase();
  return ALL_UNIVERSITIES.filter(u => (u.courses || []).some(c => c.toLowerCase().includes(courseLower)));
};

export const getByCountryAndCourse = (country, course) => {
  const countryUnis = getByCountry(country);
  if (!course) return countryUnis;
  const courseLower = course.toLowerCase();
  return countryUnis.filter(u => (u.courses || []).some(c => c.toLowerCase().includes(courseLower)));
};

export default ALL_UNIVERSITIES;
