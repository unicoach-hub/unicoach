// ════════════════════════════════════════════════════════════════════════════════
// MentorDashboardPreview.jsx — "This is the dashboard you get" section for /unicoach/for-mentors
// A clickable, illustrative replica of the real mentor dashboard (same section names and layout),
// filled with sample data: real dashboards contain students' personal details and must not be shown.
// Desi Pop: flat cream section, ink-bordered browser window, poster-colour chips.
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import {
  Home,
  Calendar,
  MessageSquare,
  CalendarDays,
  Wallet,
  Share2,
  Eye,
  TrendingUp,
  Users,
  Video,
  Clock,
  Copy,
  QrCode,
  CheckCircle2,
  Globe2,
  Lock,
} from 'lucide-react';

const ACCENT = '#DE5C2B';
const VIEW_MS = 6500;

const NAV = [
  { id: 'overview', label: 'Home', icon: Home, caption: 'Your week at a glance: profile views, earnings and bookings.' },
  { id: 'bookings', label: 'Bookings & Sessions', icon: Calendar, badge: 3, caption: 'Every upcoming call with the student’s intake answers and a join button.' },
  { id: 'priority_dms', label: 'Priority DMs & Requests', icon: MessageSquare, badge: 2, caption: 'Paid questions waiting for you, sorted by reply deadline.' },
  { id: 'calendar', label: 'Calendar & Slots', icon: CalendarDays, caption: 'Open slots in your own time zone; students see them in theirs.' },
  { id: 'payouts', label: 'Earnings', icon: Wallet, caption: 'What each booking earned you and the status of every payout.' },
  { id: 'share_grow', label: 'Share & Grow', icon: Share2, caption: 'Your page link and QR code for Instagram, YouTube and WhatsApp.' },
];

