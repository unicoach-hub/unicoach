// Paid consultation calls with the UniCoach team (/book-consultation).
// Every service is the same price; slots are in India time.

const PRICE_INR = 500;
const DURATION_MIN = 30;

const SERVICES = [
  { key: 'counselling', label: 'Study abroad counselling', desc: 'Country, course and budget: where to start' },
  { key: 'shortlist', label: 'University & course shortlisting', desc: 'Safe, target and dream picks for your profile' },
  { key: 'sop', label: 'SOP / LOR / resume review', desc: 'Feedback on your documents before you apply' },
  { key: 'visa', label: 'Visa guidance', desc: 'Documents, funds and interview prep' },
  { key: 'funding', label: 'Scholarships & education loan', desc: 'What you can get and how to apply' },
  { key: 'tests', label: 'IELTS / PTE / GRE guidance', desc: 'Which test, target score and a study plan' },
];

// 1 to 3 pm and 8 to 9 pm, 30-minute calls
const SLOT_TIMES = ['13:00', '13:30', '14:00', '14:30', '20:00', '20:30'];
const BOOK_AHEAD_DAYS = 21;
// A slot is held this long while the student pays; after that it opens up again
const PENDING_HOLD_MIN = 15;

// "2026-10-22" + "13:30" in IST → Date
const istToDate = (date, time) => new Date(`${date}T${time}:00+05:30`);

module.exports = { PRICE_INR, DURATION_MIN, SERVICES, SLOT_TIMES, BOOK_AHEAD_DAYS, PENDING_HOLD_MIN, istToDate };
