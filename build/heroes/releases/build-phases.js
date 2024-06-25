import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync, readFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../../');

const srcBasePath = resolve(ProjectPath, './source/');

/** @type {string[]} */
let eventHeroList = [];

/**
 * Build template table content
 * @param {string} fileName
 */
function loadEventHeroList(fileName) {
  const tsvFilePath = resolve(
      srcBasePath,
      `heroes/releases/__data/${fileName}`,
  );

  eventHeroList = readFileSync(tsvFilePath, {encoding: 'utf8'})
      .split('\n');
}

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

  const heroes = [];
  const TableBody = [];

  for (let rowIdx=1; rowIdx < tsvData.length; rowIdx++) {
    const row = tsvData[rowIdx];
    const [
      // eslint-disable-next-line no-unused-vars
      name, advRecruit, statsRecruit, freePick,
      crystal, wheel, other,
    ] = row;
    heroes.push(name);

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

    if (eventHeroList.indexOf(name) !== -1) {
      TableBody.push(
          '<td><img ' +
            'class="icon" ' +
            'alt="Special event" ' +
            `title="Special event (crazy mode)" ` +
            'src="../../assets/icons/event-special_gift.png"' +
          '></td>',
      );
    } else {
      TableBody.push('<td></td>');
    }

    TableBody.push('<td>' + other + '</td>');

    TableBody.push('</tr>');
  }

  eventHeroList.filter((h) => heroes.indexOf(h) === -1).forEach((h) => {
    TableBody.push('<tr>');
    TableBody.push(`<td><hero-name>${h}</hero-name></td>`);
    TableBody.push(`<td></td>`); // advanced
    TableBody.push(`<td></td>`); // free-pick
    TableBody.push(`<td></td>`); // crystal
    TableBody.push(`<td></td>`); // wheel
    TableBody.push(
        '<td><img ' +
          'class="icon" ' +
          'alt="Special event" ' +
          `title="Special event (crazy mode)" ` +
          'src="../../assets/icons/event-special_gift.png"' +
        '></td>',
    );
    TableBody.push(`<td></td>`); // Other
    TableBody.push('</tr>');
  });


  writeFileSync(
      resolve(srcBasePath, `heroes/releases/__temp/--${phaseName}.html`),
      TableBody.join('\n'),
  );
}

buildTemplate('phase-1');
loadEventHeroList('event-heroes-phase-2.tsv');
buildTemplate('phase-2');
loadEventHeroList('event-heroes.tsv');
buildTemplate('transition');
buildTemplate('season-2');
buildTemplate('season-3');
buildTemplate('season-4');
buildTemplate('season-5');
buildTemplate('season-6');
buildTemplate('season-7');
buildTemplate('season-8');
buildTemplate('season-9');
