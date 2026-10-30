import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  Compass,
  ArrowRight,
  Award,
  ChevronRight,
  AlertTriangle,
  FileEdit,
  CheckCircle2,
  HelpCircle,
  BookMarked,
  ListTodo,
  Sparkles,
  Info,
  Lightbulb
} from 'lucide-react';
import { HookBand, StatStrip, BarCompare, TimelineStrip, Donut, VersusCard } from '../../../components/ui/Infographics';
import { StepCounter } from '../../../components/ui/BrandElements';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

const GMATDetailPage = ({ pageKey }) => {
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const sidebarLinks = [
    { name: 'GMAT Overview', path: '/exams/gmat/overview', key: 'overview', icon: Compass },
    { name: 'GMAT Syllabus', path: '/exams/gmat/syllabus', key: 'syllabus', icon: BookOpen },
    { name: 'GMAT Exam Fees', path: '/exams/gmat/fees', key: 'fees', icon: DollarSign },
    { name: 'GMAT Exam Dates', path: '/exams/gmat/dates', key: 'dates', icon: Calendar },
    { name: 'GMAT Registration', path: '/exams/gmat/registration', key: 'registration', icon: FileEdit },
    { name: 'GMAT Results', path: '/exams/gmat/results', key: 'results', icon: Award },
    { name: 'GMAT Preparation', path: '/exams/gmat/preparation', key: 'preparation', icon: ListTodo },
    { name: 'GMAT Sample Papers', path: '/exams/gmat/sample-papers', key: 'sample-papers', icon: FileText }
  ];

  // Rich contents dictionary for GMAT tabs
  const contentMap = {
    overview: {
      title: "GMAT Exam for Indian Students: A Complete Guide",
      subtitle: "The Graduate Management Admission Test (GMAT) Focus Edition is a computer-adaptive exam tailored for global business school admissions.",
      content: (
        <div className="space-y-6">
          <div className="bg-[#FFF1B8] border-2 border-[#16130F] p-5 rounded-2xl flex items-start gap-3.5 shadow-[4px_4px_0_#16130F]">
            <Info className="text-[#DE5C2B] w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-[#16130F] text-xs uppercase tracking-wider mb-1">GMAT Focus Edition Update</h4>
              <p className="text-xs text-[#16130F] leading-relaxed font-semibold">
                GMAC has announced a shorter GMAT called GMAT Focus Edition. The old format (3 hour long test) is now discontinued. The new GMAT test is only 2 hours and 15 minutes long, features no analytical writing (AWA) section, and has introduced a new Data Insights section. The name "GMAT Focus Edition" has been reverted back to "GMAT Exam" now that there is only one edition in play.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-urbanist text-lg font-black text-[#16130F] flex items-center gap-2">
              <span className="w-1 h-5 bg-[#B8285B] rounded-full inline-block" />
              1. What is the GMAT Exam?
            </h3>
            <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
              GMAT, or Graduate Management Admission Test, is a computer-adaptive test owned and operated by the Graduate Management Admission Council (GMAC).
            </p>
            <StatStrip
              stats={[
                { value: '2h 15m', label: 'Exam length, plus an optional 10-minute break' },
                { value: '3', label: 'Sections: Quant, Verbal, Data Insights' },
                { value: '18+', label: 'Minimum age, no upper limit' },
                { value: '16 days', label: 'Wait before a retake' }
              ]}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 my-6">
              {[
                { title: "Duration", desc: "2 hours and 15 minutes long (with one optional 10-minute break)." },
                { title: "Tested Skills", desc: "Evaluates three core skills: Quantitative Reasoning, Verbal Reasoning, and Data Insights." },
                { title: "Modes of Delivery", desc: "Offered in two modes: online (at home) and offline (at test centres)." },
                { title: "Exam Type", desc: "Computer-adaptive test: adjusts question difficulty based on your performance." }
              ].map((item, idx) => (
                <div key={idx} className="border-2 border-[#16130F] p-4.5 rounded-2xl bg-[#FFF6E5] hover:bg-[#FFF6E5] transition-colors shadow-[4px_4px_0_#16130F]">
                  <h4 className="font-black text-[#16130F] text-xs mb-1 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#B8285B]" />
                    {item.title}
                  </h4>
                  <p className="text-[12.5px] text-[#5B544A] font-semibold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h3 className="font-urbanist text-lg font-black text-[#16130F] flex items-center gap-2">
              <span className="w-1 h-5 bg-[#B8285B] rounded-full inline-block" />
              Why Take the GMAT Exam?
            </h3>
            <div className="space-y-3">
              {[
                { title: "Popular B-School Entrance", desc: "GMAT is among the most popular entrance exams globally for management courses such as MBA and Master's in Management." },
                { title: "Top Global Credentials", desc: "A good GMAT score helps candidates stand out and gain admission to highly reputable business schools worldwide." },
                { title: "Academic Readiness", desc: "The exam provides universities a clear, standardized benchmark showing whether you are prepared for high-intensity graduate coursework." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 p-4 rounded-xl border-2 border-[#16130F] bg-[#FBD9E6]">
                  <div className="w-6 h-6 rounded-full bg-[#FBD9E6] text-[#B8285B] flex items-center justify-center flex-shrink-0 text-xs font-black">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-[#16130F] text-xs mb-0.5">{item.title}</h5>
                    <p className="text-[12.5px] text-[#5B544A] font-semibold leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h3 className="font-urbanist text-lg font-black text-[#16130F] flex items-center gap-2">
              <span className="w-1 h-5 bg-[#B8285B] rounded-full inline-block" />
              2. GMAT Eligibility & Documents Required
            </h3>
            <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
              If you wish to appear for the GMAT exam, you must be at least 18 years old. There is no upper limit when it comes to age. GMAC has not set any other academic eligibility requirements, but individual business schools have their own admission benchmarks.
            </p>
            <div className="bg-[#FFF6E5] border-2 border-[#16130F] p-4.5 rounded-2xl text-[12.5px] text-[#5B544A] font-semibold leading-relaxed space-y-2 shadow-[4px_4px_0_#16130F]">
              <p>• <strong>Work Experience:</strong> Typically, GMAT test takers are undergraduate students or professionals with 2+ years of work experience.</p>
              <p>• <strong>Primary Document:</strong> A valid passport is mandatory for identification on test day for Indian candidates, regardless of whether you take the test online or at a test centre.</p>
              <p>• <strong>Score Requirements:</strong> We recommend verifying the specific GMAT scores and document requirements on your target universities' program pages.</p>
            </div>
          </div>
        </div>
      )
    },
    syllabus: {
      title: "GMAT Exam Syllabus and Pattern: Section-wise GMAT Format",
      subtitle: "The streamlined GMAT Focus Edition contains 3 core modules covering 50 sub-topics over a 2 hours and 15 minutes limit.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            The new GMAT structure deals strictly with business readiness. The analytical writing (AWA) has been completely removed.
          </p>

          <HookBand value="205–805" label="Total GMAT score range. Every Focus score ends in 5" hi="Score" />

          <div>
            <Donut
              kicker="45 minutes each"
              title="Questions per GMAT section"
              segments={[
                { label: 'Verbal Reasoning', value: 23, display: '23 Qs' },
                { label: 'Quantitative Reasoning', value: 21, display: '21 Qs' },
                { label: 'Data Insights', value: 20, display: '20 Qs' }
              ]}
              centerValue="64"
              centerLabel="questions"
            />
          </div>

          <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] my-6">
            <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
              <thead className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F] font-bold uppercase">
                <tr>
                  <th className="py-3 px-4 text-xs font-black">Section</th>
                  <th className="py-3 px-4 text-xs font-black">Duration</th>
                  <th className="py-3 px-4 text-xs font-black">Questions</th>
                  <th className="py-3 px-4 text-xs font-black">Format Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16130F]/15 text-[#3D362E] font-semibold text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Verbal Reasoning</td>
                  <td className="py-3.5 px-4">45 Minutes</td>
                  <td className="py-3.5 px-4">23 Questions</td>
                  <td className="py-3.5 px-4 text-[#5B544A]">Reading Comprehension & Critical Reasoning. Sentence Correction removed.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Quantitative Reasoning</td>
                  <td className="py-3.5 px-4">45 Minutes</td>
                  <td className="py-3.5 px-4">21 Questions</td>
                  <td className="py-3.5 px-4 text-[#5B544A]">Problem-Solving parts. Algebra & Arithmetic. No geometry, no calculator.</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#16130F]">Data Insights</td>
                  <td className="py-3.5 px-4">45 Minutes</td>
                  <td className="py-3.5 px-4">20 Questions</td>
                  <td className="py-3.5 px-4 text-[#5B544A]">Multi-Source, Table Analysis, Graphics, Data Sufficiency. Calculator allowed.</td>
                </tr>
                <tr className="bg-[#FBD9E6] font-bold">
                  <td className="py-3.5 px-4 text-[#16130F]">Total Exam</td>
                  <td className="py-3.5 px-4 text-[#B8285B]">2 Hours 15 Mins</td>
                  <td className="py-3.5 px-4">64 Questions</td>
                  <td className="py-3.5 px-4">Score Range: 205 - 805 (Ends in 5)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-5 pt-4">
            <h3 className="font-urbanist text-lg font-black text-[#16130F] flex items-center gap-2">
              <span className="w-1 h-5 bg-[#B8285B] rounded-full inline-block" />
              Section-wise Details
            </h3>

            {/* Quant */}
            <div className="p-5 border-2 border-[#16130F] rounded-2xl bg-[#FFF6E5] space-y-3 shadow-[4px_4px_0_#16130F]">
              <h4 className="font-extrabold text-xs text-[#B8285B] uppercase tracking-wide">1. Quantitative Reasoning (Math)</h4>
              <p className="text-[12.5px] text-[#3D362E] font-semibold leading-relaxed">
                Measures foundational knowledge of algebraic and arithmetic concepts. Since geometry has been removed, the math section tests:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-[#5B544A]">
                {["Arithmetic", "Algebra", "Probability", "Permutations & Combinations", "Ratio & Proportion", "Simple & Compound Interest", "Speed, Time & Distance", "Percentage & Average", "Number Properties", "Exponents & Functions", "Fractions & Decimals"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border-2 border-[#16130F] p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-[#B8285B] rounded-full flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Verbal */}
            <div className="p-5 border-2 border-[#16130F] rounded-2xl bg-[#FFF6E5] space-y-3 shadow-[4px_4px_0_#16130F]">
              <h4 className="font-extrabold text-xs text-[#B8285B] uppercase tracking-wide">2. Verbal Reasoning</h4>
              <p className="text-[12.5px] text-[#3D362E] font-semibold leading-relaxed">
                Evaluates your ability to read and understand written materials, parse arguments, and evaluate logical flaws.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-[#5B544A]">
                {["Critical Reasoning", "Reading Unseen Passages", "Subject-Verb Agreement", "Parallelism", "Misplaced Modifiers", "Logical Connections"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border-2 border-[#16130F] p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-[#B8285B] rounded-full flex-shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Data Insights */}
            <div className="p-5 border-2 border-[#16130F] rounded-2xl bg-[#FFF6E5] space-y-3 shadow-[4px_4px_0_#16130F]">
              <h4 className="font-extrabold text-xs text-[#B8285B] uppercase tracking-wide">3. Data Insights</h4>
              <p className="text-[12.5px] text-[#3D362E] font-semibold leading-relaxed">
                Tests your ability to analyze data, read tables/graphs/charts, and apply mathematical logic to real-time business decision scenarios.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold text-[#5B544A]">
                {["Data Sufficiency", "Graphics Interpretation", "Table Analysis", "Two-part Analysis", "Multi-source Reasoning", "Information Synthesis"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 bg-white border-2 border-[#16130F] p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-[#B8285B] rounded-full flex-shrink-0" />
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
      title: "GMAT Exam Fees in India: Cancellation, Rescheduling Fees",
      subtitle: "Full pricing breakdown of standard fees, rescheduling brackets, and cancellation refunds in India.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            The fee structure varies based on whether you book GMAT as a test center exam or an online exam. Check below for standard and cancellation brackets:
          </p>

          <div>
            <BarCompare
              kicker="Exam fee"
              title="What GMAT costs (USD)"
              highlight="Online (at home)"
              items={[
                { label: 'Online (at home)', value: 300, display: '$300' },
                { label: 'Test centre', value: 275, display: '$275' },
                { label: 'Extra score report', value: 35, display: '$35 each' }
              ]}
            />
          </div>

          <div className="space-y-2">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">1. Base GMAT Exam Fee Breakdown</h4>
            <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F]">
              <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
                <thead className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F] font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black">Service</th>
                    <th className="py-3 px-4 text-xs font-black">Delivered at Test Center</th>
                    <th className="py-3 px-4 text-xs font-black">Delivered Online (At Home)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16130F]/15 text-[#3D362E] font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#16130F]">GMAT Focus Edition Fee</td>
                    <td className="py-3 px-4">US$275 (~INR 22,953)</td>
                    <td className="py-3 px-4">US$300 (~INR 25,040)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#16130F]">Additional Score Report</td>
                    <td className="py-3 px-4">US$35 each (~INR 2,900)</td>
                    <td className="py-3 px-4">US$35 each (~INR 2,900)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-[#8A7F70] font-bold italic mt-1">* Note: Conversion rates vary over time based on forex valuations.</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">2. Rescheduling & Cancellation Tariffs</h4>
            <p className="text-xs text-[#5B544A] font-semibold leading-relaxed">
              If you cancel or reschedule too close to the exam appointment, you will receive a smaller refund and pay a higher service fee.
            </p>

            <div>
              <TimelineStrip
                kicker="Test centre · notice period"
                title="Reschedule fee vs cancellation refund"
                steps={[
                  { when: '> 60 days', what: 'Reschedule USD 55', note: 'Cancel: USD 110 back', highlight: true },
                  { when: '15 to 60 days', what: 'Reschedule USD 110', note: 'Cancel: USD 80 back' },
                  { when: '14 days or less', what: 'Reschedule USD 165', note: 'Cancel: USD 55 back' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reschedule */}
              <div className="border-2 border-[#16130F] rounded-2xl p-4 bg-[#FFF6E5] shadow-[4px_4px_0_#16130F]">
                <h5 className="font-black text-xs text-[#B8285B] mb-3 uppercase tracking-wider">Rescheduling Charges</h5>
                <ul className="space-y-2.5 text-[12.5px] font-bold text-[#3D362E]">
                  <li className="flex justify-between border-b border-[#16130F]/15 pb-1.5">
                    <span>&gt; 60 Days Notice</span>
                    <span className="text-[#B8285B]">USD 55 (Center) / USD 60 (Online)</span>
                  </li>
                  <li className="flex justify-between border-b border-[#16130F]/15 pb-1.5">
                    <span>15 to 60 Days Notice</span>
                    <span className="text-[#B8285B]">USD 110 (Center) / USD 120 (Online)</span>
                  </li>
                  <li className="flex justify-between">
                    <span>14 Days or Less</span>
                    <span className="text-[#B8285B]">USD 165 (Center) / USD 180 (Online)</span>
                  </li>
                </ul>
              </div>

              {/* Cancellation */}
              <div className="border-2 border-[#16130F] rounded-2xl p-4 bg-[#FFF6E5] shadow-[4px_4px_0_#16130F]">
                <h5 className="font-black text-xs text-[#D0362E] mb-3 uppercase tracking-wider">Cancellation Refunds</h5>
                <ul className="space-y-2.5 text-[12.5px] font-bold text-[#3D362E]">
                  <li className="flex justify-between border-b border-[#16130F]/15 pb-1.5">
                    <span>&gt; 60 Days Notice</span>
                    <span className="text-[#14837E]">USD 110 (Center) / USD 120 (Online) Refund</span>
                  </li>
                  <li className="flex justify-between border-b border-[#16130F]/15 pb-1.5">
                    <span>15 to 60 Days Notice</span>
                    <span className="text-[#14837E]">USD 80 (Center) / USD 90 (Online) Refund</span>
                  </li>
                  <li className="flex justify-between">
                    <span>14 Days or Less</span>
                    <span className="text-[#14837E]">USD 55 (Center) / USD 60 (Online) Refund</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-[#FFF1B8] border-2 border-[#16130F] p-4.5 rounded-2xl text-[12.5px] text-[#16130F] font-semibold leading-relaxed flex gap-2 shadow-[4px_4px_0_#16130F]">
              <AlertTriangle className="w-4 h-4 text-[#16130F] flex-shrink-0 mt-0.5" />
              <span>
                <strong>Critical:</strong> If you cancel your exam when there are less than 24 hours to go, none of your fee amount will be refunded and rescheduling is prohibited.
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#16130F]/15 text-xs text-[#5B544A] font-semibold">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">3. Modes of Payment</h4>
            <p>You can use credit or debit cards to complete GMAT fee payments on MBA.com. Please remember:</p>
            <div className="bg-[#FFF6E5] p-4.5 rounded-xl border-2 border-[#16130F] space-y-2 text-[12.5px]">
              <p>• Accepted card types include <strong>VISA, Mastercard, American Express, and Discover</strong> Network Cards.</p>
              <p>• Appointments are automatically cancelled if your credit or debit card is declined.</p>
              <p>• Using an unauthorized card will result in GMAT registration cancellation, invalidation of previous scores, and potential notifications to schools and law enforcement.</p>
            </div>
          </div>
        </div>
      )
    },
    dates: {
      title: "GMAT Exam Dates and Test Centres: City-wise List 2025",
      subtitle: "GMAT does not have a single fixed date list. Slots are available throughout the year at various test locations.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            The online GMAT exam is open daily, 24 hours a day, providing ultimate scheduling flexibility. Physical test center slots depend entirely on local center calendars.
          </p>
          <StatStrip
            stats={[
              { value: '24/7', label: 'Online GMAT open every day' },
              { value: '2–3 mo', label: 'Book this far ahead for your preferred slot' },
              { value: '5 years', label: 'Score validity' }
            ]}
          />

          <div className="space-y-4">
            <h3 className="font-urbanist text-lg font-black text-[#16130F] flex items-center gap-2">
              <span className="w-1 h-5 bg-[#B8285B] rounded-full inline-block" />
              GMAT Test Center Cities in India
            </h3>
            <p className="text-xs text-[#5B544A] font-semibold leading-relaxed">
              India has numerous GMAT test centres spread across major cities. Choosing a center near you helps avoid travel fatigue on exam day:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {[
                { name: "Bangalore", region: "South" },
                { name: "Mumbai", region: "West" },
                { name: "Delhi NCR", region: "North" },
                { name: "Kolkata", region: "East" },
                { name: "Hyderabad", region: "South" },
                { name: "Pune", region: "West" },
                { name: "Bhubaneswar", region: "East" },
                { name: "Kerala (Kochi)", region: "South" },
                { name: "Jaipur", region: "West/North" },
                { name: "Noida", region: "North" }
              ].map((city, idx) => (
                <div key={idx} className="border-2 border-[#16130F] p-4 rounded-2xl bg-[#FFF6E5] flex flex-col justify-between hover:border-[#16130F] transition-colors shadow-[4px_4px_0_#16130F]">
                  <span className="font-extrabold text-[#16130F] text-xs flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#B8285B]" />
                    {city.name}
                  </span>
                  <span className="text-[9px] text-[#8A7F70] uppercase tracking-widest font-black mt-1.5 block">{city.region} Zone</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FBD9E6] p-4.5 rounded-2xl border-2 border-[#16130F] text-[12.5px] text-[#16130F] font-semibold leading-relaxed shadow-[4px_4px_0_#16130F]">
            <Lightbulb size={14} className="inline-block -mt-0.5 mr-1 text-[#D0362E]" /><strong>Pro Prep Tip:</strong> We recommend booking at least two to three months in advance to secure your desired time, date, and preferred center. GMAT scores are valid for 5 years, so writing it early keeps you safe.
          </div>
        </div>
      )
    },
    registration: {
      title: "GMAT Registration: How to Register for GMAT?",
      subtitle: "GMAT registration is a clean, 10-step online process. Learn how to sign up, select slots, and submit accommodation requests.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            You can register for the GMAT starting 6 months before your target test date and up to 24 hours prior to a slot. Early booking is highly recommended.
          </p>

          <HookBand value="6 months" label="Earliest you can register before your test date. The latest is 24 hours before" hi="Jaldi" />

          <div className="space-y-3">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">10-Step GMAT Registration Process</h4>
            <StepCounter
              items={[
                { label: 'MBA.com account' },
                { label: 'Match passport' },
                { label: 'Online or centre' },
                { label: 'Up to 3 centres' },
                { label: 'Date & slot' },
                { label: 'Accommodations' },
                { label: 'Review rules' },
                { label: 'Pay by card', highlight: true },
                { label: 'Confirmation email' },
                { label: 'Prepare' }
              ]}
            />
            <div className="space-y-2 text-[12.5px] font-bold text-[#5B544A]">
              {[
                "1. Create your account by visiting the official GMAT website (MBA.com) and logging in.",
                "2. Complete your profile details precisely matching the spelling in your valid passport.",
                "3. Select either Online or Test Center mode of delivery.",
                "4. Select up to 3 test center locations closest to you to compare availability.",
                "5. Choose your target date and available daily time slot.",
                "6. Select optional details like scheduling accommodations if applicable.",
                "7. Review registration details and test rules checklist.",
                "8. Complete registration payments using international debit/credit cards.",
                "9. Confirm receipt of your proctor booking confirmation email.",
                "10. Focus on your GMAT preparation and print confirmation logs for test day."
              ].map((step, idx) => (
                <div key={idx} className="p-3 bg-[#FFF6E5] rounded-xl border-2 border-[#16130F]">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">Differently Abled Test Taker Accommodations</h4>
            <p className="text-xs text-[#5B544A] leading-relaxed font-semibold">
              The GMAT offers custom testing setups to support differently-abled candidates, ensuring a fair and equitable testing environment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12.5px] text-[#3D362E] font-semibold leading-relaxed">
              <div className="border-2 border-[#16130F] rounded-2xl p-4 bg-[#FFF6E5] shadow-[4px_4px_0_#16130F]">
                <span className="font-extrabold text-[#16130F] text-xs block mb-1">Accommodation Request</span>
                Options include extended testing time, screen reader software support, sign language proctors, and auxiliary equipment. Submit this request during initial sign-up.
              </div>
              <div className="border-2 border-[#16130F] rounded-2xl p-4 bg-[#FFF6E5] shadow-[4px_4px_0_#16130F]">
                <span className="font-extrabold text-[#16130F] text-xs block mb-1">Documentation Verification</span>
                You will be requested to submit official medical diagnosis logs validating your condition. GMAC maintains strict privacy and reviews reports within 3-4 weeks.
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">How to Choose GMAT Exam Centers?</h4>
            <div className="bg-[#FFF6E5] border-2 border-[#16130F] p-4.5 rounded-2xl text-[12.5px] text-[#5B544A] font-semibold leading-relaxed space-y-2 shadow-[4px_4px_0_#16130F]">
              <p>• <strong>Location:</strong> Choose a center with minimal travel time to reduce test-day stress.</p>
              <p>• <strong>Facilities:</strong> Look for centers with silent rooms, comfortable workstations, and solid ventilation.</p>
              <p>• <strong>Reviews:</strong> Research logs and feedback from other candidates regarding check-in speed and staff behavior.</p>
            </div>
          </div>
        </div>
      )
    },
    results: {
      title: "GMAT Exam Result: Score Check, Scale & Free Score Reports",
      subtitle: "Learn how GMAT Focus score scales are structured, when results are sent, and how score reporting works.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            The GMAT exam score report highlights individual performances on a standardized scale. Focus edition results are released extremely quickly.
          </p>

          <StatStrip
            stats={[
              { value: '5 Years', label: 'Score validity' },
              { value: '205–805', label: 'Score scale' },
              { value: '3-5 Days', label: 'Delivery time' },
              { value: '5 free', label: 'Score reports to universities' }
            ]}
          />

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">1. GMAT Focus Score Scales</h4>
            <p className="text-xs text-[#5B544A] font-semibold leading-relaxed">
              Unlike the classic GMAT, the new score scale ranges from 205 to 805. All focus scores end in 5 to separate them from the older version. Section scores are calculated in intervals of 1 point.
            </p>
            <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] my-3">
              <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
                <thead className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F] font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black">GMAT Section</th>
                    <th className="py-3 px-4 text-xs font-black">Score Range</th>
                    <th className="py-3 px-4 text-xs font-black">Interval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16130F]/15 text-[#3D362E] font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4">Verbal Reasoning</td>
                    <td className="py-3 px-4">60 to 90</td>
                    <td className="py-3 px-4">1 point</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Quantitative Reasoning</td>
                    <td className="py-3 px-4">60 to 90</td>
                    <td className="py-3 px-4">1 point</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Data Insights</td>
                    <td className="py-3 px-4">60 to 90</td>
                    <td className="py-3 px-4">1 point</td>
                  </tr>
                  <tr className="bg-[#FBD9E6] font-bold">
                    <td className="py-3 px-4 text-[#16130F]">Total Score</td>
                    <td className="py-3 px-4 text-[#B8285B]">205 to 805</td>
                    <td className="py-3 px-4">10 points</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-[#FFF1B8] border-2 border-[#16130F] p-4 rounded-2xl text-[12.5px] text-[#16130F] font-semibold leading-relaxed shadow-[4px_4px_0_#16130F]">
              <AlertTriangle size={14} className="inline-block -mt-0.5 mr-1 text-[#D0362E]" /><strong>Penalty Rule:</strong> The new GMAT penalizes unanswered questions. It is essential to complete all sections of the exam, rather than leaving any answer box incomplete.
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">2. Sending Reports to B-Schools</h4>
            <p className="text-xs text-[#5B544A] font-semibold leading-relaxed">
              Your exam fee includes sending scores to up to <strong>5 universities free of charge</strong>. The process differs based on delivery format:
            </p>
            <div>
              <VersusCard
                kicker="Free score reports"
                title="When you pick your 5 schools"
                left={{ title: 'Online Exam', tag: '48 hours', points: ['Email notification once your score report is ready', 'Then 48 hours to select receivers for free'] }}
                right={{ title: 'Test Center', tag: 'Before you start', points: ['Select the 5 universities before you start the exam', 'Done on the workstation terminal'] }}
              />
            </div>
          </div>
        </div>
      )
    },
    preparation: {
      title: "GMAT Exam Preparation: Section-wise Tips",
      subtitle: "Unlock score-maximizing strategies for Quantitative, Verbal, and Data Insights sections.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            The GMAT tests analytics rather than memory. With dedicated study of 3 to 4 months, a high percentile is highly attainable. Explore the section-wise strategy cards:
          </p>

          <HookBand value="3–4 months" label="Dedicated study that makes a high GMAT percentile attainable" hi="Taiyari" />

          <div className="space-y-5">
            {/* Verbal */}
            <div className="border-2 border-[#16130F] rounded-2xl p-5 bg-[#FFF6E5] space-y-2.5 shadow-[4px_4px_0_#16130F]">
              <h4 className="font-black text-xs text-[#B8285B] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} />
                1. Verbal Reasoning Tips
              </h4>
              <p className="text-[12.5px] text-[#3D362E] font-semibold leading-relaxed">
                This section checks your reading comprehension and ability to evaluate structures of logic.
              </p>
              <ul className="list-disc list-inside text-[13px] text-[#5B544A] space-y-1 leading-relaxed font-semibold pl-1">
                <li>Work on your Reading Comprehension: Annotate key details, summarize paragraphs in your own words, and visualize complex passages.</li>
                <li>Critical Reasoning: Identify argument premises, conclusions, and evaluate evidence validity.</li>
                <li>Process of Elimination: Eliminate wrong choices first when multiple-choice options look similar.</li>
              </ul>
            </div>

            {/* Quant */}
            <div className="border-2 border-[#16130F] rounded-2xl p-5 bg-[#FFF6E5] space-y-2.5 shadow-[4px_4px_0_#16130F]">
              <h4 className="font-black text-xs text-[#B8285B] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} />
                2. Quantitative Reasoning Tips
              </h4>
              <p className="text-[12.5px] text-[#3D362E] font-semibold leading-relaxed">
                Focuses entirely on high school algebra and arithmetic concepts.
              </p>
              <ul className="list-disc list-inside text-[13px] text-[#5B544A] space-y-1 leading-relaxed font-semibold pl-1">
                <li>Solve, Don't Read: Quantitative math is built by writing out solutions, not reading guides.</li>
                <li>Data Sufficiency Focus: Master the specific format rules to avoid calculating the full solution.</li>
                <li>Improve Speed: Practice mental math shortcuts, and make an educated guess rather than getting stuck.</li>
              </ul>
            </div>

            {/* Data Insights */}
            <div className="border-2 border-[#16130F] rounded-2xl p-5 bg-[#FFF6E5] space-y-2.5 shadow-[4px_4px_0_#16130F]">
              <h4 className="font-black text-xs text-[#B8285B] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} />
                3. Data Insights Tips
              </h4>
              <p className="text-[12.5px] text-[#3D362E] font-semibold leading-relaxed">
                Focuses on reading and parsing charts, tables, scatter plots, and graphs.
              </p>
              <ul className="list-disc list-inside text-[13px] text-[#5B544A] space-y-1 leading-relaxed font-semibold pl-1">
                <li>Understand Data Formats: Practice reading multi-source case structures, bubble charts, and tables.</li>
                <li>Focus on Details: Pay absolute attention to titles, axis labels, units of measure, and outliers.</li>
                <li>Relationship Mapping: Spot trends, correlations, and determine dependencies between parameters.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    'sample-papers': {
      title: "GMAT Practice Tests: Boost your Preparation!",
      subtitle: "Mock exams and practice papers are the most reliable way to benchmark your target scores.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            Using high-quality practice papers lets you adapt to the adaptive format, get used to the timing constraints, and track your metrics.
          </p>
          <StatStrip
            stats={[
              { value: '800+', label: 'Real past questions in the Official Guide' },
              { value: '6', label: 'Practice exams in Kaplan Prep Plus' },
              { value: '300', label: 'Hardest past questions (Official Advanced)' },
              { value: '2 free', label: 'Full-length adaptive tests on MBA.com' }
            ]}
          />

          <div className="bg-[#FBD9E6] rounded-2xl p-5 border-2 border-[#16130F] space-y-3 shadow-[4px_4px_0_#16130F]">
            <h4 className="font-black text-[#16130F] text-xs">Top 5 GMAT Books for Preparation</h4>
            <p className="text-[13px] text-[#5B544A] leading-relaxed font-semibold">
              The following reference strategy guides represent the best guides for candidates seeking 655+ scores:
            </p>
            <div className="space-y-2">
              {[
                { title: "1. GMAT Official Guide (GMAC)", desc: "Contains 800+ real past GMAT questions and explanation keys directly from the makers." },
                { title: "2. Manhattan Prep Strategy Guides", desc: "Advanced conceptual books detailing algebra hacks and verbal logic structures." },
                { title: "3. Kaplan GMAT Prep Plus", desc: "Includes 6 comprehensive practice exams, study calendars, and diagnostic dashboards." },
                { title: "4. Veritas Prep GMAT Course Set", desc: "Focuses on analytical reasoning and advanced multi-source data insights tips." },
                { title: "5. GMAT Official Advanced Questions", desc: "Features the 300 hardest past questions to push score percentiles above 90%." }
              ].map((book, idx) => (
                <div key={idx} className="bg-white border-2 border-[#16130F] p-3.5 rounded-xl">
                  <span className="font-extrabold text-xs text-[#16130F] block mb-0.5">{book.title}</span>
                  <span className="text-[12.5px] text-[#8A7F70] font-bold block">{book.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FFF6E5] border-2 border-[#16130F] p-4.5 rounded-2xl text-[13px] text-[#3D362E] font-semibold leading-relaxed shadow-[4px_4px_0_#16130F]">
            <Lightbulb size={14} className="inline-block -mt-0.5 mr-1 text-[#D0362E]" /><strong>Official Resources:</strong> We highly recommend utilizing the official GMAT Focus mock starter kit on <strong>MBA.com</strong>. It includes 2 free full-length adaptive practice tests utilizing standard GMAT algorithms.
          </div>
        </div>
      )
    }
  };

  const faqMap = {
    overview: [
      { q: "Is GMAT difficult?", a: "The GMAT is computer-adaptive, meaning questions adjust to your level. It is challenging because it tests logical analytics rather than simple recall. However, structured prep of 2-3 months is sufficient." },
      { q: "How long is the GMAT exam?", a: "The new GMAT Focus Edition lasts exactly 2 hours and 15 minutes plus an optional 10-minute break. This is a significant reduction from the old 3 hour format." },
      { q: "How soon can I retake the GMAT exam?", a: "You can retake the GMAT exam 16 days after your previous attempt. You can take the exam up to 5 times in a rolling 12-month period and 8 times in total." },
      { q: "Can I use a calculator during the GMAT exam?", a: "Calculators are strictly prohibited during the Quantitative Reasoning section. However, an on-screen calculator is provided during the Data Insights section." },
      { q: "Are there accommodations for GMAT test-takers with disabilities?", a: "Yes, GMAC offers special accommodations (extended time, screen reader compatibility, etc.) for differently-abled test takers. Requests must be submitted during registration with supporting medical documentation." }
    ],
    syllabus: [
      { q: "What is the GMAT Focus syllabus scope?", a: "The syllabus has 3 sections: Verbal Reasoning (Critical Reasoning & RC), Quantitative Reasoning (Arithmetic & Algebra), and Data Insights (Data Sufficiency, Tables, Graphics, Multi-source). Geometry and Sentence Correction are completely removed." },
      { q: "Does GMAT have negative marking?", a: "No, there is no direct negative marking, but GMAT penalizes unanswered questions. It is always better to make an educated guess than to leave a question blank." },
      { q: "Can I choose the section order in GMAT?", a: "Yes, you can choose which section (Quant, Verbal, or Data Insights) to begin with. This helps you maximize performance by tackling your strengths first." }
    ],
    fees: [
      { q: "Who is eligible for GMAT?", a: "Candidates must be at least 18 years old. Those aged 13-17 can take it with parental consent. There are no other strict educational or professional prerequisites." },
      { q: "Do I have to pay each time I take the GMAT?", a: "Yes, you must pay the full registration fee for each GMAT attempt." },
      { q: "Can I get a refund if I cancel my GMAT exam?", a: "Yes, you can receive a partial refund depending on how early you cancel. Notice of more than 60 days gives a maximum refund (USD 110-120). Cancellations less than 24 hours in advance receive no refund." }
    ],
    dates: [
      { q: "How are GMAT dates scheduled?", a: "For physical test centers, dates are available on most days of the week, but vary depending on center slots. For the online exam, dates are available daily around the clock." },
      { q: "How far in advance should I book my GMAT slot?", a: "We recommend booking at least 2 to 3 months in advance to lock in your preferred date, time slot, and physical test center location." }
    ],
    registration: [
      { q: "Can I change my test center after registering?", a: "Yes, but you will need to reschedule your appointment and pay the applicable rescheduling fee based on your notice period." },
      { q: "What documents do I need for GMAT registration?", a: "A valid passport is mandatory for identification for Indian candidates. The spelling of your name must match your passport exactly." }
    ],
    results: [
      { q: "How is the GMAT Focus score calculated?", a: "Scores range from 205 to 805. The three sections (Quant, Verbal, Data Insights) are scored from 60 to 90 and weighted equally in calculating your total score." },
      { q: "How long is a GMAT score valid?", a: "GMAT scores are valid for 5 years from your test date." },
      { q: "How do I send my GMAT scores to universities?", a: "You can send scores to up to 5 business schools free of charge. For test center exams, select them before starting. For online exams, select them within 48 hours of score availability." }
    ],
    preparation: [
      { q: "What is the best way to start GMAT preparation?", a: "Start by taking an official diagnostic practice test on MBA.com to evaluate your baseline score. Focus on reviewing basic arithmetic and algebra, followed by structured daily verbal practice." },
      { q: "How many hours should I study for GMAT?", a: "Most successful test takers study between 100 and 120 hours over a span of 2 to 3 months." }
    ],
    'sample-papers': [
      { q: "Where can I find reliable GMAT sample papers?", a: "Official practice tests on MBA.com are the most reliable, as they utilize past exam questions and the exact computer-adaptive algorithm used on test day." },
      { q: "Are GMAT practice tests adaptive?", a: "Yes, the official mock tests on MBA.com replicate the adaptive format where questions change in difficulty based on your accuracy." }
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
        tone="rani"
        sign={{ hi: 'जीमैट', en: 'GMAT DESK' }}
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Exams', to: '/exams/gmat' },
          { label: 'GMAT' },
          { label: sidebarLinks.find(l => l.key === pageKey)?.name || 'Detail' },
        ]}
        title={activeContent.title}
        subtitle={activeContent.subtitle}
        stickers={<Sticker bg="#FFF6E5" tilt={-2}>GMAT Exam Reference Guide 2025</Sticker>}
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-10">

        {/* Section picker on phones and tablets */}
        <div className="lg:hidden -mt-6 mb-8 relative z-10">
          <InkCard className="p-3">
            <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none px-1 mb-2">Is section mein</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {sidebarLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive = pageKey === link.key;
                return (
                  <Link
                    key={link.key}
                    to={link.path}
                    style={isActive ? { background: '#B8285B', color: '#FFFFFF' } : undefined}
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
              <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Is section mein</p>
              <p className="mt-1 mb-3 font-urbanist font-black text-[15px] text-[#16130F]">GMAT Guide Index</p>
              <nav className="flex flex-col gap-1.5">
                {sidebarLinks.map((link) => {
                  const IconComponent = link.icon;
                  const isActive = pageKey === link.key;
                  return (
                    <Link
                      key={link.key}
                      to={link.path}
                      style={isActive ? { background: '#B8285B', color: '#FFFFFF' } : undefined}
                      className={`w-full flex items-center justify-between gap-2 py-2 px-3 rounded-lg border-2 text-[12.5px] font-bold leading-normal transition-colors ${isActive ? 'border-[#16130F] shadow-[3px_3px_0_#16130F]' : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
                    >
                      <span className="flex items-center gap-2">
                        <IconComponent size={14} />
                        {link.name}
                      </span>
                      <ChevronRight size={12} />
                    </Link>
                  );
                })}
              </nav>
            </InkCard>
          </aside>

          {/* Center main content */}
          <main className="min-w-0 space-y-10">
            <InkCard className="p-5 sm:p-8 md:p-10">
              <div className="mb-6 pb-5 border-b-2 border-dashed border-[#16130F]/25">
                <DesiHeading hi="Poori jaankari">
                  <span className="inline-flex items-center gap-2"><BookMarked size={22} style={{ color: '#B8285B' }} />Detailed Guide Content</span>
                </DesiHeading>
              </div>
              <div className="max-w-none">
                {activeContent.content}
              </div>

              {/* Quick action box */}
              <div className="mt-10 p-5 sm:p-6 bg-[#FBD9E6] border-[3px] border-[#16130F] rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 -rotate-[0.4deg]">
                <div>
                  <h4 className="font-urbanist font-black text-[#16130F] text-[17px] mb-1">Preparing for GMAT?</h4>
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
              <DesiHeading hi="Aage padho" className="mb-5">
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
              <DesiHeading hi="Sawaal-Jawaab" className="mb-5">
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
                          style={{ background: isOpen ? '#B8285B' : '#FFF6E5', color: isOpen ? '#FFFFFF' : '#16130F' }}
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
            <div className="p-6 border-[3px] border-[#16130F] rounded-2xl shadow-[5px_5px_0_#16130F] text-white rotate-[0.6deg]" style={{ background: '#14837E' }}>
              <span className="font-urbanist font-extrabold text-[15px] leading-none text-[#FCE38A] block">Live events</span>
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
            text="GMAT ka target score, B-school shortlist aur funding: ek free call mein sab clear. 1:1, ek ghante ki baat."
          />
        </div>
      </div>
    </div>
  );
};

export default GMATDetailPage;
