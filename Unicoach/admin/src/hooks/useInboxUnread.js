import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { can } from '../utils/permissions';

// Sidebar badge for Student Inbox: students with unread messages + uploaded documents waiting for review.
// Polls every 20s and refreshes at once when the inbox fires `inbox_updated`.
const POLL_MS = 20000;

export default function useInboxUnread() {
  const { user } = useAuth();
  const allowed = can(user, 'inbox');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!allowed) return undefined;
    let alive = true;
    const refresh = () => {
      if (document.hidden) return;
      API.get('/admin/student-inbox/unread')
        .then((r) => alive && setCount((r.data?.conversations || 0) + (r.data?.docsToReview || 0)))
        .catch(() => {});
    };
    const first = setTimeout(refresh, 0);
    const t = setInterval(refresh, POLL_MS);
    window.addEventListener('inbox_updated', refresh);
    return () => {
      alive = false;
      clearTimeout(first);
      clearInterval(t);
      window.removeEventListener('inbox_updated', refresh);
    };
  }, [allowed]);

  return count;
}
