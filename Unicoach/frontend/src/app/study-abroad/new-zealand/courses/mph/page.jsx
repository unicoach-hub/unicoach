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
  { id: 'overview', title: 'Why Study MPH?' },
  { id: 'universities', title: 'Top MPH Universities' },
  { id: 'requirements', title: 'Admission Criteria' },
  { id: 'specializations', title: 'Specializations & Core' },
  { id: 'costs', title: 'Tuition & Living Costs' },
  { id: 'scholarships', title: 'Scholarships' },
  { id: 'careers', title: 'Career Prospects' },
  { id: 'pathways', title: 'Residency Pathways' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const topMphUnisList = [
  { rank: 1, name: "University of Auckland", qs: "#65", feeNZDMin: 52585, feeNZDMax: 55214, spec: "Digital Health, Global Health, Epidemiology", tagline: "NZ'S TOP-RANKED UNIVERSITY", logo: "https://logo.clearbit.com/auckland.ac.nz" },
  { rank: 2, name: "University of Otago", qs: "#206", feeNZDMin: 47556, feeNZDMax: 47556, spec: "Health Sciences, Policy, Injury Prevention", tagline: "NZ'S OLDEST UNIVERSITY", logo: "https://logo.clearbit.com/otago.ac.nz" },
  { rank: 3, name: "Victoria University of Wellington", qs: "#241", feeNZDMin: 51050, feeNZDMax: 53600, spec: "Policy, Clinical Research, Health Promotion", tagline: "CAPITAL CITY ADVANTAGE", logo: "https://logo.clearbit.com/wgtn.ac.nz" },
  { rank: 4, name: "University of Canterbury", qs: "#256", feeNZDMin: 45300, feeNZDMax: 45300, spec: "Community Engagement, Equity focus", tagline: "HIGH STUDENT SATISFACTION", logo: "https://logo.clearbit.com/canterbury.ac.nz" },
  { rank: 5, name: "Massey University", qs: "#284", feeNZDMin: 38840, feeNZDMax: 46590, spec: "Health Promotion, Practice-focused", tagline: "MOST AFFORDABLE OPTION", logo: "https://logo.clearbit.com/massey.ac.nz" },
  { rank: 6, name: "Auckland University of Technology (AUT)", qs: "#407", feeNZDMin: 45300, feeNZDMax: 45300, spec: "Social Epidemiology, Pacific Health", tagline: "HIGHEST GRAD EMPLOYMENT RATE", logo: "https://logo.clearbit.com/aut.ac.nz" }
];

const NewZealandMPHCourse = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [currency, setCurrency] = useState('INR'); // 'NZD' | 'INR'
  const [faqOpen, setFaqOpen] = useState({});
  const exchangeRate = 52.00; // Reference 1 NZD = 52 INR for MPH guide

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
          <span className="text-slate-600 font-bold">MPH Guide 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80" 
              alt="Public Health Students Researching" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <BookOpen size={14} />
              Master of Public Health (MPH) 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              MPH in New Zealand 2026: Complete Guide for Indian Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Study at top-ranked universities with a unique focus on indigenous health equity (Hauora Māori) and secure your path via Green List PR schemes.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: January 5, 2026
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
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">MPH Navigation</span>
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
            
            {/* 1. Why Study MPH Overview */}
            <section id="overview" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-sky-50/40 to-indigo-50/40 border border-indigo-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={22} />
                  💡 Why Study MPH in New Zealand?
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  The Master of Public Health (MPH) is a Level 9 program designed to lead disease prevention, health policy reforms, and health promotion. Study with practical field placements in partner networks like **Te Whatu Ora**.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Duration", val: "1 - 2 Years" },
                    { label: "IELTS Required", val: "6.5 Academic" },
                    { label: "PSW Stay-Back", val: "3 Years Open" },
                    { label: "Starting Wage", val: "NZD 75K - 90K" }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-405 block font-bold">{stat.label}</span>
                      <strong className="text-indigo-650 text-xs font-black block mt-1">{stat.val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Top MPH Universities */}
            <section id="universities" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🏛️ Top Universities for MPH (2026 Rankings & Fees)</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">QS rankings and annual tuition schedules</p>
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
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-xs' : 'text-slate-555 hover:bg-slate-100'}`}
                  >
                    INR (₹)
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {topMphUnisList.map((uni) => (
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
                          QS Rank: {uni.qs} · {uni.tagline}
                        </span>
                        <h3 className="font-black text-slate-800 text-sm md:text-base mt-1">{uni.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1">
                          Focus: {uni.spec.split(',')[0]}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 shrink-0">
                      <div>
                        <span className="text-slate-400 font-bold block">Tuition Fee</span>
                        <strong className="text-slate-800 font-extrabold mt-0.5 block">
                          {uni.feeNZDMin === uni.feeNZDMax 
                            ? formatCost(uni.feeNZDMin) 
                            : `${formatCost(uni.feeNZDMin)} - ${formatCost(uni.feeNZDMax)}`}
                        </strong>
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

            {/* 3. Admission Requirements */}
            <section id="requirements" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-650" size={24} />
                  📋 Admission Requirements for Indian Students
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">Academic Prerequisites</h4>
                    <p className="text-slate-500 leading-relaxed mb-2">
                      Bachelor's degree in Medicine, Nursing, Pharmacy, Health Sciences, or Social Sciences.
                    </p>
                    <p className="text-slate-500 leading-relaxed">
                      GPA: B average (equivalent to **70% - 75%** in Indian university terms). 1-2 years relevant experience is highly preferred.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">English Standards</h4>
                    <ul className="space-y-1.5 text-slate-550 leading-relaxed">
                      <li><strong>IELTS Academic:</strong> 6.5 Overall (no band &lt; 6.0)</li>
                      <li><strong>TOEFL iBT:</strong> 90 Overall minimum</li>
                      <li><strong>PTE Academic:</strong> 58 – 64 minimum</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Specializations & Curriculum */}
            <section id="specializations" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6">📖 MPH Specialisations & Core Modules</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold mb-6">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 mb-1">💻 Digital Health & AI</h4>
                    <p className="text-slate-500">Focuses on health data analytics, wearable design, and health database administration.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 mb-1">📊 Epidemiology</h4>
                    <p className="text-slate-500">Deals with quantitative research, statistical disease surveillance, and outbreaks tracking.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 mb-1">🌱 Environmental Health</h4>
                    <p className="text-slate-500">Climate change impacts on human well-being, sanitation, and sustainable community living.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 mb-1">🏛️ Health Policy & Management</h4>
                    <p className="text-slate-500">Leadership, strategic hospital administration, and writing governmental policy frameworks.</p>
                  </div>
                </div>

                <div className="bg-sky-50/50 p-5 rounded-xl border border-sky-100 text-xs font-semibold text-sky-950">
                  <h4 className="font-bold mb-2">Core Modules Taken by All Scholars:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Epidemiology:</strong> Distribution and determinants of health events in populations.</li>
                    <li><strong>Biostatistics:</strong> Quantitative statistical methods for healthcare analysis.</li>
                    <li><strong>Health Systems:</strong> Organization, funding structure, and policy impact of health services.</li>
                    <li><strong>Hauora Māori:</strong> Indigenous health perspectives & Te Tiriti o Waitangi principles.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. Tuition & Living Costs */}
            <section id="costs" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  Tuition Fees & Cost of Living Schedule
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold mb-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-3">Est. Monthly Living Budget</h4>
                    <div className="space-y-3">
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Accommodation:</span> <strong>NZ$700 - $1,858</strong></p>
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Food & Meals:</span> <strong>NZ$250 - $2,250</strong></p>
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Transportation:</span> <strong>NZ$80 - $200</strong></p>
                      <p className="flex justify-between"><span>Utilities & Misc:</span> <strong>NZ$260 - $2,295</strong></p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-3">Total Annual Budget Schedule</h4>
                    <div className="space-y-3">
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Tuition Fees:</span> <strong>NZ$38,840 - $55,214 (₹20L - ₹28L)</strong></p>
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Living Expenses:</span> <strong>NZ$20,000 - $25,000 (₹10.5L - ₹13L)</strong></p>
                      <p className="flex justify-between"><span>Total Annual Cost:</span> <strong className="text-indigo-650">NZ$58,840 - $80,214 (₹30.5L - ₹41L)</strong></p>
                    </div>
                  </div>
                </div>

                <div className="bg-sky-50/50 p-5 rounded-xl border border-sky-100 text-xs text-sky-950 font-semibold leading-relaxed">
                  <strong>💡 Living Cost Proof for Student Visa:</strong> Immigration New Zealand requires evidence of access to at least **NZD $20,000 (~₹10.5 Lakhs)** per year.
                </div>
              </div>
            </section>

            {/* 6. Scholarships */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Award className="text-indigo-650" size={24} />
                  Available Scholarships for MPH
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 mb-1">Manaaki NZ Scholarships</h4>
                    <p className="text-indigo-655 font-black mb-1">Value: Full Funding</p>
                    <p className="text-slate-500 text-[11px]">Government-funded. Covers tuition fees, stipends, airfares, and medical insurance.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 mb-1">NZ Excellence Awards</h4>
                    <p className="text-indigo-655 font-black mb-1">Value: Up to NZD 20,000</p>
                    <p className="text-slate-500 text-[11px]">Offered by the NZ government to support high-performing Indian students.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 mb-1">Auckland India Achievers</h4>
                    <p className="text-indigo-655 font-black mb-1">Value: Up to NZD 20,000</p>
                    <p className="text-slate-500 text-[11px]">Exclusive scholarship for Indian nationals joining the University of Auckland.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Career Prospects & Salaries */}
            <section id="careers" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Briefcase className="text-indigo-650" size={24} />
                  Career Prospects & Average Starting Salaries
                </h2>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Job Role</th>
                        <th className="pb-3 pr-4">Average Salary (NZD)</th>
                        <th className="pb-3 pr-4 text-right">Average Salary (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705 font-semibold">
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Public Health Specialist</td>
                        <td className="py-4 text-slate-600">$75,000 - $90,000</td>
                        <td className="py-4 text-right text-indigo-650">₹38L - ₹45.5 Lakh</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Epidemiologist</td>
                        <td className="py-4 text-slate-600">$60,000 - $85,000</td>
                        <td className="py-4 text-right text-indigo-650">₹30.3L - ₹43.0 Lakh</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Health Policy Advisor</td>
                        <td className="py-4 text-slate-600">$55,000 - $85,000</td>
                        <td className="py-4 text-right text-indigo-650">₹27.8L - ₹43.0 Lakh</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Data Analyst (Health)</td>
                        <td className="py-4 text-slate-600">$70,000 - $95,000</td>
                        <td className="py-4 text-right text-indigo-650">₹35.4L - ₹48.0 Lakh</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-sky-50/50 p-5 rounded-xl border border-sky-100 text-xs text-sky-955 font-semibold">
                  <strong>💡 Top Employers:</strong> Ministry of Health, Te Whatu Ora, Public Health Organisations (PHOs), World Health Organisation (WHO), and healthcare NGOs.
                </div>
              </div>
            </section>

            {/* 8. Post-Study Work & Residency Pathways */}
            <section id="pathways" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-[2rem] p-8">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                  <Compass className="text-indigo-300" size={24} />
                  Post-Study Work & Residency (Green List)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                    <h4 className="text-indigo-300 font-bold mb-2">3-Year PSWV</h4>
                    <p className="text-slate-300 leading-relaxed">
                      Level 9 Master of Public Health graduates receive a 3-year open post-study work visa not tied to any employer.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                    <h4 className="text-indigo-300 font-bold mb-2">Green List Fast-Track</h4>
                    <p className="text-slate-300 leading-relaxed">
                      Various public health positions are on the Green List, allowing fast-tracked permanent residency application cards.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                    <h4 className="text-indigo-300 font-bold mb-2">SMC Skilled Points</h4>
                    <p className="text-slate-300 leading-relaxed">
                      Master's degrees earn 5 points out of the 6-point Skilled Migrant Category threshold, requiring just 1 year of skilled work.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about MPH studies in NZ</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "Can I stay in New Zealand after my MPH?", a: "Yes. Graduates of a Level 9 MPH program are eligible for a 3-year post-study work visa, allowing them to secure roles in the vibrant public health sector." },
                  { q: "Is work experience mandatory for admission?", a: "No. However, 1-2 years of relevant experience in public health or healthcare is highly preferred and can compensate for a slightly lower GPA." },
                  { q: "What is the total cost of the program in INR?", a: "The combined cost (tuition + living) typically ranges from ₹30.5 Lakhs to ₹41 Lakhs per year, depending on the university and lifestyle." },
                  { q: "What is the salary for an MPH in New Zealand?", a: "Entry-to-mid level specialists earn NZ$60,000 - $80,000 per year, while experienced/senior specialists earn NZ$90,000 - $130,000+." },
                  { q: "What is the IELTS requirement for MPH?", a: "Usually 6.5 overall with no individual band below 6.0 in IELTS Academic, or TOEFL iBT score of 90." }
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

export default NewZealandMPHCourse;
