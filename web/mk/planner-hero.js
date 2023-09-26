/* eslint-env browser */

class HeroUpgradePlanner {
  // Cache DOM elements
  constructor() {
    this.totalPoints = 0
    const d = document;
    this.dom = {
      SSRHeroCount: document.getElementById('SSRHeroCount'),
      Points : d.getElementById('hero-upgrade-points'),
    };
  }

  /** Pull values from UI */
  getValues() {
    this.ssrHeroCount = parseInt(this.dom.SSRHeroCount.value);
  }

  plan() {
    this.totalPoints = this.ssrHeroCount * 14000;
    this.dom.Points.innerText = this.totalPoints.toLocaleString("en-US");
    updateTotalPoints();
  }
}

function onHeroFieldChange() {
  heroUP.getValues();
  heroUP.plan();
}
