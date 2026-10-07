import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Clock, HelpCircle, CheckCircle2, ArrowRight, 
  Award, MapPin, Sparkles, Brain, Search, Briefcase, Coins, Database,
  GraduationCap, Globe, Compass, ShieldCheck, ChevronDown, ListFilter,
  Check, AlertCircle, Sparkle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'why-ms', title: 'Why MS in France?' },
  { id: 'universities', title: 'Top 10 Universities' },
  { id: 'specialisations', title: 'Top Specialisations' },
  { id: 'curriculum', title: 'Course Curriculum' },
  { id: 'ug-courses', title: 'Recommended UG Majors' },
  { id: 'admissions', title: 'Admission Dossier' },
  { id: 'cost-study', title: 'Cost of Studying' },
  { id: 'cost-living', title: 'Cost of Living' },
  { id: 'scholarships', title: 'Scholarships' },
  { id: 'careers', title: 'Career Outcomes' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const topMSUnis = [
  { rank: 1, name: "Université PSL", qsRank: "#28", tuitionEUR: 3941, focus: "Multidisciplinary, Research", tagline: "France's #1 University" },
  { rank: 2, name: "École Polytechnique", qsRank: "#41", tuitionEUR: 15000, focus: "Engineering, Data Science, AI", tagline: "France's MIT Equivalent" },
  { rank: 3, name: "HEC Paris Business School", qsRank: "#1 Masters", tuitionEUR: 31750, focus: "Finance, Management, Business Analytics", tagline: "Top Business School in Europe" },
  { rank: 4, name: "INSEAD", qsRank: "#2 MBA", tuitionEUR: 25000, focus: "MBA, Management, Strategy", tagline: "Elite Executive Training" },
  { rank: 5, name: "Université Paris-Saclay", qsRank: "#71", tuitionEUR: 3941, focus: "Engineering, Technology, Life Sciences", tagline: "Global Scientific Powerhouse" },
  { rank: 6, name: "Sorbonne University", qsRank: "#62", tuitionEUR: 3941, focus: "Sciences, Humanities, Medicine", tagline: "Centuries of Academic Prestige" },
  { rank: 7, name: "ESSEC Business School", qsRank: "Top 30", tuitionEUR: 26000, focus: "Business, Finance, Marketing", tagline: "Triple-Accredited Business Leader" },
  { rank: 8, name: "Sciences Po", qsRank: "#367", tuitionEUR: 17750, focus: "Political Science, International Relations", tagline: "Premier School for Public Policy" },
  { rank: 9, name: "CentraleSupélec", qsRank: "Top 150", tuitionEUR: 13500, focus: "Engineering, Energy, AI", tagline: "Top Selective Engineering College" },
  { rank: 10, name: "Université Paris Cité", qsRank: "#300", tuitionEUR: 11000, focus: "Health Sciences, Life Sciences, Medicine", tagline: "Leading Medical Research Center" }
];

const specialisations = [
  {
    name: "Engineering",
    subfields: "Mechanical, Electrical, Civil, Aerospace",
    highlights: "Practical training + research focus. Close ties with European aerospace hubs (Toulouse) and global automotive leaders.",
    icon: Compass
  },
  {
    name: "Data Science",
    subfields: "Big Data, ML, AI, Business Analytics",
    highlights: "Highest demand (45% job growth in the EU). Heavily combines statistical frameworks with deep machine learning application.",
    icon: Database,
    badge: "Highest Demand"
  },
  {
    name: "Computer Science",
    subfields: "Software Eng, Cybersecurity, Robotics, IT",
    highlights: "Prepares students for the evolving tech industry, emphasizing advanced systems security and automation.",
    icon: Brain
  },
  {
    name: "Business & Management",
    subfields: "Finance, Marketing, Intl Business, SCM",
    highlights: "Offered by world-leading Triple-Accredited Business Schools. Strong management training with international cohorts.",
    icon: Award
  },
  {
    name: "Environmental Science",
    subfields: "Sustainable Development, Environmental Eng",
    highlights: "Interdisciplinary approaches focusing on climate modeling, transition economies, and green engineering.",
    icon: Globe
  },
  {
    name: "Life Sciences",
    subfields: "Biotechnology, Bioinformatics, Molecular Bio",
    highlights: "Access to state-of-the-art research centers. Direct pathways into medical research, oncology, and pharma sectors.",
    icon: BookOpen
  }
];

const curriculumElements = [
  { title: "Core Courses", desc: "Foundational theories and methodologies essential for your specialization. Examples include Advanced Statistical Methods and Machine Learning." },
  { title: "Electives", desc: "Allows students to tailor their education to career goals and academic interests (e.g., Blockchain, Corporate Finance, or Neural Networks)." },
  { title: "Internships", desc: "A mandatory, critical component of MS programs in France. Provides 4 to 6 months of paid practical experience with top employers (Airbus, L'Oréal, Capgemini)." },
  { title: "Research Projects", desc: "Allows students to apply theoretical knowledge to solve real-world industry problems, culminating in a Master's thesis or capstone project." },
  { title: "International Exchange", desc: "Provides global exposure through partnerships with partner universities and business schools worldwide." }
];

const ugRecommendations = [
  { ms: "Engineering", majors: "Mechanical Eng, Electrical Eng, Civil Eng, Computer Eng" },
  { ms: "Data Science", majors: "Computer Science, Statistics, Mathematics, IT" },
  { ms: "Computer Science", majors: "Computer Science, Software Engineering, Cybersecurity" },
  { ms: "Business & Management", majors: "Business Admin, Economics, Finance, Marketing" },
  { ms: "Environmental Science", majors: "Environmental Science, Biology, Chemistry, Geology" },
  { ms: "Life Sciences", majors: "Biology, Biotechnology, Molecular Biology, Health Sciences" },
  { ms: "Economics", majors: "Economics, Finance, Business, Mathematics" },
  { ms: "Political Science", majors: "Political Science, IR, History, Law" }
];

const livingCostsByCity = [
  { city: "Paris", costEUR: "€1,200 - €1,800", costINR: "₹1.28L - ₹1.92L" },
  { city: "Lyon", costEUR: "€800 - €1,200", costINR: "₹85,600 - ₹1.28L" },
  { city: "Marseille", costEUR: "€700 - €1,000", costINR: "₹74,900 - ₹1.07L" },
  { city: "Toulouse", costEUR: "€700 - €1,100", costINR: "₹74,900 - ₹1.17L" },
  { city: "Lille", costEUR: "€650 - €1,000", costINR: "₹69,500 - ₹1.07L" },
  { city: "Nice", costEUR: "€800 - €1,200", costINR: "₹85,600 - ₹1.28L" },
  { city: "Nantes", costEUR: "€600 - €900", costINR: "₹64,200 - ₹96,300" },
  { city: "Grenoble", costEUR: "€650 - €1,000", costINR: "₹69,500 - ₹1.07L" }
];

const livingBreakdown = [
  { item: "Accommodation", eur: "400 - 800", inr: "₹42,800 - ₹85,600" },
  { item: "Food", eur: "200 - 300", inr: "₹21,400 - ₹32,100" },
  { item: "Transport", eur: "30 - 50", inr: "₹3,210 - ₹5,350" },
  { item: "Utilities", eur: "60 - 100", inr: "₹6,420 - ₹10,700" },
  { item: "Internet / Mobile", eur: "25 - 50", inr: "₹2,675 - ₹5,350" },
  { item: "Entertainment", eur: "50 - 100", inr: "₹5,350 - ₹10,700" }
];

const FranceMastersCourse = () => {
  const [activeSection, setActiveSection] = useState('why-ms');
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [faqOpen, setFaqOpen] = useState({});
  const exchangeRate = 107.0; // Reference 1 EUR = 107 INR

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = Math.round(valInEUR * exchangeRate);
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
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

  return (
    <div className="min-h-screen bg-[#fafcff] pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <Link to="/study-abroad/france" className="hover:text-indigo-650 transition-colors">France</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <span className="text-slate-600 font-bold">MS in France Guide 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80" 
              alt="Eiffel Tower Paris" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <GraduationCap size={14} />
              Master of Science (MS)
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              MS in France 2026: Complete Guide for International Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Obtain an elite postgraduate degree from France's top-ranked public universities and Grandes Écoles. Benefit from subsidized public tuition, mandatory internships, and generous stay-back rules.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: January 23, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                15 min read
              </span>
            </div>
          </div>
        </div>

        {/* Currency Selector Bar */}
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
            
            {/* 1. Why MS in France? */}
            <section id="why-ms" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🇫🇷 Why Study MS in France?</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Strategic advantages of French postgraduate degrees in 2026</p>
              </div>

              {/* Grid of Advantages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-indigo-650">🎓 High-Quality Education</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Universities like École Polytechnique, HEC Paris, PSL, and Paris-Saclay are consistently top-ranked on global leaderboards.
                  </p>
                </div>
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-indigo-650">💼 Industry Integration</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Direct academic collaborations with aerospace, manufacturing, and energy giants (Airbus, Renault, TotalEnergies).
                  </p>
                </div>
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-indigo-650">💰 Subsidized Public Fees</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Public university fees are heavily capped by the state compared to private colleges in the UK or US.
                  </p>
                </div>
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-indigo-650">📈 Robust Career Prospects</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Over 90% of graduates find employment within 6 months. Average starting salary packages hover between €40K and €60K.
                  </p>
                </div>
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-indigo-650">🗣️ Multilingual Advantage</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Study fully in English while acquiring conversational French. Combining both languages dramatically increases local job prospects.
                  </p>
                </div>
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-indigo-650">🎨 Rich Cultural Living</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Legendary art, history, cuisine, and scenic European travel links are fully accessible on your student visa.
                  </p>
                </div>
              </div>

              {/* Key Metrics Bar */}
              <div className="bg-slate-50 border border-slate-200/50 p-6 rounded-3xl">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4">MS Key Highlights</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block">Total Universities</span>
                    <strong className="text-slate-850 font-black text-sm block">Over 200</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Program Duration</span>
                    <strong className="text-slate-850 font-black text-sm block">1 - 2 Years</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Intakes</span>
                    <strong className="text-slate-850 font-black text-sm block">Fall (Sept) & Spring (Jan)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Average Stay-back</span>
                    <strong className="text-slate-850 font-black text-sm block">2 Years (APS Stay)</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Top 10 Universities */}
            <section id="universities" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <div className="text-left mb-6">
                  <h2 className="text-2xl font-black text-slate-900 mb-1 flex items-center gap-2">
                    <Award className="text-indigo-650" size={24} />
                    🏛️ Top 10 Universities for MS (2026)
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">QS rankings and average tuition fee estimates</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-450 text-xs font-black uppercase tracking-wider">
                        <th className="pb-3 pr-4">Rank & University</th>
                        <th className="pb-3 pr-4 text-center">QS Rank</th>
                        <th className="pb-3 pr-4">Average Tuition Fee</th>
                        <th className="pb-3 pr-4 text-right">Focus Area</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705 font-semibold">
                      {topMSUnis.map((uni, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4">
                            <span className="text-slate-900 font-extrabold block">#{uni.rank} {uni.name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{uni.tagline}</span>
                          </td>
                          <td className="py-4 text-center">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-700">
                              {uni.qsRank}
                            </span>
                          </td>
                          <td className="py-4 font-black text-indigo-655">
                            {formatCost(uni.tuitionEUR)} / year
                          </td>
                          <td className="py-4 text-right text-xs text-slate-500 font-medium max-w-xs">{uni.focus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 3. Top MS Specialisations */}
            <section id="specialisations" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1 flex items-center gap-2">
                  <Database className="text-indigo-650" size={24} />
                  🎯 Top MS Specialisations in France
                </h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Most popular and highly demanded postgraduate majors</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {specialisations.map((spec, idx) => {
                  const Icon = spec.icon;
                  return (
                    <div key={idx} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Icon size={18} />
                          </div>
                          {spec.badge && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-black text-emerald-700 uppercase tracking-wider animate-pulse">
                              {spec.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-black text-slate-800 mb-1">{spec.name}</h3>
                        <div className="text-[10px] text-indigo-600 font-black uppercase tracking-wider mb-3">Subfields: {spec.subfields}</div>
                        <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">{spec.highlights}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. Course Curriculum */}
            <section id="curriculum" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <BookOpen className="text-indigo-650" size={24} />
                  📖 MS Curriculum Structure
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Overview of core frameworks, electives, and graduation modules</p>

                <div className="space-y-4">
                  {curriculumElements.map((elem, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center font-black text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-slate-850 text-xs md:text-sm">{elem.title}</h4>
                        <p className="text-slate-550 text-[11px] font-semibold mt-0.5 leading-relaxed">{elem.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. Recommended UG Courses */}
            <section id="ug-courses" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <GraduationCap className="text-indigo-650" size={24} />
                  🎓 Recommended UG Courses for MS
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Major eligibility alignments from Bachelor's to Master's degrees</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-450 text-xs font-black uppercase tracking-wider">
                        <th className="pb-3 pr-4">Proposed MS Specialisation</th>
                        <th className="pb-3 pr-4 text-right">Recommended Undergraduate Majors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705 font-semibold">
                      {ugRecommendations.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 text-slate-900 font-extrabold">{row.ms}</td>
                          <td className="py-3 text-right text-slate-500 font-medium text-xs max-w-md">{row.majors}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 6. Admission Requirements */}
            <section id="admissions" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-650" size={24} />
                  📋 MS Admission Dossier & Visa Requirements
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* General */}
                  <div>
                    <h4 className="font-extrabold text-xs text-indigo-650 uppercase tracking-wider mb-3">General Academic Requirements</h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-655">
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Bachelor's degree in a relevant field</li>
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Official transcripts from all previous years</li>
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> 2-3 Letters of Recommendation (LORs)</li>
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Statement of Purpose (SOP) & Resume</li>
                    </ul>
                  </div>

                  {/* Additional */}
                  <div>
                    <h4 className="font-extrabold text-xs text-indigo-650 uppercase tracking-wider mb-3">Additional Credentials</h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-655">
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> GRE/GMAT scores (highly course-specific)</li>
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Detailed academic essays (if required)</li>
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Passport copy & EEF application fee</li>
                    </ul>
                  </div>

                  {/* Visa */}
                  <div>
                    <h4 className="font-extrabold text-xs text-indigo-650 uppercase tracking-wider mb-3">Visa Dossier Checklist</h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-655">
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Campus France registration validation</li>
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> VLS-TS Long-Stay visa application</li>
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Proof of financial means (minimum €615/month)</li>
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Accommodation reservation for first 3 months</li>
                    </ul>
                  </div>

                  {/* Work permit */}
                  <div>
                    <h4 className="font-extrabold text-xs text-indigo-650 uppercase tracking-wider mb-3">Post-Graduate Work Permit</h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-655">
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Legal part-time work: 964 hours / year</li>
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Post-Graduation stay-back: 12-24 months (APS)</li>
                      <li className="flex items-start gap-1.5"><Check size={14} className="text-emerald-500 mt-0.5 shrink-0" /> Status change upon securing full-time job</li>
                    </ul>
                  </div>
                </div>

                {/* Language requirements */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-3">English Proficiency Cutoffs</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="bg-white p-4 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block uppercase tracking-wide text-[9px]">IELTS Cutoff</span>
                      <strong className="text-slate-850 font-black text-sm block mt-0.5">6.0 – 7.0</strong>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block uppercase tracking-wide text-[9px]">TOEFL Cutoff</span>
                      <strong className="text-slate-850 font-black text-sm block mt-0.5">80 – 100</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Cost of Studying */}
            <section id="cost-study" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  💰 Cost of Studying MS in France
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Tuition estimates at public universities versus private Grande École campuses</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Public */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">Public Universities (State-Funded)</h4>
                      <p className="text-slate-550 text-xs font-semibold leading-relaxed">
                        Heavily subsidized by the French taxpayer. Non-EU students pay minor administration fees.
                      </p>
                    </div>
                    <div className="mt-4">
                      <strong className="text-slate-900 text-xl font-black block">{formatCost(3770)} / year</strong>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Subsidized Master's tuition rate</span>
                    </div>
                  </div>

                  {/* Private */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">Private Universities & Business Schools</h4>
                      <p className="text-slate-550 text-xs font-semibold leading-relaxed">
                        Grandes Écoles (HEC Paris, INSEAD, ESSEC, EDHEC) operate under private structures.
                      </p>
                    </div>
                    <div className="mt-4">
                      <strong className="text-slate-900 text-xl font-black block">{formatCost(15000)} - {formatCost(30000)} / year</strong>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Average MBA/MIM tuition rates</span>
                    </div>
                  </div>
                </div>

                {/* Fees table */}
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl">
                  <h4 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider mb-4">Estimated MS Budget Breakdown</h4>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left font-semibold">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                          <th className="pb-2">Expense Category</th>
                          <th className="pb-2 text-right">Annual Cost (EUR vs INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr>
                          <td className="py-2.5">Tuition Fees (Public University)</td>
                          <td className="py-2.5 text-right font-black text-indigo-650">{formatCost(3770)}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5">Tuition Fees (Private / Grandes Écoles)</td>
                          <td className="py-2.5 text-right font-black text-indigo-650">{formatCost(15000)}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5">University Registration Fees</td>
                          <td className="py-2.5 text-right font-black text-indigo-650">{formatCost(250)}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5">Books & Study Supplies</td>
                          <td className="py-2.5 text-right font-black text-indigo-650">{formatCost(350)}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5">Student Services Fee (CVEC Contribution)</td>
                          <td className="py-2.5 text-right font-black text-indigo-650">{formatCost(100)}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5">Travel Health Insurance (Private Top-Up)</td>
                          <td className="py-2.5 text-right font-black text-indigo-650">{formatCost(215)}</td>
                        </tr>
                        <tr>
                          <td className="py-2.5">Miscellaneous Administrative Costs</td>
                          <td className="py-2.5 text-right font-black text-indigo-650">{formatCost(150)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. Cost of Living */}
            <section id="cost-living" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Compass className="text-indigo-650" size={24} />
                  💶 Cost of Living in France
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Monthly living expense estimations across major French student destinations</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Living Costs by City */}
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4">Estimated Monthly Budget by City</h4>
                    <div className="divide-y divide-slate-100 text-xs font-semibold">
                      {livingCostsByCity.map((row, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between">
                          <span className="text-slate-700">{row.city}</span>
                          <span className="text-indigo-650 font-black">
                            {currency === 'EUR' ? row.costEUR : row.costINR} / mo
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monthly breakdown */}
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4">Monthly Expenses Breakdown</h4>
                    <div className="divide-y divide-slate-100 text-xs font-semibold">
                      {livingBreakdown.map((row, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between">
                          <span className="text-slate-700">{row.item}</span>
                          <span className="text-indigo-650 font-black">
                            {currency === 'EUR' ? `€ ${row.eur}` : row.inr} / mo
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 mt-6 text-[11px] font-semibold text-indigo-950">
                      💡 **Pro-Tip**: You can cut monthly accommodation costs by 30% to 50% by applying for **CAF Housing Subsidies** once you validate your residency permit in France.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. Scholarships */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Sparkles className="text-indigo-650" size={24} />
                  🏆 Scholarships for MS Students (2026)
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Government and institutional grants available to Indian scholars</p>

                <div className="space-y-6">
                  {/* Eiffel */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                      <h4 className="font-black text-slate-900 text-sm">Eiffel Excellence Scholarship</h4>
                      <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                        Government-Funded
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-3">
                      Highly prestigious scholarship awarded by the French Ministry for Europe and Foreign Affairs. Only open to Master's & PhD applicants nominated directly by French universities.
                    </p>
                    <strong className="text-indigo-650 text-sm font-black">Value: Up to {formatCost(1181)} / month</strong>
                  </div>

                  {/* Charpak */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                      <h4 className="font-black text-slate-900 text-sm">Charpak Master's Scholarship</h4>
                      <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                        French Embassy India
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-3">
                      Specifically designed for Indian citizens studying a Master's degree in France. Covers tuition fees, visa fees waiver, student status assistance, and monthly allowance.
                    </p>
                    <strong className="text-indigo-650 text-sm font-black">Value: Up to {formatCost(700)} / month</strong>
                  </div>

                  {/* Emile Boutmy */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                      <h4 className="font-black text-slate-900 text-sm">Emile Boutmy Scholarship</h4>
                      <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                        Sciences Po Institutional
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-3">
                      Offered by Sciences Po to top international students from outside the European Union. Evaluated based on academic merit, social criteria, and suitability for the program.
                    </p>
                    <strong className="text-indigo-650 text-sm font-black">Value: Up to {formatCost(14210)} / year</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. Career Prospects & Top Recruiters */}
            <section id="careers" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Briefcase className="text-indigo-650" size={24} />
                  💼 MS Jobs & Career Prospects
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Employment statistics and recruiter channels in the French Republic</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Stats */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">Average MS Graduate Salary</h4>
                      <p className="text-slate-550 text-xs font-semibold leading-relaxed">
                        Average starting salaries vary based on specialization (engineering, tech, and finance command higher salaries).
                      </p>
                    </div>
                    <div className="mt-4">
                      <strong className="text-slate-900 text-xl font-black block">{formatCost(40000)} - {formatCost(60000)} / year</strong>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Average starting salary package</span>
                    </div>
                  </div>

                  {/* stayback */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">Post-Study Work Permit (APS)</h4>
                      <p className="text-slate-550 text-xs font-semibold leading-relaxed">
                        Indian graduates of French Master's degrees are eligible for a stay-back visa to search for employment.
                      </p>
                    </div>
                    <div className="mt-4">
                      <strong className="text-slate-900 text-xl font-black block">12 to 24 Months</strong>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Staying back period to find a job</span>
                    </div>
                  </div>
                </div>

                {/* Recruiters list */}
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-4">Top Recruiters for MS Graduates</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: "Airbus", sector: "Aerospace" },
                      { name: "Capgemini", sector: "IT Services" },
                      { name: "L'Oréal", sector: "Consumer Goods" },
                      { name: "BNP Paribas", sector: "Banking & Finance" },
                      { name: "TotalEnergies", sector: "Energy" },
                      { name: "Sanofi", sector: "Pharmaceuticals" },
                      { name: "Schneider Electric", sector: "Electrical Equipment" },
                      { name: "Dassault Systèmes", sector: "Software & 3D Design" }
                    ].map((rec, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center">
                        <span className="font-black text-slate-900 text-xs block">{rec.name}</span>
                        <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wider mt-0.5 block">{rec.sector}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 11. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about MS courses in France</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "Do I need to learn French to study an MS in France?", a: "No. France offers over 1,500 programs fully taught in English, especially in engineering, IT, and management. However, learning basic French is highly recommended to secure local internships and post-grad jobs." },
                  { q: "What is the stay-back period after MS in France?", a: "Indian graduates who obtain a Master's degree from a recognized French Higher Education Institution get a 2-year post-study stay-back visa (APS). In addition, they are eligible for a 5-year short-stay Schengen visa." },
                  { q: "Is a French MS degree recognized in India and globally?", a: "Yes. French Master's degrees are recognized globally. Under bilateral agreements between India and France, Indian and French academic degrees are mutually recognized for higher education and professional integration." },
                  { q: "What is the difference between a Master of Science (MSc) and a French National Master's?", a: "A National Master's (Diplôme National de Master) is state-regulated and highly academic, whereas an MSc (Master of Science) is often offered by Grandes Écoles and is more industry-oriented, featuring practical corporate training." },
                  { q: "Can I work part-time in France on a student visa?", a: "Yes. International students on VLS-TS visas are legally permitted to work up to 60% of the standard annual working hours, which equals 964 hours per year (~20 hours per week)." }
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

export default FranceMastersCourse;
