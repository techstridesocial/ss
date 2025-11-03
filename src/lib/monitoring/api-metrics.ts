/**
 * API Performance Monitoring
 * Track API request/response times and errors
 */

interface APIMetric {
  endpoint: string
  method: string
  duration: number
  status: number
  timestamp: number
  error?: string
}

class APIMetricsCollector {
  private metrics: APIMetric[] = []
  private readonly MAX_METRICS = 100 // Keep last 100 metrics in memory

  /**
   * Record an API request metric
   */
  record(metric: APIMetric) {
    this.metrics.push(metric)
    
    // Keep only last N metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift()
    }

    // Log slow requests in development
    if (process.env.NODE_ENV === 'development') {
      if (metric.duration > 1000) {
        console.warn(`🐌 Slow API: ${metric.method} ${metric.endpoint} took ${metric.duration}ms`)
      }
      if (metric.status >= 400) {
        console.error(`❌ API Error: ${metric.method} ${metric.endpoint} returned ${metric.status}`)
      }
    }

    // Send to analytics if available
    this.sendToAnalytics(metric)
  }

  /**
   * Get statistics for an endpoint
   */
  getStats(endpoint?: string) {
    const relevantMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics

    if (relevantMetrics.length === 0) {
      return null
    }

    const durations = relevantMetrics.map(m => m.duration)
    const errors = relevantMetrics.filter(m => m.status >= 400).length

    return {
      count: relevantMetrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      p95Duration: this.percentile(durations, 0.95),
      p99Duration: this.percentile(durations, 0.99),
      errorRate: (errors / relevantMetrics.length) * 100,
      errors,
    }
  }

  /**
   * Calculate percentile
   */
  private percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const index = Math.ceil(sorted.length * p) - 1
    return sorted[index] || 0
  }

  /**
   * Send metrics to analytics
   */
  private sendToAnalytics(metric: APIMetric) {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'api_request', {
        endpoint: metric.endpoint,
        method: metric.method,
        duration: Math.round(metric.duration),
        status: metric.status,
        event_category: 'API Performance',
        non_interaction: true,
      })
    }
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    return [...this.metrics]
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = []
  }
}

// Global instance
export const apiMetrics = new APIMetricsCollector()

/**
 * Wrapper for fetch to automatically track performance
 */
export async function monitoredFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const startTime = performance.now()
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  const method = init?.method || 'GET'

  try {
    const response = await fetch(input, init)
    const duration = performance.now() - startTime

    // Record metric
    apiMetrics.record({
      endpoint: url,
      method,
      duration,
      status: response.status,
      timestamp: Date.now(),
    })

    return response
  } catch (error) {
    const duration = performance.now() - startTime

    // Record error metric
    apiMetrics.record({
      endpoint: url,
      method,
      duration,
      status: 0,
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    throw error
  }
}

/**
 * Get performance report for display
 */
export function getPerformanceReport() {
  const allStats = apiMetrics.getStats()
  
  if (!allStats) {
    return {
      message: 'No API metrics collected yet',
      stats: null,
    }
  }

  return {
    message: `Collected ${allStats.count} API requests`,
    stats: {
      ...allStats,
      avgDuration: `${allStats.avgDuration.toFixed(2)}ms`,
      p95Duration: `${allStats.p95Duration.toFixed(2)}ms`,
      p99Duration: `${allStats.p99Duration.toFixed(2)}ms`,
      errorRate: `${allStats.errorRate.toFixed(2)}%`,
    },
  }
}

/**
 * API monitoring middleware for server-side
 */
export function createAPIMonitor() {
  return {
    /**
     * Start timing an API request
     */
    startTimer: () => {
      return performance.now()
    },

    /**
     * End timing and log
     */
    endTimer: (startTime: number, endpoint: string, method: string, status: number) => {
      const duration = performance.now() - startTime
      
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        const emoji = status >= 400 ? '❌' : duration > 1000 ? '🐌' : '✅'
        console.log(`${emoji} ${method} ${endpoint}: ${duration.toFixed(2)}ms (${status})`)
      }

      // Warn on slow requests
      if (duration > 2000) {
        console.warn(`⚠️  Very slow API request: ${method} ${endpoint} took ${duration.toFixed(2)}ms`)
      }

      return duration
    },
  }
}

