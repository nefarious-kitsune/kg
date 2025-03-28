/* eslint-disable max-len */
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../../../');
const TemplatePath = resolve(ModulePath, '../__templates/');
const ExportPath = resolve(ProjectPath, './site/city/witchs-lab/light-magic/');
const ExportFilePath = resolve(ExportPath, './light-magic-upgrade.tsv');

import {database} from './build-light-data.js';

/** HTML for upgrading one level */ const stepTable1 = [];
/** HTML for upgrading one level */ const stepTable2 = [];
/** HTML for upgrading one level */ const stepTable3 = [];
/** HTML for upgrading one level */ const stepTable4 = [];
/** HTML table for upgrading to max */ const maxTable1 = [];
/** HTML table for upgrading to max */ const maxTable2 = [];
/** HTML table for upgrading to max */ const maxTable3 = [];
/** HTML table for upgrading to max */ const maxTable4 = [];
/** TSV for upgrading one level */ const tsv = [];

/**
 * Build upgrade table
 */
function buildUpgradeTable() {
  const totalRegentCost = 1400000000 / 1400;
  let cumulativeRegentCost = 0;
  // Build header row
  tsv.push(['from', 'to', 'light regent cost', 'verified'].join('\t'));

  const unverifiedMarker = '<img\n' +
      '  src="/assets/emojis/4x/question-mark.png"\n' +
      '  class="emoji" title="unverified" alt="unverified">';

  const rowTemplate = readFileSync(
      resolve(TemplatePath, './upgrade-row.md'),
      {encoding: 'utf8'},
  );

  const makeRow = (entry, stepTable, maxTable) => {
    const regentCost = entry['light-regent'];
    const maxRegentCost = totalRegentCost - cumulativeRegentCost;
    stepTable.push(
        rowTemplate
            .replace('{{FROM LEVEL}}', entry.from)
            .replace('{{TO LEVEL}}', entry.to)
            .replace('{{MARKER}}', entry.verified?'':unverifiedMarker)
            .replace('{{COST}}', regentCost),
    );
    maxTable.push(
        rowTemplate
            .replace('{{FROM LEVEL}}', entry.from)
            .replace('{{TO LEVEL}}', '2000')
            .replace('{{MARKER}}', entry.verified?'':unverifiedMarker)
            .replace('{{COST}}', maxRegentCost),
    );
    tsv.push([
      entry.from,
      entry.to,
      regentCost,
      entry.verified?'TRUE':'FALSE',
    ].join('\t'));
    cumulativeRegentCost += regentCost;
  };

  const upgradeData = database['upgrade-data'];
  for (let i=0; i<500; i++) makeRow(upgradeData[i], stepTable1, maxTable1);
  for (let i=500; i<1000; i++) makeRow(upgradeData[i], stepTable2, maxTable2);
  for (let i=1000; i<1500; i++) makeRow(upgradeData[i], stepTable3, maxTable3);
  for (let i=1500; i<2000; i++) makeRow(upgradeData[i], stepTable4, maxTable4);

  writeFileSync(resolve(TemplatePath, './--upgrade-1.md'), stepTable1.join('\n'));
  writeFileSync(resolve(TemplatePath, './--upgrade-2.md'), stepTable2.join('\n'));
  writeFileSync(resolve(TemplatePath, './--upgrade-3.md'), stepTable3.join('\n'));
  writeFileSync(resolve(TemplatePath, './--upgrade-4.md'), stepTable4.join('\n'));
  writeFileSync(resolve(TemplatePath, './--upgrade-max-1.md'), maxTable1.join('\n'));
  writeFileSync(resolve(TemplatePath, './--upgrade-max-2.md'), maxTable2.join('\n'));
  writeFileSync(resolve(TemplatePath, './--upgrade-max-3.md'), maxTable3.join('\n'));
  writeFileSync(resolve(TemplatePath, './--upgrade-max-4.md'), maxTable4.join('\n'));
  writeFileSync(ExportFilePath, tsv.join('\n'));
}

buildUpgradeTable();
