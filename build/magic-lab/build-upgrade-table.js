import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');
const ExportPath = resolve(ProjectPath, './source/magic-lab/__temp/');

import {database} from './build-data.js';

const table1 = [];
const table2 = [];

/**
 * Build upgrade table
 */
function buildUpgradeTable() {
  const totalRegentCost = 1400000000 / 1400;
  let cumulativeRegentCost = 0;

  database['upgrade-data'].forEach((entry) => {
    const regentCost = entry['light-regent'];

    table1.push(
        '<tr>',
        `  <td class="from">${entry.from}</td>`,
        '  <td class="chevron">»</td>',
        `  <td class="to">${entry.to}</td>`,
        `  <td class="cost">${regentCost}</td>`,
        '</tr>',
    );

    table2.push(
        '<tr>',
        `  <td class="from">${entry.from}</td>`,
        '  <td class="chevron">»</td>',
        '  <td class="to">2000</td>',
        `  <td class="cost">${totalRegentCost - cumulativeRegentCost}</td>`,
        '</tr>',
    );

    cumulativeRegentCost += regentCost;
  }); // for each

  writeFileSync(
      resolve(ExportPath, '--upgrade-one-level.html'),
      table1.join('\n'),
  );

  writeFileSync(
      resolve(ExportPath, '--upgrade-max.html'),
      table2.join('\n'),
  );
}

buildUpgradeTable();
