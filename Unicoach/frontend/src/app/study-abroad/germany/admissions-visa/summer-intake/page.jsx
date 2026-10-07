import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Award, BookOpen, Clock, Info, CheckCircle2, 
  ChevronDown, AlertTriangle, ListFilter, ArrowRight, Coins, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'overview', title: 'Summer Intake Overview' },
  { id: 'universities', title: 'Summer Universities' },
  { id: 'disciplines', title: 'Program Availability' },
  { id: 'timeline', title: 'Summer 2027 Calendar' },
  { id: 'documents', title: 'Documents & Eligibility' },
  { id: 'costs', title: 'Semester Costs' }
];

const summerUnis = [
  { name: "TU Munich (QS: 22)", programs: "Data Engineering, Automotive, Aerospace", deadline: "Jan 15-31, 2027 (varies)", route: "Direct Portal" },
  { name: "LMU Munich (QS: 58)", programs: "Data Science, Business Administration", deadline: "January 15, 2027", route: "Direct Portal" },
  { name: "Heidelberg University (QS: 80)", programs: "Molecular Biosciences, Economics", deadline: "Jan 15 - March 31, 2027", route: "Direct Portal" },
  { name: "RWTH Aachen (QS: 105)", programs: "Electrical Engineering, Automotive", deadline: "January 15, 2027", route: "Direct Portal" },
  { name: "TU Berlin (QS: 145)", programs: "Space Engineering, Computer Science", deadline: "January 15, 2027", route: "Uni-Assist (VPD)" },
  { name: "University of Hamburg (QS: 193)", programs: "Data Science, Marine Ecosystem Dynamics", deadline: "January 15, 2027", route: "Uni-Assist" },
  { name: "University of Freiburg (QS: 201)", programs: "Renewable Energy, Embedded Systems", deadline: "December 15, 2026 (Early!)", route: "Uni-Assist" },
  { name: "University of Bonn (QS: 207)", programs: "Economics, Agricultural Sciences", deadline: "Nov 30, 2026 - Jan 31, 2027", route: "Direct Portal" },
  { name: "Hochschule Munich (FH)", programs: "MBA, International Business", deadline: "February 1, 2027", route: "PRIMUSS Portal" },
  { name: "HAW Hamburg (FH)", programs: "Information Engineering, Renewable Energies", deadline: "February 15, 2027", route: "Uni-Assist" }
];

const categories = [
  { title: "Computer & Data Science", status: "Highly Competitive", note: "TUM, LMU, TU Berlin, and University of Hamburg offer select English tracks. CGPA floor is usually 7.5+." },
  { title: "Electrical & Mech Engineering", status: "Restricted Availability", note: "RWTH Aachen and TU Berlin offer select courses. General Engineering is widely available at Applied Science (FH) universities." },
  { title: "Sustainability & Environment", status: "Strong Availability", note: "University of Freiburg, THI Ingolstadt, and Hamburg offer multiple options. Note Freiburg's early Dec 15 deadline." },
  { title: "MBA & Economics", status: "Management focus", note: "Economics is available at Heidelberg and Bonn. MBA options are stronger at Fachhochschulen like Hochschule Munich." },
  { title: "Biosciences & Life Sciences", status: "Select Programs", note: "Molecular Biosciences at Heidelberg and Marine Ecosystem Dynamics at Hamburg are confirmed summer starts." }
];

