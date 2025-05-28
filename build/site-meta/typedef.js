/**
 * @typedef {Object} PageMeta
 * - Meta information of a page
 * @property {string} source-url
 * - URL of the source file, e.g. `/about/contact.md`
 * @property {string} permaLink
 * - Permanent link of the page, e.g. `/about/contact`
 * @property {string} title
 * - Full title of the page
 * @property {string} short-title
 * - Short title of the page (for use in breadcrumb)
 * @property {string} [desc]
 * - Short description of page content
 * @property {string} [image-url]
 * - URL of page icon
 * @property {string[]} breadcrumb
 * - List of URLs of breadcrumb items
 * @property {string} [prev]
 * - URL of previous page
 * @property {string} [next]
 * - URL of next page
 * @property {string[]} css
 * - CSS file to link in HEAD
 * @property {string[]} js
 * - JavaScript files to link in HEAD
 * @property {string} [css-code]
 * - Custom CSS code to insert into HEAD
 * @property {string} [js-code]
 * - Custom JavaScript code to insert into HEAD
 * @property {string} [topics]
 * - List of topics
 * @property {boolean} index
 * - Indicates if the page should be listed in Site Index and Topics Index
 * @property {boolean} published
 * - Indicates if the page should be published
 * @property {string} layout
 * - Page layout
 */

export {};
