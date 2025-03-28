import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync, readFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');

const srcBasePath = resolve(ProjectPath, './source/');

/**
 * Build template table content
 */
function buildTemplate() {
  const tsvFilePath = resolve(
      srcBasePath,
      `events/__data/events.tsv`,
  );
  const tsvData = readFileSync(tsvFilePath, {encoding: 'utf8'})
      .split('\n')
      .map((row) => row.split('\t'));

  const TableBody = [];
  for (let rowIdx= (tsvData.length -1 ); rowIdx > 1; rowIdx--) {
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

    const rewardList = [];

    if (eventName==='TBA') eventName = 'Special Event (TBA)';

    if ((eventType === 1) || (eventType === 2)) {
      if (frameName==='TBA') {
        rewardList.push('<li class="frame tba">Avatar Frame (TBA)</li>');
      } else {
        rewardList.push(`<li class="frame">${frameName}</li>`);
      }
    }

    if (eventType === 1) {
      if (castleName==='TBA') {
        rewardList.push('<li class="castle tba">Castle Skin (TBA)</li>');
      } else {
        rewardList.push(`<li class="castle">${castleName}</li>`);
      }
    }

    if ((eventType === 1) || (eventType === 3)) {
      if (heroName==='TBA') {
        rewardList.push('<li class="hero tba">Hero (TBA)</li>');
      } else {
        rewardList.push(`<li class="hero">${heroName}</li>`);
      }
    }

    if (eventType === 2) {
      rewardList.push('<li class="coupon">Silver Coupon</li>');
    }

    TableBody.push(
        `<div class="event-row ${eventClass}">`,
        '<div class="event-heading">',
        `  <h3 class="event-title">${eventName}</h3>`,
        `  <div class="event-date">${startDateString} ~ ${endDateString}</div>`,
        '</div>',
        '<div class="event-detail"><ul class="emoji-markers">',
        rewardList.join('\n'),
        '</ul></div>',
        '</div>',
    );
  }

  writeFileSync(
      resolve(srcBasePath, `events/__temp/--events.html`),
      TableBody.join('\n'),
  );
}

buildTemplate();
