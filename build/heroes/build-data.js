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
 * @property {HeroProperty} name - In-game skill name
 * @property {HeroProperty} description - In-game skill description
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
        property: prop,
        percent: value,
        elemental: false,
      };
    } else {
      if (data.element === 'archer') {
        heroSkill = {
          name: 'Archery Master',
          description: `Power of all Archers in the troops +${value}%`,
          property: prop,
          percent: value,
          elemental: true,
        };
      } else if (data.element === 'fire') {
        heroSkill = {
          name: 'Blaze Expert',
          description: `Power of all Flame Mages in the troop +${value}%`,
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
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack +20% (Fire)': // Samar & Ophelia
        heroSkill = {
          name: 'Fire Master',
          description: `(TD) Attack of Flame Mages +20%`,
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack +10% (All)': // Harold
        heroSkill = {
          name: 'Master of Defense',
          description: '(TD) Attack of all units +10%',
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack Speed +15% (Archer)': // Arwyn
        heroSkill = {
          name: 'Rapid Shot',
          description: '(TD) Attack Speed of Archers +15%',
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack +15% (Archer)': // Arwyn
        heroSkill = {
          name: 'Piercing Arrow',
          description: '(TD) Attack of Archers +15%',
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack +20% (Ice)': // Merlin
        heroSkill = {
          name: 'Enhanced Freeze',
          description: '(TD) Attack of Ice Wizard +20%',
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack +30% (Ice)': // Ralph
        heroSkill = {
          name: 'Enhanced Freeze',
          description: '(TD) Attack of Ice Wizard +30%',
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Attack +15% (Goblin)': // Alucard
        heroSkill = {
          name: 'Poison',
          description: '(TD) Attack of Goblins +15%',
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Damage vs Orcs +200%': // Alucard
        heroSkill = {
          name: 'Orc Counter',
          description: '(TD) This Hero deals +200% damage versus Orc',
          property: 'TD',
          percent: 0,
          elemental: false,
        };
        break;
      case '(TD) Damage vs Orcs +40%':
        heroSkill = {
          name: 'Orc Curse',
          description: '(TD) Damage versus Orcs +40%',
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
    ] = row.split('\t');

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
      rating: {
        attacking: 0,
        defending: 0,
        hunting: 0,
        mining: 0,
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

    // Round to nearest 0.5
    const round = (num) => Math.round(num*2)/2;

    const attackRating = round(
        4 * (bonus.march / maxBonus.march) +
        3 * (bonus.regeneration / maxBonus.regeneration) +
        3 * (bonus['unit-power'] / maxBonus['unit-power']) +
        1 * (bonus.recovery / maxBonus.recovery),
    );

    heroData.rating.attacking = Math.min(10, attackRating);

    heroData.rating.defending = round(
        3 * (bonus['unit-power'] / maxBonus['unit-power']) +
        3 * (bonus.regeneration / maxBonus.regeneration) +
        3 * (bonus.recovery / maxBonus.recovery),
    );

    heroData.rating.hunting = round(
        2 * (bonus.march / maxBonus.march) +
        3 * (bonus.AP / maxBonus.AP),
    );

    heroData.rating.mining = round(
        1.0 * (bonus.march / maxBonus.march) +
        2.5 * (bonus.gathering / maxBonus.gathering) +
        1.5 * (bonus.load / maxBonus.load),
    );
  });
}

/**
 * Save rating info to .tsv file
 */
function saveRating() {
  const content =
      'Element\tRarity\tHero\tFighting\tDefending\t\Hunting\tMining\n' +
      HeroBase
          .map((heroData) => (
            heroData.element + '\t' +
            heroData.rarity + '\t' +
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
