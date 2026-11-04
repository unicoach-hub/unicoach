import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api } from './api';
import type { Course } from './courses';
import { money } from './courses';

export type SavedUniversity = { _id: string; name: string; countryName?: string; city?: string; logo?: string; rank?: string };

type SavedState = {
  saved: SavedUniversity[] | null;
  error: string | null;
  reload: () => Promise<void>;
  isSaved: (name: string) => boolean;
  toggle: (course: Course) => Promise<void>;
};

const SavedContext = createContext<SavedState | null>(null);

// Saved list is per university (the backend keys it by name), same list the website shows.
// One copy for all tabs, so a heart tapped in Explore shows up on Home straight away.
export function SavedProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedUniversity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((r: Awaited<ReturnType<typeof fetchSaved>>) => {
    if (r.ok) {
      setSaved(r.saved);
      setError(null);
    } else {
      setError(r.error);
    }
  }, []);

  const reload = useCallback(async () => apply(await fetchSaved()), [apply]);

  useEffect(() => {
    let alive = true;
    fetchSaved().then((r) => alive && apply(r));
    return () => {
      alive = false;
    };
  }, [apply]);

  const isSaved = useCallback(
    (name: string) => !!saved?.some((u) => u.name.trim().toLowerCase() === name.trim().toLowerCase()),
    [saved],
  );

  // Optimistic: flip the heart at once, roll back if the server says no.
  const toggle = useCallback(
    async (course: Course) => {
      const name = course.universityName;
      const was = isSaved(name);
      const optimistic: SavedUniversity = { _id: `tmp-${course.cfUniversityId}`, name, countryName: course.countryName, city: course.city };
      setSaved((prev) => (was ? (prev ?? []).filter((u) => u.name !== name) : [optimistic, ...(prev ?? [])]));
      try {
        const res = await api<{ saved: boolean; savedUniversity?: SavedUniversity }>('/saved-universities/toggle', {
          method: 'POST',
          body: {
            universityId: String(course.cfUniversityId),
            name,
            countryName: course.countryName,
            city: course.city || '',
            tuition: course.annualFee?.amount ? `${money(course.annualFee.amount, course.annualFee.currency)}/yr` : '',
            minIeltsScore: course.minIeltsScore,
          },
        });
        const real = res.savedUniversity;
        if (res.saved && real) setSaved((prev) => (prev ?? []).map((u) => (u._id === optimistic._id ? real : u)));
      } catch {
        await reload();
      }
    },
    [isSaved, reload],
  );

  const value = useMemo(() => ({ saved, error, reload, isSaved, toggle }), [saved, error, reload, isSaved, toggle]);
  return createElement(SavedContext.Provider, { value }, children);
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be used inside <SavedProvider>');
  return ctx;
}

async function fetchSaved(): Promise<{ ok: true; saved: SavedUniversity[] } | { ok: false; error: string }> {
  try {
    const res = await api<{ savedUniversities: SavedUniversity[] }>('/saved-universities');
    return { ok: true, saved: res.savedUniversities };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Load nahi ho paaya.' };
  }
}
