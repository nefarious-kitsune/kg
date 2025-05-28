/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */
/** @typedef {import('./typedef.js').PageLayout} PageLayout */
/** @typedef {import('./typedef.js').ContentPartials} ContentPartials */

/**
 * Build content fragment for <head></head>
 * @param {PageMeta} meta
 * @param {ContentPartials} partials
 * @param {PageLayout} layout
 **/
export function buildFooter(meta, partials, layout) {
  partials.footer = layout.footer;
}
