/* eslint-env browser */

// version 2.0.1

const CURR_STRENGTH_POTION_COUNT_KEY = 'planner-magic-stone-curr-strength-potion-count';
const CURR_FORTUNE_POTION_COUNT_KEY =  'planner-magic-stone-curr-fortune-potion-count';
const CURR_MAGIC_STONE_T5_LEVELS_EKY = 'planner-magic-stone-t5-levels';
const CURR_MAGIC_STONE_T6_LEVELS_EKY = 'planner-magic-stone-t6-levels';
const CURR_MAGIC_STONE_T7_LEVELS_EKY = 'planner-magic-stone-t7-levels';
const CURR_MAGIC_STONE_T8_LEVELS_EKY = 'planner-magic-stone-t8-levels';

const MagicStoneUpgradePlanner = {
  totalPoints: 0,

  currStrengthPotionCount: 0,
  finalStrengthPotionCount: 0,
  missingStrengthPotionCount: 0,

  currFortunePotionCount: 0,
  finalFortunePotionCount: 0,
  missingFortunePotionCount: 0,

  currT5Levels:  [0, 0, 0, 0, 0, 0], finalT5Levels: [0, 0, 0, 0, 0, 0],
  currT6Levels:  [0, 0, 0, 0, 0, 0], finalT6Levels: [0, 0, 0, 0, 0, 0],
  currT7Levels:  [0, 0, 0, 0, 0, 0], finalT7Levels: [0, 0, 0, 0, 0, 0],
  currT8Levels:  [0, 0, 0, 0, 0, 0], finalT8Levels: [0, 0, 0, 0, 0, 0],
  
  init: function() {
    const d = document;
    const up = MagicStoneUpgradePlanner;
    up.dom = {
      CurrStrengthPotionCount: d.getElementById('StrengthPotionCount'),
      StrengthPotionLeft: d.getElementById('StrengthPotionLeft'),
      MissingStrengthPotion: d.getElementById('MissingStrengthPotion'),

      CurrFortunePotionCount: d.getElementById('FortunePotionCount'),
      FortunePotionLeft: d.getElementById('FortunePotionLeft'),
      MissingFortunePotion: d.getElementById('MissingFortunePotion'),

      T5MagicStoneLevel: [
        d.getElementById('T5MagicStoneLevel1'), 
        d.getElementById('T5MagicStoneLevel2'),
        d.getElementById('T5MagicStoneLevel3'),
        d.getElementById('T5MagicStoneLevel4'),
        d.getElementById('T5MagicStoneLevel5'),
        d.getElementById('T5MagicStoneLevel5'),
      ],
      T6MagicStoneLevel: [
        d.getElementById('T6MagicStoneLevel1'),
        d.getElementById('T6MagicStoneLevel2'),
        d.getElementById('T6MagicStoneLevel3'),
        d.getElementById('T6MagicStoneLevel4'),
        d.getElementById('T6MagicStoneLevel5'),
        d.getElementById('T6MagicStoneLevel6'),
      ],
      T7MagicStoneLevel: [
        d.getElementById('T7MagicStoneLevel1'),
        d.getElementById('T7MagicStoneLevel2'),
        d.getElementById('T7MagicStoneLevel3'),
        d.getElementById('T7MagicStoneLevel4'),
        d.getElementById('T7MagicStoneLevel5'),
        d.getElementById('T7MagicStoneLevel6'),
      ],
      T8MagicStoneLevel: [
        d.getElementById('T8MagicStoneLevel1'),
        d.getElementById('T8MagicStoneLevel2'),
        d.getElementById('T8MagicStoneLevel3'),
        d.getElementById('T8MagicStoneLevel4'),
        d.getElementById('T8MagicStoneLevel5'),
        d.getElementById('T8MagicStoneLevel6'),
      ],

      MaxT5MagicStoneLevel: [
        d.getElementById('MaxT5MagicStoneLevel1'),
        d.getElementById('MaxT5MagicStoneLevel2'),
        d.getElementById('MaxT5MagicStoneLevel3'),
        d.getElementById('MaxT5MagicStoneLevel4'),
        d.getElementById('MaxT5MagicStoneLevel5'),
        d.getElementById('MaxT5MagicStoneLevel6'),
      ],
      MaxT6MagicStoneLevel: [
        d.getElementById('MaxT6MagicStoneLevel1'),
        d.getElementById('MaxT6MagicStoneLevel2'),
        d.getElementById('MaxT6MagicStoneLevel3'),
        d.getElementById('MaxT6MagicStoneLevel4'),
        d.getElementById('MaxT6MagicStoneLevel5'),
        d.getElementById('MaxT6MagicStoneLevel6'),
      ],
      MaxT7MagicStoneLevel: [
        d.getElementById('MaxT7MagicStoneLevel1'),
        d.getElementById('MaxT7MagicStoneLevel2'),
        d.getElementById('MaxT7MagicStoneLevel3'),
        d.getElementById('MaxT7MagicStoneLevel4'),
        d.getElementById('MaxT7MagicStoneLevel5'),
        d.getElementById('MaxT7MagicStoneLevel6'),
      ],
      MaxT8MagicStoneLevel: [
        d.getElementById('MaxT8MagicStoneLevel1'),
        d.getElementById('MaxT8MagicStoneLevel2'),
        d.getElementById('MaxT8MagicStoneLevel3'),
        d.getElementById('MaxT8MagicStoneLevel4'),
        d.getElementById('MaxT8MagicStoneLevel5'),
        d.getElementById('MaxT8MagicStoneLevel6'),
      ],
      Points : d.getElementById('magic-stone-upgrade-points'),
    };
    up.loadData();
    up.calculate();
    up.updateUI();
    const addListener = (el) => el.addEventListener("change", up.onFieldChange);
    addListener(up.dom.CurrStrengthPotionCount);
    addListener(up.dom.CurrFortunePotionCount);
    up.dom.T5MagicStoneLevel.forEach(addListener);
    up.dom.T6MagicStoneLevel.forEach(addListener);
    up.dom.T7MagicStoneLevel.forEach(addListener);
    up.dom.T8MagicStoneLevel.forEach(addListener);
  },

  loadData: function() {
    const up = MagicStoneUpgradePlanner;
    
    up.currStrengthPotionCount =
      localStorage.getItem(CURR_STRENGTH_POTION_COUNT_KEY) ||
      20000;

    up.currFortunePotionCount =
      localStorage.getItem(CURR_FORTUNE_POTION_COUNT_KEY) ||
      20000;

    function loadStoneLevels(data, defaultLevels) {
      if ((typeof data === 'string') && (data.length > 0)) {
        return data.split(',').map((n) => parseInt(n));
      }
      return Array.from(defaultLevels);
    }

    const allMaxed = [20,20,20,20,20,20];
    const allZero =  [ 0, 0, 0, 0, 0, 0];

    up.currT5Levels  = loadStoneLevels(
      localStorage.getItem(CURR_MAGIC_STONE_T5_LEVELS_EKY),
      allMaxed,
    );
    up.currT6Levels  = loadStoneLevels(
      localStorage.getItem(CURR_MAGIC_STONE_T5_LEVELS_EKY),
      [10, 10, 10, 10, 10, 0],
    );
    up.currT7Levels  = loadStoneLevels(
      localStorage.getItem(CURR_MAGIC_STONE_T7_LEVELS_EKY),
      allZero,
    );
    up.currT8Levels  = loadStoneLevels(
      localStorage.getItem(CURR_MAGIC_STONE_T8_LEVELS_EKY),
      allZero,
    );

    up.dom.CurrStrengthPotionCount.value = up.currStrengthPotionCount;
    up.dom.CurrFortunePotionCount.value = up.currFortunePotionCount;
  },

  saveData: function() {
    const up = MagicStoneUpgradePlanner;
    localStorage.setItem(
      CURR_STRENGTH_POTION_COUNT_KEY,
      up.currStrengthPotionCount);
    localStorage.setItem(
      CURR_FORTUNE_POTION_COUNT_KEY,
      up.currFortunePotionCount);
    localStorage.setItem(
      CURR_MAGIC_STONE_T5_LEVELS_EKY,
      up.currT5Levels.join(','),
    );
    localStorage.setItem(
      CURR_MAGIC_STONE_T6_LEVELS_EKY,
      up.currT6Levels.join(','),
    );
    localStorage.setItem(
      CURR_MAGIC_STONE_T7_LEVELS_EKY,
      up.currT7Levels.join(','),
    );
    localStorage.setItem(
      CURR_MAGIC_STONE_T8_LEVELS_EKY,
      up.currT8Levels.join(','),
    );
  },

  getUserData: function() {
    const up = MagicStoneUpgradePlanner;
    const dom = up.dom;
    up.currStrengthPotionCount = parseInt(dom.CurrStrengthPotionCount.value);
    up.currFortunePotionCount = parseInt(dom.CurrFortunePotionCount.value);
    up.currT5Levels = up.dom.T5MagicStoneLevel.map((el) => parseInt(el.value));
    up.currT6Levels = up.dom.T6MagicStoneLevel.map((el) => parseInt(el.value));
    up.currT7Levels = up.dom.T7MagicStoneLevel.map((el) => parseInt(el.value));
    up.currT8Levels = up.dom.T8MagicStoneLevel.map((el) => parseInt(el.value));
  },

  updateUI: function() {
    const up = MagicStoneUpgradePlanner;
    const dom = up.dom;
    dom.CurrStrengthPotionCount.innerText = up.finalStrengthPotionCount;
    dom.StrengthPotionLeft.innerText = up.finalStrengthPotionCount;
    dom.MissingStrengthPotion.innerText = formatNumber(up.missingStrengthPotionCount);

    dom.CurrFortunePotionCount.innerText = up.finalFortunePotionCount;
    dom.FortunePotionLeft.innerText = up.finalFortunePotionCount;
    dom.MissingFortunePotion.innerText = formatNumber(up.missingFortunePotionCount);
    
    dom.Points.innerText = formatNumber(up.totalPoints);
    up.currT5Levels.forEach((lvl, i) => dom.T5MagicStoneLevel[i].value = lvl);
    up.currT6Levels.forEach((lvl, i) => dom.T6MagicStoneLevel[i].value = lvl);
    up.currT7Levels.forEach((lvl, i) => dom.T7MagicStoneLevel[i].value = lvl);
    up.currT8Levels.forEach((lvl, i) => dom.T8MagicStoneLevel[i].value = lvl);
    up.finalT5Levels.forEach((lvl, i) => {dom.MaxT5MagicStoneLevel[i].value = lvl;});
    up.finalT6Levels.forEach((lvl, i) => {dom.MaxT6MagicStoneLevel[i].value = lvl;});
    up.finalT7Levels.forEach((lvl, i) => {dom.MaxT7MagicStoneLevel[i].value = lvl;});
    up.finalT8Levels.forEach((lvl, i) => {dom.MaxT8MagicStoneLevel[i].value = lvl;});
  },

  onFieldChange: function() {
    const up = MagicStoneUpgradePlanner;
    up.getUserData();
    up.calculate();
    up.saveData();
    up.updateUI();
  },

  calculate: function() {
    const up = MagicStoneUpgradePlanner;

    let _totalPoints = 0;

    let _strengthPotionCount = up.currStrengthPotionCount;
    let _fortunePotionCount = up.currFortunePotionCount;

    let _missingStrengthPotion = 0;
    let _missingFortunePotion = 0;

    function upgradeStone(level, strPotionCost, forPotionCost) {
      let finalLevel = level;
      if (level === 0) return finalLevel;
      if (level === 20) return finalLevel;

      let canUpgrade = true;
      while (canUpgrade) {
        const strPotionRequired = strPotionCost;
        const forPotionRequired = (finalLevel >= 10)?forPotionCost:0;
        if (
          (_strengthPotionCount >= strPotionRequired) &&
          (_fortunePotionCount >= forPotionRequired)
        ) {
          finalLevel++;
          _strengthPotionCount -= strPotionRequired;
          _fortunePotionCount -= forPotionRequired;
          _totalPoints +=
              (3 * strPotionRequired )+
              (28 * forPotionRequired);

          if (finalLevel === 20) canUpgrade = false;
        } else {
          canUpgrade = false;
        }
      }
      let maxLevel = finalLevel;
      while (maxLevel < 20) {
        _missingStrengthPotion += strPotionCost;
        _missingFortunePotion += (finalLevel >= 10)?forPotionCost:0;
        maxLevel++;        
      }
      return finalLevel;
    }

    up.currT5Levels.forEach((lvl, i) => {up.finalT5Levels[i] = upgradeStone(lvl,   10530,   2000)});
    up.currT6Levels.forEach((lvl, i) => {up.finalT6Levels[i] = upgradeStone(lvl,   52840,  10000)});
    up.currT7Levels.forEach((lvl, i) => {up.finalT7Levels[i] = upgradeStone(lvl,  263200,  50000)});
    up.currT8Levels.forEach((lvl, i) => {up.finalT8Levels[i] = upgradeStone(lvl, 1316000, 250000)});

    _missingStrengthPotion -= _strengthPotionCount;
    _missingFortunePotion -= _fortunePotionCount;

    up.totalPoints = _totalPoints;

    up.finalStrengthPotionCount = _strengthPotionCount;
    up.finalFortunePotionCount = _fortunePotionCount;

    up.missingStrengthPotionCount =
      (_missingStrengthPotion > 0)?
      _missingStrengthPotion:
      0;

    up.missingFortunePotionCount =
      (_missingFortunePotion)?
      _missingFortunePotion:
      0;

    if (typeof MasterPlanner !== 'undefined') MasterPlanner.updateTotalPoints();
  }
}
