import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  Clock,
  UserCheck,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Lock,
  ChevronLeft
} from 'lucide-react';
import { API_BASE_URL } from '../../../config';

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
    { q: "How much does IELTS cost in India?", a: "The standard fee for both paper-based and computer-delivered IELTS Academic or General Training in India is INR 18,000." },
    { q: "What are the 4 subjects in IELTS?", a: "The 4 core components evaluated in the IELTS exam are Listening, Reading, Writing, and Speaking." },
    { q: "Can I pass IELTS on the first attempt?", a: "Absolutely. With a targeted preparation plan, 1-2 hours of daily diagnostic exercises, and proper guidance, most candidates reach their target band score in their first attempt." },
    { q: "Is IELTS very difficult?", a: "It is not difficult, but it is highly standardized. Understanding the pattern, criteria of assessment (coherence, grammatical range), and timing limits is crucial." },
    { q: "Can I prepare for IELTS in 1 month?", a: "Yes. One month of preparation is typical and effective if you dedicate 2 hours daily to mock tests, vocabulary review, and active speaking exercises." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      
      {/* Dynamic Hero Section */}
      <section className="max-w-[1320px] mx-auto px-6 md:px-10 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden shadow-2xl relative border border-slate-900">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Hero Content */}
          <div className="relative z-10 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/25 border border-indigo-500/35 text-indigo-300 text-xs font-black uppercase tracking-wider">
              <Sparkles size={13} className="text-amber-300 fill-amber-300" />
              Band Jump Guarantee
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
              4-Week Online IELTS Course <br />
              <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                With India's Top Experts
              </span>
            </h1>
            <p className="text-slate-350 text-sm md:text-base leading-relaxed max-w-lg font-medium">
              Join daily live classes, get personalized feedback from certified IELTS trainers, and practice with over 100+ simulated IELTS mock tests.
            </p>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
                <p className="text-xs text-slate-400 font-bold">Course Rating</p>
                <p className="text-lg font-black text-white mt-1">4.8 / 5</p>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">5,000+ Reviews</p>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
                <p className="text-xs text-slate-400 font-bold">Duration</p>
                <p className="text-lg font-black text-white mt-1">4 Weeks</p>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">Flexible Schedule</p>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
                <p className="text-xs text-slate-400 font-bold">Success Rate</p>
                <p className="text-lg font-black text-white mt-1">125k+</p>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">Scored 7+ Bands</p>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
                <p className="text-xs text-slate-400 font-bold">Live Hours</p>
                <p className="text-lg font-black text-white mt-1">40+ Hrs</p>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">Learn at your pace</p>
              </div>
            </div>
          </div>

          {/* Right Lead Booking Form Card */}
          <div className="relative z-10 bg-white text-slate-800 p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col justify-center min-h-[420px]">
            <AnimatePresence mode="wait">
              {formSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Seat Reserved Successfully!</h3>
                    <p className="text-xs text-slate-500 mt-2 font-semibold">
                      Thank you, <strong className="text-indigo-600">{formData.name}</strong>. An email with live masterclass link and details has been sent to <span className="text-slate-700">{formData.email}</span>.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-100 text-xs font-semibold space-y-2 text-slate-600">
                    <p>🎯 <strong className="text-slate-800">Reason:</strong> {formData.reason}</p>
                    <p>💼 <strong className="text-slate-800">Profession:</strong> {formData.profession}</p>
                    <p>📅 <strong className="text-slate-800">Timeline:</strong> {formData.timeline}</p>
                  </div>
                  <button 
                    onClick={() => { setFormSubmitted(false); setFormStep(1); setFormData({ reason: '', profession: '', timeline: '', name: '', email: '', phone: '' }); }}
                    className="text-xs text-indigo-600 font-extrabold hover:underline block mx-auto cursor-pointer"
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
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-400">
                    <span className="uppercase tracking-widest text-indigo-600">Start Your Journey</span>
                    <span>Step {formStep} of 4</span>
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-slate-900 leading-snug">
                    {steps[formStep - 1].title}
                  </h3>

                  {/* Render Selection Options or Inputs */}
                  {steps[formStep - 1].options ? (
                    <div className="flex flex-col gap-2.5">
                      {steps[formStep - 1].options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleOptionSelect(steps[formStep - 1].field, opt)}
                          className="w-full text-left py-3.5 px-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 text-slate-700 text-xs font-black transition-all cursor-pointer flex items-center justify-between"
                        >
                          <span>{opt}</span>
                          <ChevronRight size={14} className="text-slate-400" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <form onSubmit={handleNextInputStep} className="space-y-4">
                      {steps[formStep - 1].inputs.map((inp) => (
                        <div key={inp.name} className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500">{inp.label}</label>
                          <input
                            type={inp.type}
                            name={inp.name}
                            placeholder={inp.placeholder}
                            value={formData[inp.name]}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                          />
                        </div>
                      ))}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-black shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1"
                      >
                        <span>{isSubmitting ? 'Reserving Spot...' : 'Reserve My Spot'}</span>
                        <ArrowRight size={14} />
                      </button>
                    </form>
                  )}

                  {/* Navigation back */}
                  {formStep > 1 && (
                    <button
                      onClick={() => setFormStep(formStep - 1)}
                      className="inline-flex items-center gap-1 text-[11px] font-black text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <ChevronLeft size={13} />
                      <span>Back</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* Why Choose Section */}
      <section className="max-w-[1320px] mx-auto px-6 md:px-10 mb-24">
        <p className="text-center text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-3">Premium IELTS Training</p>
        <h2 className="text-center text-2xl md:text-4xl font-black text-slate-900 mb-12">
          Why Choose UniCoach for IELTS Prep?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-850 text-lg">5000+ 5-Star Reviews</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              The highest-rated, most trusted online IELTS classes in the region. Verified scorecard results from genuine aspirants.
            </p>
          </div>
          <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-850 text-lg">Band-Jump Guaranteed</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Over 80% of our enrolled candidates improved their score to a 7.0+ overall band within 4 weeks of structured exercises.
            </p>
          </div>
          <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-850 text-lg">Flexible Batch Schedules</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Weekend courses designed specifically for working professionals, with recordings and module logs open 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Instructors Section */}
      <section className="max-w-[1320px] mx-auto px-6 md:px-10 mb-24">
        <p className="text-center text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-3">Meet the Trainers</p>
        <h2 className="text-center text-2xl md:text-4xl font-black text-slate-900 mb-4">
          India's Top Certified IELTS Instructors
        </h2>
        <p className="text-center text-xs text-slate-500 leading-relaxed max-w-lg mx-auto mb-12 font-semibold">
          Get trained by certified experts who have successfully guided thousands of students to score Band 7.5+ in the general & academic modules.
        </p>

        {/* Instructors Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {instructors.map((ins, i) => (
            <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl text-center space-y-3 shadow-sm hover:border-indigo-200 transition-all">
              <div className="w-16 h-16 rounded-full bg-slate-950 text-white font-black flex items-center justify-center text-lg mx-auto border-4 border-slate-50 shadow-md">
                {ins.image}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-805 text-sm">{ins.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">IELTS Coach</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-[11px] font-semibold text-slate-500 space-y-1">
                <p><strong className="text-slate-700">{ins.experience} Yrs</strong> Experience</p>
                <p><strong className="text-slate-700">{ins.students}</strong> Trained</p>
              </div>
            </div>
          ))}
        </div>

        {/* Steps to start */}
        <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[2rem] border border-slate-900 shadow-xl max-w-[900px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</div>
              <div>
                <h4 className="font-extrabold text-sm mb-1">Attend Free Live Class</h4>
                <p className="text-xs text-slate-400 font-semibold">Get 30 mins introduction class with live trainer.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</div>
              <div>
                <h4 className="font-extrabold text-sm mb-1">Take Band Predictor</h4>
                <p className="text-xs text-slate-400 font-semibold">Assess your current score level immediately.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</div>
              <div>
                <h4 className="font-extrabold text-sm mb-1">Get Feedback</h4>
                <p className="text-xs text-slate-400 font-semibold">Identify key weak areas & customize study plans.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Card Grid */}
      <section className="max-w-[1320px] mx-auto px-6 md:px-10 mb-24">
        <p className="text-center text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-3">Success Scorecards</p>
        <h2 className="text-center text-2xl md:text-4xl font-black text-slate-900 mb-12">
          We've Helped 5,000+ Score 8.0+ Bands
        </h2>

        {/* Responsive scorecards grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scorecards.map((sc, i) => (
            <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:scale-[1.02] transition-transform">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{sc.name}</h4>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                  <MapPin size={10} className="text-indigo-500" />
                  {sc.location}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center shadow-inner">
                <span className="text-[9px] font-black uppercase text-indigo-400 leading-none">Band</span>
                <span className="text-base font-black leading-none mt-1">{sc.score}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Practice & Resources Section */}
      <section className="max-w-[1320px] mx-auto px-6 md:px-10 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Mock Tests */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 rounded-[2rem] border border-indigo-950 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Award className="w-6 h-6" />
            </div>
            
            <div>
              <h3 className="text-xl md:text-2xl font-black mb-2">Simulated IELTS Mock Tests</h3>
              <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                Test yourself under real exam constraints. Get instant AI score grading and professional review.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs font-semibold text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-400 flex-shrink-0" />
                <span>100+ Full-Length Mock Exams</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-400 flex-shrink-0" />
                <span>Instant Diagnostic Band Predictor</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-400 flex-shrink-0" />
                <span>Sectional evaluations with metrics</span>
              </li>
            </ul>

            <button className="px-6 py-3.5 bg-white text-indigo-900 hover:bg-slate-100 rounded-xl text-xs font-black flex items-center gap-1 shadow-lg cursor-pointer active:scale-98 transition-all">
              <span>Access Mock Tests</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2: Resources */}
          <div className="bg-white border border-slate-150 p-8 md:p-10 rounded-[2rem] shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <BookOpen className="w-6 h-6" />
            </div>
            
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Free Study Materials & PDFs</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Download structured writing templates, cue card sample answers, and detailed listening answer logs.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs font-semibold text-slate-650">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600 flex-shrink-0" />
                <span>Official PDF Guides & Intake Books</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600 flex-shrink-0" />
                <span>20+ Hours of Recorded Concept Classes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-indigo-600 flex-shrink-0" />
                <span>Speaking prompts and answer key lists</span>
              </li>
            </ul>

            <button className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-lg cursor-pointer active:scale-98 transition-all">
              <span>Download Resources</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-[850px] mx-auto px-6 md:px-10">
        <p className="text-center text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-3">Got Questions?</p>
        <h2 className="text-center text-2xl md:text-3xl font-black text-slate-900 mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div 
                key={idx} 
                className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full text-left py-5 px-6 font-bold text-slate-800 flex items-center justify-between text-sm md:text-base cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-650' : ''}`} 
                  />
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
                      <div className="px-6 pb-5 text-xs md:text-sm text-slate-500 leading-relaxed font-semibold border-t border-slate-50 pt-3">
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

    </div>
  );
};

export default IELTSMasterclass;
