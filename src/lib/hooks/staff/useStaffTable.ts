/**
 * useStaffTable Hook
 * Combines pagination, sorting, and filtering for staff data tables
 */

import { useState, useMemo, useCallback } from 'react'
import { useStaffPagination } from './useStaffPagination'
import { useStaffSorting } from './useStaffSorting'
import { SortConfig, PaginationState } from '@/types/staff'

interface UseStaffTableOptions<T, F> {
  data: T[]
  filterFn: (data: T[], filters: F, searchQuery?: string) => T[]
  initialFilters?: F
  initialPageSize?: number
  initialSort?: SortConfig
  onFiltersChange?: (filters: F) => void
  onPageChange?: (page: number) => void
  onSortChange?: (config: SortConfig) => void
}

interface UseStaffTableReturn<T, F> {
  // Data
  displayedData: T[]
  totalItems: number
  
  // Filtering
  filters: F
  searchQuery: string
  setFilter: (key: keyof F, value: any) => void
  setSearchQuery: (query: string) => void
  clearFilters: () => void
  activeFilterCount: number
  hasActiveFilters: boolean
  
  // Pagination
  currentPage: number
  pageSize: number
  totalPages: number
  startIndex: number
  endIndex: number
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  paginationState: PaginationState
  
  // Sorting
  sortConfig: SortConfig
  handleSort: (key: string) => void
  SortableHeader: React.FC<any>
}

/**
 * Comprehensive hook for managing table state (filtering, sorting, pagination)
 * @param options - Configuration options for the table
 * @returns Complete table state and controls
 */
export function useStaffTable<T, F extends Record<string, any>>(
  options: UseStaffTableOptions<T, F>
): UseStaffTableReturn<T, F> {
  const {
    data,
    filterFn,
    initialFilters = {} as F,
    initialPageSize = 20,
    initialSort = { key: null, direction: 'asc' as const },
    onFiltersChange,
    onPageChange,
    onSortChange
  } = options

  // Filter state
  const [filters, setFilters] = useState<F>(initialFilters)
  const [searchQuery, setSearchQueryState] = useState('')

  // Set a single filter value and reset to page 1
  const setFilter = useCallback((key: keyof F, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      onFiltersChange?.(newFilters)
      return newFilters
    })
  }, [onFiltersChange])

  // Set search query and reset to page 1
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query)
  }, [])

  // Clear all filters and search
  const clearFilters = useCallback(() => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key as keyof F] = '' as any
      return acc
    }, {} as F)
    setFilters(clearedFilters)
    setSearchQueryState('')
    onFiltersChange?.(clearedFilters)
  }, [filters, onFiltersChange])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    const filterCount = Object.values(filters).filter(value => 
      value !== '' && value !== null && value !== undefined && 
      (!Array.isArray(value) || value.length > 0)
    ).length
    return filterCount + (searchQuery ? 1 : 0)
  }, [filters, searchQuery])

  const hasActiveFilters = activeFilterCount > 0

  // Apply filters to data
  const filteredData = useMemo(() => {
    return filterFn(data, filters, searchQuery)
  }, [data, filters, searchQuery, filterFn])

  // Apply sorting
  const { sortedData, sortConfig, handleSort, SortableHeader } = useStaffSorting(filteredData, {
    initialSort,
    onSortChange
  })

  // Apply pagination
  const pagination = useStaffPagination(sortedData, {
    initialPageSize,
    onPageChange
  })

  return {
    // Data
    displayedData: pagination.paginatedData,
    totalItems: sortedData.length,
    
    // Filtering
    filters,
    searchQuery,
    setFilter,
    setSearchQuery,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
    
    // Pagination
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
    startIndex: pagination.startIndex,
    endIndex: pagination.endIndex,
    setCurrentPage: pagination.setCurrentPage,
    setPageSize: pagination.setPageSize,
    goToNextPage: pagination.goToNextPage,
    goToPreviousPage: pagination.goToPreviousPage,
    canGoNext: pagination.canGoNext,
    canGoPrevious: pagination.canGoPrevious,
    paginationState: pagination.paginationState,
    
    // Sorting
    sortConfig,
    handleSort,
    SortableHeader
  }
}

