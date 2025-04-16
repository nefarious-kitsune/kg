import path from 'path';
import {readTextFile} from '../files/files.js';
import consts from '../consts.js';
import logger from '../logger/logger.js';
import siteMeta from '../site-meta/site-meta.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */
/** @typedef {import('./typedef.js').ContentPartials} ContentPartials */

const tempDir = path.join(consts.contentDir, '__templates/');
const templates = {
  'breadcrumb': readTextFile(`${tempDir}/breadcrumb.md`),
  'first-item': readTextFile(`${tempDir}/breadcrumb-first-item.md`),
  'item': readTextFile(`${tempDir}/breadcrumb-item.md`),
  'last-item': readTextFile(`${tempDir}/breadcrumb-last-item.md`),
};

/**
 * Build content fragment for breadcrumb
 * @param {PageMeta} pageMeta
 * @param {ContentPartials} partials
 **/
export function buildBreadcrumb(pageMeta, partials) {
  /**
   * @typedef {Object} Anchor
   * @property {string} url - Anchor URL
   * @property {string} text - Anchor text
  */

  /** @type {Anchor[]} - Breadcrumb item information */
  const anchors = [];

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
      anchors.unshift({url: refLink, title: refTitle});
    }
    lastSep = upLink.lastIndexOf('/');
  }

  if (anchors.length === 0) return;

  /**
   * Make HTML fragment for a breadcrumb item
   * @param {Anchor} a
   * @return {string}
   */
  const makeItem = (a) => (
    templates['item']
        .replace('{{TITLE}}', a.title)
        .replace('{{URL}}', a.url)
  );

  const firstItem = templates['first-item'];
  const lastItem = templates['last-item']
      .replace('{{TITLE}}', pageMeta['short-title']);
  const items = [
    firstItem,
    ...anchors.map((a) => makeItem(a)),
    lastItem,
  ];

  partials.breadcrumb =
      templates.breadcrumb.replace('{{BREADCRUMB-CONTENT}}', items.join('\n'));
}
