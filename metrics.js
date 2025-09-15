// Prometheus metrics setup with prom-client (singleton-safe)
const pkg = require('./package.json');

const enabled = process.env.METRICS_ENABLED !== 'false' && process.env.METRICS_ENABLED !== '0';

if (!global.__metricsSingleton && enabled) {
  const client = require('prom-client');

  const register = new client.Registry();
  const service = process.env.APP_NAME || pkg.name || 'app';
  register.setDefaultLabels({ service });

  client.collectDefaultMetrics({ register });

  const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status', 'service'],
    registers: [register],
  });

  const httpRequestDurationSeconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status', 'service'],
    buckets: [
      0.005, 0.01, 0.025, 0.05, 0.1,
      0.25, 0.5, 1, 2.5, 5, 10,
    ],
    registers: [register],
  });

  async function serveMetrics(res) {
    try {
      const body = await register.metrics();
      res.statusCode = 200;
      res.setHeader('Content-Type', register.contentType);
      res.setHeader('Cache-Control', 'no-store');
      res.end(body);
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
      res.end('Failed to collect metrics');
    }
  }

  function instrumentRequest(method, route, res) {
    // Measure duration manually so we can set status at finish
    const start = process.hrtime.bigint();
    const base = { method, route, service };
    const onFinish = () => {
      try {
        const diffNs = Number(process.hrtime.bigint() - start);
        const seconds = diffNs / 1e9;
        const status = String(res.statusCode || 0);
        const labels = { ...base, status };
        httpRequestsTotal.inc(labels);
        httpRequestDurationSeconds.observe(labels, seconds);
      } catch (_) {
        // Swallow metrics errors; never crash the app
      }
    };
    res.once('finish', onFinish);
  }

  global.__metricsSingleton = {
    enabled,
    register,
    service,
    serveMetrics,
    instrumentRequest,
  };
}

module.exports = global.__metricsSingleton || { enabled: false };

