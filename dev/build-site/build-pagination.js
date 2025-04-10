import logger from '../logger/logger.js';
import siteMeta from '../site-meta/site-meta.js';

import {Templates} from './build-site.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */

/**
 * Generate HTML content for breadcrumb
 * @param {PageMeta} pageMeta
 * @return {string}
 **/
export function buildPagination(pageMeta) {
  // let url = pageMeta.permaLink;
  // let title = siteMeta.pages.get(url)['breadcrumb-title'];

  const parts = [];

  let upLink = pageMeta.permaLink;
  if (upLink.endsWith('/')) upLink = upLink.slice(0, -1);
  let lastSep = upLink.lastIndexOf('/');
  while (lastSep > 0) {
    upLink = upLink.slice(0, lastSep);
    const refLink = upLink + '/';
    const refPageMeta = siteMeta.pages.get(refLink);
    if (!refPageMeta) {
      logger.warn(
          `Error when building breadcrumb for '${pageMeta.permaLink}'` +
          `(information for '${refLink}' not found'`,
      );
    } else {
      const refTitle = refPageMeta['short-title'];
      parts.unshift({url: refLink, title: refTitle});
    }
    lastSep = upLink.lastIndexOf('/');
  }

  if (parts.length === 0) return '';

  const breadcrumbItems = parts.map((p) =>
    Templates['breadcrumb-item']
        .replace('{{SHORT-TITLE}}', p.title)
        .replace('{{LINK-URL}}', p.url),
  );

  const firstItem = Templates['breadcrumb-first-item'];
  const lastItem = Templates['breadcrumb-last-item']
      .replace('{{SHORT-TITLE}}', pageMeta['short-title']);

  breadcrumbItems.unshift(firstItem);
  breadcrumbItems.push(lastItem);

  return Templates['breadcrumb']
      .replace('{{BREADCRUMB-CONTENT}}', breadcrumbItems.join('\n'))
  ;
}
