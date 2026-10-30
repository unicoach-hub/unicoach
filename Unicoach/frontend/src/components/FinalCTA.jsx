import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Phone, Plane } from 'lucide-react';
import { useLead } from '../context/LeadContext';
import PriorityDmModal from './PriorityDmModal';
import { TEAM_MENTORS } from '../utils/teamMentors';

/*
 * Homepage closing CTA as a boarding pass: the main part asks "where to start" (Confused → Clear plan, a plane flying
 * across), the tear-off stub holds what the free call is (fare ₹0, 60 min, 1:1) and the seniors you could talk to.
 * Perforation runs down the middle on wide screens and across on phones.
 */

const CREW = ['Prachi', 'Nitya', 'Manan', 'Manvi', 'Rishi Gandhi'].map((n) => TEAM_MENTORS.find((m) => m.name === n)).filter(Boolean);
const FIELDS = [
  ['Passenger', 'You'],
  ['Fare', '₹0'],
  ['Duration', '60 min'],
  ['Gate', '1:1 video call'],
];
// Barcode bar widths (decorative)
const BARS = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2];

// Semicircle notches where the pass "tears"
const Notch = ({ className }) => <span aria-hidden="true" className={`absolute w-8 h-8 rounded-full bg-[#FAF9F6] border-[3px] border-[#16130F] ${className}`} />;

