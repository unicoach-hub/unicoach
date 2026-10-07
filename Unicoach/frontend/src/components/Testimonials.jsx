import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ChevronLeft, ChevronRight, Volume2, Sparkles } from 'lucide-react';

import videoAyyaz from '@/assets/testimonial/video_ayyaz.mp4';
import videoNamrita from '@/assets/testimonial/video_namrita.mp4';
import videoAkshat from '@/assets/testimonial/video_akshat.mp4';
import videoAnurag from '@/assets/testimonial/video_anurag.mp4';
import videoHardik from '@/assets/testimonial/video_hardik.mp4';
import videoPreeti from '@/assets/testimonial/video_preeti.mp4';

import thumbAyyaz from '@/assets/testimonial/thumb_ayyaz.webp';
import thumbNamrita from '@/assets/testimonial/thumb_namrita.webp';
import thumbAkshat from '@/assets/testimonial/thumb_akshat.webp';
import thumbAnurag from '@/assets/testimonial/thumb_anurag.webp';
import thumbHardik from '@/assets/testimonial/thumb_hardik.webp';
import thumbPreeti from '@/assets/testimonial/thumb_preeti.webp';

import avatarAyyaz from '@/assets/testimonial/avatar_ayyaz.webp';
import avatarNamrita from '@/assets/testimonial/avatar_namrita.webp';
import avatarAkshat from '@/assets/testimonial/avatar_akshat.webp';
import avatarAnurag from '@/assets/testimonial/avatar_anurag.webp';
import avatarHardik from '@/assets/testimonial/avatar_hardik.webp';
import avatarPreeti from '@/assets/testimonial/avatar_preeti.webp';

const student = (name, videoUrl, thumbnail, avatar) => ({
  id: `video-${name.toLowerCase()}`,
  name,
  role: 'UniCoach Student',
  tag: 'Success Story',
  videoUrl,
  thumbnail,
  avatar,
});

// Real UniCoach students, named as in the owner's video files. Each video is listed once:
// the row below loops, so nothing has to be repeated here.
const VIDEO_TESTIMONIALS = [
  student('Ayyaz', videoAyyaz, thumbAyyaz, avatarAyyaz),
  student('Namrita', videoNamrita, thumbNamrita, avatarNamrita),
  student('Akshat', videoAkshat, thumbAkshat, avatarAkshat),
  student('Anurag', videoAnurag, thumbAnurag, avatarAnurag),
  student('Hardik', videoHardik, thumbHardik, avatarHardik),
  student('Preeti', videoPreeti, thumbPreeti, avatarPreeti),
];

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
    <div className="relative aspect-[9/13] w-full rounded-[22px] sm:rounded-[26px] overflow-hidden bg-slate-900 shadow-md group-hover:shadow-xl transition-all duration-300">
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

      {/* Subtle Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Tag Pill (Top Left) */}
      <div className="absolute top-3.5 left-3.5 z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-black/45 backdrop-blur-md text-white border border-white/20">
          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
          {item.tag}
        </span>
      </div>

      {/* Frosted Glass Play Button (Center) */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white/35 backdrop-blur-md border border-white/60 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:bg-[#DE5C2B] group-hover:border-[#DE5C2B] transition-all duration-300">
          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white ml-0.5" />
        </div>
      </div>

      {/* Bottom Sound Pill */}
      <div className="absolute bottom-3 right-3 z-10">
        <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 border border-white/10">
          <Volume2 className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>

    {/* ── Author Profile Below Card ── */}
    <div className="flex items-center gap-3 mt-3 px-1">
      <img
        src={item.avatar}
        alt=""
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200/90 shadow-2xs shrink-0"
        loading="lazy"
      />
      <div className="min-w-0">
        <h4 className="font-outfit font-bold text-slate-900 text-[13.5px] sm:text-[14px] leading-tight truncate group-hover:text-[#DE5C2B] transition-colors">
          {item.name}
        </h4>
        <p className="text-[11px] sm:text-[11.5px] text-slate-500 font-medium leading-tight truncate mt-0.5">
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
      className="pt-6 sm:pt-8 pb-4 sm:pb-6 bg-[#FAF9F6] border-b border-orange-100/60 relative overflow-hidden select-none w-full max-w-full"
    >
      {/* Background Soft Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[350px] bg-orange-100/25 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[350px] bg-amber-50/35 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10 w-full min-w-0">

        {/* ════════ HEADER ROW WITH TOP-RIGHT CONTROLS ════════ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 border border-orange-200/90 shadow-2xs mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DE5C2B] animate-pulse" />
              <span className="text-[11.5px] font-bold text-slate-800 tracking-tight">
                STUDENT SUCCESS STORIES
              </span>
            </div>

            <h2 className="font-outfit text-[28px] sm:text-[36px] lg:text-[42px] font-black text-[#111111] leading-tight tracking-tight">
              Hear what our{' '}
              <span className="relative inline-block text-[#DE5C2B]">
                students
                <span className="absolute -bottom-1 left-0 w-full h-[6px] bg-[#FED7CE] rounded-full -z-10" />
              </span>{' '}
              are saying
            </h2>
            <p className="text-[13.5px] sm:text-[14.5px] text-slate-600 mt-2 max-w-xl font-normal">
              Real, unscripted videos from UniCoach students about their study abroad journey.
            </p>
          </div>

          {/* Navigation Controls (Top Right) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleScroll('left')}
              className="w-10 h-10 rounded-full bg-white border border-slate-200/90 hover:border-orange-300 hover:text-[#DE5C2B] text-slate-700 flex items-center justify-center shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-10 h-10 rounded-full bg-white border border-slate-200/90 hover:border-orange-300 hover:text-[#DE5C2B] text-slate-700 flex items-center justify-center shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-4.5 h-4.5" />
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
          className="flex items-start gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-4 pt-1"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-sm bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
              style={{ maxHeight: 'calc(100vh - 48px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer"
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
              <div className="p-4 bg-slate-900 flex items-center justify-between text-white border-t border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={activeVideo.avatar}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <h5 className="font-outfit font-bold text-sm leading-tight">
                      {activeVideo.name}
                    </h5>
                    <p className="text-slate-400 text-[11px]">
                      {activeVideo.role}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-full">
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
