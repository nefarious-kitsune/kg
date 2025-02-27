import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const TemplatePath = resolve(ModulePath, '../__templates/');

import {blacksmithTechDatabase} from './build-base-data.js';

const table1 = [];
const table2 = [];
const table3 = [];
const table4 = [];
const tsv = [];

/**
 * Build power table
 */
function buildPowerTable() {
  // Build header row
  tsv.push(['level', 'blacksmith base power', 'verified'].join('\t'));

  const unverifiedMarker = '<img\n' +
      '  src="/assets/emojis/4x/question-mark.png"\n' +
      '  class="emoji" title="unverified" alt="unverified">';

  const rowTemplate = readFileSync(
      resolve(TemplatePath, './power-row.md'),
      {encoding: 'utf8'},
  );

  const makeRow = (entry, table) => {
    table.push(
        rowTemplate
            .replace('{{FROM LEVEL}}', entry.level)
            .replace('{{MARKER}}', entry.verified?'':unverifiedMarker)
            .replace('{{POWER}}', entry.power),
    );
    tsv.push([
      entry.level,
      entry.power,
      entry.verified?'TRUE':'FALSE',
    ].join('\t'));
  };

  const powerData = blacksmithTechDatabase['power'];
  for (let i=0; i<500; i++) makeRow(powerData[i], table1);
  for (let i=500; i<1000; i++) makeRow(powerData[i], table2);
  for (let i=1000; i<1500; i++) makeRow(powerData[i], table3);
  for (let i=1500; i<2000; i++) makeRow(powerData[i], table4);
  writeFileSync(resolve(TemplatePath, './--power-1.md'), table1.join('\n'));
  writeFileSync(resolve(TemplatePath, './--power-2.md'), table2.join('\n'));
  writeFileSync(resolve(TemplatePath, './--power-3.md'), table3.join('\n'));
  writeFileSync(resolve(TemplatePath, './--power-4.md'), table4.join('\n'));
  writeFileSync(resolve(ModulePath, '../blacksmith-power.tsv'), tsv.join('\n'));
}

buildPowerTable();
