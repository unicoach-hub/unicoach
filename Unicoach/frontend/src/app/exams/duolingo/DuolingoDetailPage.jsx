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

const DuolingoDetailPage = ({ pageKey }) => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const sidebarLinks = [
    { name: 'Free Practice Test', path: '/exams/duolingo/practice-test', key: 'practice-test', icon: Sparkles },
    { name: 'Duolingo Overview', path: '/exams/duolingo/overview', key: 'overview', icon: Compass },
    { name: 'Duolingo Syllabus', path: '/exams/duolingo/syllabus', key: 'syllabus', icon: BookOpen },
    { name: 'Duolingo Exam Fees', path: '/exams/duolingo/fees', key: 'fees', icon: DollarSign },
    { name: 'Duolingo Registration', path: '/exams/duolingo/registration', key: 'registration', icon: FileEdit },
    { name: 'Duolingo Results', path: '/exams/duolingo/results', key: 'results', icon: Award },
    { name: 'Duolingo Preparation', path: '/exams/duolingo/preparation', key: 'preparation', icon: ListTodo },
    { name: 'Duolingo Sample Questions', path: '/exams/duolingo/sample-questions', key: 'sample-questions', icon: HelpCircle }
  ];

  const contentMap = {
    overview: {
      title: "Duolingo English Test (DET) 2026: General Guide",
      subtitle: "Evaluate your reading, writing, listening, and speaking skills under an online-from-home adaptive exam.",
      content: (
        <div className="space-y-6 text-xs md:text-sm">
          <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl flex items-start gap-3">
            <Info className="text-indigo-655 w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider mb-1">DET Overview & Key Advantage</h4>
              <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                At Rs. 6,499 ($70), the DET is about three times cheaper than IELTS or TOEFL. Certified results are returned to your account in 48 hours, and you can share them with an unlimited number of universities at zero extra cost.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-black text-slate-900">Why are Indian students choosing Duolingo?</h3>
            <p className="text-slate-655 font-semibold leading-relaxed">
              India makes up the largest test-taking population globally. Launched by Duolingo in 2016, the exam is highly convenient: it takes approximately 60 minutes and is completed entirely online from home, saving you test center travel and waiting time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Worldwide Acceptance", desc: "Over 6,000 universities accept DET, including 95% of US News Top 100 colleges." },
              { title: "Convenience Focused", desc: "Take the exam at any time (e.g. 11 PM on a Saturday) in any quiet room." },
              { title: "Adaptive Mechanics", desc: "Test adaptively scales question difficulty to pinpoint your exact English level." },
              { title: "Two-Day Certified Results", desc: "Get officially certified score reports in 48 hours (or 12 hours with Fast Track)." }
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
      title: "Duolingo English Test Pattern & Syllabus 2026",
      subtitle: "Full breakdown of section formats, question types, and scoring modules.",
      content: (
        <div className="space-y-6 text-xs md:text-sm">
          <p className="text-slate-655 font-semibold leading-relaxed">
            The DET is a 60-minute adaptive exam consisting of three key sections:
          </p>

          {/* Section Summary Table */}
          <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Section</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Timing Limit</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-500">Focus / Requirements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-xs">
                <tr>
                  <td className="py-3 px-4 font-black">Section 1: Setup & Onboarding</td>
                  <td className="py-3 px-4">5 Minutes</td>
                  <td className="py-3 px-4">Verify photo ID (Passport/Aadhaar), check webcam & microphone, room scan.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-black">Section 2: Adaptive Test</td>
                  <td className="py-3 px-4">45 Minutes</td>
                  <td className="py-3 px-4">~52 scored questions. AI-driven adaptive difficulty.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-black">Section 3: Writing & Speaking Sample</td>
                  <td className="py-3 px-4">10 Minutes</td>
                  <td className="py-3 px-4">Unscored essay & recorded video response sent directly to universities.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Core Adaptive Questions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-black text-slate-900">Types of Questions in the Adaptive Test</h3>
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Question Type</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">What It Tests</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Frequency (Approx.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                  {[
                    { type: "Read and Select", test: "Ability to recognize real English words from fake ones", freq: "15-18 times" },
                    { type: "Read and Complete", test: "Skill to fill in missing letters in sentences", freq: "3-6 times" },
                    { type: "Read Aloud", test: "Pronunciation and fluency in speaking written sentences", freq: "3-6 times" },
                    { type: "Fill in the Blanks", test: "Vocabulary and spelling accuracy", freq: "6-9 times" },
                    { type: "Listen and Type", test: "Listening comprehension and accuracy in typing what you hear", freq: "6-9 times" },
                    { type: "Write About the Photo", test: "Ability to describe an image using correct grammar", freq: "3 times" },
                    { type: "Speak About the Photo", test: "Ability to describe images verbally and fluently", freq: "1 time" },
                    { type: "Listen, then Speak", test: "Conversational ability after hearing an audio clip", freq: "2 times" },
                    { type: "Read, then Speak", test: "Spoken fluency on a given topic after reading a prompt", freq: "1 time" },
                    { type: "Interactive Writing", test: "Ability to expand or elaborate on an initial written response", freq: "1 time" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-black">{row.type}</td>
                      <td className="py-3 px-4 text-slate-500 font-semibold">{row.test}</td>
                      <td className="py-3 px-4 text-slate-800 font-black text-center">{row.freq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Reading */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-black text-slate-900">Interactive Reading Section</h3>
            <p className="text-slate-655 font-semibold">Evaluates reading comprehension and academic literacy through short passages:</p>
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Question Type</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">What It Tests</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Frequency (Approx.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                  {[
                    { type: "Complete the Sentences", test: "Choose the best word to fill in the blanks based on context", freq: "2 times" },
                    { type: "Complete the Passage", test: "Connect two passages logically with a suitable sentence", freq: "2 times" },
                    { type: "Highlight the Answer", test: "Identify the correct line or phrase that answers the question", freq: "4 times" },
                    { type: "Identify the Idea", test: "Summarise the passage with a concise statement", freq: "2 times" },
                    { type: "Title the Passage", test: "Identify the most appropriate title for the passage", freq: "2 times" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-black">{row.type}</td>
                      <td className="py-3 px-4 text-slate-500 font-semibold">{row.test}</td>
                      <td className="py-3 px-4 text-slate-800 font-black text-center">{row.freq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Listening */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-black text-slate-900">Interactive Listening Section</h3>
            <p className="text-slate-655 font-semibold">Measures conversational English in academic and real-life scenarios:</p>
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Question Type</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">What It Tests</th>
                    <th className="py-3 px-4 text-xs font-black text-slate-500">Frequency (Approx.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                  <tr>
                    <td className="py-3 px-4 font-black">Listen and Respond</td>
                    <td className="py-3 px-4 text-slate-500">Select the most appropriate conversational response after hearing a clip</td>
                    <td className="py-3 px-4 text-slate-800 font-black text-center">10 times</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-black">Summarise the Conversation</td>
                    <td className="py-3 px-4 text-slate-500">Write a short summary text describing what you just heard</td>
                    <td className="py-3 px-4 text-slate-800 font-black text-center">2 times</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Writing and Speaking Sample */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-black text-slate-900">Writing & Speaking Sample</h3>
            <p className="text-slate-655 font-semibold">Evaluates your productive output and self-expression capability:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-100 p-5 rounded-2xl bg-slate-50/30">
                <span className="font-black text-xs text-slate-800">Speaking Sample (Video)</span>
                <p className="text-slate-500 text-[11px] leading-relaxed mt-1">Given a prompt. 30 seconds preparation, then 3 minutes of recorded spoken response. Aim to speak for at least 1 minute.</p>
              </div>
              <div className="border border-slate-100 p-5 rounded-2xl bg-slate-50/30">
                <span className="font-black text-xs text-slate-800">Writing Sample (Essay)</span>
                <p className="text-slate-500 text-[11px] leading-relaxed mt-1">Given a prompt. 3 to 5 minutes to write an essay response. You must write at least 50 words.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    fees: {
      title: "Duolingo English Test Fees 2026: Cost Mappings for Indians",
      subtitle: "Detailed price grid comparison, payment methods, and waivers.",
      content: (
        <div className="space-y-6 text-xs md:text-sm text-slate-700 font-normal">
          <p className="text-slate-600 font-normal leading-relaxed">
            The DET base test fee is <strong className="font-semibold text-slate-900">$70 (~Rs. 6,192)</strong> based on reference exchange rate of 1 USD = Rs. 88.46. Sharing score reports is completely free and unlimited. Below is the updated pricing schedule:
          </p>

          <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-xs">
                <tr>
                  <th className="py-3.5 px-4 text-xs font-semibold text-slate-500">Fee Option</th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-slate-500">Cost (USD)</th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-slate-500">Cost (INR Approx.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-slate-700 text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-900">Single Test</td>
                  <td className="py-3.5 px-4 text-slate-600">$70</td>
                  <td className="py-3.5 px-4 font-semibold text-indigo-600">Rs. 6,192</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-900">Two-Test Bundle (Recommended)</td>
                  <td className="py-3.5 px-4 text-slate-600">$118</td>
                  <td className="py-3.5 px-4 font-semibold text-indigo-600">Rs. 10,427</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-900">Fast Results Add-On (12-hour delivery)</td>
                  <td className="py-3.5 px-4 text-slate-600">$40</td>
                  <td className="py-3.5 px-4 font-semibold text-indigo-600">Rs. 3,538</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-100 p-4.5 rounded-2xl bg-slate-50/30">
              <h4 className="font-black text-slate-800 text-xs mb-1">What is Included:</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                One-hour online exam access within 21 days of purchase, unlimited score sending, 1 official mock practice test, results in 48 hours.
              </p>
            </div>
            <div className="border border-slate-100 p-4.5 rounded-2xl bg-slate-50/30">
              <h4 className="font-black text-slate-800 text-xs mb-1">What is NOT Included:</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Fast track express processing and refunds for missed, expired, or proctor-voided tests.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-base font-black text-slate-900">Payment Methods & Guidelines</h3>
            <p className="text-slate-655 font-semibold">Payments are processed in USD via secure gateways on Duolingo's website.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <span className="font-black text-xs text-slate-850">Accepted Methods:</span>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Visa, Mastercard, American Express, Discover, PayPal, Alipay.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <span className="font-black text-xs text-slate-850">Not Supported:</span>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">UPI, net banking, direct bank transfers, or cash.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-black text-slate-900">Rescheduling & Cancellations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4.5 rounded-2xl border border-slate-100 bg-slate-50/30">
                <h4 className="font-black text-slate-800 text-xs mb-1">No Rescheduling fees</h4>
                <p className="text-[11px] text-slate-550 leading-relaxed">You can take the test at any time within 21 days of purchase. No scheduling or booking of slots is required.</p>
              </div>
              <div className="p-4.5 rounded-2xl border border-slate-100 bg-slate-50/30">
                <h4 className="font-black text-slate-800 text-xs mb-1">Cancellation Policy</h4>
                <p className="text-[11px] text-slate-550 leading-relaxed">No refunds for unused or expired tests. Refunds are only issued for verified technical issues on Duolingo's end.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    registration: {
      title: "How to Register and Take DET from India",
      subtitle: "Document verification rules and system requirements checklist.",
      content: (
        <div className="space-y-6 text-xs md:text-sm font-semibold text-slate-700">
          <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-500">Requirement</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-500">Specification / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655 text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-black text-slate-800">Valid ID</td>
                  <td className="py-3.5 px-4">Passport, national ID, or driver's license. Aadhaar card is fully accepted in India.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black text-slate-800">Computer setup</td>
                  <td className="py-3.5 px-4">Laptop or desktop with webcam, speakers, microphone. Tablets and phones are not supported.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black text-slate-800">Secondary camera</td>
                  <td className="py-3.5 px-4">Smartphone is required. You scan a QR code to position it to record your workspace and screen.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black text-slate-800">Test Room</td>
                  <td className="py-3.5 px-4">Quiet, well-lit private room. No headphones are allowed. No other person may enter.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-black text-slate-800">International Card</td>
                  <td className="py-3.5 px-4">Visa, Mastercard, or AMEX. UPI is not supported. Enable international transaction rights.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-amber-50/50 border border-amber-100 text-[11px] font-bold text-amber-800 rounded-xl">
            <strong>Proctoring Warning:</strong> Many tests fail certification because of background tools. Restart your laptop before testing and close all communication/sync tools (WhatsApp Web, Telegram, cloud sync, etc.).
          </div>
        </div>
      )
    },
    results: {
      title: "DET Scores and University Expectations",
      subtitle: "Overview of score scale and IELTS equivalency shifts.",
      content: (
        <div className="space-y-6 text-xs md:text-sm">
          <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl flex items-start gap-3">
            <Info className="text-amber-850 w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider mb-1">Important Score Mismatch Warning</h4>
              <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                In early 2025, Duolingo updated its score equivalency table. Previously, DET 125 converted to IELTS 7.5; it now converts to approximately IELTS 6.5. If your university admissions page still lists old matches, contact them directly.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900">Score Benchmarks</h3>
            <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-3.5 px-4 text-xs font-black text-slate-500">Program Level</th>
                    <th className="py-3.5 px-4 text-xs font-black text-slate-500">Typical DET score expectation</th>
                    <th className="py-3.5 px-4 text-xs font-black text-slate-500">Approx. IELTS Equivalent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-xs">
                  <tr>
                    <td className="py-3.5 px-4">Foundation / Pathway</td>
                    <td className="py-3.5 px-4">85 to 95</td>
                    <td className="py-3.5 px-4 text-slate-500">5.0 to 5.5</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4">Undergraduate (UG)</td>
                    <td className="py-3.5 px-4">100 to 115</td>
                    <td className="py-3.5 px-4 text-slate-500">5.5 to 6.0</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4">Postgraduate (PG)</td>
                    <td className="py-3.5 px-4">115 to 125</td>
                    <td className="py-3.5 px-4 text-slate-500">6.0 to 6.5</td>
                  </tr>
                  <tr className="bg-indigo-50/20 font-black">
                    <td className="py-3.5 px-4 text-indigo-700">Competitive / Ivy League</td>
                    <td className="py-3.5 px-4 text-indigo-700">125 to 135+</td>
                    <td className="py-3.5 px-4 text-indigo-700">7.0+</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    },
    preparation: {
      title: "How to Prepare for the Duolingo English Test (DET) 2026",
      subtitle: "Section-specific study plans, daily schedules, and recommended practice resources.",
      content: (
        <div className="space-y-6 text-xs md:text-sm font-semibold text-slate-700">
          <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl flex items-start gap-3">
            <Sparkles className="text-indigo-650 w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider mb-1">DET Prep Strategy Overview</h4>
              <p className="text-slate-655 text-xs font-semibold leading-relaxed">
                Because Duolingo is an adaptive test, your success relies on quick, spontaneous communication. Begin by taking the free practice test on the official site to find your benchmark score, then focus your prep on low-scoring subscales (usually Production).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900">Section-Wise Prep Strategies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4.5 border border-slate-100 rounded-xl bg-slate-50/20">
                <span className="font-black text-xs text-slate-800 flex items-center gap-1.5 mb-1.5">
                  🎙️ Speaking Section
                </span>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Record yourself answering random prompts, replay to catch pauses or pronunciation slips. Mimic dialogue flows from podcasts to enhance coherence. Focus on a clear, structured pace.
                </p>
              </div>

              <div className="p-4.5 border border-slate-100 rounded-xl bg-slate-50/20">
                <span className="font-black text-xs text-slate-800 flex items-center gap-1.5 mb-1.5">
                  ✍️ Writing Section
                </span>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Practice typing daily on your laptop (target 40-60 WPM using keybr.com). Write daily summaries of read articles, and participate in discussion threads on Reddit or Quora to refine sentence styling.
                </p>
              </div>

              <div className="p-4.5 border border-slate-100 rounded-xl bg-slate-50/20">
                <span className="font-black text-xs text-slate-800 flex items-center gap-1.5 mb-1.5">
                  📖 Reading Section
                </span>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Read news outlets like BBC, Reuters, or The Guardian. Work on synonym drills to expand vocabulary, and practice identifying main themes and connecting ideas in text blocks.
                </p>
              </div>

              <div className="p-4.5 border border-slate-100 rounded-xl bg-slate-50/20">
                <span className="font-black text-xs text-slate-800 flex items-center gap-1.5 mb-1.5">
                  🎧 Listening Section
                </span>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Expose yourself to diverse accents (American, British, Australian) by watching documentaries and podcasts. Summarise spoken clips to practice active listening.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-base font-black text-slate-900">Suggested Daily Study Routine</h3>
            <p className="text-slate-655 font-semibold">Dedicate 45 to 60 minutes daily using this weekly structure:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/30">
                <span className="font-black text-xs text-slate-800 block mb-1">Days 1 - 3</span>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">Vocabulary expansion drills and active listening tests.</p>
              </div>
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/30">
                <span className="font-black text-xs text-slate-800 block mb-1">Days 4 - 6</span>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">Contextual reading comprehension and timed typing/essay writing.</p>
              </div>
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/30">
                <span className="font-black text-xs text-slate-800 block mb-1">Day 7</span>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">Full-length adaptive mock test followed by detailed review.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-base font-black text-slate-900">Recommended Preparation Resources</h3>
            <ul className="list-disc pl-5 text-xs font-semibold text-slate-600 space-y-1">
              <li><strong>Official DET website:</strong> Unlimited free practice tests.</li>
              <li><strong>Apps:</strong> BBC Learning English, ELSA Speak, Grammarly.</li>
              <li><strong>Communities:</strong> Reddit's r/duolingo and UniCoach community forums.</li>
            </ul>
          </div>
        </div>
      )
    },
    "sample-questions": {
      title: "Duolingo English Test Sample Questions & Answers",
      subtitle: "Practice with high-scoring model answers mapped to 2026 guidelines.",
      content: (
        <div className="space-y-6 text-xs md:text-sm font-semibold text-slate-700">
          <p className="text-slate-655 font-semibold">
            Below are verified sample prompts and corresponding expert responses to help benchmark your preparation.
          </p>

          <div className="space-y-5">
            {/* Speaking Sample */}
            <div className="p-5 border border-slate-150 rounded-2xl bg-slate-50/30 space-y-3">
              <span className="inline-block bg-indigo-100 text-indigo-850 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">
                🎙️ Speaking Prompt (Model Response)
              </span>
              <p className="text-slate-800 font-black text-xs">
                "Describe a journey or travel experience you took that was highly memorable to you."
              </p>
              <div className="p-4 bg-white border border-slate-100 rounded-xl text-[11px] leading-relaxed text-slate-550 space-y-2">
                <p>
                  "A particularly memorable journey I took was a trip to the mountain regions of Himachal Pradesh two years ago. I traveled by train to the foothills and then completed the rest of the journey by local bus along winding mountain paths. The views of the towering pine forests and snow-capped peaks were absolutely breathtaking."
                </p>
                <p>
                  "What made this trip stand out was getting to interact with the local communities. They shared stories about their traditional lifestyles, their food, and how they navigate winters. It was a refreshing contrast to busy city environments and deepened my appreciation for quiet, rural spaces."
                </p>
              </div>
            </div>

            {/* Writing Sample */}
            <div className="p-5 border border-slate-150 rounded-2xl bg-slate-50/30 space-y-3">
              <span className="inline-block bg-teal-100 text-teal-850 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">
                ✍️ Writing Prompt (Model Response)
              </span>
              <p className="text-slate-800 font-black text-xs">
                "Some people believe that university education should be completely free for everyone. Do you agree or disagree?"
              </p>
              <div className="p-4 bg-white border border-slate-100 rounded-xl text-[11px] leading-relaxed text-slate-550 space-y-2">
                <p>
                  "I strongly agree that university education should be accessible to all students without the burden of high tuition fees. Offering free higher education ensures that talented individuals from all financial backgrounds have equal opportunities to build successful professional careers, thereby contributing to national economic growth."
                </p>
                <p>
                  "While funding these programs requires significant government investment, the long-term benefits of a highly educated workforce—such as innovation, reduced unemployment, and higher overall tax revenue—far outweigh the initial costs. Education should be treated as a public good rather than a commercial privilege."
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const activeContent = contentMap[pageKey] || contentMap.overview;

  const faqs = [
    { q: "Is Duolingo accepted for Canada study permits?", a: "Yes. Duolingo is accepted for general study permits in Canada. However, please note that the Student Direct Stream (SDS) was discontinued in late 2024, so standard visa processing rules apply to all applicants now." },
    { q: "What should I do if my test is not certified?", a: "If your test is flagged for a technical or proctoring violation (e.g. background apps, webcam glare, phone camera slip), you have 72 hours to submit one official appeal. A decision will be sent within 4 business days." },
    { q: "Can I take the test on a phone or tablet?", a: "No. The DET secure browser must be downloaded and run on a desktop or laptop. Your smartphone is only used as a secondary recording camera during the test." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-655 transition-colors">Home</Link>
          <ChevronRight size={12} className="text-slate-450" />
          <Link to="/exams/duolingo" className="hover:text-indigo-655 transition-colors">Duolingo</Link>
          <ChevronRight size={12} className="text-slate-450" />
          <span className="text-slate-600 font-black">{sidebarLinks.find(l => l.key === pageKey)?.name || "Details"}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-2">
            <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-4 px-3">Duolingo Directory</span>
              <div className="space-y-1">
                {sidebarLinks.map((link, idx) => {
                  const IconComp = link.icon;
                  const isActive = pageKey === link.key;
                  return (
                    <button
                      key={idx}
                      onClick={() => navigate(link.path)}
                      className={`w-full py-3 px-4 rounded-xl font-medium text-xs flex items-center gap-3 transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-50'
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
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{activeContent.title}</h1>
              <p className="text-slate-500 text-xs md:text-sm font-normal mt-2 mb-8 leading-relaxed">{activeContent.subtitle}</p>
              
              <div className="border-t border-slate-100 pt-8">
                {activeContent.content}
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 md:p-12 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <HelpCircle className="text-indigo-650" size={18} />
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

export default DuolingoDetailPage;
