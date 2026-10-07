import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, BookOpen, Clock, HelpCircle, CheckCircle2, 
  ArrowRight, Landmark, FileText, ChevronRight, Award, 
  MapPin, Languages, Sparkles, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const publicUnis = [
  {
    name: "Université Paris-Saclay",
    qsRank: "#70 Global",
    city: "Orsay (Paris)",
    strengths: "Mathematics, Physics, Engineering, Artificial Intelligence",
    logo: "https://logo.clearbit.com/universite-paris-saclay.fr",
    website: "https://www.universite-paris-saclay.fr",
    desc: "A globally renowned research hub representing 13% of France's entire scientific research output. Highly ranked for Mathematics."
  },
  {
    name: "Sorbonne University",
    qsRank: "#72 Global",
    city: "Paris",
    strengths: "Arts & Humanities, Medicine, Marine Biology, Computer Science",
    logo: "https://logo.clearbit.com/sorbonne-universite.fr",
    website: "https://www.sorbonne-universite.fr",
    desc: "Combining historical roots in the Latin Quarter with state-of-the-art facilities in sciences and medicine."
  },
  {
    name: "Université Paris Cité",
    qsRank: "#300 Global",
    city: "Paris",
    strengths: "Medicine, Health Sciences, Dentistry, Chemistry, Life Sciences",
    logo: "https://logo.clearbit.com/u-paris.fr",
    website: "https://u-paris.fr",
    desc: "One of France's largest medical and multidisciplinary public research institutions formed by merging prestigious Paris colleges."
  },
  {
    name: "Aix-Marseille Université",
    qsRank: "#380 Global",
    city: "Marseille",
    strengths: "Economics, Management, Law, Nanosciences, Environmental Tech",
    logo: "https://logo.clearbit.com/univ-amu.fr",
    website: "https://www.univ-amu.fr",
    desc: "The largest university in the French-speaking world by student population, boasting strong ties to Mediterranean research clusters."
  },
  {
    name: "Université de Montpellier",
    qsRank: "#450 Global",
    city: "Montpellier",
    strengths: "Medicine, Law, Agronomy, Biotechnology, Ecology",
    logo: "https://logo.clearbit.com/umontpellier.fr",
    website: "https://www.umontpellier.fr",
    desc: "Founded in 1289, it holds the oldest active medical school in the world. It ranks 1st globally for Ecology research."
  },
  {
    name: "Université Toulouse 1 Capitole",
    qsRank: "#520 Global",
    city: "Toulouse",
    strengths: "Economics, Business Law, Political Science, Toulouse School of Economics",
    logo: "https://logo.clearbit.com/ut-capitole.fr",
    website: "https://www.ut-capitole.fr",
    desc: "Home to the world-famous Toulouse School of Economics (TSE) led by Nobel Laureate Jean Tirole."
  },
  {
    name: "Université d'Orléans",
    qsRank: "Top 800",
    city: "Orléans",
    strengths: "Energy Engineering, Logistics, Chemistry, Business Administration",
    logo: "https://logo.clearbit.com/univ-orleans.fr",
    website: "https://www.univ-orleans.fr",
    desc: "A historic public university located in the Loire Valley, popular for engineering courses with strong industry partnerships."
  }
];

const eefSteps = [
  {
    step: 1,
    title: "Etudes en France (EEF) Registration",
    desc: "Create an online account on the official Campus France EEF portal. This is a centralized mandatory system for Indian students applying to French public institutions."
  },
  {
    step: 2,
    title: "Program Selection (Max 7 Options)",
    desc: "Search, filter, and add up to 7 degree programs in parallel. You can apply to various public universities and select courses matching your past academic field."
  },
  {
    step: 3,
    title: "Upload Academic Portfolio & Pay Fee",
    desc: "Upload scanned copies of transcript files, degree certificates, CV, motivation letters, and passport. Pay the processing fee of approximately ₹18,000 INR."
  },
  {
    step: 4,
    title: "Campus France Interview",
    desc: "Attend an interview with a Campus France academic advisor (either in-person at your nearest local office or online). Discuss your career goals and chosen programs."
  },
  {
    step: 5,
    title: "Receive Admissions Offers",
    desc: "French public universities will review your dossier and send offers directly via the EEF portal. Select your final choice and print the official admission attestation."
  },
  {
    step: 6,
    title: "Book Visa Appointment",
    desc: "Log on to the France-Visas portal to request your VLS-TS student visa. Show your EEF admission certificate to get the visa processing waiver benefits."
  }
];

