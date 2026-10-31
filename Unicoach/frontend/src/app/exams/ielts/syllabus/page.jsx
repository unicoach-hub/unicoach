import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Headphones,
  FileEdit,
  MessageSquare,
  MessagesSquare,
  Volume2,
} from 'lucide-react';
import { API_BASE_URL } from '../../../../config';
import { HookBand, Donut } from '../../../../components/ui/Infographics';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../../components/desi/desiTokens';
import { BookOkCta } from '../../../../components/desi/BookOkCta';

// Section heading with a short Hindi kicker (h3 level)
const SubHead = ({ hi, children, className = '' }) => (
  <div className={className}>
    <p className="font-urbanist font-extrabold text-[15px] leading-none text-[#D0362E]">{hi}</p>
    <h3 className="mt-1 font-urbanist font-black text-[21px] sm:text-[24px] leading-[1.1] tracking-[-0.02em] text-[#16130F]">{children}</h3>
  </div>
);

// FAQ accordion with ink borders
const FaqItem = ({ q, a }) => (
  <details className="group bg-white border-[3px] border-[#16130F] rounded-xl overflow-hidden shadow-[4px_4px_0_#16130F] open:shadow-[4px_4px_0_#D0362E]">
    <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none select-none font-bold text-[14.5px] text-[#16130F] [&::-webkit-details-marker]:hidden">
      <span>{q}</span>
      <span className="w-7 h-7 rounded-full border-2 border-[#16130F] bg-white grid place-items-center shrink-0 transition-transform group-open:rotate-180 group-open:bg-[#F2B705]">
        <ChevronDown size={15} />
      </span>
    </summary>
    <div className="px-4 pb-4 pt-3 border-t-2 border-dashed border-[#16130F33] text-[#5B544A] text-[14px] leading-relaxed">
      {a}
    </div>
  </details>
);

// Grid of related links inside one ink box
const LinkGrid = ({ hi, title, links, getLink }) => (
  <div>
    <SubHead hi={hi}>{title}</SubHead>
    <div className="mt-5 grid grid-cols-1 md:grid-cols-3 bg-white border-[3px] border-[#16130F] rounded-xl overflow-hidden shadow-[4px_4px_0_#16130F]">
      {links.map((link) => (
        <Link
          key={link}
          to={getLink(link)}
          className="group p-4 flex items-center justify-between gap-3 border-b-2 md:border-r-2 border-[#16130F]/10 hover:bg-[#FFF1B8] transition-colors cursor-pointer"
        >
          <span className="text-[13px] font-bold text-[#3D362E] group-hover:text-[#16130F]">{link}</span>
          <ArrowRight size={13} className="shrink-0 text-[#D0362E] group-hover:translate-x-1 transition-transform" />
        </Link>
      ))}
    </div>
  </div>
);

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
    <div className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F]">
      {/* ── HERO ── */}
      <DesiHero
        tone="mustard"
        sign={{ hi: 'Pathyakram', en: 'IELTS SYLLABUS' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams' }, { label: 'IELTS' }, { label: 'IELTS Syllabus & Pattern' }]}
        title="IELTS Exam Syllabus & Pattern 2024-2025"
        subtitle="Comprehensive overview of the Listening, Reading, Writing, and Speaking modules for Academic, General Training, and Life Skills."
        stickers={(
          <>
            <Sticker tilt={-2}><BookOpen size={14} />IELTS Reference Guide</Sticker>
            <Sticker bg="#DDF3EF" tilt={1.5}><Headphones size={14} />Listening</Sticker>
            <Sticker tilt={-1}><BookOpen size={14} />Reading</Sticker>
            <Sticker bg="#FBD9E6" tilt={1}><FileEdit size={14} />Writing</Sticker>
            <Sticker bg="#FCE3DA" tilt={-1.5}><MessageSquare size={14} />Speaking</Sticker>
          </>
        )}
      />

      {/* ── GUIDE PICKER (phones and tablets) ── */}
      <div className="lg:hidden max-w-[1400px] mx-auto px-4 -mt-6 mb-8 relative z-10">
        <InkCard className="p-3">
          <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none px-1 mb-2">IELTS guide</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sidebarLinks.map((linkItem) => {
              const isActive = linkItem.key === 'syllabus';
              return (
                <Link
                  key={linkItem.key}
                  to={linkItem.path}
                  className={`px-3.5 py-2 rounded-full border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 ${isActive ? 'border-[#16130F] bg-[#F2B705] text-[#16130F] shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
                >
                  {linkItem.name}
                </Link>
              );
            })}
          </div>
        </InkCard>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:pt-12">

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)_230px] xl:grid-cols-[250px_minmax(0,1fr)_290px] gap-6 lg:gap-7 items-start">

          {/* Left Sidebar Links */}
          <aside className="hidden lg:block sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 pb-2">
            <InkCard className="p-4">
              <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">IELTS guide</p>
              <h3 className="mt-1 mb-3 font-urbanist font-black text-[16px]">IELTS Guide Index</h3>
              <nav className="flex flex-col gap-1.5">
                {sidebarLinks.map((linkItem) => {
                  const isActive = linkItem.key === 'syllabus';
                  return (
                    <Link
                      key={linkItem.key}
                      to={linkItem.path}
                      className={`group w-full text-left py-2 px-3 rounded-lg border-2 text-[13px] font-bold leading-normal flex items-center justify-between gap-2 transition-colors
                        ${isActive
                          ? 'border-[#16130F] bg-[#F2B705] text-[#16130F] shadow-[3px_3px_0_#16130F]'
                          : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
                    >
                      <span>{linkItem.name}</span>
                      <ChevronRight size={13} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  );
                })}
              </nav>
            </InkCard>
          </aside>

          {/* Center Content Section */}
          <main className="min-w-0 bg-white border-[3px] border-[#16130F] p-5 sm:p-8 md:p-10 rounded-[18px] shadow-[6px_6px_0_#16130F]">
            <DesiHeading hi="Poori jaankari" className="mb-6 pb-5 border-b-2 border-dashed border-[#16130F33]">
              Detailed Guide Content
            </DesiHeading>
            <div className="max-w-none space-y-8 text-[#3D362E] text-[15px] leading-relaxed">
              <p>
                The IELTS exam consists of four sections: Listening, Reading, Writing, and Speaking. Understanding the IELTS exam pattern is crucial to achieving a high band score. There are two main types of tests designed based on your purpose of taking IELTS:
              </p>
              <ul className="space-y-2.5 text-[14px]">
                <li className="flex gap-2.5"><span className="mt-2 w-2.5 h-2.5 rounded-full border-2 border-[#16130F] bg-[#F2B705] shrink-0" /><span><strong className="text-[#16130F]">IELTS Academic:</strong> Ideal for those pursuing higher education in countries like Australia, Canada, the UK, and the USA.</span></li>
                <li className="flex gap-2.5"><span className="mt-2 w-2.5 h-2.5 rounded-full border-2 border-[#16130F] bg-[#14837E] shrink-0" /><span><strong className="text-[#16130F]">IELTS General Training:</strong> Best suited for those seeking work opportunities or migration pathways abroad.</span></li>
              </ul>
              <p>
                While the Listening and Speaking sections are identical in both types of tests, the Writing and Reading sections differ. Knowing the syllabus ensures you can allocate study time efficiently and avoid surprises on test day.
              </p>

              <HookBand value="2h 44m" label="total IELTS test time across Listening, Reading, Writing and Speaking" hi="Pattern" />

              <div>
                <Donut
                  kicker="Time per module"
                  title="How the IELTS test time splits"
                  centerValue="4"
                  centerLabel="modules"
                  segments={[
                    { label: 'Reading', value: 60, display: '60 min' },
                    { label: 'Writing', value: 60, display: '60 min' },
                    { label: 'Listening', value: 30, display: '30 min' },
                    { label: 'Speaking', value: 12.5, display: '11–14 min' },
                  ]}
                />
              </div>

              {/* Dynamic Course Type Switcher */}
              <div className="bg-[#FFF1B8] border-[3px] border-[#16130F] rounded-[16px] p-4 sm:p-6 shadow-[5px_5px_0_#16130F]">
                <h4 className="font-urbanist font-black text-[17px] text-[#16130F] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full border-2 border-[#16130F] bg-[#14837E] text-white grid place-items-center shrink-0">
                    <BookOpen size={16} />
                  </span>
                  <span>Choose Test Pattern Format</span>
                </h4>

                <div className="flex flex-wrap gap-2 pb-4 mb-4 border-b-2 border-dashed border-[#16130F33]">
                  {['academic', 'general', 'lifeskills'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        if (tab !== 'lifeskills') setActiveModule('listening');
                      }}
                      className={`no-shine px-4 py-2 rounded-full border-2 border-[#16130F] text-[13px] font-extrabold transition-transform capitalize cursor-pointer ${
                        activeTab === tab
                          ? 'bg-[#16130F] text-[#F2B705] shadow-[2px_2px_0_#D0362E]'
                          : 'bg-white text-[#16130F] hover:-translate-y-0.5'
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
                        className={`no-shine px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-colors capitalize cursor-pointer ${
                          activeModule === mod
                            ? 'border-[#16130F] bg-[#D0362E] text-white shadow-[2px_2px_0_#16130F]'
                            : 'border-[#16130F]/25 bg-white text-[#3D362E] hover:border-[#16130F]'
                        }`}
                      >
                        {mod}
                      </button>
                    ))}
                  </div>
                )}

                {/* Dynamic Content Display */}
                <div className="bg-white border-[3px] border-[#16130F] rounded-xl p-4 sm:p-5">
                  {activeTab === 'academic' && (
                    <div className="space-y-4">
                      <span className="text-[10.5px] text-[#B8285B] font-black uppercase tracking-wider block">Academic Module Breakdowns</span>

                      {activeModule === 'listening' && (
                        <div className="space-y-4 text-[13.5px] text-[#3D362E] leading-relaxed">
                          <h4 className="font-urbanist font-black text-[16px] text-[#16130F] border-b-2 border-dashed border-[#16130F33] pb-2">Academic Listening Section (4 Parts)</h4>
                          <p><strong>Duration:</strong> 30 Minutes (+10 Minutes transfer time for paper format).</p>
                          <p><strong>Structure:</strong> 4 recordings with 10 questions each, total 40 questions.</p>
                          <div className="space-y-2.5 bg-[#FFF6E5] border-2 border-[#16130F] rounded-lg p-4">
                            <p className="flex gap-2.5"><Headphones size={15} className="shrink-0 mt-0.5" style={{ color: '#14837E' }} /><span><strong>Recording 1:</strong> A general conversation between two native speakers (e.g. travel booking).</span></p>
                            <p className="flex gap-2.5"><Headphones size={15} className="shrink-0 mt-0.5" style={{ color: '#14837E' }} /><span><strong>Recording 2:</strong> A monologue in an everyday social context (e.g. speech about local facilities).</span></p>
                            <p className="flex gap-2.5"><Headphones size={15} className="shrink-0 mt-0.5" style={{ color: '#14837E' }} /><span><strong>Recording 3:</strong> A conversation between up to four people in an educational training context (e.g. tutor discussion).</span></p>
                            <p className="flex gap-2.5"><Headphones size={15} className="shrink-0 mt-0.5" style={{ color: '#14837E' }} /><span><strong>Recording 4:</strong> A monologue on an academic subject (e.g. university lecture).</span></p>
                          </div>
                          <p><strong>Question Types:</strong> MCQs, matching, diagram labeling, note/form completion, sentence completion.</p>
                        </div>
                      )}

                      {activeModule === 'reading' && (
                        <div className="space-y-4 text-[13.5px] text-[#3D362E] leading-relaxed">
                          <h4 className="font-urbanist font-black text-[16px] text-[#16130F] border-b-2 border-dashed border-[#16130F33] pb-2">Academic Reading Section</h4>
                          <p><strong>Duration:</strong> 60 Minutes (No transfer time).</p>
                          <p><strong>Structure:</strong> 3 long passages of descriptive, factual, discursive, or analytical styles with 40 questions total.</p>
                          <p><strong>Reading Skills:</strong> Skimming, scanning, reading for detail, and identifying writer's opinions.</p>
                          <p><strong>Passage Sources:</strong> Journals, magazines, books, and newspapers of general academic interest.</p>
                        </div>
                      )}

                      {activeModule === 'writing' && (
                        <div className="space-y-4 text-[13.5px] text-[#3D362E] leading-relaxed">
                          <h4 className="font-urbanist font-black text-[16px] text-[#16130F] border-b-2 border-dashed border-[#16130F33] pb-2">Academic Writing Section (2 Tasks)</h4>
                          <p><strong>Duration:</strong> 60 Minutes total.</p>
                          <div className="space-y-3.5 bg-[#FFF6E5] border-2 border-[#16130F] rounded-lg p-4">
                            <p className="flex gap-2.5"><FileEdit size={15} className="shrink-0 mt-0.5" style={{ color: '#B8285B' }} /><span><strong>Writing Task 1 (20 Mins):</strong> Explain visual information (bar chart, line graph, table, or process diagram) in your own words. <em>Minimum 150 words.</em></span></p>
                            <p className="flex gap-2.5"><FileEdit size={15} className="shrink-0 mt-0.5" style={{ color: '#B8285B' }} /><span><strong>Writing Task 2 (40 Mins):</strong> Write an essay responding to a point of view, argument, or problem. Must be written in a formal tone. <em>Minimum 250 words.</em></span></p>
                          </div>
                        </div>
                      )}

                      {activeModule === 'speaking' && (
                        <div className="space-y-4 text-[13.5px] text-[#3D362E] leading-relaxed">
                          <h4 className="font-urbanist font-black text-[16px] text-[#16130F] border-b-2 border-dashed border-[#16130F33] pb-2">Academic Speaking Section (3 Parts)</h4>
                          <p><strong>Duration:</strong> 11 to 14 Minutes.</p>
                          <p><strong>Structure:</strong> Face-to-face conversational interview with an evaluator.</p>
                          <div className="space-y-3 bg-[#FFF6E5] border-2 border-[#16130F] rounded-lg p-4">
                            <p className="flex gap-2.5"><MessageSquare size={15} className="shrink-0 mt-0.5" style={{ color: '#D0362E' }} /><span><strong>Part 1: Introduction (4-5 Mins):</strong> Personal questions on familiar topics (family, study, interests).</span></p>
                            <p className="flex gap-2.5"><MessageSquare size={15} className="shrink-0 mt-0.5" style={{ color: '#D0362E' }} /><span><strong>Part 2: Long Turn Cue Card (3-4 Mins):</strong> Examiner gives a topic card. You get 1 minute to plan and then speak for 1-2 minutes.</span></p>
                            <p className="flex gap-2.5"><MessageSquare size={15} className="shrink-0 mt-0.5" style={{ color: '#D0362E' }} /><span><strong>Part 3: Discussion (4-5 Mins):</strong> Abstract discussion linking to the topic discussed in Part 2.</span></p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'general' && (
                    <div className="space-y-4">
                      <span className="text-[10.5px] text-[#B8285B] font-black uppercase tracking-wider block">General Training Module Breakdowns</span>

                      {activeModule === 'listening' && (
                        <p className="flex gap-2.5 text-[13.5px] text-[#3D362E] leading-relaxed">
                          <Volume2 size={15} className="shrink-0 mt-0.5 text-[#14837E]" />
                          <span>The Listening section is <strong>identical to the Academic Listening</strong>. It contains 4 recordings, 40 questions, and takes 30 minutes.</span>
                        </p>
                      )}

                      {activeModule === 'reading' && (
                        <div className="space-y-4 text-[13.5px] text-[#3D362E] leading-relaxed">
                          <h4 className="font-urbanist font-black text-[16px] text-[#16130F] border-b-2 border-dashed border-[#16130F33] pb-2">General Training Reading Section</h4>
                          <p><strong>Duration:</strong> 60 Minutes.</p>
                          <p><strong>Structure:</strong> 3 sections focusing on occupational and social survival texts.</p>
                          <div className="space-y-2.5 bg-[#FFF6E5] border-2 border-[#16130F] rounded-lg p-4">
                            <p className="flex gap-2.5"><BookOpen size={15} className="shrink-0 mt-0.5" style={{ color: '#14837E' }} /><span><strong>Task 1 (Social Survival):</strong> Excerpts from advertisements, notices, or timetables.</span></p>
                            <p className="flex gap-2.5"><BookOpen size={15} className="shrink-0 mt-0.5" style={{ color: '#14837E' }} /><span><strong>Task 2 (Workplace Survival):</strong> Excerpts from staff training booklets, contracts, or job descriptions.</span></p>
                            <p className="flex gap-2.5"><BookOpen size={15} className="shrink-0 mt-0.5" style={{ color: '#14837E' }} /><span><strong>Task 3 (General Reading):</strong> A longer, descriptive passage with a more complex structure.</span></p>
                          </div>
                        </div>
                      )}

                      {activeModule === 'writing' && (
                        <div className="space-y-4 text-[13.5px] text-[#3D362E] leading-relaxed">
                          <h4 className="font-urbanist font-black text-[16px] text-[#16130F] border-b-2 border-dashed border-[#16130F33] pb-2">General Training Writing Section (2 Tasks)</h4>
                          <p><strong>Duration:</strong> 60 Minutes.</p>
                          <div className="space-y-3.5 bg-[#FFF6E5] border-2 border-[#16130F] rounded-lg p-4">
                            <p className="flex gap-2.5"><FileEdit size={15} className="shrink-0 mt-0.5" style={{ color: '#B8285B' }} /><span><strong>Task 1 (20 Mins):</strong> Write a letter (formal, semi-formal, or informal) explaining a situation or requesting details. <em>Minimum 150 words.</em></span></p>
                            <p className="flex gap-2.5"><FileEdit size={15} className="shrink-0 mt-0.5" style={{ color: '#B8285B' }} /><span><strong>Task 2 (40 Mins):</strong> Write an essay in response to a point of view or argument. Can be slightly more personal in tone. <em>Minimum 250 words.</em></span></p>
                          </div>
                        </div>
                      )}

                      {activeModule === 'speaking' && (
                        <p className="flex gap-2.5 text-[13.5px] text-[#3D362E] leading-relaxed">
                          <MessageSquare size={15} className="shrink-0 mt-0.5 text-[#D0362E]" />
                          <span>The Speaking section is <strong>identical to the Academic Speaking</strong>. It is a face-to-face conversational interview taking 11-14 minutes.</span>
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === 'lifeskills' && (
                    <div className="space-y-4 text-[13.5px] text-[#3D362E] leading-relaxed">
                      <span className="text-[10.5px] text-[#B8285B] font-black uppercase tracking-wider block">Life Skills Test Format</span>
                      <h4 className="font-urbanist font-black text-[16px] text-[#16130F] border-b-2 border-dashed border-[#16130F33] pb-2">IELTS Life Skills A1, A2, & B1 Tests</h4>
                      <p>
                        Assesses everyday speaking and listening skills only. Conducted with another candidate and an examiner.
                      </p>
                      <div className="space-y-2.5 bg-[#FFF6E5] border-2 border-[#16130F] rounded-lg p-4">
                        <p className="flex gap-2.5"><MessagesSquare size={15} className="shrink-0 mt-0.5" style={{ color: '#14837E' }} /><span><strong>Level A1:</strong> Speaking and Listening task (16 to 18 Minutes) for UK spouse/family routes.</span></p>
                        <p className="flex gap-2.5"><MessagesSquare size={15} className="shrink-0 mt-0.5" style={{ color: '#14837E' }} /><span><strong>Level A2 (UK only):</strong> Speaking and Listening task (20 Minutes).</span></p>
                        <p className="flex gap-2.5"><MessagesSquare size={15} className="shrink-0 mt-0.5" style={{ color: '#14837E' }} /><span><strong>Level B1:</strong> Speaking, Listening, and cooperative activity task (22 Minutes) for UK citizenship/indefinite leave to remain.</span></p>
                      </div>
                      <p>All test takers listen to a CD recording, answer questions, and discuss related topics. B1 includes planning a simple event together.</p>
                    </div>
                  )}
                </div>
              </div>

              <SubHead hi="Ek nazar mein" className="pt-4">Syllabus Overview</SubHead>
              <p>
                A solid understanding of the IELTS syllabus is key to effective preparation. Whether you are aiming for higher studies with Academic or immigration with General Training, preparing for each module with diagnostic mocks, visual graph drafting formats, and structured listening drills is highly recommended.
              </p>

              <SubHead hi="Sabke sawaal" className="pt-6">Frequently Asked Questions (FAQs) - IELTS Syllabus & Pattern</SubHead>
              <div className="space-y-3">
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
                  <FaqItem key={index} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>

            {/* Additional Quick Actions Box */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-[#FFF1B8] border-[3px] border-[#16130F] rounded-xl p-5 sm:p-6 shadow-[4px_4px_0_#16130F]">
              <div>
                <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none">Live class</p>
                <h4 className="mt-1 font-urbanist font-black text-[17px] text-[#16130F]">Want to prepare for IELTS?</h4>
                <p className="mt-1 text-[13px] text-[#5B544A] leading-normal">Join upcoming live workshops and university webinars led by certified international mentors.</p>
              </div>
              <div className="flex items-center justify-start sm:justify-end">
                <Link
                  to="/events"
                  className="no-shine px-5 py-3 rounded-full border-2 border-[#16130F] bg-[#D0362E] hover:bg-[#B52A23] text-white text-[13px] font-bold inline-flex items-center gap-1.5 shadow-[3px_3px_0_#16130F] cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  <span>Explore Live Events</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Next Up Section */}
            <div className="border-t-2 border-dashed border-[#16130F33] pt-8 mt-12">
              <SubHead hi="Aage padho">Next Up</SubHead>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                {["IELTS Dates", "IELTS Band Score", "IELTS Results"].map((title, i) => (
                  <Link
                    key={title}
                    to={getBlogLink(title)}
                    className="group flex flex-col justify-between p-5 bg-white border-[3px] border-[#16130F] rounded-xl shadow-[4px_4px_0_#16130F] hover:-translate-y-0.5 transition-transform"
                    style={{ borderLeftWidth: 10, borderLeftColor: DESI_TONES[i % DESI_TONES.length].c }}
                  >
                    <h4 className="font-urbanist font-black text-[16px] text-[#16130F] mb-4">{title}</h4>
                    <span className="text-[13px] font-bold text-[#D0362E] flex items-center gap-1">
                      Read Now <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* IELTS Link Grids */}
            <div className="border-t-2 border-dashed border-[#16130F33] pt-8 mt-10 space-y-12">
              <LinkGrid hi="Zaroori info" title="IELTS Important Information" links={importantInfoLinks} getLink={getBlogLink} />
              <LinkGrid hi="Kaunse desh" title="IELTS Accepting Countries" links={acceptingCountriesLinks} getLink={getBlogLink} />
              <LinkGrid hi="University" title="IELTS Accepting Universities" links={acceptingUniversitiesLinks} getLink={getBlogLink} />
              <LinkGrid hi="Test centre" title="IELTS Test Centre and Dates in India" links={testCentresLinks} getLink={getBlogLink} />
            </div>

          </main>

          {/* Right Sidebar Widgets */}
          <aside className="lg:sticky lg:top-28 space-y-6 min-w-0">
            <div className="p-6 rounded-[14px] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] text-white" style={{ background: '#B8285B', transform: 'rotate(-0.6deg)' }}>
              <span className="text-[10.5px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: '#FFE08A' }}>Preparation Guides</span>
              <h3 className="font-urbanist font-black text-[20px] leading-snug mb-2">
                Band 8+ IELTS Articles & Tips
              </h3>
              <p className="text-[13px] text-white/90 leading-relaxed mb-5">
                Explore proven speaking cue cards, reading skimming tricks, and task-2 templates.
              </p>
              <Link
                to="/blogs"
                className="no-shine w-full text-center py-3 bg-white text-[#16130F] rounded-full border-2 border-[#16130F] text-[13px] font-bold hover:bg-[#FFF1B8] transition-colors flex items-center justify-center gap-1.5 shadow-[3px_3px_0_#16130F] cursor-pointer"
              >
                <span>Browse Prep Blogs</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="p-6 rounded-[14px] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] text-white" style={{ background: '#14837E', transform: 'rotate(0.6deg)' }}>
              <span className="text-[10.5px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: '#FFE08A' }}>Live Workshops</span>
              <h3 className="font-urbanist font-black text-[20px] leading-snug mb-2">
                Study Abroad Events & Fairs
              </h3>
              <p className="text-[13px] text-white/90 leading-relaxed mb-5">
                Join live webinars, meet university delegates & attend expert coaching masterclasses.
              </p>
              <Link
                to="/events"
                className="no-shine w-full text-center py-3 bg-white text-[#16130F] rounded-full border-2 border-[#16130F] text-[13px] font-bold hover:bg-[#FFF1B8] transition-colors flex items-center justify-center gap-1.5 shadow-[3px_3px_0_#16130F] cursor-pointer"
              >
                <span>Explore Upcoming Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

          </aside>

        </div>

        {/* Closing CTA */}
        <BookOkCta
          className="mt-14"
          hi="Taiyari ka plan"
          text="Syllabus samajh aa gaya? Ab apna IELTS plan free 1:1 call mein mentor ke saath banao."
        />
      </div>
    </div>
  );
};

export default IELTSSyllabusPage;
