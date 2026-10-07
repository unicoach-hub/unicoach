const Redis = require('ioredis');

/**
 * UniCoach Redis & Distributed Lock Client
 * 
 * Provides atomic operations for:
 * 1. Distributed Slot Locking (SET NX EX)
 * 2. Idempotency Key checks
 * 3. In-memory fallback if Redis is unavailable in local dev
 */

let redisClient = null;
const memoryStore = new Map();

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      connectTimeout: 5000,
      retryStrategy(times) {
        return Math.min(times * 100, 3000);
      }
    });

    redisClient.on('connect', () => {
      console.log('✅ UniCoach: Redis connected for distributed locks & caching');
    });

    redisClient.on('error', (err) => {
      console.warn('⚠️ UniCoach: Redis connection error, falling back to atomic memory lock:', err.message);
    });
  } catch (err) {
    console.warn('⚠️ UniCoach: Failed to initialize ioredis client:', err.message);
  }
} else {
  console.log('ℹ️ UniCoach: REDIS_URL not set; running in atomic in-memory lock mode (safe for single instance dev)');
}

// ── Lua Script for Atomic Safe Lock Release ──
// Only releases the lock if the value matches ownerId (avoids releasing another user's acquired lock)
const RELEASE_LOCK_LUA = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

/**
 * Acquire Distributed Lock
 * @param {string} key Lock identifier, e.g. `lock:unicoach:slot:<slotId>`
 * @param {string} ownerId Unique token identifying the requester (e.g. studentId or session UUID)
 * @param {number} ttlSeconds Time to live in seconds (default: 600 = 10 minutes)
 * @returns {Promise<boolean>} true if lock acquired, false if already locked
 */
const acquireLock = async (key, ownerId, ttlSeconds = 600) => {
  if (redisClient && redisClient.status === 'ready') {
    try {
      const result = await redisClient.set(key, ownerId, 'NX', 'EX', ttlSeconds);
      return result === 'OK';
    } catch (err) {
      console.warn('Redis acquireLock failed, using fallback:', err.message);
    }
  }

  // In-memory fallback (Atomic within Node.js single thread event loop)
  const now = Date.now();
  const existing = memoryStore.get(key);
  if (existing && existing.expiry > now) {
    return false; // Already locked
  }

  memoryStore.set(key, {
    ownerId,
    expiry: now + (ttlSeconds * 1000)
  });
  return true;
};

/**
 * Safely Release Distributed Lock
 * @param {string} key
 * @param {string} ownerId
 * @returns {Promise<boolean>}
 */
const releaseLock = async (key, ownerId) => {
  if (redisClient && redisClient.status === 'ready') {
    try {
      const res = await redisClient.eval(RELEASE_LOCK_LUA, 1, key, ownerId);
      return res === 1;
    } catch (err) {
      console.warn('Redis releaseLock failed, using fallback:', err.message);
    }
  }

  const existing = memoryStore.get(key);
  if (existing && existing.ownerId === ownerId) {
    memoryStore.delete(key);
    return true;
  }
  return false;
};

/**
 * Get Lock Owner
 * @param {string} key
 */
const getLockOwner = async (key) => {
  if (redisClient && redisClient.status === 'ready') {
    try {
      return await redisClient.get(key);
    } catch (err) {
      console.warn('Redis getLockOwner failed:', err.message);
    }
  }

  const existing = memoryStore.get(key);
  if (existing && existing.expiry > Date.now()) {
    return existing.ownerId;
  }
  return null;
};

module.exports = {
  redisClient,
  acquireLock,
  releaseLock,
  getLockOwner
};
