import fs from 'fs';

const fire_data =
`Tracy	March speed +30%	All troops power +20%	All troops power +20%	Wound regeneration +15%	FALSE	FALSE	FALSE	FALSE
Erika	March speed +25%	Recovery speed +15%	All troops power +25%	Wound regeneration +10%	TRUE	TRUE	TRUE	TRUE
Anko	March speed +30%	Recovery speed +15%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Cosette	March speed +20%	Troops load +30%	All troops power +30%	Recovery speed +25%	FALSE	FALSE	TRUE	TRUE
Paul	March speed +20%	Troops load +20%	All troops power +30%	Recovery speed +25%	FALSE	FALSE	TRUE	TRUE
Miku	AP reduction -20%	March speed +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	FALSE	FALSE
Vanessa	March speed +20%	Recovery speed +15%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Giselle	March speed +20%	AP reduction -10%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Kenshiro	March speed +20%	Troops load +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Penny	March speed +20%	Troops load +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Apollo	March speed +30%	Troops load +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Christie	Troops load +20%	Troops load +20%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Brie	Troops load +20%	Recovery speed +15%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Dean	March speed +20%	All troops power +20%	Recovery speed +15%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Dolvar	March speed +20%	Troops load +15%	All troops power +25%	Wound regeneration +15%	FALSE	FALSE	TRUE	TRUE
Wallis	March speed +20%	Troops load +15%	All troops power +25%	Wound regeneration +15%	FALSE	FALSE	TRUE	TRUE
Allen	March speed +20%	Troops load +10%	All troops power +25%	Recovery speed +15%	FALSE	TRUE	TRUE	TRUE
Dain	March speed +20%	Troops load +20%	Recovery speed +15%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Gro	March speed +15%	Flame mage troops power +20%	Tower defense	Recovery speed +15%	TRUE	TRUE	TRUE	TRUE
Simon	March speed +20%	Offline gold +20%	All troops power +20%	Gathering speed +20%	TRUE	FALSE	FALSE	TRUE
Kris	March speed +20%	Gathering speed +20%	All troops power +20%		TRUE	FALSE	FALSE	TRUE
Ophelia	Flame mage troops power +20%	Tower defense	Tower defense		TRUE	FALSE	FALSE	TRUE
Samar	Flame mage troops power +20%	Tower defense	Tower defense		TRUE	FALSE	FALSE	TRUE
Anton	Tower defense	Tower defense	Flame mage troops power +20%		TRUE	FALSE	FALSE	TRUE`;
/*
  <tr>
    <td><div class="avatars-item gabriel"></div></td>
    <td>Erika</td>
    <td>March speed +25%</td>
    <td>Recovery speed +15%</td>
    <td>All troops power +25%</td>
    <td>Wound regeneration +10%</td>
    <td>
      <img class="from-source" src="../images/from-free-pick.png" alt="Free-pick">
      <img class="from-source" src="../images/from-crystal.png" alt="Wishing crystal">
      <img class="from-source" src="../images/from-wheel.png" alt="Lucky wheel">
      <img class="from-source" src="../images/from-advanced.png" alt="Advance recruitment">
    </td>
  </tr>
 
*/


function getTotalStats(skills, prefix) {
  const indexStart = prefix.length;
  const indexEnd = indexStart + 2;
  return skills.reduce(
    (total, skill) => {
      if (skill.startsWith(prefix)) {
        return total + parseInt(skill.substring(indexStart, indexEnd));
      } else {
        return total;
      }
    },
    0,
  )
}

const heroes = [];

const htmlFromFree = '<img class="from-source" src="../images/from-free-pick.png" alt="Free-pick">';
const htmlFromCrystal = '<img class="from-source" src="../images/from-crystal.png" alt="Wishing crystal">';
const htmlFromWheel = '<img class="from-source" src="../images/from-wheel.png" alt="Lucky wheel">';
const htmlFromAdvanced = '<img class="from-source" src="../images/from-advanced.png" alt="Advance recruitment"></img>';

