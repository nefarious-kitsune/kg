import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync} from 'fs';
import {relativePath} from '../utils/uri-utils.js';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const BaseTemplate = readFileSync(resolve(ModulePath, './base.html'), 'utf-8');

/**
 * @typedef {Object} linkData
 * @property {boolean} title - Title of the linked page
 * @property {boolean} path - Path of the linked page
 */

/**
 * @typedef {Object} PageOptions
 * @property {object} path - Container object for path information
 * @property {string} path.base - Base path of the page
 * @property {string} path.icon - Path of the page icon
 * @property {string[]} path.css - Paths of stylesheets
 * @property {string[]} path.js - Paths of JavaScript files
 * @property {linkData[]} breadcrumb - Breadcrumb data
 * @property {string} title - Title of the page
 * @property {string} [shortTitle] - Short title of the page (for breadcrumb)
 * @property {string} content - Main content of the page
 * @property {string} description - Summary description of the page
 * @property {'page'|'sheet'|'graph'|'chart'|'calculator'} type - Page type
 */

/**
 * Build breadcrumb
 * @param {PageOptions} pageOptions - Options
 * @return {string}
 */
function buildBreadcrumb(pageOptions) {
  const breadcrumb = pageOptions.breadcrumb;
  const basePath = pageOptions.path.base;
  const pageTitle = pageOptions.shortTitle || pageOptions.title;
  const lines = [];
  for (let idx = 0; idx < breadcrumb.length; idx++) {
    const link = breadcrumb[idx];
    const linkPath = relativePath(basePath, link.path);
    const linkTitle = link.title;
    lines.push('    <span class="chevron">›</span>');
    lines.push(`    <a class="link" href="${linkPath}">${linkTitle}</a>`);
  }
  lines.push('    <span class="chevron">›</span>');
  lines.push(`    <span class="current">${pageTitle}</span>`);
  return lines.join('\n');
}

/**
 * Build stylesheet content
 * @param {PageOptions} pageOptions - Options
 * @return {string}
 */
function buildCssContent(pageOptions) {
  const basePath = pageOptions.path.base;
  const lines = [];
  if (pageOptions?.css?.links?.length) {
    const cssLinks = pageOptions.css.links;
    for (let idx = 0; idx < cssLinks.length; idx++) {
      const relLink = relativePath(basePath, cssLinks[idx]);
      lines.push(`  <link href="${relLink}" rel="stylesheet">`);
    }
  }
  if (pageOptions?.css?.embedded?.length) {
    lines.push('<style>');
    lines.push(pageOptions.css.embedded);
    lines.push('</style>');
  }
  return lines.join('\n');
}

/**
 * Build JavaScript content
 * @param {PageOptions} pageOptions - Options
 * @return {string}
 */
function buildJsContent(pageOptions) {
  const basePath = pageOptions.path.base;
  const lines = [];
  if (pageOptions?.js?.links?.length) {
    const jsLinks = pageOptions.js.links;
    for (let idx = 0; idx < jsLinks.length; idx++) {
      const relLink = relativePath(basePath, jsLinks[idx]);
      lines.push(`  <script src="${relLink}"></script>`);
    }
  }
  if (pageOptions?.js?.embedded?.length) {
    lines.push('<script>');
    lines.push(pageOptions.js.embedded);
    lines.push('</style>');
  }
  return lines.join('\n');
}

/**
 * @param {PageOptions} o - Options
 * @return {string}
 */
export function buildBase(o) {
  const pageIconPath = relativePath(o.path.base, o.path.icon);
  let ogImage = '';
  switch (o.type) {
    case 'page': ogImage = 'page-2x_n.png'; break;
    case 'sheet': ogImage = 'sheet-2x_n.png'; break;
    case 'chart': ogImage = 'chart-2x_n.png'; break;
    case 'graph': ogImage = 'graph-2x_n.png'; break;
    case 'calculator': ogImage = 'calculator-2x_n.png'; break;
    default: ogImage = 'page-2x_n.png';
  }
  return BaseTemplate
      .replace('{{ICON PATH}}', pageIconPath)
      .replace('{{BREADCRUMB}}', buildBreadcrumb(o))
      .replace('{{CSS}}', buildCssContent(o))
      .replace('{{JAVASCRIPT}}', buildJsContent(o))
      .replaceAll('{{PAGE TITLE}}', o.title)
      .replace('{{PAGE CONTENT}}', o.content)
      .replace('{{OG DESCRIPTION}}', o.description)
      .replace('{{OG IMAGE}}', ogImage);
}
