// Convert flat text data into structured data
import './convert.js';

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { buildBase } from '../../base/build.js';

const ModulePath = dirname(fileURLToPath(import.meta.url));

const bondJSON = readFileSync(resolve(ModulePath, './converted/hero-bonds.json'), 'utf-8');
const bondData = JSON.parse(bondJSON);

const ExportPath = resolve(ModulePath, '../../../docs/data/')
writeFileSync(resolve(ExportPath, './hero-bonds.json'), bondJSON);

const tableBody = [];

let previousBonusPercent = 0;

bondData.forEach((data) => {
  tableBody.push(`<tr>`)
  tableBody.push(`<td class="level-col">${data['star-count']}`);
  const bonusPercent = data['bonus-percent'];
  if (previousBonusPercent > 0) {
    const bonusIncrease = bonusPercent - previousBonusPercent;
    tableBody.push(
      '<td class="bonus-col">' +
      '<span class="delta">+' +
      bonusIncrease +
      '<span class="unit">%</unit>' +
      '</span>' +
      '</td>');
  } else {
    tableBody.push('<td class="bonus-col"></td>');
  }
  previousBonusPercent = bonusPercent;
  
  if (data['verified']) {
    tableBody.push(
      '<td class="bonus-col">' +
      data['bonus-percent'] +
      '<span class="unit">%</unit>' +
      '</td>');
  } else {
    tableBody.push(
      '<td class="bonus-col">' +
      '<span class="unverified">' +
      data['bonus-percent'] +
      '<span class="unit">%</unit>' +
      '</span>' +
      '</td>');
  }

  tableBody.push('</tr>');
});

const contentTemplate = readFileSync(resolve(ModulePath, './templates/hero-bonds.html'), 'utf-8');

const content = contentTemplate
  .replace('{{JSON FILE NAME}}', 'hero-bonds.json')
  .replace('{{Data}}', tableBody.join('\n'))
  ;

const outputOptions = {
  type: 'sheet',
  path: {
    base: `/data/hero-bonds`,
    icon: '/images/logo_mini.png',
  },
  css: {
    links: [
      '/css/common.css',
      '/data/data.css',
    ],
  },
  // js: {
  //   links: [
  //     '/data/data-common.js',
  //   ],
  // },
  breadcrumb: [
    {path: '/content', title: 'Home'},
    {path: '/data/', title: 'Data'},
  ],
  content: content,
  shortTitle: 'Hero Bonds',
  title: `Hero Bonds`,
  description: `Hero Bonds power bonus and total star count`,
};

const output = buildBase(outputOptions);

writeFileSync(resolve(ExportPath, './hero-bonds.html'), output);
