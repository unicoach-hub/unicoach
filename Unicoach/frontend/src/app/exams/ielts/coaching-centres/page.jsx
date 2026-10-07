import React, { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="hover:text-indigo-600 transition-colors">Exams</span>
          <ChevronRight size={12} />
          <span className="text-slate-655">IELTS</span>
          <ChevronRight size={12} />
          <span className="text-slate-600">IELTS Test Centres</span>
        </div>

        {/* Title Header Card */}
        <div className="relative bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-955">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              IELTS Reference Guide
            </span>
            <h1 className="text-2xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              IELTS Test Centres in India
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed font-semibold">
              Find physical IDP test centres, contact numbers, directions, and regulations.
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
                const isActive = linkItem.key === 'coaching-centres';
                return (
                  <Link
                    key={linkItem.key}
                    to={linkItem.path}
                    className={`w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition-all leading-normal flex items-center justify-between
                      ${isActive
                        ? 'bg-indigo-50 text-indigo-655'
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
                The IELTS Test Centres offer both Paper-based and Computer-based IELTS Tests. The IELTS IDP India has 50+ IELTS test centres in 75 cities. You can book your IELTS test online through its official IELTS IDP India Website. For offline applications, you have to visit your nearest IDP branch.
              </p>

              {/* Interactive Search & Region Selector */}
              <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-6 space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <MapPin size={18} className="text-indigo-655" />
                  <span>IDP IELTS Centre Directory</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Search by city or address..."
                    value={centreSearchQuery}
                    onChange={(e) => setCentreSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2">
                    {['All', 'North', 'West', 'South'].map((region) => (
                      <button
                        key={region}
                        onClick={() => setSelectedRegion(region)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          selectedRegion === region
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filtered Centres List */}
              <div className="space-y-4">
                {filteredCentres.length > 0 ? (
                  filteredCentres.map((centre, idx) => (
                    <div key={idx} className="p-5 border border-slate-100 rounded-2xl bg-white shadow-xs space-y-2.5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                        <span className="font-black text-slate-905 text-sm">{centre.city} Centre</span>
                        <span className="text-[9px] uppercase font-black tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                          {centre.region} Region
                        </span>
                      </div>
                      <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                        <strong>Address: </strong>{centre.address}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-500 font-semibold">
                        <p>📞 <strong>Phone: </strong>{centre.contact}</p>
                        <p>🕒 <strong>Hours: </strong>{centre.hours}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-4">No test centres match your search criteria.</p>
                )}
              </div>

              <h3 className="text-lg font-black text-slate-900 mt-8 mb-4">Test Centre Regulations & Policies</h3>
              <p>
                Every candidate is expected to strictly follow IDP test regulations at physical exam venues:
              </p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4 my-6">
                <h4 className="font-extrabold text-slate-850 text-sm">Exam Hall Code of Conduct</h4>
                <ul className="list-disc list-inside space-y-2.5 text-xs text-slate-550 pl-2 font-semibold">
                  <li><strong>Mandatory Identification:</strong> You must present your original, valid passport. Fail to bring this, and you will not be allowed inside the test hall.</li>
                  <li><strong>Banned Items:</strong> Personal electronic devices (phones, smartwatches, calculators, electronic dictionaries) are strictly prohibited. You must leave these in the secure lockers outside.</li>
                  <li><strong>Security Check:</strong> Candidates go through biometric validation (fingerprint checks & digital photos) on-site before obtaining exam seat assignments.</li>
                  <li><strong>Rough Work Sheet:</strong> You are provided draft sheets and writing materials by the test centre. Nothing can be taken out of the exam room at the end of the test.</li>
                </ul>
              </div>

              <h3 className="text-lg font-black text-slate-900 mt-12 mb-6">Frequently Asked Questions (FAQs) - IELTS Centres</h3>
              <div className="space-y-4">
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
                  <details key={index} className="group border border-slate-200 rounded-2xl bg-white hover:border-indigo-150 transition-all duration-200 p-5">
                    <summary className="font-extrabold text-slate-805 cursor-pointer flex justify-between items-center list-none select-none text-sm">
                      <span>{faq.q}</span>
                      <span className="transition-transform duration-200 group-open:rotate-180 text-slate-400">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-3.5 text-slate-655 text-xs leading-relaxed font-semibold">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Additional Quick Actions Box */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-extrabold text-slate-855 text-sm mb-1">Want to prepare for IELTS?</h4>
                <p className="text-xs text-slate-500 leading-normal font-normal">Join upcoming live workshops and university webinars led by certified international mentors.</p>
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
                <Link to={getBlogLink("IELTS Slot Booking")} className="flex flex-col justify-between p-5 bg-white border border-slate-100 border-l-4 border-l-emerald-500 rounded-xl hover:shadow-md transition-all group">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-4 group-hover:text-indigo-655 transition-colors">IELTS Slot Booking</h4>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    Read Now <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
                <Link to={getBlogLink("IELTS Exam Fee")} className="flex flex-col justify-between p-5 bg-white border border-slate-100 border-l-4 border-l-sky-500 rounded-xl hover:shadow-md transition-all group">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-4 group-hover:text-indigo-655 transition-colors">IELTS Exam Fee</h4>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    Read Now <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
                <Link to={getBlogLink("IELTS Exam Date")} className="flex flex-col justify-between p-5 bg-white border border-slate-100 border-l-4 border-l-amber-500 rounded-xl hover:shadow-md transition-all group">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-4 group-hover:text-indigo-655 transition-colors">IELTS Exam Date</h4>
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
            
            {/* Widget: Live session */}
            {/* Widget: Live Events */}
            <div className="bg-gradient-to-r from-[#111111] via-[#10319E] to-[#111111] text-white p-6 rounded-2xl shadow-md border border-blue-900/40 relative overflow-hidden">
              <span className="text-[9px] font-bold text-orange-200 uppercase tracking-widest block mb-2">Admissions Fairs</span>
              <h3 className="text-lg font-bold leading-snug mb-2">
                Global University Fairs
              </h3>
              <p className="text-xs text-blue-100/85 leading-relaxed mb-5 font-normal">
                Interact directly with official delegates from top UK, USA, Canada, and Australian universities.
              </p>
              <Link
                to="/events"
                className="w-full text-center py-3 bg-white text-[#111111] rounded-xl text-xs font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-1.5 shadow-sm block cursor-pointer"
              >
                <span>Explore Live Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget: AI University Matcher */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#111111] flex items-center justify-center mx-auto mb-4 border border-orange-100/60">
                <GraduationCap size={22} className="text-[#111111]" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-xs mb-2">AI University Matcher</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-5 font-semibold">
                Match universities according to your target test score, desired intake & profile.
              </p>
              <Link
                to="/ai-tools"
                className="w-full text-center py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-50 hover:border-slate-300 transition-all block cursor-pointer"
              >
                Find Best Match
              </Link>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};

export default IELTSCoachingCentresPage;
