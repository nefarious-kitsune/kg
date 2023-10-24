import fs from 'fs';

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

  data.forEach((row, index) => {
    const [
      rarity,
      name,
      skill1, skill2, skill3, skill4, skill5,
      from_advanced, from_wheel, from_crystal, from_free
    ] = row;

    const skills = [skill1, skill2, skill3, skill4, skill5];

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
        `<td>${skill5}</td>`,
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
  
  return {table1: table1, table2: table2, data: heroes};
}

let imported;
let compiled;

function getDataJsCode(data) {
  return 'const ElementHeroData = ' + JSON.stringify(data, null, '  ');
}

imported = fs.readFileSync('./archer.tsv', { encoding:'utf8'});
compiled = compileData('archer', imported);
fs.writeFileSync('./_archer-table-1.html', compiled.table1);
fs.writeFileSync('./_archer-table-2.html', compiled.table2);
fs.writeFileSync('../../../docs/hero/archer-data.js', getDataJsCode(compiled.data));

imported = fs.readFileSync('./fire.tsv', { encoding:'utf8'});
compiled = compileData('fire', imported);
fs.writeFileSync('./_fire-table-1.html', compiled.table1);
fs.writeFileSync('./_fire-table-2.html', compiled.table2);
fs.writeFileSync('../../../docs/hero/fire-data.js', getDataJsCode(compiled.data));

imported = fs.readFileSync('./ice.tsv', { encoding:'utf8'});
compiled = compileData('ice', imported);
fs.writeFileSync('./_ice-table-1.html', compiled.table1);
fs.writeFileSync('./_ice-table-2.html', compiled.table2);
fs.writeFileSync('../../../docs/hero/ice-data.js', getDataJsCode(compiled.data));

imported = fs.readFileSync('./goblin.tsv', { encoding:'utf8'});
compiled = compileData('goblin', imported);
fs.writeFileSync('./_goblin-table-1.html', compiled.table1);
fs.writeFileSync('./_goblin-table-2.html', compiled.table2);
fs.writeFileSync('../../../docs/hero/goblin-data.js', getDataJsCode(compiled.data));

let selectHTML = compiled
  .data
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((h) => `<option value="${h.name.replaceAll('\'', '').replaceAll(' ', '-').toLowerCase()}">${h.name}</option>`).join('\n');

fs.writeFileSync('./_temp.html', selectHTML);

