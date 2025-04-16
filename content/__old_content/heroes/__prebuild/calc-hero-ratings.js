import {HeroBase} from './build-data.js';

/** @typedef {import('./build-data').HeroBonus} HeroBonus */

/**
 * Helper function for proper scaling of bonus.
 * If max bonus is 25%:
 * - If the bonus is 0, the result is 0
 * - If the bonus is 10%, the result is 0.50
 * - If the bonus is 15%, the result is 0.66
 * - If the bonus is 20%, the result is 0.80
 * - If the bonus is 25%, the result is 1.00
 * @param {number} bonus - bonus percentage
 * @param {number} max - max bonus percentage
 * @return {number}
 */
const scale =
  (bonus, max) => (bonus === 0)?0:(0.5 + 0.5*(bonus-10)/(max-10));

/**
 * Helper function for rounding to nearest 0.5
 * @param {number} num - max bonus percentage
 * @return {number}
 */
const round = (num) => Math.round(num*2)/2;

/**
 * Calculate maximum bonus for each property
 * @return {HeroBonus}
 */
function calcMaxBonus() {
  const maxBonus = {};
  // eslint-disable-next-line max-len
  const props = ['march', 'recovery', 'regeneration', 'unit-power', 'AP', 'gathering', 'load', 'offline'];
  props.forEach((prop) => maxBonus[prop] = 0); // Initializing all prop to 0

  HeroBase.forEach((heroData) => {
    props.forEach((prop) => {
      maxBonus[prop] = Math.max(maxBonus[prop], heroData.bonus[prop]);
    });
  });

  return maxBonus;
}

/**
 * Calculate hero rating at different roles
 */
export function calcHeroRatings() {
  const maxBonus = calcMaxBonus();

  HeroBase.forEach((heroData) => {
    const bonus = heroData.bonus;

    /**
     * Rating (0 ~ 10) on hero's ability in ATTACKING castles and fortresses, based on
     *   1) how quickly can the hero reach the target (Rapid March),
     *   2) can the hero defend home city after returning? (Regeneration),
     *   3) unit-power boost (Guerrilla Master)
     *   4) saving on healing scroll (First Aid)
     */
    let attackRating = round(
        4 * scale(bonus.march, maxBonus.march) +
        3 * scale(bonus.regeneration, maxBonus.regeneration) +
        2.5 * scale(bonus['unit-power'], maxBonus['unit-power']) +
        3 * scale(bonus.recovery, maxBonus.recovery),
    );

    attackRating = Math.min(10, attackRating);

    /**
     * Rating (0 ~ 10) on hero's ability in DEFENDING fortresses, based on
     *  1) health recovered after a successful defense? (Regeneration),
     *  2) unit-power boost (Guerrilla Master)
     *  3) saving on healing scroll (First Aid)
     */
    const defenseRating = round(
        4 * scale(bonus.regeneration, maxBonus.regeneration) +
        4 * scale(bonus['unit-power'], maxBonus['unit-power']) +
        2 * scale(bonus.recovery, maxBonus.recovery),
    );

    /**
     * Rating (0 ~ 5) on hero's utility in defeating monsters
     */
    const huntingRating = round(
        1 * scale(bonus.march, maxBonus.march) +
        4 * scale(bonus.AP, maxBonus.AP),
    );

    /**
     * Rating (0 ~ 5) on hero's utility in gold gathering
     */
    const miningRating = round(
        1.0 * scale(bonus.march, maxBonus.march) +
        2.5 * scale(bonus.gathering, maxBonus.gathering) +
        1.5 * scale(bonus.load, maxBonus.load),
    );

    heroData.rating = {
      attacking: attackRating,
      defending: defenseRating,
      hunting: huntingRating,
      mining: miningRating,
    };

    // Ranking score for determining sorting order and hero tier
    let rankingScore = attackRating;

    // Bump up the ranking score if the hero has utility values
    if (huntingRating >= 4) rankingScore += 0.5;
    else if (huntingRating >= 2) rankingScore += 0.3;
    else if (miningRating >= 4) rankingScore += 0.3;
    else if (miningRating >= 2) rankingScore += 0.2;

    if (rankingScore >= 9.5) heroData.tier = 'S';
    else if (rankingScore >= 8.5) heroData.tier = 'A';
    else if (rankingScore >= 7.5) heroData.tier = 'B';
    else if (rankingScore >= 6) heroData.tier = 'C';
    else if (rankingScore >= 4) heroData.tier = 'D';
    else if (rankingScore >= 2) heroData.tier = 'E';
    else if (rankingScore >= 1) heroData.tier = 'F';
    else heroData.tier = 'F';

    // Add additional decimal digit to help with sorting
    // heroData.ranking = rankingScore + (defenseRating / 20);
    heroData.ranking = rankingScore;
  });

  // Sort database by sorting index
  HeroBase.sort((a, b) => b.ranking - a.ranking);

  // Remove temporary sorting index
  HeroBase.forEach((heroData) => delete heroData.ranking);
}
