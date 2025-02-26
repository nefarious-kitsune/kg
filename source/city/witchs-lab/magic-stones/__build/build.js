import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));

const maxTier = 10;
export const database = {
  'title': 'Witch\'s Lab Magic Stone Power and Leveling',
  'power-bonus': {
    t1: [], t2: [], t3: [],
    t4: [], t5: [], t6: [],
    t7: [], t8: [], t9: [],
    t10: [],
  },
  'leveling': {
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

const levelingCost = [
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

for (let tierIdx = 0; tierIdx < maxTier; tierIdx++) {
  for (let levelIdx = 1; levelIdx < 20; levelIdx++) {
    const strPotionCost = levelingCost[tierIdx][0];
    const forPotionCost = (levelIdx>=10)?levelingCost[tierIdx][1]:0;
    database['leveling'][`t${tierIdx+1}`].push({
      'from': levelIdx,
      'to': levelIdx+1,
      'strengthening-potion': strPotionCost,
      'fortune-potion': forPotionCost,
    });
  }
}

const powerRowTemplate = readFileSync(
    resolve(ModulePath, '../__templates/power-row.md'), {encoding: 'utf8'});

const powerPageTemplate = readFileSync(
    resolve(ModulePath, '../__templates/power.md'), {encoding: 'utf8'});

const levelingRowTemplate = readFileSync(
    resolve(ModulePath, '../__templates/leveling-row.md'), {encoding: 'utf8'});

const levelingPageTemplate = readFileSync(
    resolve(ModulePath, '../__templates/leveling.md'), {encoding: 'utf8'});

for (let tierIdx = 0; tierIdx < maxTier; tierIdx++) {
  const powerBody1 = [];
  const powerBody2 = [];
  const levelingBody = [];

  for (let levelIdx = 0; levelIdx < 10; levelIdx++) {
    const bonus = database['power-bonus'][`t${tierIdx+1}`][levelIdx];
    powerBody1.push(
        powerRowTemplate
            .replace('{{FROM LEVEL}}', levelIdx+1)
            .replace('{{POWER}}', bonus.toFixed(1)),
    );
  }
  for (let levelIdx = 10; levelIdx < 20; levelIdx++) {
    const bonus = database['power-bonus'][`t${tierIdx+1}`][levelIdx];
    powerBody2.push(
        powerRowTemplate
            .replace('{{FROM LEVEL}}', levelIdx+1)
            .replace('{{POWER}}', bonus.toFixed(1)),
    );
  }
  const maxBonus = database['power-bonus'][`t${tierIdx+1}`][19];
  let totalStrPotionCost = 0;
  let totalForPotionCost = 0;
  for (let levelIdx = 0; levelIdx < 19; levelIdx++) {
    const levelingData = database['leveling'][`t${tierIdx+1}`][levelIdx];
    const strPotionCost = levelingData['strengthening-potion'];
    const forPotionCost = levelingData['fortune-potion'];
    totalStrPotionCost += strPotionCost;
    totalForPotionCost += forPotionCost;
    levelingBody.push(
        levelingRowTemplate
            .replace('{{FROM LEVEL}}', levelIdx+1)
            .replace('{{TO LEVEL}}', levelIdx+2)
            .replace('{{STRENGTHENING POTION COST}}', strPotionCost)
            .replace('{{FORTUNE POTION COST}}', forPotionCost),
    );
  }

  const powerPageContent = powerPageTemplate
      .replaceAll('{{TIER}}', tierIdx+1)
      .replace('{{BODY1}}', powerBody1.join('\n'))
      .replace('{{BODY2}}', powerBody2.join('\n'))
      .replace('{{TOTAL STRENGTHENING POTION COST}}', totalStrPotionCost)
      .replace('{{TOTAL FORTUNE POTION COST}}', totalForPotionCost)
      .replace('{{MAX POWER BONUS}}', maxBonus);

  const levelingPageContent = levelingPageTemplate
      .replaceAll('{{TIER}}', tierIdx+1)
      .replace('{{BODY}}', levelingBody.join('\n'))
      .replace('{{TOTAL STRENGTHENING POTION COST}}', totalStrPotionCost)
      .replace('{{TOTAL FORTUNE POTION COST}}', totalForPotionCost)
      .replace('{{MAX POWER BONUS}}', maxBonus);

  writeFileSync(
      resolve(ModulePath, `../t${tierIdx+1}-power.html`),
      powerPageContent,
  );
  writeFileSync(
      resolve(ModulePath, `../t${tierIdx+1}-leveling.html`),
      levelingPageContent,
  );
}
