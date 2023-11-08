/* eslint-env browser */

class LabUpgradePlanner {
  // Cache DOM elements
  constructor() {
    this.totalPoints = 0
    const d = document;
    this.dom = {
      LightReagentCount: d.getElementById('LightReagentCount'),
      WitchLabLevel: d.getElementById('WitchLabLevel'),
      LightReagentLeft: d.getElementById('LightReagentLeft'),
      MaxWitchLabLevel: d.getElementById('MaxWitchLabLevel'),
      Points : d.getElementById('witch-lab-upgrade-points'),
    };
  }

  /** Pull values from UI */
  getValues() {
    const dom = this.dom;
    this.lightReagent = parseInt(dom.LightReagentCount.value);
    this.witchLabLevel = parseInt(dom.WitchLabLevel.value);
  }

  plan() {
    let totalPoints = 0;
    const dom = this.dom;

    let witchLabLevel = this.witchLabLevel;
    let lightReagentLeft = this.lightReagent;

    let idx = WitchLabUpgradeCost.findLastIndex((b) => b.startLevel < witchLabLevel);
    let startLevel = WitchLabUpgradeCost[idx].startLevel;
    let endLevel =
        (WitchLabUpgradeCost.length > idx + 1)?
        WitchLabUpgradeCost[idx + 1].startLevel:
        2000;

    let canUpgrade = true;

    while (canUpgrade) {
      if (witchLabLevel >= endLevel) {
        idx++;
        startLevel = WitchLabUpgradeCost[idx].startLevel;
        endLevel =
          (WitchLabUpgradeCost.length > idx + 1)?
          WitchLabUpgradeCost[idx + 1].startLevel:
          2000;
      }

      const qtyNeeded = WitchLabUpgradeCost[idx].cost; // should be (index * 5);

      if (lightReagentLeft >= qtyNeeded) {
        witchLabLevel++;
        lightReagentLeft -= qtyNeeded;
        totalPoints += qtyNeeded * 70;
        if (witchLabLevel === 2000) canUpgrade = false;
      } else {
        canUpgrade = false;
      }

    } // while (canUpgrade)

    dom.LightReagentLeft.innerText = lightReagentLeft;
    dom.MaxWitchLabLevel.innerText = witchLabLevel;
    dom.Points.innerText = totalPoints.toLocaleString("en-US");
    this.totalPoints = totalPoints;
    updateTotalPoints();
  }
}

function onWitchLabFieldChange() {
  witchLabUP.getValues();
  witchLabUP.plan();
}
