// eslint-disable-next-line no-unused-vars
import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} HeroGearDatabase
 * Database for Hero Gears
 * @property {string} title - Title of the database
 * @property {HeroGearData} t1 - Data for T1 Hero Gear
 * @property {HeroGearData} t2 - Data for T2 Hero Gear
 * @property {HeroGearData} t3 - Data for T3 Hero Gear
 * @property {HeroGearData} t4 - Data for T4 Hero Gear
 * @property {HeroGearData} t5 - Data for T5 Hero Gear
 *
 * @typedef {Object} HeroGearData
 * Data for Hero Gear (power bonus and upgrade cost)
 * @property {HeroGearPowerData[]} power-bonus - Power bonus from Hero Gear (level 1–20)
 * @property {HeroGearUpgradeData[]} upgrade - Upgrade cost of Hero Gear (level 1–19)
 *
 * @typedef {string} HeroGearPowerData
 * Data for Hero Gear power bonus ("x.x%")
 *
 * @typedef {Object} HeroGearUpgradeData
 * Data for Hero Gear upgrade cost
 * @property {number} from - Level before upgrade
 * @property {number} to - Level after upgrade
 * @property {number} elemental-vial - Cost of Elemental Vial
 * @property {number} blood-of-titan - Cost of Blood of Titan
 */

/** @type {HeroGearDatabase} */
const heroGearDatabase = {
  'title': 'Hero Gear upgrade cost and power bonus',
  'power-bonus': {},
  'upgrade': {},
};

const maxTier = 2;
for (let tier = 1; tier <= maxTier; tier++) buildTierData(tier);
saveDatabase();

/**
 * Build tier weapon data
 * @param {*} tier - Tier
 */
function buildTierData(tier) {
  /** @type {HeroGearData} */
  const heroGearData = {
    'power-bonus': [],
    'upgrade': [],
  };

  heroGearDatabase[`t${tier}`] = heroGearData;

  const rows = readFileSync(
      resolve(ModulePath, `../__data/t${tier}.tsv`),
      {encoding: 'utf8'},
  ).split('\n');

  for (let levelIdx = 1; levelIdx <= 20; levelIdx++) {
    const entries = rows[levelIdx].split('\t');
    const bonus = parseFloat(entries[1]);
    heroGearData['power-bonus'].push(bonus.toFixed(1) + '%');
  }

  for (let levelIdx = 1; levelIdx < 20; levelIdx++) {
    const entries = rows[levelIdx].split('\t');
    const cost1 = parseInt(entries[3]);
    const cost2 = (entries[4] !== '')?parseInt(entries[4]):0;
    heroGearData.upgrade.push({
      'from': levelIdx,
      'to': levelIdx+1,
      'elemental-vial': cost1,
      'blood-of-titan': cost2,
    });
  }
}

writeFileSync(
    resolve(ModulePath, '../hero-gear-data.json'),
    JSON.stringify(heroGearDatabase, null, '  ') + '\n',
);

/**
 * Save tier weapon database
 */
function saveDatabase() {
  writeFileSync(
      resolve(ModulePath, '../hero-gear-data.json'),
      JSON.stringify(heroGearDatabase, null, '  ') + '\n',
  );
}

export {
  heroGearDatabase,
};
