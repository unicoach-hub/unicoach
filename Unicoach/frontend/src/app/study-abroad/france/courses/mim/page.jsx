import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Clock, HelpCircle, CheckCircle2, ArrowRight, 
  Award, MapPin, Sparkles, Brain, Search, Briefcase, Coins, Database,
  GraduationCap, Globe, Compass, ShieldCheck, ChevronDown, ListFilter,
  Check, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'why-mim', title: 'Why MIM in France?' },
  { id: 'business-schools', title: 'Top MIM Schools' },
  { id: 'structure', title: 'MIM Program Structure' },
  { id: 'cost-study', title: 'Tuition Fees Overview' },
  { id: 'sectors', title: 'Career Outcomes & Sectors' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const topMimSchools = [
  { name: "HEC Paris", qsRank: "#1 Global", program: "MIM (Grande École)", feesTotalEUR: 48000, duration: "2 Years", location: "Jouy-en-Josas (Paris)", website: "https://www.hec.edu" },
  { name: "ESSEC Business School", qsRank: "#3 Global", program: "Master in Management", feesTotalEUR: 46000, duration: "2 Years", location: "Cergy-Pontoise (Paris)", website: "https://www.essec.edu" },
  { name: "ESCP Business School", qsRank: "#4 Global", program: "MIM (Multi-campus)", feesTotalEUR: 45000, duration: "2 Years", location: "Paris, Berlin, London", website: "https://escp.eu" },
  { name: "EDHEC Business School", qsRank: "#9 Global", program: "MIM (Business Management)", feesTotalEUR: 43000, duration: "2 Years", location: "Nice & Lille", website: "https://www.edhec.edu" },
  { name: "emlyon Business School", qsRank: "#12 Global", program: "MIM (Grande École)", feesTotalEUR: 41500, duration: "2 Years", location: "Lyon", website: "https://www.em-lyon.com" },
  { name: "SKEMA Business School", qsRank: "#25 Global", program: "MIM (Grande École)", feesTotalEUR: 38000, duration: "2 Years", location: "Sophia Antipolis", website: "https://www.skema.edu" },
  { name: "IÉSEG School of Management", qsRank: "Top 35 Global", program: "Master in Management", feesTotalEUR: 32000, duration: "2 Years", location: "Paris La Défense", website: "https://www.ieseg.fr" }
];

const hiringSectors = [
  { name: "Management Consulting", share: "35%", avgPayEUR: "€55,000 - €75,000", desc: "Top tier firms like McKinsey, BCG, and Bain recruit heavily from HEC/ESSEC." },
  { name: "Investment Banking & Finance", share: "25%", avgPayEUR: "€50,000 - €70,000", desc: "Analyst positions in mergers, venture capital, and private equity in Paris & London." },
  { name: "Luxury Brand Management", share: "20%", avgPayEUR: "€45,000 - €60,000", desc: "Product management and marketing in houses like LVMH, Kering, and Hermès." },
  { name: "Tech & Corporate Strategy", share: "20%", avgPayEUR: "€42,000 - €55,000", desc: "Operations, product design, and consulting at Amazon, Google, and L'Oréal." }
];

const FranceMIMCourse = () => {
  const [activeSection, setActiveSection] = useState('why-mim');
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
          <span className="text-slate-600 font-bold">MIM in France Guide 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80" 
              alt="MIM students group" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Sparkles size={14} />
              Grande École Pathways
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Master in Management (MIM) in France
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Kickstart your global management career with no prior work experience. Study at triple-accredited, world-ranked business schools that offer robust consulting pipelines and apprenticeships.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: January 23, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                9 min read
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
            
            {/* 1. Why MIM in France? */}
            <section id="why-mim" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🇫🇷 Why Study MIM in France?</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Unlock premier management consulting and luxury pipelines</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-indigo-655">👔 No Work Experience Needed</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Designed specifically for fresh graduates or candidates with less than 2 years of professional background.
                  </p>
                </div>
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-955 text-xs uppercase tracking-wider text-indigo-655">💼 Built-In Internships</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Includes a popular gap-year framework allowing two 6-month corporate internships to build your resume.
                  </p>
                </div>
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-indigo-655">💶 Work-Study Options</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Apprenticeship (Alternance) options allow French firms to fund your tuition while paying you a monthly salary.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Top MIM Schools */}
            <section id="business-schools" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Award className="text-indigo-655" size={24} />
                  Top Business Schools for MIM in France
                </h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Compare global management ranks, total tuition fees, and program locations</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                        <th className="pb-3 pr-4">School Name</th>
                        <th className="pb-3 pr-4 text-center">Global Rank (FT)</th>
                        <th className="pb-3 pr-4 text-center">Duration</th>
                        <th className="pb-3 pr-4">Total Tuition Fees</th>
                        <th className="pb-3 pr-4 text-right">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-750 font-semibold">
                      {topMimSchools.map((school, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4">
                            <div className="font-extrabold text-slate-900">{school.name}</div>
                            <div className="text-[11px] text-indigo-600 font-extrabold mt-0.5">{school.program}</div>
                          </td>
                          <td className="py-4 text-center">
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-indigo-700 text-[10px] font-black">{school.qsRank}</span>
                          </td>
                          <td className="py-4 text-center text-xs font-bold text-slate-500">{school.duration}</td>
                          <td className="py-4 font-black text-indigo-655">
                            {formatCost(school.feesTotalEUR)} (Total)
                          </td>
                          <td className="py-4 text-right text-slate-500 text-xs font-medium">{school.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 3. MIM Program Structure */}
            <section id="structure" className="scroll-mt-24">
              <div className="bg-indigo-50/30 border border-indigo-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-indigo-950 mb-6 flex items-center gap-2">
                  <BookOpen className="text-indigo-650" size={24} />
                  📖 MIM Program Architecture
                </h2>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-indigo-50">
                    <h4 className="font-extrabold text-slate-900 text-xs">M1 (Year 1) - Core Business Foundations</h4>
                    <p className="text-slate-655 text-[11px] font-semibold leading-relaxed mt-1">Focuses on fundamentals of finance, accounting, data analysis, marketing, operations, and behavioral economics.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-indigo-50">
                    <h4 className="font-extrabold text-slate-900 text-xs">Gap Year (Optional but Highly Recommended)</h4>
                    <p className="text-slate-655 text-[11px] font-semibold leading-relaxed mt-1">Over 80% of students take a gap year between M1 and M2 to complete two 6-month corporate internships, dramatically boosting post-grad job placement scores.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-indigo-50">
                    <h4 className="font-extrabold text-slate-900 text-xs">M2 (Year 2) - Advanced Specialization</h4>
                    <p className="text-slate-655 text-[11px] font-semibold leading-relaxed mt-1">Select specialized electives, write a master's thesis, or choose an apprenticeship track sponsored by a French employer.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Tuition Fees Overview */}
            <section id="cost-study" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  💰 Tuition Fees Overview
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Tuition varies considerably between state public universities and prestigious private business schools.</p>
                
                <div className="space-y-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">Public Universities</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Government-subsidized MIM tracks</span>
                    </div>
                    <span className="font-black text-indigo-650 text-xs md:text-sm">
                      {formatCost(3770)} / year
                    </span>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">Private Business Schools</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Elite credentials, global networks</span>
                    </div>
                    <span className="font-black text-indigo-650 text-xs md:text-sm">
                      {formatCost(16000)} - {formatCost(25000)} / year
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Career Outcomes & Sectors */}
            <section id="sectors" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Briefcase className="text-indigo-650" size={24} />
                  💼 Career Outcomes & Sector Analysis
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Explore placement statistics and sectors recruiting French MIM graduates</p>

                <div className="space-y-6">
                  {hiringSectors.map((sector, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between md:flex-row gap-4 hover:border-indigo-400 transition-all">
                      <div className="space-y-1 max-w-md">
                        <h4 className="font-black text-slate-900 text-xs flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded text-[9px] font-black">{sector.share}</span>
                          {sector.name}
                        </h4>
                        <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">{sector.desc}</p>
                      </div>
                      <div className="text-left md:text-right flex-shrink-0">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Average Starting Pay</span>
                        <span className="font-black text-indigo-655 text-xs md:text-sm">
                          {sector.avgPayEUR} / year
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about MIM courses in France</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "What is the difference between MBA and MIM in France?", a: "MIM is designed for recent graduates or early career candidates (0-2 years of experience) and lasts 2 years, whereas MBA requires professional experience (typically 3+ years) and is faster (1 year)." },
                  { q: "Is GMAT/GRE required for MIM admissions?", a: "Yes, top business schools like HEC, ESSEC, and ESCP require GMAT, GRE, or the French Tage Mage test for profile evaluations." },
                  { q: "What is Alternance (Apprenticeship) in MIM?", a: "Alternance is a work-study format where a student spends part of the week working for a company and the rest studying. The sponsoring company pays the student's tuition and provides a monthly stipend." }
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

export default FranceMIMCourse;
