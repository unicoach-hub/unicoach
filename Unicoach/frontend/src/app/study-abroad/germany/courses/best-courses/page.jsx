import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Info, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

// ─────────────────────────────────────────────
// DATA SECTION
// ─────────────────────────────────────────────

const topCoursesMatrix = [
  { course: "Engineering", spec: "Mechanical, Automotive, Robotics, Mechatronics", salaryRange: "€50,000 – €70,000", keySalary: 50000, demand: "Critical", visa: "EU Blue Card / Skilled Worker" },
  { course: "Computer Science / AI", spec: "Data Science, Cybersecurity, AI & Machine Learning", salaryRange: "€55,000 – €85,000", keySalary: 55000, demand: "Very High", visa: "EU Blue Card / Job Seeker" },
  { course: "Business Management", spec: "Supply Chain, Finance, Sustainability Management", salaryRange: "€45,000 – €75,000", keySalary: 45000, demand: "High", visa: "EU Blue Card / Skilled Worker" },
  { course: "Medicine & Dentistry", spec: "Public Health, Clinical Medicine, Nursing", salaryRange: "€60,000 – €95,000", keySalary: 60000, demand: "Very High", visa: "Skilled Worker (Recognition Req.)" },
  { course: "Environmental Science", spec: "Renewable Energy, Climate Policy, Green Engineering", salaryRange: "€50,000 – €65,000", keySalary: 50000, demand: "Rising", visa: "Skilled Worker / Job Seeker" },
  { course: "Law", spec: "Corporate Law, Intellectual Property, Trade Law", salaryRange: "€40,005 – €75,000", keySalary: 40005, demand: "Medium", visa: "Skilled Worker (Bar Exam Req.)" },
  { course: "Psychology", spec: "Cognitive Psychology, Business Psychology", salaryRange: "€45,000 – €60,000", keySalary: 45000, demand: "Medium", visa: "Skilled Worker" },
  { course: "Architecture", spec: "Sustainable Design, Smart Cities, Urban Planning", salaryRange: "€40,000 – €55,000", keySalary: 40000, demand: "Medium", visa: "Skilled Worker / Job Seeker" },
  { course: "Social Sciences", spec: "Political Science, Sociology, Policy Advisor", salaryRange: "€38,000 – €50,000", keySalary: 38000, demand: "Niche", visa: "Job Seeker Visa" },
  { course: "Humanities & Art", spec: "Media Studies, Cultural Management, Fine Arts", salaryRange: "€35,000 – €50,000", keySalary: 35000, demand: "Niche", visa: "Job Seeker / Freelance Artist" }
];

