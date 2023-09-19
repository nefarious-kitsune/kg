/* eslint-env browser */
class UnitTalentUpgradePlanner {
  // Cache DOM elements
  constructor() {
    this.totalPoints = 0
    const d = document;
    this.dom = {
      TalentBookCount: d.getElementById('TalentBookCount'),
      CrownCount : d.getElementById('CrownCount'),
      TalentBookLeft: d.getElementById('TalentBookLeft'),
      CrownLeft : d.getElementById('CrownLeft'),
      T6UnitTalentUpgradeSmall: d.getElementById('T6UnitTalentUpgradeSmall'),
      T7UnitTalentUpgradeSmall: d.getElementById('T7UnitTalentUpgradeSmall'),
      T8UnitTalentUpgradeSmall: d.getElementById('T8UnitTalentUpgradeSmall'),
      T9UnitTalentUpgradeSmall: d.getElementById('T9UnitTalentUpgradeSmall'),
      T6UnitTalentUpgradeBig: d.getElementById('T6UnitTalentUpgradeBig'),
      T7UnitTalentUpgradeBig: d.getElementById('T7UnitTalentUpgradeBig'),
      T8UnitTalentUpgradeBig: d.getElementById('T8UnitTalentUpgradeBig'),
      T9UnitTalentUpgradeBig: d.getElementById('T9UnitTalentUpgradeBig'),
      MaxT6UnitTalentUpgradeSmall: d.getElementById('MaxT6UnitTalentUpgradeSmall'),
      MaxT7UnitTalentUpgradeSmall: d.getElementById('MaxT7UnitTalentUpgradeSmall'),
      MaxT8UnitTalentUpgradeSmall: d.getElementById('MaxT8UnitTalentUpgradeSmall'),
      MaxT9UnitTalentUpgradeSmall: d.getElementById('MaxT9UnitTalentUpgradeSmall'),
      MaxT6UnitTalentUpgradeBig: d.getElementById('MaxT6UnitTalentUpgradeBig'),
      MaxT7UnitTalentUpgradeBig: d.getElementById('MaxT7UnitTalentUpgradeBig'),
      MaxT8UnitTalentUpgradeBig: d.getElementById('MaxT8UnitTalentUpgradeBig'),
      MaxT9UnitTalentUpgradeBig: d.getElementById('MaxT9UnitTalentUpgradeBig'),
      Points : d.getElementById('unit-talent-upgrade-points'),
    };
  }

  /** Pull values from UI */
  getValues() {
    const dom = this.dom;
    this.talentBook = parseInt(dom.TalentBookCount.value);
    this.crown = parseInt(dom.CrownCount.value);
    this.unitTalentUpgrade = {
      t6: [
        parseInt(dom.T6UnitTalentUpgradeSmall.value),
        parseInt(dom.T6UnitTalentUpgradeBig.value)
      ],
      t7: [
        parseInt(dom.T7UnitTalentUpgradeSmall.value),
        parseInt(dom.T7UnitTalentUpgradeBig.value)
      ],
      t8: [
        parseInt(dom.T8UnitTalentUpgradeSmall.value),
        parseInt(dom.T8UnitTalentUpgradeBig.value)
      ],
      t9: [
        parseInt(dom.T9UnitTalentUpgradeSmall.value),
        parseInt(dom.T9UnitTalentUpgradeBig.value)
      ],
    }
  }

