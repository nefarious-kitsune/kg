import path from 'path';
import fs from 'fs';
import {readTextFile} from '../files/files.js';
import consts from '../consts.js';
import logger from '../logger/logger.js';
import siteMeta from '../site-meta/site-meta.js';

import {buildPagination} from './build-pagination.js';
import {buildBreadcrumb} from './build-breadcrumb.js';
import {transclude} from './transclude.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */
/** @typedef {import('./typedef.js').ContentPartials} ContentPartials */

const tempDir = path.join(consts.sourceDir, '__templates/');
const templates = {
  'html': readTextFile(`${tempDir}/html.md`),
  'html-main': readTextFile(`${tempDir}/html-main.md`),
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

  /** @type {ContentPartials} */
  const contentPartials = {
    head: '',
    main: srcContent.slice(fmEnd + 4),
    footer: '',
    aside: '',
    breadcrumb: '',
    pagination: '',
  };

  logger.log(`Building ${pageMeta['source-url']}`);
  logger.printProgress('Building breadcrumb…');
  buildBreadcrumb(pageMeta, contentPartials);
  logger.updateProgress('Breadcrumb built\n');

  logger.printProgress('Building pagination…');
  buildPagination(pageMeta, contentPartials);
  logger.updateProgress('Pagination built\n');

  logger.printProgress('Performing transclusion…');
  transclude(pageMeta, contentPartials);
  logger.updateProgress('Transclusion completed\n');

  logger.log('\n');

  const mainHeading = (pageMeta.title.length > 120)?
      pageMeta['short-title']:
      pageMeta.title;

  const mainBody = templates['html-main']
      .replace('{{MAIN-HEADING}}', mainHeading)
      .replace('{{MAIN-CONTENT}}', contentPartials.main)
  ;

  const html = templates.html
      .replace('{{PAGE-TITLE}}', pageMeta.title)
      .replace('{{SITE-TITLE}}', siteMeta.title)
      .replace('{{HEAD-BODY}}', contentPartials.head)
      .replace('{{HEADER-BODY}}', contentPartials.header)
      .replace('{{MAIN-BODY}}', mainBody)
      .replace('{{FOOTER-BODY}}', contentPartials.footer)
  ;

  return html;
}

/**
 * @param {PageMeta} pageMeta
 * @return {string}
 **/
/** Process source files and copy to destination */
function buildMarkdownContent() {
  const permalinks = [...siteMeta.pages.keys()];
  permalinks.forEach((permalink) => {
    buildPageContent(siteMeta.pages.get(permalink));
  });
}

buildMarkdownContent();
