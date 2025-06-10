import path from 'path';
import fs from 'fs';
import consts from '../consts.js';
import logger from '../logger/logger.js';

import {getLayout} from './layouts.js';
import {buildPagination} from './build-pagination.js';
import {buildBreadcrumb} from './build-breadcrumb.js';
import {buildHead} from './build-head.js';
import {buildFooter} from './build-footer.js';

import {transclude} from './transclude.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */
/** @typedef {import('./typedef.js').ContentPartials} ContentPartials */

/**
 * Build page content
 * @param {PageMeta} pageMeta
 * @return {string}
 */
export function buildPage(pageMeta) {
  const fPath = path.join(consts.contentDir, pageMeta['source-url']);
  const srcContent = fs.readFileSync(fPath, 'utf8').replaceAll('\r\n', '\n');
  const separator = '---\n';
  if (!srcContent.startsWith(separator)) return;
  const fmEnd = srcContent.indexOf(separator, separator.length);

  /** @type {ContentPartials} */
  const contentPartials = {
    head: '',
    header: '',
    main: srcContent.slice(fmEnd + 4),
    footer: '',
    aside: '',
    breadcrumb: '',
    pagination: '',
  };

  const layout = getLayout(pageMeta.layout);

  logger.log(`Building ${pageMeta['source-url']}`);
  logger.printProgress('Building breadcrumb…');
  buildBreadcrumb(pageMeta, contentPartials, layout);
  // logger.updateProgress('Breadcrumb built\n');

  buildPagination(pageMeta, contentPartials, layout);
  buildHead(pageMeta, contentPartials, layout);
  buildFooter(pageMeta, contentPartials, layout);

  // logger.printProgress('Performing transclusion…');
  transclude(pageMeta, contentPartials);
  // logger.updateProgress('Transclusion completed\n');

  logger.log('\n');

  const mainHeading = (pageMeta.title.length > 120)?
      pageMeta['short-title']:
      pageMeta.title;

  const mainBody = layout.main
      .replace('{{MAIN-HEADING}}', mainHeading)
      .replace('{{MAIN-CONTENT}}', contentPartials.main)
  ;

  const html = layout.html
      .replace('{{HEAD-BODY}}', contentPartials.head)
      .replace('{{HEADER-BODY}}', contentPartials.header)
      .replace('{{BREADCRUMB-BODY}}', contentPartials.breadcrumb)
      .replace('{{MAIN-BODY}}', mainBody)
      .replace('{{FOOTER-BODY}}', contentPartials.footer)
      .replace('{{PAGINATION-BODY}}', contentPartials.pagination)
  ;

  return html;
}
