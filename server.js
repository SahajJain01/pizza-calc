const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

// Determine static root: --root <dir> CLI arg, then STATIC_ROOT env, else current dir
let root = __dirname;
try {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--root');
  if (idx !== -1 && args[idx + 1]) {
    root = path.resolve(args[idx + 1]);
  } else if (process.env.STATIC_ROOT) {
    root = path.resolve(process.env.STATIC_ROOT);
  }
} catch (_) {
  // Fallback to __dirname if parsing fails
  root = __dirname;
}

const TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.join(root, reqPath);

  // Prevent path traversal
  if (!filePath.startsWith(root)) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream');
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      res.writeHead(500);
      res.end('Internal Server Error');
    });
    stream.pipe(res);
  });
});

server.listen(port, () => {
  console.log(`Serving at http://localhost:${port}`);
});

