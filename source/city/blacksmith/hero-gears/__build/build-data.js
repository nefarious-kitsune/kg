// eslint-disable-next-line no-unused-vars
import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));

export const heroGearDatabase = {
  'title': 'Hero Gear Power Bonus and Upgrade',
  'power-bonus': {},
  'upgrade': {},
};

/**
 * Build tier weapon data
 * @param {*} tier - Tier
 */
function buildTierData(tier) {
  const powerBonus = [];
  const leveling = [];
  heroGearDatabase['power-bonus'][`t${tier}`] = powerBonus;
  heroGearDatabase['upgrade'][`t${tier}`] = leveling;

  const rows = readFileSync(
      resolve(ModulePath, `../__data/t${tier}.tsv`),
      {encoding: 'utf8'},
  ).split('\n');

  for (let levelIdx = 1; levelIdx <= 20; levelIdx++) {
    const entries = rows[levelIdx].split('\t');
    const bonus = parseFloat(entries[1]);
    powerBonus.push(bonus.toFixed(1) + '%');
  }

  for (let levelIdx = 1; levelIdx < 20; levelIdx++) {
    const entries = rows[levelIdx].split('\t');
    const cost1 = parseInt(entries[3]);
    const cost2 = (entries[4] !== '')?parseInt(entries[4]):0;
    leveling.push({
      'from': levelIdx,
      'to': levelIdx+1,
      'elemental-vial': cost1,
      'blood-of-titan': cost2,
    });
  }
}

buildTierData(1);

writeFileSync(
    resolve(ModulePath, '../hero-gear-data.json'),
    JSON.stringify(heroGearDatabase, null, '  ') + '\n',
);
