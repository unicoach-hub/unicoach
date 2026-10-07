import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Building, Globe, ExternalLink, BookOpen, Calendar, HelpCircle, 
  CheckCircle2, ArrowRight, Plane, GraduationCap, ShieldAlert,
  ChevronDown, ChevronUp, Clock, FileText, Check, Sparkles, User, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

// ─────────────────────────────────────────────
// DATA SECTION
// ─────────────────────────────────────────────

const universities = [
  { name: "Technical University of Munich (TUM)", rank: "#28", fields: "Engineering, Computer Science, Physics", feeMin: 0, feeMax: 500, link: "https://www.tum.de" },
  { name: "Heidelberg University", rank: "#50", fields: "Medicine, Chemistry, Life Sciences", feeMin: 0, feeMax: 1500, link: "https://www.uni-heidelberg.de" },
  { name: "Ludwig Maximilian University of Munich (LMU)", rank: "#59", fields: "Humanities, Physics, Psychology", feeMin: 0, feeMax: 400, link: "https://www.lmu.de" },
  { name: "RWTH Aachen University", rank: "#99", fields: "Mechanical & Chemical Engineering", feeMin: 0, feeMax: 600, link: "https://www.rwth-aachen.de" },
  { name: "Humboldt University of Berlin", rank: "#120", fields: "Social Sciences, Physics, Economics", feeMin: 0, feeMax: 800, link: "https://www.hu-berlin.de" },
  { name: "University of Freiburg", rank: "#138", fields: "Biotechnology, Chemistry, Environmental Sciences", feeMin: 0, feeMax: 1500, link: "https://www.uni-freiburg.de" },
  { name: "Free University of Berlin", rank: "#150", fields: "Political Science, Sociology, Humanities", feeMin: 0, feeMax: 700, link: "https://www.fu-berlin.de" },
  { name: "Karlsruhe Institute of Technology (KIT)", rank: "#167", fields: "Electrical Engineering, Computer Science, Physics", feeMin: 0, feeMax: 600, link: "https://www.kit.edu" },
  { name: "University of Tübingen", rank: "#177", fields: "Medicine, Neuroscience, Theology", feeMin: 0, feeMax: 1000, link: "https://www.uni-tuebingen.de" },
  { name: "University of Göttingen", rank: "#189", fields: "Physics, Biology, Agricultural Sciences", feeMin: 0, feeMax: 500, link: "https://www.uni-goettingen.de" }
];

