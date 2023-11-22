import fs from 'fs';

const exportDirectory = '../../../../docs/tools';
const importFileName = 'template';
const exportFileName = 'heroUpgradeCalculator';

const mainTemplate = fs.readFileSync(`${importFileName}.html`, 'utf-8');
const heroRowTemplate = fs.readFileSync('t-hero.html', 'utf-8');

let heroRows = '';
for (let idx = 2; idx <= 20; idx++) {
  heroRows += heroRowTemplate.replaceAll('{{NUMBER}}' , idx);
}

const exportedHtml = mainTemplate.replace('{{HERO ROWS}}', heroRows);

fs.writeFileSync(`${exportDirectory}/${exportFileName}.html`, exportedHtml);
