import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, BookOpen, Clock, CheckCircle2,
  ArrowRight, Award, MapPin, Sparkles, Briefcase, Coins,
  ShieldCheck, GraduationCap, Globe, CalendarDays, FileText,
  ChevronDown, ChevronUp, TrendingUp, Plane, Home, Utensils,
  Bus, Wifi, Heart, BadgeCheck, Users, DollarSign, Star,
  ClipboardList, Milestone, AlertCircle, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudyAbroadCTA from '../../../../../components/StudyAbroadCTA';

/* ─── DATA ─────────────────────────────────────────────────────────── */

const whyStudyPoints = [
  { icon: GraduationCap, title: 'World-Class Education', desc: 'University of Milan ranks #80 globally in Medicine (QS). Italy has 800+ years of medical heritage.', color: 'blue' },
  { icon: Coins, title: 'Affordable Tuition', desc: 'Public universities charge ₹1L – ₹5L/year. Compared to UK (₹9.6L+) or US, Italy is 80% cheaper.', color: 'emerald' },
  { icon: Globe, title: 'Global Recognition', desc: 'WHO, NMC, US & Europe recognized degrees. Graduates can write FMGE/NEXT and practice globally.', color: 'indigo' },
  { icon: Clock, title: 'Six-Year Program', desc: '5 years of academics + 1 year compulsory clinical internship. 360 ECTS fully integrated program.', color: 'violet' },
  { icon: Building2, title: 'Clinical Exposure', desc: 'Training in top hospitals and research centers. Early patient contact from Year 1 in many universities.', color: 'amber' },
  { icon: Plane, title: '12-Month Stay-Back', desc: 'Post-graduation work permit lets you explore career opportunities across the EU after completing your MD.', color: 'rose' },
];

