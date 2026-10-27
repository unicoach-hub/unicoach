// University pages list intakes as "SEP'2025". Show the next time that month comes round instead,
// so a page written in 2025 never shows a past intake as open.
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const nextIntake = (name, today = new Date()) => {
  const m = MONTHS.indexOf(String(name || '').trim().slice(0, 3).toUpperCase());
  if (m < 0) return { label: name, status: 'Check dates' };
  // an intake later this year is still ahead; this month's has already started, so show next year's
  const year = today.getFullYear() + (m <= today.getMonth() ? 1 : 0);
  const label = `${MONTHS[m].charAt(0)}${MONTHS[m].slice(1).toLowerCase()} ${year}`;
  return { label, status: 'Upcoming' };
};
