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

const archer_data =
`Padme	March speed +30%	All troops power +20%	All troops power +20%	Wound regeneration +15%	FALSE	FALSE	FALSE	FALSE
Sahar	March speed +20%	All troops power +25%	Recovery speed +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Meg	March speed +20%	Recovery speed +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Ptolemy	March speed +20%	Recovery speed +20%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	FALSE
Livia	March speed +20%	AP reduction -10%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Richard	March speed +20%	Troops load +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Torvi	March speed +20%	Troops load +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Collin	March speed +30%	Troops load +20%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Sabastian	March speed +30%	Troops load +20%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	FALSE
O'Neil	March speed +20%	Troops load +20%	All troops power +25%	Recovery speed +20%	FALSE	FALSE	TRUE	TRUE
Ariza	March speed +15%	Troops load +15%	All troops power +25%	Recovery speed +20%	FALSE	FALSE	TRUE	TRUE
Gabriel	March speed +20%	Troops load +20%	All troops power +25%	Recovery speed +10%	TRUE	TRUE	TRUE	TRUE
Kadir	Troops load +20%	March speed +20%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Pan	March speed +30%	AP reduction -10%	Recovery speed +15%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Fatima	March speed +20%	Troops load +20%	AP reduction -10%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Montag	Troops load +20%	Gathering speed +20%	March speed +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Bella	March speed +20%	Recovery speed +15%	Troops load +20%	Recovery speed +10%	FALSE	FALSE	FALSE	TRUE
Jennifer	March speed +20%	Tower defense	All troops power +20%	Troops load +10%	TRUE	TRUE	TRUE	TRUE
Arthur	March speed +20%	Offline gold +20%	All troops power +20%	Gathering speed +20%	TRUE	TRUE	TRUE	TRUE
Trist	March speed +20%	Offline gold +20%	All troops power +20%	Gathering speed +20%	FALSE	FALSE	FALSE	TRUE
Harold	Tower defense	AP reduction -10%	Archer troops power +15%		FALSE	FALSE	FALSE	TRUE
Arwyn	Tower defense	Tower defense	Archer troops power +15%		FALSE	FALSE	FALSE	TRUE`

const ice_data =
`Clarence	March speed +30%	All troops power +20%	All troops power +20%	Wound regeneration +15%	FALSE	FALSE	FALSE	FALSE
Ao Deng Ge Ri Le	March speed +20%	All troops power +20%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	FALSE
Ao Yue	March speed +20%	Recovery speed +20%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	FALSE
Filius	March speed +20%	Recovery speed +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Jessica	March speed +20%	AP reduction -10%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Pedra	March speed +20%	AP reduction -10%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Lilani	March speed +20%	Troops load +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Parr	March speed +20%	Troops load +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Hana	AP reduction -10%	March speed +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Keith	March speed +30%	Troops load +20%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Maud	March speed +30%	Troops load +20%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Vera	March speed +20%	Troops load +10%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Rudolph	March speed +25%	Troops load +15%	All troops power +25%	Recovery speed +15%	FALSE	FALSE	TRUE	TRUE
Nathaniel	March speed +30%	Troops load +20%	Recovery speed +15%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Paula	March speed +20%	Offline gold +20%	All troops power +20%	Recovery speed +15%	TRUE	TRUE	TRUE	TRUE
Ralph	March speed +20%	Tower defense	All troops power +20%	Troops load +10%	FALSE	TRUE	TRUE	TRUE
Hadi	March speed +20%	Offline gold +20%	All troops power +20%	Gathering speed +20%	TRUE	TRUE	TRUE	TRUE
Nicole	March speed +20%	Offline gold +20%	All troops power +20%	Gathering speed +20%	FALSE	FALSE	TRUE	TRUE
Merlin	Tower defense	Tower defense	March speed +15%		FALSE	FALSE	FALSE	TRUE`

