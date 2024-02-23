import fs from 'fs';
import {getDateFormatStrings} from '../../utils/date-utils.js';

const exportDirectory = '../../../docs/data';
// const jsFileName = 'magic-stone-upgrade-cost.js';
// const jsonFileName = 'magic-stone-upgrade-cost.json';
const htmlFileName = 'magic-stone-upgrade-cost.html';
// const sheetLink = '';

const tableName = 'Magic Stone Upgrade';

// const tableDate = new Date();
// const fmtTableDate = getDateFormatStrings(tableDate);
// const tableDataCode = `${fmtTableDate.YYYY}-${fmtTableDate.MM}-${fmtTableDate.DD}`

const upgradeCost = [
  [30, 5],
  [90, 20],
  [430, 80],
  [2110, 400],
  [10530, 2000],
  [52640, 10000],
  [263160, 50000],
  [1315790, 250000],
  [6578950, 1250000],
];

const maxTier = upgradeCost.length;

const upgradeTables = [];

const tabbedContentTemplate = fs.readFileSync('upgrade-content.html', 'utf-8');

let tabbedContent = '';

for (let tier = 0; tier < maxTier; tier++) {
  const tableBody = [];
  upgradeTables.push(tableBody);
  const [strPotion, forPotion] = upgradeCost[tier];

  for (let level=0; level < 20; level++) {
    tableBody.push(`<tr>`)
    tableBody.push(`<td class="level-col">${level} <span class="next-level">» ${level+1}</span></td>`);
    tableBody.push(`<td class="cost-col">${strPotion}</td>`);
    tableBody.push(`<td class="cost-col">${level>=10?forPotion:''}</td>`);
    tableBody.push('</tr>');
  }

  const content = tabbedContentTemplate
    .replace('{{TABLE BODY}}', tableBody.join('\n'))
    .replace('{{RESOURCE 1 COUNT}}', strPotion * 20)
    .replace('{{RESOURCE 2 COUNT}}', forPotion * 10)
    .replace('{{TIER NUMBER}}', tier+1)
    .replace('{{CONTENT INDEX}}', tier)
    ;

  tabbedContent += content + '\n';
}

const htmlTemplate = fs.readFileSync('upgrade.html', 'utf-8');
const htmlOutput = htmlTemplate
  .replace('{{TABBED CONTENT}}', tabbedContent)
  ;

fs.writeFileSync(
  `${exportDirectory}/${htmlFileName}`,
  htmlOutput,
  {encoding:'utf8', flag:'w'}
);
