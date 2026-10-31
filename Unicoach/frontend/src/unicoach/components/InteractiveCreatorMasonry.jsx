// ════════════════════════════════════════════════════════════════════════════════
// InteractiveCreatorMasonry.jsx — DUAL-COLUMN VERTICAL SCROLLING SHOWCASE
// Left column scrolls continuously UPWARD (bottom to top)
// Right column scrolls continuously DOWNWARD (top to bottom)
// Slow CSS-keyframe loop (see .uc-creator-track-* in index.css): pauses on
// hover/focus and keeps drifting slowly for everyone (owner's choice).
// ════════════════════════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { TEAM_MENTORS, mentorLook } from '../../utils/teamMentors';

const FEATURED_MENTORS = TEAM_MENTORS.map((mentor) => ({
  name: mentor.name,
  role: mentor.role,
  badge: mentor.country,
  image: mentorLook(mentor.name).cutout || mentor.headshot || mentor.portrait,
  gradient: mentorLook(mentor.name).gradient,
}));

const CreatorCard = ({ item, tabIndex }) => (
  <Link
    to="/events"
    tabIndex={tabIndex}
    className="bg-white rounded-[18px] p-3 sm:p-3.5 border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] transition-transform duration-300 hover:-translate-y-1 cursor-pointer block text-left group shrink-0 mr-[5px]"
  >
    {/* Image Container with 4:3 Aspect Ratio — anchored to the top so the head is never cropped */}
    <div className="relative w-full aspect-[4/3] rounded-[12px] overflow-hidden bg-slate-100 mb-2.5 border-2 border-[#16130F]" style={item.gradient ? { background: item.gradient } : undefined}>
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      {item.badge && (
        <div className="absolute bottom-2 right-2 bg-[#F2B705] px-2.5 py-0.5 rounded-md text-[11.5px] font-extrabold text-[#16130F] border-2 border-[#16130F]">
          {item.badge}
        </div>
      )}
    </div>

    {/* Text Details */}
    <h3 className="font-urbanist font-black text-[16px] sm:text-[18px] text-[#16130F] group-hover:text-[#DE5C2B] transition-colors leading-tight truncate">
      {item.name}
    </h3>
    <p className="text-[13px] text-[#5B544A] font-semibold truncate mt-0.5">
      {item.role}
    </p>
  </Link>
);

// Each copy carries its own bottom padding (instead of flex `gap`) so the two
// halves are exactly equal in height and the -50% loop has no visible jump.
const CreatorTrack = ({ items, direction, prefix }) => (
  <div className={`uc-creator-marquee ${direction === 'up' ? 'uc-creator-track-up' : 'uc-creator-track-down'}`}>
    {[0, 1].map((copy) => (
      <div
        key={copy}
        className="flex flex-col gap-3.5 sm:gap-4.5 pb-3.5 sm:pb-4.5"
        aria-hidden={copy === 1 ? 'true' : undefined}
      >
        {items.map((item, idx) => (
          <CreatorCard
            key={`${prefix}-${copy}-${idx}`}
            item={item}
            tabIndex={copy === 1 ? -1 : undefined}
          />
        ))}
      </div>
    ))}
  </div>
);

export const InteractiveCreatorMasonry = () => {
  return (
    <div className="uc-creator-columns relative select-none max-w-[560px] mx-auto lg:ml-auto h-[600px] sm:h-[660px] lg:h-[700px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_6%,black_94%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_6%,black_94%,transparent_100%)]">

      {/* 2-Column Marquee Grid — left drifts up, right drifts down */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4.5 items-start h-full">
        <div className="overflow-hidden">
          <CreatorTrack items={FEATURED_MENTORS} direction="up" prefix="col1" />
        </div>
        <div className="overflow-hidden">
          <CreatorTrack items={FEATURED_MENTORS} direction="down" prefix="col2" />
        </div>
      </div>

    </div>
  );
};

export default InteractiveCreatorMasonry;
