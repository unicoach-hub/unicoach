import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

// Landing page for the unsubscribe link in UniCoach promotional emails
const UnsubscribePage = () => {
  const [params] = useSearchParams();
  const [state, setState] = useState('working'); // working | done | error

  useEffect(() => {
    const l = params.get('l');
    const t = params.get('t');
    if (!l || !t) {
      setTimeout(() => setState('error'), 0);
      return;
    }
    fetch(`${API_BASE_URL}/leads/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ l, t }),
    })
      .then((r) => setState(r.ok ? 'done' : 'error'))
      .catch(() => setState('error'));
  }, [params]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 pt-28 pb-16 bg-[#FAF9F6]">
      <div className="max-w-md w-full bg-white rounded-[28px] border border-slate-100 p-8 text-center">
        {state === 'working' && <Loader2 className="mx-auto animate-spin text-[#DE5C2B]" size={32} />}
        {state === 'done' && (
          <>
            <CheckCircle2 className="mx-auto text-emerald-600" size={40} />
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">You're unsubscribed</h1>
            <p className="mt-2 text-sm text-slate-600">You won't get promotional emails from UniCoach any more. Messages about events you register for and your account still reach you.</p>
          </>
        )}
        {state === 'error' && (
          <>
            <AlertTriangle className="mx-auto text-[#DE5C2B]" size={40} />
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">This link didn't work</h1>
            <p className="mt-2 text-sm text-slate-600">The unsubscribe link looks incomplete. Use the link from the latest email, or reply to it and we'll take you off the list.</p>
          </>
        )}
        <Link to="/" className="inline-block mt-6 text-sm font-semibold text-[#DE5C2B]">Back to UniCoach</Link>
      </div>
    </main>
  );
};

export default UnsubscribePage;
