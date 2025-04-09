import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

import {MagicGearDatabase} from './build-data.js';
const maxTier = MagicGearDatabase.gears.length - 1;

/** @typedef {import('./build-data.js').MagicGearData} MagicGearData */

const BaseDir = resolve(dirname(fileURLToPath(import.meta.url)), '../');
const TemplateDir = `${BaseDir}/__templates/`;
const GeneratedDir = `${BaseDir}/__generated/`;

const loadFile = (path) => readFileSync(path, 'utf8');
const saveFile = (path, content) => writeFileSync(path, content);

const templates = {
  'page': loadFile(`${TemplateDir}/gear.md`),
  'page-power-row': loadFile(`${TemplateDir}/gear-power-row.md`),
  'page-upgrade-row': loadFile(`${TemplateDir}/gear-upgrade-row.md`),
  'hint': loadFile(`${TemplateDir}/gear-hint.md`),
  'gear-list-item': loadFile(`${TemplateDir}/gear-list-item.md`),
};

const gearHints = [];
const gearList = [];

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

  // Left/right navigation link
  const prevLink = (tier > 1)?`./magic-stone-t${tier-1}`:'';
  const nextLink = (tier < maxTier)?`./magic-stone-t${tier+1}`:'';

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
      .replace('{{PREV-LINK}}', prevLink)
      .replace('{{NEXT-LINK}}', nextLink)
  ;

  saveFile(`${BaseDir}/magic-stone-t${tier}.md`, gearPageContent);

  gearHints.push(templates.hint
      .replace('{{TIER}}', tier)
      .replace('{{TOTAL-COST-1}}', totalCost1)
      .replace('{{TOTAL-COST-2}}', totalCost2)
      .replaceAll('{{MAX-BONUS}}', maxBonus)
      ,
  );

  gearList.push(templates['gear-list-item'].replaceAll('{{TIER}}', tier));
}

MagicGearDatabase.gears.forEach((data) => buildGearContent(data));

writeFileSync(resolve(GeneratedDir, `./gear-hints.md`), gearHints.join('\n'));
writeFileSync(resolve(GeneratedDir, `./gear-index.md`), gearList.join('\n'));
