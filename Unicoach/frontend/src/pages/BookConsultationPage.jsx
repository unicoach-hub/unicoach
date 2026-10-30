import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Compass, FileText, Loader2, Map, MessageCircle, Mic, MonitorUp, PhoneOff, ShieldCheck, Video } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { openRazorpayCheckout } from '../unicoach/utils/razorpayCheckout';
import { TEAM_MENTORS, mentorLook } from '../utils/teamMentors';
import { JourneyPills } from '../components/ui/BrandElements';

const API = API_BASE_URL.replace(/\/$/, '');
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const INCLUDED = [
  { icon: Compass, t: 'Profile check', d: 'What you can realistically aim for.' },
  { icon: Map, t: 'Clear roadmap', d: 'Step-by-step plan for your case.' },
  { icon: FileText, t: 'Next steps', d: 'Exactly what to do after the call.' },
  { icon: MessageCircle, t: 'Open Q&A', d: 'Your questions, answered straight.' },
];

// The booking flow on this page, shown as pills above each step
const BOOKING_STEPS = [
  { label: 'Slot', sub: 'Service, day, time' },
  { label: 'Details', sub: 'Name and phone' },
  { label: 'Confirm', sub: 'Pay if a fee applies' },
  { label: 'Booked', sub: 'Details by email' },
];

const to12h = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const longDate = (ymd) => new Date(`${ymd}T12:00:00+05:30`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const fullDate = (ymd) => new Date(`${ymd}T12:00:00+05:30`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const monthKey = (ymd) => ymd.slice(0, 7);

// Price label: 0 means the calls are free right now
const fee = (price) => (price ? `₹${price}` : 'Free');

const Shell = ({ children }) => (
  <main className="min-h-screen bg-[#FAF9F6] pt-[110px] pb-20 px-4 sm:px-6">
    <div className="max-w-[1180px] mx-auto">{children}</div>
  </main>
);

// Step 1 (/book-consultation): pick a service, a day and a time.
// Step 2 (/book-consultation/confirm): add details, pay through Razorpay (skipped while calls are free), done.
const BookConsultationFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmStep = location.pathname.endsWith('/confirm');
  const picked = location.state?.pick;
  const [params] = useSearchParams();

  const [cfg, setCfg] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [service, setService] = useState(picked?.service || params.get('service') || '');
  const [date, setDate] = useState(picked?.date || '');
  const [time, setTime] = useState(picked?.time || '');
  const [month, setMonth] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Book a 1:1 consultation | UniCoach';
  }, [confirmStep]);

  const [notice, setNotice] = useState(location.state?.notice || '');
  // Latest pick, read by the 30-second refresh below
  const selRef = useRef({ date: '', time: '' });
  useEffect(() => { selRef.current = { date, time }; }, [date, time]);

  // Open slots, refreshed every 30 seconds so slots others just booked disappear on their own
  useEffect(() => {
    let alive = true;
    const load = (first) => fetch(`${API}/consultations/config`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Could not load open times'))))
      .then((d) => {
        if (!alive) return;
        setCfg(d);
        // The time the student picked was just taken by someone else: clear it and say so
        const sel = selRef.current;
        if (!first && sel.date && sel.time && !d.days.find((x) => x.date === sel.date)?.slots.includes(sel.time)) {
          setTime('');
          setNotice(`${to12h(sel.time)} on ${longDate(sel.date)} was just booked by someone else. Please pick another time.`);
        }
        if (first) {
          const firstOpen = d.days.find((x) => x.slots.length)?.date || d.days[0]?.date;
          setMonth((m) => m || monthKey(firstOpen));
        }
      })
      .catch((e) => alive && first && setLoadError(e.message));
    load(true);
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(false); }, 30000);
    return () => { alive = false; clearInterval(t); };
  }, []);



  // Coming to step 2 without a pick (refresh / direct link): back to step 1
  useEffect(() => {
    if (confirmStep && !picked) navigate('/book-consultation', { replace: true });
  }, [confirmStep, picked, navigate]);

  if (confirmStep && picked) return <ConfirmStep cfg={cfg} pick={picked} savedForm={location.state?.form} />;

  return (
    <Shell>
      <div className="text-center">
        <p className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.14em] text-[#DE5C2B] uppercase"><CalendarDays size={14} /> Book a consultation</p>
        <h1 className="mt-3 font-outfit text-[34px] sm:text-[46px] font-black tracking-tight text-[#111] leading-tight">Choose a day and a time</h1>
        <p className="mt-3 text-[15px] text-slate-600 max-w-xl mx-auto">
          A {(cfg?.durationMin || 60) === 60 ? 'one-hour' : `${cfg?.durationMin}-minute`} 1:1 call with our team{cfg ? `, ${fee(cfg.price).toLowerCase()}` : ''}. Pick any open slot, India time.
        </p>
        <Link to="/services" className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#DE5C2B] hover:underline">Not sure which service? See all services <ArrowRight size={14} /></Link>
        <JourneyPills steps={BOOKING_STEPS} active={0} className="mt-6 mx-auto w-fit max-w-full" />
      </div>

      <div className="mt-8 grid lg:grid-cols-[320px_1fr] rounded-[28px] bg-white border border-slate-200 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] overflow-hidden">
        <SidePanel cfg={cfg} />

        <section className="p-5 sm:p-7">
          {notice && (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13.5px] text-amber-900">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')} className="no-shine text-amber-700 font-semibold cursor-pointer">OK</button>
            </div>
          )}
          {loadError && <p className="text-red-600 text-sm">{loadError}</p>}
          {!cfg && !loadError && <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#DE5C2B]" /></div>}
          {cfg && (
            <Picker
              cfg={cfg}
              service={service} setService={setService}
              date={date} setDate={(d) => { setDate(d); setTime(''); }}
              time={time} setTime={setTime}
              month={month} setMonth={setMonth}
              onNext={() => navigate('/book-consultation/confirm', { state: { form: location.state?.form, pick: { service, date, time } } })}
            />
          )}
        </section>
      </div>

      <CallPreview />
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
      <p className="flex items-center gap-2 font-semibold text-slate-800"><Clock size={14} className="text-[#DE5C2B]" /> {cfg?.durationMin || 60} min{cfg ? ` · ${cfg.price ? `₹${cfg.price} per call` : 'free call'}` : ''}</p>
      <p className="mt-1 text-[12px] text-slate-500">Private 1:1 on video. Confirmed by email. All times India time.</p>
    </div>
  </aside>
);

