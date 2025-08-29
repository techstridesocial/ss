'use client'

import { PremiumSection } from '../components/PremiumSection'
import { PremiumMetricsGrid } from '../components/PremiumMetricsGrid'
import { InfluencerData } from '../types'
import { formatNumber, formatPercentage, getMetricValue } from '../utils'

interface PremiumInstagramMetricsSectionProps {
  influencer: InfluencerData
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
}

export const PremiumInstagramMetricsSection = ({ influencer, selectedPlatform }: PremiumInstagramMetricsSectionProps) => {
  
  // Only show for Instagram
  if (selectedPlatform !== 'instagram') {
    return null
  }
  
  // Extract Instagram-specific metrics
  const avgReelsPlays = getMetricValue(influencer.avgReelsPlays, influencer.avg_reels_plays)
  const statsByContentType = getMetricValue(influencer.statsByContentType, influencer.stats_by_content_type)
  const paidPostPerformance = getMetricValue(influencer.paidPostPerformance, influencer.paid_post_performance)
  const sponsoredPostsMedianLikes = getMetricValue(influencer.sponsoredPostsMedianLikes, influencer.sponsored_posts_median_likes)
  const nonSponsoredPostsMedianLikes = getMetricValue(influencer.nonSponsoredPostsMedianLikes, influencer.non_sponsored_posts_median_likes)
  const nonSponsoredPostsMedianViews = getMetricValue(influencer.nonSponsoredPostsMedianViews, influencer.non_sponsored_posts_median_views)
  
  // Build Instagram-specific metrics
  const instagramMetrics = []
  
  // Reels Performance
  if (avgReelsPlays) {
    instagramMetrics.push({
      label: 'Avg Reels Plays',
      value: formatNumber(avgReelsPlays),
      quality: avgReelsPlays > 50000 ? 'high' : avgReelsPlays > 10000 ? 'medium' : 'low'
    })
  }
  
  // Sponsored vs Non-Sponsored Performance
  if (sponsoredPostsMedianLikes) {
    instagramMetrics.push({
      label: 'Sponsored Posts Likes',
      value: formatNumber(sponsoredPostsMedianLikes),
      quality: 'medium'
    })
  }
  
  if (nonSponsoredPostsMedianLikes) {
    instagramMetrics.push({
      label: 'Organic Posts Likes',
      value: formatNumber(nonSponsoredPostsMedianLikes),
      quality: 'high'
    })
  }
  
  if (nonSponsoredPostsMedianViews) {
    instagramMetrics.push({
      label: 'Organic Posts Views',
      value: formatNumber(nonSponsoredPostsMedianViews),
      quality: 'high'
    })
  }
  
  // Calculate sponsored vs organic performance ratio
  let performanceRatio = null
  if (sponsoredPostsMedianLikes && nonSponsoredPostsMedianLikes && nonSponsoredPostsMedianLikes > 0) {
    performanceRatio = (sponsoredPostsMedianLikes / nonSponsoredPostsMedianLikes)
    instagramMetrics.push({
      label: 'Sponsored/Organic Ratio',
      value: `${performanceRatio.toFixed(2)}x`,
      quality: performanceRatio > 0.8 ? 'high' : performanceRatio > 0.5 ? 'medium' : 'low'
    })
  }
  
  // Extract content type stats
  let contentTypeStats = []
  if (statsByContentType) {
    if (statsByContentType.reels) {
      contentTypeStats.push({
        type: 'Reels',
        likes: statsByContentType.reels.avgLikes || statsByContentType.reels.likes,
        views: statsByContentType.reels.avgViews || statsByContentType.reels.views,
        comments: statsByContentType.reels.avgComments || statsByContentType.reels.comments
      })
    }
    if (statsByContentType.posts) {
      contentTypeStats.push({
        type: 'Posts',
        likes: statsByContentType.posts.avgLikes || statsByContentType.posts.likes,
        views: statsByContentType.posts.avgViews || statsByContentType.posts.views,
        comments: statsByContentType.posts.avgComments || statsByContentType.posts.comments
      })
    }
    if (statsByContentType.stories) {
      contentTypeStats.push({
        type: 'Stories',
        likes: statsByContentType.stories.avgLikes || statsByContentType.stories.likes,
        views: statsByContentType.stories.avgViews || statsByContentType.stories.views,
        comments: statsByContentType.stories.avgComments || statsByContentType.stories.comments
      })
    }
  }
  
  // If no Instagram-specific data available, don't render the section
  if (instagramMetrics.length === 0 && contentTypeStats.length === 0) {
    return null
  }
  
  return (
    <PremiumSection 
      title="Instagram Performance"
      badge={instagramMetrics.length + contentTypeStats.length}
      defaultOpen={false}
    >
      <div className="space-y-6">
        {/* Instagram-Specific Metrics */}
        {instagramMetrics.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Key Instagram Metrics
            </h4>
            <PremiumMetricsGrid 
              metrics={instagramMetrics}
              columns={2}
            />
          </div>
        )}
        
        {/* Content Type Performance Breakdown */}
        {contentTypeStats.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Content Type Performance
            </h4>
            <div className="space-y-4">
              {contentTypeStats.map((stat, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900">{stat.type}</h5>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Content Performance
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {stat.likes && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatNumber(stat.likes)}
                        </div>
                        <div className="text-xs text-gray-600">Avg Likes</div>
                      </div>
                    )}
                    
                    {stat.views && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatNumber(stat.views)}
                        </div>
                        <div className="text-xs text-gray-600">Avg Views</div>
                      </div>
                    )}
                    
                    {stat.comments && (
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatNumber(stat.comments)}
                        </div>
                        <div className="text-xs text-gray-600">Avg Comments</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Paid vs Organic Insights */}
        {paidPostPerformance && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Paid vs Organic Analysis
            </h4>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <div className="text-sm text-gray-700">
                {typeof paidPostPerformance === 'object' ? (
                  <div className="space-y-2">
                    {Object.entries(paidPostPerformance).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-semibold">
                          {typeof value === 'number' ? formatNumber(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>Paid post performance data available</span>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Performance Summary */}
        {(avgReelsPlays || performanceRatio) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Instagram Strategy Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {avgReelsPlays && (
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <div className="text-purple-600 font-semibold">Reels Focus</div>
                  <div className="text-xs text-purple-500">
                    {avgReelsPlays > 50000 ? 'High Reels Performance' : 
                     avgReelsPlays > 10000 ? 'Good Reels Engagement' : 'Growing Reels Presence'}
                  </div>
                </div>
              )}
              
              {performanceRatio && (
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <div className="text-orange-600 font-semibold">Authenticity</div>
                  <div className="text-xs text-orange-500">
                    {performanceRatio > 0.8 ? 'Natural Sponsored Performance' : 
                     performanceRatio > 0.5 ? 'Moderate Sponsored Impact' : 'Strong Organic Preference'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PremiumSection>
  )
}
