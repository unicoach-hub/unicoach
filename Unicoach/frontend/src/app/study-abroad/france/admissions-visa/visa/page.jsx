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
  { id: 'visa-types', title: 'Visa Classifications' },
  { id: 'eligibility', title: 'Eligibility & Checklist' },
  { id: 'financials', title: 'Financial Requirements' },
  { id: 'accommodation', title: 'Accommodation Mandate' },
  { id: 'process', title: 'Step-by-Step VFS Process' },
  { id: 'rejections', title: 'Common Visa Pitfalls' },
  { id: 'post-arrival', title: 'Post-Arrival Checklist' },
  { id: 'faq', title: 'Frequently Asked Questions' }
];

const visaTypes = [
  {
    type: "Long-Stay Residence Permit (VLS-TS)",
    duration: "4 to 12 months (Renewable)",
    eligibility: "Enrolled in a full Bachelor's or Master's program",
    work: "Yes (964 hours / year)",
    benefits: "Acts as a temporary residence permit. Eligible for CAF housing subsidies. Must validate online via ANEF portal within 3 months of arrival."
  },
  {
    type: "Temporary Long-Stay Visa (VLS-T)",
    duration: "4 to 6 months (Non-renewable)",
    eligibility: "Exchange programs or short certificate courses",
    work: "No",
    benefits: "No validation required upon arrival. Cannot be extended or converted into a full student visa while inside France."
  },
  {
    type: "Short-Stay Schengen Student Visa",
    duration: "Up to 90 days",
    eligibility: "Summer schools, short language bootcamps",
    work: "No",
    benefits: "Grants Schengen-wide mobility. Cannot be converted to long-stay status while inside France."
  },
  {
    type: "Étudiant-Concours (Entrance Exam Visa)",
    duration: "Up to 90 days",
    eligibility: "Sitting for entrance tests or competitive exams in France",
    work: "No",
    benefits: "If you pass the exam, you can apply for a residence permit directly at the local préfecture without returning to India."
  }
];

const checklistItems = [
  { title: "Valid Passport", desc: "Must be valid for the entire duration of the course (preferable at least 15 months beyond arrival) with 2 blank pages." },
  { title: "EEF Portal Confirmation & NOC", desc: "Printed campus France registration verification and confirmation of academic interview." },
  { title: "Official Acceptance Letter", desc: "Unconditional offer letter from a recognized French Higher Education Institution." },
  { title: "Transcripts & Degree Certificates", desc: "Mark sheets from 10th standard upwards. Translated officially if not in French/English." },
  { title: "Language Proficiency Proof", desc: "IELTS (6.0+), TOEFL, or DELF B2 certificate depending on your medium of instruction." },
  { title: "Proof of Financial Funds", desc: "Sanction letter of education loan, parental bank statements, or scholarship awards." },
  { title: "Accommodation Proof (First 3 Months)", desc: "Dorm confirmation, rental agreement, or hotel/Airbnb reservation for at least 90 days." },
  { title: "Travel Health Insurance", desc: "Valid Schengen travel insurance covering repatriation and medical costs up to €30,000." }
];

