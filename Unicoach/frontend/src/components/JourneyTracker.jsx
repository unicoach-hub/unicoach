import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

// The student's journey (set by the UniCoach team) in four phases:
// Registration → Documents → Application → Visa, with every step inside each phase
const JourneyTracker = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    const headers = token && token !== 'cookie-session' ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API_BASE_URL}/student/profile`, { credentials: 'include', headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setData(d))
      .catch(() => {});
    return () => { alive = false; };
  }, [token]);

  if (!data?.stages?.length || !data?.phases?.length) return null;
  const { stages, phases, profile } = data;
  const current = stages.find((s) => s.key === profile.journeyStage) || stages[0];
  const currentPhase = phases.findIndex((p) => p.key === current.phase);
  const bad = current.outcome === 'bad';

  // Every step a student can go through, per phase. "Rejected" steps only show when they happened.
  const reachedKeys = new Set([...(profile.stageHistory || []).map((h) => h.stage), 'registered']);
  const stepsOf = (phaseKey) => stages.filter((st) => st.phase === phaseKey && (st.outcome !== 'bad' || st.key === current.key || reachedKeys.has(st.key)));

  return (
    <div className="bg-white border border-slate-100 rounded-[28px] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-5">
        <div>
          <p className="text-xs text-slate-400">Your journey</p>
          <p className={`text-xl font-semibold mt-0.5 ${bad ? 'text-red-600' : 'text-slate-900'}`}>{current.label}</p>
        </div>
        <p className="text-xs text-slate-400">Updated {fmt(profile.stageUpdatedAt)}</p>
      </div>
      <ol className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-1">
        {phases.map((p, i) => {
          const done = i < currentPhase;
          const active = i === currentPhase;
          const dot = done
            ? 'bg-[#DE5C2B] border-[#DE5C2B] text-white'
            : active
              ? bad ? 'bg-red-50 border-red-500 text-red-600 ring-4 ring-red-100' : current.outcome === 'good' ? 'bg-[#DE5C2B] border-[#DE5C2B] text-white ring-4 ring-orange-100' : 'bg-white border-[#DE5C2B] text-[#DE5C2B] ring-4 ring-orange-100'
              : 'bg-white border-slate-200 text-slate-400';
          return (
            <li key={p.key} className="relative flex flex-col items-center text-center">
              {i > 0 && <span className={`hidden sm:block absolute top-[15px] right-1/2 w-full h-[2px] ${i <= currentPhase ? 'bg-[#DE5C2B]' : 'bg-slate-200'}`} aria-hidden />}
              <span className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 ${dot}`}>
                {done || (active && current.outcome === 'good') ? <Check size={15} strokeWidth={3} /> : active && bad ? <X size={15} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`mt-2 text-[12.5px] ${active ? 'font-bold text-slate-900' : done ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>{p.label}</span>
              <ul className="mt-3 space-y-1.5 text-left w-full max-w-[190px] mx-auto">
                {stepsOf(p.key).map((st) => {
                  const isNow = st.key === current.key;
                  // Earlier in-progress steps of the current phase count as done even if the team skipped them
                  const before = active && !st.outcome && stages.indexOf(st) < stages.indexOf(current);
                  const reached = isNow || before || reachedKeys.has(st.key) || (done && st.outcome !== 'bad');
                  const isBad = st.outcome === 'bad';
                  return (
                    <li key={st.key} className="flex items-start gap-1.5 text-[11.5px] leading-tight">
                      <span className={`mt-[2px] w-3.5 h-3.5 shrink-0 rounded-full flex items-center justify-center border ${
                        isNow ? (isBad ? 'border-red-500 bg-red-500 text-white' : 'border-[#DE5C2B] bg-[#DE5C2B] text-white')
                          : reached ? 'border-[#DE5C2B] text-[#DE5C2B]' : 'border-slate-300'
                      }`}>
                        {(reached || isNow) && (isBad ? <X size={9} strokeWidth={3} /> : <Check size={9} strokeWidth={3} />)}
                      </span>
                      <span className={isNow ? (isBad ? 'font-bold text-red-600' : 'font-bold text-slate-900') : reached ? 'text-slate-600' : 'text-slate-400'}>
                        {st.label}
                        {isNow && <span className="block text-[10px] font-semibold text-[#C04A1D]">Current</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default JourneyTracker;