const specialisations = {
  engineering: {
    title: "Engineering and Technology",
    desc: "Among the most popular choices, this field includes sub-specialisations such as Mechanical, Electrical, Civil, and Automotive Engineering. Germany's engineering expertise, led by universities like TUM and RWTH Aachen, attracts thousands of PhD researchers annually.",
    bestFor: "Students with a background in engineering (M.Tech/ME/B.Tech) who want to work on advanced automation and green tech.",
    insight: "Highly industry-linked; many candidates work directly with R&D clusters of automakers (e.g. BMW, Porsche) and engineering giants (e.g. Siemens, Bosch).",
    skills: ["Advanced Automation", "Industry 4.0 Integration", "Cyber-Physical Systems"],
    fees: "Free (€0) at public universities (nominal semester fee of ~€150–€300/sem)."
  },
  sciences: {
    title: "Natural Sciences (Chemistry, Physics, Biology)",
    desc: "Programs in chemistry and physics are highly competitive, with strong links to global research institutions and industries. Indian students often prefer PhD Chemistry or Physics in Germany due to advanced lab infrastructure and collaborative research grants.",
    bestFor: "M.Sc graduates in basic sciences targeting research-intensive careers at institutes like Max Planck or Helmholtz.",
    insight: "Germany has some of the world's most sophisticated physics and chemistry laboratory networks, yielding high research output and publishing impact.",
    skills: ["Molecular Engineering", "Spectroscopy", "Quantum Physics Modeling"],
    fees: "Free (€0) at public universities."
  },
  cs: {
    title: "Computer Science and AI",
    desc: "With Germany’s digital innovation strategy, AI and data-driven research are booming. Universities such as LMU Munich and Karlsruhe Institute of Technology (KIT) lead in this area, offering cutting-edge facilities for deep tech research.",
    bestFor: "Tech enthusiasts with high mathematics and coding foundations interested in ML, computer vision, or cloud architecture.",
    insight: "Collaborations with major tech firms like SAP and IBM Germany provide excellent corporate funding and post-PhD careers.",
    skills: ["Deep Learning Models", "Distributed Cloud Architecture", "Robotics Navigation Algorithms"],
    fees: "Free (€0) at public universities."
  },
  medicine: {
    title: "Medicine and Life Sciences",
    desc: "German universities are world-renowned for medical and biotechnology research. Institutions like Heidelberg University and the University of Tübingen provide extensive lab networks and clinical research opportunities.",
    bestFor: "Life Science, Biotech, or MD/MBBS graduates wanting to specialize in molecular biology or neuroscience.",
    insight: "Highly collaborative environment with university clinics (Universitätsklinikum) and German pharma majors.",
    skills: ["Clinical Trial Layouts", "Bioinformatics", "Neuro-Imaging Data Analysis"],
    fees: "Free (€0) at public universities; minor tuition fees may apply in select states (e.g. Baden-Württemberg)."
  },
  sustainability: {
    title: "Environmental & Sustainability Studies",
    desc: "As a global leader in renewable energy and sustainability, Germany offers top-tier PhDs in Environmental Engineering, Climate Science, and Sustainable Development, aligning with Germany's 'Energiewende' climate transition.",
    bestFor: "Scholars targeting climate modeling, carbon capture, or green hydrogen energy grids.",
    insight: "Access to the German Research Centre for Geosciences (GFZ) and specialized environmental policy think tanks.",
    skills: ["Climate Grid Modeling", "Carbon Footprint Analytics", "Sustainable Urban Policy Design"],
    fees: "Free (€0) at public universities."
  },
  business: {
    title: "Business, Economics, and Management",
    desc: "Business schools in Germany, including Mannheim University and LMU Munich, offer research-oriented programs in finance, economics, supply chain logistics, and strategic management.",
    bestFor: "MBA or M.Com graduates aiming for finance modeling, econometrics, or corporate governance research.",
    insight: "Focuses on European market dynamics, quantitative methodologies, and multinational organizational behavior.",
    skills: ["Econometric Modeling", "Quantitative Surveys", "Operations Optimization"],
    fees: "Free (€0) at public universities; private business schools can charge up to €15,000/year."
  },
  humanities: {
    title: "Social Sciences and Humanities",
    desc: "For students interested in sociology, political science, history, and philosophy, universities like Humboldt University of Berlin and Free University of Berlin are among the best in Europe, following the classic Humboldtian model of research-led teaching.",
    bestFor: "Scholars researching European history, comparative politics, or international sociology.",
    insight: "Strong interdisciplinary research groups (Graduate Schools) funded by the German Research Foundation (DFG).",
    skills: ["Qualitative Textual Analysis", "Comparative Historical Methods", "Sociological Demography"],
    fees: "Free (€0) at public universities."
  }
};

const preArrivalCosts = [
  { item: "APS Certificate Verification", costEur: 165, reason: "Mandatory academic credential verification for Indian applicants" },
  { item: "Blocked Account (Annual Deposit)", costEur: 11208, reason: "Mandatory proof of funds; yields €934/month for living expenses (2026 update)" },
  { item: "National Student Visa Fee (Type D)", costEur: 75, reason: "Embassy administration cost" },
  { item: "Travel & Flight Ticket (One-way)", costEur: 500, reason: "Estimated airfare from India to Frankfurt/Munich" },
  { item: "IELTS/TOEFL Exam Registration", costEur: 190, reason: "English proficiency test standard fee in India" },
  { item: "Rental Deposit (Kaution)", costEur: 1200, reason: "Average 2 months of rent, refundable upon moving out" }
];

const scholarships = [
  { name: "DAAD Research Grants", coverage: "Monthly stipend of €1,300, health insurance, travel allowance, and research subsidies", details: "Open to international students (including Indians) in individual/structured programs. Requires strong academic record." },
  { name: "DFG (German Research Foundation)", coverage: "Funding for research projects, doctoral training positions, and collaborative grants", details: "Available to PhD candidates involved in group research projects under recognized universities." },
  { name: "Erasmus+ Joint Doctorate", coverage: "Full tuition coverage (if any), monthly allowance, and travel mobility grants", details: "For students enrolled in joint PhD programs across multiple European universities." },
  { name: "Heinrich Böll Foundation", coverage: "Monthly stipend, plus travel and research allowances", details: "For students demonstrating academic excellence, social commitment, and environmental alignment." },
  { name: "University-Specific Fellowships", coverage: "Monthly stipends between €1,200–€1,600", details: "Offered directly by top universities (Heidelberg, LMU, RWTH Aachen) based on academic merit." }
];

