import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { mySavedScholarships, toggleScholarship, type Scholarship } from './scholarships';

type State = {
  saved: Scholarship[] | null;
  reload: () => Promise<void>;
  isSaved: (id: string) => boolean;
  toggle: (item: Scholarship) => Promise<void>;
};

const Ctx = createContext<State | null>(null);

// Saved scholarships (website's "deadline tracker"), one copy for Feed, Search and Shortlist.
export function ScholarshipSavedProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Scholarship[] | null>(null);

  const reload = useCallback(async () => {
    try {
      setSaved(await mySavedScholarships());
    } catch {
      setSaved((s) => s ?? []);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    mySavedScholarships()
      .then((s) => alive && setSaved(s))
      .catch(() => alive && setSaved([]));
    return () => {
      alive = false;
    };
  }, []);

  const isSaved = useCallback((id: string) => !!saved?.some((s) => s._id === id), [saved]);

  // Optimistic: flip now, re-sync from the server if it fails
  const toggle = useCallback(
    async (item: Scholarship) => {
      setSaved((prev) => {
        const list = prev ?? [];
        return list.some((s) => s._id === item._id) ? list.filter((s) => s._id !== item._id) : [item, ...list];
      });
      try {
        await toggleScholarship(item._id);
      } catch {
        await reload();
      }
    },
    [reload],
  );

  const value = useMemo(() => ({ saved, reload, isSaved, toggle }), [saved, reload, isSaved, toggle]);
  return createElement(Ctx.Provider, { value }, children);
}

export function useSavedScholarships() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSavedScholarships must be used inside <ScholarshipSavedProvider>');
  return ctx;
}
