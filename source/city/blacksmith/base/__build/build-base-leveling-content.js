/* eslint-disable max-len */
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const TemplatePath = resolve(ModulePath, '../__templates/');

import {blacksmithTechDatabase} from './build-base-data.js';

/** HTML for step leveling */
const stepTables = [[], [], [], []];
/** HTML for max leveling */
const maxTables = [[], [], [], []];
/** TSV for step leveling */
const tsv = [];

const totalHammerCost = 1399995;
let cumulatedHammerCost = 0;

/**
 * Build upgrade table
 */
function buildLevelingTable() {
  // Build header row
  tsv.push(['from', 'to', 'forge hammer cost', 'verified'].join('\t'));

  const unverifiedMarker = '<img\n' +
      '  src="/assets/emojis/4x/question-mark.png"\n' +
      '  class="emoji" title="unverified" alt="unverified">';

  const rowTemplate = readFileSync(
      resolve(TemplatePath, './leveling-row.md'),
      {encoding: 'utf8'},
  );

  const makeRow = (entry, stepTable, maxTable) => {
    const hammerCost = entry['forge-hammer'];
    const maxHammerCost = totalHammerCost - cumulatedHammerCost;
    stepTable.push(
        rowTemplate
            .replace('{{FROM LEVEL}}', entry.from)
            .replace('{{TO LEVEL}}', entry.to)
            .replace('{{MARKER}}', entry.verified?'':unverifiedMarker)
            .replace('{{FORGE HAMMER COST}}', hammerCost),
    );
    maxTable.push(
        rowTemplate
            .replace('{{FROM LEVEL}}', entry.from)
            .replace('{{TO LEVEL}}', '2000')
            .replace('{{MARKER}}', entry.verified?'':unverifiedMarker)
            .replace('{{FORGE HAMMER COST}}', maxHammerCost),
    );
    tsv.push([
      entry.from,
      entry.to,
      hammerCost,
      entry.verified?'TRUE':'FALSE',
    ].join('\t'));
    cumulatedHammerCost += hammerCost;
  };

  const levelingData = blacksmithTechDatabase['leveling'];
  for (let i=0; i<500; i++) makeRow(levelingData[i], stepTables[0], maxTables[0]);
  for (let i=500; i<1000; i++) makeRow(levelingData[i], stepTables[1], maxTables[1]);
  for (let i=1000; i<1500; i++) makeRow(levelingData[i], stepTables[2], maxTables[2]);
  for (let i=1500; i<1999; i++) makeRow(levelingData[i], stepTables[3], maxTables[3]);

  writeFileSync(resolve(TemplatePath, './--leveling-1.md'), stepTables[0].join('\n'));
  writeFileSync(resolve(TemplatePath, './--leveling-2.md'), stepTables[1].join('\n'));
  writeFileSync(resolve(TemplatePath, './--leveling-3.md'), stepTables[2].join('\n'));
  writeFileSync(resolve(TemplatePath, './--leveling-4.md'), stepTables[3].join('\n'));
  writeFileSync(resolve(TemplatePath, './--leveling-max-1.md'), maxTables[0].join('\n'));
  writeFileSync(resolve(TemplatePath, './--leveling-max-2.md'), maxTables[1].join('\n'));
  writeFileSync(resolve(TemplatePath, './--leveling-max-3.md'), maxTables[2].join('\n'));
  writeFileSync(resolve(TemplatePath, './--leveling-max-4.md'), maxTables[3].join('\n'));
  writeFileSync(resolve(ModulePath, '../blacksmith-leveling.tsv'), tsv.join('\n'));
}

buildLevelingTable();
