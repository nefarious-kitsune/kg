import {fileURLToPath} from 'url';
import {dirname, resolve, extname} from 'path';
import {readFileSync, writeFileSync} from 'fs';
import fs from 'fs';
import {getFilesFromDir} from '../utils/file-utils.js';
import {processHtml} from './process-html.js';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');

/**
 * Copy static files
 * @param {string} subDir
 */
export function copyStatic(subDir) {
  const srcBasePath = resolve(ProjectPath, './source/', subDir);
  const destBasePath = resolve(ProjectPath, './docs/', subDir);
  const srcFilePaths = getFilesFromDir(
      srcBasePath,
      ['.css', '.html', '.js'],
      6,
  );

  srcFilePaths.forEach((relPath) => {
    const srcPath = srcBasePath + relPath;
    const destPath = destBasePath + relPath;
    const destDir = dirname(destPath);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, {recursive: true});
    if (extname(srcPath) === '.html') {
      const fileContent = readFileSync(srcPath, 'utf-8');
      const processed = processHtml(fileContent);
      writeFileSync(destPath, processed.content);
      // console.log(processed.title + ' - ' + processed.tags.join(', '));
    } else {
      fs.copyFileSync(srcPath, destPath, fs.constants.COPYFILE_FICLONE);
    }

    console.log(`${relPath} copied`);
  });
}
