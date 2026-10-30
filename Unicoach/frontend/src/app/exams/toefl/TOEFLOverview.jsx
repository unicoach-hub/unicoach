import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Clock,
  MapPin,
  Compass,
  ArrowRight,
  Award,
  AlertTriangle,
  Sparkles,
  Lightbulb,
  ChevronDown
} from 'lucide-react';
import { HookBand, BarCompare, Donut } from '../../../components/ui/Infographics';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

// Desi Pop building blocks
const TONES = [DESI_TONES[0], DESI_TONES[1], DESI_TONES[2], DESI_TONES[3]];
const tableWrap = "overflow-x-auto bg-white border-[3px] border-[#16130F] rounded-[12px] shadow-[4px_4px_0_#16130F] my-3";
const tableCls = "w-full min-w-[480px] text-left border-collapse text-[13.5px] text-[#3D362E]";
const theadRow = "bg-[#14837E] text-white border-b-[3px] border-[#16130F]";
const thCls = "p-3 text-[12px] font-black uppercase tracking-wider whitespace-nowrap";

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
        <div className="w-full h-full bg-[#14837E] flex items-center justify-center text-white rounded">
          <GraduationCap size={16} />
        </div>
      )}
    </div>
  );
};

const TOEFLOverview = () => {
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
    <div className="min-h-screen bg-[#FFF6E5] pb-20 select-none font-['Onest',sans-serif] text-[#16130F]">
      {/* Hero: peach poster band, latest updates pinned on the right */}
      <DesiHero
        tone="peach"
        sign={{ hi: 'टोफ़ल', en: 'TOEFL DESK' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams' }, { label: 'TOEFL' }]}
        title="TOEFL Exam 2025: Dates, Fees, Result, Syllabus & Pattern"
        subtitle="Maximize your admissions chances in the US, UK, and Canada. Study complete guidelines on TOEFL registration, short format updates, slot booking, and B-school acceptance."
        stickers={(
          <>
            <Sticker bg="#14837E" fg="#FFFFFF" tilt={-2}><Compass size={14} />Comprehensive TOEFL Guide</Sticker>
            <Sticker tilt={1.5}><Clock size={14} />Updated: April 2025</Sticker>
            <Sticker bg="#F2B705" tilt={-1}><Award size={14} />Shortened TOEFL iBT duration active</Sticker>
          </>
        )}
        aside={(
          <InkCard className="p-5 sm:p-6 text-[#16130F]" shadow="#D0362E" style={{ transform: 'rotate(-0.6deg)' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full border-2 border-[#16130F] bg-[#D0362E] text-white grid place-items-center shrink-0 shadow-[2px_2px_0_#16130F]">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <p className="font-['Rozha_One',serif] text-[15px] text-[#D0362E] leading-none">ताज़ा ख़बर</p>
                <h4 className="mt-1 font-urbanist font-black text-[18px]">Latest TOEFL Updates</h4>
              </div>
            </div>
            <div className="text-[14px] text-[#3D362E] font-medium leading-relaxed space-y-2">
              <p>• Since 21 January 2026 the TOEFL iBT has a new format: new task types, adaptive Reading and Listening, about 90 minutes of test time, and a 1–6 score scale (the old 0–120 score is shown alongside until 2028).</p>
              <p>• ETS India lists the TOEFL iBT fee as ₹15,729 (checked October 2026).</p>
            </div>
          </InkCard>
        )}
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 md:px-10 pt-12">

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)_230px] xl:grid-cols-[260px_minmax(0,1fr)_280px] gap-8 items-start">

          {/* Left Sticky Sidebar Index */}
          <aside className="hidden lg:block sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto">
            <InkCard className="p-4">
              <p className="font-['Rozha_One',serif] text-[15px] text-[#D0362E] leading-none">इस पेज पर</p>
              <h3 className="mt-1 mb-3 font-urbanist font-black text-[17px]">On This Page</h3>
              <nav className="flex flex-col gap-1.5">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`no-shine w-full text-left py-2 px-3 rounded-lg border-2 text-[13px] font-bold transition-colors leading-snug cursor-pointer
                      ${activeSection === item.id
                        ? 'bg-[#F2B705] text-[#16130F] border-[#16130F] shadow-[2px_2px_0_#16130F]'
                        : 'border-transparent text-[#5B544A] hover:border-[#16130F] hover:bg-[#FFF6E5] hover:text-[#16130F]'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </InkCard>
          </aside>

          {/* Center Main Guide Column */}
          <main className="min-w-0 space-y-14 bg-white border-[3px] border-[#16130F] p-5 sm:p-8 md:p-10 rounded-[14px] shadow-[5px_5px_0_#FFD9C2,8px_8px_0_#16130F]">
            
            {/* Section 1 */}
            <section id="section-1" ref={sectionRefs['section-1']} className="scroll-mt-28">
              <DesiHeading hi="टोफ़ल क्या है" className="mb-4">1. What is the TOEFL Exam?</DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-4">
                <p>
                  The TOEFL, or <strong>Test of English as a Foreign Language</strong>, is a widely recognized English proficiency test for non-native English speakers. It evaluates English proficiency in four key areas: <strong>Reading, Listening, Speaking, and Writing</strong>.
                </p>
                <p>
                  There are two main types of TOEFL exams: <strong>TOEFL iBT</strong> (internet-based) and <strong>TOEFL Essentials</strong>. TOEFL is accepted by over 12,500 institutions across the world, including the USA, UK, and Canada.
                </p>
                <HookBand value="12,500+" label="institutions worldwide accept TOEFL, including the USA, UK and Canada" hi="दुनिया भर" />
                <div className="bg-[#FFF0E6] border-2 border-[#16130F] p-4 rounded-xl shadow-[3px_3px_0_#16130F] text-[14px] text-[#3D362E] space-y-2 mt-4">
                  <p>• <strong>Academic focus:</strong> TOEFL iBT tests your English in an academic setting.</p>
                  <p>• <strong>General usage:</strong> TOEFL Essentials tests your everyday English.</p>
                  <p>• <strong>Wide acceptance:</strong> TOEFL iBT is accepted by over 200 countries for undergraduate and postgraduate admissions.</p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" ref={sectionRefs['section-2']} className="scroll-mt-28">
              <DesiHeading hi="तारीखें" className="mb-4">2. TOEFL Dates: When is the TOEFL Exam Conducted?</DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-4">
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
              <DesiHeading hi="फ़ीस" className="mb-4">3. TOEFL Exam Fees: How much does the TOEFL Cost?</DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-4">
                <p>
                  ETS India lists the TOEFL iBT fee as <strong>₹15,729</strong>. Late registration (within 7 to 4 days of the test date) costs about ₹3,305 extra. Check the ETS India site when you book, as fees can change.
                </p>
                <div className={tableWrap}>
                  <table className={tableCls}>
                    <thead>
                      <tr className={theadRow}>
                        <th className={thCls}>TOEFL Service Request</th>
                        <th className={thCls}>Fees in India (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b-2 border-[#EFE4CF]">
                        <td className="p-3 font-bold text-[#16130F]">TOEFL iBT Registration Fee</td>
                        <td className="p-3">₹15,729</td>
                      </tr>
                      <tr className="border-b-2 border-[#EFE4CF]">
                        <td className="p-3">Late Registration Fee</td>
                        <td className="p-3">₹3,305</td>
                      </tr>
                      <tr className="border-b-2 border-[#EFE4CF]">
                        <td className="p-3">Rescheduling Fees</td>
                        <td className="p-3">₹5,000</td>
                      </tr>
                      <tr>
                        <td className="p-3">Score review (Speaking or Writing)</td>
                        <td className="p-3">₹6,695</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <BarCompare
                    kicker="Fee comparison"
                    title="TOEFL costs in India"
                    source="ETS India (checked October 2026)"
                    items={[
                      { label: 'Registration', value: 15729, display: '₹15,729' },
                      { label: 'Score review', value: 6695, display: '₹6,695' },
                      { label: 'Rescheduling', value: 5000, display: '₹5,000' },
                      { label: 'Late registration', value: 3305, display: '₹3,305' },
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section-4" ref={sectionRefs['section-4']} className="scroll-mt-28">
              <DesiHeading hi="रिज़ल्ट" className="mb-4">4. TOEFL Results: How Do You Check Your TOEFL Results?</DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-4">
                <p>
                  TOEFL iBT results are released online within <strong>4-8 days</strong> of the exam. You can view them by logging into your ETS account.
                </p>
                <div className="p-4 bg-[#FFF1B8] border-2 border-[#16130F] rounded-xl shadow-[3px_3px_0_#16130F] text-[14px] text-[#3D362E] space-y-2">
                  <p>• <strong>Ranges:</strong> A good score falls within the range of 80 to 100.</p>
                  <p>• <strong>Top Rank:</strong> Top-ranking universities require scores between 100 and 115.</p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section-5" ref={sectionRefs['section-5']} className="scroll-mt-28">
              <DesiHeading hi="स्कोर" className="mb-4">5. What are TOEFL Scores?</DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-4">
                <p>
                  Since 21 January 2026, each of the four sections (Reading, Listening, Writing, Speaking) is scored from <strong>1 to 6</strong> in half bands.
                </p>
                <p>
                  Your overall score is the average of the four, rounded to the nearest half band, and lines up with a CEFR level (5 = C1, 4 = B2). Until 2028 your report also shows the old <strong>0–120</strong> score. There is no negative marking, and scores are valid for <strong>2 years</strong>.
                </p>
                <div className="flex items-start gap-3 bg-[#DDF3EF] p-4 border-2 border-[#16130F] rounded-xl shadow-[3px_3px_0_#16130F] text-[14px] text-[#16130F] font-medium">
                  <span className="w-8 h-8 rounded-full border-2 border-[#16130F] bg-[#14837E] text-white grid place-items-center shrink-0"><Lightbulb size={15} /></span>
                  <p className="min-w-0"><strong>TOEFL MyBest™ scores:</strong> If attempted multiple times, you can combine your highest section scores from all tests taken to show your best overall performance (super scores).</p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="section-6" ref={sectionRefs['section-6']} className="scroll-mt-28">
              <DesiHeading hi="टेस्ट सेंटर" className="mb-4">6. TOEFL Test Centre: Where Can You Take the TOEFL?</DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-4">
                <p>
                  TOEFL iBT can be taken at physical centers across 39 cities in India, including Bangalore, Delhi, Chennai, and Ahmedabad. TOEFL Essentials can be attempted at home.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" ref={sectionRefs['section-7']} className="scroll-mt-28">
              <DesiHeading hi="रजिस्ट्रेशन" className="mb-4">7. TOEFL Registration: How do I register for the TOEFL?</DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-4">
                <p>
                  Registrations are online on the official ETS TOEFL website:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[14px] text-[#3D362E] my-4">
                  {[
                    '1. Create an ETS account online.',
                    '2. Select your preferred test date and center location.',
                    '3. Fill in the profile details matching your physical passport.',
                    '4. Complete the payment of ₹15,729.'
                  ].map((step, idx) => (
                    <p key={step} className="bg-white border-2 border-[#16130F] rounded-xl p-3 font-semibold shadow-[3px_3px_0_#16130F]" style={{ borderLeft: `8px solid ${TONES[idx % TONES.length].c}` }}>{step}</p>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="section-8" ref={sectionRefs['section-8']} className="scroll-mt-28">
              <DesiHeading hi="योग्यता" className="mb-4">8. TOEFL Eligibility: Documents Required for TOEFL</DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-4">
                <p>
                  ETS has set no specific eligibility restrictions. Anyone is welcome to write the test. Typically, test takers are over 16 years of age and possess a valid physical passport.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="section-9" ref={sectionRefs['section-9']} className="scroll-mt-28">
              <DesiHeading hi="सिलेबस" className="mb-4">9. TOEFL Syllabus: What Does the Test Contain?</DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-4">
                <p>
                  TOEFL covers Reading, Listening, Writing and Speaking, in that order. Test time is about 90 minutes; ETS asks you to allow about two hours in total.
                </p>
                <div>
                  <Donut
                    kicker="Time split"
                    title="Where your ~90 minutes go"
                    centerValue="~90"
                    centerLabel="minutes"
                    segments={[
                      { label: 'Reading', value: 30, display: '~30 min' },
                      { label: 'Listening', value: 29, display: '~29 min' },
                      { label: 'Writing', value: 23, display: '~23 min' },
                      { label: 'Speaking', value: 8, display: '~8 min' },
                    ]}
                  />
                </div>
                <div className={tableWrap}>
                  <table className={tableCls}>
                    <thead>
                      <tr className={theadRow}>
                        <th className={thCls}>TOEFL Section</th>
                        <th className={thCls}>Format Breakdown</th>
                        <th className={thCls}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b-2 border-[#EFE4CF]">
                        <td className="p-3 font-bold text-[#16130F]">Reading</td>
                        <td className="p-3">Complete the Words, Read in Daily Life, Read an Academic Passage (adaptive)</td>
                        <td className="p-3">~30 minutes</td>
                      </tr>
                      <tr className="border-b-2 border-[#EFE4CF]">
                        <td className="p-3 font-bold text-[#16130F]">Listening</td>
                        <td className="p-3">Short responses, conversations, announcements, academic talks (adaptive)</td>
                        <td className="p-3">~29 minutes</td>
                      </tr>
                      <tr className="border-b-2 border-[#EFE4CF]">
                        <td className="p-3 font-bold text-[#16130F]">Speaking</td>
                        <td className="p-3">Listen and Repeat, Take an Interview</td>
                        <td className="p-3">~8 minutes</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-[#16130F]">Writing</td>
                        <td className="p-3">Build a Sentence, Write an Email, Write for an Academic Discussion</td>
                        <td className="p-3">~23 minutes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section id="section-10" ref={sectionRefs['section-10']} className="scroll-mt-28">
              <DesiHeading hi="किताबें" className="mb-4">10. TOEFL Books: What are the Best Resources for the TOEFL?</DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-4">
                <p>
                  Top reference manuals recommended for self-study and practice:
                </p>
                <div className="space-y-3">
                  {[
                    { num: "1", name: "The Official Guide to the TOEFL iBT Test", desc: "Official diagnostic test guides direct from ETS." },
                    { num: "2", name: "The TOEFL iBT Test Prep Planner", desc: "Structured timeline tracker matching vocabulary and skills goals." },
                    { num: "3", name: "Official TOEFL iBT Tests, Volumes 1 & 2", desc: "Set of past real exam papers for mock simulations." }
                  ].map((book) => (
                    <div key={book.num} className="flex gap-4 p-4 border-2 border-[#16130F] rounded-xl bg-white shadow-[3px_3px_0_#16130F]">
                      <div className="w-9 h-9 rounded-full border-2 border-[#16130F] bg-[#F2B705] text-[#16130F] flex items-center justify-center font-urbanist text-[15px] font-black flex-shrink-0">
                        {book.num}
                      </div>
                      <div>
                        <h4 className="font-urbanist text-[15px] font-black text-[#16130F]">{book.name}</h4>
                        <p className="text-[#5B544A] text-[13.5px] mt-1 leading-relaxed">{book.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 11 */}
            <section id="section-11" ref={sectionRefs['section-11']} className="scroll-mt-28">
              <DesiHeading hi="प्रैक्टिस" className="mb-4">11. TOEFL Practice Tests: Boost your Preparation!</DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-4">
                <p>
                  Regular mock tests are critical to get used to the shortened 2-hour format, manage sections timing, and isolate weaknesses.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="section-12" ref={sectionRefs['section-12']} className="scroll-mt-28">
              <DesiHeading hi="यूनिवर्सिटी" className="mb-4">12. Top Global Universities Accepting TOEFL</DesiHeading>
              <div className="text-[#3D362E] text-[15px] leading-relaxed space-y-4 mb-6">
                <p>
                  Check B-school program score requirements in major study destinations.
                </p>
              </div>

              {/* Country Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {countries.map((country) => (
                  <button
                    key={country}
                    onClick={() => setActiveCountry(country)}
                    className={`no-shine px-4 py-2 rounded-full border-2 border-[#16130F] text-[13px] font-black transition-all cursor-pointer
                      ${activeCountry === country
                        ? 'bg-[#D0362E] text-white shadow-[3px_3px_0_#16130F] -translate-y-0.5'
                        : 'bg-white text-[#16130F] hover:bg-[#FFF1B8]'}`}
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
                      className="bg-white border-[3px] border-[#16130F] rounded-[14px] overflow-hidden shadow-[5px_5px_0_#16130F] flex flex-col justify-between group"
                    >
                      {/* Image header */}
                      <div className="h-32 w-full relative overflow-hidden bg-[#FFD9C2] border-b-[3px] border-[#16130F]">
                        <img 
                          src={uni.image} 
                          alt={uni.name} 
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/usa/harvard/banner.jpg';
                          }}
                        />
                        <span className="absolute top-3 right-3 px-2.5 py-1 bg-[#F2B705] border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] text-[#16130F] font-black text-[11px] rounded-md uppercase tracking-wider -rotate-2">
                          {uni.rank}
                        </span>
                      </div>

                      {/* Content block */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-11 h-11 rounded-xl bg-white border-2 border-[#16130F] flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                              <UniLogo logo={uni.logo} name={uni.name} domain={uni.domain} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-urbanist font-black text-[#16130F] text-[16px] leading-tight">
                                {uni.name}
                              </h4>
                              <p className="text-[12px] text-[#5B544A] font-semibold flex items-center gap-1 mt-0.5">
                                <MapPin size={10} />
                                {uni.location}
                              </p>
                            </div>
                          </div>

                          <div className="bg-[#FFF6E5] p-2.5 rounded-xl border-2 border-[#16130F] grid grid-cols-2 gap-2 text-center text-[13px] mt-4">
                            <div>
                              <span className="text-[10px] text-[#5B544A] font-extrabold block uppercase tracking-wider">Est. Tuition</span>
                              <span className="font-black text-[#B8285B] block mt-0.5">{uni.tuition}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#5B544A] font-extrabold block uppercase tracking-wider">Standard Exam</span>
                              <span className="font-black text-[#16130F] block mt-0.5">TOEFL Required</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-5 border-t-2 border-dashed border-[#16130F33] pt-4">
                          <Link
                            to={uni.path}
                            className="flex-1 py-2.5 text-center border-2 border-[#16130F] bg-white hover:bg-[#FFF1B8] text-[#16130F] font-bold text-[13px] rounded-full transition-colors"
                          >
                            Know More
                          </Link>
                          <Link
                            to={`/contact?university=${encodeURIComponent(uni.name)}`}
                            className="flex-1 py-2.5 text-center border-2 border-[#16130F] bg-[#D0362E] hover:bg-[#B52A23] text-white font-bold text-[13px] rounded-full transition-colors shadow-[2px_2px_0_#16130F]"
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

            {/* Widget: Live workshops */}
            <div className="bg-[#14837E] text-white p-6 rounded-[14px] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F]">
              <span className="font-['Rozha_One',serif] text-[15px] text-[#F2B705] leading-none block">लाइव वर्कशॉप</span>
              <span className="text-[11px] font-extrabold text-white/80 uppercase tracking-widest block mt-1.5 mb-2">Live Workshops</span>
              <h3 className="font-urbanist text-[20px] font-black leading-snug mb-2">
                Study Abroad Events & Fairs
              </h3>
              <p className="text-[14px] text-white/90 leading-relaxed mb-5">
                Join live webinars with global university delegates, admissions officers, and certified trainers.
              </p>
              <Link
                to="/events"
                className="w-full text-center py-3 bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] rounded-full text-[13px] font-black shadow-[3px_3px_0_#16130F] hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explore Live Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Widget: AI University Matcher */}
            <InkCard className="p-6 text-center" shadow="#B8285B">
              <div className="w-12 h-12 rounded-full border-2 border-[#16130F] bg-[#FBD9E6] text-[#B8285B] flex items-center justify-center mx-auto mb-4 shadow-[2px_2px_0_#16130F]">
                <Sparkles size={20} />
              </div>
              <h4 className="font-urbanist font-black text-[#16130F] text-[17px] mb-2">AI University Matcher</h4>
              <p className="text-[14px] text-[#5B544A] leading-relaxed mb-5">
                Match your target TOEFL score with top global universities and admission cutoffs.
              </p>
              <Link
                to="/ai-tools"
                className="w-full text-center py-3 border-2 border-[#16130F] bg-white text-[#16130F] rounded-full text-[13px] font-black hover:bg-[#FFF1B8] transition-colors block cursor-pointer"
              >
                Try AI Shortlister
              </Link>
            </InkCard>

          </aside>

        </div>

        {/* FAQs Accordion */}
        <section className="mt-16 max-w-4xl mx-auto">
          <DesiHeading hi="अक्सर पूछे सवाल" className="mb-6">Frequently Asked Questions (FAQs)</DesiHeading>
          <div className="space-y-3">
            {[
              { q: "What is the TOEFL score range, and how is it calculated?", a: "Since January 2026 each section is scored 1–6 in half bands, and the overall score is their average. The old 0–120 score is shown alongside until 2028." },
              { q: "Can I take the TOEFL exam multiple times?", a: "Yes, you can take the TOEFL as many times as you like. You can take it once in any 3-day period." },
              { q: "How long does it take to receive TOEFL scores?", a: "TOEFL iBT scores are typically available online 4-8 days after your test date." },
              { q: "Is there a limit on how many times I can send scores?", a: "You can send scores to 4 universities for free. Beyond that, additional reports cost ₹2,000 per university." },
              { q: "Is TOEFL harder than IELTS?", a: "It depends on preference: TOEFL is fully computer-delivered, whereas IELTS has a face-to-face speaking test with an examiner." },
              { q: "Which is cheaper among IELTS and TOEFL in India?", a: "TOEFL iBT is cheaper: ₹15,729 against ₹19,000 for standard IELTS Academic (fees checked October 2026)." }
            ].map((faq, idx) => {
              const isOpen = !!faqOpen[idx];
              return (
                <div key={idx} className="bg-white border-[3px] border-[#16130F] overflow-hidden" style={{ borderRadius: 12, boxShadow: isOpen ? '4px 4px 0 #D0362E' : '4px 4px 0 #16130F' }}>
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="no-shine w-full flex items-center justify-between gap-3 p-4 text-left font-bold text-[14.5px] text-[#16130F] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className={`w-7 h-7 rounded-full border-2 border-[#16130F] grid place-items-center shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-[#F2B705]' : 'bg-white'}`}>
                      <ChevronDown size={15} />
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
                        <div className="px-4 pb-4 pt-3 text-[#5B544A] text-[14px] border-t-2 border-dashed border-[#16130F33] leading-relaxed">
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

        <div className="mt-14">
          <BookOkCta
            hi="टोफ़ल प्लान बनाओ"
            text="TOEFL ka target score aur university list confuse kar rahi hai? Free 1:1 call mein mentor se plan banwao."
          />
        </div>

      </div>
    </div>
  );
};

export default TOEFLOverview;
