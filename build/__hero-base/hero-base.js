import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const jsonFilePath = resolve(ModulePath, '../../source/heroes/hero-base.json');

/** @type {import('../../source/heroes/__prebuild/build-data.js').HeroData[]} */
export const HeroBase = JSON.parse(readFileSync(jsonFilePath, 'utf-8'));