const careers = [
  { role: "University Professor", salaryEur: 78000, recruiters: "Humboldt University, LMU Munich, University of Heidelberg" },
  { role: "Research Group Leader", salaryEur: 70000, recruiters: "Max Planck Institute, Fraunhofer Society, Helmholtz Association" },
  { role: "Junior Professor", salaryEur: 62500, recruiters: "RWTH Aachen, TUM, University of Freiburg" },
  { role: "Postdoctoral Fellow", salaryEur: 65500, recruiters: "DFG Research Projects, Leibniz Institute, University of Göttingen" },
  { role: "Research Scientist (Industry)", salaryEur: 80000, recruiters: "Siemens, BASF, Bosch, Bayer AG, Mercedes-Benz Research" },
  { role: "Data Scientist / AI Researcher", salaryEur: 80000, recruiters: "SAP, IBM Germany, Deutsche Telekom, Zalando Tech" }
];

const faqs = [
  {
    q: "Is it free to do a PhD in Germany?",
    a: "Public universities in Germany usually do not charge tuition fees for PhD programmes, making it nearly free for both domestic and international students. You'll only need to pay a small semester contribution, typically between €150–€300, which covers administrative costs and public transport. Private universities may have higher fees depending on the program."
  },
  {
    q: "How much is the average salary after a PhD in Germany?",
    a: "PhD graduates in Germany earn highly competitive salaries. On average, starting salaries range between €55,000–€80,000 per year, depending on the field, industry, and location. Academic roles (such as Junior Professors or Postdocs) pay stable public salaries (TV-L E13 to E15 grades)."
  },
  {
    q: "Is Germany a good place to do a PhD?",
    a: "Yes, Germany is one of the top destinations globally due to its tuition-free system, world-class research infrastructure (including Max Planck and Fraunhofer institutes), and high employability. The combination of low costs, English-taught tracks, and research stipends makes it a high-ROI choice."
  },
  {
    q: "How many years does a PhD take in Germany?",
    a: "A PhD in Germany typically takes 3 to 4 years to complete, depending on the research complexity and whether you choose the individual format or structured doctoral program. Some engineering or experimental bioscience projects may extend up to 5 years."
  },
  {
    q: "Can I get Permanent Residency (PR) after my PhD in Germany?",
    a: "Yes. After completing your PhD, you can apply for an 18-month post-study work visa to find a job. Once you have worked and paid taxes in Germany for 2 years (on a Blue Card / skilled worker permit), you become eligible to apply for Permanent Residency (PR)."
  },
  {
    q: "What is the CGPA requirement for a PhD in Germany?",
    a: "A minimum CGPA of 7.5 or above (on a 10-point scale) at the Master's level is generally preferred by supervisor panels. Having prior research publications or conference presentations strongly offsets slightly lower CGPA scores."
  }
];

