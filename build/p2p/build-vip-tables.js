import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync, readFileSync} from 'fs';

import {processHtml} from '../base/process-html.js';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');

const srcBasePath = resolve(ProjectPath, './source/');
const destBasePath = resolve(ProjectPath, './docs/');

const tsvFilePath = resolve(srcBasePath, 'p2p/vip/vip-perks.tsv');
const tsvData = readFileSync(tsvFilePath, {encoding: 'utf8'})
    .split('\n')
    .map((row) => row.split('\t'));

const templateFilePath = resolve(srcBasePath, 'p2p/vip/__perks.html');
const template = readFileSync(templateFilePath, {encoding: 'utf8'});

/**
 * something
 * @param {number} level - VIP Level
 */
function buildPage(level) {
  const prevLevel = (level <= 1)?19:(level-1);
  const nextLevel = (level >= 19)?1:(level+1);

  const vipPoints = tsvData[1][level + 1];
  const pt = parseInt(String(vipPoints).replace(',', ''));
  const iapSpending = (pt / 10)
      .toLocaleString('en-US', {maximumFractionDigits: 0});
  const gcSpending = (pt * 10 / 110) // 100 GC = 10 VIP points, 110 GC = $1.00
      .toLocaleString('en-US', {maximumFractionDigits: 0});

  let content = template
      .replaceAll('{{LEVEL}}', level)
      .replaceAll('{{PREVIOUS LEVEL}}', prevLevel)
      .replaceAll('{{NEXT LEVEL}}', nextLevel)
      .replaceAll('{{VIP POINTS}}', vipPoints)
      .replaceAll('{{IAP SPENDING}}', iapSpending)
      .replaceAll('{{GC SPENDING}}', gcSpending)
      ;

  let perkTable = '';

  const APLimit = tsvData[2][level + 1];
  const RecoveryReduction = tsvData[3][level + 1] || '0';
  // Recovery speed: APs / minute
  const RecoverySpeed = 3.6 * (100 + parseInt(RecoveryReduction)) / 100;
  const RecoveryTime = Math.floor((APLimit - 15) / RecoverySpeed);
  const RHours = Math.floor(RecoveryTime / 60);
  const RMinutes = RecoveryTime - (RHours * 60);
  content = content
      .replaceAll('{{AP LIMIT}}', APLimit)
      .replace('{{AP RECOVERY TIME}}', RHours + 'h ' + RMinutes + 'm')
  ;

  for (let rowIdx = 4; rowIdx <= 16; rowIdx++) {
    const row = tsvData[rowIdx];

    const desc = row[0];
    let prev = row[level];
    let value = row[level + 1];

    let unverified = false;
    let na = false;

    if (prev === '') {
      prev = '&mdash;';
    } else {
      if (prev.indexOf('?') !== -1) value = value.replace('?', '');
    }

    if (value === '') {
      value = '&mdash;';
      na = true;
    } else {
      if (value.indexOf('?') !== -1) {
        unverified = true;
        value = value.replace('?', '');
      }
    }
    const valueText =
      (unverified)?
      `<span class="unverified">${value}<span>`:
      value;

    const changed = (value !== prev);

    perkTable +=
        `<div class="perk-row${na?' na':''}${changed?' changed':''}"` + '\n' +
        `  ><div class="perk-desc">${desc}</div` + '\n' +
        `  ><div class="prev-value">${prev}</div` + '\n' +
        `  ><div class="this-value">${valueText}</div` + '\n' +
        '></div>\n';
  };

  content = content
      .replace('{{PERK TABLE}}', perkTable);

  content = processHtml(content, templateFilePath, srcBasePath).source;

  writeFileSync( resolve(destBasePath, `p2p/vip/${level}.html`), content);
}

for (let level = 1; level <= 19; level++) {
  buildPage(level);
}