export const FinalCTA = ({ onOpenModal }) => {
  const { openEligibilityModal } = useLead();
  const handleOpen = onOpenModal || (() => openEligibilityModal('Final CTA Banner'));
  const [isPriorityDmOpen, setIsPriorityDmOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    <section className="pt-2 sm:pt-4 pb-12 sm:pb-16 bg-[#FAF9F6] w-full max-w-full overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10 w-full min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 24, rotate: -0.6 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative grid lg:grid-cols-[minmax(0,1fr)_340px] rounded-[26px] border-[3px] border-[#16130F] bg-[#FFF6E5] shadow-[7px_7px_0_#16130F]"
        >
          {/* ── main part ── */}
          <div className="relative px-6 py-7 sm:px-9 sm:py-8 lg:px-11 min-w-0">
            <div className="flex items-center gap-2 text-[11.5px] font-bold tracking-[0.16em] uppercase text-[#C04A1D]">
              <Plane size={14} className="-rotate-45" /> UniCoach Air · Boarding now
            </div>
            <h2 className="mt-2.5 font-urbanist font-black text-[34px] sm:text-[44px] lg:text-[48px] leading-[1] tracking-[-0.04em] text-[#16130F]">
              Not sure where to start?
            </h2>
            <p className="mt-2.5 max-w-[520px] text-[14.5px] sm:text-[15.5px] leading-relaxed text-[#5B544A]">
              Tell us your marks, budget and dream country. A counsellor calls you back with a clear plan, free.
            </p>

            {/* route: Confused → Clear plan, one slim strip */}
            <div className="mt-5 max-w-[560px] flex items-center gap-3">
              <span className="shrink-0 leading-none"><span className="block font-urbanist font-black text-[18px] text-[#16130F]">CNFSD</span><span className="text-[10.5px] font-semibold text-[#8A8275]">Confused</span></span>
              <div className="relative flex-1 h-7">
                <span aria-hidden="true" className="absolute left-1 right-1 top-1/2 border-t-[3px] border-dashed border-[#16130F]/35" />
                <span aria-hidden="true" className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#16130F]" />
                <span aria-hidden="true" className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#DE5C2B] ring-4 ring-[#DE5C2B]/20" />
                <motion.span
                  aria-hidden="true"
                  className="absolute top-1/2 -translate-y-1/2 -ml-3 w-7 h-7 grid place-items-center rounded-full bg-[#DE5C2B] text-white border-2 border-[#16130F]"
                  initial={{ left: '6%' }}
                  animate={reduced ? { left: '60%' } : { left: ['6%', '94%'] }}
                  transition={reduced ? { duration: 0 } : { duration: 4.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
                >
                  <Plane size={14} className="rotate-45" fill="currentColor" />
                </motion.span>
              </div>
              <span className="shrink-0 leading-none text-right"><span className="block font-urbanist font-black text-[18px] text-[#DE5C2B]">PLAN</span><span className="text-[10.5px] font-semibold text-[#8A8275]">Clear plan</span></span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleOpen}
                className="no-shine group inline-flex items-center gap-3 h-12 pl-6 pr-2 rounded-full bg-[#16130F] hover:bg-[#DE5C2B] text-white text-[14.5px] font-bold border-2 border-[#16130F] shadow-[3px_3px_0_#DE5C2B] hover:shadow-[3px_3px_0_#16130F] transition-colors cursor-pointer"
              >
                Book Free Counselling
                <span className="w-8 h-8 rounded-full bg-white text-[#16130F] grid place-items-center transition-transform group-hover:rotate-45">
                  <ArrowUpRight size={16} strokeWidth={2.5} />
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsPriorityDmOpen(true)}
                className="no-shine inline-flex items-center gap-2 h-12 px-5 rounded-full bg-white hover:bg-[#FDF4EF] text-[#16130F] text-[14.5px] font-bold border-2 border-[#16130F] transition-colors cursor-pointer"
              >
                <Phone size={16} className="text-[#DE5C2B]" />
                Talk To Expert
              </button>
            </div>
          </div>

          {/* ── perforation ── */}
          <span aria-hidden="true" className="hidden lg:block absolute top-6 bottom-6 right-[340px] border-l-[3px] border-dashed border-[#16130F]/40" />
          <Notch className="hidden lg:block -top-[17px] right-[325px] z-10" />
          <Notch className="hidden lg:block -bottom-[17px] right-[325px] z-10" />
          <span aria-hidden="true" className="lg:hidden mx-6 border-t-[3px] border-dashed border-[#16130F]/40" />

          {/* ── stub ── */}
          <div className="relative bg-[#DE5C2B] text-white px-6 py-6 sm:px-7 lg:py-7 rounded-b-[23px] lg:rounded-bl-none lg:rounded-r-[23px] overflow-hidden">
            <span aria-hidden="true" className="absolute inset-0 opacity-25 bg-[radial-gradient(circle,rgba(255,255,255,0.55)_1.2px,transparent_1.6px)] [background-size:14px_14px]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-[0.18em] uppercase">Boarding pass</span>
                <motion.span
                  initial={{ opacity: 0, scale: 1.6, rotate: -20 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: -10 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.5 }}
                  className="px-2.5 py-0.5 rounded-md border-2 border-white text-[12px] font-black tracking-[0.14em] uppercase"
                >
                  Free
                </motion.span>
              </div>

              <dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2.5">
                {FIELDS.map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/70">{k}</dt>
                    <dd className="m-0 font-urbanist text-[17px] font-black leading-tight truncate">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-3.5 pt-3 border-t-2 border-dashed border-white/40">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/70">Your crew · seniors abroad</span>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex -space-x-2.5">
                    {CREW.map((m, i) => (
                      <img key={m.name} src={m.headshot || m.src} alt={m.name} title={`${m.name}, ${m.country}`} loading="lazy"
                        className="w-10 h-10 rounded-full object-cover border-[2.5px] border-[#16130F] bg-white" style={{ zIndex: CREW.length - i }} />
                    ))}
                  </div>
                  <span className="text-[12px] font-semibold leading-tight text-white/90">Ireland, Europe,<br />Australia, USA</span>
                </div>
              </div>

              {/* barcode */}
              <div aria-hidden="true" className="mt-4 flex items-end h-10 gap-[2px] bg-white rounded-md px-3 py-1.5">
                {BARS.map((w, i) => <span key={i} className="h-full bg-[#16130F]" style={{ width: w * 2 }} />)}
                <span className="ml-auto self-center font-mono text-[10px] font-bold text-[#16130F]">UC·1ON1</span>
              </div>
            </div>
          </div>
        </motion.div>

        <PriorityDmModal isOpen={isPriorityDmOpen} onClose={() => setIsPriorityDmOpen(false)} />
      </div>
    </section>
  );
};

export default FinalCTA;
