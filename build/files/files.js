import fs from 'fs';
import stringify from 'json-stringify-pretty-compact';

/**
 * Read a text file
 * @param {string} path - Path of the file
 * @return {string}
 */
export function readTextFile(path) {
  return fs.readFileSync(path, 'utf8');
}

/**
 * Read a .tsv file
 * @param {string} path - Path of the file
 * @return {Array.<Array.<string>>}
 */
export function readTsvFile(path) {
  return readTextFile(path).split('\n').map((row) => row.split('\t'));
}

/**
 * Read a .json file
 * @param {string} path - Path of the file
 * @return {object}
 */
export function readJsonFile(path) {
  return JSON.parse(readTextFile(path));
}

/**
 * Save content as text
 * @param {string} path - Path of the file
 * @param {string[]|string|object} data - Data
 */
export function saveTextFile(path, data) {
  if (Array.isArray(data)) {
    data = data.join('\n');
  } else if (typeof data !== 'string') {
    data = stringify(data) + '\n';
  }
  fs.writeFileSync(path, data);
}
