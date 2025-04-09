import {extname} from 'path';
import {readFileSync} from 'fs';
import {findContentFiles} from './utils/file-utils.js';
import YAML from 'yaml';

import * as logger from './logger.js';
import * as consts from './consts.js';

const loadFile = (path) => readFileSync(path, 'utf8');
// const saveFile = (path, content) => writeFileSync(path, content);

/** @typedef {import('../utils/file-utils.js').FileResult} FileResult */

/**
 * @param {string} srcContent - source content
 * @param {FileResult} fResult - file search result
 * @return {object} - processed front matter
 */
function getFrontMatter(srcContent, fResult) {
  srcContent = srcContent.replaceAll('\r', ''); // Remove all \r characters
  const separator = '---\n';
  if (!srcContent.startsWith(separator)) return null;
  const fmStart = separator.length;
  const fmEnd = srcContent.indexOf(separator, fmStart);
  if (fmEnd < 0) return null;

  const fmContent = srcContent.slice(fmStart, fmEnd);
  const frontMatter = YAML.parse(fmContent);
  frontMatter.shortTitle = frontMatter.shortTitle || frontMatter.title;
  const sourceUrl = '/' + fResult.relUrl;
  frontMatter.sourceUrl = sourceUrl;
  frontMatter.permaLink = frontMatter.permaLink || sourceUrl;
  return frontMatter;
}

/** Build page indexes */
function buildIndex() {
  const filter = (fn) => extname(fn) === '.md';
  const mdFiles = findContentFiles(consts.sourceDir, filter);
  mdFiles.forEach((file) => {
    const srcContent = loadFile(file.fullPath);
    const frontMatter = getFrontMatter(srcContent, file);
    if (frontMatter) logger.log(JSON.stringify(frontMatter));
  });
}

buildIndex();
