/* eslint-disable key-spacing */
import {extractHtmlElement} from '../extract-element.js';

export const HeroNameToClassMap = {
  'daniel':    'daniel',
  'anton':     'anton',
  'etley':     'etley',
  'arwyn':     'arwyn',
  'peter':     'peter',
  'ophelia':   'ophelia',
  'merlin':    'merlin',
  'arthur':    'arthur',
  'claudia':   'claudia',
  'alucard':   'alucard',
  'gro':       'gro',
  'catherine': 'catherine',
  'hadi':      'hadi',
  'paula':     'paula',
  'kris':      'kris',
  'ralph':     'ralph',
  'gabriel':   'gabriel',
  'erika':     'erika',
  'jennifer':  'jennifer',
  'issac':     'issac',
  'allen':     'allen',
  'nicole':    'nicole',
  'harold':    'harold',
  'rosamond':  'rosamond',
  'ariza':     'ariza',
  'cosette':   'cosette',
  'o\'neil':   'o-neil',
  'sahar':     'sahar',
  'dolvar':    'dolvar',
  'paul':      'paul',
  'gruen':     'gruen',
  'wallis':    'wallis',
  'rudolph':   'rudolph',
  'meniere':   'meniere',
  'jessica':   'jessica',
  'lomax':     'lomax',
  'vera':      'vera',
  'tumnus':    'tumnus',
  'christie':  'christie',
  'lilani':    'lilani',
  'torvi':     'torvi',
  'arwin':     'arwin',
  'richard':   'richard',
  'pedra':     'pedra',
  'filius':    'filius',
  'clarence':  'clarence',
  'livia':     'livia',
  'kenshiro':  'kenshiro',
  'padme':     'padme',
  'tracy':     'tracy',
  'miku':      'miku',
  'benjamin':  'benjamin',
  'penny':     'penny',
  'maud':      'maud',
  'giselle':   'giselle',
  'wendy':     'wendy',
  'samar':     'samar',
  'apollo':    'apollo',
  'dean':      'dean',
  'kadir':     'kadir',
  'parr':      'parr',
  'dain':      'dain',
  'suad':      'suad',
  'collin':    'collin',
  'anko':      'anko',
  'chiyoko':   'chiyoko',
  'sabastian': 'sabastian',
  'keith':     'keith',
  'brie':      'brie',
  'nathaniel': 'nathaniel',
  'pan':       'pan',
  'vanessa':   'vanessa',
  'fatima':    'fatima',
  'luvia':     'luvia',
  'bella':     'bella',
  'meg':       'meg',
  'hana':      'hana',
  'pythia':    'pythia',
  'montag':    'montag',
  'rogers':    'rogers',
  'blackwell': 'blackwell',
  'simon':     'simon',
  'trist':     'trist',
  'ptolemy':   'ptolemy',
  'ao deng ge ri le':   'ao-deng',
  'ao yue':    'ao-yue',
  'lilith':    'lilith',
  'rila':      'rila',
  'johannes':  'johannes',
  'maya':      'maya',
  'daria':     'daria',
  'lovelace':  'lovelace',
  'judy':      'judy',
  'trishy':    'trishy',
  'boudica':   'boudica',
  'angelina':  'angelina',
  'doris':     'doris',
  'mycelia':   'mycelia',
  'dylan':     'dylan',
  'ivy':       'ivy',
  'sindra': 'sindra',
  'enzo': 'enzo',
  'rebecca': 'rebecca',
  'daisy': 'daisy',
  'mycelia': 'mycelia',
  'layla': 'layla',
  'edmund': 'edmund',
  'catrina': 'catrina',
  'nina': 'nina',
  'ryan': 'ryan',
  'olaf': 'olaf',
  'webster': 'webster',
  'viola': 'viola',
  'eleanora': 'eleanora',
  'green': 'green',
  'kirona': 'kirona',
  // 'alex': 'alex',
};

const rHeroes = [
  'anton', 'etley', 'peter'];
const srHeroes = [
  'arwyn', 'harold', 'kris',
  'ophelia', 'samar', 'merlin',
  'alucard'];

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
  let heroId;

  const classList = ['hero-avatar'];
  if (HeroName) {
    heroId = HeroNameToClassMap[HeroName.toLowerCase()];
    // known hero
    if (heroId) {
      classList.push(heroId);
      if (heroId === 'daniel') classList.push('n');
      else if (rHeroes.indexOf(heroId) !== -1) classList.push('r');
      else if (srHeroes.indexOf(heroId) !== -1) classList.push('sr');
      else classList.push('ssr');
    } else {
      classList.push('blank');
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
    if (heroId) {
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
