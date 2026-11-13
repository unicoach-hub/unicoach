/**
 * Per-account lockout for the admin sign-in form.
 *
 * The IP rate limiter only slows one attacker down; it does nothing against a spread-out attempt
 * from many addresses against one account. This counts failures per account instead, and locks that
 * account for a while once there have been too many, whatever address they come from.
 *
 * Counters live in Redis when it is configured (so they survive a restart and are shared across
 * instances) and fall back to memory otherwise. A failure to reach Redis never blocks a login: a
 * broken counter must not lock the owner out of their own panel.
 */

const MAX_FAILURES = 8;
const LOCK_SECONDS = 15 * 60;
const WINDOW_SECONDS = 30 * 60;

let redis = null;
if (process.env.REDIS_URL) {
  try {
    const Redis = require('ioredis');
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      connectTimeout: 5000,
    });
    redis.on('error', (err) => console.warn('⚠️ Login throttle Redis error (using memory):', err.message));
  } catch (err) {
    console.warn('⚠️ Login throttle could not start Redis, using memory:', err.message);
  }
}

// { failures, until } per account, used when Redis is not available
const memory = new Map();
const ready = () => redis && redis.status === 'ready';
const keyOf = (account) => `admin_login_fail:${String(account || '').trim().toLowerCase()}`;

const readMemory = (key) => {
  const row = memory.get(key);
  if (!row) return null;
  if (row.expiresAt <= Date.now()) { memory.delete(key); return null; }
  return row;
};

/** Seconds the account must wait, or 0 if it may try now. */
const retryAfter = async (account) => {
  const key = keyOf(account);
  try {
    if (ready()) {
      const ttl = await redis.ttl(`${key}:lock`);
      return ttl > 0 ? ttl : 0;
    }
  } catch (err) {
    console.warn('Login throttle read failed, allowing the attempt:', err.message);
    return 0;
  }
  const row = readMemory(`${key}:lock`);
  return row ? Math.ceil((row.expiresAt - Date.now()) / 1000) : 0;
};

/** Count one wrong password. Returns the lock length in seconds if this one triggered a lock. */
const recordFailure = async (account) => {
  const key = keyOf(account);
  try {
    if (ready()) {
      const failures = await redis.incr(key);
      if (failures === 1) await redis.expire(key, WINDOW_SECONDS);
      if (failures >= MAX_FAILURES) {
        await redis.set(`${key}:lock`, '1', 'EX', LOCK_SECONDS);
        await redis.del(key);
        return LOCK_SECONDS;
      }
      return 0;
    }
  } catch (err) {
    console.warn('Login throttle write failed, not locking:', err.message);
    return 0;
  }
  const row = readMemory(key) || { failures: 0, expiresAt: Date.now() + WINDOW_SECONDS * 1000 };
  row.failures += 1;
  if (row.failures >= MAX_FAILURES) {
    memory.delete(key);
    memory.set(`${key}:lock`, { failures: 0, expiresAt: Date.now() + LOCK_SECONDS * 1000 });
    return LOCK_SECONDS;
  }
  memory.set(key, row);
  return 0;
};

/** A correct password clears the count. */
const recordSuccess = async (account) => {
  const key = keyOf(account);
  try {
    if (ready()) { await redis.del(key, `${key}:lock`); return; }
  } catch (err) {
    console.warn('Login throttle clear failed:', err.message);
    return;
  }
  memory.delete(key);
  memory.delete(`${key}:lock`);
};

const lockMessage = (seconds) => {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `Too many wrong passwords for this account. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
};

module.exports = { retryAfter, recordFailure, recordSuccess, lockMessage, MAX_FAILURES, LOCK_SECONDS, WINDOW_SECONDS, _memory: memory };
