let dom = undefined;

function cacheDom() {
  dom = {
    tableContainer: document.getElementById('table-container'),
    select1: document.getElementById('select-hero-1'),
    select2: document.getElementById('select-hero-2'),
    select3: document.getElementById('select-hero-3'),
    hero1: {
      from: {
        free: document.getElementById('hero-1-src-free'),
        crystal: document.getElementById('hero-1-src-crystal'),
        wheel: document.getElementById('hero-1-src-wheel'),
        advanced: document.getElementById('hero-1-src-advanced'),
      }
    },
    hero2: {
      from: {
        free: document.getElementById('hero-2-src-free'),
        crystal: document.getElementById('hero-2-src-crystal'),
        wheel: document.getElementById('hero-2-src-wheel'),
        advanced: document.getElementById('hero-2-src-advanced'),
      }
    },
    hero3: {
      from: {
        free: document.getElementById('hero-3-src-free'),
        crystal: document.getElementById('hero-3-src-crystal'),
        wheel: document.getElementById('hero-3-src-wheel'),
        advanced: document.getElementById('hero-3-src-advanced'),
      }
    }
  };
}

function getCombinedStats(main, assistant1, assistant2) {
  const stats = Object.assign({}, main);
  stats.power += assistant1.power + assistant2.power;
  return stats;
}

function getHeroStats(skills) {
  function extractNumber(skillDesc, prefix) {
    const indexStart = prefix.length;
    const indexEnd = indexStart + 2;
    if (skillDesc.startsWith(prefix)) {
      return parseInt(skillDesc.substring(indexStart, indexEnd));
    } else {
      return 0;
    }
  }

  function addStats(stats, skill) {
    stats.ap += extractNumber(skill, 'AP reduction -')
    stats.speed += extractNumber(skill, 'March speed +');
    stats.power +=
      extractNumber(skill, 'All troops power +') +
      extractNumber(skill, 'Flame mage troops power +') +
      extractNumber(skill, 'Goblin troops power +') +
      extractNumber(skill, 'Archer troops power +');
    stats.regen += extractNumber(skill, 'Wound regeneration +');
    stats.gather += extractNumber(skill, 'Gathering speed +');
    stats.offline += extractNumber(skill, 'Offline gold +');
    stats.load += extractNumber(skill, 'Troops load +');
    stats.recovery += extractNumber(skill, 'Recovery speed +');  
    return stats;
  }

  const stats0 = {
    ap: 0,
    speed: 0,
    power: 0,
    regen: 0,
    gather: 0,
    offline: 0,
    load: 0,
    recovery: 0,
  };

  const stats1 = addStats(Object.assign({}, stats0), skills[0]);
  const stats2 = addStats(Object.assign({}, stats1), skills[1]);
  const stats3 = addStats(Object.assign({}, stats2), skills[2]);
  const stats4 = addStats(Object.assign({}, stats3), skills[3]);
  const stats5 = addStats(Object.assign({}, stats4), skills[4]);

  return {
    '3-star': stats3,
    '4-star': stats4,
    '5-star': stats5,
  };
}

const WarriorRole = 0;
const HunterRole = 1;
const MinerRole = 2;
const NoRole = 3;

function getRole(fullStats) {
  if (fullStats.ap > 0) return HunterRole;

  if (
    (fullStats.power >= 40) &&
    (fullStats.recovery > 0) &&
    (fullStats.speed > 0)
  ) return WarriorRole;

  if (
    (fullStats.gather > 0) &&
    ( (fullStats.offline > 0) || (fullStats.load > 0))
  ) return MinerRole ;

  return NoRole;
}

function writeTableHeadHTML(selectedCombos) {
  let TableHeadHTML = '';

  selectedCombos.forEach((combo) => {
    const class0 = combo.names[0].replaceAll('\'', '').replaceAll(' ', '-').toLowerCase();
    const class1 = combo.names[1].replaceAll('\'', '').replaceAll(' ', '-').toLowerCase();
    const class2 = combo.names[2].replaceAll('\'', '').replaceAll(' ', '-').toLowerCase();  
  
    const configName = ['Warrior', 'Hunter', 'Miner', ''][combo.role];
    TableHeadHTML += `<th><div class="config-box"><p>${configName} config</p>`;
    TableHeadHTML += '<div class="avatars">';
    TableHeadHTML += `<div class="avatars-item ${class2}"></div>`;
    TableHeadHTML += `<div class="avatars-item ${class1}"></div>`;
    TableHeadHTML += `<div class="avatars-item ${class0}"></div>`;
    TableHeadHTML += '</div></th>\n';
  });

  return '<thead><tr>\n' + TableHeadHTML + '</tr></thead>\n';
}

