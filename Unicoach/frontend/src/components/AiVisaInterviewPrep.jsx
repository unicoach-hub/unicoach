import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Award, Mic, MicOff, Send, Sparkles, 
  RotateCcw, CheckCircle2, AlertTriangle, ArrowRight, 
  Globe, Volume2, User, Bot, HelpCircle, FileText, Check, Copy
} from 'lucide-react';
import PremiumDropdown from './PremiumDropdown';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

const VISA_QUESTION_SETS = {
  USA: {
    countryName: 'United States',
    flag: 'https://flagcdn.com/w40/us.png',
    visaType: 'F-1 Academic Student Visa',
    consularRule: 'Section 214(b) Non-Immigrant Intent & Funding Verification',
    questions: [
      { id: 1, text: 'Why did you choose this specific university in the United States instead of completing this degree in India?' },
      { id: 2, text: 'How will you finance your tuition and annual living expenses of around $40,000 to $55,000?' },
      { id: 3, text: 'What are your exact career plans immediately following the completion of your degree?' },
      { id: 4, text: 'Do you have any immediate family or relatives currently living in the United States?' },
      { id: 5, text: 'Why this particular major/field, and what specific subjects or research labs attract you to it?' }
    ]
  },
  UK: {
    countryName: 'United Kingdom',
    flag: 'https://flagcdn.com/w40/gb.png',
    visaType: 'UK Student Route Visa',
    consularRule: 'Credibility Interview & Academic Progression Compliance',
    questions: [
      { id: 1, text: 'Can you explain why you selected this UK university and what research you did on other institutions?' },
      { id: 2, text: 'How does this degree provide direct academic progression from your previous undergraduate studies?' },
      { id: 3, text: 'What is the total cost of your course tuition and where will you be staying in the UK?' },
      { id: 4, text: 'What career opportunities do you anticipate returning to in your home country after graduating?' }
    ]
  },
  Canada: {
    countryName: 'Canada',
    flag: 'https://flagcdn.com/w40/ca.png',
    visaType: 'Canada Study Permit',
    consularRule: 'Dual Intent & Financial Capability Compliance',
    questions: [
      { id: 1, text: 'Why have you chosen to study this specific program in Canada over your home country?' },
      { id: 2, text: 'Who is sponsoring your education and what proof of funds (GIC + liquid assets) have you prepared?' },
      { id: 3, text: 'How will this Canadian credential improve your employability and salary potential upon return home?' }
    ]
  },
  Germany: {
    countryName: 'Germany',
    flag: 'https://flagcdn.com/w40/de.png',
    visaType: 'German National Student Visa (Visum zu Studienzwecken)',
    consularRule: 'Blocked Account (Sperrkonto) & Academic Motivation Assessment',
    questions: [
      { id: 1, text: 'Why did you choose Germany for your higher education and what do you know about the German higher education system?' },
      { id: 2, text: 'Have you funded your official Sperrkonto (Blocked Account) and what is your plan for subsequent semester expenses?' },
      { id: 3, text: 'Is your curriculum taught in English or German, and what language preparation have you done?' }
    ]
  },
  Australia: {
    countryName: 'Australia',
    flag: 'https://flagcdn.com/w40/au.png',
    visaType: 'Australia Subclass 500 Student Visa',
    consularRule: 'Genuine Student (GS) Assessment & Economic Ties',
    questions: [
      { id: 1, text: 'Why did you choose Australia and this specific education provider over providers in your home country?' },
      { id: 2, text: 'How will this qualification add value to your future employment prospects and earnings in your home country?' },
      { id: 3, text: 'What are your living arrangements in Australia and how will you cover living costs in cities like Sydney/Melbourne?' }
    ]
  }
};

