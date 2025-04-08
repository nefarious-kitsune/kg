import YAML from 'yaml';

/** @typedef {import('../utils/file-utils.js').FileResult} FileResult */

/**
 * @param {string} srcContent - source content
 * @param {FileResult} file - relative path of the file
 * @return {object} - processed content
 */
export function processFrontMatter(srcContent, file) {
  srcContent = srcContent.replaceAll('\r', ''); // Remove all \r characters
  if (srcContent.startsWith('---')) {
    const frontMatter = YAML.parse(srcContent);
    frontMatter.shortTitle = frontMatter.shortTitle || frontMatter.title;
    const sourceUrl = '/' + file.relUrl;
    frontMatter.sourceUrl = sourceUrl;
    frontMatter.permaLink = frontMatter.permaLink || sourceUrl;
    return frontMatter;
  }
}
