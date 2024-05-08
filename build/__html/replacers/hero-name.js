/* eslint-disable key-spacing */
import {extractHtmlElement} from '../extract-element.js';
import {HeroNameToClassMap} from './hero-avatar.js';

/**
 * @param {object} content
 * @return {boolean}
 */
export function replaceHeroName(content) {
  const source = content.source;
  const tagPos = source.indexOf('<hero-name');
  if (tagPos === -1) return false;

  const extracted = extractHtmlElement(content.source, tagPos);
  if (extracted === null) return false;

  let replaceWith = '';

  const HeroName = extracted.innerContent;

  if (HeroName) {
    const heroId = HeroNameToClassMap[HeroName.toLowerCase()];
    if (heroId) {
      replaceWith =
        `<span class="hero-name ${heroId}" image-hint tabindex="0">` +
        HeroName + '</span>';
    } else {
      replaceWith = HeroName;
    }
  };

  content.source = extracted.head + replaceWith + extracted.tail;

  return true;
}

/**
 * @param {object} content
 * @return {boolean}
 */
export function processHeroNames(content) {
  let result = replaceHeroName(content);
  while (result) {
    result = replaceHeroName(content);
  }
  return true;
}
