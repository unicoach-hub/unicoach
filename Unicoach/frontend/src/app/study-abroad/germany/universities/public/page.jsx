import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, MapPin, Award, BookOpen, AlertTriangle,
  CheckCircle2, ArrowRight, ShieldCheck, HelpCircle, Landmark
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

const publicUnis = [
  { rank: 22, name: "Technical University of Munich (TUM)", city: "Munich", type: "TU (Technical University)", fee: "Semester Contribution only (some course fees)", logo: "https://logo.clearbit.com/tum.de" },
  { rank: 58, name: "LMU Munich", city: "Munich", type: "Classic Universität", fee: "€300 / semester", logo: "https://logo.clearbit.com/lmu.de" },
  { rank: 80, name: "Heidelberg University", city: "Heidelberg", type: "Classic Universität", fee: "€1,500 / semester (State fee)", logo: "https://logo.clearbit.com/uni-heidelberg.de" },
  { rank: 98, name: "KIT (Karlsruhe)", city: "Karlsruhe", type: "TU & Research Center", fee: "€1,500 / semester (State fee)", logo: "https://logo.clearbit.com/kit.edu" },
  { rank: 105, name: "RWTH Aachen University", city: "Aachen", type: "TU (Technical University)", fee: "€350 / semester", logo: "https://logo.clearbit.com/rwth-aachen.de" },
  { rank: 88, name: "Free University Berlin", city: "Berlin", type: "Classic Universität", fee: "€310 / semester", logo: "https://logo.clearbit.com/fu-berlin.de" },
  { rank: 130, name: "Humboldt University Berlin", city: "Berlin", type: "Classic Universität", fee: "€315 / semester", logo: "https://logo.clearbit.com/hu-berlin.de" },
  { rank: 145, name: "Technical University of Berlin", city: "Berlin", type: "TU (Technical University)", fee: "€300 / semester", logo: "https://logo.clearbit.com/tu.berlin" },
  { rank: 193, name: "University of Hamburg", city: "Hamburg", type: "Classic Universität", fee: "€335 / semester", logo: "https://logo.clearbit.com/uni-hamburg.de" },
  { rank: 201, name: "University of Freiburg", city: "Freiburg", type: "Classic Universität", fee: "€1,500 / semester (State fee)", logo: "https://logo.clearbit.com/uni-freiburg.de" }
];

