import { Link } from 'react-router-dom';
import CapIcon from '../../../components/ui/CapIcon';
import {
  BookOpen,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Target,
  RefreshCw,
  Headphones,
  MessageCircle,
  CalendarDays,
} from 'lucide-react';
import { StatStrip, BarCompare, Donut, VersusCard, HookBand } from '../../../components/ui/Infographics';
import { JourneyPills } from '../../../components/ui/BrandElements';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

// Desi Pop building blocks shared by every IELTS detail route
const TABLE_WRAP = 'overflow-x-auto bg-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] rounded-xl my-6';
const THEAD = 'bg-[#F2B705] text-[#16130F] uppercase text-[11px] tracking-wider font-black border-b-[3px] border-[#16130F]';
const TBODY = 'divide-y-2 divide-[#16130F1A] text-[#3D362E]';
const INK_BOX = 'bg-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] rounded-xl';
const BOX_TITLE = 'font-urbanist font-black text-[#16130F] text-[15px]';
const BOX_TEXT = 'text-[13.5px] text-[#5B544A] leading-relaxed';
const CHART = 'shadow-[6px_6px_0_#16130F] rounded-[18px]';

const IELTSDetailPage = ({ pageKey }) => {

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
          <StatStrip
            stats={[
              { value: '12,000+', label: 'Organizations accept IELTS' },
              { value: '150+', label: 'Countries' },
              { value: '3.5M+', label: 'Test-takers every year' },
              { value: '0–9', label: 'Band score scale' },
            ]}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className={`${INK_BOX} p-5 border-t-[8px] border-t-[#14837E]`}>
              <h4 className={`${BOX_TITLE} mb-1`}>Global Acceptance</h4>
              <p className={BOX_TEXT}>
                Accepted by 12,000+ organizations in over 150 countries, including top colleges in USA, UK, Canada, Australia, and New Zealand.
              </p>
            </div>
            <div className={`${INK_BOX} p-5 border-t-[8px] border-t-[#B8285B]`}>
              <h4 className={`${BOX_TITLE} mb-1`}>Test Formats</h4>
              <p className={BOX_TEXT}>
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
          <div className={TABLE_WRAP}>
            <table className="w-full min-w-[400px] text-left text-[13px] font-medium">
              <thead className={THEAD}>
                <tr>
                  <th className="py-3 px-4">Test Type</th>
                  <th className="py-3 px-4">Primary Purpose</th>
                  <th className="py-3 px-4">Format Details</th>
                </tr>
              </thead>
              <tbody className={TBODY}>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">IELTS Academic</td>
                  <td className="py-3.5 px-4">Undergraduate, Postgraduate, and Professional Registration.</td>
                  <td className="py-3.5 px-4">Complex academic charts in Writing & college-level passages in Reading.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">IELTS General Training</td>
                  <td className="py-3.5 px-4">Immigration, Work visas, or below degree level training.</td>
                  <td className="py-3.5 px-4">Everyday English, workplace texts, letter writing tasks.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">IELTS UKVI</td>
                  <td className="py-3.5 px-4">UK visas, student route, or migration requirements.</td>
                  <td className="py-3.5 px-4">Taken at secure, UKVI-approved centers with identical test content.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={CHART}>
            <VersusCard
              kicker="Pick the right one"
              title="Academic vs General Training"
              left={{ title: 'IELTS Academic', tag: 'Study abroad', points: ['Undergraduate, Postgraduate, and Professional Registration', 'Complex academic charts in Writing', 'College-level passages in Reading'] }}
              right={{ title: 'General Training', tag: 'Work & migration', points: ['Immigration, Work visas, or below degree level training', 'Everyday English and workplace texts', 'Letter writing tasks'] }}
            />
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
          <StatStrip
            stats={[
              { value: '16+', label: 'Minimum age (guardian consent under 18)' },
              { value: 'None', label: 'Minimum academic qualification' },
              { value: 'Unlimited', label: 'Attempts allowed' },
            ]}
          />
          <div className="space-y-4 my-6">
            <div className="flex gap-4 p-5 bg-[#FCE3DA] border-[3px] border-[#16130F] shadow-[4px_4px_0_#D0362E] rounded-xl">
              <span className="w-10 h-10 rounded-full bg-[#D0362E] text-white border-2 border-[#16130F] grid place-items-center shrink-0"><AlertTriangle className="w-5 h-5" /></span>
              <div>
                <h4 className={`${BOX_TITLE} mb-1`}>Strict Passport Policy ("No Passport, No Exam")</h4>
                <p className="text-[13.5px] text-[#3D362E] leading-relaxed font-semibold">
                  You MUST bring your physical, original, and valid passport to the exam centre. Copies, Aadhaar cards, PAN cards, or digital IDs are strictly not accepted.
                </p>
              </div>
            </div>
            
            <div className={`${INK_BOX} p-5 space-y-3 text-[13.5px] text-[#5B544A] leading-relaxed`}>
              <p className="flex gap-2.5"><Target size={17} className="text-[#D0362E] shrink-0 mt-0.5" /><span><strong className="text-[#16130F]">Age Limit:</strong> Candidates must be at least 16 years old. If you are under 18, a guardian's consent form is required during slot booking.</span></p>
              <p className="flex gap-2.5"><span className="shrink-0 text-[#14837E]"><CapIcon /></span><span><strong className="text-[#16130F]">Academic Qualification:</strong> There are no minimum academic requirements to sit for IELTS. Anyone seeking global education can apply.</span></p>
              <p className="flex gap-2.5"><RefreshCw size={17} className="text-[#B8285B] shrink-0 mt-0.5" /><span><strong className="text-[#16130F]">Attempt Limit:</strong> You can attempt the test as many times as you like. There is no restriction on retakes.</span></p>
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
            <div className="p-4 rounded-xl border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] text-center" style={{ background: '#FFF1B8', transform: 'rotate(-1deg)' }}>
              <p className="text-[10.5px] text-[#5B544A] font-black uppercase tracking-wider mb-1">Academic / GT</p>
              <p className="font-urbanist text-[19px] sm:text-[21px] font-black text-[#16130F]">INR 19,000</p>
            </div>
            <div className="p-4 rounded-xl border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] text-center" style={{ background: '#DDF3EF', transform: 'rotate(0.8deg)' }}>
              <p className="text-[10.5px] text-[#5B544A] font-black uppercase tracking-wider mb-1">IELTS UKVI</p>
              <p className="font-urbanist text-[19px] sm:text-[21px] font-black text-[#16130F]">INR 18,250</p>
            </div>
            <div className="p-4 rounded-xl border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] text-center" style={{ background: '#FBD9E6', transform: 'rotate(-0.6deg)' }}>
              <p className="text-[10.5px] text-[#5B544A] font-black uppercase tracking-wider mb-1">Life Skills</p>
              <p className="font-urbanist text-[19px] sm:text-[21px] font-black text-[#16130F]">INR 17,000</p>
            </div>
            <div className="p-4 rounded-xl border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] text-center" style={{ background: '#FCE3DA', transform: 'rotate(1deg)' }}>
              <p className="text-[10.5px] text-[#5B544A] font-black uppercase tracking-wider mb-1">One Skill Retake</p>
              <p className="font-urbanist text-[19px] sm:text-[21px] font-black text-[#16130F]">INR 12,000</p>
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
          <div className="bg-[#DDF3EF] border-[3px] border-[#16130F] shadow-[4px_4px_0_#14837E] rounded-xl p-5 space-y-3">
            <h4 className={`${BOX_TITLE} flex items-center gap-2`}><CalendarDays size={18} className="text-[#14837E]" />Quick Guide: How to choose your date</h4>
            <p className="text-[13.5px] text-[#3D362E] leading-relaxed">
              We recommend choosing a date that is at least 3-6 months before your target university application deadline. This leaves enough room for scheduling retakes if required or preparing visa materials early.
            </p>
            <p className="text-[13.5px] text-[#3D362E] leading-relaxed">
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
          <HookBand value="82" label="test cities in India to choose your IELTS centre from" hi="Book karo" />
          <JourneyPills
            className="not-prose"
            steps={[
              { label: 'Format', sub: 'Computer or Paper' },
              { label: 'Centre & Date', sub: '82 test cities' },
              { label: 'Passport', sub: 'Upload scan' },
              { label: 'Payment', sub: 'INR 19,000' },
            ]}
          />
          <div className="space-y-3.5 text-[13.5px] text-[#5B544A] leading-relaxed my-6">
            <div className={`${INK_BOX} p-4`}>
              <span className="font-urbanist font-black text-[15px] text-[#D0362E] block mb-1">Step 1: Select Format</span>
              Choose between Computer-delivered or Paper-based test, and select either IELTS Academic or General Training.
            </div>
            <div className={`${INK_BOX} p-4`}>
              <span className="font-urbanist font-black text-[15px] text-[#D0362E] block mb-1">Step 2: Choose Centre & Date</span>
              Search from 82 test cities in India and pick your preferred time slot and test venue.
            </div>
            <div className={`${INK_BOX} p-4`}>
              <span className="font-urbanist font-black text-[15px] text-[#D0362E] block mb-1">Step 3: Fill Details & Upload Passport</span>
              Fill in your personal information and upload a clear, scanned copy of your valid passport pages.
            </div>
            <div className={`${INK_BOX} p-4`}>
              <span className="font-urbanist font-black text-[15px] text-[#D0362E] block mb-1">Step 4: Complete Payment</span>
              Pay the registration fee of INR 19,000 online using Credit/Debit cards or Net Banking. Keep the email confirmation safe.
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
          <ul className={`${INK_BOX} list-disc list-outside space-y-2.5 text-[13.5px] text-[#5B544A] leading-relaxed p-5 pl-9 marker:text-[#D0362E] [&_strong]:text-[#16130F]`}>
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
          <div className="bg-[#DDF3EF] p-5 border-[3px] border-[#16130F] shadow-[4px_4px_0_#14837E] rounded-xl flex gap-4 my-6">
            <CheckCircle2 className="text-[#14837E] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className={BOX_TITLE}>UniCoach Online Coaching Advantages</h4>
              <p className="text-[13.5px] text-[#3D362E] leading-relaxed mt-1">
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
          <div className={CHART}>
            <BarCompare
              kicker="Result wait"
              title="Days until your IELTS result"
              items={[
                { label: 'Computer-Based', value: 5, display: '3–5 days' },
                { label: 'Paper-Based', value: 13, display: '11–13 days' },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="p-4 rounded-xl border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] bg-[#FFF1B8]">
              <span className="text-[11px] uppercase tracking-wider font-black text-[#5B544A] block mb-1">Computer-Based IELTS</span>
              <p className="font-urbanist text-[22px] font-black text-[#16130F]">3 to 5 Days</p>
            </div>
            <div className="p-4 rounded-xl border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] bg-[#FBD9E6]">
              <span className="text-[11px] uppercase tracking-wider font-black text-[#5B544A] block mb-1">Paper-Based IELTS</span>
              <p className="font-urbanist text-[22px] font-black text-[#16130F]">11 to 13 Days</p>
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
          <StatStrip
            stats={[
              { value: '30 min', label: 'Listening time' },
              { value: '4', label: 'Sections' },
              { value: '40', label: 'Questions (10 per section)' },
              { value: '1×', label: 'Audio played only once' },
            ]}
          />
          <div className={`${INK_BOX} p-5 space-y-3 text-[13.5px] text-[#5B544A] leading-relaxed my-6 [&_strong]:text-[#16130F]`}>
            <p className="flex gap-2.5"><Headphones size={16} className="text-[#14837E] shrink-0 mt-0.5" /><span><strong>Section 1:</strong> A conversation between two speakers set in an everyday social context (10 questions).</span></p>
            <p className="flex gap-2.5"><Headphones size={16} className="text-[#14837E] shrink-0 mt-0.5" /><span><strong>Section 2:</strong> A monologue set in an everyday social context, e.g., a speech about local facilities (10 questions).</span></p>
            <p className="flex gap-2.5"><Headphones size={16} className="text-[#14837E] shrink-0 mt-0.5" /><span><strong>Section 3:</strong> A conversation between up to four people set in an educational or training context (10 questions).</span></p>
            <p className="flex gap-2.5"><Headphones size={16} className="text-[#14837E] shrink-0 mt-0.5" /><span><strong>Section 4:</strong> A monologue on an academic subject, e.g., a university lecture (10 questions).</span></p>
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
          <StatStrip
            stats={[
              { value: '60 min', label: 'Reading time' },
              { value: '40', label: 'Questions' },
              { value: '3', label: 'Reading passages' },
            ]}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className={`${INK_BOX} p-5 border-t-[8px] border-t-[#F2B705]`}>
              <h4 className={`${BOX_TITLE} mb-2`}>Academic Reading</h4>
              <p className={BOX_TEXT}>
                Passages are from journals, books, magazines, and newspapers. Focuses on descriptive, factual, analytical, and logical texts.
              </p>
            </div>
            <div className={`${INK_BOX} p-5 border-t-[8px] border-t-[#14837E]`}>
              <h4 className={`${BOX_TITLE} mb-2`}>General Training Reading</h4>
              <p className={BOX_TEXT}>
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
          <div className={CHART}>
            <Donut
              kicker="Time split"
              title="How the 60 minutes divide"
              centerValue="60"
              centerLabel="minutes"
              segments={[
                { label: 'Task 1 (150+ words)', value: 20, display: '20 min' },
                { label: 'Task 2 essay (250+ words)', value: 40, display: '40 min' },
              ]}
            />
          </div>
          <div className="space-y-4 my-6">
            <div className={`${INK_BOX} p-5 border-l-[8px] border-l-[#D0362E]`}>
              <h4 className={`${BOX_TITLE} mb-1`}>Task 1 (Academic vs General)</h4>
              <p className={BOX_TEXT}>
                Academic requires summarizing visual data (graphs, charts, processes) in 150+ words (20 mins). General Training requires writing a formal, semi-formal, or personal letter.
              </p>
            </div>
            <div className={`${INK_BOX} p-5 border-l-[8px] border-l-[#B8285B]`}>
              <h4 className={`${BOX_TITLE} mb-1`}>Task 2 (Essay Writing)</h4>
              <p className={BOX_TEXT}>
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
          <div className={CHART}>
            <Donut
              kicker="3 parts"
              title="Speaking test, part by part"
              centerValue="11–14"
              centerLabel="minutes"
              segments={[
                { label: 'Part 1: Introduction', value: 4.5, display: '4–5 min' },
                { label: 'Part 2: Cue Card', value: 3.5, display: '3–4 min' },
                { label: 'Part 3: Discussion', value: 4.5, display: '4–5 min' },
              ]}
            />
          </div>
          <div className={`${INK_BOX} p-5 space-y-3 text-[13.5px] text-[#5B544A] leading-relaxed my-6 [&_strong]:text-[#16130F]`}>
            <p className="flex gap-2.5"><MessageCircle size={16} className="text-[#B8285B] shrink-0 mt-0.5" /><span><strong>Part 1: Introduction (4 - 5 Mins)</strong> - Simple introductory questions related to your home, hobbies, family, work, or studies.</span></p>
            <p className="flex gap-2.5"><MessageCircle size={16} className="text-[#B8285B] shrink-0 mt-0.5" /><span><strong>Part 2: Long Turn Cue Card (3 - 4 Mins)</strong> - The examiner gives you a topic card. You have 1 minute to plan, then speak on it for 1–2 minutes.</span></p>
            <p className="flex gap-2.5"><MessageCircle size={16} className="text-[#B8285B] shrink-0 mt-0.5" /><span><strong>Part 3: Discussion (4 - 5 Mins)</strong> - Deep discussion related to the topic of Part 2, requiring abstract reasoning and expressing opinions.</span></p>
          </div>
          <p>
            Grading criteria include Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation.
          </p>
        </div>
      )
    }
  };

  const activeContent = contentMap[pageKey] || contentMap.overview;
  const activeName = sidebarLinks.find(l => l.key === pageKey)?.name || 'Detail';

  return (
    <div className="min-h-screen bg-[#FFF6E5] pb-20 font-['Onest',sans-serif] text-[#16130F] overflow-x-clip">

      {/* Hero: mustard poster band */}
      <DesiHero
        tone="mustard"
        sign={{ hi: 'IELTS', en: 'IELTS DESK' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams', to: '/exams/ielts/overview' }, { label: 'IELTS' }, { label: activeName }]}
        title={activeContent.title}
        subtitle={activeContent.subtitle}
        stickers={(
          <Sticker tilt={-2}><BookOpen size={14} />IELTS Reference Guide</Sticker>
        )}
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-10">

        {/* Guide index as ink pills (phones and tablets) */}
        <div className="lg:hidden -mt-6 mb-8 relative z-10">
          <InkCard className="p-3">
            <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none px-1 mb-2">Is guide mein</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {sidebarLinks.map((linkItem) => {
                const isActive = pageKey === linkItem.key;
                return (
                  <Link
                    key={linkItem.key}
                    to={linkItem.path}
                    className={`px-3.5 py-2 rounded-full border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 ${isActive ? 'bg-[#16130F] border-[#16130F] text-white shadow-[2px_2px_0_#F2B705]' : 'border-[#16130F] bg-[#FFF6E5] text-[#3D362E]'}`}
                  >
                    {linkItem.name}
                  </Link>
                );
              })}
            </div>
          </InkCard>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)_230px] xl:grid-cols-[260px_minmax(0,1fr)_290px] gap-8 items-start lg:pt-12">

          {/* Left Sidebar Links */}
          <aside className="hidden lg:block sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 pb-2">
            <InkCard className="p-4">
              <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Is guide mein</p>
              <h3 className="mt-1 mb-3 font-urbanist font-black text-[16px]">IELTS Guide Index</h3>
              <nav className="flex flex-col gap-1.5">
                {sidebarLinks.map((linkItem, li) => {
                  const isActive = pageKey === linkItem.key;
                  const tone = DESI_TONES[li % 4];
                  return (
                    <Link
                      key={linkItem.key}
                      to={linkItem.path}
                      style={isActive ? { background: tone.c, color: tone.fg } : undefined}
                      className={`group w-full text-left py-2 px-2.5 rounded-lg border-2 text-[13px] font-bold transition-colors leading-snug flex items-center justify-between gap-2
                        ${isActive
                          ? 'border-[#16130F] shadow-[3px_3px_0_#16130F]'
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
          <InkCard as="main" className="p-5 sm:p-8 md:p-10 min-w-0">
            <DesiHeading hi="Poori jaankari" className="mb-6 pb-5 border-b-[3px] border-dashed border-[#16130F33]">
              Detailed Guide Content
            </DesiHeading>
            <div className="max-w-none text-[15px] leading-relaxed text-[#3D362E] [&_strong]:text-[#16130F]">
              {activeContent.content}
            </div>
          </InkCard>

          {/* Right Sidebar Widgets */}
          <aside className="lg:sticky lg:top-28 space-y-6">

            {/* Widget: Live Events */}
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
                <span>View Upcoming Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget: Latest Blogs & Guides */}
            <InkCard className="p-6 text-center" shadow="#B8285B">
              <div className="w-12 h-12 rounded-full bg-[#FBD9E6] text-[#B8285B] border-2 border-[#16130F] flex items-center justify-center mx-auto mb-4">
                <BookOpen size={20} />
              </div>
              <h4 className="font-urbanist font-black text-[#16130F] text-[16px] mb-2">Exam Prep Blogs & Guides</h4>
              <p className="text-[13px] text-[#5B544A] leading-relaxed mb-5">
                Read Band 8+ essay samples, speaking cue cards, and test-day strategy articles.
              </p>
              <Link
                to="/blogs"
                className="w-full text-center py-3 border-2 border-[#16130F] bg-white text-[#16130F] rounded-full text-[13px] font-bold hover:bg-[#FCE38A] transition-colors block cursor-pointer"
              >
                Browse Prep Blogs
              </Link>
            </InkCard>

          </aside>

        </div>

        {/* Closing CTA */}
        <BookOkCta
          className="mt-14"
          to="/events"
          hi="Taiyari saath mein"
          title="Book OK Please."
          text="IELTS ki taiyari karni hai? Live workshops mein certified mentors se seedha poocho."
          cta="Live events dekho"
        />
      </div>
    </div>
  );
};

export default IELTSDetailPage;
