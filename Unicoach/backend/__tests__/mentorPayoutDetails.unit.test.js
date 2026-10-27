jest.mock('../unicoach/services/routeService', () => ({
  ...jest.requireActual('../unicoach/services/routeService'),
  syncSettlementBank: jest.fn()
}));

const UnicoachMentor = require('../unicoach/models/UnicoachMentor');
const routeService = require('../unicoach/services/routeService');
const { updatePayoutDetails } = require('../unicoach/controllers/mentorController');

describe('updatePayoutDetails', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns saved bank details when Razorpay sync throws', async () => {
    const mentor = {
      applicationStatus: 'APPROVED',
      defaultPayoutDetails: {
        accountHolderName: 'Old Name',
        accountNumber: '123456789',
        ifscCode: 'HDFC0001234',
        bankName: 'Old Bank'
      },
      routeAccount: { accountId: 'account-id', productId: 'product-id', status: 'ACTIVATED' },
      save: jest.fn().mockResolvedValue(undefined)
    };
    UnicoachMentor.findOne = jest.fn().mockResolvedValue(mentor);
    routeService.syncSettlementBank.mockRejectedValue(new Error('Razorpay unavailable'));
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await updatePayoutDetails({
      validatedHandle: 'mentor',
      params: { handle: 'mentor' },
      body: {
        accountHolderName: 'New Name',
        accountNumber: '123456789012',
        ifscCode: 'HDFC0001234',
        bankName: 'Example Bank',
        pan: 'ABCDE1234F',
        addressLine1: '12 MG Road',
        addressLine2: '',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411001',
        phone: '9876543210'
      }
    }, res);

    expect(mentor.save).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: expect.stringContaining('Bank details were saved'),
      defaultPayoutDetails: expect.objectContaining({ accountNumber: '123456789012' }),
      routeAccount: expect.objectContaining({ lastError: 'Razorpay unavailable' })
    }));
  });
});
