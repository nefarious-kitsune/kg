/* eslint-disable no-unused-vars */
/* eslint-disable no-multi-spaces, key-spacing */

/**
 * @typedef {Object} DragonRuneInventory
 * Inventory of Dragon Rune resources in player's bag
 * @property {number} rare - Rare Runes (green) quantity
 * @property {number} excellent - Excellent Runes (blue) quantity
 * @property {number} perfect - Perfect Runes (purple) quantity
 * @property {number} epic - Epic Runes (gold) quantity
 * @property {number} [freePick] - Free-Pick Dragon Rune box quantity
 */

/**
 * @typedef {Object} freePickDragonRuneExchange
 * Exchange settings for Free-Pick Dragon Runes
 * @property {boolean} rare - Exchange Free-Pick for Rare Runes (green)
 * @property {boolean} excellent - Exchange Free-Pick for Excellent Runes (blue)
 * @property {boolean} perfect - Exchange Free-Pick for Perfect Runes (purple)
 * @property {boolean} epic - Exchange Free-Pick for Epic Runes (gold)
 */

/**
 * @typedef {Object} DragondenEmblemLevels
 * Levels of Dragonden Emblems
 * @property {number} bronze - Bronze Emblem (green) level
 * @property {number} silver - Silver Emblem (blue) level
 * @property {number} golden - Golden Emblem (purple) level
 * @property {number} legendary - Legendary Emblem (gold) level
 */

/**
 * @typedef {Object} UpgradeableDragondenEmblems
 * Dragonden Emblems that can be upgraded
 * @property {boolean} bronze - Bronze Emblem (green) can be upgraded
 * @property {boolean} silver - Silver Emblem (blue) can be upgraded
 * @property {boolean} golden - Golden Emblem (purple) can be upgraded
 * @property {boolean} legendary - Legendary Emblem (gold) can be upgraded
 */

/**
 * Calculate Dragon upgrades
 * @param {number[]} _inventory - Current inventory of resources
 * @param {boolean[]|string[]} _exchange - Exchange settings for Free-Pick Dragon Runes
 * @param {number[]} _emblems - Current levels of Dragonden Emblems
 * @return {[[Number]]}
 */
