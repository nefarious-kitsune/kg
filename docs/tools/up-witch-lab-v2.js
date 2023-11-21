/* eslint-env browser */

// version 2.0.1

const CURR_REAGENT_COUNT_KEY = 'planner-lab-curr-reagent-count';
const CURR_LAB_LEVEL_KEY = 'planner-lab-curr-level';

const WitchLabUpgradePlanner = {
  totalPoints: 0,
  finalLightReagentCount: 0,
  finalWitchLabLevel: 0,
  missingLightReagentCount: 0,
  currLightReagentCount: 0,
  currWitchLabLevel: 0,

  init: function() {
    const d = document;
    const up = WitchLabUpgradePlanner;
    up.dom = {
      CurrLightReagentCount: d.getElementById('LightReagentCount'),
      CurrWitchLabLevel: d.getElementById('CurrWitchLabLevel'),
      LightReagentCount: d.getElementById('LightReagentLeft'),
      FinalWitchLabLevel: d.getElementById('MaxWitchLabLevel'),
      MissingLightReagent: d.getElementById('MissingLightReagent'),
      Points : d.getElementById('witch-labe-upgrade-points'),
    };
    up.loadData();
    up.calculate();
    up.updateUI();
    up.dom.CurrWitchLabLevel.addEventListener("change", up.onFieldChange);
    up.dom.CurrLightReagentCount.addEventListener("change", up.onFieldChange);
  },

  loadData: function() {
    const up = WitchLabUpgradePlanner;
    up.currLightReagentCount = localStorage.getItem(CURR_REAGENT_COUNT_KEY) || 5000;
    up.currWitchLabLevel  = localStorage.getItem(CURR_LAB_LEVEL_KEY  ) || 100;
    up.dom.CurrLightReagentCount.value = up.currLightReagentCount;
    up.dom.CurrWitchLabLevel.value = up.currWitchLabLevel;
  },

  saveData: function() {
    const up = WitchLabUpgradePlanner;
    localStorage.setItem(CURR_REAGENT_COUNT_KEY, up.currLightReagentCount);
    localStorage.setItem(CURR_LAB_LEVEL_KEY  , up.currWitchLabLevel);
  },

  getUserData: function() {
    const up = WitchLabUpgradePlanner;
    const dom = up.dom;
    up.currLightReagentCount = parseInt(dom.CurrLightReagentCount.value);
    up.currWitchLabLevel  = parseInt(dom.CurrWitchLabLevel.value);
  },

  updateUI: function() {
    const up = WitchLabUpgradePlanner;
    const dom = up.dom;
    dom.LightReagentCount.innerText = up.finalLightReagentCount;
    dom.FinalWitchLabLevel.innerText = up.finalWitchLabLevel;
    dom.MissingLightReagent.innerText = formatNumber(up.missingLightReagentCount);
    dom.Points.innerText = formatNumber(up.totalPoints);
  },

  onFieldChange: function() {
    const up = WitchLabUpgradePlanner;
    up.getUserData();
    up.calculate();
    up.saveData();
    up.updateUI();
  },

  calculate: function() {
    let totalPoints = 0;
    const up = WitchLabUpgradePlanner;
    let _labLevel = up.currWitchLabLevel;
    let _lightReagentCount = up.currLightReagentCount;

    let idx = WitchLabUpgradeCost.findLastIndex((b) => b.startLevel < _labLevel);

    let startLevel = WitchLabUpgradeCost[idx].startLevel;
    let endLevel =
        (WitchLabUpgradeCost.length > idx + 1)?
        WitchLabUpgradeCost[idx + 1].startLevel:
        2000;

    let canUpgrade = true;

    while (canUpgrade) {
      if (_labLevel >= endLevel) {
        idx++;
        startLevel = WitchLabUpgradeCost[idx].startLevel;
        endLevel =
          (WitchLabUpgradeCost.length > idx + 1)?
          WitchLabUpgradeCost[idx + 1].startLevel:
          2000;
      }

      const qtyNeeded = WitchLabUpgradeCost[idx].cost; // should be (index * 5);

      if (_lightReagentCount >= qtyNeeded) {
        _labLevel++;
        _lightReagentCount -= qtyNeeded;
        totalPoints += qtyNeeded * 70;
        if (_labLevel === 2000) canUpgrade = false;
      } else {
        canUpgrade = false;
      }
    } // while (canUpgrade)

    const _finalWitchLab = _labLevel;
    const _finalLightReagentCount = _lightReagentCount;

    let _missingLightReagentCount;
    let keepUpgrading = (_labLevel < 2000);
    if (keepUpgrading) {
      _missingLightReagentCount = - _lightReagentCount;
    } else {
      _missingLightReagentCount = 0;
    }
    while (keepUpgrading) {
      if (_labLevel >= endLevel) {
        idx++;
        startLevel = WitchLabUpgradeCost[idx].startLevel;
        endLevel =
          (WitchLabUpgradeCost.length > idx + 1)?
          WitchLabUpgradeCost[idx + 1].startLevel:
          2000;
      }
      _missingLightReagentCount += WitchLabUpgradeCost[idx].cost;
      _labLevel++;
      if (_labLevel >= 2000) keepUpgrading = false;
    } // while (keepUpgrading)

    up.totalPoints = totalPoints;
    up.finalWitchLabLevel = _finalWitchLab;
    up.finalLightReagentCount = _finalLightReagentCount;
    up.missingLightReagentCount = _missingLightReagentCount;

    if (typeof MasterPlanner !== 'undefined') MasterPlanner.updateTotalPoints();
  }
}
