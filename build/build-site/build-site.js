import path from 'path';
import fs from 'fs';
import consts from '../consts.js';
import logger from '../logger/logger.js';
import siteMeta from '../site-meta/site-meta.js';

import {buildPage} from '../build-page/build-page.js';
import {saveTextFile} from '../files/files.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */
/** @typedef {import('./typedef.js').ContentPartials} ContentPartials */

/**
 * @param {PageMeta} pageMeta
 * @return {string}
 **/

/**
 * Build HTML pages from Markdown sources
 */
function buildPages() {
  const permalinks = [...siteMeta.pages.keys()];
  permalinks.forEach((permalink) => {
    const meta = siteMeta.pages.get(permalink);
    const html = buildPage(meta);

    const destUrl = (permalink.endsWith('/'))?
      permalink + 'index.html':
      permalink + '.html';

    const destPath = path.join(consts.siteDir, destUrl);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, {recursive: true});
    logger.log(`Published: '${destUrl}'`);
    saveTextFile(destPath, html);
  });
}

/**
 * Build and publish content
 */
export function buildSite() {
  buildPages();
}
