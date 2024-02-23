import fs from 'fs';
import {getDateFormatStrings} from '../../utils/date-utils.js';

const exportDirectory = '../../../docs/data';
const jsFileName = 'blacksmith-power.js';
const jsonFileName = 'blacksmith-power.json';
const htmlFileName = 'blacksmith-power.html';
// const sheetLink = '';

const tableName = 'Blacksmith Power';

const tableDate = new Date();
const fmtTableDate = getDateFormatStrings(tableDate);
const tableDataCode = `${fmtTableDate.YYYY}-${fmtTableDate.MM}-${fmtTableDate.DD}`

const exportedData = {
  'table': tableName,
  'table-date': tableDataCode,
  'data': []
}

const importedData = JSON.parse(fs.readFileSync('compiled-data.json', 'utf-8'));

for (let rowIdx = 1; rowIdx < importedData.length; rowIdx++) {
  exportedData.data.push({
    level: importedData[rowIdx].level,
    power: importedData[rowIdx].power,
    verified: importedData[rowIdx]['power-verified'],
  });
}

let exportedJSON = JSON.stringify(exportedData, null, '  ');
fs.writeFileSync(`${exportDirectory}/${jsonFileName}`, exportedJSON);

const tableBody1 = []; //   0  ..  499
const tableBody2 = []; // 500  ..  999
const tableBody3 = []; // 1000 .. 1499
const tableBody4 = []; // 1500 .. 1999

let previousPower = 0;

for (let level = 1; level <= 2000; level++) {
  let tableBody;
  if (level >= 1501) tableBody = tableBody4;
  else if (level >= 1001) tableBody = tableBody3;
  else if (level >= 501) tableBody = tableBody2;
  else tableBody = tableBody1;

  const data = importedData[level];
  const power = data.power;

  tableBody.push(`<tr>`)
  tableBody.push(`<td class="level-col">${data.level}</td>`);

  if (level > 0) {
    const powerIncrease = power - previousPower;
    tableBody.push(`<td class="power-col"><span class="delta">+${powerIncrease}</span></td>`);
    previousPower = power;
  } else {
    tableBody.push(`<td class="power-col"></td>`);
  }

  if (data['power-verified']) {
    tableBody.push(`<td class="power-col">${power}</td>`);
  } else {
    tableBody.push(`<td class="power-col"><span class="unverified">${power}</span></td>`);
  }
  
  tableBody.push('</tr>');
}

const htmlTemplate = fs.readFileSync('power.html', 'utf-8');
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
