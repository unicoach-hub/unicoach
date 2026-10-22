// Paid consultation booking: open slots, holding a slot, verifying payment (DB and Razorpay mocked)
jest.mock('../models/Consultation');
jest.mock('../unicoach/services/paymentService', () => ({
  createRazorpayOrder: jest.fn(async () => ({ orderId: 'order_test_1', amount: 50000, currency: 'INR', keyId: 'rzp_test_x' })),
  verifyRazorpayPayment: jest.fn(async () => ({ verified: true })),
}));
jest.mock('../utils/email', () => ({ sendEmail: jest.fn(async () => ({})) }));

const Consultation = require('../models/Consultation');
const { createRazorpayOrder, verifyRazorpayPayment } = require('../unicoach/services/paymentService');
const ctrl = require('../controllers/consultationController');
const { SLOT_TIMES, PRICE_INR } = require('../config/consultations');

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};
const lean = (v) => ({ select: () => ({ lean: async () => v }) });
const futureDate = (days = 3) => new Date(Date.now() + days * 864e5 + 5.5 * 3600e3).toISOString().slice(0, 10);

beforeEach(() => jest.clearAllMocks());

test('config lists services at one price and hides taken slots', async () => {
  const d = futureDate(2);
  Consultation.find.mockReturnValue(lean([{ date: d, time: '13:00' }]));
  const res = mockRes();
  await ctrl.getConfig({}, res);
  const body = res.json.mock.calls[0][0];
  expect(body.price).toBe(PRICE_INR);
  expect(body.services.length).toBeGreaterThan(3);
  const day = body.days.find((x) => x.date === d);
  expect(day.slots).not.toContain('13:00');
  expect(day.slots).toEqual(SLOT_TIMES.filter((t) => t !== '13:00'));
});

test('create rejects a slot outside 1-3 pm / 8-9 pm', async () => {
  const res = mockRes();
  await ctrl.create({ body: { service: 'visa', date: futureDate(), time: '10:00', name: 'A', email: 'a@b.co', phone: '9876543210' } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(createRazorpayOrder).not.toHaveBeenCalled();
});

test('create refuses a slot someone already holds', async () => {
  Consultation.exists.mockResolvedValue(true);
  const res = mockRes();
  await ctrl.create({ body: { service: 'visa', date: futureDate(), time: '20:00', name: 'A', email: 'a@b.co', phone: '9876543210' } }, res);
  expect(res.status).toHaveBeenCalledWith(409);
});

test('create holds the slot and opens a ₹500 order', async () => {
  Consultation.exists.mockResolvedValue(null);
  Consultation.create.mockResolvedValue({});
  const res = mockRes();
  await ctrl.create({ body: { service: 'sop', date: futureDate(), time: '14:30', name: 'Asha', email: 'Asha@x.co', phone: '+91 98765 43210' } }, res);
  expect(res.status).toHaveBeenCalledWith(201);
  expect(createRazorpayOrder).toHaveBeenCalledWith(expect.objectContaining({ amountINR: 500 }));
  const saved = Consultation.create.mock.calls[0][0];
  expect(saved).toMatchObject({ service: 'sop', time: '14:30', amountINR: 500, email: 'asha@x.co' });
  expect(saved.payment.orderId).toBe('order_test_1');
});

test('verify confirms the call after a good payment', async () => {
  const doc = { ref: 'CONS-1', status: 'payment_pending', amountINR: 500, payment: { orderId: 'order_test_1' }, date: futureDate(), time: '13:30', name: 'A', email: 'a@b.co', serviceLabel: 'Visa guidance', durationMin: 30, save: jest.fn() };
  Consultation.findOne.mockResolvedValue(doc);
  const res = mockRes();
  await ctrl.verify({ params: { ref: 'CONS-1' }, body: { razorpay_order_id: 'order_test_1', razorpay_payment_id: 'pay_1', razorpay_signature: 'sig' } }, res);
  expect(verifyRazorpayPayment).toHaveBeenCalledWith(expect.objectContaining({ expectedAmountINR: 500 }));
  expect(doc.status).toBe('confirmed');
  expect(doc.payment.paymentId).toBe('pay_1');
  expect(res.json).toHaveBeenCalledWith({ ok: true, ref: 'CONS-1' });
});

test('verify rejects a payment for a different order', async () => {
  Consultation.findOne.mockResolvedValue({ status: 'payment_pending', payment: { orderId: 'order_A' } });
  const res = mockRes();
  await ctrl.verify({ params: { ref: 'X' }, body: { razorpay_order_id: 'order_B' } }, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(verifyRazorpayPayment).not.toHaveBeenCalled();
});
