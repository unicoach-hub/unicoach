import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Volume2,
  FileEdit,
  Mic,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  FileDown
} from 'lucide-react';

const IELTSDetailPage = ({ pageKey }) => {
  const location = useLocation();

  const sidebarLinks = [
    { name: 'IELTS Overview', path: '/exams/ielts/overview', key: 'overview' },
    { name: 'IELTS Types', path: '/exams/ielts/types', key: 'types' },
    { name: 'IELTS Eligibility', path: '/exams/ielts/eligibility', key: 'eligibility' },
    { name: 'IELTS Exam Fees', path: '/exams/ielts/fees', key: 'fees' },
    { name: 'IELTS Dates', path: '/exams/ielts/dates', key: 'dates' },
    { name: 'IELTS Registration', path: '/exams/ielts/registration', key: 'registration' },
    { name: 'IELTS Slot Booking', path: '/exams/ielts/slot-booking', key: 'slot-booking' },
    { name: 'IELTS Coaching Centres', path: '/exams/ielts/coaching-centres', key: 'coaching-centres' },
    { name: 'IELTS Results', path: '/exams/ielts/results', key: 'results' },
    { name: 'IELTS Listening', path: '/exams/ielts/listening', key: 'listening' },
    { name: 'IELTS Reading', path: '/exams/ielts/reading', key: 'reading' },
    { name: 'IELTS Writing', path: '/exams/ielts/writing', key: 'writing' },
    { name: 'IELTS Speaking', path: '/exams/ielts/speaking', key: 'speaking' },
  ];

  // Rich contents dictionary for all 13 pages
  const contentMap = {
    overview: {
      title: "IELTS Overview: Ultimate Guide for Study Abroad Aspirants",
      subtitle: "The world's most trusted English proficiency test accepted by 12,000+ universities.",
      content: (
        <div className="space-y-6">
          <p>
            The <strong>International English Language Testing System (IELTS)</strong> is globally recognized as the gold standard for measuring English language proficiency for study, work, and migration purposes. Under the joint ownership of IDP and Cambridge English, it tests Listening, Reading, Writing, and Speaking skills.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="border border-slate-100 p-5 rounded-2xl bg-slate-50/50">
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">Global Acceptance</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Accepted by 12,000+ organizations in over 150 countries, including top colleges in USA, UK, Canada, Australia, and New Zealand.
              </p>
            </div>
            <div className="border border-slate-100 p-5 rounded-2xl bg-slate-50/50">
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">Test Formats</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Available in both Paper-based and Computer-delivered modes at registered test centres worldwide.
              </p>
            </div>
          </div>
          <p>
            With over 3.5 million test-takers every year, IELTS plays a pivotal role in shaping international careers. Universities look at the band scores (0–9 scale) to ensure students can handle the academic lectures, research projects, and interactive seminars in an English-speaking country.
          </p>
        </div>
      )
    },
    types: {
      title: "IELTS Types: Academic, General Training & UKVI",
      subtitle: "Understand which IELTS exam format is required for your specific goals.",
      content: (
        <div className="space-y-6">
          <p>
            IELTS offers different modules tailored to different profiles. Selecting the correct type of test is crucial for a successful application:
          </p>
          <div className="overflow-x-auto border border-slate-100 rounded-xl my-6">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Test Type</th>
                  <th className="py-3 px-4">Primary Purpose</th>
                  <th className="py-3 px-4">Format Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">IELTS Academic</td>
                  <td className="py-3.5 px-4">Undergraduate, Postgraduate, and Professional Registration.</td>
                  <td className="py-3.5 px-4">Complex academic charts in Writing & college-level passages in Reading.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">IELTS General Training</td>
                  <td className="py-3.5 px-4">Immigration, Work visas, or below degree level training.</td>
                  <td className="py-3.5 px-4">Everyday English, workplace texts, letter writing tasks.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-800">IELTS UKVI</td>
                  <td className="py-3.5 px-4">UK visas, student route, or migration requirements.</td>
                  <td className="py-3.5 px-4">Taken at secure, UKVI-approved centers with identical test content.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Unless your university states otherwise, study abroad applicants must opt for <strong>IELTS Academic</strong>. The UKVI version is identical in structure and score levels but is mandatory for specific UK visa routes requiring secure testing.
          </p>
        </div>
      )
    },
    eligibility: {
      title: "IELTS Eligibility Criteria for Candidates in 2025",
      subtitle: "Know the age guidelines, passport mandates, and academic limits.",
      content: (
        <div className="space-y-6">
          <p>
            The IELTS test is highly inclusive, with minimal restrictions. However, to maintain strict security, IDP enforces the following requirements:
          </p>
          <div className="space-y-4 my-6">
            <div className="flex gap-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
              <AlertTriangle className="text-amber-600 flex-shrink-0 w-6 h-6" />
              <div>
                <h4 className="font-extrabold text-slate-805 text-sm mb-1">Strict Passport Policy ("No Passport, No Exam")</h4>
                <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                  You MUST bring your physical, original, and valid passport to the exam centre. Copies, Aadhaar cards, PAN cards, or digital IDs are strictly not accepted.
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3 text-xs text-slate-500 font-semibold">
              <p>🎯 <strong className="text-slate-800">Age Limit:</strong> Candidates must be at least 16 years old. If you are under 18, a guardian's consent form is required during slot booking.</p>
              <p>🎓 <strong className="text-slate-800">Academic Qualification:</strong> There are no minimum academic requirements to sit for IELTS. Anyone seeking global education can apply.</p>
              <p>🔄 <strong className="text-slate-800">Attempt Limit:</strong> You can attempt the test as many times as you like. There is no restriction on retakes.</p>
            </div>
          </div>
        </div>
      )
    },
    fees: {
      title: "IELTS Exam Fees Structure in India",
      subtitle: "Updated registration base fees, retake costs, and rescheduling charges.",
      content: (
        <div className="space-y-6">
          <p>
            The fees for registerting for the IELTS exam in India vary depending on the format you select. The base registration fee applies to both pen-and-paper and computer-delivered tests:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Academic / GT</p>
              <p className="text-lg font-black text-slate-850">INR 18,000</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">IELTS UKVI</p>
              <p className="text-lg font-black text-slate-850">INR 18,250</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Life Skills</p>
              <p className="text-lg font-black text-slate-850">INR 17,000</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">One Skill Retake</p>
              <p className="text-lg font-black text-slate-850">INR 12,000</p>
            </div>
          </div>
          <p>
            <strong>Rescheduling Policy:</strong> You must request rescheduling at least 5 weeks before the test date. Rescheduling or cancellation within 5 weeks of the test results in no refund unless there is a valid medical emergency document.
          </p>
        </div>
      )
    },
    dates: {
      title: "IELTS Exam Dates & Booking Schedules",
      subtitle: "Learn how to choose the optimal date based on university intakes.",
      content: (
        <div className="space-y-6">
          <p>
            Vite slots for computer-delivered tests are available nearly every day, while paper-based dates are limited to 4 times a month.
          </p>
          <div className="bg-indigo-50/40 border border-indigo-150 p-5 rounded-2xl space-y-3 font-semibold text-sm">
            <h4 className="font-extrabold text-slate-850">Quick Guide: How to choose your date</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We recommend choosing a date that is at least 3-6 months before your target university application deadline. This leaves enough room for scheduling retakes if required or preparing visa materials early.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              High-demand months in India are January to March (Fall deadlines) and June to August. Booking 1 month in advance is highly recommended.
            </p>
          </div>
        </div>
      )
    },
    registration: {
      title: "How to Register for the IELTS Exam: Step-by-Step",
      subtitle: "A detailed walkthrough on booking your test slot on the IDP portal.",
      content: (
        <div className="space-y-6">
          <p>
            Registering for IELTS is a simple online process conducted through the IDP registration website. Follow these steps:
          </p>
          <div className="space-y-3.5 text-xs text-slate-500 font-semibold my-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-black text-indigo-600 block mb-1">Step 1: Select Format</span>
              Choose between Computer-delivered or Paper-based test, and select either IELTS Academic or General Training.
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-black text-indigo-600 block mb-1">Step 2: Choose Centre & Date</span>
              Search from 82 test cities in India and pick your preferred time slot and test venue.
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-black text-indigo-600 block mb-1">Step 3: Fill Details & Upload Passport</span>
              Fill in your personal information and upload a clear, scanned copy of your valid passport pages.
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-black text-indigo-600 block mb-1">Step 4: Complete Payment</span>
              Pay the registration fee of INR 18,000 online using Credit/Debit cards or Net Banking. Keep the email confirmation safe.
            </div>
          </div>
        </div>
      )
    },
    'slot-booking': {
      title: "IELTS Slot Booking Tips & Guidelines",
      subtitle: "Maximize your chances of booking a convenient time slot and test centre.",
      content: (
        <div className="space-y-6">
          <p>
            Booking your slot early is critical to secure your preferred date and venue. Note the following recommendations:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs text-slate-500 pl-2 font-semibold">
            <li><strong>Select speaking dates early:</strong> Speaking slots can be booked up to 7 days before or after the main exam. Select your speaking slot early to align with your preparation schedule.</li>
            <li><strong>Rescheduling slots:</strong> Rescheduling is allowed by paying a processing fee. Requests must be made via the IDP portal.</li>
            <li><strong>Peak Season slots:</strong> Slots during January-March get filled fast. Try booking at least 3-4 weeks in advance.</li>
          </ul>
        </div>
      )
    },
    'coaching-centres': {
      title: "IELTS Coaching Centres & Preparation Venues",
      subtitle: "Evaluate physical study centers against our structured online preparation.",
      content: (
        <div className="space-y-6">
          <p>
            IDP operates in 82 test centres across 75 Indian cities. If you require coaching, choosing a structure that provides regular diagnostic test assessments is key.
          </p>
          <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 flex gap-4 my-6">
            <CheckCircle2 className="text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">UniCoach Online Coaching Advantages</h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1 font-semibold">
                Our classes offer certified trainers, small batch size options for personalized attention, daily practice drills, and live mock test assessments with estimated band updates.
              </p>
            </div>
          </div>
        </div>
      )
    },
    results: {
      title: "IELTS Results & Test Report Form (TRF)",
      subtitle: "Detailed timelines for receiving results and ordering additional TRFs.",
      content: (
        <div className="space-y-6">
          <p>
            Once you complete the exam, results will be generated based on the delivery format:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50">
              <span className="text-xs font-black text-slate-400 block mb-1">Computer-Based IELTS</span>
              <p className="font-black text-slate-850">3 to 5 Days</p>
            </div>
            <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50">
              <span className="text-xs font-black text-slate-400 block mb-1">Paper-Based IELTS</span>
              <p className="font-black text-slate-850">11 to 13 Days</p>
            </div>
          </div>
          <p>
            <strong>Test Report Form (TRF):</strong> You will receive a physical TRF showing your scores (overall and component-wise). During booking, you can send up to 5 TRFs to colleges for free. Additional shares cost INR 250 each.
          </p>
        </div>
      )
    },
    listening: {
      title: "IELTS Listening Module Syllabus & Tips",
      subtitle: "Understand the structure of recordings, audio formats, and questions.",
      content: (
        <div className="space-y-6">
          <p>
            The IELTS Listening test takes 30 minutes, plus an additional 10 minutes to transfer answers to the answer sheet (in paper tests). It is identical for both Academic and General Training:
          </p>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-xs text-slate-550 font-semibold my-6">
            <p>🎧 <strong>Section 1:</strong> A conversation between two speakers set in an everyday social context (10 questions).</p>
            <p>🎧 <strong>Section 2:</strong> A monologue set in an everyday social context, e.g., a speech about local facilities (10 questions).</p>
            <p>🎧 <strong>Section 3:</strong> A conversation between up to four people set in an educational or training context (10 questions).</p>
            <p>🎧 <strong>Section 4:</strong> A monologue on an academic subject, e.g., a university lecture (10 questions).</p>
          </div>
          <p>
            <strong>Crucial Rule:</strong> The audio clips are played ONLY ONCE. Note down your answers on the question booklet simultaneously to avoid forgetting details.
          </p>
        </div>
      )
    },
    reading: {
      title: "IELTS Reading Module: Academic vs General",
      subtitle: "Passage styles, question types, and core reading comprehension skills.",
      content: (
        <div className="space-y-6">
          <p>
            The Reading section is 60 minutes long and comprises 40 questions based on 3 reading passages.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="border border-slate-150 p-5 rounded-xl">
              <h4 className="font-extrabold text-slate-800 text-sm mb-2">Academic Reading</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Passages are from journals, books, magazines, and newspapers. Focuses on descriptive, factual, analytical, and logical texts.
              </p>
            </div>
            <div className="border border-slate-150 p-5 rounded-xl">
              <h4 className="font-extrabold text-slate-800 text-sm mb-2">General Training Reading</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Passages use everyday English, extracts from employee manuals, advertisements, guidelines, and notices.
              </p>
            </div>
          </div>
          <p>
            Key skills tested include skimming (reading quickly to grasp the main idea) and scanning (identifying specific numbers or terms).
          </p>
        </div>
      )
    },
    writing: {
      title: "IELTS Writing Module Tasks & Guidelines",
      subtitle: "Master Academic Task 1 summaries and Task 2 essays.",
      content: (
        <div className="space-y-6">
          <p>
            The Writing module takes 60 minutes and is divided into two tasks:
          </p>
          <div className="space-y-4 my-6">
            <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/50">
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">Task 1 (Academic vs General)</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Academic requires summarizing visual data (graphs, charts, processes) in 150+ words (20 mins). General Training requires writing a formal, semi-formal, or personal letter.
              </p>
            </div>
            <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/50">
              <h4 className="font-extrabold text-slate-800 text-sm mb-1">Task 2 (Essay Writing)</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Requires writing an argumentative essay on a given problem, solution, or opinion in 250+ words (40 mins).
              </p>
            </div>
          </div>
          <p>
            Assessment is based on task achievement, coherence and cohesion (organization), lexical resource (vocabulary range), and grammatical accuracy.
          </p>
        </div>
      )
    },
    speaking: {
      title: "IELTS Speaking Module: Face-to-Face Interview",
      subtitle: "3 parts breakdown, cue cards, and evaluation criteria.",
      content: (
        <div className="space-y-6">
          <p>
            The Speaking test is a face-to-face conversational interview with a certified evaluator. It takes 11–14 minutes:
          </p>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3 text-xs text-slate-550 font-semibold my-6">
            <p>🗣️ <strong>Part 1: Introduction (4 - 5 Mins)</strong> - Simple introductory questions related to your home, hobbies, family, work, or studies.</p>
            <p>🗣️ <strong>Part 2: Long Turn Cue Card (3 - 4 Mins)</strong> - The examiner gives you a topic card. You have 1 minute to plan, then speak on it for 1–2 minutes.</p>
            <p>🗣️ <strong>Part 3: Discussion (4 - 5 Mins)</strong> - Deep discussion related to the topic of Part 2, requiring abstract reasoning and expressing opinions.</p>
          </div>
          <p>
            Grading criteria include Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation.
          </p>
        </div>
      )
    }
  };

  const activeContent = contentMap[pageKey] || contentMap.overview;

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/exams/ielts/overview" className="hover:text-indigo-650 transition-colors">Exams</Link>
          <ChevronRight size={12} />
          <span className="text-slate-650">IELTS</span>
          <ChevronRight size={12} />
          <span className="text-slate-600">{sidebarLinks.find(l => l.key === pageKey)?.name || 'Detail'}</span>
        </div>

        {/* Title Header Card */}
        <div className="relative bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest mb-4">
              IELTS Reference Guide
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">IELTS Guide Index</p>
            <nav className="space-y-1">
              {sidebarLinks.map((linkItem) => {
                const isActive = pageKey === linkItem.key;
                return (
                  <Link
                    key={linkItem.key}
                    to={linkItem.path}
                    className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold transition-all leading-normal flex items-center justify-between
                      ${isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                  >
                    <span>{linkItem.name}</span>
                    <ChevronRight size={12} className={isActive ? 'text-indigo-500' : 'text-slate-300'} />
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Center Content Section */}
          <main className="bg-white border border-slate-100 p-8 md:p-10 rounded-2xl shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">
              Detailed Guide Content
            </h2>
            <div className="prose max-w-none">
              {activeContent.content}
            </div>

            {/* Additional Quick Actions Box */}
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-100 mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">Want to prepare for IELTS?</h4>
                <p className="text-xs text-slate-500 leading-normal font-normal">Join upcoming live workshops and university webinars led by certified international mentors.</p>
              </div>
              <div className="flex items-center justify-start sm:justify-end">
                <Link
                  to="/events"
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm shadow-indigo-600/10 cursor-pointer transition-all"
                >
                  <span>Explore Live Events</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </main>

          {/* Right Sidebar Widgets */}
          <aside className="sticky top-28 space-y-6">
            
            {/* Widget: Live Events */}
            <div className="bg-gradient-to-r from-[#111111] via-[#10319E] to-[#111111] text-white p-6 rounded-2xl shadow-md border border-blue-900/40 relative overflow-hidden">
              <span className="text-[9px] font-bold text-orange-200 uppercase tracking-widest block mb-2">Live Workshops</span>
              <h3 className="text-lg font-bold leading-snug mb-2">
                Study Abroad Events & Fairs
              </h3>
              <p className="text-xs text-blue-100/85 leading-relaxed mb-5 font-normal">
                Join live Q&A sessions with overseas admission delegates, visa officers, and top trainers.
              </p>
              <Link
                to="/events"
                className="w-full text-center py-3 bg-white text-[#111111] rounded-xl text-xs font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-1.5 shadow-sm block cursor-pointer"
              >
                <span>View Upcoming Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget: Latest Blogs & Guides */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={20} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Exam Prep Blogs & Guides</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-5 font-normal">
                Read Band 8+ essay samples, speaking cue cards, and test-day strategy articles.
              </p>
              <Link
                to="/blogs"
                className="w-full text-center py-3 border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all block cursor-pointer"
              >
                Browse Prep Blogs
              </Link>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};

export default IELTSDetailPage;
