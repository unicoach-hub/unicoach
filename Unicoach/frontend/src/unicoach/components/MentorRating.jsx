import { Star } from 'lucide-react';

// "★ 4.8 (120)" for reviewed mentors, a "New" pill otherwise
export const MentorRating = ({ rating, reviewCount, className = '' }) => {
  if (!reviewCount || rating == null) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[10px] font-bold text-[#DE5C2B] ${className}`}>
        New
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[11.5px] font-bold text-slate-800 ${className}`}>
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      {Number(rating).toFixed(1)}
      <span className="font-medium text-slate-400">({reviewCount})</span>
    </span>
  );
};
