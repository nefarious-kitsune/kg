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

const missingRanges = [];

const tables = [ [], [], [], []];

const parseIntCost = (str) => {
  if (str.trim().length === 0) {
    return [null, false];
  };

  const cost = parseInt(str);
  if (isNaN(cost)) {
    return [null, false];
  } else {
    return [cost, str.indexOf('?') === -1];
  }
}

const parseDecCost = (str) => {
  if (str.trim().length === 0) {
    return [null, false];
  };

  const cost = parseFloat(str);
  if (isNaN(cost)) {
    return [null, false];
  } else {
    return [cost, str.indexOf('?') === -1];
  }
}


const missingData = '<td class="cost-col"><span class="unverified">&nbsp;</span></td>';
const dataCell = (n, verified) => {
  if (n === null) return missingData;
  if (!verified) return `<td class="cost-col"><span class="unverified">${n}</span></td>`;
  return `<td class="cost-col">${n}</td>`;
};

for (let tableIndex = 0; tableIndex < 4; tableIndex++) {
  const data = fs.readFileSync(dataFiles[tableIndex], 'utf-8').split('\n');
  const table = tables[tableIndex];

  for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
    const row = data[rowIdx];
    const cols = row.split('\t');
    const level = parseInt(cols[0]);
    // const nextLevel = parseInt(cols[1]);
    const [stoneCost, stoneCostVerified] = parseIntCost(cols[2]);
    const [woodCost, woodCostVerified] = parseIntCost(cols[3]);
    const [ironCost, ironCostVerified] = parseIntCost(cols[4]);
    const [goldCost, goldCostVerified] = parseDecCost(cols[5]);
    const goldUnit = cols[6];
    const verified = (
      stoneCostVerified &&
      woodCostVerified &&
      ironCostVerified &&
      goldCostVerified
    );

    table.push(`<tr id="level-${level}">`)
    table.push(`<td class="level-col">${level} → ${level+1}</td>`);

    table.push(dataCell(stoneCost, stoneCostVerified));
    table.push(dataCell(woodCost, woodCostVerified));
    table.push(dataCell(ironCost, ironCostVerified));

    if (goldCost === null) table.push(missingData);
    else {
      if (!goldCostVerified) {
        table.push(
          '<td class="cost-col">' +
          '<span class="unverified">' +
          goldCost + 
          '<span class="costUnit">' + goldUnit + '</span>' +
          '</span>'+
          '</td>'
        )
      } else {
        table.push(
          '<td class="cost-col">' +
          goldCost + 
          '<span class="costUnit">' + goldUnit + '</span>' +
          '</td>'
        )
      }
    }

    table.push('</tr>');

    if (verified) {
      compiledData.data.push(
        {
          'level': level,
          'stone-cost': stoneCost,
          'wood-cost': woodCost,
          'iron-cost': ironCost,
          'gold-cost': goldCost + goldUnit,
          'verified': verified,
        }
      )
    } else {
      if (missingRanges.length) {
        const lastRange = missingRanges[missingRanges.length-1];
        if (level === lastRange.end + 1) {
          lastRange.end++;
        } else {
          missingRanges.push({start: level, end: level});  
        }
      } else {
        missingRanges.push({start: level, end: level});
      }
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
</tr>
</thead>
<tbody>
{{DATA}}
</tbody>
</table>
</div>\n`;

// Report missing ranges:
let report = '';
let missingCount = 0;
for (let i=0; i < missingRanges.length; i++) {
  const range = missingRanges[i];
  if (range.start === range.end) report += range.start + ', ';
  else report += range.start + '-' + range.end + ', ';

  missingCount += (range.end - range.start) + 1;
}

report = report.substring(0, report.length - 2);

console.log('the following data are missing:' + report);
console.log('missing ' + missingCount + ' data');

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
const htmlOutput = htmlTemplate
  .replace('{{DATA}}', dataOutput)
  .replace('{{MISSING RANGES}}', report);

fs.writeFileSync(`${exportFileFragment}.html`, htmlOutput, {encoding:'utf8',flag:'w'});

