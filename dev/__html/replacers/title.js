import {extractHtmlElement} from '../extract-element.js';

const SiteTitle = 'Miku\'s Shrine';
const PageTitleEnding = ' - ' + SiteTitle;

/**
 * Get content from <title> element, insert site title if needed, and
 * add meta data to content object.
 * @param {object} content
 * @return {boolean} `true` if title is found and successfully process.
 */
export function replaceTitle(content) {
  const source = content.source;
  const titlePos = source.indexOf('<title');
  if (titlePos === -1) return false;

  const extracted = extractHtmlElement(content.source, titlePos);
  if (extracted === null) return false;

  let pageTitle = extracted.innerContent;

  if (pageTitle.endsWith(SiteTitle)) {
    pageTitle = pageTitle.slice(-PageTitleEnding.length);
  } else {
    // Add site title to the end of the page title
    const newTitle = `<title>${pageTitle}${PageTitleEnding}</title>`;
    content.source = extracted.head + newTitle + extracted.tail;
  };

  // set meta data
  content.pageTitle = pageTitle;
  return true;
}
