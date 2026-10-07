import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building, BookOpen, Clock, HelpCircle, CheckCircle2, 
  ArrowRight, Sparkles, Award, MapPin, Briefcase, Coins
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../components/StudyAbroadCTA';

const NewZealandOverview = () => {
  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-[#e0f2fe]/40 via-indigo-50/15 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-sky-200/10 to-indigo-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Study in New Zealand</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 text-left"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
              <Sparkles size={14} className="text-sky-600 animate-pulse" />
              <span>Study Abroad Guide 2026/27</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Study in{' '}
              <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">New Zealand</span>
            </h1>
            <p className="text-slate-655 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mb-8">
              New Zealand has emerged as a premier, highly practical destination for Indian students in 2026. Explore world-ranked universities, increased work rights, and streamlined residency pathways.
            </p>
            <a 
              href="#key-sections" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#DE5C2B] hover:bg-blue-650 text-white font-bold text-sm rounded-2xl shadow-lg transition-transform active:scale-[0.98] cursor-pointer"
            >
              <span>Explore Top Programs</span>
              <ArrowRight size={16} />
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            <div className="w-full h-[320px] md:h-[380px] rounded-[36px] overflow-hidden shadow-xl border border-white/60 relative">
              <img 
                src="https://images.unsplash.com/photo-1589871973318-9ca1258faa5d?w=1200" 
                alt="Milford Sound, New Zealand" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs font-bold text-sky-300 uppercase tracking-widest">Milford Sound</p>
                <h3 className="text-xl font-black mt-1">Stunning Nature & High Education Standards</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { val: "All 8 Ranked", label: "QS World Rankings" },
            { val: "25 Hrs / Wk", label: "Term-Time Work Rights" },
            { val: "3-Year Post Study", label: "Open Work Visa (Level 7+)" },
            { val: "Fast Track", label: "Indian Student Visa" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-xs backdrop-blur-md text-left">
              <p className="text-xl font-black text-indigo-655">{stat.val}</p>
              <p className="text-[10px] text-slate-500 font-extrabold mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* SECTION 1: KEY SECTIONS NAVIGATION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: "NZ Intakes 2026",
              path: "/study-abroad/new-zealand/intakes",
              desc: "Compare Semester 1 (February), Semester 2 (July), and flexible Rolling Intake timelines for 2026.",
              tag: "February & July Cycles"
            },
            {
              title: "July Intake Manual",
              path: "/study-abroad/new-zealand/july-intake",
              desc: "A strategic planning guide for the mid-year intake including closing dates, fees, and shared rent estimates.",
              tag: "Perfect Backup Option"
            },
            {
              title: "Student Visa Manual",
              path: "/study-abroad/new-zealand/visa",
              desc: "Everything you need to know about the NZD 20,000 financial proof rules, work rights, and processing periods.",
              tag: "Visa & Rules Guide"
            }
          ].map((sec, idx) => (
            <div 
              key={idx}
              className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <span className="px-3 py-1 bg-sky-50 border border-sky-100 text-sky-700 text-[10px] font-black rounded-lg uppercase tracking-wider">
                  {sec.tag}
                </span>
                <h3 className="font-black text-slate-900 text-lg mt-4 group-hover:text-indigo-650 transition-colors">
                  {sec.title}
                </h3>
                <p className="text-slate-655 text-xs font-semibold leading-relaxed mt-3">
                  {sec.desc}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6 mt-6">
                <Link 
                  to={sec.path}
                  className="w-full inline-flex items-center justify-between py-3 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white rounded-xl text-slate-700 font-black text-xs transition-all px-4"
                >
                  <span>Explore Guide</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 2: WHY NEW ZEALAND WORKS FOR INDIAN STUDENTS */}
        <div className="bg-white/60 border border-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl mb-12">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 text-center">Why Study in New Zealand in 2026?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-black flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Flexible Academic Cycles</h4>
                  <p className="text-slate-655 text-xs font-semibold leading-relaxed mt-1">
                    With both February and July intakes, as well as rolling start options at polytechnics (Te Pūkenga), you can time your arrival to match your local graduation dates.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-black flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Increased Student Earnings</h4>
                  <p className="text-slate-655 text-xs font-semibold leading-relaxed mt-1">
                    Work rights have been expanded to 25 hours per week during term time (up from 20), giving students more earning potential to cover accommodation and utilities.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-black flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">3-Year Open Work Rights</h4>
                  <p className="text-slate-655 text-xs font-semibold leading-relaxed mt-1">
                    Graduates from Level 7 Bachelor's or Level 9 Master's programs are granted an open 3-year post-study work visa (PSWV), providing a solid pathway to local employment.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-black flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Triple-Accredited Business & Engineering</h4>
                  <p className="text-slate-655 text-xs font-semibold leading-relaxed mt-1">
                    All 8 of New Zealand's public universities rank in the top 3% globally (QS Rankings), delivering high ROI with internationally recognized certifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


      {/* CTA Section */}
      <StudyAbroadCTA country="New Zealand" />

      </div>
    </div>
  );
};

export default NewZealandOverview;
