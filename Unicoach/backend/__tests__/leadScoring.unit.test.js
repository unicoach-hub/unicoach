// A lead booked straight from the site must be scored on its own details, not on an empty profile.
const mockScoreLeadAI = jest.fn();

jest.mock('../models/Lead', () => {
  function Lead(data) { Object.assign(this, data); this._id = 'new-lead'; this.save = jest.fn(async () => this); }
  Lead.findOne = jest.fn();
  Lead.find = jest.fn(() => []);
  Lead.updateMany = jest.fn();
  return Lead;
});
jest.mock('../models/User', () => ({}));
jest.mock('../models/SupportRequest', () => ({ create: jest.fn() }));
jest.mock('../utils/twilio', () => ({ sendOtp: jest.fn(), normalizePhone: (p) => p }));
jest.mock('../utils/email', () => ({ sendEmail: jest.fn() }));
jest.mock('../utils/aiService', () => ({ scoreLeadAI: (...a) => mockScoreLeadAI(...a) }));

const { bookConsultation } = require('../controllers/leadController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const booking = {
  name: 'Ravi Kumar',
  email: 'ravi@example.com',
  phone: '+919876543210',
  destination: 'Canada',
  query: 'Masters in Computer Science',
  source: 'book-consultation',
};

beforeEach(() => mockScoreLeadAI.mockReset());

test('the scorer is handed the lead itself, so it can read the name and country', async () => {
  mockScoreLeadAI.mockResolvedValue({ score: 82, category: 'Hot' });

  await bookConsultation({ body: booking }, makeRes());

  expect(mockScoreLeadAI).toHaveBeenCalledTimes(1);
  const arg = mockScoreLeadAI.mock.calls[0][0];
  expect(arg).toHaveProperty('lead');
  expect(arg.lead.name).toBe('Ravi Kumar');
  expect(arg.lead.dreamCountry).toBe('Canada');
});

test('the score it returns is written onto the lead', async () => {
  mockScoreLeadAI.mockResolvedValue({ score: 82, category: 'Hot' });

  const res = makeRes();
  await bookConsultation({ body: booking }, res);

  expect(res.status).toHaveBeenCalledWith(201);
  const saved = mockScoreLeadAI.mock.calls[0][0].lead;
  expect(saved.aiScoring).toMatchObject({ score: 82, category: 'Hot' });
});

test('a scorer that blows up does not stop the booking', async () => {
  mockScoreLeadAI.mockRejectedValue(new Error('AI is down'));

  const res = makeRes();
  await bookConsultation({ body: booking }, res);

  expect(res.status).toHaveBeenCalledWith(201);
});
