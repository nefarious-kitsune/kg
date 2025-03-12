import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

import {heroGearDatabase, maxTier} from './build-data.js';

/** @typedef {import('./build-data.js').HeroGearData} HeroGearData */

const ModulePath = dirname(fileURLToPath(import.meta.url));

const powerRowTemplate = readFileSync(
    resolve(ModulePath, '../__templates/power-row.md'), {encoding: 'utf8'});

const upgradeRowTemplate = readFileSync(
    resolve(ModulePath, '../__templates/upgrade-row.md'), {encoding: 'utf8'});

const gearPageTemplate = readFileSync(
    resolve(ModulePath, '../__templates/gear.md'), {encoding: 'utf8'});

// const formatBonus = (bonus) => bonus.toFixed(1);
const formatBonus = (bonus) => bonus;

/**
 * Build tiered Hero Gear content
 * @param {HeroGearData} gearData
 */
function buildTierContent(gearData) {
  const tier = gearData.tier;

  // Make upgrade table
  const upgradeTBody = [];
  let totalCost1 = 0;
  let totalCost2 = 0;
  let totalCostVerified = true;

  for (let levelIdx = 0; levelIdx < 19; levelIdx++) {
    const upgradeData = gearData.upgrade[levelIdx];
    const verified = upgradeData.verified;
    const cost1 = verified?upgradeData['elemental-vial']:'?';
    const cost2 = verified?upgradeData['blood-of-titan']:'?';
    if (verified) {
      totalCost1 += cost1;
      totalCost2 += cost2;
    } else {
      totalCostVerified = false;
    }
    upgradeTBody.push(
        upgradeRowTemplate
            .replace('{{FROM LEVEL}}', levelIdx+1)
            .replace('{{TO LEVEL}}', levelIdx+2)
            .replace('{{COST 1}}', (cost1===0?'':cost1))
            .replace('{{COST 2}}', (cost2===0?'':cost2))
            .replaceAll('{{COST CLASS}}', verified?'number':'unknown-number'),
    );
  }

  // Make power bonus table
  const bonusTBody = [];
  for (let levelIdx = 0; levelIdx < 20; levelIdx++) {
    const bonusData = gearData['power-bonus'][levelIdx];
    const verified = bonusData.verified;
    const bonus = verified?formatBonus(bonusData.bonus):'?';
    bonusTBody.push(
        powerRowTemplate
            .replace('{{FROM LEVEL}}', levelIdx+1)
            .replace('{{BONUS}}', bonus)
            .replace('{{BONUS CLASS}}', verified?'number':'unknown-number'),
    );
  }

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

  const itemName = `T${tier} Hero Gear`;
  let itemNameExpanded;
  if (gearData.names.length > 0) {
    itemNameExpanded = `T${tier} Hero Gear (${gearData.names.join(', ')})`;
  } else {
    itemNameExpanded = itemName;
  }

  const totalCostClass = totalCostVerified?'number':'unknown-number';
  totalCost1 = totalCostVerified?totalCost1:'?';
  totalCost2 = totalCostVerified?totalCost2:'?';

  const gearPageContent = gearPageTemplate
      .replaceAll('{{TIER}}', tier)
      .replaceAll('{{ITEM NAME}}', itemName)
      .replaceAll('{{ITEM NAME EXPANDED}}', itemNameExpanded)
      .replace('{{UPGRADE BODY}}', upgradeTBody.join('\n'))
      .replaceAll('{{TOTAL COST 1}}', totalCost1)
      .replaceAll('{{TOTAL COST 2}}', totalCost2)
      .replaceAll('{{TOTAL COST CLASS}}', totalCostClass)
      .replace('{{POWER BODY 1}}', bonusTBody.slice(0, 10).join('\n'))
      .replace('{{POWER BODY 2}}', bonusTBody.slice(10).join('\n'))
      .replaceAll('{{MAX BONUS}}', maxBonus)
      .replaceAll('{{MAX BONUS CLASS}}', maxBonusClass)
      .replace('{{PREV LINK}}', prevLink)
      .replace('{{NEXT LINK}}', nextLink)
  ;

  writeFileSync(
      resolve(ModulePath, `../T${tier}-gear.html`),
      gearPageContent,
  );
}

heroGearDatabase.gears.forEach((data) => buildTierContent(data));
