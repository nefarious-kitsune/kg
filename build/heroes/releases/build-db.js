import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync, readFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../../');

const srcBasePath = resolve(ProjectPath, './source/heroes/releases/__data/');

/**
 * @typedef {Object} HeroReleaseData - Hero release data
 * @property {string} hero - Name of the hero
 * @property {string|boolean} advRecruit - drop percentage in Advanced Recruitment or `false`
 * @property {string|boolean} statsRecruit - drop percentage in Stats Recruitment or `false`
 * @property {boolean} freePick - availability in Free-Pick Hero Card
 * @property {boolean} crystal - availability in Wishing Crystal Ball
 * @property {boolean} wheel - availability in Lucky Wheel
 * @property {boolean} event - availability in Special Event
 * @property {string} other - other acquisition venue
 */

/** @type {Map<String, HeroReleaseData>} */
export const heroReleaseBase = new Map();

/** @type {string[]} */
let eventHeroList = [];

/**
 * Load the list of heroes in stats recruitment
 */
function loadStatsHeroList() {
  [
    'stats-archer.tsv',
    'stats-fire.tsv',
    'stats-goblin.tsv',
    'stats-ice.tsv',
  ].forEach((fileName) => {
    const fPath = resolve(srcBasePath, fileName);
    const rows = readFileSync(fPath, {encoding: 'utf8'}).split('\n');
    rows.shift(); // Remove header row
    rows.forEach((row) => {
      const cols = row.split('\t');
      const season = cols[0].toLowerCase().replace(' ', '-');
      const statsHeroes = cols[2].replaceAll(', ', ',').split(',');
      const verified = cols[4] === 'TRUE';
      const dropRate = verified?cols[3]:'?';

      if ((statsHeroes.length > 1) && (heroReleaseBase.has(season))) {
        const seasonReleaseData = heroReleaseBase.get(season);
        statsHeroes.forEach((statsHero) => {
          const releaseData =
            seasonReleaseData.find((d) => d.hero === statsHero);

          if (releaseData !== undefined) {
            releaseData.statsRecruit = dropRate;
          } else {
            seasonReleaseData.push({
              hero: statsHero,
              advRecruit: false,
              statsRecruit: dropRate,
              freePick: false,
              crystal: false,
              wheel: false,
              event: false,
              other: '',
            });
          } // if
        }); // forEach
      } // if
    });
  });
}

/**
 * Load the list of Event Heroes
 */
function loadEventHeroList() {
  const tsvFilePath = resolve(srcBasePath, 'event-heroes.tsv');
  eventHeroList = readFileSync(tsvFilePath, {encoding: 'utf8'})
      .split('\n')
      .reverse();
}

/**
 * Build template table content
 * @param {string} seasonId - id of the phase or season
 */
function buildSeason(seasonId) {
  const tsvFilePath = resolve(srcBasePath, `${seasonId}.tsv`);
  const rows = readFileSync(tsvFilePath, {encoding: 'utf8'}).split('\n');

  rows.shift(); // Remove header row

  const seasonReleaseData = [];

  rows.forEach((row) => {
    const [
      heroName, advRecruit, freePick,
      crystal, wheel, other,
    ] = row.split('\t');

    /** @type {HeroReleaseData} */
    const heroReleaseData = {
      hero: heroName,
      advRecruit: advRecruit === 'TRUE',
      statsRecruit: false, // placeholder
      freePick: freePick === 'TRUE',
      crystal: crystal === 'TRUE',
      wheel: wheel === 'TRUE',
      event: false, // placeholder
      other: other,
    };

    seasonReleaseData.push(heroReleaseData);
  });

  eventHeroList.forEach((eventHero) => {
    const releaseData = seasonReleaseData.find((d) => d.hero === eventHero);

    if (releaseData !== undefined) {
      releaseData.event = true;
    } else {
      seasonReleaseData.push({
        hero: eventHero,
        advRecruit: false,
        statsRecruit: false, // placeholder
        freePick: false,
        crystal: false,
        wheel: false,
        event: true,
        other: '',
      });
    }
  });

  heroReleaseBase.set(seasonId, seasonReleaseData);
}

export const seasons = [
  'pre-season',
  'transition',
  'season-2', 'season-3', 'season-4',
  'season-5', 'season-6', 'season-7',
  'season-8', 'season-9', 'season-10',
  'season-11', 'season-12',
  'season-31', 'season-32', 'season-33',
  'season-34', 'season-35',
];

// Easter and Brave the Dragonden events on new server have been removed
// So the following is no longer necessary

/*

loadEventHeroList('event-heroes.tsv');

[
  'transition',
  'season-2', 'season-3', 'season-4',
  'season-5', 'season-6', 'season-7',
  'season-8', 'season-9', 'season-10',
  'season-11', 'season-12',
  'season-31', 'season-32', 'season-33',
  'season-34', 'season-35',
].forEach((s) => buildSeason(s));

loadStatsHeroList();

loadEventHeroList('event-heroes-phase-1.tsv');
buildSeason('phase-1');
loadEventHeroList('event-heroes-phase-2.tsv');
buildSeason('phase-2');
*/

loadEventHeroList();
seasons.forEach((s) => buildSeason(s));
loadStatsHeroList();

writeFileSync(
    'hero-release-data.json',
    JSON.stringify(
        Object.fromEntries(heroReleaseBase),
        null,
        '  ',
    ),
);

// console.log(heroReleaseBase);
