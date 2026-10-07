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
    name.toLowerCase().includes('stanford') ? 'stanford.edu' :
    name.toLowerCase().includes('columbia') ? 'columbia.edu' :
    name.toLowerCase().includes('northeastern') ? 'northeastern.edu' :
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

const GREOverview = () => {
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
    { id: 'section-1', label: '1. What is GRE?' },
    { id: 'section-2', label: '2. GRE Exam Dates' },
    { id: 'section-3', label: '3. GRE Exam Fees' },
    { id: 'section-4', label: '4. GRE Results' },
    { id: 'section-5', label: '5. What is a GRE Score?' },
    { id: 'section-6', label: '6. GRE Test Centres' },
    { id: 'section-7', label: '7. GRE Registration' },
    { id: 'section-8', label: '8. GRE Eligibility' },
    { id: 'section-9', label: '9. Syllabus & Pattern' },
    { id: 'section-10', label: '10. Recommended Books' },
    { id: 'section-11', label: '11. Practice Tests' },
    { id: 'section-12', label: '12. B-Schools & Universities' }
  ];

  const countries = ['USA', 'UK', 'Canada', 'Australia', 'Ireland'];

  const universityData = {
    USA: [
      { name: 'Stanford University', location: 'Stanford, CA', rank: 'QS #5', tuition: '₹ 48.0 Lakh/Yr', logo: '/logos/Stanford_University.svg', domain: 'stanford.edu', image: '/images/universities/stanford.jpg', path: '/study-abroad/usa/universities/stanford' },
      { name: 'Columbia University', location: 'New York, NY', rank: 'QS #23', tuition: '₹ 51.2 Lakh/Yr', logo: '/logos/Columbia_University_in_the_City_of_New_York.webp', domain: 'columbia.edu', image: '/images/universities/columbia.jpg', path: '/study-abroad/usa/universities/columbia' },
      { name: 'Northeastern University', location: 'Boston, MA', rank: 'QS #380', tuition: '₹ 39.8 Lakh/Yr', logo: '/logos/Northeastern_University.webp', domain: 'northeastern.edu', image: '/images/universities/northeastern.jpg', path: '/study-abroad/usa/universities/northeastern' },
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
          <span className="text-slate-600 font-bold">GRE</span>
        </div>

        {/* Hero Header Card */}
        <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden mb-12 shadow-xl border border-indigo-950">
          {/* Backdrop photo for rich aesthetics */}
          <div className="absolute inset-0 z-0 opacity-15 mix-blend-overlay pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=80" 
              alt="GRE Study Group" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-6">
              <Compass size={14} />
              Comprehensive GRE Guide
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
              GRE Exam for Indian Students in 2025: A Complete Guide
            </h1>
            <p className="text-indigo-200/90 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Achieve admission to premium MS and MBA programs globally. Get standard details on GRE General & Subject tests, registrations, syllabus updates, pricing schedules, and score validations.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Clock size={13} className="text-indigo-400" />
                Updated: May 2025
              </span>
              <span className="flex items-center gap-1.5 bg-slate-955/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <Award size={13} className="text-indigo-400" />
                ETS Shorter Edition updates active
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
            <h4 className="font-extrabold text-slate-850 text-sm">Latest ETS GRE Updates</h4>
            <div className="text-xs text-slate-655 font-semibold mt-0.5 space-y-1">
              <p>• ETS has announced several new updates in GRE, including a shorter duration, removal of tasks, and reduced number of questions.</p>
              <p>• The GRE Subject Test is no longer applicable in India. Registration for shorter GRE is now open!</p>
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
                1. What is GRE?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  GRE, or <strong>Graduate Record Exam</strong>, is one of the most common exams required for post-graduate studies abroad. It is conducted by the <strong>Educational Testing Services (ETS)</strong>, which also owns the popular TOEFL exam.
                </p>
                <p>
                  There are two types of GRE: the <strong>GRE General test</strong> and the <strong>GRE Subject test</strong>. The GRE General exam evaluates your Verbal, Quantitative, and Analytical writing skills.
                </p>
                <div className="bg-indigo-50/10 border border-slate-100 p-4.5 rounded-2xl text-xs text-slate-500 space-y-2 mt-4">
                  <p>• <strong>Wide Acceptability:</strong> Accepted by over 1,300 business schools in over 72 countries, including the USA, Canada, UK, and more!</p>
                  <p>• <strong>Graduate Preparedness:</strong> Indicates your readiness for university education, making it highly preferred for business and law courses.</p>
                  <p>• <strong>Profile Booster:</strong> Strongly enhances your candidate portfolio whether applying to universities or seeking jobs abroad.</p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" ref={sectionRefs['section-2']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                2. GRE Dates: When is the GRE Exam Conducted?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  The GRE General Test is available throughout the year. Booking dates vary depending on your test centre. We advise booking the test 2-3 months early to ensure you get your desired slot.
                </p>
                <p><strong>Sample Availability (Bangalore & Hyderabad):</strong></p>
                <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-3">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-150">
                        <th className="p-3">Location</th>
                        <th className="p-3">Months</th>
                        <th className="p-3">Available Dates (2024-2025)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-105">
                        <td className="p-3 font-bold text-slate-805">Hyderabad</td>
                        <td className="p-3 font-bold text-slate-500">Oct - Dec</td>
                        <td className="p-3 text-[11px] text-slate-500">October (5-19, 21-30), November (1-30), December (1-31)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-805">Bangalore</td>
                        <td className="p-3 font-bold text-slate-500">Oct - Apr</td>
                        <td className="p-3 text-[11px] text-slate-500">October (5-11, 13-18, 22-26, 28, 29, 31), Nov-Dec (Various), Jan-April 2025 (Multiple Slots)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" ref={sectionRefs['section-3']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                3. GRE Fees: How much does the GRE Cost?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  The booking fee for the GRE General Test in India is <strong>₹22,550</strong>. Additional service fees apply depending on post-registration requests:
                </p>
                <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-3">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-150">
                        <th className="p-3">GRE Service Request</th>
                        <th className="p-3">Fees in India (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-805">GRE General Test Fee</td>
                        <td className="p-3">₹22,550</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3">Rescheduling / Test Center Change</td>
                        <td className="p-3">₹5,000</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3">Additional Score Report</td>
                        <td className="p-3">₹2,900</td>
                      </tr>
                      <tr>
                        <td className="p-3">Score Review Request</td>
                        <td className="p-3">₹5,900</td>
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
                4. GRE Result: How do You Check Your GRE Results?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Official GRE General Test results are released within <strong>10-15 days</strong> of your test date.
                </p>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500 space-y-2">
                  <p>• <strong>Notification:</strong> ETS sends an email notification as soon as scores are ready on your online account dashboard.</p>
                  <p>• <strong>Reporting:</strong> Scores are sent to your chosen 4 universities within the same 10-15 days window.</p>
                  <p>• <strong>Validity:</strong> GRE results remain valid for exactly <strong>5 years</strong> from the test date.</p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section-5" ref={sectionRefs['section-5']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                5. What is a GRE Score?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  The GRE General test score range spans from <strong>130 to 170</strong> for Verbal & Quantitative sections. AW is scored separately.
                </p>
                <div className="overflow-x-auto border border-slate-200/60 rounded-2xl my-3">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-150">
                        <th className="p-3">Section</th>
                        <th className="p-3">Score Range</th>
                        <th className="p-3">Score Increments</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-805">Verbal Reasoning</td>
                        <td className="p-3">130 – 170</td>
                        <td className="p-3">1-point increments (+1 per correct answer)</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-805">Quantitative Reasoning</td>
                        <td className="p-3">130 – 170</td>
                        <td className="p-3">1-point increments (+1 per correct answer)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-805">Analytical Writing</td>
                        <td className="p-3">0 – 6</td>
                        <td className="p-3">0.5-point increments</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-indigo-50/50 p-4 border border-indigo-150 rounded-2xl text-xs text-indigo-950 font-bold">
                  💡 A combined score above 300 is considered a good GRE score and opens doors to top-tier universities worldwide.
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="section-6" ref={sectionRefs['section-6']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                6. GRE Test Centre: Where Can You Take the GRE?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  GRE has over 1,000 test centres spread across 160 countries. In India, exams are conducted at centers in major cities:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold text-slate-600">
                  {["Ahmedabad", "Bangalore", "New Delhi", "Chennai", "Hyderabad", "Mumbai", "Pune", "Kolkata"].map((city) => (
                    <div key={city} className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 text-center">
                      {city}
                    </div>
                  ))}
                </div>
                <p>
                  Candidates can also choose the <strong>GRE at Home</strong> version. Note that you should check if your target universities accept home testing before booking.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" ref={sectionRefs['section-7']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                7. GRE Registration: How do I register for the GRE?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Registering is simple and fully online via the ETS website:
                </p>
                <div className="space-y-3.5 text-xs text-slate-500 my-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-extrabold text-slate-800 block mb-1">Step 1: Profile Setup</span>
                    Create an ETS account, ensuring names and details exactly match your physical passport.
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-extrabold text-slate-800 block mb-1">Step 2: Slot Booking</span>
                    Search by location/timezone, pick an available test center and date.
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="font-extrabold text-slate-800 block mb-1">Step 3: Payment</span>
                    Submit the ₹22,550 fee using credit/debit card, e-check, UPI, or PayPal.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="section-8" ref={sectionRefs['section-8']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                8. GRE Eligibility: Documents Required for GRE
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  ETS has set no strict age limits or academic qualifiers for taking the GRE.
                </p>
                <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl text-xs text-slate-500 space-y-2">
                  <p>• <strong>Primary ID:</strong> A valid physical passport is mandatory for all Indian test takers. Photocopies are strictly rejected.</p>
                  <p>• <strong>Name Check:</strong> Your registration name must match your passport exactly to prevent center disqualifications.</p>
                  <p>• <strong>Aadhaar Status:</strong> Aadhar cards were temporarily accepted due to proctor setups, but passport remains the standard.</p>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section id="section-9" ref={sectionRefs['section-9']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                9. GRE Syllabus & Pattern: What Does the Test Contain?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  The shorter GRE features a reduced question count and eliminates the separate essay task, lasting under 2 hours.
                </p>
                <div className="p-4 bg-indigo-50/10 border border-slate-100 rounded-2xl text-xs text-slate-500 space-y-2">
                  <p>• <strong>Verbal Reasoning:</strong> Evaluates ability to parse passages, select vocabulary, and comprehend complex structures.</p>
                  <p>• <strong>Quantitative Reasoning:</strong> Covers high school arithmetic, algebra, data analysis, and basic geometry concepts.</p>
                  <p>• <strong>Analytical Writing:</strong> Tests argument structures and issue breakdowns via one task (Analyse an Issue).</p>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section id="section-10" ref={sectionRefs['section-10']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                10. GRE Books: What are the Best Resources for the GRE?
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Top reference guides recommended by coaches for exam preparation:
                </p>
                <div className="space-y-3">
                  {[
                    { num: "1", name: "The Official Guide to the GRE General Test by ETS", desc: "The definitive guide with mock diagnostics from the actual test makers." },
                    { num: "2", name: "Official GRE Super Power Pack (ETS)", desc: "Includes advanced verbal & quantitative test questions." },
                    { num: "3", name: "Princeton Review GRE Premium Prep", desc: "Comprehensive review set providing detailed analytical writeups." },
                    { num: "4", name: "Barron's GRE Test Prep", desc: "Solid vocab lists and quant worksheets for comprehensive coverage." }
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
                11. GRE Practice Tests: Boost your Preparation!
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Official diagnostic mocks from ETS are the most reliable tool to predict actual exam scores and get used to timing limits.
                </p>
                <p>
                  Ensure you schedule regular mock evaluations during your 2-3 months preparation window.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="section-12" ref={sectionRefs['section-12']} className="scroll-mt-28">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                12. Top Global Universities Accepting GRE Scores
              </h2>
              <div className="text-slate-655 text-sm leading-relaxed space-y-4 font-semibold mb-6">
                <p>
                  Explore universities accepting GRE scores across USA, UK, Canada, Australia, and Ireland.
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
                              <span className="font-bold text-slate-700 block mt-0.5">GRE Required</span>
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
                Unsure if you qualify for GRE waivers at target schools? Get instant AI suggestions.
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
              { q: "How long is the GRE?", a: "The shorter GRE General Test takes exactly 1 hour and 58 minutes to complete." },
              { q: "Is the GRE compulsory for MS in the USA?", a: "Many universities have made it optional or offer waivers, but a high score significantly boosts admissions and merit scholarships." },
              { q: "How long are GRE scores valid?", a: "GRE scores are valid for exactly 5 years from your test date." },
              { q: "How many times can I take the GRE in a year?", a: "You can take the GRE once every 21 days, up to 5 times in a continuous rolling 12-month period." },
              { q: "Can I use a calculator during the GRE test?", a: "An on-screen calculator is provided during the Quantitative Reasoning section. Physical calculators are prohibited." },
              { q: "Is there a negative marking on the GRE?", a: "No, there is no negative marking for incorrect answers. Attempting all questions is highly encouraged." }
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

export default GREOverview;
