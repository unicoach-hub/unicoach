/**
 * Helpers for the /universities shortlister:
 * - EMPTY_FILTERS: the advanced-filter state sent to POST /shortlist
 * - the student's step-1 profile, cached per account in localStorage (the server copy lives on
 *   User.shortlistProfile via /shortlist/profile, so a new device can restore it)
 */

export const EMPTY_FILTERS = {
  city: '',
  studyArea: '',
  degreeLevel: '',
  universityType: '',
  maxRank: 0,
  maxTuitionUSD: 0,
};

export const SHORTLIST_PROFILE_PREFIX = 'unicoach_shortlist_profile:';

const PROFILE_FIELDS = [
  'educationLevel', 'gpaPercent', 'streamMajor', 'targetCountry', 'targetDegree',
  'maxBudgetUSD', 'ieltsScore', 'greScore', 'intake', 'workExpYears',
];

export const pickProfile = (data = {}) =>
  Object.fromEntries(PROFILE_FIELDS.filter((k) => data[k] !== undefined && data[k] !== null && data[k] !== '').map((k) => [k, data[k]]));

export const readLocalProfile = (userId) => {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(`${SHORTLIST_PROFILE_PREFIX}${userId}`);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && parsed.streamMajor && parsed.targetCountry ? parsed : null;
  } catch {
    return null;
  }
};

export const writeLocalProfile = (userId, profile) => {
  if (!userId) return;
  try {
    localStorage.setItem(`${SHORTLIST_PROFILE_PREFIX}${userId}`, JSON.stringify(pickProfile(profile)));
  } catch {
    // Storage blocked (private mode): the server copy still restores it next time
  }
};
