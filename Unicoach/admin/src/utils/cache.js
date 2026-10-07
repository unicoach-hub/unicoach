/**
 * IN-MEMORY ADMIN CACHE MANAGER (STALE-WHILE-REVALIDATE)
 * ======================================================
 * Provides zero-delay instant page navigation across the Admin Panel.
 * 
 * - Stores fetched data in memory with timestamps.
 * - Serves instant cached data on revisit (0ms, no skeleton flicker).
 * - Enables background revalidation to keep data fresh without blocking UI.
 * - Supports targeted cache invalidation on CREATE, UPDATE, DELETE actions.
 */

const memoryCache = new Map();
const DEFAULT_TTL = 3 * 60 * 1000; // 3 minutes

export const getCachedData = (key, maxAge = DEFAULT_TTL) => {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > maxAge) {
    memoryCache.delete(key);
    return null;
  }
  return item.data;
};

export const setCachedData = (key, data) => {
  memoryCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

export const invalidateCache = (keyPrefix) => {
  if (!keyPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      memoryCache.delete(key);
    }
  }
};

/**
 * Universal cached fetcher utility for React components.
 * 
 * @param {string} key - Cache identifier (e.g. '/admin/stats')
 * @param {Function} fetcherFn - Async API call function
 * @param {Object} options - { maxAge, onBackgroundUpdate, forceRefresh }
 * @returns {Promise<{ data: any, fromCache: boolean }>}
 */
export const fetchWithCache = async (key, fetcherFn, options = {}) => {
  const { maxAge = DEFAULT_TTL, forceRefresh = false, onBackgroundUpdate } = options;

  if (!forceRefresh) {
    const cached = getCachedData(key, maxAge);
    if (cached !== null) {
      // Revalidate in background if requested
      if (onBackgroundUpdate) {
        setTimeout(async () => {
          try {
            const freshData = await fetcherFn();
            setCachedData(key, freshData);
            onBackgroundUpdate(freshData);
          } catch (err) {
            // Silently swallow background sync errors
          }
        }, 10);
      }
      return { data: cached, fromCache: true };
    }
  }

  // Not in cache or force refresh -> perform network request
  const freshData = await fetcherFn();
  setCachedData(key, freshData);
  return { data: freshData, fromCache: false };
};
