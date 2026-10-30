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
  ChevronRight,
  AlertTriangle,
  FileEdit,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ListTodo,
  Sparkles,
  Info,
  Lightbulb
} from 'lucide-react';
import { HookBand, StatStrip, BarCompare, TimelineStrip, Donut, VersusCard } from '../../../components/ui/Infographics';
import { TapeHeadline, StepCounter, JourneyPills } from '../../../components/ui/BrandElements';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

const PTEDetailPage = ({ pageKey }) => {
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const sidebarLinks = [
    { name: 'PTE Overview', path: '/exams/pte/overview', key: 'overview', icon: Compass },
    { name: 'PTE Syllabus', path: '/exams/pte/syllabus', key: 'syllabus', icon: BookOpen },
    { name: 'PTE Exam Fees', path: '/exams/pte/fees', key: 'fees', icon: DollarSign },
    { name: 'PTE Exam Dates', path: '/exams/pte/dates', key: 'dates', icon: Calendar },
    { name: 'PTE Registration', path: '/exams/pte/registration', key: 'registration', icon: FileEdit },
    { name: 'PTE Centres', path: '/exams/pte/centres', key: 'centres', icon: MapPin },
    { name: 'PTE Results', path: '/exams/pte/results', key: 'results', icon: Award },
    { name: 'PTE Slot Booking', path: '/exams/pte/slot-booking', key: 'slot-booking', icon: ShieldCheck },
    { name: 'PTE Preparation', path: '/exams/pte/preparation', key: 'preparation', icon: ListTodo }
  ];

  // Rich contents dictionary for PTE tabs
  const contentMap = {
    overview: {
      title: "PTE Academic Exam 2026: A Complete Guide",
      subtitle: "The Pearson Test of English (PTE) is a highly standardized computer-based English proficiency test accepted worldwide.",
      content: (
        <div className="space-y-6">
          <div className="bg-[#FFF1B8] border-2 border-[#16130F] p-5 rounded-2xl flex items-start gap-3.5 shadow-[4px_4px_0_#16130F]">
            <Info className="text-[#DE5C2B] w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-[#16130F] text-xs uppercase tracking-wider mb-1">PTE 2026 Update Summary</h4>
              <p className="text-xs text-[#16130F] leading-relaxed font-semibold">
                Pearson has implemented the Hybrid Scoring Model, introducing double-marking where human experts review AI evaluations for open-ended tasks (like the Essay). In addition, two new tasks (Respond to a Situation, Summarize Group Discussion) are now active in the Speaking & Writing section.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="font-['Rozha_One',serif] text-[14px] leading-none text-[#D0362E]">शुरुआत</p>
              <h3 className="mt-1 font-urbanist text-[20px] sm:text-[22px] font-black tracking-[-0.02em] text-[#16130F] flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-[#16130F] rotate-45 inline-block shrink-0" style={{ background: '#14837E' }} />
                1. What is the PTE Academic Exam?
              </h3>
            </div>
            <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
              PTE evaluates four core English skills: Speaking, Writing, Reading, and Listening using automated AI technology to ensure unbiased and objective outcomes.
            </p>
            <StatStrip
              stats={[
                { value: '2h 15m', label: 'Approximate exam duration' },
                { value: '24–48h', label: 'Score reports published online' },
                { value: 'Unlimited', label: 'Free score reports to universities' },
                { value: '62+', label: 'Authorized test centres in India' }
              ]}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 my-6">
              {[
                { title: "Duration", desc: "Approximately 2 hours and 15 minutes to complete the full automated exam." },
                { title: "Fast Results", desc: "Get score reports published online within 24 to 48 hours." },
                { title: "Unlimited Reporting", desc: "Report scores to unlimited target universities free of charge via your portal." },
                { title: "Flexible Slots", desc: "Offered daily across 62+ authorized physical test centers in India." }
              ].map((item, idx) => (
                <div key={idx} className="border-2 border-[#16130F] p-4.5 rounded-2xl bg-[#FFF6E5] hover:bg-[#FFF6E5] transition-colors shadow-[4px_4px_0_#16130F]">
                  <h4 className="font-black text-[#16130F] text-xs mb-1 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#14837E]" />
                    {item.title}
                  </h4>
                  <p className="text-[12.5px] text-[#5B544A] font-semibold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <div>
              <p className="font-['Rozha_One',serif] text-[14px] leading-none text-[#D0362E]">तुलना</p>
              <h3 className="mt-1 font-urbanist text-[20px] sm:text-[22px] font-black tracking-[-0.02em] text-[#16130F] flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-[#16130F] rotate-45 inline-block shrink-0" style={{ background: '#14837E' }} />
                PTE vs PTE Core: Which Option is Best?
              </h3>
            </div>
            <div>
              <VersusCard
                kicker="Pick your test"
                title="PTE Academic vs PTE Core"
                left={{ title: 'PTE Academic', tag: 'Study', points: ['UG or PG admission and professional licensing', 'Accepted by USA, UK, Canada, Australia and New Zealand'] }}
                right={{ title: 'PTE Core', tag: 'Canada PR', points: ['Immigration and permanent residency pathways in Canada', 'Practical, everyday English instead of academic jargon'] }}
              />
            </div>
          </div>
        </div>
      )
    },
    syllabus: {
      title: "PTE Exam Syllabus and Pattern 2026: Section Breakdown",
      subtitle: "The PTE Academic exam consists of 3 sections testing 4 communication skills over 22 different task formats.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            The exam takes approximately 2 hours and 15 minutes. Review the duration and structure of each section below:
          </p>

          <HookBand value="10–90" label="Global scale score across 3 sections and 22 task formats" />

          <div>
            <Donut
              kicker="Time split"
              title="Minutes per PTE section"
              segments={[
                { label: 'Speaking & Writing', value: 67, display: '54–67 min' },
                { label: 'Reading', value: 30, display: '29–30 min' },
                { label: 'Listening', value: 43, display: '30–43 min' }
              ]}
              centerValue="3"
              centerLabel="sections"
            />
          </div>

          <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] my-6">
            <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
              <thead className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F] font-bold uppercase">
                <tr>
                  <th className="py-3 px-4 text-xs font-black">PTE Section</th>
                  <th className="py-3 px-4 text-xs font-black">Duration</th>
                  <th className="py-3 px-4 text-xs font-black">Core Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16130F]/15 text-[#3D362E] font-semibold text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Speaking & Writing</td>
                  <td className="py-3.5 px-4">54 - 67 Minutes</td>
                  <td className="py-3.5 px-4 text-[#5B544A]">Read Aloud, Repeat Sentence, Describe Image, Summarize Written Text, Write Essay, Respond to Situation, Summarize Group Discussion.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Reading</td>
                  <td className="py-3.5 px-4">29 - 30 Minutes</td>
                  <td className="py-3.5 px-4 text-[#5B544A]">Reading & Writing Fill in the Blanks, Multiple Choice (Multiple/Single Answers), Re-order Paragraphs.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Listening</td>
                  <td className="py-3.5 px-4">30 - 43 Minutes</td>
                  <td className="py-3.5 px-4 text-[#5B544A]">Summarize Spoken Text, Fill in Blanks, Highlight Correct Summary, Select Missing Word, Highlight Incorrect Words, Dictation.</td>
                </tr>
                <tr className="bg-[#DDF3EF] font-bold">
                  <td className="py-3.5 px-4 text-[#16130F]">Total Duration</td>
                  <td className="py-3.5 px-4 text-[#14837E]">113 - 140 Minutes</td>
                  <td className="py-3.5 px-4 text-[#14837E]">Global scale score: 10 - 90 points</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-5 pt-4">
            <div>
              <p className="font-['Rozha_One',serif] text-[14px] leading-none text-[#D0362E]">पेपर का ढाँचा</p>
              <h3 className="mt-1 font-urbanist text-[20px] sm:text-[22px] font-black tracking-[-0.02em] text-[#16130F] flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-[#16130F] rotate-45 inline-block shrink-0" style={{ background: '#14837E' }} />
                Syllabus Section Details
              </h3>
            </div>

            {/* Speaking & Writing */}
            <div className="p-5 border-2 border-[#16130F] rounded-2xl bg-[#FFF6E5] space-y-3 shadow-[4px_4px_0_#16130F]">
              <h4 className="font-extrabold text-xs text-[#14837E] uppercase tracking-wide">1. Speaking & Writing Section</h4>
              <p className="text-[12.5px] text-[#3D362E] font-semibold leading-relaxed">
                Evaluates oral production and academic writing. Includes new 2026 tasks:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-[#5B544A]">
                {["Read Aloud", "Repeat Sentence", "Describe Image", "Re-tell Lecture", "Answer Short Question", "Summarize Written Text", "Write Essay", "Respond to Situation (New)", "Summarize Discussion (New)"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border-2 border-[#16130F] p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-[#14837E] rounded-full flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Reading */}
            <div className="p-5 border-2 border-[#16130F] rounded-2xl bg-[#FFF6E5] space-y-3 shadow-[4px_4px_0_#16130F]">
              <h4 className="font-extrabold text-xs text-[#14837E] uppercase tracking-wide">2. Reading Section</h4>
              <p className="text-[12.5px] text-[#3D362E] font-semibold leading-relaxed">
                Evaluates text parsing and comprehension of academic contexts:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-[#5B544A]">
                {["Reading & Writing Blank Fills", "Multiple Choice (Multi)", "Re-order Paragraphs", "Reading Blank Fills (Drag)", "Multiple Choice (Single)"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border-2 border-[#16130F] p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-[#14837E] rounded-full flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Listening */}
            <div className="p-5 border-2 border-[#16130F] rounded-2xl bg-[#FFF6E5] space-y-3 shadow-[4px_4px_0_#16130F]">
              <h4 className="font-extrabold text-xs text-[#14837E] uppercase tracking-wide">3. Listening Section</h4>
              <p className="text-[12.5px] text-[#3D362E] font-semibold leading-relaxed">
                Evaluates ability to process diverse English accents in audio and video clips:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-[#5B544A]">
                {["Summarize Spoken Text", "Multiple Choice (Multi)", "Fill in the Blanks", "Highlight Correct Summary", "Multiple Choice (Single)", "Select Missing Word", "Highlight Incorrect Words", "Write from Dictation"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border-2 border-[#16130F] p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-[#14837E] rounded-full flex-shrink-0" />
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
      title: "PTE Exam Fees 2026: Registration & Rescheduling Charges",
      subtitle: "Review the standardized fees, additional late booking surcharges, and refund rules.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            In India, the PTE Academic fee is standardized across centers, though extra charges apply for last-minute schedules.
          </p>

          <HookBand value="₹18,900" label="Standard PTE Academic fee in India, including 18% GST" hi="फ़ीस" />

          <div className="space-y-2">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">1. PTE Exam Fee Breakdown</h4>
            <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F]">
              <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
                <thead className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F] font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black">Fee Category</th>
                    <th className="py-3 px-4 text-xs font-black">Amount in India (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16130F]/15 text-[#3D362E] font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#16130F]">Standard PTE Exam Fee (including 18% GST)</td>
                    <td className="py-3 px-4 text-[#14837E] font-bold">₹18,900</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Base Fee (excluding GST)</td>
                    <td className="py-3 px-4">₹16,017 (approx.)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Late Booking Surcharge (within 48 hours of test)</td>
                    <td className="py-3 px-4">₹695 (approx.)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <BarCompare
              kicker="Fee breakdown"
              title="What you pay for PTE in India"
              items={[
                { label: 'Standard fee (incl. GST)', value: 18900, display: '₹18,900' },
                { label: 'Base fee (excl. GST)', value: 16017, display: '₹16,017' },
                { label: 'Late booking surcharge', value: 695, display: '₹695' }
              ]}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">2. Rescheduling & Cancellation Policy</h4>
            <p className="text-xs text-[#5B544A] font-semibold leading-relaxed">
              If you decide to modify your appointment details, refunds or surcharges depend strictly on your notice buffer:
            </p>

            <div>
              <TimelineStrip
                kicker="Notice period"
                title="How much you get back"
                steps={[
                  { when: '14+ days', what: 'Free reschedule', note: '100% refund on cancel', highlight: true },
                  { when: '7 to 13 days', what: '50% fee charge', note: '50% refund on cancel' },
                  { when: 'Under 7 days', what: '100% fee charge', note: 'No refund' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reschedule */}
              <div className="border-2 border-[#16130F] rounded-2xl p-4 bg-[#FFF6E5] shadow-[4px_4px_0_#16130F]">
                <h5 className="font-black text-xs text-[#14837E] mb-3 uppercase tracking-wider">Rescheduling timelines</h5>
                <ul className="space-y-2.5 text-[12.5px] font-bold text-[#3D362E] leading-relaxed">
                  <li className="flex justify-between border-b border-[#16130F]/15 pb-1.5">
                    <span>14+ Days Notice</span>
                    <span className="text-[#14837E]">Free of cost</span>
                  </li>
                  <li className="flex justify-between border-b border-[#16130F]/15 pb-1.5">
                    <span>7 to 13 Days Notice</span>
                    <span className="text-[#14837E]">50% fee charge</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Less than 7 Days</span>
                    <span className="text-[#14837E]">100% fee charge</span>
                  </li>
                </ul>
              </div>

              {/* Cancellation */}
              <div className="border-2 border-[#16130F] rounded-2xl p-4 bg-[#FFF6E5] shadow-[4px_4px_0_#16130F]">
                <h5 className="font-black text-xs text-[#D0362E] mb-3 uppercase tracking-wider">Cancellation Refunds</h5>
                <ul className="space-y-2.5 text-[12.5px] font-bold text-[#3D362E] leading-relaxed">
                  <li className="flex justify-between border-b border-[#16130F]/15 pb-1.5">
                    <span>14+ Days Notice</span>
                    <span className="text-[#14837E]">100% refund</span>
                  </li>
                  <li className="flex justify-between border-b border-[#16130F]/15 pb-1.5">
                    <span>7 to 13 Days Notice</span>
                    <span className="text-[#14837E]">50% refund</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Less than 7 Days</span>
                    <span className="text-[#D0362E]">No refund</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-[#FFF1B8] border-2 border-[#16130F] p-4.5 rounded-2xl text-[12.5px] text-[#16130F] font-semibold leading-relaxed flex gap-2 shadow-[4px_4px_0_#16130F]">
              <AlertTriangle className="w-4 h-4 text-[#16130F] flex-shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> You must request rescheduling or cancellation through the myPTE portal. No changes are permitted within 7 days of the test without forfeiting your fee.
              </span>
            </div>
          </div>
        </div>
      )
    },
    dates: {
      title: "PTE Exam Dates 2026: Booking Strategies & Timeline Planning",
      subtitle: "Plan your PTE test date to coordinate with university intake periods and PR deadlines.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            The PTE is conducted year-round. While scheduling is flexible, we suggest considering these strategic timelines:
          </p>

          <StatStrip
            stats={[
              { value: '1.5–2 mo', label: 'Before your university application deadline' },
              { value: '3 weeks', label: 'Advance booking in peak months (Nov to Jan)' },
              { value: '16 days', label: 'Gap buffer between retake attempts' }
            ]}
          />

          <div className="space-y-4">
            <div>
              <p className="font-['Rozha_One',serif] text-[14px] leading-none text-[#D0362E]">तारीख़ें</p>
              <h3 className="mt-1 font-urbanist text-[20px] sm:text-[22px] font-black tracking-[-0.02em] text-[#16130F] flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-[#16130F] rotate-45 inline-block shrink-0" style={{ background: '#14837E' }} />
                How to Select a Test Date?
              </h3>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-[#5B544A] font-semibold">
              <p>• <strong>University Application Deadlines:</strong> Schedule your exam at least <strong>1.5 to 2 months</strong> before your target university application portals close. This leaves a safe margin if you need a retake.</p>
              <p>• <strong>Peak Admission Seasons:</strong> During peak months (November to January for Fall intake), weekend slots fill up rapidly. Book your date <strong>3 weeks in advance</strong>.</p>
              <p>• <strong>Retake Buffer:</strong> Pearson requires you to receive your previous scores before booking your next attempt. Allow for a 16-day gap buffer if planning multiple attempts.</p>
            </div>
          </div>

          <div className="bg-[#DDF3EF] p-4.5 rounded-2xl border-2 border-[#16130F] text-[12.5px] text-[#16130F] font-semibold leading-relaxed shadow-[4px_4px_0_#16130F]">
            <Lightbulb size={14} className="inline-block -mt-0.5 mr-1 text-[#D0362E]" /><strong>Preparation Strategy:</strong> We suggest booking only after completing at least two baseline mock tests. If your score sits within 5 points of your target, book your slot immediately!
          </div>
        </div>
      )
    },
    registration: {
      title: "PTE Exam Registration 2026: Step-by-Step Guide",
      subtitle: "Complete your Pearson PTE Academic booking securely using our detailed walkthrough.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            PTE Academic registration is a fully digital process completed via the Pearson portal:
          </p>

          <div className="space-y-4">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">6-Step Registration Walkthrough</h4>
            <JourneyPills
              active={5}
              steps={[
                { label: 'Book a Test', sub: 'Pearson PTE site' },
                { label: 'Destination', sub: 'Study, work or migration' },
                { label: 'Availability', sub: 'Compare test cities' },
                { label: 'myPTE', sub: 'Match your passport' },
                { label: 'Verify ID', sub: 'Surname Dot rule' },
                { label: 'Pay', sub: '₹18,900 online' }
              ]}
            />
            <div className="space-y-2 text-[12.5px] font-bold text-[#5B544A]">
              {[
                "1. Visit Pearson PTE: Go to the official Pearson PTE website and click 'Book a Test'.",
                "2. Choose Destination: Input your target country and goal (Study, Work, or Migration).",
                "3. Search Availability: Select test center cities to compare real-time date options.",
                "4. myPTE Profile: Sign up or log into your myPTE profile. Make sure name details match your passport.",
                "5. Profile Verification: Input identity details carefully. Remember the Surname Dot rule.",
                "6. Secure Slot & Pay: Read policies, complete the online fee payment of ₹18,900, and print your receipt."
              ].map((step, idx) => (
                <div key={idx} className="p-3.5 bg-[#FFF6E5] rounded-xl border-2 border-[#16130F] leading-relaxed">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <TapeHeadline as="h4" lines={[{ text: 'The "Surname Dot" Rule' }]} />
            <p className="text-xs text-[#5B544A] leading-relaxed font-semibold">
              Indian passports occasionally feature blank fields. Pearson enforces strict matching rules to prevent name discrepancies on test day:
            </p>
            <div className="bg-[#FFF1B8] border-2 border-[#16130F] p-4.5 rounded-2xl text-[12.5px] text-[#16130F] font-semibold leading-relaxed shadow-[4px_4px_0_#16130F]">
              <AlertTriangle size={14} className="inline-block -mt-0.5 mr-1 text-[#D0362E]" /><strong>Warning:</strong> If your passport has a blank surname field, you must type a full stop (.) in the surname field during registration. Failing to match passport identity details will result in being barred from testing.
            </div>
          </div>
        </div>
      )
    },
    centres: {
      title: "PTE Exam Centres in India: Choosing a Location",
      subtitle: "PTE is conducted in over 62 physical test locations across major cities in India.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            Finding a testing center close to you is essential to minimize travel stress on exam day. Key details to check:
          </p>

          <HookBand value="62+" label="Physical PTE test locations across major cities in India" hi="सेंटर" />

          <div className="space-y-4">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">Physical Test Centers List</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["New Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad", "Kolkata", "Pune", "Ahmedabad", "Chandigarh", "Amritsar", "Ludhiana", "Cochin"].map((city, idx) => (
                <div key={idx} className="border-2 border-[#16130F] p-4 rounded-xl bg-[#FFF6E5] flex flex-col justify-between">
                  <span className="font-extrabold text-[#16130F] text-xs flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#14837E]" />
                    {city}
                  </span>
                  <span className="text-[9px] text-[#8A7F70] font-black mt-1">Authorized Center</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">Test Center Equipment & Environments</h4>
            <p className="text-xs text-[#5B544A] leading-relaxed font-semibold">
              Because the PTE Speaking section requires speaking into a microphone, background noise from other test takers is common.
            </p>
            <div className="p-4 bg-[#FFF6E5] rounded-xl border-2 border-[#16130F] text-[12.5px] text-[#3D362E] space-y-2">
              <p>• <strong>Headsets:</strong> Authorized centers (like Pearson Professional Centers) provide high-quality noise-canceling headsets with built-in microphones to minimize background chatter.</p>
              <p>• <strong>Partitions:</strong> Testing booths have solid partitions, but you should practice speaking clearly without being distracted by your neighbors.</p>
            </div>
          </div>
        </div>
      )
    },
    results: {
      title: "PTE Exam Results 2026: Scores, Scale, and Validity",
      subtitle: "Understand how your scores are calculated, scaled, and verified by universities.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            Most candidates receive their PTE results online within **48 hours (2 business days)**. Let's look at the scorecards and requirements:
          </p>

          <StatStrip
            stats={[
              { value: '2 Years', label: 'Score validity' },
              { value: '10–90', label: 'Scale range (points)' },
              { value: '24–48h', label: 'Average result delivery' }
            ]}
          />

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">1. Country-wise Intake Targets (2026 Intake)</h4>
            <div>
              <BarCompare
                kicker="Postgraduate"
                title="PG score targets by destination"
                highlight="Australia"
                items={[
                  { label: 'Australia', value: 65, display: '65+' },
                  { label: 'Canada', value: 60, display: '60-65+' },
                  { label: 'United States', value: 60, display: '60-70+' },
                  { label: 'United Kingdom', value: 58, display: '58-65' }
                ]}
              />
            </div>
            <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F]">
              <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
                <thead className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F] font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black">Destination</th>
                    <th className="py-3 px-4 text-xs font-black">Undergraduate (UG)</th>
                    <th className="py-3 px-4 text-xs font-black">Postgraduate (PG)</th>
                    <th className="py-3 px-4 text-xs font-black">Visa Benchmark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16130F]/15 text-[#3D362E] font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4 font-bold">Australia</td>
                    <td className="py-3 px-4">50-58</td>
                    <td className="py-3 px-4">65+</td>
                    <td className="py-3 px-4">65 (Competent) / 79 (Superior)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Canada</td>
                    <td className="py-3 px-4">58-60</td>
                    <td className="py-3 px-4">60-65+</td>
                    <td className="py-3 px-4">60+ (SDS Category)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">United Kingdom</td>
                    <td className="py-3 px-4">51-58</td>
                    <td className="py-3 px-4">58-65</td>
                    <td className="py-3 px-4">58 (Degree Level)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">United States</td>
                    <td className="py-3 px-4">54-59</td>
                    <td className="py-3 px-4">60-70+</td>
                    <td className="py-3 px-4">University dependent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">2. Why are my PTE results delayed?</h4>
            <p className="text-xs text-[#5B544A] leading-relaxed font-semibold">
              If your status shows "Taken - Pending" or "On Hold" beyond 48 hours, it is usually due to one of the following factors:
            </p>
            <div className="bg-[#FFF6E5] border-2 border-[#16130F] p-4.5 rounded-2xl text-[12.5px] text-[#5B544A] font-semibold space-y-2 shadow-[4px_4px_0_#16130F]">
              <p>• <strong>AI Quality Audits:</strong> AI flagged your test audio patterns (e.g. extremely rapid speaking or background glitches) for manual human verification review.</p>
              <p>• <strong>Biometric Verification:</strong> A mismatch occurred between your test day palm vein scan or signature and your profile registration.</p>
              <p>• <strong>Significant Score Spike:</strong> If you retook the test and your overall score jumped significantly (e.g., from 50 to 80), a mandatory audit is triggered to check integrity.</p>
            </div>
          </div>
        </div>
      )
    },
    'slot-booking': {
      title: "PTE Slot Booking: Tips & Rescheduling Thresholds",
      subtitle: "Secure your desired date, test center location, and session time without errors.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            Booking slots for PTE Academic requires attention to administrative limits:
          </p>

          <HookBand value="2–3 weeks" label="Book at least this far ahead, especially for weekend time slots" hi="जल्दी" />

          <div className="space-y-4">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">Important Slot Booking Advice</h4>
            <div className="bg-[#FFF6E5] border-2 border-[#16130F] p-4.5 rounded-2xl text-[13px] text-[#3D362E] font-semibold space-y-2 shadow-[4px_4px_0_#16130F]">
              <p>• <strong>Advance booking:</strong> We recommend booking at least **2 to 3 weeks** in advance, especially for weekend time slots.</p>
              <p>• <strong>Payment details:</strong> Make sure your credit or debit card has "International Online Transactions" enabled before booking. Card declines can trigger account blocks.</p>
              <p>• <strong>Duplicate accounts risk:</strong> Do not create a second account if you lose your password. Doing so violates terms and results in cancellations of booked slots.</p>
            </div>
          </div>
        </div>
      )
    },
    preparation: {
      title: "PTE Preparation 2026: Expert Study Guide & Practice Routine",
      subtitle: "Implement structured study calendars and section tips to achieve a GSE score of 79+.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            PTE Academic preparation depends heavily on understanding AI scoring triggers. Review our study schedules:
          </p>

          <HookBand value="79+" label="The GSE score target this study plan is built around" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-[#16130F] rounded-2xl p-4 bg-[#FFF6E5] shadow-[4px_4px_0_#16130F]">
              <strong className="text-[#16130F] block mb-1 text-xs uppercase tracking-wide text-[#14837E]">1-Month Intensive Plan</strong>
              <p className="text-[12.5px] text-[#5B544A] font-semibold leading-relaxed">
                For candidates who are already fluent in English. Focuses on test-taking strategies, time management templates, and taking daily mock tests under timed conditions.
              </p>
            </div>
            <div className="border-2 border-[#16130F] rounded-2xl p-4 bg-[#FFF6E5] shadow-[4px_4px_0_#16130F]">
              <strong className="text-[#16130F] block mb-1 text-xs uppercase tracking-wide text-[#14837E]">3-Month Gradual Plan</strong>
              <p className="text-[12.5px] text-[#5B544A] font-semibold leading-relaxed">
                For candidates who need to build foundational skills. Focuses on gradual vocabulary expansion, academic grammar drills, pronunciation flow, and regular weekly assessments.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">Daily Study Routine Example</h4>
            <StepCounter
              items={[
                { label: 'Morning: Speaking' },
                { label: 'Afternoon: Reading & Writing' },
                { label: 'Evening: Listening' },
                { label: 'Weekend: full mock', highlight: true }
              ]}
            />
            <div className="bg-[#FFF6E5] p-4.5 rounded-xl border-2 border-[#16130F] space-y-2 text-[12.5px] text-[#5B544A] font-semibold">
              <p>• <strong>Morning:</strong> Read academic journal summaries and practice Speaking tasks (Describe Image, Repeat Sentence).</p>
              <p>• <strong>Afternoon:</strong> Work on Reading & Writing tasks (Summarize Written Text, Fill in the Blanks).</p>
              <p>• <strong>Evening:</strong> Take a Listening practice test and review mistake records.</p>
              <p>• <strong>Weekend:</strong> Attempt a full-length 2-hour mock test to build stamina.</p>
            </div>
          </div>
        </div>
      )
    }
  };

  const faqMap = {
    overview: [
      { q: "What is the PTE Academic exam for?", a: "It is a computer-based English proficiency test designed for study abroad admissions and immigration visa routes." },
      { q: "Is the PTE exam easier than IELTS?", a: "PTE is fully computer-delivered and graded by AI, which some find easier than speaking to a human examiner or writing essays by hand." },
      { q: "How much does PTE cost in India?", a: "The PTE Academic fee in India is ₹18,900 including 18% GST (from 16 March 2026). Pearson shows the exact price when you book." }
    ],
    syllabus: [
      { q: "What are the new Speaking & Writing tasks in 2026?", a: "Pearson has introduced two tasks: 'Respond to a Situation' and 'Summarize Group Discussion' which evaluate classroom conversation skills." },
      { q: "Does PTE have negative marking?", a: "Certain task types (like Multiple Choice with Multiple Answers and Highlight Incorrect Words) use negative grading. Points are deducted for incorrect answers." }
    ],
    fees: [
      { q: "How do I avoid late booking surcharges?", a: "Register at least 48 hours prior to your target slot to avoid the ₹695 late surcharge fee." },
      { q: "What is the refund for cancellations?", a: "Cancellations made 14+ days before the test date receive a full refund. Cancellations made 7-14 days in advance receive a 50% partial refund." }
    ],
    dates: [
      { q: "How far in advance should I book my slot?", a: "We suggest booking 2 to 3 weeks early to secure weekend slots at your preferred test center." }
    ],
    registration: [
      { q: "What is the Surname Dot rule?", a: "If your passport has a blank surname field, you must enter a full stop (.) in the surname field during registration to avoid name mismatch errors." },
      { q: "What is the primary ID accepted for Indian candidates?", a: "A valid original physical passport is the only accepted identification. Aadhaar and PAN cards will be rejected at the center." }
    ],
    centres: [
      { q: "Are noise-canceling headsets provided at centers?", a: "Yes, Pearson-authorized test centers provide high-quality headsets to minimize classroom background noise." }
    ],
    results: [
      { q: "How long does it take to get PTE results?", a: "Most candidates receive their official scorecards within 24 to 48 hours of completing the test." },
      { q: "Can I request a score re-evaluation?", a: "Yes, you can request a re-evaluation within 14 days of result release. Only Speaking and Writing sections can be re-evaluated." }
    ],
    'slot-booking': [
      { q: "Can I change my test center after booking a slot?", a: "No, you must reschedule your appointment by paying a rescheduling fee based on your notice timeline buffer." }
    ],
    preparation: [
      { q: "What are the best prep books for PTE?", a: "The Official Guide to PTE Academic (Pearson) and PTE Practice Tests Plus (Pearson) are highly recommended study guides." }
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
    <div className="min-h-screen bg-[#FFF6E5] pb-20 font-['Onest',sans-serif] text-[#16130F]">

      {/* Hero: poster band */}
      <DesiHero
        tone="teal"
        sign={{ hi: 'पीटीई', en: 'PTE DESK' }}
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Exams', to: '/exams/pte' },
          { label: 'PTE' },
          { label: sidebarLinks.find(l => l.key === pageKey)?.name || 'Detail' },
        ]}
        title={activeContent.title}
        subtitle={activeContent.subtitle}
        stickers={<Sticker bg="#FFF6E5" tilt={-2}><Compass size={14} />PTE Exam Suite</Sticker>}
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-10">

        {/* Section picker on phones and tablets */}
        <div className="lg:hidden -mt-6 mb-8 relative z-10">
          <InkCard className="p-3">
            <p className="font-['Rozha_One',serif] text-[14px] text-[#D0362E] leading-none px-1 mb-2">इस हिस्से में</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {sidebarLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive = pageKey === link.key;
                return (
                  <Link
                    key={link.key}
                    to={link.path}
                    style={isActive ? { background: '#14837E', color: '#FFFFFF' } : undefined}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 ${isActive ? 'border-[#16130F] shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
                  >
                    <IconComponent size={13} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </InkCard>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)_230px] xl:grid-cols-[260px_minmax(0,1fr)_280px] gap-8 items-start lg:pt-12">

          {/* Left sticky sidebar menu */}
          <aside className="hidden lg:block sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-1.5 pb-2">
            <InkCard className="p-4">
              <p className="font-['Rozha_One',serif] text-[15px] text-[#D0362E] leading-none">इस हिस्से में</p>
              <p className="mt-1 mb-3 font-urbanist font-black text-[15px] text-[#16130F]">On This Section</p>
              <nav className="flex flex-col gap-1.5">
                {sidebarLinks.map((link) => {
                  const IconComponent = link.icon;
                  const isActive = pageKey === link.key;
                  return (
                    <Link
                      key={link.key}
                      to={link.path}
                      style={isActive ? { background: '#14837E', color: '#FFFFFF' } : undefined}
                      className={`w-full flex items-center justify-between gap-2 py-2 px-3 rounded-lg border-2 text-[12.5px] font-bold leading-normal transition-colors ${isActive ? 'border-[#16130F] shadow-[3px_3px_0_#16130F]' : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
                    >
                      <span className="flex items-center gap-2">
                        <IconComponent size={14} />
                        {link.name}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </InkCard>
          </aside>

          {/* Center main content */}
          <main className="min-w-0 space-y-10">
            <InkCard className="p-5 sm:p-8 md:p-10">
              {activeContent.content}

              {/* Quick action box */}
              <div className="mt-10 p-5 sm:p-6 bg-[#DDF3EF] border-[3px] border-[#16130F] rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 -rotate-[0.4deg]">
                <div>
                  <h4 className="font-urbanist font-black text-[#16130F] text-[17px] mb-1">Preparing for PTE?</h4>
                  <p className="text-[13px] text-[#3D362E] leading-normal font-semibold">Join our expert coaching for full diagnostic mocks and score updates.</p>
                </div>
                <div className="flex items-center justify-start sm:justify-end">
                  <Link
                    to="/book-consultation"
                    className="no-shine px-5 py-3 bg-[#16130F] text-white rounded-full border-2 border-[#16130F] text-[13px] font-bold inline-flex items-center gap-1.5 shadow-[3px_3px_0_#F2B705] transition-transform hover:-translate-y-0.5"
                  >
                    <span>Attend Free Session</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </InkCard>

            {/* Next Up */}
            <section>
              <DesiHeading hi="आगे पढ़ो" className="mb-5">
                <span className="inline-flex items-center gap-2"><Sparkles size={22} className="text-[#D0362E]" />Next Up</span>
              </DesiHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nextUpLinks.map((linkItem, idx) => {
                  const IconComponent = linkItem.icon;
                  const tone = DESI_TONES[idx % DESI_TONES.length];
                  return (
                    <Link
                      key={idx}
                      to={linkItem.path}
                      className="group p-5 bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] transition-transform hover:-translate-y-1 flex items-start justify-between"
                    >
                      <div className="space-y-1">
                        <span className="w-9 h-9 rounded-lg border-2 border-[#16130F] inline-flex items-center justify-center mb-2" style={{ background: tone.c, color: tone.fg }}>
                          <IconComponent size={15} />
                        </span>
                        <h5 className="font-urbanist font-black text-[#16130F] text-[15px] tracking-tight">
                          {linkItem.name}
                        </h5>
                        <p className="text-[12.5px] text-[#D0362E] font-black tracking-wider uppercase inline-flex items-center gap-1 mt-1">
                          Read Now
                          <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Section-wise FAQs */}
            <section>
              <DesiHeading hi="सवाल-जवाब" className="mb-5">
                <span className="inline-flex items-center gap-2"><HelpCircle size={22} className="text-[#D0362E]" />Section-wise FAQs</span>
              </DesiHeading>
              <div className="space-y-3">
                {currentFaqs.map((faq, idx) => {
                  const isOpen = !!openFaq[idx];
                  return (
                    <div key={idx} className="bg-white border-[3px] border-[#16130F] rounded-xl overflow-hidden shadow-[3px_3px_0_#16130F]">
                      <button
                        onClick={() => toggleFaq(idx)}
                        aria-expanded={isOpen}
                        className="no-shine w-full flex items-center justify-between gap-3 p-4 text-left font-bold text-[#16130F] text-[14px] cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <span
                          className="w-7 h-7 shrink-0 rounded-full border-2 border-[#16130F] grid place-items-center transition-colors"
                          style={{ background: isOpen ? '#14837E' : '#FFF6E5', color: isOpen ? '#FFFFFF' : '#16130F' }}
                        >
                          <ChevronRight size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
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
                            <div className="px-4 pb-4 pt-3 text-[#3D362E] text-[13.5px] border-t-2 border-dashed border-[#16130F]/25 leading-relaxed font-medium">
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
          </main>

          {/* Right sidebar widgets */}
          <aside className="lg:sticky lg:top-28 space-y-6">

            {/* Widget: Live Events & Fairs */}
            <div className="p-6 border-[3px] border-[#16130F] rounded-2xl shadow-[5px_5px_0_#16130F] text-white rotate-[0.6deg]" style={{ background: '#D0362E' }}>
              <span className="font-['Rozha_One',serif] text-[15px] leading-none text-[#FCE38A] block">मेला</span>
              <span className="text-[10px] font-black uppercase tracking-widest block mt-1 mb-2 opacity-90">Live Workshops</span>
              <h3 className="font-urbanist text-[20px] font-black leading-snug mb-3">
                Study Abroad Events & Fairs
              </h3>
              <p className="text-[13px] leading-relaxed mb-5 font-medium opacity-90">
                Join live webinars, meet university delegates & attend expert coaching masterclasses.
              </p>
              <Link
                to="/events"
                className="no-shine w-full text-center py-3 bg-white text-[#16130F] rounded-full border-2 border-[#16130F] text-[13px] font-black shadow-[3px_3px_0_#16130F] transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
              >
                <span>Explore Upcoming Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget 2: Contextual Resource (Blogs / AI Tools / Scholarships) */}
            {pageKey === 'overview' ? (
              <InkCard className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#F2B705] border-2 border-[#16130F] text-[#16130F] flex items-center justify-center mx-auto mb-4 -rotate-3">
                  <BookOpen size={22} />
                </div>
                <h4 className="font-urbanist font-black text-[#16130F] text-[16px] mb-2">Study Abroad Blogs & Guides</h4>
                <p className="text-[13px] text-[#5B544A] leading-relaxed mb-5 font-medium">
                  Read insider tips, country comparisons, exam strategies & visa application roadmaps.
                </p>
                <Link
                  to="/blogs"
                  className="no-shine w-full text-center py-3 border-2 border-[#16130F] bg-[#FFF6E5] text-[#16130F] rounded-full text-[13px] font-black hover:bg-[#FCE38A] transition-colors block"
                >
                  Explore All Blogs
                </Link>
              </InkCard>
            ) : pageKey === 'fees' ? (
              <InkCard className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#14837E] border-2 border-[#16130F] text-white flex items-center justify-center mx-auto mb-4 -rotate-3">
                  <Award size={22} />
                </div>
                <h4 className="font-urbanist font-black text-[#16130F] text-[16px] mb-2">Scholarships & Grants</h4>
                <p className="text-[13px] text-[#5B544A] leading-relaxed mb-5 font-medium">
                  Discover government & university scholarships worth up to 100% tuition coverage.
                </p>
                <Link
                  to="/search-programs?highlight=scholarship"
                  className="no-shine w-full text-center py-3 border-2 border-[#16130F] bg-[#FFF6E5] text-[#16130F] rounded-full text-[13px] font-black hover:bg-[#FCE38A] transition-colors block"
                >
                  Find Scholarships
                </Link>
              </InkCard>
            ) : (
              <InkCard className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#B8285B] border-2 border-[#16130F] text-white flex items-center justify-center mx-auto mb-4 -rotate-3">
                  <Sparkles size={22} />
                </div>
                <h4 className="font-urbanist font-black text-[#16130F] text-[16px] mb-2">AI University Matcher</h4>
                <p className="text-[13px] text-[#5B544A] leading-relaxed mb-5 font-medium">
                  Find universities matching your target score, budget & profile with 98% accuracy.
                </p>
                <Link
                  to="/ai-tools"
                  className="no-shine w-full text-center py-3 border-2 border-[#16130F] bg-[#FFF6E5] text-[#16130F] rounded-full text-[13px] font-black hover:bg-[#FCE38A] transition-colors block"
                >
                  Find Best Match
                </Link>
              </InkCard>
            )}

          </aside>

        </div>

        {/* Closing CTA */}
        <div className="mt-16">
          <BookOkCta
            to="/book-consultation"
            text="PTE ka score plan, college shortlist aur visa: ek free call mein sab clear. 1:1, ek ghante ki baat."
          />
        </div>
      </div>
    </div>
  );
};

export default PTEDetailPage;
