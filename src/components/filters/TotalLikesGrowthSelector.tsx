'use client'

import React from 'react'
import CustomDropdown from './CustomDropdown'

interface TotalLikesGrowthSelectorProps {
  growthPercentage: string
  growthPeriod: string
  onGrowthPercentageChange: (value: string) => void
  onGrowthPeriodChange: (value: string) => void
}

const GROWTH_PERIODS = [
  '1 month',
  '2 months', 
  '3 months',
  '4 months',
  '5 months',
  '6 months'
]

const GROWTH_PERCENTAGES = [
  '10%',
  '20%',
  '30%',
  '40%',
  '50%',
  '100%',
  '150%',
  '300%',
  '400%'
]

const TotalLikesGrowthSelector: React.FC<TotalLikesGrowthSelectorProps> = ({
  growthPercentage,
  growthPeriod,
  onGrowthPercentageChange,
  onGrowthPeriodChange
}) => {
  // Convert arrays to dropdown format
  const percentageOptions = [
    { value: '', label: 'Any %' },
    ...GROWTH_PERCENTAGES.map(percentage => ({ value: percentage, label: percentage }))
  ]

  const periodOptions = [
    { value: '', label: 'Any period' },
    ...GROWTH_PERIODS.map(period => ({ value: period, label: period }))
  ]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Total Likes Growth</label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Growth (%)</label>
          <CustomDropdown
            value={growthPercentage}
            onChange={onGrowthPercentageChange}
            options={percentageOptions}
            placeholder="Any %"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Period</label>
          <CustomDropdown
            value={growthPeriod}
            onChange={onGrowthPeriodChange}
            options={periodOptions}
            placeholder="Any period"
          />
        </div>
      </div>
    </div>
  )
}

export default TotalLikesGrowthSelector 