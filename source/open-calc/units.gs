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
  if (unitA.length === 1) unitA = unitA[0];
  if (unitB.length === 1) unitB = unitB[0];
  if (unitC.length === 1) unitC = unitC[0];
  if (unitD.length === 1) unitD = unitD[0];
  let allUnits = [unitA, unitB, unitC, unitD];

  const evolution1 = (unit, maxProgress) => {
    let [tier, progress, t1, t2, t3, t4] = unit;
    if (progress >= maxProgress) return [tier + 1, 0, t1, t2, t3, t4];

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

  const evolution2 = (unit, maxProgress) => {
    let [tier, progress, t1, t2, t3, t4] = unit;
    if (progress >= maxProgress) return [tier + 1, 0, t1, t2, t3, t4];

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

  const evolution3 = (unit, maxProgress) => {
    let [tier, progress, t1, t2, t3, t4] = unit;
    if (progress >= maxProgress) return [tier + 1, 0, t1, t2, t3, t4];

    let merged = Math.floor(t1 / 5); // Merge T1 EXP Books
    t2 += merged;
    t1 -= merged * 5;
    merged = Math.floor(t2 / 5); // Merge T2 EXP Books
    t3 += merged;
    t2 -= merged * 5;

    if ((maxProgress - progress) <= t3) { // Use T3 EXP Books
      t3 -= (maxProgress - progress);
      return [tier + 1, 0, t1, t2, t3, t4];
    } else {
      progress += t3;
      t3 = 0;
    }

    /** Max T3 EXP Book from Free-Picks */
    const maxT3 = Math.floor( ((freePick + t1) + (t2 * 5)) / 25);
    if (maxT3 <= 0) return [tier, progress, t1, t2, t3, t4];

    if ((maxProgress - progress) <= maxT3) {
      freePick -= ((maxProgress - progress) * 25) - (t2 * 5) - t1;
      t1 = 0;
      t2 = 0;
      return [tier + 1, 0, t1, t2, t3, t4];
    } else {
      freePick -=  (maxT3 * 25) - (t2 * 5) - t1;
      t1 = 0;
      t2 = 0;
      progress += maxT3;
    }

    return [tier, progress, t1, t2, t3, t4];
  };

  const evolution4 = (unit, maxProgress) => {
    let [tier, progress, t1, t2, t3, t4] = unit;
    if (progress >= maxProgress) return [tier + 1, 0, t1, t2, t3, t4];

    let merged = Math.floor(t1 / 5); // Merge T1 EXP Books
    t2 += merged;
    t1 -= merged * 5;
    merged = Math.floor(t2 / 5); // Merge T2 EXP Books
    t3 += merged;
    t2 -= merged * 5;
    merged = Math.floor(t3 / 5); // Merge T3 EXP Books
    t4 += merged;
    t3 -= merged * 5;

    if ((maxProgress - progress) <= t4) { // Use T4 EXP Books
      t4 -= (maxProgress - progress);
      return [tier + 1, 0, t1, t2, t3, t4];
    } else {
      progress += t4;
      t4 = 0;
    }

    /** Max T4 EXP Book from Free-Picks */
    const maxT4 = Math.floor( ((freePick + t1) + (t2 * 5) + (t3 * 25)) / 125);
    if (maxT4 <= 0) return [tier, progress, t1, t2, t3, t4];

    if ((maxProgress - progress) <= maxT4) {
      freePick -= ((maxProgress - progress) * 125) - (t3 * 25) - (t2 * 5) - t1;
      t1 = 0;
      t2 = 0;
      t3 = 0;
      return [tier + 1, 0, t1, t2, t3, t4];
    } else {
      freePick -=  (maxT4 * 125) - (t3 * 25) - (t2 * 5) - t1;
      t1 = 0;
      t2 = 0;
      t3 = 0;
      progress += maxT4;
    }

    return [tier, progress, t1, t2, t3, t4];
  };

  allUnits = allUnits
      .map((u) => (u[0] === 1)?evolution1(u, 100):u) // T1 > T2 evolution
      .map((u) => (u[0] === 2)?evolution1(u, 200):u) // T2 > T3 evolution
      .map((u) => (u[0] === 3)?evolution2(u, 100):u) // T3 > T4 evolution
      .map((u) => (u[0] === 4)?evolution2(u, 200):u) // T4 > T5 evolution
      .map((u) => (u[0] === 5)?evolution3(u, 100):u) // T5 > T6 evolution
      .map((u) => (u[0] === 6)?evolution3(u, 200):u) // T6 > T7 evolution

      .map((u) => (u[0] === 7)?evolution4(u, 100):u) // T5 > T6 evolution
      .map((u) => (u[0] === 8)?evolution4(u, 200):u) // T6 > T7 evolution
  ;

  // const results = Array.from(allUnits).push([freePick]);
  const results = allUnits;
  results.push([freePick]);

  return results;
}
