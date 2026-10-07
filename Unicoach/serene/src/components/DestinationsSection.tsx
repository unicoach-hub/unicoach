import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import usaVideo from '../assets/video/USA.mp4';
import ukVideo from '../assets/video/UK.mp4';
import canadaVideo from '../assets/video/canada.mp4';
import australiaVideo from '../assets/video/Australia.mp4';
import germanyVideo from '../assets/video/germany.mp4';
import irelandVideo from '../assets/video/ireland.mp4';

// ==========================================
// DESTINATIONS SECTION
// 1. Scroll-linked word-by-word text reveal (PRØDUX-inspired)
// 2. Expandable vertical strip gallery for countries
// Colors match UniCoach logo: Navy #0a1a4a, Blue #2563eb, Orange #f26522
// ==========================================

interface DestinationsSectionProps {
  onOpenModal: (countryName: string) => void;
}

const REVEAL_TEXT =
  'Your education journey is shaped before it begins. The right guidance defines where you study, how you grow, and who you become.';

const ACCENT_TEXT = 'We help make that difference.';

const destinations = [
  {
    name: 'United States',
    emoji: '🗽',
    slug: 'usa',
    stats: '4500+ Universities • Avg. Salary: $75k+',
    tag: 'Most Popular',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&auto=format&fit=crop&q=80',
    video: usaVideo,
  },
  {
    name: 'United Kingdom',
    emoji: '🏰',
    slug: 'uk',
    stats: '150+ Universities • Avg. Salary: £45k+',
    tag: 'Top Ranked',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&auto=format&fit=crop&q=80',
    video: ukVideo,
  },
  {
    name: 'Canada',
    emoji: '🍁',
    slug: 'canada',
    stats: '100+ Colleges • Avg. Salary: C$65k+',
    tag: 'PR Friendly',
    image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1200&auto=format&fit=crop&q=80',
    video: canadaVideo,
  },
  {
    name: 'Australia',
    emoji: '🦘',
    slug: 'australia',
    stats: '40+ Universities • Avg. Salary: A$70k+',
    tag: 'Work & Study',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&auto=format&fit=crop&q=80',
    video: australiaVideo,
  },
  {
    name: 'Germany',
    emoji: '🏛️',
    slug: 'germany',
    stats: '300+ Universities • Avg. Salary: €55k+',
    tag: 'Tuition Free',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&auto=format&fit=crop&q=80',
    video: germanyVideo,
  },
  {
    name: 'Ireland',
    emoji: '☘️',
    slug: 'ireland',
    stats: '20+ Universities • Avg. Salary: €45k+',
    tag: 'Rising Hub',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&auto=format&fit=crop&q=80',
    video: irelandVideo,
  },
];

// ==========================================
// Word-by-word reveal component
// ==========================================
interface WordProps {
  word: string;
  index: number;
  totalWords: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  isAccent: boolean;
}

