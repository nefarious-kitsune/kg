import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../../../');
const TemplatePath = resolve(ModulePath, '../__templates/');
const ExportPath = resolve(ProjectPath, './docs/city/witchs-lab/light-magic/');
const ExportFilePath = resolve(ExportPath, './light-magic-power.tsv');

import {database} from './build-light-data.js';

/** HTML for power */ const table1 = [];
/** HTML for power */ const table2 = [];
/** HTML for power */ const table3 = [];
/** HTML for power */ const table4 = [];
/** TSV for power */ const tsv = [];

/**
 * Build upgrade table
 */
function buildUpgradeTable() {
  // Build header row
  tsv.push(['level', 'light magic power', 'verified'].join('\t'));

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


  const powerData = database['power-data'];
  for (let i=1; i<501; i++) makeRow(powerData[i], table1);
  for (let i=501; i<1001; i++) makeRow(powerData[i], table2);
  for (let i=1001; i<1501; i++) makeRow(powerData[i], table3);
  for (let i=1501; i<2001; i++) makeRow(powerData[i], table4);

  writeFileSync(resolve(TemplatePath, './--power-1.md'), table1.join('\n'));
  writeFileSync(resolve(TemplatePath, './--power-2.md'), table2.join('\n'));
  writeFileSync(resolve(TemplatePath, './--power-3.md'), table3.join('\n'));
  writeFileSync(resolve(TemplatePath, './--power-4.md'), table4.join('\n'));

  writeFileSync(ExportFilePath, tsv.join('\n'));
}

buildUpgradeTable();
