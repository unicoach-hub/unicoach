import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { StationSign } from '../../components/desi/DesiKit';

// "How it works" for the UniCoach mentor marketplace: a five-step row on a flat teal Desi Pop ground.
// A toggle swaps the student's view for the mentor's; the last cards sit at a slight tilt, like cards dealt on a table.

const TILE_COLORS = [
  { bg: '#DE5C2B', fg: '#FFFFFF' },
  { bg: '#F2B705', fg: '#16130F' },
  { bg: '#B8285B', fg: '#FFFFFF' },
  { bg: '#14837E', fg: '#FFFFFF' },
  { bg: '#16130F', fg: '#FFFFFF' },
];

const VIEWS = {
  students: {
    label: 'For students',
    steps: [
      ['Browse seniors', 'Filter by university, country or service. Every mentor is verified'],
      ['Pick a service', '1:1 video call, SOP review or a priority DM'],
      ['Book a slot', 'Choose a time from the mentor\'s live calendar'],
      ['Pay securely', 'Pay through Razorpay, no hidden charges'],
      ['Talk 1:1', 'First-hand advice from a senior who got in'],
    ],
  },
  mentors: {
    label: 'For mentors',
    steps: [
      ['Apply', 'Tell us where you study and what you can help with'],
      ['Get verified', 'Our team checks your profile before you go live'],
      ['Set services', 'Choose your services, prices and free slots'],
      ['Take sessions', 'Students book you; calls run on Google Meet'],
      ['Get paid', 'Earnings land in your bank account'],
    ],
  },
};

// Gentle tilt for the last two cards, like cards dealt on a table
const TILT = [0, 0, 0, 1.2, 2];
const DROP = [0, 0, 0, 22, 30];

export const HowItWorksSteps = () => {
  const [view, setView] = useState('students');
  const reduce = useReducedMotion();
  const { steps } = VIEWS[view];

  return (
    <section id="how-it-works" className="relative w-full max-w-full overflow-hidden py-14 sm:py-20 bg-[#14837E] border-b-[3px] border-[#16130F]">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle,rgba(22,19,15,.16)_1.3px,transparent_1.7px)] [background-size:12px_12px] pointer-events-none" />
      <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center">
          <StationSign hi="Kaise kaam karta hai" en="HOW IT WORKS" className="-rotate-2" />
          <h2 className="mt-6 font-urbanist text-[38px] sm:text-[60px] lg:text-[72px] font-black text-white leading-[0.95] tracking-[-0.05em] max-w-[900px] mx-auto [text-shadow:4px_4px_0_#16130F]">
            Two sides of one session, both sorted.
          </h2>
          <div className="mt-8 inline-flex p-1.5 rounded-full bg-white border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F]">
            {Object.entries(VIEWS).map(([key, v]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={`relative h-11 px-5 sm:px-6 rounded-full text-[14.5px] font-bold cursor-pointer transition-colors no-shine ${view === key ? 'text-white' : 'text-[#16130F] hover:text-[#DE5C2B]'}`}
              >
                {view === key && <motion.span layoutId="hiw-pill" className="absolute inset-0 rounded-full bg-[#16130F]" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span className="relative">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Steps row, joined by one thin line behind the cards */}
        <div className="relative mt-12">
          <span aria-hidden="true" className="hidden lg:block absolute left-[6%] right-[6%] top-[66px] h-[3px] bg-[#16130F] rounded-full" />
          <AnimatePresence mode="wait">
            <motion.ol
              key={view}
              className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 list-none p-0 m-0"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.08 } } }}
            >
              {steps.map(([title, text], i) => (
                <motion.li
                  key={title}
                  variants={{
                    hidden: { opacity: 0, y: reduce ? 0 : 24, rotate: 0 },
                    show: { opacity: 1, y: 0, rotate: 0 },
                  }}
                  transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                >
                  <div
                    className="h-full lg:[transform:var(--tilt)] rounded-[20px] bg-white p-6 sm:p-7 border-[3px] border-[#16130F] shadow-[6px_6px_0_#16130F] transition-[translate] duration-300 hover:-translate-y-1"
                    style={{ '--tilt': `translateY(${DROP[i]}px) rotate(${TILT[i]}deg)` }}
                  >
                    <span className="grid place-items-center w-14 h-14 rounded-[14px] border-[3px] border-[#16130F] font-urbanist text-[26px] font-black" style={{ background: TILE_COLORS[i].bg, color: TILE_COLORS[i].fg }}>
                      {i + 1}
                    </span>
                    <h3 className="mt-6 font-urbanist text-[24px] sm:text-[26px] font-black text-[#16130F] tracking-[-0.03em] leading-tight">{title}</h3>
                    <p className="mt-2.5 text-[15.5px] leading-relaxed text-[#3D3830]">{text}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
