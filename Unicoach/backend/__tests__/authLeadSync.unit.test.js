const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockUpdateOne = jest.fn();
jest.mock('../models/Lead', () => ({
  findOne: (...a) => mockFindOne(...a),
  create: (...a) => mockCreate(...a),
  updateOne: (...a) => mockUpdateOne(...a)
}));

const { syncLeadFromAuth } = require('../controllers/authController');

const student = { name: 'Riya', email: 'Riya@Example.com', phone: '', role: 'user', isMentor: false };

describe('Signup / login creates a lead in the admin CRM', () => {
  beforeEach(() => { mockFindOne.mockReset(); mockCreate.mockReset(); mockUpdateOne.mockReset(); });

  test('new Google signup creates a lead', async () => {
    mockFindOne.mockResolvedValue(null);
    await syncLeadFromAuth(student, { method: 'Google', isNewAccount: true });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      email: 'riya@example.com', phone: 'Not provided', source: 'Signup - Google', status: 'new'
    }));
  });

  test('existing user logging in without a lead gets one', async () => {
    mockFindOne.mockResolvedValue(null);
    await syncLeadFromAuth(student, { method: 'Email', isNewAccount: false });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ source: 'Login - Email' }));
  });

  test('existing lead is not overwritten on a normal login', async () => {
    mockFindOne.mockResolvedValue({ _id: 'L1', phone: '+919999999999', status: 'contacted' });
    await syncLeadFromAuth(student, { method: 'Email', isNewAccount: false });
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdateOne).not.toHaveBeenCalled();
  });

  test('existing lead gets a note when the person creates an account', async () => {
    mockFindOne.mockResolvedValue({ _id: 'L1', phone: '+919999999999' });
    await syncLeadFromAuth(student, { method: 'Google', isNewAccount: true });
    expect(mockUpdateOne).toHaveBeenCalledWith({ _id: 'L1' }, expect.objectContaining({
      $push: { activities: expect.objectContaining({ comment: 'Created a UniCoach account via Google' }) }
    }));
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