const AiVisaInterviewPrep = ({ studentProfile = {} }) => {
  const { user, token, openLoginModal } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState(studentProfile.dreamCountry || 'USA');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [questionEvaluations, setQuestionEvaluations] = useState([]);
  const [activeFeedback, setActiveFeedback] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [evalError, setEvalError] = useState('');
  const recognitionRef = useRef(null);
  
  // Interactive Banner Mouse Tracking
  const [bannerMousePos, setBannerMousePos] = useState({ x: -1000, y: -1000 });
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const bannerRef = useRef(null);

  const handleBannerMouseMove = (e) => {
    if (!bannerRef.current) return;
    const rect = bannerRef.current.getBoundingClientRect();
    setBannerMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsBannerHovered(true);
  };

  const countryConfig = VISA_QUESTION_SETS[selectedCountry] || VISA_QUESTION_SETS.USA;
  const currentQuestion = countryConfig.questions[currentQuestionIdx];

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setStudentAnswer(prev => prev + ' ' + transcript);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your answer below.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEvaluateAnswer = async (e) => {
    if (e) e.preventDefault();
    if (!studentAnswer.trim()) {
      alert('Please provide your answer by speaking or typing.');
      return;
    }

    if (!user && !token) {
      if (openLoginModal) {
        openLoginModal({
          title: 'AI Mock Visa Officer Simulator',
          subtitle: 'Sign in free with Google or email to evaluate consular responses with real-time feedback & 214(b) risk scoring',
          preventRedirect: true,
          onSuccess: () => {
            executeVisaEvaluation();
          }
        });
        return;
      }
    }

    executeVisaEvaluation();
  };

  const executeVisaEvaluation = async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setEvaluating(true);
    setEvalError('');

    try {
      // Auth = HttpOnly session cookie (sent by installApiFetch); no bearer token in storage
      const headers = { 'Content-Type': 'application/json' };

      const res = await fetch(`${API_URL}/ai/evaluate-visa`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          country: selectedCountry,
          visaType: countryConfig.visaType,
          question: currentQuestion.text,
          studentAnswer: studentAnswer.trim(),
          studentProfile
        })
      });

      const data = await res.json();
      if (res.ok && data.evaluation) {
        const evalItem = {
          question: currentQuestion.text,
          answer: studentAnswer.trim(),
          evaluation: data.evaluation,
          timestamp: new Date().toISOString(),
          country: selectedCountry
        };

        const updatedEvals = [...questionEvaluations, evalItem];
        setQuestionEvaluations(updatedEvals);
        setActiveFeedback(data.evaluation);
        try {
          const hist = JSON.parse(localStorage.getItem('unicoach_visa_history') || '[]');
          localStorage.setItem('unicoach_visa_history', JSON.stringify([evalItem, ...hist.slice(0, 19)]));
        } catch (e) {}

        if (currentQuestionIdx + 1 >= countryConfig.questions.length) {
          setInterviewComplete(true);
        }
      } else {
        throw new Error(data.error || 'Evaluation failed');
      }
    } catch {
      // Never invent a verdict when the evaluator can't be reached; keep the answer so the student can retry
      setEvalError('We couldn’t evaluate this answer right now. Your answer is still here, please try again in a minute.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleProceedNext = () => {
    setActiveFeedback(null);
    setStudentAnswer('');
    if (currentQuestionIdx + 1 < countryConfig.questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setEvalError('');
    setCurrentQuestionIdx(0);
    setStudentAnswer('');
    setQuestionEvaluations([]);
    setActiveFeedback(null);
    setInterviewComplete(false);
  };

  // Calculate aggregate score
  const avgScore = questionEvaluations.length > 0
    ? Math.round((questionEvaluations.reduce((acc, curr) => acc + (curr.evaluation.score || 7), 0) / questionEvaluations.length) * 10) / 10
    : 8;

  return (
    <div className="space-y-8">
      {/* Top Banner - AI Visa Interview Studio */}
      <div
        ref={bannerRef}
        onMouseMove={handleBannerMouseMove}
        onMouseEnter={() => setIsBannerHovered(true)}
        onMouseLeave={() => {
          setIsBannerHovered(false);
          setBannerMousePos({ x: -1000, y: -1000 });
        }}
        className="group relative p-6 sm:p-8 md:p-9 rounded-[28px] bg-white border border-slate-200 hover:border-orange-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_40px_-22px_rgba(15,23,42,0.18)] transition-colors duration-300 overflow-hidden"
      >
        {/* Soft warm glow that follows the cursor */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isBannerHovered ? 1 : 0,
            background: `radial-gradient(520px circle at ${bannerMousePos.x}px ${bannerMousePos.y}px, rgba(222, 92, 43, 0.07) 0%, transparent 70%)`
          }}
        />

        {/* Warm corner wash */}
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] bg-[#FFE3D1]/45 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

          {/* Left Column: Heading, Badges, and Country Quick Selectors */}
          <div className="space-y-4 max-w-2xl">
            {/* Top Status Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-50 text-[#C2410C] border border-orange-200/80">
                <ShieldCheck size={14} className="text-[#DE5C2B]" /> AI Visa Officer Simulator
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Station Online</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-tight">
                AI Mock Visa Interview <span className="text-[#DE5C2B]">Studio</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Practice high-stakes student visa interview questions with instant consular feedback, Section 214(b) risk detection, and model answers.
              </p>
            </div>

            {/* Interactive Destination Selector Chips */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <Globe size={13} className="text-[#DE5C2B]" />
                <span>Select Target Embassy Route:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'USA', label: 'USA (F-1)', flag: 'https://flagcdn.com/w40/us.png' },
                  { key: 'UK', label: 'UK (Student)', flag: 'https://flagcdn.com/w40/gb.png' },
                  { key: 'Canada', label: 'Canada (SP)', flag: 'https://flagcdn.com/w40/ca.png' },
                  { key: 'Germany', label: 'Germany (Visa)', flag: 'https://flagcdn.com/w40/de.png' },
                  { key: 'Australia', label: 'Australia (500)', flag: 'https://flagcdn.com/w40/au.png' }
                ].map((item) => {
                  const isActive = selectedCountry === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setSelectedCountry(item.key);
                        handleRestart();
                      }}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold border transition-colors duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <img src={item.flag} alt="" className="w-4 h-3 rounded-xs object-cover" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Interview setup panel */}
          <div className="w-full lg:w-auto flex-shrink-0">
            <div className="bg-[#FAF9F6] border border-slate-200 rounded-2xl p-5 space-y-4 lg:min-w-[300px]">

              {/* Header inside panel */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide">Consular Telemetry</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                  {countryConfig.visaType.split(' ')[0]} Active
                </span>
              </div>

              {/* Animated Audio Equalizer Visualizer */}
              <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Volume2 size={12} className="text-[#DE5C2B]" /> Voice & Speech Engine
                  </span>
                  <span className="text-emerald-600 text-[10px] font-bold">READY</span>
                </div>

                <div className="flex items-end justify-between gap-1 h-7 pt-1">
                  {[35, 65, 90, 50, 80, 100, 45, 85, 60, 95, 40, 75, 55].map((val, idx) => (
                    <motion.div
                      key={idx}
                      animate={{
                        height: isBannerHovered
                          ? [`${val * 0.3}%`, `${val}%`, `${val * 0.45}%`]
                          : [`${val * 0.25}%`, `${val * 0.6}%`, `${val * 0.25}%`]
                      }}
                      transition={{
                        duration: 0.9 + (idx % 4) * 0.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: idx * 0.06
                      }}
                      className="w-1 bg-[#DE5C2B]/75 rounded-full"
                    />
                  ))}
                </div>
              </div>

              {/* Consular Key Parameters */}
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Section 214(b)</div>
                  <div className="text-xs font-black text-emerald-600 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Armed & Active
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Consular Standard</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5 flex items-center gap-1">
                    <Award size={12} className="text-[#DE5C2B]" /> {selectedCountry} Embassy
                  </div>
                </div>
              </div>

              {/* Quick Start Button */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('visa-interview-workspace');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-4 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Mic size={14} />
                <span>Begin Consular Drill</span>
                <ArrowRight size={13} className="text-white/80" />
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div id="visa-interview-workspace" className="bg-white border border-slate-200/80 rounded-[32px] shadow-sm p-6 md:p-8 space-y-8">
        
        {/* Country Selector Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Target Visa Destination</span>
            <div className="flex items-center gap-2">
              <img src={countryConfig.flag} alt={selectedCountry} className="w-7 h-5 rounded-sm object-cover shadow-sm" />
              <h3 className="text-base font-black text-slate-900">{countryConfig.countryName} ({countryConfig.visaType})</h3>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">⚖️ {countryConfig.consularRule}</p>
          </div>

          {!interviewComplete && (
            <div className="w-full sm:w-64">
              <PremiumDropdown
                value={selectedCountry}
                onChange={(val) => {
                  setSelectedCountry(val);
                  handleRestart();
                }}
                accent="orange"
                options={[
                  { value: 'USA', label: 'USA (F-1 Visa)', icon: <img src="https://flagcdn.com/w40/us.png" alt="US" className="w-6 h-4 rounded-sm object-cover" /> },
                  { value: 'UK', label: 'UK (Student Route)', icon: <img src="https://flagcdn.com/w40/gb.png" alt="UK" className="w-6 h-4 rounded-sm object-cover" /> },
                  { value: 'Canada', label: 'Canada (Study Permit)', icon: <img src="https://flagcdn.com/w40/ca.png" alt="CA" className="w-6 h-4 rounded-sm object-cover" /> },
                  { value: 'Germany', label: 'Germany (National Visa)', icon: <img src="https://flagcdn.com/w40/de.png" alt="DE" className="w-6 h-4 rounded-sm object-cover" /> },
                  { value: 'Australia', label: 'Australia (Subclass 500)', icon: <img src="https://flagcdn.com/w40/au.png" alt="AU" className="w-6 h-4 rounded-sm object-cover" /> }
                ]}
              />
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* INTERVIEW IN PROGRESS */}
        {/* ======================================================== */}
        {!interviewComplete && (
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Question {currentQuestionIdx + 1} of {countryConfig.questions.length}</span>
              <div className="flex items-center gap-1.5">
                {countryConfig.questions.map((q, idx) => (
                  <span
                    key={q.id}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentQuestionIdx
                        ? 'bg-[#DE5C2B] ring-4 ring-orange-100'
                        : idx < currentQuestionIdx
                        ? 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Consular Officer Question Card */}
            <div className="p-6 md:p-7 rounded-3xl bg-[#FFF7F3] border border-orange-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-orange-200 flex items-center justify-center text-[#DE5C2B]">
                  <Bot size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#C2410C]">Senior Consular Visa Officer</span>
                  <h4 className="text-sm font-black text-slate-900">Question #{currentQuestionIdx + 1}</h4>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-orange-100">
                <p className="text-base md:text-lg font-bold text-slate-900 leading-relaxed">
                  "{currentQuestion.text}"
                </p>
              </div>
            </div>

            {/* Student Answer Input Box (Mic + Text) */}
            {!activeFeedback && (
              <form onSubmit={handleEvaluateAnswer} className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={15} className="text-[#DE5C2B]" /> Your Spoken / Written Response:
                  </label>
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isListening
                        ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-[#DE5C2B] hover:text-[#DE5C2B]'
                    }`}
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                    {isListening ? 'Stop Recording' : 'Speak with Mic'}
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Speak into your microphone or type your answer clearly. Be direct, confident, and specific..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#DE5C2B] focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all leading-relaxed"
                />

                {evalError && (
                  <p role="alert" className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                    {evalError}
                  </p>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="submit"
                    disabled={!studentAnswer.trim() || evaluating}
                    className="px-6 py-3 bg-[#111111] hover:bg-black text-white rounded-full text-xs md:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {evaluating ? (
                      <>
                        <RotateCcw size={16} className="animate-spin" /> Consular Officer is Evaluating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> Submit Answer for AI Critique <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Instant Feedback Card for Current Answer */}
            {activeFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 md:p-7 rounded-3xl bg-slate-50 border border-slate-200 space-y-6"
              >
                {/* Verdict Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Officer Verdict</span>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl md:text-3xl font-black text-slate-900">
                        {activeFeedback.score} / 10 Score
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                        activeFeedback.score >= 8
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : activeFeedback.score >= 6
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {activeFeedback.verdict || activeFeedback.confidenceRating}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedNext}
                    className="px-6 py-3 bg-[#111111] hover:bg-black text-white rounded-full text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {currentQuestionIdx + 1 < countryConfig.questions.length ? 'Next Question ➔' : 'View Complete Report Card 📊'}
                  </button>
                </div>

                {/* Consular Critique */}
                <div className="space-y-2">
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-[#DE5C2B]" /> Consular Officer Assessment
                  </h5>
                  <p className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                    {activeFeedback.consularCritique}
                  </p>
                </div>

                {/* Strengths & Red Flags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeFeedback.strengths && activeFeedback.strengths.length > 0 && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1.5">
                      <h6 className="text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-emerald-600" /> Good Responses
                      </h6>
                      <ul className="space-y-1">
                        {activeFeedback.strengths.map((str, i) => (
                          <li key={i} className="text-xs font-semibold text-emerald-950 flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                            {str}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeFeedback.redFlagsOrRisks && activeFeedback.redFlagsOrRisks.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 space-y-1.5">
                      <h6 className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle size={14} className="text-amber-600" /> Potential Visa Red Flags
                      </h6>
                      <ul className="space-y-1">
                        {activeFeedback.redFlagsOrRisks.map((rf, i) => (
                          <li key={i} className="text-xs font-semibold text-amber-950 flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                            {rf}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Model Answer */}
                {activeFeedback.modelAnswer && (
                  <div className="p-4 rounded-xl bg-[#FFF7F3] border border-orange-100 space-y-1.5">
                    <h6 className="text-[11px] font-black text-[#9A3412] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#DE5C2B]" /> Ideal High-Conviction Model Answer
                    </h6>
                    <p className="text-xs font-medium text-slate-800 italic leading-relaxed bg-white p-3 rounded-lg border border-orange-100">
                      "{activeFeedback.modelAnswer}"
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* INTERVIEW COMPLETED REPORT CARD */}
        {/* ======================================================== */}
        {interviewComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Overall Score Card */}
            <div className="p-8 rounded-3xl bg-[#FAF9F6] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Final Interview Assessment</span>
                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                  <span className="text-4xl md:text-5xl font-black text-slate-900">{avgScore} / 10</span>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                    avgScore >= 8
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {avgScore >= 8 ? 'Strong answers — interview ready' : 'Moderate risk — more practice suggested'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Completed all {countryConfig.questions.length} {selectedCountry} practice questions.
                </p>
              </div>

              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-[#111111] hover:bg-black text-white rounded-full text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw size={15} /> Retake Mock Interview
              </button>
            </div>

            {/* Question by Question Review */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-[#DE5C2B]" /> Complete Question & Answer Transcript
              </h4>

              {questionEvaluations.map((item, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#C2410C] uppercase tracking-wider">Question #{i+1}</span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-white text-slate-800 border border-slate-200">
                      Score: {item.evaluation.score}/10
                    </span>
                  </div>
                  <p className="text-xs font-black text-slate-800">"{item.question}"</p>
                  <div className="p-3 bg-white rounded-xl text-xs text-slate-600 font-medium border border-slate-100">
                    <strong>Your Response:</strong> "{item.answer}"
                  </div>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    💡 <strong>Officer Note:</strong> {item.evaluation.consularCritique}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AiVisaInterviewPrep;
