'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { formatNumber, formatPercentage, getMetricValue } from '../utils'

interface PremiumOverviewSectionProps {
  influencer: InfluencerData
  currentPlatformData?: any
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
}

export const PremiumOverviewSection = ({ 
  influencer, 
  currentPlatformData, 
  selectedPlatform 
}: PremiumOverviewSectionProps) => {

  // Get platform-specific or fallback values
  const followersCount = getMetricValue(
    currentPlatformData?.followers, 
    influencer.followers
  )

  const engagementRate = getMetricValue(
    currentPlatformData?.engagement_rate || currentPlatformData?.engagementRate,
    influencer.engagement_rate || influencer.engagementRate
  )

  const avgLikes = getMetricValue(
    currentPlatformData?.avgLikes,
    influencer.avgLikes
  )

  const avgComments = getMetricValue(
    currentPlatformData?.avgComments,
    influencer.avgComments
  )

  const fakeFollowersPercentage = selectedPlatform !== 'youtube' ? getMetricValue(
    influencer.fake_followers_percentage, 
    influencer.audience?.fake_followers_percentage
  ) : null

  const credibility = getMetricValue(
    currentPlatformData?.credibility,
    influencer.credibility || influencer.audience?.credibility
  )

  // Build metrics array for grid display
  const performanceMetrics = [
    {
      label: 'Followers',
      value: followersCount ? formatNumber(followersCount) : 'N/A',
      trend: currentPlatformData?.followerGrowth
    },
    {
      label: 'Engagement Rate',
      value: engagementRate ? formatPercentage(engagementRate) : 'N/A',
      quality: engagementRate ? (engagementRate > 0.05 ? 'high' : engagementRate > 0.02 ? 'medium' : 'low') : undefined
    },
    {
      label: 'Avg Likes',
      value: avgLikes ? formatNumber(avgLikes) : 'N/A'
    },
    {
      label: 'Avg Comments', 
      value: avgComments ? formatNumber(avgComments) : 'N/A'
    }
  ].filter(metric => metric.value !== 'N/A') // Only show available metrics

  const audienceMetrics = []
  
  if (fakeFollowersPercentage !== null && fakeFollowersPercentage !== undefined) {
    audienceMetrics.push({
      label: 'Authentic Followers',
      value: formatPercentage(100 - fakeFollowersPercentage),
      quality: fakeFollowersPercentage < 10 ? 'high' : fakeFollowersPercentage < 25 ? 'medium' : 'low'
    })
  }

  if (credibility) {
    audienceMetrics.push({
      label: 'Credibility Score',
      value: typeof credibility === 'number' ? `${Math.round(credibility)}/100` : credibility,
      quality: typeof credibility === 'number' ? (credibility > 70 ? 'high' : credibility > 50 ? 'medium' : 'low') : undefined
    })
  }

  // Platform-specific additional metrics
  if (selectedPlatform === 'youtube') {
    const avgViews = getMetricValue(currentPlatformData?.avgViews, influencer.avgViews)
    const subscriberGrowth = getMetricValue(currentPlatformData?.subscriberGrowth)
    
    if (avgViews) {
      performanceMetrics.push({
        label: 'Avg Views',
        value: formatNumber(avgViews)
      })
    }
    
    if (subscriberGrowth) {
      performanceMetrics.push({
        label: 'Subscriber Growth',
        value: formatPercentage(subscriberGrowth),
        trend: subscriberGrowth
      })
    }
  }

  if (selectedPlatform === 'tiktok') {
    const avgShares = getMetricValue(currentPlatformData?.avgShares, influencer.avgShares)
    const avgViews = getMetricValue(currentPlatformData?.avgViews, influencer.avgViews)
    
    if (avgViews) {
      performanceMetrics.push({
        label: 'Avg Views',
        value: formatNumber(avgViews)
      })
    }
    
    if (avgShares) {
      performanceMetrics.push({
        label: 'Avg Shares',
        value: formatNumber(avgShares)
      })
    }
  }

  const platformName = selectedPlatform ? 
    selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1) : 
    'Platform'

  return (
    <PremiumSection 
      title={`${platformName} Performance`}
      badge={performanceMetrics.length}
      defaultOpen={true}
    >
      <div className="space-y-8">
        {/* Performance Metrics */}
        {performanceMetrics.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Key Metrics
            </h4>
            <PremiumMetricsGrid 
              metrics={performanceMetrics}
              columns={2}
            />
          </div>
        )}

        {/* Audience Quality */}
        {audienceMetrics.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Audience Quality
            </h4>
            <PremiumMetricsGrid 
              metrics={audienceMetrics}
              columns={2}
            />
          </div>
        )}

        {/* Profile Info */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            Profile Information
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {influencer.bio && (
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Bio</div>
                <div className="text-gray-900 leading-relaxed">{influencer.bio}</div>
              </div>
            )}
            
            {(influencer.location || influencer.city || influencer.country) && (
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Location</div>
                <div className="text-gray-900">
                  {influencer.location || `${influencer.city || ''} ${influencer.country || ''}`.trim()}
                </div>
              </div>
            )}

            {influencer.isVerified && (
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Status</div>
                <div className="inline-flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Verified Account
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PremiumSection>
  )
}
