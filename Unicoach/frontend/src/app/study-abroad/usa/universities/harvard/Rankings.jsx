import React from 'react';
import { Award, Star, Trophy, Globe } from 'lucide-react';

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

const Rankings = ({ data }) => {
  return (
    <div className="bg-white border border-slate-200/70 rounded-[28px] p-6 md:p-8 shadow-sm space-y-8">
      <h2 className="text-xl md:text-2xl font-black text-slate-900">
        {data?.name || 'Harvard'} Accredited Rankings
      </h2>

      {data?.rankings ? (
        <div className="space-y-8">
          {Object.entries(data.rankings).map(([publisher, ranks]) => (
            <div key={publisher} className="border-b border-slate-100 last:border-0 pb-8 last:pb-0">
              <div className="flex items-center gap-3 mb-5">
                {getPublisherBadge(publisher)}
                <h3 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
                  {publisher}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      ) : (
        <div className="bg-[#F8FAFC] border border-slate-200/60 p-6 rounded-2xl text-center">
          <span className="text-sm font-bold text-slate-700">Rank #4 QS World University Rankings 2025</span>
        </div>
      )}
    </div>
  );
};

export default Rankings;
