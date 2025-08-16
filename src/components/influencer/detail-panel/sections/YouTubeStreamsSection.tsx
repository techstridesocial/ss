import { formatNumber } from '../utils'
import { Badge } from '@/components/ui/badge'
import { InfluencerData } from '../types'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { Radio, Eye, ThumbsUp, MessageSquare, Users } from 'lucide-react'

interface YouTubeStreamsSectionProps {
  influencer: InfluencerData
}

export function YouTubeStreamsSection({ influencer }: YouTubeStreamsSectionProps) {
  const streamsData = influencer.statsByContentType?.streams
  
  if (!streamsData) {
    return (
      <CollapsibleSection
        title="YouTube Live Streams Performance"
        icon={<Radio className="h-4 w-4" />}
        defaultOpen={false}
      >
        <div className="p-4 text-center text-gray-500">
          <Radio className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No YouTube live streams data available</p>
          <p className="text-sm mt-1">This creator may not have streamed recently</p>
        </div>
      </CollapsibleSection>
    )
  }

  const hasEngagementData = streamsData.avgLikes || streamsData.avgComments || streamsData.avgViews

  return (
    <CollapsibleSection
      title="YouTube Live Streams Performance"
      icon={<Radio className="h-4 w-4" />}
      defaultOpen={hasEngagementData}
    >
      <div className="space-y-4 p-4">
        {/* Streams Performance Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!!streamsData.avgViews && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Average Views</span>
              </div>
              <div className="text-xl font-bold text-purple-900">
                {formatNumber(streamsData.avgViews)}
              </div>
              <div className="text-xs text-purple-700 mt-1">per stream</div>
            </div>
          )}
          
          {!!streamsData.engagementRate && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-900">Engagement Rate</span>
              </div>
              <div className="text-xl font-bold text-indigo-900">
                {(streamsData.engagementRate * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-indigo-700 mt-1">on live streams</div>
            </div>
          )}
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm border-b border-gray-200 pb-2">
            Live Stream Engagement Metrics
          </h4>
          
          {!!streamsData.avgLikes && (
            <MetricRow
              label="Average Likes"
              value={formatNumber(streamsData.avgLikes)}
              icon={ThumbsUp}
            />
          )}
          
          {!!streamsData.avgComments && (
            <MetricRow
              label="Average Comments"
              value={formatNumber(streamsData.avgComments)}
              icon={MessageSquare}
            />
          )}
          
          {!!streamsData.engagements && (
            <MetricRow
              label="Total Engagements"
              value={formatNumber(streamsData.engagements)}
              icon={Users}
            />
          )}
        </div>

        {/* Live vs Recorded Content Comparison */}
        {influencer.statsByContentType?.videos && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 mt-4">
            <h5 className="font-semibold text-gray-900 text-sm mb-2">
              Live Streams vs Videos Performance
            </h5>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {streamsData.avgViews && influencer.statsByContentType.videos.avgViews && (
                <div>
                  <div className="text-gray-600">Views Ratio</div>
                  <div className="font-semibold">
                    {(streamsData.avgViews / influencer.statsByContentType.videos.avgViews).toFixed(1)}x
                  </div>
                  <div className="text-xs text-gray-500">
                    {streamsData.avgViews > influencer.statsByContentType.videos.avgViews ? 'Streams perform better' : 'Videos perform better'}
                  </div>
                </div>
              )}
              {streamsData.engagementRate && influencer.statsByContentType.videos.engagementRate && (
                <div>
                  <div className="text-gray-600">Engagement Ratio</div>
                  <div className="font-semibold">
                    {(streamsData.engagementRate / influencer.statsByContentType.videos.engagementRate).toFixed(1)}x
                  </div>
                  <div className="text-xs text-gray-500">
                    {streamsData.engagementRate > influencer.statsByContentType.videos.engagementRate ? 'Streams more engaging' : 'Videos more engaging'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Strategy Insights */}
        <div className="bg-gray-50 rounded-lg p-3 mt-4">
          <h5 className="font-semibold text-gray-900 text-sm mb-2">
            Live Streaming Insights
          </h5>
          <div className="flex flex-wrap gap-2">
            {streamsData.avgViews && streamsData.avgViews > 10000 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Strong Live Audience
              </Badge>
            )}
            {streamsData.engagementRate && streamsData.engagementRate > 0.04 && (
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                Interactive Community
              </Badge>
            )}
            {streamsData.avgComments && streamsData.avgLikes && streamsData.avgComments / streamsData.avgLikes > 0.1 && (
              <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                High Chat Activity
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Live streaming builds stronger community connections and real-time engagement
          </p>
        </div>
      </div>
    </CollapsibleSection>
  )
}