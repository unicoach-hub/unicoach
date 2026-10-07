import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, AlertCircle, CheckCircle2, ChevronDown, 
  HelpCircle, Info, FileText, ArrowRight, Coins, BookOpen, AlertTriangle,
  ListFilter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'overview', title: 'Germany Intakes Overview' },
  { id: 'comparison', title: 'Winter vs. Summer Matrix' },
  { id: 'deadlines', title: 'University Deadlines' },
  { id: 'timelines', title: 'Month-by-Month Timelines' },
  { id: 'checklist', title: 'Admissions Checklist' },
  { id: 'troubleshooting', title: 'Roadblocks & Solutions' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const deadlines = [
  { name: "Technical University of Munich (TUM)", date: "May 31, 2026 (Most PG programs)" },
  { name: "LMU Munich", date: "15 July 2026 (International Office deadline)" },
  { name: "RWTH Aachen University", date: "15 July 2026 (Final deadline, all international)" },
  { name: "Technical University of Berlin (TU Berlin)", date: "May 15, 2026 (VPD upload for restricted programs)" },
  { name: "Heidelberg University", date: "April 1 – Sept 30 window (Access-restricted programs vary)" },
  { name: "University of Hamburg", date: "15 June 2026 (Standard Master's); 31 March 2026 (Int'l programs)" },
  { name: "Karlsruhe Institute of Technology (KIT)", date: "15 July 2026 (Non-EU standard); 15 June for CS MSc" }
];

const checklists = [
  { title: "APS Certificate", detail: "Mandatory: obtain before university application. Apply at the APS India portal; fee Rs.19,825 (€180); New Delhi office only." },
  { title: "Academic Transcripts", detail: "All semester mark sheets from classes 10, 12, and bachelor's degree." },
  { title: "Degree / Provisional Certificate", detail: "Final degree or provisional with official registrar letter (accepted by APS and most universities)." },
  { title: "Medium of Instruction (MOI) Letter", detail: "From your undergraduate institution (IELTS alternative at select FH universities)." },
  { title: "IELTS / TOEFL Score Card", detail: "IELTS 6.5 to 7.0 or TOEFL 87+ for most master's programs." },
  { title: "SOP (Statement of Purpose)", detail: "1 to 2 pages, program-specific naming specific modules and research focus." },
  { title: "Letters of Recommendation (LOR)", detail: "2 LORs from academic or professional references on official letterhead." },
  { title: "Blocked Account Confirmation", detail: "Proof of €11,904 deposited. Opened with Fintiba, Expatrio, or Coracle (takes 2 to 4 weeks)." },
  { title: "Europass CV", detail: "1 to 2 pages, clean structure, no photo, no unexplained gaps." },
  { title: "Valid Passport & Insurance", detail: "Passport with minimum 2 blank pages. Arrange health insurance before visa." }
];

const faqs = [
  {
    q: "How many intakes are there in Germany for international students?",
    a: "Germany has two intakes per year. The winter intake (Wintersemester) starts in October and is the primary entry point with the widest program selection, most scholarships, and best alignment with the Indian academic calendar. The summer intake (Sommersemester) starts in April and has fewer programs, with limited availability at public research universities for Engineering and CS."
  },
  {
    q: "What is the winter intake in Germany?",
    a: "The winter intake in Germany (Wintersemester) is the primary admission cycle. Classes begin in October. The standard Uni-Assist deadline is 15 July 2026 for most public universities, but the practical submission target for Indian students is the end of May due to the 4- to 6-week Uni-Assist processing lag. DAAD and most other German scholarship deadlines align with the winter intake."
  },
  {
    q: "What is the summer intake in Germany?",
    a: "The summer intake in Germany (Sommersemester) starts in April at traditional universities and on 1 March at Fachhochschulen. Summer 2026 is closed. The next summer intake is April 2027, with applications opening in November 2026. Engineering and CS Master's programs at most public research universities do not accept international applicants for the summer intake."
  },
  {
    q: "Which intake is better for Germany: winter or summer?",
    a: "The winter intake is the better choice for most Indian students. It offers the widest range of programs, alignment with the Indian graduation calendar (May-to-June completions), more scholarship access, and the highest concentration of English-taught Master's programs. Summer intake is appropriate when a student has missed the winter window and has verified program-level summer availability."
  },
  {
    q: "What is the application deadline for the winter intake in Germany in 2026?",
    a: "The standard deadline for most public universities via Uni-Assist is 15 July 2026. However, TU Munich PG programs close May 31, TU Berlin restricted courses require VPD by May 15, and University of Hamburg international master's programs close March 31. The practical submission target for Indian students is the end of May, accounting for the 4- to 6-week Uni-Assist processing time."
  },
  {
    q: "Is the summer intake for 2026 in Germany still open?",
    a: "No, the summer intake for 2026 closed on 15 January 2026. The next available entry points are Winter 2026 (October start, applications open until 15 July 2026) or Summer 2027 (April start, applications open November 2026)."
  },
  {
    q: "Is the APS certificate required for the summer intake too?",
    a: "Yes, the APS certificate is mandatory for all Indian students for both intakes in Germany at all program levels. It has been mandatory since November 2022. The APS must be obtained before your university application and before your student visa application."
  },
  {
    q: "Which programs are not available in the summer intake in Germany?",
    a: "Engineering, CS, Mechanical Engineering, and most STEM Master's programs at public research universities (TU Munich, RWTH Aachen, TU Berlin, and KIT) are typically unavailable to international students in the summer. This restriction appears on the individual program admissions page, not the university homepage. Management, humanities, and select programs at Fachhochschulen and private universities are more likely to have summer availability."
  },
  {
    q: "What should I do if I miss the Germany intake deadline?",
    a: "If you miss the Winter 2026 deadline for intakes in Germany, your options are Summer 2027 at a program that confirms summer availability (applications open November 2026) or Winter 2027. Use the gap to complete APS, improve your IELTS score, add a relevant internship, and rewrite your SOP to be program-specific. A missed deadline is not a wasted year when the application is genuinely strengthened."
  },
  {
    q: "Can I defer my German university admission to the next intake?",
    a: "In most cases, no. German public universities do not operate a standard deferral system. TU Munich's deferral page notes that prior admission may remain valid for a subsequent application to the same program, but this is not automatic. LMU Munich states plainly that missing the enrolment deadline costs at least one full semester and requires a fresh application. If your situation involves a delayed visa or APS certificate, contact the university's international office immediately with documentation. Private universities occasionally allow a one-semester deferral, but get it confirmed in writing."
  }
];

const IntakesGermany = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [activeTab, setActiveTab] = useState('winter'); // 'winter' | 'summer'
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [faqOpen, setFaqOpen] = useState({});
  const exchangeRate = 107.0; // Reference 1 EUR = 107 INR

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = Math.round(valInEUR * exchangeRate);
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
          <Link to="/study-abroad/germany" className="hover:text-indigo-650 transition-colors">Germany</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <span className="text-slate-600 font-bold">Germany Intakes Guide 2026-27</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&auto=format&fit=crop&q=80" 
              alt="Berlin Brandenburger Tor" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Calendar size={14} />
              Winter 2026 & Summer 2027
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Intakes in Germany: Winter & Summer Deadlines
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Germany has two intakes each year: winter starts in October and summer starts in April. The intake you choose determines your program options, scholarship access, and the sequence of your APS certificate, visa, and blocked account steps.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: June 25, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <BookOpen size={13} className="text-indigo-400" />
                14 min read
              </span>
            </div>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-xs inline-flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase px-3 tracking-wider">Currency Context:</span>
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 2-Column Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Sidebar Navigator */}
          <div className="lg:col-span-3 sticky top-28 hidden lg:block bg-white/70 border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <ListFilter size={16} className="text-indigo-650" />
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Page Navigator</span>
            </div>
            <div className="space-y-1.5">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer block
                    ${activeSection === sec.id 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-855 hover:bg-slate-50'}`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Content Blocks */}
          <div className="lg:col-span-9 space-y-16">
            
            {/* 1. Germany Intakes Overview */}
            <section id="overview" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🇩🇪 Germany Intakes Overview</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Key highlights for Indian applicants</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Winter Intake", val: "October 2026 Start" },
                  { label: "Summer Intake", val: "April 2027 Start" },
                  { label: "APS Fee", val: "₹19,825 (€180)" },
                  { label: "Blocked Account", val: formatCost(11904) }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between hover:shadow-xs transition-shadow">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">{item.label}</span>
                    <strong className="text-indigo-650 font-black text-sm md:text-base mt-2 block">{item.val}</strong>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Winter vs Summer Matrix */}
            <section id="comparison" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📊 Winter vs. Summer Intake at a Glance</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">An honest comparison of deadlines, options, and volumes</p>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                        <th className="pb-3 pr-4">Factor</th>
                        <th className="pb-3 pr-4">Winter Intake 2026</th>
                        <th className="pb-3 pr-4">Summer Intake 2026-27</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-750 font-semibold">
                      {[
                        { f: "Classes begin", w: "October 2026", s: "April 2026 (closed); April 2027 is next" },
                        { f: "Application window", w: "April to 15 July 2026", s: "Closed for 2026; Nov 2026 to Jan 2027 for April 2027" },
                        { f: "Standard deadline", w: "15 July 2026", s: "15 January (standard); some close in December" },
                        { f: "Uni-Assist fees", w: "€75 first application, €30 each subsequent", s: "Same rates apply (€75 first, €30 each subsequent)" },
                        { f: "Public university availability", w: "Broad: most public universities participate", s: "Restricted: many do not offer summer to international applicants" },
                        { f: "Masters program availability", w: "Full range across all disciplines", s: "Limited: CS and Engineering mostly winter-only at public universities" },
                        { f: "Scholarship access", w: "High: DAAD and foundations align with winter", s: "Reduced: most funding windows tied to winter" },
                        { f: "Blocked Account (Visa)", w: "€11,904 required for visa", s: "Same requirement (€11,904 required)" }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-indigo-650 font-black">{row.f}</td>
                          <td className="py-4 text-slate-800 font-bold">{row.w}</td>
                          <td className="py-4 text-slate-500 font-medium">{row.s}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                <Info size={16} className="text-indigo-650 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-655 font-semibold leading-relaxed">
                  <strong>Counsellor Insight:</strong> Students often ask if the summer intake is easier to get into. While competition is lower, the program choice is also much narrower, especially for Engineering and CS at public research universities. Verify availability at the program level, not the university level, before planning.
                </p>
              </div>
            </section>

            {/* 3. University Deadlines */}
            <section id="deadlines" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🏛️ Winter 2026 Deadlines: Top Universities</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Verified deadlines for Indian applicants targeting mainstream Master's programs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deadlines.map((uni, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">{uni.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Masters Deadline</p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-750 px-4 py-2 rounded-xl text-[10px] font-black text-right whitespace-nowrap">
                      {uni.date}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-655 font-semibold leading-relaxed">
                  <strong>The Real Deadline is End of May, not July 15!</strong> Uni-Assist takes 4 to 6 weeks to process documents and forward them to universities. Submit by the end of May to ensure your application reaches the university within their review window.
                </p>
              </div>
            </section>

            {/* 4. Month-by-Month Planning Timeline */}
            <section id="timelines" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📅 Month-by-Month Planning Calendars</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Select an intake to view your step-by-step preparation calendar</p>
              </div>

              <div className="flex bg-slate-100 p-1.5 rounded-2xl inline-flex gap-1.5 mb-8 border border-slate-200/60">
                <button 
                  onClick={() => setActiveTab('winter')}
                  className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${activeTab === 'winter' ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Timeline A: Winter Intake 2026
                </button>
                <button 
                  onClick={() => setActiveTab('summer')}
                  className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${activeTab === 'summer' ? 'bg-indigo-650 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Timeline B: Summer Intake 2027
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'winter' ? (
                  <motion.div 
                    key="winter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {[
                      { m: "Jan – Feb 2026", t: "Initiation", d: "Apply for APS certificate at the APS India portal, begin IELTS/TOEFL preparation, and request LORs from professors." },
                      { m: "Feb – Mar 2026", t: "Research & Shortlisting", d: "Research programs, shortlist 5 to 7 universities, and verify whether they require Uni-Assist or direct portals." },
                      { m: "Mar – Apr 2026", t: "Documentation", d: "Receive your APS certificate, take the IELTS/TOEFL exam, and draft your program-specific SOP." },
                      { m: "Apr – May 2026", t: "Submission Start", d: "Uni-Assist portals open. Submit all applications before the practical end-of-May target (TUM PG deadline is May 31)." },
                      { m: "Jun – Jul 2026", t: "Final Applications", d: "Continue submitting applications. The standard official deadline is 15 July 2026." },
                      { m: "Jul – Aug 2026", t: "Offers & Blocking", d: "Receive admission offers. Open and fund your blocked account (€11,904), and book your VFS appointment immediately." },
                      { m: "Aug – Sep 2026", t: "Visa Filing", d: "Apply for a German Student Visa (Type D) at the VFS center. Arrange health insurance and student housing." },
                      { m: "Late Sep 2026", t: "Departure", d: "Arrive in Germany for university orientation. Classes officially begin in October." }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-6 items-start bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs">
                        <span className="w-28 shrink-0 text-[10px] text-indigo-650 font-black uppercase tracking-wider">{item.m}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs mb-1">{item.t}</h4>
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{item.d}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="summer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {[
                      { m: "Jun – Sep 2026", t: "Prelims", d: "Apply for the APS certificate early, take IELTS/TOEFL exams, and verify program-level summer starts on the DAAD database." },
                      { m: "Oct – Nov 2026", t: "Final Shortlist", d: "Shortlist summer-open programs, request references, and finalize your CV and SOP." },
                      { m: "Nov – Dec 2026", t: "Applications Open", d: "Summer application windows open. Submit early; select programs close as early as December 15 (e.g. Freiburg)." },
                      { m: "Jan 2027", t: "Deadlines", d: "Final deadline for most programs is 15 January 2027. Portals close, and evaluation begins." },
                      { m: "Feb – Mar 2027", t: "Financials & Visa", d: "Receive admission offers, open your blocked account, and immediately book your VFS visa appointment." },
                      { m: "Mar 2027", t: "Fachhochschulen start", d: "Fachhochschulen study terms officially begin (March 1)." },
                      { m: "Apr 2027", t: "Arrival & Start", d: "Obtain visa, book flights, and arrive. Traditional universities begin April 1." }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-6 items-start bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs">
                        <span className="w-28 shrink-0 text-[10px] text-indigo-650 font-black uppercase tracking-wider">{item.m}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs mb-1">{item.t}</h4>
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{item.d}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* 5. Admissions Document Checklist */}
            <section id="checklist" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-655" size={24} />
                  📋 Admissions Document Checklist
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Collect and translate these documents before beginning your Uni-Assist filings</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 font-semibold">
                  {checklists.map((c, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-black text-slate-900 text-xs">{c.title}</h4>
                        <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">{c.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. Troubleshooting & Resolutions */}
            <section id="troubleshooting" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">⚠️ What to Do When Things Go Wrong</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Practical counsellor action items for common roadblocks in the application process</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    issue: "APS certificate processing delay pushes past university deadline:",
                    sol: "Contact the university admissions office directly. Some Fachhochschulen will issue conditional admission letters upon receiving your APS application receipt. If the program deadline has passed at strict research universities like TUM, you must pivot to Winter 2027."
                  },
                  {
                    issue: "You missed the Winter 2026 application deadline entirely:",
                    sol: "Submit your APS application now. If your IELTS is below 7.0, use the gap to retake it. Secure a documented internship or research project to strengthen your profile, and build a program-specific SOP. A generic SOP is the most common reason for rejection."
                  },
                  {
                    issue: "Your BTech/BSc CGPA is below 7.0 out of 10:",
                    sol: "Fachhochschulen (FH) assess your overall profile including internships, projects, and LORs rather than relying strictly on Grade Thresholds (Numerus Clausus). Contact FH admissions offices directly. Their degrees offer the same post-study visa benefits as research universities."
                  },
                  {
                    issue: "VFS student visa appointment slots are not available:",
                    sol: "Book your VFS appointment immediately on receiving your Blocked Account confirmation (Sperrbestätigung), even if other documents aren't fully organized. Peak seasons (April to July) see slots fill up weeks in advance across all Indian cities."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex flex-col justify-between hover:border-indigo-400 transition-all">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-lg bg-red-50 text-red-750 text-[9px] font-black uppercase tracking-wider mb-3">Issue</span>
                      <h4 className="font-extrabold text-slate-900 text-xs mb-3 leading-snug">{item.issue}</h4>
                      <div className="w-full h-[1px] bg-slate-200/60 mb-4" />
                      <p className="text-[11px] text-slate-550 font-semibold leading-relaxed">
                        <strong className="text-indigo-650">Resolution:</strong> {item.sol}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about Germany intakes</p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, idx) => {
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
          <StudyAbroadCTA country="Germany" />
        </div>

      </div>
    </div>
  );
};

export default IntakesGermany;