const StepLabel = ({ n, label, done }) => (
  <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400">
    <span className={`w-5 h-5 rounded-full grid place-items-center text-[10.5px] tracking-normal ${done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{done ? <Check size={11} strokeWidth={3} /> : n}</span>
    {label}
  </p>
);

// Highlight a step the student skipped: scroll to it and pulse an orange ring for a moment
const flash = (el) => {
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('bc-flash');
  void el.offsetWidth; // restart the animation
  el.classList.add('bc-flash');
};

const Picker = ({ cfg, service, setService, date, setDate, time, setTime, month, setMonth, onNext }) => {
  const [open, setOpen] = useState(false);
  const serviceRef = useRef(null);
  const dayRef = useRef(null);
  const timeRef = useRef(null);
  // The button is never dead: it takes the student to whatever is still missing
  const next = () => {
    if (!service) { flash(serviceRef.current); setOpen(true); return; }
    if (!date) { flash(dayRef.current); return; }
    if (!time) { flash(timeRef.current); return; }
    onNext();
  };
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
      <style>{`@keyframes bcFlash{0%,100%{box-shadow:0 0 0 0 rgba(222,92,43,0)}30%,70%{box-shadow:0 0 0 6px rgba(222,92,43,.35)}}.bc-flash{animation:bcFlash 1.1s ease 2;border-radius:18px}`}</style>
      <StepLabel n={1} label="Service" done={!!service} />
      <div ref={serviceRef} className="relative mt-2">
        <button type="button" onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left cursor-pointer transition-colors ${open ? 'border-[#DE5C2B] ring-4 ring-orange-100' : 'border-slate-200 hover:border-slate-300'}`}>
          <span>
            <span className={`block text-[15px] font-semibold ${svc ? 'text-slate-900' : 'text-slate-400'}`}>{svc ? svc.label : 'Select the service you need'}</span>
            {svc && <span className="block text-[12.5px] text-slate-500">{svc.desc}</span>}
          </span>
          <span className="flex items-center gap-3 shrink-0">
            <span className="text-[13px] font-bold text-[#DE5C2B]">{fee(cfg.price)}</span>
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
                  <span className="flex items-center gap-2 text-[13px] font-bold text-slate-700">{fee(cfg.price)}{service === s.key && <Check size={15} className="text-[#DE5C2B]" />}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 grid md:grid-cols-[1fr_230px] gap-6">
        {/* Calendar */}
        <div ref={dayRef} className="p-1 -m-1">
          <div className="flex items-center justify-between">
            <StepLabel n={2} label="Day" done={!!date} />
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
                  className={`no-shine aspect-square rounded-xl flex flex-col items-center justify-center text-[14px] font-semibold transition-all ${
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
        <div ref={timeRef} className="p-1 -m-1">
          <StepLabel n={3} label="Time" done={!!time} />
          {!date && <p className="mt-3 text-[13px] text-slate-500">Pick a day to see the open times.</p>}
          {date && (
            <>
              <p className="mt-3 text-[13px] font-semibold text-slate-700">{longDate(date)}</p>
              {slots.length === 0 && <p className="mt-3 text-[12.5px] text-slate-400">No open times left on this day.</p>}
              {[['Morning', (t) => t < '12:00'], ['Afternoon', (t) => t >= '12:00' && t < '17:00'], ['Evening', (t) => t >= '17:00']].map(([label, test]) => {
                const list = slots.filter(test);
                if (!list.length) return null;
                return (
                  <div key={label} className="mt-3">
                    <p className="text-[11.5px] text-slate-400">{label}</p>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      {list.map((t) => (
                        <button key={t} type="button" onClick={() => setTime(t)}
                          className={`no-shine h-10 rounded-full border text-[13px] font-semibold cursor-pointer transition-colors ${t === time ? 'bg-[#111] border-[#111] text-white' : 'border-slate-200 text-slate-800 hover:border-[#DE5C2B]'}`}>
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

      <button type="button" onClick={next}
        className={`no-shine mt-7 w-full h-14 rounded-full font-semibold text-[15px] flex items-center justify-between px-6 transition-colors cursor-pointer ${ready ? 'bg-[#DE5C2B] hover:bg-[#C04A1D] text-white' : 'bg-[#FFE7DC] text-[#C04A1D] hover:bg-[#FFDCCB]'}`}>
        <span>{ready ? `Book ${longDate(date)}, ${to12h(time)}` : !service ? 'Step 1: choose a service ↑' : !date ? 'Step 2: pick a day ↑' : 'Step 3: pick a time ↑'}</span>
        <span className="flex items-center gap-2"><span className={`px-2.5 py-0.5 rounded-full text-[12.5px] ${ready ? 'bg-white/20' : 'bg-white'}`}>{fee(cfg.price)}</span><ArrowRight size={17} /></span>
      </button>
      <p className="mt-2 text-[12px] text-slate-500 text-center">{cfg.price ? `Next you add a few details and pay ₹${cfg.price} to confirm your slot.` : 'Next you add a few details to confirm your free slot.'}</p>
    </div>
  );
};

const ConfirmStep = ({ cfg, pick, savedForm }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(savedForm || { name: '', phone: '', email: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [doneRef, setDoneRef] = useState('');
  const [fieldErr, setFieldErr] = useState({});
  const svc = cfg?.services.find((s) => s.key === pick.service);
  const price = cfg?.price ?? 500;
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setFieldErr((x) => ({ ...x, [k]: '' })); };
  const err = (k) => (fieldErr[k] ? <span className="block mt-1 text-[12px] text-red-600">{fieldErr[k]}</span> : null);

  const pay = async (e) => {
    e.preventDefault();
    setError('');
    // Take the student straight to the first field that still needs fixing
    const bad = {
      ...(!form.name.trim() ? { name: 'Please add your full name' } : {}),
      ...(form.phone.replace(/\D/g, '').length < 10 ? { phone: 'Add a 10-digit phone number' } : {}),
      ...(!/^\S+@\S+\.\S+$/.test(form.email) ? { email: 'Add a valid email' } : {}),
    };
    setFieldErr(bad);
    const first = Object.keys(bad)[0];
    if (first) {
      const el = document.querySelector(`[name="${first}"]`);
      flash(el);
      el?.focus({ preventScroll: true });
      return;
    }
    setBusy(true);
    try {
      // Save the enquiry in the CRM even if the payment is not finished
      fetch(`${API}/leads/book-consultation`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, query: `${svc?.label || pick.service} · ${fullDate(pick.date)} ${to12h(pick.time)}. ${form.notes}`, source: price ? 'Paid consultation booking' : 'Free consultation booking' }),
      }).catch(() => {});

      const r = await fetch(`${API}/consultations`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pick, ...form, source: document.referrer ? 'website' : 'direct' }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.status === 409) {
        // Someone took this slot first: back to the calendar, service kept, fresh slots shown
        navigate('/book-consultation', { replace: true, state: { form, pick: { service: pick.service, date: pick.date, time: '' }, notice: `${to12h(pick.time)} on ${longDate(pick.date)} was just booked by someone else. Pick another time, your details stay filled.` } });
        return;
      }
      if (r.status === 429) throw new Error('Too many tries from this network. Please wait a few minutes and try again.');
      if (!r.ok) throw new Error(data.message || 'Could not start the booking');
      if (data.free) {
        // Free call: the slot is already confirmed, no payment step
        setDoneRef(data.ref);
        window.scrollTo(0, 0);
        return;
      }

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
      <style>{`@keyframes bcFlash{0%,100%{box-shadow:0 0 0 0 rgba(222,92,43,0)}30%,70%{box-shadow:0 0 0 6px rgba(222,92,43,.35)}}.bc-flash{animation:bcFlash 1.1s ease 2}`}</style>
      <div className="max-w-[640px] mx-auto">
        <button type="button" onClick={() => navigate('/book-consultation', { state: { pick, form } })} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-[#DE5C2B] cursor-pointer">
          <ArrowLeft size={15} /> Back to calendar
        </button>
        <JourneyPills steps={BOOKING_STEPS} active={1} className="mt-5 mx-auto w-fit max-w-full" />
        <form onSubmit={pay} className="mt-4 rounded-[28px] bg-white border border-slate-200 p-6 sm:p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
          <h1 className="font-outfit text-[28px] sm:text-[32px] font-black text-[#111]">Confirm your consultation</h1>
          <dl className="mt-5 rounded-2xl bg-[#FFF4EE] p-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[14px]">
            <dt className="text-slate-500">Service</dt><dd className="text-right font-semibold text-slate-900">{svc?.label || '…'}</dd>
            <dt className="text-slate-500">When</dt><dd className="text-right font-semibold text-slate-900">{fullDate(pick.date)}, {to12h(pick.time)}</dd>
            <dt className="text-slate-500">Duration</dt><dd className="text-right font-semibold text-slate-900">{cfg?.durationMin || 60} minutes</dd>
            <dt className="text-slate-500">Fee</dt><dd className="text-right font-bold text-[#DE5C2B]">{fee(price)}</dd>
          </dl>

          <p className="mt-6 text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">Your details</p>
          <div className="mt-3 grid sm:grid-cols-2 gap-4">
            <label className="block"><span className="text-[13px] font-semibold text-slate-700">Full name</span><input name="name" className={`${input} mt-1.5 ${fieldErr.name ? 'border-red-400' : ''}`} value={form.name} onChange={set('name')} autoComplete="name" />{err('name')}</label>
            <label className="block"><span className="text-[13px] font-semibold text-slate-700">Phone (WhatsApp)</span><input name="phone" className={`${input} mt-1.5 ${fieldErr.phone ? 'border-red-400' : ''}`} value={form.phone} onChange={set('phone')} placeholder="+91 …" inputMode="tel" autoComplete="tel" />{err('phone')}</label>
          </div>
          <label className="block mt-4"><span className="text-[13px] font-semibold text-slate-700">Email</span><input name="email" className={`${input} mt-1.5 ${fieldErr.email ? 'border-red-400' : ''}`} type="email" value={form.email} onChange={set('email')} autoComplete="email" />{err('email')}</label>
          <label className="block mt-4"><span className="text-[13px] font-semibold text-slate-700">Anything we should know <span className="font-normal text-slate-400">(optional)</span></span>
            <textarea className={`${input} mt-1.5 h-28 py-3 resize-none`} value={form.notes} onChange={set('notes')} placeholder="Country, course, marks, budget, questions…" />
          </label>

          {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}
          <button type="submit" disabled={busy || !cfg}
            className="no-shine mt-6 w-full h-14 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] disabled:opacity-60 text-white font-semibold text-[15px] flex items-center justify-center gap-2 cursor-pointer">
            {busy ? <><Loader2 size={17} className="animate-spin" /> Processing…</> : price ? <>Pay ₹{price} &amp; confirm</> : 'Confirm my free call'}
          </button>
          {price > 0 && <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-slate-500"><ShieldCheck size={13} /> Secure payment by Razorpay: UPI, cards, net banking. See our <Link to="/refund-policy" className="underline">refund policy</Link>.</p>}
        </form>
      </div>
    </Shell>
  );
};

// What the 1:1 video call looks like: the mentor shares a screen with your shortlist while you talk it through
const SHARED_ROWS = [
  ['University College Dublin', 'MSc Cyber Security', 'Reach'],
  ['University of Limerick', 'MSc Cyber Security', 'Good fit'],
  ['Dublin City University', 'MSc Security & Forensics', 'Good fit'],
  ['Munster Tech University', 'MSc Cybersecurity', 'Safe'],
];
const CALL_STEPS = [
  ['Before', 'Video call link aata hai email pe. Bas apne marks aur budget ready rakho.'],
  ['On the call', 'Mentor screen share karke tumhare profile pe real shortlist, fees aur rent dikhata hai.'],
  ['After', 'Shortlist aur next steps tumhare paas, koi pressure nahi.'],
];

const CallPreview = () => (
  <section className="mt-12 grid lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-12 items-center bg-white border border-slate-200 rounded-[28px] p-6 sm:p-10">
    <div>
      <h2 className="font-outfit text-[28px] sm:text-[36px] font-black tracking-[-0.03em] leading-[1.08] text-[#111]">Call pe asli mein kya hota hai</h2>
      <p className="mt-3 text-[15px] text-slate-600 leading-relaxed max-w-md">1:1 video call, ek ghanta. Koi sales pitch nahi.</p>
      <ol className="mt-6 space-y-4">
        {CALL_STEPS.map(([t, d], i) => (
          <li key={t} className="flex gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-[#16130F] text-white grid place-items-center text-[12.5px] font-bold">{i + 1}</span>
            <div>
              <p className="text-[14.5px] font-bold text-[#16130F]">{t}</p>
              <p className="text-[13.5px] text-slate-600 leading-snug">{d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>

    {/* video call window, an illustration of a typical call */}
    <figure aria-label="Example of a 1:1 video call" className="relative rounded-[18px] bg-[#1F1F1F] p-3 sm:p-4 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.6)]">
      <div className="flex items-center justify-between text-[11.5px] text-white/70 px-1 pb-2.5">
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#E5484D]" /> 1:1 session · 24:18</span>
        <span>Mentor is presenting</span>
      </div>
      <div className="relative rounded-[12px] bg-white overflow-hidden">
        {/* the shared screen: a shortlist */}
        <div className="px-4 pt-3.5 pb-24 sm:pb-[6.5rem]">
          <p className="text-[12px] font-bold text-[#16130F]">Shortlist · Ireland · Cyber Security · Budget ₹20L</p>
          <div className="mt-2.5 divide-y divide-slate-100 text-[11.5px] sm:text-[12.5px]">
            {SHARED_ROWS.map(([u, c, fit]) => (
              <div key={u} className="grid grid-cols-[1.4fr_1.3fr_0.7fr] gap-2 py-1.5 items-center">
                <span className="font-semibold text-[#16130F] truncate">{u}</span>
                <span className="text-slate-500 truncate">{c}</span>
                <span className={`justify-self-start px-2 py-0.5 rounded-full text-[10.5px] font-bold ${fit === 'Reach' ? 'bg-[#FDE3DA] text-[#86351A]' : fit === 'Safe' ? 'bg-[#E4F3EA] text-[#1E6B47]' : 'bg-[#FFF4CC] text-[#7A5A00]'}`}>{fit}</span>
              </div>
            ))}
          </div>
        </div>
        {/* live caption */}
        <p className="absolute left-3 right-[34%] bottom-3 rounded-md bg-black/75 px-2.5 py-1.5 text-[11.5px] sm:text-[12.5px] leading-snug text-white">
          <span className="font-bold text-[#F5B48C]">Mentor:</span> UCD reach hai, Limerick aur DCU tumhare marks pe fit hain.
        </p>
        {/* self view */}
        <div className="absolute right-3 bottom-3 w-[28%] aspect-video rounded-lg bg-[#3A3A3A] grid place-items-center border border-white/20">
          <span className="w-8 h-8 rounded-full bg-[#5B544A] grid place-items-center text-white text-[12px] font-bold">You</span>
        </div>
      </div>
      {/* mentor tile + call controls */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-[#2C2C2C] px-2.5 py-1.5">
          <span className="w-7 h-7 rounded-full bg-[#DE5C2B] grid place-items-center text-white text-[12px] font-bold">M</span>
          <span className="text-[12px] text-white">Mentor · Ireland</span>
        </div>
        <div className="flex items-center gap-2" aria-hidden="true">
          {[Mic, Video, MonitorUp].map((Icon, i) => (
            <span key={i} className="w-9 h-9 rounded-full bg-[#3C3C3C] grid place-items-center text-white"><Icon size={16} /></span>
          ))}
          <span className="w-11 h-9 rounded-full bg-[#E5484D] grid place-items-center text-white"><PhoneOff size={16} /></span>
        </div>
      </div>
      <figcaption className="mt-2.5 text-center text-[11px] text-white/50">Example call. Your shortlist depends on your profile.</figcaption>
    </figure>
  </section>
);

// Start each visit fresh (e.g. sent back to the calendar because the slot was taken), using what
// the navigation carried in its state instead of whatever the previous screen had picked
const BookConsultationPage = () => {
  const { key } = useLocation();
  return <BookConsultationFlow key={key} />;
};

export default BookConsultationPage;
