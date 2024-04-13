/* eslint-disable key-spacing */
import {extractHtmlElement} from './parse-html-element.js';

const HeroNameToClassMap = {
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
  'Kadir':     'Kadir',
  'maud':      'maud',
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
  'angelica':  'angelica',
  'doris':     'doris',
};

/**
 * @param {object} content
 * @return {boolean}
 */
function processHeroName(content) {
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
export function processHeroNames(content) {
  let result = processHeroName(content);
  while (result) {
    result = processHeroName(content);
  }
  return true;
}
