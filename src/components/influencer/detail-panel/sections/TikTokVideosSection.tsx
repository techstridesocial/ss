'use client'

import { Heart, MessageCircle, Share, Eye, Bookmark } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'
import { formatNumber, formatPercentage } from '../utils'

interface TikTokVideosSectionProps {
  influencer: InfluencerData
}

export const TikTokVideosSection = ({ influencer }: TikTokVideosSectionProps) => {
  // For TikTok, the API returns data under "posts" key, not "videos"
  const videosData = influencer.content_performance?.posts

  // DEBUG: Check what data we have
  console.log('📱 TikTokVideosSection Debug:', {
    hasContentPerformance: !!influencer.content_performance,
    contentPerformanceKeys: influencer.content_performance ? Object.keys(influencer.content_performance) : 'none',
    hasVideosData: !!videosData,
    videosTotal: videosData?.total,
    videosKeys: videosData ? Object.keys(videosData) : 'none'
  })

  if (!videosData || videosData.total === null || videosData.total === undefined || videosData.total === 0) {
    return (
      <CollapsibleSection title="TikTok Videos Performance">
        <div className="text-gray-500 text-sm italic">
          No TikTok videos performance data available
        </div>
      </CollapsibleSection>
    )
  }

  // Extract median values from Modash API structure for TikTok
  const avgViews = videosData.views?.median?.[0]?.value || videosData.views?.mean?.[0]?.value
  const avgLikes = videosData.likes?.median?.[0]?.value || videosData.likes?.mean?.[0]?.value  
  const avgComments = videosData.comments?.median?.[0]?.value || videosData.comments?.mean?.[0]?.value
  
  // TikTok has shares and saves in the standard structure
  const avgShares = videosData.shares?.median?.[0]?.value || videosData.shares?.mean?.[0]?.value
  const avgSaves = videosData.saves?.median?.[0]?.value || videosData.saves?.mean?.[0]?.value
  
  // Extract TikTok-specific engagement rate from the API response
  const engagementRateFromAPI = videosData.engagement_rate?.[0]?.value
  
  // Use API-provided engagement rate first, fallback to calculation
  let engagementRate = null
  if (engagementRateFromAPI && engagementRateFromAPI > 0) {
    engagementRate = engagementRateFromAPI * 100 // Convert to percentage
  } else if (avgLikes && avgViews && avgViews > 0) {
    engagementRate = (avgLikes / avgViews) * 100 // Calculate TikTok-specific ER (Likes / Views)
  }

  return (
    <CollapsibleSection title="TikTok Videos Performance">
      <div className="space-y-2">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          {videosData.total && videosData.total > 0 ? (
            <span className="text-sm font-medium text-gray-600">
              Total Videos: {formatNumber(videosData.total)}
            </span>
          ) : (
            <span className="text-sm font-medium text-gray-600">
              TikTok Performance Metrics
            </span>
          )}
          {engagementRate && (
            <span className="text-sm font-semibold text-blue-600">
              {formatPercentage(engagementRate)} ER
            </span>
          )}
        </div>

        {avgViews && (
          <MetricRow
            icon={Eye}
            label="Avg views"
            value={formatNumber(avgViews)}
          />
        )}

        {avgLikes && (
          <MetricRow
            icon={Heart}
            label="Avg likes"
            value={formatNumber(avgLikes)}
          />
        )}

        {avgComments && (
          <MetricRow
            icon={MessageCircle}
            label="Avg comments"
            value={formatNumber(avgComments)}
          />
        )}

        {avgShares && (
          <MetricRow
            icon={Share}
            label="Avg shares"
            value={formatNumber(avgShares)}
          />
        )}

        {avgSaves && (
          <MetricRow
            icon={Bookmark}
            label="Avg saves"
            value={formatNumber(avgSaves)}
          />
        )}

        {/* TikTok-specific posting statistics */}
        {videosData.posting_statistics && (
          <>
            {videosData.posting_statistics.daily?.mean?.value && (
              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Posting Frequency</div>
                <div className="text-sm text-gray-700">
                  {videosData.posting_statistics.daily.mean.value.toFixed(1)} posts per day
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CollapsibleSection>
  )
}