import http from 'http';
import {fileURLToPath, parse as parseUrl} from 'url';
import {existsSync, statSync, readFile} from 'fs';
import {dirname, extname, resolve} from 'path';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const SitePath = resolve(ModulePath, '../site/');

const port = process.argv[2] || 9000;

// Mapping of file extension to content-type in HTTP response head
const contentTypeMap = {
  // Text
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  // Binary
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};
const defaultContentType = 'text/plain;  charset=utf-8';

http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  const pathname = parseUrl(req.url).pathname;
  let ext = extname(pathname);

  let localPath = resolve(SitePath, `.${pathname}`);

  // URL rewriting...
  if (existsSync(localPath)) {
    if (statSync(localPath).isDirectory()) {
      if (pathname.slice(-1) !== '/') {
        console.log(`Redirecting '${pathname}' to '${pathname}/`);
        res.writeHead(301, {Location: `${pathname}/`}).end();
        return;
      }
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
      const contentType = contentTypeMap[ext] || defaultContentType;
      res.setHeader('Content-type', contentType);
      res.end(data);
    }
  });
}).listen(parseInt(port));

console.log(`Server listening on port ${port}`);

import {exec} from 'child_process';
exec(`start http://localhost:${port}`);
