import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, GraduationCap, Loader2, MapPin, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { ALL_COUNTRY_OPTIONS, POPULAR_COURSES } from '../utils/shortlistOptions';

const EDUCATION = ['12th / High School', 'Diploma', "Bachelor's", 'PG Diploma', "Master's", 'PhD'];
const INTAKES = (() => {
  const y = new Date().getFullYear();
  const out = [];
  for (const year of [y, y + 1, y + 2]) for (const m of ['January', 'May', 'September']) out.push(`${m} ${year}`);
  return out;
})();
const YEARS = (() => {
  const y = new Date().getFullYear();
  return Array.from({ length: 30 }, (_, i) => String(y + 4 - i));
})();

const inputClass =
  'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 outline-none focus:border-[#DE5C2B] focus:ring-4 focus:ring-orange-500/10 transition placeholder:text-slate-400';

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-[11.5px] text-slate-400 mt-1">{hint}</span>}
  </label>
);

const Section = ({ icon: Icon, title, children }) => (
  <div className="pt-5 first:pt-0">
    <h3 className="flex items-center gap-2 text-[13px] font-bold text-slate-900 mb-3">
      <span className="w-7 h-7 rounded-lg bg-orange-50 text-[#DE5C2B] flex items-center justify-center"><Icon size={15} /></span>
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

// Profile form opened from the dashboard's "Complete your profile" card (optional, can be skipped)
const OnboardingPage = () => {
  const { user, token, loading: authLoading, updateUser } = useAuth();
  const authHeaders = token && token !== 'cookie-session' ? { Authorization: `Bearer ${token}` } : {};
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get('next') || '/dashboard';
  const countries = useMemo(() => ALL_COUNTRY_OPTIONS.filter((c) => c.value && c.value !== 'All'), []);

  const [form, setForm] = useState({
    name: '', phone: '', dreamCountry: '', preferredIntake: '', dreamCourse: '',
    highestEducation: '', percentage: '', passoutYear: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetch(`${API_BASE_URL}/student/profile`, { credentials: 'include', headers: authHeaders })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive) return;
        const p = data?.profile || user;
        setForm((f) => ({
          ...f,
          name: p.name || '',
          phone: p.phone || '',
          dreamCountry: p.dreamCountry || '',
          preferredIntake: p.preferredIntake || '',
          dreamCourse: p.dreamCourse || '',
          highestEducation: p.highestEducation || '',
          percentage: p.percentage || '',
          passoutYear: p.passoutYear || '',
        }));
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!authLoading && !user) return <Navigate to={`/login?redirect=${encodeURIComponent('/onboarding')}`} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const filled = Object.values(form).filter((v) => String(v).trim()).length;
  const total = Object.keys(form).length;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const empty = Object.entries(form).find(([, v]) => !String(v).trim());
    if (empty) {
      setError('Please fill in every field.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/student/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'Could not save. Please try again.');
        return;
      }
      updateUser({ ...user, ...data.profile, profileCompleted: true });
      navigate(next.startsWith('/') ? next : '/dashboard', { replace: true });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F4] pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[11.5px] font-bold text-[#C04A1D]">
            Step 2 of 2 · takes 1 minute
          </span>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold text-slate-900 mt-3 tracking-tight">Tell us about your study plans</h1>
          <p className="text-[14px] text-slate-500 mt-1.5">We ask once. Your counsellor and every UniCoach tool will use these details.</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-6">
            <div className="h-full bg-[#DE5C2B] transition-all" style={{ width: `${(filled / total) * 100}%` }} />
          </div>

          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-5">
              <Section icon={User} title="About you">
                <Field label="Full name">
                  <input className={inputClass} value={form.name} onChange={set('name')} placeholder="As on your passport" autoComplete="name" />
                </Field>
                <Field label="Phone (WhatsApp)">
                  <input className={inputClass} value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" inputMode="tel" autoComplete="tel" />
                </Field>
                <Field label="Email">
                  <input className={`${inputClass} bg-slate-50 text-slate-500`} value={user?.email || ''} readOnly />
                </Field>
              </Section>

              <Section icon={MapPin} title="Where and what you want to study">
                <Field label="Country you want to go to">
                  <select className={inputClass} value={form.dreamCountry} onChange={set('dreamCountry')}>
                    <option value="">Select a country</option>
                    <option value="Not decided yet">Not decided yet</option>
                    {countries.map((c) => <option key={c.value} value={c.value}>{c.shortLabel || c.label}</option>)}
                  </select>
                </Field>
                <Field label="Intake">
                  <select className={inputClass} value={form.preferredIntake} onChange={set('preferredIntake')}>
                    <option value="">Select an intake</option>
                    {INTAKES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Course you want to study">
                    <input className={inputClass} value={form.dreamCourse} onChange={set('dreamCourse')} list="onb-courses" placeholder="e.g. MSc Data Science, MBA" />
                    <datalist id="onb-courses">
                      {POPULAR_COURSES.map((c) => <option key={c.value} value={c.shortLabel || c.value} />)}
                    </datalist>
                  </Field>
                </div>
              </Section>

              <Section icon={GraduationCap} title="Your latest qualification">
                <Field label="Highest qualification">
                  <select className={inputClass} value={form.highestEducation} onChange={set('highestEducation')}>
                    <option value="">Select</option>
                    {EDUCATION.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </Field>
                <Field label="Percentage" hint="Have a CGPA? Enter the % on your marksheet, or CGPA × 9.5">
                  <input className={inputClass} value={form.percentage} onChange={set('percentage')} placeholder="e.g. 72" inputMode="decimal" />
                </Field>
                <Field label="Passout year">
                  <select className={inputClass} value={form.passoutYear} onChange={set('passoutYear')}>
                    <option value="">Select year</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </Field>
              </Section>
            </div>
          )}

          {error && <p className="mt-5 text-[13px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>}

          <button
            type="submit"
            disabled={saving || loading}
            className="mt-6 w-full h-12 rounded-xl bg-[#DE5C2B] hover:bg-[#C04A1D] disabled:opacity-60 text-white font-bold text-[14.5px] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {saving ? <Loader2 size={17} className="animate-spin" /> : <>Save and open my dashboard <ArrowRight size={17} /></>}
          </button>
          <button type="button" onClick={() => navigate(next, { replace: true })} className="mt-3 w-full text-[13px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer">
            Skip for now
          </button>
          <p className="mt-2 text-center text-[11.5px] text-slate-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 size={13} /> You can change these later from your dashboard profile.
          </p>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
