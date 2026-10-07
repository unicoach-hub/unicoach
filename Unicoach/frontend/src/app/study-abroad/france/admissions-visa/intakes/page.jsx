import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle2, ArrowRight, Table, AlertCircle, Sparkles, 
  Building, ListFilter, HelpCircle, ChevronDown, Award, Globe, DollarSign, 
  BookOpen, Compass, ShieldCheck, Check, ShieldAlert, Coins, Users, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'overview', title: 'Why France in 2026-27?' },
  { id: 'available-intakes', title: 'Available Intakes' },
  { id: 'comparison', title: 'September vs January' },
  { id: 'september-intake', title: 'September Intake (Fall)' },
  { id: 'january-intake', title: 'January Intake (Spring)' },
  { id: 'popular-courses', title: 'Popular Courses' },
  { id: 'requirements', title: 'Entry Requirements' },
  { id: 'documents', title: 'Required Checklist' },
  { id: 'cost', title: 'Cost of Studying' },
  { id: 'scholarships', title: 'Scholarships' },
  { id: 'apply', title: 'How to Apply' },
  { id: 'mistakes', title: 'Mistakes to Avoid' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const intakeComparison = [
  {
    factor: "Application Window",
    september: "March to July / August",
    january: "August to November"
  },
  {
    factor: "Program Availability",
    september: "All disciplines (Engineering, Arts, Business, Sciences)",
    january: "Mainly MBA & select specialized Business Masters"
  },
  {
    factor: "Scholarship Access",
    september: "Full access (Eiffel, Charpak, Erasmus, France Excellence)",
    january: "Highly limited or university-specific only"
  },
  {
    factor: "Competition Level",
    september: "Higher (Volume of international applications is peaked)",
    january: "Lower (Niche candidates and mid-year entries)"
  },
  {
    factor: "Aligns with Indian Calendar",
    september: "Yes - natural transition after May/June graduation",
    january: "Partial - requires a short gap semester"
  },
  {
    factor: "Visa Processing Window",
    september: "Comfortable (Apply by June/July to avoid peak rush)",
    january: "Tight (6-8 week window from offer to class start)"
  }
];

const septemberUnis = [
  { name: "HEC Paris", courses: "MBA, Master in Management (MiM), Finance" },
  { name: "École Polytechnique", courses: "Engineering, Applied Mathematics, Data Science" },
  { name: "Sorbonne University", courses: "Arts, Natural Sciences, Humanities" },
  { name: "CentraleSupélec", courses: "Advanced Engineering, AI, Energy Systems" },
  { name: "Sciences Po", courses: "International Affairs, Public Policy, Economics" },
  { name: "ESSEC Business School", courses: "Business Analytics, MiM, Global MBA" },
  { name: "University of Paris-Saclay", courses: "Physics, Engineering, Artificial Intelligence" },
  { name: "SKEMA Business School", courses: "International Business, Finance, MSc" },
  { name: "EDHEC Business School", courses: "Finance, Strategy, Entrepreneurship" }
];

const januaryUnis = [
  { name: "INSEAD", courses: "MBA (January Cohort)" },
  { name: "HEC Paris", courses: "MBA (Select cohorts)" },
  { name: "ESSEC Business School", courses: "Master in Management, MSc" },
  { name: "EM Lyon Business School", courses: "Global MBA, MSc" },
  { name: "SKEMA Business School", courses: "International Business, Finance, MSc" },
  { name: "NEOMA Business School", courses: "MSc Management, Finance, Marketing" },
  { name: "Grenoble École de Management", courses: "MSc International Business, MBA" },
  { name: "Rennes School of Business", courses: "MSc Strategic Management, Finance" }
];

const entryRequirements = [
  { level: "Undergraduate (Licence)", academic: "Class 12: 60-70% (Recognized board)", language: "DELF B2 or IELTS 6.0+" },
  { level: "Master's", academic: "Bachelor's degree: 60%+ (Top schools: 65-75%)", language: "DELF B2 or IELTS 6.0 - 6.5" },
  { level: "MBA", academic: "Bachelor's degree + 2-5 years experience (60%+ GPA)", language: "IELTS 6.5+ or TOEFL 90+ (GMAT required)" },
  { level: "PhD", academic: "Master's degree + Research proposal", language: "Varies by supervisor & topic" }
];

const scholarships = [
  { name: "Eiffel Excellence Scholarship", level: "Master's, PhD", benefits: "€1,181/month allowance + return travel tickets + health insurance" },
  { name: "France Excellence Scholarship", level: "Master's", benefits: "€860-€1,000/month allowance + student visa fee waiver + housing aid" },
  { name: "Charpak Scholarship", level: "UG, Master's", benefits: "Tuition fee support + €700-€860/month living allowance" },
  { name: "Erasmus Mundus Joint Masters", level: "Master's", benefits: "Full tuition coverage + €1,000/month living allowance + travel costs" },
  { name: "Ambassade de France Scholarship", level: "UG, Master's", benefits: "Partial or full tuition coverage + monthly living allowance" }
];

const FranceIntakes = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedTimeline, setSelectedTimeline] = useState('september'); // 'september' | 'january'
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [faqOpen, setFaqOpen] = useState({});
  const exchangeRate = 106.70; // Reference 1 EUR ≈ 106.70 INR

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = Math.round(valInEUR * exchangeRate);
    return `₹ ${valInINR.toLocaleString()}`;
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

  const timelineSteps = {
    september: [
      { date: "Oct – Nov 2026", title: "EEF Portal Opens", desc: "Create an account on the Études en France (EEF) portal, compile transcripts, and shortlist target universities." },
      { date: "Dec 2026 – Jan 2027", title: "Submit Applications", desc: "Complete academic profiles, upload certified documents, and submit applications directly on the portal." },
      { date: "Feb – Apr 2027", title: "Admission Decisions", desc: "Receive conditional or unconditional admission offers and confirm your preferred seat." },
      { date: "Mar – May 2027", title: "Campus France Interview", desc: "Book and attend the mandatory academic validation interview at your nearest local office in India." },
      { date: "May – Jul 2027", title: "Visa Processing", desc: "Pay Campus France fees, schedule a biometric appointment with VFS Global, and submit student visa documents." },
      { date: "September 2027", title: "🎉 Classes Begin", desc: "Fly to France, settle into student housing, and validate your VLS-TS visa online." }
    ],
    january: [
      { date: "Jun – Aug 2026", title: "Research & Prep", desc: "Finalize GMAT, GMAT Focus, or English scorecards (IELTS/PTE), and gather professional recommendations." },
      { date: "Aug – Oct 2026", title: "Submit Applications", desc: "Submit application packs through the university portals or the EEF portal for mid-year intakes." },
      { date: "Oct – Nov 2026", title: "Admission Decisions", desc: "Acknowledge and accept admission offers immediately. Cohorts are small and fill up very fast." },
      { date: "Nov – Dec 2026", title: "Campus France Interview", desc: "Book and complete the mandatory academic interview immediately upon accepting the offer." },
      { date: "Dec 2026 – Jan 2027", title: "Visa Processing (TIGHT!)", desc: "File your visa the same week you receive your interview clearance. Processing is extremely tight." },
      { date: "Jan / Feb 2027", title: "🎉 Classes Begin", desc: "Arrive in France for your spring cohort orientation and validate your visa." }
    ]
  };

  return (
    <div className="min-h-screen bg-[#fafcff] pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <Link to="/study-abroad/france" className="hover:text-indigo-650 transition-colors">France</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <span className="text-slate-600 font-bold">Intakes Guide 2026/27</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80" 
              alt="France Landscape" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Calendar size={14} />
              France Intake Guide 2026/27
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              France Intakes 2026-27: Complete Guide for International Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              The French government has set a target of hosting 30,000 Indian students by 2030. Learn about application cycles, visa rules, scholarship opportunities, and key deadlines.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: March 11, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                14 min read
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
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Intakes Navigator</span>
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
            
            {/* 1. Why France in 2026-27 */}
            <section id="overview" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-sky-50/40 to-indigo-50/40 border border-indigo-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={22} />
                  💡 Why Study in France in 2026-27?
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  Close to 9,500 Indian students were enrolled in French universities in 2024. The French government has set a goal of increasing Indian student enrolment to 30,000 by 2030. As a result, French institutions are introducing additional scholarship opportunities, expanding English-taught programs, and offering a unique 5-year post-study Schengen alumni visa.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Targeting 30,000 Indian students by 2030",
                    "Expanded English-taught courses",
                    "Exceptional scholarship funds (Eiffel & Charpak)",
                    "5-Year Short-Stay Schengen Alumni Visa",
                    "Up to 20 hours/week part-time work rights"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100">
                      <Check className="text-teal-600 shrink-0" size={16} strokeWidth={3} />
                      <span className="text-xs font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Available Intakes */}
            <section id="available-intakes" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📅 How Many Intakes Does France Have?</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Choose between the primary Fall and secondary Spring cycles</p>
              </div>

              <div className="space-y-6">
                {/* September Intake Card */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                      Primary Intake (Fall)
                    </span>
                    <span className="text-xs font-bold text-slate-400">Semester 1</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2">September Intake 2026-27</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">
                    The biggest intake in France. Open for almost all courses across disciplines at both public and private universities. Aligns perfectly with the Indian academic calendar.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block">Start Month</span>
                      <strong className="text-slate-800 font-extrabold mt-0.5 block">Sept – Oct 2027</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Program Choice</span>
                      <strong className="text-slate-800 font-extrabold mt-0.5 block">Maximum (All courses)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Scholarships</span>
                      <strong className="text-emerald-700 font-extrabold mt-0.5 block">Full Access</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Visa Timeline</span>
                      <strong className="text-slate-850 font-extrabold mt-0.5 block">Comfortable</strong>
                    </div>
                  </div>
                </div>

                {/* January Intake Card */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                      Secondary Intake (Spring)
                    </span>
                    <span className="text-xs font-bold text-slate-400">Semester 2</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2">January Intake 2026-27</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">
                    A secondary cycle ideal for business, management, and MBA aspirants. Public universities rarely open full programs in this intake.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block">Start Month</span>
                      <strong className="text-slate-800 font-extrabold mt-0.5 block">Jan – Feb 2027</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Program Choice</span>
                      <strong className="text-slate-800 font-extrabold mt-0.5 block">Limited (Mainly MBA)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Scholarships</span>
                      <strong className="text-slate-800 font-extrabold mt-0.5 block">Highly Limited</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Visa Timeline</span>
                      <strong className="text-amber-600 font-extrabold mt-0.5 block">Very Tight</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. September vs January comparison */}
            <section id="comparison" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/65 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Table className="text-indigo-650" size={22} />
                  September vs. January: Key Differences
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Compare application windows, competition levels, and alignment side-by-side</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Comparison Factor</th>
                        <th className="pb-3 pr-4">September Intake</th>
                        <th className="pb-3 pr-4 text-right">January Intake</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705 font-semibold">
                      {intakeComparison.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-900 font-extrabold">{row.factor}</td>
                          <td className="py-4 text-slate-655 font-medium">{row.september}</td>
                          <td className="py-4 text-right text-slate-655 font-medium">{row.january}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 4. September Intake (Fall) */}
            <section id="september-intake" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🍂 September Intake 2026-27 (Primary Intake)</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Timeline and top participating universities</p>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 mb-8">
                <h3 className="font-black text-slate-805 text-sm mb-6 flex items-center gap-2">
                  <Clock size={16} className="text-indigo-600" />
                  September Timeline Milestones
                </h3>
                <div className="relative border-l-2 border-indigo-100 pl-6 ml-4 space-y-6">
                  {timelineSteps.september.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white" />
                      <span className="text-[10px] font-black text-indigo-655 uppercase tracking-wider block mb-0.5">{step.date}</span>
                      <h4 className="text-xs font-black text-slate-850">{step.title}</h4>
                      <p className="text-slate-550 text-xs font-medium leading-relaxed mt-1">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-xs">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-1.5">
                  <Building size={18} className="text-indigo-600" />
                  Top September Intake Universities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {septemberUnis.map((uni, idx) => (
                    <div key={idx} className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 hover:border-indigo-400 transition-colors">
                      <p className="font-black text-slate-850 text-sm">{uni.name}</p>
                      <p className="text-xs text-indigo-655 font-bold">Programs: {uni.courses}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. January Intake (Spring) */}
            <section id="january-intake" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🌸 January Intake 2026-27 (Spring Intake)</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Timeline and options for management students</p>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 mb-8">
                <h3 className="font-black text-slate-805 text-sm mb-6 flex items-center gap-2">
                  <Clock size={16} className="text-indigo-600" />
                  January Timeline Milestones
                </h3>
                <div className="relative border-l-2 border-indigo-100 pl-6 ml-4 space-y-6">
                  {timelineSteps.january.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white" />
                      <span className="text-[10px] font-black text-indigo-655 uppercase tracking-wider block mb-0.5">{step.date}</span>
                      <h4 className="text-xs font-black text-slate-850">{step.title}</h4>
                      <p className="text-slate-550 text-xs font-medium leading-relaxed mt-1">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-rose-50/50 border border-rose-200/50 rounded-[32px] p-6 md:p-8 mb-8 flex items-start gap-4">
                <AlertCircle size={24} className="text-rose-600 shrink-0 mt-1" />
                <div className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed">
                  <h4 className="font-black text-slate-905 mb-1 text-rose-900">Visa Timeline Warning for January Cohorts</h4>
                  Admissions offers for Spring cohorts are typically finalized around October or November. This leaves a very narrow window of 6 to 8 weeks for both Campus France interviews and VFS biometrics validation. Start transcript translations early.
                </div>
              </div>

              <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-xs">
                <h3 className="text-lg font-black text-slate-905 mb-6 flex items-center gap-1.5">
                  <Building size={18} className="text-indigo-600" />
                  Top January Intake Universities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {januaryUnis.map((uni, idx) => (
                    <div key={idx} className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 hover:border-indigo-400 transition-colors">
                      <p className="font-black text-slate-850 text-sm">{uni.name}</p>
                      <p className="text-xs text-indigo-655 font-bold">Programs: {uni.courses}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. Popular Courses Available */}
            <section id="popular-courses" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <BookOpen className="text-indigo-650" size={24} />
                  📚 Popular Courses in France Intakes
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business & Mgt */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-805 text-sm uppercase tracking-wider mb-3">📊 Business & Management</h4>
                      <ul className="space-y-1.5 text-xs text-slate-655 font-semibold">
                        <li>• MBA and Global MBA</li>
                        <li>• Master in Management (MiM)</li>
                        <li>• Finance and FinTech</li>
                        <li>• Luxury Brand Management</li>
                        <li>• Hospitality and Tourism</li>
                      </ul>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Starting Salary</span>
                      <strong className="text-slate-900 text-lg font-black block">€32,000 – €40,000 / yr</strong>
                    </div>
                  </div>

                  {/* Tech & Eng */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-805 text-sm uppercase tracking-wider mb-3">💻 Technology & Engineering</h4>
                      <ul className="space-y-1.5 text-xs text-slate-655 font-semibold">
                        <li>• Data Science & AI</li>
                        <li>• Mechanical & Aerospace Eng.</li>
                        <li>• Computer Science & Software</li>
                        <li>• Electrical Engineering</li>
                        <li>• Engineering Management</li>
                      </ul>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Starting Salary</span>
                      <strong className="text-slate-900 text-lg font-black block">€35,000 – €45,000 / yr</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Entry Requirements */}
            <section id="requirements" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/65 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Award className="text-indigo-650" size={22} />
                  📋 Entry Requirements for France
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Prerequisite scores required for university admissions</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Study Level</th>
                        <th className="pb-3 pr-4">Academic Score</th>
                        <th className="pb-3 pr-4 text-right">Language Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705 font-semibold">
                      {entryRequirements.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-900 font-extrabold">{row.level}</td>
                          <td className="py-4 text-slate-600 font-medium">{row.academic}</td>
                          <td className="py-4 text-right text-indigo-650 font-black">{row.language}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 8. Required Checklist */}
            <section id="documents" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-650" size={24} />
                  📂 Required Documents Checklist
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Prepare these records in advance before beginning applications</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Valid passport (valid for course + 15 months)",
                    "Class 10 mark sheet and passing certificate",
                    "Class 12 mark sheet and certificate",
                    "Bachelor degree + transcript records (for PG)",
                    "IELTS (6.0-6.5) or TOEFL (79-90) scorecard",
                    "DELF B2 / DALF C1 certificate (French-taught)",
                    "Statement of Purpose (SOP)",
                    "2 or 3 Letters of Recommendation (LORs)",
                    "Updated CV / Academic Resume",
                    "Bank statements (€10,000-€12,000 living reserve)",
                    "GMAT / GRE scores (Grandes Écoles business)",
                    "Portfolio (Architecture & Design applicants)"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 9. Cost of Studying */}
            <section id="cost" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  💰 Tuition Fees & Cost of Studying
                </h2>

                {/* Currency Switcher */}
                <div className="flex justify-start mb-6">
                  <div className="bg-slate-50 border border-slate-200/60 p-1 rounded-xl inline-flex items-center gap-1">
                    <button 
                      onClick={() => setCurrency('EUR')}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currency === 'EUR' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      EUR (€)
                    </button>
                    <button 
                      onClick={() => setCurrency('INR')}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currency === 'INR' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      INR (₹)
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Public Univ Fees (Bachelor)</span>
                      <strong className="text-slate-900 text-sm font-black mt-1 block">{formatCost(2770)} / yr</strong>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Public Univ Fees (Master)</span>
                      <strong className="text-slate-905 text-sm font-black mt-1 block">{formatCost(3770)} / yr</strong>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">Private / Business (Avg)</span>
                      <strong className="text-slate-905 text-sm font-black mt-1 block">{formatCost(8000)} – {formatCost(25000)} / yr</strong>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <h3 className="font-extrabold text-slate-805 text-xs mb-3">Est. Monthly Living Cost by City</h3>
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-4">Location Type</th>
                          <th className="pb-3 pr-4 text-right">Est. Monthly Cost (excl. rent)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-750 font-semibold">
                        {[
                          { name: "Paris (Capital)", min: 1000, max: 1400 },
                          { name: "Lyon / Bordeaux", min: 700, max: 1000 },
                          { name: "Smaller University Cities (Nantes, Lille)", min: 550, max: 850 }
                        ].map((city, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 text-slate-900 font-extrabold">{city.name}</td>
                            <td className="py-4 text-right text-indigo-650 font-black">{formatCost(city.min)} – {formatCost(city.max)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. Scholarships */}
            <section id="scholarships" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/65 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Award className="text-indigo-650" size={22} />
                  🏆 Scholarships for Indian Students
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Government and institutional grants available for Fall intake</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Scholarship</th>
                        <th className="pb-3 pr-4">Target Level</th>
                        <th className="pb-3 pr-4 text-right">Major Benefits</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {scholarships.map((sch, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-900 font-extrabold">{sch.name}</td>
                          <td className="py-4 text-slate-600 font-medium">{sch.level}</td>
                          <td className="py-4 text-right text-indigo-650 font-black text-xs max-w-xs">{sch.benefits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 11. How to Apply */}
            <section id="apply" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📝 How to Apply for France Intakes</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Two application pathways for Indian candidates</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Method 1 */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6">
                  <h3 className="font-black text-slate-800 text-sm mb-4 flex items-center gap-1.5">
                    <Building size={16} className="text-indigo-600" />
                    Pathway 1: Direct Application
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">
                    Used primarily for private business schools, engineering Grandes Écoles, and specialized certificate courses.
                  </p>
                  <div className="space-y-4">
                    {[
                      { step: "Step 1", desc: "Shortlist courses and prepare application documents." },
                      { step: "Step 2", desc: "Register directly on the university's online admission portal." },
                      { step: "Step 3", desc: "Pay the application fee and submit credentials." },
                      { step: "Step 4", desc: "Attend the university interview and await results." }
                    ].map((m, i) => (
                      <div key={i} className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-indigo-655 font-black text-[10px] uppercase shrink-0 mt-0.5">{m.step}</span>
                        <p className="text-slate-655 text-xs font-semibold">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Method 2 */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6">
                  <h3 className="font-black text-slate-800 text-sm mb-4 flex items-center gap-1.5">
                    <Globe size={16} className="text-indigo-600" />
                    Pathway 2: Campus France (EEF)
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6">
                    Mandatory for public universities and partner Grandes Écoles. Streamlines academic verification and visa pathways.
                  </p>
                  <div className="space-y-4">
                    {[
                      { step: "Step 1", desc: "Create an account on the Études en France portal." },
                      { step: "Step 2", desc: "Upload academic credentials and apply to up to 12 programs." },
                      { step: "Step 3", desc: "Pay the mandatory Campus France fee (~₹18,500)." },
                      { step: "Step 4", desc: "Attend the 30-minute academic interview at Campus France." }
                    ].map((m, i) => (
                      <div key={i} className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-indigo-655 font-black text-[10px] uppercase shrink-0 mt-0.5">{m.step}</span>
                        <p className="text-slate-655 text-xs font-semibold">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 12. Mistakes to Avoid */}
            <section id="mistakes" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldAlert className="text-rose-600 animate-pulse" size={24} />
                  ⚠️ Common Mistakes to Avoid
                </h2>

                <div className="space-y-4">
                  {[
                    { title: "Starting Too Late", desc: "The EEF portal opens in October. Indian students who begin researching in April/May often miss scholarship deadlines and top school slots." },
                    { title: "Ignoring Language Requirements", desc: "Many public programs require French language proficiency. Preparing for and passing DELF B2 takes months. Do not skip checking the medium of instruction." },
                    { title: "Forgetting the DAP Process", desc: "Undergraduate applicants seeking admission to public universities must file a separate Demande d'Admission Préalable (DAP) package early." },
                    { title: "Late Document Translation", desc: "Documents not in English or French must be certified by a translator. This takes 1-2 weeks in India. Do not delay this step." }
                  ].map((pit, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                      <span className="w-6 h-6 rounded-lg bg-rose-100 border border-rose-150 text-rose-650 flex items-center justify-center font-black text-xs shrink-0">!</span>
                      <div>
                        <p className="font-black text-slate-800 text-xs md:text-sm">{pit.title}</p>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">{pit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 13. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about France intake cycles</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "How many intakes in France for international students?", a: "There are two main intakes: September (Fall) - which is the primary intake, and January (Spring) - which is the secondary intake." },
                  { q: "When to apply for the September intake in France?", a: "The EEF portal opens in October/November of the preceding year. Direct university application deadlines generally close between March and July. It is highly recommended to apply by March." },
                  { q: "Which intake is best for international students?", a: "September is the recommended intake. It offers the widest selection of programs, maximum scholarship opportunities, and aligns naturally with the graduation calendar of Indian universities." },
                  { q: "Does France offer a January intake?", a: "Yes, France offers a January intake, but it is highly limited. It is primarily offered by private business schools and for specialized MBA or MSc management cohorts. Many public universities do not open applications for this intake." },
                  { q: "How long does Campus France take to process applications?", a: "Academic verification and interview scheduling typically take 3 to 6 weeks. After that, visa processing at VFS takes another 2 to 4 weeks." }
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
          <StudyAbroadCTA country="France" />
        </div>

      </div>
    </div>
  );
};

export default FranceIntakes;
