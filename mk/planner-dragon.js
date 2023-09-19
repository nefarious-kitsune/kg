/* eslint-env browser */
class DragonUpgradePlanner {
  // Cache DOM elements
  constructor() {
    this.totalPoints = 0
    const d = document;
    this.dom = {
      GreenRuneCount  : d.getElementById('GreenRuneCount'),
      BlueRuneCount   : d.getElementById('BlueRuneCount'),
      PurpleRuneCount : d.getElementById('PurpleRuneCount'),
      GoldRuneCount   : d.getElementById('GoldRuneCount'),

      FreeRuneCount   : d.getElementById('FreeRuneCount'),
      Exchange4Green  : d.getElementById('Exchange4Green'),
      Exchange4Blue   : d.getElementById('Exchange4Blue'),
      Exchange4Purple : d.getElementById('Exchange4Purple'),
      Exchange4Gold   : d.getElementById('Exchange4Gold'),

      BronzeLevel    : d.getElementById('BronzeEmblemLevel'),
      SilverLevel    : d.getElementById('SilverEmblemLevel'),
      GoldLevel      : d.getElementById('GoldEmblemLevel'),
      LegendaryLevel : d.getElementById('LegendaryEmblemLevel'),

      GreenRuneLeft : d.getElementById('GreenRuneLeft'),
      BlueRuneLeft : d.getElementById('BlueRuneLeft'),
      PurpleRuneLeft : d.getElementById('PurpleRuneLeft'),
      GoldRuneLeft : d.getElementById('GoldRuneLeft'),
      FreeRuneLeft : d.getElementById('FreeRuneLeft'),

      MaxBronzeLevel : d.getElementById('MaxBronzeEmblemLevel'),
      MaxSilverLevel : d.getElementById('MaxSilverEmblemLevel'),
      MaxGoldLevel : d.getElementById('MaxGoldEmblemLevel'),
      MaxLegendaryLevel : d.getElementById('MaxLegendaryEmblemLevel'),
      Points : d.getElementById('dragon-upgrade-points'),
    };
  }

  /** Pull values from UI */
  getValues() {
    const dom = this.dom;
    this.bag = {
      green: parseInt(dom.GreenRuneCount.value),
      blue:  parseInt(dom.BlueRuneCount.value),
      purple: parseInt(dom.PurpleRuneCount.value),
      gold:   parseInt(dom.GoldRuneCount.value),
      free:   parseInt(dom.FreeRuneCount.value),
    };
    
    this.exchange = {
      green:  dom.Exchange4Green.checked,
      blue:   dom.Exchange4Blue.checked,
      purple: dom.Exchange4Purple.checked,
      gold:   dom.Exchange4Gold.checked,
    };
    
    this.emblems = {
      bronze: parseInt(dom.BronzeLevel.value),
      silver: parseInt(dom.SilverLevel.value),
      gold:   parseInt(dom.GoldLevel.value),
      legendary: parseInt(dom.LegendaryLevel.value),
    };
  }

  /** Get valid emblem range */
  getEmblemRange() {
    const bronzeLevel = this.emblems.bronze;
    const ranges = {};

    if (bronzeLevel % 100 === 0) {
      const max = bronzeLevel / 100;
      ranges.legendary = [max-1, max];
    } else {
      const max = Math.floor(bronzeLevel / 100);
      ranges.legendary = [max, max];
    }

    if (bronzeLevel % 20 === 0) {
      const max = bronzeLevel / 20;
      ranges.gold = [max-1, max];
    } else {
      const max = Math.floor(bronzeLevel / 20);
      ranges.gold = [max, max];
    }

    if (bronzeLevel % 5 === 0) {
      const max = bronzeLevel / 5;
      ranges.silver = [max-1, max];
    } else {
      const max = Math.floor(bronzeLevel / 5);
      ranges.silver = [max, max];
    }

    this.emblemRanges = ranges;
  }

