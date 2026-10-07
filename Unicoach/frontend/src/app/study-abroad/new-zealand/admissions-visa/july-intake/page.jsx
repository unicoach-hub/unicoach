import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, CheckCircle2, ArrowRight, Table, AlertCircle, Sparkles, 
  Building, ListFilter, HelpCircle, ChevronDown, Award, Globe, DollarSign, 
  BookOpen, Compass, ShieldCheck, Check, ShieldAlert, Coins
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'overview', title: 'Why Choose July Intake?' },
  { id: 'july-at-glance', title: 'What is July Intake?' },
  { id: 'deadlines', title: 'Top Universities & Deadlines' },
  { id: 'timeline', title: 'Application Timeline' },
  { id: 'cost', title: 'Cost of Studying' },
  { id: 'visa-work-rights', title: 'Visa & Work Rights' },
  { id: 'comparison', title: 'July vs February Intake' },
  { id: 'mistakes', title: 'Common Mistakes' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const universityDeadlines = [
  { name: "University of Auckland", rank: "#65", deadline: "Early July", popular: "Architecture, Health Sciences, Engineering" },
  { name: "University of Otago", rank: "#214", deadline: "April 30", popular: "Research, Data Science, Humanities" },
  { name: "Victoria University of Wellington", rank: "#244", deadline: "May 1", popular: "Law, Design, Innovation, Business" },
  { name: "University of Canterbury", rank: "#261", deadline: "April 30", popular: "Engineering, Psychology, Environmental Science" },
  { name: "Massey University", rank: "#239", deadline: "May 1", popular: "Aviation, Business, Veterinary Science" },
  { name: "University of Waikato", rank: "#250", deadline: "May 31", popular: "Cyber Security, Management, Science" },
  { name: "Auckland University of Technology (AUT)", rank: "#412", deadline: "April 30", popular: "IT, Visual Arts, Creative Technologies" }
];

const timelinePhases = [
  { phase: "Research Phase", dates: "Sep – Dec 2025", desc: "Shortlist universities, check course availability, and note deadlines." },
  { phase: "Test Prep Phase", dates: "Jan – Feb 2026", desc: "Prepare and sit for IELTS/PTE Academic tests and gather transcripts." },
  { phase: "Application Phase", dates: "Feb – Mar 2026", desc: "Submit university applications along with SOPs, LORs, and resumes." },
  { phase: "Offers & Acceptance", dates: "Apr – May 2026", desc: "Receive Offer of Place, accept, and pay tuition deposit." },
  { phase: "Visa Application", dates: "May – Jun 2026", desc: "File student visa with living expenses proof during off-peak window." },
  { phase: "Preparations & Arrival", dates: "Jun – Jul 2026", desc: "Book flights, arrange student housing, and attend orientation." }
];

const cityCosts = [
  { name: "Auckland", monthlyCostNZD: 1844, weeklyRentNZD: "250 – 350", desc: "High living cost, major commercial and tech hub." },
  { name: "Wellington", monthlyCostNZD: 1789, weeklyRentNZD: "220 – 320", desc: "Cultural capital, public administration and arts hub." },
  { name: "Christchurch", monthlyCostNZD: 1613, weeklyRentNZD: "180 – 280", desc: "Industrial and engineering center on South Island." },
  { name: "Dunedin", monthlyCostNZD: 1550, weeklyRentNZD: "160 – 250", desc: "Vibrant student city, famous biomedical center." }
];

const commonMistakes = [
  { title: "Missing Deadlines", desc: "Universities close July applications between March and May. Apply early to allow verification." },
  { title: "Incomplete Documentation", desc: "Failing to attach transcripts, test scores, or financial proof leads to immediate visa rejection." },
  { title: "Visa Processing Backlog", desc: "Immigration NZ takes 30-45 working days. Submitting papers in late June is extremely risky." },
  { title: "Ignoring Accommodation", desc: "Dunedin and Wellington student rooms fill up quickly during winter. Waiting till June causes housing stress." }
];

const NewZealandJulyIntake = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [currency, setCurrency] = useState('INR'); // 'NZD' | 'INR'
  const [faqOpen, setFaqOpen] = useState({});
  const exchangeRate = 55.0; // Reference 1 NZD ≈ 55 INR

  const formatCost = (valInNZD) => {
    if (currency === 'NZD') {
      return `NZ$ ${valInNZD.toLocaleString()}`;
    }
    const valInINR = Math.round(valInNZD * exchangeRate);
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

  return (
    <div className="min-h-screen bg-[#fafcff] pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <Link to="/study-abroad/new-zealand" className="hover:text-indigo-650 transition-colors">New Zealand</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <span className="text-slate-600 font-bold">July Intake Guide 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80" 
              alt="New Zealand Summer" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Calendar size={14} />
              Mid-Year Intake 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              July Intake in New Zealand 2026: Deadlines, Fees & Complete Guide
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Missed the February cycle? The July intake is a strategic, off-peak entry point offering smoother visa processing, less competition, and updated work rights.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: December 24, 2025
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                9 min read
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
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">July Navigator</span>
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
            
            {/* 1. Why Choose July Intake */}
            <section id="overview" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-sky-50/40 to-indigo-50/40 border border-indigo-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={22} />
                  💡 Missed the February Deadline? Here's Your Second Chance.
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  The July intake in New Zealand is no longer just a "backup." It has become a highly popular, strategic entry point for Indian students in 2026. 
                  By choosing July, you secure smoother off-peak student visa processing, face lower competition for premium courses, and get additional months to prepare your academic portfolio.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Extra preparation time for IELTS / PTE tests",
                    "Lower competition = better university admission chances",
                    "Quicker visa processing during off-peak queues",
                    "Full 3-year post-study work visa (PSWV)",
                    "8 top universities with active July entry programs"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100">
                      <Check className="text-teal-600 shrink-0" size={16} strokeWidth={3} />
                      <span className="text-xs font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. What is July Intake */}
            <section id="july-at-glance" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📅 What Is the July Intake in New Zealand?</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Key facts of Semester 2 / mid-year starts</p>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs mb-6">
                  <div>
                    <span className="text-slate-400 font-bold block">Intake Name</span>
                    <strong className="text-slate-800 font-extrabold mt-0.5 block">July Intake (Mid-Year)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Start Date</span>
                    <strong className="text-slate-800 font-extrabold mt-0.5 block">June – July 2026</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Target Degrees</span>
                    <strong className="text-slate-800 font-extrabold mt-0.5 block">Undergraduate & Postgrad</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Course Availability</span>
                    <strong className="text-slate-800 font-extrabold mt-0.5 block">70-80% of all programs</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Scholarships</span>
                    <strong className="text-slate-800 font-extrabold mt-0.5 block">Limited availability</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Visa Processing Speed</span>
                    <strong className="text-emerald-600 font-extrabold mt-0.5 block">Off-Peak (Faster)</strong>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                  <AlertCircle className="text-indigo-600 shrink-0 mt-0.5" size={16} />
                  <p className="text-[11px] text-slate-655 font-semibold leading-relaxed">
                    <strong>Note:</strong> Some specialized programs (such as clinical medicine or select specialized law tracks) are strictly limited to the February intake. Always verify course availability before initiating applications.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Top Universities & Deadlines */}
            <section id="deadlines" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/65 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Building className="text-indigo-650" size={22} />
                  🏛️ Top Universities Offering July Intake (2026)
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Cutoff dates and popular courses open in Semester 2</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">University</th>
                        <th className="pb-3 pr-4 text-center">QS Rank</th>
                        <th className="pb-3 pr-4">July Deadline</th>
                        <th className="pb-3 pr-4 text-right">Popular July Courses</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {universityDeadlines.map((uni, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-900 font-extrabold">{uni.name}</td>
                          <td className="py-4 text-center">
                            <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg">{uni.rank}</span>
                          </td>
                          <td className="py-4 text-slate-905 font-bold">{uni.deadline}</td>
                          <td className="py-4 text-right text-slate-500 text-xs font-medium">{uni.popular}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 4. Application Timeline */}
            <section id="timeline" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📅 July 2026 Complete Timeline</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Month-by-month planning framework</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {timelinePhases.map((phase, idx) => (
                  <div key={idx} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wider">{phase.dates}</span>
                      <span className="w-6 h-6 rounded-full bg-slate-55 flex items-center justify-center text-[10px] text-slate-400 font-black">
                        0{idx + 1}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-xs mb-2">{phase.phase}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">{phase.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Cost of Studying */}
            <section id="cost" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  💰 Cost of Studying & Living Costs (July 2026)
                </h2>

                {/* Currency Switcher */}
                <div className="flex justify-start mb-6">
                  <div className="bg-slate-50 border border-slate-200/60 p-1 rounded-xl inline-flex items-center gap-1">
                    <button 
                      onClick={() => setCurrency('NZD')}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currency === 'NZD' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      NZD (NZ$)
                    </button>
                    <button 
                      onClick={() => setCurrency('INR')}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${currency === 'INR' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      INR (₹)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4">Tuition Fees (Annual)</h4>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">Undergraduate Degrees</span>
                        <strong className="text-slate-905 text-lg font-black mt-0.5 block">{formatCost(22000)} – {formatCost(35000)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">Postgraduate Degrees</span>
                        <strong className="text-slate-905 text-lg font-black mt-0.5 block">{formatCost(26000)} – {formatCost(45000)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">Financial Proof for Visa</h4>
                      <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                        To secure a student visa, Immigration New Zealand requires proof of tuition fee coverage plus a minimum of:
                      </p>
                    </div>
                    <div className="mt-4">
                      <strong className="text-emerald-700 text-xl font-black block">{formatCost(20000)}</strong>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Living expenses per academic year</span>
                    </div>
                  </div>
                </div>

                {/* City Living Cost Table */}
                <div>
                  <h3 className="font-black text-slate-800 text-sm mb-4">Monthly Expenses & Rents by City</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-4">City</th>
                          <th className="pb-3 pr-4">Est. Monthly Cost (excl. rent)</th>
                          <th className="pb-3 pr-4">Weekly Shared Rent Range</th>
                          <th className="pb-3 pr-4 text-right">Context</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                        {cityCosts.map((city, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 text-slate-900 font-extrabold">{city.name}</td>
                            <td className="py-4 text-indigo-650 font-black">{formatCost(city.monthlyCostNZD)}</td>
                            <td className="py-4 font-bold text-slate-800">{city.weeklyRentNZD} / week</td>
                            <td className="py-4 text-right text-slate-500 text-xs font-medium">{city.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Visa & Work Rights */}
            <section id="visa-work-rights" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-emerald-600" size={24} />
                  🛂 July 2026 Student Visa & Work Rights
                </h2>

                <div className="space-y-6">
                  {/* Work rights info box */}
                  <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                    <h3 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider mb-2">💼 Part-Time Work Rights (Updated)</h3>
                    <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                      You are legally permitted to work up to **25 hours per week** (recently increased from 20) during academic semesters, and full-time during holidays and term breaks. This is a great way to gain local Kiwi work experience and cover your daily grocery and transport bills.
                    </p>
                  </div>

                  {/* PSWV */}
                  <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100">
                    <h3 className="font-extrabold text-blue-900 text-xs uppercase tracking-wider mb-2">⏰ 3-Year Post-Study Work Visa (PSWV)</h3>
                    <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                      Graduates of level 7 Bachelor's degrees, level 9 Master's degrees, and PhD programs are eligible for a **3-year Post-Study Work Visa** with open employment rights, offering a clear pathway to residency.
                    </p>
                  </div>

                  {/* Requirements checklist */}
                  <div>
                    <h3 className="font-black text-slate-800 text-sm mb-4">Student Visa Document Checklist</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        "Offer of Place from university",
                        "Proof of funds (tuition fees + NZD 20,000 living)",
                        "Police Clearance Certificate (PCC)",
                        "Medical certificate & chest X-ray",
                        "Valid passport (at least 3 months validity)",
                        "PTE Academic or IELTS test scorecard"
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

            {/* 7. July vs February Intake */}
            <section id="comparison" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-[2rem] p-8">
                <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                  <Compass className="text-indigo-300" size={24} />
                  July Intake vs. February Intake: Which Is Better?
                </h2>
                <p className="text-indigo-200/80 text-xs font-semibold mb-6">Choose February for maximum program selections; choose July if you want less stress and faster visas.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h3 className="font-black text-indigo-300 text-sm mb-4">Choose February if:</h3>
                    <ul className="space-y-3 text-xs font-medium text-white/80">
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You want the full selection of majors (100% courses open).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You want the maximum number of institutional scholarships.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You are fully prepared to apply by Oct-Dec 2025.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h3 className="font-black text-indigo-300 text-sm mb-4">Choose July if:</h3>
                    <ul className="space-y-3 text-xs font-medium text-white/80">
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You missed the February deadlines or need more prep time.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You want faster student visa processing (off-peak speed).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>You want smaller class cohorts and personalized faculty attention.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 text-center text-xs font-bold text-indigo-200">
                  💡 <em>Mentor's Tip: It is always better to submit a strong, complete application in July than a rushed, incomplete one in February!</em>
                </div>
              </div>
            </section>

            {/* 8. Common Mistakes to Avoid */}
            <section id="mistakes" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldAlert className="text-rose-600 animate-pulse" size={24} />
                  ⚠️ Common Mistakes to Avoid
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {commonMistakes.map((pit, idx) => (
                    <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 font-extrabold shrink-0 text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs mb-1">{pit.title}</h4>
                        <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">{pit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 9. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about Semester 2 (July) admissions</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "Is the July intake accepted for student visas in 2026?", a: "Yes. In fact, since April to June is the off-peak student visa processing season, visa files for the July intake are processed much faster by Immigration New Zealand compared to the busy February intake." },
                  { q: "What is the deadline for July 2026 intake?", a: "Most universities close applications between late April and May 2026. However, popular programs can close earlier. It is recommended to submit your application by March 2026." },
                  { q: "Are scholarships available for the July intake?", a: "Yes, but they are more limited and selective compared to the main February intake. Apply early to improve your eligibility chance." },
                  { q: "Is July cold in New Zealand?", a: "Yes. July is in the middle of winter in the Southern Hemisphere, making it the coldest month. Make sure to pack warm winter clothing." },
                  { q: "What is the part-time work hour limit?", a: "Under the updated New Zealand rules, international students can work up to 25 hours per week during the semester and full-time during breaks." }
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

export default NewZealandJulyIntake;
