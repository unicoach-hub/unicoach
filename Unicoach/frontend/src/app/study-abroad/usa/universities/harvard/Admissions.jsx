import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';

const Admissions = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Highlights */}
      <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
          <Star size={18} className="text-indigo-600 fill-indigo-600/10" />
          Admissions Highlights
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Established</span>
            <span className="text-base font-black text-slate-800 mt-1 block">{data?.established || 1636}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Students</span>
            <span className="text-base font-black text-slate-800 mt-1 block">{data?.totalStudents ? data.totalStudents.toLocaleString() : '57,786'}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Intl Students</span>
            <span className="text-base font-black text-indigo-650 mt-1 block">{data?.intlStudents ? data.intlStudents.toLocaleString() : '7,274'}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Acceptance Rate</span>
            <span className="text-base font-black text-slate-800 mt-1 block">4%</span>
          </div>
        </div>
      </div>

      {/* Intakes */}
      {data?.intakeDeadlines && (
        <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-5">Intakes & Deadlines</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.intakeDeadlines.map((intake, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="font-extrabold text-slate-800 text-sm">{intake.name}</span>
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-150 text-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-wider">
                  {intake.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {data?.requirements && (
        <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-5">Admission Requirements</h2>
          <div className="space-y-4">
            {data.requirements.map((req, i) => (
              <div key={i} className="flex items-start gap-3.5 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <CheckCircle2 size={18} className="text-emerald-500 stroke-[2.5] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">{req.title}</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5 leading-relaxed">{req.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admissions;
