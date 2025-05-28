import siteMeta from '../site-meta/site-meta.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */
/** @typedef {import('./typedef.js').PageLayout} PageLayout */
/** @typedef {import('./typedef.js').ContentPartials} ContentPartials */

/**
 * Build content fragment for <head></head>
 * @param {PageMeta} meta
 * @param {ContentPartials} partials
 * @param {PageLayout} layout
 **/
export function buildHead(meta, partials, layout) {
  const items = [];
  let block;

  if (Array.isArray(meta.css)) {
    meta.css.forEach((url) => {
      items.push(layout['css-link'].replace('{{URL}}', url));
    });
  }
  if (Array.isArray(meta.js)) {
    meta.js.forEach((url) => {
      items.push(layout['js-link'].replace('{{URL}}', url));
    });
  }
  if (meta['css-code']) {
    block = layout['css-code'].replace('{{CSS-CODE}}', meta['css-code']);
    items.push(block);
  }
  if (meta['js-code']) {
    block = layout['js-code'].replace('{{JS-CODE}}', meta['js-code']);
    items.push(block);
  }

  if (meta.prev) {
    block = layout['rel-link-prev'].replace('{{URL}}', meta.prev);
    items.push(block);
  }
  if (meta.next) {
    block = layout['rel-link-next'].replace('{{URL}}', meta.next);
    items.push(block);
  }

  let headBody = layout.head
      .replace('{{PAGE-TITLE}}', meta.title)
      .replace('{{SITE-TITLE}}', siteMeta.title)
      .replace('{{HEAD-CONTENT}}', items.join('\n'))
  ;

  headBody = headBody.split('\n').map((line) => `  ${line}`).join('\n');

  partials.head = headBody;
}
