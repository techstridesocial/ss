'use client'

import React from 'react'
import { BarChart3, TrendingUp, Video, Image, ExternalLink } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { InfluencerData } from '../types'
import { formatNumber } from '../utils'

interface ContentAnalyticsSectionProps {
  influencer: InfluencerData
}

export const ContentAnalyticsSection = ({ influencer }: ContentAnalyticsSectionProps) => {
  const statsByContentType = influencer.statsByContentType || {}
  
  // Render this section only for aggregate analytics, avoid duplicating posts lists
  const hasAnyData = Object.keys(statsByContentType).length > 0
  
  if (!hasAnyData) {
    return null
  }
  
  return (
    <CollapsibleSection title="Content Analytics & Performance" defaultOpen={false}>
      <div className="space-y-5 md:space-y-4">
        
        {/* 🆕 NEW: CONTENT TYPE PERFORMANCE */}
        {Object.keys(statsByContentType).length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Performance by Content Type</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(statsByContentType).map(([type, stats]: [string, any]) => (
                <div key={type} className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-sm font-medium text-gray-900 capitalize mb-2">{type}</div>
                  {stats.avgLikes && (
                    <div className="text-xs text-gray-600">
                      Avg Likes: {formatNumber(stats.avgLikes)}
                    </div>
                  )}
                  {stats.avgViews && (
                    <div className="text-xs text-gray-600">
                      Avg Views: {formatNumber(stats.avgViews)}
                    </div>
                  )}
                  {stats.avgComments && (
                    <div className="text-xs text-gray-600">
                      Avg Comments: {formatNumber(stats.avgComments)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Note: Recent and Top posts are displayed in dedicated sections.
            To avoid duplication, we only keep aggregate analytics here. */}
        
      </div>
    </CollapsibleSection>
  )
}