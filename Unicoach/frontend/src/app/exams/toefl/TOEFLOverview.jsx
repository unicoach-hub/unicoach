import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  FileEdit,
  CheckCircle2,
  Bookmark,
  Building,
  Globe,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const UniLogo = ({ logo, name, domain }) => {
  const [error, setError] = useState(false);

  const cleanDomain = domain || (
    name.toLowerCase().includes('harvard') ? 'harvard.edu' :
    name.toLowerCase().includes('stanford') ? 'stanford.edu' :
    name.toLowerCase().includes('columbia') ? 'columbia.edu' :
    name.toLowerCase().includes('yale') ? 'yale.edu' :
    name.toLowerCase().includes('oxford') ? 'ox.ac.uk' :
    name.toLowerCase().includes('cambridge') ? 'cam.ac.uk' :
    name.toLowerCase().includes('toronto') ? 'utoronto.ca' :
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

const TOEFLOverview = () => {
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
    'section-9': useRef(null),
    'section-10': useRef(null),
    'section-11': useRef(null),
    'section-12': useRef(null),
  };

  const menuItems = [
    { id: 'section-1', label: '1. What is TOEFL?' },
    { id: 'section-2', label: '2. TOEFL Dates' },
    { id: 'section-3', label: '3. TOEFL Exam Fees' },
    { id: 'section-4', label: '4. TOEFL Results' },
    { id: 'section-5', label: '5. What are TOEFL Scores?' },
    { id: 'section-6', label: '6. TOEFL Test Centres' },
    { id: 'section-7', label: '7. TOEFL Registration' },
    { id: 'section-8', label: '8. TOEFL Eligibility' },
    { id: 'section-9', label: '9. TOEFL Syllabus' },
    { id: 'section-10', label: '10. Recommended Books' },
    { id: 'section-11', label: '11. Practice Tests' },
    { id: 'section-12', label: '12. B-Schools & Universities' }
  ];

  const countries = ['USA', 'UK', 'Canada', 'Australia', 'Ireland'];

  const universityData = {
    USA: [
      { name: 'Harvard University', location: 'Cambridge, MA', rank: 'QS #4', tuition: '₹ 46.5 Lakh/Yr', logo: '/logos/Harvard_University.png', domain: 'harvard.edu', image: '/assets/usa/harvard/banner.jpg', path: '/study-abroad/usa/universities/harvard' },
      { name: 'Stanford University', location: 'Stanford, CA', rank: 'QS #5', tuition: '₹ 48.0 Lakh/Yr', logo: '/logos/Stanford_University.svg', domain: 'stanford.edu', image: '/images/universities/stanford.jpg', path: '/study-abroad/usa/universities/stanford' },
      { name: 'Columbia University', location: 'New York, NY', rank: 'QS #23', tuition: '₹ 51.2 Lakh/Yr', logo: '/logos/Columbia_University_in_the_City_of_New_York.webp', domain: 'columbia.edu', image: '/images/universities/columbia.jpg', path: '/study-abroad/usa/universities/columbia' },
      { name: 'Yale University', location: 'New Haven, CT', rank: 'QS #16', tuition: '₹ 49.5 Lakh/Yr', logo: 'https://www.google.com/s2/favicons?domain=yale.edu&sz=128', domain: 'yale.edu', image: '/images/universities/yale.jpg', path: '/study-abroad/usa/universities/yale' }
    ],
    UK: [
      { name: 'University of Oxford', location: 'Oxford, UK', rank: 'QS #3', tuition: '₹ 38.5 Lakh/Yr', logo: '/logos/University of Oxford.png', domain: 'ox.ac.uk', image: '/images/universities/oxford.jpg', path: '/study-abroad/uk/universities/oxford' },
      { name: 'University of Cambridge', location: 'Cambridge, UK', rank: 'QS #2', tuition: '₹ 41.2 Lakh/Yr', logo: '/logos/University of Cambridge.jpg', domain: 'cam.ac.uk', image: '/images/universities/cambridge.jpg', path: '/study-abroad/uk/universities/cambridge' }
    ],
    Canada: [
      { name: 'University of Toronto', location: 'Toronto, ON', rank: 'QS #21', tuition: '₹ 35.6 Lakh/Yr', logo: 'https://www.google.com/s2/favicons?domain=utoronto.ca&sz=128', domain: 'utoronto.ca', image: '/images/universities/toronto.jpg', path: '/study-abroad/canada/universities/toronto-university' }
    ],
    Australia: [
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
          <span className="text-slate-600 font-bold">TOEFL</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          {/* Backdrop photo for rich aesthetics */}
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80" 
              alt="TOEFL Academic Computer study" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Compass size={14} />
              Comprehensive TOEFL Guide
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              TOEFL Exam 2025: Dates, Fees, Result, Syllabus & Pattern
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Maximize your admissions chances in the US, UK, and Canada. Study complete guidelines on TOEFL registration, short format updates, slot booking, and B-school acceptance.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: April 2025
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                Shortened TOEFL iBT duration active
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
            <h4 className="font-extrabold text-slate-850 text-sm">Latest TOEFL Updates</h4>
            <div className="text-xs text-slate-655 font-semibold mt-0.5 space-y-1">
              <p>• TOEFL iBT duration has been shortened. Test takers can complete the exam in 2 hours. The exam will also include a new test format.</p>
              <p>• TOEFL iBT fee has now increased to ₹16,900. Australia is back to accepting TOEFL scores for all visas.</p>
            </div>
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
                1. What is the TOEFL Exam?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  The TOEFL, or <strong>Test of English as a Foreign Language</strong>, is a widely recognized English proficiency test for non-native English speakers. It evaluates English proficiency in four key areas: <strong>Reading, Listening, Speaking, and Writing</strong>.
                </p>
                <p>
                  There are two main types of TOEFL exams: <strong>TOEFL iBT</strong> (internet-based) and <strong>TOEFL Essentials</strong>. TOEFL is accepted by over 12,500 institutions across the world, including the USA, UK, and Canada.
                </p>
                <div className="bg-indigo-50/10 border border-slate-100 p-4.5 rounded-2xl text-xs text-slate-500 space-y-2 mt-4">
                  <p>• <strong>Academic focus:</strong> TOEFL iBT tests your English in an academic setting.</p>
                  <p>• <strong>General usage:</strong> TOEFL Essentials tests your everyday English.</p>
                  <p>• <strong>Wide acceptance:</strong> TOEFL iBT is accepted by over 200 countries for undergraduate and postgraduate admissions.</p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" ref={sectionRefs['section-2']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                2. TOEFL Dates: When is the TOEFL Exam Conducted?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  ETS conducts TOEFL throughout the year. You must register at least 4 months early to get your desired date and slot. The last date to register online is 7 days before the exam date.
                </p>
                <p>
                  TOEFL Essentials is conducted once or twice weekly, typically on Saturdays and Sundays. Slots are available 24 hours a day.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" ref={sectionRefs['section-3']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                3. TOEFL Exam Fees: How much does the TOEFL Cost?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  The newly updated fee for TOEFL iBT in India is <strong>₹16,900</strong>. Late registration (within 7 to 4 days of test date) incurs a fee of ₹3,900.
                </p>
                <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-3">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-150">
                        <th className="p-3">TOEFL Service Request</th>
                        <th className="p-3">Fees in India (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-805">TOEFL iBT Registration Fee</td>
                        <td className="p-3">₹16,900</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3">Late Registration Fee</td>
                        <td className="p-3">₹3,900</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3">Rescheduling Fees</td>
                        <td className="p-3">₹5,900</td>
                      </tr>
                      <tr>
                        <td className="p-3">Score review (Speaking or Writing)</td>
                        <td className="p-3">₹7,900</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section-4" ref={sectionRefs['section-4']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                4. TOEFL Results: How Do You Check Your TOEFL Results?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  TOEFL iBT results are released online within <strong>4-8 days</strong> of the exam. You can view them by logging into your ETS account.
                </p>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500 space-y-2">
                  <p>• <strong>Ranges:</strong> A good score falls within the range of 80 to 100.</p>
                  <p>• <strong>Top Rank:</strong> Top-ranking universities require scores between 100 and 115.</p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section-5" ref={sectionRefs['section-5']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                5. What are TOEFL Scores?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  TOEFL evaluates four sections (Reading, Writing, Speaking, Listening) and awards scores of <strong>0-30</strong> for each.
                </p>
                <p>
                  The overall score ranges from <strong>0 to 120</strong>. There is no negative marking. Results are valid for exactly <strong>2 years</strong>.
                </p>
                <div className="bg-indigo-50/50 p-4 border border-indigo-150 rounded-2xl text-xs text-indigo-950 font-bold">
                  💡 <strong>TOEFL MyBest™ scores:</strong> If attempted multiple times, you can combine your highest section scores from all tests taken to show your best overall performance (super scores).
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="section-6" ref={sectionRefs['section-6']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                6. TOEFL Test Centre: Where Can You Take the TOEFL?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  TOEFL iBT can be taken at physical centers across 39 cities in India, including Bangalore, Delhi, Chennai, and Ahmedabad. TOEFL Essentials can be attempted at home.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" ref={sectionRefs['section-7']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                7. TOEFL Registration: How do I register for the TOEFL?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Registrations are online on the official ETS TOEFL website:
                </p>
                <div className="space-y-3.5 text-xs text-slate-500 my-4">
                  <p>1. Create an ETS account online.</p>
                  <p>2. Select your preferred test date and center location.</p>
                  <p>3. Fill in the profile details matching your physical passport.</p>
                  <p>4. Complete the payment of ₹16,900.</p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="section-8" ref={sectionRefs['section-8']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                8. TOEFL Eligibility: Documents Required for TOEFL
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  ETS has set no specific eligibility restrictions. Anyone is welcome to write the test. Typically, test takers are over 16 years of age and possess a valid physical passport.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="section-9" ref={sectionRefs['section-9']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                9. TOEFL Syllabus: What Does the Test Contain?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  TOEFL covers Reading, Listening, Speaking, and Writing. The shortened test duration limits the time to 2 hours.
                </p>
                <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-3">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-150">
                        <th className="p-3">TOEFL Section</th>
                        <th className="p-3">Format Breakdown</th>
                        <th className="p-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-805">Reading</td>
                        <td className="p-3">2 passages, 10 questions each</td>
                        <td className="p-3">36 minutes</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-805">Listening</td>
                        <td className="p-3">3-4 lectures & 2-3 conversations</td>
                        <td className="p-3">41-57 minutes</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-805">Speaking</td>
                        <td className="p-3">4 academic tasks</td>
                        <td className="p-3">17 minutes</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-805">Writing</td>
                        <td className="p-3">2 tasks (including Academic Discussion)</td>
                        <td className="p-3">30 minutes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section id="section-10" ref={sectionRefs['section-10']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                10. TOEFL Books: What are the Best Resources for the TOEFL?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Top reference manuals recommended for self-study and practice:
                </p>
                <div className="space-y-3">
                  {[
                    { num: "1", name: "The Official Guide to the TOEFL iBT Test", desc: "Official diagnostic test guides direct from ETS." },
                    { num: "2", name: "The TOEFL iBT Test Prep Planner", desc: "Structured timeline tracker matching vocabulary and skills goals." },
                    { num: "3", name: "Official TOEFL iBT Tests, Volumes 1 & 2", desc: "Set of past real exam papers for mock simulations." }
                  ].map((book) => (
                    <div key={book.num} className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                        {book.num}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-805 uppercase">{book.name}</h4>
                        <p className="text-slate-500 text-[11px] mt-1 font-semibold leading-relaxed">{book.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 11 */}
            <section id="section-11" ref={sectionRefs['section-11']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                11. TOEFL Practice Tests: Boost your Preparation!
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Regular mock tests are critical to get used to the shortened 2-hour format, manage sections timing, and isolate weaknesses.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="section-12" ref={sectionRefs['section-12']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                12. Top Global Universities Accepting TOEFL
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold mb-6">
                <p>
                  Check B-school program score requirements in major study destinations.
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
                              <span className="font-bold text-slate-700 block mt-0.5">TOEFL Required</span>
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

          {/* Right Sidebar Widgets */}
          <aside className="sticky top-28 space-y-6">
            
            {/* Widget: Live workshops */}
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

            {/* Widget: AI University Matcher */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={20} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">AI University Matcher</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-5 font-normal">
                Match your target TOEFL score with top global universities and admission cutoffs.
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
              { q: "What is the TOEFL score range, and how is it calculated?", a: "Each of the 4 sections is scored 0-30. The total score range is 0-120." },
              { q: "Can I take the TOEFL exam multiple times?", a: "Yes, you can take the TOEFL as many times as you like. You can take it once in any 3-day period." },
              { q: "How long does it take to receive TOEFL scores?", a: "TOEFL iBT scores are typically available online 4-8 days after your test date." },
              { q: "Is there a limit on how many times I can send scores?", a: "You can send scores to 4 universities for free. Beyond that, additional reports cost ₹1,950 per university." },
              { q: "Is TOEFL harder than IELTS?", a: "It depends on preference: TOEFL is fully computer-delivered, whereas IELTS offers paper and face-to-face speaking formats." },
              { q: "Which is cheaper among IELTS and TOEFL in India?", a: "TOEFL iBT is slightly cheaper at ₹16,900 compared to ₹18,000 for standard IELTS Academic." }
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

export default TOEFLOverview;