  /** Update validate input range based on bronze level value */
  updateEmblemRange() {
    const dom = this.dom;
    const emblemRanges = this.emblemRanges;
    let el = dom.LegendaryLevel;
    let val = parseInt(el.value);
    let min = emblemRanges.legendary[0];
    let max = emblemRanges.legendary[1];
    el.setAttribute('min', min);
    el.setAttribute('max', max);
    if (val < min) el.value = min;
    else if (val > max) el.value = max;

    el = dom.GoldLevel;
    val = parseInt(el.value);
    min = emblemRanges.gold[0];
    max = emblemRanges.gold[1];
    el.setAttribute('min', min);
    el.setAttribute('max', max);
    if (val < min) el.value = min;
    else if (val > max) el.value = max;

    el = dom.SilverLevel;
    val = parseInt(el.value);
    min = this.emblemRanges.silver[0];
    max = this.emblemRanges.silver[1];
    el.setAttribute('min', min);
    el.setAttribute('max', max);
    if (val < min) el.value = min;
    else if (val > max) el.value = max;
  }

  /** Check if emblem levels are correct */
  // checkLevels() {
  //   return (
  //     (this.emblems.silver === this.emblemRanges.silver[0]) ||
  //     (this.emblems.silver === this.emblemRanges.silver[1])
  //   ) && (
  //     (this.emblems.gold === this.emblemRanges.gold[0]) ||
  //     (this.emblems.gold === this.emblemRanges.gold[1])
  //   ) && (
  //     (this.emblems.legendary === this.emblemRanges.legendary[0]) ||
  //     (this.emblems.legendary === this.emblemRanges.legendary[1])
  //   );
  // }

  /** Get which emblem needs upgrade next */
  getNextUpgrade() {
    const emblems = this.emblems;
    if (emblems.bronze % 100 === 0) {
      if (emblems.legendary === emblems.bronze / 100) return "bronze";
      if (emblems.gold === emblems.bronze / 20) return "legendary";
      if (emblems.silver === emblems.bronze / 5) return "gold";
      return "silver";
    }
  
    if (emblems.bronze % 20 === 0) {
      if (emblems.gold === emblems.bronze / 20) return "bronze";
      if (emblems.silver === emblems.bronze / 5) return "gold";
      return "silver";
    }
  
    if (emblems.bronze % 5 === 0) {
      if (emblems.silver === emblems.bronze / 5) return "bronze";
      return "silver";
    }
  
    return "bronze";
  }

