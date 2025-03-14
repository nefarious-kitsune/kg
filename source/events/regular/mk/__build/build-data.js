import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} MKEventDatabase
 * Database for Mightiest Kingdom event
 * @property {string} title - Title of the database
 * @property {MKSeasonalData[]} seasons - Data of Mightiest Kingdom seasons
 *
 * @typedef {'blueprint'|'magic-dust'|'forge-blueprint'|'magic-book'} MKRewardName
 *
 * @typedef {Object} MKReward
 * MK reward
 * @property {number} tier - Tier number
 * @property {MKRewardName} reward - Reward name
 *
 * @typedef {Object} MKSeasonalData
 * Data for Mightiest Kingdom season
 * @property {number} season - Season number
 * @property {string} season-name - Season name
 * @property {MKReward} top-3-reward - Reward for overall ranking 1-3
 * @property {MKReward} top-20-reward - Reward for overall ranking 4-20
 * @property {MKReward} phase-reward - Reward for event phase
 * @property {boolean} verified - Is this verified?
*/

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

const rewardsData = readFileSync(
    resolve(ModulePath, '../__data/mk-rewards.tsv'),
    {encoding: 'utf8'},
).split('\n');

rewardsData.shift(); // Remove header
rewardsData.shift(); // Remove 'after throne war' row
rewardsData.shift(); // Remove 'season 1-3' row

let seasonNumber = 4;

let rowIdx = 0;
while (rowIdx < rewardsData.length) {
  const row = rewardsData[rowIdx];
  const entries = row.split('\t');

  let seasonName = `Season ${seasonNumber}`;
  // const historical = entries[1] === 'TRUE';
  const predicted = entries[2] === 'TRUE';
  const rewardType = entries[3].toLowerCase();
  const rewardTier = parseInt(entries[4]);

  let nextRowIdx = rowIdx + 1;
  let nextSeasonNumber = seasonNumber + 1;
  if (rowIdx < rewardsData.length-1) {
    const nextRow = rewardsData[nextRowIdx];
    const nextEntries = nextRow.split('\t');
    const nextRewardType = nextEntries[3].toLowerCase();
    const nextRewardTier = parseInt(nextEntries[4]);
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

writeFileSync(
    resolve(ModulePath, './--mk-data.json'),
    JSON.stringify(MKEventDatabase, null, '  ') + '\n',
);

export {MKEventDatabase};
