import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, CalendarCheck, Check, Compass, FileText, Loader2, Plane, Wallet } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { HookBand } from '../components/ui/Infographics';

const API = API_BASE_URL.replace(/\/$/, '');
const GROUP_ICON = { plan: Compass, apply: FileText, fund: Wallet, visa: Plane };
const JOURNEY = ['First call', 'Shortlist', 'Applications', 'Funding', 'Visa', 'You fly'];

// Hero infographic 1: a booking that fills itself in, again and again
const BookingLoop = ({ services, price }) => {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [step, setStep] = useState(0); // 0 service, 1 slot, 2 paid
  useEffect(() => {
    if (reduce || !services.length) return undefined;
    const t = setTimeout(() => {
      if (step < 2) setStep(step + 1);
      else { setStep(0); setI((x) => (x + 1) % services.length); }
    }, step === 2 ? 1600 : 1100);
    return () => clearTimeout(t);
  }, [step, services.length, reduce]);
  const svc = services[i];
  const slots = ['Today · 8:00 PM', 'Tomorrow · 1:00 PM', 'Sat · 2:00 PM', 'Mon · 8:00 PM'];
  if (!svc) return null;
  return (
    <div className="rounded-[22px] bg-white border border-slate-200 p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
        <span>Booking a call</span>
        <span className="flex items-center gap-1.5 normal-case tracking-normal font-semibold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live demo</span>
      </div>
      <div className="mt-4 space-y-2.5">
        {[
          ['Service', svc.label],
          ['When', slots[i % slots.length]],
          price ? ['Paid', `₹${price} · UPI`] : ['Fee', 'Free'],
        ].map(([k, v], idx) => (
          <div key={k} className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border transition-colors duration-300 ${step === idx ? 'border-[#DE5C2B] bg-[#FFF4EE]' : step > idx ? 'border-slate-100 bg-slate-50' : 'border-dashed border-slate-200'}`}>
            <span className="text-[12px] text-slate-500">{k}</span>
            <AnimatePresence mode="wait">
              {step >= idx ? (
                <motion.span key={`${i}-${k}`} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
                  {v}{step > idx && <Check size={14} className="text-emerald-600" />}
                </motion.span>
              ) : <span className="text-[12px] text-slate-300">…</span>}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-700 px-3.5 py-2.5 text-[13px] font-semibold">
            <CalendarCheck size={16} /> Confirmed. Details sent by email.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Hero infographic 2: the road from first call to flying out, lighting up step by step
const JourneyLoop = () => {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? JOURNEY.length : 0);
  useEffect(() => {
    if (reduce) return undefined;
    const t = setTimeout(() => setN((x) => (x >= JOURNEY.length ? 0 : x + 1)), n >= JOURNEY.length ? 1800 : 700);
    return () => clearTimeout(t);
  }, [n, reduce]);
  return (
    <div className="rounded-[22px] bg-[#111] text-white p-5">
      <p className="text-[11px] font-bold tracking-[0.14em] text-white/50 uppercase">From first call to flight</p>
      <div className="mt-4 relative">
        <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-white/10" />
        <motion.div className="absolute left-[11px] top-2 w-[2px] bg-[#DE5C2B]" animate={{ height: `${(Math.min(n, JOURNEY.length - 1) / (JOURNEY.length - 1)) * 92}%` }} transition={{ duration: 0.5 }} />
        <ul className="space-y-2.5 relative">
          {JOURNEY.map((j, idx) => {
            const on = idx < n;
            return (
              <li key={j} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold transition-colors duration-300 ${on ? 'bg-[#DE5C2B] text-white' : 'bg-white/10 text-white/40'}`}>
                  {on ? <Check size={12} strokeWidth={3} /> : idx + 1}
                </span>
                <span className={`text-[13.5px] transition-colors duration-300 ${on ? 'text-white font-semibold' : 'text-white/40'}`}>{j}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

const ServiceCard = ({ s, n, price }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.article layout className="group rounded-[20px] bg-white border border-slate-200 hover:border-orange-200 hover:shadow-[0_18px_40px_-24px_rgba(222,92,43,0.45)] p-5 flex flex-col transition-shadow">
      <div className="flex items-start justify-between">
        <span className="font-outfit text-[30px] font-black text-slate-200 leading-none group-hover:text-orange-200 transition-colors">{String(n).padStart(2, '0')}</span>
        <span className="text-[12px] font-bold text-[#DE5C2B] bg-[#FFF4EE] rounded-full px-2.5 py-0.5">{price ? `₹${price}` : 'Free'}</span>
      </div>
      <h3 className="mt-3 text-[16.5px] font-bold text-slate-900">{s.label}</h3>
      <p className="mt-1 text-[13.5px] text-slate-500 leading-relaxed">{s.desc}</p>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3 space-y-1.5">
            {(s.points || []).map((p) => (
              <li key={p} className="flex gap-2 text-[13px] text-slate-700"><Check size={14} className="mt-0.5 text-[#DE5C2B] shrink-0" />{p}</li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <div className="mt-auto pt-4 flex items-center justify-between">
        <button type="button" onClick={() => setOpen((v) => !v)} className="no-shine inline-flex items-center gap-1 text-[13px] font-semibold text-[#DE5C2B] hover:underline cursor-pointer">
          {open ? 'Show less' : 'Read more'} <ArrowUpRight size={14} className={open ? 'rotate-90 transition-transform' : 'transition-transform'} />
        </button>
        <Link to={`/book-consultation?service=${s.key}`} className="no-shine inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#111] hover:bg-[#DE5C2B] text-white text-[13px] font-semibold transition-colors">
          Book now
        </Link>
      </div>
    </motion.article>
  );
};

// /services: every 1:1 call we offer, grouped, each bookable straight into /book-consultation
const ServicesPage = () => {
  const [cfg, setCfg] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'All services | UniCoach';
    fetch(`${API}/consultations/config`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Could not load services'))))
      .then(setCfg)
      .catch((e) => setError(e.message));
  }, []);

  const groups = cfg?.groups || [];
  const services = cfg?.services || [];
  // Numbers run across groups: 01, 02 … in the order shown
  const numberOf = Object.fromEntries(groups.flatMap((g) => services.filter((s) => s.group === g.key)).map((s, i) => [s.key, i + 1]));

  return (
    <main className="min-h-screen bg-[#FAF9F6] pt-[110px] pb-20 px-4 sm:px-6">
      <div className="max-w-[1180px] mx-auto">
        {/* Hero */}
        <section className="grid lg:grid-cols-[1.05fr_1fr] gap-8 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4EE] border border-orange-100 text-[12px] font-bold text-[#C04A1D] uppercase tracking-[0.1em]">For students</span>
              {cfg && <span className="px-2.5 py-1 rounded-full border border-slate-200 text-[11.5px] font-semibold text-slate-600">{services.length} services</span>}
              <span className="px-2.5 py-1 rounded-full border border-slate-200 text-[11.5px] font-semibold text-slate-600">{cfg && !cfg.price ? 'Free' : `₹${cfg?.price ?? 500} each`}</span>
            </div>
            <h1 className="mt-4 font-outfit text-[38px] sm:text-[52px] font-black tracking-tight text-[#111] leading-[1.05]">
              Every step abroad,<br /><span className="text-[#DE5C2B]">one 1:1 call away</span>
            </h1>
            <p className="mt-4 text-[16px] text-slate-600 max-w-lg leading-relaxed">
              Pick what you need help with, choose a time, and talk to our team for {cfg?.durationMin || 60} minutes. Counselling, shortlisting, SOPs, funding and visas, all in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/book-consultation" className="no-shine inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] text-white font-semibold text-[14.5px] transition-colors">
                Book a consultation <ArrowRight size={16} />
              </Link>
              <a href="#all-services" className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-slate-300 bg-white text-slate-800 font-semibold text-[14.5px] hover:border-[#DE5C2B]">
                See all services
              </a>
            </div>
          </div>
          <div className="grid sm:grid-cols-[1.25fr_1fr] gap-4">
            <BookingLoop services={services} price={cfg?.price ?? 500} />
            <JourneyLoop />
          </div>
        </section>

        {/* Hook: one call length, straight from the config */}
        <HookBand
          value={`${cfg?.durationMin || 60} min`}
          label="One 1:1 call with our team. Counselling, shortlisting, SOPs, funding and visas, all in one place."
          hi="एक कॉल"
          className="mt-12"
        />

        {/* All services */}
        <section id="all-services" className="mt-16 scroll-mt-28">
          <p className="text-[11px] font-bold tracking-[0.16em] text-slate-400 uppercase">Everything we do</p>
          <h2 className="mt-1 font-outfit text-[30px] sm:text-[36px] font-black text-[#111]">All services, one place</h2>
          {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
          {!cfg && !error && <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#DE5C2B]" /></div>}

          <div className="mt-6 space-y-10">
            {groups.map((g) => {
              const list = services.filter((s) => s.group === g.key);
              const Icon = GROUP_ICON[g.key] || Compass;
              return (
                <div key={g.key}>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-orange-100 text-[12px] font-bold tracking-[0.1em] text-[#C04A1D] uppercase"><Icon size={14} /> {g.label}</span>
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 grid place-items-center">{list.length}</span>
                  </div>
                  <div className="mt-3 flex flex-col md:flex-row gap-3 [&>*]:flex-1 [&>*]:min-w-0">
                    {list.map((s) => <ServiceCard key={s.key} s={s} n={numberOf[s.key]} price={cfg.price} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom strip */}
        {cfg && (
          <section className="mt-16 rounded-[28px] bg-white border border-slate-200 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-outfit text-[24px] sm:text-[28px] font-black text-[#111]">One team, from first call to visa</h2>
                <p className="mt-1 text-[14px] text-slate-500 max-w-xl">Start with one call. Book the next one whenever you reach the next step.</p>
              </div>
              <Link to="/book-consultation" className="no-shine inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] text-white font-semibold text-[14.5px]">Book a consultation <ArrowUpRight size={16} /></Link>
            </div>
            <ol className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {groups.map((g, idx) => {
                const Icon = GROUP_ICON[g.key] || Compass;
                return (
                  <motion.li key={g.key} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.12 }}
                    className="rounded-2xl bg-[#FAF9F6] p-4">
                    <span className="w-9 h-9 rounded-full bg-[#DE5C2B] text-white grid place-items-center"><Icon size={16} /></span>
                    <p className="mt-2 text-[11px] font-bold text-slate-400">STEP {idx + 1}</p>
                    <p className="text-[14px] font-semibold text-slate-900">{g.label}</p>
                  </motion.li>
                );
              })}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
};

export default ServicesPage;
