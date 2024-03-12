import fs from 'fs';

const exportDirectory = '../../docs/templates';

const htmlTemplate = fs.readFileSync('template.html', 'utf-8');

const reTag = /<([/=\d\s\w]*)>/ig;
const reSpaces = /( {2,})/ig;

const reBoldTag = /<b>/ig;
const reItalicTag = /<i>/ig;
const reColorTag = /<color=(\w+)>/ig;
const reSizeTag = /<size=(\d+)>/ig;
const reEndTag = /<\/(size|color|b|i)>/ig;

let indexList = '';

function replaceTag(math, p1) {
  return `<span class="format-tag">&lt;${p1.toLowerCase()}&gt;</span>`;
}

function replaceColorTag(math, p1) {
  return `<span style="color:${p1.toLowerCase()}">`;
}

function replaceSizeTag(math, p1) {
  return `<span style="font-size:${(parseInt(p1)/30).toFixed(1)}rem">`;
}

function replaceSpaces(math, p1) {
  return ' ' + '&nbsp;'.repeat(p1.length - 1);
}

function build(fileName) {
  const fileContent = fs
    .readFileSync(`./examples/${fileName}.msg`, 'utf-8')
    .split('\n');

  const type = fileContent[0].trim().toLowerCase();
  const title = fileContent[1].trim();
  const description = fileContent[2].trim();
  const input = fileContent.slice(4).join('\n');

  const inputHTML = input
    .replaceAll(reTag, replaceTag)
    .replaceAll(reSpaces,  replaceSpaces)
    .replaceAll('\n', '<br />\n');

  const outputHTML = input
    .replaceAll(reColorTag, replaceColorTag)
    .replaceAll(reSizeTag,  replaceSizeTag)
    .replaceAll(reSpaces,  replaceSpaces)
    .replaceAll(reBoldTag, '<span style="font-weight:bold">')
    .replaceAll(reItalicTag, '<span style="font-style:italic">')
    .replaceAll(reEndTag, '</span>')
    .replaceAll('\n', '<br />\n');

  const htmlOutput =  htmlTemplate
    .replaceAll('{{TITLE}}', title)
    .replaceAll('{{DESCRIPTION}}', description)
    .replaceAll('{{INPUT}}', inputHTML)
    .replaceAll('{{OUTPUT}}', outputHTML)
    .replaceAll('{{TYPE}}', type);

  fs.writeFileSync(`${exportDirectory}/${fileName}.html`, htmlOutput, {encoding:'utf8',flag:'w'});

  indexList += ` <li><a href="./${fileName}">${title}</a>: ${description}</li>\n`
}

const files = [
  'alliance-welcome',
  'alliance-welcome-2',
  'alliance-tech-reminder',
  'svs-thank-you-win',
  'svs-thank-you-loss',
  'new-season',
  'lava-reminder',
  'esi-reminder',
  'lava-cave-reminder',
];

files.forEach((fileName) => build(fileName));

const indexTemplate = fs.readFileSync('index.html', 'utf-8');
fs.writeFileSync(
  `${exportDirectory}/index.html`,
  indexTemplate.replace('{{LIST}}', indexList),
  {encoding:'utf8',flag:'w'}
);
