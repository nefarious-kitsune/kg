import fs from 'fs';
import {getDateFormatStrings} from '../../utils/date-utils.js';

const exportDirectory = '../../../docs/data';
const exportFileFragment = `${exportDirectory}/blacksmithUpgradeCost`;
const tableName = 'Blacksmith Upgrade';
const fileData = fs.readFileSync('data.tsv', 'utf-8').split('\n');

const tableDate = new Date();
const fmtTableDate = getDateFormatStrings(tableDate);
const tableDataCode = `${fmtTableDate.YYYY}-${fmtTableDate.MM}-${fmtTableDate.DD}`

const compiledData = {
  'table': tableName,
  'table-date': tableDataCode,
  'data': []
}

for (let rowIdx = 1; rowIdx < fileData.length; rowIdx++) {
  const data = fileData[rowIdx].split('\t');
  const bracketIndex = parseInt(data[0]);

  let startLevel = 0;
  let verified = false;

  if (data[1].length) {
    startLevel = parseInt(data[1]);
    verified = true;
  } else {
    startLevel = parseInt(data[2]);
  }

  if (startLevel >= 2000) break;
 
  const cost = parseInt(data[4]);

  compiledData.data.push(
    {
      'range-index': bracketIndex,
      'range-start': startLevel,
      'hammer-cost': cost,
      'verified': verified,
    }
  )
}

const exportedJSON = JSON.stringify(compiledData, null, '  ');
const exportedJs =
  'const BlacksmithUpgradeCost = ' +
  JSON.stringify(compiledData.data, null, '  ');

fs.writeFileSync(`${exportFileFragment}.json`, exportedJSON);
fs.writeFileSync(`${exportFileFragment}.js`, exportedJs);

const RangeCount = compiledData.data.length; 

// Calculate total upgrade cost
let totalHammerCost = 0;
for (let rangeIndex = 0; rangeIndex < RangeCount; rangeIndex++) {
  const thisBracket = compiledData.data[rangeIndex];
  const nextBracket = compiledData.data[rangeIndex+1];
  const startLevel = thisBracket['range-start'];

  const endLevel =
    (RangeCount > rangeIndex+1)?nextBracket['range-start']:2000;

  const cost = thisBracket['hammer-cost'];
  totalHammerCost += cost * (endLevel - startLevel);
  if (endLevel === 2000) break;
}

// Expand data
const expandedData = [];
let cumulativeHammerCost = 0;

for (let rangeIndex = 0; rangeIndex < RangeCount; rangeIndex++) {
  const thisBracket = compiledData.data[rangeIndex];
  const nextBracket = compiledData.data[rangeIndex+1];
  const startLevel = thisBracket['range-start'];

  const endLevel =
    (RangeCount > rangeIndex+1)?nextBracket['range-start']:2000;

  const cost = thisBracket['hammer-cost'];
  const verified = thisBracket['verified'];

  for (let level = startLevel; level < endLevel; level++) {
    const row = {
      level: level,
      cost: cost,
      remainingCost: (totalHammerCost - cumulativeHammerCost),
      verified: verified,
    };
    expandedData.push(row);

    cumulativeHammerCost += cost;
  }
}

const tableBody1 = []; //   0  ..  499
const tableBody2 = []; // 500  ..  999
const tableBody3 = []; // 1000 .. 1499
const tableBody4 = []; // 1500 .. 1999

for (let idx = 0; idx <= 1999; idx++) {
  let tableBody;
  if (idx >= 1500) tableBody = tableBody4;
  else if (idx >= 1000) tableBody = tableBody3;
  else if (idx >= 500) tableBody = tableBody2;
  else tableBody = tableBody1;

  const row = expandedData[idx];

  tableBody.push(`<tr">`)
  tableBody.push(`<td class="level-col">${row.level} → ${row.level+1}</td>`);
  tableBody.push(`<td class="${row.verified?'cost-col':'cost-col unverified'}">${row.cost}</td>`);
  tableBody.push(`<td class="cost-col unverified">${row.remainingCost}</td>`);
  tableBody.push('</tr>');
}

const htmlTemplate = fs.readFileSync('template.html', 'utf-8');
const htmlOutput = htmlTemplate
  .replace('{{Data 1}}', tableBody1.join('\n'))
  .replace('{{Data 2}}', tableBody2.join('\n'))
  .replace('{{Data 3}}', tableBody3.join('\n'))
  .replace('{{Data 4}}', tableBody4.join('\n'))
  ;

fs.writeFileSync(`${exportFileFragment}.html`, htmlOutput, {encoding:'utf8',flag:'w'});
