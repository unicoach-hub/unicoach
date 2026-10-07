import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, MapPin, Building, BookOpen, Clock, Settings,
  CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Coins, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const engineeringUnis = [
  {
    name: "Technical University of Munich (TUM)",
    city: "Munich",
    qsRank: "#22 Global",
    notableFor: "Mechanical Engineering, informatics, Aerospace, Management & Tech",
    avgStarting: 70000,
    recruiters: ["BMW", "Siemens", "Audi", "Google"],
    details: "TUM is Germany's highest-ranked institution in 2026. Known for its 'entrepreneurial university' spirit, it is deeply integrated with Munich's high-tech industry.",
    logo: "https://logo.clearbit.com/tum.de"
  },
  {
    name: "RWTH Aachen University",
    city: "Aachen",
    qsRank: "#105 Global",
    notableFor: "Automotive Engineering, Production Technology, Electrical Engineering",
    avgStarting: 75000,
    recruiters: ["Bosch", "Volkswagen", "Daimler", "Siemens"],
    details: "Often referred to as the 'MIT of Germany', RWTH Aachen is the largest technical university in the country, leading industrial research partnerships.",
    logo: "https://logo.clearbit.com/rwth-aachen.de"
  },
  {
    name: "Karlsruhe Institute of Technology (KIT)",
    city: "Karlsruhe",
    qsRank: "#98 Global",
    notableFor: "Energy Technology, Mechanical Engineering, Computer Science",
    avgStarting: 68000,
    recruiters: ["EnBW", "ABB", "Bosch", "Porsche"],
    details: "KIT is unique for being both a university and a large-scale national research center within the Helmholtz Association, dominating energy & mobility research.",
    logo: "https://logo.clearbit.com/kit.edu"
  },
  {
    name: "Technical University of Berlin (TU Berlin)",
    city: "Berlin",
    qsRank: "#145 Global",
    notableFor: "Civil Engineering, Architecture, Innovation Management, CS",
    avgStarting: 66000,
    recruiters: ["Deutsche Bahn", "Siemens", "Zalando", "Berlin Startups"],
    details: "Located in the industrial capital, TU Berlin focuses on providing graduates with high-level technical qualifications and modern, innovation-led admin techniques.",
    logo: "https://logo.clearbit.com/tu.berlin"
  }
];

const salariesByDiscipline = [
  { discipline: "Automotive & Aerospace Engineering", min: 55000, max: 75000, outlook: "Extremely High (Munich, Stuttgart & Wolfsburg automotive clusters)" },
  { discipline: "Computer Science, AI & Software Systems", min: 48000, max: 70000, outlook: "High (Rapidly growing tech hubs in Berlin, Munich & Hamburg)" },
  { discipline: "Mechanical & Robotics Engineering", min: 52000, max: 68000, outlook: "Very High (Sustained demand across Germany's industrial belt)" },
  { discipline: "Renewable Energy & Climate Engineering", min: 50000, max: 65000, outlook: "Rapid Growth (Fueled by Germany's 2045 carbon-neutrality targets)" }
];

