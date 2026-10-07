import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Landmark, Shield, Clock, Info, CheckCircle2, 
  ChevronDown, AlertTriangle, ListFilter, ArrowRight, Coins, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const SECTIONS = [
  { id: 'overview', title: 'Visa Overview & Facts' },
  { id: 'steps', title: 'Step-by-Step VFS Process' },
  { id: 'checklist', title: 'VFS Document Checklist' },
  { id: 'post-arrival', title: 'Post-Arrival Requirements' }
];

const steps = [
  { num: "01", t: "Receive Admission / VPD", d: "Obtain your direct admission offer or Vorprüfungsdokumentation (VPD) via Uni-Assist." },
  { num: "02", t: "Fund Blocked Account", d: "Open a blocked account and deposit the mandatory €11,904. Obtain your Sperrbestätigung." },
  { num: "03", t: "Book VFS Appointment", d: "Book an appointment under 'National Visa: Study' on the VFS Global Germany portal." },
  { num: "04", t: "Gather Checklist Papers", d: "Prepare transcripts, APS, admissions, insurance, SOP, and financial statements." },
  { num: "05", t: "Attend VFS Interview", d: "Submit biometrics, documents, and attend a short 5-minute administrative interview." },
  { num: "06", t: "Collect Passport", d: "Visa processing takes 6 to 12 weeks. Receive your stamped passport and travel." }
];

const documents = [
  { title: "Admission Letter / VPD", detail: "University admission letter or Vorprüfungsdokumentation (VPD) from Uni-Assist." },
  { title: "APS Certificate (Mandatory)", detail: "Credential verification document issued by the Academic Evaluation Centre (APS) India." },
  { title: "Blocked Account Confirmation", detail: "The official 'Sperrbestätigung' showing €11,904 deposited with an approved provider." },
  { title: "Academic Certificates", detail: "Class 10 mark sheet, Class 12 certificate, and BTech/BSc degree/transcripts." },
  { title: "Proof of Language Skills", detail: "IELTS/TOEFL scorecard or German language level certificate (A1-B2) as required by program." },
  { title: "German Health Insurance", detail: "Proof of statutory or private health insurance valid from your arrival date." },
  { title: "Motivation Letter / SOP", detail: "A detailed visa-specific letter explaining why you want to study in Germany and your career plan." },
  { title: "Valid Indian Passport", detail: "Passport issued within the last 10 years with at least two blank pages, valid for travel." }
];

const GermanyVisaPage = () => {
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
          <span className="text-slate-600 font-bold">Study Visa Guide</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&auto=format&fit=crop&q=80" 
              alt="Visa processing documents" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Shield size={14} />
              National Visa Type D
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              Germany Student Visa Guide for Indian Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Indian students planning to study in Germany for a degree program exceeding 90 days must obtain a German Student Visa (National Visa / Type D). This guide covers requirements, costs, VFS procedures, and checklists.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: June 25, 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <FileText size={13} className="text-indigo-400" />
                10 min read
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
            
            {/* 1. Visa Overview & Facts */}
            <section id="overview" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📋 Germany Student Visa Quick Facts</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Core details for Indian applicants</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Blocked Account", desc: "Mandatory deposit proving financial self-sufficiency. Monthly payouts are €992.", cost: 11904 },
                  { title: "VFS application fee", desc: "Payable directly at the VFS Global center or online during application booking.", cost: 75 },
                  { title: "Visa Processing Duration", desc: "Takes between 6 to 12 weeks. Apply as soon as you receive your admissions letter.", cost: 0, override: "6 - 12 Weeks" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
                    <div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">Fact 0{idx+1}</span>
                      <h3 className="font-extrabold text-slate-900 text-xs mb-2">{item.title}</h3>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mb-4">{item.desc}</p>
                    </div>
                    <div className="border-t border-slate-200 pt-3 text-xs">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Value / Duration</span>
                      <strong className="text-indigo-650 font-black text-xs md:text-sm block mt-0.5">
                        {item.override ? item.override : formatCost(item.cost)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Step-by-Step VFS Process */}
            <section id="steps" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🗺️ Step-by-Step Student Visa Process</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Sequence of events for a successful VFS Global visa filing in India</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {steps.map((step, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-xs transition-shadow">
                    <div>
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Step {step.num}</span>
                      <h4 className="font-extrabold text-slate-905 text-xs mb-1 mt-1">{step.t}</h4>
                      <p className="text-slate-500 text-[10px] font-semibold leading-snug">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                <Info size={16} className="text-indigo-650 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-655 font-semibold leading-relaxed">
                  <strong>VFS Germany Visa Jurisdictions in India:</strong> Depending on your permanent address or current study location (for at least 6 months), you must apply at the corresponding VFS German Visa center jurisdiction: North (New Delhi), West (Mumbai), South (Bangalore/Chennai), or East (Kolkata). Ensure you book your appointment at the correct center.
                </p>
              </div>
            </section>

            {/* 3. VFS Document Checklist */}
            <section id="checklist" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-650" size={24} />
                  📋 VFS Document Checklist
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Organize these documents in two identical sets (original + copy) for submission</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 font-semibold">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h4 className="font-black text-slate-900 text-xs">{doc.title}</h4>
                        <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">{doc.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Post-Arrival Requirements */}
            <section id="post-arrival" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">🇩🇪 Post-Arrival Requirements in Germany</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Essential administrative steps to complete within your first few weeks on campus</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-705 font-semibold">
                {[
                  { t: "1. Address Registration (Meldebescheinigung)", d: "Within 14 days of moving into your housing, you must register your address at the local citizens' office (Bürgeramt). You will receive an official Meldebescheinigung, which is required for all other paperwork." },
                  { t: "2. Set Up Statutory Health Insurance", d: "Provide your enrollment letters to a German public health insurance provider (e.g. Techniker Krankenkasse - TK, AOK) to initiate your full healthcare cover. A health insurance certificate is required for university enrollment." },
                  { t: "3. Open a Local Bank Account", d: "Connect your Blocked Account (Expatrio, Fintiba) to a local German bank (e.g., Sparkasse, N26, Deutsche Bank) to receive your monthly €992 payout. You will use this account for rent and utility transfers." },
                  { t: "4. Obtain Student Residence Permit (Aufenthaltstitel)", d: "Your initial entry visa is valid for only 3 to 6 months. Apply at the local Immigration Office (Ausländerbehörde) for your electronic student residence permit (Aufenthaltstitel) valid for 1-2 years." }
                ].map((item, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <h4 className="font-extrabold text-slate-900 text-xs mb-2">{item.t}</h4>
                    <p className="text-slate-500 leading-relaxed text-[11px]">{item.d}</p>
                  </div>
                ))}
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

export default GermanyVisaPage;
