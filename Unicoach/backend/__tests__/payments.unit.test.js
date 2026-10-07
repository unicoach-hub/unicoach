const crypto = require('crypto');

// Razorpay SDK is mocked: these tests never call the real API or a database
const mockPaymentsFetch = jest.fn();
const mockPaymentsCapture = jest.fn();
jest.mock('razorpay', () => jest.fn().mockImplementation(() => ({
  payments: { fetch: mockPaymentsFetch, capture: mockPaymentsCapture }
})));

const KEY_SECRET = 'unit_test_secret_123';
const WEBHOOK_SECRET = 'unit_test_webhook_secret';

const sign = (text, secret) => crypto.createHmac('sha256', secret).update(text).digest('hex');

const loadPaymentService = () => {
  jest.resetModules();
  return require('../unicoach/services/paymentService');
};

describe('Razorpay payment verification (security)', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    mockPaymentsFetch.mockReset();
    mockPaymentsCapture.mockReset();
  });

  test('simulated order is rejected in production even without keys', async () => {
    process.env.NODE_ENV = 'production';
    process.env.RAZORPAY_KEY_ID = '';
    process.env.RAZORPAY_KEY_SECRET = '';
    const { verifyRazorpayPayment } = loadPaymentService();
    const result = await verifyRazorpayPayment({ orderId: 'order_sim_123', paymentId: 'x', signature: 'y', expectedAmountINR: 499 });
    expect(result.verified).toBe(false);
  });

  test('simulated order is rejected when real keys are configured (client cannot force simulator)', async () => {
    process.env.NODE_ENV = 'development';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_abc';
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
    const { verifyRazorpayPayment } = loadPaymentService();
    const result = await verifyRazorpayPayment({ orderId: 'order_sim_123', paymentId: 'x', signature: 'y', expectedAmountINR: 499 });
    expect(result.verified).toBe(false);
  });

  test('order creation refuses to simulate in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.RAZORPAY_KEY_ID = '';
    process.env.RAZORPAY_KEY_SECRET = '';
    const { createRazorpayOrder } = loadPaymentService();
    await expect(createRazorpayOrder({ amountINR: 499, bookingRef: 'UM-T' })).rejects.toThrow(/not configured/);
  });

  test('wrong signature is rejected without calling Razorpay', async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_abc';
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
    const { verifyRazorpayPayment } = loadPaymentService();
    const result = await verifyRazorpayPayment({ orderId: 'order_1', paymentId: 'pay_1', signature: 'forged', expectedAmountINR: 499 });
    expect(result.verified).toBe(false);
    expect(mockPaymentsFetch).not.toHaveBeenCalled();
  });

  test('valid signature but tampered amount is rejected', async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_abc';
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
    mockPaymentsFetch.mockResolvedValue({ id: 'pay_1', order_id: 'order_1', amount: 100, status: 'captured' });
    const { verifyRazorpayPayment } = loadPaymentService();
    const result = await verifyRazorpayPayment({
      orderId: 'order_1', paymentId: 'pay_1', signature: sign('order_1|pay_1', KEY_SECRET), expectedAmountINR: 499
    });
    expect(result.verified).toBe(false);
  });

  test('payment from a different order is rejected', async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_abc';
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
    mockPaymentsFetch.mockResolvedValue({ id: 'pay_1', order_id: 'order_OTHER', amount: 49900, status: 'captured' });
    const { verifyRazorpayPayment } = loadPaymentService();
    const result = await verifyRazorpayPayment({
      orderId: 'order_1', paymentId: 'pay_1', signature: sign('order_1|pay_1', KEY_SECRET), expectedAmountINR: 499
    });
    expect(result.verified).toBe(false);
  });

  test('valid captured payment is accepted and returns the payment entity (fee/tax for the split)', async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_abc';
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
    const entity = { id: 'pay_1', order_id: 'order_1', amount: 49900, status: 'captured', fee: 1178, tax: 180 };
    mockPaymentsFetch.mockResolvedValue(entity);
    const { verifyRazorpayPayment } = loadPaymentService();
    const result = await verifyRazorpayPayment({
      orderId: 'order_1', paymentId: 'pay_1', signature: sign('order_1|pay_1', KEY_SECRET), expectedAmountINR: 499
    });
    expect(result).toEqual({ verified: true, simulated: false, payment: entity });
  });

  test('authorized payment gets captured', async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_abc';
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
    mockPaymentsFetch.mockResolvedValue({ id: 'pay_1', order_id: 'order_1', amount: 49900, currency: 'INR', status: 'authorized' });
    mockPaymentsCapture.mockResolvedValue({ id: 'pay_1', order_id: 'order_1', amount: 49900, status: 'captured', fee: 1178, tax: 180 });
    const { verifyRazorpayPayment } = loadPaymentService();
    const result = await verifyRazorpayPayment({
      orderId: 'order_1', paymentId: 'pay_1', signature: sign('order_1|pay_1', KEY_SECRET), expectedAmountINR: 499
    });
    expect(mockPaymentsCapture).toHaveBeenCalledWith('pay_1', 49900, 'INR');
    expect(result.verified).toBe(true);
  });
});

describe('Razorpay webhook signature', () => {
  const originalEnv = { ...process.env };
  afterEach(() => { process.env = { ...originalEnv }; });

  test('accepts the exact raw body signed with the secret, rejects anything else', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
    const { verifyRazorpayWebhook } = loadPaymentService();
    const raw = Buffer.from('{"event":"payment.captured","payload":{}}');
    expect(await verifyRazorpayWebhook(raw, sign(raw, WEBHOOK_SECRET))).toBe(true);
    expect(await verifyRazorpayWebhook(raw, 'forged')).toBe(false);
    // Re-serialised JSON (different bytes) must not pass
    expect(await verifyRazorpayWebhook(Buffer.from('{"event": "payment.captured", "payload": {}}'), sign(raw, WEBHOOK_SECRET))).toBe(false);
  });

  test('rejects every webhook when no secret is configured', async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = '';
    const { verifyRazorpayWebhook } = loadPaymentService();
    const raw = Buffer.from('{}');
    expect(await verifyRazorpayWebhook(raw, sign(raw, ''))).toBe(false);
  });
});

describe('Mentor payout KYC validation', () => {
  const { getPayoutKycProblems } = require('../unicoach/services/routeService');

  const validMentor = {
    phone: '+91 98765 43210',
    defaultPayoutDetails: { accountHolderName: 'Aarav Sharma', accountNumber: '123456789012', ifscCode: 'HDFC0001234' },
    kyc: { pan: 'ABCDE1234F', address: { street1: '12 MG Road', city: 'Pune', state: 'Maharashtra', postalCode: '411001' } }
  };

  test('complete details have no problems', () => {
    expect(getPayoutKycProblems(validMentor)).toEqual([]);
  });

  test('flags bad PAN, IFSC, account number and PIN', () => {
    const problems = getPayoutKycProblems({
      ...validMentor,
      defaultPayoutDetails: { accountHolderName: 'A', accountNumber: '12', ifscCode: 'HDFC1234' },
      kyc: { pan: 'ABCD1234F', address: { street1: 'x', city: 'y', state: 'z', postalCode: '01234' } }
    });
    expect(problems).toEqual(expect.arrayContaining([
      'Valid PAN', 'Valid IFSC code', 'Valid bank account number (9-18 digits)', '6-digit PIN code'
    ]));
  });
});
