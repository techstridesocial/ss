import React from 'react'
import { Users, TrendingUp, Target, Zap } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'

interface AudienceOverlapSectionProps {
  influencer: InfluencerData
}

export const AudienceOverlapSection = ({ influencer }: AudienceOverlapSectionProps) => {
  const overlapData = influencer.audience_overlap || []
  const hasOverlapData = overlapData.length > 0

  if (!hasOverlapData) {
    return (
      <CollapsibleSection title="Audience Overlap">
        <div className="text-gray-500 text-sm italic">
          No audience overlap data available
        </div>
      </CollapsibleSection>
    )
  }

  // Calculate overlap insights
  const totalComparisons = overlapData.length
  const avgOverlap = overlapData.reduce((sum, item) => sum + (item.overlap_percentage || 0), 0) / totalComparisons
  const uniqueAudience = 100 - avgOverlap

  return (
    <CollapsibleSection title="Audience Overlap">
      <div className="space-y-4">
        {/* Overlap Overview */}
        <div className="grid grid-cols-2 gap-4">
          <MetricRow 
            icon={Users} 
            label="Unique Audience" 
            value={`${uniqueAudience.toFixed(1)}%`} 
          />
          <MetricRow 
            icon={Target} 
            label="Avg Overlap" 
            value={`${avgOverlap.toFixed(1)}%`} 
          />
        </div>

        {/* Similar Influencers */}
        {overlapData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Similar Influencers
            </h4>
            <div className="space-y-2">
              {overlapData.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">
                      {item.influencer_name || `Similar Influencer ${index + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${item.overlap_percentage || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 min-w-fit">
                      {(item.overlap_percentage || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uniqueness Score */}
        <div className="mt-4 p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center text-orange-700">
            <Zap className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {uniqueAudience > 80 ? 'Highly unique audience' : 
               uniqueAudience > 60 ? 'Moderately unique audience' : 
               'High audience overlap with competitors'}
            </span>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}