function writeTableBodyHTML(selectedCombos) {

  function writeStats(stats) {
    let statsHtml = '';
    if (stats.speed > 0) {
      statsHtml += `<div class="stats march"><span class="stats-desc">March speed</span><span class="stats-value">+${stats.speed}%</span></div>\n`;
    }
    if (stats.ap > 0) {
      statsHtml += `<div class="stats other"><span class="stats-desc">AP reduction</span><span class="stats-value">+${stats.ap}%</span></div>\n`;
    }
    if (stats.gather > 0) {
      statsHtml += `<div class="stats other"><span class="stats-desc">Gathering speed</span><span class="stats-value">+${stats.gather}%</span></div>\n`;
    }
    if (stats.offline > 0) {
      statsHtml += `<div class="stats other"><span class="stats-desc">Offline gold</span><span class="stats-value">+${stats.offline}%</span></div>\n`;
    }
    if (stats.power > 0) {
      statsHtml += `<div class="stats combat"><span class="stats-desc">Troops power</span><span class="stats-value">+${stats.power}%</span></div>\n`;
    }
    if (stats.recovery > 0) {
      statsHtml += `<div class="stats combat"><span class="stats-desc">Recovery speed</span><span class="stats-value">+${stats.recovery}%</span></div>\n`;
    }
    if (stats.regen > 0) {
      `<div class="stats combat"><span class="stats-desc">Wound regeneration</span><span class="stats-value">+${stats.regen}%</span></div>\n`;
    }
    return statsHtml;
  }

  let TableBodyHtml3 = '';
  let TableBodyHtml4 = '';
  let TableBodyHtml5 = '';

  selectedCombos.forEach((combo) => {
    TableBodyHtml3 += `<td>\n`;
    TableBodyHtml3 += '<div class="star">★★★</div>\n';
    TableBodyHtml3 += writeStats(combo['3-star']);
    TableBodyHtml3 += '</td>\n';
  });
  selectedCombos.forEach((combo) => {
    TableBodyHtml4 += `<td>\n`;
    TableBodyHtml4 += '<div class="star">★★★★</div>\n';
    TableBodyHtml4 += writeStats(combo['4-star']);
    TableBodyHtml4 += '</td>\n';
  });
  selectedCombos.forEach((combo) => {
    TableBodyHtml5 += `<td>\n`;
    TableBodyHtml5 += '<div class="star">★★★★★</div>\n';
    TableBodyHtml5 += writeStats(combo['5-star']);
    TableBodyHtml5 += '</td>\n';
  });
  

  return '<tbody>\n' +
    '<tr>\n' + TableBodyHtml3 + '</tr>\n' +
    '<tr>\n' + TableBodyHtml4 + '</tr>\n' +
    '<tr>\n' + TableBodyHtml5 + '</tr>\n' +
    '</tbody>\n';
}


function calculate() {
  // if (dom === undefined) cacheDom();
  const heroNames = [
    dom.select1.options[dom.select1.selectedIndex].text,
    dom.select2.options[dom.select2.selectedIndex].text,
    dom.select3.options[dom.select3.selectedIndex].text,
  ];

  const heroData = heroNames
    .map((n) => ElementHeroData.find((h) => h.name === n));

  function showSource(from, dom) {
    if (from.advanced) dom.advanced.classList.remove('hidden');
    else dom.advanced.classList.add('hidden');

    if (from.wheel) dom.wheel.classList.remove('hidden');
    else dom.wheel.classList.add('hidden');

    if (from.crystal) dom.crystal.classList.remove('hidden');
    else dom.crystal.classList.add('hidden');

    if (from.free) dom.free.classList.remove('hidden');
    else dom.free.classList.add('hidden');
  };

  showSource(heroData[0].from, dom.hero1.from);
  showSource(heroData[1].from, dom.hero2.from);
  showSource(heroData[2].from, dom.hero3.from);
  
  if (Array.from(new Set(heroNames)).length !== 3) {
    dom.tableContainer.innerHTML = '';
    return;
  }

  const heroStats = heroData.map((d) => getHeroStats(d.skills));

  const combo1 = {
    'names': [heroNames[0], heroNames[1], heroNames[2]],
    '3-star': getCombinedStats(heroStats[0]['3-star'], heroStats[1]['3-star'], heroStats[2]['3-star']),
    '4-star': getCombinedStats(heroStats[0]['4-star'], heroStats[1]['4-star'], heroStats[2]['4-star']),
    '5-star': getCombinedStats(heroStats[0]['5-star'], heroStats[1]['5-star'], heroStats[2]['5-star']),
  };

  const combo2 = {
    'names': [heroNames[1], heroNames[2], heroNames[0]],
    '3-star': getCombinedStats(heroStats[1]['3-star'], heroStats[2]['3-star'], heroStats[0]['3-star']),
    '4-star': getCombinedStats(heroStats[1]['4-star'], heroStats[2]['4-star'], heroStats[0]['4-star']),
    '5-star': getCombinedStats(heroStats[1]['5-star'], heroStats[2]['5-star'], heroStats[0]['5-star']),
  };

  const combo3 = {
    'names': [heroNames[2], heroNames[0], heroNames[1]],
    '3-star': getCombinedStats(heroStats[2]['3-star'], heroStats[0]['3-star'], heroStats[1]['3-star']),
    '4-star': getCombinedStats(heroStats[2]['4-star'], heroStats[0]['4-star'], heroStats[1]['4-star']),
    '5-star': getCombinedStats(heroStats[2]['5-star'], heroStats[0]['5-star'], heroStats[1]['5-star']),
  };

  combo1.role = getRole(combo1['5-star']);
  combo2.role = getRole(combo2['5-star']);
  combo3.role = getRole(combo3['5-star']);

  let selectedCombos = [combo1, combo2, combo3]
    .filter((c) => c.role !== NoRole)
    .sort((a, b) => b.role - a.role);

  if (selectedCombos.length === 0) selectedCombos = [combo1];

  const tableHeadHtml = writeTableHeadHTML(selectedCombos);
  const tableBodyHtml = writeTableBodyHTML(selectedCombos);
  dom.tableContainer.innerHTML = '<table>' + tableHeadHtml + tableBodyHtml + '</table>';
}
