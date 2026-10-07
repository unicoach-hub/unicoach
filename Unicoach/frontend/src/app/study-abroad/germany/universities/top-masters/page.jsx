import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, MapPin, Award, BookOpen, Clock, AlertTriangle,
  CheckCircle2, ArrowRight, Search, Globe, ShieldCheck, GraduationCap,
  Sparkles, ListCollapse, ListStart, ChevronDown, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const topMastersUnis = [
  {
    rank: 22,
    name: "Technical University of Munich (TUM)",
    courses: "Engineering, AI, Data Science, M.Sc. Management & Technology",
    semesterFee: 350,
    annualTuitionNonEU: 5000, // For certain programs, 4000-6000
    eligibility: "GPA 8.5/10+ recommended. GRE/GMAT required for Indian students in most STEM/Business courses.",
    highlights: "Think of TUM as the 'Silicon Valley' of Germany. High-pressure but high-prestige, offering deep connections to Google and BMW.",
    scholarship: "TUM Scholarship for International Students",
    logo: "https://logo.clearbit.com/tum.de",
    website: "https://www.tum.de"
  },
  {
    rank: 58,
    name: "LMU Munich",
    courses: "Life Sciences, Economics, Data Science, Molecular & Cellular Biology",
    semesterFee: 300,
    annualTuitionNonEU: 0,
    eligibility: "GPA 8.0/10+. Focuses heavily on deep theoretical knowledge and academic consistency.",
    highlights: "A classic elite university known for global academic weight. Highly favored by top consulting firms like McKinsey and BCG.",
    scholarship: "LBS Scholarship (Bavarian State)",
    logo: "https://logo.clearbit.com/lmu.de",
    website: "https://www.lmu.de"
  },
  {
    rank: 80,
    name: "Heidelberg University",
    courses: "Medicine, Biosciences, Physics, Biomedical Engineering",
    semesterFee: 150,
    annualTuitionNonEU: 3000,
    eligibility: "GPA 8.0/10+. Bio/Med tracks require research experience or publication/internships.",
    highlights: "Germany's hub for life sciences. Beautiful historic campus with close-knit scientific research groups.",
    scholarship: "Amirana Scholarship (for developing countries)",
    logo: "https://logo.clearbit.com/uni-heidelberg.de",
    website: "https://www.uni-heidelberg.de"
  },
  {
    rank: 88,
    name: "Free University Berlin",
    courses: "Social Sciences, Biology, International Relations, Bioinformatics",
    semesterFee: 350,
    annualTuitionNonEU: 0,
    eligibility: "GPA 7.5/10+. Places high value on a compelling, detailed Statement of Purpose (SOP).",
    highlights: "The most liberal and 'activist' campus in Germany, set in the country's vibrant startup capital.",
    scholarship: "Deutschlandstipendium (~₹32,000/month)",
    logo: "https://logo.clearbit.com/fu-berlin.de",
    website: "https://www.fu-berlin.de"
  },
  {
    rank: 98,
    name: "KIT (Karlsruhe)",
    courses: "Engineering, IT, Energy Technology, Informatics (CS)",
    semesterFee: 150,
    annualTuitionNonEU: 3000,
    eligibility: "GPA 7.8/10+. Math-heavy; requirements verify advanced mathematics covered in Bachelor's.",
    highlights: "A double-entity: both an elite university and a national large-scale Helmholtz research center.",
    scholarship: "KIT International Excellence Grants",
    logo: "https://logo.clearbit.com/kit.edu",
    website: "https://www.kit.edu"
  },
  {
    rank: 105,
    name: "RWTH Aachen",
    courses: "Mechanical Engineering, Automotive Systems, Software Systems",
    semesterFee: 350,
    annualTuitionNonEU: 0,
    eligibility: "GPA 8.0/10+. Extremely strict ECTS credit matching. Even high GPA will fail if specific credits are missing.",
    highlights: "The 'Engineer's Mecca' of Europe. Strong ties to Daimler, Volkswagen, and Bosch.",
    scholarship: "RWTH Education Fund",
    logo: "https://logo.clearbit.com/rwth-aachen.de",
    website: "https://www.rwth-aachen.de"
  },
  {
    rank: 130,
    name: "Humboldt Univ. Berlin",
    courses: "Psychology, History, M.Sc. Economics, Mind and Brain",
    semesterFee: 315,
    annualTuitionNonEU: 0,
    eligibility: "GPA 8.2/10+. Highly restricted admission (NC - Numerus Clausus) limits intake to top 5%.",
    highlights: "Historically home to Einstein and Marx. Best for deep, academic focus in economics and psychology.",
    scholarship: "Humboldt Research Track Scholarship",
    logo: "https://logo.clearbit.com/hu-berlin.de",
    website: "https://www.hu-berlin.de"
  },
  {
    rank: 145,
    name: "TU Berlin",
    courses: "Architecture, Innovation Management, Computer Science",
    semesterFee: 300,
    annualTuitionNonEU: 0,
    eligibility: "GPA 7.5/10+. Practical work experience and internships in India enhance acceptance chances.",
    highlights: "A tech and engineering hub in the heart of Berlin. Offers a practical, relaxed research culture.",
    scholarship: "Friedrich-Ebert-Stiftung",
    logo: "https://logo.clearbit.com/tu.berlin",
    website: "https://www.tu.berlin"
  },
  {
    rank: 193,
    name: "University of Hamburg",
    courses: "Environmental Sciences, Data Science, Climate System Sciences",
    semesterFee: 350,
    annualTuitionNonEU: 0,
    eligibility: "GPA 7.5/10+. Good options for English-medium graduates with basic German skills.",
    highlights: "Best for study related to international trade and green climate systems, leveraging its major port city location.",
    scholarship: "UHH Merit Scholarship (up to €900/month)",
    logo: "https://logo.clearbit.com/uni-hamburg.de",
    website: "https://www.uni-hamburg.de"
  },
  {
    rank: 201,
    name: "University of Freiburg",
    courses: "Renewable Energy, Biotechnology, Microsystems Engineering",
    semesterFee: 150,
    annualTuitionNonEU: 3000,
    eligibility: "GPA 7.5/10+. The Renewable Energy program (REM) requires 1-2 years of relevant work experience.",
    highlights: "Located in Germany's 'Solar City'. Ideal for solar energy technologies and sustainable engineering.",
    scholarship: "DAAD-EPOS Scholarship (Full Ride)",
    logo: "https://logo.clearbit.com/uni-freiburg.de",
    website: "https://www.uni-freiburg.de"
  }
];

