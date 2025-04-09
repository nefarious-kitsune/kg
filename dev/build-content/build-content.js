import path from 'path';
import fs from 'fs';

import * as consts from '../consts.js';
import * as logger from '../logger/logger.js';
import {siteMeta} from '../site-meta/site-meta.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */


const loadFile = (path) => fs.readFileSync(path, 'utf8');
// const saveFile = (path, content) => fs.writeFileSync(path, content);

const TemplateDir = path.join(consts.sourceDir, '__templates/');
const templates = {
  'html': loadFile(`${TemplateDir}/html.md`),
  'html-main': loadFile(`${TemplateDir}/html-main.md`),

  'breadcrumb': loadFile(`${TemplateDir}/breadcrumb.md`),
  'breadcrumb-first-item': loadFile(`${TemplateDir}/breadcrumb-first-item.md`),
  'breadcrumb-item': loadFile(`${TemplateDir}/breadcrumb-item.md`),
  'breadcrumb-last-item': loadFile(`${TemplateDir}/breadcrumb-last-item.md`),
};

/**
 * @param {PageMeta} pageMeta
 * @return {string}
 **/
function generateBreadcrumb(pageMeta) {
  // let url = pageMeta.permaLink;
  // let title = siteMeta.pages.get(url)['breadcrumb-title'];

  const parts = [];

  let upLink = pageMeta.permaLink;
  if (upLink.endsWith('/')) upLink = upLink.slice(0, -1);
  let lastSep = upLink.lastIndexOf('/');
  while (lastSep > 0) {
    upLink = upLink.slice(0, lastSep);
    const url = upLink + '/';
    const title = siteMeta.pages.get(url)['breadcrumb-title'];
    parts.unshift({url: url, title: title});
    lastSep = upLink.lastIndexOf('/');
  }

  if (parts.length === 0) return '';

  const items = parts.map((p) =>
    templates['breadcrumb-item']
        .replace('{{BREADCRUMB-TITLE}}', p.title)
        .replace('{{LINK-URL}}', p.url),
  );

  const firstItem = templates['breadcrumb-first-item'];
  const lastItem = templates['breadcrumb-last-item']
      .replace('{{BREADCRUMB-TITLE}}', pageMeta['breadcrumb-title']);

  items.unshift(firstItem);
  items.push(lastItem);

  return templates['breadcrumb']
      .replace('{{BREADCRUMB-CONTENT}}', items.join('\n'))
  ;
}

/** Process source files and copy to destination */
function buildMarkdownContent() {
  const permalinks = [...siteMeta.pages.keys()];
  permalinks.forEach((permalink) => {
    const pageMeta = siteMeta.pages.get(permalink);
    const fPath = path.join(consts.sourceDir, pageMeta['source-url']);
    const srcContent = fs.readFileSync(fPath, 'utf8').replaceAll('\r\n', '\n');

    const separator = '---\n';
    if (!srcContent.startsWith(separator)) return;
    const fmEnd = srcContent.indexOf(separator, separator.length);
    const mainContent = srcContent.slice(fmEnd);
    const breadcrumb = generateBreadcrumb(pageMeta);
    // logger.log(JSON.stringify(breadcrumbLinks, null, ' '));
    logger.log(breadcrumb);
  });
}

buildMarkdownContent();
