import { api } from './api';

// Course Finder engine: POST /api/search/courses (open to everyone, no login needed)
export type Course = {
  _id: string;
  cfId: number;
  courseName: string;
  universityName: string;
  cfUniversityId: number;
  countryName: string;
  city?: string;
  degreeLevel?: string;
  duration?: string;
  intakes?: string[];
  annualFee?: { amount: number; currency: string };
  applicationFee?: { amount: number; currency: string; isWaived?: boolean };
  minIeltsScore?: number;
  isStem?: boolean;
  greRequired?: boolean;
  scholarshipRange?: { min: number; max: number; currency: string } | null;
};

export type CourseFilters = {
  searchText?: string;
  country?: number[];
  programLevel?: number[];
  requirements?: number[];
};

export type CoursePage = { data: Course[]; total: number; totalPages: number; universitiesCount: number };

export function searchCourses(filters: CourseFilters, page: number) {
  return api<CoursePage>('/search/courses', {
    method: 'POST',
    body: { filters, sort: 'featured', page, pageSize: 20 },
    auth: false,
  });
}

// Ids from backend/data/coursefinder/filters-data.json
export const COUNTRIES = [
  { id: 9, name: 'Germany', image: require('@/assets/images/destinations/germany.webp'), tint: '#FFF1B8' },
  { id: 4, name: 'UK', image: require('@/assets/images/destinations/uk.webp'), tint: '#D8EEEC' },
  { id: 3, name: 'Canada', image: require('@/assets/images/destinations/canada.webp'), tint: '#FCDCD2' },
  { id: 8, name: 'Ireland', image: require('@/assets/images/destinations/ireland.webp'), tint: '#FBD9E6' },
  { id: 1, name: 'USA', image: require('@/assets/images/destinations/usa.webp'), tint: '#FDE7C8' },
  { id: 2, name: 'Australia', image: require('@/assets/images/destinations/australia.webp'), tint: '#D8EEEC' },
];

export const LEVELS = [
  { id: 2, label: 'Masters' },
  { id: 1, label: 'Bachelors' },
];

// Requirement predicates in the search controller
export const REQUIREMENTS = [
  { id: 23, label: 'No GRE' },
  { id: 101, label: 'Application fee waived' },
  { id: 100, label: 'STEM' },
];

const SYMBOL: Record<string, string> = { EUR: '€', GBP: '£', USD: '$', CAD: 'C$', AUD: 'A$', NZD: 'NZ$', INR: '₹', SGD: 'S$' };

export function money(amount: number, currency: string) {
  const sym = SYMBOL[currency] ?? `${currency} `;
  return `${sym}${Math.round(amount).toLocaleString('en-IN')}`;
}

// "36 Months" -> "3 saal", "18 Months" -> "18 mahine"
export function durationShort(d?: string) {
  if (!d) return undefined;
  const m = d.match(/(\d+)\s*month/i);
  if (!m) return d.replace(/years?/i, 'saal');
  const n = Number(m[1]);
  return n % 12 === 0 ? `${n / 12} saal` : `${n} mahine`;
}
