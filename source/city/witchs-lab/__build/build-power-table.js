import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../../../');
const TemplatePath = resolve(ModulePath, '../__templates/');
const ExportPath = resolve(ProjectPath, './docs/city/witchs-lab/');

import {database} from './build-data.js';

/** HTML for power */ const table1 = [];
/** HTML for power */ const table2 = [];
/** TSV for power */ const tsv1 = [];

/**
 * Build upgrade table
 */
function buildUpgradeTable() {
  tsv1.push(['level', 'light magic power', 'verified'].join('\t'));

  const unverifiedMarker = '<img\n' +
      '  src="/assets/emojis/4x/question-mark.png"\n' +
      '  class="emoji" title="unverified" alt="unverified">';

  const rowTemplate = readFileSync(
      resolve(TemplatePath, './power-row.md'),
      {encoding: 'utf8'},
  );

  database['power-data'].forEach((entry, idx) => {
    const marker = entry.verified?'':unverifiedMarker;
    const table = (idx < 1000)?table1:table2;

    table.push(
        rowTemplate
            .replace('{{FROM LEVEL}}', entry.level)
            .replace('{{MARKER}}', marker)
            .replace('{{POWER}}', entry.power),
    );

    tsv1.push([
      entry.level,
      entry.power,
      entry.verified?'TRUE':'FALSE',
    ].join('\t'));
  }); // for each

  writeFileSync(resolve(TemplatePath, './--power-1.md'), table1.join('\n'));
  writeFileSync(resolve(TemplatePath, './--power-2.md'), table2.join('\n'));

  writeFileSync(
      resolve(ExportPath, './light-magic/light-magic-power.tsv'),
      tsv1.join('\n'),
  );
}

buildUpgradeTable();
