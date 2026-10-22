import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Compass, FileText, Loader2, Map, MessageCircle, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { openRazorpayCheckout } from '../unicoach/utils/razorpayCheckout';
import { TEAM_MENTORS, mentorLook } from '../utils/teamMentors';

const API = API_BASE_URL.replace(/\/$/, '');
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const INCLUDED = [
  { icon: Compass, t: 'Profile check', d: 'What you can realistically aim for.' },
  { icon: Map, t: 'Clear roadmap', d: 'Step-by-step plan for your case.' },
  { icon: FileText, t: 'Next steps', d: 'Exactly what to do after the call.' },
  { icon: MessageCircle, t: 'Open Q&A', d: 'Your questions, answered straight.' },
];

const to12h = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const longDate = (ymd) => new Date(`${ymd}T12:00:00+05:30`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const fullDate = (ymd) => new Date(`${ymd}T12:00:00+05:30`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const monthKey = (ymd) => ymd.slice(0, 7);

const Shell = ({ children }) => (
  <main className="min-h-screen bg-[#FAF9F6] pt-[110px] pb-20 px-4 sm:px-6">
    <div className="max-w-[1180px] mx-auto">{children}</div>
  </main>
);

// Step 1 (/book-consultation): pick a service, a day and a time.
// Step 2 (/book-consultation/confirm): add details, pay ₹500 through Razorpay, done.
const BookConsultationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmStep = location.pathname.endsWith('/confirm');
  const picked = location.state?.pick;

  const [cfg, setCfg] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [service, setService] = useState(picked?.service || '');
  const [date, setDate] = useState(picked?.date || '');
  const [time, setTime] = useState(picked?.time || '');
  const [month, setMonth] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Book a 1:1 consultation | UniCoach';
  }, [confirmStep]);

  useEffect(() => {
    let alive = true;
    fetch(`${API}/consultations/config`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Could not load open times'))))
      .then((d) => {
        if (!alive) return;
        setCfg(d);
        const firstOpen = d.days.find((x) => x.slots.length)?.date || d.days[0]?.date;
        setMonth((m) => m || monthKey(firstOpen));
      })
      .catch((e) => alive && setLoadError(e.message));
    return () => { alive = false; };
  }, []);

  // Coming to step 2 without a pick (refresh / direct link): back to step 1
  useEffect(() => {
    if (confirmStep && !picked) navigate('/book-consultation', { replace: true });
  }, [confirmStep, picked, navigate]);

  if (confirmStep && picked) return <ConfirmStep cfg={cfg} pick={picked} />;

  return (
    <Shell>
      <div className="text-center">
        <p className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.14em] text-[#DE5C2B] uppercase"><CalendarDays size={14} /> Book a consultation</p>
        <h1 className="mt-3 font-outfit text-[34px] sm:text-[46px] font-black tracking-tight text-[#111] leading-tight">Choose a day and a time</h1>
        <p className="mt-3 text-[15px] text-slate-600 max-w-xl mx-auto">
          A {cfg?.durationMin || 30}-minute 1:1 call with our team, ₹{cfg?.price || 500}. Calls run 1 to 3 PM and 8 to 9 PM, India time.
        </p>
      </div>

      <div className="mt-8 grid lg:grid-cols-[320px_1fr] rounded-[28px] bg-white border border-slate-200 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] overflow-hidden">
        <SidePanel cfg={cfg} />

        <section className="p-5 sm:p-7">
          {loadError && <p className="text-red-600 text-sm">{loadError}</p>}
          {!cfg && !loadError && <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#DE5C2B]" /></div>}
          {cfg && (
            <Picker
              cfg={cfg}
              service={service} setService={setService}
              date={date} setDate={(d) => { setDate(d); setTime(''); }}
              time={time} setTime={setTime}
              month={month} setMonth={setMonth}
              onNext={() => navigate('/book-consultation/confirm', { state: { pick: { service, date, time } } })}
            />
          )}
        </section>
      </div>
    </Shell>
  );
};

const SidePanel = ({ cfg }) => (
  <aside className="p-6 sm:p-7 bg-gradient-to-b from-[#FFF4EE] to-white border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col">
    <div className="flex -space-x-2.5">
      {TEAM_MENTORS.slice(0, 4).map((m) => (
        <img key={m.src} src={mentorLook(m.name).cutout || m.src} alt="" width="44" height="44"
          className="w-11 h-11 rounded-full ring-2 ring-white object-cover object-top"
          style={mentorLook(m.name).gradient ? { background: mentorLook(m.name).gradient } : undefined} />
      ))}
    </div>
    <p className="mt-3 text-[14px] font-bold text-slate-900">The UniCoach team</p>
    <p className="text-[12.5px] text-slate-500">Counsellors and seniors who have done it</p>

    <p className="mt-6 text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">What&apos;s included</p>
    <ul className="mt-3 space-y-3.5">
      {INCLUDED.map(({ icon: I, t, d }) => (
        <li key={t} className="flex gap-3">
          <span className="w-8 h-8 rounded-full bg-white border border-orange-100 text-[#DE5C2B] grid place-items-center shrink-0"><I size={15} /></span>
          <span><span className="block text-[13.5px] font-semibold text-slate-900">{t}</span><span className="block text-[12.5px] text-slate-500">{d}</span></span>
        </li>
      ))}
    </ul>

    <div className="mt-auto pt-6 border-t border-slate-100 text-[13px]">
      <p className="flex items-center gap-2 font-semibold text-slate-800"><Clock size={14} className="text-[#DE5C2B]" /> {cfg?.durationMin || 30} min · ₹{cfg?.price || 500} per call</p>
      <p className="mt-1 text-[12px] text-slate-500">Private 1:1 on video. Confirmed by email. All times India time.</p>
    </div>
  </aside>
);

const Picker = ({ cfg, service, setService, date, setDate, time, setTime, month, setMonth, onNext }) => {
  const [open, setOpen] = useState(false);
  const byDate = useMemo(() => Object.fromEntries(cfg.days.map((d) => [d.date, d.slots])), [cfg]);
  const months = useMemo(() => [...new Set(cfg.days.map((d) => monthKey(d.date)))], [cfg]);
  const svc = cfg.services.find((s) => s.key === service);

  // Month grid, Monday first
  const cells = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const lead = (first.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const out = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= daysInMonth; d += 1) out.push(`${month}-${String(d).padStart(2, '0')}`);
    return out;
  }, [month]);
  const mi = months.indexOf(month);
  const slots = date ? byDate[date] || [] : [];
  const ready = service && date && time;

  return (
    <div>
      {/* Service */}
      <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">1 · Service</p>
      <div className="relative mt-2">
        <button type="button" onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left cursor-pointer transition-colors ${open ? 'border-[#DE5C2B] ring-4 ring-orange-100' : 'border-slate-200 hover:border-slate-300'}`}>
          <span>
            <span className={`block text-[15px] font-semibold ${svc ? 'text-slate-900' : 'text-slate-400'}`}>{svc ? svc.label : 'Select the service you need'}</span>
            {svc && <span className="block text-[12.5px] text-slate-500">{svc.desc}</span>}
          </span>
          <span className="flex items-center gap-3 shrink-0">
            <span className="text-[13px] font-bold text-[#DE5C2B]">₹{cfg.price}</span>
            <ChevronDown size={18} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </span>
        </button>
        {open && (
          <ul className="absolute z-20 mt-2 w-full rounded-2xl bg-white border border-slate-200 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)] p-1.5 max-h-[340px] overflow-auto" data-lenis-prevent>
            {cfg.services.map((s) => (
              <li key={s.key}>
                <button type="button" onClick={() => { setService(s.key); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left cursor-pointer ${service === s.key ? 'bg-orange-50' : 'hover:bg-slate-50'}`}>
                  <span><span className="block text-[14px] font-semibold text-slate-900">{s.label}</span><span className="block text-[12px] text-slate-500">{s.desc}</span></span>
                  <span className="flex items-center gap-2 text-[13px] font-bold text-slate-700">₹{cfg.price}{service === s.key && <Check size={15} className="text-[#DE5C2B]" />}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 grid md:grid-cols-[1fr_230px] gap-6">
        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">2 · Day</p>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-slate-900">{new Date(`${month}-01T12:00:00Z`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
              <button type="button" aria-label="Previous month" disabled={mi <= 0} onClick={() => setMonth(months[mi - 1])} className="w-8 h-8 rounded-full border border-slate-200 grid place-items-center disabled:opacity-30 cursor-pointer"><ChevronLeft size={15} /></button>
              <button type="button" aria-label="Next month" disabled={mi >= months.length - 1} onClick={() => setMonth(months[mi + 1])} className="w-8 h-8 rounded-full border border-slate-200 grid place-items-center disabled:opacity-30 cursor-pointer"><ChevronRight size={15} /></button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
            {DOW.map((d) => <span key={d} className="text-[11px] font-semibold text-slate-400 py-1">{d}</span>)}
            {cells.map((d, i) => {
              if (!d) return <span key={`e${i}`} />;
              const open = (byDate[d] || []).length > 0;
              const sel = d === date;
              return (
                <button key={d} type="button" disabled={!open} onClick={() => setDate(d)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[14px] font-semibold transition-all ${
                    sel ? 'bg-[#DE5C2B] text-white shadow-[0_10px_24px_-10px_rgba(222,92,43,0.8)]'
                      : open ? 'border border-slate-200 text-slate-900 hover:border-[#DE5C2B] cursor-pointer' : 'text-slate-300 cursor-default'}`}>
                  {Number(d.slice(8))}
                  {open && <span className={`mt-0.5 w-1 h-1 rounded-full ${sel ? 'bg-white' : 'bg-emerald-500'}`} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Times */}
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">3 · Time</p>
          {!date && <p className="mt-3 text-[13px] text-slate-500">Pick a day to see the open times.</p>}
          {date && (
            <>
              <p className="mt-3 text-[13px] font-semibold text-slate-700">{longDate(date)}</p>
              {[['Afternoon', (t) => t < '17:00'], ['Evening', (t) => t >= '17:00']].map(([label, test]) => {
                const list = slots.filter(test);
                return (
                  <div key={label} className="mt-3">
                    <p className="text-[11.5px] text-slate-400">{label}</p>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      {list.length === 0 && <span className="col-span-2 text-[12px] text-slate-400">Fully booked</span>}
                      {list.map((t) => (
                        <button key={t} type="button" onClick={() => setTime(t)}
                          className={`h-10 rounded-full border text-[13px] font-semibold cursor-pointer transition-colors ${t === time ? 'bg-[#111] border-[#111] text-white' : 'border-slate-200 text-slate-800 hover:border-[#DE5C2B]'}`}>
                          {to12h(t)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <button type="button" disabled={!ready} onClick={onNext}
        className="mt-7 w-full h-14 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-[15px] flex items-center justify-between px-6 transition-colors cursor-pointer disabled:cursor-not-allowed">
        <span>{ready ? `Book ${longDate(date)}, ${to12h(time)}` : !service ? 'Select a service' : !date ? 'Pick a day' : 'Pick a time'}</span>
        <span className="flex items-center gap-2"><span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[12.5px]">₹{cfg.price}</span><ArrowRight size={17} /></span>
      </button>
      <p className="mt-2 text-[12px] text-slate-500 text-center">Next you add a few details and pay ₹{cfg.price} to confirm your slot.</p>
    </div>
  );
};

const ConfirmStep = ({ cfg, pick }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [doneRef, setDoneRef] = useState('');
  const svc = cfg?.services.find((s) => s.key === pick.service);
  const price = cfg?.price || 500;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const pay = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || form.phone.replace(/\D/g, '').length < 10) {
      setError('Please add your name, a valid email and a 10-digit phone number.');
      return;
    }
    setBusy(true);
    try {
      // Save the enquiry in the CRM even if the payment is not finished
      fetch(`${API}/leads/book-consultation`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, query: `${svc?.label || pick.service} · ${fullDate(pick.date)} ${to12h(pick.time)}. ${form.notes}`, source: 'Paid consultation booking' }),
      }).catch(() => {});

      const r = await fetch(`${API}/consultations`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pick, ...form, source: document.referrer ? 'website' : 'direct' }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.message || 'Could not start the booking');

      const result = await openRazorpayCheckout(data.order, {
        name: 'UniCoach',
        description: `${svc?.label || 'Consultation'} · ${longDate(pick.date)} ${to12h(pick.time)}`,
        prefill: data.prefill,
      });
      const v = await fetch(`${API}/consultations/${data.ref}/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result),
      });
      const vd = await v.json().catch(() => ({}));
      if (!v.ok) throw new Error(vd.message || 'Payment could not be confirmed. If money was deducted, write to us and we will sort it out.');
      setDoneRef(data.ref);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.code === 'DISMISSED' ? 'Payment was cancelled. Your slot is held for 15 minutes, you can try again.' : err.message);
    } finally {
      setBusy(false);
    }
  };

  if (doneRef) {
    return (
      <Shell>
        <div className="max-w-[560px] mx-auto rounded-[28px] bg-white border border-slate-200 p-8 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
          <span className="mx-auto w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center"><Check size={26} strokeWidth={3} /></span>
          <h1 className="mt-4 font-outfit text-[28px] font-black text-[#111]">You&apos;re booked!</h1>
          <p className="mt-2 text-[15px] text-slate-600">{svc?.label} on <b>{fullDate(pick.date)}, {to12h(pick.time)}</b> (India time).</p>
          <p className="mt-1 text-[13px] text-slate-500">We have emailed the details to {form.email}. Reference: <b>{doneRef}</b></p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#111] text-white font-semibold text-[14px]">Back to home <ArrowRight size={16} /></Link>
        </div>
      </Shell>
    );
  }

  const input = 'w-full h-12 rounded-xl border border-slate-200 px-4 text-[14.5px] outline-none focus:border-[#DE5C2B] focus:ring-4 focus:ring-orange-100';
  return (
    <Shell>
      <div className="max-w-[640px] mx-auto">
        <button type="button" onClick={() => navigate('/book-consultation', { state: { pick } })} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-[#DE5C2B] cursor-pointer">
          <ArrowLeft size={15} /> Back to calendar
        </button>
        <form onSubmit={pay} className="mt-4 rounded-[28px] bg-white border border-slate-200 p-6 sm:p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
          <h1 className="font-outfit text-[28px] sm:text-[32px] font-black text-[#111]">Confirm your consultation</h1>
          <dl className="mt-5 rounded-2xl bg-[#FFF4EE] p-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[14px]">
            <dt className="text-slate-500">Service</dt><dd className="text-right font-semibold text-slate-900">{svc?.label || '…'}</dd>
            <dt className="text-slate-500">When</dt><dd className="text-right font-semibold text-slate-900">{fullDate(pick.date)}, {to12h(pick.time)}</dd>
            <dt className="text-slate-500">Duration</dt><dd className="text-right font-semibold text-slate-900">{cfg?.durationMin || 30} minutes</dd>
            <dt className="text-slate-500">Fee</dt><dd className="text-right font-bold text-[#DE5C2B]">₹{price}</dd>
          </dl>

          <p className="mt-6 text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">Your details</p>
          <div className="mt-3 grid sm:grid-cols-2 gap-4">
            <label className="block"><span className="text-[13px] font-semibold text-slate-700">Full name</span><input className={`${input} mt-1.5`} value={form.name} onChange={set('name')} autoComplete="name" /></label>
            <label className="block"><span className="text-[13px] font-semibold text-slate-700">Phone (WhatsApp)</span><input className={`${input} mt-1.5`} value={form.phone} onChange={set('phone')} placeholder="+91 …" inputMode="tel" autoComplete="tel" /></label>
          </div>
          <label className="block mt-4"><span className="text-[13px] font-semibold text-slate-700">Email</span><input className={`${input} mt-1.5`} type="email" value={form.email} onChange={set('email')} autoComplete="email" /></label>
          <label className="block mt-4"><span className="text-[13px] font-semibold text-slate-700">Anything we should know <span className="font-normal text-slate-400">(optional)</span></span>
            <textarea className={`${input} mt-1.5 h-28 py-3 resize-none`} value={form.notes} onChange={set('notes')} placeholder="Country, course, marks, budget, questions…" />
          </label>

          {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}
          <button type="submit" disabled={busy || !cfg}
            className="mt-6 w-full h-14 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] disabled:opacity-60 text-white font-semibold text-[15px] flex items-center justify-center gap-2 cursor-pointer">
            {busy ? <><Loader2 size={17} className="animate-spin" /> Processing…</> : <>Pay ₹{price} &amp; confirm</>}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-slate-500"><ShieldCheck size={13} /> Secure payment by Razorpay: UPI, cards, net banking. See our <Link to="/refund-policy" className="underline">refund policy</Link>.</p>
        </form>
      </div>
    </Shell>
  );
};

export default BookConsultationPage;
