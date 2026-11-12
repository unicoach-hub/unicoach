import { useState, useEffect } from 'react';
import { Sparkles, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import IeltsAiEvaluationModal from '../components/IeltsAiEvaluationModal';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { StationSign, Sticker } from '../components/desi/DesiKit';

// Desi Pop field look (as in the Course Finder): white, 2px ink border, mustard focus ring
const TEXTAREA = 'w-full px-3.5 py-3 text-[15px] leading-relaxed text-[#16130F] bg-white border-2 border-[#16130F] outline-none focus:ring-4 focus:ring-[#F2B705]/50 transition-shadow placeholder:text-[#8A8175]';
const RADIUS = { borderRadius: 10 };

const STEPS = [
  { label: 'Pick a prompt', sub: '3 topics', bg: '#FFFFFF' },
  { label: 'Write', sub: '250+ words', bg: '#FFF1B8' },
  { label: 'Grade', sub: 'Free sign in', bg: '#DDF3EF' },
  { label: 'Band score', sub: 'With tips', bg: '#FBD9E6' },
];

const API_URL = API_BASE_URL;

const SAMPLE_PROMPTS = [
  {
    topic: 'Technology & Education',
    prompt: 'Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course of study is useful to an employer. Discuss both views and give your opinion.'
  },
  {
    topic: 'Environment & Climate',
    prompt: 'Some people believe that environmental problems are too big for individuals to solve and that only governments and large corporations can make a difference. To what extent do you agree or disagree?'
  },
  {
    topic: 'Globalization & Culture',
    prompt: 'As a result of globalization, cultures around the world are becoming more similar. Some people think this is a positive development, while others view it as a loss of cultural identity. Discuss both sides and give your opinion.'
  }
];

const IeltsEvaluatorPage = () => {
  const [selectedPrompt, setSelectedPrompt] = useState(SAMPLE_PROMPTS[0].prompt);
  const [customPrompt, setCustomPrompt] = useState('');
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'AI IELTS Essay & Band Score Evaluator | UniCoach';
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(sec => sec + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const { user, token, openLoginModal } = useAuth();

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  const executeEvaluation = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const activePromptText = customPrompt.trim() || selectedPrompt;
      // Session cookie is sent by installApiFetch; only forward a real bearer token from login
      const headers = { 'Content-Type': 'application/json' };
      if (token && token !== 'cookie-session') headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/ai/grade-ielts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: activePromptText,
          essay: essay.trim(),
          timeSpent: timerSeconds,
          wordCount
        })
      });

      const data = await res.json();
      if (res.ok && data.evaluation) {
        setEvaluation(data.evaluation);
        setIsModalOpen(true);
        setIsTimerRunning(false);
      } else {
        throw new Error(data.error || 'Evaluation service unavailable');
      }
    } catch (err) {
      // No estimated band on failure: a guessed score would mislead the student
      setErrorMsg(err.message && !/fetch/i.test(err.message) ? err.message : 'The AI examiner is busy right now. Please try again in a minute.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (e) => {
    if (e) e.preventDefault();
    if (!essay.trim() || wordCount < 50) {
      setErrorMsg('Please write at least 50 words before evaluating.');
      return;
    }

    if (!user && !token) {
      openLoginModal({
        title: 'Cambridge AI IELTS Essay Examiner',
        subtitle: 'Sign in free with Google or email to see your band (0–9) on the four IELTS criteria, with feedback on what to fix.',
        preventRedirect: true,
        onSuccess: () => {
          executeEvaluation();
        }
      });
      return;
    }

    executeEvaluation();
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activePrompt = customPrompt || selectedPrompt;

  return (
    <div className="min-h-screen pt-[76px] pb-20 font-['Onest',sans-serif] bg-[#FFF6E5] bg-[radial-gradient(circle,rgba(22,19,15,.06)_1.3px,transparent_1.7px)] [background-size:12px_12px]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center pt-6 sm:pt-8">
          <StationSign hi="Band score turant" en="IELTS ESSAY CHECKER" className="-rotate-2" />
          <h1 className="mt-5 font-urbanist text-[34px] sm:text-[50px] font-black tracking-[-0.045em] leading-[1.02] text-[#16130F]">
            Check your <span className="inline-block px-2.5 bg-[#F2B705] border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] -rotate-1" style={{ borderRadius: 10 }}>IELTS Task 2</span> essay
          </h1>
          <p className="mt-4 text-[16px] sm:text-[18px] font-medium text-[#3D3830] max-w-2xl mx-auto">
            Pick a prompt, write your essay, and get a band score (0–9) on all four official criteria with sentence-level tips.
          </p>
          <ol className="mt-6 flex flex-wrap justify-center gap-2.5" aria-label="Steps">
            {STEPS.map((step, i) => (
              <li key={step.label}>
                <Sticker bg={step.bg} tilt={i % 2 ? 1 : -1}>
                  <span className="grid place-items-center w-5 h-5 rounded-full bg-[#16130F] text-white text-[11px] font-black">{i + 1}</span>
                  {step.label} <span className="font-medium text-[#5B544A]">· {step.sub}</span>
                </Sticker>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-9 bg-white border-[3px] border-[#16130F] shadow-[7px_7px_0_#16130F] p-5 sm:p-6 space-y-6" style={{ borderRadius: 20 }}>
          {/* div, not a <label>: a <label> around several buttons would forward clicks to the first one */}
          <div className="flex flex-col gap-2">
            <p className="font-urbanist text-[17px] font-extrabold text-[#16130F]"><span className="inline-grid place-items-center w-7 h-7 mr-2 rounded-lg bg-[#DE5C2B] text-white border-2 border-[#16130F] text-[14px]">1</span>Topic chuno <span className="text-[14px] font-bold text-[#5B544A]">· Essay prompt *</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_PROMPTS.map((p, idx) => {
                const on = selectedPrompt === p.prompt && !customPrompt;
                return (
                  <button
                    key={idx}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setSelectedPrompt(p.prompt);
                      setCustomPrompt('');
                    }}
                    className={`no-shine p-3.5 text-left border-2 border-[#16130F] text-[14px] text-[#16130F] transition-transform hover:-translate-y-0.5 ${on ? 'bg-[#F2B705] shadow-[4px_4px_0_#16130F]' : 'bg-white'}`}
                    style={{ borderRadius: 12 }}
                  >
                    <span className="font-urbanist text-[15px] font-black block mb-1">Topic {idx + 1}: {p.topic}</span>
                    <span className={`line-clamp-2 leading-relaxed ${on ? 'text-[#16130F]' : 'text-[#5B544A]'}`}>{p.prompt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-[#FFF1B8] border-2 border-dashed border-[#16130F] text-[15px]" style={RADIUS}>
            <span className="font-urbanist font-black text-[#16130F] block mb-1">Active prompt</span>
            <p className="text-[#3D3830] leading-relaxed">{activePrompt}</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label htmlFor="ielts-essay" className="font-urbanist text-[17px] font-extrabold text-[#16130F]"><span className="inline-grid place-items-center w-7 h-7 mr-2 rounded-lg bg-[#14837E] text-white border-2 border-[#16130F] text-[14px]">2</span>Essay likho <span className="text-[14px] font-bold text-[#5B544A]">· Your essay *</span></label>
              <div className="flex items-center gap-2 text-[14px] font-bold flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full border-2 border-[#16130F] whitespace-nowrap ${wordCount >= 250 ? 'bg-[#14837E] text-white' : 'bg-[#F2B705] text-[#16130F]'}`}>
                  {wordCount} / 250+ words
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border-2 border-[#16130F] text-[#16130F] whitespace-nowrap">
                  <Clock size={14} /> {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>
            <textarea
              id="ielts-essay"
              rows={12}
              value={essay}
              onChange={(e) => {
                setEssay(e.target.value);
                if (!isTimerRunning && e.target.value.length > 0) setIsTimerRunning(true);
              }}
              placeholder="Start typing your essay here... Aim for at least 250 words with a structured Introduction, 2 Body Paragraphs, and a Conclusion."
              className={TEXTAREA}
              style={RADIUS}
            />
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-[#FCE3DA] border-2 border-[#D0362E] text-[14px] font-semibold text-[#16130F] flex items-center gap-2" style={RADIUS}>
              <AlertCircle size={17} className="flex-shrink-0 text-[#D0362E]" />
              {errorMsg}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <p className="text-[14px] text-[#5B544A]">Graded strictly on the official IELTS Task 2 band criteria.</p>
            <button
              type="button"
              onClick={handleEvaluate}
              disabled={loading || wordCount < 50}
              className="w-full sm:w-auto h-12 px-6 inline-flex items-center justify-center gap-2 text-white text-[15px] font-bold bg-[#16130F] border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:hover:translate-y-0 rounded-full"
            >
              {loading ? (
                <><RefreshCw size={16} className="animate-spin" /> Checking your essay...</>
              ) : (
                <><Sparkles size={16} /> Grade my essay</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Evaluation Results Modal */}
      <IeltsAiEvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        evaluation={evaluation}
        essayPrompt={activePrompt}
        studentEssay={essay}
        wordCount={wordCount}
        onPracticeAgain={() => {
          setIsModalOpen(false);
          setEssay('');
          setTimerSeconds(0);
          setIsTimerRunning(false);
        }}
      />
    </div>
  );
};

export default IeltsEvaluatorPage;
