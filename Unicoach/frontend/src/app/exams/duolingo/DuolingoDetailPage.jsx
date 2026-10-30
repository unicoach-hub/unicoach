import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  DollarSign,
  Compass,
  Award,
  ArrowRight,
  FileEdit,
  CheckCircle2,
  HelpCircle,
  ListTodo,
  Sparkles,
  Info,
  ChevronDown,
  Mic,
  PenLine,
  Headphones,
  AlertTriangle
} from 'lucide-react';
import { StatStrip, BarCompare, Donut, TimelineStrip, HookBand } from '../../../components/ui/Infographics';
import { StepCounter } from '../../../components/ui/BrandElements';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

/* ── Desi Pop building blocks for the DET content ── */

// Ink-bordered table with a teal header row; wide tables scroll inside their own box
const DTable = ({ head, children, center = [] }) => (
  <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F]" style={{ borderRadius: 12 }}>
    <table className="w-full min-w-[520px] text-left border-collapse">
      <thead className="bg-[#14837E] text-white">
        <tr>
          {head.map((h, i) => (
            <th key={h} className={`py-3 px-4 text-[11.5px] font-extrabold uppercase tracking-wider border-b-[3px] border-[#16130F] ${center.includes(i) ? 'text-center' : ''}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="text-[13px] text-[#3D362E] [&>tr]:border-t-2 [&>tr]:border-[#16130F1A] [&>tr:first-child]:border-t-0 [&>tr:nth-child(even)]:bg-[#FFF6E5]">
        {children}
      </tbody>
    </table>
  </div>
);

// Small heading inside the content card
const SubHead = ({ hi, children }) => (
  <div>
    {hi && <p className="font-urbanist font-extrabold text-[14px] leading-none text-[#D0362E]">{hi}</p>}
    <h3 className="mt-1 font-urbanist font-black text-[19px] sm:text-[21px] leading-tight tracking-[-0.02em] text-[#16130F]">{children}</h3>
  </div>
);

// Callout box with an icon chip
const Callout = ({ icon: Icon = Info, title, children, tone = 'mustard' }) => {
  const bg = tone === 'mustard' ? '#FFF1B8' : tone === 'sindoor' ? '#FCE3DA' : '#DDF3EF';
  const chip = tone === 'mustard' ? '#F2B705' : tone === 'sindoor' ? '#D0362E' : '#14837E';
  const chipFg = tone === 'mustard' ? '#16130F' : '#FFFFFF';
  return (
    <div className="border-[3px] border-[#16130F] p-4 sm:p-5 flex items-start gap-3 shadow-[4px_4px_0_#16130F]" style={{ background: bg, borderRadius: 12 }}>
      <span className="w-9 h-9 rounded-full border-2 border-[#16130F] grid place-items-center shrink-0" style={{ background: chip, color: chipFg }}>
        <Icon size={17} />
      </span>
      <div className="min-w-0">
        <h4 className="font-urbanist font-black text-[13px] uppercase tracking-wider text-[#16130F] mb-1">{title}</h4>
        <div className="text-[13.5px] text-[#3D362E] font-medium leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

// Little card in a 2-up grid, coloured by index
const MiniCard = ({ idx = 0, icon: Icon, title, children }) => {
  const tone = DESI_TONES[idx % 4];
  return (
    <div className="bg-white border-[3px] border-[#16130F] p-4 shadow-[4px_4px_0_#16130F]" style={{ borderRadius: 12, borderTop: `8px solid ${tone.c}` }}>
      <h4 className="font-urbanist font-black text-[14.5px] text-[#16130F] mb-1.5 flex items-center gap-2">
        {Icon && (
          <span className="w-7 h-7 rounded-full border-2 border-[#16130F] grid place-items-center shrink-0" style={{ background: tone.c, color: tone.fg }}>
            <Icon size={14} />
          </span>
        )}
        {title}
      </h4>
      <div className="text-[13px] text-[#5B544A] leading-relaxed">{children}</div>
    </div>
  );
};

const Divider = () => <div className="border-t-2 border-dashed border-[#16130F33]" />;

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
        <div className="space-y-7">
          <Callout tone="teal" icon={Info} title="DET Overview & Key Advantage">
            At Rs. 6,499 ($70), the DET is about three times cheaper than IELTS or TOEFL. Certified results are returned to your account in 48 hours, and you can share them with an unlimited number of universities at zero extra cost.
          </Callout>

          <StatStrip
            stats={[
              { value: '$70', label: 'Test fee (Rs. 6,499)' },
              { value: '~60 min', label: 'Online, from home' },
              { value: '48 hrs', label: 'Certified results' },
              { value: '6,000+', label: 'Universities accept DET' },
            ]}
          />

          <div className="space-y-3">
            <SubHead hi="Duolingo hi kyun">Why are Indian students choosing Duolingo?</SubHead>
            <p className="text-[14px] text-[#5B544A] leading-relaxed">
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
              <MiniCard key={item.title} idx={idx} icon={CheckCircle2} title={item.title}>{item.desc}</MiniCard>
            ))}
          </div>
        </div>
      )
    },
    syllabus: {
      title: "Duolingo English Test Pattern & Syllabus 2026",
      subtitle: "Full breakdown of section formats, question types, and scoring modules.",
      content: (
        <div className="space-y-7">
          <p className="text-[14px] text-[#5B544A] leading-relaxed">
            The DET is a 60-minute adaptive exam consisting of three key sections:
          </p>

          <div>
            <Donut
              kicker="Time split"
              title="How the 60 minutes divide"
              centerValue="60"
              centerLabel="minutes"
              segments={[
                { label: 'Setup & Onboarding', value: 5, display: '5 min' },
                { label: 'Adaptive Test', value: 45, display: '45 min' },
                { label: 'Writing & Speaking Sample', value: 10, display: '10 min' },
              ]}
            />
          </div>

          {/* Section Summary Table */}
          <DTable head={['Section', 'Timing Limit', 'Focus / Requirements']}>
            <tr>
              <td className="py-3 px-4 font-extrabold text-[#16130F]">Section 1: Setup & Onboarding</td>
              <td className="py-3 px-4 font-semibold">5 Minutes</td>
              <td className="py-3 px-4">Verify photo ID (Passport/Aadhaar), check webcam & microphone, room scan.</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-extrabold text-[#16130F]">Section 2: Adaptive Test</td>
              <td className="py-3 px-4 font-semibold">45 Minutes</td>
              <td className="py-3 px-4">~52 scored questions. AI-driven adaptive difficulty.</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-extrabold text-[#16130F]">Section 3: Writing & Speaking Sample</td>
              <td className="py-3 px-4 font-semibold">10 Minutes</td>
              <td className="py-3 px-4">Unscored essay & recorded video response sent directly to universities.</td>
            </tr>
          </DTable>

          {/* Core Adaptive Questions */}
          <Divider />
          <div className="space-y-4">
            <SubHead hi="Sawaalon ke types">Types of Questions in the Adaptive Test</SubHead>
            <DTable head={['Question Type', 'What It Tests', 'Frequency (Approx.)']} center={[2]}>
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
              ].map((row) => (
                <tr key={row.type}>
                  <td className="py-3 px-4 font-extrabold text-[#16130F]">{row.type}</td>
                  <td className="py-3 px-4 text-[#5B544A]">{row.test}</td>
                  <td className="py-3 px-4 font-extrabold text-[#16130F] text-center whitespace-nowrap">{row.freq}</td>
                </tr>
              ))}
            </DTable>
          </div>

          {/* Interactive Reading */}
          <Divider />
          <div className="space-y-4">
            <SubHead hi="Reading">Interactive Reading Section</SubHead>
            <p className="text-[14px] text-[#5B544A]">Evaluates reading comprehension and academic literacy through short passages:</p>
            <DTable head={['Question Type', 'What It Tests', 'Frequency (Approx.)']} center={[2]}>
              {[
                { type: "Complete the Sentences", test: "Choose the best word to fill in the blanks based on context", freq: "2 times" },
                { type: "Complete the Passage", test: "Connect two passages logically with a suitable sentence", freq: "2 times" },
                { type: "Highlight the Answer", test: "Identify the correct line or phrase that answers the question", freq: "4 times" },
                { type: "Identify the Idea", test: "Summarise the passage with a concise statement", freq: "2 times" },
                { type: "Title the Passage", test: "Identify the most appropriate title for the passage", freq: "2 times" }
              ].map((row) => (
                <tr key={row.type}>
                  <td className="py-3 px-4 font-extrabold text-[#16130F]">{row.type}</td>
                  <td className="py-3 px-4 text-[#5B544A]">{row.test}</td>
                  <td className="py-3 px-4 font-extrabold text-[#16130F] text-center whitespace-nowrap">{row.freq}</td>
                </tr>
              ))}
            </DTable>
          </div>

          {/* Interactive Listening */}
          <Divider />
          <div className="space-y-4">
            <SubHead hi="Listening">Interactive Listening Section</SubHead>
            <p className="text-[14px] text-[#5B544A]">Measures conversational English in academic and real-life scenarios:</p>
            <DTable head={['Question Type', 'What It Tests', 'Frequency (Approx.)']} center={[2]}>
              <tr>
                <td className="py-3 px-4 font-extrabold text-[#16130F]">Listen and Respond</td>
                <td className="py-3 px-4 text-[#5B544A]">Select the most appropriate conversational response after hearing a clip</td>
                <td className="py-3 px-4 font-extrabold text-[#16130F] text-center whitespace-nowrap">10 times</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-extrabold text-[#16130F]">Summarise the Conversation</td>
                <td className="py-3 px-4 text-[#5B544A]">Write a short summary text describing what you just heard</td>
                <td className="py-3 px-4 font-extrabold text-[#16130F] text-center whitespace-nowrap">2 times</td>
              </tr>
            </DTable>
          </div>

          {/* Writing and Speaking Sample */}
          <Divider />
          <div className="space-y-4">
            <SubHead hi="Writing aur speaking">Writing & Speaking Sample</SubHead>
            <p className="text-[14px] text-[#5B544A]">Evaluates your productive output and self-expression capability:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MiniCard idx={0} icon={Mic} title="Speaking Sample (Video)">
                Given a prompt. 30 seconds preparation, then 3 minutes of recorded spoken response. Aim to speak for at least 1 minute.
              </MiniCard>
              <MiniCard idx={2} icon={PenLine} title="Writing Sample (Essay)">
                Given a prompt. 3 to 5 minutes to write an essay response. You must write at least 50 words.
              </MiniCard>
            </div>
          </div>
        </div>
      )
    },
    fees: {
      title: "Duolingo English Test Fees 2026: Cost Mappings for Indians",
      subtitle: "Detailed price grid comparison, payment methods, and waivers.",
      content: (
        <div className="space-y-7">
          <p className="text-[14px] text-[#5B544A] leading-relaxed">
            The DET base test fee is <strong className="font-extrabold text-[#16130F]">$70 (~Rs. 6,192)</strong> based on reference exchange rate of 1 USD = Rs. 88.46. Sharing score reports is completely free and unlimited. Below is the updated pricing schedule:
          </p>

          <HookBand value="$70" label="base DET fee (~Rs. 6,192), with unlimited free score sending" hi="Sasta" />

          <DTable head={['Fee Option', 'Cost (USD)', 'Cost (INR Approx.)']}>
            <tr>
              <td className="py-3.5 px-4 font-extrabold text-[#16130F]">Single Test</td>
              <td className="py-3.5 px-4">$70</td>
              <td className="py-3.5 px-4 font-extrabold text-[#14837E]">Rs. 6,192</td>
            </tr>
            <tr>
              <td className="py-3.5 px-4 font-extrabold text-[#16130F]">Two-Test Bundle (Recommended)</td>
              <td className="py-3.5 px-4">$118</td>
              <td className="py-3.5 px-4 font-extrabold text-[#14837E]">Rs. 10,427</td>
            </tr>
            <tr>
              <td className="py-3.5 px-4 font-extrabold text-[#16130F]">Fast Results Add-On (12-hour delivery)</td>
              <td className="py-3.5 px-4">$40</td>
              <td className="py-3.5 px-4 font-extrabold text-[#14837E]">Rs. 3,538</td>
            </tr>
          </DTable>

          <div>
            <BarCompare
              kicker="Price grid"
              title="DET fee options in INR (approx.)"
              highlight="Single Test"
              items={[
                { label: 'Two-Test Bundle', value: 10427, display: 'Rs. 10,427' },
                { label: 'Single Test', value: 6192, display: 'Rs. 6,192' },
                { label: 'Fast Results Add-On', value: 3538, display: 'Rs. 3,538' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MiniCard idx={2} title="What is Included:">
              One-hour online exam access within 21 days of purchase, unlimited score sending, 1 official mock practice test, results in 48 hours.
            </MiniCard>
            <MiniCard idx={0} title="What is NOT Included:">
              Fast track express processing and refunds for missed, expired, or proctor-voided tests.
            </MiniCard>
          </div>

          <Divider />
          <div className="space-y-4">
            <SubHead hi="Payment kaise karein">Payment Methods & Guidelines</SubHead>
            <p className="text-[14px] text-[#5B544A]">Payments are processed in USD via secure gateways on Duolingo's website.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MiniCard idx={2} title="Accepted Methods:">
                Visa, Mastercard, American Express, Discover, PayPal, Alipay.
              </MiniCard>
              <MiniCard idx={0} title="Not Supported:">
                UPI, net banking, direct bank transfers, or cash.
              </MiniCard>
            </div>
          </div>

          <Divider />
          <div className="space-y-4">
            <SubHead hi="Date badalni hai?">Rescheduling & Cancellations</SubHead>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MiniCard idx={1} title="No Rescheduling fees">
                You can take the test at any time within 21 days of purchase. No scheduling or booking of slots is required.
              </MiniCard>
              <MiniCard idx={3} title="Cancellation Policy">
                No refunds for unused or expired tests. Refunds are only issued for verified technical issues on Duolingo's end.
              </MiniCard>
            </div>
          </div>
        </div>
      )
    },
    registration: {
      title: "How to Register and Take DET from India",
      subtitle: "Document verification rules and system requirements checklist.",
      content: (
        <div className="space-y-7">
          <StepCounter
            items={[
              { label: 'Valid ID' },
              { label: 'Computer setup' },
              { label: 'Secondary camera' },
              { label: 'Test Room' },
              { label: 'International Card', highlight: true },
            ]}
          />
          <DTable head={['Requirement', 'Specification / Details']}>
            <tr>
              <td className="py-3.5 px-4 font-extrabold text-[#16130F] whitespace-nowrap">Valid ID</td>
              <td className="py-3.5 px-4">Passport, national ID, or driver's license. Aadhaar card is fully accepted in India.</td>
            </tr>
            <tr>
              <td className="py-3.5 px-4 font-extrabold text-[#16130F] whitespace-nowrap">Computer setup</td>
              <td className="py-3.5 px-4">Laptop or desktop with webcam, speakers, microphone. Tablets and phones are not supported.</td>
            </tr>
            <tr>
              <td className="py-3.5 px-4 font-extrabold text-[#16130F] whitespace-nowrap">Secondary camera</td>
              <td className="py-3.5 px-4">Smartphone is required. You scan a QR code to position it to record your workspace and screen.</td>
            </tr>
            <tr>
              <td className="py-3.5 px-4 font-extrabold text-[#16130F] whitespace-nowrap">Test Room</td>
              <td className="py-3.5 px-4">Quiet, well-lit private room. No headphones are allowed. No other person may enter.</td>
            </tr>
            <tr>
              <td className="py-3.5 px-4 font-extrabold text-[#16130F] whitespace-nowrap">International Card</td>
              <td className="py-3.5 px-4">Visa, Mastercard, or AMEX. UPI is not supported. Enable international transaction rights.</td>
            </tr>
          </DTable>

          <div className="p-4 bg-[#FCE3DA] border-[3px] border-[#16130F] text-[13px] font-semibold text-[#3D362E] leading-relaxed flex items-start gap-3 shadow-[4px_4px_0_#D0362E]" style={{ borderRadius: 12 }}>
            <AlertTriangle size={18} className="text-[#D0362E] shrink-0 mt-0.5" />
            <p><strong className="text-[#16130F]">Proctoring Warning:</strong> Many tests fail certification because of background tools. Restart your laptop before testing and close all communication/sync tools (WhatsApp Web, Telegram, cloud sync, etc.).</p>
          </div>
        </div>
      )
    },
    results: {
      title: "DET Scores and University Expectations",
      subtitle: "Overview of score scale and IELTS equivalency shifts.",
      content: (
        <div className="space-y-7">
          <Callout tone="sindoor" icon={AlertTriangle} title="Important Score Mismatch Warning">
            In early 2025, Duolingo updated its score equivalency table. Previously, DET 125 converted to IELTS 7.5; it now converts to approximately IELTS 6.5. If your university admissions page still lists old matches, contact them directly.
          </Callout>

          <div className="space-y-4">
            <SubHead hi="Kitna score chahiye">Score Benchmarks</SubHead>
            <div>
              <BarCompare
                kicker="Target scores"
                title="Typical DET score by program level"
                highlight="Postgraduate"
                items={[
                  { label: 'Foundation', value: 95, display: '85–95' },
                  { label: 'Undergraduate', value: 115, display: '100–115' },
                  { label: 'Postgraduate', value: 125, display: '115–125' },
                  { label: 'Competitive', value: 135, display: '125–135+' },
                ]}
              />
            </div>
            <DTable head={['Program Level', 'Typical DET score expectation', 'Approx. IELTS Equivalent']}>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#16130F]">Foundation / Pathway</td>
                <td className="py-3.5 px-4">85 to 95</td>
                <td className="py-3.5 px-4 text-[#5B544A]">5.0 to 5.5</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#16130F]">Undergraduate (UG)</td>
                <td className="py-3.5 px-4">100 to 115</td>
                <td className="py-3.5 px-4 text-[#5B544A]">5.5 to 6.0</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#16130F]">Postgraduate (PG)</td>
                <td className="py-3.5 px-4">115 to 125</td>
                <td className="py-3.5 px-4 text-[#5B544A]">6.0 to 6.5</td>
              </tr>
              <tr className="!bg-[#FFF1B8] font-black text-[#16130F]">
                <td className="py-3.5 px-4">Competitive / Ivy League</td>
                <td className="py-3.5 px-4">125 to 135+</td>
                <td className="py-3.5 px-4">7.0+</td>
              </tr>
            </DTable>
          </div>
        </div>
      )
    },
    preparation: {
      title: "How to Prepare for the Duolingo English Test (DET) 2026",
      subtitle: "Section-specific study plans, daily schedules, and recommended practice resources.",
      content: (
        <div className="space-y-7">
          <Callout tone="teal" icon={Sparkles} title="DET Prep Strategy Overview">
            Because Duolingo is an adaptive test, your success relies on quick, spontaneous communication. Begin by taking the free practice test on the official site to find your benchmark score, then focus your prep on low-scoring subscales (usually Production).
          </Callout>

          <div className="space-y-4">
            <SubHead hi="Har section ki taiyari">Section-Wise Prep Strategies</SubHead>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MiniCard idx={0} icon={Mic} title="Speaking Section">
                Record yourself answering random prompts, replay to catch pauses or pronunciation slips. Mimic dialogue flows from podcasts to enhance coherence. Focus on a clear, structured pace.
              </MiniCard>
              <MiniCard idx={1} icon={PenLine} title="Writing Section">
                Practice typing daily on your laptop (target 40-60 WPM using keybr.com). Write daily summaries of read articles, and participate in discussion threads on Reddit or Quora to refine sentence styling.
              </MiniCard>
              <MiniCard idx={2} icon={BookOpen} title="Reading Section">
                Read news outlets like BBC, Reuters, or The Guardian. Work on synonym drills to expand vocabulary, and practice identifying main themes and connecting ideas in text blocks.
              </MiniCard>
              <MiniCard idx={3} icon={Headphones} title="Listening Section">
                Expose yourself to diverse accents (American, British, Australian) by watching documentaries and podcasts. Summarise spoken clips to practice active listening.
              </MiniCard>
            </div>
          </div>

          <Divider />
          <div className="space-y-4">
            <SubHead hi="Daily routine">Suggested Daily Study Routine</SubHead>
            <p className="text-[14px] text-[#5B544A]">Dedicate 45 to 60 minutes daily using this weekly structure:</p>
            <div>
              <TimelineStrip
                kicker="45–60 min a day"
                title="Your weekly DET routine"
                steps={[
                  { when: 'Days 1 - 3', what: 'Vocabulary expansion drills', note: 'Active listening tests' },
                  { when: 'Days 4 - 6', what: 'Contextual reading comprehension', note: 'Timed typing / essay writing' },
                  { when: 'Day 7', what: 'Full-length adaptive mock test', note: 'Detailed review', highlight: true },
                ]}
              />
            </div>
          </div>

          <Divider />
          <div className="space-y-4">
            <SubHead hi="Kaam ki cheezein">Recommended Preparation Resources</SubHead>
            <ul className="space-y-2.5 text-[14px] text-[#3D362E]">
              {[
                { k: 'Official DET website:', v: ' Unlimited free practice tests.' },
                { k: 'Apps:', v: ' BBC Learning English, ELSA Speak, Grammarly.' },
                { k: 'Communities:', v: " Reddit's r/duolingo and UniCoach community forums." }
              ].map((r, i) => (
                <li key={r.k} className="flex items-start gap-2.5">
                  <span className="mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#16130F] shrink-0" style={{ background: DESI_TONES[i].c }} />
                  <span><strong className="text-[#16130F]">{r.k}</strong>{r.v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    },
    "sample-questions": {
      title: "Duolingo English Test Sample Questions & Answers",
      subtitle: "Practice with high-scoring model answers mapped to 2026 guidelines.",
      content: (
        <div className="space-y-7">
          <p className="text-[14px] text-[#5B544A] leading-relaxed">
            Below are verified sample prompts and corresponding expert responses to help benchmark your preparation.
          </p>

          <div className="space-y-6">
            {/* Speaking Sample */}
            <div className="p-4 sm:p-5 bg-[#DDF3EF] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] space-y-3" style={{ borderRadius: 14 }}>
              <Sticker bg="#14837E" fg="#FFFFFF" tilt={-1.5}><Mic size={13} />Speaking Prompt (Model Response)</Sticker>
              <p className="font-urbanist font-black text-[16px] text-[#16130F] leading-snug">
                "Describe a journey or travel experience you took that was highly memorable to you."
              </p>
              <div className="p-4 bg-white border-2 border-[#16130F] rounded-xl text-[13.5px] leading-relaxed text-[#3D362E] space-y-2">
                <p>
                  "A particularly memorable journey I took was a trip to the mountain regions of Himachal Pradesh two years ago. I traveled by train to the foothills and then completed the rest of the journey by local bus along winding mountain paths. The views of the towering pine forests and snow-capped peaks were absolutely breathtaking."
                </p>
                <p>
                  "What made this trip stand out was getting to interact with the local communities. They shared stories about their traditional lifestyles, their food, and how they navigate winters. It was a refreshing contrast to busy city environments and deepened my appreciation for quiet, rural spaces."
                </p>
              </div>
            </div>

            {/* Writing Sample */}
            <div className="p-4 sm:p-5 bg-[#FFF1B8] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] space-y-3" style={{ borderRadius: 14 }}>
              <Sticker bg="#F2B705" tilt={1.5}><PenLine size={13} />Writing Prompt (Model Response)</Sticker>
              <p className="font-urbanist font-black text-[16px] text-[#16130F] leading-snug">
                "Some people believe that university education should be completely free for everyone. Do you agree or disagree?"
              </p>
              <div className="p-4 bg-white border-2 border-[#16130F] rounded-xl text-[13.5px] leading-relaxed text-[#3D362E] space-y-2">
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

  const currentName = sidebarLinks.find(l => l.key === pageKey)?.name || "Details";

  return (
    <main className="min-h-screen bg-[#FFF6E5] pb-20 select-none font-['Onest',sans-serif] text-[#16130F]">
      {/* ── HERO: teal poster band ── */}
      <DesiHero
        tone="teal"
        sign={{ hi: 'डुओलिंगो', en: 'DUOLINGO DESK' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Duolingo', to: '/exams/duolingo' }, { label: currentName }]}
        title={activeContent.title}
        subtitle={activeContent.subtitle}
      />

      {/* ── DIRECTORY PICKER (phones and tablets) ── */}
      <div className="lg:hidden max-w-[1240px] mx-auto px-4 -mt-6 mb-8 relative z-10">
        <InkCard className="p-3">
          <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none px-1 mb-2">Duolingo guide</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sidebarLinks.map((link) => {
              const IconComp = link.icon;
              const isActive = pageKey === link.key;
              return (
                <button
                  key={link.key}
                  onClick={() => navigate(link.path)}
                  className={`no-shine flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 cursor-pointer ${isActive ? 'bg-[#14837E] text-white border-[#16130F] shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
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
          <aside className="hidden lg:block lg:col-span-4 sticky top-28">
            <InkCard className="p-4">
              <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Duolingo guide</p>
              <h3 className="mt-1 mb-3 font-urbanist font-black text-[17px]">Duolingo Directory</h3>
              <nav className="flex flex-col gap-2">
                {sidebarLinks.map((link, idx) => {
                  const IconComp = link.icon;
                  const isActive = pageKey === link.key;
                  const tone = DESI_TONES[idx % 4];
                  return (
                    <button
                      key={link.key}
                      onClick={() => navigate(link.path)}
                      className={`no-shine group w-full flex items-center justify-between px-3 py-2.5 rounded-lg border-2 text-[14px] font-bold text-left transition-colors cursor-pointer ${isActive ? 'bg-[#14837E] text-white border-[#16130F] shadow-[3px_3px_0_#16130F]' : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full border-2 border-[#16130F] grid place-items-center shrink-0" style={{ background: isActive ? '#FFFFFF' : tone.c, color: isActive ? '#14837E' : tone.fg }}>
                          <IconComp size={14} />
                        </span>
                        {link.name}
                      </span>
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </nav>
            </InkCard>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10 min-w-0">
            <InkCard className="p-5 sm:p-8 md:p-10" shadow="#14837E">
              <DesiHeading hi="Poori jaankari">{currentName}</DesiHeading>
              <div className="mt-6 pt-6 border-t-2 border-dashed border-[#16130F33]">
                {activeContent.content}
              </div>
            </InkCard>

            {/* FAQs Accordion */}
            <section>
              <DesiHeading hi="Sabke sawaal">Frequently Asked Questions</DesiHeading>
              <div className="mt-5 space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = !!openFaq[idx];
                  return (
                    <div key={faq.q} className="bg-white border-[3px] border-[#16130F] overflow-hidden" style={{ borderRadius: 12, boxShadow: isOpen ? '4px 4px 0 #14837E' : '4px 4px 0 #16130F' }}>
                      <button
                        onClick={() => toggleFaq(idx)}
                        aria-expanded={isOpen}
                        className="no-shine w-full flex items-center justify-between gap-3 p-4 text-left font-bold text-[14.5px] cursor-pointer"
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
                            <p className="px-4 pb-4 pt-3 text-[#5B544A] text-[14px] border-t-2 border-dashed border-[#16130F33] leading-relaxed">
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

            {/* Closing CTA */}
            <BookOkCta
              hi="Duolingo ka plan"
              title="Book OK Please."
              text="DET score kitna chahiye, kab dena hai? Free 1:1 call mein mentor se poocho."
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default DuolingoDetailPage;
