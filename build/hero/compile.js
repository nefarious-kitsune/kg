import fs from 'fs';

/**
 * @typedef {Object} HeroTotalBonus
 * @property {number} ap-reduction - Total AP reduction bonus 
 * @property {number} march-speed - Total march speed bonus 
 * @property {number} recovery-speed - Total recovery speed bonus
 * @property {number} power - Total power bonus
 * @property {number} wound-regeneration - Total wound regeneration bonus 
 * @property {number} gathering-speed - Total gathering speed bonus 
 * @property {number} offline-gold - Total offline gold bonus 
 * @property {number} troops-load - Total troops load bonus 
 */

/**
 * @typedef {Object} HeroTier
 * @property {number} warrior - Hero tier when used as in warrior role
 * @property {number} support - Hero tier when used as in support role
 * @property {number} hunter - Hero tier when used as in hunter role
 * @property {number} miner - Hero tier when used as in miner role
 */

/**
 * @typedef {Object} HeroAcquisition
 * @property {boolean} advanced-recruitment - `TRUE` if the hero can be acquired from Advanced Recruitment
 * @property {boolean} lucky-wheel -  `TRUE` if the hero can be acquired from the Lucky Wheel event
 * @property {boolean} crystal-ball -  `TRUE` if the hero can be acquired from the Wishing Crystal Ball event
 * @property {boolean} free-pick -  `TRUE` if the hero can be acquired from Free-Pick Hero Cards
 * @property {string} other - Other way(s) of acquiring the hero
 */

/**
 * @typedef {Object} HeroData
 * @property {string} name - Name of the hero
 * @property {'N'|'R'|'SR'|'SSR'} rarity - Rarity of the hero
 * @property {'archer'|'fire'|'ice'|'goblin'} element - Element of the hero
 * @property {string[]} skills - Skills that unlock at each star level
 * @property {HeroTotalBonus} total-bonus - Total bonus when the hero is fully upgraded
 * @property {HeroTier} tier - Tier of the hero at specific roles
 * @property {HeroAcquisition} acquisition - Methods of acquiring the hero
 */

/**
 * Get total (fully-upgraded) bonus of a specific skill of a hero
 * @param {string[]} skills - Array
 * @param {string} prefix - Beginning string that identifies the skill
 * @returns {number} Total bonus of the specified skill
 * @example
 * // returns 40 (20 + 20)
 * getTotalStats(
 *  [
 *    'March speed +30%',
 *    'All troops power +20%',
 *    '',
 *    'All troops power +20%',
 *    'Wound regeneration +15%',
 *  ],
 *  'All troops power +');
 */
function getTotalStats(skills, prefix) {
  const start = prefix.length;
  const end = start + 2;
  const addBonus = (totalBonus, currSkill) =>
    totalBonus +
    ((currSkill.startsWith(prefix))?parseInt(currSkill.substring(start, end)):0);

  return skills.reduce(addBonus, 0);
}

/**
 * Import TSV data and compile it to structured hero data
 * @param {string} element - Element of the hero
 * @param {string} raw - Raw TSV data
 * @returns 
 */
function compileData(element, raw) {
  const data = raw.split('\n').map((row) => row.split('\t'));
  const heroes = [];

  data.forEach((row, index) => {
    const [
      rarity,
      name,
      skill1, skill2, skill3, skill4, skill5,
      from_advanced,
      from_wheel,
      from_crystal,
      from_free,
      from_other,
    ] = row;

    const skills = [skill1, skill2, skill3, skill4, skill5];

    const apReduction = getTotalStats(skills, 'AP reduction -');
    const speedBonus = getTotalStats(skills, 'March speed +');
    const powerBonus =
      getTotalStats(skills, 'All troops power +') +
      getTotalStats(skills, 'Flame mage troops power +') +
      getTotalStats(skills, 'Goblin troops power +') +
      getTotalStats(skills, 'Archer troops power +');
      
    const regenBonus = getTotalStats(skills, 'Wound regeneration +');
    const gatherBonus = getTotalStats(skills, 'Gathering speed +');
    const offlineBonus = getTotalStats(skills, 'Offline gold +');
    const loadBonus = getTotalStats(skills, 'Troops load +');
    const recoveryBonus = getTotalStats(skills, 'Recovery speed +');

    const warriorTier =
      ((speedBonus > 0)?1:0) +
      ((recoveryBonus > 0)?1:0) +
      ((powerBonus > 0)?1:0) +
      ((regenBonus > 0)?1:0);

    const supportTier =
      ((powerBonus >= 40)?1:0) +
      ((powerBonus >= 30)?1:0) +
      ((powerBonus >= 25)?1:0) +
      ((powerBonus >= 20)?1:0);

    const hunterTier = (apReduction > 0)?1:0;
    const minerTier = (gatherBonus > 0)?1:0;

    /** @type {HeroData} */
    const hero = {
      'name': name,
      'rarity': rarity,
      'element': element,
      'skills': skills,
      'total-bonus': {
        'ap-reduction': apReduction,
        'march-speed': speedBonus,
        'power': powerBonus,
        'wound-regeneration': regenBonus,
        'gathering-speed': gatherBonus,
        'offline-gold': offlineBonus,
        'troops-load': loadBonus,
        'recovery-speed': recoveryBonus,
      },
      'tier': {
        'warrior': warriorTier,
        'support': supportTier,
        'hunter': hunterTier,
        'miner': minerTier,
      },
      'acquisition': {
        'advanced-recruitment': (from_advanced === 'TRUE'),
        'lucky-wheel': (from_wheel === 'TRUE'),
        'crystal-ball': (from_crystal === 'TRUE'),
        'free-pick': (from_free === 'TRUE'),
        'other': from_other,
      }
    };

    heroes.push(hero);
  })
  
  return heroes;
}

let importedData;
let compiledData;

importedData = fs.readFileSync('./data/archer.tsv', { encoding:'utf8'});
compiledData = compileData('archer', importedData);
fs.writeFileSync('./compiled/archer.json', JSON.stringify(compiledData, null, '  '));

importedData = fs.readFileSync('./data/fire.tsv', { encoding:'utf8'});
compiledData = compileData('fire', importedData);
fs.writeFileSync('./compiled/fire.json', JSON.stringify(compiledData, null, '  '));

importedData = fs.readFileSync('./data/ice.tsv', { encoding:'utf8'});
compiledData = compileData('ice', importedData);
fs.writeFileSync('./compiled/ice.json', JSON.stringify(compiledData, null, '  '));

importedData = fs.readFileSync('./data/goblin.tsv', { encoding:'utf8'});
compiledData = compileData('goblin', importedData);
fs.writeFileSync('./compiled/goblin.json', JSON.stringify(compiledData, null, '  '));

// fs.writeFileSync('../../docs/heroes/hero-data-archer.json', JSONData);
// fs.writeFileSync('../../docs/heroes/hero-data-archer.js', 'const ElementHeroData = ' + JSONData);
