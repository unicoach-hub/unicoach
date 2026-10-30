import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  DollarSign,
  MapPin,
  Compass,
  ArrowRight,
  Award,
  AlertTriangle,
  FileEdit,
  ShieldCheck,
  CheckCircle2,
  ListTodo,
  Sparkles,
  Info,
  Lightbulb,
  ChevronDown
} from 'lucide-react';
import { StatStrip, BarCompare, Donut, TimelineStrip, HookBand } from '../../../components/ui/Infographics';
import { StepCounter } from '../../../components/ui/BrandElements';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

// Desi Pop building blocks for the TOEFL detail template
const TONES = [DESI_TONES[0], DESI_TONES[1], DESI_TONES[2], DESI_TONES[3]];
const tableWrap = "overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-[12px] shadow-[4px_4px_0_#16130F]";
const tableCls = "w-full min-w-[520px] text-left border-collapse text-[13.5px]";
const theadCls = "bg-[#14837E] text-white border-b-[3px] border-[#16130F]";
const thCls = "py-3 px-4 text-[12px] font-black uppercase tracking-wider whitespace-nowrap";
const tbodyCls = "divide-y-2 divide-[#EFE4CF] font-medium text-[#3D362E]";
const miniCard = "bg-white border-2 border-[#16130F] rounded-xl p-4 shadow-[3px_3px_0_#16130F]";
const bodyText = "text-[#5B544A] text-[14.5px] leading-relaxed";
const smallHead = "font-urbanist text-[17px] font-black text-[#16130F]";
const listBox = "bg-[#FFF0E6] border-2 border-[#16130F] p-4 rounded-xl text-[13.5px] text-[#3D362E] font-medium leading-relaxed space-y-2";

// Callout box: ink border, soft poster fill, round icon chip
const Note = ({ icon: Icon = Info, tone = 'mustard', title, children }) => {
  const t = { mustard: ['#FFF1B8', '#F2B705', '#16130F'], sindoor: ['#FCE3DA', '#D0362E', '#FFFFFF'], teal: ['#DDF3EF', '#14837E', '#FFFFFF'] }[tone];
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
    <h3 className="mt-1 font-urbanist text-[21px] font-black text-[#16130F] tracking-tight">{children}</h3>
  </div>
);

// Small pill used for skill lists
const SkillPill = ({ children, color }) => (
  <div className="flex items-center gap-1.5 bg-white border-2 border-[#16130F] px-2.5 py-2 rounded-lg text-[12.5px] font-bold text-[#16130F]">
    <span className="w-2 h-2 rounded-full border border-[#16130F] flex-shrink-0" style={{ background: color }} />
    {children}
  </div>
);

