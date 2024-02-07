/* eslint-env browser */
// version 2.0.1

const heroUpgradeCost = [
  ,
  20, 20,
  30, 40, 50,
  60, 70, 80, 80,
  100, 110, 120, 130, 140,
  170, 180, 190, 200, 210,
];

const heroStarDisplayText = [
  'N/A',
  '0/2', '1/2',
  '★', '★ 1/3', '★ 2/3',
  '★★', '★★ 1/4', '★★ 2/4', '★★ 3/4',
  '★★★', '★★★ 1/5', '★★★ 2/5', '★★★ 3/5', '★★★ 4/5',
  '★★★★', '★★★★ 1/5', '★★★★ 2/5', '★★★★ 3/6', '★★★★ 4/5',
  '★★★★★',
]


const HeroUpgradePlanner = {
  data: {
    'points': 0,
    'hero-name': [],
    'hero-star-before': [],
    'hero-star-after': [],
    'hero-card-before': [],
    // 'hero-card-after': [],
  },

  init: function() {
    const d = document;
    // const up = this;

    /** User input elements */
    this.inputs = {
      /** @type {HTMLInputElement[]} */
      'hero-name': [],
      /** @type {HTMLSelectElement[]} */
      'hero-star': [],
      /** @type {HTMLInputElement[]} */
      'hero-card': [],
    };

    /** Output elements */
    this.outputs = {
      /** @type {HTMLOutputElement} */
      'points': d.getElementById('o-hero-upgrade-points'),
      /** @type {HTMLLabelElement[]} */
      'hero-name': [],
      /** @type {HTMLOutputElement[]} */
      'hero-star-before': [],
      /** @type {HTMLOutputElement[]} */
      'hero-star-after': [],
      /** @type {HTMLOutputElement[]} */
      // 'hero-card-before': [],
      /** @type {HTMLOutputElement[]} */
      // 'hero-card-after': [],
    };

    for (let i = 0; i < 20; i++) {
      let el = d.getElementById(`i-hero-name-${i+1}`);
      el.addEventListener('change', this.onFieldChange);
      this.inputs['hero-name'].push(el);

      el = d.getElementById(`i-hero-star-level-${i+1}`);
      el.addEventListener('change', this.onFieldChange);
      this.inputs['hero-star'].push(el);

      el = d.getElementById(`i-hero-card-${i+1}`);
      el.addEventListener('change', this.onFieldChange);
      this.inputs['hero-card'].push(el);

      this.outputs['hero-name'].push(d.getElementById(`o-hero-name-${i+1}`));
      this.outputs['hero-star-before'].push(d.getElementById(`o-hero-star-before-${i+1}`));
      this.outputs['hero-star-after' ].push(d.getElementById(`o-hero-star-after-${i+1}`));
      // this.outputs['hero-card-before'].push(d.getElementById(`o-hero-card-before-${i+1}`));
      // this.outputs['hero-card-after' ].push(d.getElementById(`o-hero-card-after-${i+1}`));
    }
    this.loadData();
    this.getUserData();
    this.calculate();
    this.updateUI();
  },

  loadData: function() {
    const loadNumber = (key, defaultVal) => {
      let val = parseInt(localStorage.getItem(key));
      return (isNaN(val))?defaultVal:val;
    };

    const loadString = (key) => {
      let str = localStorage.getItem(key);
      if (str === null) return '';
      return str;
    };

    for (let idx = 0; idx < 20; idx++ ) {
      let name = loadString(`planner-hero-hero-name-${idx+1}`)
      let card = loadNumber(`planner-hero-card-before-${idx+1}`, 0);
      let star = loadNumber(`planner-hero-star-before-${idx+1}`, 0);

      this.inputs['hero-name'][idx].value = name;
      this.inputs['hero-card'][idx].value = card;
      this.inputs['hero-star'][idx].options.selectedIndex = star;
    }
  },

  saveData: function() {
    for (let idx = 0; idx < 20; idx++ ) {
      localStorage.setItem(
        `planner-hero-hero-name-${idx+1}`,
        this.data['hero-name'][idx],
      );

      localStorage.setItem(
        `planner-hero-star-before-${idx+1}`,
        this.data['hero-star-before'][idx],
      );

      localStorage.setItem(
        `planner-hero-card-before-${idx+1}`,
        this.data['hero-card-before'][idx],
      );
    }
    
  },

  getUserData: function() {
    for (let idx = 0; idx < 20; idx++ ) {
      this.data['hero-name'][idx] = this.inputs['hero-name'][idx].value.trim();
      this.data['hero-star-before'][idx] = this.inputs['hero-star'][idx].options.selectedIndex;
      this.data['hero-card-before'][idx] = parseInt(this.inputs['hero-card'][idx].value) || null;
    }
  },

  updateUI: function() {
    for (let idx = 0; idx < 20; idx++ ) {
      this.outputs['hero-name'][idx].innerText = this.data['hero-name'][idx] || `Hero ${idx+1}`;
      this.outputs['hero-star-before'][idx].innerText = heroStarDisplayText[this.data['hero-star-before'][idx]];
      this.outputs['hero-star-after' ][idx].innerText = heroStarDisplayText[this.data['hero-star-after'][idx]];
    }
    this.outputs['points'].innerText = formatNumber(this.data['points']);
  },

  onFieldChange: function() {
    const up = HeroUpgradePlanner;
    up.getUserData();
    up.calculate();
    up.saveData();
    up.updateUI();
  },

  calculate: function() {
    let totalPoints = 0;
    for (let idx = 0; idx < 20; idx++ ) {
      // const name = this.data['hero-name'][idx];
      const starBefore = this.data['hero-star-before'][idx];
      const cardBefore = this.data['hero-card-before'][idx];
      let starAfter = starBefore;
      let cardAfter = cardBefore;

      if ((starBefore !== 0) && (cardBefore > 0)) {
        let keepUpgrading = (starAfter >= 20)?false:true;

        while (keepUpgrading) {
          const cost = heroUpgradeCost[starAfter];
          if (cardAfter > cost) {
            starAfter++;
            cardAfter -= cost;
            totalPoints += cost * 14000;
          } else {
            keepUpgrading = false;
          }
          if (starAfter >= 20) keepUpgrading = false;
        }
      }

      this.data['hero-star-after'][idx] = starAfter;
      // this.data['hero-card-after'][idx] = cardAfter;
    }

    this.data['points'] = totalPoints;
    if (typeof MasterPlanner !== 'undefined') MasterPlanner.updateTotalPoints();
  }
}

function resetRow(rowId) {
  const up = HeroUpgradePlanner;
  up.inputs['hero-name'][rowId-1].value = '';
  up.inputs['hero-star'][rowId-1].selectedIndex = 0;
  up.inputs['hero-card'][rowId-1].value = '';
}
