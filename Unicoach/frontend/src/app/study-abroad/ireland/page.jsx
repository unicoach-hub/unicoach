import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building, BookOpen, Clock, HelpCircle, CheckCircle2, 
  ArrowRight, Sparkles, Award, MapPin, Briefcase, Coins
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../components/StudyAbroadCTA';
import irelandImg from '../../../assets/destinations/ireland.jpg';

const IrelandOverview = () => {
  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-emerald-100/40 via-green-50/15 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/10 to-green-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Study in Ireland</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 text-left"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
              <Sparkles size={14} className="text-emerald-600 animate-pulse" />
              <span>Study Abroad Guide 2026/27</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Study in{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Ireland</span>
            </h1>
            <p className="text-slate-655 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mb-8">
              Ireland is one of the fastest-growing study destinations for Indian students in 2026. Explore world-class universities, a thriving tech ecosystem, generous post-study work visas, and an English-speaking environment in the heart of Europe.
            </p>
            <a 
              href="#key-sections" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-sm rounded-2xl shadow-lg transition-transform active:scale-[0.98] cursor-pointer"
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
                src={irelandImg} 
                alt="Trinity College Dublin, Ireland" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Trinity College, Dublin</p>
                <h3 className="text-xl font-black mt-1">Tech & Financial Hub of Europe</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { val: "Top 1%", label: "Global University Rankings" },
            { val: "20 Hrs / Wk", label: "Term-Time Work Rights" },
            { val: "2-Year Post Study", label: "Stay Back Visa (Level 9)" },
            { val: "English", label: "Medium of Instruction" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-xs backdrop-blur-md text-left">
              <p className="text-xl font-black text-emerald-600">{stat.val}</p>
              <p className="text-[10px] text-slate-500 font-extrabold mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* SECTION 1: KEY SECTIONS NAVIGATION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: "Masters in Ireland",
              path: "/study-abroad/ireland/courses/masters",
              desc: "Explore top-ranked Irish universities offering world-class Master's programmes across Data Science, Business, Engineering, and more.",
              tag: "Postgraduate Programmes"
            },
            {
              title: "PhD in Ireland",
              path: "/study-abroad/ireland/courses/phd",
              desc: "Discover fully funded PhD opportunities, research centres of excellence, and structured doctoral programmes across Ireland.",
              tag: "Research & Doctoral"
            },
            {
              title: "Data Science in Ireland",
              path: "/study-abroad/ireland/courses/data-science",
              desc: "Ireland's booming tech sector makes it ideal for Data Science. Compare MSc programmes at UCD, TUS, and more.",
              tag: "In-Demand Course"
            }
          ].map((sec, idx) => (
            <div 
              key={idx}
              className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-wider">
                  {sec.tag}
                </span>
                <h3 className="font-black text-slate-900 text-lg mt-4 group-hover:text-emerald-600 transition-colors">
                  {sec.title}
                </h3>
                <p className="text-slate-655 text-xs font-semibold leading-relaxed mt-3">
                  {sec.desc}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6 mt-6">
                <Link 
                  to={sec.path}
                  className="w-full inline-flex items-center justify-between py-3 bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white rounded-xl text-slate-700 font-black text-xs transition-all px-4"
                >
                  <span>Explore Guide</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 2: WHY IRELAND WORKS FOR INDIAN STUDENTS */}
        <div className="bg-white/60 border border-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl mb-12">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 text-center">Why Study in Ireland in 2026?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Global Tech Hub</h4>
                  <p className="text-slate-655 text-xs font-semibold leading-relaxed mt-1">
                    Ireland is home to European headquarters of Google, Apple, Meta, Microsoft, and many more — providing unmatched internship and placement opportunities for international students.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">English-Speaking EU Nation</h4>
                  <p className="text-slate-655 text-xs font-semibold leading-relaxed mt-1">
                    As one of the only English-speaking countries in the EU, Ireland eliminates language barriers while giving access to the entire European job market.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">2-Year Post-Study Work Visa</h4>
                  <p className="text-slate-655 text-xs font-semibold leading-relaxed mt-1">
                    Graduates from Level 9 (Master's) programmes get a 2-year Stay Back Visa (Third Country Graduate Programme), enabling full-time employment in Ireland after studies.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">World-Class Universities</h4>
                  <p className="text-slate-655 text-xs font-semibold leading-relaxed mt-1">
                    Trinity College Dublin, UCD, and DCU consistently rank in the top 1% globally (QS Rankings), delivering exceptional ROI with internationally recognized qualifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: TOP UNIVERSITIES */}
        <div className="mb-12">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 text-center">Top Irish Universities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Trinity College Dublin", rank: "#87 QS", path: "/study-abroad/ireland/universities/trinity", tag: "Ireland's #1" },
              { name: "University College Dublin", rank: "#171 QS", path: "/study-abroad/ireland/universities/ucd", tag: "Largest University" },
              { name: "Dublin City University", rank: "#436 QS", path: "/study-abroad/ireland/universities/dcu", tag: "Industry-Focused" },
              { name: "University of Limerick", rank: "#Top 500 QS", path: "/study-abroad/ireland/universities/limerick", tag: "Co-op Pioneer" },
              { name: "IT Carlow (SETU)", rank: "Emerging", path: "/study-abroad/ireland/universities/it-carlow", tag: "Affordable Option" }
            ].map((uni, idx) => (
              <Link
                key={idx}
                to={uni.path}
                className="bg-white/60 border border-white rounded-[24px] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-black rounded-md uppercase tracking-wider">
                  {uni.tag}
                </span>
                <h3 className="font-black text-slate-900 text-base mt-3 group-hover:text-emerald-600 transition-colors">{uni.name}</h3>
                <p className="text-slate-400 text-xs font-bold mt-1.5 flex items-center gap-1.5">
                  <Award size={12} className="text-emerald-500" />
                  {uni.rank} World Rankings
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:gap-2.5 transition-all">
                  <span>View Details</span>
                  <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* SECTION 4: STUDY IN DUBLIN */}
        <div className="bg-white/60 border border-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl mb-12">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4 text-center">Study in Dublin</h2>
          <p className="text-slate-500 text-sm font-semibold text-center max-w-2xl mx-auto mb-6">
            Dublin is Ireland's capital and the primary destination for international students, housing Trinity College Dublin, UCD, DCU, and TU Dublin.
          </p>
          <div className="flex justify-center">
            <Link
              to="/study-abroad/ireland/cities/dublin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <MapPin size={14} />
              <span>Explore Universities in Dublin</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      {/* CTA Section */}
      <StudyAbroadCTA country="Ireland" />

      </div>
    </div>
  );
};

export default IrelandOverview;
