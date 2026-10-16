import React, { useState } from 'react';
import DotMorph from './DotMorph';
import { motion } from 'framer-motion';
import { ArrowUpRight, Phone } from 'lucide-react';
import { useLead } from '../context/LeadContext';
import ctaBgImg from '../assets/cta_bg.webp';
import worldDots from '../assets/world-dots.svg';
import { PillButton } from './ui/PillButton';
import PriorityDmModal from './PriorityDmModal';
import { TEAM_MENTORS } from '../utils/teamMentors';

// Route map: positions are % of the dotted world map (src/assets/world-dots.svg, lon -128..158, lat 62..-46).
// `dot` is the real spot on the map, `at` is where the mentor group sits (kept clear of other labels).
const MAP_ORIGIN = { x: 71.8, y: 30.9 }; // New Delhi
const byName = (n) => TEAM_MENTORS.find((m) => m.name === n);
const MAP_DESTINATIONS = [
  { key: 'usa', label: 'USA', flag: 'us', dot: { x: 18.9, y: 19.7 }, at: { x: 18, y: 56 }, names: ['Rishi Gandhi'], hideLabel: true },
  { key: 'ireland', label: 'Ireland', flag: 'ie', dot: { x: 42.6, y: 8 }, at: { x: 37, y: 46 }, names: ['Prachi', 'Nitya', 'Munish Rana'] },
  { key: 'europe', label: 'Europe', flag: 'eu', dot: { x: 47.8, y: 11 }, at: { x: 55, y: 60 }, names: ['Manvi'] },
  { key: 'australia', label: 'Australia', flag: 'au', dot: { x: 97.6, y: 88.8 }, at: { x: 83, y: 66 }, names: ['Manan'] },
].map((d) => ({ ...d, mentors: d.names.map(byName).filter(Boolean) }));
// Gentle upward arc between two map points
const arcPath = (from, to) => {
  const mx = (from.x + to.x) / 2;
  const my = Math.min(from.y, to.y) - Math.abs(from.x - to.x) * 0.22;
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
};

