import { Module, Global } from '@nestjs/common';

/**
 * Prometheus Metrics Configuration
 * 
 * This module provides application metrics collection using prom-client.
 * Metrics are exposed at GET /metrics for Prometheus to scrape.
 * 
 * Available metrics:
 * - http_requests_total: Counter of total HTTP requests (method, route, status)
 * - http_request_duration_seconds: Histogram of request durations
 * - active_connections: Gauge of currently active connections
 * - database_query_duration_seconds: Histogram of DB query durations
 * - cache_hits_total: Counter of cache hits/misses
 * - orders_total: Counter of orders placed
 * - payment_transactions_total: Counter of payment transactions (status)
 * - user_registrations_total: Counter of new user registrations
 */

interface MetricDefinition {
  name: string;
  help: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  labelNames?: string[];
  buckets?: number[];
}

const METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    type: 'counter',
    labelNames: ['method', 'route', 'status_code'],
  },
  {
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    type: 'histogram',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  },
  {
    name: 'active_connections',
    help: 'Number of currently active connections',
    type: 'gauge',
  },
  {
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    type: 'histogram',
    labelNames: ['operation', 'model'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  },
  {
    name: 'cache_operations_total',
    help: 'Total number of cache operations',
    type: 'counter',
    labelNames: ['operation', 'result'],
  },
  {
    name: 'orders_total',
    help: 'Total number of orders placed',
    type: 'counter',
    labelNames: ['status', 'payment_method'],
  },
  {
    name: 'payment_transactions_total',
    help: 'Total number of payment transactions',
    type: 'counter',
    labelNames: ['provider', 'status'],
  },
  {
    name: 'user_registrations_total',
    help: 'Total number of user registrations',
    type: 'counter',
    labelNames: ['method'],
  },
  {
    name: 'email_sent_total',
    help: 'Total number of emails sent',
    type: 'counter',
    labelNames: ['template', 'status'],
  },
  {
    name: 'product_views_total',
    help: 'Total number of product page views',
    type: 'counter',
    labelNames: ['category'],
  },
];

class MetricsService {
  private metrics: Map<string, unknown> = new Map();

  constructor() {
    // Initialize metrics (in production, use prom-client)
    for (const def of METRIC_DEFINITIONS) {
      this.metrics.set(def.name, {
        ...def,
        value: def.type === 'gauge' ? 0 : undefined,
      });
    }
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, labels: Record<string, string> = {}): void {
    // prom-client: this.counters.get(name)?.inc(labels);
    const metric = this.metrics.get(name);
    if (metric) {
      // Placeholder - in production use prom-client
    }
  }

  /**
   * Observe a histogram value
   */
  observeHistogram(
    name: string,
    value: number,
    labels: Record<string, string> = {},
  ): void {
    // prom-client: this.histograms.get(name)?.observe(labels, value);
    const metric = this.metrics.get(name);
    if (metric) {
      // Placeholder - in production use prom-client
    }
  }

  /**
   * Set a gauge value
   */
  setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    // prom-client: this.gauges.get(name)?.set(labels, value);
    const metric = this.metrics.get(name);
    if (metric) {
      // Placeholder - in production use prom-client
    }
  }

  /**
   * Get all metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    // prom-client: return register.metrics();
    return '# HELP ecommerce_up Application is up\n# TYPE ecommerce_up gauge\necommerce_up 1\n';
  }

  /**
   * Get metric definitions for documentation
   */
  getDefinitions(): MetricDefinition[] {
    return METRIC_DEFINITIONS;
  }
}

@Global()
@Module({
  providers: [
    {
      provide: 'METRICS_SERVICE',
      useFactory: () => new MetricsService(),
    },
  ],
  exports: ['METRICS_SERVICE'],
})
export class MetricsModule {}
