import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

import {DragonQuestDatabaseG4} from './build-data.js';

/** @typedef {import('./build-data.js').DragonQuestDatabase} DragonQuestDatabase */

const ModulePath = dirname(fileURLToPath(import.meta.url));
const TemplatePath = resolve(ModulePath, '../__templates/');

const chapterContentTemplate =
    readFileSync(resolve(TemplatePath, 'chapter.md'), 'utf8');

/**
 * Build tiered Hero Gear content
 * @param {DragonQuestDatabase} database
 * @param {string} group - Server Group
 */
function buildDragonQuestContent(database, group) {
  const chapters = [];
  const index = [];

  console.log(database.chapters);

  for (let chapterIdx = 0; chapterIdx < 40; chapterIdx++) {
    const n = chapterIdx+1;
    const data = database.chapters[chapterIdx];
    const missions = data.missions;
    const rewards = data.rewards;
    if (missions.length) {
      const mList = missions.map((m) => `  <li>${m}</li>`);
      const rList = rewards.map((r) => `  <li>${r.quantity} ${r.item}</li>`);
      let title = `Chapter ${n}`;
      if (data.title.length) title += `: ${data.title}`;
      chapters.push(
          chapterContentTemplate
              .replace('{{CHAPTER}}', chapterIdx+1)
              .replace('{{CHAPTER TITLE}}', title)
              .replace('{{MISSION LIST}}', mList.join('\n'))
              .replace('{{REWARD LIST}}', rList.join('\n'))
          ,
      );
      index.push(`  <li><a href="#chapter-${n}">Chapter ${n}</a></li>`);
    } else {
      index.push(`  <li>Chapter ${n}</li>`);
    }
  }

  writeFileSync(
      resolve(TemplatePath, `${group}-chapters.html`),
      chapters.join('\n'),
  );
  writeFileSync(
      resolve(TemplatePath, `${group}-index.html`),
      index.join('\n'),
  );
}

buildDragonQuestContent(DragonQuestDatabaseG4, 'g4');
