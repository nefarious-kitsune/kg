import logger from '../logger/logger.js';
import siteMeta from '../site-meta/site-meta.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */
/** @typedef {import('./typedef.js').PageLayout} PageLayout */
/** @typedef {import('./typedef.js').ContentPartials} ContentPartials */

/**
 * Build content fragment for breadcrumb
 * @param {PageMeta} pageMeta
 * @param {ContentPartials} partials
 * @param {PageLayout} layout
 **/
export function buildBreadcrumb(pageMeta, partials, layout) {
  /**
   * @typedef {Object} Anchor
   * @property {string} url - Anchor URL
   * @property {string} text - Anchor text
  */

  /** @type {Anchor[]} - Breadcrumb item information */
  const anchors = [];

  let upLink = pageMeta.permaLink;
  if (upLink.endsWith('/')) upLink = upLink.slice(0, -1);
  let lastDelimiterPos = upLink.lastIndexOf('/');
  while (lastDelimiterPos > 0) {
    upLink = upLink.slice(0, lastDelimiterPos);
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
    lastDelimiterPos = upLink.lastIndexOf('/');
  }

  if (anchors.length === 0) return;

  /**
   * Make HTML fragment for a breadcrumb item
   * @param {Anchor} a
   * @return {string}
   */
  const makeItem = (a) => (
    layout['breadcrumb-item']
        .replace('{{TITLE}}', a.title)
        .replace('{{URL}}', a.url)
  );

  const homeItem = layout['breadcrumb-home-item'];
  const currentItem = layout['breadcrumb-current-item']
      .replace('{{TITLE}}', pageMeta['short-title']);
  const items = [
    homeItem,
    ...anchors.map((a) => makeItem(a)),
    currentItem,
  ];

  partials.breadcrumb = layout['breadcrumb']
      .replace('{{BREADCRUMB-CONTENT}}', items.join('\n'));
}
