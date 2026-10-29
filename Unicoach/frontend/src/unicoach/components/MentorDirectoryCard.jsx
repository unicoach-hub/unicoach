import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { MentorRating } from './MentorRating';
import { MentorAvatar } from './MentorAvatar';
import { formatPrice, getCountryFlagCode, getCountryLabel, mentorHref } from '../utils/mentorDirectory';

// One colour per card, from the brand references (JobsMatch blue, coral, marigold, teal, lavender, rani pink)
const CARD_TONES = [
  { solid: '#2F5BFF', text: '#FFFFFF', tint: '#E8EEFF', deep: '#1F3FC4' },
  { solid: '#FF6B57', text: '#FFFFFF', tint: '#FFEAE6', deep: '#C2412F' },
  { solid: '#FFC93C', text: '#16130F', tint: '#FFF4D1', deep: '#8A6200' },
  { solid: '#14B8A6', text: '#16130F', tint: '#DDF6F2', deep: '#0B6F64' },
  { solid: '#7C6CF2', text: '#FFFFFF', tint: '#EDEAFF', deep: '#4F3FCB' },
  { solid: '#E4007C', text: '#FFFFFF', tint: '#FFE3F1', deep: '#A1005A' },
];

export const MentorDirectoryCard = ({ mentor: m, index = 0 }) => {
  const flagCode = getCountryFlagCode(m.country);
  const tone = CARD_TONES[index % CARD_TONES.length];

  return (
    <Link
      to={mentorHref(m)}
      className="bg-white rounded-[24px] p-3 sm:p-3.5 border-2 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_22px_40px_-24px_var(--tone)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group cursor-pointer select-none"
      style={{ borderColor: tone.tint, '--tone': tone.solid }}
    >
      {/* Portrait Photo Container */}
      <div className={`relative w-full aspect-square rounded-[16px] overflow-hidden mb-2.5 sm:mb-3 ${String(m._id).startsWith('featured-') ? 'bg-[#F8EBC0]' : 'bg-slate-100'}`}>
        <MentorAvatar
          mentor={m}
          imgClassName="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          letterClassName="text-2xl sm:text-3xl"
        />

        {/* Country Flag Badge (Top-Left) */}
        {flagCode && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-800 border border-black/5 shadow-2xs">
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
          className="absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md ring-2 ring-white"
          style={{ background: tone.solid, color: tone.text }}
          title="100% Verified Senior"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Mentor Details Below Photo */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-outfit font-black text-[14px] sm:text-[15px] text-slate-900 group-hover:text-[var(--tone-deep)] transition-colors truncate leading-snug" style={{ '--tone-deep': tone.deep }}>
            {m.name}
          </h3>
          <p className="text-[11.5px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
            {m.headline}
          </p>
          {!m.isFeatured && <MentorRating rating={m.rating} reviewCount={m.reviewCount} className="mt-1.5" />}
        </div>

        {/* Bottom Pricing & CTA Strip */}
        <div className="mt-3 rounded-[16px] px-3 py-2.5 flex items-center justify-between gap-2" style={{ background: tone.tint }}>
          <div>
            <span className="text-[9px] font-bold uppercase block leading-none" style={{ color: tone.deep, opacity: 0.75 }}>
              Sessions from
            </span>
            <div className="font-outfit text-xs sm:text-[13px] font-black leading-tight mt-0.5" style={{ color: tone.deep }}>
              {formatPrice(m.startingPriceINR)}
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all shadow-2xs" style={{ background: tone.solid, color: tone.text }}>
            <span>View Sessions</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
};
