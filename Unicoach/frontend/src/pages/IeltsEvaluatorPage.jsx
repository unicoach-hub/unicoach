import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Award, BookOpen, Layers, CheckCircle2, Clock, 
  Send, RefreshCw, AlertCircle, FileText, Check, Copy, HelpCircle 
} from 'lucide-react';
import IeltsAiEvaluationModal from '../components/IeltsAiEvaluationModal';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { HeroBackButton } from '../components/ui/BackButton';
import { DesiSticker, MemeLine } from '../components/desi/Desi';

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

  return (
    <div className="min-h-screen bg-[#F6F3EC] pt-[76px] pb-20">
      {/* Clean LeapScholar-Style Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-[#F6F3EC] border-b border-[#E6E0D4] overflow-hidden">
        <HeroBackButton />
        

        <div className="max-w-4xl mx-auto relative z-10 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white text-[#DE5C2B] border border-orange-200/80 shadow-xs">
            <Award size={14} className="text-[#DE5C2B]" />
            <span>Cambridge / IDP Criteria Band Score Predictor</span>
          </div>

          <h1 className="font-outfit text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-[#0F172A] leading-tight">
            IELTS Writing Task 2{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DE5C2B] to-[#C04A1D]">AI Examiner</span>
          </h1>
          <MemeLine>Band 7 बिना लिखे? सपना है भाई. Pehle essay check karo ✍️</MemeLine>

          <p className="text-[14px] sm:text-[15.5px] text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Get instant official band scores (0–9) across Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range with detailed sentence-level recommendations.
          </p>
        </div>
      </section>

      {/* Main Simulator Workspace */}
      <main className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-20">
        <div className="bg-white rounded-[28px] p-6 md:p-8 border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] space-y-6">
          {/* Prompt Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              1. Select Essay Prompt or Enter Custom Topic
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPrompt(p.prompt);
                    setCustomPrompt('');
                  }}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer text-xs ${
                    selectedPrompt === p.prompt && !customPrompt
                      ? 'bg-indigo-50/70 border-indigo-500 text-indigo-950 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-200'
                  }`}
                >
                  <span className="text-[10px] font-black text-indigo-600 block mb-1">Topic {idx + 1}: {p.topic}</span>
                  <p className="line-clamp-2 leading-relaxed">{p.prompt}</p>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950">
              <span className="font-black block mb-1">Active Essay Prompt:</span>
              <p className="font-semibold text-slate-700 leading-relaxed">
                {customPrompt || selectedPrompt}
              </p>
            </div>
          </div>

          {/* Writing Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                2. Write or Paste Your Essay
              </label>

              <div className="flex items-center gap-2.5 text-xs font-bold flex-shrink-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full border whitespace-nowrap text-xs font-bold transition-all shadow-2xs ${
                  wordCount >= 250 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {wordCount} / 250+ Words
                </span>

                <span className="text-slate-600 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 whitespace-nowrap text-xs font-bold">
                  <Clock size={13} className="text-slate-500" /> {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>

            <textarea
              rows={12}
              value={essay}
              onChange={(e) => {
                setEssay(e.target.value);
                if (!isTimerRunning && e.target.value.length > 0) setIsTimerRunning(true);
              }}
              placeholder="Start typing your essay here... Aim for at least 250 words with a structured Introduction, 2 Body Paragraphs, and a Conclusion."
              className="w-full p-4 rounded-2xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-normal"
            />
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-400 font-semibold">
              Evaluated strictly on IELTS Task 2 official band scoring criteria.
            </p>

            <button
              onClick={handleEvaluate}
              disabled={loading || wordCount < 50}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Evaluating with AI Examiner...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-amber-400" /> Grade My Essay & Predict Band Score
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* AI Evaluation Results Modal */}
      <IeltsAiEvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        evaluation={evaluation}
        essayPrompt={customPrompt || selectedPrompt}
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
