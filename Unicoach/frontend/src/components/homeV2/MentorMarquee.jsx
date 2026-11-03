import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { TEAM_MENTORS, mentorLook } from '../../utils/teamMentors';
import '../desi/desi.css';
import { RailwayBoard } from '../desi/DesiPop';

// Each half of the loop must be wider than the widest screen, otherwise a gap shows mid-loop;
// with only a few mentors the list is repeated until it is (about 260px per card incl. gap)
const MIN_LOOP_WIDTH_PX = 2200;
const CARD_SLOT_PX = 260;
// Loop speed scales with the number of cards so it always drifts at the same slow pace
const SECONDS_PER_CARD = 6;


// Poster colours that rotate through the cards (photo backdrop + CTA chip)
const CARD_TONES = [
  { soft: '#FFF1B8', chip: '#F2B705', chipFg: '#16130F' },
  { soft: '#DDF3EF', chip: '#14837E', chipFg: '#FFFFFF' },
  { soft: '#FBD9E6', chip: '#B8285B', chipFg: '#FFFFFF' },
];

const MENTOR_CARDS = TEAM_MENTORS.map((m, i) => ({
  key: `mentor-${m.name}`,
  name: m.name,
  role: m.role,
  photo: m.headshot || m.card || m.portrait || m.src,
  // Cut-out photo on a gradient when we have both; otherwise the normal photo
  ...mentorLook(m.name),
  to: '/events',
  cta: 'Free session',
  tone: CARD_TONES[i % CARD_TONES.length],
}));

const MentorCard = ({ card, isCopy = false }) => (
  <Link
    to={card.to}
    tabIndex={isCopy ? -1 : undefined}
    aria-hidden={isCopy || undefined}
    className="group w-[220px] sm:w-[240px] shrink-0 bg-white rounded-[14px] border-[3px] border-[#16130F] p-3 shadow-[5px_5px_0_#16130F] hover:shadow-[7px_7px_0_#16130F] hover:-translate-y-1 transition-all duration-200"
  >
    <div className="relative aspect-square rounded-[10px] overflow-hidden border-2 border-[#16130F]" style={{ background: card.gradient || card.tone.soft }}>
      <img
        src={card.cutout || card.photo}
        alt={isCopy ? '' : card.name}
        loading="lazy"
        className="relative w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-500 origin-bottom"
      />
    </div>
    <div className="mt-3 px-1 pb-1">
      <p className="font-urbanist font-black text-[17px] leading-tight tracking-[-0.02em] text-[#16130F] truncate">{card.name}</p>
      <p className="text-[13px] text-[#5B544A] font-medium truncate mt-0.5">{card.role || 'UniCoach mentor'}</p>
      <span
        className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border-2 border-[#16130F] text-[12.5px] font-black"
        style={{ background: card.tone.chip, color: card.tone.chipFg }}
      >
        {card.cta}
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
      </span>
    </div>
  </Link>
);

/**
 * Homepage mentors row: the three featured UniCoach mentors, drifting in a loop
 * (paused on hover).
 */
const MentorMarquee = () => {
  const cards = MENTOR_CARDS;
  const repeats = Math.max(1, Math.ceil(MIN_LOOP_WIDTH_PX / (cards.length * CARD_SLOT_PX)));
  const loopCards = Array.from({ length: repeats }, (_, round) => cards.map((card) => ({ card, round }))).flat();

  return (
    <section className="w-full max-w-full pt-5 pb-10 sm:pt-6 sm:pb-12 bg-[#FFF6E5]" aria-labelledby="home-mentors-heading">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-7">
          <div className="flex items-center gap-8">
          <div>
            {/* Hinglish kicker over an English caps label, as in the Toolkit menu */}
            <p className="font-urbanist font-extrabold text-[15px] leading-none text-[#D0362E]">Anubhavon ki suno, aage badho</p>
            <p className="mt-1.5 mb-2 text-[12px] font-black text-[#16130F] uppercase tracking-[0.12em]">Real seniors · 1:1 mentorship</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <h2 id="home-mentors-heading" className="font-urbanist text-[28px] sm:text-[34px] lg:text-[40px] font-black text-[#16130F] leading-[1.05] tracking-[-0.03em]">
                Talk to seniors who&apos;ve <span className="inline-block px-2 bg-[#F2B705] border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] -rotate-1" style={{ borderRadius: 8 }}>done it</span>
              </h2>
              {/* Desi Pop: the mentors' station board beside "done it", wide screens only */}
              <div className="hidden lg:block w-[170px] -my-6" aria-hidden="true">
                <RailwayBoard hi="Mentor Junction" en="MENTOR JN." codeLeft="PF 1:1" codeRight="SENIORS · LIVE" />
              </div>
            </div>
            <p className="text-[15px] sm:text-[16px] text-[#3D3830] font-medium mt-3 max-w-xl">
              Book a 1:1 call with students who got in, or join their free live sessions.
            </p>
          </div>
          </div>
          <div className="flex items-end gap-6 self-start md:self-auto">
            <Link
              to="/unicoach#mentors-grid"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#16130F] text-[14px] font-bold text-[#16130F] transition-all"
            >
              View all mentors
              <ArrowRight className="w-4 h-4 text-[#D0362E]" strokeWidth={3} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* Two identical halves, each with its own trailing gap, so translating by -50% loops seamlessly */}
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
        <div
          className="animate-marquee [&:focus-within]:[animation-play-state:paused] pt-3 pb-4"
          style={{ animationDuration: `${loopCards.length * SECONDS_PER_CARD}s` }}
        >
          {[0, 1].map((half) => (
            <div key={half} className="flex gap-4 sm:gap-5 pr-4 sm:pr-5">
              {loopCards.map(({ card, round }) => (
                <MentorCard
                  key={`${half}-${round}-${card.key}`}
                  card={card}
                  isCopy={half === 1 || round > 0}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorMarquee;
