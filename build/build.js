// Build Mightiest Kingdom data
// import './event/mk/build.js';
// import './server-info/build.js';

import './heroes/build.js';
import './skins/build.js';
import './events/build.js';
import './p2p/build.js'; // Build VIP tables
// import './blacksmith/build.js';


// import {copyDirectory} from './__file/copy-directory.js';

import {fileURLToPath, pathToFileURL} from 'url';
import {dirname, resolve, join, extname} from 'path';
import {readdirSync, statSync, existsSync} from 'fs';
import fs from 'fs';

import {processHtml} from './__html/process-html.js';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../');

/**
 * Compile site
 */
async function compileSite() {
  const srcBasePath = resolve(ProjectPath, './source/');
  const destBasePath = resolve(ProjectPath, './docs/');
  const maxDepth = 6;
  const srcFilePaths = [];
  const builderFilePaths = [];
  const fileTypes = ['.css', '.html', '.tsv', '.js', '.gs'];

  const traverse = (parentPath, currentDepth) => {
    readdirSync(parentPath).forEach((file) => {
      if (file === '__build') {
        const builderFilePath = join(parentPath, file, 'build.js');
        if (existsSync(builderFilePath)) builderFilePaths.push(builderFilePath);
        return;
      };

      if ((file.startsWith('-')) ||(file.startsWith('_'))) return;

      const currentPath = join(parentPath, file);
      if (statSync(currentPath).isFile()) {
        const ext = extname(currentPath);
        if (fileTypes.indexOf(ext) != -1) srcFilePaths.push(currentPath);
      } else if (statSync(currentPath).isDirectory()) {
        if (currentDepth < maxDepth) traverse(currentPath, currentDepth + 1);
      }
    });
  };

  traverse(srcBasePath, 0);

  builderFilePaths.forEach(async (filePath) => {
    console.log('Executing builder file: ', filePath.slice(srcBasePath.length));
    await import(pathToFileURL(filePath));
  });

  srcFilePaths.forEach((filePath) => {
    const srcPath = filePath;
    const destPath = join(destBasePath, filePath.slice(srcBasePath.length));
    const destDir = dirname(destPath);

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, {recursive: true});
    if (extname(srcPath) === '.html') {
      const fileContent = fs.readFileSync(srcPath, 'utf-8');
      const processed = processHtml(fileContent, srcPath, srcBasePath);
      fs.writeFileSync(destPath, processed.source);
    } else {
      fs.copyFileSync(srcPath, destPath, fs.constants.COPYFILE_FICLONE);
    }
  });
}

await compileSite();
