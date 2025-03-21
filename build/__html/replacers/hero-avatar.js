/* eslint-disable key-spacing */
import {extractHtmlElement} from '../extract-element.js';
import {HeroBase} from '../../__hero-base/hero-base.js';

export const KnownHeroes = [
  'Daniel',
  'Anton', 'Etley', 'Peter',
  'Padme', 'Miku', 'Tracy', 'Clarence', 'Tumnus',
  'Ophelia', 'Kris', 'Samar', 'Merlin', 'Arwyn', 'Alucard', 'Harold',
  'Gabriel', 'Arthur', 'Jennifer', 'Erika',
  'Allen', 'Gro', 'Rosamond', 'Catherine',
  'Paula', 'Hadi', 'Ralph',
  'O\'Neil', 'Cosette',
  'Dolvar', 'Paul', 'Issac', 'Ariza',
  'Meniere', 'Gruen', 'Sahar', 'Rudolph',
  'Jessica', 'Wallis', 'Nicole', 'Pan',
  'Claudia', 'Kadir', 'Christie', 'Anko',
  'Vera', 'Richard', 'Penny', 'Torvi',
  'Kenshiro', 'Lilani', 'Lomax', 'Livia',
  'Giselle', 'Pedra', 'Filius', 'Arwin',
  'Collin', 'Apollo', 'Parr', 'Benjamin',
  'Sabastian', 'Dain', 'Wendy', 'Fatima',
  'Dean', 'Maud', 'Suad', 'Bella',
  'Brie', 'Keith', 'Chiyoko', 'Meg',
  'Vanessa', 'Nathaniel', 'Luvia', 'Hana',
  'Pythia', 'Montag', 'Rogers', 'Simon',
  'Trist', 'Blackwell', 'Ptolemy',
  'Ao Yue',
  'Ao Deng Ge Ri Le',
  'Lilith', 'Rila', 'Maya', 'Johannes',
  'Daria', 'Lovelace', 'Judy', 'Trishy',
  'Boudica', 'Angelina', 'Doris', 'Dylan',
  'Ivy', 'Sindra', 'Enzo', 'Rebecca',
  'Daisy', 'Mycelia', 'Layla', 'Edmund',
  'Catrina', 'Nina', 'Ryan', 'Olaf',
  'Webster', 'Viola', 'Eleanora', 'Green',
  'Kirona',
  // 'Alex'
];

/**
 * @param {object} content
 * @return {boolean}
 */
export function replaceHeroAvatar(content) {
  const source = content.source;
  const tagPos = source.indexOf('<hero-avatar');
  if (tagPos === -1) return false;

  const extracted = extractHtmlElement(content.source, tagPos);
  if (extracted === null) return false;

  const HeroName = extracted.innerContent;
  const HeroData = HeroBase.find((data)=> (
    data.name.toLowerCase() === HeroName.toLowerCase()
  ));

  let avatarClass;
  const classList = ['hero-avatar'];
  if (HeroName) {
    if (KnownHeroes.includes(HeroName)) {
      avatarClass = HeroName.toLowerCase();
      if (avatarClass === 'o\'neil') avatarClass = 'o-neil';
      else if (avatarClass === 'ao deng ge ri le') avatarClass = 'ao-deng';
      else if (avatarClass === 'ao yue') avatarClass = 'ao-yue';
      classList.push(avatarClass);
    } else {
      classList.push('blank');
    }

    if (HeroData) {
      classList.push(
          HeroData.element.toLowerCase(),
          HeroData.rarity.toLowerCase(),
      );
    } else {
      classList.push('ssr');
    }
  } else {
    classList.push('blank');
  }

  let replaceWith;

  if (HeroName) {
    replaceWith = `<div class="${classList.join(' ')}" ` +
      `text-hint="${HeroName}" tabindex="0"\n  >`;
  } else {
    replaceWith = `<div class="${classList.join(' ')}"\n  >`;
  }

  if (extracted.element['star-level']) {
    const startLevel = parseInt(extracted.element['star-level']);
    // const stars = '★'.repeat(startLevel);

    replaceWith += '<span\n' +
      '  ' + `class="hero-avatar-star-level level-${startLevel}"></span\n  >`;
  }

  if (HeroName) {
    if (avatarClass) {
      replaceWith += '<span\n' +
        '  ' + 'class="hero-avatar-name">' + HeroName + '</span\n  >';
    } else {
      replaceWith += '<span\n' +
        '  ' + 'class="hero-avatar-unknown-name">' + HeroName + '</span\n  >';
    }
  } else {
    replaceWith += '<span\n' +
      '  ' + 'class="hero-avatar-unknown-name">&nbsp;</span\n  >';
  }

  if (extracted.element['exp-level']) {
    const expLevel = extracted.element['exp-level'];
    replaceWith += '<span\n' +
        '  ' + 'class="hero-avatar-exp-level">Lv. ' + expLevel + '</span>\n  ';
  }

  replaceWith += '</div>';

  content.source =
      extracted.head +
      replaceWith +
      extracted.tail;

  return true;
}

/**
 * @param {object} content
 * @return {boolean}
 */
export function processHeroAvatars(content) {
  let result = replaceHeroAvatar(content);
  while (result) {
    result = replaceHeroAvatar(content);
  }
  return true;
}
