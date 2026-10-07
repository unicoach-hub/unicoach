import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, 
  HelpCircle, Coins, FileText, UserCheck, ShieldAlert, ChevronDown, 
  Check, Info, Award, Target, Landmark, X, ChevronRight, GraduationCap, 
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import ShortlistWizardWidget from '../../../../../components/ShortlistWizardWidget';
import { useLead } from '../../../../../context/LeadContext';

const SECTIONS = [
  { id: 'types', title: 'Which Visa Do You Need?' },
  { id: 'phases', title: 'The 3-Phase Process' },
  { id: 'phase1', title: 'Phase 1: Academic Clearance' },
  { id: 'phase2', title: 'Phase 2: Document Checklist' },
  { id: 'phase3', title: 'Phase 3: Post-Arrival Steps' },
  { id: 'finances', title: 'Financial Proof Deep Dive' },
  { id: 'sponsorship', title: 'Sponsorship Rules' },
  { id: 'interview', title: 'Interview Preparation' },
  { id: 'costs', title: 'Timeline & Costs' },
  { id: 'rejections', title: 'Rejection Causes' },
  { id: 'faq', title: 'FAQ' }
];

const visaTypes = [
  {
    type: "National Visa (Type D) - Mandatory for Degree Students",
    duration: "More than 90 days",
    eligibility: "Bachelor's, Master's, PhD, or full degree programs",
    work: "Yes (20 hours / week)",
    benefits: "Allows you to apply for a Residence Permit (Permesso di Soggiorno) upon arrival, legalizing your stay.",
    fee: "€76"
  },
  {
    type: "Short-Term Visa (Type C)",
    duration: "Up to 90 days",
    eligibility: "Short language programs or preparatory courses",
    work: "No",
    benefits: "Does not confer long-term residency or work rights in Italy.",
    fee: "€80"
  }
];

const masterChecklist = [
  { id: 1, doc: "Valid Passport", check: "10 years old max; 3+ months validity beyond study; 2 blank pages" },
  { id: 2, doc: "Visa Application Form", check: "Fully completed and signed; minors require both parents' signatures" },
  { id: 3, doc: "Passport Photos (2)", check: "White background; recently taken" },
  { id: 4, doc: "Covering Letter / SOP", check: "1 page max; covers course choice, finances, and accommodation plans" },
  { id: 5, doc: "Official Acceptance Letter", check: "Official admission letter from accredited Italian institution" },
  { id: 6, doc: "Universitaly Summary", check: "Downloaded from portal; must be officially stamped by Consulate" },
  { id: 7, doc: "Academic Certificates", check: "HED attested + MEA apostilled (SDM is not accepted)" },
  { id: 8, doc: "Academic Transcripts", check: "HED attested + MEA apostilled (SDM is not accepted)" },
  { id: 9, doc: "DOV or CIMEA Certificate", check: "Declaration of Value or CIMEA Statement of Comparability" },
  { id: 10, doc: "Language Proficiency Proof", check: "B2 Level CEFR equivalent (IELTS, TOEFL, or MOI)" },
  { id: 11, doc: "Financial Proof", check: "Minimum €6,947.33 + 6 months bank statement + 3 years ITR" },
  { id: 12, doc: "Sponsorship Letter", check: "From parents or legal guardians ONLY (with ID and financial records)" },
  { id: 13, doc: "Health Insurance", check: "Minimum €30,000 coverage with explicit repatriation clause" },
  { id: 14, doc: "Accommodation Proof", check: "First 30 days confirmed (hotel booking, dorm, or invitation letter)" },
  { id: 15, doc: "Flight Reservation", check: "Round-trip reservation or €2,000 buffer proof in account" }
];

const interviewQA = [
  {
    q: "Why this specific university?",
    strategy: "Compare 2-3 alternatives; show informed academic interest in this institution's faculties."
  },
  {
    q: "Why study this in Italy?",
    strategy: "Highlight Italy's global leadership and academic pedigree in your field (e.g. design, engineering)."
  },
  {
    q: "What does your sponsor do?",
    strategy: "State their profession and income clearly; ensure it matches the ITR documents exactly."
  },
  {
    q: "What are your plans after graduation?",
    strategy: "Never suggest immigration or staying permanently; detail clear return plans to work or run a business in India."
  }
];

const faqList = [
  { q: "How do I get a student visa for Italy?", a: "First, secure your university acceptance letter and complete your pre-enrolment on the Universitaly portal. Once authorized, prepare the 15 required documents and schedule an appointment at the VFS/Consulate. Finally, apply for your Residence Permit (Permesso di Soggiorno) within 8 days of arriving in Italy." },
  { q: "Can I work while studying in Italy?", a: "Yes, a Type D student visa allows you to work part-time for up to 20 hours per week during academic semesters, and up to 40 hours per week during official holidays and breaks." },
  { q: "What is the minimum bank balance?", a: "You need a minimum annual living fund of €6,947.33 (~₹7,26,423), plus €2,000 if you do not submit a round-trip flight ticket. This must be backed by 6 months of stamped bank statements and 3 years of ITR from you or your sponsor." },
  { q: "What is the visa cost?", a: "The Type D visa fee is €76 (~₹7,946). Together with VFS charges, health insurance, and post-arrival residence permit fees, the initial visa-related expenses total roughly €336 (~₹35,000+)." },
  { q: "Is IELTS required?", a: "No, IELTS is not mandatory for the student visa itself, as long as your university accepts alternative proof of language proficiency (like a Medium of Instruction certificate)." },
  { q: "Is it difficult to get an Italy student visa?", a: "No. The visa approval rate for Indian students is historically around 85–90%. Rejections almost always happen due to preventable document errors, missing stamps, or ineligible sponsors." }
];

