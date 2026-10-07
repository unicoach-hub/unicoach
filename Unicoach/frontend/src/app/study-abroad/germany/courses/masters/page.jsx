import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, MapPin, Award, Building, Globe, ExternalLink, 
  BookOpen, Calendar, HelpCircle, CheckCircle2, ArrowRight, 
  Info, Plane, Calculator, GraduationCap, ShieldAlert,
  ChevronDown, ChevronUp, Clock, AlertCircle, FileText, Check, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';
import { getUniversityLogo } from '../../../../../components/logoResolver';

// ─────────────────────────────────────────────
// DATA SECTION
// ─────────────────────────────────────────────

const universities = [
  { name: "Technical University of Munich (TUM)", rank: "#22", feeEurMin: 4000, feeEurMax: 12000, logo: "https://logo.clearbit.com/tum.de", link: "https://www.tum.de" },
  { name: "Ludwig Maximilian University (LMU)", rank: "#58", feeEurMin: 300, feeEurMax: 700, logo: "https://logo.clearbit.com/lmu.de", link: "https://www.lmu.de" },
  { name: "Heidelberg University", rank: "#80", feeEurMin: 3000, feeEurMax: 3500, logo: "https://logo.clearbit.com/uni-heidelberg.de", link: "https://www.uni-heidelberg.de" },
  { name: "Free University of Berlin (FU Berlin)", rank: "#88", feeEurMin: 620, feeEurMax: 760, logo: "https://logo.clearbit.com/fu-berlin.de", link: "https://www.fu-berlin.de" },
  { name: "Karlsruhe Institute of Technology (KIT)", rank: "#98", feeEurMin: 3000, feeEurMax: 3600, logo: "https://logo.clearbit.com/kit.edu", link: "https://www.kit.edu" },
  { name: "RWTH Aachen University", rank: "#105", feeEurMin: 600, feeEurMax: 800, logo: "https://logo.clearbit.com/rwth-aachen.de", link: "https://www.rwth-aachen.de" },
  { name: "Humboldt University of Berlin", rank: "#130", feeEurMin: 630, feeEurMax: 700, logo: "https://logo.clearbit.com/hu-berlin.de", link: "https://www.hu-berlin.de" },
  { name: "Technical University of Berlin", rank: "#145", feeEurMin: 600, feeEurMax: 660, logo: "https://logo.clearbit.com/tu.berlin", link: "https://www.tu.berlin" },
  { name: "University of Hamburg", rank: "#193", feeEurMin: 670, feeEurMax: 720, logo: "https://logo.clearbit.com/uni-hamburg.de", link: "https://www.uni-hamburg.de" },
  { name: "University of Freiburg", rank: "#201", feeEurMin: 3300, feeEurMax: 3700, logo: "https://logo.clearbit.com/uni-freiburg.de", link: "https://www.uni-freiburg.de" }
];

