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
  FileEdit,
  CheckCircle2,
  HelpCircle,
  BookMarked,
  ListTodo,
  Sparkles,
  Info
} from 'lucide-react';
import { HookBand, StatStrip, BarCompare, Donut, VersusCard } from '../../../components/ui/Infographics';
import { StepCounter } from '../../../components/ui/BrandElements';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

const GREDetailPage = ({ pageKey }) => {
  const [openFaq, setOpenFaq] = useState({});

  const toggleFaq = (index) => {
    setOpenFaq(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const sidebarLinks = [
    { name: 'GRE Overview', path: '/exams/gre/overview', key: 'overview', icon: Compass },
    { name: 'GRE Syllabus', path: '/exams/gre/syllabus', key: 'syllabus', icon: BookOpen },
    { name: 'GRE Exam Fees', path: '/exams/gre/fees', key: 'fees', icon: DollarSign },
    { name: 'GRE Exam Dates', path: '/exams/gre/dates', key: 'dates', icon: Calendar },
    { name: 'GRE Registration', path: '/exams/gre/registration', key: 'registration', icon: FileEdit },
    { name: 'GRE Results', path: '/exams/gre/results', key: 'results', icon: Award },
    { name: 'GRE Slot Booking', path: '/exams/gre/slot-booking', key: 'slot-booking', icon: MapPin },
    { name: 'GRE Preparation', path: '/exams/gre/preparation', key: 'preparation', icon: ListTodo },
    { name: 'GRE Practice Test', path: '/exams/gre/practice-test', key: 'practice-test', icon: FileText }
  ];

  // Detailed content dictionary for GRE tabs
  const contentMap = {
    overview: {
      title: "GRE Exam for Indian Students: A Complete Guide",
      subtitle: "The Graduate Record Exam (GRE) is the leading admission test required for MS, MBA, and PhD programs globally.",
      content: (
        <div className="space-y-6">
          <div className="bg-[#FFF1B8] border-2 border-[#16130F] p-5 rounded-2xl flex items-start gap-3.5 shadow-[4px_4px_0_#16130F]">
            <Info className="text-[#DE5C2B] w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-[#16130F] text-xs uppercase tracking-wider mb-1">Latest ETS GRE Updates</h4>
              <p className="text-xs text-[#16130F] leading-relaxed font-semibold">
                ETS has introduced a shorter GRE General Test format, reducing the duration to 1 hour and 58 minutes. The Analytical Writing section now contains only one task (Analyse an Issue), and the number of questions in Verbal and Quantitative sections has been significantly reduced. Additionally, the GRE Subject Test is no longer applicable/available in India.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-urbanist text-lg font-black text-[#16130F] flex items-center gap-2">
              <span className="w-1 h-5 bg-[#F2B705] rounded-full inline-block" />
              1. What is the GRE Exam?
            </h3>
            <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
              GRE, or Graduate Record Exam, is one of the most common exams required for post-graduate studies abroad. It is conducted by the Educational Testing Services (ETS).
            </p>
            <StatStrip
              stats={[
                { value: '1h 58m', label: 'Shorter GRE General Test' },
                { value: '5 years', label: 'Score validity from test date' },
                { value: '21 days', label: 'Minimum gap between attempts' }
              ]}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              {[
                { title: "GRE General Test", desc: "Assesses Verbal Reasoning, Quantitative Reasoning, and Analytical Writing skills." },
                { title: "Wide Acceptability", desc: "Accepted by over 1,300 business schools in over 72 countries (USA, Canada, UK, etc.)." },
                { title: "Readiness Benchmark", desc: "Indicates your readiness for high-level graduate coursework." },
                { title: "Profile Booster", desc: "Significantly enhances your candidate profile for university admissions and scholarships." }
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
            <h3 className="font-urbanist text-lg font-black text-[#16130F] flex items-center gap-2">
              <span className="w-1 h-5 bg-[#F2B705] rounded-full inline-block" />
              Why Take the GRE?
            </h3>
            <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
              Most graduate divisions require standard standardized scores to differentiate between candidates coming from different educational setups. A high GRE score helps you stand out and is key for merit-based financial aid.
            </p>
          </div>
        </div>
      )
    },
    syllabus: {
      title: "GRE Syllabus & Pattern: What Does the Test Contain?",
      subtitle: "Full breakdown of section timing, question structures, and syllabus guidelines under the shorter GRE.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            The shorter GRE General Test contains 46 fewer questions compared to the traditional version, making the test faster and less tiring.
          </p>

          <HookBand value="46" label="Fewer questions than the traditional GRE: 55 questions plus 1 essay now" hi="छोटा" />

          <div className="space-y-4">
            <h4 className="font-black text-[#16130F] text-xs uppercase tracking-wide">GRE Shorter Edition Format</h4>
            <div>
              <Donut
                kicker="Time split"
                title="Minutes per GRE section"
                segments={[
                  { label: 'Quantitative Reasoning', value: 47, display: '47 min' },
                  { label: 'Verbal Reasoning', value: 41, display: '41 min' },
                  { label: 'Analytical Writing', value: 30, display: '30 min' }
                ]}
                centerValue="118"
                centerLabel="minutes"
              />
            </div>
            <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F]">
              <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
                <thead className="bg-[#14837E] text-[#FFFFFF] border-b-[3px] border-[#16130F] font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black">GRE Section</th>
                    <th className="py-3 px-4 text-xs font-black">Structure / Questions</th>
                    <th className="py-3 px-4 text-xs font-black">Timing Limits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16130F]/15 text-[#3D362E] font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#16130F]">Analytical Writing</td>
                    <td className="py-3 px-4">1 Essay Task (Analyse an Issue)</td>
                    <td className="py-3 px-4">30 Minutes</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#16130F]">Quantitative Reasoning</td>
                    <td className="py-3 px-4">27 Questions (2 Sections)</td>
                    <td className="py-3 px-4">47 Minutes</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#16130F]">Verbal Reasoning</td>
                    <td className="py-3 px-4">27 Questions (2 Sections)</td>
                    <td className="py-3 px-4">41 Minutes</td>
                  </tr>
                  <tr className="bg-[#FFF1B8] font-bold">
                    <td className="py-3 px-4 text-[#16130F]">Total Exam</td>
                    <td className="py-3 px-4 text-[#14837E]">55 Questions + 1 Essay</td>
                    <td className="py-3 px-4">1 Hour 58 Mins</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-black text-[#16130F] text-xs uppercase tracking-wide">Section Focus Areas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-[#3D362E]">
              <div className="p-4 border-2 border-[#16130F] bg-[#FFF6E5] rounded-2xl space-y-1.5 shadow-[4px_4px_0_#16130F]">
                <span className="font-black text-[#14837E] block">Verbal Reasoning</span>
                <span className="text-[12.5px] text-[#5B544A] block leading-relaxed">Evaluates text comprehension, argument analysis, vocabulary (text completion), sentence equivalence, and passage logic.</span>
              </div>
              <div className="p-4 border-2 border-[#16130F] bg-[#FFF6E5] rounded-2xl space-y-1.5 shadow-[4px_4px_0_#16130F]">
                <span className="font-black text-[#14837E] block">Quantitative Reasoning</span>
                <span className="text-[12.5px] text-[#5B544A] block leading-relaxed">Measures basic mathematical skills: arithmetic, high school algebra, geometry data interpretation, and statistics.</span>
              </div>
              <div className="p-4 border-2 border-[#16130F] bg-[#FFF6E5] rounded-2xl space-y-1.5 shadow-[4px_4px_0_#16130F]">
                <span className="font-black text-[#14837E] block">Analytical Writing</span>
                <span className="text-[12.5px] text-[#5B544A] block leading-relaxed">Tests capability to articulate arguments clearly, organize points logically, and back up claims with relevant details.</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    fees: {
      title: "GRE Exam Fees in India: Registration & Rescheduling Fees",
      subtitle: "Overview of current GRE test registration rates, scheduling penalties, and DCC payment channels.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            From 1 August 2026, the GRE General Test fee in India is US$249 (ETS), plus any applicable tax. Additional service fees apply depending on post-booking requests:
          </p>

          <HookBand value="US$249" label="GRE General Test fee in India from 1 August 2026 (ETS), plus any applicable tax" />

          <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F]">
            <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
              <thead className="bg-[#14837E] text-[#FFFFFF] border-b-[3px] border-[#16130F] font-bold uppercase">
                <tr>
                  <th className="py-3 px-4 text-xs font-black">GRE Exam Service / Category</th>
                  <th className="py-3 px-4 text-xs font-black">Fees in India (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16130F]/15 text-[#3D362E] font-semibold text-xs">
                <tr>
                  <td className="py-3 px-4 font-bold text-[#16130F]">GRE General Test Fee</td>
                  <td className="py-3 px-4 font-black text-[#14837E]">US$249</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Rescheduling Fee</td>
                  <td className="py-3 px-4">₹5,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Changing Test Centre Location</td>
                  <td className="py-3 px-4">₹5,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Changing Subject Test Details</td>
                  <td className="py-3 px-4">₹5,000</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Additional Score Report Request</td>
                  <td className="py-3 px-4">₹2,900</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Score Review Request</td>
                  <td className="py-3 px-4">₹5,900</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Score Reinstatement Fee</td>
                  <td className="py-3 px-4">₹5,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <BarCompare
              kicker="Extra charges"
              title="GRE service fees in India (INR)"
              items={[
                { label: 'Score review', value: 5900, display: '₹5,900' },
                { label: 'Rescheduling', value: 5000, display: '₹5,000' },
                { label: 'Change test centre', value: 5000, display: '₹5,000' },
                { label: 'Score reinstatement', value: 5000, display: '₹5,000' },
                { label: 'Extra score report', value: 2900, display: '₹2,900' }
              ]}
            />
          </div>

          <div className="bg-[#FFF6E5] border-2 border-[#16130F] p-4.5 rounded-2xl text-[12.5px] text-[#5B544A] font-semibold space-y-2 leading-relaxed shadow-[4px_4px_0_#16130F]">
            <h5 className="font-extrabold text-[#16130F] text-xs">Payment Channels & Rescheduling:</h5>
            <p>• <strong>Rescheduling Deadline:</strong> You must reschedule at least 4 days before your test date to avoid forfeiting your entire registration fee. Rescheduling cost is ₹5,000.</p>
            <p>• <strong>Accepted payment methods:</strong> Credit/Debit cards (Visa, MasterCard, Maestro, RuPay), UPI, Bharat QR, digital wallets (PayZapp, Google Pay, FreeCharge), and Dynamic Currency Conversion (DCC).</p>
          </div>
        </div>
      )
    },
    dates: {
      title: "GRE Dates: When is the GRE Exam Conducted?",
      subtitle: "GRE General tests are available on most days throughout the year depending on your local center.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            Unlike other standard academic exams with fixed schedules, the computer-based GRE is offered multiple times a week. Candidates can book slots up to 2-3 months early.
          </p>
          <StatStrip
            stats={[
              { value: '2–3 mo', label: 'How early you can book a slot' },
              { value: '24/7', label: 'GRE at Home date availability' },
              { value: '21 days', label: 'Minimum gap between attempts' }
            ]}
          />
          <div className="p-4.5 border-2 border-[#16130F] rounded-2xl bg-[#FFF6E5] text-[12.5px] text-[#5B544A] font-semibold space-y-2 leading-relaxed shadow-[4px_4px_0_#16130F]">
            <p>• <strong>Year-Round availability:</strong> Test center slots are scheduled dynamically and are open on a rolling basis.</p>
            <p>• <strong>GRE at Home Slots:</strong> Home-testing provides 24/7 date availability, making slot selection convenient.</p>
            <p>• <strong>Retake Rule:</strong> Candidates must maintain a minimum buffer of 21 days between successive GRE attempts.</p>
          </div>
        </div>
      )
    },
    registration: {
      title: "GRE Registration: How to Register for GRE?",
      subtitle: "Guideline steps to register for GRE General, GRE Subject, and Home exams.",
      content: (
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">Online Registration Steps:</h4>
            <StepCounter
              items={[
                { label: 'ETS account' },
                { label: 'Match passport' },
                { label: 'Find centres' },
                { label: 'Pick test' },
                { label: 'Centre, date, slot' },
                { label: 'ID details' },
                { label: 'Pay US$249', highlight: true },
                { label: 'Admission ticket' }
              ]}
            />
            <div className="space-y-2 text-[12.5px] font-bold text-[#5B544A]">
              {[
                "1. Visit the official Educational Testing Services (ETS) portal and create an account.",
                "2. Register your profile precisely matching the spelling in your valid passport.",
                "3. Click the 'Register/Find Test Centers, Dates' link on the dashboard.",
                "4. Select the GRE General or GRE Subject Test based on your B-school goals.",
                "5. Pick your preferred test center, date range, and daily time slot.",
                "6. Provide details matching your valid ID proof (physical passport).",
                "7. Complete payment of US$249 using a card or UPI.",
                "8. Receive registration confirmation logs and download your admission ticket."
              ].map((step, idx) => (
                <div key={idx} className="p-3 bg-[#FFF6E5] rounded-xl border-2 border-[#16130F]">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">GRE Subject Test Windows</h4>
            <p className="text-xs text-[#5B544A] leading-relaxed font-semibold">
              The GRE Subject test has fixed test windows globally. Note that home-testing for the Subject test is not available in India. The three standard windows are:
            </p>
            <div className="grid grid-cols-3 gap-3.5 text-center text-[10px] font-bold text-[#3D362E] bg-[#FFF6E5] p-4 rounded-xl border-2 border-[#16130F]">
              <div>
                <span className="block text-[#14837E]">Window 1</span>
                <span>Sep 16 - Sep 29, 2024</span>
              </div>
              <div>
                <span className="block text-[#14837E]">Window 2</span>
                <span>Oct 17 - Oct 30, 2024</span>
              </div>
              <div>
                <span className="block text-[#14837E]">Window 3</span>
                <span>Apr 21 - May 4, 2025</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">GRE at Home vs Test Center</h4>
            <p className="text-xs text-[#5B544A] leading-relaxed font-semibold">
              The GRE General at Home allows you to write the test under secure remote proctoring. The at-home test costs the same as the test-centre test (US$249).
            </p>
          </div>
        </div>
      )
    },
    results: {
      title: "GRE Result: How do You Check Your GRE Results?",
      subtitle: "Learn how score ranges are structured, how to download TRFs, and validity limits.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            GRE General Test results are released in <strong>10-15 days</strong> of your exam appointment. You can check them by logging into your ETS dashboard.
          </p>

          <HookBand value="10–15 days" label="Time for GRE General Test results to be released after your exam" />

          <div className="space-y-4">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">GRE General Test Scoring System</h4>
            <StatStrip
              stats={[
                { value: '130–170', label: 'Verbal Reasoning' },
                { value: '130–170', label: 'Quantitative Reasoning' },
                { value: '0–6', label: 'Analytical Writing' },
                { value: '5 years', label: 'Score validity' }
              ]}
            />
            <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F]">
              <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
                <thead className="bg-[#14837E] text-[#FFFFFF] border-b-[3px] border-[#16130F] font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 text-xs font-black">Exam Section</th>
                    <th className="py-3 px-4 text-xs font-black">Score Range</th>
                    <th className="py-3 px-4 text-xs font-black">Increments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#16130F]/15 text-[#3D362E] font-semibold text-xs">
                  <tr>
                    <td className="py-3 px-4">Verbal Reasoning</td>
                    <td className="py-3 px-4">130 – 170</td>
                    <td className="py-3 px-4">1-point increments (+1 per correct answer)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Quantitative Reasoning</td>
                    <td className="py-3 px-4">130 – 170</td>
                    <td className="py-3 px-4">1-point increments (+1 per correct answer)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Analytical Writing</td>
                    <td className="py-3 px-4">0 – 6</td>
                    <td className="py-3 px-4">0.5-point increments</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#FFF6E5] border-2 border-[#16130F] p-4.5 rounded-2xl text-[12.5px] text-[#5B544A] space-y-2 leading-relaxed shadow-[4px_4px_0_#16130F]">
            <p>• <strong>Score Report:</strong> Official scores are sent to up to 4 universities free of charge within 10-15 days. Extra reports cost ₹2,900 each.</p>
            <p>• <strong>Validity:</strong> Scores remain valid for exactly <strong>5 years</strong> from the test date.</p>
            <p>• <strong>ScoreSelect:</strong> Allows candidates to choose which test date scores to send to universities.</p>
          </div>
        </div>
      )
    },
    'slot-booking': {
      title: "GRE Slot Booking: Check Booking Dates for Registration & Slots",
      subtitle: "Test center directories, computer-based dates, and secure proctoring setups.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            GRE slot booking lets you secure dates, locations, and time configurations.
          </p>

          <div className="space-y-4">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">GRE Test Centres Address Directory (India)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-[12.5px] text-[#3D362E] font-semibold leading-relaxed">
              <div className="border-2 border-[#16130F] rounded-xl p-3 bg-[#FFF6E5]">
                <strong className="text-[#16130F] block text-xs">Ahmedabad</strong>
                5th Floor, Unit 501, Parshwanath Esquare, Corporate Road, 380005
              </div>
              <div className="border-2 border-[#16130F] rounded-xl p-3 bg-[#FFF6E5]">
                <strong className="text-[#16130F] block text-xs">Bangalore</strong>
                Prestige Shantiniketan Whitefield or Koramangala 5th Block KHB Colony
              </div>
              <div className="border-2 border-[#16130F] rounded-xl p-3 bg-[#FFF6E5]">
                <strong className="text-[#16130F] block text-xs">Chandigarh</strong>
                Sector 26 - Computer Lab
              </div>
              <div className="border-2 border-[#16130F] rounded-xl p-3 bg-[#FFF6E5]">
                <strong className="text-[#16130F] block text-xs">Chennai</strong>
                Manimangalam Post, Dhanalakshmi Engineering College
              </div>
              <div className="border-2 border-[#16130F] rounded-xl p-3 bg-[#FFF6E5]">
                <strong className="text-[#16130F] block text-xs">Hyderabad</strong>
                Kapil Towers Gachibowli, Police Line Nizamabad, or Kazipet Warangal
              </div>
              <div className="border-2 border-[#16130F] rounded-xl p-3 bg-[#FFF6E5]">
                <strong className="text-[#16130F] block text-xs">Kolkata</strong>
                Millennium City DN-62, Sector V Salt Lake
              </div>
              <div className="border-2 border-[#16130F] rounded-xl p-3 bg-[#FFF6E5]">
                <strong className="text-[#16130F] block text-xs">Mumbai</strong>
                Techniplex Goregaon or Aruna Manharlal Shah Institute
              </div>
              <div className="border-2 border-[#16130F] rounded-xl p-3 bg-[#FFF6E5]">
                <strong className="text-[#16130F] block text-xs">Pune</strong>
                Marvel Vista Bibwewadi or Upper Indiranagar
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#16130F]/15">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">Home Exam Setup Guide</h4>
            <p className="text-xs text-[#5B544A] font-semibold leading-relaxed">
              To take the GRE at Home, you must check that your workstation complies with proctoring specs:
            </p>
            <StepCounter
              items={[
                { label: 'Private room' },
                { label: 'Laptop + fast network' },
                { label: 'Speaker & mic' },
                { label: 'Working camera' }
              ]}
            />
            <ul className="list-disc list-inside text-[12.5px] text-[#5B544A] space-y-1.5 leading-relaxed font-semibold">
              <li>A private room without disturbances or outdoor interruptions.</li>
              <li>A laptop or desktop with proper high-speed network connectivity.</li>
              <li>A functional built-in speaker and microphone setup.</li>
              <li>A proper working camera or external webcam.</li>
            </ul>
          </div>
        </div>
      )
    },
    preparation: {
      title: "GRE Exam Preparation: Planners & Recommended Strategies",
      subtitle: "Effective strategies to build vocabulary and quantitative problem solving skills.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            Dedicated preparation of 2 to 3 months is optimal for most MS and MBA candidates. Focus on:
          </p>

          <HookBand value="2–3 months" label="Dedicated preparation that is optimal for most MS and MBA candidates" hi="तैयारी" />

          <div>
            <VersusCard
              kicker="Choose your route"
              title="Self prep or guided coaching?"
              left={{ title: 'Option A: Self Prep', points: ['Familiarize yourself with ETS exam patterns', 'Official guides and practice mocks', 'Best if your baseline vocabulary is high'] }}
              right={{ title: 'Option B: Guided Coaching', tag: '320+', points: ['For candidates targeting 320+ scores', 'Shortcuts for quantitative topics', 'Detailed feedback on Analytical Writing essays'] }}
            />
          </div>
        </div>
      )
    },
    'practice-test': {
      title: "GRE Practice Test for Exam Preparation",
      subtitle: "Simulating exams using practice tests is the best way to evaluate performance and build speed.",
      content: (
        <div className="space-y-6">
          <p className="text-[#3D362E] font-semibold text-xs leading-relaxed">
            Practice tests are not just for evaluating your score. They help you build critical exam-day endurance and manage time effectively.
          </p>
          <StatStrip
            stats={[
              { value: '41 min', label: 'Verbal Reasoning time limit' },
              { value: '30 min', label: 'Analyse an Issue essay window' },
              { value: '2 free', label: 'POWERPREP Online practice tests from ETS' }
            ]}
          />

          <div className="space-y-4">
            <h4 className="font-urbanist text-sm font-black text-[#16130F]">Section Practice Guidelines</h4>
            <div className="space-y-3 text-[12.5px] text-[#3D362E] font-semibold leading-relaxed">
              <div className="p-4 border-2 border-[#16130F] bg-[#FFF6E5] rounded-2xl shadow-[4px_4px_0_#16130F]">
                <strong className="text-[#14837E] block mb-1">Verbal Reasoning Mocks</strong>
                Focuses on comprehension and critical reasoning. Standard practice includes reading complex passages and solving MCQs under a tight 41-minute limit.
              </div>
              <div className="p-4 border-2 border-[#16130F] bg-[#FFF6E5] rounded-2xl shadow-[4px_4px_0_#16130F]">
                <strong className="text-[#14837E] block mb-1">Quantitative Reasoning Mocks</strong>
                Assess arithmetic, algebra, probability, data interpretation, and statistics. Practice solving quantitative comparison questions.
              </div>
              <div className="p-4 border-2 border-[#16130F] bg-[#FFF6E5] rounded-2xl shadow-[4px_4px_0_#16130F]">
                <strong className="text-[#14837E] block mb-1">Analytical Writing practice</strong>
                Write one argumentative essay response (Analyse an Issue) within a strict 30-minute window.
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const faqMap = {
    overview: [
      { q: "How long is the GRE?", a: "The shorter GRE General Test takes exactly 1 hour and 58 minutes to complete." },
      { q: "Is the GRE compulsory for MS in the USA?", a: "While many universities have made it optional or offer waivers, a high GRE score significantly boosts admissions and merit scholarships." },
      { q: "How long are GRE scores valid?", a: "GRE scores are valid for exactly 5 years from your test date." },
      { q: "How many times can I take the GRE in a year?", a: "You can take the GRE once every 21 days, up to 5 times in a continuous rolling 12-month period." },
      { q: "Can I use a calculator during the GRE test?", a: "An on-screen calculator is provided during the Quantitative Reasoning section. Physical calculators are prohibited." },
      { q: "Is there a negative marking on the GRE?", a: "No, there is no negative marking for incorrect answers. Attempting all questions is highly encouraged." }
    ],
    syllabus: [
      { q: "What did the shorter GRE update change?", a: "It reduced the question count in Verbal and Quantitative sections to 27 questions each, removed the Analyse an Argument essay, and shortened the test time to under 2 hours." },
      { q: "Are there breaks in the shorter GRE?", a: "No, there are no scheduled breaks in the shorter 1 hour 58 minutes exam." }
    ],
    fees: [
      { q: "How much is the GRE exam fee?", a: "From 1 August 2026 the GRE General Test costs US$249 in India (ETS), plus any applicable tax." },
      { q: "Is rescheduling the GRE exam free?", a: "No, rescheduling your GRE date costs ₹5,000 and must be done at least 4 days before the test date." }
    ],
    dates: [
      { q: "When are GRE exams conducted?", a: "The computer-delivered test is available year-round. Slot availability depends on the chosen local test center." }
    ],
    registration: [
      { q: "Who is eligible for the GRE General test?", a: "ETS has set no specific age limits or educational qualifiers. A valid physical passport is required for registration in India." }
    ],
    results: [
      { q: "What is a good GRE score?", a: "A total score above 300 is considered good. Top-tier universities often seek scores of 315-320 and above." }
    ],
    'slot-booking': [
      { q: "How can I book GRE slots in India?", a: "You can book slots online via the ETS website by creating an account, selecting a test center, date, and paying the US$249 fee." }
    ],
    preparation: [
      { q: "Can I clear my GRE in one month?", a: "Yes, if you already have a strong foundation in math and English, a month of targeted mock testing can yield a good score. Most candidates benefit from 2-3 months of study." }
    ],
    'practice-test': [
      { q: "Are GRE practice tests free?", a: "ETS provides 2 free POWERPREP Online practice tests upon account creation on MBA.com/ETS." }
    ]
  };

  const activeContent = contentMap[pageKey] || contentMap.overview;
  const currentFaqs = faqMap[pageKey] || faqMap.overview;

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
        tone="mustard"
        sign={{ hi: 'जीआरई', en: 'GRE DESK' }}
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Exams', to: '/exams/gre' },
          { label: 'GRE' },
          { label: sidebarLinks.find(l => l.key === pageKey)?.name || 'Detail' },
        ]}
        title={activeContent.title}
        subtitle={activeContent.subtitle}
        stickers={<Sticker bg="#FFF6E5" tilt={-2}>GRE Reference Guide 2025</Sticker>}
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
                    style={isActive ? { background: '#F2B705', color: '#16130F' } : undefined}
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
              <p className="mt-1 mb-3 font-urbanist font-black text-[15px] text-[#16130F]">GRE Guide Index</p>
              <nav className="flex flex-col gap-1.5">
                {sidebarLinks.map((link) => {
                  const IconComponent = link.icon;
                  const isActive = pageKey === link.key;
                  return (
                    <Link
                      key={link.key}
                      to={link.path}
                      style={isActive ? { background: '#F2B705', color: '#16130F' } : undefined}
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
                <DesiHeading hi="पूरी जानकारी">
                  <span className="inline-flex items-center gap-2"><BookMarked size={22} style={{ color: '#D0362E' }} />Detailed Guide Content</span>
                </DesiHeading>
              </div>
              <div className="max-w-none">
                {activeContent.content}
              </div>

              {/* Quick action box */}
              <div className="mt-10 p-5 sm:p-6 bg-[#FFF1B8] border-[3px] border-[#16130F] rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 -rotate-[0.4deg]">
                <div>
                  <h4 className="font-urbanist font-black text-[#16130F] text-[17px] mb-1">Preparing for GRE?</h4>
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
                          style={{ background: isOpen ? '#F2B705' : '#FFF6E5', color: isOpen ? '#16130F' : '#16130F' }}
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
            text="GRE ka target score, shortlist aur funding: ek free call mein sab clear. 1:1, ek ghante ki baat."
          />
        </div>
      </div>
    </div>
  );
};

export default GREDetailPage;
