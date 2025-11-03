/**
 * Roster Empty State Component
 */

import React from 'react'
import { Users } from 'lucide-react'

interface RosterEmptyStateProps {
  searchQuery: string
  hasActiveFilters: boolean
  activeTab: string
  onAddClick: () => void
}

export function RosterEmptyState({
  searchQuery,
  hasActiveFilters,
  activeTab,
  onAddClick
}: RosterEmptyStateProps) {
  return (
    <div className="px-6 py-12 text-center">
      <Users size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No influencers found</h3>
      <p className="text-gray-500 mb-4">
        {searchQuery || hasActiveFilters
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : `No ${activeTab.toLowerCase()} influencers available.`
        }
      </p>
      {!searchQuery && !hasActiveFilters && (
        <button
          onClick={onAddClick}
          className="inline-flex items-center px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg"
        >
          <Users size={16} className="mr-2" />
          Add Your First Influencer
        </button>
      )}
    </div>
  )
}

