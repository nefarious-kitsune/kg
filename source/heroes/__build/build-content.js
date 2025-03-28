import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');
// const DataPath = resolve(ProjectPath, './data/heroes/');
const ExportPath = resolve(ProjectPath, './docs/heroes/');
const TemplatePath = resolve(ProjectPath, './source/heroes/');

// const contentTemplate = readFileSync(
//     resolve(TemplatePath, `__${element}-skills.html`),
//     'utf-8',
// );

/** @typedef {import('./build-data.js').HeroData} HeroData */

/**
 * Build HTML content for one element
 * @param {string} element - Hero data of the element
 * @return {string} - Generated table content (HTML)
 */
export function buildSkillTable(element) {
  const jsonFilePath = resolve(ExportPath, `hero-base.json`);

  /** @type {HeroData[]} */
  const HeroData = JSON.parse(readFileSync(jsonFilePath, 'utf-8'));

  /** @type {string[]} Lines of code for table body */
  const heroSkillsTableContent = [];

  HeroData
      .filter((heroData) => heroData.element === element)
      .forEach((heroData) => {
        let avatarClass = heroData.name.toLowerCase();
        if (avatarClass.startsWith('ao deng')) {
          avatarClass = 'ao-deng';
        } else {
          avatarClass = avatarClass.replaceAll('\'', '').replaceAll(' ', '-');
        }

        const T = {
          avatar: `<div class="hero-avatar ${avatarClass}"></div>`,
          name: heroData.name,
        };

        T.skills = heroData.skills.map((s) => {
          if ((s === null) || (s.short === '')) return '';
          return '<span data-tooltip="' +
        s.name + ': ' + s.description + '">' +
        s.desc + '</span>';
        });

        console.log(T.skills[0]);

        heroSkillsTableContent.push(
            '<tr>',
            '<td>', T.avatar, T.name, '</td>',
            '<td>' + T.s1 + '</td>',
            '<td>' + T.s2 + '</td>',
            '<td>' + T.s3 + '</td>',
            '<td>' + T.s4 + '</td>',
            '<td>' + T.s5 + '</td>',
            `</tr>`,
        );
      });

  // writeFileSync();
  return '';
}

buildSkillTable('Archer');
