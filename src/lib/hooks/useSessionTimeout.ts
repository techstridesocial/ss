'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

const TIMEOUT_DURATION = 30 * 60 * 1000 // 30 minutes
const WARNING_BEFORE = 5 * 60 * 1000 // 5 minute warning

export interface UseSessionTimeoutReturn {
  timeRemaining: number
  showWarning: boolean
  resetTimer: () => void
}

/**
 * Hook to manage session timeout with activity tracking
 * Shows a warning modal before timeout and auto-logout when expired
 */
export function useSessionTimeout(
  onWarning?: () => void,
  onExpire?: () => void
): UseSessionTimeoutReturn {
  const router = useRouter()
  const { signOut } = useAuth()
  const [timeRemaining, setTimeRemaining] = useState(TIMEOUT_DURATION)
  const [showWarning, setShowWarning] = useState(false)
  const lastActivityRef = useRef<number>(Date.now())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const warningShownRef = useRef(false)

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now()
    setTimeRemaining(TIMEOUT_DURATION)
    setShowWarning(false)
    warningShownRef.current = false
  }, [])

  const handleActivity = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  const checkTimeout = useCallback(() => {
    const now = Date.now()
    const elapsed = now - lastActivityRef.current
    const remaining = TIMEOUT_DURATION - elapsed

    if (remaining <= 0) {
      // Session expired
      setTimeRemaining(0)
      setShowWarning(false)
      if (onExpire) {
        onExpire()
      } else {
        // Default: sign out and redirect
        signOut?.().then(() => {
          router.push('/sign-in')
        })
      }
      return
    }

    setTimeRemaining(remaining)

    // Show warning if we're within the warning period and haven't shown it yet
    if (remaining <= WARNING_BEFORE && !warningShownRef.current) {
      setShowWarning(true)
      warningShownRef.current = true
      if (onWarning) {
        onWarning()
      }
    } else if (remaining > WARNING_BEFORE) {
      setShowWarning(false)
      warningShownRef.current = false
    }
  }, [onWarning, onExpire, signOut, router])

  useEffect(() => {
    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Check timeout every second
    timerRef.current = setInterval(checkTimeout, 1000)

    // Initial check
    checkTimeout()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [handleActivity, checkTimeout])

  return {
    timeRemaining,
    showWarning,
    resetTimer,
  }
}
