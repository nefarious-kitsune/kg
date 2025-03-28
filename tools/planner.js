/* eslint-env browser */

let unitTalentUP;
let magicUP;
let witchLabUP;
let dragonUP;
let blacksmithUP;
let heroUP;

let TotalPoints;

function toggleCollapsible(id) {
  document.getElementById(id).classList.toggle('collapsed');
}

function validateMinMax() {
  const max = parseInt(this.getAttribute('max'));
  const min = parseInt(this.getAttribute('min'));

  const val = parseInt(this.value);
  if ((val.toString()) !== this.value) this.value = val;

  if (val > max) this.value = max;
  else if (val < min) this.value = min;
}

function validateMin() {
  const min = parseInt(this.getAttribute('min'));

  const val = parseInt(this.value);
  if ((val.toString()) !== this.value) this.value = val;
  if (val < min) this.value = min;
}

function updateTotalPoints() {
  TotalPoints.innerText =
    (
      unitTalentUP.totalPoints +
      magicUP.totalPoints +
      witchLabUP.totalPoints +
      dragonUP.totalPoints +
      blacksmithUP.totalPoints +
      heroUP.totalPoints
    ).toLocaleString("en-US");
}

document.addEventListener("DOMContentLoaded", (e) => {
  TotalPoints =  document.getElementById('total-upgrade-points');

  const inputs = document.getElementsByTagName('input');
  Array.from(inputs).forEach((el) => {
    if (el.hasAttribute('max')) {
      el.addEventListener("change", validateMinMax);
    } else if (el.hasAttribute('min')) {
      el.addEventListener("change", validateMin);
    }
  })

  unitTalentUP = new UnitTalentUpgradePlanner();
  let dom = unitTalentUP.dom;
  dom.T6UnitTalentUpgradeSmall.addEventListener("change", onUnitTalentUPFieldChange);
  dom.T7UnitTalentUpgradeSmall.addEventListener("change", onUnitTalentUPFieldChange);
  dom.T8UnitTalentUpgradeSmall.addEventListener("change", onUnitTalentUPFieldChange);
  dom.T9UnitTalentUpgradeSmall.addEventListener("change", onUnitTalentUPFieldChange);

  dom.T6UnitTalentUpgradeBig.addEventListener("change", onUnitTalentUPFieldChange);
  dom.T7UnitTalentUpgradeBig.addEventListener("change", onUnitTalentUPFieldChange);
  dom.T8UnitTalentUpgradeBig.addEventListener("change", onUnitTalentUPFieldChange);
  dom.T9UnitTalentUpgradeBig.addEventListener("change", onUnitTalentUPFieldChange);
  dom.TalentBookCount.addEventListener("change", onUnitTalentUPFieldChange);
  dom.CrownCount.addEventListener("change", onUnitTalentUPFieldChange);

  dragonUP = new DragonUpgradePlanner();
  dom = dragonUP.dom;
  dom.BronzeLevel.addEventListener("input", onDragonUPEmblemChange);
  dom.SilverLevel.addEventListener("change", onDragonUPEmblemChange);
  dom.GoldLevel.addEventListener("change", onDragonUPEmblemChange);
  dom.LegendaryLevel.addEventListener("change", onDragonUPEmblemChange);
  dom.GreenRuneCount.addEventListener("change", onDragonUPFieldChange);
  dom.PurpleRuneCount.addEventListener("change", onDragonUPFieldChange);
  dom.GoldRuneCount.addEventListener("change", onDragonUPFieldChange);
  dom.FreeRuneCount.addEventListener("change", onDragonUPFieldChange);
  dom.Exchange4Green.addEventListener("change", onDragonUPFieldChange);
  dom.Exchange4Blue.addEventListener("change", onDragonUPFieldChange);
  dom.Exchange4Purple.addEventListener("change", onDragonUPFieldChange);
  dom.Exchange4Gold.addEventListener("change", onDragonUPFieldChange);

  magicUP = new MagicUpgradePlanner();
  dom = magicUP.dom;
  dom.T5MagicStoneLevel.forEach((el) => el.addEventListener("change", onMagicUPFieldChange));
  dom.T6MagicStoneLevel.forEach((el) => el.addEventListener("change", onMagicUPFieldChange));
  dom.T7MagicStoneLevel.forEach((el) => el.addEventListener("change", onMagicUPFieldChange));
  dom.T8MagicStoneLevel.forEach((el) => el.addEventListener("change", onMagicUPFieldChange));
  dom.StrengthPotionCount.addEventListener("change", onMagicUPFieldChange);
  dom.FortunePotionCount.addEventListener("change", onMagicUPFieldChange);

  witchLabUP = new LabUpgradePlanner();
  dom = witchLabUP.dom;
  dom.WitchLabLevel.addEventListener("change", onWitchLabFieldChange);
  dom.LightReagentCount.addEventListener("change", onWitchLabFieldChange);

  blacksmithUP = new BlacksmithUpgradePlanner();
  dom = blacksmithUP.dom;
  dom.BlacksmithLevel.addEventListener("change", onBlacksmithFieldChange);
  dom.ForgeHammerCount.addEventListener("change", onBlacksmithFieldChange);
  
  heroUP = new HeroUpgradePlanner();
  dom = heroUP.dom;
  dom.SSRHeroCount.addEventListener("change", onHeroFieldChange);  
  
  onUnitTalentUPFieldChange();
  onDragonUPEmblemChange();
  onWitchLabFieldChange()
  onMagicUPFieldChange();
  onBlacksmithFieldChange();
  onHeroFieldChange();  
});
