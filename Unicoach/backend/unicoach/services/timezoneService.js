/**
 * Timezone & Slot Calculation Service (Pillars #2 & #12)
 * 
 * Rules:
 * 1. Database always stores strict UTC (ISO-8601).
 * 2. Slot generation accounts for mentor's local IANA timezone (e.g. Europe/Dublin, America/New_York)
 *    and converts accurately to true UTC so Indian students (Asia/Kolkata) view precise local times.
 * 3. Slot generation accounts for mandatory buffer time (e.g. 10m rest window).
 * 4. Slots respect minimum notice period (e.g. at least 2 hours before booking).
 */

/**
 * Validates whether slot start time respects mentor's minimum notice period
 * @param {Date} startUtc 
 * @param {number} noticePeriodHours 
 * @returns {boolean}
 */
const satisfiesNoticePeriod = (startUtc, noticePeriodHours = 2) => {
  const minAllowedTime = Date.now() + (noticePeriodHours * 60 * 60 * 1000);
  return new Date(startUtc).getTime() >= minAllowedTime;
};

/**
 * Convert local dateStr + timeStr in a specific IANA timezone to a true UTC Date object
 * Example:
 * 2026-10-15 21:00 in "Europe/Dublin" (UTC+1 in summer) -> 2026-10-15T20:00:00.000Z
 * When an Indian student views 2026-10-15T20:00:00.000Z in "Asia/Kolkata" (UTC+5:30):
 * it renders as 2026-10-16 01:30 AM IST (Next Day in India)!
 *
 * @param {string} dateStr YYYY-MM-DD
 * @param {string} timeStr HH:mm
 * @param {string} timeZone IANA timezone (e.g. Europe/Dublin, Asia/Kolkata, America/New_York)
 * @returns {Date}
 */
const getZonedDateToUtc = (dateStr, timeStr, timeZone = 'Asia/Kolkata') => {
  if (!timeZone || timeZone === 'UTC') {
    return new Date(`${dateStr}T${timeStr}:00Z`);
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // Naive UTC representation
  const naiveUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(naiveUtc);
    const p = {};
    for (const part of parts) {
      p[part.type] = part.value;
    }

    const zonedHour = Number(p.hour) === 24 ? 0 : Number(p.hour);
    const zonedYear = Number(p.year);
    const zonedMonth = Number(p.month);
    const zonedDay = Number(p.day);
    const zonedMinute = Number(p.minute);

    const asIfUtc = Date.UTC(zonedYear, zonedMonth - 1, zonedDay, zonedHour, zonedMinute, 0);
    const offsetMs = asIfUtc - naiveUtc.getTime();

    return new Date(naiveUtc.getTime() - offsetMs);
  } catch (e) {
    // Safe fallback if invalid timezone passed
    return new Date(`${dateStr}T${timeStr}:00Z`);
  }
};

/**
 * Generate discrete UTC slots for a day's window with buffer time
 * @param {Object} options
 * @param {string} options.dateStr YYYY-MM-DD
 * @param {string} options.startTime e.g. "10:00"
 * @param {string} options.endTime e.g. "18:00"
 * @param {number} options.durationMinutes e.g. 30
 * @param {number} options.bufferMinutes e.g. 10 (window between calls)
 * @param {string} options.ianaTimezone e.g. "Europe/Dublin" or "America/New_York" or "Asia/Kolkata"
 * @returns {Array<{ startUtc: Date, endUtc: Date, durationMinutes: number }>}
 */
const generateDaySlots = ({
  dateStr,
  startTime = '10:00',
  endTime = '18:00',
  durationMinutes = 30,
  bufferMinutes = 10,
  ianaTimezone = 'Asia/Kolkata'
}) => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let cursorMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const slots = [];

  while (cursorMinutes + durationMinutes <= endMinutes) {
    const startHour = Math.floor(cursorMinutes / 60);
    const startMinute = cursorMinutes % 60;

    const endCursor = cursorMinutes + durationMinutes;
    const endHour = Math.floor(endCursor / 60);
    const endMinute = endCursor % 60;

    const pad = (n) => String(n).padStart(2, '0');
    
    const startTimeFormatted = `${pad(startHour)}:${pad(startMinute)}`;
    const endTimeFormatted = `${pad(endHour)}:${pad(endMinute)}`;

    // Convert with strict IANA timezone awareness
    const startUtc = getZonedDateToUtc(dateStr, startTimeFormatted, ianaTimezone);
    const endUtc = getZonedDateToUtc(dateStr, endTimeFormatted, ianaTimezone);

    slots.push({
      startUtc,
      endUtc,
      durationMinutes
    });

    // Advance cursor by duration + buffer
    cursorMinutes += (durationMinutes + bufferMinutes);
  }

  return slots;
};

module.exports = {
  satisfiesNoticePeriod,
  getZonedDateToUtc,
  generateDaySlots
};
