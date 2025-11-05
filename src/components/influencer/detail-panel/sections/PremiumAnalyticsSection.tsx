'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { formatNumber, formatPercentage, getMetricValue } from '../utils'

interface PremiumAnalyticsSectionProps {
  influencer: InfluencerData
  sectionType: 'performance' | 'analytics' | 'growth' | 'insights'
}

export const PremiumAnalyticsSection = ({ influencer, sectionType }: PremiumAnalyticsSectionProps) => {
  const getSectionData = () => {
    switch (sectionType) {
      case 'performance':
        return {
          title: 'Performance Status',
          metrics: [
            {
              label: 'Avg Views',
              value: formatNumber(getMetricValue(influencer.avg_views, influencer.avgViews)),
              quality: 'high'
            },
            {
              label: 'Avg Likes',
              value: formatNumber(getMetricValue(influencer.avg_likes, influencer.avgLikes)),
              quality: 'high'
            },
            {
              label: 'Avg Comments',
              value: formatNumber(getMetricValue(influencer.avg_comments, influencer.avgComments)),
              quality: 'medium'
            },
            {
              label: 'Engagement Rate',
              value: formatPercentage(getMetricValue(influencer.engagement_rate, influencer.engagementRate)),
              quality: 'high'
            }
          ]
        }
      
      case 'analytics':
        return {
          title: 'Content Analytics',
          metrics: [
            {
              label: 'Total Posts',
              value: formatNumber(getMetricValue(influencer.posts_count, influencer.postsCount)),
              quality: 'medium'
            },
            {
              label: 'Posting Frequency',
              value: influencer.posting_frequency || 'Weekly',
              quality: 'medium'
            },
            {
              label: 'Best Performance',
              value: formatNumber(getMetricValue(influencer.best_performance, influencer.mostViewedVideo?.views)),
              quality: 'high'
            },
            {
              label: 'Consistency Score',
              value: `${Math.round(getMetricValue(influencer.consistency_score, 75))}/100`,
              quality: 'high'
            }
          ]
        }
      
      case 'growth':
        return {
          title: 'Historical Growth',
          metrics: [
            {
              label: 'Growth Rate',
              value: formatPercentage(getMetricValue(influencer.growth_rate, influencer.followerGrowthRate)),
              quality: 'high'
            },
            {
              label: 'Monthly Growth',
              value: formatNumber(getMetricValue(influencer.monthly_growth, influencer.monthlyGrowth)),
              quality: 'medium'
            },
            {
              label: 'Trending Score',
              value: `${Math.round(getMetricValue(influencer.trending_score, 80))}/100`,
              quality: 'high'
            },
            {
              label: 'Momentum',
              value: influencer.momentum || 'Rising',
              quality: 'high'
            }
          ]
        }
      
      case 'insights':
        return {
          title: 'Creator Insights',
          metrics: [
            {
              label: 'Content Quality',
              value: `${Math.round(getMetricValue(influencer.content_quality, 85))}/100`,
              quality: 'high'
            },
            {
              label: 'Audience Loyalty',
              value: formatPercentage(getMetricValue(influencer.audience_loyalty, influencer.audienceLoyalty)),
              quality: 'high'
            },
            {
              label: 'Brand Safety',
              value: `${Math.round(getMetricValue(influencer.brand_safety, 90))}/100`,
              quality: 'high'
            },
            {
              label: 'Influence Score',
              value: `${Math.round(getMetricValue(influencer.influence_score, 78))}/100`,
              quality: 'high'
            }
          ]
        }
    }
  }

  const { title, metrics } = getSectionData()
  
  // Ensure metrics is an array before filtering
  if (!Array.isArray(metrics)) {
    return null
  }
  
  // Filter out metrics with no values
  const validMetrics = metrics.filter(metric => 
    metric.value && 
    metric.value !== 'NaN' && 
    metric.value !== '0' && 
    metric.value !== '0%' &&
    metric.value !== 'undefined'
  )

  if (validMetrics.length === 0) {
    return null
  }

  return (
    <PremiumSection 
      title={title}
      badge={validMetrics.length}
      defaultOpen={false}
    >
      <div className="space-y-6">
        <PremiumMetricsGrid 
          metrics={validMetrics}
          columns={2}
        />

        {/* Additional insights */}
        {sectionType === 'performance' && influencer.recentPosts && influencer.recentPosts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Recent Performance Trend
            </h4>
            <div className="text-sm text-gray-600">
              Based on last {influencer.recentPosts.length} posts
            </div>
          </div>
        )}
      </div>
    </PremiumSection>
  )
}
