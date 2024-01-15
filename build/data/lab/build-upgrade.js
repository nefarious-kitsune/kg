import fs from 'fs';
import {getDateFormatStrings} from '../../utils/date-utils.js';

const exportDirectory = '../../../docs/data';
const jsFileName = 'light-magic-cost.js';
const jsonFileName = 'light-magic-upgrade-cost.json';
const htmlFileName = 'light-magic-cost.html';
const sheetLink = 'https://docs.google.com/spreadsheets/d/12nYx5eZFv-58mNlyelezxu3RIl7tV2IUyvmiij0y_OY/edit?usp=sharing';

const tableName = 'Light Magic Upgrade Cost';

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

const upgradeData = readTsvFile('light-magic-upgrade-cost.tsv');
let totalLightReagentCost = 0;

for (let rowIdx = 1; rowIdx < upgradeData.length; rowIdx++) {
  let [
    level,
    nextLevel,
    lightCost,
    darkCost
  ] = upgradeData[rowIdx].split('\t');

  level = parseInt(level);
  lightCost = parseInt(lightCost);
  darkCost = parseInt(darkCost) || null;

  totalLightReagentCost += lightCost;

  compiledData.data.push(
    {
      'level': level,
      'light-reagent-cost': lightCost,
      'dark-reagent-cost': darkCost,
    }
  )
}

let exportedJSON = JSON.stringify(compiledData, null, '  ');
let exportedJs =
  'const LightMagicUpgradeCost = ' +
  JSON.stringify(compiledData.data, null, '  ');

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

  const data = compiledData.data[level];
  const lightReagentCost = data['light-reagent-cost'];

  tableBody.push(`<tr">`)
  tableBody.push(`<td class="level-col">${data.level} <span class="next-level">» ${data.level+1}</span></td>`);
  tableBody.push(`<td class="cost-col">${lightReagentCost}</td>`);
  tableBody.push(`<td class="cost-col">${totalLightReagentCost - cumulatedCost}</td>`);
  tableBody.push('</tr>');

  cumulatedCost += lightReagentCost;
}

const htmlTemplate = fs.readFileSync('upgrade.html', 'utf-8');
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
