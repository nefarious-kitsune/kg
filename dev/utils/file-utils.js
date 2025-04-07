import {join, extname} from 'path';
import {readdirSync, statSync, existsSync} from 'fs';
import * as consts from '../consts.js';

/**
 * @typedef {Object} FileResult
 * @property {string} relPath
 * - Relative file path (e.g. `/a/b/test.js')
 * @property {string} fullDir
 * - Full directory path (e.g. `/GitHub/source/a/b/')
 * @property {string} fullPath
 * - Full file path (e.g. `/GitHub/source/a/b/test.js')
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
   * @param {string} relDir - current relative directory
   * @param {number} currDepth - current depth
   */
  const traverse = (relDir, currDepth) => {
    const fullPath = join(baseDir, relDir);

    readdirSync(fullPath).forEach((fileName) => {
      if (fileName === `__${builder}`) {
        const newRelDir = join(relDir, `__${builder}`);
        const newRelPath = join(relDir, `__${builder}`, `${builder}.js`);
        const newFullDir = join(baseDir, newRelDir);
        const newFullPath = join(baseDir, newRelPath);
        if (existsSync(newFullPath)) {
          files.push({
            relPath: newRelPath,
            fullDir: newFullDir,
            fullPath: newFullPath,
          });
        }
        return;
      };

      if (fileName.startsWith('--')) return;
      if (fileName.startsWith('__')) return;

      const newRelPath = join(relDir, fileName);
      const newFullPath = join(baseDir, newRelPath);
      if (statSync(newFullPath).isFile()) {
        // Skip
      } else if (statSync(newFullPath).isDirectory()) {
        if (currDepth < maxDepth) {
          traverse(newRelPath, currDepth + 1);
        } else {
          throw new Error(`Max directory depth reached: ${newRelPath}`);
        }
      }
    });
  };

  traverse('/', 0);
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
   * @param {string} relDir - current relative directory
   * @param {number} currDepth - current depth
   */
  const traverse = (relDir, currDepth) => {
    const fullPath = join(baseDir, relDir);

    readdirSync(fullPath).forEach((fileName) => {
      if (fileName.startsWith('--')) return;
      if (fileName.startsWith('__')) return;

      const newRelPath = join(relDir, fileName);
      const newFullDir = join(baseDir, relDir);
      const newFullPath = join(baseDir, relDir, fileName);

      if (statSync(newFullPath).isFile()) {
        if (filter(fileName)) {
          files.push({
            relPath: newRelPath,
            fullDir: newFullDir,
            fullPath: newFullPath,
          });
        }
      } else if (statSync(newFullPath).isDirectory()) {
        if (currDepth < maxDepth) {
          traverse(newRelPath, currDepth + 1);
        } else {
          throw new Error(`Max directory depth reached: ${newRelPath}`);
        }
      }
    });
  };

  traverse('/', 0);
  return files;
}

// console.log(findBuildScripts());
// console.log(findContentFiles());
