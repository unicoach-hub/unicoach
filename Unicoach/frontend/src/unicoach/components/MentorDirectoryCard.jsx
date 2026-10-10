import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { MentorRating } from './MentorRating';
import { MentorAvatar } from './MentorAvatar';
import { formatPrice, getCountryFlagCode, getCountryLabel, mentorHref } from '../utils/mentorDirectory';

export const MentorDirectoryCard = ({ mentor: m }) => {
  const flagCode = getCountryFlagCode(m.country);

  return (
    <Link
      to={mentorHref(m)}
      className="bg-white rounded-[22px] p-3 sm:p-3.5 border border-slate-200/80 hover:border-[#DE5C2B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(222,92,43,0.14)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group cursor-pointer select-none"
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
          className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-[#DE5C2B] text-white flex items-center justify-center shadow-md ring-2 ring-white"
          title="100% Verified Senior"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
        </div>
      </div>

      {/* Mentor Details Below Photo */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-outfit font-black text-[14px] sm:text-[15px] text-slate-900 group-hover:text-[#DE5C2B] transition-colors truncate leading-snug">
            {m.name}
          </h3>
          <p className="text-[11.5px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
            {m.headline}
          </p>
          {!m.isFeatured && <MentorRating rating={m.rating} reviewCount={m.reviewCount} className="mt-1.5" />}
        </div>

        {/* Bottom Pricing & CTA Strip */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block leading-none">
              Sessions from
            </span>
            <div className="font-outfit text-xs sm:text-[13px] font-black text-slate-900 leading-tight mt-0.5">
              {formatPrice(m.startingPriceINR)}
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#111111] group-hover:bg-[#DE5C2B] text-white text-[11px] font-bold transition-all shadow-2xs">
            <span>View Sessions</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
};
