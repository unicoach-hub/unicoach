/**
 * Escape a value for safe interpolation into an HTML string.
 * null/undefined become ''.
 */
const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/** Escape plain text, then convert newlines to <br/>. */
const plainTextToHtml = (text) => escapeHtml(text).replace(/\r?\n/g, '<br/>');

module.exports = escapeHtml;
module.exports.escapeHtml = escapeHtml;
module.exports.plainTextToHtml = plainTextToHtml;
