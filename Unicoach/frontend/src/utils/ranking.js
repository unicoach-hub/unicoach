/**
 * University world rankings.
 * A rank is shown only when it was imported from an official ranking file: the backend then sets
 * `rankingSource` (e.g. "QS World University Rankings 2027"). Every other record holds a placeholder
 * `rankingNum`, so nothing is shown for it.
 */

const SHORT_PUBLISHERS = [
  [/\bQS\b/, 'QS'],
  [/Times Higher Education|\bTHE\b/, 'THE'],
  [/US News/i, 'US News'],
  [/\bARWU\b|Shanghai/i, 'ARWU'],
];

// "QS World University Rankings 2027" -> "QS 2027" (unknown publishers keep their full name)
export const getShortRankingSource = (source = '') => {
  const text = String(source);
  const publisher = SHORT_PUBLISHERS.find(([re]) => re.test(text));
  if (!publisher) return text;
  const year = (text.match(/\b(?:19|20)\d{2}\b/) || [])[0];
  return year ? `${publisher[1]} ${year}` : publisher[1];
};

/**
 * Returns null unless the ranking comes from an official source.
 * `rankingNum` is the numeric lower bound (for sorting); `rank` holds the publisher's own text,
 * which can be a tie or a band ("=24", "601-610", "1401+").
 */
export const getVerifiedRanking = (uni) => {
  const rank = Number(uni && uni.rankingNum);
  if (!uni || !uni.rankingSource || !(rank > 0)) return null;

  const m = typeof uni.rank === 'string' && uni.rank.trim().match(/^=?\s*(\d+)\s*(?:[-–]\s*(\d+)|(\+))?$/);
  const label = m ? `#${m[1]}${m[2] ? `–${m[2]}` : (m[3] || '')}` : `#${rank}`;

  return {
    rank,
    source: uni.rankingSource,
    label,                                                              // "#601–610"
    shortLabel: `${label} · ${getShortRankingSource(uni.rankingSource)}`, // "#601–610 · QS 2027"
    fullLabel: `${label} · ${uni.rankingSource}`,                       // "#601–610 · QS World University Rankings 2027"
  };
};
