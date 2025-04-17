import path from 'path';
import {readTextFile} from '../files/files.js';
import consts from '../consts.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */
/** @typedef {import('./typedef.js').ContentPartials} ContentPartials */

const tempDir = path.join(consts.contentDir, '__templates/');
const templates = {
  'footer': readTextFile(`${tempDir}/footer.md`),
};

/**
 * Build content fragment for <head></head>
 * @param {PageMeta} meta
 * @param {ContentPartials} partials
 **/
export function buildFooter(meta, partials) {
  partials.footer = templates.footer;
}
