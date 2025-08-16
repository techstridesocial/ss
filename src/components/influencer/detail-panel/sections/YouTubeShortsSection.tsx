import { formatNumber } from '../utils'
import { Badge } from '@/components/ui/badge'
import { InfluencerData } from '../types'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { Smartphone, Eye, ThumbsUp, MessageSquare, TrendingUp } from 'lucide-react'

interface YouTubeShortsSectionProps {
  influencer: InfluencerData
}

export function YouTubeShortsSection({ influencer }: YouTubeShortsSectionProps) {
  const shortsData = influencer.statsByContentType?.shorts
  
  if (!shortsData) {
    return (
      <CollapsibleSection
        title="YouTube Shorts Performance"
        icon={<Smartphone className="h-4 w-4" />}
        defaultOpen={false}
      >
        <div className="p-4 text-center text-gray-500">
          <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No YouTube Shorts data available</p>
          <p className="text-sm mt-1">This creator may not have uploaded Shorts recently</p>
        </div>
      </CollapsibleSection>
    )
  }

  const hasEngagementData = shortsData.avgLikes || shortsData.avgComments || shortsData.avgViews

  return (
    <CollapsibleSection
      title="YouTube Shorts Performance"
      icon={<Smartphone className="h-4 w-4" />}
      defaultOpen={hasEngagementData}
    >
      <div className="space-y-4 p-4">
        {/* Shorts Performance Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!!shortsData.avgViews && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Average Views</span>
              </div>
              <div className="text-xl font-bold text-red-900">
                {formatNumber(shortsData.avgViews)}
              </div>
              <div className="text-xs text-red-700 mt-1">per Short</div>
            </div>
          )}
          
          {!!shortsData.engagementRate && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Engagement Rate</span>
              </div>
              <div className="text-xl font-bold text-orange-900">
                {(shortsData.engagementRate * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-orange-700 mt-1">on Shorts</div>
            </div>
          )}
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm border-b border-gray-200 pb-2">
            Shorts Engagement Metrics
          </h4>
          
          {!!shortsData.avgLikes && (
            <MetricRow
              label="Average Likes"
              value={formatNumber(shortsData.avgLikes)}
              icon={ThumbsUp}
            />
          )}
          
          {!!shortsData.avgComments && (
            <MetricRow
              label="Average Comments"
              value={formatNumber(shortsData.avgComments)}
              icon={MessageSquare}
            />
          )}
          
          {!!shortsData.engagements && (
            <MetricRow
              label="Total Engagements"
              value={formatNumber(shortsData.engagements)}
              icon={TrendingUp}
            />
          )}
        </div>

        {/* Shorts vs Videos Comparison */}
        {influencer.statsByContentType?.videos && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 mt-4">
            <h5 className="font-semibold text-gray-900 text-sm mb-2">
              Shorts vs Videos Performance
            </h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {shortsData.avgViews && influencer.statsByContentType.videos.avgViews && (
                <div>
                  <div className="text-gray-600">Views Ratio</div>
                  <div className="font-semibold">
                    {(shortsData.avgViews / influencer.statsByContentType.videos.avgViews).toFixed(1)}x
                  </div>
                  <div className="text-xs text-gray-500">
                    {shortsData.avgViews > influencer.statsByContentType.videos.avgViews ? 'Shorts perform better' : 'Videos perform better'}
                  </div>
                </div>
              )}
              {shortsData.engagementRate && influencer.statsByContentType.videos.engagementRate && (
                <div>
                  <div className="text-gray-600">Engagement Ratio</div>
                  <div className="font-semibold">
                    {(shortsData.engagementRate / influencer.statsByContentType.videos.engagementRate).toFixed(1)}x
                  </div>
                  <div className="text-xs text-gray-500">
                    {shortsData.engagementRate > influencer.statsByContentType.videos.engagementRate ? 'Shorts more engaging' : 'Videos more engaging'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Strategy Insights */}
        <div className="bg-gray-50 rounded-lg p-3 mt-4">
          <h5 className="font-semibold text-gray-900 text-sm mb-2">
            Shorts Content Insights
          </h5>
          <div className="flex flex-wrap gap-2">
            {shortsData.avgViews && shortsData.avgViews > 50000 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Viral Potential
              </Badge>
            )}
            {shortsData.engagementRate && shortsData.engagementRate > 0.05 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                High Shorts Engagement
              </Badge>
            )}
            {influencer.statsByContentType?.videos && shortsData.avgViews && 
             influencer.statsByContentType.videos.avgViews && 
             shortsData.avgViews > influencer.statsByContentType.videos.avgViews && (
              <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                Shorts Outperform Videos
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            YouTube Shorts leverage the algorithm for maximum discovery and reach
          </p>
        </div>
      </div>
    </CollapsibleSection>
  )
}