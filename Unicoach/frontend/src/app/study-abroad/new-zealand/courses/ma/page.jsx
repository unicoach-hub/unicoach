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
  { id: 'overview', title: 'Why Study MA in NZ?' },
  { id: 'courses', title: 'Top 10 MA Courses' },
  { id: 'admission', title: 'Admission & Eligibility' },
  { id: 'costs', title: 'Cost of Studying' },
  { id: 'scholarships', title: 'Available Scholarships' },
  { id: 'visa', title: 'Visa Requirements' },
  { id: 'careers', title: 'Careers & Salaries' },
  { id: 'residency', title: 'Residency Roadmap' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const topMaUnisList = [
  { rank: 1, name: "University of Auckland", qs: "#65", feeNZD: 32000, spec: "Linguistics, English Literature, Sociology", tagline: "NZ'S TOP-RANKED UNIVERSITY", logo: "https://logo.clearbit.com/auckland.ac.nz" },
  { rank: 2, name: "University of Otago", qs: "#197", feeNZD: 30500, spec: "History, Psychology, Anthropology, Philosophy", tagline: "NZ'S OLDEST UNIVERSITY", logo: "https://logo.clearbit.com/otago.ac.nz" },
  { rank: 3, name: "Victoria University of Wellington", qs: "#240", feeNZD: 29000, spec: "Political Science, Media Studies, Creative Writing", tagline: "CAPITAL CITY ADVANTAGE", logo: "https://logo.clearbit.com/wgtn.ac.nz" },
  { rank: 4, name: "University of Canterbury", qs: "#261", feeNZD: 28500, spec: "Sociology, Geography, Education, TESOL", tagline: "CREATIVE LEARNING ENVIRONMENT", logo: "https://logo.clearbit.com/canterbury.ac.nz" },
  { rank: 5, name: "Massey University", qs: "#230", feeNZD: 27000, spec: "Creative Writing, Applied Linguistics, Social Work", tagline: "PRACTICAL RESEARCH LEADER", logo: "https://logo.clearbit.com/massey.ac.nz" },
  { rank: 6, name: "University of Waikato", qs: "#281", feeNZD: 26000, spec: "History, Psychology, Screen and Media Studies", tagline: "EXCELLENT VALUE & STUDENT SATISFACTION", logo: "https://logo.clearbit.com/waikato.ac.nz" }
];

const NewZealandMACourse = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [currency, setCurrency] = useState('INR'); // 'NZD' | 'INR'
  const [faqOpen, setFaqOpen] = useState({});
  const exchangeRate = 52.55; // Reference 1 NZD = 52.55 INR for MA guide

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
          <span className="text-slate-600 font-bold">MA Guide 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80" 
              alt="MA Humanities Student Writing" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <BookOpen size={14} />
              Master of Arts (MA) Guide 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              MA in New Zealand 2026: Complete Guide for Indian Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Accepting 3-year Indian degrees. Learn about top courses, eligibility criteria, annual budgets, and post-study open work visa stays.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: January 19, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                11 min read
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
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">MA Navigation</span>
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
            
            {/* 1. Why Study MA Overview */}
            <section id="overview" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-sky-50/40 to-indigo-50/40 border border-indigo-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-indigo-605" size={22} />
                  💡 Why Study MA in New Zealand?
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  While other destinations tighten student routes, New Zealand offers Indian graduates straight access into a 3-year stay-back visa. A 3-year Indian Bachelor's degree is widely accepted for Level 9 MA courses.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Acceptance", val: "3-Year Indian Degrees" },
                    { label: "Term Work rights", val: "25 Hours Weekly" },
                    { label: "Post-Study Visa", val: "3-Year Open Stay" },
                    { label: "Family Privilege", val: "Partner Work Rights" }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-405 block font-bold">{stat.label}</span>
                      <strong className="text-indigo-650 text-xs font-black block mt-1">{stat.val}</strong>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-teal-50/50 p-5 rounded-2xl border border-teal-150 text-xs text-teal-950 font-semibold leading-relaxed">
                  <strong>🎁 Hidden Saving advantage:</strong> Children of Level 9 MA scholars study in public primary/secondary schools under local domestic rates, saving thousands of dollars in international school fees.
                </div>
              </div>
            </section>

            {/* 2. Top 10 MA Courses */}
            <section id="courses" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🎓 Top 10 MA Courses in New Zealand</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Top universities, eligibility average, and Green List statuses</p>
              </div>

              <div className="space-y-4">
                {[
                  { name: "Master of Education (MEd)", unis: "Auckland, Canterbury, AUT", criteria: "B.Ed or relevant, GPE 5.0 (65-75%)", career: "Secondary School Teacher", greenList: "✅ Tier 2 Green List" },
                  { name: "Master of Arts in Psychology", unis: "Auckland, Otago, Waikato", criteria: "3-year BA Psychology degree, 70%+", career: "Educational Psychologist", greenList: "✅ Tier 1 Straight to Residence" },
                  { name: "Master of Communication Studies", unis: "AUT, Auckland, Massey", criteria: "Relevant degree, GPE 5.0 (65%+)", career: "Media Advisor, Digital Strategist", greenList: "❌ N/A" },
                  { name: "Master of International Relations (MIR)", unis: "Victoria Wellington, Auckland", criteria: "Any Bachelor's, B average (65%+)", career: "Policy Analyst", greenList: "✅ Tier 2 Green List" },
                  { name: "Master of Social Work (Applied)", unis: "Massey, Waikato, Auckland", criteria: "Relevant degree, 60-70%, experience preferred", career: "Social Worker", greenList: "✅ Tier 2 Green List" },
                  { name: "Master of Digital Business", unis: "Waikato, EIT", criteria: "Business/IT degree, B- average", career: "Digital Transformation Consultant", greenList: "❌ N/A" },
                  { name: "Master of Applied Linguistics (TESOL)", unis: "Massey, Canterbury, Auckland", criteria: "Relevant degree, B average, teaching experience", career: "Language Consultant, Lecturer", greenList: "❌ N/A" },
                  { name: "Master of Arts in Geography", unis: "Auckland, Canterbury, Massey", criteria: "Geography major, B average in final year", career: "Environmental Consultant, Town Planner", greenList: "❌ N/A" }
                ].map((course, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-indigo-650 font-black uppercase tracking-wider block">{course.greenList}</span>
                      <h3 className="font-black text-slate-800 text-sm md:text-base mt-0.5">{course.name}</h3>
                      <p className="text-slate-500 text-xs mt-1">Unis: {course.unis} | Criteria: {course.criteria}</p>
                    </div>
                    <div className="text-left md:text-right shrink-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                      <span className="text-[10px] text-slate-400 font-bold block">Target Career</span>
                      <strong className="text-slate-700 text-xs font-black block mt-0.5">{course.career}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Admission & Eligibility */}
            <section id="admission" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-655" size={24} />
                  📋 Admission & Academic Eligibility
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold mb-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">Academic Standards</h4>
                    <p className="text-slate-500 leading-relaxed mb-2">
                      Accepts **3-Year Indian Bachelor's Degrees** directly for 180-point MA paths. Minimum GPE score requirement of **5.0** (translating to 65% – 75% in Indian college percentages).
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">English Standards</h4>
                    <ul className="space-y-1.5 text-slate-500 leading-relaxed">
                      <li><strong>IELTS Academic:</strong> 6.5 Overall (no band &lt; 6.0)</li>
                      <li><strong>PTE Academic:</strong> 58 Overall minimum</li>
                      <li><strong>TOEFL iBT:</strong> 90 (minimum 20 in writing)</li>
                    </ul>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-2">Indian College Percentage</th>
                        <th className="pb-2 text-right">GPE (NZ Grade Point Equivalent Scale)</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 font-bold divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5">75%+</td>
                        <td className="py-2.5 text-right text-indigo-650">6.0 – 7.0</td>
                      </tr>
                      <tr>
                        <td className="py-2.5">70% – 75%</td>
                        <td className="py-2.5 text-right text-indigo-650">5.0 – 6.0 (Recommended target)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5">65% – 70%</td>
                        <td className="py-2.5 text-right text-indigo-650">4.0 – 5.0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 4. Cost of Studying */}
            <section id="costs" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  Cost of Studying & City living schedules
                </h2>

                {/* Currency Selector */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-[24px] p-5 shadow-xs mb-8 flex justify-end">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold mb-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-3">Est. Monthly Cost by City</h4>
                    <div className="space-y-3">
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Auckland:</span> <strong>NZ$1,800 – $2,500 (₹94K – ₹1.3L)</strong></p>
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Wellington:</span> <strong>NZ$1,600 – $2,200 (₹84K – ₹1.1L)</strong></p>
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Christchurch:</span> <strong>NZ$1,400 – $2,000 (₹73K – ₹1.05L)</strong></p>
                      <p className="flex justify-between"><span>Dunedin:</span> <strong>NZ$1,300 – $1,800 (₹68K – ₹94K)</strong></p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-3">Fee Comparison Schedules</h4>
                    <div className="space-y-3">
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Tuition ranges:</span> <strong>NZ$20,000 – $45,000 / yr</strong></p>
                      <p className="flex justify-between border-b border-slate-200 pb-2"><span>Official Living Proof:</span> <strong>NZ$20,000 / yr</strong></p>
                      <p className="flex justify-between"><span>Health Insurance:</span> <strong>NZ$600 – $900 / yr</strong></p>
                    </div>
                  </div>
                </div>

                <div className="bg-sky-50/50 p-5 rounded-xl border border-sky-100 text-xs text-sky-955 font-semibold">
                  💡 Total program tuition + living averages range between **₹40 Lakhs – ₹50 Lakhs** depending on city and spending styles.
                </div>
              </div>
            </section>

            {/* 5. Scholarships */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Award className="text-indigo-650" size={24} />
                  Available Scholarships for MA
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-1">🌟 NZ Excellence Awards (NZEA)</h4>
                    <p className="text-indigo-650 font-black mb-1">Value: NZ$10,000 – $20,000</p>
                    <p className="text-slate-500">Government scholarships designated for Indian nationals at PG levels.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-1">🎓 Auckland India High Achiever</h4>
                    <p className="text-indigo-655 font-black mb-1">Value: Up to NZ$20,000</p>
                    <p className="text-slate-500">Offered by Auckland University for outstanding Indian applicants (80%+ in UG).</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-1">💼 Otago Global Scholarship</h4>
                    <p className="text-indigo-655 font-black mb-1">Value: NZ$15,000</p>
                    <p className="text-slate-500">Automatically assessed scholarship for incoming Indian passport holders.</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-1">🏛️ Manaaki New Zealand Scholarship</h4>
                    <p className="text-indigo-655 font-black mb-1">Value: Full Funding</p>
                    <p className="text-slate-500">Government funded. Covers tuition, monthly allowances, airfare and health insurance.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Visa Requirements */}
            <section id="visa" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-650" size={24} />
                  🛂 MA Student Visa Requirements
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 mb-2">Fee-Paying Student Visa</h4>
                    <p className="text-slate-500 leading-relaxed mb-2">
                      Application fee starts from **NZD 750**. Allows 25 hours weekly work rights during active semesters.
                    </p>
                    <p className="text-slate-500 leading-relaxed">
                      Must provide proof of access to **NZD 20,000 (₹10.4 Lakhs)** for first year living expenses + tuition.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 mb-2">Post-Study stay options</h4>
                    <p className="text-slate-500 leading-relaxed">
                      Level 9 MA graduates receive a **3-year open post-study work visa**, which is not tied to any specific Kiwi employer.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Careers & Salaries */}
            <section id="careers" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Briefcase className="text-indigo-650" size={24} />
                  MA Careers & Entry Salaries (2026)
                </h2>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">MA Domain</th>
                        <th className="pb-3 pr-4">Job Role</th>
                        <th className="pb-3 pr-4 text-right">Entry Salary (NZD / INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705 font-semibold">
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Psychology</td>
                        <td className="py-4 text-slate-600">Clinical / Counseling Psychologist</td>
                        <td className="py-4 text-right text-indigo-650">$70,000 - $80,000 (₹36L - ₹42L)</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Public Policy & IR</td>
                        <td className="py-4 text-slate-600">Policy Analyst, Researcher</td>
                        <td className="py-4 text-right text-indigo-650">$60,000 - $75,000 (₹31L - ₹39L)</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Education</td>
                        <td className="py-4 text-slate-600">Secondary Teacher, Manager</td>
                        <td className="py-4 text-right text-indigo-650">$55,000 - $65,000 (₹28L - ₹34L)</td>
                      </tr>
                      <tr>
                        <td className="py-4 text-slate-900 font-extrabold">Media & Comm</td>
                        <td className="py-4 text-slate-600">Media Advisor, Communications Officer</td>
                        <td className="py-4 text-right text-indigo-650">$50,000 - $62,000 (₹26L - ₹32L)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-sky-50/50 p-5 rounded-xl border border-sky-100 text-xs text-sky-955 font-semibold">
                  <strong>💡 Top Employers:</strong> Ministry of Education, Ministry of Social Development, Red Cross NZ, Regional secondary schools, Robert Walters, and Ara Institute.
                </div>
              </div>
            </section>

            {/* 8. Residency Roadmap */}
            <section id="residency" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-[2rem] p-8">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                  <Compass className="text-indigo-300" size={24} />
                  2026 Residency Roadmap for MA Graduates
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold mb-6">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                    <h4 className="text-indigo-300 font-bold mb-2">The 6-Point SMC System</h4>
                    <p className="text-slate-300 leading-relaxed mb-2">
                      Immigration New Zealand's Skilled Migrant Category (SMC) gives a Level 9 Master's degree **FULL 6 POINTS**.
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      This allows graduates to apply for permanent residency (PR) immediately upon securing a skilled job offer, bypassing other point requirements.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                    <h4 className="text-indigo-300 font-bold mb-2">Green List Fast-Track</h4>
                    <p className="text-slate-300 leading-relaxed mb-2">
                      <strong>Tier 1 (Straight to Residence):</strong> Educational Psychologists apply for PR immediately.
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      <strong>Tier 2 (Work to Residence):</strong> Secondary School Teachers and Social Workers apply for PR after 2 years of local work experience.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about NZ MA programs</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "Is a 3-year degree valid for an MA in New Zealand?", a: "Yes. A 3-year BA from India is generally sufficient for 180-point MA programs, which take approximately 1.5 years to complete." },
                  { q: "How much can I earn with the 25-hour rule?", a: "At the 2026 minimum wage, students can earn approximately NZD 575 – 600 (₹30,000) per week before tax." },
                  { q: "Can I get Permanent Residency after an MA?", a: "Yes. Level 9 degrees provide a full 6 points under the Skilled Migrant Category (SMC) system, allowing you to apply for PR as soon as you secure a skilled job offer." },
                  { q: "What is the GPE requirement?", a: "Most public universities require a 5.0 GPE, which translates to approximately 65% – 75% in Indian percentage terms." },
                  { q: "Can my family join me on a student visa?", a: "Yes. As a Level 9 MA student, your partner is eligible for an open work visa, and children can study in local public schools under domestic student rates." }
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

export default NewZealandMACourse;