  plan() {
    // this.getValues();
    // this.getEmblemRange();

    // if (!this.checkLevels()) {
    //   this.dom.DragonPlanMessage.innerText =
    //     "Error: the emblem levels are incorrect!";
    //   this.dom.DragonPlanResult.style.display = "none";
    //   return;
    // }

    const bag = Object.assign({}, this.bag);
    const emblems = Object.assign({}, this.emblems);
    const exchange = this.exchange;
    let totalPoints = 0;
  
    let canUpgrade = true;
    let runOutOf = '';
  
    while (canUpgrade) {
      const nextUpgrade = this.getNextUpgrade();
      let qtyNeeded;
      let nextLevel;
      switch (nextUpgrade) {
        case "bronze":
          nextLevel = emblems.bronze + 1;
          qtyNeeded = Math.min(250, nextLevel * 5);
          if (bag.green >= qtyNeeded) {
            bag.green -= qtyNeeded;
            totalPoints += qtyNeeded * 70;
            emblems.bronze++;
            canUpgrade = true;
          } else {
            if (!exchange.green) {
              canUpgrade = false;
              runOutOf = `Rare (${qtyNeeded})`;
            } else {
              const exchangeRate = 200;
              if ((bag.free * exchangeRate + bag.green) >  qtyNeeded) {
                  const exchanged = Math.ceil((qtyNeeded - bag.green) / exchangeRate);
                  bag.free = bag.free - exchanged;
                  bag.green = bag.green + (exchanged * exchangeRate) - qtyNeeded;
                  totalPoints += qtyNeeded * 70;
                  emblems.bronze++;
                  canUpgrade = true;
              } else {
                  canUpgrade = false;
                  runOutOf = 'Rare 2';
              }
            }
          }
          break;
        case "silver":
          nextLevel = emblems.silver + 1;
          qtyNeeded = Math.min(125, Math.floor(nextLevel * 2.5));
          if (bag.blue >= qtyNeeded) {
            bag.blue -= qtyNeeded;
            totalPoints += qtyNeeded * 700;
            emblems.silver++;
            canUpgrade = true;
          } else {
            if (!exchange.blue) {
              canUpgrade = false;
              runOutOf = 'Excellent';
            } else {
              const exchangeRate = 20;
              if ((bag.free * exchangeRate + bag.blue) >  qtyNeeded) {
                const exchanged = Math.ceil((qtyNeeded - bag.blue) / exchangeRate);
                bag.free = bag.free - exchanged;
                bag.blue = bag.blue + (exchanged * exchangeRate) - qtyNeeded;
                totalPoints += qtyNeeded * 70;
                emblems.silver++;
                canUpgrade = true;
              } else {
                canUpgrade = false;
                runOutOf = 'Excellent';
              }
            }
          }
          break;
        case "gold":
          nextLevel = emblems.gold + 1;
          qtyNeeded = Math.min(66, 2 + Math.floor((nextLevel-1)*4/3));
          if (bag.purple >= qtyNeeded) {
            bag.purple -= qtyNeeded;
            totalPoints += qtyNeeded * 7000;
            emblems.gold++;
            canUpgrade = true;
          } else {
            if (!exchange.purple) {
              canUpgrade = false;
              runOutOf = 'Perfect';
            } else {
              const exchangeRate = 2;
              if ((bag.free * exchangeRate + bag.purple) >  qtyNeeded) {
                const exchanged = Math.ceil((qtyNeeded - bag.purple) / exchangeRate);
                bag.free = bag.free - exchanged;
                bag.purple = bag.purple + (exchanged * exchangeRate) - qtyNeeded;
                totalPoints += qtyNeeded * 7000;
                emblems.gold++;
                canUpgrade = true;
              } else {
                canUpgrade = false;
                runOutOf = 'Perfect';
              }
            }
          }
          break;
        case "legendary":
          nextLevel = emblems.legendary + 1;
          qtyNeeded = nextLevel * 10;
          if (bag.gold >= qtyNeeded) {
            bag.gold -= qtyNeeded;
            totalPoints += qtyNeeded * 14000;
            emblems.legendary++;
            canUpgrade = true;
          } else {
            if (!exchange.gold) {
              canUpgrade = false;
              runOutOf = 'Epic';
            } else {
              if ((bag.free + bag.gold) > qtyNeeded) {
                bag.free = bag.free - (qtyNeeded - bag.gold);
                bag.gold = 0;
                totalPoints += qtyNeeded * 14000;
                emblems.legendary++;
                canUpgrade = true;
              } else {
                canUpgrade = false;
                runOutOf = 'Epic';
              }
            }
          }
          break;
      } // switch (nextUpgrade)
    } // while (canUpgrade)
  
    this.dom.GreenRuneLeft.innerText = bag.green;
    this.dom.BlueRuneLeft.innerText = bag.blue;
    this.dom.PurpleRuneLeft.innerText = bag.purple;
    this.dom.GoldRuneLeft.innerText = bag.gold;
    this.dom.FreeRuneLeft.innerText = bag.free;
    this.dom.MaxBronzeLevel.innerText = emblems.bronze;
    this.dom.MaxSilverLevel.innerText = emblems.silver;
    this.dom.MaxGoldLevel.innerText = emblems.gold;
    this.dom.MaxLegendaryLevel.innerText = emblems.legendary;
    this.dom.Points.innerText = totalPoints.toLocaleString("en-US");
  
    // this.dom.DragonPlanResult.style.display = "block";
    // this.dom.DragonPlanMessage.innerHTML =
    // 'Above is your max upgrade result. You cannot upgrade further ' +
    // 'because you do not have enough ' +
    // `<span style="font-weight:bold;">${runOutOf} Runes</span>.` +
    // 'You will get about ' +
    // `<span style="font-weight:bold;">${totalPoints} points</span> for MK/UP event.`;

    this.totalPoints = totalPoints;
    updateTotalPoints();
  }
}

function onDragonUPEmblemChange() {
  dragonUP.getValues();
  dragonUP.getEmblemRange();
  dragonUP.updateEmblemRange();
  dragonUP.plan();
}

function onDragonUPFieldChange() {
  dragonUP.getValues();
  dragonUP.plan();
}
