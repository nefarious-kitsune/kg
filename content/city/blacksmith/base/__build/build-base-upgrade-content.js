import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const TemplatePath = resolve(ModulePath, '../__templates/');

import {
  blacksmithTechDatabase,
  totalHammerCost,
} from './build-base-data.js';

/** HTML table body for step upgrade */
const stepTBody = [];
/** HTML table body for max upgrade */
const maxTBody = [];
/** TSV for step upgrade */
const supTsv = [];

/**
 * Build temporary content
 */
function buildUpgradeContent() {
  // Build header row
  supTsv.push(['from', 'to', 'forge hammer cost', 'verified'].join('\t'));

  const unverifiedMarker = readFileSync(
      resolve(TemplatePath, 'unverified.md'), {encoding: 'utf8'},
  );
  const rowTemplate = readFileSync(
      resolve(TemplatePath, './upgrade-row.md'), {encoding: 'utf8'},
  );

  let cumulatedHammerCost = 0;
  blacksmithTechDatabase.upgrade.forEach((entry) => {
    const hammerCost = entry['forge-hammer'];
    const maxHammerCost = totalHammerCost - cumulatedHammerCost;
    stepTBody.push(
        rowTemplate
            .replace('{{FROM LEVEL}}', entry.from)
            .replace('{{TO LEVEL}}', entry.to)
            .replace('{{MARKER}}', entry.verified?'':unverifiedMarker)
            .replace('{{FORGE HAMMER COST}}', hammerCost),
    );
    maxTBody.push(
        rowTemplate
            .replace('{{FROM LEVEL}}', entry.from)
            .replace('{{TO LEVEL}}', '2000')
            .replace('{{MARKER}}', entry.verified?'':unverifiedMarker)
            .replace('{{FORGE HAMMER COST}}', maxHammerCost),
    );
    supTsv.push([
      entry.from,
      entry.to,
      hammerCost,
      entry.verified?'TRUE':'FALSE',
    ].join('\t'));
    cumulatedHammerCost += hammerCost;
  });
}

/**
 * Save temporary content
 */
function saveUpgradeContent() {
  // Save temp html content for step upgrades
  const supFilePaths = [
    resolve(TemplatePath, './--step-upgrade-1.md'),
    resolve(TemplatePath, './--step-upgrade-2.md'),
    resolve(TemplatePath, './--step-upgrade-3.md'),
    resolve(TemplatePath, './--step-upgrade-4.md'),
  ];
  writeFileSync(supFilePaths[0], stepTBody.slice(0, 500).join('\n'));
  writeFileSync(supFilePaths[1], stepTBody.slice(500, 1000).join('\n'));
  writeFileSync(supFilePaths[2], stepTBody.slice(1000, 1500).join('\n'));
  writeFileSync(supFilePaths[3], stepTBody.slice(1500, 2000).join('\n'));

  // Save temp html content for max upgrades
  const mupFilePaths = [
    resolve(TemplatePath, './--max-upgrade-1.md'),
    resolve(TemplatePath, './--max-upgrade-2.md'),
    resolve(TemplatePath, './--max-upgrade-3.md'),
    resolve(TemplatePath, './--max-upgrade-4.md'),
  ];
  writeFileSync(mupFilePaths[0], maxTBody.slice(0, 500).join('\n'));
  writeFileSync(mupFilePaths[1], maxTBody.slice(500, 1000).join('\n'));
  writeFileSync(mupFilePaths[2], maxTBody.slice(1000, 1500).join('\n'));
  writeFileSync(mupFilePaths[3], maxTBody.slice(1500, 2000).join('\n'));

  // Save temp .tsv content for step upgrade
  writeFileSync(
      resolve(ModulePath, '../blacksmith-upgrade.tsv'),
      supTsv.join('\n'),
  );
}

buildUpgradeContent();
saveUpgradeContent();
