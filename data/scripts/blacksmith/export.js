// import http from 'https';

// const sourceUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQjO1u2_a4bemI376-bkPG9kx6wd8VbXCTEJPOvATTIkYd3jrjOE44JKhoyCFBk8YCFsDAMFQYtPqdD/pub?gid=1519544104&single=true&output=tsv';
// let tsvData = '';

// http.get(sourceUrl, (response) => {
//   response.on('data', function(chunk) {
//     tsvData += chunk;
//   });
//   response.on('end', function() {
//     // prints the full CSV file
//     console.log(tsvData);
//   });
// });

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

  if (startLevel >= 2000) startLevel = 2000;
 
  const cost = parseInt(data[4]);

  importedData.push(
    {
      index: bracketIndex,
      startLevel: startLevel,
      verified: verified,
      cost: cost,
    }
  )

  if (startLevel >= 2000) break;
}

console.log(importedData);

const exportedJs =
  'const BlacksmithUpgradeCost = ' +
  JSON.stringify(importedData, null, '  ');

fs.writeFileSync(
  '../../../docs/mk/blacksmithUpgradeCost.js',
  exportedJs,
  {encoding:'utf8',flag:'w'},
);

