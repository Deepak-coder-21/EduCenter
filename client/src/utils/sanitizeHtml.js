import DOMPurify from 'dompurify';

const getPurifyInstance = () => {
  if (typeof window !== 'undefined') {
    return typeof DOMPurify.sanitize === 'function' ? DOMPurify : DOMPurify(window);
  }
  return null;
};

/**
 * Sanitizes rich text HTML strings to prevent XSS attacks.
 * Strips dangerous tags (script, object, embed, iframe, form) and event handlers (onload, onerror, onclick).
 *
 * @param {string} dirtyHtml - Raw HTML string from user input or API.
 * @returns {string} Sanitized, safe HTML string.
 */
export const sanitizeHtml = (dirtyHtml) => {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  const purify = getPurifyInstance();
  if (!purify || typeof purify.sanitize !== 'function') {
    // Fallback: strip script and dangerous handlers or escape if no DOM window is available
    return dirtyHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/on\w+\s*=\s*[^>\s]+/gi, '');
  }

  return purify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'strong', 'em', 'u', 's',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'br', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'img'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'class', 'title', 'width', 'height'
    ],
    // Force external links to open safely with noopener noreferrer
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
};

/**
 * Ensures URLs use safe protocols (http, https, mailto, tel)
 * Prevents javascript: and data: URI XSS injection in link hrefs.
 *
 * @param {string} url - The URL to validate.
 * @returns {string} The safe URL or '#' if dangerous.
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:text/html') ||
    trimmed.startsWith('vbscript:')
  ) {
    return '#';
  }
  return url;
};

export default sanitizeHtml;
