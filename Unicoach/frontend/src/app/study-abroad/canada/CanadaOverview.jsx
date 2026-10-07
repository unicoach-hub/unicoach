import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, MapPin, Award, Building, Globe, ExternalLink, 
  BookOpen, Calendar, HelpCircle, CheckCircle2, ArrowRight, 
  Search, Filter, Info, Plane, Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../components/StudyAbroadCTA';
import { getUniversityLogo } from '../../../components/logoResolver';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../utils/universitySearchMatcher';
import canadaImg from '../../../assets/destinations/canada.jpg';
import PageBackBreadcrumb from '../../../components/common/PageBackBreadcrumb';

// ─────────────────────────────────────────────
// Canada University Database (for Finder)
// ─────────────────────────────────────────────
const masterUniversities = [
  // Toronto / Scarborough
  { id: 'can-1', name: "University of Toronto", city: "Toronto", rank: "25 QS", tuition: 61000, type: "PUBLIC", website: "https://www.utoronto.ca", eligibility: "GPA 3.5+, IELTS 7.0+, TOEFL 100+", logo: "https://logo.clearbit.com/utoronto.ca", courses: ["Computer Science", "Data Science", "Software Engineering", "Business Administration", "Engineering Science", "Artificial Intelligence"] },
  { id: 'can-2', name: "Centennial College", city: "Scarborough", rank: "76 National", tuition: 17000, type: "PUBLIC", website: "https://www.centennialcollege.ca", eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 80+", logo: "https://logo.clearbit.com/centennialcollege.ca", courses: ["Computer Systems", "Information Technology", "Business Administration", "Hospitality", "Software Engineering"] },
  { id: 'can-3', name: "Humber College", city: "Toronto", rank: "80 National", tuition: 16000, type: "PUBLIC", website: "https://www.humber.ca", eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 80+", logo: "https://logo.clearbit.com/humber.ca", courses: ["Information Technology Solutions", "Global Business", "Computer Science", "Web Development", "Marketing"] },
  { id: 'can-4', name: "Lambton College", city: "Toronto", rank: "85 National", tuition: 15000, type: "PUBLIC", website: "https://www.lambtoncollege.ca", eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 80+", logo: "https://logo.clearbit.com/lambtoncollege.ca", courses: ["Cloud Computing", "Cyber Security", "Computer Software", "Business Management"] },
  
  // Kitchener
  { id: 'can-5', name: "Conestoga College", city: "Kitchener", rank: "77 National", tuition: 15000, type: "PUBLIC", website: "https://www.conestogac.on.ca", eligibility: "GPA 2.5+, IELTS 6.0+, TOEFL 80+", logo: "https://logo.clearbit.com/conestogac.on.ca", courses: ["Applied Computer Science", "Web Development", "Engineering Science", "Business Analytics"] },

  // Halifax
  { id: 'can-6', name: "Dalhousie University", city: "Halifax", rank: "275 QS", tuition: 24000, type: "PUBLIC", website: "https://www.dal.ca", eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 90+", logo: "https://logo.clearbit.com/dal.ca", courses: ["Computer Science", "Data Science", "Management", "Engineering Science"] },

  // Montreal
  { id: 'can-7', name: "McGill University", city: "Montreal", rank: "29 QS", tuition: 45000, type: "PUBLIC", website: "https://www.mcgill.ca", eligibility: "GPA 3.5+, IELTS 7.0+, TOEFL 100+", logo: "https://logo.clearbit.com/mcgill.ca", courses: ["Computer Science", "Medicine", "Business Administration", "Data Science", "Economics"] },
  { id: 'can-8', name: "Concordia University", city: "Montreal", rank: "387 QS", tuition: 28000, type: "PUBLIC", website: "https://www.concordia.ca", eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 90+", logo: "https://logo.clearbit.com/concordia.ca", courses: ["Computer Science", "Software Engineering", "Information Systems", "Business Administration"] },

  // Edmonton
  { id: 'can-9', name: "University of Alberta", city: "Edmonton", rank: "96 QS", tuition: 29000, type: "PUBLIC", website: "https://www.ualberta.ca", eligibility: "GPA 3.2+, IELTS 6.5+, TOEFL 90+", logo: "https://logo.clearbit.com/ualberta.ca", courses: ["Computing Science", "Computer Science", "Artificial Intelligence", "Engineering Science", "Business Administration"] },

  // London Canada
  { id: 'can-10', name: "Western University", city: "London, Canada", rank: "114 QS", tuition: 36000, type: "PUBLIC", website: "https://www.uwo.ca", eligibility: "GPA 3.2+, IELTS 7.0+, TOEFL 95+", logo: "https://logo.clearbit.com/uwo.ca", courses: ["Computer Science", "Management", "Data Analytics", "Engineering Science"] }
];

const CanadaOverview = () => {
  const [currency, setCurrency] = useState('INR'); // 'CAD' | 'INR'
  const [financeTab, setFinanceTab] = useState('tuition'); // 'tuition' | 'living' | 'prearrival'
  const [rankingTab, setRankingTab] = useState('qs'); // 'qs' | 'specialization' | 'one-year'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedFeeLimit, setSelectedFeeLimit] = useState('All'); // 'All' | '20000' | '40000'

  const exchangeRate = 61.20; // 1 CAD ≈ 61.20 INR

  // Currency Converter helper
  const formatCost = (valInCAD) => {
    if (currency === 'CAD') {
      return `C$${valInCAD.toLocaleString()}`;
    }
    const valInINR = valInCAD * exchangeRate;
    if (valInINR >= 10000000) {
      return `₹ ${(valInINR / 10000000).toFixed(2)} Cr`;
    }
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  // Filter Universities logic
  const filteredUniversities = masterUniversities.filter(uni => {
    if (selectedCity !== 'All' && uni.city !== selectedCity) return false;
    if (selectedFeeLimit !== 'All') {
      if (selectedFeeLimit === '20000' && uni.tuition > 20000) return false;
      if (selectedFeeLimit === '40000' && uni.tuition > 40000) return false;
    }
    if (searchTerm && !matchesUniversitySearch(uni, searchTerm)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans select-none">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-100/50 via-indigo-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        
        {/* On-Page Navigation: Dedicated Back Button & Breadcrumbs */}
        <PageBackBreadcrumb items={[{ label: 'Study in Canada' }]} />

        {/* 1. HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 text-left"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
              <Plane size={14} className="animate-pulse" />
              <span>Study Abroad Guide 2026</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 mb-6 leading-tight tracking-tight">
              List of Top Universities & Colleges in Canada for{' '}
              <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Masters</span>
            </h1>
            <p className="text-slate-660 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mb-8">
              Canada offers world-class education with highly competitive tuition fees and a clear pathway to permanent residency through PGWP programs.
            </p>
            <a 
              href="#university-finder" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#DE5C2B] hover:bg-blue-650 text-white font-bold text-sm rounded-2xl shadow-lg transition-transform active:scale-[0.98] cursor-pointer"
            >
              <span>Find Your Preferred University</span>
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
                src={canadaImg} 
                alt="CN Tower, Toronto skyline, Canada" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Toronto, Ontario</p>
                <h3 className="text-xl font-black mt-1">World-Class Education & Living</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { val: "100,000+", label: "Indian Students" },
            { val: "10+", label: "Top 200 QS Universities" },
            { val: "Up to 3 Yrs", label: "Post-Grad Work Permit" },
            { val: "1 - 3 Yrs", label: "Average ROI Period" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-md text-left">
              <p className="text-2xl font-black text-indigo-650">{stat.val}</p>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Global Currency Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-md inline-flex items-center gap-1">
            <button 
              onClick={() => setCurrency('CAD')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'CAD' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-50'}`}
            >
              CAD (C$)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 2. FINANCIALS OVERVIEW (TABBED LAYOUT) */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Total Cost of MS/PG in Canada</h2>
            <p className="text-slate-500 text-sm font-bold">Plan your finances by understanding tuition tiers, living expenses, and pre-departure costs.</p>
          </div>

          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
            {[
              { id: 'tuition', label: 'Tuition Fees Tiers' },
              { id: 'living', label: 'Living Costs by Province' },
              { id: 'prearrival', label: 'Pre-Arrival Costs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFinanceTab(tab.id)}
                className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${financeTab === tab.id ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-slate-550 hover:text-indigo-500'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {financeTab === 'tuition' && (
              <motion.div 
                key="tuition" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {[
                  { tier: "Tier 1 (Elite Universities)", desc: "Top-ranked global schools like University of Toronto, McGill, UBC.", limits: [35000, 65000] },
                  { tier: "Tier 2 (Mid-Tier Universities)", desc: "Highly reputable research schools like Western, Alberta, Dalhousie.", limits: [22000, 36000] },
                  { tier: "Tier 3 (Public Colleges)", desc: "Cost-effective colleges offering diploma and graduate certificates.", limits: [14000, 18000] }
                ].map((tier, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-[24px] p-7 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:border-orange-200 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <span className="text-xl font-bold text-slate-900 tracking-tight">{tier.tier}</span>
                      <p className="text-slate-500 text-sm font-normal leading-relaxed mt-2 mb-6">{tier.desc}</p>
                    </div>
                    <div className="border-t border-slate-100 pt-5">
                      <p className="text-[10.5px] text-slate-400 font-semibold uppercase tracking-wider">Annual Tuition</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                        {`${formatCost(tier.limits[0])} - ${formatCost(tier.limits[1])}`}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {financeTab === 'living' && (
              <motion.div 
                key="living" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] overflow-hidden"
              >
                <div className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Monthly Expenses (Excluding tuition, average student)</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                        <th className="pb-3 pr-4">Province & Cities</th>
                        <th className="pb-3 pr-4">Estimated Rent & Utilities</th>
                        <th className="pb-3 pr-4 text-right">Avg Monthly Living (CAD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {[
                        { s: "Ontario (Toronto, Kitchener)", rent: "C$900 - C$1,400/mo", cad: 1600 },
                        { s: "British Columbia (Vancouver)", rent: "C$950 - C$1,500/mo", cad: 1700 },
                        { s: "Quebec (Montreal)", rent: "C$650 - C$1,000/mo", cad: 1200 },
                        { s: "Alberta (Edmonton, Calgary)", rent: "C$700 - C$1,100/mo", cad: 1300 },
                        { s: "Nova Scotia (Halifax)", rent: "C$600 - C$950/mo", cad: 1150 }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 text-indigo-650 font-black">{row.s}</td>
                          <td className="py-3.5 text-slate-500 font-semibold">{row.rent}</td>
                          <td className="py-3.5 text-right font-black text-slate-900">{formatCost(row.cad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {financeTab === 'prearrival' && (
              <motion.div 
                key="prearrival" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] overflow-hidden"
              >
                <div className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Upfront Pre-departure Fees</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                        <th className="pb-3 pr-4">Expense Type</th>
                        <th className="pb-3 pr-4 text-right">Estimated Cost (CAD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {[
                        { type: "Canada Student Visa & Biometrics Fee", cad: 235 },
                        { type: "GIC (Guaranteed Investment Certificate) - Mandatory", cad: 20635 },
                        { type: "Language Exams (IELTS/PTE/TOEFL)", cad: 300 },
                        { type: "Medical Exam for Visa", cad: 150 },
                        { type: "Flight Tickets (Avg)", cad: 1200 }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 text-slate-800 font-bold">{row.type}</td>
                          <td className="py-3.5 text-right font-black text-indigo-650">{formatCost(row.cad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. CHEAPEST PROGRAMS BANNER */}
        <div className="mb-20 bg-[#FFF7F3] border border-orange-200/80 text-slate-900 rounded-[28px] p-8 md:p-10 relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-20%] w-[400px] h-[400px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Looking for Budget-Friendly Options?</h2>
          <p className="text-slate-600 text-sm font-semibold max-w-xl mb-8">Some Canadian public colleges offer accredited master's or graduate diplomas at very affordable rates.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Conestoga College", degree: "Graduate Certificate in Accounting Practice", fee: 14930 },
              { name: "Lambton College", degree: "Post-Graduate Diploma in Computer Science", fee: 15000 },
              { name: "Humber College", degree: "Graduate Certificate in Project Management", fee: 16000 }
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-orange-100 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                <span className="text-[10px] text-[#DE5C2B] font-black uppercase tracking-wider">{p.name}</span>
                <p className="text-lg font-black mt-1.5 mb-3">{p.degree}</p>
                <div className="text-xs font-semibold text-slate-500">Tuition: <span className="font-black text-slate-900">{formatCost(p.fee)}/year</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. RANKINGS AND SPECIALIZATIONS */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Top Universities & Rankings</h2>
            <p className="text-slate-500 text-sm font-bold">Compare elite Canadian universities by global QS rankings or specific specializations.</p>
          </div>

          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
            {[
              { id: 'qs', label: 'QS Top 2026 Rankings' },
              { id: 'specialization', label: 'Best by Specialization' },
              { id: 'co-op', label: 'Top Co-op/Internship Programs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRankingTab(tab.id)}
                className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${rankingTab === tab.id ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-slate-550 hover:text-indigo-500'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {rankingTab === 'qs' && (
              <motion.div 
                key="qs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                        <th className="pb-3 pr-4">QS Rank</th>
                        <th className="pb-3 pr-4">University</th>
                        <th className="pb-3 pr-4">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {[
                        { rank: "25", name: "University of Toronto", loc: "Toronto, ON" },
                        { rank: "29", name: "McGill University", loc: "Montreal, QC" },
                        { rank: "38", name: "University of British Columbia", loc: "Vancouver, BC" },
                        { rank: "96", name: "University of Alberta", loc: "Edmonton, AB" },
                        { rank: "114", name: "Western University", loc: "London, ON" },
                        { rank: "115", name: "University of Montreal", loc: "Montreal, QC" }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 text-indigo-650 font-black">{row.rank}</td>
                          <td className="py-3.5 text-slate-800 font-bold">{row.name}</td>
                          <td className="py-3.5 text-slate-500 font-semibold">{row.loc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {rankingTab === 'specialization' && (
              <motion.div 
                key="specialization" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {[
                  { field: "Computer Science", unis: ["1. University of Toronto", "2. UBC (Vancouver)", "3. University of Waterloo"] },
                  { field: "Business & MBA", unis: ["1. Rotman (U of T)", "2. Desautels (McGill)", "3. Ivey (Western)"] },
                  { field: "Engineering & Tech", unis: ["1. U of T (Toronto)", "2. Waterloo (Waterloo)", "3. UBC (Vancouver)"] }
                ].map((spec, i) => (
                  <div key={i} className="bg-white/60 border border-white rounded-[24px] p-6 shadow-sm">
                    <h3 className="text-lg font-black text-indigo-755 mb-4">{spec.field}</h3>
                    <ul className="space-y-3">
                      {spec.unis.map((u, idx) => (
                        <li key={idx} className="text-slate-650 font-bold text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">{u}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </motion.div>
            )}

            {rankingTab === 'co-op' && (
              <motion.div 
                key="co-op" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                        <th className="pb-3 pr-4">Institution</th>
                        <th className="pb-3 pr-4">Typical Program Co-op Term</th>
                        <th className="pb-3 pr-4 text-right">Avg Co-op Salary / Hr</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {[
                        { u: "University of Waterloo", p: "CS / Engineering Co-op Tiers", d: "C$22 - C$32" },
                        { u: "Conestoga College", p: "Applied Computer Science / BBA Co-op", d: "C$18 - C$25" },
                        { u: "Centennial College", p: "Business Administration Co-op", d: "C$17 - C$22" }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 text-slate-800 font-bold">{row.u}</td>
                          <td className="py-3.5 text-slate-600 font-semibold">{row.p}</td>
                          <td className="py-3.5 text-right text-indigo-650 font-black">{row.d}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. STEP-BY-STEP APPLICATION WORKFLOW */}
        <div className="mb-20">
          <div className="text-left mb-12 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Step-by-Step Application Pipeline</h2>
            <p className="text-slate-500 text-sm font-bold">A comprehensive roadmap from preparation to arriving on campus in Canada.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {[
              { num: "01", t: "Shortlist", d: "Choose 5-8 colleges/universities matching budget." },
              { num: "02", t: "Language Test", d: "Clear IELTS Academic or PTE Academic test." },
              { num: "03", t: "Apply & PAL", d: "Submit portal apps & request Provincial Attestation Letter." },
              { num: "04", t: "Get Offer", d: "Secure Letter of Acceptance (LOA) from DLI." },
              { num: "05", t: "Pay GIC", d: "Deposit C$20,635 into CAD bank for GIC certificate." },
              { num: "06", t: "Study Permit", d: "Apply online via SDS (Student Direct Stream) portal." }
            ].map((step, idx) => (
              <div key={idx} className="bg-white/60 border border-white rounded-[24px] p-5 shadow-sm relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300">
                <span className="text-[10px] text-indigo-455 font-black uppercase tracking-wider">Step</span>
                <p className="text-3xl font-black text-indigo-605 mb-2 mt-0.5">{step.num}</p>
                <p className="text-slate-800 font-extrabold text-sm mb-1">{step.t}</p>
                <p className="text-slate-500 text-[11.5px] font-semibold leading-snug">{step.d}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 bg-white/40 border border-white/60 backdrop-blur-xl rounded-[32px] p-6 md:p-8">
            <div>
              <h3 className="text-xl font-black text-slate-850 mb-5">Mandatory Admissions Checklists</h3>
              <div className="space-y-3.5">
                {["Academic Transcripts & Degree Certificates", "Letter of Acceptance (LOA) from DLI", "Statement of Purpose (SOP)", "Provincial Attestation Letter (PAL) if applicable"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3.5 text-slate-850 font-bold text-[14px]">
                    <CheckCircle2 size={18} className="text-emerald-500 stroke-[2.5]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-850 mb-5">Financial & Visa Checklists</h3>
              <div className="space-y-3.5">
                {["Guaranteed Investment Certificate (GIC) Receipt", "Tuition Fee Payment Receipt (1st Year)", "IELTS Score Sheet (6.0 - 6.5+ bands)", "Upfront Medical Exam Report"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3.5 text-slate-850 font-bold text-[14px]">
                    <CheckCircle2 size={18} className="text-indigo-500 stroke-[2.5]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 6. SCHOLARSHIPS & LOANS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          
          <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Top Canada Scholarships</h3>
            <div className="space-y-4">
              {[
                { name: "Vanier Canada Graduate Scholarships", award: "C$50,000 per year (for PhD programs)", deadline: "November 2026" },
                { name: "Ontario Graduate Scholarship (OGS)", award: "C$15,000 per year (merit based)", deadline: "January-March 2026" },
                { name: "Lester B. Pearson International Scholarship", award: "Full tuition, books, incidental fees, residence", deadline: "January 2026" }
              ].map((s, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 hover:border-indigo-400 transition-colors">
                  <p className="font-black text-slate-800 text-sm">{s.name}</p>
                  <p className="text-xs text-indigo-650 font-bold">{s.award}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Deadline: {s.deadline}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Education Loan Providers</h3>
            <div className="space-y-4">
              {[
                { bank: "HDFC Credila (Canada Study Loans)", limit: "Up to ₹1.5 Crore", rate: "Flexible collateral options" },
                { bank: "ICICI Bank (International Stud)", limit: "Up to ₹2 Crore", rate: "Flexible tenure" },
                { bank: "Prodigy Finance (Canada Masters)", limit: "Up to 100% of cost of attendance", rate: "Collateral-free, CAD based" }
              ].map((b, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 hover:border-indigo-400 transition-colors">
                  <p className="font-black text-slate-800 text-sm">{b.bank}</p>
                  <p className="text-xs text-indigo-650 font-bold">{b.limit}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{b.rate}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 7. POST GRADUATION CAREERS & ROI */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Post-Graduation Careers & Salaries</h2>
            <p className="text-slate-500 text-sm font-bold">Canadian degrees deliver top-tier return on investments, supported by PGWP programs.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                    <th className="pb-3 pr-4">Job Title</th>
                    <th className="pb-3 pr-4 text-right">Average Salary (CAD / yr)</th>
                    <th className="pb-3 pr-4">Top Recruiters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  {[
                    { title: "Software Engineer", sal: 88000, rec: "Amazon, Shopify, Google, IBM, CGI" },
                    { title: "Data Scientist", sal: 85000, rec: "RBC, Deloitte, TD Bank, Sun Life" },
                    { title: "Project Manager", sal: 80000, rec: "Bell Canada, Rogers, Scotiabank" },
                    { title: "Accountant / Financial Analyst", sal: 65000, rec: "PwC, EY, KPMG, BMO Financial Group" }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 text-slate-800 font-black">{row.title}</td>
                      <td className="py-3.5 text-right text-indigo-650 font-black pr-10">{formatCost(row.sal)}</td>
                      <td className="py-3.5 text-slate-500 font-semibold">{row.rec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 8. INTERACTIVE CANADA UNIVERSITY FINDER */}
        <div className="mb-10" id="university-finder">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Interactive Canada College & Uni Finder</h2>
            <p className="text-slate-500 text-sm font-bold">Search and filter accredited universities across the top Canadian hubs in real time.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] mb-8 flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course (e.g. CS, MBA, Data Science), college, city..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* City Selector */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {['All', 'Toronto', 'Scarborough', 'Kitchener', 'Halifax', 'Montreal', 'Edmonton', 'London, Canada'].map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${selectedCity === c ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-650 hover:bg-slate-100 border border-slate-100'}`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Tuition Cap filter */}
            <div className="w-full md:w-auto">
              <select
                value={selectedFeeLimit}
                onChange={(e) => setSelectedFeeLimit(e.target.value)}
                className="w-full md:w-auto bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Tuition Budgets</option>
                <option value="20000">Max C$20,000 / year</option>
                <option value="40000">Max C$40,000 / year</option>
              </select>
            </div>

          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredUniversities.map((uni) => {
                const matchedCourses = searchTerm ? getMatchedCoursesForUniversity(uni, searchTerm) : [];
                return (
                <motion.div
                  key={uni.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:border-orange-200 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                        <img src={getUniversityLogo(uni.name, uni.logo)} alt={uni.name} className="w-9 h-9 object-contain" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-tight hover:text-indigo-600 transition-colors">{uni.name}</h4>
                        <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                          <MapPin size={10} />
                          {uni.city}, Canada
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">QS/Nat Rank</p>
                        <p className="text-xs font-black text-slate-800 mt-0.5">{uni.rank}</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tuition Fees</p>
                        <p className="text-xs font-black text-indigo-650 mt-0.5">{formatCost(uni.tuition)}/yr</p>
                      </div>
                    </div>

                    {matchedCourses.length > 0 && (
                      <div className="mb-3 flex flex-wrap items-center gap-1.5 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1.5 rounded-xl">
                        <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wide">✓ Matched Course:</span>
                        {matchedCourses.slice(0, 2).map((mc, idx) => (
                          <span key={idx} className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                            {mc}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-slate-550 font-semibold mb-4 leading-normal bg-white p-2.5 rounded-xl border border-dashed border-slate-200">
                      <strong>Eligibility:</strong> {uni.eligibility}
                    </p>
                  </div>

                  <div className="flex gap-2 border-t border-slate-100 pt-4 mt-2">
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 bg-[#111111] text-white rounded-full hover:bg-black transition-colors text-xs font-bold"
                    >
                      Visit School
                    </a>
                    <Link
                      to={`/contact?university=${encodeURIComponent(uni.name)}`}
                      className="flex-1 text-center py-2 border border-slate-300 text-slate-800 rounded-full hover:border-[#DE5C2B] hover:text-[#DE5C2B] transition-colors text-xs font-bold"
                    >
                      Check Eligibility
                    </Link>
                  </div>
                </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredUniversities.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-semibold text-sm">
                No universities match the current search or filters.
              </div>
            )}
          </div>
        </div>


      {/* CTA Section */}
      <StudyAbroadCTA country="Canada" />

      </div>
    </div>
  );
};

export default CanadaOverview;
