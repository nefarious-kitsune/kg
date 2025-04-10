import path from 'path';

import {readTextFile, saveTextFile} from '../../../../../dev/files/files.js';
import {dirs} from './dirs.js';

/** @typedef {import('./typedef.js').MagicStoneData} MagicStoneData */
/** @typedef {import('./typedef.js').MagicStoneDatabase} MagicStoneDatabase */

import {MagicStoneDatabase} from './load-data.js';

const templates = {
  'page': readTextFile(`${dirs.__temp}/gear.md`),
  'page-power-row': readTextFile(`${dirs.__temp}/gear-power-row.md`),
  'page-upgrade-row': readTextFile(`${dirs.__temp}/gear-upgrade-row.md`),
  'hint': readTextFile(`${dirs.__temp}/gear-hint.md`),
  'gear-list-item': readTextFile(`${dirs.__temp}/gear-list-item.md`),
};

const gearHints = [];
const gearList = [];

const pagination = MagicStoneDatabase['magic-stones'].map((data) => {
  const linkText = `T${data.tier}`;
  const linkUrl = `/city/witchs-lab/magic-stones//magic-stone-t${data.tier}`;
  return `  - [${linkText}](${linkUrl})`;
}).join('\n');

const formatBonus = (bonus) => bonus.toFixed(1);
// const formatBonus = (bonus) => bonus;

/**
 * Build tiered Hero Gear content
 * @param {MagicGearData} gearData
 */
function buildGearContent(gearData) {
  const tier = gearData.tier;

  let totalCost1 = 0;
  let totalCost2 = 0;
  let totalCostVerified = true;

  // Make upgrade table
  const upgradeBody = gearData.upgrade.map((data) => {
    const verified = data.verified;
    const cost1 = verified?data['strengthening-potion']:'?';
    const cost2 = verified?data['fortune-potion']:'?';
    const costClass = verified?'number':'unknown-number';
    if (verified) {
      totalCost1 += cost1;
      totalCost2 += cost2;
    } else {
      totalCostVerified = false;
    }
    return templates['page-upgrade-row']
        .replace('{{PREV-LEVEL}}', data['upgrade-from'])
        .replace('{{LEVEL}}', data['upgrade-to'])
        .replace('{{COST-1}}', (cost1===0?'':cost1))
        .replace('{{COST-2}}', (cost2===0?'':cost2))
        .replaceAll('{{COST-CLASS}}', costClass)
    ;
  });

  // Make power bonus table
  const powerBody = gearData['power-bonus'].map((data) => {
    const verified = data.verified;
    const bonus = verified?formatBonus(data.bonus):'?';
    const bonusClass = verified?'number':'unknown-number';
    return templates['page-power-row']
        .replace('{{LEVEL}}', data.level)
        .replace('{{BONUS}}', bonus)
        .replace('{{BONUS-CLASS}}', bonusClass)
    ;
  });

  let maxBonus;
  let maxBonusClass;
  const maxBonusData = gearData['power-bonus'][19];
  if (maxBonusData.verified) {
    maxBonus = formatBonus(maxBonusData.bonus);
    maxBonusClass = 'number';
  } else {
    maxBonus = '?';
    maxBonusClass = 'unknown-number';
  }

  const totalCostClass = totalCostVerified?'number':'unknown-number';
  totalCost1 = totalCostVerified?totalCost1:'?';
  totalCost2 = totalCostVerified?totalCost2:'?';

  const gearPageContent = templates['page']
      .replaceAll('{{TIER}}', tier)
      .replaceAll('{{GEAR-NAME-1}}', gearData.names[0])
      .replaceAll('{{GEAR-NAME-2}}', gearData.names[1])
      .replaceAll('{{GEAR-NAME-3}}', gearData.names[2])
      .replaceAll('{{GEAR-NAME-4}}', gearData.names[3])
      .replace('{{UPGRADE-BODY}}', upgradeBody.join('\n'))
      .replaceAll('{{TOTAL-COST-1}}', totalCost1)
      .replaceAll('{{TOTAL-COST-2}}', totalCost2)
      .replaceAll('{{TOTAL-COST-CLASS}}', totalCostClass)
      .replace('{{POWER-BODY-1}}', powerBody.slice(0, 10).join('\n'))
      .replace('{{POWER-BODY-2}}', powerBody.slice(10).join('\n'))
      .replaceAll('{{MAX-BONUS}}', maxBonus)
      .replaceAll('{{MAX-BONUS-CLASS}}', maxBonusClass)
      .replace('{{PAGINATION-LINKS}}', pagination)
  ;

  saveTextFile(
      path.join(dirs.__content, `/magic-stone-t${tier}.md`),
      gearPageContent,
  );

  gearHints.push(templates.hint
      .replace('{{TIER}}', tier)
      .replace('{{TOTAL-COST-1}}', totalCost1)
      .replace('{{TOTAL-COST-2}}', totalCost2)
      .replaceAll('{{MAX-BONUS}}', maxBonus)
      ,
  );

  gearList.push(templates['gear-list-item'].replaceAll('{{TIER}}', tier));
}

MagicStoneDatabase['magic-stones'].forEach((data) => buildGearContent(data));

saveTextFile(
    path.join(dirs.__generated, `/gear-hints.md`),
    gearHints.join('\n'),
);

saveTextFile(
    path.join(dirs.__generated, `/gear-index.md`),
    gearList.join('\n'),
);
