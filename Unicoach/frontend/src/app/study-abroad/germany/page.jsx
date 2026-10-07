import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, MapPin, Award, Building, Globe, ExternalLink, 
  BookOpen, Calendar, HelpCircle, CheckCircle2, ArrowRight, 
  Search, Filter, Info, Plane, Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../components/StudyAbroadCTA';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../utils/universitySearchMatcher';
import germanyImg from '../../../assets/destinations/germany.jpg';

// ─────────────────────────────────────────────
// Germany University Database (for Finder)
// ─────────────────────────────────────────────
const masterUniversities = [
  { id: 'ger-1', name: "Technical University of Munich (TUM)", city: "Munich", rank: "22 QS", tuition: 0, type: "PUBLIC", website: "https://www.tum.de", eligibility: "GPA 3.5+, IELTS 6.5+, APS required", logo: "https://logo.clearbit.com/tum.de", courses: ["Computer Science", "Informatics", "Data Engineering", "Mechanical Engineering", "Electrical Engineering", "Robotics", "Automotive Engineering"] },
  { id: 'ger-2', name: "LMU Munich", city: "Munich", rank: "58 QS", tuition: 0, type: "PUBLIC", website: "https://www.lmu.de", eligibility: "GPA 3.3+, IELTS 6.5+, APS required", logo: "https://logo.clearbit.com/lmu.de", courses: ["Computer Science", "Data Science", "Business Administration", "Economics", "Medicine", "Physics", "Psychology"] },
  { id: 'ger-3', name: "Heidelberg University", city: "Heidelberg", rank: "80 QS", tuition: 3000, type: "PUBLIC", website: "https://www.uni-heidelberg.de", eligibility: "GPA 3.3+, IELTS 6.5+ or German B2, APS required", logo: "https://logo.clearbit.com/uni-heidelberg.de", courses: ["Medicine", "Computer Science", "Scientific Computing", "Translational Medical Research", "Law", "Biosciences"] },
  { id: 'ger-4', name: "RWTH Aachen University", city: "Aachen", rank: "105 QS", tuition: 0, type: "PUBLIC", website: "https://www.rwth-aachen.de", eligibility: "GPA 3.2+, IELTS 6.5+, APS required", logo: "https://logo.clearbit.com/rwth-aachen.de", courses: ["Mechanical Engineering", "Automotive Engineering", "Computer Science", "Software Systems Engineering", "Electrical Engineering", "Production Engineering"] },
  { id: 'ger-5', name: "Technical University of Berlin (TU Berlin)", city: "Berlin", rank: "145 QS", tuition: 0, type: "PUBLIC", website: "https://www.tu.berlin", eligibility: "GPA 3.0+, IELTS 6.5+, APS required", logo: "https://logo.clearbit.com/tu.berlin", courses: ["Computer Science", "Information Systems Management", "Industrial Engineering", "Architecture", "Data Engineering"] },
  { id: 'ger-6', name: "University of Hamburg", city: "Hamburg", rank: "193 QS", tuition: 0, type: "PUBLIC", website: "https://www.uni-hamburg.de", eligibility: "GPA 3.0+, IELTS 6.5+, APS required", logo: "https://logo.clearbit.com/uni-hamburg.de", courses: ["Computer Science", "Intelligent Adaptive Systems", "Business Administration", "Economics", "Physics"] },
  { id: 'ger-7', name: "University of Freiburg", city: "Freiburg", rank: "201 QS", tuition: 3000, type: "PUBLIC", website: "https://www.uni-freiburg.de", eligibility: "GPA 3.2+, IELTS 6.5+, APS required", logo: "https://logo.clearbit.com/uni-freiburg.de", courses: ["Computer Science", "Embedded Systems", "Renewable Energy Engineering", "Medicine", "Biological Sciences"] },
  { id: 'ger-8', name: "University of Bonn", city: "Bonn", rank: "207 QS", tuition: 0, type: "PUBLIC", website: "https://www.uni-bonn.de", eligibility: "GPA 3.0+, IELTS 6.5+, APS required", logo: "https://logo.clearbit.com/uni-bonn.de", courses: ["Computer Science", "Economics", "Mathematics", "Immunobiology", "Agricultural Sciences"] },
  { id: 'ger-9', name: "Karlsruhe Institute of Technology (KIT)", city: "Karlsruhe", rank: "135 QS", tuition: 3000, type: "PUBLIC", website: "https://www.kit.edu", eligibility: "GPA 3.2+, IELTS 6.5+, APS required", logo: "https://logo.clearbit.com/kit.edu", courses: ["Computer Science", "Informatics", "Mechanical Engineering", "Electrical Engineering", "Energy Technologies"] },
  { id: 'ger-10', name: "Hochschule Munich (FH)", city: "Munich", rank: "Applied Sciences", tuition: 0, type: "PUBLIC", website: "https://www.hm.edu", eligibility: "GPA 2.8+, IELTS 6.0+, APS required", logo: "https://logo.clearbit.com/hm.edu", courses: ["Applied Computer Science", "Business Administration", "Automotive Informatics", "Engineering Management"] },
  { id: 'ger-11', name: "HAW Hamburg (FH)", city: "Hamburg", rank: "Applied Sciences", tuition: 0, type: "PUBLIC", website: "https://www.haw-hamburg.de", eligibility: "GPA 2.8+, IELTS 6.0+, APS required", logo: "https://logo.clearbit.com/haw-hamburg.de", courses: ["Information Engineering", "Renewable Energy Systems", "Health Sciences", "Automotive Systems"] }
];

