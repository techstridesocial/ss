'use client'

import { Video, Heart, MessageCircle, Share } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'
import { formatNumber, formatPercentage } from '../utils'

interface ReelsSectionProps {
  influencer: InfluencerData
}

export const ReelsSection = ({ influencer }: ReelsSectionProps) => {
  const reelsData = influencer.content_performance?.reels

  if (!reelsData) {
    return null
  }

  return (
    <CollapsibleSection title="Reels">
      <div className="space-y-1">
        {reelsData.avg_plays && (
          <MetricRow
            icon={Video}
            label="Average reel plays"
            value={formatNumber(reelsData.avg_plays)}
          />
        )}
        
        {reelsData.engagement_rate && (
          <MetricRow
            icon={Heart}
            label="Engagement rate"
            value={formatPercentage(reelsData.engagement_rate)}
            trend={influencer.growth_trends?.engagement_growth?.percentage}
          />
        )}
        
        {reelsData.avg_likes && (
          <MetricRow
            icon={Heart}
            label="Average likes"
            value={formatNumber(reelsData.avg_likes)}
          />
        )}
        
        {reelsData.avg_comments && (
          <MetricRow
            icon={MessageCircle}
            label="Average comments"
            value={formatNumber(reelsData.avg_comments)}
          />
        )}
        
        {reelsData.avg_shares && (
          <MetricRow
            icon={Share}
            label="Average shares"
            value={formatNumber(reelsData.avg_shares)}
          />
        )}
      </div>
    </CollapsibleSection>
  )
}