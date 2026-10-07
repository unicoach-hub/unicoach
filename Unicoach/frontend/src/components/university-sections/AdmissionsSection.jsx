import React from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle2, Building, ArrowRight } from 'lucide-react';

const AdmissionsSection = ({ uniData }) => {
  // Hand-written page data; values are written either as 65 or "65%"
  const acceptanceRate = uniData.acceptanceRate ? String(uniData.acceptanceRate).replace(/%\s*$/, '') : null;
  const countryLabel = uniData.countryName || uniData.country;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
      <div className="space-y-8">
        
        {/* Highlights Grid */}
        <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
            <Star size={18} className="text-indigo-600 fill-indigo-600/10" />
            Highlights
          </h2>
          <p className="text-slate-500 text-xs font-semibold mb-6">
            {countryLabel ? `Here are the key details related to studying in ${countryLabel}` : `Here are the key details related to studying at ${uniData.name || 'this university'}`}
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Established In</span>
              <span className="text-base font-black text-slate-800 mt-1 block">{uniData.established || 'N/A'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Students</span>
              <span className="text-base font-black text-slate-800 mt-1 block">{uniData.totalStudents ? uniData.totalStudents.toLocaleString() : 'N/A'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Intl Students</span>
              <span className="text-base font-black text-indigo-600 mt-1 block">{uniData.intlStudents ? uniData.intlStudents.toLocaleString() : 'N/A'}</span>
            </div>
            {acceptanceRate && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Acceptance Rate</span>
                <span className="text-base font-black text-slate-800 mt-1 block">{acceptanceRate}%</span>
              </div>
            )}
            {uniData.tuition && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tuition Fee</span>
                <span className="text-base font-black text-slate-850 mt-1 block">{uniData.tuition}</span>
              </div>
            )}
          </div>
        </div>

        {/* Intakes Panel */}
        {uniData.intakeDeadlines && (
          <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-5">Intakes and Admission Deadlines</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {uniData.intakeDeadlines.map((intake, i) => (
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

        {/* Admission Requirements */}
        {uniData.requirements && (
          <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-5">Admission Requirements</h2>
            <div className="space-y-4">
              {uniData.requirements.map((req, i) => (
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

      {/* Right Side: CTA card */}
      <div className="sticky top-28 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-[28px] p-6 text-center shadow-sm">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-md">
          <Building size={24} />
        </div>
        <h3 className="text-lg font-black text-indigo-950 mb-1.5">Find Your Best Intake</h3>
        <p className="text-xs text-indigo-600 font-bold mb-6">Get matching timelines and custom deadline updates directly to your inbox.</p>
        <Link
          to="/contact?tab=intakes"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/10"
        >
          <span>Check Admission Chances</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default AdmissionsSection;
