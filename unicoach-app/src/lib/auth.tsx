import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { api, setUnauthorizedHandler } from './api';
import { GoogleCancelled, getGoogleIdToken, googleSignOut } from './googleSignIn';
import { unregisterPush } from './push';
import { getToken, setToken } from './tokenStore';

export type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  profilePicture?: string;
  // Study plan from onboarding (PUT /student/profile); the website's dashboard shares the same fields.
  dreamCountry?: string;
  preferredIntake?: string;
  dreamCourse?: string;
  highestEducation?: string;
  percentage?: string;
  passoutYear?: string;
  profileCompleted?: boolean;
  journeyStage?: string;
};

type AuthResponse = { success: boolean; token: string; user: User };

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  // Resolves false when the student closed Google's account picker.
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  // Merge fresh fields (e.g. a saved profile) into the signed-in user.
  updateUser: (patch: Partial<User>) => void;
};

const AuthContext = createContext<AuthState | null>(null);

// Tags sign-ups and logins so the admin CRM shows "Signup - App (Email/Google)" instead of the website's label
// (backend utils/attribution.js → authMethodLabel).
const touch = { utm_source: 'unicoach-app', utm_medium: 'app', landingPage: `app://${Platform.OS}` };
const APP_ATTRIBUTION = { firstTouch: touch, lastTouch: touch };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clear = useCallback(async () => {
    await setToken(null);
    setUser(null);
  }, []);

  // Restore the session on launch: a saved token is only trusted once /auth/me accepts it.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clear();
    });
    (async () => {
      try {
        if (await getToken()) {
          const res = await api<{ user: User }>('/auth/me');
          setUser(res.user);
        }
      } catch {
        await clear();
      } finally {
        setLoading(false);
      }
    })();
    return () => setUnauthorizedHandler(null);
  }, [clear]);

  const finish = useCallback(async (res: AuthResponse) => {
    await setToken(res.token);
    setUser(res.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api<AuthResponse>('/auth/login', { method: 'POST', body: { email, password, attribution: APP_ATTRIBUTION }, auth: false });
      await finish(res);
    },
    [finish],
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string; phone?: string }) => {
      const res = await api<AuthResponse>('/auth/register', { method: 'POST', body: { ...input, attribution: APP_ATTRIBUTION }, auth: false });
      await finish(res);
    },
    [finish],
  );

  // Same endpoint as the website's Google button: a Google account maps to the same UniCoach account.
  const loginWithGoogle = useCallback(async () => {
    let credential: string;
    try {
      credential = await getGoogleIdToken();
    } catch (e) {
      if (e instanceof GoogleCancelled) return false;
      throw e;
    }
    const res = await api<AuthResponse>('/auth/google', { method: 'POST', body: { credential, attribution: APP_ATTRIBUTION }, auth: false });
    await finish(res);
    return true;
  }, [finish]);

  const logout = useCallback(async () => {
    await unregisterPush();
    await clear();
    await googleSignOut();
  }, [clear]);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((u) => (u ? { ...u, ...patch } : u));
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, loginWithGoogle, logout, updateUser }),
    [user, loading, login, register, loginWithGoogle, logout, updateUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
