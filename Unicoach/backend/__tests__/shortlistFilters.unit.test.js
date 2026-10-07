// /universities advanced filters + saved profile (no DB: models are mocked)
const IRELAND = 'c-ie';
const CANADA = 'c-ca';

const mockUniversities = [
  { _id: 'u1', name: 'Trinity College Dublin', city: 'Dublin', country: IRELAND, rankingNum: 80, rankingSource: 'QS World University Rankings 2027', tuitionFeeUSD: 24000, type: 'PUBLIC', degreeLevels: ['Bachelors', 'Masters', 'PhD'], courses: ['Computer Science', 'Law'] },
  { _id: 'u2', name: 'University of Galway', city: 'Galway', country: IRELAND, rankingNum: 270, tuitionFeeUSD: 18000, type: 'PUBLIC', degreeLevels: ['Bachelors', 'Masters'], courses: ['Data Analytics', 'Nursing'] },
  { _id: 'u3', name: 'Atlantic Technological University', city: 'Galway', country: IRELAND, tuitionFeeUSD: 12000, type: 'Technological University', degreeLevels: ['Undergraduate', 'Postgraduate'], courses: ['Software Development'] },
  { _id: 'u4', name: 'University of Toronto', city: 'Toronto', country: CANADA, rankingNum: 25, requirementsSource: 'University website', minIeltsScore: 6.5, minGpaPercent: 70, rankingSource: 'QS World University Rankings 2027', tuitionFeeUSD: 45000, type: 'PUBLIC', degreeLevels: ['Bachelors', 'Masters', 'PhD'], courses: ['Computer Science'] },
  { _id: 'u5', name: 'Official Data University', city: 'Boston', country: CANADA, rankingNum: 300, rankingSource: 'QS World University Rankings 2027', tuitionFeeUSD: 30000, graduateTuitionUSD: 52000, type: 'PRIVATE', degreeLevels: ['Bachelors', 'Masters'], courses: ['Computer Science'] },
];

const mockUserFindById = jest.fn();
const mockUserUpdate = jest.fn();

jest.mock('../models/University', () => ({
  find: () => ({ select: () => ({ lean: async () => mockUniversities.map((u) => ({ ...u })) }) }),
}));
jest.mock('../models/Country', () => ({
  find: () => ({ select: () => ({ lean: async () => [{ _id: 'c-ie', name: 'Ireland' }, { _id: 'c-ca', name: 'Canada' }] }) }),
}));
jest.mock('../models/Course', () => ({ find: () => ({ lean: async () => [] }) }));
jest.mock('../models/User', () => ({
  findById: (...a) => mockUserFindById(...a),
  findByIdAndUpdate: (...a) => mockUserUpdate(...a),
}));

const controller = require('../controllers/shortlistController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const shortlist = async (body) => {
  const res = makeRes();
  await controller.generateShortlist({ body: { streamMajor: 'Computer Science', ...body } }, res);
  return res.json.mock.calls[0][0];
};

beforeEach(() => {
  controller.clearShortlistCache();
  mockUserFindById.mockReset();
  mockUserUpdate.mockReset();
});

test('filter options for a country list that country\'s real cities, not the student\'s home states', async () => {
  const res = makeRes();
  await controller.getFilterOptions({ query: { country: 'Ireland' } }, res);
  const data = res.json.mock.calls[0][0];
  expect(data.cities).toEqual([{ name: 'Galway', count: 2 }, { name: 'Dublin', count: 1 }]);
  expect(data.countries.map((c) => c.name).sort()).toEqual(['Canada', 'Ireland']);
  expect(data.universityTypes.map((t) => t.value)).toEqual(['public', 'technological']);
  // "Undergraduate"/"Postgraduate" count as Bachelor's/Master's
  expect(data.degreeLevels.find((d) => d.value === 'masters').count).toBe(3);
});

test('city filter returns only that city in the chosen country', async () => {
  const data = await shortlist({ targetCountry: 'Ireland', city: 'galway' });
  expect(data.universities.map((u) => u.name).sort()).toEqual(['Atlantic Technological University', 'University of Galway']);
});

