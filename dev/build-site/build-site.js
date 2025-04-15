import path from 'path';
import fs from 'fs';

import consts from '../consts.js';
import logger from '../logger/logger.js';
import siteMeta from '../site-meta/site-meta.js';

import {buildBreadcrumb} from './build-breadcrumb.js';
import {transclude} from './transclude.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */

const loadFile = (path) => fs.readFileSync(path, 'utf8');
// const saveFile = (path, content) => fs.writeFileSync(path, content);

const TemplateDir = path.join(consts.sourceDir, '__templates/');
export const Templates = {
  'html': loadFile(`${TemplateDir}/html.md`),
  'html-main': loadFile(`${TemplateDir}/html-main.md`),

  'breadcrumb': loadFile(`${TemplateDir}/breadcrumb.md`),
  'breadcrumb-first-item': loadFile(`${TemplateDir}/breadcrumb-first-item.md`),
  'breadcrumb-item': loadFile(`${TemplateDir}/breadcrumb-item.md`),
  'breadcrumb-last-item': loadFile(`${TemplateDir}/breadcrumb-last-item.md`),

  'pagination': loadFile(`${TemplateDir}/pagination.md`),
  'pagination-prev': loadFile(`${TemplateDir}/pagination-prev.md`),
  'pagination-next': loadFile(`${TemplateDir}/pagination-next.md`),
};

/**
 * Build page content
 * @param {PageMeta} pageMeta
 * @return {string}
 */
function buildPageContent(pageMeta) {
  const fPath = path.join(consts.sourceDir, pageMeta['source-url']);
  const srcContent = fs.readFileSync(fPath, 'utf8').replaceAll('\r\n', '\n');
  const separator = '---\n';
  if (!srcContent.startsWith(separator)) return;
  const fmEnd = srcContent.indexOf(separator, separator.length);
  let sourceContent = srcContent.slice(fmEnd + 4);

  const breadcrumb = buildBreadcrumb(pageMeta);
  // logger.print(breadcrumb);
  sourceContent = transclude(pageMeta, sourceContent);
  // logger.print(sourceContent);

  const output = sourceContent;
  return output;
}

/**
 * @param {PageMeta} pageMeta
 * @return {string}
 **/
/** Process source files and copy to destination */
function buildMarkdownContent() {
  const permalinks = [...siteMeta.pages.keys()];
  permalinks.forEach((permalink) => {
    const content = buildPageContent(siteMeta.pages.get(permalink));
  });
}

buildMarkdownContent();
