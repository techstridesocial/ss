/**
 * Sortable table header component
 */

'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'
import type { SortConfig } from '@/types/brands'

interface SortableHeaderProps {
  children: React.ReactNode
  sortKey: string
  sortConfig: SortConfig
  onSort: (key: string) => void
  className?: string
}

export function SortableHeader({ 
  children, 
  sortKey, 
  sortConfig,
  onSort,
  className = "" 
}: SortableHeaderProps) {
  const isActive = sortConfig.key === sortKey
  const direction = sortConfig.direction
  
  return (
    <th 
      className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/40 transition-colors ${className}`}
      onClick={() => onSort(sortKey)}
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

