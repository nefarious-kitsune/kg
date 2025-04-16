import path from 'path';
import {readTextFile} from '../files/files.js';
import consts from '../consts.js';
import siteMeta from '../site-meta/site-meta.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */
/** @typedef {import('./typedef.js').ContentPartials} ContentPartials */

const tempDir = path.join(consts.sourceDir, '__templates/');
const templates = {
  'head': readTextFile(`${tempDir}/head.md`),
  'css': readTextFile(`${tempDir}/head-css.md`),
  'js': readTextFile(`${tempDir}/head-js.md`),
  'custom-css': readTextFile(`${tempDir}/head-custom-css.md`),
  'custom-js': readTextFile(`${tempDir}/head-custom-js.md`),
  'next-link': readTextFile(`${tempDir}/head-rel-link-next.md`),
  'prev-link': readTextFile(`${tempDir}/head-rel-link-prev.md`),
};

/**
 * Build content fragment for <head></head>
 * @param {PageMeta} meta
 * @param {ContentPartials} partials
 **/
export function buildHead(meta, partials) {
  const items = [];
  let block;

  if (Array.isArray(meta.css)) {
    meta.css.forEach((url) => {
      items.push(templates.css.replace('{{URL}}', url));
    });
  }
  if (Array.isArray(meta.js)) {
    meta.js.forEach((url) => {
      items.push(templates.js.replace('{{URL}}', url));
    });
  }
  if (meta['css-code']) {
    block = templates['custom-css'].replace('{{CSS-CODE}}', meta['css-code']);
    items.push(block);
  }
  if (meta['js-code']) {
    block = templates['custom-js'].replace('{{JS-CODE}}', meta['js-code']);
    items.push(block);
  }

  if (meta.prev) {
    block = templates['prev-link'].replace('{{URL}}', meta.prev)
    items.push(block);
  }
  if (meta.next) {
    block = templates['next-link'].replace('{{URL}}', meta.next);
    items.push(block);
  }

  let headBody = templates.head
      .replace('{{PAGE-TITLE}}', meta.title)
      .replace('{{SITE-TITLE}}', siteMeta.title)
      .replace('{{HEAD-CONTENT}}', items.join('\n'))
  ;

  headBody = headBody.split('\n').map((line) => `  ${line}`).join('\n');

  partials.head = headBody;
}
