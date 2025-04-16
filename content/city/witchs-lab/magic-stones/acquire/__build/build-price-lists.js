import {existsSync} from 'fs';
import path from 'path';

import {
  readTsvFile,
  readTextFile,
  saveTextFile,
} from '../../../../../../dev/files/files.js';
import {dirs} from './dirs.js';

const templates = {
  'price-list': readTextFile(`${dirs.__temp}/price-list.md`),
  'price-list-row': readTextFile(`${dirs.__temp}/price-list-row.md`),
  'tier-label': readTextFile(`${dirs.__temp}/tier-label.md`),
  'tier-range-label': readTextFile(`${dirs.__temp}/tier-range-label.md`),
};

const getTierPriceClass = (price) => {
  price = price.trim();
  const eventLabel = '<span --has-hint --hint-ref="event-mk">MK</span>';
  switch (price) {
    case '':
    case 'Locked': return ['', 'text'];
    case 'Event': return [eventLabel, 'text'];
    case '$99.99': return [price, 'sales9999'];
    case '$49.99': return [price, 'sales4999'];
    case '$19.99': return [price, 'sales1999'];
    case '$9.99': return [price, 'sales999'];
    default: return [price, 'sales499'];
  }
};

const tierRangeRe = /(\d+)[-–](\d+)/i;

/** Build gear database */
function buildPriceLists() {
  let listNumber = 1;
  while (true) {
    const tsvFilePath = path.join(dirs.__data, `/prices-${listNumber}.tsv`);
    if (!existsSync(tsvFilePath)) break;
    const tsvData = readTsvFile(tsvFilePath);

    const tierA = tsvData[0][3].slice(1);
    const tierB = tsvData[0][4].slice(1);
    const tierC = tsvData[0][5].slice(1);
    const tierD = tsvData[0][6].slice(1);
    const tierE = tsvData[0][7].slice(1);
    let tierALabel = templates['tier-label'].replaceAll('{{TIER}}', tierA);
    const tierBLabel = templates['tier-label'].replaceAll('{{TIER}}', tierB);
    const tierCLabel = templates['tier-label'].replaceAll('{{TIER}}', tierC);
    const tierDLabel = templates['tier-label'].replaceAll('{{TIER}}', tierD);
    const tierELabel = templates['tier-label'].replaceAll('{{TIER}}', tierE);
    const tierARangeResult = tierA.match(tierRangeRe);
    if (tierARangeResult) {
      tierALabel = templates['tier-range-label']
          .replace('{{TIER-START}}', tierARangeResult[1])
          .replace('{{TIER-END}}', tierARangeResult[2])
      ;
    }
    const rows = [];
    for (let rowIdx = 1; rowIdx < tsvData.length; rowIdx++) {
      const seasonNumber = tsvData[rowIdx][0];
      const predicted = tsvData[rowIdx][2] === 'TRUE';
      const [priceA, priceAClass] = getTierPriceClass(tsvData[rowIdx][3]);
      const [priceB, priceBClass] = getTierPriceClass(tsvData[rowIdx][4]);
      const [priceC, priceCClass] = getTierPriceClass(tsvData[rowIdx][5]);
      const [priceD, priceDClass] = getTierPriceClass(tsvData[rowIdx][6]);
      const [priceE, priceEClass] = getTierPriceClass(tsvData[rowIdx][7]);
      const currRow = templates['price-list-row']
          .replace('{{VERIFIED}}', predicted?'unverified':'verified')
          .replace('{{SEASON-NUMBER}}', seasonNumber)
          .replace('{{PRICE-A}}', priceA)
          .replace('{{PRICE-A-CLASS}}', priceAClass)
          .replace('{{PRICE-B}}', priceB)
          .replace('{{PRICE-B-CLASS}}', priceBClass)
          .replace('{{PRICE-C}}', priceC)
          .replace('{{PRICE-C-CLASS}}', priceCClass)
          .replace('{{PRICE-D}}', priceD)
          .replace('{{PRICE-D-CLASS}}', priceDClass)
          .replace('{{PRICE-E}}', priceE)
          .replace('{{PRICE-E-CLASS}}', priceEClass)
      ;
      rows.push(currRow);
    }

    const priceList = templates['price-list']
        .replace('{{TIER-A-LABEL}}', tierALabel)
        .replace('{{TIER-B-LABEL}}', tierBLabel)
        .replace('{{TIER-C-LABEL}}', tierCLabel)
        .replace('{{TIER-D-LABEL}}', tierDLabel)
        .replace('{{TIER-E-LABEL}}', tierELabel)
        .replace('{{PRICE-DATA}}', rows.join('\n'))
    ;

    saveTextFile(
        path.join(dirs['__generated'], `via-iap-${listNumber}.md`),
        priceList,
    );

    listNumber++;
  }
}

buildPriceLists();
