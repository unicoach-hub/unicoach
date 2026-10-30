import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  DollarSign,
  Clock,
  Compass,
  ArrowRight,
  Award,
  FileEdit,
  CheckCircle2,
  Globe,
  ChevronDown,
  Info
} from 'lucide-react';
import { HookBand, VersusCard } from '../../../components/ui/Infographics';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

// Poster tones for cards (rani, mustard, teal, sindoor first)
const TONES = [DESI_TONES[3], DESI_TONES[1], DESI_TONES[2], DESI_TONES[0]];

const SATOverview = () => {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState({});

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const keyFacts = [
    { title: "Test Organizer", value: "College Board" },
    { title: "Score Range", value: "400 – 1600" },
    { title: "Exam Duration", value: "2 Hours 14 Minutes" },
    { title: "Exam Mode", value: "Digital & Adaptive" },
    { title: "Fee for India", value: "$111 ($68 + $43 international)" },
    { title: "Valid for", value: "5 Years" }
  ];

  const exploreLinks = [
    { name: 'SAT Overview', path: '/exams/sat/overview', icon: Compass, desc: 'Core guide, test structure, eligibility requirements.' },
    { name: 'SAT Syllabus', path: '/exams/sat/syllabus', icon: BookOpen, desc: 'Section-by-section breakdown for Math & Reading/Writing.' },
    { name: 'SAT Exam Fees', path: '/exams/sat/fees', icon: DollarSign, desc: 'International pricing details, cancellations, rescheduling fees.' },
    { name: 'SAT Exam Dates', path: '/exams/sat/dates', icon: Calendar, desc: 'International digital SAT test window timelines.' },
    { name: 'SAT Registration', path: '/exams/sat/registration', icon: FileEdit, desc: 'Step-by-step account configuration and center selection.' },
    { name: 'SAT Results & Scoring', path: '/exams/sat/results', icon: Award, desc: 'Score scales, target benchmarks, and reports release times.' }
  ];

  const digitalChanges = [
    "Adaptive Format: The test adapts to your performance — second stage questions depend on your score in stage one.",
    "Integrated Desmos Calculator: A powerful graphing calculator is built directly into the Bluebook testing app.",
    "Shorter Passages: Reading sections feature shorter, more focused passages with one question per passage.",
    "Fast Score Delivery: Scores are typically returned within days instead of weeks."
  ];

  const faqs = [
    { q: "What is a good SAT score for top US universities?", a: "A score of 1500+ puts you in the top tier for Ivy League and elite schools (MIT, Stanford). For top 50 public universities, a score of 1350-1450 is highly competitive." },
    { q: "How many times can I take the SAT?", a: "There are no official restrictions. You can take the SAT as many times as you like. Most students take it twice: once in the spring of 11th grade, and once in the fall of 12th grade." },
    { q: "Is the SAT digital now?", a: "Yes, starting in 2023 for international students and 2024 for US students, the SAT is exclusively digital and adaptive. You take it on a laptop or tablet using College Board's official Bluebook application." }
  ];

  return (
    <div className="min-h-screen bg-[#FFF6E5] pb-20 select-none font-['Onest',sans-serif] text-[#16130F]">
      {/* Hero: rani poster band, key facts board on the right */}
      <DesiHero
        tone="rani"
        sign={{ hi: 'सैट', en: 'SAT DESK' }}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Exams' }, { label: 'SAT' }]}
        title="Digital SAT Exam: The Ultimate Roadmap for Indian Students"
        subtitle="Secure admissions to elite undergraduate programs in the USA, Canada, UK, and leading Indian universities. Get verified details on dates, registration steps, adaptive syllabus, and starting prep methods."
        stickers={(
          <>
            <Sticker bg="#F2B705" tilt={-2}><Compass size={14} />Comprehensive SAT Guide 2026</Sticker>
            <Sticker tilt={1.5}><Clock size={14} />Adaptive Format Active</Sticker>
            <Sticker bg="#DDF3EF" tilt={-1}><Globe size={14} />Organized by College Board</Sticker>
          </>
        )}
        aside={(
          <InkCard className="p-5 sm:p-6 text-[#16130F]" shadow="#F2B705" style={{ transform: 'rotate(0.6deg)' }}>
            <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E] leading-none">Main baatein</p>
            <h2 className="mt-1 mb-4 font-urbanist font-black text-[20px]">SAT at a glance</h2>
            <div className="grid grid-cols-2 gap-3">
              {keyFacts.map((fact, idx) => {
                const tone = TONES[idx % TONES.length];
                return (
                  <div key={idx} className="border-2 border-[#16130F] rounded-xl p-3" style={{ background: tone.soft }}>
                    <span className="text-[10.5px] text-[#5B544A] font-extrabold uppercase tracking-wider block mb-1">{fact.title}</span>
                    <span className="text-[14px] font-black text-[#16130F] leading-snug block">{fact.value}</span>
                  </div>
                );
              })}
            </div>
          </InkCard>
        )}
      />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-12 space-y-14">

        {/* Latest Updates Info Box */}
        <div className="flex items-start gap-4 bg-[#FFF1B8] border-[3px] border-[#16130F] p-5 rounded-[14px] shadow-[5px_5px_0_#16130F]">
          <div className="w-10 h-10 rounded-full border-2 border-[#16130F] bg-[#B8285B] text-white grid place-items-center flex-shrink-0 shadow-[2px_2px_0_#16130F]">
            <Info className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-urbanist font-black text-[#16130F] text-[16px]">Key Digital SAT Update</h4>
            <p className="text-[14px] text-[#3D362E] font-medium mt-1 leading-relaxed">
              The SAT is now 100% digital. It uses a multistage adaptive model where the difficulty of the second module depends on your accuracy in the first module. You must download the <strong>Bluebook app</strong> prior to testing.
            </p>
          </div>
        </div>

        <HookBand value="400–1600" label="Total Digital SAT score range, in 2 hours 14 minutes" hi="Score" />

        <div>
          <VersusCard
            kicker="Target scores"
            title="What score do you need?"
            left={{ title: 'Ivy League & elite', tag: '1500+', points: ['Puts you in the top tier for Ivy League and elite schools (MIT, Stanford)'] }}
            right={{ title: 'Top 50 public universities', tag: '1350-1450', points: ['A score of 1350-1450 is highly competitive'] }}
          />
        </div>

        {/* Explorer Hub links */}
        <section>
          <DesiHeading hi="SAT ki poori jaankari" className="mb-6">SAT Information Center</DesiHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {exploreLinks.map((link, idx) => {
              const IconComp = link.icon;
              const tone = TONES[idx % TONES.length];
              return (
                <InkCard
                  key={idx}
                  onClick={() => navigate(link.path)}
                  className="p-6 group cursor-pointer flex flex-col justify-between transition-transform hover:-translate-y-1"
                >
                  <div>
                    <div className="w-11 h-11 rounded-full border-2 border-[#16130F] grid place-items-center shadow-[2px_2px_0_#16130F]" style={{ background: tone.c, color: tone.fg }}>
                      <IconComp size={18} />
                    </div>
                    <h3 className="font-urbanist text-[18px] font-black text-[#16130F] mt-4">{link.name}</h3>
                    <p className="text-[14px] text-[#5B544A] leading-relaxed mt-2">{link.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[13px] font-black text-[#D0362E] mt-6 group-hover:gap-2 transition-all">
                    <span>Learn More</span>
                    <ArrowRight size={13} />
                  </div>
                </InkCard>
              );
            })}
          </div>
        </section>

        {/* Digital SAT key features section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InkCard className="p-6 md:p-8" shadow="#14837E">
            <DesiHeading hi="Kya badla" className="mb-5">Digital SAT Structural Enhancements</DesiHeading>
            <div className="space-y-4">
              {digitalChanges.map((change, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle2 size={18} className="text-[#14837E] shrink-0 mt-0.5" />
                  <p className="text-[14px] text-[#3D362E] leading-relaxed">{change}</p>
                </div>
              ))}
            </div>
          </InkCard>

          <div className="bg-[#14837E] text-white border-[3px] border-[#16130F] rounded-[14px] shadow-[5px_5px_0_#16130F] p-6 md:p-8 flex flex-col justify-between">
            <div>
              <p className="font-urbanist font-extrabold text-[16px] text-[#F2B705] leading-none">Taiyari shuru karo</p>
              <h3 className="mt-1.5 font-urbanist text-[26px] font-black leading-tight mb-3">Ready to Start Preparing?</h3>
              <p className="text-white/90 text-[14px] font-medium leading-relaxed">
                Connect with our expert SAT test prep mentors. We provide curated mock testing pipelines, diagnostic evaluations, and structured feedback sessions using official College Board patterns.
              </p>
            </div>
            <div className="mt-8">
              <Link
                to="/exams/sat/preparation"
                className="inline-flex items-center gap-2 bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] font-black text-[14px] px-5 py-3 rounded-full shadow-[3px_3px_0_#16130F] hover:-translate-y-0.5 transition-transform"
              >
                <span>Explore Prep Plans</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <section className="max-w-3xl mx-auto">
          <DesiHeading hi="Sabke sawaal" className="mb-6 text-center">Frequently Asked Questions</DesiHeading>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = !!faqOpen[idx];
              return (
                <div key={idx} className="bg-white border-[3px] border-[#16130F] overflow-hidden" style={{ borderRadius: 12, boxShadow: isOpen ? '4px 4px 0 #B8285B' : '4px 4px 0 #16130F' }}>
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="no-shine w-full p-4 text-left font-bold text-[14.5px] text-[#16130F] flex justify-between items-center gap-3 cursor-pointer"
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
                        <p className="px-4 pb-4 pt-3 text-[14px] text-[#5B544A] border-t-2 border-dashed border-[#16130F33] leading-relaxed">
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

        <BookOkCta
          hi="SAT plan banao"
          text="SAT target set karna hai? Free 1:1 call mein mentor ke saath score aur college list plan karo."
        />

      </div>
    </div>
  );
};

export default SATOverview;
