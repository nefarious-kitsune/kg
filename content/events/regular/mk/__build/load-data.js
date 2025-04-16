import path from 'path';
import {readJsonFile} from '../../../../../dev/files/files.js';
import {dirs} from './dirs.js';

/** @typedef {import('./typedef.js').MKEventDatabase} MKEventDatabase */
/** @typedef {import('./typedef.js').MKSeasonalData} MKSeasonalData */

const jsonFilePath = path.join(dirs.__content, `/mk-data.json`);

/** @type {MKEventDatabase} */
export const MKEventDatabase = readJsonFile(jsonFilePath);
