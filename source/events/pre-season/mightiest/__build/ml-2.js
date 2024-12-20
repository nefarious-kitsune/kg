import {readFileSync, writeFileSync} from 'fs';

const tsvData = readFileSync('../__data/ML-2.tsv', {encoding: 'utf8'})
    .split('\n');

const phaseTable = [[], [], [], [], [], []];

tsvData.forEach((row) => {
  const cols = row.split('\t');
  const phaseNumber = parseInt(cols[0]);
  const itemName = cols[1];
  const baseQty = parseInt(cols[2]);
  const basePoint = parseInt(cols[3]);
  const desc = cols[4];

  if (phaseNumber > 6) return;

  const descCol = desc
      .replace('{{1}}', `<span class="number">${baseQty}</span>`)
      .replace('{{2}}', itemName);

  const pointCol = `+<span class="number monospace">${basePoint}</span>`;

  phaseTable[phaseNumber-1].push(
      '<tr>',
      `  <td>${pointCol}</td>`,
      `  <td>${descCol}</td>`,
      '</tr>',
  );

  phaseTable[5].push(
      '<tr>',
      `  <td>${pointCol}</td>`,
      `  <td>${descCol}</td>`,
      '</tr>',
  );
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

writeFileSync('../__temp/--ml-2.md', output);
