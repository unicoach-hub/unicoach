import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Loader2, Search, Users } from 'lucide-react';
import { getMentorReferrals } from '../api/unicoachApi';
import { SITE_URL } from '../../config';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

// Mentor dashboard → "My students": the referral link plus every student who joined through it and their stage
const MentorReferrals = ({ handle }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [copied, setCopied] = useState(false);
  const link = `${SITE_URL}/signup?ref=${handle || ''}`;

  useEffect(() => {
    if (!handle) return;
    let alive = true;
    getMentorReferrals(handle)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [handle]);

  const stageLabel = useMemo(() => {
    const phaseLabel = Object.fromEntries((data?.phases || []).map((p) => [p.key, p.label]));
    return Object.fromEntries((data?.stages || []).map((s) => [s.key, { label: s.label, phase: phaseLabel[s.phase] || '', outcome: s.outcome }]));
  }, [data]);
  const students = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.students || []).filter((s) => (!stage || s.journeyStage === stage) && (!q || s.name.toLowerCase().includes(q)));
  }, [data, search, stage]);
  const total = data?.students?.length || 0;
  const countBy = (key) => (data?.students || []).filter((s) => s.journeyStage === key).length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the link is visible to copy by hand */
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My students</h2>
        <p className="text-sm text-slate-500 mt-1">Students who joined UniCoach through your link, and where each one is in their journey.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <p className="text-[13px] font-semibold text-slate-800">Your referral link</p>
        <p className="text-[12px] text-slate-500 mt-0.5">Share it with students. When they sign up through it, they are added to your list automatically.</p>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input readOnly value={link} className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-mono text-slate-700" onFocus={(e) => e.target.select()} />
          <button type="button" onClick={copy} className="h-[42px] px-5 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] text-white text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer">
            {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy link</>}
          </button>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['Total students', total],
            ['Applied', ['applied', 'offer_received', 'offer_accepted', 'offer_rejected', 'fees_paid', 'visa_filing', 'visa_applied', 'visa_approved', 'visa_rejected'].reduce((n, k) => n + countBy(k), 0)],
            ['Offers', ['offer_received', 'offer_accepted', 'fees_paid', 'visa_filing', 'visa_applied', 'visa_approved', 'visa_rejected'].reduce((n, k) => n + countBy(k), 0)],
            ['Visa approved', countBy('visa_approved')],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-[12px] text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row gap-2 border-b border-slate-100">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your students by name" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#DE5C2B]" />
          </div>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className="px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] bg-white">
            <option value="">All stages</option>
            {(data?.stages || []).map((s) => <option key={s.key} value={s.key}>{s.label} ({countBy(s.key)})</option>)}
          </select>
        </div>

        {error ? (
          <p className="p-6 text-sm text-red-600">{error}</p>
        ) : !data ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto text-slate-300" size={28} />
            <p className="text-sm font-semibold text-slate-700 mt-2">{total ? 'No student matches this search' : 'No students yet'}</p>
            {!total && <p className="text-[12.5px] text-slate-500 mt-1">Share your referral link above to get started.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Student</th>
                  <th className="px-4 py-2.5 font-semibold">Country</th>
                  <th className="px-4 py-2.5 font-semibold">Joined</th>
                  <th className="px-4 py-2.5 font-semibold">Stage</th>
                  <th className="px-4 py-2.5 font-semibold">Last update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const st = stageLabel[s.journeyStage] || { label: s.journeyStage, phase: '' };
                  const tone = st.outcome === 'bad' ? 'bg-red-50 text-red-600' : st.outcome === 'good' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-[#C04A1D]';
                  return (
                    <tr key={s._id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{s.name}</td>
                      <td className="px-4 py-3 text-slate-600">{s.dreamCountry || '—'}{s.preferredIntake ? ` · ${s.preferredIntake}` : ''}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmt(s.joinedAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap ${tone}`}>
                          {st.phase ? `${st.phase} · ` : ''}{st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmt(s.stageUpdatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorReferrals;
