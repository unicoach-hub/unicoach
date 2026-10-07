import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, BookOpen, Clock, HelpCircle, CheckCircle2, 
  ArrowRight, ShieldAlert, AlertTriangle, Sparkles, Briefcase, Coins, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const medicalPathways = [
  {
    step: 1,
    name: "Pre-Med Foundation Year (Year 1)",
    duration: "1 Year",
    highlights: "Students must complete the Health Sciences First Year (HSFY) at Otago or the Bachelor of Health Sciences / BSc in Biomedical Science (OLY1) at Auckland.",
    details: "Requires exceptional grades (typically a minimum B+ or A- average across 8 core science papers). This first year acts as a major screening process."
  },
  {
    step: 2,
    name: "UCAT ANZ & MMI Screening",
    duration: "Admissions Milestones",
    highlights: "Candidates sit the University Clinical Aptitude Test (UCAT ANZ) and attend the Multiple Mini Interviews (MMI).",
    details: "Scores are weighted alongside Year 1 academic performance. Only the top candidates are selected for the professional medical program."
  },
  {
    step: 3,
    name: "Professional Medical Years (Years 2 to 6)",
    duration: "5 Years",
    highlights: "Consists of 3 years of clinical sciences and theory, followed by 2 years of clinical internships and hospital placements.",
    details: "Graduates are awarded the Bachelor of Medicine and Bachelor of Surgery (MBChB) degree, permitting clinical registration in NZ & Australia."
  }
];

const admissionPrereqs = [
  { title: "NEET Qualification", desc: "Mandatory for Indian citizens to practice back in India after graduation." },
  { title: "UCAT ANZ Test", desc: "Measures cognitive abilities, situational judgment, and communication skills." },
  { title: "High Academic Grades", desc: "90%+ in high school CBSE/ICSE (Physics, Chemistry, Biology) to enter the Pre-Med year." },
  { title: "English Proficiency", desc: "IELTS score of 7.5 overall with no band below 7.0 (or equivalent TOEFL score)." }
];

