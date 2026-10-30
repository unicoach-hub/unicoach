import { useRef, useState } from 'react';
import { Play } from 'lucide-react';

// Short silent product tour (captions are burned into the video).
// Shows the poster with a play button and loads nothing until it is played, so pages stay light.
// Videos and posters live in public/videos/tutorials (made with graphics/tutorials/*.mjs).
export default function TutorialVideo({ src, poster, title, duration, className = '' }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    setPlaying(true);
    ref.current?.play().catch(() => {});
  };

  return (
    <figure className={`m-0 bg-white border border-[#E6E0D4] shadow-[0_24px_60px_-36px_rgba(22,19,15,0.45)] overflow-hidden ${className}`} style={{ borderRadius: 18 }}>
      <div className="relative aspect-video bg-[#F6F3EC]">
        <video
          ref={ref}
          src={src}
          poster={poster}
          preload="none"
          playsInline
          muted
          controls={playing}
          onEnded={() => setPlaying(false)}
          className="w-full h-full object-cover"
          aria-label={title}
        />
        {!playing && (
          <button type="button" onClick={play} aria-label={`Play: ${title}`}
            className="no-shine group absolute inset-0 grid place-items-center bg-[#16130F]/0 hover:bg-[#16130F]/10 transition-colors cursor-pointer">
            <span className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-[#DE5C2B] text-white grid place-items-center border-[3px] border-[#16130F] shadow-[4px_4px_0_#16130F] transition-transform group-hover:scale-105">
              <Play size={26} fill="currentColor" className="ml-1" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
        <span className="font-semibold text-[#16130F]">{title}</span>
        <span className="text-[#6B6458] whitespace-nowrap">{duration} · no sound needed</span>
      </figcaption>
    </figure>
  );
}
