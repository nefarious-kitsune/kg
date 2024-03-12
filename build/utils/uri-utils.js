import UriJs from 'urijs';

/**
 * Get relative path
 * @param {string} from 
 * @param {string} to 
 * @returns {string}
 */
export function relativePath(from, to) {
  return UriJs(to).relativeTo(from);
}
