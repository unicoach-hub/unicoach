import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  DollarSign,
  Compass,
  Award,
  FileEdit,
  CheckCircle2,
  ListTodo,
  Sparkles,
  Info,
  ChevronDown,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { HookBand, StatStrip, BarCompare, TimelineStrip, Donut } from '../../../components/ui/Infographics';
import { JourneyPills } from '../../../components/ui/BrandElements';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

// Desi Pop building blocks for the SAT detail template
const TONES = [DESI_TONES[3], DESI_TONES[1], DESI_TONES[2], DESI_TONES[0]];
const tableWrap = "overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-[12px] shadow-[4px_4px_0_#16130F]";
const tableCls = "w-full min-w-[480px] text-left border-collapse text-[13.5px]";
const theadCls = "bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F]";
const thCls = "py-3 px-4 text-[12px] font-black uppercase tracking-wider whitespace-nowrap";
const tbodyCls = "divide-y-2 divide-[#EFE4CF] font-medium text-[#3D362E]";
const miniCard = "bg-white border-2 border-[#16130F] rounded-xl p-4 shadow-[3px_3px_0_#16130F]";
const bodyText = "text-[#5B544A] leading-relaxed";

// Callout box: ink border, soft poster fill, round icon chip
const Note = ({ icon: Icon = Info, tone = 'mustard', title, children }) => {
  const t = { mustard: ['#FFF1B8', '#F2B705', '#16130F'], rani: ['#FBD9E6', '#B8285B', '#FFFFFF'], teal: ['#DDF3EF', '#14837E', '#FFFFFF'] }[tone];
  return (
    <div className="flex items-start gap-3 border-2 border-[#16130F] rounded-xl p-4 shadow-[3px_3px_0_#16130F]" style={{ background: t[0] }}>
      <span className="w-8 h-8 rounded-full border-2 border-[#16130F] grid place-items-center shrink-0" style={{ background: t[1], color: t[2] }}>
        <Icon size={15} />
      </span>
      <div className="min-w-0 text-[13.5px] text-[#3D362E] font-medium leading-relaxed">
        {title && <h4 className="font-urbanist font-black text-[#16130F] text-[15px] mb-1">{title}</h4>}
        {children}
      </div>
    </div>
  );
};

