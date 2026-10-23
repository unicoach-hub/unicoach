// Ready-made WhatsApp chatbot flows the admin can add from the Flows page (created switched OFF,
// so the team reviews and edits them in the builder before going live).

const SITE = 'https://www.unicoach.com';
// Counsellor students can save and call (sent as a WhatsApp contact card before handing over)
const COUNSELLOR = { name: 'UniCoach Counsellor', phone: '+919518657944' };

// Lays nodes out in columns so the builder opens tidy
const at = (col, row) => ({ x: 80 + col * 340, y: 60 + row * 170 });

function unicoachSupport() {
  const nodes = [];
  const edges = [];
  const node = (id, type, data, col, row) => nodes.push({ id, type, position: at(col, row), data });
  const link = (source, target, sourceHandle) => edges.push({
    id: `e_${source}_${sourceHandle || 'out'}_${target}`, source, target, ...(sourceHandle ? { sourceHandle } : {}),
  });

  node('start', 'start', { keywords: ['hi', 'hii', 'hello', 'hey', 'hola', 'start', 'menu', 'help', 'namaste'], matchType: 'exact' }, 0, 3);

  // Main menu
  const MENU = [
    ['consult', 'Book a consultation', '1:1 call with our team, ₹500'],
    ['mentor', 'Talk to a senior mentor', 'Students already studying abroad'],
    ['unis', 'Find universities', 'Search programs, fees and intakes'],
    ['scholar', 'Scholarships & loans', 'Funding you can apply for'],
    ['country', 'Study destinations', 'USA, UK, Canada, Ireland and more'],
    ['exams', 'IELTS / PTE / GRE', 'Which test and what score'],
    ['events', 'Events & webinars', 'Upcoming sessions'],
    ['status', 'My booking / application', 'Check where things stand'],
    ['pay', 'Payments & refunds', 'Fees, receipts, refunds'],
    ['team', 'Talk to our team', 'A counsellor will reply here'],
  ];
  node('menu', 'list', {
    text: "Hi! 👋 Welcome to *UniCoach*.\n\nWe help you study abroad with guidance from counsellors and seniors who have done it themselves.\n\nHow can we help you today? Tap *View options* below 👇",
    buttonLabel: 'View options',
    sectionTitle: 'How can we help?',
    footer: 'UniCoach · Study abroad, guided',
    rows: MENU.map(([id, label, description]) => ({ id, label, description })),
  }, 1, 3);
  link('start', 'menu');

  // "Anything else?" after each answer
  node('more', 'buttons', {
    text: 'Is there anything else we can help you with?',
    buttons: [{ id: 'menu', label: 'Main menu' }, { id: 'team', label: 'Talk to our team' }],
  }, 4, 3);
  link('more', 'menu', 'menu');

  // Link answers from the main menu
  const LINKS = [
    ['consult', 'Book a *1:1 consultation* with our team: one hour, ₹500.\n\nPick a service (counselling, shortlisting, SOP review, visa…) and a time that suits you.', 'Book now', `${SITE}/book-consultation`],
    ['mentor', 'Talk to *seniors who are already studying abroad*: ask about their university, city, costs and jobs.', 'Meet mentors', `${SITE}/unicoach`],
    ['unis', 'Search *programs across universities worldwide*: fees, intakes and entry requirements in one place.', 'Search programs', `${SITE}/search-programs`],
    ['scholar', 'See *programs that come with scholarships*, and get help with education loans from our team.', 'See scholarships', `${SITE}/scholarships`],
    ['exams', 'Not sure which English test to take, or what score you need? Our guides explain IELTS, PTE, TOEFL, GRE and more.', 'Exam guides', `${SITE}/exams`],
    ['events', 'Join our *free events and webinars* on universities, visas and scholarships.', 'See events', `${SITE}/events`],
    ['pay', 'For fees, receipts and refunds, please read our refund policy. If your issue is not covered, tap *Talk to our team*.', 'Refund policy', `${SITE}/refund-policy`],
  ];
  LINKS.forEach(([id, text, buttonLabel, url], i) => {
    node(`l_${id}`, 'link', { text, buttonLabel, url }, 2, i);
    link('menu', `l_${id}`, id);
    link(`l_${id}`, 'more');
  });

  // Study destinations
  const COUNTRIES = [
    ['usa', 'USA', 'usa'], ['uk', 'UK', 'uk'], ['canada', 'Canada', 'canada'], ['ireland', 'Ireland', 'ireland'],
    ['australia', 'Australia', 'australia'], ['germany', 'Germany', 'germany'], ['nz', 'New Zealand', 'new-zealand'],
    ['france', 'France', 'france'], ['italy', 'Italy', 'italy'], ['other', 'Other / not sure', ''],
  ];
  node('countries', 'list', {
    text: 'Which country are you interested in? 🌍',
    buttonLabel: 'Choose country',
    sectionTitle: 'Countries',
    rows: COUNTRIES.map(([id, label]) => ({ id, label })),
  }, 2, 7);
  link('menu', 'countries', 'country');
  COUNTRIES.forEach(([id, label, slug], i) => {
    const url = slug ? `${SITE}/study-abroad/${slug}` : `${SITE}/book-consultation`;
    const text = slug
      ? `Here is everything about studying in *${label}*: top universities, courses, costs, intakes and visa.`
      : 'No problem! A short call with our counsellor will help you pick the right country for your marks and budget.';
    node(`c_${id}`, 'link', { text, buttonLabel: slug ? `Study in ${label}`.slice(0, 20) : 'Book a call', url }, 3, i);
    link('countries', `c_${id}`, id);
    link(`c_${id}`, 'more');
  });

  // Talk to our team: three quick questions (saved on the Lead), then hand over to a person
  node('q_name', 'question', { text: "Sure! Before we connect you, what's your full name?", field: 'name', validate: 'text' }, 5, 1);
  node('q_country', 'question', { text: 'Thanks, {name}! Which country do you want to study in?', field: 'dreamCountry', validate: 'text' }, 5, 2);
  node('q_intake', 'question', { text: 'And when do you plan to start? (for example: September 2027)', field: 'preferredIntake', validate: 'text' }, 5, 3);
  node('handoff', 'handoff', {
    text: "Thank you, {name}! 🙌 A UniCoach counsellor will reply here shortly (Mon–Sat, 10 AM – 7 PM IST). We've also shared our counsellor's number above if you'd like to call.\n\nIf it's after hours, we'll get back to you first thing the next working day.",
  }, 5, 4);
  link('menu', 'q_name', 'team');
  link('more', 'q_name', 'team');
  link('q_name', 'q_country');
  link('q_country', 'q_intake');
  node('counsellor', 'contact', { contactName: COUNSELLOR.name, phone: COUNSELLOR.phone }, 6, 3);
  link('q_intake', 'counsellor');
  link('counsellor', 'handoff');

  // My booking / application
  node('q_status', 'question', { text: 'Please type your *booking reference* (e.g. CONS-1A2B3C4D) or the *email* you used, and our team will check it for you.', field: 'custom', customKey: 'statusQuery', validate: 'text' }, 5, 6);
  node('handoff_status', 'handoff', { text: "Thanks! We've passed this to our team. Someone will reply here with an update (Mon–Sat, 10 AM – 7 PM IST)." }, 5, 7);
  link('menu', 'q_status', 'status');
  node('counsellor_status', 'contact', { contactName: COUNSELLOR.name, phone: COUNSELLOR.phone }, 6, 6);
  link('q_status', 'counsellor_status');
  link('counsellor_status', 'handoff_status');

  return {
    name: 'UniCoach support (main menu)',
    isDefault: true, // also answers messages that match no keyword (at most once a day per person)
    nodes,
    edges,
  };
}

module.exports = { TEMPLATES: { 'unicoach-support': unicoachSupport } };
