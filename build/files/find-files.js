import path from 'path';
import fs from 'fs';
import consts from '../consts.js';

/**
 * Get a list of build scripts
 * @param {string} baseDir - Base directory
 * @param {'build'|'pre-build'} builder - Name of the builder
 * @return {string[]} - URLs of all files found
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
    const parentPath = path.join(baseDir, parentUrl);

    fs.readdirSync(parentPath).forEach((fName) => {
      /** Current URL (e.g. `source/basics`) */
      const currUrl = `${parentUrl}/${fName}`;
      /** Current file path (e.g. `c:\\GitHub\\source\\basics`) */
      const currPath = path.join(baseDir, currUrl);

      const fStat = fs.statSync(currPath);
      const isFile = fStat.isFile();
      const isDirectory = fStat.isDirectory();

      if ((isFile) || (!isDirectory)) return;

      if (fName === `__${builder}`) {
        const builderUrl = `${parentUrl}/__${builder}/${builder}.js`;
        const builderPath = path.join(parentPath, `__${builder}/${builder}.js`);
        if (fs.existsSync(builderPath)) files.push(builderUrl);
        return;
      };

      if (fName.startsWith('--')) return;
      if (fName.startsWith('__')) return;

      if (depth < maxDepth) traverse(currUrl, depth + 1);
      else throw new Error(`Max directory depth reached: ${currUrl}`);
    });
  };

  traverse('', 0);
  return files;
}

/**
 * Get a list of content files
 * @param {string} baseDir - Base directory
 * @param {function} filter - Filter of the filename
 * @return {string[]} - URLs of all files found
 */
export function findContentFiles(
    baseDir = consts.sourceDir,
    filter = (fn) => path.extname(fn) == '.html',
) {
  /** @type {FileResult[]} */
  const files = [];
  const maxDepth = 6;

  /**
   * @param {string} parentUrl - parent URL
   * @param {number} depth - current directory depth
   */
  const traverse = (parentUrl, depth) => {
    const parentPath = path.join(baseDir, parentUrl);

    fs.readdirSync(parentPath).forEach((fName) => {
      /** Current URL (e.g. `/assets/common/common.css`) */
      const currUrl = `${parentUrl}/${fName}`;
      /** Current file path (e.g. `c:\\GitHub\\source\\assets\\common\common.js`) */
      const currPath = path.join(baseDir, currUrl);

      if (fName.startsWith('--')) return;
      if (fName.startsWith('__')) return;

      const fStat = fs.statSync(currPath);
      const isFile = fStat.isFile();
      const isDirectory = fStat.isDirectory();

      if (isFile) {
        if (filter(fName)) files.push(currUrl);
      } else if (isDirectory) {
        if (depth < maxDepth) traverse(currUrl, depth + 1);
        else throw new Error(`Max directory depth reached: ${currUrl}`);
      }
    });
  };

  traverse('', 0);
  return files;
}

// console.log(findBuildScripts());
// console.log(findContentFiles());
