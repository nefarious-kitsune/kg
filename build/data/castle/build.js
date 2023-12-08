import fs from 'fs';
import {getDateFormatStrings} from '../../utils/date-utils.js';

const exportDirectory = '../../../docs/data';
const exportFileFragment = `${exportDirectory}/castleUpgradeCost`;
const tableName = 'Castle Upgrade';

const tableDate = new Date();
const fmtTableDate = getDateFormatStrings(tableDate);
const tableDataCode = `${fmtTableDate.YYYY}-${fmtTableDate.MM}-${fmtTableDate.DD}`

const compiledData = {
  'table': tableName,
  'table-date': tableDataCode,
  'data': []
}

let fileData = [];
const dataFiles = [
  'data-1.tsv',
  'data-2.tsv',
  'data-3.tsv',
];

dataFiles.forEach((file) => {
  fileData = fileData.concat(fs.readFileSync(file, 'utf-8').split('\n'));
});

for (let rowIdx = 1; rowIdx < fileData.length; rowIdx++) {
  const [
    level,
    /* null */,
    stoneCost,
    woodCost,
    ironCost,
    goldCost,
    goldUnit] = fileData[rowIdx].split('\t');

  compiledData.data.push(
    {
      'level': parseInt(level),
      'stone-cost': parseInt(stoneCost),
      'wood-cost': (woodCost === '')?0:parseInt(woodCost),
      'iron-cost': (ironCost === '')?0:parseInt(ironCost),
      'gold-cost': goldCost + goldUnit,
      'verified': true,
    }
  )
}

const exportedJSON = JSON.stringify(compiledData, null, '  ');

/*
const exportedJs =
  'const CastleUpgradeCost = ' +
  JSON.stringify(compiledData.data, null, '  ');
*/

fs.writeFileSync(`${exportFileFragment}.json`, exportedJSON);
/*
fs.writeFileSync(`${exportFileFragment}.js`, exportedJs);
*/

const tableBody = [];

const dataCount = compiledData.data.length; 
for (let dataIndex = 0; dataIndex < dataCount; dataIndex++) {
  const currData = compiledData.data[dataIndex];
  tableBody.push(`<tr id="level-${currData.level}">`)
  tableBody.push(`<td class="level-col">${currData.level} → ${currData.level+1}</td>`);
  tableBody.push(`<td class="cost-col">${currData['stone-cost']}</td>`);
  tableBody.push(`<td class="cost-col">${currData['wood-cost']}</td>`);
  tableBody.push(`<td class="cost-col">${currData['iron-cost']}</td>`);
  tableBody.push(`<td class="cost-col">${currData['gold-cost']}</td>`);
  tableBody.push(`<td class="verification-col verified">Verified</td>`);
  tableBody.push('</tr>');
}

const htmlTemplate = fs.readFileSync('template.html', 'utf-8');
const htmlOutput = htmlTemplate.replace('{{Data}}',tableBody.join('\n'));

fs.writeFileSync(`${exportFileFragment}.html`, htmlOutput, {encoding:'utf8',flag:'w'});