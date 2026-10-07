import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, ExternalLink, Award, CheckCircle2, 
  Info, Calculator, GraduationCap, ShieldAlert,
  ChevronDown, ChevronUp, Check, Sparkles, Languages, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

// ─────────────────────────────────────────────
// DATA SECTION
// ─────────────────────────────────────────────

const universities = [
  { name: "Technical University of Munich (TUM)", rank: "22", programs: "Management & Technology, Aerospace, Computer Science", duration: "3 Years", logo: "https://logo.clearbit.com/tum.de", link: "https://www.tum.de" },
  { name: "Ludwig-Maximilians-Universität München (LMU)", rank: "58", programs: "Business Administration, Economics, Biology, Physics", duration: "3 Years", logo: "https://logo.clearbit.com/lmu.de", link: "https://www.lmu.de" },
  { name: "Universität Heidelberg", rank: "80", programs: "Medicine, Life Sciences, Physics, Molecular Biotechnology", duration: "3 Years", logo: "https://logo.clearbit.com/uni-heidelberg.de", link: "https://www.uni-heidelberg.de" },
  { name: "Freie Universität Berlin", rank: "88", programs: "International Relations, Psychology, North American Studies", duration: "3 Years", logo: "https://logo.clearbit.com/fu-berlin.de", link: "https://www.fu-berlin.de" },
  { name: "RWTH Aachen University", rank: "105", programs: "Mechanical Engineering, Civil Engineering, Computer Science", duration: "3–3.5 Years", logo: "https://logo.clearbit.com/rwth-aachen.de", link: "https://www.rwth-aachen.de" },
  { name: "University of Freiburg", rank: "112", programs: "Environmental Science, Economics, Computer Science", duration: "3 Years", logo: "https://logo.clearbit.com/uni-freiburg.de", link: "https://www.uni-freiburg.de" },
  { name: "Humboldt University of Berlin", rank: "120", programs: "Law, Political Science, Philosophy, Social Sciences", duration: "3 Years", logo: "https://logo.clearbit.com/hu-berlin.de", link: "https://www.hu-berlin.de" },
  { name: "University of Mannheim", rank: "135", programs: "Business Administration (BBA), Economics, Social Sciences", duration: "3 Years", logo: "https://logo.clearbit.com/uni-mannheim.de", link: "https://www.uni-mannheim.de" },
  { name: "Karlsruhe Institute of Technology (KIT)", rank: "140", programs: "Mechanical Engineering, Physics, Data Science", duration: "3 Years", logo: "https://logo.clearbit.com/kit.edu", link: "https://www.kit.edu" },
  { name: "University of Bonn", rank: "150", programs: "Mathematics, Economics, Computer Science, Cyber Security", duration: "3 Years", logo: "https://logo.clearbit.com/uni-bonn.de", link: "https://www.uni-bonn.de" }
];

