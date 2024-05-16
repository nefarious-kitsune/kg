import {extractHtmlElement} from './extract-element.js';

import {replaceHeroAvatar} from './replacers/hero-avatar.js';
import {replaceHeroName} from './replacers/hero-name.js';
import {replaceTitle} from './replacers/title.js';
import {replaceFragment} from './replacers/fragment.js';

const DOCTYPE = '<!DOCTYPE html>';
const DefaultImages = {
  info: 'https://kg.kitsune21.com/assets/icons/site_info.png',
  hero: 'https://kg.kitsune21.com/assets/icons/site_info-hero.png',
  data: 'https://kg.kitsune21.com/assets/icons/site_data.png',
  chart: 'https://kg.kitsune21.com/assets/icons/site_chart.png',
  server: 'https://kg.kitsune21.com/assets/icons/site_cluster.png',
  stacking: 'https://kg.kitsune21.com/assets/icons/site-stacking.png',
  calculator: 'https://kg.kitsune21.com/assets/icons/site_calculator.png',
  calendar: 'https://kg.kitsune21.com/assets/icons/site_calendar.png',
  mail: 'https://kg.kitsune21.com/assets/icons/site_mail.png',
};


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
  if (!ogImage) ogImage = DefaultImages.info;
  else if (ogImage === 'info') ogImage = DefaultImages.info;
  else if (ogImage === 'hero') ogImage = DefaultImages.hero;
  else if (ogImage === 'data') ogImage = DefaultImages.data;
  else if (ogImage === 'chart') ogImage = DefaultImages.chart;
  else if (ogImage === 'server') ogImage = DefaultImages.server;
  else if (ogImage === 'stacking') ogImage = DefaultImages.stacking;
  else if (ogImage === 'calculator') ogImage = DefaultImages.calculator;
  else if (ogImage === 'calendar') ogImage = DefaultImages.calendar;
  else if (ogImage === 'mail') ogImage = DefaultImages.mail;

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
        `<meta property="og:description"\n` +
        `  content="${extracted.element['og-desc']}">`,
    );
    content.pageDesc = extracted.element['og-desc'];
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
 * @param {string} filePath - path of the file
 * @param {string} basePath - path of the base directory (<project>/source/)
 * @return {object} - processed content
 */
export function processHtml(srcContent, filePath, basePath) {
  srcContent = srcContent.replaceAll('\r', ''); // Remove all \r characters

  if (!srcContent.startsWith(DOCTYPE)) { // ensure valid HTML
    srcContent = DOCTYPE + '\n' + srcContent;
  }

  const processed = {
    source: srcContent,
    filePath: filePath,
    rootPath: basePath,
  };

  replaceTitle(processed);
  processMetaData(processed);

  while (replaceFragment(processed)) {};
  while (replaceHeroAvatar(processed)) {};
  while (replaceHeroName(processed)) {};

  processEscapeMe(processed);

  if (processed.pageTitle) {
    processed.source = processed.source
        .replaceAll('{{TITLE}}', processed.pageTitle);
  }

  if (processed.pageDesc) {
    processed.source = processed.source
        .replaceAll('{{PAGE-DESC}}', processed.pageDesc);
  }

  return processed;
}
