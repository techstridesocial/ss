/**
 * Centralized Credits Service
 * 
 * Handles all credit-related operations, data fetching, and state management
 */

import { 
  CreditUsage, 
  CreditPeriod, 
  DetailedCreditUsage, 
  CreditTransaction, 
  CreditAlert, 
  CreditConfig,
  CreditServiceResponse
} from '@/types/credits'

/**
 * Default credit configuration
 */
export const DEFAULT_CREDIT_CONFIG: CreditConfig = {
  warningThreshold: 80, // 80% usage triggers warning
  criticalThreshold: 95, // 95% usage triggers critical alert
  showDetailed: true,
  refreshInterval: 0, // No automatic refresh - manual only
}

/**
 * Credit formatting utilities
 */
export const creditFormatters = {
  /**
   * Format number with commas (1,234)
   */
  withCommas: (num: number): string => {
    return Math.round(num).toLocaleString()
  },

  /**
   * Format number with abbreviations (1.2K, 1.5M)
   */
  abbreviated: (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  },

  /**
   * Format percentage with one decimal place
   */
  percentage: (value: number, total: number): string => {
    if (total === 0) return '0.0%'
    return ((value / total) * 100).toFixed(1) + '%'
  },

  /**
   * Format credit ratio (used/limit)
   */
  ratio: (used: number, limit: number, useCommas: boolean = true): string => {
    const formatter = useCommas ? creditFormatters.withCommas : creditFormatters.abbreviated
    return `${formatter(used)} / ${formatter(limit)}`
  },

  /**
   * Format remaining credits
   */
  remaining: (remaining: number, useCommas: boolean = true): string => {
    const formatter = useCommas ? creditFormatters.withCommas : creditFormatters.abbreviated
    return `${formatter(remaining)} remaining`
  }
}

/**
 * Global state management for credits to prevent multiple API calls
 */
interface GlobalCreditState {
  data: DetailedCreditUsage | null
  isLoading: boolean
  lastFetch: Date | null
  error: string | null
  activePromise: Promise<CreditServiceResponse<CreditUsage>> | null
  subscribers: Set<(state: GlobalCreditState) => void>
}

/**
 * Core credits service class with singleton pattern
 */