const GermanyPhdPage = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [activeTab, setActiveTab] = useState('engineering');
  const [faqOpen, setFaqOpen] = useState(null);

  const exchangeRate = 102.43;

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
            <span>Germany PhD Study Guide 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            PhD in Germany for Indian Students:{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Complete Guide</span>
          </h1>
          <p className="text-slate-650 text-lg md:text-xl leading-relaxed font-semibold max-w-3xl mx-auto mb-8">
            Earn a globally recognised doctoral degree from a top European research hub with zero tuition fees. Learn to navigate pathways, secure supervisor approvals, and claim high-value DAAD scholarships.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { val: "€0", label: "Tuition at Public Unis" },
              { val: "120+", label: "Doctoral Institutions" },
              { val: "€1,300/mo", label: "DAAD PhD Stipends" },
              { val: "2 Years", label: "Fast-Track PR Option" }
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

        {/* 2. DUAL PhD PATHWAYS */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Structured vs. Individual PhD</h2>
            <p className="text-slate-500 text-sm font-bold">Germany offers two distinct pathways. Choose the structure that aligns best with your research habits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-150 p-8 rounded-[2rem] shadow-xs flex flex-col justify-between">
              <div>
                <div className="inline-flex p-3 bg-orange-50 text-[#DE5C2B] rounded-2xl mb-5">
                  <User size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Individual Doctorate</h3>
                <p className="text-xs text-slate-500 font-bold mb-4 uppercase tracking-wider">Traditional Route (Chosen by 75% of candidates)</p>
                <p className="text-xs text-slate-550 leading-relaxed font-semibold mb-6">
                  You work independently under a single academic supervisor (Doktorvater/Doktormutter). This option offers massive flexibility in choosing your research topic, hours, and methodology. Ideal for self-starters who already have a clear research goal and can manage timelines autonomously.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-bold text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#DE5C2B]" /> Complete flexibility in research timeline</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#DE5C2B]" /> Self-directed topic proposal</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#DE5C2B]" /> Usually lasts 3–5 years</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-150 p-8 rounded-[2rem] shadow-xs flex flex-col justify-between">
              <div>
                <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-5">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">Structured PhD Program</h3>
                <p className="text-xs text-slate-500 font-bold mb-4 uppercase tracking-wider">Guided Route (Offered by Research Schools)</p>
                <p className="text-xs text-slate-550 leading-relaxed font-semibold mb-6">
                  Similar to doctoral programs in the US, you join a graduate school or research training group. You follow a structured curriculum with lectures, interdisciplinary seminars, and progress tracking by a supervisor committee. Great for students wanting collaborative environments.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-bold text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-indigo-500" /> Interdisciplinary cohort & seminars</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-indigo-500" /> Committee-guided progress monitoring</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-indigo-500" /> Standardized 3–4 year timeline</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. DYNAMIC SPECIALISATIONS EXPLORER */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Top PhD Fields & Specialisations</h2>
            <p className="text-slate-500 text-sm font-bold">Pick your research domain and discover key stats, requirements, and state-funded resources.</p>
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
                </div>

                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs text-slate-400 font-black uppercase tracking-wider mb-4">Core Skills Mapped</h4>
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
                    
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Program Cost</div>
                    <p className="text-indigo-600 text-xs font-black mt-1">{specialisations[activeTab].fees}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. UNIVERSITIES TABLE */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Top Universities for PhD in Germany</h2>
            <p className="text-slate-500 text-sm font-bold">Public universities charge €0 tuition. Compare popular fields and estimated semester contributions.</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                    <th className="py-4 px-6">University</th>
                    <th className="py-4 px-6 text-center">QS Rank 2026</th>
                    <th className="py-4 px-6">Popular PhD Fields</th>
                    <th className="py-4 px-6 text-right">Avg. Semester Contribution (EUR)</th>
                    <th className="py-4 px-6 text-right">Estimated Fee (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                  {universities.map((uni, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-black text-slate-800">{uni.name}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-orange-50 text-[#C04A1D] text-xs font-black">
                          {uni.rank}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">{uni.fields}</td>
                      <td className="py-4 px-6 text-right font-black text-slate-700">
                        € {uni.feeMin} – € {uni.feeMax}
                      </td>
                      <td className="py-4 px-6 text-right font-black text-indigo-650">
                        {formatPrice(uni.feeMin)} – {formatPrice(uni.feeMax)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Source: DAAD & German Academic Rankings 2026</span>
              <span className="text-xs text-slate-400 font-bold">Conversion Rate: €1 = ₹102.43</span>
            </div>
          </div>
        </div>

        {/* 5. ELIGIBILITY & REQS */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Eligibility & Requirements</h2>
            <p className="text-slate-500 text-sm font-bold">Ensure your academic credentials and documentation match Germany's high research standards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black">1</div>
              <h3 className="text-base font-black text-slate-800 mb-2">Academic Qualifications</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Candidates must hold a Master's degree in a relevant field. A minimum CGPA of 7.5 or above (on a 10-point scale) is preferred. Exceptional 4-year Bachelor's graduates (B.E./B.Tech) with prior research and publications may also apply.
              </p>
            </div>

            <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black">2</div>
              <h3 className="text-base font-black text-slate-800 mb-2">Language Proficiency</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                <strong>English Programs:</strong> IELTS score minimum 6.5 or TOEFL iBT 90+.<br />
                <strong>German Programs:</strong> TestDaF or DSH certification is mandatory. A basic level of German (A1/A2) is highly recommended for daily life.
              </p>
            </div>

            <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-sm backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-black">3</div>
              <h3 className="text-base font-black text-slate-800 mb-2">Supervisor Approval</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                For the Individual track, you must contact professors and secure a supervisory commitment letter (Doktorvater/Doktormutter confirmation) based on a compelling, customized research proposal.
              </p>
            </div>
          </div>
        </div>

        {/* 6. STEP-BY-STEP ROADMAP */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          
          {/* Timeline Card */}
          <div className="lg:col-span-1 bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="text-indigo-650" size={20} />
              <span>Application Roadmap 2026</span>
            </h3>
            
            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {[
                { step: "1. Shortlist & Proposal", desc: "Select program types (Individual vs Structured) and draft your research proposal." },
                { step: "2. Find Supervisor", desc: "Reach out to potential supervisors with your CV, proposal, and cover letter." },
                { step: "3. Apply for Admissions", desc: "Submit through the university portal or Uni-Assist once supervisor agrees." },
                { step: "4. Apply for Funding", desc: "Apply for DAAD Research Grants, DFG support, or university fellowships." },
                { step: "5. Visa & Relocation", desc: "Open blocked account (€11,208 update) and submit National Visa (Type D) application." }
              ].map((item, idx) => (
                <div key={idx} className="relative pl-8 text-xs">
                  <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm z-10">
                    {idx + 1}
                  </div>
                  <h4 className="font-black text-slate-800 mb-1">{item.step}</h4>
                  <p className="text-slate-500 leading-relaxed font-semibold">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Blocked Account & APS Warning */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-[32px] p-8 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider mb-4">
                  <ShieldAlert size={12} />
                  <span>Mandatory Requirements for Indians</span>
                </div>
                <h4 className="text-2xl font-black mb-3">APS Verification & Blocked Accounts</h4>
                <p className="text-indigo-200/90 text-xs leading-relaxed font-semibold mb-6">
                  Indian applicants require an <strong>APS Certificate</strong> before scheduling a visa interview. Apply early using DigiLocker to expedite processing. Additionally, you must fund a German Blocked Account with <strong>€11,208 (₹11.47L equivalent)</strong> to satisfy student visa financial requirements.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wider block">APS Cost</span>
                    <span className="text-sm font-black mt-0.5 block">₹18,000 (~€165)</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wider block">Processing Time</span>
                    <span className="text-sm font-black mt-0.5 block">4 to 12 weeks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Documents Checklist */}
            <div className="bg-white border border-slate-200/60 rounded-[32px] p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="text-[#DE5C2B]" size={18} />
                <span>Documents Checklist</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                {[
                  "Valid Passport Copy",
                  "Consolidated Master's Transcripts",
                  "Curriculum Vitae (Europass CV)",
                  "SOP / Motivation Letter",
                  "Detailed Research Proposal",
                  "2 Academic LORs",
                  "IELTS (6.5+) or TOEFL (90+) Certificate",
                  "Supervisor's Letter of Commitment"
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-650 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* 7. SCHOLARSHIPS SECTION */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">PhD Funding & Scholarships</h2>
            <p className="text-slate-500 text-sm font-bold">Germany offers excellent funding models. Apply early to secure monthly stipends and allowances.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((sch, idx) => (
              <div key={idx} className="bg-white border border-slate-150 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm mb-2">{sch.name}</h3>
                  <div className="bg-indigo-50 text-indigo-750 p-3.5 rounded-xl text-xs font-black mb-3">
                    {sch.coverage}
                  </div>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    {sch.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. CAREERS & SALARY GRID */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Post-PhD Careers & Salaries</h2>
            <p className="text-slate-500 text-sm font-bold">With an 87% employment rate, Germany offers high return on research. Explore average post-PhD salaries.</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                    <th className="py-4 px-6">Job Role</th>
                    <th className="py-4 px-6 text-right">Avg. Annual Salary (EUR)</th>
                    <th className="py-4 px-6 text-right">Avg. Annual Salary (INR)</th>
                    <th className="py-4 px-6">Top Recruiters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                  {careers.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-black text-slate-800">{c.role}</td>
                      <td className="py-4 px-6 text-right font-black text-slate-700">
                        € {c.salaryEur.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right font-black text-indigo-655">
                        {formatPrice(c.salaryEur)}
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-bold">{c.recruiters}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 9. FAQs */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-black text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-black text-xs text-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-50/50 transition-colors border-none"
                >
                  <span>{faq.q}</span>
                  {faqOpen === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {faqOpen === idx && (
                  <div className="p-5 text-xs text-slate-500 font-semibold border-t border-slate-100 leading-relaxed bg-slate-50/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Study Abroad CTA */}
        <StudyAbroadCTA country="Germany" />

      </div>
    </div>
  );
};

export default GermanyPhdPage;
