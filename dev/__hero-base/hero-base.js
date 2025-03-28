import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {readFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const jsonFilePath = resolve(ModulePath, '../../source/heroes/heroes.json');

export const HeroBase = {
  /** @type {import('../../source/heroes/__prebuild/build-data.js').HeroData[]} */
  heroes: null,

  getHeroes() {
    if (this.heroes === null) {
      this.heroes = JSON.parse(readFileSync(jsonFilePath, 'utf-8'));
    }
    return this.heroes;
  },

};

