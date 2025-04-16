import {fileURLToPath} from 'url';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const repoDir =
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../');

const config =
    YAML.parse(fs.readFileSync(path.join(repoDir, '/config.yaml'), 'utf8'));

export default {
  /** @type {string} Site title */
  siteTitle: config['site-title'] || 'Demo Site',

  /** @type {string} Base URL, e.g. `https://example.com` */
  baseUrl: config['base-url'] || 'https://example.com',

  /** Repository directory, e.g. `C:\GitHub\kg` */
  repoDir: repoDir,

  /** Default directory for content source, e.g. `C:\GitHub\kg\content` */
  contentDir: path.join(repoDir, '/content'),

  /** Default directory for compiled site, e.g. `C:\GitHub\kg\site` */
  siteDir: path.join(repoDir, '/site'),
};
