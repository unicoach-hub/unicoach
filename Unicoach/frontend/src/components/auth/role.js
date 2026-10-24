import { useState } from 'react';

const STORAGE_KEY = 'unicoach_signup_role';

// Where to land after sign-in: an explicit ?redirect wins, otherwise the chosen role's dashboard.
// Mentors land on the setup flow, which creates their page on the first visit.
export const roleRedirect = (role, search) => {
  const redirect = new URLSearchParams(search).get('redirect');
  if (redirect) return redirect;
  return role === 'mentor' ? '/unicoach/dashboard?setup=1' : '/dashboard';
};

// Remembers the last choice; ?as=mentor on the URL preselects Mentor
export const useRole = (search) => {
  const [role, setRoleState] = useState(() => {
    const fromUrl = new URLSearchParams(search).get('as');
    if (fromUrl === 'mentor' || fromUrl === 'student') return fromUrl;
    try { return localStorage.getItem(STORAGE_KEY) || 'student'; } catch { return 'student'; }
  });
  const setRole = (r) => {
    setRoleState(r);
    try { localStorage.setItem(STORAGE_KEY, r); } catch { /* private mode */ }
  };
  return [role, setRole];
};
