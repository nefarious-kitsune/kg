import fs from 'fs';
import {getDateFormatStrings} from '../../utils/date-utils.js';

const exportDirectory = '../../../docs/data';
const exportFileFragment = `${exportDirectory}/blacksmithUpgradeCost`;
const tableName = 'Blacksmith Upgrade';
const fileData = fs.readFileSync('data.csv', 'utf-8').split('\n');

const tableDate = new Date();
const fmtTableDate = getDateFormatStrings(tableDate);
const tableDataCode = `${fmtTableDate.YYYY}-${fmtTableDate.MM}-${fmtTableDate.DD}`

const compiledData = {
  'table': tableName,
  'table-date': tableDataCode,
  'data': []
}

for (let rowIdx = 1; rowIdx < fileData.length; rowIdx++) {
  const data = fileData[rowIdx].split(',');
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
      'bracket-index': bracketIndex,
      'bracket-start': startLevel,
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

const tableBody = [];

const BracketCount = compiledData.data.length; 

for (let bracketIndex = 0; bracketIndex < BracketCount; bracketIndex++) {
  const thisBracket = compiledData.data[bracketIndex];
  const nextBracket = compiledData.data[bracketIndex+1];

  const startLevel = thisBracket['bracket-start'];
  
  const endLevel =
    (BracketCount > bracketIndex+1)?nextBracket['bracket-start']:2000;

  const cost = thisBracket['hammer-cost'];
  const verified = thisBracket.verified;

  tableBody.push(`<tr id="bracket-${bracketIndex}">`)
  tableBody.push(`<td class="level-col">${startLevel} → ${startLevel+1}<br>⋮<br>${endLevel-1} → ${endLevel}</td>`);
  tableBody.push(`<td class="cost-col">${cost}</td>`);
  tableBody.push(`<td class="verification-col ${verified?'verified':'unverified'}">${verified?'Verified':'Extrapolated'}</td>`);
  tableBody.push('</tr>');
}

const htmlTemplate = fs.readFileSync('template.html', 'utf-8');
const htmlOutput = htmlTemplate.replace('{{Data}}',tableBody.join('\n'));

fs.writeFileSync(`${exportFileFragment}.html`, htmlOutput, {encoding:'utf8',flag:'w'});
