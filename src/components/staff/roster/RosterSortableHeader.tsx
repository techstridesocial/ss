/**
 * Sortable Header Component for Roster Table
 */

import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface SortableHeaderProps {
  children: React.ReactNode
  sortKey: string
  className?: string
  sortConfig: {
    key: string | null
    direction: 'asc' | 'desc'
  }
  onSort: (key: string) => void
}

export function RosterSortableHeader({ 
  children, 
  sortKey, 
  className = "",
  sortConfig,
  onSort
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