  plan() {
    // this.getValues();
    let talentBookLeft = this.talentBook;
    let crownLeft = this.crown;
    let totalPoints = 0;
    const dom = this.dom;

    function upgrade(goal, bookCost, crownCost) {
      if (goal <= 0) return 0;

      const max = Math.min(
        Math.floor(talentBookLeft / bookCost),
        Math.floor(crownLeft / crownCost),
      );

      const actual = Math.min(goal, max);

      if (actual > 0) {
        totalPoints = totalPoints + (5 * bookCost + 56 * crownCost) * actual;
        talentBookLeft -= bookCost * actual;
        crownLeft -= crownCost * actual;
      }

      return actual;
    }

    const maxUpgrade = {
      t6: [
        upgrade(this.unitTalentUpgrade.t6[0], 12500, 0),
        upgrade(this.unitTalentUpgrade.t6[1], 25000, 12500),
      ],
      t7: [
        upgrade(this.unitTalentUpgrade.t7[0], 62500, 0),
        upgrade(this.unitTalentUpgrade.t7[1], 125000, 62500),
      ],
      t8: [
        upgrade(this.unitTalentUpgrade.t8[0], 312500, 0),
        upgrade(this.unitTalentUpgrade.t8[1], 625000, 312500),
      ],
      t9: [
        upgrade(this.unitTalentUpgrade.t9[0], 1562500, 0),
        upgrade(this.unitTalentUpgrade.t9[1], 3125000, 1562500),
      ],
    }
  
    dom.TalentBookLeft.innerText = talentBookLeft;
    dom.CrownLeft.innerText = crownLeft;
    dom.Points.innerText = totalPoints.toLocaleString("en-US");

    let el;
    el = dom.MaxT6UnitTalentUpgradeSmall;
    el.innerText = maxUpgrade.t6[0];
    if (
      (this.unitTalentUpgrade.t6[0] > 0) &&
      (maxUpgrade.t6[0] < this.unitTalentUpgrade.t6[0])
    ) {
      el.classList.add('error');
    } else {
      el.classList.remove('error');
    }

    el = dom.MaxT7UnitTalentUpgradeSmall;
    el.innerText = maxUpgrade.t7[0];
    if (
      (this.unitTalentUpgrade.t7[0] > 0) &&
      (maxUpgrade.t7[0] < this.unitTalentUpgrade.t7[0])
    ) {
      el.classList.add('error');
    } else {
      el.classList.remove('error');
    }

    el = dom.MaxT8UnitTalentUpgradeSmall;
    el.innerText = maxUpgrade.t8[0];
    if (
      (this.unitTalentUpgrade.t8[0] > 0) &&
      (maxUpgrade.t8[0] < this.unitTalentUpgrade.t8[0])
    ) {
      el.classList.add('error');
    } else {
      el.classList.remove('error');
    }

    el = dom.MaxT9UnitTalentUpgradeSmall;
    el.innerText = maxUpgrade.t9[0];
    if (
      (this.unitTalentUpgrade.t9[0] > 0) &&
      (maxUpgrade.t9[0] < this.unitTalentUpgrade.t9[0])
    ) {
      el.classList.add('error');
    } else {
      el.classList.remove('error');
    }
    
    
    el = dom.MaxT6UnitTalentUpgradeBig;
    el.innerText = maxUpgrade.t6[1];
    if (
      (this.unitTalentUpgrade.t6[1] > 0) &&
      (maxUpgrade.t6[1] < this.unitTalentUpgrade.t6[1])
    ) {
      el.classList.add('error');
    } else {
      el.classList.remove('error');
    }

    el = dom.MaxT7UnitTalentUpgradeBig;
    el.innerText = maxUpgrade.t7[1];
    if (
      (this.unitTalentUpgrade.t7[1] > 0) &&
      (maxUpgrade.t7[1] < this.unitTalentUpgrade.t7[1])
    ) {
      el.classList.add('error');
    } else {
      el.classList.remove('error');
    }

    el = dom.MaxT8UnitTalentUpgradeBig;
    el.innerText = maxUpgrade.t8[1];
    if (
      (this.unitTalentUpgrade.t8[1] > 0) &&
      (maxUpgrade.t8[1] < this.unitTalentUpgrade.t8[1])
    ) {
      el.classList.add('error');
    } else {
      el.classList.remove('error');
    }

    el = dom.MaxT9UnitTalentUpgradeBig;
    el.innerText = maxUpgrade.t9[1];
    if (
      (this.unitTalentUpgrade.t9[1] > 0) &&
      (maxUpgrade.t9[1] < this.unitTalentUpgrade.t9[1])
    ) {
      el.classList.add('error');
    } else {
      el.classList.remove('error');
    }

    this.totalPoints = totalPoints;
    updateTotalPoints();
  }
}

function onUnitTalentUPFieldChange() {
  unitTalentUP.getValues();
  unitTalentUP.plan();
}


