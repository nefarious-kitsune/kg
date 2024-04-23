import {readFileSync} from 'fs';
import {dirname, resolve} from 'path';
import {extractHtmlElement} from '../parse-html-element.js';

/**
 * Replace <fragment> with content from other files
 * @param {object} content
 * @return {boolean} `true` if title is found and successfully process.
 */
export function replaceFragment(content) {
  const elementPos = content.source.indexOf('<fragment');
  if (elementPos === -1) return false;

  const element = extractHtmlElement(content.source, elementPos);
  if (element === null) return false;

  /** @type {string} */
  let replacementPath = element.element['src'];
  if (!replacementPath) return false;

  if (replacementPath.startsWith('/')) {
    replacementPath = resolve(content.basePath, replacementPath.substring(1));
  } else {
    replacementPath = resolve(dirname(content.filePath), replacementPath);
  }
  const replaceWith = readFileSync(replacementPath, 'utf-8');

  content.source = element.head + replaceWith.trim() + element.tail;
  return true;
}
