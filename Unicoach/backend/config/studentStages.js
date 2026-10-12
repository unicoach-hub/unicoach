// A student's journey with UniCoach, grouped in four phases. The admin moves a student along; the
// student and the mentor who referred them both see where things stand, and the student gets an email.
const PHASES = [
  { key: 'registration', label: 'Registration' },
  { key: 'documents', label: 'Documents' },
  { key: 'application', label: 'Application' },
  { key: 'visa', label: 'Visa' },
];

// outcome: 'good' | 'bad' | undefined (in progress)
const STUDENT_STAGES = [
  { key: 'registered', phase: 'registration', label: 'Registered', message: 'Your UniCoach account is ready. Next, share your documents with your counsellor.' },
  { key: 'docs_pending', phase: 'documents', label: 'Documents pending', message: 'Please upload your documents from your dashboard (Messages & Documents).' },
  { key: 'docs_review', phase: 'documents', label: 'Documents under review', message: 'Thanks! Your documents are being reviewed by our team.' },
  { key: 'docs_rejected', phase: 'documents', label: 'Documents rejected', outcome: 'bad', message: 'Some documents need to be uploaded again. Please check your dashboard messages for details.' },
  { key: 'docs_approved', phase: 'documents', label: 'Documents approved', outcome: 'good', message: 'Your documents are approved. Next, we submit your university applications.' },
  { key: 'applied', phase: 'application', label: 'Application submitted', message: 'Your university application has been submitted.' },
  { key: 'offer_received', phase: 'application', label: 'Offer received', outcome: 'good', message: 'Congratulations, you have received an offer! Next up: your visa.' },
  { key: 'offer_rejected', phase: 'application', label: 'Offer declined / rejected', outcome: 'bad', message: 'This application did not work out. Your counsellor will plan the next options with you.' },
  { key: 'visa_filing', phase: 'visa', label: 'Visa filing', message: 'We are preparing your visa file.' },
  { key: 'visa_applied', phase: 'visa', label: 'Visa applied', message: 'Your visa application has been submitted. We will update you as soon as there is a decision.' },
  { key: 'visa_approved', phase: 'visa', label: 'Visa approved', outcome: 'good', message: 'Your visa is approved. Congratulations and all the best for your journey!' },
  { key: 'visa_rejected', phase: 'visa', label: 'Visa rejected', outcome: 'bad', message: 'Your visa was not approved this time. Your counsellor will guide you on the next steps.' },
];

// Stages saved before this list existed, shown as their closest new stage
const LEGACY_STAGES = {
  profile_complete: 'registered',
  counselling_done: 'docs_pending',
  shortlisting: 'docs_pending',
  fees_paid: 'visa_filing',
};

const STAGE_KEYS = STUDENT_STAGES.map((s) => s.key);
const normalizeStage = (key) => (STAGE_KEYS.includes(key) ? key : LEGACY_STAGES[key] || 'registered');
const stageInfo = (key) => STUDENT_STAGES.find((s) => s.key === normalizeStage(key));
const publicStages = () => STUDENT_STAGES.map(({ key, label, phase, outcome }) => ({ key, label, phase, outcome }));

module.exports = { PHASES, STUDENT_STAGES, STAGE_KEYS, LEGACY_STAGES, normalizeStage, stageInfo, publicStages };
