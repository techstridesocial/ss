import { formatNumber } from '../utils'
import { Badge } from '@/components/ui/badge'
import { InfluencerData } from '../types'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { DollarSign, Eye, ThumbsUp, BarChart3, TrendingUp, TrendingDown } from 'lucide-react'

interface YouTubePaidOrganicSectionProps {
  influencer: InfluencerData
}

export function YouTubePaidOrganicSection({ influencer }: YouTubePaidOrganicSectionProps) {
  const sponsoredViews = influencer.sponsoredPostsMedianViews
  const sponsoredLikes = influencer.sponsoredPostsMedianLikes
  const organicViews = influencer.nonSponsoredPostsMedianViews
  const organicLikes = influencer.nonSponsoredPostsMedianLikes
  const paidPerformanceViews = influencer.paidPostPerformanceViews

  const hasData = sponsoredViews || sponsoredLikes || organicViews || organicLikes || paidPerformanceViews

  if (!hasData) {
    return (
      <CollapsibleSection
        title="Sponsored vs Organic Performance"
        icon={<DollarSign className="h-4 w-4" />}
        defaultOpen={false}
      >
        <div className="p-4 text-center text-gray-500">
          <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No sponsored content data available</p>
          <p className="text-sm mt-1">Analysis requires recent sponsored content</p>
        </div>
      </CollapsibleSection>
    )
  }

  // Calculate performance ratios
  const viewsRatio = sponsoredViews && organicViews ? sponsoredViews / organicViews : null
  const likesRatio = sponsoredLikes && organicLikes ? sponsoredLikes / organicLikes : null

  return (
    <CollapsibleSection
      title="Sponsored vs Organic Performance"
      icon={<DollarSign className="h-4 w-4" />}
      defaultOpen={true}
    >
      <div className="space-y-4 p-4">
        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sponsored Content */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-amber-600" />
              <h4 className="font-semibold text-amber-900">Sponsored Content</h4>
            </div>
            <div className="space-y-2">
              {!!sponsoredViews && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-700">Median Views</span>
                  <span className="font-semibold text-amber-900">{formatNumber(sponsoredViews)}</span>
                </div>
              )}
              {!!sponsoredLikes && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-700">Median Likes</span>
                  <span className="font-semibold text-amber-900">{formatNumber(sponsoredLikes)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Organic Content */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <h4 className="font-semibold text-emerald-900">Organic Content</h4>
            </div>
            <div className="space-y-2">
              {!!organicViews && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-700">Median Views</span>
                  <span className="font-semibold text-emerald-900">{formatNumber(organicViews)}</span>
                </div>
              )}
              {!!organicLikes && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-700">Median Likes</span>
                  <span className="font-semibold text-emerald-900">{formatNumber(organicLikes)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Ratios */}
        {(viewsRatio || likesRatio) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance Comparison
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {viewsRatio && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {viewsRatio > 1 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium text-gray-700">Views Performance</span>
                  </div>
                  <div className={`text-xl font-bold ${viewsRatio > 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {viewsRatio.toFixed(2)}x
                  </div>
                  <div className="text-xs text-gray-600">
                    {viewsRatio > 1 ? 'Sponsored content performs better' : 'Organic content performs better'}
                  </div>
                </div>
              )}
              
              {likesRatio && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {likesRatio > 1 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium text-gray-700">Likes Performance</span>
                  </div>
                  <div className={`text-xl font-bold ${likesRatio > 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {likesRatio.toFixed(2)}x
                  </div>
                  <div className="text-xs text-gray-600">
                    {likesRatio > 1 ? 'Sponsored content more liked' : 'Organic content more liked'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Metrics */}
        {!!paidPerformanceViews && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm border-b border-gray-200 pb-2">
              Sponsored Content Metrics
            </h4>
            <MetricRow
              label="Paid Performance Views"
              value={formatNumber(paidPerformanceViews)}
              icon={Eye}
            />
          </div>
        )}

        {/* Content Strategy Insights */}
        <div className="bg-gray-50 rounded-lg p-3 mt-4">
          <h5 className="font-semibold text-gray-900 text-sm mb-2">
            Sponsored Content Insights
          </h5>
          <div className="flex flex-wrap gap-2">
            {viewsRatio && viewsRatio > 0.8 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Strong Sponsored Performance
              </Badge>
            )}
            {likesRatio && likesRatio > 0.9 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Audience Accepts Sponsored Content
              </Badge>
            )}
            {viewsRatio && viewsRatio > 1.2 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Sponsored Content Outperforms Organic
              </Badge>
            )}
            {viewsRatio && viewsRatio < 0.7 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Organic Content Preference
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Understanding sponsored vs organic performance helps optimize brand partnership strategies
          </p>
        </div>
      </div>
    </CollapsibleSection>
  )
}