const GermanyOverview = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [financeTab, setFinanceTab] = useState('tuition'); // 'tuition' | 'living' | 'prearrival'
  const [rankingTab, setRankingTab] = useState('qs'); // 'qs' | 'specialization' | 'aps'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedFeeLimit, setSelectedFeeLimit] = useState('All'); // 'All' | '0' | '3000'

  const exchangeRate = 110.14; // 1 EUR ≈ 110.14 INR (As of June 2026 reference)

  // Currency Converter helper
  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = valInEUR * exchangeRate;
    if (valInINR === 0) return 'Free (₹ 0)';
    if (valInINR >= 10000000) {
      return `₹ ${(valInINR / 10000000).toFixed(2)} Cr`;
    }
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  // Filter Universities logic
  const filteredUniversities = masterUniversities.filter(uni => {
    if (selectedCity !== 'All' && uni.city !== selectedCity) return false;
    if (selectedFeeLimit !== 'All') {
      if (selectedFeeLimit === '0' && uni.tuition > 0) return false;
      if (selectedFeeLimit === '3000' && uni.tuition > 3000) return false;
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
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Study in Germany</span>
        </div>

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
              <span>Germany Study Guide 2026/27</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Study in Germany for{' '}
              <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Zero Tuition</span>
            </h1>
            <p className="text-slate-660 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mb-8">
              Germany offers world-renowned public university education with no tuition fees, high post-grad employability, and a clear 18-month job seeker visa route.
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
                src={germanyImg} 
                alt="Brandenburg Gate, Berlin, Germany" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Brandenburg Gate, Berlin</p>
                <h3 className="text-xl font-black mt-1">Tuition-Free Global Future</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { val: "59,419+", label: "Indian Students" },
            { val: "1,930+", label: "English Masters Courses" },
            { val: "18 Months", label: "Post-Study Visa" },
            { val: "€0", label: "Public Tuition Fee" }
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

        {/* 2. FINANCIALS OVERVIEW (TABBED LAYOUT) */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Cost of Studying in Germany</h2>
            <p className="text-slate-500 text-sm font-bold">Understand tuition structure, blocked account reserves, and up-front costs.</p>
          </div>

          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
            {[
              { id: 'tuition', label: 'Tuition Structures' },
              { id: 'living', label: 'Blocked Account & Living' },
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
                  { tier: "Public Universities", desc: "Almost all public universities charge €0 tuition fees. A nominal semester contribution (€150–€350) covers admin and public transit.", cost: 0 },
                  { tier: "State of Baden-Württemberg", desc: "Public universities in this state (e.g. Freiburg, KIT, Heidelberg) charge tuition fees of €1,500/semester for non-EU students.", cost: 3000 },
                  { tier: "Private Universities", desc: "Private institutions set their own rates, typically varying widely depending on reputation and program type.", cost: 12000 }
                ].map((tier, i) => (
                  <div key={i} className="bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-800">{tier.tier}</span>
                      <p className="text-slate-500 text-sm font-semibold mt-2.5 mb-6">{tier.desc}</p>
                    </div>
                    <div className="border-t border-slate-100 pt-5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Annual Tuition</p>
                      <p className="text-2xl font-black text-indigo-650 mt-1">
                        {tier.cost === 0 ? "Free" : formatCost(tier.cost)}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {financeTab === 'living' && (
              <motion.div 
                key="living" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white/50 border border-white rounded-[28px] p-6 backdrop-blur-xl shadow-sm overflow-hidden"
              >
                <div className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Blocked Account (Sperrkonto) & Monthly Expenses</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                        <th className="pb-3 pr-4">Expense Type</th>
                        <th className="pb-3 pr-4">Details</th>
                        <th className="pb-3 pr-4 text-right">Value (EUR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {[
                        { item: "Mandatory Blocked Account (Annual)", desc: "Required for student visa; deposited before interview. Yields €992/month.", val: 11904 },
                        { item: "Accommodation (Monthly)", desc: "Shared student flat (WG) or student dormitories. Munich/Berlin are costlier.", val: 450 },
                        { item: "Public Transit Ticket", desc: "Usually included in semester contribution via Semesterticket.", val: 30 },
                        { item: "Health Insurance (Monthly)", desc: "Statutory public health insurance (TK, AOK) mandatory under 30.", val: 120 },
                        { item: "Food & Utilities (Monthly)", desc: "Groceries, internet, mobile bills, personal leisure.", val: 250 }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 text-indigo-650 font-black">{row.item}</td>
                          <td className="py-3.5 text-slate-550 font-semibold">{row.desc}</td>
                          <td className="py-3.5 text-right font-black text-slate-900">{formatCost(row.val)}</td>
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
                className="bg-white/50 border border-white rounded-[28px] p-6 backdrop-blur-xl shadow-sm overflow-hidden"
              >
                <div className="mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Upfront Pre-departure Fees</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                        <th className="pb-3 pr-4">Expense Type</th>
                        <th className="pb-3 pr-4 text-right">Estimated Cost (EUR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {[
                        { type: "APS Certificate (Mandatory credential check)", eur: 180 },
                        { type: "Uni-Assist Fee (First application)", eur: 75 },
                        { type: "Uni-Assist Fee (Per subsequent application)", eur: 30 },
                        { type: "National Student Visa Fee (Type D)", eur: 75 },
                        { type: "Flight Tickets (One-way)", eur: 500 },
                        { type: "IELTS / TOEFL Exam registration", eur: 190 }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 text-slate-800 font-bold">{row.type}</td>
                          <td className="py-3.5 text-right font-black text-indigo-650">{formatCost(row.eur)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. APS WARNING BANNER */}
        <div className="mb-20 bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white rounded-[32px] p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-20%] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl font-black mb-3">Mandatory APS Certificate Required</h2>
          <p className="text-white/80 text-sm font-semibold max-w-2xl mb-8">
            Since November 2022, all Indian applicants must obtain an Academic Evaluation Center (APS) certificate before submitting university or visa applications. Make sure to apply at least 3 months in advance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Standard Fee", detail: "Rs. 19,825 (~€180)", note: "Non-refundable, paid online" },
              { title: "Processing Time", detail: "4 to 12 Weeks", note: "Submit provisional degree early" },
              { title: "Validity", detail: "Indefinite Duration", note: "Does not expire once issued" }
            ].map((p, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <span className="text-[10px] text-indigo-200 font-black uppercase tracking-wider">{p.title}</span>
                <p className="text-lg font-black mt-1.5 mb-2">{p.detail}</p>
                <div className="text-xs text-white/90 font-medium">{p.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. RANKINGS AND SPECIALIZATIONS */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Top Universities & Pathways</h2>
            <p className="text-slate-500 text-sm font-bold">Compare prestigious German universities and understand academic routes.</p>
          </div>

          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
            {[
              { id: 'qs', label: 'QS Global Rankings 2026' },
              { id: 'specialization', label: 'Best Fields of Study' },
              { id: 'pathways', label: 'Universität vs Fachhochschule' }
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
                className="bg-white/50 border border-white rounded-[28px] p-6 backdrop-blur-xl shadow-sm overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                        <th className="pb-3 pr-4">QS Rank</th>
                        <th className="pb-3 pr-4">University Name</th>
                        <th className="pb-3 pr-4">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {[
                        { rank: "22", name: "Technical University of Munich (TUM)", loc: "Munich" },
                        { rank: "58", name: "LMU Munich", loc: "Munich" },
                        { rank: "80", name: "Heidelberg University", loc: "Heidelberg" },
                        { rank: "105", name: "RWTH Aachen University", loc: "Aachen" },
                        { rank: "135", name: "Karlsruhe Institute of Technology (KIT)", loc: "Karlsruhe" },
                        { rank: "145", name: "Technical University of Berlin", loc: "Berlin" }
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
                  { field: "Engineering & Auto", unis: ["1. TU Munich", "2. RWTH Aachen", "3. Karlsruhe Institute of Tech"] },
                  { field: "Computer Science & IT", unis: ["1. TU Munich", "2. LMU Munich", "3. TU Berlin"] },
                  { field: "Natural Sciences", unis: ["1. Heidelberg University", "2. LMU Munich", "3. University of Bonn"] }
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

            {rankingTab === 'pathways' && (
              <motion.div 
                key="pathways" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white/50 border border-white rounded-[28px] p-6 backdrop-blur-xl shadow-sm overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <h4 className="font-black text-indigo-650 text-base mb-2">Research Universities (Universität)</h4>
                    <p className="text-slate-600 font-semibold leading-relaxed">
                      Deeply academic and theoretical. Ideal if you are targeting research, R&D corporate roles, or a PhD path. Most STEM master's programs here start exclusively in the **Winter intake** for international students.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <h4 className="font-black text-indigo-650 text-base mb-2">Applied Sciences (Fachhochschule / FH)</h4>
                    <p className="text-slate-600 font-semibold leading-relaxed">
                      Industry-integrated, practice-oriented, and strongly linked with German companies. Often more flexible with CGPA thresholds and more likely to offer **Summer semester** admissions.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. STEP-BY-STEP APPLICATION WORKFLOW */}
        <div className="mb-20">
          <div className="text-left mb-12 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Step-by-Step Admissions Pipeline</h2>
            <p className="text-slate-500 text-sm font-bold">A practical timeline structured around standard Germany application deadlines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {[
              { num: "01", t: "APS Certificate", d: "Apply for APS verification using transcripts." },
              { num: "02", t: "Shortlisting", d: "Find programs on DAAD Database." },
              { num: "03", t: "Language", d: "Clear IELTS (6.5+) or German level (A1-B2)." },
              { num: "04", t: "Uni-Assist / Direct", d: "Submit applications by May (Winter) or Nov (Summer)." },
              { num: "05", t: "Blocked A/C", d: "Deposit €11,904 to receive Sperrbestätigung." },
              { num: "06", t: "Visa VFS", d: "Schedule and attend VFS National Visa interview." }
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
                {["Academic Transcripts (School & Bachelor's)", "Mandatory APS Certificate", "Proof of English Instruction (MOI) or IELTS Score", "SOP (Program-specific modules & focus)", "Updated Europass Format CV"].map((item, i) => (
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
                {["University Admission Offer or VPD letter", "Blocked Account Confirmation (Sperrbestätigung)", "Travel Health Insurance valid in Germany", "Completed VFS Visa Application Form", "Valid Passport with blank pages"].map((item, i) => (
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
            <h3 className="text-2xl font-black text-slate-900 mb-6">Top German Scholarships</h3>
            <div className="space-y-4">
              {[
                { name: "DAAD Study Scholarships", award: "Full funding (€934/mo + health coverage + travel)", deadline: "October - November (Pre-intake)" },
                { name: "Deutschlandstipendium", award: "€300/month merit scholarship", deadline: "University-specific" },
                { name: "Heinrich Böll Foundation Scholarships", award: "Monthly stipends + tuition support (mainly winter)", deadline: "March & September annually" }
              ].map((s, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 hover:border-indigo-400 transition-colors">
                  <p className="font-black text-slate-800 text-sm">{s.name}</p>
                  <p className="text-xs text-indigo-650 font-bold">{s.award}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Timeline: {s.deadline}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Blocked Account Providers</h3>
            <div className="space-y-4">
              {[
                { name: "Expatrio (Blocked Account + Insurance)", limit: "Approved partner; swift digital setup", rate: "Free travel insurance inclusion option" },
                { name: "Fintiba Plus", limit: "German-regulated bank; easy tracking app", rate: "Highly popular among Indian students" },
                { name: "Coracle", limit: "Fast approval; no monthly account fees", rate: "Combines public health insurance" }
              ].map((b, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 hover:border-indigo-400 transition-colors">
                  <p className="font-black text-slate-800 text-sm">{b.name}</p>
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
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Careers & Return on Investment</h2>
            <p className="text-slate-500 text-sm font-bold">German degrees offer outstanding ROI given the zero tuition fee structure.</p>
          </div>

          <div className="bg-white/50 border border-white rounded-[28px] p-6 backdrop-blur-xl shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold">
                    <th className="pb-3 pr-4">Job Sector</th>
                    <th className="pb-3 pr-4 text-right">Average Entry Salary (EUR / yr)</th>
                    <th className="pb-3 pr-4">Key Industrial Hubs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  {[
                    { title: "Automotive & Aerospace Engineering", sal: 58000, rec: "Munich, Stuttgart, Ingolstadt, Wolfsburg" },
                    { title: "Software Development & IT", sal: 62000, rec: "Berlin, Munich, Hamburg, Frankfurt" },
                    { title: "Chemical & Biological Sciences", sal: 54000, rec: "Leverkusen, Ludwigshafen, Frankfurt" },
                    { title: "Finance, Consulting & Management", sal: 60000, rec: "Frankfurt, Munich, Düsseldorf" }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 text-slate-800 font-black">{row.title}</td>
                      <td className="py-3.5 text-right text-indigo-650 font-black pr-10">{formatCost(row.sal)}</td>
                      <td className="py-3.5 text-slate-550 font-semibold">{row.rec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 8. INTERACTIVE GERMANY UNIVERSITY FINDER */}
        <div className="mb-10" id="university-finder">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Germany Public University Finder</h2>
            <p className="text-slate-500 text-sm font-bold">Filter top public research and applied science universities across Germany.</p>
          </div>

          <div className="bg-white/50 border border-white rounded-[28px] p-6 backdrop-blur-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
            
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
              {['All', 'Munich', 'Berlin', 'Aachen', 'Hamburg', 'Heidelberg', 'Freiburg', 'Bonn', 'Karlsruhe'].map(c => (
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
                <option value="All">All Tuition Fees</option>
                <option value="0">Strictly Free (€0)</option>
                <option value="3000">Max €3,000 / year</option>
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
                  className="bg-white/60 border border-white rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                        <img src={uni.logo} alt={uni.name} className="w-9 h-9 object-contain" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-tight hover:text-indigo-650 transition-colors">{uni.name}</h4>
                        <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                          <MapPin size={10} />
                          {uni.city}, Germany
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">QS Global Rank</p>
                        <p className="text-xs font-black text-slate-800 mt-0.5">{uni.rank}</p>
                      </div>
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tuition Fees</p>
                        <p className="text-xs font-black text-indigo-650 mt-0.5">{uni.tuition === 0 ? "Free" : formatCost(uni.tuition)}</p>
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

                    <p className="text-xs text-slate-550 font-semibold mb-4 leading-normal bg-slate-50/20 p-2.5 rounded-xl border border-slate-100/20">
                      <strong>Eligibility:</strong> {uni.eligibility}
                    </p>
                  </div>

                  <div className="flex gap-2 border-t border-slate-100 pt-4 mt-2">
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-xs font-bold"
                    >
                      Visit School
                    </a>
                    <Link
                      to={`/contact?university=${encodeURIComponent(uni.name)}`}
                      className="flex-1 text-center py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold"
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
      <StudyAbroadCTA country="Germany" />

      </div>
    </div>
  );
};

export default GermanyOverview;
