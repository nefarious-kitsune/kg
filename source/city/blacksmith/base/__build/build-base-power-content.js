import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const TemplatePath = resolve(ModulePath, '../__templates/');

import {blacksmithTechDatabase} from './build-base-data.js';

/** HTML table body for power */
const powTBody = [];
/** TSV for power */
const powTsv = [];

/**
 * Build temporary content
 */
function buildPowerContent() {
  // Build header row
  powTsv.push(['level', 'blacksmith base power', 'verified'].join('\t'));

  const unverifiedMarker = readFileSync(
      resolve(TemplatePath, 'unverified.md'), {encoding: 'utf8'},
  );
  const rowTemplate = readFileSync(
      resolve(TemplatePath, './power-row.md'), {encoding: 'utf8'},
  );

  blacksmithTechDatabase.power.forEach((entry) => {
    powTBody.push(
        rowTemplate
            .replace('{{FROM LEVEL}}', entry.level)
            .replace('{{MARKER}}', entry.verified?'':unverifiedMarker)
            .replace('{{POWER}}', entry.power),
    );
    powTsv.push([
      entry.level,
      entry.power,
      entry.verified?'TRUE':'FALSE',
    ].join('\t'));
  });
}

/**
 * Build temporary content
 */
function savePowerContent() {
  // Save temp html content for power
  const powFilePaths = [
    resolve(TemplatePath, '--power-1.md'),
    resolve(TemplatePath, '--power-2.md'),
    resolve(TemplatePath, '--power-3.md'),
    resolve(TemplatePath, '--power-4.md'),
  ];
  writeFileSync(powFilePaths[0], powTBody.slice(0, 500).join('\n'));
  writeFileSync(powFilePaths[1], powTBody.slice(500, 1000).join('\n'));
  writeFileSync(powFilePaths[2], powTBody.slice(1000, 1500).join('\n'));
  writeFileSync(powFilePaths[3], powTBody.slice(1500, 2000).join('\n'));

  // Save temp .tsv content for power
  const tsvFilePath = resolve(ModulePath, '../blacksmith-power.tsv');
  writeFileSync(tsvFilePath, powTsv.join('\n'));
}

buildPowerContent();
savePowerContent();
