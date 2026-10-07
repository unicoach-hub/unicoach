// Question banks and scoring helpers for the free Duolingo English Test (DET) practice.
// Each attempt draws a fresh random set, so a retake is never the same test.

// Read & Select: real English words...
export const REAL_WORDS = [
  'achieve', 'library', 'honest', 'fragile', 'distance', 'consider', 'weather', 'abundant',
  'journey', 'measure', 'pursue', 'climate', 'eager', 'harvest', 'gentle', 'improve',
  'village', 'silent', 'reason', 'travel', 'compare', 'narrow', 'ancient', 'balance',
  'capture', 'decide', 'empty', 'famous', 'garden', 'hollow', 'invite', 'kitchen',
  'lonely', 'market', 'native', 'option', 'patient', 'quarter', 'rescue', 'shallow',
  'tender', 'unique', 'valley', 'wander', 'brief', 'curious', 'damage', 'effort',
  'frozen', 'glimpse', 'humble', 'island', 'jealous', 'liquid', 'modest', 'notice',
  'puzzle', 'rival', 'sudden', 'thrive', 'vivid', 'wisdom', 'scholar', 'campus',
];

// ...and invented words that only look English (the real test mixes these in too)
export const FAKE_WORDS = [
  'drosk', 'flumbert', 'grovash', 'trelk', 'blorish', 'quindle', 'vamble', 'cresp',
  'dworl', 'mivish', 'thorm', 'yarvel', 'brintle', 'dresh', 'fendrel', 'glapse',
  'hurken', 'jostrel', 'klimper', 'lurdish', 'morvant', 'quoster', 'tromble', 'fusp',
  'gorlen', 'pravish', 'stemble', 'crondle', 'nolvish', 'bretful', 'darnow', 'plindor',
];

// Fill in the Blanks ("Read and Complete"): {word} = a word whose second half is missing
export const PARAGRAPHS = [
  {
    id: 'study-abroad',
    text: 'Many students choose to study abroad because it {gives} them a chance to {experience} a new culture. Living in another {country} also helps them {become} more independent and {confident}. However, the first few {weeks} can be difficult, so it is {important} to plan {ahead}.',
  },
  {
    id: 'library',
    text: 'The university library is one of the {busiest} places on campus. Students {come} here to read, {research} and prepare for their {exams}. Most libraries now offer {online} books as well, so students can {study} from home when the {building} is {closed}.',
  },
  {
    id: 'part-time',
    text: 'Working part time can help {students} pay for their daily {expenses}. A job also {teaches} useful skills such as {communication} and time {management}. Still, it is {better} not to work too many {hours}, because {studies} should come first.',
  },
];

// Listen & Type: read aloud by the browser's voice
export const LISTENING_SENTENCES = [
  'The library is open until nine on weekdays.',
  'Please submit your application before the deadline.',
  'Most students share an apartment near the campus.',
  'The lecture has been moved to the main hall.',
  'She received a scholarship to study engineering.',
  'You will need a passport and a bank statement.',
  'The bus to the university leaves every ten minutes.',
  'International students can work part time during the term.',
];

// Write About the Photo: our own site photos; the description is only sent to the AI rater
export const PHOTOS = [
  {
    id: 'library',
    src: '/images/story_step2_sop.webp',
    description: 'A young woman with glasses writes notes at a table in a library, next to an open laptop and a coffee mug; bookshelves and a large window are behind her.',
  },
  {
    id: 'campus',
    src: '/images/story_step3_loans.webp',
    description: 'Two students sit on the grass in front of a red-brick university building; one holds a blue document and the other a laptop, with trees and other students around.',
  },
  {
    id: 'airport',
    src: '/images/story_step4_visa.webp',
    description: 'A smiling young woman with a backpack stands at an airport departure gate holding a passport, with planes and departure boards visible through large windows.',
  },
  {
    id: 'counselling',
    src: '/images/counselor_student_meeting.webp',
    description: 'A counsellor in a saree talks with a young man who has a laptop, at a desk in a bright office with a city view.',
  },
];

export const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const sample = (list, count) => shuffle(list).slice(0, count);

// One Read & Select round: 8 real words + 6 invented ones, mixed
export const makeWordRound = () => shuffle([
  ...sample(REAL_WORDS, 8).map((word) => ({ word, real: true })),
  ...sample(FAKE_WORDS, 6).map((word) => ({ word, real: false })),
]);

// "{weeks}" -> shows "we", the student types "eks"
export const parseParagraph = (text) => text
  .split(/(\{[a-z]+\})/i)
  .filter(Boolean)
  .map((part, idx) => {
    const match = part.match(/^\{([a-z]+)\}$/i);
    if (!match) return { type: 'text', key: `t${idx}`, value: part };
    const word = match[1];
    const shown = Math.ceil(word.length / 2);
    return { type: 'blank', key: `b${idx}`, word, prefix: word.slice(0, shown), missing: word.slice(shown) };
  });

const wordsOf = (text) => text.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/).filter(Boolean);

// Share of the sentence's words the student typed (any order, each word counted once)
export const wordAccuracy = (expected, typed) => {
  const target = wordsOf(expected);
  const pool = wordsOf(typed);
  let hits = 0;
  for (const word of target) {
    const at = pool.indexOf(word);
    if (at >= 0) {
      hits += 1;
      pool.splice(at, 1);
    }
  }
  return target.length ? hits / target.length : 0;
};

// Practice estimate on the DET scale (10-160, steps of 5). Not an official score.
export const estimateScore = (accuracy) => {
  const clamped = Math.min(1, Math.max(0, accuracy));
  return Math.min(160, Math.max(10, Math.round((10 + clamped * 150) / 5) * 5));
};
