'use client'

import { Heart, Eye, TrendingUp, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'
import { formatPercentage, formatNumber, hasPaidOrganicData } from '../utils'

interface PaidOrganicSectionProps {
  influencer: InfluencerData
}

export const PaidOrganicSection = ({ influencer }: PaidOrganicSectionProps) => {
  const paidEngagement = influencer.paid_vs_organic?.paid_engagement_rate
  const organicEngagement = influencer.paid_vs_organic?.organic_engagement_rate
  
  // Enhanced sponsored performance data
  const sponsoredData = {
    paidPostPerformance: influencer.paidPostPerformance || 0,
    sponsoredPostsMedianViews: influencer.sponsoredPostsMedianViews || 0,
    sponsoredPostsMedianLikes: influencer.sponsoredPostsMedianLikes || 0,
    nonSponsoredPostsMedianViews: influencer.nonSponsoredPostsMedianViews || 0,
    nonSponsoredPostsMedianLikes: influencer.nonSponsoredPostsMedianLikes || 0,
    paidPostPerformanceViews: influencer.paidPostPerformanceViews || 0
  }
  
  // Check if we have any performance data to show
  const hasAnyData = paidEngagement || organicEngagement || 
    sponsoredData.paidPostPerformance > 0 || 
    sponsoredData.sponsoredPostsMedianViews > 0 || 
    sponsoredData.sponsoredPostsMedianLikes > 0
  
  if (!hasAnyData) {
    return null
  }

  return (
    <CollapsibleSection title="Sponsored vs Organic Performance" defaultOpen={false}>
      <div className="space-y-4">
        
        {/* Original metrics */}
        {(paidEngagement || organicEngagement) && (
          <div className="space-y-1">
            {paidEngagement && (
              <MetricRow
                icon={Heart}
                label="Paid engagement"
                value={formatPercentage(paidEngagement)}
              />
            )}
            
            {organicEngagement && (
              <MetricRow
                icon={Eye}
                label="Organic engagement"
                value={formatPercentage(organicEngagement)}
              />
            )}
          </div>
        )}
        
        {/* 🆕 NEW: PERFORMANCE COMPARISON CHART */}
        {(sponsoredData.sponsoredPostsMedianViews > 0 || sponsoredData.nonSponsoredPostsMedianViews > 0) && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Performance Comparison</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Sponsored Performance */}
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">Sponsored Content</div>
                <div className="mt-2 space-y-2">
                  {sponsoredData.sponsoredPostsMedianViews > 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Median Views:</span>
                      <span className="text-sm font-bold text-blue-700">
                        {formatNumber(sponsoredData.sponsoredPostsMedianViews)}
                      </span>
                    </div>
                  )}
                  {sponsoredData.sponsoredPostsMedianLikes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Median Likes:</span>
                      <span className="text-sm font-bold text-blue-700">
                        {formatNumber(sponsoredData.sponsoredPostsMedianLikes)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Organic Performance */}
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 font-medium">Organic Content</div>
                <div className="mt-2 space-y-2">
                  {sponsoredData.nonSponsoredPostsMedianViews > 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Median Views:</span>
                      <span className="text-sm font-bold text-green-700">
                        {formatNumber(sponsoredData.nonSponsoredPostsMedianViews)}
                      </span>
                    </div>
                  )}
                  {sponsoredData.nonSponsoredPostsMedianLikes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Median Likes:</span>
                      <span className="text-sm font-bold text-green-700">
                        {formatNumber(sponsoredData.nonSponsoredPostsMedianLikes)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Performance Ratio */}
            {sponsoredData.paidPostPerformance > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sponsored Performance vs Organic:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${
                      sponsoredData.paidPostPerformance < 1 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {(sponsoredData.paidPostPerformance * 100).toFixed(2)}%
                    </span>
                    <span className="text-xs text-gray-500">
                      {sponsoredData.paidPostPerformance < 1 ? 'Lower' : 'Higher'} than organic
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 🆕 NEW: ADDITIONAL PERFORMANCE METRICS */}
        {sponsoredData.paidPostPerformanceViews > 0 && (
          <MetricRow
            icon={BarChart3}
            label="Paid Views Performance"
            value={`${sponsoredData.paidPostPerformanceViews} views`}
          />
        )}
        
        {sponsoredData.paidPostPerformance > 0 && (
          <MetricRow
            icon={TrendingUp}
            label="Sponsored vs Organic Ratio"
            value={`${(sponsoredData.paidPostPerformance * 100).toFixed(2)}%`}
            valueClassName={sponsoredData.paidPostPerformance < 1 ? 'text-red-600' : 'text-green-600'}
          />
        )}
        
        {/* 🆕 NEW: Additional Paid Content Metrics */}
        {(influencer as any).paidPostPerformanceViews > 0 && (
          <MetricRow
            icon={Eye}
            label="Paid Content View Performance"
            value={formatNumber((influencer as any).paidPostPerformanceViews)}
          />
        )}
        
        {(influencer as any).sponsoredPostsMedianViews > 0 && (
          <MetricRow
            icon={Eye}
            label="Median Sponsored Views"
            value={formatNumber((influencer as any).sponsoredPostsMedianViews)}
            secondaryValue="vs organic"
          />
        )}
        
        {(influencer as any).sponsoredPostsMedianLikes > 0 && (
          <MetricRow
            icon={Heart}
            label="Median Sponsored Likes"
            value={formatNumber((influencer as any).sponsoredPostsMedianLikes)}
            secondaryValue="vs organic"
          />
        )}
        
        {(influencer as any).nonSponsoredPostsMedianViews > 0 && (
          <MetricRow
            icon={Eye}
            label="Median Organic Views"
            value={formatNumber((influencer as any).nonSponsoredPostsMedianViews)}
            secondaryValue="baseline"
          />
        )}
        
        {(influencer as any).nonSponsoredPostsMedianLikes > 0 && (
          <MetricRow
            icon={Heart}
            label="Median Organic Likes"
            value={formatNumber((influencer as any).nonSponsoredPostsMedianLikes)}
            secondaryValue="baseline"
          />
        )}
        
        {/* 📊 SPONSORED VS ORGANIC COMPARISON CHART */}
        {(influencer as any).sponsoredPostsMedianViews > 0 && (influencer as any).nonSponsoredPostsMedianViews > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-800 mb-4">📊 Sponsored vs Organic Performance</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      metric: 'Views',
                      Sponsored: (influencer as any).sponsoredPostsMedianViews,
                      Organic: (influencer as any).nonSponsoredPostsMedianViews,
                    },
                    {
                      metric: 'Likes',
                      Sponsored: (influencer as any).sponsoredPostsMedianLikes || 0,
                      Organic: (influencer as any).nonSponsoredPostsMedianLikes || 0,
                    }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="metric" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatNumber(value), 
                      name === 'Sponsored' ? '💰 Sponsored' : '🌱 Organic'
                    ]}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="Sponsored" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]}
                    name="Sponsored"
                  />
                  <Bar 
                    dataKey="Organic" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    name="Organic"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Performance Ratios */}
            <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-green-50 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-800 mb-2">Performance Ratios</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Views Ratio:</span>
                  <span className="font-medium text-amber-700">
                    {((influencer as any).sponsoredPostsMedianViews / (influencer as any).nonSponsoredPostsMedianViews).toFixed(2)}x
                  </span>
                </div>
                {(influencer as any).sponsoredPostsMedianLikes > 0 && (influencer as any).nonSponsoredPostsMedianLikes > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Likes Ratio:</span>
                    <span className="font-medium text-green-700">
                      {((influencer as any).sponsoredPostsMedianLikes / (influencer as any).nonSponsoredPostsMedianLikes).toFixed(2)}x
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
      </div>
    </CollapsibleSection>
  )
}