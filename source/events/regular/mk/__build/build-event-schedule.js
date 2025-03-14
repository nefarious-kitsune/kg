import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../../../');

import {MKEventDatabase} from './build-data.js';

/**
 * @typedef {import('./build-data.js').MKSeasonalData} MKSeasonalData
 * @typedef {import('./build-data.js').MKRewardName} MKRewardName
 */

const rewardNames = {
  'blueprint': 'Blueprint',
  'magic-dust': 'Magic Dust',
  'forge-blueprint': 'Forge Blueprint',
  'magic-book': 'Magic Book',
};

/**
 * Get MK seasons with an reward
 * @param {MKRewardName} reward - Name of the reward
 * @return {MKSeasonalData[]}
 */
function getSeasons(reward) {
  return MKEventDatabase.seasons.filter((s) => (
    (s['top-3-reward'].reward === reward) ||
    (s['phase-reward'].reward === reward)
  ));
}

const rowTemplate =
  readFileSync(resolve(ModulePath, '../__templates/mk-row.md'), 'utf8');
const rowTemplateFirst =
  readFileSync(resolve(ModulePath, '../__templates/mk-row-first.md'), 'utf8');

/**
 * Build MK event schedule for a particular reward
 * @param {MKSeasonalData[]} seasons - Seasonal schedule
 * @return {string}
 */
function buildMKSchedule(seasons) {
  const tBody = [];

  const s1 = seasons.shift();
  const rewardA = s1['top-3-reward'];
  const rewardB = s1['top-20-reward'];
  const rewardC = s1['phase-reward'];
  const verifiedClass = s1.verified?'verified':'unverified';
  tBody.push(rowTemplateFirst
      .replaceAll('{{SEASON NAME}}', s1['season-name'])
      .replaceAll('{{VERIFIED}}', verifiedClass)
      .replaceAll('{{TIER A}}', rewardA.tier)
      .replaceAll('{{REWARD A}}', rewardA.reward)
      .replaceAll('{{REWARD NAME A}}', rewardNames[rewardA.reward])
      .replaceAll('{{TIER B}}', rewardB.tier)
      .replaceAll('{{REWARD B}}', rewardB.reward)
      .replaceAll('{{REWARD NAME B}}', rewardNames[rewardB.reward])
      .replaceAll('{{TIER C}}', rewardC.tier)
      .replaceAll('{{REWARD C}}', rewardC.reward)
      .replaceAll('{{REWARD NAME C}}', rewardNames[rewardC.reward])
      ,
  );

  seasons.forEach((s) => {
    const rewardA = s['top-3-reward'];
    const rewardB = s['top-20-reward'];
    const rewardC = s['phase-reward'];
    const verifiedClass = s.verified?'verified':'unverified';
    tBody.push(rowTemplate
        .replaceAll('{{SEASON NAME}}', s['season-name'])
        .replaceAll('{{VERIFIED}}', verifiedClass)
        .replaceAll('{{TIER A}}', rewardA.tier)
        .replaceAll('{{REWARD A}}', rewardA.reward)
        .replaceAll('{{REWARD NAME A}}', rewardNames[rewardA.reward])
        .replaceAll('{{TIER B}}', rewardB.tier)
        .replaceAll('{{REWARD B}}', rewardB.reward)
        .replaceAll('{{REWARD NAME B}}', rewardNames[rewardB.reward])
        .replaceAll('{{TIER C}}', rewardC.tier)
        .replaceAll('{{REWARD C}}', rewardC.reward)
        .replaceAll('{{REWARD NAME C}}', rewardNames[rewardC.reward])
        ,
    );
  });
  return tBody.join('\n');
}

let templatePath = '';
let tBody;
let seasons;

// Build Forge Blueprint schedule
templatePath =
  resolve(ProjectPath, './city/blacksmith/hero-gears/acquire/__templates');
seasons = getSeasons('forge-blueprint');
tBody = buildMKSchedule(seasons);
writeFileSync(`${templatePath}/mk.html`, tBody);

// Build Forge Blueprint schedule
templatePath =
  resolve(ProjectPath, './city/witchs-lab/magic-stones/acquire/__templates');
seasons = getSeasons('magic-dust');
tBody = buildMKSchedule(seasons);
writeFileSync(`${templatePath}/mk.html`, tBody);
