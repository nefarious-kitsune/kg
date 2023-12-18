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

const dataFiles = [
  'data-1.tsv',
  'data-2.tsv',
  'data-3.tsv',
  'data-4.tsv',
];

const tables = [ [], [], [], []];
const _parseInt = (str) => (str === '')?null:parseInt(str);
const missingData = '<td class="cost-col missing">&nbsp;</td>';

for (let tableIndex = 0; tableIndex < 4; tableIndex++) {
  const data = fs.readFileSync(dataFiles[tableIndex], 'utf-8').split('\n');
  const table = tables[tableIndex];

  for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
    const cols = data[rowIdx].split('\t');
    const level = parseInt(cols[0]);
    // const nextLevel = parseInt(cols[1]);
    const stoneCost = _parseInt(cols[2]);
    const woodCost = _parseInt(cols[3]);
    const ironCost = _parseInt(cols[4]);
    const goldCost = cols[5];
    const goldUnit = cols[6];

    table.push(`<tr id="level-${level}">`)
    table.push(`<td class="level-col">${level} → ${level+1}</td>`);

    if (stoneCost === null) table.push(missingData);
    else table.push(`<td class="cost-col">${stoneCost}</td>`);

    if (woodCost === null) table.push(missingData);
    else table.push(`<td class="cost-col">${woodCost}</td>`);

    if (ironCost === null) table.push(missingData);
    else table.push(`<td class="cost-col">${ironCost}</td>`);

    if (goldCost === '') table.push(missingData);
    else table.push(`<td class="cost-col">${goldCost}<span class="costUnit">${goldUnit}</span></td>`);

    table.push('</tr>');

    if ((stoneCost !== null) && (goldCost !== '')) {
      compiledData.data.push(
        {
          'level': _parseInt(level),
          'stone-cost': stoneCost,
          'wood-cost': woodCost,
          'iron-cost': ironCost,
          'gold-cost': goldCost + goldUnit,
          'verified': true,
        }
      )
    }
    
  }  
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
