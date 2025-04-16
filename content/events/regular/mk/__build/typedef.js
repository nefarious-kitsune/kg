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

export {};
