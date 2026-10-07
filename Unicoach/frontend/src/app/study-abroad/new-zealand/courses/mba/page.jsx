import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle2, ArrowRight, Table, AlertCircle, Sparkles, 
  Building, ListFilter, HelpCircle, ChevronDown, Award, Globe, DollarSign, 
  BookOpen, Compass, ShieldCheck, Check, ShieldAlert, Coins, MapPin, Search,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'overview', title: 'Why Study MBA?' },
  { id: 'types', title: 'Types of MBA Courses' },
  { id: 'specializations', title: 'Top Specializations' },
  { id: 'universities', title: 'Top Universities' },
  { id: 'eligibility', title: 'Eligibility & Requirements' },
  { id: 'living-costs', title: 'Cost of Living' },
  { id: 'scholarships', title: 'Available Scholarships' },
  { id: 'roi', title: 'ROI: Jobs & Salaries' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const topMbaUnisList = [
  { rank: 1, name: "University of Auckland", qs: "#65", feeNZD: 46188, tagline: "TRIPLE CROWN: AACSB + EQUIS + AMBA", desc: "Globally elite business school. Living Curriculum features pairing directly with Kiwi firms.", logo: "https://logo.clearbit.com/auckland.ac.nz", website: "https://www.auckland.ac.nz", city: "Auckland" },
  { rank: 2, name: "University of Otago", qs: "#197", feeNZD: 72612, tagline: "INTENSIVE TWO-PHASE PROGRAM", desc: "Strong research focus + global perspective. Otago requires GMAT 550+ score.", logo: "https://logo.clearbit.com/otago.ac.nz", website: "https://www.otago.ac.nz", city: "Dunedin" },
  { rank: 3, name: "Massey University", qs: "#230", feeNZD: 51500, tagline: "1-YEAR FAST-TRACK OPTION", desc: "Flexible & budget-friendly. Excellent choice for quick entry into the workforce.", logo: "https://logo.clearbit.com/massey.ac.nz", website: "https://www.massey.ac.nz", city: "Palmerston North" },
  { rank: 4, name: "Victoria University of Wellington", qs: "#240", feeNZD: 66700, tagline: "CAPITAL CITY ADVANTAGE", desc: "Unmatched networking linkages to government ministries and corporate HQs.", logo: "https://logo.clearbit.com/wgtn.ac.nz", website: "https://www.wgtn.ac.nz", city: "Wellington" },
  { rank: 5, name: "University of Canterbury", qs: "#261", feeNZD: 61350, tagline: "ONE-ON-ONE INDUSTRY COACHING", desc: "Known for strong corporate engagement and active mentoring with business leaders.", logo: "https://logo.clearbit.com/canterbury.ac.nz", website: "https://www.canterbury.ac.nz", city: "Christchurch" },
  { rank: 6, name: "University of Waikato", qs: "#281", feeNZD: 64945, tagline: "WAIKATO MANAGEMENT SCHOOL NETWORK", desc: "Strong industry ties and practical case-studies through deep corporate linkages.", logo: "https://logo.clearbit.com/waikato.ac.nz", website: "https://www.waikato.ac.nz", city: "Hamilton" },
  { rank: 7, name: "Lincoln University", qs: "#407", feeNZD: 42500, tagline: "SUSTAINABILITY & LAND-BASED", desc: "Best for agri-business management, rural commerce, and environmental strategy.", logo: "https://logo.clearbit.com/lincoln.ac.nz", website: "https://www.lincoln.ac.nz", city: "Lincoln" },
  { rank: 8, name: "Auckland University of Technology (AUT)", qs: "#410", feeNZD: 58719, tagline: "CURRICULUM WITH INDUSTRY EXPERTS", desc: "Modern industry partnerships designed for immediate real-world executive application.", logo: "https://logo.clearbit.com/aut.ac.nz", website: "https://www.aut.ac.nz", city: "Auckland" }
];

const NewZealandMBACourse = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [currency, setCurrency] = useState('INR'); // 'NZD' | 'INR'
  const [faqOpen, setFaqOpen] = useState({});
  const exchangeRate = 53.70; // Reference 1 NZD = 53.70 INR

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
          <span className="text-slate-600 font-bold">MBA Guide 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80" 
              alt="MBA Students Discussion" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50/15 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Briefcase size={14} />
              MBA Guide 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              MBA in New Zealand 2026: Complete Guide for Indian Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Tackle Live Consulting Projects inside the business community. Study at top-ranked, globally accredited institutions with expanded stay-back rights.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: January 22, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                8 min read
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
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">MBA Navigation</span>
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
            
            {/* 1. Why Study MBA Overview */}
            <section id="overview" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-sky-50/40 to-indigo-50/40 border border-indigo-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={22} />
                  💡 The MBA Experience That's Different
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  Instead of just reading case studies, you'll tackle **Live Consulting Projects** paired directly with local Kiwi firms. You also benefit from the newly updated student work rights and post-study opportunities.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "25-Hour Work", val: "Earn ~₹6K-8K weekly" },
                    { label: "3-Year Stay-Back", val: "Unrestricted open visa" },
                    { label: "Global Quality", val: "All 8 in top 3% globally" },
                    { label: "Green List PR", val: "Fast-track management roles" },
                    { label: "High ROI", val: "12-18 months break-even" },
                    { label: "Living Curriculum", val: "Real Kiwi firm projects" }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-405 block font-bold">{stat.label}</span>
                      <strong className="text-indigo-650 text-xs font-black block mt-1">{stat.val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Types of MBA Courses */}
            <section id="types" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6">📚 Types of MBA Courses in New Zealand</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">📅 Full-Time MBA</h3>
                    <p className="text-slate-505 leading-relaxed">
                      Duration: **12 – 18 months**. Best for international students seeking quick market entry and a 3-year stay-back open visa.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">👔 Executive MBA (EMBA)</h3>
                    <p className="text-slate-505 leading-relaxed">
                      Duration: **18 – 24 months**. Structured for mid-to-senior leaders (5+ years work experience) utilizing block formats.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">🎯 Specialised MBA</h3>
                    <p className="text-slate-505 leading-relaxed">
                      Focus: Business Analytics, Digital Transformation, or Healthcare. Highly optimized for niche vertical domains.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">🌍 Global MBA</h3>
                    <p className="text-slate-505 leading-relaxed">
                      Includes study tours to corporate hubs like Singapore or Sydney, providing dual market credentials.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Top Specializations */}
            <section id="specializations" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📊 Top Specialisations for MBA</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tracks, durations, and criteria</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "Business Analytics", duration: "12-15 Months", unis: "Auckland, Waikato, Victoria, Canterbury", criteria: "B.Com/Science (60%), 0-3 years exp" },
                  { name: "IT Management", duration: "12-18 Months", unis: "Auckland, Victoria, Waikato, Canterbury", criteria: "B.IT/Commerce (B-), 3-5 years exp" },
                  { name: "Supply Chain & Logistics", duration: "12-18 Months", unis: "Massey, Auckland, AUT", criteria: "Any Bachelor's (65%), 3 years exp" },
                  { name: "Finance & Investment", duration: "15-20 Months", unis: "Otago, Auckland, Massey", criteria: "Bachelor's (80% preferred), 3 years exp" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-indigo-605 font-black uppercase tracking-wider block mb-1">Duration: {s.duration}</span>
                      <h3 className="font-black text-slate-850 text-base">{s.name}</h3>
                      <p className="text-slate-500 text-xs mt-2">Universities: <strong>{s.unis}</strong></p>
                      <p className="text-slate-600 text-xs font-semibold leading-relaxed mt-3 bg-slate-50 p-4 rounded-xl">Criteria: {s.criteria}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Top Universities */}
            <section id="universities" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🏛️ Top Universities for MBA (2026 Rankings & Fees)</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tuition costs with active currency conversion options</p>
              </div>

              {/* Currency Selector */}
              <div className="bg-white border border-slate-200/60 rounded-[24px] p-5 shadow-xs mb-8 flex justify-end">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrency('NZD')}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currency === 'NZD' ? 'bg-[#DE5C2B] text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    NZD ($)
                  </button>
                  <button 
                    onClick={() => setCurrency('INR')}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-xs' : 'text-slate-550 hover:bg-slate-100'}`}
                  >
                    INR (₹)
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {topMbaUnisList.map((uni) => (
                  <div key={uni.name} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0">
                        <img 
                          src={uni.logo} 
                          alt="" 
                          className="w-full h-full object-contain"
                          onError={(e) => e.target.src = 'https://logo.clearbit.com/auckland.ac.nz'}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-655 font-black uppercase tracking-wider flex items-center gap-1">
                          <Award size={12} />
                          QS Rank: {uni.qs} · {uni.city}
                        </span>
                        <h3 className="font-black text-slate-800 text-sm md:text-base mt-1">{uni.name}</h3>
                        <p className="text-[10px] text-slate-550 font-bold flex items-center gap-1 mt-1">
                          {uni.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 shrink-0">
                      <div>
                        <span className="text-slate-400 font-bold block">Tuition Fee</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">{formatCost(uni.feeNZD)}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-405 font-bold block">Action</span>
                        <Link to={`/contact?university=${encodeURIComponent(uni.name)}`} className="text-indigo-655 font-black mt-0.5 flex items-center gap-1 hover:text-indigo-850 transition-colors">
                          Apply Now
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Eligibility & Requirements */}
            <section id="eligibility" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-650" size={24} />
                  📋 Eligibility & Requirements
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">Academic Standing</h4>
                    <p className="text-slate-500 leading-relaxed">
                      Bachelor's degree from a recognized Indian university with a minimum **60% or B- average**.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">Work Experience & GMAT</h4>
                    <p className="text-slate-555 leading-relaxed">
                      Typically **3-5 years** relevant work experience. GMAT is optional for most universities, except the University of Otago (**550+ score**).
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Cost of Living */}
            <section id="living-costs" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  💶 Cost of Living in New Zealand
                </h2>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Expense Category</th>
                        <th className="pb-3 pr-4">Monthly Cost (NZD)</th>
                        <th className="pb-3 pr-4 text-right">Monthly Cost (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705 font-semibold">
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Rent (Shared Flat accommodation)</td>
                        <td className="py-4 text-slate-600">$800 - $1,300</td>
                        <td className="py-4 text-right text-indigo-655">₹43,000 - ₹70,000</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Food & Groceries</td>
                        <td className="py-4 text-slate-600">$400 - $600</td>
                        <td className="py-4 text-right text-indigo-655">₹21,500 - ₹32,000</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Utilities (Power, Internet)</td>
                        <td className="py-4 text-slate-600">$150 - $250</td>
                        <td className="py-4 text-right text-indigo-655">₹8,000 - ₹13,500</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Transport & Miscellaneous</td>
                        <td className="py-4 text-slate-600">$150 - $250</td>
                        <td className="py-4 text-right text-indigo-655">₹8,000 - ₹13,500</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100 text-xs text-sky-950 font-semibold leading-relaxed">
                  <strong>💡 Student Visa Fund Requirement:</strong> You must show access to a minimum of **NZD $20,000 (₹10.5 Lakhs)** for living expenses.
                </div>
              </div>
            </section>

            {/* 7. Scholarships */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Award className="text-indigo-650" size={24} />
                  🏆 Scholarships for MBA
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">🌟 NZ Excellence Awards (NZEA)</h4>
                    <p className="text-indigo-650 font-black mb-1">Value: Up to NZ$10,000</p>
                    <p className="text-slate-500">Exclusive partial tuition waivers for high-achieving Indian nationals.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">🏛️ Manaaki NZ Scholarships</h4>
                    <p className="text-indigo-655 font-black mb-1">Value: Full Funding</p>
                    <p className="text-slate-500">Covers 100% tuition, living stipends, and travel expenses.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">🎓 UoA India High Achievers</h4>
                    <p className="text-indigo-655 font-black mb-1">Value: Up to NZ$20,000</p>
                    <p className="text-slate-500">Offered by Auckland University for high-performing Indian students.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">💼 Otago Global Scholarships</h4>
                    <p className="text-indigo-655 font-black mb-1">Value: $10,000 – $15,000</p>
                    <p className="text-slate-500">Based on strong leadership and management career potential.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. ROI: Jobs & Salaries */}
            <section id="roi" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-[2rem] p-8">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                  <Compass className="text-indigo-300" size={24} />
                  MBA in New Zealand ROI: Jobs & Salaries
                </h2>

                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-xs font-semibold leading-relaxed mb-6">
                  <strong>📈 ROI Projections:</strong> Part-time earnings (**25 hours/week**) can bring in **~NZD $28,000 (₹14.5 Lakhs)** annually during studies, covering 100% of living costs. Break-even period ranges between **12 – 18 months**.
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-indigo-300 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">MBA Occupation</th>
                        <th className="pb-3 pr-4">Average Salary (NZD)</th>
                        <th className="pb-3 pr-4 text-right">Average Salary (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/90 font-semibold">
                      <tr>
                        <td className="py-4">ICT Project Manager</td>
                        <td className="py-4">$110,000 - $145,000</td>
                        <td className="py-4 text-right text-indigo-300 font-black">₹57L - ₹75 Lakh</td>
                      </tr>
                      <tr>
                        <td className="py-4">Operations Manager</td>
                        <td className="py-4">$95,000 - $130,000</td>
                        <td className="py-4 text-right text-indigo-300 font-black">₹49L - ₹67 Lakh</td>
                      </tr>
                      <tr>
                        <td className="py-4">Supply Chain Manager</td>
                        <td className="py-4">$100,000 - $135,000</td>
                        <td className="py-4 text-right text-indigo-300 font-black">₹52L - ₹70 Lakh</td>
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
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about NZ MBA studies</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "What is the 25-hour work rule?", a: "New Zealand term-time student work rights allow students to work up to 25 hours per week (up from 20 hours), earning approximately NZ$500-600 weekly." },
                  { q: "Do I need GMAT or GRE for admission?", a: "Some universities (like the University of Otago) require GMAT scores (550+), while others accept students based on academic credentials and relevant work experience (usually 3+ years)." },
                  { q: "What is the 'Living Curriculum'?", a: "New Zealand business schools emphasize hands-on learning through Live Consulting Projects, pairing students directly with local companies to solve real business challenges." },
                  { q: "Are management jobs on the Green List?", a: "Yes, various project management, construction management, and ICT management roles are listed on the Green List, offering a direct fast-track pathway to permanent residency (PR)." }
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

export default NewZealandMBACourse;
