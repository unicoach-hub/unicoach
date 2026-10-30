import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  GraduationCap,
  HelpCircle,
  Clock,
  MapPin,
  Compass,
  ArrowRight,
  Award,
  ChevronRight,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { StatStrip, TimelineStrip, Donut } from '../../../components/ui/Infographics';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { BookOkCta } from '../../../components/desi/BookOkCta';

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
        <div className="w-full h-full bg-[#16130F] flex items-center justify-center text-white rounded">
          <GraduationCap size={16} />
        </div>
      )}
    </div>
  );
};

const GMATOverview = () => {
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
    <div className="min-h-screen bg-[#FFF6E5] pb-20 font-['Onest',sans-serif] text-[#16130F]">

      {/* Hero: poster band */}
      <DesiHero
        tone="rani"
        sign={{ hi: 'जीमैट', en: 'GMAT DESK' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams' }, { label: 'GMAT' }]}
        title="GMAT Exam Focus Edition 2026: The Complete Guide for Indian Students"
        subtitle="Maximize your B-School application with the ultimate breakdown of GMAT registration, syllabus changes, exam fees, slot booking details, and rankings updates."
        stickers={(
          <>
            <Sticker bg="#FFF6E5" tilt={-2}><Compass size={14} />Comprehensive GMAT Guide</Sticker>
            <Sticker tilt={1.5}><Clock size={14} />Updated: January 2026</Sticker>
            <Sticker bg="#FCE38A" tilt={-1}><Award size={14} />New Focus Edition syllabus</Sticker>
          </>
        )}
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-10 pt-10">
        {/* Alert updates banner */}
        <div className="flex items-start sm:items-center gap-4 bg-[#FFF1B8] border-[3px] border-[#16130F] p-4 sm:p-5 rounded-2xl mb-12 shadow-[5px_5px_0_#16130F] -rotate-[0.3deg]">
          <div className="w-10 h-10 rounded-xl bg-[#D0362E] border-2 border-[#16130F] flex items-center justify-center text-white flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-['Rozha_One',serif] text-[14px] leading-none text-[#D0362E]">ताज़ा ख़बर</p>
            <h4 className="mt-1 font-urbanist font-black text-[#16130F] text-[16px]">Latest GMAT Focus Update</h4>
            <p className="text-xs text-[#3D362E] font-semibold mt-0.5">
              The classic 3-hour GMAT format is now fully discontinued. The new 2 hour and 15 minute Focus Edition exam featuring Data Insights is the standard exam.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)_230px] xl:grid-cols-[280px_minmax(0,1fr)_300px] gap-8 items-start">
          
          {/* Left Sticky Sidebar Index */}
          <aside className="hidden lg:block sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-1.5 pb-2">
            <InkCard className="p-4">
            <p className="font-['Rozha_One',serif] text-[15px] text-[#D0362E] leading-none">इस पेज पर</p>
            <p className="mt-1 mb-3 font-urbanist font-black text-[15px] text-[#16130F]">On This Page</p>
            <nav className="flex flex-col gap-1.5">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={activeSection === item.id ? { background: '#B8285B', color: '#FFFFFF' } : undefined}
                  className={`no-shine w-full text-left py-2 px-3 rounded-lg border-2 text-[12.5px] font-bold leading-normal cursor-pointer transition-colors ${activeSection === item.id ? 'border-[#16130F] shadow-[3px_3px_0_#16130F]' : 'border-transparent text-[#3D362E] hover:border-[#16130F] hover:bg-[#FFF6E5]'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            </InkCard>
          </aside>

          {/* Center Main Guide Column */}
          <main className="min-w-0 space-y-14 bg-white border-[3px] border-[#16130F] p-5 sm:p-8 md:p-10 rounded-[14px] shadow-[5px_5px_0_#16130F]">
            
            {/* Section 1 */}
            <section id="section-1" ref={sectionRefs['section-1']} className="scroll-mt-28">
              <DesiHeading hi="शुरुआत" className="mb-5">1. GMAT Exam Overview</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  GMAT, or <strong>Graduate Management Admission Test</strong>, is a globally recognized computer-adaptive exam. Owned and operated by the <strong>Graduate Management Admission Council (GMAC)</strong>, it is the primary benchmark for entrance into top-tier business schools and MBA programmes globally.
                </p>
                <p>
                  The newly launched <strong>GMAT Focus Edition</strong> streamlines the test, making it faster, more logical, and centered on modern business data analysis skills. Here is a quick breakdown of GMAT Focus:
                </p>
                <ul className="list-disc list-inside space-y-2 text-xs text-[#5B544A] bg-[#FFF6E5] border-2 border-[#16130F] p-4.5 rounded-2xl shadow-[4px_4px_0_#16130F]">
                  <li><strong>Total Duration:</strong> 2 hours and 15 minutes (with 1 optional 10-minute break).</li>
                  <li><strong>AWA Removed:</strong> The analytical writing section is completely discontinued.</li>
                  <li><strong>Data Insights:</strong> A new core section checking critical data interpretation.</li>
                  <li><strong>Modes:</strong> Delivered either at a local test centre or online at home.</li>
                </ul>
                <StatStrip
                  stats={[
                    { value: '2h 15m', label: 'Total duration, plus an optional 10-minute break' },
                    { value: '205–805', label: 'Total score range' },
                    { value: 'US$275', label: 'Test centre fee (US$300 online)' }
                  ]}
                />
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" ref={sectionRefs['section-2']} className="scroll-mt-28">
              <DesiHeading hi="पेपर का ढाँचा" className="mb-5">2. Syllabus & Exam Pattern</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  The GMAT Focus Edition consists of 3 distinct sections. Candidates can choose their own section order at the start of the test.
                </p>
                <div>
                  <Donut
                    kicker="45 minutes each"
                    title="Questions per GMAT section"
                    segments={[
                      { label: 'Verbal Reasoning', value: 23, display: '23 Qs' },
                      { label: 'Quantitative Reasoning', value: 21, display: '21 Qs' },
                      { label: 'Data Insights', value: 20, display: '20 Qs' }
                    ]}
                    centerValue="3"
                    centerLabel="sections"
                  />
                </div>

                {/* Pattern Table */}
                <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] my-4">
                  <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F] font-bold uppercase">
                        <th className="p-3 font-black">Section</th>
                        <th className="p-3 font-black">Duration</th>
                        <th className="p-3 font-black">No. of Questions</th>
                        <th className="p-3 font-black">Format & Scope</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#3D362E] font-semibold">
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3 font-bold text-[#16130F]">Quantitative Reasoning</td>
                        <td className="p-3">45 Minutes</td>
                        <td className="p-3">21 Questions</td>
                        <td className="p-3">Arithmetic & Algebra. No geometry, no calculator allowed.</td>
                      </tr>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3 font-bold text-[#16130F]">Verbal Reasoning</td>
                        <td className="p-3">45 Minutes</td>
                        <td className="p-3">23 Questions</td>
                        <td className="p-3">Reading Comprehension & Critical Reasoning. No sentence correction.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#16130F]">Data Insights</td>
                        <td className="p-3">45 Minutes</td>
                        <td className="p-3">20 Questions</td>
                        <td className="p-3">Data Sufficiency, Graphics, Tables, Multi-source. Calculator permitted.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#FBD9E6] p-4 border-2 border-[#16130F] rounded-2xl mt-4 text-xs text-[#16130F] shadow-[4px_4px_0_#16130F]">
                  <strong>Quant Syllabus Breakdown:</strong> Focuses heavily on number properties, fractions, decimals, percentages, ratios, algebra, rate/speed/time, work equations, and basic statistics (mean, median, mode).
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" ref={sectionRefs['section-3']} className="scroll-mt-28">
              <DesiHeading hi="किताबें" className="mb-5">3. Registration & Booking Process</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  You can register for the GMAT exam up to 6 months before your target test date. We advise booking at least 3 months in advance to lock in your preferred date and slot, especially for physical test centres.
                </p>
                <div className="space-y-3.5 text-xs text-[#5B544A] font-semibold my-6">
                  <div className="p-4 bg-[#FFF6E5] rounded-xl border-2 border-[#16130F]">
                    <span className="font-black text-[#B8285B] block mb-1">Step 1: Account Creation</span>
                    Visit the official GMAT website (MBA.com) and set up your student profile with precise details matching your passport.
                  </div>
                  <div className="p-4 bg-[#FFF6E5] rounded-xl border-2 border-[#16130F]">
                    <span className="font-black text-[#B8285B] block mb-1">Step 2: Choose Delivery Mode</span>
                    Select either "Online Exam (At Home)" or "Test Center Delivery" depending on your preferences.
                  </div>
                  <div className="p-4 bg-[#FFF6E5] rounded-xl border-2 border-[#16130F]">
                    <span className="font-black text-[#B8285B] block mb-1">Step 3: Select Centers & Dates</span>
                    Search for test centers in cities like Bangalore, Delhi, Mumbai, Hyderabad, Pune, or Kolkata, and choose a time.
                  </div>
                  <div className="p-4 bg-[#FFF6E5] rounded-xl border-2 border-[#16130F]">
                    <span className="font-black text-[#B8285B] block mb-1">Step 4: Fee Settlement</span>
                    Complete payment using a valid international debit/credit card. Declined cards will lead to slot cancellations.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section-4" ref={sectionRefs['section-4']} className="scroll-mt-28">
              <DesiHeading hi="फ़ीस" className="mb-5">4. Fees & Payment Modes</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  GMAT fees are set in US dollars (mba.com): US$275 at a test centre and US$300 online. In India, taxes are added at checkout, and the rupee amount depends on the exchange rate on the day you pay.
                </p>

                {/* Fees table */}
                <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] my-4">
                  <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F] font-bold uppercase">
                        <th className="p-3 font-black">Service</th>
                        <th className="p-3 font-black">Delivered at Test Center</th>
                        <th className="p-3 font-black">Delivered Online</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#3D362E] font-semibold">
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3 font-bold text-[#16130F]">GMAT Focus Exam Fee</td>
                        <td className="p-3">US$275 (~INR 22,950)</td>
                        <td className="p-3">US$300 (~INR 25,040)</td>
                      </tr>
                      <tr className="border-b border-[#16130F]/15">
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
              <DesiHeading hi="बदलाव और रिफ़ंड" className="mb-5">5. Rescheduling & Cancellation Fees</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  If you need to change your GMAT exam details, you can reschedule or cancel, but fees apply based on your advance notice window.
                </p>
                <div>
                  <TimelineStrip
                    kicker="Test centre / online · notice period"
                    title="Reschedule fee vs cancellation refund"
                    steps={[
                      { when: '> 60 days', what: 'Reschedule USD 55 / 60', note: 'Refund USD 110 / 120', highlight: true },
                      { when: '15 to 60 days', what: 'Reschedule USD 110 / 120', note: 'Refund USD 80 / 90' },
                      { when: '14 days or less', what: 'Reschedule USD 165 / 180', note: 'Refund USD 55 / 60' },
                      { when: '< 24 hours', what: 'No rescheduling', note: 'No refund' }
                    ]}
                  />
                </div>

                {/* Reschedule Cancellation Table */}
                <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] my-4">
                  <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F] font-bold uppercase">
                        <th className="p-3 font-black">Notice Window</th>
                        <th className="p-3 font-black">Rescheduling (Center / Online)</th>
                        <th className="p-3 font-black">Cancellation Refund (Center / Online)</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#3D362E] font-semibold">
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3 font-bold text-[#16130F]">More than 60 Days</td>
                        <td className="p-3">USD 55 / USD 60</td>
                        <td className="p-3">USD 110 Refund / USD 120 Refund</td>
                      </tr>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3 font-bold text-[#16130F]">15 to 60 Days</td>
                        <td className="p-3">USD 110 / USD 120</td>
                        <td className="p-3">USD 80 Refund / USD 90 Refund</td>
                      </tr>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3 font-bold text-[#16130F]">14 Days or less</td>
                        <td className="p-3">USD 165 / USD 180</td>
                        <td className="p-3">USD 55 Refund / USD 60 Refund</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#16130F]">Less than 24 Hours</td>
                        <td className="p-3 text-[#D0362E]">No Rescheduling</td>
                        <td className="p-3 text-[#D0362E]">No Refund</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="section-6" ref={sectionRefs['section-6']} className="scroll-mt-28">
              <DesiHeading hi="स्कोर" className="mb-5">6. Score Scale & Scoring System</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  GMAT Focus scoring scale has changed to separate old classic scores from new focus scores.
                </p>

                {/* Score Scale Table */}
                <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] my-4">
                  <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F] font-bold uppercase">
                        <th className="p-3 font-black">Exam Module</th>
                        <th className="p-3 font-black">Score Scale</th>
                        <th className="p-3 font-black">Score Increments</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#3D362E] font-semibold">
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3">Quantitative Reasoning</td>
                        <td className="p-3">60 to 90</td>
                        <td className="p-3">1 point</td>
                      </tr>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3">Verbal Reasoning</td>
                        <td className="p-3">60 to 90</td>
                        <td className="p-3">1 point</td>
                      </tr>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3">Data Insights</td>
                        <td className="p-3">60 to 90</td>
                        <td className="p-3">1 point</td>
                      </tr>
                      <tr className="bg-[#FBD9E6]">
                        <td className="p-3 font-bold text-[#16130F]">GMAT Total Score</td>
                        <td className="p-3 font-bold text-[#B8285B]">205 to 805</td>
                        <td className="p-3 font-bold">10 points</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#FFF6E5] p-4 border-2 border-[#16130F] rounded-2xl text-xs text-[#5B544A] font-semibold leading-relaxed shadow-[4px_4px_0_#16130F]">
                  <Lightbulb size={14} className="inline-block -mt-0.5 mr-1 text-[#D0362E]" /><strong>Important Note:</strong> All total GMAT Focus scores end in a 5 (e.g. 555, 645, 715). Standard classic GMAT scores end in a 0 (e.g. 600, 700). GMAT results are valid for exactly <strong>5 years</strong>.
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" ref={sectionRefs['section-7']} className="scroll-mt-28">
              <DesiHeading hi="किताबें" className="mb-5">7. Preparation & Recommended Books</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
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
                    <div key={book.num} className="flex gap-4 p-4 border-2 border-[#16130F] rounded-2xl bg-[#FFF6E5] shadow-[4px_4px_0_#16130F]">
                      <div className="w-8 h-8 rounded-full bg-[#16130F] text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                        {book.num}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#16130F] uppercase tracking-wide">{book.name}</h4>
                        <p className="text-[#5B544A] text-xs mt-1 font-semibold leading-relaxed">{book.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="section-8" ref={sectionRefs['section-8']} className="scroll-mt-28">
              <DesiHeading hi="कहाँ जाओगे" className="mb-5">8. Top Global Universities Accepting GMAT</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold mb-6">
                <p>
                  Explore top universities and business schools accepting GMAT scores in the USA, UK, Canada, Australia, and Ireland. Check details, QS rankings, average tuition fees, and verify eligibility.
                </p>
              </div>

              {/* Country Tabs */}
              <div className="flex flex-wrap gap-2 pb-4 mb-6 border-b-2 border-dashed border-[#16130F]/25">
                {countries.map((country) => (
                  <button
                    key={country}
                    onClick={() => setActiveCountry(country)}
                    aria-pressed={activeCountry === country}
                    className={`no-shine px-4 py-2 rounded-full border-2 border-[#16130F] text-xs font-black transition-colors cursor-pointer ${activeCountry === country ? 'bg-[#16130F] text-white shadow-[2px_2px_0_#F2B705]' : 'bg-white text-[#16130F] hover:bg-[#FCE38A]'}`}
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
                      className="bg-white border-[3px] border-[#16130F] rounded-[14px] overflow-hidden flex flex-col justify-between group shadow-[4px_4px_0_#16130F] transition-transform hover:-translate-y-1"
                    >
                      {/* Image header */}
                      <div className="h-32 w-full relative overflow-hidden bg-[#FFF6E5] border-b-[3px] border-[#16130F]">
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
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 bg-[#F2B705] border-2 border-[#16130F] text-[#16130F] font-black text-[10px] rounded-md uppercase tracking-wider rotate-2">
                          {uni.rank}
                        </span>
                      </div>

                      {/* Content block */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-white border-2 border-[#16130F] flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                              <UniLogo logo={uni.logo} name={uni.name} domain={uni.domain} />
                            </div>
                            <div>
                              <h4 className="font-urbanist font-black text-[#16130F] text-[15px] leading-tight">
                                {uni.name}
                              </h4>
                              <p className="text-[10px] text-[#8A7F70] font-semibold flex items-center gap-1 mt-0.5">
                                <MapPin size={10} />
                                {uni.location}
                              </p>
                            </div>
                          </div>

                          <div className="bg-[#FFF6E5] p-2.5 rounded-lg border-2 border-[#16130F] grid grid-cols-2 gap-2 text-center text-xs mt-4">
                            <div>
                              <span className="text-[9px] text-[#8A7F70] font-bold block uppercase tracking-wider">Est. Tuition</span>
                              <span className="font-bold text-[#B8285B] block mt-0.5">{uni.tuition}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-[#8A7F70] font-bold block uppercase tracking-wider">Standard Exam</span>
                              <span className="font-bold text-[#16130F] block mt-0.5">GMAT Required</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-5 border-t border-[#16130F]/15 pt-4">
                          <Link
                            to={uni.path}
                            className="no-shine flex-1 py-2 text-center border-2 border-[#16130F] bg-white hover:bg-[#FCE38A] text-[#16130F] font-bold text-xs rounded-full transition-colors"
                          >
                            Know More
                          </Link>
                          <Link
                            to={`/contact?university=${encodeURIComponent(uni.name)}`}
                            className="no-shine flex-1 py-2 text-center bg-[#16130F] border-2 border-[#16130F] text-white font-bold text-xs rounded-full shadow-[2px_2px_0_#F2B705] transition-transform hover:-translate-y-0.5"
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
          <aside className="lg:sticky lg:top-28 space-y-6">
            
            {/* Widget A: Live Workshops */}
            <div className="p-6 border-[3px] border-[#16130F] rounded-2xl shadow-[5px_5px_0_#16130F] text-white rotate-[0.6deg]" style={{ background: '#14837E' }}>
              <span className="font-['Rozha_One',serif] text-[15px] leading-none text-[#FCE38A] block">मेला</span>
              <span className="text-[10px] font-black uppercase tracking-widest block mt-1 mb-2 opacity-90">Live Workshops</span>
              <h3 className="font-urbanist text-[20px] font-black leading-snug mb-2">
                Study Abroad Events & Fairs
              </h3>
              <p className="text-[13px] leading-relaxed mb-5 font-medium opacity-90">
                Join live webinars with global university delegates, admissions officers, and certified trainers.
              </p>
              <Link
                to="/events"
                className="no-shine w-full text-center py-3 bg-white text-[#16130F] rounded-full border-2 border-[#16130F] text-[13px] font-black shadow-[3px_3px_0_#16130F] transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
              >
                <span>Explore Live Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget B: AI University Matcher */}
            <InkCard className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl border-2 border-[#16130F] flex items-center justify-center mx-auto mb-4 -rotate-3" style={{ background: '#B8285B', color: '#FFFFFF' }}>
                <Sparkles size={20} />
              </div>
              <h4 className="font-urbanist font-black text-[#16130F] text-[16px] mb-2">AI University Matcher</h4>
              <p className="text-[13px] text-[#5B544A] leading-relaxed mb-5 font-medium">
                Unsure if your profile qualifies for GMAT waivers? Get instant AI suggestions.
              </p>
              <Link
                to="/ai-tools"
                className="no-shine w-full text-center py-3 border-2 border-[#16130F] bg-[#FFF6E5] text-[#16130F] rounded-full text-[13px] font-black hover:bg-[#FCE38A] transition-colors block"
              >
                Try AI Shortlister
              </Link>
            </InkCard>

          </aside>

        </div>

        {/* FAQs Accordion */}
        <section className="mt-16 max-w-4xl mx-auto">
          <DesiHeading hi="अक्सर पूछे सवाल" className="mb-6">
            <span className="inline-flex items-center gap-2"><HelpCircle size={24} className="text-[#D0362E]" />Frequently Asked Questions (FAQs)</span>
          </DesiHeading>
          <div className="space-y-3">
            {[
              { q: "Is GMAT difficult?", a: "The GMAT is computer-adaptive, meaning questions adjust to your level. It is challenging because it tests logical analytics rather than simple recall. However, structured prep of 2-3 months is sufficient." },
              { q: "How long is the GMAT exam?", a: "The new GMAT Focus Edition lasts exactly 2 hours and 15 minutes plus an optional 10-minute break. This is a significant reduction from the old 3 hour format." },
              { q: "Can I use a calculator during the GMAT?", a: "Calculators are strictly prohibited during the Quantitative Reasoning section. However, an on-screen calculator is provided during the Data Insights section." },
              { q: "How soon can I retake the GMAT?", a: "You can retake the GMAT exam 16 days after your previous attempt. You can take the exam up to 5 times in a rolling 12-month period and 8 times in total." }
            ].map((faq, idx) => {
              const isOpen = !!faqOpen[idx];
              return (
                <div key={idx} className="bg-white border-[3px] border-[#16130F] rounded-xl overflow-hidden shadow-[3px_3px_0_#16130F]">
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="no-shine w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left font-bold text-[14.5px] text-[#16130F] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span
                      className="w-7 h-7 shrink-0 rounded-full border-2 border-[#16130F] grid place-items-center transition-colors"
                      style={{ background: isOpen ? '#B8285B' : '#FFF6E5', color: isOpen ? '#FFFFFF' : '#16130F' }}
                    >
                      <ChevronRight size={15} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 sm:px-5 pb-5 pt-3 text-[#3D362E] text-[14px] border-t-2 border-dashed border-[#16130F]/25 leading-relaxed font-medium">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Closing CTA */}
        <div className="mt-16">
          <BookOkCta
            to="/book-consultation"
            text="GMAT ka target score, B-school shortlist aur funding: ek free call mein sab clear. 1:1, ek ghante ki baat."
          />
        </div>

      </div>
    </div>
  );
};

export default GMATOverview;
