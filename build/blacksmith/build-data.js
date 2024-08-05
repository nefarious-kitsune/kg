import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');
const DataPath = resolve(ProjectPath, './data/blacksmith/');
const ExportPath = resolve(ProjectPath, './docs/blacksmith/');

export const database = {
  'title': 'Witch\'s Lab Upgrade Cost and Power',
  'power-data': [],
  'upgrade-data': [],
};

/**
 * Import TSV data and compile it to structured data
 */
function buildDatabase() {
  const tsvFilePath = resolve(DataPath, 'hammer.tsv');
  const rows = readFileSync(tsvFilePath, {encoding: 'utf8'}).split('\n');

  let totalHammerCost = 0;

  rows.shift(); // Remove header row
  rows.pop(); // Remove last row

  rows.forEach((row, index) => {
    const entries = row.split('\t').map((s) => s.trim());
    const currentLevel = parseInt(entries[0]);
    const nextLevel = currentLevel + 1;

    let hammerCost = 0;
    let hammerCostVerified;

    if (entries[4] === '') {
      hammerCost = parseInt(entries[5]);
      hammerCostVerified = false;
    } else {
      hammerCost = parseInt(entries[4]);
      hammerCostVerified = true;
    }

    totalHammerCost += hammerCost;

    let power = 0;
    let powerVerified;

    if (entries[1] === '') {
      power = 1400 * totalHammerCost;
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
      'hammer': hammerCost,
      'verified': hammerCostVerified,
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
  const _json = JSON.stringify(database, null, '  ') + '\n';

  writeFileSync(resolve(ExportPath, 'blacksmith.json'), _json);
}

buildDatabase();
saveDatabase();
