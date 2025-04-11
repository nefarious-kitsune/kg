import path from 'path';

import {readTextFile, saveTextFile} from '../../../../../dev/files/files.js';
import {dirs} from './dirs.js';

/** @typedef {import('./typedef.js').MKRewardName} MKRewardName */
/** @typedef {import('./typedef.js').MKSeasonalData} MKSeasonalData */
/** @typedef {import('./typedef.js').MKEventDatabase} MKEventDatabase */

import {MKEventDatabase} from './load-data.js';

const templates = {
  'mk-row': readTextFile(`${dirs.__temp}/mk-row.md`),
  'mk-first-row': readTextFile(`${dirs.__temp}/mk-first-row.md`),
  'be-row': readTextFile(`${dirs.__temp}/be-row.md`),
  'be-first-row': readTextFile(`${dirs.__temp}/be-first-row.md`),
  'be-throne-row': readTextFile(`${dirs.__temp}/be-row.md`),
};

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

/**
 * Build MK event schedule for a particular reward
 * @param {MKSeasonalData[]} seasons - Seasonal MK schedule
 * @return {string}
 */
function buildMKSchedule(seasons) {
  const tBody = [];

  const s1 = seasons[0];
  const rewardA = s1['top-3-reward'];
  const rewardB = s1['top-20-reward'];
  const rewardC = s1['phase-reward'];
  const verifiedClass = s1.verified?'verified':'unverified';
  tBody.push(templates['mk-first-row']
      .replaceAll('{{SEASON-NAME}}', s1['season-name'].replace('& ', '&amp; '))
      .replaceAll('{{VERIFIED}}', verifiedClass)
      .replaceAll('{{TIER-A}}', rewardA.tier)
      .replaceAll('{{REWARD-A}}', rewardA.reward)
      .replaceAll('{{REWARD-NAME-A}}', rewardNames[rewardA.reward])
      .replaceAll('{{TIER-B}}', rewardB.tier)
      .replaceAll('{{REWARD-B}}', rewardB.reward)
      .replaceAll('{{REWARD-NAME-B}}', rewardNames[rewardB.reward])
      .replaceAll('{{TIER-C}}', rewardC.tier)
      .replaceAll('{{REWARD-C}}', rewardC.reward)
      .replaceAll('{{REWARD-NAME-C}}', rewardNames[rewardC.reward])
      ,
  );

  for (let sIdx = 1; sIdx < seasons.length; sIdx++) {
    const s = seasons[sIdx];
    const rewardA = s['top-3-reward'];
    const rewardB = s['top-20-reward'];
    const rewardC = s['phase-reward'];
    const verifiedClass = s.verified?'verified':'unverified';
    tBody.push(templates['mk-row']
        .replaceAll('{{SEASON-NAME}}', s['season-name'].replace('& ', '&amp; '))
        .replaceAll('{{VERIFIED}}', verifiedClass)
        .replaceAll('{{TIER-A}}', rewardA.tier)
        .replaceAll('{{REWARD-A}}', rewardA.reward)
        .replaceAll('{{REWARD-NAME-A}}', rewardNames[rewardA.reward])
        .replaceAll('{{TIER-B}}', rewardB.tier)
        .replaceAll('{{REWARD-B}}', rewardB.reward)
        .replaceAll('{{REWARD-NAME-B}}', rewardNames[rewardB.reward])
        .replaceAll('{{TIER-C}}', rewardC.tier)
        .replaceAll('{{REWARD-C}}', rewardC.reward)
        .replaceAll('{{REWARD-NAME-C}}', rewardNames[rewardC.reward])
        ,
    );
  };
  return tBody.join('\n');
}

/**
 * Build MK event schedule for a particular reward
 * @param {MKSeasonalData[]} seasons - Seasonal MK schedule
 * @return {string}
 */
