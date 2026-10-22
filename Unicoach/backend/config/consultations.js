// Paid consultation calls with the UniCoach team (/book-consultation).
// Every service is the same price; slots are in India time.

const PRICE_INR = 500;
const DURATION_MIN = 30;

// group: the section on /services. points: what the call covers (shown under "Read more").
const GROUPS = [
  { key: 'plan', label: 'Plan your move' },
  { key: 'apply', label: 'Applications & tests' },
  { key: 'fund', label: 'Funding' },
  { key: 'visa', label: 'Visa & departure' },
];

const SERVICES = [
  { key: 'counselling', group: 'plan', label: 'Study abroad counselling', desc: 'Country, course and budget: where to start', points: ['Which countries fit your marks and budget', 'Course options and career outcomes', 'A month-by-month plan to your intake'] },
  { key: 'shortlist', group: 'plan', label: 'University & course shortlisting', desc: 'Safe, target and dream picks for your profile', points: ['8 to 12 universities sorted safe, target and dream', 'Entry requirements and deadlines for each', 'Fees and living costs side by side'] },
  { key: 'career', group: 'plan', label: 'Course & career choice', desc: 'Pick a course that leads to a job', points: ['Courses that match your background', 'Job demand and post-study work rules', 'Masters vs PG diploma vs bachelors'] },
  { key: 'sop', group: 'apply', label: 'SOP / LOR / resume review', desc: 'Feedback on your documents before you apply', points: ['Line-by-line feedback on your SOP', 'LOR structure and who to ask', 'A resume that fits university formats'] },
  { key: 'application', group: 'apply', label: 'Application check', desc: 'A second look before you hit submit', points: ['Every document checked against the checklist', 'Common mistakes that cause rejections', 'What to do if an offer is delayed'] },
  { key: 'tests', group: 'apply', label: 'IELTS / PTE / GRE guidance', desc: 'Which test, target score and a study plan', points: ['Which test each university accepts', 'Your target score per section', 'A study plan for the weeks you have'] },
  { key: 'funding', group: 'fund', label: 'Scholarships & education loan', desc: 'What you can get and how to apply', points: ['Scholarships you are eligible for', 'Secured vs unsecured loans and banks', 'Documents banks ask for'] },
  { key: 'budget', group: 'fund', label: 'Cost & budget planning', desc: 'Know the real cost before you go', points: ['Tuition, rent, food and travel for your city', 'Part-time work: what you can earn', 'Funds to show for the visa'] },
  { key: 'visa', group: 'visa', label: 'Visa guidance', desc: 'Documents, funds and interview prep', points: ['Visa document checklist for your country', 'Showing funds the right way', 'Mock interview questions'] },
  { key: 'departure', group: 'visa', label: 'Pre-departure & accommodation', desc: 'Housing, packing and your first weeks', points: ['Finding safe student housing', 'What to carry and what to buy there', 'Bank, SIM and registration after landing'] },
];

// 1 to 3 pm and 8 to 9 pm, 30-minute calls
const SLOT_TIMES = ['13:00', '13:30', '14:00', '14:30', '20:00', '20:30'];
const BOOK_AHEAD_DAYS = 21;
// A slot is held this long while the student pays; after that it opens up again
const PENDING_HOLD_MIN = 15;

// "2026-10-22" + "13:30" in IST → Date
const istToDate = (date, time) => new Date(`${date}T${time}:00+05:30`);

module.exports = { GROUPS, PRICE_INR, DURATION_MIN, SERVICES, SLOT_TIMES, BOOK_AHEAD_DAYS, PENDING_HOLD_MIN, istToDate };
