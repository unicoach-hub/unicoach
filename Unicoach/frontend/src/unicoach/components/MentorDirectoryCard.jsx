import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { MentorRating } from './MentorRating';
import { MentorAvatar } from './MentorAvatar';
import { formatPrice, getCountryFlagCode, getCountryLabel, mentorHref } from '../utils/mentorDirectory';

// One Desi Pop colour per card: sindoor, mustard, teal, rani, orange, indigo
const CARD_TONES = [
  { solid: '#D0362E', text: '#FFFFFF', tint: '#FCE3DA', deep: '#9E2219' },
  { solid: '#F2B705', text: '#16130F', tint: '#FFF1B8', deep: '#7A5A00' },
  { solid: '#14837E', text: '#FFFFFF', tint: '#DDF3EF', deep: '#0B5F5B' },
  { solid: '#B8285B', text: '#FFFFFF', tint: '#FBD9E6', deep: '#8A1A42' },
  { solid: '#DE5C2B', text: '#FFFFFF', tint: '#FFE6D8', deep: '#A8401A' },
  { solid: '#2B3FA0', text: '#FFFFFF', tint: '#E3E7FA', deep: '#1E2D78' },
];

export const MentorDirectoryCard = ({ mentor: m, index = 0 }) => {
  const flagCode = getCountryFlagCode(m.country);
  const tone = CARD_TONES[index % CARD_TONES.length];

  return (
    <Link
      to={mentorHref(m)}
      className="bg-white rounded-[18px] p-3 sm:p-3.5 border-[3px] border-[#16130F] shadow-[5px_5px_0_var(--tone)] transition-transform duration-300 hover:-translate-y-1 flex flex-col justify-between group cursor-pointer select-none"
      style={{ '--tone': tone.solid }}
    >
      {/* Portrait Photo Container */}
      <div className={`relative w-full aspect-square rounded-[12px] border-2 border-[#16130F] overflow-hidden mb-2.5 sm:mb-3 ${String(m._id).startsWith('featured-') ? 'bg-[#F8EBC0]' : 'bg-slate-100'}`}>
        <MentorAvatar
          mentor={m}
          imgClassName="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          letterClassName="text-2xl sm:text-3xl"
        />

        {/* Country Flag Badge (Top-Left) */}
        {flagCode && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md text-[11px] font-extrabold text-[#16130F] border-2 border-[#16130F]">
            <img
              src={`https://flagcdn.com/w40/${flagCode}.png`}
              alt=""
              className="w-3.5 h-2.5 rounded-2xs object-cover"
            />
            <span className="leading-none">{getCountryLabel(m.country)}</span>
          </div>
        )}

        {/* Verified Checkmark (Bottom-Right) */}
        <div
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border-2 border-[#16130F]"
          style={{ background: tone.solid, color: tone.text }}
          title="100% Verified Senior"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Mentor Details Below Photo */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-urbanist font-black text-[16px] sm:text-[18px] text-[#16130F] group-hover:text-[var(--tone-deep)] transition-colors truncate leading-snug" style={{ '--tone-deep': tone.deep }}>
            {m.name}
          </h3>
          <p className="text-[12.5px] sm:text-[13.5px] text-[#5B544A] font-semibold truncate mt-0.5">
            {m.headline}
          </p>
          {!m.isFeatured && <MentorRating rating={m.rating} reviewCount={m.reviewCount} className="mt-1.5" />}
        </div>

        {/* Bottom Pricing & CTA Strip */}
        <div className="mt-3 rounded-[12px] border-2 border-[#16130F] px-2.5 sm:px-3 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ background: tone.tint }}>
          {/* Phones: price on top, full-width button below (two columns leave no room side by side) */}
          <div className="flex items-baseline justify-between gap-2 sm:block min-w-0">
            <span className="text-[10px] font-extrabold uppercase block leading-none whitespace-nowrap" style={{ color: tone.deep, opacity: 0.75 }}>
              Sessions from
            </span>
            <div className="font-urbanist text-[14px] sm:text-[16px] font-black leading-tight sm:mt-0.5 whitespace-nowrap" style={{ color: tone.deep }}>
              {formatPrice(m.startingPriceINR)}
            </div>
          </div>

          <span className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full border-2 border-[#16130F] text-[12px] font-extrabold whitespace-nowrap transition-all" style={{ background: tone.solid, color: tone.text }}>
            <span>View Sessions</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
};