const Word: React.FC<WordProps> = ({ word, index, totalWords, scrollYProgress, isAccent }) => {
  const start = index / totalWords;
  const end = start + 1 / totalWords;

  const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);
  const color = useTransform(
    scrollYProgress,
    [start, end],
    isAccent
      ? ['rgba(242, 101, 34, 0.12)', 'rgba(242, 101, 34, 1)']    // dark → UniCoach Orange
      : ['rgba(255, 255, 255, 0.10)', 'rgba(255, 255, 255, 0.92)'] // dark → white
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

// ==========================================
// Main Section
// ==========================================
export const DestinationsSection: React.FC<DestinationsSectionProps> = ({ onOpenModal }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const textRevealRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: textRevealRef,
    offset: ['start 0.85', 'end 0.45'],
  });

  const words = REVEAL_TEXT.split(' ');
  const accentWords = ACCENT_TEXT.split(' ');
  const totalWords = words.length + accentWords.length;

  return (
    <section id="destinations" className="relative overflow-hidden">

      {/* ===== PART 1: Text Reveal (Dark Navy Background) ===== */}
      <div
        ref={textRevealRef}
        className="relative py-28 md:py-40 overflow-hidden"
        style={{ background: '#0a1a4a' }}
      >
        {/* Subtle dot texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Ambient blue glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-500/[0.06] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-[1000px] mx-auto px-6 md:px-10 relative z-10">
          <p className="text-center text-2xl sm:text-3xl md:text-[2.6rem] lg:text-[3.2rem] font-bold leading-[1.35] md:leading-[1.3] tracking-tight font-instrument">
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
      </div>

      {/* ===== PART 2: Destinations Gallery (White Background) ===== */}
      <div className="py-24 bg-white relative">
        <div className="max-w-[1360px] mx-auto px-6 md:px-10 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: false }}
              className="max-w-2xl"
            >
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight font-instrument">
                Top Study Destinations
              </h2>
              <p className="text-slate-500 text-base font-semibold">
                Explore popular education hubs offering world-class academics and global career prospects.
              </p>
            </motion.div>

            <motion.button
              onClick={() => onOpenModal('View All Countries')}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: false }}
              className="inline-flex items-center gap-1.5 font-black hover:opacity-80 transition-colors group text-[0.95rem] cursor-pointer"
              style={{ color: '#2563eb' }}
            >
              <span>View All Countries</span>
              <ArrowUpRight size={18} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform stroke-[2.5]" />
            </motion.button>
          </div>

          {/* ===== DESKTOP: Expandable Vertical Strips ===== */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            viewport={{ once: false }}
            className="hidden md:flex gap-2 h-[520px] rounded-3xl overflow-hidden"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {destinations.map((dest, i) => {
              const isHovered = hoveredIndex === i;
              const hasHover = hoveredIndex !== null;

              return (
                <div
                  key={dest.slug}
                  className="relative overflow-hidden rounded-2xl cursor-pointer group"
                  style={{
                    flex: isHovered ? 4 : hasHover ? 0.6 : 1,
                    transition: 'flex 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onClick={() => onOpenModal(`Study in ${dest.name}`)}
                >
                  {/* Background Image & Hover-Triggered Video */}
                  {dest.video && isHovered ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="none"
                      poster={dest.image}
                      src={dest.video}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                      style={{
                        transform: 'scale(1.08)',
                      }}
                    />
                  ) : (
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                      style={{
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                      }}
                    />
                  )}

                  {/* Gradient Overlay — subtle and clear */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      background: isHovered
                        ? 'linear-gradient(to top, rgba(10,26,74,0.85) 0%, rgba(10,26,74,0.3) 40%, rgba(10,26,74,0.05) 100%)'
                        : 'linear-gradient(to top, rgba(10,26,74,0.55) 0%, rgba(10,26,74,0.2) 50%, rgba(10,26,74,0.05) 100%)',
                    }}
                  />

                  {/* Tag Badge — visible on expanded */}
                  <div
                    className="absolute top-5 right-5 z-10 transition-all duration-500"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translateY(0)' : 'translateY(-10px)',
                    }}
                  >
                    <span
                      className="backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(37, 99, 235, 0.5)' }}
                    >
                      {dest.tag}
                    </span>
                  </div>

                  {/* Country Name — vertical when collapsed */}
                  <div
                    className="absolute inset-0 flex items-center justify-center z-10 transition-all duration-500"
                    style={{
                      opacity: isHovered ? 0 : 1,
                      pointerEvents: isHovered ? 'none' : 'auto',
                    }}
                  >
                    <span
                      className="text-white font-black text-lg tracking-wider whitespace-nowrap"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        letterSpacing: '0.12em',
                      }}
                    >
                      {dest.name}
                    </span>
                  </div>

                  {/* Expanded Content */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-7 z-10 transition-all duration-500"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translateY(0)' : 'translateY(30px)',
                    }}
                  >
                    <div>
                      <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-2">
                        {dest.emoji} Destination
                      </p>
                      <h3 className="text-white font-black text-2xl md:text-3xl tracking-tight mb-2">
                        {dest.name}
                      </h3>
                      <p className="text-white/70 text-sm font-semibold mb-5 max-w-[340px]">
                        {dest.stats}
                      </p>
                      <button
                        className="inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors duration-300 group/btn"
                        style={{ background: '#f26522', color: '#fff' }}
                      >
                        <span>Explore</span>
                        <ArrowUpRight size={16} strokeWidth={2.5} className="transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* ===== MOBILE: Horizontal Scroll with Snap ===== */}
          <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-hide">
            {destinations.map((dest, i) => (
              <motion.div
                key={dest.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: false }}
                className="relative flex-shrink-0 w-[260px] h-[380px] rounded-2xl overflow-hidden snap-center cursor-pointer group"
                onClick={() => onOpenModal(`Study in ${dest.name}`)}
              >
                {dest.video ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    poster={dest.image}
                    src={dest.video}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(10,26,74,0.85) 0%, rgba(10,26,74,0.3) 50%, transparent 100%)' }}
                />

                {/* Tag */}
                <div className="absolute top-4 right-4 z-10">
                  <span
                    className="backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(37, 99, 235, 0.5)' }}
                  >
                    {dest.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <p className="text-3xl mb-1">{dest.emoji}</p>
                  <h3 className="text-white font-black text-xl tracking-tight mb-1">{dest.name}</h3>
                  <p className="text-white/70 text-xs font-semibold">{dest.stats}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
