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
  return new Date(Date.UTC(year, monthIdx, day));
}
