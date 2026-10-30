// Scholarship display helpers for the Course Finder.
// Catalogue amounts are rough (often one figure per university, sometimes stale), so we never show
// a single amount: just "Available", the university's approximate range, and a link to check it.

export const hasScholarship = (c = {}) =>
  !!(c.scholarshipAvailable || Number(c.avgScholarship ?? c.averageScholarship) > 0 || (c.highlightIds || []).includes(2));

const short = (n) => (n >= 1000 ? `${Math.round(n / 100) / 10}k`.replace('.0k', 'k') : String(Math.round(n)));

// "approx. GBP 3k–5.1k" (or "approx. GBP 5k" when the university has one figure); null when unknown
export const scholarshipRangeText = (r) => {
  if (!r || !(r.max > 0)) return null;
  const cur = r.currency ? `${r.currency} ` : '';
  return r.min === r.max || short(r.min) === short(r.max) ? `approx. ${cur}${short(r.max)}` : `approx. ${cur}${short(r.min)}–${short(r.max)}`;
};

// We don't hold official university URLs yet, so this opens a search for the university's own scholarship page
export const scholarshipCheckUrl = (universityName = '') =>
  `https://www.google.com/search?q=${encodeURIComponent(`${universityName.trim()} international student scholarships`)}`;
