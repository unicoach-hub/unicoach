import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  FileText,
  ArrowRight,
  ChevronDown,
  Monitor,
  Building2,
  Phone,
  Sparkles,
  Ticket,
  AlertTriangle
} from 'lucide-react';
import { API_BASE_URL } from '../../../../config';
import { HookBand } from '../../../../components/ui/Infographics';
import { JourneyPills } from '../../../../components/ui/BrandElements';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../../components/desi/desiTokens';
import { BookOkCta } from '../../../../components/desi/BookOkCta';

// Hindi kicker + h3 for sections inside the guide column
const SubHead = ({ hi, children }) => (
  <div className="mt-10 mb-4">
    <p className="font-urbanist font-extrabold text-[15px] leading-none text-[#D0362E]">{hi}</p>
    <h3 className="mt-1.5 font-urbanist font-black text-[21px] sm:text-[24px] leading-tight tracking-[-0.02em] text-[#16130F]">{children}</h3>
  </div>
);

// Ink pill link used in the IELTS link grids
const GRID_LINK = 'group flex items-center justify-between gap-3 px-4 py-3 bg-white border-2 border-[#16130F] rounded-lg shadow-[2px_2px_0_#16130F] hover:bg-[#DDF3EF] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#16130F] transition-all';

// Railway-ticket reservation slip for the hero (facts taken from the guide below)
const ReservationSlip = () => (
  <div className="relative bg-[#FFF6D6] text-[#16130F] border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] rotate-[1.5deg] max-w-[460px] lg:ml-auto" style={{ borderRadius: 14 }}>
    {/* ticket punch holes */}
    <span aria-hidden="true" className="absolute -left-[12px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#14837E] border-[3px] border-[#16130F]" />
    <span aria-hidden="true" className="absolute -right-[12px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#14837E] border-[3px] border-[#16130F]" />
    <div className="flex items-center justify-between gap-3 px-5 py-3 border-b-[3px] border-dashed border-[#16130F] bg-[#F2B705]" style={{ borderTopLeftRadius: 11, borderTopRightRadius: 11 }}>
      <div>
        <p className="font-urbanist font-extrabold text-[18px] leading-none">Booking slip</p>
        <p className="mt-1 font-['Anton',sans-serif] tracking-[0.12em] text-[12px] leading-none">RESERVATION SLIP</p>
      </div>
      <Ticket size={26} strokeWidth={2.4} />
    </div>
    <dl className="grid grid-cols-2 gap-px bg-[#16130F]/15 text-[13px]">
      {[
        { k: 'Modes', v: 'Online · In-Person · Telephone', wide: true },
        { k: 'Reschedule notice', v: '35 days' },
        { k: 'Transfer fee', v: 'INR 4,750' },
        { k: 'Helpline', v: '1800 102 4544' },
        { k: 'Test day ID', v: 'Original passport' },
      ].map((row) => (
        <div key={row.k} className={`bg-[#FFF6D6] px-5 py-3 ${row.wide ? 'col-span-2' : ''}`}>
          <dt className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#5B544A]">{row.k}</dt>
          <dd className="mt-0.5 font-urbanist font-black text-[15px] leading-tight">{row.v}</dd>
        </div>
      ))}
    </dl>
    <div className="px-5 py-2.5 border-t-[3px] border-dashed border-[#16130F] flex items-center justify-between text-[11px] font-bold text-[#5B544A]">
      <span className="font-['Anton',sans-serif] tracking-[0.18em] text-[#16130F]">IDP · IELTS INDIA</span>
      <span className="font-urbanist font-extrabold text-[14px] text-[#D0362E]">Happy journey</span>
    </div>
  </div>
);

