'use client'

import { Heart, MessageCircle, Eye, Users, Share } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'
import { formatNumber, formatPercentage, getMetricValue } from '../utils'

interface AllContentSectionProps {
  influencer: InfluencerData
  currentPlatformData?: any
}

export const AllContentSection = ({ influencer, currentPlatformData }: AllContentSectionProps) => {
  const engagementRate = getMetricValue(
    currentPlatformData?.engagement_rate,
    influencer.engagement_rate || (influencer.engagement as any)?.engagement_rate
  )

  // ❌ REMOVED: These fields are not available in YouTube API
  const estimatedImpressions = null // Not available for YouTube
  const estimatedReach = null // Not available for YouTube

  const avgLikes = getMetricValue(
    influencer.avgLikes,
    influencer.engagement?.avg_likes
  )

  const avgComments = getMetricValue(
    influencer.avgComments,
    influencer.engagement?.avg_comments
  )

  // ❌ REMOVED: avgShares not available in YouTube API 
  const avgShares = null // Not available for YouTube

  // Pull image/picture fallback for header contexts if needed by consumers
  const profileImage = (influencer as any).picture || (influencer as any).profilePicture || (influencer as any).profile_picture

  return (
    <CollapsibleSection title="All content" defaultOpen={true}>
      <div className="space-y-3 md:space-y-2">
        {engagementRate && engagementRate > 0 && (
          <MetricRow
            icon={Heart}
            label="Engagement Rate"
            value={formatPercentage(engagementRate)}
            secondaryValue="above average"
          />
        )}
        
        {estimatedImpressions && estimatedImpressions > 0 && (
          <MetricRow
            icon={Eye}
            label="Estimated impressions"
            value={formatNumber(estimatedImpressions)}
          />
        )}
        
        {estimatedReach && estimatedReach > 0 && (
          <MetricRow
            icon={Users}
            label="Estimated reach"
            value={formatNumber(estimatedReach)}
          />
        )}
        
        {avgLikes && avgLikes > 0 && (
          <MetricRow
            icon={Heart}
            label="Average likes"
            value={formatNumber(avgLikes)}
            trend={influencer.growth_trends?.likes_growth?.percentage}
          />
        )}
        
        {avgComments && avgComments > 0 && (
          <MetricRow
            icon={MessageCircle}
            label="Average comments"
            value={formatNumber(avgComments)}
          />
        )}
        
        {avgShares && avgShares > 0 && (
          <MetricRow
            icon={Share}
            label="Average shares"
            value={formatNumber(avgShares)}
          />
        )}
      </div>
    </CollapsibleSection>
  )
}