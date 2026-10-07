require('dotenv').config();

/**
 * Single source of the JWT signing secret.
 * There is deliberately NO fallback: a missing secret would let anyone forge admin tokens,
 * so the server refuses to start instead (tests get a throwaway secret).
 */
let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 16) {
  if (process.env.NODE_ENV === 'test') {
    JWT_SECRET = 'test-only-jwt-secret-not-for-production';
  } else {
    throw new Error('JWT_SECRET is missing or too short (min 16 chars). Set it in the environment before starting the server.');
  }
}

module.exports = { JWT_SECRET };
