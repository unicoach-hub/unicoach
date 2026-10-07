/**
 * Escape a value for safe interpolation into an HTML string.
 * null/undefined become ''.
 */
export const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Convert plain text (e.g. AI output or a typed reply) to HTML:
 * escape first, then turn newlines into <br/>.
 */
export const plainTextToHtml = (text) => escapeHtml(text).replace(/\r?\n/g, '<br/>');

export default escapeHtml;

/**
 * Defence-in-depth for rendering stored reply HTML that was produced by
 * plainTextToHtml (escaped text + <br/>): drop every tag except a bare <br>.
 */
export const stripTagsExceptBr = (html) =>
  String(html || '').replace(/<(?!br\s*\/?>)[^>]*>?/gi, '');