const timelineSteps = [
  { m: "April - May 2026", action: "Attend final exams & collect provisional certificate on results day.", p: "Critical" },
  { m: "June 2026", action: "Shortlist 6-8 summer-open programs; apply for APS certificate by post immediately.", p: "Critical" },
  { m: "July 2026", action: "Book IELTS for August/September; begin drafting your SOP versions.", p: "High" },
  { m: "August 2026", action: "Receive APS certificate (if applied in June); register on Uni-Assist and request LORs.", p: "High" },
  { m: "September 2026", action: "Receive IELTS results; finalize program-specific SOPs for top choices.", p: "High" },
  { m: "October 2026", action: "Upload transcripts & APS to Uni-Assist; begin first-choice direct applications.", p: "Critical" },
  { m: "November 2026", action: "Submit remaining applications; open blocked account and transfer funds.", p: "Critical" },
  { m: "December 2026", action: "Confirm blocked account is fully funded; submit Freiburg applications before Dec 15.", p: "High" },
  { m: "January 15, 2027", action: "Submit all final applications. This is the hard deadline for most public universities.", p: "Non-negotiable" },
  { m: "February 2027", action: "Receive admissions letters; book your VFS visa appointment the same day.", p: "Critical" },
  { m: "March 2027", action: "Attend VFS visa interview, collect passport, and book flight tickets.", p: "High" },
  { m: "April 2027", action: "Arrive in Germany; attend orientation weeks. Lectures begin mid-April.", p: "Departure" }
];

