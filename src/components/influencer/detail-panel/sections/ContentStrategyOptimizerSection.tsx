'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { getMetricValue, formatNumber } from '../utils'

interface ContentStrategyOptimizerSectionProps {
  influencer: InfluencerData
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
}

export const ContentStrategyOptimizerSection = ({ 
  influencer, 
  selectedPlatform 
}: ContentStrategyOptimizerSectionProps) => {
  
  // Only show for Instagram
  if (selectedPlatform !== 'instagram') {
    return null
  }

  // Extract content strategy data
  const postsCount = getMetricValue(influencer.postsCount)
  const statsByContentType = getMetricValue(influencer.statsByContentType, influencer.stats_by_content_type)
  const recentPosts = getMetricValue(influencer.recentPosts, influencer.recent_posts) || []

  // Build content strategy metrics
  const contentMetrics = []

  // Total Content Volume
  if (postsCount && typeof postsCount === 'number') {
    const quality = postsCount > 1000 ? 'high' : postsCount > 100 ? 'medium' : 'low'
    contentMetrics.push({
      label: 'Total Posts',
      value: formatNumber(postsCount),
      quality
    })
  }

  // Posting Frequency Analysis
  if (recentPosts && recentPosts.length >= 5) {
    const timestamps = recentPosts
      .map((post: any) => {
        const date = post.created_time || post.timestamp || post.date
        return date ? new Date(date).getTime() : null
      })
      .filter(Boolean)
      .sort((a, b) => b - a)

    if (timestamps.length >= 2) {
      const intervals = []
      for (let i = 0; i < timestamps.length - 1; i++) {
        const daysDiff = (timestamps[i] - timestamps[i + 1]) / (1000 * 60 * 60 * 24)
        intervals.push(daysDiff)
      }

      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
      const frequency = avgInterval < 1 ? 'Daily' : avgInterval < 7 ? 'Weekly' : 'Monthly'
      const quality = avgInterval < 3 ? 'high' : avgInterval < 7 ? 'medium' : 'low'

      contentMetrics.push({
        label: 'Post Frequency',
        value: frequency,
        secondaryValue: `${Math.round(avgInterval)}d avg`,
        quality
      })
    }
  }

  // Content Type Performance
  if (statsByContentType) {
    const types = ['posts', 'reels', 'stories']
    const bestType = types.reduce((best, current) => {
      const currentLikes = statsByContentType[current]?.avgLikes || 0
      const bestLikes = statsByContentType[best]?.avgLikes || 0
      return currentLikes > bestLikes ? current : best
    })

    if (statsByContentType[bestType]?.avgLikes) {
      contentMetrics.push({
        label: 'Top Format',
        value: bestType.charAt(0).toUpperCase() + bestType.slice(1),
        secondaryValue: formatNumber(statsByContentType[bestType].avgLikes) + ' likes',
        quality: 'high'
      })
    }
  }

  // Portfolio Maturity
  if (postsCount) {
    const maturity = postsCount > 500 ? 'Established' : postsCount > 100 ? 'Growing' : 'Building'
    const quality = postsCount > 500 ? 'high' : postsCount > 100 ? 'medium' : 'low'
    
    contentMetrics.push({
      label: 'Portfolio',
      value: maturity,
      quality
    })
  }

  // Don't render if no strategy data available
  if (contentMetrics.length === 0) {
    return null
  }

  return (
    <PremiumSection 
      title="Content Strategy"
      badge={contentMetrics.length}
      defaultOpen={false}
    >
      <PremiumMetricsGrid 
        metrics={contentMetrics}
        columns={2}
      />
    </PremiumSection>
  )
}
