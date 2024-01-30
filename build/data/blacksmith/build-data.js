import fs from 'fs';

const compiledData = [];

function readTsvFile(fName) {
  return fs
    .readFileSync(fName, 'utf-8')
    .replaceAll('\r','')
    .replaceAll(',','')
    .split('\n');
}

const upgradeData = readTsvFile('data.tsv');

for (let rowIdx = 1; rowIdx < upgradeData.length; rowIdx++) {
  let [
    level,
    power,
    hammerCost,
    extrapolatedCost,
    extrapolatedPower,
  ] = upgradeData[rowIdx].split('\t');

  const costVerified = (extrapolatedCost === 'FALSE');

  const thisData = {
    'level': parseInt(level),
    'hammer-cost': parseInt(hammerCost),
    'cost-verified': costVerified,
  }

  if (power.length > 0) {
    thisData['power'] = parseInt(power);
    thisData['power-verified'] = true;
  } else {
    const prevData = compiledData[compiledData.length-1];
    if (prevData['cost-verified'] && prevData['power-verified']) {
      thisData['power'] = prevData['power'] + (prevData['hammer-cost'] * 500);
      thisData['power-verified'] = true;
    } else {
      thisData['power'] = parseInt(extrapolatedPower);
      thisData['power-verified'] = false;
    }
  }

  compiledData.push(thisData)
}

let exportedJSON = JSON.stringify(compiledData, null, '  ');
fs.writeFileSync('compiled-data.json', exportedJSON);
