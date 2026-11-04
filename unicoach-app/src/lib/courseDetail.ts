import { api } from './api';

// One course from the Course Finder catalogue: GET /api/search/courses/:cfId (public, cached 5 min)
export type Money = { amount: number; currency: string; isWaived?: boolean };

export type CourseDetail = {
  id: string;
  name: string;
  duration?: string;
  campus?: string;
  intakesList?: string[];
  applicationDeadline?: string;
  applicationFee?: Money;
  tuitionFee?: Money;
  deposit?: Money;
  university: { cfUniversityId: number; name: string; city?: string; countryName?: string; rankings?: Record<string, number> };
  testRequirements?: { english?: { test: string; score: number }[]; standardized?: { test: string; score: number }[] };
  averageScholarship?: number;
  scholarshipAvailable?: boolean;
  scholarshipRange?: { min: number; max: number; currency: string } | null;
  highlightIds?: number[];
};

export type Highlight = { id: number; name: string; description: string };

export async function courseDetail(cfId: string | number) {
  const res = await api<{ data: CourseDetail }>(`/search/courses/${cfId}`, { auth: false });
  return res.data;
}

let highlightsCache: Promise<Highlight[]> | null = null;

// Labels for highlightIds ("Scholarship Available", "Faster Offer TAT"...); the list rarely changes.
export function highlights() {
  highlightsCache ??= api<{ data: Highlight[] }>('/search/highlights', { auth: false })
    .then((r) => r.data)
    .catch(() => {
      highlightsCache = null;
      return [];
    });
  return highlightsCache;
}
