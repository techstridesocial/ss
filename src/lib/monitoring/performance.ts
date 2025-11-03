import { NextWebVitalsMetric } from 'next/app'

/**
 * Web Vitals tracking and reporting
 */

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  FCP: 1800,  // First Contentful Paint
  LCP: 2500,  // Largest Contentful Paint
  FID: 100,   // First Input Delay
  CLS: 0.1,   // Cumulative Layout Shift
  TTFB: 600,  // Time to First Byte
  INP: 200,   // Interaction to Next Paint
}

interface WebVitalsReport {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

/**
 * Send performance metrics to analytics
 */
function sendToAnalytics(metric: WebVitalsReport) {
  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    })
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ${metric.name}: ${metric.value} (${metric.rating})`)
  }

  // You can also send to other analytics services here
  // Example: send to Vercel Analytics, Sentry, etc.
}

/**
 * Rate performance metric
 */
function rateMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'FCP':
      return value <= THRESHOLDS.FCP ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor'
    case 'LCP':
      return value <= THRESHOLDS.LCP ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
    case 'FID':
      return value <= THRESHOLDS.FID ? 'good' : value <= 300 ? 'needs-improvement' : 'poor'
    case 'CLS':
      return value <= THRESHOLDS.CLS ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
    case 'TTFB':
      return value <= THRESHOLDS.TTFB ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor'
    case 'INP':
      return value <= THRESHOLDS.INP ? 'good' : value <= 500 ? 'needs-improvement' : 'poor'
    default:
      return 'good'
  }
}

/**
 * Report Web Vitals to analytics
 * Call this from _app.tsx or layout.tsx
 */
export function reportWebVitals(metric: NextWebVitalsMetric) {
  const report: WebVitalsReport = {
    name: metric.name,
    value: metric.value,
    rating: rateMetric(metric.name, metric.value),
    delta: metric.value,
    id: metric.id,
    navigationType: (metric as any).navigationType || 'unknown',
  }

  // Send to analytics
  sendToAnalytics(report)

  // Warn in development for poor metrics
  if (process.env.NODE_ENV === 'development' && report.rating === 'poor') {
    console.warn(`⚠️  Poor ${metric.name} detected: ${metric.value}ms`)
  }
}

/**
 * Track custom performance metrics
 */
export class PerformanceTracker {
  private marks: Map<string, number> = new Map()

  /**
   * Start tracking a custom metric
   */
  start(label: string) {
    if (typeof performance !== 'undefined') {
      this.marks.set(label, performance.now())
    }
  }

  /**
   * End tracking and report duration
   */
  end(label: string, category: string = 'Custom') {
    if (typeof performance === 'undefined') return

    const startTime = this.marks.get(label)
    if (!startTime) return

    const duration = performance.now() - startTime
    this.marks.delete(label)

    // Report to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name: label,
        value: Math.round(duration),
        event_category: category,
      })
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️  ${label}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(label: string, fn: () => Promise<T> | T): Promise<T> {
    this.start(label)
    try {
      const result = await fn()
      this.end(label)
      return result
    } catch (error) {
      this.end(label)
      throw error
    }
  }
}

/**
 * Global performance tracker instance
 */
export const performanceTracker = new PerformanceTracker()

/**
 * Track API request performance
 */
export function trackAPIRequest(endpoint: string, duration: number, status: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'api_request', {
      endpoint,
      duration: Math.round(duration),
      status,
      event_category: 'API Performance',
    })
  }

  // Warn on slow API requests in development
  if (process.env.NODE_ENV === 'development' && duration > 1000) {
    console.warn(`⚠️  Slow API request: ${endpoint} took ${duration}ms`)
  }
}

/**
 * Track page load performance
 */
export function trackPageLoad(pageName: string) {
  if (typeof window === 'undefined') return

  // Use Navigation Timing API
  if ('performance' in window && 'getEntriesByType' in performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        domComplete: navigation.domComplete - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      }

      if ((window as any).gtag) {
        (window as any).gtag('event', 'page_load', {
          page: pageName,
          ...metrics,
          event_category: 'Page Performance',
        })
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`📄 Page load metrics for ${pageName}:`, metrics)
      }
    }
  }
}

