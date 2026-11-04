// The six stations of a student's journey, shared by Home's plan card and the Plan tab.
export type Station = {
  key: string;
  board: string; // railway-board name, e.g. "SHORTLIST JN."
  done: string; // shown once passed
  todo: string; // shown while upcoming
  headline: [string, string, string]; // before / highlighted word / after
  detail: string;
  cta: string;
};

export const STATIONS: Station[] = [
  {
    key: 'profile',
    board: 'PROFILE JN.',
    done: 'Ho gaya',
    todo: 'Marks, budget, goals',
    headline: ['Pehle apni ', 'profile', ' banao'],
    detail: 'Marks, budget aur goals batao, taaki sahi courses dikhein.',
    cta: 'Profile banao',
  },
  {
    key: 'shortlist',
    board: 'SHORTLIST JN.',
    done: 'Universities chun li',
    todo: '5–8 universities',
    headline: ['Ab universities ', 'shortlist', ' karo'],
    detail: '5–8 universities chuno: 2 safe, 3 match, 2 dream.',
    cta: 'Shortlist shuru karo',
  },
  {
    key: 'tests',
    board: 'IELTS JN.',
    done: 'Score aa gaya',
    todo: 'Target 6.5+',
    headline: ['Ab ', 'IELTS', ' ki taiyari karo'],
    detail: 'Zyada tar universities ko 6.5+ chahiye. Date pehle book karo.',
    cta: 'Exam plan dekho',
  },
  {
    key: 'apply',
    board: 'APPLY JN.',
    done: 'Applications gayi',
    todo: 'SOP, LOR, documents',
    headline: ['Ab ', 'applications', ' bhejo'],
    detail: 'SOP, LOR aur documents ek jagah ready karo.',
    cta: 'Documents dekho',
  },
  {
    key: 'loan',
    board: 'LOAN JN.',
    done: 'Paise ka intezaam',
    todo: 'Offer + blocked account',
    headline: ['Offer aaya, ab ', 'loan', ' dekho'],
    detail: 'Education loan aur blocked account ka plan banao.',
    cta: 'Loan options',
  },
  {
    key: 'visa',
    board: 'VISA JN.',
    done: 'Visa lag gaya',
    todo: 'Appointment se stamp tak',
    headline: ['Aakhri station: ', 'visa', ''],
    detail: 'Appointment, documents aur interview ki taiyari.',
    cta: 'Visa checklist',
  },
];

// The counsellor moves a student along in the admin (journeyStage, backend config/studentStages.js).
// Once they're past walk-in, that stage wins; before that, a 5+ shortlist moves Shortlist → IELTS.
const STAGE_TO_STATION: Record<string, number> = {
  docs_pending: 3,
  docs_review: 3,
  docs_rejected: 3,
  applied: 3,
  offer_received: 4,
  offer_accepted: 4,
  offer_rejected: 3,
  fees_paid: 4,
  visa_filing: 5,
  visa_applied: 5,
  visa_approved: 5,
  visa_rejected: 5,
};

export function currentStation({ savedCount, profileCompleted, journeyStage }: { savedCount: number; profileCompleted?: boolean; journeyStage?: string }) {
  const fromStage = journeyStage ? STAGE_TO_STATION[journeyStage] : undefined;
  if (fromStage !== undefined) return fromStage;
  if (!profileCompleted) return 0;
  return savedCount >= 5 ? 2 : 1;
}

// Shortlist headline names the student's country: "Germany ke liye universities chuno"
export function headlineFor(station: Station, country?: string): [string, string, string] {
  if (station.key === 'shortlist' && country) return [`${country} ke liye `, 'universities', ' chuno'];
  return station.headline;
}
