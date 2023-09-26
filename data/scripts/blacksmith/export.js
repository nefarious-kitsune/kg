import fs from 'fs';
const fileData = fs.readFileSync('data.csv', 'utf-8').split('\n');
const importedData = [];

for (let i = 1; i < fileData.length; i++) {
  const data = fileData[i].split(',');
  const bracketIndex = parseInt(data[0]);

  let startLevel = 0;
  let verified = false;

  if (data[1].length) {
    startLevel = parseInt(data[1]);
    verified = true;
  } else {
    startLevel = parseInt(data[2]);
  }

  if (startLevel >= 2000) break;
 
  const cost = parseInt(data[4]);

  importedData.push(
    {
      index: bracketIndex,
      startLevel: startLevel,
      verified: verified,
      cost: cost,
    }
  )
}

const exportedJSON = JSON.stringify(importedData, null, '  ');
const exportedJs = 'const BlacksmithUpgradeCost = ' + exportedJSON;
fs.writeFileSync('../../../docs/mk/blacksmithUpgradeCost.json', exportedJSON);
fs.writeFileSync('../../../docs/mk/blacksmithUpgradeCost.js', exportedJs);

const exportedTableRows = [];

for (let i = 1; i < importedData.length; i++) {
  const startLevel = importedData[i].startLevel;
  const endLevel =
    (importedData.length > i+1)?
    importedData[i+1].startLevel:
    2000;
  const cost = importedData[i].cost;
  const verified = importedData[i].verified;

  exportedTableRows.push(
`      <tr>
        <td>${startLevel} → ${startLevel+1}<br>⋮<br>${endLevel-1} → ${endLevel}</td>
        <td>${cost}</td>
        <td>Forge Hammer</td>
        <td class="${verified?'verified':'unverified'}">${verified?'Verified':'Extrapolated'}</td>
       </tr>`
  )
}

const htmlTemplate = fs.readFileSync('template.html', 'utf-8');
const htmlOutput = htmlTemplate.replace(
  '<!-- Data -->',
  exportedTableRows.join('\n'),
);

fs.writeFileSync(
  '../../../docs/mk/blacksmithUpgradeCost.html',
  htmlOutput,
  {encoding:'utf8',flag:'w'},
);














