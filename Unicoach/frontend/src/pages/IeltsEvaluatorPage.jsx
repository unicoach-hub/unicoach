import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import IeltsAiEvaluationModal from '../components/IeltsAiEvaluationModal';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { FinderPage, FinderHero, FinderCard, FinderButton, FINDER_TEXTAREA, FIELD_RADIUS } from '../components/ui/FinderForm';

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
        subtitle: 'Sign in free with Google or email to unlock official Cambridge Band 0–9 criteria scoring and detailed lexical feedback.',
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
    <FinderPage>
      <FinderHero
        eyebrow="IELTS Essay Examiner"
        title="Check your IELTS Task 2 essay"
        subtitle="Pick a prompt, write your essay, and get a band score (0–9) on all four official criteria with sentence-level tips."
        steps={[
          { label: 'Pick a prompt', sub: '3 topics' },
          { label: 'Write', sub: '250+ words' },
          { label: 'Grade', sub: 'Free sign in' },
          { label: 'Band score', sub: 'With tips' },
        ]}
        active={0}
      />

      <FinderCard className="mt-8 space-y-5">
        {/* div, not FinderField: a <label> around several buttons would forward clicks to the first one */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold text-[#16130F]">Essay prompt *</span>
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
                  className={`p-3.5 text-left border transition-colors text-[13px] ${on ? 'bg-[#16130F] border-[#16130F] text-white' : 'bg-[#F8F5EF] border-[#E6E0D4] text-[#5B544A] hover:border-[#16130F]'}`}
                  style={FIELD_RADIUS}
                >
                  <span className={`text-[12px] font-semibold block mb-1 ${on ? 'text-white' : 'text-[#16130F]'}`}>Topic {idx + 1}: {p.topic}</span>
                  <span className="line-clamp-2 leading-relaxed">{p.prompt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-[#F8F5EF] border border-[#E6E0D4] text-[13px]" style={FIELD_RADIUS}>
          <span className="font-semibold text-[#16130F] block mb-1">Active prompt</span>
          <p className="text-[#5B544A] leading-relaxed">{activePrompt}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label htmlFor="ielts-essay" className="text-[12.5px] font-semibold text-[#16130F]">Your essay *</label>
            <div className="flex items-center gap-2 text-[12px] font-semibold flex-shrink-0">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full border whitespace-nowrap ${wordCount >= 250 ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'}`}>
                {wordCount} / 250+ words
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E6E0D4] text-[#5B544A] whitespace-nowrap">
                <Clock size={13} /> {formatTimer(timerSeconds)}
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
            className={FINDER_TEXTAREA}
            style={FIELD_RADIUS}
          />
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-[#FBF2EF] border border-[#C97C6A] text-[13px] font-medium text-[#984D3D] flex items-center gap-2" style={FIELD_RADIUS}>
            <AlertCircle size={16} className="flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12.5px] text-[#5B544A]">Graded strictly on the official IELTS Task 2 band criteria.</p>
          <FinderButton onClick={handleEvaluate} disabled={loading || wordCount < 50} className="w-full sm:w-auto">
            {loading ? (
              <><RefreshCw size={16} className="animate-spin" /> Evaluating with AI Examiner...</>
            ) : (
              <><Sparkles size={16} /> Grade my essay</>
            )}
          </FinderButton>
        </div>
      </FinderCard>

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
    </FinderPage>
  );
};

export default IeltsEvaluatorPage;
