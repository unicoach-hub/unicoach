import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, MapPin, Award, Building, Globe, ExternalLink, 
  BookOpen, Calendar, HelpCircle, CheckCircle2, ArrowRight, 
  Info, Plane, Calculator, GraduationCap, ShieldAlert,
  ChevronDown, ChevronUp, Clock, AlertCircle, FileText, Check, Sparkles, HelpCircle as HelpIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

// ─────────────────────────────────────────────
// DATA SECTION
// ─────────────────────────────────────────────

const topColleges = [
  { name: "Frankfurt School of Finance & Management", qsRank: "#40", feeEur: 42000, gmat: "600+", spec: "Finance, FinTech", intake: "Oct", logo: "https://logo.clearbit.com/frankfurt-school.de" },
  { name: "Mannheim Business School", qsRank: "#46", feeEur: 47000, gmat: "620+", spec: "Strategy, General Mgmt", intake: "Sep", logo: "https://logo.clearbit.com/mannheim-business-school.com" },
  { name: "WHU - Otto Beisheim School of Management", qsRank: "#57", feeEur: 45000, gmat: "600+", spec: "Entrepreneurship, Startups", intake: "Sep", logo: "https://logo.clearbit.com/whu.edu" },
  { name: "ESMT Berlin", qsRank: "#78", feeEur: 50000, gmat: "600+", spec: "Innovation, Tech Mgmt", intake: "Sep", logo: "https://logo.clearbit.com/esmt.org" },
  { name: "TUM School of Management", qsRank: "Public / Top", feeEur: 39000, gmat: "570+", spec: "Engineering, AI Mgmt", intake: "Oct", logo: "https://logo.clearbit.com/tum.de" },
  { name: "ESCP Business School Berlin", qsRank: "Top 30 (FT)", feeEur: 60500, gmat: "600+", spec: "Luxury, Consulting", intake: "Sep", logo: "https://logo.clearbit.com/escp.eu" },
  { name: "EU Business School Munich", qsRank: "#101–110", feeEur: 22800, gmat: "Not Required", spec: "International Marketing", intake: "Sep/Jan", logo: "https://logo.clearbit.com/euruni.edu" },
  { name: "HHL Leipzig Graduate School of Management", qsRank: "#151–200", feeEur: 41600, gmat: "570+", spec: "Supply Chain, Logistics", intake: "Sep", logo: "https://logo.clearbit.com/hhl.de" },
  { name: "University of Cologne", qsRank: "Public / Top", feeEur: 2800, gmat: "Not Required", spec: "Corporate Development", intake: "Oct/Apr", logo: "https://logo.clearbit.com/uni-koeln.de" },
  { name: "ISM International School of Management", qsRank: "Global Tier", feeEur: 27000, gmat: "Not Required", spec: "Business Data Science", intake: "Sep/Mar", logo: "https://logo.clearbit.com/ism.de" }
];

const specialisations = [
  { spec: "Supply Chain & Logistics", employers: "DHL, Lufthansa Cargo, DB Schenker", language: "A2-B1 useful", minSalary: 70000, maxSalary: 90000 },
  { spec: "Finance & FinTech", employers: "Deutsche Bank, Commerzbank, N26", language: "B1 strongly preferred", minSalary: 75000, maxSalary: 120000 },
  { spec: "Engineering Management", employers: "Siemens, Bosch, Volkswagen, SAP", language: "B1 required for senior roles", minSalary: 72000, maxSalary: 110000 },
  { spec: "Business Analytics & Data Science", employers: "SAP, KPMG, McKinsey Germany", language: "English sufficient initially", minSalary: 68000, maxSalary: 100000 },
  { spec: "Healthcare Management", employers: "Fresenius, Siemens Healthineers, Bayer", language: "B1–B2 required", minSalary: 65000, maxSalary: 90000 },
  { spec: "Sustainability & ESG", employers: "RWE, BASF, Siemens Energy", language: "English sufficient initially", minSalary: 65000, maxSalary: 95000 }
];

