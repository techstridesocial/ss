/**
 * Roster Filter Panel Component
 */

import React from 'react'
import { rosterFilterOptions } from './RosterFilterOptions'
import { RosterFilters } from '@/types/staff'

interface RosterFilterPanelProps {
  filters: RosterFilters
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void
  isOpen: boolean
}

export function RosterFilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  isOpen
}: RosterFilterPanelProps) {
  if (!isOpen) return null

  const activeFilterCount = Object.values(filters).filter(value => value !== '').length

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/40 mb-4 animate-in slide-in-from-top-2 duration-300">
      <div className="p-4">
        {/* Active Filters Chips */}
        {activeFilterCount > 0 && (
          <div className="mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Active Filters</h4>
              <button
                onClick={onClearFilters}
                className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null
                const option = rosterFilterOptions[key as keyof typeof rosterFilterOptions]?.find((opt) => opt.value === value)
                const displayKey = key === 'contentType' ? 'Content Type' 
                                 : key === 'influencerType' ? 'Influencer Type'
                                 : key === 'followerRange' ? 'Followers'
                                 : key === 'engagementRange' ? 'Engagement'
                                 : key.charAt(0).toUpperCase() + key.slice(1)
        
                return (
                  <div key={key} className="flex items-center bg-black text-white px-2.5 py-1 rounded-full text-xs font-medium">
                    <span className="mr-1.5">{displayKey}: {option?.label || value}</span>
                    <button
                      onClick={() => onFilterChange(key, '')}
                      className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Filter Grid */}
        <div className="space-y-4">
          {/* Primary Filters Row */}
          <div>
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Primary Filters</h4>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Niche</label>
                <select
                  value={filters.niche}
                  onChange={(e) => onFilterChange('niche', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                >
                  {rosterFilterOptions.niche.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Platform</label>
                <select
                  value={filters.platform}
                  onChange={(e) => onFilterChange('platform', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                >
                  {rosterFilterOptions.platform.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Influencer Type</label>
                <select
                  value={filters.influencerType}
                  onChange={(e) => onFilterChange('influencerType', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                >
                  {rosterFilterOptions.influencerType.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Content Type</label>
                <select
                  value={filters.contentType}
                  onChange={(e) => onFilterChange('contentType', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                >
                  {rosterFilterOptions.contentType.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Tier</label>
                <select
                  value={filters.tier}
                  onChange={(e) => onFilterChange('tier', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                >
                  {rosterFilterOptions.tier.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Secondary Filters Row */}
          <div>
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Advanced Filters</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Followers</label>
                <select
                  value={filters.followerRange}
                  onChange={(e) => onFilterChange('followerRange', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                >
                  {rosterFilterOptions.followerRange.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Engagement Rate</label>
                <select
                  value={filters.engagementRange}
                  onChange={(e) => onFilterChange('engagementRange', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                >
                  {rosterFilterOptions.engagementRange.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => onFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                >
                  {rosterFilterOptions.location.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
                >
                  {rosterFilterOptions.status.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

