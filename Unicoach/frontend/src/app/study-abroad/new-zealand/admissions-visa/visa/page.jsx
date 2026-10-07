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
  { id: 'visa-types', title: 'Visa Types' },
  { id: 'eligibility', title: 'Eligibility & Checklist' },
  { id: 'english', title: 'English Requirements' },
  { id: 'process', title: 'Step-by-Step Process' },
  { id: 'times', title: 'Processing Times' },
  { id: 'financials', title: 'Financial Requirements' },
  { id: 'fts', title: 'Funds Transfer Scheme (FTS)' },
  { id: 'cost', title: 'Cost of Studying' },
  { id: 'life-visa', title: 'Life on a Student Visa' },
  { id: 'pswv', title: 'Post-Study Work Visa (PSWV)' },
  { id: 'pr-pathway', title: 'Pathway to PR' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const englishProficiency = [
  { level: "Undergraduate", ielts: "6.0 – 6.5", pte: "50 – 58" },
  { level: "Postgraduate", ielts: "6.5 – 7.0", pte: "58 – 65" },
  { level: "Diploma/Pathway", ielts: "5.5 – 6.0", pte: "42 – 50" },
  { level: "English Language", ielts: "Varies", pte: "Varies" }
];

const cityCosts = [
  { name: "Auckland", cost: 1844 },
  { name: "Wellington", cost: 1789 },
  { name: "Christchurch", cost: 1613 },
  { name: "Dunedin", cost: 1550 }
];

const interviewQuestions = [
  { q: "Why this course & institution?", why: "Assess genuine intent", ans: "Show research, course structure alignment, and future plans." },
  { q: "How will you fund your studies?", why: "Verify financial capacity", ans: "State specific sanction amounts, savings, and sponsor sources." },
  { q: "What are your post-study plans?", why: "Assess return/PR intent", ans: "Be clear about building career profiles and show industry awareness." }
];

const NewZealandVisa = () => {
  const [activeSection, setActiveSection] = useState('visa-types');
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
          <span className="text-slate-600 font-bold">Study Visa Manual 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80" 
              alt="New Zealand Visa Guideline" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <ShieldCheck size={14} strokeWidth={2.5} />
              Immigration New Zealand 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              New Zealand Study Visa 2026: Complete Guide for Indian Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Excited about studying in New Zealand? The visa process shouldn't be a maze. Find all details on document checklist, funds transfer, processing times, and work rights here.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: October 27, 2025
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
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Visa Navigator</span>
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
            
            {/* 1. Types of Student Visas */}
            <section id="visa-types" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🛂 Types of New Zealand Student Visas</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Select the visa subcategory aligned to your study duration</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fee Paying Student Visa */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider block w-fit mb-4">
                    Most Common
                  </span>
                  <h3 className="text-base font-black text-slate-800 mb-2">Fee Paying Student Visa</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">
                    The standard option for full international study cohorts lasting longer than 3 months. Requires tuition fee clearance and a confirmed Offer of Place from an approved institution.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-slate-600">
                    <li className="flex items-center gap-2">✓ Must show NZD 20,000 living expense proof per year.</li>
                    <li className="flex items-center gap-2">✓ Valid for the duration paid up to 4 years.</li>
                  </ul>
                </div>

                {/* Pathway Student Visa */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider block w-fit mb-4">
                    Multi-Program
                  </span>
                  <h3 className="text-base font-black text-slate-800 mb-2">Pathway Student Visa</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">
                    Allows you to study up to 3 consecutive academic programmes on a single visa. Valid for up to 5 years (e.g. English course → Foundation year → Bachelor's Degree).
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-slate-600">
                    <li className="flex items-center gap-2">✓ Reduces repeated visa application charges.</li>
                    <li className="flex items-center gap-2">✓ Requires custom Pathway Offer of Place.</li>
                  </ul>
                </div>

                {/* Exchange Student Visa */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs">
                  <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-[10px] font-black uppercase tracking-wider block w-fit mb-4">
                    Exchange Setup
                  </span>
                  <h3 className="text-base font-black text-slate-800 mb-2">Exchange Student Visa</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">
                    Tied to formal exchange or study abroad agreements between home and Kiwi universities. Often allows paying fees directly to your home institution.
                  </p>
                </div>

                {/* Short Term Visas */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs">
                  <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-250 text-slate-700 text-[10px] font-black uppercase tracking-wider block w-fit mb-4">
                    Short Term
                  </span>
                  <h3 className="text-base font-black text-slate-800 mb-2">Visitor & Working Holiday Visas</h3>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">
                    If your course is less than 3 months, a regular Visitor Visa is sufficient. Working Holiday visas permit study up to 6 months total.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Eligibility & Requirements */}
            <section id="eligibility" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-650" size={24} />
                  ✅ Eligibility & Checklist
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Review your prerequisites before submitting visa applications</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">1. Academic standing</h4>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      Must hold a confirmed Offer of Place from an NZQA-approved education provider after meeting academic GPA thresholds.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">2. Genuine Intent</h4>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      Immigration New Zealand evaluates if your core objective is to genuinely study and complete the specified qualification.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">3. Health & character</h4>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">
                      Must undergo chest X-ray screening, obtain clean Police Clearance (PCC), and buy approved medical/travel insurance.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-slate-800 text-sm mb-4">Student Visa Eligibility Checklist</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Offer of Place from NZ-approved institution",
                      "Meet institution's academic entry criteria",
                      "Satisfy English language requirements",
                      "Proof of sufficient funds (NZD 20,000 per year)",
                      "Tuition fee receipts or scholarship letter",
                      "Approved medical & travel insurance policy",
                      "Valid passport (at least 3 months beyond stay)",
                      "Police Clearance Certificate (PCC)",
                      "Medical certificate (Chest X-ray if required)",
                      "Demonstrate genuine intention to study"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 3. English Proficiency Requirements */}
            <section id="english" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/65 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <BookOpen className="text-indigo-650" size={22} />
                  🗣️ English Proficiency Requirements
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Required benchmarks set by Kiwi universities (IELTS vs PTE)</p>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Program Level</th>
                        <th className="pb-3 pr-4">IELTS score</th>
                        <th className="pb-3 pr-4 text-right">PTE score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                      {englishProficiency.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-slate-900 font-extrabold">{row.level}</td>
                          <td className="py-4 text-slate-600 font-medium">{row.ielts}</td>
                          <td className="py-4 text-right text-slate-655 font-medium">{row.pte}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                  <p className="text-[11px] text-slate-655 font-semibold leading-relaxed">
                    <strong>Note:</strong> Some universities accept a **Medium of Instruction (MOI)** certificate if your previous high school or undergraduate studies were completed entirely in English. Always verify with your specific institution.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Step-by-Step Application Process */}
            <section id="process" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📝 Step-by-Step Application Process</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Follow this milestone workflow to file your visa</p>
              </div>

              <div className="relative border-l-2 border-indigo-100 pl-6 ml-4 space-y-8 mb-12">
                {[
                  { step: "Step 1", title: "Accept Offer & Enroll", desc: "Settle your university tuition deposit and receive your confirmed admission receipt." },
                  { step: "Step 2", title: "Create RealMe Account", desc: "Set up your secure credentials on the RealMe portal and access Immigration Online." },
                  { step: "Step 3", title: "Assemble Documents", desc: "Gather passport scans, academic credentials, medicals, PCC, and financial proof papers." },
                  { step: "Step 4", title: "Pay Fees & Upload", desc: "Submit your online application. Pay the visa fee and International Visitor Levy (IVL)." },
                  { step: "Step 5", title: "Biometrics & Interview", desc: "Complete biometric scans at VFS (India) and prepare for any potential interviews." },
                  { step: "Step 6", title: "Await eVisa Decision", desc: "Immigration NZ will process your file and issue an electronic student visa (eVisa)." }
                ].map((s, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white" />
                    <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wider block mb-0.5">{s.step}</span>
                    <h4 className="text-xs font-black text-slate-850">{s.title}</h4>
                    <p className="text-slate-550 text-xs font-semibold leading-relaxed mt-1">{s.desc}</p>
                  </div>
                ))}
              </div>

              {/* Interview Qs */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6">
                <h3 className="font-black text-slate-800 text-sm mb-6 flex items-center gap-2">
                  <Users size={16} className="text-indigo-600" />
                  Common Student Visa Interview Questions
                </h3>
                <div className="space-y-4">
                  {interviewQuestions.map((q, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <strong className="text-slate-900 text-xs font-black">" {q.q} "</strong>
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase rounded tracking-wider shrink-0">{q.why}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] font-semibold leading-relaxed"><strong>How to prepare:</strong> {q.ans}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. Visa Processing Times */}
            <section id="times" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="text-indigo-650" size={24} />
                  ⏰ Visa Processing Times
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  The standard processing timeline for New Zealand student visas is between **30 to 45 working days** (~6-8 weeks). 
                  Around **80% of applications** are resolved within 5 weeks, provided documentation is flawless and complete.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">Peak Season (Oct – Mar)</h4>
                    <p className="text-slate-500 font-semibold leading-relaxed">
                      Higher application volumes can lead to queues and processing delays. Make sure to apply at least **3 months** before departure.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2">Off-Peak Season (Apr – Sep)</h4>
                    <p className="text-slate-500 font-semibold leading-relaxed">
                      Lighter volumes permit much quicker turnarounds. Ideal for mid-year (July intake) applicants.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Financial Requirements */}
            <section id="financials" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  💰 Financial Requirements for Visa
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">Study Duration: 1 Year or More</h4>
                      <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                        You must show proof of:
                      </p>
                    </div>
                    <div className="mt-4">
                      <strong className="text-slate-900 text-xl font-black block">NZD 20,000 (~₹10.5 Lakhs)</strong>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Living expenses per academic year</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">Study Duration: Less than 1 Year</h4>
                      <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                        You must show proof of:
                      </p>
                    </div>
                    <div className="mt-4">
                      <strong className="text-slate-900 text-xl font-black block">NZD 1,667 (~₹85,000)</strong>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Living expenses per month of study</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-slate-800 text-sm mb-4">Accepted Proof of Funds</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Bank statements (showing 3-6 months transaction history)",
                      "Education loan sanction letter from an approved bank",
                      "Tuition fee receipts or full scholarship award letter",
                      "Sponsor letter with valid relationship proof",
                      "Sponsor income evidence (latest salary slips & ITR documents)",
                      "Funds Transfer Scheme (FTS) deposit account details"
                    ].map((fund, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-700">{fund}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Funds Transfer Scheme (FTS) */}
            <section id="fts" className="scroll-mt-24">
              <div className="bg-sky-50/50 border border-sky-100 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-slate-905 mb-2 flex items-center gap-2">
                  <Compass className="text-sky-600" size={24} />
                  🛤️ Funds Transfer Scheme (FTS) Explained
                </h2>
                <p className="text-slate-650 text-sm font-semibold leading-relaxed mb-6">
                  The Funds Transfer Scheme (FTS) is an Immigration New Zealand-approved option that allows international students to transfer living-cost funds to New Zealand securely. This program is run in partnership with ANZ Bank.
                </p>

                <div className="space-y-4">
                  {[
                    { step: "① Receive AIP", desc: "Submit your student visa application and receive an 'Approval-in-Principle' (AIP) letter." },
                    { step: "② Open ANZ Account", desc: "Open a secure FTS savings account with ANZ Bank New Zealand." },
                    { step: "③ Transfer Funds", desc: "Deposit your first 12 months' living cost (NZD 20,000) into this account." },
                    { step: "④ Monthly Withdrawals", desc: "Once you arrive in NZ, receive fixed monthly payouts (e.g. NZD 1,250) for expenses." },
                    { step: "⑤ Safe Refund", desc: "If your student visa is refused, all deposited funds are fully refunded back to your original source." }
                  ].map((f, i) => (
                    <div key={i} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-slate-100">
                      <span className="text-sky-600 font-extrabold text-xs shrink-0 mt-0.5">{f.step}</span>
                      <p className="text-slate-655 text-xs font-semibold">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 8. Cost of Studying */}
            <section id="cost" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  💰 Cost of Studying in NZ
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

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">IVL Levy Fee</span>
                      <strong className="text-slate-900 text-sm font-black mt-1 block">{formatCost(100)}</strong>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">UG Tuition (Annual)</span>
                      <strong className="text-slate-905 text-sm font-black mt-1 block">{formatCost(22000)} – {formatCost(35000)}</strong>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block">PG Tuition (Annual)</span>
                      <strong className="text-slate-905 text-sm font-black mt-1 block">{formatCost(26000)} – {formatCost(45000)}</strong>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-4">City</th>
                          <th className="pb-3 pr-4 text-right">Est. Monthly Cost (excl. rent)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-705 font-semibold">
                        {cityCosts.map((city, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 text-slate-900 font-extrabold">{city.name}</td>
                            <td className="py-4 text-right text-indigo-650 font-black">{formatCost(city.cost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. Life on a Student Visa */}
            <section id="life-visa" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldAlert className="text-rose-600 animate-pulse" size={24} />
                  🏠 Life on a Student Visa
                </h2>

                <div className="space-y-6">
                  {/* Work rights */}
                  <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                    <h3 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider mb-2">💼 Part-Time Work Rights (Updated)</h3>
                    <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                      Under 2026 guidelines, student work rights are officially set to **25 hours per week** (increased from 20) during term time and full-time during holidays. Note that self-employment is strictly prohibited. Master's by research and PhD candidates are eligible for unlimited work hours.
                    </p>
                  </div>

                  {/* Course changes */}
                  <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100">
                    <h3 className="font-extrabold text-rose-900 text-xs uppercase tracking-wider mb-2">🔄 Changing Courses or Institutions</h3>
                    <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                      A simple "Variation of Conditions" is no longer sufficient if you change your course or provider. You must apply for a **NEW student visa** prior to transitioning.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. Post-Study Work Visa */}
            <section id="pswv" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Clock className="text-indigo-650" size={24} />
                  ⏰ Post-Study Work Visa (PSWV)
                </h2>

                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <h3 className="font-extrabold text-emerald-900 text-xs uppercase tracking-wider mb-2">✅ Duration: Up to 3 Years</h3>
                    <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                      Graduates of level 7 Bachelor's degrees, level 9 Master's degrees, and PhD programmes are eligible for a **3-year Post-Study Work Visa** with open work rights (not restricted to a specific employer).
                    </p>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-805 text-sm mb-4">Eligibility Criteria Checklist</h3>
                    <ul className="space-y-3.5 text-xs text-slate-700 font-semibold">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        Must have studied full-time in New Zealand for at least **30 weeks**.
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        The qualification must be completed in New Zealand.
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        Must apply within **3 months** of completing your study programme.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 11. Pathway to PR */}
            <section id="pr-pathway" className="scroll-mt-24">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-[2rem] p-8">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                  <Compass className="text-indigo-300" size={24} />
                  🇳🇿 Pathway to Permanent Residency (PR)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block mb-2">Step 1</span>
                    <h4 className="font-extrabold text-xs mb-2">Graduate in NZ</h4>
                    <p className="text-white/80 text-[11px] leading-relaxed font-medium">
                      Complete your level 7+ degree full-time in NZ and secure your 3-year Post-Study Work Visa.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block mb-2">Step 2</span>
                    <h4 className="font-extrabold text-xs mb-2">Skilled Employment</h4>
                    <p className="text-white/80 text-[11px] leading-relaxed font-medium">
                      Find a skilled work profile with wages aligned to current Kiwi median benchmarks to strengthen points.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block mb-2">Step 3</span>
                    <h4 className="font-extrabold text-xs mb-2">Apply for Residence</h4>
                    <p className="text-white/80 text-[11px] leading-relaxed font-medium">
                      Apply under the points-based Skilled Migrant Category or employer-assisted pathways.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 12. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about New Zealand Study Visa rules</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "What is the age limit for a student visa in NZ?", a: "There is no strict upper age limit. You must satisfy all standard requirements (Offer of Place, medicals, PCC, and living funds)." },
                  { q: "What is the success rate of New Zealand student visas?", a: "While Immigration NZ does not publish static success rates, around 80% of student visas are successfully processed within 5 weeks when files are fully documented." },
                  { q: "Is it easy to get a student visa in NZ?", a: "Yes. Being timely, truthful, and organized while preparing all documentation (such as genuine study intent and clear financial proofs) makes it very straightforward." },
                  { q: "What happens if my student visa expires before graduation?", a: "You must apply for a visa extension or further-student visa before your current visa lapses to maintain legal status in NZ." },
                  { q: "Can I get an education loan for a New Zealand student visa from India?", a: "Yes. Major Indian banks (such as SBI, ICICI, etc.) offer educational study-abroad loans covering NZ tuition fees and living expenses." },
                  { q: "How much funding is needed for a New Zealand student visa?", a: "For programs of 1 year or more, you must show NZD 20,000 per year. For programs less than 1 year, you must show NZD 1,667 per month." }
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

export default NewZealandVisa;
