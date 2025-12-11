/**
 * Filter panel component for brands and quotations
 */

'use client'

import { motion } from 'framer-motion'
import type { BrandFilters, QuotationFilters, BrandFilterOptions, QuotationFilterOptions, FilterOption } from '@/types/brands'

interface FilterPanelProps {
  isOpen: boolean
  activeTab: 'clients' | 'quotations'
  activeFilters: BrandFilters | QuotationFilters
  activeFilterOptions: BrandFilterOptions | QuotationFilterOptions
  activeFilterCount: number
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void
}

export function FilterPanel({
  isOpen,
  activeTab,
  activeFilters,
  activeFilterOptions,
  activeFilterCount,
  onFilterChange,
  onClearFilters
}: FilterPanelProps) {
  if (!isOpen) return null

  const getDisplayKey = (key: string): string => {
    switch (key) {
      case 'spendRange': return 'Spend Range'
      case 'campaignCount': return 'Campaigns'
      case 'lastActivity': return 'Activity'
      case 'budgetRange': return 'Budget'
      case 'influencerCount': return 'Influencers'
      default: return key.charAt(0).toUpperCase() + key.slice(1)
    }
  }

  const getLabelText = (key: string): string => {
    switch (key) {
      case 'spendRange': return 'Spend Range'
      case 'campaignCount': return 'Campaigns'
      case 'lastActivity': return 'Last Activity'
      case 'budgetRange': return 'Budget Range'
      case 'influencerCount': return 'Influencers'
      default: return key
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100/80 mb-4 overflow-hidden"
    >
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
              {Object.entries(activeFilters).map(([key, value]) => {
                if (!value) return null
                const options = activeFilterOptions[key as keyof typeof activeFilterOptions] as FilterOption[] | undefined
                const option = options?.find(opt => opt.value === value)
                const displayKey = getDisplayKey(key)
                
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(activeFilterOptions).map(([key, options]) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-gray-700 capitalize">
                {getLabelText(key)}
              </label>
              <select
                value={activeFilters[key as keyof typeof activeFilters] as string}
                onChange={(e) => onFilterChange(key, e.target.value)}
                className="w-full px-3 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-xs"
              >
                {(options as FilterOption[]).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
