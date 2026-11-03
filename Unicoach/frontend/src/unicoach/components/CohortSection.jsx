import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TEAM_MENTORS } from '../../utils/teamMentors';
import { StationSign } from '../../components/desi/DesiKit';

// Real free sessions run by our team mentors (titles and dates from their published events)
const SESSIONS = {
  Prachi: { title: 'Study in Ireland: Cyber Security Masters', subtitle: 'Cyber Security Masters, tech hubs and high-demand jobs in Ireland.' },
  Manan: { title: 'Study in Australia 2026', subtitle: 'Complete roadmap to Go8 universities, student visas and PR.' },
  Nitya: { title: 'Ireland Career Roadmap 2027', subtitle: 'From job search to getting settled after your studies.' },
  Manvi: { title: 'Europe Scholarships & Sponsorship', subtitle: 'How to study in Europe with scholarships and sponsorship.' },
  'Munish Rana': { title: 'Ask a Visa Expert: Ireland', subtitle: 'Your Ireland study, work and family visa questions answered live.' },
};

const COHORTS = TEAM_MENTORS.filter((m) => SESSIONS[m.name]).map((m) => ({
  id: m.name,
  title: SESSIONS[m.name].title,
  subtitle: SESSIONS[m.name].subtitle,
  statsTag: 'Free live session',
  durationTag: '15 Nov 2026',
  authorName: m.name,
  authorImage: m.src,
  brandLogoText: m.role,
  link: '/events',
}));

// Poster colour for each card's top band
const TONES = [
  { bg: '#F2B705', fg: '#16130F' },
  { bg: '#14837E', fg: '#FFFFFF' },
  { bg: '#B8285B', fg: '#FFFFFF' },
  { bg: '#2B3FA0', fg: '#FFFFFF' },
  { bg: '#D0362E', fg: '#FFFFFF' },
];

// Grid spans so any count up to 5 fills the row width (2 wide + 3 narrow on desktop)
const spanFor = (i, n) => {
  const lg = n === 5 ? (i < 2 ? 'lg:col-span-3' : 'lg:col-span-2') : 'lg:col-span-2';
  const sm = n % 2 === 1 && i === n - 1 ? 'sm:col-span-2' : '';
  return `${sm} ${lg}`;
};

export const CohortSection = () => {
  return (
    <section className="bg-[#DE5C2B] text-white py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden select-none">

      {/* Halftone dots, as on the other Desi Pop sections */}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle,rgba(22,19,15,.12)_1.3px,transparent_1.7px)] [background-size:12px_12px] pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="max-w-3xl text-left mb-10 sm:mb-12">
          <StationSign hi="Free mein seekho, live" en="LIVE SESSIONS" className="-rotate-2" />
          <h2 className="mt-6 font-urbanist text-[34px] sm:text-[48px] lg:text-[56px] font-black text-white tracking-[-0.045em] leading-[1] [text-shadow:3px_3px_0_#16130F]">
            Free live sessions with our mentors
          </h2>
          <p className="mt-4 text-white text-[16px] sm:text-[18px] leading-relaxed font-medium">
            Join a session, ask your questions live, then book 1:1 time with the mentor who fits your plans.
          </p>
        </div>

        {/* Session cards: a grid that fills the width, no sideways scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 sm:gap-6">
          {COHORTS.map((cohort, i) => {
            const tone = TONES[i % TONES.length];
            return (
              <motion.div
                key={cohort.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className={`${spanFor(i, COHORTS.length)} min-w-0 bg-white text-[#16130F] rounded-[20px] border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] flex flex-col overflow-hidden text-left transition-transform duration-300 hover:-translate-y-1 group`}
              >
                {/* Coloured top band with tags */}
                <div className="px-5 sm:px-6 pt-5 pb-4 border-b-[3px] border-[#16130F]" style={{ background: tone.bg, color: tone.fg }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-white text-[#16130F] text-[12.5px] font-extrabold px-2.5 py-1 rounded-md border-2 border-[#16130F]">
                      <Radio className="w-3.5 h-3.5 text-[#D0362E]" />
                      {cohort.statsTag}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-[#16130F] text-white text-[12.5px] font-extrabold px-2.5 py-1 rounded-md border-2 border-[#16130F]">
                      <Calendar className="w-3.5 h-3.5" />
                      {cohort.durationTag}
                    </span>
                  </div>
                  <h3 className="mt-4 font-urbanist text-[22px] sm:text-[24px] font-black leading-[1.1] tracking-[-0.02em]">
                    {cohort.title}
                  </h3>
                </div>

                <div className="flex-1 flex flex-col justify-between px-5 sm:px-6 pt-4 pb-5">
                  {/* Cohort Pitch */}
                  <p className="text-[15px] leading-relaxed text-[#3D3830] font-medium mb-5">
                    {cohort.subtitle}
                  </p>

                  {/* Bottom Row: Mentor Avatar & View Session Link */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={cohort.authorImage}
                        alt={cohort.authorName}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#16130F] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-urbanist text-[16px] font-black text-[#16130F] leading-snug truncate">
                          {cohort.authorName}
                        </div>
                        <div className="text-[12.5px] text-[#5B544A] font-semibold truncate">
                          {cohort.brandLogoText}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={cohort.link}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#16130F] text-white text-[13px] font-bold border-2 border-[#16130F] shadow-[3px_3px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap"
                    >
                      <span>View session</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

    </section>
  );
};
