import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock3, XCircle, Loader2, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyMentorProfile } from '../api/unicoachApi';

// Where a mentor's application stands (linked from the application / approval emails)
const STATUS = {
  PENDING: {
    icon: Clock3,
    tone: 'text-amber-600 bg-amber-50 border-amber-200',
    title: 'Verification pending',
    text: 'Thanks for applying! Our team checks every mentor profile by hand. This usually takes 1–3 working days, and we will email you as soon as it is done.',
  },
  APPROVED: {
    icon: CheckCircle2,
    tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    title: 'Approved — you are live',
    text: 'Your profile is verified and visible to students on UniCoach. Add your available slots so students can book you.',
  },
  REJECTED: {
    icon: XCircle,
    tone: 'text-red-600 bg-red-50 border-red-200',
    title: 'Not approved',
    text: 'We could not approve your application this time. You can reply to our email to have it reviewed again.',
  },
};

const STEPS = [
  { key: 'submitted', label: 'Application submitted' },
  { key: 'review', label: 'Verification by the UniCoach team' },
  { key: 'live', label: 'Profile live with verified badge' },
];

const MentorApplicationStatusPage = () => {
  const { user, loading: authLoading, openLoginModal } = useAuth();
  const [state, setState] = useState({ loading: true, mentor: null, error: '' });

  useEffect(() => {
    if (authLoading || !user) return;
    getMyMentorProfile()
      .then((res) => setState({ loading: false, mentor: res.hasProfile ? res.mentor : null, error: '' }))
      .catch((err) => setState({ loading: false, mentor: null, error: err.message }));
  }, [user, authLoading]);

  const mentor = state.mentor;
  const status = STATUS[mentor?.applicationStatus] || STATUS.PENDING;
  const Icon = status.icon;
  const reached = mentor?.applicationStatus === 'APPROVED' ? 3 : 1;

  return (
    <div className="min-h-screen bg-[#FBF8F4] pt-28 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="font-outfit text-[28px] sm:text-[32px] font-black text-slate-900 tracking-tight text-center">Mentor application status</h1>

        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {authLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
          ) : !user ? (
            <div className="text-center py-6">
              <p className="text-slate-600 text-[15px]">Sign in with the email you used to apply to see your status.</p>
              <button
                type="button"
                onClick={() => openLoginModal?.({ redirect: '/unicoach/application-status' })}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] text-white font-bold text-[14px] cursor-pointer"
              >
                Sign in <ArrowRight size={16} />
              </button>
            </div>
          ) : state.loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
          ) : state.error ? (
            <p className="text-center text-red-600 py-6">{state.error}</p>
          ) : !mentor ? (
            <div className="text-center py-6">
              <p className="text-slate-700 font-semibold">No mentor application found for {user.email}.</p>
              <p className="text-slate-500 text-sm mt-1">Signed in with a different email? Sign out and use the one from your application.</p>
              <Link to="/unicoach/apply" className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] text-white font-bold text-[14px]">
                Apply as a mentor <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <div className={`flex items-start gap-3 rounded-xl border p-4 ${status.tone}`}>
                <Icon size={22} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[16px]">{status.title}</p>
                  <p className="text-[13.5px] text-slate-700 mt-1 leading-relaxed">{status.text}</p>
                  {mentor.applicationStatus === 'REJECTED' && mentor.rejectionReason && (
                    <p className="text-[13.5px] text-slate-800 mt-2"><strong>Reason:</strong> {mentor.rejectionReason}</p>
                  )}
                </div>
              </div>

              {mentor.applicationStatus !== 'REJECTED' && (
                <ol className="mt-6 space-y-3">
                  {STEPS.map((s, i) => {
                    const done = i < reached;
                    const current = i === reached && mentor.applicationStatus === 'PENDING';
                    return (
                      <li key={s.key} className="flex items-center gap-3 text-[14px]">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${done ? 'bg-emerald-500 border-emerald-500 text-white' : current ? 'border-amber-500 text-amber-600' : 'border-slate-200 text-slate-300'}`}>
                          {done ? <CheckCircle2 size={14} /> : <span className="text-[11px] font-bold">{i + 1}</span>}
                        </span>
                        <span className={done ? 'font-semibold text-slate-900' : current ? 'font-semibold text-amber-700' : 'text-slate-400'}>
                          {s.label}{current ? ' (in progress)' : ''}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}

              <div className="mt-6 pt-5 border-t border-slate-100 text-[13px] text-slate-600 space-y-1">
                <p>Name: <strong className="text-slate-900">{mentor.name}</strong></p>
                <p>Handle: <strong className="text-slate-900">@{mentor.handle}</strong></p>
                {mentor.createdAt && <p>Applied on: <strong className="text-slate-900">{new Date(mentor.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></p>}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {mentor.applicationStatus === 'APPROVED' ? (
                  <Link to={`/unicoach/dashboard/${mentor.handle}`} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px]">
                    Open my mentor dashboard <ArrowRight size={16} />
                  </Link>
                ) : (
                  <a href="mailto:unicoachedu@gmail.com" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 hover:border-[#DE5C2B] text-slate-800 font-bold text-[14px]">
                    <Mail size={16} /> Contact the team
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorApplicationStatusPage;
