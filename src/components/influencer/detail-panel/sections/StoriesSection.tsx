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

  if (!storiesData) {
    return null
  }

  return (
    <CollapsibleSection title="Stories">
      <div className="space-y-1">
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
      </div>
    </CollapsibleSection>
  )
}