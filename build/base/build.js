import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync } from 'fs'
import { relativePath } from '../utils/uri-utils.js';

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
 * @property {'page'|'sheet'|'graph'|'chart'|'calculator'} type - Type of the page
 */

/**
 * Build breadcrumb
 * @param {PageOptions} pageOptions - Options
 * @returns {string}
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
 * Build stylesheet links
 * @param {PageOptions} pageOptions - Options
 * @returns {string}
 */
function buildCssLinks(pageOptions) {
  const basePath = pageOptions.path.base;
  const cssLinks = pageOptions.path.css;
  const lines = [];
  for (let idx = 0; idx < cssLinks.length; idx++) {
    lines.push(`  <link href="${relativePath(basePath, cssLinks[idx])}" rel="stylesheet">`);
  }
  return lines.join('\n');
}

/**
 * Build JavaScript links
 * @param {PageOptions} pageOptions - Options
 * @returns {string}
 */
function buildJsLinks(pageOptions) {
  const basePath = pageOptions.path.base;
  const jsLinks = pageOptions.path.js;
  const lines = [];
  for (let idx = 0; idx < jsLinks.length; idx++) {
    lines.push(`  <script src="${relativePath(basePath, jsLinks[idx])}"></script>`);
  }
  return lines.join('\n');
}

/**
 * @param {PageOptions} o - Options
 * @returns {string}
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
    .replace('{{CSS LINKS}}', buildCssLinks(o))
    .replace('{{JS LINKS}}', buildJsLinks(o))
    .replaceAll('{{PAGE TITLE}}', o.title)
    .replace('{{PAGE CONTENT}}', o.content)
    .replace('{{OG DESCRIPTION}}', o.description)
    .replace('{{OG IMAGE}}', ogImage)
}

/*

// Example usage

const testOptions = {
  type: 'chart',
  path: {
    base: '/section/sub-section/page-name',
    icon: '/images/logo_mini.png',
    css: [
      '/css/common.css',
      '/section/styles.css',
    ],
    js: [
      '/section/custom-js.js',
    ]
  },
  breadcrumb: [
    {path: '/content', title: 'Home'},
    {path: '/section/', title: 'Section title'},
    {path: '/events/sub-section/', title: 'Sub-section title'},
  ],
  content: 'content in <main></main>',
  title: 'long title',
  shortTitle: 'short title',
};
const output = buildBase(testOptions);
console.log(output);

*/