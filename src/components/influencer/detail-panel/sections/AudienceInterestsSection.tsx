import React from 'react'
import { Heart, TrendingUp, Users, Sparkles } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'

interface AudienceInterestsSectionProps {
  influencer: InfluencerData
}

export const AudienceInterestsSection = ({ influencer }: AudienceInterestsSectionProps) => {
  // Accept interests from multiple sources (normalized and raw Modash shape)
  const interests = influencer.audience_interests || (influencer.audience?.interests ?? [])
  const hasInterests = interests.length > 0
  


  if (!hasInterests) {
    return (
      <CollapsibleSection title="Audience Interests">
        <div className="text-gray-500 text-sm italic">
          No audience interest data available
        </div>
      </CollapsibleSection>
    )
  }

  // Calculate interest insights
  const totalInterests = interests.length
  const topInterests = interests.slice(0, 10) // Show top 10 interests

  return (
    <CollapsibleSection title="Audience Interests">
      <div className="space-y-4">
        {/* Interests Overview */}
        <div className="grid grid-cols-2 gap-4">
          <MetricRow 
            icon={Heart} 
            label="Interest Categories" 
            value={totalInterests.toString()} 
          />
          <MetricRow 
            icon={Users} 
            label="Audience Type" 
            value={totalInterests > 20 ? "Diverse" : totalInterests > 10 ? "Broad" : "Focused"} 
          />
        </div>

        {/* Top Audience Interests */}
        {topInterests.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Top Audience Interests
            </h4>
            <div className="space-y-2">
              {topInterests.map((interest, index) => {
                // Use real percentage from Modash API
                // interest may be { name, weight } or { name, percentage }
                let percentage = 0
                if (typeof interest !== 'string') {
                  if (typeof interest.percentage === 'number') {
                    percentage = interest.percentage
                  } else if (typeof interest.weight === 'number') {
                    percentage = interest.weight * 100
                  }
                }
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium text-gray-900 capitalize min-w-0 flex-1">
                        {typeof interest === 'string' ? interest : interest.name || 'Unknown'}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-24">
                        <div 
                          className="bg-pink-500 h-2 rounded-full" 
                          style={{ width: `${percentage.toFixed(2)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 min-w-fit">{percentage.toFixed(2)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Audience Interest Insights */}
        <div className="mt-4 p-3 bg-pink-50 rounded-lg">
          <div className="flex items-center text-pink-700">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {totalInterests > 20 ? 'Highly diverse audience interests' : 
               totalInterests > 10 ? 'Well-rounded audience appeal' : 
               'Niche audience with focused interests'}
            </span>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}