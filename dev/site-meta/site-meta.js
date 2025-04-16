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

  const published = (typeof frontMatter.published === 'boolean')?
    frontMatter.published:
    true;

  if (!published) return;

  /** @type {PageMeta} */
  const pageMeta = {
    'source-url': fUrl,
    'title': frontMatter.title,
    'short-title': frontMatter['short-title'] || frontMatter.title,
    'desc': frontMatter.desc,
    'published': true,
    'index': (typeof frontMatter.index === 'boolean')?frontMatter.index:true,
    'pagination': frontMatter.pagination,
  };

  let permaLink;
  if (frontMatter.permaLink) {
    permaLink = frontMatter.permaLink;
  } else if (path.basename(fUrl) === 'index.md') {
    permaLink = path.dirname(fUrl) + '/';
  } else {
    permaLink = fUrl.slice(0, -'.md'.length);
  }
  pageMeta.permaLink = permaLink;

  if ((frontMatter.prev) && (!frontMatter.prev.startsWith('{{'))) {
    pageMeta.prev = frontMatter.prev;
  }
  if ((frontMatter.next) && (!frontMatter.next.startsWith('{{'))) {
    pageMeta.next = frontMatter.next;
  }

  siteMeta.pages.set(permaLink, pageMeta);
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
