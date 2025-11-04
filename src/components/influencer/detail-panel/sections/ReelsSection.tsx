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
  const reelsData = influencer.content_performance?.reels as any

  // DEBUG: Check what data we have
  console.log('🎬 ReelsSection Debug:', {
    hasContentPerformance: !!influencer.content_performance,
    contentPerformanceKeys: influencer.content_performance ? Object.keys(influencer.content_performance) : 'none',
    hasReelsData: !!reelsData,
    reelsTotal: (reelsData as any)?.total,
    reelsKeys: reelsData ? Object.keys(reelsData) : 'none'
  })

  if (!reelsData || !(reelsData as any).total || (reelsData as any).total === 0) {
    return (
      <CollapsibleSection title="Reels Performance">
        <div className="text-gray-500 text-sm italic">
          No reels performance data available
        </div>
      </CollapsibleSection>
    )
  }

  // Extract median values from Modash API structure
  const avgViews = reelsData.views?.median?.[0]?.value || reelsData.views?.mean?.[0]?.value
  const avgLikes = reelsData.likes?.median?.[0]?.value || reelsData.likes?.mean?.[0]?.value  
  const avgComments = reelsData.comments?.median?.[0]?.value || reelsData.comments?.mean?.[0]?.value
  
  // Calculate engagement rate if we have the data
  const engagementRate = avgLikes && avgViews ? (avgLikes / avgViews) * 100 : null

  return (
    <CollapsibleSection title="Reels Performance">
      <div className="space-y-1">
        <MetricRow
          icon={Video}
          label="Total reels analyzed"
          value={reelsData.total.toString()}
        />
        
        {avgViews && (
          <MetricRow
            icon={Video}
            label="Average views"
            value={formatNumber(avgViews)}
          />
        )}
        
        {avgLikes && (
          <MetricRow
            icon={Heart}
            label="Average likes"
            value={formatNumber(avgLikes)}
          />
        )}
        
        {avgComments && (
          <MetricRow
            icon={MessageCircle}
            label="Average comments"
            value={formatNumber(avgComments)}
          />
        )}
        
        {engagementRate && (
          <MetricRow
            icon={Heart}
            label="Engagement rate"
            value={formatPercentage(engagementRate / 100)}
          />
        )}
      </div>
    </CollapsibleSection>
  )
}