const GermanyTopMasters = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [activeStep, setActiveStep] = useState(0);
  const [expandedUni, setExpandedUni] = useState(null);

  const exchangeRate = 110.14; // 1 EUR ≈ 110.14 INR reference

  const formatCost = (valInEUR) => {
    if (valInEUR === 0) return 'Free';
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = valInEUR * exchangeRate;
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  const formatTotalCost = (valInEUR) => {
    if (valInEUR === 0) return 'Free';
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = valInEUR * exchangeRate;
    return `₹ ${(valInINR / 100000).toFixed(2)} L`;
  };

  const steps = [
    { title: "Research Relevance", desc: "Select courses matching your undergraduate stream. German universities strictly enforce 'Field Relevance' (non-consecutive majors are rejected)." },
    { title: "Standardized Tests", desc: "Prepare and clear IELTS (6.5+ or 7.0) or TOEFL (90+). Take the GRE or GMAT if applying to top TUs (TUM, RWTH Aachen)." },
    { title: "Mandatory APS", desc: "Submit Indian transcripts to the APS India center for credential verification. Costs ₹18,000, takes 4-12 weeks, mandatory for visas." },
    { title: "SOP & Europass CV", desc: "Draft a logic-driven, academic Statement of Purpose. Do not write emotional narratives; focus on ECTS matching. Format CV as Europass." },
    { title: "Submit Application", desc: "Submit through Uni-Assist or direct university portals. Main deadlines: July 15 (Winter Intake) & January 15 (Summer Intake)." },
    { title: "Sperrkonto Funding", desc: "Deposit €11,904 (approx. ₹12.5 Lakhs) into a blocked account to secure your financial confirmation letter (Sperrbestätigung)." },
    { title: "VFS Student Visa", desc: "Book appointment 3 months in advance. Bring admission offer, APS certificate, and blocked account confirmation to VFS Global." },
    { title: "Arrival & Anmeldung", desc: "Arrive in Germany, register your address at the Bürgeramt within 14 days, pay semester fees to unlock your blocked account." }
  ];

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-100/50 via-indigo-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-indigo-200/10 to-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/germany" className="hover:text-indigo-650 transition-colors">Germany</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Masters in Germany</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <GraduationCap size={14} className="text-indigo-600 animate-bounce" />
            <span>Master's Pathways 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Top Universities for{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Masters in Germany</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto">
            Avoid UK and US debt traps. Germany is the premier high-ROI alternative for STEM and Management aspirants. Save lakhs on tuition while securing an 18-month post-study work permit.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10 max-w-3xl mx-auto">
            {[
              { val: "1,930+", label: "English-Taught MS Programs" },
              { val: "760,000+", label: "Skilled Worker Shortage" },
              { val: "€11,904", label: "Visa Blocked Account" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md">
                <p className="text-xl font-black text-indigo-650">{stat.val}</p>
                <p className="text-[10px] text-slate-500 font-extrabold mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Global Currency Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-sm inline-flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-black uppercase px-3 tracking-wider">Currency:</span>
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

        {/* 1. MASTER'S OVERVIEW TABLE */}
        <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl mb-16 overflow-hidden">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Award className="text-indigo-600" size={22} />
            Quick Comparison: Master's Fees & Ranks
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                  <th className="pb-3 pr-4">QS Rank</th>
                  <th className="pb-3 pr-4">University</th>
                  <th className="pb-3 pr-4">Popular MS Programs</th>
                  <th className="pb-3 pr-4 text-center">Semester Fee</th>
                  <th className="pb-3 pr-4 text-right">Non-EU Tuition / Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                {topMastersUnis.map((uni, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4 text-indigo-650 font-black">#{uni.rank}</td>
                    <td className="py-4 text-slate-900 font-extrabold">{uni.name}</td>
                    <td className="py-4 text-slate-550 text-xs font-semibold max-w-xs">{uni.courses}</td>
                    <td className="py-4 text-center font-bold text-slate-800">{formatTotalCost(uni.semesterFee)}</td>
                    <td className="py-4 text-right font-black text-indigo-650">{formatTotalCost(uni.annualTuitionNonEU)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-[10px] text-slate-400 font-semibold italic flex items-center gap-1">
            <AlertTriangle size={12} className="text-slate-400 shrink-0" />
            <span>Note: Fees converted at €1 = ₹105.20. Public universities are tuition-free, except for the State of Baden-Württemberg (€1,500/semester) or certain specialized tracks (like TUM).</span>
          </div>
        </div>

        {/* 2. THE ECTS CREDIT WARNING BANNER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-amber-50/60 border border-amber-200/50 rounded-[32px] p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 mb-6">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3">Critical Rule: Consecutive Fields & ECTS</h3>
              <p className="text-slate-650 text-xs leading-relaxed font-semibold">
                German university admissions are strict about **Field Relevance**. You cannot easily transition from Mechanical Engineering to Computer Science or Psychology. Admissions officers map your Indian transcripts course-by-course to count equivalent ECTS credits in mathematics, theoretical physics, or CS. Lacking even 2 credits in advanced mathematics can lead to instant rejection.
              </p>
            </div>
            <Link
              to="/contact?tab=ects"
              className="mt-6 inline-flex items-center gap-1 text-xs font-black text-amber-700 hover:underline"
            >
              Verify your ECTS credits compatibility <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-[32px] p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-650 mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3">The Mandatory APS Certificate</h3>
              <p className="text-slate-650 text-xs leading-relaxed font-semibold">
                All Indian applicants must secure their **APS Certificate** before submitting university applications (via Uni-Assist) or booking student visa interviews at VFS. This is a credential verification system introduced in late 2022 to confirm the legitimacy of school and bachelor records.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/60 p-2 rounded-xl text-[10px] font-black text-slate-700">Cost: ~₹18,000</div>
                <div className="bg-white/60 p-2 rounded-xl text-[10px] font-black text-slate-700">Time: 4-12 Weeks</div>
                <div className="bg-white/60 p-2 rounded-xl text-[10px] font-black text-slate-700">Validity: Lifetime</div>
              </div>
            </div>
            <a
              href="https://aps-india.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1 text-xs font-black text-indigo-750 hover:underline"
            >
              Visit official APS India portal <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* 3. STEP-BY-STEP ADMISSIONS TIMELINE */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Master's Application Step-by-Step</h2>
            <p className="text-slate-500 text-sm font-bold">Follow this roadmap exactly to avoid delays. Processing can take up to 6 months.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer bg-white border rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.01)] transition-all duration-300 ${activeStep === idx ? 'border-indigo-650 bg-indigo-50/20' : 'border-slate-100 hover:border-indigo-200'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step 0{idx + 1}</span>
                  <div className={`w-2 h-2 rounded-full ${activeStep === idx ? 'bg-indigo-650' : 'bg-slate-200'}`} />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-2">{s.title}</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. DETAILED UNIVERSITIES EXPANSION */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-8 text-center md:text-left">Detailed Overview of Top 10 MS Universities</h2>
          <div className="space-y-4">
            {topMastersUnis.map((uni, idx) => {
              const isExpanded = expandedUni === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white/60 border border-white rounded-[24px] overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setExpandedUni(isExpanded ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl border border-slate-100 bg-white p-2 shrink-0 flex items-center justify-center">
                        <img src={uni.logo} alt="" className="w-8 h-8 object-contain" onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm md:text-base">{uni.name}</h4>
                        <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider">QS Global Rank: #{uni.rank}</span>
                      </div>
                    </div>
                    <ChevronDown size={20} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-slate-650 text-xs font-semibold leading-relaxed space-y-4">
                          <p>{uni.highlights}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <div>
                              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Masters Eligibility</span>
                              <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5">{uni.eligibility}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Target Scholarship</span>
                              <span className="font-extrabold text-indigo-650 text-[11px] block mt-0.5">{uni.scholarship}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Fees Structure</span>
                              <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5">
                                Semester Contrib: {formatCost(uni.semesterFee)} <br/>
                                Tuition Cost: {uni.annualTuitionNonEU ? formatCost(uni.annualTuitionNonEU) + ' / yr' : 'None'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <a href={uni.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-slate-200 text-slate-700 font-extrabold rounded-xl hover:bg-slate-50 text-[11px]">Official Site</a>
                            <Link to={`/contact?university=${encodeURIComponent(uni.name)}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-[11px]">Check Admission Profile</Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. FAQS FOR MASTERS */}
        <div className="bg-white/50 border border-white rounded-[32px] p-6 md:p-8 shadow-xs max-w-4xl mx-auto">
          <h3 className="text-xl font-black text-slate-900 mb-6 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4 text-xs font-semibold text-slate-600">
            {[
              { q: "Is a master's degree free in Germany?", a: "Yes, at almost all public universities, tuition is free. Non-EU international students only pay a nominal semester administrative fee of €150-€350 (which includes local transit passes). However, the State of Baden-Württemberg charges €1,500/semester, and certain courses (like specific master's programs at TUM) charge tuition." },
              { q: "How much bank balance is required for the student visa?", a: "To cover living costs for your first academic year, you must deposit €11,904 in a blocked account (Sperrkonto). Upon arrival, you can withdraw €992 per month to cover rent, insurance, and utilities." },
              { q: "Can I study in Germany without IELTS?", a: "If your previous degree was taught entirely in English, some universities allow a Medium of Instruction (MOI) certificate. However, top-ranked public universities (like TUM or RWTH Aachen) and visa officers strongly recommend or require an official IELTS (6.5+) or TOEFL (90+) score." },
              { q: "What is the rank 1 university in Germany for MS?", a: "For 2026, the Technical University of Munich (TUM) remains the highest-ranked institution in Germany, placed 22nd globally in the QS World University Rankings, known for STEM, informatics, and management." }
            ].map((faq, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-800 mb-1.5">Q: {faq.q}</p>
                <p className="leading-relaxed text-slate-500">A: {faq.a}</p>
              </div>
            ))}
          </div>
        </div>


      {/* CTA Section */}
      <StudyAbroadCTA country="Germany" />

      </div>
    </div>
  );
};

export default GermanyTopMasters;
