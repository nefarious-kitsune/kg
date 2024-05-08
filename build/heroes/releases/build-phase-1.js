import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync, readFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../../');

const srcBasePath = resolve(ProjectPath, './source/');

const tsvFilePath = resolve(srcBasePath, 'heroes/releases/phase-1.tsv');
const tsvData = readFileSync(tsvFilePath, {encoding: 'utf8'})
    .split('\n')
    .map((row) => row.split('\t'));

/**
 * Build table
 */
function buildTable() {
  const TableBody = [];
  for (let rowIdx=1; rowIdx < tsvData.length; rowIdx++) {
    const row = tsvData[rowIdx];
    TableBody.push('<tr>');

    TableBody.push(`<td><hero-name>${row[0]}</hero-name></td>`);

    if (row[1]) {
      TableBody.push(
          '<td>' +
          '<img class="icon" ' +
            `text-hint="${row[1]}" ` +
            'src="../../assets/icons/recruit-adv-2x_s.png">' +
          '</td>',
      );
    } else {
      TableBody.push('<td></td>');
    }

    if (row[2]) {
      TableBody.push(
          '<td><img ' +
            'class="icon" ' +
            `text-hint="${row[2]}" ` +
            'src="../../assets/icons/recruit-stats-2x_s.png"' +
          '></td>',
      );
    } else {
      TableBody.push('<td></td>');
    }

    if (row[3]==='TRUE') {
      TableBody.push(
          '<td>' +
          '<img class="icon" src="../../assets/icons/recruit-ssr-2x_s.png">' +
          '</td>',
      );
    } else {
      TableBody.push('<td></td>');
    }

    if (row[4]==='TRUE') {
      TableBody.push(
          '<td>' +
          '<img class="icon" src="../../assets/icons/event-crystal-2x_s.png">' +
          '</td>',
      );
    } else {
      TableBody.push('<td></td>');
    }

    if (row[5]==='TRUE') {
      TableBody.push(
          '<td>' +
          '<img class="icon" src="../../assets/icons/event-wheel-2x_s.png">' +
          '</td>',
      );
    } else {
      TableBody.push('<td></td>');
    }

    TableBody.push('<td>' + row[6] + '</td>');

    TableBody.push('</tr>');
  }

  writeFileSync(
      resolve(srcBasePath, `heroes/releases/__temp/--phase-1.html`),
      TableBody.join('\n'),
  );
}

buildTable();