const languageRequirements = {
  english: {
    title: "English-Taught Degrees",
    tests: "IELTS, TOEFL iBT, or PTE Academic",
    cutoff: "IELTS 6.0 - 6.5 minimum (No individual band below 5.5). TOEFL iBT score of 80+.",
    waiver: "Medium of Instruction (MOI) Certificate from your Indian university is accepted by select public engineering schools if your entire degree was in English.",
    tip: "Most engineering & business masters are 100% in English. Check program descriptions on the EEF portal."
  },
  french: {
    title: "French-Taught Degrees",
    tests: "DELF B2 or DALF C1",
    cutoff: "DELF B2 minimum for Bachelor's. DALF C1 (Advanced) highly recommended for Law, Arts, and Medicine Master's.",
    waiver: "Students holding a French Baccalauréat or who graduated from a French bilingual school are exempt.",
    tip: "Tuition in French is identical to English, but learning French opens up local internship pipelines."
  }
};

const FrancePublic = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [languageMode, setLanguageMode] = useState('english'); // 'english' | 'french'
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const exchangeRate = 110.14; // Reference 1 EUR ≈ 110.14 INR

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = Math.round(valInEUR * exchangeRate);
    return `₹ ${valInINR.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-[#e0e7ff]/30 via-indigo-50/10 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-300/10 to-indigo-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/france" className="hover:text-indigo-650 transition-colors">France</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Public Universities</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <Landmark size={14} className="text-indigo-650 animate-pulse" />
            <span>State-Funded Public Institutions 2026/27</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Explore Public Universities in{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">France</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto">
            Benefiting from massive French taxpayer subsidies, public research universities offer world-class education at standard, government-regulated tuition prices (€3,770/year for master's programs).
          </p>
        </motion.div>

        {/* Currency Selector (For general visual consistency) */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-sm inline-flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-black uppercase px-3 tracking-wider">Currency context:</span>
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-50'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* TAXPAYER SUBSIDY CALLOUT */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-[32px] p-8 md:p-12 shadow-xl mb-16 relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-20%] w-[380px] h-[380px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-indigo-400" size={20} />
                <span className="text-xs font-black text-indigo-300 uppercase tracking-widest">How Subsidies Work</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-3">Subsidized Higher Education</h2>
              <p className="text-white/80 text-xs md:text-sm font-semibold leading-relaxed">
                The French state covers approximately **80% to 90%** of the real cost of education at national public universities for non-EU international students. While a standard master's degree in engineering or pure sciences costs the government around €14,000 per student per year, you only pay **€3,770** per year.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <span className="text-[9px] text-indigo-200 font-black block uppercase tracking-wider">Bachelor's Fee</span>
                  <span className="text-sm font-black">{formatCost(2770)}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <span className="text-[9px] text-indigo-200 font-black block uppercase tracking-wider">Master's Fee</span>
                  <span className="text-sm font-black">{formatCost(3770)}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <span className="text-[9px] text-indigo-200 font-black block uppercase tracking-wider">PhD Fee</span>
                  <span className="text-sm font-black">{formatCost(380)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-6 border border-white/10 space-y-4">
              <span className="text-xs font-black text-indigo-200 uppercase tracking-widest block flex items-center gap-1">
                <AlertTriangle size={14} className="text-amber-400" />
                ECTS Alignment Constraint
              </span>
              <p className="text-[11px] text-white/90 leading-relaxed font-semibold">
                To secure admissions, French public universities strictly evaluate your ECTS credits compatibility. Candidates must prove their undergraduate course content is highly relevant to the Master's field of specialization.
              </p>
            </div>
          </div>
        </div>

        {/* DYNAMIC PUBLIC UNIVERSITIES LIST */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 text-center md:text-left">
            Top Subsidized Public Universities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {publicUnis.map((uni, idx) => (
              <div 
                key={idx}
                className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm">
                      <img 
                        src={uni.logo} 
                        alt="" 
                        className="w-full h-full object-contain" 
                        onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-indigo-650 font-black uppercase tracking-wider">
                        <Award size={12} />
                        <span>{uni.qsRank}</span>
                      </div>
                      <h3 className="font-black text-slate-900 text-sm md:text-base leading-tight mt-0.5">
                        {uni.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                        <MapPin size={11} className="text-slate-405" />
                        {uni.city}, France
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-650 text-xs font-semibold leading-relaxed mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    {uni.desc}
                  </p>

                  <div className="bg-slate-50/40 border border-slate-100/50 p-3.5 rounded-xl mb-6">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Key Areas of Strength</span>
                    <span className="font-extrabold text-slate-800 text-[11px] mt-0.5 block">{uni.strengths}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Standard Tuition Fee</span>
                    <span className="text-xs font-black text-indigo-650 mt-0.5 block">
                      {formatCost(3770)} / year
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={uni.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all text-xs font-black"
                    >
                      Official site
                    </a>
                    <Link 
                      to={`/contact?subject=Apply to ${encodeURIComponent(uni.name)}`}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl transition-all text-xs font-black"
                    >
                      Inquire
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EEF PORTAL STEP-BY-STEP ADMISSION PROCEDURE */}
        <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl mb-16">
          <div className="max-w-3xl mb-8">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="text-indigo-600" size={22} />
              Centralized EEF Portal Admissions Flow
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              Indian students must apply through the official Études en France portal. Follow our step-by-step guideline.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Steps Navigation */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-none border-b lg:border-b-0 lg:border-r border-slate-100">
              {eefSteps.map(s => (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left whitespace-nowrap lg:whitespace-normal cursor-pointer ${activeStep === s.step ? 'bg-indigo-50 text-indigo-900 font-black' : 'hover:bg-slate-50 text-slate-500 font-semibold'}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${activeStep === s.step ? 'bg-indigo-650 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {s.step}
                  </span>
                  <span className="text-xs uppercase tracking-wider hidden sm:inline lg:block">Step {s.step}</span>
                </button>
              ))}
            </div>

            {/* Step Detail Content */}
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
                  <span className="text-[10px] text-indigo-650 font-black uppercase tracking-wider block">
                    Phase {activeStep} of 6
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    {eefSteps[activeStep - 1].title}
                  </h3>
                  <p className="text-slate-655 text-xs font-medium leading-relaxed">
                    {eefSteps[activeStep - 1].desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex justify-between items-center border-t border-slate-200/50 pt-6">
                <span className="text-[10px] text-slate-400 font-bold">Admissions Window: October to December for Fall Intake</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                    disabled={activeStep === 1}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-black disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setActiveStep(prev => Math.min(6, prev + 1))}
                    disabled={activeStep === 6}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-black disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LANGUAGE REQUIREMENTS SELECTOR */}
        <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl">
          <div className="max-w-3xl mb-8">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Languages className="text-indigo-650" size={22} />
              Language Cutoffs & Testing Requirements
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              Select your target teaching language pathway to analyze mandatory test thresholds.
            </p>
          </div>

          <div className="flex gap-2 mb-6 p-1 bg-slate-50 rounded-xl border border-slate-200/40 max-w-sm">
            <button 
              onClick={() => setLanguageMode('english')}
              className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all ${languageMode === 'english' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              English Programs
            </button>
            <button 
              onClick={() => setLanguageMode('french')}
              className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all ${languageMode === 'french' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              French Programs
            </button>
          </div>

          <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className="text-[10px] text-indigo-650 font-black uppercase tracking-wider block mb-1">Target test exams</span>
              <h4 className="text-base font-black text-slate-900">{languageRequirements[languageMode].title}</h4>
              <p className="text-indigo-650 text-xs font-extrabold mt-1">{languageRequirements[languageMode].tests}</p>
              
              <div className="bg-white/80 border border-slate-100 p-4 rounded-xl mt-6">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Test score cutoff</span>
                <p className="text-slate-800 text-xs font-black leading-relaxed">{languageRequirements[languageMode].cutoff}</p>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div className="space-y-4 text-xs font-semibold leading-relaxed">
                <p className="text-slate-655"><strong className="text-slate-900 font-bold block">Waiver Options Available:</strong> {languageRequirements[languageMode].waiver}</p>
                <p className="text-slate-550"><strong className="text-slate-900 font-bold block">Strategic Advice:</strong> {languageRequirements[languageMode].tip}</p>
              </div>

              <div className="border-t border-slate-200/50 pt-4 mt-6">
                <Link 
                  to="/contact?subject=Language Waiver Evaluation"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-650 hover:text-indigo-750 font-black"
                >
                  <span>Request eligibility check</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>


      {/* CTA Section */}
      <StudyAbroadCTA country="France" />

      </div>
    </div>
  );
};

export default FrancePublic;
