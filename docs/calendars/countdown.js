/* eslint-env browser */

/**
 * Get YYYY, MM, and DD format strings from a date
 * @param {Date} date - Date
 * @return {object}
 */
function formatUTCDate(date) {
  const formatNumber = (n) => (n < 10)?('0' + n):n.toString();
  const YYYY = date.getUTCFullYear().toString();
  const MM = formatNumber(date.getUTCMonth() + 1);
  const DD = formatNumber(date.getUTCDate());
  // const hh = formatNumber(date.getUTCHours());
  // const mm = formatNumber(date.getUTCMinutes());
  // const ss = formatNumber(date.getUTCSeconds());
  return YYYY + '-' + MM + '-' + DD; // + ' ' + hh + ':' + mm + ':' + ss;
}

document.addEventListener('DOMContentLoaded', (e) => {
  // 2024-05-13
  const transferStart = new Date(Date.UTC(2024, 5-1, 13, 0, 0, 0));
  const transferEnd = new Date(Date.UTC(2024, 5-1, 15, 23, 59, 59));
  const currentTime = new Date();

  while (true) {
    if (currentTime < transferEnd) {
      break;
    } else {
      transferStart.setDate(transferStart.getDate() + 28);
      transferEnd.setDate(transferEnd.getDate() + 28);
    }
  }
  document.getElementById('transfer-start').innerText =
    formatUTCDate(transferStart);

  document.getElementById('transfer-end').innerText =
    formatUTCDate(transferEnd);
});
