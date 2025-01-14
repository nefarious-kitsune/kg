import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../../../');
const TemplatePath = resolve(ModulePath, '../__templates/');
const ExportPath = resolve(ProjectPath, './docs/city/witchs-lab/');

import {database} from './build-data.js';

/** HTML for upgrading one level */ const table1 = [];
/** TSV for upgrading one level */ const tsv1 = [];
/** HTML table for upgrading to max */ const table2 = [];

/**
 * Build upgrade table
 */
function buildUpgradeTable() {
  const totalRegentCost = 1400000000 / 1400;
  let cumulativeRegentCost = 0;
  tsv1.push(['from', 'to', 'light regent cost', 'verified'].join('\t'));

  const unverifiedMarker = '<img\n' +
      '  src="/assets/emojis/4x/question-mark.png"\n' +
      '  class="emoji" title="unverified" alt="unverified">';

  const rowTemplate = readFileSync(
      resolve(TemplatePath, './upgrade-row.md'),
      {encoding: 'utf8'},
  );

  database['upgrade-data'].forEach((entry) => {
    const regentCost = entry['light-regent'];
    const maxRegentCost = totalRegentCost - cumulativeRegentCost;
    const marker = entry.verified?'':unverifiedMarker;

    table1.push(
        rowTemplate
            .replace('{{FROM LEVEL}}', entry.from)
            .replace('{{TO LEVEL}}', entry.to)
            .replace('{{MARKER}}', marker)
            .replace('{{COST}}', regentCost),
    );

    tsv1.push([
      entry.from,
      entry.to,
      regentCost,
      entry.verified?'TRUE':'FALSE',
    ].join('\t'));

    table2.push(
        rowTemplate
            .replace('{{FROM LEVEL}}', entry.from)
            .replace('{{TO LEVEL}}', '2000')
            .replace('{{MARKER}}', marker)
            .replace('{{COST}}', maxRegentCost),
    );

    cumulativeRegentCost += regentCost;
  }); // for each

  writeFileSync(
      resolve(TemplatePath, './--upgrade-one-level.md'),
      table1.join('\n'),
  );

  writeFileSync(
      resolve(TemplatePath, './--upgrade-max.md'),
      table2.join('\n'),
  );

  writeFileSync(
      resolve(ExportPath, './light-magic/light-magic-upgrade.tsv'),
      tsv1.join('\n'),
  );
}

buildUpgradeTable();