const goblin_data =
`Tumnus	March speed +30%	All troops power +20%	All troops power +20%	Wound regeneration +15%	FALSE	FALSE	FALSE	FALSE
Gruen	March speed +25%	Recovery speed +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Wendy	March speed +20%	Recovery speed +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Rosamond	March speed +20%	Troops load +20%	All troops power +30%	Recovery speed +25%	FALSE	TRUE	TRUE	TRUE
Arwin	March speed +20%	Troops load +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Benjamin	March speed +20%	Troops load +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Lomax	March speed +20%	Troops load +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Meniere	March speed +20%	Troops load +15%	All troops power +25%	Wound regeneration +10%	FALSE	FALSE	TRUE	TRUE
Chiyoko	March speed +30%	Troops load +20%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Suad	March speed +30%	Troops load +20%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Blackwel	March speed +20%	Troops load +20%	All troops power +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	FALSE
Luvia	March speed +20%	Recovery speed +15%	AP reduction -10%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Pythia	AP reduction -10%	March speed +15%	Troops load +20%	Wound regeneration +10%	FALSE	FALSE	FALSE	TRUE
Claudia	Offline gold +20%	Recovery speed +15%	Goblin troops power +20%	Troops load +20%	FALSE	FALSE	TRUE	TRUE
Issac	March speed +20%	Offline gold +20%	All troops power +20%	Troops load +10%	FALSE	FALSE	TRUE	TRUE
Catherine	March speed +20%	Offline gold +20%	All troops power +20%	Gathering speed +20%	TRUE	TRUE	TRUE	TRUE
Rogers	March speed +20%	Offline gold +20%	All troops power +20%	Gathering speed +20%	FALSE	FALSE	FALSE	TRUE
Alucard	Tower defense	Tower defense	Offline gold +20%		TRUE	FALSE	FALSE	TRUE`;

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

const htmlFromFree = '<img class="from-source" src="../images/from-free-pick.png" alt="Free-pick">';
const htmlFromCrystal = '<img class="from-source" src="../images/from-crystal.png" alt="Wishing crystal">';
const htmlFromWheel = '<img class="from-source" src="../images/from-wheel.png" alt="Lucky wheel">';
const htmlFromAdvanced = '<img class="from-source" src="../images/from-advanced.png" alt="Advance recruitment"></img>';

function compileData(element, raw) {
  const data = raw.split('\n').map((row) => row.split('\t'));
  let table1 = '';
  let table2 = '';
  const heroes = [];

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
      ((recoveryBonus > 0)?1:0) +
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

    // const className = (hero.name === 'O\'Neil'?'oneil':hero.name).toLowerCase();
    const className = hero.name.replaceAll('\'', '').replaceAll(' ', '-').toLowerCase();

    table1 += 
      [
        '<tr>',
        `<td class="hero-avatar"><div class="avatars-item ${className}"></div></td>`,
        `<td class="hero-name">${hero.name}</td>`,
        `<td>${skill1}</td>`,
        `<td>${skill2}</td>`,
        `<td>${skill3}</td>`,
        `<td>${skill4}</td>`,
        `<td>${hero.from.free?htmlFromFree:''}${hero.from.crystal?htmlFromCrystal:''}${hero.from.wheel?htmlFromWheel:''}${hero.from.advanced?htmlFromAdvanced:''}</td>`,
        `</tr>`,
      ].join('\n') + '\n';

    table2 += 
      [
        '<tr>',
        `<td class="hero-avatar"><div class="avatars-item ${className}"></div></td>`,
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
  const json = JSON.stringify(heroes, null, '  ')
  return {table1: table1, table2: table2, json: json};
}

let compiled = compileData('fire', fire_data);
fs.writeFileSync('./_fire-table-1.html', compiled.table1);
fs.writeFileSync('./_fire-table-2.html', compiled.table2);

compiled = compileData('archer', archer_data);
fs.writeFileSync('./_archer-table-1.html', compiled.table1);
fs.writeFileSync('./_archer-table-2.html', compiled.table2);

compiled = compileData('ice', ice_data);
fs.writeFileSync('./_ice-table-1.html', compiled.table1);
fs.writeFileSync('./_ice-table-2.html', compiled.table2);

compiled = compileData('goblin', goblin_data);
fs.writeFileSync('./_goblin-table-1.html', compiled.table1);
fs.writeFileSync('./_goblin-table-2.html', compiled.table2);
fs.writeFileSync('./_goblin.json', compiled.json);
