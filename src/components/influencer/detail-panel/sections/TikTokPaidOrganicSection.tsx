'use client'

import { TrendingUp, Eye, Heart, DollarSign } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'
import { formatNumber, formatPercentage } from '../utils'

interface TikTokPaidOrganicSectionProps {
  influencer: InfluencerData
}

export const TikTokPaidOrganicSection = ({ influencer }: TikTokPaidOrganicSectionProps) => {
  // 🚨 DEBUG: Log TikTok Paid Data
  console.log('🚨 TikTok Paid/Organic Debug:', {
    paidPostPerformance: influencer.paidPostPerformance,
    paidPostPerformanceViews: influencer.paidPostPerformanceViews,
    sponsoredPostsMedianViews: influencer.sponsoredPostsMedianViews,
    sponsoredPostsMedianLikes: influencer.sponsoredPostsMedianLikes,
    nonSponsoredPostsMedianViews: influencer.nonSponsoredPostsMedianViews,
    nonSponsoredPostsMedianLikes: influencer.nonSponsoredPostsMedianLikes,
    fullInfluencer: influencer
  })

  const hasPaidData = !!(
    influencer.paidPostPerformance ||
    influencer.paidPostPerformanceViews ||
    influencer.sponsoredPostsMedianViews ||
    influencer.sponsoredPostsMedianLikes ||
    influencer.nonSponsoredPostsMedianViews ||
    influencer.nonSponsoredPostsMedianLikes
  )

  if (!hasPaidData) {
    return (
      <CollapsibleSection title="Paid vs Organic Performance">
        <div className="text-gray-500 text-sm italic">
          No paid performance data available for this TikTok creator
        </div>
      </CollapsibleSection>
    )
  }

  return (
    <CollapsibleSection title="Paid vs Organic Performance">
      <div className="space-y-4">
        {/* Paid Performance Overview */}
        {influencer.paidPostPerformance && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">Paid Performance Rate</span>
              <span className="text-lg font-bold text-green-900">
                {formatPercentage(influencer.paidPostPerformance * 100)}
              </span>
            </div>
          </div>
        )}

        {influencer.paidPostPerformanceViews && (
          <MetricRow
            icon={Eye}
            label="Paid Performance Views"
            value={formatNumber(influencer.paidPostPerformanceViews)}
          />
        )}

        {/* Sponsored vs Non-Sponsored Comparison */}
        {(influencer.sponsoredPostsMedianViews || influencer.nonSponsoredPostsMedianViews) && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">
              Sponsored vs Organic Comparison
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-xs font-medium text-blue-700 mb-1">Sponsored Posts</div>
                {influencer.sponsoredPostsMedianViews && (
                  <div className="text-sm text-blue-900">
                    <Eye className="inline w-3 h-3 mr-1" />
                    {formatNumber(influencer.sponsoredPostsMedianViews)} views
                  </div>
                )}
                {influencer.sponsoredPostsMedianLikes && (
                  <div className="text-sm text-blue-900">
                    <Heart className="inline w-3 h-3 mr-1" />
                    {formatNumber(influencer.sponsoredPostsMedianLikes)} likes
                  </div>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-700 mb-1">Organic Posts</div>
                {influencer.nonSponsoredPostsMedianViews && (
                  <div className="text-sm text-gray-900">
                    <Eye className="inline w-3 h-3 mr-1" />
                    {formatNumber(influencer.nonSponsoredPostsMedianViews)} views
                  </div>
                )}
                {influencer.nonSponsoredPostsMedianLikes && (
                  <div className="text-sm text-gray-900">
                    <Heart className="inline w-3 h-3 mr-1" />
                    {formatNumber(influencer.nonSponsoredPostsMedianLikes)} likes
                  </div>
                )}
              </div>
            </div>

            {/* Performance Ratio */}
            {influencer.sponsoredPostsMedianViews && influencer.nonSponsoredPostsMedianViews && (
              <div className="mt-2 text-xs text-gray-600">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                Sponsored posts get {((influencer.sponsoredPostsMedianViews / influencer.nonSponsoredPostsMedianViews) * 100).toFixed(0)}% 
                more views than organic posts
              </div>
            )}
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}