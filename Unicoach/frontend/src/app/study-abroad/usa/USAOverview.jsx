import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, MapPin, Award, Building, Globe, ExternalLink, 
  BookOpen, Calendar, HelpCircle, CheckCircle2, ArrowRight, 
  Search, Filter, Info, Plane, Calculator, GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../components/StudyAbroadCTA';
import usaImg from '../../../assets/destinations/usa.jpg';
import { matchesUniversitySearch } from '../../../utils/universitySearchMatcher';
import PageBackBreadcrumb from '../../../components/common/PageBackBreadcrumb';

const UniLogo = ({ logo, name }) => {
  const [error, setError] = useState(false);
  const resolvedLogo = logo && typeof logo === 'string' && logo.includes('logo.clearbit.com')
    ? logo.replace('logo.clearbit.com', 'logo.clearbit.com')
    : logo;

  if (error || !resolvedLogo) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center text-white select-none">
        <GraduationCap size={14} className="mb-0.5" />
        <span className="text-[8px] font-black tracking-tighter uppercase leading-none">
          {name.split(' ').map(w => w[0]).join('').slice(0, 3)}
        </span>
      </div>
    );
  }
  return (
    <img 
      src={resolvedLogo} 
      alt={name} 
      className="w-9 h-9 object-contain" 
      onError={() => setError(true)} 
    />
  );
};

// ─────────────────────────────────────────────
// USA University Data Database
// ─────────────────────────────────────────────
const masterUniversities = [
  // Atlanta
  { id: 'atl-1', name: "Georgia Institute of Technology", city: "Atlanta", rank: "88 QS", tuition: 43000, type: "PUBLIC", website: "https://www.gatech.edu", eligibility: "GPA 3.5+, IELTS 7.0+, GRE required", logo: "https://logo.clearbit.com/gatech.edu" },
  { id: 'atl-2', name: "Emory University", city: "Atlanta", rank: "155 QS", tuition: 59000, type: "PRIVATE", website: "https://www.emory.edu", eligibility: "GPA 3.5+, IELTS 7.0+, GRE/GMAT required", logo: "https://logo.clearbit.com/emory.edu" },
  { id: 'atl-3', name: "Georgia State University", city: "Atlanta", rank: "299 US News", tuition: 27000, type: "PUBLIC", website: "https://www.gsu.edu", eligibility: "GPA 3.0+, IELTS 6.5+, GRE required", logo: "https://logo.clearbit.com/gsu.edu" },
  
  // Boston
  { id: 'bos-1', name: "Massachusetts Institute of Technology (MIT)", city: "Boston", rank: "1 QS", tuition: 59750, type: "PRIVATE", website: "https://www.mit.edu", eligibility: "GPA 3.9+, IELTS 7.5+, GRE required", logo: "https://logo.clearbit.com/mit.edu" },
  { id: 'bos-2', name: "Harvard University", city: "Boston", rank: "5 QS", tuition: 56200, type: "PRIVATE", website: "https://www.harvard.edu", eligibility: "GPA 3.9+, IELTS 7.5+, GRE required", logo: "https://logo.clearbit.com/harvard.edu" },
  { id: 'bos-3', name: "Northeastern University", city: "Boston", rank: "375 QS", tuition: 48000, type: "PRIVATE", website: "https://www.northeastern.edu", eligibility: "GPA 3.2+, IELTS 6.5+, GRE/TOEFL", logo: "https://logo.clearbit.com/northeastern.edu" },
  
  // Chicago
  { id: 'chi-1', name: "University of Chicago", city: "Chicago", rank: "13 QS", tuition: 61500, type: "PRIVATE", website: "https://www.uchicago.edu", eligibility: "GPA 3.8+, IELTS 7.5+, GRE/GMAT", logo: "https://logo.clearbit.com/uchicago.edu" },
  { id: 'chi-2', name: "Northwestern University", city: "Chicago", rank: "35 QS", tuition: 58000, type: "PRIVATE", website: "https://www.northwestern.edu", eligibility: "GPA 3.7+, IELTS 7.5+, GRE/GMAT", logo: "https://logo.clearbit.com/northwestern.edu" },
  { id: 'chi-3', name: "University of Illinois Chicago (UIC)", city: "Chicago", rank: "323 QS", tuition: 31000, type: "PUBLIC", website: "https://www.uic.edu", eligibility: "GPA 3.0+, IELTS 6.5+, TOEFL 80+", logo: "https://logo.clearbit.com/uic.edu" },
  
  // Los Angeles
  { id: 'la-1', name: "California Institute of Technology (Caltech)", city: "Los Angeles", rank: "10 QS", tuition: 60800, type: "PRIVATE", website: "https://www.caltech.edu", eligibility: "GPA 3.9+, IELTS 7.5+, GRE required", logo: "https://logo.clearbit.com/caltech.edu" },
  { id: 'la-2', name: "University of California, Los Angeles (UCLA)", city: "Los Angeles", rank: "42 QS", tuition: 32200, type: "PUBLIC", website: "https://www.ucla.edu", eligibility: "GPA 3.6+, IELTS 7.0+, GRE required", logo: "https://logo.clearbit.com/ucla.edu" },
  { id: 'la-3', name: "University of Southern California (USC)", city: "Los Angeles", rank: "116 QS", tuition: 52000, type: "PRIVATE", website: "https://www.usc.edu", eligibility: "GPA 3.4+, IELTS 7.0+, GRE required", logo: "https://logo.clearbit.com/usc.edu" },
  
  // Philadelphia
  { id: 'phi-1', name: "University of Pennsylvania (UPenn)", city: "Philadelphia", rank: "15 QS", tuition: 56000, type: "PRIVATE", website: "https://www.upenn.edu", eligibility: "GPA 3.8+, IELTS 7.5+, GRE required", logo: "https://logo.clearbit.com/upenn.edu" },
  { id: 'phi-2', name: "Temple University", city: "Philadelphia", rank: "121 US News", tuition: 31000, type: "PUBLIC", website: "https://www.temple.edu", eligibility: "GPA 3.0+, IELTS 6.5+, GRE required", logo: "https://logo.clearbit.com/temple.edu" },
  { id: 'phi-3', name: "Drexel University", city: "Philadelphia", rank: "651 QS", tuition: 55000, type: "PUBLIC", website: "https://www.drexel.edu", eligibility: "GPA 3.3+, IELTS 6.5+, GRE required", logo: "https://logo.clearbit.com/drexel.edu" },
];

