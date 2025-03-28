import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync, readFileSync} from 'fs';

import {processHtml} from '../__html/process-html.js';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');

const srcBasePath = resolve(ProjectPath, './source/');
const destBasePath = resolve(ProjectPath, './docs/');

const tsvFilePath = resolve(srcBasePath, 'p2p/vip/vip-perks.tsv');
const tsvData = readFileSync(tsvFilePath, {encoding: 'utf8'})
    .split('\n')
    .map((row) => row.split('\t'));

const templateFilePath = resolve(srcBasePath, 'p2p/vip/__all.html');
const template = readFileSync(templateFilePath, {encoding: 'utf8'});

/**
 * Build VIP information table
 */
function buildTable() {
  const TableHeader = [];
  TableHeader.push('<tr>');
  TableHeader.push('<th class="desc-col">&nbsp;</th>');
  for (let level = 1; level <= 19; level++) {
    TableHeader.push(`<th><a href="./${level}">VIP-${level}</a></th>`);
  }
  TableHeader.push('</tr>');

  const TableBody = [];
  for (let row=1; row < tsvData.length; row++) {
    TableBody.push('<tr>');
    TableBody.push(`<th class="desc-col">${tsvData[row][0]}</th>`);
    for (let level = 1; level <= 19; level++) {
      let value = tsvData[row][level+1];
      if (value === '') {
        TableBody.push('<td class="na">&mdash;</td>');
      } else if (value.indexOf('?') !== -1) {
        value = value.replace('?', '');
        TableBody.push(`<td><span class="unverified">${value}<span></td>`);
      } else {
        TableBody.push(`<td>${value}</td>`);
      }
    }
    TableBody.push('</tr>');
  }

  let content = template
      .replaceAll('{{TABLE HEADER}}', TableHeader.join('\n'))
      .replaceAll('{{TABLE BODY}}', TableBody.join('\n'))
      ;

  content = processHtml(content, templateFilePath, srcBasePath).source;

  writeFileSync( resolve(destBasePath, `p2p/vip/all.html`), content);
}

buildTable();
