import {existsSync} from 'fs';
import path from 'path';

import {readTsvFile, saveTextFile} from '../../../../../dev/files/files.js';
import {dirs} from './dirs.js';

/** @typedef {import('./typedef.js').MagicStoneData} MagicStoneData */
/** @typedef {import('./typedef.js').MagicStoneDatabase} MagicStoneDatabase */

const jsonFilePath = path.join(dirs.__content, `/magic-stone-data.json`);

/** @type {MagicStoneDatabase} */
const gearDatabase = {
  'title': 'Magic Stone upgrade cost and power bonus',
  'magic-stones': [],
};

const stoneNames =
  ['Sapphire', 'Amethyst', 'Ruby', 'Amber', 'Malachite', 'Emerald'];

/** Build Magic Stone data
 * @param {number} tier - Tier
 * @param {Array.<Array.<string>>} cells - .tsv data
 * @return {MagicStoneData}
 */
function buildData(tier, cells) {
  /** @type {MagicStoneData } */
  const data = {
    'tier': tier,
    'names': stoneNames.map((n) => `T${tier} ${n}`),
    'power-bonus': [],
    'upgrade': [],
  };

  for (let level = 1; level <= 20; level++) {
    const bonus = cells[level][1];
    const verified = (bonus !== '');
    data['power-bonus'].push({
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
    data.upgrade.push({
      'upgrade-from': level,
      'upgrade-to': level+1,
      'strengthening-potion': cost1,
      'fortune-potion': cost2,
      'verified': verified,
    });
  }

  return data;
}

/** Build gear database */
function buildDatabase() {
  let tier = 1;
  while (true) {
    const tsvFilePath = path.join(dirs.__data, `/magic-stone-t${tier}.tsv`);
    if (!existsSync(tsvFilePath)) break;
    const data = buildData(tier, readTsvFile(tsvFilePath));
    gearDatabase['magic-stones'].push(data);
    tier++;
  }
}

/** Save gear database */
function saveDatabase() {
  saveTextFile(jsonFilePath, gearDatabase);
}

buildDatabase();
saveDatabase();
