import path from 'path';
import fs from 'fs';
import {readTextFile} from '../files/files.js';
import consts from '../consts.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */
/** @typedef {import('./typedef.js').PageLayout} PageLayout */

/** @type {Map<String, PageLayout>} */
const layoutMap = new Map();

/** RegEx for HTML comment */
const htmlCommentReg = /<!--[\s\S]*?(?:-->)/g;

/** Mapping of template ID to file path fragment */
const templateFileMap = {
  'html': 'html.md',
  'main': 'main/main.md',
  'pagination': 'pagination/pagination.md',
  'pagination-link-item': 'pagination/link-item.md',
  'pagination-text-item': 'pagination/text-item.md',
  'pagination-text-item-current': 'pagination/text-item-current.md',
  'head': 'head/head.md',
  'css-link': 'head/css-link.md',
  'css-code': 'head/css-code.md',
  'js-link': 'head/js-link.md',
  'js-code': 'head/js-code.md',
  'rel-link-next': 'head/rel-link-next.md',
  'rel-link-prev': 'head/rel-link-prev.md',
  'footer': 'footer/footer.md',
  'breadcrumb': 'breadcrumb/breadcrumb.md',
  'breadcrumb-home-item': 'breadcrumb/home-item.md',
  'breadcrumb-link-item': 'breadcrumb/link-item.md',
  'breadcrumb-text-item': 'breadcrumb/text-item.md',
  'breadcrumb-text-item-current': 'breadcrumb/home-item.md',
};

const defaultLayoutDir = path.join(consts.contentDir, '.layouts/default/');
/** @type {PageLayout} */
const defaultLayout = {};
for (const [id, pathFrag] of Object.entries(templateFileMap)) {
  const templateFilePath = `${defaultLayoutDir}${pathFrag}`;
  const templateContent = readTextFile(templateFilePath);
  defaultLayout[id] = templateContent.replace(htmlCommentReg, '');
}
layoutMap.set('default', defaultLayout);

/**
 * Get layout
 * @param {string} layoutName - name of the layout
 * @return {PageLayout}
 */
export function getLayout(layoutName) {
  layoutName = layoutName.toLowerCase();
  if (layoutMap.has(layoutName)) return layoutMap.get(layoutName);

  const newLayoutDir = path.join(consts.contentDir, `.layouts/${layoutName}/`);
  const newLayout = {};
  for (const [id, pathFrag] of Object.entries(templateFileMap)) {
    const templateFilePath = `${newLayoutDir}${pathFrag}`;
    if (fs.existsSync(templateFilePath)) {
      const templateContent = readTextFile(templateFilePath);
      newLayout[id] = templateContent.replace(htmlCommentReg, '');
    } else {
      newLayout[id] = defaultLayout[id];
    }
  }
  layoutMap.set(layoutName, newLayout);
  return newLayout;
}
