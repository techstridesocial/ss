/**
 * Reusable Pagination Component
 * Extracted from RosterPagination for use across the application
 */

import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  itemLabel?: string // "quotations", "submissions", "influencers", etc.
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  itemLabel = 'items',
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50]
}: PaginationProps) {
  if (totalItems === 0) return null

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 mt-6">
      {/* Info section */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <span className="text-sm font-medium text-gray-700 text-center sm:text-left">
          {startIndex + 1}-{endIndex} of {totalItems} {itemLabel}
        </span>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden sm:inline">Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 transition-all duration-300"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation section */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">‹</span>
        </button>
        
        {/* Page numbers - show fewer on mobile */}
        <div className="flex gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }
            
            // On mobile, only show current, prev, next
            const showOnMobile = pageNum === currentPage || pageNum === currentPage - 1 || pageNum === currentPage + 1
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-2.5 sm:px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  !showOnMobile ? 'hidden sm:block' : ''
                } ${
                  currentPage === pageNum
                    ? 'bg-black text-white'
                    : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">›</span>
        </button>
      </div>
    </div>
  )
}

export default Pagination
