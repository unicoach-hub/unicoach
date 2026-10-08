const { getZonedDateToUtc, generateDaySlots } = require('../unicoach/services/timezoneService');

// What a student in India sees for a UTC instant
const inIndia = (date) => date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });

describe('mentor slot time zones', () => {
  it('Ireland 1 PM in Irish summer time is 5:30 PM in India', () => {
    const utc = getZonedDateToUtc('2026-10-20', '13:00', 'Europe/Dublin');
    expect(utc.toISOString()).toBe('2026-10-20T12:00:00.000Z');
    expect(inIndia(utc)).toBe('5:30 pm');
  });

  it('Ireland 1 PM after the clocks go back is 6:30 PM in India', () => {
    const utc = getZonedDateToUtc('2026-10-30', '13:00', 'Europe/Dublin');
    expect(utc.toISOString()).toBe('2026-10-30T13:00:00.000Z');
    expect(inIndia(utc)).toBe('6:30 pm');
  });

  it('handles mentors behind and ahead of India', () => {
    expect(inIndia(getZonedDateToUtc('2026-11-10', '09:00', 'America/New_York'))).toBe('7:30 pm');
    expect(inIndia(getZonedDateToUtc('2026-11-10', '20:00', 'Australia/Sydney'))).toBe('2:30 pm');
  });

  it('generates a day of slots in the mentor zone with buffers', () => {
    const slots = generateDaySlots({
      dateStr: '2026-10-30', startTime: '13:00', endTime: '15:00', durationMinutes: 45, bufferMinutes: 15, ianaTimezone: 'Europe/Dublin'
    });
    expect(slots.map((s) => inIndia(s.startUtc))).toEqual(['6:30 pm', '7:30 pm']);
    expect(slots[0].endUtc - slots[0].startUtc).toBe(45 * 60 * 1000);
  });
});
