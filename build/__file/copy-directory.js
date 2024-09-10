import {fileURLToPath} from 'url';
import {dirname, resolve, extname} from 'path';
import fs from 'fs';

import {getFilesFromDir} from './get-files.js';
import {processHtml} from '../__html/process-html.js';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');

/**
 * Copy files from source/ to docs/
 * @param {string} subDir - sub directory
 * @param {number} maxDepth
 */
export function copyDirectory(subDir, maxDepth) {
  const srcBasePath = resolve(ProjectPath, './source/', subDir);
  const destBasePath = resolve(ProjectPath, './docs/', subDir);
  const srcFilePaths = getFilesFromDir(
      srcBasePath,
      ['.css', '.html', '.js', '.gs'],
      (typeof maxDepth === 'number')?maxDepth:6,
  );

  srcFilePaths.forEach((relPath) => {
    const srcPath = srcBasePath + relPath;
    const destPath = destBasePath + relPath;
    const destDir = dirname(destPath);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, {recursive: true});
    if (extname(srcPath) === '.html') {
      const fileContent = fs.readFileSync(srcPath, 'utf-8');
      const processed = processHtml(fileContent, srcPath, srcBasePath);
      fs.writeFileSync(destPath, processed.source);
    } else {
      fs.copyFileSync(srcPath, destPath, fs.constants.COPYFILE_FICLONE);
    }
  });
}
