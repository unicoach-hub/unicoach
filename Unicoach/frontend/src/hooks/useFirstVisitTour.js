import { useCallback, useEffect, useState } from 'react';

// Shows a tour once per person (remembered on this device), and lets them start it again any time
export default function useFirstVisitTour(key, ready = true) {
  const storageKey = `uc_tour_done:${key}`;
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!ready || !key) return undefined;
    let done = false;
    try { done = localStorage.getItem(storageKey) === '1'; } catch { /* private mode */ }
    if (done) return undefined;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [storageKey, ready, key]);
  const close = useCallback(() => {
    setOpen(false);
    try { localStorage.setItem(storageKey, '1'); } catch { /* private mode */ }
  }, [storageKey]);
  const start = useCallback(() => setOpen(true), []);
  return { open, start, close };
}
