import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'

const ModulePath = dirname(fileURLToPath(import.meta.url));

const importedData = readTsvFile('./data/data.tsv');
const convertedData = [];

function readTsvFile(fName) {
  return readFileSync(resolve(ModulePath, fName), 'utf-8')
    .replaceAll('\r','')
    .replaceAll(',','')
    .split('\n');
}

for (let rowIdx = 1; rowIdx < importedData.length; rowIdx++) {
  let [
    starCount,
    bonus,
    extrapolatedBonus,
    delta,
  ] = importedData[rowIdx].split('\t');

  convertedData.push({
    'star-count': parseInt(starCount),
    'bonus-percent': parseInt(parseInt(extrapolatedBonus)),
    'verified': (bonus.length !== 0),
  });
}

let exportedJSON = JSON.stringify(convertedData, null, '  ');
writeFileSync(resolve(ModulePath, './converted/hero-bonds.json'), exportedJSON);
