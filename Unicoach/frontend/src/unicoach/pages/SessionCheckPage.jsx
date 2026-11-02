import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { StationSign } from '../../components/desi/DesiKit';

// Link from the student's "Did your session happen?" email (/session-check/:token?a=yes|no).
// The email link only preselects; the student taps to confirm, so mail scanners opening links never answer.
const API = `${API_BASE_URL}/unicoach/session-check`;

const SessionCheckPage = () => {
  const { token } = useParams();
  const [params] = useSearchParams();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [choice, setChoice] = useState(params.get('a') === 'no' ? 'no' : params.get('a') === 'yes' ? 'yes' : '');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    let alive = true;
    fetch(`${API}/${token}`)
      .then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'This link is not valid.'); return d; })
      .then((d) => { if (!alive) return; setInfo(d); if (d.answer === 'YES' || d.answer === 'NO') setSaved(d.answer); })
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [token]);

  const submit = async () => {
    if (!choice) return;
    setSaving(true);
    setError('');
    try {
      const r = await fetch(`${API}/${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answer: choice, note }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Could not save your answer.');
      setSaved(d.answer);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const when = info?.startUtc ? new Date(info.startUtc).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';
  const option = (value, label, Icon, tone) => (
    <button type="button" onClick={() => setChoice(value)} aria-pressed={choice === value}
      className="flex-1 flex items-center justify-center gap-2 h-14 rounded-full border-[3px] border-[#16130F] font-bold text-[16px] transition-transform hover:-translate-y-0.5"
      style={{ background: choice === value ? tone : '#fff', color: choice === value ? '#fff' : '#16130F', boxShadow: choice === value ? '4px 4px 0 #16130F' : 'none' }}>
      <Icon size={20} /> {label}
    </button>
  );

  return (
    <div className="min-h-screen pt-[96px] pb-20 px-4 bg-[#FFF6E5] bg-[radial-gradient(circle,rgba(22,19,15,.06)_1.3px,transparent_1.7px)] [background-size:12px_12px] font-['Onest',sans-serif]">
      <div className="max-w-[560px] mx-auto">
        <StationSign hi="Ek chhota sa sawaal" en="SESSION CHECK" className="-rotate-2" />
        <div className="mt-6 bg-white border-[3px] border-[#16130F] shadow-[7px_7px_0_#16130F] rounded-[20px] p-6 sm:p-8">
          {!info && !error && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#DE5C2B]" /></div>}
          {error && !info && <p className="text-[16px] font-semibold text-[#D0362E]">{error}</p>}

          {info && saved && (
            <div className="text-center py-4">
              {saved === 'YES' ? <CheckCircle2 size={44} className="mx-auto text-[#14837E]" /> : <XCircle size={44} className="mx-auto text-[#D0362E]" />}
              <h1 className="mt-3 font-urbanist text-[26px] font-black text-[#16130F]">Thank you, {info.studentName?.split(' ')[0] || 'there'}!</h1>
              <p className="mt-2 text-[16px] text-[#3D3830]">
                {saved === 'YES' ? 'Glad your session happened. All the best with your applications!' : 'Sorry about that. Our team will call or email you within one working day to sort it out.'}
              </p>
              {!info.settled && (
                <button type="button" onClick={() => setSaved('')} className="mt-5 text-[14px] font-bold text-[#16130F] underline decoration-2 underline-offset-4">Change my answer</button>
              )}
            </div>
          )}

          {info && !saved && (
            <>
              <h1 className="font-urbanist text-[26px] sm:text-[30px] font-black leading-tight text-[#16130F]">Did your session with {info.mentorName || 'your mentor'} happen?</h1>
              <p className="mt-2 text-[15px] text-[#5B544A]">{info.service}{when ? ` · ${when}` : ''}</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {option('yes', 'Yes, it happened', CheckCircle2, '#14837E')}
                {option('no', 'No, it did not', XCircle, '#D0362E')}
              </div>
              {choice === 'no' && (
                <label className="block mt-5">
                  <span className="text-[14px] font-bold text-[#16130F]">What went wrong? (optional)</span>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000}
                    placeholder="e.g. The mentor did not join the call"
                    className="mt-1.5 w-full p-3 text-[15px] border-2 border-[#16130F] rounded-[12px] outline-none focus:ring-4 focus:ring-[#F2B705]/50" />
                </label>
              )}
              {error && <p className="mt-4 text-[14px] font-semibold text-[#D0362E]">{error}</p>}
              <button type="button" onClick={submit} disabled={!choice || saving}
                className="mt-6 w-full h-12 rounded-full bg-[#16130F] text-white font-bold text-[15px] border-[3px] border-[#16130F] shadow-[4px_4px_0_#DE5C2B] disabled:opacity-40 disabled:shadow-none">
                {saving ? 'Saving…' : 'Submit'}
              </button>
              <p className="mt-4 text-[13px] text-[#5B544A]">We ask so mentors are only paid for sessions that took place.</p>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-[14px]"><Link to="/unicoach" className="font-bold text-[#16130F] underline decoration-2 underline-offset-4">Back to UniCoach mentors</Link></p>
      </div>
    </div>
  );
};

export default SessionCheckPage;
