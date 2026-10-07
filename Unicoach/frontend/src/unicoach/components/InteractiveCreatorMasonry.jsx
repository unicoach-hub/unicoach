// ════════════════════════════════════════════════════════════════════════════════
// InteractiveCreatorMasonry.jsx — DUAL-COLUMN VERTICAL SCROLLING SHOWCASE
// Left column scrolls continuously UPWARD (bottom to top)
// Right column scrolls continuously DOWNWARD (top to bottom)
// Slow CSS-keyframe loop (see .uc-creator-track-* in index.css): pauses on
// hover/focus and keeps drifting slowly for everyone (owner's choice).
// ════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Link } from 'react-router-dom';

const COLUMN_1_CREATORS = [
  {
    handle: 'ganesh_balakrishnan',
    name: 'Ganesh Balakrishnan',
    role: 'Shark Tank India',
    badge: 'Aurm',
    image: '/images/mentors/ganesh_balakrishnan.jpg',
  },
  {
    handle: 'vijay_chandola',
    name: 'Vijay Chandola',
    role: 'Your Product Career Coach',
    badge: 'Product Coach',
    image: '/images/mentors/vijay_chandola.jpg',
  },
  {
    handle: 'melissa_chapman',
    name: 'Melissa (Chapman)',
    role: 'PMP eBook Author',
    badge: 'Chaucer',
    image: '/images/mentors/melissa_chapman.jpg',
  },
  {
    handle: 'ananya_harvard',
    name: 'Ananya Deshmukh',
    role: 'Harvard Kennedy School • MPP',
    badge: 'Harvard',
    image: '/images/mentors/ananya_harvard.jpg',
  },
  {
    handle: 'aarav_tum',
    name: 'Aarav Sharma',
    role: 'M.Sc. Informatics @ TU Munich',
    badge: 'TU Munich',
    image: '/images/mentors/aarav_tum.jpg',
  },
  {
    handle: 'priyanka_europe',
    name: 'Priyanka',
    role: 'Your Europe Move Mentor',
    badge: 'Europe Move',
    image: '/images/mentors/priyanka_europe.jpg',
  }
];

const COLUMN_2_CREATORS = [
  {
    handle: 'prakriti_ashish',
    name: 'Prakriti & Ashish',
    role: 'Travelers',
    badge: 'Travelers',
    image: '/images/mentors/prakriti_ashish.jpg',
  },
  {
    handle: 'kartik_kapoor',
    name: 'Kartik Kapoor',
    role: 'Build Your Airbnb Business',
    badge: 'Airbnb Host',
    image: '/images/mentors/kartik_kapoor.jpg',
  },
  {
    handle: 'chiradeep_patra',
    name: 'Chiradeep Patra',
    role: 'Life Coach (ICF - CCE)',
    badge: 'I Listen Space',
    image: '/images/mentors/chiradeep_patra.jpg',
  },
  {
    handle: 'technomanagers',
    name: 'Technomanagers',
    role: 'Crack Your Dream PM Role',
    badge: 'Product Lead',
    image: '/images/mentors/technomanagers.jpg',
  },
  {
    handle: 'priya_oxford',
    name: 'Priya Patel',
    role: 'Oxford CS Scholar • Ex-Goldman',
    badge: 'Oxford',
    image: '/images/mentors/priya_oxford.jpg',
  },
  {
    handle: 'ayush_singh',
    name: 'Ayush Singh',
    role: 'Data Science & AI Mentor',
    badge: 'AI Mentor',
    image: '/images/mentors/ayush_singh.jpg',
  }
];

const CreatorCard = ({ item, tabIndex }) => (
  <Link
    to={`/@${item.handle}`}
    tabIndex={tabIndex}
    className="bg-white rounded-[22px] p-3 sm:p-3.5 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer block text-left group shrink-0"
  >
    {/* Image Container with 4:3 Aspect Ratio — full face, head, shoulders centered */}
    <div className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden bg-slate-100 mb-2.5 shadow-2xs">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      {item.badge && (
        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10.5px] font-bold text-slate-800 shadow-sm border border-black/5">
          {item.badge}
        </div>
      )}
    </div>

    {/* Text Details */}
    <h3 className="font-outfit font-black text-sm sm:text-base text-slate-900 group-hover:text-[#DE5C2B] transition-colors leading-tight truncate">
      {item.name}
    </h3>
    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
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
          <CreatorTrack items={COLUMN_1_CREATORS} direction="up" prefix="col1" />
        </div>
        <div className="overflow-hidden">
          <CreatorTrack items={COLUMN_2_CREATORS} direction="down" prefix="col2" />
        </div>
      </div>

    </div>
  );
};

export default InteractiveCreatorMasonry;
