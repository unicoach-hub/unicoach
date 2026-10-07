import React from 'react';
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

const IELTSFeesPage = () => {
  const [dbBlogs, setDbBlogs] = React.useState([]);
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
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="hover:text-indigo-600 transition-colors">Exams</span>
          <ChevronRight size={12} />
          <span className="text-slate-650">IELTS</span>
          <ChevronRight size={12} />
          <span className="text-slate-600">IELTS Exam Fees</span>
        </div>

        {/* Title Header Card */}
        <div className="relative bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              IELTS Reference Guide
            </span>
            <h1 className="text-2xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              IELTS Exam Fees 2026 in India (Updated April 1)
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed font-semibold">
              Updated registration base fees, rechecking costs, cancellation policies, and rescheduling charges.
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
                const isActive = linkItem.key === 'fees';
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
                For many IELTS aspirants, understanding the financial aspect of taking the test is crucial. Knowing the costs involved helps you plan your budget effectively and avoid unexpected expenses. The IELTS Exam fee for both the Academic and General Training exams has been updated to <strong>INR 19,000 in 2026</strong>.
              </p>
              <p>
                IELTS exam fees can vary based on your location and the specific test format you choose, whether it’s the Academic or General Training test. Additionally, there may be extra charges for services such as rescheduling or cancellation.
              </p>

              <h3 className="text-lg font-black text-slate-900 mt-8 mb-4">1. IELTS Exam Fees in India 2026</h3>
              <p>
                In India, IDP Education takes charge of the IELTS exam. Even though the cost of taking the IELTS exam is broadly similar worldwide, the prices can vary a bit from one country to another. Below is the breakdown of the fee structure for various IELTS exam types:
              </p>

              <div className="overflow-x-auto border border-slate-100 rounded-xl my-6 shadow-sm">
                <table className="w-full text-left text-xs font-semibold">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-4 font-extrabold">Type of Exam</th>
                      <th className="py-3.5 px-4 font-extrabold">IELTS Exam Fee in India 2026</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655">
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">Computer-based IELTS exam (Academic / GT)</td>
                      <td className="py-3.5 px-4 text-indigo-650 font-extrabold">INR 19,000</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">Paper-based IELTS exam (Academic / GT)</td>
                      <td className="py-3.5 px-4 text-indigo-650 font-extrabold">INR 19,000</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">IELTS for UKVI Academic / General Training</td>
                      <td className="py-3.5 px-4 text-indigo-650 font-extrabold">INR 19,250</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">IELTS Life Skills (A1 & B1)</td>
                      <td className="py-3.5 px-4 text-indigo-650 font-extrabold">INR 18,000</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">One Skill Retake (OSR)</td>
                      <td className="py-3.5 px-4 text-indigo-650 font-extrabold">INR 12,650</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-black text-slate-900 mt-8 mb-4">2. IELTS Exam Fees 2026: City-Wise List in India</h3>
              <p>
                Across the major cities of India, there are numerous IDP IELTS centres available to accommodate test-takers. It’s important to note that the <strong>IELTS exam fee remains consistent across all cities</strong> throughout the country.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 my-6">
                {['Hyderabad', 'Delhi', 'Bangalore', 'Chennai', 'Mumbai', 'Punjab', 'Pune', 'Kerala', 'Kolkata', 'Ahmedabad'].map((city, idx) => (
                  <div key={idx} className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100/70 text-center">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">{city}</p>
                    <p className="text-sm font-black text-slate-800">INR 19,000</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-black text-slate-900 mt-8 mb-4">3. Payment Modes & Rechecking (EOR) Fees</h3>
              <p>
                Candidates who wish to review their IELTS results for potential score improvement can request a recheck. To initiate this, you must pay the administrative rechecking fee and submit the 'Enquiry on Results (EOR)' form online via the IELTS IDP India website.
              </p>

              <div className="overflow-x-auto border border-slate-100 rounded-xl my-6 shadow-sm">
                <table className="w-full text-left text-xs font-semibold">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-4 font-extrabold">Type of Exam</th>
                      <th className="py-3.5 px-4 font-extrabold">EOR Rechecking Fees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655">
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">Computer-delivered IELTS</td>
                      <td className="py-3.5 px-4 text-slate-700">INR 14,250</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">Paper-delivered IELTS</td>
                      <td className="py-3.5 px-4 text-slate-700">INR 14,250</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">UKVI IELTS</td>
                      <td className="py-3.5 px-4 text-slate-700">INR 14,400</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">IELTS Life Skills</td>
                      <td className="py-3.5 px-4 text-slate-700">INR 13,500</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">One Skill Retake</td>
                      <td className="py-3.5 px-4 text-slate-700">INR 9,450</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-2">
                <h4 className="font-extrabold text-indigo-950 text-sm flex items-center gap-1.5">
                  <span>💡 Important Note on EOR Refunds</span>
                </h4>
                <p className="text-xs text-indigo-900/90 leading-relaxed font-medium">
                  A <strong>full refund</strong> of the EOR fee will be issued to the candidate if the test taker's score is revised to a higher band score.
                </p>
              </div>

              <h3 className="text-lg font-black text-slate-900 mt-8 mb-4">4. IELTS Cancellation Fees 2026</h3>
              <p>
                You can cancel your IELTS test registration for both test types (Academic or General Training) before the scheduled test date by logging into the IDP IELTS website.
              </p>

              <div className="space-y-4 my-6">
                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5">
                  <h4 className="font-extrabold text-slate-850 text-sm">Cancelling IELTS on Paper / IELTS on Computer</h4>
                  <ul className="list-disc list-inside space-y-2 text-xs text-slate-550 font-semibold pl-2">
                    <li>Candidates can apply for cancellation only if the test date is at least 9 days or more from the date of application.</li>
                    <li>If the cancellation application is received less than 9 days before the test date, <strong>25% of the test fee will be charged</strong> as administrative charges, and the balance (75%) will be refunded within 7–10 working days.</li>
                  </ul>
                </div>

                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5">
                  <h4 className="font-extrabold text-slate-855 text-sm">Cancelling IELTS for UKVI / IELTS Life Skills</h4>
                  <ul className="list-disc list-inside space-y-2 text-xs text-slate-550 font-semibold pl-2">
                    <li><strong>More than 14 days before the test:</strong> 75% refund of total test fee.</li>
                    <li><strong>Within 14 days but more than 2 days before the test:</strong> 50% refund.</li>
                    <li><strong>Within 2 days of the test date:</strong> 25% refund.</li>
                    <li><strong>On test day or after:</strong> No refund.</li>
                  </ul>
                </div>

                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5">
                  <h4 className="font-extrabold text-slate-855 text-sm">Cancelling IELTS One Skill Retake</h4>
                  <ul className="list-disc list-inside space-y-2 text-xs text-slate-550 font-semibold pl-2">
                    <li><strong>At least 4 days before the test:</strong> 25% deducted as processing charge; remainder refunded.</li>
                    <li><strong>Less than 4 days before the test:</strong> No refund.</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 mt-8 mb-4">5. IELTS Rescheduling & Transfer Fees 2026</h3>
              <p>
                If you wish to reschedule your test date, you can do it by both online and offline methods. Your new test date must fall within 3 months of the original test date.
              </p>

              <div className="overflow-x-auto border border-slate-100 rounded-xl my-6 shadow-sm">
                <table className="w-full text-left text-xs font-semibold">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-4 font-extrabold">IELTS Test Type</th>
                      <th className="py-3.5 px-4 font-extrabold">Transfer Fee 2026</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655">
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">IELTS on Computer (Acad/GT)</td>
                      <td className="py-3.5 px-4 text-indigo-650 font-extrabold">INR 4,750</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">IELTS on Paper (Acad/GT)</td>
                      <td className="py-3.5 px-4 text-indigo-650 font-extrabold">INR 4,750</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">IELTS on Computer for UKVI</td>
                      <td className="py-3.5 px-4 text-indigo-650 font-extrabold">INR 4,850</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">IELTS on Paper for UKVI</td>
                      <td className="py-3.5 px-4 text-indigo-650 font-extrabold">INR 4,850</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">IELTS Life Skills (A1 and B1)</td>
                      <td className="py-3.5 px-4 text-indigo-650 font-extrabold">INR 4,500</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">One Skill Retake (OSR)</td>
                      <td className="py-3.5 px-4 text-indigo-650 font-extrabold">INR 3,200</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-black text-slate-900 mt-8 mb-4">6. IELTS Exam Fees for ATRF 2026</h3>
              <p>
                ATRF stands for <strong>Additional Test Report Form</strong>. ATRF is a way to officially convey your IELTS Scores to universities. You can send ATRF in three ways: courier, airmail or electronically.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 text-center space-y-1">
                  <h4 className="font-extrabold text-slate-800 text-sm">First 5 ATRF</h4>
                  <p className="text-indigo-650 text-lg font-black">No Cost</p>
                  <p className="text-[10px] text-slate-400 font-semibold">Processed electronically at no additional charge.</p>
                </div>
                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 text-center space-y-1">
                  <h4 className="font-extrabold text-slate-800 text-sm">After First 5</h4>
                  <p className="text-indigo-650 text-lg font-black">INR 350 <span className="text-xs font-semibold text-slate-500">per university</span></p>
                  <p className="text-[10px] text-slate-400 font-semibold">Note: You can send your scores to a maximum of 5 universities in a day.</p>
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 mt-12 mb-6">Frequently Asked Questions (FAQs) - IELTS Fees</h3>
              <div className="space-y-4">
                {[
                  {
                    q: "Has the IELTS fees increased in 2026?",
                    a: "Yes, the standard IELTS fee for Academic and General Training exams (both computer and paper formats) in India has been updated to INR 19,000 for 2026."
                  },
                  {
                    q: "Do I need to pay for the IELTS exam every time?",
                    a: "Yes. Every time you register to take the IELTS test, you are required to pay the standard registration fee of INR 19,000."
                  },
                  {
                    q: "Can I book IELTS without paying?",
                    a: "No. You cannot book an IELTS slot without making the payment. Confirmation of your chosen test date and venue will only occur after successful transaction clearance."
                  },
                  {
                    q: "How much does IDP charge for its services?",
                    a: "The services provided for test administration and score reporting are covered inside the initial exam registration fee. However, specific services like EOR rechecking (INR 14,250), rescheduling (INR 4,750), and extra ATRFs beyond five (INR 350 each) carry extra charges."
                  },
                  {
                    q: "Why is the IELTS exam fee so high?",
                    a: "The fee is determined based on the heavy costs associated with standardizing test material globally, maintaining state-of-the-art secure computer and paper venues, biometric candidate verification, hiring certified professional examiners, and distributing secure physical Test Report Forms (TRFs)."
                  },
                  {
                    q: "What are the requirements for the IELTS Scholarship?",
                    a: "The British Council and various private trusts offer scholarships. The key requirements usually include a high IELTS score (typically 6.5 or above, with no section under 6.0), academic excellence transcripts, a statement of purpose, and an offer letter from a recognized university abroad."
                  },
                  {
                    q: "Is the IELTS exam fee too expensive in India?",
                    a: "While it is a premium fee (INR 19,000), it matches the international standardization and is uniform across all cities in India, offering gateways to universities and visas worldwide."
                  },
                  {
                    q: "What is the IELTS registration Fees?",
                    a: "The registration fee depends on the test type: standard Academic/GT is INR 19,000; UKVI IELTS is INR 19,250; Life Skills is INR 18,000; and One Skill Retake is INR 12,650."
                  },
                  {
                    q: "Can I pay the IELTS exam fees in cash?",
                    a: "Direct cash is not accepted at exam venues. However, you can register offline and pay via bank deposit slip at designated ICICI/HDFC branches or pay via Demand Draft (DD) in favor of IDP Education India Private Limited."
                  },
                  {
                    q: "Can the IELTS exam fee be refunded?",
                    a: "Refunds are processed only if you cancel at least 9 days before the exam (for standard tests) or have a valid medical emergency with an official doctor certificate submitted within 5 days of the test date, minus administrative deductions."
                  }
                ].map((faq, index) => (
                  <details key={index} className="group border border-slate-200 rounded-2xl bg-white hover:border-indigo-150 transition-all duration-200 p-5">
                    <summary className="font-extrabold text-slate-800 cursor-pointer flex justify-between items-center list-none select-none text-sm">
                      <span>{faq.q}</span>
                      <span className="transition-transform duration-200 group-open:rotate-180 text-slate-400">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-3.5 text-slate-600 text-xs leading-relaxed font-semibold">
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
                <p className="text-xs text-slate-500 leading-normal font-normal">Join our free live masterclasses and workshops to learn speaking & writing band templates from experts.</p>
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
                <Link to={getBlogLink("IELTS Practice Test")} className="flex flex-col justify-between p-5 bg-white border border-slate-100 border-l-4 border-l-emerald-500 rounded-xl hover:shadow-md transition-all group">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-4 group-hover:text-indigo-655 transition-colors">IELTS Practice Test</h4>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    Read Now <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
                <Link to={getBlogLink("IELTS Modules")} className="flex flex-col justify-between p-5 bg-white border border-slate-100 border-l-4 border-l-sky-500 rounded-xl hover:shadow-md transition-all group">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-4 group-hover:text-indigo-655 transition-colors">IELTS Modules</h4>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    Read Now <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
                <Link to={getBlogLink("IELTS Dates")} className="flex flex-col justify-between p-5 bg-white border border-slate-100 border-l-4 border-l-amber-500 rounded-xl hover:shadow-md transition-all group">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-4 group-hover:text-indigo-655 transition-colors">IELTS Dates</h4>
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
            
            {/* Widget: Global Scholarships */}
            <div className="bg-gradient-to-r from-[#111111] via-[#10319E] to-[#111111] text-white p-6 rounded-2xl shadow-md border border-blue-900/40 relative overflow-hidden">
              <span className="text-[9px] font-bold text-orange-200 uppercase tracking-widest block mb-2">Financial Aid</span>
              <h3 className="text-lg font-bold leading-snug mb-2">
                10,000+ Global Scholarships
              </h3>
              <p className="text-xs text-blue-100/85 leading-relaxed mb-5 font-normal">
                Discover merit and need-based fee waivers to offset your exam and overseas study costs.
              </p>
              <Link
                to="/scholarships"
                className="w-full text-center py-3 bg-white text-[#111111] rounded-xl text-xs font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-1.5 shadow-sm block cursor-pointer"
              >
                <span>Explore Scholarships</span>
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

export default IELTSFeesPage;
