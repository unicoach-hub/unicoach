import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  Award,
  BookOpen,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  CheckCircle2,
  ChevronLeft,
  Target,
  Briefcase
} from 'lucide-react';
import { API_BASE_URL } from '../../../config';
import { DesiHero, DesiHeading, InkCard, Sticker } from '../../../components/desi/DesiKit';
import { DESI_TONES } from '../../../components/desi/desiTokens';
import { BookOkCta } from '../../../components/desi/BookOkCta';

const inputCls = "w-full px-4 py-3 rounded-lg bg-[#FFF6E5] border-2 border-[#16130F] text-[#16130F] text-[14px] font-semibold placeholder:text-[#8A7F70] outline-none focus:bg-white focus:shadow-[3px_3px_0_#F2B705] transition-shadow";

// Small centred section header with a Hindi kicker
const SectionHead = ({ hi, kicker, children }) => (
  <div className="text-center mb-10 sm:mb-12">
    <DesiHeading hi={hi}>{children}</DesiHeading>
    {kicker && (
      <span className="inline-block mt-3 px-3 py-1 rounded-full border-2 border-[#16130F] bg-white text-[11px] font-extrabold uppercase tracking-wider text-[#16130F] shadow-[2px_2px_0_#16130F]">
        {kicker}
      </span>
    )}
  </div>
);

