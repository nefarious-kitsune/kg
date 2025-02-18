import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));

const tsvDataFile = resolve(ModulePath, '../__data/ML-2.tsv');
const tsvData = readFileSync(tsvDataFile, {encoding: 'utf8'})
    .split('\n');

const phaseTable = [[], [], [], [], [], []];

tsvData.forEach((row) => {
  const cols = row.split('\t');
  const phaseNumber = parseInt(cols[0]);
  const itemName = cols[1];
  const baseQty = parseInt(cols[2]);
  const basePoint = parseInt(cols[3]);
  const desc = cols[4];

  const descCol = desc
      .replace('{{1}}', `<span class="number">${baseQty}</span>`)
      .replace('{{2}}', itemName);

  const pointCol = `+<span class="number monospace">${basePoint}</span>`;
  const tableRow = `<tr>\n  <td>${pointCol}</td>\n  <td>${descCol}</td>\n</tr>`;

  if (phaseNumber === 99) {
    phaseTable[0].push(tableRow);
    phaseTable[1].push(tableRow);
    phaseTable[2].push(tableRow);
    phaseTable[3].push(tableRow);
    phaseTable[4].push(tableRow);
    phaseTable[5].push(tableRow);
  } else {
    phaseTable[phaseNumber-1].push(tableRow);
    if (phaseNumber !== 3) phaseTable[5].push(tableRow);
  }
});

let output = '';

const phaseNames = ['Unit', 'Hero', 'Castle', 'Weapon', 'Dragon', 'Power'];

phaseTable.forEach((phaseLines, phaseIndex) =>{
  output +=
    `<section id="${phaseNames[phaseIndex]}-Phase" class="phase-points">\n` +
    `<h4>${phaseNames[phaseIndex]}</h4>\n` +
    '<table class="border-row ml-phase-table">\n' +
    phaseLines.join('\n') + '\n' +
    '</table>\n' +
    '</section>\n';
});

writeFileSync(resolve(ModulePath, '../__temp/--ml-2.md'), output);
