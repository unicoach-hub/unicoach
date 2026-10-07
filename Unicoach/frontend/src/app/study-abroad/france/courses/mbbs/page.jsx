import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Clock, HelpCircle, CheckCircle2, ArrowRight, 
  Award, MapPin, Sparkles, Brain, Search, Briefcase, Coins, Database,
  GraduationCap, Globe, Compass, ShieldCheck, ChevronDown, ListFilter,
  Check, AlertCircle, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'why-medicine', title: 'Language & Structure Warning' },
  { id: 'medical-cycles', title: 'Three Training Cycles' },
  { id: 'admissions', title: 'NEET & Language Checks' },
  { id: 'cost-study', title: 'Subsidized Public Fees' },
  { id: 'careers', title: 'Doctorate of Medicine Diploma' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const medicalCycles = [
  {
    cycle: 1,
    name: "First Cycle (DFGSM - Years 1 to 3)",
    duration: "3 Years",
    highlights: "Includes Year 1 (PASS or L.AS pathway), which is highly competitive and has a strict entry selection. Covers fundamental biophysics, anatomy, physiology, and biochemistry.",
    details: "Students choose between PASS (focused health track with minor in sciences) or L.AS (standard science/arts major with health minor). Only the top performers advance to Year 2."
  },
  {
    cycle: 2,
    name: "Second Cycle (DFASM - Years 4 to 6)",
    duration: "3 Years",
    highlights: "Focuses on advanced clinical sciences, clinical pathology, and hospital rotations (externship). Students earn a monthly stipend while working in public hospitals.",
    details: "Prepares candidates for the national ranking exams (EDN - Épreuves Dématérialisées Nationales), which determine residency specialization and hospital location placements."
  },
  {
    cycle: 3,
    name: "Third Cycle (Internship / Specialization)",
    duration: "3 to 5+ Years",
    highlights: "General medicine (3 years) or surgical/specialist tracks (4-5 years). Residents operate with medical authority under senior supervision.",
    details: "Concludes with the defense of a doctoral thesis, awarding the 'Diplôme d'État de Docteur en Médecine' (State Diploma of Doctor of Medicine), permitting clinical practice in the EU."
  }
];

const admissionChecks = [
  { title: "French Language Proficiency", desc: "DELF B2 or DALF C1 certificate. Public medical faculties are taught 100% in French, including client-facing clinical rotations." },
  { title: "NEET Qualification", desc: "Indian students must have a valid qualifying NEET score to ensure eligibility to practice in India upon graduation." },
  { title: "Academic Background", desc: "10+2 high school certification with excellent marks in Physics, Chemistry, and Biology." },
  { title: "Centralized Application", desc: "Completed dossier submitted via the Campus France Études en France portal before the December deadlines." }
];

const FranceMBBSCourse = () => {
  const [activeSection, setActiveSection] = useState('why-medicine');
  const [activeCycle, setActiveCycle] = useState(1);
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [faqOpen, setFaqOpen] = useState({});
  const exchangeRate = 107.0; // Reference 1 EUR = 107 INR

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = Math.round(valInEUR * exchangeRate);
    return `₹ ${valInINR.toLocaleString()}`;
  };

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  const activeCycleObj = medicalCycles.find(c => c.cycle === activeCycle) || medicalCycles[0];

  return (
    <div className="min-h-screen bg-[#fafcff] pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <Link to="/study-abroad/france" className="hover:text-indigo-650 transition-colors">France</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <span className="text-slate-600 font-bold">Medical Training (MBBS Equivalent)</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80" 
              alt="Medical Training France" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <AlertCircle size={14} />
              Medical Pathway
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Medicine (MBBS Equivalent) in France
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              France does not offer an English-taught 'MBBS' course. Students enter a highly prestigious, French-medium national training pathway leading to the State Doctor of Medicine Diploma.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: January 23, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                10 min read
              </span>
            </div>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-xs inline-flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase px-3 tracking-wider">Currency Context:</span>
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 2-Column Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Sidebar Navigator */}
          <div className="lg:col-span-3 sticky top-28 hidden lg:block bg-white/70 border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <ListFilter size={16} className="text-indigo-650" />
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Page Navigator</span>
            </div>
            <div className="space-y-1.5">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer block
                    ${activeSection === sec.id 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-855 hover:bg-slate-50'}`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Content Blocks */}
          <div className="lg:col-span-9 space-y-16">
            
            {/* 1. Language & Structure Warning */}
            <section id="why-medicine" className="scroll-mt-24">
              <div className="bg-amber-50 border border-amber-250 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-amber-950 mb-2 flex items-center gap-2">
                  <AlertTriangle className="text-amber-600 animate-pulse" size={24} />
                  Critical Warning: Language Mandate
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  There are **no English-taught medical degrees** at public universities in France. Clinical internships and hospital ward duties require direct patient interactions, making a B2/C1 French certificate compulsory. Be cautious of private third-party agencies claiming to offer English-taught degrees.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
                  <div className="bg-white p-4 rounded-xl border border-amber-100">
                    <span className="text-slate-400 block uppercase text-[9px]">Total Duration</span>
                    <strong className="text-slate-900 font-black text-sm block mt-0.5">9 - 11+ Years</strong>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-amber-100">
                    <span className="text-slate-400 block uppercase text-[9px]">French Cutoff</span>
                    <strong className="text-slate-900 font-black text-sm block mt-0.5">DELF B2 / C1</strong>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-amber-100">
                    <span className="text-slate-400 block uppercase text-[9px]">NEET Exam</span>
                    <strong className="text-slate-900 font-black text-sm block mt-0.5">Mandatory</strong>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-amber-100">
                    <span className="text-slate-400 block uppercase text-[9px]">Fees System</span>
                    <strong className="text-slate-900 font-black text-sm block mt-0.5">Subsidized</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Three Training Cycles */}
            <section id="medical-cycles" className="scroll-mt-24">
              <div className="bg-white/60 border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 mb-2">
                  <BookOpen className="text-indigo-650" size={22} />
                  Structure of French Medical Studies (Cycles)
                </h2>
                <p className="text-slate-500 text-xs font-semibold mb-6">Select a training cycle to review duration, structure, and milestones.</p>

                <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
                  <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-none border-b lg:border-b-0 lg:border-r border-slate-100">
                    {medicalCycles.map(c => (
                      <button
                        key={c.cycle}
                        onClick={() => setActiveCycle(c.cycle)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left whitespace-nowrap lg:whitespace-normal cursor-pointer ${activeCycle === c.cycle ? 'bg-indigo-50 text-indigo-900 font-black' : 'hover:bg-slate-50 text-slate-500 font-semibold'}`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${activeCycle === c.cycle ? 'bg-indigo-650 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {c.cycle}
                        </span>
                        <span className="text-xs tracking-wider">Cycle {c.cycle}</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-4">
                      <span className="text-[10px] text-indigo-650 font-black uppercase tracking-wider block">Phase {activeCycle} of 3</span>
                      <h3 className="text-base font-black text-slate-905">{activeCycleObj.name}</h3>
                      <p className="text-indigo-605 text-xs font-extrabold flex items-center gap-1">
                        <Clock size={12} /> Duration: {activeCycleObj.duration}
                      </p>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-4">
                        {activeCycleObj.highlights}
                      </p>
                      <p className="text-slate-550 text-xs font-medium leading-relaxed bg-white border border-slate-100 p-4 rounded-xl mt-4">
                        {activeCycleObj.details}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. NEET & Language Checks */}
            <section id="admissions" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-650" size={24} />
                  📋 Prerequisites & Admission Checks
                </h2>
                <p className="text-slate-450 text-xs font-bold mb-6">Requirements required specifically for Indian medical cohorts</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {admissionChecks.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        {item.title}
                      </h4>
                      <p className="text-slate-500 text-[11px] font-semibold leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Subsidized Public Fees */}
            <section id="cost-study" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  💰 Subsidized Medical Tuition Fees
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Regulated public university medical fees in France</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 font-semibold">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">Public Tuition (Annual)</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">Subsidized state medical fee</span>
                    </div>
                    <span className="font-black text-indigo-650 text-xs md:text-sm">
                      {formatCost(170)} - {formatCost(3000)} / yr
                    </span>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">Student Service Fee (CVEC)</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">Mandatory student welfare contribution</span>
                    </div>
                    <span className="font-black text-indigo-655 text-xs">
                      {formatCost(105)} / yr
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Doctorate of Medicine Diploma */}
            <section id="careers" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Briefcase className="text-indigo-650" size={24} />
                  🎓 Clinical Qualifications & Practice Right
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Earning your credentials and clinical licenses in Europe</p>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs text-slate-700 font-semibold leading-relaxed">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">Diplôme d'État de Docteur en Médecine</h4>
                  <p className="text-slate-500 mb-4">
                    Upon defending their doctoral thesis, graduates are awarded the state diploma of doctor of medicine. This diploma grants licensing rights to practice medicine anywhere within the European Union.
                  </p>
                  <div className="bg-white border border-slate-100 p-4 rounded-xl">
                    ⚠️ **For Practice in India**: Indian graduates must sit for and pass the MCI/NMC screening exam (FMGE or NEXT) to validate their foreign degrees for clinical operations inside India.
                  </div>
                </div>
              </div>
            </section>

            {/* 6. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about medicine courses in France</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "Is there any English-taught MBBS equivalent in France?", a: "No. All medical training cycles at French public universities are taught 100% in French. Clinical work in public hospital wards requires fluent French (minimum B2/C1 levels)." },
                  { q: "Do Indian students need to clear the NEET exam to study medicine in France?", a: "Yes. Qualifying in the NEET exam is mandatory for Indian citizens intending to study medicine abroad, to guarantee practicing rights in India upon return." },
                  { q: "What is the PASS and L.AS pathway in Year 1?", a: "PASS is a dedicated health track with a minor in another science field. L.AS is a standard bachelor's major with a minor in health sciences. Both are designed as competitive pathways to select Year 2 candidates." }
                ].map((faq, idx) => {
                  const isOpen = !!faqOpen[idx];
                  return (
                    <div key={idx} className="bg-white border border-slate-150 rounded-2xl overflow-hidden transition-all duration-300">
                      <button 
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between p-5 text-left font-black text-slate-800 text-xs md:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <div className="p-5 pt-0 border-t border-slate-50 text-slate-600 text-xs md:text-sm font-semibold leading-relaxed">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>

        </div>

        {/* CTA Section */}
        <div className="mt-16">
          <StudyAbroadCTA country="France" />
        </div>

      </div>
    </div>
  );
};

export default FranceMBBSCourse;
