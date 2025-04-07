import {fileURLToPath} from 'url';
import {dirname, resolve, join} from 'path';

/**
 * Repository directory,
 * e.g. `C:\GitHub\kg`
 */
const repoDir = resolve(dirname(fileURLToPath(import.meta.url)), '../');

/**
 * Default directory for content source,
 * e.g. `C:\GitHub\kg\source`
 */
const sourceDir = join(repoDir, '/source');

/**
 * Default directory for compiled site,
 * e.g. `C:\GitHub\kg\site`
 */
const siteDir = join(repoDir, '/site');

export {repoDir, sourceDir, siteDir};
