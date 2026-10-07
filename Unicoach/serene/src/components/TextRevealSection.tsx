import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// ==========================================
// SCROLL-LINKED WORD-BY-WORD TEXT REVEAL
// Inspired by PRØDUX "A brand is recognized..." section
// Words reveal from dark to white as user scrolls
// Dark themed section between Destinations and Stats
// ==========================================

const REVEAL_TEXT =
  'Your education journey is shaped before it begins. The right guidance defines where you study, how you grow, and who you become.';

const ACCENT_TEXT = 'We help make that difference.';

export const TextRevealSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.9', 'end 0.4'],
  });

  const words = REVEAL_TEXT.split(' ');
  const accentWords = ACCENT_TEXT.split(' ');
  const totalWords = words.length + accentWords.length;

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-44 overflow-hidden"
      style={{ background: '#1a1f16' }}
    >
      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1000px] mx-auto px-6 md:px-10 relative z-10">
        <p className="text-center text-2xl sm:text-3xl md:text-[2.6rem] lg:text-[3.2rem] font-bold leading-[1.35] md:leading-[1.3] tracking-tight font-instrument">
          {/* Main text — words fade from dark to white */}
          {words.map((word, i) => (
            <Word
              key={`main-${i}`}
              word={word}
              index={i}
              totalWords={totalWords}
              scrollYProgress={scrollYProgress}
              isAccent={false}
            />
          ))}

          {/* Accent text — fades to indigo/blue color */}
          {accentWords.map((word, i) => (
            <Word
              key={`accent-${i}`}
              word={word}
              index={words.length + i}
              totalWords={totalWords}
              scrollYProgress={scrollYProgress}
              isAccent={true}
            />
          ))}
        </p>
      </div>
    </section>
  );
};

// ==========================================
// Individual Word Component
// Each word transitions from near-invisible to visible
// based on its position in the scroll progress
// ==========================================
interface WordProps {
  word: string;
  index: number;
  totalWords: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  isAccent: boolean;
}

const Word: React.FC<WordProps> = ({ word, index, totalWords, scrollYProgress, isAccent }) => {
  // Each word starts revealing at a staggered point in the scroll
  const start = index / totalWords;
  const end = start + 1 / totalWords;

  const opacity = useTransform(scrollYProgress, [start, end], [0.12, 1]);
  const color = useTransform(
    scrollYProgress,
    [start, end],
    isAccent
      ? ['rgba(138, 145, 120, 0.15)', 'rgba(129, 140, 248, 1)']  // dark → indigo
      : ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.92)']  // dark → white
  );

  return (
    <motion.span
      style={{ opacity, color }}
      className="inline-block mr-[0.3em] transition-none"
    >
      {word}
    </motion.span>
  );
};