const SummerIntakeGermany = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const exchangeRate = 107.0; // Reference 1 EUR = 107 INR

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = valInEUR * exchangeRate;
    if (valInINR === 0) return 'Free';
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
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
          <span className="text-slate-600 font-bold">Summer Intake Guide 2027</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=1200&auto=format&fit=crop&q=80" 
              alt="Berlin city Summer" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Calendar size={14} />
              Summer 2027 Admissions
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Summer Intake in Germany 2027
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              For Indian students graduating in May 2026, the Summer 2027 intake in Germany is the most logical next target. Applications open in November 2026, the main deadline is January 15, 2027, and several top universities confirm summer-start Master's programs.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: June 25, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                12 min read
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
            
            {/* 1. Summer Intake Overview */}
            <section id="overview" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">☀️ Summer 2027 Admissions at a Glance</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Admissions metrics and parameters</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                  { label: "Semester Start", val: "April 2027" },
                  { label: "App Window", val: "Nov – Jan 15" },
                  { label: "Course Selection", val: "Specialized STEM" },
                  { label: "Competition", val: "Lower volume" },
                  { label: "APS Certificate", val: "Mandatory" },
                  { label: "Visa Processing", val: "6 - 12 Weeks" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{stat.label}</span>
                    <p className="text-xs font-black text-indigo-650 leading-snug">{stat.val}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Summer Universities */}
            <section id="universities" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🏛️ Summer 2027 Universities & Deadlines</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Confirmed institutions with summer-start master's programs for international students</p>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">University Name</th>
                        <th className="pb-3 pr-4">Key Summer Programs</th>
                        <th className="pb-3 pr-4">Admissions Route</th>
                        <th className="pb-3 pr-4 text-right">Deadline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-750 font-semibold">
                      {summerUnis.map((uni, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-805 font-black">{uni.name}</td>
                          <td className="py-4 text-slate-500 font-semibold text-xs leading-relaxed max-w-xs">{uni.programs}</td>
                          <td className="py-4 text-indigo-650 text-xs font-extrabold">{uni.route}</td>
                          <td className="py-4 text-right font-black text-slate-900 text-xs">{uni.deadline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                <Info size={16} className="text-indigo-650 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-655 font-semibold leading-relaxed">
                  <strong>Counsellor Tip:</strong> A university may officially offer a summer semester but have only 2 of its 15 programs running in that cycle. Go to your exact course on the DAAD database, click the application period tab, and check if it lists an April start date. If it only lists October, that specific program is winter-only.
                </p>
              </div>
            </section>

            {/* 3. Program Availability */}
            <section id="disciplines" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🎯 Program Availability & Constraints</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Summary of courses available during the summer intake for Indian applicants</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-750 text-[9px] font-black uppercase tracking-wider mb-3">{cat.status}</span>
                      <h4 className="font-extrabold text-slate-900 text-xs mb-2">{cat.title}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{cat.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="text-red-650 mt-0.5 shrink-0" size={16} />
                <p className="text-[11px] text-slate-655 font-semibold leading-relaxed">
                  <strong>Mechanical / Electrical / CS Warning at Top Research Universities:</strong> STEM Master's programs at research universities like TUM, RWTH Aachen, and KIT are typically winter-only for international students. Do not plan a summer intake based only on the university's homepage; verify details on the specific program admissions page.
                </p>
              </div>
            </section>

            {/* 4. Summer 2027 Calendar */}
            <section id="timeline" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📅 Month-by-Month Summer 2027 Calendar</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Built for final-year students targeting April 2027 entry</p>
              </div>

              <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-indigo-650 font-black uppercase tracking-wider">{step.m}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wide ${step.p === 'Critical' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{step.p}</span>
                      </div>
                      <p className="text-slate-700 font-bold text-xs mt-1 leading-relaxed">{step.action}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-655 font-semibold leading-relaxed">
                  <strong>Critical Constraint: June APS Application.</strong> The June APS application is the single most important self-imposed deadline in this calendar. APS processing stretches to 8+ weeks in July-August when volumes peak. Applying in June means your certificate is in hand by late July, giving you a relaxed timeline for SOP finalization in September and submissions in October. Apply for APS the week your final marks are declared, not after your convocation.
                </p>
              </div>
            </section>

            {/* 5. Documents & Eligibility */}
            <section id="documents" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-650" size={24} />
                  📋 Required Documents & Eligibility
                </h2>
                <p className="text-slate-450 text-xs font-bold mb-6">Ensure you have all items completed in sequence before applying</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 font-semibold">
                  {[
                    { t: "APS Certificate (Mandatory)", d: "An evaluation center certificate verifying the authenticity of Indian credentials. Apply by post to APS New Delhi; fee approx. Rs. 19,825; processing takes 4 to 8 weeks." },
                    { t: "Recognized Bachelor's Degree", d: "Check your institution on the Anabin database. Most NAAC-accredited Indian universities qualify. Final year students can apply with provisional certificates." },
                    { t: "CGPA Floor Requirements", d: "Minimum 6.5/10 (2.5 German grade equivalent) for most programs; 7.5+ is realistic for competitive CS/Data Science tracks at TUM or LMU." },
                    { t: "English Proficiency Score", d: "IELTS 6.5 overall (no band less than 6.0) or TOEFL iBT 88+. Medium of Instruction (MOI) letters are accepted only at select FH universities." },
                    { t: "Statement of Purpose (SOP)", d: "500–1,000 words. Must be highly tailored to the specific course modules and research areas. Copying generic templates leads to quick rejections." },
                    { t: "Blocked Account (Sperrkonto)", d: "Proof of €11,904 deposited. Required before booking your visa interview. Can be opened digitally via Expatrio or Fintiba in 2 to 4 weeks." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-black text-slate-900 text-xs">{item.t}</h4>
                        <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. Semester Costs */}
            <section id="costs" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  💰 Summer Semester Costs Overview
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Comparing public administration fees, state exceptions, and living funds</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "Standard Public Universities", desc: "Admin contribution fee per semester.", cost: 300, freq: "semester" },
                    { title: "Baden-Württemberg Exception", desc: "For non-EU students studying in this state (e.g. Freiburg, KIT).", cost: 1500, freq: "semester" },
                    { title: "Monthly Living Expenses", desc: "Average living expenditure including housing, food, and public transit.", cost: 950, freq: "month" }
                  ].map((p, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs">{p.title}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold mt-2 mb-4 leading-relaxed">{p.desc}</p>
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Estimated Cost</p>
                        <p className="text-xs font-black text-indigo-650 mt-0.5">{formatCost(p.cost)} <span className="text-[10px] text-slate-400 font-bold">/ {p.freq}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
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

export default SummerIntakeGermany;
