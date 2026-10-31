import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  MapPin,
  Monitor,
  PenLine,
  ArrowRight,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { API_BASE_URL } from '../../../../config';
import { HookBand, TimelineStrip } from '../../../../components/ui/Infographics';
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

const IELTSDatesPage = () => {
  const [dbBlogs, setDbBlogs] = React.useState([]);
  const [datesCity, setDatesCity] = useState('Bangalore');
  const [selectedState, setSelectedState] = useState('');
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

  const cityDatesData = {
    Bangalore: {
      state: 'Karnataka',
      acadComp: "All days of the week in September–December, except Wednesdays & public holidays.",
      acadPaper: { Sept: "06, 13, 18, 27", Oct: "04, 09, 18, 25", Nov: "01, 06, 15, 22", Dec: "06, 11, 20, 27" },
      gtComp: "All days of the week in September–December, except Wednesdays & public holidays.",
      gtPaper: { Sept: "13, 27", Oct: "04, 18", Nov: "06, 22", Dec: "06, 20, 27" },
      ukviAcadComp: "All days, except Tuesdays, Wednesdays & public holidays.",
      ukviAcadPaper: { Sept: "06, 27", Oct: "18", Nov: "01, 22", Dec: "11, 20" },
      ukviGtComp: "All days, except Tuesdays, Wednesdays & public holidays.",
      ukviGtPaper: { Sept: "27", Oct: "18", Nov: "22", Dec: "20" },
      lifeSkills: "Sept 11 | Oct 09, 16 | Nov 06, 20 | Dec 11"
    },
    Hyderabad: {
      state: 'Telangana',
      acadComp: "All days of the week in September–December, except Tuesdays, Wednesdays & public holidays.",
      acadPaper: { Sept: "06, 13, 18, 27", Oct: "04, 09, 18, 25", Nov: "01, 06, 15, 22", Dec: "06, 11, 20, 27" },
      gtComp: "All days of the week in September–December, except Tuesdays, Wednesdays & public holidays.",
      gtPaper: { Sept: "13, 27", Oct: "04, 18", Nov: "06, 22", Dec: "06, 20, 27" },
      ukviAcadComp: "All days, except Tuesdays, Wednesdays & public holidays.",
      ukviAcadPaper: { Sept: "06, 27", Oct: "18", Nov: "01, 22", Dec: "11, 20" },
      ukviGtComp: "All days, except Tuesdays, Wednesdays & public holidays.",
      ukviGtPaper: { Sept: "27", Oct: "18", Nov: "22", Dec: "20" },
      lifeSkills: "Sept 11 | Oct 09, 16 | Nov 06, 20 | Dec 11"
    },
    Ludhiana: {
      state: 'Punjab',
      acadComp: "All days of the week in September–December, except Tuesdays & public holidays.",
      acadPaper: { Sept: "06, 13, 18, 27", Oct: "04, 09, 18, 25", Nov: "01, 06, 15, 22", Dec: "06, 11, 20, 27" },
      gtComp: "All days of the week in September–December, except Tuesdays & public holidays.",
      gtPaper: { Sept: "13, 27", Oct: "04, 18", Nov: "06, 22", Dec: "06, 20, 27" },
      ukviAcadComp: "All days of the week in September–December, except Tuesdays & public holidays.",
      ukviAcadPaper: null,
      ukviGtComp: "All days of the week in September–December, except Tuesdays & public holidays.",
      ukviGtPaper: null,
      lifeSkills: "Only Computer-delivered slots available dynamically."
    },
    Chennai: {
      state: 'Tamil Nadu',
      acadComp: "All days of the week in September–December, except Tuesdays, Wednesdays & public holidays.",
      acadPaper: { Sept: "06, 13, 18, 27", Oct: "04, 09, 18, 25", Nov: "01, 06, 15, 22", Dec: "06, 11, 20, 27" },
      gtComp: "All days of the week in September–December, except Tuesdays, Wednesdays & public holidays.",
      gtPaper: { Sept: "13, 27", Oct: "04, 18", Nov: "06, 22", Dec: "06, 20, 27" },
      ukviAcadComp: "All days, except Tuesdays, Wednesdays & public holidays.",
      ukviAcadPaper: { Sept: "06, 27", Oct: "18", Nov: "01, 22", Dec: "11, 20" },
      ukviGtComp: "All days, except Tuesdays, Wednesdays & public holidays.",
      ukviGtPaper: { Sept: "27", Oct: "18", Nov: "22", Dec: "20" },
      lifeSkills: "Sept 04, 25 | Oct 09, 30 | Nov 13 | Dec 04, 25"
    },
    Mumbai: {
      state: 'Maharashtra',
      acadComp: "All days of the week in September–December, except Mondays, Wednesdays & public holidays.",
      acadPaper: { Sept: "06, 13, 18, 27", Oct: "04, 09, 18, 25", Nov: "01, 06, 15, 22", Dec: "06, 11, 20, 27" },
      gtComp: "All days of the week in September–December, except Mondays, Wednesdays & public holidays.",
      gtPaper: { Sept: "13, 27", Oct: "04, 18", Nov: "06, 22", Dec: "06, 20, 27" },
      ukviAcadComp: "All days, except Mondays, Wednesdays & public holidays.",
      ukviAcadPaper: { Sept: "13", Oct: "04, 25", Nov: "06, 22", Dec: "06, 27" },
      ukviGtComp: "All days, except Mondays, Wednesdays & public holidays.",
      ukviGtPaper: { Sept: "13", Oct: "04", Nov: "06, 22", Dec: "06, 27" },
      lifeSkills: "Sept 04, 25 | Oct 09, 30 | Nov 13 | Dec 04, 25"
    }
  };

  const currentData = cityDatesData[datesCity];

  return (
    <div className="min-h-screen bg-[#FFF6E5] pb-16 font-['Onest',sans-serif] text-[#16130F]">
      {/* ── HERO ── */}
      <DesiHero
        tone="teal"
        sign={{ hi: 'Tareekhein', en: 'IELTS DATES' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams' }, { label: 'IELTS' }, { label: 'IELTS Exam Dates' }]}
        title="IELTS Exam Dates in 2025: September to December"
        subtitle="Find Academic & General Training dates, slots, and schedules for top Indian test locations."
        stickers={(
          <>
            <Sticker tilt={-2}><BookOpen size={14} />IELTS Reference Guide</Sticker>
            <Sticker bg="#F2B705" tilt={1.5}><Monitor size={14} />Computer-Based</Sticker>
            <Sticker bg="#FBD9E6" tilt={-1}><PenLine size={14} />Paper-Based</Sticker>
            <Sticker bg="#FFD9C2" tilt={1}><Calendar size={14} />Sept–Dec</Sticker>
          </>
        )}
      />

      {/* ── GUIDE PICKER (phones and tablets) ── */}
      <div className="lg:hidden max-w-[1400px] mx-auto px-4 -mt-6 mb-8 relative z-10">
        <InkCard className="p-3">
          <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none px-1 mb-2">IELTS guide</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sidebarLinks.map((linkItem) => {
              const isActive = linkItem.key === 'dates';
              return (
                <Link
                  key={linkItem.key}
                  to={linkItem.path}
                  className={`px-3.5 py-2 rounded-full border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 ${isActive ? 'border-[#16130F] bg-[#14837E] text-white shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
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
                  const isActive = linkItem.key === 'dates';
                  return (
                    <Link
                      key={linkItem.key}
                      to={linkItem.path}
                      className={`group w-full text-left py-2 px-3 rounded-lg border-2 text-[13px] font-bold leading-normal flex items-center justify-between gap-2 transition-colors
                        ${isActive
                          ? 'border-[#16130F] bg-[#14837E] text-white shadow-[3px_3px_0_#16130F]'
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
                Ready to take the next step in your IELTS journey? In India, for the paper-delivered IELTS in September 2025, test dates are September 6, 13, 18, and 27, 2025. Some of these dates, like the 13th and 27th, offer both Academic and General Training, while others are Academic only. Computer-delivered IELTS tests are available much more frequently—almost daily at select locations.
              </p>

              <HookBand value="Jan–Mar" label="and June to August are high-demand months in India. Book about 1 month in advance." hi="Jaldi karo" />

              {/* Test Finder Dropdown */}
              <div className="bg-[#DDF3EF] border-[3px] border-[#16130F] rounded-[16px] p-4 sm:p-6 shadow-[5px_5px_0_#16130F]">
                <h4 className="font-urbanist font-black text-[17px] text-[#16130F] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full border-2 border-[#16130F] bg-[#14837E] text-white grid place-items-center shrink-0">
                    <Calendar size={16} />
                  </span>
                  <span>IELTS Test Centre Finder</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5B544A] mb-1.5">Select State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        const st = e.target.value;
                        setSelectedState(st);
                        if (st === 'Karnataka') setDatesCity('Bangalore');
                        else if (st === 'Telangana') setDatesCity('Hyderabad');
                        else if (st === 'Punjab') setDatesCity('Ludhiana');
                        else if (st === 'Tamil Nadu') setDatesCity('Chennai');
                        else if (st === 'Maharashtra') setDatesCity('Mumbai');
                      }}
                      className="w-full bg-white border-2 border-[#16130F] rounded-lg px-4 py-2.5 text-[13px] font-bold text-[#16130F] outline-none focus:shadow-[3px_3px_0_#14837E] cursor-pointer"
                    >
                      <option value="">-- Choose State --</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Maharashtra">Maharashtra</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#5B544A] mb-1.5">Select City</label>
                    <div className="flex flex-wrap gap-2">
                      {['Bangalore', 'Hyderabad', 'Ludhiana', 'Chennai', 'Mumbai'].map((ct) => (
                        <button
                          key={ct}
                          onClick={() => {
                            setDatesCity(ct);
                            setSelectedState(cityDatesData[ct].state);
                          }}
                          className={`no-shine px-3.5 py-1.5 rounded-full border-2 text-xs font-bold transition-colors cursor-pointer ${
                            datesCity === ct
                              ? 'border-[#16130F] bg-[#D0362E] text-white shadow-[2px_2px_0_#16130F]'
                              : 'border-[#16130F]/25 bg-white text-[#3D362E] hover:border-[#16130F]'
                          }`}
                        >
                          {ct}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* City Specific Date Section */}
              <div className="border-[3px] border-[#16130F] rounded-[16px] p-4 sm:p-6 bg-[#FFF6E5] space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-[#16130F33] pb-3">
                  <h3 className="font-urbanist font-black text-[18px] text-[#16130F] flex items-center gap-2">
                    <MapPin size={18} className="shrink-0 text-[#D0362E]" />
                    <span>IELTS Dates in {datesCity} ({currentData.state})</span>
                  </h3>
                  <span className="text-[10.5px] uppercase font-black tracking-wider bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] px-2.5 py-1 rounded-md shadow-[2px_2px_0_#16130F]">
                    Selected City
                  </span>
                </div>

                {/* Acad and GT Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Academic Box */}
                  <div className="bg-white border-[3px] border-[#16130F] rounded-xl p-5 space-y-4 shadow-[4px_4px_0_#16130F]" style={{ borderTopWidth: 8, borderTopColor: '#F2B705' }}>
                    <h4 className="font-urbanist font-black text-[16px] text-[#16130F] border-b-2 border-dashed border-[#16130F33] pb-2">Academic Module</h4>
                    <div className="space-y-3.5 text-[13px]">
                      <div>
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#5B544A] block mb-1">Computer-Based:</span>
                        <p className="font-semibold text-[#3D362E]">{currentData.acadComp}</p>
                      </div>
                      <div>
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#5B544A] block mb-1.5">Paper-Based Test Dates:</span>
                        <div className="grid grid-cols-2 gap-2 text-[12px] font-semibold text-[#3D362E]">
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Sept:</strong> {currentData.acadPaper.Sept}</p>
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Oct:</strong> {currentData.acadPaper.Oct}</p>
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Nov:</strong> {currentData.acadPaper.Nov}</p>
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Dec:</strong> {currentData.acadPaper.Dec}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* General Training Box */}
                  <div className="bg-white border-[3px] border-[#16130F] rounded-xl p-5 space-y-4 shadow-[4px_4px_0_#16130F]" style={{ borderTopWidth: 8, borderTopColor: '#14837E' }}>
                    <h4 className="font-urbanist font-black text-[16px] text-[#16130F] border-b-2 border-dashed border-[#16130F33] pb-2">General Training Module</h4>
                    <div className="space-y-3.5 text-[13px]">
                      <div>
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#5B544A] block mb-1">Computer-Based:</span>
                        <p className="font-semibold text-[#3D362E]">{currentData.gtComp}</p>
                      </div>
                      <div>
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#5B544A] block mb-1.5">Paper-Based Test Dates:</span>
                        <div className="grid grid-cols-2 gap-2 text-[12px] font-semibold text-[#3D362E]">
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Sept:</strong> {currentData.gtPaper.Sept}</p>
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Oct:</strong> {currentData.gtPaper.Oct}</p>
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Nov:</strong> {currentData.gtPaper.Nov}</p>
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Dec:</strong> {currentData.gtPaper.Dec}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UKVI and Life Skills Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="bg-white border-[3px] border-[#16130F] rounded-xl p-5 space-y-4 shadow-[4px_4px_0_#16130F] text-[13px]" style={{ borderTopWidth: 8, borderTopColor: '#B8285B' }}>
                    <h4 className="font-urbanist font-black text-[16px] text-[#16130F] border-b-2 border-dashed border-[#16130F33] pb-2">IELTS for UKVI (Academic &amp; GT)</h4>
                    <div>
                      <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#5B544A] block mb-1">Computer-Based UKVI:</span>
                      <p className="font-semibold text-[#3D362E]">{currentData.ukviAcadComp}</p>
                    </div>
                    {currentData.ukviAcadPaper ? (
                      <div>
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#5B544A] block mb-1">Paper-Based UKVI Academic:</span>
                        <div className="grid grid-cols-2 gap-1.5 text-[12px] font-semibold text-[#3D362E]">
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Sept:</strong> {currentData.ukviAcadPaper.Sept}</p>
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Oct:</strong> {currentData.ukviAcadPaper.Oct}</p>
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Nov:</strong> {currentData.ukviAcadPaper.Nov}</p>
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Dec:</strong> {currentData.ukviAcadPaper.Dec}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[12px] text-[#5B544A] italic">No paper-based UKVI Academic sessions scheduled.</p>
                    )}
                    {currentData.ukviGtPaper && (
                      <div className="pt-1">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#5B544A] block mb-1">Paper-Based UKVI GT:</span>
                        <div className="grid grid-cols-2 gap-1.5 text-[12px] font-semibold text-[#3D362E]">
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Sept:</strong> {currentData.ukviGtPaper.Sept}</p>
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Oct:</strong> {currentData.ukviGtPaper.Oct}</p>
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Nov:</strong> {currentData.ukviGtPaper.Nov}</p>
                          <p className="bg-[#FFF6E5] border-2 border-[#16130F]/15 rounded-md px-2 py-1"><strong className="text-[#16130F]">Dec:</strong> {currentData.ukviGtPaper.Dec}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white border-[3px] border-[#16130F] rounded-xl p-5 space-y-4 shadow-[4px_4px_0_#16130F] text-[13px]" style={{ borderTopWidth: 8, borderTopColor: '#D0362E' }}>
                    <h4 className="font-urbanist font-black text-[16px] text-[#16130F] border-b-2 border-dashed border-[#16130F33] pb-2">IELTS Life Skills</h4>
                    <div>
                      <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#5B544A] block mb-1">Test Dates (A1 &amp; B1):</span>
                      <p className="font-semibold text-[#3D362E] leading-relaxed">{currentData.lifeSkills}</p>
                    </div>
                    <p className="text-[11.5px] text-[#5B544A] leading-normal pt-1 font-semibold">
                      * The Life Skills test assesses speaking and listening skills at level A1 or B1 for UK family visa routes.
                    </p>
                  </div>
                </div>
              </div>

              <SubHead hi="Sahi date" className="pt-4">How to Select the Right Dates?</SubHead>
              <p>
                We recommend registering for your IELTS test <strong className="text-[#16130F]">at least 3 to 6 months before your target university application deadline</strong>. This leaves enough room for scheduling slot retakes if necessary or preparing visa materials early. High-demand months in India are January to March (Fall deadlines) and June to August. Booking 1 month in advance is highly recommended.
              </p>

              <div>
                <TimelineStrip
                  kicker="Plan backwards"
                  title="When to book and sit IELTS"
                  steps={[
                    { when: '1 month before test', what: 'Book your slot', note: 'Peak months fill fast' },
                    { when: '3–6 months before deadline', what: 'Take the test', note: 'Room for a retake and visa papers' },
                    { when: 'Deadline', what: 'University application deadline', highlight: true },
                  ]}
                />
              </div>

              <SubHead hi="Sabke sawaal" className="pt-6">Frequently Asked Questions (FAQs) - IELTS Dates</SubHead>
              <div className="space-y-3">
                {[
                  {
                    q: "What if I have to cancel the exam before five days due to an emergency?",
                    a: "If you submit a valid medical certificate or proof of extraordinary circumstances within 5 days of your exam, a refund may be granted, with local administrative costs deducted. Otherwise, cancellations under 9 days before the exam forfeit the standard refund policy."
                  },
                  {
                    q: "How often are the IELTS General Training tests conducted?",
                    a: "General Training tests in the computer format are conducted almost daily. Paper-based General Training exams are held twice a month (typically on specific Saturdays) at certified IDP test centres."
                  },
                  {
                    q: "Is IELTS General Training difficult?",
                    a: "The General Training test uses the same Listening and Speaking modules as the Academic exam, but the Reading and Writing tasks focus on general occupational and social survival skills rather than advanced academic texts, making it generally considered more approachable."
                  },
                  {
                    q: "How often are IELTS UKVI exams held?",
                    a: "Computer-delivered UKVI Academic and General Training tests are held multiple times a week. Paper-delivered UKVI exams are held 1–2 times a month at approved security-compliant test locations."
                  },
                  {
                    q: "What are the available UKVI exam dates 2025?",
                    a: "UKVI exam dates vary by location. In major cities like Bangalore, Hyderabad, Chennai, and Mumbai, paper-based dates fall on select Thursdays and Saturdays (e.g. Sept 6/13/27, Oct 4/18/25, Nov 1/6/22, Dec 6/11/20/27 depending on candidate load) and daily for computer formats."
                  },
                  {
                    q: "Which visa applications require IELTS UKVI?",
                    a: "IELTS UKVI is mandatory for Student Route visas at certain UK higher education institutions, work permits, and residency/migration pathways under the UK Home Office regulations."
                  },
                  {
                    q: "Can I change my IELTS UKVI exam dates 2025?",
                    a: "Yes. You can reschedule your IELTS UKVI test date online through the IDP portal by paying a transfer fee of INR 4,850, provided you request this change at least 15 days in advance."
                  },
                  {
                    q: "Can I use my IELTS UKVI scores for other purposes, such as university admission?",
                    a: "Yes. IELTS UKVI score sheets carry the same language assessments as regular IELTS Academic, so they are fully accepted by universities worldwide, whereas regular IELTS may not be accepted for certain UK foundation/pathway programs."
                  },
                  {
                    q: "How can you find the available dates for the IELTS Life Skills exams?",
                    a: "You can find Life Skills dates using the official IDP online registration portal by selecting the 'Life Skills A1/B1' option and looking up dates for Bangalore, Chennai, Hyderabad, and Mumbai."
                  },
                  {
                    q: "How can you book the IELTS Life Skills test?",
                    a: "You book online via the IDP IELTS India website. Select 'IELTS Life Skills' (A1 or B1), choose your preferred city and available date, upload passport scanned pages, and pay the registration fee of INR 18,000."
                  },
                  {
                    q: "How long is IELTS Life Skills valid?",
                    a: "Like all standard IELTS variants, the IELTS Life Skills test report is valid for 2 years from the date of the examination."
                  },
                  {
                    q: "How often are the IELTS Life Skills tests conducted?",
                    a: "IELTS Life Skills tests are held 1–2 times per month in major approved cities (like Chennai, Bangalore, Hyderabad, and Mumbai) where specialized administrative security conditions are met."
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
                <p className="mt-1 text-[13px] text-[#5B544A] leading-normal">Join upcoming live workshops and university webinars led by certified international mentors.</p>
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
                {["IELTS Test Centres", "IELTS Registration", "IELTS Slot Booking"].map((title, i) => (
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
              <span className="text-[10.5px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: '#FFE08A' }}>Live Fairs</span>
              <h3 className="font-urbanist font-black text-[20px] leading-snug mb-2">
                University Fairs &amp; Webinars
              </h3>
              <p className="text-[13px] text-white/90 leading-relaxed mb-5">
                Meet university delegates directly, understand intake deadlines, and get on-spot advice.
              </p>
              <Link
                to="/events"
                className="no-shine w-full text-center py-3 bg-white text-[#16130F] rounded-full border-2 border-[#16130F] text-[13px] font-bold hover:bg-[#FFF1B8] transition-colors flex items-center justify-center gap-1.5 shadow-[3px_3px_0_#16130F] cursor-pointer"
              >
                <span>Explore Live Fairs</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget: Trending Blogs & Guides */}
            <InkCard className="p-6 text-center" shadow="#F2B705">
              <div className="w-12 h-12 rounded-full bg-[#F2B705] border-2 border-[#16130F] flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0_#16130F]">
                <BookOpen size={22} className="text-[#16130F]" />
              </div>
              <h4 className="font-urbanist font-black text-[16px] text-[#16130F] mb-2">Study Abroad Blogs &amp; Guides</h4>
              <p className="text-[13px] text-[#5B544A] leading-relaxed mb-5">
                Read insider tips, country comparisons, exam strategies &amp; visa application roadmaps.
              </p>
              <Link
                to="/blogs"
                className="no-shine w-full text-center py-3 rounded-full border-2 border-[#16130F] bg-white text-[#16130F] text-[13px] font-bold hover:bg-[#FFF1B8] shadow-[3px_3px_0_#16130F] transition-colors block cursor-pointer"
              >
                Explore All Blogs
              </Link>
            </InkCard>

          </aside>

        </div>

        {/* Closing CTA */}
        <BookOkCta
          className="mt-14"
          hi="Sahi date chuno"
          text="Kaunsi date lein, deadline se pehle? Free 1:1 call mein mentor ke saath plan banao."
        />
      </div>
    </div>
  );
};

export default IELTSDatesPage;
