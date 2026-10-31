import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  HelpCircle,
  Clock,
  MapPin,
  Compass,
  ArrowRight,
  Award,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { StatStrip, BarCompare } from '../../../components/ui/Infographics';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { BookOkCta } from '../../../components/desi/BookOkCta';

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
        <div className="w-full h-full bg-[#16130F] flex items-center justify-center text-white rounded">
          <GraduationCap size={16} />
        </div>
      )}
    </div>
  );
};

const GREOverview = () => {
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
    <div className="min-h-screen bg-[#FFF6E5] pb-20 font-['Onest',sans-serif] text-[#16130F]">

      {/* Hero: poster band */}
      <DesiHero
        tone="mustard"
        sign={{ hi: 'GRE', en: 'GRE DESK' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams' }, { label: 'GRE' }]}
        title="GRE Exam for Indian Students in 2025: A Complete Guide"
        subtitle="Achieve admission to premium MS and MBA programs globally. Get standard details on GRE General & Subject tests, registrations, syllabus updates, pricing schedules, and score validations."
        stickers={(
          <>
            <Sticker bg="#FFF6E5" tilt={-2}><Compass size={14} />Comprehensive GRE Guide</Sticker>
            <Sticker tilt={1.5}><Clock size={14} />Updated: May 2025</Sticker>
            <Sticker bg="#FCE38A" tilt={-1}><Award size={14} />ETS Shorter Edition updates active</Sticker>
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
            <p className="font-urbanist font-extrabold text-[14px] leading-none text-[#D0362E]">Taaza khabar</p>
            <h4 className="mt-1 font-urbanist font-black text-[#16130F] text-[16px]">Latest ETS GRE Updates</h4>
            <div className="text-xs text-[#3D362E] font-semibold mt-0.5 space-y-1">
              <p>• ETS has announced several new updates in GRE, including a shorter duration, removal of tasks, and reduced number of questions.</p>
              <p>• The GRE Subject Test is no longer applicable in India. Registration for shorter GRE is now open!</p>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)_230px] xl:grid-cols-[280px_minmax(0,1fr)_300px] gap-8 items-start">
          
          {/* Left Sticky Sidebar Index */}
          <aside className="hidden lg:block sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-1.5 pb-2">
            <InkCard className="p-4">
            <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Is page pe</p>
            <p className="mt-1 mb-3 font-urbanist font-black text-[15px] text-[#16130F]">On This Page</p>
            <nav className="flex flex-col gap-1.5">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={activeSection === item.id ? { background: '#F2B705', color: '#16130F' } : undefined}
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
              <DesiHeading hi="Shuruaat" className="mb-5">1. What is GRE?</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  GRE, or <strong>Graduate Record Exam</strong>, is one of the most common exams required for post-graduate studies abroad. It is conducted by the <strong>Educational Testing Services (ETS)</strong>, which also owns the popular TOEFL exam.
                </p>
                <p>
                  There are two types of GRE: the <strong>GRE General test</strong> and the <strong>GRE Subject test</strong>. The GRE General exam evaluates your Verbal, Quantitative, and Analytical writing skills.
                </p>
                <StatStrip
                  stats={[
                    { value: '1h 58m', label: 'Shorter GRE General Test' },
                    { value: 'US$249', label: 'Fee in India from 1 Aug 2026' },
                    { value: '10–15 days', label: 'Official results released' },
                    { value: '5 years', label: 'Score validity' }
                  ]}
                />
                <div className="bg-[#FFF1B8] border-2 border-[#16130F] p-4.5 rounded-2xl text-xs text-[#5B544A] space-y-2 mt-4 shadow-[4px_4px_0_#16130F]">
                  <p>• <strong>Wide Acceptability:</strong> Accepted by over 1,300 business schools in over 72 countries, including the USA, Canada, UK, and more!</p>
                  <p>• <strong>Graduate Preparedness:</strong> Indicates your readiness for university education, making it highly preferred for business and law courses.</p>
                  <p>• <strong>Profile Booster:</strong> Strongly enhances your candidate portfolio whether applying to universities or seeking jobs abroad.</p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" ref={sectionRefs['section-2']} className="scroll-mt-28">
              <DesiHeading hi="Dates" className="mb-5">2. GRE Dates: When is the GRE Exam Conducted?</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  The GRE General Test is available throughout the year. Booking dates vary depending on your test centre. We advise booking the test 2-3 months early to ensure you get your desired slot.
                </p>
                <p><strong>Sample Availability (Bangalore & Hyderabad):</strong></p>
                <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] my-3">
                  <table className="w-full min-w-[480px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#14837E] text-[#FFFFFF] border-b-[3px] border-[#16130F] font-bold uppercase">
                        <th className="p-3 font-black">Location</th>
                        <th className="p-3 font-black">Months</th>
                        <th className="p-3 font-black">Available Dates (2024-2025)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3 font-bold text-[#16130F]">Hyderabad</td>
                        <td className="p-3 font-bold text-[#5B544A]">Oct - Dec</td>
                        <td className="p-3 text-[12.5px] text-[#5B544A]">October (5-19, 21-30), November (1-30), December (1-31)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#16130F]">Bangalore</td>
                        <td className="p-3 font-bold text-[#5B544A]">Oct - Apr</td>
                        <td className="p-3 text-[12.5px] text-[#5B544A]">October (5-11, 13-18, 22-26, 28, 29, 31), Nov-Dec (Various), Jan-April 2025 (Multiple Slots)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" ref={sectionRefs['section-3']} className="scroll-mt-28">
              <DesiHeading hi="Fees" className="mb-5">3. GRE Fees: How much does the GRE Cost?</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  From 1 August 2026, the GRE General Test fee in India is <strong>US$249</strong> (ETS). You pay in dollars or the rupee equivalent on the day, plus any applicable tax. Additional service fees apply depending on post-registration requests:
                </p>
                <div>
                  <BarCompare
                    kicker="Extra charges"
                    title="GRE service fees in India (INR)"
                    items={[
                      { label: 'Score review', value: 5900, display: '₹5,900' },
                      { label: 'Reschedule / centre change', value: 5000, display: '₹5,000' },
                      { label: 'Extra score report', value: 2900, display: '₹2,900' }
                    ]}
                  />
                </div>
                <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] my-3">
                  <table className="w-full min-w-[480px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#14837E] text-[#FFFFFF] border-b-[3px] border-[#16130F] font-bold uppercase">
                        <th className="p-3 font-black">GRE Service Request</th>
                        <th className="p-3 font-black">Fees in India (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3 font-bold text-[#16130F]">GRE General Test Fee</td>
                        <td className="p-3">US$249</td>
                      </tr>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3">Rescheduling / Test Center Change</td>
                        <td className="p-3">₹5,000</td>
                      </tr>
                      <tr className="border-b border-[#16130F]/15">
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
              <DesiHeading hi="Result" className="mb-5">4. GRE Result: How do You Check Your GRE Results?</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Official GRE General Test results are released within <strong>10-15 days</strong> of your test date.
                </p>
                <div className="p-4 bg-[#FFF6E5] border-2 border-[#16130F] rounded-2xl text-xs text-[#5B544A] space-y-2 shadow-[4px_4px_0_#16130F]">
                  <p>• <strong>Notification:</strong> ETS sends an email notification as soon as scores are ready on your online account dashboard.</p>
                  <p>• <strong>Reporting:</strong> Scores are sent to your chosen 4 universities within the same 10-15 days window.</p>
                  <p>• <strong>Validity:</strong> GRE results remain valid for exactly <strong>5 years</strong> from the test date.</p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section-5" ref={sectionRefs['section-5']} className="scroll-mt-28">
              <DesiHeading hi="Score" className="mb-5">5. What is a GRE Score?</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  The GRE General test score range spans from <strong>130 to 170</strong> for Verbal & Quantitative sections. AW is scored separately.
                </p>
                <StatStrip
                  stats={[
                    { value: '130–170', label: 'Verbal Reasoning' },
                    { value: '130–170', label: 'Quantitative Reasoning' },
                    { value: '0–6', label: 'Analytical Writing' },
                    { value: '300+', label: 'A good combined score' }
                  ]}
                />
                <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] my-3">
                  <table className="w-full min-w-[480px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#14837E] text-[#FFFFFF] border-b-[3px] border-[#16130F] font-bold uppercase">
                        <th className="p-3 font-black">Section</th>
                        <th className="p-3 font-black">Score Range</th>
                        <th className="p-3 font-black">Score Increments</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3 font-bold text-[#16130F]">Verbal Reasoning</td>
                        <td className="p-3">130 – 170</td>
                        <td className="p-3">1-point increments (+1 per correct answer)</td>
                      </tr>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3 font-bold text-[#16130F]">Quantitative Reasoning</td>
                        <td className="p-3">130 – 170</td>
                        <td className="p-3">1-point increments (+1 per correct answer)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#16130F]">Analytical Writing</td>
                        <td className="p-3">0 – 6</td>
                        <td className="p-3">0.5-point increments</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-[#FFF1B8] p-4 border-2 border-[#16130F] rounded-2xl text-xs text-[#16130F] font-bold shadow-[4px_4px_0_#16130F]">
                  <Lightbulb size={14} className="inline-block -mt-0.5 mr-1 text-[#D0362E]" />A combined score above 300 is considered a good GRE score and opens doors to top-tier universities worldwide.
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="section-6" ref={sectionRefs['section-6']} className="scroll-mt-28">
              <DesiHeading hi="Centre" className="mb-5">6. GRE Test Centre: Where Can You Take the GRE?</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  GRE has over 1,000 test centres spread across 160 countries. In India, exams are conducted at centers in major cities:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold text-[#3D362E]">
                  {["Ahmedabad", "Bangalore", "New Delhi", "Chennai", "Hyderabad", "Mumbai", "Pune", "Kolkata"].map((city) => (
                    <div key={city} className="border-2 border-[#16130F] p-3.5 rounded-xl bg-[#FFF6E5] text-center">
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
              <DesiHeading hi="Registration" className="mb-5">7. GRE Registration: How do I register for the GRE?</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Registering is simple and fully online via the ETS website:
                </p>
                <div className="space-y-3.5 text-xs text-[#5B544A] my-4">
                  <div className="p-4 bg-[#FFF6E5] rounded-2xl border-2 border-[#16130F] shadow-[4px_4px_0_#16130F]">
                    <span className="font-extrabold text-[#16130F] block mb-1">Step 1: Profile Setup</span>
                    Create an ETS account, ensuring names and details exactly match your physical passport.
                  </div>
                  <div className="p-4 bg-[#FFF6E5] rounded-2xl border-2 border-[#16130F] shadow-[4px_4px_0_#16130F]">
                    <span className="font-extrabold text-[#16130F] block mb-1">Step 2: Slot Booking</span>
                    Search by location/timezone, pick an available test center and date.
                  </div>
                  <div className="p-4 bg-[#FFF6E5] rounded-2xl border-2 border-[#16130F] shadow-[4px_4px_0_#16130F]">
                    <span className="font-extrabold text-[#16130F] block mb-1">Step 3: Payment</span>
                    Submit the US$249 fee using credit/debit card, e-check, UPI, or PayPal.
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="section-8" ref={sectionRefs['section-8']} className="scroll-mt-28">
              <DesiHeading hi="Kaun de sakta hai" className="mb-5">8. GRE Eligibility: Documents Required for GRE</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  ETS has set no strict age limits or academic qualifiers for taking the GRE.
                </p>
                <div className="bg-[#FFF6E5] border-2 border-[#16130F] p-4.5 rounded-2xl text-xs text-[#5B544A] space-y-2 shadow-[4px_4px_0_#16130F]">
                  <p>• <strong>Primary ID:</strong> A valid physical passport is mandatory for all Indian test takers. Photocopies are strictly rejected.</p>
                  <p>• <strong>Name Check:</strong> Your registration name must match your passport exactly to prevent center disqualifications.</p>
                  <p>• <strong>Aadhaar Status:</strong> Aadhar cards were temporarily accepted due to proctor setups, but passport remains the standard.</p>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section id="section-9" ref={sectionRefs['section-9']} className="scroll-mt-28">
              <DesiHeading hi="Paper ka pattern" className="mb-5">9. GRE Syllabus & Pattern: What Does the Test Contain?</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  The shorter GRE features a reduced question count and eliminates the separate essay task, lasting under 2 hours.
                </p>
                <div className="p-4 bg-[#FFF1B8] border-2 border-[#16130F] rounded-2xl text-xs text-[#5B544A] space-y-2 shadow-[4px_4px_0_#16130F]">
                  <p>• <strong>Verbal Reasoning:</strong> Evaluates ability to parse passages, select vocabulary, and comprehend complex structures.</p>
                  <p>• <strong>Quantitative Reasoning:</strong> Covers high school arithmetic, algebra, data analysis, and basic geometry concepts.</p>
                  <p>• <strong>Analytical Writing:</strong> Tests argument structures and issue breakdowns via one task (Analyse an Issue).</p>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section id="section-10" ref={sectionRefs['section-10']} className="scroll-mt-28">
              <DesiHeading hi="Books" className="mb-5">10. GRE Books: What are the Best Resources for the GRE?</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
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
                    <div key={book.num} className="flex gap-4 p-4 border-2 border-[#16130F] rounded-2xl bg-[#FFF6E5] shadow-[4px_4px_0_#16130F]">
                      <div className="w-8 h-8 rounded-full bg-[#16130F] text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                        {book.num}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#16130F] uppercase">{book.name}</h4>
                        <p className="text-[#5B544A] text-[12.5px] mt-1 font-semibold leading-relaxed">{book.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 11 */}
            <section id="section-11" ref={sectionRefs['section-11']} className="scroll-mt-28">
              <DesiHeading hi="Mock test" className="mb-5">11. GRE Practice Tests: Boost your Preparation!</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
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
              <DesiHeading hi="Kahan jaoge" className="mb-5">12. Top Global Universities Accepting GRE Scores</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold mb-6">
                <p>
                  Explore universities accepting GRE scores across USA, UK, Canada, Australia, and Ireland.
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
                              <span className="font-bold text-[#14837E] block mt-0.5">{uni.tuition}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-[#8A7F70] font-bold block uppercase tracking-wider">Standard Exam</span>
                              <span className="font-bold text-[#16130F] block mt-0.5">GRE Required</span>
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
              <span className="font-urbanist font-extrabold text-[15px] leading-none text-[#FCE38A] block">Live events</span>
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
              <div className="w-12 h-12 rounded-xl border-2 border-[#16130F] flex items-center justify-center mx-auto mb-4 -rotate-3" style={{ background: '#F2B705', color: '#16130F' }}>
                <Sparkles size={20} />
              </div>
              <h4 className="font-urbanist font-black text-[#16130F] text-[16px] mb-2">AI University Matcher</h4>
              <p className="text-[13px] text-[#5B544A] leading-relaxed mb-5 font-medium">
                Unsure if you qualify for GRE waivers at target schools? Get instant AI suggestions.
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
          <DesiHeading hi="Sabke sawaal" className="mb-6">
            <span className="inline-flex items-center gap-2"><HelpCircle size={24} className="text-[#D0362E]" />Frequently Asked Questions (FAQs)</span>
          </DesiHeading>
          <div className="space-y-3">
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
                <div key={idx} className="bg-white border-[3px] border-[#16130F] rounded-xl overflow-hidden shadow-[3px_3px_0_#16130F]">
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="no-shine w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left font-bold text-[14.5px] text-[#16130F] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span
                      className="w-7 h-7 shrink-0 rounded-full border-2 border-[#16130F] grid place-items-center transition-colors"
                      style={{ background: isOpen ? '#F2B705' : '#FFF6E5', color: isOpen ? '#16130F' : '#16130F' }}
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
            text="GRE ka target score, shortlist aur funding: ek free call mein sab clear. 1:1, ek ghante ki baat."
          />
        </div>

      </div>
    </div>
  );
};

export default GREOverview;