// Sub-heading inside the content card
const SubHead = ({ hi, children }) => (
  <div>
    {hi && <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none">{hi}</p>}
    <h3 className="mt-1 font-urbanist text-[20px] font-black text-[#16130F] tracking-tight">{children}</h3>
  </div>
);

const SATDetailPage = ({ pageKey }) => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const sidebarLinks = [
    { name: 'SAT Overview', path: '/exams/sat/overview', key: 'overview', icon: Compass },
    { name: 'SAT Syllabus', path: '/exams/sat/syllabus', key: 'syllabus', icon: BookOpen },
    { name: 'SAT Exam Fees', path: '/exams/sat/fees', key: 'fees', icon: DollarSign },
    { name: 'SAT Exam Dates', path: '/exams/sat/dates', key: 'dates', icon: Calendar },
    { name: 'SAT Registration', path: '/exams/sat/registration', key: 'registration', icon: FileEdit },
    { name: 'SAT Results & Scoring', path: '/exams/sat/results', key: 'results', icon: Award },
    { name: 'SAT Preparation', path: '/exams/sat/preparation', key: 'preparation', icon: ListTodo }
  ];

  const contentMap = {
    overview: {
      title: "SAT Exam Overview: Scoring & Adaptive Pattern",
      subtitle: "The SAT is a standardized test widely used for college admissions, primarily in the US and Canada.",
      content: (
        <div className="space-y-6 text-[14px]">
          <Note tone="rani" title="Adaptive digital test format">
            <p>
              The test adjusts the difficulty of the second module in both Reading & Writing and Math based on your score performance in the first module. Doing well in the first module is key to unlocking the higher scoring potential.
            </p>
          </Note>

          <div className="space-y-3">
            <SubHead hi="SAT kya hai">What is the Digital SAT?</SubHead>
            <p className={bodyText}>
              Designed and administered by the College Board, the Digital SAT evaluates secondary school students' readiness for college-level coursework. It evaluates critical reading, writing, and mathematics skills.
            </p>
          </div>

          <StatStrip
            stats={[
              { value: '2h 14m', label: 'Exam duration, down from 3 hours' },
              { value: '400–1600', label: 'Total score scale' },
              { value: 'Desmos', label: 'Built-in graphing calculator' },
              { value: '5 years', label: 'Score validity' }
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Shorter Testing Window", desc: "The exam duration is now cut down to 2 Hours 14 Minutes, from the previous 3 hours." },
              { title: "Desmos Calculator allowed", desc: "Students can bring their own approved graphing calculators or use the built-in Desmos interface." },
              { title: "Direct Scoring Delivery", desc: "Score reports are returned to candidates in a matter of days on the College Board portal." },
              { title: "Valid for Admissions", desc: "Your scores are valid for up to 5 years after the examination date." }
            ].map((item, idx) => (
              <div key={idx} className={miniCard}>
                <h4 className="font-urbanist font-black text-[#16130F] text-[15px] mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-[#14837E]" />
                  {item.title}
                </h4>
                <p className="text-[13px] text-[#5B544A] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    syllabus: {
      title: "SAT Syllabus & Exam Pattern",
      subtitle: "Full overview of question types, timing constraints, and section contents on the Digital SAT.",
      content: (
        <div className="space-y-6 text-[14px]">
          <div>
            <Donut
              kicker="Time split"
              title="Minutes per SAT section"
              segments={[
                { label: 'Mathematics', value: 70, display: '70 min · 44 Qs' },
                { label: 'Reading & Writing', value: 64, display: '64 min · 54 Qs' }
              ]}
              centerValue="98"
              centerLabel="questions"
            />
          </div>
          <div className={tableWrap}>
            <table className={tableCls}>
              <thead className={theadCls}>
                <tr>
                  <th className={thCls}>Section</th>
                  <th className={thCls}>Timing Limit</th>
                  <th className={thCls}>Structure / Questions</th>
                </tr>
              </thead>
              <tbody className={tbodyCls}>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Reading & Writing</td>
                  <td className="py-3.5 px-4">64 Minutes (2 Modules)</td>
                  <td className="py-3.5 px-4">54 Questions</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Mathematics</td>
                  <td className="py-3.5 px-4">70 Minutes (2 Modules)</td>
                  <td className="py-3.5 px-4">44 Questions</td>
                </tr>
                <tr className="bg-[#FBD9E6] font-black text-[#16130F] border-t-[3px] border-[#16130F]">
                  <td className="py-3.5 px-4">Total Exam</td>
                  <td className="py-3.5 px-4">2 Hours 14 Minutes</td>
                  <td className="py-3.5 px-4">98 Questions</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <SubHead hi="Maths">Math Topics Breakdown</SubHead>
            <p className={bodyText}>The math section measures mathematical fluency across four standard domains:</p>
            <div>
              <BarCompare
                kicker="Math weightage"
                title="Share of the Math section by domain"
                items={[
                  { label: 'Algebra', value: 35, display: '35%' },
                  { label: 'Advanced Math', value: 35, display: '35%' },
                  { label: 'Problem Solving & Data Analysis', value: 15, display: '15%' },
                  { label: 'Geometry & Trigonometry', value: 15, display: '15%' }
                ]}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={miniCard}>
                <span className="font-urbanist font-black text-[15px] text-[#16130F]">Algebra (35%)</span>
                <p className="text-[13px] text-[#5B544A] mt-1 leading-relaxed">Linear equations, systems of linear equations, inequalities.</p>
              </div>
              <div className={miniCard}>
                <span className="font-urbanist font-black text-[15px] text-[#16130F]">Advanced Math (35%)</span>
                <p className="text-[13px] text-[#5B544A] mt-1 leading-relaxed">Quadratic functions, polynomial factors, radical and exponential equations.</p>
              </div>
              <div className={miniCard}>
                <span className="font-urbanist font-black text-[15px] text-[#16130F]">Problem Solving & Data Analysis (15%)</span>
                <p className="text-[13px] text-[#5B544A] mt-1 leading-relaxed">Ratios, percentages, probability, unit conversions, statistics.</p>
              </div>
              <div className={miniCard}>
                <span className="font-urbanist font-black text-[15px] text-[#16130F]">Geometry & Trigonometry (15%)</span>
                <p className="text-[13px] text-[#5B544A] mt-1 leading-relaxed">Area, volume, trigonometry, circle coordinates, triangles.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    fees: {
      title: "SAT Registration Fees & Administrative Charges",
      subtitle: "International pricing schedule set by the College Board.",
      content: (
        <div className="space-y-6 text-[14px]">
          <HookBand value="$68 + $43" label="Base registration fee plus the international fee for test takers outside the US" />
          <div>
            <BarCompare
              kicker="College Board charges"
              title="SAT fees for students in India (USD)"
              items={[
                { label: 'Base registration', value: 68, display: '$68' },
                { label: 'International fee', value: 43, display: '$43' },
                { label: 'Late cancellation', value: 39, display: '$39' },
                { label: 'Late registration', value: 38, display: '$38' },
                { label: 'Test center change', value: 34, display: '$34' },
                { label: 'Cancellation', value: 34, display: '$34' }
              ]}
            />
          </div>
          <div className={tableWrap}>
            <table className={tableCls}>
              <thead className={theadCls}>
                <tr>
                  <th className={thCls}>Service Category</th>
                  <th className={thCls}>Cost (USD)</th>
                </tr>
              </thead>
              <tbody className={tbodyCls}>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Base International Registration Fee</td>
                  <td className="py-3.5 px-4 font-black text-[#16130F] whitespace-nowrap">$68</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">International Fee (all test takers outside the US)</td>
                  <td className="py-3.5 px-4 font-black text-[#16130F] whitespace-nowrap">$43</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Late Registration Fee</td>
                  <td className="py-3.5 px-4 font-black text-[#16130F] whitespace-nowrap">$38</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Test Center Change Fee</td>
                  <td className="py-3.5 px-4 font-black text-[#16130F] whitespace-nowrap">$34</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Cancellation Fee (Prior to Deadline)</td>
                  <td className="py-3.5 px-4 font-black text-[#16130F] whitespace-nowrap">$34</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Late Cancellation Fee (After Deadline)</td>
                  <td className="py-3.5 px-4 font-black text-[#16130F] whitespace-nowrap">$39</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Note icon={AlertTriangle}>
            * Refunds: Cancelling your registration after the regular refund deadline will only return standard remaining regional fees or secondary taxes, and administrative charges apply.
          </Note>
        </div>
      )
    },
    dates: {
      title: "SAT Exam Dates: International Schedule",
      subtitle: "2026-27 SAT dates and deadlines (College Board). They apply to students in India too.",
      content: (
        <div className="space-y-6 text-[14px]">
          <p className={bodyText}>
            All SAT dates in India fall on Saturdays. Register by the regular deadline; late registration costs $38 extra and closes a few days later. Dates are from the College Board's 2026-27 schedule.
          </p>

          <div>
            <TimelineStrip
              kicker="2026-27 schedule"
              title="SAT test dates and registration deadlines"
              steps={[
                { when: 'Nov 7, 2026', what: 'Test day', note: 'Register by Oct 23' },
                { when: 'Dec 5, 2026', what: 'Test day', note: 'Register by Nov 20' },
                { when: 'Mar 6, 2027', what: 'Test day', note: 'Register by Feb 19' },
                { when: 'May 1, 2027', what: 'Test day', note: 'Register by Apr 16' },
                { when: 'Jun 5, 2027', what: 'Test day', note: 'Register by May 21' }
              ]}
            />
          </div>

          <div className={tableWrap}>
            <table className={tableCls}>
              <thead className={theadCls}>
                <tr>
                  <th className={thCls}>Test Date</th>
                  <th className={thCls}>Registration Deadline</th>
                  <th className={thCls}>Late Registration Deadline</th>
                </tr>
              </thead>
              <tbody className={tbodyCls}>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Nov 7, 2026</td>
                  <td className="py-3.5 px-4">Oct 23, 2026</td>
                  <td className="py-3.5 px-4">Oct 27, 2026</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Dec 5, 2026</td>
                  <td className="py-3.5 px-4">Nov 20, 2026</td>
                  <td className="py-3.5 px-4">Nov 24, 2026</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Mar 6, 2027</td>
                  <td className="py-3.5 px-4">Feb 19, 2027</td>
                  <td className="py-3.5 px-4">Feb 23, 2027</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">May 1, 2027</td>
                  <td className="py-3.5 px-4">Apr 16, 2027</td>
                  <td className="py-3.5 px-4">Apr 20, 2027</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Jun 5, 2027</td>
                  <td className="py-3.5 px-4">May 21, 2027</td>
                  <td className="py-3.5 px-4">May 25, 2027</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Note tone="teal">
            <strong>Center Selection Strategy:</strong> Many popular test venues in metro cities (Delhi, Mumbai, Bangalore) fill up 1-2 months in advance. Book early to secure your location.
          </Note>
        </div>
      )
    },
    registration: {
      title: "How to Register for the Digital SAT",
      subtitle: "Step-by-step registration roadmap.",
      content: (
        <div className="space-y-6 text-[14px] text-[#3D362E]">
          <JourneyPills
            steps={[
              { label: 'Account', sub: 'Name as on passport' },
              { label: 'Profile', sub: 'Personal and school info' },
              { label: 'Date & centre', sub: 'Open seats near you' },
              { label: 'Pay & photo', sub: 'Card or PayPal' }
            ]}
          />
          <div className="space-y-4">
            <div className={`${miniCard} flex gap-3`}>
              <span className="w-8 h-8 rounded-full border-2 border-[#16130F] bg-[#F2B705] shadow-[2px_2px_0_#16130F] grid place-items-center font-urbanist font-black text-[14px] text-[#16130F] shrink-0">1</span>
              <div>
                <h4 className="font-urbanist font-black text-[16px] text-[#16130F]">Create a College Board Account</h4>
                <p className="text-[#5B544A] mt-1 leading-relaxed">Visit the official College Board website and register for a free account. Ensure your name matches your passport exactly.</p>
              </div>
            </div>

            <div className={`${miniCard} flex gap-3`}>
              <span className="w-8 h-8 rounded-full border-2 border-[#16130F] bg-[#F2B705] shadow-[2px_2px_0_#16130F] grid place-items-center font-urbanist font-black text-[14px] text-[#16130F] shrink-0">2</span>
              <div>
                <h4 className="font-urbanist font-black text-[16px] text-[#16130F]">Enter Personal and Profile Info</h4>
                <p className="text-[#5B544A] mt-1 leading-relaxed">Fill out demographic details, school credentials, and extracurricular summaries.</p>
              </div>
            </div>

            <div className={`${miniCard} flex gap-3`}>
              <span className="w-8 h-8 rounded-full border-2 border-[#16130F] bg-[#F2B705] shadow-[2px_2px_0_#16130F] grid place-items-center font-urbanist font-black text-[14px] text-[#16130F] shrink-0">3</span>
              <div>
                <h4 className="font-urbanist font-black text-[16px] text-[#16130F]">Select Date & Test Center</h4>
                <p className="text-[#5B544A] mt-1 leading-relaxed">Select a test date and search for local centers with open seating availability.</p>
              </div>
            </div>

            <div className={`${miniCard} flex gap-3`}>
              <span className="w-8 h-8 rounded-full border-2 border-[#16130F] bg-[#F2B705] shadow-[2px_2px_0_#16130F] grid place-items-center font-urbanist font-black text-[14px] text-[#16130F] shrink-0">4</span>
              <div>
                <h4 className="font-urbanist font-black text-[16px] text-[#16130F]">Pay Fee & Upload Photo</h4>
                <p className="text-[#5B544A] mt-1 leading-relaxed">Upload a headshot meeting College Board criteria and complete payment via credit card or PayPal.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    results: {
      title: "SAT Scoring & Score Scales",
      subtitle: "How the adaptive Digital SAT is marked and reported.",
      content: (
        <div className="space-y-6 text-[14px]">
          <p className={bodyText}>
            The Digital SAT is scored on a total scale of **400 to 1600**, combining two section scores of 200–800.
          </p>

          <StatStrip
            stats={[
              { value: '400–1600', label: 'Total score scale' },
              { value: '200–800', label: 'Each of the two section scores' },
              { value: '4 free', label: 'Score reports to universities' },
              { value: '0', label: 'Negative marking' }
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={miniCard}>
              <span className="font-urbanist font-black text-[15px] text-[#16130F] block mb-1">Score Verification</span>
              <p className="text-[#5B544A] text-[13px] leading-relaxed">There is no negative marking. Correct responses gain points, and unanswered questions yield 0 points.</p>
            </div>
            <div className={miniCard}>
              <span className="font-urbanist font-black text-[15px] text-[#16130F] block mb-1">Score Reporting</span>
              <p className="text-[#5B544A] text-[13px] leading-relaxed">College Board sends scores to up to 4 selected universities for free if designated during registration.</p>
            </div>
          </div>
        </div>
      )
    },
    preparation: {
      title: "SAT Preparation: Preparation Strategies & Mock Practice",
      subtitle: "Actionable prep workflow to secure a high score.",
      content: (
        <div className="space-y-6 text-[14px] text-[#3D362E]">
          <HookBand value="6" label="Full-length adaptive practice tests in the official Bluebook app" hi="Practice" />
          <Note icon={Sparkles} tone="rani" title="Official Bluebook Prep Steps">
            <p>
              Download the official College Board <strong>Bluebook application</strong> onto your test device. Take full-length adaptive practice tests 1–6 under simulated exam conditions to align with digital adaptive modules.
            </p>
          </Note>

          <div className="space-y-4">
            <SubHead hi="Books aur tests">Recommended Resources</SubHead>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={miniCard}>
                <h4 className="font-urbanist font-black text-[#16130F] text-[15px] mb-1">Khan Academy SAT Prep</h4>
                <p className="text-[13px] text-[#5B544A] leading-relaxed">Official study partner featuring diagnostics, specific skill exercises, and diagnostic modules.</p>
              </div>
              <div className={miniCard}>
                <h4 className="font-urbanist font-black text-[#16130F] text-[15px] mb-1">SAT Practice Tests</h4>
                <p className="text-[13px] text-[#5B544A] leading-relaxed">Review our SAT prep books list for highly structured diagnostic material.</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const activeContent = contentMap[pageKey] || contentMap.overview;

  const faqs = [
    { q: "Is SAT adaptive by section or by question?", a: "By section (multistage). Each of the two main sections (Reading & Writing, Math) contains two modules. Your performance on the first module determines the difficulty level of the second module." },
    { q: "Can I bring my own calculator to the SAT?", a: "Yes, you can bring an approved graphing or scientific calculator. However, the Bluebook testing app also includes a fully featured Desmos graphing calculator directly on the screen." },
    { q: "How long are SAT scores valid?", a: "SAT scores are valid for 5 years from the date of the exam." }
  ];

  const activeLinkName = sidebarLinks.find(l => l.key === pageKey)?.name || "Details";

  return (
    <div className="min-h-screen bg-[#FFF6E5] pb-20 select-none font-['Onest',sans-serif] text-[#16130F]">
      {/* Hero: rani poster band */}
      <DesiHero
        tone="rani"
        sign={{ hi: 'SAT', en: 'SAT DESK' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'SAT', to: '/exams/sat' }, { label: activeLinkName }]}
        title={activeContent.title}
        subtitle={activeContent.subtitle}
        stickers={(
          <>
            <Sticker bg="#F2B705" tilt={-2}><Compass size={14} />SAT Directory</Sticker>
            <Sticker tilt={1.5}>{activeLinkName}</Sticker>
          </>
        )}
      />

      {/* Directory pills (phones and tablets) */}
      <div className="lg:hidden max-w-[1240px] mx-auto px-4 -mt-6 mb-8 relative z-10">
        <InkCard className="p-3">
          <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none px-1 mb-2">SAT directory</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sidebarLinks.map((link, idx) => {
              const IconComp = link.icon;
              const isActive = pageKey === link.key;
              const tone = TONES[idx % TONES.length];
              return (
                <button
                  key={idx}
                  onClick={() => navigate(link.path)}
                  style={isActive ? { background: tone.c, color: tone.fg } : undefined}
                  className={`no-shine flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 cursor-pointer ${isActive ? 'border-[#16130F] shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
                >
                  <IconComp size={13} />
                  <span>{link.name}</span>
                </button>
              );
            })}
          </div>
        </InkCard>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 md:px-8 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-28">
            <InkCard className="p-4">
              <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">SAT directory</p>
              <h3 className="mt-1 mb-3 font-urbanist font-black text-[17px]">SAT Directory</h3>
              <nav className="flex flex-col gap-2">
                {sidebarLinks.map((link, idx) => {
                  const IconComp = link.icon;
                  const isActive = pageKey === link.key;
                  const tone = TONES[idx % TONES.length];
                  return (
                    <button
                      key={idx}
                      onClick={() => navigate(link.path)}
                      style={isActive ? { background: tone.c, color: tone.fg } : undefined}
                      className={`no-shine group w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border-2 text-[14px] font-bold text-left cursor-pointer transition-colors ${
                        isActive
                          ? 'border-[#16130F] shadow-[3px_3px_0_#16130F]'
                          : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <IconComp size={16} />
                        <span>{link.name}</span>
                      </span>
                      <ArrowRight size={14} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </nav>
            </InkCard>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-10 min-w-0">
            <InkCard className="p-5 sm:p-8 md:p-10" shadow="#B8285B">
              <DesiHeading hi="Poori jaankari" className="mb-6">{activeLinkName}</DesiHeading>
              <div className="border-t-2 border-dashed border-[#16130F33] pt-6">
                {activeContent.content}
              </div>
            </InkCard>

            {/* FAQs Accordion on details pages */}
            <section>
              <DesiHeading hi="Sabke sawaal" className="mb-5">Frequently Asked Questions</DesiHeading>
              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = !!openFaq[idx];
                  return (
                    <div key={idx} className="bg-white border-[3px] border-[#16130F] overflow-hidden" style={{ borderRadius: 12, boxShadow: isOpen ? '4px 4px 0 #B8285B' : '4px 4px 0 #16130F' }}>
                      <button
                        onClick={() => toggleFaq(idx)}
                        aria-expanded={isOpen}
                        className="no-shine w-full p-4 text-left font-bold text-[14.5px] text-[#16130F] flex justify-between items-center gap-3 cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <span className={`w-7 h-7 rounded-full border-2 border-[#16130F] grid place-items-center shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-[#F2B705]' : 'bg-white'}`}>
                          <ChevronDown size={15} />
                        </span>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-4 pt-3 text-[14px] text-[#5B544A] border-t-2 border-dashed border-[#16130F33] leading-relaxed">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

            <BookOkCta
              hi="SAT plan banao"
              text="SAT ki date, score target ya college list pe confusion? Free 1:1 call mein mentor se seedha poocho."
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default SATDetailPage;
