import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  ChevronRight,
  UserCheck,
  AlertTriangle,
  Volume2,
  FileEdit,
  Mic,
  ArrowUpRight,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { API_BASE_URL } from '../../../../config';

const IELTSSyllabusPage = () => {
  const [dbBlogs, setDbBlogs] = React.useState([]);
  const [activeTab, setActiveTab] = useState('academic'); // 'academic' | 'general' | 'lifeskills'
  const [activeModule, setActiveModule] = useState('listening'); // 'listening' | 'reading' | 'writing' | 'speaking'

  const API_URL = API_BASE_URL;

  React.useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${API_URL}/blogs`);
        if (res.ok) {
          const data = await res.json();
          setDbBlogs(data);
        }
      } catch (err) {
        console.error("Failed to fetch blogs from API", err);
      }
    };
    fetchBlogs();
  }, []);

  const ieltsRoutesMap = {
    "ielts-exam": "/exams/ielts/overview",
    "ielts-exam-date": "/exams/ielts/dates",
    "ielts-exam-fee": "/exams/ielts/fees",
    "ielts-modules": "/exams/ielts/overview",
    "ielts-listening-practice-test": "/exams/ielts/listening",
    "ielts-speaking-practice-test": "/exams/ielts/speaking",
    "ielts-reading-practice-test": "/exams/ielts/reading",
    "ielts-writing-practice-test": "/exams/ielts/writing",
    "ielts-test-centres": "/exams/ielts/coaching-centres",
    "ielts-results": "/exams/ielts/results",
    "types-of-ielts": "/exams/ielts/types",
    "ielts-pattern": "/exams/ielts/overview",
    "ielts-exam-eligibility": "/exams/ielts/eligibility",
    "ielts-slot-booking": "/exams/ielts/slot-booking",
    "ielts-band-score": "/exams/ielts/results",
    "ielts-registration": "/exams/ielts/registration",
    "ielts-books": "/resources/books/ielts-books",
    "ielts-preparation": "/exams/ielts/overview",
    "ielts-practice-test": "/exams/ielts/practice-test",
    "ielts-syllabus": "/exams/ielts/syllabus"
  };

  const getBlogLink = (title) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    if (slug.startsWith('study-in-')) {
      const countryCode = slug.replace('study-in-', '');
      return `/study-abroad/${countryCode}`;
    }
    
    if (ieltsRoutesMap[slug]) {
      return ieltsRoutesMap[slug];
    }
    
    const blogExists = dbBlogs.some(b => b.slug === slug);
    if (blogExists) {
      return `/blogs/${slug}`;
    }
    return `/blogs?search=${encodeURIComponent(title)}`;
  };

  const sidebarLinks = [
    { name: 'IELTS Overview', path: '/exams/ielts/overview', key: 'overview' },
    { name: 'IELTS Syllabus', path: '/exams/ielts/syllabus', key: 'syllabus' },
    { name: 'IELTS Types', path: '/exams/ielts/types', key: 'types' },
    { name: 'IELTS Eligibility', path: '/exams/ielts/eligibility', key: 'eligibility' },
    { name: 'IELTS Exam Fees', path: '/exams/ielts/fees', key: 'fees' },
    { name: 'IELTS Dates', path: '/exams/ielts/dates', key: 'dates' },
    { name: 'IELTS Registration', path: '/exams/ielts/registration', key: 'registration' },
    { name: 'IELTS Slot Booking', path: '/exams/ielts/slot-booking', key: 'slot-booking' },
    { name: 'IELTS Coaching Centres', path: '/exams/ielts/coaching-centres', key: 'coaching-centres' },
    { name: 'IELTS Results', path: '/exams/ielts/results', key: 'results' },
    { name: 'IELTS Practice Test', path: '/exams/ielts/practice-test', key: 'practice-test' },
    { name: 'IELTS Listening', path: '/exams/ielts/listening', key: 'listening' },
    { name: 'IELTS Reading', path: '/exams/ielts/reading', key: 'reading' },
    { name: 'IELTS Writing', path: '/exams/ielts/writing', key: 'writing' },
    { name: 'IELTS Speaking', path: '/exams/ielts/speaking', key: 'speaking' },
  ];

  const importantInfoLinks = [
    "IELTS Exam",
    "IELTS Exam Date",
    "IELTS Exam Fee",
    "IELTS Modules",
    "IELTS Listening Practice Test",
    "IELTS Speaking Practice Test",
    "IELTS Reading Practice Test",
    "IELTS Writing Practice Test",
    "IELTS Test Centres",
    "IELTS Results",
    "Types Of IELTS",
    "IELTS Pattern",
    "IELTS Exam Eligibility",
    "IELTS Slot Booking",
    "IELTS Band Score",
    "IELTS Registration",
    "IELTS Books",
    "IELTS Preparation"
  ];

  const acceptingCountriesLinks = [
    "Study In USA",
    "Study In Canada",
    "Study In UK",
    "Study In Australia",
    "Study In Ireland",
    "Study in Germany",
    "Study In New Zealand",
    "Study in Italy",
    "Study in France"
  ];

  const acceptingUniversitiesLinks = [
    "Massachusetts Institute Of Technology",
    "The University Of British Columbia",
    "Harvard University",
    "University Of Toronto",
    "Conestoga College",
    "University Of East London",
    "Stanford University",
    "University Of Alberta",
    "Coventry University",
    "New York University"
  ];

  const testCentresLinks = [
    "IELTS Test Centre And Dates In Hyderabad",
    "IELTS Test Centre And Dates In Bangalore",
    "IELTS Test Centre And Dates In Chennai",
    "IELTS Test Centre And Dates In Amritsar",
    "IELTS Centre And Dates In Ludhiana",
    "IELTS Test Centre And Dates In Mumbai",
    "IELTS Test Centres And Dates In Ahmedabad",
    "IELTS Centre And Dates In Delhi",
    "IELTS Test Centres And Dates In Chandigarh",
    "IELTS Center And Dates In Pune"
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="hover:text-indigo-655 transition-colors">Exams</span>
          <ChevronRight size={12} />
          <span className="text-slate-655">IELTS</span>
          <ChevronRight size={12} />
          <span className="text-slate-600">IELTS Syllabus & Pattern</span>
        </div>

        {/* Title Header Card */}
        <div className="relative bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              IELTS Reference Guide
            </span>
            <h1 className="text-2xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              IELTS Exam Syllabus & Pattern 2024-2025
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed font-semibold">
              Comprehensive overview of the Listening, Reading, Writing, and Speaking modules for Academic, General Training, and Life Skills.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_290px] gap-6 items-start">
          
          {/* Left Sidebar Links */}
          <aside className="sticky top-28 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm max-h-[calc(100vh-140px)] overflow-y-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">IELTS Guide Index</p>
            <nav className="space-y-1">
              {sidebarLinks.map((linkItem) => {
                const isActive = linkItem.key === 'syllabus';
                return (
                  <Link
                    key={linkItem.key}
                    to={linkItem.path}
                    className={`w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition-all leading-normal flex items-center justify-between
                      ${isActive
                        ? 'bg-indigo-50 text-indigo-650'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-805'}`}
                  >
                    <span>{linkItem.name}</span>
                    <ChevronRight size={12} className={isActive ? 'text-indigo-500' : 'text-slate-300'} />
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Center Content Section */}
          <main className="bg-white border border-slate-100 p-8 md:p-12 rounded-3xl shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">
              Detailed Guide Content
            </h2>
            <div className="prose max-w-none space-y-8 text-slate-700 text-[15px] leading-relaxed font-normal">
              <p>
                The IELTS exam consists of four sections: Listening, Reading, Writing, and Speaking. Understanding the IELTS exam pattern is crucial to achieving a high band score. There are two main types of tests designed based on your purpose of taking IELTS:
              </p>
              <ul className="list-disc list-inside space-y-2 text-xs font-semibold pl-2">
                <li><strong>IELTS Academic:</strong> Ideal for those pursuing higher education in countries like Australia, Canada, the UK, and the USA.</li>
                <li><strong>IELTS General Training:</strong> Best suited for those seeking work opportunities or migration pathways abroad.</li>
              </ul>
              <p>
                While the Listening and Speaking sections are identical in both types of tests, the Writing and Reading sections differ. Knowing the syllabus ensures you can allocate study time efficiently and avoid surprises on test day.
              </p>

              {/* Dynamic Course Type Switcher */}
              <div className="bg-indigo-50/45 border border-indigo-100 rounded-2xl p-6">
                <h4 className="font-extrabold text-slate-805 text-sm mb-4 flex items-center gap-1.5">
                  <BookOpen size={18} className="text-indigo-650" />
                  <span>Choose Test Pattern Format</span>
                </h4>
                
                <div className="flex border-b border-slate-200/60 pb-3 mb-5 gap-3.5">
                  {['academic', 'general', 'lifeskills'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        if (tab !== 'lifeskills') setActiveModule('listening');
                      }}
                      className={`pb-2.5 text-xs font-black transition-all capitalize border-b-2 cursor-pointer ${
                        activeTab === tab 
                          ? 'border-indigo-600 text-indigo-650' 
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab === 'lifeskills' ? 'Life Skills (UKVI)' : `IELTS ${tab}`}
                    </button>
                  ))}
                </div>

                {/* Sub-tab selection for Academic/General modules */}
                {activeTab !== 'lifeskills' && (
                  <div className="flex gap-2 flex-wrap mb-5">
                    {['listening', 'reading', 'writing', 'speaking'].map((mod) => (
                      <button
                        key={mod}
                        onClick={() => setActiveModule(mod)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
                          activeModule === mod 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-white border border-slate-200 text-slate-655 hover:bg-slate-50'
                        }`}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                )}

                {/* Dynamic Content Display */}
                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
                  {activeTab === 'academic' && (
                    <div className="space-y-4">
                      <span className="text-[10px] text-indigo-655 font-black uppercase tracking-wider block">Academic Module Breakdowns</span>
                      
                      {activeModule === 'listening' && (
                        <div className="space-y-4 text-xs font-semibold text-slate-655">
                          <h4 className="text-slate-900 font-extrabold text-sm border-b pb-2">Academic Listening Section (4 Parts)</h4>
                          <p><strong>Duration:</strong> 30 Minutes (+10 Minutes transfer time for paper format).</p>
                          <p><strong>Structure:</strong> 4 recordings with 10 questions each, total 40 questions.</p>
                          <div className="space-y-2.5 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                            <p>🎧 <strong>Recording 1:</strong> A general conversation between two native speakers (e.g. travel booking).</p>
                            <p>🎧 <strong>Recording 2:</strong> A monologue in an everyday social context (e.g. speech about local facilities).</p>
                            <p>🎧 <strong>Recording 3:</strong> A conversation between up to four people in an educational training context (e.g. tutor discussion).</p>
                            <p>🎧 <strong>Recording 4:</strong> A monologue on an academic subject (e.g. university lecture).</p>
                          </div>
                          <p><strong>Question Types:</strong> MCQs, matching, diagram labeling, note/form completion, sentence completion.</p>
                        </div>
                      )}

                      {activeModule === 'reading' && (
                        <div className="space-y-4 text-xs font-semibold text-slate-655">
                          <h4 className="text-slate-900 font-extrabold text-sm border-b pb-2">Academic Reading Section</h4>
                          <p><strong>Duration:</strong> 60 Minutes (No transfer time).</p>
                          <p><strong>Structure:</strong> 3 long passages of descriptive, factual, discursive, or analytical styles with 40 questions total.</p>
                          <p><strong>Reading Skills:</strong> Skimming, scanning, reading for detail, and identifying writer's opinions.</p>
                          <p><strong>Passage Sources:</strong> Journals, magazines, books, and newspapers of general academic interest.</p>
                        </div>
                      )}

                      {activeModule === 'writing' && (
                        <div className="space-y-4 text-xs font-semibold text-slate-655">
                          <h4 className="text-slate-900 font-extrabold text-sm border-b pb-2">Academic Writing Section (2 Tasks)</h4>
                          <p><strong>Duration:</strong> 60 Minutes total.</p>
                          <div className="space-y-3.5 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                            <p>📝 <strong>Writing Task 1 (20 Mins):</strong> Explain visual information (bar chart, line graph, table, or process diagram) in your own words. <em>Minimum 150 words.</em></p>
                            <p>📝 <strong>Writing Task 2 (40 Mins):</strong> Write an essay responding to a point of view, argument, or problem. Must be written in a formal tone. <em>Minimum 250 words.</em></p>
                          </div>
                        </div>
                      )}

                      {activeModule === 'speaking' && (
                        <div className="space-y-4 text-xs font-semibold text-slate-655">
                          <h4 className="text-slate-900 font-extrabold text-sm border-b pb-2">Academic Speaking Section (3 Parts)</h4>
                          <p><strong>Duration:</strong> 11 to 14 Minutes.</p>
                          <p><strong>Structure:</strong> Face-to-face conversational interview with an evaluator.</p>
                          <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                            <p>🗣️ <strong>Part 1: Introduction (4-5 Mins):</strong> Personal questions on familiar topics (family, study, interests).</p>
                            <p>🗣️ <strong>Part 2: Long Turn Cue Card (3-4 Mins):</strong> Examiner gives a topic card. You get 1 minute to plan and then speak for 1-2 minutes.</p>
                            <p>🗣️ <strong>Part 3: Discussion (4-5 Mins):</strong> Abstract discussion linking to the topic discussed in Part 2.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'general' && (
                    <div className="space-y-4">
                      <span className="text-[10px] text-indigo-655 font-black uppercase tracking-wider block">General Training Module Breakdowns</span>
                      
                      {activeModule === 'listening' && (
                        <p className="text-xs font-semibold text-slate-550">
                          🔊 The Listening section is <strong>identical to the Academic Listening</strong>. It contains 4 recordings, 40 questions, and takes 30 minutes.
                        </p>
                      )}

                      {activeModule === 'reading' && (
                        <div className="space-y-4 text-xs font-semibold text-slate-655">
                          <h4 className="text-slate-900 font-extrabold text-sm border-b pb-2">General Training Reading Section</h4>
                          <p><strong>Duration:</strong> 60 Minutes.</p>
                          <p><strong>Structure:</strong> 3 sections focusing on occupational and social survival texts.</p>
                          <div className="space-y-2.5 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                            <p>📖 <strong>Task 1 (Social Survival):</strong> Excerpts from advertisements, notices, or timetables.</p>
                            <p>📖 <strong>Task 2 (Workplace Survival):</strong> Excerpts from staff training booklets, contracts, or job descriptions.</p>
                            <p>📖 <strong>Task 3 (General Reading):</strong> A longer, descriptive passage with a more complex structure.</p>
                          </div>
                        </div>
                      )}

                      {activeModule === 'writing' && (
                        <div className="space-y-4 text-xs font-semibold text-slate-655">
                          <h4 className="text-slate-900 font-extrabold text-sm border-b pb-2">General Training Writing Section (2 Tasks)</h4>
                          <p><strong>Duration:</strong> 60 Minutes.</p>
                          <div className="space-y-3.5 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                            <p>📝 <strong>Task 1 (20 Mins):</strong> Write a letter (formal, semi-formal, or informal) explaining a situation or requesting details. <em>Minimum 150 words.</em></p>
                            <p>📝 <strong>Task 2 (40 Mins):</strong> Write an essay in response to a point of view or argument. Can be slightly more personal in tone. <em>Minimum 250 words.</em></p>
                          </div>
                        </div>
                      )}

                      {activeModule === 'speaking' && (
                        <p className="text-xs font-semibold text-slate-550">
                          🗣️ The Speaking section is <strong>identical to the Academic Speaking</strong>. It is a face-to-face conversational interview taking 11-14 minutes.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === 'lifeskills' && (
                    <div className="space-y-4 text-xs font-semibold text-slate-655">
                      <span className="text-[10px] text-indigo-655 font-black uppercase tracking-wider block">Life Skills Test Format</span>
                      <h4 className="text-slate-900 font-extrabold text-sm border-b pb-2">IELTS Life Skills A1, A2, & B1 Tests</h4>
                      <p>
                        Assesses everyday speaking and listening skills only. Conducted with another candidate and an examiner.
                      </p>
                      <div className="space-y-2.5 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                        <p>💬 <strong>Level A1:</strong> Speaking and Listening task (16 to 18 Minutes) for UK spouse/family routes.</p>
                        <p>💬 <strong>Level A2 (UK only):</strong> Speaking and Listening task (20 Minutes).</p>
                        <p>💬 <strong>Level B1:</strong> Speaking, Listening, and cooperative activity task (22 Minutes) for UK citizenship/indefinite leave to remain.</p>
                      </div>
                      <p>All test takers listen to a CD recording, answer questions, and discuss related topics. B1 includes planning a simple event together.</p>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 mt-8 mb-4">Syllabus Overview</h3>
              <p>
                A solid understanding of the IELTS syllabus is key to effective preparation. Whether you are aiming for higher studies with Academic or immigration with General Training, preparing for each module with diagnostic mocks, visual graph drafting formats, and structured listening drills is highly recommended.
              </p>

              <h3 className="text-lg font-black text-slate-900 mt-12 mb-6">Frequently Asked Questions (FAQs) - IELTS Syllabus & Pattern</h3>
              <div className="space-y-4">
                {[
                  {
                    q: "How is the IELTS exam structure?",
                    a: "The IELTS exam has four modules: Listening (30 mins), Reading (60 mins), Writing (60 mins), and Speaking (11-14 mins). The total test duration is 2 hours and 44 minutes."
                  },
                  {
                    q: "What is the IELTS question paper pattern for reading section?",
                    a: "The Reading section includes 3 passages and 40 questions. Question formats consist of Multiple Choice, Heading Matching, Sentence Completion, Yes/No/Not Given, and Diagram Labeling."
                  },
                  {
                    q: "Which IELTS paper is easy?",
                    a: "General Training is generally considered easier in the Reading and Writing modules compared to the Academic test, as it utilizes everyday occupational and social texts instead of dense academic topics."
                  },
                  {
                    q: "How long is IELTS exam?",
                    a: "The total test duration is 2 hours and 44 minutes. Listening, Reading, and Writing are completed in a single session without breaks, while Speaking can be taken on the same day or scheduled within 7 days before or after."
                  },
                  {
                    q: "Which is the hardest part of IELTS?",
                    a: "Most candidates find Writing (specifically Task 2) and Reading passages to be the most challenging modules due to strict time limits and criteria for vocabulary, grammatical range, and coherence."
                  },
                  {
                    q: "Is IELTS online or offline?",
                    a: "Both formats are available. You can take the paper-based test (offline writing using pencils) or the computer-based test (typing at a secure centre) depending on your comfort."
                  },
                  {
                    q: "Is a passport required for IELTS?",
                    a: "Yes. A valid, original passport is the only acceptable form of identification required to register and sit for the IELTS test in India."
                  },
                  {
                    q: "Which type of IELTS is easiest?",
                    a: "The IELTS Life Skills test (which only tests basic speaking and listening) is the easiest, followed by General Training. Academic is the most demanding variant."
                  },
                  {
                    q: "Does handwriting matter in IELTS?",
                    a: "Handwriting only matters for the paper-based test. The examiner must be able to read your writing clearly to mark it. If they cannot decipher your writing, you will lose marks. For computer-based tests, typing eliminates this issue."
                  },
                  {
                    q: "How long is IELTS valid?",
                    a: "The IELTS Test Report Form (TRF) is valid for 2 years from the date of your exam."
                  },
                  {
                    q: "Is IELTS MCQ based?",
                    a: "No. While there are some multiple-choice questions, the test consists of various formats including fill-in-the-blanks, matching columns, short answer questions, visual summaries, and essays."
                  },
                  {
                    q: "Who corrects IELTS writing?",
                    a: "IELTS Writing modules are evaluated by certified, experienced IELTS examiners trained and closely monitored by IDP and Cambridge English to ensure objective grading."
                  }
                ].map((faq, index) => (
                  <details key={index} className="group border border-slate-200 rounded-2xl bg-white hover:border-indigo-150 transition-all duration-200 p-5">
                    <summary className="font-extrabold text-slate-805 cursor-pointer flex justify-between items-center list-none select-none text-sm">
                      <span>{faq.q}</span>
                      <span className="transition-transform duration-200 group-open:rotate-180 text-slate-400">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-3.5 text-slate-655 text-xs leading-relaxed font-semibold">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Additional Quick Actions Box */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Next Up Section */}
            <div className="border-t border-slate-100 pt-8 mt-12">
              <h3 className="text-lg font-black text-slate-900 mb-5">Next Up</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to={getBlogLink("IELTS Dates")} className="flex flex-col justify-between p-5 bg-white border border-slate-100 border-l-4 border-l-emerald-500 rounded-xl hover:shadow-md transition-all group">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-4 group-hover:text-indigo-655 transition-colors">IELTS Dates</h4>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    Read Now <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
                <Link to={getBlogLink("IELTS Band Score")} className="flex flex-col justify-between p-5 bg-white border border-slate-100 border-l-4 border-l-sky-500 rounded-xl hover:shadow-md transition-all group">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-4 group-hover:text-indigo-655 transition-colors">IELTS Band Score</h4>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    Read Now <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
                <Link to={getBlogLink("IELTS Results")} className="flex flex-col justify-between p-5 bg-white border border-slate-100 border-l-4 border-l-amber-500 rounded-xl hover:shadow-md transition-all group">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-4 group-hover:text-indigo-655 transition-colors">IELTS Results</h4>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    Read Now <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>

            {/* IELTS Link Grids */}
            <div className="border-t border-slate-100 pt-8 mt-8 space-y-12">
              {/* Important Info Grid */}
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-5">IELTS Important Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  {importantInfoLinks.map((link) => (
                    <Link 
                      key={link}
                      to={getBlogLink(link)}
                      className="p-4 bg-white border-b border-r border-slate-100 flex items-center justify-between hover:bg-indigo-50/20 transition-all group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-655 transition-colors">{link}</span>
                      <ArrowRight size={13} className="text-indigo-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Accepting Countries Grid */}
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-5">IELTS Accepting Countries</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  {acceptingCountriesLinks.map((link) => (
                    <Link 
                      key={link}
                      to={getBlogLink(link)}
                      className="p-4 bg-white border-b border-r border-slate-100 flex items-center justify-between hover:bg-indigo-50/20 transition-all group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-655 transition-colors">{link}</span>
                      <ArrowRight size={13} className="text-indigo-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Accepting Universities Grid */}
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-5">IELTS Accepting Universities</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  {acceptingUniversitiesLinks.map((link) => (
                    <Link 
                      key={link}
                      to={getBlogLink(link)}
                      className="p-4 bg-white border-b border-r border-slate-100 flex items-center justify-between hover:bg-indigo-50/20 transition-all group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-655 transition-colors">{link}</span>
                      <ArrowRight size={13} className="text-indigo-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Test Centres Grid */}
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-5">IELTS Test Centre and Dates in India</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  {testCentresLinks.map((link) => (
                    <Link 
                      key={link}
                      to={getBlogLink(link)}
                      className="p-4 bg-white border-b border-r border-slate-100 flex items-center justify-between hover:bg-indigo-50/20 transition-all group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-655 transition-colors">{link}</span>
                      <ArrowRight size={13} className="text-indigo-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </main>

          {/* Right Sidebar Widgets */}
          <aside className="sticky top-28 space-y-6">
            
            {/* Widget: Exam Prep Blogs */}
            <div className="bg-gradient-to-r from-[#111111] via-[#10319E] to-[#111111] text-white p-6 rounded-2xl shadow-md border border-blue-900/40 relative overflow-hidden">
              <span className="text-[9px] font-bold text-orange-200 uppercase tracking-widest block mb-2">Preparation Guides</span>
              <h3 className="text-lg font-bold leading-snug mb-2">
                Band 8+ IELTS Articles & Tips
              </h3>
              <p className="text-xs text-blue-100/85 leading-relaxed mb-5 font-normal">
                Explore proven speaking cue cards, reading skimming tricks, and task-2 templates.
              </p>
              <Link
                to="/blogs"
                className="w-full text-center py-3 bg-white text-[#111111] rounded-xl text-xs font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-1.5 shadow-sm block cursor-pointer"
              >
                <span>Browse Prep Blogs</span>
                <ArrowRight size={14} />
              </Link>
            </div>

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

          </aside>

        </div>
      </div>
    </div>
  );
};

export default IELTSSyllabusPage;
