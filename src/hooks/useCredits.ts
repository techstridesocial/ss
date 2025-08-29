/**
 * React Hooks for Credits Management
 * 
 * Provides centralized state management and operations for Modash API credits
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

// The credits service now handles global state internally
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
  // Simplified config without auto-refresh
  const finalConfig = useMemo(() => ({ 
    ...DEFAULT_CREDIT_CONFIG, 
    ...config,
    refreshInterval: 0 // Disable automatic refresh
  }), [
    config.warningThreshold,
    config.criticalThreshold, 
    config.showDetailed
  ])
  
  const [state, setState] = useState<CreditHookState>({
    usage: null,
    refreshStatus: 'idle',
    lastRefresh: null,
    config: finalConfig,
    alerts: []
  })

  const unsubscribeRef = useRef<(() => void) | null>(null)

  /**
   * Handle global state changes from credits service
   */
  const handleGlobalStateChange = useCallback((globalState: any) => {
    console.log('📡 Credits hook received global state update')
    
    setState(prev => {
      const newState: CreditHookState = {
        ...prev,
        usage: globalState.data,
        refreshStatus: globalState.isLoading ? 'loading' : 
                     globalState.error ? 'error' : 
                     globalState.data ? 'success' : 'idle',
        lastRefresh: globalState.lastFetch,
        alerts: globalState.data && globalState.error === null 
          ? creditsService.generateAlerts(globalState.data, finalConfig)
          : globalState.error 
            ? [{
                type: 'critical' as const,
                message: globalState.error,
                threshold: 0,
                currentUsage: 0
              }]
            : []
      }
      return newState
    })
  }, [finalConfig])

  /**
   * Manual refresh function (forces new API call)
   */
  const refresh = useCallback(async () => {
    console.log('🔄 Manual credit refresh requested')
    await creditsService.fetchCreditUsage(true) // Force refresh
  }, [])

  /**
   * Subscribe to global credits state on mount
   */
  useEffect(() => {
    console.log('🔌 Credits hook subscribing to global state')
    
    // Subscribe to global state changes
    unsubscribeRef.current = creditsService.subscribe(handleGlobalStateChange)
    
    // Initialize with current global state
    const currentState = creditsService.getGlobalState()
    handleGlobalStateChange(currentState)
    
    // If no data exists, trigger initial fetch
    if (!currentState.data && !currentState.isLoading) {
      console.log('🚀 No cached data, triggering initial fetch')
      creditsService.fetchCreditUsage()
    }

    return () => {
      console.log('🔌 Credits hook unsubscribing from global state')
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [handleGlobalStateChange])

  // No automatic refresh - manual only for simplicity

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