test('ranking filter counts only official ranks (Galway has an unverified placeholder rank)', async () => {
  const data = await shortlist({ targetCountry: 'Ireland', maxRank: 500 });
  expect(data.universities.map((u) => u.name)).toEqual(['Trinity College Dublin']);
  expect(data.universities[0]).toMatchObject({ rank: '80', rankingSource: 'QS World University Rankings 2027' });
});

test('requirements and acceptance rate are only shown when official', async () => {
  const data = await shortlist({ targetCountry: 'Canada' });
  const toronto = data.universities.find((u) => u.name === 'University of Toronto');
  const other = data.universities.find((u) => u.name === 'Official Data University');
  expect(toronto).toMatchObject({ minIeltsScore: 6.5, minGpaPercent: 70, requirementsSource: 'University website' });
  expect(other).toMatchObject({ minIeltsScore: null, minGpaPercent: null, eligibility: null, acceptanceRate: null, requirementsSource: null });
  expect(other.estimatedRequirements.ielts).toBeGreaterThan(0);
});

test('degree, type, tuition and study-area filters combine', async () => {
  expect((await shortlist({ targetCountry: 'Ireland', universityType: 'technological' })).universities.map((u) => u.name))
    .toEqual(['Atlantic Technological University']);
  expect((await shortlist({ targetCountry: 'Ireland', degreeLevel: 'phd' })).universities.map((u) => u.name))
    .toEqual(['Trinity College Dublin']);
  expect((await shortlist({ targetCountry: 'Ireland', maxTuitionUSD: 20000 })).universities.map((u) => u.name).sort())
    .toEqual(['Atlantic Technological University', 'University of Galway']);
  expect((await shortlist({ targetCountry: 'Ireland', studyArea: 'health' })).universities.map((u) => u.name))
    .toEqual(['University of Galway']);
});

test('unknown filter values are ignored instead of emptying the list', async () => {
  const data = await shortlist({ targetCountry: 'Ireland', degreeLevel: 'astronaut', universityType: '$where' });
  expect(data.universities).toHaveLength(3);
});

test('saving the profile requires a field of study and destination, and clamps numbers', async () => {
  const res400 = makeRes();
  await controller.saveMyShortlistProfile({ user: { id: 'stu1' }, body: { gpaPercent: 80 } }, res400);
  expect(res400.status).toHaveBeenCalledWith(400);
  expect(mockUserUpdate).not.toHaveBeenCalled();

  mockUserUpdate.mockReturnValue({ select: () => ({ lean: async () => ({ shortlistProfile: { ok: true } }) }) });
  const res = makeRes();
  await controller.saveMyShortlistProfile({
    user: { id: 'stu1' },
    body: { streamMajor: 'Data Science', targetCountry: 'Ireland', gpaPercent: '250', greScore: -5, role: 'admin' },
  }, res);
  const [id, update] = mockUserUpdate.mock.calls[0];
  expect(id).toBe('stu1');
  expect(update.$set.shortlistProfile).toMatchObject({ streamMajor: 'Data Science', targetCountry: 'Ireland', gpaPercent: 100, greScore: 0 });
  expect(update.$set.role).toBeUndefined();
  expect(update.$set.dreamCountry).toBe('Ireland');
  expect(res.json).toHaveBeenCalledWith({ success: true, profile: { ok: true } });
});

test("Master's applicants see graduate tuition, Bachelor's applicants the undergraduate figure", async () => {
  const pickUni = (data) => data.universities.find((u) => u.name === 'Official Data University');
  expect(pickUni(await shortlist({ targetCountry: 'Canada', targetDegree: "Master's" })).tuitionFeeUSD).toBe(52000);
  expect(pickUni(await shortlist({ targetCountry: 'Canada', targetDegree: "Bachelor's" })).tuitionFeeUSD).toBe(30000);
  // The max-tuition filter uses the same, degree-specific fee
  expect(pickUni(await shortlist({ targetCountry: 'Canada', targetDegree: "Master's", maxTuitionUSD: 40000 }))).toBeUndefined();
  expect(pickUni(await shortlist({ targetCountry: 'Canada', targetDegree: "Bachelor's", maxTuitionUSD: 40000 }))).toBeDefined();
});
