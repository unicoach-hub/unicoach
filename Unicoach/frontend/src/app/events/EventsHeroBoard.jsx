// Events hero pieces: the featured session as a boarding pass, and the day's sessions as a departure board.
// Everything is built from the real events (title, host, start time, location); nothing is invented.
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Plane, ArrowRight, Radio } from 'lucide-react';

const COUNTRIES = [
  ['IRL', 'Ireland', /ireland|dublin/i],
  ['AUS', 'Australia', /australia|go8|sydney|melbourne/i],
  ['GBR', 'United Kingdom', /\buk\b|united kingdom|britain|england|london/i],
  ['DEU', 'Germany', /germany|german|munich|berlin/i],
  ['CAN', 'Canada', /canada|toronto|vancouver/i],
  ['USA', 'United States', /\busa\b|united states|america/i],
  ['NZL', 'New Zealand', /new zealand|auckland/i],
  ['FRA', 'France', /france|paris/i],
  ['ITA', 'Italy', /italy|milan|rome/i],
  ['NLD', 'Netherlands', /netherlands|dutch|amsterdam/i],
  ['SGP', 'Singapore', /singapore/i],
  ['EUR', 'Europe', /europe|schengen/i],
];

// Destination of a session: the event's country, else its title, else its tags
const eventDestination = (ev) => {
  const sources = [ev?.country, ev?.title, (ev?.tags || []).join(' ')];
  for (const text of sources) {
    if (!text) continue;
    const hit = COUNTRIES.find(([, , re]) => re.test(text));
    if (hit) return { code: hit[0], name: hit[1] };
  }
  return { code: 'WLD', name: 'Worldwide' };
};

const hostFirstName = (speaker) => String(speaker || '').split('(')[0].trim();

const useNow = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

const Countdown = ({ start, end }) => {
  const now = useNow();
  const startTs = new Date(start).getTime();
  const endTs = end ? new Date(end).getTime() : startTs;
  if (now >= startTs) {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-black text-emerald-600">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {now < endTs ? 'Boarding now: session is live' : 'This session has started'}
      </p>
    );
  }
  const total = Math.floor((startTs - now) / 1000);
  const units = [
    ['Days', Math.floor(total / 86400)],
    ['Hrs', Math.floor((total % 86400) / 3600)],
    ['Min', Math.floor((total % 3600) / 60)],
    ['Sec', total % 60],
  ];
  return (
    <div className="flex items-end gap-1.5" aria-label="Time until the session starts">
      {units.map(([label, val], i) => (
        <div key={label} className="flex items-end gap-1.5">
          <div className="text-center">
            <span className="block min-w-[2.6rem] px-1.5 py-1.5 rounded-lg bg-[#111827] text-white font-mono text-lg sm:text-xl font-black tabular-nums leading-none">
              {String(val).padStart(2, '0')}
            </span>
            <span className="block mt-1 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">{label}</span>
          </div>
          {i < units.length - 1 && <span className="pb-5 text-slate-300 font-black">:</span>}
        </div>
      ))}
    </div>
  );
};

// Decorative barcode (not machine-readable), seeded from the event title so it is stable per session
const Barcode = ({ seed = '' }) => {
  const bars = Array.from({ length: 34 }, (_, i) => ((seed.charCodeAt(i % Math.max(1, seed.length)) || 7) + i * 7) % 4 + 1);
  return (
    <div className="flex items-stretch h-9 gap-[2px]" aria-hidden="true">
      {bars.map((w, i) => <span key={i} className="bg-slate-800 rounded-[1px]" style={{ width: w }} />)}
    </div>
  );
};

