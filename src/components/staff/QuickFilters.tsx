'use client'

import React from 'react'
import { User, Building2, Megaphone } from 'lucide-react'
import { useCurrentUserId } from '@/lib/auth/current-user'

interface QuickFiltersProps {
  onFilterChange: (filterType: 'my_brands' | 'my_creators' | 'my_campaigns' | 'all') => void
  activeFilter: string
  counts?: {
    myBrands?: number
    myCreators?: number
    myCampaigns?: number
    total?: number
  }
  showBrands?: boolean
  showCreators?: boolean
  showCampaigns?: boolean
}

export default function QuickFilters({
  onFilterChange,
  activeFilter,
  counts = {},
  showBrands = true,
  showCreators = true,
  showCampaigns = true
}: QuickFiltersProps) {
  const currentUserId = useCurrentUserId()

  // Don't show if user ID is not loaded yet
  if (!currentUserId) {
    return null
  }

  const filters = [
    {
      key: 'all',
      label: 'All Items',
      icon: null,
      count: counts.total,
      color: 'gray'
    },
    ...(showBrands ? [{
      key: 'my_brands',
      label: 'My Brands',
      icon: Building2,
      count: counts.myBrands,
      color: 'blue'
    }] : []),
    ...(showCreators ? [{
      key: 'my_creators',
      label: 'My Creators',
      icon: User,
      count: counts.myCreators,
      color: 'green'
    }] : []),
    ...(showCampaigns ? [{
      key: 'my_campaigns',
      label: 'My Campaigns',
      icon: Megaphone,
      count: counts.myCampaigns,
      color: 'purple'
    }] : [])
  ]

  const getButtonStyles = (filter: any) => {
    const isActive = activeFilter === filter.key
    const baseStyles = 'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200'
    
    if (isActive) {
      return `${baseStyles} bg-white text-gray-900 shadow-sm border border-gray-200`
    }
    
    switch (filter.color) {
      case 'blue':
        return `${baseStyles} text-blue-600 hover:text-blue-700 hover:bg-blue-50`
      case 'green':
        return `${baseStyles} text-green-600 hover:text-green-700 hover:bg-green-50`
      case 'purple':
        return `${baseStyles} text-purple-600 hover:text-purple-700 hover:bg-purple-50`
      default:
        return `${baseStyles} text-gray-600 hover:text-gray-900 hover:bg-gray-50`
    }
  }

  return (
    <div className="bg-gray-50 rounded-xl p-3 mb-6">
      <div className="flex flex-wrap gap-2">
        {filters.map(filter => {
          const Icon = filter.icon
          return (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key as any)}
              className={getButtonStyles(filter)}
            >
              {Icon && <Icon size={16} />}
              <span>{filter.label}</span>
              {typeof filter.count === 'number' && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  activeFilter === filter.key
                    ? 'bg-gray-100 text-gray-700'
                    : filter.color === 'blue'
                    ? 'bg-blue-100 text-blue-700'
                    : filter.color === 'green'
                    ? 'bg-green-100 text-green-700'
                    : filter.color === 'purple'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {filter.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