function calcDragonUpgrade(_inventory, _exchange, _emblems) {
  /** @type {DragonRuneInventory} Inventory of Dragon Runes in the bag */
  const inventory = {};

  /** @type {DragonRuneInventory} Dragon Runes consumed for the upgrade */
  const consumed = {rare: 0, excellent: 0, perfect: 0, epic: 0};

  /**
   * @type {freePickDragonRuneExchange}
   * Exchange settings for Free-Pick Dragon Runes
   */
  const exchange = {};

  /**
   * @type {DragondenEmblemLevels}
   * Levels of Dragonden Emblems
   */
  const emblems = {};

  // Validate and load input
  if (Array.isArray(_inventory)) {
    if ((_inventory.length === 1) && Array.isArray(_inventory[0])) {
      // Inventory is passed as 1x5 2-dimensional array.
      // Convert inventory to 1-dimensional array
      _inventory = _inventory[0];
    }

    if (_inventory.length >= 5) {
      inventory.rare      = parseInt(_inventory[0]) || 0;
      inventory.excellent = parseInt(_inventory[1]) || 0;
      inventory.perfect   = parseInt(_inventory[2]) || 0;
      inventory.epic      = parseInt(_inventory[3]) || 0;
      inventory.freePick  = parseInt(_inventory[4]) || 0;
    } else {
      throw new Error('Inventory must be a 1x5 or 5x1 array');
    }
  } else {
    throw new Error('Inventory must be a 1x5 or 5x1 array');
  }

  // Validate and load input
  if (Array.isArray(_exchange)) {
    if ((_exchange.length === 1) && Array.isArray(_exchange[0])) {
      // Exchange setting is passed as 1x5 2-dimensional array.
      // Convert exchange setting to 1-dimensional array
      _exchange = _exchange[0];
    }

    if (_exchange.length >= 4) {
      exchange.rare      = _exchange[0] || false;
      exchange.excellent = _exchange[1] || false;
      exchange.perfect   = _exchange[2] || false;
      exchange.epic      = _exchange[3] || false;
    } else {
      throw new Error('Exchange must be a 1x4 or 4x1 array');
    }
  } else {
    throw new Error('Exchange must be a 1x4 or 4x1 array');
  }

  if (Array.isArray(_emblems)) {
    if ((_emblems.length === 1) && Array.isArray(_emblems[0])) {
      // Emblem levels are passed as 1x5 2-dimensional array.
      // Convert Emblem levels to 1-dimensional array
      _emblems = _emblems[0];
    }

    if (_exchange.length >= 4) {
      emblems.bronze    = parseInt(_emblems[0]) || 0;
      emblems.silver    = parseInt(_emblems[1]) || 0;
      emblems.golden    = parseInt(_emblems[2]) || 0;
      emblems.legendary = parseInt(_emblems[3]) || 0;
    } else {
      throw new Error('Emblem levels must be a 1x4 or 4x1 array');
    }
  } else {
    throw new Error('Emblem levels must be a 1x4 or 4x1 array');
  }

  // Validate Dragonden Emblem levels
  let maxLevel;
  maxLevel = Math.floor(emblems.bronze / 5);
  if (emblems.silver > maxLevel) emblems.silver = maxLevel;

  maxLevel = Math.floor(emblems.silver / 4);
  if (emblems.golden > maxLevel) emblems.golden = maxLevel;

  maxLevel = Math.floor(emblems.golden / 5);
  if (emblems.legendary > maxLevel) emblems.legendary = maxLevel;

  let upgradeCount = 0;

  do {
    upgradeCount = 0;
    /** @type {UpgradeableDragondenEmblems} */
    const upgradable = {
      bronze: true,
      silver: (emblems.bronze >= 5) && (emblems.bronze % 5 === 0),
      golden: (emblems.silver >= 4) && (emblems.silver % 4 === 0),
      legendary: (emblems.golden >= 5) && (emblems.golden % 5 === 0),
    };

    if (upgradable.legendary) {
      // Legendary Emblem (gold) is ready for upgrade
      const nextLevel = emblems.legendary + 1;
      const qtyNeeded = nextLevel * 10;

      if (inventory.epic >= qtyNeeded) {
        // We have enough Epic Runes (gold). Consume the Epic Runes
        inventory.epic -= qtyNeeded;
        consumed.epic += qtyNeeded;
        emblems.legendary++;
        upgradeCount++;
        continue;
      } else {
        // Not enough Epic Runes for upgrade. Consume Free-Pick Dragon Runes
        if (exchange.epic) {
          if ((inventory.freePick + inventory.epic) >= qtyNeeded) {
            inventory.freePick -= (qtyNeeded - inventory.epic);
            inventory.epic = 0;
            consumed.epic += qtyNeeded;
            emblems.legendary++;
            upgradeCount++;
            continue;
          }
        }
      }
    }

    if (upgradable.golden) {
      // Golden Emblem (purple) is ready for upgrade
      const nextLevel = emblems.golden + 1;
      let qtyNeeded = Math.ceil(nextLevel * 4 / 3); // 2, 3, 4, 6, 7, 8, 9, 10,...
      if (qtyNeeded > 66) qtyNeeded = 66;

      if (inventory.perfect >= qtyNeeded) {
        // We have enough Perfect Runes (purple). Consume the Perfect Runes
        inventory.perfect -= qtyNeeded;
        consumed.perfect += qtyNeeded;
        emblems.golden++;
        upgradeCount++;
        continue;
      } else {
        // Not enough Perfect Runes for upgrade. Consume Free-Pick Dragon Runes
        if (exchange.epic) {
          const exchangeRate = 2;
          const exchanged =
            Math.ceil((qtyNeeded - inventory.perfect) / exchangeRate);
          if (exchanged <= inventory.freePick) {
            inventory.freePick -= exchanged;
            inventory.perfect =
              inventory.perfect + (exchanged * exchangeRate) - qtyNeeded;
            consumed.perfect += qtyNeeded;
            emblems.golden++;
            upgradeCount++;
            continue;
          }
        }
      }
    }

    if (upgradable.silver) {
      // Silver Emblem (blue) is ready for upgrade
      const nextLevel = emblems.silver + 1;
      let qtyNeeded = Math.floor(nextLevel * 2.5); // 2, 5, 7, 10, 12, 15,...
      if (qtyNeeded > 125) qtyNeeded = 125;

      if (inventory.excellent >= qtyNeeded) {
        // We have enough Excellent Runes (blue). Consume the Excellent Runes
        inventory.excellent -= qtyNeeded;
        consumed.excellent += qtyNeeded;
        emblems.silver++;
        upgradeCount++;
        continue;
      } else {
        // Not enough Excellent Runes for upgrade. Consume Free-Pick Dragon Runes
        if (exchange.excellent) {
          const exchangeRate = 20;
          const exchanged =
            Math.ceil((qtyNeeded - inventory.excellent) / exchangeRate);

          if (exchanged <= inventory.freePick) {
            inventory.freePick -= exchanged;
            inventory.excellent =
              inventory.excellent + (exchanged * exchangeRate) - qtyNeeded;
            consumed.excellent += qtyNeeded;
            emblems.silver++;
            upgradeCount++;
            continue;
          }
        }
      }
    }

    if (upgradable.bronze) {
      // Bronze Emblem (blue) is ready for upgrade
      // Note: this is always TRUE
      const nextLevel = emblems.bronze + 1;
      let qtyNeeded = Math.floor(nextLevel * 5); // 5, 10, 15, 20, etc,...
      if (qtyNeeded > 250) qtyNeeded = 250;

      if (inventory.rare >= qtyNeeded) {
        // We have enough Rare Runes (green). Consume the Rare Runes
        inventory.rare -= qtyNeeded;
        consumed.rare += qtyNeeded;
        emblems.bronze++;
        upgradeCount++;
        continue;
      } else {
        // Not enough Rare Runes for upgrade. Consume Free-Pick Dragon Runes
        if (exchange.rare) {
          const exchangeRate = 200;
          const exchanged =
            Math.ceil((qtyNeeded - inventory.rare) / exchangeRate);

          if (exchanged <= inventory.freePick) {
            inventory.freePick -= exchanged;
            inventory.rare =
              inventory.rare + (exchanged * exchangeRate) - qtyNeeded;
            consumed.rare += qtyNeeded;
            emblems.bronze++;
            upgradeCount++;
            continue;
          }
        }
      }
    }
  } while (upgradeCount > 0);

  return [
    // First row is inventory after upgrades
    [
      inventory.rare,
      inventory.excellent,
      inventory.perfect,
      inventory.epic,
      inventory.freePick,
    ],
    // Second row is Emblem levels after upgrades
    [
      emblems.bronze,
      emblems.silver,
      emblems.golden,
      emblems.legendary,
      null,
    ],
    // Third row is consumed Dragon Runes after upgrades
    [
      consumed.rare,
      consumed.excellent,
      consumed.perfect,
      consumed.epic,
      null,
    ],
  ];
}
