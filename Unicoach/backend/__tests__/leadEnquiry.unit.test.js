// Service-page enquiries (education loan, visa…) must stand out in admin even for existing leads (no DB: models mocked)
const mockLeadFindOne = jest.fn();
const mockLeadFind = jest.fn();
const mockSupportCreate = jest.fn();

jest.mock('../models/Lead', () => {
  function Lead(data) { Object.assign(this, data); this._id = 'new-lead'; this.save = jest.fn(); }
  Lead.findOne = (...a) => mockLeadFindOne(...a);
  Lead.find = (...a) => mockLeadFind(...a);
  return Lead;
});
jest.mock('../models/User', () => ({}));
jest.mock('../models/SupportRequest', () => ({ create: (...a) => mockSupportCreate(...a) }));
jest.mock('../utils/twilio', () => ({ sendOtp: jest.fn(), normalizePhone: (p) => p }));
jest.mock('../utils/aiService', () => ({ scoreLeadAI: jest.fn().mockResolvedValue(null) }));
jest.mock('../utils/email', () => ({ sendEmail: jest.fn() }));

const { bookConsultation } = require('../controllers/leadController');
const { getAllLeads } = require('../controllers/adminLeadController');

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const loanEnquiry = {
  name: 'Sagar Punia',
  email: 'sagar@example.com',
  phone: '+919876543210',
  destination: 'Canada',
  query: 'Service: Education Loan Enquiry | Loan amount needed: 20–40 lakh | Admission status: Admit received',
  source: 'Education Loan Enquiry',
};

beforeEach(() => {
  [mockLeadFindOne, mockLeadFind, mockSupportCreate].forEach((m) => m.mockReset());
});

test('existing lead (e.g. created at Google login) gets the loan enquiry as its latest source', async () => {
  const existing = {
    _id: 'lead1', name: 'Sagar Punia', email: 'sagar@example.com', phone: '+919876543210',
    source: 'Login - Google', totalInquiries: 1, status: 'contacted', activities: [], save: jest.fn(),
  };
  mockLeadFindOne.mockResolvedValue(existing);

  const res = makeRes();
  await bookConsultation({ body: loanEnquiry }, res);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(existing.source).toBe('Login - Google'); // first source is kept
  expect(existing.latestSource).toBe('Education Loan Enquiry');
  expect(existing.totalInquiries).toBe(2);
  expect(existing.lastInquiryAt).toBeInstanceOf(Date);

  const request = mockSupportCreate.mock.calls[0][0];
  expect(request.category).toBe('Education Loan Assistance');
  expect(request.message).toContain('Form: Education Loan Enquiry (existing lead, enquiry #2)');
  expect(request.message).toContain('\nLoan amount needed: 20–40 lakh\nAdmission status: Admit received');
});

test('visa form maps to Visa Counseling; unknown forms stay Consultation Booking', async () => {
  mockLeadFindOne.mockResolvedValue(null);
  await bookConsultation({ body: { ...loanEnquiry, source: 'Visa & Pre-Departure Enquiry' } }, makeRes());
  await bookConsultation({ body: { ...loanEnquiry, source: 'IELTS Masterclass Booking' } }, makeRes());
  expect(mockSupportCreate.mock.calls.map((c) => c[0].category)).toEqual(['Visa Counseling', 'Consultation Booking']);
});

test('source from the public form is trimmed to 80 chars; non-strings fall back', async () => {
  mockLeadFindOne.mockResolvedValue(null);
  await bookConsultation({ body: { ...loanEnquiry, source: 'x'.repeat(500) } }, makeRes());
  await bookConsultation({ body: { ...loanEnquiry, source: { $gt: '' } } }, makeRes());
  const [first, second] = mockSupportCreate.mock.calls.map((c) => c[0].message.split('\n')[0]);
  expect(first).toBe(`Form: ${'x'.repeat(80)}`);
  expect(second).toBe('Form: Website Booking Form');
});

test('admin lead list puts the most recent enquiry first, not the oldest signup', async () => {
  const leads = [
    { _id: 'old-signup-new-enquiry', createdAt: '2026-01-01', lastInquiryAt: '2026-10-03T10:00:00Z' },
    { _id: 'new-signup', createdAt: '2026-10-01', lastInquiryAt: '2026-10-01' },
    { _id: 'legacy-no-inquiry-date', createdAt: '2026-10-02' },
  ];
  mockLeadFind.mockReturnValue({ select: () => ({ lean: async () => leads.map((l) => ({ ...l })) }) });

  const res = makeRes();
  await getAllLeads({ query: {} }, res);
  expect(res.json.mock.calls[0][0].map((l) => l._id)).toEqual(['old-signup-new-enquiry', 'legacy-no-inquiry-date', 'new-signup']);
});
