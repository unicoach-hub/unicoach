import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { TruckArtFrame } from './DesiPop';

/*
 * "Book OK Please." truck-art CTA. The middle shows who you talk to (mentors living in these countries)
 * and what the call is, painted like truck-art plates, so the wide banner has no empty middle.
 */

const INK = '#16130F';

// Only countries where a UniCoach mentor actually lives and works
const MENTOR_COUNTRIES = [
  { name: 'Ireland', img: '/images/destinations-3d/ireland.webp', tint: '#DDF3E4' },
  { name: 'Australia', img: '/images/destinations-3d/australia.webp', tint: '#FDE7C8' },
  { name: 'Germany', img: '/images/destinations-3d/germany.webp', tint: '#FFF1B8' },
  { name: 'USA', img: '/images/destinations-3d/usa.webp', tint: '#FBD9E6' },
];

// Truck-art number plates: what the call is
const PLATES = [
  { top: 'फ़ीस', value: '₹0', bg: '#FCE38A', fg: INK, ring: '#E5007E' },
  { top: 'टाइम', value: '60 min', bg: '#E5007E', fg: '#FFFFFF', ring: '#F2B705' },
  { top: 'बात', value: '1:1', bg: '#13A89E', fg: '#FFFFFF', ring: '#FCE38A' },
];

export const BookOkCta = ({
  to = '/book-consultation',
  hi = 'बुक ओके प्लीज़',
  title = 'Book OK Please.',
  text = 'Free call. Koi card nahi chahiye. 1:1, ek ghante ki baat.',
  cta = 'Free call book karo',
  className = '',
}) => (
  <TruckArtFrame className={className}>
    <div className="grid lg:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-6 lg:gap-10 px-6 py-8 sm:px-10 bg-[#FFF6E5] text-center lg:text-left">
      <div className="min-w-0">
        <p className="font-['Rozha_One',serif] text-[18px] text-[#D0362E] leading-none">{hi}</p>
        <p className="mt-1 font-urbanist font-black text-[36px] sm:text-[44px] tracking-[-0.03em] leading-none text-[#16130F]">{title}</p>
        <p className="mt-2 text-[14px] text-[#5B544A]">{text}</p>
      </div>

      {/* middle: who you talk to + what the call is */}
      <div className="flex flex-col items-center gap-3.5 lg:px-8 lg:border-x-[3px] lg:border-dotted lg:border-[#13A89E]">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {MENTOR_COUNTRIES.map((c, i) => (
              <span key={c.name} title={`Mentor in ${c.name}`}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-[#16130F] grid place-items-center overflow-hidden shadow-[2px_2px_0_#16130F]"
                style={{ background: c.tint, zIndex: MENTOR_COUNTRIES.length - i }}>
                <img src={c.img} alt={c.name} loading="lazy" className="w-[88%] h-[88%] object-contain" />
              </span>
            ))}
          </div>
          <p className="text-left text-[12.5px] leading-tight text-[#5B544A]">
            <b className="block text-[14px] text-[#16130F] whitespace-nowrap">Mentor jo wahan</b>
            reh chuke hain
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {PLATES.map((p, i) => (
            <span key={p.value}
              className="flex flex-col items-center px-3 py-1.5 border-[3px] border-[#16130F] leading-none"
              style={{ background: p.bg, color: p.fg, borderRadius: 10, boxShadow: `0 0 0 3px ${p.ring}`, transform: `rotate(${(i - 1) * 3}deg)` }}>
              <span className="font-['Rozha_One',serif] text-[11px] opacity-90">{p.top}</span>
              <span className="mt-0.5 font-urbanist font-black text-[16px] whitespace-nowrap">{p.value}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-center lg:justify-end">
        <Link to={to} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#D0362E] hover:bg-[#B52A23] text-white text-[14px] font-bold shadow-[3px_3px_0_#16130F] transition-colors whitespace-nowrap">
          {cta} <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  </TruckArtFrame>
);

export default BookOkCta;
