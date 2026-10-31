import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  IndianRupee,
  RefreshCw,
  Ban,
} from 'lucide-react';
import { API_BASE_URL } from '../../../../config';
import { SourceStat } from '../../../../components/ui/BrandElements';
import { BarCompare } from '../../../../components/ui/Infographics';
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

// Ink-bordered table shell: wide tables scroll inside their own box
const InkTable = ({ children }) => (
  <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-xl shadow-[5px_5px_0_#16130F] my-6">
    <table className="w-full min-w-[420px] text-left text-[13.5px]">{children}</table>
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
    <div className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F]">
      {/* ── HERO ── */}
      <DesiHero
        tone="peach"
        sign={{ hi: 'Fees', en: 'IELTS FEES' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams' }, { label: 'IELTS' }, { label: 'IELTS Exam Fees' }]}
        title="IELTS Exam Fees 2026 in India (Updated April 1)"
        subtitle="Updated registration base fees, rechecking costs, cancellation policies, and rescheduling charges."
        stickers={(
          <>
            <Sticker tilt={-2}><BookOpen size={14} />IELTS Reference Guide</Sticker>
            <Sticker bg="#F2B705" tilt={1.5}><IndianRupee size={14} />Registration</Sticker>
            <Sticker bg="#DDF3EF" tilt={-1}><RefreshCw size={14} />Rechecking</Sticker>
            <Sticker bg="#FBD9E6" tilt={1}><Ban size={14} />Cancellation</Sticker>
          </>
        )}
      />

      {/* ── GUIDE PICKER (phones and tablets) ── */}
      <div className="lg:hidden max-w-[1400px] mx-auto px-4 -mt-6 mb-8 relative z-10">
        <InkCard className="p-3">
          <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none px-1 mb-2">IELTS guide</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sidebarLinks.map((linkItem) => {
              const isActive = linkItem.key === 'fees';
              return (
                <Link
                  key={linkItem.key}
                  to={linkItem.path}
                  className={`px-3.5 py-2 rounded-full border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 ${isActive ? 'border-[#16130F] bg-[#D0362E] text-white shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
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
                  const isActive = linkItem.key === 'fees';
                  return (
                    <Link
                      key={linkItem.key}
                      to={linkItem.path}
                      className={`group w-full text-left py-2 px-3 rounded-lg border-2 text-[13px] font-bold leading-normal flex items-center justify-between gap-2 transition-colors
                        ${isActive
                          ? 'border-[#16130F] bg-[#D0362E] text-white shadow-[3px_3px_0_#16130F]'
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
                For many IELTS aspirants, understanding the financial aspect of taking the test is crucial. Knowing the costs involved helps you plan your budget effectively and avoid unexpected expenses. The IELTS Exam fee for both the Academic and General Training exams has been updated to <strong className="text-[#16130F]">INR 19,000 in 2026</strong>.
              </p>
              <p>
                IELTS exam fees can vary based on your location and the specific test format you choose, whether it’s the Academic or General Training test. Additionally, there may be extra charges for services such as rescheduling or cancellation.
              </p>

              <SubHead hi="Fees ka hisaab" className="pt-4">1. IELTS Exam Fees in India 2026</SubHead>
              <p>
                In India, IDP Education takes charge of the IELTS exam. Even though the cost of taking the IELTS exam is broadly similar worldwide, the prices can vary a bit from one country to another. Below is the breakdown of the fee structure for various IELTS exam types:
              </p>

              <SourceStat className="not-prose my-6" value="₹19,000" label="IELTS Academic / General Training fee in India, 2026" source="IDP Education" />

              <InkTable>
                  <thead className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F]">
                    <tr>
                      <th className="py-3 px-4 font-extrabold uppercase text-[11.5px] tracking-wider">Type of Exam</th>
                      <th className="py-3 px-4 font-extrabold uppercase text-[11.5px] tracking-wider">IELTS Exam Fee in India 2026</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#16130F]/10 text-[#3D362E]">
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">Computer-based IELTS exam (Academic / GT)</td>
                      <td className="py-3 px-4 text-[#D0362E] font-black whitespace-nowrap">INR 19,000</td>
                    </tr>
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">Paper-based IELTS exam (Academic / GT)</td>
                      <td className="py-3 px-4 text-[#D0362E] font-black whitespace-nowrap">INR 19,000</td>
                    </tr>
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">IELTS for UKVI Academic / General Training</td>
                      <td className="py-3 px-4 text-[#D0362E] font-black whitespace-nowrap">INR 19,250</td>
                    </tr>
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">IELTS Life Skills (A1 &amp; B1)</td>
                      <td className="py-3 px-4 text-[#D0362E] font-black whitespace-nowrap">INR 18,000</td>
                    </tr>
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">One Skill Retake (OSR)</td>
                      <td className="py-3 px-4 text-[#D0362E] font-black whitespace-nowrap">INR 12,650</td>
                    </tr>
                  </tbody>
              </InkTable>

              <div>
                <BarCompare
                  kicker="Fee comparison"
                  title="IELTS fees in India by test type"
                  highlight="Academic / GT"
                  items={[
                    { label: 'IELTS for UKVI', value: 19250, display: 'INR 19,250' },
                    { label: 'Academic / GT', value: 19000, display: 'INR 19,000' },
                    { label: 'Life Skills (A1 & B1)', value: 18000, display: 'INR 18,000' },
                    { label: 'One Skill Retake', value: 12650, display: 'INR 12,650' },
                  ]}
                />
              </div>

              <SubHead hi="Shehar ke hisaab se" className="pt-4">2. IELTS Exam Fees 2026: City-Wise List in India</SubHead>
              <p>
                Across the major cities of India, there are numerous IDP IELTS centres available to accommodate test-takers. It’s important to note that the <strong className="text-[#16130F]">IELTS exam fee remains consistent across all cities</strong> throughout the country.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-6">
                {['Hyderabad', 'Delhi', 'Bangalore', 'Chennai', 'Mumbai', 'Punjab', 'Pune', 'Kerala', 'Kolkata', 'Ahmedabad'].map((city, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border-2 border-[#16130F] text-center shadow-[2px_2px_0_#16130F]"
                    style={{ background: DESI_TONES[idx % 4].soft, transform: `rotate(${idx % 2 ? 1 : -1}deg)` }}
                  >
                    <p className="text-[10.5px] text-[#5B544A] font-extrabold uppercase tracking-wider mb-1">{city}</p>
                    <p className="text-[14px] font-black text-[#16130F]">INR 19,000</p>
                  </div>
                ))}
              </div>

              <SubHead hi="Re-check" className="pt-4">3. Payment Modes &amp; Rechecking (EOR) Fees</SubHead>
              <p>
                Candidates who wish to review their IELTS results for potential score improvement can request a recheck. To initiate this, you must pay the administrative rechecking fee and submit the 'Enquiry on Results (EOR)' form online via the IELTS IDP India website.
              </p>

              <InkTable>
                  <thead className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F]">
                    <tr>
                      <th className="py-3 px-4 font-extrabold uppercase text-[11.5px] tracking-wider">Type of Exam</th>
                      <th className="py-3 px-4 font-extrabold uppercase text-[11.5px] tracking-wider">EOR Rechecking Fees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#16130F]/10 text-[#3D362E]">
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">Computer-delivered IELTS</td>
                      <td className="py-3 px-4 font-semibold text-[#3D362E] whitespace-nowrap">INR 14,250</td>
                    </tr>
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">Paper-delivered IELTS</td>
                      <td className="py-3 px-4 font-semibold text-[#3D362E] whitespace-nowrap">INR 14,250</td>
                    </tr>
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">UKVI IELTS</td>
                      <td className="py-3 px-4 font-semibold text-[#3D362E] whitespace-nowrap">INR 14,400</td>
                    </tr>
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">IELTS Life Skills</td>
                      <td className="py-3 px-4 font-semibold text-[#3D362E] whitespace-nowrap">INR 13,500</td>
                    </tr>
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">One Skill Retake</td>
                      <td className="py-3 px-4 font-semibold text-[#3D362E] whitespace-nowrap">INR 9,450</td>
                    </tr>
                  </tbody>
              </InkTable>

              <div className="bg-[#FFF1B8] border-[3px] border-[#16130F] rounded-xl p-5 space-y-2 shadow-[4px_4px_0_#14837E]" style={{ transform: 'rotate(-0.4deg)' }}>
                <h4 className="font-urbanist font-black text-[16px] text-[#16130F] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full border-2 border-[#16130F] bg-[#F2B705] grid place-items-center shrink-0">
                    <Lightbulb size={14} />
                  </span>
                  <span>Important Note on EOR Refunds</span>
                </h4>
                <p className="text-[13.5px] text-[#3D362E] leading-relaxed">
                  A <strong className="text-[#16130F]">full refund</strong> of the EOR fee will be issued to the candidate if the test taker's score is revised to a higher band score.
                </p>
              </div>

              <SubHead hi="Cancel karna" className="pt-4">4. IELTS Cancellation Fees 2026</SubHead>
              <p>
                You can cancel your IELTS test registration for both test types (Academic or General Training) before the scheduled test date by logging into the IDP IELTS website.
              </p>

              <div className="space-y-5 my-6">
                <div className="bg-white border-[3px] border-[#16130F] rounded-xl p-5 space-y-3 shadow-[4px_4px_0_#16130F]" style={{ borderTopWidth: 8, borderTopColor: '#F2B705' }}>
                  <h4 className="font-urbanist font-black text-[16px] text-[#16130F]">Cancelling IELTS on Paper / IELTS on Computer</h4>
                  <ul className="space-y-2 text-[13.5px] text-[#3D362E] leading-relaxed">
                    <li className="flex gap-2.5"><span className="mt-[7px] w-2 h-2 rounded-full border-2 border-[#16130F] shrink-0" style={{ background: '#F2B705' }} /><span>Candidates can apply for cancellation only if the test date is at least 9 days or more from the date of application.</span></li>
                    <li className="flex gap-2.5"><span className="mt-[7px] w-2 h-2 rounded-full border-2 border-[#16130F] shrink-0" style={{ background: '#F2B705' }} /><span>If the cancellation application is received less than 9 days before the test date, <strong>25% of the test fee will be charged</strong> as administrative charges, and the balance (75%) will be refunded within 7–10 working days.</span></li>
                  </ul>
                </div>

                <div className="bg-white border-[3px] border-[#16130F] rounded-xl p-5 space-y-3 shadow-[4px_4px_0_#16130F]" style={{ borderTopWidth: 8, borderTopColor: '#14837E' }}>
                  <h4 className="font-urbanist font-black text-[16px] text-[#16130F]">Cancelling IELTS for UKVI / IELTS Life Skills</h4>
                  <ul className="space-y-2 text-[13.5px] text-[#3D362E] leading-relaxed">
                    <li className="flex gap-2.5"><span className="mt-[7px] w-2 h-2 rounded-full border-2 border-[#16130F] shrink-0" style={{ background: '#14837E' }} /><span><strong>More than 14 days before the test:</strong> 75% refund of total test fee.</span></li>
                    <li className="flex gap-2.5"><span className="mt-[7px] w-2 h-2 rounded-full border-2 border-[#16130F] shrink-0" style={{ background: '#14837E' }} /><span><strong>Within 14 days but more than 2 days before the test:</strong> 50% refund.</span></li>
                    <li className="flex gap-2.5"><span className="mt-[7px] w-2 h-2 rounded-full border-2 border-[#16130F] shrink-0" style={{ background: '#14837E' }} /><span><strong>Within 2 days of the test date:</strong> 25% refund.</span></li>
                    <li className="flex gap-2.5"><span className="mt-[7px] w-2 h-2 rounded-full border-2 border-[#16130F] shrink-0" style={{ background: '#14837E' }} /><span><strong>On test day or after:</strong> No refund.</span></li>
                  </ul>
                </div>

                <div className="bg-white border-[3px] border-[#16130F] rounded-xl p-5 space-y-3 shadow-[4px_4px_0_#16130F]" style={{ borderTopWidth: 8, borderTopColor: '#B8285B' }}>
                  <h4 className="font-urbanist font-black text-[16px] text-[#16130F]">Cancelling IELTS One Skill Retake</h4>
                  <ul className="space-y-2 text-[13.5px] text-[#3D362E] leading-relaxed">
                    <li className="flex gap-2.5"><span className="mt-[7px] w-2 h-2 rounded-full border-2 border-[#16130F] shrink-0" style={{ background: '#B8285B' }} /><span><strong>At least 4 days before the test:</strong> 25% deducted as processing charge; remainder refunded.</span></li>
                    <li className="flex gap-2.5"><span className="mt-[7px] w-2 h-2 rounded-full border-2 border-[#16130F] shrink-0" style={{ background: '#B8285B' }} /><span><strong>Less than 4 days before the test:</strong> No refund.</span></li>
                  </ul>
                </div>
              </div>

              <SubHead hi="Date badlo" className="pt-4">5. IELTS Rescheduling &amp; Transfer Fees 2026</SubHead>
              <p>
                If you wish to reschedule your test date, you can do it by both online and offline methods. Your new test date must fall within 3 months of the original test date.
              </p>

              <InkTable>
                  <thead className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F]">
                    <tr>
                      <th className="py-3 px-4 font-extrabold uppercase text-[11.5px] tracking-wider">IELTS Test Type</th>
                      <th className="py-3 px-4 font-extrabold uppercase text-[11.5px] tracking-wider">Transfer Fee 2026</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#16130F]/10 text-[#3D362E]">
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">IELTS on Computer (Acad/GT)</td>
                      <td className="py-3 px-4 text-[#D0362E] font-black whitespace-nowrap">INR 4,750</td>
                    </tr>
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">IELTS on Paper (Acad/GT)</td>
                      <td className="py-3 px-4 text-[#D0362E] font-black whitespace-nowrap">INR 4,750</td>
                    </tr>
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">IELTS on Computer for UKVI</td>
                      <td className="py-3 px-4 text-[#D0362E] font-black whitespace-nowrap">INR 4,850</td>
                    </tr>
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">IELTS on Paper for UKVI</td>
                      <td className="py-3 px-4 text-[#D0362E] font-black whitespace-nowrap">INR 4,850</td>
                    </tr>
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">IELTS Life Skills (A1 and B1)</td>
                      <td className="py-3 px-4 text-[#D0362E] font-black whitespace-nowrap">INR 4,500</td>
                    </tr>
                    <tr className="hover:bg-[#FFF6E5]">
                      <td className="py-3 px-4 font-bold text-[#16130F]">One Skill Retake (OSR)</td>
                      <td className="py-3 px-4 text-[#D0362E] font-black whitespace-nowrap">INR 3,200</td>
                    </tr>
                  </tbody>
              </InkTable>

              <SubHead hi="Score bhejo" className="pt-4">6. IELTS Exam Fees for ATRF 2026</SubHead>
              <p>
                ATRF stands for <strong className="text-[#16130F]">Additional Test Report Form</strong>. ATRF is a way to officially convey your IELTS Scores to universities. You can send ATRF in three ways: courier, airmail or electronically.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-6">
                <div className="p-5 border-[3px] border-[#16130F] rounded-xl bg-[#14837E] text-white text-center space-y-1 shadow-[4px_4px_0_#16130F]" style={{ transform: 'rotate(-0.8deg)' }}>
                  <h4 className="font-urbanist font-black text-[16px]">First 5 ATRF</h4>
                  <p className="text-[#F2B705] text-[24px] font-urbanist font-black">No Cost</p>
                  <p className="text-[12px] text-white/85 font-semibold">Processed electronically at no additional charge.</p>
                </div>
                <div className="p-5 border-[3px] border-[#16130F] rounded-xl bg-[#F2B705] text-[#16130F] text-center space-y-1 shadow-[4px_4px_0_#16130F]" style={{ transform: 'rotate(0.8deg)' }}>
                  <h4 className="font-urbanist font-black text-[16px]">After First 5</h4>
                  <p className="text-[24px] font-urbanist font-black">INR 350 <span className="text-[13px] font-semibold text-[#3D362E]">per university</span></p>
                  <p className="text-[12px] text-[#3D362E] font-semibold">Note: You can send your scores to a maximum of 5 universities in a day.</p>
                </div>
              </div>

              <SubHead hi="Sabke sawaal" className="pt-6">Frequently Asked Questions (FAQs) - IELTS Fees</SubHead>
              <div className="space-y-3">
                {[
                  {
                    q: "Has the IELTS fees increased in 2026?",
                    a: "Yes. From April 2026 the standard IELTS fee for Academic and General Training in India is INR 19,000. IDP India has stopped offering IELTS on paper, so the test is now taken on computer."
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
                  <FaqItem key={index} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>

            {/* Additional Quick Actions Box */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-[#FFF1B8] border-[3px] border-[#16130F] rounded-xl p-5 sm:p-6 shadow-[4px_4px_0_#16130F]">
              <div>
                <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none">Live class</p>
                <h4 className="mt-1 font-urbanist font-black text-[17px] text-[#16130F]">Want to prepare for IELTS?</h4>
                <p className="mt-1 text-[13px] text-[#5B544A] leading-normal">Join our free live masterclasses and workshops to learn speaking & writing band templates from experts.</p>
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
                {["IELTS Practice Test", "IELTS Modules", "IELTS Dates"].map((title, i) => (
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
              <span className="text-[10.5px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: '#FFE08A' }}>Financial Aid</span>
              <h3 className="font-urbanist font-black text-[20px] leading-snug mb-2">
                10,000+ Global Scholarships
              </h3>
              <p className="text-[13px] text-white/90 leading-relaxed mb-5">
                Discover merit and need-based fee waivers to offset your exam and overseas study costs.
              </p>
              <Link
                to="/search-programs?highlight=scholarship"
                className="no-shine w-full text-center py-3 bg-white text-[#16130F] rounded-full border-2 border-[#16130F] text-[13px] font-bold hover:bg-[#FFF1B8] transition-colors flex items-center justify-center gap-1.5 shadow-[3px_3px_0_#16130F] cursor-pointer"
              >
                <span>Explore Scholarships</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="p-6 rounded-[14px] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] text-white" style={{ background: '#14837E', transform: 'rotate(0.6deg)' }}>
              <span className="text-[10.5px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: '#FFE08A' }}>Live Workshops</span>
              <h3 className="font-urbanist font-black text-[20px] leading-snug mb-2">
                Study Abroad Events &amp; Fairs
              </h3>
              <p className="text-[13px] text-white/90 leading-relaxed mb-5">
                Join live webinars, meet university delegates &amp; attend expert coaching masterclasses.
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
          hi="Paisa sahi jagah"
          text="Fees bharne se pehle plan clear karo. Free 1:1 call mein mentor se baat karo."
        />
      </div>
    </div>
  );
};

export default IELTSFeesPage;
