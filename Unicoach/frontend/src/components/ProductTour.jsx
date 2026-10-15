import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

// Step-by-step product tour: dims the page, lights up one element at a time and explains it.
// Always skippable (Skip, ✕, Esc or clicking outside). A step whose element isn't on screen
// (e.g. the sidebar on a phone) is shown as a centred card instead.
//
// steps: [{ target: '[data-tour="nav-overview"]', title, body, onEnter?: () => void }]

const PAD = 8;
const CARD_W = 340;

const findVisible = (selector) => {
  if (!selector) return null;
  for (const el of document.querySelectorAll(selector)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden') return el;
  }
  return null;
};

export default function ProductTour({ steps, open, onClose }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const step = steps[index];

  const measure = useCallback(() => {
    const el = findVisible(step?.target);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
  }, [step]);

  // Run the step's setup (e.g. open a tab), bring the element into view, then measure
  useLayoutEffect(() => {
    if (!open || !step) return undefined;
    step.onEnter?.();
    const t = setTimeout(() => {
      const el = findVisible(step.target);
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setTimeout(measure, 320);
    }, 60);
    return () => clearTimeout(t);
    // Re-run only when the step changes; `step` and `measure` follow from it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose('skipped');
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, steps.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, measure, onClose, steps.length]);

  if (!open || !step) return null;

  const last = index === steps.length - 1;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(CARD_W, vw - 24);

  // Card goes to the right of the element, else below, else above; centred when there is no element
  let cardStyle;
  if (!rect) {
    cardStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  } else if (rect.left + rect.width + cardW + 24 < vw && rect.width < vw * 0.5) {
    cardStyle = { top: Math.min(Math.max(12, rect.top), vh - 260), left: rect.left + rect.width + 14 };
  } else if (rect.top + rect.height + 230 < vh) {
    cardStyle = { top: rect.top + rect.height + 12, left: Math.min(Math.max(12, rect.left), vw - cardW - 12) };
  } else {
    cardStyle = { top: Math.max(12, rect.top - 232), left: Math.min(Math.max(12, rect.left), vw - cardW - 12) };
  }

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Product tour" style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
      {/* Dimmed page with a window around the current element */}
      <div
        onClick={() => onClose('skipped')}
        style={{ position: 'fixed', inset: 0, background: rect ? 'transparent' : 'rgba(15,23,42,0.55)' }}
      />
      {rect && (
        <div
          style={{
            position: 'fixed', top: rect.top, left: rect.left, width: rect.width, height: rect.height,
            borderRadius: 14, boxShadow: '0 0 0 9999px rgba(15,23,42,0.55), 0 0 0 3px #DE5C2B',
            transition: 'all .3s ease', pointerEvents: 'none',
          }}
        />
      )}

      <div
        style={{
          position: 'fixed', width: cardW, background: '#fff', borderRadius: 18, padding: 18,
          boxShadow: '0 20px 50px rgba(15,23,42,0.25)', transition: 'top .3s ease, left .3s ease', ...cardStyle,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#DE5C2B', letterSpacing: '0.04em' }}>
            <Sparkles size={13} /> STEP {index + 1} OF {steps.length}
          </span>
          <button type="button" onClick={() => onClose('skipped')} aria-label="Close tour" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: 2 }}>
            <X size={16} />
          </button>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111', margin: '0 0 6px', lineHeight: 1.3 }}>{step.title}</h3>
        <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.55, margin: 0 }}>{step.body}</p>

        <div style={{ display: 'flex', gap: 4, margin: '14px 0' }}>
          {steps.map((_, i) => (
            <span key={i} style={{ height: 4, flex: 1, borderRadius: 4, background: i <= index ? '#DE5C2B' : '#f1f5f9', transition: 'background .2s' }} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <button type="button" onClick={() => onClose('skipped')} style={{ border: 'none', background: 'transparent', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 4px' }}>
            Skip tour
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            {index > 0 && (
              <button type="button" onClick={() => setIndex(index - 1)} aria-label="Previous step" style={{ height: 38, width: 38, borderRadius: 999, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <ArrowLeft size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={() => (last ? onClose('finished') : setIndex(index + 1))}
              style={{ height: 38, padding: '0 16px', borderRadius: 999, border: 'none', background: '#111', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {last ? 'Finish' : 'Next'} {!last && <ArrowRight size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
