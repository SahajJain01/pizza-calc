// Prometheus metrics setup (singleton)
const client = require('prom-client');
const pkg = require('./package.json');

// Ensure singletons across hot reloads by caching on globalThis
const g = globalThis;
if (!g.__metrics) {
  const register = new client.Registry();

  // Default labels
  const serviceName = process.env.APP_NAME || pkg.name || 'app';
  register.setDefaultLabels({ service: serviceName });

  // Default Node/Process metrics
  client.collectDefaultMetrics({ register });

  // Custom metrics
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

  g.__metrics = { client, register, httpRequestsTotal, httpRequestDurationSeconds, serviceName };
}

module.exports = g.__metrics;

