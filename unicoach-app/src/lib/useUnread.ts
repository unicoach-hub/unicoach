import { useEffect, useState } from 'react';

import { unreadCount } from './studentChat';

// Unread counsellor messages, checked every minute (the backend has no push yet).
export function useUnread() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let alive = true;
    const check = () =>
      unreadCount()
        .then((n) => alive && setUnread(n))
        .catch(() => {});
    check();
    const t = setInterval(check, 60000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);
  return unread;
}
