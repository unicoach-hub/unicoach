// Phone numbers reach us typed by hand; Meta wants digits with a country code.
const { toWhatsappNumber } = require('../services/whatsappSend');

describe('toWhatsappNumber', () => {
  it('adds +91 to a plain Indian mobile', () => {
    expect(toWhatsappNumber('8221056537')).toBe('918221056537');
    expect(toWhatsappNumber('98765 43210')).toBe('919876543210');
  });

  it('keeps a number that already has its country code', () => {
    expect(toWhatsappNumber('+919518657944')).toBe('919518657944');
    expect(toWhatsappNumber('+353 899588550')).toBe('353899588550');
    expect(toWhatsappNumber('+1 (415) 555-2671')).toBe('14155552671');
  });

  it('drops the trunk zero people write before a local number', () => {
    expect(toWhatsappNumber('09518657944')).toBe('919518657944');
  });

  it('understands 00 written instead of +', () => {
    expect(toWhatsappNumber('0091 9518657944')).toBe('919518657944');
  });

  it('never guesses a country code onto an international number', () => {
    // 12 digits with a + is already complete; adding 91 would send it nowhere
    expect(toWhatsappNumber('+353899588550')).toBe('353899588550');
  });

  it('returns nothing for what cannot be dialled', () => {
    expect(toWhatsappNumber('123')).toBe('');
    expect(toWhatsappNumber('')).toBe('');
    expect(toWhatsappNumber(null)).toBe('');
    expect(toWhatsappNumber(undefined)).toBe('');
    expect(toWhatsappNumber('not a phone')).toBe('');
  });

  it('refuses a number too long to be real', () => {
    expect(toWhatsappNumber('+9123456789012345678')).toBe('');
  });
});
