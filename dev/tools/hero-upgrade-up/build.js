import fs from 'fs';

const exportDirectory = '../../../docs/tools';
const importFileName = 'template';
const exportFileName = 'hero-upgrade-calculator';

const mainTemplate = fs.readFileSync(`${importFileName}.html`, 'utf-8');
const heroInputRowTemplate =  fs.readFileSync('t-hero-input.html',  'utf-8');
const heroOutputRowTemplate = fs.readFileSync('t-hero-output.html', 'utf-8');

let heroInputRows = '';
for (let idx = 1; idx <= 20; idx++) {
  heroInputRows += heroInputRowTemplate.replaceAll('{{INDEX}}' , idx);
}

let heroOutputRows = '';
for (let idx = 1; idx <= 20; idx++) {
  heroOutputRows += heroOutputRowTemplate.replaceAll('{{INDEX}}' , idx);
}

const exportedHtml = mainTemplate
  .replace('{{HERO INPUT ROWS}}', heroInputRows)
  .replace('{{HERO OUTPUT ROWS}}', heroOutputRows);

fs.writeFileSync(`${exportDirectory}/${exportFileName}.html`, exportedHtml);
