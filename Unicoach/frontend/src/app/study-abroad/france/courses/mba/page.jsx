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
  { id: 'why-mba', title: 'Why MBA in France?' },
  { id: 'business-schools', title: 'Top Business Schools' },
  { id: 'specialisations', title: 'MBA Focus Sectors' },
  { id: 'admissions', title: 'Admission Dossier' },
  { id: 'cost-study', title: 'Cost of Studying' },
  { id: 'cost-living', title: 'Cost of Living' },
  { id: 'careers', title: 'Career Outcomes' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const topMbaSchools = [
  {
    name: "HEC Paris",
    qsRank: "6 Global",
    feesEUR: 99000,
    duration: "16 months",
    location: "Jouy-en-Josas (Paris)",
    strengths: "Finance, Entrepreneurship, Strategy, Leadership",
    desc: "Renowned globally, HEC Paris offers a highly structured residential program emphasizing executive leadership labs.",
    website: "https://www.hec.edu"
  },
  {
    name: "INSEAD",
    qsRank: "11 Global",
    feesEUR: 99500,
    duration: "10 months",
    location: "Fontainebleau",
    strengths: "General Management, Global Strategy, Cross-Cultural Leadership",
    desc: "Often called 'The Business School for the World' with dynamic campuses in France & Singapore allowing rotation.",
    website: "https://www.insead.edu"
  },
  {
    name: "ESCP Europe",
    qsRank: "27 Global",
    feesEUR: 58000,
    duration: "10 months",
    location: "Paris (Multi-campus)",
    strengths: "Cross-Border Management, Sustainability, Digitalisation",
    desc: "Unique multi-campus system allowing MBA tracks across 6 major European capital business hubs.",
    website: "https://escp.eu"
  },
  {
    name: "ESSEC Business School",
    qsRank: "28 Global",
    feesEUR: 60000,
    duration: "12 months",
    location: "Paris La Défense",
    strengths: "Luxury Brand Management, Finance, Product Consulting",
    desc: "Top choice for Luxury and Consulting career tracks, featuring dedicated Career Learning Labs.",
    website: "https://www.essec.edu"
  },
  {
    name: "EDHEC Business School",
    qsRank: "47 Global",
    feesEUR: 51000,
    duration: "10 months",
    location: "Nice (Cote d'Azur)",
    strengths: "International Finance, ESG, Tech Innovation, Leadership",
    desc: "Based in Nice, EDHEC focuses heavily on sustainability, providing top 'Value for Money' ROI statistics.",
    website: "https://www.edhec.edu"
  },
  {
    name: "Emlyon Business School",
    qsRank: "49 Global",
    feesEUR: 49500,
    duration: "10 months",
    location: "Lyon",
    strengths: "Entrepreneurship, Business Development, Operations",
    desc: "An intensive full-time program based in France's gastronomy capital with strong startup incubator connections.",
    website: "https://www.em-lyon.com"
  },
  {
    name: "SKEMA Business School",
    qsRank: "Top 50 (EMBA)",
    feesEUR: 60000,
    duration: "Executive / Full-Time",
    location: "Sophia Antipolis",
    strengths: "Corporate Strategy, Financial Analysis",
    desc: "A highly customizable executive program targeting working professionals in high-tech sectors.",
    website: "https://www.skema.edu"
  },
  {
    name: "Grenoble Ecole de Management (GEM)",
    qsRank: "Top 30 (Europe)",
    feesEUR: 36000,
    duration: "12 months",
    location: "Grenoble",
    strengths: "Technology Management, Innovation Strategy",
    desc: "Highly affordable option focused on digital disruption and managing technology-heavy sectors.",
    website: "https://www.grenoble-em.com"
  }
];

const mbaLivingCosts = [
  { item: "Average Rent (City Center / Paris)", eur: 776, inr: "₹ 83,032" },
  { item: "Monthly Utilities (Power, Internet)", eur: 223, inr: "₹ 23,861" },
  { item: "Food & Groceries", eur: 200, inr: "₹ 21,400" },
  { item: "Local Transport Pass", eur: 66, inr: "₹ 7,062" }
];

const FranceMBACourse = () => {
  const [activeSection, setActiveSection] = useState('why-mba');
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
          <span className="text-slate-600 font-bold">MBA in France Guide 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80" 
              alt="La Defense Paris Business District" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Sparkles size={14} />
              France Business Schools
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              MBA in France: Elite Business Schools, Fees & Placements
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Choose a faster path to career acceleration. Pursue an MBA at triple-accredited elite French business schools, delivering superior salary gains with low opportunity costs.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: January 23, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                12 min read
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
            
            {/* 1. Why MBA in France? */}
            <section id="why-mba" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🇫🇷 Why Study MBA in France?</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Acquire international management credentials from elite European schools</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-indigo-655">⏱️ 1-Year Fast Track</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Most elite French MBA programs (INSEAD, ESCP, EDHEC) last only 10 to 16 months, dramatically reducing opportunity cost.
                  </p>
                </div>
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-955 text-xs uppercase tracking-wider text-indigo-655">🌍 Triple-Accredited Schools</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    France is home to a high concentration of institutions holding EQUIS, AMBA, and AACSB credentials.
                  </p>
                </div>
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col gap-2 hover:shadow-xs transition-shadow">
                  <h4 className="font-extrabold text-slate-950 text-xs uppercase tracking-wider text-indigo-655">🏆 5-Year Stay-Back Option</h4>
                  <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
                    Bilateral agreements award Indian postgraduate alumni a 5-year short-stay Schengen circulation visa.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Top Business Schools */}
            <section id="business-schools" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🏛️ Top Business Schools for MBA</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Elite business networks with high Return on Investment (ROI)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topMbaSchools.map((school, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-705 text-[10px] font-black uppercase tracking-wider">
                          QS Rank: {school.qsRank}
                        </span>
                        <span className="text-[10px] text-slate-400 font-extrabold">{school.duration}</span>
                      </div>
                      <h3 className="text-base font-black text-slate-800 mb-1">{school.name}</h3>
                      <div className="text-[10px] text-slate-400 font-extrabold flex items-center gap-1 mb-3">
                        <MapPin size={10} /> {school.location}
                      </div>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">{school.desc}</p>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50 mb-4 text-[11px] font-bold text-slate-700">
                        <strong className="block text-[9px] text-slate-400 uppercase tracking-wider">Strengths:</strong>
                        {school.strengths}
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block font-extrabold">Tuition Cost</span>
                        <strong className="text-indigo-650 font-black">{formatCost(school.feesEUR)}</strong>
                      </div>
                      <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-indigo-650 font-black flex items-center gap-1 hover:underline">
                        Website <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. MBA Focus Sectors */}
            <section id="specialisations" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase className="text-indigo-650" size={24} />
                  💼 Major MBA Recruitment Sectors
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  French MBA programs are legendary for placement connections in specific global industries:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">Luxury & Retail</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Deep ties with LVMH, Kering, Hermès, and L'Oréal. Focuses on brand equity, heritage strategy, and boutique distribution.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">Corporate Strategy</h4>
                    <p className="text-slate-550 text-[11px] leading-relaxed">
                      Heavy placements in management consulting (McKinsey, BCG, Bain) and European business headquarters.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">Finance & VC</h4>
                    <p className="text-slate-550 text-[11px] leading-relaxed">
                      Access to major European banking corporations (BNP Paribas, Société Générale) and international venture capitals.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Admission Dossier */}
            <section id="admissions" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-650" size={24} />
                  📋 Admission Dossier Checklist
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-700">
                  <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-slate-800">Professional Work Experience</h4>
                      <p className="text-slate-500 text-[10px] mt-0.5">Typically 2 to 5 years of post-graduation work experience required.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-slate-800">GMAT / GRE Scores</h4>
                      <p className="text-slate-500 text-[10px] mt-0.5">Competitive score (typically 650+ GMAT) is mandatory for elite business schools.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-slate-800">English Language Proficiency</h4>
                      <p className="text-slate-500 text-[10px] mt-0.5">IELTS (6.5+) or TOEFL (95+) required for non-native English speakers.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-slate-800">Reference Letters (LOR)</h4>
                      <p className="text-slate-500 text-[10px] mt-0.5">2 professional or academic recommendation letters highlighting leadership skills.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Cost of Studying */}
            <section id="cost-study" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  💰 Tuition Fees Overview
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Estimated annual tuition fee comparison for French MBA courses</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">Public Universities</span>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                        Taxpayer-subsidized programs focused on academic theory and corporate management systems.
                      </p>
                    </div>
                    <strong className="text-indigo-650 font-black text-sm md:text-base mt-4 block">
                      {formatCost(10000)} - {formatCost(30000)} / year
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">Private Business Schools</span>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                        Elite Grandes Écoles providing extensive career counseling, active job placements, and massive global alumni networks.
                      </p>
                    </div>
                    <strong className="text-indigo-655 font-black text-sm md:text-base mt-4 block">
                      {formatCost(30000)} - {formatCost(100000)} / year
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Cost of Living */}
            <section id="cost-living" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Compass className="text-indigo-650" size={24} />
                  💶 Estimated Monthly Living Expenses
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">A detailed breakdown of monthly living expenditures for MBA students</p>

                <div className="divide-y divide-slate-100 text-xs font-semibold">
                  {mbaLivingCosts.map((cost, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <span className="text-slate-700">{cost.item}</span>
                      <span className="text-indigo-650 font-black">
                        {currency === 'EUR' ? `€ ${cost.eur}` : cost.inr} / mo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 7. Career Outcomes */}
            <section id="careers" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Briefcase className="text-indigo-650" size={24} />
                  📈 MBA Jobs & Career Outcomes
                </h2>
                <p className="text-slate-405 text-xs font-bold mb-6">Average placements and staying back guidelines after graduation</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 font-semibold mb-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">High Post-MBA Salaries</h4>
                    <p className="text-slate-550 leading-relaxed">
                      Average post-MBA starting salaries range between **€80,000 and €120,000 per year** (HEC & INSEAD graduates regularly command higher packages).
                    </p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2">APS Job-Search Visa</h4>
                    <p className="text-slate-550 leading-relaxed">
                      Graduates receive a **1-year to 2-year post-study stay-back visa (APS)**, allowing them to seek full-time professional contracts inside the Schengen Area.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about MBA courses in France</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "Why is an MBA in France considered cost-effective?", a: "Many elite French MBA programs (e.g. INSEAD, ESCP, EDHEC) last only 10 to 12 months. This is faster than standard 2-year programs in the US, cutting down tuition costs and reducing the time you are out of the active workforce (lowering opportunity cost)." },
                  { q: "Do I need to speak French to study MBA in France?", a: "No. All top MBA programs in France (including HEC Paris, INSEAD, ESSEC, and EDHEC) are taught 100% in English. However, learning basic French is highly recommended for networking and local European job placements." },
                  { q: "What is the post-study work visa rule for MBA graduates?", a: "Master's and MBA graduates from recognized French business schools are eligible for a 1-year to 2-year APS temporary residence visa to find employment. Additionally, bilateral treaties grant Indian graduates a 5-year short-stay circulation visa." },
                  { q: "Is GMAT or GRE mandatory for admissions?", a: "Yes, most elite schools (HEC, INSEAD, ESSEC) require competitive GMAT or GRE scores. Some regional schools like Grenoble EM may offer waivers based on extensive work experience." }
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

export default FranceMBACourse;