const faqs = [
  {
    q: "Can I get an MBA in Germany without GMAT/GRE?",
    a: "Yes. Several public universities (like the University of Cologne) and some private business schools (like EU Business School or ISM) waive GMAT requirements, focusing instead on your academic records, interviews, and work experience."
  },
  {
    q: "What is the difference between an MBA and an MIM in Germany?",
    a: "An MBA requires 2–5 years of full-time professional experience and is designed for career switchers or management roles. An MIM (Master's in Management) is designed for fresh graduates (0–2 years of experience) and is significantly cheaper."
  },
  {
    q: "Is German language proficiency mandatory to get hired after an MBA?",
    a: "While you can study in English, language proficiency is key to career success. Roles in Supply Chain, Finance, and Engineering Management often require B1/B2 German. Tech, analytics, and startup roles are more open to English-only speakers initially."
  },
  {
    q: "What happens if my student visa is refused?",
    a: "Don't panic. You can request a written refusal notice which outlines the exact grounds. The most common reasons are insufficient blocked account deposits, missing APS certification, or vague motivation statements in your SOP. Address the gaps and re-apply."
  }
];

const GermanyMBAPage = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [profileScenario, setProfileScenario] = useState('B'); // 'A' | 'B' | 'C'
  const [faqOpen, setFaqOpen] = useState(null);

  const exchangeRate = 109.95; // Fixed exchange rate as of blog reference

  const formatPrice = (valInEur) => {
    if (currency === 'EUR') {
      return `€ ${valInEur.toLocaleString()}`;
    }
    const valInInr = valInEur * exchangeRate;
    if (valInInr >= 10000000) {
      return `₹ ${(valInInr / 10000000).toFixed(2)} Cr`;
    }
    if (valInInr >= 100000) {
      return `₹ ${(valInInr / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${valInInr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const toggleFaq = (index) => {
    if (faqOpen === index) {
      setFaqOpen(null);
    } else {
      setFaqOpen(index);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans select-none">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-100/50 via-indigo-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        
        {/* 1. HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
            <GraduationCap size={14} className="animate-pulse" />
            <span>Germany MBA Guide 2026/27</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            MBA in Germany: Tuition Fees,{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Top Colleges & Salaries</span>
          </h1>
          <p className="text-slate-650 text-lg md:text-xl leading-relaxed font-semibold max-w-3xl mx-auto mb-8">
            Germany is now the fast-growing hub for Indian MBA applicants. Learn about public university options with low fees, placement rates, APS requirements, and stay-back visa options.
          </p>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { val: "€300–1,000", label: "Public MBA Fees / Yr" },
              { val: "B1 German", label: "Fast-Track PR in 21 Mo" },
              { val: "18 Months", label: "Post-Study Job Search" },
              { val: "85%+", label: "Visa Approval Rate" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-md">
                <p className="text-xl md:text-2xl font-black text-indigo-600">{stat.val}</p>
                <p className="text-[10px] md:text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Global Currency Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-md inline-flex items-center gap-1">
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 2. COST COMPARISON DASHBOARD */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">The Financial Equation</h2>
            <p className="text-slate-500 text-sm font-bold">Why Germany has become the top-choice destination for Indian MBA students planning on tight budgets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { country: "USA (Top Schools)", cost: "Rs. 1.30 - 1.80 Crore", desc: "Highest overall tuition & living costs, complex H-1B visa lotteries.", level: "High Cost" },
              { country: "UK (Top Schools)", cost: "Rs. 55 - 90 Lakhs", desc: "Short stay-back rules, high tuition fees and living costs.", level: "Moderate-High" },
              { country: "Germany (Private Schools)", cost: "Rs. 25 - 55 Lakhs", desc: "Reputable business schools, solid corporate networks, lower tuition.", level: "Moderate" },
              { country: "Germany (Public Unis)", cost: "Rs. 33K - 1.1L / year", desc: "Semester admin fees only. Highly competitive entrance criteria.", level: "Minimal Cost" }
            ].map((card, i) => (
              <div key={i} className="bg-white/60 border border-white rounded-[32px] p-6 shadow-sm backdrop-blur-xl flex flex-col justify-between">
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${card.level.includes('Minimal') ? 'bg-green-50 text-green-700' : card.level.includes('High') ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                    {card.level}
                  </span>
                  <h3 className="text-base font-black text-slate-800 mt-3 mb-1">{card.country}</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">{card.desc}</p>
                </div>
                <div className="border-t border-slate-100 pt-4 mt-6">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Program Cost</div>
                  <div className="text-sm font-black text-indigo-650 mt-1">{card.cost}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. DYNAMIC PROFILE PATHWAY SELECTOR */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Which MBA Pathway Fits Your Profile?</h2>
            <p className="text-slate-500 text-sm font-bold">Pick your scenario to view custom timelines and recommended course entries.</p>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-100/60 p-1.5 rounded-2xl mb-8 max-w-2xl">
            {[
              { id: 'A', label: "Fresh Graduate (0-2 Yrs Exp)" },
              { id: 'B', label: "Professional (3-6 Yrs Exp)" },
              { id: 'C', label: "Senior Manager (7+ Yrs Exp)" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setProfileScenario(tab.id)}
                className={`py-3 px-4 text-xs font-black rounded-xl transition-all cursor-pointer ${profileScenario === tab.id ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={profileScenario}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl"
            >
              {profileScenario === 'A' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800">Scenario A: BTech / BCom Graduate with 0–2 Years Experience</h3>
                  <p className="text-slate-650 text-sm font-medium leading-relaxed">
                    Most standard full-time MBA programs in Germany (Mannheim, WHU, Frankfurt) require at least 2–3 years of professional experience. 
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/60">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Recommended Courses</h4>
                      <ul className="text-xs text-slate-500 font-semibold space-y-1.5 list-disc pl-4">
                        <li>MIM (Master's in Management) - cheaper, designed for pre-experience</li>
                        <li>EU Business School Munich (No experience or GMAT requirements)</li>
                        <li>University of Cologne (Public/Affordable, flexible entry criteria)</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/60">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Timeline Action Plan</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Gain work experience during 2026-27, complete IELTS/GMAT, and book your APS certificate verification slot. Apply for October 2027 intake.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {profileScenario === 'B' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800">Scenario B: IT / Consulting Professional with 3–6 Years Experience</h3>
                  <p className="text-slate-650 text-sm font-medium leading-relaxed">
                    This represents the absolute strongest profile for German MBA placements. Top employers are actively looking for technical profiles with business management skills.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/60">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Recommended Courses</h4>
                      <ul className="text-xs text-slate-500 font-semibold space-y-1.5 list-disc pl-4">
                        <li>WHU, Mannheim Business School, Frankfurt School</li>
                        <li>Focus on Supply Chain & Logistics or Sustainability specialisations</li>
                        <li>Start A1 German level early to unlock B1 fast-track residency</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/60">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Timeline Action Plan</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Book APS in March–April 2026. Submit Round 1 applications in July–August 2026 to start classes in October 2027.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {profileScenario === 'C' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800">Scenario C: Senior Manager or Director with 7+ Years Experience</h3>
                  <p className="text-slate-650 text-sm font-medium leading-relaxed">
                    Experienced managers can choose executive pathways or part-time structures without needing GMAT test scores.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/60">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Recommended Courses</h4>
                      <ul className="text-xs text-slate-500 font-semibold space-y-1.5 list-disc pl-4">
                        <li>ESMT Executive MBA (GMAT waived for high-experience profiles)</li>
                        <li>Frankfurt School EMBA (Flexible 18-month working schedule)</li>
                        <li>Public university MBA with waived test requirements</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/60">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Timeline Action Plan</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Admissions operate on a rolling basis. Submit application files 6–9 months before the intended program launch.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. MBA COLLEGES DATABASE */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Top MBA Colleges in Germany</h2>
            <p className="text-slate-500 text-sm font-bold">Compare rankings, total tuition costs (EUR/INR), GMAT requirements, and primary intakes.</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                    <th className="py-4 px-6">College</th>
                    <th className="py-4 px-6 text-center">QS rank</th>
                    <th className="py-4 px-6 text-center">GMAT Needed</th>
                    <th className="py-4 px-6 text-right">Total Tuition (EUR)</th>
                    <th className="py-4 px-6 text-right">Total Tuition (INR)</th>
                    <th className="py-4 px-6 text-center">Intake</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                  {topColleges.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        {c.logo && (
                          <img 
                            src={c.logo} 
                            alt="" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                            className="w-7 h-7 rounded bg-slate-100 p-0.5 object-contain shrink-0" 
                          />
                        )}
                        <div>
                          <div className="font-black text-slate-800">{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">Focus: {c.spec}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-orange-50 text-[#C04A1D] font-black text-[10px]">
                          {c.qsRank}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-600">{c.gmat}</td>
                      <td className="py-4 px-6 text-right font-black text-slate-700">€ {c.feeEur.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right font-black text-indigo-650">{formatPrice(c.feeEur)}</td>
                      <td className="py-4 px-6 text-center font-bold text-slate-600">{c.intake}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Note: Exchange rate reference is 1 EUR = 109.95 INR</span>
              <span className="text-xs text-slate-400 font-bold">Source: Official university pages, QS MBA Rankings 2026</span>
            </div>
          </div>
        </div>

        {/* 5. PLACEMENT & SALARY GRID */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Placement & Salary Opportunities</h2>
            <p className="text-slate-500 text-sm font-bold">Germany faces a shortage of 5–7 million workers by 2030, raising demand in executive management.</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                    <th className="py-4 px-6">Specialisation Area</th>
                    <th className="py-4 px-6">Top Corporate Employers</th>
                    <th className="py-4 px-6">Language Requirement</th>
                    <th className="py-4 px-6 text-right">Avg. Starting Salary (EUR)</th>
                    <th className="py-4 px-6 text-right">Avg. Starting Salary (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                  {specialisations.map((spec, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-black text-slate-800">{spec.spec}</td>
                      <td className="py-4 px-6 text-slate-500 font-bold">{spec.employers}</td>
                      <td className="py-4 px-6 text-slate-600">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black">
                          {spec.language}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-slate-700">
                        € {spec.minSalary.toLocaleString()} – € {spec.maxSalary.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right font-black text-indigo-650">
                        {formatPrice(spec.minSalary)} – {formatPrice(spec.maxSalary)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 6. WARNING BANNERS & CHECKLISTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          
          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute right-[-10%] top-[-20%] w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="p-3 bg-white/10 rounded-2xl inline-block">
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-xl font-black">Critical Timeline Warnings: The APS Trap</h3>
              <p className="text-white/95 text-xs font-semibold leading-relaxed">
                The APS Certificate is a mandatory academic credential verify check. <strong>No German university will process your file, and no student visa appointment will be granted without it.</strong>
              </p>
              <div className="text-xs text-rose-100 bg-black/10 rounded-xl p-4 font-semibold leading-relaxed">
                In the peak July-September season, APS Delhi appointments fill within 48 hours, causing 8-10 week processing delays. <strong>Book your APS appointment by March-April</strong> to guarantee your October intake.
              </div>
            </div>
          </div>

          <div className="bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="text-indigo-650" size={20} />
              <span>Indian Student Document Checklist</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="text-indigo-650" size={16} />
                  <span>APS Certificate (aps.org.in)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="text-indigo-650" size={16} />
                  <span>Semester & Degree Certificates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="text-indigo-650" size={16} />
                  <span>10th & 12th Board Certificates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="text-indigo-650" size={16} />
                  <span>GMAT Scorecard (waived at some)</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="text-indigo-650" size={16} />
                  <span>IELTS (min 6.5) / TOEFL (min 90)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="text-indigo-650" size={16} />
                  <span>SOP (500–800 words, metrics-focused)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="text-indigo-650" size={16} />
                  <span>2 Letters of Recommendation (LORs)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="text-indigo-650" size={16} />
                  <span>Blocked Account (€11,904 confirmation)</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 7. TROUBLESHOOTING & FAQ SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          
          <div className="lg:col-span-1 bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <AlertCircle className="text-indigo-650" size={20} />
              <span>Application Problem Solver</span>
            </h3>

            <div className="space-y-4 text-xs font-semibold">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-black text-slate-800">APS Delayed (10+ Weeks)</h4>
                <p className="text-slate-500 mt-1">Email apost@newdelhi.diplo.de with your ref number. Submit confirmation to your university to request deferrals.</p>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-black text-slate-800">GMAT Below 600</h4>
                <p className="text-slate-500 mt-1">Apply to TUM, HHL, EU Business School, or ISM. A GRE score of 310+ is also widely accepted as a direct substitute.</p>
              </div>
              <div>
                <h4 className="font-black text-slate-800">Low Grades (Below 60%)</h4>
                <p className="text-slate-500 mt-1">Target ISM or EU Business School, which prioritize work experience and interview performance over GPA metrics.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <HelpIcon className="text-indigo-650" size={20} />
              <span>FAQ for Indian MBA Students</span>
            </h3>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden bg-white/40">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-4 font-black text-xs text-slate-800 flex justify-between items-center hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {faqOpen === idx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <AnimatePresence>
                    {faqOpen === idx && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-slate-50/50"
                      >
                        <p className="p-4 text-xs text-slate-500 border-t border-slate-100 leading-relaxed font-semibold">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 8. CTA SECTION */}
        <StudyAbroadCTA />

      </div>
    </div>
  );
};

export default GermanyMBAPage;
