import {extname} from 'path';
import {readFileSync} from 'fs';
import {findContentFiles} from './utils/file-utils.js';

import {processYaml} from './yaml/yaml-processor.js';
import * as logger from './logger.js';
import * as consts from './consts.js';


const loadFile = (path) => readFileSync(path, 'utf8');
// const saveFile = (path, content) => writeFileSync(path, content);

const filter = (fn) => extname(fn) === '.yaml';

/** Build page indexes */
function buildIndex() {
  const yamlFiles = findContentFiles(consts.sourceDir, filter);
  yamlFiles.forEach((file) => {
    const content = loadFile(file.fullPath);
    const meta = processYaml(content, file);
    logger.log(JSON.stringify(meta));
  });
}

buildIndex();