const GermanyEngineering = () => {
  const [currency, setCurrency] = useState('INR'); // 'EUR' | 'INR'
  const exchangeRate = 110.14; // Reference 1 EUR ≈ 110.14 INR

  const formatCost = (valInEUR) => {
    if (currency === 'EUR') {
      return `€ ${valInEUR.toLocaleString()}`;
    }
    const valInINR = valInEUR * exchangeRate;
    return `₹ ${(valInINR / 100000).toFixed(2)} Lakh`;
  };

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-[#eff6ff]/50 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/germany" className="hover:text-indigo-650 transition-colors">Germany</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Engineering in Germany</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <Settings size={14} className="text-indigo-650 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Germany's Elite Technical Universities (TU9)</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Top Universities for{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Engineering in Germany</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto">
            Germany faces a critical shortage of over 760,000 skilled technical workers. Benefit from world-respected engineering curricula, cutting-edge R&D infrastructure, and zero tuition bounds.
          </p>
        </motion.div>

        {/* Currency Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border border-slate-200/60 p-1.5 rounded-2xl shadow-sm inline-flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider px-3">Average Salaries:</span>
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

        {/* 1. DISCIPLINE SALARY CHART */}
        <div className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-xl mb-16 overflow-hidden">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
            <Coins className="text-indigo-600" size={22} />
            Engineering Starting Salary Outlook (2026/27)
          </h2>
          <p className="text-slate-500 text-xs font-semibold mb-6">Explore the entry salaries for engineering graduates in the German job market.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                  <th className="pb-3 pr-4">Engineering Stream</th>
                  <th className="pb-3 pr-4">Starting Range (Min)</th>
                  <th className="pb-3 pr-4">Starting Range (Max)</th>
                  <th className="pb-3 pr-4 text-right">Job Market Demand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                {salariesByDiscipline.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4 text-slate-900 font-extrabold">{s.discipline}</td>
                    <td className="py-4 font-black text-slate-800">{formatCost(s.min)}</td>
                    <td className="py-4 font-black text-indigo-650">{formatCost(s.max)}</td>
                    <td className="py-4 text-right text-slate-550 text-xs font-bold">{s.outlook}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. THE ECTS CREDIT MATCHING NOTICE */}
        <div className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white rounded-[32px] p-8 md:p-12 shadow-xl mb-16 relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-20%] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl md:text-3xl font-black mb-4">ECTS Credit Matching for Engineers</h2>
          <p className="text-white/80 text-xs md:text-sm font-semibold leading-relaxed max-w-3xl">
            In Germany, engineering programs follow the **"consecutive master's"** rule. Admission committees review your Indian syllabus. You must have equivalent ECTS credits in mathematical engineering (such as advanced Calculus, linear algebra, numerical analysis) and theoretical engineering (thermodynamics, algorithm complexity, theory of structures). Lacking even a single math credit can result in automatic rejection, regardless of your GPA.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 text-xs font-black">
            <Link 
              to="/contact?tab=ects-engineering" 
              className="bg-white text-indigo-700 px-6 py-3 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
            >
              Review My Transcripts
            </Link>
          </div>
        </div>

        {/* 3. TU9 DETAILED PROFILES */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-8 text-center md:text-left">Germany's Top 4 Engineering Powerhouses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {engineeringUnis.map((uni, idx) => (
              <div 
                key={idx}
                className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-2.5 shadow-xs">
                        <img src={uni.logo} alt="" className="w-10 h-10 object-contain" onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`} />
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-650 font-black uppercase tracking-wider block">{uni.qsRank}</span>
                        <h3 className="font-black text-slate-900 text-sm md:text-base mt-0.5">{uni.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                          <MapPin size={10} />
                          {uni.city}, Germany
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-650 text-xs font-semibold leading-relaxed mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    {uni.details}
                  </p>

                  <div className="space-y-3.5 mb-6 text-xs text-slate-700 font-bold">
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Specialized Engineering Branches</span>
                      <span className="text-slate-800 text-[11px] block mt-1">{uni.notableFor}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Top Recruiters</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {uni.recruiters.map((r, i) => (
                          <span key={i} className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Average Starting Salary</span>
                    <span className="text-base font-black text-indigo-650 block mt-0.5">{formatCost(uni.avgStarting)}</span>
                  </div>
                  <Link 
                    to={`/contact?university=${encodeURIComponent(uni.name)}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-xs"
                  >
                    Check Admission Chances
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. RECRUITER TIES & OUTLOOK */}
        <div className="bg-white/50 border border-white rounded-[32px] p-8 shadow-xs text-center max-w-4xl mx-auto">
          <Building className="mx-auto text-indigo-600 mb-4" size={32} />
          <h3 className="text-2xl font-black text-slate-900 mb-2">Ties with Industrial Giants</h3>
          <p className="text-slate-500 text-sm font-semibold mb-8 max-w-md mx-auto">
            Germany's TUs work closely with major engineering corporations. Many master's theses are written directly inside R&D departments at:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Siemens AG", "Mercedes-Benz", "Robert Bosch", "Airbus SE", "Porsche AG", "BMW Group", "Volkswagen AG", "BASF Chemical"].map((rec, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl font-black text-xs text-slate-700 flex items-center justify-center">
                {rec}
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

export default GermanyEngineering;
