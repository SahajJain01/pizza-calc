const http = require('http');
const fs = require('fs');
const path = require('path');

// Metrics toggle (default: enabled)
const METRICS_ENABLED = !['false', '0'].includes(String(process.env.METRICS_ENABLED || 'true').toLowerCase());
let metrics;
if (METRICS_ENABLED) {
  try {
    metrics = require('./metrics');
  } catch (e) {
    // If prom-client is not available, disable metrics gracefully
    console.warn('Metrics disabled (prom-client not available):', e && e.message);
    metrics = null;
  }
}

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

const server = http.createServer(async (req, res) => {
  let reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  // Handle /metrics route if enabled
  if (req.method === 'GET' && reqPath === '/metrics') {
    if (!METRICS_ENABLED || !metrics) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    try {
      const body = await metrics.register.metrics();
      res.statusCode = 200;
      res.setHeader('Content-Type', metrics.register.contentType);
      res.setHeader('Cache-Control', 'no-store');
      res.end(body);
    } catch (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
    }
    return;
  }

  // Basic HTTP instrumentation (skip /metrics)
  const shouldInstrument = METRICS_ENABLED && !!metrics;
  const routeLabel = reqPath; // no framework templating; use path
  const methodLabel = (req.method || 'GET').toUpperCase();
  const endTimer = shouldInstrument
    ? metrics.httpRequestDurationSeconds.startTimer({ method: methodLabel, route: routeLabel, service: metrics.serviceName })
    : null;

  const filePath = path.join(root, reqPath);

  // After response finishes, record metrics
  if (shouldInstrument) {
    res.on('finish', () => {
      const status = String(res.statusCode || 0);
      metrics.httpRequestsTotal
        .labels({ method: methodLabel, route: routeLabel, status, service: metrics.serviceName })
        .inc();
      if (endTimer) endTimer({ status });
    });
  }

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

