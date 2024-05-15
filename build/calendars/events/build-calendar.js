import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync, readFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../../');

const srcBasePath = resolve(ProjectPath, './source/');

/**
 * Build template table content
 */
function buildTemplate() {
  const tsvFilePath = resolve(
      srcBasePath,
      `calendars/__data/events.tsv`,
  );
  const tsvData = readFileSync(tsvFilePath, {encoding: 'utf8'})
      .split('\n')
      .map((row) => row.split('\t'));

  const TableBody = [];
  for (let rowIdx=1; rowIdx < tsvData.length; rowIdx++) {
    const row = tsvData[rowIdx];
    let [
      startDateString,
      endDateString,
      eventName,
      eventType,
      heroName,
      frameName,
      castleName,
    ] = row;

    eventType = parseInt(eventType);
    let eventClass;
    if (eventType === 1) eventClass = 'main-event';
    else if (eventType === 2) eventClass = 'minor-event';
    else if (eventType === 3) eventClass = 'seasonal-event';

    TableBody.push(
        `<tr class="${eventClass}">`,
        `  <td>${startDateString}</td>`,
        `  <td>${endDateString}</td>`,
        `  <td>${eventName}</td>`,
    );

    let rewards = '';
    if ((eventType === 1)||(eventType === 2)) {
      if (frameName==='TBA') frameName = 'Avatar Frame';
      rewards += '<img\n' +
        `    class="icon" title="${frameName}" alt="Avatar Frame"\n` +
        '    src="../assets/icons/emoji_frame.png">';
    }

    if (eventType === 1) {
      if (castleName==='TBA') castleName = 'Castle Skin';
      rewards += '<img\n' +
        `    class="icon" title="${castleName}" alt="Castle Skin"\n` +
        '    src="../assets/icons/emoji_castle.png">';
    }

    if ((eventType === 1)||(eventType === 3)) {
      if (heroName==='TBA') heroName = 'Hero';
      rewards += '<img\n' +
        `    class="icon" title="${heroName}" alt="Hero"\n` +
        '    src="../assets/icons/emoji_hero.png">';
    }

    if (eventType === 2) {
      rewards += '<img\n' +
        `    class="icon" title="Silver Coupon" alt="Silver Coupon"\n` +
        '    src="../assets/icons/emoji_coupon.png">';
    }

    TableBody.push(
        '  <td>' + rewards + '</td>',
        '</tr>',
    );
  }

  writeFileSync(
      resolve(srcBasePath, `calendars/__temp/--events.html`),
      TableBody.join('\n'),
  );
}

buildTemplate();
