import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const DataPath = resolve(ModulePath, '../__data/');
const TemplatePath = resolve(ModulePath, '../__templates/');
const OutputPath = resolve(ModulePath, '../__generated/');

const rawData = readFileSync(resolve(DataPath, './data.tsv'), 'utf8');

const snippetTemplate =
  readFileSync(resolve(TemplatePath, './tech-snippet.html'), 'utf8');

const upgradeRowTemplate =
  readFileSync(resolve(TemplatePath, './tech-upgrade-line.html'), 'utf8');

const indexItemTemplate =
  readFileSync(resolve(TemplatePath, './tech-label.html'), 'utf8');

const hints = [];

const index = [];

const classes = [
  'population',
  'gathering',
  'gold',
  'expansion',
  'protection',
  'gift',
  'capacity',
  'recovery',
  'march',
  'power',
];

const upgrades = {
  population: [],
  gathering: [],
  gold: [],
  expansion: [],
  protection: [],
  gift: [],
  capacity: [],
  recovery: [],
  march: [],
  power: [],
};

/**
 * Build tiered Hero Gear content
 * @param {string[]} data
 */
function buildTechContent(data) {
  const title = data.shift();
  const id = title.toLowerCase().replaceAll(' ', '-');
  const effect = data.shift();
  const researchTime = data.shift();

  const techClass = classes.find((c) => id.includes(c));

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

  index.push(indexItemTemplate
      .replace('{{ID}}', id)
      .replace('{{TITLE}}', title)
      .replace('{{CLASS}}', techClass?`${techClass}-tech`:'')
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

// Tier 1 Tech
let rowStart = 0;
let levels = 5; // 5 Tech levels
buildTechContent(extract(rowStart, 0, levels));
buildTechContent(extract(rowStart, 1, levels));
buildTechContent(extract(rowStart, 2, levels));
buildTechContent(extract(rowStart, 3, levels));
rowStart += (levels + 3);

levels = 1; // 1 Tech levels
buildTechContent(extract(rowStart, 0, levels));

writeFileSync(resolve(OutputPath, `./tech-index-1.html`), index.join('\n'));
index.length = 0; // Reset index

// Tier 2 Tech
rowStart += (levels + 3);
levels = 5; // 5 Tech levels
buildTechContent(extract(rowStart, 0, levels));
buildTechContent(extract(rowStart, 1, levels));
buildTechContent(extract(rowStart, 2, levels));
buildTechContent(extract(rowStart, 3, levels));
writeFileSync(resolve(OutputPath, `./tech-index-2.html`), index.join('\n'));
index.length = 0; // reset index

rowStart += (levels + 3);

// Tier 3–10 Tech
for (let techTier = 3; techTier <= 10; techTier++) {
  buildTechContent(extract(rowStart, 0, levels));
  buildTechContent(extract(rowStart, 1, levels));
  buildTechContent(extract(rowStart, 2, levels));
  buildTechContent(extract(rowStart, 3, levels));
  writeFileSync(
      resolve(OutputPath, `./tech-index-${techTier}.html`),
      index.join('\n'),
  );
  index.length = 0; // reset index

  rowStart += (levels + 3);
}

writeFileSync(resolve(OutputPath, `./hints.html`), hints.join('\n'));
