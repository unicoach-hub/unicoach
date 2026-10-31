import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

// The student's journey (set by the UniCoach team) in six phases:
// Walk-in → Documents → Application → Offer → Fees → Visa, with every step inside each phase
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
  // When each step was reached (latest time it was set), shown under the step
  const reachedAt = {};
  (profile.stageHistory || []).forEach((h) => { if (h.at && (!reachedAt[h.stage] || new Date(h.at) > new Date(reachedAt[h.stage]))) reachedAt[h.stage] = h.at; });
  if (!reachedAt[current.key] && profile.stageUpdatedAt) reachedAt[current.key] = profile.stageUpdatedAt;
  if (!reachedAt.registered && profile.createdAt) reachedAt.registered = profile.createdAt;
  const stepsOf = (phaseKey) => stages.filter((st) => st.phase === phaseKey && (st.outcome !== 'bad' || st.key === current.key || reachedKeys.has(st.key)));

  return (
    <div className="bg-white border-2 border-[#16130F] rounded-[24px] shadow-[4px_4px_0_#16130F] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-5">
        <div>
          <p className="text-[13px] font-bold text-[#C04A1D]">Aapka safar, abhi yahan hain</p>
          <p className={`font-urbanist text-[26px] font-black leading-tight ${bad ? 'text-red-600' : 'text-[#16130F]'}`}>{current.label}</p>
        </div>
        <p className="text-[13px] text-[#5B544A]">UniCoach team ne update kiya: {fmt(profile.stageUpdatedAt)}</p>
      </div>
      <ol className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-y-6 gap-x-1">
        {phases.map((p, i) => {
          const done = i < currentPhase;
          const active = i === currentPhase;
          const dot = done
            ? 'bg-[#DE5C2B] border-[#16130F] text-white'
            : active
              ? bad ? 'bg-red-50 border-red-500 text-red-600 ring-4 ring-red-100' : current.outcome === 'good' ? 'bg-[#DE5C2B] border-[#16130F] text-white ring-4 ring-[#F2B705]' : 'bg-[#F2B705] border-[#16130F] text-[#16130F] ring-4 ring-[#FFE9A8]'
              : 'bg-white border-[#CFC6B4] text-[#8A8275]';
          return (
            <li key={p.key} className="relative flex flex-col items-center text-center">
              {i > 0 && <span className={`hidden ${i % 3 ? 'sm:block' : 'xl:block'} absolute top-[17px] right-1/2 w-full h-[3px] ${i <= currentPhase ? 'bg-[#16130F]' : 'bg-[#E4DCCB]'}`} aria-hidden />}
              <span className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-black border-2 ${dot}`}>
                {done || (active && current.outcome === 'good') ? <Check size={15} strokeWidth={3} /> : active && bad ? <X size={15} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`mt-2 text-[15px] ${active ? 'font-extrabold text-[#16130F]' : done ? 'font-bold text-[#3D3830]' : 'font-semibold text-[#8A8275]'}`}>{p.label}</span>
              <ul className="mt-3 space-y-1.5 text-left w-full max-w-[190px] mx-auto">
                {stepsOf(p.key).map((st) => {
                  const isNow = st.key === current.key;
                  // Earlier in-progress steps of the current phase count as done even if the team skipped them
                  const before = active && !st.outcome && stages.indexOf(st) < stages.indexOf(current);
                  const reached = isNow || before || reachedKeys.has(st.key) || (done && st.outcome !== 'bad');
                  const isBad = st.outcome === 'bad';
                  return (
                    <li key={st.key} className="flex items-start gap-1.5 text-[13px] leading-tight">
                      <span className={`mt-[1px] w-4 h-4 shrink-0 rounded-full flex items-center justify-center border ${
                        isNow ? (isBad ? 'border-red-500 bg-red-500 text-white' : 'border-[#DE5C2B] bg-[#DE5C2B] text-white')
                          : reached ? 'border-[#DE5C2B] text-[#DE5C2B]' : 'border-slate-300'
                      }`}>
                        {(reached || isNow) && (isBad ? <X size={9} strokeWidth={3} /> : <Check size={9} strokeWidth={3} />)}
                      </span>
                      <span className={isNow ? (isBad ? 'font-bold text-red-600' : 'font-bold text-[#16130F]') : reached ? 'text-[#3D3830]' : 'text-[#8A8275]'}>
                        {st.label}
                        {reachedAt[st.key] && (reached || isNow) && <span className="block text-[11.5px] font-normal text-[#6B6458]">{fmt(reachedAt[st.key])}</span>}
                        {isNow && <span className="inline-block mt-0.5 px-1.5 rounded bg-[#F2B705] text-[11px] font-extrabold text-[#16130F]">Aap yahan ho</span>}
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
