'use client'

import { Users, Eye } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'
import { formatNumber } from '../utils'

interface StoriesSectionProps {
  influencer: InfluencerData
}

export const StoriesSection = ({ influencer }: StoriesSectionProps) => {
  const storiesData = influencer.content_performance?.stories

  // DEBUG: Always show this section to see what's happening
  console.log('📱 StoriesSection Debug:', {
    hasContentPerformance: !!influencer.content_performance,
    contentPerformanceKeys: influencer.content_performance ? Object.keys(influencer.content_performance) : 'none',
    hasStoriesData: !!storiesData,
    storiesData: storiesData
  })

  // ALWAYS show the section - never return null
  return (
    <CollapsibleSection title="Stories Performance">
      <div className="space-y-2">
        {storiesData ? (
          <>
            {storiesData.estimated_reach && (
              <MetricRow
                icon={Users}
                label="Estimated reach"
                value={formatNumber(storiesData.estimated_reach)}
              />
            )}
            
            {storiesData.estimated_impressions && (
              <MetricRow
                icon={Eye}
                label="Estimated impressions"
                value={formatNumber(storiesData.estimated_impressions)}
              />
            )}
            
            {!storiesData.estimated_reach && !storiesData.estimated_impressions && (
              <div className="text-gray-500 text-sm italic">
                Stories data is available but contains no metrics
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-500 text-sm italic">
            Stories performance data is not available through the current API.
            Only posts and reels data are provided by Modash.
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}