import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync, readFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../../');

const srcBasePath = resolve(ProjectPath, './source/');

/**
 * Build template table content
 * @param {string} phaseName - name of the phase
 */
function buildTemplate(phaseName) {
  const tsvFilePath = resolve(
      srcBasePath,
      `heroes/releases/__data/${phaseName}.tsv`,
  );
  const tsvData = readFileSync(tsvFilePath, {encoding: 'utf8'})
      .split('\n')
      .map((row) => row.split('\t'));

  const TableBody = [];
  for (let rowIdx=1; rowIdx < tsvData.length; rowIdx++) {
    const row = tsvData[rowIdx];
    const [
      name, advRecruit, statsRecruit, freePick,
      crystal, wheel, other,
    ] = row;

    TableBody.push('<tr>');

    TableBody.push(`<td><hero-name>${name}</hero-name></td>`);

    if (advRecruit) {
      TableBody.push(
          '<td>' +
          '<img class="icon" ' +
            'alt="Advanced Recruitment card" ' +
            `title="${advRecruit}" ` +
            'src="../../assets/icons/recruit-adv-2x_s.png">' +
          '</td>',
      );
    } else {
      TableBody.push('<td></td>');
    }

    if (statsRecruit) {
      TableBody.push(
          '<td><img ' +
            'class="icon" ' +
            'alt="Stats Recruitment card" ' +
            `title="${statsRecruit}" ` +
            'src="../../assets/icons/recruit-stats-2x_s.png"' +
          '></td>',
      );
    } else {
      TableBody.push('<td></td>');
    }

    if (freePick==='TRUE') {
      TableBody.push(
          '<td><img ' +
            'class="icon" ' +
            'alt="Free-Pick Hero card" ' +
            'src="../../assets/icons/recruit-ssr-2x_s.png">' +
          '</td>',
      );
    } else {
      TableBody.push('<td></td>');
    }

    if (crystal==='TRUE') {
      TableBody.push(
          '<td><img ' +
            'class="icon" ' +
            'alt="Wishing Crystal Ball" ' +
            'src="../../assets/icons/event-crystal-2x_s.png">' +
          '</td>',
      );
    } else {
      TableBody.push('<td></td>');
    }

    if (wheel==='TRUE') {
      TableBody.push(
          '<td><img ' +
            'class="icon" ' +
            'alt="Lucky WHeel" ' +
            'src="../../assets/icons/event-wheel-2x_s.png">' +
          '</td>',
      );
    } else {
      TableBody.push('<td></td>');
    }

    TableBody.push('<td>' + other + '</td>');

    TableBody.push('</tr>');
  }

  writeFileSync(
      resolve(srcBasePath, `heroes/releases/__temp/--${phaseName}.html`),
      TableBody.join('\n'),
  );
}

buildTemplate('phase-1');
buildTemplate('phase-3');
buildTemplate('season-2');