const FranceVisa = () => {
  const [activeSection, setActiveSection] = useState('visa-types');
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

  return (
    <div className="min-h-screen bg-[#fafcff] pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <Link to="/study-abroad/france" className="hover:text-indigo-650 transition-colors">France</Link>
          <ArrowRight size={12} className="text-slate-400" />
          <span className="text-slate-600 font-bold">Student Visa Manual 2026</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1542820229-081e0c12af0b?w=1200&auto=format&fit=crop&q=80" 
              alt="France Visa Guideline" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <ShieldCheck size={14} strokeWidth={2.5} />
              Immigration France 2026/27
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              France Student Visa: Step-by-Step Guide for Indian Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Secure your legal study status in Europe. Understand visa categories, financial requirements, the Campus France interview process, and post-arrival compliance.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: March 11, 2026
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
                <h2 className="text-2xl font-black text-slate-900 mb-1">🛂 France Study Visa Classifications</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Select the visa subcategory aligned to your study duration</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visaTypes.map((v, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider block w-fit mb-4">
                        0{idx + 1}
                      </span>
                      <h3 className="text-base font-black text-slate-800 mb-2">{v.type}</h3>
                      <div className="text-[10px] text-indigo-600 font-black uppercase tracking-wider mb-3">Duration: {v.duration}</div>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">{v.benefits}</p>
                    </div>
                    <div className="border-t border-slate-100 pt-4 text-[10px] font-black text-slate-650 uppercase">
                      Part-time work: <span className={v.work === "No" ? "text-rose-600" : "text-emerald-600"}>{v.work}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Eligibility & Requirements */}
            <section id="eligibility" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="text-indigo-650" size={24} />
                  ✅ Document Dossier Checklist
                </h2>
                <p className="text-slate-400 text-xs font-bold mb-6">Review your prerequisites before submitting visa applications</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {checklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs md:text-sm">{item.title}</h4>
                        <p className="text-slate-500 text-[11px] font-semibold mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. Financial Requirements */}
            <section id="financials" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Coins className="text-indigo-650" size={24} />
                  💰 Financial Requirements for Visa
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">Monthly Cutoff</h4>
                      <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                        Visa officers require proof that you have a minimum monthly budget to cover living expenses:
                      </p>
                    </div>
                    <div className="mt-4">
                      <strong className="text-slate-900 text-xl font-black block">{formatCost(615)} / month</strong>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Statutory minimum allowance</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">Minimum 1-Year Reserve</h4>
                      <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                        You must demonstrate access to a total reserve in deposits or loans (excluding tuition):
                      </p>
                    </div>
                    <div className="mt-4">
                      <strong className="text-slate-900 text-xl font-black block">{formatCost(7380)}</strong>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Required reserve in bank/loan</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-slate-800 text-sm mb-4">Accepted Proof of Funds</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Education loan sanction letter from a recognized bank",
                      "Parental / sponsor bank statements showing last 3 months",
                      "France Excellence or major scholarship award letters",
                      "Host block funds / guarantor deposit statements"
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

            {/* 4. Accommodation Mandate */}
            <section id="accommodation" className="scroll-mt-24">
              <div className="bg-indigo-50/50 border border-indigo-150 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-indigo-950 mb-2 flex items-center gap-2">
                  <Building className="text-indigo-650" size={24} />
                  🏠 Accommodation Proof Mandate
                </h2>
                <p className="text-slate-650 text-sm font-semibold leading-relaxed mb-6">
                  One of the most critical elements of a French student visa is proving you have a place to live. You must show a secure housing reservation for at least the **first 3 months (90 days)** of your stay in France.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-5 rounded-2xl border border-indigo-100">
                    <h4 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider mb-2">Accepted Accommodation Proof</h4>
                    <ul className="space-y-2 text-xs font-semibold text-slate-650">
                      <li>• CROUS university dorm confirmation letter</li>
                      <li>• A registered lease agreement (contrat de bail)</li>
                      <li>• Attestation d'hébergement (if hosted by a French resident)</li>
                      <li>• Confirmed Airbnb/Hotel booking covering 90 days</li>
                    </ul>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-indigo-100">
                    <h4 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider mb-2">💡 CAF Housing Subsidies</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      Once inside France, all international students are eligible to apply for CAF housing assistance (Caisse d'Allocations Familiales). CAF can subsidize your monthly rent by **30% to 50%**, paid directly to your landlord or back to your account.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Step-by-Step VFS Process */}
            <section id="process" className="scroll-mt-24">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-slate-900 mb-1">📝 Step-by-Step VFS Visa Process</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Milestones to complete from admission to visa receipt</p>
              </div>

              <div className="relative border-l-2 border-indigo-100 pl-6 ml-4 space-y-8 mb-12">
                {[
                  { step: "Step 1", title: "Études en France (EEF) Portal Registration", desc: "Register on the EEF portal, upload academic transcripts, write your study SOP, and submit the portal fee (~₹18,500 + taxes)." },
                  { step: "Step 2", title: "Campus France Academic Interview", desc: "Attend the 30-minute academic interview where a panel manager verifies your transcripts and checks your study motivation." },
                  { step: "Step 3", title: "France-Visas Online Registration", desc: "Log onto the official France-Visas portal, fill out the application using your EEF ID, and print your barcode receipt." },
                  { step: "Step 4", title: "Book VFS Appointment & Submit Biometrics", desc: "Secure a slot at your local VFS center. Submit two sets of physical dossiers, undergo biometrics, and pay VFS processing fees." }
                ].map((s, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white" />
                    <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wider block mb-0.5">{s.step}</span>
                    <h4 className="text-xs font-black text-slate-850">{s.title}</h4>
                    <p className="text-slate-550 text-xs font-semibold leading-relaxed mt-1">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Pitfalls & Rejection Reasons */}
            <section id="rejections" className="scroll-mt-24">
              <div className="bg-rose-50 border border-rose-200 rounded-[2rem] p-8">
                <h2 className="text-2xl font-black text-rose-950 mb-2 flex items-center gap-2">
                  <ShieldAlert className="text-rose-600 animate-pulse" size={24} />
                  ⚠️ Common Visa Rejections & Pitfalls
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  French visa officers evaluate files very thoroughly. Watch out for these common issues that lead to instant rejections:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Vague Accommodation Proof", desc: "Using a short 2-day dummy reservation or incomplete address. You must show a solid 90-day booking." },
                    { title: "Unseasoned Funds", desc: "Sudden massive deposits into parental bank accounts right before the appointment raise red flags. Maintain funds for at least 3 months." },
                    { title: "Academic Inconsistency", desc: "Sudden pivots in studies (e.g., transitioning from Mech Eng to Luxury Management) without a solid justification in your SOP." },
                    { title: "Poor Campus France Interview", desc: "Failing to explain course modules, naming professors, or showing low communication skills during your interview." }
                  ].map((pit, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-rose-100/50 flex flex-col gap-1 hover:shadow-xs transition-shadow">
                      <p className="font-black text-rose-950 text-xs">{pit.title}</p>
                      <p className="text-slate-500 text-[11px] font-semibold leading-normal">{pit.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 7. Post Arrival Steps */}
            <section id="post-arrival" className="scroll-mt-24">
              <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="text-indigo-650" size={24} />
                  ⏰ Post-Arrival Requirements in France
                </h2>
                <p className="text-slate-655 text-sm font-semibold leading-relaxed mb-6">
                  Once you land in France, complete these administrative steps immediately to stay legal and access student subsidies:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">1. Validate VLS-TS (ANEF)</h4>
                    <p className="text-slate-500 font-semibold leading-relaxed">
                      Within 3 months of arrival, you must validate your visa online on the ANEF portal. Pay the mandatory residency tax (~€50-€75).
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">2. Register for Healthcare</h4>
                    <p className="text-slate-500 font-semibold leading-relaxed">
                      Register for French Social Security (Sécurité Sociale) online for free. This covers up to 70% of doctor consults and prescriptions.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="font-extrabold text-slate-805 uppercase tracking-wider mb-2">3. Open Local Bank Account</h4>
                    <p className="text-slate-500 font-semibold leading-relaxed">
                      Open a local French bank account (e.g., LCL, BNP Paribas, Société Générale) to receive CAF housing refunds and pay monthly utility bills.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. FAQs */}
            <section id="faq" className="scroll-mt-24">
              <div className="text-left mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Frequently Asked Questions</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quick answers about France student visa rules</p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "What is the ANEF validation of VLS-TS student visa?", a: "The ANEF validation is an online registration process that you must complete within 3 months of entering France. It validates your VLS-TS long-stay visa as a temporary residence permit and requires paying a tax." },
                  { q: "Can I work part-time in France on a student visa?", a: "Yes. International students holding a VLS-TS visa can work up to 60% of the statutory annual working hours, which equates to 964 hours per year (~20 hours per week)." },
                  { q: "Is there an age limit for a student visa in France?", a: "No, there is no strict upper age limit. However, applicants over 28 years old may undergo stricter evaluations to verify their academic motivations." },
                  { q: "How much money do I need to show for a France student visa?", a: "You must demonstrate access to a minimum of €615 per month for the first academic year, which totals €7,380. This can be in the form of deposits, education loans, or scholarship awards." },
                  { q: "What happens if I change my course in France?", a: "Changing courses or institutions requires an approval from Campus France and your local préfecture. Depending on the timing, you might need to return to India to file a new student visa." }
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

export default FranceVisa;
