import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} BlacksmithTechDatabase
 * Database for Blacksmith Tech
 * @property {string} title - Title of the database
 * @property {BlacksmithTechPowerData[]} power - Power from Blacksmith Tech (level 1–2000)
 * @property {BlacksmithTechUpgradeData[]} upgrade - Upgrade cost of Blacksmith Tech (level 1–2000)
 *
 * @typedef {Object} BlacksmithTechPowerData
 * Data for Blacksmith Tech power
 * @property {number} level - Level
 * @property {number} power - Power
 * @property {boolean} verified - Is this entry verified?
 *
 * @typedef {Object} BlacksmithTechUpgradeData
 * Data for Blacksmith Tech upgrade cost
 * @property {number} from - Level before upgrade
 * @property {number} to - Level after upgrade
 * @property {number} forge-hammer - Cost of Forge Hammer
 * @property {boolean} verified - Is this entry verified?
 */

/** @type {BlacksmithTechDatabase} */
const blacksmithTechDatabase = {
  title: 'Blacksmith Tech upgrade cost and power',
  power: [],
  upgrade: [],
};
const maxBlacksmithLevel = 2000;
const maxBlacksmithPower = 700000000;
const totalHammerCost = 1399995;

/**
 * Import TSV data and compile it to structured data
 */
function buildDatabase() {
  const tsvFilePath = resolve(ModulePath, '../__data/forge-hammer.tsv');
  const rows = readFileSync(tsvFilePath, {encoding: 'utf8'}).split('\n');
  rows.shift(); // Remove header row
  rows.pop(); // Remove last row

  rows.forEach((row) => {
    const entries = row.split('\t').map((s) => s.trim().replaceAll(',', ''));
    const currentLevel = parseInt(entries[0]);
    const hammerCost = parseInt(entries[4]);
    const hammerCostVerified = true;

    const powerVerified = (entries[1] !== '');
    const power = powerVerified?
      parseInt(entries[1]):
      parseInt(entries[2]);

    blacksmithTechDatabase.power.push({
      'level': currentLevel,
      'power': power,
      'verified': powerVerified,
    });

    blacksmithTechDatabase.upgrade.push({
      'from': currentLevel,
      'to': currentLevel + 1,
      'forge-hammer': hammerCost,
      'verified': hammerCostVerified,
    });
  }); // rows.forEach()

  blacksmithTechDatabase.power.push({
    level: maxBlacksmithLevel,
    power: maxBlacksmithPower,
    verified: true,
  });
}

/**
 * Save Database
 */
function saveDatabase() {
  const jsonFilePath = resolve(ModulePath, '../blacksmith-base-data.json');
  writeFileSync(
      jsonFilePath,
      JSON.stringify(blacksmithTechDatabase, null, '  ') + '\n');
}

buildDatabase();
saveDatabase();

export {
  blacksmithTechDatabase,
  maxBlacksmithLevel,
  maxBlacksmithPower,
  totalHammerCost,
};
