import path from 'path';

import {readTsvFile, saveTextFile} from '../../../../../dev/files/files.js';
import {dirs} from './dirs.js';

/** @typedef {import('./typedef.js').MKEventDatabase} MKEventDatabase */
/** @typedef {import('./typedef.js').MKSeasonalData} MKSeasonalData */

const jsonFilePath = path.join(dirs.__content, `/mk-data.json`);

/** @type {MKEventDatabase} */
const MKEventDatabase = {
  title: 'Mightiest Kingdom event seasonal rewards',
  seasons: [
    {
      'season': 0,
      'season-name': 'After Throne War',
      'top-3-reward': {tier: 5, reward: 'magic-dust'},
      'top-20-reward': {tier: 4, reward: 'magic-dust'},
      'phase-reward': {tier: 2, reward: 'blueprint'},
      'verified': true,
    },
    {
      'season': 1,
      'season-name': 'Season 1–3',
      'top-3-reward': {tier: 5, reward: 'blueprint'},
      'top-20-reward': {tier: 4, reward: 'blueprint'},
      'phase-reward': {tier: 2, reward: 'blueprint'},
      'verified': true,
    },
  ],
};

const rewardsData = readTsvFile(path.join(dirs.__data, './mk-rewards.tsv'));
rewardsData.shift(); // Remove header
rewardsData.shift(); // Remove 'after throne war' row
rewardsData.shift(); // Remove 'season 1-3' row

let seasonNumber = 4;

let rowIdx = 0;
while (rowIdx < rewardsData.length) {
  const currRow = rewardsData[rowIdx];

  let seasonName = `Season ${seasonNumber}`;
  // const historical = entries[1] === 'TRUE';
  const predicted = currRow[2] === 'TRUE';
  const rewardType = currRow[3].toLowerCase();
  const rewardTier = parseInt(currRow[4]);

  let nextRowIdx = rowIdx + 1;
  let nextSeasonNumber = seasonNumber + 1;
  if (rowIdx < rewardsData.length-1) {
    const nextRow = rewardsData[nextRowIdx];
    const nextRewardType = nextRow[3].toLowerCase();
    const nextRewardTier = parseInt(nextRow[4]);
    if ((nextRewardTier === rewardTier) && (nextRewardType === rewardType)) {
      seasonName = `Season ${seasonNumber} & ${nextSeasonNumber}`;
      nextRowIdx++;
      nextSeasonNumber++;
    }
  }

  let rewardName = '';
  switch (rewardType) {
    case 'armor': rewardName = 'blueprint'; break;
    case 'magic': rewardName = 'magic-dust'; break;
    case 'weapon': rewardName = 'forge-blueprint'; break;
    case 'summon': rewardName = 'magic-book'; break;
  }

  MKEventDatabase.seasons.push({
    'season': seasonNumber,
    'season-name': seasonName,
    'top-3-reward': {tier: rewardTier, reward: rewardName},
    'top-20-reward': {tier: rewardTier-1, reward: rewardName},
    'phase-reward': {tier: rewardTier-3, reward: rewardName},
    'verified': (predicted !== true),
  });

  seasonNumber = nextSeasonNumber;
  rowIdx = nextRowIdx;
}

saveTextFile(jsonFilePath, MKEventDatabase);

export {MKEventDatabase};
