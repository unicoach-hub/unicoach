import { api } from './api';

// Scholarship Finder: same data and endpoints as the website (/api/scholarships, backend scholarshipController).
export type Scholarship = {
  _id: string;
  title: string;
  universityName: string;
  country: string;
  fundingType?: string;
  coverageLevel?: 'Full' | 'Partial' | 'Variable';
  providerType?: 'UNIVERSITY' | 'GOVERNMENT' | 'FOUNDATION' | 'EXTERNAL_ORGANIZATION';
  awardCoverage?: string;
  amount?: { display?: string; value?: number; currency?: string };
  eligibility?: { degreeLevels?: string[]; minPercentage?: number };
  deadline?: { date?: string | null; displayDeadline?: string };
  urls?: { informationUrl?: string; applicationUrl?: string };
};

export type ScholarshipFilters = { country?: string; degree?: string; search?: string };

export const SCHOLARSHIP_COUNTRIES = ['USA', 'UK', 'Canada', 'Germany', 'Australia', 'Ireland', 'France', 'Italy', 'New Zealand', 'Global'];
export const DEGREES = ['Masters', 'Bachelors', 'PhD'];
export const PAGE_SIZE = 20;

export async function searchScholarships(filters: ScholarshipFilters, page: number) {
  const q = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), sort: 'deadline_asc' });
  if (filters.country) q.set('country', filters.country);
  if (filters.degree) q.set('degree', filters.degree);
  if (filters.search) q.set('search', filters.search);
  return api<{ total: number; scholarships: Scholarship[] }>(`/scholarships?${q}`, { auth: false });
}

export async function scholarshipCounts() {
  const res = await api<{ stats: { totalScholarships: number; countries: { country: string; count: number }[] } }>('/scholarships/stats', {
    auth: false,
  });
  return res.stats;
}

export async function mySavedScholarships() {
  const res = await api<{ shortlisted: { scholarship: Scholarship }[] }>('/scholarships/my/shortlist');
  return res.shortlisted.map((s) => s.scholarship);
}

export async function toggleScholarship(id: string) {
  return api<{ saved: boolean }>('/scholarships/toggle', { method: 'POST', body: { scholarshipId: id } });
}

// "Annual Cycle — Check Official Portal for Live Deadlines" is too long for a card
export function deadlineLabel(s: Scholarship) {
  if (s.deadline?.date) {
    const d = new Date(s.deadline.date);
    if (!Number.isNaN(d.getTime())) return `Deadline ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  const text = s.deadline?.displayDeadline ?? '';
  if (/annual|rolling|check/i.test(text) || !text) return 'Har saal · portal pe date dekho';
  return text.length > 40 ? `${text.slice(0, 38)}…` : text;
}

// Website country names vs the scholarship data's names
export function scholarshipCountryFor(dream?: string) {
  if (!dream) return undefined;
  return SCHOLARSHIP_COUNTRIES.find((c) => c.toLowerCase() === dream.toLowerCase());
}
