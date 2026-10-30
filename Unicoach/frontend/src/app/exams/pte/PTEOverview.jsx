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
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { StatStrip, BarCompare, Donut } from '../../../components/ui/Infographics';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { BookOkCta } from '../../../components/desi/BookOkCta';

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
        <div className="w-full h-full bg-[#16130F] flex items-center justify-center text-white rounded">
          <GraduationCap size={16} />
        </div>
      )}
    </div>
  );
};

const PTEOverview = () => {
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
    <div className="min-h-screen bg-[#FFF6E5] pb-20 font-['Onest',sans-serif] text-[#16130F]">

      {/* Hero: poster band */}
      <DesiHero
        tone="teal"
        sign={{ hi: 'पीटीई', en: 'PTE DESK' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams' }, { label: 'PTE' }]}
        title="PTE Exam 2026: Full Form, Fees, Dates, Eligibility & Exam Pattern"
        subtitle="The PTE Academic is the leading computer-based choice for students who value speed and fairness. With results typically out in 48 hours, it’s the fastest way to secure university spots in 2026."
        stickers={(
          <>
            <Sticker bg="#FFF6E5" tilt={-2}><Compass size={14} />Pearson Test of English</Sticker>
            <Sticker tilt={1.5}><Clock size={14} />Updated: January 2026</Sticker>
            <Sticker bg="#FCE38A" tilt={-1}><Award size={14} />PTE Hybrid Scoring active</Sticker>
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
            <h4 className="mt-1 font-urbanist font-black text-[#16130F] text-[16px]">Latest PTE Updates</h4>
            <div className="text-xs text-[#3D362E] font-semibold mt-0.5 space-y-1">
              <p>• <strong>Hybrid Scoring model:</strong> Any PTE exam scheduled on or after August 7, 2025 utilizes double-marking for open-ended tasks like the Essay to ensure human checks verify AI scoring.</p>
              <p>• <strong>Standard Registration Fee:</strong> The PTE Academic fee in India is ₹18,900 including 18% GST (from 16 March 2026). Pearson shows the exact price when you book.</p>
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
                  style={activeSection === item.id ? { background: '#14837E', color: '#FFFFFF' } : undefined}
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
              <DesiHeading hi="Shuruaat" className="mb-5">1. What is the PTE Exam?</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Conducted by Pearson Language Tests, the <strong>PTE Academic</strong> (Pearson Test of English) evaluates four core skills: <strong>Speaking, Writing, Reading, and Writing</strong> in a computer-based setting. The exam uses advanced AI scoring to ensure unbiased and objective evaluations.
                </p>
                <StatStrip
                  stats={[
                    { value: '24–48h', label: 'Official score reports' },
                    { value: '62+', label: 'Test locations in India' },
                    { value: '₹18,900', label: 'Exam fee incl. 18% GST' },
                    { value: '2h 15m', label: 'Approximate test time' }
                  ]}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 my-6">
                  {[
                    { title: "Fast Results", desc: "Most students receive their official score reports within 24 to 48 hours." },
                    { title: "Flexible Slots", desc: "Offered year-round at secure test centers across 62+ locations in India." },
                    { title: "Unlimited Reporting", desc: "Send your scorecards to as many universities as you like for free." },
                    { title: "Integrated Grading", desc: "Many tasks evaluate multiple communication skills simultaneously (e.g. Read Aloud)." }
                  ].map((item, idx) => (
                    <div key={idx} className="border-2 border-[#16130F] p-4.5 rounded-xl bg-[#FFF6E5] hover:bg-[#FFF6E5] transition-colors">
                      <h4 className="font-black text-[#16130F] text-xs mb-1 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-[#14837E]" />
                        {item.title}
                      </h4>
                      <p className="text-[12.5px] text-[#5B544A] font-semibold leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" ref={sectionRefs['section-2']} className="scroll-mt-28">
              <DesiHeading hi="Kahan chalega" className="mb-5">2. PTE Accepted Countries</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  PTE Academic is recognised by thousands of universities worldwide. Key destinations that accept PTE Academic for study admissions and student visas include:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2 text-xs font-bold text-[#16130F]">
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
                      className="flex items-center gap-2.5 bg-[#FFF6E5] hover:bg-white border-2 border-[#16130F] hover:border-[#16130F] hover:-translate-y-0.5 p-3 rounded-xl transition-all"
                    >
                      <img
                        src={`https://flagcdn.com/w40/${c.code}.png`}
                        alt={c.name}
                        className="w-5 h-3.5 object-cover rounded-xs flex-shrink-0"
                        loading="lazy"
                      />
                      <span className="text-[#16130F] font-semibold">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" ref={sectionRefs['section-3']} className="scroll-mt-28">
              <DesiHeading hi="Kaun de sakta hai" className="mb-5">3. PTE Exam Eligibility Criteria</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Pearson has designed PTE Academic to be widely accessible to global candidates:
                </p>
                <div className="bg-[#FFF6E5] border-2 border-[#16130F] p-4.5 rounded-2xl text-xs text-[#5B544A] space-y-2 shadow-[4px_4px_0_#16130F]">
                  <p>• <strong>Age:</strong> Minimum age limit is 16 years. Candidates aged 16-17 must provide a signed parental consent form.</p>
                  <p>• <strong>Education:</strong> No specific academic credentials or degrees are mandatory to book a slot.</p>
                  <p>• <strong>Passport Identification:</strong> For Indian applicants, a valid original physical passport is the only accepted identity verification document on test day.</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section-4" ref={sectionRefs['section-4']} className="scroll-mt-28">
              <DesiHeading hi="Paper ka pattern" className="mb-5">4. What is the Format of the PTE Exam?</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  The test takes approximately 2 hours and 15 minutes to complete. The structural sections are outlined below:
                </p>
                <div>
                  <Donut
                    kicker="Time split"
                    title="Minutes per PTE section"
                    segments={[
                      { label: 'Speaking & Writing', value: 67, display: '54–67 min' },
                      { label: 'Reading', value: 30, display: '29–30 min' },
                      { label: 'Listening', value: 43, display: '30–43 min' }
                    ]}
                    centerValue="3"
                    centerLabel="sections"
                  />
                </div>
                <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] my-3">
                  <table className="w-full min-w-[480px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F] font-bold uppercase">
                        <th className="p-3 font-black">PTE Section</th>
                        <th className="p-3 font-black">Format & Scope</th>
                        <th className="p-3 font-black">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3 font-bold text-[#16130F]">Speaking & Writing</td>
                        <td className="p-3">Read aloud, repeat sentence, describe image, summarizing, essay, new situations task.</td>
                        <td className="p-3">54 - 67 minutes</td>
                      </tr>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3 font-bold text-[#16130F]">Reading</td>
                        <td className="p-3">Fill in the blanks (reading & writing dropdowns), re-order paragraphs, multiple choice.</td>
                        <td className="p-3">29 - 30 minutes</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#16130F]">Listening</td>
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
              <DesiHeading hi="Fees" className="mb-5">5. PTE Exam Fees in India 2026</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  PTE fees are standardized. Last-minute bookings or rescheduling buffer rules incur additional fees.
                </p>
                <div>
                  <BarCompare
                    kicker="Fee breakdown"
                    title="PTE fees in India (INR)"
                    items={[
                      { label: 'Standard fee (with GST)', value: 18900, display: '₹18,900' },
                      { label: 'Base fee (excl. GST)', value: 16017, display: '₹16,017' },
                      { label: 'Late booking surcharge', value: 695, display: '₹695' }
                    ]}
                  />
                </div>
                <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] my-3">
                  <table className="w-full min-w-[480px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F] font-bold uppercase">
                        <th className="p-3 font-black">Service Category</th>
                        <th className="p-3 font-black">Fee Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3 font-bold text-[#16130F]">Standard PTE Exam Fee (with GST)</td>
                        <td className="p-3">₹18,900</td>
                      </tr>
                      <tr className="border-b border-[#16130F]/15">
                        <td className="p-3">Base Fee (excluding GST)</td>
                        <td className="p-3">₹16,017 (approx.)</td>
                      </tr>
                      <tr className="border-b border-[#16130F]/15">
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
              <DesiHeading hi="Score" className="mb-5">6. PTE Exam Score Calculation</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Scores are measured on the Global Scale of English (GSE), ranging from **10 to 90 points**. Let's review the standardized score conversion equivalents:
                </p>
                <div className="overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-2xl shadow-[4px_4px_0_#16130F] my-3">
                  <table className="w-full min-w-[480px] text-left border-collapse text-xs md:text-sm">
                    <thead className="bg-[#F2B705] text-[#16130F] border-b-[3px] border-[#16130F] font-bold uppercase">
                      <tr>
                        <th className="py-3 px-4 text-xs font-black">PTE Score Band</th>
                        <th className="py-3 px-4 text-xs font-black">IELTS Equivalent Band</th>
                        <th className="py-3 px-4 text-xs font-black">Skill Level Descriptor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#16130F]/15 text-[#3D362E] font-semibold text-xs">
                      <tr>
                        <td className="py-3.5 px-4 font-bold">85 – 90</td>
                        <td className="py-3.5 px-4">9.0</td>
                        <td className="py-3.5 px-4 text-[#14837E]">Expert User</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-bold">79 – 84</td>
                        <td className="py-3.5 px-4">8.0</td>
                        <td className="py-3.5 px-4 text-[#14837E]">Very Good User</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-bold">65 – 78</td>
                        <td className="py-3.5 px-4">7.0</td>
                        <td className="py-3.5 px-4 text-[#14837E]">Good User</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 px-4 font-bold">50 – 64</td>
                        <td className="py-3.5 px-4">6.0</td>
                        <td className="py-3.5 px-4 text-[#5B544A]">Competent User</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" ref={sectionRefs['section-7']} className="scroll-mt-28">
              <DesiHeading hi="Registration" className="mb-5">7. PTE Registration in India</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  To register, visit the official Pearson PTE portal. Make sure your profile details match your physical passport.
                </p>
                <div className="p-4 bg-[#FFF1B8] border-2 border-[#16130F] text-[#16130F] rounded-xl text-xs space-y-1.5">
                  <p>• <strong>Surname Dot Rule:</strong> If your Indian passport has a blank surname field, you must type a full stop (.) in the surname field during registration to avoid mismatch errors.</p>
                  <p>• <strong>No duplicates:</strong> If you forget login credentials, do not open a second profile. Duplicate accounts trigger security blocks and cancel bookings.</p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="section-8" ref={sectionRefs['section-8']} className="scroll-mt-28">
              <DesiHeading hi="Centre" className="mb-5">8. PTE Exam Dates and Centers</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  With slots open almost every day of the week, booking a center slot is highly convenient. Booking at least 2-3 weeks early is recommended. Noise-canceling headsets are provided at centers.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="section-9" ref={sectionRefs['section-9']} className="scroll-mt-28">
              <DesiHeading hi="Taiyari" className="mb-5">9. How to Prepare for the PTE Exam?</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Familiarize yourself with the automated testing environment. Focus on natural fluency instead of strict templates. Practice with AI-driven mock platforms like UniCoach AI.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="section-10" ref={sectionRefs['section-10']} className="scroll-mt-28">
              <DesiHeading hi="Books" className="mb-5">10. Recommended Books for PTE Prep</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <div className="space-y-3">
                  {[
                    { num: "1", name: "The Official Guide to PTE Academic (Pearson)", desc: "Contains official diagnostic question templates and answers direct from the makers." },
                    { num: "2", name: "PTE Academic Expert (Clare Walsh & Lindsay Warwick)", desc: "Deep analytical breakdown of academic vocabulary and reading logic." },
                    { num: "3", name: "PTE Academic Practice Tests Plus (Pearson)", desc: "Contains real past exam papers for timed mock drills." }
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
              <DesiHeading hi="Mock test" className="mb-5">11. Practice Tests & Mock Assessments</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold">
                <p>
                  Taking weekly mock tests is essential to build stamina. Refine pronunciation and note down details during lecture playbacks to ensure high AI grading marks.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="section-12" ref={sectionRefs['section-12']} className="scroll-mt-28">
              <DesiHeading hi="Kahan jaoge" className="mb-5">12. Top Global Universities Accepting PTE</DesiHeading>
              <div className="text-[#3D362E] text-sm leading-relaxed space-y-4 font-semibold mb-6">
                <p>
                  Review undergraduate and postgraduate cutoff targets across study destinations.
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
                              <span className="font-bold text-[#16130F] block mt-0.5">PTE Required</span>
                            </div>
                          </div>
                        </div>

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

          {/* Right Sidebar Widgets */}
          <aside className="lg:sticky lg:top-28 space-y-6">
            
            {/* Widget: Live session */}
            <div className="p-6 border-[3px] border-[#16130F] rounded-2xl shadow-[5px_5px_0_#16130F] text-white rotate-[0.6deg]" style={{ background: '#D0362E' }}>
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

            {/* Widget: AI University Matcher */}
            <InkCard className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl border-2 border-[#16130F] flex items-center justify-center mx-auto mb-4 -rotate-3" style={{ background: '#14837E', color: '#FFFFFF' }}>
                <Sparkles size={20} />
              </div>
              <h4 className="font-urbanist font-black text-[#16130F] text-[16px] mb-2">AI University Matcher</h4>
              <p className="text-[13px] text-[#5B544A] leading-relaxed mb-5 font-medium">
                Match your target PTE score with top global universities and admission cutoffs.
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
              { q: "What is the PTE Academic exam for?", a: "PTE Academic is a computer-based English language test designed for study abroad and immigration purposes." },
              { q: "Is the PTE exam easier than IELTS?", a: "It depends on preference. PTE is fully computer-delivered and scored by AI. Candidates who prefer speaking to a microphone and fast results find it easier." },
              { q: "How much does PTE cost in India?", a: "The registration fee for PTE Academic in India is ₹18,900 (including GST), from 16 March 2026." },
              { q: "Can I take the PTE exam multiple times?", a: "Yes, there is no limit to the number of attempts. You can book a test once your previous score is published." },
              { q: "How long is a PTE score valid?", a: "PTE score reports are valid for 2 years from your test date." },
              { q: "Which countries accept PTE Academic?", a: "It is widely accepted for university admissions and student visas in the USA, UK, Canada, Australia, and New Zealand." }
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
                      style={{ background: isOpen ? '#14837E' : '#FFF6E5', color: isOpen ? '#FFFFFF' : '#16130F' }}
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
            text="PTE ka score plan, college shortlist aur visa: ek free call mein sab clear. 1:1, ek ghante ki baat."
          />
        </div>

      </div>
    </div>
  );
};

export default PTEOverview;
