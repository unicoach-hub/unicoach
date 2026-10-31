// ════════════════════════════════════════════════════════════════════════════════
// StudentTestimonialSection.jsx — STUDENT SUCCESS STORIES
// Student perspective testimonials
// Flat rani-pink Desi Pop bg, ink-bordered cards in a single auto-scrolling row.
// Native horizontal scroll (touch swipe / trackpad / mouse drag) + a slow
// rAF auto-scroll that pauses on hover, focus or touch (runs for everyone, owner's choice).
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';

const TESTIMONIALS = [
  {
    quote: 'Aarav helped me understand the exact SOP format TU Munich expects. Got my admit letter in just 2 months after our session!',
    name: 'Rohan Mehta',
    role: 'M.Sc. Computer Science • TU Munich Admit'
  },
  {
    quote: 'Booked a 1:1 with an Oxford senior. Best ₹499 I ever spent. Crystal clear guidance on my personal statement and interview prep.',
    name: 'Priya Sharma',
    role: 'MPP Candidate • University of Oxford'
  },
  {
    quote: 'The visa prep session saved me from 3 common mistakes I didn\'t even know about. Cleared my F1 interview on the first attempt!',
    name: 'Ananya Singh',
    role: 'MS in Data Science • Columbia University'
  },
  {
    quote: 'My mentor reviewed my SOP line by line and rewrote the opening paragraph. The difference was night and day. Highly recommended.',
    name: 'Vikram Reddy',
    role: 'M.Eng. Mechanical • RWTH Aachen Admit'
  },
  {
    quote: 'Was confused between 5 universities. The Priority DM option let me get answers in 12 hours without booking a full call. Super convenient!',
    name: 'Meera Joshi',
    role: 'MS in AI • University of Toronto Admit'
  },
  {
    quote: 'UniCoach connected me with someone who actually studied at my dream campus. No consultant could give me that insider perspective.',
    name: 'Arjun Kapoor',
    role: 'MBA Candidate • HEC Paris'
  }
];

// "Rohan Mehta" -> "RM"
const getInitials = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');

// Auto-scroll speed in px per second
const AUTO_SCROLL_SPEED = 28;
// How long to wait after a touch/drag before auto-scroll resumes
const RESUME_DELAY_MS = 2500;

const TestimonialCard = ({ item, hidden }) => (
  <div className="shrink-0 pr-3.5 sm:pr-4" aria-hidden={hidden ? 'true' : undefined}>
    <figure className="w-[260px] sm:w-[310px] h-full bg-white rounded-[18px] p-4 sm:p-5 flex flex-col justify-between border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] text-left">
      <blockquote>
        <span className="font-urbanist text-[40px] font-black text-[#B8285B] block leading-[0.6] mt-2 mb-1" aria-hidden="true">
          &ldquo;
        </span>
        <p className="text-[#16130F] text-[14px] sm:text-[15px] font-semibold leading-relaxed">
          {item.quote}
        </p>
      </blockquote>

      <figcaption className="flex items-center gap-2.5 pt-3 mt-3 border-t-2 border-dashed border-[#16130F]/25">
        <span
          className="w-9 h-9 rounded-full bg-[#F2B705] text-[#16130F] border-2 border-[#16130F] font-urbanist font-black text-[12px] flex items-center justify-center shrink-0 select-none"
          aria-hidden="true"
        >
          {getInitials(item.name)}
        </span>
        <div className="min-w-0">
          <div className="font-urbanist text-[15px] font-extrabold text-[#16130F] leading-tight truncate">
            {item.name}
          </div>
          <div className="text-[12px] text-[#5B544A] font-medium truncate">
            {item.role}
          </div>
        </div>
      </figcaption>
    </figure>
  </div>
);

export const StudentTestimonialSection = () => {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;

    let raf = 0;
    let last = 0;
    let pos = el.scrollLeft;
    let hovering = false;
    let holdUntil = 0; // timestamp until which auto-scroll stays paused
    let drag = null;

    const step = (now) => {
      const dt = last ? Math.min(now - last, 64) : 0;
      last = now;
      const half = el.scrollWidth / 2;

      // If the user scrolled manually (wheel / swipe), adopt their position
      if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft;

      if (!hovering && !drag && now >= holdUntil && half > el.clientWidth) {
        pos += (AUTO_SCROLL_SPEED * dt) / 1000;
      }
      // Seamless loop: both halves are identical, so jump back by one half
      if (half > 0 && pos >= half) pos -= half;
      if (half > 0 && pos < 0) pos += half;
      el.scrollLeft = pos;
      raf = requestAnimationFrame(step);
    };

    const hold = () => { holdUntil = performance.now() + RESUME_DELAY_MS; };
    const onEnter = () => { hovering = true; };
    const onLeave = () => { hovering = false; };
    const onTouch = () => hold();
    const onWheel = () => hold();

    // Mouse drag-to-scroll (touch already scrolls natively)
    const onPointerDown = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, start: el.scrollLeft, moved: false };
    };
    const onPointerMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 3) drag.moved = true;
      pos = drag.start - dx;
      el.scrollLeft = pos;
    };
    const onPointerUp = () => {
      if (!drag) return;
      drag = null;
      hold();
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('focusin', onEnter);
    el.addEventListener('focusout', onLeave);
    el.addEventListener('touchstart', onTouch, { passive: true });
    el.addEventListener('touchmove', onTouch, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('focusin', onEnter);
      el.removeEventListener('focusout', onLeave);
      el.removeEventListener('touchstart', onTouch);
      el.removeEventListener('touchmove', onTouch);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  return (
    <section className="bg-[#B8285B] text-white py-14 sm:py-20 relative overflow-hidden border-y-[3px] border-[#16130F]">

      {/* Background glow highlights */}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle,rgba(22,19,15,.16)_1.3px,transparent_1.7px)] [background-size:12px_12px] pointer-events-none" />

      <div className="relative z-10 text-center">

        {/* Title */}
        <p className="font-urbanist font-extrabold text-[16px] text-[#F2B705] px-4">Students ki zubaani</p>
        <h2 className="mt-1.5 font-urbanist text-[34px] sm:text-[52px] lg:text-[60px] font-black text-white tracking-[-0.04em] mb-8 sm:mb-12 px-4 [text-shadow:4px_4px_0_#16130F]">
          What Students Are Saying
        </h2>

        {/* Single horizontally scrolling row */}
        <div
          ref={scrollerRef}
          role="region"
          aria-label="Student testimonials, scroll horizontally"
          tabIndex={0}
          className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B705] [mask-image:linear-gradient(to_right,transparent_0,black_6%,black_94%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0,black_6%,black_94%,transparent_100%)]"
        >
          <div className="flex w-max items-stretch py-2">
            {[0, 1].map((copy) =>
              TESTIMONIALS.map((item, index) => (
                <TestimonialCard key={`${copy}-${index}`} item={item} hidden={copy === 1} />
              ))
            )}
          </div>
        </div>

      </div>

    </section>
  );
};
