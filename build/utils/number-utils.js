
const THOUSAND = 1000;
const MILLION = THOUSAND * THOUSAND;
const BILLION = THOUSAND * MILLION;
const TRILLION = THOUSAND * BILLION;

/**
 * Sanitize max point (e.g. convert 12,330,000 to 13,000,000)
 * @param {number} n - Number
 * @returns {number}
 */
export function sanitizeMaxPoint(n) {
  if (n >= 10 * TRILLION) return ( ( Math.floor(n/(TRILLION)) + 1) * TRILLION);
  if (n >=  1 * TRILLION) return ( ( Math.floor(n/(100 * BILLION)) + 1) * 100 * BILLION);
  if (n >= 100 * BILLION) return ( ( Math.floor(n/( 10 * BILLION)) + 1) *  10 * BILLION);
  if (n >=  10 * BILLION) return ( ( Math.floor(n/(  1 * BILLION)) + 1) *   1 * BILLION);
  if (n >=   1 * BILLION) return ( ( Math.floor(n/(100 * MILLION)) + 1) * 100 * MILLION);
  if (n >= 100 * MILLION) return ( ( Math.floor(n/( 10 * MILLION)) + 1) *  10 * MILLION);
  if (n >=  10 * MILLION) return ( ( Math.floor(n/(  1 * MILLION)) + 1) *   1 * MILLION);
  if (n >=   1 * MILLION) return ( ( Math.floor(n/(100 * THOUSAND)) + 1) * 100 * THOUSAND);
  if (n >= 100 * THOUSAND) return ( ( Math.floor(n/(10 * THOUSAND)) + 1) *  10 * THOUSAND);
  if (n >=  10 * THOUSAND) return ( ( Math.floor(n/( 1 * THOUSAND)) + 1) *   1 * THOUSAND);
  return 10 * THOUSAND;
}

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