class CreditsService {
  private baseUrl: string
  private globalState: GlobalCreditState

  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    this.globalState = {
      data: null,
      isLoading: false,
      lastFetch: null,
      error: null,
      activePromise: null,
      subscribers: new Set()
    }
  }

  /**
   * Subscribe to global credit state changes
   */
  subscribe(callback: (state: GlobalCreditState) => void): () => void {
    this.globalState.subscribers.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.globalState.subscribers.delete(callback)
    }
  }

  /**
   * Notify all subscribers of state changes
   */
  private notifySubscribers() {
    this.globalState.subscribers.forEach(callback => {
      try {
        callback(this.globalState)
      } catch (error) {
        console.error('Credit subscriber error:', error)
      }
    })
  }

  /**
   * Update global state and notify subscribers
   */
  private updateGlobalState(updates: Partial<GlobalCreditState>) {
    this.globalState = { ...this.globalState, ...updates }
    this.notifySubscribers()
  }

  /**
   * Get current global state (for immediate access)
   */
  getGlobalState(): GlobalCreditState {
    return { ...this.globalState }
  }

  /**
   * Check if data is fresh (within 2 minutes for better UX)
   */
  private isDataFresh(): boolean {
    if (!this.globalState.lastFetch || !this.globalState.data) return false
    const twoMinutesAgo = Date.now() - (2 * 60 * 1000)
    return this.globalState.lastFetch.getTime() > twoMinutesAgo
  }

  /**
   * Fetch current credit usage with deduplication and caching
   */
  async fetchCreditUsage(forceRefresh: boolean = false): Promise<CreditServiceResponse<CreditUsage>> {
    console.log('🔄 Credit fetch requested, force:', forceRefresh)
    
    // Return cached data if fresh and not forcing refresh
    if (!forceRefresh && this.isDataFresh() && this.globalState.data) {
      console.log('📋 Using cached credit data')
      return {
        success: true,
        data: this.transformDetailedToBasic(this.globalState.data),
        timestamp: new Date().toISOString()
      }
    }

    // If there's already an active request, wait for it
    if (this.globalState.activePromise) {
      console.log('⏳ Waiting for existing credit request')
      return await this.globalState.activePromise
    }

    // Start new request
    console.log('🚀 Starting new credit API request')
    this.updateGlobalState({ isLoading: true, error: null })

    const promise = this.performFetch()
    this.updateGlobalState({ activePromise: promise })

    try {
      const _result = await promise
      
      if (result.success && result.data) {
        const detailedUsage = this.transformToDetailedUsage(result.data)
        this.updateGlobalState({
          data: detailedUsage,
          isLoading: false,
          lastFetch: new Date(),
          error: null,
          activePromise: null
        })
      } else {
        this.updateGlobalState({
          isLoading: false,
          error: result.error || 'Failed to fetch credits',
          activePromise: null
        })
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.updateGlobalState({
        isLoading: false,
        error: errorMessage,
        activePromise: null
      })
      
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Perform the actual API fetch (private)
   */
  private async performFetch(): Promise<CreditServiceResponse<CreditUsage>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/discovery/credits`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const _result = await response.json()
      
      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('❌ Failed to fetch credit usage:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Transform detailed usage back to basic format (for compatibility)
   */
  private transformDetailedToBasic(detailed: DetailedCreditUsage): CreditUsage {
    return {
      used: detailed.monthly.used,
      limit: detailed.monthly.limit,
      remaining: detailed.monthly.remaining,
      resetDate: detailed.monthly.endDate,
      percentage: Math.round((detailed.monthly.used / detailed.monthly.limit) * 100)
    }
  }

  /**
   * Transform basic credit usage into detailed usage structure
   */
  transformToDetailedUsage(basicUsage: CreditUsage): DetailedCreditUsage {
    const monthly: CreditPeriod = {
      type: 'monthly',
      used: basicUsage.used,
      limit: basicUsage.limit,
      remaining: basicUsage.remaining,
      startDate: new Date(), // Would be calculated based on resetDate
      endDate: basicUsage.resetDate
    }

    const yearly: CreditPeriod = {
      type: 'yearly',
      used: basicUsage.used, // In production, this would be separate
      limit: basicUsage.limit * 12, // Assuming monthly limit * 12
      remaining: (basicUsage.limit * 12) - basicUsage.used,
      startDate: new Date(new Date().getFullYear(), 0, 1), // Start of year
      endDate: new Date(new Date().getFullYear() + 1, 0, 1) // Start of next year
    }

    return {
      monthly,
      yearly,
      rollover: 0, // Would be fetched from API in production
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Generate alerts based on credit usage
   */
  generateAlerts(usage: DetailedCreditUsage, config: CreditConfig): CreditAlert[] {
    const alerts: CreditAlert[] = []
    const monthlyPercentage = (usage.monthly.used / usage.monthly.limit) * 100

    if (monthlyPercentage >= config.criticalThreshold) {
      alerts.push({
        type: 'critical',
        message: `Critical: ${monthlyPercentage.toFixed(1)}% of monthly credits used`,
        threshold: config.criticalThreshold,
        currentUsage: monthlyPercentage
      })
    } else if (monthlyPercentage >= config.warningThreshold) {
      alerts.push({
        type: 'warning',
        message: `Warning: ${monthlyPercentage.toFixed(1)}% of monthly credits used`,
        threshold: config.warningThreshold,
        currentUsage: monthlyPercentage
      })
    }

    return alerts
  }

  /**
   * Log a credit transaction (for tracking usage)
   */
  async logTransaction(transaction: Omit<CreditTransaction, 'id' | 'timestamp'>): Promise<void> {
    // In production, this would send to an analytics endpoint
    console.log('💳 Credit transaction:', {
      ...transaction,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Estimate credit cost for an operation
   */
  estimateCreditCost(operation: {
    type: 'search' | 'profile_fetch' | 'cache_refresh' | 'bulk_import'
    count: number
  }): number {
    const costs = {
      search: 0.01, // 0.01 credits per result
      profile_fetch: 1, // 1 credit per profile
      cache_refresh: 1, // 1 credit per profile refresh
      bulk_import: 1 // 1 credit per profile imported
    }

    return Math.ceil(operation.count * costs[operation.type])
  }

  /**
   * Refresh credits after an action that consumed credits
   */
  async refreshAfterAction(actionType: string): Promise<void> {
    console.log(`🔄 Refreshing credits after ${actionType}`)
    await this.fetchCreditUsage(true) // Force refresh
  }
}

// Singleton instance
export const creditsService = new CreditsService()

/**
 * Export utilities for external use
 */
export { creditsService as default }
export type { CreditUsage, DetailedCreditUsage, CreditAlert, CreditConfig } from '@/types/credits'
