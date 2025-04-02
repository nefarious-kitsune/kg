import {readFileSync, writeFileSync, existsSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const DataPath = resolve(ModulePath, `../__data/`);

/**
 * @typedef {Object} MagicGearDatabase
 * Database for Magic Gears (Magic Stones)
 * @property {string} title - Title of the database
 * @property {MagicGearData[]} gears - Data of Magic Stones
 *
 * @typedef {Object} MagicGearData
 * Data for Magic Gear (Magic Stone)
 * @property {number} tier - Gear tier
 * @property {string[]} names - Gear names
 * @property {MagicGearPowerData[]} power-bonus - Gear power bonus
 * @property {MagicGearUpgradeData[]} upgrade - Gear upgrade cost
 *
 * @typedef {Object} MagicGearPowerData
 * Data for Magic Gear power bonus
 * @property {number} level - Level
 * @property {number} bonus - Power bonus percentage (e.g. 60 for "60%")
 * @property {boolean} verified - Is this entry verified?
 *
 * @typedef {Object} MagicGearUpgradeData
 * Data for Magic Gear upgrade cost
 * @property {number} upgrade-from - Level before upgrade
 * @property {number} upgrade-to - Level after upgrade
 * @property {number} strengthening-potion - Cost of Strengthening Potion
 * @property {number} fortune-potion - Cost of Fortune Potion
 * @property {boolean} verified - Is this entry verified?
 */

/** @type {MagicGearDatabase} */
const gearDatabase = {
  title: 'Magic Gear (Magic Stone) upgrade cost and power bonus',
  gears: [],
};

const stoneNames = [
  'Sapphire', 'Amethyst', 'Ruby', 'Amber', 'Malachite', 'Emerald'];

/** Build gear data
 * @param {number} tier - Tier
 * @param {string} data - .tsv data
 * @return {MagicGearData}
 */
function buildGearData(tier, data) {
  const gearNames = stoneNames.map((n) => `T${tier} ${n}`);
  /** @type {MagicGearPowerData[]}   */ const powerData = [];
  /** @type {MagicGearUpgradeData[]} */ const upgradeData = [];

  const cells = data.split('\n').map((row) => row.split('\t'));

  for (let level = 1; level <= 20; level++) {
    const bonus = cells[level][1];
    const verified = (bonus !== '');
    powerData.push({
      level: level,
      bonus: verified?parseFloat(bonus):null,
      verified: verified,
    });
  }

  for (let level = 1; level < 20; level++) {
    const bonus = cells[level][1];
    const verified = (bonus !== '');
    let cost1 = null;
    let cost2 = null;
    if (verified) {
      cost1 = parseInt(cells[level][3]);
      cost2 = parseInt(cells[level][4])||0;
    }
    upgradeData.push({
      'upgrade-from': level,
      'upgrade-to': level+1,
      'strengthening-potion': cost1,
      'fortune-potion': cost2,
      'verified': verified,
    });
  }

  return {
    'tier': tier,
    'names': gearNames,
    'power-bonus': powerData,
    'upgrade': upgradeData,
  };
}

/** Save gear database */
function saveDatabase() {
  const jsonData = JSON.stringify(gearDatabase, null, '  ') + '\n';
  const filePath = resolve(ModulePath, `../magic-gear-data.json`);
  writeFileSync(filePath, jsonData);
}

let tier = 1;
while (true) {
  const tsvFilePath = `${DataPath}/magic-stone-t${tier}.tsv`;
  if (!existsSync(tsvFilePath)) break;
  const data = readFileSync(tsvFilePath, 'utf8');
  const gearData = buildGearData(tier, data);
  gearDatabase.gears.push(gearData);
  tier++;
}
saveDatabase();

export {gearDatabase as MagicGearDatabase};
