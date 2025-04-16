import path from 'path';
import fs from 'fs';
import YAML from 'yaml';

import consts from '../consts.js';
import {findContentFiles} from '../files/find-files.js';

/** @typedef {import('./typedef.js').PageMeta} PageMeta */

const siteMeta = {
  'title': consts.siteTitle,
  'base-url': consts.baseUrl,
  'pages': new Map(),
};

/**
 * Parse page meta information
 * @param {string} fUrl - URL of the file
 */
function parsePageMeta(fUrl) {
  const fPath = path.join(consts.sourceDir, fUrl);
  const srcContent = fs.readFileSync(fPath, 'utf8').replaceAll('\r\n', '\n');

  const separator = '---\n';
  if (!srcContent.startsWith(separator)) return;
  const fmStart = separator.length;
  const fmEnd = srcContent.indexOf(separator, fmStart);
  if (fmEnd < 0) return;
  const fmContent = srcContent.slice(fmStart, fmEnd);
  const frontMatter = YAML.parse(fmContent);

  /** @type {PageMeta} */
  const pageMeta = Object.assign({'source-url': fUrl}, frontMatter);

  if (!pageMeta['short-title']) pageMeta['short-title'] = pageMeta.title;
  if (typeof pageMeta.index !== 'boolean') pageMeta.index = true;
  if (typeof pageMeta.published !== 'boolean') pageMeta.published = true;

  if (!pageMeta.published) return;

  if (!pageMeta.permaLink) {
    if (path.basename(fUrl) === 'index.md') {
      pageMeta.permaLink = path.dirname(fUrl) + '/';
    } else {
      pageMeta.permaLink = fUrl.slice(0, -'.md'.length);
    }
  }

  if ((pageMeta.prev) && (!pageMeta.prev.startsWith('{{'))) {
    delete pageMeta.prev;
  }

  if ((pageMeta.next) && (!pageMeta.next.startsWith('{{'))) {
    delete pageMeta.next;
  }

  siteMeta.pages.set(pageMeta.permaLink, pageMeta);
}

/** Build page meta */
function buildMeta() {
  const filter = (url) => (
    (path.extname(url) === '.md') &&
    (path.basename(url) !== 'readme.md')
  );
  const mdFiles = findContentFiles(consts.sourceDir, filter);
  mdFiles.forEach((fUrl) => parsePageMeta(fUrl));
}

buildMeta();

export default siteMeta;
