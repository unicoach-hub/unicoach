import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ArrowRight,
  ChevronDown,
  MapPin,
  Phone,
  Clock,
  Search,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { API_BASE_URL } from '../../../../config';
import { HookBand } from '../../../../components/ui/Infographics';
import { StepCounter } from '../../../../components/ui/BrandElements';
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
const GRID_LINK = 'group flex items-center justify-between gap-3 px-4 py-3 bg-white border-2 border-[#16130F] rounded-lg shadow-[2px_2px_0_#16130F] hover:bg-[#FBD9E6] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#16130F] transition-all';

const IELTSCoachingCentresPage = () => {
  const [dbBlogs, setDbBlogs] = React.useState([]);
  const [centreSearchQuery, setCentreSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
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

  const testCentresData = [
    {
      city: 'Bangalore',
      region: 'South',
      address: 'IDP Education India Pvt. Ltd., 2nd Floor, South Block, Raheja Towers, M.G. Road, Bangalore - 560001.',
      contact: '080-44118888',
      hours: '9:00 AM - 5:30 PM (Mon - Sat)'
    },
    {
      city: 'Hyderabad',
      region: 'South',
      address: 'IDP Education India Pvt. Ltd., 3rd Floor, Vasavi Eden Square, St. Johns Road, Secunderabad, Hyderabad - 500003.',
      contact: '040-44117777',
      hours: '9:00 AM - 5:30 PM (Mon - Sat)'
    },
    {
      city: 'Chennai',
      region: 'South',
      address: 'IDP Education India Pvt. Ltd., 1st Floor, Subasri, No. 6, Haddows Road, Nungambakkam, Chennai - 600006.',
      contact: '044-44116666',
      hours: '9:00 AM - 5:30 PM (Mon - Sat)'
    },
    {
      city: 'Mumbai',
      region: 'West',
      address: 'IDP Education India Pvt. Ltd., 1st Floor, Express Building, Opp. Churchgate Station, Mumbai - 400020.',
      contact: '022-44115555',
      hours: '9:00 AM - 5:30 PM (Mon - Sat)'
    },
    {
      city: 'Delhi',
      region: 'North',
      address: 'IDP Education India Pvt. Ltd., 5th Floor, IFCI Tower, 61, Nehru Place, New Delhi - 110019.',
      contact: '011-44119999',
      hours: '9:00 AM - 5:30 PM (Mon - Sat)'
    },
    {
      city: 'Ludhiana',
      region: 'North',
      address: 'IDP Education India Pvt. Ltd., 3rd Floor, SCO 122, Feroze Gandhi Market, Ludhiana - 141001.',
      contact: '0161-4411000',
      hours: '9:00 AM - 5:30 PM (Mon - Sat)'
    },
    {
      city: 'Amritsar',
      region: 'North',
      address: 'IDP Education India Pvt. Ltd., SCO 12, District Shopping Complex, Ranjit Avenue, Amritsar - 143001.',
      contact: '0183-4411000',
      hours: '9:00 AM - 5:30 PM (Mon - Sat)'
    },
    {
      city: 'Chandigarh',
      region: 'North',
      address: 'IDP Education India Pvt. Ltd., SCO 149-150, Sector 9-C, Madhya Marg, Chandigarh - 160009.',
      contact: '0172-4411000',
      hours: '9:00 AM - 5:30 PM (Mon - Sat)'
    },
    {
      city: 'Pune',
      region: 'West',
      address: 'IDP Education India Pvt. Ltd., Office No. 1, Ground Floor, Dnyaneshwar Paduka Chowk, F.C. Road, Shivaji Nagar, Pune - 411005.',
      contact: '020-44113333',
      hours: '9:00 AM - 5:30 PM (Mon - Sat)'
    },
    {
      city: 'Ahmedabad',
      region: 'West',
      address: 'IDP Education India Pvt. Ltd., 1st Floor, Zodiac Square, Opp. Gurudwara, S.G. Highway, Ahmedabad - 380054.',
      contact: '079-44112222',
      hours: '9:00 AM - 5:30 PM (Mon - Sat)'
    }
  ];

  const filteredCentres = testCentresData.filter(centre => {
    const matchesSearch = centre.city.toLowerCase().includes(centreSearchQuery.toLowerCase()) || 
                          centre.address.toLowerCase().includes(centreSearchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || centre.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });


  const renderLinkGrid = (hi, title, links) => (
    <div>
      <SubHead hi={hi}>{title}</SubHead>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {links.map((link) => (
          <Link key={link} to={getBlogLink(link)} className={GRID_LINK}>
            <span className="text-[13px] font-bold text-[#3D362E] group-hover:text-[#16130F]">{link}</span>
            <ArrowRight size={14} className="shrink-0 text-[#B8285B] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  );

  const REGION_TONE = { North: '#F2B705', West: '#14837E', South: '#D0362E' };

  // Station departure board of the IDP centre cities listed below
  const cityBoard = (
    <div className="bg-[#16130F] text-[#FFF6D6] border-[3px] border-[#16130F] shadow-[6px_6px_0_#F2B705] -rotate-1 max-w-[460px] lg:ml-auto overflow-hidden" style={{ borderRadius: 14 }}>
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F]">
        <div>
          <p className="font-urbanist font-extrabold text-[18px] leading-none">IDP centres</p>
          <p className="mt-1 font-['Anton',sans-serif] tracking-[0.12em] text-[12px] leading-none">IDP CENTRE BOARD</p>
        </div>
        <MapPin size={24} strokeWidth={2.4} />
      </div>
      <ul className="list-none m-0 p-0 divide-y divide-[#FFF6D6]/15">
        {testCentresData.map((centre) => (
          <li key={centre.city} className="flex items-center justify-between gap-3 px-5 py-2">
            <span className="font-['Anton',sans-serif] tracking-[0.1em] text-[15px] uppercase">{centre.city}</span>
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border-2 border-[#16130F]" style={{ background: REGION_TONE[centre.region], color: centre.region === 'North' ? '#16130F' : '#FFFFFF' }}>
              {centre.region}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF6E5] pb-20 font-['Onest',sans-serif] text-[#16130F] overflow-x-hidden">

      {/* Hero: rani poster band with the centre city board */}
      <DesiHero
        tone="rani"
        sign={{ hi: 'Pariksha kendra', en: 'TEST CENTRES' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams' }, { label: 'IELTS' }, { label: 'IELTS Test Centres' }]}
        title="IELTS Test Centres in India"
        subtitle="Find physical IDP test centres, contact numbers, directions, and regulations."
        stickers={(
          <>
            <Sticker tilt={-2}><FileText size={14} />IELTS Reference Guide</Sticker>
            <Sticker bg="#FCE38A" tilt={1.5}>North</Sticker>
            <Sticker bg="#DDF3EF" tilt={-1}>West</Sticker>
            <Sticker bg="#FCE3DA" tilt={1}>South</Sticker>
          </>
        )}
        aside={cityBoard}
      />

      {/* IELTS guide picker (phones and tablets) */}
      <div className="lg:hidden max-w-[1400px] mx-auto px-4 -mt-6 mb-8 relative z-10">
        <InkCard className="p-3">
          <p className="font-urbanist font-extrabold text-[14px] text-[#D0362E] leading-none px-1 mb-2">IELTS guide</p>
          <nav className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sidebarLinks.map((linkItem) => {
              const isActive = linkItem.key === 'coaching-centres';
              return (
                <Link
                  key={linkItem.key}
                  to={linkItem.path}
                  className={`px-3.5 py-2 rounded-full border-2 text-xs font-bold whitespace-nowrap flex-shrink-0 ${isActive ? 'bg-[#B8285B] text-white border-[#16130F] shadow-[2px_2px_0_#16130F]' : 'border-[#E6DCC8] bg-[#FFF6E5] text-[#5B544A]'}`}
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
                  const isActive = linkItem.key === 'coaching-centres';
                  return (
                    <Link
                      key={linkItem.key}
                      to={linkItem.path}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg border-2 text-[13px] font-bold transition-all leading-snug ${isActive ? 'bg-[#B8285B] text-white border-[#16130F] shadow-[3px_3px_0_#16130F]' : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
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
                The IELTS Test Centres offer both Paper-based and Computer-based IELTS Tests. The IELTS IDP India has 50+ IELTS test centres in 75 cities. You can book your IELTS test online through its official IELTS IDP India Website. For offline applications, you have to visit your nearest IDP branch.
              </p>

              <HookBand value="75" label="cities in India with 50+ IDP IELTS test centres between them" hi="Paas mein" />

              {/* Interactive Search & Region Selector */}
              <div className="bg-[#FBD9E6] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] p-5 sm:p-6 space-y-4" style={{ borderRadius: 14 }}>
                <h4 className="font-urbanist font-black text-[#16130F] text-[17px] flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full border-2 border-[#16130F] bg-[#B8285B] text-white grid place-items-center shrink-0"><MapPin size={15} /></span>
                  <span>IDP IELTS Centre Directory</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A7F70] pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by city or address..."
                      value={centreSearchQuery}
                      onChange={(e) => setCentreSearchQuery(e.target.value)}
                      className="w-full bg-white border-2 border-[#16130F] rounded-full pl-10 pr-4 py-2.5 text-[13px] font-semibold text-[#16130F] placeholder:text-[#8A7F70] outline-none focus:shadow-[3px_3px_0_#B8285B] transition-shadow"
                    />
                  </div>
                  <div className="flex gap-2">
                    {['All', 'North', 'West', 'South'].map((region) => (
                      <button
                        key={region}
                        onClick={() => setSelectedRegion(region)}
                        className={`flex-1 py-2.5 rounded-full border-2 border-[#16130F] text-[12.5px] font-bold transition-all ${
                          selectedRegion === region
                            ? 'bg-[#16130F] text-[#F2B705] shadow-[2px_2px_0_#B8285B]'
                            : 'bg-white text-[#3D362E] hover:bg-[#FFF1B8]'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filtered Centres List */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredCentres.length > 0 ? (
                  filteredCentres.map((centre, idx) => (
                    <div key={idx} className="bg-white border-[3px] border-[#16130F] overflow-hidden" style={{ borderRadius: 12, boxShadow: `4px 4px 0 ${REGION_TONE[centre.region]}` }}>
                      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b-[3px] border-[#16130F] bg-[#FFF6E5]">
                        <span className="font-urbanist font-black text-[#16130F] text-[16px]">{centre.city} Centre</span>
                        <span className="text-[10.5px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded border-2 border-[#16130F] whitespace-nowrap" style={{ background: REGION_TONE[centre.region], color: centre.region === 'North' ? '#16130F' : '#FFFFFF' }}>
                          {centre.region} Region
                        </span>
                      </div>
                      <div className="px-5 py-4 space-y-2.5">
                        <p className="text-[13px] text-[#3D362E] leading-relaxed">
                          <strong className="text-[#16130F]">Address: </strong>{centre.address}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] text-[#5B544A]">
                          <p className="flex items-start gap-1.5"><Phone size={14} className="mt-0.5 shrink-0 text-[#B8285B]" /><span><strong className="text-[#16130F]">Phone: </strong>{centre.contact}</span></p>
                          <p className="flex items-start gap-1.5"><Clock size={14} className="mt-0.5 shrink-0 text-[#B8285B]" /><span><strong className="text-[#16130F]">Hours: </strong>{centre.hours}</span></p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="xl:col-span-2 text-[13px] text-[#5B544A] font-semibold text-center py-5 border-[3px] border-dashed border-[#16130F]/40 rounded-xl bg-[#FFF6E5]">No test centres match your search criteria.</p>
                )}
              </div>

              <SubHead hi="Centre ke rules">Test Centre Regulations & Policies</SubHead>
              <p>
                Every candidate is expected to strictly follow IDP test regulations at physical exam venues:
              </p>

              <StepCounter
                className="not-prose"
                items={[
                  { label: 'Original passport', highlight: true },
                  { label: 'Devices in lockers' },
                  { label: 'Biometric check' },
                  { label: 'Draft sheets stay' },
                ]}
              />

              <div className="bg-[#FFF1B8] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] p-5 sm:p-6 space-y-3 my-6" style={{ borderRadius: 14 }}>
                <h4 className="font-urbanist font-black text-[#16130F] text-[17px] flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#B8285B]" />
                  Exam Hall Code of Conduct
                </h4>
                <ul className="space-y-2.5 text-[13.5px] text-[#3D362E] list-none p-0 m-0">
                  {[
                    <><strong className="text-[#16130F]">Mandatory Identification:</strong> You must present your original, valid passport. Fail to bring this, and you will not be allowed inside the test hall.</>,
                    <><strong className="text-[#16130F]">Banned Items:</strong> Personal electronic devices (phones, smartwatches, calculators, electronic dictionaries) are strictly prohibited. You must leave these in the secure lockers outside.</>,
                    <><strong className="text-[#16130F]">Security Check:</strong> Candidates go through biometric validation (fingerprint checks & digital photos) on-site before obtaining exam seat assignments.</>,
                    <><strong className="text-[#16130F]">Rough Work Sheet:</strong> You are provided draft sheets and writing materials by the test centre. Nothing can be taken out of the exam room at the end of the test.</>,
                  ].map((li, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span aria-hidden="true" className="mt-[7px] w-2.5 h-2.5 shrink-0 rounded-full border-2 border-[#16130F] bg-[#B8285B]" />
                      <span>{li}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <SubHead hi="Sawaal-Jawaab">Frequently Asked Questions (FAQs) - IELTS Centres</SubHead>
              <div className="space-y-3">
                {[
                  {
                    q: "How many IELTS exam centres are in India?",
                    a: "IDP IELTS India operates more than 50+ official test centres across 75+ cities in the country, providing easy local access to paper and computer tests."
                  },
                  {
                    q: "Which IELTS centre is best in India?",
                    a: "All IDP IELTS test centres follow standardized global quality guidelines. There is no score differences or administrative variation. We advise booking the centre closest to your residence to avoid long travel times on test day."
                  },
                  {
                    q: "Can I change my IELTS exam centre?",
                    a: "Yes. You can request a change of test venue through the IDP customer portal by paying a transfer fee (INR 4,750), provided the request is submitted at least 5 weeks (35 days) before your test date."
                  },
                  {
                    q: "Can I carry watch to the exam hall?",
                    a: "No watches are permitted. This includes smartwatches, analog wristwatches, and fitbits. Large digital clocks are visible inside the test room to track time."
                  },
                  {
                    q: "Can we use pen in paper-based IELTS writing?",
                    a: "No, writing and reading/listening modules in the paper exam must be completed using HB pencils provided by the center. Pens are strictly prohibited."
                  }
                ].map((faq, index) => (
                  <details key={index} className="group border-[3px] border-[#16130F] bg-white open:bg-[#FFF6E5] open:shadow-[4px_4px_0_#B8285B] shadow-[3px_3px_0_#16130F] transition-shadow" style={{ borderRadius: 12 }}>
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
            <div className="mt-10 p-5 sm:p-6 bg-[#DDF3EF] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center" style={{ borderRadius: 14 }}>
              <div>
                <p className="font-urbanist font-extrabold text-[14px] text-[#14837E] leading-none">Live session</p>
                <h4 className="mt-1 font-urbanist font-black text-[#16130F] text-[18px]">Want to prepare for IELTS?</h4>
                <p className="mt-1 text-[13px] text-[#5B544A] leading-normal">Join upcoming live workshops and university webinars led by certified international mentors.</p>
              </div>
              <Link
                to="/events"
                className="justify-self-start sm:justify-self-end px-5 py-3 bg-[#14837E] hover:bg-[#0F6B67] text-white rounded-full text-[13px] font-bold inline-flex items-center gap-1.5 border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] transition-colors whitespace-nowrap"
              >
                <span>Explore Live Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Next Up Section */}
            <div className="pt-2 mt-4">
              <SubHead hi="Aage padho">Next Up</SubHead>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['IELTS Slot Booking', 'IELTS Exam Fee', 'IELTS Exam Date'].map((title, i) => {
                  const tone = DESI_TONES[(i + 2) % 4];
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

            {/* Widget: Live Events */}
            <div className="p-6 bg-[#B8285B] text-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] relative overflow-hidden" style={{ borderRadius: 14 }}>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-full bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] text-[10.5px] font-extrabold uppercase tracking-wider">
                Admissions Fairs
              </span>
              <h3 className="font-urbanist font-black text-[20px] leading-snug mb-2">
                Global University Fairs
              </h3>
              <p className="text-[13px] text-white/85 leading-relaxed mb-5">
                Interact directly with official delegates from top UK, USA, Canada, and Australian universities.
              </p>
              <Link
                to="/events"
                className="w-full text-center py-3 bg-white text-[#16130F] rounded-full text-[13px] font-bold border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] hover:bg-[#FFF1B8] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Explore Live Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget: AI University Matcher */}
            <InkCard className="p-6 text-center" shadow="#14837E">
              <div className="w-12 h-12 rounded-full bg-[#14837E] border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={22} className="text-white" />
              </div>
              <h4 className="font-urbanist font-black text-[#16130F] text-[16px] mb-2">AI University Matcher</h4>
              <p className="text-[13px] text-[#5B544A] leading-relaxed mb-5">
                Match universities according to your target test score, desired intake & profile.
              </p>
              <Link
                to="/ai-tools"
                className="w-full text-center py-3 bg-[#FFF6E5] border-2 border-[#16130F] text-[#16130F] rounded-full text-[13px] font-bold hover:bg-[#FFF1B8] transition-colors block"
              >
                Find Best Match
              </Link>
            </InkCard>

          </aside>

        </div>

        {/* Closing CTA */}
        <BookOkCta
          className="mt-14"
          hi="Book OK Please"
          text="Centre to mil gaya. Ab taiyari ka plan banate hain. Free call, 1:1, ek ghante ki baat."
          cta="Free call book karo"
        />
      </div>
    </div>
  );
};

export default IELTSCoachingCentresPage;
