import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));

const maxTier = 10;
const database = {
  'title': 'Witch\'s Lab Magic Stone Power and Levelling',
  'power-bonus': {
    t1: [], t2: [], t3: [],
    t4: [], t5: [], t6: [],
    t7: [], t8: [], t9: [],
    t10: [],
  },
  'levelling': {
    t1: [], t2: [], t3: [],
    t4: [], t5: [], t6: [],
    t7: [], t8: [], t9: [],
    t10: [],
  },
};

const powerData = readFileSync(
    resolve(ModulePath, '../__data/magic-stone-power.tsv'),
    {encoding: 'utf8'},
).split('\n');

for (let rowIdx = 0; rowIdx < powerData.length; rowIdx++) {
  const rowData = powerData[rowIdx].split('\t');
  for (let tierIdx = 0; tierIdx < maxTier; tierIdx++) {
    const bonus = parseFloat(rowData[tierIdx]);
    database['power-bonus'][`t${tierIdx+1}`].push(bonus);
  }
}

const tableRowTemplate = readFileSync(
    resolve(ModulePath, '../__templates/power-row.md'), {encoding: 'utf8'});

const powerPageTemplate = readFileSync(
    resolve(ModulePath, '../__templates/power.md'), {encoding: 'utf8'});

for (let tierIdx = 0; tierIdx < maxTier; tierIdx++) {
  const tbody = [];

  for (let levelIdx = 0; levelIdx < 20; levelIdx++) {
    const bonus = database['power-bonus'][`t${tierIdx+1}`][levelIdx];
    tbody.push(
        tableRowTemplate
            .replace('{{FROM LEVEL}}', levelIdx+1)
            .replace('{{POWER}}', bonus.toFixed(1)),
    );
  }

  const pageContent = powerPageTemplate
      .replaceAll('{{TIER}}', tierIdx+1)
      .replace('{{BODY}}', tbody.join('\n'));

  writeFileSync(
      resolve(ModulePath, `../t${tierIdx+1}-power.html`),
      pageContent,
  );
}

// eslint-disable-next-line no-unused-vars
const levellingCost = [
  /*  T1 */ [30, 5],
  /*  T2 */ [90, 20],
  /*  T3 */ [430, 80],
  /*  T4 */ [2110, 400],
  /*  T5 */ [10530, 2000],
  /*  T6 */ [52640, 10000],
  /*  T7 */ [263160, 50000],
  /*  T8 */ [1315790, 250000],
  /*  T9 */ [6578950, 1250000],
  /* T10 */ [32894740, 6250000],
  /* T11 */ [164473690, null],
];

// {'from': 1, 'to': 2, 'strengthening-potion':0,'fortune-potion': 0 }