const TOEFLDetailPage = ({ pageKey }) => {
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const sidebarLinks = [
    { name: 'TOEFL Overview', path: '/exams/toefl/overview', key: 'overview', icon: Compass },
    { name: 'TOEFL Syllabus', path: '/exams/toefl/syllabus', key: 'syllabus', icon: BookOpen },
    { name: 'TOEFL Exam Fees', path: '/exams/toefl/fees', key: 'fees', icon: DollarSign },
    { name: 'TOEFL Exam Dates', path: '/exams/toefl/dates', key: 'dates', icon: Calendar },
    { name: 'TOEFL Registration', path: '/exams/toefl/registration', key: 'registration', icon: FileEdit },
    { name: 'TOEFL Results', path: '/exams/toefl/results', key: 'results', icon: Award },
    { name: 'TOEFL Preparation', path: '/exams/toefl/preparation', key: 'preparation', icon: ListTodo }
  ];

  // Rich contents dictionary for TOEFL tabs
  const contentMap = {
    overview: {
      title: "TOEFL Exam for Indian Students: A Complete Guide",
      subtitle: "The Test of English as a Foreign Language (TOEFL) is a highly standardized English proficiency test accepted worldwide.",
      content: (
        <div className="space-y-6">
          <Note tone="sindoor" title="New TOEFL iBT format (from 21 January 2026)">
              <p>
                Since 21 January 2026, the TOEFL iBT has new tasks, adaptive Reading and Listening sections and a new 1–6 score scale. The four sections take about 90 minutes of test time; ETS asks you to allow about two hours in total. Until 2028, score reports also show the old 0–120 score alongside the new one.
              </p>
          </Note>

          <StatStrip
            stats={[
              { value: '~90 min', label: 'Test time (allow about 2 hours)' },
              { value: '1–6', label: 'New score scale, in half bands' },
              { value: '12,500+', label: 'Institutions accept TOEFL' },
              { value: '160+', label: 'Countries' },
            ]}
          />

          <div className="space-y-4">
            <SubHead hi="TOEFL kya hai">1. What is the TOEFL Exam?</SubHead>
            <p className={bodyText}>
              The TOEFL is designed to evaluate the English language proficiency of non-native speakers who wish to study, work, or migrate to English-speaking environments.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 my-6">
              {[
                { title: "Duration", desc: "About 90 minutes of test time; allow about 2 hours in total." },
                { title: "Tested Skills", desc: "Evaluates academic communication across Reading, Listening, Speaking, and Writing." },
                { title: "Modes of Delivery", desc: "Available as TOEFL iBT (at center/home) and TOEFL Essentials." },
                { title: "Wide Acceptance", desc: "Accepted by over 12,500 institutions in 160+ countries globally." }
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

          <div className="space-y-4 pt-5 border-t-2 border-dashed border-[#16130F33]">
            <SubHead hi="Kyun dein">Why Take the TOEFL Exam?</SubHead>
            <div className="space-y-3">
              {[
                { title: "100% US University Acceptance", desc: "TOEFL is universally accepted and preferred by major academic programs across the United States." },
                { title: "UK & Canada Visa Pathways", desc: "Approved for all UK visas and preferred for Canadian Student Direct Stream (SDS) permits." },
                { title: "Fair and Unbiased Scoring", desc: "Uses centralized scoring systems combining AI and human proctoring for objective grading." }
              ].map((item, idx) => (
                <div key={idx} className={`${miniCard} flex gap-3`}>
                  <div className="w-8 h-8 rounded-full border-2 border-[#16130F] flex items-center justify-center flex-shrink-0 font-urbanist text-[14px] font-black" style={{ background: TONES[idx % TONES.length].c, color: TONES[idx % TONES.length].fg }}>
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-urbanist font-black text-[#16130F] text-[15px] mb-0.5">{item.title}</h5>
                    <p className="text-[13px] text-[#5B544A] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-5 border-t-2 border-dashed border-[#16130F33]">
            <SubHead hi="Kaunsa test">2. TOEFL iBT vs TOEFL Essentials</SubHead>
            <p className={bodyText}>
              ETS offers two main versions of the test. Explore the variations below to select the right match:
            </p>
            <div className={listBox}>
              <p>• <strong>TOEFL iBT:</strong> The main test for university admission. About 90 minutes of test time, scored 1–6 in half bands (the old 0–120 score is shown alongside until 2028).</p>
              <p>• <strong>TOEFL Essentials:</strong> Multi-stage adaptive test, 1.5 hours duration, scored on a 1-12 band scale. Tests everyday conversational language.</p>
            </div>
          </div>
        </div>
      )
    },
    syllabus: {
      title: "TOEFL Exam Syllabus and Pattern: Section-wise Layout",
      subtitle: "The TOEFL iBT format from 21 January 2026: four sections, new task types, adaptive Reading and Listening.",
      content: (
        <div className="space-y-6">
          <p className={bodyText}>
            The test has four sections in this order: Reading, Listening, Writing, Speaking. Reading and Listening are adaptive: how you do in the first part decides how hard the second part is, so the number of questions and the time can vary slightly. Times below are ETS's approximate figures.
          </p>

          <div>
            <Donut
              kicker="Time split"
              title="Where your ~90 minutes go"
              centerValue="~90"
              centerLabel="minutes"
              segments={[
                { label: 'Reading', value: 30, display: '~30 min' },
                { label: 'Listening', value: 29, display: '~29 min' },
                { label: 'Writing', value: 23, display: '~23 min' },
                { label: 'Speaking', value: 8, display: '~8 min' },
              ]}
            />
          </div>

          <div className={tableWrap}>
            <table className={tableCls}>
              <thead className={theadCls}>
                <tr>
                  <th className={thCls}>Section</th>
                  <th className={thCls}>Duration</th>
                  <th className={thCls}>Questions / Tasks</th>
                  <th className={thCls}>Format Details</th>
                </tr>
              </thead>
              <tbody className={tbodyCls}>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Reading</td>
                  <td className="py-3.5 px-4">~30 Minutes</td>
                  <td className="py-3.5 px-4">~50 items</td>
                  <td className="py-3.5 px-4 text-[#5B544A]">Complete the Words, Read in Daily Life (emails, notices), Read an Academic Passage. Adaptive.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Listening</td>
                  <td className="py-3.5 px-4">~29 Minutes</td>
                  <td className="py-3.5 px-4">~47 items</td>
                  <td className="py-3.5 px-4 text-[#5B544A]">Listen and Choose a Response, conversations, announcements and academic talks. Adaptive.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Writing</td>
                  <td className="py-3.5 px-4">~23 Minutes</td>
                  <td className="py-3.5 px-4">12 tasks</td>
                  <td className="py-3.5 px-4 text-[#5B544A]">Build a Sentence, Write an Email, Write for an Academic Discussion.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Speaking</td>
                  <td className="py-3.5 px-4">~8 Minutes</td>
                  <td className="py-3.5 px-4">11 tasks</td>
                  <td className="py-3.5 px-4 text-[#5B544A]">Listen and Repeat, Take an Interview.</td>
                </tr>
                <tr className="bg-[#FFF1B8] font-black text-[#16130F] border-t-[3px] border-[#16130F]">
                  <td className="py-3.5 px-4">Total Exam</td>
                  <td className="py-3.5 px-4">~90 Minutes</td>
                  <td className="py-3.5 px-4">Varies (adaptive)</td>
                  <td className="py-3.5 px-4">Scale: 1 – 6 in half bands (overall = average of 4 sections)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-5 pt-4">
            <SubHead hi="Section by section">Syllabus Section-wise Breakdown</SubHead>

            {/* Reading */}
            <div className="p-5 border-2 border-[#16130F] rounded-xl bg-[#FFF0E6] shadow-[3px_3px_0_#16130F] space-y-3">
              <h4 className="font-urbanist font-black text-[16px] text-[#16130F]">1. Reading Comprehension</h4>
              <p className="text-[13.5px] text-[#5B544A] leading-relaxed">
                Evaluates ability to comprehend university-level textbooks and articles. Focuses on:
              </p>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-2">
                {["Vocabulary Context", "Factual Information", "Inference & Rhetoric", "Negative Factual Info", "Sentence Simplification", "Insert a Sentence"].map((t) => (
                  <SkillPill key={t} color="#D0362E">{t}</SkillPill>
                ))}
              </div>
            </div>

            {/* Listening */}
            <div className="p-5 border-2 border-[#16130F] rounded-xl bg-[#FFF0E6] shadow-[3px_3px_0_#16130F] space-y-3">
              <h4 className="font-urbanist font-black text-[16px] text-[#16130F]">2. Listening Comprehension</h4>
              <p className="text-[13.5px] text-[#5B544A] leading-relaxed">
                Evaluates comprehension of academic dialogues, lectures, and classroom discussions. Focuses on:
              </p>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-2">
                {["Detail Retrieval", "Understanding Speaker Purpose", "Speaker Attitude", "Connecting Content", "Making Inferences", "Note-taking logic"].map((t) => (
                  <SkillPill key={t} color="#F2B705">{t}</SkillPill>
                ))}
              </div>
            </div>

            {/* Speaking */}
            <div className="p-5 border-2 border-[#16130F] rounded-xl bg-[#FFF0E6] shadow-[3px_3px_0_#16130F] space-y-3">
              <h4 className="font-urbanist font-black text-[16px] text-[#16130F]">3. Speaking Section</h4>
              <p className="text-[13.5px] text-[#5B544A] leading-relaxed">
                Evaluates ability to speak clearly and logically in response to reading and listening texts. Focuses on:
              </p>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-2">
                {["Personal Choice Opinion", "Campus Announcement response", "Academic lecture summary", "Concept synthesis", "Pronunciation clarity", "Delivery flow"].map((t) => (
                  <SkillPill key={t} color="#14837E">{t}</SkillPill>
                ))}
              </div>
            </div>

            {/* Writing */}
            <div className="p-5 border-2 border-[#16130F] rounded-xl bg-[#FFF0E6] shadow-[3px_3px_0_#16130F] space-y-3">
              <h4 className="font-urbanist font-black text-[16px] text-[#16130F]">4. Writing Section</h4>
              <p className="text-[13.5px] text-[#5B544A] leading-relaxed">
                Evaluates ability to write clean, grammatical essays in academic settings. Focuses on:
              </p>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-2">
                {["Integrated essay structure", "Academic discussion post", "Grammatical accuracy", "Sentence diversity", "Cohesion & flow", "Development of ideas"].map((t) => (
                  <SkillPill key={t} color="#B8285B">{t}</SkillPill>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    fees: {
      title: "TOEFL Exam Fees in India: Registration & Rescheduling Charges",
      subtitle: "Understand registration prices, rescheduling fees, and cancellation refunds in India.",
      content: (
        <div className="space-y-6">
          <p className={bodyText}>
            In India, all registration payments must be cleared before your appointment. Check below for services list:
          </p>

          <HookBand value="₹15,729" label="TOEFL iBT registration fee in India, as listed by ETS India" hi="Fees" />

          <div className="space-y-2">
            <h4 className={smallHead}>1. Base Registration & Additional Fees</h4>
            <div className={tableWrap}>
              <table className={tableCls}>
                <thead className={theadCls}>
                  <tr>
                    <th className={thCls}>Service</th>
                    <th className={thCls}>Fees in India (INR)</th>
                  </tr>
                </thead>
                <tbody className={tbodyCls}>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#16130F]">TOEFL iBT Registration Fee</td>
                    <td className="py-3 px-4 font-black text-[#D0362E] whitespace-nowrap">₹15,729</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#16130F]">Late Registration Fee</td>
                    <td className="py-3 px-4">₹3,305</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#16130F]">Rescheduling Fee</td>
                    <td className="py-3 px-4">₹5,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#16130F]">Score Review Fee (Speaking or Writing)</td>
                    <td className="py-3 px-4">₹6,695</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#16130F]">Additional Score Report (per university)</td>
                    <td className="py-3 px-4">₹2,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-[#5B544A] font-semibold italic mt-2">* Fees as listed by ETS India (checked Oct 2026). Confirm on the ETS India site when you book.</p>
          </div>

          <div>
            <BarCompare
              kicker="Fee comparison"
              title="What each TOEFL service costs"
              source="ETS India (checked Oct 2026)"
              items={[
                { label: 'Registration', value: 15729, display: '₹15,729' },
                { label: 'Score Review', value: 6695, display: '₹6,695' },
                { label: 'Rescheduling', value: 5000, display: '₹5,000' },
                { label: 'Late Registration', value: 3305, display: '₹3,305' },
                { label: 'Extra Score Report', value: 2000, display: '₹2,000' },
              ]}
            />
          </div>

          <div className="space-y-4 pt-5 border-t-2 border-dashed border-[#16130F33]">
            <h4 className={smallHead}>2. Cancellation & Rescheduling Timelines</h4>
            <p className={bodyText}>
              Rescheduling or cancellation request deadlines are calculated strictly based on calendar buffers prior to the slot time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reschedule */}
              <div className={`${miniCard} bg-[#DDF3EF]`}>
                <h5 className="font-urbanist font-black text-[15px] text-[#14837E] mb-3">Rescheduling Rules</h5>
                <ul className="space-y-2.5 text-[13px] font-medium text-[#3D362E] leading-relaxed">
                  <li>• Must reschedule at least <strong>4 full days</strong> before your scheduled appointment.</li>
                  <li>• Rescheduling fee of <strong>₹5,000</strong> applies.</li>
                  <li>• Can be requested online through your ETS TOEFL profile.</li>
                </ul>
              </div>

              {/* Cancellation */}
              <div className={`${miniCard} bg-[#FCE3DA]`}>
                <h5 className="font-urbanist font-black text-[15px] text-[#D0362E] mb-3">Cancellation Refunds</h5>
                <ul className="space-y-2.5 text-[13px] font-medium text-[#3D362E] leading-relaxed">
                  <li>• Must request cancellation at least <strong>4 full days</strong> in advance.</li>
                  <li>• Receives a **50% refund** of the original base fee.</li>
                  <li>• Balance is credited back to the payment mode used during signup.</li>
                </ul>
              </div>
            </div>
            <Note icon={AlertTriangle}>
              <span>
                <strong>Warning:</strong> If you fail to reschedule or cancel at least 4 full days prior to the test, your entire registration fee is forfeited, and rescheduling will not be permitted.
              </span>
            </Note>
          </div>

          <div className="space-y-3 pt-5 border-t-2 border-dashed border-[#16130F33] text-[14px] text-[#5B544A]">
            <h4 className={smallHead}>3. Supported Payment Modes</h4>
            <p>You can complete payments through credit card, debit card, or PayPal. Accepted formats in India:</p>
            <div className={listBox}>
              <p>• Accepted card brands: <strong>VISA, Mastercard, American Express, and Discover</strong>.</p>
              <p>• Make sure international transactions are enabled on your card before making the payment.</p>
            </div>
          </div>
        </div>
      )
    },
    dates: {
      title: "TOEFL Exam Dates and Test Centres: Slot Booking in 2025",
      subtitle: "TOEFL slot calendars are available throughout the year. Select your date based on admissions timelines.",
      content: (
        <div className="space-y-6">
          <p className={bodyText}>
            The TOEFL iBT is held over 60 times a year at secure test centers. The TOEFL iBT Home Edition is available 24 hours a day, 4 days a week.
          </p>

          <StatStrip
            stats={[
              { value: '60+', label: 'Test centre dates a year' },
              { value: '39', label: 'Test centre cities in India' },
              { value: '4 days', label: 'A week for Home Edition, 24 hours a day' },
              { value: '2 yrs', label: 'Score validity' },
            ]}
          />

          <div className="space-y-4">
            <SubHead hi="Shehar">TOEFL Test Centre Cities in India</SubHead>
            <p className={bodyText}>
              ETS maintains physical test centers across 39 cities in India, giving you plenty of locations to choose from:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {[
                { name: "New Delhi", region: "North" },
                { name: "Mumbai", region: "West" },
                { name: "Bangalore", region: "South" },
                { name: "Chennai", region: "South" },
                { name: "Hyderabad", region: "South" },
                { name: "Kolkata", region: "East" },
                { name: "Ahmedabad", region: "West" },
                { name: "Pune", region: "West" },
                { name: "Chandigarh", region: "North" },
                { name: "Ludhiana", region: "North" }
              ].map((city, idx) => (
                <div key={idx} className={`${miniCard} flex flex-col justify-between`}>
                  <span className="font-urbanist font-black text-[#16130F] text-[15px] flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#D0362E] shrink-0" />
                    {city.name}
                  </span>
                  <span className="text-[10.5px] text-[#5B544A] uppercase tracking-widest font-black mt-1.5 block">{city.region} Zone</span>
                </div>
              ))}
            </div>
          </div>

          <Note icon={Lightbulb} tone="teal">
            <strong>Timelines Tip:</strong> Book your slot <strong>3 to 4 months</strong> in advance of your first university deadline. Scores are valid for 2 years, so write it early to secure your score reports.
          </Note>
        </div>
      )
    },
    registration: {
      title: "TOEFL Registration: Step-by-Step Guide",
      subtitle: "Learn how to sign up on the ETS portal, choose test modes, and register for accommodations.",
      content: (
        <div className="space-y-6">
          <p className={bodyText}>
            You can register for the TOEFL iBT up to 7 days before your target test date. Late registrations (within 7 to 4 days) incur extra fees.
          </p>

          <div>
            <TimelineStrip
              kicker="Key deadlines"
              title="Countdown to your TOEFL test day"
              steps={[
                { when: '6+ weeks before', what: 'Request disability accommodations' },
                { when: '7+ days before', what: 'Regular registration', note: '₹15,729' },
                { when: '7 to 4 days before', what: 'Late registration', note: 'Extra fee applies' },
                { when: 'Test day', what: 'Bring your physical passport', highlight: true },
              ]}
            />
          </div>

          <div className="space-y-3">
            <h4 className={smallHead}>Step-by-Step Registration Process</h4>
            <div className="space-y-2 text-[13.5px] font-semibold text-[#3D362E]">
              {[
                "1. Visit the official ETS TOEFL website and create a user account.",
                "2. Set up your profile. Ensure your name matches your valid passport spelling exactly.",
                "3. Select either the Test Center mode or the TOEFL iBT Home Edition.",
                "4. Enter your city and search for available test dates in the calendar.",
                "5. Choose your preferred testing center facility and time slot.",
                "6. Select up to 4 universities to receive your score reports for free.",
                "7. Apply for disability accommodations (must submit requests at least 6 weeks in advance).",
                "8. Review your registration details and accept test rules.",
                "9. Complete the payment of ₹15,729 online.",
                "10. Save the registration confirmation email and review test day guidelines."
              ].map((step, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border-2 border-[#16130F]" style={{ borderLeft: `8px solid ${TONES[idx % TONES.length].c}` }}>
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-5 border-t-2 border-dashed border-[#16130F33]">
            <h4 className={smallHead}>Mandatory Identification Document</h4>
            <p className={bodyText}>
              Indian test takers have specific identification rules that must be followed on test day:
            </p>
            <Note icon={ShieldCheck} tone="sindoor">
              <span>
                <strong>Passport Required:</strong> A valid physical <strong>Passport</strong> is the ONLY acceptable primary ID for Indian citizens. Photocopies, digital IDs, or other government documents like Aadhaar or PAN card will not be accepted.
              </span>
            </Note>
          </div>
        </div>
      )
    },
    results: {
      title: "TOEFL Exam Results: Scores, Scale, and Validity",
      subtitle: "Understand how your scores are calculated, scaled, and sent to target universities.",
      content: (
        <div className="space-y-6">
          <p className={bodyText}>
            TOEFL iBT scores are calculated and scaled within a few days of the exam. Here are the core details:
          </p>

          <StatStrip
            stats={[
              { value: '2 Years', label: 'Score Validity' },
              { value: '1 – 6', label: 'Total Score Scale' },
              { value: '4 – 8 Days', label: 'Online Delivery' },
            ]}
          />

          <div className="space-y-4 pt-5 border-t-2 border-dashed border-[#16130F33]">
            <h4 className={smallHead}>1. Section-wise Scoring Scales</h4>
            <p className={bodyText}>
              Since 21 January 2026, each section is scored from 1 to 6 in half bands, and your overall score is the average of the four, rounded to the nearest half band. Each band lines up with a CEFR level, so universities can compare it with IELTS. Until 2028 your report also shows the old 0–120 score.
            </p>
            <div className={tableWrap}>
              <table className={tableCls}>
                <thead className={theadCls}>
                  <tr>
                    <th className={thCls}>Band</th>
                    <th className={thCls}>CEFR Level</th>
                    <th className={thCls}>What it usually means</th>
                  </tr>
                </thead>
                <tbody className={tbodyCls}>
                  <tr>
                    <td className="py-3 px-4 font-black text-[#16130F] whitespace-nowrap">6</td>
                    <td className="py-3 px-4">C2</td>
                    <td className="py-3 px-4">Top band; fine for any program</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-black text-[#16130F] whitespace-nowrap">5 – 5.5</td>
                    <td className="py-3 px-4">C1</td>
                    <td className="py-3 px-4">What most master's programs at strong universities ask for</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-black text-[#16130F] whitespace-nowrap">4 – 4.5</td>
                    <td className="py-3 px-4">B2</td>
                    <td className="py-3 px-4">Accepted by many undergraduate and some master's programs</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-black text-[#16130F] whitespace-nowrap">3 – 3.5</td>
                    <td className="py-3 px-4">B1</td>
                    <td className="py-3 px-4">Usually needs a pathway or English course first</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-black text-[#16130F] whitespace-nowrap">1 – 2.5</td>
                    <td className="py-3 px-4">A1 – A2</td>
                    <td className="py-3 px-4">Not enough for direct admission</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 pt-5 border-t-2 border-dashed border-[#16130F33]">
            <h4 className={smallHead}>2. TOEFL MyBest™ Scores</h4>
            <p className={bodyText}>
              If you take the TOEFL test more than once, ETS automatically creates a "MyBest Score" sheet for you:
            </p>
            <div className={listBox}>
              <p>• Combines the highest section scores from all tests taken within the last 2 years.</p>
              <p>• Helps you highlight your absolute best academic performance to admissions officers.</p>
              <p>• Accepted by a growing number of universities worldwide.</p>
            </div>
          </div>
        </div>
      )
    },
    preparation: {
      title: "TOEFL Exam Preparation: Expert Study Guide & Section Tips",
      subtitle: "Unlock study strategies, test-day practices, and section rules to score 100+.",
      content: (
        <div className="space-y-6">
          <p className={bodyText}>
            TOEFL preparation requires familiarizing yourself with the computer-delivered environment. Discover section strategies below:
          </p>

          <HookBand value="60–80" label="hours of study most test takers put in, over 4–6 weeks" hi="Taiyari" />

          <StepCounter
            items={[
              { label: 'Reading' },
              { label: 'Listening' },
              { label: 'Speaking' },
              { label: 'Writing' },
              { label: 'ETS practice tests', highlight: true },
            ]}
          />

          <div className="space-y-5">
            {/* Reading */}
            <div className={`${miniCard} p-5 space-y-2.5`}>
              <h4 className="font-urbanist font-black text-[16px] text-[#16130F] flex items-center gap-2">
                <Sparkles size={15} className="text-[#D0362E]" />
                1. Reading Comprehension Tips
              </h4>
              <ul className="list-disc list-inside text-[13.5px] text-[#5B544A] space-y-1 leading-relaxed pl-1 marker:text-[#D0362E]">
                <li>Practice reading academic texts from scientific journals and articles.</li>
                <li>Improve skimming: Practice identifying the main idea of paragraphs quickly.</li>
                <li>Build vocabulary: Keep a record of unfamiliar terms in academic contexts.</li>
              </ul>
            </div>

            {/* Listening */}
            <div className={`${miniCard} p-5 space-y-2.5`}>
              <h4 className="font-urbanist font-black text-[16px] text-[#16130F] flex items-center gap-2">
                <Sparkles size={15} className="text-[#D0362E]" />
                2. Listening Comprehension Tips
              </h4>
              <ul className="list-disc list-inside text-[13.5px] text-[#5B544A] space-y-1 leading-relaxed pl-1 marker:text-[#D0362E]">
                <li>Practice active note-taking while listening to audio clips.</li>
                <li>Listen to academic podcasts and debates to get used to different English accents.</li>
                <li>Focus on the speaker's tone and purpose, not just details.</li>
              </ul>
            </div>

            {/* Speaking */}
            <div className={`${miniCard} p-5 space-y-2.5`}>
              <h4 className="font-urbanist font-black text-[16px] text-[#16130F] flex items-center gap-2">
                <Sparkles size={15} className="text-[#D0362E]" />
                3. Speaking Section Tips
              </h4>
              <ul className="list-disc list-inside text-[13.5px] text-[#5B544A] space-y-1 leading-relaxed pl-1 marker:text-[#D0362E]">
                <li>Practice with a timer. You have only 45-60 seconds to speak.</li>
                <li>Maintain a steady, clear speaking pace. Avoid rushing or speaking too softly.</li>
                <li>Use structural templates to organize your points quickly.</li>
              </ul>
            </div>

            {/* Writing */}
            <div className={`${miniCard} p-5 space-y-2.5`}>
              <h4 className="font-urbanist font-black text-[16px] text-[#16130F] flex items-center gap-2">
                <Sparkles size={15} className="text-[#D0362E]" />
                4. Writing Section Tips
              </h4>
              <ul className="list-disc list-inside text-[13.5px] text-[#5B544A] space-y-1 leading-relaxed pl-1 marker:text-[#D0362E]">
                <li>Integrated task: Clearly connect the reading passage points to the lecture points.</li>
                <li>Academic Discussion task: Practice writing concise, well-structured opinions under 10 minutes.</li>
                <li>Leave 2-3 minutes at the end of each task to proofread for spelling or grammar mistakes.</li>
              </ul>
            </div>
          </div>

          <Note icon={Lightbulb}>
            <strong>Official Materials:</strong> We highly recommend using the official ETS TOEFL mock resources, including the free practice tests on <strong>ETS.org</strong>.
          </Note>
        </div>
      )
    }
  };

  const faqMap = {
    overview: [
      { q: "What is the TOEFL exam fee in India?", a: "ETS India lists the TOEFL iBT registration fee as ₹15,729. Check the ETS India site when you book, as fees can change." },
      { q: "How long is a TOEFL score valid?", a: "TOEFL scores are valid for exactly 2 years from the date of your exam." },
      { q: "Is TOEFL harder than IELTS?", a: "It depends on preference: TOEFL is fully computer-delivered, whereas IELTS offers paper and face-to-face formats." },
      { q: "Can I write TOEFL from home?", a: "Yes, you can register for the TOEFL iBT Home Edition, which uses the same content and scoring criteria as the center exam." }
    ],
    syllabus: [
      { q: "What sections are in the new TOEFL iBT?", a: "Four: Reading, Listening, Writing and Speaking, in that order. Test time is about 90 minutes; allow about two hours in total." },
      { q: "What changed in January 2026?", a: "New task types (like Build a Sentence, Write an Email and Take an Interview), adaptive Reading and Listening, and a new 1–6 score scale. The old 0–120 score is shown alongside it until 2028." },
      { q: "What are the writing tasks in TOEFL?", a: "Build a Sentence, Write an Email, and Write for an Academic Discussion, where you add a post to an online class discussion." }
    ],
    fees: [
      { q: "Can I reschedule my TOEFL exam?", a: "Yes, you can reschedule your exam up to 4 days before the test date for a fee of ₹5,000." },
      { q: "What is the late registration fee for TOEFL?", a: "Registering within 7 days of the test date incurs a late fee of about ₹3,305." },
      { q: "Can I get a refund if I cancel my TOEFL exam?", a: "Yes, cancellations made at least 4 full days before the test date receive a 50% partial refund." }
    ],
    dates: [
      { q: "How often is the TOEFL exam conducted?", a: "TOEFL is conducted over 60 times a year at secure physical centers. TOEFL Home Edition is available 24 hours a day, 4 days a week." },
      { q: "How far in advance should I book my TOEFL date?", a: "We recommend booking at least 3 to 4 months before your first university application deadline." }
    ],
    registration: [
      { q: "Can I register for TOEFL without a passport?", a: "No, in India, a valid physical passport is the only accepted identification. Digital or other documents will not be accepted." },
      { q: "How do I choose test centers during registration?", a: "During online registration, enter your city to compare available dates and physical test center capacities." }
    ],
    results: [
      { q: "When will my TOEFL results be released?", a: "TOEFL results are typically available online in your ETS portal within 4 to 8 days after your exam." },
      { q: "What is a good TOEFL score?", a: "A total score of 95-100 is considered good. Top Ivy League schools usually require 105 or higher." },
      { q: "How do I send my TOEFL scores to universities?", a: "You can send scores to 4 universities for free. You must select these recipients in your account before taking the exam." }
    ],
    preparation: [
      { q: "How many hours should I study for TOEFL?", a: "Most test takers study for 60-80 hours over 4-6 weeks to achieve their target score." },
      { q: "Are official TOEFL mock tests useful?", a: "Yes, official ETS practice tests use real past questions and exact scoring criteria, making them the best diagnostic tool." }
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

  const activeLinkName = sidebarLinks.find(l => l.key === pageKey)?.name || 'Detail';

  const sideBtn = "w-full text-center py-3 border-2 border-[#16130F] bg-white text-[#16130F] rounded-full text-[13px] font-black hover:bg-[#FFF1B8] transition-colors block cursor-pointer";

  return (
    <div className="min-h-screen bg-[#FFF6E5] pb-20 select-none font-['Onest',sans-serif] text-[#16130F]">
      {/* Hero: peach poster band */}
      <DesiHero
        tone="peach"
        sign={{ hi: 'टोफ़ल', en: 'TOEFL DESK' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams', to: '/exams/toefl' }, { label: 'TOEFL' }, { label: activeLinkName }]}
        title={activeContent.title}
        subtitle={activeContent.subtitle}
        stickers={(
          <>
            <Sticker bg="#14837E" fg="#FFFFFF" tilt={-2}><Compass size={14} />TOEFL Exam Suite</Sticker>
            <Sticker bg="#F2B705" tilt={1.5}>{activeLinkName}</Sticker>
          </>
        )}
      />

      {/* Section pills (phones and tablets) */}
      <div className="lg:hidden max-w-[1320px] mx-auto px-4 -mt-6 mb-8 relative z-10">
        <InkCard className="p-3">
          <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none px-1 mb-2">TOEFL guide</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sidebarLinks.map((link, idx) => {
              const IconComponent = link.icon;
              const isActive = pageKey === link.key;
              const tone = TONES[idx % TONES.length];
              return (
                <Link
                  key={link.key}
                  to={link.path}
                  style={isActive ? { background: tone.c, color: tone.fg } : undefined}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 ${isActive ? 'border-[#16130F] shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
                >
                  <IconComponent size={13} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </InkCard>
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-10 lg:pt-12">

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)_230px] xl:grid-cols-[260px_minmax(0,1fr)_280px] gap-8 items-start">

          {/* Left Sticky Sidebar Menu */}
          <aside className="hidden lg:block sticky top-28">
            <InkCard className="p-4">
              <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">TOEFL guide</p>
              <h3 className="mt-1 mb-3 font-urbanist font-black text-[17px]">On This Section</h3>
              <nav className="flex flex-col gap-1.5">
                {sidebarLinks.map((link, idx) => {
                  const IconComponent = link.icon;
                  const isActive = pageKey === link.key;
                  const tone = TONES[idx % TONES.length];
                  return (
                    <Link
                      key={link.key}
                      to={link.path}
                      style={isActive ? { background: tone.c, color: tone.fg } : undefined}
                      className={`w-full flex items-center gap-2.5 py-2.5 px-3 rounded-lg border-2 text-[13.5px] font-bold transition-colors leading-snug cursor-pointer
                        ${isActive
                          ? 'border-[#16130F] shadow-[3px_3px_0_#16130F]'
                          : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
                    >
                      <IconComponent size={15} className="shrink-0" />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </InkCard>
          </aside>

          {/* Center Main Content Area */}
          <main className="space-y-10 min-w-0">
            <InkCard className="p-5 sm:p-8 md:p-10" shadow="#D0362E">
              {activeContent.content}
            </InkCard>

            {/* Next Up section */}
            <section>
              <DesiHeading hi="Aage padho" className="mb-5">Next Up</DesiHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nextUpLinks.map((linkItem, idx) => {
                  const IconComponent = linkItem.icon;
                  const tone = TONES[idx % TONES.length];
                  return (
                    <Link
                      key={idx}
                      to={linkItem.path}
                      className="group p-5 rounded-[14px] border-[3px] border-[#16130F] bg-white shadow-[4px_4px_0_#16130F] hover:-translate-y-1 transition-transform flex items-start justify-between cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="w-10 h-10 rounded-full border-2 border-[#16130F] inline-flex items-center justify-center mb-2" style={{ background: tone.c, color: tone.fg }}>
                          <IconComponent size={16} />
                        </span>
                        <h5 className="font-urbanist font-black text-[#16130F] text-[16px] tracking-tight">
                          {linkItem.name}
                        </h5>
                        <p className="text-[12px] text-[#D0362E] font-black tracking-wider uppercase inline-flex items-center gap-1 mt-1">
                          Read Now
                          <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Tab Specific Accordion FAQs */}
            <section>
              <DesiHeading hi="Sabke sawaal" className="mb-5">Section-wise FAQs</DesiHeading>
              <div className="space-y-3">
                {currentFaqs.map((faq, idx) => {
                  const isOpen = !!openFaq[idx];
                  return (
                    <div key={idx} className="bg-white border-[3px] border-[#16130F] overflow-hidden" style={{ borderRadius: 12, boxShadow: isOpen ? '4px 4px 0 #D0362E' : '4px 4px 0 #16130F' }}>
                      <button
                        onClick={() => toggleFaq(idx)}
                        aria-expanded={isOpen}
                        className="no-shine w-full flex items-center justify-between gap-3 p-4 text-left font-bold text-[14.5px] text-[#16130F] cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <span className={`w-7 h-7 rounded-full border-2 border-[#16130F] grid place-items-center shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-[#F2B705]' : 'bg-white'}`}>
                          <ChevronDown size={15} />
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-4 pb-4 pt-3 text-[#5B544A] text-[14px] border-t-2 border-dashed border-[#16130F33] leading-relaxed">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Closing CTA (replaces the old "Preparing for TOEFL?" box, same link) */}
            <BookOkCta
              to="/book-consultation"
              hi="TOEFL ki taiyari"
              text="TOEFL ki tayari kahan se shuru karein? Free 1:1 call mein mentor se mock aur study plan pe baat karo."
              cta="Free session book karo"
            />
          </main>

          {/* Right Sidebar Widgets */}
          <aside className="lg:sticky lg:top-28 space-y-6">

            {/* Widget: Live Events & Fairs */}
            <div className="bg-[#14837E] text-white p-6 rounded-[14px] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F]">
              <span className="font-urbanist font-extrabold text-[15px] text-[#F2B705] leading-none block">Live workshop</span>
              <span className="text-[11px] font-extrabold text-white/80 uppercase tracking-widest block mt-1.5 mb-2">Live Workshops</span>
              <h3 className="font-urbanist text-[20px] font-black leading-snug mb-3">
                Study Abroad Events & Fairs
              </h3>
              <p className="text-[14px] text-white/90 leading-relaxed mb-5">
                Join live webinars, meet university delegates & attend expert coaching masterclasses.
              </p>
              <Link
                to="/events"
                className="w-full text-center py-3 bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] rounded-full text-[13px] font-black shadow-[3px_3px_0_#16130F] hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explore Upcoming Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget 2: Contextual Resource (Blogs / AI Tools / Scholarships) */}
            {pageKey === 'overview' ? (
              <InkCard className="p-6 text-center" shadow="#F2B705">
                <div className="w-12 h-12 rounded-full border-2 border-[#16130F] bg-[#FFF1B8] text-[#16130F] flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0_#16130F]">
                  <BookOpen size={22} />
                </div>
                <h4 className="font-urbanist font-black text-[#16130F] text-[17px] mb-2">Study Abroad Blogs & Guides</h4>
                <p className="text-[14px] text-[#5B544A] leading-relaxed mb-5">
                  Read insider tips, country comparisons, exam strategies & visa application roadmaps.
                </p>
                <Link to="/blogs" className={sideBtn}>
                  Explore All Blogs
                </Link>
              </InkCard>
            ) : pageKey === 'fees' ? (
              <InkCard className="p-6 text-center" shadow="#14837E">
                <div className="w-12 h-12 rounded-full border-2 border-[#16130F] bg-[#DDF3EF] text-[#14837E] flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0_#16130F]">
                  <Award size={22} />
                </div>
                <h4 className="font-urbanist font-black text-[#16130F] text-[17px] mb-2">Scholarships & Grants</h4>
                <p className="text-[14px] text-[#5B544A] leading-relaxed mb-5">
                  Discover government & university scholarships worth up to 100% tuition coverage.
                </p>
                <Link to="/search-programs?highlight=scholarship" className={sideBtn}>
                  Find Scholarships
                </Link>
              </InkCard>
            ) : (
              <InkCard className="p-6 text-center" shadow="#B8285B">
                <div className="w-12 h-12 rounded-full border-2 border-[#16130F] bg-[#FBD9E6] text-[#B8285B] flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0_#16130F]">
                  <Sparkles size={22} />
                </div>
                <h4 className="font-urbanist font-black text-[#16130F] text-[17px] mb-2">AI University Matcher</h4>
                <p className="text-[14px] text-[#5B544A] leading-relaxed mb-5">
                  Find universities matching your target score, budget & profile with 98% accuracy.
                </p>
                <Link to="/ai-tools" className={sideBtn}>
                  Find Best Match
                </Link>
              </InkCard>
            )}

          </aside>

        </div>
      </div>
    </div>
  );
};

export default TOEFLDetailPage;
