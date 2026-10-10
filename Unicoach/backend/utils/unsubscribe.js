// Unsubscribe links for promotional emails. The link carries the lead id and an HMAC of it, so it
// can't be guessed or used to opt out someone else, and nothing needs to be stored per email.
const crypto = require('crypto');
const { JWT_SECRET } = require('../config/jwt');

const SITE = () => (process.env.FRONTEND_URL || 'https://www.unicoach.com').replace(/\/+$/, '');

const signature = (leadId) => crypto.createHmac('sha256', JWT_SECRET).update(`unsubscribe:${leadId}`).digest('hex').slice(0, 32);

const unsubscribeUrl = (leadId) => `${SITE()}/unsubscribe?l=${leadId}&t=${signature(leadId)}`;

const isValidSignature = (leadId, sig) => {
  const expected = signature(String(leadId));
  return typeof sig === 'string' && sig.length === expected.length
    && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
};

module.exports = { unsubscribeUrl, isValidSignature };
