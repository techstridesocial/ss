/**
 * React Hooks for Credits Management
 * 
 * Provides centralized state management and operations for Modash API credits
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

// Shared state for all credit hooks to prevent multiple API calls
let globalCreditState: any = null
let globalStateSubscribers: Array<(state: any) => void> = []
let globalRefreshInterval: NodeJS.Timeout | null = null
import creditsService, { 
  DEFAULT_CREDIT_CONFIG,
  creditFormatters,
  type CreditConfig,
  type DetailedCreditUsage,
  type CreditAlert
} from '@/lib/services/credits'
import type { CreditHookState, CreditRefreshStatus } from '@/types/credits'

/**
 * Main credits hook - provides complete credit management
 */
export function useCredits(config: Partial<CreditConfig> = {}) {
  // Memoize config to prevent infinite loops
  const finalConfig = useMemo(() => ({ 
    ...DEFAULT_CREDIT_CONFIG, 
    ...config 
  }), [
    config.warningThreshold,
    config.criticalThreshold, 
    config.showDetailed,
    config.refreshInterval
  ])
  
  const [state, setState] = useState<CreditHookState>({
    usage: null,
    refreshStatus: 'idle',
    lastRefresh: null,
    config: finalConfig,
    alerts: []
  })

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const refreshFnRef = useRef<(() => Promise<void>) | null>(null)

  /**
   * Refresh credit usage from API
   */
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, refreshStatus: 'loading' }))

    try {
      const response = await creditsService.fetchCreditUsage()
      
      if (response.success && response.data) {
        const detailedUsage = creditsService.transformToDetailedUsage(response.data)
        const alerts = creditsService.generateAlerts(detailedUsage, finalConfig)

        setState(prev => ({
          ...prev,
          usage: detailedUsage,
          refreshStatus: 'success',
          lastRefresh: new Date(),
          alerts
        }))

        console.log('💳 Credits refreshed:', {
          monthly: `${response.data.used}/${response.data.limit}`,
          percentage: `${response.data.percentage}%`
        })
      } else {
        throw new Error(response.error || 'Failed to fetch credits')
      }
    } catch (error) {
      console.error('❌ Credit refresh failed:', error)
      setState(prev => ({
        ...prev,
        refreshStatus: 'error',
        alerts: [{
          type: 'critical',
          message: 'Failed to load credit usage',
          threshold: 0,
          currentUsage: 0
        }]
      }))
    }
  }, [])

  // Update ref without causing re-renders
  refreshFnRef.current = refresh

  /**
   * Set up automatic refresh interval (singleton to prevent multiple intervals)
   */
  useEffect(() => {
    // Clear any existing local interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }

    // Only create interval if none exists globally
    if (finalConfig.refreshInterval > 0 && !globalRefreshInterval) {
      globalRefreshInterval = setInterval(
        () => {
          if (refreshFnRef.current) {
            refreshFnRef.current()
          }
        },
        finalConfig.refreshInterval * 60 * 1000 // Convert minutes to milliseconds
      )
      refreshIntervalRef.current = globalRefreshInterval
    }

    return () => {
      // Only clear if this instance owns the global interval
      if (refreshIntervalRef.current === globalRefreshInterval) {
        clearInterval(globalRefreshInterval!)
        globalRefreshInterval = null
        refreshIntervalRef.current = null
      }
    }
  }, [finalConfig.refreshInterval])

  /**
   * Initial load - only run once on mount
   */
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run on mount

  /**
   * Update configuration
   */
  const updateConfig = useCallback((newConfig: Partial<CreditConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...newConfig }
    }))
  }, [])

  /**
   * Clear alerts
   */
  const clearAlerts = useCallback(() => {
    setState(prev => ({ ...prev, alerts: [] }))
  }, [])

  /**
   * Check if credits are sufficient for an operation
   */
  const checkSufficientCredits = useCallback((requiredCredits: number): boolean => {
    if (!state.usage) return false
    return state.usage.monthly.remaining >= requiredCredits
  }, [state.usage])

  /**
   * Estimate and check credit cost for operation
   */
  const estimateAndCheck = useCallback((operation: {
    type: 'search' | 'profile_fetch' | 'cache_refresh' | 'bulk_import'
    count: number
  }) => {
    const estimatedCost = creditsService.estimateCreditCost(operation)
    const sufficient = checkSufficientCredits(estimatedCost)
    
    return {
      estimatedCost,
      sufficient,
      remaining: state.usage?.monthly.remaining || 0
    }
  }, [checkSufficientCredits, state.usage])

  return {
    // State
    usage: state.usage,
    refreshStatus: state.refreshStatus,
    lastRefresh: state.lastRefresh,
    config: state.config,
    alerts: state.alerts,
    
    // Actions
    refresh,
    updateConfig,
    clearAlerts,
    checkSufficientCredits,
    estimateAndCheck,
    
    // Computed values
    isLoading: state.refreshStatus === 'loading',
    hasError: state.refreshStatus === 'error',
    hasAlerts: state.alerts.length > 0,
    hasWarnings: state.alerts.some(alert => alert.type === 'warning'),
    hasCriticalAlerts: state.alerts.some(alert => alert.type === 'critical')
  }
}

/**
 * Simplified hook for just displaying credit usage
 */
export function useCreditDisplay(config: Partial<CreditConfig> = {}) {
  const credits = useCredits(config)
  
  return {
    usage: credits.usage,
    isLoading: credits.isLoading,
    refresh: credits.refresh,
    formatters: creditFormatters
  }
}

/**
 * Hook for credit operations (checking before actions)
 */
export function useCreditOperations() {
  const { usage, checkSufficientCredits, estimateAndCheck } = useCredits()
  
  return {
    usage,
    checkSufficientCredits,
    estimateAndCheck,
    logTransaction: creditsService.logTransaction
  }
}
