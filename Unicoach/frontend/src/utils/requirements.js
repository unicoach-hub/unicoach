/**
 * University admission requirements and acceptance rate.
 * Requirements are shown only when they were taken from the university's official page and reviewed: the backend
 * then sets `requirementsSource` (e.g. "University website, verified 2026-10"). Every other record holds schema
 * defaults (IELTS 6.5, 60%, 'GPA 3.0+', 'GRE Waived', 'Freshers Eligible', generated eligibility strings), so
 * nothing is shown for it. Same idea as getVerifiedRanking in ./ranking.js.
 */

export const CHECK_SITE = 'Check official site';

const positiveNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const nonEmptyText = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);

// Acceptance rate (a percent, e.g. 7 for MIT) only when it comes from an official source. Other records hold a
// default ('66%'). Same rule as the acceptance-rate badge in ./courseFinderHelper.js.
export const getOfficialAcceptanceRate = (uni) => {
  if (!uni || !uni.dataSource || uni.dataSource.provider !== 'College Scorecard') return null;
  return typeof uni.acceptanceRate === 'number' && Number.isFinite(uni.acceptanceRate) ? uni.acceptanceRate : null;
};

// University-wide minimum English requirement from the university's central admissions page
// (University.englishRequirement, set by backend/scripts/dataSync/englishRequirementsSync.js). Independent of
// requirementsSource: having it never makes the placeholder GPA/GRE fields count as official.
export const getOfficialEnglish = (uni) => {
  const e = uni && uni.englishRequirement;
  if (!e || !e.sourceUrl) return null;
  const ielts = positiveNumber(e.ieltsOverall);
  const toefl = positiveNumber(e.toeflIbt);
  if (!ielts && !toefl) return null;
  let host;
  try { host = new URL(e.sourceUrl).hostname.replace(/^www\./, ''); } catch { host = ''; }
  const checked = e.checkedAt ? new Date(e.checkedAt) : null;
  return {
    ielts,
    ieltsMinBand: positiveNumber(e.ieltsMinBand),
    toefl,
    sourceUrl: e.sourceUrl,
    sourceLabel: `${host || 'University website'}${checked && !Number.isNaN(checked.getTime()) ? `, checked ${checked.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}` : ''}`,
  };
};

/**
 * Every requirement field is null unless `uni.requirementsSource` is set (IELTS/TOEFL may instead come from
 * getOfficialEnglish).
 * gpaPercent / ielts / gre: numbers. greRequired: boolean. workExp / minScoreText / ieltsText / eligibilityText:
 * the university's own text. acceptanceRate: see getOfficialAcceptanceRate.
 */
export const getOfficialRequirements = (uni) => {
  const source = uni ? nonEmptyText(uni.requirementsSource) : null;
  const acceptanceRate = getOfficialAcceptanceRate(uni);
  const english = getOfficialEnglish(uni);
  const englishFields = english ? {
    ielts: english.ielts,
    ieltsText: english.ielts ? `${english.ielts} overall${english.ieltsMinBand ? `, ${english.ieltsMinBand} each band` : ''}` : null,
    toefl: english.toefl,
    englishSource: english,
  } : { toefl: null, englishSource: null };

  if (!source) {
    return {
      gpaPercent: null,
      ielts: null,
      gre: null,
      greRequired: null,
      workExp: null,
      minScoreText: null,
      ieltsText: null,
      eligibilityText: null,
      source: null,
      acceptanceRate,
      ...englishFields,
    };
  }

  return {
    gpaPercent: positiveNumber(uni.minGpaPercent),
    ielts: positiveNumber(uni.minIeltsScore),
    gre: positiveNumber(uni.minGreScore),
    greRequired: typeof uni.greRequired === 'boolean' ? uni.greRequired : null,
    workExp: nonEmptyText(uni.workExp),
    minScoreText: nonEmptyText(uni.minScore),
    ieltsText: nonEmptyText(uni.ieltsScore),
    eligibilityText: nonEmptyText(uni.eligibility),
    source,
    acceptanceRate,
    toefl: english?.toefl ?? positiveNumber(uni.minToeflScore),
    englishSource: english,
  };
};

// Display text for the GRE row: "Required (310+)", "Required", "Not required", or null when unknown.
export const getGreText = (req) => {
  if (!req || req.greRequired === null) return null;
  if (!req.greRequired) return 'Not required';
  return req.gre ? `Required (${req.gre}+)` : 'Required';
};
