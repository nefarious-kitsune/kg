import {fileURLToPath} from 'url';
import path from 'path';
import consts from '../../../../../dev/consts.js';

const baseDir = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(baseDir, '../');

/** Directories */
export const dirs = {
  // Global directories
  repo: consts.repoDir,
  content: consts.contentDir,
  site: consts.publicDir,
  // Local directories
  __base: baseDir,
  __content: contentDir,
  __data: path.join(contentDir, '/__data'),
  __temp: path.join(baseDir, '/__templates'),
  __generated: path.join(baseDir, '/__generated'),
};
