/**
 * useStaffFilters Hook
 * Provides filtering functionality for staff tables
 */

import { useState, useMemo, useCallback } from 'react'
import { FilterOptions } from '@/types/staff'

interface UseStaffFiltersOptions<T> {
  initialFilters?: T
  filterOptions?: FilterOptions
  onFiltersChange?: (filters: T) => void
}

interface UseStaffFiltersReturn<T, D> {
  filters: T
  setFilter: (key: keyof T, value: any) => void
  clearFilters: () => void
  activeFilterCount: number
  hasActiveFilters: boolean
  applyFilters: (data: D[]) => D[]
}

/**
 * Generic filter application function
 * Checks if a value matches the filter criteria
 */
function matchesFilter(value: any, filterValue: any): boolean {
  // Empty filter matches everything
  if (filterValue === '' || filterValue === null || filterValue === undefined) {
    return true
  }

  // Array filter (e.g., niches, platforms)
  if (Array.isArray(value)) {
    if (Array.isArray(filterValue)) {
      return filterValue.some(fv => value.includes(fv))
    }
    return value.includes(filterValue)
  }

  // String comparison (case-insensitive)
  if (typeof value === 'string' && typeof filterValue === 'string') {
    return value.toLowerCase().includes(filterValue.toLowerCase())
  }

  // Direct equality
  return value === filterValue
}

/**
 * Custom hook for managing filter state and logic
 * @param data - Array of data to filter
 * @param filterFn - Custom filter function
 * @param options - Filter configuration options
 * @returns Filter state and controls
 */
export function useStaffFilters<T extends Record<string, any>, D = any>(
  filterFn: (data: D[], filters: T) => D[],
  options: UseStaffFiltersOptions<T> = {}
): UseStaffFiltersReturn<T, D> {
  const { initialFilters, onFiltersChange } = options
  
  const [filters, setFilters] = useState<T>(
    initialFilters || ({} as T)
  )

  // Set a single filter value
  const setFilter = useCallback((key: keyof T, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      onFiltersChange?.(newFilters)
      return newFilters
    })
  }, [onFiltersChange])

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key as keyof T] = '' as any
      return acc
    }, {} as T)
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }, [filters, onFiltersChange])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(value => 
      value !== '' && value !== null && value !== undefined && 
      (!Array.isArray(value) || value.length > 0)
    ).length
  }, [filters])

  const hasActiveFilters = activeFilterCount > 0

  // Apply filters using the provided filter function
  const applyFilters = useCallback((data: D[]) => {
    return filterFn(data, filters)
  }, [data, filters, filterFn])

  return {
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
    applyFilters
  }
}

/**
 * Helper functions for common filter range checks
 */
export const filterHelpers = {
  /**
   * Check if a number falls within a follower range
   */
  checkFollowerRange(followers: number, range: string): boolean {
    switch (range) {
      case 'under-10k': return followers < 10000
      case '10k-50k': return followers >= 10000 && followers <= 50000
      case '50k-100k': return followers >= 50000 && followers <= 100000
      case '100k-500k': return followers >= 100000 && followers <= 500000
      case '500k-1m': return followers >= 500000 && followers <= 1000000
      case 'over-1m': return followers > 1000000
      default: return true
    }
  },

  /**
   * Check if an engagement rate falls within a range
   */
  checkEngagementRange(engagement: number, range: string): boolean {
    switch (range) {
      case 'under-2': return engagement < 2.0
      case '2-4': return engagement >= 2.0 && engagement <= 4.0
      case '4-6': return engagement >= 4.0 && engagement <= 6.0
      case 'over-6': return engagement > 6.0
      default: return true
    }
  },

  /**
   * Check if a spend amount falls within a range
   */
  checkSpendRange(spend: number, range: string): boolean {
    switch (range) {
      case 'under-5k': return spend < 5000
      case '5k-15k': return spend >= 5000 && spend <= 15000
      case '15k-25k': return spend >= 15000 && spend <= 25000
      case 'over-25k': return spend > 25000
      default: return true
    }
  },

  /**
   * Check if a campaign count falls within a range
   */
  checkCampaignCount(count: number, range: string): boolean {
    switch (range) {
      case '0': return count === 0
      case '1-2': return count >= 1 && count <= 2
      case '3-5': return count >= 3 && count <= 5
      case 'over-5': return count > 5
      default: return true
    }
  },

  /**
   * Check if last activity date falls within a range
   */
  checkLastActivity(activity: string, range: string): boolean {
    const today = new Date()
    const activityDate = new Date(activity)
    const diffDays = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))
    
    switch (range) {
      case 'today': return diffDays === 0
      case 'week': return diffDays <= 7
      case 'month': return diffDays <= 30
      case 'older': return diffDays > 30
      default: return true
    }
  },

  /**
   * Check if budget range matches
   */
  checkBudgetRange(budgetRange: string, filterRange: string): boolean {
    const extractBudgetValue = (range: string) => {
      const match = range.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)/)
      return match && match[1] ? parseInt(match[1].replace(/,/g, '')) : 0
    }
    
    const budgetValue = extractBudgetValue(budgetRange)
    
    switch (filterRange) {
      case 'under-10k': return budgetValue < 10000
      case '10k-20k': return budgetValue >= 10000 && budgetValue <= 20000
      case 'over-20k': return budgetValue > 20000
      default: return true
    }
  },

  /**
   * Check if influencer count falls within range
   */
  checkInfluencerCount(count: number, range: string): boolean {
    switch (range) {
      case 'under-5': return count < 5
      case '5-10': return count >= 5 && count <= 10
      case 'over-10': return count > 10
      default: return true
    }
  },

  /**
   * Check if duration falls within range
   */
  checkDuration(duration: string, range: string): boolean {
    const weeks = parseInt(duration) || 0
    
    switch (range) {
      case '1-2': return weeks >= 1 && weeks <= 2
      case '3-4': return weeks >= 3 && weeks <= 4
      case 'over-4': return weeks > 4
      default: return true
    }
  }
}

