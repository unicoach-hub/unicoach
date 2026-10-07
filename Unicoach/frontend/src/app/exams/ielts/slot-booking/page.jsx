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
          <span className="text-slate-600">IELTS Slot Booking</span>
        </div>

        {/* Title Header Card */}
        <div className="relative bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-955">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              IELTS Reference Guide
            </span>
            <h1 className="text-2xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              IELTS Slot Booking Guide
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed font-semibold">
              Step-by-step guidelines for reserving test slots online, documents checklists, and policy details.
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
                const isActive = linkItem.key === 'slot-booking';
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
                Have you decided to take the IELTS exam, or are you still planning to? Then, you should know how to book your test slot to sit for the exam. IELTS is one of the most popular English language proficiency tests, trusted by over 12,000 organisations globally in countries such as the US, UK, Australia, Canada, Ireland, and Germany.
              </p>
              <p>
                Whether you prefer the traditional offline method or the comfort of your home with the online option, IELTS offers this flexibility. You can easily book your IELTS slot through the official IDP IELTS India website.
              </p>

              <h3 className="text-lg font-black text-slate-900 mt-8 mb-4">1. IELTS Slot Booking: Registration Modes</h3>
              <p>
                To sit for the IELTS test, candidates have to reserve their spots through one of three primary registration modes:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5">
                  <h4 className="font-extrabold text-slate-800 text-sm">💻 Online Mode</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Visit the official <a href="https://www.ieltsidpindia.com" target="_blank" rel="noopener noreferrer" className="text-indigo-650 hover:underline">ieltsidpindia.com</a> portal. Choose your exam format, dates, location, fill in details, upload scanned passport, and pay via Net Banking, Debit/Credit Card, or Paytm.
                  </p>
                </div>
                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5">
                  <h4 className="font-extrabold text-slate-800 text-sm">🏢 In-Person (Offline)</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Visit your nearest IDP IELTS branch office. Fill out the physical application, provide physical passport copies (front + back pages), and pay via bank deposit slip at HDFC/ICICI branches or Demand Draft.
                  </p>
                </div>
                <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5">
                  <h4 className="font-extrabold text-slate-800 text-sm">📞 Telephone Support</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Contact the IDP customer care line at <strong>1800 102 4544</strong> or email <strong>ielts.india@idp.com</strong> for assistance through registration procedures and branch locations.
                  </p>
                </div>
              </div>

              {/* Document Checklist Widget */}
              <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-6 my-6">
                <h4 className="font-extrabold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <FileText size={18} className="text-indigo-650" />
                  <span>Interactive Registration Documents Checklist</span>
                </h4>
                <p className="text-xs text-slate-500 mb-4 font-semibold">Check off these items as you gather them before starting your online slot booking:</p>
                <div className="space-y-3">
                  {[
                    { key: 'passportFront', label: 'Valid Passport Front Page (clear color scan containing photo & details)' },
                    { key: 'passportBack', label: 'Valid Passport Back Page (clear color scan containing address details)' },
                    { key: 'signature', label: 'Signature Declaration (signed exactly as per the signature on your passport)' },
                    { key: 'disabilityCert', label: 'Disability Certificate / Medical Accommodation Request (if applicable)' },
                    { key: 'paymentReady', label: 'Payment Method Ready (Net Banking, Card, Paytm, or demand draft details)' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-3 cursor-pointer group text-xs text-slate-700 font-semibold select-none">
                      <input
                        type="checkbox"
                        checked={checklist[item.key]}
                        onChange={() => toggleCheck(item.key)}
                        className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={checklist[item.key] ? 'line-through text-slate-400 font-medium' : 'group-hover:text-indigo-650 transition-colors'}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 mt-8 mb-4">2. IELTS Slot Rescheduling & Cancellation Rules</h3>
              <p>
                Plans can change, and IDP allows rescheduling or cancellation of slots under specific guidelines:
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4 my-6">
                <h4 className="font-extrabold text-slate-850 text-sm">Rescheduling Policies</h4>
                <ul className="list-disc list-inside space-y-2.5 text-xs text-slate-550 pl-2 font-semibold">
                  <li><strong>Time Window:</strong> Rescheduling requests must be made <strong>at least 5 weeks (35 days) before</strong> your scheduled test date.</li>
                  <li><strong>Rescheduling Fee:</strong> A transfer processing fee of <strong>INR 4,750</strong> (INR 4,850 for UKVI) will be charged.</li>
                  <li><strong>Late Rescheduling:</strong> Requesting a change under 35 days before the test date is treated as a cancellation, and you forfeit the complete registration fee.</li>
                  <li><strong>Extraordinary Circumstances:</strong> Late rescheduling or refund is only permitted in verified cases of serious illness, bereavement, or national emergencies, with complete documentary evidence submitted to IDP within 5 days of the test date.</li>
                </ul>
              </div>

              <h3 className="text-lg font-black text-slate-900 mt-12 mb-6">Frequently Asked Questions (FAQs) - Slot Booking</h3>
              <div className="space-y-4">
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
            {/* Widget: AI Shortlister */}
            <div className="bg-gradient-to-r from-[#111111] via-[#10319E] to-[#111111] text-white p-6 rounded-2xl shadow-md border border-blue-900/40 relative overflow-hidden">
              <span className="text-[9px] font-bold text-orange-200 uppercase tracking-widest block mb-2">AI Shortlister</span>
              <h3 className="text-lg font-bold leading-snug mb-2">
                Match Unis by Band Score
              </h3>
              <p className="text-xs text-blue-100/85 leading-relaxed mb-5 font-normal">
                Check which top global universities accept your target IELTS band score instantly.
              </p>
              <Link
                to="/ai-tools"
                className="w-full text-center py-3 bg-white text-[#111111] rounded-xl text-xs font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-1.5 shadow-sm block cursor-pointer"
              >
                <span>Try AI Shortlister</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget: Live Events & Fairs */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#111111] flex items-center justify-center mx-auto mb-4 border border-orange-100/60">
                <Calendar size={22} className="text-[#111111]" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-xs mb-2">Live Education Fairs</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-5 font-semibold">
                Meet representatives from top global universities & join free masterclasses.
              </p>
              <Link
                to="/events"
                className="w-full text-center py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-50 hover:border-slate-300 transition-all block cursor-pointer"
              >
                View Upcoming Events
              </Link>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};

export default IELTSSlotBookingPage;
