import fs from 'fs';
import {getDateFormatStrings} from '../../utils/date-utils.js';

const exportDirectory = '../../../docs/data';
const jsFileName = 'magic-power.js';
const jsonFileName = 'magic-power.json';
const htmlFileName = 'magic-power.html';
const sheetLink = 'https://docs.google.com/spreadsheets/d/1eY8rgjvqBpPcNTvLu43f7MytCy_9_AiC5w-VFNihGdM/edit?usp=sharing';

const tableName = 'Light/Dark Magic Power';

const tableDate = new Date();
const fmtTableDate = getDateFormatStrings(tableDate);
const tableDataCode = `${fmtTableDate.YYYY}-${fmtTableDate.MM}-${fmtTableDate.DD}`

const compiledData = {
  'table': tableName,
  'table-date': tableDataCode,
  'data': []
}

function readTsvFile(fName) {
  return fs.readFileSync(fName, 'utf-8').split('\n');
}

const upgradeData = readTsvFile('reagent-power.tsv');
let totalLightReagentCost = 0;

for (let rowIdx = 1; rowIdx < upgradeData.length; rowIdx++) {
  let [
    level,
    lightPower,
    darkPower
  ] = upgradeData[rowIdx].split('\t');

  level = parseInt(level);
  lightPower = parseInt(lightPower);

  compiledData.data.push(
    {
      'level': level,
      'light-power': lightPower,
      'dark-power': lightPower,
    }
  )
}

let exportedJSON = JSON.stringify(compiledData, null, '  ');
fs.writeFileSync(`${exportDirectory}/${jsonFileName}`, exportedJSON);

const tableBody1 = []; //   0  ..  499
const tableBody2 = []; // 500  ..  999
const tableBody3 = []; // 1000 .. 1499
const tableBody4 = []; // 1500 .. 1999

let previousPower = 0;

for (let level = 0; level < 2000; level++) {
  let tableBody;
  if (level >= 1500) tableBody = tableBody4;
  else if (level >= 1000) tableBody = tableBody3;
  else if (level >= 500) tableBody = tableBody2;
  else tableBody = tableBody1;

  const data = compiledData.data[level];
  const lightPower = data['light-power'];

  tableBody.push(`<tr">`)
  tableBody.push(`<td class="level-col">${data.level}</td>`);

  if (level > 0) {
    const powerIncrease = lightPower - previousPower;
    tableBody.push(`<td class="power-col"><span class="delta">+${powerIncrease}</span></td>`);
    previousPower = lightPower;
  } else {
    tableBody.push(`<td class="power-col"></td>`);
  }

  tableBody.push(`<td class="power-col">${lightPower}</td>`);
  tableBody.push('</tr>');
}

const htmlTemplate = fs.readFileSync('power.html', 'utf-8');
const htmlOutput = htmlTemplate
  .replace('{{JSON FILE NAME}}', jsonFileName)
  .replace('{{SHEET LINK}}', sheetLink)
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
