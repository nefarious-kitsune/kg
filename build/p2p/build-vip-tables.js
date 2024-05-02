import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync, readFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');

const tsvFilePath = resolve(ProjectPath, 'source/p2p/vip/__vip-perks.tsv');
const tsvData = readFileSync(tsvFilePath, {encoding: 'utf8'})
    .split('\n')
    .map((row) => row.split('\t'));


/**
 * something
 * @param {number} level - VIP Level
 */
function buildTemplate(level) {
  const rows = [];
  tsvData.forEach((row) => {
    const desc = row[0];
    let value = row[level + 1];
    if (value === '') {
      rows.push(
          '<div class="perk-row na"',
          `  ><div class="perk-desc">${desc}</div`,
          `  ><div class="perk-value">&mdash;</div`,
          '></div>',
      );
    } else {
      let unverified = false;
      if (value.indexOf('?') !== -1) {
        unverified = true;
        value = value.replace('?', '');
      }
      if (value.indexOf('%') !== -1) {
        if (value.charAt(0) !== '-') value = '+' + value;
      }
      const valueText =
        (unverified)?
        `<span class="unverified">${value}<span>`:
        value;
      rows.push(
          '<div class="perk-row"',
          `  ><div class="perk-desc">${desc}</div`,
          `  ><div class="perk-value">${valueText}</div`,
          '></div>',
      );
    }
  });

  writeFileSync(
      resolve(ProjectPath, `source/p2p/vip/__templates/--perks-${level}.tsv`),
      rows.join('\n'),
  );
}

buildTemplate(0);
buildTemplate(1);
