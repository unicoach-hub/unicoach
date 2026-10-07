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
import ukImg from '../../../assets/destinations/uk.jpg';
import PageBackBreadcrumb from '../../../components/common/PageBackBreadcrumb';

// ─────────────────────────────────────────────
// UK University Database (for Finder)
// ─────────────────────────────────────────────
const masterUniversities = [
  // London
  { id: 'lon-1', name: "Imperial College London", city: "London", rank: "2 QS", tuition: 49, type: "PUBLIC", website: "https://www.imperial.ac.uk", eligibility: "GPA 3.7+, IELTS 7.5+, GRE recommended", logo: "https://logo.clearbit.com/imperial.ac.uk", courses: ["Computer Science", "Engineering Science", "Data Science", "Medicine", "Business Administration", "Artificial Intelligence"] },
  { id: 'lon-2', name: "University College London (UCL)", city: "London", rank: "9 QS", tuition: 48, type: "PUBLIC", website: "https://www.ucl.ac.uk", eligibility: "GPA 3.6+, IELTS 7.5+", logo: "https://logo.clearbit.com/ucl.ac.uk", courses: ["Computer Science", "Data Science", "Architecture", "Law", "Medicine", "Psychology", "Economics"] },
  { id: 'lon-3', name: "King's College London (KCL)", city: "London", rank: "40 QS", tuition: 43, type: "PUBLIC", website: "https://www.kcl.ac.uk", eligibility: "GPA 3.5+, IELTS 7.0+", logo: "https://logo.clearbit.com/kcl.ac.uk", courses: ["Law", "Medicine", "Nursing", "Computer Science", "International Relations", "Business Administration"] },
  { id: 'lon-4', name: "London Business School", city: "London", rank: "4 QS", tuition: 143, type: "PUBLIC", website: "https://www.london.edu", eligibility: "GMAT 700+, IELTS 7.5+, 3+ yrs exp", logo: "https://logo.clearbit.com/london.edu", courses: ["Business Administration", "Finance", "Management", "Business Analytics", "Marketing"] },
  
  // Oxford / Cambridge
  { id: 'ox-1', name: "University of Oxford", city: "Oxford", rank: "3 QS", tuition: 35, type: "PUBLIC", website: "https://www.ox.ac.uk", eligibility: "GPA 3.8+, IELTS 7.5+, GRE recommended", logo: "https://logo.clearbit.com/ox.ac.uk", courses: ["Computer Science", "Law", "Philosophy", "Medicine", "Business Administration", "Mathematics", "Physics"] },
  { id: 'cam-1', name: "University of Cambridge", city: "Cambridge", rank: "2 QS", tuition: 29, type: "PUBLIC", website: "https://www.cam.ac.uk", eligibility: "GPA 3.8+, IELTS 7.5+, GRE/GMAT waiver", logo: "https://logo.clearbit.com/cam.ac.uk", courses: ["Computer Science", "Engineering Science", "Natural Sciences", "Mathematics", "Law", "Medicine"] },
  
  // Glasgow
  { id: 'gla-1', name: "University of Glasgow", city: "Glasgow", rank: "76 QS", tuition: 32, type: "PUBLIC", website: "https://www.gla.ac.uk", eligibility: "GPA 3.0+, IELTS 6.5+", logo: "https://logo.clearbit.com/gla.ac.uk", courses: ["Computer Science", "Medicine", "Engineering Science", "Business Administration", "Law"] },
  
  // Leeds
  { id: 'lee-1', name: "University of Leeds", city: "Leeds", rank: "75 QS", tuition: 29, type: "PUBLIC", website: "https://www.leeds.ac.uk", eligibility: "GPA 3.0+, IELTS 6.5+", logo: "https://logo.clearbit.com/leeds.ac.uk", courses: ["Business Administration", "Engineering Science", "Computer Science", "Communication", "Law"] },
  
  // Birmingham
  { id: 'bir-1', name: "University of Birmingham", city: "Birmingham", rank: "84 QS", tuition: 9, type: "PUBLIC", website: "https://www.bham.ac.uk", eligibility: "GPA 3.0+, IELTS 6.5+", logo: "https://logo.clearbit.com/bham.ac.uk", courses: ["Engineering Science", "Computer Science", "Business Administration", "Medicine", "Psychology"] },
  
  // Edinburgh
  { id: 'edi-1', name: "University of Edinburgh", city: "Edinburgh", rank: "22 QS", tuition: 42, type: "PUBLIC", website: "https://www.ed.ac.uk", eligibility: "GPA 3.3+, IELTS 7.0+", logo: "https://logo.clearbit.com/ed.ac.uk", courses: ["Artificial Intelligence", "Computer Science", "Medicine", "Data Science", "Law", "Business Administration"] },
  
  // Coventry
  { id: 'cov-1', name: "Coventry University", city: "Coventry", rank: "571 QS", tuition: 18, type: "PUBLIC", website: "https://www.coventry.ac.uk", eligibility: "GPA 2.5+, IELTS 6.0+", logo: "https://logo.clearbit.com/coventry.ac.uk", courses: ["Automotive Engineering", "Computer Science", "Business Administration", "Design", "Cyber Security"] },

  // Manchester
  { id: 'man-1', name: "University of Manchester", city: "Manchester", rank: "32 QS", tuition: 24, type: "PUBLIC", website: "https://www.manchester.ac.uk", eligibility: "GPA 3.2+, IELTS 6.5+", logo: "https://logo.clearbit.com/manchester.ac.uk", courses: ["Computer Science", "Engineering Science", "Business Administration", "Economics", "Data Science"] },

  // Bristol
  { id: 'bri-1', name: "University of Bristol", city: "Bristol", rank: "55 QS", tuition: 33, type: "PUBLIC", website: "https://www.bristol.ac.uk", eligibility: "GPA 3.3+, IELTS 6.5+", logo: "https://logo.clearbit.com/bristol.ac.uk", courses: ["Computer Science", "Engineering Science", "Law", "Economics", "Aerospace Engineering"] },

  // Warwick
  { id: 'war-1', name: "University of Warwick", city: "Coventry", rank: "67 QS", tuition: 31, type: "PUBLIC", website: "https://warwick.ac.uk", eligibility: "GPA 3.4+, IELTS 7.0+", logo: "https://logo.clearbit.com/warwick.ac.uk" },

  // Durham
  { id: 'dur-1', name: "Durham University", city: "Durham", rank: "78 QS", tuition: 28, type: "PUBLIC", website: "https://www.durham.ac.uk", eligibility: "GPA 3.2+, IELTS 6.5+", logo: "https://logo.clearbit.com/durham.ac.uk" },

  // Southampton
  { id: 'sot-1', name: "University of Southampton", city: "Southampton", rank: "81 QS", tuition: 26, type: "PUBLIC", website: "https://www.southampton.ac.uk", eligibility: "GPA 3.0+, IELTS 6.5+", logo: "https://logo.clearbit.com/southampton.ac.uk" }
];

