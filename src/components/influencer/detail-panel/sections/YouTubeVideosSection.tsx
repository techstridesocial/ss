import { formatNumber } from '../utils'
import { Badge } from '@/components/ui/badge'
import { InfluencerData } from '../types'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { Play, Eye, ThumbsUp, MessageSquare } from 'lucide-react'

interface YouTubeVideosSectionProps {
  influencer: InfluencerData
}

export function YouTubeVideosSection({ influencer }: YouTubeVideosSectionProps) {
  const videosData = influencer.statsByContentType?.videos
  
  if (!videosData) {
    return (
      <CollapsibleSection
        title="YouTube Videos Performance"
        defaultOpen={false}
      >
        <div className="p-4 text-center text-gray-500">
          <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No YouTube videos data available</p>
          <p className="text-sm mt-1">This creator may not have uploaded regular videos recently</p>
        </div>
      </CollapsibleSection>
    )
  }

  const hasEngagementData = videosData.avgLikes || videosData.avgComments || videosData.avgViews

  return (
    <CollapsibleSection
      title="YouTube Videos Performance"
      defaultOpen={!!hasEngagementData}
    >
      <div className="space-y-4 p-4">
        {/* Video Performance Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!!videosData.avgViews && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Average Views</span>
              </div>
              <div className="text-xl font-bold text-blue-900">
                {formatNumber(videosData.avgViews)}
              </div>
              <div className="text-xs text-blue-700 mt-1">per video</div>
            </div>
          )}
          
          {!!videosData.engagementRate && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Engagement Rate</span>
              </div>
              <div className="text-xl font-bold text-green-900">
                {(videosData.engagementRate * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-green-700 mt-1">on videos</div>
            </div>
          )}
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm border-b border-gray-200 pb-2">
            Video Engagement Metrics
          </h4>
          
          {!!videosData.avgLikes && (
            <MetricRow
              label="Average Likes"
              value={formatNumber(videosData.avgLikes)}
              icon={ThumbsUp}
            />
          )}
          
          {!!videosData.avgComments && (
            <MetricRow
              label="Average Comments"
              value={formatNumber(videosData.avgComments)}
              icon={MessageSquare}
            />
          )}
          
          {!!videosData.engagements && (
            <MetricRow
              label="Total Engagements"
              value={formatNumber(videosData.engagements)}
              icon={ThumbsUp}
            />
          )}
        </div>

        {/* Content Strategy Insights */}
        <div className="bg-gray-50 rounded-lg p-3 mt-4">
          <h5 className="font-semibold text-gray-900 text-sm mb-2">
            Video Content Insights
          </h5>
          <div className="flex flex-wrap gap-2">
            {videosData.avgViews && videosData.avgViews > 100000 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                High View Count
              </Badge>
            )}
            {videosData.engagementRate && videosData.engagementRate > 0.03 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Strong Engagement
              </Badge>
            )}
            {videosData.avgComments && videosData.avgLikes && videosData.avgComments / videosData.avgLikes > 0.02 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                High Comment Ratio
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Regular video content shows consistent performance across YouTube's algorithm
          </p>
        </div>
      </div>
    </CollapsibleSection>
  )
}