const specialisations = {
  cs: {
    title: "Computer Science & IT",
    desc: "As Europe's largest digital economy, Germany is aggressively pursuing 'Industry 4.0'. The demand for computer science graduates is driven by a massive shift towards digitizing manufacturing and automotive sectors.",
    bestFor: "Students with solid analytical logic who want to build AI models, distributed systems, or cloud architectures.",
    insight: "Curricula often integrate Embedded Systems for automotive (autonomous driving), Cyber-Physical Systems, and AI ethics, skills heavily recruited by SAP, Siemens, and BMW.",
    skills: ["Embedded Systems", "Cyber-Physical Systems", "Machine Learning & AI"],
    duration: "3 Years (Uni) / 3.5 Years (FH)",
    salary: "€46,300 – €52,000",
    salaryVal: 46300
  },
  engineering: {
    title: "Engineering (Mech, Civil, Auto)",
    desc: "The 'Made in Germany' label is synonymous with engineering excellence. A Bachelor of Engineering in Germany typically involves rigorous math foundations followed by highly specialized electives in mechatronics or process engineering.",
    bestFor: "Aspiring engineers aiming for hands-on, high-tech industrial research and development.",
    insight: "Expect modules on Material Science, Thermodynamics, and CAD/CAM that prepare you for the German Mittelstand (medium-sized market leaders), which powers the economy.",
    skills: ["Material Science", "Thermodynamics", "CAD/CAM & Mechatronics"],
    duration: "3 Years (Uni) / 3.5–4 Years (FH)",
    salary: "€40,040 – €45,000",
    salaryVal: 40040
  },
  bba: {
    title: "Business Administration (BBA)",
    desc: "Many English-taught bachelor programs in Germany distinguish themselves by combining management with technology (e.g. 'Management & Technology' at TUM).",
    bestFor: "Students wishing to combine business acumen with green supply chain strategy and European green regulations.",
    insight: "Courses emphasize Supply Chain Management (logistics is huge in Germany), Controlling, and Sustainability Management to meet EU Green Deal regulations.",
    skills: ["Supply Chain Strategy", "Corporate Controlling", "Sustainability Management"],
    duration: "3 Years (Uni) / 3.5 Years (FH)",
    salary: "€40,000 – €50,000",
    salaryVal: 40000
  },
  nursing: {
    title: "Nursing & Healthcare",
    desc: "Germany is facing a 'Pflegenotstand' (care emergency) and actively recruiting foreign talent. BSc Nursing in Germany is now a strategic entry point for permanent residency.",
    bestFor: "Students pursuing high job security, clinical technology, and immediate public-sector employment.",
    insight: "Unlike generic degrees, German nursing programs (Pflegewissenschaft) focus heavily on Geriatric Care, Palliative Care, and Clinical Technology to support an aging population.",
    skills: ["Geriatric & Palliative Care", "Clinical Technology", "German Public Sector Tariff Rules"],
    duration: "3–3.5 Years (Dual vocational options)",
    salary: "€40,900 (~TVöD P7 standard)",
    salaryVal: 40900
  },
  economics: {
    title: "Economics",
    desc: "Germany is the economic engine of the EU. Studying economics here gives you a front-row seat to the Social Market Economy model, a unique blend of capitalism and social welfare.",
    bestFor: "Analytic minds aiming for financial institutions, European Central Bank (ECB) or national ministries.",
    insight: "Strong emphasis on Econometrics, Game Theory, and European Monetary Policy. Ideally suited for roles in the ECB or Bundesbank.",
    skills: ["Econometrics", "Game Theory", "European Monetary Policy"],
    duration: "3 Years",
    salary: "€40,000 – €45,000",
    salaryVal: 40000
  }
};

const scholarships = [
  { name: "Deutschlandstipendium", award: "€300 / month (~₹31,500)", criteria: "High achievers at participating universities. 50% paid by the government, 50% by private sponsors." },
  { name: "SBW Berlin Scholarship", award: "Full (Tuition + Housing + ~€480 allowance)", criteria: "Students with strong social commitment willing to return to India or execute projects." },
  { name: "Hans-Peter Wild Talent Scholarship", award: "€1,000 / month (~₹1.05 Lakhs)", criteria: "Specifically for talented STEM (MINT) students at Heidelberg University. No repayment." },
  { name: "TUM Scholarship", award: "€500 – €1,500 / semester", criteria: "One-time financial aid for international students at TUM based on grades and financial need." },
  { name: "RWTH Aachen Education Fund", award: "€300 / month (~₹31,500)", criteria: "Merit-based scholarship for RWTH students part of the Deutschlandstipendium network." }
];

const faqs = [
  {
    q: "Is Germany good for a bachelor's degree?",
    a: "Yes, absolutely. Germany offers world-class education with a focus on research and practical skills, all at a fraction of the cost of US or UK degrees. Graduates enjoy strong employability in Europe's largest economy, making it a top choice for Indian students."
  },
  {
    q: "Is a bachelor's degree free in Germany?",
    a: "Yes, mostly. Public universities in 15 out of 16 German states charge zero tuition fees for international students. You only pay a semester contribution of €100–€400. The main exceptions are universities in the state of Baden-Württemberg and the Technical University of Munich (TUM), which charge tuition fees for non-EU students."
  },
  {
    q: "How long is a bachelor's degree in Germany?",
    a: "A standard bachelor degree in Germany takes 3 years (6 semesters) at a traditional university. At Universities of Applied Sciences (Fachhochschulen), programs often last 3.5 to 4 years because they include a mandatory practical semester (internship)."
  },
  {
    q: "Can I study bachelors in Germany after 12th from India?",
    a: "Yes, but you typically need to complete a one-year Studienkolleg (preparatory course) because German schooling is 13 years while the Indian system is 12 years. However, if you clear JEE Advanced or finish one year of a bachelor's in India, you may qualify for direct admission to undergraduate courses in Germany."
  },
  {
    q: "Is the APS certificate mandatory for 2026?",
    a: "Absolutely. The APS certificate is a mandatory requirement for your student visa and university application. You should apply for it at least 10–12 months before your intended intake."
  }
];

