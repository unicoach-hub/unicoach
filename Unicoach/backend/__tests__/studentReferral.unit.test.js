const mockMentorFindOne = jest.fn();
const mockUserUpdateOne = jest.fn();

jest.mock('../unicoach/models/UnicoachMentor', () => ({
  findOne: (...args) => mockMentorFindOne(...args),
}));
jest.mock('../models/User', () => ({
  updateOne: (...args) => mockUserUpdateOne(...args),
}));

const { applyReferral } = require('../services/studentJourney');

beforeEach(() => {
  mockMentorFindOne.mockReset();
  mockUserUpdateOne.mockReset();
});

test('links a student through an active mentor referral while mentor approval is pending', async () => {
  const mentor = { _id: 'mentor-1', name: 'Kalki', handle: 'kalki', userId: 'mentor-user' };
  mockMentorFindOne.mockReturnValue({
    select: () => ({ lean: async () => mentor }),
  });
  mockUserUpdateOne.mockResolvedValue({ modifiedCount: 1 });

  await expect(applyReferral('student-1', '@Kalki')).resolves.toBe(mentor);
  expect(mockMentorFindOne).toHaveBeenCalledWith({ handle: 'kalki', active: { $ne: false } });
  expect(mockUserUpdateOne).toHaveBeenCalledWith(
    { _id: 'student-1', referredBy: { $exists: false } },
    { $set: { referredBy: 'mentor-1', referredAt: expect.any(Date) } }
  );
});

test('does not allow a mentor to refer their own account', async () => {
  mockMentorFindOne.mockReturnValue({
    select: () => ({ lean: async () => ({ _id: 'mentor-1', userId: 'student-1' }) }),
  });

  await expect(applyReferral('student-1', 'kalki')).resolves.toBeNull();
  expect(mockUserUpdateOne).not.toHaveBeenCalled();
});
