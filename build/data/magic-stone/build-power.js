import fs from 'fs';
import {getDateFormatStrings} from '../../utils/date-utils.js';

const exportDirectory = '../../../docs/data';
// const jsFileName = 'magic-stone-power.js';
// const jsonFileName = 'magic-stone-power.json';
const htmlFileName = 'magic-stone-power.html';

const maxTier = 9;

function readTsvFile(fName) {
  return fs.readFileSync(fName, 'utf-8').split('\n');
}

const powerData = readTsvFile('magic-stone-power.tsv');

const powerBonus = [];

for (let tierIdx = 0; tierIdx < maxTier; tierIdx++) {
  powerBonus.push([]);
}

for (let rowIdx = 0; rowIdx < powerData.length; rowIdx++) {
  let rowData = powerData[rowIdx].split('\t');
  for (let tierIdx = 0; tierIdx < maxTier; tierIdx++) {
    const bonus = parseFloat(rowData[tierIdx * 2]);
    powerBonus[tierIdx].push(bonus);
  }
}

const tabbedContentTemplate = fs.readFileSync('power-content.html', 'utf-8');
let tabbedContent = '';

for (let tierIdx = 0; tierIdx < 9; tierIdx++) {
  const tbody = [];
  let previousBonus = 0;
  let bonus = 0;

  for (let levelIdx = 0; levelIdx < 20; levelIdx++) {
    bonus = powerBonus[tierIdx][levelIdx];
    
    tbody.push(`<tr">`)
    tbody.push(`<td class="level-col">${levelIdx + 1}</td>`);

  
    if (levelIdx > 0) {
      const bonusIncrease = bonus - previousBonus;

      tbody.push(
        '<td class="power-col"><span class="delta">' +
        `+${bonusIncrease.toFixed(1)}<span class="unit">%</span>` +
        '</span></td>');
      previousBonus = bonus;
    } else {
      tbody.push(`<td class="power-col"></td>`);
    }
  
    tbody.push(
      '<td class="power-col">' +
      `+${bonus.toFixed(1)}<span class="unit">%</span>` +
      '</span></td>'
    );
    tbody.push('</tr>');
  }

  const content = tabbedContentTemplate
    .replace('{{TABLE BODY}}', tbody.join('\n'))
    .replace('{{MAX UPGRADE}}', bonus.toFixed(1))
    .replace('{{TIER NUMBER}}', tierIdx+1)
    .replace('{{CONTENT INDEX}}', tierIdx)
    ;

  tabbedContent += content + '\n';
}

const htmlTemplate = fs.readFileSync('power.html', 'utf-8');
const htmlOutput = htmlTemplate
  .replace('{{TABBED CONTENT}}', tabbedContent);


fs.writeFileSync(
  `${exportDirectory}/${htmlFileName}`,
  htmlOutput,
  {encoding:'utf8', flag:'w'}
);
