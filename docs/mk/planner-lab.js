/* eslint-env browser */

const LabBrackets = [
  0, 3, 7, 12, 17, 22, 28, 34, 41, 47, 54, 61, 68, 75, 82, 90, 97,
  105, 113, 121, 129, 137, 145, 153, 161, 169, 178, 187, 196, 205,
  214, 223, 232, 241, 250, 260, 269, 278, 288, 297, 307, 316, 326,
  336, 346, 355, 365, 375, 385, 395, 406, 416, 426, 436, 447, 457,
  467, 478, 488, 499, 510, 520, 531, 542, 552, 563, 574, 585, 596,
  607, 618, 629, 640, 651, 662, 674, 685, 696, 707, 719, 730, 742,
  753, 764, 775, 787, 799, 811, 823, 835, 847, 859, 870, 882, 893,
  905, 917, 929, 941, 953, 965, 977, 989, 1001, 1013, 1025, 1037,
  1049, 1062, 1075, 1088, 1100, 1112, 1125, 1137, 1150, 1162, 1175,
  1188, 1201, 1214, 1227, 1240, 1253, 1266, 1279, 1292, 1305, 1318,
  1331, 1344, 1357, 1370, 1383, 1396, 1409, 1422, 1435, 1448, 1461,
  1474, 1487, 1500, 1513, 1526, 1539, 1552, 1565, 1579, 1593, 1606,
  1619, 1632, 1645, 1659, 1672, 1685, 1698, 1711, 1724, 1738, 1751,
  1765, 1778, 1791, 1805, 1819, 1833, 1847, 1861, 1875, 1889, 1903,
  1917, 1931, 1945, 1959, 1972, 1986
]

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

    let bracketIdx = LabBrackets.findIndex((lvl) => lvl > witchLabLevel) - 1;
    let bracketCeil = LabBrackets[bracketIdx+1];

    let canUpgrade = true;

    while (canUpgrade) {
      if (witchLabLevel >= bracketCeil) {
        bracketIdx++;
        bracketCeil = LabBrackets[bracketIdx+1];
      }
      const qtyNeeded = (bracketIdx + 1) * 5;
      if (lightReagentLeft > qtyNeeded) {
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

