import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PlayCircle, X } from 'lucide-react';

// "Watch the 1-min video" button that opens a product tour video in a popup.
// The video only loads when the popup opens. Files live in public/videos/tutorials.
export default function TutorialVideoButton({ src, poster, title, label = 'Watch 1-min video', className = '' }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <PlayCircle size={16} /> {label}
      </button>
      {open && createPortal(
        <div role="dialog" aria-modal="true" aria-label={title} onClick={() => setOpen(false)}
          className="fixed inset-0 z-[300] bg-[#16130F]/70 backdrop-blur-[2px] grid place-items-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[960px] bg-white overflow-hidden shadow-2xl" style={{ borderRadius: 18 }}>
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-[#ECE6DA]">
              <p className="text-[14px] sm:text-[15px] font-semibold text-[#16130F] truncate">{title}</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close video"
                className="w-9 h-9 rounded-full grid place-items-center text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0">
                <X size={18} />
              </button>
            </div>
            <video src={src} poster={poster} controls autoPlay muted playsInline className="block w-full aspect-video bg-[#F6F3EC]" />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
