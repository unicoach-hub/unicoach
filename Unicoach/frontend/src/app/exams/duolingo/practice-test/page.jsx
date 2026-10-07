import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Flame, Clock, Volume2, Check, ArrowRight, RotateCcw, Sparkles, BookOpen, Headphones, PenLine, MousePointerClick, Trophy, Loader2,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useLead } from '../../../../context/LeadContext';
import { API_BASE_URL } from '../../../../config';
import BackButton from '../../../../components/ui/BackButton';
import {
  PARAGRAPHS, LISTENING_SENTENCES, PHOTOS, makeWordRound, parseParagraph, wordAccuracy, estimateScore, sample,
} from './practiceData';

const TASKS = [
  { key: 'select', label: 'Read & Select', icon: MousePointerClick, minutes: '2 min' },
  { key: 'blanks', label: 'Fill in the Blanks', icon: BookOpen, minutes: '3 min' },
  { key: 'listen', label: 'Listen & Type', icon: Headphones, minutes: '2 min' },
  { key: 'photo', label: 'Write About the Photo', icon: PenLine, minutes: '1 min' },
];
const WORD_ROUNDS = 2;
const LISTEN_ITEMS = 3;

// Daily practice streak + best estimate, kept on this device only
const PROGRESS_KEY = 'unicoach_det_practice';
const localDay = (date) => date.toLocaleDateString('en-CA'); // YYYY-MM-DD in the student's time zone
const readProgress = () => {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  } catch {
    return {};
  }
};
const saveFinishedPractice = (estimate) => {
  const prev = readProgress();
  const today = localDay(new Date());
  const yesterday = localDay(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const streak = prev.lastDay === today ? (prev.streak || 1) : prev.lastDay === yesterday ? (prev.streak || 0) + 1 : 1;
  const next = { lastDay: today, streak, best: Math.max(prev.best || 0, estimate), attempts: (prev.attempts || 0) + 1 };
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  } catch {
    // Private mode / storage blocked: the streak just isn't remembered
  }
  return next;
};
// A streak only counts if the last practice was today or yesterday
const currentStreak = (progress) => {
  const today = localDay(new Date());
  const yesterday = localDay(new Date(Date.now() - 24 * 60 * 60 * 1000));
  return progress.lastDay === today || progress.lastDay === yesterday ? progress.streak || 0 : 0;
};

const useCountdown = (seconds, running) => {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (!running || left <= 0) return undefined;
    const timer = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [running, left]);
  return left;
};

