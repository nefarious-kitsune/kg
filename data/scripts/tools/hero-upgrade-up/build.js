import fs from 'fs';

const exportDirectory = '../../../../docs/tools';
const importFileName = 'template';
const exportFileName = 'heroUpgradeCalculator';

const mainTemplate = fs.readFileSync(`${importFileName}.html`, 'utf-8');
const heroInputRowTemplate = fs.readFileSync('t-hero.html', 'utf-8');
const heroOutputRowTemplate = fs.readFileSync('t-hero-calculated.html', 'utf-8');

let heroInputRows = '';
for (let idx = 2; idx <= 20; idx++) {
  heroInputRows += heroInputRowTemplate.replaceAll('{{NUMBER}}' , idx);
}

let heroOutputRows = '';
for (let idx = 2; idx <= 20; idx++) {
  heroOutputRows += heroOutputRowTemplate.replaceAll('{{NUMBER}}' , idx);
}


const exportedHtml = mainTemplate
  .replace('{{HERO INPUT ROWS}}', heroInputRows)
  .replace('{{HERO OUTPUT ROWS}}', heroOutputRows);

fs.writeFileSync(`${exportDirectory}/${exportFileName}.html`, exportedHtml);
