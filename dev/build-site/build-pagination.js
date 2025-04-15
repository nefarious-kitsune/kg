import path from 'path';
import fs from 'fs';
import consts from '../consts.js';
import logger from '../logger/logger.js';

import {readTextFile} from '../files/files.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */
/** @typedef {import('../site-meta/typedef.js').ContentPartials} ContentPartials */

const tempDir = path.join(consts.sourceDir, '__templates/');
export const templates = {
  'pagination': readTextFile(`${tempDir}/pagination.md`),
  'item': readTextFile(`${tempDir}/pagination-item.md`),
  'item-current': readTextFile(`${tempDir}/pagination-item-current.md`),
  'item-inactive': readTextFile(`${tempDir}/pagination-item-inactive.md`),
};

const mdLinkRe = /\[([^\]]+)\]\(([^\)]+)\)/i;

/**
 * Generate HTML content for breadcrumb
 * @param {PageMeta} meta
 * @param {ContentPartials} partials
 **/
export function buildPagination(meta) {
  // let url = pageMeta.permaLink;
  // let title = siteMeta.pages.get(url)['breadcrumb-title'];
  if (!Array.isArray(meta.pagination)) return;

  const parts = meta.pagination.map((item, idx) => {
    const reResult = item.match(mdLinkRe);
    if (reResult) return {text: reResult[1], url: reResult[2]}
    else return {text: idx + 1, url: item};
  });

  let firstItem;
  let lastItem;
  const items = [];
  let pRangeStart;
  let pRangeEnd;
  const pIndex = parts.findIndex((p) => p.url === meta.permaLink);

  if (pIndex > 0) {
    firstItem = templates['item']
        .replace('{{TITLE}}', '⟨')
        .replace('{{URL}}', parts[pIndex-1].url);
  } else {
    firstItem = templates['item-inactive'].replace('{{TITLE}}', '⟨');
  }

  if (pIndex < parts.length - 1) {
    lastItem = templates['item']
        .replace('{{TITLE}}', '⟩')
        .replace('{{URL}}', parts[pIndex+1].url);
  } else {
    lastItem = templates['item-inactive'].replace('{{TITLE}}', '⟩');
  }

  /*
    Possible layouts:
      ⟪ ⟨ 1 𝟐 3 4 5 6 7 ⟩ ⟫
      ⟪ ⟨ 1 𝟐 3 4 5 … 9 ⟩ ⟫
      ⟪ ⟨ 1 … 5 6 7 𝟖 9 ⟩ ⟫
      ⟪ ⟨ 1 … 4 𝟓 6 … 9 ⟩ ⟫
  */

  let currItem;
  let currPart;
  if (parts.length <= 7) {
    // Layout: ⟨ 1 𝟐 3 4 5 6 7 ⟩
    parts.forEach((p, i) => {
      if (i === pIndex) {
        currItem = templates['item-current'].replace('{{TITLE}}', p.text);
      } else {
        currItem = templates['item']
            .replace('{{TITLE}}', p.text)
            .replace('{{URL}}', p.url);
      }
      items.push(currItem);
    });
  } else if (pIndex < 5) {
    // Layout: ⟪ ⟨ 1 𝟐 3 4 5 … 9 ⟩ ⟫
    for (let i = 0; i < 5; i++) {
      currPart = parts[i];
      if (i === pIndex) {
        currItem = templates['item-current']
            .replace('{{TITLE}}', currPart.text);
      } else {
        currItem = templates['item']
            .replace('{{TITLE}}', currPart.text)
            .replace('{{URL}}', currPart.url);
      }
      items.push(currItem);
    }

    currItem = templates['item-inactive']
        .replace('{{TITLE}}', '…');
    items.push(currItem);

    currPart = parts[parts.length-1];
    currItem = templates['item']
        .replace('{{TITLE}}', currPart.text)
        .replace('{{URL}}', currPart.url);
    items.push(currItem);
  }

  items.unshift(firstItem);
  items.push(lastItem);

  partials.pagination = parts;
}
