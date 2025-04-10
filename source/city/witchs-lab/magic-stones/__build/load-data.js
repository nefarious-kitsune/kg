import path from 'path';
import {readJsonFile} from '../../../../../dev/files/files.js';
import {dirs} from './dirs.js';

/** @typedef {import('./typedef.js').MagicStoneData} MagicStoneData */
/** @typedef {import('./typedef.js').MagicStoneDatabase} MagicStoneDatabase */

const jsonFilePath = path.join(dirs.__content, `/magic-stone-data.json`);

/** @type {MagicStoneDatabase} */
export const MagicStoneDatabase = readJsonFile(jsonFilePath);
