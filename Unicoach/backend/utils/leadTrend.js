/**
 * Builds the dashboard "Lead activity" series for every range from one list of
 * per-day counts. Day keys are IST calendar dates ('YYYY-MM-DD'); all date math
 * below is done on those keys in UTC so the server timezone never shifts a bucket.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_MONTHLY_BUCKETS = 24; // "All" switches from months to years beyond this

const toMs = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const toKey = (ms) => new Date(ms).toISOString().slice(0, 10);
const addDays = (key, n) => toKey(toMs(key) + n * DAY_MS);
const daysBetween = (startKey, endKey) => Math.round((toMs(endKey) - toMs(startKey)) / DAY_MS) + 1;
// Date.UTC normalises out-of-range months, so (2026, -3) is October 2025.
const monthStart = (y, m) => toKey(Date.UTC(y, m, 1));
const monthEnd = (y, m) => toKey(Date.UTC(y, m + 1, 0));

const istDayKey = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

/**
 * @param {Array<{_id: string, total: number, verified: number}>} dailyRows per-IST-day counts
 * @param {string} todayKey IST date of "today", 'YYYY-MM-DD'
 */
const buildLeadTrends = (dailyRows, todayKey = istDayKey()) => {
  const days = (dailyRows || [])
    .filter((r) => r && typeof r._id === 'string' && r._id <= todayKey)
    .map((r) => ({ key: r._id, total: r.total || 0, verified: r.verified || 0 }))
    .sort((a, b) => (a.key < b.key ? -1 : 1));

  // ISO date strings sort the same way as the dates they name.
  const sumBetween = (startKey, endKey) => {
    let total = 0;
    let verified = 0;
    for (const d of days) {
      if (d.key < startKey) continue;
      if (d.key > endKey) break;
      total += d.total;
      verified += d.verified;
    }
    return { total, verified };
  };

  const bucket = (start, end) => ({
    start,
    end: end > todayKey ? todayKey : end,
    current: start <= todayKey && end >= todayKey,
    ...sumBetween(start, end > todayKey ? todayKey : end),
  });

  const series = (granularity, buckets, { comparePrevious = true } = {}) => {
    const start = buckets[0].start;
    const total = buckets.reduce((s, b) => s + b.total, 0);
    const verified = buckets.reduce((s, b) => s + b.verified, 0);
    let previous = null;
    if (comparePrevious) {
      // Same number of days immediately before this window, so partial months/weeks compare fairly.
      const length = daysBetween(start, todayKey);
      previous = sumBetween(addDays(start, -length), addDays(start, -1));
    }
    return { granularity, start, end: todayKey, total, verified, previous, buckets };
  };

  const daily = (n) =>
    series('day', Array.from({ length: n }, (_, i) => {
      const key = addDays(todayKey, -(n - 1 - i));
      return bucket(key, key);
    }));

  const [ty, tm] = todayKey.split('-').map(Number);
  const monthly = (fromY, fromM, count, opts) =>
    series('month', Array.from({ length: count }, (_, i) => bucket(monthStart(fromY, fromM + i), monthEnd(fromY, fromM + i))), opts);

  // 13 whole weeks ending today ≈ the last 3 months.
  const weekly = series('week', Array.from({ length: 13 }, (_, i) => {
    const end = addDays(todayKey, -7 * (12 - i));
    return bucket(addDays(end, -6), end);
  }));

  const firstKey = days.length ? days[0].key : todayKey;
  const [fy, fm] = firstKey.split('-').map(Number);
  const monthsSinceFirst = (ty - fy) * 12 + (tm - fm) + 1;
  const all = monthsSinceFirst > MAX_MONTHLY_BUCKETS
    ? series('year', Array.from({ length: ty - fy + 1 }, (_, i) => bucket(`${fy + i}-01-01`, `${fy + i}-12-31`)), { comparePrevious: false })
    : monthly(fy, fm - 1, Math.max(1, monthsSinceFirst), { comparePrevious: false });

  return {
    '7d': daily(7),
    '30d': daily(30),
    '90d': weekly,
    '1y': monthly(ty, tm - 1 - 11, 12),
    all: { ...all, since: days.length ? firstKey : null },
  };
};

module.exports = { buildLeadTrends, istDayKey };
