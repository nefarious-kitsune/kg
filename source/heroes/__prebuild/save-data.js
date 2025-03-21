import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ExportPaths = {
  'hero-skills.tsv': resolve(ModulePath, '../hero-skills.tsv'),
  'heroes.json': resolve(ModulePath, '../heroes.json'),
  'hero-rating.tsv': resolve(ModulePath, '../hero-rating.tsv'),
};

import {HeroBase} from './build-data.js';

/** Save database into .json files */
function saveDatabase() {
  writeFileSync(
      ExportPaths['heroes.json'],
      JSON.stringify(HeroBase, null, '  ') + '\n');
}

/** Save rating info to .tsv file */
function saveRating() {
  const headerRow =
      [
        'Element',
        'Rarity',
        'Tier',
        'Hero',

        'March Speed',
        'Recovery',
        'Regeneration',
        'Unit Power',
        'AP',

        'Attacking',
        'Defending',
        'Hunting',
        'Mining',
      ].join('\t');

  const makeRow = (heroData) =>
    [
      heroData.element,
      heroData.rarity,
      heroData.tier,
      heroData.name,

      heroData.bonus.march,
      heroData.bonus.recovery,
      heroData.bonus.regeneration,
      heroData.bonus['unit-power'],
      heroData.bonus.AP,

      heroData.rating.attacking,
      heroData.rating.defending,
      heroData.rating.hunting,
      heroData.rating.mining,
    ].join('\t');

  const content =
    headerRow + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Archer')
        .map((heroData) => makeRow(heroData))
        .join('\n') + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Fire')
        .map((heroData) => makeRow(heroData))
        .join('\n') + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Ice')
        .map((heroData) => makeRow(heroData))
        .join('\n') + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Goblin')
        .map((heroData) => makeRow(heroData))
        .join('\n');

  writeFileSync(ExportPaths['hero-rating.tsv'], content);
}

/** Save skills info to .tsv file */
function saveSkills() {
  const headerRow =
      [
        'Element',
        'Rarity',
        'Tier',
        'Hero',
        'Skill 1',
        'Skill 2',
        'Skill 3',
        'Skill 4',
        'Skill 5',
      ].join('\t');

  const makeRow = (heroData) =>
    [
      heroData.element,
      heroData.rarity,
      heroData.tier,
      heroData.name,

      heroData.skills[0]['short-description'],
      heroData.skills[1]?.['short-description']||'',
      heroData.skills[2]?.['short-description']||'',
      heroData.skills[3]?.['short-description']||'',
      heroData.skills[4]?.['short-description']||'',
    ].join('\t');

  const content =
    headerRow + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Archer')
        .map((heroData) => makeRow(heroData))
        .join('\n') + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Fire')
        .map((heroData) => makeRow(heroData))
        .join('\n') + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Ice')
        .map((heroData) => makeRow(heroData))
        .join('\n') + '\n' +
    HeroBase
        .filter((heroData) => heroData.element === 'Goblin')
        .map((heroData) => makeRow(heroData))
        .join('\n');

  writeFileSync(ExportPaths['hero-skills.tsv'], content);
}

/** Save data */
export function saveData() {
  saveRating();
  saveSkills();
  saveDatabase();
}
