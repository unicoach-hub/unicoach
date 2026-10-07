import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, MapPin, Award, Building, Globe, ExternalLink, 
  BookOpen, Calendar, HelpCircle, CheckCircle2, ArrowRight, 
  Search, Filter, Info, Plane, Sparkles, GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../components/StudyAbroadCTA';
import { matchesUniversitySearch, getMatchedCoursesForUniversity } from '../../../utils/universitySearchMatcher';

const franceUniversities = [
  { id: 'fr-1', name: "HEC Paris", city: "Jouy-en-Josas (Paris)", rank: "Top Business School", type: "Private / Business", eligibility: "GMAT/GRE, IELTS 7.0+, interview required", website: "https://www.hec.edu", logo: "https://logo.clearbit.com/hec.edu", courses: ["Business Administration", "Management", "Finance", "Marketing", "Business Analytics"] },
  { id: 'fr-2', name: "École Polytechnique", city: "Palaiseau (Paris)", rank: "Top Engineering", type: "Public / Engineering", eligibility: "GPA 8.5+, IELTS 6.5+, math entry test", website: "https://www.polytechnique.edu", logo: "https://logo.clearbit.com/polytechnique.edu", courses: ["Computer Science", "Artificial Intelligence", "Data Science", "Applied Mathematics", "Engineering Science"] },
  { id: 'fr-3', name: "Sorbonne University", city: "Paris", rank: "Top Research", type: "Public University", eligibility: "IELTS 6.5+ or DELF B2, strong academic background", website: "https://www.sorbonne-universite.fr", logo: "https://logo.clearbit.com/sorbonne-universite.fr", courses: ["Computer Science", "Physics", "Medicine", "Mathematics", "Humanities", "Robotics"] },
  { id: 'fr-4', name: "ESSEC Business School", city: "Cergy (Paris)", rank: "Elite Business", type: "Private / Business", eligibility: "GMAT/GRE, IELTS 7.0+, portfolio/essay", website: "https://www.essec.edu", logo: "https://logo.clearbit.com/essec.edu", courses: ["Business Administration", "Finance", "Marketing", "Data Analytics", "Strategy"] },
  { id: 'fr-5', name: "Sciences Po", city: "Paris", rank: "Top Social Sciences", type: "Public / Political Science", eligibility: "GPA 8.0+, IELTS 7.0+ or DELF B2, strict SOP check", website: "https://www.sciencespo.fr", logo: "https://logo.clearbit.com/sciencespo.fr", courses: ["Political Science", "International Relations", "Public Affairs", "Economics", "Law"] },
  { id: 'fr-6', name: "SKEMA Business School", city: "Lille / Nice", rank: "Global Business", type: "Private / Business", eligibility: "GPA 7.5+, IELTS 6.5+, essay rounds", website: "https://www.skema.edu", logo: "https://logo.clearbit.com/skema.edu", courses: ["Global Business", "Supply Chain", "Finance", "Digital Marketing", "Artificial Intelligence"] },
  { id: 'fr-7', name: "EDHEC Business School", city: "Lille / Nice", rank: "Finance Specialised", type: "Private / Business", eligibility: "GMAT/GRE, IELTS 6.5+, business interviews", website: "https://www.edhec.edu", logo: "https://logo.clearbit.com/edhec.edu", courses: ["Finance", "Financial Markets", "Business Analytics", "Management", "Marketing"] },
  { id: 'fr-8', name: "INSEAD", city: "Fontainebleau", rank: "#2 Global MBA", type: "Private / Business", eligibility: "GMAT 700+, 3+ years work exp, IELTS 7.5+", website: "https://www.insead.edu", logo: "https://logo.clearbit.com/insead.edu", courses: ["Business Administration", "Executive Management", "Finance", "Strategy"] },
  { id: 'fr-9', name: "University of Paris-Saclay", city: "Orsay (Paris)", rank: "Top Sciences", type: "Public University", eligibility: "GPA 8.0+, IELTS 6.5+, physics/math background", website: "https://www.universite-paris-saclay.fr", logo: "https://logo.clearbit.com/universite-paris-saclay.fr", courses: ["Computer Science", "Artificial Intelligence", "Physics", "Mathematics", "Bioengineering"] }
];

