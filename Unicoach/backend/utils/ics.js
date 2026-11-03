// Calendar invite (.ics) for an email attachment. Gmail, Outlook and phones show "Add to calendar" for it,
// and Google Calendar adds it by itself for the organizer's and attendees' addresses.

const stamp = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
// RFC 5545 text: escape \ ; , and newlines
const text = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
// Lines longer than 75 octets are folded onto continuation lines that start with a space
const fold = (line) => {
  const out = [];
  let rest = Buffer.from(line, 'utf8');
  while (rest.length > 75) {
    let cut = 75;
    while (cut > 0 && (rest[cut] & 0xc0) === 0x80) cut -= 1; // don't split a UTF-8 character
    out.push(rest.subarray(0, cut).toString('utf8'));
    rest = Buffer.concat([Buffer.from(' '), rest.subarray(cut)]);
  }
  out.push(rest.toString('utf8'));
  return out.join('\r\n');
};

/**
 * @param {{ uid: string, start: Date, durationMin: number, summary: string, description?: string,
 *   location?: string, organizer: { name?: string, email: string }, attendees?: { name?: string, email: string }[] }} e
 * @returns {string} an iCalendar REQUEST
 */
function buildInvite(e) {
  const end = new Date(new Date(e.start).getTime() + (e.durationMin || 30) * 60000);
  const lines = [
    'BEGIN:VCALENDAR',
    'PRODID:-//UniCoach//Consultations//EN',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${e.uid}`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(e.start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${text(e.summary)}`,
    e.description ? `DESCRIPTION:${text(e.description)}` : '',
    e.location ? `LOCATION:${text(e.location)}` : '',
    `ORGANIZER;CN=${text(e.organizer.name || 'UniCoach')}:mailto:${e.organizer.email}`,
    ...(e.attendees || []).map((a) => `ATTENDEE;CN=${text(a.name || a.email)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${a.email}`),
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'TRIGGER:-PT30M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

module.exports = { buildInvite };
