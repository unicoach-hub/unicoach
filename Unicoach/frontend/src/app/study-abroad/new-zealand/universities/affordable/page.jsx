import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle2, ArrowRight, Table, AlertCircle, Sparkles, 
  Building, ListFilter, HelpCircle, ChevronDown, Award, Globe, DollarSign, 
  BookOpen, Compass, ShieldCheck, Check, ShieldAlert, Coins, MapPin, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'overview', title: 'Quality & Affordability' },
  { id: 'comparison', title: 'Fee Comparison Table' },
  { id: 'breakdown', title: 'Detailed Breakdown' },
  { id: 'program-costs', title: 'Program-Specific Costs' },
  { id: 'non-tuition', title: 'Non-Tuition Costs' },
  { id: 'visa-fees', title: 'Visa Application Fees' },
  { id: 'scholarships', title: 'Scholarships' },
  { id: 'work', title: 'Part-Time Work Rules' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const feeComparisonData = [
  { rank: 1, name: "University of Auckland", qs: "#65", ugFee: 40496, pgRange: "$35K-$50K", logo: "https://logo.clearbit.com/auckland.ac.nz" },
  { rank: 2, name: "University of Otago", qs: "#214", ugFee: 35621, pgRange: "$37K-$46K", logo: "https://logo.clearbit.com/otago.ac.nz" },
  { rank: 3, name: "Massey University", qs: "#230", ugFee: 34220, pgRange: "$38.8K-$59.6K", logo: "https://logo.clearbit.com/massey.ac.nz" },
  { rank: 4, name: "Victoria Univ. Wellington", qs: "#240", ugFee: 33360, pgRange: "$35K-$47K", logo: "https://logo.clearbit.com/wgtn.ac.nz" },
  { rank: 5, name: "University of Canterbury", qs: "#261", ugFee: 32800, pgRange: "$32K-$48K", logo: "https://logo.clearbit.com/canterbury.ac.nz" },
  { rank: 6, name: "University of Waikato", qs: "#281", ugFee: 32400, pgRange: "$38.8K-$48.3K", logo: "https://logo.clearbit.com/waikato.ac.nz" },
  { rank: 7, name: "Lincoln University", qs: "#371", ugFee: 32500, pgRange: "$32K-$48K", logo: "https://logo.clearbit.com/lincoln.ac.nz" },
  { rank: 8, name: "AUT (Auckland)", qs: "#410", ugFee: 35092, pgRange: "$35K-$47K", logo: "https://logo.clearbit.com/aut.ac.nz" }
];

const detailedBreakdown = [
  {
    name: "University of Waikato (Hamilton)",
    label: "🏆 CHEAPEST UG START",
    qs: "#281",
    desc: "Located in Hamilton, a city with lower living costs. Waikato offers the highest value entry point for Indian undergraduates.",
    cheapestUG: "$32,441 / year (₹16.89 Lakhs) — Arts & Humanities",
    highestUG: "$48,345 / year (₹25.18 Lakhs) — Engineering",
    cheapestPG: "$38,838 / year (₹20.23 Lakhs) — Arts",
    highestPG: "$59,760 / year (₹31.12 Lakhs) — MBA",
    logo: "https://logo.clearbit.com/waikato.ac.nz"
  },
  {
    name: "Victoria University of Wellington",
    label: "🏢 BEST CAPITAL ACCESS",
    qs: "#240",
    desc: "Wellington provides proximity to government, technology networks, and creative media hubs (Wētā Workshop).",
    cheapestUG: "$33,360 / year (₹17.37 Lakhs) — BA",
    highestUG: "$47,000 / year (₹24.48 Lakhs) — Engineering",
    cheapestPG: "$35,000 / year (₹18.22 Lakhs) — General Master's",
    highestPG: "$47,000 / year (₹24.48 Lakhs) — MIT",
    logo: "https://logo.clearbit.com/wgtn.ac.nz"
  },
  {
    name: "Massey University",
    label: "🚜 BALANCED COST & QUALITY",
    qs: "#230",
    desc: "Operates campuses in Palmerston North, Auckland, and Wellington. Excellent agri-food research and veterinary science.",
    cheapestUG: "$34,220 / year (₹17.82 Lakhs) — Arts",
    highestUG: "$84,220 / year (₹43.86 Lakhs) — Veterinary Science",
    cheapestPG: "$38,838 / year (₹20.23 Lakhs) — Arts",
    highestPG: "$58,278 / year (₹30.35 Lakhs) — Agriculture",
    logo: "https://logo.clearbit.com/massey.ac.nz"
  },
  {
    name: "University of Canterbury",
    label: "⚙️ CHEAPEST PG START",
    qs: "#261",
    desc: "Christchurch base offers low to moderate living costs. Renowned engineering hub connected to the Quake Centre.",
    cheapestUG: "$32,800 / year (₹17.08 Lakhs) — BA",
    highestUG: "$48,000 / year (₹25.00 Lakhs) — Engineering",
    cheapestPG: "$32,000 / year (₹16.66 Lakhs) — General PG",
    highestPG: "$45,000 / year (₹23.43 Lakhs) — Science",
    logo: "https://logo.clearbit.com/canterbury.ac.nz"
  },
  {
    name: "University of Otago",
    label: "🩺 HEALTH SCIENCES & DENTISTRY",
    qs: "#214",
    desc: "Dunedin is one of New Zealand's most affordable student-centric cities, hosting NZ's only Dental School.",
    cheapestUG: "$35,621 / year (₹18.55 Lakhs) — BA",
    highestUG: "$45,045 / year (₹23.46 Lakhs) — Computer Science",
    cheapestPG: "$45,990 / year (₹23.95 Lakhs) — Postgraduate Diploma",
    highestPG: "$53,196 / year (₹27.70 Lakhs) — MBA",
    logo: "https://logo.clearbit.com/otago.ac.nz"
  },
  {
    name: "Auckland University of Technology (AUT)",
    label: "💻 CHEAPEST IN AUCKLAND",
    qs: "#410",
    desc: "The most affordable pathway to live and study in New Zealand's primary economic city. Modern, career-focused learning.",
    cheapestUG: "$35,092 / year (₹18.28 Lakhs) — Arts",
    highestUG: "$47,000 / year (₹24.48 Lakhs) — Design",
    cheapestPG: "$35,000 / year (₹18.22 Lakhs) — General PG",
    highestPG: "$47,000 / year (₹24.48 Lakhs) — Business",
    logo: "https://logo.clearbit.com/aut.ac.nz"
  },
  {
    name: "Lincoln University",
    label: "🍷 SPECIALIST LAND-BASED",
    qs: "#371",
    desc: "Quiet Christchurch campus-based environment leading sustainable agribusiness, viticulture, and resource management.",
    cheapestUG: "$32,500 / year (₹16.92 Lakhs) — General",
    highestUG: "$48,000 / year (₹25.00 Lakhs) — Environmental",
    cheapestPG: "$32,000 / year (₹16.66 Lakhs) — General PG",
    highestPG: "$45,000 / year (₹23.43 Lakhs) — Science",
    logo: "https://logo.clearbit.com/lincoln.ac.nz"
  },
  {
    name: "University of Auckland",
    label: "👑 FLAGSHIP UNIVERSITY",
    qs: "#65",
    desc: "New Zealand's only Top-100 ranked university. Offers excellent merit-based scholarships and Triple Crown Business School.",
    cheapestUG: "$40,496 / year (₹21.09 Lakhs) — Education",
    highestUG: "$86,561 / year (₹45.07 Lakhs) — Medicine",
    cheapestPG: "$42,000 / year (₹21.87 Lakhs) — Arts",
    highestPG: "$58,009 / year (₹30.22 Lakhs) — Engineering",
    logo: "https://logo.clearbit.com/auckland.ac.nz"
  }
];

const NewZealandAffordable = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [currency, setCurrency] = useState('INR'); // 'NZD' | 'INR'
  const [faqOpen, setFaqOpen] = useState({});
  const exchangeRate = 52.08; // 1 NZD = 52.08 INR as per guide data

  const formatCost = (valInNZD) => {
    if (currency === 'NZD') {
      return `NZ$ ${valInNZD.toLocaleString()}`;
    }
    const valInINR = valInNZD * exchangeRate;
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
          <Link to="/study-abroad/new-zealand" className="hover:text-indigo-650 transition-colors">New Zealand</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <span className="text-slate-600 font-bold">Cheapest Universities</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80" 
              alt="Affordable Study in New Zealand" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Coins size={14} />
              Budget Planning 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Affordable & Cheapest Universities in New Zealand 2026: Complete Guide
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              All 8 public research universities rank in the top 3% globally. Compare cheap tuition structures, living costs, visa fees, and part-time earnings.
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

        {/* 2-Column Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Sidebar Navigator */}
          <div className="lg:col-span-3 sticky top-28 hidden lg:block bg-white/70 border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <ListFilter size={16} className="text-indigo-650" />
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Budget Navigator</span>
            </div>
            <div className="space-y-1.5">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer block
                    ${activeSection === sec.id 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'}`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Content Blocks */}
          <div className="lg:col-span-9 space-y-16">
            
            {/* 1. Quality & Affordability Overview */}
            <section id="overview" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-sky-50/40 to-indigo-50/40 border border-indigo-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={22} />
                  💡 Quality Education Doesn't Have to Break the Bank
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  While US or UK tuition often exceeds <strong>NZD 45,000 (₹23.44 Lakhs)</strong> per year, New Zealand's public university packages start between <strong>NZD 32,000 – NZD 40,000 (₹16.67 Lakhs – ₹20.83 Lakhs)</strong>. And you don't sacrifice rankings—all 8 public universities are inside the top 3% globally.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "🏆 Waikato lowest starting UG fee ($32,400)",
                    "🏆 Canterbury lowest starting PG fee ($32,000)",
                    "🎓 Subsidised PhD tuition ($6,500 – $9,000/year)",
                    "💵 Currency Toggle options below for easy reference"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100">
                      <Check className="text-teal-600 shrink-0" size={16} strokeWidth={3} />
                      <span className="text-xs font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Fee Comparison Table */}
            <section id="comparison" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🏛️ All Public Universities: Fee Comparison (2026)</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">QS positions and annual tuition fee conversions</p>
              </div>

              {/* Currency Selector */}
              <div className="bg-white border border-slate-200/60 rounded-[24px] p-5 shadow-xs mb-8 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">Exchange rate: 1 NZD = ₹52.08</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrency('NZD')}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currency === 'NZD' ? 'bg-[#DE5C2B] text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    NZD ($)
                  </button>
                  <button 
                    onClick={() => setCurrency('INR')}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    INR (₹)
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-450 font-bold uppercase tracking-wider">
                      <th className="pb-3 pr-4">University</th>
                      <th className="pb-3 pr-4">QS Rank</th>
                      <th className="pb-3 pr-4">UG Start Fee</th>
                      <th className="pb-3 pr-4 text-right">PG Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                    {feeComparisonData.map((uni, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <img src={uni.logo} alt="" className="w-6 h-6 object-contain" />
                            <span className="font-extrabold text-slate-900">{uni.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-slate-500">{uni.qs}</td>
                        <td className="py-4 text-indigo-650 font-black">{formatCost(uni.ugFee)}</td>
                        <td className="py-4 text-right text-slate-655 font-medium">{uni.pgRange}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3. Detailed University Breakdown */}
            <section id="breakdown" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📚 Detailed University Breakdown</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Course-specific ranges and location context</p>
              </div>

              <div className="space-y-8">
                {detailedBreakdown.map((uni, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                        <img src={uni.logo} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">{uni.label}</span>
                        <h3 className="font-black text-slate-850 text-sm md:text-base mt-1">{uni.name} — QS {uni.qs}</h3>
                      </div>
                    </div>

                    <p className="text-slate-600 text-xs font-semibold leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl">
                      {uni.desc}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                        <span className="text-slate-400 font-bold block mb-2 uppercase tracking-wider">Undergraduate Ranges</span>
                        <p className="text-slate-600 mb-1">Cheapest: <strong className="text-slate-900 font-extrabold">{uni.cheapestUG}</strong></p>
                        <p className="text-slate-600">Higher: <strong className="text-slate-900 font-extrabold">{uni.highestUG}</strong></p>
                      </div>
                      <div className="pt-4 md:pt-0 md:pl-4">
                        <span className="text-slate-400 font-bold block mb-2 uppercase tracking-wider">Postgraduate Ranges</span>
                        <p className="text-slate-600 mb-1">Cheapest: <strong className="text-indigo-650 font-extrabold">{uni.cheapestPG}</strong></p>
                        <p className="text-slate-600">Higher: <strong className="text-indigo-650 font-extrabold">{uni.highestPG}</strong></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Program-Specific Cost Breakdown */}
            <section id="program-costs" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Table className="text-indigo-650" size={24} />
                  📊 Program-Specific Cost Breakdown
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Tuition estimates based on study subject areas</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-xs font-semibold">
                  {[
                    { title: "UG Arts & Humanities", fee: "$32,000 - $35,000", inr: "₹16.66L - ₹18.22L" },
                    { title: "UG Engineering", fee: "$45,000 - $60,000+", inr: "₹23.43L - ₹31.24L+" },
                    { title: "UG Health Sciences", fee: "$38,000 - $55,000", inr: "₹19.79L - ₹28.64L" },
                    { title: "PG Taught (Master's)", fee: "$20,000 - $45,000", inr: "₹10.41L - ₹23.43L" },
                    { title: "PhD (Doctoral) *Best Value", fee: "$6,500 - $9,000", inr: "₹3.38L - ₹4.68L" },
                    { title: "MBA Programs", fee: "$45,000 - $60,000+", inr: "₹23.43L - ₹31.24L+" }
                  ].map((p, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-slate-400 font-extrabold uppercase tracking-wider block mb-1">{p.title}</span>
                      <div>
                        <strong className="text-slate-800 text-sm font-extrabold block">{p.fee} / year</strong>
                        <span className="text-indigo-600 block mt-0.5">{p.inr} / year</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4">
                  <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-extrabold text-emerald-905 text-xs uppercase tracking-wider mb-1">PhD Domestic Fee Subsidies</h4>
                    <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                      New Zealand heavily subsidizes doctoral study. International PhD candidates pay the same low tuition rates as local domestic students (NZD $6,500 – $9,000 per year).
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Mandatory Non-Tuition Costs */}
            <section id="non-tuition" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  💰 Mandatory Non-Tuition Costs (2026)
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Compulsory expenses beyond standard academic fees</p>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Expense Category</th>
                        <th className="pb-3 pr-4">Annual Cost (NZD)</th>
                        <th className="pb-3 pr-4 text-right">Annual Cost (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705 font-semibold">
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Living Fund (Immigration NZ Minimum)</td>
                        <td className="py-4 text-slate-600">$20,000</td>
                        <td className="py-4 text-right text-indigo-650">₹10.41 Lakh</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Student Services Fee (SSF)</td>
                        <td className="py-4 text-slate-600">$800 - $1,200</td>
                        <td className="py-4 text-right text-indigo-650">₹41.6K - ₹62.5K</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Mandatory Health & Travel Insurance</td>
                        <td className="py-4 text-slate-600">$600 - $900</td>
                        <td className="py-4 text-right text-indigo-650">₹31.2K - ₹46.9K</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Student Visa Fee (One-off)</td>
                        <td className="py-4 text-slate-600">$850</td>
                        <td className="py-4 text-right text-indigo-650">₹44.3K</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-6 text-xs text-rose-900 font-semibold leading-relaxed">
                  <strong>⚠️ Visa Regulation Reminder:</strong> You must show access to <strong>NZD $20,000 (₹10.41 Lakhs)</strong> for each year of study to verify maintenance requirements.
                </div>
              </div>
            </section>

            {/* 6. Visa Application Fees */}
            <section id="visa-fees" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Compass className="text-indigo-650" size={24} />
                  🛂 Visa Application Fees (2026)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 uppercase block mb-1">Fee Paying Visa</span>
                    <strong className="text-slate-800 text-sm font-extrabold block">$850 (₹44,268)</strong>
                    <span className="text-slate-500 block mt-1">Submitted online via RealMe portal.</span>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 uppercase block mb-1">Biometrics</span>
                    <strong className="text-slate-800 text-sm font-extrabold block">$35 (₹1,822)</strong>
                    <span className="text-slate-500 block mt-1">Paid at local VFS Global center.</span>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 uppercase block mb-1">Medical Exam</span>
                    <strong className="text-slate-800 text-sm font-extrabold block">$35 - $300</strong>
                    <span className="text-slate-500 block mt-1">Varies based on Panel Doctor check.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Scholarships */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Award className="text-indigo-650" size={24} />
                  🏆 Scholarships at Cheapest Universities
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">India High Achievers Scholarship</h4>
                    <p className="text-indigo-650 font-black mb-1">Value: $20,000 (₹10.41 Lakhs)</p>
                    <p className="text-slate-500">Offered by the University of Auckland for merit students.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">New Zealand Excellence Awards (NZEA)</h4>
                    <p className="text-indigo-650 font-black mb-1">Value: $10,000 (₹5.20 Lakhs)</p>
                    <p className="text-slate-500">Jointly funded by NZ government and all public universities.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">International Master's Scholarship</h4>
                    <p className="text-indigo-650 font-black mb-1">Value: $18,000 (₹9.37 Lakhs)</p>
                    <p className="text-slate-500">Offered by the University of Otago for thesis research.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">Massey University Scholarships</h4>
                    <p className="text-indigo-650 font-black mb-1">Value: $8 Million Pool (₹41.66 Crores)</p>
                    <p className="text-slate-500">Huge pool of partial waivers for agricultural & business courses.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. Part-Time Work Rules */}
            <section id="work" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Clock className="text-indigo-650" size={24} />
                  💼 Part-Time Work Rules & Earnings (2026)
                </h2>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 text-xs font-semibold">
                  <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-3">🕒 Work Time Regulations (From Nov 2025)</h4>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="text-indigo-600" size={14} />
                      <span><strong>25 hours/week</strong> part-time during active semesters (up from 20).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-indigo-600" size={14} />
                      <span><strong>Full-time work rights</strong> during scheduled semester breaks & holidays.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-indigo-600" size={14} />
                      <span><strong>Unlimited work hours</strong> for PhD & Research Master's candidates.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-indigo-600" size={14} />
                      <span><strong>Minimum wage</strong>: NZD $18.50 – $23.15 per hour (₹963 – ₹1,203/hour).</span>
                    </li>
                  </ul>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Typical Student Job</th>
                        <th className="pb-3 pr-4">Monthly Wage (NZD)</th>
                        <th className="pb-3 pr-4 text-right">Monthly Wage (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705 font-semibold">
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Academic Tutor</td>
                        <td className="py-4 text-slate-600">$5,900</td>
                        <td className="py-4 text-right text-indigo-650">₹3.07 Lakh</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Delivery Driver</td>
                        <td className="py-4 text-slate-600">$4,200</td>
                        <td className="py-4 text-right text-indigo-650">₹2.18 Lakh</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Cafe Barista</td>
                        <td className="py-4 text-slate-600">$3,900</td>
                        <td className="py-4 text-right text-indigo-650">₹2.03 Lakh</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 9. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Financial answers for New Zealand studies</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "What is the mandatory minimum amount of funds for a New Zealand student visa in 2026?", a: "Indian applicants must show evidence of access to NZD $20,000 (₹10.41 Lakhs) for each year of study. This can be verified via education loan approval letters, bank statements with a minimum 6-month history, or formal scholarship documents." },
                  { q: "Which NZ institution offers the absolute lowest tuition rates?", a: "Southern Institute of Technology (SIT) offers vocational diplomas starting from NZD $14,000 (₹7.29 Lakhs) per year. Among traditional universities, Waikato offers competitive UG starting rates." },
                  { q: "Are PhD programs subsidized for international students in New Zealand?", a: "Yes, NZ heavily subsidizes PhD tuition to local domestic levels. International PhD candidates pay just NZD $6,500 – $9,000 per year, which is up to 80% cheaper than undergraduate tuition." },
                  { q: "What is the cheapest place to live in New Zealand?", a: "Invercargill (NZD $1,450/month) and Dunedin (NZD $1,550/month) are the most affordable student hubs, followed closely by Hamilton (NZD $1,600) and Christchurch (NZD $1,613)." }
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
          <StudyAbroadCTA country="New Zealand" />
        </div>

      </div>
    </div>
  );
};

export default NewZealandAffordable;