const FranceOverview = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [financeTab, setFinanceTab] = useState('tuition'); // 'tuition' | 'living'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  const exchangeRate = 110.14; // 1 EUR ≈ 110.14 INR (As of June 2026 reference)

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = valInEUR * exchangeRate;
    if (valInINR === 0) return 'Free';
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  const filteredUnis = franceUniversities.filter(uni => {
    const matchesSearch = matchesUniversitySearch(uni, searchTerm);
    const matchesType = selectedType === 'All' || uni.type === selectedType;
    const matchesCity = selectedCity === 'All' || uni.city.includes(selectedCity);
    return matchesSearch && matchesType && matchesCity;
  });

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans select-none">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-100/50 via-indigo-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Study in France</span>
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
              <span>France Study Guide 2026/27</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Study in France for a{' '}
              <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">High-ROI Future</span>
            </h1>
            <p className="text-slate-660 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mb-8">
              France is targetting 30,000 Indian students by 2030. Enjoy subsidized public university tuition, top-ranked Business Schools (Grandes Écoles), and a 5-year short-stay visa route for postgraduate alumni.
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
                src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200" 
                alt="Eiffel Tower, Paris" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Eiffel Tower, Paris</p>
                <h3 className="text-xl font-black mt-1">Center of Business & Culture</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { val: "30,000", label: "Indian Target (2030)" },
            { val: "1,600+", label: "English Taught Courses" },
            { val: "5 Years", label: "Post-Study Visa (PG)" },
            { val: "€2,770", label: "UG Public Tuition / Yr" }
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

        {/* 2. FINANCIALS OVERVIEW */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Cost of Studying in France</h2>
            <p className="text-slate-500 text-sm font-bold">Learn about tuition fees, living costs, and part-time wages.</p>
          </div>

          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
            {[
              { id: 'tuition', label: 'Tuition Ranges' },
              { id: 'living', label: 'Living Expenses & Wages' }
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
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
              >
                {[
                  { tier: "Bachelor's (Public)", desc: "Subsidized by the French government for international students at public universities.", cost: 2770 },
                  { tier: "Master's (Public)", desc: "Highly affordable standard postgraduate rates at state public universities.", cost: 3770 },
                  { tier: "PhD Programs (Public)", desc: "Almost entirely subsidized research tracks for doctoral candidates.", cost: 380 },
                  { tier: "Private / Business Schools", desc: "Grandes Écoles and private business programs set their own rates.", cost: 15000 }
                ].map((tier, i) => (
                  <div key={i} className="bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <span className="text-lg font-black text-slate-800">{tier.tier}</span>
                      <p className="text-slate-500 text-xs font-semibold mt-2.5 mb-6">{tier.desc}</p>
                    </div>
                    <div className="border-t border-slate-100 pt-5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg. Tuition / Yr</p>
                      <p className="text-xl font-black text-indigo-650 mt-1">
                        {formatCost(tier.cost)}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {financeTab === 'living' && (
              <motion.div 
                key="living" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Cost of Living */}
                <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm">
                  <h3 className="text-base font-black text-slate-900 mb-4">Monthly Expenses by Location</h3>
                  <div className="space-y-3.5 text-xs font-bold text-slate-700">
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                      <span>Metropolitan Paris</span>
                      <span className="text-indigo-650 font-black">{formatCost(1200)} - {formatCost(1400)} / mo</span>
                    </div>
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                      <span>Lyon, Bordeaux, Lille</span>
                      <span className="text-slate-850 font-black">{formatCost(800)} - {formatCost(1000)} / mo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Smaller Student Cities</span>
                      <span className="text-slate-850 font-black">{formatCost(600)} - {formatCost(800)} / mo</span>
                    </div>
                  </div>
                </div>

                {/* Wages */}
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 mb-2">Part-Time Student Wages</h3>
                    <p className="text-slate-650 text-xs font-semibold leading-relaxed">
                      International student visas permit working up to 964 hours per year (around 20 hours/week). The standard student wage ranges from **€10 to €15/hour** (approx. ₹1,000 - ₹1,600).
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-indigo-100/50 flex justify-between items-center text-xs font-black text-indigo-750">
                    <span>Potential Monthly Income:</span>
                    <span>{formatCost(800)} - {formatCost(1200)} / mo</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. SCHOLARSHIPS BANNER */}
        <div className="mb-20 bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white rounded-[32px] p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-20%] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl font-black mb-3">Elite France Scholarships (September Intake Only)</h2>
          <p className="text-white/80 text-sm font-semibold max-w-2xl mb-8">
            Most prestigious awards are tied exclusively to the September academic intake. Start early and secure funding that covers both tuition and living budgets.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Eiffel Excellence", detail: "€1,181/mo + flights", note: "For Master's/PhD candidates" },
              { title: "France Excellence", detail: "Stipend + visa fee waiver", note: "Administered by the French Embassy" },
              { title: "Charpak Scholarship", detail: "UG & Master's stipend", note: "Covers tuition + living support" },
              { title: "Erasmus Mundus", detail: "Full tuition + €1,000/mo", note: "Joint international Master's programs" }
            ].map((p, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <span className="text-[10px] text-indigo-200 font-black uppercase tracking-wider">{p.title}</span>
                <p className="text-base font-black mt-1.5 mb-2">{p.detail}</p>
                <div className="text-[11px] text-white/90 font-medium">{p.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. ADMISSIONS PIPELINE WORKFLOW */}
        <div className="mb-20">
          <div className="text-left mb-12 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Campus France (EEF) Application Steps</h2>
            <p className="text-slate-500 text-sm font-bold">Timelines and procedures for prospective applicants.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
            {[
              { num: "01", t: "Register", d: "Create your account on EEF Portal." },
              { num: "02", t: "SOP & CV", d: "Upload academic credentials and SOP." },
              { num: "03", t: "Apply", d: "Apply to up to 12 university choices." },
              { num: "04", t: "Interview", d: "Pass Campus France academic interview." },
              { num: "05", t: "Accept Offer", d: "Confirm university seat on portal." },
              { num: "06", t: "Visa VFS", d: "Attend VFS Global visa appointment." }
            ].map((step, idx) => (
              <div key={idx} className="bg-white/60 border border-white rounded-[24px] p-5 shadow-sm relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300">
                <span className="text-[10px] text-indigo-455 font-black uppercase tracking-wider">Step</span>
                <p className="text-3xl font-black text-indigo-655 mb-2 mt-0.5">{step.num}</p>
                <p className="text-slate-800 font-extrabold text-xs mb-1">{step.t}</p>
                <p className="text-slate-500 text-[11px] font-semibold leading-snug">{step.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. INTERACTIVE UNIVERSITY FINDER FOR FRANCE */}
        <div className="mb-20" id="france-university-finder">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">France University & Business School Finder</h2>
            <p className="text-slate-500 text-sm font-bold">Search top Grandes Écoles, public universities, and specialized engineering colleges.</p>
          </div>

          <div className="bg-white/50 border border-white rounded-[28px] p-6 backdrop-blur-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by course (e.g. CS, MBA, Data Science, AI), university..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* Type selector */}
            <div className="flex gap-2">
              {['All', 'Private / Business', 'Public University', 'Public / Engineering'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${selectedType === t ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-650 hover:bg-slate-100 border border-slate-100'}`}
                >
                  {t === 'Private / Business' ? 'Business' : t === 'Public University' ? 'Public' : t === 'Public / Engineering' ? 'Engineering' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredUnis.map((uni) => {
                const matchedCourses = getMatchedCoursesForUniversity(uni, searchTerm);
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
                    {matchedCourses.length > 0 && (
                      <div className="mb-3 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                        <span>Matched Course: <strong className="font-extrabold">{matchedCourses.join(', ')}</strong></span>
                      </div>
                    )}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0 p-1">
                        <img src={uni.logo} alt={uni.name} className="w-9 h-9 object-contain" onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-tight hover:text-indigo-650 transition-colors">{uni.name}</h4>
                        <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                          <MapPin size={10} />
                          {uni.city}, France
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Classification</p>
                        <p className="text-[11px] font-black text-slate-800 mt-0.5">{uni.rank}</p>
                      </div>
                      <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Institution Type</p>
                        <p className="text-[11px] font-black text-indigo-650 mt-0.5">{uni.type}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-550 font-semibold mb-4 leading-normal bg-slate-50/20 p-2.5 rounded-xl border border-slate-100/20">
                      <strong>Entry Criteria:</strong> {uni.eligibility}
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
              ); })}
            </AnimatePresence>

            {filteredUnis.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-semibold text-sm">
                No institutions match the current search filters.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="bg-white/50 border border-white rounded-[32px] p-8 md:p-10 shadow-sm text-center max-w-3xl mx-auto">
          <Building className="mx-auto text-indigo-600 mb-4" size={32} />
          <h3 className="text-2xl font-black text-slate-900 mb-2">Ready to Study in France?</h3>
          <p className="text-slate-500 text-sm font-semibold mb-6 max-w-md mx-auto">
            Get professional counselling to select courses, check backlog policies, and process visa applications through Campus France.
          </p>
          <Link
            to="/contact?destination=france"
            className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-2xl font-black text-sm transition-all shadow-sm"
          >
            <span>Connect with our Counsellor</span>
            <ArrowRight size={16} />
          </Link>
        </div>


      {/* CTA Section */}
      <StudyAbroadCTA country="France" />

      </div>
    </div>
  );
};

export default FranceOverview;
