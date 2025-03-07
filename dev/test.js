import http from 'http';
import {fileURLToPath, parse as parseUrl} from 'url';
import {existsSync, statSync, readFile} from 'fs';
import {dirname, extname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const SitePath = resolve(ModulePath, '../../docs/');

const port = process.argv[2] || 9000;

http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  const pathname = `.${parseUrl(req.url).pathname}`;
  let ext = extname(pathname);

  const mimeTypeMap = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
  };

  // URL rewriting...
  let localPath = resolve(SitePath, pathname);
  if (existsSync(localPath)) {
    if (statSync(localPath).isDirectory()) {
      localPath += '/index.html';
      if (!existsSync(localPath)) {
        res.statusCode = 404;
        res.end(`Index file for '${pathname}' not found!`);
        console.error(`404 Error: '${pathname}' not found!`);
        return;
      }
      ext = '.html';
    }
  } else {
    localPath += '.html';
    if (!existsSync(localPath)) {
      res.statusCode = 404;
      res.end(`File '${pathname}' not found!`);
      console.error(`404 Error: '${pathname}' not found!`);
      return;
    }
    ext = '.html';
  }

  readFile(localPath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end(`Error getting the file: ${pathname}.`);
      console.error(`500 Error: ${err}`);
    } else {
      res.setHeader('Content-type', mimeTypeMap[ext] || 'text/plain' );
      res.end(data);
    }
  });
}).listen(parseInt(port));

console.log(`Server listening on port ${port}`);

import {exec} from 'child_process';
exec(`start http://localhost:${port}`);
