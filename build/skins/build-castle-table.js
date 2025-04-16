import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync, readFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');

const srcBasePath = resolve(ProjectPath, './source/');

/**
 * Build template table content
 */
function buildCastleTable() {
  const tsvFilePath = resolve(
      srcBasePath,
      `skins/__data/castle-availability.tsv`,
  );
  const tsvData = readFileSync(tsvFilePath, {encoding: 'utf8'})
      .split('\n')
      .map((row) => row.split('\t'));

  const yes =
    '  <td><img class="icon" title="available"\n' +
    '    src="../assets/icons/emoji_check-color.png"></td>';

  const no =
  '  <td><img class="icon" title="unavailable"\n' +
  '    src="../assets/icons/emoji_cross-color.png"></td>';

  const TableBody = [];
  for (let rowIdx=1; rowIdx < tsvData.length; rowIdx++) {
    const [skinName, g2, g3, g4, g5, g6] = tsvData[rowIdx];
    TableBody.push(
        '<tr class="${eventClass}">',
        `  <td><castle-name>${skinName}</castle-name></td>`,
        (g2 === 'TRUE')?yes:no,
        (g3 === 'TRUE')?yes:no,
        (g4 === 'TRUE')?yes:no,
        (g5 === 'TRUE')?yes:no,
        (g6 === 'TRUE')?yes:no,
        '</tr>',
    );
  }

  writeFileSync(
      resolve(srcBasePath, `skins/__templates/--castle-availability.html`),
      TableBody.join('\n'),
  );
}

buildCastleTable();
