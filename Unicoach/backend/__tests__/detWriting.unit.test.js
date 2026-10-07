const mockEvaluateDetWriting = jest.fn();

jest.mock('../utils/aiService', () => ({
  ...jest.requireActual('../utils/aiService'),
  evaluateDetWriting: (...args) => mockEvaluateDetWriting(...args),
}));

const { normaliseDetEvaluation } = require('../utils/aiService');
const { evaluateDetWriting } = require('../controllers/aiController');

const run = async (body) => {
  const res = { statusCode: 200, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (payload) => { res.body = payload; return res; };
  await evaluateDetWriting({ body }, res);
  return res;
};

beforeEach(() => mockEvaluateDetWriting.mockReset());

describe('normaliseDetEvaluation', () => {
  it('rounds the score to the DET scale and keeps known fields only', () => {
    expect(normaliseDetEvaluation({
      estimatedScore: 113,
      level: 'Intermediate',
      strengths: ['Clear sentences', '', 42, 'Good verbs', 'Varied words', 'extra'],
      improvements: ['Add detail'],
      improvedVersion: '  A better answer.  ',
    })).toEqual({
      estimatedScore: 115,
      level: 'Intermediate',
      strengths: ['Clear sentences', 'Good verbs', 'Varied words'],
      improvements: ['Add detail'],
      improvedVersion: 'A better answer.',
    });
  });

  it('clamps out-of-range scores and drops unknown levels or junk', () => {
    expect(normaliseDetEvaluation({ estimatedScore: 999, level: 'Expert' }).estimatedScore).toBe(160);
    expect(normaliseDetEvaluation({ estimatedScore: -4 }).estimatedScore).toBe(10);
    const junk = normaliseDetEvaluation({ estimatedScore: 'high', level: 'Expert', strengths: 'nice' });
    expect(junk).toEqual({ estimatedScore: null, level: '', strengths: [], improvements: [], improvedVersion: '' });
  });
});

describe('POST /api/ai/evaluate-det-writing', () => {
  it('asks for an answer when it is empty', async () => {
    const res = await run({ photoDescription: 'A student in a library', response: '   ' });
    expect(res.statusCode).toBe(400);
    expect(mockEvaluateDetWriting).not.toHaveBeenCalled();
  });

  it('rejects answers that are far too long for a 1-minute task', async () => {
    const res = await run({ photoDescription: 'A student in a library', response: 'word '.repeat(400) });
    expect(res.statusCode).toBe(400);
    expect(mockEvaluateDetWriting).not.toHaveBeenCalled();
  });

  it('returns the evaluation from the AI', async () => {
    mockEvaluateDetWriting.mockResolvedValue({ estimatedScore: 110, level: 'Intermediate', strengths: [], improvements: [], improvedVersion: '' });
    const res = await run({ photoDescription: 'A student in a library', response: 'A girl is studying with a laptop.' });
    expect(res.statusCode).toBe(200);
    expect(res.body.evaluation.estimatedScore).toBe(110);
    expect(mockEvaluateDetWriting).toHaveBeenCalledWith({ photoDescription: 'A student in a library', response: 'A girl is studying with a laptop.' });
  });

  it('says "try again" instead of inventing a score when the AI is unavailable', async () => {
    mockEvaluateDetWriting.mockRejectedValue(new Error('all models failed'));
    const res = await run({ photoDescription: 'A student in a library', response: 'A girl is studying.' });
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toMatch(/try again/i);
    expect(res.body.evaluation).toBeUndefined();
  });
});
