import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle2, ArrowRight, Table, AlertCircle, Sparkles, 
  Building, ListFilter, HelpCircle, ChevronDown, Award, Globe, DollarSign, 
  BookOpen, Compass, ShieldCheck, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'overview', title: 'Why New Zealand in 2026?' },
  { id: 'available-intakes', title: 'Available Intakes' },
  { id: 'comparison', title: 'Feb vs July Comparison' },
  { id: 'february-intake', title: 'February 2026 Intake' },
  { id: 'july-intake', title: 'July 2026 Intake' },
  { id: 'rolling-intakes', title: 'Rolling Intakes' },
  { id: 'deadlines', title: 'University Deadlines' },
  { id: 'visa-changes', title: 'Student Visa Changes' },
  { id: 'choose', title: 'How to Choose' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const universityDeadlines = [
  { name: "University of Auckland", feb: "Dec 8, 2025", july: "Jul 4, 2026" },
  { name: "University of Otago", feb: "Oct 31, 2025", july: "Apr 30, 2026" },
  { name: "Victoria University of Wellington", feb: "Dec 1, 2025", july: "May 1, 2026" },
  { name: "University of Canterbury", feb: "Nov 15, 2025", july: "May 1, 2026" },
  { name: "Massey University", feb: "Dec 15, 2025", july: "May 1, 2026" },
  { name: "University of Waikato", feb: "Dec 1, 2025", july: "May 31, 2026" },
  { name: "Lincoln University", feb: "Dec 1, 2025", july: "May 31, 2026" },
  { name: "Auckland University of Technology (AUT)", feb: "Dec 1, 2025", july: "May 31, 2026" }
];

const intakeComparison = [
  { feature: "Course Availability", feb: "100% (All courses open)", july: "70-80% (Most courses open)" },
  { feature: "Competition", feb: "High", july: "Low" },
  { feature: "Scholarships", feb: "Maximum Availability", july: "Limited Availability" },
  { feature: "Visa Risk", feb: "High (Peak Season)", july: "Low (Off-Peak Season)" },
  { feature: "Social Life", feb: "Full cohort", july: "Smaller cohort" },
  { feature: "Preparation Time", feb: "Less time", july: "More time" },
  { feature: "Weather on Arrival", feb: "Summer (Warm)", july: "Winter (Cold)" }
];

const NewZealandIntakes = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [faqOpen, setFaqOpen] = useState({});

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
          <span className="text-slate-600 font-bold">Intakes Guide 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&auto=format&fit=crop&q=80" 
              alt="New Zealand Landscape" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Calendar size={14} />
              New Zealand Guide 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              New Zealand Intakes 2026: Complete Guide for Indian Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              While other countries tighten rules, New Zealand is opening doors. Learn about application cycles, visa changes, work rights, and step-by-step milestones.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: December 23, 2025
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                6 min read
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
            
            {/* 1. Why New Zealand in 2026 */}
            <section id="overview" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-sky-50/40 to-indigo-50/40 border border-indigo-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={22} />
                  💡 Why New Zealand in 2026?
                </h2>
                <p className="text-slate-650 text-sm font-semibold leading-relaxed mb-6">
                  While other traditional study abroad destinations are tightening student caps and work rights, New Zealand is actively opening doors for international students. 
                  The biggest news for 2026? Student work rights have officially increased to **25 hours per week**—allowing you to cover more expenses while studying. 
                  Additionally, a new India-New Zealand partnership has launched to ensure a smoother, faster student visa processing pipeline.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "25 hours/week work rights (up from 20)",
                    "3-year post-study work visa (PSWV)",
                    "Smoother visa process for Indian applicants",
                    "8 world-class universities (all in QS Top 500)",
                    "Safe, peaceful, and welcoming environment"
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
                <h2 className="text-2xl font-black text-slate-900 mb-1">Available Intakes in New Zealand (2026)</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Choose your academic starting point</p>
              </div>

              <div className="space-y-6">
                {/* Feb Intake Card */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                      Main Intake
                    </span>
                    <span className="text-xs font-bold text-slate-400">Semester 1</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2">February 2026 Intake</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">
                    The primary academic cycle in New Zealand. Ideal for students who completed their previous qualifying studies in mid-2025 and want maximum program selections.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block">Starts</span>
                      <strong className="text-slate-800 font-extrabold mt-0.5 block">February 2026</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Courses</span>
                      <strong className="text-slate-800 font-extrabold mt-0.5 block">100% Available</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Scholarships</span>
                      <strong className="text-slate-800 font-extrabold mt-0.5 block">Maximum Availability</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Visa Process</span>
                      <strong className="text-amber-600 font-extrabold mt-0.5 block">Peak Season</strong>
                    </div>
                  </div>
                </div>

                {/* July Intake Card */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                      Mid-Year Intake
                    </span>
                    <span className="text-xs font-bold text-slate-400">Semester 2</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2">July 2026 Intake</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">
                    A great alternative for students who need more time to prepare transcripts, secure education loans, or study for language proficiency tests.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block">Starts</span>
                      <strong className="text-slate-800 font-extrabold mt-0.5 block">July 2026</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Courses</span>
                      <strong className="text-slate-800 font-extrabold mt-0.5 block">70-80% Available</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Scholarships</span>
                      <strong className="text-slate-800 font-extrabold mt-0.5 block">Limited</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Visa Process</span>
                      <strong className="text-emerald-600 font-extrabold mt-0.5 block">Off-Peak (Faster)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Feb vs July Intake Comparison */}
            <section id="comparison" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/65 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Table className="text-indigo-650" size={22} />
                  February vs. July 2026 Quick Comparison
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Side-by-side comparison for Semester 1 and Semester 2</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Feature</th>
                        <th className="pb-3 pr-4">February 2026</th>
                        <th className="pb-3 pr-4 text-right">July 2026</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {intakeComparison.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-900 font-extrabold">{row.feature}</td>
                          <td className="py-4 text-slate-600 font-medium">{row.feb}</td>
                          <td className="py-4 text-right text-slate-655 font-medium">{row.july}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 4. February 2026 Intake */}
            <section id="february-intake" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">February 2026 Intake (The "Main Event")</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Everything you need to know about Semester 1</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Pros */}
                <div className="bg-emerald-50/40 border border-emerald-100 p-6 rounded-2xl">
                  <h3 className="font-black text-emerald-800 text-sm mb-4 flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Pros of February Intake
                  </h3>
                  <ul className="space-y-3 text-xs font-semibold text-slate-650">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>100% course availability: All degree programs and majors are open.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>Maximum scholarship access: University and government funds are fully open.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>Full orientation week: Best social and cultural networking experience.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>Largest cohort of incoming international peers.</span>
                    </li>
                  </ul>
                </div>

                {/* Cons */}
                <div className="bg-rose-50/40 border border-rose-100 p-6 rounded-2xl">
                  <h3 className="font-black text-rose-800 text-sm mb-4 flex items-center gap-1.5">
                    <AlertCircle size={16} className="text-rose-600" />
                    Cons of February Intake
                  </h3>
                  <ul className="space-y-3 text-xs font-semibold text-slate-650">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600">•</span>
                      <span>Peak visa season: Longer student visa queues (Oct-March).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600">•</span>
                      <span>Highest competition: More candidates applying for popular programs.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600">•</span>
                      <span>On-campus accommodation fills up very quickly.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6">
                <h3 className="font-black text-slate-800 text-sm mb-6 flex items-center gap-2">
                  <Clock size={16} className="text-indigo-600" />
                  Application Timeline for February 2026
                </h3>
                <div className="relative border-l-2 border-indigo-100 pl-6 ml-4 space-y-6">
                  {[
                    { date: "Apr – Jun 2025", title: "Research & Program Shortlisting", desc: "Select universities and review prerequisite criteria." },
                    { date: "Jul – Sep 2025", title: "Standardized Testing", desc: "Sit for IELTS or PTE Academic and secure test scorecards." },
                    { date: "Aug – Oct 2025", title: "Submit Applications", desc: "Upload academic credentials and apply for scholarships." },
                    { date: "Nov 2025 – Jan 2026", title: "Offers & Student Visa", desc: "Secure 'Offer of Place', settle fees, and submit visa application." },
                    { date: "Feb 2026", title: "🎉 Term Commences", desc: "Fly to New Zealand and start classes!" }
                  ].map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white" />
                      <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wider block mb-0.5">{step.date}</span>
                      <h4 className="text-xs font-black text-slate-850">{step.title}</h4>
                      <p className="text-slate-500 text-xs font-medium leading-relaxed mt-1">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. July 2026 Intake */}
            <section id="july-intake" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">July 2026 Intake (The "Smart Alternative")</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Mid-year study choices in Semester 2</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Pros */}
                <div className="bg-emerald-50/40 border border-emerald-100 p-6 rounded-2xl">
                  <h3 className="font-black text-emerald-800 text-sm mb-4 flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Pros of July Intake
                  </h3>
                  <ul className="space-y-3 text-xs font-semibold text-slate-655">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>Off-peak visa window: Faster student visa processing in April-June.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>More preparation time: Complete academic transcripts and finances comfortably.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>Smaller class sizes: Promotes better interactive mentoring with professors.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600">•</span>
                      <span>Slightly less competition for admissions in popular subjects.</span>
                    </li>
                  </ul>
                </div>

                {/* Cons */}
                <div className="bg-rose-50/40 border border-rose-100 p-6 rounded-2xl">
                  <h3 className="font-black text-rose-800 text-sm mb-4 flex items-center gap-1.5">
                    <AlertCircle size={16} className="text-rose-600" />
                    Cons of July Intake
                  </h3>
                  <ul className="space-y-3 text-xs font-semibold text-slate-655">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600">•</span>
                      <span>Limited courses: Only 70-80% of programs have active mid-year intakes.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600">•</span>
                      <span>Winter arrival: July is the coldest month of the year.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600">•</span>
                      <span>Fewer open institutional scholarship grants.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6">
                <h3 className="font-black text-slate-800 text-sm mb-6 flex items-center gap-2">
                  <Clock size={16} className="text-indigo-600" />
                  Application Timeline for July 2026
                </h3>
                <div className="relative border-l-2 border-indigo-100 pl-6 ml-4 space-y-6">
                  {[
                    { date: "Aug – Dec 2025", title: "Preparation Phase", desc: "Shortlist courses and sit for PTE / IELTS exams." },
                    { date: "Jan – Mar 2026", title: "Submit Applications", desc: "Submit application packs and await Offer of Place." },
                    { date: "Apr – May 2026", title: "✅ Student Visa Submission", desc: "Safest off-peak window for visa processing." },
                    { date: "June 2026", title: "Accommodation & Flight", desc: "Lock in student housing and book winter travel tickets." },
                    { date: "July 2026", title: "🎉 Term Commences", desc: "Arrive for orientation and start your courses." }
                  ].map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white" />
                      <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wider block mb-0.5">{step.date}</span>
                      <h4 className="text-xs font-black text-slate-850">{step.title}</h4>
                      <p className="text-slate-500 text-xs font-medium leading-relaxed mt-1">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. Rolling Intakes */}
            <section id="rolling-intakes" className="scroll-mt-24">
              <div className="bg-sky-50/50 border border-sky-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-905 mb-3 flex items-center gap-2">
                  <Compass className="text-sky-600" size={22} />
                  📅 Rolling Intakes (The "Flexible Choice")
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  If you missed the strict Semester deadlines of key universities, rolling intakes offer maximum flexibility. These intakes operate with multiple start cycles throughout the year (e.g. March, May, September, and November).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-2">Ideal For:</h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-sky-600 shrink-0" />
                        <span>Vocational training & certificates</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-sky-600 shrink-0" />
                        <span>Level 5/6 Diplomas</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-sky-600 shrink-0" />
                        <span>Foundation pathways</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-2">Limitations:</h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-600">
                      <li className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-rose-500 shrink-0" />
                        <span>Limited to specific institutions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-rose-500 shrink-0" />
                        <span>Not typically for Bachelor's or Research Master's</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-rose-500 shrink-0" />
                        <span>Offered mainly by Polytechnics (Te Pūkenga) & PTEs</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. University Deadlines */}
            <section id="deadlines" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/65 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Building className="text-indigo-650" size={22} />
                  🏛️ University-Wise Deadlines (2026)
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Ensure you apply before dates to secure admission offers</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">University</th>
                        <th className="pb-3 pr-4">February 2026 Deadline</th>
                        <th className="pb-3 pr-4 text-right">July 2026 Deadline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {universityDeadlines.map((uni, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-900 font-extrabold">{uni.name}</td>
                          <td className="py-4 text-slate-600 font-medium">{uni.feb}</td>
                          <td className="py-4 text-right text-slate-655 font-medium">{uni.july}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 8. Student Visa Changes */}
            <section id="visa-changes" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-emerald-600" size={24} />
                  🛂 Student Visa Changes for 2026
                </h2>

                <div className="space-y-6">
                  {/* Work Rights */}
                  <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                    <h3 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider mb-2">💼 Work Rights Update (Effective Nov 3, 2025)</h3>
                    <p className="text-slate-655 text-xs font-bold leading-relaxed">
                      Old: 20 hours/week during term.  
                      <br />
                      <strong className="text-emerald-700 text-sm">NEW: 25 hours/week during term!</strong>
                      <br />
                      That's an extra 5 hours per week of work allowed to support your study and living costs. Full-time work is still permitted during scheduled term breaks and holidays.
                    </p>
                  </div>

                  {/* Financials */}
                  <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <h3 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider mb-2">💰 Financial Requirements</h3>
                    <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                      You must demonstrate a minimum of <strong className="text-slate-900">NZD 20,000 (~₹10.5 Lakhs) per year</strong> for living expenses, in addition to full tuition fees and proof of a return air ticket (or funds to purchase one).
                    </p>
                  </div>

                  {/* PSWV */}
                  <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100">
                    <h3 className="font-extrabold text-blue-900 text-xs uppercase tracking-wider mb-2">⏰ Post-Study Work Visa (PSWV) 2026</h3>
                    <ul className="space-y-2 text-xs font-semibold text-slate-655">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-[#DE5C2B]" />
                        <span>Bachelor's (Level 7): <strong>3 Years</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-[#DE5C2B]" />
                        <span>Master's (Level 9): <strong>3 Years</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-[#DE5C2B]" />
                        <span>PhD (Level 10): <strong>3 Years</strong></span>
                      </li>
                    </ul>
                  </div>

                  {/* Documents */}
                  <div>
                    <h3 className="font-black text-slate-800 text-sm mb-4">📋 Essential Document Checklist</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "Offer of Place from university",
                        "Proof of Funds (tuition + NZD 20k)",
                        "Police Clearance Certificate (PCC)",
                        "Medical Certificate (Chest X-Ray)",
                        "Passport (with 3+ months validity)",
                        "English test scorecard (IELTS/PTE)"
                      ].map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-700">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. How to Choose */}
            <section id="choose" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-[2rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <h2 className="text-2xl font-black mb-6 relative z-10">🎯 How to Choose the Best Intake</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h3 className="font-black text-indigo-300 text-sm mb-4">Choose February 2026 if:</h3>
                    <ul className="space-y-3 text-xs font-medium text-white/80">
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You want maximum course selections.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You want maximum scholarship choices.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You completed studies by mid-2025.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You already have test scores ready.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h3 className="font-black text-indigo-300 text-sm mb-4">Choose July 2026 if:</h3>
                    <ul className="space-y-3 text-xs font-medium text-white/80">
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You missed the February deadlines.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You need more time to process loans/finances.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You want faster, off-peak visa processing.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You want lower competition and smaller classes.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about New Zealand intake cycles</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "Which is the best intake for New Zealand?", a: "February is the best intake if you want maximum program choices and scholarship opportunities. July is the best choice if you need more time for preparations or want a faster visa process." },
                  { q: "When should I apply for the Feb 2026 intake?", a: "You should start preparing your applications by August 2025. Most universities close applications by December 1, 2025. Apply early to secure your offer letter." },
                  { q: "Can I work while studying in the 2026 intakes?", a: "Yes. Under the new rules effective late 2025, international students can work up to 25 hours per week during academic semesters, and full-time during vacations." },
                  { q: "What is the duration of the Post-Study Work Visa?", a: "Bachelor's degrees, Master's degrees, and PhD programs all grant a standard 3-year Post-Study Work Visa (PSWV) in New Zealand." },
                  { q: "How long does it take to process a NZ Student Visa?", a: "Average visa processing times range between 30 to 45 working days (~6-8 weeks). The July intake offers faster off-peak processing." },
                  { q: "What is the minimum financial proof required?", a: "You must demonstrate NZD 20,000 (~₹10.5 Lakhs) for living expenses per year, plus tuition fees and return airfare." }
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

export default NewZealandIntakes;