const countryShortlistOptions = [
  { name: 'UK', flag: 'https://flagcdn.com/w40/gb.png' },
  { name: 'USA', flag: 'https://flagcdn.com/w40/us.png' },
  { name: 'Germany', flag: 'https://flagcdn.com/w40/de.png' },
  { name: 'Australia', flag: 'https://flagcdn.com/w40/au.png' },
  { name: 'Ireland', flag: 'https://flagcdn.com/w40/ie.png' },
  { name: 'New Zealand', flag: 'https://flagcdn.com/w40/nz.png' },
  { name: 'Canada', flag: 'https://flagcdn.com/w40/ca.png' },
  { name: 'UAE', flag: 'https://flagcdn.com/w40/ae.png' },
  { name: 'France', flag: 'https://flagcdn.com/w40/fr.png' },
  { name: 'Sweden', flag: 'https://flagcdn.com/w40/se.png' },
  { name: 'Italy', flag: 'https://flagcdn.com/w40/it.png' },
  { name: 'Other', flag: '🌍' }
];

const ItalyVisa = () => {
  const [activeSection, setActiveSection] = useState('types');
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [checkedDocs, setCheckedDocs] = useState(Array(15).fill(false));
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const { openEligibilityModal } = useLead();

  // Shortlist Wizard State
  const [selectedCountry, setSelectedCountry] = useState('Italy');

  const exchangeRate = 103.58;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
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
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€${valInEUR.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    }
    const valInINR = valInEUR * exchangeRate;
    return `₹${Math.round(valInINR).toLocaleString('en-IN')}`;
  };

  const toggleDoc = (idx) => {
    const next = [...checkedDocs];
    next[idx] = !next[idx];
    setCheckedDocs(next);
  };

  const docProgressPercent = Math.round((checkedDocs.filter(Boolean).length / 15) * 100);

  // Wizard Handler
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };


  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-x-clip pt-28 pb-20 font-sans">
      {/* Ambient backgrounds */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-indigo-100/20 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute top-[25%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-blue-450/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[15%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-emerald-300/5 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-[1440px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/italy" className="hover:text-indigo-650 transition-colors">Italy</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Student Visa Guide</span>
        </div>

        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <ShieldCheck size={14} className="text-indigo-650" />
            <span>Last Updated: December 17, 2025</span>
            <span className="text-indigo-300">•</span>
            <Clock size={14} className="text-indigo-650" />
            <span>11 Min Read</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Italy Student Visa Guide 2026:<br />
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Requirements, Cost & Success Tips</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-2xl mx-auto">
            Comprehensive compliance blueprints and application steps tailored specifically for Indian international students.
          </p>
        </motion.div>

        {/* Bottom Line Up Front Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-[32px] p-8 md:p-12 shadow-xl mb-16 relative overflow-hidden text-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(16,185,129,0.12),transparent_50%)]" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-5">
              <AlertTriangle size={14} />
              <span>The Bottom Line Up Front</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
              One missing stamp. One incorrect insurance clause. One wrong sponsor.
            </h2>
            <p className="text-slate-350 text-sm md:text-base font-semibold leading-relaxed mb-4">
              Any of these can delay your visa by 90 days—and push your enrollment past the first semester.
            </p>
            <p className="text-slate-350 text-sm md:text-base font-semibold leading-relaxed mb-4">
              Italy is actively welcoming Indian students through the <strong className="text-indigo-300">Italy-India Migration and Mobility Agreement</strong>. But the visa process? It's strictly rule-based. No exceptions.
            </p>
            <p className="text-emerald-400 text-sm md:text-base font-extrabold leading-relaxed">
              This guide breaks down everything you need—visa types, documents, finances, interview tips—in a way that actually makes sense.
            </p>
          </div>
        </motion.div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-xs inline-flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider px-3">Currency Tool:</span>
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-50'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 2 Column Body Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] xl:grid-cols-[1fr_360px] gap-8 xl:gap-12">
          
          {/* Main Content Column */}
          <div className="space-y-16 min-w-0">

            {/* Section 1: Which Visa Do You Need? */}
            <section id="types" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">01</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🧭 Which Visa Do You Need? (Start Here)</h2>
              </div>
              
              {/* Duration Choice Box */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs mb-8">
                <h4 className="font-black text-slate-900 text-sm md:text-base uppercase tracking-wider text-center mb-6">
                  How long is your course?
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-150 transition-colors">
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-200 text-slate-700 tracking-wide mb-3">
                        Less Than 90 Days
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-lg mb-2">Type C Visa (Schengen)</h4>
                      <ul className="space-y-2 text-xs font-semibold text-slate-500 mb-6">
                        <li>• Short-term language courses</li>
                        <li>• Certification programs or bootcamps</li>
                        <li>• Training seminars</li>
                      </ul>
                    </div>
                    <div className="border-t border-slate-150/70 pt-4 flex justify-between items-center text-[10px] font-black uppercase">
                      <span className="text-slate-500">Application Fee:</span>
                      <span className="text-slate-800">€80 (~₹8,365)</span>
                    </div>
                  </div>

                  <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-300 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 tracking-wide mb-3">
                        More Than 90 Days
                      </span>
                      <h4 className="font-extrabold text-indigo-950 text-lg mb-2">Type D Visa (National)</h4>
                      <ul className="space-y-2 text-xs font-semibold text-indigo-900/80 mb-6">
                        <li>• Full Bachelor's Degree</li>
                        <li>• Postgraduate/Master's Degrees</li>
                        <li>• PhD Programs</li>
                      </ul>
                    </div>
                    <div className="border-t border-indigo-100 pt-4 flex justify-between items-center text-[10px] font-black uppercase">
                      <span className="text-indigo-700">Application Fee:</span>
                      <span className="text-indigo-950 font-bold">€76 (~₹7,946)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-center gap-3">
                  <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                  <span className="text-xs font-extrabold text-amber-950">
                    ⚠️ Degree-seeking students must apply for a Type D Visa.
                  </span>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">Feature</th>
                        <th className="p-5 font-black text-slate-600 text-xs uppercase tracking-wider">Type C (Short-Term)</th>
                        <th className="p-5 font-black text-indigo-750 text-xs uppercase tracking-wider bg-indigo-50/30">Type D (Long-Term)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {visaTypes.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-slate-900 font-bold">{row.duration}</td>
                          <td className="p-5 text-slate-500">{row.type === "Short-Term Visa (Type C)" ? "Up to 90 days" : "More than 90 days"}</td>
                          <td className="p-5 text-indigo-950 bg-indigo-50/10 font-bold">{row.duration === "More than 90 days" ? "Type D Visa (National)" : "Type C Visa (Schengen)"}</td>
                        </tr>
                      ))}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5 text-slate-900 font-bold">Residence Permit</td>
                        <td className="p-5 text-rose-600 font-extrabold">❌ Not required</td>
                        <td className="p-5 text-emerald-600 bg-indigo-50/10 font-extrabold">✅ Mandatory</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5 text-slate-900 font-bold">Work Rights</td>
                        <td className="p-5 text-rose-600 font-extrabold">❌ No</td>
                        <td className="p-5 text-emerald-600 bg-indigo-50/10 font-extrabold">✅ 20 hrs/week</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5 text-slate-900 font-bold">Application Fee</td>
                        <td className="p-5 text-slate-500">€80 (~₹8,365)</td>
                        <td className="p-5 text-indigo-950 bg-indigo-50/10 font-bold">€76 (~₹7,946)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Shortlist Wizard Common Page Feature */}
            <section id="shortlist-wizard" className="scroll-mt-24">
              <ShortlistWizardWidget 
                title="Get Your University Shortlist" 
                subtitle="Still confused about visa classifications? Get tailored advice." 
              />
            </section>

            {/* Section 2: The 3-Phase Process */}
            <section id="phases" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">02</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🔄 The 3-Phase Compliance Process</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Think of this as a waterfall model—each phase must be 100% complete before moving to the next.
              </p>

              {/* Waterfall Steps UI */}
              <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 before:pointer-events-none">
                
                {/* Phase 1 */}
                <div className="relative pl-12 flex gap-4">
                  <div className="absolute left-3 w-6.5 h-6.5 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center border-4 border-white shadow-xs">1</div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs w-full">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Phase 1</span>
                    <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-3">Academic Clearance</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <li className="bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-indigo-600 shrink-0" />
                        Universitaly Pre-enrolment
                      </li>
                      <li className="bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-indigo-600 shrink-0" />
                        Apostille + DOV / CIMEA
                      </li>
                      <li className="bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-indigo-600 shrink-0" />
                        Language Proficiency Proof
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="relative pl-12 flex gap-4">
                  <div className="absolute left-3 w-6.5 h-6.5 rounded-full bg-indigo-650 text-white font-black text-xs flex items-center justify-center border-4 border-white shadow-xs">2</div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs w-full">
                    <span className="text-[10px] font-black text-indigo-650 uppercase tracking-widest block mb-1">Phase 2</span>
                    <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-3">Visa Application</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <li className="bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-indigo-650 shrink-0" />
                        Complete Document Package
                      </li>
                      <li className="bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-indigo-650 shrink-0" />
                        Consular Interview
                      </li>
                      <li className="bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-indigo-650 shrink-0" />
                        Visa Approval
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="relative pl-12 flex gap-4">
                  <div className="absolute left-3 w-6.5 h-6.5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center border-4 border-white shadow-xs">3</div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs w-full">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Phase 3</span>
                    <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-3">Post-Arrival Legalization</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <li className="bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        Residence Permit (within 8 days)
                      </li>
                      <li className="bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        Work Rights Activated
                      </li>
                      <li className="bg-slate-50 p-3 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        Post-Study Options Open
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            </section>

            {/* Section 3: Phase 1: Academic Clearance */}
            <section id="phase1" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">03</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📋 Phase 1: Academic Clearance</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Your visa journey starts with your university, not the consulate.
              </p>

              {/* 1. Universitaly Portal Info block */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs mb-8">
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-650" />
                  1️⃣ UNIVERSITALY Pre-enrolment
                </h4>
                
                <div className="bg-indigo-50/20 border border-indigo-100/50 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 border-b border-indigo-100/50 pb-3">
                    <span className="text-[10px] font-black text-indigo-600 uppercase">What it is:</span>
                    <span className="text-xs font-bold text-slate-700">Official Italian Ministry of Education portal for non-EU applicants</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 border-b border-indigo-100/50 pb-3">
                    <span className="text-[10px] font-black text-indigo-600 uppercase">What it does:</span>
                    <span className="text-xs font-bold text-slate-700">Secures MUR (Ministero dell'Università e della Ricerca) authorization</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                    <span className="text-[10px] font-black text-indigo-600 uppercase">Output:</span>
                    <span className="text-xs font-bold text-slate-700">Pre-enrolment Summary document</span>
                  </div>
                </div>

                <div className="mt-4 bg-amber-50 border border-amber-200/50 rounded-xl p-4 flex items-center gap-3">
                  <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                  <span className="text-xs font-extrabold text-amber-950">
                    ⚠️ MUST BE STAMPED BY THE CONSULATE
                  </span>
                </div>
              </div>

              {/* 2. Document Verification Flow */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs mb-8">
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-6 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-650" />
                  2️⃣ Document Verification Process
                </h4>
                
                {/* Horizontal flow line */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                  {[
                    { step: "Your Degree", label: "Original certificate" },
                    { step: "HED Attestation", label: "State attestation" },
                    { step: "MEA Apostille", label: "Ministry approval" },
                    { step: "DOV / CIMEA Certificate", label: "Value validation" }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/70 text-center relative group">
                      <span className="absolute top-2 left-3 text-[10px] font-black text-indigo-200">0{idx + 1}</span>
                      <h5 className="font-extrabold text-slate-900 text-xs mb-1 mt-2">{item.step}</h5>
                      <p className="text-slate-400 text-[10px] font-semibold">{item.label}</p>
                      {idx < 3 && (
                        <ChevronRight className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-300 z-10" size={16} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex items-center gap-3">
                    <span className="w-5 h-5 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-black text-[10px] shrink-0">✕</span>
                    <span className="text-xs font-bold text-rose-950">SDM Attestations = NOT Accepted</span>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                    <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-[10px] shrink-0">✓</span>
                    <span className="text-xs font-bold text-emerald-950">HED + MEA = Required Path</span>
                  </div>
                </div>
              </div>

              {/* 3. Language Proficiency block */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-650" />
                  3️⃣ Language Proficiency (CEFR B2 Level)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="border border-slate-100 rounded-xl p-5 hover:border-indigo-150 transition-colors">
                    <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">English-Taught Program</h5>
                    <ul className="space-y-2 text-xs font-semibold text-slate-500">
                      <li>• IELTS Academic (accepted, not mandatory)</li>
                      <li>• TOEFL iBT exam score</li>
                      <li>• Medium of Instruction (MOI) Certificate</li>
                    </ul>
                  </div>

                  <div className="border border-slate-100 rounded-xl p-5 hover:border-indigo-150 transition-colors">
                    <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">Italian-Taught Program</h5>
                    <ul className="space-y-2 text-xs font-semibold text-slate-500">
                      <li>• CILS A2 or above</li>
                      <li>• CELI B2 certification</li>
                      <li>• Italian university qualifying test</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-5 bg-indigo-50/40 border border-indigo-100/50 rounded-xl p-4 flex items-start gap-3">
                  <Info className="text-indigo-600 shrink-0 mt-0.5" size={16} />
                  <span className="text-xs font-semibold text-indigo-900 leading-normal">
                    💡 IELTS is not strictly mandatory for the Italian visa itself, as long as the host institution explicitly approves a Medium of Instruction (MOI) verification.
                  </span>
                </div>
              </div>
            </section>

            {/* Section 4: Phase 2: Document Checklist */}
            <section id="phase2" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">04</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📂 Phase 2: Complete Document Checklist</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-6">
                Think of this as your visa survival kit. Use the interactive checklist below to track your document dossier status:
              </p>

              {/* Interactive document tracker progress */}
              <div className="bg-slate-50/80 border border-slate-150/70 rounded-2xl p-5 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <h4 className="font-black text-slate-900 text-sm">Document Dossier Progress</h4>
                  <p className="text-slate-400 text-xs font-bold uppercase mt-1">
                    {checkedDocs.filter(Boolean).length} of 15 Documents Prepared
                  </p>
                </div>
                <div className="w-full md:w-64 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${docProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Master Checklist Grid */}
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider w-16">#</th>
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">Required Document</th>
                        <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-wider">Compliance Checklist Rule</th>
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider w-20 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {masterChecklist.map((item, idx) => {
                        const isChecked = checkedDocs[idx];
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-5 text-slate-450 font-bold">{item.id}</td>
                            <td className="p-5 text-slate-900 font-bold">{item.doc}</td>
                            <td className="p-5 text-slate-500 text-xs">{item.check}</td>
                            <td className="p-5 text-center">
                              <button
                                onClick={() => toggleDoc(idx)}
                                className={`w-8 h-8 rounded-lg border transition-all cursor-pointer flex items-center justify-center mx-auto ${
                                  isChecked 
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-2xs' 
                                    : 'border-slate-200 text-slate-300 hover:border-slate-400 hover:text-slate-500'
                                }`}
                              >
                                {isChecked ? <Check size={16} className="stroke-[3]" /> : '☐'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Document Flowchart warning */}
              <div className="bg-indigo-50/50 border border-indigo-150 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-indigo-950 text-sm mb-1">Application Submission Gate</h5>
                    <p className="text-indigo-900/80 text-xs font-semibold leading-relaxed">
                      Make sure all 15 document requirements are checked and fully complied with before you book your VFS visa slot.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => scrollToSection('rejections')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
                >
                  Review Pitfalls
                </button>
              </div>
            </section>

            {/* Section 5: Phase 3: Post-Arrival Steps */}
            <section id="phase3" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">05</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🏠 Phase 3: Post-Arrival Legalization</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Your student visa grants entry into Italy. The post-arrival legalization steps keep you there legally.
              </p>

              {/* Residence Permit Timeline */}
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="text-indigo-600" size={18} />
                Residence Permit Timeline
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 relative">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 relative">
                  <span className="text-[10px] text-indigo-600 font-black uppercase tracking-wider block mb-1">Day 0</span>
                  <h4 className="font-extrabold text-slate-950 text-sm mb-2">Arrive in Italy</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Check in at your accommodation and secure your entry declaration stamps at border controls.
                  </p>
                </div>
                
                <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-2xs relative">
                  <span className="text-[10px] text-indigo-650 font-black uppercase tracking-wider block mb-1">Within 8 Days</span>
                  <h4 className="font-extrabold text-indigo-950 text-sm mb-2">Apply for Residence Permit</h4>
                  <p className="text-slate-550 text-xs font-semibold leading-relaxed">
                    Submit your application for the official Residence Permit (Permesso di Soggiorno).
                  </p>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 relative">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Post Office Step</span>
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Poste Italiane & Kit Giallo</h4>
                  <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                    Collect and complete the "kit giallo" yellow forms, pay fees (~€120), and keep the receipt.
                  </p>
                </div>
              </div>

              {/* Work Rights Breakdown */}
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Coins className="text-indigo-600" size={18} />
                Work Rights Breakdown
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="border border-slate-100 rounded-2xl p-5 bg-white">
                  <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">During Academic Term</h5>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-black text-slate-900">20</span>
                    <span className="text-slate-550 text-xs font-bold">hours / week max</span>
                  </div>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Part-time work is allowed to cover supplementary expenses. Average student pay ranges around <strong>€10–15/hour</strong>.
                  </p>
                </div>

                <div className="border border-slate-100 rounded-2xl p-5 bg-white">
                  <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3">During Academic Holidays</h5>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-black text-slate-900">40</span>
                    <span className="text-slate-550 text-xs font-bold">hours / week max</span>
                  </div>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Full-time employment is permissible during summer recess and official school term breaks.
                  </p>
                </div>
              </div>

              <div className="mt-5 bg-indigo-50/60 border border-indigo-100 rounded-xl p-5">
                <h5 className="text-indigo-950 font-black text-xs md:text-sm mb-2 flex items-center gap-1.5">
                  <Award size={16} className="text-indigo-600" />
                  Post-Study & Residency Path
                </h5>
                <p className="text-indigo-900 text-xs font-semibold leading-relaxed">
                  Upon completion of your degree, you can apply to extend your stay for up to <strong>12 months</strong> under a post-study work-search visa. Permanent residence paths open after <strong>5 years</strong> of legal, continuous stay.
                  </p>
              </div>
            </section>

            {/* Section 6: Financial Proof Deep Dive */}
            <section id="finances" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">06</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">💰 Financial Proof Deep Dive</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Insufficient financial documentation is the <strong>number one reason</strong> for student visa rejections in Italy.
              </p>

              {/* Requirement Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 text-center">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Annual Minimum</span>
                  <span className="text-2xl font-black text-indigo-750 block mt-2">{formatCost(6947.33)}</span>
                  <span className="text-slate-400 text-[10px] font-semibold block mt-1">Living funds reserve</span>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-5 text-center">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Monthly Equivalent</span>
                  <span className="text-2xl font-black text-slate-800 block mt-2">{formatCost(534.41)}</span>
                  <span className="text-slate-400 text-[10px] font-semibold block mt-1">Basic maintenance rate</span>
                </div>

                <div className="bg-white border border-amber-250 rounded-2xl p-5 text-center">
                  <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider block mb-1">No Return Ticket Buffer</span>
                  <span className="text-2xl font-black text-amber-700 block mt-2">{formatCost(2000)}</span>
                  <span className="text-slate-400 text-[10px] font-semibold block mt-1">Required additional buffer</span>
                </div>
              </div>

              {/* What You Must Submit */}
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Landmark className="text-indigo-600" size={18} />
                What You Must Submit
              </h3>
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">Required Document</th>
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">Submission Requirement</th>
                        <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-wider">Why It Matters</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5 text-slate-900 font-bold">Bank Statements</td>
                        <td className="p-5 text-slate-600">Last 6 months; stamped & signed on every page by the branch manager</td>
                        <td className="p-5 text-slate-500">Proves liquidity and regular transaction flows</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5 text-slate-900 font-bold">Income Tax Returns (ITR)</td>
                        <td className="p-5 text-slate-600">Last 3 fiscal years (for both applicant and the primary sponsor)</td>
                        <td className="p-5 text-slate-500">Proves legal source of accumulated funds</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5 text-slate-900 font-bold">Educational Loan</td>
                        <td className="p-5 text-slate-600">Sanction letter PLUS proof of disbursement visible in bank statement</td>
                        <td className="p-5 text-slate-500">Sanction letter alone will result in immediate rejection</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Compliance Checklist */}
              <div className="bg-slate-50 border border-slate-150/70 rounded-2xl p-6">
                <h5 className="font-extrabold text-slate-900 text-sm mb-4">Financial Compliance Checklist</h5>
                <ul className="space-y-3">
                  {[
                    "Provide 6 months of ORIGINAL bank statements",
                    "Ensure statements are stamped and signed on every single page by the branch manager",
                    "Provide 3 years of ITR for primary sponsor (+ applicant if applicable)",
                    "If using an educational loan, verify funds are fully disbursed and visible in bank statements",
                    "Verify total balance meets the minimum €6,947.33 annual reserve",
                    "Add +€2,000 to the balance if a confirmed round-trip flight booking is not submitted"
                  ].map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-650">
                      <span className="text-emerald-600 shrink-0 font-black">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 7: Sponsorship Rules */}
            <section id="sponsorship" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">07</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">👨‍👩‍👧‍👦 Sponsorship Rules (Strict!)</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                This rule catches many Indian applicants off guard. Review the eligible sponsor categories:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
                  <h4 className="font-black text-emerald-950 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-650" />
                    ✅ ALLOWED SPONSORS
                  </h4>
                  <ul className="space-y-2.5 text-xs font-semibold text-slate-700">
                    <li>• Father</li>
                    <li>• Mother</li>
                    <li>• Court-Appointed Legal Guardian</li>
                  </ul>
                </div>

                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6">
                  <h4 className="font-black text-rose-950 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                    ❌ NOT ALLOWED SPONSORS
                  </h4>
                  <ul className="space-y-2.5 text-xs font-semibold text-slate-500">
                    <li>• Uncles and Aunts</li>
                    <li>• Grandparents</li>
                    <li>• Siblings (Brothers/Sisters)</li>
                    <li>• Friends or distant relatives</li>
                  </ul>
                </div>
              </div>

              {/* Sponsor documents list */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
                <h4 className="font-black text-slate-900 text-sm md:text-base mb-4 flex items-center gap-2">
                  <FileText className="text-indigo-600" size={18} />
                  Required Documents from Sponsor
                </h4>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {[
                    "Formal sponsorship letter (signed)",
                    "ID proofs (Aadhaar / PAN / Passport)",
                    "Last 6 months of original, stamped bank statements",
                    "Last 3 years of Income Tax Returns (ITR)"
                  ].map((doc, idx) => (
                    <li key={idx} className="bg-slate-50 p-4 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[10px] shrink-0">{idx + 1}</span>
                      {doc}
                    </li>
                  ))}
                </ul>

                <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4 space-y-2 text-xs font-semibold text-amber-900">
                  <p>💡 <strong>Note on Name Match:</strong> Sponsor names must match academic records and passports exactly.</p>
                  <p>💡 If minor discrepancies exist, you must submit a formal, notarized <strong>"One and Same Person"</strong> certificate.</p>
                </div>
              </div>
            </section>

            {/* Section 8: Interview Preparation */}
            <section id="interview" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">08</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🎤 Interview Preparation</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                The consular interview is your final hurdle. Treat it like a professional conversation, not an interrogation.
              </p>

              {/* Interview Success Blueprint */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs mb-8">
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-6 flex items-center gap-2">
                  <Target className="text-indigo-600" size={18} />
                  Interview Success Blueprint
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { num: "1", title: "Show Strong India Ties", desc: "Clearly detail family businesses, job prospects, or post-study career goals back home." },
                    { num: "2", title: "Demonstrate Academic Expertise", desc: "Be prepared to list your course modules, syllabus, faculty, and why you picked Italy." },
                    { num: "3", title: "Explain Finances with Precision", desc: "Recite your exact sponsor income and tuition fees to match paperwork perfectly." },
                    { num: "4", title: "Maintain Professional Etiquette", desc: "Dress formally, arrive early, keep answers concise, and speak clearly in English." }
                  ].map((step, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/60 flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">{step.num}</span>
                      <div>
                        <h5 className="font-black text-slate-900 text-xs mb-1">{step.title}</h5>
                        <p className="text-slate-550 text-[11px] font-semibold leading-normal">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QA Template */}
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <HelpCircle className="text-indigo-600" size={18} />
                Common Questions & How to Answer
              </h3>
              
              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider w-1/3">Category Question</th>
                        <th className="p-5 font-black text-slate-700 text-xs uppercase tracking-wider">Consular Preparation Strategy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {interviewQA.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-slate-900 font-bold">"{row.q}"</td>
                          <td className="p-5 text-slate-500 text-xs leading-relaxed">{row.strategy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Answer Template */}
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden">
                <h4 className="text-indigo-300 font-black text-xs uppercase tracking-wider mb-4">
                  Why do you want to study in Italy? (Sample Answer Template)
                </h4>
                <blockquote className="text-xs md:text-sm font-semibold leading-relaxed text-slate-200 border-l-2 border-indigo-400 pl-4 mb-4">
                  "I chose Italy because [specific reason about program or university]. This program offers [specific module or research opportunity] that isn't available in India. After completing my degree, I plan to return to India and pursue [specific career goal]."
                </blockquote>
                <div className="flex gap-4 text-[10px] font-black uppercase text-emerald-400">
                  <span>✓ Shows active research</span>
                  <span>✓ Specific academic interest</span>
                  <span>✓ Confirms return intent</span>
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-5">
                  <h5 className="font-extrabold text-emerald-950 text-xs mb-3 uppercase tracking-wider">✅ Interview DOs</h5>
                  <ul className="space-y-2 text-xs font-semibold text-slate-650">
                    <li>• Arrive at least 30 minutes before your slot</li>
                    <li>• Dress in clean, professional/formal attire</li>
                    <li>• Answer questions concisely and confidently</li>
                    <li>• Recite details that match submitted documents exactly</li>
                  </ul>
                </div>

                <div className="bg-rose-50/30 border border-rose-100 rounded-xl p-5">
                  <h5 className="font-extrabold text-rose-950 text-xs mb-3 uppercase tracking-wider">❌ Interview DONTs</h5>
                  <ul className="space-y-2 text-xs font-semibold text-slate-500">
                    <li>• Do not show up late or in rushed, casual clothes</li>
                    <li>• Avoid long, rambling, or over-explained details</li>
                    <li>• Never contradict facts mentioned in your paperwork</li>
                    <li>• Do not suggest that you intend to settle or work primarily</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 9: Timeline & Costs */}
            <section id="costs" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">09</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">⏰ Timeline & Costs</h2>
              </div>
              
              {/* Cost visuals */}
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Coins className="text-indigo-600" size={18} />
                Initial Fee Breakdown
              </h3>
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { cost: "€76", label: "Type D Visa Fee" },
                    { cost: "~€40", label: "VFS Service Fee" },
                    { cost: "~€100", label: "Health Insurance (6mo)" },
                    { cost: "~€120", label: "Residence Permit Fee" }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl text-center">
                      <span className="text-lg md:text-xl font-black text-indigo-750 block">{item.cost}</span>
                      <span className="text-slate-450 text-[10px] font-bold uppercase tracking-wide block mt-1">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                  <span className="text-xs font-bold text-slate-500">TOTAL INITIAL COST: </span>
                  <span className="text-base font-black text-slate-900 ml-1">~€336 (~₹35,000+)</span>
                </div>
              </div>

              {/* Processing Timeline Flow */}
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="text-indigo-600" size={18} />
                Visa Processing Timetable
              </h3>
              <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative before:hidden md:before:block before:absolute before:left-1/6 before:right-1/6 before:top-10 before:h-0.5 before:bg-slate-100 before:pointer-events-none">
                  
                  <div className="text-center relative">
                    <span className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-indigo-600 text-indigo-600 font-black text-xs flex items-center justify-center mx-auto mb-3">01</span>
                    <h5 className="font-extrabold text-slate-900 text-xs mb-1">Application Submission</h5>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Day 0</span>
                  </div>

                  <div className="text-center relative">
                    <span className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-indigo-600 text-indigo-600 font-black text-xs flex items-center justify-center mx-auto mb-3">02</span>
                    <h5 className="font-extrabold text-slate-900 text-xs mb-1">Consular Processing</h5>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">2 to 8 Weeks</span>
                  </div>

                  <div className="text-center relative">
                    <span className="w-8 h-8 rounded-full bg-emerald-50 border-2 border-emerald-600 text-emerald-600 font-black text-xs flex items-center justify-center mx-auto mb-3">03</span>
                    <h5 className="font-extrabold text-slate-900 text-xs mb-1">Approval & Flight Departure</h5>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Up to 90 Days Limit</span>
                  </div>
                </div>

                <div className="mt-8 bg-amber-50 border border-amber-200/50 rounded-xl p-4 text-xs font-semibold text-amber-950 space-y-1">
                  <p>⚠️ <strong>Submission Window:</strong> Submit application at least 3 months prior to departure date.</p>
                  <p>⚠️ <strong>Official Deadline:</strong> The final pre-enrolment deadline typically closes around November 28.</p>
                </div>
              </div>
            </section>

            {/* Section 10: Common Rejections Causes */}
            <section id="rejections" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">10</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">🛑 Common Rejection Causes & Prevention</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Learn from other applicants' mistakes. Protect your dossier against common reasons for visa denial:
              </p>

              <div className="bg-white border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider w-1/3">Cause for Visa Rejection</th>
                        <th className="p-5 font-black text-slate-800 text-xs uppercase tracking-wider">Proactive Prevention Strategy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {[
                        { cause: "Insufficient financial proof", fix: "Submit 3 years of detailed ITR plus 6 months manager-stamped original statements." },
                        { cause: "Loan funds not disbursed", fix: "Disburse the required educational loan funds to your statement account before filing." },
                        { cause: "Ineligible sponsor categories", fix: "Submit sponsorship documentation from parents or legal guardians ONLY." },
                        { cause: "Missing Apostille verification", fix: "Ensure attestation is completed via HED and apostilled via the MEA." },
                        { cause: "Insurance lacks repatriation clause", fix: "Confirm with provider that medical repatriation is explicitly detailed in the certificate." },
                        { cause: "Name discrepancies on papers", fix: "Provide a formal notarized 'One and Same' certificate to clear differences." },
                        { cause: "Weak ties back to home country", fix: "Articulate specific career positions or family ties in India for post-grad return." },
                        { cause: "Late submission timing", fix: "Complete VFS application at least 90 days before academic classes begin." }
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-rose-700 font-bold">{row.cause}</td>
                          <td className="p-5 text-slate-600 text-xs leading-normal">{row.fix}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 11: FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm">11</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">❓ Frequently Asked Questions</h2>
              </div>
              <p className="text-slate-600 font-semibold leading-relaxed mb-8">
                Got questions? We've compiled quick answers to the most common queries:
              </p>

              <div className="space-y-4">
                {faqList.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      className="bg-white border border-slate-150/70 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-200"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-indigo-750 transition-colors gap-4 cursor-pointer"
                      >
                        <span className="text-sm md:text-base font-extrabold leading-snug">{faq.q}</span>
                        <ChevronDown 
                          size={18} 
                          className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} 
                        />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <div className="px-5 pb-5 pt-1 text-slate-500 text-xs md:text-sm font-semibold leading-relaxed border-t border-slate-50">
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

            {/* In-article CTA banner */}
            <div className="mt-12">
              <StudyAbroadCTA country="Italy" />
            </div>

            {/* Disclaimer */}
            <p className="text-slate-450 text-[10px] font-semibold leading-relaxed text-center mt-6">
              Disclaimer: Fees, timelines, and requirements are subject to change. Always verify with official sources and your specific consulate.
            </p>

          </div>

          {/* Sticky Sidebar */}
          <aside className="hidden lg:block relative h-full">
            <div className="sticky top-28 space-y-6">
              
              {/* Navigation list */}
              <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-xs">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-5 flex items-center gap-2">
                  <FileText size={14} className="text-indigo-600" />
                  Guide Navigation
                </h4>
                
                <nav className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                  {SECTIONS.map((sec) => {
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => scrollToSection(sec.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 group cursor-pointer ${
                          isActive 
                            ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-extrabold' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full transition-all ${
                          isActive ? 'bg-indigo-600 scale-125' : 'bg-slate-300 group-hover:bg-slate-400'
                        }`} />
                        <span className="truncate">{sec.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Reference Card */}
              <div className="bg-slate-900 text-white rounded-[24px] p-6 shadow-sm border border-slate-800">
                <h4 className="font-black text-xs uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  Quick Reference
                </h4>
                <div className="space-y-3.5 text-[11px] font-semibold text-slate-300">
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] font-black tracking-wider">Visa Type & Fee</span>
                    <span className="text-white font-bold block mt-0.5">Type D (National) / €76</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] font-black tracking-wider">Timeline Window</span>
                    <span className="text-white font-bold block mt-0.5">Apply at least 3 months early</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] font-black tracking-wider">Min Annual Funds</span>
                    <span className="text-white font-bold block mt-0.5">€6,947.33 (~₹7,26,423)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] font-black tracking-wider">Accepted Sponsors</span>
                    <span className="text-emerald-400 font-bold block mt-0.5">Parents / Legal Guardians ONLY</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] font-black tracking-wider">Health Insurance</span>
                    <span className="text-white font-bold block mt-0.5">€30,000 + Repatriation Clause</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] font-black tracking-wider">Residence Permit</span>
                    <span className="text-white font-bold block mt-0.5">Apply within 8 days of arrival</span>
                  </div>
                </div>
              </div>

            </div>
          </aside>

        </div>

      </div>
    </div>
  );
};

export default ItalyVisa;
