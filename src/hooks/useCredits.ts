/**
 * React Hooks for Credits Management
 * 
 * Provides centralized state management and operations for Modash API credits
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import creditsService, { 
  DEFAULT_CREDIT_CONFIG,
  type CreditConfig,
  type DetailedCreditUsage,
  type CreditAlert,
  type CreditRefreshStatus
} from '@/lib/services/credits'
import type { CreditHookState } from '@/types/credits'

/**
 * Main credits hook - provides complete credit management
 */
export function useCredits(config: Partial<CreditConfig> = {}) {
  const finalConfig = { ...DEFAULT_CREDIT_CONFIG, ...config }
  
  const [state, setState] = useState<CreditHookState>({
    usage: null,
    refreshStatus: 'idle',
    lastRefresh: null,
    config: finalConfig,
    alerts: []
  })

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
  }, [finalConfig])

  /**
   * Set up automatic refresh interval
   */
  useEffect(() => {
    if (finalConfig.refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(
        refresh, 
        finalConfig.refreshInterval * 60 * 1000 // Convert minutes to milliseconds
      )

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
      }
    }
  }, [refresh, finalConfig.refreshInterval])

  /**
   * Initial load
   */
  useEffect(() => {
    refresh()
  }, [refresh])

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
    formatters: creditsService.creditFormatters
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
