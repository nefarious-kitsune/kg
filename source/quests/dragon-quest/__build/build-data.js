// eslint-disable-next-line no-unused-vars
import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} DragonQuestDatabase
 * Database for Hero Gears
 * @property {string} title - Title of the database
 * @property {ChapterData[]} chapters - Data of Hero Gears
 *
 * @typedef {Object} ChapterData
 * Data for Chapter
 * @property {number} number - Chapter number
 * @property {string} title - Chapter title
 * @property {ChapterMissionData[]} missions
 * @property {ChapterRewardData[]} rewards
 *
 * @typedef {Object} ChapterRewardData
 * Data for Chapter Reward
 * @property {string} item - Reward item
 * @property {number|string} quantity - Reward quantity
 *
 * @typedef {string} ChapterMissionData
 */

/**
 * Build quest data
 * @param {string} group - Server Group
 * @return {DragonQuestDatabase}
 */
function buildQuestData(group) {
  /** @type {DragonQuestDatabase} */
  const database = {
    title: `Dragon Quest chapters for ${group.toUpperCase()}`,
    chapters: [],
  };

  const DataPath = resolve(ModulePath, '../__data/');
  const missionRows =
    readFileSync(`${DataPath}/${group}-missions.tsv`, 'utf8').split('\n');
  const rewardRows =
    readFileSync(`${DataPath}/${group}-rewards.tsv`, 'utf8').split('\n');
  const titleRows =
    readFileSync(`${DataPath}/${group}-titles.tsv`, 'utf8').split('\n');

  for (let chapterNbr = 1; chapterNbr <= 40; chapterNbr++) {
    /** @type {ChapterData} */
    const chapterData = {
      number: chapterNbr,
      title: titleRows[chapterNbr-1],
      missions: [],
      rewards: [],
    };

    const startRowIdx = (chapterNbr - 1) * 5;

    for (let i = 0; i < 5; i++) {
      const cells = missionRows
          .slice(startRowIdx, startRowIdx + 5)
          .map((line) => line.split('\t'));
      const desc = cells[i][0];
      const num = cells[i][1];
      if (desc.length === 0) break;
      chapterData.missions.push(desc.replace('{{num}}', num));
    }

    for (let i = 0; i < 5; i++) {
      const cells = rewardRows
          .slice(startRowIdx, startRowIdx + 5)
          .map((line) => line.split('\t'));
      const qty = cells[i][0];
      const item = cells[i][1];
      if (item.length === 0) break;
      chapterData.rewards.push({
        item: item,
        quantity: qty,
      });
    }
    database.chapters.push(chapterData);
  }

  return database;
}

/**
 * Build quest data
 * @param {DragonQuestDatabase} database - Dragon Quest database
 * @param {string} group - Server Group
 */
function saveQuestData(database, group) {
  writeFileSync(
      resolve(ModulePath, `../--dragon-quest-${group}.json`),
      JSON.stringify(database, null, '  ') + '\n',
  );
}

const DragonQuestDatabaseG4 = buildQuestData('g4');
saveQuestData(DragonQuestDatabaseG4, 'g4');

export {
  DragonQuestDatabaseG4,
};
