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
  refreshInterval: 5, // 5 minutes
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
 * Core credits service class
 */
class CreditsService {
  private baseUrl: string

  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  }

  /**
   * Fetch current credit usage from API
   */
  async fetchCreditUsage(): Promise<CreditServiceResponse<CreditUsage>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/discovery/credits`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
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
}

// Singleton instance
export const creditsService = new CreditsService()

/**
 * Export utilities for external use
 */
export { creditsService as default }
export type { CreditUsage, DetailedCreditUsage, CreditAlert, CreditConfig } from '@/types/credits'
