// Real UniCoach mentors whose photos appear around the site (hero cards, Priority DM page,
// homepage mentors row). They also host our free events.
export const TEAM_MENTORS = [
  {
    name: 'Prachi',
    role: 'Cyber Security Expert · Ireland',
    country: 'Ireland',
    src: '/images/mentors/thumbs/prachi_cybersecurity.webp',
    portrait: '/images/mentors/prachi_portrait.webp',
  },
  {
    name: 'Nitya',
    role: 'Career Guide Expert · Ireland',
    country: 'Ireland',
    src: '/images/mentors/thumbs/nitya_ireland_career.webp',
    portrait: '/images/mentors/nitya_portrait.webp',
  },
  {
    name: 'Manan',
    role: 'Australia Expert',
    country: 'Australia',
    src: '/images/mentors/thumbs/manan_australia.webp',
    portrait: '/images/mentors/manan_portrait.webp',
  },
  {
    name: 'Manvi',
    role: 'Europe Guidance Expert',
    country: 'Europe',
    src: '/images/mentors/thumbs/manvi_europe.webp',
    portrait: '/images/mentors/manvi_portrait.webp',
  },
];

// "Prachi, Nitya & Manan"
export const TEAM_MENTOR_NAMES = `${TEAM_MENTORS.slice(0, -1).map((m) => m.name).join(', ')} & ${TEAM_MENTORS.at(-1).name}`;
