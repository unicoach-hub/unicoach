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

const PTEOverview = () => {
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
    { id: 'section-1', label: '1. What is PTE?' },
    { id: 'section-2', label: '2. Accepted Countries' },
    { id: 'section-3', label: '3. PTE Eligibility' },
    { id: 'section-4', label: '4. PTE Exam Format' },
    { id: 'section-5', label: '5. PTE Fees in India' },
    { id: 'section-6', label: '6. Score Calculation' },
    { id: 'section-7', label: '7. PTE Registration' },
    { id: 'section-8', label: '8. Dates and Centers' },
    { id: 'section-9', label: '9. How to Prepare' },
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
          <span className="text-slate-600 font-bold">PTE</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          {/* Backdrop photo for rich aesthetics */}
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80" 
              alt="PTE Student Collaboration" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Compass size={14} />
              Pearson Test of English
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              PTE Exam 2026: Full Form, Fees, Dates, Eligibility & Exam Pattern
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              The PTE Academic is the leading computer-based choice for students who value speed and fairness. With results typically out in 48 hours, it’s the fastest way to secure university spots in 2026.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: January 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                PTE Hybrid Scoring active
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
            <h4 className="font-extrabold text-slate-850 text-sm">Latest PTE Updates</h4>
            <div className="text-xs text-slate-655 font-semibold mt-0.5 space-y-1">
              <p>• <strong>Hybrid Scoring model:</strong> Any PTE exam scheduled on or after August 7, 2025 utilizes double-marking for open-ended tasks like the Essay to ensure human checks verify AI scoring.</p>
              <p>• <strong>Standard Registration Fee:</strong> The updated PTE exam fee in India is standard at ₹18,000 (including 18% GST).</p>
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
                      ? 'bg-indigo-50 text-indigo-650 shadow-sm'
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
                1. What is the PTE Exam?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Conducted by Pearson Language Tests, the <strong>PTE Academic</strong> (Pearson Test of English) evaluates four core skills: <strong>Speaking, Writing, Reading, and Writing</strong> in a computer-based setting. The exam uses advanced AI scoring to ensure unbiased and objective evaluations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 my-6">
                  {[
                    { title: "Fast Results", desc: "Most students receive their official score reports within 24 to 48 hours." },
                    { title: "Flexible Slots", desc: "Offered year-round at secure test centers across 62+ locations in India." },
                    { title: "Unlimited Reporting", desc: "Send your scorecards to as many universities as you like for free." },
                    { title: "Integrated Grading", desc: "Many tasks evaluate multiple communication skills simultaneously (e.g. Read Aloud)." }
                  ].map((item, idx) => (
                    <div key={idx} className="border border-slate-100 p-4.5 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <h4 className="font-black text-slate-800 text-xs mb-1 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-indigo-500" />
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" ref={sectionRefs['section-2']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                2. PTE Accepted Countries
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  PTE Academic is recognised by thousands of universities worldwide. Key destinations that accept PTE Academic for study admissions and student visas include:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2 text-xs font-bold text-slate-700">
                  {[
                    { name: "USA", code: "us" },
                    { name: "UK", code: "gb" },
                    { name: "Canada", code: "ca" },
                    { name: "Australia", code: "au" },
                    { name: "New Zealand", code: "nz" },
                    { name: "Ireland", code: "ie" },
                    { name: "Germany", code: "de" },
                    { name: "Singapore", code: "sg" }
                  ].map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-indigo-200 hover:shadow-xs p-3 rounded-xl transition-all"
                    >
                      <img
                        src={`https://flagcdn.com/w40/${c.code}.png`}
                        alt={c.name}
                        className="w-5 h-3.5 object-cover rounded-xs shadow-xs flex-shrink-0"
                        loading="lazy"
                      />
                      <span className="text-slate-800 font-semibold">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" ref={sectionRefs['section-3']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                3. PTE Exam Eligibility Criteria
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Pearson has designed PTE Academic to be widely accessible to global candidates:
                </p>
                <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-xs text-slate-500 space-y-2">
                  <p>• <strong>Age:</strong> Minimum age limit is 16 years. Candidates aged 16-17 must provide a signed parental consent form.</p>
                  <p>• <strong>Education:</strong> No specific academic credentials or degrees are mandatory to book a slot.</p>
                  <p>• <strong>Passport Identification:</strong> For Indian applicants, a valid original physical passport is the only accepted identity verification document on test day.</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section-4" ref={sectionRefs['section-4']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                4. What is the Format of the PTE Exam?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  The test takes approximately 2 hours and 15 minutes to complete. The structural sections are outlined below:
                </p>
                <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-3">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-150">
                        <th className="p-3">PTE Section</th>
                        <th className="p-3">Format & Scope</th>
                        <th className="p-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-805">Speaking & Writing</td>
                        <td className="p-3">Read aloud, repeat sentence, describe image, summarizing, essay, new situations task.</td>
                        <td className="p-3">54 - 67 minutes</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-805">Reading</td>
                        <td className="p-3">Fill in the blanks (reading & writing dropdowns), re-order paragraphs, multiple choice.</td>
                        <td className="p-3">29 - 30 minutes</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-805">Listening</td>
                        <td className="p-3">Summarize spoken text, gap fills, dictation, highlight incorrect words, multiple choice.</td>
                        <td className="p-3">30 - 43 minutes</td>
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
                5. PTE Exam Fees in India 2026
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  PTE fees are standardized. Last-minute bookings or rescheduling buffer rules incur additional fees.
                </p>
                <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-3">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-150">
                        <th className="p-3">Service Category</th>
                        <th className="p-3">Fee Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-805">Standard PTE Exam Fee (with GST)</td>
                        <td className="p-3">₹18,000</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3">Base Fee (excluding GST)</td>
                        <td className="p-3">₹15,254.24</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3">Late Booking Surcharge (within 48 hours)</td>
                        <td className="p-3">₹695 (approx.)</td>
                      </tr>
                      <tr>
                        <td className="p-3">Rescheduling / Cancellation Surcharge</td>
                        <td className="p-3">Varies by timeline buffer</td>
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
                6. PTE Exam Score Calculation
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Scores are measured on the Global Scale of English (GSE), ranging from **10 to 90 points**. Let's review the standardized score conversion equivalents:
                </p>
                <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-3 shadow-sm">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-150">
                      <tr>
                        <th className="py-3 px-4 text-xs font-black text-slate-500">PTE Score Band</th>
                        <th className="py-3 px-4 text-xs font-black text-slate-500">IELTS Equivalent Band</th>
                        <th className="py-3 px-4 text-xs font-black text-slate-500">Skill Level Descriptor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-650 font-semibold text-xs">
                      <tr>
                        <td className="py-3.5 px-4 font-bold">85 – 90</td>
                        <td className="py-3.5 px-4">9.0</td>
                        <td className="py-3.5 px-4 text-emerald-650">Expert User</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-bold">79 – 84</td>
                        <td className="py-3.5 px-4">8.0</td>
                        <td className="py-3.5 px-4 text-emerald-650">Very Good User</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-bold">65 – 78</td>
                        <td className="py-3.5 px-4">7.0</td>
                        <td className="py-3.5 px-4 text-indigo-650">Good User</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-bold">50 – 64</td>
                        <td className="py-3.5 px-4">6.0</td>
                        <td className="py-3.5 px-4 text-slate-500">Competent User</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" ref={sectionRefs['section-7']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                7. PTE Registration in India
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  To register, visit the official Pearson PTE portal. Make sure your profile details match your physical passport.
                </p>
                <div className="p-4 bg-amber-50 border border-amber-100 text-amber-900 rounded-xl text-xs space-y-1.5">
                  <p>• <strong>Surname Dot Rule:</strong> If your Indian passport has a blank surname field, you must type a full stop (.) in the surname field during registration to avoid mismatch errors.</p>
                  <p>• <strong>No duplicates:</strong> If you forget login credentials, do not open a second profile. Duplicate accounts trigger security blocks and cancel bookings.</p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="section-8" ref={sectionRefs['section-8']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                8. PTE Exam Dates and Centers
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  With slots open almost every day of the week, booking a center slot is highly convenient. Booking at least 2-3 weeks early is recommended. Noise-canceling headsets are provided at centers.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="section-9" ref={sectionRefs['section-9']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                9. How to Prepare for the PTE Exam?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Familiarize yourself with the automated testing environment. Focus on natural fluency instead of strict templates. Practice with AI-driven mock platforms like UniCoach AI.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="section-10" ref={sectionRefs['section-10']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                10. Recommended Books for PTE Prep
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <div className="space-y-3">
                  {[
                    { num: "1", name: "The Official Guide to PTE Academic (Pearson)", desc: "Contains official diagnostic question templates and answers direct from the makers." },
                    { num: "2", name: "PTE Academic Expert (Clare Walsh & Lindsay Warwick)", desc: "Deep analytical breakdown of academic vocabulary and reading logic." },
                    { num: "3", name: "PTE Academic Practice Tests Plus (Pearson)", desc: "Contains real past exam papers for timed mock drills." }
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
                11. Practice Tests & Mock Assessments
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Taking weekly mock tests is essential to build stamina. Refine pronunciation and note down details during lecture playbacks to ensure high AI grading marks.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="section-12" ref={sectionRefs['section-12']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                12. Top Global Universities Accepting PTE
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold mb-6">
                <p>
                  Review undergraduate and postgraduate cutoff targets across study destinations.
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
                              <span className="font-bold text-slate-700 block mt-0.5">PTE Required</span>
                            </div>
                          </div>
                        </div>

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
            
            {/* Widget: Live session */}
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
                Match your target PTE score with top global universities and admission cutoffs.
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
              { q: "What is the PTE Academic exam for?", a: "PTE Academic is a computer-based English language test designed for study abroad and immigration purposes." },
              { q: "Is the PTE exam easier than IELTS?", a: "It depends on preference. PTE is fully computer-delivered and scored by AI. Candidates who prefer speaking to a microphone and fast results find it easier." },
              { q: "How much does PTE cost in India?", a: "The registration fee for PTE Academic in India is ₹18,000 (including GST)." },
              { q: "Can I take the PTE exam multiple times?", a: "Yes, there is no limit to the number of attempts. You can book a test once your previous score is published." },
              { q: "How long is a PTE score valid?", a: "PTE score reports are valid for 2 years from your test date." },
              { q: "Which countries accept PTE Academic?", a: "It is widely accepted for university admissions and student visas in the USA, UK, Canada, Australia, and New Zealand." }
            ].map((faq, idx) => {
              const isOpen = !!faqOpen[idx];
              return (
                <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-755 hover:text-indigo-650 transition-colors"
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

export default PTEOverview;
