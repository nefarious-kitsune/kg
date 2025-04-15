import path from 'path';
import fs from 'fs';
import consts from '../consts.js';
import logger from '../logger/logger.js';

import {readTextFile} from '../files/files.js';

/** @typedef {import('../site-meta/typedef.js').PageMeta} PageMeta */

/**
 * Perform snippet transclusion
 * @param {PageMeta} pageMeta - Page meta
 * @param {string} content - Text content
 * @return {string}
 **/
export function transclude(pageMeta, content) {
  const tcStartTag = '{{<';
  const tcEndTag = '>}}';
  let tcStart;
  let tcEnd;
  let tcLink;

  const findTranscludeTag = () => {
    const idx0 = content.indexOf(tcStartTag);
    if (idx0 >= 0) {
      const idx1 = content.indexOf(tcEndTag, idx0 + 3);
      if (idx1 > 0) {
        tcStart = idx0;
        tcEnd = idx1 + 3;
        tcLink = content.slice(idx0 + 3, idx1);
        return true;
      }
    }
    return false;
  };

  while (findTranscludeTag()) {
    let tcPath;
    if (tcLink.startsWith('/')) {
      tcPath = path.join(consts.sourceDir, tcLink);
    } else {
      tcPath = path.join(
          consts.sourceDir,
          path.dirname(pageMeta['source-url']),
          tcLink,
      );
    }
    let replaceWith = '';
    if (!fs.existsSync(tcPath)) {
      replaceWith = 'CONTENT NOT FOUND';
      logger.error(`Transclusion Error: ${tcLink} NOT FOUND`);
    } else {
      replaceWith = readTextFile(tcPath);
    }

    content =
        content.substring(0, tcStart) +
        replaceWith +
        content.substring(tcEnd)
    ;
  }

  return content;
}
