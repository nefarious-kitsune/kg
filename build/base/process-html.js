import {extractHtmlElement} from './parse-html-element.js';
import {processHeroAvatars} from './process-hero-avatars.js';
import {processHeroNames} from './process-hero-names.js';

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
 * @param {object} content
 * @return {boolean}
 */
function processTitle(content) {
  const source = content.source;
  const titlePos = source.indexOf('<title');
  if (titlePos === -1) return false;

  const extracted = extractHtmlElement(content.source, titlePos);
  if (extracted === null) return false;

  let pageTitle = extracted.innerContent;

  if (pageTitle.endsWith(PageTitleEnding)) {
    pageTitle = pageTitle.slice(-PageTitleEnding.length);
  } else {
    // Add site title to the end of the page title
    content.source =
      extracted.head +
      `<title>${pageTitle}${PageTitleEnding}</title>` +
      extracted.tail;
  };
  content.pageTitle = pageTitle;
  return true;
}

/**
 * @param {object} content
 * @return {boolean}
 */
function processMetaData(content) {
  const source = content.source;
  let extracted;
  let metaPos = 0;

  while (true) {
    metaPos = source.indexOf('<meta', metaPos);
    if (metaPos === -1) return false;
    extracted = extractHtmlElement(source, metaPos);
    if (extracted === null) return false;
    if (extracted.element['page-data']) break;
    metaPos = source.length - extracted.tail.length;
  }

  if (extracted === null) return false;

  let ogImage = extracted.element['og-image'];
  if (!ogImage) ogImage = DefaultImages.page;
  else if (ogImage === 'sheet') ogImage = DefaultImages.sheet;
  else if (ogImage === 'chart') ogImage = DefaultImages.chart;
  else if (ogImage === 'graph') ogImage = DefaultImages.graph;
  else if (ogImage === 'calculator') ogImage = DefaultImages.calculator;

  const metaTags = [
    '<link rel="icon" type="image/x-icon" href="/images/logo_mini.png">',
    '<meta name="format-detection" content="telephone=no">',
    '<meta property="og:type" content="website">',
    '<meta property="og:url" content="https://kg.kitsune21.com/">',
    `<meta property="og:image" content="${ogImage}">`,
  ];

  if (content.pageTitle) {
    metaTags.push(
        `<meta property="og:title" content="${content.pageTitle}">`,
    );
  }

  if (extracted.element['og-desc']) {
    metaTags.push(
        '<meta property="og:description" ' +
        `content="${extracted.element['og-desc']}"></meta>`,
    );
  }

  content.source =
      extracted.head +
      metaTags.join('\n') +
      extracted.tail;

  return true;
}

/**
 * @param {object} content
 * @return {boolean}
 */
function processEscapeMe(content) {
  const source = content.source;
  const escPos = source.indexOf('<escape-me');
  if (escPos === -1) return false;

  const extracted = extractHtmlElement(content.source, escPos);
  if (extracted === null) return false;

  const innerContent = extracted.innerContent
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .trim();

  content.source =
    extracted.head +
    innerContent +
    extracted.tail;

  return true;
}

/**
 * @param {string} srcContent - source content
 * @return {object} - processed content
 */
export function processHtml(srcContent) {
  srcContent = srcContent.replaceAll('\r', ''); // Remove all \r characters

  if (!srcContent.startsWith(DOCTYPE)) { // ensure valid HTML
    srcContent = DOCTYPE + '\n' + srcContent;
  }

  const result = {source: srcContent};

  processTitle(result);
  processEscapeMe(result);
  processMetaData(result);
  processHeroAvatars(result);
  processHeroNames(result);

  if (result.pageTitle) {
    result.source = result.source.replaceAll('{{TITLE}}', result.pageTitle);
  }

  return result;
}
