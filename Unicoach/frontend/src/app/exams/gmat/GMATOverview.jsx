import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Calendar,
  DollarSign,
  GraduationCap,
  HelpCircle,
  Clock,
  MapPin,
  FileText,
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  Volume2,
  FileEdit,
  Mic,
  ArrowUpRight,
  Table,
  CheckCircle2,
  Bookmark,
  Check,
  Star,
  Building,
  Globe,
  ExternalLink
} from 'lucide-react';

const UniLogo = ({ logo, name, domain }) => {
  const [error, setError] = useState(false);

  const cleanDomain = domain || (
    name.toLowerCase().includes('harvard') ? 'harvard.edu' :
    name.toLowerCase().includes('stanford') ? 'stanford.edu' :
    name.toLowerCase().includes('columbia') ? 'columbia.edu' :
    name.toLowerCase().includes('northeastern') ? 'northeastern.edu' :
    name.toLowerCase().includes('yale') ? 'yale.edu' :
    name.toLowerCase().includes('oxford') ? 'ox.ac.uk' :
    name.toLowerCase().includes('cambridge') ? 'cam.ac.uk' :
    name.toLowerCase().includes('coventry') ? 'coventry.ac.uk' :
    name.toLowerCase().includes('toronto') ? 'utoronto.ca' :
    name.toLowerCase().includes('conestoga') ? 'conestogac.on.ca' :
    name.toLowerCase().includes('deakin') ? 'deakin.edu.au' :
    name.toLowerCase().includes('monash') ? 'monash.edu' :
    name.toLowerCase().includes('trinity') ? 'tcd.ie' : null
  );

  const googleFavicon = cleanDomain ? `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128` : null;
  const primarySrc = !error && logo && !logo.includes('logo.clearbit.com') ? logo : googleFavicon;

  return (
    <div className="w-full h-full bg-white flex items-center justify-center p-0.5">
      {primarySrc ? (
        <img 
          src={primarySrc} 
          alt={`${name} logo`} 
          className="w-full h-full object-contain" 
          onError={() => setError(true)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white rounded">
          <GraduationCap size={16} />
        </div>
      )}
    </div>
  );
};

const GMATOverview = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('section-1');
  const [faqOpen, setFaqOpen] = useState({});
  const [activeCountry, setActiveCountry] = useState('USA');

  const sectionRefs = {
    'section-1': useRef(null),
    'section-2': useRef(null),
    'section-3': useRef(null),
    'section-4': useRef(null),
    'section-5': useRef(null),
    'section-6': useRef(null),
    'section-7': useRef(null),
    'section-8': useRef(null),
  };

  const menuItems = [
    { id: 'section-1', label: '1. GMAT Exam Overview' },
    { id: 'section-2', label: '2. Syllabus & Exam Pattern' },
    { id: 'section-3', label: '3. Registration & Process' },
    { id: 'section-4', label: '4. Fees & Payment Modes' },
    { id: 'section-5', label: '5. Rescheduling & Cancellation' },
    { id: 'section-6', label: '6. Scores & Score Scales' },
    { id: 'section-7', label: '7. Preparation & Recommended Books' },
    { id: 'section-8', label: '8. Top Global Universities' },
  ];

  const countries = ['USA', 'UK', 'Canada', 'Australia', 'Ireland'];

  const universityData = {
    USA: [
      { name: 'Harvard University', location: 'Cambridge, MA', rank: 'QS #4', tuition: '₹ 46.5 Lakh/Yr', logo: '/logos/Harvard_University.png', domain: 'harvard.edu', image: '/assets/usa/harvard/banner.jpg', path: '/study-abroad/usa/universities/harvard' },
      { name: 'Stanford University', location: 'Stanford, CA', rank: 'QS #5', tuition: '₹ 48.0 Lakh/Yr', logo: '/logos/Stanford_University.svg', domain: 'stanford.edu', image: '/images/universities/stanford.jpg', path: '/study-abroad/usa/universities/stanford' },
      { name: 'Columbia University', location: 'New York, NY', rank: 'QS #23', tuition: '₹ 51.2 Lakh/Yr', logo: '/logos/Columbia_University_in_the_City_of_New_York.webp', domain: 'columbia.edu', image: '/images/universities/columbia.jpg', path: '/study-abroad/usa/universities/columbia' },
      { name: 'Northeastern University', location: 'Boston, MA', rank: 'QS #380', tuition: '₹ 39.8 Lakh/Yr', logo: '/logos/Northeastern_University.webp', domain: 'northeastern.edu', image: '/images/universities/northeastern.jpg', path: '/study-abroad/usa/universities/northeastern' },
      { name: 'Yale University', location: 'New Haven, CT', rank: 'QS #16', tuition: '₹ 49.5 Lakh/Yr', logo: 'https://www.google.com/s2/favicons?domain=yale.edu&sz=128', domain: 'yale.edu', image: '/images/universities/yale.jpg', path: '/study-abroad/usa/universities/yale' }
    ],
    UK: [
      { name: 'University of Oxford', location: 'Oxford, UK', rank: 'QS #3', tuition: '₹ 38.5 Lakh/Yr', logo: '/logos/University of Oxford.png', domain: 'ox.ac.uk', image: '/images/universities/oxford.jpg', path: '/study-abroad/uk/universities/oxford' },
      { name: 'University of Cambridge', location: 'Cambridge, UK', rank: 'QS #2', tuition: '₹ 41.2 Lakh/Yr', logo: '/logos/University of Cambridge.jpg', domain: 'cam.ac.uk', image: '/images/universities/cambridge.jpg', path: '/study-abroad/uk/universities/cambridge' },
      { name: 'Coventry University', location: 'Coventry, UK', rank: 'QS #571', tuition: '₹ 18.5 Lakh/Yr', logo: 'https://www.google.com/s2/favicons?domain=coventry.ac.uk&sz=128', domain: 'coventry.ac.uk', image: '/images/universities/coventry.jpg', path: '/study-abroad/uk/universities/coventry' }
    ],
    Canada: [
      { name: 'University of Toronto', location: 'Toronto, ON', rank: 'QS #21', tuition: '₹ 35.6 Lakh/Yr', logo: 'https://www.google.com/s2/favicons?domain=utoronto.ca&sz=128', domain: 'utoronto.ca', image: '/images/universities/toronto.jpg', path: '/study-abroad/canada/universities/toronto-university' },
      { name: 'Conestoga College', location: 'Kitchener, ON', rank: 'Top Applied Arts', tuition: '₹ 11.2 Lakh/Yr', logo: 'https://www.google.com/s2/favicons?domain=conestogac.on.ca&sz=128', domain: 'conestogac.on.ca', image: '/images/universities/conestoga.jpg', path: '/study-abroad/canada/universities/conestoga' }
    ],
    Australia: [
      { name: 'Deakin University', location: 'Melbourne, VIC', rank: 'QS #233', tuition: '₹ 21.8 Lakh/Yr', logo: '/logos/Deakin University.svg', domain: 'deakin.edu.au', image: '/images/universities/deakin.jpg', path: '/study-abroad/australia/universities/deakin' },
      { name: 'Monash University', location: 'Melbourne, VIC', rank: 'QS #42', tuition: '₹ 26.5 Lakh/Yr', logo: '/logos/Monash University.webp', domain: 'monash.edu', image: '/images/universities/monash.jpg', path: '/study-abroad/australia/universities/monash' }
    ],
    Ireland: [
      { name: 'Trinity College Dublin', location: 'Dublin, IE', rank: 'QS #87', tuition: '₹ 22.4 Lakh/Yr', logo: '/logos/Trinity College Dublin.webp', domain: 'tcd.ie', image: '/images/universities/trinity.jpg', path: '/study-abroad/ireland/universities/trinity' }
    ]
  };

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const [sectionId, ref] of Object.entries(sectionRefs)) {
        if (ref.current) {
          const offsetTop = ref.current.offsetTop;
          const offsetHeight = ref.current.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const ref = sectionRefs[sectionId];
    if (ref && ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop - 110,
        behavior: 'smooth',
      });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 select-none font-sans">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-indigo-650 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span>Exams</span>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-bold">GMAT</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          {/* Backdrop photo for rich aesthetics */}
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80" 
              alt="GMAT B-School Presentation" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Compass size={14} />
              Comprehensive GMAT Guide
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              GMAT Exam Focus Edition 2026: The Complete Guide for Indian Students
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Maximize your B-School application with the ultimate breakdown of GMAT registration, syllabus changes, exam fees, slot booking details, and rankings updates.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: January 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                New Focus Edition syllabus
              </span>
            </div>
          </div>
        </div>

        {/* Alert updates banner */}
        <div className="flex items-center gap-4 bg-orange-50 border border-orange-200/80 p-5 rounded-3xl mb-12">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-[#DE5C2B] flex-shrink-0">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-850 text-sm">Latest GMAT Focus Update</h4>
            <p className="text-xs text-slate-650 font-semibold mt-0.5">
              The classic 3-hour GMAT format is now fully discontinued. The new 2 hour and 15 minute Focus Edition exam featuring Data Insights is the standard exam.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-8 items-start">
          
          {/* Left Sticky Sidebar Index */}
          <aside className="hidden lg:block sticky top-28 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm max-h-[calc(100vh-140px)] overflow-y-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">On This Page</p>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left py-2 px-3 rounded-xl text-xs font-bold transition-all leading-normal cursor-pointer
                    ${activeSection === item.id
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Center Main Guide Column */}
          <main className="space-y-14 bg-white border border-slate-100 p-8 md:p-10 rounded-2xl shadow-sm">
            
            {/* Section 1 */}
            <section id="section-1" ref={sectionRefs['section-1']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                1. GMAT Exam Overview
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  GMAT, or <strong>Graduate Management Admission Test</strong>, is a globally recognized computer-adaptive exam. Owned and operated by the <strong>Graduate Management Admission Council (GMAC)</strong>, it is the primary benchmark for entrance into top-tier business schools and MBA programmes globally.
                </p>
                <p>
                  The newly launched <strong>GMAT Focus Edition</strong> streamlines the test, making it faster, more logical, and centered on modern business data analysis skills. Here is a quick breakdown of GMAT Focus:
                </p>
                <ul className="list-disc list-inside space-y-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
                  <li><strong>Total Duration:</strong> 2 hours and 15 minutes (with 1 optional 10-minute break).</li>
                  <li><strong>AWA Removed:</strong> The analytical writing section is completely discontinued.</li>
                  <li><strong>Data Insights:</strong> A new core section checking critical data interpretation.</li>
                  <li><strong>Modes:</strong> Delivered either at a local test centre or online at home.</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" ref={sectionRefs['section-2']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                2. Syllabus & Exam Pattern
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  The GMAT Focus Edition consists of 3 distinct sections. Candidates can choose their own section order at the start of the test.
                </p>

                {/* Pattern Table */}
                <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-4">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-150">
                        <th className="p-3">Section</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">No. of Questions</th>
                        <th className="p-3">Format & Scope</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 font-semibold">
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-855">Quantitative Reasoning</td>
                        <td className="p-3">45 Minutes</td>
                        <td className="p-3">21 Questions</td>
                        <td className="p-3">Arithmetic & Algebra. No geometry, no calculator allowed.</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-855">Verbal Reasoning</td>
                        <td className="p-3">45 Minutes</td>
                        <td className="p-3">23 Questions</td>
                        <td className="p-3">Reading Comprehension & Critical Reasoning. No sentence correction.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-855">Data Insights</td>
                        <td className="p-3">45 Minutes</td>
                        <td className="p-3">20 Questions</td>
                        <td className="p-3">Data Sufficiency, Graphics, Tables, Multi-source. Calculator permitted.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-indigo-50/50 p-4 border border-indigo-150 rounded-2xl mt-4 text-xs text-indigo-950">
                  <strong>Quant Syllabus Breakdown:</strong> Focuses heavily on number properties, fractions, decimals, percentages, ratios, algebra, rate/speed/time, work equations, and basic statistics (mean, median, mode).
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" ref={sectionRefs['section-3']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                3. Registration & Booking Process
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  You can register for the GMAT exam up to 6 months before your target test date. We advise booking at least 3 months in advance to lock in your preferred date and slot, especially for physical test centres.
                </p>
                <div className="space-y-3.5 text-xs text-slate-500 font-semibold my-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-black text-indigo-600 block mb-1">Step 1: Account Creation</span>
                    Visit the official GMAT website (MBA.com) and set up your student profile with precise details matching your passport.
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-black text-indigo-600 block mb-1">Step 2: Choose Delivery Mode</span>
                    Select either "Online Exam (At Home)" or "Test Center Delivery" depending on your preferences.
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-black text-indigo-600 block mb-1">Step 3: Select Centers & Dates</span>
                    Search for test centers in cities like Bangalore, Delhi, Mumbai, Hyderabad, Pune, or Kolkata, and choose a time.
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-black text-indigo-600 block mb-1">Step 4: Fee Settlement</span>
                    Complete payment using a valid international debit/credit card. Declined cards will lead to slot cancellations.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section-4" ref={sectionRefs['section-4']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                4. Fees & Payment Modes
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  GMAT exam fee structures are determined in USD. Local conversions in INR depend on standard exchange rates.
                </p>

                {/* Fees table */}
                <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-4">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-150">
                        <th className="p-3">Service</th>
                        <th className="p-3">Delivered at Test Center</th>
                        <th className="p-3">Delivered Online</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 font-semibold">
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-855">GMAT Focus Exam Fee</td>
                        <td className="p-3">US$275 (~INR 22,950)</td>
                        <td className="p-3">US$300 (~INR 25,040)</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3">Additional Score Report</td>
                        <td className="p-3">US$35 each</td>
                        <td className="p-3">US$35 each</td>
                      </tr>
                      <tr>
                        <td className="p-3">Acceptable Payment Cards</td>
                        <td className="p-3 colspan-2">VISA, Mastercard, American Express, Discover</td>
                        <td className="p-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section-5" ref={sectionRefs['section-5']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                5. Rescheduling & Cancellation Fees
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  If you need to change your GMAT exam details, you can reschedule or cancel, but fees apply based on your advance notice window.
                </p>

                {/* Reschedule Cancellation Table */}
                <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-4">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-150">
                        <th className="p-3">Notice Window</th>
                        <th className="p-3">Rescheduling (Center / Online)</th>
                        <th className="p-3">Cancellation Refund (Center / Online)</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 font-semibold">
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-855">More than 60 Days</td>
                        <td className="p-3">USD 55 / USD 60</td>
                        <td className="p-3">USD 110 Refund / USD 120 Refund</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-855">15 to 60 Days</td>
                        <td className="p-3">USD 110 / USD 120</td>
                        <td className="p-3">USD 80 Refund / USD 90 Refund</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-855">14 Days or less</td>
                        <td className="p-3">USD 165 / USD 180</td>
                        <td className="p-3">USD 55 Refund / USD 60 Refund</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-855">Less than 24 Hours</td>
                        <td className="p-3 text-rose-600">No Rescheduling</td>
                        <td className="p-3 text-rose-650">No Refund</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="section-6" ref={sectionRefs['section-6']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                6. Score Scale & Scoring System
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  GMAT Focus scoring scale has changed to separate old classic scores from new focus scores.
                </p>

                {/* Score Scale Table */}
                <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-4">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-150">
                        <th className="p-3">Exam Module</th>
                        <th className="p-3">Score Scale</th>
                        <th className="p-3">Score Increments</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 font-semibold">
                      <tr className="border-b border-slate-100">
                        <td className="p-3">Quantitative Reasoning</td>
                        <td className="p-3">60 to 90</td>
                        <td className="p-3">1 point</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3">Verbal Reasoning</td>
                        <td className="p-3">60 to 90</td>
                        <td className="p-3">1 point</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3">Data Insights</td>
                        <td className="p-3">60 to 90</td>
                        <td className="p-3">1 point</td>
                      </tr>
                      <tr className="bg-indigo-50/20">
                        <td className="p-3 font-bold text-slate-855">GMAT Total Score</td>
                        <td className="p-3 font-bold text-indigo-700">205 to 805</td>
                        <td className="p-3 font-bold">10 points</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl text-xs text-slate-500 font-semibold leading-relaxed">
                  💡 <strong>Important Note:</strong> All total GMAT Focus scores end in a 5 (e.g. 555, 645, 715). Standard classic GMAT scores end in a 0 (e.g. 600, 700). GMAT results are valid for exactly <strong>5 years</strong>.
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" ref={sectionRefs['section-7']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                7. Preparation & Recommended Books
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  To crack the new GMAT Focus Edition, using targeted materials for Data Insights and advanced Quantitative reasoning is necessary. Here are the top recommended GMAT books for 2026:
                </p>

                <div className="space-y-3.5 my-6">
                  {[
                    { num: "1", name: "GMAT Official Guide Focus Edition (GMAC)", desc: "The definitive guide containing 800+ real past GMAT questions and diagnostic diagnostics direct from the makers." },
                    { num: "2", name: "Manhattan Prep Complete GMAT Strategy Guide Set", desc: "Deep concept breakdowns detailing algebra shortcuts, reading structures, and Data Insights logic." },
                    { num: "3", name: "Kaplan GMAT Prep Plus", desc: "Best comprehensive handbook with online study planners, strategies, and 6 full-length mock tests." },
                    { num: "4", name: "Veritas Prep Complete GMAT Course Set", desc: "Analytical strategies built to help you approach tricky, high-scoring questions systematically." },
                    { num: "5", name: "GMAT Official Advanced Questions", desc: "Presents 300 hardest questions from past exams to push your target score beyond 685+ (90th percentile)." }
                  ].map((book) => (
                    <div key={book.num} className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                        {book.num}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{book.name}</h4>
                        <p className="text-slate-500 text-xs mt-1 font-semibold leading-relaxed">{book.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="section-8" ref={sectionRefs['section-8']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                8. Top Global Universities Accepting GMAT
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4 font-semibold mb-6">
                <p>
                  Explore top universities and business schools accepting GMAT scores in the USA, UK, Canada, Australia, and Ireland. Check details, QS rankings, average tuition fees, and verify eligibility.
                </p>
              </div>

              {/* Country Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-6">
                {countries.map((country) => (
                  <button
                    key={country}
                    onClick={() => setActiveCountry(country)}
                    className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer
                      ${activeCountry === country
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-150'}`}
                  >
                    {country}
                  </button>
                ))}
              </div>

              {/* University Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {universityData[activeCountry].map((uni) => (
                    <motion.div
                      key={uni.name}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow"
                    >
                      {/* Image header */}
                      <div className="h-32 w-full relative overflow-hidden bg-slate-100">
                        <img 
                          src={uni.image} 
                          alt={uni.name} 
                          className="w-full h-full object-cover brightness-[0.8] group-hover:scale-103 transition-transform duration-500" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/usa/harvard/banner.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 bg-white/20 backdrop-blur-md border border-white/30 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                          {uni.rank}
                        </span>
                      </div>

                      {/* Content block */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center p-1 overflow-hidden shadow-xs flex-shrink-0">
                              <UniLogo logo={uni.logo} name={uni.name} domain={uni.domain} />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                                {uni.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                                <MapPin size={10} />
                                {uni.location}
                              </p>
                            </div>
                          </div>

                          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-center text-xs mt-4">
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Est. Tuition</span>
                              <span className="font-bold text-indigo-700 block mt-0.5">{uni.tuition}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Standard Exam</span>
                              <span className="font-bold text-slate-700 block mt-0.5">GMAT Required</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-5 border-t border-slate-100 pt-4">
                          <Link
                            to={uni.path}
                            className="flex-1 py-2 text-center border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                          >
                            Know More
                          </Link>
                          <Link
                            to={`/contact?university=${encodeURIComponent(uni.name)}`}
                            className="flex-1 py-2 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                          >
                            Check Eligibility
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

          </main>

          {/* Right Floating Sidebar Widgets */}
          <aside className="sticky top-28 space-y-6">
            
            {/* Widget A: Live Workshops */}
            <div className="bg-gradient-to-r from-[#111111] via-[#10319E] to-[#111111] text-white p-6 rounded-2xl shadow-md border border-blue-900/40 relative overflow-hidden">
              <span className="text-[9px] font-bold text-orange-200 uppercase tracking-widest block mb-2">Live Workshops</span>
              <h3 className="text-lg font-bold leading-snug mb-2">
                Study Abroad Events & Fairs
              </h3>
              <p className="text-xs text-blue-100/85 leading-relaxed mb-5 font-normal">
                Join live webinars with global university delegates, admissions officers, and certified trainers.
              </p>
              <Link
                to="/events"
                className="w-full text-center py-3 bg-white text-[#111111] rounded-xl text-xs font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-1.5 shadow-sm block cursor-pointer"
              >
                <span>Explore Live Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget B: AI University Matcher */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={20} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">AI University Matcher</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-5 font-normal">
                Unsure if your profile qualifies for GMAT waivers? Get instant AI suggestions.
              </p>
              <Link
                to="/ai-tools"
                className="w-full text-center py-3 border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all block cursor-pointer"
              >
                Try AI Shortlister
              </Link>
            </div>

          </aside>

        </div>

        {/* FAQs Accordion */}
        <div className="mt-16 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm max-w-4xl mx-auto">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="text-indigo-600" size={22} />
            Frequently Asked Questions (FAQs)
          </h3>
          <div className="space-y-4">
            {[
              { q: "Is GMAT difficult?", a: "The GMAT is computer-adaptive, meaning questions adjust to your level. It is challenging because it tests logical analytics rather than simple recall. However, structured prep of 2-3 months is sufficient." },
              { q: "How long is the GMAT exam?", a: "The new GMAT Focus Edition lasts exactly 2 hours and 15 minutes plus an optional 10-minute break. This is a significant reduction from the old 3 hour format." },
              { q: "Can I use a calculator during the GMAT?", a: "Calculators are strictly prohibited during the Quantitative Reasoning section. However, an on-screen calculator is provided during the Data Insights section." },
              { q: "How soon can I retake the GMAT?", a: "You can retake the GMAT exam 16 days after your previous attempt. You can take the exam up to 5 times in a rolling 12-month period and 8 times in total." }
            ].map((faq, idx) => {
              const isOpen = !!faqOpen[idx];
              return (
                <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-750 hover:text-indigo-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight 
                      size={15} 
                      className={`text-slate-400 transition-transform duration-250 ${isOpen ? 'rotate-90 text-indigo-500' : ''}`} 
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-slate-500 text-xs md:text-sm border-t border-slate-100 leading-relaxed font-semibold">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GMATOverview;
