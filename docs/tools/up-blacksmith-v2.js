/* eslint-env browser */

// version 2.0.2

const CURR_FORGE_HAMMER_COUNT_KEY = 'planner-blacksmith-curr-forge-hammer-count';
const CURR_BLACKSMITH_LEVEL_KEY = 'planner-blacksmith-curr-level';

const BlacksmithUpgradePlanner = {
  totalPoints: 0,
  finalForgeHammerCount: 0,
  finalBlacksmithLevel: 0,
  missingForgeHammerCount: 0,
  currForgeHammerCount: 0,
  currBlacksmithLevel: 0,

  init: function() {
    const d = document;
    const up = BlacksmithUpgradePlanner;
    up.dom = {
      CurrForgeHammerCount: d.getElementById('ForgeHammerCount'),
      CurrBlacksmithLevel: d.getElementById('BlacksmithLevel'),
      FinalForgeHammerCount: d.getElementById('ForgeHammerLeft'),
      FinalBlacksmithLevel: d.getElementById('MaxBlacksmithLevel'),
      MissingForgeHammer: d.getElementById('MissingForgeHammer'),
      Points : d.getElementById('blacksmith-upgrade-points'),
    };
    up.loadData();
    up.calculate();
    up.updateUI();
    up.dom.CurrBlacksmithLevel.addEventListener("change", up.onFieldChange);
    up.dom.CurrForgeHammerCount.addEventListener("change", up.onFieldChange);
  },

  loadData: function() {
    const up = BlacksmithUpgradePlanner;
    up.currForgeHammerCount = localStorage.getItem(CURR_FORGE_HAMMER_COUNT_KEY) || 5000;
    up.currBlacksmithLevel  = localStorage.getItem(CURR_BLACKSMITH_LEVEL_KEY  ) || 100;
    up.dom.CurrForgeHammerCount.value = up.currForgeHammerCount;
    up.dom.CurrBlacksmithLevel.value = up.currBlacksmithLevel;
  },

  saveData: function() {
    const up = BlacksmithUpgradePlanner;
    localStorage.setItem(CURR_FORGE_HAMMER_COUNT_KEY, up.currForgeHammerCount);
    localStorage.setItem(CURR_BLACKSMITH_LEVEL_KEY  , up.currBlacksmithLevel);
  },

  getUserData: function() {
    const up = BlacksmithUpgradePlanner;
    const dom = up.dom;
    up.currForgeHammerCount = parseInt(dom.CurrForgeHammerCount.value);
    up.currBlacksmithLevel  = parseInt(dom.CurrBlacksmithLevel.value);
  },

  updateUI: function() {
    const up = BlacksmithUpgradePlanner;
    const dom = up.dom;
    dom.FinalForgeHammerCount.innerText = up.finalForgeHammerCount;
    dom.FinalBlacksmithLevel.innerText = up.finalBlacksmithLevel;
    dom.MissingForgeHammer.innerText = formatNumber(up.missingForgeHammerCount);
    dom.Points.innerText = formatNumber(up.totalPoints);
  },

  onFieldChange: function() {
    const up = BlacksmithUpgradePlanner;
    up.getUserData();
    up.calculate();
    up.saveData();
    up.updateUI();
  },

  calculate: function() {
    let totalPoints = 0;
    const up = BlacksmithUpgradePlanner;
    let _blacksmithLevel = up.currBlacksmithLevel;
    let _forgeHammerCount = up.currForgeHammerCount;

    let idx = BlacksmithUpgradeCost.findLastIndex((b) => b.startLevel < _blacksmithLevel);

    let startLevel = BlacksmithUpgradeCost[idx].startLevel;
    let endLevel =
        (BlacksmithUpgradeCost.length > idx + 1)?
        BlacksmithUpgradeCost[idx + 1].startLevel:
        2000;

    let canUpgrade = true;

    while (canUpgrade) {
      if (_blacksmithLevel >= endLevel) {
        idx++;
        startLevel = BlacksmithUpgradeCost[idx].startLevel;
        endLevel =
          (BlacksmithUpgradeCost.length > idx + 1)?
          BlacksmithUpgradeCost[idx + 1].startLevel:
          2000;
      }

      const qtyNeeded = BlacksmithUpgradeCost[idx].cost; // should be (index * 5);

      if (_forgeHammerCount >= qtyNeeded) {
        _blacksmithLevel++;
        _forgeHammerCount -= qtyNeeded;
        totalPoints += qtyNeeded * 70;
        if (_blacksmithLevel === 2000) canUpgrade = false;
      } else {
        canUpgrade = false;
      }
    } // while (canUpgrade)

    const _finalBlacksmithLevel = _blacksmithLevel;
    const _finalForgeHammerCount = _forgeHammerCount;

    let _missingForgeHammerCount;
    let keepUpgrading = (_blacksmithLevel < 2000);
    if (keepUpgrading) {
      _missingForgeHammerCount = - _forgeHammerCount;
    } else {
      _missingForgeHammerCount = 0;
    }
    while (keepUpgrading) {
      if (_blacksmithLevel >= endLevel) {
        idx++;
        startLevel = BlacksmithUpgradeCost[idx].startLevel;
        endLevel =
          (BlacksmithUpgradeCost.length > idx + 1)?
          BlacksmithUpgradeCost[idx + 1].startLevel:
          2000;
      }
      _missingForgeHammerCount += BlacksmithUpgradeCost[idx].cost;
      _blacksmithLevel++;
      if (_blacksmithLevel >= 2000) keepUpgrading = false;
    } // while (keepUpgrading)

    up.totalPoints = totalPoints;
    up.finalBlacksmithLevel = _finalBlacksmithLevel;
    up.finalForgeHammerCount = _finalForgeHammerCount;
    up.missingForgeHammerCount = _missingForgeHammerCount;

    if (typeof MasterPlanner !== 'undefined') MasterPlanner.updateTotalPoints();
  }
}
