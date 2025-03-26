import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const DataPath = resolve(ModulePath, '../__data/');
const TemplatePath = resolve(ModulePath, '../__templates/');
const OutputPath = resolve(ModulePath, '../__generated/');

const rawData = readFileSync(resolve(DataPath, './data.tsv'), 'utf8');

const snippetTemplate = readFileSync(
    resolve(TemplatePath, './tech-snippet.html'), 'utf8');

const upgradeRowTemplate = readFileSync(
    resolve(TemplatePath, './tech-upgrade-line.html'), 'utf8');

const hints = [];

/**
 * Build tiered Hero Gear content
 * @param {string[]} data
 * @param {string} id
 */
function buildTechContent(data, id) {
  const title = data.shift();
  const effect = data.shift();
  const researchTime = data.shift();

  const upgradeBody = data.map((cost, index) => upgradeRowTemplate
      .replace('{{PREV LEVEL}}', index)
      .replace('{{LEVEL}}', index+1)
      .replace('{{COST 1}}', cost),
  );

  hints.push(snippetTemplate
      .replace('{{ID}}', id)
      .replace('{{TITLE}}', title)
      .replace('{{EFFECT}}', effect)
      .replace('{{RESEARCH TIME}}', researchTime)
      .replace('{{UPGRADE DATA}}', upgradeBody.join('\n'))
      ,
  );
}

const cells = rawData.split('\n').map((r) => r.split('\t'));

/**
 * Extract data
 * @param {*} rowIdx - starting row
 * @param {*} colIdx - starting column
 * @param {*} levels - number of levels
 * @return {string[]}
 */
function extract(rowIdx, colIdx, levels) {
  return cells
      .slice(rowIdx, rowIdx + 3 + levels)
      .map((row) => row[colIdx]);
}

let rowStart = 0;
let levels = 5;
buildTechContent(extract(rowStart, 0, levels), 'population-1');
buildTechContent(extract(rowStart, 1, levels), 'gathering-1');
buildTechContent(extract(rowStart, 2, levels), 'gold-1');
buildTechContent(extract(rowStart, 3, levels), 'territory-1');
rowStart += (levels + 3);

levels = 1;
buildTechContent(extract(8, 3, 1), 'protection');
rowStart += (levels + 3);

levels = 5;
buildTechContent(extract(rowStart, 0, levels), 'gift-1');
buildTechContent(extract(rowStart, 1, levels), 'capacity-1');
buildTechContent(extract(rowStart, 2, levels), 'recovery-1');
buildTechContent(extract(rowStart, 3, levels), 'territory-2');
rowStart += (levels + 3);

writeFileSync(resolve(OutputPath, `./hints.html`), hints.join('\n'));