const USAOverview = () => {
  const [currency, setCurrency] = useState('INR'); // 'USD' | 'INR'
  const [financeTab, setFinanceTab] = useState('tuition'); // 'tuition' | 'living' | 'prearrival'
  const [rankingTab, setRankingTab] = useState('qs'); // 'qs' | 'specialization' | 'one-year'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedFeeLimit, setSelectedFeeLimit] = useState('All'); // 'All' | '30000' | '50000'

  const exchangeRate = 88.22;

  // Currency Converter helper
  const formatCost = (valInUSD) => {
    if (currency === 'USD') {
      return `$${valInUSD.toLocaleString()}`;
    }
    const valInINR = valInUSD * exchangeRate;
    if (valInINR >= 10000000) {
      return `₹ ${(valInINR / 10000000).toFixed(2)} Cr`;
    }
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  // Filter Universities logic
  const filteredUniversities = masterUniversities.filter(uni => {
    if (selectedCity !== 'All' && uni.city !== selectedCity) return false;
    if (selectedFeeLimit !== 'All') {
      if (selectedFeeLimit === '30000' && uni.tuition > 30000) return false;
      if (selectedFeeLimit === '50000' && uni.tuition > 50000) return false;
    }
    if (searchTerm && !matchesUniversitySearch(uni, searchTerm)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-100/50 via-indigo-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        
        {/* On-Page Navigation: Dedicated Back Button & Breadcrumbs */}
        <PageBackBreadcrumb items={[{ label: 'Study in USA' }]} />

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
              List of Top Universities & Colleges in USA for{' '}
              <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Masters</span>
            </h1>
            <p className="text-slate-660 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mb-8">
              The U.S. Master's degree is the single biggest career accelerator on the planet. Secure starting salaries that double your earning potential overnight.
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
                src={usaImg} 
                alt="Statue of Liberty, New York City, USA" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Statue of Liberty, NYC</p>
                <h3 className="text-xl font-black mt-1">Gateway to Global Innovation</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { val: "330,000+", label: "Indian Students" },
            { val: "50+", label: "Top 200 QS Universities" },
            { val: "Up to 3 Yrs", label: "OPT Work Extension" },
            { val: "2 - 5 Yrs", label: "Average ROI Period" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-md text-left">
              <p className="text-2xl font-black text-indigo-600">{stat.val}</p>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Global Currency Switcher floating badge */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-md inline-flex items-center gap-1">
            <button 
              onClick={() => setCurrency('USD')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'USD' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              USD ($)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 2. FINANCIALS OVERVIEW (TABBED LAYOUT) */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Total Cost of MS in USA</h2>
            <p className="text-slate-500 text-sm font-bold">Plan your finances by understanding tuition tiers, living expenses, and pre-departure costs.</p>
          </div>

          {/* Finance tab switches */}
          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
            {[
              { id: 'tuition', label: 'Tuition Fees Tiers' },
              { id: 'living', label: 'Living Costs by State' },
              { id: 'prearrival', label: 'Pre-Arrival Costs' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFinanceTab(tab.id)}
                className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${financeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-550 hover:text-indigo-500'}`}
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
                  { tier: "Tier 1 (Elite)", desc: "Top-ranked global schools like MIT, Stanford, Harvard.", usd: "40k - 60k", limits: [40000, 60000] },
                  { tier: "Tier 2 (Mid)", desc: "Highly reputable research institutions.", usd: "25k - 40k", limits: [25000, 40000] },
                  { tier: "Tier 3 (Budget)", desc: "Cost-effective colleges offering quality education.", usd: "15k - 25k", limits: [15000, 25000] }
                ].map((tier, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-[24px] p-7 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:border-orange-200 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <span className="text-xl font-bold text-slate-900 tracking-tight">{tier.tier}</span>
                      <p className="text-slate-500 text-sm font-normal leading-relaxed mt-2 mb-6">{tier.desc}</p>
                    </div>
                    <div className="border-t border-slate-100 pt-5">
                      <p className="text-[10.5px] text-slate-400 font-semibold uppercase tracking-wider">Annual Tuition</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                        {currency === 'USD' ? `$${tier.usd}` : `${formatCost(tier.limits[0])} - ${formatCost(tier.limits[1])}`}
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
                <div className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Most Affordable States (Excluding rent, average/month)</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                        <th className="pb-3 pr-4">Rank</th>
                        <th className="pb-3 pr-4">State</th>
                        <th className="pb-3 pr-4 text-right">Avg Monthly Expenses</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {[
                        { r: "#1", s: "Arkansas", usd: 1860 },
                        { r: "#2", s: "Mississippi", usd: 1880 },
                        { r: "#3", s: "South Dakota", usd: 1910 },
                        { r: "#4", s: "Oklahoma", usd: 1840 },
                        { r: "#5", s: "Louisiana", usd: 2000 }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 text-indigo-650 font-black">{row.r}</td>
                          <td className="py-3.5 text-slate-800 font-bold">{row.s}</td>
                          <td className="py-3.5 text-right font-black text-slate-900">{formatCost(row.usd)}</td>
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
                        <th className="pb-3 pr-4 text-right">Estimated Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {[
                        { type: "Student Visa (F-1) Fee", usd: 185 },
                        { type: "SEVIS I-901 Fee", usd: 350 },
                        { type: "Flight Tickets (Avg)", usd: 1000 },
                        { type: "Health Insurance (Mandatory/yr)", usd: 1000 },
                        { type: "University Enrollment Deposit", usd: 600 }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 text-slate-800 font-bold">{row.type}</td>
                          <td className="py-3.5 text-right font-black text-indigo-650">{formatCost(row.usd)}</td>
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
          <p className="text-slate-600 text-sm font-semibold max-w-xl mb-8">Some U.S. public universities offer accredited master's programs at significantly lower rates.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Texas at Tyler", degree: "MS in Electrical Eng", fee: 1968 },
              { name: "Wright State University", degree: "MS in Cybersecurity", fee: 13740 },
              { name: "CSU Long Beach", degree: "MS in Data Science", fee: 17922 }
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
            <p className="text-slate-500 text-sm font-bold">Compare elite U.S. universities by global QS rankings or specific specializations.</p>
          </div>

          {/* Ranking tab switches */}
          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
            {[
              { id: 'qs', label: 'QS Top 2026 Rankings' },
              { id: 'specialization', label: 'Best by Specialization' },
              { id: 'one-year', label: 'Accelerated 1-Year MS' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRankingTab(tab.id)}
                className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${rankingTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-550 hover:text-indigo-500'}`}
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
                        { rank: "1", name: "Massachusetts Institute of Technology (MIT)", loc: "Cambridge, MA" },
                        { rank: "3", name: "Stanford University", loc: "Stanford, CA" },
                        { rank: "5", name: "Harvard University", loc: "Cambridge, MA" },
                        { rank: "10", name: "California Institute of Technology (Caltech)", loc: "Pasadena, CA" },
                        { rank: "13", name: "University of Chicago", loc: "Chicago, IL" },
                        { rank: "15", name: "University of Pennsylvania", loc: "Philadelphia, PA" }
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
                  { field: "Engineering & Tech", unis: ["1. MIT (Cambridge)", "2. Stanford (Stanford)", "3. UC Berkeley (Berkeley)"] },
                  { field: "Life Sciences & Med", unis: ["1. Harvard (Cambridge)", "2. Johns Hopkins (Baltimore)", "3. Stanford (Stanford)"] },
                  { field: "Arts & Humanities", unis: ["1. MIT (Cambridge)", "2. Harvard (Cambridge)", "3. Stanford (Stanford)"] }
                ].map((spec, i) => (
                  <div key={i} className="bg-white/60 border border-white rounded-[24px] p-6 shadow-sm">
                    <h3 className="text-lg font-black text-indigo-750 mb-4">{spec.field}</h3>
                    <ul className="space-y-3">
                      {spec.unis.map((u, idx) => (
                        <li key={idx} className="text-slate-650 font-bold text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">{u}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </motion.div>
            )}

            {rankingTab === 'one-year' && (
              <motion.div 
                key="one-year" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                        <th className="pb-3 pr-4">University</th>
                        <th className="pb-3 pr-4">Program</th>
                        <th className="pb-3 pr-4 text-right">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {[
                        { u: "Hult International Business School", p: "MS in Business Analytics / Finance", d: "~12 Months" },
                        { u: "Northwestern University", p: "Accelerated MS in Information Systems (MSIS)", d: "10-12 Months" },
                        { u: "Stanford Graduate School of Business", p: "MSx - Master's in Management", d: "~12 Months" }
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
            <p className="text-slate-500 text-sm font-bold">A comprehensive roadmap from preparation to arriving on campus in the USA.</p>
          </div>

          {/* Interactive Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {[
              { num: "01", t: "Shortlist", d: "Choose 8-10 schools matching profile & budget." },
              { num: "02", t: "Exams", d: "Clear GRE, TOEFL, or IELTS tests." },
              { num: "03", t: "Prepare Docs", d: "Draft statement of purpose, write resume & LORs." },
              { num: "04", t: "Apply Online", d: "Submit portal apps before winter deadlines." },
              { num: "05", t: "Funding & I-20", d: "Pay deposit & request I-20 certificate." },
              { num: "06", t: "F-1 Visa", d: "Pay SEVIS, fill DS-160 & clear visa interview." }
            ].map((step, idx) => (
              <div key={idx} className="bg-white/60 border border-white rounded-[24px] p-5 shadow-sm relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300">
                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider">Step</span>
                <p className="text-3xl font-black text-indigo-600 mb-2 mt-0.5">{step.num}</p>
                <p className="text-slate-800 font-extrabold text-sm mb-1">{step.t}</p>
                <p className="text-slate-500 text-[11.5px] font-semibold leading-snug">{step.d}</p>
              </div>
            ))}
          </div>

          {/* Document Checklist cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 bg-white/40 border border-white/60 backdrop-blur-xl rounded-[32px] p-6 md:p-8">
            <div>
              <h3 className="text-xl font-black text-slate-850 mb-5">Mandatory Admissions Checklists</h3>
              <div className="space-y-3.5">
                {["Academic Transcripts & Degree Certificates", "Statement of Purpose (SOP)", "3 Letters of Recommendation (LOR)", "Updated Curriculum Vitae (CV) or Resume"].map((item, i) => (
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
                {["SEVIS I-901 Fee Receipt", "Form I-20 from U.S. University", "Bank statements showing 1st year fee coverage", "Affidavit of support from sponsors"].map((item, i) => (
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
          
          {/* Top Scholarships list */}
          <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Top Indian Scholarships</h3>
            <div className="space-y-4">
              {[
                { name: "Fulbright-Nehru Fellowship", award: "Full tuition + stipend + travel", deadline: "Sep-Oct 2026" },
                { name: "Inlaks Scholarships", award: "Up to USD 100,000 allowance", deadline: "Mar 31, 2026" },
                { name: "Narotam Sekhsaria Scholarship", award: "Interest-free loan up to ₹20L", deadline: "Mar 2026" }
              ].map((s, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 hover:border-indigo-400 transition-colors">
                  <p className="font-black text-slate-800 text-sm">{s.name}</p>
                  <p className="text-xs text-indigo-650 font-bold">{s.award}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Deadline: {s.deadline}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education Loans */}
          <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Education Loan Providers</h3>
            <div className="space-y-4">
              {[
                { bank: "ICICI Bank (International Stud)", limit: "Up to ₹2 Crore", rate: "Flexible tenure" },
                { bank: "SBI Student Loan", limit: "Up to ₹1.5 Crore", rate: "Collateral required" },
                { bank: "Prodigy Finance (No Cosigner)", limit: "Up to $200,000", rate: "Collateral-free, USD based" }
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
            <p className="text-slate-500 text-sm font-bold">U.S. MS degrees deliver top-tier return on investments, especially with STEM OPT work programs.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                    <th className="pb-3 pr-4">Job Title</th>
                    <th className="pb-3 pr-4 text-right">Average Salary (USD / yr)</th>
                    <th className="pb-3 pr-4">Top Recruiters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  {[
                    { title: "Data Scientist", sal: 129331, rec: "Google, Meta, Amazon, Deloitte" },
                    { title: "Software Engineer", sal: 128200, rec: "Apple, Microsoft, Oracle, Intel" },
                    { title: "Product Manager", sal: 125963, rec: "Salesforce, Adobe, Uber, Google" },
                    { title: "Electrical Engineer", sal: 106795, rec: "Tesla, GE, Lockheed Martin, Siemens" }
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

        {/* 8. INTERACTIVE USA UNIVERSITY FINDER */}
        <div className="mb-10" id="university-finder">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Interactive USA University Finder</h2>
            <p className="text-slate-500 text-sm font-bold">Search and filter accredited universities across the top U.S. hubs in real time.</p>
          </div>

          {/* Search, City Switcher and Filter controls */}
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] mb-8 flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course (e.g. CS, MBA), name, or city..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* City Selector */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {['All', 'Chicago', 'Boston', 'Philadelphia', 'Los Angeles', 'Atlanta'].map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${selectedCity === c ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'}`}
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
                <option value="30000">Max $30,000 / year</option>
                <option value="50000">Max $50,000 / year</option>
              </select>
            </div>

          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredUniversities.map((uni) => (
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
                        <UniLogo logo={uni.logo} name={uni.name} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-tight hover:text-indigo-600 transition-colors">{uni.name}</h4>
                        <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                          <MapPin size={10} />
                          {uni.city}, USA
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">QS Rank</p>
                        <p className="text-xs font-black text-slate-800 mt-0.5">{uni.rank}</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tuition Fees</p>
                        <p className="text-xs font-black text-indigo-650 mt-0.5">{formatCost(uni.tuition)}/yr</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 font-semibold mb-4 leading-normal bg-white p-2.5 rounded-xl border border-dashed border-slate-200">
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
              ))}
            </AnimatePresence>

            {filteredUniversities.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-semibold text-sm">
                No universities match the current search or filters.
              </div>
            )}
          </div>
        </div>


      {/* CTA Section */}
      <StudyAbroadCTA country="the USA" />

      </div>
    </div>
  );
};

export default USAOverview;
