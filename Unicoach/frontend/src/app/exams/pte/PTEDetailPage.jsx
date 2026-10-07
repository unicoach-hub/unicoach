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

const PTEDetailPage = ({ pageKey }) => {
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const sidebarLinks = [
    { name: 'PTE Overview', path: '/exams/pte/overview', key: 'overview', icon: Compass },
    { name: 'PTE Syllabus', path: '/exams/pte/syllabus', key: 'syllabus', icon: BookOpen },
    { name: 'PTE Exam Fees', path: '/exams/pte/fees', key: 'fees', icon: DollarSign },
    { name: 'PTE Exam Dates', path: '/exams/pte/dates', key: 'dates', icon: Calendar },
    { name: 'PTE Registration', path: '/exams/pte/registration', key: 'registration', icon: FileEdit },
    { name: 'PTE Centres', path: '/exams/pte/centres', key: 'centres', icon: MapPin },
    { name: 'PTE Results', path: '/exams/pte/results', key: 'results', icon: Award },
    { name: 'PTE Slot Booking', path: '/exams/pte/slot-booking', key: 'slot-booking', icon: ShieldCheck },
    { name: 'PTE Preparation', path: '/exams/pte/preparation', key: 'preparation', icon: ListTodo }
  ];

  // Rich contents dictionary for PTE tabs
  const contentMap = {
    overview: {
      title: "PTE Academic Exam 2026: A Complete Guide",
      subtitle: "The Pearson Test of English (PTE) is a highly standardized computer-based English proficiency test accepted worldwide.",
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 border border-blue-150 p-5 rounded-2xl flex items-start gap-3.5">
            <Info className="text-[#DE5C2B] w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider mb-1">PTE 2026 Update Summary</h4>
              <p className="text-xs text-blue-900 leading-relaxed font-semibold">
                Pearson has implemented the Hybrid Scoring Model, introducing double-marking where human experts review AI evaluations for open-ended tasks (like the Essay). In addition, two new tasks (Respond to a Situation, Summarize Group Discussion) are now active in the Speaking & Writing section.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block" />
              1. What is the PTE Academic Exam?
            </h3>
            <p className="text-slate-655 font-semibold text-xs leading-relaxed">
              PTE evaluates four core English skills: Speaking, Writing, Reading, and Listening using automated AI technology to ensure unbiased and objective outcomes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 my-6">
              {[
                { title: "Duration", desc: "Approximately 2 hours and 15 minutes to complete the full automated exam." },
                { title: "Fast Results", desc: "Get score reports published online within 24 to 48 hours." },
                { title: "Unlimited Reporting", desc: "Report scores to unlimited target universities free of charge via your portal." },
                { title: "Flexible Slots", desc: "Offered daily across 62+ authorized physical test centers in India." }
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
              PTE vs PTE Core: Which Option is Best?
            </h3>
            <div className="space-y-3 text-xs leading-relaxed font-semibold text-slate-600">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <strong className="text-slate-800 block mb-0.5">PTE Academic</strong>
                Designed specifically for candidates seeking undergraduate or postgraduate program admission, or professional licensing globally. Accepted by USA, UK, Canada, Australia, and New Zealand.
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <strong className="text-slate-800 block mb-0.5">PTE Core</strong>
                Designed specifically for immigration and permanent residency (PR) pathways in Canada. Focuses on practical, everyday English vocabulary instead of academic jargon.
              </div>
            </div>
          </div>
        </div>
      )
    },
    syllabus: {
      title: "PTE Exam Syllabus and Pattern 2026: Section Breakdown",
      subtitle: "The PTE Academic exam consists of 3 sections testing 4 communication skills over 22 different task formats.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            The exam takes approximately 2 hours and 15 minutes. Review the duration and structure of each section below:
          </p>

          <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-6 shadow-sm">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-150">
                <tr>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">PTE Section</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Duration</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Core Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Speaking & Writing</td>
                  <td className="py-3.5 px-4">54 - 67 Minutes</td>
                  <td className="py-3.5 px-4 text-slate-500">Read Aloud, Repeat Sentence, Describe Image, Summarize Written Text, Write Essay, Respond to Situation, Summarize Group Discussion.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Reading</td>
                  <td className="py-3.5 px-4">29 - 30 Minutes</td>
                  <td className="py-3.5 px-4 text-slate-500">Reading & Writing Fill in the Blanks, Multiple Choice (Multiple/Single Answers), Re-order Paragraphs.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Listening</td>
                  <td className="py-3.5 px-4">30 - 43 Minutes</td>
                  <td className="py-3.5 px-4 text-slate-500">Summarize Spoken Text, Fill in Blanks, Highlight Correct Summary, Select Missing Word, Highlight Incorrect Words, Dictation.</td>
                </tr>
                <tr className="bg-indigo-50/20 font-bold">
                  <td className="py-3.5 px-4 text-slate-800">Total Duration</td>
                  <td className="py-3.5 px-4 text-indigo-700">113 - 140 Minutes</td>
                  <td className="py-3.5 px-4 text-indigo-700">Global scale score: 10 - 90 points</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-5 pt-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block" />
              Syllabus Section Details
            </h3>

            {/* Speaking & Writing */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
              <h4 className="font-extrabold text-xs text-indigo-700 uppercase tracking-wide">1. Speaking & Writing Section</h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Evaluates oral production and academic writing. Includes new 2026 tasks:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-slate-500">
                {["Read Aloud", "Repeat Sentence", "Describe Image", "Re-tell Lecture", "Answer Short Question", "Summarize Written Text", "Write Essay", "Respond to Situation (New)", "Summarize Discussion (New)"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border border-slate-100 p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Reading */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
              <h4 className="font-extrabold text-xs text-indigo-700 uppercase tracking-wide">2. Reading Section</h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Evaluates text parsing and comprehension of academic contexts:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-slate-500">
                {["Reading & Writing Blank Fills", "Multiple Choice (Multi)", "Re-order Paragraphs", "Reading Blank Fills (Drag)", "Multiple Choice (Single)"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border border-slate-100 p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Listening */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
              <h4 className="font-extrabold text-xs text-indigo-700 uppercase tracking-wide">3. Listening Section</h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Evaluates ability to process diverse English accents in audio and video clips:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-slate-500">
                {["Summarize Spoken Text", "Multiple Choice (Multi)", "Fill in the Blanks", "Highlight Correct Summary", "Multiple Choice (Single)", "Select Missing Word", "Highlight Incorrect Words", "Write from Dictation"].map((t) => (
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
      title: "PTE Exam Fees 2026: Registration & Rescheduling Charges",
      subtitle: "Review the standardized fees, additional late booking surcharges, and refund rules.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            In India, the PTE Academic fee is standardized across centers, though extra charges apply for last-minute schedules.
          </p>

          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-800">1. PTE Exam Fee Breakdown</h4>
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-150">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Fee Category</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Amount in India (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-655 font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-805">Standard PTE Exam Fee (including 18% GST)</td>
                    <td className="py-3 px-4 text-indigo-650 font-bold">₹18,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Base Fee (excluding GST)</td>
                    <td className="py-3 px-4">₹15,254.24</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Late Booking Surcharge (within 48 hours of test)</td>
                    <td className="py-3 px-4">₹695 (approx.)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-800">2. Rescheduling & Cancellation Policy</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              If you decide to modify your appointment details, refunds or surcharges depend strictly on your notice buffer:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reschedule */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <h5 className="font-black text-xs text-indigo-755 mb-3 uppercase tracking-wider">Rescheduling timelines</h5>
                <ul className="space-y-2.5 text-[11px] font-bold text-slate-600 leading-relaxed">
                  <li className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>14+ Days Notice</span>
                    <span className="text-indigo-600">Free of cost</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>7 to 13 Days Notice</span>
                    <span className="text-indigo-600">50% fee charge</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Less than 7 Days</span>
                    <span className="text-indigo-600">100% fee charge</span>
                  </li>
                </ul>
              </div>

              {/* Cancellation */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <h5 className="font-black text-xs text-rose-755 mb-3 uppercase tracking-wider">Cancellation Refunds</h5>
                <ul className="space-y-2.5 text-[11px] font-bold text-slate-600 leading-relaxed">
                  <li className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>14+ Days Notice</span>
                    <span className="text-emerald-600">100% refund</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>7 to 13 Days Notice</span>
                    <span className="text-emerald-600">50% refund</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Less than 7 Days</span>
                    <span className="text-rose-600">No refund</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4.5 rounded-2xl text-[11px] text-amber-900 font-semibold leading-relaxed flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> You must request rescheduling or cancellation through the myPTE portal. No changes are permitted within 7 days of the test without forfeiting your fee.
              </span>
            </div>
          </div>
        </div>
      )
    },
    dates: {
      title: "PTE Exam Dates 2026: Booking Strategies & Timeline Planning",
      subtitle: "Plan your PTE test date to coordinate with university intake periods and PR deadlines.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            The PTE is conducted year-round. While scheduling is flexible, we suggest considering these strategic timelines:
          </p>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block" />
              How to Select a Test Date?
            </h3>
            <div className="space-y-3 text-xs leading-relaxed text-slate-500 font-semibold">
              <p>• <strong>University Application Deadlines:</strong> Schedule your exam at least <strong>1.5 to 2 months</strong> before your target university application portals close. This leaves a safe margin if you need a retake.</p>
              <p>• <strong>Peak Admission Seasons:</strong> During peak months (November to January for Fall intake), weekend slots fill up rapidly. Book your date <strong>3 weeks in advance</strong>.</p>
              <p>• <strong>Retake Buffer:</strong> Pearson requires you to receive your previous scores before booking your next attempt. Allow for a 16-day gap buffer if planning multiple attempts.</p>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-4.5 rounded-2xl border border-indigo-150 text-[11px] text-indigo-950 font-semibold leading-relaxed">
            💡 <strong>Preparation Strategy:</strong> We suggest booking only after completing at least two baseline mock tests. If your score sits within 5 points of your target, book your slot immediately!
          </div>
        </div>
      )
    },
    registration: {
      title: "PTE Exam Registration 2026: Step-by-Step Guide",
      subtitle: "Complete your Pearson PTE Academic booking securely using our detailed walkthrough.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            PTE Academic registration is a fully digital process completed via the Pearson portal:
          </p>

          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-850">6-Step Registration Walkthrough</h4>
            <div className="space-y-2 text-[11px] font-bold text-slate-500">
              {[
                "1. Visit Pearson PTE: Go to the official Pearson PTE website and click 'Book a Test'.",
                "2. Choose Destination: Input your target country and goal (Study, Work, or Migration).",
                "3. Search Availability: Select test center cities to compare real-time date options.",
                "4. myPTE Profile: Sign up or log into your myPTE profile. Make sure name details match your passport.",
                "5. Profile Verification: Input identity details carefully. Remember the Surname Dot rule.",
                "6. Secure Slot & Pay: Read policies, complete the online fee payment of ₹18,000, and print your receipt."
              ].map((step, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-850">The "Surname Dot" Rule</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Indian passports occasionally feature blank fields. Pearson enforces strict matching rules to prevent name discrepancies on test day:
            </p>
            <div className="bg-amber-50 border border-amber-100 p-4.5 rounded-2xl text-[11px] text-amber-900 font-semibold leading-relaxed">
              ⚠️ <strong>Warning:</strong> If your passport has a blank surname field, you must type a full stop (.) in the surname field during registration. Failing to match passport identity details will result in being barred from testing.
            </div>
          </div>
        </div>
      )
    },
    centres: {
      title: "PTE Exam Centres in India: Choosing a Location",
      subtitle: "PTE is conducted in over 62 physical test locations across major cities in India.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            Finding a testing center close to you is essential to minimize travel stress on exam day. Key details to check:
          </p>

          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-800">Physical Test Centers List</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["New Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad", "Kolkata", "Pune", "Ahmedabad", "Chandigarh", "Amritsar", "Ludhiana", "Cochin"].map((city, idx) => (
                <div key={idx} className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                  <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                    <MapPin size={12} className="text-indigo-500" />
                    {city}
                  </span>
                  <span className="text-[9px] text-slate-400 font-black mt-1">Authorized Center</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-850">Test Center Equipment & Environments</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Because the PTE Speaking section requires speaking into a microphone, background noise from other test takers is common.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 text-[11px] text-slate-600 space-y-2">
              <p>• <strong>Headsets:</strong> Authorized centers (like Pearson Professional Centers) provide high-quality noise-canceling headsets with built-in microphones to minimize background chatter.</p>
              <p>• <strong>Partitions:</strong> Testing booths have solid partitions, but you should practice speaking clearly without being distracted by your neighbors.</p>
            </div>
          </div>
        </div>
      )
    },
    results: {
      title: "PTE Exam Results 2026: Scores, Scale, and Validity",
      subtitle: "Understand how your scores are calculated, scaled, and verified by universities.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            Most candidates receive their PTE results online within **48 hours (2 business days)**. Let's look at the scorecards and requirements:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Score Validity</span>
              <span className="text-lg font-black text-slate-850">2 Years</span>
            </div>
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Scale Range</span>
              <span className="text-lg font-black text-indigo-600">10 - 90 Points</span>
            </div>
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Average Delivery</span>
              <span className="text-lg font-black text-slate-850">24-48 Hours</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-800">1. Country-wise Intake Targets (2026 Intake)</h4>
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-150">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Destination</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Undergraduate (UG)</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Postgraduate (PG)</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Visa Benchmark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-655 font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4 font-bold">Australia</td>
                    <td className="py-3 px-4">50-58</td>
                    <td className="py-3 px-4">65+</td>
                    <td className="py-3 px-4">65 (Competent) / 79 (Superior)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Canada</td>
                    <td className="py-3 px-4">58-60</td>
                    <td className="py-3 px-4">60-65+</td>
                    <td className="py-3 px-4">60+ (SDS Category)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">United Kingdom</td>
                    <td className="py-3 px-4">51-58</td>
                    <td className="py-3 px-4">58-65</td>
                    <td className="py-3 px-4">58 (Degree Level)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">United States</td>
                    <td className="py-3 px-4">54-59</td>
                    <td className="py-3 px-4">60-70+</td>
                    <td className="py-3 px-4">University dependent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-850">2. Why are my PTE results delayed?</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              If your status shows "Taken - Pending" or "On Hold" beyond 48 hours, it is usually due to one of the following factors:
            </p>
            <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-[11px] text-slate-500 font-semibold space-y-2">
              <p>• <strong>AI Quality Audits:</strong> AI flagged your test audio patterns (e.g. extremely rapid speaking or background glitches) for manual human verification review.</p>
              <p>• <strong>Biometric Verification:</strong> A mismatch occurred between your test day palm vein scan or signature and your profile registration.</p>
              <p>• <strong>Significant Score Spike:</strong> If you retook the test and your overall score jumped significantly (e.g., from 50 to 80), a mandatory audit is triggered to check integrity.</p>
            </div>
          </div>
        </div>
      )
    },
    'slot-booking': {
      title: "PTE Slot Booking: Tips & Rescheduling Thresholds",
      subtitle: "Secure your desired date, test center location, and session time without errors.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            Booking slots for PTE Academic requires attention to administrative limits:
          </p>

          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-805">Important Slot Booking Advice</h4>
            <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-[11.5px] text-slate-600 font-semibold space-y-2">
              <p>• <strong>Advance booking:</strong> We recommend booking at least **2 to 3 weeks** in advance, especially for weekend time slots.</p>
              <p>• <strong>Payment details:</strong> Make sure your credit or debit card has "International Online Transactions" enabled before booking. Card declines can trigger account blocks.</p>
              <p>• <strong>Duplicate accounts risk:</strong> Do not create a second account if you lose your password. Doing so violates terms and results in cancellations of booked slots.</p>
            </div>
          </div>
        </div>
      )
    },
    preparation: {
      title: "PTE Preparation 2026: Expert Study Guide & Practice Routine",
      subtitle: "Implement structured study calendars and section tips to achieve a GSE score of 79+.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-655 font-semibold text-xs leading-relaxed">
            PTE Academic preparation depends heavily on understanding AI scoring triggers. Review our study schedules:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <strong className="text-slate-850 block mb-1 text-xs uppercase tracking-wide text-indigo-700">1-Month Intensive Plan</strong>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                For candidates who are already fluent in English. Focuses on test-taking strategies, time management templates, and taking daily mock tests under timed conditions.
              </p>
            </div>
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <strong className="text-slate-850 block mb-1 text-xs uppercase tracking-wide text-indigo-700">3-Month Gradual Plan</strong>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                For candidates who need to build foundational skills. Focuses on gradual vocabulary expansion, academic grammar drills, pronunciation flow, and regular weekly assessments.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-850">Daily Study Routine Example</h4>
            <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-100 space-y-2 text-[11px] text-slate-500 font-semibold">
              <p>• <strong>Morning:</strong> Read academic journal summaries and practice Speaking tasks (Describe Image, Repeat Sentence).</p>
              <p>• <strong>Afternoon:</strong> Work on Reading & Writing tasks (Summarize Written Text, Fill in the Blanks).</p>
              <p>• <strong>Evening:</strong> Take a Listening practice test and review mistake records.</p>
              <p>• <strong>Weekend:</strong> Attempt a full-length 2-hour mock test to build stamina.</p>
            </div>
          </div>
        </div>
      )
    }
  };

  const faqMap = {
    overview: [
      { q: "What is the PTE Academic exam for?", a: "It is a computer-based English proficiency test designed for study abroad admissions and immigration visa routes." },
      { q: "Is the PTE exam easier than IELTS?", a: "PTE is fully computer-delivered and graded by AI, which some find easier than speaking to a human examiner or writing essays by hand." },
      { q: "How much does PTE cost in India?", a: "The official registration fee for PTE Academic in India is ₹18,000 (including 18% GST)." }
    ],
    syllabus: [
      { q: "What are the new Speaking & Writing tasks in 2026?", a: "Pearson has introduced two tasks: 'Respond to a Situation' and 'Summarize Group Discussion' which evaluate classroom conversation skills." },
      { q: "Does PTE have negative marking?", a: "Certain task types (like Multiple Choice with Multiple Answers and Highlight Incorrect Words) use negative grading. Points are deducted for incorrect answers." }
    ],
    fees: [
      { q: "How do I avoid late booking surcharges?", a: "Register at least 48 hours prior to your target slot to avoid the ₹695 late surcharge fee." },
      { q: "What is the refund for cancellations?", a: "Cancellations made 14+ days before the test date receive a full refund. Cancellations made 7-14 days in advance receive a 50% partial refund." }
    ],
    dates: [
      { q: "How far in advance should I book my slot?", a: "We suggest booking 2 to 3 weeks early to secure weekend slots at your preferred test center." }
    ],
    registration: [
      { q: "What is the Surname Dot rule?", a: "If your passport has a blank surname field, you must enter a full stop (.) in the surname field during registration to avoid name mismatch errors." },
      { q: "What is the primary ID accepted for Indian candidates?", a: "A valid original physical passport is the only accepted identification. Aadhaar and PAN cards will be rejected at the center." }
    ],
    centres: [
      { q: "Are noise-canceling headsets provided at centers?", a: "Yes, Pearson-authorized test centers provide high-quality headsets to minimize classroom background noise." }
    ],
    results: [
      { q: "How long does it take to get PTE results?", a: "Most candidates receive their official scorecards within 24 to 48 hours of completing the test." },
      { q: "Can I request a score re-evaluation?", a: "Yes, you can request a re-evaluation within 14 days of result release. Only Speaking and Writing sections can be re-evaluated." }
    ],
    'slot-booking': [
      { q: "Can I change my test center after booking a slot?", a: "No, you must reschedule your appointment by paying a rescheduling fee based on your notice timeline buffer." }
    ],
    preparation: [
      { q: "What are the best prep books for PTE?", a: "The Official Guide to PTE Academic (Pearson) and PTE Practice Tests Plus (Pearson) are highly recommended study guides." }
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
          <Link to="/exams/pte" className="hover:text-indigo-650 transition-colors">Exams</Link>
          <ChevronRight size={12} />
          <span className="text-slate-650">PTE</span>
          <ChevronRight size={12} />
          <span className="text-slate-600">{sidebarLinks.find(l => l.key === pageKey)?.name || 'Detail'}</span>
        </div>

        {/* Title Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2rem] p-8 md:p-12 text-white overflow-hidden mb-10 shadow-lg border border-indigo-950">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest mb-4">
              <Compass size={12} />
              PTE Exam Suite
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
                        ? 'bg-indigo-50 text-indigo-655 shadow-sm shadow-indigo-100/50'
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
                  <h4 className="font-extrabold text-slate-805 text-sm mb-1">Preparing for PTE?</h4>
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
                        <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-655 inline-flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition-colors">
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

export default PTEDetailPage;
