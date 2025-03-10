import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {getHeroGearDesc} from '../../__build/get-tier-desc.js';

const ModulePath = dirname(fileURLToPath(import.meta.url));

const priceData = readFileSync(
    resolve(ModulePath, '../forge-blueprint-prices.tsv'),
    {encoding: 'utf8'},
).split('\n');

/**
 * Build price table
 * @param {number} tableNum
 * @param {number} rowStart - fist season row
 * @param {number} rowEnd - last season row
 * @param {number} tierColStart - fist tier column
 */
function buildPriceTable(tableNum, rowStart, rowEnd, tierColStart) {
  const headerRow = priceData[0];
  const headerCells = headerRow.split('\t');
  const tiers = [
    parseInt(headerCells[tierColStart].slice(1)),
    parseInt(headerCells[tierColStart+1].slice(1)),
    parseInt(headerCells[tierColStart+2].slice(1)),
    parseInt(headerCells[tierColStart+3].slice(1)),
    parseInt(headerCells[tierColStart+4].slice(1)),
  ];

  const tableTemplate = readFileSync(
      resolve(ModulePath, '../__templates/price-table.md'),
      {encoding: 'utf8'},
  );

  const rowTemplate = readFileSync(
      resolve(ModulePath, '../__templates/price-row.md'),
      {encoding: 'utf8'},
  );

  let tableOutput = '';

  tableOutput = tableTemplate
      .replace('{{TIER A}}', tiers[0])
      .replace('{{TIER A DESC}}', getHeroGearDesc(tiers[0]))
      .replace('{{TIER B}}', tiers[1])
      .replace('{{TIER B DESC}}', getHeroGearDesc(tiers[1]))
      .replace('{{TIER C}}', tiers[2])
      .replace('{{TIER C DESC}}', getHeroGearDesc(tiers[2]))
      .replace('{{TIER D}}', tiers[3])
      .replace('{{TIER D DESC}}', getHeroGearDesc(tiers[3]))
      .replace('{{TIER E}}', tiers[4])
      .replace('{{TIER E DESC}}', getHeroGearDesc(tiers[4]));

  const sections = [];

  const getTierPriceClass = (price) => {
    price = price.trim();
    switch (price) {
      case '':
      case 'Locked':
      case 'Event': return '';
      case '$99.99': return 'sales9999';
      case '$49.99': return 'sales4999';
      case '$19.99': return 'sales1999';
      case '$9.99': return 'sales999';
      default: return 'sales499';
    }
  };

  for (let rowIdx = rowStart; rowIdx <= rowEnd; rowIdx++) {
    const row = priceData[rowIdx];
    const cells = row.split('\t');
    const SeasonName = cells[0];
    // const Historical = row[1];
    const Predicted = cells[2] === 'TRUE';
    const TierAPrice = cells[tierColStart];
    const TierBPrice = cells[tierColStart+1];
    const TierCPrice = cells[tierColStart+2];
    const TierDPrice = cells[tierColStart+3];
    const TierEPrice = cells[tierColStart+4];

    const rowOutput = rowTemplate
        .replace('{{VERIFIED}}', Predicted?'unverified':'verified')
        .replace('{{SEASON NAME}}', SeasonName)
        .replace('{{PRICE A}}', TierAPrice)
        .replace('{{PRICE A CLASS}}', getTierPriceClass(TierAPrice))
        .replace('{{PRICE B}}', TierBPrice)
        .replace('{{PRICE B CLASS}}', getTierPriceClass(TierBPrice))
        .replace('{{PRICE C}}', TierCPrice)
        .replace('{{PRICE C CLASS}}', getTierPriceClass(TierCPrice))
        .replace('{{PRICE D}}', TierDPrice)
        .replace('{{PRICE D CLASS}}', getTierPriceClass(TierDPrice))
        .replace('{{PRICE E}}', TierEPrice)
        .replace('{{PRICE E CLASS}}', getTierPriceClass(TierEPrice))
    ;

    sections.push(rowOutput);
  };

  tableOutput = tableOutput
      .replace('{{BODY}}', sections.join('\n'))
      .replaceAll('Locked', '')
      .replaceAll('Event', '<a href="/events/regular/mk/rewards">Event</a>');

  writeFileSync(
      resolve(ModulePath, `../__templates/--price-table-${tableNum}.md`),
      tableOutput,
  );
}

buildPriceTable(1, 1, 13, 3); // Season 0-11. Tier 2-6
buildPriceTable(2, 14, 26, 5); // Season 12-24. Tier 4-8
buildPriceTable(3, 27, 39, 7); // Season 25-37. Tier 6-10
buildPriceTable(4, 38, 48, 8); // Season 38-46. Tier 7-11