const courseDetails = {
  engineering: {
    title: "Engineering",
    desc: "Germany employs over 1.5 million engineers, making it one of the largest engineering industries in the world. The engineering sector contributes significantly to Germany's GDP, accounting for more than 25%.",
    unis: [
      { name: "Technical University of Munich", fee: "€4,000 – €12,000/year" },
      { name: "Technical University of Berlin", fee: "€600/year (semester fee)" },
      { name: "RWTH Aachen University", fee: "€608/year (semester fee)" }
    ],
    jobs: [
      { role: "Mechanical Engineer", sal: 51800 },
      { role: "Electrical Engineer", sal: 53400 },
      { role: "Civil Engineer", sal: 45400 }
    ],
    insight: "Most Indian engineering students underestimate the value of learning German. Even B1-level German can open doors to internships at companies like Siemens, Bosch, and BMW where hiring managers prefer candidates who can communicate with local teams. Start learning early."
  },
  cs: {
    title: "Computer Science",
    desc: "Germany's computing market generates billions in revenue, with a continuous demand for software developers, IT project leads, and cloud architects across all sectors.",
    unis: [
      { name: "Technical University of Munich", fee: "€4,000 – €12,005/year" },
      { name: "Technical University of Berlin", fee: "€600/year" },
      { name: "Karlsruhe Institute of Technology", fee: "€3,000/year" }
    ],
    jobs: [
      { role: "Data Scientist", sal: 56600 },
      { role: "Project Manager", sal: 67000 },
      { role: "IT Manager", sal: 76800 }
    ],
    insight: "AI and Data Science specialisations are currently the fastest-moving hiring areas in Germany. Students who combine a CS degree with even one semester of AI coursework or a relevant Kaggle/GitHub portfolio are getting placed 2-3x faster. Specialise early."
  },
  business: {
    title: "Business Management",
    desc: "With a massive wealth management and corporate logistics system in Germany, companies seek experts who can manage complex global supply chains and lead corporate development.",
    unis: [
      { name: "Mannheim Business School", fee: "€45,000 (total program fee)" },
      { name: "TUM School of Management", fee: "€4,000 – €12,000/year" },
      { name: "HHL Leipzig Graduate School of Management", fee: "€33,000 – €37,500" }
    ],
    jobs: [
      { role: "Financial Analyst", sal: 54400 },
      { role: "Digital Marketing Manager", sal: 48400 },
      { role: "Management Consultant", sal: 63300 }
    ],
    insight: "Logistics and sustainability controlling are massive growth areas due to new EU green rules. A business management focus aligned with sustainability will highly differentiate your profile."
  },
  medicine: {
    title: "Medicine and Dentistry",
    desc: "A stable and growing industry with highly subsidized public training. Reaching state validation (Approbation) enables clinical medical practice across the entire EU.",
    unis: [
      { name: "Universität Heidelberg", fee: "€300/year" },
      { name: "Universität Regensburg", fee: "€360/year" },
      { name: "Albert-Ludwigs-Universität Freiburg", fee: "€3,000/year" }
    ],
    jobs: [
      { role: "Surgeon", sal: 65000 },
      { role: "Dentist", sal: 55300 },
      { role: "Physician", sal: 94000 }
    ],
    insight: "Medicine is the most rewarding but also the most demanding path. German C1 language proficiency is non-negotiable — you will be tested before clinical placements. Doing a voluntary social year (FSJ) or hospital internship before applying boosts profiles."
  }
};

const oneYearCourses = [
  { course: "International Business Management", uni: "University of Europe for Applied Sciences", feeEur: 12000, desc: "Fast-track management program combining global marketing, finance, and trade models." },
  { course: "General Management", uni: "SRH Berlin University of Applied Sciences", feeEur: 13800, desc: "A practical, project-based intensive curriculum suited for career switchers." },
  { course: "Master of European Studies", uni: "University of Bonn", feeEur: 600, desc: "An affordable public track focusing on EU law, policy, governance, and institutional structure." }
];

