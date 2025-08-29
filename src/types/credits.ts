/**
 * Centralized types for Modash API Credits system
 */

export interface CreditUsage {
  /** Current credits used this period */
  used: number
  /** Maximum credits available this period */
  limit: number
  /** Remaining credits (limit - used) */
  remaining: number
  /** When the current period resets */
  resetDate: string | Date
  /** Percentage of credits used (0-100) */
  percentage: number
}

export interface CreditPeriod {
  /** Period type */
  type: 'monthly' | 'yearly' | 'daily'
  /** Credits used in this period */
  used: number
  /** Credit limit for this period */
  limit: number
  /** Remaining credits */
  remaining: number
  /** When this period started */
  startDate: string | Date
  /** When this period ends/resets */
  endDate: string | Date
}

export interface DetailedCreditUsage {
  /** Monthly credit usage */
  monthly: CreditPeriod
  /** Yearly credit usage */
  yearly: CreditPeriod
  /** Any rollover credits from previous periods */
  rollover: number
  /** Last time credit data was updated */
  lastUpdated: string | Date
}

export interface CreditTransaction {
  /** Unique transaction ID */
  id: string
  /** Number of credits consumed */
  amount: number
  /** What the credits were used for */
  purpose: 'search' | 'profile_fetch' | 'cache_refresh' | 'bulk_import'
  /** When the transaction occurred */
  timestamp: string | Date
  /** Additional context about the usage */
  details?: {
    influencerCount?: number
    platform?: string
    queryType?: string
  }
}

export interface CreditAlert {
  /** Alert type */
  type: 'warning' | 'critical' | 'info'
  /** Alert message */
  message: string
  /** Threshold that triggered the alert */
  threshold: number
  /** Current usage percentage */
  currentUsage: number
}

export interface CreditConfig {
  /** Warning threshold percentage (0-100) */
  warningThreshold: number
  /** Critical threshold percentage (0-100) */
  criticalThreshold: number
  /** Whether to show detailed credit breakdown */
  showDetailed: boolean
  /** Refresh interval in minutes */
  refreshInterval: number
}

export interface CreditDisplayFormat {
  /** Whether to show commas in numbers */
  useCommas: boolean
  /** Whether to abbreviate large numbers (1K, 1M) */
  abbreviateNumbers: boolean
  /** Whether to show percentage alongside numbers */
  showPercentage: boolean
  /** Whether to show remaining credits */
  showRemaining: boolean
}

/**
 * Credit service response types
 */
export interface CreditServiceResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export type CreditRefreshStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Hook state for credits
 */
export interface CreditHookState {
  usage: DetailedCreditUsage | null
  refreshStatus: CreditRefreshStatus
  lastRefresh: Date | null
  config: CreditConfig
  alerts: CreditAlert[]
}
