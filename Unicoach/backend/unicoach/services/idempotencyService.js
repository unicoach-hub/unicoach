const { redisClient } = require('../config/redis');

/**
 * Idempotency Service (Pillar #3)
 * 
 * Protects against double payments and duplicate bookings caused by:
 * - Slow internet / double button clicks
 * - Retried webhooks
 * - Network timeouts
 */

const memoryCache = new Map();

const getKey = (key) => `idempotency:unicoach:${key}`;

/**
 * Get cached idempotency record
 * @param {string} idempotencyKey 
 * @returns {Promise<{ status: 'IN_PROGRESS'|'COMPLETED', response: any }|null>}
 */
const getIdempotencyRecord = async (idempotencyKey) => {
  const key = getKey(idempotencyKey);

  if (redisClient && redisClient.status === 'ready') {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn('Redis idempotency read failed:', err.message);
    }
  }

  const item = memoryCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data;
  }
  return null;
};

/**
 * Set idempotency key as IN_PROGRESS (TTL 60s for lock window)
 */
const markInProgress = async (idempotencyKey) => {
  const key = getKey(idempotencyKey);
  const payload = { status: 'IN_PROGRESS', startedAt: new Date().toISOString() };

  if (redisClient && redisClient.status === 'ready') {
    try {
      await redisClient.set(key, JSON.stringify(payload), 'EX', 60);
      return;
    } catch (err) {
      console.warn('Redis markInProgress failed:', err.message);
    }
  }

  memoryCache.set(key, {
    data: payload,
    expiry: Date.now() + 60000
  });
};

/**
 * Store completed response for 24 hours (86,400s)
 */
const storeCompletedResponse = async (idempotencyKey, statusCode, responseBody) => {
  const key = getKey(idempotencyKey);
  const payload = {
    status: 'COMPLETED',
    statusCode,
    responseBody,
    completedAt: new Date().toISOString()
  };

  if (redisClient && redisClient.status === 'ready') {
    try {
      await redisClient.set(key, JSON.stringify(payload), 'EX', 86400);
      return;
    } catch (err) {
      console.warn('Redis storeCompletedResponse failed:', err.message);
    }
  }

  memoryCache.set(key, {
    data: payload,
    expiry: Date.now() + (86400 * 1000)
  });
};

module.exports = {
  getIdempotencyRecord,
  markInProgress,
  storeCompletedResponse
};
