
const THOUSAND = 1000;
const MILLION = THOUSAND * THOUSAND;
const BILLION = THOUSAND * MILLION;
const TRILLION = THOUSAND * BILLION;

/**
 * Format points
 * @param {number} n - Number
 * @returns {string}
 */
export function formatPoint(n) {
  if (n >= 10 * TRILLION) return (n/(TRILLION)).toFixed(1) + 'T';
  if (n >=  1 * TRILLION) return (n/(TRILLION)).toFixed(2) + 'T';
  if (n >= 100 * BILLION) return (n/(BILLION)).toFixed(0) + 'B';
  if (n >=  10 * BILLION) return (n/(BILLION)).toFixed(1) + 'B';
  if (n >=   1 * BILLION) return (n/(BILLION)).toFixed(2) + 'B';
  if (n >= 100 * MILLION) return (n/(MILLION)).toFixed(0) + 'M';
  if (n >=  10 * MILLION) return (n/(MILLION)).toFixed(1) + 'M';
  if (n >=   1 * MILLION) return (n/(MILLION)).toFixed(2) + 'M';
  if (n >= 100 * THOUSAND) return (n/(THOUSAND)).toFixed(0) + 'K';
  if (n >=  10 * THOUSAND) return (n/(THOUSAND)).toFixed(1) + 'K';
  if (n >=   1 * THOUSAND) return (n/(THOUSAND)).toFixed(2) + 'K';
  return n.toFixed(0);
}
