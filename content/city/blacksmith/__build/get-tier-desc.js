/**
 * Find Hero Gear desc
 * @param {number} tier
 * @return {string}
 */
export function getHeroGearDesc(tier) {
  const tierIdx = tier - 1;
  const names = [
    /* 1 */ 'Hardwood Weapon',
    /* 2 */ 'Dark-Iron Weapon',
    /* 3 */ 'Excellent Weapon',
    /* 4 */ 'Epic Weapon',
    /* 5 */ 'Legendary Weapon',
    /* 6 */ 'Peacock Plume Weapon',
    /* 7 */ 'Luxurious Weapon',
    /* 8 */ 'King\'s Weapon',
    /* 9 */ 'Thunder Weapon',
    /* 10 */ 'Sacred Light Weapon',
    /* 11 */ 'Eternal Weapon',
  ];
  return names[tierIdx]||`T${tier} Weapon`;
}
