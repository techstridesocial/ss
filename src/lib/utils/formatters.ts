/**
 * Centralized Number and Data Formatting Utilities
 * 
 * Provides consistent formatting across the entire application
 */

/**
 * Configuration for number formatting
 */
export interface NumberFormatConfig {
  /** Use commas for thousands separator */
  useCommas: boolean
  /** Use abbreviated format (K, M, B) */
  useAbbreviation: boolean
  /** Number of decimal places for abbreviations */
  decimalPlaces: number
  /** Locale for formatting */
  locale: string
}

/**
 * Default formatting configurations for different contexts
 */
export const FORMAT_PRESETS = {
  /** For large numbers that need full precision (credits, exact counts) */
  PRECISE: {
    useCommas: true,
    useAbbreviation: false,
    decimalPlaces: 0,
    locale: 'en-US'
  },

  /** For display in tables and cards (followers, views) */
  DISPLAY: {
    useCommas: false,
    useAbbreviation: true,
    decimalPlaces: 1,
    locale: 'en-US'
  },

  /** For compact spaces (badges, small widgets) */
  COMPACT: {
    useCommas: false,
    useAbbreviation: true,
    decimalPlaces: 0,
    locale: 'en-US'
  },

  /** For financial/exact values */
  FINANCIAL: {
    useCommas: true,
    useAbbreviation: false,
    decimalPlaces: 2,
    locale: 'en-US'
  }
} as const

/**
 * Core number formatting class
 */
class NumberFormatter {
  /**
   * Format number with commas
   */
  withCommas(num: number, locale: string = 'en-US'): string {
    return Math.round(num).toLocaleString(locale)
  }

  /**
   * Format number with abbreviations (K, M, B, T)
   */
  abbreviated(num: number, decimalPlaces: number = 1): string {
    const absNum = Math.abs(num)
    const sign = num < 0 ? '-' : ''

    if (absNum >= 1e12) {
      return sign + (absNum / 1e12).toFixed(decimalPlaces) + 'T'
    } else if (absNum >= 1e9) {
      return sign + (absNum / 1e9).toFixed(decimalPlaces) + 'B'
    } else if (absNum >= 1e6) {
      return sign + (absNum / 1e6).toFixed(decimalPlaces) + 'M'
    } else if (absNum >= 1e3) {
      return sign + (absNum / 1e3).toFixed(decimalPlaces) + 'K'
    }
    return num.toString()
  }

  /**
   * Smart format - chooses best format based on number size and context
   */
  smart(num: number, config: Partial<NumberFormatConfig> = {}): string {
    const finalConfig = { ...FORMAT_PRESETS.DISPLAY, ...config }

    if (finalConfig.useAbbreviation) {
      return this.abbreviated(num, finalConfig.decimalPlaces)
    } else if (finalConfig.useCommas) {
      return this.withCommas(num, finalConfig.locale)
    }
    
    return num.toString()
  }

  /**
   * Format with specific preset
   */
  withPreset(num: number, preset: keyof typeof FORMAT_PRESETS): string {
    return this.smart(num, FORMAT_PRESETS[preset])
  }

  /**
   * Format percentage
   */
  percentage(value: number, total: number, decimalPlaces: number = 1): string {
    if (total === 0) return '0%'
    const percentage = (value / total) * 100
    return percentage.toFixed(decimalPlaces) + '%'
  }

  /**
   * Format ratio (used/total)
   */
  ratio(used: number, total: number, config: Partial<NumberFormatConfig> = {}): string {
    const finalConfig = { ...FORMAT_PRESETS.DISPLAY, ...config }
    const formatNumber = (n: number) => this.smart(n, finalConfig)
    return `${formatNumber(used)} / ${formatNumber(total)}`
  }

  /**
   * Format currency
   */
  currency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  /**
   * Format duration (seconds to human readable)
   */
  duration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  /**
   * Format date relative to now
   */
  relativeDate(date: Date | string): string {
    const now = new Date()
    const targetDate = typeof date === 'string' ? new Date(date) : date
    const diffMs = now.getTime() - targetDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    
    return `${Math.floor(diffDays / 365)} years ago`
  }

  /**
   * Format file size (bytes to human readable)
   */
  fileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
}

/**
 * Singleton formatter instance
 */
export const formatter = new NumberFormatter()

/**
 * Convenience functions for common formatting needs
 */
export const formatters = {
  // Numbers
  number: (num: number, preset: keyof typeof FORMAT_PRESETS = 'DISPLAY') => 
    formatter.withPreset(num, preset),
  
  precise: (num: number) => formatter.withPreset(num, 'PRECISE'),
  display: (num: number) => formatter.withPreset(num, 'DISPLAY'),
  compact: (num: number) => formatter.withPreset(num, 'COMPACT'),
  
  // Specific contexts
  followers: (num: number) => formatter.withPreset(num, 'DISPLAY'),
  views: (num: number) => formatter.withPreset(num, 'DISPLAY'),
  likes: (num: number) => formatter.withPreset(num, 'DISPLAY'),
  comments: (num: number) => formatter.withPreset(num, 'DISPLAY'),
  credits: (num: number) => formatter.withPreset(num, 'PRECISE'),
  
  // Ratios and percentages
  ratio: (used: number, total: number, precise: boolean = false) =>
    formatter.ratio(used, total, precise ? FORMAT_PRESETS.PRECISE : FORMAT_PRESETS.DISPLAY),
  
  percentage: (value: number, total: number, decimalPlaces: number = 1) =>
    formatter.percentage(value, total, decimalPlaces),
  
  // Other formats
  currency: (amount: number, currency?: string) => formatter.currency(amount, currency),
  duration: (seconds: number) => formatter.duration(seconds),
  date: (date: Date | string) => formatter.relativeDate(date),
  fileSize: (bytes: number) => formatter.fileSize(bytes)
}

/**
 * Legacy compatibility - matches existing formatNumber functions
 */
export const formatNumber = formatters.display
export const formatNumberWithCommas = formatters.precise

/**
 * Export the main formatter for advanced usage
 */
export default formatter
