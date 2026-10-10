import { useEffect, useState } from 'react';
import API from '../api/axios';

// Sidebar badge: tasks with unseen updates (new tasks / new comments) when there are any, else open tasks. Refreshes every minute and whenever
// the Tasks page fires `tasks_updated`.
const POLL_MS = 60000;

export default function useOpenTasksCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const refresh = () => {
      if (document.hidden || !localStorage.getItem('admin_user')) return;
      API.get('/admin/tasks/count').then((r) => alive && setCount(r.data?.updates || r.data?.open || 0)).catch(() => {});
    };
    const first = setTimeout(refresh, 0);
    const t = setInterval(refresh, POLL_MS);
    window.addEventListener('tasks_updated', refresh);
    return () => {
      alive = false;
      clearTimeout(first);
      clearInterval(t);
      window.removeEventListener('tasks_updated', refresh);
    };
  }, []);

  return count;
}