function constructTable(element, raw) {
  const data = raw.split('\n').map((row) => row.split('\t'));
  let table1 = '';
  let table2 = '';
  
  // const lines = [];

  data.forEach((row, index) => {
    const [
      name,
      skill1, skill2, skill3, skill4,
      from_advanced, from_wheel, from_crystal, from_free
    ] = row;

    const skills = [skill1, skill2, skill3, skill4];

    const apReduction = getTotalStats(skills, 'AP reduction -');
    const speedBonus = getTotalStats(skills, 'March speed +');
    const powerBonus =
      getTotalStats(skills, 'All troops power +') +
      getTotalStats(skills, 'Flame mage troops power +') +
      getTotalStats(skills, 'Goblin troops power +') +
      getTotalStats(skills, 'Archer troops power +');
      
    const regenBonus = getTotalStats(skills, 'Wound regeneration +');
    const gatherBonus = getTotalStats(skills, 'Gathering speed +');
    const offlineBonus = getTotalStats(skills, 'Offline gold +');
    const loadBonus = getTotalStats(skills, 'Troops load +');
    const recoveryBonus = getTotalStats(skills, 'Recovery speed +');

    const warriorTier = 
      ((speedBonus > 0)?1:0) +
      ((powerBonus > 0)?1:0) +
      ((regenBonus > 0)?1:0);

    const supportTier =
      ((powerBonus >= 40)?1:0) +
      ((powerBonus >= 30)?1:0) +
      ((powerBonus >= 25)?1:0) +
      ((powerBonus >= 20)?1:0);

    const hunterTier = (apReduction > 0)?1:0;
    const minerTier = (gatherBonus > 0)?1:0;


    const hero = {
      name: name,
      element: element,
      skills: skills,
      bonus: {
        ap: apReduction,
        speed: speedBonus,
        power: powerBonus,
        regen: regenBonus,
        gather: gatherBonus,
        offline: offlineBonus,
        load: loadBonus,
        recovery: recoveryBonus,
      },
      tier: {
        warrior: warriorTier,
        support: supportTier,
        hunter: hunterTier,
        miner: minerTier,
      },
      from: {
        advanced: from_advanced === 'TRUE',
        wheel: from_wheel === 'TRUE',
        crystal: from_crystal === 'TRUE',
        free: from_free === 'TRUE',
      }
    };

    heroes.push(hero);

    table1 += 
      [
        '<tr>',
        `<td class="hero-avatar"><div class="avatars-item ${hero.name.toLowerCase()}"></div></td>`,
        `<td class="hero-name">${hero.name}</td>`,
        `<td>${skill1}</td>`,
        `<td>${skill2}</td>`,
        `<td>${skill3}</td>`,
        `<td>${skill4}</td>`,
        `<td>${hero.from.free?htmlFromFree:''}${hero.from.crystal?htmlFromCrystal:''}${hero.from.wheel.advanced?htmlFromWheel:''}${hero.from.advanced?htmlFromAdvanced:''}</td>`,
        `</tr>`,
      ].join('\n') + '\n';

    table2 += 
      [
        '<tr>',
        `<td class="hero-avatar"><div class="avatars-item ${hero.name.toLowerCase()}"></div></td>`,
        `<td class="hero-name">${hero.name}</td>`,
        `<td>${(hero.bonus.speed > 0)?('+' + hero.bonus.speed + '%'):''}</td>`,
        `<td>${(hero.bonus.power > 0)?('+' + hero.bonus.power + '%'):''}</td>`,
        `<td>${(hero.bonus.recovery > 0)?('+' + hero.bonus.recovery + '%'):''}</td>`,
        `<td>${(hero.bonus.regen > 0)?('+' + hero.bonus.regen + '%'):''}</td>`,
        `<td>${(hero.bonus.load > 0)?('+' + hero.bonus.load + '%'):''}</td>`,
        `<td>${(hero.bonus.gather > 0)?('+' + hero.bonus.gather + '%'):''}</td>`,
        `<td>${(hero.bonus.offline > 0)?('+' + hero.bonus.offline + '%'):''}</td>`,
        `<td>${'★'.repeat(hero.tier.warrior)}</td>`,
        `<td>${'★'.repeat(hero.tier.support)}</td>`,
        `<td>${hero.tier.hunter?'Hunter':''}${hero.tier.miner?'Miner':''}</td>`,
        `</tr>`,
      ].join('\n') + '\n';
  })
  return {table1: table1, table2: table2};
}

const tables = constructTable('fire', fire_data);
fs.writeFileSync('./fire-table-1.html', tables.table1);
fs.writeFileSync('./fire-table-2.html', tables.table2);

console.log(heroes);
// fs.writeFileSync('./table.html', lines.join('\n'));

{/* <td class="hero-avatar"><div class="avatars-item gabriel"></div></td>
<td class="hero-name">Tracy</td>
<td>+30%</td>
<td>+40%</td>
<td></td>
<td>+15%</td>
<td></td>
<td></td>
<td></td>
<td>★★</td>
<td>★★★★</td>
<td></td> */}