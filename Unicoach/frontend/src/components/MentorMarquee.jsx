import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getPublicMentorsDirectory } from '../unicoach/api/unicoachApi';
import { TEAM_MENTORS } from '../utils/teamMentors';
import { toAbsoluteUrl } from '../utils/eventHelpers';

// Each half of the loop must be wider than the widest screen, otherwise a gap shows mid-loop;
// with only a few mentors the list is repeated until it is (about 260px per card incl. gap)
const MIN_LOOP_WIDTH_PX = 2200;
const CARD_SLOT_PX = 260;
// Loop speed scales with the number of cards so it always drifts at the same slow pace
const SECONDS_PER_CARD = 6;

// Demo profiles use stock photos; only mentors with their own photo are shown on the homepage
const STOCK_PHOTO = /\/\/([a-z0-9-]+\.)*(unsplash\.com|pexels\.com|randomuser\.me|pravatar\.cc|ui-avatars\.com|picsum\.photos)\//i;

// Our event hosts are always shown (their sessions are free)
const HOST_CARDS = TEAM_MENTORS.map((m) => ({
  key: `host-${m.name}`,
  name: m.name,
  role: m.role,
  photo: m.portrait || m.src,
  to: '/events',
  cta: 'Free session',
}));

// Approved mentors from the UniCoach directory open their own booking page
const toDirectoryCard = (m) => ({
  key: `mentor-${m.handle}`,
  name: m.name,
  role: [m.university || m.headline, m.country].filter(Boolean).join(' · '),
  photo: toAbsoluteUrl(m.avatarUrl),
  to: `/@${m.handle}`,
  cta: 'Book 1:1',
});

const MentorCard = ({ card, isCopy = false }) => (
  <Link
    to={card.to}
    tabIndex={isCopy ? -1 : undefined}
    aria-hidden={isCopy || undefined}
    className="group w-[220px] sm:w-[240px] shrink-0 bg-white rounded-[22px] border border-slate-200 hover:border-orange-200 p-3 shadow-[0_8px_24px_-14px_rgba(15,23,42,0.22)] hover:shadow-[0_14px_30px_-14px_rgba(15,23,42,0.3)] transition-all"
  >
    <div className="aspect-[4/3] rounded-[16px] overflow-hidden bg-slate-100">
      <img
        src={card.photo}
        alt={isCopy ? '' : card.name}
        loading="lazy"
        className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
      />
    </div>
    <div className="mt-3 px-1 pb-1">
      <p className="font-outfit font-black text-[15px] text-slate-900 truncate">{card.name}</p>
      <p className="text-[12px] text-slate-500 truncate mt-0.5">{card.role || 'UniCoach mentor'}</p>
      <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-[#DE5C2B]">
        {card.cta}
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
      </span>
    </div>
  </Link>
);

/**
 * Homepage mentors row: our event hosts + approved directory mentors with a real photo,
 * drifting slowly in a loop (paused on hover). Grows by itself as mentors are approved.
 */
const MentorMarquee = () => {
  const [directoryCards, setDirectoryCards] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getPublicMentorsDirectory()
      .then((data) => {
        if (cancelled) return;
        const mentors = Array.isArray(data?.mentors) ? data.mentors : [];
        setDirectoryCards(
          mentors
            .filter((m) => m.handle && m.name && m.avatarUrl && !STOCK_PHOTO.test(m.avatarUrl))
            .map(toDirectoryCard)
        );
      })
      .catch(() => {
        // Directory unavailable: the event hosts are still shown
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [...HOST_CARDS, ...directoryCards];
  const repeats = Math.max(1, Math.ceil(MIN_LOOP_WIDTH_PX / (cards.length * CARD_SLOT_PX)));
  const loopCards = Array.from({ length: repeats }, (_, round) => cards.map((card) => ({ card, round }))).flat();

  return (
    <section className="w-full max-w-full pt-5 pb-10 sm:pt-6 sm:pb-12 bg-[#FAF9F6]" aria-labelledby="home-mentors-heading">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-7">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-200/90 text-[11.5px] font-bold text-slate-800 shadow-2xs mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B]" />
              REAL SENIORS · 1:1 MENTORSHIP
            </span>
            <h2 id="home-mentors-heading" className="font-outfit text-[26px] sm:text-[34px] lg:text-[38px] font-black text-[#111111] leading-tight tracking-tight">
              Talk to seniors who&apos;ve <span className="text-[#DE5C2B]">done it</span>
            </h2>
            <p className="text-[13.5px] sm:text-[14.5px] text-slate-600 mt-1.5 max-w-xl">
              Book a 1:1 call with students who got in, or join their free live sessions.
            </p>
          </div>
          <Link
            to="/unicoach#mentors-grid"
            className="self-start md:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-[#DE5C2B] hover:text-[#DE5C2B] text-[13px] font-bold text-slate-800 transition-colors"
          >
            View all mentors
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Two identical halves, each with its own trailing gap, so translating by -50% loops seamlessly */}
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
        <div
          className="animate-marquee [&:focus-within]:[animation-play-state:paused] py-2"
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
