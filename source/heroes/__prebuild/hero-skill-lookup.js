import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const DataPath = resolve(ModulePath, '../__data/');
/**
 * @typedef {'march'|'recovery'|'regeneration'|'unit-power'|'AP'|'load'|'offline'|'gathering'|'TD'} HeroProperty
 */

/**
 * @typedef {Object} HeroSkill
 * @property {string} name - In-game skill name
 * @property {string} long-description - In-game skill description
 * @property {string} short-description - Short skill description
 * @property {HeroProperty} property - Property that is affected by this skill
 * @property {number} percent - Numerical value of the skill
 * @property {boolean} elemental - For 'unit-power', is this skill elemental?
 */

/** @type {Map<string, HeroSkill>} */
const HeroSkillDictionary = new Map();

/**
 * Build a Hero Skill dictionary
 */
function buildDictionary() {
  const tsvFilePath = resolve(DataPath, 'hero-skill-lookup.tsv');
  const rows = readFileSync(tsvFilePath, 'utf8').split('\n');
  rows.forEach((row) => {
    let [
      id,
      skillName,
      percent,
      property,
      elemental,
      shortDesc,
      longDesc,
    ] = row.split('\t');

    // Skip blank line from copy/paste
    if (id === '') return;
    id = id.toLowerCase().trim();

    percent = parseInt(percent);

    shortDesc = shortDesc
        .replace('{{value}}', percent)
        .trim();

    longDesc = longDesc
        .replace('{{value}}', percent)
        .replace('\\n', '\n')
        .trim();

    /** @type {HeroSkill} */
    const heroSkill = {
      'name': skillName,
      'long-description': longDesc,
      'short-description': shortDesc,
      'property': property,
      'percent': percent,
      'elemental': (elemental === 'TRUE'),
    };

    HeroSkillDictionary.set(id, heroSkill);
  });
}

/**
 * Look up a Hero skill
 * @param {string} id - id of the Hero Skill
 * @return {HeroSkill|null}
 */
export function getHeroSkill(id) {
  if (HeroSkillDictionary.has(id)) {
    return Object.assign({}, HeroSkillDictionary.get(id));
  } else {
    return null;
  }
}

buildDictionary();
