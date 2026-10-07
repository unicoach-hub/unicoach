import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { useLead } from '../context/LeadContext';

export const Statistics = ({ onOpenModal }) => {
  const { openEligibilityModal } = useLead();
  const handleOpen = onOpenModal || (() => openEligibilityModal('Statistics Section'));

  const stats = [
    {
      value: '12,400+',
      label: 'Students Counselled',
      desc: 'Placed into Ivy League, Russell Group & Top 100 QS universities worldwide.',
      tag: 'Fall 2026 Active',
      accent: 'from-[#DE5C2B] to-amber-500',
    },
    {
      value: '₹148 Cr+',
      label: 'Scholarships & Aid',
      desc: 'Tuition waivers, merit grants & pre-approved collateral-free student loans.',
      tag: 'Zero Collateral',
      accent: 'from-amber-400 to-orange-500',
    },
    {
      value: '98.9%',
      label: 'Visa Success Rate',
      desc: 'First-attempt approvals powered by consular AI mock drills and compliance checks.',
      tag: 'Consular Verified',
      accent: 'from-emerald-400 to-teal-500',
    },
    {
      value: '1,500+',
      label: 'Global Universities',
      desc: 'Official direct partner network across USA, UK, Germany, Canada & Australia.',
      tag: 'Direct Tie-Ups',
      accent: 'from-orange-400 to-[#DE5C2B]',
    },
  ];

  const credentials = [
    'AIRC Certified Agency',
    'British Council Trained Advisors',
    'DAAD Germany Network Specialist',
    'ICEF Verified Agency',
  ];

  return (
    <section className="w-full bg-[#111111] text-white py-16 sm:py-24 relative overflow-hidden select-none border-b border-white/10">
      
      {/* ── Ambient Soft Glow ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-orange-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* ════════ CLEAN SECTION HEADER ════════ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 pb-8 border-b border-white/10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-400/30 text-[#DE5C2B] text-[11.5px] font-bold tracking-wider uppercase mb-3.5">
              <Sparkles className="w-3.5 h-3.5 text-[#DE5C2B]" />
              <span>Proven Admissions Track Record</span>
            </div>
            <h2 className="font-outfit text-[32px] sm:text-[40px] lg:text-[46px] font-black text-white leading-[1.12] tracking-tight">
              The Numbers That Back <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE5C2B] via-orange-400 to-amber-300">
                Your Global Ambition
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpen}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-orange-50 text-[#111111] hover:text-[#DE5C2B] text-[13.5px] font-bold shadow-lg shadow-black/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Get Free Profile Assessment</span>
              <ArrowUpRight className="w-4 h-4 text-[#DE5C2B]" />
            </button>
          </div>
        </div>

        {/* ════════ STRIPE / LINEAR STYLE OPEN METRICS STRIP ════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-slate-800/80">
          {stats.map((item, idx) => {
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group lg:px-8 first:lg:pl-0 last:lg:pr-0 flex flex-col justify-between"
              >
                <div>
                  {/* Subtle dynamic accent indicator */}
                  <div 
                    className={`w-8 h-1 rounded-full bg-gradient-to-r ${item.accent} mb-6 transition-all duration-300 group-hover:w-14 opacity-80 group-hover:opacity-100`} 
                  />

                  {/* Clean, Massive Number */}
                  <div className="font-outfit text-[40px] sm:text-[46px] lg:text-[50px] font-extrabold text-white tracking-tight leading-none mb-2.5">
                    {item.value}
                  </div>

                  {/* Bold Label */}
                  <h3 className="text-[16px] sm:text-[17px] font-bold text-slate-100 mb-2">
                    {item.label}
                  </h3>

                  {/* Concise, non-cluttered description */}
                  <p className="text-[13px] text-slate-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                {/* Refined micro-pill at the bottom */}
                <div className="mt-6 pt-2">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-slate-400 bg-slate-800/50 hover:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/40 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{item.tag}</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ════════ MINIMAL TRUST TICKER STRIP ════════ */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-[11.5px] text-slate-500 font-semibold tracking-wider uppercase">
            Global Accreditations & Certifications
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            {credentials.map((cred, cIdx) => (
              <div key={cIdx} className="flex items-center gap-2 text-[12.5px] text-slate-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/90 shrink-0" />
                <span>{cred}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Statistics;
