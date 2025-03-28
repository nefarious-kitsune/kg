/**
 * Get YYYY, MM, and DD format strings from a date
 * @param {Date} date - Date
 * @returns {object}
 */
export function getDateFormatStrings(date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return ({
    YYYY: y.toString(),
    MM: (m < 10)?('0' + m.toString()):(m.toString()),
    DD: (d < 10)?('0' + d.toString()):(d.toString()),
  })
}

/**
 * Get UTC date from year, month, and day
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @returns {Date}
 */
export function getUTCDate(year, month, day) {
  // Sanity helper
  const monthIdx = month - 1;
  return new Date(Date.UTC(year, monthIdx, day, 0, 0, 0));
}

/**
 * Get UTC date from YYYY-MM-DD formatted string
 * @param {string} str
 * @returns {Date}
 */
export function parseUTCDateString(str) {
  const yyyy = parseInt(str.substring(0, 4));
  const mm = parseInt(str.substring(5, 7));
  const dd = parseInt(str.substring(8, 10));
  return getUTCDate(yyyy, mm, dd)
}
