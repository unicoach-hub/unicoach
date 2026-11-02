import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Mic, MicOff, Sparkles, RotateCcw, CheckCircle2,
  AlertTriangle, ArrowRight, Bot, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

// Desi Pop look (same as the Course Finder search card): ink borders, hard shadows, mustard focus ring
const CARD = 'bg-white border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] p-4 sm:p-6';
const TEXTAREA = 'w-full px-3 py-2.5 text-[15px] leading-relaxed text-[#16130F] bg-white border-2 border-[#16130F] outline-none focus:ring-4 focus:ring-[#F2B705]/50 transition-shadow placeholder:text-[#8A8173]';
const PRIMARY_BTN = 'h-12 px-6 inline-flex items-center justify-center gap-2 text-white text-[15px] font-bold bg-[#16130F] border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer';

// Tap-to-pick pill: ink when on, white sticker when off
const Chip = ({ on, children, className = '', ...props }) => (
  <button
    type="button"
    aria-pressed={on}
    {...props}
    className={`inline-flex items-center gap-2 h-10 px-4 text-[14px] font-bold border-2 border-[#16130F] transition-transform hover:-translate-y-0.5 cursor-pointer ${on ? 'bg-[#16130F] text-white shadow-[3px_3px_0_#DE5C2B]' : 'bg-white text-[#16130F] shadow-[2px_2px_0_#16130F]'} ${className}`}
    style={{ borderRadius: 999 }}
  >
    {children}
  </button>
);

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
      {/* Setup card in the Desi Pop look: pick the visa route */}
      <div className={CARD} style={{ borderRadius: 20 }}>
        <p className="mb-4 font-urbanist text-[17px] font-extrabold text-[#16130F]">
          <span className="inline-grid place-items-center w-7 h-7 mr-2 rounded-lg bg-[#DE5C2B] text-white border-2 border-[#16130F] text-[14px]">1</span>Kaunsa visa chahiye?
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 lg:gap-6 items-start">
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-[14px] font-bold text-[#16130F]">Visa route</span>
            <div className="flex flex-wrap items-center gap-2.5">
              {[
                { key: 'USA', label: 'USA (F-1)', flag: 'https://flagcdn.com/w40/us.png' },
                { key: 'UK', label: 'UK (Student)', flag: 'https://flagcdn.com/w40/gb.png' },
                { key: 'Canada', label: 'Canada (SP)', flag: 'https://flagcdn.com/w40/ca.png' },
                { key: 'Germany', label: 'Germany (Visa)', flag: 'https://flagcdn.com/w40/de.png' },
                { key: 'Australia', label: 'Australia (500)', flag: 'https://flagcdn.com/w40/au.png' }
              ].map((item) => (
                <Chip
                  key={item.key}
                  on={selectedCountry === item.key}
                  onClick={() => {
                    setSelectedCountry(item.key);
                    handleRestart();
                  }}
                >
                  <img src={item.flag} alt="" className="w-5 h-3.5 rounded-xs object-cover border border-[#16130F]/30" />
                  <span>{item.label}</span>
                </Chip>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-[#FFF1B8] border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] min-w-0" style={{ borderRadius: 12 }}>
            <img src={countryConfig.flag} alt={selectedCountry} className="w-8 h-6 rounded-sm object-cover mt-0.5 flex-shrink-0 border border-[#16130F]/30" />
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-[#16130F] leading-snug">{countryConfig.countryName} ({countryConfig.visaType})</p>
              <p className="text-[14px] text-[#3D3830] leading-snug mt-0.5">{countryConfig.consularRule}</p>
            </div>
          </div>
        </div>
        <p className="mt-5 pt-4 border-t-2 border-dashed border-[#16130F]/20 flex items-center justify-center gap-2 text-[14px] font-medium text-[#3D3830] text-center">
          <Mic size={15} className="text-[#DE5C2B] shrink-0" />
          Answer each officer question by typing or with your mic, then get a score, red flags and a model answer.
        </p>
      </div>

      {/* Main Container */}
      <div className={CARD} style={{ borderRadius: 20 }}>
      <div id="visa-interview-workspace" className="space-y-8">

        {/* ======================================================== */}
        {/* INTERVIEW IN PROGRESS */}
        {/* ======================================================== */}
        {!interviewComplete && (
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-[14px] font-bold text-[#16130F]">
              <span>Question {currentQuestionIdx + 1} of {countryConfig.questions.length}</span>
              <div className="flex items-center gap-1.5">
                {countryConfig.questions.map((q, idx) => (
                  <span
                    key={q.id}
                    className={`w-3.5 h-3.5 rounded-full border-2 border-[#16130F] transition-all ${
                      idx === currentQuestionIdx
                        ? 'bg-[#DE5C2B] scale-125'
                        : idx < currentQuestionIdx
                        ? 'bg-[#14837E]'
                        : 'bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Consular Officer Question Card */}
            <div className="p-5 md:p-7 bg-[#16130F] border-[3px] border-[#16130F] shadow-[5px_5px_0_#DE5C2B] space-y-4" style={{ borderRadius: 20 }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#F2B705] border-2 border-[#16130F] flex items-center justify-center text-[#16130F]">
                  <Bot size={22} />
                </div>
                <div>
                  <span className="font-urbanist text-[13px] font-extrabold text-[#F2B705]">Senior Consular Visa Officer</span>
                  <h4 className="font-urbanist text-[17px] font-black text-white">Question #{currentQuestionIdx + 1}</h4>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-white border-2 border-[#16130F]" style={{ borderRadius: 14 }}>
                <p className="font-urbanist text-[18px] md:text-[21px] font-extrabold tracking-[-0.01em] text-[#16130F] leading-snug">
                  "{currentQuestion.text}"
                </p>
              </div>
            </div>

            {/* Student answer (mic or text) */}
            {!activeFeedback && (
              <form onSubmit={handleEvaluateAnswer} className="space-y-3">
                <label className="flex flex-col gap-1.5 min-w-0">
                  <span className="text-[14px] font-bold text-[#16130F]">Your answer *</span>
                  <textarea
                    rows={4}
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Speak into your microphone or type your answer clearly. Be direct, confident, and specific..."
                    className={TEXTAREA}
                    style={{ borderRadius: 10 }}
                  />
                  {evalError && <span className="text-[14px] font-semibold text-[#D0362E] leading-snug">{evalError}</span>}
                </label>

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                  <Chip on={isListening} onClick={toggleListening} className={`justify-center ${isListening ? 'animate-pulse' : ''}`}>
                    {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                    {isListening ? 'Stop recording' : 'Speak with mic'}
                  </Chip>
                  <button type="submit" disabled={!studentAnswer.trim() || evaluating} className={`${PRIMARY_BTN} w-full sm:w-auto`} style={{ borderRadius: 999 }}>
                    {evaluating ? (
                      <><RotateCcw size={16} className="animate-spin" /> Officer is evaluating…</>
                    ) : (
                      <><Sparkles size={16} /> Submit answer <ArrowRight size={16} /></>
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
                className="p-5 md:p-7 bg-[#FFF6E5] border-2 border-[#16130F] space-y-6"
                style={{ borderRadius: 20 }}
              >
                {/* Verdict Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F]" style={{ borderRadius: 16 }}>
                  <div className="space-y-1">
                    <span className="font-urbanist text-[14px] font-extrabold text-[#D0362E]">Officer ka faisla · Officer Verdict</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-urbanist text-[28px] md:text-[34px] font-black tracking-[-0.03em] text-[#16130F]">
                        {activeFeedback.score} / 10 Score
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[13px] font-black border-2 border-[#16130F] ${
                        activeFeedback.score >= 8
                          ? 'bg-[#14837E] text-white'
                          : activeFeedback.score >= 6
                          ? 'bg-[#F2B705] text-[#16130F]'
                          : 'bg-[#D0362E] text-white'
                      }`}>
                        {activeFeedback.verdict || activeFeedback.confidenceRating}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedNext}
                    className={`${PRIMARY_BTN} shrink-0`}
                    style={{ borderRadius: 999 }}
                  >
                    {currentQuestionIdx + 1 < countryConfig.questions.length ? 'Next Question ➔' : 'View Complete Report Card 📊'}
                  </button>
                </div>

                {/* Consular Critique */}
                <div className="space-y-2">
                  <h5 className="font-urbanist text-[17px] font-black text-[#16130F] flex items-center gap-1.5">
                    <ShieldCheck size={18} className="text-[#DE5C2B]" /> Consular Officer Assessment
                  </h5>
                  <p className="text-[15px] font-medium text-[#16130F] leading-relaxed bg-white p-4 border-2 border-[#16130F]" style={{ borderRadius: 12 }}>
                    {activeFeedback.consularCritique}
                  </p>
                </div>

                {/* Strengths & Red Flags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeFeedback.strengths && activeFeedback.strengths.length > 0 && (
                    <div className="p-4 bg-[#DDF3EF] border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] space-y-2" style={{ borderRadius: 14 }}>
                      <h6 className="font-urbanist text-[16px] font-black text-[#16130F] flex items-center gap-1.5">
                        <CheckCircle2 size={17} className="text-[#14837E]" /> Good Responses
                      </h6>
                      <ul className="space-y-1.5">
                        {activeFeedback.strengths.map((str, i) => (
                          <li key={i} className="text-[14px] font-semibold text-[#16130F] flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#14837E] border border-[#16130F] mt-1.5 flex-shrink-0" />
                            {str}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeFeedback.redFlagsOrRisks && activeFeedback.redFlagsOrRisks.length > 0 && (
                    <div className="p-4 bg-[#FCE3DA] border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] space-y-2" style={{ borderRadius: 14 }}>
                      <h6 className="font-urbanist text-[16px] font-black text-[#16130F] flex items-center gap-1.5">
                        <AlertTriangle size={17} className="text-[#D0362E]" /> Potential Visa Red Flags
                      </h6>
                      <ul className="space-y-1.5">
                        {activeFeedback.redFlagsOrRisks.map((rf, i) => (
                          <li key={i} className="text-[14px] font-semibold text-[#16130F] flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#D0362E] border border-[#16130F] mt-1.5 flex-shrink-0" />
                            {rf}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Model Answer */}
                {activeFeedback.modelAnswer && (
                  <div className="p-4 bg-[#FFF1B8] border-2 border-[#16130F] shadow-[3px_3px_0_#16130F] space-y-2" style={{ borderRadius: 14 }}>
                    <h6 className="font-urbanist text-[16px] font-black text-[#16130F] flex items-center gap-1.5">
                      <Sparkles size={17} className="text-[#DE5C2B]" /> Ideal High-Conviction Model Answer
                    </h6>
                    <p className="text-[15px] font-medium text-[#16130F] italic leading-relaxed bg-white p-3.5 border-2 border-[#16130F]" style={{ borderRadius: 10 }}>
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
            <div className="p-6 sm:p-8 bg-[#F2B705] border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderRadius: 20 }}>
              <div className="space-y-2 text-center md:text-left">
                <span className="font-urbanist text-[15px] font-extrabold text-[#16130F]/80">Final Interview Assessment</span>
                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                  <span className="font-urbanist text-[44px] md:text-[56px] leading-none font-black tracking-[-0.04em] text-[#16130F]">{avgScore} / 10</span>
                  <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold border-2 border-[#16130F] ${
                    avgScore >= 8
                      ? 'bg-[#14837E] text-white'
                      : 'bg-white text-[#16130F]'
                  }`}>
                    {avgScore >= 8 ? 'Strong answers — interview ready' : 'Moderate risk — more practice suggested'}
                  </span>
                </div>
                <p className="text-[14px] text-[#16130F]/80 font-semibold">
                  Completed all {countryConfig.questions.length} {selectedCountry} practice questions.
                </p>
              </div>

              <button
                onClick={handleRestart}
                className={`${PRIMARY_BTN} shrink-0`}
                style={{ borderRadius: 999 }}
              >
                <RotateCcw size={15} /> Retake Mock Interview
              </button>
            </div>

            {/* Question by Question Review */}
            <div className="space-y-4">
              <div>
                <p className="font-urbanist font-extrabold text-[15px] text-[#D0362E]">Poora interview, ek nazar mein</p>
                <h4 className="font-urbanist text-[22px] sm:text-[26px] font-black tracking-[-0.03em] leading-tight text-[#16130F] flex items-center gap-2">
                  <FileText size={20} className="text-[#DE5C2B]" /> Complete Question & Answer Transcript
                </h4>
              </div>

              {questionEvaluations.map((item, i) => (
                <div key={i} className="p-5 bg-white border-2 border-[#16130F] shadow-[4px_4px_0_#16130F] space-y-3" style={{ borderRadius: 16 }}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-urbanist text-[15px] font-black text-[#B8285B]">Question #{i+1}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[13px] font-black bg-[#F2B705] text-[#16130F] border-2 border-[#16130F]">
                      Score: {item.evaluation.score}/10
                    </span>
                  </div>
                  <p className="text-[15px] font-bold text-[#16130F]">"{item.question}"</p>
                  <div className="p-3 bg-[#FFF6E5] text-[14px] text-[#3D3830] font-medium border-2 border-[#16130F]/15" style={{ borderRadius: 10 }}>
                    <strong className="text-[#16130F]">Your Response:</strong> "{item.answer}"
                  </div>
                  <p className="text-[14px] text-[#3D3830] font-medium leading-relaxed">
                    💡 <strong className="text-[#16130F]">Officer Note:</strong> {item.evaluation.consularCritique}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
      </div>
    </div>
  );
};

export default AiVisaInterviewPrep;
