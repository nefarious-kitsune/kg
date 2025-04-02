import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

import {MagicGearDatabase} from './build-data.js';
const maxTier = MagicGearDatabase.gears.length - 1;

/** @typedef {import('./build-data.js').MagicGearData} MagicGearData */

const ModulePath = dirname(fileURLToPath(import.meta.url));
const TemplatePath = resolve(ModulePath, '../__templates/');
const OutputPath = resolve(ModulePath, '../__generated/');

/**
 * @param {string} fPath
 * @return {string}
 */
const readTemplate =
  (fPath) => readFileSync(resolve(TemplatePath, fPath), 'utf8');
const gearPageTemplate = readTemplate('./gear.html');
const gearPowerRowTemplate = readTemplate('./gear-power-row.html');
const gearUpgradeRowTemplate = readTemplate('./gear-upgrade-row.html');
const hintTemplate = readTemplate('./gear-hint.html');

const hints = [];
const index = [];

const formatBonus = (bonus) => bonus.toFixed(1);
// const formatBonus = (bonus) => bonus;

/**
 * Build tiered Hero Gear content
 * @param {MagicGearData} gearData
 */
function buildGearContent(gearData) {
  const tier = gearData.tier;
  const itemName = `T${tier} Magic Stone`;

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
    return gearUpgradeRowTemplate
        .replace('{{PREV LEVEL}}', data['upgrade-from'])
        .replace('{{LEVEL}}', data['upgrade-to'])
        .replace('{{COST 1}}', (cost1===0?'':cost1))
        .replace('{{COST 2}}', (cost2===0?'':cost2))
        .replaceAll('{{COST CLASS}}', costClass)
    ;
  });

  // Make power bonus table
  const powerBody = gearData['power-bonus'].map((data) => {
    const verified = data.verified;
    const bonus = verified?formatBonus(data.bonus):'?';
    const bonusClass = verified?'number':'unknown-number';
    return gearPowerRowTemplate
        .replace('{{LEVEL}}', data.level)
        .replace('{{BONUS}}', bonus)
        .replace('{{BONUS CLASS}}', bonusClass)
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

  // Left/right navigation link
  const prevLink = (tier > 1)?
    `  <div class="left-arrow"><a href="./t${tier-1}-gear">↞</a></div>`:
    '';
  const nextLink = (tier < maxTier)?
    `  <div class="right-arrow"><a href="./t${tier+1}-gear">↠</a></div>`:
    '';

  const totalCostClass = totalCostVerified?'number':'unknown-number';
  totalCost1 = totalCostVerified?totalCost1:'?';
  totalCost2 = totalCostVerified?totalCost2:'?';

  const gearPageContent = gearPageTemplate
      .replaceAll('{{TIER}}', tier)
      .replaceAll('{{ITEM NAME}}', itemName)
      .replaceAll('{{GEAR NAME 1}}', gearData.names[0])
      .replaceAll('{{GEAR NAME 2}}', gearData.names[1])
      .replaceAll('{{GEAR NAME 3}}', gearData.names[2])
      .replaceAll('{{GEAR NAME 4}}', gearData.names[3])
      .replace('{{UPGRADE BODY}}', upgradeBody.join('\n'))
      .replaceAll('{{TOTAL COST 1}}', totalCost1)
      .replaceAll('{{TOTAL COST 2}}', totalCost2)
      .replaceAll('{{TOTAL COST CLASS}}', totalCostClass)
      .replace('{{POWER BODY 1}}', powerBody.slice(0, 10).join('\n'))
      .replace('{{POWER BODY 2}}', powerBody.slice(10).join('\n'))
      .replaceAll('{{MAX BONUS}}', maxBonus)
      .replaceAll('{{MAX BONUS CLASS}}', maxBonusClass)
      .replace('{{PREV LINK}}', prevLink)
      .replace('{{NEXT LINK}}', nextLink)
  ;

  writeFileSync(
      resolve(ModulePath, `../magic-stone-t${tier}.html`),
      gearPageContent,
  );

  hints.push(hintTemplate
      .replace('{{TIER}}', tier)
      .replace('{{TOTAL COST 1}}', totalCost1)
      .replace('{{TOTAL COST 2}}', totalCost2)
      .replaceAll('{{MAX BONUS}}', maxBonus)
      ,
  );

  index.push(
      `<li><a href="./magic-stone-t${tier}}">T${tier} Magic Stone</a></li>`,
  );
}

MagicGearDatabase.gears.forEach((data) => buildGearContent(data));

writeFileSync(resolve(OutputPath, `./hints.html`), hints.join('\n'));
writeFileSync(resolve(OutputPath, `./index.html`), index.join('\n'));
