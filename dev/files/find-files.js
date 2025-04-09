import {join, extname} from 'path';
import {readdirSync, statSync, existsSync} from 'fs';
import * as consts from '../consts.js';

/**
 * @typedef {Object} FileResult - file search result
 * @property {string} relUrl - Relative URL path
 * @property {string} fullDir - Full directory path
 * @property {string} fullPath - Full file path
 *
 * Example 1:
 * {
 *   relUrl  : 'assets/common/common.css',
 *   fullDir : 'c:\\GitHub\\source\\assets'
 *   fullPath: 'c:\\GitHub\\source\\assets\\common.css'
 * }
 *
 * Example 2:
 * {
 *   relUrl  : 'basics/',
 *   fullDir : 'c:\\GitHub\\source\\basics'
 *   fullPath: 'c:\\GitHub\\source\\basics\\index.html'
 * }
 */

/**
 * Get a list of build scripts
 * @param {string} baseDir - Base directory
 * @param {'build'|'pre-build'} builder - Name of the builder
 * @return {FileResult[]} - List of all files found
 */
export function findBuildScripts(
    baseDir = consts.sourceDir,
    builder = 'build',
) {
  /** @type {FileResult[]} */
  const files = [];
  const maxDepth = 6;

  /**
   * @param {string} parentUrl - parent URL
   * @param {number} depth - current directory depth
   */
  const traverse = (parentUrl, depth) => {
    const parentPath = join(baseDir, parentUrl);

    readdirSync(parentPath).forEach((fName) => {
      /** Current URL (e.g. `source/basics`) */
      const currUrl = `${parentUrl}/${fName}`;
      /** Current file path (e.g. `c:\\GitHub\\source\\basics`) */
      const currPath = join(baseDir, currUrl);

      const fStat = statSync(currPath);
      const isFile = fStat.isFile();
      const isDirectory = fStat.isDirectory();

      if ((isFile) || (!isDirectory)) return;

      if (fName === `__${builder}`) {
        const builderUrl = `${parentUrl}/__${builder}/${builder}.js`;
        const builderDir = join(parentPath, `__${builder}/`);
        const builderPath = join(parentPath, `__${builder}/${builder}.js`);
        if (existsSync(builderPath)) {
          files.push({
            relUrl: builderUrl,
            fullDir: builderDir,
            fullPath: builderPath,
          });
        }
        return;
      };

      if (fName.startsWith('--')) return;
      if (fName.startsWith('__')) return;

      if (depth < maxDepth) {
        traverse(currUrl, depth + 1);
      } else {
        throw new Error(`Max directory depth reached: ${currUrl}`);
      }
    });
  };

  traverse('', 0);
  return files;
}

/**
 * Get a list of content files
 * @param {string} baseDir - Base directory
 * @param {function} filter - Filter of the filename
 * @return {FileResult[]} - List of all files found
 */
export function findContentFiles(
    baseDir = consts.sourceDir,
    filter = (fn) => extname(fn) == '.html',
) {
  /** @type {FileResult[]} */
  const files = [];
  const maxDepth = 6;

  /**
   * @param {string} parentUrl - parent URL
   * @param {number} depth - current directory depth
   */
  const traverse = (parentUrl, depth) => {
    const parentPath = join(baseDir, parentUrl);

    readdirSync(parentPath).forEach((fName) => {
      /** Current URL (e.g. `assets/common/common.css`) */
      let currUrl = `${parentUrl}/${fName}`;
      /** Current directory (e.g. `c:\\GitHub\\source\\assets\\common`) */
      const currDir = join(baseDir, parentUrl);
      /** Current file path (e.g. `c:\\GitHub\\source\\assets\\common\common.js`) */
      const currPath = join(baseDir, currUrl);

      const fStat = statSync(currPath);
      const isFile = fStat.isFile();
      const isDirectory = fStat.isDirectory();

      if (fName.startsWith('--')) return;
      if (fName.startsWith('__')) return;

      if (isFile) {
        if (filter(fName)) {
          const ext = extname(fName);
          const name = fName.slice(0, -ext.length);
          if ((ext === '.html') || (ext === '.md')) {
            if (name === 'index') currUrl = `${parentUrl}/`;
            else currUrl = `${parentUrl}/${name}`;
          }

          files.push({
            relUrl: currUrl,
            fullDir: currDir,
            fullPath: currPath,
          });
        }
      } else if (isDirectory) {
        if (depth < maxDepth) {
          traverse(currUrl, depth + 1);
        } else {
          throw new Error(`Max directory depth reached: ${currUrl}`);
        }
      }
    });
  };

  traverse('', 0);
  return files;
}

// console.log(findBuildScripts());
// console.log(findContentFiles());
