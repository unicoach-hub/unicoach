// Public lead form (Check Eligibility etc.): saved at once, no OTP, no SMS, no session (no DB: models are mocked)
const mockLeadFindOne = jest.fn();
const mockLeadFind = jest.fn();
const mockLeadUpdateMany = jest.fn();
const mockLeadSaved = [];
const mockSendOtp = jest.fn();
const mockUserCtor = jest.fn();

jest.mock('../models/Lead', () => {
  function Lead(data) {
    Object.assign(this, data);
    this._id = 'new-lead';
    this.save = jest.fn(async () => { mockLeadSaved.push(this); return this; });
  }
  Lead.findOne = (...a) => mockLeadFindOne(...a);
  Lead.find = (...a) => mockLeadFind(...a);
  Lead.updateMany = (...a) => mockLeadUpdateMany(...a);
  return Lead;
});
jest.mock('../models/User', () => function User(data) { mockUserCtor(data); });
jest.mock('../utils/twilio', () => ({ sendOtp: (...a) => mockSendOtp(...a), normalizePhone: (p) => p }));

const leadController = require('../controllers/leadController');
const { submitLead } = leadController;

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.cookie = jest.fn(() => res);
  return res;
};

const form = {
  name: 'Aarav Sharma', email: 'Aarav@Example.com', phone: '+919999999999',
  dreamCountry: 'UK', preferredIntake: 'Sep 2026', highestEducation: "Bachelor's", currentCity: 'Delhi, Delhi',
  source: 'check-eligibility',
};

beforeEach(() => {
  [mockLeadFindOne, mockLeadFind, mockLeadUpdateMany, mockSendOtp, mockUserCtor].forEach((m) => m.mockReset());
  mockLeadFind.mockReturnValue([]);
  mockLeadSaved.length = 0;
});

test('the OTP endpoints are gone', () => {
  expect(leadController.verifyLeadOtp).toBeUndefined();
  expect(leadController.resendLeadOtp).toBeUndefined();
});

test('new lead is saved immediately as verified, with no OTP, no SMS and no session', async () => {
  mockLeadFindOne.mockResolvedValue(null);
  const res = makeRes();
  await submitLead({ body: form }, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json.mock.calls[0][0]).toMatchObject({ success: true, leadId: 'new-lead', isRepeat: false });
  expect(res.json.mock.calls[0][0].token).toBeUndefined();
  expect(res.cookie).not.toHaveBeenCalled();
  expect(mockSendOtp).not.toHaveBeenCalled();
  expect(mockUserCtor).not.toHaveBeenCalled(); // no account is created from a public form

  expect(mockLeadSaved).toHaveLength(1);
  const lead = mockLeadSaved[0];
  expect(lead).toMatchObject({ name: 'Aarav Sharma', email: 'aarav@example.com', phone: '+919999999999', verified: true, dreamCountry: 'UK' });
  expect(lead.otp).toBeUndefined();
});

test('repeat enquiry creates a new linked lead row', async () => {
  const existing = {
    _id: 'lead1', name: 'Real Owner', email: 'owner@example.com', phone: '+919999999999',
    createdAt: new Date('2026-01-01'), verified: false, totalInquiries: 1, status: 'closed',
  };
  mockLeadFind.mockReturnValue([existing]);
  const res = makeRes();
  await submitLead({ body: { ...form, name: 'Someone Else', email: 'other@example.com' } }, res);

  expect(res.json.mock.calls[0][0]).toMatchObject({ success: true, leadId: 'new-lead', isRepeat: true });
  expect(mockLeadSaved).toHaveLength(1);
  expect(mockLeadSaved[0]).toMatchObject({
    name: 'Someone Else',
    email: 'other@example.com',
    duplicateGroupId: 'lead1',
    totalInquiries: 1,
  });
  expect(existing.name).toBe('Real Owner');
  expect(existing.email).toBe('owner@example.com');
  expect(mockLeadUpdateMany).toHaveBeenCalledWith(
    { _id: { $in: ['lead1'] } },
    { $set: { duplicateGroupId: 'lead1' } }
  );
  expect(mockSendOtp).not.toHaveBeenCalled();
});
