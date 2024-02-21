import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
const ModulePath = dirname(fileURLToPath(import.meta.url));

// Compile TSV data to structured JSON files
import './compile.js';

function parseJSON(filePath) {
  return JSON.parse(readFileSync(resolve(ModulePath, filePath), 'utf-8'));
}

const archerHeroData =  parseJSON('./compiled/archer.json');
const fireHeroData =  parseJSON('./compiled/fire.json');
const iceHeroData =  parseJSON('./compiled/ice.json');
const goblinHeroData =  parseJSON('./compiled/goblin.json');

const HeroData = []
  .concat(archerHeroData)
  .concat(fireHeroData)
  .concat(iceHeroData)
  .concat(goblinHeroData);


const ExportPath = resolve(ModulePath, '../../docs/hero/')
writeFileSync(
  resolve(ExportPath, './hero-data.json'),
  JSON.stringify(HeroData, null, '  '),
);
