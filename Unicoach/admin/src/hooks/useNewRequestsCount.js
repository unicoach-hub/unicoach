import { useEffect, useState } from 'react';
import { getApiUrl } from '../config';

/**
 * Number of support requests with status "New".
 * One shared poll for the whole app (sidebar badge + header bell), refreshed every 30s
 * and immediately when a page fires the `support_requests_updated` event.
 */

const POLL_MS = 30000;
let count = 0;
let timer = null;
let inFlight = null;
const listeners = new Set();

const publish = (next) => {
  count = next;
  listeners.forEach((fn) => fn(next));
};

const refresh = async () => {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
      const res = await fetch(`${getApiUrl()}/support-requests`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.stats && data.stats.newCount !== undefined) publish(data.stats.newCount);
      else if (Array.isArray(data.requests)) publish(data.requests.filter((r) => r.status === 'New').length);
    } catch {
      // offline / backend restarting: keep the last known count
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
};

const start = () => {
  refresh();
  timer = setInterval(refresh, POLL_MS);
  window.addEventListener('support_requests_updated', refresh);
};

const stop = () => {
  clearInterval(timer);
  timer = null;
  window.removeEventListener('support_requests_updated', refresh);
};

const useNewRequestsCount = () => {
  const [value, setValue] = useState(count);

  useEffect(() => {
    listeners.add(setValue);
    if (listeners.size === 1) start();
    return () => {
      listeners.delete(setValue);
      if (listeners.size === 0) stop();
    };
  }, []);

  return value;
};

export default useNewRequestsCount;
