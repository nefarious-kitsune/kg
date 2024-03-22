import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');
const DataPath = resolve(ProjectPath, './data/heroes/');
const ExportPath = resolve(ProjectPath, './docs/heroes/');

/**
 * @typedef {'march'|'recovery'|'regeneration'|'unit-power'|'AP'|'load'|'offline'|'gathering'|'TD'} HeroProperty
 * @typedef {'N'|'R'|'SR'|'SSR'} HeroRarity
 */

/**
 * @typedef  {'archer'|'fire'|'ice'|'goblin'} HeroElement
 */

/**
 * @typedef {Object} HeroSkill
 * @property {string} name - In-game skill name
 * @property {string} description - In-game skill description
 * @property {string} desc - Short skill description
 * @property {HeroProperty} property - Property that is affected by this skill
 * @property {number} percent - Numerical value of the skill
 * @property {boolean} elemental - For 'unit-power', is this skill elemental?
 */

/**
 * @typedef {Object} HeroBonus - total bonus provided by this hero
 * @property {number} march - Total march speed bonus
 * @property {number} recovery - Total recovery speed bonus
 * @property {number} regeneration - Total wound regeneration bonus
 * @property {number} 'unit-power' - Total unit power bonus
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
 * @param {string} desc
 */
function addSkill(data, desc) {
  /** @type {HeroSkill} */ let heroSkill;
  /** @type {string} */ let prefix;
  /** @type {number} */ let value;
  /** @type {HeroProperty} */ let prop;

  const desc__ = desc.toLowerCase().trim();
  if (desc__.length === 0) {
    data.skills.push(null);
    return;
  }

  let start = 0;
  let end = 0;
  let skip = false;

  prefix = 'march speed +';
  prop = 'march';
  if (desc__.startsWith(prefix)) {
    start = prefix.length;
    end = start + 2;
    value = parseInt(desc__.substring(start, end));
    heroSkill = {
      name: ['Merlin', 'Gro'].includes(data.name)?
        'Initiative':
        'Rapid March',
      description:
        'March Speed of the troop on the world map ' +
        `+${value}% (cannot stack)`,
      desc: desc,
      property: prop,
      percent: value,
      elemental: false,
    };
    data.bonus[prop] += value;
    skip = true;
  };

  prefix = 'recovery +';
  prop = 'recovery';
  if (!skip && (desc__.startsWith(prefix))) {
    start = prefix.length;
    end = start + 2;
    value = parseInt(desc__.substring(start, end));
    heroSkill = {
      name: 'First Aid',
      description: `Recovery Speed of wounded units in the troop +${value}%`,
      desc: desc,
      property: prop,
      percent: value,
      elemental: false,
    };
    data.bonus[prop] += value;
    skip = true;
  };

  prefix = 'regeneration +';
  prop = 'regeneration';
  if (!skip && (desc__.startsWith(prefix))) {
    start = prefix.length;
    end = start + 2;
    value = parseInt(desc__.substring(start, end));
    heroSkill = {
      name: 'Regeneration',
      description: `Recovery of units wounded in battle +${value}%`,
      desc: desc,
      property: prop,
      percent: value,
      elemental: false,
    };
    data.bonus[prop] += value;
    skip = true;
  };

  prefix = 'unit power +';
  prop = 'unit-power';
  if (!skip && (desc__.startsWith(prefix))) {
    start = prefix.length;
    end = start + 2;
    value = parseInt(desc__.substring(start, end));
    const neutral = desc__.toLowerCase().endsWith('(all)');
    if (neutral) {
      heroSkill = {
        name: 'Guerrilla Master',
        description: `Power of all units in the troop +${value}%`,
        desc: desc,
        property: prop,
        percent: value,
        elemental: false,
      };
    } else {
      if (data.element === 'archer') {
        heroSkill = {
          name: 'Archery Master',
          description: `Power of all Archers in the troops +${value}%`,
          desc: desc,
          property: prop,
          percent: value,
          elemental: true,
        };
      } else if (data.element === 'fire') {
        heroSkill = {
          name: 'Blaze Expert',
          description: `Power of all Flame Mages in the troop +${value}%`,
          desc: desc,
          property: prop,
          percent: value,
          elemental: true,
        };
      } else if (data.element === 'ice') {
        // skip
      } else if (data.element === 'goblin') { // Claudia
        heroSkill = {
          name: 'Inspiration',
          description: `Power of all Goblins in the troop +${value}%`,
          desc: desc,
          property: prop,
          percent: value,
          elemental: true,
        };
      }
    }

    data.bonus[prop] += value;
    skip = true;
  };

  prefix = 'ap discount ';
  prop = 'AP';
  if (!skip && (desc__.startsWith(prefix))) {
    start = prefix.length;
    end = start + 2;
    value = parseInt(desc__.substring(start, end));
    heroSkill = {
      name: 'Monster Counter',
      description:
        `Attacking a monster costs ${value}% less AP. ` +
        'Attacking monsters restore an additional 90% of wounded soldiers',
      desc: desc,
      property: prop,
      percent: value,
      elemental: false,
    };
    data.bonus[prop] += value;
    skip = true;
  };

  prefix = 'load +';
  prop = 'load';
  if (!skip && (desc__.startsWith(prefix))) {
    start = prefix.length;
    end = start + 2;
    value = parseInt(desc__.substring(start, end));
    heroSkill = {
      name: 'Load',
      description: `Troop Load +${value}%`,
      desc: desc,
      property: prop,
      percent: value,
      elemental: false,
    };
    data.bonus[prop] += value;
    skip = true;
  };

  prefix = 'gathering +';
  prop = 'gathering';
  if (!skip && (desc__.startsWith(prefix))) {
    start = prefix.length;
    end = start + 2;
    value = parseInt(desc__.substring(start, end));
    heroSkill = {
      name: 'Gathering Master',
      description: `Gold Gathering Speed +${value}%`,
      desc: desc,
      property: prop,
      percent: value,
      elemental: false,
    };
    data.bonus[prop] += value;
    skip = true;
  };

  prefix = 'offline gold +';
  prop = 'offline';
  if (!skip && (desc__.startsWith(prefix))) {
    start = prefix.length;
    end = start + 2;
    value = parseInt(desc__.substring(start, end));
    heroSkill = {
      name: 'Overseer',
      description: `Offline Gold Output Speed increases by ${value}%`,
      desc: desc,
      property: prop,
      percent: value,
      elemental: false,
    };
    data.bonus[prop] += value;
    skip = true;
  };

  prefix = '(TD)';
  prop = 'TD';
  if (!skip && (desc.startsWith(prefix))) {
    switch (desc) {
      case '(TD) Attack Speed +20% (Fire)': // Samar & Ophelia
        heroSkill = {
          name: 'Clearcast',
          description: `(TD) Attack Speed of Flame Mages +20%`,
          desc: desc,
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack +20% (Fire)': // Samar & Ophelia
        heroSkill = {
          name: 'Fire Master',
          description: `(TD) Attack of Flame Mages +20%`,
          desc: desc,
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack +10% (All)': // Harold
        heroSkill = {
          name: 'Master of Defense',
          description: '(TD) Attack of all units +10%',
          desc: desc,
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack Speed +15% (Archer)': // Arwyn
        heroSkill = {
          name: 'Rapid Shot',
          description: '(TD) Attack Speed of Archers +15%',
          desc: desc,
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack +15% (Archer)': // Arwyn
        heroSkill = {
          name: 'Piercing Arrow',
          description: '(TD) Attack of Archers +15%',
          desc: desc,
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack +20% (Ice)': // Merlin
        heroSkill = {
          name: 'Enhanced Freeze',
          description: '(TD) Attack of Ice Wizard +20%',
          desc: desc,
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack +30% (Ice)': // Ralph
        heroSkill = {
          name: 'Enhanced Freeze',
          description: '(TD) Attack of Ice Wizard +30%',
          desc: desc,
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack +15% (Goblin)': // Alucard
        heroSkill = {
          name: 'Poison',
          description: '(TD) Attack of Goblins +15%',
          desc: desc,
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Damage vs Orcs +200%': // Alucard
        heroSkill = {
          name: 'Orc Counter',
          description: '(TD) This Hero deals +200% damage versus Orc',
          desc: desc,
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Damage vs Orcs +40%':
        heroSkill = {
          name: 'Orc Curse',
          description: '(TD) Damage versus Orcs +40%',
          desc: desc,
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
    }
    heroSkill = {property: prop, percent: 0, elemental: false};
    skip = true;
  };

  if (!skip) {
    console.warn('skill not added:', desc__);
    data.skills.push(null);
  } else {
    data.skills.push(heroSkill);
  }
}


/**
 * Import TSV data and compile it to structured hero data
 * @param {string} element - Element of the hero
 * @param {string} rawData - Raw TSV data
 */
export function buildDatabase() {
  const tsvFilePath = resolve(DataPath, 'hero-base.tsv');
  const rows = readFileSync(tsvFilePath, {encoding: 'utf8'}).split('\n');

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

  writeFileSync(resolve(ExportPath, 'hero-base.json'), _json);
  writeFileSync(resolve(ExportPath, 'hero-base.js'), _js);
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

    // Proper scaling
    const scale =
      (point, max) => (point === 0)?0:(0.5 + 0.5*(point-10)/(max-10));

    // Round to nearest 0.5
    const round = (num) => Math.round(num*2)/2;

    /**
     * Rating of a hero's ability in ATTACKING castles and towers, based on
     *   1) how quickly can the hero reach the target (Rapid March),
     *   2) can the hero defend home city after returning? (Regeneration),
     *   3) unit-power boost (Guerrilla Master)
     *   4) saving on healing scroll (First Aid)
     */
    let attackRating = round(
        4.0 * scale(bonus.march, maxBonus.march) +
        3.0 * scale(bonus.regeneration, maxBonus.regeneration) +
        3.0 * scale(bonus['unit-power'], maxBonus['unit-power']) +
        2.5 * scale(bonus.recovery, maxBonus.recovery),
    );

    attackRating = Math.min(10, attackRating);

    // Rating of a hero's ability in DEFENDING towers, based on
    //   1) health recovered after a successful defense? (Regeneration),
    //   2) unit-power boost (Guerrilla Master)
    //   3) saving on healing scroll (First Aid)
    const defenseRating = round(
        4 * scale(bonus.regeneration, maxBonus.regeneration) +
        4 * scale(bonus['unit-power'], maxBonus['unit-power']) +
        2 * scale(bonus.recovery, maxBonus.recovery),
    );

    const huntingRating = round(
        1 * scale(bonus.march, maxBonus.march) +
        4 * scale(bonus.AP, maxBonus.AP),
    );

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
    if (huntingRating >= 4) rankingScore += 1;
    else if (huntingRating >= 2) rankingScore += 0.5;
    else if (miningRating >= 4) rankingScore += 1.0;
    else if (miningRating >= 2) rankingScore += 0.5;

    if (rankingScore >= 9.5) heroData.tier = 'S';
    else if (rankingScore >= 8.5) heroData.tier = 'A';
    else if (rankingScore >= 7.5) heroData.tier = 'B';
    else if (rankingScore >= 6) heroData.tier = 'C';
    else if (rankingScore >= 4) heroData.tier = 'D';
    else if (rankingScore >= 2) heroData.tier = 'E';
    else if (rankingScore >= 1) heroData.tier = 'F';

    // Add additional decimal digit to help with sorting
    // heroData.ranking = rankingScore + (defenseRating / 20);
    heroData.ranking = rankingScore;
  });

  // sort database and remove temporary sorting index
  // HeroBase.sort((a, b) => b.ranking - a.ranking);
  HeroBase.forEach((heroData) => delete heroData.ranking);
}

/**
 * Save rating info to .tsv file
 */
function saveRating() {
  const content =
      [
        'Element',
        'Rarity',
        'Tier',
        // 'Ranking',
        'Hero',
        'Attacking',
        'Defending',
        'Hunting',
        'Mining',
      ].join('\t') + '\n' +
      HeroBase
          .map((heroData) => (
            heroData.element + '\t' +
            heroData.rarity + '\t' +
            heroData.tier + '\t' +
            // heroData.ranking + '\t' +
            heroData.name + '\t' +
            heroData.rating.attacking + '\t' +
            heroData.rating.defending + '\t' +
            heroData.rating.hunting + '\t' +
            heroData.rating.mining + '\t'
          ))
          .join('\n') + '\n';

  writeFileSync(resolve(ExportPath, 'hero-rating.tsv'), content);
}

buildDatabase();
calcRating();
saveRating();
saveDatabase();
