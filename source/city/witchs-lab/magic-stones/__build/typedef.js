/**
 * @typedef {Object} MagicStoneDatabase
 * Database for Magic Stones
 * @property {string} title - Title of the database
 * @property {MagicStoneData[]} magic-stones - Data of Magic Stones
 *
 * @typedef {Object} MagicStoneData
 * Data for Magic Stone
 * @property {number} tier - Gear tier
 * @property {string[]} names - Magic Stone names
 * @property {MagicStonePowerData[]} power-bonus - Magic Stone power bonus
 * @property {MagicStoneUpgradeData[]} upgrade - Magic Stone upgrade cost
 *
 * @typedef {Object} MagicStonePowerData
 * Data for Magi cStone power bonus
 * @property {number} level - Level
 * @property {number} bonus - Power bonus percentage (e.g. 60 for "60%")
 * @property {boolean} verified - Is this entry verified?
 *
 * @typedef {Object} MagicStoneUpgradeData
 * Data for Magic Stone upgrade cost
 * @property {number} upgrade-from - Level before upgrade
 * @property {number} upgrade-to - Level after upgrade
 * @property {number} strengthening-potion - Cost of Strengthening Potion
 * @property {number} fortune-potion - Cost of Fortune Potion
 * @property {boolean} verified - Is this entry verified?
 */

export {};