const GermanyPublic = () => {
  const [activePathway, setActivePathway] = useState('uni'); // 'uni' | 'fh'

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient background designs */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-50/50 via-indigo-50/10 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-indigo-300/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/germany" className="hover:text-indigo-650 transition-colors">Germany</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">Public Universities</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-xs">
            <Landmark size={14} className="text-indigo-650" />
            <span>State Funded Public Higher Education</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Public Universities in{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Germany 2026</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto">
            Funded by German taxpayers, public institutions charge no tuition fees for international students. Discover the elite academic centers driving technological advancement and sustainable growth in Europe.
          </p>
        </motion.div>

        {/* 1. WHY PUBLIC UNIVERSITIES ARE FREE BANNER */}
        <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-[32px] p-8 md:p-10 shadow-xs mb-16 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Why is Tuition Free?</h2>
            <p className="text-slate-650 text-xs md:text-sm font-semibold leading-relaxed">
              The German federal government believes that higher education should not be commercialized. By state funding universities, Germany maintains a steady pipeline of highly qualified engineers, IT scientists, and medical researchers to sustain its massive industry segments. This taxpayer-funded model is a key driver for Germany's economic strength, and it is open to all qualified international students.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>No tuition bounds</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Equal criteria for non-EU</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 border border-slate-100 rounded-2xl p-6 space-y-4">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">A nominal cost is still paid:</h4>
            <div className="space-y-3 text-xs font-semibold text-slate-600">
              <div className="pb-2 border-b border-slate-100 flex justify-between">
                <span>Semester Contribution</span>
                <span className="font-black text-indigo-650">€150 - €350 / sem</span>
              </div>
              <div className="pb-2 border-b border-slate-100 flex justify-between">
                <span>Administrative Fee</span>
                <span className="font-black text-slate-800">~€75</span>
              </div>
              <div className="flex justify-between">
                <span>Local Semester Ticket</span>
                <span className="font-black text-emerald-650">Included (Free Transit)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PATHWAYS: UNIVERSITÄT VS FACHHOCHSCHULE */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Understand the Educational Pathways</h2>
            <p className="text-slate-500 text-sm font-bold">German public higher education is divided into research-oriented and practice-oriented paths.</p>
          </div>

          {/* Toggle buttons */}
          <div className="flex justify-center mb-8">
            <div className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-xs inline-flex gap-1">
              <button
                onClick={() => setActivePathway('uni')}
                className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${activePathway === 'uni' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-650 hover:bg-slate-50'}`}
              >
                Research Universities (Universität / TU)
              </button>
              <button
                onClick={() => setActivePathway('fh')}
                className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${activePathway === 'fh' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-650 hover:bg-slate-50'}`}
              >
                Applied Sciences (Fachhochschule / FH)
              </button>
            </div>
          </div>

          {/* Info Panels */}
          <AnimatePresence mode="wait">
            {activePathway === 'uni' ? (
              <motion.div 
                key="uni" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-xs max-w-4xl mx-auto"
              >
                <h3 className="text-lg font-black text-indigo-750 mb-3">Academic & Research Focused (Universität)</h3>
                <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed mb-6">
                  Universities are primarily theoretical and focus on pure sciences, fundamental research, and academic studies. They are the only institutions that can award PhDs. Ideal if you are targeting research labs, R&D divisions of large corporations, or planning on a career in academia.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Deep mathematical and theoretical foundations required for entry.</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Most masters programs start exclusively in the **Winter intake**.</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="fh" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white/60 border border-white rounded-[32px] p-6 md:p-8 shadow-xs max-w-4xl mx-auto"
              >
                <h3 className="text-lg font-black text-indigo-750 mb-3">Practice & Industry Integrated (Fachhochschule / FH)</h3>
                <p className="text-slate-600 text-xs md:text-sm font-semibold leading-relaxed mb-6">
                  Applied Sciences universities focus on practical applications of knowledge. They have mandatory internship semesters in German companies built directly into the curriculum. Classes are smaller, and professors usually come with years of direct industry experience rather than academic tracks.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>More flexible with CGPA matching, placing high value on practical internships.</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>Frequently offer admissions in both **Summer and Winter intakes**.</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. LIST OF PUBLIC UNIVERSITIES */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-8 text-center md:text-left">Top-Ranked German Public Universities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publicUnis.map((uni, idx) => (
              <div 
                key={idx}
                className="bg-white/60 border border-white rounded-[24px] p-6 shadow-xs flex items-center justify-between hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2.5 shadow-xs">
                    <img src={uni.logo} alt="" className="w-8 h-8 object-contain" onError={e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((typeof uni !== 'undefined' && uni && uni.name) ? uni.name : 'U')}&background=4F46E5&color=ffffff&bold=true&size=128`} />
                  </div>
                  <div>
                    <span className="text-[9px] text-indigo-650 font-black uppercase tracking-wider block">QS World Rank: #{uni.rank}</span>
                    <h4 className="font-black text-slate-950 text-xs md:text-sm leading-tight group-hover:text-indigo-650 transition-colors mt-0.5">{uni.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                      <MapPin size={10} />
                      {uni.city}, Germany · {uni.type}
                    </p>
                  </div>
                </div>
                
                <Link
                  to={`/contact?university=${encodeURIComponent(uni.name)}`}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-xs font-black whitespace-nowrap"
                >
                  Apply
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* 4. UNDERSTANDING NUMERUS CLAUSUS (NC) VS NC-FREE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-1.5">
              <AlertTriangle size={18} className="text-amber-500" />
              Numerus Clausus (NC) Restricted Programs
            </h3>
            <p className="text-slate-600 text-xs font-semibold leading-relaxed">
              Programs marked **NC** have a restricted number of seats. Admissions are highly grade-competitive, meaning the university filters candidates from highest GPA downwards until seats are filled. If your CGPA in India is below 8.0/10, your chances of getting into an NC program at top universities are low.
            </p>
          </div>

          <div className="bg-white/60 border border-white rounded-[28px] p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-1.5">
              <CheckCircle2 size={18} className="text-emerald-500" />
              NC-Free (Unrestricted) Programs
            </h3>
            <p className="text-slate-600 text-xs font-semibold leading-relaxed">
              Programs marked **NC-Free** have no strict grade cap. As long as you meet all standard prerequisites (exact ECTS credit match, language score cutoff, and pass any entrance test or interview), you are guaranteed an admission offer. These are excellent targets for students with moderate GPAs (7.0 - 8.0).
            </p>
          </div>
        </div>


      {/* CTA Section */}
      <StudyAbroadCTA country="Germany" />

      </div>
    </div>
  );
};

export default GermanyPublic;
