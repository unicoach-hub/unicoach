/**
 * Make user input safe to embed in a RegExp: coerces to a string (arrays/objects from query
 * strings like ?q[]=x become their first value or ''), caps the length and escapes every
 * regex metacharacter, so a query can't crash the server or trigger catastrophic backtracking.
 */
const escapeRegex = (value, maxLength = 100) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === null || raw === undefined || typeof raw === 'object') return '';
  return String(raw).slice(0, maxLength).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = escapeRegex;
module.exports.escapeRegex = escapeRegex;