const IELTSMasterclass = () => {
  // Multi-step form state
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    reason: '',
    profession: '',
    timeline: '',
    name: '',
    email: '',
    phone: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // FAQ state
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

  const steps = [
    {
      title: "Why do you want to prepare for IELTS?",
      field: "reason",
      options: ["Work VISA/PR", "Study Abroad", "Not Decided"]
    },
    {
      title: "What do you do?",
      field: "profession",
      options: ["Student", "Working", "Recently Graduated"]
    },
    {
      title: "When are you giving IELTS?",
      field: "timeline",
      options: ["Within 3 months", "Within 3-6 months", "Already Booked"]
    },
    {
      title: "Confirm your details to book slot",
      field: "details",
      inputs: [
        { label: "Full Name", name: "name", type: "text", placeholder: "Enter your name" },
        { label: "Email Address", name: "email", type: "email", placeholder: "Enter your email" },
        { label: "Phone Number", name: "phone", type: "tel", placeholder: "Enter mobile number" }
      ]
    }
  ];

  const handleOptionSelect = (field, option) => {
    setFormData({ ...formData, [field]: option });
    if (formStep < 4) {
      setFormStep(formStep + 1);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNextInputStep = async (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      setIsSubmitting(true);
      try {
        const apiUrl = API_BASE_URL;
        
        await fetch(`${apiUrl}/leads/book-consultation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            destination: 'Global (IELTS)',
            intake: formData.timeline || 'Within 3 months',
            source: 'IELTS Masterclass Booking',
            query: `Reason: ${formData.reason || 'Not specified'} | Profession: ${formData.profession || 'Not specified'} | Timeline: ${formData.timeline || 'Not specified'}`
          })
        });
      } catch (err) {
        console.error('Failed to save masterclass lead:', err);
      } finally {
        setIsSubmitting(false);
        setFormSubmitted(true);
      }
    }
  };

  const instructors = [
    { name: "Veronica Victoria", experience: "10+", students: "2,400+", image: "VV" },
    { name: "Ruchika Joshi", experience: "12+", students: "3,000+", image: "RJ" },
    { name: "Pew Mukherjee", experience: "7+", students: "1,200+", image: "PM" },
    { name: "Sana Hamza", experience: "10+", students: "2,000+", image: "SH" },
    { name: "Prabhjeet Singh", experience: "13+", students: "3,500+", image: "PS" },
  ];

  const scorecards = [
    { name: "Shazia", location: "Delhi", score: "7.5" },
    { name: "Tisha Amit", location: "Bangalore", score: "7.5" },
    { name: "Srihasa", location: "Hyderabad", score: "8.0" },
    { name: "Shouvik", location: "Mumbai", score: "8.0" },
    { name: "Khushee", location: "Chennai", score: "8.0" },
    { name: "Abhivan", location: "Pune", score: "8.0" },
    { name: "Manul Ahmed", location: "Amritsar", score: "8.0" },
    { name: "Karthic", location: "Ahmedabad", score: "8.0" }
  ];

  const faqs = [
    { q: "How to prepare for IELTS online?", a: "Preparing for IELTS online involves taking live training classes, doing regular practice mock tests, and using graded feedback tools to track speaking and writing improvements." },
    { q: "Can I prepare for IELTS by myself?", a: "Yes. Self-preparation is ideal if you have a strong background in English. You can use official Cambridge IELTS practice books, and complete timed mock tests." },
    { q: "How many attempts are allowed for IELTS?", a: "There is no limit to the number of times you can write the IELTS exam. You can take the test as often as you want by paying the base registration fee each time." },
    { q: "How much does IELTS cost in India?", a: "The standard fee for IELTS Academic or General Training in India is INR 19,000 (IDP India, from April 2026). IELTS for UKVI costs INR 19,250." },
    { q: "What are the 4 subjects in IELTS?", a: "The 4 core components evaluated in the IELTS exam are Listening, Reading, Writing, and Speaking." },
    { q: "Can I pass IELTS on the first attempt?", a: "Absolutely. With a targeted preparation plan, 1-2 hours of daily diagnostic exercises, and proper guidance, most candidates reach their target band score in their first attempt." },
    { q: "Is IELTS very difficult?", a: "It is not difficult, but it is highly standardized. Understanding the pattern, criteria of assessment (coherence, grammatical range), and timing limits is crucial." },
    { q: "Can I prepare for IELTS in 1 month?", a: "Yes. One month of preparation is typical and effective if you dedicate 2 hours daily to mock tests, vocabulary review, and active speaking exercises." }
  ];

  const heroStats = [
    { label: 'Course Rating', value: '4.8 / 5', sub: '5,000+ Reviews' },
    { label: 'Duration', value: '4 Weeks', sub: 'Flexible Schedule' },
    { label: 'Success Rate', value: '125k+', sub: 'Scored 7+ Bands' },
    { label: 'Live Hours', value: '40+ Hrs', sub: 'Learn at your pace' },
  ];

  const whyCards = [
    { icon: Award, title: '5000+ 5-Star Reviews', text: 'The highest-rated, most trusted online IELTS classes in the region. Verified scorecard results from genuine aspirants.' },
    { icon: TrendingUp, title: 'Band-Jump Guaranteed', text: 'Over 80% of our enrolled candidates improved their score to a 7.0+ overall band within 4 weeks of structured exercises.' },
    { icon: Calendar, title: 'Flexible Batch Schedules', text: 'Weekend courses designed specifically for working professionals, with recordings and module logs open 24/7.' },
  ];

  const startSteps = [
    { title: 'Attend Free Live Class', text: 'Get 30 mins introduction class with live trainer.' },
    { title: 'Take Band Predictor', text: 'Assess your current score level immediately.' },
    { title: 'Get Feedback', text: 'Identify key weak areas & customize study plans.' },
  ];

  // Lead booking form card (hero aside)
  const bookingCard = (
    <InkCard className="relative p-6 md:p-8 flex flex-col justify-center min-h-[420px] text-[#16130F]">
      <span aria-hidden="true" className="absolute -top-4 right-5 rotate-3 px-3 py-1 rounded-md bg-[#B8285B] text-white border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] font-urbanist font-extrabold text-[14px] leading-none">
        Seat book karo
      </span>
      <AnimatePresence mode="wait">
        {formSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-6 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-[#14837E] text-white border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] flex items-center justify-center mx-auto">
              <CheckCircle2 size={30} />
            </div>
            <div>
              <h3 className="font-urbanist text-[22px] font-black text-[#16130F]">Seat Reserved Successfully!</h3>
              <p className="text-[13px] text-[#5B544A] mt-2 font-medium">
                Thank you, <strong className="text-[#B8285B]">{formData.name}</strong>. An email with live masterclass link and details has been sent to <span className="text-[#16130F] font-semibold break-all">{formData.email}</span>.
              </p>
            </div>
            <div className="bg-[#FFF1B8] p-4 rounded-lg text-left border-2 border-[#16130F] text-[13px] font-medium space-y-2 text-[#3D362E]">
              <p className="flex items-center gap-2"><Target size={14} className="shrink-0 text-[#D0362E]" /><span><strong className="text-[#16130F]">Reason:</strong> {formData.reason}</span></p>
              <p className="flex items-center gap-2"><Briefcase size={14} className="shrink-0 text-[#D0362E]" /><span><strong className="text-[#16130F]">Profession:</strong> {formData.profession}</span></p>
              <p className="flex items-center gap-2"><Calendar size={14} className="shrink-0 text-[#D0362E]" /><span><strong className="text-[#16130F]">Timeline:</strong> {formData.timeline}</span></p>
            </div>
            <button
              onClick={() => { setFormSubmitted(false); setFormStep(1); setFormData({ reason: '', profession: '', timeline: '', name: '', email: '', phone: '' }); }}
              className="text-[13px] text-[#B8285B] font-extrabold underline decoration-2 underline-offset-2 hover:text-[#16130F] block mx-auto cursor-pointer"
            >
              Reset and Register Again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={`step-${formStep}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Step Indicators */}
            <div className="flex items-center justify-between gap-3 text-[11.5px] font-extrabold">
              <span className="uppercase tracking-wider text-[#D0362E]">Start Your Journey</span>
              <span className="px-2.5 py-1 rounded-full border-2 border-[#16130F] bg-[#F2B705] text-[#16130F] whitespace-nowrap">Step {formStep} of 4</span>
            </div>
            <div className="flex gap-1.5" aria-hidden="true">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={`h-2 flex-1 rounded-full border-2 border-[#16130F] ${n <= formStep ? 'bg-[#14837E]' : 'bg-[#FFF6E5]'}`} />
              ))}
            </div>

            <h3 className="font-urbanist text-[20px] md:text-[22px] font-black text-[#16130F] leading-snug">
              {steps[formStep - 1].title}
            </h3>

            {/* Render Selection Options or Inputs */}
            {steps[formStep - 1].options ? (
              <div className="flex flex-col gap-2.5">
                {steps[formStep - 1].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(steps[formStep - 1].field, opt)}
                    className="group w-full text-left py-3.5 px-4 rounded-lg border-2 border-[#16130F] bg-white hover:bg-[#FFF1B8] hover:shadow-[3px_3px_0_#16130F] hover:-translate-y-0.5 text-[#16130F] text-[14px] font-bold transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>{opt}</span>
                    <ChevronRight size={15} className="text-[#16130F] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleNextInputStep} className="space-y-4">
                {steps[formStep - 1].inputs.map((inp) => (
                  <div key={inp.name} className="space-y-1.5">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B544A]">{inp.label}</label>
                    <input
                      type={inp.type}
                      name={inp.name}
                      placeholder={inp.placeholder}
                      value={formData[inp.name]}
                      onChange={handleInputChange}
                      required
                      className={inputCls}
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-[#D0362E] hover:bg-[#B52A23] disabled:opacity-60 text-white text-[14px] font-bold border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#16130F] cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{isSubmitting ? 'Reserving Spot...' : 'Reserve My Spot'}</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            )}

            {/* Navigation back */}
            {formStep > 1 && (
              <button
                onClick={() => setFormStep(formStep - 1)}
                className="inline-flex items-center gap-1 text-[12px] font-extrabold text-[#5B544A] hover:text-[#16130F] cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Back</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </InkCard>
  );

  return (
    <div className="min-h-screen bg-[#FFF6E5] pb-20 font-['Onest',sans-serif] text-[#16130F] overflow-x-hidden">

      {/* Hero: mustard poster band with the booking form */}
      <DesiHero
        tone="mustard"
        sign={{ hi: 'मास्टरक्लास', en: 'IELTS MASTERCLASS' }}
        title={(
          <>
            4-Week Online IELTS Course <br />
            <span className="text-[#B8285B]">With India's Top Experts</span>
          </>
        )}
        subtitle="Join daily live classes, get personalized feedback from certified IELTS trainers, and practice with over 100+ simulated IELTS mock tests."
        stickers={(
          <Sticker bg="#16130F" fg="#F2B705" tilt={-2}><Sparkles size={14} />Band Jump Guarantee</Sticker>
        )}
        aside={bookingCard}
      >
        {/* Micro Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          {heroStats.map((s, i) => (
            <div key={s.label} className="bg-white p-3.5 border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] text-center" style={{ borderRadius: 12, transform: `rotate(${i % 2 ? 1 : -1}deg)` }}>
              <p className="text-[11px] text-[#5B544A] font-bold">{s.label}</p>
              <p className="font-urbanist text-[19px] font-black text-[#16130F] mt-1 leading-none">{s.value}</p>
              <p className="text-[10.5px] text-[#5B544A] font-semibold mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </DesiHero>

      {/* Why Choose Section */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-10 pt-16 sm:pt-20 mb-20 sm:mb-24">
        <SectionHead hi="Hum kyun?" kicker="Premium IELTS Training">Why Choose UniCoach for IELTS Prep?</SectionHead>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {whyCards.map((card, i) => {
            const tone = DESI_TONES[i === 0 ? 0 : i === 1 ? 2 : 3];
            const Icon = card.icon;
            return (
              <InkCard key={card.title} className="p-7 md:p-8 text-center space-y-4" shadow={tone.c}>
                <div className="w-14 h-14 rounded-full border-[3px] border-[#16130F] shadow-[2px_2px_0_#16130F] flex items-center justify-center mx-auto" style={{ background: tone.c, color: tone.fg }}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-urbanist font-black text-[#16130F] text-[20px]">{card.title}</h4>
                <p className="text-[14px] text-[#5B544A] leading-relaxed">{card.text}</p>
              </InkCard>
            );
          })}
        </div>
      </section>

      {/* Instructors Section */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-10 mb-20 sm:mb-24">
        <SectionHead hi="Mentors" kicker="Meet the Trainers">India's Top Certified IELTS Instructors</SectionHead>
        <p className="-mt-6 text-center text-[14px] text-[#5B544A] leading-relaxed max-w-lg mx-auto mb-10">
          Get trained by certified experts who have successfully guided thousands of students to score Band 7.5+ in the general & academic modules.
        </p>

        {/* Instructors Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {instructors.map((ins, i) => {
            const tone = DESI_TONES[i % 4];
            return (
              <InkCard key={i} className="p-4 sm:p-5 text-center space-y-3 hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-full font-urbanist font-black flex items-center justify-center text-lg mx-auto border-[3px] border-[#16130F] shadow-[2px_2px_0_#16130F]" style={{ background: tone.c, color: tone.fg }}>
                  {ins.image}
                </div>
                <div>
                  <h4 className="font-urbanist font-black text-[#16130F] text-[15px] leading-tight">{ins.name}</h4>
                  <p className="text-[10.5px] text-[#5B544A] font-extrabold uppercase tracking-wider mt-1">IELTS Coach</p>
                </div>
                <div className="p-2 rounded-lg text-[12px] text-[#5B544A] space-y-1 border-2 border-dashed border-[#16130F]/30" style={{ background: tone.soft }}>
                  <p><strong className="text-[#16130F]">{ins.experience} Yrs</strong> Experience</p>
                  <p><strong className="text-[#16130F]">{ins.students}</strong> Trained</p>
                </div>
              </InkCard>
            );
          })}
        </div>

        {/* Steps to start */}
        <div className="bg-[#14837E] text-white p-6 sm:p-8 md:p-10 border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] max-w-[900px] mx-auto" style={{ borderRadius: 18 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {startSteps.map((st, i) => (
              <div key={st.title} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#F2B705] text-[#16130F] border-[3px] border-[#16130F] font-urbanist font-black flex items-center justify-center text-[15px] flex-shrink-0 shadow-[2px_2px_0_#16130F]">{i + 1}</div>
                <div>
                  <h4 className="font-urbanist font-black text-[16px] mb-1">{st.title}</h4>
                  <p className="text-[13px] text-white/85">{st.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Card Grid */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-10 mb-20 sm:mb-24">
        <SectionHead hi="Scorecard" kicker="Success Scorecards">We've Helped 5,000+ Score 8.0+ Bands</SectionHead>

        {/* Responsive scorecards grid */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 gap-4">
          {scorecards.map((sc, i) => {
            const tone = DESI_TONES[i % 4];
            return (
              <InkCard key={i} className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:-translate-y-0.5 transition-transform" style={{ transform: `rotate(${i % 2 ? 0.8 : -0.8}deg)` }}>
                <div className="min-w-0">
                  <h4 className="font-urbanist font-black text-[#16130F] text-[15px] leading-snug">{sc.name}</h4>
                  <span className="text-[10.5px] text-[#5B544A] font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                    <MapPin size={11} className="text-[#D0362E]" />
                    {sc.location}
                  </span>
                </div>
                <div className="w-14 h-14 shrink-0 rounded-lg border-[3px] border-[#16130F] flex flex-col items-center justify-center" style={{ background: tone.c, color: tone.fg }}>
                  <span className="text-[9px] font-black uppercase leading-none opacity-90">Band</span>
                  <span className="font-urbanist text-[18px] font-black leading-none mt-1">{sc.score}</span>
                </div>
              </InkCard>
            );
          })}
        </div>
      </section>

      {/* Practice & Resources Section */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-10 mb-20 sm:mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Card 1: Mock Tests */}
          <div className="bg-[#B8285B] text-white p-7 md:p-10 border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] space-y-6 relative overflow-hidden" style={{ borderRadius: 18 }}>
            <div className="w-12 h-12 rounded-full bg-[#F2B705] text-[#16130F] border-[3px] border-[#16130F] shadow-[2px_2px_0_#16130F] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <p className="font-urbanist font-extrabold text-[15px] leading-none text-[#F2B705]">Mock test</p>
              <h3 className="mt-1.5 font-urbanist text-[22px] md:text-[26px] font-black mb-2">Simulated IELTS Mock Tests</h3>
              <p className="text-[14px] text-white/85 leading-relaxed">
                Test yourself under real exam constraints. Get instant AI score grading and professional review.
              </p>
            </div>

            <ul className="space-y-2.5 text-[14px] font-semibold text-white list-none p-0 m-0">
              {['100+ Full-Length Mock Exams', 'Instant Diagnostic Band Predictor', 'Sectional evaluations with metrics'].map((li) => (
                <li key={li} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#F2B705] flex-shrink-0" />
                  <span>{li}</span>
                </li>
              ))}
            </ul>

            <button className="px-6 py-3.5 bg-white text-[#16130F] hover:bg-[#FFF1B8] rounded-full text-[14px] font-bold flex items-center gap-1.5 border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] cursor-pointer transition-colors">
              <span>Access Mock Tests</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Card 2: Resources */}
          <InkCard className="p-7 md:p-10 space-y-6 relative overflow-hidden" shadow="#F2B705">
            <div className="w-12 h-12 rounded-full bg-[#14837E] text-white border-[3px] border-[#16130F] shadow-[2px_2px_0_#16130F] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>

            <div>
              <p className="font-urbanist font-extrabold text-[15px] leading-none text-[#D0362E]">Free material</p>
              <h3 className="mt-1.5 font-urbanist text-[22px] md:text-[26px] font-black text-[#16130F] mb-2">Free Study Materials & PDFs</h3>
              <p className="text-[14px] text-[#5B544A] leading-relaxed">
                Download structured writing templates, cue card sample answers, and detailed listening answer logs.
              </p>
            </div>

            <ul className="space-y-2.5 text-[14px] font-semibold text-[#3D362E] list-none p-0 m-0">
              {['Official PDF Guides & Intake Books', '20+ Hours of Recorded Concept Classes', 'Speaking prompts and answer key lists'].map((li) => (
                <li key={li} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#14837E] flex-shrink-0" />
                  <span>{li}</span>
                </li>
              ))}
            </ul>

            <button className="px-6 py-3.5 bg-[#16130F] hover:bg-[#2A2520] text-[#F2B705] rounded-full text-[14px] font-bold flex items-center gap-1.5 border-2 border-[#16130F] shadow-[3px_3px_0_#F2B705] cursor-pointer transition-colors">
              <span>Download Resources</span>
              <ArrowRight size={15} />
            </button>
          </InkCard>

        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-[850px] mx-auto px-4 md:px-10 mb-16">
        <SectionHead hi="Sawaal-Jawaab" kicker="Got Questions?">Frequently Asked Questions</SectionHead>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div
                key={idx}
                className={`border-[3px] border-[#16130F] overflow-hidden transition-all duration-300 ${isOpen ? 'bg-[#FFF1B8] shadow-[4px_4px_0_#B8285B]' : 'bg-white shadow-[3px_3px_0_#16130F]'}`}
                style={{ borderRadius: 12 }}
              >
                <button
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full text-left py-4 sm:py-5 px-5 sm:px-6 font-urbanist font-extrabold text-[#16130F] flex items-center justify-between gap-3 text-[15px] md:text-[16px] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className={`w-7 h-7 shrink-0 rounded-full border-2 border-[#16130F] grid place-items-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#B8285B] text-white' : 'bg-[#F2B705]'}`}>
                    <ChevronDown size={15} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-5 text-[14px] text-[#3D362E] leading-relaxed border-t-2 border-dashed border-[#16130F]/30 pt-3">
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
      <div className="max-w-[1320px] mx-auto px-4 md:px-10">
        <BookOkCta
          hi="Book OK Please"
          text="Band score ka target set karna hai? Ek free call pe plan bana lete hain. 1:1, ek ghante ki baat."
          cta="Free call book karo"
        />
      </div>

    </div>
  );
};

export default IELTSMasterclass;
