import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');

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
      '  src="../assets/icons/emoji_question-color.png"\n' +
      '  class="icon" title="unverified" alt="unverified"></img>';

  database['upgrade-data'].forEach((entry) => {
    const regentCost = entry['light-regent'];
    const maxRegentCost = totalRegentCost - cumulativeRegentCost;
    const marker = entry.verified?'':unverifiedMarker;

    table1.push(
        '<tr>',
        `  <td class="from-level">${entry.from}</td>`,
        '  <td class="chevron">»</td>',
        `  <td class="to-level">${entry.to}</td>`,
        `  <td class="upgrade-cost">${marker}${regentCost}</td>`,
        '</tr>',
    );

    tsv1.push([
      entry.from,
      entry.to,
      regentCost,
      entry.verified?'TRUE':'FALSE',
    ].join('\t'));

    table2.push(
        '<tr>',
        `  <td class="from-level">${entry.from}</td>`,
        '  <td class="chevron">»</td>',
        '  <td class="to-level">2000</td>',
        `  <td class="upgrade-cost">${maxRegentCost}</td>`,
        '</tr>',
    );

    cumulativeRegentCost += regentCost;
  }); // for each

  writeFileSync(
      resolve(
          ProjectPath,
          './source/magic-lab/__temp/--upgrade-one-level.html'),
      table1.join('\n'),
  );

  writeFileSync(
      resolve(
          ProjectPath,
          './docs/magic-lab/magic-lab-upgrade.tsv'),
      tsv1.join('\n'),
  );

  writeFileSync(
      resolve(
          ProjectPath,
          './source/magic-lab/__temp/--upgrade-max.html'),
      table2.join('\n'),
  );
}

buildUpgradeTable();
