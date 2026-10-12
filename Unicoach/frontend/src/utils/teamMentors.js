// Real UniCoach mentors whose photos appear around the site (hero cards, Priority DM page,
// homepage mentors row). They also host our free events.
export const TEAM_MENTORS = [
  {
    name: 'Prachi',
    focus: "Cyber Security Masters in Ireland, Ireland's tech hubs and the roles in demand after graduation.",
    role: 'Cyber Security Expert · Ireland',
    country: 'Ireland',
    src: '/images/mentors/thumbs/prachi_cybersecurity.webp',
    portrait: '/images/mentors/prachi_portrait.webp',
    // Homepage mentor card: portrait on a colour band
    card: '/images/mentors/cards/prachi.webp',
  },
  {
    name: 'Nitya',
    focus: "Job search in Ireland after your studies: CVs for Irish employers, Stamp 1G and work permits, getting settled.",
    role: 'Career Guide Expert · Ireland',
    country: 'Ireland',
    src: '/images/mentors/thumbs/nitya_ireland_career.webp',
    portrait: '/images/mentors/nitya_portrait.webp',
    // Homepage mentor card: portrait on a colour band
    card: '/images/mentors/cards/nitya.webp',
  },
  {
    name: 'Manan',
    focus: "Australia from start to finish: Go8 universities, student visas, jobs while studying and PR pathways.",
    role: 'Australia Expert',
    country: 'Australia',
    src: '/images/mentors/thumbs/manan_australia.webp',
    portrait: '/images/mentors/manan_portrait.webp',
    // Homepage mentor card: portrait on a colour band
    card: '/images/mentors/cards/manan.webp',
  },
  {
    name: 'Manvi',
    focus: "Studying in Europe on a budget: scholarships, sponsorship options and picking the right country.",
    role: 'Europe Guidance Expert',
    country: 'Europe',
    src: '/images/mentors/thumbs/manvi_europe.webp',
    portrait: '/images/mentors/manvi_portrait.webp',
    // Homepage mentor card: portrait on a colour band
    card: '/images/mentors/cards/manvi.webp',
  },
  {
    name: 'Munish Rana',
    focus: "Ireland visas made simple: study and work visas, application guidance, family reunification and long-term planning.",
    role: 'Visa Consultant & Expert · Ireland',
    country: 'Ireland',
    src: '/images/mentors/thumbs/munish_rana.webp',
    portrait: '/images/mentors/munish_portrait.webp',
    card: '/images/mentors/cards/munish.webp',
  },
];

// "Prachi, Nitya, Manan, Manvi & Munish" (first names, for the hero line)
const firstName = (m) => m.name.split(' ')[0];
export const TEAM_MENTOR_NAMES = `${TEAM_MENTORS.slice(0, -1).map(firstName).join(', ')} & ${firstName(TEAM_MENTORS.at(-1))}`;
