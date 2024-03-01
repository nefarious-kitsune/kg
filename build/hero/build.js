import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { buildBase } from '../base/build.js';

const ModulePath = dirname(fileURLToPath(import.meta.url));

// Compile TSV data to structured JSON files
import './compile.js';

/**
 * @typedef {import('./compile.js').HeroData} HeroData
 */

function parseJSON(filePath) {
  return JSON.parse(readFileSync(resolve(ModulePath, filePath), 'utf-8'));
}

/** @type {HeroData[]} Hero data for the Archer element */
const archerHeroData =  parseJSON('./compiled/archer.json');

/** @type {HeroData[]} Hero data for the Fire Mage element */
const fireHeroData =  parseJSON('./compiled/fire.json');

/** @type {HeroData[]} Hero data for the Ice Wizard element */
const iceHeroData =  parseJSON('./compiled/ice.json');

/** @type {HeroData[]} Hero data for the Goblin element */
const goblinHeroData =  parseJSON('./compiled/goblin.json');

/** @type {HeroData[]} */
const HeroData = []
  .concat(archerHeroData)
  .concat(fireHeroData)
  .concat(iceHeroData)
  .concat(goblinHeroData);

const ExportPath = resolve(ModulePath, '../../docs/hero/');

writeFileSync(
  resolve(ExportPath, './hero-data.json'),
  JSON.stringify(HeroData, null, '  '),
);

function formatBonus(plusMinus, bonus) {
  if ((typeof bonus === 'number') && bonus > 0) {
    return plusMinus + bonus + '%';
  } else {
    return '';
  }
}

/**
 * Build HTML content for one element
 * @param {HeroData[]} - Hero data of the element
 * @returns {string} - Generated table content (HTML)
 */
function buildContent(elHeroData) {
  /** @type {string[]} Lines of code for content table */
  const tableBody = [];

  elHeroData.forEach((data) => {
    /** @type {string} - sanitized hero name*/
    const className = data.name
      .replaceAll('\'', '') // Change "O'Neil" to "oneil"
      .replaceAll(' ', '-') // Change "Ao Yue" to "ao-yue"
      .toLowerCase();

    const skillDesc = data.skills.map((s) => s.replace(
      'regeneration',
      '<abbr data-tooltip="regeneration" tabindex="0">regen.</abbr>'
    ))

    tableBody.push(
      '<tr>',
      `<td class="avatar-col"><div class="avatars-item ${className}"></div></td>`,
      `<td class="name-col">${data.name}</td>`,
      `<td class="skill-col">${skillDesc[0]}</td>`,
      `<td class="skill-col">${skillDesc[1]}</td>`,
      `<td class="skill-col">${skillDesc[2]}</td>`,
      `<td class="skill-col">${skillDesc[3]}</td>`,
      `<td class="skill-col">${skillDesc[4]}</td>`,

      `<td class="total-combat-col">${formatBonus('+', data['total-bonus']['march-speed'])}</td>`,
      `<td class="total-combat-col">${formatBonus('+', data['total-bonus']['power'])}</td>`,
      `<td class="total-combat-col">${formatBonus('+', data['total-bonus']['recovery-speed'])}</td>`,
      `<td class="total-combat-col">${formatBonus('+', data['total-bonus']['wound-regeneration'])}</td>`,
      `<td class="total-utility-col">${formatBonus('+', data['total-bonus']['troops-load'])}</td>`,
      `<td class="total-utility-col">${formatBonus('+', data['total-bonus']['gathering-speed'])}</td>`,
      `<td class="total-utility-col">${formatBonus('+', data['total-bonus']['offline-gold'])}</td>`,
      `<td class="total-utility-col">${formatBonus('-', data['total-bonus']['ap-reduction'])}</td>`,

      `<td class="acquisition-col">${data.acquisition['advanced-recruitment']?'✔':''}</td>`,
      `<td class="acquisition-col">${data.acquisition['lucky-wheel']?'✔':''}</td>`,
      `<td class="acquisition-col">${data.acquisition['crystal-ball']?'✔':''}</td>`,
      `<td class="acquisition-col">${data.acquisition['free-pick']?'✔':''}</td>`,
      `<td class="other-acquisition-col">${data.acquisition.other}</td>`,

      `<td class="role-col">${'★'.repeat(data.tier.warrior)}</td>`,
      `<td class="role-col">${'★'.repeat(data.tier.support)}</td>`,
      `<td class="role-col">${data.tier.hunter?'Hunter':''}${data.tier.miner?'Miner':''}</td>`,
    `</tr>`,
    )
  })
  return tableBody.join('\n');
}

const contentTemplate = readFileSync(
  resolve(ModulePath, './templates/element.html'),
  'utf-8',
);

function buildElementContent(elName, elHeroData) {
  const content = contentTemplate
    .replaceAll('{{ELEMENT NAME}}', elName)
    .replaceAll('{{JSON FILE NAME}}', 'hero-data.json')
    .replace('{{TABLE BODY}}', buildContent(elHeroData))
  ;

  const outputOptions = {
    type: 'sheet',
    path: {
      base: `/hero/element`,
      icon: '/images/logo_mini.png',
    },
    css: {
      links: [
        '/css/common.css',
        '/hero/hero-table.css',
      ],
    },
    js: {
      links: [
        '/hero/hero-table.js',
      ],
    },
    breadcrumb: [
      {path: '/content', title: 'Home'},
      {path: '/hero/', title: 'Hero'},
    ],
    content: content,
    shortTitle: elName,
    title: `${elName} Heroes`,
    description: `Information on skills, means of acquisition, and roles of ${elName} Heroes`,
  };
  
  return buildBase(outputOptions);
}

writeFileSync(
  resolve(ExportPath, './fire-skills.html'),
  buildElementContent('Fire Mage', fireHeroData),
);

writeFileSync(
  resolve(ExportPath, './ice-skills.html'),
  buildElementContent('Ice Wizard', iceHeroData),
);
