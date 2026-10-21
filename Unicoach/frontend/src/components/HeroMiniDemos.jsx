import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageCircle } from 'lucide-react';

// Small self-playing previews for the hero's floating cards. They type a query, show what
// comes back, then move to the next one. Each stays paused while the card is hovered.

const useTypingLoop = (items, { typeMs = 55, holdTicks = 22, tickMs = 90, paused = false } = {}) => {
  const [s, setS] = useState({ i: 0, chars: 0, hold: 0 });
  useEffect(() => {
    if (paused) return undefined;
    const word = items[s.i].q;
    const typing = s.chars < word.length;
    const t = setTimeout(() => {
      setS((d) => {
        if (d.chars < word.length) return { ...d, chars: d.chars + 1 };
        if (d.hold < holdTicks) return { ...d, hold: d.hold + 1 };
        return { i: (d.i + 1) % items.length, chars: 0, hold: 0 };
      });
    }, typing ? typeMs : tickMs);
    return () => clearTimeout(t);
  }, [s, items, typeMs, holdTicks, tickMs, paused]);
  const item = items[s.i];
  return { item, text: item.q.slice(0, s.chars), done: s.chars >= item.q.length, hold: s.hold, key: s.i };
};

const SEARCHES = [
  { q: 'MS Data Science', results: [{ t: 'MSc Data Science', c: 'Ireland', fit: 'Safe' }, { t: 'MS Business Analytics', c: 'USA', fit: 'Target' }] },
  { q: 'MBA Canada', results: [{ t: 'MBA, 1 year', c: 'Canada', fit: 'Target' }, { t: 'Global MBA', c: 'Canada', fit: 'Dream' }] },
  { q: 'Nursing Australia', results: [{ t: 'Master of Nursing', c: 'Australia', fit: 'Safe' }, { t: 'BSc Nursing', c: 'Australia', fit: 'Target' }] },
];
const FIT = {
  Safe: 'bg-emerald-50 text-emerald-700',
  Target: 'bg-orange-50 text-[#C2410C]',
  Dream: 'bg-purple-50 text-purple-700',
};

export const MiniSearchDemo = ({ paused }) => {
  const { item, text, done, key } = useTypingLoop(SEARCHES, { paused });
  return (
    <div>
      <div className="flex items-center gap-1.5 h-7 px-2 rounded-lg border border-slate-200 bg-slate-50">
        <Search className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
        <span className="text-[10.5px] font-semibold text-slate-800 truncate">{text}</span>
        <span className="w-[1.5px] h-3 bg-[#DE5C2B] animate-pulse -ml-1" />
      </div>
      <div className="mt-2 space-y-1.5 min-h-[58px]">
        <AnimatePresence mode="popLayout">
          {done && item.results.map((r, idx) => (
            <motion.div
              key={`${key}-${idx}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: idx * 0.12, duration: 0.2 }}
              className="flex items-center justify-between gap-1 px-2 py-1 rounded-md border border-slate-100 bg-white"
            >
              <span className="min-w-0">
                <span className="block text-[9.5px] font-bold text-slate-800 truncate">{r.t}</span>
                <span className="block text-[8.5px] text-slate-500">{r.c}</span>
              </span>
              <span className={`shrink-0 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${FIT[r.fit]}`}>{r.fit}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CHATS = [
  { q: 'Can I get a scholarship for MS in Ireland?', a: 'Yes, a few fit your profile. Sharing the list now.' },
  { q: 'Is a 6.5 IELTS enough for Canada?', a: 'For most colleges, yes. Let’s check your course.' },
  { q: 'Which intake is better, Sep or Jan?', a: 'September has more options. Here’s why…' },
];

export const MiniChatDemo = ({ paused }) => {
  const { item, text, done, hold, key } = useTypingLoop(CHATS, { typeMs: 35, holdTicks: 26, paused });
  const replying = done && hold < 6;
  const replied = done && hold >= 6;
  return (
    <div className="space-y-1.5 min-h-[78px]">
      <div className="flex justify-end">
        <span className="max-w-[88%] px-2 py-1 rounded-xl rounded-br-sm bg-[#DE5C2B] text-white text-[9.5px] font-semibold leading-snug">
          {text || ' '}
        </span>
      </div>
      <div className="flex items-start gap-1.5">
        <span className="w-5 h-5 rounded-full bg-orange-50 border border-orange-100 text-[#DE5C2B] flex items-center justify-center shrink-0">
          <MessageCircle className="w-2.5 h-2.5" aria-hidden="true" />
        </span>
        <AnimatePresence mode="wait">
          {replying && (
            <motion.span key={`dots-${key}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-2 py-1.5 rounded-xl rounded-bl-sm bg-slate-100 flex gap-0.5">
              {[0, 1, 2].map((d) => (
                <span key={d} className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${d * 120}ms` }} />
              ))}
            </motion.span>
          )}
          {replied && (
            <motion.span key={`a-${key}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-[88%] px-2 py-1 rounded-xl rounded-bl-sm bg-slate-100 text-slate-800 text-[9.5px] font-semibold leading-snug">
              {item.a}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