const specialisations = {
  mechanical: {
    title: "Mechanical & Automotive Engineering",
    desc: "A degree in MSc in Germany is the gold standard if you are interested in machines. This field lies at the heart of Germany's industrial character. Work with big companies like BMW, Mercedes-Benz, or Bosch to produce the next generation of electric and self-driving cars.",
    bestFor: "Students with a background in Mechanical, Production, or Mechatronics who want to lead the transition to Electric Vehicles (EVs) and Industry 4.0.",
    insight: "Learn autonomous driving systems, battery technology, and smart manufacturing. Most programs require students to do a 22-week research project or internship in the sector.",
    skills: ["Computational Fluid Dynamics (CFD)", "Smart Manufacturing", "Sustainable Drivetrains"],
    fees: "Free at RWTH Aachen; €4,000–€12,000/year at TUM."
  },
  cs: {
    title: "Computer Science and AI",
    desc: "Every modern business, from banking to healthcare, runs on computer science and AI. If you're a tech enthusiast, this degree makes your skills future-proof and puts you on the fastest track toward an EU Blue Card and permanent residency.",
    bestFor: "People who love technology and want to work in AI research, cybersecurity, or cloud architecture.",
    insight: "The curriculum focuses on Machine Learning, Neural Networks, and Distributed Systems. Spend a lot of time in labs working on real-world AI modeling and large data infrastructure.",
    skills: ["Deep Learning", "Cloud Computing", "Advanced Algorithms"],
    fees: "Free at TU Berlin; €3,000/year at KIT."
  },
  data: {
    title: "Data Science & Business Analytics",
    desc: "This is a growing field for people who like to use data to solve hard problems. Learn to turn massive datasets into smart business moves—a skill that German 'Mittelstand' (SMEs) and global tech firms are actively recruiting for in 2026.",
    bestFor: "People with a background in math, statistics, or engineering who want to connect 'Big Data' to business strategy.",
    insight: "Master Predictive Modeling, Data Visualization, and Statistical Computing. The course often involves 'capstone projects' where you solve actual data bottlenecks for partner companies.",
    skills: ["Python/R for Data Science", "Big Data Frameworks (Hadoop/Spark)", "Business Intelligence"],
    fees: "€700/year (Semester Contribution) at FU Berlin."
  },
  mgmt: {
    title: "Business Administration & Management (MiM/MBA)",
    desc: "These classes can help you go from being a technical expert to a leader if you want to lead teams and sign deals. A Master's in Management (MiM) is a good choice for people who are just starting out, while an MBA is meant for people who are already working and want to move up.",
    bestFor: "MiM: New grads. MBA: Professionals with 2–5 years of work experience aiming for Consulting or Project Management.",
    insight: "Learn Strategic Leadership, Supply Chain Management, and Global Finance. Highly interactive programs focusing on case studies and networking with European business leaders.",
    skills: ["Strategic Leadership", "Supply Chain Strategy", "Corporate Finance"],
    fees: "Public universities are usually free; private business schools charge between €15,000 and €35,000."
  },
  sustain: {
    title: "Sustainability & Renewable Energy",
    desc: "With Germany's Energiewende (Energy Transition) policy aiming for a carbon-neutral 2045, Renewable Energy is a massive growth sector. Choose this if you want to be at the forefront of the global green revolution.",
    bestFor: "People with a degree in engineering or science who are interested in green technology, hydrogen energy, or climate policy.",
    insight: "Covers Solar/Wind Power Engineering, Environmental Law, and Smart Grid Integration. Learn how to make decentralized power systems that work in cities that want to be green.",
    skills: ["Energy Modeling", "Environmental Impact Assessment", "Smart Grid Management"],
    fees: "Free at the University of Oldenburg; about €3,000/year at the University of Freiburg."
  }
};

const preArrivalCosts = [
  { item: "APS Certificate Verification", costEur: 165, reason: "Mandatory academic credential verification for Indian applicants" },
  { item: "Blocked Account (Annual Deposit)", costEur: 11904, reason: "Mandatory proof of funds; yields €992/month for living expenses" },
  { item: "National Student Visa Fee (Type D)", costEur: 75, reason: "Embassy administration cost" },
  { item: "Rental Deposit (Kaution)", costEur: 1500, reason: "Average 2-3 months of rent, refundable when you move out" },
  { item: "Semester Fee (Contribution)", costEur: 250, reason: "Paid twice a year; includes administrative costs and public transport ticket" },
  { item: "IELTS Exam Registration", costEur: 190, reason: "English proficiency test standard fee in India" },
  { item: "Flight Ticket (One-way)", costEur: 500, reason: "Estimated one-way airfare from India to Frankfurt/Munich" }
];

const faqs = [
  {
    q: "Is IELTS mandatory for a German student visa?",
    a: "Yes, German visa officers in India frequently request proof of English proficiency at a minimum B2 level (typically an IELTS score of 6.5 with no band below 6.0) during the visa interview for English-taught programs."
  },
  {
    q: "Can I study in Germany for free in 2026?",
    a: "Yes, tuition is free for most programs at public universities. However, you must pay a minor semester contribution (€150–€400 depending on the university) and maintain a blocked account of €11,904 to cover your living costs."
  },
  {
    q: "How long does the APS certificate take to process in 2026?",
    a: "If you verify your marks using DigiLocker and provide your university portal login credentials to the APS office, it can take only 4 to 20 days. Without digital records, the process can take 8 to 12 weeks."
  },
  {
    q: "Is a 3-year Bachelor's degree accepted for a Master's in Germany?",
    a: "Many top research universities prefer a 4-year degree (like a B.Tech) to meet ECTS credit criteria. Students with 3-year degrees (like B.Sc or B.Com) may need to look at specific Fachhochschulen (Universities of Applied Sciences) or take extra bridge courses."
  }
];

