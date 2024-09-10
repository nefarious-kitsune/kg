/* eslint-env browser */
/* eslint-disable no-unused-vars */
/* eslint-disable no-multi-spaces, key-spacing */
/* eslint-disable require-jsdoc */

/**
 * Calculate Unit upgrades
 * @param {number[]} unitA - Data for Archer unit
 * @param {number[]} unitB - Data for Fire unit
 * @param {number[]} unitC - Data for Ice unit
 * @param {number[]} unitD - Data for Goblin unit
 * @param {number} freePick - Current inventory of Free-Pick EXP Book
 * @return {[[Number]]}
 */
function calcUnitUpgrade(unitA, unitB, unitC, unitD, freePick) {
  let allUnits = [unitA, unitB, unitC, unitD];
  let maxProgress = 100;

  const evolution1 = (unit) => {
    let [tier, progress, t1, t2, t3, t4] = unit;

    if (tier !== 1) return unit;
    if (progress >= maxProgress) return [[tier + 1, 0, t1, t2, t3, t4]];

    if ((maxProgress - progress) <= t1) {
      t1 -= (maxProgress - progress);
      return [tier + 1, 0, t1, t2, t3, t4];
    } else {
      progress += t1;
      t1 = 0;
    }

    if (freePick <= 0) return [tier, progress, t1, t2, t3, t4];

    if ((maxProgress - progress) <= freePick) {
      freePick -= (maxProgress - progress);
      progress = 0;
      tier++;
      return [tier + 1, 0, t1, t2, t3, t4];
    } else {
      progress += freePick;
      freePick = 0;
    }

    return [tier, progress, t1, t2, t3, t4];
  };

  const evolution2 = (unit) => {
    let [tier, progress, t1, t2, t3, t4] = unit;
    if (progress >= maxProgress) return [[tier + 1, 0, t1, t2, t3, t4]];

    const merged = Math.floor(t1 / 5); // Merge T1 EXP Books
    t2 += merged;
    t1 -= merged * 5;

    if ((maxProgress - progress) <= t2) {  // Use T2 EXP Books
      t2 -= (maxProgress - progress);
      return [tier + 1, 0, t1, t2, t3, t4];
    } else {
      progress += t2;
      t2 = 0;
    }

    /** Max T2 EXP Book from Free-Picks */
    const maxT2 = Math.floor((freePick + t1) / 5);
    if (maxT2 <= 0) return [tier, progress, t1, t2, t3, t4];

    if ((maxProgress - progress) <= maxT2) {
      freePick -= ((maxProgress - progress) * 5) - t1;
      t1 = 0;
      return [tier + 1, 0, t1, t2, t3, t4];
    } else {
      freePick -= (maxT2 * 5) - t1;
      t1 = 0;
      progress += maxT2;
    }

    return [tier, progress, t1, t2, t3, t4];
  };

  // T1 > T2 Evolution
  maxProgress = 100;
  allUnits = allUnits.map((u) => (u[0] === 1)?evolution1(u):u);

  // T2 > T3 Evolution
  maxProgress = 200;
  allUnits = allUnits.map((u) => (u[0] === 2)?evolution1(u):u);

  // T3 > T4 Evolution
  maxProgress = 100;
  allUnits = allUnits.map((u) => (u[0] === 3)?evolution2(u):u);

  // T5 > T6 Evolution
  maxProgress = 200;
  allUnits = allUnits.map((u) => (u[0] === 3)?evolution2(u):u);

  return ([
    allUnits[0],
    allUnits[1],
    allUnits[2],
    allUnits[3],
    freePick,
  ]);
}
