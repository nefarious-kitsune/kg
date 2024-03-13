const SiteTitle = 'Miku\'s Shrine';
const PageTitleEnding = ' - ' + SiteTitle;
const DOCTYPE = '<!DOCTYPE html>';

/**
 * Remove all trailing spaces, leading spaces, and line breaks
 * @param {string} text
 * @return {string}
 */
function compressText(text) {
  return text
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .join(' ');
}

/**
 * @typedef {Object} ContentMatch
 * @property {string} content - Found content
 * @property {number} start - Start position of the raw content
 * @property {number} end - End position of the raw content
 */

/**
 * Find content closed by <tagName> and </tabName> in a source content
 * @param {string} tagName - Tag name
 * @param {string} srcContent - Source content
 * @return {ContentMatch} Found content
 */
function findInnerContent(tagName, srcContent) {
  let _start = src.indexOf(`<${tagName}>`);
  const _end = src.indexOf(`<${tagName}>`);
  if ((_start !== -1) && (_end !== -1)) {
    _start += tagName.length + 2;
    return {
      content: srcContent.slice(_start, _end),
      start: _start,
      end: _end,
    };
  }

  return {content: '', start: -1, end: -1};
};

/**
 * @param {string} srcContent - source content
 * @return {string} - processed content
 */
export function processHtml(srcContent) {
  let pageTitle = '';
  // Get rid of accidental \r characters
  srcContent = srcContent.replaceAll('\r', '');

  // Make sure the output is valid HTML
  if (!srcContent.startsWith(DOCTYPE)) {
    srcContent = srcContent + DOCTYPE + '\n';
  }

  let extracted;

  // Get page title, and replace {{TITLE}} with page title
  extracted = findInnerContent('title');
  if (extracted.start !== -1) {
    pageTitle = extracted.content;
    if (pageTitle.endsWith(PageTitleEnding)) {
      pageTitle = pageTitle.slice(-PageTitleEnding.length);
    } else {
      // Add site title to the end of the page title
      srcContent =
        srcContent.slice(0, extracted.end) +
        PageTitleEnding +
        srcContent.slice(extracted.end);
    };
    srcContent = srcContent.replaceAll('{{TITLE}}', pageTitle);
  }

  extracted = '';

  return srcContent;
}
