const { acquireLock, releaseLock, getLockOwner } = require('../config/redis');

/**
 * Slot Distributed Locking Service
 * 
 * Protects against race conditions (Pillar #1).
 * When a user selects a slot, a 10-minute temporary lock (SETNX with TTL) is placed.
 */

const buildSlotKey = (slotId) => `lock:unicoach:slot:${slotId}`;

/**
 * Attempts to reserve a slot for 10 minutes (600 seconds)
 * @param {string} slotId 
 * @param {string} reservationToken (UUID or student session ID)
 * @param {number} ttlSeconds 
 * @returns {Promise<boolean>}
 */
const acquireSlotLock = async (slotId, reservationToken, ttlSeconds = 600) => {
  const key = buildSlotKey(slotId);
  return await acquireLock(key, reservationToken, ttlSeconds);
};

/**
 * Safely releases slot lock (only if held by the same token)
 * @param {string} slotId 
 * @param {string} reservationToken 
 * @returns {Promise<boolean>}
 */
const releaseSlotLock = async (slotId, reservationToken) => {
  const key = buildSlotKey(slotId);
  return await releaseLock(key, reservationToken);
};

/**
 * Checks if slot is currently locked by someone
 * @param {string} slotId 
 * @returns {Promise<string|null>} Lock owner token or null
 */
const checkSlotLock = async (slotId) => {
  const key = buildSlotKey(slotId);
  return await getLockOwner(key);
};

module.exports = {
  acquireSlotLock,
  releaseSlotLock,
  checkSlotLock
};
