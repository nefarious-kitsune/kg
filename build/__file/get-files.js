import {readdirSync, statSync} from 'fs';
import {join, extname, basename} from 'path';

/**
* Get all files of certain file types in a directory
* @param {string} searchPath - Directory to search
* @param {string[]} fileTypes - File types
* @param {number} maxDepth - How deep into the sub-directories
* @return {string[]} - Relative paths of the found files
*/
export function getFilesFromDir(searchPath, fileTypes, maxDepth) {
  maxDepth = Number.isInteger(maxDepth)?maxDepth:0;
  const results = [];

  const traverse = (parentPath, currentDepth) => {
    readdirSync(parentPath).forEach((file) => {
      if ((file.startsWith('-')) ||(file.startsWith('_'))) return;

      const currentPath = join(parentPath, file);
      if (statSync(currentPath).isFile()) {
        const ext = extname(currentPath);
        if (fileTypes.indexOf(ext) != -1) {
          results.push(currentPath.slice(searchPath.length));
        }
      } else if (statSync(currentPath).isDirectory()) {
        if (currentDepth < maxDepth) traverse(currentPath, currentDepth + 1);
      }
    });
  };
  traverse(searchPath, 0);
  return results;
}
