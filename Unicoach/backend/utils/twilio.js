// Phone helpers. UniCoach sends no OTP / SMS: phone numbers are contact details only.

/**
 * Normalizes a phone number to standard E.164 format.
 * Strips non-digits, handles leading zeroes, and prepends country code if needed.
 * @param {string} phone 
 * @returns {string}
 */
function normalizePhone(phone) {
  if (!phone) return '';
  // Remove all non-digits except +
  let clean = phone.replace(/[^\d+]/g, '');
  // If it starts with +:
  if (clean.startsWith('+')) {
    // If it starts with +910, normalize to +91
    if (clean.startsWith('+910')) {
      clean = '+91' + clean.slice(4);
    }
    return clean;
  }
  // If it does not start with +, but starts with 0:
  if (clean.startsWith('0')) {
    clean = clean.slice(1);
  }
  // If it's a 10 digit number, default prepend +91
  if (clean.length === 10) {
    return `+91${clean}`;
  }
  // If it starts with 91 and has 12 digits:
  if (clean.startsWith('91') && clean.length === 12) {
    return `+${clean}`;
  }
  // Fallback
  return `+${clean}`;
}

module.exports = { normalizePhone };
