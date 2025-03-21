import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const DataPath = resolve(ModulePath, '../__data/');
const ExportPaths = {
  'hero-skills.tsv': resolve(ModulePath, '../hero-skills.tsv'),
  'hero-base.json': resolve(ModulePath, '../hero-base.json'),
  'hero-base.js': resolve(ModulePath, '../__exported/hero-base.js'),
  'hero-rating.tsv': resolve(ModulePath, '../hero-rating.tsv'),
};

import {getHeroSkill} from './hero-skill-lookup.js';

/**
 * @typedef {'N'|'R'|'SR'|'SSR'} HeroRarity
 * @typedef  {'archer'|'fire'|'ice'|'goblin'} HeroElement
 * @typedef {import('./hero-skill-lookup.js').HeroSkill} HeroSkill
 */

/**
 * @typedef {Object} HeroBonus - total bonus provided by this hero
 * @property {number} march - Total march speed bonus
 * @property {number} recovery - Total recovery speed bonus
 * @property {number} regeneration - Total wound regeneration bonus
 * @property {number} unit-power - Total unit power bonus
 * @property {boolean} elemental - For 'unit-power', is this skill elemental?
 * @property {number} AP - Total AP Discount
 * @property {number} gathering - Total gathering speed bonus
 * @property {number} offline - Total offline gold bonus
 * @property {number} load - Total troops load bonus
 */

/**
 * @typedef {Object} HeroRating
 * @property {number} attacking - Hero rating when used in PvP attack
 * @property {number} defending - Hero rating when used in PvP defense
 * @property {number} hunting - Hero rating when used in monster hunting
 * @property {number} mining - Hero rating when used in gold mining
 */

/**
 * @typedef {Object} HeroAcquisition
 * @property {number} normal - Probability in Normal Recruitment
 * @property {number} advanced - Probability in Advanced Recruitment
 * @property {number} stats - Probability in Stats Recruitment
 * @property {boolean} wheel - Acquire from Lucky Wheel
 * @property {boolean} crystal - Acquire from Wishing Crystal Ball
 * @property {boolean} free-pick - Acquire from Free-Pick Hero Cards
 * @property {string} other - Other way of acquiring the hero
 */

/**
 * @typedef {Object} HeroData
 * @property {string} name - Name of the hero
 * @property {HeroRarity} rarity - Rarity of the hero
 * @property {HeroElement} element - Element of the hero
 * @property {HeroSkill[]} skills - Hero skills at each promotion level
 * @property {HeroBonus} bonus - Hero total bonus when fully promoted
 * @property {HeroRating} rating - Ranking the hero at specific roles
 * @property {HeroAcquisition} acquisition - How to acquire
 * @property {number} [ranking] - a ranking score based on ratings
 * @property {number} tier - tier based ranking score
 */

/** @type {HeroData[]} */
export const HeroBase = [];

/**
 * Add a skill
 * @param {HeroData} data
 * @param {string} inputString
 */
function addSkill(data, inputString) {
  const id = inputString.toLowerCase().trim();
  if (id.length === 0) {
    data.skills.push(null);
    return;
  }
  const skill = getHeroSkill(id);
  if (skill) {
    if (skill.property !== 'TD') data.bonus[skill.property] += skill.percent;
    data.skills.push(skill);
  } else {
    data.skills.push(null);
  }
}

/**
 * Import TSV data and compile it to structured hero data
 * @param {string} element - Element of the hero
 * @param {string} rawData - Raw TSV data
 */
export function buildDatabase() {
  const tsvFilePath = resolve(DataPath, 'hero-base.tsv');
  const rows = readFileSync(tsvFilePath, 'utf8').split('\n');

  rows.shift(); // Remove header row

  rows.forEach((row) => {
    const [
      element, rarity, name,
      skill1, skill2, skill3, skill4, skill5,
      freePick,
    ] = row.split('\t').map((s) => s.trim());

    // Skip blank line from copy/paste
    if (element === '') return;

    /** @type {HeroData} */
    const heroData = {
      element: element,
      rarity: rarity,
      name: name,
      skills: [],
      bonus: {
        'march': 0,
        'recovery': 0,
        'regeneration': 0,
        'unit-power': 0,
        'elemental': false,
        'AP': 0,
        'gathering': 0,
        'load': 0,
        'offline': 0,
      },
      acquisition: {
        'normal': 0,
        'advanced': 0,
        'stats': 0,
        'wheel': 0,
        'crystal': 0,
        'free-pick': (freePick === 'TRUE'),
      },
    };

    addSkill(heroData, skill1);
    addSkill(heroData, skill2);
    addSkill(heroData, skill3);
    addSkill(heroData, skill4);
    addSkill(heroData, skill5);

    HeroBase.push(heroData);
  });
}

/**
 * Save Database
 */
function saveDatabase() {
  const _json = JSON.stringify(HeroBase, null, '  ') + '\n';
  const _js = 'const ElementHeroData = ' + _json.replaceAll('"', '\'');

  writeFileSync(ExportPaths['hero-base.json'], _json);
  writeFileSync(ExportPaths['hero-base.js'], _js);
}

/**
 * Save rating info to .tsv file
 */
function saveRating() {
  const headerRow =
      [
        'Element',
        'Rarity',
        'Tier',
        'Hero',

        'March Speed',
        'Recovery',
        'Regeneration',
        'Unit Power',
        'AP',

        'Attacking',
        'Defending',
        'Hunting',
        'Mining',
      ].join('\t');

  const makeRow = (heroData) =>
    [
      heroData.element,
      heroData.rarity,
      heroData.tier,
      heroData.name,

      heroData.bonus.march,
      heroData.bonus.recovery,
      heroData.bonus.regeneration,
      heroData.bonus['unit-power'],
      heroData.bonus.AP,

      heroData.rating.attacking,
      heroData.rating.defending,
      heroData.rating.hunting,
      heroData.rating.mining,
    ].join('\t');

  const content =
    headerRow + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Archer')
        .map((heroData) => makeRow(heroData))
        .join('\n') + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Fire')
        .map((heroData) => makeRow(heroData))
        .join('\n') + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Ice')
        .map((heroData) => makeRow(heroData))
        .join('\n') + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Goblin')
        .map((heroData) => makeRow(heroData))
        .join('\n');

  writeFileSync(ExportPaths['hero-rating.tsv'], content);
}


/**
 * Save skills info to .tsv file
 */
function saveSkills() {
  const headerRow =
      [
        'Element',
        'Rarity',
        'Tier',
        'Hero',
        'Skill 1',
        'Skill 2',
        'Skill 3',
        'Skill 4',
        'Skill 5',
      ].join('\t');

  const makeRow = (heroData) =>
    [
      heroData.element,
      heroData.rarity,
      heroData.tier,
      heroData.name,

      heroData.skills[0]['short-description'],
      heroData.skills[1]?.['short-description']||'',
      heroData.skills[2]?.['short-description']||'',
      heroData.skills[3]?.['short-description']||'',
      heroData.skills[4]?.['short-description']||'',
    ].join('\t');

  const content =
    headerRow + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Archer')
        .map((heroData) => makeRow(heroData))
        .join('\n') + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Fire')
        .map((heroData) => makeRow(heroData))
        .join('\n') + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Ice')
        .map((heroData) => makeRow(heroData))
        .join('\n') + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Goblin')
        .map((heroData) => makeRow(heroData))
        .join('\n');

  writeFileSync(ExportPaths['hero-skills.tsv'], content);
}

saveRating();
saveSkills();
saveDatabase();

export const heroBase = HeroBase;