const IELTSSlotBookingPage = () => {
  const [dbBlogs, setDbBlogs] = React.useState([]);
  const [checklist, setChecklist] = useState({
    passportFront: false,
    passportBack: false,
    signature: false,
    disabilityCert: false,
    paymentReady: false
  });
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

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };


  const renderLinkGrid = (hi, title, links) => (
    <div>
      <SubHead hi={hi}>{title}</SubHead>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {links.map((link) => (
          <Link key={link} to={getBlogLink(link)} className={GRID_LINK}>
            <span className="text-[13px] font-bold text-[#3D362E] group-hover:text-[#16130F]">{link}</span>
            <ArrowRight size={14} className="shrink-0 text-[#14837E] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF6E5] pb-20 font-['Onest',sans-serif] text-[#16130F] overflow-x-hidden">

      {/* Hero: teal poster band with the reservation slip */}
      <DesiHero
        tone="teal"
        sign={{ hi: 'Aarakshan', en: 'SLOT BOOKING' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams' }, { label: 'IELTS' }, { label: 'IELTS Slot Booking' }]}
        title="IELTS Slot Booking Guide"
        subtitle="Step-by-step guidelines for reserving test slots online, documents checklists, and policy details."
        stickers={(
          <>
            <Sticker tilt={-2}><FileText size={14} />IELTS Reference Guide</Sticker>
            <Sticker bg="#FCE38A" tilt={1.5}><Monitor size={14} />Online</Sticker>
            <Sticker tilt={-1}><Building2 size={14} />In-Person</Sticker>
            <Sticker bg="#FBD9E6" tilt={1}><Phone size={14} />Telephone</Sticker>
          </>
        )}
        aside={<ReservationSlip />}
      />

      {/* IELTS guide picker (phones and tablets) */}
      <div className="lg:hidden max-w-[1400px] mx-auto px-4 -mt-6 mb-8 relative z-10">
        <InkCard className="p-3">
          <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none px-1 mb-2">IELTS guide</p>
          <nav className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sidebarLinks.map((linkItem) => {
              const isActive = linkItem.key === 'slot-booking';
              return (
                <Link
                  key={linkItem.key}
                  to={linkItem.path}
                  className={`px-3.5 py-2 rounded-full border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 ${isActive ? 'bg-[#14837E] text-white border-[#16130F] shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
                >
                  {linkItem.name}
                </Link>
              );
            })}
          </nav>
        </InkCard>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:pt-12">

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)_230px] xl:grid-cols-[250px_minmax(0,1fr)_290px] gap-6 lg:gap-7 items-start">

          {/* Left Sidebar Links */}
          <aside className="hidden lg:block sticky top-28">
            <InkCard className="p-4 max-h-[calc(100vh-140px)] overflow-y-auto">
              <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">IELTS guide</p>
              <h3 className="mt-1 mb-3 font-urbanist font-black text-[16px]">IELTS Guide Index</h3>
              <nav className="flex flex-col gap-1.5">
                {sidebarLinks.map((linkItem) => {
                  const isActive = linkItem.key === 'slot-booking';
                  return (
                    <Link
                      key={linkItem.key}
                      to={linkItem.path}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg border-2 text-[13px] font-bold transition-all leading-snug ${isActive ? 'bg-[#14837E] text-white border-[#16130F] shadow-[3px_3px_0_#16130F]' : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
                    >
                      <span>{linkItem.name}</span>
                      <ArrowRight size={13} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  );
                })}
              </nav>
            </InkCard>
          </aside>

          {/* Center Content Section */}
          <main className="min-w-0 bg-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] p-5 sm:p-8 md:p-10" style={{ borderRadius: 14 }}>
            <DesiHeading hi="Poori jaankari" className="pb-5 mb-6 border-b-[3px] border-dashed border-[#16130F]/25">Detailed Guide Content</DesiHeading>
            <div className="space-y-5 text-[#3D362E] text-[15px] leading-relaxed">
              <p>
                Have you decided to take the IELTS exam, or are you still planning to? Then, you should know how to book your test slot to sit for the exam. IELTS is one of the most popular English language proficiency tests, trusted by over 12,000 organisations globally in countries such as the US, UK, Australia, Canada, Ireland, and Germany.
              </p>
              <p>
                Whether you prefer the traditional offline method or the comfort of your home with the online option, IELTS offers this flexibility. You can easily book your IELTS slot through the official IDP IELTS India website.
              </p>

              <SubHead hi="Booking ke tareeke">1. IELTS Slot Booking: Registration Modes</SubHead>
              <p>
                To sit for the IELTS test, candidates have to reserve their spots through one of three primary registration modes:
              </p>

              <JourneyPills
                className="not-prose"
                steps={[
                  { label: 'Format', sub: 'Exam format' },
                  { label: 'Date & City', sub: 'Dates, location' },
                  { label: 'Details', sub: 'Fill your info' },
                  { label: 'Passport', sub: 'Upload scan' },
                  { label: 'Pay', sub: 'Net Banking, Card, Paytm' },
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                {[
                  {
                    icon: Monitor,
                    title: 'Online Mode',
                    body: (
                      <>Visit the official <a href="https://www.ieltsidpindia.com" target="_blank" rel="noopener noreferrer" className="font-bold text-[#14837E] underline decoration-2 underline-offset-2 hover:text-[#16130F]">ieltsidpindia.com</a> portal. Choose your exam format, dates, location, fill in details, upload scanned passport, and pay via Net Banking, Debit/Credit Card, or Paytm.</>
                    ),
                  },
                  {
                    icon: Building2,
                    title: 'In-Person (Offline)',
                    body: 'Visit your nearest IDP IELTS branch office. Fill out the physical application, provide physical passport copies (front + back pages), and pay via bank deposit slip at HDFC/ICICI branches or Demand Draft.',
                  },
                  {
                    icon: Phone,
                    title: 'Telephone Support',
                    body: (
                      <>Contact the IDP customer care line at <strong className="text-[#16130F]">1800 102 4544</strong> or email <strong className="text-[#16130F] break-all">ielts.india@idp.com</strong> for assistance through registration procedures and branch locations.</>
                    ),
                  },
                ].map((mode, i) => {
                  const tone = DESI_TONES[(i + 1) % 4];
                  const Icon = mode.icon;
                  return (
                    <div key={mode.title} className="p-5 border-[3px] border-[#16130F] bg-white space-y-2.5" style={{ borderRadius: 12, boxShadow: `4px 4px 0 ${tone.c}` }}>
                      <span className="w-10 h-10 rounded-full border-2 border-[#16130F] grid place-items-center shadow-[2px_2px_0_#16130F]" style={{ background: tone.c, color: tone.fg }}>
                        <Icon size={18} />
                      </span>
                      <h4 className="font-urbanist font-black text-[#16130F] text-[16px]">{mode.title}</h4>
                      <p className="text-[13px] text-[#5B544A] leading-relaxed">{mode.body}</p>
                    </div>
                  );
                })}
              </div>

              {/* Document Checklist Widget */}
              <div className="bg-[#DDF3EF] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] p-5 sm:p-6 my-6" style={{ borderRadius: 14 }}>
                <h4 className="font-urbanist font-black text-[#16130F] text-[17px] mb-1.5 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full border-2 border-[#16130F] bg-[#14837E] text-white grid place-items-center shrink-0"><FileText size={15} /></span>
                  <span>Interactive Registration Documents Checklist</span>
                </h4>
                <p className="text-[13px] text-[#5B544A] mb-4 font-medium">Check off these items as you gather them before starting your online slot booking:</p>
                <div className="space-y-2.5">
                  {[
                    { key: 'passportFront', label: 'Valid Passport Front Page (clear color scan containing photo & details)' },
                    { key: 'passportBack', label: 'Valid Passport Back Page (clear color scan containing address details)' },
                    { key: 'signature', label: 'Signature Declaration (signed exactly as per the signature on your passport)' },
                    { key: 'disabilityCert', label: 'Disability Certificate / Medical Accommodation Request (if applicable)' },
                    { key: 'paymentReady', label: 'Payment Method Ready (Net Banking, Card, Paytm, or demand draft details)' }
                  ].map((item) => (
                    <label key={item.key} className={`flex items-start gap-3 cursor-pointer text-[13px] font-semibold select-none px-3.5 py-3 border-2 border-[#16130F] rounded-lg transition-colors ${checklist[item.key] ? 'bg-[#FFF6E5]' : 'bg-white hover:bg-[#FFF1B8]'}`}>
                      <input
                        type="checkbox"
                        checked={checklist[item.key]}
                        onChange={() => toggleCheck(item.key)}
                        className="mt-0.5 w-4 h-4 shrink-0 accent-[#14837E] cursor-pointer"
                      />
                      <span className={checklist[item.key] ? 'line-through text-[#8A7F70] font-medium' : 'text-[#3D362E]'}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <SubHead hi="Date badalni hai?">2. IELTS Slot Rescheduling & Cancellation Rules</SubHead>
              <p>
                Plans can change, and IDP allows rescheduling or cancellation of slots under specific guidelines:
              </p>

              <HookBand value="35 days" label="minimum notice to reschedule (INR 4,750 fee). Any later counts as a cancellation." hi="Dhyaan do" />

              <div className="bg-[#FFF1B8] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] p-5 sm:p-6 space-y-3 my-6" style={{ borderRadius: 14 }}>
                <h4 className="font-urbanist font-black text-[#16130F] text-[17px] flex items-center gap-2">
                  <AlertTriangle size={18} className="text-[#D0362E]" />
                  Rescheduling Policies
                </h4>
                <ul className="space-y-2.5 text-[13.5px] text-[#3D362E] list-none p-0 m-0">
                  {[
                    <><strong className="text-[#16130F]">Time Window:</strong> Rescheduling requests must be made <strong className="text-[#16130F]">at least 5 weeks (35 days) before</strong> your scheduled test date.</>,
                    <><strong className="text-[#16130F]">Rescheduling Fee:</strong> A transfer processing fee of <strong className="text-[#16130F]">INR 4,750</strong> (INR 4,850 for UKVI) will be charged.</>,
                    <><strong className="text-[#16130F]">Late Rescheduling:</strong> Requesting a change under 35 days before the test date is treated as a cancellation, and you forfeit the complete registration fee.</>,
                    <><strong className="text-[#16130F]">Extraordinary Circumstances:</strong> Late rescheduling or refund is only permitted in verified cases of serious illness, bereavement, or national emergencies, with complete documentary evidence submitted to IDP within 5 days of the test date.</>,
                  ].map((li, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-[7px] w-2.5 h-2.5 shrink-0 rounded-full border-2 border-[#16130F] bg-[#D0362E]" />
                      <span>{li}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <SubHead hi="Sawaal-Jawaab">Frequently Asked Questions (FAQs) - Slot Booking</SubHead>
              <div className="space-y-3">
                {[
                  {
                    q: "How to book IELTS slots?",
                    a: "You can book IELTS slots online by visiting the IDP India website, selecting the test type (Academic/GT), chosen format (computer/paper), test city, and preferred dates. Alternatively, you can register offline by visiting an IDP branch."
                  },
                  {
                    q: "How to book IELTS slots offline?",
                    a: "Visit your nearest IDP branch office. Fill out the registration form, submit signed declarations, upload/provide photocopies of your valid passport (front & back pages), and pay the test fee via Demand Draft or bank deposit slip."
                  },
                  {
                    q: "What is the contact information for IDP IELTS support?",
                    a: "You can reach IDP IELTS India customer care at 1800 102 4544 (Monday to Saturday, 9:00 AM to 6:00 PM) or write to them via email at ielts.india@idp.com."
                  },
                  {
                    q: "Can I choose my speaking test slot separately?",
                    a: "Yes. For computer-delivered tests, speaking slots are generally booked at the same time as the main exam. For paper-delivered tests, you can choose your preferred speaking date and time window online up to 10-12 days before the main L/R/W test date."
                  },
                  {
                    q: "What documents are required on the test day?",
                    a: "You must bring the original, valid passport that you used during registration. Photocopies, digital copies, or other ID cards are strictly not accepted, and you will be barred from taking the exam with no refund."
                  },
                  {
                    q: "What happens if I miss my scheduled IELTS test slot?",
                    a: "If you miss your slot, you will be marked absent, and the entire test fee is forfeited. Refunds or free rescheduling are only granted for extreme medical emergencies with official doctor certification submitted within 5 days."
                  }
                ].map((faq, index) => (
                  <details key={index} className="group border-[3px] border-[#16130F] bg-white open:bg-[#FFF6E5] open:shadow-[4px_4px_0_#14837E] shadow-[3px_3px_0_#16130F] transition-shadow" style={{ borderRadius: 12 }}>
                    <summary className="font-urbanist font-extrabold text-[#16130F] cursor-pointer flex justify-between items-center gap-3 list-none select-none text-[15px] px-5 py-4 [&::-webkit-details-marker]:hidden">
                      <span>{faq.q}</span>
                      <span className="w-7 h-7 shrink-0 rounded-full border-2 border-[#16130F] bg-[#F2B705] grid place-items-center transition-transform duration-200 group-open:rotate-180">
                        <ChevronDown size={15} />
                      </span>
                    </summary>
                    <div className="px-5 pb-5 -mt-1 text-[#5B544A] text-[14px] leading-relaxed">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Additional Quick Actions Box */}
            <div className="mt-10 p-5 sm:p-6 bg-[#FBD9E6] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center" style={{ borderRadius: 14 }}>
              <div>
                <p className="font-urbanist font-extrabold text-[14px] text-[#B8285B] leading-none">Live session</p>
                <h4 className="mt-1 font-urbanist font-black text-[#16130F] text-[18px]">Want to prepare for IELTS?</h4>
                <p className="mt-1 text-[13px] text-[#5B544A] leading-normal">Join upcoming live workshops and university webinars led by certified international mentors.</p>
              </div>
              <Link
                to="/events"
                className="justify-self-start sm:justify-self-end px-5 py-3 bg-[#B8285B] hover:bg-[#9E1F4C] text-white rounded-full text-[13px] font-bold inline-flex items-center gap-1.5 border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] transition-colors whitespace-nowrap"
              >
                <span>Explore Live Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Next Up Section */}
            <div className="pt-2 mt-4">
              <SubHead hi="Aage padho">Next Up</SubHead>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['IELTS Test Centres', 'IELTS Exam Fee', 'IELTS Exam Date'].map((title, i) => {
                  const tone = DESI_TONES[i % 4];
                  return (
                    <Link key={title} to={getBlogLink(title)} className="group flex flex-col justify-between bg-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#16130F] transition-all overflow-hidden" style={{ borderRadius: 12 }}>
                      <span className="h-3 border-b-[3px] border-[#16130F]" style={{ background: tone.c }} />
                      <span className="p-5 flex flex-col gap-4">
                        <span className="font-urbanist font-black text-[#16130F] text-[16px]">{title}</span>
                        <span className="text-[13px] font-bold text-[#D0362E] flex items-center gap-1">
                          Read Now <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* IELTS Link Grids */}
            <div className="mt-6 space-y-2">
              {renderLinkGrid('Zaroori info', 'IELTS Important Information', importantInfoLinks)}
              {renderLinkGrid('Kahan chalta hai', 'IELTS Accepting Countries', acceptingCountriesLinks)}
              {renderLinkGrid('University', 'IELTS Accepting Universities', acceptingUniversitiesLinks)}
              {renderLinkGrid('Shehar aur date', 'IELTS Test Centre and Dates in India', testCentresLinks)}
            </div>

          </main>

          {/* Right Sidebar Widgets */}
          <aside className="lg:sticky lg:top-28 space-y-6">

            {/* Widget: AI Shortlister */}
            <div className="p-6 bg-[#14837E] text-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] relative overflow-hidden" style={{ borderRadius: 14 }}>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-full bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] text-[10.5px] font-extrabold uppercase tracking-wider">
                <Sparkles size={12} />AI Shortlister
              </span>
              <h3 className="font-urbanist font-black text-[20px] leading-snug mb-2">
                Match Unis by Band Score
              </h3>
              <p className="text-[13px] text-white/85 leading-relaxed mb-5">
                Check which top global universities accept your target IELTS band score instantly.
              </p>
              <Link
                to="/ai-tools"
                className="w-full text-center py-3 bg-white text-[#16130F] rounded-full text-[13px] font-bold border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] hover:bg-[#FFF1B8] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Try AI Shortlister</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget: Live Events & Fairs */}
            <InkCard className="p-6 text-center" shadow="#F2B705">
              <div className="w-12 h-12 rounded-full bg-[#F2B705] border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] flex items-center justify-center mx-auto mb-4">
                <Calendar size={22} className="text-[#16130F]" />
              </div>
              <h4 className="font-urbanist font-black text-[#16130F] text-[16px] mb-2">Live Education Fairs</h4>
              <p className="text-[13px] text-[#5B544A] leading-relaxed mb-5">
                Meet representatives from top global universities & join free masterclasses.
              </p>
              <Link
                to="/events"
                className="w-full text-center py-3 bg-[#FFF6E5] border-2 border-[#16130F] text-[#16130F] rounded-full text-[13px] font-bold hover:bg-[#FFF1B8] transition-colors block"
              >
                View Upcoming Events
              </Link>
            </InkCard>

          </aside>

        </div>

        {/* Closing CTA */}
        <BookOkCta
          className="mt-14"
          hi="Book OK Please"
          text="Slot pakka ho gaya? Ab band score ka plan bhi bana lo. Free call, 1:1, mentor ke saath."
          cta="Free call book karo"
        />
      </div>
    </div>
  );
};

export default IELTSSlotBookingPage;
