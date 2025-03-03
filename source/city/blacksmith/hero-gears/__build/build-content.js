import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

import {heroGearDatabase} from './build-data.js';
import {getHeroGearDesc} from '../../__build/get-tier-desc.js';

const ModulePath = dirname(fileURLToPath(import.meta.url));

const powerRowTemplate = readFileSync(
    resolve(ModulePath, '../__templates/power-row.md'), {encoding: 'utf8'});

const upgradeRowTemplate = readFileSync(
    resolve(ModulePath, '../__templates/upgrade-row.md'), {encoding: 'utf8'});

const gearPageTemplate = readFileSync(
    resolve(ModulePath, '../__templates/gear.md'), {encoding: 'utf8'});

const maxTier = 1;

/**
 * Build tier weapon table
 * @param {*} tier - Tier
 */
function buildTierTable(tier) {
  const powerTBody = [];
  const upgradeTBody = [];
  let totalCost1 = 0;
  let totalCost2 = 0;

  for (let levelIdx = 0; levelIdx < 20; levelIdx++) {
    const bonus = heroGearDatabase['power-bonus'][`t${tier}`][levelIdx];
    powerTBody.push(
        powerRowTemplate
            .replace('{{FROM LEVEL}}', levelIdx+1)
            .replace('{{POWER}}', parseFloat(bonus).toFixed(1)),
    );
  }

  for (let levelIdx = 0; levelIdx < 19; levelIdx++) {
    const upgradeData = heroGearDatabase['upgrade'][`t${tier}`][levelIdx];
    const cost1 = upgradeData['elemental-vial'];
    const cost2 = upgradeData['blood-of-titan'];
    totalCost1 += cost1;
    totalCost2 += cost2;
    upgradeTBody.push(
        upgradeRowTemplate
            .replace('{{FROM LEVEL}}', levelIdx+1)
            .replace('{{TO LEVEL}}', levelIdx+2)
            .replace('{{COST 1}}', cost1)
            .replace('{{COST 2}}', cost2),
    );
  }

  const maxBonus = heroGearDatabase['power-bonus'][`t${tier}`][19];

  const prevLink = (tier > 1)?
    `  <div class="left-arrow"><a href="./t${tier-1}">↞</a></div>`:
    '';

  const nextLink = (tier < maxTier)?
    `  <div class="right-arrow"><a href="./t${tier+1}">↠</a></div>`:
    '';

  const gearPageContent = gearPageTemplate
      .replaceAll('{{TIER}}', tier)
      .replaceAll('{{TIER DESC}}', getHeroGearDesc(tier))
      .replace('{{PREV LINK}}', prevLink)
      .replace('{{NEXT LINK}}', nextLink)
      .replace('{{TOTAL COST 1}}', totalCost1)
      .replace('{{TOTAL COST 2}}', totalCost2)
      .replace('{{MAX POWER BONUS}}', parseFloat(maxBonus).toFixed(1))
      .replace('{{POWER BODY 1}}', powerTBody.slice(0, 10).join('\n'))
      .replace('{{POWER BODY 2}}', powerTBody.slice(10).join('\n'))
      .replace('{{UPGRADE BODY}}', upgradeTBody.join('\n'));

  writeFileSync(
      resolve(ModulePath, `../T${tier}-gear.html`),
      gearPageContent,
  );
}

buildTierTable(1);
