/**
 * Error tracking service
 * Provides centralized error tracking and reporting
 * Logs errors to console in development, can be extended with external services
 */

let isInitialized = false

/**
 * Initialize error tracking
 * Should be called once at application startup
 */
export function initErrorTracking() {
  if (isInitialized || typeof window === 'undefined') {
    return
  }

  isInitialized = true
  
  // Log unhandled errors and promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      captureException(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      captureException(
        event.reason instanceof Error 
          ? event.reason 
          : new Error(String(event.reason)),
        { type: 'unhandledRejection' }
      )
    })
  }
}

/**
 * Capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (typeof window === 'undefined') return

  // Log to console with context
  console.error('Error captured:', {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (typeof window === 'undefined') return

  // Log to console
  const logMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'
  console[logMethod](`[${level.toUpperCase()}] ${message}`, {
    timestamp: new Date().toISOString(),
  })
}

/**
 * Set user context for error tracking
 * (Stored for potential future use with external services)
 */
export function setUserContext(userId: string, email?: string) {
  if (typeof window === 'undefined') return
  
  // Store user context for logging
  if (process.env.NODE_ENV === 'development') {
    console.log('User context set:', { userId, email })
  }
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (typeof window === 'undefined') return
  
  if (process.env.NODE_ENV === 'development') {
    console.log('User context cleared')
  }
}

