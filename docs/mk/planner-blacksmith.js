/* eslint-env browser */

class BlacksmithUpgradePlanner {
  // Cache DOM elements
  constructor() {
    this.totalPoints = 0;
    const d = document;
    this.dom = {
      ForgeHammerCount: d.getElementById('ForgeHammerCount'),
      BlacksmithLevel: d.getElementById('BlacksmithLevel'),
      ForgeHammerLeft: d.getElementById('ForgeHammerLeft'),
      MaxBlacksmithLevel: d.getElementById('MaxBlacksmithLevel'),
      Points : d.getElementById('blacksmith-upgrade-points'),
    };
  }

  /** Pull values from UI */
  getValues() {
    const dom = this.dom;
    this.forgeHammer = parseInt(dom.ForgeHammerCount.value);
    this.blacksmithLevel = parseInt(dom.BlacksmithLevel.value);
  }

  plan() {
    let totalPoints = 0;
    const dom = this.dom;

    let blacksmithLevel = this.blacksmithLevel;
    let forgeHammerLeft = this.forgeHammer;

    let idx = BlacksmithUpgradeCost.findLastIndex((b) => b.startLevel < blacksmithLevel);

    let startLevel =  BlacksmithUpgradeCost[idx].startLevel;
    let endLevel =
        (BlacksmithUpgradeCost.length > idx + 1)?
        BlacksmithUpgradeCost[idx + 1].startLevel:
        2000;

    let canUpgrade = true;

    while (canUpgrade) {
      if (blacksmithLevel >= endLevel) {
        idx++;
        startLevel =  BlacksmithUpgradeCost[idx].startLevel;
        endLevel =
          (BlacksmithUpgradeCost.length > idx + 1)?
          BlacksmithUpgradeCost[idx + 1].startLevel:
          2000;
      }

      const qtyNeeded = BlacksmithUpgradeCost[idx].cost; // should be (index * 5);

      if (forgeHammerLeft > qtyNeeded) {
        blacksmithLevel++;
        forgeHammerLeft -= qtyNeeded;
        totalPoints += qtyNeeded * 70;
        if (blacksmithLevel === 2000) canUpgrade = false;
      } else {
        canUpgrade = false;
      }

    } // while (canUpgrade)

    dom.ForgeHammerLeft.innerText = forgeHammerLeft;
    dom.MaxBlacksmithLevel.innerText = blacksmithLevel;
    dom.Points.innerText = totalPoints.toLocaleString("en-US");
    this.totalPoints = totalPoints;
    updateTotalPoints();
  }
}

function onBlacksmithFieldChange() {
  blacksmithUP.getValues();
  blacksmithUP.plan();
}