const topUniversities = [
  { rank: 1, name: 'University of Milan', qsRank: '#80 (Medicine)', type: 'Public', feeEUR: 4000, location: 'Milan', program: 'International Medical School (IMS)', highlight: 'Top-Ranked in Italy', censis: '95.5/110', badge: 'bg-orange-50 text-[#C04A1D] border-orange-100' },
  { rank: 2, name: 'University of Bologna', qsRank: '#138', type: 'Public', feeEUR: 2000, location: 'Bologna', program: 'Medicine and Surgery (Laurea Magistrale CU)', highlight: 'Pioneer in Medical Education', censis: 'Founded 1088', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { rank: 3, name: 'Sapienza University of Rome', qsRank: '#128', type: 'Public', feeEUR: 1500, location: 'Rome', program: 'Medicine and Surgery', highlight: 'Most Affordable Top Option', censis: "Europe's Largest Univ.", badge: 'bg-violet-50 text-violet-700 border-violet-100' },
  { rank: 4, name: 'University of Padua', qsRank: '#233', type: 'Public', feeEUR: 4656, location: 'Padua', program: 'Medicine and Surgery (English-taught)', highlight: 'Early Clinical Exposure', censis: 'Founded 1222', badge: 'bg-amber-50 text-amber-700 border-amber-100' },
  { rank: 5, name: 'University of Turin', qsRank: '#408', type: 'Public', feeEUR: 2000, location: 'Turin', program: 'Medicine and Surgery (English-taught)', highlight: '30 Seats for Non-EU', censis: 'San Luigi Hospital', badge: 'bg-rose-50 text-rose-700 border-rose-100' },
];

const intakeTimeline = [
  { stage: 'Pre-enrollment (Non-EU)', timeline: 'April – June 2026', desc: 'Complete government pre-enrollment on Universitaly portal. Upload all documents.', icon: ClipboardList },
  { stage: 'IMAT Registration', timeline: 'July – August 2026', desc: 'Register online for the IMAT exam. Pay the exam fee and begin intensive preparation.', icon: FileText },
  { stage: 'IMAT Exam', timeline: 'September 2026', desc: 'Sit the 100-minute, 60-question international medical admissions test at a Pearson VUE centre.', icon: BookOpen },
  { stage: 'Admission Results', timeline: 'October 2026', desc: 'Results released on the Universitaly portal. Rank-based seat allocation begins for all eligible students.', icon: BadgeCheck },
  { stage: 'Academic Session Starts', timeline: 'October – November 2026', desc: 'Classes begin. International students enrol, collect permits of stay, and register at their faculty.', icon: GraduationCap },
];

const admissionRequirements = [
  { category: 'Academic', color: 'blue', items: ['Age: Minimum 17 years', 'High School Diploma (PCB + Mathematics)', 'GPA: 3.5+ on 4.0 scale', 'NEET: Minimum 50% marks'] },
  { category: 'Entrance Exam', color: 'indigo', items: ['IMAT mandatory for all public universities', 'Minimum score: 30/60+ (varies by university)', 'Sections: Scientific Knowledge & Reasoning', '100 minutes, 60 MCQ, Pearson VUE centres'] },
  { category: 'Language', color: 'violet', items: ['IELTS: 6.0+ (Academic module)', 'TOEFL: 80+ (iBT)', 'Basic Italian recommended for clinical practice', 'IMAT itself is conducted in English'] },
  { category: 'Documents', color: 'emerald', items: ['Valid Passport (18+ months validity)', 'Statement of Purpose (SOP)', '2+ Letters of Recommendation (LORs)', 'Medical fitness certificate + HIV test report'] },
];

const admissionSteps = [
  { step: 1, title: 'Check Eligibility', color: 'blue', items: ['17+ years old', 'PCB + Maths in 12th', 'NEET 50%+ qualifying score'] },
  { step: 2, title: 'Register for IMAT', color: 'indigo', items: ['Register online (July–August)', 'Pay IMAT exam fee (~€150)', 'Prepare for scientific reasoning test'] },
  { step: 3, title: 'Pre-Enrollment (Universitaly)', color: 'violet', items: ['Complete government pre-enrollment', 'Upload all documents (April–June)', 'Get validated summary from Italian consulate'] },
  { step: 4, title: 'Apply to Universities', color: 'emerald', items: ['Submit application through university portal', 'Upload transcripts, SOP, LORs', 'Pay application fee if applicable'] },
  { step: 5, title: 'Visa Application', color: 'amber', items: ['Receive admission letter from university', 'Show €6,947 minimum bank balance', 'Apply at VFS Global | Decision in 1–3 weeks'] },
];

const scholarships = [
  {
    name: 'Excellence Scholarships',
    university: 'University of Milan',
    amountEUR: '€6,000',
    amountINR: '₹5.6 Lakhs',
    extras: 'Full tuition + Accommodation covered',
    basis: 'Merit-based',
    icon: Star,
    color: 'blue',
  },
  {
    name: 'LazioDisco Scholarships',
    university: 'Sapienza University of Rome',
    amountEUR: '€1,780 – €7,081',
    amountINR: '₹1.6L – ₹6.6L',
    extras: 'Covers tuition, meals, accommodation',
    basis: 'Based on ISEE (income) level',
    icon: Award,
    color: 'violet',
  },
  {
    name: 'DIMED Scholarship',
    university: 'University of Padua',
    amountEUR: '€6,000',
    amountINR: '₹5.6 Lakhs',
    extras: 'Partial/full tuition waiver',
    basis: 'Merit + Need-based',
    icon: BadgeCheck,
    color: 'emerald',
  },
];

const costRows = [
  { university: 'University of Milan', annualINR: '₹5L', annualEUR: '€4,000', totalINR: '₹30L' },
  { university: 'University of Bologna', annualINR: '₹1.8L', annualEUR: '€2,000', totalINR: '₹10.8L' },
  { university: 'Sapienza Rome', annualINR: '₹1.4L', annualEUR: '€1,500', totalINR: '₹8.4L' },
  { university: 'University of Padua', annualINR: '₹4.2L', annualEUR: '€4,656', totalINR: '₹25.2L' },
  { university: 'University of Turin', annualINR: '₹1.8L', annualEUR: '€2,000', totalINR: '₹10.8L' },
];

const livingCosts = [
  { item: 'Accommodation', range: '₹25,000 – ₹35,000', icon: Home, color: 'blue' },
  { item: 'Food & Groceries', range: '₹10,000 – ₹15,000', icon: Utensils, color: 'emerald' },
  { item: 'Transportation', range: '₹5,000 – ₹10,000', icon: Bus, color: 'violet' },
  { item: 'Other Expenses', range: '₹5,000 – ₹10,000', icon: Wifi, color: 'amber' },
];

const visaChecklist = [
  'Valid passport (3+ months validity)',
  'Completed visa application form',
  'University acceptance letter',
  'Health insurance (€30,000+ coverage)',
  'Financial proof (€6,947 minimum)',
  '6 months bank statements (stamped)',
  '3 years ITR (applicant + sponsor)',
  'Accommodation proof (first 30 days)',
  'Flight reservation (round-trip or €2,000 buffer)',
  '2 passport photos (white background)',
  'HIV test report (medical fitness)',
  'Visa fee: ₹4,700 (€50)',
];

const careerPaths = [
  { role: 'Surgeon', salaryINR: '₹75L – ₹1.35Cr', salaryEUR: '€80K – €150K', icon: '🔪' },
  { role: 'Gynaecologist', salaryINR: '₹75L – ₹1.25Cr', salaryEUR: '€80K – €140K', icon: '👩‍⚕️' },
  { role: 'Anaesthesiologist', salaryINR: '₹70L – ₹1.2Cr', salaryEUR: '€75K – €130K', icon: '💉' },
  { role: 'Cardiologist', salaryINR: '₹65L – ₹1.1Cr', salaryEUR: '€70K – €120K', icon: '❤️' },
  { role: 'General Practitioner', salaryINR: '₹58L+', salaryEUR: '€65K+', icon: '🩺' },
  { role: 'Medical Researcher', salaryINR: '₹40L – ₹70L', salaryEUR: '€45K – €75K', icon: '🔬' },
];

const faqs = [
  { q: 'Is MBBS from Italy recognized in India?', a: 'Yes. Degrees from Italian state universities are fully compliant with NMC (National Medical Commission) guidelines. Indian graduates can write the FMGE/NEXT licensing exams to practice in India.' },
  { q: 'What is the IMAT exam and how do I prepare?', a: 'IMAT (International Medical Admissions Test) is a 100-minute, 60-question English-medium exam held at Pearson VUE centres worldwide. It covers Logical Reasoning, General Knowledge, Biology, Chemistry, and Physics/Maths. A score of 30/60+ is generally required for competitive universities.' },
  { q: 'How much does it cost to study MBBS in Italy in total?', a: 'The total 6-year program cost (tuition + living) ranges from ₹75 Lakhs to ₹90 Lakhs. Public university tuition alone is ₹1.4L – ₹5L/year, and monthly living costs are ₹45,000 – ₹70,000.' },
  { q: 'Do I need to know Italian to study MBBS in Italy?', a: 'English-taught programs exist at all top universities listed. However, basic Italian (A2-B1) is highly recommended for clinical rotations and daily patient interactions in hospitals.' },
  { q: 'Can I get a scholarship for MBBS in Italy?', a: 'Yes. Multiple scholarships are available: Excellence Scholarships at Milan (€6,000 + full tuition), LazioDisco at Sapienza Rome (€1,780–€7,081), and DIMED Scholarships at Padua (€6,000). Regional DSU scholarships can virtually make the degree free for qualified students.' },
  { q: 'What is the minimum NEET score required?', a: 'Indian students must have a valid NEET score with a minimum 50% marks (General category). The NEET score is mandatory for Indian students who wish to practice medicine in India after graduation.' },
  { q: 'Is there a post-study work visa for Italy?', a: 'Italy offers a 12-month post-graduation stay-back permit, which allows international students to look for employment opportunities. After 5+ years of legal residence, you can apply for permanent residency in Italy.' },
  { q: 'What documents are needed for the Italy student visa?', a: 'Key documents include: valid passport, university acceptance letter, health insurance (€30K+ coverage), bank statements showing €6,947 minimum, 6-month bank statements, 3-year ITR, accommodation proof, and 2 passport photos. Visa fee is ₹4,700 (€50) with 1–3 weeks processing time.' },
];

const colorMap = {
  blue: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-[#C04A1D]', icon: 'text-[#DE5C2B]', dot: 'bg-[#DE5C2B]' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-600', dot: 'bg-emerald-500' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', icon: 'text-indigo-600', dot: 'bg-indigo-500' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', icon: 'text-violet-600', dot: 'bg-violet-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-600', dot: 'bg-amber-500' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', icon: 'text-rose-600', dot: 'bg-rose-500' },
};

/* ─── COMPONENT ─────────────────────────────────────────────────────── */

const ItalyMBBSCourse = () => {
  const [currency, setCurrency] = useState('INR');
  const [openFaq, setOpenFaq] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const exchangeRate = 93.5;

  const fmt = (eur) => {
    if (currency === 'EUR') return `€${eur.toLocaleString()}`;
    return `₹${((eur * exchangeRate) / 100000).toFixed(1)}L`;
  };

  const SectionHeader = ({ icon: Icon, title, subtitle, iconColor = 'text-indigo-600' }) => (
    <div className="mb-8">
      <h2 className={`text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5`}>
        <Icon size={22} className={iconColor} />
        {title}
      </h2>
      {subtitle && <p className="text-slate-500 text-xs font-semibold mt-1.5 leading-relaxed">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafcff] relative overflow-hidden pt-28 pb-20 font-sans">
      {/* Ambient backgrounds */}
      <div className="absolute top-0 inset-x-0 h-[700px] bg-gradient-to-b from-blue-100/30 via-indigo-50/15 to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/10 to-blue-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] left-[-8%] w-[400px] h-[400px] bg-gradient-to-br from-emerald-100/10 to-blue-200/8 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 md:px-10 relative z-10 max-w-[1320px]">

        {/* ── BREADCRUMBS ── */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ArrowRight size={10} />
          <Link to="/study-abroad/italy" className="hover:text-indigo-600 transition-colors">Italy</Link>
          <ArrowRight size={10} />
          <span className="text-slate-600 font-black">MBBS in Italy</span>
        </div>

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles size={14} className="text-indigo-600" />
            <span>Complete Guide · 2026 Updated · 13 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            MBBS in{' '}
            <span className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] bg-clip-text text-transparent">Italy</span>
            {' '}2026
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed font-semibold max-w-3xl mx-auto">
            Complete Guide for International Students — Study a WHO & NMC approved 6-year English-taught MD at historic Italian universities with highly affordable state-subsidized fees.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-3xl mx-auto">
            {[
              { val: '6 Years', label: 'Program Duration' },
              { val: 'IMAT Exam', label: 'Entrance Metric' },
              { val: '₹1L – ₹5L/yr', label: 'Public Tuition' },
              { val: 'WHO / NMC', label: 'Approved By' },
            ].map((s, i) => (
              <div key={i} className="bg-white/70 border border-white/80 rounded-2xl p-5 shadow-sm backdrop-blur-md">
                <p className="text-xl font-black text-indigo-600">{s.val}</p>
                <p className="text-[10px] text-slate-500 font-extrabold mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── TOC CHIPS ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-16"
        >
          {['Why Italy?', 'Top Universities', 'Timeline', 'Requirements', 'Scholarships', 'Costs', 'Visa', 'Careers', 'FAQ'].map((label, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-black text-slate-600 uppercase tracking-wider shadow-sm hover:border-indigo-200 hover:text-indigo-700 transition-all cursor-pointer">
              {label}
            </span>
          ))}
        </motion.div>

        {/* ── WHY STUDY IN ITALY ── */}
        <section className="mb-16">
          <SectionHeader icon={Sparkles} title="Why Study MBBS in Italy? 2026 Advantages" subtitle="Italy combines world-class medical heritage, affordable public fees, and globally recognized degrees — a rare combination." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyStudyPoints.map((pt, i) => {
              const c = colorMap[pt.color];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className={`${c.bg} border ${c.border} rounded-[24px] p-6 flex flex-col gap-3 hover:shadow-md transition-shadow`}
                >
                  <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                    <pt.icon size={20} className={c.icon} />
                  </div>
                  <h3 className="font-black text-slate-900 text-sm">{pt.title}</h3>
                  <p className="text-slate-600 text-xs font-semibold leading-relaxed">{pt.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Key Highlights Table */}
          <div className="mt-8 bg-white/60 border border-white rounded-[28px] p-6 md:p-8 shadow-sm overflow-x-auto">
            <h3 className="font-black text-slate-900 text-sm mb-5 flex items-center gap-2"><Star size={16} className="text-amber-500" />Key Highlights at a Glance</h3>
            <table className="w-full text-xs font-semibold min-w-[540px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-[10px] uppercase tracking-wider text-slate-400 pb-3 font-extrabold">Metric</th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-slate-400 pb-3 font-extrabold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  ['Top Medical Universities', 'Milan, Bologna, Sapienza, Padua, Turin'],
                  ['Annual Tuition (Public)', '₹1L – ₹5L'],
                  ['Total Course Cost', '₹75L – ₹90L'],
                  ['Program Duration', '6 Years'],
                  ['Intake', 'August – September'],
                  ['Visa Fee', '₹4,700 (€50)'],
                  ['Visa Processing', '1 – 3 weeks'],
                  ['Monthly Living Cost', '₹70K – ₹1L'],
                  ['IMAT Score Required', '30/60+'],
                ].map(([k, v], i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 text-slate-700 font-bold">{k}</td>
                    <td className="py-3 text-right text-indigo-700 font-extrabold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── TOP 5 UNIVERSITIES ── */}
        <section className="mb-16">
          <SectionHeader icon={Building2} title="Top 5 Medical Universities in Italy (2026)" subtitle="All programs listed are English-medium, IMAT-based, and WHO/NMC recognized." iconColor="text-[#DE5C2B]" />

          {/* Currency Switcher */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Fee in:</span>
            {['INR', 'EUR'].map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                className={`px-4 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer border ${currency === c ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200'}`}
              >{c === 'INR' ? '₹ INR' : '€ EUR'}</button>
            ))}
          </div>

          <div className="space-y-4">
            {topUniversities.map((uni, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white/70 border border-white rounded-[24px] p-5 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5 group hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                    #{uni.rank}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate">{uni.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />{uni.location} · {uni.type} · QS {uni.qsRank}
                    </p>
                    <p className="text-xs text-slate-600 font-semibold mt-1">{uni.program}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full border ${uni.badge}`}>{uni.highlight}</span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Annual Fee</span>
                    <span className="text-sm font-black text-slate-900">{fmt(uni.feeEUR)}/yr</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* University Summary Table */}
          <div className="mt-6 bg-white/60 border border-white rounded-[28px] p-6 shadow-sm overflow-x-auto">
            <table className="w-full text-xs font-semibold min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {['University', 'QS Medicine', 'Annual Fee (INR)', 'Annual Fee (€)', 'English Program', 'IMAT'].map(h => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider text-slate-400 pb-3 font-extrabold pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  ['Univ. of Milan', '#80', '₹5L', '€4,000', '✅', '✅'],
                  ['Univ. of Bologna', '#138', '₹1.8L', '€2,000', '✅', '✅'],
                  ['Sapienza Rome', '#128', '₹1.4L', '€1,500', '✅', '✅'],
                  ['Univ. of Padua', '#233', '₹4.2L', '€4,656', '✅', '✅'],
                  ['Univ. of Turin', '#408', '₹1.8L', '€2,000', '✅', '✅'],
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    {row.map((cell, j) => (
                      <td key={j} className={`py-3 pr-4 ${j === 0 ? 'font-extrabold text-slate-900' : 'text-slate-600 font-bold'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── INTAKE TIMELINE ── */}
        <section className="mb-16">
          <SectionHeader icon={CalendarDays} title="Intakes & Timeline for MBBS in Italy (2026)" subtitle="Italy has ONE major annual intake in September. Private institutions may offer February/March intakes." iconColor="text-violet-600" />
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-violet-200 to-transparent hidden md:block" />
            <div className="space-y-4">
              {intakeTimeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex gap-4 md:gap-6 items-start"
                >
                  <div className="relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1 bg-white/70 border border-white rounded-[20px] p-4 md:p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                      <h3 className="font-black text-slate-900 text-sm">{item.stage}</h3>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">{item.timeline}</span>
                    </div>
                    <p className="text-slate-600 text-xs font-semibold leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { val: '310,000+', label: 'Medical Students in Italy' },
              { val: '22', label: 'English-Taught Medical Programs' },
              { val: '17', label: 'Public Medical Universities' },
              { val: '12,000+', label: 'Indian Students (10-yr growth)' },
            ].map((s, i) => (
              <div key={i} className="bg-white/60 border border-white rounded-[20px] p-5 text-center shadow-sm">
                <p className="text-2xl font-black text-indigo-600">{s.val}</p>
                <p className="text-[10px] text-slate-500 font-extrabold mt-1 uppercase tracking-wider leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ADMISSION REQUIREMENTS ── */}
        <section className="mb-16">
          <SectionHeader icon={ClipboardList} title="Admission Requirements" subtitle="What you need to qualify for MBBS admission at Italian universities as an international student." iconColor="text-emerald-600" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {admissionRequirements.map((req, i) => {
              const c = colorMap[req.color];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className={`${c.bg} border ${c.border} rounded-[24px] p-6`}
                >
                  <h3 className={`font-black text-sm mb-4 ${c.text}`}>{req.category} Requirements</h3>
                  <ul className="space-y-2.5">
                    {req.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                        <CheckCircle2 size={14} className={`${c.icon} shrink-0 mt-0.5`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Test Scores Table */}
          <div className="mt-6 bg-white/60 border border-white rounded-[28px] p-6 shadow-sm overflow-x-auto">
            <h4 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2"><Eye size={16} className="text-slate-400" />Minimum Test Score Requirements</h4>
            <table className="w-full text-xs font-semibold min-w-[420px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Test', 'Min. Score', 'Notes'].map(h => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider text-slate-400 pb-3 font-extrabold pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  ['IELTS', '6.0+', 'Academic module required'],
                  ['TOEFL', '80+', 'iBT format'],
                  ['IMAT', '30/60+', 'Varies by university cutoff'],
                  ['NEET', '50%', 'Mandatory for Indian students'],
                ].map(([test, score, note], i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-3 pr-6 font-extrabold text-slate-900">{test}</td>
                    <td className="py-3 pr-6 font-black text-indigo-600">{score}</td>
                    <td className="py-3 text-slate-600">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── ADMISSION PROCESS ── */}
        <section className="mb-16">
          <SectionHeader icon={Milestone} title="Admission Process (Step-by-Step)" subtitle="Follow this exact sequence to secure your MBBS seat in Italy for the 2026 intake." iconColor="text-[#DE5C2B]" />

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
            {/* Step tabs */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {admissionSteps.map(s => {
                const c = colorMap[s.color];
                const isActive = activeStep === s.step;
                return (
                  <button
                    key={s.step}
                    onClick={() => setActiveStep(s.step)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left whitespace-nowrap lg:whitespace-normal cursor-pointer border ${isActive ? `${c.bg} ${c.border} ${c.text} font-black` : 'bg-white border-white text-slate-500 font-semibold hover:bg-slate-50'}`}
                  >
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {s.step}
                    </span>
                    <span className="text-xs uppercase tracking-wider">{s.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Step detail */}
            <AnimatePresence mode="wait">
              {admissionSteps.filter(s => s.step === activeStep).map(s => {
                const c = colorMap[s.color];
                return (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white/70 border border-white rounded-[28px] p-6 md:p-8 shadow-sm"
                  >
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${c.bg} border ${c.border} ${c.text} text-[10px] font-black uppercase tracking-wider mb-4`}>
                      Step {s.step} of {admissionSteps.length}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-5">{s.title}</h3>
                    <ul className="space-y-3">
                      {s.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                          <CheckCircle2 size={16} className={`${c.icon} shrink-0 mt-0.5`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
                      <span className="text-[10px] text-slate-400 font-bold">Complete all steps in order</span>
                      <div className="flex gap-2">
                        <button onClick={() => setActiveStep(p => Math.max(1, p - 1))} disabled={activeStep === 1} className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-black text-slate-600 disabled:opacity-30 cursor-pointer hover:border-slate-300">Prev</button>
                        <button onClick={() => setActiveStep(p => Math.min(admissionSteps.length, p + 1))} disabled={activeStep === admissionSteps.length} className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-black disabled:opacity-30 cursor-pointer hover:bg-indigo-700">Next</button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Documents Required */}
          <div className="mt-6 bg-white/60 border border-white rounded-[28px] p-6 md:p-8 shadow-sm">
            <h4 className="font-black text-slate-900 text-sm mb-5 flex items-center gap-2"><FileText size={16} className="text-slate-400" />Required Documents for Application</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                ['Birth Certificate', 'Legalized and translated'],
                ['10th & 12th Mark Sheets', 'Attested by HED + MEA apostille'],
                ['NEET Scorecard', 'Minimum 50% qualifying score'],
                ['IMAT Scorecard', '30/60+ depending on university'],
                ['IELTS/TOEFL Scores', 'IELTS 6.0+ / TOEFL 80+'],
                ['HIV Test Report', 'Medical fitness certificate'],
                ['Bank Statements', 'Proof of funds (6 months)'],
                ['Passport', '18+ months validity required'],
                ['SOP', 'Statement of Purpose'],
                ['LORs', '2+ letters of recommendation'],
                ['Health Insurance', '€30,000+ coverage'],
                ['Passport Photos', '2 recent, white background'],
              ].map(([doc, detail], i) => (
                <div key={i} className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">{doc}</span>
                    <span className="text-[11px] text-slate-500 font-semibold">{detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCHOLARSHIPS ── */}
        <section className="mb-16">
          <SectionHeader icon={Award} title="Top 3 Scholarships for MBBS in Italy" subtitle="Significant financial aid is available — qualifying students can study MBBS at near-zero cost through DSU regional scholarships." iconColor="text-amber-500" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {scholarships.map((sc, i) => {
              const c = colorMap[sc.color];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`${c.bg} border ${c.border} rounded-[28px] p-6 md:p-7 flex flex-col gap-4`}
                >
                  <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                    <sc.icon size={20} className={c.icon} />
                  </div>
                  <div>
                    <h3 className={`font-black text-base ${c.text}`}>{sc.name}</h3>
                    <p className="text-slate-600 text-xs font-bold mt-0.5">{sc.university}</p>
                  </div>
                  <div className="bg-white/70 border border-white rounded-xl p-4 space-y-1">
                    <p className="text-xl font-black text-slate-900">{sc.amountEUR}</p>
                    <p className="text-xs font-bold text-slate-500">≈ {sc.amountINR}</p>
                    <p className="text-[11px] text-slate-600 font-semibold">{sc.extras}</p>
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${c.bg} border ${c.border} ${c.text} self-start`}>
                    {sc.basis}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Scholarship table */}
          <div className="mt-6 bg-white/60 border border-white rounded-[28px] p-6 shadow-sm overflow-x-auto">
            <table className="w-full text-xs font-semibold min-w-[560px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Scholarship', 'University', 'Award (€)', 'Award (INR)', 'Basis'].map(h => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider text-slate-400 pb-3 font-extrabold pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  ['Excellence Scholarships', 'Milan', '€6,000', '₹5.6L', 'Merit'],
                  ['LazioDisco', 'Sapienza Rome', '€1,780–€7,081', '₹1.6L–₹6.6L', 'ISEE-based'],
                  ['DIMED', 'Padua', '€6,000', '₹5.6L', 'Merit + Need'],
                ].map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    {r.map((cell, j) => (
                      <td key={j} className={`py-3 pr-4 ${j === 0 ? 'font-extrabold text-slate-900' : 'text-slate-600 font-bold'}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── COST OF STUDYING ── */}
        <section className="mb-16">
          <SectionHeader icon={Coins} title="Cost of Studying MBBS in Italy" subtitle="Italy offers some of Europe's most affordable medical education. Here's a complete cost breakdown." iconColor="text-emerald-600" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tuition */}
            <div className="bg-white/60 border border-white rounded-[28px] p-6 md:p-8 shadow-sm">
              <h3 className="font-black text-slate-900 text-sm mb-5 flex items-center gap-2">
                <GraduationCap size={16} className="text-indigo-600" />Tuition Fees (Annual)
              </h3>
              <div className="space-y-3">
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs">Public Universities</span>
                  <span className="font-black text-indigo-700 text-sm">{fmt(900)} – {fmt(5000)} / year</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs">Private Universities</span>
                  <span className="font-black text-slate-700 text-sm">{fmt(5000)} – {fmt(20000)} / year</span>
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs font-semibold min-w-[380px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['University', 'Annual Fee', '6-Year Total'].map(h => (
                        <th key={h} className="text-left text-[10px] uppercase tracking-wider text-slate-400 pb-3 font-extrabold pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {costRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-2 pr-4 font-bold text-slate-700">{r.university}</td>
                        <td className="py-2 pr-4 font-extrabold text-indigo-600">{currency === 'INR' ? r.annualINR : r.annualEUR}</td>
                        <td className="py-2 font-black text-slate-900">{r.totalINR}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Living Costs */}
            <div className="bg-white/60 border border-white rounded-[28px] p-6 md:p-8 shadow-sm">
              <h3 className="font-black text-slate-900 text-sm mb-5 flex items-center gap-2">
                <Home size={16} className="text-[#DE5C2B]" />Living Expenses (Monthly)
              </h3>
              <div className="space-y-3 mb-5">
                {livingCosts.map((lc, i) => {
                  const c = colorMap[lc.color];
                  return (
                    <div key={i} className={`${c.bg} border ${c.border} rounded-2xl p-4 flex items-center justify-between`}>
                      <div className="flex items-center gap-2.5">
                        <lc.icon size={16} className={c.icon} />
                        <span className="font-extrabold text-slate-900 text-xs">{lc.item}</span>
                      </div>
                      <span className={`font-black text-xs ${c.text}`}>{lc.range}</span>
                    </div>
                  );
                })}
              </div>
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-4 flex items-center justify-between text-white">
                <span className="font-black text-sm">Total Monthly</span>
                <span className="font-black text-lg">₹45,000 – ₹70,000</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-3 leading-relaxed">
                💡 City variation: Milan/Rome more expensive; Turin/Padua more affordable for students.
              </p>
            </div>
          </div>

          {/* Total Cost Banner */}
          <div className="mt-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 text-white rounded-[28px] p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute right-[-5%] top-[-20%] w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2">
                <h3 className="text-xl md:text-2xl font-black mb-2">Total 6-Year Program Cost</h3>
                <p className="text-white/80 text-sm font-semibold leading-relaxed">
                  Including tuition + living expenses for the full 6-year MD program in Italy.
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-black">₹75L – ₹90L</p>
                <p className="text-white/70 text-xs font-bold mt-1 uppercase tracking-wider">Public University · Full Program</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── VISA REQUIREMENTS ── */}
        <section className="mb-16">
          <SectionHeader icon={ShieldCheck} title="Visa Requirements for MBBS in Italy" subtitle="Student Visa (Type D National Visa) requirements for Indian and international MBBS students." iconColor="text-violet-600" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            {/* Checklist */}
            <div className="bg-white/60 border border-white rounded-[28px] p-6 md:p-8 shadow-sm">
              <h3 className="font-black text-slate-900 text-sm mb-5 flex items-center gap-2"><ClipboardList size={16} className="text-slate-400" />Visa Checklist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visaChecklist.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Visa Details Cards */}
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-[24px] p-5">
                <h4 className="font-black text-indigo-900 text-xs uppercase tracking-wider mb-3">Financial Requirements</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-700 font-bold">Minimum Bank Balance</span>
                    <span className="text-xs font-black text-indigo-700">€6,947 / year</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-700 font-bold">Bank Statements</span>
                    <span className="text-xs font-black text-indigo-700">6 months</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-700 font-bold">ITR Required</span>
                    <span className="text-xs font-black text-indigo-700">3 years</span>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-[24px] p-5">
                <h4 className="font-black text-emerald-900 text-xs uppercase tracking-wider mb-3">Visa Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-700 font-bold">Visa Type</span>
                    <span className="text-xs font-black text-emerald-700">National Visa (Type D)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-700 font-bold">Visa Fee</span>
                    <span className="text-xs font-black text-emerald-700">₹4,700 (€50)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-700 font-bold">Processing Time</span>
                    <span className="text-xs font-black text-emerald-700">1 – 3 weeks</span>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-[24px] p-5">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                    Apply for your visa immediately after receiving the university acceptance letter. Do not wait — Italian embassies have limited slots during peak season.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── JOBS & SALARIES ── */}
        <section className="mb-16">
          <SectionHeader icon={Briefcase} title="Jobs & Salaries After MBBS in Italy" subtitle="Italian MBBS graduates are in high demand across Europe, the Middle East, and India. Here's what you can earn." iconColor="text-[#DE5C2B]" />

          {/* Average salary highlight */}
          <div className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white rounded-[28px] p-6 md:p-8 shadow-xl mb-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-[250px] h-full bg-white/5 rounded-full blur-3xl" />
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <p className="text-white/70 text-xs font-extrabold uppercase tracking-wider mb-1">Average Doctor Salary in Italy</p>
                <h3 className="text-3xl md:text-4xl font-black">₹1.2 Crore</h3>
                <p className="text-white/80 text-sm font-semibold mt-1">€130,983 per annum (average across specializations)</p>
              </div>
              <div className="shrink-0">
                <TrendingUp size={60} className="text-white/20" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {careerPaths.map((cp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-white/70 border border-white rounded-[20px] p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-3">{cp.icon}</div>
                <h3 className="font-black text-slate-900 text-sm mb-2">{cp.role}</h3>
                <p className="text-base font-black text-indigo-600">{cp.salaryINR}</p>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">{cp.salaryEUR}</p>
              </motion.div>
            ))}
          </div>

          {/* Post-study pathways */}
          <div className="bg-white/60 border border-white rounded-[28px] p-6 md:p-8 shadow-sm">
            <h3 className="font-black text-slate-900 text-sm mb-5 flex items-center gap-2"><Globe size={16} className="text-slate-400" />Post-MBBS Work Pathways</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Work in Italy', color: 'blue', steps: ['Apply for temporary work visa', 'Complete residency program (3–5 yrs)', 'Apply for permanent residency (after 5+ yrs)'] },
                { title: 'Practice in India', color: 'emerald', steps: ['Write FMGE/NEXT licensing exam', 'Register with NMC of India', 'Join hospital or start clinic'] },
                { title: 'Explore Global Options', color: 'violet', steps: ['UK: PLAB exam + GMC registration', 'USA: USMLE steps 1, 2, 3', 'Middle East: Direct hire for specialist roles'] },
              ].map((path, i) => {
                const c = colorMap[path.color];
                return (
                  <div key={i} className={`${c.bg} border ${c.border} rounded-[20px] p-5`}>
                    <h4 className={`font-black text-sm mb-3 ${c.text}`}>Option {i + 1}: {path.title}</h4>
                    <ul className="space-y-2">
                      {path.steps.map((s, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 size={13} className={`${c.icon} shrink-0 mt-0.5`} />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── DSU FREE STUDY BANNER ── */}
        <div className="bg-gradient-to-r from-orange-500 to-[#DE5C2B] text-white rounded-[32px] p-8 md:p-12 shadow-xl mb-16 relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-20%] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-[10px] font-black uppercase tracking-wider mb-4">
                <Sparkles size={12} /> DSU Scholarship Program
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-3">Study MBBS in Italy For Free</h2>
              <p className="text-white/80 text-sm font-semibold leading-relaxed max-w-xl">
                Despite being a premium 6-year clinical program, MBBS tuition at Italian public universities is fully coverable by regional DSU scholarships, making medicine virtually free for qualified international students.
              </p>
            </div>
            <div className="text-center">
              <Link
                to="/study-abroad/italy/free"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-indigo-700 hover:bg-slate-50 transition-all font-black text-xs rounded-xl shadow-md uppercase tracking-wider shrink-0 cursor-pointer"
              >
                Study for Free Guide
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <section className="mb-16">
          <SectionHeader icon={BookOpen} title="Frequently Asked Questions" subtitle="Everything you need to know about MBBS in Italy — answered for 2026." iconColor="text-indigo-600" />
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="bg-white/70 border border-white rounded-[20px] overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="font-black text-slate-900 text-sm leading-snug">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-indigo-600 shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400 shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-slate-600 text-xs font-semibold leading-relaxed border-t border-slate-100 pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <StudyAbroadCTA country="Italy" />

      </div>
    </div>
  );
};

export default ItalyMBBSCourse;
