import './heroes/build.js';
import './skins/build.js';
import './events/build.js';
import './p2p/build.js'; // Build VIP tables

// import {copyDirectory} from './__file/copy-directory.js';

import {fileURLToPath} from 'url';
import {dirname, resolve, join, extname} from 'path';
import {
  constants as fsConstants,
  readdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  statSync,
  existsSync,
  mkdirSync} from 'fs';
import {execSync} from 'child_process';

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
  const fileTypes = ['.css', '.html', '.tsv', '.js', '.gs'];

  const traverse = (parentPath, currentDepth) => {
    readdirSync(parentPath).forEach((file) => {
      if (file === '__build') {
        const builderCwd = join(parentPath, '__build');
        const builderFilePath = join(builderCwd, 'build.js');
        if (existsSync(builderFilePath)) {
          console.log('Executing builder file: ', builderFilePath);
          execSync('node build', {cwd: builderCwd});
        }
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

  srcFilePaths.forEach((filePath) => {
    const srcPath = filePath;
    const destPath = join(destBasePath, filePath.slice(srcBasePath.length));
    const destDir = dirname(destPath);

    if (!existsSync(destDir)) mkdirSync(destDir, {recursive: true});
    if (extname(srcPath) === '.html') {
      const fileContent = readFileSync(srcPath, 'utf-8');
      const processed = processHtml(fileContent, srcPath, srcBasePath);
      writeFileSync(destPath, processed.source);
    } else {
      copyFileSync(srcPath, destPath, fsConstants.COPYFILE_FICLONE);
    }
  });
}

await compileSite();
