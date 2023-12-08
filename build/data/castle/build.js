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
  'data-4.tsv',
  'data-5.tsv',
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

const tables = [ [], [], ];

const dataContentTemplate =
`<div class="tabbed-table-content" id="data-content-{{INDEX}}" {{CONTENT-CLASS}}>
<table class="upgrade-table">
<thead>
<tr>
<th class="level-col">Castle Level</th>
<th class="cost-col">Stone Cost</th>
<th class="cost-col">Wood Cost</th>
<th class="cost-col">Iron Cost</th>
<th class="cost-col">Gold Cost</th>
<th class="verification-col">Verification</th>
</tr>
</thead>
<tbody>
{{DATA}}
</tbody>
</table>
</div>\n`;

const dataCount = compiledData.data.length; 
for (let dataIndex = 0; dataIndex < dataCount; dataIndex++) {
  const currData = compiledData.data[dataIndex];
  let table;

  if (currData.level < 500) table = tables[0];
  else table = tables[1];

  table.push(`<tr id="level-${currData.level}">`)
  table.push(`<td class="level-col">${currData.level} → ${currData.level+1}</td>`);
  table.push(`<td class="cost-col">${currData['stone-cost']}</td>`);
  table.push(`<td class="cost-col">${currData['wood-cost']}</td>`);
  table.push(`<td class="cost-col">${currData['iron-cost']}</td>`);
  table.push(`<td class="cost-col">${currData['gold-cost']}</td>`);
  table.push(`<td class="verification-col verified">Verified</td>`);
  table.push('</tr>');
}

let dataOutput = '';

for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
  let contentClass = (tableIndex === 0)?'':'class="hidden"';
  const dataContent = dataContentTemplate
    .replace('{{INDEX}}', tableIndex)
    .replace('{{CONTENT-CLASS}}', contentClass)
    .replace('{{DATA}}', tables[tableIndex].join('\n'));

  dataOutput += dataContent;
}

const htmlTemplate = fs.readFileSync('template.html', 'utf-8');
const htmlOutput = htmlTemplate.replace('{{DATA}}', dataOutput);

fs.writeFileSync(`${exportFileFragment}.html`, htmlOutput, {encoding:'utf8',flag:'w'});
