/**
 * Performance monitoring and analytics utilities
 */

declare global {
  function gtag(...args: any[]): void
}

export interface PerformanceMetrics {
  name: string
  value: number
  timestamp: number
  url: string
  userAgent: string
}

export interface ErrorReport {
  message: string
  stack?: string
  url: string
  timestamp: number
  userAgent: string
  userId?: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private errors: ErrorReport[] = []
  private isEnabled = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.isEnabled = true
      this.initializeMonitoring()
    }
  }

  private initializeMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      this.captureLoadMetrics()
    })

    // Monitor navigation timing
    this.observeNavigationTiming()

    // Monitor Core Web Vitals
    this.observeCoreWebVitals()

    // Monitor errors
    this.observeErrors()
  }

  private captureLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (navigation) {
      this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart)
      this.recordMetric(
        'dom_content_loaded',
        navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
      )
      this.recordMetric('first_paint', navigation.loadEventEnd - navigation.fetchStart)
      this.recordMetric('ttfb', navigation.responseStart - navigation.requestStart)
    }
  }

  private observeNavigationTiming() {
    // Observe navigation entries
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming
          this.recordMetric('navigation_time', nav.loadEventEnd - nav.loadEventStart)
        }
      }
    }).observe({ entryTypes: ['navigation'] })
  }

  private observeCoreWebVitals() {
    // First Contentful Paint (FCP)
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('fcp', entry.startTime)
        }
      }
    }).observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint (LCP)
    new PerformanceObserver(list => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.recordMetric('lcp', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as any // Type assertion for browser compatibility
        if (fidEntry.processingStart) {
          this.recordMetric('fid', fidEntry.processingStart - fidEntry.startTime)
        }
      }
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const clsEntry = entry as any // Type assertion for browser compatibility
        if (!clsEntry.hadRecentInput && clsEntry.value) {
          clsValue += clsEntry.value
        }
      }
      this.recordMetric('cls', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  private observeErrors() {
    // JavaScript errors
    window.addEventListener('error', event => {
      this.recordError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      })
    })

    // Promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.recordError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        url: window.location.href,
        userAgent: navigator.userAgent,
      })
    })
  }

  recordMetric(name: string, value: number) {
    if (!this.isEnabled) return

    const metric: PerformanceMetrics = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }

    this.metrics.push(metric)
    this.sendMetricToAnalytics(metric)
  }

  recordError(error: Omit<ErrorReport, 'timestamp'>) {
    if (!this.isEnabled) return

    const errorReport: ErrorReport = {
      ...error,
      timestamp: Date.now(),
    }

    this.errors.push(errorReport)
    this.sendErrorToAnalytics(errorReport)
  }

  private async sendMetricToAnalytics(metric: PerformanceMetrics) {
    try {
      // Send to your analytics service (Google Analytics, etc.)
      if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
        // Example Google Analytics 4 event
        if (typeof gtag !== 'undefined') {
          gtag('event', 'performance_metric', {
            metric_name: metric.name,
            metric_value: metric.value,
            page_url: metric.url,
          })
        }
      }

      // You can also send to your own API
      // await fetch('/api/analytics/metrics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metric),
      // })
    } catch (error) {
      console.warn('Failed to send metric to analytics:', error)
    }
  }

  private async sendErrorToAnalytics(error: ErrorReport) {
    try {
      // Send to error reporting service (Sentry, etc.)
      console.error('Application Error:', error)

      // You can send to your own API
      // await fetch('/api/analytics/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error),
      // })
    } catch (err) {
      console.warn('Failed to send error to analytics:', err)
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getErrors(): ErrorReport[] {
    return [...this.errors]
  }

  // Measure custom performance
  startMeasure(name: string): () => void {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      this.recordMetric(name, endTime - startTime)
    }
  }

  // Measure React component rendering
  measureComponent(componentName: string, renderFunction: () => void): void {
    const stopMeasure = this.startMeasure(`component_render_${componentName}`)
    renderFunction()
    stopMeasure()
  }

  // Measure async operations
  async measureAsync<T>(name: string, asyncFunction: () => Promise<T>): Promise<T> {
    const stopMeasure = this.startMeasure(name)
    try {
      const result = await asyncFunction()
      stopMeasure()
      return result
    } catch (error) {
      stopMeasure()
      throw error
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React Hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    recordMetric: (name: string, value: number) => performanceMonitor.recordMetric(name, value),
    recordError: (error: Omit<ErrorReport, 'timestamp'>) => performanceMonitor.recordError(error),
    startMeasure: (name: string) => performanceMonitor.startMeasure(name),
    measureAsync: <T>(name: string, fn: () => Promise<T>) =>
      performanceMonitor.measureAsync(name, fn),
    getMetrics: () => performanceMonitor.getMetrics(),
    getErrors: () => performanceMonitor.getErrors(),
  }
}

// Utility to measure page transitions
export function measurePageTransition(to: string) {
  const startTime = performance.now()

  return () => {
    const endTime = performance.now()
    performanceMonitor.recordMetric(`page_transition_to_${to}`, endTime - startTime)
  }
}
