/**
 * useStaffSorting Hook
 * Provides sorting functionality for staff tables
 */

import { useState, useMemo } from 'react'
import { SortConfig } from '@/types/staff'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface UseStaffSortingOptions {
  initialSort?: SortConfig
  onSortChange?: (config: SortConfig) => void
}

interface UseStaffSortingReturn<T> {
  sortedData: T[]
  sortConfig: SortConfig
  handleSort: (key: string) => void
  SortableHeader: React.FC<SortableHeaderProps>
}

interface SortableHeaderProps {
  children: React.ReactNode
  sortKey: string
  className?: string
}

/**
 * Generic comparison function for sorting different data types
 */
function compareValues(a: any, b: any, key: string): number {
  let aValue = a
  let bValue = b

  // Handle nested properties
  if (key.includes('.')) {
    const keys = key.split('.')
    aValue = keys.reduce((obj, k) => obj?.[k], a)
    bValue = keys.reduce((obj, k) => obj?.[k], b)
  }

  // Handle null/undefined
  if (aValue == null && bValue == null) return 0
  if (aValue == null) return 1
  if (bValue == null) return -1

  // Handle dates
  if (aValue instanceof Date || bValue instanceof Date ||
      (typeof aValue === 'string' && typeof bValue === 'string' && 
       (aValue.match(/^\d{4}-\d{2}-\d{2}/) || bValue.match(/^\d{4}-\d{2}-\d{2}/)))) {
    const dateA = new Date(aValue).getTime()
    const dateB = new Date(bValue).getTime()
    return dateA - dateB
  }

  // Handle numbers
  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return aValue - bValue
  }

  // Handle strings
  const strA = String(aValue).toLowerCase()
  const strB = String(bValue).toLowerCase()
  
  if (strA < strB) return -1
  if (strA > strB) return 1
  return 0
}

/**
 * Custom hook for managing table sorting
 * @param data - Array of data to sort
 * @param options - Sorting configuration options
 * @returns Sorted data and sorting controls
 */
export function useStaffSorting<T>(
  data: T[],
  options: UseStaffSortingOptions = {}
): UseStaffSortingReturn<T> {
  const { initialSort = { key: null, direction: 'asc' }, onSortChange } = options
  
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort)

  // Sort data based on config
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const comparison = compareValues(a, b, sortConfig.key!)
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [data, sortConfig])

  // Toggle sort direction or set new sort key
  const handleSort = (key: string) => {
    const newConfig: SortConfig = {
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    }
    setSortConfig(newConfig)
    onSortChange?.(newConfig)
  }

  // Sortable Header Component
  const SortableHeader: React.FC<SortableHeaderProps> = ({ 
    children, 
    sortKey, 
    className = "" 
  }) => {
    const isActive = sortConfig.key === sortKey
    const direction = sortConfig.direction
    
    return (
      <th 
        className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/40 transition-colors select-none ${className}`}
        onClick={() => handleSort(sortKey)}
      >
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          <div className="flex flex-col">
            <ChevronUp 
              size={12} 
              className={`${isActive && direction === 'asc' ? 'text-black' : 'text-gray-300'} transition-colors`} 
            />
            <ChevronDown 
              size={12} 
              className={`${isActive && direction === 'desc' ? 'text-black' : 'text-gray-300'} transition-colors -mt-1`} 
            />
          </div>
        </div>
      </th>
    )
  }

  return {
    sortedData,
    sortConfig,
    handleSort,
    SortableHeader
  }
}

