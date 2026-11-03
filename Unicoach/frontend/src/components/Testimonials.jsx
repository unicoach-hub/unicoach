import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ChevronLeft, ChevronRight, Volume2, Sparkles } from 'lucide-react';

import { STUDENT_VIDEOS } from '@/data/studentVideos';
import { GooglyEyes, StickerLabel } from './ui/BrandElements';

const VIDEO_TESTIMONIALS = STUDENT_VIDEOS;

// The track holds three copies of the list and quietly jumps by one copy whenever the view
// leaves the middle one, so scrolling (or the slow auto-drift) never reaches an end.
const LOOP_COPIES = 3;
const MIDDLE_COPY = 1;
const AUTO_SCROLL_PX_PER_SEC = 24;

const loopWidth = (track) => {
  const nextCopy = track.children[VIDEO_TESTIMONIALS.length];
  return nextCopy ? nextCopy.offsetLeft - track.children[0].offsetLeft : 0;
};

const keepInMiddleCopy = (track) => {
  const width = loopWidth(track);
  if (!width) return;
  if (track.scrollLeft < width * 0.5) track.scrollLeft += width;
  else if (track.scrollLeft > width * 1.5) track.scrollLeft -= width;
};

const VideoCard = ({ item, isClone, onOpen }) => (
  <div
    className="w-[220px] sm:w-[250px] lg:w-[270px] shrink-0 flex flex-col group cursor-pointer"
    onClick={() => onOpen(item)}
    {...(isClone
      ? { 'aria-hidden': true }
      : {
          role: 'button',
          tabIndex: 0,
          'aria-label': `Play ${item.name}'s video`,
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpen(item);
            }
          },
        })}
  >
    {/* ── Tall Portrait Video Card ── */}
    <div className="relative aspect-[9/13] w-full rounded-[20px] overflow-hidden bg-[#16130F] border-[3px] border-[#16130F] shadow-[5px_5px_0_#16130F] group-hover:shadow-[7px_7px_0_#DE5C2B] group-hover:-translate-y-1 transition-[transform,box-shadow] duration-200">
      {/* Muted preview plays on hover; the poster shows otherwise */}
      <video
        src={item.videoUrl}
        poster={item.thumbnail}
        muted
        playsInline
        loop
        preload={isClone ? 'none' : 'metadata'}
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        onMouseEnter={(e) => {
          try {
            const p = e.currentTarget.play();
            if (p !== undefined) p.catch(() => {});
          } catch {
            // Autoplay can be blocked; the poster simply stays
          }
        }}
        onMouseLeave={(e) => {
          try {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          } catch {
            // Nothing to reset if the video never loaded
          }
        }}
      />

      {/* Tag Pill (Top Left) */}
      <div className="absolute top-3.5 left-3.5 z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-bold bg-[#F2B705] text-[#16130F] border-2 border-[#16130F]">
          <Sparkles className="w-3 h-3 text-[#16130F]" />
          {item.tag}
        </span>
      </div>

      {/* Play button (center) */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white border-[3px] border-[#16130F] shadow-[3px_3px_0_#16130F] flex items-center justify-center text-[#16130F] group-hover:scale-110 group-hover:bg-[#DE5C2B] group-hover:text-white transition-[transform,background-color,color] duration-200">
          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
        </div>
      </div>

      {/* Bottom Sound Pill */}
      <div className="absolute bottom-3 right-3 z-10">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#16130F] border-2 border-[#16130F]">
          <Volume2 className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>

    {/* ── Author Profile Below Card ── */}
    <div className="flex items-center gap-3 mt-3.5 px-1">
      <img
        src={item.avatar}
        alt=""
        className="w-10 h-10 rounded-full object-cover border-2 border-[#16130F] bg-white shrink-0"
        loading="lazy"
      />
      <div className="min-w-0">
        <h4 className="font-urbanist font-extrabold text-[#16130F] text-[15px] leading-tight truncate group-hover:text-[#D0362E] transition-colors">
          {item.name}
        </h4>
        <p className="text-[12.5px] text-[#5B544A] font-medium leading-tight truncate mt-0.5">
          {item.role}
        </p>
      </div>
    </div>
  </div>
);

export const Testimonials = () => {
  const [activeVideo, setActiveVideo] = useState(null);
  const trackRef = useRef(null);
  const hoverRef = useRef(false);
  const modalOpenRef = useRef(false);
  const holdUntilRef = useRef(0);

  useEffect(() => {
    modalOpenRef.current = Boolean(activeVideo);
  }, [activeVideo]);

  // Slow auto-drift + endless looping. Pauses while hovered/focused, while a video is open,
  // for a moment after any manual scroll, and whenever the row is off screen.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    track.scrollLeft = loopWidth(track) * MIDDLE_COPY;

    let onScreen = true;
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    observer.observe(track);

    let frame;
    let last = performance.now();
    let carry = 0;
    const tick = (now) => {
      const dt = Math.min(now - last, 100);
      last = now;
      const paused = !onScreen || document.hidden || hoverRef.current || modalOpenRef.current || now < holdUntilRef.current;
      if (!paused) {
        carry += (AUTO_SCROLL_PX_PER_SEC * dt) / 1000;
        if (carry >= 1) {
          const step = Math.floor(carry);
          carry -= step;
          track.scrollLeft += step;
        }
        keepInMiddleCopy(track);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // Manual scrolling (wheel, swipe, drag): hold the drift and loop once the scroll settles
    let settle;
    const holdForUser = () => {
      holdUntilRef.current = performance.now() + 2500;
    };
    const onScroll = () => {
      clearTimeout(settle);
      settle = setTimeout(() => keepInMiddleCopy(track), 150);
    };
    const userEvents = ['wheel', 'touchstart', 'touchmove', 'pointerdown'];
    userEvents.forEach((type) => track.addEventListener(type, holdForUser, { passive: true }));
    track.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      observer.disconnect();
      userEvents.forEach((type) => track.removeEventListener(type, holdForUser));
      track.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleScroll = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    holdUntilRef.current = performance.now() + 1500;
    keepInMiddleCopy(track);
    const card = track.children[0];
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = card ? card.offsetWidth + gap : 300;
    track.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

  return (
    <section
      id="video-testimonials"
      className="pt-12 sm:pt-16 pb-10 sm:pb-14 bg-[#FFF6E5] relative overflow-hidden select-none w-full max-w-full"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10 w-full min-w-0">

        {/* ════════ HEADER ROW WITH TOP-RIGHT CONTROLS ════════ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <p className="font-urbanist font-extrabold text-[16px] leading-none text-[#D0362E]">Seedha students se suno</p>
            <p className="mt-1.5 text-[12px] sm:text-[12.5px] font-black text-[#16130F] uppercase tracking-[0.12em]">Student success stories</p>

            <div className="flex items-center gap-3 mt-4 mb-3" aria-hidden="true">
              <GooglyEyes size={26} />
              <StickerLabel tone="mustard" tilt={-4}>real &amp; unscripted</StickerLabel>
            </div>
            <h2 className="font-urbanist text-[30px] sm:text-[38px] lg:text-[44px] font-black text-[#16130F] leading-[1.08] tracking-[-0.035em]">
              Hear what our{' '}
              <span className="text-[#D0362E]">students</span>{' '}
              are saying
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#5B544A] mt-3 max-w-xl font-medium leading-relaxed">
              Real, unscripted videos from UniCoach students about their study abroad journey.
            </p>
          </div>

          {/* Navigation Controls (Top Right) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleScroll('left')}
              className="w-11 h-11 rounded-full bg-white border-[3px] border-[#16130F] text-[#16130F] shadow-[3px_3px_0_#16130F] hover:bg-[#F2B705] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0_#16130F] flex items-center justify-center transition-[transform,background-color,box-shadow] cursor-pointer"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-11 h-11 rounded-full bg-white border-[3px] border-[#16130F] text-[#16130F] shadow-[3px_3px_0_#16130F] hover:bg-[#F2B705] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0_#16130F] flex items-center justify-center transition-[transform,background-color,box-shadow] cursor-pointer"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ════════ VIDEO CAROUSEL TRACK (endless loop) ════════ */}
        <div
          ref={trackRef}
          onMouseEnter={() => { hoverRef.current = true; }}
          onMouseLeave={() => { hoverRef.current = false; }}
          onFocus={() => { hoverRef.current = true; }}
          onBlur={() => { hoverRef.current = false; }}
          className="flex items-start gap-5 sm:gap-6 overflow-x-auto scrollbar-none pb-4 pt-2 pr-2"
        >
          {Array.from({ length: LOOP_COPIES }, (_, copy) =>
            VIDEO_TESTIMONIALS.map((item) => (
              <VideoCard
                key={`${copy}-${item.id}`}
                item={item}
                isClone={copy !== MIDDLE_COPY}
                onOpen={setActiveVideo}
              />
            ))
          )}
        </div>

      </div>

      {/* ════════ INTERACTIVE VIDEO MODAL PLAYER ════════ */}
      <AnimatePresence>
        {activeVideo && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#16130F]/85"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-sm bg-[#16130F] rounded-[22px] overflow-hidden border-[3px] border-[#16130F] shadow-[6px_6px_0_#F2B705] flex flex-col"
              style={{ maxHeight: 'calc(100vh - 48px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-white text-[#16130F] border-2 border-[#16130F] hover:bg-[#F2B705] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close video"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Video Player */}
              <div className="relative w-full bg-black flex items-center justify-center overflow-hidden" style={{ height: 'min(65vh, 500px)' }}>
                <video
                  key={activeVideo.id}
                  src={activeVideo.videoUrl}
                  poster={activeVideo.thumbnail}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Bottom Details Bar */}
              <div className="p-4 bg-[#FFF6E5] flex items-center justify-between gap-3 text-[#16130F] border-t-[3px] border-[#16130F]">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeVideo.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#16130F] bg-white shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="font-urbanist font-extrabold text-[15px] leading-tight truncate">
                      {activeVideo.name}
                    </h5>
                    <p className="text-[#5B544A] text-[12.5px] truncate">
                      {activeVideo.role}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[11.5px] font-bold text-[#16130F] bg-[#DDF3EF] border-2 border-[#16130F] px-2.5 py-1 rounded-full">
                  {activeVideo.tag}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Testimonials;
