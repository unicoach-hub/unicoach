// Real UniCoach mentors whose photos appear around the site (hero cards, Priority DM page,
// homepage mentors row). They also host our free events.
export const TEAM_MENTORS = [
  {
    name: 'Prachi',
    role: 'Cyber Security Expert · Ireland',
    src: '/images/mentors/thumbs/prachi_cybersecurity.webp',
    portrait: '/images/mentors/prachi_portrait.webp',
  },
  {
    name: 'Rishi',
    role: 'Career Guide Expert · Ireland',
    src: '/images/mentors/thumbs/rishi_ireland_career.webp',
    portrait: '/images/mentors/rishi_portrait.webp',
  },
  {
    name: 'Manan',
    role: 'Australia Expert',
    src: '/images/mentors/thumbs/manan_australia.webp',
    portrait: '/images/mentors/manan_portrait.webp',
  },
];

// "Prachi, Rishi & Manan"
export const TEAM_MENTOR_NAMES = `${TEAM_MENTORS.slice(0, -1).map((m) => m.name).join(', ')} & ${TEAM_MENTORS.at(-1).name}`;
