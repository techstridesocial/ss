'use client'

import { Users, AlertTriangle, TrendingUp, Eye, Target } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'
import { formatNumber, formatPercentage, getMetricValue } from '../utils'

interface OverviewSectionProps {
  influencer: InfluencerData
  currentPlatformData?: any
}

export const OverviewSection = ({ influencer, currentPlatformData }: OverviewSectionProps) => {
  console.log('🔍 OverviewSection received data:', {
    followers: influencer.followers,
    fake_followers_percentage: influencer.fake_followers_percentage,
    fake_followers_quality: influencer.fake_followers_quality,
    currentPlatformData: currentPlatformData
  })

  const followersCount = getMetricValue(
    currentPlatformData?.followers, 
    influencer.followers
  )

  const fakeFollowersPercentage = getMetricValue(
    influencer.fake_followers_percentage, 
    influencer.audience?.fake_followers_percentage
  )

  const engagementRate = getMetricValue(
    influencer.engagement_rate,
    influencer.engagementRate
  )

  const estimatedReach = getMetricValue(
    influencer.estimated_reach
  )

  const estimatedImpressions = getMetricValue(
    influencer.estimated_impressions
  )

  const avgLikes = getMetricValue(
    influencer.avgLikes
  )

  console.log('🔍 Computed overview values:', {
    followersCount,
    fakeFollowersPercentage,
    engagementRate,
    estimatedReach,
    estimatedImpressions,
    avgLikes
  })

  return (
    <CollapsibleSection title="Overview" defaultOpen={true}>
      <div className="space-y-1">
        <MetricRow
          icon={Users}
          label="Followers"
          value={formatNumber(followersCount)}
          trend={influencer.growth_trends?.follower_growth?.percentage}
        />
        
        {(engagementRate !== undefined && engagementRate !== null) && (
          <MetricRow
            icon={TrendingUp}
            label="Engagement Rate"
            value={formatPercentage(engagementRate)}
            trend={influencer.growth_trends?.engagement_growth?.percentage}
          />
        )}

        {(avgLikes !== undefined && avgLikes !== null && avgLikes > 0) && (
          <MetricRow
            icon={Target}
            label="Avg Likes"
            value={formatNumber(avgLikes)}
            trend={influencer.growth_trends?.likes_growth?.percentage}
          />
        )}

        {(estimatedReach !== undefined && estimatedReach !== null && estimatedReach > 0) && (
          <MetricRow
            icon={Eye}
            label="Estimated Reach"
            value={formatNumber(estimatedReach)}
          />
        )}

        {(estimatedImpressions !== undefined && estimatedImpressions !== null && estimatedImpressions > 0) && (
          <MetricRow
            icon={Eye}
            label="Estimated Impressions"
            value={formatNumber(estimatedImpressions)}
          />
        )}
        
        {(fakeFollowersPercentage !== undefined && fakeFollowersPercentage !== null) && (
          <MetricRow
            icon={AlertTriangle}
            label="Fake followers"
            value={`${(fakeFollowersPercentage * 100).toFixed(2)}%`}
            quality={influencer.fake_followers_quality}
          />
        )}
      </div>
    </CollapsibleSection>
  )
}