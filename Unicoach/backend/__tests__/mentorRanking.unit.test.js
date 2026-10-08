const { computeRankScore } = require('../unicoach/services/mentorStatsService');

// rankScore(average, count) for readability
const score = (avg, count) => computeRankScore(avg * count, count);

describe('computeRankScore', () => {
  it('ranks many strong reviews above a single perfect review', () => {
    expect(score(4.8, 200)).toBeGreaterThan(score(5, 1));
  });

  it('ranks a higher average above a lower one when review counts match', () => {
    expect(score(4.9, 30)).toBeGreaterThan(score(4.5, 30));
  });

  it('places a mentor with no reviews below well-reviewed mentors but above poorly-reviewed ones', () => {
    const newMentor = score(0, 0);
    expect(newMentor).toBe(4);
    expect(score(4.7, 20)).toBeGreaterThan(newMentor);
    expect(score(3.2, 20)).toBeLessThan(newMentor);
  });
});
