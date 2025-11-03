/**
 * useStaffPagination Hook
 * Provides pagination functionality for staff tables
 */

import { useState, useMemo } from 'react'
import { PaginationState } from '@/types/staff'

interface UseStaffPaginationOptions {
  initialPageSize?: number
  onPageChange?: (page: number) => void
}

interface UseStaffPaginationReturn<T> {
  currentPage: number
  pageSize: number
  totalPages: number
  startIndex: number
  endIndex: number
  paginatedData: T[]
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  paginationState: PaginationState
}

/**
 * Custom hook for managing pagination state and logic
 * @param data - Array of data to paginate
 * @param options - Pagination configuration options
 * @returns Pagination state and controls
 */
export function useStaffPagination<T>(
  data: T[],
  options: UseStaffPaginationOptions = {}
): UseStaffPaginationReturn<T> {
  const { initialPageSize = 20, onPageChange } = options
  
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Calculate pagination values
  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  // Get paginated data
  const paginatedData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex]
  )

  // Navigation helpers
  const canGoNext = currentPage < totalPages
  const canGoPrevious = currentPage > 1

  // Page change handler with callback
  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
    onPageChange?.(validPage)
  }

  // Page size change handler (resets to page 1)
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    onPageChange?.(1)
  }

  const goToNextPage = () => {
    if (canGoNext) {
      handlePageChange(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (canGoPrevious) {
      handlePageChange(currentPage - 1)
    }
  }

  const paginationState: PaginationState = {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex
  }

  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    paginatedData,
    setCurrentPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious,
    paginationState
  }
}

