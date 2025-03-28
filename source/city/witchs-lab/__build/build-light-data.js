import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../../../');
const DataPath = resolve(ModulePath, '../__data/');
const ExportPath = resolve(ProjectPath, './site/city/witchs-lab/');

export const database = {
  'title': 'Witch\'s Lab Light Magic Upgrade Cost and Power',
  'power-data': [],
  'upgrade-data': [],
};

/**
 * Import TSV data and compile it to structured data
 */
function buildDatabase() {
  const tsvFilePath = resolve(DataPath, 'light-regent.tsv');
  const rows = readFileSync(tsvFilePath, {encoding: 'utf8'}).split('\n');

  let totalRegentCost = 0;

  rows.shift(); // Remove header row
  rows.pop(); // Remove last row

  rows.forEach((row, index) => {
    const entries = row.split('\t').map((s) => s.trim());
    const currentLevel = parseInt(entries[0]);
    const nextLevel = currentLevel + 1;

    let regentCost = 0;
    let regentCostVerified;

    if (entries[4] === '') {
      regentCost = parseInt(entries[5]);
      regentCostVerified = false;
    } else {
      regentCost = parseInt(entries[4]);
      regentCostVerified = true;
    }

    totalRegentCost += regentCost;

    let power = 0;
    let powerVerified;

    if (entries[1] === '') {
      power = 1400 * totalRegentCost;
      powerVerified = false;
    } else {
      power = parseInt(entries[1].replaceAll(',', ''));
      powerVerified = true;
    }

    database['power-data'].push({
      level: currentLevel,
      power: power,
      verified: powerVerified,
    });

    database['upgrade-data'].push({
      'from': currentLevel,
      'to': nextLevel,
      'light-regent': regentCost,
      'verified': regentCostVerified,
    });
  }); // for each

  database['power-data'].push({
    level: 2000,
    power: 1400000000,
    verified: true,
  });
}

/**
 * Save Database
 */
function saveDatabase() {
  writeFileSync(
      resolve(ExportPath, './light-magic/light-magic.json'),
      JSON.stringify(database, null, '  ') + '\n');
}

buildDatabase();
saveDatabase();
