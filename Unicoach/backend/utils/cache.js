// utils/cache.js - Production caching middleware with Redis & In-Memory Fallback
let redisClient = null;

// Initialize Redis if REDIS_URL environment variable is provided
if (process.env.REDIS_URL) {
  try {
    const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      connectTimeout: 5000
    });
    redisClient.on('connect', () => console.log('✅ Redis client connected successfully'));
    redisClient.on('error', (err) => console.warn('⚠️ Redis client error (falling back to memory cache):', err.message));
  } catch (err) {
    console.warn('⚠️ ioredis library not installed or failed to initialize, using memory cache:', err.message);
  }
}

// Memory Cache fallback store
const memoryCache = new Map();

/**
 * Cache middleware for Express routes
 * @param {number} durationInSeconds Cache TTL in seconds (default: 300 = 5 mins)
 */
const cacheMiddleware = (durationInSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `express_cache:${req.originalUrl || req.url}`;

    // Try Redis cache if available
    if (redisClient && redisClient.status === 'ready') {
      try {
        const cachedData = await redisClient.get(key);
        if (cachedData) {
          res.setHeader('X-Cache', 'HIT-REDIS');
          res.setHeader('Content-Type', 'application/json');
          return res.send(cachedData);
        }
      } catch (err) {
        console.warn('Redis read error:', err.message);
      }
    }

    // Try Memory cache fallback
    const memoryItem = memoryCache.get(key);
    if (memoryItem && memoryItem.expiry > Date.now()) {
      res.setHeader('X-Cache', 'HIT-MEMORY');
      res.setHeader('Content-Type', 'application/json');
      return res.send(memoryItem.data);
    }

    // Hook res.send to capture response body for caching
    const originalSend = res.send;
    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const stringBody = typeof body === 'string' ? body : JSON.stringify(body);
        
        // Save to Redis if connected
        if (redisClient && redisClient.status === 'ready') {
          redisClient.setex(key, durationInSeconds, stringBody).catch(err => {
            console.warn('Redis set error:', err.message);
          });
        }

        // Save to Memory cache fallback
        memoryCache.set(key, {
          data: stringBody,
          expiry: Date.now() + (durationInSeconds * 1000)
        });

        // Clean up expired items periodically if memory cache grows
        if (memoryCache.size > 1000) {
          const now = Date.now();
          for (const [k, val] of memoryCache.entries()) {
            if (val.expiry <= now) memoryCache.delete(k);
          }
          // Hard cap: random query strings must not be able to grow the cache until the server runs out
          // of memory. Map keeps insertion order, so the oldest entries are dropped first.
          for (const k of memoryCache.keys()) {
            if (memoryCache.size <= 800) break;
            memoryCache.delete(k);
          }
        }
      }

      res.setHeader('X-Cache', 'MISS');
      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Clear cache by pattern or key
 */
const clearCache = async (keyPattern) => {
  memoryCache.clear();
  if (redisClient && redisClient.status === 'ready') {
    try {
      const keys = await redisClient.keys(`express_cache:${keyPattern}*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {
      console.warn('Error clearing Redis keys:', err.message);
    }
  }
};

const clearShortlistCache = async () => {
  return clearCache('/api/shortlist');
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearShortlistCache
};
