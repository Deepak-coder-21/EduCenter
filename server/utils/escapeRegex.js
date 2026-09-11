/**
 * Safely escapes regular expression special characters to prevent
 * Regex Injection and Regular Expression Denial of Service (ReDoS).
 *
 * @param {string} string - The raw string to escape.
 * @returns {string} The escaped string safe for use in RegExp or Mongoose $regex.
 */
export const escapeRegex = (string) => {
    if (typeof string !== 'string') return '';
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default escapeRegex;
