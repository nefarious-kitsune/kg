import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const DataPath = resolve(ModulePath, './data/');

const nrBase = new Map();

/** Build normal recruitment base */
function buildNRBase() {
  const tsvFilePath = resolve(DataPath, 'normal-recruit.tsv');
  const rows = readFileSync(tsvFilePath, {encoding: 'utf8'}).split('\n');
  // rows.shift(); // Remove header row
  rows.forEach((row) => {
    const cells = row.split('\t').map((s) => s.trim());
    const heroName = cells[0];
    if (heroName === '') return; // Skip blank line
    const percentage = cells[1];
    nrBase.set(heroName, percentage);
  });
}

buildNRBase();

/**
 * Get drop percentage of a hero in Normal Recruitment
 * @param {string} heroName - Element of the hero
 * @return {null|string}
 */
export function getNormalRecruitment(heroName) {
  if (nrBase.has(heroName)) return nrBase.get(heroName);
  else return null;
}
