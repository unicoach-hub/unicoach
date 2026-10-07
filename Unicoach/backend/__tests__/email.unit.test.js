// Email delivery goes through Resend only (Resend and Settings are mocked; nothing is sent)
const mockSend = jest.fn();
const mockBatchSend = jest.fn();
const mockSendMail = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({ emails: { send: mockSend }, batch: { send: mockBatchSend } })),
}));
jest.mock('../models/Settings', () => ({ findOne: jest.fn().mockResolvedValue(null) }));
jest.mock('nodemailer', () => ({ createTransport: jest.fn(() => ({ sendMail: mockSendMail, options: { auth: { user: 'team@gmail.com' } } })) }));

const ENV = { ...process.env };

beforeEach(() => {
  jest.resetModules();
  [mockSend, mockBatchSend, mockSendMail].forEach((m) => m.mockReset());
  process.env = {
    ...ENV,
    RESEND_API_KEY: 're_test_key',
    RESEND_FROM: 'UniCoach <bookings@booking.unicoach.com>',
    RESEND_DOMAIN_VERIFIED: 'true',
    EMAIL_REPLY_TO: 'unicoachedu@gmail.com',
    SMTP_USER: 'team@gmail.com',
    SMTP_PASS: 'app-password',
  };
  delete process.env.EMAIL_SMTP_FALLBACK;
});

afterAll(() => {
  process.env = ENV;
});

const load = () => require('../utils/email');

test('system emails go out from the verified domain with a real reply-to inbox', async () => {
  mockSend.mockResolvedValue({ data: { id: 'em_1' }, error: null });
  const { sendEmail } = load();
  const result = await sendEmail({ to: 'student@example.com', cc: 'admin@example.com', subject: 'Session confirmed', html: '<p>Hi</p>' });

  expect(result).toMatchObject({ messageId: 'em_1', service: 'resend' });
  const payload = mockSend.mock.calls[0][0];
  expect(payload.from).toBe('UniCoach <bookings@booking.unicoach.com>');
  expect(payload.replyTo).toBe('unicoachedu@gmail.com');
  expect(payload.cc).toEqual(['admin@example.com']);
  expect(payload.text).toBe('Hi');
  expect(mockSendMail).not.toHaveBeenCalled();
});

test("a counsellor's from address becomes the display name and reply-to, never the sender", async () => {
  mockSend.mockResolvedValue({ data: { id: 'em_2' }, error: null });
  const { sendEmail } = load();
  await sendEmail({ to: 's@example.com', from: '"Pooja Sharma" <pooja@gmail.com>', subject: 'Re: visa', html: 'x', smtpConfig: { user: 'pooja@gmail.com', pass: 'secret' } });

  const payload = mockSend.mock.calls[0][0];
  expect(payload.from).toBe('Pooja Sharma via UniCoach <bookings@booking.unicoach.com>');
  expect(payload.replyTo).toBe('pooja@gmail.com');
  expect(mockSendMail).not.toHaveBeenCalled(); // smtpConfig is ignored without EMAIL_SMTP_FALLBACK
});

test('the UI placeholder support@unicoach.in is never used as reply-to', async () => {
  mockSend.mockResolvedValue({ data: { id: 'em_3' }, error: null });
  const { sendEmail } = load();
  await sendEmail({ to: 's@example.com', from: '"Advisor" <support@unicoach.in>', subject: 's', html: 'x' });
  expect(mockSend.mock.calls[0][0].replyTo).toBe('unicoachedu@gmail.com');
});

test('a Resend failure is an error, not a silent switch to Gmail SMTP', async () => {
  mockSend.mockResolvedValue({ data: null, error: { message: 'Domain not verified', statusCode: 403 } });
  const { sendEmail } = load();
  await expect(sendEmail({ to: 's@example.com', subject: 's', html: 'x' })).rejects.toThrow('Resend: Domain not verified');
  expect(mockSendMail).not.toHaveBeenCalled();
});

test('SMTP is only used when EMAIL_SMTP_FALLBACK=true', async () => {
  process.env.EMAIL_SMTP_FALLBACK = 'true';
  mockSend.mockResolvedValue({ data: null, error: { message: 'rate limited' } });
  mockSendMail.mockResolvedValue({ messageId: 'smtp_1' });
  const { sendEmail } = load();
  const result = await sendEmail({ to: 's@example.com', subject: 's', html: 'x' });
  expect(result.messageId).toBe('smtp_1');
});

test('base64 attachments from the admin UI are passed to Resend as buffers', async () => {
  mockSend.mockResolvedValue({ data: { id: 'em_4' }, error: null });
  const { sendEmail } = load();
  await sendEmail({
    to: 's@example.com', subject: 's', html: 'x',
    attachments: [{ filename: 'offer.pdf', content: Buffer.from('PDFDATA').toString('base64'), encoding: 'base64', contentType: 'application/pdf', size: '1 KB' }],
  });
  const [att] = mockSend.mock.calls[0][0].attachments;
  expect(att.filename).toBe('offer.pdf');
  expect(att.contentType).toBe('application/pdf');
  expect(att.content.toString()).toBe('PDFDATA');
  expect(att.size).toBeUndefined();
});

test('without Resend configured, production refuses instead of dropping mail', async () => {
  process.env.RESEND_API_KEY = ''; // empty, not deleted: email.js runs dotenv, which would refill a missing key
  process.env.NODE_ENV = 'production';
  const { sendEmail } = load();
  await expect(sendEmail({ to: 's@example.com', subject: 's', html: 'x' })).rejects.toThrow('Email is not configured');
  expect(mockSendMail).not.toHaveBeenCalled();
});

test('bulk emails use the batch API in chunks of 100 and report per-recipient results', async () => {
  mockBatchSend
    .mockResolvedValueOnce({ data: { data: Array.from({ length: 100 }, (_, i) => ({ id: `b${i}` })) }, error: null })
    .mockResolvedValueOnce({ data: null, error: { message: 'quota exceeded' } });
  const { sendEmailBatch } = load();
  const messages = Array.from({ length: 103 }, (_, i) => ({ to: `s${i}@example.com`, subject: 'Hi', text: 'Body' }));
  const results = await sendEmailBatch(messages);

  expect(mockBatchSend).toHaveBeenCalledTimes(2);
  expect(mockBatchSend.mock.calls[0][0]).toHaveLength(100);
  expect(mockBatchSend.mock.calls[0][0][0]).toMatchObject({ from: 'UniCoach <bookings@booking.unicoach.com>', to: ['s0@example.com'], replyTo: 'unicoachedu@gmail.com' });
  expect(results.filter((r) => r.ok)).toHaveLength(100);
  expect(results[101]).toEqual({ ok: false, error: 'Resend: quota exceeded' });
});