const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const primaryBtn = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#111111] hover:bg-[#DE5C2B] text-white text-[14px] font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
const accentBtn = primaryBtn.replace('bg-[#111111] hover:bg-[#DE5C2B]', 'bg-[#DE5C2B] hover:bg-[#C2410C]');
const secondaryBtn = 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-[#DE5C2B] hover:text-[#DE5C2B] text-slate-700 text-[13px] font-bold transition-colors cursor-pointer';

const TaskHeader = ({ taskIndex, xp, secondsLeft, subtitle }) => {
  const task = TASKS[taskIndex];
  const Icon = task.icon;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 mb-4" aria-hidden="true">
        {TASKS.map((t, i) => (
          <span key={t.key} className={`h-2 flex-1 rounded-full ${i < taskIndex ? 'bg-emerald-500' : i === taskIndex ? 'bg-[#DE5C2B]' : 'bg-slate-200'}`} />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 text-[#DE5C2B] flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </span>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Task {taskIndex + 1} of {TASKS.length}</p>
            <h2 className="font-outfit text-xl sm:text-2xl font-black text-slate-900 leading-tight">{task.label}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {typeof secondsLeft === 'number' && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-bold ${secondsLeft <= 10 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-700'}`}>
              <Clock className="w-3.5 h-3.5" /> {formatTime(secondsLeft)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[13px] font-black">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {xp} XP
          </span>
        </div>
      </div>
      {subtitle && <p className="mt-3 text-[14px] text-slate-600">{subtitle}</p>}
    </div>
  );
};

// ── Task 1: Read & Select ──────────────────────────────────────────────────
const WordRound = ({ round, roundNumber, xp, onDone }) => {
  const [selected, setSelected] = useState(() => new Set());
  const [checked, setChecked] = useState(false);
  const left = useCountdown(60, !checked);
  const revealed = checked || left === 0;

  const realTotal = round.filter((w) => w.real).length;
  const correct = round.filter((w) => w.real && selected.has(w.word)).length;
  const wrong = round.filter((w) => !w.real && selected.has(w.word)).length;

  const toggle = (word) => {
    if (revealed) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word); else next.add(word);
      return next;
    });
  };

  return (
    <>
      <TaskHeader
        taskIndex={0}
        xp={xp + (revealed ? correct * 10 : 0)}
        secondsLeft={revealed ? undefined : left}
        subtitle={`Round ${roundNumber} of ${WORD_ROUNDS}: tap every word that is a real English word. Some words are made up.`}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {round.map(({ word, real }) => {
          const isOn = selected.has(word);
          let style = isOn ? 'bg-orange-50 border-[#DE5C2B] text-[#9A3412]' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300';
          if (revealed) {
            if (isOn && real) style = 'bg-emerald-50 border-emerald-400 text-emerald-800';
            else if (isOn && !real) style = 'bg-rose-50 border-rose-300 text-rose-700 line-through';
            else if (!isOn && real) style = 'bg-white border-dashed border-emerald-400 text-emerald-700';
            else style = 'bg-slate-50 border-slate-200 text-slate-400';
          }
          return (
            <button
              key={word}
              type="button"
              aria-pressed={isOn}
              disabled={revealed}
              onClick={() => toggle(word)}
              className={`px-3 py-3 rounded-2xl border-2 text-[15px] font-bold transition-colors ${revealed ? 'cursor-default' : 'cursor-pointer'} ${style}`}
            >
              {word}
            </button>
          );
        })}
      </div>

      {revealed ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] text-slate-700">
            <strong className="text-emerald-700">{correct} of {realTotal}</strong> real words found
            {wrong > 0 && <>, <strong className="text-rose-600">{wrong} made-up</strong> picked</>}.
            <span className="block text-[12px] text-slate-500 mt-0.5">Dashed green = real words you missed.</span>
          </p>
          <button type="button" className={primaryBtn} onClick={() => onDone({ score: Math.max(0, correct - wrong), total: realTotal, xp: correct * 10 })}>
            {roundNumber < WORD_ROUNDS ? 'Next round' : 'Continue'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="mt-6 flex justify-end">
          <button type="button" className={primaryBtn} onClick={() => setChecked(true)}>
            Check <Check className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};

const ReadSelectTask = ({ xp, onDone }) => {
  const [rounds] = useState(() => Array.from({ length: WORD_ROUNDS }, makeWordRound));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);

  const finishRound = (result) => {
    const next = [...results, result];
    if (index + 1 < WORD_ROUNDS) {
      setResults(next);
      setIndex(index + 1);
      return;
    }
    onDone({
      accuracy: next.reduce((sum, r) => sum + r.score, 0) / next.reduce((sum, r) => sum + r.total, 0),
      xp: next.reduce((sum, r) => sum + r.xp, 0),
    });
  };

  const roundXp = results.reduce((sum, r) => sum + r.xp, 0);
  return <WordRound key={index} round={rounds[index]} roundNumber={index + 1} xp={xp + roundXp} onDone={finishRound} />;
};

// ── Task 2: Fill in the Blanks ─────────────────────────────────────────────
const BlanksTask = ({ xp, onDone }) => {
  const [paragraph] = useState(() => sample(PARAGRAPHS, 1)[0]);
  const parts = useMemo(() => parseParagraph(paragraph.text), [paragraph]);
  const blanks = parts.filter((p) => p.type === 'blank');
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const left = useCountdown(180, !checked);
  const revealed = checked || left === 0;

  const isRight = (blank) => (answers[blank.key] || '').trim().toLowerCase() === blank.missing.toLowerCase();
  const correct = blanks.filter(isRight).length;

  return (
    <>
      <TaskHeader
        taskIndex={1}
        xp={xp + (revealed ? correct * 10 : 0)}
        secondsLeft={revealed ? undefined : left}
        subtitle="Type the missing letters to complete the words in the paragraph."
      />
      <div className="rounded-2xl bg-[#FAF9F6] border border-slate-200 p-5 sm:p-6 text-[16px] sm:text-[17px] leading-[2.4] text-slate-800">
        {parts.map((part) => {
          if (part.type === 'text') return <span key={part.key}>{part.value}</span>;
          const right = isRight(part);
          return (
            <span key={part.key} className="inline-flex items-baseline whitespace-nowrap">
              <span className="font-semibold">{part.prefix}</span>
              <input
                type="text"
                value={answers[part.key] || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [part.key]: e.target.value }))}
                disabled={revealed}
                maxLength={part.missing.length + 2}
                aria-label={`Complete the word starting with ${part.prefix}`}
                autoComplete="off"
                spellCheck={false}
                style={{ width: `${part.missing.length + 1.6}ch` }}
                className={`mx-0.5 px-1 py-0.5 rounded-md border-b-2 text-[16px] font-semibold outline-none bg-white ${
                  !revealed ? 'border-slate-300 focus:border-[#DE5C2B]' : right ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-rose-400 text-rose-700 bg-rose-50'
                }`}
              />
              {revealed && !right && (
                <span className="ml-1 text-[12px] font-bold text-emerald-700">{part.word}</span>
              )}
            </span>
          );
        })}
      </div>

      {revealed ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] text-slate-700"><strong className="text-emerald-700">{correct} of {blanks.length}</strong> words completed correctly.</p>
          <button type="button" className={primaryBtn} onClick={() => onDone({ accuracy: correct / blanks.length, xp: correct * 10 })}>
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="mt-6 flex justify-end">
          <button type="button" className={primaryBtn} onClick={() => setChecked(true)}>
            Check answers <Check className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};

// ── Task 3: Listen & Type ──────────────────────────────────────────────────
const MAX_PLAYS = 3;
const speak = (text) => {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  const voice = synth.getVoices().find((v) => /^en[-_](US|GB)/i.test(v.lang));
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
};

const ListenItem = ({ sentence, number, xp, onNext }) => {
  const [plays, setPlays] = useState(0);
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);
  const accuracy = wordAccuracy(sentence, typed);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const play = () => {
    if (plays >= MAX_PLAYS) return;
    speak(sentence);
    setPlays((p) => p + 1);
  };

  return (
    <>
      <TaskHeader
        taskIndex={2}
        xp={xp + (checked ? Math.round(accuracy * 10) : 0)}
        subtitle={`Sentence ${number} of ${LISTEN_ITEMS}: play the audio and type exactly what you hear. You can play it ${MAX_PLAYS} times.`}
      />
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button type="button" onClick={play} disabled={plays >= MAX_PLAYS || checked} className={accentBtn}>
          <Volume2 className="w-4 h-4" /> {plays === 0 ? 'Play audio' : 'Play again'}
        </button>
        <span className="text-[13px] font-semibold text-slate-500">{MAX_PLAYS - plays} {MAX_PLAYS - plays === 1 ? 'play' : 'plays'} left</span>
      </div>
      <input
        type="text"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        disabled={checked}
        placeholder="Type the sentence here…"
        aria-label="Type the sentence you heard"
        autoComplete="off"
        className="mt-4 w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-[#DE5C2B] outline-none text-[16px] font-semibold text-slate-800 bg-white"
      />
      {checked && (
        <div className={`mt-4 rounded-2xl border p-4 ${accuracy >= 0.8 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <p className="text-[13px] font-bold text-slate-800">{Math.round(accuracy * 100)}% of the words correct</p>
          <p className="text-[14px] text-slate-700 mt-1">Correct sentence: <strong>{sentence}</strong></p>
        </div>
      )}
      <div className="mt-6 flex justify-end">
        {checked ? (
          <button type="button" className={primaryBtn} onClick={() => onNext(accuracy)}>
            {number < LISTEN_ITEMS ? 'Next sentence' : 'Continue'} <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" className={primaryBtn} disabled={!typed.trim()} onClick={() => { window.speechSynthesis?.cancel(); setChecked(true); }}>
            Check <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </>
  );
};

const ListenTask = ({ xp, onDone }) => {
  const [sentences] = useState(() => sample(LISTENING_SENTENCES, LISTEN_ITEMS));
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState([]);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  if (!supported) {
    return (
      <>
        <TaskHeader taskIndex={2} xp={xp} />
        <p className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-[14px] text-amber-900">
          Your browser can&apos;t play the practice audio. Try Chrome or Edge, or skip this task.
        </p>
        <div className="mt-6 flex justify-end">
          <button type="button" className={primaryBtn} onClick={() => onDone({ skipped: true, xp: 0 })}>
            Skip task <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </>
    );
  }

  const next = (accuracy) => {
    const all = [...scores, accuracy];
    if (index + 1 < LISTEN_ITEMS) {
      setScores(all);
      setIndex(index + 1);
      return;
    }
    const total = all.reduce((sum, a) => sum + a, 0);
    onDone({ accuracy: total / all.length, xp: Math.round(total * 10) });
  };

  const earned = Math.round(scores.reduce((sum, a) => sum + a, 0) * 10);
  return <ListenItem key={index} sentence={sentences[index]} number={index + 1} xp={xp + earned} onNext={next} />;
};

// ── Task 4: Write About the Photo (AI feedback after sign-in) ──────────────
const PhotoTask = ({ xp, onDone }) => {
  const { user, token, openLoginModal } = useAuth() || {};
  const [photo] = useState(() => sample(PHOTOS, 1)[0]);
  const [text, setText] = useState('');
  const left = useCountdown(60, true);
  const timeUp = left === 0;
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const requestFeedback = async () => {
    setStatus('loading');
    setError('');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token && token !== 'cookie-session') headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/ai/evaluate-det-writing`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ photoDescription: photo.description, response: text.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.evaluation) throw new Error(data.error || 'AI feedback is not available right now. Please try again in a minute.');
      setEvaluation(data.evaluation);
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const askForFeedback = () => {
    if (!text.trim()) {
      setError('Write at least one sentence about the photo first.');
      return;
    }
    if (!user && !token && openLoginModal) {
      openLoginModal({
        title: 'Get your writing feedback',
        subtitle: 'Sign in free with Google or email to see your AI score and tips for this answer.',
        preventRedirect: true,
        onSuccess: () => requestFeedback(),
      });
      return;
    }
    requestFeedback();
  };

  const finish = () => onDone({
    writingScore: evaluation?.estimatedScore ?? null,
    xp: evaluation ? 30 : text.trim() ? 10 : 0,
  });

  return (
    <>
      <TaskHeader
        taskIndex={3}
        xp={xp}
        secondsLeft={timeUp ? undefined : left}
        subtitle="Write one or more sentences describing the photo. You have 1 minute; then get AI feedback on your answer."
      />
      <div className="grid md:grid-cols-2 gap-5">
        <img src={photo.src} alt="Describe this photo" className="w-full h-64 md:h-full max-h-[320px] object-cover rounded-2xl border border-slate-200" />
        <div className="flex flex-col">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            readOnly={timeUp || status === 'loading' || status === 'done'}
            rows={7}
            maxLength={1500}
            placeholder="In this photo, I can see…"
            aria-label="Your description of the photo"
            className="flex-1 w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#DE5C2B] outline-none text-[15px] text-slate-800 bg-white resize-none"
          />
          <div className="mt-2 flex items-center justify-between text-[12px] font-semibold text-slate-500">
            <span>{words} {words === 1 ? 'word' : 'words'}</span>
            {timeUp && <span className="text-rose-600">Time&apos;s up</span>}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-[13px] font-semibold text-rose-700">{error}</p>
      )}

      {status === 'done' && evaluation && (
        <div className="mt-5 rounded-2xl bg-[#FAF9F6] border border-slate-200 p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {evaluation.estimatedScore && (
              <span className="font-outfit text-3xl font-black text-slate-900">{evaluation.estimatedScore}<span className="text-base text-slate-400 font-bold"> / 160</span></span>
            )}
            {evaluation.level && <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[12px] font-bold text-[#C2410C]">{evaluation.level}</span>}
            <span className="text-[11px] font-semibold text-slate-400">AI practice estimate for this task</span>
          </div>
          {evaluation.strengths.length > 0 && (
            <div>
              <p className="text-[12px] font-black uppercase tracking-wider text-emerald-700">What went well</p>
              <ul className="mt-1 space-y-1">
                {evaluation.strengths.map((s) => <li key={s} className="flex gap-2 text-[14px] text-slate-700"><Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />{s}</li>)}
              </ul>
            </div>
          )}
          {evaluation.improvements.length > 0 && (
            <div>
              <p className="text-[12px] font-black uppercase tracking-wider text-[#C2410C]">To improve</p>
              <ul className="mt-1 space-y-1">
                {evaluation.improvements.map((s) => <li key={s} className="flex gap-2 text-[14px] text-slate-700"><ArrowRight className="w-4 h-4 text-[#DE5C2B] shrink-0 mt-0.5" />{s}</li>)}
              </ul>
            </div>
          )}
          {evaluation.improvedVersion && (
            <div className="rounded-xl bg-white border border-slate-200 p-3">
              <p className="text-[12px] font-black uppercase tracking-wider text-slate-500">A stronger answer</p>
              <p className="mt-1 text-[14px] text-slate-700 italic">{evaluation.improvedVersion}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        {status !== 'done' && (
          <button type="button" className={secondaryBtn} onClick={finish}>
            Skip feedback
          </button>
        )}
        {status === 'done' ? (
          <button type="button" className={primaryBtn} onClick={finish}>
            See my results <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" className={primaryBtn} disabled={status === 'loading' || !text.trim()} onClick={askForFeedback}>
            {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking your answer…</> : <><Sparkles className="w-4 h-4" /> Get AI feedback</>}
          </button>
        )}
      </div>
    </>
  );
};

// ── Results ────────────────────────────────────────────────────────────────
const ResultRow = ({ label, value, note }) => (
  <div>
    <div className="flex items-center justify-between text-[13px] font-semibold text-slate-700">
      <span>{label}</span>
      <span>{value === null ? note : `${Math.round(value * 100)}%`}</span>
    </div>
    <div className="mt-1.5 h-2.5 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full bg-[#DE5C2B]" style={{ width: `${value === null ? 0 : Math.round(value * 100)}%` }} />
    </div>
  </div>
);

const Results = ({ outcome, onRestart }) => {
  const { openEligibilityModal } = useLead() || {};
  const { results, estimate, xp, progress } = outcome;
  const low = Math.max(10, estimate - 10);
  const high = Math.min(160, estimate + 10);

  return (
    <div>
      <div className="text-center">
        <span className="inline-flex w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 items-center justify-center">
          <Trophy className="w-7 h-7" />
        </span>
        <h2 className="mt-3 font-outfit text-2xl sm:text-3xl font-black text-slate-900">Practice complete!</h2>
        <p className="mt-1 text-[14px] text-slate-600">Your practice estimate on the Duolingo English Test scale</p>
        <p className="mt-3 font-outfit text-5xl font-black text-[#DE5C2B]">{low}–{high}</p>
        <p className="mt-1 text-[12px] text-slate-400">out of 160 · an estimate from this short practice, not an official score</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[13px] font-black">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> +{xp} XP
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#C2410C] text-[13px] font-black">
            <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-500" /> {progress.streak}-day streak
          </span>
          {progress.best > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[13px] font-bold">
              Best so far: {progress.best}
            </span>
          )}
        </div>
      </div>

      <div className="mt-7 space-y-3.5">
        <ResultRow label="Read & Select" value={results.select.accuracy} />
        <ResultRow label="Fill in the Blanks" value={results.blanks.accuracy} />
        <ResultRow label="Listen & Type" value={results.listen.skipped ? null : results.listen.accuracy} note="Skipped" />
        <ResultRow
          label="Write About the Photo"
          value={results.photo.writingScore ? (results.photo.writingScore - 10) / 150 : null}
          note="No AI feedback"
        />
      </div>

      <div className="mt-7 rounded-2xl bg-[#FFF7F3] border border-orange-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-900">Want a plan to reach your target score?</p>
          <p className="text-[13px] text-slate-600 mt-0.5">Talk to a UniCoach counsellor for free about the test your universities accept.</p>
        </div>
        <button type="button" className={primaryBtn} onClick={() => openEligibilityModal?.('Duolingo Practice Test')}>
          Book free counselling <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" className={secondaryBtn} onClick={onRestart}>
          <RotateCcw className="w-4 h-4" /> Practice again (new questions)
        </button>
        <Link to="/exams/duolingo/syllabus" className={secondaryBtn}>About the real test</Link>
      </div>
      <p className="mt-4 text-center text-[12px] text-slate-500">Come back tomorrow to keep your streak going.</p>
    </div>
  );
};

// ── Intro ──────────────────────────────────────────────────────────────────
const Intro = ({ onStart }) => {
  const [progress] = useState(readProgress);
  const streak = currentStreak(progress);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-bold">Free · No sign-up to start</span>
        {streak > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#C2410C] text-[12px] font-black">
            <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-500" /> {streak}-day streak
          </span>
        )}
      </div>
      <h1 className="mt-4 font-outfit text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
        Free Duolingo English Test <span className="text-[#DE5C2B]">practice</span>
      </h1>
      <p className="mt-3 text-[15px] sm:text-[16px] text-slate-600 max-w-2xl leading-relaxed">
        Four short tasks in the same style as the real DET, about 8 minutes in all. Earn XP, keep a daily streak, and see a practice estimate of your score at the end.
      </p>
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {TASKS.map((task, i) => {
          const Icon = task.icon;
          return (
            <div key={task.key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <span className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-[#DE5C2B] flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></span>
              <div>
                <p className="text-[14px] font-bold text-slate-900">{i + 1}. {task.label}</p>
                <p className="text-[12px] text-slate-500">{task.minutes}{task.key === 'photo' ? ' · AI feedback after free sign-in' : ''}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button type="button" className={primaryBtn} onClick={onStart}>
          Start practice <ArrowRight className="w-4 h-4" />
        </button>
        {progress.best > 0 && <span className="text-[13px] font-semibold text-slate-500">Your best so far: {progress.best}</span>}
      </div>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────
const DuolingoPracticeTestPage = () => {
  const [stage, setStage] = useState('intro'); // intro | select | blanks | listen | photo | results
  const [attempt, setAttempt] = useState(0);
  const [results, setResults] = useState({});
  const [xp, setXp] = useState(0);
  const [outcome, setOutcome] = useState(null);

  useEffect(() => {
    document.title = 'Free Duolingo English Test Practice | UniCoach';
  }, []);

  useEffect(() => {
    if (stage !== 'intro') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stage]);

  const record = (key, result, nextStage) => {
    const all = { ...results, [key]: result };
    const totalXp = xp + (result.xp || 0);
    setResults(all);
    setXp(totalXp);
    if (nextStage !== 'results') {
      setStage(nextStage);
      return;
    }
    // Average of the tasks that produced a score; the AI writing score is mapped onto 0-1
    const parts = [all.select.accuracy, all.blanks.accuracy];
    if (!all.listen.skipped) parts.push(all.listen.accuracy);
    if (all.photo.writingScore) parts.push((all.photo.writingScore - 10) / 150);
    const estimate = estimateScore(parts.reduce((sum, p) => sum + p, 0) / parts.length);
    setOutcome({ results: all, estimate, xp: totalXp, progress: saveFinishedPractice(estimate) });
    setStage('results');
  };

  const restart = () => {
    setResults({});
    setXp(0);
    setOutcome(null);
    setAttempt((a) => a + 1);
    setStage('select');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-[88px] sm:pt-[100px] pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-4">
          <BackButton fallback="/exams/duolingo" />
        </div>
        <div className="bg-white border border-slate-200 rounded-[28px] p-5 sm:p-8 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.25)]">
          {stage === 'intro' && <Intro onStart={() => setStage('select')} />}
          {stage === 'select' && <ReadSelectTask key={`select-${attempt}`} xp={xp} onDone={(r) => record('select', r, 'blanks')} />}
          {stage === 'blanks' && <BlanksTask key={`blanks-${attempt}`} xp={xp} onDone={(r) => record('blanks', r, 'listen')} />}
          {stage === 'listen' && <ListenTask key={`listen-${attempt}`} xp={xp} onDone={(r) => record('listen', r, 'photo')} />}
          {stage === 'photo' && <PhotoTask key={`photo-${attempt}`} xp={xp} onDone={(r) => record('photo', r, 'results')} />}
          {stage === 'results' && outcome && <Results outcome={outcome} onRestart={restart} />}
        </div>
        <p className="mt-4 text-center text-[11px] text-slate-400">
          UniCoach practice material. Not affiliated with or endorsed by Duolingo. &ldquo;Duolingo English Test&rdquo; is a trademark of Duolingo, Inc.
        </p>
      </div>
    </div>
  );
};

export default DuolingoPracticeTestPage;
