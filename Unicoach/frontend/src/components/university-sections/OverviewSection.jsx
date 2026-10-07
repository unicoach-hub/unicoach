import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Building, BookOpen, Library, Activity, Home as HomeIcon, Compass, Users, ChevronRight, ArrowRight 
} from 'lucide-react';

const FAQAccordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
            <button
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between p-4 text-left font-extrabold text-slate-800 text-sm cursor-pointer hover:bg-slate-50/50 transition-colors"
            >
              <span>{item.question}</span>
              <ChevronRight 
                size={16} 
                className={`text-slate-400 transition-transform duration-250 ${isOpen ? 'rotate-90 text-indigo-600' : ''}`} 
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 pb-4 pt-1 text-slate-500 text-xs font-semibold leading-relaxed border-t border-slate-100">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

const OverviewSection = ({ uniData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
      <div className="space-y-8">
        
        {/* About / Description */}
        <div className="bg-white/60 border border-white rounded-[28px] p-6 md:p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-4">About {uniData.name}</h2>
          <p className="text-slate-600 font-semibold text-sm leading-relaxed mb-6">
            {uniData.description || `${uniData.name} is a premier higher education institution dedicated to academic excellence, innovative research, and global leadership.`}
          </p>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Established</span>
              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{uniData.established || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Institution Type</span>
              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block uppercase">{uniData.type || 'Public'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">City</span>
              <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{uniData.city || 'N/A'}</span>
            </div>
            {uniData.rank && (
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Global Rank</span>
                <span className="font-extrabold text-indigo-600 text-sm mt-0.5 block">
                  {uniData.rank}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Student Life Section */}
        {uniData.studentLife && (
          <div className="bg-white/60 border border-white rounded-[28px] p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">Student Life</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {uniData.studentLife.map((item, idx) => {
                const icons = [BookOpen, Library, Building, Activity, HomeIcon, Compass, Users];
                const Icon = icons[idx % icons.length];
                return (
                  <div key={idx} className="flex items-center gap-3.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-colors">
                    <span className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Icon size={18} />
                    </span>
                    <span className="font-extrabold text-slate-850 text-sm leading-snug">{item}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notable Alumni Section */}
        {uniData.alumni && (
          <div className="bg-white/60 border border-white rounded-[28px] p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">Notable Alumni</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {uniData.alumni.map((alum, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-lg mb-3 shadow-sm uppercase">
                    {alum.name.charAt(0)}
                  </div>
                  <h4 className="font-extrabold text-slate-850 text-xs leading-tight mb-1">{alum.name}</h4>
                  <span className="text-[10px] text-slate-400 font-bold block leading-normal">{alum.profession}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs Section */}
        {uniData.faqs && (
          <div className="bg-white/60 border border-white rounded-[28px] p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">Frequently Asked Questions</h2>
            <FAQAccordion items={uniData.faqs} />
          </div>
        )}
      </div>

      {/* Right Side CTA Card */}
      <div className="sticky top-28 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-[28px] p-6 text-center shadow-sm">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-md">
          <Building size={24} />
        </div>
        <h3 className="text-lg font-black text-indigo-950 mb-1.5">Find Your Preferred University</h3>
        <p className="text-xs text-indigo-600 font-bold mb-6">Get the best universities shortlisted according to your budget and academic profile.</p>
        <Link
          to="/contact?shortlist=expert"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/10"
        >
          <span>Get Shortlisted</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default OverviewSection;
