import path from 'path';
import fs from 'fs';
import consts from '../consts.js';
import {findContentFiles} from '../files/find-files.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */
/** @typedef {import('./typedef.js').ContentPartials} ContentPartials */

/**
 * @param {PageMeta} pageMeta
 * @return {string}
 **/

/**
 * Export asset files
 */
export function exportAssets() {
  const extensions = [
    '.css', '.js',
    '.png', '.jpg', '.svg',
  ];

  const srcBaseDir = path.join(consts.contentDir, '/assets/');
  const destBaseDir = path.join(consts.publicDir, '/assets/');

  const filter = (url) => extensions.indexOf(path.extname(url)) !== -1;
  const assetFiles = findContentFiles(srcBaseDir, filter);

  assetFiles.forEach((fUrl) => {
    const srcPath = path.join(srcBaseDir, fUrl);
    const destPath = path.join(destBaseDir, fUrl);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, {recursive: true});
    fs.copyFileSync(srcPath, destPath, fs.constants.COPYFILE_FICLONE);
  });
}

/**
 * Export data files
 */
export function exportData() {
  const extensions = ['.tsv', '.json'];

  const filter = (url) => extensions.indexOf(path.extname(url)) !== -1;
  const assetFiles = findContentFiles(consts.contentDir, filter);

  assetFiles.forEach((fUrl) => {
    const srcPath = path.join(consts.contentDir, fUrl);
    const destPath = path.join(consts.publicDir, fUrl);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, {recursive: true});
    fs.copyFileSync(srcPath, destPath, fs.constants.COPYFILE_FICLONE);
  });
}
