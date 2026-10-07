import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  DollarSign,
  Compass,
  Award,
  ChevronRight,
  FileEdit,
  CheckCircle2,
  HelpCircle,
  ListTodo,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const SATDetailPage = ({ pageKey }) => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const sidebarLinks = [
    { name: 'SAT Overview', path: '/exams/sat/overview', key: 'overview', icon: Compass },
    { name: 'SAT Syllabus', path: '/exams/sat/syllabus', key: 'syllabus', icon: BookOpen },
    { name: 'SAT Exam Fees', path: '/exams/sat/fees', key: 'fees', icon: DollarSign },
    { name: 'SAT Exam Dates', path: '/exams/sat/dates', key: 'dates', icon: Calendar },
    { name: 'SAT Registration', path: '/exams/sat/registration', key: 'registration', icon: FileEdit },
    { name: 'SAT Results & Scoring', path: '/exams/sat/results', key: 'results', icon: Award },
    { name: 'SAT Preparation', path: '/exams/sat/preparation', key: 'preparation', icon: ListTodo }
  ];

  const contentMap = {
    overview: {
      title: "SAT Exam Overview: Scoring & Adaptive Pattern",
      subtitle: "The SAT is a standardized test widely used for college admissions, primarily in the US and Canada.",
      content: (
        <div className="space-y-6 text-xs md:text-sm">
          <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl flex items-start gap-3">
            <Info className="text-indigo-650 w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider mb-1">Adaptive digital test format</h4>
              <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                The test adjusts the difficulty of the second module in both Reading & Writing and Math based on your score performance in the first module. Doing well in the first module is key to unlocking the higher scoring potential.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">What is the Digital SAT?</h3>
            <p className="text-slate-655 font-semibold leading-relaxed">
              Designed and administered by the College Board, the Digital SAT evaluates secondary school students' readiness for college-level coursework. It evaluates critical reading, writing, and mathematics skills.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Shorter Testing Window", desc: "The exam duration is now cut down to 2 Hours 14 Minutes, from the previous 3 hours." },
              { title: "Desmos Calculator allowed", desc: "Students can bring their own approved graphing calculators or use the built-in Desmos interface." },
              { title: "Direct Scoring Delivery", desc: "Score reports are returned to candidates in a matter of days on the College Board portal." },
              { title: "Valid for Admissions", desc: "Your scores are valid for up to 5 years after the examination date." }
            ].map((item, idx) => (
              <div key={idx} className="border border-slate-100 p-4.5 rounded-2xl bg-slate-50/30 hover:bg-slate-50 transition-colors">
                <h4 className="font-black text-slate-800 text-xs mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-indigo-500" />
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    syllabus: {
      title: "SAT Syllabus & Exam Pattern",
      subtitle: "Full overview of question types, timing constraints, and section contents on the Digital SAT.",
      content: (
        <div className="space-y-6 text-xs md:text-sm">
          <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-500">Section</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-500">Timing Limit</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-500">Structure / Questions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-black">Reading & Writing</td>
                  <td className="py-3.5 px-4">64 Minutes (2 Modules)</td>
                  <td className="py-3.5 px-4">54 Questions</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black">Mathematics</td>
                  <td className="py-3.5 px-4">70 Minutes (2 Modules)</td>
                  <td className="py-3.5 px-4">44 Questions</td>
                </tr>
                <tr className="bg-indigo-50/20 font-black">
                  <td className="py-3.5 px-4 text-indigo-700">Total Exam</td>
                  <td className="py-3.5 px-4 text-indigo-700">2 Hours 14 Minutes</td>
                  <td className="py-3.5 px-4 text-indigo-700">98 Questions</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900">Math Topics Breakdown</h3>
            <p className="text-slate-655 font-semibold">The math section measures mathematical fluency across four standard domains:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/30">
                <span className="font-black text-xs text-slate-800">Algebra (35%)</span>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Linear equations, systems of linear equations, inequalities.</p>
              </div>
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/30">
                <span className="font-black text-xs text-slate-800">Advanced Math (35%)</span>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Quadratic functions, polynomial factors, radical and exponential equations.</p>
              </div>
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/30">
                <span className="font-black text-xs text-slate-800">Problem Solving & Data Analysis (15%)</span>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Ratios, percentages, probability, unit conversions, statistics.</p>
              </div>
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/30">
                <span className="font-black text-xs text-slate-800">Geometry & Trigonometry (15%)</span>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Area, volume, trigonometry, circle coordinates, triangles.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    fees: {
      title: "SAT Registration Fees & Administrative Charges",
      subtitle: "International pricing schedule set by the College Board.",
      content: (
        <div className="space-y-6 text-xs md:text-sm">
          <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-500">Service Category</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-500">Cost (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-black">Base International Registration Fee</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">$103</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black">Regional Fee (India / South Asia)</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">$43</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black">Late Registration Fee</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">$30</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black">Test Center Change Fee</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">$25</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black">Cancellation Fee (Prior to Deadline)</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">$25</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black">Late Cancellation Fee (After Deadline)</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">$39</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-amber-50/50 border border-amber-100 text-[11px] font-bold text-amber-800 rounded-xl">
            * Refunds: Cancelling your registration after the regular refund deadline will only return standard remaining regional fees or secondary taxes, and administrative charges apply.
          </div>
        </div>
      )
    },
    dates: {
      title: "SAT Exam Dates: International Schedule",
      subtitle: "Official international test window guidelines.",
      content: (
        <div className="space-y-6 text-xs md:text-sm">
          <p className="text-slate-655 font-semibold leading-relaxed">
            The Digital SAT is held multiple times a year internationally. Registration typically deadlines 2-3 weeks prior to each scheduled test date.
          </p>

          <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-500">Test Month</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-500">Target Registration Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-black">March</td>
                  <td className="py-3.5 px-4">Early February</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black">May</td>
                  <td className="py-3.5 px-4">Late March / Early April</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black">June</td>
                  <td className="py-3.5 px-4">Early May</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black">August</td>
                  <td className="py-3.5 px-4">Late July</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black">October</td>
                  <td className="py-3.5 px-4">Early September</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black">November</td>
                  <td className="py-3.5 px-4">Early October</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black">December</td>
                  <td className="py-3.5 px-4">Early November</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 text-[11px] font-bold text-indigo-800 rounded-xl">
            **Center Selection Strategy:** Many popular test venues in metro cities (Delhi, Mumbai, Bangalore) fill up 1-2 months in advance. Book early to secure your location.
          </div>
        </div>
      )
    },
    registration: {
      title: "How to Register for the Digital SAT",
      subtitle: "Step-by-step registration roadmap.",
      content: (
        <div className="space-y-6 text-xs md:text-sm font-semibold text-slate-700">
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center font-black text-xs text-indigo-700 shrink-0">1</span>
              <div>
                <h4 className="font-black text-slate-800">Create a College Board Account</h4>
                <p className="text-slate-500 mt-1 leading-relaxed">Visit the official College Board website and register for a free account. Ensure your name matches your passport exactly.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center font-black text-xs text-indigo-700 shrink-0">2</span>
              <div>
                <h4 className="font-black text-slate-800">Enter Personal and Profile Info</h4>
                <p className="text-slate-500 mt-1 leading-relaxed">Fill out demographic details, school credentials, and extracurricular summaries.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center font-black text-xs text-indigo-700 shrink-0">3</span>
              <div>
                <h4 className="font-black text-slate-800">Select Date & Test Center</h4>
                <p className="text-slate-500 mt-1 leading-relaxed">Select a test date and search for local centers with open seating availability.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center font-black text-xs text-indigo-700 shrink-0">4</span>
              <div>
                <h4 className="font-black text-slate-800">Pay Fee & Upload Photo</h4>
                <p className="text-slate-500 mt-1 leading-relaxed">Upload a headshot meeting College Board criteria and complete payment via credit card or PayPal.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    results: {
      title: "SAT Scoring & Score Scales",
      subtitle: "How the adaptive Digital SAT is marked and reported.",
      content: (
        <div className="space-y-6 text-xs md:text-sm">
          <p className="text-slate-655 font-semibold leading-relaxed">
            The Digital SAT is scored on a total scale of **400 to 1600**, combining two section scores of 200–800.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-100 p-5 rounded-2xl bg-slate-50/30">
              <span className="font-black text-xs text-slate-800 block mb-1">Score Verification</span>
              <p className="text-slate-500 text-[11px] leading-relaxed">There is no negative marking. Correct responses gain points, and unanswered questions yield 0 points.</p>
            </div>
            <div className="border border-slate-100 p-5 rounded-2xl bg-slate-50/30">
              <span className="font-black text-xs text-slate-800 block mb-1">Score Reporting</span>
              <p className="text-slate-500 text-[11px] leading-relaxed">College Board sends scores to up to 4 selected universities for free if designated during registration.</p>
            </div>
          </div>
        </div>
      )
    },
    preparation: {
      title: "SAT Preparation: Preparation Strategies & Mock Practice",
      subtitle: "Actionable prep workflow to secure a high score.",
      content: (
        <div className="space-y-6 text-xs md:text-sm font-semibold text-slate-700">
          <div className="p-5 bg-indigo-50/40 border border-indigo-100 rounded-3xl space-y-3">
            <h4 className="font-black text-indigo-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-650" />
              <span>Official Bluebook Prep Steps</span>
            </h4>
            <p className="text-slate-655 text-xs leading-relaxed">
              Download the official College Board **Bluebook application** onto your test device. Take full-length adaptive practice tests 1–6 under simulated exam conditions to align with digitaladaptive modules.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900">Recommended Resources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-100 p-4.5 rounded-2xl bg-slate-50/30">
                <h4 className="font-black text-slate-800 text-xs mb-1">Khan Academy SAT Prep</h4>
                <p className="text-[11px] text-slate-550 leading-relaxed">Official study partner featuring diagnostics, specific skill exercises, and diagnostic modules.</p>
              </div>
              <div className="border border-slate-100 p-4.5 rounded-2xl bg-slate-50/30">
                <h4 className="font-black text-slate-800 text-xs mb-1">SAT Practice Tests</h4>
                <p className="text-[11px] text-slate-550 leading-relaxed">Review our SAT prep books list for highly structured diagnostic material.</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const activeContent = contentMap[pageKey] || contentMap.overview;

  const faqs = [
    { q: "Is SAT adaptive by section or by question?", a: "By section (multistage). Each of the two main sections (Reading & Writing, Math) contains two modules. Your performance on the first module determines the difficulty level of the second module." },
    { q: "Can I bring my own calculator to the SAT?", a: "Yes, you can bring an approved graphing or scientific calculator. However, the Bluebook testing app also includes a fully featured Desmos graphing calculator directly on the screen." },
    { q: "How long are SAT scores valid?", a: "SAT scores are valid for 5 years from the date of the exam." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/exams/sat" className="hover:text-indigo-655 transition-colors">SAT</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-bold">{sidebarLinks.find(l => l.key === pageKey)?.name || "Details"}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-2">
            <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-4 px-3">SAT Directory</span>
              <div className="space-y-1">
                {sidebarLinks.map((link, idx) => {
                  const IconComp = link.icon;
                  const isActive = pageKey === link.key;
                  return (
                    <button
                      key={idx}
                      onClick={() => navigate(link.path)}
                      className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center gap-3 transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-50 text-indigo-700 shadow-xs' 
                          : 'text-slate-655 hover:bg-slate-50'
                      }`}
                    >
                      <IconComp size={16} />
                      <span>{link.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 md:p-12 shadow-xs">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{activeContent.title}</h1>
              <p className="text-slate-500 text-xs md:text-sm font-semibold mt-2 mb-8 leading-relaxed">{activeContent.subtitle}</p>
              
              <div className="border-t border-slate-100 pt-8">
                {activeContent.content}
              </div>
            </div>

            {/* FAQs Accordion on details pages */}
            <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 md:p-12 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <HelpCircle className="text-indigo-600" size={18} />
                <span>Frequently Asked Questions</span>
              </h3>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4.5 text-left font-black text-xs text-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-50/50 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {openFaq[idx] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <AnimatePresence>
                      {openFaq[idx] && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="p-4.5 text-xs text-slate-500 font-semibold border-t border-slate-100 leading-relaxed bg-slate-50/20">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SATDetailPage;
