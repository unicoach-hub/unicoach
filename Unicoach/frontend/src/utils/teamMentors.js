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
    // Square head-and-shoulders crop, same face size for everyone (cards, CTA, avatars)
    headshot: '/images/mentors/headshots/prachi.webp',
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
    // Square head-and-shoulders crop, same face size for everyone (cards, CTA, avatars)
    headshot: '/images/mentors/headshots/nitya.webp',
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
    // Square head-and-shoulders crop, same face size for everyone (cards, CTA, avatars)
    headshot: '/images/mentors/headshots/manan.webp',
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
    // Square head-and-shoulders crop, same face size for everyone (cards, CTA, avatars)
    headshot: '/images/mentors/headshots/manvi.webp',
  },
  {
    name: 'Rishi Gandhi',
    focus: "Studying in the USA for IT and technology: picking universities, F-1 visas, internships and building a tech career.",
    role: 'US Education & Tech Career Expert',
    country: 'USA',
    // Cropped from his event banner until a plain-background photo arrives
    src: '/images/mentors/thumbs/rishi_usa.webp',
    portrait: '/images/mentors/rishi_portrait.webp',
    card: '/images/mentors/cards/rishi.webp',
    headshot: '/images/mentors/headshots/rishi.webp',
  },
  {
    name: 'Munish Rana',
    focus: "Ireland visas made simple: study and work visas, application guidance, family reunification and long-term planning.",
    role: 'Visa Consultant & Expert · Ireland',
    country: 'Ireland',
    src: '/images/mentors/thumbs/munish_rana.webp',
    portrait: '/images/mentors/munish_portrait.webp',
    card: '/images/mentors/cards/munish.webp',
    // Square head-and-shoulders crop, same face size for everyone (cards, CTA, avatars)
    headshot: '/images/mentors/headshots/munish.webp',
  },
];

// "Prachi, Nitya, Manan, Manvi & Munish" (first names, for the hero line)
const firstName = (m) => m.name.split(' ')[0];
// Cut-out photo on a soft gradient (built from each mentor's original photo background).
// Used wherever a mentor appears as a photo card, so every card looks the same.
const MENTOR_GRADIENTS = {
  prachi: 'radial-gradient(120% 110% at 15% 0%, #FFF1EC 0%, #FFD3C6 55%, #F7AE9A 100%)',
  nitya: 'radial-gradient(120% 110% at 15% 0%, #E9F8DD 0%, #A9DB86 55%, #6FB34B 100%)',
  manan: 'radial-gradient(120% 110% at 15% 0%, #F6F3FF 0%, #DCD3FF 55%, #B7A8F5 100%)',
  manvi: 'radial-gradient(120% 110% at 15% 0%, #E8FBF8 0%, #A6E6DE 55%, #5FC4B8 100%)',
  rishi: 'radial-gradient(120% 110% at 15% 0%, #FFF3E4 0%, #FFC890 55%, #F59A52 100%)',
  munish: 'radial-gradient(120% 110% at 15% 0%, #F2A3A0 0%, #B8474A 55%, #7E2328 100%)',
};

/** { cutout, gradient } for a mentor's photo card, or nulls when we have no cut-out */
export const mentorLook = (name) => {
  const key = String(name || '').split(' ')[0].toLowerCase();
  const gradient = MENTOR_GRADIENTS[key] || null;
  return { gradient, cutout: gradient ? `/images/mentors/cutouts/${key}.webp` : null };
};

export const TEAM_MENTOR_NAMES = `${TEAM_MENTORS.slice(0, -1).map(firstName).join(', ')} & ${firstName(TEAM_MENTORS.at(-1))}`;

// UniCoach core team for the /team page. Add photo paths (e.g. '/images/team/name.webp') and names
// as they come in; a card without a photo shows the person's initials, one without a name is hidden.
export const CORE_TEAM = [
  // { name: 'Full Name', role: 'Founder & CEO', photo: '/images/team/full-name.webp', linkedin: 'https://linkedin.com/in/...' },
];
