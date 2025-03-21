/* eslint-disable key-spacing */
import {extractHtmlElement} from '../extract-element.js';
import {KnownHeroes} from './hero-avatar.js';
import {HeroBase} from '../../__hero-base/hero-base.js';

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

  const HeroData = HeroBase.find((data)=> (
    data.name.toLowerCase() === HeroName.toLowerCase()
  ));

  let hasAvatar = false;
  const classList = ['hero-name'];
  if (HeroName) {
    if (KnownHeroes.includes(HeroName)) {
      let avatarClass = HeroName.toLowerCase();
      if (avatarClass === 'o\'neil') avatarClass = 'o-neil';
      else if (avatarClass === 'ao deng ge ri le') avatarClass = 'ao-deng';
      else if (avatarClass === 'ao yue') avatarClass = 'ao-yue';
      classList.push(avatarClass);
      hasAvatar = true;
    }

    if (HeroData) {
      classList.push(
          HeroData.element.toLowerCase(),
          HeroData.rarity.toLowerCase(),
      );
    } else {
      classList.push('ssr');
    }
  }

  if (hasAvatar) {
    replaceWith =
      `<span class="${classList.join(' ')}" image-hint tabindex="0">` +
      HeroName + '</span>';
  } else {
    replaceWith =
    `<span class="${classList.join(' ')}">${HeroName}</span>`;
  }

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
