// eslint-disable-next-line no-unused-vars
import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

import {HeroGearNames} from './hero-gear-names.js';

const ModulePath = dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} HeroGearDatabase
 * Database for Hero Gears
 * @property {string} title - Title of the database
 * @property {HeroGearData[]} gears - Data of Hero Gears
 *
 * @typedef {Object} HeroGearData
 * Data for Hero Gear (power bonus and upgrade cost)
 * @property {number} tier - Tier of the Hero Gear
 * @property {string[]} names - Names of the Hero Gear
 * @property {HeroGearPowerData[]} power-bonus - Power bonus from Hero Gear (level 1–20)
 * @property {HeroGearUpgradeData[]} upgrade - Upgrade cost of Hero Gear (level 1–19)
 *
 * @typedef {Object} HeroGearPowerData
 * Data for Hero Gear power bonus
 * @property {number} level - Level
 * @property {number} bonus - Power bonus percentage (e.g. 60 for "60%")
 * @property {boolean} verified - Is this entry verified?
 *
 * @typedef {Object} HeroGearUpgradeData
 * Data for Hero Gear upgrade cost
 * @property {number} from - Level before upgrade
 * @property {number} to - Level after upgrade
 * @property {number} elemental-vial - Cost of Elemental Vial
 * @property {number} blood-of-titan - Cost of Blood of Titan
 * @property {boolean} verified - Is this entry verified?
 */

/** @type {HeroGearDatabase} */
const heroGearDatabase = {
  title: 'Hero Gear upgrade cost and power bonus',
  gears: [],
};

const maxTier = 4;

/**
 * Build tier weapon data
 * @param {*} tier - Tier
 */
function buildTierData(tier) {
  const names = HeroGearNames[tier-1]||[];

  /** @type {HeroGearData} */
  const heroGearData = {
    'tier': tier,
    'names': names,
    'power-bonus': [],
    'upgrade': [],
  };

  const rows = readFileSync(
      resolve(ModulePath, `../__data/t${tier}.tsv`),
      {encoding: 'utf8'},
  ).split('\n');

  for (let levelIdx = 1; levelIdx <= 20; levelIdx++) {
    const entries = rows[levelIdx].split('\t');
    const bonus = parseFloat(entries[1]);
    const verified = entries[1] !== '';
    heroGearData['power-bonus'].push({
      level: levelIdx,
      bonus: verified?bonus:null,
      verified: verified,
    });
  }

  for (let levelIdx = 1; levelIdx < 20; levelIdx++) {
    const entries = rows[levelIdx].split('\t');
    const verified = entries[3] !== '';
    const cost1 = parseInt(entries[3]);
    const cost2 = parseInt(entries[4])||0;
    heroGearData.upgrade.push({
      'from': levelIdx,
      'to': levelIdx+1,
      'elemental-vial': verified?cost1:null,
      'blood-of-titan': verified?cost2:null,
      'verified': verified,
    });
  }
  heroGearDatabase.gears.push(heroGearData);
}

/**
 * Save tier weapon database
 */
function saveDatabase() {
  writeFileSync(
      resolve(ModulePath, '../hero-gear-data.json'),
      JSON.stringify(heroGearDatabase, null, '  ') + '\n',
  );
}

for (let tier = 1; tier <= maxTier; tier++) buildTierData(tier);
saveDatabase();

export {
  heroGearDatabase,
  maxTier,
};
