import './skins/build.js';
import './events/build.js';
/*
// FIX ME
// Error if \source\heroes\heroes.json is missing]
import './p2p/build.js'; // Build VIP tables
*/

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
const SourcePath = resolve(ModulePath, '../source/');
const DocsPath = resolve(ModulePath, '../docs/');

const maxDepth = 6;

/**
 * Write progress to console
 * @param {*} progress
 */
function updateProgress(progress) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(progress);
}

/**
 * Execute all build files in the source/ directory
 * @param {'build'|'prebuild'} build - name of build command
 */
function prebuild(build) {
  const traverse = (parentPath, currentDepth) => {
    readdirSync(parentPath).forEach((file) => {
      if (file === `__${build}`) {
        const builderCwd = join(parentPath, file);
        const builderCmd = join(builderCwd, `${build}.js`);
        if (existsSync(builderCmd)) {
          updateProgress(`Executing ${builderCmd}`);
          execSync(`node ${build}`, {cwd: builderCwd});
        }
        return;
      };

      if ((file.startsWith('-')) || (file.startsWith('_'))) return;
      const currentPath = join(parentPath, file);
      if (statSync(currentPath).isDirectory()) {
        if (currentDepth < maxDepth) {
          traverse(currentPath, currentDepth + 1);
        } else {
          console.log('Max directory depth reached: ', currentPath);
        }
      }
    });
  };
  traverse(SourcePath, 0);
}

/** Process source files and copy to destination */
function copyFiles() {
  const srcFilePaths = [];
  const fileTypes = [
    '.css',
    '.html',
    '.tsv',
    '.json',
    '.js',
    '.gs',
    '.jpg',
    '.png',
    '.svg',
  ];

  const traverse = (parentPath, currentDepth) => {
    readdirSync(parentPath).forEach((file) => {
      if ((file.startsWith('-')) || (file.startsWith('_'))) return;

      const currentPath = join(parentPath, file);
      if (statSync(currentPath).isFile()) {
        const ext = extname(currentPath);
        if (fileTypes.indexOf(ext) != -1) srcFilePaths.push(currentPath);
      } else if (statSync(currentPath).isDirectory()) {
        if (currentDepth < maxDepth) {
          traverse(currentPath, currentDepth + 1);
        } else {
          console.log('Max directory depth reached: ', currentPath);
        }
      }
    });
  };

  traverse(SourcePath, 0);

  srcFilePaths.forEach((filePath) => {
    const srcPath = filePath;
    const destPath = join(DocsPath, filePath.slice(SourcePath.length));
    const destDir = dirname(destPath);

    updateProgress(`Processing '${srcPath}'`);

    if (!existsSync(destDir)) mkdirSync(destDir, {recursive: true});
    if (extname(srcPath) === '.html') {
      const fileContent = readFileSync(srcPath, 'utf-8');
      const processed = processHtml(fileContent, srcPath, SourcePath);
      writeFileSync(destPath, processed.source);
    } else {
      copyFileSync(srcPath, destPath, fsConstants.COPYFILE_FICLONE);
    }
  });
}

process.stdout.write('Starting pre-building process...\n');
prebuild('prebuild');
updateProgress('Completed\n\n');

process.stdout.write('Generating intermediate content...\n');
prebuild('build');
updateProgress('Completed\n\n');

process.stdout.write('Generating final content...\n');
copyFiles();
updateProgress('Completed\n\n');
