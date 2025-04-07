import YAML from 'yaml';

/** @typedef {import('../utils/file-utils.js').FileResult} FileResult */

/**
 * @param {string} srcContent - source content
 * @param {FileResult} file - relative path of the file
 * @return {object} - processed content
 */
export function processYaml(srcContent, file) {
  srcContent = srcContent.replaceAll('\r', ''); // Remove all \r characters

  const processed = YAML.parse(srcContent);
  if (!processed['short_title']) processed['short_title'] = processed.title;
  if (file.relPath.endsWith('index.html')) {
    processed.path = file.relDir;
  } else {
    processed.path = file.relPath;
  }

  return processed;
}
