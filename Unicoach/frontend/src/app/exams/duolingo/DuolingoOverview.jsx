import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  DollarSign,
  Clock,
  Compass,
  ArrowLeft,
  ArrowRight,
  Award,
  ChevronRight,
  FileEdit,
  Globe,
  ChevronDown
} from 'lucide-react';
import { HookBand, Donut } from '../../../components/ui/Infographics';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

const DuolingoOverview = () => {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState({});
  const [activeSlider, setActiveSlider] = useState(0);

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const keyFacts = [
    { title: "Test Cost (INR)", value: "Rs. 6,499 ($70)" },
    { title: "Score Scale", value: "10 – 160" },
    { title: "Exam Duration", value: "~60 Minutes" },
    { title: "Test Mode", value: "Online from home" },
    { title: "Score Sending", value: "Unlimited, Free" },
    { title: "Results turnaround", value: "48 Hours" }
  ];

  const exploreLinks = [
    { name: 'Duolingo Overview', path: '/exams/duolingo/overview', icon: Compass, desc: 'DET overview, basic requirements, and score structure.' },
    { name: 'Duolingo Syllabus', path: '/exams/duolingo/syllabus', icon: BookOpen, desc: 'DET section breakdowns: Adaptive test, Writing & Speaking samples.' },
    { name: 'Duolingo Exam Fees', path: '/exams/duolingo/fees', icon: DollarSign, desc: 'Exam fees in INR, bundles, and score sharing savings.' },
    { name: 'Duolingo Registration', path: '/exams/duolingo/registration', icon: FileEdit, desc: 'Aadhaar / Passport validation checklist and phone camera setup.' },
    { name: 'Duolingo Results', path: '/exams/duolingo/results', icon: Award, desc: 'IELTS score comparison bands and DET subscores.' }
  ];

  const sliders = [
    {
      title: "1. What is DET & Why Choose It?",
      desc: "DET is an online English proficiency test evaluating Reading, Writing, Listening, and Speaking in 60 minutes. Indian students choose it for its Rs. 6,499 ($70) low cost, 48-hour results, and the comfort of testing from home.",
      insight: "India is now the largest test-taking population globally. Over 6,000 institutions accept DET for undergraduate and postgraduate entries."
    },
    {
      title: "2. Duolingo English Test Fees",
      desc: "DET fee is $70 (~Rs. 6,499). Alternatively, you can purchase a 2-test bundle for $118 (~Rs. 10,955) which brings sittings down to Rs. 5,478 each. Score reports can be shared with unlimited universities for free.",
      insight: "Unlike IELTS, payment must be processed by credit/debit card with international transaction rights enabled. UPI is not supported."
    },
    {
      title: "3. Test Format & July 2025 Update",
      desc: "Comprises onboarding checks (5 mins), an Adaptive Test (45 mins), and a Writing & Speaking sample (10 mins). The July 2025 update removed 'Read Aloud' and 'Listen, Then Speak', replacing them with 'Interactive Speaking' (6 conversational prompts with 35 secs each).",
      insight: "Interactive Speaking provides zero preparation time. You must practice speaking on random prompts without pausing."
    },
    {
      title: "4. Scoring Scales & Subscores",
      desc: "DET reports a total score of 10-160, plus 8 subscores (Comprehension, Literacy, Conversation, Production, etc.). In early 2025, Duolingo revised its scoring conversion table: a DET 120 now equates to IELTS 6.5, not 7.0 as older guides state.",
      insight: "Production (Speaking + Writing) is consistently the lowest subscore for Indian test-takers. Practice typing speed to hit 40-60 WPM."
    },
    {
      title: "5. Visa & Country Acceptance",
      desc: "DET is highly accepted for admissions in the US, Canada, and Ireland. However, it is not accepted for UK student visas (requires UKVI SELT) or Australian immigration.",
      insight: "A university may accept DET for admission, but the visa center might reject it. Verify your visa pathway before registering."
    }
  ];

  const faqs = [
    { q: "Is the Duolingo English Test accepted for US F-1 student visas?", a: "Yes. While the US visa office does not evaluate your English test scores directly, your university must issue you an I-20 based on DET. Once you have the I-20, your visa route is secure." },
    { q: "Can I use DET for a UK student visa in 2026?", a: "No. UK Visas and Immigration (UKVI) requires a Secure English Language Test (SELT) like IELTS UKVI or PTE Academic UKVI. DET is not currently accepted." },
    { q: "What is a good DET score for top universities?", a: "A score of 120+ is equivalent to IELTS 6.5 and is sufficient for most universities. Elite departments or Ivy League colleges expect 130+." }
  ];

  const weeks = [
    { title: "Week 1: Format & Diagnostic Practice", desc: "Take the official practice test on englishtest.duolingo.com to find your baseline. Familiarize yourself with the 19 question types." },
    { title: "Week 2: Target Weak Subscores", desc: "Focus on writing and speaking modules (Production score is typically the lowest). Practise typing to reach 40+ WPM on your laptop keyboard." },
    { title: "Week 3: Full Length Mocks", desc: "Attempt 2 to 3 full practice mock sittings under real testing conditions (silent room, strict timing, closed background apps)." },
    { title: "Week 4: Pacing & Technical Dry-run", desc: "Run a complete system check (webcam calibration, secondary phone camera propping, and background tool checks). Sit the exam." }
  ];

  return (
    <main className="min-h-screen bg-[#FFF6E5] pb-20 select-none font-['Onest',sans-serif] text-[#16130F]">
      {/* ── HERO: teal poster band ── */}
      <DesiHero
        tone="teal"
        sign={{ hi: 'डुओलिंगो', en: 'DUOLINGO DESK' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams' }, { label: 'Duolingo' }]}
        title="Duolingo English Test (DET) 2026: Fees, Dates, Test Format & Results"
        subtitle="Save up to Rs. 15,000 on registration and scoring. Complete guide on DET fee in rupees, July 2025 interactive upgrades, and 4-week preparation guidelines."
        stickers={(
          <>
            <Sticker bg="#F2B705" tilt={-2}><Compass size={14} />Duolingo English Test (DET) 2026</Sticker>
            <Sticker tilt={1.5}><Clock size={14} />Updated: June 19, 2026</Sticker>
            <Sticker bg="#FBD9E6" tilt={-1}><Globe size={14} />6,000+ Accepted Institutions</Sticker>
          </>
        )}
      >
        <Link
          to="/exams/duolingo/practice-test"
          className="no-shine mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#16130F] bg-[#F2B705] hover:bg-[#FFC92E] text-[#16130F] text-[14px] font-bold shadow-[3px_3px_0_#16130F] transition-transform hover:-translate-y-0.5"
        >
          Take the free practice test
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </DesiHero>

      <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-10 sm:pt-12 space-y-14">

        {/* Visual hook */}
        <HookBand value="48 hrs" label="to certified results, shared with unlimited universities for free" hi="फटाफट" />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {keyFacts.map((fact, idx) => {
            const tone = DESI_TONES[idx % 4];
            return (
              <div key={fact.title} className="bg-white border-[3px] border-[#16130F] p-4 text-center shadow-[4px_4px_0_#16130F]" style={{ borderRadius: 12, borderTop: `8px solid ${tone.c}` }}>
                <span className="text-[10.5px] text-[#5B544A] font-extrabold uppercase tracking-wider block mb-1">{fact.title}</span>
                <span className="font-urbanist text-[15px] font-black text-[#16130F]">{fact.value}</span>
              </div>
            );
          })}
        </div>

        {/* Interactive Guide Slider */}
        <InkCard className="p-5 sm:p-8 md:p-10" shadow="#14837E">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
            <div>
              <DesiHeading hi="ज़रूरी बातें">Duolingo Exam Key Highlights</DesiHeading>
              <p className="text-[#5B544A] text-[13.5px] mt-2">Scroll through the slider to explore essential requirements and updates.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSlider(prev => Math.max(0, prev - 1))}
                aria-label="Previous"
                className="no-shine w-11 h-11 rounded-full bg-white hover:bg-[#F2B705] flex items-center justify-center border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] text-[#16130F] transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-white"
                disabled={activeSlider === 0}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={() => setActiveSlider(prev => Math.min(sliders.length - 1, prev + 1))}
                aria-label="Next"
                className="no-shine w-11 h-11 rounded-full bg-white hover:bg-[#F2B705] flex items-center justify-center border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] text-[#16130F] transition-colors cursor-pointer disabled:opacity-40 disabled:hover:bg-white"
                disabled={activeSlider === sliders.length - 1}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex gap-1.5 mb-6">
            {sliders.map((sl, i) => (
              <button
                key={sl.title}
                onClick={() => setActiveSlider(i)}
                aria-label={sl.title}
                className={`no-shine h-3 rounded-full border-2 border-[#16130F] transition-all cursor-pointer ${i === activeSlider ? 'w-9 bg-[#14837E]' : 'w-3 bg-white'}`}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-urbanist text-[20px] sm:text-[22px] font-black text-[#16130F] leading-tight">{sliders[activeSlider].title}</h3>
              <p className="text-[#5B544A] text-[14.5px] leading-relaxed">{sliders[activeSlider].desc}</p>
            </div>
            <div className="p-5 bg-[#FFF1B8] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] flex flex-col justify-between rotate-[0.8deg]" style={{ borderRadius: 12 }}>
              <div>
                <span className="font-['Rozha_One',serif] text-[14px] text-[#D0362E] leading-none block">मेंटर की सलाह</span>
                <span className="text-[11px] text-[#16130F] font-extrabold uppercase tracking-wider block mt-1 mb-2">Mentor Strategy</span>
                <p className="text-[#3D362E] text-[13.5px] font-medium leading-relaxed">{sliders[activeSlider].insight}</p>
              </div>
              <div className="text-[11.5px] text-[#5B544A] font-bold mt-4">
                Section {activeSlider + 1} of {sliders.length}
              </div>
            </div>
          </div>
        </InkCard>

        {/* Test format split */}
        <Donut
          className="mb-10"
          kicker="Test format"
          title="Inside the ~60-minute DET"
          centerValue="60"
          centerLabel="minutes"
          segments={[
            { label: 'Onboarding checks', value: 5, display: '5 min' },
            { label: 'Adaptive Test', value: 45, display: '45 min' },
            { label: 'Writing & Speaking sample', value: 10, display: '10 min' },
          ]}
        />

        {/* Links to Info Hub */}
        <section>
          <DesiHeading hi="पूरी जानकारी">Duolingo Detailed Resources</DesiHeading>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {exploreLinks.map((link, idx) => {
              const IconComp = link.icon;
              const tone = DESI_TONES[idx % 4];
              return (
                <div
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="bg-white border-[3px] border-[#16130F] p-5 sm:p-6 shadow-[5px_5px_0_#16130F] hover:-translate-y-1 hover:shadow-[7px_7px_0_#16130F] transition-all group cursor-pointer flex flex-col justify-between"
                  style={{ borderRadius: 14 }}
                >
                  <div>
                    <div className="w-11 h-11 rounded-full border-2 border-[#16130F] flex items-center justify-center" style={{ background: tone.c, color: tone.fg }}>
                      <IconComp size={19} />
                    </div>
                    <h3 className="font-urbanist text-[17px] font-black text-[#16130F] mt-4">{link.name}</h3>
                    <p className="text-[13.5px] text-[#5B544A] leading-relaxed mt-2">{link.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[13px] font-extrabold text-[#D0362E] mt-6 group-hover:gap-2 transition-all">
                    <span>Read Details</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4-Week Prep Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          <InkCard className="lg:col-span-2 p-5 sm:p-8">
            <div className="flex items-start gap-3 mb-6">
              <span className="w-10 h-10 rounded-full border-2 border-[#16130F] bg-[#14837E] text-white grid place-items-center shrink-0 shadow-[2px_2px_0_#16130F]">
                <Calendar size={18} />
              </span>
              <DesiHeading hi="चार हफ़्ते का प्लान">4-Week Action Study Plan</DesiHeading>
            </div>
            <div className="space-y-4">
              {weeks.map((w, i) => {
                const tone = DESI_TONES[i % 4];
                return (
                  <div key={w.title} className="flex gap-3">
                    <span className="w-8 h-8 rounded-full border-2 border-[#16130F] flex items-center justify-center shrink-0 font-urbanist font-black text-[14px]" style={{ background: tone.c, color: tone.fg }}>{i + 1}</span>
                    <div className="min-w-0">
                      <h4 className="font-urbanist font-black text-[15px] text-[#16130F]">{w.title}</h4>
                      <p className="text-[13.5px] text-[#5B544A] mt-0.5 leading-relaxed">{w.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </InkCard>

          <div className="bg-[#B8285B] text-white border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] p-6 sm:p-8 flex flex-col justify-between -rotate-[0.8deg]" style={{ borderRadius: 14 }}>
            <div>
              <p className="font-['Rozha_One',serif] text-[16px] text-[#F2B705] leading-none">मास्टरक्लास</p>
              <h3 className="mt-1.5 font-urbanist text-[24px] font-black mb-3 leading-tight">Duolingo Masterclass</h3>
              <p className="text-white/90 text-[14px] leading-relaxed">
                Connect with our test prep coaches. We provide downloadable mock tests, specialized grammar/vocabulary drill files, and feedback loops on timed speaking prompts.
              </p>
            </div>
            <div className="mt-8">
              <Link
                to="/exams/duolingo/preparation"
                className="no-shine inline-flex items-center gap-2 bg-[#F2B705] hover:bg-[#FFC92E] text-[#16130F] font-bold text-[14px] px-5 py-3 rounded-full border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] transition-colors"
              >
                <span>Join Free Masterclass</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <section className="max-w-3xl mx-auto">
          <DesiHeading hi="अक्सर पूछे सवाल" className="text-center">Frequently Asked Questions</DesiHeading>
          <div className="mt-6 space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = !!faqOpen[idx];
              return (
                <div key={faq.q} className="bg-white border-[3px] border-[#16130F] overflow-hidden" style={{ borderRadius: 12, boxShadow: isOpen ? '4px 4px 0 #14837E' : '4px 4px 0 #16130F' }}>
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="no-shine w-full flex items-center justify-between gap-3 p-4 text-left font-bold text-[14.5px] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className={`w-7 h-7 rounded-full border-2 border-[#16130F] grid place-items-center shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-[#F2B705]' : 'bg-white'}`}>
                      <ChevronDown size={15} />
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 pt-3 text-[#5B544A] text-[14px] border-t-2 border-dashed border-[#16130F33] leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Closing CTA */}
        <BookOkCta
          to="/book-consultation"
          hi="डुओलिंगो या आइल्ट्स?"
          title="Book OK Please."
          text="DET chalega ya IELTS chahiye? Free 1:1 call mein mentor se poocho."
        />

      </div>
    </main>
  );
};

export default DuolingoOverview;
