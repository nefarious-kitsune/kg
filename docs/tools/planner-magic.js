/* eslint-env browser */
class MagicUpgradePlanner {
  // Cache DOM elements
  constructor() {
    this.totalPoints = 0
    const d = document;
    this.dom = {
      StrengthPotionCount: d.getElementById('StrengthPotionCount'),
      FortunePotionCount : d.getElementById('FortunePotionCount'),
      StrengthPotionLeft: d.getElementById('StrengthPotionLeft'),
      FortunePotionLeft : d.getElementById('FortunePotionLeft'),

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
      Points : d.getElementById('magic-upgrade-points'),
    };
  }

  /** Pull values from UI */
  getValues() {
    const dom = this.dom;
    this.strengthPotion = parseInt(dom.StrengthPotionCount.value);
    this.fortunePotion = parseInt(dom.FortunePotionCount.value);
    this.t5Level = [
      {idx: 0, level: parseInt(dom.T5MagicStoneLevel[0].value)},
      {idx: 1, level: parseInt(dom.T5MagicStoneLevel[1].value)},
      {idx: 2, level: parseInt(dom.T5MagicStoneLevel[2].value)},
      {idx: 3, level: parseInt(dom.T5MagicStoneLevel[3].value)},
      {idx: 4, level: parseInt(dom.T5MagicStoneLevel[4].value)},
      {idx: 5, level: parseInt(dom.T5MagicStoneLevel[5].value)},
    ].sort((a, b) => b.level - a.level);
    this.t6Level = [
      {idx: 0, level: parseInt(dom.T6MagicStoneLevel[0].value)},
      {idx: 1, level: parseInt(dom.T6MagicStoneLevel[1].value)},
      {idx: 2, level: parseInt(dom.T6MagicStoneLevel[2].value)},
      {idx: 3, level: parseInt(dom.T6MagicStoneLevel[3].value)},
      {idx: 4, level: parseInt(dom.T6MagicStoneLevel[4].value)},
      {idx: 5, level: parseInt(dom.T6MagicStoneLevel[5].value)},
    ].sort((a, b) => b.level - a.level);
    this.t7Level = [
      {idx: 0, level: parseInt(dom.T7MagicStoneLevel[0].value)},
      {idx: 1, level: parseInt(dom.T7MagicStoneLevel[1].value)},
      {idx: 2, level: parseInt(dom.T7MagicStoneLevel[2].value)},
      {idx: 3, level: parseInt(dom.T7MagicStoneLevel[3].value)},
      {idx: 4, level: parseInt(dom.T7MagicStoneLevel[4].value)},
      {idx: 5, level: parseInt(dom.T7MagicStoneLevel[5].value)},
    ].sort((a, b) => b.level - a.level);
    this.t8Level = [
      {idx: 0, level: parseInt(dom.T8MagicStoneLevel[0].value)},
      {idx: 1, level: parseInt(dom.T8MagicStoneLevel[1].value)},
      {idx: 2, level: parseInt(dom.T8MagicStoneLevel[2].value)},
      {idx: 3, level: parseInt(dom.T8MagicStoneLevel[3].value)},
      {idx: 4, level: parseInt(dom.T8MagicStoneLevel[4].value)},
      {idx: 5, level: parseInt(dom.T8MagicStoneLevel[5].value)},
    ].sort((a, b) => b.level - a.level);
  }

  plan() {
    // this.getValues();
    let strengthPotionLeft = this.strengthPotion;
    let fortunePotionLeft = this.fortunePotion;
    let totalPoints = 0;
    const dom = this.dom;
    const t5Level = this.t5Level;
    const t6Level = this.t6Level;
    const t7Level = this.t7Level;
    const t8Level = this.t8Level;

    function upgrade(stone, strPotionCost, forPotionCost) {
      stone.maxLevel = stone.level;
      if (stone.level === 0) return;
      if (stone.level === 20) return;
      let canUpgrade = true;
      while (canUpgrade) {
        const strPotionRequired = strPotionCost;
        const forPotionRequired = (stone.maxLevel >= 10)?forPotionCost:0;
        if (
          (strengthPotionLeft >= strPotionRequired) &&
          (fortunePotionLeft >= forPotionRequired)
        ) {
          stone.maxLevel++;
          strengthPotionLeft -= strPotionRequired;
          fortunePotionLeft -= forPotionRequired;
          totalPoints = totalPoints + 3 * strPotionRequired + 28 * forPotionRequired;

          if (stone.maxLevel === 20) canUpgrade = false;
        } else {
          canUpgrade = false;
        }
      }
    }

    t5Level.forEach((stone) => upgrade(stone,   10530,   2000));
    t6Level.forEach((stone) => upgrade(stone,   52840,  10000));
    t7Level.forEach((stone) => upgrade(stone,  263200,  50000));
    t8Level.forEach((stone) => upgrade(stone, 1316000, 250000));
  
    dom.StrengthPotionLeft.innerText = strengthPotionLeft;
    dom.FortunePotionLeft.innerText = fortunePotionLeft;
    dom.Points.innerText = totalPoints.toLocaleString("en-US");

    t5Level.forEach((stone) => {
      dom.MaxT5MagicStoneLevel[stone.idx].innerText = stone.maxLevel;
    });

    t6Level.forEach((stone) => {
      dom.MaxT6MagicStoneLevel[stone.idx].innerText = stone.maxLevel;
    });

    t7Level.forEach((stone) => {
      dom.MaxT7MagicStoneLevel[stone.idx].innerText = stone.maxLevel;
    });

    t8Level.forEach((stone) => {
      dom.MaxT8MagicStoneLevel[stone.idx].innerText = stone.maxLevel;
    });

    this.totalPoints = totalPoints;
    updateTotalPoints();
  }
}

function onMagicUPFieldChange() {
  magicUP.getValues();
  magicUP.plan();
}
