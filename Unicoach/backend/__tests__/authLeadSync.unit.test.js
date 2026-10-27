const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockUpdateOne = jest.fn();
const mockUpdateMany = jest.fn();
const mockSaved = [];
jest.mock('../models/Lead', () => {
  function Lead(data) {
    Object.assign(this, data);
    this._id = 'new-lead';
    this.save = jest.fn(async () => { mockSaved.push(this); return this; });
  }
  Lead.findOne = (...a) => mockFindOne(...a);
  Lead.find = (...a) => mockFind(...a);
  Lead.updateOne = (...a) => mockUpdateOne(...a);
  Lead.updateMany = (...a) => mockUpdateMany(...a);
  return Lead;
});

const { syncLeadFromAuth } = require('../controllers/authController');

const student = { name: 'Riya', email: 'Riya@Example.com', phone: '', role: 'user', isMentor: false };

describe('Signup / login creates a lead in the admin CRM', () => {
  beforeEach(() => {
    [mockFindOne, mockFind, mockUpdateOne, mockUpdateMany].forEach((mock) => mock.mockReset());
    mockFind.mockReturnValue([]);
    mockSaved.length = 0;
  });

  test('new Google signup creates a lead', async () => {
    mockFindOne.mockResolvedValue(null);
    await syncLeadFromAuth(student, { method: 'Google', isNewAccount: true });
    expect(mockSaved[0]).toMatchObject({
      email: 'riya@example.com', phone: 'Not provided', source: 'Signup - Google', status: 'new'
    });
  });

  test('existing user logging in without a lead gets one', async () => {
    mockFindOne.mockResolvedValue(null);
    await syncLeadFromAuth(student, { method: 'Email', isNewAccount: false });
    expect(mockSaved[0]).toMatchObject({ source: 'Login - Email' });
  });

  test('existing lead is not overwritten on a normal login', async () => {
    mockFindOne.mockResolvedValue({ _id: 'L1', phone: '+919999999999', status: 'contacted' });
    await syncLeadFromAuth(student, { method: 'Email', isNewAccount: false });
    expect(mockSaved).toHaveLength(0);
    expect(mockUpdateOne).not.toHaveBeenCalled();
  });

  test('account creation creates a new row linked to the existing lead', async () => {
    const existing = { _id: 'L1', phone: '+919999999999', createdAt: new Date('2026-01-01') };
    mockFindOne.mockResolvedValue(existing);
    mockFind.mockReturnValue([existing]);
    await syncLeadFromAuth(student, {
      method: 'Google',
      isNewAccount: true,
      referralMentor: { _id: 'mentor-1', name: 'Kalki', handle: 'kalki' },
    });
    expect(mockSaved[0]).toMatchObject({
      source: 'Signup - Google',
      duplicateGroupId: 'L1',
      referralMentorId: 'mentor-1',
      referralMentorName: 'Kalki',
      referralMentorHandle: 'kalki',
    });
    expect(mockUpdateMany).toHaveBeenCalled();
  });

  test('mentors and admins are not added as leads', async () => {
    await syncLeadFromAuth({ ...student, isMentor: true }, { method: 'Google', isNewAccount: true });
    await syncLeadFromAuth({ ...student, role: 'admin' }, { method: 'Email', isNewAccount: false });
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  test('CRM failure never breaks login', async () => {
    mockFindOne.mockRejectedValue(new Error('db down'));
    await expect(syncLeadFromAuth(student, { method: 'Google', isNewAccount: true })).resolves.toBeUndefined();
  });
});
