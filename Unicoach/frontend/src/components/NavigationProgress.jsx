import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Only show the bar when a navigation is genuinely slow (e.g. the next page's
// code is still downloading). Quick in-app navigations show nothing.
const SHOW_DELAY_MS = 200;
// Never leave the bar on screen if a navigation never completes.
const MAX_VISIBLE_MS = 8000;

/**
 * NavigationProgress — thin top progress bar for page changes.
 *
 * Starts on real page navigations (history.pushState, back/forward) and
 * completes as soon as React Router renders the new location. There is no
 * full-screen overlay: the current page stays visible and usable, and
 * query-string updates (replaceState) never trigger it.
 */
const NavigationProgress = () => {
  const location = useLocation();
  const [bar, setBar] = useState({ value: 0, visible: false });
  const controlsRef = useRef(null);
  const lastLocationRef = useRef(location.pathname + location.search);

  useEffect(() => {
    let showTimer;
    let tickTimer;
    let hideTimer;
    let resetTimer;
    let safetyTimer;
    let pending = false;
    let value = 0;

    const clearTimers = () => {
      clearTimeout(showTimer);
      clearInterval(tickTimer);
      clearTimeout(hideTimer);
      clearTimeout(resetTimer);
      clearTimeout(safetyTimer);
    };

    const done = () => {
      if (!pending) return;
      pending = false;
      clearTimers();
      if (value === 0) return; // finished before the bar was ever shown
      value = 1;
      setBar({ value: 1, visible: true });
      hideTimer = setTimeout(() => setBar({ value: 1, visible: false }), 200);
      resetTimer = setTimeout(() => {
        value = 0;
        setBar({ value: 0, visible: false });
      }, 500);
    };

    const start = () => {
      clearTimers();
      pending = true;
      value = 0;
      showTimer = setTimeout(() => {
        value = 0.2;
        setBar({ value, visible: true });
        // Ease towards 90% without ever claiming to be finished
        tickTimer = setInterval(() => {
          value += (0.9 - value) * 0.15;
          setBar({ value, visible: true });
        }, 250);
      }, SHOW_DELAY_MS);
      safetyTimer = setTimeout(done, MAX_VISIBLE_MS);
    };

    controlsRef.current = { start, done };

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      const url = args[2];
      if (url != null) {
        try {
          const dest = new URL(String(url), window.location.href);
          const current = window.location.pathname + window.location.search;
          if (dest.pathname + dest.search !== current) start();
        } catch {
          // Unparseable URL: let the browser handle it without a loader
        }
      }
      return originalPushState.apply(this, args);
    };

    window.addEventListener('popstate', start);

    return () => {
      clearTimers();
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', start);
      controlsRef.current = null;
    };
  }, []);

  // React Router has rendered the new page: finish the bar
  useEffect(() => {
    const current = location.pathname + location.search;
    if (current !== lastLocationRef.current) {
      lastLocationRef.current = current;
      controlsRef.current?.done();
    }
  }, [location.pathname, location.search]);

  return (
    <div
      aria-hidden="true"
      className="route-loader fixed top-0 left-0 right-0 z-[999999] h-[3px] pointer-events-none"
      style={{ opacity: bar.visible ? 1 : 0, transition: 'opacity 250ms ease' }}
    >
      <div
        className="route-loader h-full w-full origin-left bg-[#DE5C2B]"
        style={{
          transform: `scaleX(${bar.value})`,
          transition: bar.value === 0 ? 'none' : 'transform 250ms ease-out',
          boxShadow: '0 0 8px rgba(222, 92, 43, 0.45)',
        }}
      />
    </div>
  );
};

export default NavigationProgress;
