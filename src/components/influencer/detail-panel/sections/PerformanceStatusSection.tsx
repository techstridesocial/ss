'use client'

import React from 'react'
import { Activity, Clock, AlertTriangle, CheckCircle, Database } from 'lucide-react'
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
  
  // Don't show section if no performance data is available
  if (!hasPerformanceData && !performanceStatus) {
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
    <CollapsibleSection title="Performance Data" defaultOpen={false}>
      <div className="space-y-3">
        
        {/* Performance Status */}
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
                icon={Activity}
                label="Avg Likes (30 posts)"
                value={formatNumber(Math.round(influencer.raw_performance_data.posts.likes.mean[2].value))}
              />
            )}
            
            {influencer.raw_performance_data.posts.comments?.mean?.[2]?.value && (
              <MetricRow
                icon={Activity}
                label="Avg Comments (30 posts)"
                value={formatNumber(Math.round(influencer.raw_performance_data.posts.comments.mean[2].value))}
              />
            )}
            
            {influencer.raw_performance_data.posts.engagement_rate?.[2]?.value && (
              <MetricRow
                icon={Activity}
                label="Real Engagement Rate"
                value={`${(influencer.raw_performance_data.posts.engagement_rate[2].value * 100).toFixed(3)}%`}
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
                icon={Activity}
                label="Avg Reel Views"
                value={formatNumber(Math.round(influencer.raw_performance_data.reels.views.mean[2].value))}
              />
            )}
            
            {influencer.raw_performance_data.reels.likes?.mean?.[2]?.value && (
              <MetricRow
                icon={Activity}
                label="Avg Reel Likes"
                value={formatNumber(Math.round(influencer.raw_performance_data.reels.likes.mean[2].value))}
              />
            )}
          </div>
        )}

      </div>
    </CollapsibleSection>
  )
}