const GermanyMastersPage = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [activeTab, setActiveTab] = useState('mechanical');
  const [faqOpen, setFaqOpen] = useState(null);

  const exchangeRate = 107.78;

  const formatPrice = (valInEur) => {
    if (currency === 'EUR') {
      return `€ ${valInEur.toLocaleString()}`;
    }
    const valInInr = valInEur * exchangeRate;
    if (valInInr >= 100000) {
      return `₹ ${(valInInr / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${valInInr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const toggleFaq = (index) => {
    if (faqOpen === index) {
      setFaqOpen(null);
    } else {
      setFaqOpen(index);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans select-none">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-100/50 via-indigo-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        
        {/* 1. HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
            <Plane size={14} className="animate-pulse" />
            <span>Germany Master's Study Guide 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Study Masters in Germany:{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Complete Guide</span>
          </h1>
          <p className="text-slate-650 text-lg md:text-xl leading-relaxed font-semibold max-w-3xl mx-auto mb-8">
            Trade financial anxiety for a world-class education. Learn how to secure admission to public universities with zero tuition fees, satisfy the new digital APS process, and lock down your 18-month stay-back visa.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { val: "€0", label: "Tuition at Public Unis" },
              { val: "15.1%", label: "2025 Mobility Growth" },
              { val: "18 Months", label: "Post-Study Stay Back" },
              { val: "21-33 Mo", label: "Fast-Track PR Path" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-md">
                <p className="text-2xl font-black text-indigo-600">{stat.val}</p>
                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Global Currency Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-md inline-flex items-center gap-1">
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 2. DYNAMIC SPECIALISATIONS EXPLORER */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Top Specialisations for Career Growth</h2>
            <p className="text-slate-500 text-sm font-bold">Pick programs designed to transform your degree into a stable, lucrative global career.</p>
          </div>

          {/* Tabs header */}
          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2 scrollbar-none">
            {Object.keys(specialisations).map(key => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === key ? 'border-indigo-650 text-indigo-650 font-black' : 'border-transparent text-slate-500 hover:text-indigo-500'}`}
              >
                {specialisations[key].title}
              </button>
            ))}
          </div>

          {/* Active Tab Panel */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                    <Sparkles size={12} />
                    <span>Specialisation Spotlight</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{specialisations[activeTab].title}</h3>
                  <p className="text-slate-660 leading-relaxed font-semibold text-sm">{specialisations[activeTab].desc}</p>
                  
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Key Course Insights</h4>
                    <p className="text-slate-660 text-sm leading-relaxed font-semibold">{specialisations[activeTab].insight}</p>
                  </div>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs text-slate-400 font-black uppercase tracking-wider mb-4">Core Skills Gained</h4>
                    <div className="space-y-3">
                      {specialisations[activeTab].skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-700 text-xs font-bold">
                          <CheckCircle2 size={14} className="text-indigo-600 shrink-0" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200/65 pt-6 mt-6">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Profile</div>
                    <p className="text-slate-650 text-xs font-bold mt-1 mb-4">{specialisations[activeTab].bestFor}</p>
                    
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Tuition Cost</div>
                    <p className="text-indigo-600 text-xs font-black mt-1">{specialisations[activeTab].fees}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. UNIVERSITIES TABLE */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Top Universities in Germany (QS 2026 Rankings)</h2>
            <p className="text-slate-500 text-sm font-bold">Compare elite public universities charging €0 or nominal semester fees, avoiding massive debt common in US/UK.</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                    <th className="py-4 px-6">University</th>
                    <th className="py-4 px-6 text-center">QS Rank</th>
                    <th className="py-4 px-6 text-right">Avg. Annual Fees (EUR)</th>
                    <th className="py-4 px-6 text-right">Avg. Annual Fees (INR)</th>
                    <th className="py-4 px-6 text-center">Portal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                  {universities.map((uni, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img 
                          src={getUniversityLogo(uni.name, uni.logo)} 
                          alt={uni.name} 
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(uni.name || 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`; 
                          }}
                          className="w-7 h-7 rounded bg-slate-100 p-0.5 object-contain shrink-0" 
                        />
                        <span className="font-black text-slate-800">{uni.name}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-orange-50 text-[#C04A1D] text-xs font-black">
                          {uni.rank}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-slate-700">
                        € {uni.feeEurMin.toLocaleString()} – € {uni.feeEurMax.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right font-black text-indigo-650">
                        {formatPrice(uni.feeEurMin)} – {formatPrice(uni.feeEurMax)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <a 
                          href={uni.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-[#DE5C2B] hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <ExternalLink size={15} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Source: Official University Portals (e.g. TUM.de, Uni-Heidelberg.de) mapped to QS 2026 Rankings</span>
              <span className="text-xs text-slate-400 font-bold">Exchange reference: €1 = ₹107.78</span>
            </div>
          </div>
        </div>

        {/* 4. ELIGIBILITY AND ADMISSION CHECKLIST */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Admissions & Eligibility Criteria</h2>
            <p className="text-slate-500 text-sm font-bold">German public universities have strict criteria. Ensure you fulfill all legal and academic benchmarks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black">1</div>
              <h3 className="text-base font-black text-slate-800 mb-2">Academic Background</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Your bachelor's degree must align with your chosen Master's field. A 4-year degree (B.Tech) is ideal. 3-year degrees (B.Com/B.Sc) may require bridge semesters. Minimum German GPA score: 2.5 (~60-65% in India). 70-75%+ for AI or robotics.
              </p>
            </div>

            <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black">2</div>
              <h3 className="text-base font-black text-slate-800 mb-2">Language Proficiency</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                <strong>English Taught:</strong> IELTS minimum overall score 6.5 (no individual band below 6.0). <br />
                <strong>German Taught:</strong> Minimum C1 level certificate (Goethe-Zertifikat C1 / TestDaF level 4) is mandatory. GRE/GMAT are usually optional but enhance profile.
              </p>
            </div>

            <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black">3</div>
              <h3 className="text-base font-black text-slate-800 mb-2">Mandatory Documents</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Statement of Purpose (SOP) explaining motivation (1-2 pages), 2 Letters of Recommendation (LORs) from academic professors, CV in the standardized international Europass format, and notarized transcripts.
              </p>
            </div>
          </div>
        </div>

        {/* 5. APS DIGILOCKER WARNER */}
        <div className="mb-20 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-[32px] p-8 md:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-20%] w-[350px] h-[350px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl shrink-0">
              <ShieldAlert size={36} />
            </div>
            <div>
              <h3 className="text-2xl font-black mb-2">Mandatory APS Digital Requirements</h3>
              <p className="text-white/90 text-sm font-semibold max-w-3xl">
                Every Indian applicant must submit an APS (Academic Evaluation Centre) certificate to secure a student visa. Standard processing takes 8-12 weeks and costs ₹18,000.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-white/15 backdrop-blur-sm rounded-lg text-xs font-black">
                  <Check size={14} /> Pro-Tip: DigiLocker Verification reduces wait to 4–20 days!
                </span>
                <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-white/15 backdrop-blur-sm rounded-lg text-xs font-black">
                  Apply 3-4 months early before deadlines
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. TIMELINE & PRE-ARRIVAL FINANCIALS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          
          {/* Timeline Card */}
          <div className="lg:col-span-1 bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="text-indigo-650" size={20} />
              <span>Application Timeline</span>
            </h3>
            
            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {[
                { step: "1. Prep & Shortlist", desc: "Shortlist courses, take IELTS (target 6.5+), begin document compiling." },
                { step: "2. Apply for APS", desc: "Register at aps.org.in, pay ₹18,000, link DigiLocker for fast tracking." },
                { step: "3. Submit Portals", desc: "Submit via Uni-Assist or directly. Winter deadline: July 15; Summer: Jan 15." },
                { step: "4. Fund Blocked Account", desc: "Secure €11,904 in a Sperrkonto (Fintiba/Expatrio) for student visa proof." },
                { step: "5. Visa Interview", desc: "Book VFS slot, present APS and Blocked Account slip. Flying in 6-12 weeks." }
              ].map((item, idx) => (
                <div key={idx} className="relative pl-8 text-slate-700">
                  <span className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm" />
                  <h4 className="text-xs font-black text-slate-800">{item.step}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-arrival Expenses Table */}
          <div className="lg:col-span-2 bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Calculator className="text-indigo-650" size={20} />
              <span>Pre-Departure & Live Out-of-Pocket Estimates</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 pb-3">
                    <th className="pb-3 text-left">Expense Item</th>
                    <th className="pb-3 text-right">Value (EUR)</th>
                    <th className="pb-3 text-right">Value (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  {preArrivalCosts.map((cost, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3">
                        <div className="font-bold text-slate-800">{cost.item}</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">{cost.reason}</div>
                      </td>
                      <td className="py-3 text-right font-black text-slate-900">€ {cost.costEur.toLocaleString()}</td>
                      <td className="py-3 text-right font-black text-indigo-650">{formatPrice(cost.costEur)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* 7. SCHOLARSHIPS AND CAREERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          
          <div className="bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl">
            <h3 className="text-2xl font-black text-slate-900 mb-4">Financial Support & Scholarships</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6 font-semibold">
              Avoid working excessive part-time hours by securing generous German state-funded programs covering living costs and flights.
            </p>
            <div className="space-y-4">
              {[
                { title: "DAAD Scholarship", desc: "Full living stipend of €992/month, flights, and mandatory health insurance coverage." },
                { title: "Deutschlandstipendium", desc: "Merit-based award offering €300 per month (₹32,330) regardless of nationality." },
                { title: "Erasmus+", desc: "Best for Joint European Master's programs covering complete mobility costs." },
                { title: "Foundation Scholarships", desc: "Political or social foundations (e.g. Friedrich Ebert Stiftung) offering stipends based on community track-record." }
              ].map((sch, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 className="text-indigo-650 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{sch.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-semibold">{sch.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl">
            <h3 className="text-2xl font-black text-slate-900 mb-4">Career & Post-Study stay back</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6 font-semibold">
              Germany faces severe shortages across technical departments. Simplifications in residency rules reward specialized Master's grads.
            </p>
            
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <h4 className="text-sm font-black text-slate-800">18-Month Stay-Back Visa</h4>
                <p className="text-xs text-slate-500 mt-1 font-semibold">
                  Get a transparent 18-month job seeker visa on graduation. Unlike the UK/Canada, you can work in any capacity while seeking your career role.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <h4 className="text-sm font-black text-slate-800">EU Blue Card Fast-Track to PR</h4>
                <p className="text-xs text-slate-500 mt-1 font-semibold">
                  Securing a qualifying job in engineering or CS grants an EU Blue Card. Learn German to B1 level to get your Permanent Residency (PR) in just 21 months.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <h4 className="text-sm font-black text-slate-800">Working Student (Werkstudent) Roles</h4>
                <p className="text-xs text-slate-500 mt-1 font-semibold">
                  Work up to 20 hours/week. These part-time roles are highly relevant to your stream, pay €12-€20/hour, and often lead directly to full-time hiring.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* 8. FAQ ACCORDION */}
        <div className="mb-20 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-sm font-bold">Have questions? We have compiled the most common queries from Indian students.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)]"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-5 text-left font-black text-xs text-slate-800 hover:bg-slate-50/50 transition-all cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {faqOpen === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                <AnimatePresence initial={false}>
                  {faqOpen === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden bg-slate-50/30"
                    >
                      <p className="p-5 text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* 9. CTA BANNER */}
        <StudyAbroadCTA />

      </div>
    </div>
  );
};

export default GermanyMastersPage;
