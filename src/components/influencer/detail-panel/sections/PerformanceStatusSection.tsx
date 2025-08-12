'use client'

import React from 'react'
import { Activity, Clock, AlertTriangle, CheckCircle, Database, TrendingUp, BarChart3, Target, Users } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'
import { InfluencerData } from '../types'
import { formatNumber } from '../utils'

interface PerformanceStatusSectionProps {
  influencer: InfluencerData
}

export const PerformanceStatusSection = ({ influencer }: PerformanceStatusSectionProps) => {
  const hasPerformanceData = influencer.raw_performance_data
  const performanceStatus = influencer.performance_data_status
  const stats = influencer.stats || {}
  
  // Enhanced benchmarking data
  const audienceExtra = influencer.audienceExtra || {}
  const engagementDistribution = audienceExtra.engagementRateDistribution || []
  const credibilityDistribution = audienceExtra.credibilityDistribution || []
  const followersRange = audienceExtra.followersRange || {}
  
  // Check if we have any performance or benchmarking data
  const hasAnyData = hasPerformanceData || performanceStatus || 
    Object.keys(stats).length > 0 || 
    engagementDistribution.length > 0 || 
    credibilityDistribution.length > 0 ||
    Object.keys(followersRange).length > 0
  
  if (!hasAnyData) {
    return null
  }

  const getStatusIcon = () => {
    switch (performanceStatus) {
      case 'processing':
        return Clock
      case 'error':
        return AlertTriangle
      case 'unavailable':
        return Database
      default:
        return hasPerformanceData ? CheckCircle : Activity
    }
  }

  const getStatusMessage = () => {
    switch (performanceStatus) {
      case 'processing':
        return 'Performance data is being processed'
      case 'error':
        return 'Performance data temporarily unavailable'
      case 'unavailable':
        return 'Performance data not available for this profile'
      default:
        return hasPerformanceData ? 'Real performance data available' : 'Using calculated performance metrics'
    }
  }

  const getStatusColor = () => {
    switch (performanceStatus) {
      case 'processing':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      case 'unavailable':
        return 'text-gray-600'
      default:
        return hasPerformanceData ? 'text-green-600' : 'text-blue-600'
    }
  }

  return (
    <CollapsibleSection title="Performance Benchmarking" defaultOpen={false}>
      <div className="space-y-5 md:space-y-4">
        
        {/* Performance Status */}
        {(hasPerformanceData || performanceStatus) && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {React.createElement(getStatusIcon(), { 
              className: `w-5 h-5 ${getStatusColor()}` 
            })}
            <div>
              <p className="text-sm font-medium text-gray-900">Data Source</p>
              <p className={`text-xs ${getStatusColor()}`}>
                {getStatusMessage()}
              </p>
            </div>
          </div>
        )}
        
        {/* 🆕 NEW: PERFORMANCE VS PEERS */}
        {Object.keys(stats).length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Performance vs Industry Peers</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {stats.avgLikes?.compared && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm text-gray-500">Likes Performance</div>
                  <div className={`text-xl font-bold ${
                    stats.avgLikes.compared > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.avgLikes.compared > 0 ? '+' : ''}{(stats.avgLikes.compared * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500">vs peers</div>
                </div>
              )}
              
              {stats.followers?.compared && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm text-gray-500">Growth Rate</div>
                  <div className={`text-xl font-bold ${
                    stats.followers.compared > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.followers.compared > 0 ? '+' : ''}{(stats.followers.compared * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500">vs peers</div>
                </div>
              )}
              
              {stats.avgComments?.compared && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm text-gray-500">Comment Rate</div>
                  <div className={`text-xl font-bold ${
                    stats.avgComments.compared > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.avgComments.compared > 0 ? '+' : ''}{(stats.avgComments.compared * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500">vs peers</div>
                </div>
              )}
              
              {stats.avgShares?.compared && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm text-gray-500">Share Rate</div>
                  <div className={`text-xl font-bold ${
                    stats.avgShares.compared > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.avgShares.compared > 0 ? '+' : ''}{(stats.avgShares.compared * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500">vs peers</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🆕 NEW: RAW STATS VALUES FROM API */}
        {(stats.avgLikes?.value || stats.followers?.value || stats.avgComments?.value || stats.avgShares?.value) && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Raw Performance Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              {stats.followers?.value && (
                <MetricRow icon={Users} label="Followers (API)" value={formatNumber(stats.followers.value)} />
              )}
              {stats.avgLikes?.value && (
                <MetricRow icon={TrendingUp} label="Avg Likes (API)" value={formatNumber(stats.avgLikes.value)} />
              )}
              {stats.avgComments?.value && (
                <MetricRow icon={Target} label="Avg Comments (API)" value={formatNumber(stats.avgComments.value)} />
              )}
              {stats.avgShares?.value && (
                <MetricRow icon={BarChart3} label="Avg Shares (API)" value={formatNumber(stats.avgShares.value)} />
              )}
            </div>
          </div>
        )}
        
        {/* 🆕 NEW: ENGAGEMENT DISTRIBUTION */}
        {engagementDistribution.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Engagement Rate Distribution</h4>
            <div className="space-y-2">
              {engagementDistribution.map((dist: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm">{dist.min}% - {dist.max}%</span>
                    {dist.median && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        MEDIAN
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{dist.total} creators</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 🆕 NEW: CREDIBILITY DISTRIBUTION */}
        {credibilityDistribution.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Credibility Distribution</h4>
            <div className="space-y-2">
              {credibilityDistribution.map((dist: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm">{dist.min} - {dist.max}</span>
                    {dist.median && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        MEDIAN
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{dist.total} creators</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 🆕 NEW: FOLLOWER RANGE */}
        {Object.keys(followersRange).length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Follower Range Analysis</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Range:</span>
              <span className="font-medium">
                {formatNumber(followersRange.leftNumber)} - {formatNumber(followersRange.rightNumber)}
              </span>
            </div>
          </div>
        )}

        {/* Real Performance Metrics from API */}
        {hasPerformanceData && influencer.raw_performance_data.posts && (
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Live Performance Metrics</h4>
            
            <MetricRow
              icon={Activity}
              label="Posts Analyzed"
              value={formatNumber(influencer.raw_performance_data.posts.total || 0)}
            />
            
            {influencer.raw_performance_data.posts.likes?.mean?.[2]?.value && (
              <MetricRow
                icon={TrendingUp}
                label="Avg Likes (30 posts)"
                value={formatNumber(Math.round(influencer.raw_performance_data.posts.likes.mean[2].value))}
              />
            )}
            
            {influencer.raw_performance_data.posts.comments?.mean?.[2]?.value && (
              <MetricRow
                icon={Target}
                label="Avg Comments (30 posts)"
                value={formatNumber(Math.round(influencer.raw_performance_data.posts.comments.mean[2].value))}
              />
            )}
            
            {influencer.raw_performance_data.posts.engagement_rate?.[2]?.value && (
              <MetricRow
                icon={BarChart3}
                label="Real Engagement Rate"
                value={`${(influencer.raw_performance_data.posts.engagement_rate[2].value * 100).toFixed(2)}%`}
              />
            )}
          </div>
        )}

        {/* Reels Performance if available */}
        {hasPerformanceData && influencer.raw_performance_data.reels && (
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Reels Performance</h4>
            
            <MetricRow
              icon={Activity}
              label="Reels Analyzed"
              value={formatNumber(influencer.raw_performance_data.reels.total || 0)}
            />
            
            {influencer.raw_performance_data.reels.views?.mean?.[2]?.value && (
              <MetricRow
                icon={Users}
                label="Avg Reel Views"
                value={formatNumber(Math.round(influencer.raw_performance_data.reels.views.mean[2].value))}
              />
            )}
            
            {influencer.raw_performance_data.reels.likes?.mean?.[2]?.value && (
              <MetricRow
                icon={TrendingUp}
                label="Avg Reel Likes"
                value={formatNumber(Math.round(influencer.raw_performance_data.reels.likes.mean[2].value))}
              />
            )}
          </div>
        )}
        
        {/* 🆕 NEW: Peer Comparison Data */}
        {(influencer as any).stats_compared && (
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">vs Industry Peers</h4>
            
            {(influencer as any).stats_compared.avgLikes?.compared !== undefined && (
              <MetricRow
                icon={TrendingUp}
                label="Likes vs Peers"
                value={`${((influencer as any).stats_compared.avgLikes.compared * 100).toFixed(1)}%`}
                trend={(influencer as any).stats_compared.avgLikes.compared > 0 ? 
                  (influencer as any).stats_compared.avgLikes.compared * 100 : 
                  (influencer as any).stats_compared.avgLikes.compared * 100}
              />
            )}
            
            {(influencer as any).stats_compared.followers?.compared !== undefined && (
              <MetricRow
                icon={Users}
                label="Follower Growth vs Peers"
                value={`${((influencer as any).stats_compared.followers.compared * 100).toFixed(1)}%`}
                trend={(influencer as any).stats_compared.followers.compared > 0 ? 
                  (influencer as any).stats_compared.followers.compared * 100 : 
                  (influencer as any).stats_compared.followers.compared * 100}
              />
            )}
            
            {(influencer as any).stats_compared.avgComments?.compared !== undefined && (
              <MetricRow
                icon={Target}
                label="Comments vs Peers"
                value={`${((influencer as any).stats_compared.avgComments.compared * 100).toFixed(1)}%`}
                trend={(influencer as any).stats_compared.avgComments.compared > 0 ? 
                  (influencer as any).stats_compared.avgComments.compared * 100 : 
                  (influencer as any).stats_compared.avgComments.compared * 100}
              />
            )}
            
            {(influencer as any).stats_compared.avgShares?.compared !== undefined && (
              <MetricRow
                icon={BarChart3}
                label="Shares vs Peers"
                value={`${((influencer as any).stats_compared.avgShares.compared * 100).toFixed(1)}%`}
                trend={(influencer as any).stats_compared.avgShares.compared > 0 ? 
                  (influencer as any).stats_compared.avgShares.compared * 100 : 
                  (influencer as any).stats_compared.avgShares.compared * 100}
              />
            )}
          </div>
        )}
        
        {/* 🆕 NEW: Advanced Distribution Data */}
        {(influencer as any).audienceExtra && (
          <div className="space-y-4">
            {/* Follower Range */}
            {(influencer as any).audienceExtra.followersRange && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Audience Size Bracket</h4>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-800 font-medium">
                    {formatNumber((influencer as any).audienceExtra.followersRange.leftNumber || 0)} - {formatNumber((influencer as any).audienceExtra.followersRange.rightNumber || 0)} followers
                  </span>
                </div>
              </div>
            )}
            
            {/* Engagement Rate Distribution */}
            {(influencer as any).audienceExtra.engagementRateDistribution && (influencer as any).audienceExtra.engagementRateDistribution.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Engagement Rate Distribution</h4>
                <div className="space-y-2">
                  {(influencer as any).audienceExtra.engagementRateDistribution.map((dist: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">
                        {(dist.min * 100).toFixed(1)}% - {(dist.max * 100).toFixed(1)}%
                        {dist.median && <span className="text-blue-600 ml-1">(median)</span>}
                      </span>
                      <span className="font-medium">{formatNumber(dist.total)} accounts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Credibility Distribution */}
            {(influencer as any).audienceExtra.credibilityDistribution && (influencer as any).audienceExtra.credibilityDistribution.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Credibility Distribution</h4>
                <div className="space-y-2">
                  {(influencer as any).audienceExtra.credibilityDistribution.map((dist: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">
                        {(dist.min * 100).toFixed(1)}% - {(dist.max * 100).toFixed(1)}%
                        {dist.median && <span className="text-green-600 ml-1">(median)</span>}
                      </span>
                      <span className="font-medium">{formatNumber(dist.total)} accounts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </CollapsibleSection>
  )
}

