import fs from 'fs';
import {getDateFormatStrings} from '../../utils/date-utils.js';

const exportDirectory = '../../../docs/data';
const exportFileFragment = `${exportDirectory}/dragonUpgradeCost`;
const tableName = 'Dragon Upgrade';

const tableDate = new Date();
const fmtTableDate = getDateFormatStrings(tableDate);
const tableDataCode = `${fmtTableDate.YYYY}-${fmtTableDate.MM}-${fmtTableDate.DD}`

function buildT1Table(data) {
  const output = [];
  data.forEach((row) => {
    const [lvl, cost] = row.split('\t');
    const level = parseInt(lvl);
    output.push(`<tr>`)
    output.push(`<td class="level-col">${level} → ${level+1}</td>`);
    output.push(`<td class="cost-col">${cost}</td>`);
    output.push(`</tr>`);
  })
  return output;
}

function buildT2Table(data) {
  const output = [];
  data.forEach((row) => {
    const [lvl, req, cost] = row.split('\t');
    const level = parseInt(lvl);
    output.push(`<tr>`)
    output.push(`<td class="level-col">${level} → ${level+1}</td>`);
    output.push(`<td class="req-col">${req}</td>`);
    output.push(`<td class="cost-col">${cost}</td>`);
    output.push(`</tr>`);
  })
  return output;
}

const T1TableContent = buildT1Table(fs.readFileSync('t1.tsv', 'utf-8').split('\n'));
const T2TableContent = buildT2Table(fs.readFileSync('t2.tsv', 'utf-8').split('\n'));
const T3TableContent = buildT2Table(fs.readFileSync('t3.tsv', 'utf-8').split('\n'));
const T4TableContent = buildT2Table(fs.readFileSync('t4.tsv', 'utf-8').split('\n'));

const htmlTemplate = fs.readFileSync('template.html', 'utf-8');
const htmlOutput =  htmlTemplate
  .replace('{{T1 DATA}}', T1TableContent.join('\n'))
  .replace('{{T2 DATA}}', T2TableContent.join('\n'))
  .replace('{{T3 DATA}}', T3TableContent.join('\n'))
  .replace('{{T4 DATA}}', T4TableContent.join('\n'));

fs.writeFileSync(`${exportFileFragment}.html`, htmlOutput, {encoding:'utf8',flag:'w'});
