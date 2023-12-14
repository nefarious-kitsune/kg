import fs from 'fs';

const exportDirectory = '../../docs/templates';
// const exportFileFragment = `${exportDirectory}/dragonUpgradeCost`;

const htmlTemplate = fs.readFileSync('template.html', 'utf-8');

const reTag = /<([/=\d\s\w]*)>/g;
const reSpaces = /( {2,})/g;

const reColorTag = /<color=(\w+)>/g;
const reSizeTag = /<size=(\d+)>/g;
const reEndTag = /<\/(size|color|b|i)>/g;

let indexList = '';

function replaceSizeTag(math, p1) {
  return `<span style="font-size:${(parseInt(p1)/30)}rem">`;
}

function replaceSpaces(math, p1) {
  return ' ' + '&nbsp;'.repeat(p1.length - 1);
}

function build(fileName, title, description, type) {
  const input = fs.readFileSync(`./examples/${fileName}.msg`, 'utf-8');

  const inputHTML = input
    .replaceAll(reTag, '<span class="format-tag">&lt;$1&gt;</span>')
    .replaceAll(reSpaces,  replaceSpaces)
    .replaceAll('\n', '<br />');

  const outputHTML = input
    .replaceAll(reColorTag, '<span style="color:$1">')
    .replaceAll(reSizeTag,  replaceSizeTag)
    .replaceAll(reSpaces,  replaceSpaces)
    .replaceAll('<b>', '<span style="font-weight:bold">')
    .replaceAll('<i>', '<span style="font-style:italic">')
    .replaceAll(reEndTag, '</span>')
    .replaceAll('\n', '<br />');

  const htmlOutput =  htmlTemplate
    .replaceAll('{{TITLE}}', title)
    .replaceAll('{{DESCRIPTION}}', description)
    .replaceAll('{{INPUT}}', inputHTML)
    .replaceAll('{{OUTPUT}}', outputHTML)
    .replaceAll('{{TYPE}}', type);

  fs.writeFileSync(`${exportDirectory}/${fileName}.html`, htmlOutput, {encoding:'utf8',flag:'w'});

  indexList += ` <li><a href="./${fileName}">${title}</a>: ${description}</li>\n`
}

build(
  'new-season',
  'End of season reminder',
  'Reminder mail at end of Burning Expedition',
  'mail',
);

build(
  'alliance-welcome',
  'Alliance message',
  'Alliance message example',
  'message',
);

build(
  'alliance-welcome-2',
  'Alliance message',
  'Alliance message example (provided by 𝚃𝚛𝚒𝚔𝚝𝚒𝚜)',
  'message',
);

const indexTemplate = fs.readFileSync('index.html', 'utf-8');
fs.writeFileSync(
  `${exportDirectory}/index.html`,
  indexTemplate.replace('{{LIST}}', indexList),
  {encoding:'utf8',flag:'w'}
);
