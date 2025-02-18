import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));

const namesData = readFileSync(
    resolve(ModulePath, '../../../events/regular/mk/__data/names.tsv'),
    {encoding: 'utf8'},
).split('\n');

const priceData = readFileSync(
    resolve(ModulePath, '../magic-books/magic-book-prices.tsv'),
    {encoding: 'utf8'},
).split('\n');

const namesLookup = [];

const rewardName2Type = {
  'Blueprint': 'Armor',
  'Magic Dust': 'Magic Stone',
  'Forge Blueprint': 'Weapon',
  'Magic Book': 'Summon Monster',
};

namesData.forEach((row) => {
  const [
    RewardName,
    Tier,
    RewardDesc,
  ] = row.split('\t');
  namesLookup.push({
    name: RewardName,
    tier: parseInt(Tier),
    desc: RewardDesc,
  });
});

/**
 * Find reward desc
 * @param {string} rewardName
 * @param {number} rewardTier
 * @return {string}
 */
function findRewardDesc(rewardName, rewardTier) {
  const namesData = namesLookup.find((data) => (
    (data.name === rewardName) && (data.tier === rewardTier)
  ));
  if (namesData) return namesData.desc;

  if (rewardName !== 'Magic Dust') {
    console.log(`reward name not found (T${rewardTier} ${rewardName})`);
  }

  return 'T' + rewardTier + ' ' + rewardName2Type[rewardName];
}

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
  const tierCells = headerCells.slice(tierColStart, tierColStart+5);
  const tiers = tierCells.map((txt) => parseInt(txt.slice(1)));

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
      .replace('{{TIER A DESC}}', findRewardDesc('Magic Book', tiers[0]))
      .replace('{{TIER B}}', tiers[1])
      .replace('{{TIER B DESC}}', findRewardDesc('Magic Book', tiers[1]))
      .replace('{{TIER C}}', tiers[2])
      .replace('{{TIER C DESC}}', findRewardDesc('Magic Book', tiers[2]))
      .replace('{{TIER D}}', tiers[3])
      .replace('{{TIER D DESC}}', findRewardDesc('Magic Book', tiers[3]))
      .replace('{{TIER E}}', tiers[4])
      .replace('{{TIER E DESC}}', findRewardDesc('Magic Book', tiers[4]));

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
    const TierBPrice = cells[tierColStart+2];
    const TierCPrice = cells[tierColStart+3];
    const TierDPrice = cells[tierColStart+4];
    const TierEPrice = cells[tierColStart+5];

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

buildPriceTable(1, 1, 16, 3);
buildPriceTable(2, 17, 31, 5);
buildPriceTable(3, 32, 46, 6);
