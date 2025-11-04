'use client'

import { useEffect } from 'react'
import { initErrorTracking } from '@/lib/monitoring/error-tracker'

/**
 * Client-side error tracking provider
 * Initializes Sentry on the client side
 */
export function ErrorTrackingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initErrorTracking()
  }, [])

  return <>{children}</>
}

