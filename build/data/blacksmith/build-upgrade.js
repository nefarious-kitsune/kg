import fs from 'fs';
import {getDateFormatStrings} from '../../utils/date-utils.js';

const exportDirectory = '../../../docs/data';
const jsFileName = 'blacksmith-cost.js';
const jsonFileName = 'blacksmith-upgrade-cost.json';
const htmlFileName = 'blacksmith-upgrade-cost.html';
// const sheetLink = '';

const tableName = 'Blacksmith Upgrade Cost';

const tableDate = new Date();
const fmtTableDate = getDateFormatStrings(tableDate);
const tableDataCode = `${fmtTableDate.YYYY}-${fmtTableDate.MM}-${fmtTableDate.DD}`

const exportedData = {
  'table': tableName,
  'table-date': tableDataCode,
  'data': []
}

const importedData = JSON.parse(fs.readFileSync('compiled-data.json', 'utf-8'));

for (let rowIdx = 0; rowIdx < (importedData.length - 1); rowIdx++) {
  exportedData.data.push({
    'level': importedData[rowIdx].level,
    'hammer-cost': importedData[rowIdx]['hammer-cost'],
    'verified': importedData[rowIdx]['cost-verified'],
  });
}

let exportedJSON = JSON.stringify(exportedData, null, '  ');
let exportedJs =
  'const BlacksmithUpgradeCost = ' +
  JSON.stringify(exportedData.data, null, '  ');

fs.writeFileSync(`${exportDirectory}/${jsonFileName}`, exportedJSON);
fs.writeFileSync(`${exportDirectory}/${jsFileName}`, exportedJs);

const tableBody1 = []; //   0  ..  499
const tableBody2 = []; // 500  ..  999
const tableBody3 = []; // 1000 .. 1499
const tableBody4 = []; // 1500 .. 1999

let cumulatedCost = 0;

for (let level = 0; level < 2000; level++) {
  let tableBody;
  if (level >= 1500) tableBody = tableBody4;
  else if (level >= 1000) tableBody = tableBody3;
  else if (level >= 500) tableBody = tableBody2;
  else tableBody = tableBody1;

  const data = importedData[level];
  const hammerCost = data['hammer-cost'];

  tableBody.push(`<tr">`)
  tableBody.push(`<td class="level-col">${data.level} <span class="next-level">» ${data.level+1}</span></td>`);

  if (data['cost-verified']) {
    tableBody.push(`<td class="cost-col">${hammerCost}</td>`);
  } else {
    tableBody.push(`<td class="cost-col"><span class="unverified">${hammerCost}</span></td></td>`);
  }

  if (data['power-verified']) {
    tableBody.push(`<td class="cost-col">${(700000000 - data.power)/500}</td>`);
  } else {
    tableBody.push(`<td class="cost-col"><span class="unverified">${(700000000 - data.power)/500}</span></td></td>`);
  }

  tableBody.push('</tr>');

  cumulatedCost += hammerCost;
}

const htmlTemplate = fs.readFileSync('upgrade.html', 'utf-8');
const htmlOutput = htmlTemplate
  .replace('{{JSON FILE NAME}}', jsonFileName)
  // .replace('{{SHEET LINK}}', sheetLink)
  .replace('{{Data 1}}', tableBody1.join('\n'))
  .replace('{{Data 2}}', tableBody2.join('\n'))
  .replace('{{Data 3}}', tableBody3.join('\n'))
  .replace('{{Data 4}}', tableBody4.join('\n'))
  ;

fs.writeFileSync(
  `${exportDirectory}/${htmlFileName}`,
  htmlOutput,
  {encoding:'utf8', flag:'w'}
);