const UKOverview = () => {
  const [currency, setCurrency] = useState('INR'); // 'GBP' | 'INR'
  const [financeTab, setFinanceTab] = useState('tuition'); // 'tuition' | 'living' | 'prearrival'
  const [rankingTab, setRankingTab] = useState('qs'); // 'qs' | 'specialization' | 'one-year'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedFeeLimit, setSelectedFeeLimit] = useState('All'); // 'All' | '20' | '40'

  const exchangeRate = 105.50; // 1 GBP ≈ 105.50 INR

  // Currency Converter helper (tuition parameter is in INR Lakhs)
  const formatCost = (valInINRLakh) => {
    if (currency === 'INR') {
      return `₹ ${valInINRLakh.toFixed(2)} Lakh`;
    }
    const valInGBP = (valInINRLakh * 100000) / exchangeRate;
    if (valInGBP >= 100000) {
      return `£${(valInGBP / 1000).toFixed(0)}k`;
    }
    return `£${Math.round(valInGBP).toLocaleString()}`;
  };

  // Convert pure GBP value to selected currency
  const formatGBPValue = (valInGBP) => {
    if (currency === 'GBP') {
      return `£${valInGBP.toLocaleString()}`;
    }
    const valInINR = valInGBP * exchangeRate;
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  // Filter Universities logic
  const filteredUniversities = masterUniversities.filter(uni => {
    if (selectedCity !== 'All' && uni.city !== selectedCity) return false;
    if (selectedFeeLimit !== 'All') {
      if (selectedFeeLimit === '20' && uni.tuition > 20) return false;
      if (selectedFeeLimit === '40' && uni.tuition > 40) return false;
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
        <PageBackBreadcrumb items={[{ label: 'Study in UK' }]} />

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
              List of Top Universities & Colleges in UK for{' '}
              <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Masters</span>
            </h1>
            <p className="text-slate-660 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mb-8">
              A United Kingdom Master's degree represents academic prestige and global reach. Secure a 2-year post-study work permit under the Graduate Route visa program.
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
                src={ukImg} 
                alt="Big Ben and Palace of Westminster, London" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Big Ben, London</p>
                <h3 className="text-xl font-black mt-1">Centuries of Academic Excellence</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { val: "150,000+", label: "Indian Students" },
            { val: "30+", label: "Top 200 QS Universities" },
            { val: "2 Years", label: "Post-Study Work Visa" },
            { val: "1 - 2 Yrs", label: "Average ROI Period" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-md text-left">
              <p className="text-2xl font-black text-indigo-655">{stat.val}</p>
              <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Global Currency Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-md inline-flex items-center gap-1">
            <button 
              onClick={() => setCurrency('GBP')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'GBP' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-50'}`}
            >
              GBP (£)
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
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Total Cost of MS in UK</h2>
            <p className="text-slate-500 text-sm font-bold">Plan your finances by understanding tuition tiers, living expenses, and pre-departure costs.</p>
          </div>

          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
            {[
              { id: 'tuition', label: 'Tuition Fees Tiers' },
              { id: 'living', label: 'Living Costs by City' },
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
                  { tier: "Tier 1 (Elite)", desc: "Top-ranked global schools like Oxford, Cambridge, Imperial, LBS.", limits: [29, 143] },
                  { tier: "Tier 2 (Mid)", desc: "Highly reputable research institutions.", limits: [24, 42] },
                  { tier: "Tier 3 (Budget)", desc: "Cost-effective colleges offering quality education.", limits: [9, 23] }
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
                        <th className="pb-3 pr-4">Location</th>
                        <th className="pb-3 pr-4">Estimated Rent & Bills</th>
                        <th className="pb-3 pr-4 text-right">Avg Monthly Living (GBP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {[
                        { s: "London (Inner)", rent: "£900 - £1,200/mo", gbp: 1400 },
                        { s: "London (Outer)", rent: "£700 - £900/mo", gbp: 1100 },
                        { s: "Glasgow & Edinburgh", rent: "£500 - £700/mo", gbp: 950 },
                        { s: "Leeds & Coventry", rent: "£450 - £600/mo", gbp: 800 },
                        { s: "Birmingham & Midlands", rent: "£450 - £650/mo", gbp: 850 }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 text-indigo-650 font-black">{row.s}</td>
                          <td className="py-3.5 text-slate-500 font-semibold">{row.rent}</td>
                          <td className="py-3.5 text-right font-black text-slate-900">{formatGBPValue(row.gbp)}</td>
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
                        <th className="pb-3 pr-4 text-right">Estimated Cost (GBP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {[
                        { type: "Student Visa (Student Route) Fee", gbp: 490 },
                        { type: "NHS Immigration Health Surcharge (IHS/yr)", gbp: 776 },
                        { type: "Flight Tickets (Avg)", gbp: 600 },
                        { type: "TB Medical Clearance Examination", gbp: 100 },
                        { type: "University CAS Deposit", gbp: 2000 }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 text-slate-800 font-bold">{row.type}</td>
                          <td className="py-3.5 text-right font-black text-indigo-650">{formatGBPValue(row.gbp)}</td>
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
          <p className="text-slate-600 text-sm font-semibold max-w-xl mb-8">Some UK public universities offer accredited master's programs at significantly lower rates.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "University of East London", degree: "MSc in Computer Science", fee: 15 },
              { name: "Coventry University", degree: "MSc in Physiotherapy", fee: 18 },
              { name: "University of Birmingham", degree: "MSc in Computer Science", fee: 9 }
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
            <p className="text-slate-500 text-sm font-bold">Compare elite UK universities by global QS rankings or specific specializations.</p>
          </div>

          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
            {[
              { id: 'qs', label: 'QS Top 2026 Rankings' },
              { id: 'specialization', label: 'Best by Specialization' },
              { id: 'one-year', label: 'Fast-track 1-Year MBA/MSc' }
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
                        { rank: "2", name: "Imperial College London", loc: "London" },
                        { rank: "2", name: "University of Cambridge", loc: "Cambridge" },
                        { rank: "3", name: "University of Oxford", loc: "Oxford" },
                        { rank: "9", name: "University College London (UCL)", loc: "London" },
                        { rank: "22", name: "University of Edinburgh", loc: "Edinburgh" },
                        { rank: "40", name: "King's College London (KCL)", loc: "London" }
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
                  { field: "Engineering & Tech", unis: ["1. Cambridge (Cambridge)", "2. Oxford (Oxford)", "3. Imperial College (London)"] },
                  { field: "Clinical & Life Sciences", unis: ["1. Oxford (Oxford)", "2. Cambridge (Cambridge)", "3. UCL (London)"] },
                  { field: "Arts & Humanities", unis: ["1. Royal College of Art (London)", "2. UAL (London)", "3. Oxford (Oxford)"] }
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
                        { u: "London Business School", p: "Sloan Masters in Leadership and Strategy", d: "12 Months" },
                        { u: "University of Oxford", p: "Master of Business Administration (MBA)", d: "12 Months" },
                        { u: "Imperial College London", p: "MSc in Business Analytics / MSc in CS", d: "12 Months" }
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
            <p className="text-slate-500 text-sm font-bold">A comprehensive roadmap from preparation to arriving on campus in the UK.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {[
              { num: "01", t: "Shortlist", d: "Choose 5-8 schools matching profile & budget." },
              { num: "02", t: "Exams", d: "Clear IELTS, TOEFL, or PTE test." },
              { num: "03", t: "Prepare SOP", d: "Draft personal statement, LORs & CV." },
              { num: "04", t: "Get Offer", d: "Submit UCAS/direct apps & secure offer letter." },
              { num: "05", t: "Deposit & CAS", d: "Pay deposit to receive Confirmation of Acceptance for Studies (CAS)." },
              { num: "06", t: "Student Visa", d: "Apply for Student Route visa under UKVI regulations." }
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
                {["Academic Transcripts & Degree Certificates", "Personal Statement / Statement of Purpose (SOP)", "2 Academic Reference Letters (LOR)", "Updated Curriculum Vitae (CV)"].map((item, i) => (
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
                {["CAS Letter from UK University", "TB Clearance Certificate", "Bank statements showing funds for 28 consecutive days", "Tuberculosis Medical Report"].map((item, i) => (
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
            <h3 className="text-2xl font-black text-slate-900 mb-6">Top UK Scholarships</h3>
            <div className="space-y-4">
              {[
                { name: "Chevening Scholarships", award: "Full tuition + stipend + travel costs", deadline: "November 2026" },
                { name: "Commonwealth Scholarships", award: "Full funding for low-middle income countries", deadline: "December 2026" },
                { name: "GREAT Scholarships", award: "Minimum £10,000 tuition fee waiver", deadline: "May-June 2026" }
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
                { bank: "HDFC Credila (UK Study Loans)", limit: "Up to ₹1.5 Crore", rate: "Flexible collateral options" },
                { bank: "SBI Global Ed-Vantage", limit: "Up to ₹1.5 Crore", rate: "Low interest, collateral required" },
                { bank: "Prodigy Finance (UK Masters)", limit: "Up to 100% of cost of attendance", rate: "Collateral-free, GBP based" }
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
            <p className="text-slate-500 text-sm font-bold">UK degrees deliver top-tier return on investments, supported by the Graduate Route visa.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                    <th className="pb-3 pr-4">Job Title</th>
                    <th className="pb-3 pr-4 text-right">Average Salary (GBP / yr)</th>
                    <th className="pb-3 pr-4">Top Recruiters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  {[
                    { title: "Software Engineer", sal: 55000, rec: "DeepMind, Google, ARM, Barclays" },
                    { title: "Data Scientist", sal: 52000, rec: "HSBC, Dyson, Astrazeneca, PwC" },
                    { title: "Finance Analyst / Manager", sal: 60000, rec: "Goldman Sachs, Deloitte, EY, JP Morgan" },
                    { title: "Clinical Physiotherapist", sal: 38000, rec: "NHS Trusts, Bupa, Private Practices" }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 text-slate-800 font-black">{row.title}</td>
                      <td className="py-3.5 text-right text-indigo-650 font-black pr-10">{formatGBPValue(row.sal)}</td>
                      <td className="py-3.5 text-slate-500 font-semibold">{row.rec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 8. INTERACTIVE UK UNIVERSITY FINDER */}
        <div className="mb-10" id="university-finder">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Interactive UK University Finder</h2>
            <p className="text-slate-500 text-sm font-bold">Search and filter accredited universities across the top UK hubs in real time.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] mb-8 flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course (e.g. CS, MBA, Data Science), university, city..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* City Selector */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {['All', 'London', 'Oxford', 'Cambridge', 'Glasgow', 'Leeds', 'Birmingham', 'Edinburgh', 'Coventry', 'Manchester', 'Bristol'].map(c => (
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
                <option value="20">Max ₹20 Lacs / year</option>
                <option value="40">Max ₹40 Lacs / year</option>
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
                          {uni.city}, UK
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
      <StudyAbroadCTA country="the UK" />

      </div>
    </div>
  );
};

export default UKOverview;
