'use client'

import React from 'react'
import CustomDropdown from './CustomDropdown'

interface EngagementSelectorProps {
  engagement: string
  onEngagementChange: (value: string) => void
}

const ENGAGEMENT_OPTIONS = [
  { value: '', label: 'Any Engagement' },
  { value: 'hidden_likes', label: 'Hidden likes' },
  { value: 'less_than_0.5', label: '≤ 0.5%' },
  { value: 'less_than_1', label: '≤ 1%' },
  { value: '2_average', label: '≤ 2% (average)' },
  { value: '3', label: '≤ 3%' },
  { value: '4', label: '≤ 4%' },
  { value: '5', label: '≤ 5%' },
  { value: '6', label: '≤ 6%' },
  { value: '7', label: '≤ 7%' },
  { value: '8', label: '≤ 8%' },
  { value: '9', label: '≤ 9%' },
  { value: '10', label: '≤ 10%' }
]

const EngagementSelector: React.FC<EngagementSelectorProps> = ({
  engagement,
  onEngagementChange
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Engagement</label>
      <div className="grid grid-cols-1 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Rate</label>
          <CustomDropdown
            value={engagement}
            onChange={onEngagementChange}
            options={ENGAGEMENT_OPTIONS}
            placeholder="Any Engagement"
          />
        </div>
      </div>
    </div>
  )
}

export default EngagementSelector 