/**
 * Finite State Machine (FSM) for Booking Order Lifecycle (Pillar #5)
 * 
 * Prevents invalid state jumps and data corruption.
 * Every status change must be an allowed transition.
 */

const VALID_TRANSITIONS = {
  CREATED: ['PAYMENT_PENDING', 'CANCELLED'],
  PAYMENT_PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED', 'REFUNDED'],
  COMPLETED: [],
  CANCELLED: [],
  REFUNDED: []
};

/**
 * Checks whether transitioning from currentState to nextState is permitted
 * @param {string} currentState 
 * @param {string} nextState 
 * @returns {boolean}
 */
const canTransition = (currentState, nextState) => {
  if (!currentState || !nextState) return false;
  if (currentState === nextState) return true; // Idempotent no-op
  const allowed = VALID_TRANSITIONS[currentState] || [];
  return allowed.includes(nextState);
};

/**
 * Validates transition or throws an Error
 * @param {string} currentState 
 * @param {string} nextState 
 */
const assertTransition = (currentState, nextState) => {
  if (!canTransition(currentState, nextState)) {
    const error = new Error(
      `Illegal FSM State Transition: Cannot move booking from '${currentState}' to '${nextState}'. Allowed: [${(VALID_TRANSITIONS[currentState] || []).join(', ')}]`
    );
    error.status = 400;
    throw error;
  }
};

module.exports = {
  VALID_TRANSITIONS,
  canTransition,
  assertTransition
};
