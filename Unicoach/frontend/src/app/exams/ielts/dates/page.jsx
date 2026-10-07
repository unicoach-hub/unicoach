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
          <span className="text-slate-600">IELTS Exam Dates</span>
        </div>

        {/* Title Header Card */}
        <div className="relative bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              IELTS Reference Guide
            </span>
            <h1 className="text-2xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              IELTS Exam Dates in 2025: September to December
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed font-semibold">
              Find Academic & General Training dates, slots, and schedules for top Indian test locations.
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
                const isActive = linkItem.key === 'dates';
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
                Ready to take the next step in your IELTS journey? In India, for the paper-delivered IELTS in September 2025, test dates are September 6, 13, 18, and 27, 2025. Some of these dates, like the 13th and 27th, offer both Academic and General Training, while others are Academic only. Computer-delivered IELTS tests are available much more frequently—almost daily at select locations.
              </p>

              {/* Test Finder Dropdown */}
              <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-6">
                <h4 className="font-extrabold text-slate-805 text-sm mb-3 flex items-center gap-1.5">
                  <Calendar size={18} className="text-indigo-650" />
                  <span>IELTS Test Centre Finder</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 text-xs font-bold mb-1.5">Select State</label>
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
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
                    <label className="block text-slate-500 text-xs font-bold mb-1.5">Select City</label>
                    <div className="flex flex-wrap gap-2">
                      {['Bangalore', 'Hyderabad', 'Ludhiana', 'Chennai', 'Mumbai'].map((ct) => (
                        <button
                          key={ct}
                          onClick={() => {
                            setDatesCity(ct);
                            setSelectedState(cityDatesData[ct].state);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            datesCity === ct
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
              <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <MapPin size={18} className="text-indigo-650" />
                    <span>IELTS Dates in {datesCity} ({currentData.state})</span>
                  </h3>
                  <span className="text-[10px] uppercase font-black tracking-wider bg-indigo-50 text-indigo-655 px-2.5 py-1 rounded-md">
                    Selected City
                  </span>
                </div>

                {/* Acad and GT Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Academic Box */}
                  <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-sm">
                    <h4 className="font-extrabold text-slate-850 text-sm border-b border-slate-50 pb-2">Academic Module</h4>
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 block mb-1">Computer-Based:</span>
                        <p className="font-semibold text-slate-750">{currentData.acadComp}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block mb-1.5">Paper-Based Test Dates:</span>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-655">
                          <p><strong>Sept:</strong> {currentData.acadPaper.Sept}</p>
                          <p><strong>Oct:</strong> {currentData.acadPaper.Oct}</p>
                          <p><strong>Nov:</strong> {currentData.acadPaper.Nov}</p>
                          <p><strong>Dec:</strong> {currentData.acadPaper.Dec}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* General Training Box */}
                  <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4 shadow-sm">
                    <h4 className="font-extrabold text-slate-850 text-sm border-b border-slate-50 pb-2">General Training Module</h4>
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 block mb-1">Computer-Based:</span>
                        <p className="font-semibold text-slate-750">{currentData.gtComp}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block mb-1.5">Paper-Based Test Dates:</span>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-655">
                          <p><strong>Sept:</strong> {currentData.gtPaper.Sept}</p>
                          <p><strong>Oct:</strong> {currentData.gtPaper.Oct}</p>
                          <p><strong>Nov:</strong> {currentData.gtPaper.Nov}</p>
                          <p><strong>Dec:</strong> {currentData.gtPaper.Dec}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UKVI and Life Skills Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-3.5 text-xs shadow-sm">
                    <h4 className="font-extrabold text-slate-850 text-sm border-b border-slate-50 pb-2">IELTS for UKVI (Academic & GT)</h4>
                    <div>
                      <span className="font-bold text-slate-400 block mb-1">Computer-Based UKVI:</span>
                      <p className="font-semibold text-slate-750 mb-3">{currentData.ukviAcadComp}</p>
                    </div>
                    {currentData.ukviAcadPaper ? (
                      <div>
                        <span className="font-bold text-slate-400 block mb-1">Paper-Based UKVI Academic:</span>
                        <div className="grid grid-cols-2 gap-1 text-[11px] font-semibold text-slate-655">
                          <p><strong>Sept:</strong> {currentData.ukviAcadPaper.Sept}</p>
                          <p><strong>Oct:</strong> {currentData.ukviAcadPaper.Oct}</p>
                          <p><strong>Nov:</strong> {currentData.ukviAcadPaper.Nov}</p>
                          <p><strong>Dec:</strong> {currentData.ukviAcadPaper.Dec}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No paper-based UKVI Academic sessions scheduled.</p>
                    )}
                    {currentData.ukviGtPaper && (
                      <div className="pt-2">
                        <span className="font-bold text-slate-400 block mb-1">Paper-Based UKVI GT:</span>
                        <div className="grid grid-cols-2 gap-1 text-[11px] font-semibold text-slate-655">
                          <p><strong>Sept:</strong> {currentData.ukviGtPaper.Sept}</p>
                          <p><strong>Oct:</strong> {currentData.ukviGtPaper.Oct}</p>
                          <p><strong>Nov:</strong> {currentData.ukviGtPaper.Nov}</p>
                          <p><strong>Dec:</strong> {currentData.ukviGtPaper.Dec}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-3 text-xs shadow-sm">
                    <h4 className="font-extrabold text-slate-855 text-sm border-b border-slate-50 pb-2">IELTS Life Skills</h4>
                    <div>
                      <span className="font-bold text-slate-400 block mb-1">Test Dates (A1 & B1):</span>
                      <p className="font-semibold text-slate-750 leading-relaxed">{currentData.lifeSkills}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal pt-2 font-semibold">
                      * The Life Skills test assesses speaking and listening skills at level A1 or B1 for UK family visa routes.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 mt-8 mb-4">How to Select the Right Dates?</h3>
              <p>
                We recommend registering for your IELTS test <strong>at least 3 to 6 months before your target university application deadline</strong>. This leaves enough room for scheduling slot retakes if necessary or preparing visa materials early. High-demand months in India are January to March (Fall deadlines) and June to August. Booking 1 month in advance is highly recommended.
              </p>

              <h3 className="text-lg font-black text-slate-900 mt-12 mb-6">Frequently Asked Questions (FAQs) - IELTS Dates</h3>
              <div className="space-y-4">
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
                  <details key={index} className="group border border-slate-200 rounded-2xl bg-white hover:border-indigo-150 transition-all duration-200 p-5">
                    <summary className="font-extrabold text-slate-800 cursor-pointer flex justify-between items-center list-none select-none text-sm">
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
                <h4 className="font-bold text-slate-900 text-sm mb-1">Want to prepare for IELTS?</h4>
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
                <Link to={getBlogLink("IELTS Test Centres")} className="flex flex-col justify-between p-5 bg-white border border-slate-100 border-l-4 border-l-emerald-500 rounded-xl hover:shadow-md transition-all group">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-4 group-hover:text-indigo-655 transition-colors">IELTS Test Centres</h4>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    Read Now <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
                <Link to={getBlogLink("IELTS Registration")} className="flex flex-col justify-between p-5 bg-white border border-slate-100 border-l-4 border-l-sky-500 rounded-xl hover:shadow-md transition-all group">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-4 group-hover:text-indigo-655 transition-colors">IELTS Registration</h4>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    Read Now <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
                <Link to={getBlogLink("IELTS Slot Booking")} className="flex flex-col justify-between p-5 bg-white border border-slate-100 border-l-4 border-l-amber-500 rounded-xl hover:shadow-md transition-all group">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-4 group-hover:text-indigo-655 transition-colors">IELTS Slot Booking</h4>
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
            
            {/* Widget: Live Events & Fairs */}
            <div className="bg-gradient-to-r from-[#111111] via-[#10319E] to-[#111111] text-white p-6 rounded-2xl shadow-md border border-blue-900/40 relative overflow-hidden">
              <span className="text-[9px] font-bold text-orange-200 uppercase tracking-widest block mb-2">Live Fairs</span>
              <h3 className="text-lg font-bold leading-snug mb-2">
                University Fairs & Webinars
              </h3>
              <p className="text-xs text-blue-100/85 leading-relaxed mb-5 font-normal">
                Meet university delegates directly, understand intake deadlines, and get on-spot advice.
              </p>
              <Link
                to="/events"
                className="w-full text-center py-3 bg-white text-[#111111] rounded-xl text-xs font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-1.5 shadow-sm block cursor-pointer"
              >
                <span>Explore Live Fairs</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget: Trending Blogs & Guides */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100/80">
                <BookOpen size={22} className="text-amber-600" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-xs mb-2">Study Abroad Blogs & Guides</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-5 font-semibold">
                Read insider tips, country comparisons, exam strategies & visa application roadmaps.
              </p>
              <Link
                to="/blogs"
                className="w-full text-center py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-50 hover:border-slate-300 transition-all block cursor-pointer"
              >
                Explore All Blogs
              </Link>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};

export default IELTSDatesPage;
