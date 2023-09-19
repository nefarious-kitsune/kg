/* eslint-env browser */

const BlacksmithBracket = [
  0, 4, 8, 13, 18, 24, 29, 35, 40, 46, 52, 58, 64, 70, 76, 82, 88, 94,
  100, 106, 112, 118, 124, 130, 136, 142, 149, 156, 163, 170, 177, 184,
  191, 197, 204, 211, 218, 225, 232, 239, 246, 253, 260, 267, 274, 281,
  288, 294, 301, 308, 315, 322, 328, 335, 342, 349, 356, 363, 370, 376,
  383, 389, 396, 405, 412, 419, 426, 434, 441, 448, 455, 462, 469, 476,
  483, 491, 499, 506, 514, 521, 528, 536, 543, 550, 558, 565, 572, 579,
  586, 593, 600, 607, 615, 623, 631, 639, 647, 654, 662, 669, 677, 685,
  692, 700, 708, 716, 724, 732, 740, 748, 756, 763, 771, 778, 786, 794,
  801, 809, 817, 824, 832, 840, 848, 855, 863, 871, 878, 886, 893, 900,
  908, 916, 923, 931, 939, 946, 954, 961, 969, 977, 984, 992,
  1000, 1008, 1015, 1023, 1031, 1039, 1046, 1054, 1062, 1069, 1077,
  1085, 1093, 1101, 1110, 1118, 1126, 1134, 1142, 1150, 1157, 1165,
  1173, 1181, 1189, 1197, 1205, 1213, 1221, 1229, 1237, 1245, 1253,
  1261, 1269, 1277, 1285, 1293, 1301, 1309, 1317, 1325, 1333, 1341,
  1349, 1357, 1365, 1373, 1381, 1389, 1397, 1405, 1413, 1421, 1429,
  1437, 1445, 1453, 1461, 1469, 1477, 1485, 1493, 1501, 1510, 1518,
  1526, 1534, 1542, 1550, 1558, 1566, 1574, 1582, 1591, 1600, 1609,
  1618, 1626, 1635, 1643, 1652, 1661, 1670, 1679, 1688, 1697, 1706,
  1715, 1724, 1733, 1742, 1751, 1760, 1769, 1778, 1787, 1796, 1805,
  1814, 1823, 1832, 1841, 1850, 1859, 1868, 1877, 1886, 1895, 1904,
  1913, 1922, 1931, 1940, 1950, 1960, 1970, 1980, 1990
]

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

    let bracketIdx = BlacksmithBracket.findIndex((lvl) => lvl > blacksmithLevel) - 1;
    let bracketCeil = BlacksmithBracket[bracketIdx+1];

    let canUpgrade = true;

    while (canUpgrade) {
      if (blacksmithLevel >= bracketCeil) {
        bracketIdx++;
        bracketCeil = BlacksmithBracket[bracketIdx+1];
      }
      const qtyNeeded = (bracketIdx + 1) * 5;
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
