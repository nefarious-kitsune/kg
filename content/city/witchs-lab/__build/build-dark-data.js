import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';
// import path from 'path';
// import fs from 'fs';
import consts from '../../../../dev/consts.js';

// const directories = {
//   repo: consts.repoDir,
//   site: consts.siteDir,
//   source: consts.sourceDir,
// };

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = consts.repoDir;
const DataPath = resolve(ModulePath, '../__data/');
const ExportPath = resolve(ProjectPath, './site/city/witchs-lab/');

export const database = {
  'title': 'Witch\'s Lab Dark Magic Upgrade Cost and Power',
  'power-data': [],
  'upgrade-data': [],
};

/**
 * Import TSV data and compile it to structured data
 */
function buildDatabase() {
  const tsvFilePath = resolve(DataPath, 'dark-regent.tsv');
  const rows = readFileSync(tsvFilePath, {encoding: 'utf8'}).split('\n');

  rows.shift(); // Remove header row
  rows.pop(); // Remove last row

  rows.forEach((row, index) => {
    const entries = row.split('\t').map((s) => s.trim());
    const currentLevel = parseInt(entries[0]);
    const nextLevel = currentLevel + 1;
    const castleLevel = parseInt(entries[2]);

    const regentCost = (entries[4]==='')?null:parseInt(entries[4]);

    // totalRegentCost += regentCost;

    const power = parseInt(entries[1].replaceAll(',', ''));

    database['power-data'].push({
      'level': currentLevel,
      'power': power,
      'castle-level': castleLevel,
    });

    database['upgrade-data'].push({
      'from': currentLevel,
      'to': nextLevel,
      'dark-regent': regentCost,
      'verified': (regentCost !== null),
    });
  }); // for each
}

/**
 * Save Database
 */
function saveDatabase() {
  writeFileSync(
      resolve(ExportPath, './dark-magic/dark-magic.json'),
      JSON.stringify(database, null, '  ') + '\n');
}

buildDatabase();
saveDatabase();
