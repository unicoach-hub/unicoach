import { TEAM_MENTORS } from '../../utils/teamMentors';

// Team mentors (hardcoded, not in the mentor database) stay pinned above database mentors
// until they get real UniCoach mentor accounts.
export const FEATURED_MENTORS = TEAM_MENTORS.map((mentor) => ({
  _id: `featured-${mentor.name}`,
  name: mentor.name,
  headline: mentor.role,
  country: mentor.country,
  avatarUrl: mentor.portrait,
  startingPriceINR: 0,
  rating: null,
  reviewCount: 0,
  isFeatured: true,
  href: '/events',
}));

export const mentorHref = (mentor) => mentor.href || `/@${mentor.handle}`;

const COUNTRY_NAMES = {
  us: 'USA', gb: 'UK', ie: 'Ireland', de: 'Germany', ca: 'Canada', au: 'Australia',
  fr: 'France', nl: 'Netherlands', nz: 'New Zealand', sg: 'Singapore', ae: 'UAE', in: 'India',
};

// Mentors store either a country name ("Ireland") or an ISO code ("IE")
export const getCountryFlagCode = (country) => {
  if (!country) return null;
  const c = country.toLowerCase().trim();
  if (c.length === 2 && /^[a-z]{2}$/.test(c)) return c === 'uk' ? 'gb' : c;
  if (c.includes('germany')) return 'de';
  if (c.includes('usa') || c.includes('united states') || c.includes('america')) return 'us';
  if (c.includes('uk') || c.includes('united kingdom') || c.includes('oxford') || c.includes('england')) return 'gb';
  if (c.includes('canada')) return 'ca';
  if (c.includes('australia')) return 'au';
  if (c.includes('ireland')) return 'ie';
  if (c.includes('france')) return 'fr';
  if (c.includes('netherlands')) return 'nl';
  if (c.includes('new zealand')) return 'nz';
  return null;
};

export const getCountryLabel = (country) => {
  if (!country) return '';
  const trimmed = country.trim();
  return trimmed.length === 2 ? COUNTRY_NAMES[trimmed.toLowerCase()] || trimmed.toUpperCase() : trimmed;
};

export const SERVICE_TYPE_OPTIONS = [
  { value: '', label: 'Any service' },
  { value: 'ONE_ON_ONE', label: '1:1 Call' },
  { value: 'SOP_REVIEW', label: 'SOP Review' },
  { value: 'PRIORITY_DM', label: 'Priority DM' },
  { value: 'DIGITAL_ASSET', label: 'Digital Resource' },
];

export const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '4', label: '4★ & above' },
  { value: '4.5', label: '4.5★ & above' },
];

// value is "min-max" (either side may be empty)
export const PRICE_RANGES = [
  { value: '', label: 'Any price' },
  { value: '0-0', label: 'Free' },
  { value: '-500', label: 'Under ₹500' },
  { value: '500-1000', label: '₹500 – ₹1,000' },
  { value: '1000-', label: '₹1,000+' },
];

export const SORT_OPTIONS = [
  { value: 'top_rated', label: 'Top rated' },
  { value: 'most_reviewed', label: 'Most reviewed' },
  { value: 'price_low', label: 'Price: low to high' },
  { value: 'price_high', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest' },
];

export const formatPrice = (inr) => (inr > 0 ? `₹${Number(inr).toLocaleString('en-IN')}` : 'Free');
