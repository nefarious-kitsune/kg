import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');
const ExportPath = resolve(ProjectPath, './source/blacksmith/__temp/');

import {database} from './build-data.js';

const table1 = [];
const table2 = [];

/**
 * Build upgrade table
 */
function buildUpgradeTable() {
  const totalHammerCost = 700000000 / 500;
  let cumulativeHammerCost = 5;

  database['upgrade-data'].forEach((entry) => {
    const hammerCost = entry['hammer'];

    table1.push(
        '<tr>',
        `  <td class="from">${entry.from}</td>`,
        '  <td class="chevron">»</td>',
        `  <td class="to">${entry.to}</td>`,
        `  <td class="cost">${hammerCost}</td>`,
        '</tr>',
    );

    table2.push(
        '<tr>',
        `  <td class="from">${entry.from}</td>`,
        '  <td class="chevron">»</td>',
        '  <td class="to">2000</td>',
        `  <td class="cost">${totalHammerCost - cumulativeHammerCost}</td>`,
        '</tr>',
    );

    cumulativeHammerCost += hammerCost;
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
