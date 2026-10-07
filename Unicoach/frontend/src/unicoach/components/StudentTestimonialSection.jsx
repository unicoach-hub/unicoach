// ════════════════════════════════════════════════════════════════════════════════
// StudentTestimonialSection.jsx — STUDENT SUCCESS STORIES
// Student perspective testimonials
// Dark teal bg, compact cards in a single auto-scrolling row.
// Native horizontal scroll (touch swipe / trackpad / mouse drag) + a slow
// rAF auto-scroll that pauses on hover, focus or touch (runs for everyone, owner's choice).
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react';

const TESTIMONIALS = [
  {
    quote: 'Aarav helped me understand the exact SOP format TU Munich expects. Got my admit letter in just 2 months after our session!',
    name: 'Rohan Mehta',
    role: 'M.Sc. Computer Science • TU Munich Admit',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80'
  },
  {
    quote: 'Booked a 1:1 with an Oxford senior. Best ₹499 I ever spent. Crystal clear guidance on my personal statement and interview prep.',
    name: 'Priya Sharma',
    role: 'MPP Candidate • University of Oxford',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80'
  },
  {
    quote: 'The visa prep session saved me from 3 common mistakes I didn\'t even know about. Cleared my F1 interview on the first attempt!',
    name: 'Ananya Singh',
    role: 'MS in Data Science • Columbia University',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
  },
  {
    quote: 'My mentor reviewed my SOP line by line and rewrote the opening paragraph. The difference was night and day. Highly recommended.',
    name: 'Vikram Reddy',
    role: 'M.Eng. Mechanical • RWTH Aachen Admit',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80'
  },
  {
    quote: 'Was confused between 5 universities. The Priority DM option let me get answers in 12 hours without booking a full call. Super convenient!',
    name: 'Meera Joshi',
    role: 'MS in AI • University of Toronto Admit',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80'
  },
  {
    quote: 'UniCoach connected me with someone who actually studied at my dream campus. No consultant could give me that insider perspective.',
    name: 'Arjun Kapoor',
    role: 'MBA Candidate • HEC Paris',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160&auto=format&fit=crop&q=80'
  }
];

// Auto-scroll speed in px per second
const AUTO_SCROLL_SPEED = 28;
// How long to wait after a touch/drag before auto-scroll resumes
const RESUME_DELAY_MS = 2500;

const TestimonialCard = ({ item, hidden }) => (
  <div className="shrink-0 pr-3.5 sm:pr-4" aria-hidden={hidden ? 'true' : undefined}>
    <figure className="w-[248px] sm:w-[290px] h-full bg-[#F1F4F5] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg text-left">
      <blockquote>
        <span className="text-2xl font-serif text-slate-300 block leading-none mb-1" aria-hidden="true">
          &ldquo;
        </span>
        <p className="text-slate-900 text-[12.5px] sm:text-[13px] font-semibold leading-relaxed">
          {item.quote}
        </p>
      </blockquote>

      <figcaption className="flex items-center gap-2.5 pt-3 mt-3 border-t border-slate-200/70">
        <img
          src={item.image}
          alt={hidden ? '' : item.name}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
          loading="lazy"
          draggable="false"
        />
        <div className="min-w-0">
          <div className="font-outfit text-[13px] font-bold text-slate-950 leading-tight truncate">
            {item.name}
          </div>
          <div className="text-[10.5px] text-slate-500 font-medium truncate">
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
    <section className="bg-[#182B30] text-white py-14 sm:py-20 relative overflow-hidden">

      {/* Background glow highlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-teal-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center">

        {/* Title */}
        <h2 className="font-outfit text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-8 sm:mb-12 px-4">
          What Students Are Saying
        </h2>

        {/* Single horizontally scrolling row */}
        <div
          ref={scrollerRef}
          role="region"
          aria-label="Student testimonials, scroll horizontally"
          tabIndex={0}
          className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 [mask-image:linear-gradient(to_right,transparent_0,black_6%,black_94%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0,black_6%,black_94%,transparent_100%)]"
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
