const { buildLeadTrends } = require('../utils/leadTrend');

const row = (_id, total, verified = 0) => ({ _id, total, verified });

describe('buildLeadTrends', () => {
  const today = '2026-10-03';
  const rows = [
    row('2024-02-10', 4, 1), // before the 24-month window -> "All" goes yearly
    row('2025-10-02', 5, 2), // previous-year window for 1Y
    row('2026-06-15', 3, 3),
    row('2026-07-04', 2),
    row('2026-09-01', 6, 4), // previous-30d window for 30D
    row('2026-09-30', 1, 1),
    row('2026-10-03', 2, 1),
    row('2026-10-04', 9, 9), // future (clock skew) -> ignored
  ];
  const trends = buildLeadTrends(rows, today);

  test('7D and 30D are zero-filled daily series ending today', () => {
    expect(trends['7d'].granularity).toBe('day');
    expect(trends['7d'].buckets).toHaveLength(7);
    expect(trends['7d'].buckets[0].start).toBe('2026-09-27');
    expect(trends['7d'].buckets[6]).toMatchObject({ start: today, current: true, total: 2, verified: 1 });
    expect(trends['7d'].total).toBe(3);

    expect(trends['30d'].buckets).toHaveLength(30);
    expect(trends['30d'].start).toBe('2026-09-04');
    expect(trends['30d'].total).toBe(3);
    // previous 30 days = 2026-08-05 .. 2026-09-03
    expect(trends['30d'].previous).toEqual({ total: 6, verified: 4 });
  });

  test('3M is 13 weekly buckets covering the last 91 days', () => {
    const w = trends['90d'];
    expect(w.granularity).toBe('week');
    expect(w.buckets).toHaveLength(13);
    expect(w.start).toBe('2026-07-05');
    expect(w.buckets[12]).toMatchObject({ start: '2026-09-27', end: today, current: true });
    expect(w.total).toBe(6 + 1 + 2);
    expect(w.previous.total).toBe(3 + 2); // 2026-04-05 .. 2026-07-04
  });

  test('1Y is 12 calendar months ending with the current (partial) month', () => {
    const y = trends['1y'];
    expect(y.granularity).toBe('month');
    expect(y.buckets).toHaveLength(12);
    expect(y.buckets[0]).toMatchObject({ start: '2025-11-01', end: '2025-11-30' });
    expect(y.buckets[11]).toMatchObject({ start: '2026-10-01', end: today, current: true, total: 2 });
    expect(y.total).toBe(3 + 2 + 6 + 1 + 2);
    expect(y.previous.total).toBe(5);
  });

  test('All switches to yearly buckets when history is longer than 24 months', () => {
    const a = trends.all;
    expect(a.granularity).toBe('year');
    expect(a.since).toBe('2024-02-10');
    expect(a.previous).toBeNull();
    expect(a.buckets.map((b) => [b.start, b.total])).toEqual([
      ['2024-01-01', 4],
      ['2025-01-01', 5],
      ['2026-01-01', 14],
    ]);
  });

  test('All stays monthly for a short history and handles no leads at all', () => {
    const short = buildLeadTrends([row('2026-08-20', 2)], today).all;
    expect(short.granularity).toBe('month');
    expect(short.buckets.map((b) => b.start)).toEqual(['2026-08-01', '2026-09-01', '2026-10-01']);

    const empty = buildLeadTrends([], today);
    expect(empty.all).toMatchObject({ granularity: 'month', since: null, total: 0 });
    expect(empty.all.buckets).toHaveLength(1);
    expect(empty['30d'].previous).toEqual({ total: 0, verified: 0 });
  });
});
