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

const GMATDetailPage = ({ pageKey }) => {
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const sidebarLinks = [
    { name: 'GMAT Overview', path: '/exams/gmat/overview', key: 'overview', icon: Compass },
    { name: 'GMAT Syllabus', path: '/exams/gmat/syllabus', key: 'syllabus', icon: BookOpen },
    { name: 'GMAT Exam Fees', path: '/exams/gmat/fees', key: 'fees', icon: DollarSign },
    { name: 'GMAT Exam Dates', path: '/exams/gmat/dates', key: 'dates', icon: Calendar },
    { name: 'GMAT Registration', path: '/exams/gmat/registration', key: 'registration', icon: FileEdit },
    { name: 'GMAT Results', path: '/exams/gmat/results', key: 'results', icon: Award },
    { name: 'GMAT Preparation', path: '/exams/gmat/preparation', key: 'preparation', icon: ListTodo },
    { name: 'GMAT Sample Papers', path: '/exams/gmat/sample-papers', key: 'sample-papers', icon: FileText }
  ];

  // Rich contents dictionary for GMAT tabs
  const contentMap = {
    overview: {
      title: "GMAT Exam for Indian Students in 2025: A Complete Guide",
      subtitle: "The Graduate Management Admission Test (GMAT) Focus Edition is a computer-adaptive exam tailored for global business school admissions.",
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 border border-blue-150 p-5 rounded-2xl flex items-start gap-3.5">
            <Info className="text-[#DE5C2B] w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-blue-950 text-xs uppercase tracking-wider mb-1">GMAT Focus Edition Update</h4>
              <p className="text-xs text-blue-900 leading-relaxed font-semibold">
                GMAC has announced a shorter GMAT called GMAT Focus Edition. The old format (3 hour long test) is now discontinued. The new GMAT test is only 2 hours and 15 minutes long, features no analytical writing (AWA) section, and has introduced a new Data Insights section. The name "GMAT Focus Edition" has been reverted back to "GMAT Exam" now that there is only one edition in play.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
              1. What is the GMAT Exam?
            </h3>
            <p className="text-slate-650 font-semibold text-xs leading-relaxed">
              GMAT, or Graduate Management Admission Test, is a computer-adaptive test owned and operated by the Graduate Management Admission Council (GMAC).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 my-6">
              {[
                { title: "Duration", desc: "2 hours and 15 minutes long (with one optional 10-minute break)." },
                { title: "Tested Skills", desc: "Evaluates three core skills: Quantitative Reasoning, Verbal Reasoning, and Data Insights." },
                { title: "Modes of Delivery", desc: "Offered in two modes: online (at home) and offline (at test centres)." },
                { title: "Exam Type", desc: "Computer-adaptive test: adjusts question difficulty based on your performance." }
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
              Why Take the GMAT Exam?
            </h3>
            <div className="space-y-3">
              {[
                { title: "Popular B-School Entrance", desc: "GMAT is among the most popular entrance exams globally for management courses such as MBA and Master's in Management." },
                { title: "Top Global Credentials", desc: "A good GMAT score helps candidates stand out and gain admission to highly reputable business schools worldwide." },
                { title: "Academic Readiness", desc: "The exam provides universities a clear, standardized benchmark showing whether you are prepared for high-intensity graduate coursework." }
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
              <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
              2. GMAT Eligibility & Documents Required
            </h3>
            <p className="text-slate-650 font-semibold text-xs leading-relaxed">
              If you wish to appear for the GMAT exam, you must be at least 18 years old. There is no upper limit when it comes to age. GMAC has not set any other academic eligibility requirements, but individual business schools have their own admission benchmarks.
            </p>
            <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-[11px] text-slate-500 font-semibold leading-relaxed space-y-2">
              <p>• <strong>Work Experience:</strong> Typically, GMAT test takers are undergraduate students or professionals with 2+ years of work experience.</p>
              <p>• <strong>Primary Document:</strong> A valid passport is mandatory for identification on test day for Indian candidates, regardless of whether you take the test online or at a test centre.</p>
              <p>• <strong>Score Requirements:</strong> We recommend verifying the specific GMAT scores and document requirements on your target universities' program pages.</p>
            </div>
          </div>
        </div>
      )
    },
    syllabus: {
      title: "GMAT Exam Syllabus and Pattern 2024: Section-wise GMAT Format",
      subtitle: "The streamlined GMAT Focus Edition contains 3 core modules covering 50 sub-topics over a 2 hours and 15 minutes limit.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-650 font-semibold text-xs leading-relaxed">
            The new GMAT structure deals strictly with business readiness. The analytical writing (AWA) has been completely removed.
          </p>

          <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-6 shadow-sm">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-150">
                <tr>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Section</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Duration</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Questions</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Format Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Verbal Reasoning</td>
                  <td className="py-3.5 px-4">45 Minutes</td>
                  <td className="py-3.5 px-4">23 Questions</td>
                  <td className="py-3.5 px-4 text-slate-500">Reading Comprehension & Critical Reasoning. Sentence Correction removed.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Quantitative Reasoning</td>
                  <td className="py-3.5 px-4">45 Minutes</td>
                  <td className="py-3.5 px-4">21 Questions</td>
                  <td className="py-3.5 px-4 text-slate-500">Problem-Solving parts. Algebra & Arithmetic. No geometry, no calculator.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">Data Insights</td>
                  <td className="py-3.5 px-4">45 Minutes</td>
                  <td className="py-3.5 px-4">20 Questions</td>
                  <td className="py-3.5 px-4 text-slate-500">Multi-Source, Table Analysis, Graphics, Data Sufficiency. Calculator allowed.</td>
                </tr>
                <tr className="bg-indigo-50/20 font-bold">
                  <td className="py-3.5 px-4 text-slate-800">Total Exam</td>
                  <td className="py-3.5 px-4 text-indigo-700">2 Hours 15 Mins</td>
                  <td className="py-3.5 px-4">64 Questions</td>
                  <td className="py-3.5 px-4">Score Range: 205 - 805 (Ends in 5)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-5 pt-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
              Section-wise Details
            </h3>

            {/* Quant */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
              <h4 className="font-extrabold text-xs text-indigo-700 uppercase tracking-wide">1. Quantitative Reasoning (Math)</h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Measures foundational knowledge of algebraic and arithmetic concepts. Since geometry has been removed, the math section tests:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-slate-500">
                {["Arithmetic", "Algebra", "Probability", "Permutations & Combinations", "Ratio & Proportion", "Simple & Compound Interest", "Speed, Time & Distance", "Percentage & Average", "Number Properties", "Exponents & Functions", "Fractions & Decimals"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border border-slate-100 p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Verbal */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
              <h4 className="font-extrabold text-xs text-indigo-700 uppercase tracking-wide">2. Verbal Reasoning</h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Evaluates your ability to read and understand written materials, parse arguments, and evaluate logical flaws.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-slate-500">
                {["Critical Reasoning", "Reading Unseen Passages", "Subject-Verb Agreement", "Parallelism", "Misplaced Modifiers", "Logical Connections"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border border-slate-100 p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Data Insights */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
              <h4 className="font-extrabold text-xs text-indigo-700 uppercase tracking-wide">3. Data Insights</h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Tests your ability to analyze data, read tables/graphs/charts, and apply mathematical logic to real-time business decision scenarios.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-slate-500">
                {["Data Sufficiency", "Graphics Interpretation", "Table Analysis", "Two-part Analysis", "Multi-source Reasoning", "Information Synthesis"].map((t) => (
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
      title: "GMAT Exam Fees 2024 in India: Cancellation, Rescheduling Fees",
      subtitle: "Full pricing breakdown of standard fees, rescheduling brackets, and cancellation refunds in India.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-650 font-semibold text-xs leading-relaxed">
            The fee structure varies based on whether you book GMAT as a test center exam or an online exam. Check below for standard and cancellation brackets:
          </p>

          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-800">1. Base GMAT Exam Fee Breakdown</h4>
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-150">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Service</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Delivered at Test Center</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Delivered Online (At Home)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-805">GMAT Focus Edition Fee</td>
                    <td className="py-3 px-4">US$275 (~INR 22,953)</td>
                    <td className="py-3 px-4">US$300 (~INR 25,040)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-805">Additional Score Report</td>
                    <td className="py-3 px-4">US$35 each (~INR 2,900)</td>
                    <td className="py-3 px-4">US$35 each (~INR 2,900)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 font-bold italic mt-1">* Note: Conversion rates vary over time based on forex valuations.</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-800">2. Rescheduling & Cancellation Tariffs</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              If you cancel or reschedule too close to the exam appointment, you will receive a smaller refund and pay a higher service fee.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reschedule */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <h5 className="font-black text-xs text-indigo-750 mb-3 uppercase tracking-wider">Rescheduling Charges</h5>
                <ul className="space-y-2.5 text-[11px] font-bold text-slate-600">
                  <li className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>&gt; 60 Days Notice</span>
                    <span className="text-indigo-600">USD 55 (Center) / USD 60 (Online)</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>15 to 60 Days Notice</span>
                    <span className="text-indigo-600">USD 110 (Center) / USD 120 (Online)</span>
                  </li>
                  <li className="flex justify-between">
                    <span>14 Days or Less</span>
                    <span className="text-indigo-600">USD 165 (Center) / USD 180 (Online)</span>
                  </li>
                </ul>
              </div>

              {/* Cancellation */}
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <h5 className="font-black text-xs text-rose-750 mb-3 uppercase tracking-wider">Cancellation Refunds</h5>
                <ul className="space-y-2.5 text-[11px] font-bold text-slate-600">
                  <li className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>&gt; 60 Days Notice</span>
                    <span className="text-emerald-600">USD 110 (Center) / USD 120 (Online) Refund</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>15 to 60 Days Notice</span>
                    <span className="text-emerald-600">USD 80 (Center) / USD 90 (Online) Refund</span>
                  </li>
                  <li className="flex justify-between">
                    <span>14 Days or Less</span>
                    <span className="text-emerald-600">USD 55 (Center) / USD 60 (Online) Refund</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4.5 rounded-2xl text-[11px] text-amber-900 font-semibold leading-relaxed flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Critical:</strong> If you cancel your exam when there are less than 24 hours to go, none of your fee amount will be refunded and rescheduling is prohibited.
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
            <h4 className="text-sm font-black text-slate-800">3. Modes of Payment</h4>
            <p>You can use credit or debit cards to complete GMAT fee payments on MBA.com. Please remember:</p>
            <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-100 space-y-2 text-[11px]">
              <p>• Accepted card types include <strong>VISA, Mastercard, American Express, and Discover</strong> Network Cards.</p>
              <p>• Appointments are automatically cancelled if your credit or debit card is declined.</p>
              <p>• Using an unauthorized card will result in GMAT registration cancellation, invalidation of previous scores, and potential notifications to schools and law enforcement.</p>
            </div>
          </div>
        </div>
      )
    },
    dates: {
      title: "GMAT Exam Dates and Test Centres: City-wise List 2025",
      subtitle: "GMAT does not have a single fixed date list. Slots are available throughout the year at various test locations.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-650 font-semibold text-xs leading-relaxed">
            The online GMAT exam is open daily, 24 hours a day, providing ultimate scheduling flexibility. Physical test center slots depend entirely on local center calendars.
          </p>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
              GMAT Test Center Cities in India
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              India has numerous GMAT test centres spread across major cities. Choosing a center near you helps avoid travel fatigue on exam day:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {[
                { name: "Bangalore", region: "South" },
                { name: "Mumbai", region: "West" },
                { name: "Delhi NCR", region: "North" },
                { name: "Kolkata", region: "East" },
                { name: "Hyderabad", region: "South" },
                { name: "Pune", region: "West" },
                { name: "Bhubaneswar", region: "East" },
                { name: "Kerala (Kochi)", region: "South" },
                { name: "Jaipur", region: "West/North" },
                { name: "Noida", region: "North" }
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
            💡 <strong>Pro Prep Tip:</strong> We recommend booking at least two to three months in advance to secure your desired time, date, and preferred center. GMAT scores are valid for 5 years, so writing it early keeps you safe.
          </div>
        </div>
      )
    },
    registration: {
      title: "GMAT Registration 2024: How to Register for GMAT?",
      subtitle: "GMAT registration is a clean, 10-step online process. Learn how to sign up, select slots, and submit accommodation requests.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-650 font-semibold text-xs leading-relaxed">
            You can register for the GMAT starting 6 months before your target test date and up to 24 hours prior to a slot. Early booking is highly recommended.
          </p>

          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-850">10-Step GMAT Registration Process</h4>
            <div className="space-y-2 text-[11px] font-bold text-slate-500">
              {[
                "1. Create your account by visiting the official GMAT website (MBA.com) and logging in.",
                "2. Complete your profile details precisely matching the spelling in your valid passport.",
                "3. Select either Online or Test Center mode of delivery.",
                "4. Select up to 3 test center locations closest to you to compare availability.",
                "5. Choose your target date and available daily time slot.",
                "6. Select optional details like scheduling accommodations if applicable.",
                "7. Review registration details and test rules checklist.",
                "8. Complete registration payments using international debit/credit cards.",
                "9. Confirm receipt of your proctor booking confirmation email.",
                "10. Focus on your GMAT preparation and print confirmation logs for test day."
              ].map((step, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-850">Differently Abled Test Taker Accommodations</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              The GMAT offers custom testing setups to support differently-abled candidates, ensuring a fair and equitable testing environment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-600 font-semibold leading-relaxed">
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <span className="font-extrabold text-slate-800 text-xs block mb-1">Accommodation Request</span>
                Options include extended testing time, screen reader software support, sign language proctors, and auxiliary equipment. Submit this request during initial sign-up.
              </div>
              <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <span className="font-extrabold text-slate-800 text-xs block mb-1">Documentation Verification</span>
                You will be requested to submit official medical diagnosis logs validating your condition. GMAC maintains strict privacy and reviews reports within 3-4 weeks.
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-850">How to Choose GMAT Exam Centers?</h4>
            <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-[11px] text-slate-500 font-semibold leading-relaxed space-y-2">
              <p>• <strong>Location:</strong> Choose a center with minimal travel time to reduce test-day stress.</p>
              <p>• <strong>Facilities:</strong> Look for centers with silent rooms, comfortable workstations, and solid ventilation.</p>
              <p>• <strong>Reviews:</strong> Research logs and feedback from other candidates regarding check-in speed and staff behavior.</p>
            </div>
          </div>
        </div>
      )
    },
    results: {
      title: "GMAT Exam Result: Score Check, Scale & Free Score Reports",
      subtitle: "Learn how GMAT Focus score scales are structured, when results are sent, and how score reporting works.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-650 font-semibold text-xs leading-relaxed">
            The GMAT exam score report highlights individual performances on a standardized scale. Focus edition results are released extremely quickly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Score Validity</span>
              <span className="text-lg font-black text-slate-850">5 Years</span>
            </div>
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Score Scale</span>
              <span className="text-lg font-black text-indigo-600">205 - 805</span>
            </div>
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1">Delivery Time</span>
              <span className="text-lg font-black text-slate-850">3-5 Days</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-800">1. GMAT Focus Score Scales</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Unlike the classic GMAT, the new score scale ranges from 205 to 805. All focus scores end in 5 to separate them from the older version. Section scores are calculated in intervals of 1 point.
            </p>
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-sm my-3">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-150">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">GMAT Section</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Score Range</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Interval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4">Verbal Reasoning</td>
                    <td className="py-3 px-4">60 to 90</td>
                    <td className="py-3 px-4">1 point</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Quantitative Reasoning</td>
                    <td className="py-3 px-4">60 to 90</td>
                    <td className="py-3 px-4">1 point</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Data Insights</td>
                    <td className="py-3 px-4">60 to 90</td>
                    <td className="py-3 px-4">1 point</td>
                  </tr>
                  <tr className="bg-indigo-50/20 font-bold">
                    <td className="py-3 px-4 text-slate-805">Total Score</td>
                    <td className="py-3 px-4 text-indigo-700">205 to 805</td>
                    <td className="py-3 px-4">10 points</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-[11px] text-amber-905 font-semibold leading-relaxed">
              ⚠️ <strong>Penalty Rule:</strong> The new GMAT penalizes unanswered questions. It is essential to complete all sections of the exam, rather than leaving any answer box incomplete.
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-800">2. Sending Reports to B-Schools</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Your exam fee includes sending scores to up to <strong>5 universities free of charge</strong>. The process differs based on delivery format:
            </p>
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-150/60 text-[11px] text-slate-600 font-semibold leading-relaxed space-y-2">
              <p>• <strong>Online Exam:</strong> You'll receive an email notification once your score report is ready, after which you have 48 hours to select receivers for free.</p>
              <p>• <strong>Test Center:</strong> You select the 5 universities before you start the actual exam on the workstation terminal.</p>
            </div>
          </div>
        </div>
      )
    },
    preparation: {
      title: "GMAT Exam Preparation 2024: Section-wise Tips",
      subtitle: "Unlock score-maximizing strategies for Quantitative, Verbal, and Data Insights sections.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-650 font-semibold text-xs leading-relaxed">
            The GMAT tests analytics rather than memory. With dedicated study of 3 to 4 months, a high percentile is highly attainable. Explore the section-wise strategy cards:
          </p>

          <div className="space-y-5">
            {/* Verbal */}
            <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-2.5">
              <h4 className="font-black text-xs text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} />
                1. Verbal Reasoning Tips
              </h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                This section checks your reading comprehension and ability to evaluate structures of logic.
              </p>
              <ul className="list-disc list-inside text-[11.5px] text-slate-500 space-y-1 leading-relaxed font-semibold pl-1">
                <li>Work on your Reading Comprehension: Annotate key details, summarize paragraphs in your own words, and visualize complex passages.</li>
                <li>Critical Reasoning: Identify argument premises, conclusions, and evaluate evidence validity.</li>
                <li>Process of Elimination: Eliminate wrong choices first when multiple-choice options look similar.</li>
              </ul>
            </div>

            {/* Quant */}
            <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-2.5">
              <h4 className="font-black text-xs text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} />
                2. Quantitative Reasoning Tips
              </h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Focuses entirely on high school algebra and arithmetic concepts.
              </p>
              <ul className="list-disc list-inside text-[11.5px] text-slate-500 space-y-1 leading-relaxed font-semibold pl-1">
                <li>Solve, Don't Read: Quantitative math is built by writing out solutions, not reading guides.</li>
                <li>Data Sufficiency Focus: Master the specific format rules to avoid calculating the full solution.</li>
                <li>Improve Speed: Practice mental math shortcuts, and make an educated guess rather than getting stuck.</li>
              </ul>
            </div>

            {/* Data Insights */}
            <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 space-y-2.5">
              <h4 className="font-black text-xs text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} />
                3. Data Insights Tips
              </h4>
              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                Focuses on reading and parsing charts, tables, scatter plots, and graphs.
              </p>
              <ul className="list-disc list-inside text-[11.5px] text-slate-500 space-y-1 leading-relaxed font-semibold pl-1">
                <li>Understand Data Formats: Practice reading multi-source case structures, bubble charts, and tables.</li>
                <li>Focus on Details: Pay absolute attention to titles, axis labels, units of measure, and outliers.</li>
                <li>Relationship Mapping: Spot trends, correlations, and determine dependencies between parameters.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    'sample-papers': {
      title: "GMAT Practice Tests: Boost your Preparation!",
      subtitle: "Mock exams and practice papers are the most reliable way to benchmark your target scores.",
      content: (
        <div className="space-y-6">
          <p className="text-slate-650 font-semibold text-xs leading-relaxed">
            Using high-quality practice papers lets you adapt to the adaptive format, get used to the timing constraints, and track your metrics.
          </p>

          <div className="bg-indigo-50/10 rounded-2xl p-5 border border-indigo-150 space-y-3">
            <h4 className="font-black text-slate-800 text-xs">Top 5 GMAT Books for Preparation</h4>
            <p className="text-[11.5px] text-slate-500 leading-relaxed font-semibold">
              The following reference strategy guides represent the best guides for candidates seeking 655+ scores:
            </p>
            <div className="space-y-2">
              {[
                { title: "1. GMAT Official Guide (GMAC)", desc: "Contains 800+ real past GMAT questions and explanation keys directly from the makers." },
                { title: "2. Manhattan Prep Strategy Guides", desc: "Advanced conceptual books detailing algebra hacks and verbal logic structures." },
                { title: "3. Kaplan GMAT Prep Plus", desc: "Includes 6 comprehensive practice exams, study calendars, and diagnostic dashboards." },
                { title: "4. Veritas Prep GMAT Course Set", desc: "Focuses on analytical reasoning and advanced multi-source data insights tips." },
                { title: "5. GMAT Official Advanced Questions", desc: "Features the 300 hardest past questions to push score percentiles above 90%." }
              ].map((book, idx) => (
                <div key={idx} className="bg-white border border-slate-100 p-3.5 rounded-xl">
                  <span className="font-extrabold text-xs text-slate-800 block mb-0.5">{book.title}</span>
                  <span className="text-[11px] text-slate-400 font-bold block">{book.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-[11.5px] text-slate-600 font-semibold leading-relaxed">
            💡 <strong>Official Resources:</strong> We highly recommend utilizing the official GMAT Focus mock starter kit on <strong>MBA.com</strong>. It includes 2 free full-length adaptive practice tests utilizing standard GMAT algorithms.
          </div>
        </div>
      )
    }
  };

  const faqMap = {
    overview: [
      { q: "Is GMAT difficult?", a: "The GMAT is computer-adaptive, meaning questions adjust to your level. It is challenging because it tests logical analytics rather than simple recall. However, structured prep of 2-3 months is sufficient." },
      { q: "How long is the GMAT exam?", a: "The new GMAT Focus Edition lasts exactly 2 hours and 15 minutes plus an optional 10-minute break. This is a significant reduction from the old 3 hour format." },
      { q: "How soon can I retake the GMAT exam?", a: "You can retake the GMAT exam 16 days after your previous attempt. You can take the exam up to 5 times in a rolling 12-month period and 8 times in total." },
      { q: "Can I use a calculator during the GMAT exam?", a: "Calculators are strictly prohibited during the Quantitative Reasoning section. However, an on-screen calculator is provided during the Data Insights section." },
      { q: "Are there accommodations for GMAT test-takers with disabilities?", a: "Yes, GMAC offers special accommodations (extended time, screen reader compatibility, etc.) for differently-abled test takers. Requests must be submitted during registration with supporting medical documentation." }
    ],
    syllabus: [
      { q: "What is the GMAT Focus syllabus scope?", a: "The syllabus has 3 sections: Verbal Reasoning (Critical Reasoning & RC), Quantitative Reasoning (Arithmetic & Algebra), and Data Insights (Data Sufficiency, Tables, Graphics, Multi-source). Geometry and Sentence Correction are completely removed." },
      { q: "Does GMAT have negative marking?", a: "No, there is no direct negative marking, but GMAT penalizes unanswered questions. It is always better to make an educated guess than to leave a question blank." },
      { q: "Can I choose the section order in GMAT?", a: "Yes, you can choose which section (Quant, Verbal, or Data Insights) to begin with. This helps you maximize performance by tackling your strengths first." }
    ],
    fees: [
      { q: "Who is eligible for GMAT?", a: "Candidates must be at least 18 years old. Those aged 13-17 can take it with parental consent. There are no other strict educational or professional prerequisites." },
      { q: "Do I have to pay each time I take the GMAT?", a: "Yes, you must pay the full registration fee for each GMAT attempt." },
      { q: "Can I get a refund if I cancel my GMAT exam?", a: "Yes, you can receive a partial refund depending on how early you cancel. Notice of more than 60 days gives a maximum refund (USD 110-120). Cancellations less than 24 hours in advance receive no refund." }
    ],
    dates: [
      { q: "How are GMAT dates scheduled?", a: "For physical test centers, dates are available on most days of the week, but vary depending on center slots. For the online exam, dates are available daily around the clock." },
      { q: "How far in advance should I book my GMAT slot?", a: "We recommend booking at least 2 to 3 months in advance to lock in your preferred date, time slot, and physical test center location." }
    ],
    registration: [
      { q: "Can I change my test center after registering?", a: "Yes, but you will need to reschedule your appointment and pay the applicable rescheduling fee based on your notice period." },
      { q: "What documents do I need for GMAT registration?", a: "A valid passport is mandatory for identification for Indian candidates. The spelling of your name must match your passport exactly." }
    ],
    results: [
      { q: "How is the GMAT Focus score calculated?", a: "Scores range from 205 to 805. The three sections (Quant, Verbal, Data Insights) are scored from 60 to 90 and weighted equally in calculating your total score." },
      { q: "How long is a GMAT score valid?", a: "GMAT scores are valid for 5 years from your test date." },
      { q: "How do I send my GMAT scores to universities?", a: "You can send scores to up to 5 business schools free of charge. For test center exams, select them before starting. For online exams, select them within 48 hours of score availability." }
    ],
    preparation: [
      { q: "What is the best way to start GMAT preparation?", a: "Start by taking an official diagnostic practice test on MBA.com to evaluate your baseline score. Focus on reviewing basic arithmetic and algebra, followed by structured daily verbal practice." },
      { q: "How many hours should I study for GMAT?", a: "Most successful test takers study between 100 and 120 hours over a span of 2 to 3 months." }
    ],
    'sample-papers': [
      { q: "Where can I find reliable GMAT sample papers?", a: "Official practice tests on MBA.com are the most reliable, as they utilize past exam questions and the exact computer-adaptive algorithm used on test day." },
      { q: "Are GMAT practice tests adaptive?", a: "Yes, the official mock tests on MBA.com replicate the adaptive format where questions change in difficulty based on your accuracy." }
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
          <Link to="/exams/gmat" className="hover:text-indigo-650 transition-colors">Exams</Link>
          <ChevronRight size={12} />
          <span className="text-slate-650">GMAT</span>
          <ChevronRight size={12} />
          <span className="text-slate-600">{sidebarLinks.find(l => l.key === pageKey)?.name || 'Detail'}</span>
        </div>

        {/* Title Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest mb-4">
              GMAT Exam Reference Guide 2025
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
          <aside className="sticky top-28 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm max-h-[calc(100vh-140px)] overflow-y-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">GMAT Guide Index</p>
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
                  <h4 className="font-extrabold text-slate-805 text-sm mb-1">Preparing for GMAT?</h4>
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

            {/* Next Up section matching the reference style */}
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

export default GMATDetailPage;