export const BoardingPassCard = ({ event, hostPhoto, formatDate, formatTime, onRegister, onOpen }) => {
  const reduced = useReducedMotion();
  const dest = eventDestination(event);
  const host = hostFirstName(event.speaker);
  const gate = event.location || 'Online';
  return (
    <motion.article
      initial={{ opacity: 0, y: 18, rotate: reduced ? 0 : 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      whileHover={reduced ? undefined : { y: -4, rotate: -0.6 }}
      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
      className="relative bg-white rounded-[26px] shadow-[0_30px_70px_-25px_rgba(222,92,43,0.45)] text-left overflow-hidden"
    >
      {/* Header band */}
      <div className="bg-gradient-to-r from-[#DE5C2B] via-[#E8743F] to-[#F29A55] px-5 sm:px-6 py-3 flex items-center justify-between text-white">
        <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]">
          <Plane size={14} className="-rotate-45" /> <span className="hidden sm:inline">UniCoach Live ·</span> Boarding Pass
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Next session
        </span>
      </div>

      <div className="px-5 sm:px-6 pt-5">
        {/* Route */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">From</span>
            <span className="block font-outfit text-3xl sm:text-4xl font-black text-slate-900 leading-none">IND</span>
            <span className="block text-[11px] font-semibold text-slate-500 mt-1">India</span>
          </div>
          <div className="relative flex-1 h-10 mx-1" aria-hidden="true">
            <div className="absolute top-1/2 inset-x-0 border-t-2 border-dashed border-orange-200" />
            <motion.span
              className="absolute top-1/2 -translate-y-1/2 text-[#DE5C2B]"
              initial={{ left: '0%' }}
              animate={reduced ? { left: '45%' } : { left: ['0%', '88%'] }}
              transition={reduced ? { duration: 0 } : { duration: 3.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
            >
              <Plane size={20} className="rotate-45 fill-[#DE5C2B]" />
            </motion.span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">To</span>
            <span className="block font-outfit text-3xl sm:text-4xl font-black text-[#DE5C2B] leading-none">{dest.code}</span>
            <span className="block text-[11px] font-semibold text-slate-500 mt-1">{dest.name}</span>
          </div>
        </div>

        {/* Title + host */}
        <button type="button" onClick={onOpen} className="mt-4 w-full text-left group cursor-pointer">
          <h3 className="font-outfit text-[17px] sm:text-lg font-black text-slate-900 leading-snug group-hover:text-[#DE5C2B] transition-colors">
            {event.title}
          </h3>
        </button>
        {host && (
          <div className="mt-3 flex items-center gap-3">
            {hostPhoto ? (
              <img src={hostPhoto} alt={host} className="w-10 h-10 rounded-full object-cover object-top ring-2 ring-orange-200" />
            ) : (
              <span className="w-10 h-10 rounded-full bg-orange-100 text-[#DE5C2B] font-black flex items-center justify-center">{host[0]}</span>
            )}
            <div className="min-w-0">
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Your host</span>
              <span className="block text-sm font-bold text-slate-800 truncate">{event.speaker}</span>
            </div>
          </div>
        )}

        {/* Ticket fields */}
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-3">
          {[
            ['Date', formatDate(event.eventStart)],
            ['Boarding', formatTime(event.eventStart, event.eventEnd).split(/\s*[-–]\s*/)[0]],
            ['Gate', gate.replace(/^online\s*/i, '') || 'Online'],
            ['Seat', 'Free'],
          ].map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">{k}</dt>
              <dd className="text-[12.5px] font-black text-slate-900 truncate" title={v}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Perforation */}
      <div className="relative my-4" aria-hidden="true">
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F1F5F9]" />
        <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F1F5F9]" />
        <div className="mx-5 border-t-2 border-dashed border-slate-200" />
      </div>

      {/* Stub */}
      <div className="px-5 sm:px-6 pb-5 space-y-4">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <Countdown start={event.eventStart} end={event.eventEnd} />
          <Barcode seed={event.title} />
        </div>
        <button
          type="button"
          onClick={onRegister}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm bg-[#111827] hover:bg-[#DE5C2B] transition-colors cursor-pointer"
        >
          {event.ctaLabel || 'Claim your free seat'} <ArrowRight size={16} />
        </button>
      </div>
    </motion.article>
  );
};

// Upcoming sessions as an airport departure board
export const DepartureBoard = ({ events, photoFor, formatDate, formatTime, onOpen }) => {
  if (!events.length) return null;
  return (
    <div className="rounded-2xl bg-[#0F172A] text-white p-3 sm:p-4 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.6)]">
      <div className="flex items-center justify-between px-1 pb-2.5 mb-1 border-b border-white/10">
        <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-amber-300">
          <Radio size={13} /> Live departures
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IST · Free</span>
      </div>
      <ul>
        {events.map((ev, i) => {
          const dest = eventDestination(ev);
          const host = hostFirstName(ev.speaker);
          const photo = photoFor(ev);
          return (
            <motion.li
              key={ev._id || ev.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.12 }}
            >
              <button
                type="button"
                onClick={() => onOpen(ev)}
                className="w-full grid grid-cols-[3.9rem_2.3rem_1fr_auto] sm:grid-cols-[4.6rem_2.3rem_1fr_auto] items-center gap-2.5 px-1.5 py-2.5 rounded-xl hover:bg-white/5 text-left cursor-pointer transition-colors"
              >
                <span className="font-mono text-[12px] sm:text-[13px] font-black text-amber-300 tabular-nums">{formatTime(ev.eventStart, ev.eventEnd).split(/\s*[-–]\s*/)[0]}</span>
                {photo ? (
                  <img src={photo} alt="" className="w-9 h-9 rounded-full object-cover object-top ring-2 ring-white/20" />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-white/10 font-black flex items-center justify-center">{host[0] || '•'}</span>
                )}
                <span className="min-w-0">
                  <span className="text-[13px] font-bold leading-snug line-clamp-2 sm:line-clamp-1">{ev.title}</span>
                  <span className="block text-[11px] text-slate-400 truncate">{host} · {formatDate(ev.eventStart)}</span>
                </span>
                <span className="font-mono text-[11px] font-black tracking-wider px-2 py-1 rounded-md bg-white/10 text-white">{dest.code}</span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
};