function buildBESchedule(seasons) {
  const tBody = [];

  let sIdx = 0;
  if (seasons[0].season === 0) sIdx = 1;

  const s = seasons[sIdx];
  const reward = s['top-3-reward'].reward;
  const tier = s['top-3-reward'].tier - 1;
  const verifiedClass = s.verified?'verified':'unverified';
  tBody.push(templates['be-first-row']
      .replaceAll('{{SEASON-NAME}}', s['season-name'].replace('& ', '&amp; '))
      .replaceAll('{{VERIFIED}}', verifiedClass)
      .replaceAll('{{REWARD}}', reward)
      .replaceAll('{{REWARD-NAME}}', rewardNames[reward])
      .replaceAll('{{TIER-A}}', tier)
      .replaceAll('{{TIER-B}}', tier - 1)
      .replaceAll('{{TIER-C}}', tier - 2)
      ,
  );

  for (sIdx++; sIdx < seasons.length; sIdx++) {
    const s = seasons[sIdx];
    const reward = s['top-3-reward'].reward;
    const tier = s['top-3-reward'].tier - 1;
    const verifiedClass = s.verified?'verified':'unverified';
    tBody.push(templates['be-row']
        .replaceAll('{{SEASON-NAME}}', s['season-name'].replace('& ', '&amp; '))
        .replaceAll('{{VERIFIED}}', verifiedClass)
        .replaceAll('{{REWARD}}', reward)
        .replaceAll('{{REWARD-NAME}}', rewardNames[reward])
        .replaceAll('{{TIER-A}}', tier)
        .replaceAll('{{TIER-B}}', tier - 1)
        .replaceAll('{{TIER-C}}', tier - 2)
        ,
    );
  };
  return tBody.join('\n');
}

/**
 * Build MK event schedule for a particular reward
 * @param {MKSeasonalData[]} seasons - Seasonal MK schedule
 * @return {string}
 */
function buildBEThroneSchedule(seasons) {
  const tBody = [];

  // Skip pre-season
  let sIdx = 1;

  for (sIdx++; sIdx < seasons.length; sIdx++) {
    const s = seasons[sIdx];
    const tier = s['top-3-reward'].tier - 1;
    const verifiedClass = s.verified?'verified':'unverified';

    const rangeStart = s.season;
    const rangeEnd = (sIdx < seasons.length - 1)?
      seasons[sIdx + 1].season - 1:
      '';
    tBody.push(templates['be-throne-row']
        .replaceAll('{{SEASON-NAME}}', `Season ${rangeStart}–${rangeEnd}`)
        .replaceAll('{{VERIFIED}}', verifiedClass)
        .replaceAll('{{TIER}}', tier)
        ,
    );
  };
  return tBody.join('\n');
}

let seasons;
let reward;

// Build all schedule
seasons = MKEventDatabase.seasons;
saveTextFile(
    path.join(dirs.__generated, './mk-rewards.md'),
    buildMKSchedule(seasons),
);

// Build Blueprint schedule
reward = 'blueprint';
seasons = getSeasons(reward);
saveTextFile(
    path.join(dirs.__generated, `./mk-${reward}-seasons.md`),
    buildMKSchedule(seasons),
);
saveTextFile(
    path.join(dirs.__generated, `./be-${reward}-seasons.md`),
    buildBESchedule(seasons),
);
saveTextFile(
    path.join(dirs.__generated, './be-throne-rewards.md'),
    buildBEThroneSchedule(seasons),
);

// Build Forge Blueprint schedule
reward = 'forge-blueprint';
seasons = getSeasons(reward);
saveTextFile(
    path.join(dirs.__generated, `./mk-${reward}-seasons.md`),
    buildMKSchedule(seasons),
);
saveTextFile(
    path.join(dirs.__generated, `./be-${reward}-seasons.md`),
    buildBESchedule(seasons),
);

// Build Forge Magic Dust schedule
reward = 'magic-dust';
seasons = getSeasons(reward);
saveTextFile(
    path.join(dirs.__generated, `./mk-${reward}-seasons.md`),
    buildMKSchedule(seasons),
);
saveTextFile(
    path.join(dirs.__generated, `./be-${reward}-seasons.md`),
    buildBESchedule(seasons),
);
