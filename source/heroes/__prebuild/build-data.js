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
const HeroBase = [];

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

  rows.forEach((row, index) => {
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
 * Calculate hero rating at different roles
 */
function calcRating() {
  /** @type {HeroBonus} */
  const maxBonus = {
    'march': 0,
    'recovery': 0,
    'regeneration': 0,
    'unit-power': 0,
    'AP': 0,
    'gathering': 0,
    'load': 0,
    'offline': 0,
  };

  // First pass. Get max values of bonus
  HeroBase.forEach((data) => {
    const bonus = data.bonus;
    [
      'march', 'recovery', 'regeneration', 'unit-power',
      'AP', 'gathering', 'load', 'offline',
    ].forEach((prop) => {
      maxBonus[prop] = Math.max(maxBonus[prop], bonus[prop]);
    });
  });

  HeroBase.forEach((heroData) => {
    const bonus = heroData.bonus;

    /**
     * Helper function for proper scaling of bonus.
     * If max bonus is 25%:
     * - If the bonus is 0, the result is 0
     * - If the bonus is 10%, the result is 0.50
     * - If the bonus is 15%, the result is 0.66
     * - If the bonus is 20%, the result is 0.80
     * - If the bonus is 25%, the result is 1.00
     * @param {number} bonus - bonus percentage
     * @param {number} max - max bonus percentage
     * @return {number}
     */
    const scale =
      (bonus, max) => (bonus === 0)?0:(0.5 + 0.5*(bonus-10)/(max-10));

    // Round to nearest 0.5
    const round = (num) => Math.round(num*2)/2;

    /**
     * Rating (0 ~ 10) on hero's ability in ATTACKING castles and fortresses, based on
     *   1) how quickly can the hero reach the target (Rapid March),
     *   2) can the hero defend home city after returning? (Regeneration),
     *   3) unit-power boost (Guerrilla Master)
     *   4) saving on healing scroll (First Aid)
     */
    let attackRating = round(
        4 * scale(bonus.march, maxBonus.march) +
        3 * scale(bonus.regeneration, maxBonus.regeneration) +
        2.5 * scale(bonus['unit-power'], maxBonus['unit-power']) +
        3 * scale(bonus.recovery, maxBonus.recovery),
    );

    attackRating = Math.min(10, attackRating);

    /**
     * Rating (0 ~ 10) on hero's ability in DEFENDING fortresses, based on
     *  1) health recovered after a successful defense? (Regeneration),
     *  2) unit-power boost (Guerrilla Master)
     *  3) saving on healing scroll (First Aid)
     */
    const defenseRating = round(
        4 * scale(bonus.regeneration, maxBonus.regeneration) +
        4 * scale(bonus['unit-power'], maxBonus['unit-power']) +
        2 * scale(bonus.recovery, maxBonus.recovery),
    );

    /**
     * Rating (0 ~ 5) on hero's utility in defeating monsters
     */
    const huntingRating = round(
        1 * scale(bonus.march, maxBonus.march) +
        4 * scale(bonus.AP, maxBonus.AP),
    );

    /**
     * Rating (0 ~ 5) on hero's utility in gold gathering
     */
    const miningRating = round(
        1.0 * scale(bonus.march, maxBonus.march) +
        2.5 * scale(bonus.gathering, maxBonus.gathering) +
        1.5 * scale(bonus.load, maxBonus.load),
    );

    heroData.rating = {
      attacking: attackRating,
      defending: defenseRating,
      hunting: huntingRating,
      mining: miningRating,
    };

    // Ranking score for determining sorting order and hero tier
    let rankingScore = attackRating;

    // Bump up the ranking score if the hero has utility values
    if (huntingRating >= 4) rankingScore += 0.5;
    else if (huntingRating >= 2) rankingScore += 0.3;
    else if (miningRating >= 4) rankingScore += 0.3;
    else if (miningRating >= 2) rankingScore += 0.2;

    if (rankingScore >= 9.5) heroData.tier = 'S';
    else if (rankingScore >= 8.5) heroData.tier = 'A';
    else if (rankingScore >= 7.5) heroData.tier = 'B';
    else if (rankingScore >= 6) heroData.tier = 'C';
    else if (rankingScore >= 4) heroData.tier = 'D';
    else if (rankingScore >= 2) heroData.tier = 'E';
    else if (rankingScore >= 1) heroData.tier = 'F';
    else heroData.tier = 'F';

    // Add additional decimal digit to help with sorting
    // heroData.ranking = rankingScore + (defenseRating / 20);
    heroData.ranking = rankingScore;
  });

  // Sort database by sorting index
  HeroBase.sort((a, b) => b.ranking - a.ranking);

  // Remove temporary sorting index
  HeroBase.forEach((heroData) => delete heroData.ranking);
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

buildDatabase();
calcRating();
saveRating();
saveSkills();
saveDatabase();

export const heroBase = HeroBase;
