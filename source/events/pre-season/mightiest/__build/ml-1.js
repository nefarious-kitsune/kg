import {readFileSync, writeFileSync} from 'fs';

const tsvData = readFileSync('../__data/ML-1.tsv', {encoding: 'utf8'})
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
    if (phaseNumber !== 2) phaseTable[5].push(tableRow);
  }
});

let output = '';

const phaseNames = ['Unit', 'Castle', 'Dragon', 'Hero', 'Weapon', 'Power'];

phaseTable.forEach((phaseLines, phaseIndex) =>{
  output +=
    `<section id="${phaseNames[phaseIndex]}-Phase" class="phase-points">\n` +
    `<h4>${phaseNames[phaseIndex]}</h4>\n` +
    '<table class="border-row ml-phase-table">\n' +
    phaseLines.join('\n') + '\n' +
    '</table>\n' +
    '</section>\n';
});

writeFileSync('../__temp/--ml-1.md', output);
