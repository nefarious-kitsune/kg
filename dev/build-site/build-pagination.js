import path from 'path';
import {readTextFile} from '../files/files.js';
import consts from '../consts.js';
import logger from '../logger/logger.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */
/** @typedef {import('./typedef.js').ContentPartials} ContentPartials */

const tempDir = path.join(consts.sourceDir, '__templates/');
const templates = {
  'pagination': readTextFile(`${tempDir}/pagination.md`),
  'item': readTextFile(`${tempDir}/pagination-item.md`),
  'item-current': readTextFile(`${tempDir}/pagination-item-current.md`),
  'item-inactive': readTextFile(`${tempDir}/pagination-item-inactive.md`),
};

const mdLinkRe = /\[([^\]]+)\]\(([^\)]+)\)/i;

/**
 * Build content fragment for pagination
 * @param {PageMeta} meta
 * @param {ContentPartials} partials
 **/
export function buildPagination(meta, partials) {
  if (!Array.isArray(meta.pagination)) return;

  /**
   * @typedef {Object} Anchor
   * @property {string} url - Anchor URL
   * @property {string} text - Anchor text
  */

  /** @type {Anchor[]} - Pagination item information */
  const anchors = meta.pagination.map((markdown, idx) => {
    if (markdown.indexOf('\\') !== -1) {
      logger.warn(`Pagination item not well formed: '${markdown}'`),
      markdown = markdown.replaceAll('\\', '/');
    }

    if (markdown.indexOf('//') !== -1) {
      logger.warn(`Pagination item not well formed: ${markdown}`),
      markdown = markdown.replaceAll('//', '/');
    }

    const reResult = markdown.match(mdLinkRe);
    if (reResult) return {url: reResult[2], title: reResult[1]};
    else return {url: markdown, title: idx + 1};
  });

  /** Position of the current page */
  const currPos = anchors.findIndex((p) => p.url === meta.permaLink);

  // "Unlink" current item
  if (currPos >= 0) anchors[currPos].url = '';

  /**
   * Make HTML fragment for a pagination item
   * @param {Anchor} a
   * @return {string}
   */
  const makeItem = (a) => {
    if (a.url) {
      return templates['item']
          .replace('{{TITLE}}', a.title)
          .replace('{{URL}}', a.url);
    } else {
      return templates['item-inactive']
          .replace('{{TITLE}}', a.title);
    }
  };
  const prevUrl = anchors[currPos-1]?.url||null;
  const nextUrl = anchors[currPos+1]?.url||null;
  if (prevUrl) meta.prev = prevUrl;
  if (nextUrl) meta.next = nextUrl;
  const prevItem = makeItem({title: '⟨', url: prevUrl});
  const nextItem = makeItem({title: '⟩', url: nextUrl});
  const firstItem = makeItem(anchors[0]);
  const lastItem = makeItem(anchors[anchors.length-1]);
  const ellipsisItem = makeItem({title: '…', url: null});
  /** @type {string[]}*/
  let items;

  /*
    Possible layouts:
      ⟪ ⟨ 1 𝟐 3 4 5 6 7 ⟩ ⟫
      ⟪ ⟨ 1 𝟐 3 4 5 … 9 ⟩ ⟫
      ⟪ ⟨ 1 … 5 6 7 𝟖 9 ⟩ ⟫
  */

  if (anchors.length <= 7) {
    // Layout: ⟨ 1 𝟐 3 4 5 6 7 ⟩
    items = [
      prevItem,
      ...anchors.map((a) => makeItem(a)),
      nextItem,
    ];
  } else if (currPos <= 5) {
    // Layout: ⟨ 1 𝟐 3 4 5 … 9 ⟩
    items = [
      prevItem,
      ...anchors.slice(0, 5).map((a) => makeItem(a)),
      ellipsisItem,
      lastItem,
      nextItem,
    ];
  } else if (currPos >= anchors.length - 4) {
    // Layout: ⟨ 1 … 5 6 7 𝟖 9 ⟩
    items = [
      prevItem,
      firstItem,
      ellipsisItem,
      ...anchors.slice(anchors.length - 4).map((a) => makeItem(a)),
      nextItem,
    ];
  } else {
    // Layout: ⟨ 1 … 4 𝟓 6 … 9 ⟩
    items = [
      prevItem,
      firstItem,
      ellipsisItem,
      ...anchors.slice(currPos-1, currPos+2).map((a) => makeItem(a)),
      ellipsisItem,
      lastItem,
      nextItem,
    ];
  }

  partials.pagination =
      templates.pagination.replace('{{PAGINATION-CONTENT}}', items.join('\n'));
}