const NewZealandMBBSCourse = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [currency, setCurrency] = useState('INR'); // 'NZD' | 'INR'
  const exchangeRate = 53.70; // Reference 1 NZD = 53.70 INR

  const formatCost = (valInNZD) => {
    if (currency === 'NZD') {
      return `NZ$ ${valInNZD.toLocaleString()}`;
    }
    const valInINR = Math.round(valInNZD * exchangeRate);
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  const activeStepObj = medicalPathways.find(p => p.step === activeStep) || medicalPathways[0];

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-red-100/20 via-indigo-50/15 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-red-200/5 to-indigo-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/new-zealand" className="hover:text-indigo-650 transition-colors">New Zealand</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Medicine (MBChB / MBBS)</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <ShieldAlert size={14} className="text-red-650 animate-pulse" />
            <span>NZ Medical Admissions 2026/27</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Medicine (MBChB) in{' '}
            <span className="bg-gradient-to-r from-red-600 to-indigo-600 bg-clip-text text-transparent">New Zealand</span>
          </h1>
          <p className="text-slate-655 text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto">
            Become a licensed medical practitioner. New Zealand offers the Bachelor of Medicine and Bachelor of Surgery (MBChB) at two world-class institutions through a selective first-year pathway.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { val: "6 Years", label: "Program Duration" },
              { val: "2 Schools Only", label: "Auckland & Otago" },
              { val: "UCAT ANZ", label: "Mandatory Entrance Test" },
              { val: "Green List", label: "Immediate PR Pathway" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-xs backdrop-blur-md">
                <p className="text-xl font-black text-indigo-655">{stat.val}</p>
                <p className="text-[10px] text-slate-500 font-extrabold mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-sm inline-flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-black uppercase px-3 tracking-wider">Currency Tool:</span>
            <button 
              onClick={() => setCurrency('NZD')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'NZD' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-655 hover:bg-slate-50'}`}
            >
              NZD ($)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-655 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* CRITICAL WARNING ALERT */}
        <div className="bg-amber-50 border border-amber-200 rounded-[28px] p-6 md:p-8 max-w-4xl mx-auto mb-16 flex items-start gap-4 shadow-sm">
          <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-black text-slate-900 text-sm md:text-base">Important Entry Information</h3>
            <p className="text-slate-655 text-xs font-semibold leading-relaxed mt-2">
              Unlike other nations, international students **cannot apply directly** to a 5-year MBBS. You must enroll in the first-year HSFY or Biomedical sciences pre-medical track in New Zealand. Entry to Year 2 is highly competitive, based on your Year 1 grades (GPAs), UCAT ANZ scores, and interview performance.
            </p>
          </div>
        </div>

        {/* SECTION 1: INTERACTIVE PIPELINE STEPPER */}
        <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl mb-16">
          <div className="max-w-3xl mb-8">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="text-indigo-650" size={22} />
              Structure of the Medical Pathway
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">Select a stage below to examine milestones and requirements.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-none border-b lg:border-b-0 lg:border-r border-slate-100">
              {medicalPathways.map(p => (
                <button
                  key={p.step}
                  onClick={() => setActiveStep(p.step)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left whitespace-nowrap lg:whitespace-normal cursor-pointer ${activeStep === p.step ? 'bg-indigo-50 text-indigo-900 font-black' : 'hover:bg-slate-50 text-slate-500 font-semibold'}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${activeStep === p.step ? 'bg-indigo-650 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {p.step}
                  </span>
                  <span className="text-xs uppercase tracking-wider hidden sm:inline lg:block">Stage {p.step}</span>
                </button>
              ))}
            </div>

            <div className="bg-slate-50/50 border border-slate-100 p-6 md:p-8 rounded-2xl flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <span className="text-[10px] text-indigo-650 font-black uppercase tracking-wider block">Phase {activeStep} of 3</span>
                  <h3 className="text-base md:text-lg font-black text-slate-905">{activeStepObj.name}</h3>
                  <p className="text-indigo-650 text-xs font-extrabold flex items-center gap-1">
                    <Clock size={12} />
                    Duration: {activeStepObj.duration}
                  </p>
                  <p className="text-slate-655 text-xs font-semibold leading-relaxed mt-4">
                    {activeStepObj.highlights}
                  </p>
                  <p className="text-slate-550 text-xs font-medium leading-relaxed bg-white border border-slate-100 p-4 rounded-xl mt-4">
                    {activeStepObj.details}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex justify-between items-center border-t border-slate-200/50 pt-4">
                <span className="text-[10px] text-slate-400 font-bold">Entry into the professional years relies entirely on competitive ranking.</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                    disabled={activeStep === 1}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-black disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setActiveStep(prev => Math.min(3, prev + 1))}
                    disabled={activeStep === 3}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-black disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: COSTS & SCHOOLS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Medical Schools & Cost */}
          <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                <Coins className="text-indigo-655" size={20} />
                Medical Program Tuition Fees
              </h2>
              <p className="text-slate-500 text-xs font-semibold mb-6">Tuition for international clinical studies in New Zealand is premium-tier.</p>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-905 text-xs block">University of Auckland (MBChB)</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">QS Rank #65</span>
                  </div>
                  <span className="font-black text-indigo-655 text-xs md:text-sm">
                    {formatCost(79000)} / year
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-905 text-xs block">University of Otago (MBChB)</span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">QS Rank #197</span>
                  </div>
                  <span className="font-black text-indigo-655 text-xs md:text-sm">
                    {formatCost(84000)} / year
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-6 mt-6">
              <span className="text-[10px] text-slate-400 font-bold block leading-relaxed">
                * Note: Year 1 Pre-Med tuition fees are lower (approx. {formatCost(33000)} - {formatCost(38000)}), but clinical professional years (Years 2-6) incur the full specialist rates shown above.
              </span>
            </div>
          </div>

          {/* Requirements & Checklist */}
          <div className="bg-indigo-50/30 border border-indigo-100 rounded-[32px] p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={20} />
                Entry Requirements
              </h2>
              <p className="text-slate-500 text-xs font-semibold mb-6">Prerequisites required specifically for international applicants.</p>

              <div className="space-y-3.5">
                {admissionPrereqs.map((item, idx) => (
                  <div key={idx} className="bg-white/80 border border-slate-150 p-4 rounded-xl">
                    <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      {item.title}
                    </h4>
                    <p className="text-slate-655 text-[11px] font-semibold leading-relaxed mt-1">{item.desc}</p>
                  </div>
                ))}
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

export default NewZealandMBBSCourse;
