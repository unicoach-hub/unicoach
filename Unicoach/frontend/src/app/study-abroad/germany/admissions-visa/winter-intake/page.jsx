import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Award, BookOpen, Clock, Info, CheckCircle2, 
  ChevronDown, AlertTriangle, ListFilter, ArrowRight, Coins, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'overview', title: 'Winter Intake Overview' },
  { id: 'why-winter', title: 'Why Choose Winter?' },
  { id: 'deadlines', title: 'Winter Deadlines' },
  { id: 'timeline', title: 'Winter 2026 Timeline' },
  { id: 'checkpoints', title: 'APS & Visa Booking' }
];

const winterUnis = [
  { name: "TU Munich (TUM)", deadline: "May 31, 2026 (Most PG programs)", note: "Strict deadline, direct portal application" },
  { name: "LMU Munich", deadline: "15 July 2026", note: "International Office final deadline" },
  { name: "RWTH Aachen", deadline: "15 July 2026", note: "Final deadline for all international applicants" },
  { name: "TU Berlin", deadline: "May 15, 2026", note: "VPD upload required for access-restricted courses" },
  { name: "Heidelberg University", deadline: "April 1 – Sept 30 window", note: "Varies by specific field of study" },
  { name: "University of Hamburg", deadline: "15 June 2026 (Standard Master's); 31 March 2026 (Int'l)", note: "International programs close early" },
  { name: "Karlsruhe Institute of Technology (KIT)", deadline: "15 July 2026 (Standard); 15 June (CS MSc)", note: "Early deadline for CS majors" }
];

const timelineSteps = [
  { m: "Jan – Feb 2026", action: "Apply for APS certificate at the Indian portal. Start preparing for IELTS/TOEFL and request LORs from professors.", p: "Critical Start" },
  { m: "Feb – Mar 2026", action: "Research and shortlist 5 to 7 universities. Verify Uni-Assist vs. direct portals for each program.", p: "High" },
  { m: "Mar – Apr 2026", action: "Receive your APS certificate. Take the IELTS/TOEFL exam. Draft your program-specific SOPs.", p: "High" },
  { m: "Apr – May 2026", action: "Submit applications on Uni-Assist. Practical submission target for Indian students is the end of May.", p: "Practical Target" },
  { m: "May 2026", action: "Submit TU Munich PG applications (TUM deadline is May 31). Ensure VPDs are uploaded.", p: "Critical Deadline" },
  { m: "Jun – Jul 2026", action: "Submit remaining applications before the official standard Uni-Assist deadline (July 15).", p: "Final Deadlines" },
  { m: "Jul – Aug 2026", action: "Receive admissions offers. Open a blocked account (€11,904) and book your VFS appointment immediately.", p: "Critical Action" },
  { m: "Aug – Sep 2026", action: "Apply for German student visa (Type D). Secure student accommodation and public health insurance.", p: "Visa Stage" },
  { m: "Late Sep 2026", action: "Arrive in Germany. Attend orientation weeks before the winter semester starts in October.", p: "Arrival" }
];

const WinterIntakeGermany = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const exchangeRate = 107.0; // Reference 1 EUR = 107 INR

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = valInEUR * exchangeRate;
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
          <span className="text-slate-600 font-bold">Winter Intake Guide 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&auto=format&fit=crop&q=80" 
              alt="Berlin Cathedral winter" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Calendar size={14} />
              Winter 2026 Admissions
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Winter Intake in Germany 2026
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              The winter intake in Germany starts in October, with orientation beginning in late September. It is the primary entry point for international students as it offers the widest range of programs, scholarship access, and aligns perfectly with the Indian BTech/BSc graduation calendar.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: June 25, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                11 min read
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
            
            {/* 1. Winter Intake Overview */}
            <section id="overview" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">❄️ Winter Intake Overview</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Admissions parameters for October semester start</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Semester Start", val: "October 2026" },
                  { label: "Application Window", val: "April – 15 July 2026" },
                  { label: "Blocked Account", val: formatCost(11904) }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{stat.label}</span>
                    <p className="text-sm font-black text-indigo-650 leading-snug">{stat.val}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Why Choose Winter? */}
            <section id="why-winter" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🎯 Why Choose Winter Intake?</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Advantages of the winter admission cycle</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { t: "Broadest Program Options", d: "According to DAAD, there are over 1,930 English-taught master's programs. Most STEM, engineering, and CS courses only open to international students during the winter intake." },
                  { t: "High Scholarship Access", d: "The major DAAD Study Scholarships and foundation grants (like Heinrich Böll, Deutschlandstipendium) align their application windows specifically with the winter cycle." },
                  { t: "Perfect Academic Alignment", d: "For BTech, BSc, and BCom students in India graduating in May or June, winter semester starting in October prevents any forced gap year." }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
                    <div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">Benefit 0{idx+1}</span>
                      <h3 className="font-extrabold text-slate-900 text-xs mb-2">{item.t}</h3>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Winter Deadlines */}
            <section id="deadlines" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🏛️ Winter 2026 Deadlines</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Important dates for applying to Germany's public research universities in Winter 2026</p>
              </div>

              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">University</th>
                        <th className="pb-3 pr-4">Masters Deadline (Winter 2026)</th>
                        <th className="pb-3 pr-4">Admissions Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-750 font-semibold">
                      {winterUnis.map((uni, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-805 font-black">{uni.name}</td>
                          <td className="py-4 text-indigo-650 text-xs font-black">{uni.deadline}</td>
                          <td className="py-4 text-slate-500 font-semibold text-xs">{uni.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-655 font-semibold leading-relaxed">
                  <strong>Uni-Assist Processing Lag (4-6 Weeks):</strong> Although the official deadline is July 15, Uni-Assist takes 4 to 6 weeks to evaluate documents and forward them to universities. Submit by the end of May to prevent your profile from arriving after review slots close.
                </p>
              </div>
            </section>

            {/* 4. Winter 2026 Timeline */}
            <section id="timeline" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📅 Month-by-Month Winter 2026 Timeline</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Visualizing the application sequence starting from January 2026</p>
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
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-wide">{step.p}</span>
                      </div>
                      <p className="text-slate-700 font-bold text-xs mt-1 leading-relaxed">{step.action}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                <Info size={16} className="text-indigo-650 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-655 font-semibold leading-relaxed">
                  <strong>Counsellor Insight: Academic Recommendation Letters (LORs).</strong> Many students underestimate the lead time for LORs. In India, most professors are busy with exam season (March to May) and vacations (June). Request LORs in January or February. Give your recommender the specific program details, university name, and a bullet list of your projects or courses taken under them.
                </p>
              </div>
            </section>

            {/* 5. APS & Visa Booking */}
            <section id="checkpoints" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-655" size={24} />
                  🔒 APS & Visa Booking Checkpoints
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Critical administrative checkpoints to prevent missing the winter intake</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 font-semibold">
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <h4 className="font-extrabold text-indigo-650 text-xs mb-3">1. APS Application Timing</h4>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      The single most common reason Indian students miss the Winter intake is starting their APS application too late. During peak season (August to December), APS processing takes up to 3 months. Apply for APS in February using your provisional degree and a registrar letter. Do not wait for your final degree convocation.
                    </p>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <h4 className="font-extrabold text-indigo-650 text-xs mb-3">2. VFS Visa Appointment Booking</h4>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      Book your VFS student visa slot the day your blocked account confirmation (Sperrbestätigung) arrives, even if health insurance or other papers are still being sorted. Delayed bookings are the most common delay reason. VFS queues stretch significantly from June to August.
                    </p>
                  </div>
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

export default WinterIntakeGermany;