export const FinalCTA = ({ onOpenModal }) => {
  const { openEligibilityModal } = useLead();
  const handleOpen = onOpenModal || (() => openEligibilityModal('Final CTA Banner'));
  const [isPriorityDmOpen, setIsPriorityDmOpen] = useState(false);
  const [mapPhase, setMapPhase] = useState('map');
  return (
    <section className="pt-2 sm:pt-4 pb-12 sm:pb-16 bg-[#FAF9F6] select-none w-full max-w-full overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 w-full min-w-0">

        {/* ── 1:1 Exact Replicated Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-[24px] sm:rounded-[32px] overflow-hidden p-6 sm:p-8 lg:p-12 shadow-2xl shadow-orange-500/15 text-white min-h-[240px] sm:min-h-[260px] flex items-center border border-orange-200/40 w-full min-w-0"
        >

          {/* ════════ ELEGANT VIBRANT TERRACOTTA WARM GRADIENT BACKGROUND ════════ */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{
              background: 'linear-gradient(135deg, #DE5C2B 0%, #E25F2E 35%, #EA580C 70%, #F97316 100%)',
            }}
          />
          {/* Subtle world coordinates texture */}
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 1.2px, transparent 1.2px)',
              backgroundSize: '22px 22px',
            }}
          />

          {/* ════════ ROUTE MAP: India → the countries our mentors cover (tablet/desktop) ════════ */}
          <div className="absolute inset-y-3 right-3 xl:right-6 pointer-events-none z-10 hidden xl:block aspect-[1000/378]">
            <DotMorph src={worldDots} onPhase={setMapPhase} className="absolute inset-0 w-full h-full" />

            {/* Routes and mentors only while the dots show the world map */}
            <motion.div className="absolute inset-0" initial={false} animate={{ opacity: mapPhase === 'map' ? 1 : 0 }} transition={{ duration: mapPhase === 'map' ? 0.6 : 0.3 }}>

            {/* Routes from India, dashes flowing towards each destination */}
            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
              {MAP_DESTINATIONS.map((d, i) => (
                <motion.path
                  key={d.key}
                  d={arcPath(MAP_ORIGIN, d.dot)}
                  stroke="white"
                  strokeOpacity="0.9"
                  strokeWidth="1.6"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.25 }}
                  className="cta-route-flow"
                />
              ))}
              {MAP_DESTINATIONS.map((d) => (
                <line key={`${d.key}-lead`} x1={d.dot.x} y1={d.dot.y} x2={d.at.x} y2={d.at.y} stroke="white" strokeOpacity="0.55" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>

            {/* Exact spots: India (origin) and each destination */}
            {[MAP_ORIGIN, ...MAP_DESTINATIONS.map((d) => d.dot)].map((pt, i) => (
              <span
                key={`dot-${i}`}
                className="absolute w-2.5 h-2.5 -ml-[5px] -mt-[5px] rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.25)]"
                style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
              />
            ))}
            <span
              className="absolute -translate-x-1/2 mt-3 px-2 py-0.5 rounded-full bg-black/25 text-white text-[10.5px] font-bold tracking-wide whitespace-nowrap"
              style={{ left: `${MAP_ORIGIN.x}%`, top: `${MAP_ORIGIN.y}%` }}
            >
              You · India
            </span>

            {/* Mentor groups per destination */}
            {MAP_DESTINATIONS.map((d, i) => (
              <motion.div
                key={d.key}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1 + i * 0.2 }}
                className="absolute w-max -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{ left: `${d.at.x}%`, top: `${d.at.y}%` }}
              >
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex -space-x-2.5">
                    {d.mentors.map((m) => (
                      <img
                        key={m.name}
                        src={m.headshot || m.src}
                        alt={`${m.name}, ${m.role}`}
                        title={`${m.name} · ${m.role}`}
                        loading="lazy"
                        className="w-10 h-10 lg:w-11 lg:h-11 rounded-full object-cover border-2 border-white shadow-[0_6px_14px_rgba(0,0,0,0.25)] hover:scale-110 hover:z-10 transition-transform"
                      />
                    ))}
                  </div>
                  {!d.hideLabel && (
                  <span className="mt-1.5 inline-flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full bg-white text-slate-900 text-[11px] font-bold shadow-md whitespace-nowrap">
                    <img src={`https://flagcdn.com/w40/${d.flag}.png`} alt="" aria-hidden="true" className="w-4 h-3 rounded-[2px] object-cover" />
                    {d.label}
                    <span className="text-slate-400 font-semibold">· {d.mentors.length === 1 ? d.mentors[0].name.split(' ')[0] : `${d.mentors.length} mentors`}</span>
                  </span>
                  )}
                </motion.div>
              </motion.div>
            ))}
            </motion.div>
          </div>

          {/* ════════ FOREGROUND CONTENT: LEFT HEADLINE + TEXT + 2 BUTTONS (Slides from Left) ════════ */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 max-w-[270px] xs:max-w-[320px] sm:max-w-[380px] lg:max-w-[420px]"
          >

            {/* Headline matching exact scale of 2nd screenshot */}
            <h2 className="font-outfit text-[22px] xs:text-[25px] sm:text-[32px] lg:text-[38px] font-black text-white leading-[1.12] tracking-tight">
              Ready to Take <br className="hidden xs:inline sm:inline" />
              the Unicoach?
            </h2>

            {/* Subtitle */}
            <p className="text-[11px] xs:text-[12px] sm:text-[12.5px] text-white/90 mt-2 sm:mt-2.5 max-w-[240px] xs:max-w-[280px] sm:max-w-[310px] font-normal leading-relaxed">
              Join thousands of successful students who trusted UniCoach for their international education journey.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 mt-5 sm:mt-6">
              <button
                type="button"
                onClick={handleOpen}
                className="group inline-flex items-center gap-3 bg-[#111111] hover:bg-black text-white pl-5 pr-2.5 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-xl shadow-black/40 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Book Free Counselling</span>
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsPriorityDmOpen(true)}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-white hover:bg-orange-50/80 text-slate-900 text-xs sm:text-sm font-bold border border-orange-200/90 shadow-sm hover:border-[#DE5C2B] hover:text-[#DE5C2B] transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#DE5C2B]" />
                <span>Talk To Expert</span>
              </button>
            </div>

          </motion.div>

        </motion.div>

        {/* Priority DM Modal */}
        <PriorityDmModal
          isOpen={isPriorityDmOpen}
          onClose={() => setIsPriorityDmOpen(false)}
        />

      </div>
    </section>
  );
};

export default FinalCTA;
