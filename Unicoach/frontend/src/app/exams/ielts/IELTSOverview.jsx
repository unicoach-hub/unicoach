import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Compass,
  ArrowRight,
  Award,
  UserCheck,
  AlertTriangle,
  ArrowUpRight,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';
import { API_BASE_URL } from '../../../config';

import CapIcon from '../../../components/ui/CapIcon';
import { StatStrip, Donut } from '../../../components/ui/Infographics';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

// Desi Pop building blocks for the IELTS guide
const TABLE_WRAP = 'overflow-x-auto bg-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] rounded-xl my-6';
const THEAD = 'bg-[#F2B705] text-[#16130F] text-[12px] uppercase tracking-wider border-b-[3px] border-[#16130F]';
const TBODY = 'divide-y-2 divide-[#16130F1A] text-[#3D362E]';
const INK_BOX = 'bg-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] rounded-xl';
const BOX_TITLE = 'font-urbanist font-black text-[#16130F] text-[15px]';
const BOX_TEXT = 'text-[13.5px] text-[#5B544A] leading-relaxed';
const LINK = 'text-[#D0362E] font-bold underline decoration-2 underline-offset-2 hover:text-[#B8285B]';
const SECTION_HI = {
  'section-1': 'IELTS kya hai',
  'section-2': 'Band score',
  'section-3': 'Kaunsa test',
  'section-4': 'Check kaise hoga',
  'section-5': 'Kitna kharcha',
  'section-6': 'Kab dein',
  'section-7': 'Centre aur result',
  'section-8': 'Taiyari ka tareeka',
  'section-9': 'Aur jaankari',
};
const IELTSOverview = () => {
  const [activeSection, setActiveSection] = useState('section-1');
  const [dbBlogs, setDbBlogs] = useState([]);
  const API_URL = API_BASE_URL;

  useEffect(() => {
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
    "ielts-practice-test": "/exams/ielts/overview"
  };

  const getBlogLink = (title) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    if (ieltsRoutesMap[slug]) {
      return ieltsRoutesMap[slug];
    }
    
    const blogExists = dbBlogs.some(b => b.slug === slug);
    if (blogExists) {
      return `/blogs/${slug}`;
    }
    return `/blogs?search=${encodeURIComponent(title)}`;
  };

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
  const sectionRefs = {
    'section-1': useRef(null),
    'section-2': useRef(null),
    'section-3': useRef(null),
    'section-4': useRef(null),
    'section-5': useRef(null),
    'section-6': useRef(null),
    'section-7': useRef(null),
    'section-8': useRef(null),
    'section-9': useRef(null),
  };

  const menuItems = [
    { id: 'section-1', label: '1. What is IELTS and Why Does It Matter for Study Abroad?' },
    { id: 'section-2', label: '2. IELTS Scoring: What is a Good IELTS Band Score?' },
    { id: 'section-3', label: '3. IELTS Test Formats: Academic vs General Training' },
    { id: 'section-4', label: '4. How Will I Be Evaluated in the IELTS Exam?' },
    { id: 'section-5', label: '5. How Much Does the IELTS Exam Cost?' },
    { id: 'section-6', label: '6. When Should I Appear For IELTS?' },
    { id: 'section-7', label: '7. IELTS Test Centers, Results, and Eligibility for Study Abroad Aspirants' },
    { id: 'section-8', label: '8. How to Prepare For IELTS Considering Timelines & Deadlines?' },
    { id: 'section-9', label: '9. More Information About IELTS Band Scores' },
  ];

  // Monitor scrolling to highlight active section in index sidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const [sectionId, ref] of Object.entries(sectionRefs)) {
        if (ref.current) {
          const offsetTop = ref.current.offsetTop;
          const offsetHeight = ref.current.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const ref = sectionRefs[sectionId];
    if (ref && ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop - 110,
        behavior: 'smooth',
      });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF6E5] pb-20 font-['Onest',sans-serif] text-[#16130F] overflow-x-clip">

      {/* Hero: mustard poster band */}
      <DesiHero
        tone="mustard"
        sign={{ hi: 'आइल्ट्स', en: 'IELTS DESK' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams' }, { label: 'IELTS' }]}
        title="IELTS Exam for Study Abroad: Your Ultimate Guide to Success in 2026"
        subtitle="Planning to study abroad in the UK, USA, Canada, Australia, New Zealand, or Ireland? The first step is proving your English proficiency, and the IELTS exam is the most trusted choice worldwide. IELTS (International English Language Testing System) is often the key to starting your professional journey around the globe."
        stickers={(
          <>
            <Sticker bg="#16130F" fg="#FFFFFF" tilt={-2}><Compass size={14} />Comprehensive Exam Guide</Sticker>
            <Sticker tilt={1.5}><Clock size={14} />Updated: 2026 Edition</Sticker>
            <Sticker bg="#FBD9E6" tilt={-1}><Award size={14} />12,000+ Acceptances</Sticker>
          </>
        )}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">

        {/* Highlight Banner */}
        <div className="relative z-10 -mt-6 flex items-start sm:items-center gap-4 bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#D0362E] p-4 sm:p-5 rounded-xl mb-12 rotate-[-0.4deg]">
          <div className="w-10 h-10 rounded-full bg-[#D0362E] border-2 border-[#16130F] flex items-center justify-center text-white flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-urbanist font-black text-[#16130F] text-[16px]">Major Update Alert!!</h4>
            <p className="text-[13.5px] text-[#5B544A] font-medium mt-0.5">
              IELTS Exam base registration fees were updated in March 2025. Be sure to check the updated schedule and local pricing details.
            </p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)_230px] xl:grid-cols-[250px_minmax(0,1fr)_290px] gap-6 lg:gap-8 items-start">

          {/* Left Sticky Sidebar Index */}
          <aside className="hidden lg:block sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 pb-2">
            <InkCard className="p-4">
              <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Is page pe</p>
              <h3 className="mt-1 mb-3 font-urbanist font-black text-[16px]">On This Page</h3>
              <nav className="flex flex-col gap-1.5">
                {menuItems.map((item, mi) => {
                  const isActive = activeSection === item.id;
                  const tone = DESI_TONES[mi % 4];
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      style={isActive ? { background: tone.c, color: tone.fg } : undefined}
                      className={`no-shine w-full text-left py-2 px-2.5 rounded-lg border-2 text-[12.5px] font-bold transition-colors leading-snug cursor-pointer
                        ${isActive
                          ? 'border-[#16130F] shadow-[3px_3px_0_#16130F]'
                          : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </InkCard>
          </aside>

          {/* Center Main Guide Column */}
          <InkCard as="main" className="min-w-0 space-y-14 p-5 sm:p-8 md:p-12">

            {/* Section 1 */}
            <section id="section-1" ref={sectionRefs['section-1']} className="scroll-mt-28">
              <DesiHeading hi={SECTION_HI['section-1']} className="mb-5">
                1. What is IELTS and Why Does It Matter for Study Abroad?
              </DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-5 [&_strong]:text-[#16130F]">
                <p>
                  It is a standardised exam that helps students establish their proficiency and expertise in the English language. This is especially important for non-native English speakers. IELTS is also required for students whose medium of instruction for their 12th board exams is not English.
                </p>
                <p>
                  It is recognized as a mark of excellence in English by over 12,000 universities and immigration authorities across 150+ countries worldwide. This directly impacts a student's admissions, visa, and scholarship applications.
                </p>

                <StatStrip
                  stats={[
                    { value: '12,000+', label: 'Universities and immigration authorities' },
                    { value: '150+', label: 'Countries' },
                    { value: '0–9', label: 'Band score scale' },
                    { value: '4', label: 'Skills: Listening, Reading, Writing, Speaking' },
                  ]}
                />
                
                <div className={`${INK_BOX} border-t-[8px] border-t-[#14837E] p-6 space-y-4 my-6`}>
                  <h4 className={BOX_TITLE}>Why is IELTS important?</h4>
                  <ul className="space-y-3 text-[13.5px] text-[#5B544A] leading-relaxed list-disc list-outside pl-5 marker:text-[#D0362E]">
                    <li>
                       <strong className="text-[#16130F] font-bold">University Admissions:</strong> Most prominent universities in the UK, USA, Australia, Canada, New Zealand, etc, set a minimum IELTS Academic requirement to 6.0-7.5+ overall and no band less than 6.0. For example, the University of Manchester mandates a minimum of 6.5 overall band. Whereas, top universities in UK such as Oxford & Cambridge demand an overall band of 7.5+.
                    </li>
                    <li>
                      <strong className="text-[#16130F] font-bold">Visa Applications:</strong> Countries like UK & USA mandate IELTS (or other equivalent tests) for student visa applications and processing. For instance, the UK Student Route visa usually requires a minimum of CEFR B2 level (equivalent to IELTS 5.5 in each skill).
                    </li>
                    <li>
                      <strong className="text-[#16130F] font-bold">Scholarship Eligibility:</strong> Several top scholarships in the study abroad destinations around the world, like the Chevening Scholarships (UK) and Australia Awards, often require a strong score (7.0+) as a part of being eligible for the financial aid.
                    </li>
                  </ul>
                </div>

                <p>
                  IELTS evaluates an individual’s skills dynamically by testing their English listening, reading, writing, and speaking skills. This is to ensure that you are able to understand what is being taught at the university and speak better at presentations and classroom discussions.
                </p>
                <p>
                  Out of all the other English proficiency tests, IELTS stands to be a widely recognised exam worldwide. So even if the students switch their destination country from Canada to the UK, their IELTS score remains valid and accepted. The test prompts students to practice real-world communication, enhancing their confidence manifold.
                </p>
                <p>
                  There are also certain exceptions to this, which are typically known as IELTS waivers. If you are unsure whether your target institute accepts IELTS, you can check that here.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" ref={sectionRefs['section-2']} className="scroll-mt-28">
              <DesiHeading hi={SECTION_HI['section-2']} className="mb-5">
                2. IELTS Scoring: What is a Good IELTS Band Score?
              </DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-5 [&_strong]:text-[#16130F]">
                <p>
                  IELTS works on a 9-point band score system. Students get a band score between 0 and 9, with a 9-band being the highest one can achieve. Usually, universities and colleges have a minimum IELTS band score requirement. Therefore, students are expected to score above that threshold for a fair chance of getting an admission offer. Countries might also have IELTS band requirements, which can vary depending on the student's educational background and past work experience.
                </p>
                <p>
                  Band 9 represents an “Expert” level of English, accurate, fluent, and fully operational. Lower bands reflect varying degrees of proficiency, down to Band 0, which indicates no attempt was made.
                </p>
                <p>
                  The band score of a student is an average if four components - Listening, Reading, Writing, and Speaking. It’s rounded to the nearest 0.5 band (e.g., 6.25 becomes 6.5, 6.75 becomes 7.0).
                </p>

                {/* Country score requirement table */}
                <div className={TABLE_WRAP}>
                  <table className="w-full min-w-[620px] text-left text-[13px] font-medium">
                    <thead className={THEAD}>
                      <tr>
                        <th className="py-3.5 px-4 font-black">Country</th>
                        <th className="py-3.5 px-4 font-black">UG IELTS Band Score Requirement</th>
                        <th className="py-3.5 px-4 font-black">PG IELTS Band Score Requirement</th>
                        <th className="py-3.5 px-4 font-black">How do I get an IELTS waiver?</th>
                      </tr>
                    </thead>
                    <tbody className={TBODY}>
                      {[
                        { country: 'United States of America', ug: '6.0 – 7.0', pg: '6.5 – 7.5', linkText: 'Studying in the USA without IELTS' },
                        { country: 'United Kingdom', ug: '6.0 – 7.0', pg: '6.5 – 7.5 (top programs may need 7.0+)', linkText: 'Studying in the UK without IELTS' },
                        { country: 'Canada', ug: '6.0 – 7.5', pg: '6.5 – 8.0', linkText: 'Study in Canada without IELTS' },
                        { country: 'Australia', ug: '6.0 – 7.0', pg: '6.5 – 7.0', linkText: 'Study in Australia without IELTS' },
                        { country: 'New Zealand', ug: '6.0 – 7.0', pg: '6.5 – 7.5', linkText: 'Study in New Zealand without IELTS' },
                        { country: 'Ireland', ug: '6.0 – 6.5', pg: '6.5 – 7.0', linkText: 'Study in Ireland without IELTS' }
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#FFF6E5]">
                          <td className="py-3.5 px-4 font-bold text-[#16130F]">{row.country}</td>
                          <td className="py-3.5 px-4">{row.ug}</td>
                          <td className="py-3.5 px-4">{row.pg}</td>
                          <td className="py-3.5 px-4">
                            <Link to={`/blogs?search=${encodeURIComponent(row.linkText)}`} className={`${LINK} inline-flex items-center gap-0.5`}>
                              <span>{row.linkText}</span>
                              <ArrowUpRight size={10} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-[12px] text-[#5B544A] italic">
                  Please note: These are averages derived from university and visa requirements; actual requirements vary by country, institution, and even by program level (UG vs PG)
                </p>
                <p>
                  A UK Student Visa (Degree level) usually requires a minimum overall of 5.5 across all skills (aligned with CEFR B2). For most undergraduate admissions, aiming for IELTS 6.0–6.5 gives you flexibility and confidence. For postgraduate programs, particularly at elite universities, bands of 6.5–7.5 are commonly expected.
                </p>
                <p>
                  As you might have observed, postgraduate (PG) programs generally require a higher IELTS score than UG programs. This is because postgraduate programs have advanced academic rigour and specialised coursework. Day-to-day tasks such as thesis writing, presentations, participation in seminars, etc., generally require higher language proficiency. Therefore, universities have higher standards for PG programs to ensure students can succeed in their studies.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" ref={sectionRefs['section-3']} className="scroll-mt-28">
              <DesiHeading hi={SECTION_HI['section-3']} className="mb-5">
                3. IELTS Test Formats: Academic vs General Training
              </DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-5 [&_strong]:text-[#16130F]">
                <p>
                  There are different types of IELTS exams out there. This is because IELTS is not restricted to studying abroad. It is also sometimes used for working professionals and immigration requirements such as academic study, immigration, or UK specific visas. The table below summarises detailed information on each IELTS type for reference.
                </p>

                {/* Detailed Table */}
                <div className={TABLE_WRAP}>
                  <table className="w-full min-w-[620px] text-left text-[13px] font-medium">
                    <thead className={THEAD}>
                      <tr>
                        <th className="py-3.5 px-4 font-black">Feature</th>
                        <th className="py-3.5 px-4 font-black">IELTS Academic</th>
                        <th className="py-3.5 px-4 font-black">IELTS General Training</th>
                        <th className="py-3.5 px-4 font-black">IELTS UKVI</th>
                      </tr>
                    </thead>
                    <tbody className={TBODY}>
                      {[
                        { feature: 'Purpose', ac: 'University, postgraduate study, professional registration', gt: 'Immigration, work, and non-academic training', ukvi: 'UK - specific visas (study, work, migration) also includes Life Skills tests' },
                        { feature: 'Test Content', ac: 'Academic-focused texts and tasks', gt: 'Focuses on everyday English with workplace contexts', ukvi: 'Same content; one must book via Secure English Language Test centers' },
                        { feature: 'Acceptance', ac: 'Universities and professional bodies globally', gt: 'Immigration/employers', ukvi: 'UKVI-approved for UK visa applications' },
                        { feature: 'Test Centres', ac: 'Regular centers and online (paper/computer)', gt: 'Same as Academic IELTS', ukvi: 'Only in UKVI-approved centres' },
                        { feature: 'Who needs it?', ac: 'Students and professionals needing academic/vocational proof', gt: 'Migrants or employees needing English proficiency', ukvi: 'Applicants to UK needing credible SELT scores for immigration' },
                        { feature: 'Know more', ac: 'IELTS Academic', gt: 'IELTS General Training', ukvi: 'IELTS UKVI', isLink: true }
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#FFF6E5]">
                          <td className="py-3.5 px-4 font-bold text-[#16130F]">{row.feature}</td>
                          <td className="py-3.5 px-4">
                            {row.isLink ? <Link to="/exams/ielts/overview" className={LINK}>{row.ac}</Link> : row.ac}
                          </td>
                           <td className="py-3.5 px-4">
                            {row.isLink ? <Link to="/exams/ielts/types" className={LINK}>{row.gt}</Link> : row.gt}
                          </td>
                          <td className="py-3.5 px-4">
                            {row.isLink ? <Link to="/exams/ielts/types" className={LINK}>{row.ukvi}</Link> : row.ukvi}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-[13.5px] text-[#5B544A] leading-relaxed">
                  The distinction between Academic and General Training tests is overseen by the British Council and IDP's descriptions. IELTS UKVI has the same test content but is administered at secure, UKVI-approved centers and required for UK visa processing. Academic reading uses formal/passage extracts from academic sources; General Training reading uses workplace or everyday texts. UKVI mirrors whichever version you choose.
                </p>
                <p className="bg-[#FFF1B8] border-[3px] border-[#16130F] shadow-[4px_4px_0_#F2B705] p-4 rounded-xl text-[13.5px] text-[#16130F] font-semibold leading-relaxed">
                  <CapIcon /> <strong>Student Tip:</strong> All students planning to study abroad should opt for the IELTS Academic test, unless your university explicitly states otherwise. The UKVI version is identical in format but must be taken at certified test centers if required by UK immigration rules. Unless your visa or program mandates it, Academic is typically the right choice.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section-4" ref={sectionRefs['section-4']} className="scroll-mt-28">
              <DesiHeading hi={SECTION_HI['section-4']} className="mb-5">
                4. How Will I Be Evaluated in the IELTS Exam?
              </DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-6 [&_strong]:text-[#16130F]">
                <p>
                  The IELTS Academic exam covers all four aspects of language evaluation: Speaking, Reading, Listening, and Writing. Out of these four sections, Reading, Listening, and Writing take place in one go. Each section is scored separately and contributes equally (25%) to your overall band score. However, the Speaking evaluation happens separately; an evaluator conducts this test in person, either on the same day or up to 7 days before/after the other tests. More details about each section are mentioned below.
                </p>
                <div className="space-y-4">
                  <div className={`${INK_BOX} p-6 border-l-[8px]`} style={{ borderLeftColor: '#D0362E' }}>
                    <h4 className={`${BOX_TITLE} mb-1`}>Speaking (11-14 Minutes)</h4>
                    <p className={BOX_TEXT}>
                      Format: A face-to-face interview with a certified examiner. This module is conducted in a one-on-one interview-like setting and is divided into three parts: introduction/general questions, a cue card presentation (1-2 minutes speak, 1 minute planning), and related discussion. Fluency, vocabulary, pronunciation, and grammatical accuracy are assessed.
                    </p>
                  </div>
                  <div className={`${INK_BOX} p-6 border-l-[8px]`} style={{ borderLeftColor: '#B8285B' }}>
                    <h4 className={`${BOX_TITLE} mb-1`}>Writing (60 Minutes)</h4>
                    <p className={BOX_TEXT}>
                      Format: This section is divided into two tasks. Task 1 involves writing a summary of at least 150 words based on visual/graphical charts or processes. Task 2 involves writing an essay of at least 250 words answering a prompt. Grammar, coherence, cohesion, and vocabulary are key factors.
                    </p>
                  </div>
                  <div className={`${INK_BOX} p-6 border-l-[8px]`} style={{ borderLeftColor: '#F2B705' }}>
                    <h4 className={`${BOX_TITLE} mb-1`}>Reading (60 Minutes)</h4>
                    <p className={BOX_TEXT}>
                      Structure: Consists of three long passages from books, journals, magazines, and newspapers. Contains 40 questions (multiple choice, heading match, diagram fill, true/false) assessing understanding of core concepts, argument logic, and author tone.
                    </p>
                  </div>
                  <div className={`${INK_BOX} p-6 border-l-[8px]`} style={{ borderLeftColor: '#14837E' }}>
                    <h4 className={`${BOX_TITLE} mb-1`}>Listening (30 Minutes)</h4>
                    <p className={BOX_TEXT}>
                      Structure: Four audio clips (conversations, monologues in social/educational settings) with 40 questions. Audio clips are played only once. Writing down answers simultaneously is highly recommended!
                    </p>
                  </div>
                </div>

                <div className="shadow-[6px_6px_0_#16130F] rounded-[18px]">
                  <Donut
                    kicker="Time per module"
                    title="How long each IELTS module takes"
                    segments={[
                      { label: 'Reading', value: 60, display: '60 min' },
                      { label: 'Writing', value: 60, display: '60 min' },
                      { label: 'Listening', value: 30, display: '30 min' },
                      { label: 'Speaking', value: 12.5, display: '11–14 min' },
                    ]}
                  />
                </div>
                 
                <div className={TABLE_WRAP}>
                  <table className="w-full min-w-[620px] text-left text-[13px] font-medium">
                    <thead className={THEAD}>
                      <tr>
                        <th className="py-2.5 px-4 font-black">Module</th>
                        <th className="py-2.5 px-4 font-black">Duration</th>
                        <th className="py-2.5 px-4 font-black">Focus</th>
                        <th className="py-2.5 px-4 font-black">Know more</th>
                      </tr>
                    </thead>
                    <tbody className={TBODY}>
                      {[
                        { module: 'Speaking', duration: '11 - 14 minutes', focus: 'Communicating verbally in English', path: '/exams/ielts/speaking' },
                        { module: 'Writing', duration: '60 minutes', focus: 'Expressing yourself in written English', path: '/exams/ielts/writing' },
                        { module: 'Reading', duration: '60 minutes', focus: 'Understanding written English', path: '/exams/ielts/reading' },
                        { module: 'Listening', duration: '30 minutes', focus: 'Comprehending spoken English', path: '/exams/ielts/listening' }
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#FFF6E5]">
                          <td className="py-2.5 px-4 font-bold text-[#16130F]">{row.module}</td>
                          <td className="py-2.5 px-4">{row.duration}</td>
                          <td className="py-2.5 px-4 text-[#5B544A]">{row.focus}</td>
                          <td className="py-2.5 px-4">
                            <Link to={row.path} className={LINK}>
                              {row.module} module
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[13px] text-[#5B544A]">
                  You can refer to <Link to="/exams/ielts/syllabus" className={LINK}>this page</Link> for an overview of the IELTS exam syllabus and pattern.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section-5" ref={sectionRefs['section-5']} className="scroll-mt-28">
              <DesiHeading hi={SECTION_HI['section-5']} className="mb-5">
                5. How Much Does the IELTS Exam Cost?
              </DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-5 [&_strong]:text-[#16130F]">
                <p>
                  Unlike domestic college entrance exams, IELTS carries higher fees due to global administration, security measures, and personalized speaking evaluators:
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                  <div className="border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] p-4 sm:p-5 rounded-xl text-center" style={{ background: '#FFF1B8', transform: 'rotate(-1deg)' }}>
                    <p className="text-[10.5px] text-[#5B544A] uppercase font-black tracking-wider mb-1">Academic / GT</p>
                    <p className="font-urbanist text-[19px] sm:text-[21px] font-black text-[#16130F]">INR 19,000</p>
                    <p className="text-[11px] font-semibold text-[#5B544A] mt-1">Standard Rate</p>
                  </div>
                  <div className="border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] p-4 sm:p-5 rounded-xl text-center" style={{ background: '#DDF3EF', transform: 'rotate(0.8deg)' }}>
                    <p className="text-[10.5px] text-[#5B544A] uppercase font-black tracking-wider mb-1">IELTS UKVI</p>
                    <p className="font-urbanist text-[19px] sm:text-[21px] font-black text-[#16130F]">INR 18,250</p>
                    <p className="text-[11px] font-semibold text-[#5B544A] mt-1">Secure Centres</p>
                  </div>
                  <div className="border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] p-4 sm:p-5 rounded-xl text-center" style={{ background: '#FBD9E6', transform: 'rotate(-0.6deg)' }}>
                    <p className="text-[10.5px] text-[#5B544A] uppercase font-black tracking-wider mb-1">Life Skills</p>
                    <p className="font-urbanist text-[19px] sm:text-[21px] font-black text-[#16130F]">INR 17,000</p>
                    <p className="text-[11px] font-semibold text-[#5B544A] mt-1">UK Visa route</p>
                  </div>
                  <div className="border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] p-4 sm:p-5 rounded-xl text-center" style={{ background: '#FCE3DA', transform: 'rotate(1deg)' }}>
                    <p className="text-[10.5px] text-[#5B544A] uppercase font-black tracking-wider mb-1">One Skill Retake</p>
                    <p className="font-urbanist text-[19px] sm:text-[21px] font-black text-[#16130F]">INR 12,000</p>
                    <p className="text-[11px] font-semibold text-[#5B544A] mt-1">Section Retake</p>
                  </div>
                </div>

                <p className="flex gap-2.5 bg-[#FFF1B8] border-[3px] border-[#16130F] shadow-[4px_4px_0_#F2B705] p-4 rounded-xl text-[13.5px] text-[#16130F] leading-relaxed font-semibold">
                  <AlertTriangle size={17} className="text-[#D0362E] shrink-0 mt-0.5" /><span>Note: Students need to pay the full base fee again for each attempt, and they can separately retake just one section (One Skill Retake) for INR 12,650.</span>
                </p>
                <p>
                  Therefore, while one can appear for the exam multiple times, it makes sense financially to achieve the desired band score on the first attempt. You can learn more about <Link to="/exams/ielts/fees" className={LINK}>IELTS fees for various exam types</Link>.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="section-6" ref={sectionRefs['section-6']} className="scroll-mt-28">
              <DesiHeading hi={SECTION_HI['section-6']} className="mb-5">
                6. When Should I Appear For IELTS?
              </DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-5 [&_strong]:text-[#16130F]">
                <p>
                  Depending on your preferred intake, appearing for the IELTS exam 3-6 months before the desired intake is usually recommended. So, if you want to apply for the September 2025 intake, you should appear for IELTS from March to May. This would enable you to:
                </p>
                <ul className="list-disc list-outside space-y-2.5 text-[14px] text-[#5B544A] pl-6 marker:text-[#D0362E]">
                  <li>Ensure you have your IELTS score ready before application deadlines.</li>
                  <li>Be prepared in advance for your college applications and focus on other documents.</li>
                  <li>Retake the exam if required to improve your band score.</li>
                </ul>
                <p>
                  An IELTS exam score is valid for 2 years from the test date. Therefore, 3-6 months before the intended intake is the perfect time to appear for IELTS.
                </p>
                <p>
                  Additionally, it is important to note that January to March and June to August are high-demand months for the IELTS exam in India. Therefore, you should book your IELTS exam in advance at the test centre of your convenience to avoid difficulties later. You can also book the IELTS exam up to one year in advance with the option to reschedule. Here is a <Link to="/exams/ielts/registration" className={LINK}>detailed guide on IELTS registration</Link>.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" ref={sectionRefs['section-7']} className="scroll-mt-28">
              <DesiHeading hi={SECTION_HI['section-7']} className="mb-5">
                7. IELTS Test Centers, Results, and Eligibility for Study Abroad Aspirants
              </DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-5 [&_strong]:text-[#16130F]">
                <p>
                  The IELTS exam has to be given in a registered test centre. In India, IELTS is conducted by IDP. There are a total of 82 test centres across 75 cities in India. Find your nearest IELTS test centre today.
                </p>
                <p>
                  The process for registering at a test centre is fairly straightforward. You must decide your test date and then book a slot accordingly. Two ways of taking the test in a centre are Pen and Paper-based and Computer-based. For computer-based tests, slots are available almost daily from Monday to Saturday. To find the exact dates of paper-based tests across different centres in India, check our comprehensive <Link to="/exams/ielts/dates" className={LINK}>IELTS Dates page</Link>.
                </p>
                <p>
                  There are two main requirements for appearing in the IELTS exam, often called IELTS eligibility criteria:
                </p>
                <div className={`${INK_BOX} p-5 space-y-2 text-[14px] text-[#3D362E] font-semibold my-4`}>
                  <p>1. The applicant must be of 16 years of age or above.</p>
                  <p>2. The applicant must have a valid passport (mandatory – other IDs such as Aadhaar or PAN are not accepted).</p>
                </div>
                <p className="flex gap-2.5 text-[13.5px] text-[#16130F] bg-[#FCE3DA] border-[3px] border-[#16130F] shadow-[4px_4px_0_#D0362E] p-4 rounded-xl font-semibold leading-relaxed my-4">
                  <ShieldAlert size={18} className="text-[#D0362E] shrink-0 mt-0.5" /><span>IELTS follows a strict “No Passport, No Exam” policy. Therefore, failure to bring a valid passport to the centre on the examination date will result in the candidate not being allowed to appear for the exam. Other forms of identification, such as Aadhar, PAN card, etc., are not accepted.</span>
                </p>
                <p>
                  Once you have successfully appeared for the IELTS exam, it usually takes 2-13 days to receive the results. For computer-based IELTS students can expect the results within 3-5 days. In case you appeared for paper-based IELTS, you receive results within 11-13 days.
                </p>
                <p>
                  The results are received in a digital test report form (TRF). An IELTS TRF is your official scoresheet containing your sectional and overall scores, reflecting your proficiency level. You can also request a physical copy of your TRF.
                </p>
                <p>
                  You can share your IELTS results with as many universities as you’d like, but remember:
                </p>
                <ul className="list-disc list-outside space-y-2.5 text-[14px] text-[#5B544A] pl-6 marker:text-[#D0362E]">
                  <li>You can request up to 5 additional Test Report Forms (ATRFs) for free. Just indicate which universities or institutions should receive them on your IELTS Application Form.</li>
                  <li>After the first 5, each Additional TRF or ATRF costs INR 250.</li>
                </ul>
                <p className="text-[13px] text-[#5B544A] mt-3">
                  Additional information about IELTS Results can be found in our <Link to="/exams/ielts/results" className={LINK}>IELTS Results guide</Link>.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="section-8" ref={sectionRefs['section-8']} className="scroll-mt-28">
              <DesiHeading hi={SECTION_HI['section-8']} className="mb-5">
                8. How to Prepare For IELTS Considering Timelines & Deadlines?
              </DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-5 [&_strong]:text-[#16130F]">
                <p>
                  People often confuse preparing for the IELTS exam with improving their proficiency in the English language. This is especially true when appearing for the IELTS academic test, focusing on academic English. Therefore, having a basic knowledge of English and sufficient practice in each module is enough to clear the IELTS exam with flying colours.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
                  <div className={`${INK_BOX} p-6 border-t-[8px]`} style={{ borderTopColor: '#14837E' }}>
                    <h4 className={`${BOX_TITLE} mb-2`}>Self-Preparation</h4>
                    <p className={BOX_TEXT}>
                      Self-preparation is typically ideal for students who have completed their entire education in an English-medium school and scored more than 90 marks in the English paper of their 12th board exams.
                      These students mainly require practice and familiarisation with the exam format. This can easily be achieved by practicing with online test series such as UniCoach’s learn-it-yourself modules.
                      You can also refer to practice tests from official Cambridge IELTS books, online mock tests, and timed drills.
                    </p>
                  </div>
                  <div className={`${INK_BOX} p-6 border-t-[8px]`} style={{ borderTopColor: '#B8285B' }}>
                    <h4 className={`${BOX_TITLE} mb-2`}>Coaching/ Expert Guidance</h4>
                    <p className={BOX_TEXT}>
                      For students who are less confident in one or more modules of the IELTS test, it is recommended to take proper coaching. Check out UniCoach’s fully online IELTS coaching program. Those who are aiming for a specific course can also enrol for proper coaching and lessons.
                      Coaching helps with preparing the weak areas better, like pronunciation in speaking or Coherence in Writing, through proven techniques.
                    </p>
                  </div>
                </div>
                <p className="flex gap-2.5 bg-[#DDF3EF] p-4 border-[3px] border-[#16130F] shadow-[4px_4px_0_#14837E] rounded-xl text-[13.5px] text-[#16130F] font-semibold leading-relaxed">
                  <Lightbulb size={18} className="text-[#14837E] shrink-0 mt-0.5" /><span>Pro Tip: Take a diagnostic test at the very beginning. It will give you a clear idea of your starting band score and how much effort/time you’ll realistically need.</span>
                </p>
                <p>
                  For most students, the typical timeline for preparation is 1-2 months with a daily practice of about 1-2 hours. However, it does depend on:
                </p>
                <ul className="list-disc list-outside space-y-2.5 text-[14px] text-[#5B544A] pl-6 marker:text-[#D0362E]">
                  <li>Expected band score and current level of the student</li>
                  <li>Timeline constraints, such as the application deadline</li>
                  <li>If the student is severely lagging behind in a specific module, such as speaking</li>
                </ul>
                <p>
                  An expert IELTS trainer can make the best call, judging the student's proficiency level and recommending the best course of action. You can connect with certified mentors in our free <Link to="/events" className={LINK}>live webinars and events</Link>.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="section-9" ref={sectionRefs['section-9']} className="scroll-mt-28">
              <DesiHeading hi={SECTION_HI['section-9']} className="mb-5">
                9. More Information About IELTS Band Scores
              </DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-5 [&_strong]:text-[#16130F]">
                <p>
                  As mentioned before, it is important to understand the band score requirements for your specific university and course. If you want to know more about admission requirements, speak to one of our expert study abroad counsellors.
                </p>
                <p>
                  Even the best-performing students do not generally score beyond an 8-band score, while the majority of students who study abroad score between 6.5 and 7.5. Here is more information on IELTS band scores and how they are calculated.
                </p>
              </div>
            </section>

            {/* Next Up Section */}
            <div className="border-t-[3px] border-dashed border-[#16130F33] pt-8 mt-12">
              <DesiHeading hi="Aage padho" className="mb-5">Next Up</DesiHeading>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['IELTS Practice Test', 'IELTS Modules', 'IELTS Fees'].map((t, ti) => (
                  <Link key={t} to={getBlogLink(t)} className="flex flex-col justify-between p-5 bg-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] rounded-xl hover:-translate-y-0.5 transition-transform group" style={{ borderTop: `8px solid ${DESI_TONES[[2, 0, 1][ti]].c}` }}>
                    <h4 className="font-urbanist font-black text-[#16130F] text-[16px] mb-4">{t}</h4>
                    <span className="text-[13px] font-bold text-[#D0362E] flex items-center gap-1">
                      Read Now <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* IELTS Link Grids */}
            <div className="border-t-[3px] border-dashed border-[#16130F33] pt-8 mt-8 space-y-12">
              {[
                { hi: 'Zaroori info', title: 'IELTS Important Information', links: importantInfoLinks },
                { hi: 'University', title: 'IELTS Accepting Universities', links: acceptingUniversitiesLinks },
                { hi: 'Shehar aur date', title: 'IELTS Test Centre and Dates in India', links: testCentresLinks },
              ].map((grid) => (
                <div key={grid.title}>
                  <DesiHeading hi={grid.hi} className="mb-5">{grid.title}</DesiHeading>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                    {grid.links.map((link) => (
                      <Link
                        key={link}
                        to={getBlogLink(link)}
                        className="p-3.5 bg-[#FFF6E5] border-2 border-[#16130F] rounded-lg flex items-center justify-between gap-3 hover:bg-[#FCE38A] hover:shadow-[3px_3px_0_#16130F] transition-all group cursor-pointer"
                      >
                        <span className="text-[13px] font-bold text-[#3D362E] group-hover:text-[#16130F]">{link}</span>
                        <ArrowRight size={14} className="shrink-0 text-[#D0362E] group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </InkCard>

          {/* Right Floating Widgets Column */}
          <aside className="lg:sticky lg:top-28 space-y-6">

            {/* Widget A: Events CTA */}
            <div className="bg-[#14837E] text-white p-6 border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] rotate-[-0.6deg]" style={{ borderRadius: 14 }}>
              <span className="font-urbanist font-extrabold text-[15px] text-[#F2B705] leading-none block mb-1">Live workshop</span>
              <span className="text-[10.5px] font-black text-white/80 uppercase tracking-widest block mb-2">Live Workshops</span>
              <h3 className="font-urbanist text-[20px] font-black leading-snug mb-2">
                Study Abroad Events & Fairs
              </h3>
              <p className="text-[13px] text-white/90 leading-relaxed mb-5">
                Join live Q&A sessions with overseas admission delegates, visa officers, and top trainers.
              </p>
              <Link
                to="/events"
                className="w-full text-center py-3 bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] rounded-full text-[13px] font-bold shadow-[3px_3px_0_#16130F] hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explore Live Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget B: Contact widget */}
            <InkCard className="p-6 text-center" shadow="#B8285B">
              <div className="w-12 h-12 rounded-full bg-[#FBD9E6] text-[#B8285B] border-2 border-[#16130F] flex items-center justify-center mx-auto mb-4">
                <UserCheck size={20} />
              </div>
              <h4 className="font-urbanist font-black text-[#16130F] text-[16px] mb-2">Talk to a Counsellor</h4>
              <p className="text-[13px] text-[#5B544A] leading-relaxed mb-5">
                Unsure if you qualify for an IELTS waiver? Speak to our expert consultants today.
              </p>
              <Link
                to="/contact"
                className="w-full text-center py-3 border-2 border-[#16130F] bg-white text-[#16130F] rounded-full text-[13px] font-bold hover:bg-[#FCE38A] transition-colors block cursor-pointer"
              >
                Get Free Counselling
              </Link>
            </InkCard>

          </aside>

        </div>

        {/* Closing CTA */}
        <BookOkCta
          className="mt-14"
          hi="Band ka plan"
          title="Book OK Please."
          text="Kitna band chahiye, kab dena hai, waiver milega ya nahi? Free 1:1 call mein mentor se poocho."
        />
      </div>
    </div>
  );
};

export default IELTSOverview;
