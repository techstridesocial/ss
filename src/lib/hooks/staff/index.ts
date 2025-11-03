/**
 * Staff Hooks Index
 * Central export point for all staff-related hooks
 */

export { useStaffPagination } from './useStaffPagination'
export { useStaffSorting } from './useStaffSorting'
export { useStaffFilters, filterHelpers } from './useStaffFilters'
export { useStaffTable } from './useStaffTable'

// Re-export types for convenience
export type {
  PaginationState,
  SortConfig,
  FilterOptions
} from '@/types/staff'

