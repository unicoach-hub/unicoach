import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  DollarSign,
  GraduationCap,
  Clock,
  MapPin,
  FileText,
  Compass,
  ArrowRight,
  Award,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  FileEdit,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  BookMarked,
  ListTodo,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';

const TOEFLDetailPage = ({ pageKey }) => {
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const sidebarLinks = [
    { name: 'TOEFL Overview', path: '/exams/toefl/overview', key: 'overview', icon: Compass },
    { name: 'TOEFL Syllabus', path: '/exams/toefl/syllabus', key: 'syllabus', icon: BookOpen },
    { name: 'TOEFL Exam Fees', path: '/exams/toefl/fees', key: 'fees', icon: DollarSign },
    { name: 'TOEFL Exam Dates', path: '/exams/toefl/dates', key: 'dates', icon: Calendar },
    { name: 'TOEFL Registration', path: '/exams/toefl/registration', key: 'registration', icon: FileEdit },
    { name: 'TOEFL Results', path: '/exams/toefl/results', key: 'results', icon: Award },
    { name: 'TOEFL Preparation', path: '/exams/toefl/preparation', key: 'preparation', icon: ListTodo }
  ];

  // Rich contents dictionary for TOEFL tabs
  const contentMap = {
    overview: {
      title: "TOEFL Exam for Indian Students in 2025: A Complete Guide",
      subtitle: "The Test of English as a Foreign Language (TOEFL) is a highly standardized English proficiency test accepted worldwide.",
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 border border-blue-150 p-5 rounded-2xl flex items-start gap-3.5">
            <Info className="text-[#DE5C2B] w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider mb-1">TOEFL iBT Shorter Duration Update</h4>
              <p className="text-xs text-blue-900 leading-relaxed font-semibold">
                ETS has shortened the TOEFL iBT test duration to exactly 2 hours (previously 3 hours). The writing section features a new "Writing for an Academic Discussion" task, which has replaced the old independent writing task. In addition, all unscored test questions have been removed.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block" />
              1. What is the TOEFL Exam?
            </h3>
            <p className="text-slate-650 font-semibold text-xs leading-relaxed">
              The TOEFL is designed to evaluate the English language proficiency of non-native speakers who wish to study, work, or migrate to English-speaking environments.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 my-6">
              {[
                { title: "Duration", desc: "Exactly 2 hours (Shorter Edition) with no scheduled breaks." },
                { title: "Tested Skills", desc: "Evaluates academic communication across Reading, Listening, Speaking, and Writing." },
                { title: "Modes of Delivery", desc: "Available as TOEFL iBT (at center/home) and TOEFL Essentials." },
                { title: "Wide Acceptance", desc: "Accepted by over 12,500 institutions in 160+ countries globally." }
              ].map((item, idx) => (
                <div key={idx} className="border border-slate-100 p-4.5 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <h4 className="font-black text-slate-800 text-xs mb-1 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-indigo-500" />
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block" />
              Why Take the TOEFL Exam?
            </h3>
            <div className="space-y-3">
              {[
                { title: "100% US University Acceptance", desc: "TOEFL is universally accepted and preferred by major academic programs across the United States." },
                { title: "UK & Canada Visa Pathways", desc: "Approved for all UK visas and preferred for Canadian Student Direct Stream (SDS) permits." },
                { title: "Fair and Unbiased Scoring", desc: "Uses centralized scoring systems combining AI and human proctoring for objective grading." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 p-4 rounded-xl border border-slate-100/50 bg-indigo-50/10">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-black">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs mb-0.5">{item.title}</h5>
                    <p className="text-[11px] text-slate-500 font-semibold leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block" />
              2. TOEFL iBT vs TOEFL Essentials
            </h3>
            <p className="text-slate-650 font-semibold text-xs leading-relaxed">
              ETS offers two main versions of the test. Explore the variations below to select the right match:
            </p>
            <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-[11px] text-slate-500 font-semibold leading-relaxed space-y-2">
              <p>• <strong>TOEFL iBT:</strong> Academic-heavy focus, 2 hours limit, scored on a 0-120 scale. Accepted by all prestigious graduate and undergraduate schools.</p>
              <p>• <strong>TOEFL Essentials:</strong> Multi-stage adaptive test, 1.5 hours duration, scored on a 1-12 band scale. Tests everyday conversational language.</p>
            </div>
          </div>
        </div>
      )
    },
    syllabus: {
      title: "TOEFL Exam Syllabus and Pattern 2025: Section-wise Layout",
      subtitle: "The streamlined TOEFL iBT format assesses 4 main areas. Learn durations, questions, and formatting rules.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-650 font-semibold text-xs leading-relaxed">
            The exam takes approximately 2 hours to complete and has no scheduled breaks. All sections use authentic academic material.
          </p>

          <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-6 shadow-sm">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-150">
                <tr>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Section</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Duration</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Questions / Tasks</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Format Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Reading</td>
                  <td className="py-3.5 px-4">35 Minutes</td>
                  <td className="py-3.5 px-4">20 Questions</td>
                  <td className="py-3.5 px-4 text-slate-500">2 academic passages, 10 multiple-choice questions each.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Listening</td>
                  <td className="py-3.5 px-4">36 Minutes</td>
                  <td className="py-3.5 px-4">28 Questions</td>
                  <td className="py-3.5 px-4 text-slate-500">3 lectures and 2 conversations. Audio clips play once.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Speaking</td>
                  <td className="py-3.5 px-4">16 Minutes</td>
                  <td className="py-3.5 px-4">4 Tasks</td>
                  <td className="py-3.5 px-4 text-slate-500">1 independent (opinion) and 3 integrated tasks. spoken responses.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Writing</td>
                  <td className="py-3.5 px-4">29 Minutes</td>
                  <td className="py-3.5 px-4">2 Tasks</td>
                  <td className="py-3.5 px-4 text-slate-500">1 Integrated task & 1 Writing for Academic Discussion task.</td>
                </tr>
                <tr className="bg-indigo-50/20 font-bold">
                  <td className="py-3.5 px-4 text-slate-800">Total Exam</td>
                  <td className="py-3.5 px-4 text-indigo-700">~2 Hours</td>
                  <td className="py-3.5 px-4">54 items / 6 tasks</td>
                  <td className="py-3.5 px-4">Scale: 0 - 120 (30 points per section)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-5 pt-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block" />
              Syllabus Section-wise Breakdown
            </h3>

            {/* Reading */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
              <h4 className="font-extrabold text-xs text-indigo-700 uppercase tracking-wide">1. Reading Comprehension</h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Evaluates ability to comprehend university-level textbooks and articles. Focuses on:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-slate-500">
                {["Vocabulary Context", "Factual Information", "Inference & Rhetoric", "Negative Factual Info", "Sentence Simplification", "Insert a Sentence"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border border-slate-100 p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Listening */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
              <h4 className="font-extrabold text-xs text-indigo-700 uppercase tracking-wide">2. Listening Comprehension</h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Evaluates comprehension of academic dialogues, lectures, and classroom discussions. Focuses on:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-slate-500">
                {["Detail Retrieval", "Understanding Speaker Purpose", "Speaker Attitude", "Connecting Content", "Making Inferences", "Note-taking logic"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border border-slate-100 p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Speaking */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
              <h4 className="font-extrabold text-xs text-indigo-700 uppercase tracking-wide">3. Speaking Section</h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Evaluates ability to speak clearly and logically in response to reading and listening texts. Focuses on:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-slate-500">
                {["Personal Choice Opinion", "Campus Announcement response", "Academic lecture summary", "Concept synthesis", "Pronunciation clarity", "Delivery flow"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border border-slate-100 p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Writing */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
              <h4 className="font-extrabold text-xs text-indigo-700 uppercase tracking-wide">4. Writing Section</h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Evaluates ability to write clean, grammatical essays in academic settings. Focuses on:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-slate-500">
                {["Integrated essay structure", "Academic discussion post", "Grammatical accuracy", "Sentence diversity", "Cohesion & flow", "Development of ideas"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border border-slate-100 p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    fees: {
      title: "TOEFL Exam Fees 2025 in India: Registration & Rescheduling Charges",
      subtitle: "Understand registration prices, rescheduling fees, and cancellation refunds in India.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-650 font-semibold text-xs leading-relaxed">
            In India, all registration payments must be cleared before your appointment. Check below for services list:
          </p>

          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-800">1. Base Registration & Additional Fees</h4>
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-150">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Service</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Fees in India (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-805">TOEFL iBT Registration Fee</td>
                    <td className="py-3 px-4 text-indigo-650 font-bold">₹16,900</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-805">Late Registration Fee</td>
                    <td className="py-3 px-4">₹3,900</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-805">Rescheduling Fee</td>
                    <td className="py-3 px-4">₹5,900</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-805">Score Review Fee (Speaking or Writing)</td>
                    <td className="py-3 px-4">₹7,900</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-805">Additional Score Report (per university)</td>
                    <td className="py-3 px-4">₹1,950</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 font-bold italic mt-1">* Note: All fees include local goods & services tax (GST) where applicable.</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-800">2. Cancellation & Rescheduling Timelines</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Rescheduling or cancellation request deadlines are calculated strictly based on calendar buffers prior to the slot time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reschedule */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <h5 className="font-black text-xs text-indigo-755 mb-3 uppercase tracking-wider">Rescheduling Rules</h5>
                <ul className="space-y-2.5 text-[11px] font-bold text-slate-650 leading-relaxed">
                  <li>• Must reschedule at least <strong>4 full days</strong> before your scheduled appointment.</li>
                  <li>• Rescheduling fee of <strong>₹5,900</strong> applies.</li>
                  <li>• Can be requested online through your ETS TOEFL profile.</li>
                </ul>
              </div>

              {/* Cancellation */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <h5 className="font-black text-xs text-rose-755 mb-3 uppercase tracking-wider">Cancellation Refunds</h5>
                <ul className="space-y-2.5 text-[11px] font-bold text-slate-655 leading-relaxed">
                  <li>• Must request cancellation at least <strong>4 full days</strong> in advance.</li>
                  <li>• Receives a **50% refund** of the original base fee.</li>
                  <li>• Balance is credited back to the payment mode used during signup.</li>
                </ul>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4.5 rounded-2xl text-[11px] text-amber-900 font-semibold leading-relaxed flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> If you fail to reschedule or cancel at least 4 full days prior to the test, your entire registration fee is forfeited, and rescheduling will not be permitted.
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
            <h4 className="text-sm font-black text-slate-800">3. Supported Payment Modes</h4>
            <p>You can complete payments through credit card, debit card, or PayPal. Accepted formats in India:</p>
            <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-100 space-y-2 text-[11px]">
              <p>• Accepted card brands: <strong>VISA, Mastercard, American Express, and Discover</strong>.</p>
              <p>• Make sure international transactions are enabled on your card before making the payment.</p>
            </div>
          </div>
        </div>
      )
    },
    dates: {
      title: "TOEFL Exam Dates and Test Centres: Slot Booking in 2025",
      subtitle: "TOEFL slot calendars are available throughout the year. Select your date based on admissions timelines.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            The TOEFL iBT is held over 60 times a year at secure test centers. The TOEFL iBT Home Edition is available 24 hours a day, 4 days a week.
          </p>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block" />
              TOEFL Test Centre Cities in India
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              ETS maintains physical test centers across 39 cities in India, giving you plenty of locations to choose from:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {[
                { name: "New Delhi", region: "North" },
                { name: "Mumbai", region: "West" },
                { name: "Bangalore", region: "South" },
                { name: "Chennai", region: "South" },
                { name: "Hyderabad", region: "South" },
                { name: "Kolkata", region: "East" },
                { name: "Ahmedabad", region: "West" },
                { name: "Pune", region: "West" },
                { name: "Chandigarh", region: "North" },
                { name: "Ludhiana", region: "North" }
              ].map((city, idx) => (
                <div key={idx} className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 flex flex-col justify-between hover:border-indigo-200 transition-colors">
                  <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                    <MapPin size={12} className="text-indigo-500" />
                    {city.name}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1.5 block">{city.region} Zone</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50/50 p-4.5 rounded-2xl border border-indigo-150 text-[11px] text-indigo-950 font-semibold leading-relaxed">
            💡 <strong>Timelines Tip:</strong> Book your slot <strong>3 to 4 months</strong> in advance of your first university deadline. Scores are valid for 2 years, so write it early to secure your score reports.
          </div>
        </div>
      )
    },
    registration: {
      title: "TOEFL Registration 2025: Step-by-Step Guide",
      subtitle: "Learn how to sign up on the ETS portal, choose test modes, and register for accommodations.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            You can register for the TOEFL iBT up to 7 days before your target test date. Late registrations (within 7 to 4 days) incur extra fees.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-850">Step-by-Step Registration Process</h4>
            <div className="space-y-2 text-[11px] font-bold text-slate-500">
              {[
                "1. Visit the official ETS TOEFL website and create a user account.",
                "2. Set up your profile. Ensure your name matches your valid passport spelling exactly.",
                "3. Select either the Test Center mode or the TOEFL iBT Home Edition.",
                "4. Enter your city and search for available test dates in the calendar.",
                "5. Choose your preferred testing center facility and time slot.",
                "6. Select up to 4 universities to receive your score reports for free.",
                "7. Apply for disability accommodations (must submit requests at least 6 weeks in advance).",
                "8. Review your registration details and accept test rules.",
                "9. Complete the payment of ₹16,900 online.",
                "10. Save the registration confirmation email and review test day guidelines."
              ].map((step, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-850">Mandatory Identification Document</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Indian test takers have specific identification rules that must be followed on test day:
            </p>
            <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-[11px] text-slate-500 font-semibold leading-relaxed flex items-start gap-3">
              <ShieldCheck className="text-indigo-600 w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Passport Required:</strong> A valid physical **Passport** is the ONLY acceptable primary ID for Indian citizens. Photocopies, digital IDs, or other government documents like Aadhaar or PAN card will not be accepted.
              </span>
            </div>
          </div>
        </div>
      )
    },
    results: {
      title: "TOEFL Exam Results: Scores, Scale, and Validity",
      subtitle: "Understand how your scores are calculated, scaled, and sent to target universities.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            TOEFL iBT scores are calculated and scaled within a few days of the exam. Here are the core details:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Score Validity</span>
              <span className="text-lg font-black text-slate-850">2 Years</span>
            </div>
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Total Score Scale</span>
              <span className="text-lg font-black text-indigo-600">0 - 120</span>
            </div>
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Online Delivery</span>
              <span className="text-lg font-black text-slate-850">4 - 8 Days</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-800">1. Section-wise Scoring Scales</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Each of the 4 sections is graded on a scale of 0 to 30. Your total score is the sum of these 4 scores.
            </p>
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-sm my-3">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-150">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">TOEFL Section</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Score Range</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Typical Good Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4 font-bold">Reading</td>
                    <td className="py-3 px-4">0 to 30</td>
                    <td className="py-3 px-4 text-emerald-650">24+ (Advanced)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Listening</td>
                    <td className="py-3 px-4">0 to 30</td>
                    <td className="py-3 px-4 text-emerald-650">22+ (Advanced)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Speaking</td>
                    <td className="py-3 px-4">0 to 30</td>
                    <td className="py-3 px-4 text-emerald-650">25+ (Advanced)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Writing</td>
                    <td className="py-3 px-4">0 to 30</td>
                    <td className="py-3 px-4 text-emerald-650">24+ (Advanced)</td>
                  </tr>
                  <tr className="bg-indigo-50/20 font-bold">
                    <td className="py-3 px-4 text-slate-805">Total Score</td>
                    <td className="py-3 px-4 text-indigo-700">0 to 120</td>
                    <td className="py-3 px-4 text-indigo-700">95+ (Highly Competitive)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-800">2. TOEFL MyBest™ Scores</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              If you take the TOEFL test more than once, ETS automatically creates a "MyBest Score" sheet for you:
            </p>
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-150/60 text-[11px] text-slate-600 font-semibold leading-relaxed space-y-2">
              <p>• Combines the highest section scores from all tests taken within the last 2 years.</p>
              <p>• Helps you highlight your absolute best academic performance to admissions officers.</p>
              <p>• Accepted by a growing number of universities worldwide.</p>
            </div>
          </div>
        </div>
      )
    },
    preparation: {
      title: "TOEFL Exam Preparation: Expert Study Guide & Section Tips",
      subtitle: "Unlock study strategies, test-day practices, and section rules to score 100+.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            TOEFL preparation requires familiarizing yourself with the computer-delivered environment. Discover section strategies below:
          </p>

          <div className="space-y-5">
            {/* Reading */}
            <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-2.5">
              <h4 className="font-black text-xs text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} />
                1. Reading Comprehension Tips
              </h4>
              <ul className="list-disc list-inside text-[11.5px] text-slate-500 space-y-1 leading-relaxed font-semibold pl-1">
                <li>Practice reading academic texts from scientific journals and articles.</li>
                <li>Improve skimming: Practice identifying the main idea of paragraphs quickly.</li>
                <li>Build vocabulary: Keep a record of unfamiliar terms in academic contexts.</li>
              </ul>
            </div>

            {/* Listening */}
            <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-2.5">
              <h4 className="font-black text-xs text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} />
                2. Listening Comprehension Tips
              </h4>
              <ul className="list-disc list-inside text-[11.5px] text-slate-500 space-y-1 leading-relaxed font-semibold pl-1">
                <li>Practice active note-taking while listening to audio clips.</li>
                <li>Listen to academic podcasts and debates to get used to different English accents.</li>
                <li>Focus on the speaker's tone and purpose, not just details.</li>
              </ul>
            </div>

            {/* Speaking */}
            <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-2.5">
              <h4 className="font-black text-xs text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} />
                3. Speaking Section Tips
              </h4>
              <ul className="list-disc list-inside text-[11.5px] text-slate-500 space-y-1 leading-relaxed font-semibold pl-1">
                <li>Practice with a timer. You have only 45-60 seconds to speak.</li>
                <li>Maintain a steady, clear speaking pace. Avoid rushing or speaking too softly.</li>
                <li>Use structural templates to organize your points quickly.</li>
              </ul>
            </div>

            {/* Writing */}
            <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-2.5">
              <h4 className="font-black text-xs text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} />
                4. Writing Section Tips
              </h4>
              <ul className="list-disc list-inside text-[11.5px] text-slate-500 space-y-1 leading-relaxed font-semibold pl-1">
                <li>Integrated task: Clearly connect the reading passage points to the lecture points.</li>
                <li>Academic Discussion task: Practice writing concise, well-structured opinions under 10 minutes.</li>
                <li>Leave 2-3 minutes at the end of each task to proofread for spelling or grammar mistakes.</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-[11.5px] text-slate-600 font-semibold leading-relaxed">
            💡 <strong>Official Materials:</strong> We highly recommend using the official ETS TOEFL mock resources, including the free practice tests on <strong>ETS.org</strong>.
          </div>
        </div>
      )
    }
  };

  const faqMap = {
    overview: [
      { q: "What is the TOEFL exam fee in India?", a: "The registration fee for the TOEFL iBT exam in India is ₹16,900." },
      { q: "How long is a TOEFL score valid?", a: "TOEFL scores are valid for exactly 2 years from the date of your exam." },
      { q: "Is TOEFL harder than IELTS?", a: "It depends on preference: TOEFL is fully computer-delivered, whereas IELTS offers paper and face-to-face formats." },
      { q: "Can I write TOEFL from home?", a: "Yes, you can register for the TOEFL iBT Home Edition, which uses the same content and scoring criteria as the center exam." }
    ],
    syllabus: [
      { q: "What sections are in the shortened TOEFL iBT?", a: "It contains 4 sections: Reading, Listening, Speaking, and Writing, with a total duration of 2 hours." },
      { q: "Are there breaks during the TOEFL exam?", a: "No, the shortened TOEFL iBT is a 2-hour continuous test with no scheduled breaks." },
      { q: "What is the new writing task in TOEFL?", a: "The new task is 'Writing for an Academic Discussion', where you write a post contributing to an online classroom forum." }
    ],
    fees: [
      { q: "Can I reschedule my TOEFL exam?", a: "Yes, you can reschedule your exam up to 4 days before the test date for a fee of ₹5,900." },
      { q: "What is the late registration fee for TOEFL?", a: "Registering within 7 days of the test date incurs a late fee of ₹3,900." },
      { q: "Can I get a refund if I cancel my TOEFL exam?", a: "Yes, cancellations made at least 4 full days before the test date receive a 50% partial refund." }
    ],
    dates: [
      { q: "How often is the TOEFL exam conducted?", a: "TOEFL is conducted over 60 times a year at secure physical centers. TOEFL Home Edition is available 24 hours a day, 4 days a week." },
      { q: "How far in advance should I book my TOEFL date?", a: "We recommend booking at least 3 to 4 months before your first university application deadline." }
    ],
    registration: [
      { q: "Can I register for TOEFL without a passport?", a: "No, in India, a valid physical passport is the only accepted identification. Digital or other documents will not be accepted." },
      { q: "How do I choose test centers during registration?", a: "During online registration, enter your city to compare available dates and physical test center capacities." }
    ],
    results: [
      { q: "When will my TOEFL results be released?", a: "TOEFL results are typically available online in your ETS portal within 4 to 8 days after your exam." },
      { q: "What is a good TOEFL score?", a: "A total score of 95-100 is considered good. Top Ivy League schools usually require 105 or higher." },
      { q: "How do I send my TOEFL scores to universities?", a: "You can send scores to 4 universities for free. You must select these recipients in your account before taking the exam." }
    ],
    preparation: [
      { q: "How many hours should I study for TOEFL?", a: "Most test takers study for 60-80 hours over 4-6 weeks to achieve their target score." },
      { q: "Are official TOEFL mock tests useful?", a: "Yes, official ETS practice tests use real past questions and exact scoring criteria, making them the best diagnostic tool." }
    ]
  };

  const activeContent = contentMap[pageKey] || contentMap.overview;
  const currentFaqs = faqMap[pageKey] || faqMap.overview;

  // Next Up logic: select the next 4 tabs to create a navigation block
  const currentIndex = sidebarLinks.findIndex(l => l.key === pageKey);
  const nextUpLinks = [
    sidebarLinks[(currentIndex + 1) % sidebarLinks.length],
    sidebarLinks[(currentIndex + 2) % sidebarLinks.length],
    sidebarLinks[(currentIndex + 3) % sidebarLinks.length],
    sidebarLinks[(currentIndex + 4) % sidebarLinks.length]
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/exams/toefl" className="hover:text-indigo-650 transition-colors">Exams</Link>
          <ChevronRight size={12} />
          <span className="text-slate-650">TOEFL</span>
          <ChevronRight size={12} />
          <span className="text-slate-600">{sidebarLinks.find(l => l.key === pageKey)?.name || 'Detail'}</span>
        </div>

        {/* Title Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2rem] p-8 md:p-12 text-white overflow-hidden mb-10 shadow-lg border border-indigo-950">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest mb-4">
              <Compass size={12} />
              TOEFL Exam Suite
            </span>
            <h1 className="text-2xl md:text-4xl font-black leading-tight tracking-tight mb-4">
              {activeContent.title}
            </h1>
            <p className="text-indigo-200/90 text-xs md:text-sm leading-relaxed font-semibold">
              {activeContent.subtitle}
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-8 items-start">
          
          {/* Left Sticky Sidebar Menu */}
          <aside className="hidden lg:block sticky top-28 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">On This Section</p>
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.key}
                    to={link.path}
                    className={`w-full flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl text-xs font-extrabold transition-all leading-normal cursor-pointer
                      ${pageKey === link.key
                        ? 'bg-indigo-50 text-indigo-650 shadow-sm shadow-indigo-100/50'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                  >
                    <IconComponent size={14} className={pageKey === link.key ? 'text-indigo-600' : 'text-slate-400'} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Center Main Content Area */}
          <main className="space-y-10">
            <div className="bg-white border border-slate-100 p-8 md:p-10 rounded-2xl shadow-sm">
              {activeContent.content}

              {/* Additional Quick Actions Box */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-extrabold text-slate-805 text-sm mb-1">Preparing for TOEFL?</h4>
                  <p className="text-xs text-slate-500 leading-normal font-semibold">Join our expert coaching for full diagnostic mocks and score updates.</p>
                </div>
                <div className="flex items-center justify-start sm:justify-end">
                  <Link
                    to="/book-consultation"
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm shadow-indigo-600/10 cursor-pointer"
                  >
                    <span>Attend Free Session</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Next Up section */}
            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-5">
              <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                Next Up
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nextUpLinks.map((linkItem, idx) => {
                  const IconComponent = linkItem.icon;
                  return (
                    <Link
                      key={idx}
                      to={linkItem.path}
                      className="group p-5 rounded-2xl border border-slate-100 hover:border-indigo-150 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex items-start justify-between cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-650 inline-flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition-colors">
                          <IconComponent size={14} />
                        </span>
                        <h5 className="font-extrabold text-slate-800 text-xs tracking-tight group-hover:text-indigo-600 transition-colors">
                          {linkItem.name}
                        </h5>
                        <p className="text-[10px] text-indigo-500 font-black tracking-wider uppercase inline-flex items-center gap-0.5 mt-1">
                          Read Now
                          <ArrowRight size={10} className="transform group-hover:translate-x-0.5 transition-transform" />
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Tab Specific Accordion FAQs */}
            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2">
                <HelpCircle className="text-indigo-600" size={20} />
                Section-wise FAQs
              </h3>
              <div className="space-y-3">
                {currentFaqs.map((faq, idx) => {
                  const isOpen = !!openFaq[idx];
                  return (
                    <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-755 hover:text-indigo-600 transition-colors text-xs"
                      >
                        <span>{faq.q}</span>
                        <ChevronRight 
                          size={14} 
                          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90 text-indigo-500' : ''}`} 
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-4 pb-4 pt-1 text-slate-500 text-xs border-t border-slate-100 leading-relaxed font-semibold">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>

          {/* Right Sidebar Widgets */}
          <aside className="sticky top-28 space-y-6">
            
            {/* Widget: Live Events & Fairs */}
            <div className="bg-gradient-to-br from-[#111111] via-[#10319E] to-[#111111] text-white p-6 rounded-2xl shadow-lg border border-blue-900/40 relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />
              <span className="text-[9px] font-black text-orange-200 uppercase tracking-widest block mb-2">Live Workshops</span>
              <h3 className="text-lg font-black leading-snug mb-3">
                Study Abroad Events & Fairs
              </h3>
              <p className="text-xs text-blue-100/80 leading-relaxed mb-5 font-semibold">
                Join live webinars, meet university delegates & attend expert coaching masterclasses.
              </p>
              <Link
                to="/events"
                className="w-full text-center py-3 bg-white text-[#111111] rounded-xl text-xs font-black hover:bg-orange-50 hover:shadow-md transition-all flex items-center justify-center gap-1.5 shadow-sm block cursor-pointer"
              >
                <span>Explore Upcoming Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget 2: Contextual Resource (Blogs / AI Tools / Scholarships) */}
            {pageKey === 'overview' ? (
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100/80">
                  <BookOpen size={22} className="text-amber-600" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-xs mb-2">Study Abroad Blogs & Guides</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-5 font-semibold">
                  Read insider tips, country comparisons, exam strategies & visa application roadmaps.
                </p>
                <Link
                  to="/blogs"
                  className="w-full text-center py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-50 hover:border-slate-300 transition-all block cursor-pointer"
                >
                  Explore All Blogs
                </Link>
              </div>
            ) : pageKey === 'fees' ? (
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100/80">
                  <Award size={22} className="text-emerald-600" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-xs mb-2">Scholarships & Grants</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-5 font-semibold">
                  Discover government & university scholarships worth up to 100% tuition coverage.
                </p>
                <Link
                  to="/scholarships"
                  className="w-full text-center py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-50 hover:border-slate-300 transition-all block cursor-pointer"
                >
                  Find Scholarships
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#111111] flex items-center justify-center mx-auto mb-4 border border-orange-100/60">
                  <Sparkles size={22} className="text-[#111111]" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-xs mb-2">AI University Matcher</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-5 font-semibold">
                  Find universities matching your target score, budget & profile with 98% accuracy.
                </p>
                <Link
                  to="/ai-tools"
                  className="w-full text-center py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-50 hover:border-slate-300 transition-all block cursor-pointer"
                >
                  Find Best Match
                </Link>
              </div>
            )}

          </aside>

        </div>
      </div>
    </div>
  );
};

export default TOEFLDetailPage;
