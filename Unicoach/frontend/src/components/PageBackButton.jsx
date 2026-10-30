import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// "Back" pill at the top left of every page (just under the navbar; scrolls away with the page).
// Not on the homepage, dashboards, sign-in screens or Course Finder (own Back), and it steps aside when the page
// already has its own back link near the top ("Back to all articles" and the like).
// Hidden on phones: they have a system back gesture, and the pill landed on top of centred page badges.
const PageBackButton = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const hidden = pathname === '/'
    || new URLSearchParams(search).get('embed') === 'true'
    || /dashboard|^\/(login|signin|signup|register|reset-password|f\/)/.test(pathname)
    // Course Finder draws its own Back inside its layout (results -> details step)
    || pathname === '/search-programs';
  const ref = useRef(null);
  const [ownBackOn, setOwnBackOn] = useState(null); // pathname where the page showed its own back link
  const pageHasBack = ownBackOn === pathname;

  useEffect(() => {
    if (hidden) return undefined;
    const check = () => {
      const own = [...document.querySelectorAll('a, button')].some((el) => el !== ref.current
        && /^\s*(←\s*)?back\b/i.test(el.textContent || '')
        && el.getBoundingClientRect().top < 420 && el.offsetParent !== null);
      if (own) setOwnBackOn(pathname);
    };
    const timers = [100, 500, 1500].map((ms) => setTimeout(check, ms));
    return () => timers.forEach(clearTimeout);
  }, [hidden, pathname]);

  // If the page puts something (a breadcrumb, a badge) where the pill sits, nudge that row
  // to the right of the pill so they never overlap. Re-checked after lazy content loads.
  useEffect(() => {
    if (hidden || pageHasBack) return undefined;
    const nudged = [];
    const fit = () => {
      const btn = ref.current;
      if (!btn || !btn.offsetParent) return; // hidden on phones
      const r = btn.getBoundingClientRect();
      const y = r.top + r.height / 2;
      for (const x of [r.left + 8, r.left + r.width / 2, r.right - 6]) {
        const hit = document.elementsFromPoint(x, y).find((el) => !btn.contains(el) && el.textContent.trim() && el.getBoundingClientRect().height < 80);
        if (!hit) continue;
        const row = hit.closest('nav, ol, ul') || hit.closest('div, p') || hit;
        if (row.dataset.backNudged) continue;
        row.dataset.backNudged = '1';
        row.style.paddingLeft = `${Math.ceil(r.right - row.getBoundingClientRect().left + 12)}px`;
        nudged.push(row);
      }
    };
    const timers = [150, 600, 1500].map((ms) => setTimeout(fit, ms));
    return () => {
      timers.forEach(clearTimeout);
      nudged.forEach((el) => { el.style.paddingLeft = ''; delete el.dataset.backNudged; });
    };
  }, [hidden, pageHasBack, pathname]);

  if (hidden || pageHasBack) return null;

  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate('/');
  };

  return (
    <button
      type="button"
      ref={ref}
      onClick={goBack}
      aria-label="Go back"
      className="no-shine absolute z-40 top-[86px] md:top-[94px] left-4 sm:left-6 lg:left-10 hidden sm:inline-flex items-center gap-1.5 h-9 pl-3 pr-4 rounded-full bg-white/90 backdrop-blur border border-slate-200 text-[13.5px] font-semibold text-slate-700 hover:text-slate-950 hover:border-slate-300 shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-colors cursor-pointer"
    >
      <ArrowLeft size={16} strokeWidth={2.2} />
      Back
    </button>
  );
};

export default PageBackButton;
