import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

// ==========================================
// PRØDUX-INSPIRED SCROLL-DRIVEN TESTIMONIALS
// - As user scrolls vertically down the page, cards translate horizontally across screen
// - No arrow buttons (< >), no dots — pure scroll interaction
// - Center card expands, brightens to cream/white, removes blur
// - Surrounding cards scale down, dim out, and blur
// ==========================================

const REVIEWS = [
  {
    name: 'Priya Sharma',
    avatar: '👩🏽‍🎓',
    university: 'Northeastern University',
    location: 'USA',
    text: 'UniCoach helped me get into my dream university with a full scholarship. Their counsellors guided me at every step — from SOP to visa. Couldn\'t have done it without them!',
  },
  {
    name: 'Rahul Mehta',
    avatar: '👨🏽‍💼',
    university: 'University of Toronto',
    location: 'Canada',
    text: 'The team was incredibly professional. They shortlisted universities perfectly matching my profile and budget. I got 3 offers and chose Toronto! Best decision of my life.',
  },
  {
    name: 'Ananya Patel',
    avatar: '👩🏽‍💻',
    university: 'University of Manchester',
    location: 'UK',
    text: 'I was sceptical at first, but UniCoach exceeded every expectation. The IELTS coaching was top-notch and my visa was approved in the first attempt. Highly recommend!',
  },
  {
    name: 'Vikram Singh',
    avatar: '👨🏽‍🎓',
    university: 'TU Munich',
    location: 'Germany',
    text: 'The Germany roadmap was crystal clear — from blocked account to university enrollment. UniCoach made the entire process seamless. I\'m now pursuing MS in Data Science!',
  },
  {
    name: 'Sneha Reddy',
    avatar: '👩🏽‍🔬',
    university: 'University of Melbourne',
    location: 'Australia',
    text: 'From IELTS preparation to scholarship applications, UniCoach covered everything. I received a 50% tuition waiver and couldn\'t be happier with my choice!',
  },
];

export const TestimonialsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stepWidth, setStepWidth] = useState(492);
  const [paddingLeft, setPaddingLeft] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      const w = window.innerWidth;
      if (w < 640) {
        // Mobile: card 300px + gap 20px
        setStepWidth(320);
        setPaddingLeft((w - 300) / 2);
      } else if (w < 1024) {
        // Tablet: card 400px + gap 28px
        setStepWidth(428);
        setPaddingLeft((w - 400) / 2);
      } else {
        // Desktop: card 480px + gap 36px
        setStepWidth(516);
        setPaddingLeft((w - 480) / 2);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const totalSteps = REVIEWS.length - 1;
  const maxTranslate = totalSteps * stepWidth;

  const x = useTransform(scrollYProgress, [0, 1], [0, -maxTranslate]);

  return (
    <section ref={containerRef} className="relative h-[260vh]" style={{ background: '#0a1a4a' }}>
      {/* Sticky Fullscreen Container */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden z-10">
        {/* Subtle dot texture background */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/[0.08] rounded-full blur-[140px] pointer-events-none" />

        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16 relative z-10 px-6">
          <p className="text-blue-300/70 text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            TESTIMONIALS
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-[3.5rem] font-black text-white/95 tracking-tight font-instrument leading-tight">
            Loved by Students Worldwide
          </h2>
        </div>

        {/* Horizontal Track of Review Cards */}
        <div className="relative w-full overflow-hidden">
          <motion.div
            style={{ x, paddingLeft: `${paddingLeft}px` }}
            className="flex items-center gap-5 sm:gap-7 md:gap-9 py-6"
          >
            {REVIEWS.map((review, i) => (
              <ScrollCard
                key={review.name}
                review={review}
                index={i}
                total={REVIEWS.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// Individual Scroll Card Component
// Dynamically adjusts scale, opacity, blur, background & text colors
// based on scroll position relative to center screen
// ==========================================
interface ScrollCardProps {
  review: typeof REVIEWS[0];
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}

const ScrollCard: React.FC<ScrollCardProps> = ({ review, index, total, scrollYProgress }) => {
  const centerPoint = index / (total - 1);
  const step = 1 / (total - 1);
  const halfStep = step * 0.75;

  const range = [
    Math.max(0, centerPoint - halfStep),
    centerPoint,
    Math.min(1, centerPoint + halfStep),
  ];

  // When card is in center: scale 1.05, opacity 1, blur 0px
  // When card is away: scale 0.88, opacity 0.3, blur 3px
  const scale = useTransform(scrollYProgress, range, [0.88, 1.05, 0.88]);
  const opacity = useTransform(scrollYProgress, range, [0.32, 1, 0.32]);
  const blurVal = useTransform(scrollYProgress, range, ['3px', '0px', '3px']);
  const filter = useTransform(blurVal, (v) => `blur(${v})`);

  // Centered card has light cream background `#e8e4de` with crisp dark text
  // Side cards have dark navy background `#0d2054`
  const bg = useTransform(scrollYProgress, range, ['#0d2054', '#e8e4de', '#0d2054']);
  const textColor = useTransform(
    scrollYProgress,
    range,
    ['rgba(255,255,255,0.35)', 'rgba(15,23,42,0.95)', 'rgba(255,255,255,0.35)']
  );
  const subTextColor = useTransform(
    scrollYProgress,
    range,
    ['rgba(255,255,255,0.25)', 'rgba(100,116,139,1)', 'rgba(255,255,255,0.25)']
  );
  const avatarBg = useTransform(
    scrollYProgress,
    range,
    ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0.1)']
  );

  return (
    <motion.div
      style={{
        scale,
        opacity,
        filter,
        backgroundColor: bg,
      }}
      className="flex-shrink-0 w-[300px] sm:w-[400px] md:w-[480px] rounded-3xl p-7 md:p-9 shadow-2xl transition-colors duration-200 cursor-grab active:cursor-grabbing"
    >
      {/* Avatar + Info */}
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          style={{ backgroundColor: avatarBg }}
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 shadow-inner"
        >
          {review.avatar}
        </motion.div>
        <div>
          <motion.p
            style={{ color: textColor }}
            className="font-bold text-base md:text-lg tracking-tight"
          >
            {review.name}
          </motion.p>
          <motion.p
            style={{ color: subTextColor }}
            className="text-xs md:text-sm font-medium"
          >
            {review.university}, {review.location}
          </motion.p>
        </div>
      </div>

      {/* Review Quote */}
      <motion.p
        style={{ color: textColor }}
        className="text-sm sm:text-base md:text-[1.08rem] leading-[1.7] font-medium"
      >
        "{review.text}"
      </motion.p>
    </motion.div>
  );
};
