import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../../');

const srcBasePath = resolve(ProjectPath, './source/');

import {seasons, heroReleaseBase} from './build-db.js';


/**
 * Build template table content
 * @param {string} seasonId - name of the phase
 */
function buildTemplate(seasonId) {
  const seasonReleaseData = heroReleaseBase.get(seasonId);
  if (seasonReleaseData === undefined) return;

  const TableBody = [];

  seasonReleaseData.forEach((releaseData) => {
    TableBody.push('<tr>');

    TableBody.push(`<td><hero-name>${releaseData.hero}</hero-name></td>`);

    if (releaseData.advRecruit) {
      TableBody.push(
          '<td>' +
          '<img class="icon" ' +
            'alt="Advanced Recruitment card" ' +
            `title="${releaseData.advRecruit}" ` +
            'src="../../assets/icons/recruit-adv-2x_s.png">' +
          '</td>',
      );
    } else {
      TableBody.push('<td></td>');
    }

    if (releaseData.statsRecruit) {
      TableBody.push(
          '<td>' +
          '<img class="icon" ' +
            'alt="Stats Recruitment card" ' +
            `title="${releaseData.statsRecruit}" ` +
            'src="../../assets/icons/recruit-stats-2x_s.png">' +
          '</td>',
      );
    } else {
      TableBody.push('<td></td>');
    }

    if (releaseData.freePick) {
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

    if (releaseData.crystal) {
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

    if (releaseData.wheel) {
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

    if (releaseData.event) {
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

    TableBody.push('<td>' + releaseData.other + '</td>');

    TableBody.push('</tr>');
  });

  writeFileSync(
      resolve(srcBasePath, `heroes/releases/__temp/--${seasonId}.html`),
      TableBody.join('\n'),
  );
}

seasons.forEach((s) => buildTemplate(s));