const GermanyBachelorsPage = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [activeTab, setActiveTab] = useState('cs');
  const [faqOpen, setFaqOpen] = useState(null);

  const exchangeRate = 105.01; // Reference rate from guide

  const formatPrice = (valInEur) => {
    if (currency === 'EUR') {
      return `€ ${valInEur.toLocaleString()}`;
    }
    const valInInr = valInEur * exchangeRate;
    if (valInInr >= 10000000) {
      return `₹ ${(valInInr / 10000000).toFixed(2)} Cr`;
    }
    if (valInInr >= 100000) {
      return `₹ ${(valInInr / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${valInInr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans select-none">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-655 transition-colors">Home</Link>
          <ArrowRight size={10} className="text-slate-400" />
          <Link to="/study-abroad/germany" className="hover:text-indigo-655 transition-colors">Germany</Link>
          <ArrowRight size={10} className="text-slate-400" />
          <span className="text-slate-600 font-black">Bachelors</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
            <GraduationCap size={14} className="animate-pulse text-indigo-600" />
            <span>Germany Undergraduate Guide 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Bachelors in Germany:{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-655 bg-clip-text text-transparent">Complete Guide for Indians</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto mb-8">
            Germany hosts over 59,000 Indian students. Discover how to get admitted to prestigious public universities with zero tuition fees, clear the Studienkolleg bridge, and fast-track your European career.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { val: "€0", label: "Tuition at Public Unis" },
              { val: "59,419", label: "Indian Enrolments" },
              { val: "3 Years", label: "Standard Duration" },
              { val: "18 Months", label: "Job Seeker Stay-back" }
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
              className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-655 hover:bg-slate-550/10'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-[#DE5C2B] text-white shadow-sm' : 'text-slate-655 hover:bg-slate-550/10'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 2. DYNAMIC SPECIALISATIONS EXPLORER */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Best Bachelor Courses in Germany</h2>
            <p className="text-slate-500 text-sm font-bold">German programs emphasize specialized practical training built to address acute talent shortages.</p>
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
                  <p className="text-slate-600 leading-relaxed font-semibold text-sm">{specialisations[activeTab].desc}</p>
                  
                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Key Focus Area</h4>
                    <p className="text-slate-600 text-sm leading-relaxed font-semibold">{specialisations[activeTab].insight}</p>
                  </div>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs text-slate-400 font-black uppercase tracking-wider mb-4">Core Modules</h4>
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
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Course Duration</div>
                    <p className="text-slate-650 text-xs font-bold mt-1 mb-4">{specialisations[activeTab].duration}</p>
                    
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg. Entry Annual Salary</div>
                    <p className="text-indigo-600 text-xs font-black mt-1">
                      {specialisations[activeTab].salary} ({formatPrice(specialisations[activeTab].salaryVal)})
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. UNIVERSITIES TABLE */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Top Universities for Bachelors in Germany</h2>
            <p className="text-slate-500 text-sm font-bold">Top traditional research universities (Uni/TU) and structured technical hubs.</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                    <th className="py-4 px-6">University</th>
                    <th className="py-4 px-6 text-center">QS 2026 Rank</th>
                    <th className="py-4 px-6">Popular Programs</th>
                    <th className="py-4 px-6 text-center">Duration</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                  {universities.map((uni, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        {uni.logo && (
                          <img 
                            src={uni.logo} 
                            alt="" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                            className="w-7 h-7 rounded bg-slate-100 p-0.5 object-contain shrink-0" 
                          />
                        )}
                        <span className="font-black text-slate-800">{uni.name}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-orange-50 text-[#C04A1D] text-xs font-black">
                          #{uni.rank}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-600">{uni.programs}</td>
                      <td className="py-4 px-6 text-center text-slate-750 font-black">{uni.duration}</td>
                      <td className="py-4 px-6 text-center">
                        <a 
                          href={uni.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                        >
                          <span>Visit</span>
                          <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-2xl bg-indigo-50/40 border border-indigo-150 text-slate-500 text-[11px] font-bold flex items-start gap-2.5">
            <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <p>
              <strong>QS Rankings & FH Options:</strong> Do not fixate only on QS ranks. For immediate employment in IT or Engineering, Universities of Applied Sciences (Fachhochschulen/FH) like FH Aachen are highly respected, mandating practical semesters and direct industry placements.
            </p>
          </div>
        </div>

        {/* 4. ELIGIBILITY & HZB PATHWAYS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <div className="bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl">
            <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
              <Award className="text-indigo-655" size={22} />
              <span>Academic Eligibility & HZB Bridge</span>
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6 font-semibold">
              Because German school cycles last 13 years (Abitur) compared to 12 years in India, students must bridge this gap via a <strong>Studienkolleg</strong> or direct admission.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 text-xs font-semibold">
                <h4 className="font-black text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-indigo-600" />
                  Option A: One-Year Studienkolleg
                </h4>
                <p className="text-slate-500 mt-1.5 leading-relaxed">
                  Join a specialized preparatory course ending in the Feststellungsprüfung (FSP) assessment. Common tracks include <strong>T-Course</strong> (tech/maths), <strong>W-Course</strong> (business/social sciences), or <strong>M-Course</strong> (medicine).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 text-xs font-semibold">
                <h4 className="font-black text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-indigo-600" />
                  Option B: Direct Access Bypass
                </h4>
                <p className="text-slate-500 mt-1.5 leading-relaxed">
                  Qualify for direct subject-restricted admission and skip Studienkolleg if you have cleared the **JEE Advanced** entrance exam or successfully completed **1 full academic year** of a bachelor's degree at a recognized Indian university.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Languages className="text-indigo-655" size={22} />
                <span>Language & Document Checklist</span>
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6 font-semibold">
                Submit certified transcripts via Campus France/Uni-Assist. Maintain strict language standards for both English and German courses.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="text-indigo-650" size={14} />
                    <span>APS Certificate (Mandatory)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="text-indigo-650" size={14} />
                    <span>Class 10 & 12 Marksheets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="text-indigo-650" size={14} />
                    <span>IELTS (6.5+) / TOEFL (80+)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Check className="text-indigo-650" size={14} />
                    <span>DELF B2 / C1 (German taught)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="text-indigo-650" size={14} />
                    <span>Europass Format CV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="text-indigo-650" size={14} />
                    <span>Motivation Letter / SOP</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-[11px] font-bold text-amber-800 flex items-start gap-2">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>
                **APS Verification:** The APS India verification must be started early using Class 12 admit cards or provisional marks to avoid 4-5 month processing delays during peak seasons.
              </span>
            </div>
          </div>
        </div>

        {/* 5. DETAILED COST CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <div className="lg:col-span-2 bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Calculator className="text-indigo-655" size={20} />
              <span>Tuition Fee Structure (Non-EU / Indian Students)</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 pb-3">
                    <th className="pb-3 text-left">State / Institution type</th>
                    <th className="pb-3 text-right">Fee (Per Semester)</th>
                    <th className="pb-3 text-right">Fee in INR (Per Semester)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  {[
                    { type: "Most Public Universities", eur: 0, desc: "Zero tuition fees regardless of nationality." },
                    { type: "State of Baden-Württemberg (e.g. Heidelberg)", eur: 1500, desc: "Mandatory for international students." },
                    { type: "Technical University of Munich (TUM)", eur: 2500, desc: "Range of €2,000 to €3,000 for English programs." },
                    { type: "Private Universities", eur: 7500, desc: "Range of €5,000 to €10,000 standard fees." }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-slate-800">{row.type}</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">{row.desc}</div>
                      </td>
                      <td className="py-3.5 text-right font-black text-slate-900">{row.eur === 0 ? "Free" : `€ ${row.eur.toLocaleString()}`}</td>
                      <td className="py-3.5 text-right font-black text-indigo-655">{row.eur === 0 ? "₹ 0" : formatPrice(row.eur)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="text-indigo-655" size={20} />
                <span>Blocked Account (Sperrkonto)</span>
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                To receive your national student visa, you must deposit **€11,904** into a blocked account as proof of funds.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex justify-between">
                <span>Annual Deposit</span>
                <span className="font-black text-slate-900">€ 11,904 ({formatPrice(11904)})</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Payout</span>
                <span className="font-black text-slate-900">€ 992 ({formatPrice(992)})</span>
              </div>
              <div className="flex justify-between">
                <span>Visa Stamp Fee</span>
                <span className="font-black text-slate-900">€ 75 ({formatPrice(75)})</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 rounded-xl bg-slate-50/50 border border-slate-100 text-[10px] text-slate-500 font-semibold leading-relaxed">
              **Startup Reserves:** Keep €1,500–€2,000 extra in liquid funds for rental deposits (Kaution) and basic unfurnished apartment furniture setup.
            </div>
          </div>
        </div>

        {/* 6. SCHOLARSHIPS */}
        <div className="bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl mb-20">
          <h3 className="text-2xl font-black text-slate-900 mb-3">Undergraduate Scholarships in Germany</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8 font-semibold">
            Apply early for government-backed and university-specific grants. Note that many foundation awards value social engagement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((sch, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50/65 border border-slate-100/60 hover:shadow-xs transition-shadow">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider block w-fit mb-3">
                  {sch.name}
                </span>
                <h4 className="text-sm font-black text-slate-800 mb-1.5">{sch.award}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">{sch.criteria}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. CAREERS AND STAY-BACK PATHWAYS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-[32px] p-8 md:p-12 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute right-[-10%] top-[-20%] w-[380px] h-[380px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-sky-400 animate-pulse" size={20} />
                <span className="text-xs font-black text-sky-300 uppercase tracking-widest">Residency pathways</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-4">Post-Graduation Legal Rights</h3>
              <p className="text-white/80 text-xs md:text-sm font-semibold leading-relaxed">
                Germany provides one of the most structural transition pathways in the EU for international graduates to secure employment and residence:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10 text-xs font-bold text-white">
              <div>
                <span className="text-sky-300 block text-lg font-black">18 Months</span>
                <span className="text-white/70 font-semibold block mt-0.5">Job Seeker Visa</span>
              </div>
              <div>
                <span className="text-sky-300 block text-lg font-black">Chancenkarte</span>
                <span className="text-white/70 font-semibold block mt-0.5">Opportunity Card</span>
              </div>
              <div>
                <span className="text-sky-300 block text-lg font-black">EU Blue Card</span>
                <span className="text-white/70 font-semibold block mt-0.5">Salary-Linked Fast-Track</span>
              </div>
            </div>
          </div>

          <div className="bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6">Counsellor Job Hunting Strategy</h3>
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center shrink-0 font-black text-[10px] text-indigo-700 mt-0.5">1</span>
                <div>
                  <h4 className="font-black text-slate-800">Learn German to B1/B2 Level</h4>
                  <p className="text-slate-500 mt-1 leading-relaxed">Even for English-taught courses, office banters and local connections happen in German. Reaching B1 increases internship prospects tenfold.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center shrink-0 font-black text-[10px] text-indigo-700 mt-0.5">2</span>
                <div>
                  <h4 className="font-black text-slate-800">Leverage Werkstudent Part-Time Roles</h4>
                  <p className="text-slate-500 mt-1 leading-relaxed">Work up to 20 hours per week in IT or engineering firms during studies. This covers living costs and acts as a direct hiring pipeline.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center shrink-0 font-black text-[10px] text-indigo-700 mt-0.5">3</span>
                <div>
                  <h4 className="font-black text-slate-800">Network via local student bodies (Fachschaft)</h4>
                  <p className="text-slate-500 mt-1 leading-relaxed">Germans hire through trust. Standard online portals are often automated. Recommendation letters carry immense weight.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 8. FAQ ACCORDION */}
        <div className="mb-20 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-sm font-bold">Everything you need to know about undergraduate admissions in Germany.</p>
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
        <StudyAbroadCTA country="Germany" />

      </div>
    </div>
  );
};

export default GermanyBachelorsPage;
