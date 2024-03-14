const SiteTitle = 'Miku\'s Shrine';
const PageTitleEnding = ' - ' + SiteTitle;
const DOCTYPE = '<!DOCTYPE html>';
const DefaultImages = {
  page: 'https://kg.kitsune21.com/images/page-2x_n.png',
  sheet: 'https://kg.kitsune21.com/images/sheet-2x_n.png',
  chart: 'https://kg.kitsune21.com/images/chart-2x_n.png',
  graph: 'https://kg.kitsune21.com/images/graph-2x_n.png',
  calculator: 'https://kg.kitsune21.com/images/calculator-2x_n.png',
};

/**
 * Remove all trailing spaces, leading spaces, and line breaks
 * @param {string} text
 * @return {string}
 */
function condenseText(text) {
  return text
      .split('\n')
      .map((line) => line.trim())
      .join(' ');
}

/**
 * @typedef {Object} ContentMatch
 * @property {string} content - Found content
 * @property {number} start - Start position of the raw content
 * @property {number} end - End position of the raw content
 * @property {number} head - Start position <tag>
 * @property {number} tail - End position of </tag>
 */

/**
 * Find content closed by <tagName> and </tabName> in a source content
 * @param {string} tagName - Tag name
 * @param {string} srcContent - Source content
 * @return {ContentMatch} Found content
 */
function findInnerContent(tagName, srcContent) {
  const _head = srcContent.indexOf(`<${tagName}>`);
  const _end = srcContent.indexOf(`</${tagName}>`);
  if ((_head !== -1) && (_end !== -1)) {
    const _start = _head + tagName.length + 2;
    return {
      content: srcContent.slice(_start, _end).trim(),
      start: _start,
      end: _end,
      head: _head,
      tail: _end + (tagName.length + 3),
    };
  }

  return {
    content: '',
    start: -1,
    end: -1,
    head: -1,
    tail: -1,
  };
};

/**
 * @param {string} srcContent - source content
 * @return {object} - processed content
 */
export function processHtml(srcContent) {
  let pageTitle = '';
  let pageDescription = '';
  let pageTags = [];

  let processedContent = srcContent;

  // Get rid of accidental \r characters
  processedContent = processedContent.replaceAll('\r', '');

  // Make sure the output is valid HTML
  if (!processedContent.startsWith(DOCTYPE)) {
    processedContent = DOCTYPE + '\n' + processedContent;
  }

  let extracted;

  // Get page title, and replace {{TITLE}} with page title
  extracted = findInnerContent('title', processedContent);
  if (extracted.start !== -1) {
    pageTitle = extracted.content;
    if (pageTitle.endsWith(PageTitleEnding)) {
      pageTitle = pageTitle.slice(-PageTitleEnding.length);
    } else {
      // Add site title to the end of the page title
      processedContent =
        processedContent.slice(0, extracted.end) +
        PageTitleEnding +
        processedContent.slice(extracted.end);
    };
    processedContent = processedContent.replaceAll('{{TITLE}}', pageTitle);
  }

  extracted = findInnerContent('meta-data', processedContent);
  if (extracted.start !== -1) {
    const metaContent = extracted.content;
    // First, remove OG content
    if (processedContent.charAt(extracted.tail) === '\n') {
      processedContent =
        processedContent.slice(0, extracted.head) +
        processedContent.slice(extracted.tail + 1);
    } else {
      processedContent =
        processedContent.slice(0, extracted.head) +
        processedContent.slice(extracted.tail);
    }

    let ogImage = findInnerContent('og-image', metaContent).content;
    let ogDesc = findInnerContent('og-desc', metaContent).content;
    const tagList = findInnerContent('tag-list', metaContent).content;

    if (ogImage === '') ogImage = DefaultImages.page;
    else if (ogImage === 'sheet') ogImage = DefaultImages.sheet;
    else if (ogImage === 'chart') ogImage = DefaultImages.chart;
    else if (ogImage === 'graph') ogImage = DefaultImages.graph;
    else if (ogImage === 'calculator') ogImage = DefaultImages.calculator;

    pageTags =
      (tagList.length > 0)?
      (tagList.split(',').map((t) => t.trim())):
      [];

    const metaTags = [
      '<link rel="icon" type="image/x-icon" href="/images/logo_mini.png">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      '<meta name="format-detection" content="telephone=no">',
      '<meta property="og:type" content="website">',
      `<meta property="og:image" content="${ogImage}">`,
      '<meta property="og:url" content="https://kg.kitsune21.com/">',
    ];

    let ogTitle = '';
    if (pageTitle ==='') ogTitle = SiteTitle;
    else ogTitle = pageTitle + ' - ' + SiteTitle;
    metaTags.push(`<meta property="og:title" content="${ogTitle}">`);

    ogDesc = condenseText(ogDesc);
    if (ogDesc !=='') {
      pageDescription = ogDesc;
      metaTags.push(`<meta property="og:description" content="${ogDesc}">`);
    }

    let tagEndingPos = processedContent.indexOf('</title>\n');
    if (tagEndingPos !== -1) {
      tagEndingPos += '</title>\n'.length;
      processedContent =
          processedContent.slice(0, tagEndingPos) +
          metaTags.map((line) => '  ' + line + '\n').join('') +
          processedContent.slice(tagEndingPos);
    }
  }

  return {
    title: pageTitle,
    description: pageDescription,
    tags: pageTags,
    content: processedContent,
  };
}
