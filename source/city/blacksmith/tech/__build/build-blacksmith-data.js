import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
// const ProjectPath = resolve(ModulePath, '../../../../');

export const blacksmithTechDatabase = {
  'title': 'Blacksmith Tech Power and Leveling',
  'power': [],
  'leveling': [],
};

/**
 * Import TSV data and compile it to structured data
 */
function buildDatabase() {
  const tsvFilePath = resolve(ModulePath, '../forge-hammer.tsv');
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

    blacksmithTechDatabase['power'].push({
      'level': currentLevel,
      'power': power,
      'verified': powerVerified,
    });

    blacksmithTechDatabase['leveling'].push({
      'from': currentLevel,
      'to': currentLevel + 1,
      'forge-hammer': hammerCost,
      'verified': hammerCostVerified,
    });
  }); // rows.forEach()

  blacksmithTechDatabase['power'].push({
    level: 2000,
    power: 700000000,
    verified: true,
  });
}

/**
 * Save Database
 */
function saveDatabase() {
  const jsonFilePath = resolve(ModulePath, '../forge-hammer.json');
  writeFileSync(
      jsonFilePath,
      JSON.stringify(blacksmithTechDatabase, null, '  ') + '\n');
}

buildDatabase();
saveDatabase();