const Initials = ({ name, color = '#8A8174' }) => (
  <span className="w-8 h-8 rounded-full text-white text-[10.5px] font-black flex items-center justify-center shrink-0 border-2 border-[#16130F]" style={{ backgroundColor: color }}>
    {name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
  </span>
);

const Panel = ({ title, subtitle, right, children }) => (
  <div className="h-full flex flex-col">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <h4 className="font-urbanist text-[17px] font-black text-[#16130F] leading-tight tracking-[-0.02em]">{title}</h4>
        {subtitle && <p className="text-[11.5px] text-[#5B544A] mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

// ── Home: KPI cards + 7-day chart ──
const WEEK = [
  { d: 'Mon', v: 38 }, { d: 'Tue', v: 52 }, { d: 'Wed', v: 45 }, { d: 'Thu', v: 70 },
  { d: 'Fri', v: 64 }, { d: 'Sat', v: 92 }, { d: 'Sun', v: 81 },
];
const OverviewView = ({ reduced }) => (
  <Panel title="Welcome back, Your Name 👋" subtitle="Last 7 days">
    <div className="grid grid-cols-3 gap-2 mb-3">
      {[
        { label: 'Profile Views', short: 'Views', value: '1,284', icon: Eye, tone: 'text-[#2B3FA0]', delta: '+18%' },
        { label: 'Gross Volume (₹)', short: 'Earned', value: '₹24,850', icon: TrendingUp, tone: 'text-[#14837E]', delta: '+₹6,200' },
        { label: 'Bookings Count', short: 'Bookings', value: '17', icon: Users, tone: 'text-[#DE5C2B]', delta: '+5' },
      ].map((k) => (
        <div key={k.label} className="min-w-0 rounded-xl border-2 border-[#16130F] bg-[#FFF6E5] px-2.5 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <k.icon className={`w-3.5 h-3.5 shrink-0 ${k.tone}`} />
            {/* Short label on phones, where three tiles share one row */}
            <span className="text-[9.5px] sm:text-[10px] font-bold text-[#5B544A] truncate"><span className="sm:hidden">{k.short}</span><span className="hidden sm:inline">{k.label}</span></span>
          </div>
          <div className="font-urbanist text-sm sm:text-base font-black text-[#16130F]">{k.value}</div>
          <span className="block text-[9.5px] font-bold text-[#14837E] whitespace-nowrap">{k.delta}<span className="hidden sm:inline"> this week</span></span>
        </div>
      ))}
    </div>
    <div className="rounded-xl border-2 border-[#16130F] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-[#16130F]">Profile views</span>
        <span className="text-[10px] text-[#5B544A]">Mon – Sun</span>
      </div>
      <div className="flex items-end justify-between gap-1.5 h-[88px]">
        {WEEK.map((w, i) => (
          <div key={w.d} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <motion.div
              className="w-full rounded-t-md border-2 border-b-0 border-[#16130F]"
              style={{ backgroundColor: i === 5 ? ACCENT : '#F2B705' }}
              initial={{ height: reduced ? `${w.v}%` : 0 }}
              animate={{ height: `${w.v}%` }}
              transition={{ duration: 0.6, delay: reduced ? 0 : i * 0.06, ease: 'easeOut' }}
            />
            <span className="text-[9px] text-[#5B544A] font-semibold">{w.d}</span>
          </div>
        ))}
      </div>
    </div>
  </Panel>
);

// ── Bookings & Sessions ──
const SESSIONS = [
  { name: 'Ananya Iyer', service: '45-min Admit Strategy Call', when: 'Today · 6:30 PM IST', note: 'Target: TCD, UCD · CGPA 8.4 · Budget ₹25L', live: true },
  { name: 'Rohit Sinha', service: 'Mock Visa Interview', when: 'Sat · 7:00 PM IST', note: 'Stamp 2 interview in 3 weeks' },
  { name: 'Meera Nair', service: 'Session pack · call 2 of 3', when: 'Sun · 11:00 AM IST', note: 'SOP draft v2 shared' },
];
const BookingsView = () => (
  <Panel title="Bookings & Sessions" subtitle="3 upcoming this week" right={<span className="shrink-0 text-[10px] font-bold text-white bg-[#14837E] border-2 border-[#16130F] px-2 py-0.5 rounded-full">All paid</span>}>
    <div className="space-y-2">
      {SESSIONS.map((s, i) => (
        <motion.div
          key={s.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl border-2 border-[#16130F] bg-white px-2.5 py-2 flex items-center gap-3"
        >
          <Initials name={s.name} color={i === 0 ? ACCENT : undefined} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-black text-[#16130F]">{s.name}</span>
              <span className="text-[10px] font-semibold text-[#5B544A]">{s.service}</span>
            </div>
            <div className="text-[10.5px] text-[#5B544A] truncate">
              <Clock className="w-3 h-3 inline -mt-0.5 mr-1" />{s.when}
              <span className="hidden sm:inline"> · “{s.note}”</span>
            </div>
          </div>
          {s.live ? (
            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[10.5px] font-bold border-2 border-[#16130F] shadow-[2px_2px_0_#16130F]" style={{ backgroundColor: ACCENT }}>
              <Video className="w-3 h-3" /> Join
            </span>
          ) : (
            <span className="shrink-0 text-[10px] font-bold text-[#16130F] bg-[#FFF6E5] border-2 border-[#16130F] px-2 py-0.5 rounded-full">Confirmed</span>
          )}
        </motion.div>
      ))}
    </div>
  </Panel>
);

// ── Priority DMs ──
const DMS = [
  { name: 'Rahul Verma', q: 'Is 8.2 CGPA + GRE 318 enough for TU Munich MSc Informatics?', due: 'Reply in 5h', urgent: true },
  { name: 'Sneha Kapoor', q: 'Which is better for data science jobs: UCD or Trinity?', due: 'Reply in 21h' },
  { name: 'Arjun Das', q: 'How much should I show in my blocked account for 2027?', answered: true },
];
const DmsView = () => (
  <Panel title="Priority DMs & Requests" subtitle="Students paid ₹199 per question" right={<span className="shrink-0 text-[10px] font-bold text-[#16130F] bg-[#F2B705] border-2 border-[#16130F] px-2 py-0.5 rounded-full">2 pending</span>}>
    <div className="space-y-2">
      {DMS.map((m, i) => (
        <motion.div
          key={m.name}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`rounded-xl border-2 px-2.5 py-2 ${m.answered ? 'border-[#16130F]/20 bg-[#FFF6E5]' : 'border-[#16130F] bg-white'}`}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <Initials name={m.name} color={m.urgent ? ACCENT : undefined} />
              <span className="text-[12px] font-black text-[#16130F] truncate">{m.name}</span>
            </div>
            {m.answered ? (
              <span className="shrink-0 text-[10px] font-bold text-[#14837E] inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Answered</span>
            ) : (
              <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#16130F] ${m.urgent ? 'text-white bg-[#D0362E]' : 'text-[#16130F] bg-[#F2B705]'}`}>⏱ {m.due}</span>
            )}
          </div>
          <p className="text-[11.5px] text-[#3D3830] pl-10 line-clamp-2">{m.q}</p>
        </motion.div>
      ))}
    </div>
  </Panel>
);

// ── Calendar & Slots: mentor time vs student time ──
const DAYS = ['Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = { Thu: ['13:00'], Fri: ['13:00', '14:00'], Sat: ['11:00', '13:30'], Sun: ['10:00'] };
const BOOKED = 'Sat-13:30';
const toIst = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + 330; // Dublin (winter, UTC+0) → IST (UTC+5:30)
  const hh = Math.floor(total / 60) % 24;
  const mm = String(total % 60).padStart(2, '0');
  return `${((hh + 11) % 12) + 1}:${mm} ${hh >= 12 ? 'PM' : 'AM'}`;
};
const to12 = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const CalendarView = () => (
  <Panel
    title="Calendar & Slots"
    subtitle="You set times in Dublin time; students in India see IST"
    right={<span className="shrink-0 text-[10px] font-bold text-[#16130F] bg-[#DDF3EF] border-2 border-[#16130F] px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Globe2 className="w-3 h-3" /> Europe/Dublin</span>}
  >
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
      {DAYS.map((d) => (
        <div key={d} className="min-w-0 rounded-xl border-2 border-[#16130F] bg-[#FFF6E5] p-1.5 sm:p-2">
          <div className="text-[10px] font-black text-[#16130F] text-center mb-1.5">{d}</div>
          <div className="space-y-1.5">
            {SLOTS[d].map((t, i) => {
              const booked = `${d}-${t}` === BOOKED;
              return (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  className={`rounded-lg px-1 sm:px-1.5 py-1.5 text-center border-2 ${booked ? 'text-white border-[#16130F]' : 'bg-white border-[#16130F]/25'}`}
                  style={booked ? { backgroundColor: ACCENT } : undefined}
                >
                  <div className={`text-[10.5px] font-black ${booked ? '' : 'text-[#16130F]'}`}>{to12(t)}</div>
                  <div className={`text-[9px] font-semibold ${booked ? 'text-white/85' : 'text-[#5B544A]'}`}>{toIst(t)} IST</div>
                  {booked && <div className="text-[8.5px] font-bold mt-0.5">Booked</div>}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
    <p className="text-[11px] text-[#5B544A] mt-3 flex items-center gap-1.5">
      <Clock className="w-3 h-3" /> Buffer time between calls and daylight-saving changes are handled automatically.
    </p>
  </Panel>
);

// ── Earnings ──
const LEDGER = [
  { what: '45-min Admit Strategy Call · Ananya I.', amt: '₹999', status: 'Paid out', tone: 'text-white bg-[#14837E]' },
  { what: 'Priority DM · Rahul V.', amt: '₹199', status: 'Processing', tone: 'text-[#16130F] bg-[#F2B705]' },
  { what: 'Ireland SOP Template Pack · Sneha K.', amt: '₹299', status: 'Paid out', tone: 'text-white bg-[#14837E]' },
  { what: 'Session pack (3 calls) · Meera N.', amt: '₹2,499', status: 'Paid out', tone: 'text-white bg-[#14837E]' },
];
const EarningsView = () => (
  <Panel title="Earnings" subtitle="Every rupee, booking by booking">
    <div className="grid grid-cols-2 gap-2 mb-2.5">
      <div className="rounded-xl px-3 py-2.5 text-white border-2 border-[#16130F] shadow-[3px_3px_0_#16130F]" style={{ backgroundColor: ACCENT }}>
        <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">This month</span>
        <div className="font-urbanist text-xl font-black">₹24,850</div>
        <span className="text-[10px] font-semibold opacity-90">0% platform fee</span>
      </div>
      <div className="rounded-xl px-3 py-2.5 border-2 border-[#16130F] bg-[#FFF6E5]">
        <span className="text-[10px] font-bold uppercase tracking-wide text-[#5B544A]">Processing</span>
        <div className="font-urbanist text-xl font-black text-[#16130F]">₹199</div>
        <span className="text-[10px] font-semibold text-[#5B544A]">to your bank / UPI</span>
      </div>
    </div>
    <div className="space-y-1.5">
      {LEDGER.map((l, i) => (
        <motion.div
          key={l.what}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center justify-between gap-2 rounded-lg border-2 border-[#16130F]/20 px-2.5 py-1.5"
        >
          <span className="text-[11px] font-semibold text-[#16130F] truncate">{l.what}</span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="text-[11.5px] font-black text-[#16130F]">{l.amt}</span>
            <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md border-[1.5px] border-[#16130F] ${l.tone}`}>{l.status}</span>
          </span>
        </motion.div>
      ))}
    </div>
  </Panel>
);

// ── Share & Grow ──
const QR_CELLS = Array.from({ length: 81 }, (_, i) => ((i * 7 + (i % 5) * 3 + Math.floor(i / 9)) % 3 === 0));
const ShareView = () => (
  <Panel title="Share & Grow" subtitle="Put your link where your followers already are">
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
      <div className="sm:col-span-3 space-y-2">
        <div className="rounded-xl border-2 border-[#16130F] bg-[#FFF6E5] px-3 py-2.5 flex items-center justify-between gap-2">
          <span className="text-[12px] font-bold text-[#16130F] truncate">unicoach.com/@yourname</span>
          <span className="shrink-0 inline-flex items-center gap-1 text-[10.5px] font-bold text-white px-2.5 py-1 rounded-full border-2 border-[#16130F] shadow-[2px_2px_0_#16130F]" style={{ backgroundColor: ACCENT }}>
            <Copy className="w-3 h-3" /> Copy
          </span>
        </div>
        {['Instagram bio', 'YouTube description', 'WhatsApp status', 'LinkedIn featured'].map((p, i) => (
          <motion.div
            key={p}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="text-[11.5px] font-semibold text-[#16130F] flex items-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#14837E]" /> {p}
          </motion.div>
        ))}
      </div>
      <div className="sm:col-span-2 flex flex-col items-center">
        <div className="p-2.5 rounded-xl bg-white border-2 border-[#16130F] shadow-[3px_3px_0_#16130F]">
          <div className="relative w-24 h-24">
            <div className="grid grid-cols-9 gap-[2px] w-full h-full">
              {QR_CELLS.map((on, i) => (
                <span key={i} className="rounded-[1px]" style={{ backgroundColor: on ? '#16130F' : 'transparent' }} />
              ))}
            </div>
            {/* QR finder squares */}
            {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0'].map((pos) => (
              <span key={pos} className={`absolute ${pos} w-7 h-7 bg-white p-[3px]`}>
                <span className="block w-full h-full border-[3px] border-[#16130F] p-[3px]">
                  <span className="block w-full h-full bg-[#16130F]" />
                </span>
              </span>
            ))}
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#5B544A] mt-1.5 inline-flex items-center gap-1"><QrCode className="w-3 h-3" /> Download QR</span>
      </div>
    </div>
  </Panel>
);

const VIEWS = {
  overview: OverviewView,
  bookings: BookingsView,
  priority_dms: DmsView,
  calendar: CalendarView,
  payouts: EarningsView,
  share_grow: ShareView,
};

export const MentorDashboardPreview = () => {
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const ref = useRef(null);
  const tabsRef = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduced = useReducedMotion();
  const cycling = inView && autoPlay && !reduced;

  useEffect(() => {
    if (!cycling) return undefined;
    const t = setTimeout(() => setActive((i) => (i + 1) % NAV.length), VIEW_MS);
    return () => clearTimeout(t);
  }, [active, cycling]);

  // Mobile: the tab row scrolls sideways, keep the active tab visible (without scrolling the page)
  useEffect(() => {
    const row = tabsRef.current;
    const btn = row?.querySelector(`[data-tab="${active}"]`);
    if (!row || !btn || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: btn.offsetLeft - (row.clientWidth - btn.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
  }, [active, reduced]);

  const pick = (i) => {
    setAutoPlay(false);
    setActive(i);
  };

  const item = NAV[active];
  const View = VIEWS[item.id];

  return (
    <section ref={ref} id="mentor-dashboard" className="py-10 sm:py-14 px-4 sm:px-6 lg:px-12 bg-[#FFF6E5] overflow-hidden">
      <div className="max-w-[980px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-7">
          <p className="font-urbanist font-extrabold text-[16px] text-[#D0362E]">Andar se dekh lo</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#14837E] text-white border-2 border-[#16130F] shadow-[2px_2px_0_#16130F] text-[12px] font-extrabold uppercase tracking-[0.08em] -rotate-1">
            <Lock className="w-3.5 h-3.5" /> Your private mentor dashboard
          </div>
          <h2 className="mt-3 font-urbanist text-[30px] sm:text-[40px] font-black text-[#16130F] leading-[1] tracking-[-0.045em]">
            See exactly what you get, <span className="text-[#DE5C2B]">before you sign up</span>
          </h2>
          <p className="text-[#16130F]/80 text-[15px] sm:text-[16px] font-medium mt-2">
            Bookings, paid questions, your calendar and every rupee you earn, in one dashboard. Click around: this is the same layout you will use.
          </p>
        </div>

        {/* ════════ BROWSER WINDOW ════════ */}
        <div className="rounded-[18px] sm:rounded-[22px] bg-white border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] sm:shadow-[8px_8px_0_#16130F] overflow-hidden">
          {/* Window bar */}
          <div className="flex items-center gap-3 px-3.5 py-2 border-b-[3px] border-[#16130F] bg-[#F2B705]">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#D0362E] border-2 border-[#16130F]" />
              <span className="w-3 h-3 rounded-full bg-white border-2 border-[#16130F]" />
              <span className="w-3 h-3 rounded-full bg-[#14837E] border-2 border-[#16130F]" />
            </div>
            <div className="flex-1 min-w-0 max-w-md mx-auto rounded-full bg-white border-2 border-[#16130F] px-3 py-1 text-[11px] font-semibold text-[#16130F] text-center truncate">
              <Lock className="w-3 h-3 inline -mt-0.5 mr-1 text-[#14837E]" />unicoach.com/unicoach/dashboard
            </div>
            <span className="hidden sm:block w-12" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
            {/* Sidebar (horizontal tabs on mobile) */}
            <nav className="min-w-0 border-b-2 md:border-b-0 md:border-r-2 border-[#16130F] p-2 md:p-2.5 bg-[#FFF6E5]" aria-label="Dashboard preview sections">
              <div className="hidden md:flex items-center gap-2 px-1.5 pb-2.5 mb-1.5 border-b-2 border-dashed border-[#16130F]/20">
                <span className="w-8 h-8 rounded-full text-white text-[11px] font-black flex items-center justify-center border-2 border-[#16130F]" style={{ backgroundColor: ACCENT }}>YN</span>
                <div className="min-w-0">
                  <div className="text-[12px] font-black text-[#16130F] leading-tight">Your Name</div>
                  <div className="text-[10px] font-semibold text-[#14837E] inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified mentor</div>
                </div>
              </div>
              <div ref={tabsRef} className="relative flex md:flex-col gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {NAV.map((n, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      data-tab={i}
                      onClick={() => pick(i)}
                      aria-pressed={isActive}
                      className={`relative shrink-0 flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-[12px] font-bold transition-colors cursor-pointer whitespace-nowrap overflow-hidden no-shine border-2 ${
                        isActive ? 'bg-white text-[#16130F] border-[#16130F] shadow-[2px_2px_0_#16130F]' : 'text-[#16130F]/75 border-transparent hover:bg-white/60'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <n.icon className="w-4 h-4" style={{ color: isActive ? ACCENT : '#5B544A' }} />
                        {n.label}
                      </span>
                      {n.badge && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold border-[1.5px] border-[#16130F]" style={isActive ? { backgroundColor: ACCENT, color: '#fff' } : { backgroundColor: '#FFFFFF', color: '#16130F' }}>
                          {n.badge}
                        </span>
                      )}
                      {isActive && cycling && (
                        <motion.span
                          key={`bar-${i}`}
                          className="absolute left-2 right-2 bottom-0.5 h-[2px] rounded-full"
                          style={{ backgroundColor: ACCENT }}
                          initial={{ scaleX: 0, originX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: VIEW_MS / 1000, ease: 'linear' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Main view */}
            <div className="min-w-0 p-4 sm:p-5 bg-white relative min-h-[330px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="h-full"
                >
                  <View reduced={reduced} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Caption for the active view */}
        <div className="mt-5 min-h-[44px] flex flex-col items-center gap-0.5 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[15px] font-semibold text-[#16130F]"
            >
              <span className="font-black" style={{ color: ACCENT }}>{item.label}:</span> {item.caption}
            </motion.p>
          </AnimatePresence>
          <span className="text-[12.5px] text-[#5B544A]">Sample data shown. Your dashboard fills with your own students and bookings.</span>
        </div>
      </div>
    </section>
  );
};
