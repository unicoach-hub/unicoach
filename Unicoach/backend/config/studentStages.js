// A student's journey with UniCoach, step by step: walk-in → documents → application → offer →
// fees → visa. The admin moves a student along (every move is dated in stageHistory); the student and
// the mentor who referred them both see where things stand, and the student gets an email.
const PHASES = [
  { key: 'registration', label: 'Walk-in' },
  { key: 'documents', label: 'Documents' },
  { key: 'application', label: 'Application' },
  { key: 'offer', label: 'Offer' },
  { key: 'fees', label: 'Fees' },
  { key: 'visa', label: 'Visa' },
];

// outcome: 'good' | 'bad' | undefined (in progress). Keys kept from the old list where the meaning is the same.
const STUDENT_STAGES = [
  { key: 'registered', phase: 'registration', label: 'Walk-in', message: 'Welcome to UniCoach! Next, share your documents with your counsellor.' },
  { key: 'docs_pending', phase: 'documents', label: 'Documents pending', message: 'Please upload your documents from your dashboard (Messages & Documents).' },
  { key: 'docs_review', phase: 'documents', label: 'Documents received', message: 'Thanks! We have your documents and are getting your applications ready.' },
  { key: 'docs_rejected', phase: 'documents', label: 'Documents re-upload', outcome: 'bad', message: 'Some documents need to be uploaded again. Please check your dashboard messages for details.' },
  { key: 'applied', phase: 'application', label: 'Application submitted', message: 'Your university application has been submitted.' },
  { key: 'offer_received', phase: 'offer', label: 'Offer received', outcome: 'good', message: 'Congratulations, you have received an offer!' },
  { key: 'offer_accepted', phase: 'offer', label: 'Offer accepted', outcome: 'good', message: 'You have accepted your offer. Next, the university fees.' },
  { key: 'offer_rejected', phase: 'offer', label: 'Offer declined / rejected', outcome: 'bad', message: 'This application did not work out. Your counsellor will plan the next options with you.' },
  { key: 'fees_paid', phase: 'fees', label: 'Fees paid', outcome: 'good', message: 'Your fees are paid. Next, we prepare your visa file.' },
  { key: 'visa_filing', phase: 'visa', label: 'Visa file ready', message: 'Your visa file is ready.' },
  { key: 'visa_applied', phase: 'visa', label: 'Visa submitted', message: 'Your visa application has been submitted. We will update you as soon as there is a decision.' },
  { key: 'visa_approved', phase: 'visa', label: 'Visa approved', outcome: 'good', message: 'Your visa is approved. Congratulations and all the best for your journey!' },
  { key: 'visa_rejected', phase: 'visa', label: 'Visa refused', outcome: 'bad', message: 'Your visa was not approved this time. Your counsellor will guide you on the next steps.' },
];

// Stages saved before this list existed, shown as their closest new stage
const LEGACY_STAGES = {
  profile_complete: 'registered',
  counselling_done: 'docs_pending',
  shortlisting: 'docs_pending',
  docs_approved: 'docs_review',
};

const STAGE_KEYS = STUDENT_STAGES.map((s) => s.key);
const normalizeStage = (key) => (STAGE_KEYS.includes(key) ? key : LEGACY_STAGES[key] || 'registered');
const stageInfo = (key) => STUDENT_STAGES.find((s) => s.key === normalizeStage(key));
const publicStages = () => STUDENT_STAGES.map(({ key, label, phase, outcome }) => ({ key, label, phase, outcome }));

module.exports = { PHASES, STUDENT_STAGES, STAGE_KEYS, LEGACY_STAGES, normalizeStage, stageInfo, publicStages };
