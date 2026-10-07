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

const GREDetailPage = ({ pageKey }) => {
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const sidebarLinks = [
    { name: 'GRE Overview', path: '/exams/gre/overview', key: 'overview', icon: Compass },
    { name: 'GRE Syllabus', path: '/exams/gre/syllabus', key: 'syllabus', icon: BookOpen },
    { name: 'GRE Exam Fees', path: '/exams/gre/fees', key: 'fees', icon: DollarSign },
    { name: 'GRE Exam Dates', path: '/exams/gre/dates', key: 'dates', icon: Calendar },
    { name: 'GRE Registration', path: '/exams/gre/registration', key: 'registration', icon: FileEdit },
    { name: 'GRE Results', path: '/exams/gre/results', key: 'results', icon: Award },
    { name: 'GRE Slot Booking', path: '/exams/gre/slot-booking', key: 'slot-booking', icon: MapPin },
    { name: 'GRE Preparation', path: '/exams/gre/preparation', key: 'preparation', icon: ListTodo },
    { name: 'GRE Practice Test', path: '/exams/gre/practice-test', key: 'practice-test', icon: FileText }
  ];

  // Detailed content dictionary for GRE tabs
  const contentMap = {
    overview: {
      title: "GRE Exam for Indian Students in 2025: A Complete Guide",
      subtitle: "The Graduate Record Exam (GRE) is the leading admission test required for MS, MBA, and PhD programs globally.",
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 border border-blue-150 p-5 rounded-2xl flex items-start gap-3.5">
            <Info className="text-[#DE5C2B] w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider mb-1">Latest ETS GRE Updates</h4>
              <p className="text-xs text-blue-900 leading-relaxed font-semibold">
                ETS has introduced a shorter GRE General Test format, reducing the duration to 1 hour and 58 minutes. The Analytical Writing section now contains only one task (Analyse an Issue), and the number of questions in Verbal and Quantitative sections has been significantly reduced. Additionally, the GRE Subject Test is no longer applicable/available in India.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
              1. What is the GRE Exam?
            </h3>
            <p className="text-slate-655 font-semibold text-xs leading-relaxed">
              GRE, or Graduate Record Exam, is one of the most common exams required for post-graduate studies abroad. It is conducted by the Educational Testing Services (ETS).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              {[
                { title: "GRE General Test", desc: "Assesses Verbal Reasoning, Quantitative Reasoning, and Analytical Writing skills." },
                { title: "Wide Acceptability", desc: "Accepted by over 1,300 business schools in over 72 countries (USA, Canada, UK, etc.)." },
                { title: "Readiness Benchmark", desc: "Indicates your readiness for high-level graduate coursework." },
                { title: "Profile Booster", desc: "Significantly enhances your candidate profile for university admissions and scholarships." }
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
              <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
              Why Take the GRE?
            </h3>
            <p className="text-slate-655 font-semibold text-xs leading-relaxed">
              Most graduate divisions require standard standardized scores to differentiate between candidates coming from different educational setups. A high GRE score helps you stand out and is key for merit-based financial aid.
            </p>
          </div>
        </div>
      )
    },
    syllabus: {
      title: "GRE Syllabus & Pattern: What Does the Test Contain?",
      subtitle: "Full breakdown of section timing, question structures, and syllabus guidelines under the shorter GRE.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            The shorter GRE General Test contains 46 fewer questions compared to the traditional version, making the test faster and less tiring.
          </p>

          <div className="space-y-4">
            <h4 className="font-black text-slate-850 text-xs uppercase tracking-wide">GRE Shorter Edition Format</h4>
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-150">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">GRE Section</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Structure / Questions</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Timing Limits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-805">Analytical Writing</td>
                    <td className="py-3 px-4">1 Essay Task (Analyse an Issue)</td>
                    <td className="py-3 px-4">30 Minutes</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-805">Quantitative Reasoning</td>
                    <td className="py-3 px-4">27 Questions (2 Sections)</td>
                    <td className="py-3 px-4">47 Minutes</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-805">Verbal Reasoning</td>
                    <td className="py-3 px-4">27 Questions (2 Sections)</td>
                    <td className="py-3 px-4">41 Minutes</td>
                  </tr>
                  <tr className="bg-indigo-50/20 font-bold">
                    <td className="py-3 px-4 text-slate-805">Total Exam</td>
                    <td className="py-3 px-4 text-indigo-700">55 Questions + 1 Essay</td>
                    <td className="py-3 px-4">1 Hour 58 Mins</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="font-black text-slate-850 text-xs uppercase tracking-wide">Section Focus Areas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-600">
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-1.5">
                <span className="font-black text-indigo-700 block">Verbal Reasoning</span>
                <span className="text-[11px] text-slate-500 block leading-relaxed">Evaluates text comprehension, argument analysis, vocabulary (text completion), sentence equivalence, and passage logic.</span>
              </div>
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-1.5">
                <span className="font-black text-indigo-700 block">Quantitative Reasoning</span>
                <span className="text-[11px] text-slate-500 block leading-relaxed">Measures basic mathematical skills: arithmetic, high school algebra, geometry data interpretation, and statistics.</span>
              </div>
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-1.5">
                <span className="font-black text-indigo-700 block">Analytical Writing</span>
                <span className="text-[11px] text-slate-500 block leading-relaxed">Tests capability to articulate arguments clearly, organize points logically, and back up claims with relevant details.</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    fees: {
      title: "GRE Exam Fees in India: Registration & Rescheduling Fees",
      subtitle: "Overview of current GRE test registration rates, scheduling penalties, and DCC payment channels.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            The booking fee for the GRE General Test in India is ₹22,550. Additional service fees apply depending on post-booking requests:
          </p>

          <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-150">
                <tr>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">GRE Exam Service / Category</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Fees in India (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655 font-semibold text-xs">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-805">GRE General Test Fee</td>
                  <td className="py-3 px-4 font-black text-indigo-650">₹22,550</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Rescheduling Fee</td>
                  <td className="py-3 px-4">₹5,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Changing Test Centre Location</td>
                  <td className="py-3 px-4">₹5,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Changing Subject Test Details</td>
                  <td className="py-3 px-4">₹5,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Additional Score Report Request</td>
                  <td className="py-3 px-4">₹2,900</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Score Review Request</td>
                  <td className="py-3 px-4">₹5,900</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Score Reinstatement Fee</td>
                  <td className="py-3 px-4">₹5,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl text-[11px] text-slate-500 font-semibold space-y-2 leading-relaxed">
            <h5 className="font-extrabold text-slate-800 text-xs">Payment Channels & Rescheduling:</h5>
            <p>• <strong>Rescheduling Deadline:</strong> You must reschedule at least 4 days before your test date to avoid forfeiting your entire registration fee. Rescheduling cost is ₹5,000.</p>
            <p>• <strong>Accepted payment methods:</strong> Credit/Debit cards (Visa, MasterCard, Maestro, RuPay), UPI, Bharat QR, digital wallets (PayZapp, Google Pay, FreeCharge), and Dynamic Currency Conversion (DCC).</p>
          </div>
        </div>
      )
    },
    dates: {
      title: "GRE Dates: When is the GRE Exam Conducted?",
      subtitle: "GRE General tests are available on most days throughout the year depending on your local center.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            Unlike other standard academic exams with fixed schedules, the computer-based GRE is offered multiple times a week. Candidates can book slots up to 2-3 months early.
          </p>
          <div className="p-4.5 border border-slate-100 rounded-2xl bg-slate-50/50 text-[11px] text-slate-500 font-semibold space-y-2 leading-relaxed">
            <p>• <strong>Year-Round availability:</strong> Test center slots are scheduled dynamically and are open on a rolling basis.</p>
            <p>• <strong>GRE at Home Slots:</strong> Home-testing provides 24/7 date availability, making slot selection convenient.</p>
            <p>• <strong>Retake Rule:</strong> Candidates must maintain a minimum buffer of 21 days between successive GRE attempts.</p>
          </div>
        </div>
      )
    },
    registration: {
      title: "GRE Registration 2024: How to Register for GRE?",
      subtitle: "Guideline steps to register for GRE General, GRE Subject, and Home exams.",
      content: (
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-850">Online Registration Steps:</h4>
            <div className="space-y-2 text-[11px] font-bold text-slate-500">
              {[
                "1. Visit the official Educational Testing Services (ETS) portal and create an account.",
                "2. Register your profile precisely matching the spelling in your valid passport.",
                "3. Click the 'Register/Find Test Centers, Dates' link on the dashboard.",
                "4. Select the GRE General or GRE Subject Test based on your B-school goals.",
                "5. Pick your preferred test center, date range, and daily time slot.",
                "6. Provide details matching your valid ID proof (physical passport).",
                "7. Complete payment of ₹22,550 using digital card or UPI gateways.",
                "8. Receive registration confirmation logs and download your admission ticket."
              ].map((step, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-850">GRE Subject Test Windows</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              The GRE Subject test has fixed test windows globally. Note that home-testing for the Subject test is not available in India. The three standard windows are:
            </p>
            <div className="grid grid-cols-3 gap-3.5 text-center text-[10px] font-bold text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="block text-indigo-650">Window 1</span>
                <span>Sep 16 - Sep 29, 2024</span>
              </div>
              <div>
                <span className="block text-indigo-650">Window 2</span>
                <span>Oct 17 - Oct 30, 2024</span>
              </div>
              <div>
                <span className="block text-indigo-650">Window 3</span>
                <span>Apr 21 - May 4, 2025</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-850">GRE at Home vs Test Center</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              The GRE General at Home allows you to write the test under secure remote proctoring. The at-home registration fee remains the same at ₹19,110 (Wait: as per the user text: "The registration fee for the GRE at Home remains the same at INR 19,110").
            </p>
          </div>
        </div>
      )
    },
    results: {
      title: "GRE Result: How do You Check Your GRE Results?",
      subtitle: "Learn how score ranges are structured, how to download TRFs, and validity limits.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            GRE General Test results are released in <strong>10-15 days</strong> of your exam appointment. You can check them by logging into your ETS dashboard.
          </p>

          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-800">GRE General Test Scoring System</h4>
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-150">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Exam Section</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Score Range</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Increments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-655 font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4">Verbal Reasoning</td>
                    <td className="py-3 px-4">130 – 170</td>
                    <td className="py-3 px-4">1-point increments (+1 per correct answer)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Quantitative Reasoning</td>
                    <td className="py-3 px-4">130 – 170</td>
                    <td className="py-3 px-4">1-point increments (+1 per correct answer)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Analytical Writing</td>
                    <td className="py-3 px-4">0 – 6</td>
                    <td className="py-3 px-4">0.5-point increments</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl text-[11px] text-slate-500 space-y-2 leading-relaxed">
            <p>• <strong>Score Report:</strong> Official scores are sent to up to 4 universities free of charge within 10-15 days. Extra reports cost ₹2,900 each.</p>
            <p>• <strong>Validity:</strong> Scores remain valid for exactly <strong>5 years</strong> from the test date.</p>
            <p>• <strong>ScoreSelect:</strong> Allows candidates to choose which test date scores to send to universities.</p>
          </div>
        </div>
      )
    },
    'slot-booking': {
      title: "GRE Slot Booking: Check Booking Dates for Registration & Slots",
      subtitle: "Test center directories, computer-based dates, and secure proctoring setups.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            GRE slot booking lets you secure dates, locations, and time configurations.
          </p>

          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-800">GRE Test Centres Address Directory (India)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-[11px] text-slate-600 font-semibold leading-relaxed">
              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                <strong className="text-slate-800 block text-xs">Ahmedabad</strong>
                5th Floor, Unit 501, Parshwanath Esquare, Corporate Road, 380005
              </div>
              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                <strong className="text-slate-800 block text-xs">Bangalore</strong>
                Prestige Shantiniketan Whitefield or Koramangala 5th Block KHB Colony
              </div>
              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                <strong className="text-slate-800 block text-xs">Chandigarh</strong>
                Sector 26 - Computer Lab
              </div>
              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                <strong className="text-slate-800 block text-xs">Chennai</strong>
                Manimangalam Post, Dhanalakshmi Engineering College
              </div>
              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                <strong className="text-slate-800 block text-xs">Hyderabad</strong>
                Kapil Towers Gachibowli, Police Line Nizamabad, or Kazipet Warangal
              </div>
              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                <strong className="text-slate-800 block text-xs">Kolkata</strong>
                Millennium City DN-62, Sector V Salt Lake
              </div>
              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                <strong className="text-slate-800 block text-xs">Mumbai</strong>
                Techniplex Goregaon or Aruna Manharlal Shah Institute
              </div>
              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                <strong className="text-slate-800 block text-xs">Pune</strong>
                Marvel Vista Bibwewadi or Upper Indiranagar
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-800">Home Exam Setup Guide</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              To take the GRE at Home, you must check that your workstation complies with proctoring specs:
            </p>
            <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-1.5 leading-relaxed font-semibold">
              <li>A private room without disturbances or outdoor interruptions.</li>
              <li>A laptop or desktop with proper high-speed network connectivity.</li>
              <li>A functional built-in speaker and microphone setup.</li>
              <li>A proper working camera or external webcam.</li>
            </ul>
          </div>
        </div>
      )
    },
    preparation: {
      title: "GRE Exam Preparation: Planners & Recommended Strategies",
      subtitle: "Effective strategies to build vocabulary and quantitative problem solving skills.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            Dedicated preparation of 2 to 3 months is optimal for most MS and MBA candidates. Focus on:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
            <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50/50 space-y-2">
              <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <Sparkles size={13} className="text-indigo-500" />
                Option A: Self Prep
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                Familiarize yourself with ETS exam patterns. Uses official Cambridge guides and practice mocks. Recommended for candidates with high baseline vocabulary.
              </p>
            </div>
            <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50/50 space-y-2">
              <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <Sparkles size={13} className="text-indigo-500" />
                Option B: Guided Coaching
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                Highly recommended for candidates targeting 320+ scores, seeking advice on shortcuts for quantitative topics, and detailed feedback on Analytical Writing essays.
              </p>
            </div>
          </div>
        </div>
      )
    },
    'practice-test': {
      title: "GRE Practice Test 2024 for Exam Preparation",
      subtitle: "Simulating exams using practice tests is the best way to evaluate performance and build speed.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            Practice tests are not just for evaluating your score. They help you build critical exam-day endurance and manage time effectively.
          </p>

          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-850">Section Practice Guidelines</h4>
            <div className="space-y-3 text-[11px] text-slate-600 font-semibold leading-relaxed">
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl">
                <strong className="text-indigo-700 block mb-1">Verbal Reasoning Mocks</strong>
                Focuses on comprehension and critical reasoning. Standard practice includes reading complex passages and solving MCQs under a tight 41-minute limit.
              </div>
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl">
                <strong className="text-indigo-700 block mb-1">Quantitative Reasoning Mocks</strong>
                Assess arithmetic, algebra, probability, data interpretation, and statistics. Practice solving quantitative comparison questions.
              </div>
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl">
                <strong className="text-indigo-700 block mb-1">Analytical Writing practice</strong>
                Write one argumentative essay response (Analyse an Issue) within a strict 30-minute window.
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const faqMap = {
    overview: [
      { q: "How long is the GRE?", a: "The shorter GRE General Test takes exactly 1 hour and 58 minutes to complete." },
      { q: "Is the GRE compulsory for MS in the USA?", a: "While many universities have made it optional or offer waivers, a high GRE score significantly boosts admissions and merit scholarships." },
      { q: "How long are GRE scores valid?", a: "GRE scores are valid for exactly 5 years from your test date." },
      { q: "How many times can I take the GRE in a year?", a: "You can take the GRE once every 21 days, up to 5 times in a continuous rolling 12-month period." },
      { q: "Can I use a calculator during the GRE test?", a: "An on-screen calculator is provided during the Quantitative Reasoning section. Physical calculators are prohibited." },
      { q: "Is there a negative marking on the GRE?", a: "No, there is no negative marking for incorrect answers. Attempting all questions is highly encouraged." }
    ],
    syllabus: [
      { q: "What did the shorter GRE update change?", a: "It reduced the question count in Verbal and Quantitative sections to 27 questions each, removed the Analyse an Argument essay, and shortened the test time to under 2 hours." },
      { q: "Are there breaks in the shorter GRE?", a: "No, there are no scheduled breaks in the shorter 1 hour 58 minutes exam." }
    ],
    fees: [
      { q: "How much is the GRE exam fee?", a: "The base registration fee for GRE General Test in India is ₹22,550." },
      { q: "Is rescheduling the GRE exam free?", a: "No, rescheduling your GRE date costs ₹5,000 and must be done at least 4 days before the test date." }
    ],
    dates: [
      { q: "When are GRE exams conducted?", a: "The computer-delivered test is available year-round. Slot availability depends on the chosen local test center." }
    ],
    registration: [
      { q: "Who is eligible for the GRE General test?", a: "ETS has set no specific age limits or educational qualifiers. A valid physical passport is required for registration in India." }
    ],
    results: [
      { q: "What is a good GRE score?", a: "A total score above 300 is considered good. Top-tier universities often seek scores of 315-320 and above." }
    ],
    'slot-booking': [
      { q: "How can I book GRE slots in India?", a: "You can book slots online via the ETS website by creating an account, selecting a test center, date, and paying the ₹22,550 fee." }
    ],
    preparation: [
      { q: "Can I clear my GRE in one month?", a: "Yes, if you already have a strong foundation in math and English, a month of targeted mock testing can yield a good score. Most candidates benefit from 2-3 months of study." }
    ],
    'practice-test': [
      { q: "Are GRE practice tests free?", a: "ETS provides 2 free POWERPREP Online practice tests upon account creation on MBA.com/ETS." }
    ]
  };

  const activeContent = contentMap[pageKey] || contentMap.overview;
  const currentFaqs = faqMap[pageKey] || faqMap.overview;

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
          <Link to="/exams/gre" className="hover:text-indigo-650 transition-colors">Exams</Link>
          <ChevronRight size={12} />
          <span className="text-slate-655">GRE</span>
          <ChevronRight size={12} />
          <span className="text-slate-600">{sidebarLinks.find(l => l.key === pageKey)?.name || 'Detail'}</span>
        </div>

        {/* Title Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest mb-4">
              GRE Reference Guide 2025
            </span>
            <h1 className="text-2xl md:text-4xl font-black leading-tight tracking-tight mb-4">
              {activeContent.title}
            </h1>
            <p className="text-indigo-200/90 text-sm leading-relaxed font-semibold">
              {activeContent.subtitle}
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-8 items-start">
          
          {/* Left Sidebar Links */}
          <aside className="sticky top-28 bg-white border border-slate-105 p-5 rounded-2xl shadow-sm max-h-[calc(100vh-140px)] overflow-y-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">GRE Guide Index</p>
            <nav className="space-y-1">
              {sidebarLinks.map((linkItem) => {
                const isActive = pageKey === linkItem.key;
                const LinkIcon = linkItem.icon;
                return (
                  <Link
                    key={linkItem.key}
                    to={linkItem.path}
                    className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold transition-all leading-normal flex items-center justify-between
                      ${isActive
                        ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                  >
                    <span className="flex items-center gap-2">
                      <LinkIcon size={14} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                      <span>{linkItem.name}</span>
                    </span>
                    <ChevronRight size={12} className={isActive ? 'text-indigo-500' : 'text-slate-350'} />
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Center Content Section */}
          <main className="space-y-10">
            <div className="bg-white border border-slate-100 p-8 md:p-10 rounded-2xl shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <BookMarked size={18} className="text-indigo-600" />
                Detailed Guide Content
              </h2>
              <div className="prose max-w-none">
                {activeContent.content}
              </div>

              {/* Additional Quick Actions Box */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-extrabold text-slate-805 text-sm mb-1">Preparing for GRE?</h4>
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
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-750 hover:text-indigo-600 transition-colors text-xs"
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

export default GREDetailPage;