const GermanyBestCoursesPage = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const [activeDetail, setActiveDetail] = useState('engineering');

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

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans select-none">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-teal-50/40 via-sky-50/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-teal-200/10 to-indigo-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} className="text-slate-400" />
          <Link to="/study-abroad/germany" className="hover:text-indigo-655 transition-colors">Germany</Link>
          <ArrowRight size={10} className="text-slate-400" />
          <span className="text-slate-600 font-black">Best Courses</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles size={14} className="text-teal-655" />
            <span>High ROI Programs 2026/27</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Best Courses to Study in{' '}
            <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">Germany</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto mb-8">
            Germany has over 17,000 courses. Focus on engineering, CS, and management programs that align with Germany's 760,000+ skilled labor shortage for an easier post-graduation visa path.
          </p>
        </motion.div>

        {/* Global Currency Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-md inline-flex items-center gap-1">
            <button 
              onClick={() => setCurrency('EUR')}
              className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'EUR' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-655 hover:bg-slate-550/10'}`}
            >
              EUR (€)
            </button>
            <button 
              onClick={() => setCurrency('INR')}
              className={`px-5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${currency === 'INR' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-655 hover:bg-slate-550/10'}`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 2. DYNAMIC COURSES COMPARISON MATRIX */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Top 10 Courses Matrix</h2>
            <p className="text-slate-500 text-sm font-bold">Compare salaries, demand profiles, and residency visa paths across primary disciplines.</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                    <th className="py-4 px-6">Course Stream</th>
                    <th className="py-4 px-6">Popular Specialisations</th>
                    <th className="py-4 px-6 text-center">Job Demand</th>
                    <th className="py-4 px-6 text-right">Avg. Starting Salary</th>
                    <th className="py-4 px-6 text-center">Visa Pathway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                  {topCoursesMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-black text-slate-800">{item.course}</td>
                      <td className="py-4 px-6 font-bold text-slate-500">{item.spec}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.demand === 'Critical' || item.demand === 'Very High' 
                            ? 'bg-rose-50 text-rose-700' 
                            : item.demand === 'High' 
                              ? 'bg-teal-50 text-teal-700' 
                              : 'bg-slate-100 text-slate-655'
                        }`}>
                          {item.demand}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-indigo-650">
                        {currency === 'EUR' ? item.salaryRange : `${formatPrice(item.keySalary)}+`}
                      </td>
                      <td className="py-4 px-6 text-center text-slate-600">{item.visa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. DETAILED STREAM ACCORDIONS */}
        <div className="mb-20">
          <div className="text-left mb-8 max-w-2xl">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Stream Deep-Dives</h2>
            <p className="text-slate-500 text-sm font-bold">Get specific fee estimates, salaries by job roles, and core counsellor insights.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Stream buttons */}
            <div className="flex lg:flex-col overflow-x-auto gap-2 lg:border-r lg:border-slate-100 lg:pr-6 whitespace-nowrap scrollbar-none">
              {Object.keys(courseDetails).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveDetail(key)}
                  className={`py-3 px-5 text-left text-xs font-black rounded-xl transition-all cursor-pointer ${
                    activeDetail === key 
                      ? 'bg-teal-50 text-teal-700 shadow-xs' 
                      : 'text-slate-655 hover:bg-slate-550/10'
                  }`}
                >
                  {courseDetails[key].title}
                </button>
              ))}
            </div>

            {/* Active Details display */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDetail}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl space-y-8"
                >
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{courseDetails[activeDetail].title} Overview</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mt-2 font-semibold">{courseDetails[activeDetail].desc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Universities & Fees */}
                    <div>
                      <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Top Universities & Fees</h4>
                      <div className="space-y-4">
                        {courseDetails[activeDetail].unis.map((uni, i) => (
                          <div key={i} className="flex justify-between items-start gap-4 text-xs font-semibold pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                            <span className="font-bold text-slate-800">{uni.name}</span>
                            <span className="text-teal-700 shrink-0 font-black">{uni.fee}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Jobs & Salaries */}
                    <div>
                      <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Average Gross Salaries</h4>
                      <div className="space-y-4">
                        {courseDetails[activeDetail].jobs.map((job, i) => (
                          <div key={i} className="flex justify-between items-center text-xs font-semibold">
                            <span className="font-bold text-slate-800">{job.role}</span>
                            <span className="text-indigo-655 font-black">{formatPrice(job.sal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-teal-50/40 border border-teal-150 text-[11px] font-bold text-slate-600 flex items-start gap-2.5">
                    <Info size={16} className="text-teal-700 shrink-0 mt-0.5" />
                    <p>
                      <strong>Counsellor Insight:</strong> {courseDetails[activeDetail].insight}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 4. ONE YEAR COURSES FEATURE */}
        <div className="bg-white/60 border border-white rounded-[32px] p-8 shadow-sm backdrop-blur-xl mb-20">
          <h3 className="text-2xl font-black text-slate-900 mb-3">Top 1-Year Courses in Germany</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8 font-semibold">
            Advance your career quickly. Suited for working professionals seeking high-intensity credentials.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {oneYearCourses.map((c, idx) => (
              <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xs transition-shadow">
                <div>
                  <h4 className="text-sm font-black text-slate-800 mb-1">{c.course}</h4>
                  <p className="text-[10px] text-teal-700 font-black block mb-3 uppercase tracking-wider">{c.uni}</p>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold mb-6">{c.desc}</p>
                </div>
                <div className="border-t border-slate-150 pt-4">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Average Fee</span>
                  <span className="text-indigo-650 text-sm font-black mt-0.5 block">€ {c.feeEur.toLocaleString()} ({formatPrice(c.feeEur)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. CTA SECTION */}
        <StudyAbroadCTA country="Germany" />

      </div>
    </div>
  );
};

export default GermanyBestCoursesPage;
