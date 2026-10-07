import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight, Star, Trophy, Globe } from 'lucide-react';

const formatCategory = (cat) => {
  if (!cat) return '';
  const trimmed = cat.trim();
  if (trimmed.toLowerCase().startsWith('in ')) return trimmed;
  return `In ${trimmed}`;
};

const getPublisherBadge = (publisher) => {
  const p = publisher.toLowerCase();
  if (p.includes('times')) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center justify-center shadow-2xs">
        <Star size={20} className="fill-indigo-600 text-indigo-600" />
      </div>
    );
  }
  if (p.includes('us news')) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center text-[10px] font-black tracking-tight uppercase shadow-2xs leading-none px-1 text-center">
        US News
      </div>
    );
  }
  if (p.includes('qs')) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100/80 flex items-center justify-center shadow-2xs">
        <Trophy size={20} />
      </div>
    );
  }
  if (p.includes('webometrics')) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#DE5C2B] border border-orange-100/80 flex items-center justify-center shadow-2xs">
        <Globe size={20} />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center justify-center shadow-2xs">
      <Award size={20} />
    </div>
  );
};

const RankingsSection = ({ uniData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
      <div className="bg-white border border-slate-200/70 rounded-[28px] p-6 md:p-8 shadow-sm space-y-8">
        <h2 className="text-xl md:text-2xl font-black text-slate-900">Accredited Rankings</h2>
        
        {uniData.rankings ? (
          <div className="space-y-8">
            {Object.entries(uniData.rankings).map(([publisher, ranks]) => (
              <div key={publisher} className="border-b border-slate-100 last:border-0 pb-8 last:pb-0">
                <div className="flex items-center gap-3 mb-5">
                  {getPublisherBadge(publisher)}
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
                    {publisher}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {ranks.map((r, i) => (
                    <div 
                      key={i} 
                      className="bg-[#F8FAFC] border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-center transition-all hover:border-indigo-200 hover:shadow-xs"
                    >
                      <span className="text-2xl font-black text-slate-800 tracking-tight mb-1">
                        # {r.rank}
                      </span>
                      <span className="text-xs md:text-sm font-semibold text-slate-600 leading-snug">
                        {formatCategory(r.category)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : uniData.rank ? (
          <div className="bg-[#F8FAFC] border border-slate-200/60 p-6 rounded-2xl text-center">
            <span className="text-sm font-bold text-slate-700">{uniData.rank}</span>
          </div>
        ) : null}
      </div>

      {/* Right Side: CTA card matching reference */}
      <div className="sticky top-28 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 border border-indigo-100/80 rounded-[28px] p-6 text-center shadow-sm">
        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-600/20">
          <Award size={24} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Find Your Preferred University</h3>
        <p className="text-xs text-slate-600 font-bold mb-6 leading-relaxed">
          Get the best universities shortlisted that match with your goals free of charge ✨
        </p>
        <Link
          to="/contact?tab=chances"
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs inline-flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <span>Find Your Preferred University</span>
          <ArrowRight size={14} />
        </Link>
        <div className="mt-4 pt-4 border-t border-indigo-100/60 flex items-center justify-center gap-2 text-[11px] font-extrabold text-indigo-950">
          <div className="flex -space-x-1.5">
            <div className="w-5 h-5 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-[9px]">🎓</div>
            <div className="w-5 h-5 rounded-full bg-purple-200 border-2 border-white flex items-center justify-center text-[9px]">🌟</div>
          </div>
          <span>2L+ got free counselling last month!</span>
        </div>
      </div>
    </div>
  );
};

export default RankingsSection;
