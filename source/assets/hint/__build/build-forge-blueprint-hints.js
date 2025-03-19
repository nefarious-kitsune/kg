import {readFileSync, writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

// eslint-disable-next-line max-len
import {HeroGearNames} from '../../../city/blacksmith/hero-gears/__build/hero-gear-names.js';

const ModulePath = dirname(fileURLToPath(import.meta.url));

const hintTemplate = readFileSync(
    resolve(ModulePath, '../__templates/forge-blueprint.md'),
    {encoding: 'utf8'},
);

const hints = [];

for (let tierIdx = 1; tierIdx < HeroGearNames.length; tierIdx++) {
  const tier = tierIdx + 1;
  const name1 = HeroGearNames[tierIdx][0];
  const name2 = HeroGearNames[tierIdx][1];
  const hint = hintTemplate
      .replaceAll('{{TIER}}', tier)
      .replace('{{NAME 1}}', name1)
      .replace('{{NAME 2}}', name2)
  ;
  hints.push(hint);
}

writeFileSync(
    resolve(ModulePath, `../__templates/forge-blueprints.html`),
    hints.join('\n'),
);
